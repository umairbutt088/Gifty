export {
  createSessionFromUrl,
  getAuthCallbackError,
  getSupabaseRedirectAllowList,
  getPasswordResetRedirectUrl,
  isAuthCallbackUrl,
  isPasswordRecoveryUrl,
  NATIVE_PASSWORD_RESET_URL,
} from '@/lib/auth-linking';
export { getAuthErrorMessage, isValidEmail } from '@/lib/auth-errors';
export {
  getSession,
  onAuthStateChange,
  resetPassword,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from '@/lib/auth';
export {
  fetchProfile,
  getProfileFromUser,
  updateProfile,
  type AuthProfile,
} from '@/lib/profile';
export {
  createGift,
  deleteGift,
  fetchDeletedVendorGifts,
  fetchGiftById,
  fetchVendorGifts,
  permanentlyDeleteGift,
  restoreGift,
  softDeleteGift,
  updateGift,
} from '@/lib/gifts';
export { formatDeliveryCities, formatMoney, parseDeliveryCities, parsePriceToCents } from '@/lib/format';
export { getRoleHomeHref, getRoleFromSegments } from '@/lib/role-routes';
export { supabase } from '@/lib/supabase';
export {
  countNewVendorOrders,
  fetchVendorOrderById,
  fetchVendorOrders,
  getNextOrderAction,
  getVendorEarningsSummary,
  updateVendorOrderStatus,
} from '@/lib/vendor-orders';
export {
  fetchVendorStore,
  isVendorStoreOnboarded,
  upsertVendorStore,
} from '@/lib/vendor-store';
export type { ProfileRow } from '@/types/database';
export type {
  GiftCategory,
  GiftInput,
  GiftRow,
  GiftStatus,
  VendorOrderRow,
  VendorOrderStatus,
  VendorOrderWithGift,
  VendorStoreInput,
  VendorStoreRow,
} from '@/types/vendor';
