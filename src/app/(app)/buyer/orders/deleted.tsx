import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';

import {
  DashboardHeader,
  EmptyState,
  ScreenShell,
} from '@/components/dashboard';
import { SwipeableDeletedOrderListItem } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { fetchDeletedBuyerOrders, restoreBuyerOrder } from '@/lib/buyer-orders';
import { useAuth } from '@/providers/auth-provider';

export default function BuyerDeletedOrdersScreen() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof fetchDeletedBuyerOrders>>>([]);
  const [loading, setLoading] = useState(true);

  const loadDeletedOrders = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    const rows = await fetchDeletedBuyerOrders(profile.id);
    setOrders(rows);
    setLoading(false);
  }, [profile]);

  const { refreshControl } = usePullToRefresh(loadDeletedOrders);

  useFocusEffect(
    useCallback(() => {
      void loadDeletedOrders();
    }, [loadDeletedOrders]),
  );

  async function handleRestoreOrder(orderId: string) {
    const { error } = await restoreBuyerOrder(orderId);

    if (error) {
      Alert.alert('Could not restore', error.message);
      return;
    }

    setOrders((current) => current.filter((order) => order.id !== orderId));
  }

  return (
    <ScreenShell scrollProps={{ refreshControl }}>
      <DashboardHeader
        title="Deleted orders"
        subtitle="Swipe left to restore orders you removed from your history."
        role={profile?.role}
        showBack
        backHref="/buyer/orders"
      />

      {loading ? (
        <View style={{ paddingVertical: 24 }}>
          <ThemedActivityIndicator />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No deleted orders"
          message="Orders you remove from your list will appear here so you can restore them."
        />
      ) : (
        orders.map((order) => (
          <SwipeableDeletedOrderListItem
            key={order.id}
            order={order}
            deletedAt={order.buyer_deleted_at}
            onRestore={handleRestoreOrder}
          />
        ))
      )}
    </ScreenShell>
  );
}
