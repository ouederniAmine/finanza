import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTextAlign, t } from '../../lib/i18n';
import { useUIStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

interface FinancialData {
  monthlyIncome: string;
  monthlySavingsGoal: string;
  currentSavings: string;
  mainFinancialGoal: string;
  timeframe: '3months' | '6months' | '1year' | '2years' | 'longterm';
}

export default function FinancialScreen() {
  const { language } = useUIStore();
  const [step, setStep] = useState(1);
  const { user } = useUser();
  const [financialData, setFinancialData] = useState<FinancialData>({
    monthlyIncome: '',
    monthlySavingsGoal: '',
    currentSavings: '',
    mainFinancialGoal: '',
    timeframe: '1year',
  });

  const totalSteps = 4;

  // Check for auth user on component mount
  useEffect(() => {
    if (!user) {
      console.log('Financial screen - no authenticated user found');
      Alert.alert(
        t('onboarding.financial_session_expired', language),
        t('onboarding.financial_login_required', language),
        [
          {
            text: t('onboarding.financial_login_button', language),
            onPress: () => router.replace('/auth/sign-in')
          }
        ]
      );
    } else {
      console.log('Financial screen - authenticated user:', user.id);
    }
  }, [user]);

  const financialGoals = [
    { id: 'emergency', name: t('onboarding.goal_emergency', language), icon: '🛡️', desc: t('onboarding.goal_emergency_desc', language) },
    { id: 'travel', name: t('onboarding.goal_travel', language), icon: '✈️', desc: t('onboarding.goal_travel_desc', language) },
    { id: 'car', name: t('onboarding.goal_car', language), icon: '🚗', desc: t('onboarding.goal_car_desc', language) },
    { id: 'house', name: t('onboarding.goal_house', language), icon: '🏠', desc: t('onboarding.goal_house_desc', language) },
    { id: 'wedding', name: t('onboarding.goal_wedding', language), icon: '💍', desc: t('onboarding.goal_wedding_desc', language) },
    { id: 'education', name: t('onboarding.goal_education', language), icon: '🎓', desc: t('onboarding.goal_education_desc', language) },
    { id: 'business', name: t('onboarding.goal_business', language), icon: '💼', desc: t('onboarding.goal_business_desc', language) },
    { id: 'retirement', name: t('onboarding.goal_retirement', language), icon: '🏖️', desc: t('onboarding.goal_retirement_desc', language) },
  ];

  const timeframes = [
    { value: '3months', label: t('onboarding.timeframe_3months', language), desc: t('onboarding.timeframe_3months_desc', language) },
    { value: '6months', label: t('onboarding.timeframe_6months', language), desc: t('onboarding.timeframe_6months_desc', language) },
    { value: '1year', label: t('onboarding.timeframe_1year', language), desc: t('onboarding.timeframe_1year_desc', language) },
    { value: '2years', label: t('onboarding.timeframe_2years', language), desc: t('onboarding.timeframe_2years_desc', language) },
    { value: 'longterm', label: t('onboarding.timeframe_longterm', language), desc: t('onboarding.timeframe_longterm_desc', language) },
  ];

  const handleNext = async () => {
    switch (step) {
      case 1:
        if (!financialData.monthlyIncome.trim() || parseInt(financialData.monthlyIncome) <= 0) {
          Alert.alert(t('onboarding.required_info', language), t('onboarding.financial_income_required', language));
          return;
        }
        break;
      case 2:
        if (!financialData.monthlySavingsGoal.trim() || parseInt(financialData.monthlySavingsGoal) <= 0) {
          Alert.alert(t('onboarding.required_info', language), t('onboarding.financial_savings_required', language));
          return;
        }
        const income = parseInt(financialData.monthlyIncome);
        const savings = parseInt(financialData.monthlySavingsGoal);
        if (savings > income * 0.7) {
          Alert.alert(t('onboarding.financial_amount_warning', language), t('onboarding.financial_amount_too_high', language));
        }
        break;
      case 3:
        if (!financialData.mainFinancialGoal.trim()) {
          Alert.alert(t('onboarding.financial_goal_required', language), t('onboarding.financial_select_goal', language));
          return;
        }
        break;
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save financial data to Supabase and proceed to completion
      try {
        console.log('Saving financial data for user:', user?.id);
        console.log('Financial data:', financialData);
        
        if (user) {
          // First, get the current user cultural preferences to merge with them
          const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('cultural_preferences')
            .eq('id', user.id)
            .single();

          if (fetchError) {
            console.error('Error fetching user data:', fetchError);
          }

          const existingPreferences = userData?.cultural_preferences || {};

          // Create a savings goal using Clerk user ID
          const { error: goalError } = await supabase
            .from('savings_goals')
            .insert({
              user_id: user.id,
              title_tn: financialData.mainFinancialGoal || 'هدف مالي عام',
              title_ar: financialData.mainFinancialGoal || 'هدف مالي عام',
              title_fr: financialData.mainFinancialGoal || 'Objectif financier général',
              title_en: financialData.mainFinancialGoal || 'General financial goal',
              target_amount: parseFloat(financialData.monthlySavingsGoal) * (
                financialData.timeframe === '3months' ? 3 :
                financialData.timeframe === '6months' ? 6 :
                financialData.timeframe === '1year' ? 12 :
                financialData.timeframe === '2years' ? 24 : 60
              ),
              current_amount: parseFloat(financialData.currentSavings) || 0,
              priority: 'high'
            });

          // Update user cultural preferences with financial data (merge with existing)
          const { error: updateError } = await supabase
            .from('users')
            .update({
              cultural_preferences: {
                ...existingPreferences,
                monthly_savings_goal: parseFloat(financialData.monthlySavingsGoal),
                current_savings: parseFloat(financialData.currentSavings) || 0,
                main_financial_goal: financialData.mainFinancialGoal,
                financial_timeframe: financialData.timeframe,
                monthly_income: parseFloat(financialData.monthlyIncome)
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (goalError) {
            console.error('Error saving savings goal:', goalError);
          }
          
          if (updateError) {
            console.error('Error updating user preferences:', updateError);
          }
          
          if (goalError || updateError) {
            console.error('Some errors occurred, but continuing...');
            // Don't block the flow, just log the errors
          } else {
            console.log('Financial data saved successfully to database');
          }
        } else {
          console.log('No user found, continuing without saving to database');
        }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert(t('common.error', language), t('onboarding.financial_save_error', language));
      }
      
      console.log('Financial data saved successfully (locally)');
      router.push('/onboarding/preferences');
    }
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
            <Text className={`text-white text-2xl font-bold text-center mb-4 ${getTextAlign(language)}`}>
              {t('onboarding.financial_income_question', language)} 💰
            </Text>
            <Text className={`text-white/80 text-lg text-center mb-8 ${getTextAlign(language)}`}>
              {t('onboarding.financial_income_help', language)}
            </Text>
            <View className="mb-6">
              <TextInput
                value={financialData.monthlyIncome}
                onChangeText={(value) => setFinancialData({ ...financialData, monthlyIncome: value })}
                placeholder="1500"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="numeric"
                className="bg-white/20 p-6 rounded-xl text-white text-2xl text-center border border-white/30"
              />
              <Text className={`text-white/60 text-center mt-2 ${getTextAlign(language)}`}>
                {t('onboarding.financial_monthly_currency', language)}
              </Text>
            </View>
            <View className="bg-white/10 p-4 rounded-xl">
              <Text className={`text-white/80 text-sm text-center ${getTextAlign(language)}`}>
                💡 {t('onboarding.financial_privacy_note', language)}
              </Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View className="flex-1 justify-center">
            <Text className={`text-white text-2xl font-bold text-center mb-4 ${getTextAlign(language)}`}>
              {t('onboarding.financial_savings_question', language)} 🎯
            </Text>
            <Text className={`text-white/80 text-lg text-center mb-8 ${getTextAlign(language)}`}>
              {t('onboarding.financial_savings_help', language)}
            </Text>
            <View className="mb-6">
              <TextInput
                value={financialData.monthlySavingsGoal}
                onChangeText={(value) => setFinancialData({ ...financialData, monthlySavingsGoal: value })}
                placeholder="300"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="numeric"
                className="bg-white/20 p-6 rounded-xl text-white text-2xl text-center border border-white/30"
              />
              <Text className={`text-white/60 text-center mt-2 ${getTextAlign(language)}`}>
                {t('onboarding.financial_monthly_currency', language)}
              </Text>
            </View>
            {financialData.monthlyIncome && financialData.monthlySavingsGoal && (
              <View className="bg-white/10 p-4 rounded-xl">
                <Text className={`text-white text-center ${getTextAlign(language)}`}>
                  📊 {t('onboarding.financial_percentage_info', language).replace('{percentage}', Math.round((parseInt(financialData.monthlySavingsGoal) / parseInt(financialData.monthlyIncome)) * 100).toString())}
                </Text>
                <Text className={`text-white/60 text-sm text-center mt-1 ${getTextAlign(language)}`}>
                  {parseInt(financialData.monthlySavingsGoal) / parseInt(financialData.monthlyIncome) > 0.3 
                    ? t('onboarding.financial_high_percentage', language)
                    : t('onboarding.financial_good_percentage', language)
                  }
                </Text>
              </View>
            )}
          </View>
        );

      case 3:
        return (
          <View className="flex-1 justify-center">
            <Text className={`text-white text-2xl font-bold text-center mb-4 ${getTextAlign(language)}`}>
              {t('onboarding.financial_goal_question', language)} 🎯
            </Text>
            <Text className={`text-white/80 text-lg text-center mb-8 ${getTextAlign(language)}`}>
              {t('onboarding.financial_goal_help', language)}
            </Text>
            <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
              <View className="space-y-3">
                {financialGoals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    onPress={() => setFinancialData({ ...financialData, mainFinancialGoal: goal.id })}
                    className={`p-4 rounded-xl border-2 flex-row items-center ${
                      financialData.mainFinancialGoal === goal.id
                        ? 'bg-white border-white' 
                        : 'bg-white/10 border-white/30'
                    }`}
                  >
                    <Text className="text-2xl mr-3">{goal.icon}</Text>
                    <View className="flex-1">
                      <Text className={`text-lg font-semibold ${
                        financialData.mainFinancialGoal === goal.id ? 'text-purple-600' : 'text-white'
                      }`}>
                        {goal.name}
                      </Text>
                      <Text className={`text-sm ${
                        financialData.mainFinancialGoal === goal.id ? 'text-purple-500' : 'text-white/70'
                      }`}>
                        {goal.desc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        );

      case 4:
        return (
          <View className="flex-1 justify-center">
            <Text className={`text-white text-2xl font-bold text-center mb-4 ${getTextAlign(language)}`}>
              {t('onboarding.financial_timeframe_question', language)} ⏱️
            </Text>
            <Text className={`text-white/80 text-lg text-center mb-8 ${getTextAlign(language)}`}>
              {t('onboarding.financial_timeframe_help', language)}
            </Text>
            <View className="space-y-3">
              {timeframes.map((timeframe) => (
                <TouchableOpacity
                  key={timeframe.value}
                  onPress={() => setFinancialData({ ...financialData, timeframe: timeframe.value as any })}
                  className={`p-4 rounded-xl border-2 ${
                    financialData.timeframe === timeframe.value 
                      ? 'bg-white border-white' 
                      : 'bg-white/10 border-white/30'
                  }`}
                >
                  <Text className={`text-lg font-semibold mb-1 ${
                    financialData.timeframe === timeframe.value ? 'text-purple-600' : 'text-white'
                  }`}>
                    {timeframe.label}
                  </Text>
                  <Text className={`text-sm ${
                    financialData.timeframe === timeframe.value ? 'text-purple-500' : 'text-white/70'
                  }`}>
                    {timeframe.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {financialData.monthlySavingsGoal && (
              <View className="bg-white/10 p-4 rounded-xl mt-4">
                <Text className="text-white text-center">
                  💡 بهاذا المعدل، راح توفر حوالي{' '}
                  {financialData.timeframe === '3months' ? parseInt(financialData.monthlySavingsGoal) * 3 :
                   financialData.timeframe === '6months' ? parseInt(financialData.monthlySavingsGoal) * 6 :
                   financialData.timeframe === '1year' ? parseInt(financialData.monthlySavingsGoal) * 12 :
                   financialData.timeframe === '2years' ? parseInt(financialData.monthlySavingsGoal) * 24 :
                   '...'} دينار
                </Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1">
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
              <Text className={`text-white text-lg font-semibold text-center ${getTextAlign(language)}`}>
                {t('onboarding.nav_back', language)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              className="flex-1 bg-white py-4 rounded-xl ml-3"
            >
              <Text className={`text-purple-600 text-lg font-semibold text-center ${getTextAlign(language)}`}>
                {step === totalSteps ? t('onboarding.finish_setup', language) : t('onboarding.nav_next', language)}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
