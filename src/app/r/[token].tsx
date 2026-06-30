import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, SectionTitle } from '@/components/dashboard';
import { FormField } from '@/components/vendor';
import { GlassCard } from '@/components/glass-card';
import { ScreenBackground } from '@/components/screen-background';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { ORDER_STATUS_LABELS } from '@/constants/vendor';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import {
  confirmRecipientDelivery,
  fetchRecipientGiftByToken,
  type RecipientGiftView,
} from '@/lib/recipient-delivery';

export default function RecipientGiftScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [gift, setGift] = useState<RecipientGiftView | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const loadGift = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const row = await fetchRecipientGiftByToken(token);
    setGift(row);
    setConfirmed(Boolean(row?.recipient_confirmed_at));
    setLoading(false);
  }, [token]);

  useEffect(() => {
    void loadGift();
  }, [loadGift]);

  async function handleConfirm() {
    if (!token) return;

    setConfirming(true);
    setError(null);

    const { confirmed: didConfirm, error: confirmError } = await confirmRecipientDelivery(
      token,
      note,
    );

    setConfirming(false);

    if (confirmError) {
      setError(confirmError.message);
      return;
    }

    if (!didConfirm) {
      setError('This gift link is invalid or was already confirmed.');
      return;
    }

    setConfirmed(true);
    await loadGift();
  }

  return (
    <View style={styles.root}>
      <ScreenBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {loading ? (
            <ThemedActivityIndicator style={styles.loader} />
          ) : !gift ? (
            <GlassCard style={styles.card}>
              <Text style={styles.title}>Gift link not found</Text>
              <Text style={styles.body}>
                This delivery link may be invalid or expired. Ask the sender to share it again.
              </Text>
            </GlassCard>
          ) : (
            <>
              <Text style={styles.eyebrow}>Gifty delivery</Text>
              <Text style={styles.title}>Hi {gift.recipient_name}</Text>
              <Text style={styles.subtitle}>
                {gift.gift_title} · {ORDER_STATUS_LABELS[gift.status]}
              </Text>

              {gift.gift_image_url ? (
                <Image source={{ uri: gift.gift_image_url }} style={styles.image} contentFit="cover" />
              ) : null}

              <GlassCard style={styles.card}>
                <SectionTitle>Gift details</SectionTitle>
                <Text style={styles.body}>Quantity: {gift.quantity}</Text>
                {gift.delivery_date ? (
                  <Text style={styles.body}>Preferred delivery: {gift.delivery_date}</Text>
                ) : null}
                {gift.gift_message ? (
                  <Text style={styles.message}>“{gift.gift_message}”</Text>
                ) : null}
              </GlassCard>

              {confirmed || gift.recipient_confirmed_at ? (
                <GlassCard style={styles.card}>
                  <Text style={styles.confirmedTitle}>Delivery confirmed</Text>
                  <Text style={styles.body}>Thanks for confirming you received your gift.</Text>
                </GlassCard>
              ) : gift.status === 'delivered' ? (
                <>
                  <FormField
                    label="Optional note"
                    value={note}
                    onChangeText={setNote}
                    placeholder="Anything you'd like to share with the sender?"
                    multiline
                    style={styles.noteInput}
                  />
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <PrimaryButton
                    label="I received my gift"
                    loading={confirming}
                    onPress={() => void handleConfirm()}
                  />
                </>
              ) : (
                <GlassCard style={styles.card}>
                  <Text style={styles.body}>
                    {gift.status === 'shipped'
                      ? 'Your gift is on the way. You can confirm receipt here once it arrives.'
                      : 'Your gift is being prepared. We will notify you when it ships and when it is delivered.'}
                  </Text>
                </GlassCard>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  loader: {
    marginTop: Spacing.six,
  },
  eyebrow: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: Spacing.three,
    backgroundColor: Colors.surfaceNested,
  },
  card: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  message: {
    color: Colors.text,
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  confirmedTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  noteInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  error: {
    color: '#E05D5D',
    fontSize: 14,
  },
});
