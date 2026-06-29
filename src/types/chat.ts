import type { VendorOrderWithGift } from '@/types/vendor';

export type ChatProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

export type ConversationRow = {
  id: string;
  order_id: string;
  buyer_id: string;
  vendor_id: string;
  last_message_body: string | null;
  last_message_at: string | null;
  created_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type ConversationWithDetails = ConversationRow & {
  order: Pick<VendorOrderWithGift, 'id' | 'status' | 'recipient_name' | 'total_cents' | 'quantity'> & {
    gift: Pick<VendorOrderWithGift['gift'], 'id' | 'title' | 'image_urls'>;
  };
  buyer: ChatProfile;
  vendor: ChatProfile;
};

export type MessageWithSender = MessageRow & {
  sender: ChatProfile;
};
