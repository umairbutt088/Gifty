import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Share, StyleSheet, Text, View } from "react-native";

import { CartHeaderButton } from "@/components/buyer";
import {
    ButtonStack,
    DashboardHeader,
    OrderDetailsCard,
    PrimaryButton,
    ScreenShell,
    SectionTitle,
} from "@/components/dashboard";
import { ImageGalleryViewer } from "@/components/image-gallery-viewer";
import { ThemedActivityIndicator } from "@/components/themed-activity-indicator";
import { FormField, StatusBadge } from "@/components/vendor";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/theme";
import {
    cancelBuyerOrder,
    fetchBuyerOrderById,
    softDeleteBuyerOrder,
} from "@/lib/buyer-orders";
import { getOrCreateConversationForOrder, sendMessage } from "@/lib/chat";
import { buildRecipientLink } from "@/lib/recipient-delivery";
import { useAuth } from "@/providers/auth-provider";
import type { VendorOrderWithGift } from "@/types/vendor";

export default function BuyerOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [order, setOrder] = useState<VendorOrderWithGift | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingChat, setOpeningChat] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

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

  async function handleCancelOrder() {
    if (!order || !profile) return;

    if (!cancelReason.trim()) {
      setCancelError("A reason is required.");
      return;
    }

    setCancelling(true);
    const { data, error } = await cancelBuyerOrder(order.id, cancelReason);
    setCancelling(false);

    if (error || !data) {
      Alert.alert("Could not cancel order", error?.message ?? "Try again.");
      return;
    }

    const { data: conversation } = await getOrCreateConversationForOrder(
      order.id,
      profile.id,
    );
    if (conversation) {
      await sendMessage(
        conversation.id,
        profile.id,
        `Order cancelled: ${cancelReason.trim()}`,
      );
    }

    setShowCancelForm(false);
    setCancelReason("");
    setCancelError(null);
    await loadOrder();
  }

  async function handleOpenChat() {
    if (!order || !profile) return;

    setOpeningChat(true);
    const { data, error } = await getOrCreateConversationForOrder(
      order.id,
      profile.id,
    );
    setOpeningChat(false);

    if (error || !data) {
      Alert.alert("Could not open chat", error?.message ?? "Try again.");
      return;
    }

    router.push(`/buyer/chat/${data.id}`);
  }

  async function handleShareRecipientLink() {
    if (!order) return;

    const link = buildRecipientLink(order.delivery_token);

    await Share.share({
      title: "Gift delivery link",
      message: `Track and confirm your gift delivery: ${link}`,
    });
  }

  function handleDeleteOrder() {
    if (!order) return;

    Alert.alert(
      "Remove order",
      "Remove this order from your list? You can restore it from Deleted orders.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void (async () => {
              const { error } = await softDeleteBuyerOrder(order.id);

              if (error) {
                Alert.alert("Could not remove", error.message);
                return;
              }

              router.replace("/buyer/orders");
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
        <DashboardHeader
          title="Order not found"
          showBanner={false}
          showBack
          backHref="/buyer/orders"
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <DashboardHeader
        title={order.gift?.title ?? "Gift order"}
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

      {order.gift?.image_urls?.length ? (
        <ImageGalleryViewer images={order.gift.image_urls} />
      ) : null}

      <SectionTitle>Delivery details</SectionTitle>
      <OrderDetailsCard order={order} />

      <ButtonStack>
        <ButtonStack horizontal>
          <PrimaryButton
            label="Chat with vendor"
            size="compact"
            loading={openingChat}
            onPress={() => void handleOpenChat()}
          />

          <PrimaryButton
            label="Share delivery link"
            size="compact"
            variant="share"
            onPress={() => void handleShareRecipientLink()}
          />
        </ButtonStack>

        {order.status === "new" ? (
          showCancelForm ? (
            <View style={styles.cancelForm}>
              <Text style={styles.cancelFormTitle}>
                Why do you want to cancel this order?
              </Text>
              <FormField
                label="Reason"
                value={cancelReason}
                onChangeText={(text) => {
                  setCancelReason(text);
                  if (cancelError) setCancelError(null);
                }}
                placeholder="Let the vendor know what changed"
                multiline
                style={styles.cancelInput}
                error={cancelError}
              />
              <ButtonStack horizontal>
                <PrimaryButton
                  label="Never mind"
                  size="compact"
                  variant="secondary"
                  onPress={() => {
                    setShowCancelForm(false);
                    setCancelReason("");
                    setCancelError(null);
                  }}
                />
                <PrimaryButton
                  label="Confirm cancel"
                  size="compact"
                  variant="danger"
                  loading={cancelling}
                  onPress={() => void handleCancelOrder()}
                />
              </ButtonStack>
            </View>
          ) : (
            <View style={styles.deleteRow}>
              <PrimaryButton
                label="Cancel order"
                size="compact"
                variant="danger"
                style={styles.deleteButton}
                onPress={() => setShowCancelForm(true)}
              />
            </View>
          )
        ) : null}

        <View style={styles.deleteRow}>
          <PrimaryButton
            label="Delete order"
            size="compact"
            variant="danger"
            style={styles.deleteButton}
            onPress={handleDeleteOrder}
          />
        </View>
      </ButtonStack>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerTrailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  cancelForm: {
    gap: 8,
  },
  cancelFormTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  cancelInput: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  deleteRow: {
    alignItems: "center",
  },
  deleteButton: {
    flex: 0,
    width: "48%",
  },
});
