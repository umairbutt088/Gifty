import { DashboardHeader, EmptyState, ScreenShell } from '@/components/dashboard';

export default function AdminUsersScreen() {
  return (
    <ScreenShell>
      <DashboardHeader
        title="Users"
        subtitle="Manage buyer, vendor, and admin accounts."
        showBanner={false}
        showBack
        backHref="/admin/overview"
      />
      <EmptyState
        title="User management coming soon"
        message="Admins will search users, change roles, and suspend accounts from here."
      />
    </ScreenShell>
  );
}
