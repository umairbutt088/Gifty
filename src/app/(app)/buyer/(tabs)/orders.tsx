import { View } from 'react-native';

import { DashboardHeader, EmptyState, ScreenShell } from '@/components/dashboard';
import { OrderListItem } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { useBuyerOrdersList } from '@/hooks/use-buyer-orders-list';
import { useAuth } from '@/providers/auth-provider';

export default function BuyerOrdersTabScreen() {
  const { profile } = useAuth();
  const { orders, loading, refreshControl } = useBuyerOrdersList();

  return (
    <ScreenShell scrollProps={{ refreshControl }}>
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
