import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { DashboardHeader, EmptyState, ScreenShell } from '@/components/dashboard';
import { OrderListItem } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { fetchBuyerOrders } from '@/lib/buyer-orders';
import { useAuth } from '@/providers/auth-provider';

export default function BuyerOrdersTabScreen() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof fetchBuyerOrders>>>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    const rows = await fetchBuyerOrders(profile.id);
    setOrders(rows);
    setLoading(false);
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      void loadOrders();
    }, [loadOrders]),
  );

  return (
    <ScreenShell>
      <DashboardHeader
        title="My orders"
        subtitle="Track purchases and delivery status."
        role={profile?.role}
      />

      {loading ? (
        <View style={{ paddingVertical: 24 }}>
          <ThemedActivityIndicator />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          message="When you buy a gift, order history and tracking will show up on this screen."
        />
      ) : (
        orders.map((order) => <OrderListItem key={order.id} order={order} />)
      )}
    </ScreenShell>
  );
}
