import { formatCurrency, getCurrency, getTextAlign, t } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import type { Reminder, Transaction as SupabaseTransaction } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Extend the SupabaseTransaction to match our component's expected structure
interface Transaction extends SupabaseTransaction {
  icon?: string;
  time?: string;
  category_name?: string;
}

// Fallback translations for calendar
const fallbackTranslations = {
  calendar: {
    title: {
      tn: 'الروزنامة',
      en: 'Calendar', 
      fr: 'Calendrier',
      ar: 'التقويم'
    },
    months: {
      january: { tn: 'جانفي', en: 'January', fr: 'Janvier', ar: 'يناير' },
      february: { tn: 'فيفري', en: 'February', fr: 'Février', ar: 'فبراير' },
      march: { tn: 'مارس', en: 'March', fr: 'Mars', ar: 'مارس' },
      april: { tn: 'أفريل', en: 'April', fr: 'Avril', ar: 'أبريل' },
      may: { tn: 'ماي', en: 'May', fr: 'Mai', ar: 'مايو' },
      june: { tn: 'جوان', en: 'June', fr: 'Juin', ar: 'يونيو' },
      july: { tn: 'جويلية', en: 'July', fr: 'Juillet', ar: 'يوليو' },
      august: { tn: 'أوت', en: 'August', fr: 'Août', ar: 'أغسطس' },
      september: { tn: 'سبتمبر', en: 'September', fr: 'Septembre', ar: 'سبتمبر' },
      october: { tn: 'أكتوبر', en: 'October', fr: 'Octobre', ar: 'أكتوبر' },
      november: { tn: 'نوفمبر', en: 'November', fr: 'Novembre', ar: 'نوفمبر' },
      december: { tn: 'ديسمبر', en: 'December', fr: 'Décembre', ar: 'ديسمبر' }
    },
    weekdays: {
      sunday: { tn: 'الأحد', en: 'Sunday', fr: 'Dimanche', ar: 'الأحد' },
      monday: { tn: 'الإثنين', en: 'Monday', fr: 'Lundi', ar: 'الاثنين' },
      tuesday: { tn: 'الثلاثاء', en: 'Tuesday', fr: 'Mardi', ar: 'الثلاثاء' },
      wednesday: { tn: 'الأربعاء', en: 'Wednesday', fr: 'Mercredi', ar: 'الأربعاء' },
      thursday: { tn: 'الخميس', en: 'Thursday', fr: 'Jeudi', ar: 'الخميس' },
      friday: { tn: 'الجمعة', en: 'Friday', fr: 'Vendredi', ar: 'الجمعة' },
      saturday: { tn: 'السبت', en: 'Saturday', fr: 'Samedi', ar: 'السبت' }
    },
    labels: {
      transactions: { tn: 'المعاملات', en: 'Transactions', fr: 'Transactions', ar: 'المعاملات' },
      reminders: { tn: 'التذكيرات', en: 'Reminders', fr: 'Rappels', ar: 'التذكيرات' }
    },
    messages: {
      no_events: { tn: 'لا توجد أحداث في هذا التاريخ', en: 'No events for this date', fr: 'Aucun événement pour cette date', ar: 'لا توجد أحداث لهذا التاريخ' },
      add_reminder_title: { tn: 'إضافة تذكير', en: 'Add Reminder', fr: 'Ajouter un rappel', ar: 'إضافة تذكير' },
      add_reminder_prompt: { tn: 'إضافة تذكير لـ {date}:', en: 'Add reminder for {date}:', fr: 'Ajouter un rappel pour {date}:', ar: 'إضافة تذكير لـ {date}:' },
      remove_reminder_title: { tn: 'حذف التذكير', en: 'Remove Reminder', fr: 'Supprimer le rappel', ar: 'إزالة التذكير' },
      remove_reminder_message: { tn: 'هل أنت متأكد من حذف هذا التذكير؟', en: 'Are you sure you want to remove this reminder?', fr: 'Êtes-vous sûr de vouloir supprimer ce rappel?', ar: 'هل أنت متأكد من أنك تريد إزالة هذا التذكير؟' },
      cancel: { tn: 'إلغاء', en: 'Cancel', fr: 'Annuler', ar: 'إلغاء' },
      remove: { tn: 'حذف', en: 'Remove', fr: 'Supprimer', ar: 'إزالة' }
    },
    buttons: {
      add_reminder: { tn: 'إضافة تذكير', en: 'Add Reminder', fr: 'Ajouter un rappel', ar: 'إضافة تذكير' }
    }
  }
};

// Helper function to get fallback translation
const getFallbackTranslation = (key: string, language: string): string => {
  const keys = key.split('.');
  let current: any = fallbackTranslations;
  
  for (const k of keys) {
    current = current?.[k];
    if (!current) break;
  }
  
  return current?.[language] || current?.en || key;
};

export default function CalendarScreen() {
  const { language } = useUIStore();
  const { user: clerkUser } = useUser();
  const textAlign = getTextAlign(language);
  const currency = getCurrency(language);
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [selectedView, setSelectedView] = useState<'month' | 'week'>('month');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');

  // Load transactions data
  const loadTransactions = async () => {
    if (!clerkUser?.id) return;
    
    setLoading(true);
    try {
      console.log('🔄 Loading transactions for user:', clerkUser.id);
      
      // Direct Supabase query instead of using TransactionService
      const { data: userTransactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', clerkUser.id)
        .order('transaction_date', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Error loading transactions:', error);
        setTransactions([]);
        return;
      }
      
      // Transform transactions to include additional fields needed by the component
      const transformedTransactions = (userTransactions || []).map((transaction: SupabaseTransaction) => ({
        ...transaction,
        // Map transaction_date to date for compatibility
        date: transaction.transaction_date.split('T')[0],
        // Generate display description based on language
        description: getTransactionDescription(transaction),
        // Generate icon based on category or type
        icon: getTransactionIcon(transaction),
        // Generate time from transaction_date
        time: formatTransactionTime(transaction.transaction_date),
        // Get category name
        category_name: transaction.category?.name_en || 'Uncategorized'
      }));
      
      setTransactions(transformedTransactions);
      console.log('✅ Loaded', transformedTransactions.length, 'transactions');
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load reminders from Supabase
  const loadReminders = async () => {
    if (!clerkUser?.id) return;

    try {
      console.log('🔄 Loading reminders for user:', clerkUser.id);
      
      const { data: userReminders, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', clerkUser.id)
        .order('reminder_date', { ascending: true });

      if (error) {
        console.error('❌ Error loading reminders:', error);
        setReminders([]);
        return;
      }

      setReminders(userReminders || []);
      console.log('✅ Loaded', (userReminders || []).length, 'reminders');
    } catch (error) {
      console.error('❌ Error loading reminders:', error);
      setReminders([]);
    }
  };

  // Load data when component mounts or user changes
  useFocusEffect(
    useCallback(() => {
      if (clerkUser?.id) {
        loadTransactions();
        loadReminders();
      }
    }, [clerkUser?.id])
  );

  // Helper functions for transaction transformation
  const getTransactionDescription = (transaction: SupabaseTransaction): string => {
    switch (language) {
      case 'tn':
        return transaction.description_tn || transaction.description_ar || transaction.description_en || 'معاملة';
      case 'fr':
        return transaction.description_fr || transaction.description_en || 'Transaction';
      default:
        return transaction.description_en || transaction.description_tn || 'Transaction';
    }
  };

  const getTransactionIcon = (transaction: SupabaseTransaction): string => {
    // Get icon based on category first, then type
    if (transaction.category?.icon) {
      return transaction.category.icon;
    }
    
    // Fallback icons based on type
    switch (transaction.type) {
      case 'income':
        return '💰';
      case 'expense':
        return '💸';
      case 'transfer':
        return '🔄';
      default:
        return '📝';
    }
  };

  const formatTransactionTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isFuture = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date >= today;
  };

  const getTransactionsForDate = (date: Date): Transaction[] => {
    const dateStr = formatDateString(date);
    return transactions.filter(transaction => {
      // Use the transformed date field we added
      return (transaction as any).date === dateStr;
    });
  };

  const getRemindersForDate = (date: Date): Reminder[] => {
    const dateStr = formatDateString(date);
    return reminders.filter(reminder => reminder.reminder_date === dateStr);
  };

  const handleDatePress = (date: Date) => {
    setSelectedDate(date);
    if (isFuture(selectedDate)) {
      router.push('/(tabs)/add-transaction');
    } else {
      router.push('/(tabs)/add-transaction');
    }
  };

  const handleAddReminder = async () => {
    console.log('🎯 Add reminder button pressed');
    
    if (!clerkUser?.id) {
      console.error('❌ No user ID available');
      Alert.alert(
        t('calendar.messages.error_title', language) || getFallbackTranslation('calendar.messages.error_title', language) || 'Error',
        t('calendar.messages.sign_in_required', language) || getFallbackTranslation('calendar.messages.sign_in_required', language) || 'Please sign in to add reminders.'
      );
      return;
    }

    console.log('✅ User ID available:', clerkUser.id);
    console.log('✅ Selected date:', selectedDate);

    // Open modal instead of using Alert.prompt
    setShowReminderModal(true);
  };

  const handleConfirmAddReminder = async () => {
    if (!clerkUser?.id || !reminderTitle.trim()) {
      console.log('❌ No user ID or empty title');
      return;
    }

    try {
      const newReminderData = {
        user_id: clerkUser.id,
        title: reminderTitle.trim(),
        description: `${t('calendar.messages.reminder_for', language) || getFallbackTranslation('calendar.messages.reminder_for', language) || 'Reminder for'} ${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`,
        reminder_date: formatDateString(selectedDate),
        is_completed: false
      };

      console.log('📤 Sending reminder data:', newReminderData);

      const { data: newReminder, error } = await supabase
        .from('reminders')
        .insert(newReminderData)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error creating reminder:', error);
        Alert.alert(
          t('calendar.messages.error_title', language) || getFallbackTranslation('calendar.messages.error_title', language) || 'Error',
          `${t('calendar.messages.create_reminder_failed', language) || getFallbackTranslation('calendar.messages.create_reminder_failed', language) || 'Failed to create reminder'}: ${error.message}`
        );
        return;
      }

      console.log('✅ Reminder created successfully:', newReminder);
      // Add to local state for immediate UI update
      setReminders([...reminders, newReminder]);
      
      // Close modal and clear input
      setShowReminderModal(false);
      setReminderTitle('');
      Alert.alert(
        t('calendar.messages.success_title', language) || getFallbackTranslation('calendar.messages.success_title', language) || 'Success',
        t('calendar.messages.reminder_added_success', language) || getFallbackTranslation('calendar.messages.reminder_added_success', language) || 'Reminder added successfully!'
      );
    } catch (error) {
      console.error('❌ Error creating reminder:', error);
      Alert.alert(
        t('calendar.messages.error_title', language) || getFallbackTranslation('calendar.messages.error_title', language) || 'Error',
        `${t('calendar.messages.create_reminder_failed', language) || getFallbackTranslation('calendar.messages.create_reminder_failed', language) || 'Failed to create reminder'}: ${error instanceof Error ? error.message : t('calendar.messages.unknown_error', language) || getFallbackTranslation('calendar.messages.unknown_error', language) || 'Unknown error'}`
      );
    }
  };

  const handleCancelAddReminder = () => {
    setShowReminderModal(false);
    setReminderTitle('');
  };

  const handleRemoveReminder = async (reminderId: string) => {
    Alert.alert(
      t('calendar.messages.remove_reminder_title', language) || getFallbackTranslation('calendar.messages.remove_reminder_title', language),
      t('calendar.messages.remove_reminder_message', language) || getFallbackTranslation('calendar.messages.remove_reminder_message', language),
      [
        { text: t('calendar.messages.cancel', language) || getFallbackTranslation('calendar.messages.cancel', language), style: 'cancel' },
        {
          text: t('calendar.messages.remove', language) || getFallbackTranslation('calendar.messages.remove', language),
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('reminders')
                .delete()
                .eq('id', reminderId);

              if (error) {
                console.error('❌ Error deleting reminder:', error);
                Alert.alert(
                  t('calendar.messages.error_title', language) || getFallbackTranslation('calendar.messages.error_title', language) || 'Error',
                  t('calendar.messages.delete_reminder_failed', language) || getFallbackTranslation('calendar.messages.delete_reminder_failed', language) || 'Failed to delete reminder. Please try again.'
                );
                return;
              }

              console.log('✅ Reminder deleted successfully');
              // Remove from local state for immediate UI update
              setReminders(reminders.filter(r => r.id !== reminderId));
            } catch (error) {
              console.error('❌ Error deleting reminder:', error);
              Alert.alert(
                t('calendar.messages.error_title', language) || getFallbackTranslation('calendar.messages.error_title', language) || 'Error',
                t('calendar.messages.delete_reminder_failed', language) || getFallbackTranslation('calendar.messages.delete_reminder_failed', language) || 'Failed to delete reminder. Please try again.'
              );
            }
          }
        }
      ]
    );
  };

  const monthNames = [
    t('calendar.months.january', language) || getFallbackTranslation('calendar.months.january', language),
    t('calendar.months.february', language) || getFallbackTranslation('calendar.months.february', language),
    t('calendar.months.march', language) || getFallbackTranslation('calendar.months.march', language),
    t('calendar.months.april', language) || getFallbackTranslation('calendar.months.april', language),
    t('calendar.months.may', language) || getFallbackTranslation('calendar.months.may', language),
    t('calendar.months.june', language) || getFallbackTranslation('calendar.months.june', language),
    t('calendar.months.july', language) || getFallbackTranslation('calendar.months.july', language),
    t('calendar.months.august', language) || getFallbackTranslation('calendar.months.august', language),
    t('calendar.months.september', language) || getFallbackTranslation('calendar.months.september', language),
    t('calendar.months.october', language) || getFallbackTranslation('calendar.months.october', language),
    t('calendar.months.november', language) || getFallbackTranslation('calendar.months.november', language),
    t('calendar.months.december', language) || getFallbackTranslation('calendar.months.december', language)
  ];

  const dayNames = [
    t('calendar.days.sunday', language) || getFallbackTranslation('calendar.weekdays.sunday', language),
    t('calendar.days.monday', language) || getFallbackTranslation('calendar.weekdays.monday', language),
    t('calendar.days.tuesday', language) || getFallbackTranslation('calendar.weekdays.tuesday', language),
    t('calendar.days.wednesday', language) || getFallbackTranslation('calendar.weekdays.wednesday', language),
    t('calendar.days.thursday', language) || getFallbackTranslation('calendar.weekdays.thursday', language),
    t('calendar.days.friday', language) || getFallbackTranslation('calendar.weekdays.friday', language),
    t('calendar.days.saturday', language) || getFallbackTranslation('calendar.weekdays.saturday', language)
  ];

  const weekdayNames = [
    t('calendar.weekdays.sunday', language) || getFallbackTranslation('calendar.weekdays.sunday', language),
    t('calendar.weekdays.monday', language) || getFallbackTranslation('calendar.weekdays.monday', language),
    t('calendar.weekdays.tuesday', language) || getFallbackTranslation('calendar.weekdays.tuesday', language),
    t('calendar.weekdays.wednesday', language) || getFallbackTranslation('calendar.weekdays.wednesday', language),
    t('calendar.weekdays.thursday', language) || getFallbackTranslation('calendar.weekdays.thursday', language),
    t('calendar.weekdays.friday', language) || getFallbackTranslation('calendar.weekdays.friday', language),
    t('calendar.weekdays.saturday', language) || getFallbackTranslation('calendar.weekdays.saturday', language)
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = getDaysInMonth(selectedDate);
  const selectedTransactions = getTransactionsForDate(selectedDate);
  const selectedReminders = getRemindersForDate(selectedDate);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    await loadReminders();
    setRefreshing(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const renderCalendarHeader = () => (
    <View style={styles.calendarHeader}>
      <TouchableOpacity 
        style={styles.navButton} 
        onPress={() => navigateMonth('prev')}
      >
        <Text style={styles.navButtonText}>‹</Text>
      </TouchableOpacity>
      
      <View style={styles.monthYearContainer}>
        <Text style={styles.monthText}>
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.navButton} 
        onPress={() => navigateMonth('next')}
      >
        <Text style={styles.navButtonText}>›</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWeekdayHeaders = () => (
    <View style={styles.weekdayHeader}>
      {weekdayNames.map((day, index) => (
        <View key={index} style={styles.weekdayCell}>
          <Text style={styles.weekdayText}>{day.substring(0, 3)}</Text>
        </View>
      ))}
    </View>
  );

  const renderCalendarGrid = () => (
    <View style={styles.calendarGrid}>
      {days.map((day, index) => {
        if (!day) {
          return <View key={index} style={styles.emptyDay} />;
        }

        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);
        const dayTransactions = getTransactionsForDate(day);
        const dayReminders = getRemindersForDate(day);
        const hasEvents = dayTransactions.length > 0 || dayReminders.length > 0;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              isToday && styles.todayCell,
              isSelected && styles.selectedDayCell,
              hasEvents && styles.eventDayCell
            ]}
            onPress={() => setSelectedDate(day)}
          >
            <Text style={[
              styles.dayText,
              isToday && styles.todayText,
              isSelected && styles.selectedDayText
            ]}>
              {day.getDate()}
            </Text>
            {hasEvents && (
              <View style={styles.eventIndicator}>
                <View style={[
                  styles.eventDot,
                  dayTransactions.length > 0 && styles.transactionDot,
                  dayReminders.length > 0 && styles.reminderDot
                ]} />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSelectedDateInfo = () => {
    if (selectedTransactions.length === 0 && selectedReminders.length === 0) {
      return (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>
            {t('calendar.messages.no_events', language) || getFallbackTranslation('calendar.messages.no_events', language)}
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
            <Text style={styles.addButtonText}>
              {t('calendar.buttons.add_reminder', language) || getFallbackTranslation('calendar.buttons.add_reminder', language)}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>
          {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
        </Text>
        
        {selectedTransactions.length > 0 && (
          <View style={styles.transactionsSection}>
            <Text style={styles.sectionTitle}>
              {t('calendar.labels.transactions', language) || getFallbackTranslation('calendar.labels.transactions', language)}
            </Text>
            {selectedTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Text style={styles.transactionEmoji}>{transaction.icon}</Text>
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>
                    {(transaction as any).description}
                  </Text>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, currency, language)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedReminders.length > 0 && (
          <View style={styles.remindersSection}>
            <Text style={styles.sectionTitle}>
              {t('calendar.labels.reminders', language) || getFallbackTranslation('calendar.labels.reminders', language)}
            </Text>
            {selectedReminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderItem}>
                <View style={styles.reminderIcon}>
                  <Text style={styles.reminderEmoji}>🔔</Text>
                </View>
                <View style={styles.reminderDetails}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderDescription}>
                    {reminder.description}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveReminder(reminder.id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
          <Text style={styles.addButtonText}>
            {t('calendar.buttons.add_reminder', language) || getFallbackTranslation('calendar.buttons.add_reminder', language)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { textAlign }]}>
            {t('calendar.title', language) || getFallbackTranslation('calendar.title', language)}
          </Text>
        </View>

        <View style={styles.calendarContainer}>
          {renderCalendarHeader()}
          {renderWeekdayHeaders()}
          {renderCalendarGrid()}
        </View>

        <View style={styles.selectedDateContainer}>
          {renderSelectedDateInfo()}
        </View>
      </ScrollView>

      {/* Add Reminder Modal */}
      <Modal
        visible={showReminderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelAddReminder}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {t('calendar.messages.add_reminder_title', language) || getFallbackTranslation('calendar.messages.add_reminder_title', language) || 'Add Reminder'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {(t('calendar.messages.add_reminder_prompt', language) || getFallbackTranslation('calendar.messages.add_reminder_prompt', language) || 'Enter reminder for {date}')
                .replace('{date}', `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`)}
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder={t('calendar.messages.enter_reminder_title', language) || getFallbackTranslation('calendar.messages.enter_reminder_title', language) || 'Enter reminder title...'}
              value={reminderTitle}
              onChangeText={setReminderTitle}
              autoFocus={true}
              multiline={false}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={handleCancelAddReminder}>
                <Text style={styles.modalCancelText}>
                  {t('calendar.messages.cancel', language) || getFallbackTranslation('calendar.messages.cancel', language)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={handleConfirmAddReminder}>
                <Text style={styles.modalConfirmText}>
                  {t('calendar.buttons.add_reminder', language) || getFallbackTranslation('calendar.buttons.add_reminder', language)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  calendarContainer: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64748b',
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  todayCell: {
    backgroundColor: '#e0f2fe',
  },
  selectedDayCell: {
    backgroundColor: '#3b82f6',
  },
  eventDayCell: {
    backgroundColor: '#f0f9ff',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  todayText: {
    color: '#0284c7',
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  transactionDot: {
    backgroundColor: '#3b82f6',
  },
  reminderDot: {
    backgroundColor: '#f59e0b',
  },
  selectedDateContainer: {
    margin: 20,
    marginTop: 0,
  },
  noEventsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  noEventsText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
  },
  eventsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  transactionsSection: {
    marginBottom: 20,
  },
  remindersSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 18,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#10b981',
  },
  expenseAmount: {
    color: '#ef4444',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reminderEmoji: {
    fontSize: 18,
  },
  reminderDetails: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 12,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    minWidth: 300,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9fafb',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
