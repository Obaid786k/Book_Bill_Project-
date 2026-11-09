-- 0005_fix_invoice_sequence.sql
-- Fix invoice sequence counter: return current sequence for the active bill,
-- increment businesses.invoice_sequence for the next bill, and auto-skip any
-- colliding numbers that are already used in public.bills.

create or replace function public.generate_next_invoice_no(p_business_id uuid)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  current_seq text;
  prefix text;
  digits text;
  digit_len integer;
  candidate_num bigint;
  candidate text;
  next_num bigint;
  next_seq text;
begin
  -- Lock the business row for the duration of this transaction so concurrent
  -- finalize_bill() calls serialize here without race conditions.
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

  digit_len := length(digits);
  candidate_num := digits::bigint;
  candidate := prefix || lpad(candidate_num::text, digit_len, '0');

  -- Ensure candidate invoice number is not already used in finalized bills.
  -- If it was used in past bills, advance until the first unused number is found.
  while exists (
    select 1 from public.bills
    where business_id = p_business_id and invoice_no = candidate
  ) loop
    candidate_num := candidate_num + 1;
    candidate := prefix || lpad(candidate_num::text, digit_len, '0');
  end loop;

  -- Prepare next invoice sequence for future bills
  next_num := candidate_num + 1;
  next_seq := prefix || lpad(next_num::text, digit_len, '0');

  -- Atomically advance the counter in businesses table
  update public.businesses
  set invoice_sequence = next_seq
  where id = p_business_id;

  -- Return the validated, unused candidate invoice number for this current bill
  return candidate;
end;
$$;
revoke execute on function public.generate_next_invoice_no(uuid) from public;
grant execute on function public.generate_next_invoice_no(uuid) to authenticated;
-- Optional helper to check if an invoice number is already used by a business
create or replace function public.is_invoice_no_used(p_business_id uuid, p_invoice_no text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.bills
    where business_id = p_business_id and invoice_no = trim(p_invoice_no)
  );
$$;
revoke execute on function public.is_invoice_no_used(uuid, text) from public;
grant execute on function public.is_invoice_no_used(uuid, text) to authenticated;


