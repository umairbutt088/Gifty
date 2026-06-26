import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { GIFT_STATUS_LABELS, ORDER_STATUS_LABELS } from '@/constants/vendor';
import { Spacing } from '@/constants/theme';
import type { GiftStatus, VendorOrderStatus } from '@/types/vendor';

type StatusBadgeProps = {
  status: GiftStatus | VendorOrderStatus;
  kind?: 'gift' | 'order';
};

const ORDER_TONE: Partial<Record<VendorOrderStatus, string>> = {
  new: '#5B8DEF',
  accepted: '#7C6CF0',
  preparing: '#E8A838',
  shipped: '#4ECDC4',
  delivered: '#6BCB77',
  rejected: '#E05D5D',
};

const GIFT_TONE: Partial<Record<GiftStatus, string>> = {
  draft: '#8E9196',
  pending_review: '#E8A838',
  live: '#6BCB77',
  paused: '#7C6CF0',
  out_of_stock: '#E05D5D',
};

export function StatusBadge({ status, kind = 'gift' }: StatusBadgeProps) {
  const label = kind === 'order' ? ORDER_STATUS_LABELS[status as VendorOrderStatus] : GIFT_STATUS_LABELS[status as GiftStatus];
  const tone =
    kind === 'order'
      ? ORDER_TONE[status as VendorOrderStatus] ?? Colors.accent
      : GIFT_TONE[status as GiftStatus] ?? Colors.accent;

  return (
    <View style={[styles.badge, { backgroundColor: `${tone}22`, borderColor: `${tone}66` }]}>
      <Text style={[styles.label, { color: tone }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
