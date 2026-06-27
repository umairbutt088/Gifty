import { Link, type Href } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { ORDER_STATUS_LABELS } from '@/constants/vendor';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { formatChatPreviewTime } from '@/lib/chat-format';
import { formatChatProfileName } from '@/lib/chat';
import type { ConversationWithDetails } from '@/types/chat';

type ConversationListItemProps = {
  conversation: ConversationWithDetails;
  counterpartLabel: string;
  href: Href;
};

export function ConversationListItem({
  conversation,
  counterpartLabel,
  href,
}: ConversationListItemProps) {
  const giftTitle = conversation.order?.gift?.title ?? 'Gift order';
  const imageUrl = conversation.order?.gift?.image_urls?.[0] ?? null;
  const preview = conversation.last_message_body ?? 'No messages yet';
  const timeLabel = formatChatPreviewTime(conversation.last_message_at);

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
        <GlassCard style={styles.card}>
          <View style={styles.imageWrap}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Gift</Text>
              </View>
            )}
          </View>

          <View style={styles.body}>
            <View style={styles.topRow}>
              <Text style={styles.title} numberOfLines={1}>
                {giftTitle}
              </Text>
              {timeLabel ? <Text style={styles.time}>{timeLabel}</Text> : null}
            </View>

            <Text style={styles.counterpart} numberOfLines={1}>
              {counterpartLabel}
            </Text>

            <Text style={styles.preview} numberOfLines={2}>
              {preview}
            </Text>

            {conversation.order?.status ? (
              <Text style={styles.status}>
                Order · {ORDER_STATUS_LABELS[conversation.order.status]}
              </Text>
            ) : null}
          </View>
        </GlassCard>
      </Pressable>
    </Link>
  );
}

export function getConversationCounterpartLabel(
  conversation: ConversationWithDetails,
  viewerId: string,
): string {
  const counterpart =
    conversation.buyer_id === viewerId ? conversation.vendor : conversation.buyer;

  return formatChatProfileName(counterpart);
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.92,
  },
  imageWrap: {
    width: 56,
    height: 56,
    borderRadius: Spacing.two,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceNested,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    gap: Spacing.one,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  counterpart: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  preview: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  status: {
    color: Colors.textMuted,
    fontSize: 12,
  },
});
