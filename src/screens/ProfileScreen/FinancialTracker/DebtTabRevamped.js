// src/screens/ProfileScreen/FinancialTracker/DebtTabRevamped.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const DebtTabRevamped = ({ theme, data, handlers }) => {
  const { financialData, formatCurrency, isPremium } = data;
  const [selectedStrategy, setSelectedStrategy] = useState('avalanche');
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [showPaymentPlanModal, setShowPaymentPlanModal] = useState(false);
  const [totalDebtPayment, setTotalDebtPayment] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('monthly'); // 'monthly' or 'fortnightly'
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render
  
  // Form state
  const [debtName, setDebtName] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculate debt metrics
  const calculateMetrics = () => {
    const debts = financialData.debts || [];
    const totalDebt = debts.reduce((sum, debt) => sum + parseFloat(debt.amount || 0), 0);
    const totalAllocation = financialData.totalDebtAllocation || 0;
    
    // Calculate weighted average interest rate
    const weightedRate = debts.reduce((sum, debt) => {
      const weight = parseFloat(debt.amount || 0) / (totalDebt || 1);
      return sum + (parseFloat(debt.interestRate || 0) * weight);
    }, 0);
    
    // Calculate total annual interest
    const annualInterest = debts.reduce((sum, debt) => {
      return sum + (parseFloat(debt.amount || 0) * parseFloat(debt.interestRate || 0) / 100);
    }, 0);
    
    // Calculate realistic payoff time using total allocation (same formula as individual debt)
    let monthsToPayoff = 0;
    if (totalDebt > 0 && totalAllocation > 0) {
      const monthlyInterest = annualInterest / 12;
      
      if (monthlyInterest === 0) {
        // No interest, simple division
        monthsToPayoff = Math.ceil(totalDebt / totalAllocation);
      } else {
        // With interest, use proper loan payoff formula
        if (totalAllocation <= monthlyInterest) {
          monthsToPayoff = 0; // Payment too low
        } else {
          const monthlyRate = monthlyInterest / totalDebt; // Effective monthly rate
          monthsToPayoff = Math.ceil(
            Math.log(1 + (totalDebt * monthlyRate) / totalAllocation) / 
            Math.log(1 + monthlyRate)
          );
        }
      }
    }
    monthsToPayoff = Math.abs(monthsToPayoff);
    
    // Calculate debt-free date
    const debtFreeDate = monthsToPayoff > 0 ? (() => {
      const date = new Date();
      date.setMonth(date.getMonth() + monthsToPayoff);
      return date;
    })() : null;
    
    return {
      totalDebt,
      totalAllocation,
      weightedRate,
      annualInterest,
      monthsToPayoff: monthsToPayoff > 0 ? monthsToPayoff : 0,
      debtFreeDate,
      debtCount: debts.length
    };
  };

  const metrics = calculateMetrics();
  
  // Debug: log current debt data
  useEffect(() => {
    console.log('DebtTabRevamped - Current debts:', financialData.debts?.map(d => ({ 
      name: d.name, 
      amount: d.amount,
      rate: d.interestRate 
    })));
    console.log('DebtTabRevamped - Allocation:', financialData.totalDebtAllocation);
  }, [financialData.debts, financialData.totalDebtAllocation]);

  // Sort debts by strategy
  const getSortedDebts = () => {
    const debts = [...(financialData.debts || [])];
    
    if (selectedStrategy === 'avalanche') {
      // Highest interest rate first
      return debts.sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
    } else {
      // Snowball: Smallest balance first
      return debts.sort((a, b) => a.amount - b.amount);
    }
  };

  const handleAddDebt = () => {
    if (!debtName || !debtAmount) {
      Alert.alert('Missing Information', 'Please enter debt name and amount');
      return;
    }

    const newDebt = {
      id: Date.now().toString(),
      name: debtName,
      amount: parseFloat(debtAmount),
      interestRate: parseFloat(interestRate) || 0,
      plannedPayment: 0 // Will be set when user creates payment plan
    };

    if (editingDebt) {
      // Editing existing debt - use handleUpdateItem
      const updatedDebt = { ...newDebt, id: editingDebt.id };
      if (handlers.handleUpdateItem) {
        handlers.handleUpdateItem('debt', updatedDebt);
      }
    } else {
      // Adding new debt - use handleAddDebt
      if (handlers.handleAddDebt) {
        handlers.handleAddDebt(newDebt);
      }
    }

    // Reset form
    setDebtName('');
    setDebtAmount('');
    setInterestRate('');
    setEditingDebt(null);
    setShowAddDebtModal(false);
  };

  const handleDeleteDebt = (debtId) => {
    Alert.alert(
      'Delete Debt',
      'Are you sure you want to delete this debt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (handlers.handleDeleteItem) {
              handlers.handleDeleteItem('debt', debtId);
            } else if (handlers.saveCurrentFinancialData) {
              const updatedDebts = financialData.debts.filter(d => d.id !== debtId);
              const updatedFinancialData = {
                ...financialData,
                debts: updatedDebts
              };
              handlers.saveCurrentFinancialData(updatedFinancialData);
            }
          }
        }
      ]
    );
  };

  const startEditDebt = (debt) => {
    setEditingDebt(debt);
    setDebtName(debt.name);
    setDebtAmount(debt.amount.toString());
    setInterestRate(debt.interestRate?.toString() || '');
    setShowAddDebtModal(true);
  };

  return (
    <Animated.View style={[
      styles.container,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Debt Management
          </Text>
          <View style={styles.strategySelector}>
            <TouchableOpacity
              style={[
                styles.strategyButton,
                selectedStrategy === 'avalanche' && styles.strategyButtonActive
              ]}
              onPress={() => setSelectedStrategy('avalanche')}
            >
              <Text style={[
                styles.strategyButtonText,
                selectedStrategy === 'avalanche' && styles.strategyButtonTextActive
              ]}>
                Avalanche
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.strategyButton,
                selectedStrategy === 'snowball' && styles.strategyButtonActive
              ]}
              onPress={() => setSelectedStrategy('snowball')}
            >
              <Text style={[
                styles.strategyButtonText,
                selectedStrategy === 'snowball' && styles.strategyButtonTextActive
              ]}>
                Snowball
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Key Metrics Cards */}
        <View style={styles.metricsContainer}>
          {/* Total Debt Card */}
          <TouchableOpacity style={[styles.metricCard, styles.totalDebtCard, { backgroundColor: theme.card }]}>
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.1)', 'transparent']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.metricHeader}>
              <Ionicons name="trending-down" size={20} color="#ef4444" />
              <Text style={styles.metricLabel}>Total Debt</Text>
            </View>
            <Text style={[styles.metricValue, { color: '#ef4444' }]}>
              {formatCurrency(metrics.totalDebt)}
            </Text>
            <Text style={styles.metricSubtext}>
              {metrics.debtCount} {metrics.debtCount === 1 ? 'debt' : 'debts'}
            </Text>
          </TouchableOpacity>

          {/* Interest Rate Card */}
          <TouchableOpacity style={[styles.metricCard, styles.interestCard, { backgroundColor: theme.card }]}>
            <LinearGradient
              colors={['rgba(251, 146, 60, 0.1)', 'transparent']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.metricHeader}>
              <Ionicons name="analytics" size={20} color="#fb923c" />
              <Text style={styles.metricLabel}>Avg Rate</Text>
            </View>
            <Text style={[styles.metricValue, { color: '#fb923c' }]}>
              {metrics.weightedRate.toFixed(1)}%
            </Text>
            <Text style={styles.metricSubtext}>
              weighted avg
            </Text>
          </TouchableOpacity>
        </View>

        {/* Monthly Debt Payment Plan Card */}
        <TouchableOpacity 
          key={`payment-plan-${refreshKey}`}
          style={[styles.paymentPlanCard, { backgroundColor: theme.card }]}
          onPress={() => {
            // Initialize with stored allocation, not calculated total
            const storedAllocation = financialData.totalDebtAllocation || 0;
            setTotalDebtPayment(storedAllocation > 0 ? storedAllocation.toString() : '');
            setPaymentFrequency(financialData.debtPaymentFrequency || 'monthly');
            setShowPaymentPlanModal(true);
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.1)', 'transparent']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.paymentPlanHeader}>
            <View style={styles.paymentPlanTitleRow}>
              <Ionicons name="calendar" size={20} color="#10b981" />
              <Text style={[styles.paymentPlanTitle, { color: theme.text }]}>
                {(financialData.debtPaymentFrequency || 'monthly') === 'monthly' ? 'Monthly' : 'Fortnightly'} Debt Payment Plan
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#10b981" />
          </View>
          
          <View style={styles.paymentPlanContent}>
            <View style={styles.paymentPlanMain}>
              <Text style={styles.paymentPlanLabel}>
                Total {(financialData.debtPaymentFrequency || 'monthly') === 'monthly' ? 'Monthly' : 'Fortnightly'} Allocation
              </Text>
              <Text style={[styles.paymentPlanAmount, { color: '#10b981' }]}>
                {formatCurrency(financialData.totalDebtAllocation || 0)}
              </Text>
            </View>
            
            <View style={styles.paymentPlanBreakdown}>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Strategy</Text>
                <Text style={[styles.breakdownValue, { color: theme.text }]}>
                  {selectedStrategy === 'avalanche' ? 'Avalanche' : 'Snowball'}
                </Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Focus Payment</Text>
                <Text style={[styles.breakdownValue, { color: '#10b981' }]}>
                  {formatCurrency(financialData.totalDebtAllocation || 0)}
                </Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Debt Free By</Text>
                <Text style={[styles.breakdownValue, { color: '#10b981', fontWeight: '600' }]}>
                  {metrics.debtFreeDate 
                    ? metrics.debtFreeDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : 'Set Plan'}
                </Text>
              </View>
            </View>
            
            {(financialData.totalDebtAllocation || 0) > 0 && (
              <View style={styles.savingsHighlight}>
                <Ionicons name="trending-up" size={14} color="#10b981" />
                <Text style={styles.savingsText}>
                  Consistent payments will help you become debt-free faster
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Secondary Metrics Row */}
        <View style={styles.secondaryMetrics}>
          <View style={[styles.secondaryCard, { backgroundColor: theme.surface || theme.card }]}>
            <Text style={styles.secondaryLabel}>Total Debt</Text>
            <Text style={[styles.secondaryValue, { color: '#ef4444' }]}>
              {formatCurrency(metrics.totalDebt)}
            </Text>
          </View>
          <View style={[styles.secondaryCard, { backgroundColor: theme.surface || theme.card }]}>
            <Text style={styles.secondaryLabel}>Annual Interest</Text>
            <Text style={[styles.secondaryValue, { color: '#ef4444' }]}>
              {formatCurrency(metrics.annualInterest)}
            </Text>
          </View>
          <View style={[styles.secondaryCard, { backgroundColor: theme.surface || theme.card }]}>
            <Text style={styles.secondaryLabel}>Payoff Time</Text>
            <Text style={[styles.secondaryValue, { color: theme.text }]}>
              {metrics.monthsToPayoff > 0 
                ? `${Math.floor(metrics.monthsToPayoff / 12)}y ${metrics.monthsToPayoff % 12}m`
                : 'Set Plan'}
            </Text>
          </View>
        </View>

        {/* Strategy Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <View style={styles.infoHeader}>
            <Ionicons 
              name="information-circle" 
              size={20} 
              color={selectedStrategy === 'avalanche' ? '#3b82f6' : '#10b981'} 
            />
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              {selectedStrategy === 'avalanche' ? 'Avalanche Method' : 'Snowball Method'}
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            {selectedStrategy === 'avalanche' 
              ? 'Pay off debts with the highest interest rates first. This saves you the most money by eliminating expensive interest charges.'
              : 'Pay off smallest debts first for quick wins and psychological momentum.'}
          </Text>
        </View>

        {/* Debt List */}
        <View style={styles.debtList}>
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: theme.text }]}>
              Your Debts
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddDebtModal(true)}
            >
              <Ionicons name="add-circle" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {getSortedDebts().map((debt, index) => (
            <TouchableOpacity
              key={debt.id}
              style={[styles.debtItem, { backgroundColor: theme.card }]}
              onPress={() => startEditDebt(debt)}
              onLongPress={() => handleDeleteDebt(debt.id)}
            >
              <View style={styles.debtPriority}>
                <Text style={styles.priorityNumber}>{index + 1}</Text>
              </View>
              
              <View style={styles.debtContent}>
                <View style={styles.debtHeader}>
                  <Text style={[styles.debtName, { color: theme.text }]}>
                    {debt.name}
                  </Text>
                  <Text style={[styles.debtAmount, { color: theme.text }]}>
                    {formatCurrency(debt.amount)}
                  </Text>
                </View>
                
                <View style={styles.debtDetails}>
                  <View style={styles.debtDetailItem}>
                    <Text style={styles.debtDetailLabel}>Interest Rate</Text>
                    <Text style={[styles.debtDetailValue, { color: theme.text }]}>
                      {debt.interestRate || 0}%
                    </Text>
                  </View>
                  <View style={styles.debtDetailItem}>
                    <Text style={styles.debtDetailLabel}>Annual Interest</Text>
                    <Text style={[styles.debtDetailValue, { color: '#ef4444' }]}>
                      {formatCurrency(debt.amount * (debt.interestRate || 0) / 100)}
                    </Text>
                  </View>
                  <View style={styles.debtDetailItem}>
                    <Text style={styles.debtDetailLabel}>Priority</Text>
                    <Text style={[styles.debtDetailValue, { color: '#10b981' }]}>
                      #{index + 1}
                    </Text>
                  </View>
                </View>

                {/* Show payoff time for priority #1 debt only */}
                {index === 0 && (financialData.totalDebtAllocation || 0) > 0 && (
                  <View style={[styles.priorityPayoffSection, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <View style={styles.priorityPayoffHeader}>
                      <Ionicons name="flash" size={14} color="#10b981" />
                      <Text style={[styles.priorityPayoffLabel, { color: '#10b981' }]}>
                        Focus Debt - Estimated Payoff
                      </Text>
                    </View>
                    <Text style={[styles.priorityPayoffTime, { color: '#10b981' }]}>
                      {(() => {
                        const monthlyRate = (debt.interestRate || 0) / 100 / 12;
                        const totalAllocation = financialData.totalDebtAllocation || 0;
                        const balance = debt.amount || 0;
                        
                        if (totalAllocation <= 0) {
                          return 'Set payment plan';
                        }
                        
                        let months = 0;
                        
                        if (monthlyRate === 0) {
                          // No interest, simple division
                          months = Math.ceil(balance / totalAllocation);
                        } else {
                          // With interest, use proper loan payoff formula
                          if (totalAllocation <= balance * monthlyRate) {
                            return 'Payment too low';
                          }
                          months = Math.ceil(
                            Math.log(1 + (balance * monthlyRate) / totalAllocation) / 
                            Math.log(1 + monthlyRate)
                          );
                        }
                        
                        // Ensure positive result
                        months = Math.abs(months);
                        const years = Math.floor(months / 12);
                        const remainingMonths = months % 12;
                        
                        if (years === 0) {
                          return `${remainingMonths} months`;
                        } else if (remainingMonths === 0) {
                          return `${years} years`;
                        } else {
                          return `${years}y ${remainingMonths}mo`;
                        }
                      })()}
                    </Text>
                  </View>
                )}

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: '0%',
                          backgroundColor: index === 0 ? '#3b82f6' : '#94a3b8'
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {financialData.debts?.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={48} color="#10b981" />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Debt Free!
              </Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                You have no debts. Keep it that way!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Debt Modal */}
      <Modal
        visible={showAddDebtModal}
        transparent
        animationType="slide"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {editingDebt ? 'Edit Debt' : 'Add New Debt'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowAddDebtModal(false);
                  setEditingDebt(null);
                  setDebtName('');
                  setDebtAmount('');
                  setInterestRate('');
                }}>
                  <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                  Debt Name
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  value={debtName}
                  onChangeText={setDebtName}
                  placeholder="e.g., Credit Card, Student Loan"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                  Current Balance
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  value={debtAmount}
                  onChangeText={setDebtAmount}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                  Interest Rate (%)
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  value={interestRate}
                  onChangeText={setInterestRate}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddDebt}
              >
                <Text style={styles.saveButtonText}>
                  {editingDebt ? 'Update Debt' : 'Add Debt'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Simple Payment Plan Modal */}
      <Modal
        visible={showPaymentPlanModal}
        transparent
        animationType="slide"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Set Debt Payment Plan
                </Text>
                <TouchableOpacity onPress={() => setShowPaymentPlanModal(false)}>
                  <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                  Payment Frequency
                </Text>
                <View style={styles.frequencySelector}>
                  <TouchableOpacity
                    style={[
                      styles.frequencyButton,
                      paymentFrequency === 'monthly' && styles.frequencyButtonActive
                    ]}
                    onPress={() => setPaymentFrequency('monthly')}
                  >
                    <Text style={[
                      styles.frequencyButtonText,
                      paymentFrequency === 'monthly' && styles.frequencyButtonTextActive
                    ]}>
                      Monthly
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.frequencyButton,
                      paymentFrequency === 'fortnightly' && styles.frequencyButtonActive
                    ]}
                    onPress={() => setPaymentFrequency('fortnightly')}
                  >
                    <Text style={[
                      styles.frequencyButtonText,
                      paymentFrequency === 'fortnightly' && styles.frequencyButtonTextActive
                    ]}>
                      Fortnightly
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                  Total {paymentFrequency === 'monthly' ? 'Monthly' : 'Fortnightly'} Payment
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                    fontSize: 18,
                    fontWeight: '600',
                    textAlign: 'center'
                  }]}
                  value={totalDebtPayment}
                  onChangeText={(text) => {
                    // Remove leading zeros but keep single "0" or "0."
                    let cleanText = text.replace(/^0+(?=\d)/, '');
                    setTotalDebtPayment(cleanText);
                  }}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
                <Text style={[styles.formHint, { color: theme.textSecondary }]}>
                  This amount will be split equally across all your debts
                </Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                  Total Debt Payment Allocation
                </Text>
                <Text style={[styles.summaryHighlight, { color: '#10b981' }]}>
                  {formatCurrency(parseFloat(totalDebtPayment || '0'))}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={async () => {
                  const totalPayment = parseFloat(totalDebtPayment) || 0;
                  
                  if (totalPayment > 0 && financialData.debts?.length > 0) {
                    console.log('Setting payment plan:', totalPayment, 'for', financialData.debts.length, 'debts');
                    
                    // Distribute the total payment across debts
                    const updatedDebts = financialData.debts.map(debt => {
                      // If we only have one debt, give it all the payment
                      if (financialData.debts.length === 1) {
                        return { ...debt, plannedPayment: totalPayment };
                      }
                      
                      // Otherwise, distribute equally across all debts
                      const plannedPayment = totalPayment / financialData.debts.length;
                      
                      return { ...debt, plannedPayment: Math.round(plannedPayment * 100) / 100 };
                    });

                    console.log('Updated debts:', updatedDebts.map(d => ({ name: d.name, planned: d.plannedPayment })));

                    // Save the updated financial data with the user's total allocation
                    const updatedFinancialData = {
                      ...financialData,
                      debts: updatedDebts,
                      totalDebtAllocation: totalPayment, // Store user's actual input
                      debtPaymentFrequency: paymentFrequency
                    };

                    console.log('About to save updated debts:', updatedDebts.map(d => ({ name: d.name, planned: d.plannedPayment })));
                    console.log('Current financialData in component:', financialData.debts?.map(d => ({ name: d.name, planned: d.plannedPayment })));

                    // Update parent state IMMEDIATELY
                    if (handlers.setFinancialData) {
                      handlers.setFinancialData(updatedFinancialData);
                      console.log('✅ Immediately updated parent state');
                    }

                    // Also save to storage
                    if (handlers.saveCurrentFinancialData) {
                      await handlers.saveCurrentFinancialData(updatedFinancialData);
                      console.log('✅ Successfully saved payment plan to storage');
                    } else {
                      console.log('❌ No save handler available');
                    }
                  }
                  setShowPaymentPlanModal(false);
                }}
              >
                <Text style={styles.saveButtonText}>
                  Set Payment Plan
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  strategySelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    padding: 3,
  },
  strategyButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
  },
  strategyButtonActive: {
    backgroundColor: '#3b82f6',
  },
  strategyButtonText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  strategyButtonTextActive: {
    color: '#ffffff',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  totalDebtCard: {
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  interestCard: {
    borderWidth: 1,
    borderColor: 'rgba(251, 146, 60, 0.2)',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 11,
    color: '#94a3b8',
  },
  secondaryMetrics: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  secondaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  secondaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  strategyExample: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  strategyExampleText: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  debtList: {
    marginBottom: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 4,
  },
  debtItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  debtPriority: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  priorityNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  debtContent: {
    flex: 1,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  debtName: {
    fontSize: 16,
    fontWeight: '600',
  },
  debtAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  debtDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  debtDetailItem: {
    flex: 1,
  },
  debtDetailLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  debtDetailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  priorityPayoffSection: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  priorityPayoffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  priorityPayoffLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityPayoffTime: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
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
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  formHint: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  frequencySelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#3b82f6',
  },
  frequencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  frequencyButtonTextActive: {
    color: '#ffffff',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryHighlight: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Payment Plan Card Styles
  paymentPlanCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    position: 'relative',
  },
  paymentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentPlanTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentPlanTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editPlanButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentPlanContent: {
    gap: 16,
  },
  paymentPlanMain: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.1)',
  },
  paymentPlanLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  paymentPlanAmount: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  paymentPlanBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  savingsHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.1)',
  },
  savingsText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default DebtTabRevamped;