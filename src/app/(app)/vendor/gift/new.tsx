import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  DashboardHeader,
  PrimaryButton,
  ScreenShell,
} from '@/components/dashboard';
import {
  FormField,
  GiftImagePicker,
  GiftStatusPicker,
  GiftVariantsEditor,
  OccasionTagsField,
  type GiftImageSelection,
} from '@/components/vendor';
import { GIFT_CATEGORIES } from '@/constants/vendor';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { createGift } from '@/lib/gifts';
import { resolveGiftImageUrls } from '@/lib/gift-image-upload';
import { replaceGiftVariants } from '@/lib/gift-variants';
import { parsePriceToCents } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftCategory, GiftOccasion, GiftStatus, GiftVariantInput } from '@/types/vendor';

export default function VendorGiftNewScreen() {
  const { profile } = useAuth();
  const theme = useScreenTheme();
  const colors = useColors();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [prepTime, setPrepTime] = useState('');
  const [featured, setFeatured] = useState(false);
  const [variants, setVariants] = useState<GiftVariantInput[]>([]);
  const [images, setImages] = useState<GiftImageSelection[]>([]);
  const [category, setCategory] = useState<GiftCategory>('flowers');
  const [occasionTags, setOccasionTags] = useState<GiftOccasion[]>([]);
  const [status, setStatus] = useState<GiftStatus>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  async function handleCreate() {
    if (!profile) return;

    const priceCents = parsePriceToCents(price);
    const originalPriceCents = compareAtPrice.trim()
      ? parsePriceToCents(compareAtPrice)
      : null;
    const stockCount = Number.parseInt(stock, 10);
    const prepTimeMinutes = prepTime.trim()
      ? Number.parseInt(prepTime.replace(/[^0-9]/g, ''), 10)
      : null;

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

    if (originalPriceCents === null && compareAtPrice.trim()) {
      setError('Enter a valid compare-at price.');
      return;
    }

    if (originalPriceCents != null && originalPriceCents < priceCents) {
      setError('Compare-at price must be greater than or equal to the selling price.');
      return;
    }

    if (!Number.isFinite(stockCount) || stockCount < 0) {
      setError('Enter a valid stock count.');
      return;
    }

    if (prepTimeMinutes != null && (!Number.isFinite(prepTimeMinutes) || prepTimeMinutes <= 0)) {
      setError('Enter a valid prep time in minutes.');
      return;
    }

    for (const variant of variants) {
      if (!variant.label.trim()) {
        setError('Each option needs a label.');
        return;
      }
      if (variant.priceCents < 0 || !Number.isFinite(variant.stock) || variant.stock < 0) {
        setError('Each option needs a valid price and stock.');
        return;
      }
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
      originalPriceCents,
      category,
      stock: stockCount,
      imageUrls: urls,
      status,
      featured,
      prepTimeMinutes,
      occasionTags,
    });

    if (createError || !data) {
      setLoading(false);
      setError(createError?.message ?? 'Could not create gift.');
      return;
    }

    if (variants.length > 0) {
      const { error: variantsError } = await replaceGiftVariants(data.id, variants);
      if (variantsError) {
        setLoading(false);
        setError(variantsError.message);
        return;
      }
    }

    setLoading(false);

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
        label="Compare-at price (optional)"
        value={compareAtPrice}
        onChangeText={setCompareAtPrice}
        placeholder="59.99"
        keyboardType="decimal-pad"
      />
      <FormField
        label="Stock"
        value={stock}
        onChangeText={setStock}
        placeholder="10"
        keyboardType="number-pad"
      />
      <FormField
        label="Prep time in minutes (optional)"
        value={prepTime}
        onChangeText={setPrepTime}
        placeholder="60"
        keyboardType="number-pad"
      />

      <Pressable
        onPress={() => setFeatured((current) => !current)}
        style={[
          styles.featuredToggle,
          {
            backgroundColor: featured ? theme.surfaceSelected : theme.surface,
            borderColor: featured ? theme.surfaceSelectedBorder : theme.surfaceBorder,
          },
        ]}>
        <Text style={[styles.featuredLabel, { color: colors.text }]}>
          {featured ? 'Featured on marketplace' : 'Mark as featured'}
        </Text>
      </Pressable>

      <GiftVariantsEditor value={variants} onChange={setVariants} />

      <OccasionTagsField value={occasionTags} onChange={setOccasionTags} />

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
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
                <Text
                  style={[
                    styles.chipLabel,
                    { color: selected ? colors.text : colors.textSecondary },
                  ]}>
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
    fontSize: 13,
    fontWeight: '600',
  },
  error: {
    color: '#E05D5D',
    fontSize: 14,
  },
  featuredToggle: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  featuredLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
