import { useCallback, useEffect } from 'react';

import { useListRefresh } from '@/hooks/use-list-refresh';
import { fetchBuyerOrders, subscribeBuyerOrderUpdates } from '@/lib/buyer-orders';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

export function useBuyerOrdersList() {
  const { profile } = useAuth();
  const buyerId = profile?.id;

  const loadOrders = useCallback(async () => {
    if (!buyerId) return [];
    return fetchBuyerOrders(buyerId);
  }, [buyerId]);

  const { items: orders, setItems, loading, refreshControl } = useListRefresh({
    enabled: Boolean(buyerId),
    load: loadOrders,
  });

  useEffect(() => {
    if (!buyerId) return;

    const channel = subscribeBuyerOrderUpdates(buyerId, (updated) => {
      setItems((current) =>
        current.map((order) => (order.id === updated.id ? { ...order, ...updated } : order)),
      );
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [buyerId, setItems]);

  return { orders, setOrders: setItems, loading, refreshControl };
}
