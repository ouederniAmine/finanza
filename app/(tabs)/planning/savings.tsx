import AddGoalDrawer from '@/components/AddGoalDrawer';
import { formatCurrency, getCurrency, getTextAlign, t } from '@/lib/i18n';
import { GoalService } from '@/lib/services/goal.service';
import { useUIStore } from '@/lib/store';
import type { SavingsGoal } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PlanningSegmentedBar from '../../../components/PlanningSegmentedBar';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import PlanningSwipeWrapper from '@/components/PlanningSwipeWrapper';
import PlanningSurface from '@/components/PlanningSurface';
import { PlusButton } from '@/components/PlusButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Pastel palette shared across planning screens
const PALETTE = ['#EED4C4','#C2E0C4','#F4C3AA','#BADADA','#F4CBD8'];

// Helper function to get localized title
const getLocalizedTitle = (goal: SavingsGoal, language: string): string => {
  const titleKey = `title_${language}` as keyof SavingsGoal;
  const title = goal[titleKey] as string;
  return title || goal.title_en || goal.title_tn || 'Untitled Goal';
};

// Helper function to calculate monthly target based on time remaining
const calculateMonthlyTarget = (goal: SavingsGoal): number => {
  if (!goal.target_date) return 0;
  
  const targetDate = new Date(goal.target_date);
  const now = new Date();
  const monthsLeft = Math.max(1, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const remaining = goal.target_amount - goal.current_amount;
  
  return Math.max(0, remaining / monthsLeft);
};

export default function SavingsScreen() {
  const { language } = useUIStore();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const textAlign = getTextAlign(language);
  const currency = getCurrency(language);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [showAddGoalDrawer, setShowAddGoalDrawer] = useState(false);
  const [addingMoney, setAddingMoney] = useState<{[key: string]: boolean}>({});
  const hasInitiallyLoaded = useRef(false);

  // Load goals data
  useEffect(() => {
    if (user?.id && !hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true;
      loadSavingsData();
    }
  }, [user?.id]);

  // Reload data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (user?.id && hasInitiallyLoaded.current) {
        console.log('🔄 Screen focused, reloading savings data');
        loadSavingsData();
      }
    }, [user?.id])
  );

  const loadSavingsData = async () => {
    if (!user?.id) return;
    
    if (loading) {
      console.log('⚠️ Already loading goals, skipping duplicate call');
      return;
    }
    
    console.log('🔄 Loading savings goals for user:', user.id);
    setLoading(true);
    
    try {
      const goals = await GoalService.getGoalsByUserId(user.id);
      console.log('✅ Goals loaded successfully:', goals.length);
      setSavingsGoals(goals);
    } catch (error) {
      console.error('❌ Error loading goals:', error);
      Alert.alert(
        'Error',
        'Failed to load savings goals. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const progressPercentage = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSavingsData();
    setRefreshing(false);
  };

  const addMoney = async (goalId: string, amount: number) => {
    const buttonKey = `${goalId}-${amount}`;
    
    if (addingMoney[buttonKey]) {
      console.log('⚠️ Already adding money, ignoring duplicate request');
      return;
    }
    
    try {
      console.log('💰 Adding money to goal:', goalId, amount);
      setAddingMoney(prev => ({ ...prev, [buttonKey]: true }));
      
      const updatedGoal = await GoalService.addMoneyToGoal(goalId, amount);
      
      // Update the local state immediately
      setSavingsGoals(prev => 
        prev.map(goal => goal.id === goalId ? updatedGoal : goal)
      );
      
      // Also update the selected goal if it's the same one
      if (selectedGoal && selectedGoal.id === goalId) {
        setSelectedGoal(updatedGoal);
      }
      
      if (updatedGoal.is_achieved && !savingsGoals.find(g => g.id === goalId)?.is_achieved) {
        Alert.alert(
          'Congratulations! 🎉',
          `You've achieved your goal: ${getLocalizedTitle(updatedGoal, language)}!`,
          [{ text: 'OK' }]
        );
      }
      
      console.log('✅ Money added successfully, local state updated');
    } catch (error) {
      console.error('❌ Error adding money to goal:', error);
      Alert.alert(
        'Error',
        'Failed to add money to goal. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setAddingMoney(prev => ({ ...prev, [buttonKey]: false }));
    }
  };

  const renderCircularProgress = (current: number, target: number, size: number, strokeWidth: number, color: string) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = target > 0 ? (current / target) : 0;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress * circumference);

    return (
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={color} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${color})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    );
  };

  const renderGoalCard = (goal: SavingsGoal, index: number) => {
    const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
    const remaining = goal.target_amount - goal.current_amount;
    const targetDate = goal.target_date ? new Date(goal.target_date) : null;
    const monthsLeft = targetDate 
      ? Math.max(1, Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 12;
    const monthlyTarget = calculateMonthlyTarget(goal);
    const paletteColor = PALETTE[index % PALETTE.length];

    return (
      <TouchableOpacity
        key={goal.id}
        style={[styles.goalCard, { backgroundColor: paletteColor }]}
        onPress={() => setSelectedGoal(goal)}
      >
        <View style={styles.goalHeader}>
          <View style={styles.goalInfo}>
            <Text style={[styles.goalName, { textAlign }]}>{getLocalizedTitle(goal, language)}</Text>
            <Text style={[styles.goalProgress, { textAlign }]}>
              {progress.toFixed(1)}% {t('savings.complete', language)}
            </Text>
            <Text style={[styles.goalRemaining, { textAlign }]}>
              {t('savings.remaining', language).replace('{amount}', formatCurrency(remaining, currency, language)).replace('{months}', monthsLeft.toString())}
            </Text>
          </View>
          <View style={styles.progressContainer}>
            {renderCircularProgress(goal.current_amount, goal.target_amount, 80, 8, goal.color)}
            <View style={styles.progressText}>
              <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.goalDetails}>
          <View style={styles.amountRow}>
            <Text style={[styles.currentAmount, { textAlign }]}>
              {formatCurrency(goal.current_amount, currency, language)} / {formatCurrency(goal.target_amount, currency, language)}
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(progress, 100)}%`, backgroundColor: goal.color }
              ]} 
            />
          </View>

          <View style={styles.goalMeta}>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { textAlign }]}>{t('savings.monthly_target', language)}</Text>
              <Text style={[styles.metaValue, { textAlign }]}>
                {formatCurrency(monthlyTarget, currency, language)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { textAlign }]}>{t('savings.target_date', language)}</Text>
              <Text style={[styles.metaValue, { textAlign }]}>
                {targetDate ? targetDate.toLocaleDateString(language === 'tn' ? 'ar-TN' : 'en-US') : t('savings.no_date', language)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOverallProgress = () => (
    <View style={styles.overallCard}>
      <View style={styles.overallHeader}>
        <Text style={[styles.overallTitle, { textAlign }]}>{t('savings.total_progress', language)}</Text>
        <View style={styles.overallProgress}>
          {renderCircularProgress(totalSaved, totalTarget, 120, 12, '#3B82F6')}
          <View style={styles.overallProgressText}>
            <Text style={styles.overallPercentage}>{Math.round(progressPercentage)}%</Text>
            <Text style={[styles.overallLabel, { textAlign }]}>{t('savings.saved', language)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.overallStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { textAlign }]}>
            {formatCurrency(totalSaved, currency, language)}
          </Text>
          <Text style={[styles.statLabel, { textAlign }]}>
            {t('savings.of_amount', language).replace('{amount}', formatCurrency(totalTarget, currency, language))}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { textAlign }]}>{savingsGoals.length}</Text>
          <Text style={[styles.statLabel, { textAlign }]}>{t('savings.active_goals', language)}</Text>
        </View>
      </View>
    </View>
  );

  const renderGoalModal = () => {
    if (!selectedGoal) return null;

    const progress = selectedGoal.target_amount > 0 ? (selectedGoal.current_amount / selectedGoal.target_amount) * 100 : 0;
    const remaining = selectedGoal.target_amount - selectedGoal.current_amount;
    const monthlyTarget = calculateMonthlyTarget(selectedGoal);

    return (
      <Modal
        visible={!!selectedGoal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedGoal(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedGoal(null)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { textAlign }]}>{getLocalizedTitle(selectedGoal, language)}</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.modalProgressSection}>
              <View style={styles.modalProgressContainer}>
                {renderCircularProgress(selectedGoal.current_amount, selectedGoal.target_amount, 160, 16, selectedGoal.color)}
                <View style={styles.modalProgressText}>
                  <Text style={styles.modalProgressPercentage}>{Math.round(progress)}%</Text>
                  <Text style={[styles.modalProgressLabel, { textAlign }]}>{t('savings.complete', language)}</Text>
                </View>
              </View>
              
              <View style={styles.modalAmountInfo}>
                <Text style={[styles.modalAmountText, { textAlign }]}>
                  {formatCurrency(selectedGoal.current_amount, currency, language)} / {formatCurrency(selectedGoal.target_amount, currency, language)}
                </Text>
                <Text style={[styles.modalRemainingText, { textAlign }]}>
                  {formatCurrency(remaining, currency, language)} {t('savings.remaining_lowercase', language)}
                </Text>
              </View>
            </View>

            <View style={styles.quickAddSection}>
              <Text style={[styles.sectionTitle, { textAlign }]}>{t('savings.quick_add', language)}</Text>
              <View style={styles.quickAddButtons}>
                {[50, 100, 200, 500].map((amount) => {
                  const buttonKey = `${selectedGoal.id}-${amount}`;
                  const isAdding = addingMoney[buttonKey];
                  
                  return (
                    <TouchableOpacity
                      key={amount}
                      style={[
                        styles.quickAddButton,
                        isAdding && styles.quickAddButtonLoading
                      ]}
                      onPress={() => addMoney(selectedGoal.id, amount)}
                      disabled={isAdding}
                    >
                      <Text style={[
                        styles.quickAddButtonText,
                        isAdding && styles.quickAddButtonTextLoading
                      ]}>
                        {isAdding ? '...' : `+${formatCurrency(amount, currency, language)}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.goalStatsSection}>
              <Text style={[styles.sectionTitle, { textAlign }]}>{t('savings.goal_statistics', language)}</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={[styles.statCardValue, { textAlign }]}>
                    {formatCurrency(monthlyTarget, currency, language)}
                  </Text>
                  <Text style={[styles.statCardLabel, { textAlign }]}>{t('savings.monthly_target', language)}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statCardValue, { textAlign }]}>
                    {selectedGoal.target_date ? new Date(selectedGoal.target_date).toLocaleDateString(language === 'tn' ? 'ar-TN' : 'en-US') : t('savings.no_date', language)}
                  </Text>
                  <Text style={[styles.statCardLabel, { textAlign }]}>{t('savings.target_date', language)}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const heroAmount = `${savingsGoals.length} ${t('savings.active_goals', language)}`;

  const surfaceInner = (
    <>
      {loading ? (
        <View style={newStyles.loadingWrap}>
          <Text style={newStyles.loadingText}>{t('common.loading', language)}</Text>
        </View>
      ) : (
        <>
          {renderOverallProgress()}
          <View style={newStyles.sectionHeaderRow}>
            <Text style={newStyles.sectionHeader}>Savings Goals</Text>
            <TouchableOpacity onPress={() => setShowAddGoalDrawer(true)}>
              <Text style={newStyles.linkAdd}>{t('savings.add_goal', language) || '+'}</Text>
            </TouchableOpacity>
          </View>
          {savingsGoals.length === 0 ? (
            <View style={newStyles.emptyBox}>
              <Text style={newStyles.emptyBoxTitle}>{t('savings.no_goals', language)}</Text>
              <Text style={newStyles.emptyBoxSub}>{t('savings.create_first_goal', language)}</Text>
            </View>
          ) : (
            savingsGoals.map((g, i) => renderGoalCard(g, i))
          )}
        </>
      )}
    </>
  );

  return (
    <PlanningSwipeWrapper>
      <PlanningSurface
        title={t('savings.title', language)}
        subtitle={t('savings.total_progress', language)}
        amountLine={heroAmount}
        refreshing={refreshing}
        onRefresh={onRefresh}
        topExtra={<PlanningSegmentedBar />}
      >
        {surfaceInner}
      </PlanningSurface>
      <View style={[newStyles.fabRootWrapper, { bottom: insets.bottom + 96 }]} pointerEvents="box-none">
        <PlusButton onPress={() => setShowAddGoalDrawer(true)} />
      </View>
    </PlanningSwipeWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  overallCard: {
    margin: 20,
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overallHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  overallProgress: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallProgressText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  overallLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  overallStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  goalsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalInfo: {
    flex: 1,
    marginRight: 16,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  goalProgress: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 2,
  },
  goalRemaining: {
    fontSize: 12,
    color: '#64748b',
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  goalDetails: {
    gap: 12,
  },
  amountRow: {
    alignItems: 'center',
  },
  currentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#64748b',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalProgressSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  modalProgressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalProgressText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalProgressPercentage: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalProgressLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  modalAmountInfo: {
    alignItems: 'center',
  },
  modalAmountText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  modalRemainingText: {
    fontSize: 14,
    color: '#64748b',
  },
  quickAddSection: {
    marginBottom: 30,
  },
  quickAddButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAddButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  quickAddButtonLoading: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7,
  },
  quickAddButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickAddButtonTextLoading: {
    color: '#ffffff',
    opacity: 0.7,
  },
  goalStatsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  statCardLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    margin: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

const newStyles = StyleSheet.create({
  fabRootWrapper: {
    position: 'absolute',
    right: 24,
    zIndex: 100,
    elevation: 20,
  },
  loadingWrap: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { fontSize: 16, color: '#1e293b' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionHeader: { fontSize: 18, fontWeight: '600', color: '#1e293b' },
  linkAdd: { fontSize: 14, color: '#754E51', fontWeight: '600' },
  emptyBox: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 32, alignItems: 'center', marginBottom: 24 },
  emptyBoxTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 6 },
  emptyBoxSub: { fontSize: 13, color: '#64748b', textAlign: 'center' },
});