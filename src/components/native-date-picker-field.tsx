import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { formatDateForDisplay, formatDateToIso } from '@/lib/format';
import { useScreenTheme } from '@/providers/screen-theme-provider';

type NativeDatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string | null;
  minimumDate?: Date;
  placeholder?: string;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function NativeDatePickerField({
  label,
  value,
  onChange,
  hint,
  error,
  minimumDate,
  placeholder = 'Select date (optional)',
}: NativeDatePickerFieldProps) {
  const theme = useScreenTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [draftDate, setDraftDate] = useState<Date>(() => startOfDay(new Date()));

  const minDate = minimumDate ? startOfDay(minimumDate) : startOfDay(new Date());
  const selectedDate = value ? new Date(`${value}T12:00:00`) : minDate;
  const displayValue = value ? formatDateForDisplay(selectedDate) : placeholder;

  function openPicker() {
    setDraftDate(selectedDate);
    setShowPicker(true);
  }

  function closePicker() {
    setShowPicker(false);
  }

  function handleDone() {
    onChange(formatDateToIso(draftDate));
    closePicker();
  }

  function handleClear() {
    onChange('');
    closePicker();
  }

  function handleAndroidChange(event: DateTimePickerEvent, nextDate?: Date) {
    closePicker();

    if (event.type === 'dismissed' || !nextDate) {
      return;
    }

    onChange(formatDateToIso(nextDate));
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [
          styles.input,
          {
            backgroundColor: theme.input,
            borderColor: error ? '#E05D5D' : theme.inputBorder,
          },
          pressed && styles.inputPressed,
        ]}>
        <Text style={[styles.value, !value && styles.placeholder]}>{displayValue}</Text>
      </Pressable>

      {value && !showPicker ? (
        <Pressable onPress={handleClear} hitSlop={8}>
          <Text style={styles.clearLabel}>Clear date</Text>
        </Pressable>
      ) : null}

      {hint && !showPicker ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {Platform.OS === 'android' && showPicker ? (
        <DateTimePicker
          value={draftDate}
          mode="date"
          display="default"
          minimumDate={minDate}
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={closePicker}>
          <View style={styles.overlay}>
            <Pressable style={styles.backdropTap} onPress={closePicker} />

            <View
              style={[
                styles.dialog,
                {
                  backgroundColor: Colors.background,
                  borderColor: theme.surfaceBorder,
                },
              ]}>
              <View style={styles.dialogHeader}>
                <View style={styles.headerSpacer} />
                <Pressable onPress={handleDone} hitSlop={12}>
                  <Text style={[styles.doneLink, { color: theme.accentLight }]}>Done</Text>
                </Pressable>
              </View>

              <Text style={styles.dialogTitle}>Preferred delivery date</Text>
              <Text style={styles.dialogSubtitle}>Choose when the gift should arrive.</Text>

              <DateTimePicker
                value={draftDate}
                mode="date"
                display="inline"
                minimumDate={minDate}
                onChange={(_, nextDate) => {
                  if (nextDate) {
                    setDraftDate(nextDate);
                  }
                }}
                themeVariant="dark"
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  inputPressed: {
    opacity: 0.88,
  },
  value: {
    color: Colors.text,
    fontSize: 16,
  },
  placeholder: {
    color: Colors.textMuted,
  },
  clearLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    color: '#E05D5D',
    fontSize: 12,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  backdropTap: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: Spacing.four,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerSpacer: {
    flex: 1,
  },
  doneLink: {
    fontSize: 17,
    fontWeight: '700',
  },
  dialogTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  dialogSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  picker: {
    alignSelf: 'stretch',
  },
});
