import { StyleSheet, Text, View } from 'react-native';

import { BrandBanner } from '@/components/brand-banner';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/theme';

import { RoleBadge } from './role-badge';

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  role?: string;
  showBanner?: boolean;
};

export function DashboardHeader({
  title,
  subtitle,
  role,
  showBanner = false,
}: DashboardHeaderProps) {
  return (
    <View style={styles.header}>
      {showBanner ? <BrandBanner showTagline={false} /> : null}
      {role ? <RoleBadge role={role} /> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.three,
    alignItems: 'stretch',
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
});
