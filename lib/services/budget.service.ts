// lib/services/budget.service.ts
import { supabase } from '../supabase';

export interface Budget {
  id: number;
  user_id: string;
  category_id: string;
  name: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  alert_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name_tn: string;
    name_en?: string;
    name_fr?: string;
    name_ar?: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
  };
  spent_amount?: number;
}

export class BudgetService {
  /**
   * Get user's budgets with category details and spending info
   */
  static async getUserBudgets(
    userId: string,
    period: 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Promise<Budget[]> {
    try {
      // Get budgets with category details
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', userId)
        .eq('period', period)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (budgetsError) {
        console.error('Error getting user budgets:', budgetsError);
        throw budgetsError;
      }

      if (!budgets || budgets.length === 0) {
        return [];
      }

      // Calculate spent amounts for each budget
      const budgetsWithSpending = await Promise.all(
        budgets.map(async (budget) => {
          const spentAmount = await this.getBudgetSpentAmount(
            userId,
            budget.category_id,
            budget.start_date,
            budget.end_date
          );
          
          return {
            ...budget,
            spent_amount: spentAmount
          };
        })
      );

      return budgetsWithSpending;
    } catch (error) {
      console.error('Error getting user budgets:', error);
      throw error;
    }
  }

  /**
   * Calculate spent amount for a budget category within date range
   */
  static async getBudgetSpentAmount(
    userId: string,
    categoryId: string,
    startDate: string,
    endDate?: string
  ): Promise<number> {
    try {
      let query = supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .eq('type', 'expense')
        .gte('transaction_date', startDate);

      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error calculating spent amount:', error);
        return 0;
      }

      const totalSpent = data?.reduce((sum, transaction) => sum + Number(transaction.amount), 0) || 0;
      return totalSpent;
    } catch (error) {
      console.error('Error calculating spent amount:', error);
      return 0;
    }
  }

  /**
   * Create a new budget
   */
  static async createBudget(data: {
    userId: string;
    categoryId: string;
    name: string;
    amount: number;
    period?: 'weekly' | 'monthly' | 'yearly';
    alertThreshold?: number;
  }): Promise<Budget> {
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      
      // Calculate end date based on period
      let endDate: string | undefined;
      if (data.period === 'monthly') {
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      } else if (data.period === 'weekly') {
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() + (7 - now.getDay()));
        endDate = weekEnd.toISOString().split('T')[0];
      } else if (data.period === 'yearly') {
        endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      }

      const { data: budget, error } = await supabase
        .from('budgets')
        .insert({
          user_id: data.userId,
          category_id: data.categoryId,
          name: data.name,
          amount: data.amount,
          period: data.period || 'monthly',
          start_date: startDate,
          end_date: endDate,
          alert_threshold: data.alertThreshold || 0.8,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) {
        console.error('Error creating budget:', error);
        throw error;
      }

      return budget;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  }

  /**
   * Update an existing budget
   */
  static async updateBudget(
    budgetId: number,
    userId: string,
    data: Partial<{
      name: string;
      amount: number;
      alertThreshold: number;
      isActive: boolean;
    }>
  ): Promise<Budget> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.alertThreshold !== undefined) updateData.alert_threshold = data.alertThreshold;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;

      const { data: budget, error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', budgetId)
        .eq('user_id', userId)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) {
        console.error('Error updating budget:', error);
        throw error;
      }

      return budget;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  }

  /**
   * Delete a budget
   */
  static async deleteBudget(budgetId: number, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting budget:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  }

  /**
   * Get total spent across all budgets for current month
   */
  static async getTotalMonthlySpent(userId: string): Promise<number> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('transaction_date', startOfMonth)
        .lte('transaction_date', endOfMonth);

      if (error) {
        console.error('Error calculating total monthly spent:', error);
        return 0;
      }

      const totalSpent = data?.reduce((sum, transaction) => sum + Number(transaction.amount), 0) || 0;
      return totalSpent;
    } catch (error) {
      console.error('Error calculating total monthly spent:', error);
      return 0;
    }
  }
}
