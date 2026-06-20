import { DashboardHeader, EmptyState, MenuRow, ScreenShell } from '@/components/dashboard';

export default function VendorGiftNewScreen() {
  return (
    <ScreenShell>
      <DashboardHeader
        title="Add a gift"
        subtitle="Upload images, set a price, and write a description."
        showBanner={false}
      />
      <EmptyState
        title="Listing form coming soon"
        message="Vendors will add title, description, price, and multiple gift photos here."
      />
      <MenuRow title="Back to listings" href="/vendor/products" />
    </ScreenShell>
  );
}
