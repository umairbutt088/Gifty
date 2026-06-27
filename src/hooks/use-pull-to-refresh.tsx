import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

import { useScreenTheme } from '@/providers/screen-theme-provider';

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const theme = useScreenTheme();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
      tintColor={theme.accentLight}
      colors={[theme.accentLight]}
    />
  );

  return { refreshing, refreshControl };
}
