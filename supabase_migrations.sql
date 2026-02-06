-- Migration: 20240203_initial_schema_no_reg.sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Devices Table (Anonymous Identity)
create table if not exists public.devices (
  device_id text primary key, -- Generated on client (UUIDv4) stored in LocalStorage
  user_agent text,
  ip_address text,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now(),
  banned boolean default false,
  notes text,
  name text,
  email text
);

-- 2. Checkins Table
create table if not exists public.checkins (
  id uuid primary key default uuid_generate_v4(),
  device_id text references public.devices(device_id) on delete cascade not null,
  created_at timestamptz default now()
);

-- 3. Vouchers Table
create table if not exists public.vouchers (
  code text primary key, -- Short code or UUID
  device_id text references public.devices(device_id) on delete cascade not null,
  discount_percent int not null default 5,
  is_active boolean default true,
  created_at timestamptz default now(),
  redeemed_at timestamptz
);

-- 4. Settings Table (Global Config)
create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

-- 5. Admins Table
create table if not exists public.admins (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete cascade not null,
  email text not null,
  name text,
  role text default 'admin',
  created_at timestamptz default now()
);

-- Seed Settings (Idempotent: skips if exists)
insert into public.settings (key, value) values
('loyalty_rules', '{"visits_required": 5, "reward_percent": 5, "cooldown_hours": 12}'),
('security', '{"max_checkins_per_day": 1, "require_geo": false}')
on conflict (key) do nothing;

-- RLS Policies
alter table public.devices enable row level security;
alter table public.checkins enable row level security;
alter table public.vouchers enable row level security;
alter table public.settings enable row level security;
alter table public.admins enable row level security;

-- Drop policies if they exist (to avoid "policy already exists" errors)
drop policy if exists "Admins can do everything on devices" on public.devices;
drop policy if exists "Admins can do everything on checkins" on public.checkins;
drop policy if exists "Admins can do everything on vouchers" on public.vouchers;
drop policy if exists "Admins can do everything on settings" on public.settings;
drop policy if exists "Admins can do everything on admins" on public.admins;

-- Re-create Policies
-- SERVICE_ROLE (Server-side) has full access
-- AUTHENTICATED (Admin) has read/write access
-- ANON (Public) has NO access (must go through API)

create policy "Admins can do everything on devices" on public.devices
  for all to authenticated using (true) with check (true);

create policy "Admins can do everything on checkins" on public.checkins
  for all to authenticated using (true) with check (true);

create policy "Admins can do everything on vouchers" on public.vouchers
  for all to authenticated using (true) with check (true);

create policy "Admins can do everything on settings" on public.settings
  for all to authenticated using (true) with check (true);

create policy "Admins can do everything on admins" on public.admins
  for all to authenticated using (true) with check (true);
