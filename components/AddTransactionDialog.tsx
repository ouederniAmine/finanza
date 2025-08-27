import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Category {
  id: string;
  icon: string;
  name: string;
}

interface AddTransactionDialogProps {
  visible: boolean;
  onClose: () => void;
  initialType?: string;
}

export const AddTransactionDialog: React.FC<AddTransactionDialogProps> = ({
  visible,
  onClose,
  initialType = 'expense'
}) => {
  const [transactionType, setTransactionType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const TRANSACTION_TYPES = useMemo(() => [
    { id: 'income', label: 'Income', icon: '💰', color: '#10B981' },
    { id: 'expense', label: 'Expense', icon: '💸', color: '#EF4444' },
    { id: 'savings', label: 'Savings', icon: '🏦', color: '#3B82F6' },
    { id: 'debt_given', label: 'Debt Given', icon: '👥', color: '#F59E0B' },
    { id: 'debt_received', label: 'Debt Received', icon: '💳', color: '#8B5CF6' },
  ], []);

  const CATEGORIES: { [key: string]: Category[] } = useMemo(() => ({
    income: [
      { id: 'salary', icon: '💼', name: 'Salary' },
      { id: 'freelance', icon: '💻', name: 'Freelance' },
      { id: 'business', icon: '🏪', name: 'Business' },
      { id: 'other', icon: '💰', name: 'Other' },
    ],
    expense: [
      { id: 'food', icon: '🍽️', name: 'Food' },
      { id: 'transport', icon: '🚗', name: 'Transport' },
      { id: 'bills', icon: '📄', name: 'Bills' },
      { id: 'shopping', icon: '🛒', name: 'Shopping' },
      { id: 'entertainment', icon: '🎮', name: 'Entertainment' },
      { id: 'health', icon: '🏥', name: 'Health' },
      { id: 'education', icon: '📚', name: 'Education' },
      { id: 'coffee', icon: '☕', name: 'Coffee' },
      { id: 'other', icon: '💸', name: 'Other' },
    ],
    savings: [
      { id: 'emergency', icon: '🚨', name: 'Emergency Fund' },
      { id: 'travel', icon: '✈️', name: 'Travel' },
      { id: 'car', icon: '🚗', name: 'Car' },
      { id: 'house', icon: '🏠', name: 'House' },
      { id: 'other', icon: '🏦', name: 'Other' },
    ],
    debt_given: [
      { id: 'personal', icon: '👤', name: 'Personal Loan' },
      { id: 'friend', icon: '👥', name: 'Friend/Family' },
      { id: 'business', icon: '🏢', name: 'Business' },
      { id: 'other', icon: '💰', name: 'Other' },
    ],
    debt_received: [
      { id: 'credit_card', icon: '💳', name: 'Credit Card' },
      { id: 'personal_loan', icon: '🏦', name: 'Personal Loan' },
      { id: 'mortgage', icon: '🏠', name: 'Mortgage' },
      { id: 'other', icon: '💸', name: 'Other' },
    ],
  }), []);

  const typeConfig = useMemo(() => {
    return TRANSACTION_TYPES.find(type => type.id === transactionType);
  }, [transactionType, TRANSACTION_TYPES]);

  useEffect(() => {
    if (visible) {
      setTransactionType(initialType);
    } else {
      // Reset form when modal closes
      setAmount('');
      setDescription('');
      setCategory('');
      setShowCategoryModal(false);
    }
  }, [visible, initialType]);

  const handleCategorySelect = (categoryId: string) => {
    setCategory(categoryId);
    setShowCategoryModal(false);
  };

  const getSelectedCategoryName = (): string => {
    if (!category) return 'Select category';
    const categoryObj = CATEGORIES[transactionType]?.find(cat => cat.id === category);
    return categoryObj?.name || category;
  };

  const validateInputs = (): string | null => {
    if (!amount || parseFloat(amount) <= 0) {
      return 'Please enter a valid amount';
    }
    if (!description.trim()) {
      return 'Please enter a description';
    }
    if (!category) {
      return 'Please select a category';
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateInputs();
    if (validationError) {
      Alert.alert('Error', validationError, [{ text: 'OK' }]);
      return;
    }

    // Simulate successful transaction creation
    const successMessage = transactionType === 'income' 
      ? 'Income added successfully!'
      : transactionType === 'expense'
      ? 'Expense added successfully!'
      : `${typeConfig?.label} added successfully!`;
    
    Alert.alert(
      'Success!',
      successMessage,
      [{ 
        text: 'OK',
        onPress: () => {
          onClose();
        }
      }]
    );
  };

  const getPlaceholderText = () => {
    switch (transactionType) {
      case 'income':
        return 'Monthly salary, freelance project...';
      case 'expense':
        return 'Lunch at restaurant, gas for car...';
      case 'savings':
        return 'Emergency fund contribution...';
      case 'debt_given':
        return 'Money lent to friend...';
      case 'debt_received':
        return 'Credit card payment...';
      default:
        return 'Enter description...';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              width: '100%',
              maxWidth: 400,
              maxHeight: '90%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
            }}>
              {/* Header */}
              <View style={{
                paddingHorizontal: 24,
                paddingTop: 24,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <Text style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: '#1F2937',
                  }}>
                    Add Transaction
                  </Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#F3F4F6',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 18, color: '#6B7280' }}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Content */}
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 24 }}
                keyboardShouldPersistTaps="handled"
              >
                {/* Transaction Type Selector */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 12,
                  }}>
                    Transaction Type
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 4 }}
                    style={{ marginHorizontal: -4 }}
                  >
                    {TRANSACTION_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        onPress={() => {
                          setTransactionType(type.id);
                          setCategory('');
                        }}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 12,
                          marginHorizontal: 4,
                          backgroundColor: transactionType === type.id ? type.color + '15' : '#F9FAFB',
                          borderWidth: 1.5,
                          borderColor: transactionType === type.id ? type.color : '#E5E7EB',
                          flexDirection: 'row',
                          alignItems: 'center',
                          minWidth: 110,
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 16, marginRight: 6 }}>{type.icon}</Text>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: transactionType === type.id ? type.color : '#6B7280',
                        }}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Amount Input */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 12,
                  }}>
                    Amount
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: amount ? (typeConfig?.color || '#E5E7EB') : '#E5E7EB',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                  }}>
                    <TextInput
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      style={{
                        flex: 1,
                        fontSize: 20,
                        fontWeight: '700',
                        color: typeConfig?.color || '#1F2937',
                      }}
                    />
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#6B7280',
                      marginLeft: 8,
                    }}>
                      TND
                    </Text>
                  </View>
                </View>

                {/* Category Selector */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 12,
                  }}>
                    Category
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCategoryModal(true)}
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: category ? (typeConfig?.color || '#E5E7EB') : '#E5E7EB',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text style={{
                      fontSize: 16,
                      color: category ? '#1F2937' : '#9CA3AF',
                      fontWeight: category ? '500' : '400',
                    }}>
                      {getSelectedCategoryName()}
                    </Text>
                    <Text style={{ fontSize: 16, color: '#9CA3AF' }}>›</Text>
                  </TouchableOpacity>
                </View>

                {/* Description Input */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 12,
                  }}>
                    Description
                  </Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder={getPlaceholderText()}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    style={{
                      backgroundColor: '#F9FAFB',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: description ? (typeConfig?.color || '#E5E7EB') : '#E5E7EB',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: '#1F2937',
                      textAlignVertical: 'top',
                      minHeight: 80,
                    }}
                  />
                </View>

                {/* Date Input */}
                <View style={{ marginBottom: 32 }}>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: 12,
                  }}>
                    Date
                  </Text>
                  <View style={{
                    backgroundColor: '#F9FAFB',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}>
                    <Text style={{
                      fontSize: 16,
                      color: '#1F2937',
                      fontWeight: '500',
                    }}>
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={{
                    backgroundColor: typeConfig?.color || '#7F56D9',
                    borderRadius: 12,
                    paddingVertical: 16,
                    alignItems: 'center',
                    shadowColor: typeConfig?.color || '#7F56D9',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#FFFFFF',
                  }}>
                    Add {typeConfig?.label || 'Transaction'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                width: '100%',
                maxWidth: 350,
                maxHeight: '70%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 8,
              }}>
                {/* Modal Header */}
                <View style={{
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: '#F3F4F6',
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <Text style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: '#1F2937',
                    }}>
                      Choose Category
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowCategoryModal(false)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: '#F3F4F6',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 16, color: '#6B7280' }}>×</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Categories List */}
                <ScrollView
                  style={{ flex: 1 }}
                  contentContainerStyle={{ padding: 20 }}
                  showsVerticalScrollIndicator={false}
                >
                  {(CATEGORIES[transactionType] || []).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => handleCategorySelect(cat.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        marginBottom: 8,
                        backgroundColor: category === cat.id ? (typeConfig?.color + '15' || '#F3F4F6') : 'transparent',
                        borderWidth: category === cat.id ? 1 : 0,
                        borderColor: category === cat.id ? (typeConfig?.color || '#D1D5DB') : 'transparent',
                      }}
                    >
                      <Text style={{ fontSize: 24, marginRight: 12 }}>{cat.icon}</Text>
                      <Text style={{
                        flex: 1,
                        fontSize: 16,
                        color: '#1F2937',
                        fontWeight: category === cat.id ? '600' : '400',
                      }}>
                        {cat.name}
                      </Text>
                      {category === cat.id && (
                        <View style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: typeConfig?.color || '#10B981',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Modal>
  );
};
