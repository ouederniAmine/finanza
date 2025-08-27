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
            // First, ensure user exists in Supabase database
            const { data: existingUser, error: fetchError } = await supabase
              .from('users')
              .select('onboarding_completed')
              .eq('id', user.id)
              .single();

            if (fetchError && fetchError.code === 'PGRST116') {
              // User doesn't exist, create them
              console.log('📝 INDEX: User not found in database, creating user record...');
              
              const { error: createError } = await supabase
                .from('users')
                .insert({
                  id: user.id,
                  email: user.emailAddresses[0]?.emailAddress || '',
                  full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                  avatar_url: user.imageUrl,
                  onboarding_completed: false,
                  total_balance: 0.00,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });

              if (createError) {
                console.error('❌ INDEX: Error creating user:', createError);
                // Default to onboarding on error
                router.replace('/onboarding/welcome');
                return;
              }

              console.log('✅ INDEX: User created successfully, redirecting to onboarding');
              router.replace('/onboarding/welcome');
            } else if (fetchError) {
              console.error('❌ INDEX: Error fetching user data:', fetchError);
              router.replace('/onboarding/welcome');
            } else if (existingUser.onboarding_completed) {
              console.log('🏠 INDEX: User has completed onboarding, going to home');
              console.log('🔍 INDEX: onboarding_completed value:', existingUser.onboarding_completed);
              router.replace('/(tabs)');
            } else {
              console.log('📝 INDEX: User has not completed onboarding, redirecting to onboarding');
              console.log('🔍 INDEX: onboarding_completed value:', existingUser.onboarding_completed);
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
