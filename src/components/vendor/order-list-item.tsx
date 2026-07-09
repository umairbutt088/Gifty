import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { StatusBadge } from '@/components/vendor/status-badge';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { formatDeliveryDateLabel, formatMoney } from '@/lib/format';
import type { VendorOrderWithGift } from '@/types/vendor';

type OrderListItemProps = {
  order: VendorOrderWithGift;
  href?: Href;
  deleted?: boolean;
  deletedAt?: string | null;
};

function formatDeletedDate(value: string | null | undefined): string {
  if (!value) return 'Recently deleted';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function OrderMetaBullet({
  label,
  value,
  italic = false,
}: {
  label: string;
  value: string;
  italic?: boolean;
}) {
  const colors = useColors();

  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bulletLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text
        style={[
          styles.bulletValue,
          { color: colors.text },
          italic && { color: colors.textSecondary, fontStyle: 'italic', fontWeight: '500' },
        ]}
        numberOfLines={1}
        ellipsizeMode="tail">
        {value}
      </Text>
    </View>
  );
}

function OrderCard({ order, deleted = false, deletedAt }: OrderListItemProps) {
  const colors = useColors();
  const imageUrl = order.gift?.image_urls[0];

  return (
    <GlassCard style={[styles.card, deleted && styles.cardDeleted]}>
      <View style={styles.imageColumn}>
        <View style={[styles.imageWrap, { backgroundColor: colors.surfaceNested }]}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: colors.surfaceNested }]}>
              <Text style={[styles.placeholderText, { color: colors.textMuted }]}>Gift</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {order.gift?.title ?? 'Gift order'}
          </Text>
          {!deleted ? <StatusBadge status={order.status} kind="order" /> : null}
        </View>

        {!deleted && order.status === 'new' && order.sla_escalated_at ? (
          <View style={styles.overdueBadge}>
            <Text style={styles.overdueText}>Overdue — respond soon</Text>
          </View>
        ) : null}

        <View style={styles.details}>
          {deleted ? (
            <>
              <OrderMetaBullet label="Deleted" value={formatDeletedDate(deletedAt)} />
              <OrderMetaBullet label="Recipient" value={order.recipient_name} />
              <OrderMetaBullet label="Price" value={formatMoney(order.total_cents)} />
            </>
          ) : (
            <>
              <OrderMetaBullet label="Recipient" value={order.recipient_name} />
              <OrderMetaBullet label="Price" value={formatMoney(order.total_cents)} />
              <OrderMetaBullet label="Qty" value={String(order.quantity)} />
              {order.delivery_date ? (
                <OrderMetaBullet
                  label="Delivery"
                  value={formatDeliveryDateLabel(order.delivery_date)}
                />
              ) : null}
            </>
          )}
        </View>

        {!deleted && order.gift_message ? (
          <OrderMetaBullet label="Message" value={`"${order.gift_message}"`} italic />
        ) : null}
      </View>
    </GlassCard>
  );
}

export function OrderListItem({ order, href, deleted = false, deletedAt }: OrderListItemProps) {
  if (deleted || !href) {
    return <OrderCard order={order} deleted={deleted} deletedAt={deletedAt} />;
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
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardDeleted: {
    opacity: 0.92,
  },
  pressed: {
    opacity: 0.92,
  },
  imageColumn: {
    width: 88,
    alignSelf: 'stretch',
  },
  imageWrap: {
    flex: 1,
    width: 88,
    minHeight: 88,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  details: {
    gap: Spacing.one,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  bulletLabel: {
    fontSize: 13,
    lineHeight: 20,
    minWidth: 72,
  },
  bulletValue: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  overdueBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#E05D5D22',
  },
  overdueText: {
    color: '#E05D5D',
    fontSize: 11,
    fontWeight: '700',
  },
});
