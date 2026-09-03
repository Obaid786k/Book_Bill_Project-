-- Bill Book — Backend hardening migration (fixes B01–B17 from technical review)
-- Applies AFTER 0001_init.sql. Never edit 0001 once applied — this is how
-- ordered, forward-only migrations stay safe (per B16).

-- ============================================================
-- B01 — Complete the RLS policy matrix: templates was missing UPDATE
-- ============================================================
create policy "templates_tenant_update" on public.templates
  for update using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- Full RLS matrix, confirmed complete after this migration:
--   businesses   : ALL (owner_id = auth.uid()), + admin read-only
--   profiles     : SELECT/UPDATE own row only (columns further restricted below)
--   categories   : ALL, tenant-scoped
--   products     : ALL, tenant-scoped
--   bills        : SELECT tenant-scoped; INSERT only via finalize_bill()
--                  RPC (direct insert revoked); UPDATE tenant-scoped —
--                  `status` directly, everything else only via
--                  update_bill_details() RPC; DELETE allowed. invoice_no/
--                  business_id/created_at frozen on every path via trigger.
--   drafts       : ALL, tenant-scoped
--   templates    : SELECT (own + system), INSERT/UPDATE/DELETE (own only)
--   notifications: ALL, tenant-scoped

-- ============================================================
-- B02 + B14 — Protect is_super_admin and other system-controlled columns
-- via column-level privileges, not just row-level RLS.
-- ============================================================

-- profiles: remove blanket UPDATE, re-grant only the columns a user may change
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;
-- is_super_admin and business_id can now ONLY change via service_role
-- (Supabase dashboard SQL editor) or a security-definer function — never
-- through a normal client update, regardless of RLS.

-- businesses: only these columns are client-editable. invoice_sequence stays
-- client-editable too (see note below) because it's a legitimate existing
-- Settings feature (user sets their own starting number) — the RACE
-- CONDITION this created is fixed separately by routing every actual
-- "consume the next number" operation through generate_next_invoice_no()
-- (B04/B05/B11 below), never through a raw increment.
revoke update on public.businesses from authenticated;
grant update (
  business_name, tagline, gstin, address, state,
  phone, email, default_tax_type, default_copy_type, default_hsn_behavior,
  default_terms, pay_mode, upi_id, bank_acc, ifsc,
  email_alerts, sms_alerts, daily_summary, stock_alerts,
  has_completed_setup, invoice_sequence
) on public.businesses to authenticated;
-- owner_id, id, created_at, updated_at are never directly client-writable.

-- bills: full CRUD is allowed after creation (per product decision — a
-- normal small business genuinely needs to fix a typo, correct a customer
-- detail, or delete a bad entry after the fact; a hard "no edits ever"
-- rule was more restrictive than the product actually needs).
--
-- The one non-negotiable: invoice_no (and business_id, id, created_at)
-- can NEVER change, no matter what operation runs. This is enforced TWICE
-- — column-level grants below, AND a trigger (see prevent_bill_identity_change
-- further down) that blocks it even for a future service-role script that
-- forgets this rule. Belt and suspenders, because this is the one thing
-- that must never be wrong in a billing product.
--
-- `status` can be updated directly (simple, no recomputation needed).
-- Everything else that touches money (items, totals, customer, etc.) must
-- go through the update_bill_details() RPC below, which re-validates and
-- re-computes GST/totals server-side on every edit — never trusts a
-- client-submitted total, even on an edit to an existing bill.
revoke insert on public.bills from authenticated;
revoke update on public.bills from authenticated;
grant update (status) on public.bills to authenticated;
grant delete on public.bills to authenticated;
-- Deleting is safe with respect to invoice numbering: generate_next_invoice_no()
-- reads businesses.invoice_sequence (an independent counter), never derived
-- from existing bills rows — so deleting a bill can never free up its
-- number for reuse or cause any collision with future invoices.

-- ============================================================
-- B03 — Harden privileged RPCs: explicit EXECUTE grants, not PUBLIC default
-- ============================================================
revoke execute on function public.admin_platform_stats() from public;
grant execute on function public.admin_platform_stats() to authenticated;
-- (the function's own internal is_super_admin check remains the real guard;
-- this just removes the unnecessary PUBLIC-executable default as well)

-- ============================================================
-- B04 — Hard uniqueness backstop on invoice numbers (defense-in-depth
-- alongside the atomic RPC in B05/B11 — this is what actually makes a
-- duplicate impossible even if some future code path bypasses the RPC)
-- ============================================================
alter table public.bills
  add constraint bills_business_invoice_no_unique unique (business_id, invoice_no);

-- ============================================================
-- B05 + B11 — One atomic RPC: generate the next invoice number AND insert
-- the bill in a single transaction. Replaces two separate client calls
-- (saveBill + incrementInvoiceSequence) with one.
--
-- Invoice-number contract (explicit, per B05):
--   - Format: {PREFIX}-{zero-padded number}, e.g. "INV-0001"
--   - Prefix and padding width are derived from businesses.invoice_sequence
--     at the moment of increment (whatever the business has currently set)
--   - If the stored value has no trailing digit run (malformed), the
--     function does NOT silently guess — it raises an exception and logs
--     an audit_log entry, forcing a visible failure instead of a wrong number
--   - No automatic yearly/period reset. If a business wants to restart
--     numbering, they edit businesses.invoice_sequence directly (still
--     client-editable per B02/B14 note above) before their next invoice.
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
  next_num bigint;
  padded text;
  result text;
begin
  -- Lock the business row for the duration of this transaction so two
  -- concurrent finalize_bill() calls for the same business serialize here
  -- instead of racing.
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
    insert into public.audit_log (business_id, actor_id, event_type, entity_type, metadata)
    values (p_business_id, auth.uid(), 'invoice_sequence_malformed', 'business',
            jsonb_build_object('value', current_seq));
    raise exception 'invoice_sequence "%" is malformed (no numeric suffix) — fix it in Settings before creating a new invoice', current_seq;
  end if;

  next_num := digits::bigint + 1;
  padded := lpad(next_num::text, length(digits), '0');
  result := prefix || padded;

  update public.businesses set invoice_sequence = result where id = p_business_id;

  return result;
end;
$$;

revoke execute on function public.generate_next_invoice_no(uuid) from public;
grant execute on function public.generate_next_invoice_no(uuid) to authenticated;

-- The actual "finalize a bill" entrypoint the frontend calls instead of a
-- plain insert. Combines B04/B05/B06/B07/B11 into one atomic operation.
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

  -- B07: validate each line item's shape and ranges before trusting anything
  for v_item in select * from jsonb_array_elements(v_items) loop
    if not (v_item ? 'name') or trim(v_item->>'name') = '' then
      raise exception 'every line item needs a non-empty name';
    end if;
    v_qty := coalesce((v_item->>'qty')::numeric, -1);
    v_rate := coalesce((v_item->>'rate')::numeric, -1);
    v_disc := coalesce((v_item->>'disc')::numeric, -1);
    v_gp := coalesce((v_item->>'gp')::numeric, -1);
    if v_qty < 0 or v_rate < 0 or v_disc < 0 or v_disc > 100 or v_gp < 0 then
      raise exception 'invalid item values: qty/rate/gp must be >= 0, disc must be 0-100';
    end if;
  end loop;

  -- B06: server-side recompute — mirrors src/utils/gstCalc.js exactly.
  -- Discount is applied to qty*rate BEFORE tax (frontend treats all rates
  -- as tax-exclusive regardless of the defaultTaxType setting — that
  -- setting has no effect in the current frontend calc, so the backend
  -- intentionally matches that behavior rather than inventing inclusive
  -- handling that doesn't exist yet).
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

  -- Invoice-level rounding only, matching the frontend exactly (line items
  -- keep full precision internally; only the grand total is rounded).
  v_invoice_no := public.generate_next_invoice_no(p_business_id);

  insert into public.bills (
    business_id, invoice_no, invoice_date, due_date, status,
    customer, payment, settings, items,
    subtotal, cgst_total, sgst_total, igst_total, round_off, grand_total,
    terms, notes
  ) values (
    p_business_id, v_invoice_no,
    coalesce((p_bill->'meta'->>'invoiceDate')::date, current_date),
    (p_bill->'meta'->>'dueDate')::date,
    'Pending',
    p_bill->'customer', p_bill->'payment', p_bill->'settings', v_items,
    v_sum_amt, v_sum_cgst, v_sum_sgst, v_sum_igst,
    round(v_sum_amt + v_sum_cgst + v_sum_sgst + v_sum_igst) - (v_sum_amt + v_sum_cgst + v_sum_sgst + v_sum_igst),
    round(v_sum_amt + v_sum_cgst + v_sum_sgst + v_sum_igst),
    p_bill->'meta'->>'terms', p_bill->'meta'->>'notes'
  ) returning * into v_result;

  insert into public.audit_log (business_id, actor_id, event_type, entity_type, entity_id, metadata)
  values (p_business_id, auth.uid(), 'bill_finalized', 'bill', v_result.id,
          jsonb_build_object('invoice_no', v_invoice_no, 'grand_total', v_result.grand_total));

  return v_result;
end;
$$;

revoke execute on function public.finalize_bill(uuid, jsonb) from public;
grant execute on function public.finalize_bill(uuid, jsonb) to authenticated;

-- ============================================================
-- update_bill_details() — the ONLY way to edit an existing bill's content
-- (items, customer, payment, settings, terms, notes, dates). Mirrors
-- finalize_bill()'s validation and GST/total recomputation exactly, so an
-- edit can never leave a bill with a client-supplied, unverified total.
-- invoice_no, business_id, id, and created_at are never touched here —
-- the trigger below (prevent_bill_identity_change) blocks it even if they
-- were accidentally included in a future version of this function.
-- ============================================================
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
  select business_id into v_business_id
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
    v_qty := coalesce((v_item->>'qty')::numeric, -1);
    v_rate := coalesce((v_item->>'rate')::numeric, -1);
    v_disc := coalesce((v_item->>'disc')::numeric, -1);
    v_gp := coalesce((v_item->>'gp')::numeric, -1);
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
    due_date = (p_bill->'meta'->>'dueDate')::date,
    customer = p_bill->'customer',
    payment = p_bill->'payment',
    settings = p_bill->'settings',
    items = v_items,
    subtotal = v_sum_amt,
    cgst_total = v_sum_cgst,
    sgst_total = v_sum_sgst,
    igst_total = v_sum_igst,
    round_off = round(v_sum_amt + v_sum_cgst + v_sum_sgst + v_sum_igst) - (v_sum_amt + v_sum_cgst + v_sum_sgst + v_sum_igst),
    grand_total = round(v_sum_amt + v_sum_cgst + v_sum_sgst + v_sum_igst),
    terms = p_bill->'meta'->>'terms',
    notes = p_bill->'meta'->>'notes'
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

-- Belt-and-suspenders: even if some future code path (a service-role
-- script, a new RPC someone adds later) tries to change these fields,
-- this trigger blocks it unconditionally. This is the actual guarantee
-- behind "invoice number never changes, no matter what operation runs."
create or replace function public.prevent_bill_identity_change()
returns trigger
language plpgsql
as $$
begin
  if new.invoice_no is distinct from old.invoice_no
     or new.business_id is distinct from old.business_id
     or new.created_at is distinct from old.created_at then
    raise exception 'invoice_no, business_id, and created_at can never be changed on an existing bill';
  end if;
  return new;
end;
$$;

create trigger bills_prevent_identity_change
  before update on public.bills
  for each row execute procedure public.prevent_bill_identity_change();

-- Log deletions before they're gone — the row itself disappears, but the
-- fact that it existed and its key details don't.
create or replace function public.audit_bill_deletion()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.audit_log (business_id, actor_id, event_type, entity_type, entity_id, metadata)
  values (old.business_id, auth.uid(), 'bill_deleted', 'bill', old.id,
          jsonb_build_object('invoice_no', old.invoice_no, 'grand_total', old.grand_total));
  return old;
end;
$$;

create trigger bills_audit_deletion
  before delete on public.bills
  for each row execute procedure public.audit_bill_deletion();

-- ============================================================
-- B08 — 8-draft cap, made concurrency-safe with an advisory lock so two
-- simultaneous draft-saves for the same business can't both slip past
-- a stale count.
-- ============================================================
create or replace function public.enforce_draft_cap()
returns trigger
language plpgsql
as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.business_id::text));

  delete from public.drafts
  where id in (
    select id from public.drafts
    where business_id = new.business_id
    order by saved_at desc
    offset 8
  );

  return new;
end;
$$;

create trigger drafts_enforce_cap
  after insert on public.drafts
  for each row execute procedure public.enforce_draft_cap();

-- ============================================================
-- B10 — REVISED per product decision: full CRUD is allowed on bills after
-- creation (not the immutable-forever design originally proposed here).
-- What actually protects correctness now: invoice_no/business_id/created_at
-- are permanently frozen (prevent_bill_identity_change trigger, further up),
-- and any edit touching money goes through update_bill_details(), which
-- recomputes GST/totals server-side exactly like creation does — so a
-- client can edit a bill's content, but can never hand-write an untrusted
-- total, and can never renumber it. See §4 of the plan document for the
-- full reasoning.
-- ============================================================

-- ============================================================
-- B12 — Explicit, documented FK/delete decisions (mostly already correct
-- by the original snapshot-based design — formalizing, not changing):
--   - businesses -> categories/products/bills/drafts/templates/notifications:
--     ON DELETE CASCADE (deleting a business is a full account deletion —
--     deliberate, not accidental)
--   - categories -> products: no FK relationship at all — `products.category`
--     is a plain text field (matches the category's name, not its id), so
--     deleting a category never touches existing products (same as the
--     original mock's behavior — a product can reference a category name
--     that no longer exists in the categories list, same as today)
--   - products have NO foreign key relationship to bills at all — bill
--     line items are JSON snapshots taken at finalize time, so deleting or
--     editing a product can NEVER retroactively change a historical
--     invoice. This was already true by design; stated explicitly here
--     per B12's request for documented decisions.
-- ============================================================

-- ============================================================
-- B13 — Indexes for the query patterns the frontend actually uses
-- ============================================================
create index if not exists bills_business_status_idx on public.bills (business_id, status);
create index if not exists bills_business_date_idx on public.bills (business_id, invoice_date desc);
create index if not exists products_business_id_idx on public.products (business_id);
create index if not exists categories_business_id_idx on public.categories (business_id);
create index if not exists drafts_business_id_idx on public.drafts (business_id, saved_at desc);
create index if not exists templates_business_id_idx on public.templates (business_id) where business_id is not null;
create index if not exists notifications_business_read_idx on public.notifications (business_id, read);
-- Note per B13: add further indexes only after checking real query plans
-- once there's real data — these cover the query patterns visible in the
-- current frontend today, not speculative ones.

-- ============================================================
-- B17 — Lightweight audit log. Scoped to the events actually worth
-- tracking for a small team, not a generic "log everything" system.
-- ============================================================
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade,
  actor_id uuid references auth.users(id),
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

-- Businesses can read their own audit history; nobody can write directly
-- (only triggers/RPCs using security definer write to this table).
create policy "audit_log_tenant_read" on public.audit_log
  for select using (business_id in (select id from public.businesses where owner_id = auth.uid()));

revoke insert, update, delete on public.audit_log from authenticated;

create index audit_log_business_idx on public.audit_log (business_id, created_at desc);

-- Track GST/settings changes and admin-role changes, per B17's scope.
create or replace function public.audit_business_sensitive_changes()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if (old.default_tax_type, old.gstin) is distinct from (new.default_tax_type, new.gstin) then
    insert into public.audit_log (business_id, actor_id, event_type, entity_type, entity_id, metadata)
    values (new.id, auth.uid(), 'gst_settings_changed', 'business', new.id,
            jsonb_build_object('old_tax_type', old.default_tax_type, 'new_tax_type', new.default_tax_type));
  end if;
  return new;
end;
$$;

create trigger businesses_audit_sensitive
  after update on public.businesses
  for each row execute procedure public.audit_business_sensitive_changes();

-- Admin-role changes can only happen via service_role (per B02), but we
-- still want a record of when/who — this fires regardless of who performs it.
create or replace function public.audit_admin_role_changes()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if old.is_super_admin is distinct from new.is_super_admin then
    insert into public.audit_log (business_id, actor_id, event_type, entity_type, entity_id, metadata)
    values (null, new.id, 'admin_role_changed', 'profile', new.id,
            jsonb_build_object('old_value', old.is_super_admin, 'new_value', new.is_super_admin));
  end if;
  return new;
end;
$$;

create trigger profiles_audit_admin_role
  after update on public.profiles
  for each row execute procedure public.audit_admin_role_changes();

-- bill_status_changed and bill_finalized events are already inserted
-- directly inside finalize_bill() above and the status-update path below.
create or replace function public.audit_bill_status_change()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.audit_log (business_id, actor_id, event_type, entity_type, entity_id, metadata)
    values (new.business_id, auth.uid(), 'bill_status_changed', 'bill', new.id,
            jsonb_build_object('old_status', old.status, 'new_status', new.status));
  end if;
  return new;
end;
$$;

create trigger bills_audit_status_change
  after update on public.bills
  for each row execute procedure public.audit_bill_status_change();
