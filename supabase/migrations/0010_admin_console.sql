-- ============================================================
-- 0010 — Super admin console: real numbers for the /admin pages.
--
-- Every function below:
--   * checks profiles.is_super_admin itself (raises 'not authorized' otherwise)
--   * returns counts, sizes and technical stats only — no customer details,
--     no emails, no bill amounts of other businesses.
-- Days are counted in India time (Asia/Kolkata), like the rest of the app.
-- ============================================================

create or replace function public.is_platform_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_super_admin);
$$;

-- Level of an activity-log event, used by System Logs and the error count.
create or replace function public.audit_level(p_event text, p_meta jsonb)
returns text
language sql immutable
set search_path = public
as $$
  select case
    when p_event = 'invoice_sequence_malformed' or p_event ~ '^client_.*(error|fail)' then 'ERROR'
    when p_event in ('admin_role_changed', 'gst_settings_changed')
      or p_event ~ '^client_.*warn'
      or (p_event = 'bill_status_changed' and p_meta->>'new_status' = 'Cancelled') then 'WARN'
    else 'INFO'
  end;
$$;

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

-- ------------------------------------------------------------
-- Platform + users overview
-- ------------------------------------------------------------
create or replace function public.admin_console_overview()
returns jsonb
language plpgsql
security definer set search_path = public, auth
as $$
declare
  v_today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  if not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  return jsonb_build_object(
    'totalUsers',      (select count(*) from auth.users),
    'verifiedUsers',   (select count(*) from auth.users where email_confirmed_at is not null),
    'activeUsers24h',  (select count(*) from auth.users where last_sign_in_at > now() - interval '24 hours'),
    'activeUsers7d',   (select count(*) from auth.users where last_sign_in_at > now() - interval '7 days'),
    'totalTenants',    (select count(*) from public.businesses),
    'setupDone',       (select count(*) from public.businesses where has_completed_setup),
    'totalBills',      (select count(*) from public.bills),
    'billsToday',      (select count(*) from public.bills where (created_at at time zone 'Asia/Kolkata')::date = v_today),
    'cancelledBills',  (select count(*) from public.bills where status = 'Cancelled'),
    'totalProducts',   (select count(*) from public.products),
    'totalDrafts',     (select count(*) from public.drafts),
    'customTemplates', (select count(*) from public.templates where not seeded),
    'errors24h',       (select count(*) from public.audit_log
                         where created_at > now() - interval '24 hours'
                           and public.audit_level(event_type, metadata) = 'ERROR'),
    'dbStartedAt',     pg_postmaster_start_time(),
    'last7Days', (
      select coalesce(jsonb_agg(t order by t.day), '[]'::jsonb) from (
        select d.day::date as day,
               to_char(d.day, 'Dy') as name,
               (select count(*) from auth.users u
                 where (u.created_at at time zone 'Asia/Kolkata')::date = d.day::date) as users,
               (select count(*) from public.businesses b
                 where (b.created_at at time zone 'Asia/Kolkata')::date = d.day::date) as businesses,
               (select count(*) from public.bills x
                 where (x.created_at at time zone 'Asia/Kolkata')::date = d.day::date) as bills
        from generate_series(v_today - 6, v_today, interval '1 day') d(day)
      ) t
    )
  );
end;
$$;

-- ------------------------------------------------------------
-- Database health (Postgres' own statistics views)
-- ------------------------------------------------------------
create or replace function public.admin_database_health()
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  s record;
begin
  if not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  select * into s from pg_stat_database where datname = current_database();

  return jsonb_build_object(
    'version',           current_setting('server_version'),
    'startedAt',         pg_postmaster_start_time(),
    'sizeBytes',         pg_database_size(current_database()),
    'connections',       (select count(*) from pg_stat_activity where datname = current_database()),
    'activeConnections', (select count(*) from pg_stat_activity where datname = current_database() and state = 'active'),
    'maxConnections',    current_setting('max_connections')::int,
    'cacheHitPct',       case when s.blks_hit + s.blks_read > 0
                           then round(100.0 * s.blks_hit / (s.blks_hit + s.blks_read), 2) end,
    'commits',           s.xact_commit,
    'rollbacks',         s.xact_rollback,
    'deadlocks',         s.deadlocks,
    'rowsRead',          s.tup_returned,
    'rowsWritten',       s.tup_inserted + s.tup_updated + s.tup_deleted,
    'statsSince',        s.stats_reset,
    'tables', (
      select coalesce(jsonb_agg(t order by t."sizeBytes" desc), '[]'::jsonb) from (
        select relname as name,
               n_live_tup as rows,
               pg_total_relation_size(relid) as "sizeBytes",
               seq_scan as "seqScans",
               coalesce(idx_scan, 0) as "indexScans"
        from pg_stat_user_tables
        where schemaname = 'public'
      ) t
    )
  );
end;
$$;

-- ------------------------------------------------------------
-- Storage: database size + file buckets (Supabase Storage)
-- ------------------------------------------------------------
create or replace function public.admin_storage_usage()
returns jsonb
language plpgsql
security definer set search_path = public, storage
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  return jsonb_build_object(
    'databaseBytes', pg_database_size(current_database()),
    'buckets', (
      select coalesce(jsonb_agg(x order by x.bytes desc), '[]'::jsonb) from (
        select b.id as name,
               b.public,
               b.file_size_limit as "fileSizeLimit",
               count(o.id) as files,
               coalesce(sum((o.metadata->>'size')::bigint), 0) as bytes
        from storage.buckets b
        left join storage.objects o on o.bucket_id = b.id
        group by b.id, b.public, b.file_size_limit
      ) x
    )
  );
end;
$$;

-- ------------------------------------------------------------
-- Performance: app queries from pg_stat_statements (if enabled)
-- + transaction success rate from pg_stat_database.
-- ------------------------------------------------------------
create or replace function public.admin_performance()
returns jsonb
language plpgsql
security definer set search_path = public, extensions
as $$
declare
  s record;
  v_sum jsonb := null;
  v_top jsonb := '[]'::jsonb;
  v_since timestamptz := null;
begin
  if not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  select * into s from pg_stat_database where datname = current_database();

  if to_regclass('extensions.pg_stat_statements') is not null then
    begin
      -- Only queries the app runs (PostgREST roles), not Supabase's own housekeeping.
      execute $q$
        select jsonb_build_object(
          'calls', coalesce(sum(p.calls), 0),
          'avgMs', round((sum(p.total_exec_time) / nullif(sum(p.calls), 0))::numeric, 2),
          'maxMs', round(coalesce(max(p.max_exec_time), 0)::numeric, 1))
        from extensions.pg_stat_statements p
        join pg_roles r on r.oid = p.userid
        where r.rolname in ('authenticated', 'anon')
      $q$ into v_sum;

      execute $q$
        select coalesce(jsonb_agg(t), '[]'::jsonb) from (
          select left(regexp_replace(p.query, '\s+', ' ', 'g'), 160) as query,
                 p.calls,
                 round(p.mean_exec_time::numeric, 2) as "avgMs",
                 round(p.max_exec_time::numeric, 1) as "maxMs"
          from extensions.pg_stat_statements p
          join pg_roles r on r.oid = p.userid
          where r.rolname in ('authenticated', 'anon')
          order by p.total_exec_time desc
          limit 8
        ) t
      $q$ into v_top;

      begin
        execute 'select stats_reset from extensions.pg_stat_statements_info' into v_since;
      exception when others then
        v_since := null;
      end;
    exception when others then
      v_sum := null;
      v_top := '[]'::jsonb;
    end;
  end if;

  return jsonb_build_object(
    'available',     v_sum is not null,
    'queries',       v_sum,
    'slowest',       v_top,
    'statsSince',    coalesce(v_since, s.stats_reset),
    'commits',       s.xact_commit,
    'rollbacks',     s.xact_rollback,
    'failedPct',     case when s.xact_commit + s.xact_rollback > 0
                       then round(100.0 * s.xact_rollback / (s.xact_commit + s.xact_rollback), 3) else 0 end
  );
end;
$$;

-- ------------------------------------------------------------
-- System logs: latest activity-log events across all businesses.
-- Bill amounts are removed from the details.
-- ------------------------------------------------------------
create or replace function public.admin_system_logs(p_limit int default 200)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
begin
  if not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  return (
    select coalesce(jsonb_agg(t order by t.created_at desc), '[]'::jsonb) from (
      select a.id,
             a.created_at,
             public.audit_level(a.event_type, a.metadata) as level,
             coalesce(a.entity_type, 'system') as service,
             a.event_type as event,
             a.metadata - 'grand_total' - 'new_grand_total' as details,
             nullif(b.business_name, '') as business
      from public.audit_log a
      left join public.businesses b on b.id = a.business_id
      order by a.created_at desc
      limit greatest(1, least(coalesce(p_limit, 200), 500))
    ) t
  );
end;
$$;

-- Logged-in users may call these; the is_super_admin check inside is the real guard.
revoke execute on function public.is_platform_admin() from public, anon;
revoke execute on function public.admin_console_overview() from public, anon;
revoke execute on function public.admin_database_health() from public, anon;
revoke execute on function public.admin_storage_usage() from public, anon;
revoke execute on function public.admin_performance() from public, anon;
revoke execute on function public.admin_system_logs(int) from public, anon;

grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.admin_console_overview() to authenticated;
grant execute on function public.admin_database_health() to authenticated;
grant execute on function public.admin_storage_usage() to authenticated;
grant execute on function public.admin_performance() to authenticated;
grant execute on function public.admin_system_logs(int) to authenticated;
