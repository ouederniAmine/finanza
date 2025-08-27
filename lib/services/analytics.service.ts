// lib/services/analytics.service.ts
import { supabase } from '../supabase';

export interface SpendingData {
  category: string;
  amount: number;
  percentage: number;
  icon: string;
  color: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface AnalyticsData {
  spendingByCategory: SpendingData[];
  monthlyTrends: MonthlyData[];
  totalExpenses: number;
  currentMonth: MonthlyData;
}

export class AnalyticsService {
  /**
   * Get analytics data for a user
   */
  static async getAnalyticsData(userId: string, language: string = 'en'): Promise<AnalyticsData> {
    try {
      console.log('🔄 Fetching analytics data for user:', userId);

      // Fetch transactions for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', userId)
        .gte('transaction_date', sixMonthsAgo.toISOString())
        .order('transaction_date', { ascending: true });

      if (transactionsError) {
        console.error('❌ Error fetching transactions:', transactionsError);
        throw transactionsError;
      }

      console.log('✅ Fetched transactions:', transactions?.length || 0);

      // Calculate spending by category
      const spendingByCategory = this.calculateSpendingByCategory(transactions || [], language);
      
      // Calculate monthly trends
      const monthlyTrends = this.calculateMonthlyTrends(transactions || [], language);
      
      // Calculate totals
      const totalExpenses = spendingByCategory.reduce((sum, item) => sum + item.amount, 0);
      const currentMonth = monthlyTrends[monthlyTrends.length - 1] || {
        month: this.getMonthName(new Date().getMonth(), language),
        income: 0,
        expenses: 0,
        savings: 0
      };

      const analyticsData: AnalyticsData = {
        spendingByCategory,
        monthlyTrends,
        totalExpenses,
        currentMonth
      };

      console.log('✅ Analytics data calculated successfully');
      return analyticsData;
    } catch (error) {
      console.error('❌ Error in getAnalyticsData:', error);
      throw error;
    }
  }

  /**
   * Calculate spending by category
   */
  private static calculateSpendingByCategory(transactions: any[], language: string): SpendingData[] {
    const categorySpending: Record<string, { amount: number; icon: string; color: string }> = {};

    // Group expenses by category
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const categoryName = this.getLocalizedCategoryName(transaction.category, language);
        const categoryIcon = transaction.category?.icon || '💸';
        const categoryColor = transaction.category?.color || '#6B7280';

        if (!categorySpending[categoryName]) {
          categorySpending[categoryName] = {
            amount: 0,
            icon: categoryIcon,
            color: categoryColor
          };
        }
        categorySpending[categoryName].amount += transaction.amount;
      });

    // Calculate total for percentages
    const totalExpenses = Object.values(categorySpending).reduce((sum, cat) => sum + cat.amount, 0);

    // Convert to array and sort by amount
    const spendingArray = Object.entries(categorySpending)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalExpenses > 0 ? Math.round((data.amount / totalExpenses) * 100) : 0,
        icon: data.icon,
        color: data.color
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // Top 6 categories

    return spendingArray;
  }

  /**
   * Calculate monthly trends
   */
  private static calculateMonthlyTrends(transactions: any[], language: string): MonthlyData[] {
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    
    // Generate last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;
      const monthName = this.getMonthName(monthDate.getMonth(), language);
      
      months.push({
        key: monthKey,
        name: monthName,
        month: monthDate.getMonth(),
        year: monthDate.getFullYear()
      });
      
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }

    // Group transactions by month
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      const monthKey = `${transactionDate.getFullYear()}-${transactionDate.getMonth()}`;
      
      if (monthlyData[monthKey]) {
        if (transaction.type === 'income') {
          monthlyData[monthKey].income += transaction.amount;
        } else if (transaction.type === 'expense') {
          monthlyData[monthKey].expenses += transaction.amount;
        }
      }
    });

    // Convert to required format
    return months.map(month => ({
      month: month.name,
      income: monthlyData[month.key].income,
      expenses: monthlyData[month.key].expenses,
      savings: monthlyData[month.key].income - monthlyData[month.key].expenses
    }));
  }

  /**
   * Get localized category name
   */
  private static getLocalizedCategoryName(category: any, language: string): string {
    if (!category) return 'Other';
    
    const nameField = `name_${language}` as keyof typeof category;
    return category[nameField] || category.name_en || category.name_tn || 'Other';
  }

  /**
   * Get localized month name
   */
  private static getMonthName(monthIndex: number, language: string): string {
    const monthNames = {
      en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      tn: ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
      fr: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    };

    return monthNames[language as keyof typeof monthNames]?.[monthIndex] || monthNames.en[monthIndex];
  }
}
