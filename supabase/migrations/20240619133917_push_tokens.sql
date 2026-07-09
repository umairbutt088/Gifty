-- Expo push tokens, one row per device, used to notify vendors of new
-- orders and buyers of status changes.

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  expo_push_token text not null unique,
  platform text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index push_tokens_user_id_idx on public.push_tokens (user_id);

create trigger push_tokens_set_updated_at
before update on public.push_tokens
for each row
execute function public.set_profiles_updated_at();

alter table public.push_tokens enable row level security;

create policy "Users manage their own push tokens"
on public.push_tokens
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
