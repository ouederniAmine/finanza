import { getTextAlign, t } from '@/lib/i18n';
import { DebtService } from '@/lib/services/debt.service';
import { useUIStore } from '@/lib/store';
import type { Category, SavingsGoal } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { getSupabaseUserByClerkId } from '@/lib/clerk-supabase-sync';
import { useUser } from '@clerk/clerk-expo';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.85;

interface AddTransactionDrawerPerfectProps {
  visible: boolean;
  onClose: () => void;
  initialType?: string;
  onTransactionCreated?: () => void;
}

const AddTransactionDrawerPerfect: React.FC<AddTransactionDrawerPerfectProps> = ({ 
  visible, 
  onClose, 
  initialType = 'expense',
  onTransactionCreated 
}) => {
  const { language } = useUIStore();
  const { user } = useUser();
  const textAlign = getTextAlign(language);
  
  const [selectedType, setSelectedType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [description, setDescription] = useState('');
  const [creditorName, setCreditorName] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [date] = useState(new Date().toISOString().split('T')[0]);

  // Update selectedType when initialType changes
  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  // Load categories when component mounts or transaction type changes
  useEffect(() => {
    loadCategories();
  }, [selectedType, user?.id]);

  // Load savings goals when component mounts or transaction type changes to savings
  useEffect(() => {
    if (selectedType === 'savings') {
      loadSavingsGoals();
    }
  }, [selectedType, user?.id]);

  const loadCategories = async () => {
    if (!user?.id) return;
    
    setLoadingCategories(true);
    try {
      console.log('🔧 Loading categories directly from Supabase...');
      
      // First get the Supabase user by Clerk ID
      const supabaseUser = await getSupabaseUserByClerkId(user.id);
      if (!supabaseUser) {
        throw new Error('User not found in Supabase. Please sign in again.');
      }
      
      // Map UI transaction types to category types
      let categoryType;
      switch (selectedType) {
        case 'income':
          categoryType = 'income';
          break;
        case 'expense':
          categoryType = 'expense';
          break;
        case 'savings':
          categoryType = 'savings';
          break;
        case 'debt_given':
        case 'debt_received':
          categoryType = 'debt';
          break;
        default:
          categoryType = 'expense';
      }
      
      // Direct Supabase query using proper UUID
      let query = supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${supabaseUser.id},user_id.is.null,is_default.eq.true`)
        .order('is_default', { ascending: false })
        .order('name_tn', { ascending: true });

      if (categoryType) {
        query = query.eq('type', categoryType);
      }

      const { data: userCategories, error } = await query;

      if (error) {
        console.error('Error getting user categories:', error);
        throw error;
      }

      console.log('📚 Categories loaded:', userCategories);
      setCategories(userCategories || []);
      
      // Reset selected category when changing types
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSavingsGoals = async () => {
    if (!user?.id) return;
    
    setLoadingGoals(true);
    try {
      console.log('🔧 Loading savings goals from Supabase...');
      
      const { data: goals, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_achieved', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting savings goals:', error);
        throw error;
      }

      console.log('📊 Savings goals loaded:', goals);
      setSavingsGoals(goals || []);
      
      // Reset selected goal when loading
      setSelectedGoal(null);
    } catch (error) {
      console.error('Error loading savings goals:', error);
    } finally {
      setLoadingGoals(false);
    }
  };

  // Function to ensure "Account Balance" category exists
  const ensureAccountBalanceCategory = async (): Promise<Category> => {
    if (!user?.id) throw new Error('User not authenticated');
    
    console.log('🔧 Ensuring Account Balance category exists...');
    
    // First, check if the category already exists
    const { data: existingCategories, error: searchError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .eq('name_en', 'Account Balance');
    
    if (searchError) {
      console.error('Error searching for Account Balance category:', searchError);
      throw searchError;
    }
    
    if (existingCategories && existingCategories.length > 0) {
      console.log('✅ Account Balance category already exists:', existingCategories[0]);
      return existingCategories[0];
    }
    
    // Create the Account Balance category
    const categoryData = {
      user_id: user.id,
      name_tn: 'رصيد الحساب',
      name_ar: 'رصيد الحساب',
      name_en: 'Account Balance',
      name_fr: 'Solde du Compte',
      icon: '💰',
      color: '#4ECDC4',
      type: 'income',
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const { data: newCategory, error: createError } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating Account Balance category:', createError);
      throw createError;
    }
    
    console.log('✅ Account Balance category created:', newCategory);
    return newCategory;
  };

  // Helper function to get savings goal display name
  const getSavingsGoalName = (goal: SavingsGoal) => {
    switch (language) {
      case 'tn':
        return goal.title_tn;
      case 'fr':
        return goal.title_fr || goal.title_en || goal.title_tn;
      default:
        return goal.title_en || goal.title_tn;
    }
  };

  // Helper function to get category display name
  const getCategoryName = (category: Category) => {
    return language === 'tn' ? category.name_tn : category.name_en;
  };

  // Helper function to get category emoji/icon
  const getCategoryEmoji = (category: Category) => {
    return category.icon;
  };

  const TRANSACTION_TYPES = [
    { id: 'expense', name: t('add_transaction.transaction_types.expense', language), emoji: '💸', color: '#FF6B6B', bgColor: '#FFE8E8' },
    { id: 'income', name: t('add_transaction.transaction_types.income', language), emoji: '💰', color: '#4ECDC4', bgColor: '#E8F8F7' },
    { id: 'savings', name: t('add_transaction.transaction_types.savings', language), emoji: '🏦', color: '#45B7D1', bgColor: '#E8F4FD' },
    { id: 'debt_given', name: t('add_transaction.transaction_types.debt_given', language), emoji: '📤', color: '#96CEB4', bgColor: '#F0F9F4' },
    { id: 'debt_received', name: t('add_transaction.transaction_types.debt_received', language), emoji: '📥', color: '#FECA57', bgColor: '#FFF8E1' },
  ];
  
  const translateY = useRef(new Animated.Value(DRAWER_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeDrawer();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      openDrawer();
    } else {
      closeDrawer();
    }
  }, [visible]);

  const openDrawer = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: DRAWER_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      resetForm();
    });
  };

  const resetForm = () => {
    setSelectedType('expense');
    setAmount('');
    setSelectedCategory(null);
    setSelectedGoal(null);
    setDescription('');
    setCreditorName('');
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setSelectedCategory(null); // Reset category when type changes
    setSelectedGoal(null); // Reset goal when type changes
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const handleGoalSelect = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setShowGoalsModal(false);
  };

  const validateForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert(t('add_transaction.validation.error_title', language), t('add_transaction.validation.amount_required', language));
      return false;
    }
    
    // For debt transactions, require creditor name instead of category
    if (selectedType === 'debt_given' || selectedType === 'debt_received') {
      if (!creditorName.trim()) {
        Alert.alert(t('add_transaction.validation.error_title', language), 'Creditor name is required for debt transactions');
        return false;
      }
    } else if (selectedType === 'savings') {
      // For savings transactions, require goal selection
      if (!selectedGoal) {
        Alert.alert(t('add_transaction.validation.error_title', language), 'Please select a savings goal');
        return false;
      }
    } else {
      // For expense and income transactions, require category
      if (!selectedCategory) {
        Alert.alert(t('add_transaction.validation.error_title', language), t('add_transaction.validation.category_required', language));
        return false;
      }
    }
    
    if (!description.trim()) {
      Alert.alert(t('add_transaction.validation.error_title', language), t('add_transaction.validation.description_required', language));
      return false;
    }
    return true;
  };

  // Function to update budget spent amount when expense transaction is added
  const updateBudgetSpentAmount = async (userId: string, categoryId: string, transactionAmount: number) => {
    try {
      console.log('🔄 Updating budget spent amount for category:', categoryId);
      
      // Get the current budget for this category
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select('id, amount, spent_amount, start_date, end_date')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .eq('is_active', true);

      if (budgetError) {
        console.error('Error fetching budget:', budgetError);
        return;
      }

      if (!budgets || budgets.length === 0) {
        console.log('ℹ️ No active budget found for category:', categoryId);
        return;
      }

      const budget = budgets[0];
      
      // Instead of just adding the transaction amount, let's recalculate the actual spent amount
      // This ensures accuracy even if there were any data inconsistencies
      const startDate = budget.start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const endDate = budget.end_date || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();
      
      // Calculate the actual spent amount from all transactions
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .eq('type', 'expense')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (transactionError) {
        console.error('Error fetching transactions for budget calculation:', transactionError);
        // Fallback: just add the current transaction amount
        const newSpentAmount = (budget.spent_amount || 0) + transactionAmount;
        await updateBudgetSpentAmountDirect(budget.id, newSpentAmount);
        return;
      }

      // Calculate the total spent amount
      const actualSpentAmount = transactions?.reduce((sum, transaction) => sum + Number(transaction.amount), 0) || 0;
      
      // Update the budget with the accurate spent amount
      const { error: updateError } = await supabase
        .from('budgets')
        .update({ 
          spent_amount: actualSpentAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', budget.id);

      if (updateError) {
        console.error('Error updating budget spent amount:', updateError);
        return;
      }

      console.log('✅ Budget spent amount updated successfully:', {
        budgetId: budget.id,
        previousSpent: budget.spent_amount || 0,
        newSpent: actualSpentAmount,
        transactionAmount
      });

      // Check if budget is exceeded and show warning
      if (actualSpentAmount > budget.amount) {
        const overage = actualSpentAmount - budget.amount;
        Alert.alert(
          t('common.warning', language) || '⚠️ Warning',
          t('budget.budget_exceeded', language)?.replace('{amount}', `${overage.toFixed(2)} TND`) || 
          `Budget exceeded by ${overage.toFixed(2)} TND! 🚨`,
          [{ text: t('common.ok', language) || 'OK' }]
        );
      }

    } catch (error) {
      console.error('Error updating budget spent amount:', error);
    }
  };

  // Helper function for direct budget update (fallback)
  const updateBudgetSpentAmountDirect = async (budgetId: string, newSpentAmount: number) => {
    const { error } = await supabase
      .from('budgets')
      .update({ 
        spent_amount: newSpentAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', budgetId);

    if (error) {
      console.error('Error in direct budget update:', error);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('🔄 Submitting transaction...', {
        userId: user.id,
        type: selectedType,
        amount: parseFloat(amount),
        description,
        creditorName: selectedType === 'debt_given' || selectedType === 'debt_received' ? creditorName : undefined,
        categoryId: selectedCategory?.id,
        date,
      });

      // Check if this is a debt transaction
      if (selectedType === 'debt_given' || selectedType === 'debt_received') {
        // Use DebtService to create comprehensive debt record matching the new schema
        const debtType = selectedType === 'debt_given' ? 'given' : 'received';
        
        // For debt transactions, use the provided creditor name
        const finalCreditorName = selectedType === 'debt_given' ? 
          (user.firstName || 'Me') : creditorName;
        const finalDebtorName = selectedType === 'debt_given' ? 
          creditorName : (user.firstName || 'Me');

        // Map to new schema fields with proper constraints
        const debtData = {
          user_id: user.id,
          category_id: null, // No category for debt transactions
          creditor_name: finalCreditorName,
          debtor_name: finalDebtorName,
          debt_type: selectedType === 'debt_given' ? 'owed_to_me' as const : 'i_owe' as const,
          type: debtType as 'given' | 'received',
          original_amount: parseFloat(amount),
          remaining_amount: parseFloat(amount),
          amount: parseFloat(amount),
          currency: 'TND' as const, // Must match currency constraint
          interest_rate: 0,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 30 days from now
          debt_date: new Date(date).toISOString().split('T')[0],
          description_tn: description,
          description_ar: description,
          description_en: description,
          description_fr: description,
          payment_frequency: 'one_time' as const, // Must match frequency constraint
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          minimum_payment: DebtService.calculateMinimumPayment(parseFloat(amount)),
          is_settled: false,
          priority: DebtService.calculatePriority(parseFloat(amount)) as 'low' | 'medium' | 'high', // Must match priority constraint
          status: 'active' as const, // Must match status constraint
        };
        
        console.log('🔄 Creating comprehensive debt using new schema:', debtData);
        
        const debt = await DebtService.createDebt(debtData);

        console.log('✅ Comprehensive debt created successfully:', debt);
      } else if (selectedType === 'savings') {
        // Savings transaction - update selected goal and create transaction with Account Balance category
        if (!selectedGoal) {
          throw new Error('Savings goal is required for savings transactions');
        }

        // Ensure Account Balance category exists
        const accountBalanceCategory = await ensureAccountBalanceCategory();

        // Update the savings goal
        const newCurrentAmount = selectedGoal.current_amount + parseFloat(amount);
        const isAchieved = newCurrentAmount >= selectedGoal.target_amount;

        const { error: goalUpdateError } = await supabase
          .from('savings_goals')
          .update({
            current_amount: newCurrentAmount,
            is_achieved: isAchieved,
            achievement_date: isAchieved ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedGoal.id);

        if (goalUpdateError) {
          console.error('Error updating savings goal:', goalUpdateError);
          throw goalUpdateError;
        }

        // Create transaction with Account Balance category (as income to increase balance)
        const transactionData = {
          user_id: user.id,
          category_id: accountBalanceCategory.id,
          type: 'income', // Treat savings as income to increase account balance
          amount: parseFloat(amount),
          currency: 'TND',
          description_tn: `${description} (${getSavingsGoalName(selectedGoal)})`,
          description_en: `${description} (${getSavingsGoalName(selectedGoal)})`,
          transaction_date: new Date(date).toISOString(),
          recurring: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        console.log('🔄 Inserting savings transaction:', transactionData);
        
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .insert(transactionData)
          .select(`
            *,
            category:categories(*)
          `)
          .single();

        if (transactionError) {
          console.error('Supabase savings transaction error:', transactionError);
          throw transactionError;
        }

        console.log('✅ Savings transaction created and goal updated successfully:', {
          transaction,
          goalId: selectedGoal.id,
          newAmount: newCurrentAmount,
          achieved: isAchieved
        });

        // Show achievement message if goal was achieved
        if (isAchieved && !selectedGoal.is_achieved) {
          Alert.alert(
            '🎉 ' + (t('goals.congratulations', language) || 'Congratulations!'),
            (t('goals.goal_achieved', language) || 'You have achieved your savings goal!').replace('{goal}', getSavingsGoalName(selectedGoal)),
            [{ text: t('common.ok', language) || 'OK' }]
          );
        }
      } else if (selectedType === 'income') {
        // Income transaction - use selected category
        if (!selectedCategory) {
          throw new Error('Category is required for income transactions');
        }

        const transactionData = {
          user_id: user.id,
          category_id: selectedCategory.id,
          type: 'income',
          amount: parseFloat(amount),
          currency: 'TND',
          description_tn: description,
          description_en: description,
          transaction_date: new Date(date).toISOString(),
          recurring: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        console.log('🔄 Inserting income transaction with selected category:', transactionData);
        
        const { data: transaction, error } = await supabase
          .from('transactions')
          .insert(transactionData)
          .select(`
            *,
            category:categories(*)
          `)
          .single();

        if (error) {
          console.error('Supabase income transaction error:', error);
          throw error;
        }

        console.log('✅ Income transaction added with selected category:', transaction);
      } else {
        // Regular transaction - insert into transactions table
        if (!selectedCategory) {
          throw new Error('Category is required for non-debt transactions');
        }

        const dbTransactionType = selectedType === 'savings' ? 'expense' : selectedType;

        const transactionData = {
          user_id: user.id,
          category_id: selectedCategory.id,
          type: dbTransactionType,
          amount: parseFloat(amount),
          currency: 'TND',
          description_tn: description,
          description_en: description,
          transaction_date: new Date(date).toISOString(),
          recurring: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        console.log('🔄 Inserting transaction into transactions table:', transactionData);
        
        const { data: transaction, error } = await supabase
          .from('transactions')
          .insert(transactionData)
          .select(`
            *,
            category:categories(*)
          `)
          .single();

        if (error) {
          console.error('Supabase transaction error:', error);
          throw error;
        }

        console.log('✅ Transaction created successfully:', transaction);

        // Update budget spent amount for expense transactions
        if (selectedType === 'expense') {
          await updateBudgetSpentAmount(user.id, selectedCategory.id, parseFloat(amount));
        }
      }

      Alert.alert(
        t('add_transaction.success.title', language),
        t('add_transaction.success.message', language).replace('{type}', t(`add_transaction.transaction_types.${selectedType}`, language).toLowerCase()),
        [
          {
            text: t('add_transaction.success.ok', language),
            onPress: () => {
              closeDrawer();
              onTransactionCreated?.();
              // Reset form
              setAmount('');
              setDescription('');
              setSelectedCategory(null);
              setSelectedGoal(null);
              setCreditorName('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      Alert.alert(
        t('add_transaction.validation.error_title', language),
        error instanceof Error ? error.message : 'Failed to create transaction. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const currentTypeData = TRANSACTION_TYPES.find(type => type.id === selectedType);

  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={styles.backdropTouch} onPress={closeDrawer} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { textAlign }]}>{t('add_transaction.title', language)}</Text>
          <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Transaction Types */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign }]}>{t('add_transaction.transaction_type', language)}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.typeScrollView}
              nestedScrollEnabled={true}
              scrollEnabled={true}
            >
              <View style={styles.typeContainer}>
                {TRANSACTION_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor: selectedType === type.id ? type.bgColor : '#F5F5F5',
                        borderColor: selectedType === type.id ? type.color : '#E0E0E0',
                      },
                    ]}
                    onPress={() => handleTypeSelect(type.id)}
                  >
                    <Text style={styles.typeEmoji}>{type.emoji}</Text>
                    <Text
                      style={[
                        styles.typeText,
                        { 
                          color: selectedType === type.id ? type.color : '#666',
                          textAlign
                        },
                      ]}
                    >
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Amount Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign }]}>{t('add_transaction.amount', language)}</Text>
            <View style={styles.amountContainer}>
              <TextInput
                style={[styles.amountInput, { borderColor: currentTypeData?.color || '#E0E0E0', textAlign }]}
                value={amount}
                onChangeText={setAmount}
                placeholder={t('add_transaction.placeholders.amount', language)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <Text style={styles.currency}>DT</Text>
            </View>
          </View>

          {/* Creditor Name Input - Only for debt transactions */}
          {(selectedType === 'debt_given' || selectedType === 'debt_received') && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { textAlign }]}>
                {selectedType === 'debt_given' 
                  ? t('add_transaction.debtor_name', language) || 'Who owes you?' 
                  : t('add_transaction.creditor_name', language) || 'Who do you owe?'
                }
              </Text>
              <TextInput
                style={[styles.descriptionInput, { borderColor: currentTypeData?.color || '#E0E0E0', textAlign }]}
                value={creditorName}
                onChangeText={setCreditorName}
                placeholder={selectedType === 'debt_given' 
                  ? t('add_transaction.placeholders.debtor_name', language) || 'Enter debtor name...' 
                  : t('add_transaction.placeholders.creditor_name', language) || 'Enter creditor name...'
                }
                placeholderTextColor="#999"
              />
            </View>
          )}

          {/* Category Selection - Only for expense and income transactions (not debt or savings) */}
          {selectedType !== 'debt_given' && selectedType !== 'debt_received' && selectedType !== 'savings' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { textAlign }]}>{t('add_transaction.category', language)}</Text>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  { borderColor: currentTypeData?.color || '#E0E0E0' },
                ]}
                onPress={() => setShowCategoryModal(true)}
              >
                {selectedCategory ? (
                  <View style={styles.selectedCategoryContent}>
                    <Text style={styles.categoryEmoji}>{getCategoryEmoji(selectedCategory)}</Text>
                    <Text style={[styles.categoryText, { textAlign }]}>{getCategoryName(selectedCategory)}</Text>
                  </View>
                ) : (
                  <Text style={[styles.categoryPlaceholder, { textAlign }]}>{t('add_transaction.placeholders.select_category', language)}</Text>
                )}
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Savings Goals Selection - Only for savings transactions */}
          {selectedType === 'savings' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { textAlign }]}>
                {t('add_transaction.savings_goal', language) || 'Savings Goal'}
              </Text>
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  { borderColor: currentTypeData?.color || '#E0E0E0' },
                ]}
                onPress={() => setShowGoalsModal(true)}
              >
                {selectedGoal ? (
                  <View style={styles.selectedCategoryContent}>
                    <Text style={styles.categoryEmoji}>{selectedGoal.icon}</Text>
                    <Text style={[styles.categoryText, { textAlign }]}>{getSavingsGoalName(selectedGoal)}</Text>
                    <Text style={[styles.goalProgress, { textAlign }]}>
                      {selectedGoal.current_amount.toFixed(2)}/{selectedGoal.target_amount.toFixed(2)} DT
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.categoryPlaceholder, { textAlign }]}>
                    {t('add_transaction.placeholders.select_goal', language) || 'Select savings goal...'}
                  </Text>
                )}
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign }]}>{t('add_transaction.description', language)}</Text>
            <TextInput
              style={[styles.descriptionInput, { borderColor: currentTypeData?.color || '#E0E0E0', textAlign }]}
              value={description}
              onChangeText={setDescription}
              placeholder={t(`add_transaction.placeholders.${selectedType}_description`, language)}
              multiline
              placeholderTextColor="#999"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: currentTypeData?.color || '#007AFF' },
              loading && { opacity: 0.6 }
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={[styles.submitButtonText, { textAlign: 'center' }]}>
              {loading 
                ? t('add_transaction.buttons.adding', language) || 'Adding...'
                : t(`add_transaction.buttons.add_${selectedType}`, language)
              }
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Category Selection Modal - Only for expense and income transactions */}
      <Modal visible={showCategoryModal && selectedType !== 'debt_given' && selectedType !== 'debt_received' && selectedType !== 'savings'} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.categoryModal}>
            <View style={styles.categoryModalHeader}>
              <Text style={[styles.categoryModalTitle, { textAlign }]}>{t('add_transaction.choose_category', language)}</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.categoryModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.categoryList}>
              {loadingCategories ? (
                <View style={styles.categoryLoadingContainer}>
                  <Text style={[styles.categoryLoadingText, { textAlign }]}>
                    {t('add_transaction.loading_categories', language) || 'Loading categories...'}
                  </Text>
                </View>
              ) : categories.length > 0 ? (
                categories.map((category: Category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryItem}
                    onPress={() => handleCategorySelect(category)}
                  >
                    <Text style={styles.categoryItemEmoji}>{getCategoryEmoji(category)}</Text>
                    <Text style={[styles.categoryItemText, { textAlign }]}>{getCategoryName(category)}</Text>
                    {selectedCategory?.id === category.id && (
                      <Text style={styles.categoryItemCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.categoryLoadingContainer}>
                  <Text style={[styles.categoryLoadingText, { textAlign }]}>
                    {t('add_transaction.no_categories', language) || 'No categories available'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Savings Goals Selection Modal - Only for savings transactions */}
      <Modal visible={showGoalsModal && selectedType === 'savings'} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.categoryModal}>
            <View style={styles.categoryModalHeader}>
              <Text style={[styles.categoryModalTitle, { textAlign }]}>
                {t('add_transaction.choose_goal', language) || 'Choose Savings Goal'}
              </Text>
              <TouchableOpacity onPress={() => setShowGoalsModal(false)}>
                <Text style={styles.categoryModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.categoryList}>
              {loadingGoals ? (
                <View style={styles.categoryLoadingContainer}>
                  <Text style={[styles.categoryLoadingText, { textAlign }]}>
                    {t('add_transaction.loading_goals', language) || 'Loading goals...'}
                  </Text>
                </View>
              ) : savingsGoals.length > 0 ? (
                savingsGoals.map((goal: SavingsGoal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={styles.categoryItem}
                    onPress={() => handleGoalSelect(goal)}
                  >
                    <Text style={styles.categoryItemEmoji}>{goal.icon}</Text>
                    <View style={styles.goalItemContent}>
                      <Text style={[styles.categoryItemText, { textAlign }]}>{getSavingsGoalName(goal)}</Text>
                      <Text style={[styles.goalItemProgress, { textAlign }]}>
                        {goal.current_amount.toFixed(2)}/{goal.target_amount.toFixed(2)} DT
                      </Text>
                      <View style={styles.goalProgressBar}>
                        <View 
                          style={[
                            styles.goalProgressFill,
                            { 
                              width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%`,
                              backgroundColor: goal.color 
                            }
                          ]} 
                        />
                      </View>
                    </View>
                    {selectedGoal?.id === goal.id && (
                      <Text style={styles.categoryItemCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.categoryLoadingContainer}>
                  <Text style={[styles.categoryLoadingText, { textAlign }]}>
                    {t('add_transaction.no_goals', language) || 'No active savings goals'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: DRAWER_HEIGHT,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  typeScrollView: {
    flexGrow: 0,
  },
  typeContainer: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 85,
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  categoryButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  categoryPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  chevron: {
    fontSize: 18,
    color: '#999',
  },
  descriptionInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  // Category Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '85%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  categoryModalClose: {
    fontSize: 18,
    color: '#666',
  },
  categoryList: {
    maxHeight: 400,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  categoryItemEmoji: {
    fontSize: 20,
    marginRight: 15,
  },
  categoryItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryItemCheck: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  categoryLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLoadingText: {
    fontSize: 16,
    color: '#999',
  },
  // Savings Goals Styles
  goalProgress: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  goalItemContent: {
    flex: 1,
    marginLeft: 10,
  },
  goalItemProgress: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  goalProgressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default AddTransactionDrawerPerfect;