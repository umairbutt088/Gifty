-- Vendor stores, gift listings, and fulfillment orders

create type public.gift_category as enum (
  'flowers',
  'chocolate',
  'jewelry',
  'experience',
  'custom',
  'other'
);

create type public.gift_status as enum (
  'draft',
  'pending_review',
  'live',
  'paused',
  'out_of_stock'
);

create type public.vendor_order_status as enum (
  'new',
  'accepted',
  'preparing',
  'shipped',
  'delivered',
  'rejected'
);

create table public.vendor_stores (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null unique references public.profiles (id) on delete cascade,
  name text not null default '',
  logo_url text,
  bio text,
  delivery_cities text[] not null default '{}',
  bank_account_name text,
  bank_account_number text,
  bank_name text,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table public.gifts (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  category public.gift_category not null default 'other',
  stock integer not null default 0 check (stock >= 0),
  status public.gift_status not null default 'draft',
  image_urls text[] not null default '{}',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table public.vendor_orders (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.profiles (id) on delete cascade,
  gift_id uuid not null references public.gifts (id) on delete restrict,
  buyer_id uuid references public.profiles (id) on delete set null,
  status public.vendor_order_status not null default 'new',
  quantity integer not null default 1 check (quantity > 0),
  total_cents integer not null check (total_cents >= 0),
  recipient_name text not null,
  recipient_address text,
  gift_message text,
  delivery_date date,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index vendor_stores_vendor_id_idx on public.vendor_stores (vendor_id);
create index gifts_vendor_id_idx on public.gifts (vendor_id);
create index gifts_status_idx on public.gifts (status);
create index vendor_orders_vendor_id_idx on public.vendor_orders (vendor_id);
create index vendor_orders_status_idx on public.vendor_orders (status);

create trigger vendor_stores_set_updated_at
before update on public.vendor_stores
for each row
execute function public.set_profiles_updated_at();

create trigger gifts_set_updated_at
before update on public.gifts
for each row
execute function public.set_profiles_updated_at();

create trigger vendor_orders_set_updated_at
before update on public.vendor_orders
for each row
execute function public.set_profiles_updated_at();

alter table public.vendor_stores enable row level security;
alter table public.gifts enable row level security;
alter table public.vendor_orders enable row level security;

create policy "Vendors manage own store"
on public.vendor_stores
for all
to authenticated
using (auth.uid() = vendor_id)
with check (auth.uid() = vendor_id);

create policy "Vendors manage own gifts"
on public.gifts
for all
to authenticated
using (auth.uid() = vendor_id)
with check (auth.uid() = vendor_id);

create policy "Buyers read live gifts"
on public.gifts
for select
to authenticated
using (status = 'live');

create policy "Vendors manage own orders"
on public.vendor_orders
for all
to authenticated
using (auth.uid() = vendor_id)
with check (auth.uid() = vendor_id);
