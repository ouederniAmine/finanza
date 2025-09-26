import React, { ReactNode } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PlanningSurfaceProps {
  title: string;
  subtitle?: string;
  amountLine?: string | ReactNode;
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  topExtra?: ReactNode; // e.g. segmented bar already placed outside
  footerSpacing?: number;
}

/**
 * Reusable layout replicating Budgets hero + rounded card pattern.
 */
export function PlanningSurface({
  title,
  subtitle,
  amountLine,
  children,
  refreshing = false,
  onRefresh,
  topExtra,
  footerSpacing = 60,
}: PlanningSurfaceProps) {
  const cardWidth = SCREEN_WIDTH;
  const cardHeight = Math.min(641, SCREEN_HEIGHT - 200);

  return (
    <SafeAreaView style={styles.container}>
      {topExtra}
      <View style={styles.pageContent}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{title}</Text>
          {subtitle && <Text style={styles.heroSubtitle}>{subtitle}</Text>}
          {amountLine && <Text style={styles.heroAmount}>{amountLine}</Text>}
        </View>
        <View style={[styles.card, { width: cardWidth, height: cardHeight }]}> 
          <ScrollView
            style={styles.cardScroll}
            contentContainerStyle={[styles.cardScrollContent, { paddingBottom: footerSpacing }]}
            refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE9FE', // Light purple background
  },
  pageContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  hero: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroTitle: {
    color: '#7C3AED', // Purple primary
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Bold',
    fontSize: 25,
    fontWeight: '700',
    lineHeight: 30,
  },
  heroSubtitle: {
    color: '#5B21B6', // Dark purple for contrast
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Regular',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    marginTop: 6,
  },
  heroAmount: {
    color: '#7C3AED', // Purple primary
    textAlign: 'left',
    fontFamily: 'SourceSansPro-Bold',
    fontSize: 25,
    fontWeight: '700',
    lineHeight: 30,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#F3F0FF', // Very light purple
    borderRadius: 50,
    paddingTop: 24,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  cardScroll: { flex: 1 },
  cardScrollContent: { },
});

export default PlanningSurface;
