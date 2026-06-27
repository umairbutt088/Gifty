import { DashboardHeader, EmptyState, ScreenShell } from '@/components/dashboard';
import { useAuth } from '@/providers/auth-provider';

export default function BuyerChatTabScreen() {
  const { profile } = useAuth();

  return (
    <ScreenShell>
      <DashboardHeader
        title="Chat"
        subtitle="Message vendors about gifts and orders."
        role={profile?.role}
      />

      <EmptyState
        title="No conversations yet"
        message="When you message a vendor about a gift or order, conversations will appear here."
      />
    </ScreenShell>
  );
}
