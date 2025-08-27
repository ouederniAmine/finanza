-- Add category_id to debts table and create debt categories
-- Run this SQL in your Supabase dashboard

-- 1. Add category_id column to debts table
ALTER TABLE debts ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- 2. Add index for better performance
CREATE INDEX IF NOT EXISTS idx_debts_category_id ON debts(category_id);

-- 3. Insert default debt categories
INSERT INTO categories (id, name_tn, name_en, name_ar, type, icon, is_default, user_id, created_at, updated_at) VALUES
-- Debt Given Categories (when you lend money to others)
(gen_random_uuid(), 'قرض للعائلة', 'Family Loan', 'قرض للعائلة', 'debt', '👨‍👩‍👧‍👦', true, null, NOW(), NOW()),
(gen_random_uuid(), 'قرض للأصدقاء', 'Friends Loan', 'قرض للأصدقاء', 'debt', '👫', true, null, NOW(), NOW()),
(gen_random_uuid(), 'قرض للزملاء', 'Colleagues Loan', 'قرض للزملاء', 'debt', '💼', true, null, NOW(), NOW()),
(gen_random_uuid(), 'قرض شخصي', 'Personal Loan', 'قرض شخصي', 'debt', '🤝', true, null, NOW(), NOW()),
(gen_random_uuid(), 'قرض طارئ', 'Emergency Loan', 'قرض طارئ', 'debt', '🚨', true, null, NOW(), NOW()),

-- Debt Received Categories (when you borrow money from others)
(gen_random_uuid(), 'قرض من العائلة', 'Family Debt', 'قرض من العائلة', 'debt', '👨‍👩‍👧‍👦', true, null, NOW(), NOW()),
(gen_random_uuid(), 'قرض من الأصدقاء', 'Friends Debt', 'قرض من الأصدقاء', 'debt', '👫', true, null, NOW(), NOW()),
(gen_random_uuid(), 'قرض بنكي', 'Bank Loan', 'قرض بنكي', 'debt', '🏦', true, null, NOW(), NOW()),
(gen_random_uuid(), 'بطاقة ائتمان', 'Credit Card', 'بطاقة ائتمان', 'debt', '💳', true, null, NOW(), NOW()),
(gen_random_uuid(), 'قرض سيارة', 'Car Loan', 'قرض سيارة', 'debt', '🚗', true, null, NOW(), NOW()),
(gen_random_uuid(), 'قرض منزل', 'Mortgage', 'قرض منزل', 'debt', '🏠', true, null, NOW(), NOW()),
(gen_random_uuid(), 'قرض دراسي', 'Student Loan', 'قرض دراسي', 'debt', '🎓', true, null, NOW(), NOW()),
(gen_random_uuid(), 'قرض طبي', 'Medical Loan', 'قرض طبي', 'debt', '⚕️', true, null, NOW(), NOW()),
(gen_random_uuid(), 'قرض تجاري', 'Business Loan', 'قرض تجاري', 'debt', '💼', true, null, NOW(), NOW()),
(gen_random_uuid(), 'قرض أخر', 'Other Debt', 'قرض أخر', 'debt', '📋', true, null, NOW(), NOW());

-- 4. Update RLS policies for categories to include debt type
-- (These policies should already exist, but ensuring they cover debt type)
