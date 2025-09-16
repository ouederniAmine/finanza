-- Migration: Add onboarding_completed column to users table
-- This fixes the PGRST204 error: "Could not find the 'onboarding_completed' column of 'users' in the schema cache"

-- First check if the column already exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'onboarding_completed'
    ) THEN
        -- Add the onboarding_completed column
        ALTER TABLE users 
        ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Added onboarding_completed column to users table';
    ELSE
        RAISE NOTICE 'onboarding_completed column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'onboarding_completed';