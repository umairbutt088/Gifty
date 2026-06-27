import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { StatusBadge } from '@/components/vendor/status-badge';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { VendorOrderWithGift } from '@/types/vendor';

type OrderListItemProps = {
  order: VendorOrderWithGift;
  href?: Href;
};

function OrderCard({ order }: { order: VendorOrderWithGift }) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.giftTitle} numberOfLines={1}>
          {order.gift?.title ?? 'Gift order'}
        </Text>
        <StatusBadge status={order.status} kind="order" />
      </View>

      <Text style={styles.recipient}>For {order.recipient_name}</Text>
      <Text style={styles.meta}>
        {formatMoney(order.total_cents)} · Qty {order.quantity}
        {order.delivery_date ? ` · ${order.delivery_date}` : ''}
      </Text>
      {order.gift_message ? (
        <Text style={styles.message} numberOfLines={2}>
          “{order.gift_message}”
        </Text>
      ) : null}
    </GlassCard>
  );
}

export function OrderListItem({ order, href }: OrderListItemProps) {
  if (!href) {
    return <OrderCard order={order} />;
  }

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
        <OrderCard order={order} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  giftTitle: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  recipient: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  meta: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
