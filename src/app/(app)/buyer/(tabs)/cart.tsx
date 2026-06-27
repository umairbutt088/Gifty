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
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import { fetchLiveGiftById } from '@/lib/gifts';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/providers/cart-provider';
import type { CartItem } from '@/types/cart';

async function refreshCartItems(items: CartItem[]): Promise<CartItem[]> {
  const refreshed: CartItem[] = [];

  for (const item of items) {
    const gift = await fetchLiveGiftById(item.giftId);

    if (!gift || gift.stock < 1) continue;

    refreshed.push({
      ...item,
      vendorId: gift.vendor_id,
      title: gift.title,
      priceCents: gift.price_cents,
      imageUrl: gift.image_urls[0] ?? null,
      stock: gift.stock,
      quantity: Math.min(item.quantity, gift.stock),
    });
  }

  return refreshed;
}

export default function BuyerCartTabScreen() {
  const { profile } = useAuth();
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
      <DashboardHeader
        title="Your cart"
        subtitle={
          items.length > 0
            ? `${items.length} item${items.length === 1 ? '' : 's'} ready to send`
            : 'Add gifts from the catalog to get started.'
        }
        role={profile?.role}
      />

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
                key={item.giftId}
                item={item}
                onChangeQuantity={(quantity) => setQuantity(item.giftId, quantity)}
                onRemove={() => removeItem(item.giftId)}
              />
            ))}
          </View>

          <SectionTitle>Summary</SectionTitle>
          <GlassCard style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatMoney(subtotalCents)}</Text>
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
    color: Colors.textSecondary,
    fontSize: 15,
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
});
