import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import {
  DashboardHeader,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
} from '@/components/dashboard';
import { GlassCard } from '@/components/glass-card';
import { ImageGalleryViewer } from '@/components/image-gallery-viewer';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { StatusBadge, GiftStatusPicker } from '@/components/vendor';
import { GIFT_CATEGORIES } from '@/constants/vendor';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import { softDeleteGift, fetchGiftById, updateGift } from '@/lib/gifts';
import { useAuth } from '@/providers/auth-provider';
import type { GiftRow, GiftStatus } from '@/types/vendor';

export default function VendorGiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [gift, setGift] = useState<GiftRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const loadGift = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    const row = await fetchGiftById(id);
    setGift(row);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadGift();
    }, [loadGift]),
  );

  function handleDelete() {
    if (!gift) return;

    Alert.alert(
      'Delete gift',
      'Move this gift to Deleted gifts? You can restore it later with photos intact.',
      [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setDeleting(true);
            const { error } = await softDeleteGift(gift.id);
            setDeleting(false);

            if (error) {
              Alert.alert('Could not delete', error.message);
              return;
            }

            router.replace('/vendor');
          })();
        },
      },
    ]);
  }

  async function handleStatusChange(nextStatus: GiftStatus) {
    if (!gift || nextStatus === gift.status) return;

    setSavingStatus(true);
    const { data, error } = await updateGift(gift.id, { status: nextStatus });
    setSavingStatus(false);

    if (error || !data) {
      Alert.alert('Could not update status', error?.message ?? 'Try again.');
      return;
    }

    setGift(data);
  }

  if (loading) {
    return (
      <ScreenShell scroll={false}>
        <ThemedActivityIndicator style={{ marginTop: 48 }} />
      </ScreenShell>
    );
  }

  if (!gift || gift.vendor_id !== profile?.id) {
    return (
      <ScreenShell>
        <DashboardHeader title="Gift not found" showBanner={false} showBack backHref="/vendor" />
      </ScreenShell>
    );
  }

  const categoryLabel =
    GIFT_CATEGORIES.find((item) => item.value === gift.category)?.label ?? gift.category;

  return (
    <ScreenShell scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <DashboardHeader
        title={gift.title}
        showBanner={false}
        showBack
        backHref="/vendor"
        trailing={<StatusBadge status={gift.status} kind="gift" />}
      />

      <ImageGalleryViewer images={gift.image_urls} />

      <SectionTitle>Details</SectionTitle>
      <GlassCard style={styles.infoCard}>
        <InfoRow label="Price" value={formatMoney(gift.price_cents)} />
        <InfoRow label="Category" value={categoryLabel} />
        <InfoRow label="Stock" value={String(gift.stock)} />
      </GlassCard>

      <GiftStatusPicker
        value={gift.status}
        onChange={(nextStatus) => void handleStatusChange(nextStatus)}
        disabled={savingStatus}
      />

      {gift.description ? (
        <>
          <SectionTitle>Description</SectionTitle>
          <GlassCard style={styles.infoCard}>
            <Text style={styles.description}>{gift.description}</Text>
          </GlassCard>
        </>
      ) : null}

      <PrimaryButton
        label="Edit gift"
        onPress={() => router.push(`/vendor/gift/${gift.id}/edit`)}
      />
      <PrimaryButton
        label="Delete gift"
        loading={deleting}
        onPress={handleDelete}
        variant="secondary"
      />
    </ScreenShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
