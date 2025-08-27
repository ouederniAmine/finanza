# 📡 API Documentation for Finanza

This document outlines the API structure, data models, and integration patterns for Finanza.

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Webhooks](#webhooks)
- [SDK Usage](#sdk-usage)

## Overview

Finanza uses a RESTful API architecture with the following characteristics:

- **Base URL**: `https://api.finanza.tn/v1`
- **Authentication**: JWT tokens with refresh mechanism
- **Format**: JSON for all requests and responses
- **Versioning**: URL-based versioning (`/v1/`)
- **Rate Limiting**: 1000 requests per hour per user
- **HTTPS**: All endpoints require HTTPS

## Authentication

### JWT Token Flow

```typescript
// Login Request
POST /auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "Ahmed Ben Ali",
      "preferences": {
        "language": "tn",
        "currency": "TND"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

### Token Usage

```typescript
// Include in all authenticated requests
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
  'Content-Type': 'application/json'
}
```

### Refresh Token

```typescript
POST /auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600
  }
}
```

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

interface UserPreferences {
  language: 'tn' | 'ar' | 'fr' | 'en';
  currency: 'TND' | 'USD' | 'EUR';
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
}

interface NotificationSettings {
  budgetAlerts: boolean;
  goalReminders: boolean;
  transactionAlerts: boolean;
  weeklyReports: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
}
```

### Transaction Model
```typescript
interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  category: TransactionCategory;
  description: string;
  date: string;
  paymentMethod?: PaymentMethod;
  location?: Location;
  tags?: string[];
  attachments?: Attachment[];
  recurringId?: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'bank_transfer' | 'mobile_payment';
  lastFourDigits?: string;
}
```

### Budget Model
```typescript
interface Budget {
  id: string;
  userId: string;
  name: string;
  amount: number;
  spent: number;
  currency: string;
  period: 'weekly' | 'monthly' | 'yearly';
  categories: string[];
  startDate: string;
  endDate: string;
  alertThreshold: number; // Percentage (0-100)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Savings Goal Model
```typescript
interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: string;
  category: GoalCategory;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

interface GoalCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Milestone {
  id: string;
  amount: number;
  date: string;
  note?: string;
  isCompleted: boolean;
}
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

```typescript
// Request
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Ahmed Ben Ali",
  "preferences": {
    "language": "tn",
    "currency": "TND"
  }
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "user": User,
    "tokens": {
      "accessToken": string,
      "refreshToken": string,
      "expiresIn": number
    }
  },
  "message": "User registered successfully"
}
```

#### POST /auth/login
Authenticate user and receive tokens.

#### POST /auth/logout
Invalidate user session.

#### POST /auth/forgot-password
Send password reset email.

#### POST /auth/reset-password
Reset password with token.

### User Endpoints

#### GET /users/profile
Get current user profile.

```typescript
// Response (200 OK)
{
  "success": true,
  "data": User
}
```

#### PUT /users/profile
Update user profile.

```typescript
// Request
{
  "name": "Ahmed Ben Ali",
  "phone": "+216 12 345 678",
  "preferences": {
    "language": "tn",
    "currency": "TND",
    "theme": "dark"
  }
}

// Response (200 OK)
{
  "success": true,
  "data": User,
  "message": "Profile updated successfully"
}
```

#### DELETE /users/account
Delete user account.

### Transaction Endpoints

#### GET /transactions
Get user transactions with pagination and filtering.

```typescript
// Query Parameters
{
  page?: number;          // Default: 1
  limit?: number;         // Default: 20, Max: 100
  type?: 'income' | 'expense' | 'transfer';
  category?: string;      // Category ID
  startDate?: string;     // ISO date
  endDate?: string;       // ISO date
  search?: string;        // Search in description
  sortBy?: 'date' | 'amount' | 'description';
  sortOrder?: 'asc' | 'desc'; // Default: 'desc'
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "transactions": Transaction[],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 95,
      "limit": 20,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### POST /transactions
Create a new transaction.

```typescript
// Request
{
  "amount": 25.50,
  "type": "expense",
  "category": "category_food",
  "description": "قهوة الصباح",
  "date": "2024-01-15T08:30:00Z",
  "paymentMethod": "payment_cash",
  "tags": ["coffee", "morning"]
}

// Response (201 Created)
{
  "success": true,
  "data": Transaction,
  "message": "Transaction created successfully"
}
```

#### GET /transactions/:id
Get specific transaction.

#### PUT /transactions/:id
Update transaction.

#### DELETE /transactions/:id
Delete transaction.

### Budget Endpoints

#### GET /budgets
Get user budgets.

```typescript
// Query Parameters
{
  period?: 'weekly' | 'monthly' | 'yearly';
  isActive?: boolean;
  category?: string;
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "budgets": Budget[],
    "summary": {
      "totalBudgeted": 1500,
      "totalSpent": 1200,
      "remainingAmount": 300,
      "percentageUsed": 80
    }
  }
}
```

#### POST /budgets
Create new budget.

#### PUT /budgets/:id
Update budget.

#### DELETE /budgets/:id
Delete budget.

### Savings Goal Endpoints

#### GET /savings-goals
Get user savings goals.

#### POST /savings-goals
Create new savings goal.

#### PUT /savings-goals/:id
Update savings goal.

#### POST /savings-goals/:id/milestones
Add milestone to savings goal.

#### DELETE /savings-goals/:id
Delete savings goal.

### Analytics Endpoints

#### GET /analytics/summary
Get financial summary.

```typescript
// Query Parameters
{
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate?: string;
  endDate?: string;
}

// Response (200 OK)
{
  "success": true,
  "data": {
    "totalIncome": 2500,
    "totalExpenses": 1800,
    "netAmount": 700,
    "transactionCount": 45,
    "categoryBreakdown": {
      "food": 450,
      "transport": 300,
      "entertainment": 200
    },
    "dailyTrends": [
      { "date": "2024-01-01", "income": 0, "expenses": 35 },
      { "date": "2024-01-02", "income": 2500, "expenses": 120 }
    ]
  }
}
```

#### GET /analytics/spending-patterns
Get spending pattern analysis.

#### GET /analytics/budget-performance
Get budget performance metrics.

### Category Endpoints

#### GET /categories
Get transaction categories.

```typescript
// Response (200 OK)
{
  "success": true,
  "data": {
    "income": TransactionCategory[],
    "expense": TransactionCategory[]
  }
}
```

## Error Handling

### Error Response Format
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "amount",
        "message": "Amount must be greater than 0"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Client Error Handling
```typescript
// api/client.ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        // Token expired, try refresh
        await refreshToken();
        // Retry request
        return apiRequest(endpoint, options);
      }
      
      return {
        success: false,
        error: data.error,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server',
      },
    };
  }
}
```

## Rate Limiting

### Limits
- **Authentication**: 10 requests per minute
- **General API**: 1000 requests per hour
- **File uploads**: 50 requests per hour
- **Analytics**: 100 requests per hour

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642680000
Retry-After: 3600
```

### Handling Rate Limits
```typescript
export async function apiRequestWithRetry<T>(
  endpoint: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<ApiResponse<T>> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await apiRequest<T>(endpoint, options);
    
    if (response.success) {
      return response;
    }
    
    if (response.error?.code === 'RATE_LIMIT_EXCEEDED' && attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    
    return response;
  }
  
  throw new Error('Max retries exceeded');
}
```

## Webhooks

### Webhook Events
```typescript
interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: any;
  timestamp: string;
  userId: string;
}

type WebhookEventType = 
  | 'transaction.created'
  | 'transaction.updated'
  | 'transaction.deleted'
  | 'budget.exceeded'
  | 'goal.achieved'
  | 'user.profile.updated';
```

### Webhook Payload Example
```typescript
// Budget exceeded webhook
{
  "id": "evt_123456789",
  "type": "budget.exceeded",
  "data": {
    "budget": Budget,
    "exceededAmount": 150.00,
    "exceededPercentage": 125
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "userId": "user_123"
}
```

## SDK Usage

### Installation
```bash
npm install @finanza/sdk
```

### Basic Setup
```typescript
import { FinanzaSDK } from '@finanza/sdk';

const finanza = new FinanzaSDK({
  apiKey: 'your_api_key',
  baseURL: 'https://api.finanza.tn/v1',
  timeout: 10000,
});

// Authenticate
await finanza.auth.login('user@example.com', 'password');

// Create transaction
const transaction = await finanza.transactions.create({
  amount: 25.50,
  type: 'expense',
  category: 'food',
  description: 'قهوة الصباح',
});

// Get budgets
const budgets = await finanza.budgets.list({
  period: 'monthly',
  isActive: true,
});

// Create savings goal
const goal = await finanza.savingsGoals.create({
  name: 'سفر إلى دبي',
  targetAmount: 3000,
  targetDate: '2024-12-31',
  category: 'travel',
});
```

### React Native Integration
```typescript
// hooks/useFinanzaAPI.ts
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async (filters?: TransactionFilters) => {
    setLoading(true);
    try {
      const response = await finanza.transactions.list(filters);
      if (response.success) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTransaction = useCallback(async (data: CreateTransactionData) => {
    try {
      const response = await finanza.transactions.create(data);
      if (response.success) {
        setTransactions(prev => [response.data, ...prev]);
        return response.data;
      }
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    transactions,
    loading,
    fetchTransactions,
    createTransaction,
  };
}
```

---

This API documentation provides a comprehensive guide for integrating with Finanza's backend services. For additional support or questions, please refer to our [developer portal](https://developers.finanza.tn) or contact our API support team.
