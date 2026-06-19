export { getAuthErrorMessage, isValidEmail } from '@/lib/auth-errors';
export { getSession, onAuthStateChange, resetPassword, signIn, signOut, signUp } from '@/lib/auth';
export {
  fetchProfile,
  getProfileFromUser,
  updateProfile,
  type AuthProfile,
} from '@/lib/profile';
export { Env } from '@/lib/env';
export { supabase } from '@/lib/supabase';
export type { ProfileRow } from '@/types/database';
