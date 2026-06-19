import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandBanner, GeometricBackground, GlassCard } from '@/components';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import { useScreenTheme } from '@/providers/screen-theme-provider';

export default function HomeScreen() {
  const theme = useScreenTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { user, profile, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    router.replace('/');
  }

  return (
    <View style={styles.root}>
      <GeometricBackground />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <BrandBanner showTagline={false} />

          <View style={styles.header}>
            <Text style={styles.title}>Welcome, {profile?.fullName ?? 'there'}</Text>
            <Text style={styles.subtitle}>
              Signed in as a {profile?.role ?? 'member'} · {user?.email}
            </Text>
          </View>

          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>You&apos;re all set</Text>
            <Text style={styles.cardBody}>
              Email and password authentication is connected to Supabase. Your session stays active
              until you sign out.
            </Text>
          </GlassCard>

          <Link href="/settings" style={styles.linkButton}>
            Appearance & theme
          </Link>

          <Pressable
            onPress={handleSignOut}
            disabled={signingOut}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
            {signingOut ? (
              <ActivityIndicator color={Colors.text} />
            ) : (
              <Text style={styles.buttonText}>Sign out</Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useScreenTheme>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.five,
      gap: Spacing.four,
    },
    header: {
      gap: Spacing.one,
    },
    title: {
      color: Colors.text,
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 34,
    },
    subtitle: {
      color: Colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      textTransform: 'capitalize',
    },
    card: {
      padding: Spacing.four,
      gap: Spacing.two,
    },
    cardTitle: {
      color: Colors.text,
      fontSize: 18,
      fontWeight: '600',
    },
    cardBody: {
      color: Colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },
    linkButton: {
      color: theme.accentLight,
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
      paddingVertical: Spacing.two,
    },
    button: {
      backgroundColor: theme.button,
      borderWidth: 1,
      borderColor: theme.buttonBorder,
      borderRadius: Spacing.two,
      paddingVertical: Spacing.three,
      alignItems: 'center',
    },
    buttonPressed: {
      backgroundColor: theme.buttonPressed,
    },
    buttonText: {
      color: Colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
