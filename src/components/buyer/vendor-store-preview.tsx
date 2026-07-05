import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { getStoreFulfillmentSummary } from '@/lib/vendor-store-helpers';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { VendorStorePublic } from '@/types/vendor';

type VendorStorePreviewProps = {
  store: VendorStorePublic;
  compact?: boolean;
};

export function VendorStorePreview({ store, compact = false }: VendorStorePreviewProps) {
  const colors = useColors();
  const theme = useScreenTheme();

  function openStore() {
    router.push(`/buyer/store/${store.vendor_id}`);
  }

  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        {store.logo_url ? (
          <Image source={{ uri: store.logo_url }} style={styles.logo} contentFit="cover" />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: colors.surfaceNested }]}>
            <Text style={[styles.logoPlaceholderText, { color: colors.text }]}>
              {store.name.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.text}>
          <Text style={[styles.name, { color: colors.text }]}>{store.name}</Text>
          {store.bio && !compact ? (
            <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={2}>
              {store.bio}
            </Text>
          ) : null}
          <Text style={[styles.cities, { color: colors.textMuted }]} numberOfLines={compact ? 1 : 2}>
            {getStoreFulfillmentSummary(store)}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`View ${store.name} store details`}
        onPress={openStore}
        style={({ pressed }) => [styles.linkRow, pressed && styles.linkPressed]}>
        <Text style={[styles.link, { color: theme.accent }]}>View store</Text>
        <Text style={[styles.linkArrow, { color: theme.accent }]}>→</Text>
      </Pressable>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: Spacing.three,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholderText: {
    fontSize: 22,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    gap: Spacing.one,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
  },
  cities: {
    fontSize: 12,
    lineHeight: 18,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.one,
  },
  linkPressed: {
    opacity: 0.75,
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
  },
  linkArrow: {
    fontSize: 15,
    fontWeight: '600',
  },
});
