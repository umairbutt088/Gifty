import { useCallback, useEffect } from 'react';

import { useListRefresh } from '@/hooks/use-list-refresh';
import {
  fetchBuyerConversations,
  fetchConversationById,
  fetchVendorConversations,
  subscribeToBuyerConversations,
  subscribeToVendorConversations,
} from '@/lib/chat';
import { supabase } from '@/lib/supabase';
import type { ConversationWithDetails } from '@/types/chat';

type UseConversationsListOptions = {
  userId: string | undefined;
  role: 'buyer' | 'vendor';
};

export function useConversationsList({ userId, role }: UseConversationsListOptions) {
  const loadConversations = useCallback(async () => {
    if (!userId) return [];

    return role === 'buyer'
      ? fetchBuyerConversations(userId)
      : fetchVendorConversations(userId);
  }, [role, userId]);

  const { items, setItems, loading, refresh, refreshControl } = useListRefresh({
    enabled: Boolean(userId),
    load: loadConversations,
  });

  useEffect(() => {
    if (!userId) return;

    const upsertConversation = async (conversationId: string) => {
      const full = await fetchConversationById(conversationId);
      if (!full) return;

      setItems((current) => {
        const next = [full, ...current.filter((item) => item.id !== full.id)];
        return next.sort((left, right) => {
          const leftTime = left.last_message_at ?? left.created_at;
          const rightTime = right.last_message_at ?? right.created_at;
          return rightTime.localeCompare(leftTime);
        });
      });
    };

    const channel =
      role === 'buyer'
        ? subscribeToBuyerConversations(userId, (conversation) => {
            void upsertConversation(conversation.id);
          })
        : subscribeToVendorConversations(userId, (conversation) => {
            void upsertConversation(conversation.id);
          });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [role, setItems, userId]);

  return { conversations: items as ConversationWithDetails[], loading, refresh, refreshControl };
}
