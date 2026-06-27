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
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';

export default function BuyerProfileTabScreen() {
  const { profile, user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    router.replace('/');
  }

  return (
    <ScreenShell>
      <DashboardHeader
        title="Profile"
        subtitle="Your account and app preferences."
        role={profile?.role}
      />

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.fullName || user?.email || 'B').slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.name}>{profile?.fullName || 'Buyer'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <SectionTitle>Account</SectionTitle>
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
    borderColor: Colors.surfaceBorder,
    borderRadius: Spacing.four,
    backgroundColor: Colors.surface,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceNested,
  },
  avatarText: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  profileText: {
    flex: 1,
    gap: Spacing.one,
    justifyContent: 'center',
  },
  name: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
