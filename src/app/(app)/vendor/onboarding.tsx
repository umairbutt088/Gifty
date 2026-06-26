import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DashboardHeader, PrimaryButton, ScreenShell } from '@/components/dashboard';
import { FormField } from '@/components/vendor';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { formatDeliveryCities, parseDeliveryCities } from '@/lib/format';
import { upsertVendorStore } from '@/lib/vendor-store';
import { useAuth } from '@/providers/auth-provider';
import { useVendorStore } from '@/providers/vendor-store-provider';

const STEPS = ['Store profile', 'Delivery cities', 'Bank details'] as const;

export default function VendorOnboardingScreen() {
  const { profile } = useAuth();
  const { store, refreshStore } = useVendorStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bio, setBio] = useState('');
  const [deliveryCitiesInput, setDeliveryCitiesInput] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');

  useEffect(() => {
    if (!store || hydrated) return;

    setName(store.name ?? '');
    setLogoUrl(store.logo_url ?? '');
    setBio(store.bio ?? '');
    setDeliveryCitiesInput(
      store.delivery_cities?.length ? formatDeliveryCities(store.delivery_cities) : '',
    );
    setBankAccountName(store.bank_account_name ?? '');
    setBankAccountNumber(store.bank_account_number ?? '');
    setBankName(store.bank_name ?? '');
    setHydrated(true);
  }, [store, hydrated]);

  async function saveStep() {
    if (!profile) return;

    const deliveryCities = parseDeliveryCities(deliveryCitiesInput);
    const isFinalStep = step === STEPS.length - 1;

    if (step === 0 && !name.trim()) {
      setError('Store name is required.');
      return;
    }

    if (step === 1 && deliveryCities.length === 0) {
      setError('Add at least one delivery city.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: saveError } = await upsertVendorStore(profile.id, {
      name,
      logoUrl,
      bio,
      deliveryCities,
      bankAccountName,
      bankAccountNumber,
      bankName,
      onboardingComplete: isFinalStep,
    });

    if (saveError) {
      setLoading(false);
      setError(saveError.message);
      return;
    }

    if (isFinalStep) {
      await refreshStore();
      setLoading(false);
      Alert.alert('Store ready', 'Your vendor store is set up. Start listing gifts!', [
        { text: 'Continue', onPress: () => router.replace('/vendor') },
      ]);
      return;
    }

    setStep(step + 1);
    setLoading(false);
    void refreshStore();
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenShell scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
        <DashboardHeader
          title="Set up your store"
          subtitle="Complete onboarding once, then manage everything from your dashboard tabs."
          showBanner={false}
        />

        <View style={styles.progressRow}>
          {STEPS.map((label, index) => (
            <View key={label} style={styles.progressItem}>
              <View style={[styles.dot, index <= step && styles.dotActive]} />
              <Text style={[styles.progressLabel, index === step && styles.progressLabelActive]}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        {step === 0 ? (
          <>
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
              hint="Optional. Paste an image URL for your shop logo."
            />
            <FormField
              label="Bio"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell buyers what makes your gifts special."
              multiline
              style={styles.multiline}
            />
          </>
        ) : null}

        {step === 1 ? (
          <FormField
            label="Delivery cities"
            value={deliveryCitiesInput}
            onChangeText={setDeliveryCitiesInput}
            placeholder="Karachi, Lahore, Islamabad"
            hint="Comma-separated list of cities you deliver to."
          />
        ) : null}

        {step === 2 ? (
          <>
            <FormField
              label="Account holder name"
              value={bankAccountName}
              onChangeText={setBankAccountName}
              placeholder="Full name on account"
              autoCapitalize="words"
            />
            <FormField
              label="Bank name"
              value={bankName}
              onChangeText={setBankName}
              placeholder="Your bank"
              autoCapitalize="words"
            />
            <FormField
              label="Account number"
              value={bankAccountNumber}
              onChangeText={setBankAccountNumber}
              placeholder="IBAN or account number"
              autoCapitalize="none"
              hint="Stored securely for future payouts. You can update this later in Store."
            />
          </>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          {step > 0 ? (
            <PrimaryButton
              label="Back"
              variant="secondary"
              disabled={loading}
              onPress={() => {
                setError(null);
                setStep(step - 1);
              }}
            />
          ) : null}
          <PrimaryButton
            label={step === STEPS.length - 1 ? 'Finish setup' : 'Continue'}
            loading={loading}
            onPress={() => void saveStep()}
          />
        </View>
      </ScreenShell>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  progressRow: {
    gap: Spacing.three,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.surfaceBorder,
  },
  dotActive: {
    backgroundColor: Colors.accent,
  },
  progressLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  progressLabelActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  actions: {
    gap: Spacing.two,
  },
  error: {
    color: '#E05D5D',
    fontSize: 14,
  },
});
