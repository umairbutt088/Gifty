import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { GiftRow } from '@/types/vendor';

type BuyerGiftListItemProps = {
  gift: GiftRow;
  href?: Href;
  vendorLogoUrl?: string | null;
  vendorName?: string;
};

export function BuyerGiftListItem({
  gift,
  href,
  vendorLogoUrl,
  vendorName,
}: BuyerGiftListItemProps) {
  const colors = useColors();
  const imageUrl = gift.image_urls[0];
  const vendorInitial = (vendorName ?? 'S').slice(0, 1).toUpperCase();

  const content = (
    <GlassCard style={styles.card}>
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
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {gift.title}
        </Text>

        <View style={styles.vendorRow}>
          {vendorLogoUrl ? (
            <Image source={{ uri: vendorLogoUrl }} style={styles.vendorLogo} contentFit="cover" />
          ) : (
            <View
              style={[
                styles.vendorLogoPlaceholder,
                { backgroundColor: colors.surfaceNested, borderColor: colors.surfaceBorder },
              ]}>
              <Text style={[styles.vendorLogoInitial, { color: colors.text }]}>{vendorInitial}</Text>
            </View>
          )}
          <Text style={[styles.vendorName, { color: colors.textSecondary }]} numberOfLines={1}>
            {vendorName ?? 'Store'}
          </Text>
        </View>

        <Text style={[styles.price, { color: colors.text }]}>{formatMoney(gift.price_cents)}</Text>
      </View>
    </GlassCard>
  );

  if (!href) {
    return content;
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  vendorLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  vendorLogoPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  vendorLogoInitial: {
    fontSize: 10,
    fontWeight: '700',
  },
  vendorName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
  },
});
