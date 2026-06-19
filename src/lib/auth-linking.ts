import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

/** Native deep link — add to Supabase Redirect URLs as `gifty://**` */
export const NATIVE_PASSWORD_RESET_URL = 'gifty://reset-password';

export function getPasswordResetRedirectUrl() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return NATIVE_PASSWORD_RESET_URL;
  }

  return makeRedirectUri({
    scheme: 'gifty',
    path: 'reset-password',
  });
}

/** Every URL that may appear in reset emails — add all to Supabase Redirect URLs */
export function getSupabaseRedirectAllowList(): string[] {
  const urls = new Set([
    getPasswordResetRedirectUrl(),
    NATIVE_PASSWORD_RESET_URL,
    'gifty://**',
    'exp+gifty://**',
    Linking.createURL('/reset-password'),
  ]);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    urls.add(`${window.location.origin}/reset-password`);
  }

  return [...urls];
}

export function parseAuthParams(url: string): Record<string, string> {
  return QueryParams.getQueryParams(url).params;
}

export function getAuthCallbackError(url: string): string | null {
  const params = parseAuthParams(url);
  if (!params.error && !params.error_code) {
    return null;
  }

  if (params.error_description) {
    return decodeURIComponent(params.error_description.replace(/\+/g, ' '));
  }

  if (params.error_code === 'otp_expired') {
    return 'This reset link has expired. Request a new one from the sign in screen.';
  }

  return params.error ?? 'The reset link is invalid. Request a new one from the sign in screen.';
}

export function isAuthCallbackUrl(url: string) {
  const params = parseAuthParams(url);
  const path = Linking.parse(url).path ?? '';
  const hostname = Linking.parse(url).hostname ?? '';

  return (
    path.includes('reset-password') ||
    hostname === 'reset-password' ||
    params.type === 'recovery' ||
    Boolean(params.access_token) ||
    Boolean(params.error) ||
    Boolean(params.error_code)
  );
}

export function isPasswordRecoveryUrl(url: string) {
  if (!isAuthCallbackUrl(url)) {
    return false;
  }

  const params = parseAuthParams(url);
  return Boolean(params.access_token) || Boolean(params.error) || Boolean(params.error_code);
}

export async function createSessionFromUrl(url: string) {
  if (!isAuthCallbackUrl(url)) {
    return null;
  }

  const callbackError = getAuthCallbackError(url);
  if (callbackError) {
    throw new Error(callbackError);
  }

  const { params } = QueryParams.getQueryParams(url);
  const accessToken = params.access_token;
  if (!accessToken) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: params.refresh_token ?? '',
  });

  if (error) {
    throw error;
  }

  return data.session;
}
