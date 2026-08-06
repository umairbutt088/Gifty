export type GiftCategory =
  | 'flowers'
  | 'chocolate'
  | 'jewelry'
  | 'experience'
  | 'custom'
  | 'other';

export type GiftOccasion =
  | 'birthday'
  | 'anniversary'
  | 'thank_you'
  | 'get_well'
  | 'congrats'
  | 'just_because';

export type GiftStatus = 'draft' | 'pending_review' | 'live' | 'paused' | 'out_of_stock';

export type VendorOrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export type OrderFulfillmentType = 'delivery' | 'pickup';

export type VendorStoreRow = {
  id: string;
  vendor_id: string;
  name: string;
  logo_url: string | null;
  bio: string | null;
  delivery_cities: string[];
  offers_delivery: boolean;
  delivery_radius_km: number | null;
  delivery_charge_cents: number | null;
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
  original_price_cents: number | null;
  category: GiftCategory;
  stock: number;
  status: GiftStatus;
  image_urls: string[];
  featured: boolean;
  sales_count: number;
  prep_time_minutes: number | null;
  rating_avg: number;
  rating_count: number;
  occasion_tags: GiftOccasion[];
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GiftVariantRow = {
  id: string;
  gift_id: string;
  label: string;
  price_cents: number;
  stock: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type GiftVariantInput = {
  label: string;
  priceCents: number;
  stock: number;
  sortOrder?: number;
};

export type GiftReviewRow = {
  id: string;
  gift_id: string;
  buyer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type VendorOrderRow = {
  id: string;
  vendor_id: string;
  gift_id: string;
  gift_variant_id: string | null;
  buyer_id: string | null;
  status: VendorOrderStatus;
  quantity: number;
  total_cents: number;
  fulfillment_type: OrderFulfillmentType;
  delivery_charge_cents: number;
  recipient_name: string;
  recipient_address: string | null;
  recipient_phone: string | null;
  recipient_email: string | null;
  notify_recipient: boolean;
  delivery_token: string;
  gift_message: string | null;
  delivery_date: string | null;
  recipient_confirmed_at: string | null;
  recipient_confirmation_note: string | null;
  recipient_notified_shipped_at: string | null;
  recipient_notified_delivered_at: string | null;
  buyer_deleted_at: string | null;
  vendor_deleted_at: string | null;
  status_changed_at: string;
  accepted_at: string | null;
  preparing_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  rejected_at: string | null;
  cancelled_at: string | null;
  reject_reason: string | null;
  cancel_reason: string | null;
  sla_escalated_at: string | null;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderStatusEvent = {
  id: string;
  order_id: string;
  buyer_id: string;
  vendor_id: string;
  from_status: VendorOrderStatus | null;
  to_status: VendorOrderStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
};

export type VendorOrderWithGift = VendorOrderRow & {
  gift: Pick<GiftRow, 'id' | 'title' | 'image_urls'>;
};

export type VendorStorePublic = {
  id: string;
  vendor_id: string;
  name: string;
  logo_url: string | null;
  bio: string | null;
  delivery_cities: string[];
  offers_delivery: boolean;
  delivery_radius_km: number | null;
  delivery_charge_cents: number | null;
};

export type VendorStoreInput = {
  name: string;
  logoUrl?: string | null;
  bio?: string | null;
  deliveryCities: string[];
  offersDelivery?: boolean;
  deliveryRadiusKm?: number | null;
  deliveryChargeCents?: number | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
  onboardingComplete?: boolean;
};

export type GiftInput = {
  title: string;
  description?: string | null;
  priceCents: number;
  originalPriceCents?: number | null;
  category: GiftCategory;
  stock: number;
  status?: GiftStatus;
  imageUrls: string[];
  featured?: boolean;
  prepTimeMinutes?: number | null;
  occasionTags?: GiftOccasion[];
};
