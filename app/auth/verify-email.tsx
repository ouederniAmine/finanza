import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTextAlign, t } from '../../lib/i18n';
import { useUIStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

export default function VerifyEmailScreen() {
  const { language } = useUIStore();
  const textAlign = getTextAlign(language);
  
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [loading, setLoading] = useState(false);

  const handleResendConfirmation = async () => {
    if (!email) {
      Alert.alert(t('messages.error', language), t('auth.email_not_available', language));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'com.finanza://auth/confirm'
        }
      });

      if (error) {
        console.error('Resend error:', error);
        Alert.alert(t('messages.error', language), t('auth.resend_failed', language));
      } else {
        Alert.alert(t('messages.success', language), t('auth.resend_success', language));
      }
    } catch (error) {
      console.error('Resend catch error:', error);
      Alert.alert(t('messages.error', language), t('auth.resend_failed', language));
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/auth/sign-in');
  };

  const handleCheckConfirmation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Check user error:', error);
        Alert.alert(t('messages.error', language), t('auth.verification_check_failed', language));
        return;
      }

      if (data.user && data.user.email_confirmed_at) {
        console.log('Email confirmed, redirecting to onboarding');
        router.replace('/onboarding/welcome');
      } else {
        Alert.alert(t('messages.error', language), t('auth.check_email', language));
      }
    } catch (error) {
      console.error('Check confirmation error:', error);
      Alert.alert(t('messages.error', language), t('auth.verification_check_failed', language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#7F56D9', '#9E77ED', '#C7A6FD']}
        className="flex-1 justify-center items-center px-6"
      >
        <View className="items-center">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6">
            <Text className="text-4xl">📧</Text>
          </View>
          
          <Text className="text-white text-2xl font-bold text-center mb-4" style={{ textAlign }}>
            {t('auth.verify_email_title', language)}
          </Text>
          
          <Text className="text-white/80 text-lg text-center mb-2" style={{ textAlign }}>
            {t('auth.verify_email_subtitle', language)}
          </Text>
          
          <Text className="text-white text-lg font-semibold text-center mb-8" style={{ textAlign }}>
            {email || t('forms.email', language)}
          </Text>
          
          <Text className="text-white/70 text-base text-center mb-8" style={{ textAlign }}>
            {t('auth.verification_instructions', language)}
          </Text>
          
          <View className="w-full space-y-4">
            <TouchableOpacity
              onPress={handleCheckConfirmation}
              disabled={loading}
              className="bg-white py-4 rounded-xl"
            >
              <Text className="text-purple-600 text-lg font-semibold text-center" style={{ textAlign }}>
                {loading ? t('messages.loading', language) : t('auth.check_verification_status', language)}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleResendConfirmation}
              disabled={loading}
              className="bg-white/20 py-4 rounded-xl border border-white/30"
            >
              <Text className="text-white text-lg font-semibold text-center" style={{ textAlign }}>
                {loading ? t('messages.loading', language) : t('auth.resend_verification', language)}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleGoToLogin}
              className="py-4"
            >
              <Text className="text-white/80 text-base text-center underline" style={{ textAlign }}>
                {t('auth.back_to_login', language)}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View className="bg-white/10 p-4 rounded-xl mt-8">
            <Text className="text-white/80 text-sm text-center" style={{ textAlign }}>
              💡 {t('auth.didnt_receive_email', language)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
