import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function OAuthNativeCallback() {
  const router = useRouter();

  useEffect(() => {
    console.log('🔗 OAUTH CALLBACK: Processing OAuth callback...');
    
    // Give Clerk a moment to process the OAuth response
    const timer = setTimeout(() => {
      console.log('🔗 OAUTH CALLBACK: Redirecting to index for routing logic...');
      router.replace('/');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 justify-center items-center bg-purple-600">
      <ActivityIndicator size="large" color="white" />
      <Text className="text-white text-lg mt-4 text-center">
        Completing sign in...
      </Text>
      <Text className="text-white text-sm mt-2 opacity-80 text-center">
        Please wait while we finish setting up your account
      </Text>
    </View>
  );
}
