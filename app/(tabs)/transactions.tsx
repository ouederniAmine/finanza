import AddTransactionDrawerPerfect from '@/components/AddTransactionDrawerPerfect';
import { formatCurrency, getTextAlign, t } from '@/lib/i18n';
import { useUIStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'savings';
  amount: number;
  description: string;
  category: string;
  date: string;
  time: string;
  icon: string;
  location?: string;
  recurring?: boolean;
}

interface DBTransaction {
  id: string;
  user_id: string;
  category_id: string;
  amount: string;
  currency: string;
  type: 'income' | 'expense' | 'savings';
  description_tn: string | null;
  description_ar: string | null;
  description_fr: string | null;
  description_en: string | null;
  transaction_date: string;
  payment_method: string | null;
  location: string | null;
  recurring: boolean;
  recurring_frequency: string | null;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export default function TransactionsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTransactionDrawer, setShowTransactionDrawer] = useState(false);
  const { language } = useUIStore();
  const { user } = useUser();
  const textAlign = getTextAlign(language);

  // Map category IDs to display data (you might want to fetch this from a categories table)
  const getCategoryDisplayData = (categoryId: string, type: string) => {
    // Default icons based on transaction type
    const defaultIcons = {
      income: '💼',
      expense: '💳',
      savings: '🏦'
    };
    
    return {
      icon: defaultIcons[type as keyof typeof defaultIcons] || '💳',
      name: t('categories.other', language) || 'Other'
    };
  };

  const fetchTransactions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      if (data) {
        const formattedTransactions: Transaction[] = data.map((dbTransaction: DBTransaction) => {
          const categoryData = getCategoryDisplayData(dbTransaction.category_id, dbTransaction.type);
          
          // Get description based on language
          const getDescription = () => {
            switch (language) {
              case 'fr': return dbTransaction.description_fr || dbTransaction.description_en || 'Transaction';
              case 'tn': return dbTransaction.description_tn || dbTransaction.description_en || 'Transaction';
              default: return dbTransaction.description_en || 'Transaction';
            }
          };

          const transactionDate = new Date(dbTransaction.transaction_date);
          
          return {
            id: dbTransaction.id,
            type: dbTransaction.type,
            amount: parseFloat(dbTransaction.amount),
            description: getDescription(),
            category: categoryData.name,
            date: transactionDate.toISOString().split('T')[0],
            time: transactionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            icon: categoryData.icon,
            location: dbTransaction.location || undefined,
            recurring: dbTransaction.recurring,
          };
        });
        
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error('Unexpected error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleTransactionCreated = () => {
    fetchTransactions(); // Refresh transactions when a new one is created
  };

  const FILTER_OPTIONS = [
    { id: 'all', label: t('common.all', language), color: '#6B7280' },
    { id: 'income', label: t('common.income', language), color: '#4ECDC4' },
    { id: 'expense', label: t('common.expense', language), color: '#FF6B6B' },
    { id: 'savings', label: t('navigation.savings', language), color: '#667EEA' },
  ];

  const filteredTransactions = transactions.filter((transaction: Transaction) => 
    selectedFilter === 'all' || transaction.type === selectedFilter
  );

  const totalIncome = transactions
    .filter((t: Transaction) => t.type === 'income')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const totalSavings = transactions
    .filter((t: Transaction) => t.type === 'savings')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income': return '#4ECDC4';
      case 'expense': return '#FF6B6B';
      case 'savings': return '#667EEA';
      default: return '#6B7280';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={{
      backgroundColor: '#FFFFFF',
      marginHorizontal: 20,
      marginBottom: 8,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            backgroundColor: `${getTransactionColor(item.type)}15`
          }}>
            <Text style={{ fontSize: 20 }}>{item.icon}</Text>
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1F2937',
              marginBottom: 4,
              textAlign
            }}>
              {t(item.description, language)}
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6B7280',
              textAlign
            }}>
              {t(item.category, language)} • {item.time}
            </Text>
            {item.location && (
              <Text style={{
                fontSize: 12,
                color: '#9CA3AF',
                marginTop: 2,
                textAlign
              }}>
                📍 {item.location}
              </Text>
            )}
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: getTransactionColor(item.type)
          }}>
            {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount, 'TND', language)}
          </Text>
          {item.recurring && (
            <Text style={{
              fontSize: 12,
              color: '#667EEA',
              marginTop: 4
            }}>
              🔄 Recurring
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFBFC' }}>
      {/* Header matching main app style */}
      <View style={{
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: '#FAFBFC',
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <View>
            <Text style={{
              fontSize: 16,
              color: '#6B7280',
              marginBottom: 4,
              textAlign
            }}>
              {new Date().toLocaleDateString(language === 'tn' ? 'ar-TN' : language === 'fr' ? 'fr-FR' : 'en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#1F2937',
              textAlign
            }}>
              💳 {t('navigation.transactions', language)}
            </Text>
          </View>
        </View>

        {/* Summary Cards matching main app style */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 16,
            flex: 1,
            marginRight: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#4ECDC420',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}>
              <Text style={{ fontSize: 16 }}>�</Text>
            </View>
            <Text style={{
              fontSize: 12,
              color: '#6B7280',
              fontWeight: '600',
              textAlign
            }}>
              {t('common.income', language)}
            </Text>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#1F2937',
              textAlign
            }}>
              {formatCurrency(totalIncome, 'TND', language)}
            </Text>
          </View>
          
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 16,
            flex: 1,
            marginHorizontal: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#FF6B6B20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}>
              <Text style={{ fontSize: 16 }}>�</Text>
            </View>
            <Text style={{
              fontSize: 12,
              color: '#6B7280',
              fontWeight: '600',
              textAlign
            }}>
              {t('dashboard.monthly_expenses', language)}
            </Text>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#1F2937',
              textAlign
            }}>
              {formatCurrency(totalExpenses, 'TND', language)}
            </Text>
          </View>
          
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 16,
            flex: 1,
            marginLeft: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}>
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#667EEA20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}>
              <Text style={{ fontSize: 16 }}>💰</Text>
            </View>
            <Text style={{
              fontSize: 12,
              color: '#6B7280',
              fontWeight: '600',
              textAlign
            }}>
              {t('navigation.savings', language)}
            </Text>
            <Text style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: '#1F2937',
              textAlign
            }}>
              {formatCurrency(totalSavings, 'TND', language)}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Section matching main app style */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1F2937',
          marginBottom: 12,
          textAlign
        }}>
          {t('dashboard.analytics', language)}
        </Text>
        <View style={{
          flexDirection: 'row',
          backgroundColor: '#F3F4F6',
          borderRadius: 12,
          padding: 4,
        }}>
          {FILTER_OPTIONS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setSelectedFilter(filter.id)}
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: selectedFilter === filter.id ? '#FFFFFF' : 'transparent',
                shadowColor: selectedFilter === filter.id ? '#000' : 'transparent',
                shadowOffset: selectedFilter === filter.id ? { width: 0, height: 1 } : { width: 0, height: 0 },
                shadowOpacity: selectedFilter === filter.id ? 0.1 : 0,
                shadowRadius: selectedFilter === filter.id ? 2 : 0,
                elevation: selectedFilter === filter.id ? 2 : 0,
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: selectedFilter === filter.id ? '#1F2937' : '#6B7280'
              }}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transactions List matching main app style */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 60,
              paddingHorizontal: 20,
            }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Text style={{ fontSize: 36 }}>
                  {loading ? '⏳' : '📊'}
                </Text>
              </View>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#1F2937',
                textAlign: 'center',
                marginBottom: 8,
              }}>
                {loading 
                  ? t('common.loading', language) || 'Loading...'
                  : t('transactions.no_transactions', language) || 'No Transactions Yet'
                }
              </Text>
              {!loading && (
                <Text style={{
                  fontSize: 14,
                  color: '#6B7280',
                  textAlign: 'center',
                  lineHeight: 20,
                }}>
                  {t('transactions.add_first_transaction', language) || 'Add your first transaction to get started'}
                </Text>
              )}
            </View>
          }
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setShowTransactionDrawer(true)}
        style={{
          position: 'absolute',
          bottom: 30,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#667EEA',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#667EEA',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text style={{
          color: '#FFFFFF',
          fontSize: 24,
          fontWeight: 'bold',
        }}>
          +
        </Text>
      </TouchableOpacity>

      {/* Add Transaction Drawer */}
      <AddTransactionDrawerPerfect
        visible={showTransactionDrawer}
        onClose={() => setShowTransactionDrawer(false)}
      />
    </SafeAreaView>
  );
}
