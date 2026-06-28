-- Soft delete for orders: buyers and vendors can hide orders from their own lists

alter table public.vendor_orders
add column buyer_deleted_at timestamptz,
add column vendor_deleted_at timestamptz;

create index vendor_orders_vendor_deleted_idx on public.vendor_orders (vendor_id, vendor_deleted_at desc)
where vendor_deleted_at is not null;

create index vendor_orders_buyer_deleted_idx on public.vendor_orders (buyer_id, buyer_deleted_at desc)
where buyer_deleted_at is not null;

create policy "Buyers update own orders"
on public.vendor_orders
for update
to authenticated
using (auth.uid() = buyer_id)
with check (auth.uid() = buyer_id);
