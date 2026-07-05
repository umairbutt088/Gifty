import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { GiftRow } from '@/types/vendor';

type GiftGridItemProps = {
  gift: GiftRow;
  href?: Href;
  vendorLogoUrl?: string | null;
  vendorName?: string;
};

export function GiftGridItem({
  gift,
  href,
  vendorLogoUrl,
  vendorName,
}: GiftGridItemProps) {
  const colors = useColors();
  const imageUrl = gift.image_urls[0];
  const vendorInitial = (vendorName ?? 'S').slice(0, 1).toUpperCase();

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
          {vendorLogoUrl ? (
            <Image source={{ uri: vendorLogoUrl }} style={styles.vendorLogo} contentFit="cover" />
          ) : (
            <View style={[styles.vendorLogoPlaceholder, { backgroundColor: colors.surfaceNested, borderColor: colors.surfaceBorder }]}>
              <Text style={[styles.vendorLogoInitial, { color: colors.text }]}>{vendorInitial}</Text>
            </View>
          )}
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
    padding: Spacing.two,
  },
  meta: {
    gap: Spacing.one,
  },
  imageWrap: {
    width: '100%',
    height: 108,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
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
  vendorLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  vendorLogoPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  vendorLogoInitial: {
    fontSize: 10,
    fontWeight: '700',
  },
  price: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  stock: {
    fontSize: 12,
    fontWeight: '600',
  },
});
