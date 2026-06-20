import { Link, router } from 'expo-router';
import { useState } from 'react';

import {
  DashboardHeader,
  MenuRow,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { getRoleHomeHref } from '@/lib/role-routes';
import { useAuth } from '@/providers/auth-provider';

export default function SettingsScreen() {
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
        title="Settings"
        subtitle={user?.email ?? undefined}
        role={profile?.role}
        showBanner={false}
      />

      <SectionTitle>Account</SectionTitle>
      {profile ? (
        <MenuRow
          title="Back to dashboard"
          description="Return to your role home screen"
          href={getRoleHomeHref(profile.role)}
        />
      ) : null}

      <PrimaryButton label="Sign out" loading={signingOut} onPress={handleSignOut} variant="secondary" />
    </ScreenShell>
  );
}
