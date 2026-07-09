import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { syncPushToken } from '@/lib/push-notifications';
import { useAuth } from '@/providers/auth-provider';

export function usePushTokenRegistration() {
  const { profile } = useAuth();
  const userId = profile?.id;

  useEffect(() => {
    if (!userId) return;

    void syncPushToken(userId);

    function handleAppStateChange(nextState: AppStateStatus) {
      if (nextState === 'active') {
        void syncPushToken(userId);
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [userId]);
}
