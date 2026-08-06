import { Switch, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';

import { DeliveryCitiesField } from './delivery-cities-field';
import { FormField } from './form-field';

export type DeliveryOptionsValue = {
  offersDelivery: boolean;
  deliveryRadiusKm: string;
  deliveryCharge: string;
  deliveryCities: string[];
};

type DeliveryOptionsFieldProps = {
  value: DeliveryOptionsValue;
  onChange: (value: DeliveryOptionsValue) => void;
  error?: string | null;
};

export function DeliveryOptionsField({ value, onChange, error }: DeliveryOptionsFieldProps) {
  const colors = useColors();

  function patch(next: Partial<DeliveryOptionsValue>) {
    onChange({ ...value, ...next });
  }

  return (
    <View style={styles.field}>
      <View style={styles.toggleRow}>
        <View style={styles.toggleCopy}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>Offer delivery</Text>
          <Text style={[styles.toggleHint, { color: colors.textSecondary }]}>
            {value.offersDelivery
              ? 'Buyers can have gifts delivered within your radius.'
              : 'Pickup only — buyers collect orders from your store.'}
          </Text>
        </View>
        <Switch
          value={value.offersDelivery}
          onValueChange={(offersDelivery) => patch({ offersDelivery })}
        />
      </View>

      {value.offersDelivery ? (
        <>
          <FormField
            label="Delivery radius (km)"
            value={value.deliveryRadiusKm}
            onChangeText={(deliveryRadiusKm) => patch({ deliveryRadiusKm })}
            placeholder="10"
            keyboardType="decimal-pad"
            hint="Maximum distance you deliver from your store."
          />
          <FormField
            label="Fixed delivery charge"
            value={value.deliveryCharge}
            onChangeText={(deliveryCharge) => patch({ deliveryCharge })}
            placeholder="5.00"
            keyboardType="decimal-pad"
            hint="Flat fee per vendor order at checkout. Use 0 for free delivery."
          />
          <DeliveryCitiesField
            value={value.deliveryCities}
            onChange={(deliveryCities) => patch({ deliveryCities })}
            hint="Add cities within your delivery radius."
          />
        </>
      ) : (
        <View
          style={[
            styles.pickupCard,
            {
              borderColor: colors.surfaceBorder,
              backgroundColor: colors.surface,
            },
          ]}>
          <Text style={[styles.pickupTitle, { color: colors.text }]}>Pickup / takeaway</Text>
          <Text style={[styles.pickupText, { color: colors.textSecondary }]}>
            Buyers will be told to collect their order from you. No delivery address is required at
            checkout.
          </Text>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.three,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  toggleCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggleHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  pickupCard: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Spacing.four,
  },
  pickupTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  pickupText: {
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: '#E05D5D',
    fontSize: 12,
  },
});
