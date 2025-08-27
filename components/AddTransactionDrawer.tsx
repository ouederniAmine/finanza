import { isRTL, t } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

interface Category {
  id: string;
  icon: string;
}

interface AddTransactionDrawerProps {
  visible: boolean;
  onClose: () => void;
  initialType?: string;
}

export const AddTransactionDrawer: React.FC<AddTransactionDrawerProps> = ({
  visible,
  onClose,
  initialType = 'expense'
}) => {
  const { language } = useUIStore();
  const [transactionType, setTransactionType] = useState(initialType);
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

  // Animation values for drawer and backdrop
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const backdropAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setTransactionType(initialType);
      openDrawer();
    } else {
      closeDrawer();
    }
  }, [visible, initialType]);

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
        setCategory('');
        setShowCategoryModal(false);
      }
    });
  };

  const getCategoryName = (categoryId: string, type: string): string => {
    const prefix = type === 'income' ? 'add_transaction.categories.income' : 'add_transaction.categories.expense';
    return t(`${prefix}.${categoryId}`, language);
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

    const typeLabel = TRANSACTION_TYPES.find(type => type.id === transactionType)?.label || transactionType;
    Alert.alert(
      t('add_transaction.success.title', language),
      t('add_transaction.success.message', language).replace('{type}', typeLabel),
      [{ 
        text: t('add_transaction.success.ok', language), 
        onPress: () => {
          onClose();
          // Reset form
          setAmount('');
          setDescription('');
          setCategory('');
        }
      }]
    );
  };

  const selectedCategory = CATEGORIES[transactionType]?.find(cat => cat.id === category);
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
              style={{
                shadowColor: typeConfig?.color || '#7F56D9',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="px-6 py-6">
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity
                    onPress={onClose}
                    className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    }}
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
              nestedScrollEnabled={true}
              scrollEventThrottle={16}
              directionalLockEnabled={false}
              style={{ backgroundColor: '#FFFFFF' }}
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
                <View style={{ height: 60 }}>
                  <FlatList
                    data={TRANSACTION_TYPES}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    decelerationRate="fast"
                    snapToInterval={150}
                    snapToAlignment="center"
                    bounces={true}
                    scrollEventThrottle={16}
                    nestedScrollEnabled={true}
                    contentContainerStyle={{
                      paddingHorizontal: 16,
                      alignItems: 'center',
                    }}
                    style={{
                      flexGrow: 0,
                      height: 60,
                    }}
                    renderItem={({
                      item: type,
                      index,
                    }: {
                      item: {
                        id: string;
                        label: string;
                        icon: string;
                        color: string;
                      };
                      index: number;
                    }) => (
                      <TouchableOpacity
                        key={type.id}
                        onPress={() => {
                          setTransactionType(type.id);
                          setCategory('');
                        }}
                        style={{
                          paddingHorizontal: 18,
                          paddingVertical: 12,
                          borderRadius: 16,
                          marginRight: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: transactionType === type.id ? '#F8FAFC' : '#FFFFFF',
                          borderWidth: transactionType === type.id ? 2 : 1,
                          borderColor: transactionType === type.id ? type.color : '#E5E7EB',
                          shadowColor: transactionType === type.id ? type.color : '#000',
                          shadowOffset: { width: 0, height: transactionType === type.id ? 4 : 2 },
                          shadowOpacity: transactionType === type.id ? 0.25 : 0.08,
                          shadowRadius: transactionType === type.id ? 8 : 4,
                          elevation: transactionType === type.id ? 6 : 2,
                          minWidth: 134,
                          justifyContent: 'center',
                          transform: transactionType === type.id ? [{ scale: 1.05 }] : [{ scale: 1 }],
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={{ 
                          marginRight: isRTLLayout ? 0 : 8,
                          marginLeft: isRTLLayout ? 8 : 0,
                          fontSize: 18 
                        }}>
                          {type.icon}
                        </Text>
                        <Text style={{
                          fontWeight: '600',
                          fontSize: 14,
                          color: transactionType === type.id ? type.color : '#374151',
                          textAlign: 'center',
                          flexShrink: 1,
                        }}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </View>

              {/* Amount Input */}
              <View className="mb-8">
                <Text className="text-gray-800 text-lg font-bold mb-4">
                  {t('add_transaction.amount', language)}
                </Text>
                <View 
                  className="bg-white rounded-2xl border border-gray-200 p-6 flex-row items-center"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
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
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row items-center">
                    {selectedCategory ? (
                      <>
                        <Text className="mr-4 text-2xl">{selectedCategory.icon}</Text>
                        <Text className="text-gray-800 text-lg font-semibold">
                          {getCategoryName(selectedCategory.id, transactionType)}
                        </Text>
                      </>
                    ) : (
                      <Text className="text-gray-400 text-lg font-medium">{getSelectedCategoryName()}</Text>
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
                  placeholder={
                    transactionType === 'expense' 
                      ? t('add_transaction.placeholders.expense_description', language)
                      : t('add_transaction.placeholders.income_description', language)
                  }
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="bg-white rounded-2xl border border-gray-200 p-6 text-gray-800 text-lg"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                    minHeight: 100,
                  }}
                />
              </View>

              {/* Date Input */}
              <View className="mb-10">
                <Text className="text-gray-800 text-lg font-bold mb-4">
                  {t('add_transaction.date', language)}
                </Text>
                <View 
                  className="bg-white rounded-2xl border border-gray-200 p-6"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <Text className="text-gray-800 text-lg font-semibold">
                    📅 {new Date(date).toLocaleDateString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'ar-TN')}
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                style={{ 
                  backgroundColor: typeConfig?.color || '#7F56D9',
                  shadowColor: typeConfig?.color || '#7F56D9',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
                className="rounded-2xl py-5 items-center mb-8"
              >
                <View className="flex-row items-center">
                  <Text className="text-white text-xl font-bold mr-2">
                    {t('add_transaction.buttons.add', language)}
                  </Text>
                  <Text className="text-white text-xl font-bold">
                    {typeConfig?.label}
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Category Selection Modal */}
            <Modal
              visible={showCategoryModal}
              animationType="slide"
              transparent={true}
            >
              <View className="flex-1 bg-black/50 justify-end">
                <View 
                  className="bg-white rounded-t-3xl p-6 max-h-[500px]"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -8 },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                    elevation: 20,
                  }}
                >
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
                      {(CATEGORIES[transactionType] || []).map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => {
                            setCategory(cat.id);
                            setShowCategoryModal(false);
                          }}
                          className={`w-1/3 p-4 m-2 rounded-2xl ${
                            category === cat.id 
                              ? 'bg-purple-50 border-2 border-purple-400' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                          style={{
                            shadowColor: category === cat.id ? '#8B5CF6' : '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: category === cat.id ? 0.15 : 0.05,
                            shadowRadius: 4,
                            elevation: 2,
                          }}
                        >
                          <View className="items-center">
                            <Text className="text-3xl mb-2">{cat.icon}</Text>
                            <Text className={`text-center font-semibold text-sm ${
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
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </Modal>
  );
};
