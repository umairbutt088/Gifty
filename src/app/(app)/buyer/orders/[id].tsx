import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Share, StyleSheet, View } from 'react-native';

import {
  DashboardHeader,
  OrderDetailsCard,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { CartHeaderButton } from '@/components/buyer';
import { StatusBadge } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { Spacing } from '@/constants/theme';
import { fetchBuyerOrderById, softDeleteBuyerOrder } from '@/lib/buyer-orders';
import { getOrCreateConversationForOrder } from '@/lib/chat';
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
        subtitle={`Gift for ${order.recipient_name}`}
        showBanner={false}
        showBack
        backHref="/buyer/orders"
        trailing={
          <View style={styles.headerTrailing}>
            <CartHeaderButton />
            <StatusBadge status={order.status} kind="order" />
          </View>
        }
      />

      <SectionTitle>Delivery details</SectionTitle>
      <OrderDetailsCard order={order} />

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
  headerTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
