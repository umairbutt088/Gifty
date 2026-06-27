import { useEffect, useRef } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  type ListRenderItem,
} from 'react-native';

import { ChatComposer, MessageBubble } from '@/components/chat';
import { DashboardHeader, ScreenShell } from '@/components/dashboard';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { Spacing } from '@/constants/theme';
import { formatChatProfileName } from '@/lib/chat';
import { useConversationThread } from '@/hooks/use-conversation-thread';
import type { Href } from 'expo-router';
import type { ConversationWithDetails, MessageWithSender } from '@/types/chat';

type ChatThreadViewProps = {
  conversation: ConversationWithDetails;
  userId: string;
  backHref: Href;
};

export function ChatThreadView({ conversation, userId, backHref }: ChatThreadViewProps) {
  const listRef = useRef<FlatList<MessageWithSender>>(null);
  const { messages, loading, sending, send } = useConversationThread(conversation.id, userId);

  const counterpart =
    conversation.buyer_id === userId ? conversation.vendor : conversation.buyer;
  const giftTitle = conversation.order?.gift?.title ?? 'Gift order';

  useEffect(() => {
    if (messages.length === 0) return;

    listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const renderItem: ListRenderItem<MessageWithSender> = ({ item }) => (
    <MessageBubble message={item} isOwn={item.sender_id === userId} />
  );

  return (
    <ScreenShell scroll={false} style={styles.shell}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={styles.header}>
          <DashboardHeader
            title={giftTitle}
            subtitle={`With ${formatChatProfileName(counterpart)} · Order for ${conversation.order?.recipient_name ?? 'recipient'}`}
            showBanner={false}
            showBack
            backHref={backHref}
          />
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ThemedActivityIndicator />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.messagesContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        <View style={styles.composer}>
          <ChatComposer onSend={send} sending={sending} />
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  header: {
    flexShrink: 0,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContent: {
    flexGrow: 1,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  composer: {
    flexShrink: 0,
    paddingTop: Spacing.two,
  },
});
