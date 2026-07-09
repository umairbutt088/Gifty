import { useCallback, useEffect } from 'react';

import { useListRefresh } from '@/hooks/use-list-refresh';
import { fetchVendorOrderById, fetchVendorOrders, subscribeVendorOrderUpdates } from '@/lib/vendor-orders';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

export function useVendorOrdersList(onLoaded?: () => void | Promise<void>) {
  const { profile } = useAuth();
  const vendorId = profile?.id;

  const loadOrders = useCallback(async () => {
    if (!vendorId) return [];
    return fetchVendorOrders(vendorId);
  }, [vendorId]);

  const { items: orders, setItems, loading, refreshControl } = useListRefresh({
    enabled: Boolean(vendorId),
    load: loadOrders,
    onLoaded,
  });

  useEffect(() => {
    if (!vendorId) return;

    const channel = subscribeVendorOrderUpdates(
      vendorId,
      (inserted) => {
        void fetchVendorOrderById(inserted.id).then((full) => {
          if (!full) return;

          setItems((current) => {
            if (current.some((order) => order.id === full.id)) return current;
            return [full, ...current];
          });

          void onLoaded?.();
        });
      },
      (updated) => {
        setItems((current) =>
          current.map((order) => (order.id === updated.id ? { ...order, ...updated } : order)),
        );

        void onLoaded?.();
      },
      'list',
    );

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [vendorId, setItems, onLoaded]);

  return { orders, setOrders: setItems, loading, refreshControl };
}
