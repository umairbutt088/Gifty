import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { BuyerGiftGridView, BuyerGiftListView } from '@/components/buyer';
import { DashboardHeader, EmptyState, ScreenShell } from '@/components/dashboard';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { useListRefresh } from '@/hooks/use-list-refresh';
import { fetchLiveGifts } from '@/lib/gifts';
import { fetchPublicVendorStores } from '@/lib/vendor-store';
import { useAuth } from '@/providers/auth-provider';
import type { VendorStorePublic } from '@/types/vendor';

export default function BuyerGiftsTabScreen() {
  const { profile } = useAuth();
  const [vendorStores, setVendorStores] = useState<Map<string, VendorStorePublic>>(new Map());

  const loadGifts = useCallback(async () => {
    const gifts = await fetchLiveGifts();
    const vendorIds = [...new Set(gifts.map((gift) => gift.vendor_id))];
    const stores = await fetchPublicVendorStores(vendorIds);
    setVendorStores(stores);
    return gifts;
  }, []);

  const { items: gifts, loading, refreshControl } = useListRefresh({
    load: loadGifts,
  });

  const GiftView = BuyerGiftGridView;
  // const GiftView = BuyerGiftListView;

  return (
    <ScreenShell scrollProps={{ refreshControl }}>
      <DashboardHeader title="Discover gifts" variant="tab" role={profile?.role} />

      {loading ? (
        <View style={{ paddingVertical: 24 }}>
          <ThemedActivityIndicator />
        </View>
      ) : gifts.length === 0 ? (
        <EmptyState
          title="No gifts available yet"
          message="When vendors publish live gifts, they will appear here for you to browse and send."
        />
      ) : (
        <GiftView gifts={gifts} vendorStores={vendorStores} />
      )}
    </ScreenShell>
  );
}
