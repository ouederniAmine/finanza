import { useSignIn } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTextAlign, t } from '../../lib/i18n';
import { useUIStore } from '../../lib/store';

export default function ForgotPasswordScreen() {
  const { language } = useUIStore();
  const textAlign = getTextAlign(language);
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetStage, setResetStage] = useState<'email' | 'code' | 'newPassword'>('email');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetEmail = async () => {
    if (!isLoaded) return;

    if (!email.trim()) {
      Alert.alert(t('messages.error', language), t('auth.email_required', language));
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert(t('messages.error', language), t('auth.invalid_email', language));
      return;
    }

    setLoading(true);
    try {
      console.log('Sending password reset email to:', email.trim());
      
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim(),
      });

      setResetStage('code');
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      if (err.errors && err.errors[0]) {
        const errorCode = err.errors[0].code;
        if (errorCode === 'form_identifier_not_found') {
          Alert.alert(
            t('messages.error', language),
            t('auth.sign_in_no_account_found', language)
          );
        } else {
          Alert.alert(t('messages.error', language), t('auth.change_password_failed', language));
        }
      } else {
        Alert.alert(t('messages.error', language), t('messages.try_again', language));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!isLoaded) return;

    if (!code.trim()) {
      Alert.alert(t('messages.error', language), t('auth.code_required', language));
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
      });

      if (result.status === 'needs_new_password') {
        setResetStage('newPassword');
      } else {
        Alert.alert(t('messages.error', language), t('auth.invalid_code', language));
      }
    } catch (err: any) {
      console.error('Code verification error:', err);
      Alert.alert(t('messages.error', language), t('auth.invalid_code', language));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isLoaded) return;

    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert(t('messages.error', language), t('auth.fill_all_fields', language));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('messages.error', language), t('auth.passwords_dont_match', language));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('messages.error', language), t('auth.password_requirements', language));
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.resetPassword({
        password: newPassword,
      });

      if (result.status === 'complete') {
        Alert.alert(
          t('messages.success', language),
          t('auth.password_updated_success', language),
          [
            {
              text: 'OK',
              onPress: () => router.replace('/auth/sign-in'),
            },
          ]
        );
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      // Check if the error is about password being in a data breach
      if (err.message && err.message.includes('found in an online data breach')) {
        Alert.alert(
          t('auth.password_breach_title', language),
          t('auth.password_breach_message', language),
          [
            {
              text: 'OK',
              style: 'default',
            },
          ]
        );
      } else {
        Alert.alert(t('messages.error', language), t('messages.something_went_wrong', language));
      }
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStage = () => (
    <ScrollView 
      className="flex-1 px-6" 
      contentContainerStyle={{ paddingTop: 32, paddingBottom: 32, justifyContent: 'center' }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6">
          <Text className="text-4xl">🔑</Text>
        </View>
        <Text className="text-white text-3xl font-bold mb-4 text-center" style={{ textAlign }}>
          {t('auth.forgot_password_title', language)}
        </Text>
        <Text className="text-white/90 text-lg text-center leading-6" style={{ textAlign }}>
          {t('auth.forgot_password_subtitle', language)}
        </Text>
      </View>

      {/* Email Input */}
      <View className="mb-8">
        <Text className="text-white text-lg mb-3" style={{ textAlign }}>
          {t('auth.email_label', language)}
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="example@example.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          className="bg-white/90 p-4 rounded-xl text-gray-800 text-lg"
          style={{ textAlign }}
        />
      </View>

      {/* Send Reset Email Button */}
      <TouchableOpacity
        onPress={handleSendResetEmail}
        disabled={loading}
        className="bg-white rounded-2xl py-4 items-center mb-6"
      >
        {loading ? (
          <ActivityIndicator color="#7F56D9" />
        ) : (
          <Text className="text-purple-600 text-lg font-semibold" style={{ textAlign }}>
            {t('auth.send_reset_email', language)}
          </Text>
        )}
      </TouchableOpacity>

      {/* Back to Sign In */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="items-center"
      >
        <Text className="text-white/80 text-lg" style={{ textAlign }}>
          {t('auth.back_to_login', language)}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCodeStage = () => (
    <ScrollView 
      className="flex-1 px-6" 
      contentContainerStyle={{ paddingTop: 32, paddingBottom: 32, justifyContent: 'center' }}
      showsVerticalScrollIndicator={false}
    >
      {/* Success Header */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6">
          <Text className="text-4xl">📧</Text>
        </View>
        <Text className="text-white text-3xl font-bold mb-4 text-center" style={{ textAlign }}>
          {t('auth.verify_email_title', language)}
        </Text>
        <Text className="text-white/90 text-lg text-center mb-6 leading-6" style={{ textAlign }}>
          {t('auth.check_email_for_reset', language)}
        </Text>
        <Text className="text-white font-semibold text-lg mb-8 text-center" style={{ textAlign }}>
          {email}
        </Text>
      </View>

      {/* Verification Code Input */}
      <View className="mb-8">
        <Text className="text-white text-lg mb-3" style={{ textAlign }}>
          {t('auth.verification_code', language)}
        </Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder={t('auth.enter_verification_code', language)}
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          maxLength={6}
          className="bg-white/90 p-4 rounded-xl text-gray-800 text-lg text-center"
          style={{ textAlign: 'center' }}
        />
      </View>

      {/* Verify Code Button */}
      <TouchableOpacity
        onPress={handleVerifyCode}
        disabled={loading}
        className="bg-white rounded-2xl py-4 items-center mb-6"
      >
        {loading ? (
          <ActivityIndicator color="#7F56D9" />
        ) : (
          <Text className="text-purple-600 text-lg font-semibold" style={{ textAlign }}>
            {t('auth.verify_code', language)}
          </Text>
        )}
      </TouchableOpacity>

      {/* Resend Email */}
      <TouchableOpacity
        onPress={() => {
          setResetStage('email');
          setCode('');
        }}
        className="items-center"
      >
        <Text className="text-white/80 text-lg" style={{ textAlign }}>
          {t('auth.resend_email', language)}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderNewPasswordStage = () => (
    <ScrollView 
      className="flex-1 px-6" 
      contentContainerStyle={{ paddingTop: 32, paddingBottom: 32, justifyContent: 'center' }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6">
          <Text className="text-4xl">🔐</Text>
        </View>
        <Text className="text-white text-3xl font-bold mb-4 text-center" style={{ textAlign }}>
          {t('auth.reset_password_title', language)}
        </Text>
        <Text className="text-white/90 text-lg text-center leading-6" style={{ textAlign }}>
          {t('auth.reset_password_subtitle', language)}
        </Text>
      </View>

      {/* New Password Input */}
      <View className="mb-4">
        <Text className="text-white text-lg mb-2" style={{ textAlign }}>
          {t('auth.new_password_label', language)}
        </Text>
        <View className="relative">
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showNewPassword}
            autoComplete="new-password"
            className="bg-white/90 p-4 rounded-xl text-gray-800 text-lg pr-12"
            style={{ textAlign }}
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-4 top-4"
          >
            <Text className="text-xl">{showNewPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm Password Input */}
      <View className="mb-8">
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

      {/* Password Requirements */}
      <View className="bg-white/10 p-4 rounded-xl mb-8">
        <Text className="text-white font-semibold text-sm mb-2" style={{ textAlign }}>
          🔒 {t('auth.password_requirements', language)}
        </Text>
        <Text className="text-white/90 text-xs mb-1" style={{ textAlign }}>
          • {t('auth.password_tip_length', language)}
        </Text>
        <Text className="text-white/90 text-xs mb-1" style={{ textAlign }}>
          • {t('auth.password_tip_unique', language)}
        </Text>
        <Text className="text-white/90 text-xs" style={{ textAlign }}>
          • {t('auth.password_tip_avoid_common', language)}
        </Text>
      </View>

      {/* Update Password Button */}
      <TouchableOpacity
        onPress={handleResetPassword}
        disabled={loading}
        className="bg-white rounded-2xl py-4 items-center mb-6"
      >
        {loading ? (
          <ActivityIndicator color="#7F56D9" />
        ) : (
          <Text className="text-purple-600 text-lg font-semibold" style={{ textAlign }}>
            {t('auth.update_password', language)}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

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
          {resetStage === 'email' && renderEmailStage()}
          {resetStage === 'code' && renderCodeStage()}
          {resetStage === 'newPassword' && renderNewPasswordStage()}
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
