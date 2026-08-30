-- ============================================================
-- FitCore Gym Management — Supabase Schema
-- Run this in Supabase SQL Editor (Project > SQL Editor > New Query)
-- ============================================================

-- ------------------------------------------------------------
-- 1. PROFILES (extends Supabase auth.users with role info)
-- ------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'admin' check (role in ('super_admin', 'admin', 'staff')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'Admin'), 'admin');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- 2. TRAINERS
-- ------------------------------------------------------------
create table trainers (
  id uuid primary key default gen_random_uuid(),
  trainer_code text unique not null,       -- e.g. TR-204
  name text not null,
  email text,
  phone text,
  specialization text,
  experience_years int default 0,
  rating numeric(2,1) default 0,
  status text default 'active' check (status in ('active', 'inactive', 'on_leave')),
  avatar_url text,
  date_of_birth date,
  gender text,
  nationality text,
  address text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 3. MEMBERSHIP PLANS
-- ------------------------------------------------------------
create table membership_plans (
  id uuid primary key default gen_random_uuid(),
  plan_code text unique not null,           -- e.g. PLN-001
  name text not null,                       -- Premium, Standard, Basic...
  price numeric(10,2) not null,
  duration_days int not null,
  renewal_rate numeric(5,2) default 0,
  status text default 'active' check (status in ('active', 'inactive')),
  features jsonb default '[]',              -- list of included features
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 4. MEMBERS
-- ------------------------------------------------------------
create table members (
  id uuid primary key default gen_random_uuid(),
  member_code text unique not null,         -- e.g. FT-1024
  name text not null,
  email text,
  phone text,
  gender text,
  date_of_birth date,
  address text,
  avatar_url text,
  plan_id uuid references membership_plans(id) on delete set null,
  trainer_id uuid references trainers(id) on delete set null,
  status text default 'active' check (status in ('active', 'inactive', 'suspended')),
  join_date date default current_date,
  expiry_date date,
  created_at timestamptz default now()
);

create index idx_members_plan on members(plan_id);
create index idx_members_trainer on members(trainer_id);
create index idx_members_status on members(status);

-- ------------------------------------------------------------
-- 5. ATTENDANCE
-- ------------------------------------------------------------
create table attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  check_in timestamptz not null default now(),
  check_out timestamptz,
  status text generated always as (
    case when check_out is null then 'present' else 'left' end
  ) stored,
  created_at timestamptz default now()
);

create index idx_attendance_member on attendance(member_id);
create index idx_attendance_checkin on attendance(check_in);

-- ------------------------------------------------------------
-- 6. PAYMENTS
-- ------------------------------------------------------------
create table payments (
  id uuid primary key default gen_random_uuid(),
  transaction_code text unique not null,    -- e.g. TX1042
  member_id uuid references members(id) on delete set null,
  plan_id uuid references membership_plans(id) on delete set null,
  amount numeric(10,2) not null,
  method text check (method in ('card', 'bank_transfer', 'cash', 'upi')),
  status text default 'pending' check (status in ('paid', 'pending', 'failed', 'refunded')),
  paid_at timestamptz default now(),
  created_at timestamptz default now()
);

create index idx_payments_member on payments(member_id);
create index idx_payments_status on payments(status);

-- ------------------------------------------------------------
-- 7. CLASSES
-- ------------------------------------------------------------
create table classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,                       -- Morning Strength, Yoga Flow...
  trainer_id uuid references trainers(id) on delete set null,
  scheduled_at timestamptz not null,
  duration_minutes int default 60,
  capacity int not null default 20,
  booked_count int default 0,
  status text default 'scheduled' check (status in ('scheduled', 'full', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

create table class_bookings (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  booked_at timestamptz default now(),
  unique (class_id, member_id)
);

-- ------------------------------------------------------------
-- 8. STAFF
-- ------------------------------------------------------------
create table staff (
  id uuid primary key default gen_random_uuid(),
  staff_code text unique not null,          -- e.g. ST-124
  name text not null,
  role_title text,                          -- Administrator, Receptionist...
  department text,
  email text,
  phone text,
  status text default 'active' check (status in ('active', 'inactive', 'on_leave')),
  join_date date default current_date,
  avatar_url text,
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 9. LEADS
-- ------------------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  source text check (source in ('website', 'walk_in', 'referral', 'social_media', 'other')),
  interest text,                            -- Personal Training, Yoga, HIIT...
  status text default 'new' check (status in ('new', 'contacted', 'in_progress', 'converted', 'lost')),
  last_contact timestamptz default now(),
  created_at timestamptz default now()
);

-- ------------------------------------------------------------
-- 10. ACTIVITY LOG (powers Notifications & Activity page)
-- ------------------------------------------------------------
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  category text check (category in ('registration', 'payment', 'schedule', 'system', 'member', 'class')),
  title text not null,
  description text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Trial-project setup: any authenticated (logged-in) user can
-- read/write. Good enough for a demo; tighten later per-role.
-- ============================================================
alter table profiles enable row level security;
alter table trainers enable row level security;
alter table membership_plans enable row level security;
alter table members enable row level security;
alter table attendance enable row level security;
alter table payments enable row level security;
alter table classes enable row level security;
alter table class_bookings enable row level security;
alter table staff enable row level security;
alter table leads enable row level security;
alter table activity_log enable row level security;

-- Generic policy: authenticated users can do everything.
-- (Split into per-action policies later if you need per-role restrictions.)
create policy "Authenticated full access" on profiles for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on trainers for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on membership_plans for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on members for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on attendance for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on payments for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on classes for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on class_bookings for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on staff for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on leads for all using (auth.role() = 'authenticated');
create policy "Authenticated full access" on activity_log for all using (auth.role() = 'authenticated');
