// scripts/add-onboarding-completed-migration.js
// Script to add the missing onboarding_completed column to the users table

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Get Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY; // Using anon key as requested

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🔄 Starting onboarding_completed column migration...');

    // Check if column exists
    const { data: columns, error: columnError } = await supabase
      .rpc('get_column_info', { table_name_param: 'users' });

    if (columnError) {
      console.log('⚠️  Could not check existing columns, proceeding with migration attempt...');
    } else {
      const hasColumn = columns?.some(col => col.column_name === 'onboarding_completed');
      if (hasColumn) {
        console.log('✅ onboarding_completed column already exists');
        return;
      }
    }

    // Execute the migration using SQL
    const migrationSQL = `
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'users' AND column_name = 'onboarding_completed'
          ) THEN
              ALTER TABLE users 
              ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
              
              RAISE NOTICE 'Added onboarding_completed column to users table';
          ELSE
              RAISE NOTICE 'onboarding_completed column already exists';
          END IF;
      END $$;
    `;

    console.log('🔄 Executing migration SQL...');
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: migrationSQL 
    });

    if (error) {
      console.error('❌ Migration failed with RPC:', error);
      
      // Try alternative approach - direct query (may require service role key)
      console.log('🔄 Trying direct SQL execution...');
      const { data: directData, error: directError } = await supabase
        .from('users')
        .select('*')
        .limit(0); // This will help us test if we can access the table

      if (directError) {
        console.error('❌ Cannot access users table:', directError);
        console.log('💡 You may need to run this migration manually in Supabase SQL editor:');
        console.log('\n--- Copy this SQL and run it in Supabase SQL Editor ---');
        console.log(migrationSQL);
        console.log('--- End of SQL ---\n');
      } else {
        console.log('⚠️  Table accessible but cannot run DDL commands with anon key');
        console.log('💡 Please run this migration manually in Supabase SQL editor:');
        console.log('\n--- Copy this SQL and run it in Supabase SQL Editor ---');
        console.log(`
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
        `);
        console.log('--- End of SQL ---\n');
      }
    } else {
      console.log('✅ Migration completed successfully');
      console.log('📊 Result:', data);
    }

    // Verify the column was added by checking table structure
    console.log('🔍 Verifying column was added...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('onboarding_completed')
      .limit(1);

    if (verifyError) {
      if (verifyError.message.includes('onboarding_completed')) {
        console.log('❌ Column still not found. Please run the migration manually.');
      } else {
        console.log('⚠️  Cannot verify column (may be normal):', verifyError.message);
      }
    } else {
      console.log('✅ Column verification successful - onboarding_completed is now available');
    }

  } catch (error) {
    console.error('❌ Migration script error:', error);
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('🎉 Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });