import { useCallback } from 'react';
import { Alert, View } from 'react-native';

import {
  DashboardHeader,
  EmptyState,
  ScreenShell,
} from '@/components/dashboard';
import { SwipeableDeletedGiftListItem } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { useListRefresh } from '@/hooks/use-list-refresh';
import { fetchDeletedVendorGifts, permanentlyDeleteGift, restoreGift } from '@/lib/gifts';
import { useAuth } from '@/providers/auth-provider';

export default function VendorDeletedGiftsScreen() {
  const { profile } = useAuth();

  const loadDeletedGifts = useCallback(async () => {
    if (!profile) return [];
    return fetchDeletedVendorGifts(profile.id);
  }, [profile]);

  const { items: gifts, setItems: setGifts, loading, refreshControl } = useListRefresh({
    enabled: Boolean(profile),
    load: loadDeletedGifts,
  });

  async function handleRestoreGift(giftId: string) {
    const { error } = await restoreGift(giftId);

    if (error) {
      Alert.alert('Could not restore', error.message);
      return;
    }

    setGifts((current) => current.filter((gift) => gift.id !== giftId));
  }

  async function handlePermanentDeleteGift(giftId: string) {
    const { error } = await permanentlyDeleteGift(giftId);

    if (error) {
      Alert.alert('Could not delete', error.message);
      return;
    }

    setGifts((current) => current.filter((gift) => gift.id !== giftId));
  }

  return (
    <ScreenShell scrollProps={{ refreshControl }}>
      <DashboardHeader
        title="Deleted gifts"
        subtitle="Swipe left to restore or permanently delete. Photos are removed only on permanent delete."
        role={profile?.role}
        showBack
        backHref="/vendor"
      />

      {loading ? (
        <View style={{ paddingVertical: 24 }}>
          <ThemedActivityIndicator />
        </View>
      ) : gifts.length === 0 ? (
        <EmptyState
          title="No deleted gifts"
          message="Gifts you delete will appear here so you can restore them later."
        />
      ) : (
        gifts.map((gift) => (
          <SwipeableDeletedGiftListItem
            key={gift.id}
            gift={gift}
            onRestore={handleRestoreGift}
            onDeletePermanently={handlePermanentDeleteGift}
          />
        ))
      )}
    </ScreenShell>
  );
}
