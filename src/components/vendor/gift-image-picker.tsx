import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';

export type GiftImageSelection = {
  uri: string;
  mimeType?: string | null;
};

const MAX_IMAGES = 10;

type GiftImagePickerProps = {
  value: GiftImageSelection[];
  onChange: (value: GiftImageSelection[]) => void;
  label?: string;
  error?: string | null;
  maxImages?: number;
};

export function GiftImagePicker({
  value,
  onChange,
  label = 'Photos',
  error,
  maxImages = MAX_IMAGES,
}: GiftImagePickerProps) {
  const theme = useScreenTheme();
  const canAddMore = value.length < maxImages;

  function appendImages(assets: ImagePicker.ImagePickerAsset[]) {
    const remaining = maxImages - value.length;
    const next = assets.slice(0, remaining).map((asset) => ({
      uri: asset.uri,
      mimeType: asset.mimeType,
    }));

    if (next.length === 0) return;

    onChange([...value, ...next]);

    if (assets.length > remaining) {
      Alert.alert('Limit reached', `You can add up to ${maxImages} photos per gift.`);
    }
  }

  async function pickFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to pick gift photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: maxImages - value.length,
      quality: 0.85,
    });

    if (!result.canceled && result.assets.length > 0) {
      appendImages(result.assets);
    }
  }

  async function pickFromCamera() {
    if (!canAddMore) {
      Alert.alert('Limit reached', `You can add up to ${maxImages} photos per gift.`);
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a gift photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      appendImages(result.assets);
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function clearAll() {
    onChange([]);
  }

  function showSourcePicker() {
    Alert.alert('Add photos', 'Choose a source', [
      { text: 'Photo library', onPress: () => void pickFromLibrary() },
      { text: 'Camera', onPress: () => void pickFromCamera() },
      ...(value.length > 0
        ? [{ text: 'Remove all', style: 'destructive' as const, onPress: clearAll }]
        : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>
          {value.length}/{maxImages}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gallery}>
        {value.map((image, index) => (
          <View key={`${image.uri}-${index}`} style={styles.thumbWrap}>
            <Image source={{ uri: image.uri }} style={styles.thumb} contentFit="cover" />
            <Pressable
              accessibilityLabel="Remove photo"
              onPress={() => removeImage(index)}
              style={styles.removeButton}>
              <Text style={styles.removeLabel}>×</Text>
            </Pressable>
          </View>
        ))}

        {canAddMore ? (
          <Pressable
            onPress={showSourcePicker}
            style={({ pressed }) => [
              styles.addTile,
              {
                backgroundColor: theme.surface,
                borderColor: error ? '#E05D5D' : theme.surfaceBorder,
              },
              pressed && styles.addTilePressed,
            ]}>
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addText}>Add photos</Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {value.length === 0 ? (
        <Pressable onPress={showSourcePicker}>
          <Text style={styles.hint}>Tap to pick from gallery or camera</Text>
        </Pressable>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  count: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  gallery: {
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  thumbWrap: {
    position: 'relative',
  },
  thumb: {
    width: 112,
    height: 112,
    borderRadius: Spacing.three,
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeLabel: {
    color: Colors.text,
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '700',
  },
  addTile: {
    width: 112,
    height: 112,
    borderWidth: 1,
    borderRadius: Spacing.three,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    padding: Spacing.two,
  },
  addTilePressed: {
    opacity: 0.88,
  },
  addIcon: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  addText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  error: {
    color: '#E05D5D',
    fontSize: 12,
  },
});
