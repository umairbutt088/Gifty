import { supabase } from '@/lib/supabase';
import { notifyRecipientOfDelivery } from '@/lib/recipient-delivery';
import type { VendorOrderStatus, VendorOrderRow, VendorOrderWithGift } from '@/types/vendor';

const ORDER_SELECT = '*, gift:gifts(id, title, image_urls)';

export async function fetchVendorOrders(vendorId: string): Promise<VendorOrderWithGift[]> {
  const { data, error } = await supabase
    .from('vendor_orders')
    .select(ORDER_SELECT)
    .eq('vendor_id', vendorId)
    .is('vendor_deleted_at', null)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as VendorOrderWithGift[];
}

export async function fetchDeletedVendorOrders(vendorId: string): Promise<VendorOrderWithGift[]> {
  const { data, error } = await supabase
    .from('vendor_orders')
    .select(ORDER_SELECT)
    .eq('vendor_id', vendorId)
    .not('vendor_deleted_at', 'is', null)
    .order('vendor_deleted_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as VendorOrderWithGift[];
}

export async function fetchVendorOrderById(orderId: string): Promise<VendorOrderWithGift | null> {
  const { data, error } = await supabase
    .from('vendor_orders')
    .select(ORDER_SELECT)
    .eq('id', orderId)
    .is('vendor_deleted_at', null)
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
    .eq('status', 'new')
    .is('vendor_deleted_at', null);

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
    .is('vendor_deleted_at', null)
    .select('*')
    .single();

  if (!error && data && (status === 'shipped' || status === 'delivered')) {
    void notifyRecipientOfDelivery(orderId, status);
  }

  return {
    data: (data as VendorOrderRow | null) ?? null,
    error: error ? new Error(error.message) : null,
  };
}

export async function softDeleteVendorOrder(orderId: string): Promise<{ error: Error | null }> {
  const { data: order, error: fetchError } = await supabase
    .from('vendor_orders')
    .select('id')
    .eq('id', orderId)
    .is('vendor_deleted_at', null)
    .maybeSingle();

  if (fetchError) {
    return { error: new Error(fetchError.message) };
  }

  if (!order) {
    return { error: new Error('Order not found.') };
  }

  const { error } = await supabase
    .from('vendor_orders')
    .update({ vendor_deleted_at: new Date().toISOString() })
    .eq('id', orderId)
    .is('vendor_deleted_at', null);

  return { error: error ? new Error(error.message) : null };
}

export async function restoreVendorOrder(orderId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('vendor_orders')
    .update({ vendor_deleted_at: null })
    .eq('id', orderId)
    .not('vendor_deleted_at', 'is', null);

  return { error: error ? new Error(error.message) : null };
}

export async function permanentlyDeleteVendorOrder(orderId: string): Promise<{ error: Error | null }> {
  const { data: order, error: fetchError } = await supabase
    .from('vendor_orders')
    .select('id')
    .eq('id', orderId)
    .not('vendor_deleted_at', 'is', null)
    .maybeSingle();

  if (fetchError) {
    return { error: new Error(fetchError.message) };
  }

  if (!order) {
    return { error: new Error('Order not found in deleted list.') };
  }

  const { error } = await supabase
    .from('vendor_orders')
    .delete()
    .eq('id', orderId)
    .not('vendor_deleted_at', 'is', null);

  return { error: error ? new Error(error.message) : null };
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
