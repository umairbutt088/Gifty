import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BuyerGiftGridView, BuyerGiftListView } from '@/components/buyer';
import {
  DashboardHeader,
  InfoRow,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { GlassCard } from '@/components/glass-card';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import { formatDeliveryCities, formatMoney } from '@/lib/format';
import { fetchLiveGiftsByVendor } from '@/lib/gifts';
import { fetchPublicVendorStore } from '@/lib/vendor-store';
import { formatDeliveryRadiusKm } from '@/lib/vendor-store-helpers';
import type { GiftRow, VendorStorePublic } from '@/types/vendor';

export default function BuyerVendorStoreScreen() {
  const router = useRouter();
  const { vendorId } = useLocalSearchParams<{ vendorId: string }>();
  const colors = useColors();
  const theme = useScreenTheme();
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
        <DashboardHeader
          title="Store not found"
          showBanner={false}
          showBack
          onBack={() => router.back()}
        />
      </ScreenShell>
    );
  }

  const GiftView = BuyerGiftGridView;
  // const GiftView = BuyerGiftListView;
  const vendorStores = new Map([[store.vendor_id, store]]);

  return (
    <ScreenShell>
      <DashboardHeader
        title={store.name}
        showBanner={false}
        showBack
        onBack={() => router.back()}
      />

      <View
        style={[
          styles.heroCard,
          { borderColor: theme.surfaceBorder, backgroundColor: theme.surface },
        ]}>
        {store.logo_url ? (
          <Image source={{ uri: store.logo_url }} style={styles.heroLogo} contentFit="cover" />
        ) : (
          <View style={[styles.heroLogoPlaceholder, { backgroundColor: colors.surfaceNested }]}>
            <Text style={[styles.heroLogoPlaceholderText, { color: colors.text }]}>
              {store.name.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <SectionTitle>About</SectionTitle>
      <GlassCard style={styles.detailCard}>
        <Text style={[styles.bio, { color: colors.textSecondary }]}>
          {store.bio?.trim() || 'This vendor has not added a store bio yet.'}
        </Text>
      </GlassCard>

      <SectionTitle>Fulfillment</SectionTitle>
      <GlassCard style={styles.detailCard}>
        <InfoRow
          label="Order type"
          value={store.offers_delivery ? 'Delivery available' : 'Pickup / takeaway'}
        />
        {store.offers_delivery && store.delivery_radius_km != null && store.delivery_radius_km > 0 ? (
          <InfoRow
            label="Delivery radius"
            value={formatDeliveryRadiusKm(store.delivery_radius_km)}
          />
        ) : null}
        {store.offers_delivery && store.delivery_charge_cents != null ? (
          <InfoRow
            label="Delivery fee"
            value={
              store.delivery_charge_cents > 0
                ? formatMoney(store.delivery_charge_cents)
                : 'Free delivery'
            }
          />
        ) : null}
        {store.offers_delivery && store.delivery_cities.length > 0 ? (
          <InfoRow
            label="Delivery cities"
            value={formatDeliveryCities(store.delivery_cities)}
            multiline
          />
        ) : null}
        {!store.offers_delivery ? (
          <Text style={[styles.pickupNote, { color: colors.textMuted }]}>
            Collect your order directly from this vendor. No delivery address is required at
            checkout.
          </Text>
        ) : null}
      </GlassCard>

      <SectionTitle>Gifts from this store</SectionTitle>

      {gifts.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>No live gifts right now.</Text>
      ) : (
        <GiftView gifts={gifts} vendorStores={vendorStores} />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  heroLogo: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  heroLogoPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogoPlaceholderText: {
    fontSize: 48,
    fontWeight: '700',
  },
  detailCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
  },
  pickupNote: {
    fontSize: 13,
    lineHeight: 18,
  },
  empty: {
    fontSize: 14,
  },
});
