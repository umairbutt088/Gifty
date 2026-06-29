import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import {
  DashboardHeader,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { GlassCard } from '@/components/glass-card';
// import { DatePickerField } from '@/components/date-picker-field';
import { NativeDatePickerField } from '@/components/native-date-picker-field';
import { FormField } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import {
  createBuyerOrders,
  getRecipientDeliveryFieldErrors,
  type RecipientDeliveryFieldErrors,
} from '@/lib/buyer-orders';
import { formatMoney } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/providers/cart-provider';

export default function BuyerCheckoutScreen() {
  const { profile } = useAuth();
  const { items, isReady, subtotalCents, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RecipientDeliveryFieldErrors>({});

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [notifyRecipient] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

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
      })),
      delivery,
    );

    setSubmitting(false);

    if (orderError || orders.length === 0) {
      setError(orderError?.message ?? 'Could not place order.');
      return;
    }

    await clearCart();

    Alert.alert(
      'Order placed',
      orders.length === 1
        ? 'The vendor will review your gift order.'
        : `${orders.length} gift orders were sent to vendors.`,
      [{ text: 'View orders', onPress: () => router.replace('/buyer/orders') }],
    );
  }

  if (!isReady) {
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
        />
        <PrimaryButton label="Go to cart" onPress={() => router.replace('/buyer/cart')} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <DashboardHeader
        title="Checkout"
        subtitle="Review your cart and add recipient details."
        showBanner={false}
        showBack
        backHref="/buyer/cart"
      />

      <SectionTitle>Order summary</SectionTitle>
      <GlassCard style={styles.summaryCard}>
        {items.map((item) => (
          <View key={item.giftId} style={styles.summaryLine}>
            <View style={styles.summaryLineText}>
              <Text style={styles.summaryTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.summaryMeta}>
                {item.quantity} × {formatMoney(item.priceCents)}
              </Text>
            </View>
            <Text style={styles.summaryLineTotal}>
              {formatMoney(item.priceCents * item.quantity)}
            </Text>
          </View>
        ))}

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>{formatMoney(subtotalCents)}</Text>
        </View>
      </GlassCard>

      <SectionTitle>Recipient</SectionTitle>
      <FormField
        label="Recipient name"
        value={recipientName}
        onChangeText={(text) => {
          setRecipientName(text);
          if (fieldErrors.recipientName) {
            setFieldErrors((current) => ({ ...current, recipientName: undefined }));
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
            setFieldErrors((current) => ({ ...current, recipientPhone: undefined }));
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
            setFieldErrors((current) => ({ ...current, recipientEmail: undefined }));
          }
        }}
        placeholder="recipient@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={fieldErrors.recipientEmail}
      />
      {/* Recipient SMS/email notifications — enable when RECIPIENT_NOTIFICATIONS_ENABLED is true.
      <View style={styles.notifyRow}>
        <View style={styles.notifyCopy}>
          <Text style={styles.notifyLabel}>Notify recipient</Text>
          <Text style={styles.notifyHint}>
            Send SMS and email when the gift ships and is delivered.
          </Text>
        </View>
        <Switch value={notifyRecipient} onValueChange={setNotifyRecipient} />
      </View>
      */}
      <FormField
        label="Delivery address"
        value={recipientAddress}
        onChangeText={setRecipientAddress}
        placeholder="Street, city"
        multiline
        style={styles.multiline}
      />
      <FormField
        label="Gift message"
        value={giftMessage}
        onChangeText={setGiftMessage}
        placeholder="Write a note for the recipient"
        multiline
        style={styles.multiline}
      />
      {/* Custom modal picker kept for comparison — swap back by uncommenting below.
      <DatePickerField
        label="Preferred delivery date (custom modal)"
        value={deliveryDate}
        onChange={setDeliveryDate}
        hint="Optional. Vendors will try to deliver on or near this date."
      />
      */}

      <NativeDatePickerField
        label="Preferred delivery date"
        value={deliveryDate}
        onChange={setDeliveryDate}
        hint="Optional. Vendors will try to deliver on or near this date."
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label={`Place order · ${formatMoney(subtotalCents)}`}
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  summaryLineText: {
    flex: 1,
    gap: Spacing.one,
  },
  summaryTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  summaryMeta: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  summaryLineTotal: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.surfaceBorder,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTotalLabel: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  summaryTotalValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  notifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  notifyCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  notifyLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  notifyHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: '#E05D5D',
    fontSize: 14,
  },
});
