# Finanza - Technical Architecture Document
## Database Design & Backend Specification

---

## 🗄️ **Database Schema Design (Supabase PostgreSQL)**

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  language TEXT DEFAULT 'ar-TN', -- Arabic Tunisian
  voice_preference TEXT DEFAULT 'male', -- male/female
  financial_profile TEXT DEFAULT 'balanced', -- prudent/balanced/spender
  theme_preference TEXT DEFAULT 'auto', -- light/dark/auto
  notification_settings JSONB DEFAULT '{"enabled": true, "frequency": "medium"}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own data" ON users
  FOR ALL USING (auth.uid() = id);
```

### 2. Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income', 'savings', 'debt_payment', 'bill')),
  amount DECIMAL(10,3) NOT NULL, -- Support for millimes
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  is_voice_input BOOLEAN DEFAULT FALSE,
  voice_confidence DECIMAL(3,2), -- 0.00 to 1.00
  location JSONB, -- {lat, lng, address}
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(user_id, category);
CREATE INDEX idx_transactions_type ON transactions(user_id, type);

-- Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);
```

### 3. Budget Table
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: "2025-01"
  total_amount DECIMAL(10,3) NOT NULL,
  categories JSONB NOT NULL, -- {"food": 300, "transport": 200, ...}
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, month_year)
);

-- Row Level Security
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);
```

### 4. Savings Goals Table
```sql
CREATE TABLE savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(10,3) NOT NULL,
  current_amount DECIMAL(10,3) DEFAULT 0,
  deadline DATE,
  monthly_target DECIMAL(10,3),
  is_achieved BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#7F56D9',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own savings goals" ON savings_goals
  FOR ALL USING (auth.uid() = user_id);
```

### 5. Debts Table
```sql
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('i_owe', 'owed_to_me')),
  person_name TEXT NOT NULL,
  person_phone TEXT,
  amount DECIMAL(10,3) NOT NULL,
  original_amount DECIMAL(10,3) NOT NULL,
  description TEXT,
  due_date DATE,
  is_paid BOOLEAN DEFAULT FALSE,
  payment_history JSONB DEFAULT '[]', -- [{"amount": 50, "date": "2025-01-15", "note": "partial"}]
  reminder_frequency TEXT DEFAULT 'weekly', -- daily/weekly/monthly
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own debts" ON debts
  FOR ALL USING (auth.uid() = user_id);
```

### 6. Bills Table
```sql
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "Electricity", "Internet", "Rent"
  company TEXT,
  amount DECIMAL(10,3) NOT NULL,
  due_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT TRUE,
  recurrence_type TEXT DEFAULT 'monthly', -- monthly/quarterly/yearly
  reminder_days INTEGER DEFAULT 3, -- Remind X days before
  auto_pay BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'bills',
  is_paid BOOLEAN DEFAULT FALSE,
  payment_history JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own bills" ON bills
  FOR ALL USING (auth.uid() = user_id);
```

### 7. Notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'budget_alert', 'savings_reminder', 'debt_due', 'motivation'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  message_ar TEXT, -- Tunisian Arabic version
  is_read BOOLEAN DEFAULT FALSE,
  is_sent BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  action_data JSONB, -- Data for click actions
  priority INTEGER DEFAULT 2, -- 1=high, 2=medium, 3=low
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_scheduled ON notifications(user_id, scheduled_for);
CREATE INDEX idx_notifications_unsent ON notifications(is_sent, scheduled_for);

-- Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);
```

### 8. Financial Analytics Table (Computed Values)
```sql
CREATE TABLE financial_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_income DECIMAL(10,3) DEFAULT 0,
  total_expenses DECIMAL(10,3) DEFAULT 0,
  total_savings DECIMAL(10,3) DEFAULT 0,
  category_breakdown JSONB, -- {"food": 300, "transport": 150, ...}
  insights JSONB, -- AI-generated insights
  spending_trend TEXT, -- 'increasing', 'decreasing', 'stable'
  budget_adherence DECIMAL(5,2), -- Percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, period_type, period_start)
);

-- Row Level Security
ALTER TABLE financial_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own analytics" ON financial_analytics
  FOR ALL USING (auth.uid() = user_id);
```

### 9. Finanza Avatar States Table
```sql
CREATE TABLE avatar_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  current_emotion TEXT DEFAULT 'neutral', -- happy, concerned, excited, sleepy
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  interaction_count INTEGER DEFAULT 0,
  personality_traits JSONB DEFAULT '{"friendliness": 0.8, "humor": 0.6}',
  learned_patterns JSONB DEFAULT '{}', -- User behavior patterns
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE avatar_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their avatar state" ON avatar_states
  FOR ALL USING (auth.uid() = user_id);
```

---

## 🔧 **Database Functions & Triggers**

### 1. Automatic Budget Calculation
```sql
CREATE OR REPLACE FUNCTION calculate_monthly_spending()
RETURNS TRIGGER AS $$
BEGIN
  -- Update budget usage when transaction is added/updated/deleted
  UPDATE budgets 
  SET categories = jsonb_set(
    categories,
    ARRAY[NEW.category],
    (COALESCE((categories->>NEW.category)::DECIMAL, 0) + NEW.amount)::TEXT::JSONB
  )
  WHERE user_id = NEW.user_id 
    AND month_year = TO_CHAR(NEW.transaction_date, 'YYYY-MM');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_budget_on_transaction
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION calculate_monthly_spending();
```

### 2. Automatic Savings Goal Progress
```sql
CREATE OR REPLACE FUNCTION update_savings_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'savings' THEN
    -- Update all savings goals proportionally or specific goal
    UPDATE savings_goals 
    SET current_amount = current_amount + NEW.amount,
        updated_at = NOW()
    WHERE user_id = NEW.user_id 
      AND is_achieved = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_savings_on_transaction
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_savings_progress();
```

### 3. Smart Notification Generation
```sql
CREATE OR REPLACE FUNCTION generate_smart_notifications()
RETURNS TRIGGER AS $$
DECLARE
  budget_usage DECIMAL;
  daily_spending DECIMAL;
  avg_daily_budget DECIMAL;
BEGIN
  -- Check for budget overspending
  SELECT 
    COALESCE((categories->>NEW.category)::DECIMAL, 0) / 
    COALESCE((categories->>NEW.category)::DECIMAL, 1) as usage
  INTO budget_usage
  FROM budgets 
  WHERE user_id = NEW.user_id 
    AND month_year = TO_CHAR(NEW.transaction_date, 'YYYY-MM');
  
  -- Generate overspending alert
  IF budget_usage > 0.8 THEN
    INSERT INTO notifications (user_id, type, title, message, message_ar, scheduled_for)
    VALUES (
      NEW.user_id,
      'budget_alert',
      'Budget Alert!',
      'You have spent 80% of your ' || NEW.category || ' budget',
      'تنبيه! صرفت 80% من budget ' || NEW.category,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER smart_notifications_trigger
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION generate_smart_notifications();
```

---

## 📡 **Supabase Real-time Features**

### 1. Real-time Subscriptions
```typescript
// Real-time transaction updates
const transactionSubscription = supabase
  .channel('transactions')
  .on('postgres_changes', 
    { 
      event: '*', 
      schema: 'public', 
      table: 'transactions',
      filter: `user_id=eq.${userId}`
    }, 
    (payload) => {
      // Update UI with new transaction
      handleTransactionUpdate(payload);
    }
  )
  .subscribe();

// Real-time notification delivery
const notificationSubscription = supabase
  .channel('notifications')
  .on('postgres_changes',
    {
      event: 'INSERT',
      schema: 'public', 
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Show push notification
      showNotification(payload.new);
    }
  )
  .subscribe();
```

### 2. Edge Functions for Smart Features

#### Voice Processing Function
```typescript
// supabase/functions/process-voice/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { audioData, userId } = await req.json()
  
  // Process Arabic speech-to-text
  const transcription = await processArabicSpeech(audioData)
  
  // Extract transaction data using NLP
  const transactionData = await extractTransactionData(transcription)
  
  // Save to database
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      ...transactionData,
      is_voice_input: true,
      voice_confidence: transactionData.confidence
    })
  
  return new Response(JSON.stringify({ data, transcription }))
})
```

#### Smart Notification Engine
```typescript
// supabase/functions/notification-engine/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Run every hour via cron
  const users = await getActiveUsers()
  
  for (const user of users) {
    const insights = await analyzeUserFinancials(user.id)
    const notifications = await generatePersonalizedNotifications(user, insights)
    
    for (const notification of notifications) {
      await scheduleNotification(notification)
    }
  }
  
  return new Response("Notifications processed")
})

// Helper functions
async function analyzeUserFinancials(userId: string) {
  // Analyze spending patterns, budget adherence, savings progress
  const spending = await getMonthlySpending(userId)
  const budget = await getCurrentBudget(userId)
  const savings = await getSavingsProgress(userId)
  
  return {
    overspendingCategories: findOverspendingCategories(spending, budget),
    savingsGoalsAtRisk: findGoalsAtRisk(savings),
    spendingTrends: analyzeSpendingTrends(spending),
    recommendations: generateRecommendations(spending, budget, savings)
  }
}

async function generatePersonalizedNotifications(user: any, insights: any) {
  const notifications = []
  
  // Budget alerts in Tunisian dialect
  if (insights.overspendingCategories.length > 0) {
    notifications.push({
      type: 'budget_alert',
      message_ar: `يا ${user.name}! راك قريب تكمّل budget تاع ${insights.overspendingCategories[0]}! 😅`,
      scheduled_for: new Date()
    })
  }
  
  // Savings motivation
  if (insights.savingsGoalsAtRisk.length > 0) {
    notifications.push({
      type: 'savings_reminder', 
      message_ar: `صاحبي! ${insights.savingsGoalsAtRisk[0].name} يحتاج ${insights.savingsGoalsAtRisk[0].needed} دينار باش نوصلوا! 💪`,
      scheduled_for: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours later
    })
  }
  
  return notifications
}
```

---

## 🔐 **Authentication & Security**

### 1. Supabase Auth Configuration
```typescript
// Authentication flow
export const authConfig = {
  providers: ['email'],
  emailConfirmation: true,
  passwordRequirements: {
    minLength: 8,
    requireNumbers: true,
    requireSymbols: false
  },
  sessionTimeout: 7 * 24 * 60 * 60, // 7 days
  mfa: {
    enabled: true,
    apps: ['authenticator']
  }
}

// Row Level Security policies
const rls_policies = {
  users: "auth.uid() = id",
  transactions: "auth.uid() = user_id", 
  budgets: "auth.uid() = user_id",
  savings_goals: "auth.uid() = user_id",
  debts: "auth.uid() = user_id",
  bills: "auth.uid() = user_id",
  notifications: "auth.uid() = user_id"
}
```

### 2. Data Encryption
```typescript
// Client-side encryption for sensitive data
import { encrypt, decrypt } from './encryption'

// Encrypt sensitive transaction descriptions
const encryptedDescription = encrypt(transactionDescription, userKey)

// Store encrypted in database
await supabase.from('transactions').insert({
  description: encryptedDescription,
  // ... other fields
})

// Decrypt when reading
const decryptedDescription = decrypt(transaction.description, userKey)
```

---

## 📊 **Analytics & Performance**

### 1. Performance Monitoring
```typescript
// Database query optimization
const getTransactionsPaginated = async (userId: string, page: number = 1) => {
  const limit = 50
  const offset = (page - 1) * limit
  
  return await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .range(offset, offset + limit - 1)
}

// Caching strategy
const getCachedBudget = async (userId: string, monthYear: string) => {
  const cacheKey = `budget:${userId}:${monthYear}`
  let budget = await cache.get(cacheKey)
  
  if (!budget) {
    budget = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', monthYear)
      .single()
    
    await cache.set(cacheKey, budget, 3600) // Cache for 1 hour
  }
  
  return budget
}
```

### 2. Analytics Tracking
```typescript
// User behavior analytics
const trackUserAction = async (userId: string, action: string, metadata?: any) => {
  await supabase.from('user_analytics').insert({
    user_id: userId,
    action,
    metadata,
    timestamp: new Date().toISOString()
  })
}

// Financial insights generation
const generateMonthlyInsights = async (userId: string) => {
  const monthStart = new Date()
  monthStart.setDate(1)
  
  const transactions = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('transaction_date', monthStart.toISOString())
  
  const insights = {
    totalSpent: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    topCategory: findTopSpendingCategory(transactions),
    savingsRate: calculateSavingsRate(transactions),
    comparedToLastMonth: await compareToLastMonth(userId, transactions)
  }
  
  return insights
}
```

---

## 🔄 **Data Migration & Backup**

### 1. Backup Strategy
```sql
-- Daily backup procedure
CREATE OR REPLACE FUNCTION backup_user_data(backup_user_id UUID)
RETURNS JSON AS $$
DECLARE
  backup_data JSON;
BEGIN
  SELECT json_build_object(
    'user', (SELECT row_to_json(u) FROM users u WHERE id = backup_user_id),
    'transactions', (SELECT array_agg(row_to_json(t)) FROM transactions t WHERE user_id = backup_user_id),
    'budgets', (SELECT array_agg(row_to_json(b)) FROM budgets b WHERE user_id = backup_user_id),
    'savings_goals', (SELECT array_agg(row_to_json(s)) FROM savings_goals s WHERE user_id = backup_user_id),
    'debts', (SELECT array_agg(row_to_json(d)) FROM debts d WHERE user_id = backup_user_id),
    'backup_date', NOW()
  ) INTO backup_data;
  
  RETURN backup_data;
END;
$$ LANGUAGE plpgsql;
```

### 2. Data Export API
```typescript
// Export user data to JSON/CSV
export const exportUserData = async (userId: string, format: 'json' | 'csv') => {
  const userData = await supabase.rpc('backup_user_data', { backup_user_id: userId })
  
  if (format === 'csv') {
    return convertToCSV(userData)
  }
  
  return userData
}

// Import data from other apps
export const importTransactions = async (userId: string, transactions: any[]) => {
  const normalizedTransactions = transactions.map(t => ({
    user_id: userId,
    type: mapTransactionType(t.type),
    amount: parseFloat(t.amount),
    category: mapCategory(t.category),
    description: t.description,
    transaction_date: new Date(t.date).toISOString(),
    created_at: new Date().toISOString()
  }))
  
  return await supabase.from('transactions').insert(normalizedTransactions)
}
```

This technical architecture provides a solid foundation for building the Finanza app with all the intelligent features, real-time capabilities, and scalability needed for a professional financial management application.
