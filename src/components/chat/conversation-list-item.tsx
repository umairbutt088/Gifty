import { Link, type Href } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { ORDER_STATUS_LABELS } from '@/constants/vendor';
import { useColors } from '@/hooks/use-colors';
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
  const colors = useColors();
  const giftTitle = conversation.order?.gift?.title ?? 'Gift order';
  const imageUrl = conversation.order?.gift?.image_urls?.[0] ?? null;
  const preview = conversation.last_message_body ?? 'No messages yet';
  const timeLabel = formatChatPreviewTime(conversation.last_message_at);

  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [pressed && styles.pressed]}>
        <GlassCard style={styles.card}>
          <View style={styles.imageColumn}>
            <View style={[styles.imageWrap, { backgroundColor: colors.surfaceNested }]}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={[styles.placeholderText, { color: colors.textMuted }]}>Gift</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.topRow}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {giftTitle}
              </Text>
              {timeLabel ? (
                <Text style={[styles.time, { color: colors.textSecondary }]}>{timeLabel}</Text>
              ) : null}
            </View>

            <Text style={[styles.counterpart, { color: colors.textSecondary }]} numberOfLines={1}>
              {counterpartLabel}
            </Text>

            <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={2}>
              {preview}
            </Text>

            {conversation.order?.status ? (
              <Text style={[styles.status, { color: colors.textMuted }]}>
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

const IMAGE_WIDTH = 72;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.92,
  },
  imageColumn: {
    width: IMAGE_WIDTH,
    alignSelf: 'stretch',
  },
  imageWrap: {
    flex: 1,
    width: IMAGE_WIDTH,
    minHeight: IMAGE_WIDTH,
    borderRadius: Spacing.three,
    overflow: 'hidden',
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
    fontSize: 16,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
  },
  counterpart: {
    fontSize: 13,
    fontWeight: '600',
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
  },
  status: {
    fontSize: 12,
  },
});
