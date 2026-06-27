import { supabase } from '@/lib/supabase';
import type { VendorOrderStatus, VendorOrderRow, VendorOrderWithGift } from '@/types/vendor';

export async function fetchVendorOrders(vendorId: string): Promise<VendorOrderWithGift[]> {
  const { data, error } = await supabase
    .from('vendor_orders')
    .select('*, gift:gifts(id, title, image_urls)')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as VendorOrderWithGift[];
}

export async function fetchVendorOrderById(orderId: string): Promise<VendorOrderWithGift | null> {
  const { data, error } = await supabase
    .from('vendor_orders')
    .select('*, gift:gifts(id, title, image_urls)')
    .eq('id', orderId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as VendorOrderWithGift;
}

export async function countNewVendorOrders(vendorId: string): Promise<number> {
  const { count, error } = await supabase
    .from('vendor_orders')
    .select('*', { count: 'exact', head: true })
    .eq('vendor_id', vendorId)
    .eq('status', 'new');

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function updateVendorOrderStatus(
  orderId: string,
  status: VendorOrderStatus,
): Promise<{ data: VendorOrderRow | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('vendor_orders')
    .update({ status })
    .eq('id', orderId)
    .select('*')
    .single();

  return {
    data: (data as VendorOrderRow | null) ?? null,
    error: error ? new Error(error.message) : null,
  };
}

export function getVendorEarningsSummary(orders: VendorOrderWithGift[]) {
  const delivered = orders.filter((order) => order.status === 'delivered');
  const totalCents = delivered.reduce((sum, order) => sum + order.total_cents, 0);

  return {
    totalOrders: orders.length,
    deliveredCount: delivered.length,
    pendingCount: orders.filter((order) => !['delivered', 'rejected'].includes(order.status))
      .length,
    totalCents,
  };
}

export function getNextOrderAction(
  status: VendorOrderStatus,
): { label: string; nextStatus: VendorOrderStatus } | null {
  switch (status) {
    case 'new':
      return { label: 'Accept order', nextStatus: 'accepted' };
    case 'accepted':
      return { label: 'Mark preparing', nextStatus: 'preparing' };
    case 'preparing':
      return { label: 'Mark shipped', nextStatus: 'shipped' };
    case 'shipped':
      return { label: 'Mark delivered', nextStatus: 'delivered' };
    default:
      return null;
  }
}
