const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env',
  );
}

const appUrl = process.env.EXPO_PUBLIC_APP_URL ?? 'http://localhost:8081';

export const Env = {
  supabaseUrl,
  supabaseAnonKey,
  appUrl,
} as const;
