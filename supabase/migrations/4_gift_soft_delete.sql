-- Soft delete for gifts: keep rows for order history and restore

alter table public.gifts
add column deleted_at timestamptz;

create index gifts_deleted_at_idx on public.gifts (vendor_id, deleted_at desc)
where deleted_at is not null;

drop policy if exists "Buyers read live gifts" on public.gifts;

create policy "Buyers read live gifts"
on public.gifts
for select
to authenticated
using (status = 'live' and deleted_at is null);
