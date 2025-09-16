-- COPY AND PASTE THIS SQL INTO YOUR SUPABASE SQL EDITOR
-- Go to: https://supabase.com/dashboard -> Your Project -> SQL Editor -> New Query

-- Add the missing onboarding_completed column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Optional: Update existing users to have onboarding_completed = false
UPDATE users 
SET onboarding_completed = FALSE 
WHERE onboarding_completed IS NULL;