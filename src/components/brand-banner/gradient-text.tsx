import { StyleSheet, type TextStyle } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';

export type GradientTextProps = {
  text: string;
  colors: string[];
  style: TextStyle;
  letterSpacing: number;
  baseDelay?: number;
};

export function GradientText({ text, colors, style, letterSpacing, baseDelay = 0 }: GradientTextProps) {
  const letters = text.split('');

  return (
    <Animated.View style={styles.row}>
      {letters.map((letter, index) => (
        <Animated.Text
          key={`${letter}-${index}`}
          entering={FadeInLeft.delay(baseDelay + index * 55).duration(420)}
          style={[
            style,
            {
              color: colors[index] ?? colors[colors.length - 1],
              marginRight: index < letters.length - 1 ? letterSpacing : 0,
            },
          ]}>
          {letter}
        </Animated.Text>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
});
