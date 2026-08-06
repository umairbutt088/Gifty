import { formatDeliveryCities, formatMoney, parsePriceToCents } from '@/lib/format';
import type { VendorStorePublic, VendorStoreRow } from '@/types/vendor';

const BIO_MAX_LENGTH = 280;

export function normalizeDeliveryCities(input: string[]): string[] {
  const seen = new Set<string>();

  return input
    .map((city) =>
      city
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : ''))
        .join(' '),
    )
    .filter((city) => {
      const key = city.toLowerCase();
      if (!city || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function parseDeliveryCityInput(value: string): string[] {
  return normalizeDeliveryCities(
    value
      .split(',')
      .map((city) => city.trim())
      .filter(Boolean),
  );
}

export function parseDeliveryRadiusKm(value: string): number | null {
  const normalized = value.replace(/[^0-9.]/g, '');
  if (!normalized) return null;

  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return Math.round(amount * 100) / 100;
}

export function formatDeliveryRadiusKm(km: number): string {
  return `${km} km`;
}

export function storeDeliveryChargeToInput(cents: number | null | undefined): string {
  if (cents == null || cents <= 0) return '';
  return (cents / 100).toFixed(2);
}

export function parseDeliveryChargeInput(value: string): number | null {
  return parsePriceToCents(value);
}

export function isDeliveryStepComplete(store: VendorStoreRow | null): boolean {
  if (!store) return false;
  if (!store.offers_delivery) return true;

  return Boolean(
    store.delivery_radius_km != null &&
      store.delivery_radius_km > 0 &&
      store.delivery_charge_cents != null &&
      store.delivery_charge_cents >= 0 &&
      store.delivery_cities.length > 0,
  );
}

export function getDeliveryOptionsValidationError(
  offersDelivery: boolean,
  deliveryRadiusKm: string,
  deliveryCharge: string,
  deliveryCities: string[],
): string | null {
  if (!offersDelivery) return null;

  if (!parseDeliveryRadiusKm(deliveryRadiusKm)) {
    return 'Enter a delivery radius greater than 0 km.';
  }

  const chargeCents = parseDeliveryChargeInput(deliveryCharge);
  if (chargeCents == null) {
    return 'Enter a fixed delivery charge (use 0 for free delivery).';
  }

  if (deliveryCities.length === 0) {
    return 'Add at least one delivery city.';
  }

  return null;
}

export function getStoreFulfillmentSummary(store: VendorStorePublic | VendorStoreRow): string {
  if (!store.offers_delivery) {
    return 'Pickup only';
  }

  const parts: string[] = [];
  if (store.delivery_radius_km != null && store.delivery_radius_km > 0) {
    parts.push(`Within ${formatDeliveryRadiusKm(store.delivery_radius_km)}`);
  }
  if (store.delivery_charge_cents != null) {
    parts.push(
      store.delivery_charge_cents > 0
        ? `${formatMoney(store.delivery_charge_cents)} delivery fee`
        : 'Free delivery',
    );
  }
  if (store.delivery_cities.length > 0) {
    parts.push(formatDeliveryCities(store.delivery_cities));
  }

  return parts.join(' · ') || 'Delivery available';
}

export function getOnboardingResumeStep(store: VendorStoreRow | null): number {
  if (!store?.name?.trim()) return 0;
  if (!isDeliveryStepComplete(store)) return 1;
  return 2;
}

export function isPayoutSetupComplete(store: VendorStoreRow | null): boolean {
  if (!store) return false;
  return Boolean(
    store.bank_account_name?.trim() &&
      store.bank_name?.trim() &&
      store.bank_account_number?.trim(),
  );
}

export type StoreCompletenessItem = {
  id: string;
  label: string;
  done: boolean;
};

export function getStoreCompleteness(
  store: VendorStoreRow | null,
  liveGiftCount = 0,
): { items: StoreCompletenessItem[]; percent: number } {
  const items: StoreCompletenessItem[] = [
    { id: 'name', label: 'Store name', done: Boolean(store?.name?.trim()) },
    { id: 'logo', label: 'Store logo', done: Boolean(store?.logo_url) },
    { id: 'bio', label: 'Store bio', done: Boolean(store?.bio?.trim()) },
    {
      id: 'fulfillment',
      label: store?.offers_delivery ? 'Delivery settings' : 'Pickup option',
      done: isDeliveryStepComplete(store),
    },
    { id: 'payout', label: 'Payout details', done: isPayoutSetupComplete(store) },
    { id: 'gift', label: 'First live gift', done: liveGiftCount > 0 },
  ];

  const doneCount = items.filter((item) => item.done).length;
  const percent = Math.round((doneCount / items.length) * 100);

  return { items, percent };
}

export function addressMatchesDeliveryCities(
  address: string,
  cities: string[],
): boolean {
  const normalized = address.trim().toLowerCase();
  if (!normalized || cities.length === 0) return false;

  return cities.some((city) => normalized.includes(city.trim().toLowerCase()));
}

export function storeDeliversToCity(
  store: VendorStorePublic | VendorStoreRow | null | undefined,
  city: string | null | undefined,
): boolean {
  if (!store || !city?.trim()) return false;
  if (!store.offers_delivery) return false;

  const target = city.trim().toLowerCase();
  return store.delivery_cities.some((item) => item.trim().toLowerCase() === target);
}

export function giftAvailableInDeliveryCity(
  store: VendorStorePublic | VendorStoreRow | null | undefined,
  city: string | null | undefined,
): boolean {
  if (!city?.trim()) return true;
  if (!store) return false;
  if (!store.offers_delivery) return true;
  return storeDeliversToCity(store, city);
}

export function getGiftDeliveryCue(
  store: VendorStorePublic | VendorStoreRow | null | undefined,
  preferredCity?: string | null,
): string | null {
  if (!store) return null;

  if (!store.offers_delivery) {
    return 'Pickup only';
  }

  if (preferredCity?.trim() && storeDeliversToCity(store, preferredCity)) {
    return `Delivers to ${preferredCity.trim()}`;
  }

  const firstCity = store.delivery_cities[0];
  if (firstCity) {
    return store.delivery_cities.length > 1
      ? `Delivers to ${firstCity} +`
      : `Delivers to ${firstCity}`;
  }

  return 'Delivery available';
}

export function getDeliveryCityValidationError(
  address: string,
  store: VendorStorePublic | null,
  vendorLabel: string,
): string | null {
  if (!store?.offers_delivery) return null;
  if (!store.delivery_cities?.length) return null;
  if (!address.trim()) return null;

  if (addressMatchesDeliveryCities(address, store.delivery_cities)) {
    return null;
  }

  return `${vendorLabel} delivers to: ${formatDeliveryCities(store.delivery_cities)}. Include a supported city in the delivery address.`;
}

export const STORE_BIO_MAX_LENGTH = BIO_MAX_LENGTH;

export type DeliveryOptionsFormValue = {
  offersDelivery: boolean;
  deliveryRadiusKm: string;
  deliveryCharge: string;
  deliveryCities: string[];
};

export function deliveryOptionsFromStore(store: VendorStoreRow | null): DeliveryOptionsFormValue {
  return {
    offersDelivery: store?.offers_delivery ?? false,
    deliveryRadiusKm:
      store?.delivery_radius_km != null ? String(store.delivery_radius_km) : '',
    deliveryCharge: storeDeliveryChargeToInput(store?.delivery_charge_cents),
    deliveryCities: store?.delivery_cities ?? [],
  };
}

export function deliveryOptionsToStoreInput(value: DeliveryOptionsFormValue) {
  const offersDelivery = value.offersDelivery;

  return {
    offersDelivery,
    deliveryRadiusKm: offersDelivery ? parseDeliveryRadiusKm(value.deliveryRadiusKm) : null,
    deliveryChargeCents: offersDelivery ? parseDeliveryChargeInput(value.deliveryCharge) : null,
    deliveryCities: offersDelivery ? value.deliveryCities : [],
  };
}
