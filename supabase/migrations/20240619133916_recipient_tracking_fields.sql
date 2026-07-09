-- Surface tracking/carrier info (and status_changed_at) on the public
-- recipient delivery-link page.

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
    'status_changed_at', orders.status_changed_at,
    'delivery_date', orders.delivery_date,
    'recipient_confirmed_at', orders.recipient_confirmed_at,
    'quantity', orders.quantity,
    'tracking_number', orders.tracking_number,
    'carrier', orders.carrier
  )
  into result
  from public.vendor_orders as orders
  join public.gifts as gifts on gifts.id = orders.gift_id
  where orders.delivery_token = trim(p_token);

  return result;
end;
$$;
