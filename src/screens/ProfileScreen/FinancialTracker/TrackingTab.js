// src/screens/ProfileScreen/FinancialTracker/TrackingTab.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentMonth, getMonthDisplayName, hasUnsavedCurrentMonthData } from './utils';
import { LinearGradient } from 'expo-linear-gradient';

// Import existing components we'll consolidate
import CashFlowTab from './CashFlowTab';
import HistoryTabRevamped from './HistoryTabRevamped';
import IncomeTab from './IncomeTab';
import ExpensesTab from './ExpensesTab';

const { width, height } = Dimensions.get('window');

// Quick Add Modal Component
const QuickAddModal = ({ visible, onClose, onSave, onDelete, type, theme, editingItem = null }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  // Set initial values when editing
  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || '');
      setAmount(editingItem.amount ? editingItem.amount.toString() : '');
    } else {
      setName('');
      setAmount('');
    }
  }, [editingItem]);

  const handleSave = () => {
    console.log('🔵 QuickAddModal handleSave called:', { name, amount, type, editingItem: !!editingItem });
    
    if (!amount.trim()) {
      Alert.alert('Error', 'Please enter an amount.');
      return;
    }
    
    // Use smart default if no name provided
    const finalName = name.trim() || (type === 'income' ? 'Income' : 'Expense');
    
    console.log('🔵 QuickAddModal calling onSave:', { finalName, amount: parseFloat(amount), type });
    onSave(finalName, parseFloat(amount), editingItem);
    setName('');
    setAmount('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setAmount('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.quickModalOverlay}>
        <View style={styles.quickModalContent}>
          <Text style={styles.quickModalTitle}>
            {editingItem ? 'Edit' : 'Add'} {type === 'income' ? 'Income Source' : 'Expense'}
          </Text>
          
          <TextInput
            style={styles.quickModalInput}
            placeholder={type === 'income' ? 'Income source name (optional)' : 'Expense name (optional)'}
            placeholderTextColor="#666666"
            value={name}
            onChangeText={setName}
          />
          
          <TextInput
            style={styles.quickModalInput}
            placeholder="Amount"
            placeholderTextColor="#666666"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            autoFocus
          />
          
          <View style={styles.quickModalActions}>
            <TouchableOpacity style={styles.quickModalCancel} onPress={handleClose}>
              <Text style={styles.quickModalCancelText}>Cancel</Text>
            </TouchableOpacity>
            {editingItem && onDelete && (
              <TouchableOpacity 
                style={styles.quickModalDelete} 
                onPress={() => {
                  Alert.alert(
                    'Delete Item',
                    `Are you sure you want to delete "${editingItem.name}"?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Delete', 
                        style: 'destructive',
                        onPress: () => {
                          onDelete(editingItem);
                          handleClose();
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={styles.quickModalDeleteText}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.quickModalSave} onPress={handleSave}>
              <Text style={styles.quickModalSaveText}>{editingItem ? 'Update' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Inline Income View - Optimized for Expandable Section
const InlineIncomeView = ({ theme, data, handlers }) => {
  const { financialData, formatCurrency } = data;
  const incomeSources = financialData?.incomeSources || [];
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleAddIncome = () => {
    setShowQuickAdd(true);
  };

  const handleQuickSave = async (name, amount, editingItem) => {
    console.log('🟢 InlineIncomeView handleQuickSave called:', { name, amount, editingItem: !!editingItem });
    
    if (editingItem) {
      // Update existing income
      console.log('🟢 Calling quickUpdateIncome');
      if (handlers?.quickUpdateIncome) {
        await handlers.quickUpdateIncome(editingItem.id, name, amount, editingItem.type);
      }
      setEditingItem(null);
    } else {
      // Add new income
      console.log('🟢 Calling quickAddIncome');
      if (handlers?.quickAddIncome) {
        await handlers.quickAddIncome(name, amount, 'primary');
      }
    }
  };

  const handleEditIncome = (income) => {
    setEditingItem(income);
    setShowQuickAdd(true);
  };

  const handleDeleteIncome = (income) => {
    if (handlers?.handleDeleteItem) {
      handlers.handleDeleteItem('income', income.id);
    }
  };

  return (
    <View style={styles.inlineContainer}>
      {incomeSources.length > 0 ? (
        <>
          {incomeSources.map((income, index) => (
            <TouchableOpacity
              key={index}
              style={styles.inlineItem}
              onPress={() => handleEditIncome(income)}
              activeOpacity={0.7}
            >
              <View style={styles.inlineItemLeft}>
                <View style={[styles.inlineIcon, { backgroundColor: '#0D2020' }]}>
                  <Ionicons name="trending-up" size={16} color="#00D4AA" />
                </View>
                <View style={styles.inlineItemContent}>
                  <Text style={styles.inlineItemName}>{income.name}</Text>
                  <Text style={styles.inlineItemType}>{income.type || 'Income'}</Text>
                </View>
              </View>
              <Text style={[styles.inlineItemAmount, { color: '#00D4AA' }]}>
                {formatCurrency(income.amount)}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="trending-up-outline" size={32} color="#333333" />
          <Text style={styles.emptyText}>No income sources added</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddIncome}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={18} color="#00D4AA" />
        <Text style={styles.addButtonText}>Add Income Source</Text>
      </TouchableOpacity>
      
      <QuickAddModal
        visible={showQuickAdd}
        onClose={() => {
          setShowQuickAdd(false);
          setEditingItem(null);
        }}
        onSave={handleQuickSave}
        onDelete={handleDeleteIncome}
        type="income"
        theme={theme}
        editingItem={editingItem}
      />
    </View>
  );
};

// Inline Expense View - Optimized for Expandable Section
const InlineExpenseView = ({ theme, data, handlers }) => {
  const { financialData, formatCurrency } = data;
  const expenses = financialData?.expenses || [];
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleAddExpense = () => {
    setShowQuickAdd(true);
  };

  const handleQuickSave = async (name, amount, editingItem) => {
    console.log('🔴 InlineExpenseView handleQuickSave called:', { name, amount, editingItem: !!editingItem });
    
    if (editingItem) {
      // Update existing expense
      console.log('🔴 Calling quickUpdateExpense');
      if (handlers?.quickUpdateExpense) {
        await handlers.quickUpdateExpense(editingItem.id, name, amount, editingItem.category);
      }
      setEditingItem(null);
    } else {
      // Add new expense
      console.log('🔴 Calling quickAddExpense');
      if (handlers?.quickAddExpense) {
        await handlers.quickAddExpense(name, amount, 'general');
      }
    }
  };

  const handleEditExpense = (expense) => {
    setEditingItem(expense);
    setShowQuickAdd(true);
  };

  const handleDeleteExpense = (expense) => {
    if (handlers?.handleDeleteItem) {
      handlers.handleDeleteItem('expense', expense.id);
    }
  };

  return (
    <View style={styles.inlineContainer}>
      {expenses.length > 0 ? (
        <>
          {expenses.map((expense, index) => (
            <TouchableOpacity
              key={index}
              style={styles.inlineItem}
              onPress={() => handleEditExpense(expense)}
              activeOpacity={0.7}
            >
              <View style={styles.inlineItemLeft}>
                <View style={[styles.inlineIcon, { backgroundColor: '#2A1515' }]}>
                  <Ionicons name="trending-down" size={16} color="#FF6B6B" />
                </View>
                <View style={styles.inlineItemContent}>
                  <Text style={styles.inlineItemName}>{expense.name}</Text>
                  <Text style={styles.inlineItemType}>{expense.category || 'Expense'}</Text>
                </View>
              </View>
              <Text style={[styles.inlineItemAmount, { color: '#FF6B6B' }]}>
                {formatCurrency(expense.amount)}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="trending-down-outline" size={32} color="#333333" />
          <Text style={styles.emptyText}>No expenses added</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddExpense}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={18} color="#FF6B6B" />
        <Text style={styles.addButtonText}>Add Expense</Text>
      </TouchableOpacity>
      
      <QuickAddModal
        visible={showQuickAdd}
        onClose={() => {
          setShowQuickAdd(false);
          setEditingItem(null);
        }}
        onSave={handleQuickSave}
        onDelete={handleDeleteExpense}
        type="expense"
        theme={theme}
        editingItem={editingItem}
      />
    </View>
  );
};

// Simple Income vs Expenses Chart Component
const IncomeExpensesChart = ({ totalIncome, totalExpenses, formatCurrency }) => {
  const barAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  const maxValue = Math.max(totalIncome, totalExpenses) || 1;
  const incomeHeight = (totalIncome / maxValue) * 120;
  const expenseHeight = (totalExpenses / maxValue) * 120;

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Ionicons name="bar-chart-outline" size={20} color="#007AFF" />
        <Text style={styles.chartTitle}>Income vs Expenses</Text>
      </View>
      
      <View style={styles.barsContainer}>
        <View style={styles.barColumn}>
          <Text style={styles.barLabel}>Income</Text>
          <View style={styles.barBackground}>
            <Animated.View 
              style={[
                styles.barFill,
                styles.incomeBar,
                {
                  height: barAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, incomeHeight]
                  })
                }
              ]}
            />
          </View>
          <Text style={styles.barValue}>{formatCurrency(totalIncome)}</Text>
        </View>
        
        <View style={styles.barColumn}>
          <Text style={styles.barLabel}>Expenses</Text>
          <View style={styles.barBackground}>
            <Animated.View 
              style={[
                styles.barFill,
                styles.expenseBar,
                {
                  height: barAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, expenseHeight]
                  })
                }
              ]}
            />
          </View>
          <Text style={styles.barValue}>{formatCurrency(totalExpenses)}</Text>
        </View>
      </View>
      
      <View style={styles.netFlow}>
        <Text style={styles.netFlowLabel}>Net Cash Flow</Text>
        <Text style={[
          styles.netFlowValue,
          { color: (totalIncome - totalExpenses) >= 0 ? '#00D4AA' : '#FF6B6B' }
        ]}>
          {formatCurrency(totalIncome - totalExpenses)}
        </Text>
      </View>
    </View>
  );
};

// Unified Cash Flow View Component - Space Efficient Design
const UnifiedCashFlowView = ({ 
  theme, 
  data, 
  handlers, 
  initialExpandedSection, 
  selectedDate, 
  canGoToPreviousMonth, 
  canGoToNextMonth, 
  goToPreviousMonth, 
  goToNextMonth 
}) => {
  const [expandedSection, setExpandedSection] = useState(initialExpandedSection || null); // 'income', 'expenses', or null
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [saveState, setSaveState] = useState(null); // 'confirming', 'saving', 'success', null
  
  // Check if the viewed month data already exists in history
  const viewedMonthString = selectedDate ? 
    `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}` : 
    getCurrentMonth();
  const currentMonthString = getCurrentMonth();
  
  // For current month: check if it exists in history (has been saved before)
  // For past months: always check if they exist in history
  const viewedMonthExistsInHistory = data.financialData?.monthlyHistory?.some(
    item => item.month === viewedMonthString
  ) || false;
  
  // The key insight: 
  // - For CURRENT month: check if month exists in monthlyHistory (has been saved before)
  // - For HISTORICAL months: check if month exists in monthlyHistory (has data saved)
  // Adding income/expenses to current month should NOT change this until you save
  const shouldShowUpdateButton = viewedMonthExistsInHistory;

  // Update expanded section when prop changes
  useEffect(() => {
    if (initialExpandedSection) {
      setExpandedSection(initialExpandedSection);
    }
  }, [initialExpandedSection]);

  const toggleSection = (section) => {
    Animated.timing(fadeAnim, {
      toValue: 0.7,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setExpandedSection(expandedSection === section ? null : section);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  // Auto-reset success state after 2 seconds
  useEffect(() => {
    if (saveState === 'success') {
      const timer = setTimeout(() => {
        setSaveState(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveState]);

  const handleSaveMonth = async () => {
    try {
      // Call the actual save function without alerts
      if (handlers?.saveCurrentMonth) {
        // We'll modify the main function to not show alerts when called from here
        await handlers.saveCurrentMonth(true); // Pass flag to skip alerts
      }
      setSaveState('success');
    } catch (error) {
      console.error('Error saving month:', error);
      setSaveState(null);
    }
  };

  const { totalIncome, totalExpenses, formatCurrency } = data;

  return (
    <ScrollView 
      style={styles.unifiedContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.unifiedContent}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* 1. Current Period Card - Enhanced Design */}
        <View style={styles.currentPeriodCard}>
          {/* Main Period Display */}
          <View style={styles.periodDisplayContainer}>
            <View style={styles.periodTextContainer}>
              <Text style={styles.periodTypeLabel}>
                {selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear() 
                  ? 'Current Period' : 'Historical Data'}
              </Text>
              <Text style={styles.periodMonthYear}>
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
            </View>
            
            {/* Navigation Controls */}
            <View style={styles.navigationControls}>
              <TouchableOpacity 
                style={[styles.navArrow, !canGoToPreviousMonth() && styles.navArrowDisabled]}
                onPress={goToPreviousMonth}
                disabled={!canGoToPreviousMonth()}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="chevron-back" 
                  size={18} 
                  color={canGoToPreviousMonth() ? "#FFFFFF" : "#444444"} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.navArrow, !canGoToNextMonth() && styles.navArrowDisabled]}
                onPress={goToNextMonth}
                disabled={!canGoToNextMonth()}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={18} 
                  color={canGoToNextMonth() ? "#FFFFFF" : "#444444"} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.periodDivider} />

          {/* Save Action Area */}
          <View style={styles.saveActionArea}>
            {saveState === 'confirming' && shouldShowUpdateButton ? (
              <View style={styles.confirmationRow}>
                <View style={styles.confirmationTextContainer}>
                  <Ionicons name="warning-outline" size={16} color="#FF9500" />
                  <Text style={styles.confirmationText}>Update existing data?</Text>
                </View>
                <View style={styles.confirmationActions}>
                  <TouchableOpacity
                    style={styles.confirmationCancel}
                    onPress={() => setSaveState(null)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmationCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmationConfirm}
                    onPress={() => {
                      setSaveState('saving');
                      handleSaveMonth();
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmationConfirmText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : saveState === 'saving' ? (
              <View style={styles.statusRow}>
                <Ionicons name="sync" size={16} color="#007AFF" />
                <Text style={styles.statusText}>Saving changes...</Text>
              </View>
            ) : saveState === 'success' ? (
              <View style={styles.statusRow}>
                <Ionicons name="checkmark-circle" size={16} color="#00D4AA" />
                <Text style={[styles.statusText, { color: '#00D4AA' }]}>
                  {shouldShowUpdateButton ? 'Successfully updated!' : 'Successfully saved!'}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  shouldShowUpdateButton && styles.updateButton
                ]}
                onPress={() => {
                  if (shouldShowUpdateButton) {
                    setSaveState('confirming');
                  } else {
                    setSaveState('saving');
                    handleSaveMonth();
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name={shouldShowUpdateButton ? "refresh" : "save"} 
                  size={16} 
                  color="#FFFFFF" 
                />
                <Text style={styles.saveButtonText}>
                  {shouldShowUpdateButton ? "Update Month" : "Save Month"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 2. Net Worth Card - Second */}
        <View style={styles.netFlowCard}>
          <View style={styles.netFlowHeader}>
            <View style={styles.netFlowIcon}>
              <Ionicons 
                name="trending-up" 
                size={18} 
                color={(totalIncome - totalExpenses) >= 0 ? '#00D4AA' : '#FF6B6B'}
              />
            </View>
            <Text style={styles.netFlowLabel}>
              Net Cash Flow
            </Text>
          </View>
          <Text style={[
            styles.netFlowAmount,
            { color: (totalIncome - totalExpenses) >= 0 ? '#00D4AA' : '#FF6B6B' }
          ]}>
            {formatCurrency((totalIncome || 0) - (totalExpenses || 0))}
          </Text>
        </View>

        {/* 3. Income Section - Third */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity 
            style={[styles.sectionCard, styles.incomeCard]}
            onPress={() => toggleSection('income')}
            activeOpacity={0.8}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="trending-up" size={18} color="#00D4AA" />
              </View>
              <Text style={styles.sectionLabel}>Income Sources</Text>
              <Ionicons 
                name={expandedSection === 'income' ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color="#666666" 
              />
            </View>
            <Text style={[styles.sectionAmount, { color: '#00D4AA' }]}>
              {formatCurrency(totalIncome || 0)}
            </Text>
          </TouchableOpacity>

          {/* Income Expanded Content - Appears directly below */}
          {expandedSection === 'income' && (
            <View style={styles.expandedSection}>
              <Text style={styles.expandedTitle}>Income Sources</Text>
              <InlineIncomeView theme={theme} data={data} handlers={handlers} />
            </View>
          )}
        </View>

        {/* 4. Expenses Section - Fourth */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity 
            style={[styles.sectionCard, styles.expenseCard]}
            onPress={() => toggleSection('expenses')}
            activeOpacity={0.8}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name="trending-down" size={18} color="#FF6B6B" />
              </View>
              <Text style={styles.sectionLabel}>Expenses</Text>
              <Ionicons 
                name={expandedSection === 'expenses' ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color="#666666" 
              />
            </View>
            <Text style={[styles.sectionAmount, { color: '#FF6B6B' }]}>
              {formatCurrency(totalExpenses || 0)}
            </Text>
          </TouchableOpacity>

          {/* Expenses Expanded Content - Appears directly below */}
          {expandedSection === 'expenses' && (
            <View style={styles.expandedSection}>
              <Text style={styles.expandedTitle}>Expense Categories</Text>
              <InlineExpenseView theme={theme} data={data} handlers={handlers} />
            </View>
          )}
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const TrackingTab = React.forwardRef(({ theme, data, handlers, pendingExpandSection }, ref) => {

  const [viewMode, setViewMode] = useState('current'); // 'current' or 'history'
  const [selectedDate, setSelectedDate] = useState(new Date()); // Current viewing month
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [saveState, setSaveState] = useState(null); // 'confirming', 'saving', 'success', null
  const [showChart, setShowChart] = useState(false); // Toggle for chart view
  

  // Month navigation functions
  const canGoToPreviousMonth = () => {
    return true; // Can always go back in history
  };

  const canGoToNextMonth = () => {
    const today = new Date();
    const nextMonth = new Date(selectedDate);
    nextMonth.setMonth(selectedDate.getMonth() + 1);
    return nextMonth <= today; // Can't go into the future
  };

  const goToPreviousMonth = () => {
    if (canGoToPreviousMonth()) {
      const prevMonth = new Date(selectedDate);
      prevMonth.setMonth(selectedDate.getMonth() - 1);
      setSelectedDate(prevMonth);
    }
  };

  const goToNextMonth = () => {
    if (canGoToNextMonth()) {
      const nextMonth = new Date(selectedDate);
      nextMonth.setMonth(selectedDate.getMonth() + 1);
      setSelectedDate(nextMonth);
    }
  };
  const [expandedSection, setExpandedSection] = useState(null); // For navigation from Overview tab
  const [currentMonthData, setCurrentMonthData] = useState(null); // Store loaded month data
  
  // Check if current month data already exists in history
  const currentMonth = getCurrentMonth();
  const currentMonthExistsInHistory = data.financialData?.monthlyHistory?.some(
    item => item.month === currentMonth
  ) || false;

  // Function to load historical month data
  const loadMonthData = (targetDate) => {
    const targetMonthString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthString = getCurrentMonth();
    
    // If viewing current month, return null to use live data
    if (targetMonthString === currentMonthString) {
      setCurrentMonthData(null);
      return;
    }
    
    // Find historical data for this month
    const historicalData = data.financialData?.monthlyHistory?.find(
      item => item.month === targetMonthString
    );
    
    if (historicalData) {
      // Load individual items from historical data (if available)
      const monthData = {
        incomeSources: historicalData.incomeSources || [], // Load historical income sources
        expenses: historicalData.expenseItems || [],      // Load historical expenses
        totalIncome: historicalData.income || 0,
        totalExpenses: historicalData.expenses || 0,
        isHistorical: true,
        monthString: targetMonthString // Store which month this data belongs to
      };
      setCurrentMonthData(monthData);
    } else {
      // No data for this month - create editable empty month
      const monthData = {
        incomeSources: [],
        expenses: [],
        totalIncome: 0,
        totalExpenses: 0,
        isHistorical: true, // Mark as historical so it uses historical handlers
        monthString: targetMonthString, // Store which month this data belongs to
        isEmpty: true // Flag to indicate this month has no saved data yet
      };
      setCurrentMonthData(monthData);
    }
  };

  
  // Historical editing functions - moved to main component scope
  const updateHistoricalMonth = (monthString, updateFn) => {
    if (!handlers?.setFinancialData) return;
    
    const currentFinancialData = data.financialData;
    const monthlyHistory = currentFinancialData?.monthlyHistory || [];
    
    // Check if month exists in history
    const existingMonthIndex = monthlyHistory.findIndex(month => month.month === monthString);
    
    let updatedHistory;
    if (existingMonthIndex >= 0) {
      // Update existing month
      updatedHistory = monthlyHistory.map(month => {
        if (month.month === monthString) {
          const updatedMonth = updateFn(month);
          // Recalculate totals
          const newTotalIncome = (updatedMonth.incomeSources || []).reduce((sum, income) => 
            sum + parseFloat(income.amount || 0), 0);
          const newTotalExpenses = (updatedMonth.expenseItems || []).reduce((sum, expense) => {
            if (expense.type === 'recurring') {
              return sum + parseFloat(expense.amount || 0);
            }
            return sum;
          }, 0);
          
          return {
            ...updatedMonth,
            income: newTotalIncome,
            expenses: newTotalExpenses,
            netGain: newTotalIncome - newTotalExpenses
          };
        }
        return month;
      });
    } else {
      // Create new month entry
      const newMonth = updateFn({
        month: monthString,
        monthName: new Date(monthString + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        incomeSources: [],
        expenseItems: [],
        income: 0,
        expenses: 0,
        netGain: 0,
        timestamp: Date.now()
      });
      
      // Recalculate totals for new month
      const newTotalIncome = (newMonth.incomeSources || []).reduce((sum, income) => 
        sum + parseFloat(income.amount || 0), 0);
      const newTotalExpenses = (newMonth.expenseItems || []).reduce((sum, expense) => {
        if (expense.type === 'recurring') {
          return sum + parseFloat(expense.amount || 0);
        }
        return sum;
      }, 0);
      
      newMonth.income = newTotalIncome;
      newMonth.expenses = newTotalExpenses;
      newMonth.netGain = newTotalIncome - newTotalExpenses;
      
      updatedHistory = [...monthlyHistory, newMonth].sort((a, b) => new Date(b.month) - new Date(a.month));
    }
    
    // Update the main financial data
    const updatedFinancialData = {
      ...currentFinancialData,
      monthlyHistory: updatedHistory
    };
    
    handlers.setFinancialData(updatedFinancialData);
    
    // Also update the current view
    const updatedMonthData = updatedHistory.find(month => month.month === monthString);
    if (updatedMonthData) {
      setCurrentMonthData({
        incomeSources: updatedMonthData.incomeSources || [],
        expenses: updatedMonthData.expenseItems || [],
        totalIncome: updatedMonthData.income || 0,
        totalExpenses: updatedMonthData.expenses || 0,
        isHistorical: true,
        monthString: monthString
      });
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Load month data when selectedDate changes
  useEffect(() => {
    loadMonthData(selectedDate);
  }, [selectedDate, data.financialData?.monthlyHistory]);

  // Handle pending expand section from navigation
  useEffect(() => {
    console.log('TrackingTab pendingExpandSection changed to:', pendingExpandSection);
    if (pendingExpandSection) {
      console.log('Expanding section:', pendingExpandSection);
      setViewMode('current'); // Ensure we're in current view
      setExpandedSection(pendingExpandSection);
    }
  }, [pendingExpandSection]);

  // Auto-reset success state after 2 seconds
  useEffect(() => {
    if (saveState === 'success') {
      const timer = setTimeout(() => {
        setSaveState(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveState]);

  const handleSaveMonth = async () => {
    try {
      // Call the actual save function without alerts
      if (handlers?.saveCurrentMonth) {
        // We'll modify the main function to not show alerts when called from here
        await handlers.saveCurrentMonth(true); // Pass flag to skip alerts
      }
      setSaveState('success');
    } catch (error) {
      console.error('Error saving month:', error);
      setSaveState(null);
    }
  };
  
  // Animate view mode change
  const switchView = (mode) => {
    setViewMode(mode);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: mode === 'current' ? 0 : 1,
        tension: 100,
        friction: 20,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const toggleChart = () => {
    setShowChart(!showChart);
  };

  // Expose expandSection method via ref for navigation
  React.useImperativeHandle(ref, () => ({
    expandSection: (section) => {
      setViewMode('current'); // Ensure we're in current view
      setExpandedSection(section);
    }
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#000000']}
        style={styles.gradientBackground}
      />
      
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        {/* Elegant View Mode Selector */}
        <View style={styles.viewSelector}>
          <View style={styles.selectorContainer}>
            <Animated.View
              style={[
                styles.selectorIndicator,
                {
                  transform: [
                    {
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [4, (width - 64) / 2 + 4],
                      }),
                    },
                  ],
                },
              ]}
            />
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => switchView('current')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.selectorText,
                  viewMode === 'current' && styles.selectorTextActive,
                ]}
              >
                Current Period
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => switchView('history')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.selectorText,
                  viewMode === 'history' && styles.selectorTextActive,
                ]}
              >
                Historical Data
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area with Fade Animation */}
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          {viewMode === 'current' ? (
            showChart ? (
              // Chart View - Full Screen
              <View style={styles.chartFullScreenContainer}>
                <View style={styles.chartHeader}>
                  <TouchableOpacity 
                    style={styles.backButton}
                    onPress={toggleChart}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-back" size={20} color="#007AFF" />
                    <Text style={styles.backButtonText}>Back to Data</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  style={styles.chartScrollView}
                  contentContainerStyle={styles.chartScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <IncomeExpensesChart 
                    totalIncome={currentMonthData ? currentMonthData.totalIncome : (data.totalIncome || 0)}
                    totalExpenses={currentMonthData ? currentMonthData.totalExpenses : (data.totalExpenses || 0)}
                    formatCurrency={data.formatCurrency}
                  />
                </ScrollView>
              </View>
            ) : (
              // List View - Normal Layout
              <>
                <UnifiedCashFlowView 
                  theme={theme} 
                  data={currentMonthData ? {
                    ...data,
                    financialData: {
                      ...data.financialData,
                      incomeSources: currentMonthData.incomeSources,
                      expenses: currentMonthData.expenses
                    },
                    totalIncome: currentMonthData.totalIncome,
                    totalExpenses: currentMonthData.totalExpenses,
                    currentMonthData: currentMonthData // Pass the currentMonthData for historical editing
                  } : data} 
                  handlers={currentMonthData && currentMonthData.monthString !== getCurrentMonth() ? {
                    ...handlers,
                    // Only override for NON-current months (historical editing - TEMPORARY EDITS)
                    quickAddIncome: (name, amount, type = 'primary') => {
                      const newIncome = {
                        id: Date.now().toString(),
                        name: name,
                        amount: parseFloat(amount),
                        type: type
                      };
                      // Update local temporary state, NOT monthlyHistory
                      setCurrentMonthData(prev => ({
                        ...prev,
                        incomeSources: [...(prev.incomeSources || []), newIncome],
                        totalIncome: (prev.totalIncome || 0) + parseFloat(amount)
                      }));
                    },
                    quickAddExpense: (name, amount, category = 'general') => {
                      const newExpense = {
                        id: Date.now().toString(),
                        name: name,
                        amount: parseFloat(amount),
                        type: 'recurring',
                        category: category
                      };
                      // Update local temporary state, NOT monthlyHistory
                      setCurrentMonthData(prev => ({
                        ...prev,
                        expenses: [...(prev.expenses || []), newExpense],
                        totalExpenses: (prev.totalExpenses || 0) + parseFloat(amount)
                      }));
                    },
                    quickUpdateIncome: (id, name, amount, type) => {
                      setCurrentMonthData(prev => {
                        const updatedIncome = prev.incomeSources.map(income =>
                          income.id === id ? { ...income, name, amount: parseFloat(amount), type } : income
                        );
                        const newTotal = updatedIncome.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
                        return {
                          ...prev,
                          incomeSources: updatedIncome,
                          totalIncome: newTotal
                        };
                      });
                    },
                    quickUpdateExpense: (id, name, amount, category) => {
                      setCurrentMonthData(prev => {
                        const updatedExpenses = prev.expenses.map(expense =>
                          expense.id === id ? { ...expense, name, amount: parseFloat(amount), category } : expense
                        );
                        const newTotal = updatedExpenses.reduce((sum, expense) => 
                          sum + (expense.type === 'recurring' ? parseFloat(expense.amount || 0) : 0), 0);
                        return {
                          ...prev,
                          expenses: updatedExpenses,
                          totalExpenses: newTotal
                        };
                      });
                    },
                    handleDeleteItem: (type, id) => {
                      if (type === 'income') {
                        setCurrentMonthData(prev => {
                          const updatedIncome = prev.incomeSources.filter(income => income.id !== id);
                          const newTotal = updatedIncome.reduce((sum, income) => sum + parseFloat(income.amount || 0), 0);
                          return {
                            ...prev,
                            incomeSources: updatedIncome,
                            totalIncome: newTotal
                          };
                        });
                      } else if (type === 'expense') {
                        setCurrentMonthData(prev => {
                          const updatedExpenses = prev.expenses.filter(expense => expense.id !== id);
                          const newTotal = updatedExpenses.reduce((sum, expense) => 
                            sum + (expense.type === 'recurring' ? parseFloat(expense.amount || 0) : 0), 0);
                          return {
                            ...prev,
                            expenses: updatedExpenses,
                            totalExpenses: newTotal
                          };
                        });
                      }
                    },
                    // Override the save function to save historical month data
                    saveCurrentMonth: (skipAlerts = false) => {
                      // Save currentMonthData to monthlyHistory
                      updateHistoricalMonth(currentMonthData.monthString, () => ({
                        month: currentMonthData.monthString,
                        monthName: new Date(currentMonthData.monthString + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
                        incomeSources: currentMonthData.incomeSources || [],
                        expenseItems: currentMonthData.expenses || [],
                        income: currentMonthData.totalIncome || 0,
                        expenses: currentMonthData.totalExpenses || 0,
                        netGain: (currentMonthData.totalIncome || 0) - (currentMonthData.totalExpenses || 0),
                        timestamp: Date.now()
                      }));
                      return Promise.resolve();
                    }
                  } : handlers} 
                  initialExpandedSection={expandedSection}
                  selectedDate={selectedDate}
                  canGoToPreviousMonth={canGoToPreviousMonth}
                  canGoToNextMonth={canGoToNextMonth}
                  goToPreviousMonth={goToPreviousMonth}
                  goToNextMonth={goToNextMonth}
                />
                
                {/* Chart View Toggle */}
                <TouchableOpacity 
                  style={styles.chartToggle}
                  onPress={toggleChart}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="bar-chart-outline" 
                    size={16} 
                    color="#007AFF" 
                  />
                  <Text style={styles.chartToggleText}>
                    View Chart Analysis
                  </Text>
                </TouchableOpacity>
              </>
            )
          ) : (
            <HistoryTabRevamped theme={theme} data={data} handlers={handlers} />
          )}
        </Animated.View>
      </Animated.View>

    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 200,
  },
  header: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  viewSelector: {
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    borderRadius: 14,
    padding: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  selectorIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: (width - 72) / 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  selectorButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    zIndex: 1,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    letterSpacing: 0.1,
  },
  selectorTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    marginTop: 8,
  },
  
  // Unified Cash Flow View Styles
  unifiedContainer: {
    flex: 1,
  },
  unifiedContent: {
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  incomeCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#00D4AA',
  },
  expenseCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0F0F0F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  monthIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1A1A1C',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2C',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#2A2A2C',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  monthInfo: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  monthValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  netFlowCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    alignItems: 'center',
  },
  netFlowLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  netFlowAmount: {
    fontSize: 32,
    fontWeight: '200',
    letterSpacing: -1,
  },
  expandedSection: {
    marginTop: 8,
  },
  expandedTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingLeft: 4,
    letterSpacing: -0.3,
  },
  
  // Inline View Styles
  inlineContainer: {
    gap: 8,
  },
  inlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  inlineItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inlineItemContent: {
    flex: 1,
  },
  inlineItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  inlineItemType: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
    letterSpacing: 0.1,
  },
  inlineItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    marginTop: 12,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
    letterSpacing: 0.1,
  },
  
  // Quick Add Modal Styles
  quickModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  quickModalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  quickModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  quickModalInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  quickModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  quickModalCancel: {
    flex: 1,
    backgroundColor: '#3A3A3C',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickModalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  quickModalSave: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickModalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickModalDelete: {
    flex: 1,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickModalDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveMonthButton: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  saveMonthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  updateMonthButton: {
    borderColor: '#FF9500',
  },
  updateMonthText: {
    color: '#FF9500',
  },
  confirmationContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF9500',
    minWidth: 140,
  },
  confirmationText: {
    fontSize: 13,
    color: '#FF9500',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmationCancel: {
    flex: 1,
    backgroundColor: '#3A3A3C',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  confirmationCancelText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  confirmationConfirm: {
    flex: 1,
    backgroundColor: '#FF9500',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  confirmationConfirmText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  savingContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  savingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 6,
  },
  successContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00D4AA',
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D4AA',
    marginLeft: 6,
  },
  chartToggle: {
    backgroundColor: '#1A1A1C',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  chartToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  chartFullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  chartScrollView: {
    flex: 1,
  },
  chartScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  chartCard: {
    backgroundColor: '#1A1A1C',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2C',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    marginBottom: 20,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  barBackground: {
    backgroundColor: '#2A2A2C',
    width: 40,
    height: 120,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    borderRadius: 4,
  },
  incomeBar: {
    backgroundColor: '#00D4AA',
  },
  expenseBar: {
    backgroundColor: '#FF6B6B',
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  netFlow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2C',
  },
  netFlowLabel: {
    fontSize: 14,
    color: '#666666',
  },
  netFlowValue: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Enhanced Current Period Card Styles
  currentPeriodCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    overflow: 'hidden',
  },
  periodDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  periodTextContainer: {
    flex: 1,
  },
  periodTypeLabel: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  periodMonthYear: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  navigationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  navArrowDisabled: {
    backgroundColor: '#0F0F0F',
    borderColor: '#1A1A1A',
  },
  periodDivider: {
    height: 1,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
  },
  saveActionArea: {
    padding: 20,
    paddingTop: 16,
  },
  confirmationRow: {
    gap: 12,
  },
  confirmationTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  confirmationText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  confirmationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmationCancel: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmationCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCCCCC',
  },
  confirmationConfirm: {
    flex: 1,
    backgroundColor: '#FF9500',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmationConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  updateButton: {
    backgroundColor: '#FF9500',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  netFlowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  netFlowIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionAmount: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  
  // Disabled message styles
  disabledMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(102, 102, 102, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(102, 102, 102, 0.2)',
    gap: 6,
  },
  disabledMessageText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
});

export default TrackingTab;