import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Colors } from '@/constants/colors';
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
  const imageUrl = gift.image_urls[0];
  const vendorInitial = (vendorName ?? 'S').slice(0, 1).toUpperCase();

  const content = (
    <GlassCard style={styles.card}>
      <View style={styles.imageColumn}>
        <View style={styles.imageWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Gift</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {gift.title}
        </Text>

        <View style={styles.vendorRow}>
          {vendorLogoUrl ? (
            <Image source={{ uri: vendorLogoUrl }} style={styles.vendorLogo} contentFit="cover" />
          ) : (
            <View style={styles.vendorLogoPlaceholder}>
              <Text style={styles.vendorLogoInitial}>{vendorInitial}</Text>
            </View>
          )}
          <Text style={styles.vendorName} numberOfLines={1}>
            {vendorName ?? 'Store'}
          </Text>
        </View>

        <Text style={styles.price}>{formatMoney(gift.price_cents)}</Text>
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
    justifyContent: 'center',
  },
  title: {
    color: Colors.text,
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
    backgroundColor: Colors.surfaceNested,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  vendorLogoInitial: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  vendorName: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  price: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
