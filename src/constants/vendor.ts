import type { GiftCategory, GiftStatus, VendorOrderStatus } from '@/types/vendor';

export const GIFT_CATEGORIES: { value: GiftCategory; label: string }[] = [
  { value: 'flowers', label: 'Flowers' },
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'experience', label: 'Experience' },
  { value: 'custom', label: 'Custom' },
  { value: 'other', label: 'Other' },
];

export const GIFT_STATUS_LABELS: Record<GiftStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending review',
  live: 'Live',
  paused: 'Paused',
  out_of_stock: 'Out of stock',
};

export const ORDER_STATUS_LABELS: Record<VendorOrderStatus, string> = {
  new: 'New',
  accepted: 'Accepted',
  preparing: 'Preparing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  rejected: 'Rejected',
};

export const ORDER_PIPELINE: VendorOrderStatus[] = [
  'new',
  'accepted',
  'preparing',
  'shipped',
  'delivered',
];

export type OrderFilter = VendorOrderStatus | 'all' | 'active' | 'in_transit';

export const ORDER_FILTER_TABS: { value: OrderFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'active', label: 'Active' },
  { value: 'in_transit', label: 'In transit' },
  { value: 'delivered', label: 'Delivered' },
];

export function matchesOrderFilter(
  status: VendorOrderStatus,
  filter: OrderFilter,
): boolean {
  if (filter === 'all') return true;
  if (filter === 'active') return status === 'accepted' || status === 'preparing';
  if (filter === 'in_transit') return status === 'shipped';
  return status === filter;
}
