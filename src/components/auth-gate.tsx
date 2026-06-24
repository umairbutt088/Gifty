import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { getRoleHomeHref } from '@/lib/role-routes';
import { useAuth } from '@/providers/auth-provider';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, profile, isLoading, isPasswordRecovery, recoveryLinkError } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onResetPasswordScreen = segments[1] === 'reset-password';

    if (!session && !inAuthGroup && !recoveryLinkError) {
      router.replace('/');
      return;
    }

    if (recoveryLinkError && !onResetPasswordScreen) {
      router.replace('/reset-password');
      return;
    }

    if (session && isPasswordRecovery && !onResetPasswordScreen) {
      router.replace('/reset-password');
      return;
    }

    if (session && inAuthGroup && !isPasswordRecovery) {
      router.replace(getRoleHomeHref(profile?.role ?? 'buyer'));
    }
  }, [session, profile, isLoading, isPasswordRecovery, recoveryLinkError, segments, router]);

  return children;
}
