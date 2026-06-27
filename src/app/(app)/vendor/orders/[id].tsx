import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import {
  DashboardHeader,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { StatusBadge } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { Colors } from '@/constants/colors';
import { formatMoney } from '@/lib/format';
import { getOrCreateConversationForOrder } from '@/lib/chat';
import {
  fetchVendorOrderById,
  getNextOrderAction,
  updateVendorOrderStatus,
} from '@/lib/vendor-orders';
import { useAuth } from '@/providers/auth-provider';
import { useVendorStore } from '@/providers/vendor-store-provider';
import type { VendorOrderWithGift } from '@/types/vendor';

export default function VendorOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { refreshNewOrderCount } = useVendorStore();
  const [order, setOrder] = useState<VendorOrderWithGift | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [openingChat, setOpeningChat] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    const row = await fetchVendorOrderById(id);
    setOrder(row);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  async function handleStatusUpdate(nextStatus: VendorOrderWithGift['status']) {
    if (!order) return;

    setUpdating(true);
    const { data, error } = await updateVendorOrderStatus(order.id, nextStatus);
    setUpdating(false);

    if (error || !data) {
      Alert.alert('Could not update order', error?.message ?? 'Try again.');
      return;
    }

    await loadOrder();
    await refreshNewOrderCount();
  }

  async function handleOpenChat() {
    if (!order || !profile) return;

    setOpeningChat(true);
    const { data, error } = await getOrCreateConversationForOrder(order.id, profile.id);
    setOpeningChat(false);

    if (error || !data) {
      Alert.alert('Could not open chat', error?.message ?? 'Try again.');
      return;
    }

    router.push(`/vendor/chat/${data.id}`);
  }

  function handleReject() {
    Alert.alert('Reject order', 'The buyer will be notified that this order cannot be fulfilled.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => void handleStatusUpdate('rejected'),
      },
    ]);
  }

  if (loading) {
    return (
      <ScreenShell scroll={false}>
        <ThemedActivityIndicator style={{ marginTop: 48 }} />
      </ScreenShell>
    );
  }

  if (!order || order.vendor_id !== profile?.id) {
    return (
      <ScreenShell>
        <DashboardHeader title="Order not found" showBanner={false} showBack backHref="/vendor/orders" />
      </ScreenShell>
    );
  }

  const nextAction = getNextOrderAction(order.status);

  return (
    <ScreenShell>
      <DashboardHeader
        title={order.gift?.title ?? 'Gift order'}
        subtitle={`For ${order.recipient_name}`}
        showBanner={false}
        showBack
        backHref="/vendor/orders"
      />

      <StatusBadge status={order.status} kind="order" />

      <SectionTitle>Order details</SectionTitle>
      <View style={{ gap: 8 }}>
        <Text style={{ color: Colors.textSecondary }}>Total: {formatMoney(order.total_cents)}</Text>
        <Text style={{ color: Colors.textSecondary }}>Quantity: {order.quantity}</Text>
        {order.delivery_date ? (
          <Text style={{ color: Colors.textSecondary }}>Delivery date: {order.delivery_date}</Text>
        ) : null}
        {order.recipient_address ? (
          <Text style={{ color: Colors.textSecondary }}>Address: {order.recipient_address}</Text>
        ) : null}
        {order.gift_message ? (
          <Text style={{ color: Colors.text, fontStyle: 'italic' }}>
            Message: “{order.gift_message}”
          </Text>
        ) : null}
      </View>

      {nextAction ? (
        <PrimaryButton
          label={nextAction.label}
          loading={updating}
          onPress={() => void handleStatusUpdate(nextAction.nextStatus)}
        />
      ) : null}

      <PrimaryButton
        label="Message buyer"
        variant="secondary"
        loading={openingChat}
        onPress={() => void handleOpenChat()}
      />

      {order.status === 'new' ? (
        <PrimaryButton
          label="Reject order"
          variant="secondary"
          loading={updating}
          onPress={handleReject}
        />
      ) : null}
    </ScreenShell>
  );
}
