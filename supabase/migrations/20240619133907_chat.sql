-- Per-order chat: one conversation per vendor order

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.vendor_orders (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  vendor_id uuid not null references public.profiles (id) on delete cascade,
  last_message_body text,
  last_message_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index conversations_buyer_id_idx on public.conversations (buyer_id);
create index conversations_vendor_id_idx on public.conversations (vendor_id);
create index conversations_last_message_at_idx on public.conversations (last_message_at desc nulls last);
create index messages_conversation_id_idx on public.messages (conversation_id);
create index messages_created_at_idx on public.messages (conversation_id, created_at);

create or replace function public.update_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set
    last_message_at = new.created_at,
    last_message_body = left(trim(new.body), 200)
  where id = new.conversation_id;

  return new;
end;
$$;

create trigger messages_update_conversation
after insert on public.messages
for each row
execute function public.update_conversation_on_message();

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy "Participants read conversations"
on public.conversations
for select
to authenticated
using (auth.uid() = buyer_id or auth.uid() = vendor_id);

create policy "Participants create conversations for their orders"
on public.conversations
for insert
to authenticated
with check (
  (auth.uid() = buyer_id or auth.uid() = vendor_id)
  and exists (
    select 1
    from public.vendor_orders as orders
    where orders.id = order_id
      and orders.buyer_id = conversations.buyer_id
      and orders.vendor_id = conversations.vendor_id
      and (orders.buyer_id = auth.uid() or orders.vendor_id = auth.uid())
  )
);

create policy "Participants read messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversations as conversations
    where conversations.id = conversation_id
      and (conversations.buyer_id = auth.uid() or conversations.vendor_id = auth.uid())
  )
);

create policy "Participants send messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.conversations as conversations
    where conversations.id = conversation_id
      and (conversations.buyer_id = auth.uid() or conversations.vendor_id = auth.uid())
  )
);

create policy "Chat participants can read counterpart profiles"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or exists (
    select 1
    from public.conversations as conversations
    where (conversations.buyer_id = auth.uid() and conversations.vendor_id = profiles.id)
       or (conversations.vendor_id = auth.uid() and conversations.buyer_id = profiles.id)
  )
);

alter table public.conversations replica identity full;
alter table public.messages replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversations'
  ) then
    alter publication supabase_realtime add table public.conversations;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
