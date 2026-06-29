import { useCallback, useEffect, useRef, useState } from 'react';

import {
  fetchMessageById,
  fetchMessages,
  sendMessage,
  subscribeToConversationMessages,
} from '@/lib/chat';
import { supabase } from '@/lib/supabase';
import type { MessageRow, MessageWithSender } from '@/types/chat';

export function useConversationThread(conversationId: string | undefined, userId: string | undefined) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messageIdsRef = useRef(new Set<string>());

  const loadMessages = useCallback(async () => {
    if (!conversationId) return;

    setLoading(true);
    const rows = await fetchMessages(conversationId);
    messageIdsRef.current = new Set(rows.map((row) => row.id));
    setMessages(rows);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!conversationId) return;

    const appendMessage = async (row: MessageRow) => {
      if (messageIdsRef.current.has(row.id)) return;

      const full = await fetchMessageById(row.id);
      if (!full) return;

      messageIdsRef.current.add(full.id);
      setMessages((current) => [...current, full]);
    };

    const channel = subscribeToConversationMessages(conversationId, (row) => {
      void appendMessage(row);
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSend = useCallback(
    async (body: string) => {
      if (!conversationId || !userId) {
        return { error: new Error('Conversation unavailable.') };
      }

      setSending(true);
      const { data, error } = await sendMessage(conversationId, userId, body);
      setSending(false);

      if (error || !data) {
        return { error: error ?? new Error('Could not send message.') };
      }

      if (!messageIdsRef.current.has(data.id)) {
        messageIdsRef.current.add(data.id);
        setMessages((current) => [...current, data]);
      }

      return { error: null };
    },
    [conversationId, userId],
  );

  return { messages, loading, sending, send: handleSend, reload: loadMessages };
}
