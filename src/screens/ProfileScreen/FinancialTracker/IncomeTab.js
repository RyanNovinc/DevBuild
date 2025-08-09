// src/screens/ProfileScreen/FinancialTracker/IncomeTab.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  ScrollView,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

const IncomeTab = ({ theme, data, handlers }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formAnimation] = useState(new Animated.Value(0));
  const [editingIncome, setEditingIncome] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('');
  const [incomeSummary, setIncomeSummary] = useState({
    primary: 0,
    side: 0,
    passive: 0,
    oneOff: 0,
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
    totalIncome,
    isDarkMode,
    formatCurrency,
    newItemName,
    newItemAmount,
    newItemType,
    userSubscriptionStatus // Important: Extract subscription status
  } = data;
  
  const {
    setNewItemName,
    setNewItemAmount,
    setNewItemType,
    handleAddIncome,
    handleDeleteItem,
    handleUpdateItem
  } = handlers;

  // Calculate income summary by type
  useEffect(() => {
    const summary = {
      primary: 0,
      side: 0, 
      passive: 0,
      oneOff: 0,
      other: 0
    };
    
    financialData.incomeSources.forEach(income => {
      // Ensure we parse the amount to a number
      const amount = parseFloat(income.amount);
      
      if (income.type === 'primary') summary.primary += amount;
      else if (income.type === 'side') summary.side += amount;
      else if (income.type === 'passive') summary.passive += amount;
      else if (income.type === 'one-off') summary.oneOff += amount;
      else summary.other += amount;
    });
    
    setIncomeSummary(summary);
  }, [financialData.incomeSources]);
  
  // Toggle add form visibility with animation
  const toggleAddForm = () => {
    // Check subscription status - but use the parent's isPremium check instead
    if (userSubscriptionStatus === 'free' || !data.isPremium) {
      showUpgradePrompt('Upgrade to Lifetime to add income sources and track your finances.');
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
  
  // Local validation for add income - MODIFIED to check subscription status
  const validateAndAddIncome = () => {
    // Check if user is on free plan
    if (userSubscriptionStatus === 'free') {
      // Show the upgrade popup but DO NOT close the form
      showUpgradePrompt('Upgrade to Lifetime to add income sources and track your finances.');
      // Important: Don't close the form or clear data yet - let user see the popup first
      return;
    }
    
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter a name for the income source.');
      return;
    }
    
    const amount = parseFloat(newItemAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than zero.');
      return;
    }
    
    handleAddIncome();
    // Auto-collapse form after adding
    toggleAddForm();
  };
  
  // Start editing an income item
  const handleEditIncome = (income) => {
    // Check if user is on free plan
    if (userSubscriptionStatus === 'free') {
      showUpgradePrompt('Upgrade to Lifetime to edit income sources and track your finances.');
      return;
    }
    
    setEditingIncome(income);
    setEditName(income.name);
    setEditAmount(income.amount.toString());
    setEditType(income.type);
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setEditingIncome(null);
    setEditName('');
    setEditAmount('');
    setEditType('');
  };
  
  // Save edited income - MODIFIED to check subscription status
  const saveEditedIncome = () => {
    // Check if user is on free plan - redundant here since we check in handleEditIncome,
    // but keeping as a safeguard
    if (userSubscriptionStatus === 'free') {
      showUpgradePrompt('Upgrade to Lifetime to edit income sources and track your finances.');
      cancelEdit();
      return;
    }
    
    if (!editName.trim()) {
      Alert.alert('Error', 'Please enter a name for the income source.');
      return;
    }
    
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than zero.');
      return;
    }
    
    // Create updated income object
    const updatedIncome = {
      ...editingIncome,
      name: editName,
      amount: amount,
      type: editType
    };
    
    // Call parent handler to update income
    if (handleUpdateItem) {
      handleUpdateItem('income', updatedIncome);
    } else {
      // Fallback if handleUpdateItem is not provided
      console.warn('handleUpdateItem not provided');
    }
    
    // Close edit modal
    cancelEdit();
  };
  
  // Helper function to get income type color
  const getIncomeColor = (type) => {
    switch(type) {
      case 'primary': return '#4CAF50';
      case 'side': return '#8BC34A';
      case 'passive': return '#CDDC39';
      case 'one-off': return '#26A69A';
      case 'other': return '#A5D6A7';
      default: return '#A5D6A7';
    }
  };

  // Get income type name for display
  const getIncomeTypeName = (type) => {
    switch(type) {
      case 'primary': return 'Primary Income';
      case 'side': return 'Side Business';
      case 'passive': return 'Passive Income';
      case 'one-off': return 'One-time Income';
      case 'other': return 'Other Income';
      default: return 'Other Income';
    }
  };
  
  // Get icon for income type
  const getIncomeIcon = (type) => {
    switch(type) {
      case 'primary': return 'briefcase-outline';
      case 'side': return 'construct-outline';
      case 'passive': return 'trending-up-outline';
      case 'one-off': return 'gift-outline';
      case 'other': return 'list-outline';
      default: return 'cash-outline';
    }
  };

  // Get income items grouped by type
  const getIncomesByType = (type) => {
    return financialData.incomeSources.filter(income => income.type === type);
  };

  // Calculate percentage of total income
  const getIncomePercentage = (amount) => {
    if (totalIncome === 0) return 0;
    return (amount / totalIncome) * 100;
  };

  return (
    <ScrollView 
      style={[styles.tabContentContainer]} 
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Income Summary */}
      <View style={[styles.incomeSummaryCard, { 
        backgroundColor: theme.card, 
        borderColor: theme.border
      }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons 
              name="cash-outline" 
              size={scaleWidth(26)} 
              color="#4CAF50" 
              style={styles.cardIcon} 
            />
            <Text 
              style={[styles.incomeSummaryTitle, { color: theme.text }]}
              maxFontSizeMultiplier={1.5}
            >
              Income Sources
            </Text>
          </View>
        </View>
        
        <View style={styles.incomeSummaryContainer}>
          <Text 
            style={[styles.incomeSummaryTotal, { color: '#4CAF50' }]}
            maxFontSizeMultiplier={1.5}
          >
            {formatCurrency(totalIncome)} / month
          </Text>
          
          <View style={styles.incomeDistribution}>
            <View style={styles.distributionRow}>
              <View style={styles.distributionLabel}>
                <View style={[styles.distributionDot, { backgroundColor: '#4CAF50' }]} />
                <Text 
                  style={[styles.distributionText, { color: theme.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Primary
                </Text>
              </View>
              <Text 
                style={[styles.distributionAmount, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                {formatCurrency(incomeSummary.primary)}
              </Text>
              <Text 
                style={[styles.distributionPercent, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                {Math.round(getIncomePercentage(incomeSummary.primary))}%
              </Text>
            </View>
            
            <View style={styles.distributionRow}>
              <View style={styles.distributionLabel}>
                <View style={[styles.distributionDot, { backgroundColor: '#8BC34A' }]} />
                <Text 
                  style={[styles.distributionText, { color: theme.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Side Business
                </Text>
              </View>
              <Text 
                style={[styles.distributionAmount, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                {formatCurrency(incomeSummary.side)}
              </Text>
              <Text 
                style={[styles.distributionPercent, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                {Math.round(getIncomePercentage(incomeSummary.side))}%
              </Text>
            </View>
            
            <View style={styles.distributionRow}>
              <View style={styles.distributionLabel}>
                <View style={[styles.distributionDot, { backgroundColor: '#CDDC39' }]} />
                <Text 
                  style={[styles.distributionText, { color: theme.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Passive
                </Text>
              </View>
              <Text 
                style={[styles.distributionAmount, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                {formatCurrency(incomeSummary.passive)}
              </Text>
              <Text 
                style={[styles.distributionPercent, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                {Math.round(getIncomePercentage(incomeSummary.passive))}%
              </Text>
            </View>
            
            <View style={styles.distributionRow}>
              <View style={styles.distributionLabel}>
                <View style={[styles.distributionDot, { backgroundColor: '#26A69A' }]} />
                <Text 
                  style={[styles.distributionText, { color: theme.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  One-time
                </Text>
              </View>
              <Text 
                style={[styles.distributionAmount, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                {formatCurrency(incomeSummary.oneOff)}
              </Text>
              <Text 
                style={[styles.distributionPercent, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                {Math.round(getIncomePercentage(incomeSummary.oneOff))}%
              </Text>
            </View>
            
            {incomeSummary.other > 0 && (
              <View style={styles.distributionRow}>
                <View style={styles.distributionLabel}>
                  <View style={[styles.distributionDot, { backgroundColor: '#A5D6A7' }]} />
                  <Text 
                    style={[styles.distributionText, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Other
                  </Text>
                </View>
                <Text 
                  style={[styles.distributionAmount, { color: theme.text }]}
                  maxFontSizeMultiplier={1.3}
                >
                  {formatCurrency(incomeSummary.other)}
                </Text>
                <Text 
                  style={[styles.distributionPercent, { color: theme.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  {Math.round(getIncomePercentage(incomeSummary.other))}%
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Add income button */}
        <TouchableOpacity
          style={[
            styles.addIncomeButton, 
            { backgroundColor: '#4CAF50' },
            ensureAccessibleTouchTarget(scaleWidth(300), scaleHeight(48))
          ]}
          onPress={toggleAddForm}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Add Income Source"
          accessibilityHint={userSubscriptionStatus === 'free' 
            ? "Upgrade to access this Pro feature" 
            : "Opens form to add a new income source"}
        >
          <Ionicons 
            name="add" 
            size={scaleWidth(20)} 
            color="#FFFFFF" 
            style={{marginRight: spacing.xs}}
          />
          <Text 
            style={styles.addIncomeButtonText}
            maxFontSizeMultiplier={1.3}
          >
            Add Income Source
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Add Income Form - Collapsible */}
      {showAddForm && (
        <Animated.View 
          style={[
            styles.addForm, 
            { 
              backgroundColor: theme.card, 
              borderColor: theme.border,
              opacity: formAnimation,
              maxHeight: formAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [0, Math.round(450)]
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
            Add Income Source
          </Text>
          
          <View style={styles.formRow}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Name (e.g. Salary, Freelancing)"
              placeholderTextColor={theme.textSecondary}
              value={newItemName}
              onChangeText={setNewItemName}
              accessible={true}
              accessibilityLabel="Income source name"
              accessibilityHint="Enter a name for this income source"
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
              placeholder="Monthly Amount"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={newItemAmount}
              onChangeText={setNewItemAmount}
              accessible={true}
              accessibilityLabel="Monthly amount"
              accessibilityHint="Enter the monthly amount for this income source"
              maxFontSizeMultiplier={1.3}
            />
          </View>
          
          <View style={styles.formRow}>
            <Text 
              style={[styles.formLabel, { color: theme.textSecondary }]}
              maxFontSizeMultiplier={1.3}
            >
              Income Type:
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.typeScroll} 
              nestedScrollEnabled={true}
              contentContainerStyle={isSmallDevice ? { paddingRight: spacing.l } : null}
            >
              <View style={styles.typeOptions}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    { backgroundColor: newItemType === 'primary' ? 'rgba(76,175,80,0.2)' : 'transparent' },
                    { borderColor: getIncomeColor('primary') },
                    ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(40))
                  ]}
                  onPress={() => setNewItemType('primary')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemType === 'primary' }}
                  accessibilityLabel="Primary income type"
                >
                  <Ionicons 
                    name="briefcase-outline" 
                    size={scaleWidth(16)} 
                    color={getIncomeColor('primary')} 
                    style={styles.typeIcon} 
                  />
                  <Text 
                    style={[
                      styles.typeOptionText, 
                      { color: newItemType === 'primary' ? getIncomeColor('primary') : theme.text }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Primary
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    { backgroundColor: newItemType === 'side' ? 'rgba(139,195,74,0.2)' : 'transparent' },
                    { borderColor: getIncomeColor('side') },
                    ensureAccessibleTouchTarget(scaleWidth(120), scaleHeight(40))
                  ]}
                  onPress={() => setNewItemType('side')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemType === 'side' }}
                  accessibilityLabel="Side business income type"
                >
                  <Ionicons 
                    name="construct-outline" 
                    size={scaleWidth(16)} 
                    color={getIncomeColor('side')} 
                    style={styles.typeIcon} 
                  />
                  <Text 
                    style={[
                      styles.typeOptionText, 
                      { color: newItemType === 'side' ? getIncomeColor('side') : theme.text }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Side Business
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    { backgroundColor: newItemType === 'passive' ? 'rgba(205,220,57,0.2)' : 'transparent' },
                    { borderColor: getIncomeColor('passive') },
                    ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(40))
                  ]}
                  onPress={() => setNewItemType('passive')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemType === 'passive' }}
                  accessibilityLabel="Passive income type"
                >
                  <Ionicons 
                    name="trending-up-outline" 
                    size={scaleWidth(16)} 
                    color={getIncomeColor('passive')} 
                    style={styles.typeIcon} 
                  />
                  <Text 
                    style={[
                      styles.typeOptionText, 
                      { color: newItemType === 'passive' ? getIncomeColor('passive') : theme.text }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Passive
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    { backgroundColor: newItemType === 'one-off' ? 'rgba(38,166,154,0.2)' : 'transparent' },
                    { borderColor: getIncomeColor('one-off') },
                    ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(40))
                  ]}
                  onPress={() => setNewItemType('one-off')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemType === 'one-off' }}
                  accessibilityLabel="One-time income type"
                >
                  <Ionicons 
                    name="gift-outline" 
                    size={scaleWidth(16)} 
                    color={getIncomeColor('one-off')} 
                    style={styles.typeIcon} 
                  />
                  <Text 
                    style={[
                      styles.typeOptionText, 
                      { color: newItemType === 'one-off' ? getIncomeColor('one-off') : theme.text }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    One-time
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    { backgroundColor: newItemType === 'other' ? 'rgba(165,214,167,0.2)' : 'transparent' },
                    { borderColor: getIncomeColor('other') },
                    ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(40))
                  ]}
                  onPress={() => setNewItemType('other')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemType === 'other' }}
                  accessibilityLabel="Other income type"
                >
                  <Ionicons 
                    name="list-outline" 
                    size={scaleWidth(16)} 
                    color={getIncomeColor('other')} 
                    style={styles.typeIcon} 
                  />
                  <Text 
                    style={[
                      styles.typeOptionText, 
                      { color: newItemType === 'other' ? getIncomeColor('other') : theme.text }
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
              { backgroundColor: '#4CAF50' },
              ensureAccessibleTouchTarget(scaleWidth(200), scaleHeight(48))
            ]}
            onPress={validateAndAddIncome}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add income source"
            accessibilityHint="Saves this income source to your list"
          >
            <Text 
              style={styles.addButtonText}
              maxFontSizeMultiplier={1.3}
            >
              Add Income Source
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      
      {/* Income List - Grouped by Type */}
      <View style={styles.incomeList}>
        {financialData.incomeSources.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: theme.border }]}>
            <Ionicons 
              name="cash-outline" 
              size={scaleWidth(32)} 
              color={theme.textSecondary} 
              style={styles.emptyIcon} 
            />
            <Text 
              style={[styles.emptyText, { color: theme.textSecondary }]}
              maxFontSizeMultiplier={1.3}
            >
              No income sources added yet
            </Text>
            <Text 
              style={[styles.emptySubText, { color: theme.textSecondary }]}
              maxFontSizeMultiplier={1.3}
            >
              {userSubscriptionStatus === 'free' 
                ? "Upgrade to Lifetime to add income sources" 
                : "Tap the + button to add your first income source"}
            </Text>
          </View>
        ) : (
          // Group income sources by type
          <>
            {/* Primary Income */}
            {getIncomesByType('primary').length > 0 && (
              <View style={styles.incomeTypeSection}>
                <View style={styles.incomeSectionHeader}>
                  <View style={styles.incomeSectionTitleContainer}>
                    <Ionicons 
                      name="briefcase-outline" 
                      size={scaleWidth(20)} 
                      color="#4CAF50" 
                      style={styles.incomeSectionIcon} 
                    />
                    <Text 
                      style={[styles.incomeSectionTitle, { color: theme.text }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Primary Income
                    </Text>
                  </View>
                  <Text 
                    style={[styles.incomeSectionTotal, { color: '#4CAF50' }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {formatCurrency(incomeSummary.primary)}
                  </Text>
                </View>
                
                {getIncomesByType('primary').map((income) => (
                  <TouchableOpacity 
                    key={income.id} 
                    style={[
                      styles.incomeItem, 
                      { backgroundColor: theme.card, borderColor: theme.border },
                      ensureAccessibleTouchTarget(scaleWidth(300), scaleHeight(60))
                    ]}
                    onPress={() => handleEditIncome(income)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`${income.name}, ${formatCurrency(income.amount)}`}
                    accessibilityHint="Tap to edit this income source"
                  >
                    <View style={styles.incomeItemContent}>
                      <Text 
                        style={[styles.incomeName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {income.name}
                      </Text>
                      <Text 
                        style={[styles.incomeAmount, { color: '#4CAF50' }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {formatCurrency(income.amount)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* Side Business Income */}
            {getIncomesByType('side').length > 0 && (
              <View style={styles.incomeTypeSection}>
                <View style={styles.incomeSectionHeader}>
                  <View style={styles.incomeSectionTitleContainer}>
                    <Ionicons 
                      name="construct-outline" 
                      size={scaleWidth(20)} 
                      color="#8BC34A" 
                      style={styles.incomeSectionIcon} 
                    />
                    <Text 
                      style={[styles.incomeSectionTitle, { color: theme.text }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Side Business
                    </Text>
                  </View>
                  <Text 
                    style={[styles.incomeSectionTotal, { color: '#8BC34A' }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {formatCurrency(incomeSummary.side)}
                  </Text>
                </View>
                
                {getIncomesByType('side').map((income) => (
                  <TouchableOpacity 
                    key={income.id} 
                    style={[
                      styles.incomeItem, 
                      { backgroundColor: theme.card, borderColor: theme.border },
                      ensureAccessibleTouchTarget(scaleWidth(300), scaleHeight(60))
                    ]}
                    onPress={() => handleEditIncome(income)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`${income.name}, ${formatCurrency(income.amount)}`}
                    accessibilityHint="Tap to edit this income source"
                  >
                    <View style={styles.incomeItemContent}>
                      <Text 
                        style={[styles.incomeName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {income.name}
                      </Text>
                      <Text 
                        style={[styles.incomeAmount, { color: '#8BC34A' }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {formatCurrency(income.amount)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* Passive Income */}
            {getIncomesByType('passive').length > 0 && (
              <View style={styles.incomeTypeSection}>
                <View style={styles.incomeSectionHeader}>
                  <View style={styles.incomeSectionTitleContainer}>
                    <Ionicons 
                      name="trending-up-outline" 
                      size={scaleWidth(20)} 
                      color="#CDDC39" 
                      style={styles.incomeSectionIcon} 
                    />
                    <Text 
                      style={[styles.incomeSectionTitle, { color: theme.text }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Passive Income
                    </Text>
                  </View>
                  <Text 
                    style={[styles.incomeSectionTotal, { color: '#CDDC39' }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {formatCurrency(incomeSummary.passive)}
                  </Text>
                </View>
                
                {getIncomesByType('passive').map((income) => (
                  <TouchableOpacity 
                    key={income.id} 
                    style={[
                      styles.incomeItem, 
                      { backgroundColor: theme.card, borderColor: theme.border },
                      ensureAccessibleTouchTarget(scaleWidth(300), scaleHeight(60))
                    ]}
                    onPress={() => handleEditIncome(income)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`${income.name}, ${formatCurrency(income.amount)}`}
                    accessibilityHint="Tap to edit this income source"
                  >
                    <View style={styles.incomeItemContent}>
                      <Text 
                        style={[styles.incomeName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {income.name}
                      </Text>
                      <Text 
                        style={[styles.incomeAmount, { color: '#CDDC39' }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {formatCurrency(income.amount)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* One-off Income */}
            {getIncomesByType('one-off').length > 0 && (
              <View style={styles.incomeTypeSection}>
                <View style={styles.incomeSectionHeader}>
                  <View style={styles.incomeSectionTitleContainer}>
                    <Ionicons 
                      name="gift-outline" 
                      size={scaleWidth(20)} 
                      color="#26A69A" 
                      style={styles.incomeSectionIcon} 
                    />
                    <Text 
                      style={[styles.incomeSectionTitle, { color: theme.text }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      One-time Income
                    </Text>
                  </View>
                  <Text 
                    style={[styles.incomeSectionTotal, { color: '#26A69A' }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {formatCurrency(incomeSummary.oneOff)}
                  </Text>
                </View>
                
                {getIncomesByType('one-off').map((income) => (
                  <TouchableOpacity 
                    key={income.id} 
                    style={[
                      styles.incomeItem, 
                      { backgroundColor: theme.card, borderColor: theme.border },
                      ensureAccessibleTouchTarget(scaleWidth(300), scaleHeight(60))
                    ]}
                    onPress={() => handleEditIncome(income)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`${income.name}, ${formatCurrency(income.amount)}`}
                    accessibilityHint="Tap to edit this income source"
                  >
                    <View style={styles.incomeItemContent}>
                      <Text 
                        style={[styles.incomeName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {income.name}
                      </Text>
                      <Text 
                        style={[styles.incomeAmount, { color: '#26A69A' }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {formatCurrency(income.amount)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* Other Income */}
            {getIncomesByType('other').length > 0 && (
              <View style={styles.incomeTypeSection}>
                <View style={styles.incomeSectionHeader}>
                  <View style={styles.incomeSectionTitleContainer}>
                    <Ionicons 
                      name="list-outline" 
                      size={scaleWidth(20)} 
                      color="#A5D6A7" 
                      style={styles.incomeSectionIcon} 
                    />
                    <Text 
                      style={[styles.incomeSectionTitle, { color: theme.text }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Other Income
                    </Text>
                  </View>
                  <Text 
                    style={[styles.incomeSectionTotal, { color: '#A5D6A7' }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {formatCurrency(incomeSummary.other)}
                  </Text>
                </View>
                
                {getIncomesByType('other').map((income) => (
                  <TouchableOpacity 
                    key={income.id} 
                    style={[
                      styles.incomeItem, 
                      { backgroundColor: theme.card, borderColor: theme.border },
                      ensureAccessibleTouchTarget(scaleWidth(300), scaleHeight(60))
                    ]}
                    onPress={() => handleEditIncome(income)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`${income.name}, ${formatCurrency(income.amount)}`}
                    accessibilityHint="Tap to edit this income source"
                  >
                    <View style={styles.incomeItemContent}>
                      <Text 
                        style={[styles.incomeName, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {income.name}
                      </Text>
                      <Text 
                        style={[styles.incomeAmount, { color: '#A5D6A7' }]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {formatCurrency(income.amount)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </View>
      
      {/* Edit Income Modal */}
      <Modal
        visible={editingIncome !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.editModal, 
            { 
              backgroundColor: theme.card,
              marginTop: safeSpacing.top,
              marginBottom: safeSpacing.bottom,
              marginLeft: safeSpacing.left,
              marginRight: safeSpacing.right,
              maxHeight: height - safeSpacing.top * 2
            }
          ]}>
            <View style={styles.editModalHeader}>
              <Text 
                style={[styles.editModalTitle, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                Edit Income Source
              </Text>
              <TouchableOpacity 
                onPress={cancelEdit}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close"
                accessibilityHint="Closes the edit form without saving"
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Ionicons name="close" size={scaleWidth(24)} color={theme.textSecondary} />
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
                  accessibilityLabel="Income source name"
                  accessibilityHint="Edit the name of this income source"
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
                  accessibilityLabel="Income amount"
                  accessibilityHint="Edit the amount of this income source"
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
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.typeScroll} 
                  nestedScrollEnabled={true}
                  contentContainerStyle={isSmallDevice ? { paddingRight: spacing.l } : null}
                >
                  <View style={styles.typeOptions}>
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        { backgroundColor: editType === 'primary' ? 'rgba(76,175,80,0.2)' : 'transparent' },
                        { borderColor: getIncomeColor('primary') },
                        ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(40))
                      ]}
                      onPress={() => setEditType('primary')}
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: editType === 'primary' }}
                      accessibilityLabel="Primary income type"
                    >
                      <Ionicons 
                        name="briefcase-outline" 
                        size={scaleWidth(16)} 
                        color={getIncomeColor('primary')} 
                        style={styles.typeIcon} 
                      />
                      <Text 
                        style={[
                          styles.typeOptionText, 
                          { color: editType === 'primary' ? getIncomeColor('primary') : theme.text }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Primary
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        { backgroundColor: editType === 'side' ? 'rgba(139,195,74,0.2)' : 'transparent' },
                        { borderColor: getIncomeColor('side') },
                        ensureAccessibleTouchTarget(scaleWidth(120), scaleHeight(40))
                      ]}
                      onPress={() => setEditType('side')}
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: editType === 'side' }}
                      accessibilityLabel="Side business income type"
                    >
                      <Ionicons 
                        name="construct-outline" 
                        size={scaleWidth(16)} 
                        color={getIncomeColor('side')} 
                        style={styles.typeIcon} 
                      />
                      <Text 
                        style={[
                          styles.typeOptionText, 
                          { color: editType === 'side' ? getIncomeColor('side') : theme.text }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Side Business
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        { backgroundColor: editType === 'passive' ? 'rgba(205,220,57,0.2)' : 'transparent' },
                        { borderColor: getIncomeColor('passive') },
                        ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(40))
                      ]}
                      onPress={() => setEditType('passive')}
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: editType === 'passive' }}
                      accessibilityLabel="Passive income type"
                    >
                      <Ionicons 
                        name="trending-up-outline" 
                        size={scaleWidth(16)} 
                        color={getIncomeColor('passive')} 
                        style={styles.typeIcon} 
                      />
                      <Text 
                        style={[
                          styles.typeOptionText, 
                          { color: editType === 'passive' ? getIncomeColor('passive') : theme.text }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Passive
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        { backgroundColor: editType === 'one-off' ? 'rgba(38,166,154,0.2)' : 'transparent' },
                        { borderColor: getIncomeColor('one-off') },
                        ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(40))
                      ]}
                      onPress={() => setEditType('one-off')}
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: editType === 'one-off' }}
                      accessibilityLabel="One-time income type"
                    >
                      <Ionicons 
                        name="gift-outline" 
                        size={scaleWidth(16)} 
                        color={getIncomeColor('one-off')} 
                        style={styles.typeIcon} 
                      />
                      <Text 
                        style={[
                          styles.typeOptionText, 
                          { color: editType === 'one-off' ? getIncomeColor('one-off') : theme.text }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        One-time
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        { backgroundColor: editType === 'other' ? 'rgba(165,214,167,0.2)' : 'transparent' },
                        { borderColor: getIncomeColor('other') },
                        ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(40))
                      ]}
                      onPress={() => setEditType('other')}
                      accessible={true}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: editType === 'other' }}
                      accessibilityLabel="Other income type"
                    >
                      <Ionicons 
                        name="list-outline" 
                        size={scaleWidth(16)} 
                        color={getIncomeColor('other')} 
                        style={styles.typeIcon} 
                      />
                      <Text 
                        style={[
                          styles.typeOptionText, 
                          { color: editType === 'other' ? getIncomeColor('other') : theme.text }
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
                    { borderColor: '#4CAF50' },
                    ensureAccessibleTouchTarget(scaleWidth(120), scaleHeight(50))
                  ]}
                  onPress={() => {
                    if (userSubscriptionStatus === 'free') {
                      showUpgradePrompt('Upgrade to Lifetime to manage income sources.');
                      cancelEdit();
                    } else {
                      handleDeleteItem('income', editingIncome.id);
                      cancelEdit();
                    }
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Delete income source"
                  accessibilityHint="Permanently removes this income source"
                >
                  <Ionicons name="trash-outline" size={scaleWidth(20)} color="#4CAF50" />
                  <Text 
                    style={[styles.deleteButtonText, { color: '#4CAF50' }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Delete
                  </Text>
                </TouchableOpacity>
                
                <View style={[
                  styles.rightButtons,
                  isSmallDevice ? { marginTop: spacing.m } : null
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.cancelButton, 
                      { borderColor: theme.border },
                      ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(50))
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
                      { backgroundColor: '#4CAF50' },
                      ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(50))
                    ]}
                    onPress={saveEditedIncome}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Save changes"
                    accessibilityHint="Saves the updated income details"
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
              marginTop: safeSpacing.top,
              marginBottom: safeSpacing.bottom,
              marginLeft: safeSpacing.left,
              marginRight: safeSpacing.right
            }
          ]}>
            <View style={styles.upgradeModalHeader}>
              <Ionicons name="lock-closed" size={scaleWidth(40)} color="#3F51B5" />
              <Text 
                style={[styles.upgradeModalTitle, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                Pro Feature
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
                ensureAccessibleTouchTarget(scaleWidth(220), scaleHeight(50))
              ]}
              onPress={goToPricingScreen}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Upgrade to Lifetime"
              accessibilityHint="Opens the pricing screen to upgrade your subscription"
            >
              <Ionicons name="rocket" size={scaleWidth(20)} color="#FFFFFF" style={{marginRight: spacing.xs}} />
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
                ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(44))
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
  // Income Summary
  incomeSummaryCard: {
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
  incomeSummaryTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
  },
  incomeSummaryContainer: {
    marginBottom: spacing.l,
  },
  incomeSummaryTotal: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
    marginBottom: spacing.m,
  },
  incomeDistribution: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: scaleWidth(12),
    padding: spacing.m,
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  distributionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  distributionDot: {
    width: scaleWidth(10),
    height: scaleWidth(10),
    borderRadius: scaleWidth(5),
    marginRight: spacing.xs,
  },
  distributionText: {
    fontSize: fontSizes.s,
  },
  distributionAmount: {
    fontSize: fontSizes.s,
    fontWeight: '600',
    marginRight: spacing.m,
    flex: 1,
    textAlign: 'right',
  },
  distributionPercent: {
    fontSize: fontSizes.s,
    width: scaleWidth(40),
    textAlign: 'right',
  },
  addIncomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(12),
    minHeight: scaleHeight(44), // Ensure minimum touch target height
  },
  addIncomeButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  
  // Income List
  incomeList: {
    marginBottom: spacing.l,
  },
  incomeTypeSection: {
    marginBottom: spacing.xl,
  },
  incomeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  incomeSectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeSectionIcon: {
    marginRight: spacing.xs,
  },
  incomeSectionTitle: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  incomeSectionTotal: {
    fontSize: fontSizes.m,
    fontWeight: '700',
  },
  incomeItem: {
    borderRadius: scaleWidth(12),
    marginBottom: spacing.xs,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    padding: spacing.l,
    minHeight: scaleHeight(70), // Increased height for better touch target
  },
  incomeItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incomeName: {
    fontSize: fontSizes.m,
    fontWeight: '500',
    flex: 1,
  },
  incomeAmount: {
    fontSize: fontSizes.m,
    fontWeight: '700',
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
  typeScroll: {
    marginBottom: spacing.s,
  },
  typeOptions: {
    flexDirection: 'row',
    paddingVertical: spacing.xxs,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: scaleWidth(20),
    marginRight: spacing.s,
    borderWidth: 1,
    minHeight: scaleHeight(36), // Ensure minimum touch target height
  },
  typeIcon: {
    marginRight: spacing.xxs,
  },
  typeOptionText: {
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

export default IncomeTab;