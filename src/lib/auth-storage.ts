import { NativeModules, Platform } from 'react-native';
import type { SupportedStorage } from '@supabase/supabase-js';

function createMemoryStorage(): SupportedStorage {
  const memory = new Map<string, string>();

  return {
    getItem: async (key) => memory.get(key) ?? null,
    setItem: async (key, value) => {
      memory.set(key, value);
    },
    removeItem: async (key) => {
      memory.delete(key);
    },
  };
}

function createWebStorage(): SupportedStorage {
  return {
    getItem: async (key) => localStorage.getItem(key),
    setItem: async (key, value) => {
      localStorage.setItem(key, value);
    },
    removeItem: async (key) => {
      localStorage.removeItem(key);
    },
  };
}

function createNativeStorage(): SupportedStorage {
  if (NativeModules.RNCAsyncStorage == null) {
    if (__DEV__) {
      console.warn(
        '[gifty] AsyncStorage native module missing. Rebuild the app (expo run:ios) to persist auth sessions.',
      );
    }
    return createMemoryStorage();
  }

  // Lazy require so we never import the module when native code is unavailable.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@react-native-async-storage/async-storage').default as SupportedStorage;
}

export function createAuthStorage(): SupportedStorage {
  if (Platform.OS === 'web') {
    return createWebStorage();
  }

  return createNativeStorage();
}
