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
import { GiftStatusPicker, StatusBadge } from '@/components/vendor';
import { Spacing } from '@/constants/theme';
import { GIFT_CATEGORIES, GIFT_OCCASIONS } from '@/constants/vendor';
import { useColors } from '@/hooks/use-colors';
import { formatMoney } from '@/lib/format';
import { formatPrepTime } from '@/lib/gift-marketplace';
import { fetchGiftVariants } from '@/lib/gift-variants';
import { fetchGiftById, softDeleteGift, updateGift } from '@/lib/gifts';
import { useAuth } from '@/providers/auth-provider';
import type { GiftRow, GiftStatus, GiftVariantRow } from '@/types/vendor';

export default function VendorGiftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const colors = useColors();
  const [gift, setGift] = useState<GiftRow | null>(null);
  const [variants, setVariants] = useState<GiftVariantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  const loadGift = useCallback(async () => {
    if (!id) return;

    const [row, giftVariants] = await Promise.all([
      fetchGiftById(id),
      fetchGiftVariants(id),
    ]);
    setGift(row);
    setVariants(giftVariants);
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
      ],
    );
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

  if (loading && !gift) {
    return (
      <ScreenShell scroll={false}>
        <ThemedActivityIndicator style={{ marginTop: 48 }} />
      </ScreenShell>
    );
  }

  if (!gift || gift.vendor_id !== profile?.id) {
    return (
      <ScreenShell>
        <DashboardHeader
          title="Gift not found"
          showBanner={false}
          showBack
          backHref="/vendor"
        />
      </ScreenShell>
    );
  }

  const categoryLabel =
    GIFT_CATEGORIES.find((item) => item.value === gift.category)?.label ??
    gift.category;
  const occasionLabel =
    (gift.occasion_tags ?? [])
      .map(
        (tag) => GIFT_OCCASIONS.find((item) => item.value === tag)?.label ?? tag,
      )
      .join(', ') || 'None';
  const prepLabel = formatPrepTime(gift.prep_time_minutes) ?? 'Not set';
  const galleryKey = `${gift.id}:${gift.updated_at}:${gift.image_urls.join('|')}`;

  return (
    <ScreenShell scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <DashboardHeader
        title={gift.title}
        showBanner={false}
        showBack
        backHref="/vendor"
        trailing={<StatusBadge status={gift.status} kind="gift" />}
      />

      <ImageGalleryViewer key={galleryKey} images={gift.image_urls} />

      <SectionTitle>Details</SectionTitle>
      <GlassCard style={styles.infoCard}>
        <InfoRow label="Price" value={formatMoney(gift.price_cents)} />
        {gift.original_price_cents != null &&
        gift.original_price_cents > gift.price_cents ? (
          <InfoRow
            label="Compare-at"
            value={formatMoney(gift.original_price_cents)}
          />
        ) : null}
        <InfoRow label="Category" value={categoryLabel} />
        <InfoRow label="Occasions" value={occasionLabel} />
        <InfoRow label="Stock" value={String(gift.stock)} />
        <InfoRow label="Prep time" value={prepLabel} />
        <InfoRow label="Featured" value={gift.featured ? 'Yes' : 'No'} />
      </GlassCard>

      {variants.length > 0 ? (
        <>
          <SectionTitle>Options</SectionTitle>
          <GlassCard style={styles.infoCard}>
            {variants.map((variant) => (
              <InfoRow
                key={variant.id}
                label={variant.label}
                value={`${formatMoney(variant.price_cents)} · ${variant.stock} left`}
              />
            ))}
          </GlassCard>
        </>
      ) : null}

      <GiftStatusPicker
        value={gift.status}
        onChange={(nextStatus) => void handleStatusChange(nextStatus)}
        disabled={savingStatus}
      />

      {gift.description ? (
        <>
          <SectionTitle>Description</SectionTitle>
          <GlassCard style={styles.infoCard}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {gift.description}
            </Text>
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
  const colors = useColors();

  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
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
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  infoLabel: {
    flexShrink: 0,
    fontSize: 14,
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
});
