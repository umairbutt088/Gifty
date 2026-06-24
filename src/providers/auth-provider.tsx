import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import { getSession, onAuthStateChange, signOut as supabaseSignOut } from '@/lib/auth';
import { createSessionFromUrl, isAuthCallbackUrl } from '@/lib/auth-linking';
import { fetchProfile, getProfileFromUser, type AuthProfile } from '@/lib/profile';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  recoveryLinkError: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearPasswordRecovery: () => void;
  clearRecoveryLinkError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const theme = useScreenTheme();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [recoveryLinkError, setRecoveryLinkError] = useState<string | null>(null);

  const user = session?.user ?? null;

  async function loadProfile(nextUser: User | null) {
    if (!nextUser) {
      setProfile(null);
      return;
    }

    const dbProfile = await fetchProfile(nextUser.id);
    setProfile(dbProfile ?? getProfileFromUser(nextUser));
  }

  async function refreshProfile() {
    await loadProfile(user);
  }

  function clearPasswordRecovery() {
    setIsPasswordRecovery(false);
    setRecoveryLinkError(null);
  }

  function clearRecoveryLinkError() {
    setRecoveryLinkError(null);
  }

  async function handleAuthCallbackUrl(url: string) {
    if (!isAuthCallbackUrl(url)) {
      return;
    }

    try {
      const recoverySession = await createSessionFromUrl(url);
      if (recoverySession) {
        setRecoveryLinkError(null);
        setIsPasswordRecovery(true);
        setSession(recoverySession);
        await loadProfile(recoverySession.user);
        router.replace('/reset-password');
      }
    } catch (error) {
      setRecoveryLinkError(
        error instanceof Error ? error.message : 'The reset link is invalid. Request a new one.',
      );
      router.replace('/reset-password');
    }
  }

  async function handleAuthEvent(event: AuthChangeEvent, nextSession: Session | null) {
    if (event === 'PASSWORD_RECOVERY') {
      setIsPasswordRecovery(true);
      router.replace('/reset-password');
    }

    if (event === 'SIGNED_OUT') {
      setIsPasswordRecovery(false);
      setRecoveryLinkError(null);
    }

    setSession(nextSession);
    await loadProfile(nextSession?.user ?? null);
    setIsLoading(false);
  }

  useEffect(() => {
    let mounted = true;

    getSession().then(async ({ data }) => {
      if (!mounted) return;

      setSession(data.session);
      await loadProfile(data.session?.user ?? null);
      setIsLoading(false);
    });

    const { data: subscription } = onAuthStateChange(async (event, nextSession) => {
      if (!mounted) return;
      await handleAuthEvent(event, nextSession);
    });

    Linking.getInitialURL().then((url) => {
      if (url) {
        void handleAuthCallbackUrl(url);
      }
    });

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const { hash, href } = window.location;
      if (hash && (hash.includes('access_token') || hash.includes('error'))) {
        void handleAuthCallbackUrl(href);
      }
    }

    const linkSubscription = Linking.addEventListener('url', ({ url }) => {
      void handleAuthCallbackUrl(url);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, []);

  async function signOut() {
    await supabaseSignOut();
    setProfile(null);
    setIsPasswordRecovery(false);
    setRecoveryLinkError(null);
  }

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      isLoading,
      isPasswordRecovery,
      recoveryLinkError,
      signOut,
      refreshProfile,
      clearPasswordRecovery,
      clearRecoveryLinkError,
    }),
    [session, user, profile, isLoading, isPasswordRecovery, recoveryLinkError],
  );

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
