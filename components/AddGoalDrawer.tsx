import { getTextAlign, t } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.85;

interface AddGoalDrawerProps {
  visible: boolean;
  onClose: () => void;
  onGoalCreated?: () => void; // Add callback for when goal is created
}

interface GoalCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

const AddGoalDrawer: React.FC<AddGoalDrawerProps> = ({ visible, onClose, onGoalCreated }) => {
  const { language } = useUIStore();
  const { user } = useUser();
  const textAlign = getTextAlign(language);
  
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const GOAL_CATEGORIES: GoalCategory[] = [
    { id: 'emergency', name: t('goals.categories.emergency', language) || 'Emergency Fund', emoji: '🚨', color: '#FF6B6B' },
    { id: 'travel', name: t('goals.categories.travel', language) || 'Travel & Vacation', emoji: '✈️', color: '#4ECDC4' },
    { id: 'transport', name: t('goals.categories.transport', language) || 'Car & Transport', emoji: '🚗', color: '#45B7D1' },
    { id: 'property', name: t('goals.categories.property', language) || 'House & Property', emoji: '🏠', color: '#10B981' },
    { id: 'education', name: t('goals.categories.education', language) || 'Education & Courses', emoji: '🎓', color: '#8B5CF6' },
    { id: 'investment', name: t('goals.categories.investment', language) || 'Investment Portfolio', emoji: '📈', color: '#F59E0B' },
    { id: 'wedding', name: t('goals.categories.wedding', language) || 'Wedding & Events', emoji: '💒', color: '#EC4899' },
    { id: 'business', name: t('goals.categories.business', language) || 'Business & Startup', emoji: '💼', color: '#6B7280' },
    { id: 'technology', name: t('goals.categories.technology', language) || 'Technology & Gadgets', emoji: '📱', color: '#3B82F6' },
    { id: 'health', name: t('goals.categories.health', language) || 'Health & Fitness', emoji: '💪', color: '#EF4444' },
    { id: 'hobby', name: t('goals.categories.hobby', language) || 'Hobbies & Recreation', emoji: '🎨', color: '#F97316' },
    { id: 'other', name: t('goals.categories.other', language) || 'Other Goals', emoji: '🎯', color: '#6B7280' },
  ];
  
  const translateY = useRef(new Animated.Value(DRAWER_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAWER_HEIGHT * 0.3) {
          closeDrawer();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      openDrawer();
    } else {
      closeDrawer();
    }
  }, [visible]);

  const openDrawer = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: DRAWER_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  const resetForm = () => {
    setGoalName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setSelectedCategory(null);
    setDeadline(null);
    setShowDatePicker(false);
    setDescription('');
    setShowCategoryModal(false);
  };

  const selectCategory = (category: GoalCategory) => {
    setSelectedCategory(category);
    setShowCategoryModal(false);
  };

  const handleSaveGoal = async () => {
    if (!user?.id) {
      Alert.alert(
        t('goals.validation.error_title', language) || 'Error', 
        'User not authenticated'
      );
      return;
    }

    if (!goalName.trim()) {
      Alert.alert(
        t('goals.validation.error_title', language) || 'Validation Error', 
        t('goals.validation.goal_name_required', language) || 'Please enter a name for your goal'
      );
      return;
    }
    if (!targetAmount.trim() || parseFloat(targetAmount) <= 0) {
      Alert.alert(
        t('goals.validation.error_title', language) || 'Validation Error', 
        t('goals.validation.target_amount_required', language) || 'Please enter a valid target amount greater than 0'
      );
      return;
    }
    if (!selectedCategory) {
      Alert.alert(
        t('goals.validation.error_title', language) || 'Validation Error', 
        t('goals.validation.category_required', language) || 'Please select a category for your goal'
      );
      return;
    }

    const currentAmountValue = parseFloat(currentAmount) || 0;
    const targetAmountValue = parseFloat(targetAmount);

    if (currentAmountValue > targetAmountValue) {
      Alert.alert(
        t('goals.validation.error_title', language) || 'Validation Error', 
        t('goals.validation.current_exceeds_target', language) || 'Current amount cannot be greater than target amount'
      );
      return;
    }

    try {
      // Use the deadline date directly if provided
      let targetDate = null;
      if (deadline) {
        targetDate = deadline.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }

      const { data, error } = await supabase
        .from('savings_goals')
        .insert([
          {
            user_id: user.id,
            title_en: goalName.trim(),
            title_fr: goalName.trim(), // For now, use same name for all languages
            title_tn: goalName.trim(),
            target_amount: targetAmountValue,
            current_amount: currentAmountValue,
            target_date: targetDate,
            priority: 'medium', // Default priority
            icon: selectedCategory.emoji,
            color: selectedCategory.color,
            is_achieved: false
          }
        ]);

      if (error) {
        console.error('Error creating goal:', error);
        Alert.alert(
          t('goals.validation.error_title', language) || 'Error', 
          error.message || 'Failed to create goal'
        );
        return;
      }

      console.log('Goal created successfully:', data);

      Alert.alert(
        t('goals.success.title', language) || 'Goal Created!',
        t('goals.success.message', language) || 'Your financial goal has been created successfully. Start saving towards your dream!',
        [
          {
            text: t('common.ok', language) || 'OK',
            onPress: () => {
              resetForm();
              closeDrawer();
              if (onGoalCreated) {
                onGoalCreated(); // Notify parent component to refresh goals
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Unexpected error creating goal:', error);
      Alert.alert(
        t('goals.validation.error_title', language) || 'Error', 
        'An unexpected error occurred. Please try again.'
      );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity style={styles.backdropTouch} onPress={closeDrawer} />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateY }],
              height: DRAWER_HEIGHT,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle */}
          <View style={styles.handle} />
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { textAlign }]}>
              {t('goals.drawer.title', language) || 'Create New Goal'}
            </Text>
            <TouchableOpacity onPress={handleSaveGoal} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>{t('goals.drawer.save', language) || 'Save Goal'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Welcome Message */}
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeTitle, { textAlign }]}>
                {t('goals.drawer.welcome_title', language) || '🎯 Set Your Financial Goal'}
              </Text>
              <Text style={[styles.welcomeText, { textAlign }]}>
                {t('goals.drawer.welcome_text', language) || 'Every big achievement starts with a clear goal. Let\'s create yours!'}
              </Text>
            </View>

            {/* Goal Name */}
            <View style={styles.section}>
              <Text style={[styles.label, { textAlign }]}>
                {t('goals.drawer.goal_name', language) || 'What\'s your goal?'} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { textAlign }]}
                value={goalName}
                onChangeText={setGoalName}
                placeholder={t('goals.drawer.goal_name_placeholder', language) || 'e.g., Dream vacation to Japan'}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Category Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { textAlign }]}>
                {t('goals.drawer.category', language) || 'Choose a category'} <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => setShowCategoryModal(true)}
              >
                {selectedCategory ? (
                  <View style={styles.selectedCategory}>
                    <View style={[styles.categoryIcon, { backgroundColor: `${selectedCategory.color}20` }]}>
                      <Text style={styles.categoryEmoji}>{selectedCategory.emoji}</Text>
                    </View>
                    <Text style={styles.categoryName}>{selectedCategory.name}</Text>
                  </View>
                ) : (
                  <Text style={styles.categoryPlaceholder}>
                    {t('goals.drawer.select_category', language) || 'Tap to select category'}
                  </Text>
                )}
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Target Amount */}
            <View style={styles.section}>
              <Text style={[styles.label, { textAlign }]}>
                {t('goals.drawer.target_amount', language) || 'How much do you need?'} <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>TND</Text>
                <TextInput
                  style={[styles.amountInput, { textAlign: 'right' }]}
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Current Amount */}
            <View style={styles.section}>
              <Text style={[styles.label, { textAlign }]}>
                {t('goals.drawer.current_amount', language) || 'How much do you have already?'}
              </Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>TND</Text>
                <TextInput
                  style={[styles.amountInput, { textAlign: 'right' }]}
                  value={currentAmount}
                  onChangeText={setCurrentAmount}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Deadline */}
            <View style={styles.section}>
              <Text style={[styles.label, { textAlign }]}>
                {t('goals.drawer.deadline', language) || 'When do you want to achieve this?'}
              </Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[styles.datePickerText, deadline && styles.datePickerTextSelected]}>
                  {deadline 
                    ? deadline.toLocaleDateString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'ar-TN')
                    : t('goals.drawer.deadline_placeholder', language) || 'Select target date'
                  }
                </Text>
                <Text style={styles.chevron}>📅</Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={deadline || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setDeadline(selectedDate);
                    }
                  }}
                />
              )}
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.label, { textAlign }]}>
                {t('goals.drawer.description', language) || 'Tell us more about your goal'}
              </Text>
              <TextInput
                style={[styles.textArea, { textAlign }]}
                value={description}
                onChangeText={setDescription}
                placeholder={t('goals.drawer.description_placeholder', language) || 'Why is this goal important to you? What will achieving it mean?'}
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Motivation Section */}
            <View style={styles.motivationSection}>
              <Text style={[styles.motivationTitle, { textAlign }]}>
                {t('goals.drawer.motivation_title', language) || '💡 Pro Tip'}
              </Text>
              <Text style={[styles.motivationText, { textAlign }]}>
                {t('goals.drawer.motivation_text', language) || 'Set specific, measurable goals with realistic deadlines. Break larger goals into smaller milestones to stay motivated!'}
              </Text>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>

        {/* Category Selection Modal */}
        <Modal visible={showCategoryModal} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.categoryModal}>
              <View style={styles.categoryModalHeader}>
                <Text style={[styles.categoryModalTitle, { textAlign }]}>
                  {t('goals.choose_category', language) || 'Choose Category'}
                </Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                  <Text style={styles.categoryModalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.categoryList}>
                {GOAL_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryItem}
                    onPress={() => selectCategory(category)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    </View>
                    <Text style={styles.categoryItemName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#667EEA',
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  categoryPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  // Category Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  categoryModalClose: {
    fontSize: 18,
    color: '#6B7280',
    width: 24,
    textAlign: 'center',
  },
  categoryList: {
    padding: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  categoryItemName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  // Welcome Section Styles
  welcomeSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  // Form Enhancement Styles
  required: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
  },
  // Motivation Section Styles
  motivationSection: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  motivationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  datePickerText: {
    fontSize: 16,
    color: '#9CA3AF',
    flex: 1,
  },
  datePickerTextSelected: {
    color: '#1F2937',
  },
});

export default AddGoalDrawer;
