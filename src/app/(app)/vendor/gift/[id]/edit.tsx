import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  DashboardHeader,
  PrimaryButton,
  ScreenShell,
} from '@/components/dashboard';
import { FormField, GiftImagePicker, GiftStatusPicker, type GiftImageSelection } from '@/components/vendor';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { GIFT_CATEGORIES } from '@/constants/vendor';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { parsePriceToCents } from '@/lib/format';
import { softDeleteGift, fetchGiftById, updateGift } from '@/lib/gifts';
import { resolveGiftImageUrls } from '@/lib/gift-image-upload';
import { useAuth } from '@/providers/auth-provider';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftCategory, GiftRow, GiftStatus } from '@/types/vendor';

export default function VendorGiftEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const theme = useScreenTheme();
  const [gift, setGift] = useState<GiftRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [images, setImages] = useState<GiftImageSelection[]>([]);
  const [category, setCategory] = useState<GiftCategory>('other');
  const [status, setStatus] = useState<GiftStatus>('live');

  useEffect(() => {
    if (!id) return;

    fetchGiftById(id).then((row) => {
      if (!row) {
        setLoading(false);
        return;
      }

      setGift(row);
      setTitle(row.title);
      setDescription(row.description ?? '');
      setPrice((row.price_cents / 100).toFixed(2));
      setStock(String(row.stock));
      setImages(row.image_urls.map((uri) => ({ uri })));
      setCategory(row.category);
      setStatus(row.status);
      setLoading(false);
    });
  }, [id]);

  async function handleSave() {
    if (!gift || !profile) return;

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

    setSaving(true);
    setError(null);
    setImageError(null);

    const { urls, error: uploadError } = await resolveGiftImageUrls(profile.id, images);

    if (uploadError) {
      setSaving(false);
      setImageError(uploadError.message);
      return;
    }

    const { data, error: saveError } = await updateGift(gift.id, {
      title,
      description,
      priceCents,
      stock: stockCount,
      category,
      status,
      imageUrls: urls,
    });

    setSaving(false);

    if (saveError || !data) {
      setError(saveError?.message ?? 'Could not save gift.');
      return;
    }

    Alert.alert('Saved', 'Gift listing updated.', [
      { text: 'Done', onPress: () => router.replace(`/vendor/gift/${gift.id}`) },
    ]);
  }

  async function handleDelete() {
    if (!gift) return;

    Alert.alert(
      'Delete gift',
      'Move this gift to Deleted gifts? You can restore it later with photos intact.',
      [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error: deleteError } = await softDeleteGift(gift.id);
          if (deleteError) {
            Alert.alert('Could not delete', deleteError.message);
            return;
          }
          router.replace('/vendor');
        },
      },
    ]);
  }

  if (loading) {
    return (
      <ScreenShell scroll={false}>
        <ThemedActivityIndicator style={{ marginTop: 48 }} />
      </ScreenShell>
    );
  }

  if (!gift || gift.vendor_id !== profile?.id) {
    return (
      <ScreenShell>
        <DashboardHeader title="Gift not found" showBanner={false} showBack backHref="/vendor" />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <DashboardHeader
        title="Edit gift"
        subtitle="Update photos, price, and details."
        showBanner={false}
        showBack
        backHref={`/vendor/gift/${gift.id}`}
      />

      <GiftImagePicker value={images} onChange={setImages} error={imageError} />

      <FormField label="Title" value={title} onChangeText={setTitle} />
      <FormField
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.multiline}
      />
      <FormField label="Price" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
      <FormField label="Stock" value={stock} onChangeText={setStock} keyboardType="number-pad" />

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

      <GiftStatusPicker value={status} onChange={setStatus} disabled={saving} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton label="Save changes" loading={saving} onPress={() => void handleSave()} />
      <PrimaryButton label="Delete gift" variant="secondary" onPress={() => void handleDelete()} />
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
