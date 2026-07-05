import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { DashboardHeader, PrimaryButton, ScreenShell } from '@/components/dashboard';
import { FormField, StoreLogoPicker, type GiftImageSelection } from '@/components/vendor';
import { resolveStoreLogoUrl } from '@/lib/store-logo-upload';
import { upsertVendorStore } from '@/lib/vendor-store';
import { STORE_BIO_MAX_LENGTH } from '@/lib/vendor-store-helpers';
import { useAuth } from '@/providers/auth-provider';
import { useVendorStore } from '@/providers/vendor-store-provider';

export default function VendorProfileEditScreen() {
  const { profile } = useAuth();
  const { store, refreshStore } = useVendorStore();
  const [name, setName] = useState('');
  const [logo, setLogo] = useState<GiftImageSelection | null>(null);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!store || hydrated) return;

    setName(store.name ?? '');
    if (store.logo_url) {
      setLogo({ uri: store.logo_url });
    }
    setBio(store.bio ?? '');
    setHydrated(true);
  }, [store, hydrated]);

  async function handleSave() {
    if (!profile || !store) return;

    if (!name.trim()) {
      setError('Store name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    const { url: logoUrl, error: logoError } = await resolveStoreLogoUrl(
      profile.id,
      logo,
      store.logo_url,
    );

    if (logoError) {
      setLoading(false);
      setError(logoError.message);
      return;
    }

    const { error: saveError } = await upsertVendorStore(profile.id, {
      name,
      logoUrl,
      bio,
      deliveryCities: store.delivery_cities,
      offersDelivery: store.offers_delivery,
      deliveryRadiusKm: store.delivery_radius_km,
      deliveryChargeCents: store.delivery_charge_cents,
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
      <StoreLogoPicker value={logo} onChange={setLogo} />
      <FormField
        label="Bio"
        value={bio}
        onChangeText={setBio}
        placeholder="Tell buyers what makes your gifts special."
        multiline
        maxLength={STORE_BIO_MAX_LENGTH}
        style={styles.multiline}
        hint={`${bio.length}/${STORE_BIO_MAX_LENGTH} characters`}
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
