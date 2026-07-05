import { CardList } from '@/components/dashboard';
import type { GiftRow } from '@/types/vendor';

import { SwipeableGiftListItem } from './swipeable-gift-list-item';

type VendorGiftListViewProps = {
  gifts: GiftRow[];
  onDelete: (giftId: string) => Promise<void>;
};

export function VendorGiftListView({ gifts, onDelete }: VendorGiftListViewProps) {
  return (
    <CardList>
      {gifts.map((gift) => (
        <SwipeableGiftListItem
          key={gift.id}
          gift={gift}
          href={`/vendor/gift/${gift.id}`}
          onDelete={onDelete}
        />
      ))}
    </CardList>
  );
}
