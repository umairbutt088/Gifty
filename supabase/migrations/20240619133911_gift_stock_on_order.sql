-- Deduct gift stock when buyers place orders; restore on vendor rejection.

create or replace function public.decrement_gift_stock_on_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  rows_updated integer;
begin
  update public.gifts
  set
    stock = stock - new.quantity,
    status = case
      when stock - new.quantity <= 0 and status = 'live'::public.gift_status
        then 'out_of_stock'::public.gift_status
      else status
    end,
    updated_at = timezone('utc'::text, now())
  where id = new.gift_id
    and deleted_at is null
    and stock >= new.quantity;

  get diagnostics rows_updated = row_count;

  if rows_updated = 0 then
    raise exception 'Not enough stock for this gift.';
  end if;

  return new;
end;
$$;

create or replace function public.restore_gift_stock_on_order_reject()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from 'rejected'::public.vendor_order_status
    and new.status = 'rejected'::public.vendor_order_status then
    update public.gifts
    set
      stock = stock + new.quantity,
      status = case
        when stock + new.quantity > 0 and status = 'out_of_stock'::public.gift_status
          then 'live'::public.gift_status
        else status
      end,
      updated_at = timezone('utc'::text, now())
    where id = new.gift_id
      and deleted_at is null;
  end if;

  return new;
end;
$$;

drop trigger if exists vendor_orders_decrement_gift_stock on public.vendor_orders;
create trigger vendor_orders_decrement_gift_stock
after insert on public.vendor_orders
for each row
execute function public.decrement_gift_stock_on_order();

drop trigger if exists vendor_orders_restore_gift_stock_on_reject on public.vendor_orders;
create trigger vendor_orders_restore_gift_stock_on_reject
after update of status on public.vendor_orders
for each row
execute function public.restore_gift_stock_on_order_reject();
