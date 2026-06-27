import { supabase } from '@/lib/supabase';
import type {
  ConversationRow,
  ConversationWithDetails,
  MessageRow,
  MessageWithSender,
} from '@/types/chat';
import type { RealtimeChannel } from '@supabase/supabase-js';

const CONVERSATION_SELECT = `
  *,
  order:vendor_orders(
    id,
    status,
    recipient_name,
    total_cents,
    quantity,
    gift:gifts(id, title, image_urls)
  ),
  buyer:profiles!conversations_buyer_id_fkey(id, first_name, last_name, email),
  vendor:profiles!conversations_vendor_id_fkey(id, first_name, last_name, email)
`;

const MESSAGE_SELECT = `
  *,
  sender:profiles!messages_sender_id_fkey(id, first_name, last_name, email)
`;

function removeExistingChannel(channelName: string) {
  const existing = supabase
    .getChannels()
    .find((channel) => channel.topic === `realtime:${channelName}`);

  if (existing) {
    void supabase.removeChannel(existing);
  }
}

export function formatChatProfileName(profile: {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}): string {
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim();
  return name || profile.email || 'User';
}

export async function fetchBuyerConversations(buyerId: string): Promise<ConversationWithDetails[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .eq('buyer_id', buyerId)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error || !data) {
    return [];
  }

  return data as ConversationWithDetails[];
}

export async function fetchVendorConversations(vendorId: string): Promise<ConversationWithDetails[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .eq('vendor_id', vendorId)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error || !data) {
    return [];
  }

  return data as ConversationWithDetails[];
}

export async function fetchConversationById(
  conversationId: string,
): Promise<ConversationWithDetails | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .eq('id', conversationId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ConversationWithDetails;
}

export async function fetchConversationByOrderId(
  orderId: string,
): Promise<ConversationWithDetails | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .eq('order_id', orderId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ConversationWithDetails;
}

export async function getOrCreateConversationForOrder(
  orderId: string,
  userId: string,
): Promise<{ data: ConversationWithDetails | null; error: Error | null }> {
  const existing = await fetchConversationByOrderId(orderId);
  if (existing) {
    if (existing.buyer_id !== userId && existing.vendor_id !== userId) {
      return { data: null, error: new Error('You do not have access to this conversation.') };
    }

    return { data: existing, error: null };
  }

  const { data: order, error: orderError } = await supabase
    .from('vendor_orders')
    .select('id, buyer_id, vendor_id')
    .eq('id', orderId)
    .maybeSingle();

  if (orderError || !order?.buyer_id) {
    return { data: null, error: new Error('Order not found.') };
  }

  if (order.buyer_id !== userId && order.vendor_id !== userId) {
    return { data: null, error: new Error('You do not have access to this order.') };
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      order_id: order.id,
      buyer_id: order.buyer_id,
      vendor_id: order.vendor_id,
    })
    .select(CONVERSATION_SELECT)
    .single();

  if (error || !data) {
    if (error?.code === '23505') {
      const retry = await fetchConversationByOrderId(orderId);
      return retry
        ? { data: retry, error: null }
        : { data: null, error: new Error('Could not open conversation.') };
    }

    return { data: null, error: new Error(error?.message ?? 'Could not open conversation.') };
  }

  return { data: data as ConversationWithDetails, error: null };
}

export async function fetchMessages(conversationId: string): Promise<MessageWithSender[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_SELECT)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as MessageWithSender[];
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<{ data: MessageWithSender | null; error: Error | null }> {
  const trimmed = body.trim();

  if (!trimmed) {
    return { data: null, error: new Error('Message cannot be empty.') };
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body: trimmed,
    })
    .select(MESSAGE_SELECT)
    .single();

  return {
    data: (data as MessageWithSender | null) ?? null,
    error: error ? new Error(error.message) : null,
  };
}

export function subscribeToConversationMessages(
  conversationId: string,
  onInsert: (message: MessageRow) => void,
): RealtimeChannel {
  const channelName = `conversation-messages:${conversationId}`;
  removeExistingChannel(channelName);

  return supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onInsert(payload.new as MessageRow);
      },
    )
    .subscribe();
}

export function subscribeToBuyerConversations(
  buyerId: string,
  onChange: (conversation: ConversationRow) => void,
): RealtimeChannel {
  const channelName = `buyer-conversations:${buyerId}`;
  removeExistingChannel(channelName);

  const channel = supabase.channel(channelName);

  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations',
        filter: `buyer_id=eq.${buyerId}`,
      },
      (payload) => {
        onChange(payload.new as ConversationRow);
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `buyer_id=eq.${buyerId}`,
      },
      (payload) => {
        onChange(payload.new as ConversationRow);
      },
    );

  return channel.subscribe();
}

export function subscribeToVendorConversations(
  vendorId: string,
  onChange: (conversation: ConversationRow) => void,
): RealtimeChannel {
  const channelName = `vendor-conversations:${vendorId}`;
  removeExistingChannel(channelName);

  const channel = supabase.channel(channelName);

  channel
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations',
        filter: `vendor_id=eq.${vendorId}`,
      },
      (payload) => {
        onChange(payload.new as ConversationRow);
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `vendor_id=eq.${vendorId}`,
      },
      (payload) => {
        onChange(payload.new as ConversationRow);
      },
    );

  return channel.subscribe();
}

export async function fetchMessageById(messageId: string): Promise<MessageWithSender | null> {
  const { data, error } = await supabase
    .from('messages')
    .select(MESSAGE_SELECT)
    .eq('id', messageId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as MessageWithSender;
}
