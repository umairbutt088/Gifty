import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import type { GiftImageSelection } from '@/components/vendor/gift-image-picker';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type StoreLogoPickerProps = {
  value: GiftImageSelection | null;
  onChange: (value: GiftImageSelection | null) => void;
  label?: string;
  error?: string | null;
};

export function StoreLogoPicker({
  value,
  onChange,
  label = 'Store logo',
  error,
}: StoreLogoPickerProps) {
  const theme = useScreenTheme();
  const colors = useColors();

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to pick a store logo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      onChange({ uri: result.assets[0].uri, mimeType: result.assets[0].mimeType });
    }
  }

  async function pickFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a store logo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      onChange({ uri: result.assets[0].uri, mimeType: result.assets[0].mimeType });
    }
  }

  function showSourcePicker() {
    Alert.alert('Store logo', 'Choose a source', [
      { text: 'Photo library', onPress: () => void pickFromLibrary() },
      { text: 'Camera', onPress: () => void pickFromCamera() },
      ...(value ? [{ text: 'Remove', style: 'destructive' as const, onPress: () => onChange(null) }] : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>

      <Pressable
        onPress={showSourcePicker}
        style={({ pressed }) => [
          styles.tile,
          {
            backgroundColor: theme.surface,
            borderColor: error ? '#E05D5D' : theme.surfaceBorder,
          },
          pressed && styles.tilePressed,
        ]}>
        {value ? (
          <Image source={{ uri: value.uri }} style={styles.preview} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={[styles.addIcon, { color: colors.text }]}>+</Text>
            <Text style={[styles.addText, { color: colors.textSecondary }]}>Add logo</Text>
          </View>
        )}
      </Pressable>

      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Optional. Square image works best.
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  tile: {
    width: 112,
    height: 112,
    borderWidth: 1,
    borderRadius: Spacing.three,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tilePressed: {
    opacity: 0.88,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    padding: Spacing.two,
  },
  addIcon: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  addText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    color: '#E05D5D',
    fontSize: 12,
  },
});
