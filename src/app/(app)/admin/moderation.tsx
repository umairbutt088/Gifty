import { DashboardHeader, EmptyState, MenuRow, ScreenShell } from '@/components/dashboard';

export default function AdminModerationScreen() {
  return (
    <ScreenShell>
      <DashboardHeader
        title="Gift moderation"
        subtitle="Review vendor listings before they go live."
        showBanner={false}
      />
      <EmptyState
        title="No listings to review"
        message="Flagged or pending gifts from vendors will appear here for approval."
      />
      <MenuRow title="Back to overview" href="/admin/overview" />
    </ScreenShell>
  );
}
