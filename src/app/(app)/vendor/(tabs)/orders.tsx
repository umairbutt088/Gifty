import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import {
  CardList,
  DashboardHeader,
  EmptyState,
  MenuRow,
  SCREEN_HORIZONTAL_PADDING,
  ScreenShell,
} from '@/components/dashboard';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { SegmentBar, SwipeableOrderListItem } from '@/components/vendor';
import { Spacing } from '@/constants/theme';
import { matchesOrderFilter, ORDER_FILTER_TABS, type OrderFilter } from '@/constants/vendor';
import { useVendorOrdersList } from '@/hooks/use-vendor-orders-list';
import { softDeleteVendorOrder } from '@/lib/vendor-orders';
import { useAuth } from '@/providers/auth-provider';
import { useVendorStore } from '@/providers/vendor-store-provider';

export default function VendorOrdersTabScreen() {
  const { profile } = useAuth();
  const { refreshNewOrderCount } = useVendorStore();
  const [filter, setFilter] = useState<OrderFilter>('all');

  const handleLoaded = useCallback(async () => {
    await refreshNewOrderCount();
  }, [refreshNewOrderCount]);

  const { orders, setOrders, loading, refreshControl } = useVendorOrdersList(handleLoaded);

  const filteredOrders = useMemo(
    () => orders.filter((order) => matchesOrderFilter(order.status, filter)),
    [orders, filter],
  );

  const isEmpty = !loading && filteredOrders.length === 0;

  async function handleDeleteOrder(orderId: string) {
    const { error } = await softDeleteVendorOrder(orderId);

    if (error) {
      Alert.alert('Could not delete', error.message);
      return;
    }

    setOrders((current) => current.filter((order) => order.id !== orderId));
    await refreshNewOrderCount();
  }

  return (
    <ScreenShell scroll={false} style={styles.shell}>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <DashboardHeader title="Orders" variant="tab" role={profile?.role} />
          <SegmentBar options={ORDER_FILTER_TABS} value={filter} onChange={setFilter} />
          <MenuRow
            title="Deleted orders"
            description="View and restore removed orders"
            href="/vendor/orders/deleted"
          />
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={[styles.listContent, isEmpty && styles.listContentEmpty]}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}>
          {loading ? (
            <View style={styles.loading}>
              <ThemedActivityIndicator />
            </View>
          ) : isEmpty ? (
            <EmptyState
              title="No orders yet"
              message="When a buyer sends one of your gifts, it will appear here."
            />
          ) : (
            <CardList>
              {filteredOrders.map((order) => (
                <SwipeableOrderListItem
                  key={order.id}
                  order={order}
                  href={`/vendor/orders/${order.id}`}
                  onDelete={handleDeleteOrder}
                />
              ))}
            </CardList>
          )}
        </ScrollView>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.two,
    gap: Spacing.three,
  },
  headerSection: {
    flexShrink: 0,
    gap: Spacing.three,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.four,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
  },
});
