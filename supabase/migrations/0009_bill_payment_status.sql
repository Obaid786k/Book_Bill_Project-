-- 0009_bill_payment_status.sql
-- New Bill page now asks "Status: Paid / Pending" (src/modules/billing/components/InfoGrid.jsx).
-- finalize_bill used to always save 'Pending', so counter sales paid in cash/UPI showed as
-- outstanding and later as overdue. It now takes the status from p_bill.settings.paymentStatus.
-- Only 'Paid' or 'Pending' are accepted from the client (never 'Cancelled'); anything else -> 'Pending'.
-- Paid bills carry no due date. Same body as 0007 otherwise.

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
  v_status text;
begin
  if not exists (select 1 from public.businesses where id = p_business_id and owner_id = auth.uid()) then
    raise exception 'BB_NOT_OWNER: business not found or not owned by caller';
  end if;

  select * into t from public.compute_bill_totals(p_bill);
  v_sum := t.subtotal + t.cgst + t.sgst + t.igst;

  v_status := case when p_bill->'settings'->>'paymentStatus' = 'Paid' then 'Paid' else 'Pending' end;

  v_invoice_no := public.generate_next_invoice_no(p_business_id);

  insert into public.bills (
    business_id, invoice_no, invoice_date, due_date, status,
    shop, customer, payment, settings, items,
    subtotal, cgst_total, sgst_total, igst_total, round_off, grand_total,
    terms, notes
  ) values (
    p_business_id, v_invoice_no,
    coalesce(nullif(p_bill->'meta'->>'invoiceDate', '')::date, current_date),
    case when v_status = 'Paid' then null else nullif(p_bill->'meta'->>'dueDate', '')::date end,
    v_status,
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
          jsonb_build_object('invoice_no', v_invoice_no, 'grand_total', v_result.grand_total, 'status', v_status));

  return v_result;
end;
$$;

revoke execute on function public.finalize_bill(uuid, jsonb) from public;
grant execute on function public.finalize_bill(uuid, jsonb) to authenticated;
