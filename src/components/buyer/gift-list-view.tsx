import { CardList } from '@/components/dashboard';
import type { GiftRow, VendorStorePublic } from '@/types/vendor';

import { BuyerGiftListItem } from './gift-list-item';

type BuyerGiftListViewProps = {
  gifts: GiftRow[];
  vendorStores: Map<string, VendorStorePublic>;
};

export function BuyerGiftListView({ gifts, vendorStores }: BuyerGiftListViewProps) {
  return (
    <CardList>
      {gifts.map((gift) => {
        const store = vendorStores.get(gift.vendor_id);

        return (
          <BuyerGiftListItem
            key={gift.id}
            gift={gift}
            href={`/buyer/gift/${gift.id}`}
            vendorLogoUrl={store?.logo_url}
            vendorName={store?.name}
          />
        );
      })}
    </CardList>
  );
}
