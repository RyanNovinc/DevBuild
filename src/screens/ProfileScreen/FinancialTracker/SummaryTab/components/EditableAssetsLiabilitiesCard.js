// src/screens/ProfileScreen/FinancialTracker/SummaryTab/components/EditableAssetsLiabilitiesCard.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  ScrollView
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
  ensureAccessibleTouchTarget,
  useIsLandscape,
} from '../../../../../utils/responsive';

const EditableAssetsLiabilitiesCard = ({ theme, data, handlers }) => {
  const [showSavingsForm, setShowSavingsForm] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [savingsFormAnimation] = useState(new Animated.Value(0));
  const [debtFormAnimation] = useState(new Animated.Value(0));
  
  const isLandscape = useIsLandscape();
  
  const { 
    financialData,
    totalSavings,
    totalDebt,
    isDarkMode,
    formatCurrency,
    newItemName,
    newItemAmount,
    newItemType,
    isPremium
  } = data;
  
  const {
    setNewItemName,
    setNewItemAmount,
    setNewItemType,
    handleAddSavings,
    handleAddDebt,
    handleDeleteItem
  } = handlers;

  // Get style for add buttons based on context
  const getAddButtonStyle = (context) => {
    let color;
    switch(context) {
      case 'savings':
        color = '#4CAF50';
        break;
      case 'debt':
        color = '#F44336';
        break;
      default:
        color = '#673AB7';
    }
    
    return {
      width: scaleWidth(36),
      height: scaleWidth(36),
      borderRadius: scaleWidth(18),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: color,
      ...ensureAccessibleTouchTarget(scaleWidth(36), scaleWidth(36))
    };
  };

  // Toggle savings form visibility with animation
  const toggleSavingsForm = () => {
    if (!isPremium) {
      Alert.alert('Upgrade to Lifetime', 'Upgrade to Lifetime to add savings accounts and track your finances.');
      return;
    }
    
    if (showSavingsForm) {
      Animated.timing(savingsFormAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start(() => {
        setShowSavingsForm(false);
      });
    } else {
      setShowSavingsForm(true);
      if (showDebtForm) {
        toggleDebtForm();
      }
      Animated.timing(savingsFormAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  };
  
  // Toggle debt form visibility with animation
  const toggleDebtForm = () => {
    if (!isPremium) {
      Alert.alert('Upgrade to Lifetime', 'Upgrade to Lifetime to add debts and track your finances.');
      return;
    }
    
    if (showDebtForm) {
      Animated.timing(debtFormAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start(() => {
        setShowDebtForm(false);
      });
    } else {
      setShowDebtForm(true);
      if (showSavingsForm) {
        toggleSavingsForm();
      }
      Animated.timing(debtFormAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  };

  // Local validation for add savings
  const validateAndAddSavings = () => {
    if (!isPremium) {
      Alert.alert('Upgrade to Lifetime', 'Upgrade to Lifetime to add savings accounts and track your finances.');
      return;
    }
    
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter a name for the savings account.');
      return;
    }
    
    const amount = parseFloat(newItemAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than zero.');
      return;
    }
    
    handleAddSavings();
    toggleSavingsForm();
  };

  // Local validation for add debt
  const validateAndAddDebt = () => {
    if (!isPremium) {
      Alert.alert('Upgrade to Lifetime', 'Upgrade to Lifetime to add debts and track your finances.');
      return;
    }
    
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter a name for the debt.');
      return;
    }
    
    const amount = parseFloat(newItemAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than zero.');
      return;
    }
    
    handleAddDebt();
    toggleDebtForm();
  };
  
  // Wrapper for handleDeleteItem with premium check
  const handleDeleteItemWithPremiumCheck = (type, id) => {
    if (!isPremium) {
      Alert.alert('Upgrade to Lifetime', 'Upgrade to Lifetime to manage your financial accounts.');
      return;
    }
    
    handleDeleteItem(type, id);
  };

  return (
    <View style={[styles.assetsLiabilitiesCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons 
            name="wallet-outline" 
            size={scaleWidth(24)} 
            color="#009688" 
            style={styles.cardIcon} 
          />
          <Text 
            style={[styles.assetsLiabilitiesTitle, { color: theme.text }]}
            maxFontSizeMultiplier={1.5}
          >
            Assets & Liabilities
          </Text>
        </View>
      </View>
      
      {/* Savings Section */}
      <View style={styles.financialSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text 
              style={[styles.sectionTitle, { color: theme.text }]}
              maxFontSizeMultiplier={1.3}
            >
              Savings & Investments
            </Text>
            <Text 
              style={[styles.sectionTotal, { color: '#4CAF50' }]}
              maxFontSizeMultiplier={1.3}
            >
              {formatCurrency(totalSavings)}
            </Text>
          </View>
          <TouchableOpacity 
            style={getAddButtonStyle('savings')}
            onPress={toggleSavingsForm}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={showSavingsForm ? "Cancel adding savings" : "Add savings account"}
            accessibilityHint={showSavingsForm ? "Cancels adding a new savings account" : "Opens form to add a new savings account"}
          >
            <Ionicons 
              name={showSavingsForm ? "remove" : "add"} 
              size={scaleWidth(18)} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Add Savings Form - Collapsible */}
        {showSavingsForm && (
          <Animated.View 
            style={[
              styles.addAssetForm, 
              { 
                opacity: savingsFormAnimation,
                maxHeight: savingsFormAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.round(250)]
                }),
                transform: [{
                  translateY: savingsFormAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [Math.round(-10), 0]
                  })
                }]
              }
            ]}
          >
            <View style={[
              styles.addAssetInputs,
              isSmallDevice ? { flexDirection: 'column' } : { flexDirection: 'row' }
            ]}>
              <TextInput
                style={[styles.addAssetInput, { 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.text,
                  borderColor: theme.border,
                  flex: isSmallDevice ? 0 : 2,
                  marginBottom: isSmallDevice ? spacing.s : 0
                }]}
                placeholder="Account Name"
                placeholderTextColor={theme.textSecondary}
                value={newItemName}
                onChangeText={setNewItemName}
                accessible={true}
                accessibilityLabel="Savings account name"
                accessibilityHint="Enter the name of your savings account"
                maxFontSizeMultiplier={1.3}
              />
              <TextInput
                style={[styles.addAssetInput, { 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.text,
                  borderColor: theme.border,
                  flex: isSmallDevice ? 0 : 1
                }]}
                placeholder="Amount"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={newItemAmount}
                onChangeText={setNewItemAmount}
                accessible={true}
                accessibilityLabel="Savings amount"
                accessibilityHint="Enter the amount in this savings account"
                maxFontSizeMultiplier={1.3}
              />
            </View>
            
            <View style={styles.formTypeContainer}>
              <Text 
                style={[styles.formTypeLabel, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                Type:
              </Text>
              <View style={styles.typeOptions}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newItemType === 'emergency' && { backgroundColor: '#4CAF50' + '30' },
                    ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(40))
                  ]}
                  onPress={() => setNewItemType('emergency')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemType === 'emergency' }}
                  accessibilityLabel="Emergency savings type"
                >
                  <Text style={[
                    styles.typeOptionText, 
                    { color: theme.text },
                    newItemType === 'emergency' && { color: '#4CAF50', fontWeight: '600' }
                  ]}
                  maxFontSizeMultiplier={1.3}
                  >
                    Emergency
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newItemType === 'investment' && { backgroundColor: '#4CAF50' + '30' },
                    ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(40))
                  ]}
                  onPress={() => setNewItemType('investment')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemType === 'investment' }}
                  accessibilityLabel="Investment savings type"
                >
                  <Text style={[
                    styles.typeOptionText, 
                    { color: theme.text },
                    newItemType === 'investment' && { color: '#4CAF50', fontWeight: '600' }
                  ]}
                  maxFontSizeMultiplier={1.3}
                  >
                    Investment
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    newItemType === 'general' && { backgroundColor: '#4CAF50' + '30' },
                    ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(40))
                  ]}
                  onPress={() => setNewItemType('general')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: newItemType === 'general' }}
                  accessibilityLabel="General savings type"
                >
                  <Text style={[
                    styles.typeOptionText, 
                    { color: theme.text },
                    newItemType === 'general' && { color: '#4CAF50', fontWeight: '600' }
                  ]}
                  maxFontSizeMultiplier={1.3}
                  >
                    General
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.addAssetActionButton, 
                { backgroundColor: '#4CAF50' },
                ensureAccessibleTouchTarget(scaleWidth(200), scaleHeight(48))
              ]}
              onPress={validateAndAddSavings}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add savings account"
              accessibilityHint="Saves this account to your list"
            >
              <Text 
                style={styles.addButtonText}
                maxFontSizeMultiplier={1.3}
              >
                Add Savings
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        <View style={styles.itemsList}>
          {financialData.savings.map((item) => (
            <View 
              key={item.id} 
              style={[styles.assetItem, { 
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderColor: theme.border 
              }]}
              accessible={true}
              accessibilityLabel={`${item.name}, ${formatCurrency(item.amount)}, ${item.type === 'emergency' ? 'Emergency Fund' : item.type === 'investment' ? 'Investment' : 'General Savings'}`}
            >
              <View style={styles.assetItemLeft}>
                <Ionicons 
                  name={
                    item.type === 'emergency' ? "shield-outline" :
                    item.type === 'investment' ? "trending-up-outline" : "wallet-outline"
                  } 
                  size={scaleWidth(20)} 
                  color="#4CAF50" 
                  style={styles.assetIcon}
                />
                <View style={styles.assetDetails}>
                  <Text 
                    style={[styles.assetItemName, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.name}
                  </Text>
                  <Text 
                    style={[styles.assetItemType, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {item.type === 'emergency' ? 'Emergency Fund' :
                     item.type === 'investment' ? 'Investment' : 'General Savings'}
                  </Text>
                </View>
              </View>
              <View style={styles.assetItemRight}>
                <Text 
                  style={[styles.assetItemAmount, { color: '#4CAF50' }]}
                  maxFontSizeMultiplier={1.3}
                >
                  {formatCurrency(item.amount)}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    ensureAccessibleTouchTarget(scaleWidth(44), scaleHeight(44))
                  ]}
                  onPress={() => handleDeleteItemWithPremiumCheck('savings', item.id)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Delete savings account"
                  accessibilityHint="Removes this savings account from your list"
                >
                  <Ionicons name="trash-outline" size={scaleWidth(18)} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {financialData.savings.length === 0 && (
            <View style={[styles.emptyState, { borderColor: theme.border }]}>
              <Ionicons 
                name="wallet-outline" 
                size={scaleWidth(24)} 
                color={theme.textSecondary} 
                style={styles.emptyIcon} 
              />
              <Text 
                style={[styles.emptyText, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                No savings accounts added
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Debts Section */}
      <View style={styles.financialSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text 
              style={[styles.sectionTitle, { color: theme.text }]}
              maxFontSizeMultiplier={1.3}
            >
              Debts & Liabilities
            </Text>
            <Text 
              style={[styles.sectionTotal, { color: '#F44336' }]}
              maxFontSizeMultiplier={1.3}
            >
              {formatCurrency(totalDebt)}
            </Text>
          </View>
          <TouchableOpacity 
            style={getAddButtonStyle('debt')}
            onPress={toggleDebtForm}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={showDebtForm ? "Cancel adding debt" : "Add debt"}
            accessibilityHint={showDebtForm ? "Cancels adding a new debt" : "Opens form to add a new debt"}
          >
            <Ionicons 
              name={showDebtForm ? "remove" : "add"} 
              size={scaleWidth(18)} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Add Debt Form - Collapsible */}
        {showDebtForm && (
          <Animated.View 
            style={[
              styles.addAssetForm, 
              { 
                opacity: debtFormAnimation,
                maxHeight: debtFormAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.round(250)]
                }),
                transform: [{
                  translateY: debtFormAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [Math.round(-10), 0]
                  })
                }]
              }
            ]}
          >
            <View style={[
              styles.addAssetInputs,
              isSmallDevice ? { flexDirection: 'column' } : { flexDirection: 'row' }
            ]}>
              <TextInput
                style={[styles.addAssetInput, { 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.text,
                  borderColor: theme.border,
                  flex: isSmallDevice ? 0 : 2,
                  marginBottom: isSmallDevice ? spacing.s : 0
                }]}
                placeholder="Debt Name"
                placeholderTextColor={theme.textSecondary}
                value={newItemName}
                onChangeText={setNewItemName}
                accessible={true}
                accessibilityLabel="Debt name"
                accessibilityHint="Enter the name of this debt"
                maxFontSizeMultiplier={1.3}
              />
              <TextInput
                style={[styles.addAssetInput, { 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.text,
                  borderColor: theme.border,
                  flex: isSmallDevice ? 0 : 1
                }]}
                placeholder="Amount"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={newItemAmount}
                onChangeText={setNewItemAmount}
                accessible={true}
                accessibilityLabel="Debt amount"
                accessibilityHint="Enter the total amount of this debt"
                maxFontSizeMultiplier={1.3}
              />
            </View>
            <TextInput
              style={[styles.interestInput, { 
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Interest Rate % (optional)"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={newItemType}
              onChangeText={setNewItemType}
              accessible={true}
              accessibilityLabel="Interest rate percentage"
              accessibilityHint="Enter the interest rate as a percentage"
              maxFontSizeMultiplier={1.3}
            />
            
            <TouchableOpacity
              style={[
                styles.addAssetActionButton, 
                { backgroundColor: '#F44336' },
                ensureAccessibleTouchTarget(scaleWidth(200), scaleHeight(48))
              ]}
              onPress={validateAndAddDebt}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add debt"
              accessibilityHint="Saves this debt to your list"
            >
              <Text 
                style={styles.addButtonText}
                maxFontSizeMultiplier={1.3}
              >
                Add Debt
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        <View style={styles.itemsList}>
          {financialData.debts.map((item) => (
            <View 
              key={item.id} 
              style={[styles.assetItem, { 
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderColor: theme.border 
              }]}
              accessible={true}
              accessibilityLabel={`${item.name}, ${formatCurrency(item.amount)}${item.interestRate > 0 ? `, ${item.interestRate}% interest` : ''}`}
            >
              <View style={styles.debtItemLeft}>
                <Ionicons 
                  name={item.interestRate > 10 ? "alert-circle-outline" : "document-text-outline"} 
                  size={scaleWidth(20)} 
                  color="#F44336" 
                  style={styles.assetIcon}
                />
                <View style={styles.assetDetails}>
                  <Text 
                    style={[styles.assetItemName, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.name}
                  </Text>
                  {item.interestRate > 0 && (
                    <Text 
                      style={[styles.interestRate, { color: theme.textSecondary }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {item.interestRate}% interest
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.assetItemRight}>
                <Text 
                  style={[styles.assetItemAmount, { color: '#F44336' }]}
                  maxFontSizeMultiplier={1.3}
                >
                  {formatCurrency(item.amount)}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    ensureAccessibleTouchTarget(scaleWidth(44), scaleHeight(44))
                  ]}
                  onPress={() => handleDeleteItemWithPremiumCheck('debt', item.id)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Delete debt"
                  accessibilityHint="Removes this debt from your list"
                >
                  <Ionicons name="trash-outline" size={scaleWidth(18)} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {financialData.debts.length === 0 && (
            <View style={[styles.emptyState, { borderColor: theme.border }]}>
              <Ionicons 
                name="document-text-outline" 
                size={scaleWidth(24)} 
                color={theme.textSecondary} 
                style={styles.emptyIcon} 
              />
              <Text 
                style={[styles.emptyText, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                No debts added (that's great!)
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Net Worth */}
      <View style={styles.netWorthContainer}>
        <Text 
          style={[styles.netWorthLabel, { color: theme.text }]}
          maxFontSizeMultiplier={1.3}
        >
          Net Worth:
        </Text>
        <Text 
          style={[styles.netWorthValue, { 
            color: (totalSavings - totalDebt) >= 0 ? '#4CAF50' : '#F44336',
            fontWeight: 'bold'
          }]}
          maxFontSizeMultiplier={1.3}
        >
          {formatCurrency(totalSavings - totalDebt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  assetsLiabilitiesCard: {
    borderRadius: scaleWidth(16),
    padding: spacing.xl,
    marginBottom: spacing.m,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: scaleHeight(250),
  },
  cardHeader: {
    marginBottom: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    marginRight: spacing.s,
  },
  assetsLiabilitiesTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
  },
  financialSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
    marginTop: spacing.xs,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  sectionTotal: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
  },
  itemsList: {
    marginBottom: spacing.s,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.l,
    borderRadius: scaleWidth(12),
    marginBottom: spacing.s,
    borderWidth: 1,
    minHeight: scaleHeight(70),
  },
  debtItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetIcon: {
    marginRight: spacing.s,
  },
  assetDetails: {
    flex: 1,
  },
  assetItemName: {
    fontSize: fontSizes.m,
    fontWeight: '500',
    marginBottom: spacing.xxs,
  },
  assetItemType: {
    fontSize: fontSizes.xs,
  },
  interestRate: {
    fontSize: fontSizes.xs,
  },
  assetItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetItemAmount: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginRight: spacing.s,
  },
  addAssetForm: {
    marginBottom: spacing.m,
    overflow: 'hidden',
  },
  addAssetInputs: {
    marginBottom: spacing.s,
  },
  addAssetInput: {
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    padding: spacing.m,
    fontSize: fontSizes.s,
    marginRight: spacing.xs,
    minHeight: scaleHeight(44),
  },
  formTypeContainer: {
    marginBottom: spacing.s,
  },
  formTypeLabel: {
    fontSize: fontSizes.s,
    marginBottom: spacing.xs,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeOption: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderRadius: scaleWidth(20),
    marginRight: spacing.s,
    marginBottom: spacing.xs,
    minHeight: scaleHeight(36),
  },
  typeOptionText: {
    fontSize: fontSizes.s,
  },
  interestInput: {
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    padding: spacing.m,
    fontSize: fontSizes.s,
    marginBottom: spacing.s,
    minHeight: scaleHeight(44),
  },
  addAssetActionButton: {
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(12),
    alignItems: 'center',
    minHeight: scaleHeight(44),
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  netWorthContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  netWorthLabel: {
    fontSize: fontSizes.l,
    fontWeight: '600',
  },
  netWorthValue: {
    fontSize: fontSizes.xl,
  },
  deleteButton: {
    padding: spacing.xxs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
    borderRadius: scaleWidth(12),
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: spacing.xs,
  },
  emptyIcon: {
    marginBottom: spacing.s,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: fontSizes.s,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default EditableAssetsLiabilitiesCard;