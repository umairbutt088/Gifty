export {
  createSessionFromUrl,
  getAuthCallbackError,
  getSupabaseRedirectAllowList,
  getPasswordResetRedirectUrl,
  isAuthCallbackUrl,
  isPasswordRecoveryUrl,
  NATIVE_PASSWORD_RESET_URL,
} from '@/lib/auth-linking';
export { getAuthErrorMessage, isValidEmail } from '@/lib/auth-errors';
export {
  getSession,
  onAuthStateChange,
  resetPassword,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from '@/lib/auth';
export {
  fetchProfile,
  getProfileFromUser,
  updateProfile,
  type AuthProfile,
} from '@/lib/profile';
export { Env } from '@/lib/env';
export { supabase } from '@/lib/supabase';
export type { ProfileRow } from '@/types/database';
