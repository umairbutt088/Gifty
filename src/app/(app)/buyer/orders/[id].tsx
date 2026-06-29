import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Share, StyleSheet, Text, View } from 'react-native';

import {
  DashboardHeader,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { StatusBadge } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { fetchBuyerOrderById, softDeleteBuyerOrder } from '@/lib/buyer-orders';
import { getOrCreateConversationForOrder } from '@/lib/chat';
import { formatMoney } from '@/lib/format';
import { buildRecipientLink } from '@/lib/recipient-delivery';
import { useAuth } from '@/providers/auth-provider';
import type { VendorOrderWithGift } from '@/types/vendor';

export default function BuyerOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [order, setOrder] = useState<VendorOrderWithGift | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingChat, setOpeningChat] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id || !profile) return;

    setLoading(true);
    const row = await fetchBuyerOrderById(id, profile.id);
    setOrder(row);
    setLoading(false);
  }, [id, profile]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  async function handleOpenChat() {
    if (!order || !profile) return;

    setOpeningChat(true);
    const { data, error } = await getOrCreateConversationForOrder(order.id, profile.id);
    setOpeningChat(false);

    if (error || !data) {
      Alert.alert('Could not open chat', error?.message ?? 'Try again.');
      return;
    }

    router.push(`/buyer/chat/${data.id}`);
  }

  async function handleShareRecipientLink() {
    if (!order) return;

    const link = buildRecipientLink(order.delivery_token);

    await Share.share({
      title: 'Gift delivery link',
      message: `Track and confirm your gift delivery: ${link}`,
    });
  }

  function handleDeleteOrder() {
    if (!order) return;

    Alert.alert(
      'Remove order',
      'Remove this order from your list? You can restore it from Deleted orders.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              const { error } = await softDeleteBuyerOrder(order.id);

              if (error) {
                Alert.alert('Could not remove', error.message);
                return;
              }

              router.replace('/buyer/orders');
            })();
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <ScreenShell scroll={false}>
        <ThemedActivityIndicator style={{ marginTop: 48 }} />
      </ScreenShell>
    );
  }

  if (!order) {
    return (
      <ScreenShell>
        <DashboardHeader title="Order not found" showBanner={false} showBack backHref="/buyer/orders" />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <DashboardHeader
        title={order.gift?.title ?? 'Gift order'}
        subtitle={`For ${order.recipient_name}`}
        showBanner={false}
        showBack
        backHref="/buyer/orders"
      />

      <StatusBadge status={order.status} kind="order" />

      <SectionTitle>Order details</SectionTitle>
      <View style={styles.details}>
        <Text style={styles.meta}>Total: {formatMoney(order.total_cents)}</Text>
        <Text style={styles.meta}>Quantity: {order.quantity}</Text>
        {order.delivery_date ? (
          <Text style={styles.meta}>Delivery date: {order.delivery_date}</Text>
        ) : null}
        {order.recipient_address ? (
          <Text style={styles.meta}>Address: {order.recipient_address}</Text>
        ) : null}
        {order.recipient_phone ? (
          <Text style={styles.meta}>Recipient phone: {order.recipient_phone}</Text>
        ) : null}
        {order.recipient_email ? (
          <Text style={styles.meta}>Recipient email: {order.recipient_email}</Text>
        ) : null}
        {/* Hidden until RECIPIENT_NOTIFICATIONS_ENABLED — see recipient-delivery.ts */}
        {order.recipient_confirmed_at ? (
          <Text style={styles.confirmed}>
            Recipient confirmed delivery on{' '}
            {new Date(order.recipient_confirmed_at).toLocaleString()}
          </Text>
        ) : null}
        {order.gift_message ? (
          <Text style={styles.message}>Message: “{order.gift_message}”</Text>
        ) : null}
      </View>

      <PrimaryButton
        label="Share delivery link"
        variant="secondary"
        onPress={() => void handleShareRecipientLink()}
      />

      <PrimaryButton
        label="Message vendor"
        loading={openingChat}
        onPress={() => void handleOpenChat()}
      />

      <PrimaryButton label="Remove from list" variant="secondary" onPress={handleDeleteOrder} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  details: {
    gap: Spacing.two,
  },
  meta: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  message: {
    color: Colors.text,
    fontSize: 15,
    fontStyle: 'italic',
  },
  confirmed: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});
