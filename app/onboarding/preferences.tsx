import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTextAlign, t } from '../../lib/i18n';
import { useUIStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

interface PreferencesData {
  notifications: {
    dailyReminder: boolean;
    budgetAlerts: boolean;
    goalProgress: boolean;
    weeklyReport: boolean;
  };
  currency: 'TND' | 'USD' | 'EUR';
  language: 'tn' | 'fr' | 'en';
  reminderTime: '08:00' | '12:00' | '18:00' | '20:00';
  expenseCategories: string[];
  budgetStyle: 'strict' | 'flexible' | 'relaxed';
  monthlyIncome: number;
}

// Define categories outside component to prevent recreation
const getExpenseCategoriesOptions = (language: 'en' | 'fr' | 'tn') => [
  { id: 'food', name: t('onboarding.category_food', language), icon: '🍽️', color: '#FF6B6B' },
  { id: 'transport', name: t('onboarding.category_transport', language), icon: '🚗', color: '#4ECDC4' },
  { id: 'shopping', name: t('onboarding.category_shopping', language), icon: '🛍️', color: '#45B7D1' },
  { id: 'entertainment', name: t('onboarding.category_entertainment', language), icon: '🎬', color: '#96CEB4' },
  { id: 'health', name: t('onboarding.category_health', language), icon: '🏥', color: '#FECA57' },
  { id: 'education', name: t('onboarding.category_education', language), icon: '📚', color: '#FF9FF3' },
  { id: 'bills', name: t('onboarding.category_bills', language), icon: '💡', color: '#54A0FF' },
  { id: 'coffee', name: t('onboarding.category_coffee', language), icon: '☕', color: '#A0522D' },
  { id: 'gifts', name: t('onboarding.category_gifts', language), icon: '🎁', color: '#F0932B' },
  { id: 'travel', name: t('onboarding.category_travel', language), icon: '✈️', color: '#6C5CE7' },
];

// Define income categories
const getIncomeCategoriesOptions = () => [
  { id: 'salary', name_tn: 'راتب', name_en: 'Salary', name_fr: 'Salaire', name_ar: 'راتب', icon: '💼', color: '#00B894' },
  { id: 'freelance', name_tn: 'عمل حر', name_en: 'Freelance', name_fr: 'Freelance', name_ar: 'عمل حر', icon: '💻', color: '#00CEC9' },
  { id: 'business', name_tn: 'أعمال', name_en: 'Business', name_fr: 'Entreprise', name_ar: 'أعمال', icon: '🏢', color: '#6C5CE7' },
  { id: 'investment', name_tn: 'استثمار', name_en: 'Investment', name_fr: 'Investissement', name_ar: 'استثمار', icon: '📈', color: '#A29BFE' },
  { id: 'rental', name_tn: 'إيجار', name_en: 'Rental Income', name_fr: 'Revenus locatifs', name_ar: 'إيجار', icon: '🏠', color: '#FD79A8' },
  { id: 'bonus', name_tn: 'علاوة', name_en: 'Bonus', name_fr: 'Prime', name_ar: 'علاوة', icon: '🎯', color: '#FDCB6E' },
];

// Helper function to get category data with all languages
const getCategoryData = (categoryId: string, type: 'expense' | 'income') => {
  if (type === 'income') {
    const incomeCategory = getIncomeCategoriesOptions().find(cat => cat.id === categoryId);
    return incomeCategory || null;
  } else {
    // For expense categories, we need to create the multi-language data
    const expenseOption = getExpenseCategoriesOptions('en').find(cat => cat.id === categoryId);
    if (!expenseOption) return null;
    
    // Create fallback names in case translations are missing
    const fallbackNames = {
      food: { tn: 'ماكلة', en: 'Food', fr: 'Nourriture', ar: 'طعام' },
      transport: { tn: 'نقل', en: 'Transport', fr: 'Transport', ar: 'مواصلات' },
      shopping: { tn: 'تسوق', en: 'Shopping', fr: 'Shopping', ar: 'تسوق' },
      entertainment: { tn: 'ترفيه', en: 'Entertainment', fr: 'Divertissement', ar: 'ترفيه' },
      health: { tn: 'صحة', en: 'Health', fr: 'Santé', ar: 'صحة' },
      education: { tn: 'تعليم', en: 'Education', fr: 'Éducation', ar: 'تعليم' },
      bills: { tn: 'فواتير', en: 'Bills', fr: 'Factures', ar: 'فواتير' },
      coffee: { tn: 'قهوة', en: 'Coffee', fr: 'Café', ar: 'قهوة' },
      gifts: { tn: 'هدايا', en: 'Gifts', fr: 'Cadeaux', ar: 'هدايا' },
      travel: { tn: 'سفر', en: 'Travel', fr: 'Voyage', ar: 'سفر' },
    };
    
    const fallback = fallbackNames[categoryId as keyof typeof fallbackNames];
    
    return {
      id: categoryId,
      name_tn: t(`onboarding.category_${categoryId}`, 'tn') || fallback?.tn || categoryId,
      name_en: t(`onboarding.category_${categoryId}`, 'en') || fallback?.en || categoryId,
      name_fr: t(`onboarding.category_${categoryId}`, 'fr') || fallback?.fr || categoryId,
      name_ar: fallback?.ar || fallback?.tn || categoryId,
      icon: expenseOption.icon,
      color: expenseOption.color,
    };
  }
};

export default function PreferencesScreen() {
  const { user } = useUser();
  const { language } = useUIStore();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preferences, setPreferences] = useState<PreferencesData>({
    notifications: {
      dailyReminder: true,
      budgetAlerts: true,
      goalProgress: true,
      weeklyReport: false,
    },
    currency: 'TND',
    language: 'tn',
    reminderTime: '20:00',
    expenseCategories: [],
    budgetStyle: 'flexible',
    monthlyIncome: 0,
  });

  const totalSteps = 6;
  const expenseCategoriesOptions = getExpenseCategoriesOptions(language);

  const handleNext = async () => {
    switch (step) {
      case 4:
        if (preferences.expenseCategories.length === 0) {
          Alert.alert(t('onboarding.preferences_required', language), t('onboarding.categories_required', language));
          return;
        }
        break;
      case 5:
        if (preferences.monthlyIncome <= 0) {
          Alert.alert('دخل شهري مطلوب', 'يرجى إدخال دخلك الشهري لنساعدك في إدارة ميزانيتك');
          return;
        }
        break;
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Prevent multiple executions
      if (isProcessing) {
        console.log('⚠️ Already processing, ignoring duplicate call');
        return;
      }
      
      setIsProcessing(true);
      
      // Save preferences data to Supabase using Clerk user
      try {
        console.log('Saving preferences data for user:', user?.id);
        console.log('Preferences data:', preferences);
        
        if (!user) {
          console.error('No authenticated user found');
          Alert.alert(t('common.error', language), t('onboarding.financial_session_expired', language));
          router.replace('/auth/sign-in');
          return;
        }
        
        // Get existing cultural preferences to merge 
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('cultural_preferences')
          .eq('id', user.id)
          .single();

        if (fetchError) {
          console.error('Error fetching user data:', fetchError);
        }

        const existingPreferences = userData?.cultural_preferences || {};

        // Clean slate: Delete existing categories for this user to avoid conflicts
        // This ensures onboarding creates a fresh set of categories
        console.log('🧹 Cleaning existing categories for fresh onboarding...');
        const { error: deleteError } = await supabase
          .from('categories')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error deleting existing categories:', deleteError);
          // Continue anyway - insertion will handle duplicates
        } else {
          console.log('✅ Existing categories cleaned successfully');
        }

        // Insert the selected categories into the categories table
        console.log('=== CATEGORY INSERTION DEBUG ===');
        console.log('Selected category IDs:', preferences.expenseCategories);
        console.log('Number of selected categories:', preferences.expenseCategories.length);
        
        // Prepare expense categories
        const expenseCategoryInserts = preferences.expenseCategories.map(categoryId => {
          const categoryData = getCategoryData(categoryId, 'expense');
          console.log(`Processing expense category: ${categoryId} -> ${categoryData?.name_en}`);
          return {
            user_id: user.id,
            name_tn: categoryData?.name_tn || categoryId,
            name_en: categoryData?.name_en || categoryId,
            name_ar: categoryData?.name_ar || categoryId,
            name_fr: categoryData?.name_fr || categoryId,
            icon: categoryData?.icon || '📝',
            color: categoryData?.color || '#6366F1',
            type: 'expense',
            is_default: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        });

        // Add default income categories (always include these)
        const incomeCategories = getIncomeCategoriesOptions();
        const incomeCategoryInserts = incomeCategories.map(categoryData => {
          console.log(`Processing income category: ${categoryData.id} -> ${categoryData.name_en}`);
          return {
            user_id: user.id,
            name_tn: categoryData.name_tn,
            name_en: categoryData.name_en,
            name_ar: categoryData.name_ar,
            name_fr: categoryData.name_fr,
            icon: categoryData.icon,
            color: categoryData.color,
            type: 'income',
            is_default: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        });

        // Combine all categories
        const allCategoryInserts = [...expenseCategoryInserts, ...incomeCategoryInserts];

        console.log('Total categories to insert:', allCategoryInserts.length);
        console.log('Expense categories:', expenseCategoryInserts.length);
        console.log('Income categories:', incomeCategoryInserts.length);
        console.log('Category inserts data:', JSON.stringify(allCategoryInserts, null, 2));

        if (allCategoryInserts.length > 0) {
          // Use a simple insert since we cleaned the slate
          const { error: categoryError } = await supabase
            .from('categories')
            .insert(allCategoryInserts);

          if (categoryError) {
            console.error('Error inserting categories:', categoryError);
            // Don't block the flow, just log the error
          } else {
            console.log('✅ Categories inserted successfully:', allCategoryInserts.length);
            
            // Verify insertion by counting rows
            const { count, error: countError } = await supabase
              .from('categories')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id);
            
            if (!countError) {
              console.log('📊 Total categories in DB for user:', count);
            }
          }
        } else {
          console.log('ℹ️ No categories to insert');
        }

        // Then update user preferences
        const { error } = await supabase
          .from('users')
          .update({
            preferred_currency: preferences.currency,
            preferred_language: preferences.language,
            cultural_preferences: {
              ...existingPreferences,
              notification_preferences: preferences.notifications,
              reminder_time: preferences.reminderTime,
              expense_categories: preferences.expenseCategories,
              budget_style: preferences.budgetStyle,
              monthly_income: preferences.monthlyIncome
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

          if (error) {
            console.error('Error saving preferences:', error);
            // Don't block the flow, just log the error
          }
      } catch (error) {
        console.error('Error:', error);
        Alert.alert(t('common.error', language), t('onboarding.preferences_save_error', language));
        setIsProcessing(false);
        return;
      } finally {
        setIsProcessing(false);
      }
      
      router.push('/onboarding/complete');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const current = preferences.expenseCategories;
    if (current.includes(categoryId)) {
      setPreferences({
        ...preferences,
        expenseCategories: current.filter(id => id !== categoryId)
      });
    } else {
      setPreferences({
        ...preferences,
        expenseCategories: [...current, categoryId]
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View className="flex-1 justify-center">
            <Text className={`text-white text-2xl font-bold text-center mb-4 ${getTextAlign(language)}`}>
              {t('onboarding.notification_settings', language)} 🔔
            </Text>
            <Text className={`text-white/80 text-lg text-center mb-8 ${getTextAlign(language)}`}>
              {t('onboarding.notification_subtitle', language)}
            </Text>
            <View className="space-y-4">
              <TouchableOpacity
                onPress={() => setPreferences({
                  ...preferences,
                  notifications: {
                    ...preferences.notifications,
                    dailyReminder: !preferences.notifications.dailyReminder
                  }
                })}
                className={`p-4 rounded-xl border-2 flex-row items-center ${
                  preferences.notifications.dailyReminder 
                    ? 'bg-white/20 border-white' 
                    : 'bg-white/5 border-white/30'
                }`}
              >
                <Text className="text-2xl mr-3">
                  {preferences.notifications.dailyReminder ? '✅' : '⬜'}
                </Text>
                <View className="flex-1">
                  <Text className={`text-white text-lg font-semibold ${getTextAlign(language)}`}>
                    {t('onboarding.daily_reminder', language)}
                  </Text>
                  <Text className={`text-white/70 text-sm ${getTextAlign(language)}`}>
                    {t('onboarding.daily_reminder_desc', language)}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPreferences({
                  ...preferences,
                  notifications: {
                    ...preferences.notifications,
                    budgetAlerts: !preferences.notifications.budgetAlerts
                  }
                })}
                className={`p-4 rounded-xl border-2 flex-row items-center ${
                  preferences.notifications.budgetAlerts 
                    ? 'bg-white/20 border-white' 
                    : 'bg-white/5 border-white/30'
                }`}
              >
                <Text className="text-2xl mr-3">
                  {preferences.notifications.budgetAlerts ? '✅' : '⬜'}
                </Text>
                <View className="flex-1">
                  <Text className={`text-white text-lg font-semibold ${getTextAlign(language)}`}>
                    {t('onboarding.budget_alerts', language)}
                  </Text>
                  <Text className={`text-white/70 text-sm ${getTextAlign(language)}`}>
                    {t('onboarding.budget_alerts_desc', language)}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPreferences({
                  ...preferences,
                  notifications: {
                    ...preferences.notifications,
                    goalProgress: !preferences.notifications.goalProgress
                  }
                })}
                className={`p-4 rounded-xl border-2 flex-row items-center ${
                  preferences.notifications.goalProgress 
                    ? 'bg-white/20 border-white' 
                    : 'bg-white/5 border-white/30'
                }`}
              >
                <Text className="text-2xl mr-3">
                  {preferences.notifications.goalProgress ? '✅' : '⬜'}
                </Text>
                <View className="flex-1">
                  <Text className="text-white text-lg font-semibold">
                    تقدم الأهداف
                  </Text>
                  <Text className="text-white/70 text-sm">
                    نبشرك بتقدمك في أهداف التوفير
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPreferences({
                  ...preferences,
                  notifications: {
                    ...preferences.notifications,
                    weeklyReport: !preferences.notifications.weeklyReport
                  }
                })}
                className={`p-4 rounded-xl border-2 flex-row items-center ${
                  preferences.notifications.weeklyReport 
                    ? 'bg-white/20 border-white' 
                    : 'bg-white/5 border-white/30'
                }`}
              >
                <Text className="text-2xl mr-3">
                  {preferences.notifications.weeklyReport ? '✅' : '⬜'}
                </Text>
                <View className="flex-1">
                  <Text className="text-white text-lg font-semibold">
                    تقرير أسبوعي
                  </Text>
                  <Text className="text-white/70 text-sm">
                    ملخص أسبوعي لمصاريفك ونصائح
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 2:
        return (
          <View className="flex-1 justify-center">
            <Text className="text-white text-2xl font-bold text-center mb-4">
              متى تحب نذكرك؟ ⏰
            </Text>
            <Text className="text-white/80 text-lg text-center mb-8">
              اختار الوقت المناسب للتذكير اليومي
            </Text>
            <View className="space-y-3">
              {[
                { value: '08:00', label: '8:00 صباحاً - مع قهوة الصباح ☕', icon: '🌅' },
                { value: '12:00', label: '12:00 ظهراً - وقت الغداء 🍽️', icon: '☀️' },
                { value: '18:00', label: '6:00 مساءً - بعد العمل 💼', icon: '🌆' },
                { value: '20:00', label: '8:00 مساءً - قبل النوم 🌙', icon: '🌃' },
              ].map((time) => (
                <TouchableOpacity
                  key={time.value}
                  onPress={() => setPreferences({ ...preferences, reminderTime: time.value as any })}
                  className={`p-4 rounded-xl border-2 flex-row items-center ${
                    preferences.reminderTime === time.value 
                      ? 'bg-white border-white' 
                      : 'bg-white/10 border-white/30'
                  }`}
                >
                  <Text className="text-2xl mr-3">{time.icon}</Text>
                  <Text className={`text-lg font-semibold flex-1 ${
                    preferences.reminderTime === time.value ? 'text-purple-600' : 'text-white'
                  }`}>
                    {time.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View className="flex-1 justify-center">
            <Text className="text-white text-2xl font-bold text-center mb-4">
              كيفاش تحب نتابع ميزانيتك؟ 📊
            </Text>
            <Text className="text-white/80 text-lg text-center mb-8">
              اختار النمط اللي يناسب شخصيتك
            </Text>
            <View className="space-y-4">
              <TouchableOpacity
                onPress={() => setPreferences({ ...preferences, budgetStyle: 'strict' })}
                className={`p-4 rounded-xl border-2 ${
                  preferences.budgetStyle === 'strict' 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <View className="flex-row items-center mb-2">
                  <Text className="text-2xl mr-3">🎯</Text>
                  <Text className={`text-xl font-bold ${
                    preferences.budgetStyle === 'strict' ? 'text-purple-600' : 'text-white'
                  }`}>
                    صارم - نظام محكم
                  </Text>
                </View>
                <Text className={`text-sm ${
                  preferences.budgetStyle === 'strict' ? 'text-purple-500' : 'text-white/70'
                }`}>
                  تنبيه فوري لما تتجاوز الحد، تتبع دقيق لكل فلس
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPreferences({ ...preferences, budgetStyle: 'flexible' })}
                className={`p-4 rounded-xl border-2 ${
                  preferences.budgetStyle === 'flexible' 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <View className="flex-row items-center mb-2">
                  <Text className="text-2xl mr-3">⚖️</Text>
                  <Text className={`text-xl font-bold ${
                    preferences.budgetStyle === 'flexible' ? 'text-purple-600' : 'text-white'
                  }`}>
                    مرن - متوازن
                  </Text>
                </View>
                <Text className={`text-sm ${
                  preferences.budgetStyle === 'flexible' ? 'text-purple-500' : 'text-white/70'
                }`}>
                  تذكير لطيف، مساحة صغيرة للتجاوز أحياناً
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPreferences({ ...preferences, budgetStyle: 'relaxed' })}
                className={`p-4 rounded-xl border-2 ${
                  preferences.budgetStyle === 'relaxed' 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <View className="flex-row items-center mb-2">
                  <Text className="text-2xl mr-3">😌</Text>
                  <Text className={`text-xl font-bold ${
                    preferences.budgetStyle === 'relaxed' ? 'text-purple-600' : 'text-white'
                  }`}>
                    مريح - بساطة
                  </Text>
                </View>
                <Text className={`text-sm ${
                  preferences.budgetStyle === 'relaxed' ? 'text-purple-500' : 'text-white/70'
                }`}>
                  تتبع عام، تنبيهات قليلة، تركيز على الصورة الكبيرة
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 4:
        return (
          <View className="flex-1 justify-center">
            <Text className="text-white text-2xl font-bold text-center mb-4">
              وين تصرف أكثر حاجة؟ 💳
            </Text>
            <Text className="text-white/80 text-lg text-center mb-8">
              اختار الفئات اللي تهمك (يمكنك اختيار أكثر من واحدة)
            </Text>
            <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap justify-between">
                {expenseCategoriesOptions.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => toggleCategory(category.id)}
                    className={`w-[48%] p-4 rounded-xl border-2 mb-3 ${
                      preferences.expenseCategories.includes(category.id)
                        ? 'border-white' 
                        : 'border-white/30'
                    }`}
                    style={{
                      backgroundColor: preferences.expenseCategories.includes(category.id)
                        ? category.color + '20' // Add transparency
                        : 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <Text className="text-2xl text-center mb-2">{category.icon}</Text>
                    <Text className={`text-center font-semibold ${
                      preferences.expenseCategories.includes(category.id) 
                        ? 'text-white' 
                        : 'text-white'
                    }`}>
                      {category.name}
                    </Text>
                    {preferences.expenseCategories.includes(category.id) && (
                      <View 
                        className="absolute top-2 right-2 w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View className="mt-4 space-y-2">
              <Text className="text-white/60 text-sm text-center">
                اخترت {preferences.expenseCategories.length} فئة مصاريف
              </Text>
              <Text className="text-white/50 text-xs text-center">
                💡 ستتم إضافة فئات الدخل تلقائياً (راتب، عمل حر، استثمار، إلخ...)
              </Text>
            </View>
          </View>
        );

      case 5:
        return (
          <View className="flex-1 justify-center">
            <Text className="text-white text-2xl font-bold text-center mb-4">
              قداش دخلك الشهري؟ 💰
            </Text>
            <Text className="text-white/80 text-lg text-center mb-8">
              هذا يساعدنا نقترح عليك ميزانية مناسبة
            </Text>
            <View className="space-y-6">
              <View className="bg-white/10 rounded-xl p-4">
                <Text className="text-white text-lg font-semibold mb-4 text-center">
                  الدخل الشهري ({preferences.currency})
                </Text>
                <View className="flex-row items-center justify-center space-x-2">
                  <TouchableOpacity
                    onPress={() => setPreferences({ 
                      ...preferences, 
                      monthlyIncome: Math.max(0, preferences.monthlyIncome - 100) 
                    })}
                    className="bg-white/20 rounded-full w-12 h-12 items-center justify-center"
                  >
                    <Text className="text-white text-2xl font-bold">-</Text>
                  </TouchableOpacity>
                  <View className="bg-white rounded-xl px-6 py-3 min-w-[150px]">
                    <Text className="text-purple-600 text-2xl font-bold text-center">
                      {preferences.monthlyIncome.toFixed(0)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setPreferences({ 
                      ...preferences, 
                      monthlyIncome: preferences.monthlyIncome + 100 
                    })}
                    className="bg-white/20 rounded-full w-12 h-12 items-center justify-center"
                  >
                    <Text className="text-white text-2xl font-bold">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View className="space-y-3">
                <Text className="text-white/70 text-center mb-2">أو اختار من الخيارات:</Text>
                {[
                  { value: 500, label: '500 - طالب/متدرب 🎓' },
                  { value: 800, label: '800 - موظف مبتدئ 💼' },
                  { value: 1200, label: '1200 - موظف متوسط 📈' },
                  { value: 1800, label: '1800 - موظف خبير 🏆' },
                  { value: 2500, label: '2500+ - إداري/مدير 👔' },
                ].map((income) => (
                  <TouchableOpacity
                    key={income.value}
                    onPress={() => setPreferences({ ...preferences, monthlyIncome: income.value })}
                    className={`p-3 rounded-xl border-2 ${
                      preferences.monthlyIncome === income.value 
                        ? 'bg-white/20 border-white' 
                        : 'bg-white/5 border-white/30'
                    }`}
                  >
                    <Text className={`text-center font-semibold ${
                      preferences.monthlyIncome === income.value ? 'text-white' : 'text-white/80'
                    }`}>
                      {income.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 6:
        return (
          <View className="flex-1 justify-center">
            <Text className="text-white text-2xl font-bold text-center mb-4">
              أي لغة تفضل؟ 🌍
            </Text>
            <Text className="text-white/80 text-lg text-center mb-8">
              اختار اللغة اللي مريحة معاك أكثر
            </Text>
            <View className="space-y-4">
              <TouchableOpacity
                onPress={() => setPreferences({ ...preferences, language: 'tn' })}
                className={`p-4 rounded-xl border-2 flex-row items-center ${
                  preferences.language === 'tn' 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <Text className="text-3xl mr-4">🇹🇳</Text>
                <Text className={`text-xl font-semibold ${
                  preferences.language === 'tn' ? 'text-purple-600' : 'text-white'
                }`}>
                  تونسي عربي - اللغة الأم
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPreferences({ ...preferences, language: 'fr' })}
                className={`p-4 rounded-xl border-2 flex-row items-center ${
                  preferences.language === 'fr' 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <Text className="text-3xl mr-4">🇫🇷</Text>
                <Text className={`text-xl font-semibold ${
                  preferences.language === 'fr' ? 'text-purple-600' : 'text-white'
                }`}>
                  Français - فرنسي
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPreferences({ ...preferences, language: 'en' })}
                className={`p-4 rounded-xl border-2 flex-row items-center ${
                  preferences.language === 'en' 
                    ? 'bg-white border-white' 
                    : 'bg-white/10 border-white/30'
                }`}
              >
                <Text className="text-3xl mr-4">🇺🇸</Text>
                <Text className={`text-xl font-semibold ${
                  preferences.language === 'en' ? 'text-purple-600' : 'text-white'
                }`}>
                  English - إنجليزي
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
              disabled={isProcessing}
              className={`flex-1 bg-white py-4 rounded-xl ml-3 ${
                isProcessing ? 'opacity-50' : ''
              }`}
            >
              <Text className="text-purple-600 text-lg font-semibold text-center">
                {isProcessing ? 'جاري الحفظ...' : (step === totalSteps ? 'متابعة' : 'التالي →')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
