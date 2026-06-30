import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedBackgroundStyle } from '@/components/backgrounds/palette-background';
import type { BackgroundLayout } from '@/components/backgrounds/shared';
import {
  getBackgroundPattern,
  type ScreenBackgroundVariant,
} from '@/constants/background-styles';
import { useAppTheme } from '@/providers/screen-theme-provider';

export type ScreenBackgroundProps = ViewProps & {
  variant?: ScreenBackgroundVariant;
  layout?: BackgroundLayout;
};

function BackgroundByVariant({
  variant,
  layout,
  style,
  ...props
}: ScreenBackgroundProps & { variant: ScreenBackgroundVariant }) {
  const pattern = getBackgroundPattern(variant);

  return (
    <ThemedBackgroundStyle pattern={pattern} layout={layout} style={style} {...props} />
  );
}

/** App-wide screen background — pattern from choice, colors from active theme. */
export function ScreenBackground({ variant, layout, style, ...props }: ScreenBackgroundProps) {
  const { backgroundVariant } = useAppTheme();
  const activeVariant = variant ?? backgroundVariant;

  return <BackgroundByVariant variant={activeVariant} layout={layout} style={style} {...props} />;
}

type BackgroundPreviewProps = {
  variant: ScreenBackgroundVariant;
  selected: boolean;
};

/** Mini preview for settings swatches — uses current theme colors. */
export function BackgroundPreview({ variant, selected }: BackgroundPreviewProps) {
  return (
    <View style={[styles.previewFrame, selected && styles.previewFrameSelected]}>
      <BackgroundByVariant
        variant={variant}
        layout={{ width: 320, height: 72 }}
        style={styles.previewBackground}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  previewFrame: {
    height: 56,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  previewFrameSelected: {
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  previewBackground: {
    ...StyleSheet.absoluteFillObject,
  },
});

/** @deprecated Use ScreenBackground instead */
export function GeometricBackground(props: ViewProps) {
  return <ThemedBackgroundStyle pattern="geometric" {...props} />;
}
