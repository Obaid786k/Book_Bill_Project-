-- 0004_check_user_verification.sql
-- Check user verification status RPC
-- Allows unauthenticated client to check if an email exists and is confirmed
-- to gate password resets and auto-detect verification.

create or replace function public.check_user_verification_status(p_email text)
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_confirmed_at timestamptz;
begin
  select email_confirmed_at into v_confirmed_at
  from auth.users
  where lower(email) = lower(trim(p_email))
  limit 1;

  if not found then
    return json_build_object('exists', false, 'is_confirmed', false);
  end if;

  return json_build_object(
    'exists', true, 
    'is_confirmed', (v_confirmed_at is not null)
  );
end;
$$;

revoke execute on function public.check_user_verification_status(text) from public;
grant execute on function public.check_user_verification_status(text) to anon, authenticated;
