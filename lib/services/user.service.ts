// lib/services/user.service.ts
import type { User } from '../supabase';
import { supabase } from '../supabase';

export class UserService {
  /**
   * Sync Clerk user with Supabase database
   * Called when user signs up or signs in
   */
  static async syncClerkUser(clerkUser: any): Promise<User> {
    try {
      const userData = {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        avatar_url: clerkUser.imageUrl,
        phone_number: clerkUser.phoneNumbers[0]?.phoneNumber,
        preferred_language: 'en' as const,
        preferred_currency: 'TND' as const,
        cultural_preferences: {},
        updated_at: new Date().toISOString(),
      };

      // Upsert user - create if doesn't exist, update if exists
      const { data: user, error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Error syncing Clerk user:', error);
        throw error;
      }

      return user;
    } catch (error) {
      console.error('Error syncing Clerk user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID with related data
   */
  static async getUserById(userId: string): Promise<any> {
    try {
      // Get user data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      if (!user) return null;

      // Get categories
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},is_default.eq.true`);

      // Get transactions with category data
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return {
        ...user,
        categories: categories || [],
        transactions: transactions || [],
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: any): Promise<any> {
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Complete onboarding
   */
  static async completeOnboarding(
    userId: string,
    onboardingData: {
      date_of_birth?: string;
      preferred_language?: 'tn' | 'ar' | 'fr' | 'en';
      preferred_currency?: 'TND' | 'USD' | 'EUR';
      cultural_preferences?: Record<string, any>;
    }
  ): Promise<User> {
    try {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          ...onboardingData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error completing onboarding:', error);
        throw error;
      }

      return updatedUser;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }

  /**
   * Create default categories for new user
   */
  static async createDefaultCategories(userId: string): Promise<void> {
    try {
      const defaultCategories = [
        // Income categories
        { 
          name_tn: 'Salaire', 
          name_en: 'Salary',
          name_fr: 'Salaire',
          name_ar: 'راتب',
          icon: '💼', 
          type: 'income' as const, 
          is_default: true,
          color: '#10B981',
        },
        { 
          name_tn: 'Freelance', 
          name_en: 'Freelance',
          name_fr: 'Freelance',
          name_ar: 'عمل حر',
          icon: '💻', 
          type: 'income' as const, 
          is_default: true,
          color: '#10B981',
        },
        { 
          name_tn: 'Business', 
          name_en: 'Business',
          name_fr: 'Commerce',
          name_ar: 'تجارة',
          icon: '🏪', 
          type: 'income' as const, 
          is_default: true,
          color: '#10B981',
        },
        { 
          name_tn: 'Other Income', 
          name_en: 'Other Income',
          name_fr: 'Autres revenus',
          name_ar: 'دخل آخر',
          icon: '💰', 
          type: 'income' as const, 
          is_default: true,
          color: '#10B981',
        },
        
        // Expense categories
        { 
          name_tn: 'Nourriture', 
          name_en: 'Food & Dining',
          name_fr: 'Nourriture',
          name_ar: 'طعام وشراب',
          icon: '🍽️', 
          type: 'expense' as const, 
          is_default: true,
          color: '#EF4444',
        },
        { 
          name_tn: 'Transport', 
          name_en: 'Transportation',
          name_fr: 'Transport',
          name_ar: 'نقل',
          icon: '🚗', 
          type: 'expense' as const, 
          is_default: true,
          color: '#EF4444',
        },
        { 
          name_tn: 'Factures', 
          name_en: 'Bills & Utilities',
          name_fr: 'Factures',
          name_ar: 'فواتير',
          icon: '📄', 
          type: 'expense' as const, 
          is_default: true,
          color: '#EF4444',
        },
        { 
          name_tn: 'Shopping', 
          name_en: 'Shopping',
          name_fr: 'Shopping',
          name_ar: 'تسوق',
          icon: '🛒', 
          type: 'expense' as const, 
          is_default: true,
          color: '#EF4444',
        },
        { 
          name_tn: 'Divertissement', 
          name_en: 'Entertainment',
          name_fr: 'Divertissement',
          name_ar: 'ترفيه',
          icon: '🎮', 
          type: 'expense' as const, 
          is_default: true,
          color: '#EF4444',
        },
        { 
          name_tn: 'Santé', 
          name_en: 'Healthcare',
          name_fr: 'Santé',
          name_ar: 'صحة',
          icon: '🏥', 
          type: 'expense' as const, 
          is_default: true,
          color: '#EF4444',
        },
        { 
          name_tn: 'Éducation', 
          name_en: 'Education',
          name_fr: 'Éducation',
          name_ar: 'تعليم',
          icon: '📚', 
          type: 'expense' as const, 
          is_default: true,
          color: '#EF4444',
        },
        { 
          name_tn: 'Café', 
          name_en: 'Coffee & Drinks',
          name_fr: 'Café et boissons',
          name_ar: 'قهوة ومشروبات',
          icon: '☕', 
          type: 'expense' as const, 
          is_default: true,
          color: '#EF4444',
        },
      ];

      const { error } = await supabase
        .from('categories')
        .insert(
          defaultCategories.map(cat => ({
            ...cat,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
        );

      if (error) {
        console.error('Error creating default categories:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error creating default categories:', error);
      throw error;
    }
  }
}
