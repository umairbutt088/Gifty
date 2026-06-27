import { View } from 'react-native';

import { ConversationListItem, getConversationCounterpartLabel } from '@/components/chat';
import { DashboardHeader, EmptyState, ScreenShell } from '@/components/dashboard';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { useConversationsList } from '@/hooks/use-conversations-list';
import { useAuth } from '@/providers/auth-provider';

export default function BuyerChatTabScreen() {
  const { profile } = useAuth();
  const { conversations, loading, refreshControl } = useConversationsList({
    userId: profile?.id,
    role: 'buyer',
  });

  return (
    <ScreenShell scrollProps={{ refreshControl }}>
      <DashboardHeader
        title="Chat"
        subtitle="Message vendors about your gift orders."
        role={profile?.role}
      />

      {loading ? (
        <View style={{ paddingVertical: 24 }}>
          <ThemedActivityIndicator />
        </View>
      ) : conversations.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          message="Open an order and tap Message vendor to start a chat about that gift order."
        />
      ) : (
        conversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            counterpartLabel={getConversationCounterpartLabel(conversation, profile?.id ?? '')}
            href={`/buyer/chat/${conversation.id}`}
          />
        ))
      )}
    </ScreenShell>
  );
}
