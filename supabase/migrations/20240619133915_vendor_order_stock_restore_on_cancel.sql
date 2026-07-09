-- Restore gift stock on cancellation too, not just vendor rejection.

create or replace function public.restore_gift_stock_on_order_reject_or_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status and new.status in ('rejected'::public.vendor_order_status, 'cancelled'::public.vendor_order_status) then
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

drop trigger if exists vendor_orders_restore_gift_stock_on_reject on public.vendor_orders;

create trigger vendor_orders_restore_gift_stock_on_reject_or_cancel
after update of status on public.vendor_orders
for each row
execute function public.restore_gift_stock_on_order_reject_or_cancel();

drop function if exists public.restore_gift_stock_on_order_reject();
