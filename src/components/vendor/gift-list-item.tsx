import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
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
  href: Href;
};

export function GiftListItem({ gift, href }: GiftListItemProps) {
  const categoryLabel =
    GIFT_CATEGORIES.find((item) => item.value === gift.category)?.label ?? gift.category;
  const imageUrl = gift.image_urls[0];

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
        <GlassCard style={styles.card}>
          <View style={styles.imageWrap}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Gift</Text>
              </View>
            )}
          </View>

          <View style={styles.body}>
            <View style={styles.topRow}>
              <Text style={styles.title} numberOfLines={1}>
                {gift.title}
              </Text>
              <StatusBadge status={gift.status} kind="gift" />
            </View>
            <Text style={styles.meta}>
              {formatMoney(gift.price_cents)} · {categoryLabel} · Stock {gift.stock}
            </Text>
          </View>
        </GlassCard>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
  },
  imageWrap: {
    width: 88,
    height: 88,
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
    padding: Spacing.three,
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
