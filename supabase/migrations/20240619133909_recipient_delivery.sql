-- Recipient delivery: contact info, magic link token, confirmation, notifications

alter table public.vendor_orders
add column recipient_phone text,
add column recipient_email text,
add column notify_recipient boolean not null default false,
add column delivery_token text,
add column recipient_confirmed_at timestamptz,
add column recipient_confirmation_note text,
add column recipient_notified_shipped_at timestamptz,
add column recipient_notified_delivered_at timestamptz;

update public.vendor_orders
set delivery_token = gen_random_uuid()::text
where delivery_token is null;

alter table public.vendor_orders
alter column delivery_token set default gen_random_uuid()::text,
alter column delivery_token set not null;

create unique index vendor_orders_delivery_token_idx on public.vendor_orders (delivery_token);

create or replace function public.get_recipient_gift_by_token(p_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  if p_token is null or length(trim(p_token)) = 0 then
    return null;
  end if;

  select json_build_object(
    'recipient_name', orders.recipient_name,
    'gift_title', gifts.title,
    'gift_image_url', case
      when coalesce(array_length(gifts.image_urls, 1), 0) > 0 then gifts.image_urls[1]
      else null
    end,
    'gift_message', orders.gift_message,
    'status', orders.status,
    'delivery_date', orders.delivery_date,
    'recipient_confirmed_at', orders.recipient_confirmed_at,
    'quantity', orders.quantity
  )
  into result
  from public.vendor_orders as orders
  join public.gifts as gifts on gifts.id = orders.gift_id
  where orders.delivery_token = trim(p_token);

  return result;
end;
$$;

create or replace function public.confirm_recipient_delivery(
  p_token text,
  p_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_token is null or length(trim(p_token)) = 0 then
    return false;
  end if;

  update public.vendor_orders
  set
    recipient_confirmed_at = timezone('utc'::text, now()),
    recipient_confirmation_note = nullif(trim(p_note), '')
  where delivery_token = trim(p_token)
    and recipient_confirmed_at is null;

  return found;
end;
$$;

revoke all on function public.get_recipient_gift_by_token(text) from public;
revoke all on function public.confirm_recipient_delivery(text, text) from public;

grant execute on function public.get_recipient_gift_by_token(text) to anon, authenticated;
grant execute on function public.confirm_recipient_delivery(text, text) to anon, authenticated;
