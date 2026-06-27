import { SymbolView } from 'expo-symbols';
import { useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftRow } from '@/types/vendor';

import { GiftListItem } from './gift-list-item';

const ACTIONS_TOTAL_WIDTH = 88;
const ACTION_GAP = Spacing.one;
const ACTION_BUTTON_WIDTH = (ACTIONS_TOTAL_WIDTH - ACTION_GAP) / 2;

type SwipeableDeletedGiftListItemProps = {
  gift: GiftRow;
  onRestore: (giftId: string) => Promise<void>;
  onDeletePermanently: (giftId: string) => Promise<void>;
};

export function SwipeableDeletedGiftListItem({
  gift,
  onRestore,
  onDeletePermanently,
}: SwipeableDeletedGiftListItemProps) {
  const theme = useScreenTheme();
  const swipeableRef = useRef<SwipeableMethods>(null);

  function confirmRestore() {
    Alert.alert(
      'Restore gift',
      `Restore "${gift.title}" to your gifts list?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => swipeableRef.current?.close() },
        {
          text: 'Restore',
          onPress: () => {
            void (async () => {
              await onRestore(gift.id);
              swipeableRef.current?.close();
            })();
          },
        },
      ],
    );
  }

  function confirmPermanentDelete() {
    Alert.alert(
      'Delete permanently',
      `Remove "${gift.title}" forever? Photos will be deleted from storage. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => swipeableRef.current?.close() },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await onDeletePermanently(gift.id);
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
            accessibilityLabel={`Restore ${gift.title}`}
            onPress={confirmRestore}
            style={({ pressed }) => [
              styles.action,
              { backgroundColor: theme.accentDark },
              pressed && styles.actionPressed,
            ]}>
            <SymbolView name="arrow.uturn.backward" tintColor={Colors.text} size={18} />
            <Text style={styles.actionLabel} numberOfLines={1}>
              Restore
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${gift.title} permanently`}
            onPress={confirmPermanentDelete}
            style={({ pressed }) => [styles.action, styles.deleteAction, pressed && styles.actionPressed]}>
            <SymbolView name="trash.fill" tintColor={Colors.text} size={18} />
            <Text style={styles.actionLabel} numberOfLines={1}>
              Delete
            </Text>
          </Pressable>
        </View>
      )}>
      <GiftListItem gift={gift} deleted />
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
    width: ACTION_BUTTON_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.one,
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
