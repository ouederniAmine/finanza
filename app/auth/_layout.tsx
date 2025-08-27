import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { useUIStore } from '../../lib/store';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { language } = useUIStore();

  console.log('🔐 AUTH LAYOUT: isLoaded:', isLoaded, 'isSignedIn:', isSignedIn);

  // Wait for auth to load before making routing decisions
  if (!isLoaded) {
    console.log('⏳ AUTH LAYOUT: Waiting for auth to load...');
    return null; // or a loading spinner
  }

  if (isSignedIn) {
    console.log('🔄 AUTH LAYOUT: User signed in, redirecting to index');
    return <Redirect href={'/'} />;
  }

  console.log('📋 AUTH LAYOUT: Showing auth screens');

  return (
    <Stack screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right',
      animationDuration: 300
    }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
