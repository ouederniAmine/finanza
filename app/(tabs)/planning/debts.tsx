import AddTransactionDrawerPerfect from '@/components/AddTransactionDrawerPerfect';
import { formatCurrency, getCurrency, getTextAlign, t } from '@/lib/i18n';
import { DebtService, type DebtData, type DebtSummary } from '@/lib/services/debt.service';
import { useUIStore } from '@/lib/store';
import { useUser } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import PlanningSegmentedBar from '../../../components/PlanningSegmentedBar';
import PlanningSwipeWrapper from '../../../components/PlanningSwipeWrapper';
import PlanningSurface from '@/components/PlanningSurface';
import { PlusButton } from '@/components/PlusButton';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DebtsScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [debts, setDebts] = useState<DebtData[]>([]);
  const [debtSummary, setDebtSummary] = useState<DebtSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddDebtDrawer, setShowAddDebtDrawer] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedDebtForAction, setSelectedDebtForAction] = useState<DebtData | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [addDebtType, setAddDebtType] = useState<'debt_given' | 'debt_received'>('debt_given');
  const { language } = useUIStore();
  const textAlign = getTextAlign(language);
  const currency = getCurrency(language);

  useEffect(() => {
    if (user?.id) {
      loadDebts();
    }
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        loadDebts();
      }
    }, [user?.id])
  );

  const loadDebts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      console.log('🔄 Loading debts for user:', user.id);
      
      const [debtsData, summaryData] = await Promise.all([
        DebtService.getDebts(user.id),
        DebtService.getDebtSummary(user.id)
      ]);
      
      setDebts(debtsData);
      setDebtSummary(summaryData);
      console.log('✅ Debts loaded successfully:', debtsData.length);
    } catch (error) {
      console.error('❌ Error loading debts:', error);
      Alert.alert(t('debts.error', language), t('debts.error_loading', language));
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to work with the new schema
  const getPersonName = (debt: DebtData) => {
    return debt.debt_type === 'i_owe' ? debt.creditor_name : (debt.debtor_name || t('debts.unknown', language));
  };

  const getDebtIcon = (debt: DebtData) => {
    if (debt.debt_type === 'i_owe') return '📤';
    if (debt.debt_type === 'owed_to_me') return '📥';
    if (debt.debt_type === 'loan') return '💰';
    if (debt.debt_type === 'credit_card') return '💳';
    return '💸';
  };

  const getDebtCategory = (debt: DebtData) => {
    // You can add category mapping logic here if needed
    return t('debts.personal', language);
  };

  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return t('debts.today', language);
    if (diffDays === 1) return t('debts.yesterday', language);
    if (diffDays <= 7) return `${diffDays} ${t('debts.days_ago', language)}`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} ${t('debts.weeks_ago', language)}`;
    return date.toLocaleDateString();
  };

  const getStatusText = (debt: DebtData) => {
    if (debt.is_settled) return t('debts.settled', language);
    if (debt.status === 'paid') return t('debts.paid', language);
    if (debt.status === 'cancelled') return t('debts.cancelled', language);
    
    // Check if overdue
    if (debt.due_date) {
      const dueDate = new Date(debt.due_date);
      const now = new Date();
      if (dueDate < now) return t('debts.overdue', language);
    }
    
    // Check if partial payment
    if (debt.remaining_amount < debt.original_amount) {
      return t('debts.partial', language);
    }
    
    return t('debts.pending', language);
  };

  const getStatusForComparison = (debt: DebtData) => {
    if (debt.is_settled) return 'settled';
    if (debt.status === 'paid') return 'paid';
    if (debt.status === 'cancelled') return 'cancelled';
    
    // Check if overdue
    if (debt.due_date) {
      const dueDate = new Date(debt.due_date);
      const now = new Date();
      if (dueDate < now) return 'overdue';
    }
    
    // Check if partial payment
    if (debt.remaining_amount < debt.original_amount) {
      return 'partial';
    }
    
    return 'pending';
  };

  const filters = [
    { key: 'all', label: t('debts.all', language) },
    { key: 'i_owe', label: t('debts.i_owe', language) },
    { key: 'they_owe', label: t('debts.they_owe', language) },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDebts();
    setRefreshing(false);
  };

  // Handler for Add Debt button
  const handleAddDebt = () => {
    Alert.alert(
      t('debts.add_debt_title', language),
      t('debts.add_debt_question', language),
      [
        { 
          text: t('debts.i_owe_money', language), 
          onPress: () => {
            setAddDebtType('debt_received');
            setShowAddDebtDrawer(true);
          }
        },
        { 
          text: t('debts.they_owe_me', language), 
          onPress: () => {
            setAddDebtType('debt_given');
            setShowAddDebtDrawer(true);
          }
        },
        { text: t('debts.cancel', language), style: 'cancel' }
      ]
    );
  };

  // Handler for Pay button (for debts I owe)
  const handlePayDebt = (debt: DebtData) => {
    setSelectedDebtForAction(debt);
    setPaymentAmount('');
    setShowPaymentModal(true);
  };

  // Handler for Settle Debt button (mark as fully paid/settled)
  const handleSettleDebt = (debt: DebtData) => {
    setSelectedDebtForAction(debt);
    setShowSettleModal(true);
  };

  // Process payment
  const processPayment = async () => {
    if (!selectedDebtForAction?.id || !paymentAmount || !user?.id) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t('debts.error', language), t('debts.invalid_amount', language));
      return;
    }
    if (!selectedDebtForAction) return; // safety
    if (amount > selectedDebtForAction.remaining_amount) {
      Alert.alert(t('debts.error', language), t('debts.amount_exceeds', language));
      return;
    }

    try {
      setProcessing(true);
  console.log('💸 Processing payment:', { debtId: selectedDebtForAction!.id, amount });

  const updatedDebt = await DebtService.makePayment(selectedDebtForAction!.id, amount);
      
      // Update local state
      setDebts(prev => prev.map(debt => 
        debt.id === selectedDebtForAction!.id ? updatedDebt : debt
      ));

      setShowPaymentModal(false);
      setSelectedDebtForAction(null);
      setPaymentAmount('');

      // Show success message
      Alert.alert(
        t('debts.payment_successful', language),
        `${formatCurrency(amount, currency, language)} ${t('debts.payment_recorded', language)}`,
        [{ text: t('debts.ok', language) }]
      );

      // Reload summary
      loadDebts();
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      Alert.alert(t('debts.error', language), t('debts.error_payment', language));
    } finally {
      setProcessing(false);
    }
  };

  // Process settlement
  const processSettlement = async () => {
    if (!selectedDebtForAction?.id || !user?.id) return;

    try {
      setProcessing(true);
      console.log('✅ Processing settlement:', { debtId: selectedDebtForAction.id });

      const updatedDebt = await DebtService.settleDebt(selectedDebtForAction.id);
      
      // Update local state
      setDebts(prev => prev.map(debt => 
        debt.id === selectedDebtForAction.id ? updatedDebt : debt
      ));

      setShowSettleModal(false);
      setSelectedDebtForAction(null);

      // Show success message
      Alert.alert(
        t('debts.debt_settled', language),
        t('debts.debt_settled_message', language),
        [{ text: t('debts.ok', language) }]
      );

      // Reload summary
      loadDebts();
    } catch (error) {
      console.error('❌ Error settling debt:', error);
      Alert.alert(t('debts.error', language), t('debts.error_settle', language));
    } finally {
      setProcessing(false);
    }
  };

  const getDebtColor = (debt: DebtData) => {
    return debt.debt_type === 'i_owe' ? '#FF6B6B' : '#4ECDC4';
  };

  const getStatusColor = (debt: DebtData) => {
    const status = getStatusForComparison(debt);
    switch (status) {
      case 'overdue': return '#EF4444';
      case 'partial': return '#F59E0B';
      case 'pending': return '#6B7280';
      case 'settled': return '#10B981';
      case 'paid': return '#10B981';
      case 'cancelled': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getDebtSign = (debt: DebtData) => {
    return debt.debt_type === 'i_owe' ? '-' : '+';
  };

  const filteredDebts = selectedFilter === 'all' 
    ? debts 
    : debts.filter(debt => {
        if (selectedFilter === 'i_owe') return debt.debt_type === 'i_owe';
        if (selectedFilter === 'they_owe') return debt.debt_type === 'owed_to_me';
        return true;
      });

  const totalIOwe = debts
    .filter(d => d.debt_type === 'i_owe' && !d.is_settled)
    .reduce((sum, d) => sum + d.remaining_amount, 0);

  const totalTheyOwe = debts
    .filter(d => d.debt_type === 'owed_to_me' && !d.is_settled)
    .reduce((sum, d) => sum + d.remaining_amount, 0);

  const netBalance = totalTheyOwe - totalIOwe;

  const heroAmount = `${debts.length} ${t('debts.active_debts', language)}`;
  const PALETTE = ['#EED4C4','#C2E0C4','#F4C3AA','#BADADA','#F4CBD8'];

  const surfaceContent = (
    <>
      {/* Summary Cards */}
      <View style={newStyles.summaryRow}>
        <View style={[newStyles.metricCard, { borderLeftColor: '#FF6B6B' }]}> 
          <Text style={newStyles.metricLabel}>{t('debts.i_owe', language)}</Text>
          <Text style={newStyles.metricValue}>{formatCurrency(totalIOwe, currency, language)}</Text>
        </View>
        <View style={[newStyles.metricCard, { borderLeftColor: '#10B981' }]}> 
          <Text style={newStyles.metricLabel}>{t('debts.they_owe', language)}</Text>
          <Text style={newStyles.metricValue}>{formatCurrency(totalTheyOwe, currency, language)}</Text>
        </View>
        <View style={[newStyles.metricCard, { borderLeftColor: netBalance >= 0 ? '#10B981' : '#FF6B6B' }]}> 
          <Text style={newStyles.metricLabel}>{t('debts.net_balance', language)}</Text>
          <Text style={newStyles.metricValue}>{`${netBalance >= 0 ? '+' : ''}${formatCurrency(netBalance, currency, language)}`}</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={newStyles.filterScroll}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[newStyles.filterChip, selectedFilter === filter.key && newStyles.filterChipActive]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[newStyles.filterChipText, selectedFilter === filter.key && newStyles.filterChipTextActive]}>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Actions */}
      <View style={newStyles.actionsRow}>
        <TouchableOpacity style={newStyles.actionPill} onPress={handleAddDebt}>
          <Text style={newStyles.actionPillText}>➕ {t('debts.add_debt', language)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={newStyles.actionPill} onPress={() => {
          const unsettledDebts = debts.filter(d => !d.is_settled);
          if (unsettledDebts.length === 0) {
            Alert.alert(t('debts.no_debts_available', language), t('debts.no_debts_to_settle', language));
            return;
          }
          handleSettleDebt(unsettledDebts[0]);
        }}>
          <Text style={newStyles.actionPillText}>💸 {t('debts.settle_debt', language)}</Text>
        </TouchableOpacity>
      </View>

      {/* Debts List */}
      <View style={newStyles.listContainer}>
        {loading ? (
          <View style={newStyles.emptyState}> 
            <Text style={newStyles.emptyEmoji}>⏳</Text>
            <Text style={newStyles.emptyTitle}>{t('common.loading', language)}</Text>
          </View>
        ) : filteredDebts.length === 0 ? (
          <View style={newStyles.emptyState}> 
            <Text style={newStyles.emptyEmoji}>📝</Text>
            <Text style={newStyles.emptyTitle}>{t('debts.no_debts', language)}</Text>
            <Text style={newStyles.emptySubtitle}>{t('debts.no_debts_desc', language)}</Text>
          </View>
        ) : (
          filteredDebts.map((debt, index) => {
            const bgColor = PALETTE[index % PALETTE.length];
            return (
              <View key={debt.id} style={[newStyles.debtRow,{backgroundColor:bgColor}]}> 
                <View style={newStyles.debtLeft}>
                  <View style={[newStyles.debtEmojiWrap, { backgroundColor: `${getDebtColor(debt)}20` }]}> 
                    <Text style={newStyles.debtEmoji}>{getDebtIcon(debt)}</Text>
                  </View>
                  <View style={newStyles.debtInfo}> 
                    <Text style={newStyles.debtPerson}>{getPersonName(debt)}</Text>
                    <Text style={newStyles.debtDesc}>{debt.description_tn || debt.description_en || t('debts.no_description', language)}</Text>
                    <View style={newStyles.debtMetaRow}> 
                      <Text style={newStyles.debtMetaText}>{getDebtCategory(debt)}</Text>
                      <Text style={newStyles.debtMetaText}>{getFormattedDate(debt.debt_date)}</Text>
                    </View>
                  </View>
                </View>
                <View style={newStyles.debtRight}> 
                  <Text style={[newStyles.debtAmount, { color: getDebtColor(debt) }]}>{getDebtSign(debt)}{formatCurrency(debt.remaining_amount, currency, language)}</Text>
                  <TouchableOpacity style={[newStyles.debtActionBtn, { backgroundColor: getDebtColor(debt) }]} onPress={() => debt.debt_type === 'i_owe' ? handlePayDebt(debt) : handleSettleDebt(debt)}>
                    <Text style={newStyles.debtActionText}>{debt.debt_type === 'i_owe' ? t('debts.pay', language) : t('debts.settle', language)}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>
    </>
  );

  return (
    <PlanningSwipeWrapper>
      <PlanningSurface
        title={t('navigation.debts', language)}
        subtitle={t('debts.manage_your_debts', language) || ''}
        amountLine={heroAmount}
        refreshing={refreshing}
        onRefresh={onRefresh}
        topExtra={<PlanningSegmentedBar />}
      >
        {surfaceContent}
      </PlanningSurface>
      <View style={[newStyles.fabRootWrapper, { bottom: insets.bottom + 96 }]} pointerEvents="box-none">
        <PlusButton onPress={handleAddDebt} />
      </View>

      {/* Add Debt Drawer */}
      <AddTransactionDrawerPerfect
        visible={showAddDebtDrawer}
        onClose={() => setShowAddDebtDrawer(false)}
        initialType={addDebtType}
        onTransactionCreated={() => {
          setShowAddDebtDrawer(false);
          loadDebts(); // Reload debts after creating new debt
        }}
      />

      {/* Payment Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={[styles.modalTitle, { textAlign }]}>{t('debts.make_payment', language)}</Text>
            
            {selectedDebtForAction && (
              <View style={styles.modalContent}>
                <Text style={[styles.modalDebtInfo, { textAlign }]}>
                  {t('debts.to', language)}: {getPersonName(selectedDebtForAction)}
                </Text>
                <Text style={[styles.modalAmountInfo, { textAlign }]}>
                  {t('debts.remaining', language)}: {formatCurrency(selectedDebtForAction.remaining_amount, currency, language)}
                </Text>
                
                <Text style={[styles.modalInputLabel, { textAlign }]}>{t('debts.payment_amount', language)}</Text>
                <TextInput
                  style={[styles.modalInput, { textAlign }]}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  placeholder={t('debts.enter_amount', language)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setShowPaymentModal(false);
                      setPaymentAmount('');
                      setSelectedDebtForAction(null);
                    }}
                    disabled={processing}
                  >
                    <Text style={styles.modalCancelText}>{t('debts.cancel', language)}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalPayButton, processing && { opacity: 0.6 }]}
                    onPress={processPayment}
                    disabled={processing || !paymentAmount}
                  >
                    <Text style={styles.modalPayText}>
                      {processing ? t('debts.processing', language) : t('debts.pay', language)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Settle Debt Modal */}
      <Modal
        visible={showSettleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={[styles.modalTitle, { textAlign }]}>{t('debts.settle_debt_title', language)}</Text>
            
            {selectedDebtForAction && (
              <View style={styles.modalContent}>
                <Text style={[styles.modalDebtInfo, { textAlign }]}>
                  {selectedDebtForAction.debt_type === 'i_owe' ? `${t('debts.to', language)}: ` : `${t('debts.from', language)}: `}{getPersonName(selectedDebtForAction)}
                </Text>
                <Text style={[styles.modalAmountInfo, { textAlign }]}>
                  {t('debts.amount', language)}: {formatCurrency(selectedDebtForAction.remaining_amount, currency, language)}
                </Text>
                
                <Text style={[styles.modalWarning, { textAlign }]}>
                  {t('debts.settle_warning', language)}
                </Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => {
                      setShowSettleModal(false);
                      setSelectedDebtForAction(null);
                    }}
                    disabled={processing}
                  >
                    <Text style={styles.modalCancelText}>{t('debts.cancel', language)}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalSettleButton, processing && { opacity: 0.6 }]}
                    onPress={processSettlement}
                    disabled={processing}
                  >
                    <Text style={styles.modalSettleText}>
                      {processing ? t('debts.settling', language) : t('debts.settle', language)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </PlanningSwipeWrapper>
  );
}

const styles = StyleSheet.create({
  // Modal styles (unchanged below)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalContent: {
    gap: 16,
  },
  modalDebtInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalAmountInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalWarning: {
    fontSize: 14,
    color: '#DC2626',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  modalPayButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalPayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSettleButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSettleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

const newStyles = StyleSheet.create({
  fabRootWrapper: {
    position: 'absolute',
    right: 24,
    zIndex: 100,
    elevation: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  filterScroll: { marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    marginRight: 10,
  },
  filterChipActive: { backgroundColor: '#754E51' },
  filterChipText: { fontSize: 13, color: '#1F2937', fontWeight: '500' },
  filterChipTextActive: { color: '#FFFFFF' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionPill: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionPillText: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  listContainer: { gap: 14 },
  debtRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  debtLeft: { flex: 1, flexDirection: 'row' },
  debtEmojiWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  debtEmoji: { fontSize: 20 },
  debtInfo: { flex: 1 },
  debtPerson: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  debtDesc: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  debtMetaRow: { flexDirection: 'row', gap: 12 },
  debtMetaText: { fontSize: 11, color: '#6B7280' },
  debtRight: { alignItems: 'flex-end', justifyContent: 'space-between', marginLeft: 12 },
  debtAmount: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  debtActionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  debtActionText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  emptySubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
});
