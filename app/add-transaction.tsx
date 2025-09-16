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

  // Kawaii color palette
  const TRANSACTION_TYPES = useMemo(() => [
    { id: 'income', label: t('add_transaction.transaction_types.income', language), icon: '💰', color: '#A1887F' },
    { id: 'expense', label: t('add_transaction.transaction_types.expense', language), icon: '💸', color: '#8D6E63' },
    { id: 'savings', label: t('add_transaction.transaction_types.savings', language), icon: '🏦', color: '#A1887F' },
    { id: 'debt_given', label: t('add_transaction.transaction_types.debt_given', language), icon: '👥', color: '#8D6E63' },
    { id: 'debt_received', label: t('add_transaction.transaction_types.debt_received', language), icon: '💳', color: '#A1887F' },
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5EBE0' }}>
      <View className="flex-1">
        {/* Header with Kawaii colors */}
        <View className="px-6 py-6" style={{ backgroundColor: typeConfig?.color || '#A1887F' }}>
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
            >
              <Text className="text-white text-lg">←</Text>
            </TouchableOpacity>
            
            <Text className="text-white text-xl font-bold">
              {typeConfig?.icon} {t('add_transaction.title', language)} {typeConfig?.label}
            </Text>
            
            <View className="w-10" />
          </View>
        </View>

        <ScrollView className="flex-1 px-6 py-6">
          {/* Transaction Type Selector */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: '#5D4037' }}>
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
                    className="px-4 py-3 rounded-xl mr-3 flex-row items-center"
                    style={{
                      backgroundColor: transactionType === type.id ? '#EFEBE9' : '#FEFBF6',
                      borderWidth: 2,
                      borderColor: transactionType === type.id ? '#8D6E63' : '#E8E2DD'
                    }}
                  >
                    <Text className="mr-2">{type.icon}</Text>
                    <Text className="font-semibold" style={{ 
                      color: transactionType === type.id ? '#5D4037' : '#A1887F' 
                    }}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Amount Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: '#5D4037' }}>
              {t('add_transaction.amount', language)}
            </Text>
            <View className="rounded-xl p-4 flex-row items-center" style={{ 
              backgroundColor: '#FEFBF6', 
              borderWidth: 1, 
              borderColor: '#E8E2DD' 
            }}>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder={t('add_transaction.placeholders.amount', language)}
                placeholderTextColor="#A1887F"
                keyboardType="numeric"
                className="flex-1 text-2xl font-bold"
                style={{ color: '#5D4037' }}
              />
              <Text className="text-xl font-semibold ml-3" style={{ color: '#8D6E63' }}>TND</Text>
            </View>
          </View>

          {/* Category Selector */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: '#5D4037' }}>
              {t('add_transaction.category', language)}
            </Text>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
              className="rounded-xl p-4 flex-row items-center justify-between"
              style={{ 
                backgroundColor: '#FEFBF6', 
                borderWidth: 1, 
                borderColor: '#E8E2DD' 
              }}
            >
              <View className="flex-row items-center">
                {selectedCategory ? (
                  <>
                    <Text className="mr-3 text-xl">{selectedCategory.icon}</Text>
                    <Text className="text-lg font-medium" style={{ color: '#5D4037' }}>
                      {getCategoryName(selectedCategory.id, transactionType)}
                    </Text>
                  </>
                ) : (
                  <Text className="text-lg" style={{ color: '#A1887F' }}>{getSelectedCategoryName()}</Text>
                )}
              </View>
              <Text style={{ color: '#A1887F' }}>→</Text>
            </TouchableOpacity>
          </View>

          {/* Description Input */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3" style={{ color: '#5D4037' }}>
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
              placeholderTextColor="#A1887F"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="rounded-xl p-4 text-lg"
              style={{ 
                backgroundColor: '#FEFBF6', 
                borderWidth: 1, 
                borderColor: '#E8E2DD',
                color: '#5D4037'
              }}
            />
          </View>

          {/* Date Input */}
          <View className="mb-8">
            <Text className="text-lg font-semibold mb-3" style={{ color: '#5D4037' }}>
              {t('add_transaction.date', language)}
            </Text>
            <View className="rounded-xl p-4" style={{ 
              backgroundColor: '#FEFBF6', 
              borderWidth: 1, 
              borderColor: '#E8E2DD' 
            }}>
              <Text className="text-lg" style={{ color: '#5D4037' }}>
                📅 {new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'ar-TN')}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{ backgroundColor: typeConfig?.color || '#A1887F' }}
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
          <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View className="rounded-t-3xl p-6 max-h-96" style={{ backgroundColor: '#FEFBF6' }}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold" style={{ color: '#5D4037' }}>
                  {t('add_transaction.select_category', language)}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategoryModal(false)}
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#E8E2DD' }}
                >
                  <Text style={{ color: '#8D6E63' }}>×</Text>
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
                      className="w-1/2 p-3 mb-3 rounded-xl mr-2"
                      style={{
                        backgroundColor: category === cat.id ? '#EFEBE9' : '#F5EBE0',
                        borderWidth: 2,
                        borderColor: category === cat.id ? '#8D6E63' : '#E8E2DD'
                      }}
                    >
                      <View className="items-center">
                        <Text className="text-2xl mb-1">{cat.icon}</Text>
                        <Text className="text-center font-medium" style={{
                          color: category === cat.id ? '#5D4037' : '#A1887F'
                        }}>
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
