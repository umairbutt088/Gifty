import { getPasswordResetRedirectUrl } from '@/lib/auth-linking';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/user';

type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
};

type SignInParams = {
  email: string;
  password: string;
};

export async function signUp({ email, password, firstName, lastName, role }: SignUpParams) {
  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role,
      },
    },
  });
}

export async function signIn({ email, password }: SignInParams) {
  return supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getPasswordResetRedirectUrl(),
  });
}

export async function updatePassword(password: string) {
  return supabase.auth.updateUser({ password });
}

export { getPasswordResetRedirectUrl } from '@/lib/auth-linking';

export function getSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
) {
  return supabase.auth.onAuthStateChange(callback);
}
