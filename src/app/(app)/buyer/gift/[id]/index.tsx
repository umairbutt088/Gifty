import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { QuantityStepper } from '@/components/buyer';
import {
  DashboardHeader,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { GlassCard } from '@/components/glass-card';
import { ImageGalleryViewer } from '@/components/image-gallery-viewer';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { GIFT_CATEGORIES } from '@/constants/vendor';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import { fetchLiveGiftById } from '@/lib/gifts';
import { useCart } from '@/providers/cart-provider';
import type { GiftRow } from '@/types/vendor';

export default function BuyerGiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addGift } = useCart();
  const [gift, setGift] = useState<GiftRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const loadGift = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    const row = await fetchLiveGiftById(id);
    setGift(row);
    if (row) {
      setQuantity((current) => Math.min(current, row.stock));
    }
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadGift();
    }, [loadGift]),
  );

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
        <DashboardHeader title="Gift not found" showBanner={false} showBack backHref="/buyer" />
      </ScreenShell>
    );
  }

  const categoryLabel =
    GIFT_CATEGORIES.find((item) => item.value === gift.category)?.label ?? gift.category;

  return (
    <ScreenShell scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <DashboardHeader
        title={gift.title}
        subtitle={formatMoney(gift.price_cents)}
        showBanner={false}
        showBack
        backHref="/buyer"
      />

      <ImageGalleryViewer images={gift.image_urls} />

      <SectionTitle>Details</SectionTitle>
      <GlassCard style={styles.infoCard}>
        <InfoRow label="Price" value={formatMoney(gift.price_cents)} />
        <InfoRow label="Category" value={categoryLabel} />
        <InfoRow label="Available" value={`${gift.stock} in stock`} />
      </GlassCard>

      {gift.description ? (
        <>
          <SectionTitle>Description</SectionTitle>
          <GlassCard style={styles.infoCard}>
            <Text style={styles.description}>{gift.description}</Text>
          </GlassCard>
        </>
      ) : null}

      <SectionTitle>Quantity</SectionTitle>
      <GlassCard style={styles.quantityCard}>
        <QuantityStepper value={quantity} max={gift.stock} onChange={setQuantity} />
        <Text style={styles.quantityHint}>{formatMoney(gift.price_cents * quantity)} total</Text>
      </GlassCard>

      {addedMessage ? <Text style={styles.addedMessage}>{addedMessage}</Text> : null}

      <PrimaryButton
        label="Add to cart"
        onPress={() => {
          addGift(gift, quantity);
          setAddedMessage(`Added ${quantity} to cart`);
        }}
      />
      <PrimaryButton
        label="Buy now"
        variant="secondary"
        onPress={() => {
          addGift(gift, quantity);
          router.push('/buyer/checkout');
        }}
      />
    </ScreenShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  quantityCard: {
    padding: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  quantityHint: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  addedMessage: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
