import { DashboardHeader, EmptyState, MenuRow, ScreenShell } from '@/components/dashboard';

export default function VendorOrdersScreen() {
  return (
    <ScreenShell>
      <DashboardHeader
        title="Incoming orders"
        subtitle="Buyer purchases of your gifts will show here."
        showBanner={false}
      />
      <EmptyState
        title="No orders yet"
        message="When a buyer purchases one of your gifts, you'll fulfill it from this screen."
      />
      <MenuRow title="Back to listings" href="/vendor/products" />
    </ScreenShell>
  );
}
