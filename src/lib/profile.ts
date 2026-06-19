import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { ProfileRow } from '@/types/database';
import type { UserRole } from '@/types/user';

export type AuthProfile = {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  fullName: string;
  email: string | null;
};

function profileRowToAuthProfile(row: Pick<ProfileRow, 'id' | 'first_name' | 'last_name' | 'role' | 'email'>): AuthProfile {
  const firstName = row.first_name?.trim() ?? '';
  const lastName = row.last_name?.trim() ?? '';

  return {
    id: row.id,
    firstName,
    lastName,
    role: row.role,
    email: row.email,
    fullName: [firstName, lastName].filter(Boolean).join(' ') || row.email?.split('@')[0] || 'User',
  };
}

export function getProfileFromUser(user: User | null): AuthProfile | null {
  if (!user) return null;

  const firstName = String(user.user_metadata?.first_name ?? '').trim();
  const lastName = String(user.user_metadata?.last_name ?? '').trim();
  const role = (user.user_metadata?.role as UserRole | undefined) ?? 'buyer';

  return {
    id: user.id,
    firstName,
    lastName,
    role,
    email: user.email ?? null,
    fullName: [firstName, lastName].filter(Boolean).join(' ') || user.email?.split('@')[0] || 'User',
  };
}

export async function fetchProfile(userId: string): Promise<AuthProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, role')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return profileRowToAuthProfile(data);
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<ProfileRow, 'first_name' | 'last_name'>>,
): Promise<{ error: Error | null }> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);

  return { error: error ? new Error(error.message) : null };
}
