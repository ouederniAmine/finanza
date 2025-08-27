// lib/auth-utils.ts - Clerk Auth Utilities
import { useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Alert } from 'react-native';

/**
 * Utility hook to require authentication
 * Returns user if authenticated, otherwise redirects to sign-in
 */
export function useRequireAuth() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();

  if (!isLoaded) {
    return { user: null, isLoading: true };
  }

  if (!isSignedIn || !user) {
    console.log('No authenticated user found, redirecting to sign-in');
    Alert.alert(
      'تسجيل الدخول مطلوب',
      'يرجى تسجيل الدخول للمتابعة',
      [
        {
          text: 'تسجيل الدخول',
          onPress: () => router.replace('/auth/sign-in')
        }
      ]
    );
    return { user: null, isLoading: false };
  }

  return { user, isLoading: false };
}

/**
 * Get Clerk user ID for use with Supabase operations
 */
export function getUserId(user: any): string | null {
  return user?.id || null;
}

/**
 * Get user email for display purposes
 */
export function getUserEmail(user: any): string | null {
  return user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || null;
}

/**
 * Get user name for display purposes
 */
export function getUserName(user: any): { firstName: string | null; lastName: string | null; fullName: string | null } {
  return {
    firstName: user?.firstName || null,
    lastName: user?.lastName || null,
    fullName: user?.fullName || null,
  };
}
