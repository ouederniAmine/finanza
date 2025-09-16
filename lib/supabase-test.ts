// lib/supabase-test.ts
// Utility function to test Supabase connection
import { supabase } from './supabase';

export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Simple health check query
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return { 
        success: false, 
        error: `Connection failed: ${error.message}` 
      };
    }

    console.log('✅ Supabase connection successful');
    return { success: true };

  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        return { 
          success: false, 
          error: 'Network error: Cannot reach Supabase server. Check your internet connection.' 
        };
      } else if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
        return { 
          success: false, 
          error: 'DNS error: Supabase URL cannot be resolved. Check your SUPABASE_URL configuration.' 
        };
      }
    }

    return { 
      success: false, 
      error: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

// Function to validate environment variables
export function validateSupabaseConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    errors.push('EXPO_PUBLIC_SUPABASE_URL is not set');
  } else if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    errors.push('EXPO_PUBLIC_SUPABASE_URL format is invalid');
  }

  if (!supabaseKey) {
    errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is not set');
  } else if (!supabaseKey.startsWith('eyJ')) {
    errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY format is invalid (should be a JWT token)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}