import { SymbolView } from 'expo-symbols';
import { useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { VendorOrderWithGift } from '@/types/vendor';

import { OrderListItem } from './order-list-item';

const ACTIONS_TOTAL_WIDTH = 88;
const ACTION_GAP = Spacing.one;
const ACTION_BUTTON_WIDTH = (ACTIONS_TOTAL_WIDTH - ACTION_GAP) / 2;

type SwipeableDeletedOrderListItemProps = {
  order: VendorOrderWithGift;
  deletedAt: string | null;
  onRestore: (orderId: string) => Promise<void>;
  onDeletePermanently?: (orderId: string) => Promise<void>;
};

export function SwipeableDeletedOrderListItem({
  order,
  deletedAt,
  onRestore,
  onDeletePermanently,
}: SwipeableDeletedOrderListItemProps) {
  const theme = useScreenTheme();
  const swipeableRef = useRef<SwipeableMethods>(null);
  const title = order.gift?.title ?? 'Gift order';

  function confirmRestore() {
    Alert.alert('Restore order', `Restore "${title}" to your orders list?`, [
      { text: 'Cancel', style: 'cancel', onPress: () => swipeableRef.current?.close() },
      {
        text: 'Restore',
        onPress: () => {
          void (async () => {
            await onRestore(order.id);
            swipeableRef.current?.close();
          })();
        },
      },
    ]);
  }

  function confirmPermanentDelete() {
    Alert.alert(
      'Delete permanently',
      `Remove "${title}" forever? The chat for this order will also be removed. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => swipeableRef.current?.close() },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await onDeletePermanently?.(order.id);
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
      rightThreshold={ACTIONS_TOTAL_WIDTH / 2}
      renderRightActions={() => (
        <View style={styles.actionsRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Restore ${title}`}
            onPress={confirmRestore}
            style={({ pressed }) => [
              styles.action,
              onDeletePermanently ? styles.actionHalf : styles.actionFull,
              { backgroundColor: theme.accentDark },
              pressed && styles.actionPressed,
            ]}>
            <SymbolView name="arrow.uturn.backward" tintColor={Colors.text} size={18} />
            <Text style={styles.actionLabel} numberOfLines={1}>
              Restore
            </Text>
          </Pressable>

          {onDeletePermanently ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete ${title} permanently`}
              onPress={confirmPermanentDelete}
              style={({ pressed }) => [
                styles.action,
                styles.actionHalf,
                styles.deleteAction,
                pressed && styles.actionPressed,
              ]}>
              <SymbolView name="trash.fill" tintColor={Colors.text} size={18} />
              <Text style={styles.actionLabel} numberOfLines={1}>
                Delete
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}>
      <OrderListItem order={order} deleted deletedAt={deletedAt} />
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    width: ACTIONS_TOTAL_WIDTH,
    flexDirection: 'row',
    gap: ACTION_GAP,
    marginLeft: Spacing.two,
  },
  action: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.one,
  },
  actionHalf: {
    width: ACTION_BUTTON_WIDTH,
  },
  actionFull: {
    width: ACTIONS_TOTAL_WIDTH,
  },
  deleteAction: {
    backgroundColor: '#9B3030',
  },
  actionPressed: {
    opacity: 0.88,
  },
  actionLabel: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
});
