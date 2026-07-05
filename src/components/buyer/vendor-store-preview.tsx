import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { getStoreFulfillmentSummary } from '@/lib/vendor-store-helpers';
import type { VendorStorePublic } from '@/types/vendor';

type VendorStorePreviewProps = {
  store: VendorStorePublic;
  compact?: boolean;
};

export function VendorStorePreview({ store, compact = false }: VendorStorePreviewProps) {
  function openStore() {
    router.push(`/buyer/store/${store.vendor_id}`);
  }

  return (
    <GlassCard style={styles.card}>
      <View style={styles.row}>
        {store.logo_url ? (
          <Image source={{ uri: store.logo_url }} style={styles.logo} contentFit="cover" />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoPlaceholderText}>{store.name.slice(0, 1).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.text}>
          <Text style={styles.name}>{store.name}</Text>
          {store.bio && !compact ? (
            <Text style={styles.bio} numberOfLines={2}>
              {store.bio}
            </Text>
          ) : null}
          <Text style={styles.cities} numberOfLines={compact ? 1 : 2}>
            {getStoreFulfillmentSummary(store)}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`View ${store.name} store details`}
        onPress={openStore}
        style={({ pressed }) => [styles.linkRow, pressed && styles.linkPressed]}>
        <Text style={styles.link}>View store</Text>
        <Text style={styles.linkArrow}>→</Text>
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
    backgroundColor: Colors.surfaceNested,
  },
  logoPlaceholderText: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    gap: Spacing.one,
  },
  name: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  bio: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  cities: {
    color: Colors.textMuted,
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
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  linkArrow: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
});
