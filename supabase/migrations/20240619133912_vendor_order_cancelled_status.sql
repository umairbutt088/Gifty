-- Add a distinct 'cancelled' status, separate from vendor-initiated 'rejected'.
-- Must live alone in its own migration/transaction: Postgres forbids using a
-- newly added enum value until the transaction that added it has committed.

alter type public.vendor_order_status add value 'cancelled';
