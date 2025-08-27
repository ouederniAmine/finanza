import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTextAlign, t } from '../../lib/i18n';
import { useUIStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordScreen() {
  const { language } = useUIStore();
  const textAlign = getTextAlign(language);
  
  const { access_token, type } = useLocalSearchParams<{
    access_token?: string;
    type?: string;
  }>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (access_token && type === 'recovery') {
          console.log('Verifying reset password token...');
          
          // Set the session with the access token
          const { data, error } = await supabase.auth.setSession({
            access_token: access_token as string,
            refresh_token: '', // We don't have refresh token in this flow
          });

          if (error) {
            console.error('Token verification error:', error);
            Alert.alert(
              t('auth.invalid_token', language),
              t('auth.use_valid_link', language),
              [{ text: 'OK', onPress: () => router.replace('/auth/forgot-password') }]
            );
          } else if (data.user) {
            console.log('Token verified successfully for user:', data.user.id);
            setTokenValid(true);
          }
        } else {
          console.log('No valid token found, redirecting to forgot password');
          Alert.alert(
            t('auth.invalid_token', language),
            t('auth.use_valid_link', language),
            [{ text: 'OK', onPress: () => router.replace('/auth/forgot-password') }]
          );
        }
      } catch (error) {
        console.error('Token verification catch error:', error);
        Alert.alert(
          t('messages.error', language),
          t('messages.something_went_wrong', language),
          [{ text: 'OK', onPress: () => router.replace('/auth/forgot-password') }]
        );
      } finally {
        setCheckingToken(false);
      }
    };

    verifyToken();
  }, [access_token, type]);

  const handleResetPassword = async () => {
    if (!password.trim()) {
      Alert.alert(t('messages.error', language), t('auth.fill_all_fields', language));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('messages.error', language), t('auth.password_requirements', language));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('messages.error', language), t('auth.passwords_dont_match', language));
      return;
    }

    setLoading(true);
    try {
      console.log('Updating password...');
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Password update error:', error);
        Alert.alert(t('messages.error', language), t('messages.something_went_wrong', language));
      } else {
        console.log('Password updated successfully');
        Alert.alert(
          t('messages.success', language) + ' ✅',
          t('auth.password_updated_success', language),
          [{
            text: t('auth.login_with_new_password', language),
            onPress: () => {
              // Sign out first to clear the recovery session
              supabase.auth.signOut().then(() => {
                router.replace('/auth/login');
              });
            }
          }]
        );
      }
    } catch (error) {
      console.error('Reset password catch error:', error);
      Alert.alert(t('messages.error', language), t('messages.try_again', language));
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <SafeAreaView className="flex-1">
        <LinearGradient
          colors={['#7F56D9', '#9E77ED', '#C7A6FD']}
          className="flex-1 justify-center items-center"
        >
          <ActivityIndicator size="large" color="white" />
          <Text className="text-white text-lg mt-4" style={{ textAlign }}>
            {t('messages.loading', language)}
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!tokenValid) {
    return (
      <SafeAreaView className="flex-1">
        <LinearGradient
          colors={['#7F56D9', '#9E77ED', '#C7A6FD']}
          className="flex-1 justify-center items-center px-6"
        >
          <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
            <Text className="text-3xl">❌</Text>
          </View>
          <Text className="text-white text-2xl font-bold mb-4 text-center" style={{ textAlign }}>
            {t('auth.token_expired', language)}
          </Text>
          <Text className="text-white/80 text-lg text-center mb-8" style={{ textAlign }}>
            {t('auth.request_new_link', language)}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/auth/forgot-password')}
            className="bg-white rounded-2xl py-4 px-8"
          >
            <Text className="text-purple-600 text-lg font-semibold" style={{ textAlign }}>
              {t('auth.request_new_link', language)}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <LinearGradient
          colors={['#7F56D9', '#9E77ED', '#C7A6FD']}
          className="flex-1"
        >
          <ScrollView 
            className="flex-1 px-6" 
            contentContainerStyle={{ paddingTop: 32, paddingBottom: 32, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
                <Text className="text-3xl">🔐</Text>
              </View>
              <Text className="text-white text-3xl font-bold mb-2" style={{ textAlign }}>
                {t('auth.reset_password_title', language)}
              </Text>
              <Text className="text-white/80 text-lg text-center" style={{ textAlign }}>
                {t('auth.reset_password_subtitle', language)}
              </Text>
            </View>

            {/* Form */}
            <View className="mb-6">
              <View className="mb-4">
                <Text className="text-white text-lg mb-2" style={{ textAlign }}>
                  {t('auth.new_password_label', language)}
                </Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    className="bg-white/90 p-4 rounded-xl text-gray-800 text-lg pr-12"
                    style={{ textAlign }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4"
                  >
                    <Text className="text-xl">{showPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-white text-lg mb-2" style={{ textAlign }}>
                  {t('auth.confirm_new_password', language)}
                </Text>
                <View className="relative">
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="new-password"
                    className="bg-white/90 p-4 rounded-xl text-gray-800 text-lg pr-12"
                    style={{ textAlign }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-4"
                  >
                    <Text className="text-xl">{showConfirmPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Password Requirements */}
            <View className="bg-white/10 p-4 rounded-xl mb-8">
              <Text className="text-white/80 text-sm text-center" style={{ textAlign }}>
                💡 {t('auth.password_requirements', language)}
              </Text>
            </View>

            {/* Update Button */}
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={loading}
              className="bg-white rounded-2xl py-4 items-center mb-4"
            >
              {loading ? (
                <ActivityIndicator color="#7F56D9" />
              ) : (
                <Text className="text-purple-600 text-lg font-semibold" style={{ textAlign }}>
                  {t('auth.update_password', language)}
                </Text>
              )}
            </TouchableOpacity>

            {/* Back to Login Link */}
            <View className="flex-row justify-center">
              <Text className="text-white/80 text-lg" style={{ textAlign }}>
                {t('auth.login_link', language).split('?')[0]}
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text className="text-white text-lg font-semibold" style={{ textAlign }}>
                  {t('auth.login_link', language).split('?')[1]}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
