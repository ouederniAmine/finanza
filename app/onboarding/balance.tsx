import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTextAlign, t } from '../../lib/i18n';
import { useUIStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

export default function BalanceScreen() {
  const { user } = useUser();
  const { language } = useUIStore();
  const [totalBalance, setTotalBalance] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!totalBalance.trim()) {
      Alert.alert(
        t('onboarding.required_info', language), 
        t('onboarding.please_enter_balance', language) || 'Please enter your current total balance'
      );
      return;
    }

    const balance = parseFloat(totalBalance);
    if (isNaN(balance) || balance < 0) {
      Alert.alert(
        t('onboarding.invalid_input', language) || 'Invalid Input', 
        t('onboarding.balance_must_be_valid', language) || 'Please enter a valid balance amount'
      );
      return;
    }

    setLoading(true);
    try {
      console.log('Saving balance data for user:', user?.id);
      console.log('Total balance:', balance);
      
      if (!user) {
        console.error('No authenticated user found');
        Alert.alert(
          t('messages.error', language), 
          t('onboarding.session_expired', language) || 'Session expired. Please sign in again.'
        );
        router.replace('/auth/sign-in');
        return;
      }
      
      // Update user's total balance in the database
      const { error } = await supabase
        .from('users')
        .update({
          total_balance: balance,
          balance_last_updated: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving balance:', error);
        Alert.alert(
          t('messages.error', language), 
          t('onboarding.save_error', language) || 'Failed to save balance. Please try again.'
        );
        return;
      }

      console.log('Balance saved successfully');
      router.push('/onboarding/preferences');
    } catch (error) {
      console.error('Error in balance step:', error);
      Alert.alert(
        t('messages.error', language), 
        t('onboarding.unexpected_error', language) || 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Set balance to 0 and continue
    setTotalBalance('0');
    handleNext();
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-8 pb-6">
            {/* Progress Bar */}
            <View className="flex-row mb-8">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <View key={step} className="flex-1 mx-1">
                  <View 
                    className={`h-2 rounded-full ${
                      step <= 4 ? 'bg-white' : 'bg-white/30'
                    }`} 
                  />
                </View>
              ))}
            </View>

            {/* Back Button */}
            <TouchableOpacity 
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-6"
              onPress={() => router.back()}
            >
              <Text className="text-white text-lg">←</Text>
            </TouchableOpacity>

            {/* Title and Description */}
            <View className="mb-8">
              <Text 
                className="text-3xl font-bold text-white mb-4"
                style={{ textAlign: getTextAlign(language) }}
              >
                {t('onboarding.balance_title', language) || 'Current Balance'}
              </Text>
              <Text 
                className="text-white/80 text-lg leading-6"
                style={{ textAlign: getTextAlign(language) }}
              >
                {t('onboarding.balance_description', language) || 
                'Enter your current total balance across all your accounts. This will be your starting point for tracking your finances.'}
              </Text>
            </View>

            {/* Balance Input Section */}
            <View className="bg-white rounded-2xl p-6 mb-6">
              <Text 
                className="text-gray-700 text-lg font-semibold mb-4"
                style={{ textAlign: getTextAlign(language) }}
              >
                {t('onboarding.total_balance_label', language) || 'Total Balance'}
              </Text>
              
              <View className="relative">
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-lg text-gray-800"
                  placeholder={t('onboarding.balance_placeholder', language) || '0.00'}
                  value={totalBalance}
                  onChangeText={setTotalBalance}
                  keyboardType="numeric"
                  style={{ textAlign: getTextAlign(language) }}
                />
                <Text className="absolute right-4 top-4 text-lg text-gray-500">
                  TND
                </Text>
              </View>
              
              <Text 
                className="text-gray-500 text-sm mt-2"
                style={{ textAlign: getTextAlign(language) }}
              >
                {t('onboarding.balance_hint', language) || 
                'Include cash, bank accounts, and any other liquid assets'}
              </Text>
            </View>

            {/* Quick Amount Buttons */}
            <View className="mb-8">
              <Text 
                className="text-white text-lg font-semibold mb-4"
                style={{ textAlign: getTextAlign(language) }}
              >
                {t('onboarding.quick_amounts', language) || 'Quick amounts'}
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {['100', '500', '1000', '5000', '10000'].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    className="bg-white/20 rounded-xl px-4 py-3"
                    onPress={() => setTotalBalance(amount)}
                  >
                    <Text className="text-white font-semibold">
                      {amount} TND
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Balance Tips */}
            <View className="bg-white/10 rounded-2xl p-4 mb-8">
              <Text 
                className="text-white font-semibold text-lg mb-2"
                style={{ textAlign: getTextAlign(language) }}
              >
                💡 {t('onboarding.balance_tips_title', language) || 'Tips'}
              </Text>
              <Text 
                className="text-white/80 text-sm leading-5"
                style={{ textAlign: getTextAlign(language) }}
              >
                {t('onboarding.balance_tips_description', language) || 
                '• Include all your bank accounts\n• Add cash you have on hand\n• Don\'t worry about exact amounts\n• You can update this anytime in settings'}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Buttons */}
        <View className="px-6 pb-6">
          <TouchableOpacity
            className={`bg-white rounded-2xl py-4 mb-3 ${loading ? 'opacity-50' : ''}`}
            onPress={handleNext}
            disabled={loading}
          >
            <Text 
              className="text-center text-purple-700 font-bold text-lg"
              style={{ textAlign: 'center' }}
            >
              {loading 
                ? (t('common.saving', language) || 'Saving...') 
                : (t('common.continue', language) || 'Continue')
              }
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white/20 rounded-2xl py-4"
            onPress={handleSkip}
            disabled={loading}
          >
            <Text 
              className="text-center text-white font-semibold text-lg"
              style={{ textAlign: 'center' }}
            >
              {t('onboarding.skip_for_now', language) || 'Skip for now'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
