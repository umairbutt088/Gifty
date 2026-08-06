import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GlassCard } from '@/components/glass-card';
import { Spacing } from '@/constants/theme';
import { useColors } from '@/hooks/use-colors';
import { useScreenTheme } from '@/providers/screen-theme-provider';
import type { GiftReviewRow } from '@/types/vendor';

type GiftReviewsSectionProps = {
  reviews: GiftReviewRow[];
  canReview: boolean;
  existingRating?: number | null;
  existingComment?: string | null;
  submitting?: boolean;
  onSubmit: (rating: number, comment: string) => Promise<void> | void;
};

export function GiftReviewsSection({
  reviews,
  canReview,
  existingRating,
  existingComment,
  submitting = false,
  onSubmit,
}: GiftReviewsSectionProps) {
  const colors = useColors();
  const theme = useScreenTheme();
  const [rating, setRating] = useState(existingRating ?? 5);
  const [comment, setComment] = useState(existingComment ?? '');

  return (
    <View style={styles.container}>
      {canReview ? (
        <GlassCard variant="nested" style={styles.composeCard}>
          <Text style={[styles.composeTitle, { color: colors.text }]}>
            {existingRating ? 'Update your review' : 'Rate this gift'}
          </Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={`${value} stars`}
                onPress={() => setRating(value)}
                style={({ pressed }) => [
                  styles.star,
                  {
                    backgroundColor: value <= rating ? theme.accentMuted : theme.surface,
                    borderColor: value <= rating ? theme.tabActiveBorder : theme.surfaceBorder,
                  },
                  pressed && styles.pressed,
                ]}>
                <Text
                  style={[
                    styles.starText,
                    { color: value <= rating ? theme.accentLight : colors.textMuted },
                  ]}>
                  {value}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Share what made this gift special"
            placeholderTextColor={colors.textMuted}
            multiline
            style={[
              styles.commentInput,
              {
                color: colors.text,
                backgroundColor: theme.input,
                borderColor: theme.inputBorder,
              },
            ]}
          />
          <Pressable
            accessibilityRole="button"
            disabled={submitting}
            onPress={() => void onSubmit(rating, comment)}
            style={({ pressed }) => [
              styles.submitButton,
              { backgroundColor: theme.accent },
              (pressed || submitting) && styles.pressed,
            ]}>
            <Text style={styles.submitText}>{submitting ? 'Saving…' : 'Save review'}</Text>
          </Pressable>
        </GlassCard>
      ) : null}

      {reviews.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          No reviews yet. Be the first after your order is delivered.
        </Text>
      ) : (
        reviews.map((review) => (
          <GlassCard key={review.id} variant="nested" style={styles.reviewCard}>
            <Text style={[styles.reviewRating, { color: theme.accentLight }]}>
              {review.rating}/5
            </Text>
            {review.comment ? (
              <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>
                {review.comment}
              </Text>
            ) : (
              <Text style={[styles.reviewComment, { color: colors.textMuted }]}>
                Rated without a written comment.
              </Text>
            )}
          </GlassCard>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  composeCard: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  composeTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  stars: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  star: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starText: {
    fontSize: 14,
    fontWeight: '800',
  },
  commentInput: {
    minHeight: 88,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  empty: {
    fontSize: 13,
    lineHeight: 19,
  },
  reviewCard: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  reviewRating: {
    fontSize: 13,
    fontWeight: '800',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.75,
  },
});
