import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  DashboardHeader,
  PrimaryButton,
  ScreenShell,
} from '@/components/dashboard';
import { FormField, GiftImagePicker, GiftStatusPicker, type GiftImageSelection } from '@/components/vendor';
import { GIFT_CATEGORIES } from '@/constants/vendor';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { createGift } from '@/lib/gifts';
import { resolveGiftImageUrls } from '@/lib/gift-image-upload';
import { parsePriceToCents } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftCategory, GiftStatus } from '@/types/vendor';

export default function VendorGiftNewScreen() {
  const { profile } = useAuth();
  const theme = useScreenTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [images, setImages] = useState<GiftImageSelection[]>([]);
  const [category, setCategory] = useState<GiftCategory>('flowers');
  const [status, setStatus] = useState<GiftStatus>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  async function handleCreate() {
    if (!profile) return;

    const priceCents = parsePriceToCents(price);
    const stockCount = Number.parseInt(stock, 10);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (images.length === 0) {
      setImageError('Add at least one photo for your gift.');
      return;
    }

    if (priceCents === null) {
      setError('Enter a valid price.');
      return;
    }

    if (!Number.isFinite(stockCount) || stockCount < 0) {
      setError('Enter a valid stock count.');
      return;
    }

    setLoading(true);
    setError(null);
    setImageError(null);

    const { urls, error: uploadError } = await resolveGiftImageUrls(profile.id, images);

    if (uploadError) {
      setLoading(false);
      setImageError(uploadError.message);
      return;
    }

    const { data, error: createError } = await createGift(profile.id, {
      title,
      description,
      priceCents,
      category,
      stock: stockCount,
      imageUrls: urls,
      status,
    });

    setLoading(false);

    if (createError || !data) {
      setError(createError?.message ?? 'Could not create gift.');
      return;
    }

    Alert.alert('Gift created', 'Your gift listing has been saved.', [
      { text: 'View gift', onPress: () => router.replace(`/vendor/gift/${data.id}`) },
    ]);
  }

  return (
    <ScreenShell scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <DashboardHeader
        title="Add a gift"
        subtitle="Photos, title, price, category, and stock."
        showBanner={false}
        showBack
        backHref="/vendor"
      />

      <GiftImagePicker value={images} onChange={setImages} error={imageError} />

      <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Rose bouquet" />
      <FormField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the gift experience."
        multiline
        style={styles.multiline}
      />
      <FormField
        label="Price"
        value={price}
        onChangeText={setPrice}
        placeholder="49.99"
        keyboardType="decimal-pad"
      />
      <FormField
        label="Stock"
        value={stock}
        onChangeText={setStock}
        placeholder="10"
        keyboardType="number-pad"
      />

      <View style={styles.field}>
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {GIFT_CATEGORIES.map((item) => {
            const selected = item.value === category;

            return (
              <Pressable
                key={item.value}
                onPress={() => setCategory(item.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? theme.surfaceSelected : theme.surface,
                    borderColor: selected ? theme.surfaceSelectedBorder : theme.surfaceBorder,
                  },
                ]}>
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <GiftStatusPicker value={status} onChange={setStatus} disabled={loading} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton label="Create gift" loading={loading} onPress={() => void handleCreate()} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  field: {
    gap: Spacing.two,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  chips: {
    gap: Spacing.two,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chipLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: Colors.text,
  },
  error: {
    color: '#E05D5D',
    fontSize: 14,
  },
});
