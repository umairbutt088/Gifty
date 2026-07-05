import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GiftListItem } from '@/components/vendor';
import {
  CardList,
  DashboardHeader,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { fetchLiveGiftsByVendor } from '@/lib/gifts';
import { fetchPublicVendorStore } from '@/lib/vendor-store';
import { getStoreFulfillmentSummary } from '@/lib/vendor-store-helpers';
import type { GiftRow, VendorStorePublic } from '@/types/vendor';

export default function BuyerVendorStoreScreen() {
  const { vendorId } = useLocalSearchParams<{ vendorId: string }>();
  const [store, setStore] = useState<VendorStorePublic | null>(null);
  const [gifts, setGifts] = useState<GiftRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStore = useCallback(async () => {
    if (!vendorId) return;

    setLoading(true);
    const [storeRow, giftRows] = await Promise.all([
      fetchPublicVendorStore(vendorId),
      fetchLiveGiftsByVendor(vendorId),
    ]);
    setStore(storeRow);
    setGifts(giftRows);
    setLoading(false);
  }, [vendorId]);

  useFocusEffect(
    useCallback(() => {
      void loadStore();
    }, [loadStore]),
  );

  if (loading) {
    return (
      <ScreenShell scroll={false}>
        <ThemedActivityIndicator style={{ marginTop: 48 }} />
      </ScreenShell>
    );
  }

  if (!store) {
    return (
      <ScreenShell>
        <DashboardHeader title="Store not found" showBanner={false} showBack backHref="/buyer" />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <DashboardHeader title={store.name} showBanner={false} showBack backHref="/buyer" />

      <View style={styles.headerCard}>
        {store.logo_url ? (
          <Image source={{ uri: store.logo_url }} style={styles.logo} contentFit="cover" />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoPlaceholderText}>{store.name.slice(0, 1).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.headerText}>
          {store.bio ? <Text style={styles.bio}>{store.bio}</Text> : null}
          <Text style={styles.cities}>{getStoreFulfillmentSummary(store)}</Text>
        </View>
      </View>

      <SectionTitle>Gifts from this store</SectionTitle>

      {gifts.length === 0 ? (
        <Text style={styles.empty}>No live gifts right now.</Text>
      ) : (
        <CardList>
          {gifts.map((gift) => (
            <GiftListItem
              key={gift.id}
              gift={gift}
              href={`/buyer/gift/${gift.id}`}
              showStatus={false}
            />
          ))}
        </CardList>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Spacing.four,
    backgroundColor: Colors.surface,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: Spacing.three,
  },
  logoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceNested,
  },
  logoPlaceholderText: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
    gap: Spacing.two,
  },
  bio: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  cities: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  empty: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
