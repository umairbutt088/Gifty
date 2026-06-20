import { DashboardHeader, EmptyState, MenuRow, ScreenShell } from '@/components/dashboard';

export default function BuyerOrdersScreen() {
  return (
    <ScreenShell>
      <DashboardHeader
        title="My orders"
        subtitle="Purchases you make will appear here."
        showBanner={false}
      />
      <EmptyState
        title="No orders yet"
        message="When you buy a gift, order history and tracking will show up on this screen."
      />
      <MenuRow title="Back to browse" href="/buyer/browse" />
    </ScreenShell>
  );
}
