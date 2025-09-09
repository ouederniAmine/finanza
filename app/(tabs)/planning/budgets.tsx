import { useRequireAuth } from '@/lib/auth-utils-clerk';
import { formatCurrency, getTextAlign, t } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Category {
  id: string;
  name_tn?: string;
  name_en?: string;
  name_fr?: string;
  name_ar?: string;
  icon: string;
  color: string;
  type: string;
  is_default: boolean;
  user_id: string;
}

interface Budget {
  id: string;
  category_id: string;
  allocated: number;
  spent: number;
  category: string;
  icon: string;
  color: string;
}

export default function BudgetsScreen() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [newAmount, setNewAmount] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetName, setBudgetName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const { language } = useUIStore();
  const textAlign = getTextAlign(language);

  // Helper to get currency code from language
  const getCurrencyCode = (lang: string) => {
    switch (lang) {
      case 'tn': return 'TND';
      case 'fr': return 'EUR';
      default: return 'USD';
    }
  };

  // Helper functions
  const getCategoryName = (category: any, language: string) => {
    if (!category) return 'Unknown';
    switch (language) {
      case 'tn': return category.name_tn || category.name_en || category.name_fr || 'Unknown';
      case 'fr': return category.name_fr || category.name_en || category.name_tn || 'Unknown';
      case 'ar': return category.name_ar || category.name_tn || category.name_en || 'Unknown';
      default: return category.name_en || category.name_tn || category.name_fr || 'Unknown';
    }
  };

  const getUserById = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('cultural_preferences')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  };

  const getCategories = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},user_id.is.null,is_default.eq.true`)
        .eq('type', 'expense')
        .order('is_default', { ascending: false })
        .order('name_tn', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  };

  const getBudgets = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          id,
          amount,
          spent_amount,
          category_id,
          category:categories(
            id,
            name_tn,
            name_en,
            name_fr,
            name_ar,
            icon,
            color
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting budgets:', error);
      return [];
    }
  };

  const createBudget = async (budgetData: {
    userId: string;
    categoryId: string;
    amount: number;
    period: string;
    alertThreshold: number;
  }) => {
    try {
      // First, get the category details to populate name fields
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('name_tn, name_en, name_fr, name_ar, icon, color')
        .eq('id', budgetData.categoryId)
        .single();

      if (categoryError) throw categoryError;

      const { data, error } = await supabase
        .from('budgets')
        .insert([{
          user_id: budgetData.userId,
          category_id: budgetData.categoryId,
          name_tn: categoryData.name_tn,
          name_en: categoryData.name_en,
          name_fr: categoryData.name_fr,
          name_ar: categoryData.name_ar,
          amount: budgetData.amount,
          currency: 'TND', // Add currency field
          period: budgetData.period,
          start_date: new Date().toISOString(), // Add start_date field
          end_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(), // End of current month
          alert_threshold: budgetData.alertThreshold,
          spent_amount: 0,
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  };

  const updateBudget = async (budgetId: string, userId: string, updateData: { amount: number }) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', budgetId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  };

  const deleteBudget = async (budgetId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  };

  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load categories, budgets, and user data in parallel
      const [categoriesData, budgetsData, userData] = await Promise.all([
        getCategories(user.id),
        getBudgets(user.id),
        getUserById(user.id),
      ]);

      // Transform categories to match our interface
      const transformedCategories: Category[] = categoriesData.map((cat: any) => ({
        id: cat.id,
        name_tn: cat.name_tn,
        name_en: cat.name_en,
        name_fr: cat.name_fr,
        name_ar: cat.name_ar,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
        is_default: cat.is_default,
        user_id: cat.user_id,
      }));

      // Transform budgets to match our interface
      const transformedBudgets: Budget[] = budgetsData.map((budget: any) => ({
        id: budget.id.toString(),
        category_id: budget.category_id,
        allocated: budget.amount,
        spent: budget.spent_amount || 0,
        category: budget.category?.name_tn || budget.category?.name_en || 'Unknown',
        icon: budget.category?.icon || '📊',
        color: budget.category?.color || '#3B82F6',
      }));

      setCategories(transformedCategories);
      setBudgets(transformedBudgets);
      setMonthlyIncome(userData?.cultural_preferences?.monthly_income || 0);
      
      // Calculate totals from budgets data
      const totalAllocatedAmount = transformedBudgets.reduce((sum: number, budget: Budget) => sum + budget.allocated, 0);
      const totalSpentAmount = transformedBudgets.reduce((sum: number, budget: Budget) => sum + budget.spent, 0);
      
      setTotalAllocated(totalAllocatedAmount);
      setTotalSpent(totalSpentAmount);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Refresh data when screen comes into focus (e.g., after adding a transaction)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadData();
      }
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddBudget = async () => {
    if (!user || !selectedCategory || !newAmount) return;

    try {
      const amount = parseFloat(newAmount);
      if (isNaN(amount) || amount <= 0) return;

      await createBudget({
        userId: user.id,
        categoryId: selectedCategory,
        amount: amount,
        period: 'monthly',
        alertThreshold: 80,
      });

      setShowAddModal(false);
      setSelectedCategory('');
      setNewAmount('');
      await loadData();
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const handleEditBudget = async () => {
    if (!user || !selectedBudget || !budgetAmount) return;

    try {
      const amount = parseFloat(budgetAmount);
      if (isNaN(amount) || amount <= 0) return;

      await updateBudget(
        selectedBudget.id,
        user.id,
        {
          amount: amount,
        }
      );

      setShowEditModal(false);
      setSelectedBudget(null);
      setBudgetAmount('');
      await loadData();
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const handleEditPress = (budget: Budget) => {
    setSelectedBudget(budget);
    setBudgetAmount(budget.allocated.toString());
    setBudgetName(budget.category);
    setShowEditModal(true);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!user) return;
    
    try {
      await deleteBudget(budgetId, user.id);
      await loadData();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const getProgressColor = (spent: number, allocated: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage >= 90) return '#EF4444'; // Red
    if (percentage >= 75) return '#F59E0B'; // Yellow
    return '#10B981'; // Green
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.morning_greeting', language);
    if (hour < 18) return t('dashboard.afternoon_greeting', language);
    return t('dashboard.evening_greeting', language);
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>{t('budget.loading', language)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { textAlign }]}>{getGreeting()}</Text>
            <Text style={[styles.headerTitle, { textAlign }]}>{t('budget.title', language)}</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Section */}
        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryLabel, { textAlign }]}>
            {t('budget.total_budget', language)}
          </Text>
          <Text style={[styles.summaryAmount, { textAlign }]}>
            {formatCurrency(monthlyIncome, getCurrencyCode(language), language)}
          </Text>
          <View style={styles.summaryProgress}>
            <View 
              style={[
                styles.summaryProgressFill, 
                { 
                  width: monthlyIncome > 0 ? `${Math.min((totalAllocated / monthlyIncome) * 100, 100)}%` : '0%',
                  backgroundColor: totalAllocated > monthlyIncome ? '#EF4444' : '#10B981'
                }
              ]} 
            />
          </View>
          <Text style={[styles.summarySubtext, { textAlign }]}>
            {formatCurrency(totalAllocated, getCurrencyCode(language), language)} {t('budget.allocated_of', language)} {formatCurrency(monthlyIncome, getCurrencyCode(language), language)}
          </Text>
        </View>

        {/* Spent vs Remaining Cards */}
        <View style={styles.budgetCardsRow}>
          <View style={[styles.budgetCard, styles.spentCard]}>
            <View style={styles.budgetCardIcon}>
              <Text style={styles.budgetCardIconText}>💸</Text>
            </View>
            <Text style={[styles.budgetCardLabel, { textAlign }]}>
              {t('budget.spent', language)}
            </Text>
            <Text style={[styles.budgetCardAmount, { textAlign }]}>
              {formatCurrency(totalSpent, getCurrencyCode(language), language)}
            </Text>
          </View>
          
          <View style={[styles.budgetCard, styles.remainingCard]}>
            <View style={styles.budgetCardIcon}>
              <Text style={styles.budgetCardIconText}>💰</Text>
            </View>
            <Text style={[styles.budgetCardLabel, { textAlign }]}>
              {t('budget.remaining', language)}
            </Text>
            <Text style={[styles.budgetCardAmount, { textAlign }]}>
              {formatCurrency(Math.max(totalAllocated - totalSpent, 0), getCurrencyCode(language), language)}
            </Text>
          </View>
        </View>

        {/* Budgets List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { textAlign }]}>{t('budget.budgets', language)}</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>{t('budget.view_all', language)}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.budgetsList}>
            {budgets.length === 0 ? (
              <View style={styles.noBudgetsContainer}>
                <Text style={[styles.noBudgetsText, { textAlign }]}>{t('budget.no_budgets', language)}</Text>
                <Text style={[styles.noBudgetsSubtext, { textAlign }]}>{t('budget.add_first_budget', language)}</Text>
              </View>
            ) : (
              budgets.map((budget) => {
                const percentage = budget.allocated > 0 ? (budget.spent / budget.allocated) * 100 : 0;
                const progressColor = getProgressColor(budget.spent, budget.allocated);
                
                return (
                  <TouchableOpacity 
                    key={budget.id} 
                    style={styles.budgetItem}
                    onPress={() => handleEditPress(budget)}
                  >
                    <View style={styles.budgetItemLeft}>
                      <View style={[styles.budgetItemIcon, { backgroundColor: `${budget.color}20` }]}>
                        <Text style={styles.budgetItemEmoji}>{budget.icon}</Text>
                      </View>
                      <View style={styles.budgetItemInfo}>
                        <Text style={[styles.budgetItemCategory, { textAlign }]}>
                          {getCategoryName(categories.find(c => c.id === budget.category_id), language)}
                        </Text>
                        <Text style={[styles.budgetItemAmounts, { textAlign }]}>
                          {formatCurrency(budget.spent, getCurrencyCode(language), language)} / {formatCurrency(budget.allocated, getCurrencyCode(language), language)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.budgetItemRight}>
                      <Text style={[styles.budgetItemPercentage, { color: progressColor }]}>
                        {percentage.toFixed(0)}%
                      </Text>
                      <View style={styles.budgetItemProgressContainer}>
                        <View style={styles.budgetItemProgress}>
                          <View 
                            style={[
                              styles.budgetItemProgressFill, 
                              { 
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: progressColor 
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        {/* Budget Tips */}
        <View style={styles.section}>
          <View style={styles.tipsContainer}>
            <View style={styles.tipsHeader}>
              <Text style={styles.tipsIcon}>💡</Text>
              <Text style={[styles.tipsTitle, { textAlign }]}>{t('budget.budget_tips', language)}</Text>
            </View>
            <Text style={[styles.tipsText, { textAlign }]}>
              {t('budget.budget_tip_message', language)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('budget.add_budget', language)}</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('budget.category', language)}</Text>
                <View style={styles.pickerContainer}>
                  <ScrollView style={styles.categoryList}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryItem,
                          selectedCategory === category.id && styles.selectedCategoryItem
                        ]}
                        onPress={() => setSelectedCategory(category.id)}
                      >
                        <Text style={styles.categoryItemText}>
                          {category.icon} {getCategoryName(category, language)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('budget.amount', language)}</Text>
                <View style={styles.formInputContainer}>
                  <Text style={styles.formCurrency}>{language === 'tn' ? 'د.ت' : language === 'fr' ? '€' : '$'}</Text>
                  <TextInput
                    style={styles.formInputWithCurrency}
                    value={newAmount}
                    onChangeText={setNewAmount}
                    placeholder={t('budget.enter_amount', language)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.modalSubmitButton}
              onPress={handleAddBudget}
            >
              <Text style={styles.modalSubmitText}>{t('budget.add_budget', language)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('budget.edit_budget', language)}</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('budget.category', language)}</Text>
                <Text style={styles.categoryItemText}>{budgetName}</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>{t('budget.amount', language)}</Text>
                <View style={styles.formInputContainer}>
                  <Text style={styles.formCurrency}>{language === 'tn' ? 'د.ت' : language === 'fr' ? '€' : '$'}</Text>
                  <TextInput
                    style={styles.formInputWithCurrency}
                    value={budgetAmount}
                    onChangeText={setBudgetAmount}
                    placeholder={t('budget.enter_amount', language)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => selectedBudget && handleDeleteBudget(selectedBudget.id)}
              >
                <Text style={styles.modalCancelText}>{t('budget.delete', language)}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handleEditBudget}
              >
                <Text style={styles.modalSubmitText}>{t('budget.save', language)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667EEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryProgress: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    marginBottom: 8,
  },
  summaryProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  budgetCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  budgetCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  spentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  remainingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  budgetCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  budgetCardIconText: {
    fontSize: 18,
  },
  budgetCardLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  budgetCardAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
  },
  budgetsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noBudgetsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noBudgetsText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  noBudgetsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  budgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  budgetItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  budgetItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  budgetItemEmoji: {
    fontSize: 20,
  },
  budgetItemInfo: {
    flex: 1,
  },
  budgetItemCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  budgetItemAmounts: {
    fontSize: 14,
    color: '#6B7280',
  },
  budgetItemRight: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  budgetItemPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  budgetItemProgressContainer: {
    width: 60,
  },
  budgetItemProgress: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
  },
  budgetItemProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  tipsContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  tipsText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#6B7280',
  },
  modalForm: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  pickerContainer: {
    maxHeight: 150,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  categoryList: {
    maxHeight: 150,
  },
  categoryItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectedCategoryItem: {
    backgroundColor: '#667EEA20',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  formInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingLeft: 16,
  },
  formCurrency: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  formInputWithCurrency: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  modalSubmitButton: {
    backgroundColor: '#667EEA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
