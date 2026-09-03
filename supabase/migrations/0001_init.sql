-- Bill Book — initial schema
-- Run this in the Supabase SQL Editor (or via `supabase db push`) on a fresh project.

-- ============================================================
-- 1. PROFILES  (1:1 with auth.users, created automatically on signup)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  is_super_admin boolean not null default false,
  business_id uuid, -- fk added after businesses table exists
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- Auto-create a profile row AND a blank business row whenever a new auth
-- user is created. Onboarding's BusinessSetup wizard then always performs
-- an UPDATE on this pre-existing row — never an insert. This is a
-- deliberate product decision: the user will fill in real business
-- details either during onboarding or later from Settings, so there's no
-- benefit to delaying row creation until onboarding is submitted.
--
-- Note: this function references public.businesses, which is defined
-- further down in this file (section 2). That's safe — Postgres only
-- validates plpgsql function bodies at execution time, not at CREATE
-- FUNCTION time, and this function is never actually invoked until a real
-- signup happens (by which point every table in this file already exists).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  -- Every column besides owner_id has a safe default (see the businesses
  -- table below), so a bare owner_id insert is enough. The on_business_insert
  -- trigger (defined later, fires on this insert) syncs profiles.business_id
  -- immediately after — since the profile row above was just inserted in
  -- this same transaction, that sync is guaranteed to find it.
  insert into public.businesses (owner_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. BUSINESSES  (one per owner — auto-created blank by handle_new_user()
--    above at signup time; populated during onboarding, editable anytime
--    after from Settings)
-- ============================================================
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,

  business_name text not null default '',
  tagline text not null default '',
  gstin text not null default '',
  address text not null default '',
  state text not null default '',
  phone text not null default '',
  email text not null default '',

  default_tax_type text not null default 'inclusive',      -- inclusive | exclusive
  default_copy_type text not null default 'original',
  default_hsn_behavior text not null default 'optional',   -- optional | mandatory | auto
  invoice_sequence text not null default 'INV-0001',
  default_terms text not null default '',

  pay_mode text not null default 'Cash',
  upi_id text not null default '',
  bank_acc text not null default '',
  ifsc text not null default '',

  email_alerts boolean not null default true,
  sms_alerts boolean not null default false,
  daily_summary boolean not null default true,
  stock_alerts boolean not null default true,

  has_completed_setup boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_business_id_fkey
  foreign key (business_id) references public.businesses(id) on delete set null;

alter table public.businesses enable row level security;

create policy "businesses_owner_all" on public.businesses
  for all using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Super admins can read (but not write) every business, for the admin console
create policy "businesses_admin_read" on public.businesses
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_super_admin)
  );

-- Keep profiles.business_id in sync + stamp updated_at
create function public.handle_business_upsert()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles set business_id = new.id where id = new.owner_id;
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_business_insert
  after insert on public.businesses
  for each row execute procedure public.handle_business_upsert();

create function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger businesses_touch_updated_at
  before update on public.businesses
  for each row execute procedure public.touch_updated_at();

-- ============================================================
-- 3. CATEGORIES
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_tenant_all" on public.categories
  for all using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- ============================================================
-- 4. PRODUCTS
-- ============================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category text not null default '',  -- plain text, matches the frontend
                                       -- exactly (a free-text/select-by-name
                                       -- field, not a strict FK — deleting a
                                       -- category never touches existing
                                       -- products, matching current behavior)
  name text not null,
  rate numeric(12,2) not null default 0,
  unit text not null default 'Pcs',
  hsn text not null default '',
  gst_rate numeric(5,2) not null default 0,   -- "gp" in the frontend
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_tenant_all" on public.products
  for all using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create trigger products_touch_updated_at
  before update on public.products
  for each row execute procedure public.touch_updated_at();

-- ============================================================
-- 5. BILLS  (line items stored as jsonb — see audit notes: can be
--    normalized into a bill_items table later if per-item analytics
--    across bills becomes a real requirement)
-- ============================================================
create table public.bills (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,

  invoice_no text not null,
  invoice_date date not null default current_date,
  due_date date,
  status text not null default 'Pending',   -- Draft | Pending | Paid | Overdue

  customer jsonb not null default '{}',     -- {name, address, phone, gstin, state}
  payment jsonb not null default '{}',      -- {mode, upiId, bankAcc, ifsc}
  settings jsonb not null default '{}',     -- {gstOn, taxType, copyType, rcm, ewayBill}
  items jsonb not null default '[]',        -- snapshot of line items at save time

  subtotal numeric(12,2) not null default 0,
  cgst_total numeric(12,2) not null default 0,
  sgst_total numeric(12,2) not null default 0,
  igst_total numeric(12,2) not null default 0,
  round_off numeric(12,2) not null default 0,
  grand_total numeric(12,2) not null default 0,

  terms text not null default '',
  notes text not null default '',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bills enable row level security;

create policy "bills_tenant_all" on public.bills
  for all using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create trigger bills_touch_updated_at
  before update on public.bills
  for each row execute procedure public.touch_updated_at();

create index bills_business_id_idx on public.bills (business_id, created_at desc);

-- ============================================================
-- 6. DRAFTS  (capped at 8 most-recent per business, enforced in the service layer)
-- ============================================================
create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  payload jsonb not null,
  saved_at timestamptz not null default now()
);

alter table public.drafts enable row level security;

create policy "drafts_tenant_all" on public.drafts
  for all using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- ============================================================
-- 7. TEMPLATES  (business_id null = shared system template, e.g. seeded presets)
-- ============================================================
create table public.templates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete cascade, -- null = system template
  name text not null,
  icon text not null default '',
  profile jsonb not null default '{}',
  settings jsonb not null default '{}',
  seeded boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.templates enable row level security;

create policy "templates_tenant_read" on public.templates
  for select using (
    business_id is null
    or business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "templates_tenant_write" on public.templates
  for insert with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

create policy "templates_tenant_delete" on public.templates
  for delete using (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- ============================================================
-- 8. NOTIFICATIONS  (schema ready for when Notification Center ships)
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications_tenant_all" on public.notifications
  for all using (business_id in (select id from public.businesses where owner_id = auth.uid()))
  with check (business_id in (select id from public.businesses where owner_id = auth.uid()));

-- ============================================================
-- 9. ADMIN AGGREGATE STATS  (security-definer RPC — admins get counts,
--    never raw rows from other tenants)
-- ============================================================
create function public.admin_platform_stats()
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  result jsonb;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_super_admin) then
    raise exception 'not authorized';
  end if;

  select jsonb_build_object(
    'totalTenants', (select count(*) from public.businesses),
    'totalBills', (select count(*) from public.bills),
    'totalProducts', (select count(*) from public.products),
    'signupsLast7Days', (
      select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select to_char(d.day, 'Dy') as name,
               count(b.id) as signups
        from generate_series(current_date - 6, current_date, interval '1 day') d(day)
        left join public.businesses b on b.created_at::date = d.day
        group by d.day order by d.day
      ) t
    )
  ) into result;

  return result;
end;
$$;

-- ============================================================
-- Seed system templates (business_id null = visible to everyone)
-- ============================================================
insert into public.templates (name, icon, profile, settings, seeded, business_id) values
('Kirana / General Store', '🛒',
 '{"shopName":"Sharma General Store","tagline":"Quality Products, Fair Prices","shopAddress":"123, Nehru Market Road, Lucknow, UP - 226001","shopPhone":"+91 98765 43210","shopEmail":"sharmastore@example.com","shopGstin":"09ABCDE1234F1Z5","shopState":"Uttar Pradesh","upiId":"sharmastore@upi","bankAcc":"","ifsc":"","terms":"1. Goods once sold will not be taken back or exchanged.\n2. Payment due within 7 days.\n3. Subject to Lucknow jurisdiction."}',
 '{"gstOn":true,"tt":"intra","payMode":"Cash"}', true, null),
('Medical / Pharmacy', '🏥',
 '{"shopName":"Life Care Pharmacy","tagline":"Your Health, Our Priority","shopAddress":"Shop No. 5, Medical Square, New Delhi - 110001","shopPhone":"+91 98100 00000","shopEmail":"lifecare@example.com","shopGstin":"07ABCDE1234F1Z5","shopState":"Delhi","upiId":"lifecare@upi","bankAcc":"","ifsc":"","terms":"1. Medicines on valid prescription only.\n2. Check expiry before purchase.\n3. Subject to Delhi jurisdiction."}',
 '{"gstOn":true,"tt":"intra","payMode":"Cash"}', true, null),
('Restaurant / Food', '🍽️',
 '{"shopName":"Spice Garden Restaurant","tagline":"Authentic Flavours, Warm Hospitality","shopAddress":"MG Road, Bengaluru, Karnataka - 560001","shopPhone":"+91 97000 00000","shopEmail":"spicegarden@example.com","shopGstin":"29ABCDE1234F1Z5","shopState":"Karnataka","upiId":"spicegarden@upi","bankAcc":"","ifsc":"","terms":"1. Prices inclusive of applicable taxes.\n2. No outside food allowed.\n3. Bengaluru jurisdiction."}',
 '{"gstOn":true,"tt":"intra","payMode":"Cash"}', true, null),
('Services / Consulting', '🔧',
 '{"shopName":"TechServe Solutions","tagline":"Professional IT & Business Services","shopAddress":"Sector 18, Noida, Uttar Pradesh - 201301","shopPhone":"+91 99000 00000","shopEmail":"techserve@example.com","shopGstin":"09ABCDE5678G1Z5","shopState":"Uttar Pradesh","upiId":"","bankAcc":"HDFC Bank, A/C 1234567890","ifsc":"HDFC0001234","terms":"1. Payment due within 15 days.\n2. Retainer fees non-refundable.\n3. Noida jurisdiction."}',
 '{"gstOn":true,"tt":"intra","payMode":"Bank Transfer"}', true, null);

-- ============================================================
-- NOTE ON MAKING SOMEONE A SUPER ADMIN
-- There is no self-serve admin signup. After a user has signed up,
-- promote them manually from the SQL editor:
--   update public.profiles set is_super_admin = true where id =
--     (select id from auth.users where email = 'you@yourbusiness.com');
-- ============================================================
