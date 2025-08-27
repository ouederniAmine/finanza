-- Add onboarding and balance fields to users table
-- Run this SQL in your Supabase dashboard

-- 1. Add onboarding_completed column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 2. Add total_balance column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_balance DECIMAL(12,2) DEFAULT 0.00;

-- 3. Add balance_last_updated column to track when balance was last calculated
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Add index for better performance on onboarding queries
CREATE INDEX IF NOT EXISTS idx_users_onboarding_completed ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_balance_updated ON users(balance_last_updated);

-- 5. Create a function to update balance_last_updated when total_balance changes
CREATE OR REPLACE FUNCTION update_balance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.total_balance IS DISTINCT FROM NEW.total_balance THEN
        NEW.balance_last_updated = NOW();
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger to automatically update balance timestamp
DROP TRIGGER IF EXISTS update_users_balance_timestamp ON users;
CREATE TRIGGER update_users_balance_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_balance_timestamp();

-- 7. Set default values for existing users
UPDATE users SET onboarding_completed = FALSE WHERE onboarding_completed IS NULL;
UPDATE users SET total_balance = 0.00 WHERE total_balance IS NULL;

-- 8. Add helpful comments to the table
COMMENT ON COLUMN users.onboarding_completed IS 'Tracks whether user has completed the onboarding flow';
COMMENT ON COLUMN users.total_balance IS 'User''s current total balance across all accounts';
COMMENT ON COLUMN users.balance_last_updated IS 'Timestamp when total_balance was last updated';

-- 9. Create a view for user onboarding status (optional, for easy querying)
CREATE OR REPLACE VIEW user_onboarding_status AS
SELECT 
    id,
    email,
    full_name,
    onboarding_completed,
    total_balance,
    balance_last_updated,
    created_at,
    CASE 
        WHEN onboarding_completed = TRUE THEN 'completed'
        ELSE 'pending'
    END as onboarding_status
FROM users;
