// hooks/useClerkPrismaSync.ts
import { UserService } from '@/lib/services/user.service';
import { testSupabaseConnection, validateSupabaseConfig } from '@/lib/supabase-test';
import { useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';

export function useClerkPrismaSync() {
  const { user: clerkUser, isLoaded } = useUser();
  const [prismaUser, setPrismaUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      syncUser();
    }
  }, [isLoaded, clerkUser]);

  const syncUser = async () => {
    if (!clerkUser) return;

    setIsLoading(true);
    setError(null);

    try {
      // First validate configuration
      const configValidation = validateSupabaseConfig();
      if (!configValidation.valid) {
        throw new Error(`Configuration error: ${configValidation.errors.join(', ')}`);
      }

      // Test connection before proceeding
      const connectionTest = await testSupabaseConnection();
      if (!connectionTest.success) {
        throw new Error(connectionTest.error);
      }
      // Sync Clerk user with Supabase database
      console.log('🔄 Syncing user with Supabase...');
      const user = await UserService.syncClerkUser(clerkUser);
      setPrismaUser(user);
      console.log('✅ User synced successfully');
    } catch (err) {
      console.error('💥 Error syncing user:', err);
      
      // Check for network connectivity issues first
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('ERR_NAME_NOT_RESOLVED')) {
          setError('Network connection failed. Please check your internet connection and Supabase configuration.');
        } else if (err.message.includes('EXPO_PUBLIC_SUPABASE_URL') || err.message.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY')) {
          setError('Supabase configuration error. Please check your environment variables.');
        } else if (err && typeof err === 'object' && 'code' in err) {
          const errorObj = err as any;
          if (errorObj.code === '42501') {
            setError('Database permission issue. Please run the RLS fix script.');
          } else if (errorObj.code === 'PGRST205') {
            setError('Database tables not found. Please run the migration script.');
          } else {
            setError(`Database error: ${errorObj.message || 'Unknown error'}`);
          }
        } else {
          setError(err.message || 'Failed to sync user');
        }
      } else {
        setError('Failed to sync user - unknown error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    if (!clerkUser) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await UserService.updateProfile(clerkUser.id, data);
      setPrismaUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (onboardingData: any) => {
    if (!clerkUser) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await UserService.completeOnboarding(clerkUser.id, onboardingData);
      setPrismaUser(updatedUser);
      return updatedUser;
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    clerkUser,
    prismaUser,
    isLoading,
    error,
    updateProfile,
    completeOnboarding,
    syncUser,
  };
}
