-- Buyers can permanently remove orders they previously soft-deleted from their list

create policy "Buyers delete own removed orders"
on public.vendor_orders
for delete
to authenticated
using (
  auth.uid() = buyer_id
  and buyer_deleted_at is not null
);
