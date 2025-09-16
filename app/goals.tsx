import AddGoalDrawer from '@/components/AddGoalDrawer';
import { formatCurrency, getCurrency, getTextAlign, t } from '@/lib/i18n';
import { GoalService } from '@/lib/services/goal.service';
import { useUIStore } from '@/lib/store';
import { useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  icon: string;
  color: string;
  category: string;
  deadline: string;
  description: string;
}

interface DBGoal {
  id: string;
  title_en: string;
  title_fr: string;
  title_tn: string;
  target_amount: string;
  current_amount: string;
  target_date: string | null;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  color: string;
  is_achieved: boolean;
  created_at: string;
}

export default function GoalsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showGoalDrawer, setShowGoalDrawer] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useUIStore();
  const { user } = useUser();
  const textAlign = getTextAlign(language);
  const currency = getCurrency(language);

  const fetchGoals = async () => {
    if (!user?.id) return;

    try {
      // Use GoalService to properly handle Clerk ID to UUID mapping
      const allGoals = await GoalService.getGoalsByUserId(user.id);
      
      // Filter for non-achieved goals (since GoalService gets all goals)
      const data = allGoals.filter(goal => !goal.is_achieved);

      if (data) {
        const formattedGoals: Goal[] = data.map((goal) => {
          // Get the title based on current language
          const getTitle = () => {
            switch (language) {
              case 'fr': return goal.title_fr || goal.title_en || goal.title_tn || 'Goal';
              case 'tn': return goal.title_tn || goal.title_en || goal.title_fr || 'Goal';
              default: return goal.title_en || goal.title_tn || goal.title_fr || 'Goal';
            }
          };

          return {
            id: goal.id,
            name: getTitle(),
            current: goal.current_amount,
            target: goal.target_amount,
            icon: goal.icon,
            color: goal.color,
            category: t(`goals.priority.${goal.priority}`, language) || goal.priority,
            deadline: goal.target_date 
              ? new Date(goal.target_date).toLocaleDateString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'ar-TN')
              : t('goals.ongoing', language) || 'Ongoing',
            description: t('goals.description_placeholder', language) || 'Working towards this goal',
          };
        });
        setGoals(formattedGoals);
      }
    } catch (error) {
      console.error('Unexpected error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGoals();
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGoals();
    setRefreshing(false);
  };

  const handleGoalCreated = () => {
    fetchGoals(); // Refresh goals list when a new goal is created
  };

  const getStatusColor = (progress: number) => {
    if (progress >= 90) return '#10B981'; // Green
    if (progress >= 70) return '#F59E0B'; // Orange
    if (progress >= 50) return '#3B82F6'; // Blue
    return '#EF4444'; // Red
  };

  const getStatusText = (progress: number) => {
    if (progress >= 90) return t('goals.almost_complete', language) || 'Almost Complete';
    if (progress >= 70) return t('goals.on_track', language) || 'On Track';
    if (progress >= 50) return t('goals.making_progress', language) || 'Making Progress';
    return t('goals.needs_attention', language) || 'Needs Attention';
  };

  const sortedGoals = goals.sort((a, b) => {
    const progressA = (a.current / a.target) * 100;
    const progressB = (b.current / b.target) * 100;
    return progressB - progressA; // Sort by progress descending
  });

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: language === 'tn' ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(tabs)');
            }
          }}
        >
          <Text style={styles.backIcon}>{language === 'tn' ? '→' : '←'}</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { textAlign }]}>
            {t('dashboard.goals', language)}
          </Text>
          <Text style={[styles.headerSubtitle, { textAlign }]}>
            {goals.length} {t('goals.active_goals', language) || 'Active Goals'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowGoalDrawer(true)}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {formatCurrency(goals.reduce((sum, goal) => sum + goal.current, 0), currency, language)}
          </Text>
          <Text style={styles.summaryLabel}>{t('goals.total_saved', language) || 'Total Saved'}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {formatCurrency(goals.reduce((sum, goal) => sum + goal.target, 0), currency, language)}
          </Text>
          <Text style={styles.summaryLabel}>{t('goals.total_target', language) || 'Total Target'}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Goals List */}
        <View style={styles.goalsContainer}>
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('common.loading', language) || 'Loading...'}</Text>
            </View>
          ) : goals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎯</Text>
              <Text style={styles.emptyTitle}>{t('goals.no_goals_title', language) || 'No Goals Yet'}</Text>
              <Text style={styles.emptyText}>
                {t('goals.no_goals_message', language) || 'Start by creating your first savings goal using the + button above'}
              </Text>
            </View>
          ) : (
            sortedGoals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              const remaining = goal.target - goal.current;
              
              return (
                <TouchableOpacity key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <View style={styles.goalIconContainer}>
                      <Text style={styles.goalIcon}>{goal.icon}</Text>
                    </View>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalName}>{goal.name}</Text>
                      <Text style={styles.goalCategory}>{goal.category} • {goal.deadline}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(progress)}15` }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(progress) }]}>
                        {Math.round(progress)}%
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.goalDescription}>{goal.description}</Text>

                  <View style={styles.goalAmounts}>
                    <View style={styles.amountItem}>
                      <Text style={styles.amountLabel}>{t('goals.current', language) || 'Current'}</Text>
                      <Text style={styles.amountValue}>
                        {formatCurrency(goal.current, currency, language)}
                      </Text>
                    </View>
                    <View style={styles.amountItem}>
                      <Text style={styles.amountLabel}>{t('goals.target', language) || 'Target'}</Text>
                      <Text style={styles.amountValue}>
                        {formatCurrency(goal.target, currency, language)}
                      </Text>
                    </View>
                    <View style={styles.amountItem}>
                      <Text style={styles.amountLabel}>{t('goals.remaining', language) || 'Remaining'}</Text>
                      <Text style={[styles.amountValue, { color: '#EF4444' }]}>
                        {formatCurrency(remaining, currency, language)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${Math.min(progress, 100)}%`, 
                            backgroundColor: goal.color 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.statusLabel, { color: getStatusColor(progress) }]}>
                      {getStatusText(progress)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add Goal Drawer */}
      <AddGoalDrawer
        visible={showGoalDrawer}
        onClose={() => setShowGoalDrawer(false)}
        onGoalCreated={handleGoalCreated}
      />
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FAFBFC',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667EEA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667EEA',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  goalsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  goalIcon: {
    fontSize: 24,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  goalCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  goalAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountItem: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
