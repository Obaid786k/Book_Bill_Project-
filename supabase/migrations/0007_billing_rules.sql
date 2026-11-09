-- 0007_billing_rules.sql
-- Applies AFTER 0001–0006. Forward-only: earlier migrations are never edited.
--
--   1. Stable error codes: every exception our functions raise starts with
--      'BB_<CODE>:' so the app can show a clear message (errorMessages.js).
--   2. Tax-inclusive pricing: settings.priceMode = 'inclusive' means the rate
--      already contains GST (taxable = net / (1 + gp/100)). Missing priceMode
--      (all older bills) = 'exclusive', the old maths. Same formula as gstCalc.js.
--   3. GST % limited to 0–100 on bill items.
--   4. Invoices are cancelled, never deleted: DELETE revoked, status limited
--      to Pending | Paid | Cancelled, and a cancelled bill can't be changed.
--      (Overdue is derived in the app: Pending + due date passed.)
--   5. Products: rate >= 0 and GST % 0–100.
--   NOT VALID = the rule applies to every new/changed row without failing
--   this migration on any old row.

-- ============================================================
-- 1. Invoice numbering (same logic as 0006, coded errors)
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
  select invoice_sequence into current_seq
  from public.businesses
  where id = p_business_id and owner_id = auth.uid()
  for update;

  if current_seq is null then
    raise exception 'BB_NOT_OWNER: business not found or not owned by caller';
  end if;

  prefix := regexp_replace(current_seq, '[0-9]+$', '');
  digits := substring(current_seq from '[0-9]+$');

  if digits is null or digits = '' then
    raise exception 'BB_INVOICE_SEQ_MALFORMED: invoice_sequence "%" has no number at the end', current_seq;
  end if;

  width := length(digits);
  num := digits::bigint;

  loop
    candidate := prefix || lpad(num::text, greatest(width, length(num::text)), '0');
    exit when not exists (
      select 1 from public.bills where business_id = p_business_id and invoice_no = candidate
    );
    num := num + 1;
  end loop;

  update public.businesses
  set invoice_sequence = prefix || lpad((num + 1)::text, greatest(width, length((num + 1)::text)), '0')
  where id = p_business_id;

  return candidate;
end;
$$;

revoke execute on function public.generate_next_invoice_no(uuid) from public, anon, authenticated;

-- ============================================================
-- 2. Shared validation + GST maths for finalize_bill / update_bill_details
--    (internal helper, not callable by clients)
-- ============================================================
create or replace function public.compute_bill_totals(
  p_bill jsonb,
  out subtotal numeric, out cgst numeric, out sgst numeric, out igst numeric
)
language plpgsql
immutable
set search_path = public
as $$
declare
  v_items jsonb := p_bill->'items';
  v_gst_on boolean := coalesce((p_bill->'settings'->>'gstOn')::boolean, false);
  v_tax_type text := p_bill->'settings'->>'tt';
  v_inclusive boolean := coalesce(p_bill->'settings'->>'priceMode', 'exclusive') = 'inclusive';
  v_item jsonb;
  v_qty numeric; v_rate numeric; v_disc numeric; v_gp numeric;
  v_net numeric; v_amt numeric;
begin
  subtotal := 0; cgst := 0; sgst := 0; igst := 0;

  if v_items is null or jsonb_typeof(v_items) != 'array' or jsonb_array_length(v_items) = 0 then
    raise exception 'BB_NO_ITEMS: a bill must have at least one line item';
  end if;

  for v_item in select * from jsonb_array_elements(v_items) loop
    if trim(coalesce(v_item->>'name', '')) = '' then
      raise exception 'BB_ITEM_INVALID: every line item needs a name';
    end if;
    v_qty := coalesce(nullif(v_item->>'qty', '')::numeric, -1);
    v_rate := coalesce(nullif(v_item->>'rate', '')::numeric, -1);
    v_disc := coalesce(nullif(v_item->>'disc', '')::numeric, -1);
    v_gp := coalesce(nullif(v_item->>'gp', '')::numeric, -1);
    if v_qty < 0 or v_rate < 0 or v_disc < 0 or v_disc > 100 or v_gp < 0 or v_gp > 100 then
      raise exception 'BB_ITEM_INVALID: qty/rate must be >= 0, discount and GST must be 0-100';
    end if;

    v_net := v_qty * v_rate - (v_qty * v_rate * v_disc / 100);
    v_amt := case when v_gst_on and v_inclusive then v_net / (1 + v_gp / 100) else v_net end;

    subtotal := subtotal + v_amt;
    if v_gst_on then
      if v_tax_type = 'intra' then
        cgst := cgst + v_amt * v_gp / 2 / 100;
        sgst := sgst + v_amt * v_gp / 2 / 100;
      else
        igst := igst + v_amt * v_gp / 100;
      end if;
    end if;
  end loop;
end;
$$;

revoke execute on function public.compute_bill_totals(jsonb) from public, anon, authenticated;

-- ============================================================
-- 3. finalize_bill / update_bill_details
-- ============================================================
create or replace function public.finalize_bill(p_business_id uuid, p_bill jsonb)
returns public.bills
language plpgsql
security definer set search_path = public
as $$
declare
  v_invoice_no text;
  v_result public.bills;
  t record;
  v_sum numeric;
begin
  if not exists (select 1 from public.businesses where id = p_business_id and owner_id = auth.uid()) then
    raise exception 'BB_NOT_OWNER: business not found or not owned by caller';
  end if;

  select * into t from public.compute_bill_totals(p_bill);
  v_sum := t.subtotal + t.cgst + t.sgst + t.igst;

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
    p_bill->'items',
    t.subtotal, t.cgst, t.sgst, t.igst,
    round(v_sum) - v_sum,
    round(v_sum),
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
  v_status text;
  v_result public.bills;
  t record;
  v_sum numeric;
begin
  select b.business_id, b.status into v_business_id, v_status
  from public.bills b
  join public.businesses biz on biz.id = b.business_id
  where b.id = p_bill_id and biz.owner_id = auth.uid();

  if v_business_id is null then
    raise exception 'BB_BILL_NOT_FOUND: bill not found or not owned by caller';
  end if;
  if v_status = 'Cancelled' then
    raise exception 'BB_BILL_CANCELLED: a cancelled invoice cannot be changed';
  end if;

  select * into t from public.compute_bill_totals(p_bill);
  v_sum := t.subtotal + t.cgst + t.sgst + t.igst;

  update public.bills set
    invoice_date = coalesce(nullif(p_bill->'meta'->>'invoiceDate', '')::date, invoice_date),
    due_date = nullif(p_bill->'meta'->>'dueDate', '')::date,
    shop = coalesce(p_bill->'shop', shop),
    customer = coalesce(p_bill->'customer', '{}'::jsonb),
    payment = coalesce(p_bill->'payment', '{}'::jsonb),
    settings = coalesce(p_bill->'settings', '{}'::jsonb),
    items = p_bill->'items',
    subtotal = t.subtotal,
    cgst_total = t.cgst,
    sgst_total = t.sgst,
    igst_total = t.igst,
    round_off = round(v_sum) - v_sum,
    grand_total = round(v_sum),
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
-- 4. Cancel instead of delete
-- ============================================================
revoke delete on public.bills from authenticated;

alter table public.bills
  add constraint bills_status_check
  check (status in ('Pending', 'Paid', 'Cancelled')) not valid;

create or replace function public.prevent_cancelled_bill_change()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'Cancelled' then
    raise exception 'BB_BILL_CANCELLED: a cancelled invoice cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists bills_prevent_cancelled_change on public.bills;
create trigger bills_prevent_cancelled_change
  before update on public.bills
  for each row execute procedure public.prevent_cancelled_bill_change();

-- ============================================================
-- 5. Product number rules
-- ============================================================
alter table public.products
  add constraint products_rate_check check (rate >= 0) not valid;
alter table public.products
  add constraint products_gst_rate_check check (gst_rate between 0 and 100) not valid;
