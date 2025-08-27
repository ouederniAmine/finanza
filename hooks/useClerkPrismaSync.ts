// hooks/useClerkPrismaSync.ts
import { UserService } from '@/lib/services/user.service';
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
      // Check if user exists in Supabase database
      let existingUser = await UserService.getUserById(clerkUser.id);
      
      if (!existingUser) {
        console.log('🔄 Creating new user in Supabase...');
        // Sync Clerk user with Supabase database
        const user = await UserService.syncClerkUser(clerkUser);
        setPrismaUser(user);
        console.log('✅ User created successfully');
      } else {
        console.log('✅ User already exists in Supabase');
        setPrismaUser(existingUser);
        
        // Create default categories if this user has none
        if (!existingUser.categories || existingUser.categories.length === 0) {
          console.log('🔄 Creating default categories...');
          await UserService.createDefaultCategories(clerkUser.id);
          // Refresh user data to include new categories
          existingUser = await UserService.getUserById(clerkUser.id);
          setPrismaUser(existingUser);
          console.log('✅ Default categories created');
        }
      }
    } catch (err) {
      console.error('💥 Error syncing user:', err);
      
      // Check if it's an RLS error
      if (err && typeof err === 'object' && 'code' in err) {
        const errorObj = err as any;
        if (errorObj.code === '42501') {
          setError('Database permission issue. Please run the RLS fix script.');
        } else if (errorObj.code === 'PGRST205') {
          setError('Database tables not found. Please run the migration script.');
        } else {
          setError(`Database error: ${errorObj.message || 'Unknown error'}`);
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to sync user');
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
