-- Check current users table structure and data
-- Run this in your Supabase SQL editor to understand the current schema

-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check if there are any existing users
SELECT COUNT(*) as user_count FROM users;

-- Check first few users (if any exist)
SELECT id, email, full_name, created_at 
FROM users 
LIMIT 5;
