# 🗄️ Complete Supabase Setup Guide for Finanza

> **A comprehensive, step-by-step guide to set up Supabase from scratch for the Finanza personal finance app, including database schema, Row Level Security (RLS), and authentication integration.**

## 📋 Table of Contents

1. [🚀 Quick Overview](#-quick-overview)
2. [🔧 Initial Supabase Setup](#-initial-supabase-setup)
3. [🗄️ Database Schema Setup](#️-database-schema-setup)
4. [🔐 Row Level Security (RLS)](#-row-level-security-rls)
5. [🔑 Authentication Configuration](#-authentication-configuration)
6. [🌍 Environment Configuration](#-environment-configuration)
7. [🧪 Testing Your Setup](#-testing-your-setup)
8. [🔄 Clerk Integration](#-clerk-integration)
9. [📊 Default Data Population](#-default-data-population)
10. [🚀 Production Deployment](#-production-deployment)
11. [🛠️ Troubleshooting](#️-troubleshooting)

---

## 🚀 Quick Overview

**What you'll accomplish:**
- ✅ Create a new Supabase project
- ✅ Set up complete database schema with 7 core tables
- ✅ Configure Row Level Security for data protection
- ✅ Enable authentication providers (Email, Google, Facebook)
- ✅ Set up Clerk + Supabase integration
- ✅ Populate default categories and test data
- ✅ Configure environment variables for the app

**Estimated Setup Time:** 30-45 minutes

---

## 🔧 Initial Supabase Setup

### **Step 1: Create Supabase Account & Project**

1. **Visit Supabase Dashboard**
   ```
   🌐 https://supabase.com/dashboard
   ```

2. **Sign Up/Login**
   - Use GitHub, Google, or email
   - Verify your email if required

3. **Create New Project**
   ```
   ✅ Click "New Project"
   ✅ Organization: Select or create
   ✅ Name: "finanza-production" (or your preferred name)
   ✅ Database Password: Generate strong password (SAVE IT!)
   ✅ Region: Choose closest to your users (e.g., "eu-west-1" for Europe)
   ✅ Pricing Plan: Start with "Free" tier
   ```

4. **Wait for Project Creation**
   - Takes 2-3 minutes
   - You'll see "Setting up your project..." status

### **Step 2: Access Project Dashboard**

Once created, you'll have access to:
- **URL**: `https://[your-project-ref].supabase.co`
- **API Keys**: Available in Settings > API
- **Database**: Direct PostgreSQL access

---

## 🗄️ Database Schema Setup

### **Step 3: Set Up Database Tables**

Navigate to **SQL Editor** in your Supabase dashboard and execute the following schema:

```sql
-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.savings_goals CASCADE;
DROP TABLE IF EXISTS public.debts CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Users table (main user profiles)
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  avatar_url text,
  phone_number text,
  date_of_birth date,
  preferred_language text DEFAULT 'tn'::text CHECK (preferred_language = ANY (ARRAY['tn'::text, 'ar'::text, 'fr'::text, 'en'::text])),
  preferred_currency text DEFAULT 'TND'::text CHECK (preferred_currency = ANY (ARRAY['TND'::text, 'USD'::text, 'EUR'::text])),
  cultural_preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Categories table (income/expense categories)
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  name_tn text NOT NULL,
  name_ar text,
  name_fr text,
  name_en text,
  icon text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['income'::text, 'expense'::text])),
  color text NOT NULL DEFAULT '#3B82F6'::text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Transactions table (all financial transactions)
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  type text NOT NULL CHECK (type = ANY (ARRAY['income'::text, 'expense'::text, 'transfer'::text])),
  description_tn text,
  description_ar text,
  description_fr text,
  description_en text,
  payment_method text CHECK (payment_method = ANY (ARRAY['cash'::text, 'card'::text, 'bank_transfer'::text, 'mobile_payment'::text, 'check'::text])),
  location text,
  recurring boolean DEFAULT false,
  recurring_frequency text CHECK (recurring_frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text, 'yearly'::text])),
  tags text[] DEFAULT ARRAY[]::text[],
  currency text DEFAULT 'TND'::text CHECK (currency = ANY (ARRAY['TND'::text, 'USD'::text, 'EUR'::text])),
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL
);

-- Budgets table (spending budgets)
CREATE TABLE public.budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid,
  name_tn text NOT NULL,
  name_ar text,
  name_fr text,
  name_en text,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  period text NOT NULL CHECK (period = ANY (ARRAY['weekly'::text, 'monthly'::text, 'quarterly'::text, 'yearly'::text])),
  start_date date NOT NULL,
  end_date date NOT NULL,
  currency text DEFAULT 'TND'::text CHECK (currency = ANY (ARRAY['TND'::text, 'USD'::text, 'EUR'::text])),
  spent_amount numeric DEFAULT 0,
  alert_threshold numeric DEFAULT 0.80 CHECK (alert_threshold >= 0::numeric AND alert_threshold <= 1::numeric),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT budgets_pkey PRIMARY KEY (id),
  CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT budgets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE
);

-- Savings Goals table (financial goals)
CREATE TABLE public.savings_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title_tn text NOT NULL,
  title_ar text,
  title_fr text,
  title_en text,
  description_tn text,
  description_ar text,
  description_fr text,
  description_en text,
  target_amount numeric NOT NULL CHECK (target_amount > 0::numeric),
  current_amount numeric DEFAULT 0 CHECK (current_amount >= 0::numeric),
  target_date date,
  achievement_date date,
  currency text DEFAULT 'TND'::text CHECK (currency = ANY (ARRAY['TND'::text, 'USD'::text, 'EUR'::text])),
  priority text DEFAULT 'medium'::text CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  icon text DEFAULT '🎯'::text,
  color text DEFAULT '#10B981'::text,
  is_achieved boolean DEFAULT false,
  auto_save_amount numeric DEFAULT 0,
  auto_save_frequency text CHECK (auto_save_frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT savings_goals_pkey PRIMARY KEY (id),
  CONSTRAINT savings_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Debts table (debt tracking)
CREATE TABLE public.debts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  creditor_name text NOT NULL,
  debtor_name text,
  debt_type text NOT NULL CHECK (debt_type = ANY (ARRAY['owed_to_me'::text, 'i_owe'::text, 'loan'::text, 'credit_card'::text])),
  original_amount numeric NOT NULL CHECK (original_amount > 0::numeric),
  remaining_amount numeric NOT NULL CHECK (remaining_amount >= 0::numeric),
  currency text DEFAULT 'TND'::text CHECK (currency = ANY (ARRAY['TND'::text, 'USD'::text, 'EUR'::text])),
  interest_rate numeric DEFAULT 0 CHECK (interest_rate >= 0::numeric),
  payment_frequency text CHECK (payment_frequency = ANY (ARRAY['weekly'::text, 'monthly'::text, 'quarterly'::text, 'yearly'::text, 'one_time'::text])),
  next_payment_date date,
  due_date date,
  settlement_date date,
  minimum_payment numeric DEFAULT 0,
  description_tn text,
  description_ar text,
  description_fr text,
  description_en text,
  is_settled boolean DEFAULT false,
  priority text DEFAULT 'medium'::text CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT debts_pkey PRIMARY KEY (id),
  CONSTRAINT debts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Notifications table (smart notifications)
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['budget_alert'::text, 'payment_reminder'::text, 'goal_milestone'::text, 'debt_due'::text, 'financial_tip'::text, 'achievement'::text])),
  title_tn text NOT NULL,
  title_ar text,
  title_fr text,
  title_en text,
  message_tn text NOT NULL,
  message_ar text,
  message_fr text,
  message_en text,
  priority text DEFAULT 'medium'::text CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  is_read boolean DEFAULT false,
  action_required boolean DEFAULT false,
  action_url text,
  scheduled_for timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_category ON public.transactions(category_id);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_active ON public.budgets(user_id, is_active);
CREATE INDEX idx_savings_user_id ON public.savings_goals(user_id);
CREATE INDEX idx_debts_user_id ON public.debts(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_categories_user_type ON public.categories(user_id, type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**✅ Execute this SQL script** in the SQL Editor and verify all tables are created successfully.

---

## 🔐 Row Level Security (RLS)

### **Step 4: Enable RLS and Create Policies**

Execute the following SQL to secure your data:

```sql
-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Categories table policies
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Transactions table policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Budgets table policies
CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Savings goals table policies
CREATE POLICY "Users can view own savings goals" ON public.savings_goals
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own savings goals" ON public.savings_goals
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own savings goals" ON public.savings_goals
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own savings goals" ON public.savings_goals
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Debts table policies
CREATE POLICY "Users can view own debts" ON public.debts
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own debts" ON public.debts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own debts" ON public.debts
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own debts" ON public.debts
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Notifications table policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid()::text = user_id::text);
```

---

## 🔑 Authentication Configuration

### **Step 5: Configure Authentication Providers**

1. **Navigate to Authentication > Settings**

2. **Configure Site URL**
   ```
   Site URL: http://localhost:8081 (for development)
   Additional redirect URLs: 
   - https://your-app-domain.com (for production)
   - exp://127.0.0.1:19000 (for Expo development)
   ```

3. **Enable Email Authentication**
   ```
   ✅ Enable email confirmations
   ✅ Enable email change confirmations
   ✅ Disable sign ups (if you want invite-only)
   ```

4. **Configure OAuth Providers**

   **Google OAuth:**
   ```
   ✅ Enable Google provider
   ✅ Client ID: [From Google Cloud Console]
   ✅ Client Secret: [From Google Cloud Console]
   ✅ Redirect URL: https://[your-ref].supabase.co/auth/v1/callback
   ```

   **Facebook OAuth:**
   ```
   ✅ Enable Facebook provider
   ✅ App ID: [From Facebook Developers]
   ✅ App Secret: [From Facebook Developers]
   ✅ Redirect URL: https://[your-ref].supabase.co/auth/v1/callback
   ```

5. **Configure Email Templates**
   - Customize confirmation email for your brand
   - Add your app logo and colors
   - Include Tunisian/Arabic language options

---

## 🌍 Environment Configuration

### **Step 6: Set Up Environment Variables**

1. **Get Your Supabase Keys**
   - Navigate to **Settings > API**
   - Copy the following values:

   ```env
   # Supabase Configuration
   EXPO_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
   
   # Database URLs (for Prisma)
   DATABASE_URL=postgresql://postgres:[password]@db.[your-project-ref].supabase.co:5432/postgres
   DIRECT_URL=postgresql://postgres:[password]@db.[your-project-ref].supabase.co:5432/postgres
   ```

2. **Update Your `.env` File**
   ```bash
   # Copy to your project root
   cp .env.example .env
   
   # Edit with your values
   nano .env
   ```

3. **Verify Environment Loading**
   ```bash
   # Test in your app
   npm start
   ```

---

## 📊 Default Data Population

### **Step 7: Add Default Categories**

Execute this SQL to populate default categories:

```sql
-- Insert default expense categories (global, not user-specific)
INSERT INTO public.categories (user_id, name_tn, name_ar, name_fr, name_en, icon, type, color, is_default) VALUES
-- Essential expenses
(NULL, 'مأكول و مشروب', 'طعام ومشروبات', 'Alimentation', 'Food & Drinks', '🍽️', 'expense', '#FF6B6B', true),
(NULL, 'نقل و مواصلات', 'النقل والمواصلات', 'Transport', 'Transportation', '🚗', 'expense', '#4ECDC4', true),
(NULL, 'سكن', 'إسكان', 'Logement', 'Housing', '🏠', 'expense', '#45B7D1', true),
(NULL, 'صحة', 'الصحة', 'Santé', 'Healthcare', '⚕️', 'expense', '#96CEB4', true),
(NULL, 'تعليم', 'التعليم', 'Éducation', 'Education', '📚', 'expense', '#FFEAA7', true),

-- Lifestyle expenses  
(NULL, 'ترفيه', 'الترفيه', 'Divertissement', 'Entertainment', '🎬', 'expense', '#DDA0DD', true),
(NULL, 'ملابس', 'الملابس', 'Vêtements', 'Clothing', '👕', 'expense', '#F8B4B4', true),
(NULL, 'تسوق', 'التسوق', 'Shopping', 'Shopping', '🛍️', 'expense', '#FFB4E6', true),
(NULL, 'رياضة', 'الرياضة', 'Sport', 'Sports', '⚽', 'expense', '#B4FFB4', true),
(NULL, 'سفر', 'السفر', 'Voyage', 'Travel', '✈️', 'expense', '#87CEEB', true),

-- Financial expenses
(NULL, 'فوائد و ديون', 'الفوائد والديون', 'Intérêts & Dettes', 'Interest & Debts', '💳', 'expense', '#FF9999', true),
(NULL, 'تأمين', 'التأمين', 'Assurance', 'Insurance', '🛡️', 'expense', '#D3D3D3', true),
(NULL, 'ضرائب', 'الضرائب', 'Impôts', 'Taxes', '🏛️', 'expense', '#A9A9A9', true),

-- Income categories
(NULL, 'راتب', 'الراتب', 'Salaire', 'Salary', '💰', 'income', '#10B981', true),
(NULL, 'أعمال حرة', 'العمل الحر', 'Freelance', 'Freelance', '💼', 'income', '#059669', true),
(NULL, 'استثمارات', 'الاستثمارات', 'Investissements', 'Investments', '📈', 'income', '#065F46', true),
(NULL, 'هدايا و مساعدات', 'الهدايا والمساعدات', 'Cadeaux & Aides', 'Gifts & Aid', '🎁', 'income', '#34D399', true),
(NULL, 'أخرى', 'أخرى', 'Autres', 'Other', '💡', 'income', '#6EE7B7', true);
```

---

## 🧪 Testing Your Setup

### **Step 8: Verify Everything Works**

1. **Test Database Connection**
   ```bash
   # In your Finanza project
   npm install
   npx prisma generate
   npx prisma db pull  # Should pull your schema
   ```

2. **Test Authentication**
   ```typescript
   // In your app
   import { supabase } from '@/lib/supabase';
   
   // Test connection
   const { data, error } = await supabase.from('categories').select('*');
   console.log('Categories:', data);
   ```

3. **Test RLS Policies**
   ```sql
   -- In SQL Editor (this should return empty - good!)
   SELECT * FROM users; -- Should require authentication
   ```

4. **Test User Registration**
   ```typescript
   const { data, error } = await supabase.auth.signUp({
     email: 'test@example.com',
     password: 'securepassword123'
   });
   ```

---

## 🔄 Clerk Integration

### **Step 9: Configure Clerk + Supabase Sync**

1. **Set Up Clerk Webhook**
   - In Clerk Dashboard > Webhooks
   - Add endpoint: `https://[your-project].supabase.co/functions/v1/clerk-webhook`
   - Events: `user.created`, `user.updated`, `user.deleted`

2. **Create Supabase Edge Function for Sync**
   ```sql
   -- In SQL Editor, create function for user sync
   CREATE OR REPLACE FUNCTION public.handle_clerk_user_sync()
   RETURNS trigger AS $$
   BEGIN
     -- Insert or update user from Clerk data
     INSERT INTO public.users (
       id, 
       email, 
       full_name, 
       avatar_url,
       created_at,
       updated_at
     ) VALUES (
       NEW.id::uuid,
       NEW.email,
       COALESCE(NEW.full_name, NEW.first_name || ' ' || NEW.last_name),
       NEW.avatar_url,
       NEW.created_at,
       NEW.updated_at
     ) ON CONFLICT (id) DO UPDATE SET
       email = EXCLUDED.email,
       full_name = EXCLUDED.full_name,
       avatar_url = EXCLUDED.avatar_url,
       updated_at = EXCLUDED.updated_at;
     
     RETURN NEW;
   END;
   $$ language 'plpgsql';
   ```

---

## 🚀 Production Deployment

### **Step 10: Production Configuration**

1. **Database Optimization**
   ```sql
   -- Add production indexes
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_date 
   ON public.transactions(user_id, transaction_date DESC);
   
   CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budgets_user_active_period 
   ON public.budgets(user_id, is_active, start_date, end_date) 
   WHERE is_active = true;
   ```

2. **Backup Configuration**
   - Enable automated backups in Supabase Dashboard
   - Set backup retention to 30 days minimum
   - Test backup restoration process

3. **Monitoring Setup**
   - Enable database monitoring
   - Set up alerts for high CPU/memory usage
   - Monitor connection pool usage

4. **Security Hardening**
   ```sql
   -- Revoke unnecessary permissions
   REVOKE ALL ON SCHEMA public FROM anon;
   GRANT USAGE ON SCHEMA public TO anon;
   GRANT SELECT ON public.categories TO anon WHERE is_default = true;
   ```

---

## 🛠️ Troubleshooting

### **Common Issues & Solutions**

#### **🔍 Connection Issues**
```bash
# Problem: "Connection refused"
# Solution: Check your DATABASE_URL format
DATABASE_URL="postgresql://postgres:password@db.ref.supabase.co:5432/postgres?sslmode=require"
```

#### **🔍 RLS Policy Errors**
```sql
-- Problem: "Row level security policy violated"
-- Solution: Check if user is authenticated and policies exist
SELECT auth.uid(); -- Should return UUID, not null
```

#### **🔍 Migration Errors**
```bash
# Problem: "Table already exists"
# Solution: Reset and recreate
npx prisma migrate reset
npx prisma db push
```

#### **🔍 Authentication Errors**
```javascript
// Problem: "Invalid JWT"
// Solution: Check environment variables
console.log(process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
```

### **Performance Optimization**
```sql
-- Add missing indexes for common queries
EXPLAIN ANALYZE SELECT * FROM transactions WHERE user_id = '...' AND transaction_date > '2024-01-01';

-- If slow, add:
CREATE INDEX IF NOT EXISTS idx_transactions_user_date_optimized 
ON transactions(user_id, transaction_date) 
WHERE transaction_date > '2024-01-01';
```

---

## ✅ Final Verification Checklist

Before going live, ensure:

- [ ] **Database Schema**: All 7 tables created successfully
- [ ] **RLS Policies**: All tables secured with proper policies  
- [ ] **Authentication**: Email + OAuth providers working
- [ ] **Default Data**: Categories populated and accessible
- [ ] **Environment Variables**: All keys configured correctly
- [ ] **Clerk Integration**: User sync functioning properly
- [ ] **Performance**: Queries optimized with indexes
- [ ] **Backups**: Automated backups enabled
- [ ] **Monitoring**: Alerts and monitoring configured
- [ ] **Testing**: Full user flow tested end-to-end

---

## 🎉 Congratulations!

Your Supabase setup for Finanza is now complete! You have:

✅ **Secure, scalable database** with Row Level Security  
✅ **Multi-language support** built into the schema  
✅ **Authentication system** ready for production  
✅ **Default categories** for immediate use  
✅ **Clerk integration** for seamless user management  
✅ **Performance optimization** with proper indexing  
✅ **Production-ready configuration** with monitoring  

**Next Steps:**
1. Test the complete user registration and data flow
2. Deploy your Finanza app and connect to this database
3. Monitor performance and optimize as needed
4. Set up automated testing for your database operations

For ongoing maintenance and advanced features, refer to the [Supabase Documentation](https://supabase.com/docs) and the [Finanza Technical Documentation](../TECHNICAL_ARCHITECTURE.md).

---

*This setup guide is part of the Finanza app documentation. For questions or improvements, please refer to the project repository or contact the development team.*
