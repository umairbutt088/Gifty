import { DashboardHeader, EmptyState, ScreenShell } from '@/components/dashboard';
import { useAuth } from '@/providers/auth-provider';

export default function VendorChatTabScreen() {
  const { profile } = useAuth();

  return (
    <ScreenShell>
      <DashboardHeader
        title="Chat"
        subtitle="Message buyers about gifts and orders."
        role={profile?.role}
      />

      <EmptyState
        title="No conversations yet"
        message="When buyers ask about your gifts or orders, conversations will appear here."
      />
    </ScreenShell>
  );
}
