import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import {
  DashboardHeader,
  EmptyState,
  PrimaryButton,
  ScreenShell,
} from '@/components/dashboard';
import { GiftListItem } from '@/components/vendor';
import { Colors } from '@/constants/colors';
import { fetchVendorGifts } from '@/lib/gifts';
import { useAuth } from '@/providers/auth-provider';

export default function VendorGiftsScreen() {
  const { profile } = useAuth();
  const [gifts, setGifts] = useState<Awaited<ReturnType<typeof fetchVendorGifts>>>([]);
  const [loading, setLoading] = useState(true);

  const loadGifts = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    const rows = await fetchVendorGifts(profile.id);
    setGifts(rows);
    setLoading(false);
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      void loadGifts();
    }, [loadGifts]),
  );

  return (
    <ScreenShell>
      <DashboardHeader
        title="Gifts"
        subtitle="List gifts with photos, price, category, and stock for buyers to send."
        role={profile?.role}
      />

      <PrimaryButton label="Add gift" onPress={() => router.push('/vendor/gift/new')} />

      {loading ? (
        <View style={{ paddingVertical: 24 }}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : gifts.length === 0 ? (
        <EmptyState
          title="No gifts listed yet"
          message="Create your first gift listing with photos, price, category, and stock."
        />
      ) : (
        gifts.map((gift) => (
          <GiftListItem key={gift.id} gift={gift} href={`/vendor/gift/${gift.id}`} />
        ))
      )}
    </ScreenShell>
  );
}
