import { router } from 'expo-router';

import { useAuth } from '@/providers/auth-provider';

import {
  DashboardHeader,
  EmptyState,
  MenuRow,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';

export default function VendorProductsScreen() {
  const { profile } = useAuth();

  return (
    <ScreenShell>
      <DashboardHeader
        title="My gift listings"
        subtitle="Add products with photos and descriptions for buyers to discover."
        role={profile?.role}
      />

      <PrimaryButton label="Add new gift" onPress={() => router.push('/vendor/gift/new')} />

      <SectionTitle>Manage</SectionTitle>
      <MenuRow
        title="Incoming orders"
        description="See when buyers purchase your gifts"
        href="/vendor/orders"
      />
      <MenuRow title="Settings" description="Store and account preferences" href="/settings" />

      <EmptyState
        title="No gifts listed yet"
        message="Create your first listing with multiple images and a rich description."
      />
    </ScreenShell>
  );
}
