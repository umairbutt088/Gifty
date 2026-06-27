import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { QuantityStepper } from '@/components/buyer/quantity-stepper';
import { GlassCard } from '@/components/glass-card';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { CartItem } from '@/types/cart';

type CartLineItemProps = {
  item: CartItem;
  onChangeQuantity: (quantity: number) => void;
  onRemove: () => void;
};

export function CartLineItem({ item, onChangeQuantity, onRemove }: CartLineItemProps) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.imageWrap}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Gift</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Pressable onPress={onRemove} hitSlop={8} style={({ pressed }) => [pressed && styles.removePressed]}>
            <Text style={styles.removeLabel}>Remove</Text>
          </Pressable>
        </View>

        <Text style={styles.price}>{formatMoney(item.priceCents)} each</Text>

        <View style={styles.footer}>
          <QuantityStepper
            value={item.quantity}
            max={item.stock}
            onChange={onChangeQuantity}
          />
          <Text style={styles.lineTotal}>{formatMoney(item.priceCents * item.quantity)}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: Spacing.two,
    gap: Spacing.two,
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: Spacing.two,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceNested,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  removeLabel: {
    color: '#E05D5D',
    fontSize: 12,
    fontWeight: '600',
  },
  removePressed: {
    opacity: 0.7,
  },
  price: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  lineTotal: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
