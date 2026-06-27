import { View } from 'react-native';

import { ConversationListItem, getConversationCounterpartLabel } from '@/components/chat';
import { DashboardHeader, EmptyState, ScreenShell } from '@/components/dashboard';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { useConversationsList } from '@/hooks/use-conversations-list';
import { useAuth } from '@/providers/auth-provider';

export default function VendorChatTabScreen() {
  const { profile } = useAuth();
  const { conversations, loading, refreshControl } = useConversationsList({
    userId: profile?.id,
    role: 'vendor',
  });

  return (
    <ScreenShell scrollProps={{ refreshControl }}>
      <DashboardHeader
        title="Chat"
        subtitle="Message buyers about their gift orders."
        role={profile?.role}
      />

      {loading ? (
        <View style={{ paddingVertical: 24 }}>
          <ThemedActivityIndicator />
        </View>
      ) : conversations.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          message="When a buyer messages you about an order, the conversation will appear here."
        />
      ) : (
        conversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            counterpartLabel={getConversationCounterpartLabel(conversation, profile?.id ?? '')}
            href={`/vendor/chat/${conversation.id}`}
          />
        ))
      )}
    </ScreenShell>
  );
}
