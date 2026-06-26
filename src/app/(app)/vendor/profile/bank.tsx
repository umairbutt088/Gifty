import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { DashboardHeader, PrimaryButton, ScreenShell } from '@/components/dashboard';
import { FormField } from '@/components/vendor';
import { upsertVendorStore } from '@/lib/vendor-store';
import { useAuth } from '@/providers/auth-provider';
import { useVendorStore } from '@/providers/vendor-store-provider';

export default function VendorProfileBankScreen() {
  const { profile } = useAuth();
  const { store, refreshStore } = useVendorStore();
  const [bankAccountName, setBankAccountName] = useState(store?.bank_account_name ?? '');
  const [bankName, setBankName] = useState(store?.bank_name ?? '');
  const [bankAccountNumber, setBankAccountNumber] = useState(store?.bank_account_number ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!profile || !store) return;

    setLoading(true);
    setError(null);

    const { error: saveError } = await upsertVendorStore(profile.id, {
      name: store.name,
      logoUrl: store.logo_url,
      bio: store.bio,
      deliveryCities: store.delivery_cities,
      bankAccountName,
      bankAccountNumber,
      bankName,
      onboardingComplete: store.onboarding_complete,
    });

    setLoading(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    await refreshStore();
    Alert.alert('Saved', 'Bank details updated.', [{ text: 'Done', onPress: () => router.back() }]);
  }

  return (
    <ScreenShell scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <DashboardHeader
        title="Bank details"
        subtitle="Used for future payouts when orders are delivered."
        showBanner={false}
        showBack
        backHref="/vendor/profile"
      />

      <FormField
        label="Account holder name"
        value={bankAccountName}
        onChangeText={setBankAccountName}
        autoCapitalize="words"
      />
      <FormField label="Bank name" value={bankName} onChangeText={setBankName} autoCapitalize="words" />
      <FormField
        label="Account number"
        value={bankAccountNumber}
        onChangeText={setBankAccountNumber}
        autoCapitalize="none"
        hint="Stored for payout setup. Payment integration can be added later."
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
