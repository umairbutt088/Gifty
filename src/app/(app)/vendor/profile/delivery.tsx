import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { DashboardHeader, PrimaryButton, ScreenShell } from '@/components/dashboard';
import { DeliveryOptionsField, type DeliveryOptionsValue } from '@/components/vendor';
import { upsertVendorStore } from '@/lib/vendor-store';
import {
  deliveryOptionsFromStore,
  deliveryOptionsToStoreInput,
  getDeliveryOptionsValidationError,
} from '@/lib/vendor-store-helpers';
import { useAuth } from '@/providers/auth-provider';
import { useVendorStore } from '@/providers/vendor-store-provider';

export default function VendorProfileDeliveryScreen() {
  const { profile } = useAuth();
  const { store, refreshStore } = useVendorStore();
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOptionsValue>({
    offersDelivery: false,
    deliveryRadiusKm: '',
    deliveryCharge: '',
    deliveryCities: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!store || hydrated) return;

    setDeliveryOptions(deliveryOptionsFromStore(store));
    setHydrated(true);
  }, [store, hydrated]);

  async function handleSave() {
    if (!profile || !store) return;

    const validationError = getDeliveryOptionsValidationError(
      deliveryOptions.offersDelivery,
      deliveryOptions.deliveryRadiusKm,
      deliveryOptions.deliveryCharge,
      deliveryOptions.deliveryCities,
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    const deliveryInput = deliveryOptionsToStoreInput(deliveryOptions);
    if (deliveryInput.deliveryChargeCents == null && deliveryOptions.offersDelivery) {
      setError('Enter a fixed delivery charge (use 0 for free delivery).');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: saveError } = await upsertVendorStore(profile.id, {
      name: store.name,
      logoUrl: store.logo_url,
      bio: store.bio,
      ...deliveryInput,
      bankAccountName: store.bank_account_name,
      bankAccountNumber: store.bank_account_number,
      bankName: store.bank_name,
      onboardingComplete: store.onboarding_complete,
    });

    setLoading(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    await refreshStore();
    Alert.alert('Saved', 'Fulfillment settings updated.', [
      { text: 'Done', onPress: () => router.back() },
    ]);
  }

  return (
    <ScreenShell scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <DashboardHeader
        title="Delivery settings"
        subtitle="Choose whether buyers pick up or you deliver, and set your delivery fee."
        showBanner={false}
        showBack
        backHref="/vendor/profile"
      />

      <DeliveryOptionsField value={deliveryOptions} onChange={setDeliveryOptions} error={error} />

      <PrimaryButton label="Save" loading={loading} onPress={() => void handleSave()} />
    </ScreenShell>
  );
}
