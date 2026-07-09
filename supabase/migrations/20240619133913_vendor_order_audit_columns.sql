-- Per-stage timestamps, reason capture, tracking info, and a status-change
-- audit trail for vendor_orders.

alter table public.vendor_orders
  add column status_changed_at timestamptz not null default timezone('utc'::text, now()),
  add column accepted_at timestamptz,
  add column preparing_at timestamptz,
  add column shipped_at timestamptz,
  add column delivered_at timestamptz,
  add column rejected_at timestamptz,
  add column cancelled_at timestamptz,
  add column reject_reason text,
  add column cancel_reason text,
  add column sla_escalated_at timestamptz,
  add column tracking_number text,
  add column carrier text;

create table public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.vendor_orders (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  vendor_id uuid not null references public.profiles (id) on delete cascade,
  from_status public.vendor_order_status,
  to_status public.vendor_order_status not null,
  changed_by uuid references public.profiles (id) on delete set null,
  note text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index order_status_events_order_id_idx on public.order_status_events (order_id, created_at);

alter table public.order_status_events enable row level security;

create policy "Participants read order events"
on public.order_status_events
for select
to authenticated
using (auth.uid() = buyer_id or auth.uid() = vendor_id);

-- No insert/update/delete policy for `authenticated`: only the security-definer
-- status-transition functions (see 15_vendor_order_status_rpc.sql) write here,
-- and those run with definer privileges that bypass RLS.
