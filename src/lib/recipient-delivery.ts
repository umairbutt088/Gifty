import { Env } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import type { VendorOrderStatus } from '@/types/vendor';

/** Set to true when SMS/email provider (Twilio, Resend, etc.) is configured. */
export const RECIPIENT_NOTIFICATIONS_ENABLED = false;

export type RecipientGiftView = {
  recipient_name: string;
  gift_title: string;
  gift_image_url: string | null;
  gift_message: string | null;
  status: VendorOrderStatus;
  delivery_date: string | null;
  recipient_confirmed_at: string | null;
  quantity: number;
};

export function buildRecipientLink(deliveryToken: string): string {
  return `${Env.appUrl.replace(/\/$/, '')}/r/${deliveryToken}`;
}

export function normalizeRecipientPhone(value: string): string {
  return value.replace(/[^\d+]/g, '').trim();
}

export function normalizeRecipientEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function fetchRecipientGiftByToken(
  token: string,
): Promise<RecipientGiftView | null> {
  const { data, error } = await supabase.rpc('get_recipient_gift_by_token', {
    p_token: token,
  });

  if (error || !data) {
    return null;
  }

  return data as RecipientGiftView;
}

export async function confirmRecipientDelivery(
  token: string,
  note?: string,
): Promise<{ confirmed: boolean; error: Error | null }> {
  const { data, error } = await supabase.rpc('confirm_recipient_delivery', {
    p_token: token,
    p_note: note?.trim() || null,
  });

  if (error) {
    return { confirmed: false, error: new Error(error.message) };
  }

  return { confirmed: Boolean(data), error: null };
}

export async function notifyRecipientOfDelivery(
  orderId: string,
  event: 'shipped' | 'delivered',
): Promise<{ ok: boolean; error: Error | null }> {
  if (!RECIPIENT_NOTIFICATIONS_ENABLED) {
    return { ok: true, error: null };
  }

  const { data, error } = await supabase.functions.invoke('send-recipient-notification', {
    body: { orderId, event },
  });

  if (error) {
    return { ok: false, error: new Error(error.message) };
  }

  if (data && typeof data === 'object' && 'error' in data && data.error) {
    return { ok: false, error: new Error(String(data.error)) };
  }

  return { ok: true, error: null };
}
