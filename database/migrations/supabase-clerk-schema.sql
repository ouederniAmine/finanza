-- Clerk + Supabase Schema Setup
-- This schema is designed to work with Clerk authentication
-- User IDs will be Clerk user IDs (strings) instead of Supabase UUIDs

-- Drop existing tables if they exist to recreate them
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS savings_goals CASCADE;
DROP TABLE IF EXISTS debts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with Clerk user IDs
CREATE TABLE users (
  id TEXT PRIMARY KEY, -- Clerk user ID (string format like "user_xxxxx")
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  age INTEGER,
  city TEXT,
  profession TEXT,
  monthly_income DECIMAL,
  monthly_savings_goal DECIMAL,
  current_savings DECIMAL,
  main_financial_goal TEXT,
  financial_timeframe TEXT,
  preferred_language TEXT DEFAULT 'ar',
  preferred_currency TEXT DEFAULT 'TND',
  cultural_preferences JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  expense_categories TEXT[] DEFAULT '{}',
  budget_style TEXT DEFAULT 'flexible',
  reminder_time TEXT DEFAULT '20:00',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  type TEXT CHECK (type IN ('income', 'expense')) DEFAULT 'expense',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  payment_method TEXT, -- cash, card, bank_transfer, etc.
  location TEXT,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  period TEXT CHECK (period IN ('weekly', 'monthly', 'yearly')) DEFAULT 'monthly',
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  alert_threshold DECIMAL DEFAULT 0.8, -- Alert when 80% spent
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create savings_goals table
CREATE TABLE savings_goals (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL NOT NULL,
  current_amount DECIMAL DEFAULT 0,
  target_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  description TEXT,
  category TEXT, -- emergency, vacation, car, house, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create debts table
CREATE TABLE debts (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_amount DECIMAL NOT NULL,
  remaining_amount DECIMAL NOT NULL,
  interest_rate DECIMAL DEFAULT 0,
  minimum_payment DECIMAL,
  due_date DATE,
  creditor TEXT,
  debt_type TEXT, -- credit_card, loan, mortgage, etc.
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (true); -- We'll handle auth in the app layer with Clerk

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for other tables
CREATE POLICY "Users can view own categories" ON categories
  FOR ALL USING (true);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR ALL USING (true);

CREATE POLICY "Users can view own budgets" ON budgets
  FOR ALL USING (true);

CREATE POLICY "Users can view own savings goals" ON savings_goals
  FOR ALL USING (true);

CREATE POLICY "Users can view own debts" ON debts
  FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default expense categories
INSERT INTO categories (user_id, name, icon, color, type, is_default) VALUES
('default', 'طعام وشراب', '🍽️', '#FF6B6B', 'expense', true),
('default', 'مواصلات', '🚗', '#4ECDC4', 'expense', true),
('default', 'تسوق', '🛍️', '#45B7D1', 'expense', true),
('default', 'ترفيه', '🎬', '#96CEB4', 'expense', true),
('default', 'صحة', '🏥', '#FFEAA7', 'expense', true),
('default', 'فواتير', '💡', '#DDA0DD', 'expense', true),
('default', 'راتب', '💰', '#6FCF97', 'income', true),
('default', 'عمل حر', '💼', '#BB6BD9', 'income', true);

-- Note: In your application code, when a new user signs up with Clerk:
-- 1. Get the Clerk user ID 
-- 2. Insert a new row in the users table with that ID
-- 3. Copy default categories for that user (replacing 'default' user_id with their actual ID)
