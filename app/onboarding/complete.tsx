import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTextAlign, t } from '../../lib/i18n';
import { useUIStore } from '../../lib/store';
import { UserService } from '../../lib/services/user.service';

export default function CompleteScreen() {
  const { user } = useUser();
  const { language } = useUIStore();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      console.log('Completing onboarding for user:', user?.id);
      
      if (user) {
        // Use UserService to properly complete onboarding with Clerk ID to UUID mapping
        const updatedUser = await UserService.completeOnboarding(user.id, {});

        if (updatedUser) {
          console.log('Onboarding completed successfully:', updatedUser.id);
          console.log('Onboarding completed successfully for Clerk user:', user.id);
        } else {
          console.error('Failed to complete onboarding');
          alert('Failed to complete onboarding. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Add a small delay to ensure database update is propagated
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to main app using a more direct approach
      console.log('🏠 Navigating to main app...');
      
      // Clear the navigation stack and go directly to tabs
      router.dismissAll();
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#10B981', '#34D399', '#6EE7B7']}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center items-center">
          {/* Success Animation */}
          <View className="items-center mb-8">
            <View className="w-32 h-32 bg-white rounded-full items-center justify-center mb-6">
              <Text className="text-6xl">🎉</Text>
            </View>
            
            <Text className={`text-white text-3xl font-bold mb-4 text-center ${getTextAlign(language)}`}>
              {t('onboarding.complete_congratulations', language)}
            </Text>
            
            <Text className={`text-white text-xl text-center mb-2 ${getTextAlign(language)}`}>
              {t('onboarding.complete_account_ready', language)}
            </Text>
            
            <Text className={`text-white/80 text-lg text-center px-4 ${getTextAlign(language)}`}>
              {t('onboarding.complete_lets_start', language)}
            </Text>
          </View>

          {/* Features Preview */}
          <View className="w-full space-y-4 mb-8">
            <View className="bg-white/20 rounded-xl p-4 flex-row items-center">
              <View className="w-12 h-12 bg-white/30 rounded-full items-center justify-center mr-4">
                <Text className="text-2xl">📊</Text>
              </View>
              <View className="flex-1">
                <Text className={`text-white font-semibold text-lg ${getTextAlign(language)}`}>
                  {t('onboarding.complete_track_expenses', language)}
                </Text>
                <Text className={`text-white/80 ${getTextAlign(language)}`}>
                  {t('onboarding.complete_track_desc', language)}
                </Text>
              </View>
            </View>

            <View className="bg-white/20 rounded-xl p-4 flex-row items-center">
              <View className="w-12 h-12 bg-white/30 rounded-full items-center justify-center mr-4">
                <Text className="text-2xl">🎯</Text>
              </View>
              <View className="flex-1">
                <Text className={`text-white font-semibold text-lg ${getTextAlign(language)}`}>
                  {t('onboarding.complete_achieve_goals', language)}
                </Text>
                <Text className={`text-white/80 ${getTextAlign(language)}`}>
                  {t('onboarding.complete_goals_desc', language)}
                </Text>
              </View>
            </View>

            <View className="bg-white/20 rounded-xl p-4 flex-row items-center">
              <View className="w-12 h-12 bg-white/30 rounded-full items-center justify-center mr-4">
                <Text className="text-2xl">💳</Text>
              </View>
              <View className="flex-1">
                <Text className={`text-white font-semibold text-lg ${getTextAlign(language)}`}>
                  {t('onboarding.complete_manage_debts', language)}
                </Text>
                <Text className={`text-white/80 ${getTextAlign(language)}`}>
                  {t('onboarding.complete_debts_desc', language)}
                </Text>
              </View>
            </View>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            onPress={handleStart}
            disabled={loading}
            className="w-full bg-white rounded-2xl py-4 items-center"
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#059669" />
                <Text className={`text-green-600 text-xl font-bold ml-2 ${getTextAlign(language)}`}>
                  {t('onboarding.complete_loading', language)}
                </Text>
              </View>
            ) : (
              <Text className={`text-green-600 text-xl font-bold ${getTextAlign(language)}`}>
                {t('onboarding.complete_start_button', language)}
              </Text>
            )}
          </TouchableOpacity>

          {/* Welcome Message */}
          <View className="mt-6">
            <Text className={`text-white/80 text-center text-lg ${getTextAlign(language)}`}>
              {t('onboarding.complete_welcome_message', language)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
