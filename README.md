# 🏦 Finanza - Personal Finance App for Tunisia 🇹🇳

[![Expo SDK](https://img.shields.io/badge/Expo%20SDK-53-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-green.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Finanza** is a culturally-aware personal finance management application specifically designed for Tunisian users. Built with **Expo SDK 53**, **React Native**, **TypeScript**, **Clerk Authentication**, and **Supabase**, it offers authentic multilingual support (Tunisian Dialect, Arabic, French, English) with deep cultural awareness and local financial habits understanding.

> 🎯 **Mission**: Empower Tunisian families with a finance app that truly "speaks their language" and understands their cultural context, featuring an animated coin avatar assistant that provides guidance in authentic Tunisian dialect.

## 📱 App Navigation Structure

Finanza features a clean, intuitive **5-tab navigation** designed for optimal user experience:

### **🏠 Home Tab**
- **Dashboard** with financial overview and quick stats
- **Recent transactions** and spending insights  
- **Quick actions** with floating plus button
- **Financial health** indicators and alerts

### **📊 Planning Tab** (Top Tab Navigation)
A comprehensive financial planning hub with three specialized sections:

- **💰 Budgets** - Create, track, and manage spending budgets by category
- **💳 Debts** - Monitor debt payments, track progress, and manage payoff strategies  
- **🎯 Savings** - Set savings goals, track progress, and celebrate milestones

### **📅 Calendar Tab**
- **Transaction calendar** with visual spending patterns
- **Monthly/weekly views** of financial activity
- **Upcoming bills** and payment reminders
- **Historical spending** trends and analysis

### **📈 Analytics Tab**  
- **Spending insights** and category breakdowns
- **Trends analysis** with interactive charts
- **Financial reports** and export capabilities
- **Goal progress** tracking and achievements

### **⚙️ Settings Tab**
- **User profile** and account management
- **Language preferences** (Tunisian, Arabic, French, English)
- **Currency settings** and regional preferences
- **Security settings** and data backup options

## 🚀 Current Implementation Status

### **✅ Recently Completed**
- **Navigation Restructure**: Successfully implemented the new 5-tab layout replacing the previous structure
- **Planning Sub-Navigation**: Added Material Top Tabs for budgets, debts, and savings management
- **Service Layer**: Implemented TypeScript service classes (`TransactionService`, `CategoryService`)
- **Path Configuration**: Set up `@/` path aliases for cleaner imports and better Metro resolution
- **Settings Consolidation**: Unified settings page across main navigation and tab navigation

### **🔧 Technical Improvements**
- **Import Path Resolution**: Fixed Metro bundling issues with absolute path imports
- **TypeScript Integration**: Enhanced type safety across navigation and service layers
- **Component Architecture**: Improved organization with proper component hierarchies
- **Multi-Language Navigation**: Added navigation translations for all supported languages

### **📱 Navigation Implementation Details**
```typescript
// Main tab structure
<Tabs>
  <Tabs.Screen name="index" />      // Home dashboard
  <Tabs.Screen name="planning" />   // Financial planning hub
  <Tabs.Screen name="calendar" />   // Transaction calendar
  <Tabs.Screen name="analytics" />  // Insights & reports
  <Tabs.Screen name="settings" />   // App preferences
</Tabs>

// Planning sub-navigation
<MaterialTopTabs>
  <MaterialTopTabs.Screen name="budgets" />
  <MaterialTopTabs.Screen name="debts" />
  <MaterialTopTabs.Screen name="savings" />
</MaterialTopTabs>
```

### **🎯 Next Implementation Steps**
1. **Dashboard Development**: Complete home screen with financial overview widgets
2. **Transaction Management**: Implement CRUD operations for transactions
3. **Budget System**: Build budget creation and tracking functionality
4. **Savings Goals**: Develop goal setting and progress tracking
5. **Calendar Integration**: Add transaction calendar views and filters

## � Quick Start

### **Prerequisites**
- Node.js 18+ ([Download](https://nodejs.org/))
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (macOS) or Android Studio

### **Setup**
```bash
# Clone and install
git clone https://github.com/nextgen-coding/finanza.git
cd finanza
npm install

# Environment setup (copy example and fill with your keys)
cp .env.example .env
# Edit .env with your actual Clerk and Supabase credentials
# See detailed setup guide below ⬇️

# Start development
npm start
```

### **Launch Options**
- **📱 iOS**: Press `i` (requires macOS + Xcode)
- **🤖 Android**: Press `a` (requires Android Studio)
- **🌐 Web**: Press `w` (runs in browser)

---

## 🗄️ **Complete Supabase Setup Guide**

> **⚡ Set up your own Supabase database from scratch in 30 minutes**

### **🚀 Step 1: Create Supabase Project**

1. **Visit Supabase Dashboard**
   ```
   🌐 https://supabase.com/dashboard
   ```

2. **Create Account & New Project**
   ```
   ✅ Click "New Project"
   ✅ Name: "finanza-production" 
   ✅ Database Password: Generate & SAVE strong password
   ✅ Region: Choose closest to users (e.g., "eu-west-1")
   ✅ Plan: Start with "Free" tier
   ```

3. **Wait for Setup** (2-3 minutes)
   - Project will show "Setting up..." status
   - Once ready, you'll have full dashboard access

### **🗄️ Step 2: Set Up Database Schema**

1. **Navigate to SQL Editor** in your Supabase dashboard

2. **Execute Complete Schema** (copy-paste this SQL):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (main profiles)
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

-- Transactions table (financial transactions)
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

-- Savings Goals table 
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

-- Performance indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_budgets_user_active ON public.budgets(user_id, is_active);
CREATE INDEX idx_savings_user_id ON public.savings_goals(user_id);
CREATE INDEX idx_debts_user_id ON public.debts(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON public.debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **🔐 Step 3: Set Up Row Level Security (RLS)**

Execute this SQL to secure your data:

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Categories policies (allow viewing default categories)
CREATE POLICY "Users can view own/default categories" ON public.categories FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid()::text = user_id::text);

-- Transactions policies
CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL USING (auth.uid()::text = user_id::text);

-- Budgets policies
CREATE POLICY "Users can manage own budgets" ON public.budgets FOR ALL USING (auth.uid()::text = user_id::text);

-- Savings goals policies
CREATE POLICY "Users can manage own savings goals" ON public.savings_goals FOR ALL USING (auth.uid()::text = user_id::text);

-- Debts policies
CREATE POLICY "Users can manage own debts" ON public.debts FOR ALL USING (auth.uid()::text = user_id::text);

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid()::text = user_id::text);
```

### **📊 Step 4: Add Default Categories**

Populate with Tunisian financial categories:

```sql
-- Default expense categories (Tunisian context)
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

-- Financial categories
(NULL, 'فوائد و ديون', 'الفوائد والديون', 'Intérêts & Dettes', 'Interest & Debts', '💳', 'expense', '#FF9999', true),
(NULL, 'تأمين', 'التأمين', 'Assurance', 'Insurance', '🛡️', 'expense', '#D3D3D3', true),

-- Income categories
(NULL, 'راتب', 'الراتب', 'Salaire', 'Salary', '💰', 'income', '#10B981', true),
(NULL, 'أعمال حرة', 'العمل الحر', 'Freelance', 'Freelance', '💼', 'income', '#059669', true),
(NULL, 'استثمارات', 'الاستثمارات', 'Investissements', 'Investments', '📈', 'income', '#065F46', true),
(NULL, 'هدايا و مساعدات', 'الهدايا والمساعدات', 'Cadeaux & Aides', 'Gifts & Aid', '🎁', 'income', '#34D399', true);
```

### **🔑 Step 5: Configure Authentication**

1. **Go to Authentication > Settings**

2. **Set Site URL**
   ```
   Site URL: http://localhost:8081
   Additional redirect URLs:
   - https://your-domain.com
   - exp://127.0.0.1:19000
   ```

3. **Enable Providers**
   ```
   ✅ Email/Password
   ✅ Google OAuth (optional)
   ✅ Facebook OAuth (optional)
   ```

### **🔧 Step 6: Get Your Keys & Configure App**

1. **Get Supabase Keys**
   - Go to **Settings > API** in your Supabase dashboard
   - Copy these values:

2. **Update Your Environment**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit with your actual values
   ```

3. **Fill in `.env` file:**
   ```env
   # Clerk Authentication
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
   
   # Supabase Configuration  
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   # Database URLs
   DATABASE_URL=postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres
   DIRECT_URL=postgresql://postgres:your_password@db.your-project-ref.supabase.co:5432/postgres
   ```

### **🧪 Step 7: Test Your Setup**

```bash
# Install dependencies and test
npm install
npx prisma generate
npx prisma db pull  # Should sync your schema

# Start the app
npm start
```

### **✅ Verification Checklist**

- [ ] **Database**: All 7 tables created successfully
- [ ] **RLS**: Security policies working (users can only see their data)
- [ ] **Categories**: Default categories populated
- [ ] **Authentication**: Login/signup working
- [ ] **Environment**: All keys configured correctly
- [ ] **Connection**: App connects to database successfully

### **🚨 Troubleshooting**

| Issue | Solution |
|-------|----------|
| "Connection refused" | Check DATABASE_URL format and password |
| "Row level security policy violated" | Verify user is authenticated |
| "Table does not exist" | Re-run the schema setup SQL |
| "Invalid JWT" | Check Supabase URL and anon key |

### **📚 Advanced Setup**

For production deployment, monitoring, and advanced features, see our [Complete Supabase Setup Guide](./docs/setup/supabase-setup.md).

---

## 📖 **Complete Documentation**

> **📖 For comprehensive guides, architecture details, and development workflows, visit our [Knowledge Base](./docs/KNOWLEDGE_BASE.md)**

### **🔥 Quick Access**
- **[🚀 Developer Quickstart](./docs/quick-reference/developer-quickstart.md)** - Start coding in 5 minutes
- **[� Navigation Guide](./docs/quick-reference/navigation-guide.md)** - Complete navigation structure reference
- **[�🔧 Environment Setup](./docs/quick-reference/environment-checklist.md)** - Verify everything works
- **[📚 Component Library](./docs/quick-reference/component-cheatsheet.md)** - All UI components
- **[🗄️ Complete Supabase Setup](./docs/setup/supabase-setup.md)** - Database setup from scratch
- **[🗄️ Database Operations](./docs/quick-reference/supabase-reference.md)** - Daily database operations

### **📁 Documentation Structure**
```
docs/
├── 🧠 KNOWLEDGE_BASE.md          ← MAIN ENTRY POINT
├── 📁 quick-reference/           ← < 30 second access
├── 📁 development/               ← Setup & tools
├── 📁 architecture/              ← System design
├── 📁 features/                  ← Feature specifications
├── 📁 design/                    ← UI/UX guidelines
├── 📁 templates/                 ← Ready-to-use code
├── 📁 workflows/                 ← Development processes
└── 📁 troubleshooting/           ← Problem solving
```

## ✨ **Key Features**

### 💰 **Financial Management**
- **Transaction Tracking** with smart categorization
- **Budget Creation & Monitoring** with visual indicators  
- **Savings Goals** with milestone celebrations
- **Debt Management** for loans and bill reminders

### 🌍 **Cultural Integration**
- **Tunisian Dialect** - Authentic local expressions
- **Arabic RTL Support** - Proper right-to-left layout
- **Cultural Calendar** - Ramadan budgeting, Eid planning
- **Local Context** - Understanding Tunisian financial habits

### 🎨 **User Experience**
- **Finanza Avatar** - Animated coin character guide
- **Dark/Light Themes** - System preference detection
- **Haptic Feedback** - Tactile interaction responses
- **Cross-Platform** - iOS, Android, and Web support

## 🛠️ **Technology Stack**

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Expo SDK 53 + React Native | Cross-platform mobile |
| **Language** | TypeScript | Type safety |
| **Styling** | NativeWind (Tailwind) | Consistent design |
| **Auth** | Clerk | User authentication |
| **Database** | Supabase | PostgreSQL with real-time |
| **State** | Zustand + TanStack Query | State management |
| **Navigation** | Expo Router | File-based routing |

## 🏗️ **Project Structure**

```
📁 Finanza/
├── 📱 app/                    # Screens (Expo Router)
│   ├── 🔐 auth/              # Authentication flow
│   ├── 🎯 onboarding/        # User setup
│   └── 📊 (tabs)/            # Main navigation
├── 🎨 components/            # Reusable UI components  
├── 🔧 lib/                   # Core business logic
├── 🌍 assets/                # Images, fonts, icons
├── 🎯 hooks/                 # Custom React hooks
├── 📚 docs/                  # Complete documentation
├── 🗄️ database/             # SQL migrations & schemas
└── ⚙️ Configuration files
```

## 🌍 **Supported Languages**

| Language | Code | Usage | Cultural Context |
|----------|------|-------|------------------|
| **🇹🇳 Tunisian Dialect** | `tn` | Primary | Authentic expressions, local humor |
| **🇸🇦 Arabic** | `ar` | Secondary | Standard Arabic with RTL |
| **🇫🇷 French** | `fr` | Business | Common in Tunisian business |
| **🇺🇸 English** | `en` | International | Fallback language |

### **Cultural Example Messages**
```javascript
"Ahla w sahla ya [username]!"              // Welcome!
"Ya sahbi, khalik maana nrakhou el budget!" // Buddy, let's organize the budget!
"El but mte3na wsel! Mabrouk!"             // Our goal is reached! Congratulations!
```

## 🗺️ **Development Status**

### **✅ Completed**
- [x] Project foundation (Expo + TypeScript)
- [x] Authentication system (Clerk)
- [x] Database setup (Supabase)
- [x] Multi-language support (4 languages)
- [x] Navigation structure
- [x] Component library & theming

### **🚧 In Progress**
- [ ] Transaction CRUD operations
- [ ] Budget creation and tracking
- [ ] Dashboard with financial overview
- [ ] Savings goals management

### **📋 Planned**
- [ ] Smart notifications in Tunisian dialect
- [ ] Receipt OCR and photo capture
- [ ] Financial insights and analytics
- [ ] Offline mode support

## 🤝 **Contributing**

We welcome contributions from developers who understand Tunisian culture!

### **How to Contribute**
1. **Fork** the repository
2. **Read** our [Development Guide](./docs/development/)
3. **Create** a feature branch
4. **Follow** our coding standards
5. **Submit** a pull request

### **Types of Contributions**
- 🌍 **Translations**: Improve Tunisian dialect
- 💻 **Code**: Features, bug fixes, performance
- 📚 **Documentation**: Guides, tutorials, examples
- 🎨 **Design**: UI/UX improvements

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support & Resources**

- 📚 **Full Documentation**: [Knowledge Base](./docs/KNOWLEDGE_BASE.md)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/nextgen-coding/finanza/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/nextgen-coding/finanza/discussions)
- 📧 **Contact**: For sensitive issues, email maintainers

---

**🎯 Ready to build the future of Tunisian financial management? Start with our [Developer Quickstart](./docs/quick-reference/developer-quickstart.md)!**
- **Multi-currency Support** with primary focus on Tunisian Dinar (TND)

### 🌍 **Cultural & Language Integration**
- **Authentic Tunisian Dialect** throughout the entire app interface
- **RTL (Right-to-Left) Support** for Arabic text rendering
- **Cultural Calendar** integration for Tunisian holidays and financial planning
- **Local Financial Habits** understanding (e.g., Ramadan budgeting, Eid expenses)
- **Smart Notifications** with culturally appropriate timing and messaging

### 🎨 **User Experience**
- **Finanza Coin Avatar** - Animated assistant with expressive emotions
- **Modern Material Design** with clean, intuitive interface
- **Haptic Feedback** for enhanced user interaction
- **Dark/Light Theme** support with system preference detection
- **Pixel-perfect Onboarding** with beautiful carousel showcasing features

### � **Smart Features**
- **AI-powered Categorization** for automatic expense classification
- **Smart Notifications** with Tunisian dialect messages
- **Budget Alerts** with cultural context ("راك قريب تكمّل الميزانية!")
- **Goal Celebrations** with local expressions ("مبروك! وصلت للهدف!")
- **Financial Insights** in authentic Tunisian Arabic

## 🛠️ Technology Stack

### **Frontend Architecture**
| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | Expo SDK | 53.0.20 | Cross-platform development |
| **Runtime** | React Native | 0.79.5 | Native mobile performance |
| **Language** | TypeScript | 5.8.3 | Type safety and developer experience |
| **Navigation** | Expo Router | 5.1.4 | File-based routing system |
| **Styling** | NativeWind | 4.1.23 | Tailwind CSS for React Native |

### **Backend & Data**
| Service | Technology | Purpose |
|---------|------------|---------|
| **Authentication** | Clerk | User auth, OAuth, session management |
| **Database** | Supabase | PostgreSQL with real-time subscriptions |
| **Storage** | Supabase Storage | File uploads (receipts, avatars) |
| **API** | Supabase Edge Functions | Serverless backend logic |

### **State & Data Management**
| Layer | Technology | Purpose |
|-------|------------|---------|
| **UI State** | Zustand | Lightweight global state management |
| **Server State** | TanStack Query | Data fetching, caching, synchronization |
| **Local Storage** | Expo SecureStore | Encrypted local data persistence |
| **Auth State** | Clerk SDK | Authentication state management |

### **Development Tools**
- **ESLint** - Code quality and consistency
- **TypeScript** - Compile-time error prevention
- **Metro** - JavaScript bundling and hot reload
- **EAS Build** - Cloud-based app compilation
- **Expo Dev Client** - Custom development builds

## 🏗️ Project Architecture

```
📁 Finanza/
├── 📱 app/                           # Application screens (Expo Router)
│   ├── 🔧 _layout.tsx                # Root layout with Clerk + theme providers
│   ├── 🏠 index.tsx                  # Auth gate & routing logic
│   ├── ❌ +not-found.tsx             # 404 error handling
│   │
│   ├── 🔐 auth/                      # Authentication flow (Clerk)
│   │   ├── 👋 welcome.tsx            # 4-slide onboarding carousel
│   │   ├── 📧 sign-in.tsx            # Email + OAuth login
│   │   ├── ✍️ sign-up.tsx            # Registration with verification
│   │   ├── 🔑 forgot-password.tsx    # Password reset flow
│   │   └── ✅ verify-email.tsx       # Email verification
│   │
│   ├── 🎯 onboarding/                # User setup & preferences
│   │   ├── 🏆 welcome.tsx            # New user introduction
│   │   ├── 👤 profile-setup.tsx     # Personal information
│   │   ├── 💰 financial-goals.tsx   # Financial planning setup
│   │   └── ⚙️ preferences.tsx       # App settings & language
│   │
│   └── 📊 (tabs)/                    # Main navigation tabs
│       ├── 🏗️ _layout.tsx            # Tab bar configuration
│       ├── 🏠 index.tsx              # Dashboard (Balance, Overview)
│       ├── 💳 transactions.tsx       # Transaction history
│       ├── 📈 budgets.tsx            # Budget creation & tracking
│       ├── 📅 calendar.tsx           # Financial calendar view
│       ├── 🎯 savings.tsx            # Savings goals management
│       ├── 💸 debts.tsx              # Debt tracking (optional tab)
│       ├── 👤 profile.tsx            # User profile & settings
│       └── ➕ add-transaction.tsx    # Quick transaction entry
│
├── 🎨 components/                    # Reusable UI components
│   ├── 🧩 ui/                        # Core design system
│   │   ├── 🔤 IconSymbol.tsx         # Cross-platform icon system
│   │   └── 📱 TabBarBackground.tsx   # Custom tab styling
│   ├── ➕ AddTransactionDrawer.tsx   # Transaction input modal
│   ├── 🔘 PlusButton.tsx            # Floating action button
│   ├── 📊 ThemedText.tsx            # Typography with theme support
│   ├── 🎭 ThemedView.tsx            # Containers with theme support
│   ├── 👋 HelloWave.tsx             # Animated greeting
│   └── 📜 ParallaxScrollView.tsx    # Parallax scroll container
│
├── 🔧 lib/                           # Core business logic
│   ├── 🌍 locales/                   # Translation files
│   │   ├── 🇹🇳 tn.json              # Tunisian dialect (primary)
│   │   ├── 🇸🇦 ar.json              # Standard Arabic (RTL)
│   │   ├── 🇫🇷 fr.json              # French
│   │   └── 🇺🇸 en.json              # English
│   ├── 🌐 i18n.ts                   # Internationalization engine
│   ├── 🔐 supabase.ts               # Database client configuration
│   ├── 📦 store.ts                  # Zustand global state
│   ├── 🔄 clerk-supabase-sync.ts    # User synchronization logic
│   ├── 🛡️ auth-utils-clerk.ts       # Clerk authentication helpers
│   └── 🛡️ auth-utils.ts             # Legacy auth utilities
│
├── 🎨 assets/                        # Static resources
│   ├── 🔤 fonts/                     # Custom typography
│   │   └── SpaceMono-Regular.ttf    # Monospace font
│   └── 🖼️ images/                    # App icons & illustrations
│       ├── icon.png                 # App icon (1024x1024)
│       ├── adaptive-icon.png        # Android adaptive icon
│       ├── splash-icon.png          # Splash screen
│       └── favicon.png              # Web favicon
│
├── 🎯 hooks/                         # Custom React hooks
│   ├── 🎨 useColorScheme.ts         # Theme detection
│   ├── 🌐 useI18n.ts                # Internationalization hook
│   └── 🎨 useThemeColor.ts          # Color management
│
├── 📏 constants/                     # App configuration
│   └── 🎨 Colors.ts                 # Theme color definitions
│
├── 📚 docs/                          # Comprehensive documentation
│   ├── 📋 PROJECT_SPECIFICATION.md  # Complete project overview
│   ├── 🏗️ TECHNICAL_ARCHITECTURE.md # System design
│   ├── 🎨 ui-ux-design-system.md   # Design guidelines
│   ├── 🌍 LOCALIZATION.md          # Translation guide
│   ├── 🛡️ SECURITY.md              # Security measures
│   └── 🚀 DEPLOYMENT.md            # Build & deployment
│
├── ⚙️ Configuration Files
│   ├── 📦 package.json              # Dependencies & scripts
│   ├── 🔧 app.json                  # Expo configuration
│   ├── 📝 tsconfig.json             # TypeScript settings
│   ├── 🎨 tailwind.config.js        # NativeWind styling
│   └── 🔍 eslint.config.js          # Code quality rules
│
└── 🌐 Environment & Setup
    ├── 🔐 .env                      # Environment variables
    ├── 📄 .gitignore               # Git ignore rules
    └── 📖 README.md                # This documentation
```

### **Key Architecture Decisions**

1. **File-based Routing**: Expo Router provides intuitive navigation structure
2. **Clerk + Supabase**: Best-in-class auth with powerful database
3. **NativeWind**: Tailwind CSS productivity with native performance
4. **TypeScript**: Complete type safety for scalable development
5. **Modular Components**: Reusable UI building blocks
├── app.json                     # Expo app configuration
├── eslint.config.js             # ESLint configuration
├── expo-env.d.ts               # Expo TypeScript definitions
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```
│   │   └── SpaceMono-Regular.ttf
│   └── images/                  # App icons and images
│       ├── icon.png             # App icon (1024x1024)
│       ├── adaptive-icon.png    # Android adaptive icon
│       ├── favicon.png          # Web favicon
│       ├── splash-icon.png      # Splash screen icon
│       └── react-logo*.png      # Placeholder images
├── components/                   # Reusable UI components
│   ├── ui/                      # Platform-specific UI components
│   │   ├── IconSymbol.tsx       # Cross-platform icon system
│   │   └── TabBarBackground.tsx # Custom tab bar styling
│   ├── Collapsible.tsx          # Animated collapsible content
│   ├── ExternalLink.tsx         # External link handler
│   ├── HapticTab.tsx            # Tab with haptic feedback
│   ├── HelloWave.tsx            # Animated welcome wave
│   ├── ParallaxScrollView.tsx   # Parallax scroll container
│   ├── ThemedText.tsx           # Theme-aware text component
│   └── ThemedView.tsx           # Theme-aware view component
├── constants/                    # Application constants
│   └── Colors.ts                # Light/dark theme colors
├── hooks/                        # Custom React hooks
│   ├── useColorScheme.ts        # System color scheme detection
│   ├── useColorScheme.web.ts    # Web-specific color scheme
│   └── useThemeColor.ts         # Theme color management
├── lib/                          # Core application logic
│   ├── locales/                 # Internationalization files
│   │   ├── tn.json              # Tunisian dialect translations
│   │   ├── ar.json              # Arabic translations
│   │   ├── fr.json              # French translations
│   │   └── en.json              # English translations
│   ├── i18n.ts                  # Internationalization setup
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Utility functions
├── scripts/                      # Development scripts
│   └── reset-project.js         # Project reset utility
├── .gitignore                   # Git ignore rules
├── app.json                     # Expo configuration
├── eslint.config.js             # ESLint configuration
├── expo-env.d.ts               # Expo environment types
├── package.json                 # Dependencies and scripts
├── README.md                    # Project documentation
└── tsconfig.json               # TypeScript configuration
```

## 🚀 Quick Start Guide

### **Prerequisites**
Ensure you have the following installed:
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Expo CLI**: `npm install -g @expo/cli`
- **iOS Simulator** (macOS) or **Android Studio** (for emulator)

### **Installation Steps**

1. **Clone the repository**
   ```bash
   git clone https://github.com/nextgen-coding/finanza.git
   cd finanza
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment setup**
   Create a `.env` file in the root directory:
   ```env
   # Clerk Authentication
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
   
   # Supabase Configuration  
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Start development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

5. **Launch on your preferred platform**
   - **📱 iOS**: Press `i` in terminal (requires macOS + Xcode)
   - **🤖 Android**: Press `a` in terminal (requires Android Studio)
   - **🌐 Web**: Press `w` in terminal (runs in browser)

### **Development Commands**

| Command | Purpose |
|---------|---------|
| `npm start` | Start Expo development server |
| `npm run ios` | Launch iOS simulator |
| `npm run android` | Launch Android emulator |
| `npm run web` | Launch web browser |
| `npm run lint` | Run ESLint code quality checks |
| `npm run reset-project` | Reset to clean project state |

### **First Run Experience**
1. **Welcome Screen**: Beautiful 4-slide onboarding carousel
2. **Language Selection**: Choose from Tunisian, Arabic, French, or English
3. **Sign Up/Sign In**: Create account or login with existing credentials
4. **Profile Setup**: Basic information and financial preferences
5. **Dashboard**: Start managing your finances!

## 📱 App Screens & User Experience

### **🎯 Authentication Flow**
- **Welcome Carousel**: 4 engaging slides showcasing app benefits
- **Sign In/Up**: Email + password or OAuth (Google, Facebook)
- **Email Verification**: Secure account confirmation
- **Password Reset**: Easy recovery process

### **� Main Application**
- **Dashboard**: Financial overview with quick actions
- **Transactions**: Add/edit expenses and income with categories
- **Budgets**: Create monthly budgets with progress tracking
- **Calendar**: Financial calendar with cultural events
- **Savings**: Set and track financial goals
- **Debts**: Manage loans and bills (optional tab)
- **Profile**: Settings, preferences, and account management

### **🎨 Design Highlights**
- **Finanza Avatar**: Animated coin character with Tunisian personality
- **Cultural Colors**: Violet primary (#7F56D9), Orange secondary (#FFA94D)
- **Material Design**: Clean, modern interface with native feel
- **Haptic Feedback**: Tactile responses for better interaction
- **Dark/Light Themes**: Automatic system preference detection

## 🌍 Internationalization & Cultural Features

### **Supported Languages**
| 🌐 Language | 🔤 Code | 🎯 Usage | 📝 Notes |
|-------------|---------|----------|----------|
| **🇹🇳 Tunisian Dialect** | `tn` | Primary | Authentic expressions, local humor |
| **🇸🇦 Arabic** | `ar` | Secondary | Standard Arabic with RTL support |
| **🇫🇷 French** | `fr` | Secondary | Common in Tunisia business |
| **🇺🇸 English** | `en` | International | Fallback and international users |

### **Cultural Integration Examples**
```javascript
// Authentic Tunisian Dialect Messages
"Ahla w sahla ya [username]!"              // Welcome!
"Ya sahbi, khalik maana nrakhou el budget!" // Buddy, let's organize the budget!
"Yezzi mel masrouf, yalla yalla!"          // Enough spending, come on!
"El but mte3na wsel! Mabrouk!"             // Our goal is reached! Congratulations!
"Rak 3andek factora tkhalles!"             // You have a bill to pay!
"Finanza t9oulek: wakt el idikhar!"        // Finanza tells you: saving time!
```

### **RTL (Right-to-Left) Support**
- Automatic layout direction for Arabic text
- Mirrored navigation and UI elements
- Cultural-appropriate date and number formatting
- Seamless language switching without app restart

### **Adding New Translations**
1. Navigate to `lib/locales/`
2. Add your key to all language files:
   ```json
   {
     "dashboard": {
       "welcome": "Your translation here"
     }
   }
   ```
3. Use in components: `t('dashboard.welcome', language)`

## 🎨 Design System & Branding

### **Color Palette**
```typescript
// Brand Colors
const colors = {
  primary: '#7F56D9',      // Violet - Trust, intelligence
  secondary: '#FFA94D',    // Orange - Energy, warmth
  success: '#10B981',      // Green - Savings, achievements
  warning: '#F59E0B',      // Yellow - Budget alerts
  danger: '#EF4444',       // Red - Debts, overspending
  neutral: '#6B7280',      // Gray - Secondary text
}
```

### **Typography System**
- **Primary Font**: Inter (supports Arabic + Latin scripts)
- **Arabic Font**: Noto Sans Arabic for RTL text
- **Display Font**: Poppins for headings and emphasis
- **Monospace**: SpaceMono for numbers and codes

### **Finanza Avatar Character**
The app features an animated gold coin avatar that:
- 👀 **Expresses emotions** based on financial status
- 🗣️ **Speaks Tunisian dialect** in notifications
- 🎭 **Shows different moods**: happy (savings), concerned (overspending), excited (goals)
- 🤲 **Gestures and guides** users through the app

### **Component System**
- **ThemedText**: Automatic light/dark theme adaptation
- **ThemedView**: Theme-aware containers
- **IconSymbol**: Cross-platform icon system
- **HapticTab**: Tab navigation with tactile feedback

## 🏗️ Technical Architecture

### **Navigation Architecture**
```mermaid
graph TD
    A[App Entry] --> B[Tab Layout]
    B --> C[Home Tab]
    B --> D[Planning Tab]
    B --> E[Calendar Tab]
    B --> F[Analytics Tab]
    B --> G[Settings Tab]
    
    D --> H[MaterialTopTabs]
    H --> I[Budgets Screen]
    H --> J[Debts Screen] 
    H --> K[Savings Screen]
    
    C --> L[Dashboard View]
    C --> M[Plus Button Overlay]
```

**Key Navigation Features:**
- **5-Tab Main Navigation**: Home, Planning, Calendar, Analytics, Settings
- **Planning Sub-Navigation**: Material Top Tabs for Budgets/Debts/Savings
- **Contextual Actions**: Floating plus button on home screen
- **Type-Safe Routing**: Expo Router with TypeScript
- **Haptic Feedback**: Enhanced user experience with tactile responses

### **Authentication & Security**
```mermaid
graph LR
    A[User] --> B[Clerk Auth]
    B --> C[Supabase Sync]
    C --> D[User Profile]
    B --> E[OAuth Providers]
    E --> F[Google/Facebook]
```

- **Clerk Authentication**: Enterprise-grade auth with OAuth support
- **User Synchronization**: Automatic Clerk ↔ Supabase user sync
- **Row Level Security**: Database-level access control
- **Secure Storage**: Encrypted local data with Expo SecureStore

### **Data Flow Architecture**
```mermaid
graph TD
    A[React Components] --> B[Zustand Store]
    B --> C[TanStack Query]
    C --> D[Supabase Client]
    D --> E[PostgreSQL Database]
    A --> F[Clerk SDK]
    F --> G[Auth State]
```

### **Key Technical Decisions**

1. **Clerk + Supabase Pattern**
   - Clerk handles authentication complexity
   - Supabase provides powerful database features
   - Best of both worlds for auth and data

2. **Multi-Level Navigation System**
   - Main tabs for primary features
   - Material top tabs for planning subsections
   - Hidden screens for detailed views
   - Seamless navigation with proper state management

3. **NativeWind Styling**
   - Tailwind CSS productivity with `@/` path aliases
   - Native performance optimization
   - Consistent cross-platform design system

4. **TypeScript Everything**
   - Complete type safety across navigation and data layers
   - Better developer experience with IntelliSense
   - Reduced runtime errors with compile-time checks

### **Service Layer Architecture**
```typescript
// Service layer for clean data operations
class TransactionService {
  static async createTransaction(data: TransactionData) {
    // Supabase integration with type safety
  }
}

class CategoryService {
  static async getUserCategories(userId: string) {
    // Cached category retrieval
  }
}
```

### **Performance Optimizations**
- **Lazy Loading**: Route-based code splitting with Expo Router
- **Image Optimization**: Expo Image with smart caching
- **Data Caching**: TanStack Query for server state management
- **Bundle Splitting**: Platform-specific optimizations
- **Path Aliases**: `@/` imports prevent Metro resolution issues

## 🔧 Development Workflow

### **Code Style & Standards**
```typescript
// Component Example with TypeScript
interface TransactionProps {
  amount: number;
  category: string;
  date: Date;
  onEdit?: () => void;
}

export function TransactionCard({ amount, category, date, onEdit }: TransactionProps) {
  const { language } = useUIStore();
  
  return (
    <ThemedView className="p-4 bg-white rounded-lg shadow-sm">
      <ThemedText className="text-lg font-semibold">
        {formatCurrency(amount, 'TND', language)}
      </ThemedText>
      <ThemedText className="text-gray-600">
        {t(`categories.${category}`, language)}
      </ThemedText>
    </ThemedView>
  );
}
```

### **Folder Structure Conventions**
- **PascalCase**: React components (`TransactionCard.tsx`)
- **camelCase**: Utilities and hooks (`useThemeColor.ts`)
- **kebab-case**: Route files (`add-transaction.tsx`)
- **UPPER_CASE**: Constants and environment variables

### **Git Workflow**
```bash
# Feature development
git checkout -b feat/transaction-categories
git commit -m "feat: add transaction category selection"
git push origin feat/transaction-categories

# Bug fixes
git checkout -b fix/budget-calculation
git commit -m "fix: correct budget percentage calculation"

# Documentation
git commit -m "docs: update API documentation"
```

### **Testing Strategy** (Planned)
- **Unit Tests**: Jest + React Native Testing Library
- **Integration Tests**: User flow testing
- **E2E Tests**: Detox for critical user journeys
- **Type Safety**: TypeScript compile-time checks

## 📚 Comprehensive Documentation

Our documentation covers every aspect of the Finanza app development and deployment:

### **📋 Core Documentation**
| Document | Purpose | Content |
|----------|---------|---------|
| **[Project Specification](./docs/PROJECT_SPECIFICATION.md)** | Complete project overview | Features, requirements, Tunisian dialect examples |
| **[Technical Architecture](./docs/TECHNICAL_ARCHITECTURE.md)** | System design | Architecture decisions, data flow, security |
| **[Features Specification](./docs/features-specification.md)** | Detailed features | User stories, acceptance criteria, mockups |

### **🎨 Design & User Experience**
| Document | Purpose | Content |
|----------|---------|---------|
| **[UI/UX Design System](./docs/ui-ux-design-system.md)** | Design guidelines | Colors, typography, Finanza avatar, layouts |
| **[Component Library](./docs/component-library-nativewind.md)** | Component docs | Reusable components, styling patterns |

### **🌍 Localization & Culture**
| Document | Purpose | Content |
|----------|---------|---------|
| **[Localization Guide](./docs/LOCALIZATION.md)** | Translation management | i18n setup, RTL support, cultural adaptations |

### **🛡️ Security & Backend**
| Document | Purpose | Content |
|----------|---------|---------|
| **[Security Documentation](./docs/SECURITY.md)** | Security measures | Data protection, compliance, best practices |
| **[Database Architecture](./docs/database-backend-architecture.md)** | Backend design | Schema, APIs, Supabase configuration |
| **[API Documentation](./docs/API.md)** | API reference | Endpoints, authentication, data models |

### **� Development & Operations**
| Document | Purpose | Content |
|----------|---------|---------|
| **[Development Guide](./docs/DEVELOPMENT.md)** | Dev workflow | Setup, coding standards, best practices |
| **[Testing Strategy](./docs/TESTING.md)** | Quality assurance | Testing approaches, tools, coverage |
| **[Deployment Guide](./docs/DEPLOYMENT.md)** | Release process | Build configuration, app store deployment |

## 🗺️ Development Roadmap

### **✅ Phase 1: Foundation (Completed)**
- [x] Project setup with Expo SDK 53 + TypeScript
- [x] Clerk authentication integration  
- [x] Supabase database configuration
- [x] Multi-language support (4 languages: Tunisian, Arabic, French, English)
- [x] **5-tab navigation structure** (Home, Planning, Calendar, Analytics, Settings)
- [x] **Planning sub-navigation** with Material Top Tabs (Budgets, Debts, Savings)
- [x] Basic UI components and theming with NativeWind
- [x] RTL support for Arabic languages
- [x] Service layer architecture with TypeScript
- [x] Path alias configuration (@/) for clean imports

### **🚧 Phase 2: Core Features (In Progress)**
- [x] User onboarding flow with welcome screens
- [x] Authentication screens (sign in/up/forgot password)
- [x] **Navigation restructure** with planning subsections
- [x] Basic transaction and category service classes
- [ ] **Dashboard implementation** with financial overview
- [ ] **Transaction CRUD operations** with form validation
- [ ] **Budget creation and tracking** in planning tab
- [ ] **Savings goals management** with progress tracking
- [ ] **Calendar view** for transaction history
- [ ] **Analytics dashboard** with charts and insights
- [ ] Data persistence and real-time synchronization

### **📋 Phase 3: Advanced Features (Planned)**
- [ ] Smart notifications with authentic Tunisian dialect
- [ ] Receipt photo capture and OCR processing
- [ ] Recurring transactions and bill reminders
- [ ] Advanced financial insights and trend analysis
- [ ] Data export capabilities (CSV, PDF reports)
- [ ] Offline mode support with local storage
- [ ] **Planning feature enhancements** (debt payoff calculators, savings challenges)

### **🔮 Phase 4: Platform Enhancements (Future)**
- [ ] iOS/Android widgets for quick balance checks
- [ ] Apple Pay / Google Pay integration
- [ ] Biometric authentication (Face ID, Touch ID)
- [ ] AI-powered expense categorization
- [ ] Social features (family budgets, shared goals)
- [ ] Investment tracking and portfolio management

### **🌍 Phase 5: Regional Expansion (Vision)**
- [ ] Morocco and Algeria dialect variants
- [ ] Multi-currency support beyond TND
- [ ] Regional bank integrations and Open Banking APIs
- [ ] Advanced analytics and financial reporting
- [ ] Financial education content in local dialects

## 🛠️ Environment Configuration

### **Required Environment Variables**
Create a `.env` file in your project root:

```env
# Clerk Authentication (Required)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here

# Supabase Configuration (Required)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Error Monitoring
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here

# Optional: Analytics
EXPO_PUBLIC_ANALYTICS_KEY=your_analytics_key_here
```

### **Getting Your Keys**

1. **Clerk Setup**:
   - Visit [clerk.com](https://clerk.com) and create a project
   - Copy the publishable key from your dashboard
   - Configure OAuth providers (Google, Facebook)

2. **Supabase Setup**:
   - Create a project at [supabase.com](https://supabase.com)
   - Find your URL and anon key in project settings
   - Run the SQL schema from `docs/database-backend-architecture.md`

### **Platform-Specific Configuration**

#### iOS Setup
```bash
# Install iOS dependencies
npx pod-install ios

# Configure bundle identifier in app.json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.finanza"
    }
  }
}
```

#### Android Setup
```bash
# Configure package name in app.json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.finanza"
    }
  }
}
```

## 🤝 Contributing to Finanza

We welcome contributions from developers who understand and appreciate Tunisian culture! Here's how you can help:

### **Getting Started**
1. **Fork the repository** on GitHub
2. **Read the documentation** starting with [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md)
3. **Check open issues** or create new ones for bugs/features
4. **Follow our coding standards** and cultural guidelines

### **Types of Contributions**

#### 🌍 **Translation & Localization**
- Improve Tunisian dialect translations
- Add regional variations (Sfax, Sousse, etc.)
- Enhance cultural context and expressions
- Test RTL layout improvements

#### 💻 **Code Contributions**
- Bug fixes and performance improvements
- New features following our roadmap
- UI/UX enhancements
- Test coverage improvements

#### 📚 **Documentation**
- API documentation improvements
- Tutorial and guide creation
- Code examples and snippets
- Translation of docs to Arabic/French

### **Development Workflow**
```bash
# 1. Create a feature branch
git checkout -b feat/savings-goal-celebration

# 2. Make your changes with proper commit messages
git commit -m "feat: add Tunisian celebration animation for savings goals"

# 3. Ensure code quality
npm run lint
npm run type-check

# 4. Push and create pull request
git push origin feat/savings-goal-celebration
```

### **Cultural Guidelines**
- **Respect local customs**: Understand Tunisian financial habits
- **Authentic language**: Use genuine Tunisian expressions
- **Inclusive design**: Consider different user backgrounds
- **Cultural sensitivity**: Be mindful of religious and social contexts

### **Code Standards**
- **TypeScript**: All new code must be in TypeScript
- **Testing**: Add tests for new features
- **Documentation**: Update docs for API changes
- **Accessibility**: Follow accessibility guidelines
- **Performance**: Optimize for mobile devices

## 🐛 Troubleshooting Guide

### **Common Development Issues**

| 🚨 Issue | 💡 Solution |
|----------|-------------|
| **Metro bundler won't start** | `npx expo start --clear` |
| **Environment variables not loading** | Restart dev server after adding `.env` |
| **Clerk authentication errors** | Check publishable key and network connection |
| **Supabase connection issues** | Verify URL and anon key in `.env` |
| **iOS simulator not found** | `sudo xcode-select -s /Applications/Xcode.app` |
| **Android build fails** | Clean and rebuild: `cd android && ./gradlew clean` |
| **TypeScript errors** | `rm -rf node_modules && npm install` |
| **Translation not showing** | Check language code and restart app |

### **Performance Issues**
```bash
# Clear all caches
npx expo start --clear
rm -rf node_modules .expo
npm install

# Reset Metro cache
npx react-native start --reset-cache

# Clear Android build cache
cd android && ./gradlew clean && cd ..
```

### **Getting Help**
- 📚 **Documentation**: Check our comprehensive [`docs/`](./docs/) folder
- 🐛 **Bug Reports**: Create detailed GitHub issues
- 💬 **Discussions**: Join our GitHub Discussions
- 📧 **Direct Contact**: For sensitive issues, email the maintainers

## 🏆 What Makes Finanza Special

### **Cultural Authenticity**
- **Native Tunisian Dialect**: Not just translated Arabic, but authentic local expressions
- **Cultural Financial Habits**: Understanding of local saving patterns and spending behaviors  
- **Religious Considerations**: Respectful of Islamic financial principles
- **Local Events Integration**: Ramadan budgeting, Eid expenses, cultural holidays

### **Technical Excellence**
- **Modern Architecture**: Expo SDK 53 + React Native 0.79 with latest practices
- **Type Safety**: Complete TypeScript implementation for reliable development
- **Performance**: Optimized for mobile devices with smooth animations
- **Cross-Platform**: Native iOS, Android, and web support

### **Security & Privacy**
- **Bank-Grade Security**: Encryption, secure storage, and privacy-first design
- **Local Data Control**: Users maintain control over their financial data
- **Transparent Practices**: Open-source approach with clear privacy policies
- **Compliance Ready**: Designed with future regulatory compliance in mind

### **User Experience**
- **Intuitive Design**: Clean, modern interface following platform conventions
- **Accessibility**: Support for users with different abilities
- **Offline Support**: Core features work without internet connection
- **Smart Notifications**: Contextual and culturally appropriate reminders

## 📊 Project Statistics

```
📁 Source Files: 98 (TypeScript/JavaScript)
📝 Lines of Code: 15,000+ (estimated)
🌍 Languages: 4 (Tunisian, Arabic, French, English)
📱 Platforms: 3 (iOS, Android, Web)
🔧 Dependencies: 50+ (production + development)
� Main Navigation: 5 tabs + 3 planning sub-tabs
�📚 Documentation: 20+ comprehensive guides
🧪 Test Coverage: Target 80%+ (planned)
⭐ Contributors: Open for community
🏗️ Architecture: Modern React Native + TypeScript
```

**Recent Updates:**
- ✅ **Navigation Restructure**: Implemented 5-tab layout with planning sub-navigation
- ✅ **Service Layer**: Added TypeScript service classes for data operations  
- ✅ **Path Aliases**: Configured `@/` imports for cleaner code organization
- ✅ **Multi-level Navigation**: Material Top Tabs for budgets/debts/savings
- ✅ **Documentation**: Enhanced README with current architecture

## 📄 License & Legal

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **Open Source Commitment**
- ✅ Free for personal and commercial use
- ✅ Modify and distribute as needed  
- ✅ Include in proprietary applications
- ✅ No warranty or liability from maintainers

### **Attribution**
When using Finanza code in your projects:
- 📝 Include the original license
- 🔗 Link back to this repository
- 🙏 Credit the Finanza team and contributors

## 📚 Complete Documentation

This README provides a project overview. For comprehensive documentation, visit our **[📖 Documentation Hub](./docs/)**.

### 📋 **Essential Documentation**
| Document | Purpose | Audience |
|----------|---------|----------|
| **[📖 Documentation Index](./docs/INDEX.md)** | Complete navigation guide | Everyone |
| **[⚙️ Development Setup](./docs/DEVELOPMENT.md)** | Development environment setup | Developers |
| **[🗄️ Database Setup](./docs/setup/database-setup.md)** | Database configuration guide | Developers |
| **[🏛️ Technical Architecture](./docs/TECHNICAL_ARCHITECTURE.md)** | System design and architecture | Developers, Architects |
| **[📊 Project Status](./docs/COMPLETION_CHECKLIST.md)** | Current completion status | Project Managers |

### � **Quick Links by Role**
- **👨‍💻 Developers** → [Development Guide](./docs/DEVELOPMENT.md), [API Docs](./docs/API.md), [Setup Guides](./docs/setup/)
- **🎨 Designers** → [Design System](./docs/ui-ux-design-system.md), [Component Library](./docs/component-library-nativewind.md)
- **📊 Product Managers** → [Project Specification](./docs/PROJECT_SPECIFICATION.md), [Features Spec](./docs/features-specification.md)
- **🌍 Localization Team** → [Localization Guide](./docs/LOCALIZATION.md), [i18n Progress](./docs/progress/i18n-progress.md)
- **🚀 DevOps** → [Deployment Guide](./docs/DEPLOYMENT.md), [Security Docs](./docs/SECURITY.md)

### 📊 **Current Project Status**
- **✅ Core Architecture**: Complete (Authentication, Database, Navigation)
- **🔄 Internationalization**: 21.2% complete (14/66 screens translated)
- **🔄 Feature Implementation**: Core financial management features in progress
- **📋 Documentation**: Comprehensive technical documentation complete

---

## �🌟 Acknowledgments & Credits

### **Core Team**
- **Nextgen Coding** - Project architecture and development
- **Tunisian Developer Community** - Cultural insights and feedback
- **Open Source Contributors** - Bug fixes, features, and translations

### **Technology Partners**
- **[Expo](https://expo.dev/)** - Amazing cross-platform development framework
- **[Clerk](https://clerk.com/)** - Best-in-class authentication solution
- **[Supabase](https://supabase.com/)** - Powerful open-source Firebase alternative
- **[Vercel](https://vercel.com/)** - Hosting and deployment platform

### **Design Inspiration**
- **Tunisian Cultural Elements** - Traditional patterns and colors
- **Modern Finance Apps** - International UX best practices  
- **Material Design** - Google's design system principles
- **Apple HIG** - iOS Human Interface Guidelines

### **Community Support**
- **Tunisia Open Source Community** - Local developer insights
- **React Native Community** - Technical guidance and best practices
- **Expo Community** - Platform-specific help and resources

---

## 🚀 Ready to Start?

1. **⭐ Star this repository** if you find it useful
2. **🍴 Fork it** to start contributing  
3. **📖 Read the [complete documentation](./docs/)** for detailed setup and development guides
4. **💬 Join discussions** about features and improvements
5. **🐛 Report issues** to help us improve

---

<div align="center">

### 🇹🇳 Built with ❤️ for the Tunisian Community

**Finanza** - Making financial management accessible, culturally relevant, and genuinely helpful for Tunisian users.

[**📱 Try the App**](https://finanza.app) • [**📚 Complete Documentation**](./docs/) • [**🤝 Contribute**](./CONTRIBUTING.md) • [**💬 Discussions**](https://github.com/nextgen-coding/finanza/discussions)

</div>
