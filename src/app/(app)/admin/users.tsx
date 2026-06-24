import { DashboardHeader, EmptyState, MenuRow, ScreenShell } from '@/components/dashboard';

export default function AdminUsersScreen() {
  return (
    <ScreenShell>
      <DashboardHeader
        title="Users"
        subtitle="Manage buyer, vendor, and admin accounts."
        showBanner={false}
      />
      <EmptyState
        title="User management coming soon"
        message="Admins will search users, change roles, and suspend accounts from here."
      />
      <MenuRow title="Back to overview" href="/admin/overview" />
    </ScreenShell>
  );
}
