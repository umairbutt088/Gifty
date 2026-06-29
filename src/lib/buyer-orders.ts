import { fetchLiveGiftById } from '@/lib/gifts';
import {
  normalizeRecipientEmail,
  normalizeRecipientPhone,
} from '@/lib/recipient-delivery';
import { supabase } from '@/lib/supabase';
import type { VendorOrderRow, VendorOrderWithGift } from '@/types/vendor';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type BuyerOrderInput = {
  giftId: string;
  quantity?: number;
  recipientName: string;
  recipientAddress?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  notifyRecipient?: boolean;
  giftMessage?: string;
  deliveryDate?: string;
};

export async function fetchBuyerOrders(buyerId: string): Promise<VendorOrderWithGift[]> {
  const { data, error } = await supabase
    .from('vendor_orders')
    .select('*, gift:gifts(id, title, image_urls)')
    .eq('buyer_id', buyerId)
    .is('buyer_deleted_at', null)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as VendorOrderWithGift[];
}

export async function fetchDeletedBuyerOrders(buyerId: string): Promise<VendorOrderWithGift[]> {
  const { data, error } = await supabase
    .from('vendor_orders')
    .select('*, gift:gifts(id, title, image_urls)')
    .eq('buyer_id', buyerId)
    .not('buyer_deleted_at', 'is', null)
    .order('buyer_deleted_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as VendorOrderWithGift[];
}

export async function fetchBuyerOrderById(
  orderId: string,
  buyerId: string,
): Promise<VendorOrderWithGift | null> {
  const { data, error } = await supabase
    .from('vendor_orders')
    .select('*, gift:gifts(id, title, image_urls)')
    .eq('id', orderId)
    .eq('buyer_id', buyerId)
    .is('buyer_deleted_at', null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as VendorOrderWithGift;
}

export async function softDeleteBuyerOrder(orderId: string): Promise<{ error: Error | null }> {
  const { data: order, error: fetchError } = await supabase
    .from('vendor_orders')
    .select('id')
    .eq('id', orderId)
    .is('buyer_deleted_at', null)
    .maybeSingle();

  if (fetchError) {
    return { error: new Error(fetchError.message) };
  }

  if (!order) {
    return { error: new Error('Order not found.') };
  }

  const { error } = await supabase
    .from('vendor_orders')
    .update({ buyer_deleted_at: new Date().toISOString() })
    .eq('id', orderId)
    .is('buyer_deleted_at', null);

  return { error: error ? new Error(error.message) : null };
}

export async function restoreBuyerOrder(orderId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('vendor_orders')
    .update({ buyer_deleted_at: null })
    .eq('id', orderId)
    .not('buyer_deleted_at', 'is', null);

  return { error: error ? new Error(error.message) : null };
}

export function subscribeBuyerOrderUpdates(
  buyerId: string,
  onUpdate: (order: VendorOrderRow) => void,
): RealtimeChannel {
  const channelName = `buyer-orders:${buyerId}`;

  const existing = supabase
    .getChannels()
    .find((channel) => channel.topic === `realtime:${channelName}`);

  if (existing) {
    void supabase.removeChannel(existing);
  }

  return supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'vendor_orders',
        filter: `buyer_id=eq.${buyerId}`,
      },
      (payload) => {
        onUpdate(payload.new as VendorOrderRow);
      },
    )
    .subscribe();
}

export type BuyerOrderDelivery = Omit<BuyerOrderInput, 'giftId' | 'quantity'>;

function buildRecipientFields(delivery: BuyerOrderDelivery) {
  const recipientPhone = delivery.recipientPhone
    ? normalizeRecipientPhone(delivery.recipientPhone)
    : null;
  const recipientEmail = delivery.recipientEmail
    ? normalizeRecipientEmail(delivery.recipientEmail)
    : null;
  const notifyRecipient = Boolean(
    delivery.notifyRecipient && (recipientPhone || recipientEmail),
  );

  return { recipientPhone, recipientEmail, notifyRecipient };
}

export type RecipientDeliveryFieldErrors = {
  recipientName?: string;
  recipientPhone?: string;
  recipientEmail?: string;
};

export function getRecipientDeliveryFieldErrors(
  delivery: BuyerOrderDelivery,
): RecipientDeliveryFieldErrors {
  const errors: RecipientDeliveryFieldErrors = {};

  if (!delivery.recipientName.trim()) {
    errors.recipientName = 'Recipient name is required.';
  }

  const phone = delivery.recipientPhone ? normalizeRecipientPhone(delivery.recipientPhone) : '';
  const email = delivery.recipientEmail ? normalizeRecipientEmail(delivery.recipientEmail) : '';

  if (!phone) {
    errors.recipientPhone = 'Recipient phone is required.';
  }

  if (!email) {
    errors.recipientEmail = 'Recipient email is required.';
  }

  return errors;
}

function validateRecipientDelivery(delivery: BuyerOrderDelivery): Error | null {
  const errors = getRecipientDeliveryFieldErrors(delivery);
  const firstError =
    errors.recipientName ?? errors.recipientPhone ?? errors.recipientEmail;

  return firstError ? new Error(firstError) : null;
}

export async function createBuyerOrder(
  buyerId: string,
  input: BuyerOrderInput,
): Promise<{ data: VendorOrderRow | null; error: Error | null }> {
  const gift = await fetchLiveGiftById(input.giftId);

  if (!gift) {
    return { data: null, error: new Error('This gift is no longer available.') };
  }

  const quantity = input.quantity ?? 1;
  const validationError = validateRecipientDelivery(input);

  if (validationError) {
    return { data: null, error: validationError };
  }

  if (quantity < 1 || quantity > gift.stock) {
    return { data: null, error: new Error('Not enough stock for this gift.') };
  }

  const { recipientPhone, recipientEmail, notifyRecipient } = buildRecipientFields(input);

  const { data, error } = await supabase
    .from('vendor_orders')
    .insert({
      vendor_id: gift.vendor_id,
      gift_id: gift.id,
      buyer_id: buyerId,
      quantity,
      total_cents: gift.price_cents * quantity,
      recipient_name: input.recipientName.trim(),
      recipient_address: input.recipientAddress?.trim() || null,
      recipient_phone: recipientPhone,
      recipient_email: recipientEmail,
      notify_recipient: notifyRecipient,
      gift_message: input.giftMessage?.trim() || null,
      delivery_date: input.deliveryDate?.trim() || null,
      status: 'new',
    })
    .select('*')
    .single();

  return {
    data: (data as VendorOrderRow | null) ?? null,
    error: error ? new Error(error.message) : null,
  };
}

export type CartOrderLine = {
  giftId: string;
  quantity: number;
  title?: string;
};

export async function createBuyerOrders(
  buyerId: string,
  items: CartOrderLine[],
  delivery: BuyerOrderDelivery,
): Promise<{ orders: VendorOrderRow[]; error: Error | null }> {
  if (items.length === 0) {
    return { orders: [], error: new Error('Your cart is empty.') };
  }

  const validationError = validateRecipientDelivery(delivery);
  if (validationError) {
    return { orders: [], error: validationError };
  }

  const { recipientPhone, recipientEmail, notifyRecipient } = buildRecipientFields(delivery);

  const validatedLines: {
    gift: NonNullable<Awaited<ReturnType<typeof fetchLiveGiftById>>>;
    quantity: number;
  }[] = [];

  for (const item of items) {
    const gift = await fetchLiveGiftById(item.giftId);

    if (!gift) {
      return {
        orders: [],
        error: new Error(`"${item.title ?? 'A gift'}" is no longer available.`),
      };
    }

    if (item.quantity < 1 || item.quantity > gift.stock) {
      return {
        orders: [],
        error: new Error(`Not enough stock for "${gift.title}".`),
      };
    }

    validatedLines.push({ gift, quantity: item.quantity });
  }

  const orders: VendorOrderRow[] = [];

  for (const line of validatedLines) {
    const { data, error } = await supabase
      .from('vendor_orders')
      .insert({
        vendor_id: line.gift.vendor_id,
        gift_id: line.gift.id,
        buyer_id: buyerId,
        quantity: line.quantity,
        total_cents: line.gift.price_cents * line.quantity,
        recipient_name: delivery.recipientName.trim(),
        recipient_address: delivery.recipientAddress?.trim() || null,
        recipient_phone: recipientPhone,
        recipient_email: recipientEmail,
        notify_recipient: notifyRecipient,
        gift_message: delivery.giftMessage?.trim() || null,
        delivery_date: delivery.deliveryDate?.trim() || null,
        status: 'new',
      })
      .select('*')
      .single();

    if (error || !data) {
      return {
        orders,
        error: new Error(error?.message ?? `Could not order "${line.gift.title}".`),
      };
    }

    orders.push(data as VendorOrderRow);
  }

  return { orders, error: null };
}
