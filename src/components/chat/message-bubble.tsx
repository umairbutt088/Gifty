import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
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

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View
        style={[
          styles.bubble,
          isOwn
            ? { backgroundColor: theme.accent, borderColor: theme.buttonBorder }
            : { backgroundColor: Colors.surfaceNested, borderColor: Colors.surfaceBorder },
        ]}>
        {!isOwn ? (
          <Text style={styles.sender}>{formatChatProfileName(message.sender)}</Text>
        ) : null}
        <Text style={[styles.body, isOwn && styles.bodyOwn]}>{message.body}</Text>
        <Text style={[styles.time, isOwn && styles.timeOwn]}>{formatChatTime(message.created_at)}</Text>
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
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  bodyOwn: {
    color: Colors.text,
  },
  time: {
    color: Colors.textMuted,
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  timeOwn: {
    color: Colors.textSecondary,
  },
});
