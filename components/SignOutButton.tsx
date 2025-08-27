import { useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/sign-in');
    } catch (err) {
      console.error('Sign out error:', JSON.stringify(err, null, 2));
    }
  };

  return (
    <TouchableOpacity onPress={handleSignOut} className="bg-red-500 px-4 py-2 rounded-lg">
      <Text className="text-white font-semibold">تسجيل الخروج</Text>
    </TouchableOpacity>
  );
};
