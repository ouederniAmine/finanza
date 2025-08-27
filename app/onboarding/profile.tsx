import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTextAlign, t } from '../../lib/i18n';
import { useUIStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

interface ProfileData {
  age: string;
  profession: string;
  totalBalance: string;
  spendingStyle: 'conservative' | 'moderate' | 'spender' | '';
  primaryGoal: 'saving' | 'budgeting' | 'debt' | 'investment' | '';
  hasExperienceWithApps: boolean | null;
}

export default function ProfileScreen() {
  const { language } = useUIStore();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ProfileData>({
    age: '',
    profession: '',
    totalBalance: '',
    spendingStyle: '',
    primaryGoal: '',
    hasExperienceWithApps: null,
  });

  const totalSteps = 6;

  const handleNext = async () => {
    switch (step) {
      case 1:
        if (!profile.age.trim()) {
          Alert.alert(t('onboarding.required_info', language), t('onboarding.please_enter_age', language));
          return;
        }
        break;
      case 2:
        if (!profile.profession.trim()) {
          Alert.alert(t('onboarding.required_info', language), t('onboarding.please_enter_profession', language));
          return;
        }
        break;
      case 3:
        if (!profile.totalBalance.trim()) {
          Alert.alert(t('onboarding.required_info', language), t('onboarding.please_enter_balance', language) || 'Please enter your total balance');
          return;
        }
        break;
      case 4:
        if (!profile.spendingStyle) {
          Alert.alert(t('onboarding.required_info', language), t('onboarding.please_select_spending', language));
          return;
        }
        break;
      case 5:
        if (!profile.primaryGoal) {
          Alert.alert(t('onboarding.required_info', language), t('onboarding.please_select_goal', language));
          return;
        }
        break;
      case 6:
        if (profile.hasExperienceWithApps === null) {
          Alert.alert(t('onboarding.required_info', language), t('onboarding.please_answer_question', language));
          return;
        }
        // Save profile data to Supabase using Clerk user
        try {
          console.log('Saving profile data for user:', user?.id);
          console.log('Profile data:', profile);
          
          if (!user) {
            console.error('No authenticated user found');
            Alert.alert(t('messages.error', language), t('onboarding.session_expired', language));
            router.replace('/auth/sign-in');
            return;
          }
          
          // Use Clerk ID directly for operations
          const { error } = await supabase
            .from('users')
            .update({
              total_balance: parseFloat(profile.totalBalance),
              balance_last_updated: new Date().toISOString(),
              cultural_preferences: {
                age: parseInt(profile.age),
                profession: profile.profession.trim(),
                spending_style: profile.spendingStyle,
                primary_goal: profile.primaryGoal,
                has_experience_with_apps: profile.hasExperienceWithApps
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);            if (error) {
              console.error('Error saving profile:', error);
              // Don't block the flow, just log the error
            }
        } catch (error) {
          console.error('Error:', error);
          Alert.alert(t('messages.error', language), t('onboarding.connection_error', language));
          return;
        }
        
        router.push('/onboarding/preferences');
        return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View className="flex-1 justify-center">
            <Text className="text-white text-2xl font-bold text-center mb-4">
              قديش عمرك؟ 🎂
            </Text>
            <Text className="text-white/80 text-lg text-center mb-8">
              باش نعطيك نصائح مناسبة لعمرك
            </Text>
            <TextInput
              value={profile.age}
              onChangeText={(text) => setProfile({ ...profile, age: text })}
              placeholder={t('onboarding.age_placeholder', language)}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              className="bg-white/90 p-4 rounded-xl text-gray-800 text-lg text-center mb-4"
              style={{ textAlign: getTextAlign(language) }}
              maxLength={2}
            />
          </View>
        );

      case 2:
        return (
          <View className="flex-1 justify-center">
            <Text className="text-white text-2xl font-bold text-center mb-4">
              إيش تخدم؟ 💼
            </Text>
            <Text className="text-white/80 text-lg text-center mb-8">
              باش نفهم وضعك المالي أكثر
            </Text>
            <TextInput
              value={profile.profession}
              onChangeText={(text) => setProfile({ ...profile, profession: text })}
              placeholder="مثال: مهندس، مدرس، طالب..."
              placeholderTextColor="#9CA3AF"
              className="bg-white/90 p-4 rounded-xl text-gray-800 text-lg text-center mb-4"
              autoCapitalize="words"
            />
          </View>
        );

      case 3:
        return (
          <View className="flex-1 justify-center">
            <Text className="text-white text-2xl font-bold text-center mb-4">
              قديش مجموع رصيدك الحالي؟ 💰
            </Text>
            <Text className="text-white/80 text-lg text-center mb-8">
              أدخل رصيدك الحالي الكامل لنساعدك في التخطيط المالي
            </Text>
            <View className="relative">
              <TextInput
                value={profile.totalBalance}
                onChangeText={(text) => setProfile({ ...profile, totalBalance: text })}
                placeholder="مثال: 5000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                className="bg-white/90 p-4 rounded-xl text-gray-800 text-lg text-center mb-4 pr-16"
              />
              <Text className="absolute right-4 top-4 text-gray-600 text-lg">TND</Text>
            </View>
            <Text className="text-white/60 text-sm text-center">
              هذه المعلومة سرية ومحمية 🔒
            </Text>
          </View>
        );

      case 4:
        return (
          <View className="flex-1 justify-center">
            <Text className="text-white text-2xl font-bold text-center mb-4">
              كيفاش تصرف عادة؟ 🛍️
            </Text>
            <Text className="text-white/80 text-lg text-center mb-8">
              اختار الوصف اللي يناسبك أكثر
            </Text>
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => setProfile({ ...profile, spendingStyle: 'conservative' })}
                className={`p-4 rounded-xl border-2 ${
                  profile.spendingStyle === 'conservative' 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <Text className={`text-lg font-semibold ${
                  profile.spendingStyle === 'conservative' ? 'text-purple-600' : 'text-white'
                }`}>
                  🏦 محافظ - نخزن الفلوس ونصرف بس على الضروري
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setProfile({ ...profile, spendingStyle: 'moderate' })}
                className={`p-4 rounded-xl border-2 ${
                  profile.spendingStyle === 'moderate' 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <Text className={`text-lg font-semibold ${
                  profile.spendingStyle === 'moderate' ? 'text-purple-600' : 'text-white'
                }`}>
                  ⚖️ متوازن - نصرف بعقل ونوفر شوية
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setProfile({ ...profile, spendingStyle: 'spender' })}
                className={`p-4 rounded-xl border-2 ${
                  profile.spendingStyle === 'spender' 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <Text className={`text-lg font-semibold ${
                  profile.spendingStyle === 'spender' ? 'text-purple-600' : 'text-white'
                }`}>
                  🛒 أحب أصرف - الحياة قصيرة ونستمتع
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 5:
        return (
          <View className="flex-1 justify-center">
            <Text className="text-white text-2xl font-bold text-center mb-4">
              إيش هدفك الأساسي؟ 🎯
            </Text>
            <Text className="text-white/80 text-lg text-center mb-8">
              باش نركز على اللي يهمك أكثر
            </Text>
            <View className="space-y-3">
              <TouchableOpacity
                onPress={() => setProfile({ ...profile, primaryGoal: 'saving' })}
                className={`p-4 rounded-xl border-2 ${
                  profile.primaryGoal === 'saving' 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <Text className={`text-lg font-semibold ${
                  profile.primaryGoal === 'saving' ? 'text-purple-600' : 'text-white'
                }`}>
                  💰 نوفر فلوس لأهداف معينة
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setProfile({ ...profile, primaryGoal: 'budgeting' })}
                className={`p-4 rounded-xl border-2 ${
                  profile.primaryGoal === 'budgeting' 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <Text className={`text-lg font-semibold ${
                  profile.primaryGoal === 'budgeting' ? 'text-purple-600' : 'text-white'
                }`}>
                  📊 نتحكم في مصاريفي
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setProfile({ ...profile, primaryGoal: 'debt' })}
                className={`p-4 rounded-xl border-2 ${
                  profile.primaryGoal === 'debt' 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <Text className={`text-lg font-semibold ${
                  profile.primaryGoal === 'debt' ? 'text-purple-600' : 'text-white'
                }`}>
                  🏃 نخلص ديوني
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setProfile({ ...profile, primaryGoal: 'investment' })}
                className={`p-4 rounded-xl border-2 ${
                  profile.primaryGoal === 'investment' 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <Text className={`text-lg font-semibold ${
                  profile.primaryGoal === 'investment' ? 'text-purple-600' : 'text-white'
                }`}>
                  📈 نستثمر ونكبر فلوسي
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 6:
        return (
          <View className="flex-1 justify-center">
            <Text className="text-white text-2xl font-bold text-center mb-4">
              هل استعملت تطبيقات مالية قبل؟ 📱
            </Text>
            <Text className="text-white/80 text-lg text-center mb-8">
              باش نعرف كيفاش نبسط عليك الأمور
            </Text>
            <View className="space-y-4">
              <TouchableOpacity
                onPress={() => setProfile({ ...profile, hasExperienceWithApps: true })}
                className={`p-6 rounded-xl border-2 ${
                  profile.hasExperienceWithApps === true 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <Text className={`text-xl font-semibold text-center ${
                  profile.hasExperienceWithApps === true ? 'text-purple-600' : 'text-white'
                }`}>
                  ✅ إي، عندي تجربة مع تطبيقات مالية
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setProfile({ ...profile, hasExperienceWithApps: false })}
                className={`p-6 rounded-xl border-2 ${
                  profile.hasExperienceWithApps === false 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <Text className={`text-xl font-semibold text-center ${
                  profile.hasExperienceWithApps === false ? 'text-purple-600' : 'text-white'
                }`}>
                  🆕 لا، هذه أول مرة
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

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
            className="flex-1 px-6 py-8"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Progress Bar */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white/80 text-base">
                  خطوة {step} من {totalSteps}
                </Text>
                <Text className="text-white/80 text-base">
                  {Math.round((step / totalSteps) * 100)}%
                </Text>
              </View>
              <View className="h-2 bg-white/20 rounded-full">
                <View 
                  className="h-2 bg-white rounded-full"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </View>
            </View>

            {/* Step Content */}
            {renderStep()}

            {/* Navigation Buttons */}
            <View className="flex-row justify-between mt-8">
              <TouchableOpacity
                onPress={handleBack}
                disabled={step === 1}
                className={`flex-1 py-4 rounded-xl mr-3 ${
                  step === 1 ? 'opacity-50' : ''
                }`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  ← رجوع
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNext}
                className="flex-1 bg-white py-4 rounded-xl ml-3"
              >
                <Text className="text-purple-600 text-lg font-semibold text-center">
                  {step === totalSteps ? 'متابعة' : 'التالي →'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
