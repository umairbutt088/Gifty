export type GiftCategory =
  | 'flowers'
  | 'chocolate'
  | 'jewelry'
  | 'experience'
  | 'custom'
  | 'other';

export type GiftStatus = 'draft' | 'pending_review' | 'live' | 'paused' | 'out_of_stock';

export type VendorOrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'rejected';

export type VendorStoreRow = {
  id: string;
  vendor_id: string;
  name: string;
  logo_url: string | null;
  bio: string | null;
  delivery_cities: string[];
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_name: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type GiftRow = {
  id: string;
  vendor_id: string;
  title: string;
  description: string | null;
  price_cents: number;
  category: GiftCategory;
  stock: number;
  status: GiftStatus;
  image_urls: string[];
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VendorOrderRow = {
  id: string;
  vendor_id: string;
  gift_id: string;
  buyer_id: string | null;
  status: VendorOrderStatus;
  quantity: number;
  total_cents: number;
  recipient_name: string;
  recipient_address: string | null;
  gift_message: string | null;
  delivery_date: string | null;
  created_at: string;
  updated_at: string;
};

export type VendorOrderWithGift = VendorOrderRow & {
  gift: Pick<GiftRow, 'id' | 'title' | 'image_urls'>;
};

export type VendorStoreInput = {
  name: string;
  logoUrl?: string | null;
  bio?: string | null;
  deliveryCities: string[];
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  onboardingComplete?: boolean;
};

export type GiftInput = {
  title: string;
  description?: string | null;
  priceCents: number;
  category: GiftCategory;
  stock: number;
  status?: GiftStatus;
  imageUrls: string[];
};
