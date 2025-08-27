# 🗄️ Database Patterns

> **Master Supabase operations** - Copy-paste ready patterns for all common database operations in Finanza.

## ⚡ **Quick Pattern Index**

| Operation | Pattern | Use Case |
|-----------|---------|----------|
| **[User Sync](#user-sync)** | Clerk → Supabase sync | Authentication integration |
| **[CRUD Operations](#crud-operations)** | Create, Read, Update, Delete | All data operations |
| **[Real-time](#real-time)** | Live data updates | Dashboard, notifications |
| **[Queries](#advanced-queries)** | Filtering, sorting, pagination | Data display |
| **[Transactions](#database-transactions)** | Atomic operations | Financial operations |

---

## 🔐 **User Authentication & Sync**

### **User Sync Pattern**
```typescript
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';

// Check if user exists in Supabase
export async function ensureUserExists() {
  const { user } = useUser();
  if (!user) return null;

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', user.id)
    .single();

  if (!existingUser) {
    // Create user in Supabase
    const { data, error } = await supabase
      .from('users')
      .insert({
        clerk_id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  return existingUser;
}

// Get current user's Supabase ID
export function useSupabaseUserId() {
  const { user } = useUser();
  
  const getUserId = async () => {
    if (!user) return null;
    
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', user.id)
      .single();
      
    return data?.id;
  };
  
  return { getUserId };
}
```

---

## 📝 **CRUD Operations**

### **Create (Insert) Patterns**
```typescript
// Single record insert
export async function createTransaction(transactionData: TransactionData) {
  const { user } = useUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transactionData,
      user_id: user.id,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Bulk insert
export async function createTransactions(transactions: TransactionData[]) {
  const { user } = useUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .insert(
      transactions.map(t => ({
        ...t,
        user_id: user.id,
        created_at: new Date().toISOString()
      }))
    )
    .select();

  if (error) throw error;
  return data;
}

// Insert with relationships
export async function createBudgetWithCategories(budgetData: BudgetData) {
  const { user } = useUser();
  if (!user) throw new Error('User not authenticated');

  // Create budget
  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .insert({
      name: budgetData.name,
      total_amount: budgetData.totalAmount,
      user_id: user.id
    })
    .select()
    .single();

  if (budgetError) throw budgetError;

  // Create budget categories
  const { data: categories, error: categoriesError } = await supabase
    .from('budget_categories')
    .insert(
      budgetData.categories.map(cat => ({
        budget_id: budget.id,
        category_id: cat.categoryId,
        allocated_amount: cat.allocatedAmount
      }))
    )
    .select();

  if (categoriesError) throw categoriesError;

  return { budget, categories };
}
```

### **Read (Select) Patterns**
```typescript
// Basic select with user filter
export async function getUserTransactions() {
  const { user } = useUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Select with joins
export async function getTransactionsWithCategories() {
  const { user } = useUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        id,
        name,
        icon,
        color
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Filtered select
export async function getTransactionsByDateRange(startDate: string, endDate: string) {
  const { user } = useUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (name, icon, color)
    `)
    .eq('user_id', user.id)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Paginated select
export async function getTransactionsPaginated(page: number, limit: number = 20) {
  const { user } = useUser();
  if (!user) return { data: [], hasMore: false };

  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data || [],
    hasMore: (count || 0) > to + 1,
    total: count || 0
  };
}
```

### **Update Patterns**
```typescript
// Simple update
export async function updateTransaction(id: string, updates: Partial<TransactionData>) {
  const { user } = useUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Conditional update
export async function updateUserProfile(updates: Partial<UserProfile>) {
  const { user } = useUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('clerk_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Bulk update
export async function markNotificationsAsRead(notificationIds: string[]) {
  const { user } = useUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('notifications')
    .update({ 
      is_read: true,
      read_at: new Date().toISOString()
    })
    .in('id', notificationIds)
    .eq('user_id', user.id)
    .select();

  if (error) throw error;
  return data;
}
```

### **Delete Patterns**
```typescript
// Single delete
export async function deleteTransaction(id: string) {
  const { user } = useUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

// Soft delete (mark as deleted)
export async function softDeleteBudget(id: string) {
  const { user } = useUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Bulk delete
export async function deleteOldNotifications(olderThan: string) {
  const { user } = useUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id)
    .lt('created_at', olderThan);

  if (error) throw error;
}
```

---

## 📊 **Advanced Queries**

### **Aggregation Queries**
```typescript
// Sum and count
export async function getTransactionSummary(startDate: string, endDate: string) {
  const { user } = useUser();
  if (!user) return null;

  const { data, error } = await supabase
    .rpc('get_transaction_summary', {
      user_id: user.id,
      start_date: startDate,
      end_date: endDate
    });

  if (error) throw error;
  return data;
}

// Custom RPC function for complex queries
export async function getBudgetProgress(budgetId: string) {
  const { user } = useUser();
  if (!user) return null;

  const { data, error } = await supabase
    .rpc('get_budget_progress', {
      budget_id: budgetId,
      user_id: user.id
    });

  if (error) throw error;
  return data;
}

// Group by queries using RPC
export async function getExpensesByCategory(month: string) {
  const { user } = useUser();
  if (!user) return [];

  const { data, error } = await supabase
    .rpc('get_expenses_by_category', {
      user_id: user.id,
      target_month: month
    });

  if (error) throw error;
  return data;
}
```

### **Search Queries**
```typescript
// Text search
export async function searchTransactions(query: string) {
  const { user } = useUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (name, icon, color)
    `)
    .eq('user_id', user.id)
    .or(`description.ilike.%${query}%,note.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

// Filter combinations
export async function getFilteredTransactions(filters: TransactionFilters) {
  const { user } = useUser();
  if (!user) return [];

  let query = supabase
    .from('transactions')
    .select(`
      *,
      categories (name, icon, color)
    `)
    .eq('user_id', user.id);

  // Add filters conditionally
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }

  if (filters.minAmount) {
    query = query.gte('amount', filters.minAmount);
  }

  if (filters.maxAmount) {
    query = query.lte('amount', filters.maxAmount);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
}
```

---

## 🔄 **Real-time Subscriptions**

### **Basic Real-time**
```typescript
import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    let channel: RealtimeChannel;

    const setupRealtime = async () => {
      // Initial fetch
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setTransactions(data || []);

      // Set up real-time subscription
      channel = supabase
        .channel('transactions_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time update:', payload);
            
            if (payload.eventType === 'INSERT') {
              setTransactions(prev => [payload.new as Transaction, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setTransactions(prev => 
                prev.map(t => t.id === payload.new.id ? payload.new as Transaction : t)
              );
            } else if (payload.eventType === 'DELETE') {
              setTransactions(prev => 
                prev.filter(t => t.id !== payload.old.id)
              );
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user]);

  return transactions;
}
```

### **Real-time with React Query**
```typescript
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useRealtimeBalance() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const { data: balance } = useQuery({
    queryKey: ['balance', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data } = await supabase
        .rpc('get_user_balance', { user_id: user.id });
      
      return data;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('balance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Invalidate balance query to refetch
          queryClient.invalidateQueries({ queryKey: ['balance', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return balance;
}
```

---

## 💰 **Database Transactions**

### **Simple Transaction**
```typescript
export async function transferBetweenAccounts(
  fromAccountId: string, 
  toAccountId: string, 
  amount: number
) {
  const { user } = useUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.rpc('transfer_between_accounts', {
    from_account_id: fromAccountId,
    to_account_id: toAccountId,
    transfer_amount: amount,
    user_id: user.id
  });

  if (error) throw error;
  return data;
}

// Corresponding SQL function (create in Supabase)
/*
CREATE OR REPLACE FUNCTION transfer_between_accounts(
  from_account_id UUID,
  to_account_id UUID,
  transfer_amount DECIMAL,
  user_id TEXT
) RETURNS VOID AS $$
BEGIN
  -- Check if both accounts belong to user
  IF NOT EXISTS (
    SELECT 1 FROM accounts 
    WHERE id IN (from_account_id, to_account_id) 
    AND user_id = user_id
  ) THEN
    RAISE EXCEPTION 'Invalid account access';
  END IF;

  -- Check sufficient balance
  IF (SELECT balance FROM accounts WHERE id = from_account_id) < transfer_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Perform transfer
  UPDATE accounts SET balance = balance - transfer_amount WHERE id = from_account_id;
  UPDATE accounts SET balance = balance + transfer_amount WHERE id = to_account_id;

  -- Create transaction records
  INSERT INTO transactions (user_id, account_id, amount, type, description) VALUES
    (user_id, from_account_id, -transfer_amount, 'transfer_out', 'Transfer to account'),
    (user_id, to_account_id, transfer_amount, 'transfer_in', 'Transfer from account');
END;
$$ LANGUAGE plpgsql;
*/
```

---

## 🔍 **Error Handling Patterns**

### **Comprehensive Error Handling**
```typescript
export async function safeDataOperation<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  errorHandler?: (error: any) => void
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    
    if (errorHandler) {
      errorHandler(error);
    }
    
    return fallbackValue;
  }
}

// Usage
const transactions = await safeDataOperation(
  () => getUserTransactions(),
  [], // fallback to empty array
  (error) => {
    Toast.show({
      type: 'error',
      text1: 'Failed to load transactions',
      text2: 'Please try again later'
    });
  }
);
```

### **Retry Pattern**
```typescript
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Usage
const data = await withRetry(() => getUserTransactions());
```

---

## 📈 **Performance Patterns**

### **Optimistic Updates**
```typescript
export function useOptimisticTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const addTransactionOptimistic = async (transactionData: TransactionData) => {
    // Create optimistic transaction with temporary ID
    const optimisticTransaction: Transaction = {
      id: `temp-${Date.now()}`,
      ...transactionData,
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    
    // Add optimistically
    setTransactions(prev => [optimisticTransaction, ...prev]);
    
    try {
      // Perform actual database operation
      const realTransaction = await createTransaction(transactionData);
      
      // Replace optimistic with real data
      setTransactions(prev => 
        prev.map(t => 
          t.id === optimisticTransaction.id ? realTransaction : t
        )
      );
    } catch (error) {
      // Remove optimistic transaction on error
      setTransactions(prev => 
        prev.filter(t => t.id !== optimisticTransaction.id)
      );
      throw error;
    }
  };
  
  return { transactions, addTransactionOptimistic };
}
```

### **Batch Operations**
```typescript
export async function batchUpdateTransactions(updates: TransactionUpdate[]) {
  const { user } = useUser();
  if (!user) throw new Error('User not authenticated');

  // Group updates by operation type
  const updateGroups = updates.reduce((groups, update) => {
    const key = JSON.stringify(update.changes);
    if (!groups[key]) groups[key] = [];
    groups[key].push(update.id);
    return groups;
  }, {} as Record<string, string[]>);

  // Execute batch updates
  const promises = Object.entries(updateGroups).map(([changesStr, ids]) => {
    const changes = JSON.parse(changesStr);
    return supabase
      .from('transactions')
      .update({
        ...changes,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .eq('user_id', user.id);
  });

  const results = await Promise.all(promises);
  
  // Check for errors
  const errors = results.filter(result => result.error);
  if (errors.length > 0) {
    throw new Error(`Batch update failed: ${errors.map(e => e.error?.message).join(', ')}`);
  }
  
  return results;
}
```

---

**🎯 Pro Tips:**
- Always filter by `user_id` to ensure data isolation
- Use RPC functions for complex operations
- Implement optimistic updates for better UX
- Add proper error handling and retry logic
- Use real-time subscriptions for live data
- Batch operations when possible for performance

**📚 Next**: Check out [Workflows](../workflows/) for complete development processes!
