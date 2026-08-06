import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { CartHeaderButton } from "@/components/buyer";
import {
    DashboardHeader,
    PrimaryButton,
    ScreenShell,
    SectionTitle,
} from "@/components/dashboard";
import { GlassCard } from "@/components/glass-card";
import { NativeDatePickerField } from "@/components/native-date-picker-field";
import { ThemedActivityIndicator } from "@/components/themed-activity-indicator";
import { FormField } from "@/components/vendor";
import { useColors } from "@/hooks/use-colors";
import { Spacing } from "@/constants/theme";
import {
    calculateVendorDeliveryFees,
    cartRequiresDeliveryAddress,
    createBuyerOrders,
    getRecipientDeliveryFieldErrors,
    type RecipientDeliveryFieldErrors,
} from "@/lib/buyer-orders";
import { formatMoney } from "@/lib/format";
import { fetchPublicVendorStores } from "@/lib/vendor-store";
import { getStoreFulfillmentSummary } from "@/lib/vendor-store-helpers";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/providers/cart-provider";
import type { VendorStorePublic } from "@/types/vendor";

export default function BuyerCheckoutScreen() {
  const { profile } = useAuth();
  const colors = useColors();
  const { items, isReady, subtotalCents, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RecipientDeliveryFieldErrors>(
    {},
  );
  const [vendorStores, setVendorStores] = useState<
    Map<string, VendorStorePublic>
  >(new Map());
  const [storesLoading, setStoresLoading] = useState(false);

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [notifyRecipient] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [giftMessage, setGiftMessage] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  const vendorIds = useMemo(
    () => [...new Set(items.map((item) => item.vendorId))],
    [items],
  );

  useEffect(() => {
    if (vendorIds.length === 0) {
      setVendorStores(new Map());
      return;
    }

    setStoresLoading(true);
    void fetchPublicVendorStores(vendorIds).then((stores) => {
      setVendorStores(stores);
      setStoresLoading(false);
    });
  }, [vendorIds]);

  const deliveryFeeCents = useMemo(
    () => calculateVendorDeliveryFees(vendorIds, vendorStores),
    [vendorIds, vendorStores],
  );
  const grandTotalCents = subtotalCents + deliveryFeeCents;
  const requiresDeliveryAddress = cartRequiresDeliveryAddress(
    vendorIds,
    vendorStores,
  );
  const pickupOnly = vendorIds.length > 0 && !requiresDeliveryAddress;

  async function handlePlaceOrder() {
    if (!profile || items.length === 0) return;

    const delivery = {
      recipientName,
      recipientPhone,
      recipientEmail,
      notifyRecipient,
      recipientAddress,
      giftMessage,
      deliveryDate,
    };

    const nextFieldErrors = getRecipientDeliveryFieldErrors(delivery);
    if (requiresDeliveryAddress && !recipientAddress.trim()) {
      nextFieldErrors.recipientAddress = "Delivery address is required.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const { orders, error: orderError } = await createBuyerOrders(
      profile.id,
      items.map((item) => ({
        giftId: item.giftId,
        quantity: item.quantity,
        title: item.title,
        priceCents: item.priceCents,
        variantId: item.variantId ?? null,
      })),
      delivery,
    );

    setSubmitting(false);

    if (orderError || orders.length === 0) {
      setError(orderError?.message ?? "Could not place order.");
      return;
    }

    await clearCart();

    Alert.alert(
      "Order placed",
      orders.length === 1
        ? "The vendor will review your gift order."
        : `${orders.length} gift orders were sent to vendors.`,
      [{ text: "View orders", onPress: () => router.replace("/buyer/orders") }],
    );
  }

  if (!isReady || storesLoading) {
    return (
      <ScreenShell scroll={false}>
        <ThemedActivityIndicator style={{ marginTop: 48 }} />
      </ScreenShell>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenShell>
        <DashboardHeader
          title="Checkout"
          subtitle="Your cart is empty."
          showBanner={false}
          showBack
          backHref="/buyer/cart"
          trailing={<CartHeaderButton />}
        />
        <PrimaryButton
          label="Go to cart"
          onPress={() => router.replace("/buyer/cart")}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scrollProps={{ keyboardShouldPersistTaps: "handled" }}>
      <DashboardHeader
        title="Checkout"
        subtitle="Review your cart and add recipient details."
        showBanner={false}
        showBack
        backHref="/buyer/cart"
        trailing={<CartHeaderButton />}
      />

      <SectionTitle>Order summary</SectionTitle>
      <GlassCard style={styles.summaryCard}>
        {items.map((item) => {
          const store = vendorStores.get(item.vendorId);
          return (
            <View key={item.giftId} style={styles.summaryLine}>
              <View style={styles.summaryLineText}>
                <Text style={[styles.summaryTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={[styles.summaryMeta, { color: colors.textSecondary }]}>
                  {item.quantity} × {formatMoney(item.priceCents)}
                </Text>
                {store ? (
                  <Text style={[styles.summaryFulfillment, { color: colors.textMuted }]}>
                    {getStoreFulfillmentSummary(store)}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.summaryLineTotal, { color: colors.text }]}>
                {formatMoney(item.priceCents * item.quantity)}
              </Text>
            </View>
          );
        })}

        {deliveryFeeCents > 0 ? (
          <View style={styles.summaryLine}>
            <Text style={[styles.summaryMeta, { color: colors.textSecondary }]}>Delivery fees</Text>
            <Text style={[styles.summaryLineTotal, { color: colors.text }]}>
              {formatMoney(deliveryFeeCents)}
            </Text>
          </View>
        ) : null}

        <View style={[styles.summaryDivider, { backgroundColor: colors.surfaceBorder }]} />

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryTotalLabel, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.summaryTotalValue, { color: colors.text }]}>
            {formatMoney(grandTotalCents)}
          </Text>
        </View>
      </GlassCard>

      {pickupOnly ? (
        <GlassCard style={styles.pickupCard}>
          <Text style={[styles.pickupTitle, { color: colors.text }]}>Pickup / takeaway</Text>
          <Text style={[styles.pickupText, { color: colors.textSecondary }]}>
            These vendors do not deliver. You or the recipient will collect the
            order from the store.
          </Text>
        </GlassCard>
      ) : null}

      <SectionTitle>Recipient</SectionTitle>
      <FormField
        label="Recipient name"
        value={recipientName}
        onChangeText={(text) => {
          setRecipientName(text);
          if (fieldErrors.recipientName) {
            setFieldErrors((current) => ({
              ...current,
              recipientName: undefined,
            }));
          }
        }}
        placeholder="Who receives the gift?"
        error={fieldErrors.recipientName}
      />
      <FormField
        label="Recipient phone"
        value={recipientPhone}
        onChangeText={(text) => {
          setRecipientPhone(text);
          if (fieldErrors.recipientPhone) {
            setFieldErrors((current) => ({
              ...current,
              recipientPhone: undefined,
            }));
          }
        }}
        placeholder="+1 555 123 4567"
        keyboardType="phone-pad"
        autoComplete="tel"
        error={fieldErrors.recipientPhone}
      />
      <FormField
        label="Recipient email"
        value={recipientEmail}
        onChangeText={(text) => {
          setRecipientEmail(text);
          if (fieldErrors.recipientEmail) {
            setFieldErrors((current) => ({
              ...current,
              recipientEmail: undefined,
            }));
          }
        }}
        placeholder="recipient@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={fieldErrors.recipientEmail}
      />
      {requiresDeliveryAddress ? (
        <FormField
          label="Delivery address"
          value={recipientAddress}
          onChangeText={(text) => {
            setRecipientAddress(text);
            if (fieldErrors.recipientAddress) {
              setFieldErrors((current) => ({
                ...current,
                recipientAddress: undefined,
              }));
            }
          }}
          placeholder="Street, city"
          multiline
          style={styles.multiline}
          error={fieldErrors.recipientAddress}
        />
      ) : null}
      <FormField
        label="Gift message"
        value={giftMessage}
        onChangeText={setGiftMessage}
        placeholder="Write a note for the recipient"
        multiline
        style={styles.multiline}
      />

      <NativeDatePickerField
        label={pickupOnly ? "Preferred pickup date" : "Preferred delivery date"}
        value={deliveryDate}
        onChange={setDeliveryDate}
        hint={
          pickupOnly
            ? "Optional. Coordinate pickup timing with the vendor."
            : "Optional. Vendors will try to deliver on or near this date."
        }
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label={`Place order · ${formatMoney(grandTotalCents)}`}
        loading={submitting}
        onPress={() => void handlePlaceOrder()}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  summaryLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  summaryLineText: {
    flex: 1,
    gap: Spacing.one,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  summaryMeta: {
    fontSize: 13,
  },
  summaryFulfillment: {
    fontSize: 12,
    lineHeight: 18,
  },
  summaryLineTotal: {
    fontSize: 15,
    fontWeight: "700",
  },
  summaryDivider: {
    height: 1,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  pickupCard: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  pickupTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  pickupText: {
    fontSize: 14,
    lineHeight: 20,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  error: {
    color: "#E05D5D",
    fontSize: 14,
  },
});
