import { Stack } from 'expo-router';

import { VendorGate } from '@/components/vendor';

export default function VendorLayout() {
  return (
    <VendorGate>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </VendorGate>
  );
}
