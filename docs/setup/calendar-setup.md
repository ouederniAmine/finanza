# 📅 Calendar Feature Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the calendar feature in the Finanza app. The calendar integration allows users to manage financial reminders, track recurring transactions, and plan financial goals with date-specific functionality.

## Prerequisites

- ✅ Supabase project configured and running
- ✅ User authentication system active (Clerk)
- ✅ Basic app navigation implemented

## Database Setup

### Step 1: Create Reminders Table

1. **Access Supabase Dashboard**
   ```
   Navigate to: https://supabase.com/dashboard
   Select your project: Finanza project
   ```

2. **Open SQL Editor**
   ```
   Dashboard → SQL Editor → New Query
   ```

3. **Execute Reminders Table SQL**
   
   Copy and paste the content from `reminders-table.sql`:
   ```sql
   -- Create reminders table for calendar functionality
   CREATE TABLE public.reminders (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id TEXT NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     description TEXT,
     reminder_date DATE NOT NULL,
     reminder_time TIME,
     is_completed BOOLEAN DEFAULT false,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   CREATE POLICY "Users can view own reminders" ON public.reminders
     FOR SELECT USING (auth.uid()::text = user_id);

   CREATE POLICY "Users can create own reminders" ON public.reminders
     FOR INSERT WITH CHECK (auth.uid()::text = user_id);

   CREATE POLICY "Users can update own reminders" ON public.reminders
     FOR UPDATE USING (auth.uid()::text = user_id);

   CREATE POLICY "Users can delete own reminders" ON public.reminders
     FOR DELETE USING (auth.uid()::text = user_id);

   -- Create indexes for performance
   CREATE INDEX idx_reminders_user_id ON public.reminders(user_id);
   CREATE INDEX idx_reminders_date ON public.reminders(reminder_date);
   ```

4. **Run the Query**
   ```
   Click "Run" button to execute the SQL
   Verify: "Success. No rows returned" message
   ```

### Step 2: Verify Table Creation

1. **Check Table Editor**
   ```
   Dashboard → Table Editor → Look for "reminders" table
   ```

2. **Verify Table Structure**
   
   Confirm the following columns exist:
   
   | Column | Type | Constraints |
   |--------|------|-------------|
   | `id` | UUID | Primary Key, Auto-generated |
   | `user_id` | TEXT | Foreign Key, Required |
   | `title` | TEXT | Required |
   | `description` | TEXT | Optional |
   | `reminder_date` | DATE | Required |
   | `reminder_time` | TIME | Optional |
   | `is_completed` | BOOLEAN | Default: false |
   | `created_at` | TIMESTAMP | Auto-generated |
   | `updated_at` | TIMESTAMP | Auto-generated |

3. **Verify RLS Policies**
   ```
   Navigate to: Authentication → Policies
   Confirm: 4 policies exist for "reminders" table
   ```

## Testing the Calendar Integration

### Step 3: Test Calendar Functionality

1. **Launch the App**
   ```bash
   npm start
   # or
   expo start
   ```

2. **Navigate to Calendar**
   ```
   Open app → Navigate to Calendar tab
   Verify: Calendar interface loads correctly
   ```

3. **Test Reminder Creation**
   ```
   1. Select any date on the calendar
   2. Click "Add Reminder" button
   3. Enter reminder details:
      - Title: "Test Reminder"
      - Description: "Calendar integration test"
   4. Save the reminder
   5. Verify: Reminder appears on selected date
   ```

4. **Test Database Integration**
   ```
   Check Supabase Dashboard → Table Editor → reminders
   Verify: New reminder record exists with correct data
   ```

## Features Now Working

### ✅ **Core Calendar Features**

| Feature | Status | Description |
|---------|--------|-------------|
| **Dynamic Transaction Loading** | ✅ Active | Real transactions from Supabase database |
| **Add Reminder Button** | ✅ Active | Fully functional reminder creation |
| **Reminder Storage** | ✅ Active | Reminders saved to Supabase database |
| **Remove Reminders** | ✅ Active | Click × button to delete reminders |
| **Date-based Display** | ✅ Active | Transactions and reminders show on correct dates |
| **Multilingual Support** | ✅ Active | All text supports multiple languages with fallbacks |
| **User Authentication** | ✅ Active | Only shows data for the logged-in user |
| **Real-time Updates** | ✅ Active | Pull to refresh updates data from database |

### 🔄 **Advanced Features**

| Feature | Status | Description |
|---------|--------|-------------|
| **Recurring Reminders** | 🔄 Planned | Weekly/monthly reminder patterns |
| **Reminder Notifications** | 🔄 Planned | Push notifications for upcoming reminders |
| **Calendar Export** | 🔄 Planned | Export to device calendar |
| **Financial Calendar View** | 🔄 Planned | Budget deadlines and goal milestones |

## Security Implementation

### Row Level Security (RLS)

The reminders table implements comprehensive security:

```sql
-- User Isolation
✅ Users can only see their own reminders
✅ Users can only create reminders for themselves  
✅ Users can only update/delete their own reminders
✅ All queries automatically filtered by user_id
```

### Data Protection

- **Authentication Required**: All calendar operations require valid user session
- **Input Validation**: Title and date fields validated before database insertion
- **SQL Injection Prevention**: Parameterized queries used throughout
- **HTTPS Encryption**: All data transmission encrypted

## Error Handling

### Graceful Error Management

| Error Type | Handling Strategy |
|------------|------------------|
| **Network Errors** | Graceful fallback with user-friendly messages |
| **Database Errors** | Retry logic with clear error notifications |
| **Failed Operations** | App continues functioning, offline data preserved |
| **Invalid Dates** | Client-side validation prevents invalid submissions |

### Error Recovery

```typescript
// Example error handling implementation
try {
  await createReminder(reminderData);
  showSuccessMessage("Reminder created successfully");
} catch (error) {
  showErrorMessage("Failed to create reminder. Please try again.");
  // Preserve user input for retry
  preserveFormData(reminderData);
}
```

## Troubleshooting

### Common Issues

1. **Reminders Not Appearing**
   ```
   Solution: Check user authentication status
   Verify: RLS policies are properly configured
   ```

2. **Database Connection Errors**
   ```
   Solution: Verify Supabase credentials in .env file
   Check: Network connectivity and Supabase project status
   ```

3. **Permission Denied Errors**
   ```
   Solution: Ensure user is properly authenticated
   Verify: RLS policies allow current user operations
   ```

### Debug Commands

```bash
# Check app logs
npx expo logs

# Verify environment variables
echo $EXPO_PUBLIC_SUPABASE_URL
echo $EXPO_PUBLIC_SUPABASE_ANON_KEY

# Test Supabase connection
npx supabase status
```

## Next Steps

### Recommended Enhancements

1. **📱 Mobile Calendar Widget Integration**
2. **🔔 Smart Notification System**
3. **📊 Financial Calendar Analytics**
4. **🎯 Goal Milestone Tracking**
5. **🔄 Recurring Reminder Patterns**

### Related Documentation

- [Database Setup Guide](./database-setup.md) - Complete database configuration
- [Development Guide](../DEVELOPMENT.md) - Development environment setup
- [Features Specification](../features-specification.md) - Complete feature requirements
- [API Documentation](../API.md) - Calendar API endpoints reference

## Database Setup

### Step 1: Create Reminders Table
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the content from `reminders-table.sql`
4. Click "Run" to execute the SQL

### Step 2: Verify Table Creation
1. Go to the "Table Editor" in Supabase
2. You should see a new table called "reminders"
3. The table should have the following columns:
   - id (uuid, primary key)
   - user_id (text, foreign key to users)
   - title (text, required)
   - description (text, optional)
   - reminder_date (date, required)
   - reminder_time (time, optional)
   - is_completed (boolean, default false)
   - created_at (timestamp)
   - updated_at (timestamp)

### Step 3: Test the Calendar
1. Open the app and navigate to the Calendar tab
2. Select any date
3. Click "Add Reminder" button
4. Enter a reminder title
5. The reminder should be saved to the database and appear on the calendar

## Features Now Working

✅ **Dynamic Transaction Loading**: Real transactions from Supabase database
✅ **Add Reminder Button**: Fully functional reminder creation
✅ **Reminder Storage**: Reminders saved to Supabase database
✅ **Remove Reminders**: Click the × button to delete reminders
✅ **Date-based Display**: Transactions and reminders show on correct dates
✅ **Multilingual Support**: All text supports multiple languages with fallbacks
✅ **User Authentication**: Only shows data for the logged-in user
✅ **Real-time Updates**: Pull to refresh updates data from database

## Database Security

The reminders table has Row Level Security (RLS) enabled:
- Users can only see their own reminders
- Users can only create reminders for themselves
- Users can only update/delete their own reminders
- All queries are automatically filtered by user_id

## Error Handling

- Network errors are handled gracefully
- Database errors show user-friendly messages
- Failed operations don't crash the app
- Offline data is preserved until next refresh
