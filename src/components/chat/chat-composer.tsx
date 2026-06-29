import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type ChatComposerProps = {
  onSend: (body: string) => Promise<{ error: Error | null }>;
  sending?: boolean;
  placeholder?: string;
};

export function ChatComposer({
  onSend,
  sending = false,
  placeholder = 'Write a message…',
}: ChatComposerProps) {
  const theme = useScreenTheme();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    const body = text.trim();
    if (!body || sending) return;

    setError(null);
    const { error: sendError } = await onSend(body);

    if (sendError) {
      setError(sendError.message);
      return;
    }

    setText('');
  }

  return (
    <View style={styles.wrap}>
      <View style={[styles.inputRow, { borderColor: theme.surfaceBorder, backgroundColor: theme.surface }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
          multiline
          maxLength={2000}
          editable={!sending}
        />
        <Pressable
          disabled={sending || !text.trim()}
          onPress={() => void handleSend()}
          style={({ pressed }) => [
            styles.sendButton,
            { backgroundColor: theme.accent, borderColor: theme.buttonBorder },
            (sending || !text.trim()) && styles.sendButtonDisabled,
            pressed && !sending && text.trim() && styles.sendButtonPressed,
          ]}>
          {sending ? (
            <ThemedActivityIndicator size="small" />
          ) : (
            <Text style={styles.sendLabel}>Send</Text>
          )}
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.one,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.two,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    color: Colors.text,
    fontSize: 15,
    paddingVertical: Spacing.one,
    textAlignVertical: 'top',
  },
  sendButton: {
    minWidth: 64,
    height: 40,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendButtonPressed: {
    opacity: 0.88,
  },
  sendLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  error: {
    color: '#E05D5D',
    fontSize: 13,
  },
});
