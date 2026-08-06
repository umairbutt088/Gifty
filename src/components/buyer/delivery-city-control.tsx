import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { MARKETPLACE_CITY_OPTIONS } from '@/lib/delivery-city-storage';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type DeliveryCityControlProps = {
  city: string | null;
  extraCities?: string[];
  onCityChange: (city: string | null) => void;
};

export function DeliveryCityControl({
  city,
  extraCities = [],
  onCityChange,
}: DeliveryCityControlProps) {
  const colors = useColors();
  const theme = useScreenTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const options = [
    ...new Set([
      ...MARKETPLACE_CITY_OPTIONS,
      ...extraCities.map((item) => item.trim()).filter(Boolean),
    ]),
  ].sort((left, right) => left.localeCompare(right));

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={city ? `Delivering to ${city}` : 'Choose delivery city'}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.control,
          {
            backgroundColor: theme.surfaceNested,
            borderColor: theme.surfaceBorder,
          },
          pressed && styles.pressed,
        ]}>
        <SymbolView
          name={{ ios: 'location.fill', android: 'location_on', web: 'location_on' }}
          tintColor={theme.accentLight}
          size={16}
        />
        <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
          {city ? `Delivering to ${city}` : 'Add delivery city'}
        </Text>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
          tintColor={colors.textMuted}
          size={16}
        />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
                borderColor: theme.surfaceBorder,
                paddingBottom: Math.max(insets.bottom, Spacing.three),
              },
            ]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Delivering to</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textMuted }]}>
              Show gifts from stores that deliver to your city
            </Text>

            <ScrollView style={styles.optionList} showsVerticalScrollIndicator={false}>
              <CityOption
                label="All cities"
                selected={!city}
                onPress={() => {
                  onCityChange(null);
                  setOpen(false);
                }}
              />
              {options.map((option) => (
                <CityOption
                  key={option}
                  label={option}
                  selected={city === option}
                  onPress={() => {
                    onCityChange(option);
                    setOpen(false);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

function CityOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const theme = useScreenTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: selected ? theme.accentMuted : theme.surfaceNested,
          borderColor: selected ? theme.tabActiveBorder : theme.surfaceBorder,
        },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.optionLabel, { color: selected ? theme.accentLight : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  control: {
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    alignSelf: 'flex-start',
  },
  label: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.two,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  sheetSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.two,
  },
  optionList: {
    maxHeight: 360,
  },
  option: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: Spacing.three,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});
