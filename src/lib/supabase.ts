import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

import { createAuthStorage } from '@/lib/auth-storage';
import { Env } from '@/lib/env';

export const supabase = createClient(Env.supabaseUrl, Env.supabaseAnonKey, {
  auth: {
    storage: createAuthStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
