import { SymbolView } from 'expo-symbols';
import { type Href } from 'expo-router';
import { useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import type { VendorOrderWithGift } from '@/types/vendor';

import { OrderListItem } from './order-list-item';

const DELETE_WIDTH = 88;

type SwipeableOrderListItemProps = {
  order: VendorOrderWithGift;
  href: Href;
  onDelete: (orderId: string) => Promise<void>;
};

export function SwipeableOrderListItem({ order, href, onDelete }: SwipeableOrderListItemProps) {
  const swipeableRef = useRef<SwipeableMethods>(null);
  const title = order.gift?.title ?? 'Gift order';

  function confirmDelete() {
    Alert.alert(
      'Delete order',
      `Move "${title}" to Deleted orders? You can restore it later.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => swipeableRef.current?.close() },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await onDelete(order.id);
              swipeableRef.current?.close();
            })();
          },
        },
      ],
    );
  }

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      overshootRight={false}
      rightThreshold={DELETE_WIDTH / 2}
      renderRightActions={() => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${title}`}
          onPress={confirmDelete}
          style={({ pressed }) => [styles.deleteAction, pressed && styles.deleteActionPressed]}>
          <SymbolView name="trash.fill" tintColor={Colors.text} size={22} />
          <Text style={styles.deleteLabel}>Delete</Text>
        </Pressable>
      )}>
      <OrderListItem order={order} href={href} />
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  deleteAction: {
    width: DELETE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    backgroundColor: '#9B3030',
    borderRadius: Spacing.four,
    marginLeft: Spacing.two,
  },
  deleteActionPressed: {
    opacity: 0.88,
  },
  deleteLabel: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
