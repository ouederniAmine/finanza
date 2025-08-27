const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkGoalsSchema() {
  try {
    // First, let's try to select from the table to see what columns exist
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .limit(1);
    
    console.log('Query result:', { data, error });
    
    // If we get a column error, let's try without the problematic columns
    if (error && error.code === '42703') {
      console.log('Column error detected. Trying basic columns...');
      
      const { data: basicData, error: basicError } = await supabase
        .from('savings_goals')
        .select('id, user_id, name, target_amount, current_amount')
        .limit(1);
      
      console.log('Basic query result:', { basicData, basicError });
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkGoalsSchema();
