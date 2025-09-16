import React, { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { createSupabaseUser } from '@/lib/clerk-supabase-sync';
import { Alert } from 'react-native';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  // Sync user data with Supabase when user signs in
  useEffect(() => {
    async function syncUserWithSupabase() {
      if (!isSignedIn || !user) return;

      try {
        console.log('🔄 Syncing user with Supabase...');
        const supabaseUser = await createSupabaseUser(user);
        console.log('✅ User synced with Supabase successfully:', supabaseUser.id);
      } catch (error) {
        console.error('❌ Error syncing user with Supabase:', error);
        
        let errorMessage = 'There was an error syncing your account. Please sign in again.';
        
        // Handle specific error types
        if (error instanceof Error) {
          if (error.message.includes('22P02') || error.message.includes('invalid input syntax for type uuid')) {
            errorMessage = 'Account sync failed due to invalid user ID format. Please sign in again.';
          } else if (error.message.includes('Network connection failed')) {
            errorMessage = 'Network connection failed. Please check your connection and try again.';
          } else if (error.message.includes('Authentication failed')) {
            errorMessage = 'Authentication error. Please sign in again.';
          }
        }
        
        // Show error to user and sign them out
        Alert.alert(
          'Sync Failed',
          errorMessage,
          [
            {
              text: 'Sign In Again',
              onPress: async () => {
                try {
                  console.log('🔄 Signing user out due to sync failure...');
                  await signOut();
                  console.log('✅ User signed out successfully');
                } catch (signOutError) {
                  console.error('❌ Error signing out:', signOutError);
                }
              }
            }
          ],
          { cancelable: false }
        );
      }
    }

    syncUserWithSupabase();
  }, [isSignedIn, user, signOut]);

  return <>{children}</>;
}
