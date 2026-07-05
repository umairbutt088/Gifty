import { StyleSheet, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { formatDeliveryDateLabel, formatMoney } from '@/lib/format';
import type { VendorOrderWithGift } from '@/types/vendor';

import { InfoRow } from './info-row';

type OrderDetailsCardProps = {
  order: VendorOrderWithGift;
};

export function OrderDetailsCard({ order }: OrderDetailsCardProps) {
  return (
    <GlassCard style={styles.card}>
      <InfoRow label="Recipient" value={order.recipient_name} />
      <InfoRow
        label="Fulfillment"
        value={order.fulfillment_type === 'pickup' ? 'Pickup / takeaway' : 'Delivery'}
      />
      <InfoRow label="Order total" value={formatMoney(order.total_cents)} />
      {order.delivery_charge_cents > 0 ? (
        <InfoRow
          label="Delivery charge"
          value={formatMoney(order.delivery_charge_cents)}
        />
      ) : null}
      <InfoRow
        label="Gift quantity"
        value={`${order.quantity} ${order.quantity === 1 ? 'item' : 'items'}`}
      />

      {order.delivery_date ? (
        <InfoRow
          label="Requested delivery"
          value={formatDeliveryDateLabel(order.delivery_date)}
        />
      ) : null}

      {order.recipient_address ? (
        <InfoRow label="Delivery address" value={order.recipient_address} multiline />
      ) : null}

      {order.recipient_phone ? (
        <InfoRow label="Phone" value={order.recipient_phone} />
      ) : null}

      {order.recipient_email ? (
        <InfoRow label="Email" value={order.recipient_email} />
      ) : null}

      {order.recipient_confirmed_at ? (
        <InfoRow
          label="Delivery confirmed"
          value={new Date(order.recipient_confirmed_at).toLocaleString()}
        />
      ) : null}

      {order.gift_message ? (
        <View style={styles.messageBlock}>
          <InfoRow label="Gift message" value={order.gift_message} italic multiline />
        </View>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  messageBlock: {
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
});
