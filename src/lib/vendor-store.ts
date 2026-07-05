import { supabase } from '@/lib/supabase';
import { normalizeDeliveryCities, isDeliveryStepComplete } from '@/lib/vendor-store-helpers';
import type { VendorStoreInput, VendorStorePublic, VendorStoreRow } from '@/types/vendor';

export async function fetchVendorStore(vendorId: string): Promise<VendorStoreRow | null> {
  const { data, error } = await supabase
    .from('vendor_stores')
    .select('*')
    .eq('vendor_id', vendorId)
    .maybeSingle();

  if (error) {
    if (__DEV__) {
      console.warn('[vendor-store] fetch failed:', error.message);
    }
    return null;
  }

  if (!data) {
    return null;
  }

  return data as VendorStoreRow;
}

export async function upsertVendorStore(
  vendorId: string,
  input: VendorStoreInput,
): Promise<{ data: VendorStoreRow | null; error: Error | null }> {
  const offersDelivery = input.offersDelivery ?? false;

  const payload = {
    vendor_id: vendorId,
    name: input.name.trim(),
    logo_url: input.logoUrl?.trim() || null,
    bio: input.bio?.trim() || null,
    offers_delivery: offersDelivery,
    delivery_radius_km: offersDelivery ? (input.deliveryRadiusKm ?? null) : null,
    delivery_charge_cents: offersDelivery ? (input.deliveryChargeCents ?? 0) : null,
    delivery_cities: offersDelivery ? normalizeDeliveryCities(input.deliveryCities) : [],
    bank_account_name: input.bankAccountName?.trim() || null,
    bank_account_number: input.bankAccountNumber?.trim() || null,
    bank_name: input.bankName?.trim() || null,
    onboarding_complete: input.onboardingComplete ?? false,
  };

  const { data, error } = await supabase
    .from('vendor_stores')
    .upsert(payload, { onConflict: 'vendor_id' })
    .select('*')
    .single();

  return {
    data: (data as VendorStoreRow | null) ?? null,
    error: error
      ? new Error(
          error.message.includes('vendor_stores')
            ? 'Store setup failed. Run migration 2 in Supabase (vendor_stores table missing).'
            : error.message,
        )
      : null,
  };
}

export async function fetchPublicVendorStore(
  vendorId: string,
): Promise<VendorStorePublic | null> {
  const { data, error } = await supabase.rpc('get_vendor_store_public', {
    p_vendor_id: vendorId,
  });

  if (error || !data) {
    if (__DEV__ && error) {
      console.warn('[vendor-store] public fetch failed:', error.message);
    }
    return null;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return row as VendorStorePublic;
}

export async function fetchPublicVendorStores(
  vendorIds: string[],
): Promise<Map<string, VendorStorePublic>> {
  const uniqueIds = [...new Set(vendorIds)];
  const entries = await Promise.all(
    uniqueIds.map(async (vendorId) => {
      const store = await fetchPublicVendorStore(vendorId);
      return [vendorId, store] as const;
    }),
  );

  const map = new Map<string, VendorStorePublic>();
  for (const [vendorId, store] of entries) {
    if (store) {
      map.set(vendorId, store);
    }
  }

  return map;
}

export function isVendorStoreOnboarded(store: VendorStoreRow | null): boolean {
  if (!store?.onboarding_complete) return false;
  if (!store.name.trim()) return false;
  return isDeliveryStepComplete(store);
}
