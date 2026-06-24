import { StyleSheet, Text, type TextProps } from 'react-native';

import { Colors } from '@/constants/colors';

export function SectionTitle({ style, ...props }: TextProps) {
  return <Text style={[styles.title, style]} {...props} />;
}

const styles = StyleSheet.create({
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
