# Finanza - UI/UX Design System 🎨

## 🎨 Design Philosophy

### Core Principles
- **Tunisian Cultural Integration**: UI elements that resonate with local culture
- **Joyful Finance**: Making money management fun and engaging
- **Clean Interface**: Simple, intuitive design focused on usability
- **Accessibility**: Clear Arabic typography and RTL support
- **Emotional Design**: Colors and animations that motivate financial success

### Visual Identity
```
🎯 Mission: "خليك معانا نركحوا الفلوس ونعملوا budget زين!"
🎨 Aesthetic: Modern, warm, trustworthy, playful
🌟 Values: Transparency, Empowerment, Community, Growth
```

## 🌈 Color Palette

### Primary Colors
```css
:root {
  /* Primary Brand Colors */
  --primary-violet: #7F56D9;      /* Main brand color */
  --primary-violet-light: #9E77ED; /* Hover states */
  --primary-violet-dark: #6941C6;  /* Active states */
  
  --secondary-orange: #FFA94D;     /* Accent color */
  --secondary-orange-light: #FFB366; /* Hover states */
  --secondary-orange-dark: #FF8C1A; /* Active states */
  
  /* Supporting Colors */
  --success-green: #10B981;        /* Savings, positive */
  --warning-yellow: #F59E0B;       /* Budget warnings */
  --danger-red: #EF4444;           /* Overspending, debts */
  --info-blue: #3B82F6;            /* Information */
}
```

### Neutral Colors
```css
:root {
  /* Light Theme */
  --background-primary: #FFFFFF;
  --background-secondary: #F8FAFC;
  --background-tertiary: #F1F5F9;
  
  --text-primary: #1E293B;
  --text-secondary: #64748B;
  --text-tertiary: #94A3B8;
  
  --border-light: #E2E8F0;
  --border-medium: #CBD5E1;
  --border-strong: #94A3B8;
  
  /* Dark Theme */
  --dark-background-primary: #0F172A;
  --dark-background-secondary: #1E293B;
  --dark-background-tertiary: #334155;
  
  --dark-text-primary: #F8FAFC;
  --dark-text-secondary: #CBD5E1;
  --dark-text-tertiary: #94A3B8;
  
  --dark-border-light: #334155;
  --dark-border-medium: #475569;
  --dark-border-strong: #64748B;
}
```

### Semantic Colors
```css
:root {
  /* Financial States */
  --income-color: #10B981;         /* Money coming in */
  --expense-color: #EF4444;        /* Money going out */
  --savings-color: #7C3AED;        /* Money saved */
  --debt-color: #DC2626;           /* Money owed */
  --budget-color: #2563EB;         /* Budget tracking */
  
  /* Progress States */
  --progress-empty: #E5E7EB;
  --progress-low: #FEF3C7;         /* 0-25% */
  --progress-medium: #FDE68A;      /* 25-75% */
  --progress-high: #10B981;        /* 75-100% */
  --progress-complete: #059669;    /* 100% */
  
  /* Alert States */
  --alert-info: #DBEAFE;
  --alert-success: #D1FAE5;
  --alert-warning: #FEF3C7;
  --alert-danger: #FEE2E2;
}
```

## 🔤 Typography

### Font Stack
```css
/* Arabic Typography */
@font-face {
  font-family: 'Cairo';
  src: url('./assets/fonts/Cairo-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'Cairo';
  src: url('./assets/fonts/Cairo-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}

/* Latin Typography */
@font-face {
  font-family: 'Inter';
  src: url('./assets/fonts/Inter-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

:root {
  --font-arabic: 'Cairo', 'Amiri', 'Tahoma', sans-serif;
  --font-latin: 'Inter', 'SF Pro Display', -apple-system, sans-serif;
  --font-mono: 'SF Mono', 'Monaco', monospace;
}
```

### Typography Scale
```css
.text-styles {
  /* Headings */
  --text-hero: 48px/56px;          /* Main hero text */
  --text-h1: 36px/44px;            /* Page titles */
  --text-h2: 30px/38px;            /* Section headers */
  --text-h3: 24px/32px;            /* Subsection headers */
  --text-h4: 20px/28px;            /* Card titles */
  --text-h5: 18px/26px;            /* Small headers */
  
  /* Body Text */
  --text-large: 18px/28px;         /* Large body text */
  --text-base: 16px/24px;          /* Default body text */
  --text-medium: 14px/20px;        /* Secondary text */
  --text-small: 12px/16px;         /* Captions, labels */
  --text-xs: 11px/14px;            /* Fine print */
  
  /* Numbers & Currency */
  --text-currency-large: 32px/40px; /* Dashboard amounts */
  --text-currency-medium: 24px/32px; /* Card amounts */
  --text-currency-small: 18px/24px;  /* List amounts */
}
```

### Arabic Text Handling
```css
.arabic-text {
  font-family: var(--font-arabic);
  direction: rtl;
  text-align: right;
  font-feature-settings: 'liga' 1, 'calt' 1;
}

.latin-text {
  font-family: var(--font-latin);
  direction: ltr;
  text-align: left;
}

/* Mixed content containers */
.mixed-content {
  direction: rtl; /* Default RTL for Arabic UI */
}

.mixed-content .latin {
  direction: ltr;
  display: inline-block;
}
```

## 📱 Component Design System

### Button Components
```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, var(--primary-violet), var(--primary-violet-light));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(127, 86, 217, 0.3);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(127, 86, 217, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(127, 86, 217, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: linear-gradient(135deg, var(--secondary-orange), var(--secondary-orange-light));
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(255, 169, 77, 0.3);
}

/* Voice Button */
.btn-voice {
  background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
  color: white;
  border: none;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
  position: relative;
  overflow: hidden;
}

.btn-voice.recording {
  animation: finanza-pulse 1s infinite;
}

.btn-voice.recording::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  animation: finanza-pulse 2s infinite;
}
```

### Card Components
```css
.card-base {
  background: var(--background-primary);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.card-base:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

/* Financial Summary Card */
.card-financial {
  background: linear-gradient(135deg, var(--primary-violet), var(--primary-violet-light));
  color: white;
  position: relative;
  overflow: hidden;
}

.card-financial::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  transform: rotate(45deg);
}

/* Budget Progress Card */
.card-budget {
  background: linear-gradient(135deg, #F8FAFC, #E2E8F0);
  border-left: 4px solid var(--primary-violet);
}

/* Savings Goal Card */
.card-savings {
  background: linear-gradient(135deg, #FFF7ED, #FFEDD5);
  border-left: 4px solid var(--secondary-orange);
}

/* Transaction Card */
.card-transaction {
  background: var(--background-primary);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid var(--border-medium);
  margin-bottom: 8px;
}

.card-transaction.income {
  border-left-color: var(--success-green);
  background: linear-gradient(135deg, #F0FDF4, #DCFCE7);
}

.card-transaction.expense {
  border-left-color: var(--danger-red);
  background: linear-gradient(135deg, #FEF2F2, #FEE2E2);
}
```

### Progress Components
```css
/* Circular Progress */
.progress-circular {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-circular svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.progress-circular .progress-bg {
  fill: none;
  stroke: var(--border-light);
  stroke-width: 8;
}

.progress-circular .progress-fill {
  fill: none;
  stroke: var(--primary-violet);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

/* Linear Progress */
.progress-linear {
  width: 100%;
  height: 8px;
  background: var(--border-light);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-linear .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-violet), var(--secondary-orange));
  border-radius: 4px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-linear .progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: progress-shine 2s infinite;
}

@keyframes progress-shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### Input Components
```css
/* Text Input */
.input-base {
  width: 100%;
  padding: 16px;
  border: 2px solid var(--border-light);
  border-radius: 12px;
  font-size: 16px;
  font-family: var(--font-arabic);
  background: var(--background-primary);
  transition: all 0.2s ease;
}

.input-base:focus {
  outline: none;
  border-color: var(--primary-violet);
  box-shadow: 0 0 0 4px rgba(127, 86, 217, 0.1);
}

/* Currency Input */
.input-currency {
  position: relative;
}

.input-currency input {
  padding-right: 60px; /* Space for currency */
  text-align: right;
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
}

.input-currency .currency-symbol {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-weight: 600;
}

/* Arabic Number Input */
.input-arabic-number {
  direction: ltr;
  text-align: right;
  font-family: var(--font-mono);
}
```

## 📱 Screen Layouts

### Dashboard Layout
```tsx
const DashboardLayout = () => (
  <SafeAreaView className="flex-1 bg-gray-50">
    {/* Header with Finanza */}
    <View className="px-6 py-4 bg-white">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <FinanzaAvatar size="medium" mood="happy" />
          <View className="ml-3">
            <Text className="text-lg font-bold text-gray-900">
              أهلا محمد! 👋
            </Text>
            <Text className="text-sm text-gray-600">
              شنوا أخبار الفلوس اليوم؟
            </Text>
          </View>
        </View>
        <TouchableOpacity className="p-2">
          <BellIcon className="w-6 h-6 text-gray-600" />
        </TouchableOpacity>
      </View>
    </View>

    {/* Financial Summary Cards */}
    <ScrollView className="flex-1 px-6 py-4">
      <View className="space-y-4">
        <FinancialSummaryCard />
        <BudgetProgressCard />
        <SavingsGoalsGrid />
        <RecentTransactions />
      </View>
    </ScrollView>

    {/* Quick Actions */}
    <View className="px-6 py-4 bg-white border-t border-gray-200">
      <QuickActionButtons />
    </View>
  </SafeAreaView>
);
```

### Transaction Form Layout
```tsx
const TransactionForm = () => (
  <SafeAreaView className="flex-1 bg-white">
    {/* Header */}
    <View className="px-6 py-4 border-b border-gray-200">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity>
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900">
          زيد مصروف جديد
        </Text>
        <TouchableOpacity>
          <CheckIcon className="w-6 h-6 text-violet-600" />
        </TouchableOpacity>
      </View>
    </View>

    {/* Form Content */}
    <ScrollView className="flex-1 px-6 py-6">
      <View className="space-y-6">
        {/* Amount Input */}
        <View>
          <Text className="text-base font-semibold text-gray-900 mb-2">
            💰 المبلغ
          </Text>
          <CurrencyInput />
        </View>

        {/* Category Selector */}
        <View>
          <Text className="text-base font-semibold text-gray-900 mb-2">
            📁 الصنف
          </Text>
          <CategoryGrid />
        </View>

        {/* Description */}
        <View>
          <Text className="text-base font-semibold text-gray-900 mb-2">
            📝 التفاصيل
          </Text>
          <TextInput
            className="input-base"
            placeholder="اكتب تفاصيل المصروف..."
            multiline
          />
        </View>

        {/* Date Picker */}
        <View>
          <Text className="text-base font-semibold text-gray-900 mb-2">
            📅 التاريخ
          </Text>
          <DatePicker />
        </View>

        {/* Receipt Upload */}
        <View>
          <Text className="text-base font-semibold text-gray-900 mb-2">
            📷 صورة الفاتورة
          </Text>
          <ReceiptUpload />
        </View>
      </View>
    </ScrollView>

    {/* Voice Input Button */}
    <View className="px-6 py-4 bg-gray-50">
      <TouchableOpacity className="btn-voice mx-auto">
        <MicrophoneIcon className="w-6 h-6 text-white" />
      </TouchableOpacity>
      <Text className="text-center text-sm text-gray-600 mt-2">
        او قولي "صرفت 25 دينار على غداء"
      </Text>
    </View>

    {/* Submit Button */}
    <View className="px-6 py-4 bg-white border-t border-gray-200">
      <TouchableOpacity className="btn-primary">
        <Text className="text-center text-white font-semibold">
          زيد المصروف
        </Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);
```

## 🎭 Animation Library

### Entrance Animations
```css
@keyframes slideInFromBottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInFromRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

### Interactive Animations
```css
/* Card Hover Effects */
.card-interactive {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-interactive:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

/* Button Press Effects */
.btn-press {
  transition: all 0.1s ease;
}

.btn-press:active {
  transform: scale(0.95);
}

/* Number Counter Animation */
@keyframes countUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.number-counter {
  overflow: hidden;
  height: 1.2em;
}

.number-counter span {
  display: inline-block;
  animation: countUp 0.3s ease-out;
}
```

### Financial Success Celebrations
```css
@keyframes celebrationPulse {
  0%, 100% { 
    transform: scale(1);
    filter: hue-rotate(0deg);
  }
  25% { 
    transform: scale(1.1);
    filter: hue-rotate(90deg);
  }
  50% { 
    transform: scale(1.2);
    filter: hue-rotate(180deg);
  }
  75% { 
    transform: scale(1.1);
    filter: hue-rotate(270deg);
  }
}

.celebration-mode {
  animation: celebrationPulse 2s infinite;
}

/* Confetti Effect */
@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--secondary-orange);
  animation: confetti-fall 3s linear infinite;
}
```

This comprehensive UI/UX design system provides all the visual elements, components, and guidelines needed to create a beautiful, culturally appropriate, and engaging Finanza app that makes financial management joyful for Tunisian users.
