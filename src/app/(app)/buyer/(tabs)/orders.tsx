import { View, Alert } from 'react-native';

import { DashboardHeader, EmptyState, MenuRow, ScreenShell } from '@/components/dashboard';
import { SwipeableOrderListItem } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { useBuyerOrdersList } from '@/hooks/use-buyer-orders-list';
import { softDeleteBuyerOrder } from '@/lib/buyer-orders';
import { useAuth } from '@/providers/auth-provider';
import type { VendorOrderWithGift } from '@/types/vendor';

export default function BuyerOrdersTabScreen() {
  const { profile } = useAuth();
  const { orders, loading, refreshControl, setOrders } = useBuyerOrdersList();

  async function handleDeleteOrder(orderId: string) {
    const { error } = await softDeleteBuyerOrder(orderId);

    if (error) {
      Alert.alert('Could not delete', error.message);
      return;
    }

    setOrders((current: VendorOrderWithGift[]) =>
      current.filter((order) => order.id !== orderId),
    );
  }

  return (
    <ScreenShell scrollProps={{ refreshControl }}>
      <DashboardHeader
        title="My orders"
        subtitle="Track purchases and delivery status."
        role={profile?.role}
      />

      <MenuRow
        title="Deleted orders"
        description="View and restore removed orders"
        href="/buyer/orders/deleted"
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
        orders.map((order) => (
          <SwipeableOrderListItem
            key={order.id}
            order={order}
            href={`/buyer/orders/${order.id}`}
            onDelete={handleDeleteOrder}
          />
        ))
      )}
    </ScreenShell>
  );
}
