import { useLocalSearchParams } from 'expo-router';

import { DashboardHeader, EmptyState, PrimaryButton, ScreenShell } from '@/components/dashboard';

export default function BuyerGiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenShell>
      <DashboardHeader
        title="Gift details"
        subtitle={`Listing #${id ?? '—'}`}
        showBanner={false}
      />
      <EmptyState
        title="Image gallery & description"
        message="Swipe through vendor photos and read the full gift description before adding to cart."
      />
      <PrimaryButton label="Add to cart (soon)" disabled />
    </ScreenShell>
  );
}
