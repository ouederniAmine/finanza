import { isRTL, t } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Category {
  id: string;
  icon: string;
}

export default function AddTransactionScreen() {
  const { language } = useUIStore();
  const [transactionType, setTransactionType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const isRTLLayout = isRTL(language);

  const TRANSACTION_TYPES = useMemo(() => [
    { id: 'income', label: t('add_transaction.transaction_types.income', language), icon: '💰', color: '#10B981' },
    { id: 'expense', label: t('add_transaction.transaction_types.expense', language), icon: '💸', color: '#EF4444' },
    { id: 'savings', label: t('add_transaction.transaction_types.savings', language), icon: '🏦', color: '#3B82F6' },
    { id: 'debt_given', label: t('add_transaction.transaction_types.debt_given', language), icon: '👥', color: '#F59E0B' },
    { id: 'debt_received', label: t('add_transaction.transaction_types.debt_received', language), icon: '💳', color: '#8B5CF6' },
  ], [language]);

  const CATEGORIES: { [key: string]: Category[] } = useMemo(() => ({
    income: [
      { id: 'salary', icon: '💼' },
      { id: 'freelance', icon: '💻' },
      { id: 'business', icon: '🏪' },
      { id: 'other', icon: '💰' },
    ],
    expense: [
      { id: 'food', icon: '🍽️' },
      { id: 'transport', icon: '🚗' },
      { id: 'bills', icon: '📄' },
      { id: 'shopping', icon: '🛒' },
      { id: 'entertainment', icon: '🎮' },
      { id: 'health', icon: '🏥' },
      { id: 'education', icon: '📚' },
      { id: 'coffee', icon: '☕' },
      { id: 'other', icon: '💸' },
    ],
  }), []);

  const getCategoryName = (categoryId: string, type: string): string => {
    const prefix = type === 'income' ? 'add_transaction.categories.income' : 'add_transaction.categories.expense';
    return t(`${prefix}.${categoryId}`, language);
  };

  const getCategoriesForType = (type: string): Category[] => {
    return CATEGORIES[type] || [];
  };

  const getSelectedCategoryName = (): string => {
    if (!category) return t('add_transaction.placeholders.select_category', language);
    return getCategoryName(category, transactionType);
  };

  const validateInputs = (): string | null => {
    if (!amount || parseFloat(amount) <= 0) {
      return t('add_transaction.validation.amount_required', language);
    }
    if (!description.trim()) {
      return t('add_transaction.validation.description_required', language);
    }
    if (!category) {
      return t('add_transaction.validation.category_required', language);
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateInputs();
    if (validationError) {
      Alert.alert(t('add_transaction.validation.error_title', language), validationError);
      return;
    }

    // Add transaction logic here
    const typeLabel = TRANSACTION_TYPES.find(type => type.id === transactionType)?.label || transactionType;
    Alert.alert(
      t('add_transaction.success.title', language),
      t('add_transaction.success.message', language).replace('{type}', typeLabel),
      [{ text: t('add_transaction.success.ok', language), onPress: () => router.back() }]
    );
  };

  const selectedCategory = CATEGORIES[transactionType]?.find(cat => cat.id === category);
  const typeConfig = TRANSACTION_TYPES.find(type => type.id === transactionType);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <LinearGradient
          colors={[typeConfig?.color || '#7F56D9', '#9E77ED']}
          className="px-6 py-6"
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
            >
              <Text className="text-white text-lg">←</Text>
            </TouchableOpacity>
            
            <Text className="text-white text-xl font-bold">
              {typeConfig?.icon} {t('add_transaction.title', language)} {typeConfig?.label}
            </Text>
            
            <View className="w-10" />
          </View>
        </LinearGradient>

        <ScrollView className="flex-1 px-6 py-6">
          {/* Transaction Type Selector */}
          <View className="mb-6">
            <Text className="text-gray-700 text-lg font-semibold mb-3">
              {t('add_transaction.transaction_type', language)}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-3">
                {TRANSACTION_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => {
                      setTransactionType(type.id);
                      setCategory(''); // Reset category when type changes
                    }}
                    className={`px-4 py-3 rounded-xl mr-3 flex-row items-center ${
                      transactionType === type.id
                        ? 'bg-purple-100 border-2 border-purple-500'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <Text className="mr-2">{type.icon}</Text>
                    <Text className={`font-semibold ${
                      transactionType === type.id ? 'text-purple-700' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Amount Input */}
          <View className="mb-6">
            <Text className="text-gray-700 text-lg font-semibold mb-3">
              {t('add_transaction.amount', language)}
            </Text>
            <View className="bg-white rounded-xl border border-gray-200 p-4 flex-row items-center">
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder={t('add_transaction.placeholders.amount', language)}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                className="flex-1 text-gray-800 text-2xl font-bold"
              />
              <Text className="text-gray-600 text-xl font-semibold ml-3">TND</Text>
            </View>
          </View>

          {/* Category Selector */}
          <View className="mb-6">
            <Text className="text-gray-700 text-lg font-semibold mb-3">
              {t('add_transaction.category', language)}
            </Text>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
              className="bg-white rounded-xl border border-gray-200 p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                {selectedCategory ? (
                  <>
                    <Text className="mr-3 text-xl">{selectedCategory.icon}</Text>
                    <Text className="text-gray-800 text-lg font-medium">
                      {getCategoryName(selectedCategory.id, transactionType)}
                    </Text>
                  </>
                ) : (
                  <Text className="text-gray-400 text-lg">{getSelectedCategoryName()}</Text>
                )}
              </View>
              <Text className="text-gray-400">→</Text>
            </TouchableOpacity>
          </View>

          {/* Description Input */}
          <View className="mb-6">
            <Text className="text-gray-700 text-lg font-semibold mb-3">
              {t('add_transaction.description', language)}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={
                transactionType === 'expense' 
                  ? t('add_transaction.placeholders.expense_description', language)
                  : t('add_transaction.placeholders.income_description', language)
              }
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="bg-white rounded-xl border border-gray-200 p-4 text-gray-800 text-lg"
            />
          </View>

          {/* Date Input */}
          <View className="mb-8">
            <Text className="text-gray-700 text-lg font-semibold mb-3">
              {t('add_transaction.date', language)}
            </Text>
            <View className="bg-white rounded-xl border border-gray-200 p-4">
              <Text className="text-gray-800 text-lg">
                📅 {new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'ar-TN')}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{ backgroundColor: typeConfig?.color || '#7F56D9' }}
            className="rounded-xl py-4 items-center"
          >
            <Text className="text-white text-lg font-bold">
              {t('add_transaction.buttons.add', language)} {typeConfig?.label}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Category Selection Modal */}
        <Modal
          visible={showCategoryModal}
          animationType="slide"
          transparent={true}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6 max-h-96">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-800 text-xl font-bold">
                  {t('add_transaction.select_category', language)}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategoryModal(false)}
                  className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
                >
                  <Text className="text-gray-600">×</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView>
                <View className="flex-row flex-wrap">
                  {(CATEGORIES[transactionType] || []).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        setCategory(cat.id);
                        setShowCategoryModal(false);
                      }}
                      className={`w-1/2 p-3 mb-3 rounded-xl mr-2 ${
                        category === cat.id 
                          ? 'bg-purple-100 border-2 border-purple-500'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <View className="items-center">
                        <Text className="text-2xl mb-1">{cat.icon}</Text>
                        <Text className={`text-center font-medium ${
                          category === cat.id ? 'text-purple-700' : 'text-gray-700'
                        }`}>
                          {getCategoryName(cat.id, transactionType)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
