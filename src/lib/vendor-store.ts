import { supabase } from '@/lib/supabase';
import type { VendorStoreInput, VendorStoreRow } from '@/types/vendor';

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
  const payload = {
    vendor_id: vendorId,
    name: input.name.trim(),
    logo_url: input.logoUrl?.trim() || null,
    bio: input.bio?.trim() || null,
    delivery_cities: input.deliveryCities,
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

export function isVendorStoreOnboarded(store: VendorStoreRow | null): boolean {
  if (!store?.onboarding_complete) return false;
  if (!store.name.trim()) return false;
  if (store.delivery_cities.length === 0) return false;
  return true;
}
