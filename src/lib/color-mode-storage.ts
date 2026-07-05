import { createAuthStorage } from '@/lib/auth-storage';
import type { ColorModePreference } from '@/constants/color-mode';

const STORAGE_KEY = '@gifty/color-mode';

const VALID_MODES = new Set<ColorModePreference>(['system', 'light', 'dark']);

function isColorModePreference(value: string | null): value is ColorModePreference {
  return value != null && VALID_MODES.has(value as ColorModePreference);
}

export async function getStoredColorMode(): Promise<ColorModePreference | null> {
  const storage = createAuthStorage();
  const value = await storage.getItem(STORAGE_KEY);
  return isColorModePreference(value) ? value : null;
}

export async function setStoredColorMode(mode: ColorModePreference): Promise<void> {
  const storage = createAuthStorage();
  await storage.setItem(STORAGE_KEY, mode);
}
