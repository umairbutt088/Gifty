import { createAuthStorage } from '@/lib/auth-storage';
import {
  BackgroundVariantSet,
  DefaultScreenBackgroundVariant,
  type ScreenBackgroundVariant,
} from '@/constants/background-styles';

const STORAGE_KEY = '@gifty/background-variant';

function isBackgroundVariant(value: string | null): value is ScreenBackgroundVariant {
  return value != null && BackgroundVariantSet.has(value as ScreenBackgroundVariant);
}

export async function getStoredBackgroundVariant(): Promise<ScreenBackgroundVariant> {
  const storage = createAuthStorage();
  const value = await storage.getItem(STORAGE_KEY);
  return isBackgroundVariant(value) ? value : DefaultScreenBackgroundVariant;
}

export async function setStoredBackgroundVariant(
  variant: ScreenBackgroundVariant,
): Promise<void> {
  const storage = createAuthStorage();
  await storage.setItem(STORAGE_KEY, variant);
}
