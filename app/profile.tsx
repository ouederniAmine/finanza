import { getTextAlign, SupportedLanguage, t } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { router, Stack } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const formatCurrency = (amount: number, currency: string, language: string) => {
  return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'ar-TN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Translation fallbacks for profile screen
const getProfileTranslation = (key: string, language: SupportedLanguage | undefined) => {
  const lang = language || 'en';
  const fallbacks: { [key: string]: string } = {
    'profile.title': 'Profile',
    'profile.financial_overview': 'Financial Overview',
    'profile.total_balance': 'Total Balance',
    'profile.monthly_expenses': 'Monthly Expenses',
    'profile.savings_goal': 'Savings Goals',
    'profile.growth_rate': 'Growth Rate',
    'profile.settings': 'Settings',
    'profile.language': 'Language',
    'profile.notifications': 'Notifications',
    'profile.notifications_desc': 'Receive push notifications',
    'profile.biometric': 'Biometric Authentication',
    'profile.biometric_desc': 'Use fingerprint or face ID',
    'profile.dark_mode': 'Dark Mode',
    'profile.dark_mode_desc': 'Use dark theme',
    'profile.change_password': 'Change Password',
    'profile.export_data': 'Export Data',
    'profile.help_support': 'Help & Support',
    'profile.privacy_policy': 'Privacy Policy',
    'profile.logout': 'Logout',
    'profile.premium_member': 'Premium Member',
    'profile.standard_member': 'Standard Member',
    'profile.user': 'User',
    'profile.no_email': 'No email',
    'profile.version': 'Version',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'messages.logout_confirmation': 'Are you sure you want to logout?',
    'actions.cancel': 'Cancel',
    'actions.confirm': 'Confirm',
    'messages.success': 'Success',
    'auth.email_not_available': 'Email not available',
    'auth.change_password_title': 'Change Password',
    'auth.change_password_subtitle': 'We will send you a password reset email',
    'auth.send_reset_email': 'Send Reset Email',
    'auth.change_password_email_sent': 'Password reset email sent',
    'auth.change_password_failed': 'Failed to send reset email',
  };
  
  return t(key, lang) || fallbacks[key] || key.split('.').pop() || key;
};

export default function ProfileScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { language, setLanguage } = useUIStore();
  const textAlign = getTextAlign(language);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [financialData, setFinancialData] = useState({
    totalBalance: 0,
    monthlyExpenses: 0,
    savingsGoal: 0,
    growthRate: 0,
    loading: true,
  });
  const [userStats, setUserStats] = useState({
    transactionCount: 0,
    goalsCount: 0,
    isPremium: false,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFinancialData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatUserCurrency = (amount: number) => formatCurrency(amount, 'TND', language);

  const loadFinancialData = async () => {
    if (!user?.id) return;

    try {
      setFinancialData(prev => ({ ...prev, loading: true }));

      // Get user's cultural preferences for monthly income
      const { data: userData } = await supabase
        .from('users')
        .select('cultural_preferences')
        .eq('id', user.id)
        .single();

      const monthlyIncome = userData?.cultural_preferences?.monthly_income || 0;

      // Get user's onboarding data for initial balance
      const { data: onboardingData } = await supabase
        .from('onboarding_steps')
        .select('data')
        .eq('user_id', user.id)
        .eq('step_name', 'balance')
        .single();

      let initialBalance = 0;
      if (onboardingData?.data?.amount) {
        initialBalance = parseFloat(onboardingData.data.amount);
      }

      // Get all transactions for the user
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (transactionsError) {
        console.error('❌ Error loading transactions:', transactionsError);
        setFinancialData(prev => ({ ...prev, loading: false }));
        return;
      }

      // Get all savings goals for savings target
      const { data: goals, error: goalsError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id);

      if (goalsError) {
        console.error('❌ Error loading savings goals:', goalsError);
      }

      // Calculate financial metrics
      // Start with monthly income as the base amount
      let totalBalance = monthlyIncome + initialBalance;
      let monthlyExpenses = 0;
      let totalSavingsGoal = 0;
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Calculate actual balance and current month expenses
      transactions?.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        
        if (transaction.type === 'income') {
          totalBalance += transaction.amount;
        } else {
          totalBalance -= transaction.amount;
          
          // Check if transaction is from current month
          if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
            monthlyExpenses += transaction.amount;
          }
        }
      });

      // Calculate previous month expenses for growth rate
      let previousMonthExpenses = 0;
      transactions?.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        
        if (transaction.type === 'expense' && 
            transactionDate.getMonth() === previousMonth && 
            transactionDate.getFullYear() === previousYear) {
          previousMonthExpenses += transaction.amount;
        }
      });

      // Calculate growth rate (negative growth means spending less, which is good)
      let growthRate = 0;
      if (previousMonthExpenses > 0) {
        growthRate = ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;
      }

      // Calculate total savings goals
      goals?.forEach(goal => {
        totalSavingsGoal += goal.target_amount;
      });

      // Update user stats
      const transactionCount = transactions?.length || 0;
      const goalsCount = goals?.length || 0;
      // Consider user premium if they have more than 10 transactions or 3 goals
      const isPremium = transactionCount > 10 || goalsCount > 3;

      setUserStats({
        transactionCount,
        goalsCount,
        isPremium,
      });

      setFinancialData({
        totalBalance,
        monthlyExpenses,
        savingsGoal: totalSavingsGoal,
        growthRate,
        loading: false,
      });

      console.log('✅ Financial data loaded successfully');
      console.log('💰 Initial Balance:', initialBalance);
      console.log('📊 Total Balance:', totalBalance);
    } catch (error) {
      console.error('❌ Error loading financial data:', error);
      setFinancialData(prev => ({ ...prev, loading: false }));
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        loadFinancialData();
      }
    }, [user?.id])
  );

  const handleLogout = () => {
    Alert.alert(
      getProfileTranslation('profile.logout', language),
      getProfileTranslation('messages.logout_confirmation', language),
      [
        { text: getProfileTranslation('actions.cancel', language), style: 'cancel' },
        {
          text: getProfileTranslation('actions.confirm', language),
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('User logged out');
              await signOut();
              router.replace('/auth/sign-in');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert(
                getProfileTranslation('common.error', language),
                'Failed to logout. Please try again.'
              );
            }
          }
        }
      ]
    );
  };

  const handleChangePassword = () => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      Alert.alert(
        getProfileTranslation('common.error', language),
        getProfileTranslation('auth.email_not_available', language)
      );
      return;
    }

    Alert.alert(
      getProfileTranslation('auth.change_password_title', language),
      getProfileTranslation('auth.change_password_subtitle', language),
      [
        { text: getProfileTranslation('actions.cancel', language), style: 'cancel' },
        {
          text: getProfileTranslation('auth.send_reset_email', language),
          onPress: async () => {
            try {
              const email = user?.primaryEmailAddress?.emailAddress;
              if (email) {
                // Note: In a real app, you'd use Clerk's password reset functionality
                console.log('Password reset for:', email);
                Alert.alert(
                  getProfileTranslation('messages.success', language),
                  getProfileTranslation('auth.change_password_email_sent', language)
                );
              }
            } catch (error) {
              console.error('Password reset error:', error);
              Alert.alert(
                getProfileTranslation('common.error', language),
                getProfileTranslation('auth.change_password_failed', language)
              );
            }
          }
        }
      ]
    );
  };

  const renderUserSection = () => (
    <View style={styles.userSection}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.onlineIndicator} />
        </View>
        
        <View style={styles.userDetails}>
          <Text style={styles.userName}>
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.emailAddresses?.[0]?.emailAddress || getProfileTranslation('profile.user', language)
            }
          </Text>
          <Text style={styles.userEmail}>
            {user?.emailAddresses?.[0]?.emailAddress || getProfileTranslation('profile.no_email', language)}
          </Text>
          <View style={[styles.membershipBadge, !userStats.isPremium && styles.standardMembershipBadge]}>
            <Text style={[styles.membershipText, !userStats.isPremium && styles.standardMembershipText]}>
              {userStats.isPremium ? getProfileTranslation('profile.premium_member', language) : getProfileTranslation('profile.standard_member', language)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderStatsSection = () => (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>{getProfileTranslation('profile.financial_overview', language)}</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statEmoji}>💰</Text>
          </View>
          <Text style={styles.statValue}>
            {financialData.loading ? '...' : formatUserCurrency(financialData.totalBalance)}
          </Text>
          <Text style={styles.statLabel}>{getProfileTranslation('profile.total_balance', language)}</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statEmoji}>📊</Text>
          </View>
          <Text style={styles.statValue}>
            {financialData.loading ? '...' : formatUserCurrency(financialData.monthlyExpenses)}
          </Text>
          <Text style={styles.statLabel}>{getProfileTranslation('profile.monthly_expenses', language)}</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statEmoji}>🎯</Text>
          </View>
          <Text style={styles.statValue}>
            {financialData.loading ? '...' : (financialData.savingsGoal > 0 ? formatUserCurrency(financialData.savingsGoal) : formatUserCurrency(0))}
          </Text>
          <Text style={styles.statLabel}>{getProfileTranslation('profile.savings_goal', language)}</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Text style={styles.statEmoji}>📈</Text>
          </View>
          <Text style={[styles.statValue, { 
            color: financialData.growthRate < 0 ? '#10b981' : financialData.growthRate > 0 ? '#ef4444' : '#1e293b' 
          }]}>
            {financialData.loading ? '...' : `${financialData.growthRate >= 0 ? '+' : ''}${financialData.growthRate.toFixed(1)}%`}
          </Text>
          <Text style={styles.statLabel}>{getProfileTranslation('profile.growth_rate', language)}</Text>
        </View>
      </View>
    </View>
  );

  const renderSettingsSection = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{getProfileTranslation('profile.settings', language)}</Text>
      
      <View style={styles.settingCard}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>🌐</Text>
            </View>
            <View style={styles.settingDetails}>
              <Text style={styles.settingTitle}>{getProfileTranslation('profile.language', language)}</Text>
              <Text style={styles.settingDescription}>
                {language === 'tn' ? 'تونسي' : language === 'fr' ? 'Français' : 'English'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.settingButton}
            onPress={() => setLanguage(language === 'tn' ? 'en' : language === 'fr' ? 'tn' : 'fr')}
          >
            <Text style={styles.settingButtonText}>
              {language === 'tn' ? 'EN' : language === 'fr' ? 'تن' : 'FR'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingCard}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>🔔</Text>
            </View>
            <View style={styles.settingDetails}>
              <Text style={styles.settingTitle}>{getProfileTranslation('profile.notifications', language)}</Text>
              <Text style={styles.settingDescription}>
                {getProfileTranslation('profile.notifications_desc', language)}
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
            thumbColor={notificationsEnabled ? '#ffffff' : '#f3f4f6'}
          />
        </View>
      </View>

      <View style={styles.settingCard}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>👆</Text>
            </View>
            <View style={styles.settingDetails}>
              <Text style={styles.settingTitle}>{getProfileTranslation('profile.biometric', language)}</Text>
              <Text style={styles.settingDescription}>
                {getProfileTranslation('profile.biometric_desc', language)}
              </Text>
            </View>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
            trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
            thumbColor={biometricsEnabled ? '#ffffff' : '#f3f4f6'}
          />
        </View>
      </View>

      <View style={styles.settingCard}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIcon}>
              <Text style={styles.settingEmoji}>🌙</Text>
            </View>
            <View style={styles.settingDetails}>
              <Text style={styles.settingTitle}>{getProfileTranslation('profile.dark_mode', language)}</Text>
              <Text style={styles.settingDescription}>
                {getProfileTranslation('profile.dark_mode_desc', language)}
              </Text>
            </View>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
            thumbColor={darkModeEnabled ? '#ffffff' : '#f3f4f6'}
          />
        </View>
      </View>
    </View>
  );

  const renderActionsSection = () => (
    <View style={styles.actionsSection}>
      <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
        <View style={styles.actionIcon}>
          <Text style={styles.actionEmoji}>🔐</Text>
        </View>
        <Text style={styles.actionText}>{getProfileTranslation('profile.change_password', language)}</Text>
        <Text style={styles.actionArrow}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <View style={styles.actionIcon}>
          <Text style={styles.actionEmoji}>📊</Text>
        </View>
        <Text style={styles.actionText}>{getProfileTranslation('profile.export_data', language)}</Text>
        <Text style={styles.actionArrow}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <View style={styles.actionIcon}>
          <Text style={styles.actionEmoji}>❓</Text>
        </View>
        <Text style={styles.actionText}>{getProfileTranslation('profile.help_support', language)}</Text>
        <Text style={styles.actionArrow}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton}>
        <View style={styles.actionIcon}>
          <Text style={styles.actionEmoji}>📋</Text>
        </View>
        <Text style={styles.actionText}>{getProfileTranslation('profile.privacy_policy', language)}</Text>
        <Text style={styles.actionArrow}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
        <View style={styles.actionIcon}>
          <Text style={styles.actionEmoji}>🚪</Text>
        </View>
        <Text style={[styles.actionText, styles.logoutText]}>{getProfileTranslation('profile.logout', language)}</Text>
        <Text style={[styles.actionArrow, styles.logoutArrow]}>‹</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{getProfileTranslation('common.loading', language)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
        {/* Header with Back Button */}
        <View style={[styles.header, { flexDirection: language === 'tn' ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>{language === 'tn' ? '→' : '←'}</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { textAlign }]}>
              {getProfileTranslation('profile.title', language)}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {renderUserSection()}
        {renderStatsSection()}
        {renderSettingsSection()}
        {renderActionsSection()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {getProfileTranslation('profile.version', language)} {Constants.expoConfig?.version || '1.0.0'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backIcon: {
    fontSize: 18,
    color: '#1F2937',
  },
  headerContent: {
    flex: 1,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  userSection: {
    margin: 20,
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  membershipBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  membershipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706',
  },
  standardMembershipBadge: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  standardMembershipText: {
    color: '#475569',
  },
  statsSection: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  settingsSection: {
    margin: 20,
    marginTop: 0,
  },
  settingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingEmoji: {
    fontSize: 18,
  },
  settingDetails: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  settingButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  settingButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsSection: {
    margin: 20,
    marginTop: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionEmoji: {
    fontSize: 18,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  logoutText: {
    color: '#dc2626',
  },
  actionArrow: {
    fontSize: 18,
    color: '#64748b',
    transform: [{ rotate: '180deg' }],
  },
  logoutArrow: {
    color: '#dc2626',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
  },
});
