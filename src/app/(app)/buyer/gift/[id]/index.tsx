import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
    CartHeaderButton,
    FavoriteButton,
    GiftReviewsSection,
    ProductBuyBar,
    QuantityStepper,
    VendorStorePreview,
} from "@/components/buyer";
import {
    DashboardHeader,
    SCREEN_HORIZONTAL_PADDING,
    ScreenShell,
    SectionTitle,
} from "@/components/dashboard";
import { GlassCard } from "@/components/glass-card";
import { ImageGalleryViewer } from "@/components/image-gallery-viewer";
import { ThemedActivityIndicator } from "@/components/themed-activity-indicator";
import { Spacing } from "@/constants/theme";
import { GIFT_CATEGORIES } from "@/constants/vendor";
import { useColors } from "@/hooks/use-colors";
import { formatMoney } from "@/lib/format";
import { fetchFavoriteGiftIds, toggleGiftFavorite } from "@/lib/gift-favorites";
import {
    formatGiftRating,
    formatPrepTime,
    getGiftAvailableStock,
    getGiftDiscountPercent,
    getGiftEffectivePrice,
} from "@/lib/gift-marketplace";
import {
    canBuyerReviewGift,
    fetchBuyerGiftReview,
    fetchGiftReviews,
    upsertGiftReview,
} from "@/lib/gift-reviews";
import { fetchGiftVariants } from "@/lib/gift-variants";
import { fetchLiveGiftById } from "@/lib/gifts";
import { fetchPublicVendorStore } from "@/lib/vendor-store";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/providers/cart-provider";
import { useScreenTheme } from "@/providers/screen-theme-provider";
import type {
    GiftReviewRow,
    GiftRow,
    GiftVariantRow,
    VendorStorePublic,
} from "@/types/vendor";

export default function BuyerGiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { addGift } = useCart();
  const colors = useColors();
  const theme = useScreenTheme();
  const [gift, setGift] = useState<GiftRow | null>(null);
  const [store, setStore] = useState<VendorStorePublic | null>(null);
  const [variants, setVariants] = useState<GiftVariantRow[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [reviews, setReviews] = useState<GiftReviewRow[]>([]);
  const [ownReview, setOwnReview] = useState<GiftReviewRow | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? null,
    [selectedVariantId, variants],
  );
  const unitPrice = gift ? getGiftEffectivePrice(gift, selectedVariant) : 0;
  const availableStock = gift
    ? getGiftAvailableStock(gift, selectedVariant)
    : 0;
  const discountPercent = gift ? getGiftDiscountPercent(gift) : null;
  const ratingLabel = gift ? formatGiftRating(gift) : null;
  const prepLabel = gift ? formatPrepTime(gift.prep_time_minutes) : null;

  const loadGift = useCallback(async () => {
    if (!id) return;

    const row = await fetchLiveGiftById(id);
    setGift(row);

    if (row) {
      const [storeRow, giftVariants, giftReviews] = await Promise.all([
        fetchPublicVendorStore(row.vendor_id),
        fetchGiftVariants(row.id),
        fetchGiftReviews(row.id),
      ]);

      setStore(storeRow);
      setVariants(giftVariants);
      setReviews(giftReviews);

      const firstAvailable =
        giftVariants.find((variant) => variant.stock > 0) ??
        giftVariants[0] ??
        null;
      setSelectedVariantId((current) => {
        if (current && giftVariants.some((variant) => variant.id === current)) {
          return current;
        }
        return firstAvailable?.id ?? null;
      });

      if (profile?.id) {
        const [favorites, review, eligible] = await Promise.all([
          fetchFavoriteGiftIds(profile.id),
          fetchBuyerGiftReview(row.id, profile.id),
          canBuyerReviewGift(row.id, profile.id),
        ]);
        setFavorited(favorites.has(row.id));
        setOwnReview(review);
        setCanReview(eligible);
      } else {
        setFavorited(false);
        setOwnReview(null);
        setCanReview(false);
      }
    } else {
      setStore(null);
      setVariants([]);
      setSelectedVariantId(null);
      setReviews([]);
      setOwnReview(null);
      setCanReview(false);
      setFavorited(false);
    }

    setLoading(false);
  }, [id, profile?.id]);

  useFocusEffect(
    useCallback(() => {
      void loadGift();
    }, [loadGift]),
  );

  async function handleToggleFavorite() {
    if (!profile?.id || !gift) return;

    const previous = favorited;
    setFavorited(!previous);
    const { favorited: next, error } = await toggleGiftFavorite(
      profile.id,
      gift.id,
      previous,
    );
    if (error) {
      setFavorited(previous);
      return;
    }
    setFavorited(next);
  }

  function handleAddToCart(goCheckout = false) {
    if (!gift || availableStock < 1) return;

    addGift(gift, quantity, {
      variantId: selectedVariant?.id ?? null,
      variantLabel: selectedVariant?.label ?? null,
      priceCents: unitPrice,
      stock: availableStock,
    });
    setAddedMessage(`Added ${quantity} to cart`);

    if (goCheckout) {
      router.push("/buyer/checkout");
    }
  }

  async function handleSubmitReview(rating: number, comment: string) {
    if (!profile?.id || !gift) return;

    setReviewSubmitting(true);
    const { data, error } = await upsertGiftReview({
      giftId: gift.id,
      buyerId: profile.id,
      rating,
      comment,
    });
    setReviewSubmitting(false);

    if (error || !data) return;

    setOwnReview(data);
    const nextReviews = await fetchGiftReviews(gift.id);
    setReviews(nextReviews);
    const refreshed = await fetchLiveGiftById(gift.id);
    if (refreshed) setGift(refreshed);
  }

  if (loading) {
    return (
      <ScreenShell scroll={false}>
        <ThemedActivityIndicator style={{ marginTop: 48 }} />
      </ScreenShell>
    );
  }

  if (!gift) {
    return (
      <ScreenShell>
        <DashboardHeader
          title="Gift not found"
          showBanner={false}
          showBack
          backHref="/buyer"
        />
      </ScreenShell>
    );
  }

  const categoryLabel =
    GIFT_CATEGORIES.find((item) => item.value === gift.category)?.label ??
    gift.category;

  return (
    <ScreenShell
      scroll={false}
      backgroundVariant="minimal"
      safeAreaEdges={['top', 'left', 'right']}>
      <DashboardHeader
        title={gift.title}
        showBanner={false}
        showBack
        backHref="/buyer"
        trailing={
          <View style={styles.headerActions}>
            <FavoriteButton
              favorited={favorited}
              onPress={() => void handleToggleFavorite()}
            />
            <CartHeaderButton />
          </View>
        }
      />

      <View style={styles.body}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ImageGalleryViewer images={gift.image_urls} />

          <GlassCard variant="nested" style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={[styles.category, { color: theme.accentLight }]}>
                {categoryLabel}
              </Text>
              {discountPercent ? (
                <View
                  style={[styles.dealBadge, { backgroundColor: theme.accent }]}
                >
                  <Text style={styles.dealBadgeText}>
                    {discountPercent}% OFF
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={[styles.title, { color: colors.text }]}>
              {gift.title}
            </Text>

            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.text }]}>
                {formatMoney(unitPrice)}
              </Text>
              {gift.original_price_cents &&
              gift.original_price_cents > gift.price_cents ? (
                <Text style={[styles.compareAt, { color: colors.textMuted }]}>
                  {formatMoney(gift.original_price_cents)}
                </Text>
              ) : null}
            </View>

            <View style={styles.metaRow}>
              {ratingLabel ? (
                <Text
                  style={[styles.metaText, { color: colors.textSecondary }]}
                >
                  ★ {ratingLabel}
                </Text>
              ) : (
                <Text style={[styles.metaText, { color: colors.textMuted }]}>
                  No ratings yet
                </Text>
              )}
              {prepLabel ? (
                <Text
                  style={[styles.metaText, { color: colors.textSecondary }]}
                >
                  {prepLabel}
                </Text>
              ) : null}
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {availableStock <= 5
                  ? availableStock === 1
                    ? "Last one left"
                    : `${availableStock} left`
                  : "In stock"}
              </Text>
            </View>
          </GlassCard>

          {variants.length > 0 ? (
            <>
              <SectionTitle>Choose an option</SectionTitle>
              <View style={styles.variantRow}>
                {variants.map((variant) => {
                  const selected = variant.id === selectedVariantId;
                  const disabled = variant.stock < 1;

                  return (
                    <Pressable
                      key={variant.id}
                      disabled={disabled}
                      onPress={() => {
                        setSelectedVariantId(variant.id);
                        setQuantity(1);
                      }}
                      style={({ pressed }) => [
                        styles.variantChip,
                        {
                          backgroundColor: selected
                            ? theme.accentMuted
                            : theme.surfaceNested,
                          borderColor: selected
                            ? theme.tabActiveBorder
                            : theme.surfaceBorder,
                          opacity: disabled ? 0.45 : 1,
                        },
                        pressed && !disabled && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.variantLabel,
                          { color: selected ? theme.accentLight : colors.text },
                        ]}
                      >
                        {variant.label}
                      </Text>
                      <Text
                        style={[
                          styles.variantPrice,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {formatMoney(variant.price_cents)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          {gift.description ? (
            <>
              <SectionTitle>Description</SectionTitle>
              <GlassCard variant="nested" style={styles.infoCard}>
                <Text
                  style={[styles.description, { color: colors.textSecondary }]}
                >
                  {gift.description}
                </Text>
              </GlassCard>
            </>
          ) : null}

          {store ? (
            <>
              <SectionTitle>Store</SectionTitle>
              <VendorStorePreview store={store} compact />
            </>
          ) : null}

          <SectionTitle>Quantity</SectionTitle>
          <GlassCard variant="nested" style={styles.quantityCard}>
            <QuantityStepper
              value={quantity}
              max={Math.max(availableStock, 1)}
              onChange={setQuantity}
            />
            <Text style={[styles.quantityHint, { color: colors.text }]}>
              {formatMoney(unitPrice * quantity)} total
            </Text>
          </GlassCard>

          <SectionTitle>Reviews</SectionTitle>
          <GiftReviewsSection
            reviews={reviews}
            canReview={canReview}
            existingRating={ownReview?.rating}
            existingComment={ownReview?.comment}
            submitting={reviewSubmitting}
            onSubmit={handleSubmitReview}
          />
        </ScrollView>

        <ProductBuyBar
          unitPrice={unitPrice}
          quantity={quantity}
          variantLabel={selectedVariant?.label}
          disabled={availableStock < 1}
          message={addedMessage}
          onAddToCart={() => handleAddToCart(false)}
          onBuyNow={() => handleAddToCart(true)}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  body: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_HORIZONTAL_PADDING,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  summaryCard: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  category: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  dealBadge: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  dealBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.two,
  },
  price: {
    fontSize: 24,
    fontWeight: "800",
  },
  compareAt: {
    fontSize: 14,
    textDecorationLine: "line-through",
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "600",
  },
  variantRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  variantChip: {
    minWidth: 108,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  variantLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  variantPrice: {
    fontSize: 12,
    fontWeight: "600",
  },
  infoCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  quantityCard: {
    padding: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  quantityHint: {
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
  },
});
