// src/screens/ProfileScreen/FinancialTracker/index.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet,
  Animated,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Import components
import CompactView from './CompactView';
import DetailModal from './DetailModal';

// Import utilities and services
import { 
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateTotalSavings,
  calculateTotalDebt,
  calculateSavingsPercentage,
  calculateIncomePercentile,
  calculateExpensePercentile,
  calculateSavingsPercentile,
  initializeWithExampleData
} from './utils';
import CurrencyService from './CurrencyService';
import { getCurrencySymbol } from '../../../utils/countryToCurrency';

const FinancialTracker = ({ 
  theme, 
  navigation, 
  isPremium = true,
  widgetId,
  saveWidgetData,
  loadWidgetData,
  widgetName 
}) => {
  // Financial data state with empty goals array
  const [financialData, setFinancialData] = useState({
    incomeSources: [],
    expenses: [],
    savings: [],
    debts: [],
    goals: [], // Empty goals array - no pre-filled goals
    currency: "$"
  });
  
  // Exchange rates state
  const [exchangeRatesLoaded, setExchangeRatesLoaded] = useState(false);
  
  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // New item form state - shared across tabs
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemType, setNewItemType] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  
  // Animation refs
  const barAnim = useRef(new Animated.Value(0)).current;
  const isDarkMode = theme.background === '#000000';
  
  // Function to ensure no pre-filled goals exist in storage
  const clearPrefilledGoals = async () => {
    try {
      const dataJson = await AsyncStorage.getItem('financialTrackerData');
      if (dataJson) {
        const currentData = JSON.parse(dataJson);
        
        // Create updated data with empty goals array
        const updatedData = {
          ...currentData,
          goals: [] // Ensure goals array is empty
        };
        
        // Save back to storage
        await AsyncStorage.setItem('financialTrackerData', JSON.stringify(updatedData));
        console.log('Pre-filled goals cleared successfully');
      }
    } catch (error) {
      console.error('Error clearing pre-filled goals:', error);
    }
  };
  
  // Load financial data on mount and clear pre-filled goals
  useEffect(() => {
    // First clear any pre-filled goals
    clearPrefilledGoals().then(() => {
      // Then load financial data (which will now have no pre-filled goals)
      loadFinancialData();
    });
    
    initializeExchangeRates();
  }, [widgetId, loadWidgetData]);

  // Initialize currency based on user's selected country
  const initializeCurrencyFromCountry = async () => {
    try {
      const savedCountry = await AsyncStorage.getItem('userCountry');
      if (savedCountry) {
        const currencySymbol = getCurrencySymbol(savedCountry);
        console.log(`Setting currency to ${currencySymbol} for country: ${savedCountry}`);
        return currencySymbol;
      }
    } catch (error) {
      console.error('Error loading country for currency initialization:', error);
    }
    
    // Default to $ if no country is found
    return "$";
  };
  
  // Initialize exchange rates
  const initializeExchangeRates = async () => {
    try {
      // This will be implemented when CurrencyService is ready
      setExchangeRatesLoaded(true);
    } catch (error) {
      console.error('Error initializing exchange rates:', error);
    }
  };
  
  // Animate bars when data changes
  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [financialData]);
  
  // Load financial data from storage
  const loadFinancialData = async () => {
    try {
      // Use widget instance storage if available, fall back to old storage for migration
      let dataJson = null;
      
      if (widgetId && loadWidgetData) {
        const widgetData = await loadWidgetData(widgetId);
        if (widgetData) {
          dataJson = JSON.stringify(widgetData);
        }
      }
      
      // For new widget instances with widgetId, never load old data - start completely fresh
      if (!dataJson && widgetId) {
        console.log('New financial tracker widget instance starting fresh - no data inheritance');
        return; // Exit early, don't load any old data
      }
      
      // Only fall back to old storage for very old installations without widgetId
      if (!dataJson && !widgetId) {
        dataJson = await AsyncStorage.getItem('financialTrackerData');
      }
      
      if (dataJson) {
        const loadedData = JSON.parse(dataJson);
        
        // Initialize currency from country if no currency is saved
        let currency = loadedData.currency;
        if (!currency) {
          currency = await initializeCurrencyFromCountry();
          console.log('Initialized currency from country:', currency);
        }
        
        setFinancialData(prevData => ({
          ...prevData,
          ...loadedData,
          // Ensure all required fields exist
          incomeSources: loadedData.incomeSources || [],
          expenses: loadedData.expenses || [],
          savings: loadedData.savings || [],
          debts: loadedData.debts || [],
          goals: loadedData.goals || [], // Empty array if no goals exist
          currency: currency
        }));
      } else {
        // Initialize with example data for better UX
        const exampleData = initializeWithExampleData();
        
        // CRITICAL: Ensure example data has empty goals array
        exampleData.goals = [];
        
        // Initialize currency from country for new users
        const countryCurrency = await initializeCurrencyFromCountry();
        exampleData.currency = countryCurrency;
        console.log('New financial tracker initialized with currency:', countryCurrency);
        
        setFinancialData(prevData => ({
          ...prevData,
          ...exampleData
        }));
        await AsyncStorage.setItem('financialTrackerData', JSON.stringify(exampleData));
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
  };
  
  // Save financial data to storage
  const saveFinancialData = async (updatedData) => {
    // If not premium, don't allow saving
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    try {
      // Use widget instance storage if available
      if (widgetId && saveWidgetData) {
        await saveWidgetData(widgetId, updatedData);
      } else {
        // Fall back to old storage
        await AsyncStorage.setItem('financialTrackerData', JSON.stringify(updatedData));
      }
      
      // Provide haptic feedback for data update
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error saving financial data:', error);
      Alert.alert('Error', 'Failed to save your financial data.');
    }
  };
  
  // Handle currency change
  const handleCurrencyChange = (newCurrency) => {
    // If not premium, don't allow changes
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    const updatedData = {
      ...financialData,
      currency: newCurrency
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };
  
  // Handle add new income source
  const handleAddIncome = () => {
    // If not premium, don't allow adding
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    if (!newItemName || !newItemAmount) {
      Alert.alert('Error', 'Please enter a name and amount.');
      return;
    }
    
    const newIncome = {
      id: Date.now().toString(),
      name: newItemName,
      amount: parseFloat(newItemAmount),
      type: newItemType || 'primary'
    };
    
    const updatedData = {
      ...financialData,
      incomeSources: [...financialData.incomeSources, newIncome]
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
    
    // Reset form
    setNewItemName('');
    setNewItemAmount('');
    setNewItemType('');
  };
  
  // Handle add new expense
  const handleAddExpense = () => {
    // If not premium, don't allow adding
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    if (!newItemName || !newItemAmount) {
      Alert.alert('Error', 'Please enter a name and amount.');
      return;
    }
    
    const newExpense = {
      id: Date.now().toString(),
      name: newItemName,
      amount: parseFloat(newItemAmount),
      type: newItemType || 'recurring',
      category: newItemCategory || 'other'
    };
    
    const updatedData = {
      ...financialData,
      expenses: [...financialData.expenses, newExpense]
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
    
    // Reset form
    setNewItemName('');
    setNewItemAmount('');
    setNewItemType('');
    setNewItemCategory('');
  };
  
  // Handle add new savings
  const handleAddSavings = () => {
    // If not premium, don't allow adding
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    if (!newItemName || !newItemAmount) {
      Alert.alert('Error', 'Please enter a name and amount.');
      return;
    }
    
    const newSavings = {
      id: Date.now().toString(),
      name: newItemName,
      amount: parseFloat(newItemAmount),
      type: newItemType || 'general'
    };
    
    const updatedData = {
      ...financialData,
      savings: [...financialData.savings, newSavings]
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
    
    // Reset form
    setNewItemName('');
    setNewItemAmount('');
    setNewItemType('');
  };
  
  // Handle add new debt
  const handleAddDebt = () => {
    // If not premium, don't allow adding
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    if (!newItemName || !newItemAmount) {
      Alert.alert('Error', 'Please enter a name and amount.');
      return;
    }
    
    const newDebt = {
      id: Date.now().toString(),
      name: newItemName,
      amount: parseFloat(newItemAmount),
      interestRate: parseFloat(newItemType) || 0
    };
    
    const updatedData = {
      ...financialData,
      debts: [...financialData.debts, newDebt]
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
    
    // Reset form
    setNewItemName('');
    setNewItemAmount('');
    setNewItemType('');
  };
  
  // Handle delete item
  const handleDeleteItem = (type, id) => {
    // If not premium, don't allow deleting
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    let updatedData;
    
    if (type === 'income') {
      updatedData = {
        ...financialData,
        incomeSources: financialData.incomeSources.filter(item => item.id !== id)
      };
    } else if (type === 'expense') {
      updatedData = {
        ...financialData,
        expenses: financialData.expenses.filter(item => item.id !== id)
      };
    } else if (type === 'savings') {
      updatedData = {
        ...financialData,
        savings: financialData.savings.filter(item => item.id !== id)
      };
    } else if (type === 'debt') {
      updatedData = {
        ...financialData,
        debts: financialData.debts.filter(item => item.id !== id)
      };
    }
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };
  
  // Handle update item
  const handleUpdateItem = (type, updatedItem) => {
    // If not premium, don't allow updating
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    let updatedData;
    
    if (type === 'income') {
      updatedData = {
        ...financialData,
        incomeSources: financialData.incomeSources.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      };
    } else if (type === 'expense') {
      updatedData = {
        ...financialData,
        expenses: financialData.expenses.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      };
    } else if (type === 'savings') {
      updatedData = {
        ...financialData,
        savings: financialData.savings.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      };
    } else if (type === 'debt') {
      updatedData = {
        ...financialData,
        debts: financialData.debts.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      };
    }
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };
  
  // Handle goal toggle
  const handleToggleGoal = (id) => {
    // If not premium, don't allow toggling
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    const updatedGoals = financialData.goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    );
    
    const updatedData = {
      ...financialData,
      goals: updatedGoals
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };

  // Handle add new goal
  const handleAddGoal = (newGoal) => {
    // If not premium, don't allow adding
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    const updatedData = {
      ...financialData,
      goals: [...financialData.goals, newGoal]
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };
  
  // Handle delete goal
  const handleDeleteGoal = (id) => {
    // If not premium, don't allow deleting
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    const updatedData = {
      ...financialData,
      goals: financialData.goals.filter(goal => goal.id !== id)
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };

  // Handle replacing all goals with preset goals
  const handleReplaceAllGoals = (newGoals) => {
    // If not premium, don't allow replacing
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    console.log("Replacing all goals with:", newGoals);
    
    const updatedData = {
      ...financialData,
      goals: newGoals
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };
  
  // Enhanced format currency function using the currency service
  const enhancedFormatCurrency = async (amount) => {
    if (!exchangeRatesLoaded) {
      // Fall back to simple formatting if exchange rates not loaded
      return `${financialData.currency}${amount.toLocaleString()}`;
    }
    
    try {
      // For now, we'll use simple formatting until CurrencyService is implemented
      return `${financialData.currency}${amount.toLocaleString()}`;
    } catch (error) {
      console.error('Currency conversion error:', error);
      // Fall back to simple formatting
      return `${financialData.currency}${amount.toLocaleString()}`;
    }
  };
  
  // Get totals for calculations
  const totalIncome = calculateTotalIncome(financialData);
  const totalExpenses = calculateTotalExpenses(financialData);
  const totalSavings = calculateTotalSavings(financialData);
  const totalDebt = calculateTotalDebt(financialData);
  const savingsPercentage = calculateSavingsPercentage(totalIncome, totalExpenses);
  const incomePercentile = calculateIncomePercentile(totalIncome);
  const expensePercentile = calculateExpensePercentile(totalExpenses);
  const savingsPercentile = calculateSavingsPercentile(savingsPercentage);
  
  // Get highest bar for chart scaling
  const highestBar = Math.max(totalIncome, totalExpenses);
  
  // Prepare data object for child components
  const data = {
    financialData,
    totalIncome,
    totalExpenses,
    totalSavings,
    totalDebt,
    savingsPercentage,
    incomePercentile,
    expensePercentile,
    savingsPercentile,
    highestBar,
    barAnim,
    isDarkMode,
    newItemName,
    newItemAmount,
    newItemType,
    newItemCategory,
    isPremium, // Pass premium status to child components
    formatCurrency: (amount) => {
      // Make sure to use the CurrencyService for proper formatting
      return CurrencyService.formatCurrency(amount, financialData.currency);
    }
  };
  
  // Load saved financial data instance
  const loadSavedFinancialData = async (savedData) => {
    try {
      setFinancialData(savedData);
      await saveFinancialData(savedData);
    } catch (error) {
      console.error('Error loading saved financial data:', error);
    }
  };

  // Save current financial data as a new instance
  const saveCurrentFinancialData = async () => {
    try {
      // Generate a unique ID for the saved instance
      const timestamp = Date.now();
      const saveId = `widget_data_financial_${timestamp}`;
      
      // Add timestamp to the data
      const dataToSave = {
        ...financialData,
        lastUpdated: new Date().toISOString(),
        savedAt: timestamp
      };
      
      // Save to AsyncStorage with unique key
      await AsyncStorage.setItem(saveId, JSON.stringify(dataToSave));
      console.log('Financial data saved with ID:', saveId);
      
      return saveId;
    } catch (error) {
      console.error('Error saving current financial data:', error);
      throw error;
    }
  };

  // Start fresh with new financial data
  const startFreshFinancialData = async () => {
    try {
      const freshData = {
        incomeSources: [],
        expenses: [],
        savings: [],
        debts: [],
        goals: [],
        currency: await initializeCurrencyFromCountry()
      };
      setFinancialData(freshData);
      await saveFinancialData(freshData);
    } catch (error) {
      console.error('Error starting fresh financial data:', error);
    }
  };

  // Prepare handlers object for child components
  const handlers = {
    setNewItemName,
    setNewItemAmount,
    setNewItemType,
    setNewItemCategory,
    handleAddIncome,
    handleAddExpense,
    handleAddSavings,
    handleAddDebt,
    handleDeleteItem,
    handleUpdateItem,
    handleToggleGoal,
    handleAddGoal,
    handleDeleteGoal,
    handleReplaceAllGoals,
    setCurrency: handleCurrencyChange,
    loadSavedFinancialData,
    startFreshFinancialData,
    saveCurrentFinancialData
  };
  
  // Main return
  return (
    <View style={styles.container}>
      <CompactView 
        theme={theme}
        data={data}
        openDetailModal={() => setShowDetailModal(true)}
      />
      
      <DetailModal
        visible={showDetailModal}
        theme={theme}
        data={data}
        handlers={handlers}
        onClose={() => setShowDetailModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
    position: 'relative',
  }
});

export default FinancialTracker;