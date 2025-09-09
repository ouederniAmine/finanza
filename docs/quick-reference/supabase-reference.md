# 🚀 Supabase Quick Reference for Finanza

> **Essential Supabase operations, queries, and troubleshooting for daily development**

## 📋 Quick Access

| Operation | Command/Query | Use Case |
|-----------|---------------|----------|
| **Test Connection** | `SELECT current_database();` | Verify database access |
| **Check Auth User** | `SELECT auth.uid();` | Verify user authentication |
| **Reset RLS** | `ALTER TABLE [table] DISABLE ROW LEVEL SECURITY;` | Debug policy issues |
| **View Policies** | `\dp [table_name]` | Check existing policies |
| **Check Indexes** | `\di` | Performance optimization |

## 🔍 Common Queries

### **User Management**
```sql
-- Get current user profile
SELECT * FROM users WHERE id = auth.uid();

-- Create new user (handled by Clerk)
INSERT INTO users (id, email, full_name) 
VALUES (auth.uid(), 'user@example.com', 'User Name');

-- Update user preferences
UPDATE users 
SET preferred_language = 'ar', preferred_currency = 'TND'
WHERE id = auth.uid();
```

### **Categories Operations**
```sql
-- Get user's categories + defaults
SELECT * FROM categories 
WHERE user_id = auth.uid() OR user_id IS NULL
ORDER BY is_default DESC, name_tn;

-- Create custom category
INSERT INTO categories (user_id, name_tn, name_en, icon, type, color)
VALUES (auth.uid(), 'فئة جديدة', 'New Category', '📱', 'expense', '#FF5733');

-- Get expense categories only
SELECT * FROM categories 
WHERE type = 'expense' AND (user_id = auth.uid() OR user_id IS NULL);
```

### **Transactions Operations**
```sql
-- Add new transaction
INSERT INTO transactions (user_id, category_id, amount, type, description_tn, transaction_date)
VALUES (auth.uid(), '[category-uuid]', 50.00, 'expense', 'شراء طعام', CURRENT_DATE);

-- Get recent transactions
SELECT t.*, c.name_tn as category_name, c.icon
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = auth.uid()
ORDER BY t.transaction_date DESC, t.created_at DESC
LIMIT 20;

-- Monthly spending summary
SELECT 
  DATE_TRUNC('month', transaction_date) as month,
  SUM(amount) as total_spent,
  COUNT(*) as transaction_count
FROM transactions 
WHERE user_id = auth.uid() AND type = 'expense'
GROUP BY DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;
```

### **Budget Operations**
```sql
-- Create monthly budget
INSERT INTO budgets (user_id, category_id, name_tn, amount, period, start_date, end_date)
VALUES (
  auth.uid(), 
  '[category-uuid]', 
  'ميزانية الطعام', 
  300.00, 
  'monthly',
  DATE_TRUNC('month', CURRENT_DATE),
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')
);

-- Check budget usage
SELECT 
  b.*,
  c.name_tn as category_name,
  COALESCE(spent.total, 0) as actual_spent,
  (b.amount - COALESCE(spent.total, 0)) as remaining
FROM budgets b
LEFT JOIN categories c ON b.category_id = c.id
LEFT JOIN (
  SELECT 
    category_id,
    SUM(amount) as total
  FROM transactions 
  WHERE user_id = auth.uid() 
    AND type = 'expense'
    AND transaction_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY category_id
) spent ON b.category_id = spent.category_id
WHERE b.user_id = auth.uid() AND b.is_active = true;
```

### **Savings Goals Operations**
```sql
-- Create savings goal
INSERT INTO savings_goals (user_id, title_tn, target_amount, target_date, priority)
VALUES (auth.uid(), 'شراء سيارة', 15000.00, '2025-12-31', 'high');

-- Update progress
UPDATE savings_goals 
SET current_amount = current_amount + 500.00
WHERE id = '[goal-uuid]' AND user_id = auth.uid();

-- Check goal progress
SELECT 
  *,
  (current_amount / target_amount * 100) as progress_percentage,
  (target_amount - current_amount) as remaining_amount,
  CASE 
    WHEN target_date IS NOT NULL THEN (target_date - CURRENT_DATE)
    ELSE NULL
  END as days_remaining
FROM savings_goals 
WHERE user_id = auth.uid() AND is_achieved = false;
```

## 🔐 Security & RLS

### **Test RLS Policies**
```sql
-- Should return only user's data
SELECT auth.uid() as current_user_id;
SELECT * FROM transactions LIMIT 5;
SELECT * FROM budgets LIMIT 5;

-- Test with different user (should return empty)
SELECT set_config('request.jwt.claims', '{"sub": "different-user-id"}', true);
SELECT * FROM transactions LIMIT 5; -- Should return nothing
```

### **Debug Policy Issues**
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;

-- View existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'transactions';

-- Temporarily disable RLS for debugging (use with caution!)
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable:
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
```

## 📊 Performance Monitoring

### **Check Query Performance**
```sql
-- Analyze slow queries
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM transactions 
WHERE user_id = '[user-id]' 
  AND transaction_date >= '2024-01-01'
ORDER BY transaction_date DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### **Database Statistics**
```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Row counts
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public';
```

## 🛠️ Maintenance Operations

### **Data Cleanup**
```sql
-- Remove old notifications (older than 90 days)
DELETE FROM notifications 
WHERE created_at < CURRENT_DATE - INTERVAL '90 days'
  AND is_read = true;

-- Archive old transactions (optional)
CREATE TABLE transactions_archive AS 
SELECT * FROM transactions 
WHERE transaction_date < CURRENT_DATE - INTERVAL '2 years';

-- Clean up settled debts (older than 1 year)
DELETE FROM debts 
WHERE is_settled = true 
  AND settlement_date < CURRENT_DATE - INTERVAL '1 year';
```

### **Index Maintenance**
```sql
-- Reindex for performance
REINDEX TABLE public.transactions;
REINDEX TABLE public.budgets;

-- Update table statistics
ANALYZE public.transactions;
ANALYZE public.budgets;
ANALYZE public.savings_goals;
```

## 🔧 Environment Setup

### **Development Environment**
```bash
# Test connection
psql "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"

# Using Prisma
npx prisma studio  # Visual database browser
npx prisma db pull # Sync schema changes
npx prisma generate # Update client
```

### **Common Environment Variables**
```env
# Development
EXPO_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

# Production
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres?sslmode=require
```

## 🚨 Troubleshooting

### **Common Error Solutions**

| Error | Cause | Solution |
|-------|-------|----------|
| `connection refused` | Wrong URL/credentials | Check DATABASE_URL format |
| `row level security policy` | Missing/wrong RLS policy | Verify auth.uid() returns UUID |
| `relation does not exist` | Table not created | Run schema setup SQL |
| `permission denied` | Missing grants | Check table permissions |
| `invalid JWT` | Wrong auth setup | Verify Supabase keys |

### **Quick Diagnostics**
```sql
-- Check database connection
SELECT current_database(), current_user, version();

-- Check authentication
SELECT auth.uid(), auth.jwt();

-- Check table existence
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **SQL Reference**: https://www.postgresql.org/docs/
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Performance**: https://supabase.com/docs/guides/platform/performance

---

*This quick reference is part of the Finanza documentation. For complete setup instructions, see [Supabase Setup Guide](./supabase-setup.md)*
