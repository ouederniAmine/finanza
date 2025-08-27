-- Quick test to check if the budgets table has a name column
-- You can run this in your Supabase SQL editor to verify the schema

-- Check the structure of the budgets table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'budgets' 
ORDER BY ordinal_position;

-- Alternative: Show the table definition
\d budgets;
