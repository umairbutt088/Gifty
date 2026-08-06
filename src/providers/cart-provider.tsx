import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { clearStoredCart, getStoredCart, setStoredCart } from '@/lib/cart-storage';
import type { CartItem } from '@/types/cart';
import { cartItemsEqual } from '@/types/cart';
import type { GiftRow } from '@/types/vendor';

type CartContextValue = {
  items: CartItem[];
  isReady: boolean;
  itemCount: number;
  subtotalCents: number;
  addGift: (
    gift: GiftRow,
    quantity?: number,
    options?: { variantId?: string | null; variantLabel?: string | null; priceCents?: number; stock?: number },
  ) => void;
  setQuantity: (giftId: string, quantity: number, variantId?: string | null) => void;
  removeItem: (giftId: string, variantId?: string | null) => void;
  replaceItems: (items: CartItem[]) => void;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function giftToCartItem(
  gift: GiftRow,
  quantity: number,
  options?: {
    variantId?: string | null;
    variantLabel?: string | null;
    priceCents?: number;
    stock?: number;
  },
): CartItem {
  return {
    giftId: gift.id,
    vendorId: gift.vendor_id,
    title: gift.title,
    priceCents: options?.priceCents ?? gift.price_cents,
    imageUrl: gift.image_urls[0] ?? null,
    stock: options?.stock ?? gift.stock,
    quantity,
    variantId: options?.variantId ?? null,
    variantLabel: options?.variantLabel ?? null,
  };
}

function sameCartLine(item: CartItem, giftId: string, variantId?: string | null) {
  return item.giftId === giftId && (item.variantId ?? null) === (variantId ?? null);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    getStoredCart().then((stored) => {
      setItems(stored);
      setIsReady(true);
    });
  }, []);

  const addGift = useCallback(
    (
      gift: GiftRow,
      quantity = 1,
      options?: {
        variantId?: string | null;
        variantLabel?: string | null;
        priceCents?: number;
        stock?: number;
      },
    ) => {
      const addAmount = Math.max(1, quantity);
      const stock = options?.stock ?? gift.stock;
      const variantId = options?.variantId ?? null;

      setItems((current) => {
        const existing = current.find((item) => sameCartLine(item, gift.id, variantId));
        const nextQuantity = Math.min(stock, existing ? existing.quantity + addAmount : addAmount);

        const nextItem = giftToCartItem(gift, nextQuantity, {
          ...options,
          stock,
          variantId,
        });
        const nextItems = existing
          ? current.map((item) =>
              sameCartLine(item, gift.id, variantId) ? nextItem : item,
            )
          : [...current, nextItem];

        void setStoredCart(nextItems);
        return nextItems;
      });
    },
    [],
  );

  const setQuantity = useCallback((giftId: string, quantity: number, variantId?: string | null) => {
    setItems((current) => {
      const nextItems = current
        .map((item) => {
          if (!sameCartLine(item, giftId, variantId)) return item;
          const nextQuantity = Math.min(item.stock, Math.max(1, quantity));
          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0);

      void setStoredCart(nextItems);
      return nextItems;
    });
  }, []);

  const removeItem = useCallback((giftId: string, variantId?: string | null) => {
    setItems((current) => {
      const nextItems = current.filter((item) => !sameCartLine(item, giftId, variantId));
      void setStoredCart(nextItems);
      return nextItems;
    });
  }, []);

  const replaceItems = useCallback((nextItems: CartItem[]) => {
    setItems((current) => {
      if (cartItemsEqual(current, nextItems)) {
        return current;
      }

      void setStoredCart(nextItems);
      return nextItems;
    });
  }, []);

  const clearCart = useCallback(async () => {
    setItems([]);
    await clearStoredCart();
  }, []);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotalCents = useMemo(
    () => items.reduce((total, item) => total + item.priceCents * item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      isReady,
      itemCount,
      subtotalCents,
      addGift,
      setQuantity,
      removeItem,
      replaceItems,
      clearCart,
    }),
    [items, isReady, itemCount, subtotalCents, addGift, setQuantity, removeItem, replaceItems, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
