export function formatMoney(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function parsePriceToCents(value: string): number | null {
  const normalized = value.replace(/[^0-9.]/g, '');
  if (!normalized) return null;

  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount) || amount < 0) return null;

  return Math.round(amount * 100);
}

export function parseDeliveryCities(value: string): string[] {
  return value
    .split(',')
    .map((city) => city.trim())
    .filter(Boolean);
}

export function formatDeliveryCities(cities: string[]): string {
  return cities.join(', ');
}
