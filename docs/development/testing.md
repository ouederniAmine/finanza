# 🧪 Testing Guide

Comprehensive testing strategy and implementation guide for the Finanza personal finance application.

## 📋 Testing Overview

Our testing strategy follows the testing pyramid with comprehensive coverage across all layers:

```
        🔺 E2E Tests (10%)
       🔻 Integration Tests (20%)
      ⬛⬛⬛ Unit Tests (70%)
```

### Testing Philosophy
- **🎯 Quality First**: Catch bugs before users do
- **🔄 Continuous Testing**: Tests run automatically on every commit
- **📊 Coverage Goals**: 80%+ unit test coverage, 100% critical path coverage
- **🚀 Fast Feedback**: Quick test execution for rapid development

## 🏗️ Testing Architecture

### Test Structure
```
__tests__/
├── unit/                    # Unit tests
│   ├── components/         # Component unit tests
│   ├── hooks/             # Custom hooks tests
│   ├── utils/             # Utility function tests
│   └── services/          # Service layer tests
├── integration/            # Integration tests
│   ├── api/               # API integration tests
│   ├── navigation/        # Navigation flow tests
│   └── storage/           # Storage integration tests
├── e2e/                   # End-to-end tests
│   ├── onboarding/        # User onboarding flows
│   ├── transactions/      # Transaction workflows
│   └── auth/              # Authentication flows
└── fixtures/              # Test data and mocks
    ├── data/              # Sample data
    ├── mocks/             # Mock implementations
    └── helpers/           # Test utilities
```

### Test Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/__tests__/setup.ts'
  ],
  testMatch: [
    '**/__tests__/**/*.test.{js,ts,tsx}',
    '**/?(*.)+(spec|test).{js,ts,tsx}'
  ],
  collectCoverageFrom: [
    'app/**/*.{js,ts,tsx}',
    'components/**/*.{js,ts,tsx}',
    'hooks/**/*.{js,ts,tsx}',
    'lib/**/*.{js,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@hooks/(.*)$': '<rootDir>/hooks/$1'
  },
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation)'
  ]
};
```

## 🔧 Unit Testing

### Component Testing
```typescript
// __tests__/unit/components/TransactionCard.test.tsx
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { TransactionCard } from '@/components/TransactionCard';
import { mockTransaction } from '@/fixtures/data/transactions';

describe('TransactionCard', () => {
  const defaultProps = {
    transaction: mockTransaction,
    onPress: jest.fn(),
    onLongPress: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders transaction information correctly', () => {
    render(<TransactionCard {...defaultProps} />);
    
    expect(screen.getByText(mockTransaction.description)).toBeOnTheScreen();
    expect(screen.getByText(`$${mockTransaction.amount}`)).toBeOnTheScreen();
    expect(screen.getByText(mockTransaction.category)).toBeOnTheScreen();
  });

  it('handles press events', () => {
    render(<TransactionCard {...defaultProps} />);
    
    fireEvent.press(screen.getByTestId('transaction-card'));
    expect(defaultProps.onPress).toHaveBeenCalledWith(mockTransaction);
  });

  it('handles long press events', () => {
    render(<TransactionCard {...defaultProps} />);
    
    fireEvent(screen.getByTestId('transaction-card'), 'longPress');
    expect(defaultProps.onLongPress).toHaveBeenCalledWith(mockTransaction);
  });

  it('displays correct amount formatting for different currencies', () => {
    const tunisianTransaction = {
      ...mockTransaction,
      amount: 150.50,
      currency: 'TND'
    };

    render(
      <TransactionCard 
        {...defaultProps} 
        transaction={tunisianTransaction} 
      />
    );
    
    expect(screen.getByText('150.50 دت')).toBeOnTheScreen();
  });

  it('applies correct styling for income vs expense', () => {
    const incomeTransaction = {
      ...mockTransaction,
      type: 'income',
      amount: 500
    };

    const { rerender } = render(
      <TransactionCard 
        {...defaultProps} 
        transaction={incomeTransaction} 
      />
    );

    const amountText = screen.getByText('$500');
    expect(amountText).toHaveStyle({ color: '#28A745' }); // Success green

    const expenseTransaction = {
      ...mockTransaction,
      type: 'expense',
      amount: -150
    };

    rerender(
      <TransactionCard 
        {...defaultProps} 
        transaction={expenseTransaction} 
      />
    );

    const expenseAmountText = screen.getByText('-$150');
    expect(expenseAmountText).toHaveStyle({ color: '#DC3545' }); // Danger red
  });
});
```

### Hook Testing
```typescript
// __tests__/unit/hooks/useTransactions.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionService } from '@/lib/services/TransactionService';
import { mockTransactions } from '@/fixtures/data/transactions';

// Mock the service
jest.mock('@/lib/services/TransactionService');
const mockTransactionService = TransactionService as jest.Mocked<typeof TransactionService>;

describe('useTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransactionService.getTransactions.mockResolvedValue(mockTransactions);
  });

  it('loads transactions on mount', async () => {
    const { result } = renderHook(() => useTransactions());

    expect(result.current.loading).toBe(true);
    expect(result.current.transactions).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.transactions).toEqual(mockTransactions);
    expect(mockTransactionService.getTransactions).toHaveBeenCalledTimes(1);
  });

  it('handles transaction creation', async () => {
    const newTransaction = {
      description: 'Coffee',
      amount: -5.50,
      category: 'Food',
      date: new Date()
    };

    mockTransactionService.createTransaction.mockResolvedValue({
      id: '123',
      ...newTransaction
    });

    const { result } = renderHook(() => useTransactions());

    await act(async () => {
      await result.current.createTransaction(newTransaction);
    });

    expect(mockTransactionService.createTransaction).toHaveBeenCalledWith(newTransaction);
    expect(result.current.transactions).toHaveLength(mockTransactions.length + 1);
  });

  it('handles error states', async () => {
    const errorMessage = 'Network error';
    mockTransactionService.getTransactions.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.transactions).toEqual([]);
  });

  it('filters transactions by category', async () => {
    const { result } = renderHook(() => useTransactions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setFilter({ category: 'Food' });
    });

    const foodTransactions = mockTransactions.filter(t => t.category === 'Food');
    expect(result.current.filteredTransactions).toEqual(foodTransactions);
  });
});
```

### Service Testing
```typescript
// __tests__/unit/services/TransactionService.test.ts
import { TransactionService } from '@/lib/services/TransactionService';
import { ApiClient } from '@/lib/api/ApiClient';
import { StorageService } from '@/lib/services/StorageService';

jest.mock('@/lib/api/ApiClient');
jest.mock('@/lib/services/StorageService');

const mockApiClient = ApiClient as jest.Mocked<typeof ApiClient>;
const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

describe('TransactionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransactions', () => {
    it('fetches transactions from API when online', async () => {
      const mockTransactions = [
        { id: '1', description: 'Coffee', amount: -5.50 },
        { id: '2', description: 'Salary', amount: 3000 }
      ];

      mockApiClient.get.mockResolvedValue({ data: mockTransactions });
      mockStorageService.isOnline.mockReturnValue(true);

      const result = await TransactionService.getTransactions();

      expect(mockApiClient.get).toHaveBeenCalledWith('/transactions');
      expect(mockStorageService.setItem).toHaveBeenCalledWith('transactions', mockTransactions);
      expect(result).toEqual(mockTransactions);
    });

    it('falls back to cached data when offline', async () => {
      const cachedTransactions = [
        { id: '1', description: 'Cached Coffee', amount: -5.50 }
      ];

      mockStorageService.isOnline.mockReturnValue(false);
      mockStorageService.getItem.mockResolvedValue(cachedTransactions);

      const result = await TransactionService.getTransactions();

      expect(mockApiClient.get).not.toHaveBeenCalled();
      expect(mockStorageService.getItem).toHaveBeenCalledWith('transactions');
      expect(result).toEqual(cachedTransactions);
    });

    it('handles API errors gracefully', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));
      mockStorageService.isOnline.mockReturnValue(true);
      mockStorageService.getItem.mockResolvedValue([]);

      const result = await TransactionService.getTransactions();

      expect(result).toEqual([]);
      expect(mockStorageService.getItem).toHaveBeenCalledWith('transactions');
    });
  });

  describe('createTransaction', () => {
    it('creates transaction via API and updates cache', async () => {
      const newTransaction = {
        description: 'Coffee',
        amount: -5.50,
        category: 'Food',
        date: new Date()
      };

      const createdTransaction = { id: '123', ...newTransaction };

      mockApiClient.post.mockResolvedValue({ data: createdTransaction });
      mockStorageService.isOnline.mockReturnValue(true);

      const result = await TransactionService.createTransaction(newTransaction);

      expect(mockApiClient.post).toHaveBeenCalledWith('/transactions', newTransaction);
      expect(result).toEqual(createdTransaction);
    });

    it('queues transaction for sync when offline', async () => {
      const newTransaction = {
        description: 'Coffee',
        amount: -5.50,
        category: 'Food',
        date: new Date()
      };

      mockStorageService.isOnline.mockReturnValue(false);

      const result = await TransactionService.createTransaction(newTransaction);

      expect(mockStorageService.addToSyncQueue).toHaveBeenCalledWith('transactions', newTransaction);
      expect(result.id).toBeDefined();
      expect(result.description).toBe(newTransaction.description);
    });
  });
});
```

### Utility Function Testing
```typescript
// __tests__/unit/utils/currency.test.ts
import { formatCurrency, convertCurrency, getCurrencySymbol } from '@/lib/utils/currency';

describe('Currency Utils', () => {
  describe('formatCurrency', () => {
    it('formats USD correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
      expect(formatCurrency(-50.75, 'USD')).toBe('-$50.75');
    });

    it('formats TND correctly', () => {
      expect(formatCurrency(1234.56, 'TND')).toBe('1,234.56 دت');
      expect(formatCurrency(0, 'TND')).toBe('0.00 دت');
      expect(formatCurrency(-50.75, 'TND')).toBe('-50.75 دت');
    });

    it('handles different locales', () => {
      expect(formatCurrency(1234.56, 'EUR', 'fr-FR')).toBe('1 234,56 €');
      expect(formatCurrency(1234.56, 'EUR', 'en-US')).toBe('€1,234.56');
    });

    it('throws error for invalid currency', () => {
      expect(() => formatCurrency(100, 'INVALID')).toThrow('Unsupported currency: INVALID');
    });
  });

  describe('convertCurrency', () => {
    it('converts between currencies using provided rates', () => {
      const rates = { USD: 1, EUR: 0.85, TND: 3.1 };
      
      expect(convertCurrency(100, 'USD', 'EUR', rates)).toBeCloseTo(85);
      expect(convertCurrency(100, 'USD', 'TND', rates)).toBeCloseTo(310);
      expect(convertCurrency(310, 'TND', 'USD', rates)).toBeCloseTo(100);
    });

    it('returns same amount for same currency', () => {
      const rates = { USD: 1, EUR: 0.85 };
      expect(convertCurrency(100, 'USD', 'USD', rates)).toBe(100);
    });

    it('throws error for missing exchange rate', () => {
      const rates = { USD: 1, EUR: 0.85 };
      expect(() => convertCurrency(100, 'USD', 'GBP', rates))
        .toThrow('Exchange rate not available for GBP');
    });
  });

  describe('getCurrencySymbol', () => {
    it('returns correct symbols for supported currencies', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
      expect(getCurrencySymbol('EUR')).toBe('€');
      expect(getCurrencySymbol('TND')).toBe('دت');
      expect(getCurrencySymbol('GBP')).toBe('£');
    });

    it('returns currency code for unsupported currencies', () => {
      expect(getCurrencySymbol('XYZ')).toBe('XYZ');
    });
  });
});
```

## 🔗 Integration Testing

### API Integration Testing
```typescript
// __tests__/integration/api/transactions.test.ts
import { ApiClient } from '@/lib/api/ApiClient';
import { setupTestServer, teardownTestServer, mockApiResponse } from '@/fixtures/helpers/apiMocks';

describe('Transaction API Integration', () => {
  beforeAll(() => {
    setupTestServer();
  });

  afterAll(() => {
    teardownTestServer();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates and retrieves transactions end-to-end', async () => {
    // Mock create transaction response
    const newTransaction = {
      description: 'Integration Test Coffee',
      amount: -4.50,
      category: 'Food',
      date: new Date().toISOString()
    };

    const createdTransaction = {
      id: 'test-id-123',
      ...newTransaction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockApiResponse('POST', '/transactions', createdTransaction);

    // Create transaction
    const createResponse = await ApiClient.post('/transactions', newTransaction);
    expect(createResponse.data).toEqual(createdTransaction);

    // Mock get transactions response
    const allTransactions = [createdTransaction];
    mockApiResponse('GET', '/transactions', allTransactions);

    // Retrieve transactions
    const getResponse = await ApiClient.get('/transactions');
    expect(getResponse.data).toContainEqual(createdTransaction);
  });

  it('handles pagination correctly', async () => {
    const page1Transactions = Array.from({ length: 10 }, (_, i) => ({
      id: `tx-${i}`,
      description: `Transaction ${i}`,
      amount: i * 10,
      category: 'Test'
    }));

    const page2Transactions = Array.from({ length: 5 }, (_, i) => ({
      id: `tx-${i + 10}`,
      description: `Transaction ${i + 10}`,
      amount: (i + 10) * 10,
      category: 'Test'
    }));

    // Mock paginated responses
    mockApiResponse('GET', '/transactions?page=1&limit=10', {
      data: page1Transactions,
      pagination: { page: 1, limit: 10, total: 15, hasMore: true }
    });

    mockApiResponse('GET', '/transactions?page=2&limit=10', {
      data: page2Transactions,
      pagination: { page: 2, limit: 10, total: 15, hasMore: false }
    });

    // Test pagination
    const page1Response = await ApiClient.get('/transactions?page=1&limit=10');
    expect(page1Response.data.data).toHaveLength(10);
    expect(page1Response.data.pagination.hasMore).toBe(true);

    const page2Response = await ApiClient.get('/transactions?page=2&limit=10');
    expect(page2Response.data.data).toHaveLength(5);
    expect(page2Response.data.pagination.hasMore).toBe(false);
  });

  it('handles authentication errors', async () => {
    mockApiResponse('GET', '/transactions', 
      { error: 'Unauthorized' }, 
      { status: 401 }
    );

    await expect(ApiClient.get('/transactions'))
      .rejects
      .toMatchObject({
        status: 401,
        message: 'Unauthorized'
      });
  });
});
```

### Navigation Integration Testing
```typescript
// __tests__/integration/navigation/tabNavigation.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { TabLayout } from '@/app/(tabs)/_layout';
import { mockNavigationState } from '@/fixtures/helpers/navigationMocks';

describe('Tab Navigation Integration', () => {
  const renderWithNavigation = (component: React.ReactElement) => {
    return render(
      <NavigationContainer>
        {component}
      </NavigationContainer>
    );
  };

  it('navigates between tabs correctly', async () => {
    const { getByTestId, getByText } = renderWithNavigation(<TabLayout />);

    // Should start on Home tab
    expect(getByText('Home')).toBeOnTheScreen();

    // Navigate to Transactions tab
    fireEvent.press(getByTestId('tab-transactions'));
    
    await waitFor(() => {
      expect(getByText('Transactions')).toBeOnTheScreen();
    });

    // Navigate to Budget tab
    fireEvent.press(getByTestId('tab-budgets'));
    
    await waitFor(() => {
      expect(getByText('Budgets')).toBeOnTheScreen();
    });
  });

  it('maintains tab state during navigation', async () => {
    const { getByTestId } = renderWithNavigation(<TabLayout />);

    // Navigate to transactions and add a filter
    fireEvent.press(getByTestId('tab-transactions'));
    fireEvent.press(getByTestId('filter-button'));
    fireEvent.press(getByTestId('category-food'));

    // Navigate away and back
    fireEvent.press(getByTestId('tab-home'));
    fireEvent.press(getByTestId('tab-transactions'));

    // Filter should still be applied
    await waitFor(() => {
      expect(getByTestId('active-filter-food')).toBeOnTheScreen();
    });
  });

  it('handles deep linking correctly', async () => {
    const deepLink = 'finanza://transactions/123';
    
    const { getByTestId } = renderWithNavigation(
      <TabLayout initialState={mockNavigationState(deepLink)} />
    );

    await waitFor(() => {
      expect(getByTestId('transaction-detail-123')).toBeOnTheScreen();
    });
  });
});
```

## 🚀 End-to-End Testing

### E2E Test Setup (Detox)
```javascript
// detox.config.js
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  configurations: {
    'ios.sim.debug': {
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/Finanza.app',
      build: 'xcodebuild -workspace ios/Finanza.xcworkspace -scheme Finanza -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      type: 'ios.simulator',
      device: {
        type: 'iPhone 13'
      }
    },
    'android.emu.debug': {
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_4_API_30'
      }
    }
  }
};
```

### User Journey Testing
```typescript
// __tests__/e2e/onboarding.test.ts
import { device, element, by, expect } from 'detox';

describe('User Onboarding Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('completes full onboarding process', async () => {
    // Welcome screen
    await expect(element(by.id('welcome-screen'))).toBeVisible();
    await element(by.id('get-started-button')).tap();

    // Onboarding carousel
    await expect(element(by.id('onboarding-carousel'))).toBeVisible();
    
    // Swipe through onboarding screens
    await element(by.id('onboarding-carousel')).swipe('left');
    await element(by.id('onboarding-carousel')).swipe('left');
    await element(by.id('onboarding-carousel')).swipe('left');

    // Complete onboarding
    await element(by.id('finish-onboarding-button')).tap();

    // Should navigate to sign up
    await expect(element(by.id('sign-up-screen'))).toBeVisible();
  });

  it('allows skipping onboarding', async () => {
    await expect(element(by.id('welcome-screen'))).toBeVisible();
    await element(by.id('skip-onboarding-button')).tap();

    // Should go directly to auth
    await expect(element(by.id('sign-up-screen'))).toBeVisible();
  });
});
```

### Authentication Flow Testing
```typescript
// __tests__/e2e/authentication.test.ts
import { device, element, by, expect } from 'detox';

describe('Authentication Flow', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    
    // Navigate to sign up
    await element(by.id('get-started-button')).tap();
    await element(by.id('skip-onboarding-button')).tap();
  });

  it('completes user registration flow', async () => {
    // Fill registration form
    await element(by.id('first-name-input')).typeText('Ahmed');
    await element(by.id('last-name-input')).typeText('Ben Ali');
    await element(by.id('email-input')).typeText('ahmed@example.com');
    await element(by.id('password-input')).typeText('SecurePass123!');
    await element(by.id('confirm-password-input')).typeText('SecurePass123!');

    // Accept terms
    await element(by.id('terms-checkbox')).tap();

    // Submit registration
    await element(by.id('register-button')).tap();

    // Should show email verification screen
    await expect(element(by.id('email-verification-screen'))).toBeVisible();
    await expect(element(by.text('Check your email'))).toBeVisible();
  });

  it('handles registration validation errors', async () => {
    // Try to register with invalid email
    await element(by.id('email-input')).typeText('invalid-email');
    await element(by.id('password-input')).typeText('weak');
    await element(by.id('register-button')).tap();

    // Should show validation errors
    await expect(element(by.text('Please enter a valid email'))).toBeVisible();
    await expect(element(by.text('Password must be at least 8 characters'))).toBeVisible();
  });

  it('completes sign in flow', async () => {
    // Navigate to sign in
    await element(by.id('sign-in-link')).tap();
    await expect(element(by.id('sign-in-screen'))).toBeVisible();

    // Fill sign in form
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');

    // Sign in
    await element(by.id('sign-in-button')).tap();

    // Should navigate to main app
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('handles sign in errors', async () => {
    await element(by.id('sign-in-link')).tap();
    
    // Try to sign in with wrong credentials
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('sign-in-button')).tap();

    // Should show error message
    await expect(element(by.text('Invalid email or password'))).toBeVisible();
  });
});
```

### Transaction Management Testing
```typescript
// __tests__/e2e/transactions.test.ts
import { device, element, by, expect, waitFor } from 'detox';

describe('Transaction Management', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    
    // Sign in to authenticated state
    await element(by.id('sign-in-link')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('sign-in-button')).tap();
    
    // Navigate to transactions
    await element(by.id('tab-transactions')).tap();
  });

  it('creates a new transaction', async () => {
    // Open add transaction modal
    await element(by.id('add-transaction-button')).tap();
    await expect(element(by.id('add-transaction-modal'))).toBeVisible();

    // Fill transaction form
    await element(by.id('description-input')).typeText('Coffee at Starbucks');
    await element(by.id('amount-input')).typeText('5.50');
    await element(by.id('category-selector')).tap();
    await element(by.text('Food & Drinks')).tap();

    // Save transaction
    await element(by.id('save-transaction-button')).tap();

    // Should close modal and show transaction in list
    await expect(element(by.id('add-transaction-modal'))).not.toBeVisible();
    await expect(element(by.text('Coffee at Starbucks'))).toBeVisible();
    await expect(element(by.text('$5.50'))).toBeVisible();
  });

  it('edits an existing transaction', async () => {
    // Tap on existing transaction
    await element(by.text('Grocery shopping')).tap();
    await expect(element(by.id('transaction-detail-screen'))).toBeVisible();

    // Edit transaction
    await element(by.id('edit-transaction-button')).tap();
    await element(by.id('description-input')).clearText();
    await element(by.id('description-input')).typeText('Grocery shopping at Carrefour');
    await element(by.id('save-transaction-button')).tap();

    // Should show updated transaction
    await expect(element(by.text('Grocery shopping at Carrefour'))).toBeVisible();
  });

  it('deletes a transaction', async () => {
    // Long press on transaction to show context menu
    await element(by.text('Coffee purchase')).longPress();
    await expect(element(by.id('transaction-context-menu'))).toBeVisible();

    // Delete transaction
    await element(by.id('delete-transaction-button')).tap();
    await element(by.id('confirm-delete-button')).tap();

    // Transaction should be removed from list
    await expect(element(by.text('Coffee purchase'))).not.toBeVisible();
  });

  it('filters transactions by category', async () => {
    // Open filter menu
    await element(by.id('filter-button')).tap();
    await expect(element(by.id('filter-modal'))).toBeVisible();

    // Select food category
    await element(by.text('Food & Drinks')).tap();
    await element(by.id('apply-filter-button')).tap();

    // Should only show food transactions
    await expect(element(by.text('Coffee at Starbucks'))).toBeVisible();
    await expect(element(by.text('Salary payment'))).not.toBeVisible();
  });

  it('searches transactions', async () => {
    // Use search functionality
    await element(by.id('search-input')).typeText('coffee');

    // Should filter results
    await waitFor(element(by.text('Coffee at Starbucks'))).toBeVisible();
    await expect(element(by.text('Grocery shopping'))).not.toBeVisible();
  });
});
```

## 🎯 Testing Best Practices

### Test Data Management
```typescript
// __tests__/fixtures/data/transactions.ts
export const mockTransaction = {
  id: '1',
  description: 'Coffee at Café Central',
  amount: -5.50,
  currency: 'USD',
  category: 'Food',
  date: new Date('2024-01-15T10:30:00Z'),
  type: 'expense',
  location: {
    name: 'Café Central',
    address: 'Downtown Tunis'
  },
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z')
};

export const mockTransactions = [
  mockTransaction,
  {
    id: '2',
    description: 'Salary payment',
    amount: 3000,
    currency: 'TND',
    category: 'Income',
    date: new Date('2024-01-01T00:00:00Z'),
    type: 'income',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: '3',
    description: 'Grocery shopping',
    amount: -85.25,
    currency: 'TND',
    category: 'Food',
    date: new Date('2024-01-10T16:45:00Z'),
    type: 'expense',
    createdAt: new Date('2024-01-10T16:45:00Z'),
    updatedAt: new Date('2024-01-10T16:45:00Z')
  }
];

export const createMockTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  ...mockTransaction,
  id: Math.random().toString(36).substr(2, 9),
  ...overrides
});
```

### Mock Utilities
```typescript
// __tests__/fixtures/helpers/mocks.ts
import { jest } from '@jest/globals';

export const mockAsyncStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => Promise.resolve(store[key] || null)),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store)))
  };
};

export const mockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(() => 'test-id'),
  getParent: jest.fn(),
  getState: jest.fn(() => ({ routes: [], index: 0 }))
});

export const mockExpoSecureStore = () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  isAvailableAsync: jest.fn(() => Promise.resolve(true))
});

export const mockBiometrics = () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true }))
});
```

### Custom Matchers
```typescript
// __tests__/setup.ts
import '@testing-library/jest-native/extend-expect';

// Custom matcher for currency formatting
expect.extend({
  toBeFormattedCurrency(received: string, amount: number, currency: string) {
    const expectedFormats = {
      USD: `$${amount.toFixed(2)}`,
      TND: `${amount.toFixed(2)} دت`,
      EUR: `€${amount.toFixed(2)}`
    };

    const expected = expectedFormats[currency as keyof typeof expectedFormats];
    const pass = received === expected;

    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be formatted currency ${expected}`,
      pass
    };
  }
});

// Custom matcher for transaction amounts
expect.extend({
  toHaveCorrectTransactionAmount(received: any, expectedAmount: number) {
    const amount = received.props?.children || received;
    const numericAmount = parseFloat(amount.toString().replace(/[^-\d.]/g, ''));
    const pass = Math.abs(numericAmount - Math.abs(expectedAmount)) < 0.01;

    return {
      message: () =>
        `expected transaction amount ${amount} ${pass ? 'not ' : ''}to equal ${expectedAmount}`,
      pass
    };
  }
});

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock global modules
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage());
jest.mock('expo-secure-store', () => mockExpoSecureStore());
jest.mock('expo-local-authentication', () => mockBiometrics());
```

## 📊 Test Coverage & Reporting

### Coverage Configuration
```javascript
// jest.config.js - Coverage settings
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './app/auth/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './lib/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/coverage/',
    '.expo/',
    'app.config.js',
    'metro.config.js'
  ]
};
```

### Test Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest __tests__/unit",
    "test:integration": "jest __tests__/integration", 
    "test:e2e": "detox test",
    "test:e2e:build": "detox build",
    "test:ci": "jest --coverage --watchAll=false --passWithNoTests",
    "test:debug": "jest --runInBand --no-cache"
  }
}
```

### Test Report Generation
```typescript
// scripts/generate-test-report.ts
import fs from 'fs';
import path from 'path';

interface TestResults {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

export async function generateTestReport(): Promise<void> {
  const coverageData = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'coverage/coverage-summary.json'), 'utf8')
  );

  const report: TestResults = {
    totalTests: coverageData.total.lines.total,
    passedTests: coverageData.total.lines.covered,
    failedTests: coverageData.total.lines.total - coverageData.total.lines.covered,
    coverage: {
      lines: coverageData.total.lines.pct,
      functions: coverageData.total.functions.pct,
      branches: coverageData.total.branches.pct,
      statements: coverageData.total.statements.pct
    }
  };

  // Generate HTML report
  const htmlReport = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Finanza Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .metric { display: inline-block; margin: 20px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
          .pass { background-color: #d4edda; }
          .warn { background-color: #fff3cd; }
          .fail { background-color: #f8d7da; }
        </style>
      </head>
      <body>
        <h1>🧪 Finanza Test Report</h1>
        <div class="metric ${report.coverage.lines >= 80 ? 'pass' : 'fail'}">
          <h3>Line Coverage</h3>
          <p>${report.coverage.lines.toFixed(1)}%</p>
        </div>
        <div class="metric ${report.coverage.functions >= 80 ? 'pass' : 'fail'}">
          <h3>Function Coverage</h3>
          <p>${report.coverage.functions.toFixed(1)}%</p>
        </div>
        <div class="metric ${report.coverage.branches >= 80 ? 'pass' : 'fail'}">
          <h3>Branch Coverage</h3>
          <p>${report.coverage.branches.toFixed(1)}%</p>
        </div>
        <div class="metric ${report.coverage.statements >= 80 ? 'pass' : 'fail'}">
          <h3>Statement Coverage</h3>
          <p>${report.coverage.statements.toFixed(1)}%</p>
        </div>
      </body>
    </html>
  `;

  fs.writeFileSync(path.join(process.cwd(), 'coverage/test-report.html'), htmlReport);
  console.log('📊 Test report generated: coverage/test-report.html');
}
```

## 🚀 Continuous Testing

### GitHub Actions Integration
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup iOS Simulator
        run: |
          xcrun simctl create "iPhone 13" "iPhone 13" "iOS15.5"
          xcrun simctl boot "iPhone 13"
      
      - name: Build for E2E
        run: npm run test:e2e:build
      
      - name: Run E2E tests
        run: npm run test:e2e
```

---

This comprehensive testing guide ensures high-quality, reliable code through thorough testing at all levels. For questions about testing strategies or to contribute test cases, please refer to our [contribution guidelines](../README.md#contributing).
