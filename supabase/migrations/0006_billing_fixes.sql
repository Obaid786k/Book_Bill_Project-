-- 0006_billing_fixes.sql
-- Applies AFTER 0001–0005. Forward-only: earlier migrations are never edited.
--
-- Fixes:
--   1. Invoice numbering. Keeps 0005's semantics (invoice_sequence = the NEXT
--      invoice number; numbers already used by a bill are skipped) and fixes
--      lpad() truncating numbers that outgrow the padding width
--      (INV-9999 -> INV-10000, not INV-1000). The function is now internal to
--      finalize_bill(): clients can no longer call it directly and burn numbers.
--   2. Bills now snapshot the shop/business details they were issued with
--      (new `shop` jsonb column), so old invoices keep their original header.
--   3. finalize_bill / update_bill_details tolerate blank optional fields
--      (empty due date, missing terms/notes/customer) instead of failing on
--      NOT NULL / date-cast errors. update_bill_details also updates invoice_date.
--   4. Normalises payment-mode values saved by the old onboarding wizard
--      ('cash' / 'upi' / 'bank') to the values the rest of the app uses.
--   5. Removes backend objects the frontend never uses (and which were unsafe):
--      check_user_verification_status() — let anonymous callers learn whether
--      an email is registered; is_invoice_no_used() (from 0005) — no owner
--      check, so it could probe another business's invoice numbers.
--   6. ensure_user_profile(): lets the app repair a missing profile/business
--      row on login (previous client-side inserts were always denied).
--   7. log_client_event(): the app's error logger now has a permitted path
--      into audit_log (direct client inserts are revoked since 0002).

-- ============================================================
-- 1. Invoice numbering
-- ============================================================
create or replace function public.generate_next_invoice_no(p_business_id uuid)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  current_seq text;
  prefix text;
  digits text;
  width int;
  num bigint;
  candidate text;
begin
  -- Row lock serialises concurrent finalize_bill() calls for one business.
  select invoice_sequence into current_seq
  from public.businesses
  where id = p_business_id and owner_id = auth.uid()
  for update;

  if current_seq is null then
    raise exception 'business not found or not owned by caller';
  end if;

  prefix := regexp_replace(current_seq, '[0-9]+$', '');
  digits := substring(current_seq from '[0-9]+$');

  if digits is null or digits = '' then
    raise exception 'invoice_sequence "%" is malformed (no numeric suffix) — fix it in Settings before creating a new invoice', current_seq;
  end if;

  width := length(digits);
  num := digits::bigint;

  -- Issue the stored number itself, skipping any already used by a bill.
  loop
    candidate := prefix || lpad(num::text, greatest(width, length(num::text)), '0');
    exit when not exists (
      select 1 from public.bills where business_id = p_business_id and invoice_no = candidate
    );
    num := num + 1;
  end loop;

  -- Store the following number as the new "next invoice number".
  update public.businesses
  set invoice_sequence = prefix || lpad((num + 1)::text, greatest(width, length((num + 1)::text)), '0')
  where id = p_business_id;

  return candidate;
end;
$$;

-- Internal only: finalize_bill() (security definer) calls it as owner.
revoke execute on function public.generate_next_invoice_no(uuid) from public, anon, authenticated;

-- ============================================================
-- 2. Shop snapshot on every bill
-- ============================================================
alter table public.bills
  add column if not exists shop jsonb not null default '{}';

-- ============================================================
-- 3. finalize_bill / update_bill_details — same validation and GST maths
--    as 0002, plus shop snapshot and blank-field tolerance.
-- ============================================================
create or replace function public.finalize_bill(p_business_id uuid, p_bill jsonb)
returns public.bills
language plpgsql
security definer set search_path = public
as $$
declare
  v_invoice_no text;
  v_items jsonb;
  v_result public.bills;
  v_gst_on boolean;
  v_tax_type text;
  v_sum_amt numeric := 0;
  v_sum_cgst numeric := 0;
  v_sum_sgst numeric := 0;
  v_sum_igst numeric := 0;
  v_item jsonb;
  v_qty numeric; v_rate numeric; v_disc numeric; v_gp numeric;
  v_gross numeric; v_amt numeric; v_c numeric; v_s numeric; v_ig numeric;
begin
  if not exists (select 1 from public.businesses where id = p_business_id and owner_id = auth.uid()) then
    raise exception 'business not found or not owned by caller';
  end if;

  v_items := p_bill->'items';
  if v_items is null or jsonb_typeof(v_items) != 'array' or jsonb_array_length(v_items) = 0 then
    raise exception 'a bill must have at least one line item';
  end if;

  for v_item in select * from jsonb_array_elements(v_items) loop
    if not (v_item ? 'name') or trim(v_item->>'name') = '' then
      raise exception 'every line item needs a non-empty name';
    end if;
    v_qty := coalesce(nullif(v_item->>'qty', '')::numeric, -1);
    v_rate := coalesce(nullif(v_item->>'rate', '')::numeric, -1);
    v_disc := coalesce(nullif(v_item->>'disc', '')::numeric, -1);
    v_gp := coalesce(nullif(v_item->>'gp', '')::numeric, -1);
    if v_qty < 0 or v_rate < 0 or v_disc < 0 or v_disc > 100 or v_gp < 0 then
      raise exception 'invalid item values: qty/rate/gp must be >= 0, disc must be 0-100';
    end if;
  end loop;

  v_gst_on := coalesce((p_bill->'settings'->>'gstOn')::boolean, false);
  v_tax_type := p_bill->'settings'->>'tt';

  for v_item in select * from jsonb_array_elements(v_items) loop
    v_qty := (v_item->>'qty')::numeric;
    v_rate := (v_item->>'rate')::numeric;
    v_disc := (v_item->>'disc')::numeric;
    v_gp := (v_item->>'gp')::numeric;
    v_gross := v_qty * v_rate;
    v_amt := v_gross - (v_gross * v_disc / 100);
    v_c := 0; v_s := 0; v_ig := 0;
    if v_gst_on then
      if v_tax_type = 'intra' then
        v_c := v_amt * v_gp / 2 / 100;
        v_s := v_c;
      else
        v_ig := v_amt * v_gp / 100;
      end if;
    end if;
    v_sum_amt := v_sum_amt + v_amt;
    v_sum_cgst := v_sum_cgst + v_c;
    v_sum_sgst := v_sum_sgst + v_s;
    v_sum_igst := v_sum_igst + v_ig;
  end loop;

  v_invoice_no := public.generate_next_invoice_no(p_business_id);

  insert into public.bills (
    business_id, invoice_no, invoice_date, due_date, status,
    shop, customer, payment, settings, items,
    subtotal, cgst_total, sgst_total, igst_total, round_off, grand_total,
    terms, notes
  ) values (
    p_business_id, v_invoice_no,
    coalesce(nullif(p_bill->'meta'->>'invoiceDate', '')::date, current_date),
    nullif(p_bill->'meta'->>'dueDate', '')::date,
    'Pending',
    coalesce(p_bill->'shop', '{}'::jsonb),
    coalesce(p_bill->'customer', '{}'::jsonb),
    coalesce(p_bill->'payment', '{}'::jsonb),
    coalesce(p_bill->'settings', '{}'::jsonb),
    v_items,
    v_sum_amt, v_sum_cgst, v_sum_sgst, v_sum_igst,
    round(v_sum_amt + v_sum_cgst + v_sum_sgst + v_sum_igst) - (v_sum_amt + v_sum_cgst + v_sum_sgst + v_sum_igst),
    round(v_sum_amt + v_sum_cgst + v_sum_sgst + v_sum_igst),
    coalesce(p_bill->'meta'->>'terms', ''),
    coalesce(p_bill->'meta'->>'notes', '')
  ) returning * into v_result;

  insert into public.audit_log (business_id, actor_id, event_type, entity_type, entity_id, metadata)
  values (p_business_id, auth.uid(), 'bill_finalized', 'bill', v_result.id,
          jsonb_build_object('invoice_no', v_invoice_no, 'grand_total', v_result.grand_total));

  return v_result;
end;
$$;

revoke execute on function public.finalize_bill(uuid, jsonb) from public;
grant execute on function public.finalize_bill(uuid, jsonb) to authenticated;

create or replace function public.update_bill_details(p_bill_id uuid, p_bill jsonb)
returns public.bills
language plpgsql
security definer set search_path = public
as $$
declare
  v_business_id uuid;
  v_items jsonb;
  v_result public.bills;
  v_gst_on boolean;
  v_tax_type text;
  v_sum_amt numeric := 0;
  v_sum_cgst numeric := 0;
  v_sum_sgst numeric := 0;
  v_sum_igst numeric := 0;
  v_item jsonb;
  v_qty numeric; v_rate numeric; v_disc numeric; v_gp numeric;
  v_gross numeric; v_amt numeric; v_c numeric; v_s numeric; v_ig numeric;
begin
  select b.business_id into v_business_id
  from public.bills b
  join public.businesses biz on biz.id = b.business_id
  where b.id = p_bill_id and biz.owner_id = auth.uid();

  if v_business_id is null then
    raise exception 'bill not found or not owned by caller';
  end if;

  v_items := p_bill->'items';
  if v_items is null or jsonb_typeof(v_items) != 'array' or jsonb_array_length(v_items) = 0 then
    raise exception 'a bill must have at least one line item';
  end if;

  for v_item in select * from jsonb_array_elements(v_items) loop
    if not (v_item ? 'name') or trim(v_item->>'name') = '' then
      raise exception 'every line item needs a non-empty name';
    end if;
    v_qty := coalesce(nullif(v_item->>'qty', '')::numeric, -1);
    v_rate := coalesce(nullif(v_item->>'rate', '')::numeric, -1);
    v_disc := coalesce(nullif(v_item->>'disc', '')::numeric, -1);
    v_gp := coalesce(nullif(v_item->>'gp', '')::numeric, -1);
    if v_qty < 0 or v_rate < 0 or v_disc < 0 or v_disc > 100 or v_gp < 0 then
      raise exception 'invalid item values: qty/rate/gp must be >= 0, disc must be 0-100';
    end if;
  end loop;

  v_gst_on := coalesce((p_bill->'settings'->>'gstOn')::boolean, false);
  v_tax_type := p_bill->'settings'->>'tt';

  for v_item in select * from jsonb_array_elements(v_items) loop
    v_qty := (v_item->>'qty')::numeric;
    v_rate := (v_item->>'rate')::numeric;
    v_disc := (v_item->>'disc')::numeric;
    v_gp := (v_item->>'gp')::numeric;
    v_gross := v_qty * v_rate;
    v_amt := v_gross - (v_gross * v_disc / 100);
    v_c := 0; v_s := 0; v_ig := 0;
    if v_gst_on then
      if v_tax_type = 'intra' then
        v_c := v_amt * v_gp / 2 / 100;
        v_s := v_c;
      else
        v_ig := v_amt * v_gp / 100;
      end if;
    end if;
    v_sum_amt := v_sum_amt + v_amt;
    v_sum_cgst := v_sum_cgst + v_c;
    v_sum_sgst := v_sum_sgst + v_s;
    v_sum_igst := v_sum_igst + v_ig;
  end loop;

  update public.bills set
    invoice_date = coalesce(nullif(p_bill->'meta'->>'invoiceDate', '')::date, invoice_date),
    due_date = nullif(p_bill->'meta'->>'dueDate', '')::date,
    shop = coalesce(p_bill->'shop', shop),
    customer = coalesce(p_bill->'customer', '{}'::jsonb),
    payment = coalesce(p_bill->'payment', '{}'::jsonb),
    settings = coalesce(p_bill->'settings', '{}'::jsonb),
    items = v_items,
    subtotal = v_sum_amt,
    cgst_total = v_sum_cgst,
    sgst_total = v_sum_sgst,
    igst_total = v_sum_igst,
    round_off = round(v_sum_amt + v_sum_cgst + v_sum_sgst + v_sum_igst) - (v_sum_amt + v_sum_cgst + v_sum_sgst + v_sum_igst),
    grand_total = round(v_sum_amt + v_sum_cgst + v_sum_sgst + v_sum_igst),
    terms = coalesce(p_bill->'meta'->>'terms', ''),
    notes = coalesce(p_bill->'meta'->>'notes', '')
  where id = p_bill_id
  returning * into v_result;

  insert into public.audit_log (business_id, actor_id, event_type, entity_type, entity_id, metadata)
  values (v_business_id, auth.uid(), 'bill_updated', 'bill', p_bill_id,
          jsonb_build_object('invoice_no', v_result.invoice_no, 'new_grand_total', v_result.grand_total));

  return v_result;
end;
$$;

revoke execute on function public.update_bill_details(uuid, jsonb) from public;
grant execute on function public.update_bill_details(uuid, jsonb) to authenticated;

-- ============================================================
-- 4. Normalise legacy onboarding payment-mode values
-- ============================================================
update public.businesses set pay_mode = 'Cash'          where pay_mode = 'cash';
update public.businesses set pay_mode = 'UPI'           where pay_mode = 'upi';
update public.businesses set pay_mode = 'Bank Transfer' where pay_mode = 'bank';

-- ============================================================
-- 5. Remove unused, unsafe helpers
-- ============================================================
drop function if exists public.check_user_verification_status(text);
drop function if exists public.is_invoice_no_used(uuid, text);

-- ============================================================
-- 6. ensure_user_profile() — called by authService on login when the
--    caller's profile row is missing (user created before the signup
--    trigger existed). Creates only the caller's own rows.
-- ============================================================
create or replace function public.ensure_user_profile()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.profiles (id, full_name)
  select u.id, u.raw_user_meta_data ->> 'full_name'
  from auth.users u
  where u.id = v_uid
  on conflict (id) do nothing;

  if not exists (select 1 from public.businesses where owner_id = v_uid) then
    -- on_business_insert trigger links profiles.business_id automatically
    insert into public.businesses (owner_id) values (v_uid);
  else
    update public.profiles p
    set business_id = b.id
    from public.businesses b
    where b.owner_id = v_uid and p.id = v_uid and p.business_id is null;
  end if;
end;
$$;

revoke execute on function public.ensure_user_profile() from public, anon;
grant execute on function public.ensure_user_profile() to authenticated;

-- ============================================================
-- 7. log_client_event() — logService's only write path into audit_log.
--    Technical details only (table:action:code); lengths are capped and the
--    event type is sanitised so it can't impersonate server events.
-- ============================================================
create or replace function public.log_client_event(
  p_event_type text,
  p_detail text default '',
  p_code text default null
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  insert into public.audit_log (business_id, actor_id, event_type, entity_type, metadata)
  values (
    (select business_id from public.profiles where id = auth.uid()),
    auth.uid(),
    'client_' || left(regexp_replace(lower(coalesce(p_event_type, 'error')), '[^a-z0-9_]', '', 'g'), 40),
    'client',
    jsonb_build_object('detail', left(coalesce(p_detail, ''), 200), 'code', left(p_code, 60))
  );
end;
$$;

revoke execute on function public.log_client_event(text, text, text) from public, anon;
grant execute on function public.log_client_event(text, text, text) to authenticated;
