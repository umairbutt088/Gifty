-- Gifty: public profiles linked to Supabase Auth users

create type public.user_role as enum ('vendor', 'buyer', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  role public.user_role not null default 'buyer',
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.profiles is 'App profile for each authenticated user.';

create index profiles_role_idx on public.profiles (role);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_role public.user_role;
begin
  profile_role := coalesce(
    nullif(new.raw_user_meta_data ->> 'role', '')::public.user_role,
    'buyer'::public.user_role
  );

  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'first_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'last_name'), ''),
    profile_role
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Backfill profiles for users created before this migration (safe to re-run).
insert into public.profiles (id, email, first_name, last_name, role)
select
  users.id,
  users.email,
  nullif(trim(users.raw_user_meta_data ->> 'first_name'), ''),
  nullif(trim(users.raw_user_meta_data ->> 'last_name'), ''),
  coalesce(
    nullif(users.raw_user_meta_data ->> 'role', '')::public.user_role,
    'buyer'::public.user_role
  )
from auth.users as users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
);
