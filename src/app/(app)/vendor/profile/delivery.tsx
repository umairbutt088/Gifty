import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { DashboardHeader, PrimaryButton, ScreenShell } from '@/components/dashboard';
import { FormField } from '@/components/vendor';
import { formatDeliveryCities, parseDeliveryCities } from '@/lib/format';
import { upsertVendorStore } from '@/lib/vendor-store';
import { useAuth } from '@/providers/auth-provider';
import { useVendorStore } from '@/providers/vendor-store-provider';

export default function VendorProfileDeliveryScreen() {
  const { profile } = useAuth();
  const { store, refreshStore } = useVendorStore();
  const [deliveryCitiesInput, setDeliveryCitiesInput] = useState(
    store?.delivery_cities?.length ? formatDeliveryCities(store.delivery_cities) : '',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!profile || !store) return;

    const deliveryCities = parseDeliveryCities(deliveryCitiesInput);
    if (deliveryCities.length === 0) {
      setError('Add at least one delivery city.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: saveError } = await upsertVendorStore(profile.id, {
      name: store.name,
      logoUrl: store.logo_url,
      bio: store.bio,
      deliveryCities,
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
    Alert.alert('Saved', 'Delivery cities updated.', [
      { text: 'Done', onPress: () => router.back() },
    ]);
  }

  return (
    <ScreenShell scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <DashboardHeader
        title="Delivery settings"
        subtitle="Buyers can only send gifts to cities you deliver to."
        showBanner={false}
        showBack
        backHref="/vendor/profile"
      />

      <FormField
        label="Delivery cities"
        value={deliveryCitiesInput}
        onChangeText={setDeliveryCitiesInput}
        placeholder="Karachi, Lahore, Islamabad"
        hint="Comma-separated list."
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton label="Save" loading={loading} onPress={() => void handleSave()} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  error: {
    color: '#E05D5D',
    fontSize: 14,
  },
});
