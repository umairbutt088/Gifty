import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CartLineItem } from '@/components/buyer';
import {
  DashboardHeader,
  EmptyState,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { GlassCard } from '@/components/glass-card';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import { fetchLiveGiftById } from '@/lib/gifts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/providers/cart-provider';
import type { CartItem } from '@/types/cart';

async function refreshCartItems(items: CartItem[]): Promise<CartItem[]> {
  const refreshed: CartItem[] = [];

  for (const item of items) {
    const gift = await fetchLiveGiftById(item.giftId);

    if (!gift || gift.stock < 1) continue;

    let priceCents = gift.price_cents;
    let stock = gift.stock;
    let variantLabel = item.variantLabel ?? null;

    if (item.variantId) {
      const { data: variant } = await supabase
        .from('gift_variants')
        .select('id, label, price_cents, stock')
        .eq('id', item.variantId)
        .eq('gift_id', gift.id)
        .maybeSingle();

      if (!variant || variant.stock < 1) continue;

      priceCents = variant.price_cents;
      stock = Math.min(gift.stock, variant.stock);
      variantLabel = variant.label;
    }

    refreshed.push({
      ...item,
      vendorId: gift.vendor_id,
      title: gift.title,
      priceCents,
      imageUrl: gift.image_urls[0] ?? null,
      stock,
      quantity: Math.min(item.quantity, stock),
      variantLabel,
    });
  }

  return refreshed;
}

export default function BuyerCartTabScreen() {
  const { profile } = useAuth();
  const colors = useColors();
  const { items, isReady, subtotalCents, setQuantity, removeItem, replaceItems, clearCart } =
    useCart();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const syncCart = useCallback(async () => {
    const current = itemsRef.current;
    if (current.length === 0) return;

    const nextItems = await refreshCartItems(current);
    replaceItems(nextItems);
  }, [replaceItems]);

  const { refreshControl } = usePullToRefresh(syncCart);

  useFocusEffect(
    useCallback(() => {
      void syncCart();
    }, [syncCart]),
  );

  if (!isReady) {
    return (
      <ScreenShell scroll={false}>
        <ThemedActivityIndicator style={{ marginTop: 48 }} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell scrollProps={{ keyboardShouldPersistTaps: 'handled', refreshControl }}>
      <DashboardHeader title="Your cart" variant="tab" role={profile?.role} />

      {items.length === 0 ? (
        <>
          <EmptyState
            title="Cart is empty"
            message="Browse live gifts and tap Add to cart when you find something special."
          />
          <PrimaryButton label="Browse gifts" onPress={() => router.push('/buyer')} />
        </>
      ) : (
        <>
          <SectionTitle>Items</SectionTitle>
          <View style={styles.list}>
            {items.map((item) => (
              <CartLineItem
                key={`${item.giftId}:${item.variantId ?? 'base'}`}
                item={item}
                onChangeQuantity={(quantity) =>
                  setQuantity(item.giftId, quantity, item.variantId)
                }
                onRemove={() => removeItem(item.giftId, item.variantId)}
              />
            ))}
          </View>

          <SectionTitle>Summary</SectionTitle>
          <GlassCard style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatMoney(subtotalCents)}
              </Text>
            </View>
          </GlassCard>

          <PrimaryButton
            label={`Checkout · ${formatMoney(subtotalCents)}`}
            onPress={() => router.push('/buyer/checkout')}
          />

          <PrimaryButton
            label="Clear cart"
            variant="secondary"
            onPress={() => void clearCart()}
          />
        </>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  summaryCard: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});
