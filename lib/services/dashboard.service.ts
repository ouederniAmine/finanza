// lib/services/dashboard.service.ts
import { supabase } from '../supabase';
import { GoalService } from './goal.service';

export interface DashboardData {
  user: {
    totalBalance: number;
    income: number;
    expenses: number;
    monthlyIncome: number;
    initialBalance: number;
  };
  recentTransactions: any[];
  goals: any[];
  chartData: {
    monthlyIncomeExpenses: {
      income: { label: string; value: number }[];
      expenses: { label: string; value: number }[];
    };
    savingsOverTime: { label: string; value: number }[];
    topExpenseCategories: { label: string; value: number; color: string }[];
    weeklyExpenses: { label: string; value: number }[];
  };
}

export class DashboardService {
  /**
   * Get complete dashboard data for a user
   */
  static async getDashboardData(clerkUserId: string, language: string = 'en'): Promise<DashboardData> {
    try {
      console.log('🔄 Fetching dashboard data for Clerk user:', clerkUserId);

      // First get the Supabase user by Clerk ID
      const { getSupabaseUserByClerkId } = await import('../clerk-supabase-sync');
      const supabaseUser = await getSupabaseUserByClerkId(clerkUserId);
      
      if (!supabaseUser) {
        throw new Error('User not found in Supabase. Please sign in again.');
      }

      const userId = supabaseUser.id;
      console.log('🔄 Using Supabase user ID:', userId);

      // Fetch user basic info
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('cultural_preferences')
        .eq('id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('❌ Error fetching user:', userError);
        throw userError;
      }

      // Fetch initial balance from onboarding
      const { data: onboardingData } = await supabase
        .from('onboarding_steps')
        .select('data')
        .eq('user_id', userId)
        .eq('step_name', 'balance')
        .single();

      let initialBalance = 0;
      if (onboardingData?.data?.amount) {
        initialBalance = parseFloat(onboardingData.data.amount);
      }

      // If user doesn't exist, create a default user object
      const userInfo = user || {
        id: userId,
        current_balance: 0,
        total_balance: 0,
        cultural_preferences: {
          monthly_income: 0
        }
      };

      console.log('✅ User info fetched:', userInfo);

      // Get the last 6 months for chart data
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const startDate = sixMonthsAgo.toISOString().split('T')[0];

      // Fetch transactions with categories
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        // Removed category join due to missing FK (PGRST200); re-add after FK creation
        .select('*')
        .eq('user_id', userId)
        .gte('transaction_date', startDate)
        .order('transaction_date', { ascending: false });

      if (transactionsError) {
        console.error('❌ Error fetching transactions:', transactionsError);
        // Don't throw error for transactions, just use empty array
        console.log('⚠️ Using empty transactions array');
      }

      console.log('✅ Transactions fetched:', transactions?.length || 0);

      // Fetch goals
      let goals: any[] = [];
      try {
        goals = await GoalService.getGoalsByUserId(userId);
        console.log('✅ Goals fetched:', goals.length);
      } catch (error) {
        console.error('❌ Error fetching goals:', error);
        console.log('⚠️ Using empty goals array');
      }

      // Calculate totals
      const totalIncome = (transactions || [])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = (transactions || [])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      // Get monthly income from user's cultural preferences
      const monthlyIncome = userInfo?.cultural_preferences?.monthly_income || 0;
      
      // Calculate total balance: initial balance + monthly income + net transactions balance
      const transactionBalance = totalIncome - totalExpenses;
      const totalBalance = initialBalance + monthlyIncome + transactionBalance;

      // Get recent transactions (last 5)
      const recentTransactions = (transactions || [])
        .slice(0, 5)
        .map(transaction => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          description: this.getLocalizedDescription(transaction, language),
          category: this.getLocalizedCategoryName(transaction.category, language),
          date: this.formatTransactionDate(transaction.transaction_date, language),
          icon: transaction.category?.icon || (transaction.type === 'income' ? '💼' : '🛒'),
        }));

      // Calculate chart data
      const chartData = this.calculateChartData(transactions || [], language);

      // Format goals for dashboard
      const formattedGoals = goals.slice(0, 3).map(goal => ({
        id: goal.id,
        name: this.getLocalizedGoalTitle(goal, language),
        current: goal.current_amount,
        target: goal.target_amount,
        icon: goal.icon,
        color: goal.color,
      }));

      const dashboardData: DashboardData = {
        user: {
          totalBalance,
          income: totalIncome,
          expenses: totalExpenses,
          monthlyIncome,
          initialBalance,
        },
        recentTransactions,
        goals: formattedGoals,
        chartData,
      };

      console.log('✅ Successfully fetched dashboard data');
      return dashboardData;
    } catch (error) {
      console.error('❌ Error in getDashboardData:', error);
      throw error;
    }
  }

  /**
   * Calculate chart data from transactions
   */
  private static calculateChartData(transactions: any[], language: string) {
    console.log('🔄 Calculating chart data for', transactions.length, 'transactions');
    
    const monthNames = this.getMonthNames(language);
    const now = new Date();
    const months = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: monthNames[monthDate.getMonth()],
        month: monthDate.getMonth(),
        year: monthDate.getFullYear(),
      });
    }
    
    console.log('✅ Generated months for chart data:', months.length);

    // Group transactions by month
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    months.forEach(month => {
      const key = `${month.year}-${month.month}`;
      monthlyData[key] = { income: 0, expenses: 0 };
    });

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      const key = `${transactionDate.getFullYear()}-${transactionDate.getMonth()}`;
      
      if (monthlyData[key]) {
        if (transaction.type === 'income') {
          monthlyData[key].income += transaction.amount;
        } else if (transaction.type === 'expense') {
          monthlyData[key].expenses += transaction.amount;
        }
      }
    });

    // Format for charts
    const incomeData = months.map(month => ({
      label: month.label,
      value: monthlyData[`${month.year}-${month.month}`].income,
    }));

    const expensesData = months.map(month => ({
      label: month.label,
      value: monthlyData[`${month.year}-${month.month}`].expenses,
    }));

    // Calculate savings over time
    const savingsData = months.map(month => {
      const monthData = monthlyData[`${month.year}-${month.month}`];
      return {
        label: month.label,
        value: monthData.income - monthData.expenses,
      };
    });

    // Calculate top expense categories
    const expenseCategories: Record<string, { total: number; color: string }> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const categoryName = this.getLocalizedCategoryName(transaction.category, language);
        if (!expenseCategories[categoryName]) {
          expenseCategories[categoryName] = {
            total: 0,
            color: transaction.category?.color || '#6B7280',
          };
        }
        expenseCategories[categoryName].total += transaction.amount;
      });

    const topExpenseCategories = Object.entries(expenseCategories)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 5)
      .map(([label, data]) => ({
        label,
        value: data.total,
        color: data.color,
      }));

    // Calculate weekly expenses (last 7 days)
    const dayNames = this.getDayNames(language);
    const weeklyExpenses = this.calculateWeeklyExpenses(transactions, dayNames);

    const chartData = {
      monthlyIncomeExpenses: {
        income: incomeData,
        expenses: expensesData,
      },
      savingsOverTime: savingsData,
      topExpenseCategories,
      weeklyExpenses,
    };
    
    console.log('✅ Chart data calculated successfully');
    return chartData;
  }

  /**
   * Get localized description for transaction
   */
  private static getLocalizedDescription(transaction: any, language: string): string {
    const descriptionField = `description_${language}` as keyof typeof transaction;
    return transaction[descriptionField] || 
           transaction.description_en || 
           transaction.description_tn || 
           'Transaction';
  }

  /**
   * Get localized day names
   */
  private static getDayNames(language: string): string[] {
    switch (language) {
      case 'tn':
        return ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      case 'fr':
        return ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      default:
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    }
  }

  /**
   * Calculate weekly expenses for the last 7 days
   */
  private static calculateWeeklyExpenses(transactions: any[], dayNames: string[]): { label: string; value: number }[] {
    const now = new Date();
    const weeklyData: Record<number, number> = {};

    // Initialize all days with 0
    for (let i = 0; i < 7; i++) {
      weeklyData[i] = 0;
    }

    // Calculate expenses for each day of the week from last 7 days
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const transactionDate = new Date(transaction.transaction_date);
        const daysDiff = Math.floor((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only include transactions from the last 7 days
        if (daysDiff >= 0 && daysDiff < 7) {
          const dayOfWeek = transactionDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
          weeklyData[dayOfWeek] += transaction.amount;
        }
      });

    // Return data in the format expected by the chart
    return dayNames.map((dayName, index) => ({
      label: dayName,
      value: weeklyData[index] || 0,
    }));
  }

  /**
   * Get localized category name
   */
  private static getLocalizedCategoryName(category: any, language: string): string {
    if (!category) return 'Other';
    
    const nameField = `name_${language}` as keyof typeof category;
    return category[nameField] || 
           category.name_en || 
           category.name_tn || 
           'Other';
  }

  /**
   * Get localized goal title
   */
  private static getLocalizedGoalTitle(goal: any, language: string): string {
    const titleField = `title_${language}` as keyof typeof goal;
    return goal[titleField] || 
           goal.title_en || 
           goal.title_tn || 
           'Goal';
  }

  /**
   * Format transaction date for display
   */
  private static formatTransactionDate(dateString: string, language: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return language === 'tn' ? 'اليوم' : 
             language === 'fr' ? 'Aujourd\'hui' :
             language === 'ar' ? 'اليوم' : 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return language === 'tn' ? 'أمس' :
             language === 'fr' ? 'Hier' :
             language === 'ar' ? 'أمس' : 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get month names for the specified language
   */
  private static getMonthNames(language: string): string[] {
    const monthNames: Record<string, string[]> = {
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      fr: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
      tn: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
      ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
    };
    
    return monthNames[language] || monthNames.en;
  }
}
