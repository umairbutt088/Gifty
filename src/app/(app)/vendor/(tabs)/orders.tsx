import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { DashboardHeader, EmptyState, ScreenShell } from '@/components/dashboard';
import { OrderListItem, SegmentBar } from '@/components/vendor';
import { matchesOrderFilter, ORDER_FILTER_TABS, type OrderFilter } from '@/constants/vendor';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { fetchVendorOrders } from '@/lib/vendor-orders';
import { useAuth } from '@/providers/auth-provider';
import { useVendorStore } from '@/providers/vendor-store-provider';
import type { VendorOrderWithGift } from '@/types/vendor';

export default function VendorOrdersTabScreen() {
  const { profile } = useAuth();
  const { refreshNewOrderCount } = useVendorStore();
  const [orders, setOrders] = useState<VendorOrderWithGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderFilter>('all');

  const loadOrders = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    const rows = await fetchVendorOrders(profile.id);
    setOrders(rows);
    setLoading(false);
    await refreshNewOrderCount();
  }, [profile, refreshNewOrderCount]);

  useFocusEffect(
    useCallback(() => {
      void loadOrders();
    }, [loadOrders]),
  );

  const filteredOrders = useMemo(
    () => orders.filter((order) => matchesOrderFilter(order.status, filter)),
    [orders, filter],
  );

  const isEmpty = !loading && filteredOrders.length === 0;

  return (
    <ScreenShell scroll={false} style={styles.shell}>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <DashboardHeader
            title="Orders"
            subtitle="Fulfill and track gift orders."
            role={profile?.role}
          />
          <SegmentBar options={ORDER_FILTER_TABS} value={filter} onChange={setFilter} />
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={[styles.listContent, isEmpty && styles.listContentEmpty]}
          showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={Colors.accent} />
            </View>
          ) : isEmpty ? (
            <EmptyState
              title="No orders yet"
              message="When a buyer sends one of your gifts, it will appear here."
            />
          ) : (
            filteredOrders.map((order) => (
              <OrderListItem key={order.id} order={order} href={`/vendor/orders/${order.id}`} />
            ))
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
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
    gap: Spacing.three,
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
