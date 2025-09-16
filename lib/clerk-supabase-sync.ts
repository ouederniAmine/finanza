// lib/clerk-supabase-sync.ts
// Utility functions to sync Clerk users with Supabase database
// This version handles UUID-based Supabase schema with Clerk string IDs

import { supabase } from './supabase';

/**
 * Creates a user record in Supabase when they sign up with Clerk
 * Uses a UUID for Supabase compatibility while storing Clerk ID separately
 */
export async function createSupabaseUser(clerkUser: any) {
  try {
    const { id: clerkId, emailAddresses, firstName, lastName, imageUrl } = clerkUser;
    const email = emailAddresses?.[0]?.emailAddress;

    if (!email) {
      throw new Error('User email not found');
    }

    // Check if user already exists by looking for clerk_id in cultural_preferences
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, cultural_preferences')
      .eq('email', email)
      .single();

    if (existingUser && existingUser.cultural_preferences?.clerk_id === clerkId) {
      console.log('User already exists in Supabase:', existingUser.id);
      return existingUser;
    }

    // Create full name from first and last name, or use email as fallback
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0] || 'User';

    // Create new user record with generated UUID but store Clerk ID in cultural_preferences
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        full_name: fullName,
        avatar_url: imageUrl || null,
        preferred_language: 'ar',
        preferred_currency: 'TND',
        cultural_preferences: {
          clerk_id: clerkId, // Store Clerk ID here for mapping
          onboarding_completed: false,
        },
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating Supabase user:', error);
      throw error;
    }

    console.log('Created Supabase user with UUID:', data.id, 'for Clerk ID:', clerkId);

    // Create default categories for the new user using Supabase UUID
    await createDefaultCategories(data.id);

    return data;
  } catch (error) {
    console.error('Error in createSupabaseUser:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      } else if (error.message.includes('JWT') || error.message.includes('authorization')) {
        throw new Error('Authentication failed. Please check your Supabase configuration.');
      } else if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
        throw new Error('User account already exists. Please try signing in instead.');
      } else if (error.message.includes('22P02') || error.message.includes('invalid input syntax for type uuid')) {
        throw new Error('Database sync failed. Invalid user ID format detected. Please sign in again.');
      }
    }
    
    // Check if error object has code property (Supabase error format)
    if (error && typeof error === 'object' && 'code' in error) {
      const supabaseError = error as any;
      if (supabaseError.code === '22P02') {
        throw new Error('Database sync failed. Invalid user ID format detected. Please sign in again.');
      }
    }
    
    throw new Error('Failed to sync user data. Please try again later.');
  }
}

/**
 * Gets Supabase user by Clerk ID
 */
export async function getSupabaseUserByClerkId(clerkId: string) {
  try {
    // Look for user with matching clerk_id in cultural_preferences
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .contains('cultural_preferences', { clerk_id: clerkId });

    if (error) {
      console.error('Error finding user by Clerk ID:', error);
      throw error;
    }

    return users?.[0] || null;
  } catch (error) {
    console.error('Error in getSupabaseUserByClerkId:', error);
    throw error;
  }
}

/**
 * Gets Supabase user ID from Clerk user (for use in other operations)
 * This is the key function for getting the UUID to use with Supabase operations
 */
export async function getSupabaseUserId(clerkUser: any): Promise<string | null> {
  try {
    const supabaseUser = await getSupabaseUserByClerkId(clerkUser.id);
    return supabaseUser?.id || null;
  } catch (error) {
    console.error('Error getting Supabase user ID:', error);
    return null;
  }
}

/**
 * Creates default expense/income categories for a new user
 * Uses Supabase UUID (not Clerk ID)
 */
export async function createDefaultCategories(supabaseUserId: string) {
  try {
    const defaultCategories = [
      { name_ar: 'طعام وشراب', name_tn: 'Makla w Shrab', icon: '🍽️', color: '#FF6B6B', type: 'expense' },
      { name_ar: 'مواصلات', name_tn: 'Transport', icon: '🚗', color: '#4ECDC4', type: 'expense' },
      { name_ar: 'تسوق', name_tn: 'Shopping', icon: '🛍️', color: '#45B7D1', type: 'expense' },
      { name_ar: 'ترفيه', name_tn: 'Tafrih', icon: '🎬', color: '#96CEB4', type: 'expense' },
      { name_ar: 'صحة', name_tn: 'Saha', icon: '🏥', color: '#FFEAA7', type: 'expense' },
      { name_ar: 'فواتير', name_tn: 'Fawatir', icon: '💡', color: '#DDA0DD', type: 'expense' },
      { name_ar: 'راتب', name_tn: 'Rateb', icon: '💰', color: '#6FCF97', type: 'income' },
      { name_ar: 'عمل حر', name_tn: 'Amal Hor', icon: '💼', color: '#BB6BD9', type: 'income' },
    ];

    const categoriesToInsert = defaultCategories.map(category => ({
      ...category,
      user_id: supabaseUserId, // Use Supabase UUID
      is_default: true,
    }));

    const { error } = await supabase
      .from('categories')
      .insert(categoriesToInsert);

    if (error) {
      console.error('Error creating default categories:', error);
      throw error;
    }

    console.log(`Created ${defaultCategories.length} default categories for Supabase user:`, supabaseUserId);
  } catch (error) {
    console.error('Error in createDefaultCategories:', error);
    throw error;
  }
}

/**
 * Updates user profile in Supabase when Clerk user data changes
 */
export async function updateSupabaseUser(clerkUser: any) {
  try {
    const { id: clerkId, emailAddresses, firstName, lastName, imageUrl } = clerkUser;
    const email = emailAddresses?.[0]?.emailAddress;

    // Find user by Clerk ID
    const supabaseUser = await getSupabaseUserByClerkId(clerkId);
    if (!supabaseUser) {
      throw new Error(`No Supabase user found for Clerk ID: ${clerkId}`);
    }

    // Create full name from first and last name, or use email as fallback
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0] || 'User';

    const { data, error } = await supabase
      .from('users')
      .update({
        email,
        full_name: fullName,
        avatar_url: imageUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', supabaseUser.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating Supabase user:', error);
      throw error;
    }

    console.log('Updated Supabase user:', data);
    return data;
  } catch (error) {
    console.error('Error in updateSupabaseUser:', error);
    throw error;
  }
}

/**
 * Gets or creates a user in Supabase based on Clerk user
 * This is the main function to call after Clerk authentication
 */
export async function ensureSupabaseUser(clerkUser: any) {
  try {
    const { id: clerkId, emailAddresses } = clerkUser;
    const email = emailAddresses?.[0]?.emailAddress;

    // First try to get existing user by Clerk ID
    let existingUser = await getSupabaseUserByClerkId(clerkId);

    if (existingUser) {
      // User exists with Clerk ID, optionally update their info
      console.log('Found existing Supabase user by Clerk ID:', existingUser.id);
      return await updateSupabaseUser(clerkUser);
    }

    // If not found by Clerk ID, try to find by email (for existing users migrating from Supabase Auth)
    if (email) {
      const { data: userByEmail, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (!error && userByEmail) {
        // Found existing user by email, update them with Clerk ID
        console.log('Found existing Supabase user by email, linking Clerk ID:', userByEmail.id);
        
        const currentPreferences = userByEmail.cultural_preferences || {};
        const updatedPreferences = {
          ...currentPreferences,
          clerk_id: clerkId
        };

        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            cultural_preferences: updatedPreferences,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userByEmail.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error linking Clerk ID to existing user:', updateError);
          throw updateError;
        }

        console.log('Successfully linked Clerk ID to existing user:', updatedUser.id);
        return updatedUser;
      }
    }

    // User doesn't exist at all, create them
    console.log('Creating new Supabase user for Clerk ID:', clerkId);
    return await createSupabaseUser(clerkUser);
  } catch (error) {
    console.error('Error in ensureSupabaseUser:', error);
    throw error;
  }
}

/**
 * Checks if a user has completed onboarding
 */
export async function checkOnboardingStatus(clerkUser: any): Promise<boolean> {
  try {
    const supabaseUser = await getSupabaseUserByClerkId(clerkUser.id);
    
    if (!supabaseUser) {
      // User doesn't exist in Supabase yet, so onboarding not completed
      return false;
    }

    // Check if onboarding_completed flag is set in the database column
    const isCompleted = supabaseUser.onboarding_completed === true;
    console.log('Onboarding status for user:', clerkUser.id, 'is completed:', isCompleted);
    
    return isCompleted;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    // If there's an error, assume onboarding is not completed to be safe
    return false;
  }
}
