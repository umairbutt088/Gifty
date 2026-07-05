import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-colors';
import { Spacing } from '@/constants/theme';
import { formatChatTime } from '@/lib/chat-format';
import { formatChatProfileName } from '@/lib/chat';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { MessageWithSender } from '@/types/chat';

type MessageBubbleProps = {
  message: MessageWithSender;
  isOwn: boolean;
};

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const theme = useScreenTheme();
  const colors = useColors();

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View
        style={[
          styles.bubble,
          isOwn
            ? { backgroundColor: theme.accent, borderColor: theme.buttonBorder }
            : { backgroundColor: theme.surfaceNested, borderColor: theme.surfaceBorder },
        ]}>
        {!isOwn ? (
          <Text style={[styles.sender, { color: colors.textSecondary }]}>
            {formatChatProfileName(message.sender)}
          </Text>
        ) : null}
        <Text style={[styles.body, { color: colors.text }]}>
          {message.body}
        </Text>
        <Text style={[styles.time, { color: colors.textMuted }]}>
          {formatChatTime(message.created_at)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    marginBottom: Spacing.two,
  },
  rowOwn: {
    alignItems: 'flex-end',
  },
  rowOther: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.one,
  },
  sender: {
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
  },
  time: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
});
