import { SymbolView } from 'expo-symbols';
import { type Href } from 'expo-router';
import { useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import type { GiftRow } from '@/types/vendor';

import { GiftListItem } from './gift-list-item';

const DELETE_WIDTH = 88;

type SwipeableGiftListItemProps = {
  gift: GiftRow;
  href: Href;
  onDelete: (giftId: string) => Promise<void>;
};

export function SwipeableGiftListItem({ gift, href, onDelete }: SwipeableGiftListItemProps) {
  const colors = useColors();
  const swipeableRef = useRef<SwipeableMethods>(null);

  function confirmDelete() {
    Alert.alert(
      'Delete gift',
      `Move "${gift.title}" to Deleted gifts? You can restore it later with photos intact.`,
      [
      { text: 'Cancel', style: 'cancel', onPress: () => swipeableRef.current?.close() },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await onDelete(gift.id);
            swipeableRef.current?.close();
          })();
        },
      },
    ]);
  }

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      overshootRight={false}
      rightThreshold={DELETE_WIDTH / 2}
      renderRightActions={() => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${gift.title}`}
          onPress={confirmDelete}
          style={({ pressed }) => [styles.deleteAction, pressed && styles.deleteActionPressed]}>
          <SymbolView name="trash.fill" tintColor={colors.text} size={22} />
          <Text style={[styles.deleteLabel, { color: colors.text }]}>Delete</Text>
        </Pressable>
      )}>
      <GiftListItem gift={gift} href={href} />
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
    fontSize: 12,
    fontWeight: '700',
  },
});
