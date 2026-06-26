import { DashboardHeader, EmptyState, ScreenShell } from '@/components/dashboard';

export default function AdminModerationScreen() {
  return (
    <ScreenShell>
      <DashboardHeader
        title="Gift moderation"
        subtitle="Review vendor listings before they go live."
        showBanner={false}
        showBack
        backHref="/admin/overview"
      />
      <EmptyState
        title="No listings to review"
        message="Flagged or pending gifts from vendors will appear here for approval."
      />
    </ScreenShell>
  );
}
