-- Occasion tags for gifting discovery (birthday, anniversary, etc.).

alter table public.gifts
  add column if not exists occasion_tags text[] not null default '{}';

create index if not exists gifts_occasion_tags_gin_idx
  on public.gifts
  using gin (occasion_tags);
