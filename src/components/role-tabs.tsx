import { useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { NotchedShape } from '@/components/notched-shape';
import { Colors } from '@/constants/colors';
import type { UserRole } from '@/types/user';

const ROLES = [
  { role: 'vendor' as const, label: 'Vendor' },
  { role: 'buyer' as const, label: 'Buyer' },
  { role: 'admin' as const, label: 'Admin' },
] satisfies readonly { role: UserRole; label: string }[];

const BAR_HEIGHT = 46;
const OUTER_CHAMFER = 9;
const INNER_CHAMFER = 7;
const TAB_INSET_H = 6;
const TAB_INSET_V = 5;

type RoleTabProps = {
  label: string;
  selected: boolean;
  tabWidth: number;
  onPress: () => void;
};

function RoleTab({ label, selected, tabWidth, onPress }: RoleTabProps) {
  const shapeWidth = Math.max(tabWidth - TAB_INSET_H * 2, 0);
  const shapeHeight = BAR_HEIGHT - TAB_INSET_V * 2;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tab, { width: tabWidth }, pressed && styles.tabPressed]}>
      {selected ? (
        <View style={styles.selectedShape} pointerEvents="none">
          <NotchedShape
            width={shapeWidth}
            height={shapeHeight}
            chamfer={INNER_CHAMFER}
            fill={Colors.tabActiveFillTop}
            fillSecondary={Colors.tabActiveFillBottom}
            stroke={Colors.tabActiveBorder}
            cornerAccent={Colors.tabCornerAccent}
            showCornerAccents
          />
        </View>
      ) : null}
      <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

type RoleTabBarProps = {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
};

export function RoleTabBar({ selectedRole, onSelectRole }: RoleTabBarProps) {
  const [barWidth, setBarWidth] = useState(0);

  function handleLayout(event: LayoutChangeEvent) {
    setBarWidth(event.nativeEvent.layout.width);
  }

  const tabWidth = barWidth > 0 ? barWidth / ROLES.length : 0;

  return (
    <View style={styles.wrapper} onLayout={handleLayout}>
      {barWidth > 0 ? (
        <>
          <NotchedShape
            width={barWidth}
            height={BAR_HEIGHT}
            chamfer={OUTER_CHAMFER}
            fill={Colors.tabTrack}
            stroke={Colors.surfaceBorder}
            cornerAccent={Colors.tabCornerAccent}
            showCornerAccents
          />
          <View style={styles.tabsRow}>
            {ROLES.map((item) => (
              <RoleTab
                key={item.role}
                label={item.label}
                tabWidth={tabWidth}
                selected={selectedRole === item.role}
                onPress={() => onSelectRole(item.role)}
              />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: BAR_HEIGHT,
  },
  placeholder: {
    height: BAR_HEIGHT,
  },
  tabsRow: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
  },
  tab: {
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectedShape: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPressed: {
    opacity: 0.88,
  },
  tabLabel: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    zIndex: 2,
    ...(Platform.OS === 'android' ? { includeFontPadding: false, textAlignVertical: 'center' } : {}),
  },
  tabLabelSelected: {
    color: Colors.text,
  },
});
