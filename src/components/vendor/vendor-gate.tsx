import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/providers/auth-provider';
import { useVendorStore } from '@/providers/vendor-store-provider';

export function VendorGate({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const { isLoading, isOnboarded } = useVendorStore();
  const segments = useSegments() as string[];
  const router = useRouter();

  const onOnboarding = segments.includes('onboarding');

  useEffect(() => {
    if (profile?.role !== 'vendor' || isLoading) return;

    if (!isOnboarded && !onOnboarding) {
      router.replace('/vendor/onboarding');
    }
  }, [profile, isLoading, isOnboarded, onOnboarding, router]);

  if (profile?.role === 'vendor' && isLoading) {
    return null;
  }

  if (profile?.role === 'vendor' && !isOnboarded && !onOnboarding) {
    return null;
  }

  return children;
}
