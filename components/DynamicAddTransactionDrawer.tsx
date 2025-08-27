// components/DynamicAddTransactionDrawer.tsx
import { isRTL, t } from '@/lib/i18n';
import { CategoryService } from '@/lib/services/category.service';
import { TransactionService } from '@/lib/services/transaction.service';
import { useUIStore } from '@/lib/store';
import type { Category } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

interface DynamicAddTransactionDrawerProps {
  visible: boolean;
  onClose: () => void;
  initialType?: string;
  onTransactionCreated?: () => void;
}

export const DynamicAddTransactionDrawer: React.FC<DynamicAddTransactionDrawerProps> = ({
  visible,
  onClose,
  initialType = 'expense',
  onTransactionCreated
}) => {
  const { language } = useUIStore();
  const { user } = useUser();
  const [transactionType, setTransactionType] = useState<'income' | 'expense' | 'transfer'>(initialType as 'income' | 'expense' | 'transfer');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Helper function to get category name based on language
  const getCategoryName = (category: Category) => {
    switch (language) {
      case 'tn':
        return category.name_tn;
      case 'fr':
        return category.name_fr || category.name_en || category.name_tn;
      case 'en':
      default:
        return category.name_en || category.name_tn;
    }
  };

  const isRTLLayout = isRTL(language);

  const TRANSACTION_TYPES = useMemo(() => [
    { id: 'income', label: t('add_transaction.transaction_types.income', language), icon: '💰', color: '#10B981' },
    { id: 'expense', label: t('add_transaction.transaction_types.expense', language), icon: '💸', color: '#EF4444' },
    { id: 'transfer', label: t('add_transaction.transaction_types.transfer', language), icon: '�', color: '#3B82F6' },
  ], [language]);

  // Animation values for drawer and backdrop
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const backdropAnim = React.useRef(new Animated.Value(0)).current;

  // Load categories when component mounts or transaction type changes
  useEffect(() => {
    if (visible && user?.id) {
      loadCategories();
    }
  }, [visible, transactionType, user?.id]);

  useEffect(() => {
    if (visible) {
      setTransactionType(initialType as 'income' | 'expense' | 'transfer');
      openDrawer();
    } else {
      closeDrawer();
    }
  }, [visible, initialType]);

  const loadCategories = async () => {
    if (!user?.id) return;
    
    try {
      const categoryType = transactionType === 'income' ? 'income' : 'expense';
      const userCategories = await CategoryService.getUserCategories(user.id, categoryType);
      setCategories(userCategories);
      
      // Reset selected category when changing types
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const openDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!visible) {
        // Reset form when fully closed
        setAmount('');
        setDescription('');
        setSelectedCategory(null);
        setShowCategoryModal(false);
      }
    });
  };

  const validateInputs = (): string | null => {
    if (!amount || parseFloat(amount) <= 0) {
      return t('add_transaction.validation.amount_required', language);
    }
    if (!description.trim()) {
      return t('add_transaction.validation.description_required', language);
    }
    if (!selectedCategory) {
      return t('add_transaction.validation.category_required', language);
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!user?.id || !selectedCategory) return;

    const validationError = validateInputs();
    if (validationError) {
      Alert.alert(t('add_transaction.validation.error_title', language), validationError);
      return;
    }

    setLoading(true);
    try {
      await TransactionService.createTransaction({
        userId: user.id,
        categoryId: selectedCategory.id,
        type: transactionType,
        amount: parseFloat(amount),
        description_tn: description,
        description_en: description,
        transactionDate: new Date(date).toISOString(),
      });

      const typeLabel = TRANSACTION_TYPES.find(type => type.id === transactionType)?.label || transactionType;
      Alert.alert(
        t('add_transaction.success.title', language),
        t('add_transaction.success.message', language).replace('{type}', typeLabel),
        [{ 
          text: t('add_transaction.success.ok', language), 
          onPress: () => {
            onClose();
            onTransactionCreated?.();
            // Reset form
            setAmount('');
            setDescription('');
            setSelectedCategory(null);
          }
        }]
      );
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert(
        t('add_transaction.validation.error_title', language),
        'Failed to create transaction. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const typeConfig = TRANSACTION_TYPES.find(type => type.id === transactionType);

  const handleBackdropPress = () => {
    onClose();
  };

  const handlePanGesture = (event: any) => {
    const { translationY, velocityY } = event.nativeEvent;
    
    // Close if dragged down significantly or with enough velocity
    if (translationY > 150 || (translationY > 50 && velocityY > 500)) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View 
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              opacity: backdropAnim,
            }}
          />
        </TouchableWithoutFeedback>

        <PanGestureHandler onGestureEvent={handlePanGesture}>
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: height * 0.92,
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              transform: [{ translateY: slideAnim }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -8 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            {/* Drag Handle */}
            <View className="items-center py-4">
              <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </View>

            {/* Header */}
            <LinearGradient
              colors={[typeConfig?.color || '#7F56D9', '#9E77ED']}
              className="mx-6 rounded-3xl mb-6"
            >
              <View className="px-6 py-6">
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity
                    onPress={onClose}
                    className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center"
                  >
                    <Text className="text-white text-xl font-bold">×</Text>
                  </TouchableOpacity>
                  
                  <View className="flex-1 items-center">
                    <Text className="text-white text-2xl font-bold">
                      {typeConfig?.icon} {t('add_transaction.title', language)}
                    </Text>
                    <Text className="text-white/80 text-lg font-medium">
                      {typeConfig?.label}
                    </Text>
                  </View>
                  
                  <View className="w-12" />
                </View>
              </View>
            </LinearGradient>

            <ScrollView 
              className="flex-1 px-6" 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Transaction Type Selector */}
              <View style={{ marginBottom: 32 }}>
                <Text style={{
                  color: '#1F2937',
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 16,
                  textAlign: isRTLLayout ? 'right' : 'left',
                }}>
                  {t('add_transaction.transaction_type', language)}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row space-x-3">
                    {TRANSACTION_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        onPress={() => {
                          setTransactionType(type.id as 'income' | 'expense' | 'transfer');
                          setSelectedCategory(null);
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
              <View className="mb-8">
                <Text className="text-gray-800 text-lg font-bold mb-4">
                  {t('add_transaction.amount', language)}
                </Text>
                <View className="bg-white rounded-2xl border border-gray-200 p-6 flex-row items-center">
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder={t('add_transaction.placeholders.amount', language)}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    className="flex-1 text-gray-800 text-3xl font-bold"
                  />
                  <Text className="text-gray-600 text-2xl font-bold ml-4">TND</Text>
                </View>
              </View>

              {/* Category Selector */}
              <View className="mb-8">
                <Text className="text-gray-800 text-lg font-bold mb-4">
                  {t('add_transaction.category', language)}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCategoryModal(true)}
                  className="bg-white rounded-2xl border border-gray-200 p-6 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center">
                    {selectedCategory ? (
                      <>
                        <Text className="mr-4 text-2xl">{selectedCategory.icon}</Text>
                        <Text className="text-gray-800 text-lg font-semibold">
                          {getCategoryName(selectedCategory)}
                        </Text>
                      </>
                    ) : (
                      <Text className="text-gray-400 text-lg font-medium">
                        {t('add_transaction.placeholders.select_category', language)}
                      </Text>
                    )}
                  </View>
                  <Text className="text-gray-400 text-xl">→</Text>
                </TouchableOpacity>
              </View>

              {/* Description Input */}
              <View className="mb-8">
                <Text className="text-gray-800 text-lg font-bold mb-4">
                  {t('add_transaction.description', language)}
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t('add_transaction.placeholders.expense_description', language)}
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-white rounded-2xl border border-gray-200 p-6 text-gray-800 text-lg"
                  style={{ minHeight: 100 }}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={{ 
                  backgroundColor: typeConfig?.color || '#7F56D9',
                  opacity: loading ? 0.7 : 1,
                }}
                className="rounded-2xl py-5 items-center mb-8"
              >
                <Text className="text-white text-xl font-bold">
                  {loading 
                    ? t('messages.loading', language)
                    : `${t('add_transaction.buttons.add', language)} ${typeConfig?.label}`
                  }
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
                <View className="bg-white rounded-t-3xl p-6 max-h-[500px]">
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-gray-800 text-2xl font-bold">
                      {t('add_transaction.select_category', language)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowCategoryModal(false)}
                      className="w-10 h-10 bg-gray-100 rounded-2xl items-center justify-center"
                    >
                      <Text className="text-gray-600 text-xl font-bold">×</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="flex-row flex-wrap -m-2">
                      {categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          onPress={() => {
                            setSelectedCategory(category);
                            setShowCategoryModal(false);
                          }}
                          className={`w-1/3 p-4 m-2 rounded-2xl ${
                            selectedCategory?.id === category.id 
                              ? 'bg-purple-50 border-2 border-purple-400' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <View className="items-center">
                            <Text className="text-3xl mb-2">{category.icon}</Text>
                            <Text className={`text-center font-semibold text-sm ${
                              selectedCategory?.id === category.id ? 'text-purple-700' : 'text-gray-700'
                            }`}>
                              {getCategoryName(category)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </Modal>
  );
};
