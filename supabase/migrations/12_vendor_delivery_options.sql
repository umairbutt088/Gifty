-- Vendor delivery vs pickup + order fulfillment tracking.

alter table public.vendor_stores
  add column if not exists offers_delivery boolean not null default false,
  add column if not exists delivery_radius_km numeric(8, 2),
  add column if not exists delivery_charge_cents integer
    check (delivery_charge_cents is null or delivery_charge_cents >= 0);

update public.vendor_stores
set offers_delivery = true
where coalesce(array_length(delivery_cities, 1), 0) > 0;

create type public.order_fulfillment_type as enum ('delivery', 'pickup');

alter table public.vendor_orders
  add column if not exists fulfillment_type public.order_fulfillment_type not null default 'delivery',
  add column if not exists delivery_charge_cents integer not null default 0
    check (delivery_charge_cents >= 0);

drop function if exists public.get_vendor_store_public(uuid);

create or replace function public.get_vendor_store_public(p_vendor_id uuid)
returns table (
  id uuid,
  vendor_id uuid,
  name text,
  logo_url text,
  bio text,
  delivery_cities text[],
  offers_delivery boolean,
  delivery_radius_km numeric,
  delivery_charge_cents integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    vs.id,
    vs.vendor_id,
    vs.name,
    vs.logo_url,
    vs.bio,
    vs.delivery_cities,
    vs.offers_delivery,
    vs.delivery_radius_km,
    vs.delivery_charge_cents
  from public.vendor_stores vs
  where vs.vendor_id = p_vendor_id
    and nullif(trim(vs.name), '') is not null
    and exists (
      select 1
      from public.gifts g
      where g.vendor_id = p_vendor_id
        and g.status = 'live'
        and g.deleted_at is null
        and g.stock > 0
    );
$$;

grant execute on function public.get_vendor_store_public(uuid) to authenticated;
