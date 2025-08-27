// lib/services/debt.service.ts
import { supabase } from '../supabase';

export interface DebtData {
  id?: string;
  user_id: string;
  creditor_name: string;
  debtor_name: string | null;
  debt_type: 'owed_to_me' | 'i_owe' | 'loan' | 'credit_card';
  type: 'given' | 'received';
  original_amount: number;
  remaining_amount: number;
  amount: number;
  currency: string;
  interest_rate?: number;
  due_date?: string;
  debt_date: string;
  description_tn?: string;
  description_ar?: string;
  description_en?: string;
  description_fr?: string;
  payment_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  next_payment_date?: string;
  minimum_payment?: number;
  is_settled: boolean;
  settlement_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'paid' | 'cancelled';
  category_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DebtSummary {
  totalOwedToMe: number;
  totalIOwe: number;
  netPosition: number;
  totalDebts: number;
  overdueDebts: number;
  settledDebts: number;
}

export class DebtService {
  /**
   * Create a new debt record
   */
  static async createDebt(debtData: Omit<DebtData, 'id' | 'created_at' | 'updated_at'>): Promise<DebtData> {
    try {
      console.log('🔄 Creating debt:', debtData);

      const { data, error } = await supabase
        .from('debts')
        .insert({
          ...debtData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) {
        console.error('❌ Error creating debt:', error);
        throw error;
      }

      console.log('✅ Debt created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in createDebt:', error);
      throw error;
    }
  }

  /**
   * Get all debts for a user
   */
  static async getDebts(userId: string): Promise<DebtData[]> {
    try {
      console.log('🔄 Fetching debts for user:', userId);

      const { data, error } = await supabase
        .from('debts')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching debts:', error);
        throw error;
      }

      console.log('✅ Debts fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getDebts:', error);
      throw error;
    }
  }

  /**
   * Update a debt record
   */
  static async updateDebt(debtId: string, updates: Partial<DebtData>): Promise<DebtData> {
    try {
      console.log('🔄 Updating debt:', debtId, updates);

      const { data, error } = await supabase
        .from('debts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', debtId)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) {
        console.error('❌ Error updating debt:', error);
        throw error;
      }

      console.log('✅ Debt updated successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in updateDebt:', error);
      throw error;
    }
  }

  /**
   * Mark debt as settled
   */
  static async settleDebt(debtId: string): Promise<DebtData> {
    try {
      console.log('🔄 Settling debt:', debtId);

      const { data, error } = await supabase
        .from('debts')
        .update({
          is_settled: true,
          settlement_date: new Date().toISOString().split('T')[0],
          status: 'paid',
          remaining_amount: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', debtId)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) {
        console.error('❌ Error settling debt:', error);
        throw error;
      }

      console.log('✅ Debt settled successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in settleDebt:', error);
      throw error;
    }
  }

  /**
   * Make a partial payment on a debt
   */
  static async makePayment(debtId: string, paymentAmount: number): Promise<DebtData> {
    try {
      console.log('🔄 Making payment on debt:', debtId, paymentAmount);

      // First get current debt data
      const { data: currentDebt, error: fetchError } = await supabase
        .from('debts')
        .select('*')
        .eq('id', debtId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching current debt:', fetchError);
        throw fetchError;
      }

      const newRemainingAmount = Math.max(0, currentDebt.remaining_amount - paymentAmount);
      const isFullyPaid = newRemainingAmount === 0;

      const updates: Partial<DebtData> = {
        remaining_amount: newRemainingAmount,
        updated_at: new Date().toISOString(),
      };

      if (isFullyPaid) {
        updates.is_settled = true;
        updates.settlement_date = new Date().toISOString().split('T')[0];
        updates.status = 'paid';
      }

      const { data, error } = await supabase
        .from('debts')
        .update(updates)
        .eq('id', debtId)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) {
        console.error('❌ Error making payment:', error);
        throw error;
      }

      console.log('✅ Payment made successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in makePayment:', error);
      throw error;
    }
  }

  /**
   * Delete a debt record
   */
  static async deleteDebt(debtId: string): Promise<void> {
    try {
      console.log('🔄 Deleting debt:', debtId);

      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', debtId);

      if (error) {
        console.error('❌ Error deleting debt:', error);
        throw error;
      }

      console.log('✅ Debt deleted successfully');
    } catch (error) {
      console.error('❌ Error in deleteDebt:', error);
      throw error;
    }
  }

  /**
   * Get debt summary for a user
   */
  static async getDebtSummary(userId: string): Promise<DebtSummary> {
    try {
      console.log('🔄 Calculating debt summary for user:', userId);

      const debts = await this.getDebts(userId);

      const totalOwedToMe = debts
        .filter(d => d.debt_type === 'owed_to_me' && !d.is_settled)
        .reduce((sum, d) => sum + d.remaining_amount, 0);

      const totalIOwe = debts
        .filter(d => d.debt_type === 'i_owe' && !d.is_settled)
        .reduce((sum, d) => sum + d.remaining_amount, 0);

      const netPosition = totalOwedToMe - totalIOwe;

      const totalDebts = debts.filter(d => !d.is_settled).length;
      
      const overdueDebts = debts.filter(d => 
        !d.is_settled && 
        d.due_date && 
        new Date(d.due_date) < new Date()
      ).length;

      const settledDebts = debts.filter(d => d.is_settled).length;

      const summary: DebtSummary = {
        totalOwedToMe,
        totalIOwe,
        netPosition,
        totalDebts,
        overdueDebts,
        settledDebts
      };

      console.log('✅ Debt summary calculated:', summary);
      return summary;
    } catch (error) {
      console.error('❌ Error in getDebtSummary:', error);
      throw error;
    }
  }

  /**
   * Get overdue debts for a user
   */
  static async getOverdueDebts(userId: string): Promise<DebtData[]> {
    try {
      console.log('🔄 Fetching overdue debts for user:', userId);

      const { data, error } = await supabase
        .from('debts')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', userId)
        .eq('is_settled', false)
        .lt('due_date', new Date().toISOString().split('T')[0])
        .order('due_date', { ascending: true });

      if (error) {
        console.error('❌ Error fetching overdue debts:', error);
        throw error;
      }

      console.log('✅ Overdue debts fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error in getOverdueDebts:', error);
      throw error;
    }
  }

  /**
   * Generate smart debt name from description
   */
  static generateDebtNames(description: string, debtType: 'given' | 'received', userName: string): { creditorName: string; debtorName: string | null } {
    const cleanDescription = description.trim();
    const words = cleanDescription.split(' ');
    
    // Try to extract a name from the description
    const potentialName = words.length > 0 ? words[0] : null;
    
    // Capitalize first letter if name exists
    const formattedName = potentialName ? 
      potentialName.charAt(0).toUpperCase() + potentialName.slice(1).toLowerCase() : 
      null;
    
    if (debtType === 'given') {
      return {
        creditorName: userName || 'Me',
        debtorName: formattedName || 'Unknown'
      };
    } else {
      return {
        creditorName: formattedName || 'Unknown',
        debtorName: userName || 'Me'
      };
    }
  }

  /**
   * Calculate smart priority based on amount
   */
  static calculatePriority(amount: number): 'low' | 'medium' | 'high' {
    if (amount > 1000) return 'high';
    if (amount > 500) return 'medium';
    return 'low';
  }

  /**
   * Calculate smart minimum payment (10% of amount, minimum 50 TND)
   */
  static calculateMinimumPayment(amount: number): number {
    return Math.min(50, Math.max(10, amount * 0.1));
  }
}
