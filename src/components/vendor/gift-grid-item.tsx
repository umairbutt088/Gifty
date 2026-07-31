import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { StatusBadge } from '@/components/vendor/status-badge';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { GiftRow } from '@/types/vendor';

type VendorGiftGridItemProps = {
  gift: GiftRow;
  href?: Href;
  showStatus?: boolean;
};

export function VendorGiftGridItem({ gift, href, showStatus = true }: VendorGiftGridItemProps) {
  const colors = useColors();
  const imageUrl = gift.image_urls[0];

  const content = (
    <GlassCard style={styles.card}>
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceNested }]}>
            <Text style={[styles.imagePlaceholderText, { color: colors.textMuted }]}>Gift</Text>
          </View>
        )}
      </View>

      <View style={styles.meta}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {gift.title}
        </Text>

        <View style={styles.footer}>
          {showStatus ? <StatusBadge status={gift.status} kind="gift" /> : null}
          <Text style={[styles.price, { color: colors.text }]} numberOfLines={1}>
            {formatMoney(gift.price_cents)}
          </Text>
        </View>

        <Text style={[styles.stock, { color: colors.textSecondary }]} numberOfLines={1}>
          {gift.stock} in stock
        </Text>
      </View>
    </GlassCard>
  );

  if (!href) {
    return content;
  }

  return (
    <Pressable
      onPress={() => router.push(href)}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  pressed: {
    opacity: 0.92,
  },
  card: {
    gap: Spacing.two,
  },
  meta: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.two,
  },
  imageWrap: {
    // Bleed under GlassCard's 1px border so the image meets the outer edge.
    marginTop: -1,
    marginHorizontal: -1,
    height: 109,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  price: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  stock: {
    fontSize: 12,
    fontWeight: '600',
  },
});
