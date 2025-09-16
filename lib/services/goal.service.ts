// lib/services/goal.service.ts
import type { SavingsGoal } from '../supabase';
import { supabase } from '../supabase';

export class GoalService {
  /**
   * Get all goals for a user
   * @param clerkUserId - Clerk user ID that will be mapped to Supabase UUID
   */
  static async getGoalsByUserId(clerkUserId: string): Promise<SavingsGoal[]> {
    try {
      console.log('🔄 Fetching goals for Clerk user:', clerkUserId);
      
      // First get the Supabase user by Clerk ID
      const { getSupabaseUserByClerkId } = await import('../clerk-supabase-sync');
      const supabaseUser = await getSupabaseUserByClerkId(clerkUserId);
      
      if (!supabaseUser) {
        throw new Error('User not found in Supabase. Please sign in again.');
      }
      
      console.log('🔄 Fetching goals for Supabase user:', supabaseUser.id);
      
      const { data: goals, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching goals:', error);
        throw error;
      }

      console.log('✅ Successfully fetched goals:', goals?.length || 0);
      return goals || [];
    } catch (error) {
      console.error('❌ Error in getGoalsByUserId:', error);
      throw error;
    }
  }

  /**
   * Create a new goal
   * @param data.userId - Clerk user ID that will be mapped to Supabase UUID
   */
  static async createGoal(data: {
    userId: string;
    titleTn: string;
    titleEn?: string;
    titleFr?: string;
    titleAr?: string;
    descriptionTn?: string;
    descriptionEn?: string;
    descriptionFr?: string;
    descriptionAr?: string;
    targetAmount: number;
    currentAmount?: number;
    currency?: 'TND' | 'USD' | 'EUR';
    targetDate?: string;
    priority?: 'low' | 'medium' | 'high';
    icon?: string;
    color?: string;
    autoSaveAmount?: number;
    autoSaveFrequency?: 'daily' | 'weekly' | 'monthly';
  }): Promise<SavingsGoal> {
    try {
      console.log('🔄 Creating goal with Clerk user ID:', data.userId);
      
      // First get the Supabase user by Clerk ID
      const { getSupabaseUserByClerkId } = await import('../clerk-supabase-sync');
      const supabaseUser = await getSupabaseUserByClerkId(data.userId);
      
      if (!supabaseUser) {
        throw new Error('User not found in Supabase. Please sign in again.');
      }
      
      console.log('🔄 Creating goal for Supabase user:', supabaseUser.id);
      
      const goalData = {
        user_id: supabaseUser.id,
        title_tn: data.titleTn,
        title_en: data.titleEn,
        title_fr: data.titleFr,
        title_ar: data.titleAr,
        description_tn: data.descriptionTn,
        description_en: data.descriptionEn,
        description_fr: data.descriptionFr,
        description_ar: data.descriptionAr,
        target_amount: data.targetAmount,
        current_amount: data.currentAmount || 0,
        currency: data.currency || 'TND',
        target_date: data.targetDate,
        priority: data.priority || 'medium',
        icon: data.icon || '🎯',
        color: data.color || '#667EEA',
        is_achieved: false,
        auto_save_amount: data.autoSaveAmount || 0,
        auto_save_frequency: data.autoSaveFrequency,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('🔄 Inserting into Supabase:', goalData);
      
      const { data: goal, error } = await supabase
        .from('savings_goals')
        .insert(goalData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating goal:', error);
        throw error;
      }

      console.log('✅ Successfully created goal:', goal);
      return goal;
    } catch (error) {
      console.error('❌ Error in createGoal:', error);
      throw error;
    }
  }

  /**
   * Update a goal
   */
  static async updateGoal(
    goalId: string,
    updates: Partial<SavingsGoal>
  ): Promise<SavingsGoal> {
    try {
      console.log('🔄 Updating goal:', goalId, updates);
      
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      const { data: goal, error } = await supabase
        .from('savings_goals')
        .update(updateData)
        .eq('id', goalId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating goal:', error);
        throw error;
      }

      console.log('✅ Successfully updated goal:', goal);
      return goal;
    } catch (error) {
      console.error('❌ Error in updateGoal:', error);
      throw error;
    }
  }

  /**
   * Delete a goal
   */
  static async deleteGoal(goalId: string): Promise<void> {
    try {
      console.log('🔄 Deleting goal:', goalId);
      
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', goalId);

      if (error) {
        console.error('❌ Error deleting goal:', error);
        throw error;
      }

      console.log('✅ Successfully deleted goal:', goalId);
    } catch (error) {
      console.error('❌ Error in deleteGoal:', error);
      throw error;
    }
  }

  /**
   * Add money to a goal (increase current_amount)
   */
  static async addMoneyToGoal(goalId: string, amount: number): Promise<SavingsGoal> {
    try {
      console.log('🔄 Adding money to goal:', goalId, amount);
      
      // First get the current goal
      const { data: currentGoal, error: fetchError } = await supabase
        .from('savings_goals')
        .select('current_amount, target_amount, is_achieved')
        .eq('id', goalId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching current goal:', fetchError);
        throw fetchError;
      }

      if (!currentGoal) {
        throw new Error('Goal not found');
      }

      const newCurrentAmount = Math.min(
        currentGoal.current_amount + amount,
        currentGoal.target_amount
      );

      const isAchieved = newCurrentAmount >= currentGoal.target_amount;

      const updateData: any = {
        current_amount: newCurrentAmount,
        updated_at: new Date().toISOString(),
      };

      if (isAchieved && !currentGoal.is_achieved) {
        updateData.is_achieved = true;
        updateData.achievement_date = new Date().toISOString();
      }

      const { data: goal, error } = await supabase
        .from('savings_goals')
        .update(updateData)
        .eq('id', goalId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating goal amount:', error);
        throw error;
      }

      console.log('✅ Successfully added money to goal:', goal);
      return goal;
    } catch (error) {
      console.error('❌ Error in addMoneyToGoal:', error);
      throw error;
    }
  }
}
