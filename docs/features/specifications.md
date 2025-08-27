# Finanza - Features Specification 🎯

## 🏠 Dashboard (الصفحة الرئيسية)

### Overview Display
```
┌─────────────────────────────────────┐
│  👋 أهلا وسهلا محمد!                │
│  💰 مرحبا بيك في فينانزا             │
├─────────────────────────────────────┤
│  💰 الرصيد الكامل: 2,450 TND       │
│  📊 الميزانية: 800/1500 TND        │
│  💸 المصاريف: 650 TND               │
│  🏦 الإدخار: 1,200 TND              │
│  💳 الديون: 300 TND                 │
└─────────────────────────────────────┘
```

### Financial Cards
- **Solde Total** (الرصيد الكامل)
  - Animation: Counting up effect
  - Color: Green if positive, Red if negative
  - Tap to see breakdown

- **Budget Progress** (تقدم الميزانية)
  - Circular progress bar
  - Colors: Green (good), Orange (warning), Red (over budget)
  - Status message: "ماشي زين! باقيلك 700 دينار للشهر"

- **Savings Goals** (أهداف الإدخار)
  - Multiple goal cards with progress
  - Visual icons for each goal
  - Progress notifications and messages

## 💸 Transaction Management System

### Transaction Types
```typescript
type TransactionType = 
  | 'income'     // دخل
  | 'expense'    // مصروف
  | 'savings'    // ادخار
  | 'debt_given' // دين عطيتو
  | 'debt_received' // دين اخذتو
  | 'bill'       // فاتورة
  | 'transfer';  // تحويل
```

### Categories (Arabic/French)
```typescript
interface Categories {
  income: [
    { id: 'salary', name_ar: 'راتب', name_fr: 'Salaire', icon: '💼' },
    { id: 'freelance', name_ar: 'خدمة حرة', name_fr: 'Freelance', icon: '💻' },
    { id: 'business', name_ar: 'تجارة', name_fr: 'Commerce', icon: '🏪' },
    { id: 'other', name_ar: 'أخرى', name_fr: 'Autre', icon: '💰' }
  ];
  
  expenses: [
    { id: 'food', name_ar: 'ماكلة', name_fr: 'Nourriture', icon: '🍽️' },
    { id: 'transport', name_ar: 'نقل', name_fr: 'Transport', icon: '🚗' },
    { id: 'bills', name_ar: 'فواتير', name_fr: 'Factures', icon: '📄' },
    { id: 'shopping', name_ar: 'تسوق', name_fr: 'Shopping', icon: '🛒' },
    { id: 'entertainment', name_ar: 'ترفيه', name_fr: 'Loisirs', icon: '🎮' },
    { id: 'health', name_ar: 'صحة', name_fr: 'Santé', icon: '🏥' },
    { id: 'education', name_ar: 'تعليم', name_fr: 'Éducation', icon: '📚' },
    { id: 'coffee', name_ar: 'قهوة', name_fr: 'Café', icon: '☕' },
    { id: 'other', name_ar: 'أخرى', name_fr: 'Autre', icon: '💸' }
  ];
}
```

### Quick Add Interface
```
┌─────────────────────────────────────┐
│  💸 زيد مصروف جديد                  │
├─────────────────────────────────────┤
│  💰 المبلغ: [___] TND               │
│  📁 الصنف: [Dropdown] ماكلة         │
│  📝 التفاصيل: [___] غداء في...      │
│  📅 التاريخ: [Today] 28/07/2025     │
│  📷 [صورة الفاتورة]                │
├─────────────────────────────────────┤
│  [❌ Cancel]        [✅ زيد المصروف] │
└─────────────────────────────────────┘
```

## 💰 Budget Management

### Budget Setup
```typescript
interface BudgetSetup {
  monthly_income: number;
  categories: {
    [categoryId: string]: {
      allocated: number;
      spent: number;
      percentage: number;
    }
  };
  automatic_savings: number; // Percentage
  emergency_fund: number;
}
```

### Budget Notifications
```typescript
interface BudgetAlerts {
  percentageSpent50: "راك وصلت نص الميزانية! باقيلك {remaining} TND";
  percentageSpent75: "يا صاحبي! راك قريب تكمل الميزانية، باقيلك {remaining} TND بس!";
  percentageSpent90: "خطر! راك قاعد تجاوز الميزانية! احذر!";
  exceeded: "للأسف راك جزت الميزانية بـ {excess} TND، لازم نوقفوا شوية!";
  
  dailyReminder: "صباح الخير! عندك {remaining} TND باقيين للشهر";
  weeklyReport: "الأسبوع هذا صرفت {amount} TND، {status}";
}
```

### Budget Suggestions
```typescript
interface BudgetSuggestions {
  analyzeSpending(): {
    topCategories: Category[];
    unusualSpending: Transaction[];
    recommendations: string[];
  };
  
  recommendations: [
    "لاحظت انك تصرف برشة على القهوة ({amount} TND)، تحب تحط حد أقصى؟",
    "الشهر الماضي وفرت {amount} TND، تحب تزيد الإدخار؟",
    "فاتورة الكهربا طلعت برشة، ننصحك تتابع الاستهلاك"
  ];
}
```

## 🎯 Savings Goals System

### Goal Types
```typescript
interface SavingsGoal {
  id: string;
  name: string; // "سفر", "كرهبة", "عرس"
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: 'travel' | 'electronics' | 'wedding' | 'emergency' | 'custom';
  priority: 'high' | 'medium' | 'low';
  autoSave: boolean;
  icon: string;
  color: string;
}
```

### Goal Creation Flow
```
Step 1: شنوا تحب تدخر عليه؟
┌─────────────────────────────────────┐
│  🎯 هدف جديد للإدخار               │
├─────────────────────────────────────┤
│  ✈️  سفر                           │
│  📱  كرهبة جديدة                   │
│  💍  عرس                           │
│  🚗  كرهبة                         │
│  🏠  دار                           │
│  💼  مشروع                         │
│  ➕  هدف مخصص                      │
└─────────────────────────────────────┘

Step 2: تفاصيل الهدف
┌─────────────────────────────────────┐
│  📝 اسم الهدف: [سفر إلى دبي]       │
│  💰 المبلغ المطلوب: [____] TND      │
│  📅 التاريخ المستهدف: [____]        │
│  🔄 ادخار تلقائي: [____] TND شهريا  │
└─────────────────────────────────────┘
```

### Progress Visualization
```
┌─────────────────────────────────────┐
│  ✈️ سفر إلى دبي                    │
│  ████████░░  75% مكتمل              │
│  1,500 / 2,000 TND                 │
│  باقي: 500 TND                     │
│  المدة: 3 أشهر                     │
│                                     │
│  📈 في الطريق: +200 TND الشهر الماضي│
│  🎯 لوصول الهدف: 167 TND شهريا     │
│                                     │
│  [💰 زيد مبلغ] [⚙️ Settings]       │
└─────────────────────────────────────┘
```

### Progress Motivation
```typescript
interface SavingsMotivation {
  milestones: {
    25: "يعطيك الصحة! وصلت ربع الطريق للهدف تاعك! 🎉";
    50: "نص الطريق! راك تمشي زين، كمل هكذا! 💪";
    75: "قريب توصل! باقيلك شوية بس! 🔥";
    90: "تقريبا وصلت! كمان شوية وتحقق الحلم! ⭐";
    100: "مبروك! وصلت للهدف! 🎊 وقت تبدا هدف جديد؟";
  };
  
  weeklyEncouragement: [
    "الأسبوع هذا ادخرت {amount} TND، كمل على نفس الوتيرة!",
    "شايف تحسن في الإدخار! راك في الطريق الصحيح!",
    "تحب تشوف طرق جديدة للادخار؟"
  ];
}
```

## 💳 Debt Management

### Debt Types
```typescript
interface Debt {
  id: string;
  type: 'i_owe' | 'owed_to_me'; // انا مديون | مديون لي
  person: string; // اسم الشخص
  company?: string; // شركة
  amount: number;
  originalAmount: number;
  dueDate: Date;
  description: string;
  category: 'personal' | 'bill' | 'loan' | 'business';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  reminderFrequency: 'daily' | 'weekly' | 'monthly';
  paymentPlan: PaymentPlan[];
}

interface PaymentPlan {
  date: Date;
  amount: number;
  paid: boolean;
  note?: string;
}
```

### Debt Dashboard
```
┌─────────────────────────────────────┐
│  💳 إدارة الديون                    │
├─────────────────────────────────────┤
│  🔴 أنا مديون: 850 TND              │
│  │  📄 فاتورة الكهربا: 120 TND      │
│  │  👤 سامي: 200 TND                │
│  │  🏦 قرض البنك: 530 TND           │
│                                     │
│  🟢 مديون لي: 300 TND               │
│  │  👤 أحمد: 150 TND                │
│  │  👤 فاطمة: 150 TND               │
└─────────────────────────────────────┘
```

### Reminder System
```typescript
interface DebtReminders {
  urgentDebt: "عاجل! فاتورة {bill} تخلص اليوم! ({amount} TND)";
  dueSoon: "تذكير: {debt} باقيلها {days} أيام ({amount} TND)";
  overdue: "متأخر! {debt} كان لازم يتخلص من {days} أيام";
  
  collectReminder: "تذكير: {person} مازال ما رجعش {amount} TND";
  paymentReceived: "مبروك! {person} رجع {amount} TND";
  
  motivational: [
    "راك قاعد تخلص الديون زين! كمل هكذا!",
    "بعد ما تخلص {debt}، راح يزيد معاك {amount} TND كل شهر!",
    "قريب تخلص من كل الديون! فرحة كبيرة جايا!"
  ];
}
```

## 📊 Analytics & Reports

### Monthly Report
```
┌─────────────────────────────────────┐
│  📊 تقرير شهر جانفي 2025            │
├─────────────────────────────────────┤
│  💰 إجمالي الدخل: 2,500 TND        │
│  💸 إجمالي المصاريف: 1,800 TND     │
│  💚 الربح: 700 TND                  │
│                                     │
│  📈 أكبر مصروف: ماكلة (450 TND)     │
│  📉 أقل مصروف: ترفيه (80 TND)       │
│                                     │
│  🎯 أهداف الإدخار: 2/3 محققة        │
│  💳 ديون مخلصة: 3                   │
│                                     │
│  ⭐ التقييم: "شهر ممتاز!"             │
└─────────────────────────────────────┘
```

### Visual Charts
- Pie chart for expense categories
- Line graph for income/expense trends  
- Progress bars for savings goals
- Debt reduction timeline

### Financial Insights
```typescript
interface FinancialInsights {
  spendingPatterns: {
    peakDays: string[]; // "الجمعة", "السبت"
    frequentCategories: Category[];
    unusualActivity: Transaction[];
  };
  
  recommendations: [
    "تصرف 40% زيادة على القهوة مقارنة بالشهر الماضي",
    "الإدخار تاعك زاد 15%! أحسنت!",
    "فاتورة الإنترنت نفس الشيء كل شهر، تحب نعملها تلقائية؟"
  ];
  
  predictions: {
    nextMonth: "بناء على عاداتك، متوقع تصرف {amount} TND الشهر الجاي";
    savingsGoal: "راح توصل لهدف {goal} في {date}";
    budgetAlert: "انتبه! قاعد تتجه لتجاوز ميزانية {category}";
  };
}
```

## 🔔 Notification System

### Notification Categories
```typescript
interface NotificationTypes {
  // Financial Alerts
  budgetWarning: {
    title: "تحذير الميزانية ⚠️";
    body: "راك صرفت 80% من ميزانية {category}!";
    action: "شوف التفاصيل";
  };
  
  // Goal Progress  
  goalMilestone: {
    title: "هدف الإدخار 🎯";
    body: "مبروك! وصلت 50% من هدف {goal}!";
    action: "شوف التقدم";
  };
  
  // Debt Reminders
  debtDue: {
    title: "تذكير دين 💳";
    body: "فاتورة {bill} تخلص بكرا!";
    action: "خلص الآن";
  };
  
  // Motivational
  dailyMotivation: {
    title: "تحفيز يومي 💪";
    body: "صباح النور! يالله نبداو يوم جديد نوفروا فيه!";
    action: "شوف اليوم";
  };
  
  // Weekly Summary
  weeklyReport: {
    title: "تقرير الأسبوع 📊";
    body: "صرفت {amount} TND هالأسبوع، {performance}";
    action: "شوف التقرير";
  };
}
```

### Notification Timing
```typescript
interface NotificationSchedule {
  morning: "07:30"; // صباح الخير
  lunchTime: "12:30"; // تذكير بالمصاريف
  evening: "19:00"; // مراجعة اليوم
  bedtime: "22:00"; // تحفيز للغد
  
  // Custom based on user behavior
  beforeUsualExpense: "قبل ما تشري قهوة، راك صرفت {amount} على القهوة هالأسبوع";
  afterPayday: "مبروك الراتب! تحب نعملوا خطة للشهر الجديد؟";
  weekendSpending: "عطلة سعيدة! انتبه للمصاريف شوية 😊";
}
```
## 🗓️ Calendar Integration

### Financial Calendar
```
┌─────────────────────────────────────┐
│     جانفي 2025 📅                  │
├─────────────────────────────────────┤
│  ا   ث   ث   ج   ج   س   ح        │
│           1   2   3   4   5         │
│  6   7   8   9  10  11  12         │
│ 13  14  15 [16] 17  18  19         │
│ 20  21  22  23  24  25  26         │
│ 27  28  29  30  31                 │
└─────────────────────────────────────┘

Events for Today (16 Jan):
• 💸 غداء - 25 TND
• ☕ قهوة - 8 TND  
• ⚡ فاتورة الكهربا due tomorrow!
• 🎯 +100 TND إلى هدف السفر
```

### Recurring Events
```typescript
interface RecurringEvents {
  monthly: [
    { name: "راتب", type: "income", amount: 2500, day: 1 },
    { name: "كرية", type: "expense", amount: 800, day: 5 },
    { name: "فاتورة الهاتف", type: "bill", amount: 35, day: 15 }
  ];
  
  weekly: [
    { name: "تسوق", type: "expense", amount: 150, day: "friday" }
  ];
  
  daily: [
    { name: "قهوة", type: "expense", amount: 8, reminder: true }
  ];
}
```

## 🎨 Personalization Features

### User Profile Setup
```typescript
interface UserProfile {
  basicInfo: {
    firstName: string;
    lastName: string;
    avatar: string; // Photo upload
    dateOfBirth: Date;
    profession: string;
  };
  
  financialProfile: {
    monthlyIncome: number;
    financialGoals: string[];
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    savingsPreference: number; // Percentage
    spendingHabits: SpendingHabits;
  };
  
  preferences: {
    currency: 'TND' | 'EUR' | 'USD';
    language: 'ar-TN' | 'fr' | 'en';
    theme: 'light' | 'dark' | 'auto';
    notifications: NotificationSettings;
  };
}
```

### Onboarding Flow
```typescript
interface OnboardingFlow {
  step1: "أهلا وسهلا! شنوا اسمك؟";
  step2: "اختار صورتك الشخصية";
  step3: "قداش راتبك الشهري؟";
  step4: "شنوا أهدافك المالية؟";
  step5: "متى تحب نتذكرك بالمصاريف؟";
  step6: "يالله نبداو! 🚀";
}
}
```

### Theme Customization
```typescript
interface ThemeOptions {
  colors: {
    primary: '#7F56D9' | '#custom';
    secondary: '#FFA94D' | '#custom';
    accent: string;
    background: string;
    text: string;
  };
  
  appStyle: {
    theme: 'light' | 'dark' | 'auto';
    animation: 'bouncy' | 'smooth' | 'minimal';
  };
  
  dashboard: {
    layout: 'cards' | 'list' | 'compact';
    showAnimations: boolean;
    quickActions: string[];
  };
}
```

This comprehensive features specification covers all the core functionality your Finanza app needs, with pure Tunisian dialect, intelligent AI interactions, and a focus on making financial management enjoyable and culturally relevant for Tunisian users.
