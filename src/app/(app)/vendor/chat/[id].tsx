import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { ChatThreadView } from '@/components/chat';
import { DashboardHeader, ScreenShell } from '@/components/dashboard';
import { ThemedActivityIndicator } from '@/components/themed-activity-indicator';
import { fetchConversationById } from '@/lib/chat';
import { useAuth } from '@/providers/auth-provider';
import type { ConversationWithDetails } from '@/types/chat';

export default function VendorChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetchConversationById(id).then((row) => {
      setConversation(row);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <ScreenShell scroll={false}>
        <ThemedActivityIndicator style={{ marginTop: 48 }} />
      </ScreenShell>
    );
  }

  if (!conversation || !profile || conversation.vendor_id !== profile.id) {
    return (
      <ScreenShell>
        <DashboardHeader title="Chat not found" showBanner={false} showBack backHref="/vendor/chat" />
      </ScreenShell>
    );
  }

  return (
    <ChatThreadView conversation={conversation} userId={profile.id} backHref="/vendor/chat" />
  );
}
