// src/screens/ProfileScreen/FinancialTracker/ExpensesTab.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Animated,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryColor, getCategoryName } from './utils';

// Import responsive utilities
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  isTablet,
  ensureAccessibleTouchTarget,
  useScreenDimensions,
  useSafeSpacing,
  useIsLandscape,
  accessibility
} from '../../../utils/responsive';

const ExpensesTab = ({ theme, data, handlers, navigation }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formAnimation] = useState(new Animated.Value(0));
  const [editingExpense, setEditingExpense] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [expenseSummary, setExpenseSummary] = useState({
    housing: 0,
    food: 0,
    transport: 0,
    utilities: 0,
    entertainment: 0,
    other: 0
  });
  // Add state for upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  
  // Add responsive hooks
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  const safeSpacing = useSafeSpacing();
  
  const { 
    financialData,
    totalExpenses,
    isDarkMode,
    formatCurrency,
    newItemName,
    newItemAmount,
    newItemType,
    newItemCategory,
    isPremium // Extract premium status
  } = data;
  
  const {
    setNewItemName,
    setNewItemAmount,
    setNewItemType,
    setNewItemCategory,
    handleAddExpense,
    handleDeleteItem,
    handleUpdateItem
  } = handlers;

  // Calculate expense summary by category
  useEffect(() => {
    const summary = {
      housing: 0,
      food: 0,
      transport: 0,
      utilities: 0,
      entertainment: 0,
      other: 0
    };
    
    financialData.expenses.forEach(expense => {
      // Only include recurring expenses in the summary
      if (expense.type === 'recurring') {
        if (expense.category === 'housing') summary.housing += parseFloat(expense.amount);
        else if (expense.category === 'food') summary.food += parseFloat(expense.amount);
        else if (expense.category === 'transport') summary.transport += parseFloat(expense.amount);
        else if (expense.category === 'utilities') summary.utilities += parseFloat(expense.amount);
        else if (expense.category === 'entertainment') summary.entertainment += parseFloat(expense.amount);
        else summary.other += parseFloat(expense.amount);
      }
    });
    
    setExpenseSummary(summary);
  }, [financialData.expenses]);
  
  // Show upgrade modal
  const showUpgradePrompt = (message) => {
    setUpgradeMessage(message);
    setShowUpgradeModal(true);
  };

  // Handle navigation to pricing screen
  const goToPricingScreen = () => {
    setShowUpgradeModal(false);
    // Only close the form if navigating to pricing
    if (showAddForm) {
      toggleAddForm();
    }
    
    // Use the parent's navigation handler if available
    if (navigation && navigation.navigate) {
      navigation.navigate('PricingScreen');
    }
    else if (handlers && handlers.onNavigateToPricing) {
      handlers.onNavigateToPricing();
    } else {
      // Fallback if navigation handler isn't provided
      Alert.alert('Upgrade to Pro', 'Please upgrade to the lifetime version to access this feature.');
    }
  };
  
  // Toggle add form visibility with animation
  const toggleAddForm = () => {
    // Check premium status
    if (!isPremium) {
      showUpgradePrompt('Upgrade to Lifetime to add expenses and track your finances.');
      return;
    }
    
    if (showAddForm) {
      // Animate out
      Animated.timing(formAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start(() => {
        setShowAddForm(false);
      });
    } else {
      setShowAddForm(true);
      // Animate in
      Animated.timing(formAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  };
  
  // Local validation for add expense
  const validateAndAddExpense = () => {
    // Check if user is on free plan
    if (!isPremium) {
      showUpgradePrompt('Upgrade to Lifetime to add expenses and track your finances.');
      return;
    }
    
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter a name for the expense.');
      return;
    }
    
    const amount = parseFloat(newItemAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than zero.');
      return;
    }
    
    if (!newItemCategory) {
      Alert.alert('Error', 'Please select a category for the expense.');
      return;
    }
    
    handleAddExpense();
    // Auto-collapse form after adding
    toggleAddForm();
  };
  
  // Start editing an expense
  const handleEditExpense = (expense) => {
    // Check if user is on free plan
    if (!isPremium) {
      showUpgradePrompt('Upgrade to Lifetime to edit expenses and track your finances.');
      return;
    }
    
    setEditingExpense(expense);
    setEditName(expense.name);
    setEditAmount(expense.amount.toString());
    setEditType(expense.type);
    setEditCategory(expense.category);
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setEditingExpense(null);
    setEditName('');
    setEditAmount('');
    setEditType('');
    setEditCategory('');
  };
  
  // Save edited expense
  const saveEditedExpense = () => {
    // Check if user is on free plan - redundant here since we check in handleEditExpense,
    // but keeping as a safeguard
    if (!isPremium) {
      showUpgradePrompt('Upgrade to Lifetime to edit expenses and track your finances.');
      cancelEdit();
      return;
    }
    
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter a name for the expense.');
      return;
    }
    
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than zero.');
      return;
    }
    
    if (!editCategory) {
      Alert.alert('Error', 'Please select a category for the expense.');
      return;
    }
    
    // Create updated expense object
    const updatedExpense = {
      ...editingExpense,
      name: editName,
      amount: amount,
      type: editType,
      category: editCategory
    };
    
    // Call parent handler to update expense
    if (handleUpdateItem) {
      handleUpdateItem('expense', updatedExpense);
    } else {
      // Fallback if handleUpdateItem is not provided
      console.warn('handleUpdateItem not provided');
    }
    
    // Close edit modal
    cancelEdit();
  };
  
  // Get icon for expense category
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'housing': return 'home-outline';
      case 'food': return 'restaurant-outline';
      case 'transport': return 'car-outline';
      case 'utilities': return 'flash-outline';
      case 'entertainment': return 'film-outline';
      default: return 'list-outline';
    }
  };

  // Get expenses by category
  const getExpensesByCategory = (category) => {
    return financialData.expenses.filter(expense => 
      expense.category === category && expense.type === 'recurring'
    );
  };

  // Calculate percentage of total expenses
  const getExpensePercentage = (amount) => {
    if (totalExpenses === 0) return 0;
    // FIX: Round the percentage calculation to prevent floating point precision issues
    return Math.round((amount / totalExpenses) * 100 * 10) / 10;
  };

  // Get one-off expenses
  const getOneOffExpenses = () => {
    return financialData.expenses.filter(expense => expense.type === 'one-off');
  };

  return (
    <ScrollView 
      style={[styles.tabContentContainer]} 
      nestedScrollEnabled={true}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Expenses Summary - UPDATED TO MAKE ENTIRE CARD CLICKABLE */}
      <TouchableOpacity
        style={[styles.expenseSummaryCard, { 
          backgroundColor: theme.card, 
          borderColor: theme.border
        }]}
        onPress={toggleAddForm}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Monthly expenses summary. Tap to add expense"
        accessibilityHint="Shows your expenses breakdown and allows adding new expenses"
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="cart-outline" size={Math.round(scaleWidth(26))} color="#F44336" style={styles.cardIcon} />
            <Text 
              style={[styles.expenseSummaryTitle, { color: theme.text }]}
              maxFontSizeMultiplier={1.8}
            >
              Monthly Expenses
            </Text>
          </View>
        </View>
        
        <View style={styles.expenseSummaryContainer}>
          <Text 
            style={[styles.expenseSummaryTotal, { color: '#F44336' }]}
            maxFontSizeMultiplier={1.5}
          >
            {formatCurrency(totalExpenses)} / month
          </Text>
          
          <View style={styles.expenseDistribution}>
            {/* Housing */}
            <View style={styles.expenseCategoryBar}>
              <View style={styles.expenseCategoryInfo}>
                <View style={styles.categoryLabel}>
                  <Ionicons 
                    name="home-outline" 
                    size={Math.round(scaleWidth(16))} 
                    color="#FF9800" 
                  />
                  <Text 
                    style={[styles.categoryLabelText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Housing
                  </Text>
                </View>
                <View style={styles.categoryAmount}>
                  <Text 
                    style={[styles.categoryAmountText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {formatCurrency(expenseSummary.housing)}
                  </Text>
                  <Text 
                    style={[styles.categoryPercentText, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {Math.round(getExpensePercentage(expenseSummary.housing))}%
                  </Text>
                </View>
              </View>
              <View style={[styles.progressBarContainer, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      backgroundColor: '#FF9800',
                      // FIX: Round the width percentage to avoid floating point errors
                      width: `${Math.round(getExpensePercentage(expenseSummary.housing))}%`
                    }
                  ]} 
                  accessible={true}
                  accessibilityLabel={`Housing represents ${Math.round(getExpensePercentage(expenseSummary.housing))} percent of expenses`}
                />
              </View>
            </View>
            
            {/* Food */}
            <View style={styles.expenseCategoryBar}>
              <View style={styles.expenseCategoryInfo}>
                <View style={styles.categoryLabel}>
                  <Ionicons 
                    name="restaurant-outline" 
                    size={Math.round(scaleWidth(16))} 
                    color="#4CAF50" 
                  />
                  <Text 
                    style={[styles.categoryLabelText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Food
                  </Text>
                </View>
                <View style={styles.categoryAmount}>
                  <Text 
                    style={[styles.categoryAmountText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {formatCurrency(expenseSummary.food)}
                  </Text>
                  <Text 
                    style={[styles.categoryPercentText, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {Math.round(getExpensePercentage(expenseSummary.food))}%
                  </Text>
                </View>
              </View>
              <View style={[styles.progressBarContainer, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      backgroundColor: '#4CAF50',
                      // FIX: Round the width percentage to avoid floating point errors
                      width: `${Math.round(getExpensePercentage(expenseSummary.food))}%`
                    }
                  ]} 
                  accessible={true}
                  accessibilityLabel={`Food represents ${Math.round(getExpensePercentage(expenseSummary.food))} percent of expenses`}
                />
              </View>
            </View>
            
            {/* Transport */}
            <View style={styles.expenseCategoryBar}>
              <View style={styles.expenseCategoryInfo}>
                <View style={styles.categoryLabel}>
                  <Ionicons 
                    name="car-outline" 
                    size={Math.round(scaleWidth(16))} 
                    color="#2196F3" 
                  />
                  <Text 
                    style={[styles.categoryLabelText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Transport
                  </Text>
                </View>
                <View style={styles.categoryAmount}>
                  <Text 
                    style={[styles.categoryAmountText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {formatCurrency(expenseSummary.transport)}
                  </Text>
                  <Text 
                    style={[styles.categoryPercentText, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {Math.round(getExpensePercentage(expenseSummary.transport))}%
                  </Text>
                </View>
              </View>
              <View style={[styles.progressBarContainer, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      backgroundColor: '#2196F3',
                      // FIX: Round the width percentage to avoid floating point errors
                      width: `${Math.round(getExpensePercentage(expenseSummary.transport))}%`
                    }
                  ]} 
                  accessible={true}
                  accessibilityLabel={`Transportation represents ${Math.round(getExpensePercentage(expenseSummary.transport))} percent of expenses`}
                />
              </View>
            </View>
            
            {/* Utilities */}
            <View style={styles.expenseCategoryBar}>
              <View style={styles.expenseCategoryInfo}>
                <View style={styles.categoryLabel}>
                  <Ionicons 
                    name="flash-outline" 
                    size={Math.round(scaleWidth(16))} 
                    color="#9C27B0" 
                  />
                  <Text 
                    style={[styles.categoryLabelText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Utilities
                  </Text>
                </View>
                <View style={styles.categoryAmount}>
                  <Text 
                    style={[styles.categoryAmountText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {formatCurrency(expenseSummary.utilities)}
                  </Text>
                  <Text 
                    style={[styles.categoryPercentText, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {Math.round(getExpensePercentage(expenseSummary.utilities))}%
                  </Text>
                </View>
              </View>
              <View style={[styles.progressBarContainer, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      backgroundColor: '#9C27B0',
                      // FIX: Round the width percentage to avoid floating point errors
                      width: `${Math.round(getExpensePercentage(expenseSummary.utilities))}%`
                    }
                  ]} 
                  accessible={true}
                  accessibilityLabel={`Utilities represents ${Math.round(getExpensePercentage(expenseSummary.utilities))} percent of expenses`}
                />
              </View>
            </View>
            
            {/* Entertainment */}
            <View style={styles.expenseCategoryBar}>
              <View style={styles.expenseCategoryInfo}>
                <View style={styles.categoryLabel}>
                  <Ionicons 
                    name="film-outline" 
                    size={Math.round(scaleWidth(16))} 
                    color="#F44336" 
                  />
                  <Text 
                    style={[styles.categoryLabelText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Entertainment
                  </Text>
                </View>
                <View style={styles.categoryAmount}>
                  <Text 
                    style={[styles.categoryAmountText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {formatCurrency(expenseSummary.entertainment)}
                  </Text>
                  <Text 
                    style={[styles.categoryPercentText, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {Math.round(getExpensePercentage(expenseSummary.entertainment))}%
                  </Text>
                </View>
              </View>
              <View style={[styles.progressBarContainer, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                <View 
                  style={[
                    styles.progressBar, 
                    { 
                      backgroundColor: '#F44336',
                      // FIX: Round the width percentage to avoid floating point errors
                      width: `${Math.round(getExpensePercentage(expenseSummary.entertainment))}%`
                    }
                  ]} 
                  accessible={true}
                  accessibilityLabel={`Entertainment represents ${Math.round(getExpensePercentage(expenseSummary.entertainment))} percent of expenses`}
                />
              </View>
            </View>
            
            {/* Other */}
            {expenseSummary.other > 0 && (
              <View style={styles.expenseCategoryBar}>
                <View style={styles.expenseCategoryInfo}>
                  <View style={styles.categoryLabel}>
                    <Ionicons 
                      name="list-outline" 
                      size={Math.round(scaleWidth(16))} 
                      color="#607D8B" 
                    />
                    <Text 
                      style={[styles.categoryLabelText, { color: theme.text }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Other
                    </Text>
                  </View>
                  <View style={styles.categoryAmount}>
                    <Text 
                      style={[styles.categoryAmountText, { color: theme.text }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {formatCurrency(expenseSummary.other)}
                    </Text>
                    <Text 
                      style={[styles.categoryPercentText, { color: theme.textSecondary }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {Math.round(getExpensePercentage(expenseSummary.other))}%
                    </Text>
                  </View>
                </View>
                <View style={[styles.progressBarContainer, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { 
                        backgroundColor: '#607D8B',
                        // FIX: Round the width percentage to avoid floating point errors
                        width: `${Math.round(getExpensePercentage(expenseSummary.other))}%`
                      }
                    ]} 
                    accessible={true}
                    accessibilityLabel={`Other expenses represent ${Math.round(getExpensePercentage(expenseSummary.other))} percent of expenses`}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
        
        {/* Add expense button - CHANGED TO VIEW FOR BETTER CLICKABILITY */}
        <View style={styles.addButtonContainer}>
          <View
            style={[styles.addExpenseButton, { backgroundColor: '#F44336' }]}
          >
            <Ionicons 
              name={showAddForm ? "remove" : "add"} 
              size={Math.round(scaleWidth(20))} 
              color="#FFFFFF" 
              style={{marginRight: Math.round(spacing.xs)}}
            />
            <Text 
              style={styles.addExpenseButtonText}
              maxFontSizeMultiplier={1.3}
            >
              {showAddForm ? "Cancel" : "Add Expense"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Add Expense Form - Collapsible */}
      {showAddForm && (
        <Animated.View 
          style={[
            styles.addForm, 
            { 
              backgroundColor: theme.card, 
              borderColor: theme.border,
              opacity: formAnimation,
              // FIX: Round interpolated values to prevent floating point issues
              maxHeight: formAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, Math.round(500)]
              }),
              transform: [{
                translateY: formAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [Math.round(-20), 0]
                })
              }]
            }
          ]}
        >
          <Text 
            style={[styles.addFormTitle, { color: theme.text }]}
            maxFontSizeMultiplier={1.3}
          >
            Add Expense
          </Text>
          
          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Name (e.g. Rent, Groceries)"
              placeholderTextColor={theme.textSecondary}
              value={newItemName}
              onChangeText={setNewItemName}
              accessible={true}
              accessibilityLabel="Expense name"
              accessibilityHint="Enter a name for this expense"
              maxFontSizeMultiplier={1.3}
            />
          </View>
          
          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Amount"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={newItemAmount}
              onChangeText={setNewItemAmount}
              accessible={true}
              accessibilityLabel="Expense amount"
              accessibilityHint="Enter the amount for this expense"
              maxFontSizeMultiplier={1.3}
            />
          </View>
          
          <View style={styles.formRow}>
            <Text 
              style={[styles.formLabel, { color: theme.textSecondary }]}
              maxFontSizeMultiplier={1.3}
            >
              Expense Type:
            </Text>
            <View style={styles.typeOptions}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  { 
                    backgroundColor: newItemType === 'recurring' ? 'rgba(244,67,54,0.2)' : 'transparent',
                    borderColor: '#F44336',
                    ...ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                  }
                ]}
                onPress={() => setNewItemType('recurring')}
                accessible={true}
                accessibilityRole="radio"
                accessibilityState={{ checked: newItemType === 'recurring' }}
                accessibilityLabel="Monthly recurring expense"
              >
                <Ionicons 
                  name="repeat-outline" 
                  size={Math.round(scaleWidth(16))} 
                  color="#F44336" 
                  style={styles.typeIcon} 
                />
                <Text 
                  style={[
                    styles.typeOptionText, 
                    { color: newItemType === 'recurring' ? '#F44336' : theme.text }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Monthly
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  { 
                    backgroundColor: newItemType === 'one-off' ? 'rgba(244,67,54,0.2)' : 'transparent',
                    borderColor: '#F44336',
                    ...ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                  }
                ]}
                onPress={() => setNewItemType('one-off')}
                accessible={true}
                accessibilityRole="radio"
                accessibilityState={{ checked: newItemType === 'one-off' }}
                accessibilityLabel="One-time expense"
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={Math.round(scaleWidth(16))} 
                  color="#F44336" 
                  style={styles.typeIcon} 
                />
                <Text 
                  style={[
                    styles.typeOptionText, 
                    { color: newItemType === 'one-off' ? '#F44336' : theme.text }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  One-time
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.formRow}>
            <Text 
              style={[styles.formLabel, { color: theme.textSecondary }]}
              maxFontSizeMultiplier={1.3}
            >
              Category:
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.categoryScroll} 
              nestedScrollEnabled={true}
              contentContainerStyle={isSmallDevice ? { paddingRight: Math.round(spacing.l) } : null}
            >
              <View style={styles.categoryOptions}>
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    { backgroundColor: newItemCategory === 'housing' ? 'rgba(255,152,0,0.2)' : 'transparent' },
                    { borderColor: getCategoryColor('housing') },
                    ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                  ]}
                  onPress={() => setNewItemCategory('housing')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemCategory === 'housing' }}
                  accessibilityLabel="Housing category"
                >
                  <Ionicons 
                    name="home-outline" 
                    size={Math.round(scaleWidth(16))} 
                    color={getCategoryColor('housing')} 
                    style={styles.categoryIcon} 
                  />
                  <Text 
                    style={[
                      styles.categoryOptionText, 
                      { color: newItemCategory === 'housing' ? getCategoryColor('housing') : theme.text }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Housing
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    { backgroundColor: newItemCategory === 'food' ? 'rgba(76,175,80,0.2)' : 'transparent' },
                    { borderColor: getCategoryColor('food') },
                    ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                  ]}
                  onPress={() => setNewItemCategory('food')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemCategory === 'food' }}
                  accessibilityLabel="Food category"
                >
                  <Ionicons 
                    name="restaurant-outline" 
                    size={Math.round(scaleWidth(16))} 
                    color={getCategoryColor('food')} 
                    style={styles.categoryIcon} 
                  />
                  <Text 
                    style={[
                      styles.categoryOptionText, 
                      { color: newItemCategory === 'food' ? getCategoryColor('food') : theme.text }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Food
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    { backgroundColor: newItemCategory === 'transport' ? 'rgba(33,150,243,0.2)' : 'transparent' },
                    { borderColor: getCategoryColor('transport') },
                    ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                  ]}
                  onPress={() => setNewItemCategory('transport')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemCategory === 'transport' }}
                  accessibilityLabel="Transport category"
                >
                  <Ionicons 
                    name="car-outline" 
                    size={Math.round(scaleWidth(16))} 
                    color={getCategoryColor('transport')} 
                    style={styles.categoryIcon} 
                  />
                  <Text 
                    style={[
                      styles.categoryOptionText, 
                      { color: newItemCategory === 'transport' ? getCategoryColor('transport') : theme.text }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Transport
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    { backgroundColor: newItemCategory === 'utilities' ? 'rgba(156,39,176,0.2)' : 'transparent' },
                    { borderColor: getCategoryColor('utilities') },
                    ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                  ]}
                  onPress={() => setNewItemCategory('utilities')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemCategory === 'utilities' }}
                  accessibilityLabel="Utilities category"
                >
                  <Ionicons 
                    name="flash-outline" 
                    size={Math.round(scaleWidth(16))} 
                    color={getCategoryColor('utilities')} 
                    style={styles.categoryIcon} 
                  />
                  <Text 
                    style={[
                      styles.categoryOptionText, 
                      { color: newItemCategory === 'utilities' ? getCategoryColor('utilities') : theme.text }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Utilities
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    { backgroundColor: newItemCategory === 'entertainment' ? 'rgba(244,67,54,0.2)' : 'transparent' },
                    { borderColor: getCategoryColor('entertainment') },
                    ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                  ]}
                  onPress={() => setNewItemCategory('entertainment')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemCategory === 'entertainment' }}
                  accessibilityLabel="Entertainment category"
                >
                  <Ionicons 
                    name="film-outline" 
                    size={Math.round(scaleWidth(16))} 
                    color={getCategoryColor('entertainment')} 
                    style={styles.categoryIcon} 
                  />
                  <Text 
                    style={[
                      styles.categoryOptionText, 
                      { color: newItemCategory === 'entertainment' ? getCategoryColor('entertainment') : theme.text }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Entertainment
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    { backgroundColor: newItemCategory === 'other' ? 'rgba(96,125,139,0.2)' : 'transparent' },
                    { borderColor: getCategoryColor('other') },
                    ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                  ]}
                  onPress={() => setNewItemCategory('other')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemCategory === 'other' }}
                  accessibilityLabel="Other category"
                >
                  <Ionicons 
                    name="list-outline" 
                    size={Math.round(scaleWidth(16))} 
                    color={getCategoryColor('other')} 
                    style={styles.categoryIcon} 
                  />
                  <Text 
                    style={[
                      styles.categoryOptionText, 
                      { color: newItemCategory === 'other' ? getCategoryColor('other') : theme.text }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
          
          <TouchableOpacity
            style={[
              styles.addActionButton, 
              { backgroundColor: '#F44336' },
              ensureAccessibleTouchTarget(Math.round(scaleWidth(200)), Math.round(scaleHeight(48)))
            ]}
            onPress={validateAndAddExpense}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add expense"
            accessibilityHint="Saves this expense to your list"
          >
            <Text 
              style={styles.addButtonText}
              maxFontSizeMultiplier={1.3}
            >
              Add Expense
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Expenses List - Grouped by Category */}
      <View style={styles.expenseList}>
        {financialData.expenses.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: theme.border }]}>
            <Ionicons 
              name="cart-outline" 
              size={Math.round(scaleWidth(32))} 
              color={theme.textSecondary} 
              style={styles.emptyIcon} 
            />
            <Text 
              style={[styles.emptyText, { color: theme.textSecondary }]}
              maxFontSizeMultiplier={1.3}
            >
              No expenses added yet
            </Text>
            <Text 
              style={[styles.emptySubText, { color: theme.textSecondary }]}
              maxFontSizeMultiplier={1.3}
            >
              {!isPremium
                ? "Upgrade to Lifetime to add expenses"
                : "Tap the + button to add your first expense"}
            </Text>
          </View>
        ) : (
          // Group expenses by category
          <>
            {/* Category Headers */}
            <View style={[styles.expensesCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text 
                style={[styles.expensesCardTitle, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                Monthly Recurring Expenses
              </Text>
              
              {/* Housing Category */}
              {getExpensesByCategory('housing').length > 0 && (
                <View style={styles.expenseCategorySection}>
                  <View style={styles.expenseCategoryHeader}>
                    <View style={styles.expenseCategoryHeaderLeft}>
                      <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor('housing') }]} />
                      <Text 
                        style={[styles.expenseCategoryName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Housing
                      </Text>
                    </View>
                    <Text 
                      style={[styles.expenseCategoryTotal, { color: getCategoryColor('housing') }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {formatCurrency(expenseSummary.housing)}
                    </Text>
                  </View>
                  
                  {getExpensesByCategory('housing').map((expense) => (
                    <TouchableOpacity 
                      key={expense.id} 
                      style={[
                        styles.expenseItem, 
                        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
                        ensureAccessibleTouchTarget(Math.round(scaleWidth(300)), Math.round(scaleHeight(60)))
                      ]}
                      onPress={() => handleEditExpense(expense)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`${expense.name}, ${formatCurrency(expense.amount)}`}
                      accessibilityHint="Tap to edit this expense"
                    >
                      <Text 
                        style={[styles.expenseName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {expense.name}
                      </Text>
                      <Text 
                        style={[styles.expenseAmount, { color: getCategoryColor('housing') }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {formatCurrency(expense.amount)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {/* Food Category */}
              {getExpensesByCategory('food').length > 0 && (
                <View style={styles.expenseCategorySection}>
                  <View style={styles.expenseCategoryHeader}>
                    <View style={styles.expenseCategoryHeaderLeft}>
                      <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor('food') }]} />
                      <Text 
                        style={[styles.expenseCategoryName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Food
                      </Text>
                    </View>
                    <Text 
                      style={[styles.expenseCategoryTotal, { color: getCategoryColor('food') }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {formatCurrency(expenseSummary.food)}
                    </Text>
                  </View>
                  
                  {getExpensesByCategory('food').map((expense) => (
                    <TouchableOpacity 
                      key={expense.id} 
                      style={[
                        styles.expenseItem, 
                        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
                        ensureAccessibleTouchTarget(Math.round(scaleWidth(300)), Math.round(scaleHeight(60)))
                      ]}
                      onPress={() => handleEditExpense(expense)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`${expense.name}, ${formatCurrency(expense.amount)}`}
                      accessibilityHint="Tap to edit this expense"
                    >
                      <Text 
                        style={[styles.expenseName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {expense.name}
                      </Text>
                      <Text 
                        style={[styles.expenseAmount, { color: getCategoryColor('food') }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {formatCurrency(expense.amount)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {/* Transport Category */}
              {getExpensesByCategory('transport').length > 0 && (
                <View style={styles.expenseCategorySection}>
                  <View style={styles.expenseCategoryHeader}>
                    <View style={styles.expenseCategoryHeaderLeft}>
                      <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor('transport') }]} />
                      <Text 
                        style={[styles.expenseCategoryName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Transportation
                      </Text>
                    </View>
                    <Text 
                      style={[styles.expenseCategoryTotal, { color: getCategoryColor('transport') }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {formatCurrency(expenseSummary.transport)}
                    </Text>
                  </View>
                  
                  {getExpensesByCategory('transport').map((expense) => (
                    <TouchableOpacity 
                      key={expense.id} 
                      style={[
                        styles.expenseItem, 
                        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
                        ensureAccessibleTouchTarget(Math.round(scaleWidth(300)), Math.round(scaleHeight(60)))
                      ]}
                      onPress={() => handleEditExpense(expense)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`${expense.name}, ${formatCurrency(expense.amount)}`}
                      accessibilityHint="Tap to edit this expense"
                    >
                      <Text 
                        style={[styles.expenseName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {expense.name}
                      </Text>
                      <Text 
                        style={[styles.expenseAmount, { color: getCategoryColor('transport') }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {formatCurrency(expense.amount)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {/* Utilities Category */}
              {getExpensesByCategory('utilities').length > 0 && (
                <View style={styles.expenseCategorySection}>
                  <View style={styles.expenseCategoryHeader}>
                    <View style={styles.expenseCategoryHeaderLeft}>
                      <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor('utilities') }]} />
                      <Text 
                        style={[styles.expenseCategoryName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Utilities
                      </Text>
                    </View>
                    <Text 
                      style={[styles.expenseCategoryTotal, { color: getCategoryColor('utilities') }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {formatCurrency(expenseSummary.utilities)}
                    </Text>
                  </View>
                  
                  {getExpensesByCategory('utilities').map((expense) => (
                    <TouchableOpacity 
                      key={expense.id} 
                      style={[
                        styles.expenseItem, 
                        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
                        ensureAccessibleTouchTarget(Math.round(scaleWidth(300)), Math.round(scaleHeight(60)))
                      ]}
                      onPress={() => handleEditExpense(expense)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`${expense.name}, ${formatCurrency(expense.amount)}`}
                      accessibilityHint="Tap to edit this expense"
                    >
                      <Text 
                        style={[styles.expenseName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {expense.name}
                      </Text>
                      <Text 
                        style={[styles.expenseAmount, { color: getCategoryColor('utilities') }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {formatCurrency(expense.amount)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {/* Entertainment Category */}
              {getExpensesByCategory('entertainment').length > 0 && (
                <View style={styles.expenseCategorySection}>
                  <View style={styles.expenseCategoryHeader}>
                    <View style={styles.expenseCategoryHeaderLeft}>
                      <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor('entertainment') }]} />
                      <Text 
                        style={[styles.expenseCategoryName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Entertainment
                      </Text>
                    </View>
                    <Text 
                      style={[styles.expenseCategoryTotal, { color: getCategoryColor('entertainment') }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {formatCurrency(expenseSummary.entertainment)}
                    </Text>
                  </View>
                  
                  {getExpensesByCategory('entertainment').map((expense) => (
                    <TouchableOpacity 
                      key={expense.id} 
                      style={[
                        styles.expenseItem, 
                        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
                        ensureAccessibleTouchTarget(Math.round(scaleWidth(300)), Math.round(scaleHeight(60)))
                      ]}
                      onPress={() => handleEditExpense(expense)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`${expense.name}, ${formatCurrency(expense.amount)}`}
                      accessibilityHint="Tap to edit this expense"
                    >
                      <Text 
                        style={[styles.expenseName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {expense.name}
                      </Text>
                      <Text 
                        style={[styles.expenseAmount, { color: getCategoryColor('entertainment') }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {formatCurrency(expense.amount)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              {/* Other Category */}
              {getExpensesByCategory('other').length > 0 && (
                <View style={styles.expenseCategorySection}>
                  <View style={styles.expenseCategoryHeader}>
                    <View style={styles.expenseCategoryHeaderLeft}>
                      <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor('other') }]} />
                      <Text 
                        style={[styles.expenseCategoryName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Other
                      </Text>
                    </View>
                    <Text 
                      style={[styles.expenseCategoryTotal, { color: getCategoryColor('other') }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {formatCurrency(expenseSummary.other)}
                    </Text>
                  </View>
                  
                  {getExpensesByCategory('other').map((expense) => (
                    <TouchableOpacity 
                      key={expense.id} 
                      style={[
                        styles.expenseItem, 
                        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
                        ensureAccessibleTouchTarget(Math.round(scaleWidth(300)), Math.round(scaleHeight(60)))
                      ]}
                      onPress={() => handleEditExpense(expense)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`${expense.name}, ${formatCurrency(expense.amount)}`}
                      accessibilityHint="Tap to edit this expense"
                    >
                      <Text 
                        style={[styles.expenseName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {expense.name}
                      </Text>
                      <Text 
                        style={[styles.expenseAmount, { color: getCategoryColor('other') }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {formatCurrency(expense.amount)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            
            {/* One-off Expenses */}
            {getOneOffExpenses().length > 0 && (
              <View style={[styles.expensesCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.oneOffHeader}>
                  <Text 
                    style={[styles.expensesCardTitle, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    One-time Expenses
                  </Text>
                  <Ionicons 
                    name="calendar-outline" 
                    size={Math.round(scaleWidth(20))} 
                    color="#F44336" 
                  />
                </View>
                
                {getOneOffExpenses().map((expense) => (
                  <TouchableOpacity 
                    key={expense.id} 
                    style={[
                      styles.oneOffItem, 
                      { borderColor: 'rgba(0,0,0,0.05)' },
                      ensureAccessibleTouchTarget(Math.round(scaleWidth(300)), Math.round(scaleHeight(60)))
                    ]}
                    onPress={() => handleEditExpense(expense)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`${expense.name}, ${formatCurrency(expense.amount)}, one-time expense, category ${getCategoryName(expense.category)}`}
                    accessibilityHint="Tap to edit this one-time expense"
                  >
                    <View style={styles.oneOffItemLeft}>
                      <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(expense.category) }]} />
                      <Text 
                        style={[styles.expenseName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {expense.name}
                      </Text>
                      <Text 
                        style={[styles.oneOffCategory, { color: theme.textSecondary }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {getCategoryName(expense.category)}
                      </Text>
                    </View>
                    <Text 
                      style={[styles.expenseAmount, { color: '#F44336' }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {formatCurrency(expense.amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </View>
      
      {/* Edit Expense Modal */}
      <Modal
        visible={editingExpense !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.editModal, 
            { 
              backgroundColor: theme.card,
              marginTop: Math.round(safeSpacing.top),
              marginBottom: Math.round(safeSpacing.bottom),
              marginLeft: Math.round(safeSpacing.left),
              marginRight: Math.round(safeSpacing.right),
              maxHeight: Math.round(height - safeSpacing.top * 2)
            }
          ]}>
            <View style={styles.editModalHeader}>
              <Text 
                style={[styles.editModalTitle, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                Edit Expense
              </Text>
              <TouchableOpacity 
                onPress={cancelEdit}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close"
                accessibilityHint="Closes the edit form without saving"
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Ionicons name="close" size={Math.round(scaleWidth(24))} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.editForm}>
              <View style={styles.formRow}>
                <Text 
                  style={[styles.formLabel, { color: theme.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Name:
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  value={editName}
                  onChangeText={setEditName}
                  accessible={true}
                  accessibilityLabel="Expense name"
                  accessibilityHint="Edit the name of this expense"
                  maxFontSizeMultiplier={1.3}
                />
              </View>
              
              <View style={styles.formRow}>
                <Text 
                  style={[styles.formLabel, { color: theme.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Amount:
                </Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  keyboardType="numeric"
                  value={editAmount}
                  onChangeText={setEditAmount}
                  accessible={true}
                  accessibilityLabel="Expense amount"
                  accessibilityHint="Edit the amount of this expense"
                  maxFontSizeMultiplier={1.3}
                />
              </View>
              
              <View style={styles.formRow}>
                <Text 
                  style={[styles.formLabel, { color: theme.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Type:
                </Text>
                <View style={styles.typeOptions}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      { 
                        backgroundColor: editType === 'recurring' ? 'rgba(244,67,54,0.2)' : 'transparent',
                        borderColor: '#F44336',
                        ...ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                      }
                    ]}
                    onPress={() => setEditType('recurring')}
                    accessible={true}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: editType === 'recurring' }}
                    accessibilityLabel="Monthly recurring expense"
                  >
                    <Ionicons 
                      name="repeat-outline" 
                      size={Math.round(scaleWidth(16))} 
                      color="#F44336" 
                      style={styles.typeIcon} 
                    />
                    <Text 
                      style={[
                        styles.typeOptionText, 
                        { color: editType === 'recurring' ? '#F44336' : theme.text }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Monthly
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      { 
                        backgroundColor: editType === 'one-off' ? 'rgba(244,67,54,0.2)' : 'transparent',
                        borderColor: '#F44336',
                        ...ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                      }
                    ]}
                    onPress={() => setEditType('one-off')}
                    accessible={true}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: editType === 'one-off' }}
                    accessibilityLabel="One-time expense"
                  >
                    <Ionicons 
                      name="calendar-outline" 
                      size={Math.round(scaleWidth(16))} 
                      color="#F44336" 
                      style={styles.typeIcon} 
                    />
                    <Text 
                      style={[
                        styles.typeOptionText, 
                        { color: editType === 'one-off' ? '#F44336' : theme.text }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      One-time
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.formRow}>
                <Text 
                  style={[styles.formLabel, { color: theme.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Category:
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.categoryScroll} 
                  nestedScrollEnabled={true}
                  contentContainerStyle={isSmallDevice ? { paddingRight: Math.round(spacing.l) } : null}
                >
                  <View style={styles.categoryOptions}>
                    <TouchableOpacity
                      style={[
                        styles.categoryOption,
                        { backgroundColor: editCategory === 'housing' ? 'rgba(255,152,0,0.2)' : 'transparent' },
                        { borderColor: getCategoryColor('housing') },
                        ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                      ]}
                      onPress={() => setEditCategory('housing')}
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: editCategory === 'housing' }}
                      accessibilityLabel="Housing category"
                    >
                      <Ionicons 
                        name="home-outline" 
                        size={Math.round(scaleWidth(16))} 
                        color={getCategoryColor('housing')} 
                        style={styles.categoryIcon} 
                      />
                      <Text 
                        style={[
                          styles.categoryOptionText, 
                          { color: editCategory === 'housing' ? getCategoryColor('housing') : theme.text }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Housing
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.categoryOption,
                        { backgroundColor: editCategory === 'food' ? 'rgba(76,175,80,0.2)' : 'transparent' },
                        { borderColor: getCategoryColor('food') },
                        ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                      ]}
                      onPress={() => setEditCategory('food')}
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: editCategory === 'food' }}
                      accessibilityLabel="Food category"
                    >
                      <Ionicons 
                        name="restaurant-outline" 
                        size={Math.round(scaleWidth(16))} 
                        color={getCategoryColor('food')} 
                        style={styles.categoryIcon} 
                      />
                      <Text 
                        style={[
                          styles.categoryOptionText, 
                          { color: editCategory === 'food' ? getCategoryColor('food') : theme.text }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Food
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.categoryOption,
                        { backgroundColor: editCategory === 'transport' ? 'rgba(33,150,243,0.2)' : 'transparent' },
                        { borderColor: getCategoryColor('transport') },
                        ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                      ]}
                      onPress={() => setEditCategory('transport')}
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: editCategory === 'transport' }}
                      accessibilityLabel="Transport category"
                    >
                      <Ionicons 
                        name="car-outline" 
                        size={Math.round(scaleWidth(16))} 
                        color={getCategoryColor('transport')} 
                        style={styles.categoryIcon} 
                      />
                      <Text 
                        style={[
                          styles.categoryOptionText, 
                          { color: editCategory === 'transport' ? getCategoryColor('transport') : theme.text }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Transport
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.categoryOption,
                        { backgroundColor: editCategory === 'utilities' ? 'rgba(156,39,176,0.2)' : 'transparent' },
                        { borderColor: getCategoryColor('utilities') },
                        ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                      ]}
                      onPress={() => setEditCategory('utilities')}
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: editCategory === 'utilities' }}
                      accessibilityLabel="Utilities category"
                    >
                      <Ionicons 
                        name="flash-outline" 
                        size={Math.round(scaleWidth(16))} 
                        color={getCategoryColor('utilities')} 
                        style={styles.categoryIcon} 
                      />
                      <Text 
                        style={[
                          styles.categoryOptionText, 
                          { color: editCategory === 'utilities' ? getCategoryColor('utilities') : theme.text }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Utilities
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.categoryOption,
                        { backgroundColor: editCategory === 'entertainment' ? 'rgba(244,67,54,0.2)' : 'transparent' },
                        { borderColor: getCategoryColor('entertainment') },
                        ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                      ]}
                      onPress={() => setEditCategory('entertainment')}
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: editCategory === 'entertainment' }}
                      accessibilityLabel="Entertainment category"
                    >
                      <Ionicons 
                        name="film-outline" 
                        size={Math.round(scaleWidth(16))} 
                        color={getCategoryColor('entertainment')} 
                        style={styles.categoryIcon} 
                      />
                      <Text 
                        style={[
                          styles.categoryOptionText, 
                          { color: editCategory === 'entertainment' ? getCategoryColor('entertainment') : theme.text }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Entertainment
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.categoryOption,
                        { backgroundColor: editCategory === 'other' ? 'rgba(96,125,139,0.2)' : 'transparent' },
                        { borderColor: getCategoryColor('other') },
                        ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(40)))
                      ]}
                      onPress={() => setEditCategory('other')}
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: editCategory === 'other' }}
                      accessibilityLabel="Other category"
                    >
                      <Ionicons 
                        name="list-outline" 
                        size={Math.round(scaleWidth(16))} 
                        color={getCategoryColor('other')} 
                        style={styles.categoryIcon} 
                      />
                      <Text 
                        style={[
                          styles.categoryOptionText, 
                          { color: editCategory === 'other' ? getCategoryColor('other') : theme.text }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Other
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
              
              <View style={[
                styles.editModalActions,
                isSmallDevice ? { flexDirection: 'column' } : { flexDirection: 'row' }
              ]}>
                <TouchableOpacity
                  style={[
                    styles.deleteButton, 
                    { borderColor: '#F44336' },
                    ensureAccessibleTouchTarget(Math.round(scaleWidth(120)), Math.round(scaleHeight(50)))
                  ]}
                  onPress={() => {
                    if (!isPremium) {
                      showUpgradePrompt('Upgrade to Lifetime to manage expenses.');
                      cancelEdit();
                    } else {
                      handleDeleteItem('expense', editingExpense.id);
                      cancelEdit();
                    }
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Delete expense"
                  accessibilityHint="Permanently removes this expense"
                >
                  <Ionicons name="trash-outline" size={Math.round(scaleWidth(20))} color="#F44336" />
                  <Text 
                    style={[styles.deleteButtonText, { color: '#F44336' }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
                
                <View style={[
                  styles.rightButtons,
                  isSmallDevice ? { marginTop: Math.round(spacing.m) } : null
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton, 
                      { borderColor: theme.border },
                      ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(50)))
                    ]}
                    onPress={cancelEdit}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                    accessibilityHint="Cancels editing without saving changes"
                  >
                    <Text 
                      style={[styles.cancelButtonText, { color: theme.text }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.saveButton, 
                      { backgroundColor: '#F44336' },
                      ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(50)))
                    ]}
                    onPress={saveEditedExpense}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Save changes"
                    accessibilityHint="Saves the updated expense details"
                  >
                    <Text 
                      style={styles.saveButtonText}
                      maxFontSizeMultiplier={1.3}
                    >
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Upgrade Modal */}
      <Modal
        visible={showUpgradeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.upgradeModal, 
            { 
              backgroundColor: theme.card,
              marginTop: Math.round(safeSpacing.top),
              marginBottom: Math.round(safeSpacing.bottom),
              marginLeft: Math.round(safeSpacing.left),
              marginRight: Math.round(safeSpacing.right)
            }
          ]}>
            <View style={styles.upgradeModalHeader}>
              <Ionicons name="lock-closed" size={Math.round(scaleWidth(40))} color="#3F51B5" />
              <Text 
                style={[styles.upgradeModalTitle, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                Premium Feature
              </Text>
            </View>
            
            <Text 
              style={[styles.upgradeModalMessage, { color: theme.text }]}
              maxFontSizeMultiplier={1.3}
            >
              {upgradeMessage || "Upgrade to Lifetime to unlock all financial tracking features."}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.upgradeButton, 
                { backgroundColor: '#3F51B5' },
                ensureAccessibleTouchTarget(Math.round(scaleWidth(220)), Math.round(scaleHeight(50)))
              ]}
              onPress={goToPricingScreen}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Upgrade to Lifetime"
              accessibilityHint="Opens the pricing screen to upgrade your subscription"
            >
              <Ionicons name="rocket" size={Math.round(scaleWidth(20))} color="#FFFFFF" style={{marginRight: Math.round(spacing.xs)}} />
              <Text 
                style={styles.upgradeButtonText}
                maxFontSizeMultiplier={1.3}
              >
                Upgrade to Lifetime
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.laterButton,
                ensureAccessibleTouchTarget(Math.round(scaleWidth(100)), Math.round(scaleHeight(44)))
              ]}
              onPress={() => setShowUpgradeModal(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Maybe Later"
              accessibilityHint="Closes the upgrade prompt"
            >
              <Text 
                style={[styles.laterButtonText, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContentContainer: {
    padding: spacing.m,
    paddingTop: 4,
  },
  // Expenses Summary
  expenseSummaryCard: {
    borderRadius: scaleWidth(16),
    padding: spacing.xl,
    marginBottom: spacing.m,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: scaleHeight(180),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: spacing.s,
  },
  expenseSummaryTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
  },
  expenseSummaryContainer: {
    marginBottom: spacing.l,
  },
  expenseSummaryTotal: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
    marginBottom: spacing.l,
  },
  expenseDistribution: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: scaleWidth(12),
    padding: spacing.m,
  },
  expenseCategoryBar: {
    marginBottom: isSmallDevice ? spacing.s : spacing.m,
  },
  expenseCategoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  categoryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLabelText: {
    fontSize: fontSizes.s,
    marginLeft: spacing.xs,
  },
  categoryAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryAmountText: {
    fontSize: fontSizes.s,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  categoryPercentText: {
    fontSize: fontSizes.s,
    width: scaleWidth(30),
    textAlign: 'right',
  },
  progressBarContainer: {
    height: scaleHeight(8),
    borderRadius: scaleWidth(4),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  addButtonContainer: {
    width: '100%',
  },
  addExpenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(12),
    minHeight: scaleHeight(44), // Ensure minimum touch target height
  },
  addExpenseButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  
  // Expenses List
  expenseList: {
    marginBottom: spacing.l,
  },
  expensesCard: {
    borderRadius: scaleWidth(16),
    padding: spacing.xl,
    marginBottom: spacing.m,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    minHeight: scaleHeight(200),
  },
  expensesCardTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
    marginBottom: spacing.l,
  },
  expenseCategorySection: {
    marginBottom: spacing.l,
  },
  expenseCategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  expenseCategoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: scaleWidth(12),
    height: scaleWidth(12),
    borderRadius: scaleWidth(6),
    marginRight: spacing.xs,
  },
  expenseCategoryName: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  expenseCategoryTotal: {
    fontSize: fontSizes.m,
    fontWeight: '700',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    marginVertical: spacing.xxs,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: scaleWidth(8),
    minHeight: scaleHeight(60), // Increased height for better touch target
  },
  expenseName: {
    fontSize: fontSizes.m,
    flex: 1,
  },
  expenseAmount: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  oneOffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  oneOffItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.l,
    borderBottomWidth: 1,
    minHeight: scaleHeight(70), // Increased height for better touch target
  },
  oneOffItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: scaleWidth(8),
    height: scaleWidth(8),
    borderRadius: scaleWidth(4),
    marginRight: spacing.s,
  },
  oneOffCategory: {
    fontSize: fontSizes.xs,
    marginLeft: spacing.s,
  },
  
  // Add Form
  addForm: {
    borderRadius: scaleWidth(16),
    padding: spacing.xl,
    marginBottom: spacing.m,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    minHeight: scaleHeight(200),
  },
  addFormTitle: {
    fontSize: fontSizes.m,
    fontWeight: 'bold',
    marginBottom: spacing.m,
  },
  formRow: {
    marginBottom: spacing.m,
  },
  input: {
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    padding: spacing.m,
    fontSize: fontSizes.m,
    minHeight: scaleHeight(44), // Ensure minimum touch target height
  },
  formLabel: {
    fontSize: fontSizes.s,
    marginBottom: spacing.s,
  },
  typeOptions: {
    flexDirection: isSmallDevice ? 'column' : 'row',
    flexWrap: 'wrap',
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(20),
    marginRight: spacing.s,
    borderWidth: 1,
    marginBottom: spacing.xs,
    minHeight: scaleHeight(40), // Ensure adequate touch target
  },
  typeIcon: {
    marginRight: spacing.xxs,
  },
  typeOptionText: {
    fontSize: fontSizes.s,
  },
  categoryScroll: {
    marginBottom: spacing.s,
  },
  categoryOptions: {
    flexDirection: 'row',
    paddingVertical: spacing.xxs,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(20),
    marginRight: spacing.s,
    borderWidth: 1,
    minHeight: scaleHeight(40), // Ensure adequate touch target
  },
  categoryIcon: {
    marginRight: spacing.xxs,
  },
  categoryOptionText: {
    fontSize: fontSizes.s,
  },
  addActionButton: {
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(12),
    alignItems: 'center',
    marginTop: spacing.xs,
    minHeight: scaleHeight(44), // Ensure minimum touch target height
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: scaleWidth(16),
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: spacing.s,
  },
  emptyIcon: {
    marginBottom: spacing.m,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: fontSizes.m,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  emptySubText: {
    fontSize: fontSizes.s,
    textAlign: 'center',
    opacity: 0.7,
  },
  
  // Edit Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  editModal: {
    width: '100%',
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  editModalTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
  },
  editForm: {
    maxHeight: isSmallDevice ? scaleHeight(400) : scaleHeight(500),
  },
  editModalActions: {
    justifyContent: 'space-between',
    marginTop: spacing.l,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
    minWidth: scaleWidth(100),
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  rightButtons: {
    flexDirection: 'row',
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    marginRight: spacing.s,
    minWidth: scaleWidth(80),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: scaleWidth(12),
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    minWidth: scaleWidth(80),
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: '500',
  },
  
  // Upgrade Modal Styles
  upgradeModal: {
    width: '90%',
    maxWidth: 500,
    borderRadius: scaleWidth(20),
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  upgradeModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  upgradeModalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginTop: spacing.m,
    textAlign: 'center',
  },
  upgradeModalMessage: {
    fontSize: fontSizes.m,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: scaleHeight(24),
    paddingHorizontal: spacing.m,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(16),
    width: '100%',
    minHeight: scaleHeight(50),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: 'bold',
  },
  laterButton: {
    marginTop: spacing.l,
    padding: spacing.m,
  },
  laterButtonText: {
    fontSize: fontSizes.s,
  }
});

export default ExpensesTab;