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
import {
  fetchDeletedVendorOrders,
  permanentlyDeleteVendorOrder,
  restoreVendorOrder,
} from '@/lib/vendor-orders';
import { useAuth } from '@/providers/auth-provider';

export default function VendorDeletedOrdersScreen() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof fetchDeletedVendorOrders>>>([]);
  const [loading, setLoading] = useState(true);

  const loadDeletedOrders = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    const rows = await fetchDeletedVendorOrders(profile.id);
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
    const { error } = await restoreVendorOrder(orderId);

    if (error) {
      Alert.alert('Could not restore', error.message);
      return;
    }

    setOrders((current) => current.filter((order) => order.id !== orderId));
  }

  async function handlePermanentDeleteOrder(orderId: string) {
    const { error } = await permanentlyDeleteVendorOrder(orderId);

    if (error) {
      Alert.alert('Could not delete', error.message);
      return;
    }

    setOrders((current) => current.filter((order) => order.id !== orderId));
  }

  return (
    <ScreenShell scrollProps={{ refreshControl }}>
      <DashboardHeader
        title="Deleted orders"
        subtitle="Swipe left to restore or permanently delete. Chat history is removed on permanent delete."
        role={profile?.role}
        showBack
        backHref="/vendor/orders"
      />

      {loading ? (
        <View style={{ paddingVertical: 24 }}>
          <ThemedActivityIndicator />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No deleted orders"
          message="Orders you delete will appear here so you can restore them later."
        />
      ) : (
        orders.map((order) => (
          <SwipeableDeletedOrderListItem
            key={order.id}
            order={order}
            deletedAt={order.vendor_deleted_at}
            onRestore={handleRestoreOrder}
            onDeletePermanently={handlePermanentDeleteOrder}
          />
        ))
      )}
    </ScreenShell>
  );
}
