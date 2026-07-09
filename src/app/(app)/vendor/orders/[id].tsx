import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import {
  ButtonStack,
  DashboardHeader,
  OrderDetailsCard,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { ImageGalleryViewer } from '@/components/image-gallery-viewer';
import { FormField, StatusBadge } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { Colors } from '@/constants/colors';
import { getOrCreateConversationForOrder, sendMessage } from '@/lib/chat';
import {
  cancelVendorOrder,
  fetchVendorOrderById,
  getNextOrderAction,
  markVendorOrderShipped,
  updateVendorOrderStatus,
} from '@/lib/vendor-orders';
import { useAuth } from '@/providers/auth-provider';
import { useVendorStore } from '@/providers/vendor-store-provider';
import type { VendorOrderWithGift } from '@/types/vendor';

type ReasonAction = 'reject' | 'cancel' | null;

export default function VendorOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { refreshNewOrderCount } = useVendorStore();
  const [order, setOrder] = useState<VendorOrderWithGift | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [openingChat, setOpeningChat] = useState(false);
  const [reasonAction, setReasonAction] = useState<ReasonAction>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');

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

  async function postSystemChatMessage(body: string) {
    if (!order || !profile) return;

    const { data: conversation } = await getOrCreateConversationForOrder(order.id, profile.id);
    if (conversation) {
      await sendMessage(conversation.id, profile.id, body);
    }
  }

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

  function closeShippingForm() {
    setShowShippingForm(false);
    setTrackingNumber('');
    setCarrier('');
  }

  async function handleMarkShipped() {
    if (!order) return;

    setUpdating(true);
    const { data, error } = await markVendorOrderShipped(order.id, { trackingNumber, carrier });
    setUpdating(false);

    if (error || !data) {
      Alert.alert('Could not update order', error?.message ?? 'Try again.');
      return;
    }

    closeShippingForm();
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

  function openReasonForm(action: Exclude<ReasonAction, null>) {
    setReasonAction(action);
    setReason('');
    setReasonError(null);
  }

  function closeReasonForm() {
    setReasonAction(null);
    setReason('');
    setReasonError(null);
  }

  async function handleSubmitReason() {
    if (!order || !reasonAction) return;

    if (!reason.trim()) {
      setReasonError('A reason is required.');
      return;
    }

    setUpdating(true);
    const { data, error } =
      reasonAction === 'reject'
        ? await updateVendorOrderStatus(order.id, 'rejected', reason)
        : await cancelVendorOrder(order.id, reason);
    setUpdating(false);

    if (error || !data) {
      Alert.alert('Could not update order', error?.message ?? 'Try again.');
      return;
    }

    await postSystemChatMessage(
      reasonAction === 'reject' ? `Order rejected: ${reason.trim()}` : `Order cancelled: ${reason.trim()}`,
    );

    closeReasonForm();
    await loadOrder();
    await refreshNewOrderCount();
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

      {order.status === 'new' && order.sla_escalated_at ? (
        <View style={styles.overdueBanner}>
          <Text style={styles.overdueBannerText}>
            This order is overdue — accept or reject it as soon as you can.
          </Text>
        </View>
      ) : null}

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

          {nextAction && !showShippingForm ? (
            <PrimaryButton
              label={nextAction.label}
              size="compact"
              variant="share"
              loading={updating}
              onPress={() => {
                if (nextAction.nextStatus === 'shipped') {
                  setShowShippingForm(true);
                } else {
                  void handleStatusUpdate(nextAction.nextStatus);
                }
              }}
            />
          ) : null}
        </ButtonStack>

        {showShippingForm ? (
          <View style={styles.reasonForm}>
            <Text style={styles.reasonTitle}>Add tracking info (optional)</Text>
            <FormField
              label="Tracking number"
              value={trackingNumber}
              onChangeText={setTrackingNumber}
              placeholder="e.g. TCS123456789"
            />
            <FormField
              label="Carrier"
              value={carrier}
              onChangeText={setCarrier}
              placeholder="e.g. TCS, Leopards, in-house rider"
            />
            <ButtonStack horizontal>
              <PrimaryButton
                label="Cancel"
                size="compact"
                variant="secondary"
                onPress={closeShippingForm}
              />
              <PrimaryButton
                label="Mark shipped"
                size="compact"
                variant="share"
                loading={updating}
                onPress={() => void handleMarkShipped()}
              />
            </ButtonStack>
          </View>
        ) : reasonAction ? (
          <View style={styles.reasonForm}>
            <Text style={styles.reasonTitle}>
              {reasonAction === 'reject' ? 'Why are you rejecting this order?' : 'Why are you cancelling this order?'}
            </Text>
            <FormField
              label="Reason"
              value={reason}
              onChangeText={(text) => {
                setReason(text);
                if (reasonError) setReasonError(null);
              }}
              placeholder="Explain what happened for the buyer"
              multiline
              style={styles.reasonInput}
              error={reasonError}
            />
            <ButtonStack horizontal>
              <PrimaryButton
                label="Never mind"
                size="compact"
                variant="secondary"
                onPress={closeReasonForm}
              />
              <PrimaryButton
                label={reasonAction === 'reject' ? 'Confirm reject' : 'Confirm cancel'}
                size="compact"
                variant="danger"
                loading={updating}
                onPress={() => void handleSubmitReason()}
              />
            </ButtonStack>
          </View>
        ) : (
          <View style={styles.secondaryActionsRow}>
            {order.status === 'new' ? (
              <PrimaryButton
                label="Reject order"
                size="compact"
                variant="danger"
                style={styles.secondaryActionButton}
                onPress={() => openReasonForm('reject')}
              />
            ) : null}

            {order.status === 'accepted' || order.status === 'preparing' ? (
              <PrimaryButton
                label="Cancel order"
                size="compact"
                variant="danger"
                style={styles.secondaryActionButton}
                onPress={() => openReasonForm('cancel')}
              />
            ) : null}
          </View>
        )}
      </ButtonStack>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  secondaryActionsRow: {
    alignItems: 'center',
  },
  secondaryActionButton: {
    flex: 0,
    width: '48%',
  },
  reasonForm: {
    gap: 8,
  },
  reasonTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  reasonInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  overdueBanner: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#E05D5D22',
  },
  overdueBannerText: {
    color: '#E05D5D',
    fontSize: 13,
    fontWeight: '600',
  },
});
