-- 0003_permissions_fix.sql
-- Grants SELECT and essential privileges to the 'authenticated' role.
-- Recent Supabase projects (Secure by Default) don't grant this automatically.
-- We are granting SELECT on all tables, and specific privileges without overriding
-- the strict column-level restrictions applied in 0002_backend_hardening.sql.

-- 1. Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Grant SELECT on all current tables so the frontend can read data (filtered by RLS)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- 3. Grant basic write operations where RLS and triggers expect direct client access
-- (0002_backend_hardening.sql handles the specific column-level UPDATE restrictions for profiles, businesses, bills)

-- Full read/write for basic entities
GRANT INSERT, UPDATE, DELETE ON public.drafts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.templates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- Notifications: client only needs to update (mark read) or delete (dismiss)
GRANT UPDATE, DELETE ON public.notifications TO authenticated;

-- Bills: handled by RPCs for insert/update, but delete is direct table access
GRANT DELETE ON public.bills TO authenticated;

-- Ensure auth role can execute the sequence generation and RPCs
GRANT EXECUTE ON FUNCTION public.generate_next_invoice_no(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_bill(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_bill_details(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_platform_stats() TO authenticated;
