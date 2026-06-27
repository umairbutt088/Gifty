import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  DashboardHeader,
  MenuRow,
  PrimaryButton,
  ScreenShell,
  SectionTitle,
  StatGrid,
} from '@/components/dashboard';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { formatDeliveryCities, formatMoney } from '@/lib/format';
import { fetchVendorOrders, getVendorEarningsSummary } from '@/lib/vendor-orders';
import { useAuth } from '@/providers/auth-provider';
import { useVendorStore } from '@/providers/vendor-store-provider';

export default function VendorProfileTabScreen() {
  const { profile, signOut } = useAuth();
  const { store, refreshStore } = useVendorStore();
  const [signingOut, setSigningOut] = useState(false);
  const [earnings, setEarnings] = useState({
    totalOrders: 0,
    deliveredCount: 0,
    pendingCount: 0,
    totalCents: 0,
  });

  const loadSummary = useCallback(async () => {
    if (!profile) return;

    await refreshStore();
    const orders = await fetchVendorOrders(profile.id);
    setEarnings(getVendorEarningsSummary(orders));
  }, [profile, refreshStore]);

  useFocusEffect(
    useCallback(() => {
      void loadSummary();
    }, [loadSummary]),
  );

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    router.replace('/');
  }

  return (
    <ScreenShell>
      <DashboardHeader
        title="Profile"
        subtitle="Your store, earnings, and account settings."
        role={profile?.role}
      />

      <View style={styles.profileCard}>
        {store?.logo_url ? (
          <Image source={{ uri: store.logo_url }} style={styles.logo} contentFit="cover" />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoPlaceholderText}>
              {(store?.name || profile?.fullName || 'S').slice(0, 1).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.profileText}>
          <Text style={styles.storeName}>{store?.name || 'Your store'}</Text>
          <Text style={styles.userName}>{profile?.fullName}</Text>
          <Text style={styles.storeBio} numberOfLines={3}>
            {store?.bio || 'Add a short bio so buyers know what makes your gifts special.'}
          </Text>
          <Text style={styles.cities}>
            Delivers to:{' '}
            {store?.delivery_cities?.length
              ? formatDeliveryCities(store.delivery_cities)
              : 'No cities set'}
          </Text>
        </View>
      </View>

      <SectionTitle>Earnings</SectionTitle>
      <StatGrid
        items={[
          { label: 'Total earned', value: formatMoney(earnings.totalCents) },
          { label: 'Delivered', value: String(earnings.deliveredCount) },
          { label: 'Pending', value: String(earnings.pendingCount) },
          { label: 'All orders', value: String(earnings.totalOrders) },
        ]}
      />

      <SectionTitle>My store</SectionTitle>
      <MenuRow
        title="Edit store info"
        description="Name, logo, and bio"
        href="/vendor/profile/edit"
      />
      <MenuRow
        title="Delivery settings"
        description="Cities you deliver to"
        href="/vendor/profile/delivery"
      />
      <MenuRow
        title="Bank details"
        description="Payout account for earnings"
        href="/vendor/profile/bank"
      />

      <SectionTitle>Account</SectionTitle>
      <MenuRow title="App settings" description="Theme and preferences" href="/settings" />

      <PrimaryButton label="Sign out" loading={signingOut} onPress={handleSignOut} variant="secondary" />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: Spacing.four,
    backgroundColor: Colors.surface,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: Spacing.three,
  },
  logoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceNested,
  },
  logoPlaceholderText: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  profileText: {
    flex: 1,
    gap: Spacing.one,
  },
  storeName: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  userName: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  storeBio: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  cities: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
