import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function IndexScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRouting = async () => {
      console.log('🔍 INDEX: Auth state check - isLoaded:', isLoaded, 'isSignedIn:', isSignedIn);
      
      if (isLoaded) {
        console.log('✅ INDEX: Auth loaded, isSignedIn:', isSignedIn);
        
        if (isSignedIn && user?.id) {
          console.log('👤 INDEX: User is signed in, checking onboarding status...');
          
          try {
            // Use the proper sync method that handles Clerk ID to UUID mapping
            const { getSupabaseUserByClerkId } = await import('../lib/clerk-supabase-sync');
            let supabaseUser = await getSupabaseUserByClerkId(user.id);
            
            if (!supabaseUser) {
              // User doesn't exist, sync them using UserService
              console.log('📝 INDEX: User not found in database, syncing user...');
              const { UserService } = await import('../lib/services/user.service');
              supabaseUser = await UserService.syncClerkUser(user);
              console.log('✅ INDEX: User synced successfully');
            }
            
            // Check onboarding status
            if (supabaseUser.onboarding_completed) {
              console.log('🏠 INDEX: User has completed onboarding, going to home');
              console.log('🔍 INDEX: onboarding_completed value:', supabaseUser.onboarding_completed);
              router.replace('/(tabs)');
            } else {
              console.log('📝 INDEX: User has not completed onboarding, redirecting to onboarding');
              console.log('🔍 INDEX: onboarding_completed value:', supabaseUser.onboarding_completed);
              router.replace('/onboarding/welcome');
            }
          } catch (error) {
            console.error('❌ INDEX: Unexpected error checking onboarding status:', error);
            // On error, default to onboarding for safety
            router.replace('/onboarding/welcome');
          }
        } else {
          console.log('🚪 INDEX: User not signed in, going to auth welcome');
          router.replace('/auth/welcome');
        }
        setLoading(false);
      } else {
        console.log('⏳ INDEX: Auth still loading...');
      }
    };

    handleRouting();
  }, [isLoaded, isSignedIn, user?.id]);

  if (loading || !isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-purple-600">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white text-lg mt-4">Loading...</Text>
      </View>
    );
  }

  return null;
}
