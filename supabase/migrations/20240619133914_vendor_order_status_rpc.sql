-- Server-enforced order status transitions.
--
-- Today "Vendors manage own orders" (for all) and "Buyers update own orders"
-- grant broad row-level UPDATE access with no column restriction, so a client
-- could set `status` directly and skip/forge the pipeline. These functions
-- become the only path for status changes: they validate the transition,
-- stamp the right timestamp, and log an audit event. Direct column access to
-- `status` (and the other fields these functions own) is revoked below so
-- RLS alone can no longer authorize a raw status update.

create or replace function public._transition_vendor_order(
  p_order_id uuid,
  p_actor uuid,
  p_actor_role text,
  p_status public.vendor_order_status,
  p_note text,
  p_tracking_number text default null,
  p_carrier text default null
)
returns public.vendor_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.vendor_orders;
  v_old_status public.vendor_order_status;
begin
  select * into v_order from public.vendor_orders where id = p_order_id for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if p_actor_role = 'vendor' and v_order.vendor_id <> p_actor then
    raise exception 'Not authorized.';
  end if;

  if p_actor_role = 'buyer' and v_order.buyer_id <> p_actor then
    raise exception 'Not authorized.';
  end if;

  v_old_status := v_order.status;

  if p_actor_role = 'vendor' then
    if not (
      (v_old_status = 'new' and p_status in ('accepted', 'rejected'))
      or (v_old_status = 'accepted' and p_status in ('preparing', 'cancelled'))
      or (v_old_status = 'preparing' and p_status in ('shipped', 'cancelled'))
      or (v_old_status = 'shipped' and p_status = 'delivered')
    ) then
      raise exception 'Cannot move order from % to %.', v_old_status, p_status;
    end if;
  elsif p_actor_role = 'buyer' then
    if not (v_old_status = 'new' and p_status = 'cancelled') then
      raise exception 'Order can no longer be cancelled.';
    end if;
  else
    raise exception 'Unknown actor role.';
  end if;

  if p_status in ('rejected', 'cancelled') and coalesce(nullif(trim(p_note), ''), '') = '' then
    raise exception 'A reason is required.';
  end if;

  update public.vendor_orders
  set
    status = p_status,
    status_changed_at = timezone('utc'::text, now()),
    accepted_at = case when p_status = 'accepted' then timezone('utc'::text, now()) else accepted_at end,
    preparing_at = case when p_status = 'preparing' then timezone('utc'::text, now()) else preparing_at end,
    shipped_at = case when p_status = 'shipped' then timezone('utc'::text, now()) else shipped_at end,
    delivered_at = case when p_status = 'delivered' then timezone('utc'::text, now()) else delivered_at end,
    rejected_at = case when p_status = 'rejected' then timezone('utc'::text, now()) else rejected_at end,
    cancelled_at = case when p_status = 'cancelled' then timezone('utc'::text, now()) else cancelled_at end,
    reject_reason = case when p_status = 'rejected' then nullif(trim(p_note), '') else reject_reason end,
    cancel_reason = case when p_status = 'cancelled' then nullif(trim(p_note), '') else cancel_reason end,
    tracking_number = case
      when p_status = 'shipped' then coalesce(nullif(trim(p_tracking_number), ''), tracking_number)
      else tracking_number
    end,
    carrier = case
      when p_status = 'shipped' then coalesce(nullif(trim(p_carrier), ''), carrier)
      else carrier
    end,
    updated_at = timezone('utc'::text, now())
  where id = p_order_id
  returning * into v_order;

  insert into public.order_status_events (order_id, buyer_id, vendor_id, from_status, to_status, changed_by, note)
  values (v_order.id, v_order.buyer_id, v_order.vendor_id, v_old_status, p_status, p_actor, nullif(trim(p_note), ''));

  return v_order;
end;
$$;

revoke all on function public._transition_vendor_order(uuid, uuid, text, public.vendor_order_status, text, text, text) from public;

create or replace function public.set_vendor_order_status(
  p_order_id uuid,
  p_status public.vendor_order_status,
  p_note text default null
)
returns public.vendor_orders
language plpgsql
security definer
set search_path = public
as $$
begin
  return public._transition_vendor_order(p_order_id, auth.uid(), 'vendor', p_status, p_note);
end;
$$;

create or replace function public.mark_vendor_order_shipped(
  p_order_id uuid,
  p_tracking_number text default null,
  p_carrier text default null,
  p_note text default null
)
returns public.vendor_orders
language plpgsql
security definer
set search_path = public
as $$
begin
  return public._transition_vendor_order(p_order_id, auth.uid(), 'vendor', 'shipped', p_note, p_tracking_number, p_carrier);
end;
$$;

create or replace function public.cancel_buyer_order(
  p_order_id uuid,
  p_note text default null
)
returns public.vendor_orders
language plpgsql
security definer
set search_path = public
as $$
begin
  return public._transition_vendor_order(p_order_id, auth.uid(), 'buyer', 'cancelled', p_note);
end;
$$;

revoke all on function public.set_vendor_order_status(uuid, public.vendor_order_status, text) from public;
revoke all on function public.mark_vendor_order_shipped(uuid, text, text, text) from public;
revoke all on function public.cancel_buyer_order(uuid, text) from public;

grant execute on function public.set_vendor_order_status(uuid, public.vendor_order_status, text) to authenticated;
grant execute on function public.mark_vendor_order_shipped(uuid, text, text, text) to authenticated;
grant execute on function public.cancel_buyer_order(uuid, text) to authenticated;

-- Lock down direct writes to the columns these functions own. Soft-delete
-- flags stay directly writable (that's an unrelated, still-legitimate
-- self-service action); everything else must go through the RPCs above.
revoke update on public.vendor_orders from authenticated;
grant update (buyer_deleted_at, vendor_deleted_at) on public.vendor_orders to authenticated;
