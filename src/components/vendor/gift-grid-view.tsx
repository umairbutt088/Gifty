import { GiftGrid, GiftGridCell } from '@/components/gifts';
import type { GiftRow } from '@/types/vendor';

import { SwipeableGiftGridItem } from './swipeable-gift-grid-item';

type VendorGiftGridViewProps = {
  gifts: GiftRow[];
  onDelete: (giftId: string) => Promise<void>;
};

export function VendorGiftGridView({ gifts, onDelete }: VendorGiftGridViewProps) {
  return (
    <GiftGrid>
      {gifts.map((gift) => (
        <GiftGridCell key={gift.id}>
          <SwipeableGiftGridItem
            gift={gift}
            href={`/vendor/gift/${gift.id}`}
            onDelete={onDelete}
          />
        </GiftGridCell>
      ))}
    </GiftGrid>
  );
}
