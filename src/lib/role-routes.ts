import type { Href } from 'expo-router';

import type { UserRole } from '@/types/user';

/** Folder names under `src/app/(app)/` */
export const ROLE_ROUTE_PREFIX: Record<UserRole, string> = {
  buyer: 'buyer',
  vendor: 'vendor',
  admin: 'admin',
};

export function getRoleHomeHref(role: UserRole): Href {
  switch (role) {
    case 'vendor':
      return '/vendor';
    case 'admin':
      return '/admin/overview';
    case 'buyer':
    default:
      return '/buyer';
  }
}

export const SHARED_APP_ROUTES = new Set(['settings']);

export function getRoleFromSegments(segments: string[]): UserRole | null {
  if (segments.includes(ROLE_ROUTE_PREFIX.buyer)) return 'buyer';
  if (segments.includes(ROLE_ROUTE_PREFIX.vendor)) return 'vendor';
  if (segments.includes(ROLE_ROUTE_PREFIX.admin)) return 'admin';
  return null;
}

export function isSharedAppRoute(segments: string[]): boolean {
  return segments.some((segment) => SHARED_APP_ROUTES.has(segment));
}
