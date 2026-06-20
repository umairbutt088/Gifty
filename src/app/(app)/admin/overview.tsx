import { useAuth } from '@/providers/auth-provider';

import {
  DashboardHeader,
  MenuRow,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';

export default function AdminOverviewScreen() {
  const { profile } = useAuth();

  return (
    <ScreenShell>
      <DashboardHeader
        title="Admin console"
        subtitle="Monitor vendors, gifts, and platform health."
        role={profile?.role}
      />

      <SectionTitle>Manage platform</SectionTitle>
      <MenuRow title="Users" description="View buyers, vendors, and roles" href="/admin/users" />
      <MenuRow
        title="Gift moderation"
        description="Approve or remove vendor listings"
        href="/admin/moderation"
      />
      <MenuRow title="Settings" href="/settings" />
    </ScreenShell>
  );
}
