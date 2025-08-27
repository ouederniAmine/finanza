# 🛠️ Development Guide for Finanza

This guide will help developers get started with Finanza development, understand the codebase structure, and contribute effectively.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Development Environment Setup](#development-environment-setup)
- [Project Architecture](#project-architecture)
- [Coding Standards](#coding-standards)
- [Component Development](#component-development)
- [Navigation System](#navigation-system)
- [Internationalization](#internationalization)
- [State Management](#state-management)
- [Styling Guidelines](#styling-guidelines)
- [Testing](#testing)
- [Performance Optimization](#performance-optimization)
- [Debugging](#debugging)
- [Contributing](#contributing)

## Prerequisites

### System Requirements
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher (or **yarn** 1.22+)
- **Git**: For version control
- **VS Code**: Recommended editor with extensions

### Required Tools
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Install EAS CLI for builds
npm install -g eas-cli

# Verify installations
expo --version
eas --version
node --version
npm --version
```

### Platform-Specific Requirements

#### iOS Development
- **macOS**: Required for iOS development
- **Xcode**: Latest version from App Store
- **iOS Simulator**: Included with Xcode
- **CocoaPods**: `sudo gem install cocoapods`

#### Android Development
- **Android Studio**: Latest version
- **Android SDK**: API levels 21+ (Android 5.0+)
- **Android Emulator**: At least one AVD configured
- **Java JDK**: Version 11 or higher

## Development Environment Setup

### 1. Clone and Install
```bash
# Clone the repository
git clone https://github.com/your-username/finanza.git
cd finanza

# Install dependencies
npm install

# Start development server
npx expo start
```

### 2. VS Code Setup
Install these recommended extensions:
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "expo.vscode-expo-tools",
    "ms-vscode.vscode-json"
  ]
}
```

### 3. Environment Configuration
Create `.env.local` for local development:
```bash
# API Configuration
API_URL=http://localhost:3000
API_TIMEOUT=5000

# Debug Settings
DEBUG=true
LOG_LEVEL=debug

# Feature Flags
ENABLE_NOTIFICATIONS=true
ENABLE_ANALYTICS=false
```

## Project Architecture

### File Structure Overview
```
app/                     # Expo Router pages
├── _layout.tsx         # Root layout
├── index.tsx           # Entry point
├── auth/               # Authentication flows
├── onboarding/         # User onboarding
└── (tabs)/             # Tab navigation

components/             # Reusable UI components
├── ui/                 # Platform-specific components
├── forms/              # Form components
├── charts/             # Data visualization
└── common/             # Shared components

lib/                    # Core application logic
├── locales/            # Translation files
├── types/              # TypeScript definitions
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── context/            # React Context providers
└── constants/          # App constants

hooks/                  # React hooks
constants/              # Theme and styling
assets/                 # Static resources
```

### Core Principles
1. **Component-Driven Development**: Build reusable, composable components
2. **Type Safety**: Use TypeScript for all code
3. **Performance First**: Optimize for mobile devices
4. **Accessibility**: Support screen readers and assistive technologies
5. **Internationalization**: Support multiple languages from day one

## Coding Standards

### TypeScript Guidelines
```typescript
// ✅ Good: Explicit interface definitions
interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

// ✅ Good: Generic components with proper typing
interface ButtonProps<T = void> {
  title: string;
  onPress: T extends void ? () => void : (data: T) => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

// ✅ Good: Proper error handling
const fetchUserData = async (userId: string): Promise<UserProfile | null> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
};
```

### Component Structure
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { t } from '@/lib/i18n';

// 1. Interface definitions
interface Props {
  title: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
}

// 2. Component implementation
export default function CustomButton({ 
  title, 
  subtitle, 
  onPress, 
  disabled = false 
}: Props) {
  const { colors } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  // 3. Event handlers
  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  // 4. Render
  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: colors.primary },
        disabled && styles.disabled,
        isPressed && styles.pressed,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Text style={[styles.title, { color: colors.white }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: colors.white }]}>
          {subtitle}
        </Text>
      )}
    </Pressable>
  );
}

// 5. Styles at the bottom
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
});
```

### Naming Conventions
```typescript
// ✅ Components: PascalCase
export default function TransactionCard() {}

// ✅ Hooks: camelCase starting with 'use'
export function useTransactions() {}

// ✅ Utilities: camelCase
export function formatCurrency() {}

// ✅ Constants: SCREAMING_SNAKE_CASE
export const API_ENDPOINTS = {
  USERS: '/api/users',
  TRANSACTIONS: '/api/transactions',
};

// ✅ Types/Interfaces: PascalCase
interface TransactionData {}
type UserRole = 'admin' | 'user';
```

## Component Development

### Creating New Components

1. **Create component file**:
```bash
# For reusable components
touch components/ui/TransactionCard.tsx

# For screen-specific components
touch components/dashboard/QuickActions.tsx
```

2. **Component template**:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export default function TransactionCard({ 
  transaction, 
  onPress 
}: TransactionCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.amount}>
        {formatCurrency(transaction.amount)}
      </Text>
      <Text style={styles.description}>
        {transaction.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
```

### Component Categories

#### UI Components (`components/ui/`)
Basic, reusable components:
- `Button.tsx` - Various button styles
- `Input.tsx` - Form input fields
- `Card.tsx` - Content containers
- `LoadingSpinner.tsx` - Loading indicators

#### Form Components (`components/forms/`)
Form-specific components:
- `TransactionForm.tsx` - Add/edit transactions
- `BudgetForm.tsx` - Budget creation
- `UserProfileForm.tsx` - Profile editing

#### Chart Components (`components/charts/`)
Data visualization:
- `ExpenseChart.tsx` - Expense breakdown
- `BudgetChart.tsx` - Budget progress
- `SavingsChart.tsx` - Savings trends

## Navigation System

### Expo Router Structure
```
app/
├── _layout.tsx              # Root layout
├── index.tsx                # Home/Auth routing
├── auth/
│   ├── _layout.tsx         # Auth layout
│   ├── welcome.tsx         # Onboarding
│   ├── sign-in.tsx        # Sign in
│   └── sign-up.tsx        # Sign up
└── (tabs)/                 # Protected routes
    ├── _layout.tsx        # Tab layout
    ├── index.tsx          # Dashboard
    ├── transactions.tsx   # Transactions
    ├── budgets.tsx       # Budgets
    ├── savings.tsx       # Savings
    └── profile.tsx       # Profile
```

### Navigation Examples
```typescript
// Programmatic navigation
import { router } from 'expo-router';

// Navigate to screen
router.push('/auth/sign-in');

// Replace current screen
router.replace('/(tabs)/dashboard');

// Go back
router.back();

// Navigate with parameters
router.push({
  pathname: '/transaction/[id]',
  params: { id: '123' }
});
```

### Route Parameters
```typescript
// app/transaction/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function TransactionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  return (
    <View>
      <Text>Transaction ID: {id}</Text>
    </View>
  );
}
```

## Internationalization

### Adding New Translations

1. **Add to all language files**:
```json
// lib/locales/en.json
{
  "dashboard": {
    "welcome": "Welcome back!",
    "total_balance": "Total Balance"
  }
}

// lib/locales/tn.json
{
  "dashboard": {
    "welcome": "أهلا وسهلا مرة أخرى!",
    "total_balance": "الرصيد الكلي"
  }
}
```

2. **Use in components**:
```typescript
import { t } from '@/lib/i18n';

export default function Dashboard() {
  return (
    <View>
      <Text>{t('dashboard.welcome')}</Text>
      <Text>{t('dashboard.total_balance')}</Text>
    </View>
  );
}
```

### Pluralization
```typescript
// Translation with count
t('transactions.count', { count: 5 }); 
// Returns: "5 transactions" (EN) or "5 معاملات" (TN)

// Conditional translations
t('budget.status', { 
  context: isOverBudget ? 'exceeded' : 'normal' 
});
```

## State Management

### React Context for Global State
```typescript
// lib/context/AppContext.tsx
interface AppContextType {
  user: User | null;
  theme: 'light' | 'dark';
  language: string;
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState('tn');

  return (
    <AppContext.Provider value={{
      user, theme, language,
      setUser, setTheme, setLanguage
    }}>
      {children}
    </AppContext.Provider>
  );
}
```

### Custom Hooks for State
```typescript
// hooks/useAppContext.ts
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// hooks/useTransactions.ts
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    transactions,
    loading,
    addTransaction,
    deleteTransaction,
  };
}
```

## Styling Guidelines

### StyleSheet Best Practices
```typescript
// ✅ Good: Semantic naming
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  // ✅ Good: Responsive values
  cardContainer: {
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
```

### Theme Integration
```typescript
// hooks/useTheme.ts
export function useTheme() {
  const { theme } = useAppContext();
  
  return {
    colors: theme === 'light' ? lightColors : darkColors,
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      h1: { fontSize: 28, fontWeight: '700' },
      h2: { fontSize: 24, fontWeight: '600' },
      body: { fontSize: 16, fontWeight: '400' },
      caption: { fontSize: 14, fontWeight: '400' },
    },
  };
}

// Usage in components
export default function ThemedCard({ children }: { children: ReactNode }) {
  const { colors, spacing } = useTheme();
  
  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colors.surface,
        padding: spacing.md,
      }
    ]}>
      {children}
    </View>
  );
}
```

### Responsive Design
```typescript
import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive font scaling
const scale = screenWidth / 375; // Base width (iPhone X)
const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive dimensions
const wp = (percentage: number) => {
  return (screenWidth * percentage) / 100;
};

const hp = (percentage: number) => {
  return (screenHeight * percentage) / 100;
};
```

## Testing

### Unit Testing with Jest
```typescript
// __tests__/utils/formatCurrency.test.ts
import { formatCurrency } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats positive amounts correctly', () => {
    expect(formatCurrency(1000, 'TND')).toBe('1,000.00 TND');
  });

  it('formats negative amounts correctly', () => {
    expect(formatCurrency(-500, 'TND')).toBe('-500.00 TND');
  });

  it('handles zero amount', () => {
    expect(formatCurrency(0, 'TND')).toBe('0.00 TND');
  });
});
```

### Component Testing
```typescript
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled />
    );
    
    const button = getByText('Test Button');
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test Button.test.ts
```

## Performance Optimization

### React Native Best Practices
```typescript
// ✅ Good: Memoized expensive calculations
const expensiveValue = useMemo(() => {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}, [transactions]);

// ✅ Good: Memoized components
const TransactionItem = memo(({ transaction }: { transaction: Transaction }) => {
  return (
    <View style={styles.item}>
      <Text>{transaction.description}</Text>
      <Text>{formatCurrency(transaction.amount)}</Text>
    </View>
  );
});

// ✅ Good: Optimized FlatList
<FlatList
  data={transactions}
  renderItem={({ item }) => <TransactionItem transaction={item} />}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={10}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Image Optimization
```typescript
// ✅ Good: Optimized images
import { Image } from 'expo-image';

<Image
  source={{ uri: user.avatar }}
  style={styles.avatar}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

### Bundle Size Optimization
```typescript
// ✅ Good: Dynamic imports for large libraries
const LazyChart = lazy(() => import('@/components/charts/ExpenseChart'));

// ✅ Good: Conditional imports
const analytics = __DEV__ 
  ? null 
  : await import('@/lib/analytics');
```

## Debugging

### Development Tools
```bash
# Enable React Developer Tools
npm install -g react-devtools
react-devtools

# Enable Flipper for React Native debugging
npm install --save-dev react-native-flipper

# Enable remote debugging
# Shake device/simulator -> "Debug"
```

### Logging Best Practices
```typescript
// lib/utils/logger.ts
const isDev = __DEV__;

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDev) console.log(`[DEBUG] ${message}`, ...args);
  },
  info: (message: string, ...args: any[]) => {
    console.info(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, error?: Error, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, error, ...args);
    // In production, send to crash reporting service
  },
};

// Usage
logger.debug('User loaded', { userId: user.id });
logger.error('Transaction failed', error, { transactionId });
```

### Error Boundaries
```typescript
// components/ErrorBoundary.tsx
interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error boundary caught error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            Please restart the app or contact support
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
```

## Contributing

### Pull Request Process
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Make changes** following coding standards
4. **Add tests** for new functionality
5. **Update documentation** if needed
6. **Run all tests**: `npm test`
7. **Commit changes**: `git commit -m "feat: add new feature"`
8. **Push to branch**: `git push origin feature/new-feature`
9. **Create Pull Request**

### Commit Message Convention
```bash
# Format: type(scope): description

feat(auth): add biometric authentication
fix(transactions): resolve date parsing issue
docs(readme): update installation instructions
style(button): improve button spacing
refactor(api): simplify error handling
test(utils): add currency formatting tests
chore(deps): update expo to v50
```

### Code Review Checklist
- [ ] Code follows TypeScript best practices
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Performance considerations addressed
- [ ] Accessibility features included
- [ ] Internationalization support added
- [ ] Error handling implemented

---

This development guide should help you get started with Finanza development. For specific questions or issues, please check the [README](../README.md) or create an issue in the repository.
