import { useAuth } from '@/providers/auth-provider';

import {
  DashboardHeader,
  EmptyState,
  MenuRow,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';

export default function BuyerBrowseScreen() {
  const { profile } = useAuth();

  return (
    <ScreenShell>
      <DashboardHeader
        title="Discover gifts"
        subtitle="Browse curated gifts from vendors and explore photos & descriptions."
        role={profile?.role}
      />

      <SectionTitle>Quick links</SectionTitle>
      <MenuRow
        title="My orders"
        description="Track purchases and delivery status"
        href="/buyer/orders"
      />
      <MenuRow title="Settings" description="Account and app preferences" href="/settings" />

      <EmptyState
        title="Gift catalog coming soon"
        message="Vendors are preparing listings. You'll browse gift photos and read full descriptions here."
      />
    </ScreenShell>
  );
}
