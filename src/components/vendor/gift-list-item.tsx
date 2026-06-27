import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { StatusBadge } from '@/components/vendor/status-badge';
import { GIFT_CATEGORIES } from '@/constants/vendor';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { GiftRow } from '@/types/vendor';

type GiftListItemProps = {
  gift: GiftRow;
  href?: Href;
  deleted?: boolean;
};

function formatDeletedDate(value: string | null): string {
  if (!value) return 'Recently deleted';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function GiftListItem({ gift, href, deleted = false }: GiftListItemProps) {
  const categoryLabel =
    GIFT_CATEGORIES.find((item) => item.value === gift.category)?.label ?? gift.category;
  const imageUrl = gift.image_urls[0];

  const content = (
    <GlassCard style={[styles.card, deleted && styles.cardDeleted]}>
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{deleted ? 'No photos' : 'Gift'}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {gift.title}
          </Text>
          {!deleted ? <StatusBadge status={gift.status} kind="gift" /> : null}
        </View>
        <Text style={styles.meta}>
          {deleted
            ? `Deleted ${formatDeletedDate(gift.deleted_at)} · ${formatMoney(gift.price_cents)}`
            : `${formatMoney(gift.price_cents)} · ${categoryLabel} · Stock ${gift.stock}`}
        </Text>
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
    alignItems: 'center',
    padding: Spacing.two,
    gap: Spacing.two,
  },
  cardDeleted: {
    opacity: 0.92,
  },
  pressed: {
    opacity: 0.92,
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: Spacing.two,
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
    paddingVertical: Spacing.one,
    gap: Spacing.two,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
