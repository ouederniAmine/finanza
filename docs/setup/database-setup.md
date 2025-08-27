# 🗄️ Database Setup & Configuration Guide

## Overview

This comprehensive guide covers the complete database setup for the Finanza app, including Supabase configuration, schema migration, authentication integration, and testing procedures.

## Prerequisites

- ✅ Node.js and npm installed
- ✅ Expo CLI configured
- ✅ Supabase account created
- ✅ Git repository cloned locally

## Current System Status

### ✅ **Components Working**

| Component | Status | Description |
|-----------|--------|-------------|
| **Authentication System** | ✅ Active | Clerk authentication with account creation and login |
| **Onboarding Flow** | ✅ Complete | All onboarding screens functional with data collection |
| **Network Layer** | ✅ Resolved | All "Network request failed" issues fixed |
| **App Navigation** | ✅ Active | File-based routing and tab navigation working |

### 🔄 **Database Integration Status**

| Feature | Status | Notes |
|---------|--------|--------|
| **Database Schema** | ✅ Ready | Complete SQL migration scripts available |
| **Data Persistence** | 🔄 Configuration Required | Awaiting database setup completion |
| **User Data Sync** | 🔄 Configuration Required | Clerk + Supabase sync ready for activation |

## Database Setup Options

### Option 1: Use Existing Supabase Project (Recommended)

If you have an existing Supabase project:

#### **Step 1: Access Your Project**
```bash
# Navigate to Supabase Dashboard
URL: https://supabase.com/dashboard
Project ID: gokqzjpobpxmjqrvfzpq (if available)
```

#### **Step 2: Run Migration Scripts**
1. **Open SQL Editor**
   ```
   Dashboard → SQL Editor → New Query
   ```

2. **Execute Migration**
   ```sql
   -- Copy contents from supabase-migration.sql
   -- This includes all tables, policies, and initial data
   ```

3. **Verify Setup**
   ```
   Dashboard → Table Editor
   Confirm tables: users, transactions, budgets, goals, etc.
   ```

### Option 2: Create New Supabase Project

For a fresh installation:

#### **Step 1: Create Project**
1. **Visit Supabase**
   ```
   URL: https://supabase.com
   Click: "New Project"
   ```

2. **Project Configuration**
   ```
   Name: finanza-app
   Database Password: [Generate secure password]
   Region: [Select closest to your users]
   ```

3. **Save Credentials**
   ```
   Project URL: https://[project-id].supabase.co
   Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Service Role Key: [Keep secure, for admin operations]
   ```

#### **Step 2: Configure Environment**

Update your environment variables:

```bash
# .env.local or .env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key-here
```

#### **Step 3: Update Supabase Client**

Modify `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### **Step 4: Execute Database Schema**

Run the complete migration script from `supabase-migration.sql`:

```sql
-- 1. Create all tables
-- 2. Set up Row Level Security (RLS)
-- 3. Create indexes for performance
-- 4. Insert default categories and settings
-- 5. Configure authentication triggers
```

### Option 3: Development Mode (Database-Free Testing)

For immediate testing without database setup:

#### **Current Capabilities**
```typescript
// The app currently supports:
✅ Complete user registration and authentication
✅ Full onboarding flow with data collection
✅ Console logging of all collected data
✅ Navigation between all screens
✅ Form validation and error handling
```

#### **Test Workflow**
1. **Account Creation**
   ```
   Register → Email verification → Login
   ```

2. **Onboarding Process**
   ```
   Profile setup → Financial goals → Preferences → Complete
   ```

3. **Data Verification**
   ```
   Check browser console for logged data
   All form submissions logged with structure
   ```

## Enabling Database Persistence

### Step 1: Uncomment Database Integration Code

Update the following files to enable database saving:

#### **Authentication Integration**
```typescript
// app/auth/signup.tsx
// Uncomment: Profile creation on successful signup
await userService.createUserProfile(userData);
```

#### **Onboarding Data Persistence**
```typescript
// app/onboarding/profile.tsx
// Uncomment: Profile data saving
await userService.updateProfile(profileData);

// app/onboarding/preferences.tsx  
// Uncomment: Preferences saving
await userService.updatePreferences(preferences);

// app/onboarding/financial.tsx
// Uncomment: Financial data saving
await userService.updateFinancialData(financialData);

// app/onboarding/complete.tsx
// Uncomment: Mark onboarding as completed
await userService.completeOnboarding(userId);
```

#### **App State Management**
```typescript
// app/index.tsx
// Uncomment: Check onboarding completion status
const { isOnboardingComplete } = await userService.getOnboardingStatus();
```

### Step 2: Verify Integration

#### **Database Verification Checklist**

| Verification Step | Expected Result |
|------------------|-----------------|
| **User Registration** | New record in `users` table |
| **Profile Update** | Data saved in `user_profiles` table |
| **Onboarding Completion** | `onboarding_completed` = true |
| **Authentication State** | Clerk user synced with Supabase |

#### **Testing Commands**
```bash
# Start development server
npm start

# Check app logs
npx expo logs

# Monitor Supabase real-time
# Dashboard → Logs → Real-time logs
```

## Database Schema Overview

### Core Tables Structure

```sql
-- Users and Authentication
├── users (Clerk user sync)
├── user_profiles (Extended user data)
├── user_preferences (App settings)

-- Financial Data
├── transactions (Income/expense records)
├── categories (Transaction categories)
├── budgets (Budget management)
├── savings_goals (Financial targets)
├── debts (Debt tracking)

-- App Features  
├── notifications (Push notifications)
├── reminders (Calendar reminders)
└── onboarding_steps (Onboarding progress)
```

### Security Implementation

#### **Row Level Security (RLS)**
```sql
-- All tables protected with RLS policies
✅ Users can only access their own data
✅ Automatic user filtering on all queries
✅ Secure API access with Supabase Auth
```

#### **Data Protection**
- **Encryption**: All data encrypted at rest and in transit
- **Authentication**: Clerk session validation required
- **Authorization**: Fine-grained permissions per table
- **Audit Trail**: Created/updated timestamps on all records

## Testing & Verification

### Comprehensive Testing Workflow

#### **Phase 1: Authentication Testing**
```typescript
// Test user registration
1. Create new account
2. Verify email confirmation
3. Complete login process
4. Check Supabase users table

// Expected Result: User record exists with Clerk ID
```

#### **Phase 2: Onboarding Testing**
```typescript
// Test complete onboarding flow
1. Navigate through all onboarding screens
2. Fill out all required information
3. Submit each form
4. Complete onboarding process

// Expected Result: All data saved across multiple tables
```

#### **Phase 3: Data Persistence Testing**
```typescript
// Test data retrieval
1. Log out and log back in
2. Verify all onboarding data preserved
3. Navigate to main app screens
4. Confirm user preferences applied

// Expected Result: Persistent user experience
```

### Debugging and Troubleshooting

#### **Common Issues and Solutions**

| Issue | Cause | Solution |
|-------|-------|----------|
| **Connection Refused** | Invalid Supabase URL | Verify environment variables |
| **Permission Denied** | RLS policy issue | Check user authentication state |
| **Data Not Saving** | Commented code | Uncomment database integration |
| **Authentication Errors** | Clerk/Supabase sync issue | Verify user ID mapping |

#### **Debug Commands**
```bash
# Check environment variables
echo $EXPO_PUBLIC_SUPABASE_URL
echo $EXPO_PUBLIC_SUPABASE_ANON_KEY

# Test Supabase connection
curl -X GET "$EXPO_PUBLIC_SUPABASE_URL/rest/v1/" \
  -H "apikey: $EXPO_PUBLIC_SUPABASE_ANON_KEY"

# Monitor real-time logs
npx expo logs --follow
```

## Performance Optimization

### Database Indexing
```sql
-- Performance indexes already included in migration
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at);
CREATE INDEX idx_budgets_user_active ON budgets(user_id, is_active);
```

### Query Optimization
- **Prepared Statements**: All queries use parameterized statements
- **Result Limiting**: Pagination implemented for large datasets
- **Selective Loading**: Only necessary columns retrieved
- **Connection Pooling**: Supabase handles connection management

## Next Steps After Setup

### Immediate Actions
1. **✅ Complete database migration**
2. **✅ Uncomment integration code**
3. **✅ Test complete user flow**
4. **✅ Verify data persistence**

### Future Enhancements
1. **📊 Analytics Integration** - User behavior tracking
2. **🔄 Real-time Sync** - Live data updates across devices
3. **📱 Offline Support** - Local data caching for offline usage
4. **🎯 Performance Monitoring** - Query performance optimization

## Related Documentation

- **[Calendar Setup Guide](./calendar-setup.md)** - Calendar feature integration
- **[Development Guide](../DEVELOPMENT.md)** - Complete development environment
- **[Migration Documentation](../migrations/)** - Clerk and Supabase migration history
- **[Technical Architecture](../TECHNICAL_ARCHITECTURE.md)** - System architecture overview
- **[API Documentation](../API.md)** - Database API reference
1. ✅ Create new accounts
2. ✅ Log in with existing accounts
3. ✅ Go through the complete onboarding flow
4. ✅ See all collected data in the console logs
5. ✅ Navigate to the main app after onboarding

## Database Schema Overview

The `profiles` table will store:
- Basic user info (name, age, profession)
- Financial data (income, savings goals, etc.)
- Preferences (language, notifications, etc.)
- Onboarding completion status

## Notes
- Authentication works with Supabase Auth (no custom tables needed)
- Row Level Security (RLS) is enabled for user data protection
- All user data is only accessible by the user who owns it
