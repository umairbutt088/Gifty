import { createAuthStorage } from '@/lib/auth-storage';
import type { CartItem } from '@/types/cart';

const STORAGE_KEY = '@gifty/buyer-cart';

export async function getStoredCart(): Promise<CartItem[]> {
  const storage = createAuthStorage();
  const raw = await storage.getItem(STORAGE_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setStoredCart(items: CartItem[]): Promise<void> {
  const storage = createAuthStorage();
  await storage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function clearStoredCart(): Promise<void> {
  const storage = createAuthStorage();
  await storage.removeItem(STORAGE_KEY);
}
