import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { countNewVendorOrders } from '@/lib/vendor-orders';
import { fetchVendorStore, isVendorStoreOnboarded } from '@/lib/vendor-store';
import { useAuth } from '@/providers/auth-provider';
import type { VendorStoreRow } from '@/types/vendor';

type VendorStoreContextValue = {
  store: VendorStoreRow | null;
  isLoading: boolean;
  isOnboarded: boolean;
  newOrderCount: number;
  refreshStore: () => Promise<void>;
  refreshNewOrderCount: () => Promise<void>;
};

const VendorStoreContext = createContext<VendorStoreContextValue | null>(null);

export function VendorStoreProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [store, setStore] = useState<VendorStoreRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newOrderCount, setNewOrderCount] = useState(0);

  const refreshStore = useCallback(async () => {
    if (!profile || profile.role !== 'vendor') {
      setStore(null);
      setIsLoading(false);
      return;
    }

    const nextStore = await fetchVendorStore(profile.id);
    setStore(nextStore);
    setIsLoading(false);
  }, [profile]);

  const refreshNewOrderCount = useCallback(async () => {
    if (!profile || profile.role !== 'vendor') {
      setNewOrderCount(0);
      return;
    }

    const count = await countNewVendorOrders(profile.id);
    setNewOrderCount(count);
  }, [profile]);

  useEffect(() => {
    void refreshStore();
    void refreshNewOrderCount();
  }, [refreshStore, refreshNewOrderCount]);

  const value = useMemo(
    () => ({
      store,
      isLoading,
      isOnboarded: isVendorStoreOnboarded(store),
      newOrderCount,
      refreshStore,
      refreshNewOrderCount,
    }),
    [store, isLoading, newOrderCount, refreshStore, refreshNewOrderCount],
  );

  return <VendorStoreContext.Provider value={value}>{children}</VendorStoreContext.Provider>;
}

export function useVendorStore() {
  const context = useContext(VendorStoreContext);

  if (!context) {
    throw new Error('useVendorStore must be used within VendorStoreProvider');
  }

  return context;
}
