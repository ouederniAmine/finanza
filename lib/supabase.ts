// lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://ejciwznpzmathjedmukv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqY2l3em5wem1hdGhqZWRtdWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5OTI0NjYsImV4cCI6MjA3MDU2ODQ2Nn0.RUQJhBd3rcmVEWZEPOWV5tc1Q43bhxkp62OddU-mf2E';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false, // We're using Clerk, not Supabase auth
    persistSession: false,   // We're using Clerk, not Supabase auth
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Types based on our database schema
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone_number?: string;
  date_of_birth?: string;
  preferred_language: 'tn' | 'ar' | 'fr' | 'en';
  preferred_currency: 'TND' | 'USD' | 'EUR';
  cultural_preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name_tn: string;
  name_ar?: string;
  name_fr?: string;
  name_en?: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id?: string;
  amount: number;
  currency: 'TND' | 'USD' | 'EUR';
  type: 'income' | 'expense' | 'transfer';
  description_tn?: string;
  description_ar?: string;
  description_fr?: string;
  description_en?: string;
  transaction_date: string;
  payment_method?: 'cash' | 'card' | 'bank_transfer' | 'mobile_payment' | 'check';
  location?: string;
  recurring: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id?: string;
  name_tn: string;
  name_ar?: string;
  name_fr?: string;
  name_en?: string;
  amount: number;
  currency: 'TND' | 'USD' | 'EUR';
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  spent_amount: number;
  alert_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title_tn: string;
  title_ar?: string;
  title_fr?: string;
  title_en?: string;
  description_tn?: string;
  description_ar?: string;
  description_fr?: string;
  description_en?: string;
  target_amount: number;
  current_amount: number;
  currency: 'TND' | 'USD' | 'EUR';
  target_date?: string;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  color: string;
  is_achieved: boolean;
  achievement_date?: string;
  auto_save_amount: number;
  auto_save_frequency?: 'daily' | 'weekly' | 'monthly';
  created_at: string;
  updated_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  creditor_name: string;
  debtor_name?: string;
  debt_type: 'owed_to_me' | 'i_owe' | 'loan' | 'credit_card';
  original_amount: number;
  remaining_amount: number;
  currency: 'TND' | 'USD' | 'EUR';
  interest_rate: number;
  due_date?: string;
  description_tn?: string;
  description_ar?: string;
  description_fr?: string;
  description_en?: string;
  payment_frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  next_payment_date?: string;
  minimum_payment: number;
  is_settled: boolean;
  settlement_date?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface NotificationData {
  id: string;
  user_id: string;
  type: 'budget_alert' | 'payment_reminder' | 'goal_milestone' | 'debt_due' | 'financial_tip' | 'achievement';
  title_tn: string;
  title_ar?: string;
  title_fr?: string;
  title_en?: string;
  message_tn: string;
  message_ar?: string;
  message_fr?: string;
  message_en?: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  action_required: boolean;
  action_url?: string;
  scheduled_for: string;
  sent_at?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_date: string;
  reminder_time?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}
