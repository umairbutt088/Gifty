import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import {
  getRoleFromSegments,
  getRoleHomeHref,
  isSharedAppRoute,
} from '@/lib/role-routes';
import { useAuth } from '@/providers/auth-provider';

export function RoleGate({ children }: { children: React.ReactNode }) {
  const { profile, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !profile) return;

    const routeRole = getRoleFromSegments(segments as string[]);

    if (routeRole && routeRole !== profile.role) {
      router.replace(getRoleHomeHref(profile.role));
    }
  }, [profile, isLoading, segments, router]);

  if (isLoading || !profile) {
    return children;
  }

  const routeRole = getRoleFromSegments(segments as string[]);
  if (routeRole && routeRole !== profile.role && !isSharedAppRoute(segments as string[])) {
    return null;
  }

  return children;
}
