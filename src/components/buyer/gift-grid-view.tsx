import { GiftGrid, GiftGridCell } from '@/components/gifts';
import type { GiftRow, VendorStorePublic } from '@/types/vendor';

import { GiftGridItem } from './gift-grid-item';

type BuyerGiftGridViewProps = {
  gifts: GiftRow[];
  vendorStores: Map<string, VendorStorePublic>;
};

export function BuyerGiftGridView({ gifts, vendorStores }: BuyerGiftGridViewProps) {
  return (
    <GiftGrid>
      {gifts.map((gift) => {
        const store = vendorStores.get(gift.vendor_id);

        return (
          <GiftGridCell key={gift.id}>
            <GiftGridItem
              gift={gift}
              href={`/buyer/gift/${gift.id}`}
              vendorLogoUrl={store?.logo_url}
              vendorName={store?.name}
            />
          </GiftGridCell>
        );
      })}
    </GiftGrid>
  );
}
