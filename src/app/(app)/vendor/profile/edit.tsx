import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { DashboardHeader, PrimaryButton, ScreenShell } from '@/components/dashboard';
import { FormField } from '@/components/vendor';
import { upsertVendorStore } from '@/lib/vendor-store';
import { useAuth } from '@/providers/auth-provider';
import { useVendorStore } from '@/providers/vendor-store-provider';

export default function VendorProfileEditScreen() {
  const { profile } = useAuth();
  const { store, refreshStore } = useVendorStore();
  const [name, setName] = useState(store?.name ?? '');
  const [logoUrl, setLogoUrl] = useState(store?.logo_url ?? '');
  const [bio, setBio] = useState(store?.bio ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!profile || !store) return;

    if (!name.trim()) {
      setError('Store name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: saveError } = await upsertVendorStore(profile.id, {
      name,
      logoUrl,
      bio,
      deliveryCities: store.delivery_cities,
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
    Alert.alert('Saved', 'Store info updated.', [{ text: 'Done', onPress: () => router.back() }]);
  }

  return (
    <ScreenShell scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <DashboardHeader
        title="Edit store"
        subtitle="Update your shop name, logo, and bio."
        showBanner={false}
        showBack
        backHref="/vendor/profile"
      />

      <FormField
        label="Store name"
        value={name}
        onChangeText={setName}
        placeholder="Bloom & Box"
        autoCapitalize="words"
      />
      <FormField
        label="Logo URL"
        value={logoUrl}
        onChangeText={setLogoUrl}
        placeholder="https://..."
        autoCapitalize="none"
        hint="Optional image URL for your shop logo."
      />
      <FormField
        label="Bio"
        value={bio}
        onChangeText={setBio}
        placeholder="Tell buyers what makes your gifts special."
        multiline
        style={styles.multiline}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton label="Save" loading={loading} onPress={() => void handleSave()} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  error: {
    color: '#E05D5D',
    fontSize: 14,
  },
});
