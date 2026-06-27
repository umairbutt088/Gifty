import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { DashboardHeader, EmptyState, ScreenShell } from '@/components/dashboard';
import { GiftListItem } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { fetchLiveGifts } from '@/lib/gifts';
import { useAuth } from '@/providers/auth-provider';

export default function BuyerGiftsTabScreen() {
  const { profile } = useAuth();
  const [gifts, setGifts] = useState<Awaited<ReturnType<typeof fetchLiveGifts>>>([]);
  const [loading, setLoading] = useState(true);

  const loadGifts = useCallback(async () => {
    setLoading(true);
    const rows = await fetchLiveGifts();
    setGifts(rows);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadGifts();
    }, [loadGifts]),
  );

  return (
    <ScreenShell>
      <DashboardHeader
        title="Discover gifts"
        subtitle="Browse live gifts from vendors and tap to view details."
        role={profile?.role}
      />

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
        gifts.map((gift) => (
          <GiftListItem
            key={gift.id}
            gift={gift}
            href={`/buyer/gift/${gift.id}`}
            showStatus={false}
          />
        ))
      )}
    </ScreenShell>
  );
}
