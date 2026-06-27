import { Stack } from 'expo-router';

import { VendorGate } from '@/components/vendor';
import { VendorStoreProvider } from '@/providers/vendor-store-provider';

export default function VendorLayout() {
  return (
    <VendorStoreProvider>
      <VendorGate>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      </VendorGate>
    </VendorStoreProvider>
  );
}
