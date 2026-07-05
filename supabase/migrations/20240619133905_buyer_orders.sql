-- Buyers can browse live gifts (already filtered) and place orders

create policy "Buyers read own orders"
on public.vendor_orders
for select
to authenticated
using (auth.uid() = buyer_id);

create policy "Buyers create orders"
on public.vendor_orders
for insert
to authenticated
with check (
  auth.uid() = buyer_id
  and exists (
    select 1
    from public.gifts
    where gifts.id = gift_id
      and gifts.vendor_id = vendor_orders.vendor_id
      and gifts.status = 'live'
      and gifts.deleted_at is null
      and gifts.stock >= vendor_orders.quantity
  )
);
