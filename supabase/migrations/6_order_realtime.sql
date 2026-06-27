-- Realtime order status updates for buyers (and vendors on the same channel)

alter table public.vendor_orders replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'vendor_orders'
  ) then
    alter publication supabase_realtime add table public.vendor_orders;
  end if;
end $$;
