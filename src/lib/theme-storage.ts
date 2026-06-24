import { createAuthStorage } from '@/lib/auth-storage';
import {
  ScreenThemes,
  type ScreenThemeVariant,
} from '@/constants/color-themes';

const STORAGE_KEY = '@gifty/theme-variant';

function isThemeVariant(value: string | null): value is ScreenThemeVariant {
  return value != null && value in ScreenThemes;
}

export async function getStoredThemeVariant(): Promise<ScreenThemeVariant | null> {
  const storage = createAuthStorage();
  const value = await storage.getItem(STORAGE_KEY);
  return isThemeVariant(value) ? value : null;
}

export async function setStoredThemeVariant(variant: ScreenThemeVariant): Promise<void> {
  const storage = createAuthStorage();
  await storage.setItem(STORAGE_KEY, variant);
}
