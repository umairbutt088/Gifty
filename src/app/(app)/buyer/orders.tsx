import { DashboardHeader, EmptyState, ScreenShell } from '@/components/dashboard';

export default function BuyerOrdersScreen() {
  return (
    <ScreenShell>
      <DashboardHeader
        title="My orders"
        subtitle="Purchases you make will appear here."
        showBanner={false}
        showBack
        backHref="/buyer/browse"
      />
      <EmptyState
        title="No orders yet"
        message="When you buy a gift, order history and tracking will show up on this screen."
      />
    </ScreenShell>
  );
}
