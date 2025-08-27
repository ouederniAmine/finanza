import { useClerk, useOAuth, useSignIn } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { t } from '../../lib/i18n';
import { useUIStore } from '../../lib/store';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

export default function SignInScreen() {
  const { language } = useUIStore();
  const { signIn, setActive, isLoaded } = useSignIn();
  const clerk = useClerk();
  const router = useRouter();

  // OAuth hooks for social login
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: facebookAuth } = useOAuth({ strategy: 'oauth_facebook' });

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState('');

  const handleSignIn = async () => {
    if (!isLoaded) return;

    if (!emailAddress.trim() || !password.trim()) {
      Alert.alert(t('messages.error', language), t('auth.sign_in_fill_fields', language));
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting to sign in with:', { email: emailAddress.trim() });
      
      const signInAttempt = await signIn.create({
        identifier: emailAddress.trim(),
        password: password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        console.log('Sign in successful');
        // Let the main index.tsx handle the routing based on onboarding status
        router.replace('/');
      } else {
        console.error('Sign in incomplete:', JSON.stringify(signInAttempt, null, 2));
        Alert.alert(t('messages.error', language), t('auth.sign_in_check_data', language));
      }
    } catch (err: any) {
      console.error('Sign in error:', JSON.stringify(err, null, 2));
      
      if (err.errors && err.errors[0]) {
        const errorCode = err.errors[0].code;
        if (errorCode === 'session_exists') {
          // User is already signed in but session is stuck, try to clear it
          console.log('Session already exists, attempting to clear session...');
          try {
            // Force sign out any existing session
            await clerk.signOut();
            
            // Wait a moment for session to clear
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try signing in again
            const result = await signIn.create({
              identifier: emailAddress,
              password: password,
            });
            
            if (result.status === 'complete') {
              await setActive({ session: result.createdSessionId });
              // Let the main index.tsx handle the routing based on onboarding status
              router.replace('/');
            }
          } catch (clearError) {
            console.error('Error clearing session:', clearError);
            Alert.alert(
              t('messages.error', language), 
              t('auth.session_error', language) || 'Session error. Please restart the app.',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/auth/sign-in')
                }
              ]
            );
          }
          return;
        } else if (errorCode === 'form_identifier_not_found') {
          Alert.alert(t('messages.error', language), t('auth.sign_in_no_account_found', language));
        } else if (errorCode === 'form_password_incorrect') {
          Alert.alert(t('messages.error', language), t('auth.sign_in_incorrect_password', language));
        } else {
          Alert.alert(t('messages.error', language), t('auth.sign_in_check_data', language));
        }
      } else {
        Alert.alert(t('messages.error', language), t('auth.sign_in_connection_error', language));
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Sign In
  const handleGoogleSignIn = async () => {
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
        t('messages.error', language), 
        'Google sign in failed. Please try again.'
      );
    } finally {
      setOauthLoading('');
    }
  };

  // Facebook OAuth Sign In
  const handleFacebookSignIn = async () => {
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
        t('messages.error', language),
        'Facebook sign in failed. Please try again.'
      );
    } finally {
      setOauthLoading('');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.replace('/auth/welcome')}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          {/* Title */}
          <Text style={styles.title}>{t('auth.sign_in_title', language)}</Text>
          <Text style={styles.subtitle}>{t('auth.sign_in_subtitle', language)}</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('auth.email_label', language)}</Text>
              <TextInput
                style={styles.input}
                placeholder="ahmed@example.com"
                value={emailAddress}
                onChangeText={setEmailAddress}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('auth.password_label', language)}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>{t('auth.forgot_password', language)}</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.primaryButtonText}>{t('auth.sign_in_button', language)}</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.or_sign_in_with', language) || 'OR sign in with'}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <TouchableOpacity 
              style={[styles.socialButton, oauthLoading === 'google' && styles.disabledButton]}
              onPress={handleGoogleSignIn}
              disabled={oauthLoading !== ''}
            >
              {oauthLoading === 'google' ? (
                <ActivityIndicator size={20} color="#DB4437" />
              ) : (
                <Ionicons name="logo-google" size={20} color="#DB4437" />
              )}
              <Text style={styles.socialButtonText}>
                {t('auth.sign_in_with_google', language) || 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, oauthLoading === 'facebook' && styles.disabledButton]}
              onPress={handleFacebookSignIn}
              disabled={oauthLoading !== ''}
            >
              {oauthLoading === 'facebook' ? (
                <ActivityIndicator size={20} color="#1877F2" />
              ) : (
                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              )}
              <Text style={styles.socialButtonText}>
                {t('auth.sign_in_with_facebook', language) || 'Continue with Facebook'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('auth.dont_have_account', language)} 
              <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
                <Text style={styles.footerLink}> {t('auth.sign_up_button', language)}</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeButton: {
    padding: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    color: '#6366F1',
    fontWeight: '500',
  },
});
