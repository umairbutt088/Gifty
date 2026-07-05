import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import {
  ButtonStack,
  DashboardHeader,
  OrderDetailsCard,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { ImageGalleryViewer } from '@/components/image-gallery-viewer';
import { StatusBadge } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
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
        subtitle={`Gift for ${order.recipient_name}`}
        showBanner={false}
        showBack
        backHref="/vendor/orders"
        trailing={<StatusBadge status={order.status} kind="order" />}
      />

      {order.gift?.image_urls?.length ? (
        <ImageGalleryViewer images={order.gift.image_urls} />
      ) : null}

      <SectionTitle>Delivery details</SectionTitle>
      <OrderDetailsCard order={order} />

      <ButtonStack>
        <ButtonStack horizontal>
          <PrimaryButton
            label="Chat with buyer"
            size="compact"
            loading={openingChat}
            onPress={() => void handleOpenChat()}
          />

          {nextAction ? (
            <PrimaryButton
              label={nextAction.label}
              size="compact"
              variant="share"
              loading={updating}
              onPress={() => void handleStatusUpdate(nextAction.nextStatus)}
            />
          ) : null}
        </ButtonStack>

        {order.status === 'new' ? (
          <View style={styles.rejectRow}>
            <PrimaryButton
              label="Reject order"
              size="compact"
              variant="danger"
              style={styles.rejectButton}
              loading={updating}
              onPress={handleReject}
            />
          </View>
        ) : null}
      </ButtonStack>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  rejectRow: {
    alignItems: 'center',
  },
  rejectButton: {
    flex: 0,
    width: '48%',
  },
});
