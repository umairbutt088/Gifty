import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';

type UseListRefreshOptions<T> = {
  enabled?: boolean;
  load: () => Promise<T[]>;
  onLoaded?: () => void | Promise<void>;
};

export function useListRefresh<T>({ enabled = true, load, onLoaded }: UseListRefreshOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const fetchItems = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setLoading(false);
      return;
    }

    const rows = await load();
    setItems(rows);
    await onLoaded?.();
    hasLoadedRef.current = true;
    setLoading(false);
  }, [enabled, load, onLoaded]);

  const loadOnFocus = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (!hasLoadedRef.current) {
      setLoading(true);
    }

    await fetchItems();
  }, [enabled, fetchItems]);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    await fetchItems();
  }, [enabled, fetchItems]);

  const { refreshControl } = usePullToRefresh(refresh);

  useFocusEffect(
    useCallback(() => {
      void loadOnFocus();
    }, [loadOnFocus]),
  );

  return { items, setItems, loading, refresh, refreshControl };
}
