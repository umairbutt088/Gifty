import { Stack } from 'expo-router';

import { RoleGate } from '@/components/role-gate';
import { usePushTokenRegistration } from '@/hooks/use-push-token-registration';

export default function AppLayout() {
  usePushTokenRegistration();

  return (
    <RoleGate>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      />
    </RoleGate>
  );
}
