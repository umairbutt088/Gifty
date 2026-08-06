import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FormField } from '@/components/vendor/form-field';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import type { GiftVariantInput } from '@/types/vendor';

type GiftVariantsEditorProps = {
  value: GiftVariantInput[];
  onChange: (value: GiftVariantInput[]) => void;
};

export function GiftVariantsEditor({ value, onChange }: GiftVariantsEditorProps) {
  const colors = useColors();

  function updateVariant(index: number, patch: Partial<GiftVariantInput>) {
    onChange(value.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)));
  }

  function addVariant() {
    onChange([
      ...value,
      {
        label: '',
        priceCents: 0,
        stock: 0,
        sortOrder: value.length,
      },
    ]);
  }

  function removeVariant(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Options / variants</Text>
        <Pressable onPress={addVariant} style={({ pressed }) => pressed && styles.pressed}>
          <Text style={[styles.add, { color: colors.text }]}>Add option</Text>
        </Pressable>
      </View>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Optional sizes or flavors. Leave empty if the gift has one fixed price.
      </Text>

      {value.map((variant, index) => (
        <View key={`variant-${index}`} style={styles.card}>
          <FormField
            label={`Option ${index + 1} label`}
            value={variant.label}
            onChangeText={(label) => updateVariant(index, { label })}
            placeholder="1kg / Eggless"
          />
          <FormField
            label="Price"
            value={variant.priceCents > 0 ? (variant.priceCents / 100).toFixed(2) : ''}
            onChangeText={(raw) => {
              const cleaned = raw.replace(/[^0-9.]/g, '');
              const amount = Number.parseFloat(cleaned);
              updateVariant(index, {
                priceCents: Number.isFinite(amount) ? Math.round(amount * 100) : 0,
              });
            }}
            keyboardType="decimal-pad"
            placeholder="49.99"
          />
          <FormField
            label="Stock"
            value={String(variant.stock)}
            onChangeText={(raw) => {
              const stock = Number.parseInt(raw.replace(/[^0-9]/g, ''), 10);
              updateVariant(index, {
                stock: Number.isFinite(stock) ? stock : 0,
              });
            }}
            keyboardType="number-pad"
            placeholder="10"
          />
          <Pressable
            onPress={() => removeVariant(index)}
            style={({ pressed }) => pressed && styles.pressed}>
            <Text style={styles.remove}>Remove option</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  add: {
    fontSize: 13,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  remove: {
    color: '#E05D5D',
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
