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

import { VendorGiftGridItem } from './gift-grid-item';

const DELETE_WIDTH = 72;

type SwipeableGiftGridItemProps = {
  gift: GiftRow;
  href: Href;
  onDelete: (giftId: string) => Promise<void>;
};

export function SwipeableGiftGridItem({ gift, href, onDelete }: SwipeableGiftGridItemProps) {
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
          accessibilityLabel={`Delete ${gift.title}`}
          onPress={confirmDelete}
          style={({ pressed }) => [styles.deleteAction, pressed && styles.deleteActionPressed]}>
          <SymbolView name="trash.fill" tintColor={colors.text} size={20} />
          <Text style={[styles.deleteLabel, { color: colors.text }]}>Delete</Text>
        </Pressable>
      )}>
      <VendorGiftGridItem gift={gift} href={href} />
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
    marginLeft: Spacing.one,
  },
  deleteActionPressed: {
    opacity: 0.88,
  },
  deleteLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
