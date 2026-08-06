import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    DashboardHeader,
    PrimaryButton,
    ScreenShell,
} from "@/components/dashboard";
import { ThemedActivityIndicator } from "@/components/themed-activity-indicator";
import {
    FormField,
    GiftImagePicker,
    GiftStatusPicker,
    GiftVariantsEditor,
    OccasionTagsField,
    type GiftImageSelection,
} from "@/components/vendor";
import { useColors } from "@/hooks/use-colors";
import { Spacing } from "@/constants/theme";
import { GIFT_CATEGORIES } from "@/constants/vendor";
import { parsePriceToCents } from "@/lib/format";
import { resolveGiftImageUrls } from "@/lib/gift-image-upload";
import { fetchGiftVariants, replaceGiftVariants } from "@/lib/gift-variants";
import { fetchGiftById, softDeleteGift, updateGift } from "@/lib/gifts";
import { useAuth } from "@/providers/auth-provider";
import { useScreenTheme } from "@/providers/screen-theme-provider";
import type {
    GiftCategory,
    GiftOccasion,
    GiftRow,
    GiftStatus,
    GiftVariantInput,
} from "@/types/vendor";

export default function VendorGiftEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const theme = useScreenTheme();
  const colors = useColors();
  const [gift, setGift] = useState<GiftRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stock, setStock] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [featured, setFeatured] = useState(false);
  const [variants, setVariants] = useState<GiftVariantInput[]>([]);
  const [images, setImages] = useState<GiftImageSelection[]>([]);
  const [category, setCategory] = useState<GiftCategory>("other");
  const [occasionTags, setOccasionTags] = useState<GiftOccasion[]>([]);
  const [status, setStatus] = useState<GiftStatus>("live");

  useEffect(() => {
    if (!id) return;

    Promise.all([fetchGiftById(id), fetchGiftVariants(id)]).then(
      ([row, giftVariants]) => {
        if (!row) {
          setLoading(false);
          return;
        }

        setGift(row);
        setTitle(row.title);
        setDescription(row.description ?? "");
        setPrice((row.price_cents / 100).toFixed(2));
        setCompareAtPrice(
          row.original_price_cents != null
            ? (row.original_price_cents / 100).toFixed(2)
            : "",
        );
        setStock(String(row.stock));
        setPrepTime(
          row.prep_time_minutes != null ? String(row.prep_time_minutes) : "",
        );
        setFeatured(Boolean(row.featured));
        setImages(row.image_urls.map((uri) => ({ uri })));
        setCategory(row.category);
        setOccasionTags(row.occasion_tags ?? []);
        setStatus(row.status);
        setVariants(
          giftVariants.map((variant, index) => ({
            label: variant.label,
            priceCents: variant.price_cents,
            stock: variant.stock,
            sortOrder: variant.sort_order ?? index,
          })),
        );
        setLoading(false);
      },
    );
  }, [id]);

  async function handleSave() {
    if (!gift || !profile) return;

    const priceCents = parsePriceToCents(price);
    const originalPriceCents = compareAtPrice.trim()
      ? parsePriceToCents(compareAtPrice)
      : null;
    const stockCount = Number.parseInt(stock, 10);
    const prepTimeMinutes = prepTime.trim()
      ? Number.parseInt(prepTime.replace(/[^0-9]/g, ""), 10)
      : null;

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (images.length === 0) {
      setImageError("Add at least one photo for your gift.");
      return;
    }

    if (priceCents === null) {
      setError("Enter a valid price.");
      return;
    }

    if (originalPriceCents === null && compareAtPrice.trim()) {
      setError("Enter a valid compare-at price.");
      return;
    }

    if (originalPriceCents != null && originalPriceCents < priceCents) {
      setError(
        "Compare-at price must be greater than or equal to the selling price.",
      );
      return;
    }

    if (!Number.isFinite(stockCount) || stockCount < 0) {
      setError("Enter a valid stock count.");
      return;
    }

    if (
      prepTimeMinutes != null &&
      (!Number.isFinite(prepTimeMinutes) || prepTimeMinutes <= 0)
    ) {
      setError("Enter a valid prep time in minutes.");
      return;
    }

    for (const variant of variants) {
      if (!variant.label.trim()) {
        setError("Each option needs a label.");
        return;
      }
      if (
        variant.priceCents < 0 ||
        !Number.isFinite(variant.stock) ||
        variant.stock < 0
      ) {
        setError("Each option needs a valid price and stock.");
        return;
      }
    }

    setSaving(true);
    setError(null);
    setImageError(null);

    const { urls, error: uploadError } = await resolveGiftImageUrls(
      profile.id,
      images,
    );

    if (uploadError) {
      setSaving(false);
      setImageError(uploadError.message);
      return;
    }

    const { data, error: saveError } = await updateGift(gift.id, {
      title,
      description,
      priceCents,
      originalPriceCents,
      stock: stockCount,
      category,
      status,
      imageUrls: urls,
      featured,
      prepTimeMinutes,
      occasionTags,
    });

    if (!data) {
      setSaving(false);
      setError(saveError?.message ?? 'Could not save gift.');
      return;
    }

    const { error: variantsError } = await replaceGiftVariants(
      gift.id,
      variants,
    );
    setSaving(false);

    if (variantsError) {
      setError(variantsError.message);
      return;
    }

    // Partial success: gift row saved but occasion tags may still need migration.
    if (saveError) {
      Alert.alert('Saved with a warning', saveError.message, [
        {
          text: 'Done',
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace(`/vendor/gift/${gift.id}`);
          },
        },
      ]);
      return;
    }

    Alert.alert('Saved', 'Gift listing updated.', [
      {
        text: 'Done',
        onPress: () => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace(`/vendor/gift/${gift.id}`);
        },
      },
    ]);
  }

  async function handleDelete() {
    if (!gift) return;

    Alert.alert(
      "Delete gift",
      "Move this gift to Deleted gifts? You can restore it later with photos intact.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error: deleteError } = await softDeleteGift(gift.id);
            if (deleteError) {
              Alert.alert("Could not delete", deleteError.message);
              return;
            }
            router.replace("/vendor");
          },
        },
      ],
    );
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
        <DashboardHeader
          title="Gift not found"
          showBanner={false}
          showBack
          backHref="/vendor"
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scrollProps={{ keyboardShouldPersistTaps: "handled" }}>
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
      <FormField
        label="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />
      <FormField
        label="Compare-at price (optional)"
        value={compareAtPrice}
        onChangeText={setCompareAtPrice}
        keyboardType="decimal-pad"
      />
      <FormField
        label="Stock"
        value={stock}
        onChangeText={setStock}
        keyboardType="number-pad"
      />
      <FormField
        label="Prep time in minutes (optional)"
        value={prepTime}
        onChangeText={setPrepTime}
        keyboardType="number-pad"
      />

      <Pressable
        onPress={() => setFeatured((current) => !current)}
        style={[
          styles.featuredToggle,
          {
            backgroundColor: featured ? theme.surfaceSelected : theme.surface,
            borderColor: featured
              ? theme.surfaceSelectedBorder
              : theme.surfaceBorder,
          },
        ]}
      >
        <Text style={[styles.featuredLabel, { color: colors.text }]}>
          {featured ? "Featured on marketplace" : "Mark as featured"}
        </Text>
      </Pressable>

      <GiftVariantsEditor value={variants} onChange={setVariants} />

      <OccasionTagsField value={occasionTags} onChange={setOccasionTags} />

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {GIFT_CATEGORIES.map((item) => {
            const selected = item.value === category;
            return (
              <Pressable
                key={item.value}
                onPress={() => setCategory(item.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected
                      ? theme.surfaceSelected
                      : theme.surface,
                    borderColor: selected
                      ? theme.surfaceSelectedBorder
                      : theme.surfaceBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    { color: selected ? colors.text : colors.textSecondary },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <GiftStatusPicker value={status} onChange={setStatus} disabled={saving} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label="Save changes"
        loading={saving}
        onPress={() => void handleSave()}
      />
      <PrimaryButton
        label="Delete gift"
        variant="secondary"
        onPress={() => void handleDelete()}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  field: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
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
    fontWeight: "600",
  },
  error: {
    color: "#E05D5D",
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
    fontWeight: "700",
  },
});
