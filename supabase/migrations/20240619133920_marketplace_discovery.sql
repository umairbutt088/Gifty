-- Marketplace discovery: discounts, ranking, favorites, reviews, and variants.

alter table public.gifts
  add column if not exists original_price_cents integer check (original_price_cents is null or original_price_cents >= 0),
  add column if not exists featured boolean not null default false,
  add column if not exists sales_count integer not null default 0 check (sales_count >= 0),
  add column if not exists prep_time_minutes integer check (prep_time_minutes is null or prep_time_minutes > 0),
  add column if not exists rating_avg numeric(3, 2) not null default 0 check (rating_avg >= 0 and rating_avg <= 5),
  add column if not exists rating_count integer not null default 0 check (rating_count >= 0);

alter table public.gifts
  drop constraint if exists gifts_original_price_gte_price;

alter table public.gifts
  add constraint gifts_original_price_gte_price
  check (original_price_cents is null or original_price_cents >= price_cents);

create index if not exists gifts_featured_idx on public.gifts (featured) where featured = true and deleted_at is null;
create index if not exists gifts_sales_count_idx on public.gifts (sales_count desc) where deleted_at is null;
create index if not exists gifts_rating_avg_idx on public.gifts (rating_avg desc) where deleted_at is null;

create table if not exists public.gift_favorites (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  gift_id uuid not null references public.gifts (id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (buyer_id, gift_id)
);

create index if not exists gift_favorites_buyer_id_idx on public.gift_favorites (buyer_id);
create index if not exists gift_favorites_gift_id_idx on public.gift_favorites (gift_id);

alter table public.gift_favorites enable row level security;

drop policy if exists "Buyers manage own gift favorites" on public.gift_favorites;
create policy "Buyers manage own gift favorites"
on public.gift_favorites
for all
to authenticated
using (auth.uid() = buyer_id)
with check (auth.uid() = buyer_id);

drop policy if exists "Anyone authenticated can read favorite counts" on public.gift_favorites;
create policy "Anyone authenticated can read favorite counts"
on public.gift_favorites
for select
to authenticated
using (true);

create table if not exists public.gift_reviews (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references public.gifts (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (gift_id, buyer_id)
);

create index if not exists gift_reviews_gift_id_idx on public.gift_reviews (gift_id, created_at desc);

alter table public.gift_reviews enable row level security;

drop policy if exists "Authenticated users read gift reviews" on public.gift_reviews;
create policy "Authenticated users read gift reviews"
on public.gift_reviews
for select
to authenticated
using (true);

drop policy if exists "Buyers insert own gift reviews" on public.gift_reviews;
create policy "Buyers insert own gift reviews"
on public.gift_reviews
for insert
to authenticated
with check (
  auth.uid() = buyer_id
  and exists (
    select 1
    from public.vendor_orders o
    where o.gift_id = gift_reviews.gift_id
      and o.buyer_id = auth.uid()
      and o.status = 'delivered'::public.vendor_order_status
  )
);

drop policy if exists "Buyers update own gift reviews" on public.gift_reviews;
create policy "Buyers update own gift reviews"
on public.gift_reviews
for update
to authenticated
using (auth.uid() = buyer_id)
with check (auth.uid() = buyer_id);

drop policy if exists "Buyers delete own gift reviews" on public.gift_reviews;
create policy "Buyers delete own gift reviews"
on public.gift_reviews
for delete
to authenticated
using (auth.uid() = buyer_id);

create or replace function public.refresh_gift_rating_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_gift_id uuid;
begin
  target_gift_id := coalesce(new.gift_id, old.gift_id);

  update public.gifts g
  set
    rating_avg = coalesce((
      select round(avg(r.rating)::numeric, 2)
      from public.gift_reviews r
      where r.gift_id = target_gift_id
    ), 0),
    rating_count = (
      select count(*)::integer
      from public.gift_reviews r
      where r.gift_id = target_gift_id
    ),
    updated_at = timezone('utc'::text, now())
  where g.id = target_gift_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists gift_reviews_refresh_stats on public.gift_reviews;
create trigger gift_reviews_refresh_stats
after insert or update or delete on public.gift_reviews
for each row
execute function public.refresh_gift_rating_stats();

create table if not exists public.gift_variants (
  id uuid primary key default gen_random_uuid(),
  gift_id uuid not null references public.gifts (id) on delete cascade,
  label text not null,
  price_cents integer not null check (price_cents >= 0),
  stock integer not null default 0 check (stock >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists gift_variants_gift_id_idx on public.gift_variants (gift_id, sort_order, created_at);

alter table public.gift_variants enable row level security;

drop policy if exists "Authenticated users read gift variants" on public.gift_variants;
create policy "Authenticated users read gift variants"
on public.gift_variants
for select
to authenticated
using (true);

drop policy if exists "Vendors manage own gift variants" on public.gift_variants;
create policy "Vendors manage own gift variants"
on public.gift_variants
for all
to authenticated
using (
  exists (
    select 1
    from public.gifts g
    where g.id = gift_variants.gift_id
      and g.vendor_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.gifts g
    where g.id = gift_variants.gift_id
      and g.vendor_id = auth.uid()
  )
);

alter table public.vendor_orders
  add column if not exists gift_variant_id uuid references public.gift_variants (id) on delete set null;

create or replace function public.decrement_gift_stock_on_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rows_updated integer;
begin
  update public.gifts
  set
    stock = stock - new.quantity,
    sales_count = sales_count + new.quantity,
    status = case
      when stock - new.quantity <= 0 and status = 'live'::public.gift_status
        then 'out_of_stock'::public.gift_status
      else status
    end,
    updated_at = timezone('utc'::text, now())
  where id = new.gift_id
    and deleted_at is null
    and stock >= new.quantity;

  get diagnostics rows_updated = row_count;

  if rows_updated = 0 then
    raise exception 'Not enough stock for this gift.';
  end if;

  if new.gift_variant_id is not null then
    update public.gift_variants
    set
      stock = stock - new.quantity,
      updated_at = timezone('utc'::text, now())
    where id = new.gift_variant_id
      and gift_id = new.gift_id
      and stock >= new.quantity;

    get diagnostics rows_updated = row_count;

    if rows_updated = 0 then
      raise exception 'Not enough stock for this gift option.';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.restore_gift_stock_on_order_reject()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from 'rejected'::public.vendor_order_status
    and new.status = 'rejected'::public.vendor_order_status then
    update public.gifts
    set
      stock = stock + new.quantity,
      sales_count = greatest(sales_count - new.quantity, 0),
      status = case
        when stock + new.quantity > 0 and status = 'out_of_stock'::public.gift_status
          then 'live'::public.gift_status
        else status
      end,
      updated_at = timezone('utc'::text, now())
    where id = new.gift_id
      and deleted_at is null;

    if new.gift_variant_id is not null then
      update public.gift_variants
      set
        stock = stock + new.quantity,
        updated_at = timezone('utc'::text, now())
      where id = new.gift_variant_id
        and gift_id = new.gift_id;
    end if;
  end if;

  return new;
end;
$$;
