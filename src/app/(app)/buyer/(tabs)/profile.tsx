import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  DashboardHeader,
  MenuRow,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

export default function BuyerProfileTabScreen() {
  const { profile, user, signOut } = useAuth();
  const colors = useColors();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    router.replace('/');
  }

  return (
    <ScreenShell>
      <DashboardHeader title="Profile" variant="tab" role={profile?.role} />

      <View
        style={[
          styles.profileCard,
          {
            borderColor: colors.surfaceBorder,
            backgroundColor: colors.surface,
          },
        ]}>
        <View style={[styles.avatar, { backgroundColor: colors.surfaceNested }]}>
          <Text style={[styles.avatarText, { color: colors.text }]}>
            {(profile?.fullName || user?.email || 'B').slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileText}>
          <Text style={[styles.name, { color: colors.text }]}>
            {profile?.fullName || 'Buyer'}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>
      </View>

      <SectionTitle>Account</SectionTitle>
      <MenuRow
        title="Favorites"
        description="Gifts you saved for later"
        href="/buyer/favorites"
      />
      <MenuRow title="App settings" description="Theme and preferences" href="/settings" />

      <PrimaryButton label="Sign out" loading={signingOut} onPress={handleSignOut} variant="secondary" />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Spacing.four,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileText: {
    flex: 1,
    gap: Spacing.one,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
  },
});
