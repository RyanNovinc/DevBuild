// src/screens/ProfileScreen/FinancialTracker/DebtTab.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Modal,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DebtTab = ({ theme, data, handlers }) => {
  const { financialData, formatCurrency, isPremium } = data;
  const [paymentStrategy, setPaymentStrategy] = useState('snowball'); // 'snowball' or 'avalanche'
  const [monthlyPayment, setMonthlyPayment] = useState('500');
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [showPayoffModal, setShowPayoffModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  
  // New debt form
  const [newDebtName, setNewDebtName] = useState('');
  const [newDebtBalance, setNewDebtBalance] = useState('');
  const [newDebtRate, setNewDebtRate] = useState('');
  const [newDebtMinPayment, setNewDebtMinPayment] = useState('');
  
  const isDarkMode = theme.background === '#000000';
  
  // Calculate debt payoff order based on strategy
  const calculatePayoffOrder = () => {
    const debts = [...(financialData.debts || [])];
    
    if (paymentStrategy === 'snowball') {
      // Smallest balance first
      return debts.sort((a, b) => a.amount - b.amount);
    } else {
      // Highest interest rate first (avalanche)
      return debts.sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
    }
  };

  // Calculate payoff timeline for all debts
  const calculatePayoffTimeline = () => {
    const orderedDebts = calculatePayoffOrder();
    const payment = parseFloat(monthlyPayment) || 0;
    let timeline = [];
    let remainingPayment = payment;
    let currentMonth = 0;
    
    // Create working copy of debts
    let workingDebts = orderedDebts.map(debt => ({
      ...debt,
      remainingBalance: debt.amount,
      minPayment: debt.minPayment || Math.max(debt.amount * 0.02, 25), // 2% or $25 minimum
    }));

    while (workingDebts.some(debt => debt.remainingBalance > 0) && currentMonth < 600) { // Max 50 years
      currentMonth++;
      let extraPayment = remainingPayment;
      
      // Pay minimums first
      workingDebts.forEach(debt => {
        if (debt.remainingBalance > 0) {
          const minPayment = Math.min(debt.minPayment, debt.remainingBalance);
          debt.remainingBalance -= minPayment;
          extraPayment -= minPayment;
        }
      });

      // Apply extra payment to target debt (first unpaid debt in order)
      const targetDebt = workingDebts.find(debt => debt.remainingBalance > 0);
      if (targetDebt && extraPayment > 0) {
        const extraApplied = Math.min(extraPayment, targetDebt.remainingBalance);
        targetDebt.remainingBalance -= extraApplied;
        
        if (targetDebt.remainingBalance <= 0) {
          timeline.push({
            debtId: targetDebt.id,
            debtName: targetDebt.name,
            monthsPaid: currentMonth,
            yearsPaid: Math.floor(currentMonth / 12),
            monthsRemaining: currentMonth % 12,
          });
        }
      }

      // Apply interest
      workingDebts.forEach(debt => {
        if (debt.remainingBalance > 0) {
          const monthlyRate = (debt.interestRate || 0) / 100 / 12;
          debt.remainingBalance *= (1 + monthlyRate);
        }
      });
    }

    return {
      timeline,
      totalMonths: currentMonth,
      totalYears: Math.floor(currentMonth / 12),
      remainingMonths: currentMonth % 12,
      totalInterest: calculateTotalInterest(orderedDebts, payment),
      debtFreeDate: new Date(Date.now() + currentMonth * 30 * 24 * 60 * 60 * 1000)
    };
  };

  // Calculate total interest paid
  const calculateTotalInterest = (debts, payment) => {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const payoffInfo = calculatePayoffTimeline();
    const totalPaid = payment * payoffInfo.totalMonths;
    return Math.max(0, totalPaid - totalDebt);
  };

  // Add new debt
  const handleAddDebt = () => {
    if (!isPremium) {
      Alert.alert('Pro Required', 'Debt tracking requires a Pro subscription.');
      return;
    }
    
    if (!newDebtName || !newDebtBalance) {
      Alert.alert('Error', 'Please enter debt name and balance.');
      return;
    }

    const newDebt = {
      id: Date.now().toString(),
      name: newDebtName,
      amount: parseFloat(newDebtBalance),
      interestRate: parseFloat(newDebtRate) || 0,
      minPayment: parseFloat(newDebtMinPayment) || Math.max(parseFloat(newDebtBalance) * 0.02, 25),
    };

    if (handlers?.handleAddDebt) {
      handlers.handleAddDebt(newDebt);
    }

    // Reset form
    setNewDebtName('');
    setNewDebtBalance('');
    setNewDebtRate('');
    setNewDebtMinPayment('');
    setShowAddDebtModal(false);
  };

  const payoffInfo = calculatePayoffTimeline();
  const orderedDebts = calculatePayoffOrder();
  const totalDebt = (financialData.debts || []).reduce((sum, debt) => sum + debt.amount, 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Strategy Selector */}
      <View style={[styles.strategyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Payoff Strategy</Text>
        
        <View style={styles.strategyButtons}>
          <TouchableOpacity
            style={[
              styles.strategyButton,
              paymentStrategy === 'snowball' && [styles.activeStrategy, { backgroundColor: theme.primary }]
            ]}
            onPress={() => setPaymentStrategy('snowball')}
          >
            <Ionicons 
              name="snow-outline" 
              size={20} 
              color={paymentStrategy === 'snowball' ? '#FFFFFF' : theme.textSecondary} 
            />
            <Text style={[
              styles.strategyText,
              { color: paymentStrategy === 'snowball' ? '#FFFFFF' : theme.textSecondary }
            ]}>
              Snowball
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.strategyButton,
              paymentStrategy === 'avalanche' && [styles.activeStrategy, { backgroundColor: theme.primary }]
            ]}
            onPress={() => setPaymentStrategy('avalanche')}
          >
            <Ionicons 
              name="trending-up-outline" 
              size={20} 
              color={paymentStrategy === 'avalanche' ? '#FFFFFF' : theme.textSecondary} 
            />
            <Text style={[
              styles.strategyText,
              { color: paymentStrategy === 'avalanche' ? '#FFFFFF' : theme.textSecondary }
            ]}>
              Avalanche
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.strategyDescription, { color: theme.textSecondary }]}>
          {paymentStrategy === 'snowball' 
            ? '🎯 Pay smallest balances first for quick wins and motivation'
            : '💰 Pay highest interest rates first to save more money'
          }
        </Text>
      </View>

      {/* Payment Amount Input */}
      <View style={[styles.paymentContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Monthly Payment Budget</Text>
        <View style={[styles.paymentInputContainer, { borderColor: theme.border }]}>
          <Text style={[styles.currencySymbol, { color: theme.text }]}>{financialData.currency}</Text>
          <TextInput
            style={[styles.paymentInput, { color: theme.text }]}
            value={monthlyPayment}
            onChangeText={setMonthlyPayment}
            keyboardType="numeric"
            placeholder="500"
            placeholderTextColor={theme.textSecondary}
          />
        </View>
      </View>

      {/* Payoff Summary */}
      {totalDebt > 0 && (
        <View style={[styles.summaryContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Debt-Free Timeline</Text>
            <TouchableOpacity 
              style={[styles.detailsButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowPayoffModal(true)}
            >
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.timelineStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Debt-Free In</Text>
              <Text style={[styles.statValue, { color: theme.primary }]}>
                {payoffInfo.totalYears}y {payoffInfo.remainingMonths}m
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Interest</Text>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>
                {formatCurrency(payoffInfo.totalInterest)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Debt-Free Date</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {payoffInfo.debtFreeDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Debt List */}
      <View style={[styles.debtListContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.debtListHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Debts</Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowAddDebtModal(true)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {(financialData.debts || []).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={48} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Debts Added</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Add your debts to see payoff strategies and timeline
            </Text>
          </View>
        ) : (
          orderedDebts.map((debt, index) => {
            const payoffOrder = index + 1;
            const timelineItem = payoffInfo.timeline.find(item => item.debtId === debt.id);
            const progress = Math.max(0, 1 - (debt.amount / (debt.originalAmount || debt.amount)));
            
            return (
              <View key={debt.id} style={[styles.debtCard, { borderColor: theme.border }]}>
                <View style={styles.debtHeader}>
                  <View style={styles.debtInfo}>
                    <View style={styles.debtNameRow}>
                      <Text style={[styles.debtName, { color: theme.text }]}>{debt.name}</Text>
                      <View style={[styles.orderBadge, { backgroundColor: theme.primary }]}>
                        <Text style={styles.orderText}>#{payoffOrder}</Text>
                      </View>
                    </View>
                    <Text style={[styles.debtBalance, { color: theme.textSecondary }]}>
                      {formatCurrency(debt.amount)} at {debt.interestRate || 0}% APR
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handlers?.handleDeleteItem('debt', debt.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={[styles.progressTrack, { backgroundColor: theme.background }]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          backgroundColor: theme.primary,
                          width: `${(progress * 100).toFixed(0)}%`
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                    {(progress * 100).toFixed(0)}% paid off
                  </Text>
                </View>

                {/* Payoff Timeline */}
                {timelineItem && (
                  <View style={styles.timelineContainer}>
                    <Ionicons name="time-outline" size={16} color={theme.primary} />
                    <Text style={[styles.timelineText, { color: theme.textSecondary }]}>
                      Paid off in {timelineItem.yearsPaid}y {timelineItem.monthsRemaining}m
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* Legal Disclaimer */}
      <View style={[styles.disclaimerContainer, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
        <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
        <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
          This is a calculation tool for educational purposes only. Not financial advice. 
          Consult a financial professional for personalized guidance.
        </Text>
      </View>

      {/* Add Debt Modal */}
      <Modal
        visible={showAddDebtModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddDebtModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Debt</Text>
              <TouchableOpacity onPress={() => setShowAddDebtModal(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Debt Name</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  value={newDebtName}
                  onChangeText={setNewDebtName}
                  placeholder="e.g., Credit Card, Student Loan"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Current Balance</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  value={newDebtBalance}
                  onChangeText={setNewDebtBalance}
                  placeholder="5000"
                  keyboardType="numeric"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Interest Rate (APR %)</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  value={newDebtRate}
                  onChangeText={setNewDebtRate}
                  placeholder="18.99"
                  keyboardType="numeric"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Minimum Payment (Optional)</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                  value={newDebtMinPayment}
                  onChangeText={setNewDebtMinPayment}
                  placeholder="Auto-calculated if left blank"
                  keyboardType="numeric"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: theme.border }]}
                onPress={() => setShowAddDebtModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addDebtButton, { backgroundColor: theme.primary }]}
                onPress={handleAddDebt}
              >
                <Text style={styles.addDebtButtonText}>Add Debt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payoff Details Modal */}
      <Modal
        visible={showPayoffModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPayoffModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Payoff Timeline</Text>
              <TouchableOpacity onPress={() => setShowPayoffModal(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.timelineScrollContainer}>
              {payoffInfo.timeline.map((item, index) => (
                <View key={item.debtId} style={[styles.timelineItem, { borderColor: theme.border }]}>
                  <View style={styles.timelineStep}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                      <Text style={styles.stepText}>{index + 1}</Text>
                    </View>
                    <View style={styles.stepInfo}>
                      <Text style={[styles.stepDebt, { color: theme.text }]}>{item.debtName}</Text>
                      <Text style={[styles.stepTime, { color: theme.textSecondary }]}>
                        Paid off after {item.yearsPaid} years, {item.monthsRemaining} months
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              
              <View style={[styles.finalStep, { backgroundColor: theme.cardElevated }]}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text style={[styles.finalStepText, { color: theme.text }]}>
                  🎉 Debt Free! You're all done paying off your debts.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  strategyContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  strategyButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  strategyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  activeStrategy: {
    borderColor: 'transparent',
  },
  strategyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  strategyDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  paymentContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  paymentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  paymentInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  summaryContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  timelineStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  debtListContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  debtListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  debtCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  debtInfo: {
    flex: 1,
  },
  debtNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  debtName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  orderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  orderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  debtBalance: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 4,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timelineText: {
    fontSize: 12,
  },
  disclaimerContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalContainer: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addDebtButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  addDebtButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timelineScrollContainer: {
    maxHeight: 400,
  },
  timelineItem: {
    borderBottomWidth: 1,
    paddingBottom: 16,
    marginBottom: 16,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepInfo: {
    flex: 1,
  },
  stepDebt: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepTime: {
    fontSize: 14,
  },
  finalStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  finalStepText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});

export default DebtTab;