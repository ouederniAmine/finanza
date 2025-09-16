import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

interface Segment {
  key: string;
  label: string;
  href: string;
}

const segments: Segment[] = [
  { key: 'budgets', label: 'Budget', href: '/planning/budgets' },
  { key: 'debts', label: 'Debts', href: '/planning/debts' },
  { key: 'savings', label: 'Savings', href: '/planning/savings' },
];

export const PlanningSegmentedBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const active = segments.find(s => pathname?.includes(s.key))?.key || 'budgets';

  // Target sizes from design
  const DESIGN_BAR_WIDTH = 375;
  const DESIGN_BAR_HEIGHT = 59;
  const DESIGN_SEGMENT_HEIGHT = 51; // width now dynamic
  const DESIGN_FONT = 20;

  const screenWidth = Dimensions.get('window').width;
  // Scale down if screen width smaller than design width (keep <=1)
  const scale = Math.min(1, screenWidth / (DESIGN_BAR_WIDTH + 32)); // +32 for wrapper padding

  const barStyle = {
    width: DESIGN_BAR_WIDTH * scale,
    height: DESIGN_BAR_HEIGHT * scale,
    borderRadius: 20 * scale,
    paddingHorizontal: 8 * scale,
    paddingVertical: 4 * scale,
  } as const;

  const segmentBase = {
    flex: 1,
    height: DESIGN_SEGMENT_HEIGHT * scale,
    borderRadius: 20 * scale,
    justifyContent: 'center',
    paddingHorizontal: 12 * scale,
  } as const;

  const textBase = {
    fontSize: DESIGN_FONT * scale,
    fontWeight: '700' as const,
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bar, barStyle]}>
        {segments.map(seg => {
          const isActive = seg.key === active;
          return (
            <TouchableOpacity
              key={seg.key}
              onPress={() => !isActive && router.push(seg.href as any)}
              activeOpacity={0.7}
              style={[styles.segment, segmentBase, isActive && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, textBase, isActive && styles.segmentTextActive]} numberOfLines={1} adjustsFontSizeToFit>
                {seg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default PlanningSegmentedBar;
const BAR_BG = '#ECE0D6';
const ACTIVE_BG = '#754E51';
const INACTIVE_TEXT = '#002E52';

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: BAR_BG,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  segment: {
    backgroundColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: ACTIVE_BG,
  },
  segmentText: {
    fontSize: 20,
    fontWeight: '700',
    color: INACTIVE_TEXT,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
});
