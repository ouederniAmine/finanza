import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTextAlign, t } from '../../lib/i18n';
import { useUIStore } from '../../lib/store';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { language } = useUIStore();
  const { user, isLoaded } = useUser();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Onboarding welcome: Checking authentication...');
        
        if (!isLoaded) {
          console.log('Onboarding welcome: Clerk not loaded yet, waiting...');
          return;
        }
        
        if (user) {
          console.log('Onboarding welcome: User authenticated:', user.id);
          
          // Check if user has already completed onboarding using Clerk metadata
          const hasCompletedOnboarding = user.publicMetadata?.onboardingCompleted;
          
          if (hasCompletedOnboarding) {
            console.log('Onboarding welcome: User has already completed onboarding, redirecting to main app');
            router.replace('/(tabs)');
            return;
          }
          
          console.log('Onboarding welcome: User ready for onboarding');
        } else {
          console.log('Onboarding welcome: No authenticated user found');
          // Redirect to sign-in if no user found
          router.replace('/auth/sign-in');
          return;
        }
      } catch (error) {
        console.error('Onboarding welcome auth check error:', error);
        router.replace('/auth/sign-in');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [isLoaded, user]);

  // Trigger animations when user is ready
  useEffect(() => {
    if (isLoaded && user && !isLoading) {
      // Animate in after auth check
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoaded, user, isLoading]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('onboarding.greeting_morning', language);
    if (hour < 18) return t('onboarding.greeting_afternoon', language);
    return t('onboarding.greeting_evening', language);
  };

  if (!isLoaded || isLoading) {
    return (
      <SafeAreaView className="flex-1">
        <LinearGradient
          colors={['#7F56D9', '#9E77ED', '#C7A6FD']}
          className="flex-1 justify-center items-center"
        >
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white text-lg mt-4" style={{ textAlign: getTextAlign(language) }}>
            {t('onboarding.checking_session', language)}
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null; // This should redirect to sign-in, so we don't need to show anything
  }

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#7F56D9', '#9E77ED', '#C7A6FD']}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center items-center">
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="items-center mb-12"
          >
            {/* App Logo */}
            <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-8">
              <Text className="text-6xl">💰</Text>
            </View>

            {/* Welcome Text */}
            <Text className="text-white text-4xl font-bold text-center mb-4" style={{ textAlign: getTextAlign(language) }}>
              {getGreeting()}! 👋
            </Text>
            <Text className="text-white text-2xl font-bold text-center mb-6" style={{ textAlign: getTextAlign(language) }}>
              {t('onboarding.welcome_to_finanza', language)}
            </Text>
            <Text className="text-white/80 text-lg text-center mb-8 leading-6" style={{ textAlign: getTextAlign(language) }}>
              {t('onboarding.app_description_welcome', language)}
              {'\n'}
              {t('onboarding.app_subtitle_welcome', language)}
            </Text>
          </Animated.View>

          {/* Features Preview */}
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="w-full mb-12"
          >
            <View className="bg-white/10 rounded-2xl p-6 mb-4">
              <View className="flex-row items-center mb-4">
                <Text className="text-3xl mr-3">📊</Text>
                <Text className="text-white text-xl font-semibold" style={{ textAlign: getTextAlign(language) }}>
                  {t('onboarding.feature_expense_tracking', language)}
                </Text>
              </View>
              <Text className="text-white/80 text-base" style={{ textAlign: getTextAlign(language) }}>
                {t('onboarding.feature_expense_description', language)}
              </Text>
            </View>

            <View className="bg-white/10 rounded-2xl p-6 mb-4">
              <View className="flex-row items-center mb-4">
                <Text className="text-3xl mr-3">🎯</Text>
                <Text className="text-white text-xl font-semibold" style={{ textAlign: getTextAlign(language) }}>
                  {t('onboarding.feature_savings_goals', language)}
                </Text>
              </View>
              <Text className="text-white/80 text-base" style={{ textAlign: getTextAlign(language) }}>
                {t('onboarding.feature_savings_description', language)}
              </Text>
            </View>

            <View className="bg-white/10 rounded-2xl p-6">
              <View className="flex-row items-center mb-4">
                <Text className="text-3xl mr-3">🤖</Text>
                <Text className="text-white text-xl font-semibold" style={{ textAlign: getTextAlign(language) }}>
                  {t('onboarding.feature_smart_tips', language)}
                </Text>
              </View>
              <Text className="text-white/80 text-base" style={{ textAlign: getTextAlign(language) }}>
                {t('onboarding.feature_tips_description', language)}
              </Text>
            </View>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="w-full"
          >
            <TouchableOpacity
              onPress={() => router.push('/onboarding/profile')}
              className="bg-white rounded-2xl py-4 items-center mb-4"
            >
              <Text className="text-purple-600 text-xl font-semibold" style={{ textAlign: getTextAlign(language) }}>
                {t('onboarding.lets_start', language)}
              </Text>
            </TouchableOpacity>

            <Text className="text-white/60 text-center text-sm" style={{ textAlign: getTextAlign(language) }}>
              {t('onboarding.data_secure', language)}
            </Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
