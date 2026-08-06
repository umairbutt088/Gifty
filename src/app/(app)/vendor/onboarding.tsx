import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DashboardHeader, PrimaryButton, ScreenShell } from '@/components/dashboard';
import {
  DeliveryOptionsField,
  FormField,
  StoreLogoPicker,
  type DeliveryOptionsValue,
  type GiftImageSelection,
} from '@/components/vendor';
import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { resolveStoreLogoUrl } from '@/lib/store-logo-upload';
import { upsertVendorStore } from '@/lib/vendor-store';
import {
  deliveryOptionsFromStore,
  deliveryOptionsToStoreInput,
  getDeliveryOptionsValidationError,
  getOnboardingResumeStep,
  getStoreFulfillmentSummary,
  STORE_BIO_MAX_LENGTH,
} from '@/lib/vendor-store-helpers';
import { useAuth } from '@/providers/auth-provider';
import { useVendorStore } from '@/providers/vendor-store-provider';

const STEPS = ['Store profile', 'Fulfillment', 'Payout details'] as const;

type OnboardingPhase = 'welcome' | 'form' | 'success';

export default function VendorOnboardingScreen() {
  const { profile } = useAuth();
  const { store, refreshStore } = useVendorStore();
  const colors = useColors();
  const [phase, setPhase] = useState<OnboardingPhase>('welcome');
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const [name, setName] = useState('');
  const [logo, setLogo] = useState<GiftImageSelection | null>(null);
  const [bio, setBio] = useState('');
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOptionsValue>({
    offersDelivery: false,
    deliveryRadiusKm: '',
    deliveryCharge: '',
    deliveryCities: [],
  });
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');

  useEffect(() => {
    if (!store || hydrated) return;

    setName(store.name ?? '');
    if (store.logo_url) {
      setLogo({ uri: store.logo_url });
    }
    setBio(store.bio ?? '');
    setDeliveryOptions(deliveryOptionsFromStore(store));
    setBankAccountName(store.bank_account_name ?? '');
    setBankAccountNumber(store.bank_account_number ?? '');
    setBankName(store.bank_name ?? '');

    const resumeStep = getOnboardingResumeStep(store);
    if (resumeStep > 0 || store.name?.trim()) {
      setPhase('form');
      setStep(resumeStep);
    }

    setHydrated(true);
  }, [store, hydrated]);

  async function persistStore(options: { complete: boolean }): Promise<boolean> {
    if (!profile) return false;

    setLoading(true);
    setError(null);

    const { url: logoUrl, error: logoError } = await resolveStoreLogoUrl(
      profile.id,
      logo,
      store?.logo_url,
    );

    if (logoError) {
      setLoading(false);
      setError(logoError.message);
      return false;
    }

    const deliveryInput = deliveryOptionsToStoreInput(deliveryOptions);

    const { error: saveError } = await upsertVendorStore(profile.id, {
      name,
      logoUrl,
      bio,
      ...deliveryInput,
      bankAccountName,
      bankAccountNumber,
      bankName,
      onboardingComplete: options.complete,
    });

    if (saveError) {
      setLoading(false);
      setError(saveError.message);
      return false;
    }

    await refreshStore();
    setLoading(false);
    return true;
  }

  async function handleContinue() {
    if (!profile) return;

    if (step === 0 && !name.trim()) {
      setError('Store name is required.');
      return;
    }

    if (step === 1) {
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
    }

    const saved = await persistStore({ complete: false });
    if (!saved) return;

    setStep(step + 1);
    setError(null);
  }

  async function handleFinish() {
    const saved = await persistStore({ complete: true });
    if (!saved) return;

    setPhase('success');
    setError(null);
  }

  if (phase === 'welcome') {
    return (
      <ScreenShell>
        <DashboardHeader
          title="Welcome to Gifty"
          subtitle="Set up your store once, then list gifts and receive orders."
          showBanner={false}
        />

        <View style={styles.welcomeBody}>
          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
            You will add your store profile, pickup or delivery settings, and optional payout details.
          </Text>
        </View>

        <PrimaryButton label="Get started" onPress={() => setPhase('form')} />
      </ScreenShell>
    );
  }

  if (phase === 'success') {
    return (
      <ScreenShell>
        <DashboardHeader
          title="Store ready"
          subtitle="Your shop is live. Add your first gift to start selling."
          showBanner={false}
        />

        <View
          style={[
            styles.summaryCard,
            {
              borderColor: colors.surfaceBorder,
              backgroundColor: colors.surface,
            },
          ]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.summaryLine, { color: colors.textSecondary }]}>
            {deliveryOptions.offersDelivery
              ? getStoreFulfillmentSummary({
                  id: '',
                  vendor_id: profile?.id ?? '',
                  name,
                  logo_url: null,
                  bio: null,
                  delivery_cities: deliveryOptions.deliveryCities,
                  offers_delivery: true,
                  delivery_radius_km: Number.parseFloat(deliveryOptions.deliveryRadiusKm) || null,
                  delivery_charge_cents:
                    deliveryOptionsToStoreInput(deliveryOptions).deliveryChargeCents,
                })
              : 'Pickup only'}
          </Text>
          <Text style={[styles.summaryLine, { color: colors.textSecondary }]}>
            Payout:{' '}
            {bankAccountName.trim() && bankName.trim() && bankAccountNumber.trim()
              ? 'Added'
              : 'Skipped — add anytime in Profile'}
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="Add first gift"
            onPress={() => router.replace('/vendor/gift/new')}
          />
          <PrimaryButton
            label="Go to dashboard"
            variant="secondary"
            onPress={() => router.replace('/vendor')}
          />
        </View>
      </ScreenShell>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenShell scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
        <DashboardHeader
          title="Set up your store"
          subtitle={`Step ${step + 1} of ${STEPS.length}`}
          showBanner={false}
        />

        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceBorder }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((step + 1) / STEPS.length) * 100}%`,
                backgroundColor: colors.accent,
              },
            ]}
          />
        </View>

        <Text style={[styles.stepLabel, { color: colors.text }]}>{STEPS[step]}</Text>

        {step === 0 ? (
          <>
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
          </>
        ) : null}

        {step === 1 ? (
          <DeliveryOptionsField value={deliveryOptions} onChange={setDeliveryOptions} />
        ) : null}

        {step === 2 ? (
          <>
            <Text style={[styles.optionalCopy, { color: colors.textSecondary }]}>
              Payout details are optional. You can skip now and add them later from Profile.
            </Text>
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

          {step < STEPS.length - 1 ? (
            <PrimaryButton label="Continue" loading={loading} onPress={() => void handleContinue()} />
          ) : (
            <>
              <PrimaryButton
                label="Finish setup"
                loading={loading}
                onPress={() => void handleFinish()}
              />
              <PrimaryButton
                label="Skip payout for now"
                variant="secondary"
                disabled={loading}
                onPress={() => void handleFinish()}
              />
            </>
          )}
        </View>
      </ScreenShell>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  welcomeBody: {
    marginBottom: Spacing.four,
  },
  welcomeText: {
    fontSize: 15,
    lineHeight: 22,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  optionalCopy: {
    fontSize: 14,
    lineHeight: 20,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  summaryCard: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Spacing.four,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLine: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: Spacing.two,
  },
  error: {
    color: '#E05D5D',
    fontSize: 14,
  },
});
