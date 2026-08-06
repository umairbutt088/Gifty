import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type FavoriteButtonProps = {
  favorited: boolean;
  onPress: () => void;
  size?: number;
};

export function FavoriteButton({ favorited, onPress, size = 18 }: FavoriteButtonProps) {
  const colors = useColors();
  const theme = useScreenTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={favorited ? 'Remove from favorites' : 'Add to favorites'}
      hitSlop={8}
      onPress={(event) => {
        event.stopPropagation?.();
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.background,
          borderColor: theme.surfaceBorder,
        },
        pressed && styles.pressed,
      ]}>
      <View>
        <SymbolView
          name={
            favorited
              ? { ios: 'heart.fill', android: 'favorite', web: 'favorite' }
              : { ios: 'heart', android: 'favorite_border', web: 'favorite_border' }
          }
          tintColor={favorited ? theme.accent : colors.textSecondary}
          size={size}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
