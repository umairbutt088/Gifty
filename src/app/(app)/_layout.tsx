import { Stack } from 'expo-router';

import { RoleGate } from '@/components/role-gate';

export default function AppLayout() {
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
