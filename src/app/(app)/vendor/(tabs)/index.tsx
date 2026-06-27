import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert, View } from 'react-native';

import {
  DashboardHeader,
  EmptyState,
  MenuRow,
  PrimaryButton,
  ScreenShell,
} from '@/components/dashboard';
import { SwipeableGiftListItem } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { useListRefresh } from '@/hooks/use-list-refresh';
import { softDeleteGift, fetchVendorGifts } from '@/lib/gifts';
import { useAuth } from '@/providers/auth-provider';

export default function VendorGiftsScreen() {
  const { profile } = useAuth();

  const loadGifts = useCallback(async () => {
    if (!profile) return [];
    return fetchVendorGifts(profile.id);
  }, [profile]);

  const { items: gifts, setItems: setGifts, loading, refreshControl } = useListRefresh({
    enabled: Boolean(profile),
    load: loadGifts,
  });

  async function handleDeleteGift(giftId: string) {
    const { error } = await softDeleteGift(giftId);

    if (error) {
      Alert.alert('Could not delete', error.message);
      return;
    }

    setGifts((current) => current.filter((gift) => gift.id !== giftId));
  }

  return (
    <ScreenShell scrollProps={{ refreshControl }}>
      <DashboardHeader
        title="Gifts"
        subtitle="List gifts with photos, price, category, and stock for buyers to send."
        role={profile?.role}
      />

      <PrimaryButton label="Add gift" onPress={() => router.push('/vendor/gift/new')} />
      <MenuRow
        title="Deleted gifts"
        description="View and restore removed listings"
        href="/vendor/gifts/deleted"
      />

      {loading ? (
        <View style={{ paddingVertical: 24 }}>
          <ThemedActivityIndicator />
        </View>
      ) : gifts.length === 0 ? (
        <EmptyState
          title="No gifts listed yet"
          message="Create your first gift listing with photos, price, category, and stock."
        />
      ) : (
        gifts.map((gift) => (
          <SwipeableGiftListItem
            key={gift.id}
            gift={gift}
            href={`/vendor/gift/${gift.id}`}
            onDelete={handleDeleteGift}
          />
        ))
      )}
    </ScreenShell>
  );
}
