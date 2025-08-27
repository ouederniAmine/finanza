-- Optional: Create onboarding_steps table to track detailed onboarding progress
-- Run this SQL in your Supabase dashboard (optional)

-- 1. Create onboarding_steps table to track individual steps
CREATE TABLE IF NOT EXISTS onboarding_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step_name TEXT NOT NULL, -- 'personal_info', 'financial_goals', 'balance_setup', 'preferences', etc.
    step_order INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    step_data JSONB DEFAULT '{}', -- Store step-specific data
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, step_name)
);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_user_id ON onboarding_steps(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_completed ON onboarding_steps(is_completed);
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_order ON onboarding_steps(step_order);

-- 3. Enable RLS for onboarding_steps
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for onboarding_steps
CREATE POLICY "Users can view own onboarding steps" ON onboarding_steps
    FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own onboarding steps" ON onboarding_steps
    FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own onboarding steps" ON onboarding_steps
    FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own onboarding steps" ON onboarding_steps
    FOR DELETE USING (user_id = auth.uid()::text);

-- 5. Create function to insert default onboarding steps for new users
CREATE OR REPLACE FUNCTION create_default_onboarding_steps(user_id_param TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO onboarding_steps (user_id, step_name, step_order, is_completed) VALUES
    (user_id_param, 'welcome', 1, FALSE),
    (user_id_param, 'personal_info', 2, FALSE),
    (user_id_param, 'financial_goals', 3, FALSE),
    (user_id_param, 'balance_setup', 4, FALSE),
    (user_id_param, 'preferences', 5, FALSE),
    (user_id_param, 'completion', 6, FALSE)
    ON CONFLICT (user_id, step_name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to automatically create onboarding steps when user is created
CREATE OR REPLACE FUNCTION handle_new_user_onboarding()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default onboarding steps for the new user
    PERFORM create_default_onboarding_steps(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (only if it doesn't exist)
DROP TRIGGER IF EXISTS on_user_created_onboarding ON users;
CREATE TRIGGER on_user_created_onboarding
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user_onboarding();

-- 7. Create view for onboarding progress
CREATE OR REPLACE VIEW user_onboarding_progress AS
SELECT 
    u.id as user_id,
    u.email,
    u.first_name,
    u.last_name,
    u.onboarding_completed,
    u.total_balance,
    COUNT(os.id) as total_steps,
    COUNT(CASE WHEN os.is_completed = TRUE THEN 1 END) as completed_steps,
    ROUND(
        (COUNT(CASE WHEN os.is_completed = TRUE THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(os.id), 0)) * 100, 
        2
    ) as completion_percentage,
    MIN(CASE WHEN os.is_completed = FALSE THEN os.step_order END) as next_step_order,
    MIN(CASE WHEN os.is_completed = FALSE THEN os.step_name END) as next_step_name
FROM users u
LEFT JOIN onboarding_steps os ON u.id = os.user_id
GROUP BY u.id, u.email, u.first_name, u.last_name, u.onboarding_completed, u.total_balance;
