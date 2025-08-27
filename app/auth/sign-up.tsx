import { useOAuth, useSignUp } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { t } from '../../lib/i18n';
import { useUIStore } from '../../lib/store';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const router = useRouter();
  const { language } = useUIStore();
  const { isLoaded, signUp, setActive } = useSignUp();
  
  // OAuth hooks for social signup
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: facebookAuth } = useOAuth({ strategy: 'oauth_facebook' });
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      Alert.alert(t('common.error'), t('auth.name_required'));
      return;
    }
    
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.email_required'));
      return;
    }
    
    if (!password.trim()) {
      Alert.alert(t('common.error'), t('auth.password_label'));
      return;
    }
    
    if (!agreeToTerms) {
      Alert.alert(t('common.error'), t('auth.terms_required'));
      return;
    }

    if (!isLoaded) return;

    setLoading(true);

    try {
      // Split full name into first and last name
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await signUp.create({
        // firstName: firstName,
        // lastName: lastName,
        emailAddress: email.trim(),
        password: password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error('Sign up error:', err);
      
      if (err.errors?.[0]?.message?.includes('password')) {
        Alert.alert(
          t('auth.password_breach_title'),
          t('auth.password_breach_message'),
          [{ text: t('common.error'), style: 'default' }]
        );
      } else if (err.errors?.[0]?.message?.includes('email')) {
        Alert.alert(t('common.error'), t('auth.email_already_exists'));
      } else {
        Alert.alert(t('common.error'), t('auth.signup_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!isLoaded) return;
    
    setLoading(true);
    
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        // Let the main index.tsx handle the routing based on onboarding status
        router.replace('/');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      Alert.alert(t('common.error'), t('auth.invalid_code'));
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Sign Up
  const handleGoogleSignUp = async () => {
    try {
      setOauthLoading('google');
      const { createdSessionId, setActive } = await googleAuth();
      
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        // Let the main index.tsx handle the routing based on onboarding status
        router.replace('/');
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      Alert.alert(
        t('common.error', language), 
        'Google sign up failed. Please try again.'
      );
    } finally {
      setOauthLoading('');
    }
  };

  // Facebook OAuth Sign Up
  const handleFacebookSignUp = async () => {
    try {
      setOauthLoading('facebook');
      const { createdSessionId, setActive } = await facebookAuth();
      
      if (createdSessionId) {
        await setActive!({ session: createdSessionId });
        // Let the main index.tsx handle the routing based on onboarding status
        router.replace('/');
      }
    } catch (err: any) {
      console.error('Facebook OAuth error:', err);
      Alert.alert(
        t('common.error', language),
        'Facebook sign up failed. Please try again.'
      );
    } finally {
      setOauthLoading('');
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        <View className="flex-1 px-6 justify-center">
          <View className="items-center mb-8">
            <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="mail" size={32} color="#8B5CF6" />
            </View>
            
            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              {t('auth.verify_email_title')}
            </Text>
            
            <Text className="text-gray-600 text-center leading-6">
              {t('auth.verification_instructions')}
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-medium mb-2">
                {t('auth.verification_code')}
              </Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                className="w-full px-4 py-4 bg-gray-50 rounded-xl text-lg font-mono text-center tracking-widest"
                style={{ letterSpacing: 8 }}
              />
            </View>

            <TouchableOpacity
              onPress={handleVerifyEmail}
              disabled={loading || code.length !== 6}
              className={`w-full py-4 rounded-xl items-center ${
                loading || code.length !== 6 
                  ? 'bg-gray-300' 
                  : 'bg-purple-600'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  {t('auth.verify_code')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.replace('/auth/welcome')}
            className="w-10 h-10 items-center justify-center mt-4 mb-4"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          {/* Header */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-black mb-1">
              Create Account
            </Text>
            <Text className="text-gray-500 text-base">
              Sign up and take the next step towards your goals.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            
            {/* Full Name */}
            <View>
              <Text className="text-gray-700 text-sm font-medium mb-2">
                Enter full name
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="John Doe"
                className="w-full px-4 py-4 border border-gray-200 rounded-lg text-black text-base"
                autoCapitalize="words"
                style={{
                  borderColor: '#E5E7EB',
                  backgroundColor: 'white',
                }}
              />
            </View>

            {/* Email */}
            <View>
              <Text className="text-gray-700 text-sm font-medium mb-2">
                Email address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="example@gmail.com"
                className="w-full px-4 py-4 border border-gray-200 rounded-lg text-black text-base"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  borderColor: '#E5E7EB',
                  backgroundColor: 'white',
                }}
              />
            </View>

            {/* Password */}
            <View>
              <Text className="text-gray-700 text-sm font-medium mb-2">
                Password
              </Text>
              <View className="relative">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  className="w-full px-4 py-4 border border-gray-200 rounded-lg text-black text-base pr-12"
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: 'white',
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms Agreement */}
            <TouchableOpacity
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              className="flex-row items-start mt-4 mb-6"
            >
              <View className={`w-4 h-4 rounded border items-center justify-center mt-0.5 mr-3 ${
                agreeToTerms ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
              }`}>
                {agreeToTerms && (
                  <Ionicons name="checkmark" size={12} color="white" />
                )}
              </View>
              <Text className="text-gray-600 text-sm leading-5 flex-1">
                I have read and agree to the{' '}
                <Text className="text-blue-600">terms of</Text>{' '}
                <Text className="text-blue-600">privacy policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              className="w-full py-4 rounded-lg items-center mb-6"
              style={{
                backgroundColor: loading ? '#D1D5DB' : '#8B5CF6',
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Sign up
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="px-4 text-gray-500 text-sm">
                OR sign up with
              </Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Social Login Buttons */}
            <View className="space-y-3 mb-8">
              {/* Google Sign Up Button */}
              <TouchableOpacity
                onPress={handleGoogleSignUp}
                disabled={oauthLoading === 'google'}
                className="w-full py-4 px-4 border border-gray-200 rounded-lg flex-row items-center justify-center space-x-3"
                style={{ backgroundColor: 'white' }}
              >
                {oauthLoading === 'google' ? (
                  <ActivityIndicator size="small" color="#4285F4" />
                ) : (
                  <>
                    <Text className="text-xl">�</Text>
                    <Text className="text-gray-700 font-medium text-base">
                      Continue with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Facebook Sign Up Button */}
              <TouchableOpacity
                onPress={handleFacebookSignUp}
                disabled={oauthLoading === 'facebook'}
                className="w-full py-4 px-4 border border-gray-200 rounded-lg flex-row items-center justify-center space-x-3"
                style={{ backgroundColor: 'white' }}
              >
                {oauthLoading === 'facebook' ? (
                  <ActivityIndicator size="small" color="#1877F2" />
                ) : (
                  <>
                    <Text className="text-xl">📘</Text>
                    <Text className="text-gray-700 font-medium text-base">
                      Continue with Facebook
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View className="flex-row justify-center items-center mb-8">
              <Text className="text-gray-600 text-sm">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
                <Text className="text-blue-600 font-medium text-sm">
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
