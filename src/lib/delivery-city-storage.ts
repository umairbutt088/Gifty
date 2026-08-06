import { createAuthStorage } from '@/lib/auth-storage';

const STORAGE_KEY = '@gifty/buyer-delivery-city';

export const MARKETPLACE_CITY_OPTIONS = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Hyderabad',
  'Sialkot',
  'Gujranwala',
  'Bahawalpur',
] as const;

export async function getStoredDeliveryCity(): Promise<string | null> {
  const storage = createAuthStorage();
  const value = await storage.getItem(STORAGE_KEY);
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function setStoredDeliveryCity(city: string | null): Promise<void> {
  const storage = createAuthStorage();
  if (!city?.trim()) {
    await storage.removeItem(STORAGE_KEY);
    return;
  }
  await storage.setItem(STORAGE_KEY, city.trim());
}
