// src/screens/ProfileScreen/FinancialTracker/index.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet,
  Animated,
  Alert
} from 'react-native';
import { Modal, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Import components
import CompactView from './CompactView';
import DetailModal from './DetailModal';
import CustomAlert from './CustomAlert';

// Import utilities and services
import { 
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateTotalSavings,
  calculateTotalDebt,
  calculateTotalAssets,
  calculateNetWorth,
  calculateSavingsPercentage,
  initializeWithExampleData,
  createMonthlySnapshot,
  addMonthlySnapshot,
  getCurrentMonth,
  getPreviousMonth,
  hasCurrentMonthInHistory,
  getMonthDisplayName,
  hasUnsavedCurrentMonthData
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
  widgetName,
  updateWidgetName
}) => {
  // Financial data state with assets array
  const [financialData, setFinancialData] = useState({
    incomeSources: [],
    expenses: [],
    savings: [],
    debts: [],
    assets: [], // Assets array for net worth tracking
    currency: "$",
    title: widgetName || "Financial Tracker", // Add title to internal state
    monthlyHistory: [] // Add monthly history tracking
  });
  
  // Exchange rates state
  const [exchangeRatesLoaded, setExchangeRatesLoaded] = useState(false);
  
  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Full-screen graph state
  const [showFullScreenGraph, setShowFullScreenGraph] = useState(false);
  const [fullScreenGraphData, setFullScreenGraphData] = useState(null);
  
  // Custom alert state
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    icon: null,
    iconColor: '#007AFF'
  });
  
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

  // Monitor for month transitions and unsaved data
  useEffect(() => {
    const checkForMonthTransition = () => {
      const currentMonth = getCurrentMonth();
      const previousMonth = getPreviousMonth();
      const storedLastCheckedMonth = financialData.lastCheckedMonth;
      
      // If this is the first time running or we've moved to a new month
      if (storedLastCheckedMonth && storedLastCheckedMonth !== currentMonth) {
        // Check if previous month has unsaved data
        const hasPreviousMonthData = (financialData.incomeSources?.length > 0) || 
                                    (financialData.expenses?.length > 0);
        const previousMonthExistsInHistory = financialData.monthlyHistory?.some(
          item => item.month === storedLastCheckedMonth
        );
        
        if (hasPreviousMonthData && !previousMonthExistsInHistory) {
          // Show prompt to save previous month's data
          const previousMonthName = getMonthDisplayName(storedLastCheckedMonth);
          showCustomAlert({
            title: 'Save Previous Month?',
            message: `You have financial data from ${previousMonthName} that hasn't been saved to your history. Would you like to save it before starting ${getMonthDisplayName(currentMonth)}?`,
            icon: 'calendar-outline',
            iconColor: '#007AFF',
            buttons: [
              { 
                text: 'Skip', 
                style: 'cancel',
                onPress: () => updateLastCheckedMonth(currentMonth)
              },
              { 
                text: 'Save Previous Month', 
                onPress: () => {
                  // Create snapshot for previous month
                  const previousSnapshot = createMonthlySnapshot(financialData);
                  previousSnapshot.month = storedLastCheckedMonth;
                  previousSnapshot.monthName = previousMonthName;
                  
                  const updatedData = addMonthlySnapshot(financialData, previousSnapshot);
                  setFinancialData(updatedData);
                  saveFinancialData(updatedData);
                  updateLastCheckedMonth(currentMonth);
                  
                  showCustomAlert({
                    title: 'Data Saved!',
                    message: `Your ${previousMonthName} data has been saved to history.`,
                    icon: 'checkmark-circle-outline',
                    iconColor: '#00D4AA',
                    buttons: [{ text: 'OK', onPress: () => {} }]
                  });
                }
              }
            ]
          });
        } else {
          updateLastCheckedMonth(currentMonth);
        }
      } else if (!storedLastCheckedMonth) {
        // First time setup
        updateLastCheckedMonth(currentMonth);
      }
    };

    // Only check if we have loaded financial data
    if (financialData && Object.keys(financialData).length > 0) {
      checkForMonthTransition();
    }
  }, [financialData]);

  const updateLastCheckedMonth = (month) => {
    const updatedData = {
      ...financialData,
      lastCheckedMonth: month
    };
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };

  // Custom alert helpers
  const showCustomAlert = (config) => {
    // Check if we're inside the DetailModal by checking if this component is being rendered in modal context
    // If so, fall back to system alerts to avoid modal-over-modal issues
    if (showDetailModal) {
      // Use system alert when inside DetailModal
      const buttonTexts = config.buttons?.map(btn => btn.text) || ['OK'];
      const buttonActions = config.buttons?.map(btn => btn.onPress) || [];
      
      if (config.buttons && config.buttons.length > 1) {
        Alert.alert(
          config.title,
          config.message,
          config.buttons.map((btn, index) => ({
            text: btn.text,
            style: btn.style,
            onPress: btn.onPress
          }))
        );
      } else {
        Alert.alert(config.title, config.message, [{ text: 'OK', onPress: buttonActions[0] }]);
      }
    } else {
      // Use custom alert when not inside modal
      setAlertConfig({
        visible: true,
        ...config
      });
    }
  };

  const hideCustomAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

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
          currency: currency,
          title: loadedData.title || widgetName || "Financial Tracker",
          monthlyHistory: loadedData.monthlyHistory || [] // Ensure monthly history exists
        }));
      } else {
        // Initialize with example data for better UX
        const exampleData = initializeWithExampleData();
        
        // CRITICAL: Ensure example data has empty goals array
        exampleData.goals = [];
        
        // Initialize currency from country for new users
        const countryCurrency = await initializeCurrencyFromCountry();
        exampleData.currency = countryCurrency;
        exampleData.title = widgetName || "Financial Tracker";
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

  // Handle title update
  const handleTitleUpdate = async (newTitle) => {
    console.log('handleTitleUpdate called with:', newTitle);
    
    const updatedData = {
      ...financialData,
      title: newTitle
    };
    
    setFinancialData(updatedData);
    await saveFinancialData(updatedData);
    console.log('Title updated and saved:', newTitle);
    
    // Return the updated data so the modal can use it immediately
    return updatedData;
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

  // Quick add income with direct parameters
  const quickAddIncome = (name, amount, type = 'primary') => {
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    if (!name || !amount) {
      Alert.alert('Error', 'Please enter a name and amount.');
      return;
    }
    
    const newIncome = {
      id: Date.now().toString(),
      name: name,
      amount: parseFloat(amount),
      type: type
    };
    
    const updatedData = {
      ...financialData,
      incomeSources: [...(financialData.incomeSources || []), newIncome]
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };

  // Quick add expense with direct parameters
  const quickAddExpense = (name, amount, category = 'general') => {
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    if (!name || !amount) {
      Alert.alert('Error', 'Please enter a name and amount.');
      return;
    }
    
    const newExpense = {
      id: Date.now().toString(),
      name: name,
      amount: parseFloat(amount),
      type: 'recurring', // This is crucial for the calculation!
      category: category
    };
    
    const updatedData = {
      ...financialData,
      expenses: [...(financialData.expenses || []), newExpense]
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };

  // Quick update income with direct parameters
  const quickUpdateIncome = (id, name, amount, type = 'primary') => {
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    if (!name || !amount) {
      Alert.alert('Error', 'Please enter a name and amount.');
      return;
    }
    
    const updatedData = {
      ...financialData,
      incomeSources: financialData.incomeSources.map(income => 
        income.id === id 
          ? { ...income, name, amount: parseFloat(amount), type }
          : income
      )
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };

  // Quick update expense with direct parameters
  const quickUpdateExpense = (id, name, amount, category = 'general') => {
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    if (!name || !amount) {
      Alert.alert('Error', 'Please enter a name and amount.');
      return;
    }
    
    const updatedData = {
      ...financialData,
      expenses: financialData.expenses.map(expense => 
        expense.id === id 
          ? { ...expense, name, amount: parseFloat(amount), category }
          : expense
      )
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };

  // Save current month to history
  const saveCurrentMonth = (skipAlerts = false) => {
    const currentMonth = getCurrentMonth();
    const currentMonthName = getMonthDisplayName(currentMonth);
    
    // Check if month already exists in history
    const existsInHistory = hasCurrentMonthInHistory(financialData.monthlyHistory);
    
    if (skipAlerts) {
      // Direct save without alerts (called from inline UI)
      return performSaveCurrentMonth(true);
    }
    
    if (existsInHistory) {
      showCustomAlert({
        title: 'Update Existing Data?',
        message: `Data for ${currentMonthName} already exists in your history. Do you want to update it with the current values?`,
        icon: 'refresh-outline',
        iconColor: '#FF9500',
        buttons: [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => {} 
          },
          { 
            text: 'Update', 
            style: 'destructive',
            onPress: () => performSaveCurrentMonth()
          }
        ]
      });
    } else {
      performSaveCurrentMonth();
    }
  };

  const performSaveCurrentMonth = (skipAlerts = false) => {
    const currentMonthName = getMonthDisplayName(getCurrentMonth());
    const existsInHistory = hasCurrentMonthInHistory(financialData.monthlyHistory);
    
    const updatedData = addMonthlySnapshot(financialData);
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
    
    if (!skipAlerts) {
      showCustomAlert({
        title: existsInHistory ? 'Month Updated!' : 'Month Saved!',
        message: `Your financial data for ${currentMonthName} has been ${existsInHistory ? 'updated in' : 'saved to'} your history.`,
        icon: 'checkmark-circle-outline',
        iconColor: '#00D4AA',
        buttons: [{ text: 'OK', onPress: () => {} }]
      });
    }
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
  
  // Handle add new debt (enhanced for debt tracker)
  const handleAddDebt = (debtData = null) => {
    // If not premium, don't allow adding
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }
    
    let newDebt;
    
    if (debtData) {
      // Called from DebtTab with complete debt object
      newDebt = debtData;
    } else {
      // Called from old form interface
      if (!newItemName || !newItemAmount) {
        Alert.alert('Error', 'Please enter a name and amount.');
        return;
      }
      
      newDebt = {
        id: Date.now().toString(),
        name: newItemName,
        amount: parseFloat(newItemAmount),
        interestRate: parseFloat(newItemType) || 0,
        minPayment: Math.max(parseFloat(newItemAmount) * 0.02, 25), // 2% or $25 minimum
        originalAmount: parseFloat(newItemAmount) // Track original amount for progress
      };
    }
    
    const updatedData = {
      ...financialData,
      debts: [...financialData.debts, newDebt]
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
    
    // Reset form if called from old interface
    if (!debtData) {
      setNewItemName('');
      setNewItemAmount('');
      setNewItemType('');
    }
  };

  // Handle add asset
  const handleAddAsset = (assetData) => {
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }

    const updatedData = {
      ...financialData,
      assets: [...(financialData.assets || []), assetData]
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };

  // Handle update asset
  const handleUpdateAsset = (updatedAsset) => {
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }

    const updatedData = {
      ...financialData,
      assets: (financialData.assets || []).map(asset => 
        asset.id === updatedAsset.id ? updatedAsset : asset
      )
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
  };

  // Handle delete asset
  const handleDeleteAsset = (assetId) => {
    if (!isPremium) {
      navigation.navigate('PricingScreen');
      return;
    }

    const updatedData = {
      ...financialData,
      assets: (financialData.assets || []).filter(asset => asset.id !== assetId)
    };
    
    setFinancialData(updatedData);
    saveFinancialData(updatedData);
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
  const totalAssets = calculateTotalAssets(financialData);
  const netWorth = calculateNetWorth(financialData);
  const savingsPercentage = calculateSavingsPercentage(totalIncome, totalExpenses);
  
  // Get highest bar for chart scaling
  const highestBar = Math.max(totalIncome, totalExpenses);
  
  // Prepare data object for child components
  const data = {
    financialData,
    totalIncome,
    totalExpenses,
    totalSavings,
    totalDebt,
    totalAssets,
    netWorth,
    savingsPercentage,
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

  // Save current financial data
  const saveCurrentFinancialData = async (customData = null) => {
    try {
      // Use custom data if provided, otherwise use current state
      const dataToUpdate = customData || financialData;
      
      // Add timestamp to the data
      const updatedData = {
        ...dataToUpdate,
        lastUpdated: new Date().toISOString()
      };
      
      // Update state and save using the proper save function
      setFinancialData(updatedData);
      await saveFinancialData(updatedData);
      
      console.log('Financial data updated successfully');
      return true;
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

  // Handle net worth updates
  const handleUpdateNetWorth = async (totalAssets, totalLiabilities) => {
    try {
      const updatedData = {
        ...financialData,
        totalAssets,
        totalLiabilities
      };
      setFinancialData(updatedData);
      await saveFinancialData(updatedData);
    } catch (error) {
      console.error('Error updating net worth:', error);
    }
  };

  // Handle full-screen graph
  const openFullScreenGraph = (graphType, graphData, isAccumulative, toggleAccumulative) => {
    setFullScreenGraphData({
      type: graphType,
      data: graphData,
      isAccumulative,
      toggleAccumulative,
      formatCurrency: (amount) => {
        return CurrencyService.formatCurrency(amount, financialData.currency);
      }
    });
    setShowFullScreenGraph(true);
  };

  const closeFullScreenGraph = () => {
    setShowFullScreenGraph(false);
    setFullScreenGraphData(null);
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
    handleAddAsset,
    handleUpdateAsset,
    handleDeleteAsset,
    setCurrency: handleCurrencyChange,
    onUpdateTitle: handleTitleUpdate,
    loadSavedFinancialData,
    startFreshFinancialData,
    saveCurrentFinancialData,
    setFinancialData, // Add direct state setter for immediate updates
    quickAddIncome,
    quickAddExpense,
    quickUpdateIncome,
    quickUpdateExpense,
    saveCurrentMonth,
    showCustomAlert,
    hideCustomAlert,
    updateNetWorth: handleUpdateNetWorth,
    openFullScreenGraph
  };
  
  // Main return
  return (
    <View style={styles.container}>
      <CompactView 
        theme={theme}
        data={data}
        openDetailModal={() => setShowDetailModal(true)}
        widgetName={financialData.title}
        handlers={handlers}
      />
      
      <DetailModal
        key={`detail-modal-${showDetailModal}`}
        visible={showDetailModal}
        theme={theme}
        data={data}
        handlers={handlers}
        onClose={() => setShowDetailModal(false)}
        widgetName={financialData.title}
        showFullScreenGraph={showFullScreenGraph}
        fullScreenGraphData={fullScreenGraphData}
        onCloseFullScreenGraph={closeFullScreenGraph}
      />
      
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        onClose={hideCustomAlert}
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