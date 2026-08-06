import { GiftGrid, GiftGridCell } from '@/components/gifts';
import { getGiftDeliveryCue } from '@/lib/vendor-store-helpers';
import type { GiftRow, VendorStorePublic } from '@/types/vendor';

import { GiftGridItem } from './gift-grid-item';

type BuyerGiftGridViewProps = {
  gifts: GiftRow[];
  vendorStores: Map<string, VendorStorePublic>;
  deliveryCity?: string | null;
  favoriteIds?: Set<string>;
  startingFromByGiftId?: Map<string, number>;
  marketplaceStyle?: boolean;
  onToggleFavorite?: (giftId: string, favorited: boolean) => void;
};

export function BuyerGiftGridView({
  gifts,
  vendorStores,
  deliveryCity = null,
  favoriteIds,
  startingFromByGiftId,
  marketplaceStyle = false,
  onToggleFavorite,
}: BuyerGiftGridViewProps) {
  return (
    <GiftGrid>
      {gifts.map((gift) => {
        const store = vendorStores.get(gift.vendor_id);
        const favorited = favoriteIds?.has(gift.id) ?? false;

        return (
          <GiftGridCell key={gift.id}>
            <GiftGridItem
              gift={gift}
              href={`/buyer/gift/${gift.id}`}
              vendorLogoUrl={store?.logo_url}
              vendorName={store?.name}
              deliveryCue={getGiftDeliveryCue(store, deliveryCity)}
              startingFromCents={startingFromByGiftId?.get(gift.id)}
              favorited={favorited}
              marketplaceStyle={marketplaceStyle}
              onToggleFavorite={
                onToggleFavorite ? () => onToggleFavorite(gift.id, favorited) : undefined
              }
            />
          </GiftGridCell>
        );
      })}
    </GiftGrid>
  );
}
