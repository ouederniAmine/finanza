# Navigation Quick Reference

## 📱 Main Tab Structure

### **🏠 Home Tab (`index`)**
- **Purpose**: Financial dashboard and overview
- **Key Features**: 
  - Account balance summary
  - Recent transactions
  - Quick action buttons
  - Financial health indicators
- **Special Elements**: Floating plus button for quick transaction entry

### **📊 Planning Tab (`planning`)**
- **Purpose**: Comprehensive financial planning hub
- **Sub-Navigation**: Material Top Tabs
- **Sections**:
  
  #### 💰 **Budgets** (`planning/budgets`)
  - Create and manage spending budgets
  - Category-based budget allocation
  - Budget vs actual spending tracking
  - Monthly/weekly budget periods
  
  #### 💳 **Debts** (`planning/debts`) 
  - Debt tracking and management
  - Payment scheduling and reminders
  - Payoff strategies and calculators
  - Interest tracking and optimization
  
  #### 🎯 **Savings** (`planning/savings`)
  - Savings goal creation and tracking
  - Progress visualization
  - Goal achievement celebrations
  - Automatic savings recommendations

### **📅 Calendar Tab (`calendar`)**
- **Purpose**: Transaction history and financial calendar
- **Key Features**:
  - Monthly/weekly transaction views
  - Spending pattern visualization
  - Upcoming bill reminders
  - Financial event scheduling

### **📈 Analytics Tab (`analytics`)**
- **Purpose**: Financial insights and reporting
- **Key Features**:
  - Spending category breakdown
  - Trend analysis and charts
  - Financial health metrics
  - Exportable reports

### **⚙️ Settings Tab (`settings`)**
- **Purpose**: App configuration and preferences
- **Key Features**:
  - User profile management
  - Language selection (4 languages)
  - Currency and regional settings
  - Security and privacy options

## 🧭 Navigation Implementation

### **File Structure**
```
app/(tabs)/
├── _layout.tsx              # Main 5-tab layout
├── index.tsx               # Home dashboard
├── calendar.tsx            # Calendar view
├── analytics.tsx           # Analytics
├── settings.tsx            # Settings
└── planning/
    ├── _layout.tsx         # Material Top Tabs
    ├── index.tsx           # Redirect to budgets
    ├── budgets.tsx         # Budget management
    ├── debts.tsx           # Debt tracking
    └── savings.tsx         # Savings goals
```

### **Key Components**

#### Main Navigation
```typescript
// app/(tabs)/_layout.tsx
<Tabs screenOptions={{
  tabBarActiveTintColor: '#10B981',
  tabBarInactiveTintColor: '#687076',
  headerShown: false,
  tabBarButton: HapticTab,
}}>
```

#### Planning Sub-Navigation  
```typescript
// app/(tabs)/planning/_layout.tsx
<MaterialTopTabs screenOptions={{
  tabBarActiveTintColor: '#10B981',
  tabBarIndicatorStyle: { backgroundColor: '#10B981' },
}}>
```

## 🎨 Visual Design

### **Tab Icons**
- **Home**: `house.fill`
- **Planning**: `chart.line.uptrend.xyaxis`
- **Calendar**: `calendar`
- **Analytics**: `chart.bar.fill`
- **Settings**: `gearshape.fill`

### **Planning Sub-Tab Icons**
- **Budgets**: `chart.pie.fill`
- **Debts**: `creditcard.fill`
- **Savings**: `target`

### **Color Scheme**
- **Active Tab**: `#10B981` (Green)
- **Inactive Tab**: `#687076` (Gray)
- **Indicator**: `#10B981` (Green)

## 🌍 Multi-Language Support

### **Translation Keys**
```typescript
// Usage in components
t('navigation.home', language)
t('navigation.planning', language)
t('navigation.budgets', language)
t('navigation.debts', language)
t('navigation.savings', language)
t('navigation.calendar', language)
t('navigation.analytics', language)
t('navigation.settings', language)
```

### **Language Files**
- **English**: `lib/locales/en.json`
- **French**: `lib/locales/fr.json`
- **Arabic**: `lib/locales/ar.json`
- **Tunisian**: `lib/locales/tn.json`

## 🔧 Technical Details

### **Navigation State Management**
```typescript
// Track current route for conditional rendering
const [currentRoute, setCurrentRoute] = useState('index');

// Handle tab state changes
const handleStateChange = useCallback((e: any) => {
  const state = e.data.state;
  if (state) {
    const routeName = state.routes[state.index]?.name;
    setCurrentRoute(routeName);
  }
}, []);
```

### **Hidden Screens**
Some screens are hidden from tab navigation but accessible via navigation:
```typescript
<Tabs.Screen name="profile" options={{ href: null }} />
<Tabs.Screen name="transactions" options={{ href: null }} />
<Tabs.Screen name="add-transaction" options={{ href: null }} />
```

### **Conditional UI Elements**
```typescript
// Plus button only shows on home tab
{currentRoute === 'index' && (
  <View style={{ position: 'absolute', bottom: 110, right: 20 }}>
    <PlusButton />
  </View>
)}
```

## 🚀 Quick Navigation Commands

### **Programmatic Navigation**
```typescript
// Navigate to planning section
router.push('/planning/budgets');
router.push('/planning/debts');
router.push('/planning/savings');

// Navigate to main tabs
router.push('/');           // Home
router.push('/calendar');   // Calendar
router.push('/analytics');  // Analytics
router.push('/settings');   // Settings
```

### **Deep Linking**
- `/` - Home dashboard
- `/planning` - Planning hub (redirects to budgets)
- `/planning/budgets` - Budget management
- `/planning/debts` - Debt tracking
- `/planning/savings` - Savings goals
- `/calendar` - Transaction calendar
- `/analytics` - Financial analytics
- `/settings` - App settings

---

*For detailed implementation notes, see [Navigation Restructure Documentation](../progress/navigation-restructure.md)*
