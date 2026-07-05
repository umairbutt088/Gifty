-- Public bucket for vendor gift listing photos

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gift-images',
  'gift-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Anyone can view gift images"
on storage.objects
for select
to public
using (bucket_id = 'gift-images');

create policy "Vendors upload own gift images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'gift-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Vendors update own gift images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'gift-images'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'gift-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Vendors delete own gift images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'gift-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);
