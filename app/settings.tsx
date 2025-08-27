import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action' | 'info';
  value?: boolean;
  action?: () => void;
  dangerous?: boolean;
}

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [budgetAlertsEnabled, setBudgetAlertsEnabled] = useState(true);
  const [saveRemindersEnabled, setSaveRemindersEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('TND');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('تونسي');

  const currencies = [
    { code: 'TND', name: 'دينار تونسي', symbol: 'TND' },
    { code: 'USD', name: 'دولار أمريكي', symbol: '$' },
    { code: 'EUR', name: 'يورو', symbol: '€' },
    { code: 'SAR', name: 'ريال سعودي', symbol: 'SAR' },
  ];

  const languages = [
    { code: 'tn', name: 'تونسي', flag: '🇹🇳' },
    { code: 'ar', name: 'عربي فصيح', flag: '🌍' },
    { code: 'fr', name: 'فرنسي', flag: '🇫🇷' },
    { code: 'en', name: 'إنجليزي', flag: '🇺🇸' },
  ];

  const handleExportData = () => {
    Alert.alert(
      'تصدير البيانات',
      'باش تصدر جميع بياناتك المالية؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'تصدير',
          onPress: () => {
            // Export functionality
            Alert.alert('نجح!', 'تم تصدير البيانات بنجاح');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'حذف الحساب',
      'تأكد؟ هالعملية ما تنجمش ترجع فيها وكل البيانات باش تتمحى نهائياً!',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف نهائي',
          style: 'destructive',
          onPress: () => {
            Alert.alert('تم الحذف', 'تم حذف حسابك نهائياً');
          }
        }
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'الدعم الفني',
      'تحب تتواصل معانا كيفاش؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'واتساب', onPress: () => {} },
        { text: 'إيميل', onPress: () => {} },
      ]
    );
  };

  const handleBackup = () => {
    Alert.alert(
      'نسخ احتياطي',
      'باش نعمل نسخة احتياطية من بياناتك؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'نعم',
          onPress: () => {
            Alert.alert('نجح!', 'تمت النسخة الاحتياطية بنجاح');
          }
        }
      ]
    );
  };

  const settingSections = [
    {
      title: '🔔 الإشعارات',
      items: [
        {
          id: 'notifications',
          title: 'الإشعارات العامة',
          description: 'تلقي إشعارات التطبيق',
          icon: '🔔',
          type: 'toggle' as const,
          value: notificationsEnabled,
          action: () => setNotificationsEnabled(!notificationsEnabled),
        },
        {
          id: 'budget_alerts',
          title: 'تنبيهات الميزانية',
          description: 'عند تجاوز حدود الإنفاق',
          icon: '💰',
          type: 'toggle' as const,
          value: budgetAlertsEnabled,
          action: () => setBudgetAlertsEnabled(!budgetAlertsEnabled),
        },
        {
          id: 'save_reminders',
          title: 'تذكير التوفير',
          description: 'تذكيرات يومية للتوفير',
          icon: '💾',
          type: 'toggle' as const,
          value: saveRemindersEnabled,
          action: () => setSaveRemindersEnabled(!saveRemindersEnabled),
        },
      ],
    },
    {
      title: '🔒 الأمان والخصوصية',
      items: [
        {
          id: 'biometric',
          title: 'البصمة/الوجه',
          description: 'تأمين التطبيق بالبصمة',
          icon: '👆',
          type: 'toggle' as const,
          value: biometricEnabled,
          action: () => setBiometricEnabled(!biometricEnabled),
        },
        {
          id: 'change_pin',
          title: 'تغيير رقم السر',
          description: 'تحديث رقم الأمان',
          icon: '🔐',
          type: 'navigation' as const,
          action: () => Alert.alert('قريباً', 'ميزة تغيير رقم السر قريباً'),
        },
        {
          id: 'privacy',
          title: 'سياسة الخصوصية',
          icon: '📋',
          type: 'navigation' as const,
          action: () => Alert.alert('سياسة الخصوصية', 'نحن نحترم خصوصيتك ونحافظ على أمان بياناتك'),
        },
      ],
    },
    {
      title: '⚙️ إعدادات التطبيق',
      items: [
        {
          id: 'currency',
          title: 'العملة',
          description: selectedCurrency,
          icon: '💱',
          type: 'navigation' as const,
          action: () => setShowCurrencyModal(true),
        },
        {
          id: 'language',
          title: 'اللغة',
          description: selectedLanguage,
          icon: '🌐',
          type: 'navigation' as const,
          action: () => setShowLanguageModal(true),
        },
        {
          id: 'dark_mode',
          title: 'الوضع الليلي',
          description: 'تشغيل الثيم الداكن',
          icon: '🌙',
          type: 'toggle' as const,
          value: darkModeEnabled,
          action: () => setDarkModeEnabled(!darkModeEnabled),
        },
        {
          id: 'budget_start',
          title: 'بداية دورة الميزانية',
          description: 'أول كل شهر',
          icon: '📅',
          type: 'navigation' as const,
          action: () => {},
        },
      ],
    },
    {
      title: '📊 البيانات',
      items: [
        {
          id: 'backup',
          title: 'نسخة احتياطية',
          description: 'حفظ البيانات في السحابة',
          icon: '☁️',
          type: 'action' as const,
          action: handleBackup,
        },
        {
          id: 'export',
          title: 'تصدير البيانات',
          description: 'تحميل بياناتك كملف Excel',
          icon: '📤',
          type: 'action' as const,
          action: handleExportData,
        },
        {
          id: 'sync',
          title: 'مزامنة البيانات',
          description: 'آخر مزامنة: الآن',
          icon: '🔄',
          type: 'action' as const,
          action: () => Alert.alert('تمت المزامنة', 'البيانات محدثة'),
        },
      ],
    },
    {
      title: '❓ المساعدة والدعم',
      items: [
        {
          id: 'tutorial',
          title: 'دليل الاستخدام',
          description: 'تعلم كيفية استخدام التطبيق',
          icon: '📖',
          type: 'navigation' as const,
          action: () => Alert.alert('دليل الاستخدام', 'سيتم إضافة دليل شامل قريباً'),
        },
        {
          id: 'support',
          title: 'الدعم الفني',
          description: 'تواصل معنا للمساعدة',
          icon: '💬',
          type: 'action' as const,
          action: handleContactSupport,
        },
        {
          id: 'rate',
          title: 'تقييم التطبيق',
          description: 'ساعدنا بتقييمك',
          icon: '⭐',
          type: 'action' as const,
          action: () => Alert.alert('شكراً!', 'سيتم فتح متجر التطبيقات'),
        },
        {
          id: 'feedback',
          title: 'اقتراحات',
          description: 'شاركنا أفكارك لتحسين التطبيق',
          icon: '💡',
          type: 'action' as const,
          action: () => Alert.alert('شكراً!', 'اقتراحاتك مهمة لنا. تواصل معنا عبر الدعم الفني'),
        },
      ],
    },
    {
      title: '⚠️ منطقة خطرة',
      items: [
        {
          id: 'reset_data',
          title: 'إعادة تعيين البيانات',
          description: 'حذف جميع البيانات (لا يمكن التراجع)',
          icon: '🗑️',
          type: 'action' as const,
          dangerous: true,
          action: () => {
            Alert.alert(
              'تأكيد الحذف',
              'هل تريد حذف جميع بياناتك المالية؟ هذا الإجراء لا يمكن التراجع عنه!',
              [
                { text: 'إلغاء', style: 'cancel' },
                { 
                  text: 'حذف',
                  style: 'destructive',
                  onPress: () => Alert.alert('تم الحذف', 'تم حذف جميع البيانات')
                }
              ]
            );
          },
        },
        {
          id: 'delete_account',
          title: 'حذف الحساب نهائياً',
          description: 'إلغاء الحساب وحذف جميع البيانات',
          icon: '💀',
          type: 'action' as const,
          dangerous: true,
          action: handleDeleteAccount,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        onPress={item.action}
        className={`flex-row items-center justify-between py-4 px-4 ${
          item.dangerous ? 'bg-red-50 border border-red-200' : 'bg-white'
        } rounded-xl mb-2`}
        disabled={item.type === 'info'}
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-3">{item.icon}</Text>
          <View className="flex-1">
            <Text className={`font-semibold ${
              item.dangerous ? 'text-red-600' : 'text-gray-800'
            }`}>
              {item.title}
            </Text>
            {item.description && (
              <Text className={`text-sm mt-1 ${
                item.dangerous ? 'text-red-500' : 'text-gray-500'
              }`}>
                {item.description}
              </Text>
            )}
          </View>
        </View>

        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.action}
            trackColor={{ false: '#D1D5DB', true: '#7F56D9' }}
            thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
          />
        )}

        {item.type === 'navigation' && (
          <Text className="text-gray-400 text-xl">›</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={['#7F56D9', '#9E77ED']}
        className="px-6 py-6"
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-white text-2xl">‹</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">
            ⚙️ الإعدادات
          </Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center">
            <View className="w-16 h-16 bg-purple-100 rounded-full items-center justify-center mr-4">
              <Text className="text-purple-600 text-2xl font-bold">أ</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-bold text-lg">أحمد بن علي</Text>
              <Text className="text-gray-500">ahmed@example.com</Text>
              <Text className="text-purple-600 text-sm mt-1">عضو منذ جانفي 2025</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/profile')}
              className="bg-purple-100 px-4 py-2 rounded-xl"
            >
              <Text className="text-purple-600 font-semibold">تعديل</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mb-6">
            <Text className="text-gray-700 font-bold text-lg mb-3">
              {section.title}
            </Text>
            <View className="space-y-2">
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View className="bg-gray-100 rounded-xl p-6 mb-6">
          <Text className="text-gray-600 text-center font-semibold mb-2">
            فينانزا - إدارة مالية ذكية
          </Text>
          <Text className="text-gray-500 text-center text-sm mb-1">
            الإصدار 1.0.0
          </Text>
          <Text className="text-gray-500 text-center text-sm">
            صنع بـ ❤️ في تونس
          </Text>
        </View>
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-gray-800 font-bold text-xl mb-4 text-center">
              اختر العملة
            </Text>
            
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                onPress={() => {
                  setSelectedCurrency(currency.code);
                  setShowCurrencyModal(false);
                }}
                className={`flex-row items-center justify-between py-4 px-4 rounded-xl mb-2 ${
                  selectedCurrency === currency.code ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
                }`}
              >
                <View>
                  <Text className="font-semibold text-gray-800">{currency.name}</Text>
                  <Text className="text-gray-500 text-sm">{currency.symbol}</Text>
                </View>
                {selectedCurrency === currency.code && (
                  <Text className="text-purple-600 text-xl">✓</Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowCurrencyModal(false)}
              className="bg-gray-200 py-3 rounded-xl mt-4"
            >
              <Text className="text-gray-700 font-semibold text-center">إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-gray-800 font-bold text-xl mb-4 text-center">
              اختر اللغة
            </Text>
            
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                onPress={() => {
                  setSelectedLanguage(language.name);
                  setShowLanguageModal(false);
                }}
                className={`flex-row items-center justify-between py-4 px-4 rounded-xl mb-2 ${
                  selectedLanguage === language.name ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">{language.flag}</Text>
                  <Text className="font-semibold text-gray-800">{language.name}</Text>
                </View>
                {selectedLanguage === language.name && (
                  <Text className="text-purple-600 text-xl">✓</Text>
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setShowLanguageModal(false)}
              className="bg-gray-200 py-3 rounded-xl mt-4"
            >
              <Text className="text-gray-700 font-semibold text-center">إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
