import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { StatusBadge } from '@/components/vendor/status-badge';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { GIFT_CATEGORIES } from '@/constants/vendor';
import { formatMoney } from '@/lib/format';
import type { GiftRow } from '@/types/vendor';

type GiftListItemProps = {
  gift: GiftRow;
  href?: Href;
  deleted?: boolean;
  showStatus?: boolean;
};

function formatDeletedDate(value: string | null): string {
  if (!value) return 'Recently deleted';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function GiftMetaBullet({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletLabel}>{label}</Text>
      <Text style={styles.bulletValue}>{value}</Text>
    </View>
  );
}

export function GiftListItem({ gift, href, deleted = false, showStatus = true }: GiftListItemProps) {
  const categoryLabel =
    GIFT_CATEGORIES.find((item) => item.value === gift.category)?.label ?? gift.category;
  const imageUrl = gift.image_urls[0];

  const content = (
    <GlassCard style={[styles.card, deleted && styles.cardDeleted]}>
      <View style={styles.imageColumn}>
        <View style={styles.imageWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>{deleted ? 'No photos' : 'Gift'}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {gift.title}
          </Text>
          {!deleted && showStatus ? <StatusBadge status={gift.status} kind="gift" /> : null}
        </View>
        <View style={styles.details}>
          {deleted ? (
            <>
              <GiftMetaBullet label="Deleted" value={formatDeletedDate(gift.deleted_at)} />
              <GiftMetaBullet label="Price" value={formatMoney(gift.price_cents)} />
            </>
          ) : (
            <>
              <GiftMetaBullet label="Price" value={formatMoney(gift.price_cents)} />
              <GiftMetaBullet label="Category" value={categoryLabel} />
              <GiftMetaBullet
                label="Stock"
                value={showStatus ? `${gift.stock} in stock` : `${gift.stock} left`}
              />
            </>
          )}
        </View>
      </View>
    </GlassCard>
  );

  if (deleted || !href) {
    return <View>{content}</View>;
  }

  return (
    <Pressable onPress={() => router.push(href)} style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
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
    justifyContent: 'center',
  },
  imageWrap: {
    width: 88,
    height: 88,
    borderRadius: Spacing.three,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceNested,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceNested,
  },
  placeholderText: {
    color: Colors.textMuted,
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
    color: Colors.text,
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
  bullet: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  bulletLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    minWidth: 64,
  },
  bulletValue: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
});
