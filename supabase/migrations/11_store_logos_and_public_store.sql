-- Store logo uploads + public vendor store read for buyers.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'store-logos',
  'store-logos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Anyone can view store logos"
on storage.objects
for select
to public
using (bucket_id = 'store-logos');

create policy "Vendors upload own store logos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'store-logos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Vendors update own store logos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'store-logos'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'store-logos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Vendors delete own store logos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'store-logos'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create or replace function public.get_vendor_store_public(p_vendor_id uuid)
returns table (
  id uuid,
  vendor_id uuid,
  name text,
  logo_url text,
  bio text,
  delivery_cities text[]
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
    vs.delivery_cities
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

create policy "Buyers read onboarded vendor stores"
on public.vendor_stores
for select
to authenticated
using (
  onboarding_complete = true
  and nullif(trim(name), '') is not null
);
