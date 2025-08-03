// src/screens/ProfileScreen/FinancialTracker/DetailModal.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

// Import tab components
import SummaryTab from './SummaryTab';
import IncomeTab from './IncomeTab';
import ExpensesTab from './ExpensesTab.js';
import GoalsTab from './GoalsTab';

// Import React Navigation for swipe tabs
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// Import currency components
import CurrencyModal from './SummaryTab/components/CurrencyModal';
import CurrencyInfoModal from './SummaryTab/components/CurrencyInfoModal';
import CurrencyService from './CurrencyService';

// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');

// Create tab navigator for swipe navigation
const Tab = createMaterialTopTabNavigator();

const DetailModal = ({ visible, theme, data, handlers, onClose }) => {
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showCurrencyInfoModal, setShowCurrencyInfoModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showSaveDataModal, setShowSaveDataModal] = useState(false);
  const [savedInstances, setSavedInstances] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Access currency data from props
  const { financialData, formatCurrency } = data;
  const { setCurrency } = handlers || {};
  
  // Initialize exchange rates when modal opens
  useEffect(() => {
    if (visible) {
      // We'll handle exchange rates in the main FinancialTracker component
      // after CurrencyService is properly implemented
    }
  }, [visible]);
  
  // Initialize exchange rates
  const initializeExchangeRates = async () => {
    try {
      // This will be implemented when CurrencyService is ready
      setLastUpdated(new Date().toLocaleDateString());
    } catch (error) {
      console.error('Error initializing exchange rates:', error);
    }
  };
  
  // Handle currency selection
  const handleCurrencySelect = (selectedCurrency) => {
    // Close the currency modal
    setShowCurrencyModal(false);
    
    // Call parent handler if available
    if (setCurrency) {
      setCurrency(selectedCurrency);
      // Removed the conditional that automatically shows the info modal
    } else {
      // Alert if handler not provided
      Alert.alert('Error', 'Unable to change currency. Please try again later.');
    }
  };

  // Load all saved financial tracker instances (limit to 3)
  const loadSavedInstances = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const allKeys = await AsyncStorage.getAllKeys();
      const widgetDataKeys = allKeys.filter(key => key.startsWith('widget_data_'));
      const instances = [];

      for (const key of widgetDataKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            // Only include financial tracker data
            if (parsedData.incomeSources !== undefined || parsedData.expenses !== undefined) {
              const totalIncome = (parsedData.incomeSources || []).reduce((sum, item) => sum + item.amount, 0);
              const totalExpenses = (parsedData.expenses || []).reduce((sum, item) => sum + item.amount, 0);
              
              // Create a better name for saved instances
              const savedAt = parsedData.savedAt ? new Date(parsedData.savedAt) : new Date();
              const instanceName = `Financial ${savedAt.toLocaleDateString()} ${savedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
              
              instances.push({
                id: key,
                name: instanceName,
                totalIncome,
                totalExpenses,
                currency: parsedData.currency || '$',
                lastUpdated: parsedData.lastUpdated || 'Never',
                data: parsedData
              });
            }
          }
        } catch (error) {
          console.error('Error loading instance:', key, error);
        }
      }

      // Also check old storage for migration
      const oldData = await AsyncStorage.getItem('financialTrackerData');
      if (oldData && !instances.length) {
        const parsedOldData = JSON.parse(oldData);
        const totalIncome = (parsedOldData.incomeSources || []).reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = (parsedOldData.expenses || []).reduce((sum, item) => sum + item.amount, 0);
        
        instances.push({
          id: 'legacy_financial',
          name: 'Legacy Financial Data',
          totalIncome,
          totalExpenses,
          currency: parsedOldData.currency || '$',
          lastUpdated: parsedOldData.lastUpdated || 'Never',
          data: parsedOldData
        });
      }

      // Limit to 3 most recent instances
      setSavedInstances(instances.slice(0, 3));
    } catch (error) {
      console.error('Error loading saved instances:', error);
    }
  };

  // Load a specific saved instance
  const loadSavedInstance = async (instance) => {
    try {
      if (handlers.loadSavedFinancialData) {
        handlers.loadSavedFinancialData(instance.data);
        setShowSaveDataModal(false);
        Alert.alert('Success', `Loaded "${instance.name}" financial data`);
      }
    } catch (error) {
      console.error('Error loading saved instance:', error);
      Alert.alert('Error', 'Failed to load financial data');
    }
  };

  // Handle closing modal with automatic saving
  const handleClose = async () => {
    setIsSaving(true);
    try {
      // Automatically save current data when closing
      if (handlers.saveCurrentFinancialData) {
        await handlers.saveCurrentFinancialData();
      }
      
      // Add a minimum delay to ensure the user sees the saving indicator
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Error auto-saving financial data:', error);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  // Start fresh with new financial data
  const startFreshFinancialData = async () => {
    try {
      if (handlers.startFreshFinancialData) {
        handlers.startFreshFinancialData();
        setShowSaveDataModal(false);
        Alert.alert('Success', 'Started fresh financial tracker');
      }
    } catch (error) {
      console.error('Error starting fresh:', error);
      Alert.alert('Error', 'Failed to start fresh financial data');
    }
  };
  

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.detailModalContainer, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.detailHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={handleClose}
            disabled={isSaving}
          >
            {isSaving ? (
              <Ionicons name="ellipsis-horizontal" size={24} color={theme.textSecondary} />
            ) : (
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            )}
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={[styles.detailTitle, { color: theme.text }]}>
              Financial Tracker
            </Text>
            {isSaving && (
              <View style={styles.savingIndicator}>
                <Ionicons name="cloud-upload-outline" size={18} color={theme.primary} />
                <Text style={[styles.savingText, { color: theme.primary }]}>Saving...</Text>
              </View>
            )}
          </View>
          
          {/* Currency selector in header */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.currencyButton, { borderColor: theme.border }]}
              onPress={() => setShowCurrencyModal(true)}
            >
              <Text style={[styles.currencySymbol, { color: theme.text }]}>
                {financialData.currency}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveDataButton}
              onPress={() => {
                loadSavedInstances();
                setShowSaveDataModal(true);
              }}
            >
              <Ionicons name="folder-outline" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setShowCurrencyInfoModal(true)}
            >
              <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Tab Navigation with Swipe Support */}
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#FFFFFF',
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarStyle: { 
              backgroundColor: theme.cardElevated || '#1F1F1F',
              borderRadius: 25,
              marginHorizontal: 16,
              marginVertical: 8,
              height: 44,
            },
            tabBarLabelStyle: {
              fontSize: 13,
              fontWeight: '600',
              marginTop: -4, // Move text higher
            },
            tabBarIconStyle: {
              marginRight: 2, // Reduce spacing between icon and text
              marginTop: 3, // Move icon down
            },
            tabBarIndicatorStyle: { 
              backgroundColor: theme.primary,
              height: 38,
              borderRadius: 20,
              marginBottom: 3,
              marginLeft: 3,
              width: Math.floor((width - 38) / 4) - 6,
              zIndex: 1,
            },
            tabBarItemStyle: {
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            },
            swipeEnabled: true,
          }}
        >
          <Tab.Screen 
            name="Summary" 
            options={{
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? '#FFFFFF' : theme.textSecondary,
                  fontSize: 13,
                  fontWeight: '600',
                  marginTop: -4
                }}>
                  Summary
                </Text>
              ),
              tabBarIcon: ({ focused }) => (
                <Ionicons 
                  name={focused ? 'stats-chart' : 'stats-chart-outline'} 
                  size={16} 
                  color={focused ? '#FFFFFF' : theme.textSecondary} 
                />
              )
            }}
          >
            {() => (
              <View style={[styles.tabContent, { backgroundColor: theme.background }]}>
                <SummaryTab theme={theme} data={data} handlers={handlers} />
              </View>
            )}
          </Tab.Screen>
          
          <Tab.Screen 
            name="Income" 
            options={{
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? '#FFFFFF' : theme.textSecondary,
                  fontSize: 13,
                  fontWeight: '600',
                  marginTop: -4
                }}>
                  Income
                </Text>
              ),
              tabBarIcon: ({ focused }) => (
                <Ionicons 
                  name={focused ? 'cash' : 'cash-outline'} 
                  size={16} 
                  color={focused ? '#FFFFFF' : theme.textSecondary} 
                />
              )
            }}
          >
            {() => (
              <View style={[styles.tabContent, { backgroundColor: theme.background }]}>
                <IncomeTab theme={theme} data={data} handlers={handlers} />
              </View>
            )}
          </Tab.Screen>
          
          <Tab.Screen 
            name="Expenses" 
            options={{
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? '#FFFFFF' : theme.textSecondary,
                  fontSize: 13,
                  fontWeight: '600',
                  marginTop: -4
                }}>
                  Expenses
                </Text>
              ),
              tabBarIcon: ({ focused }) => (
                <Ionicons 
                  name={focused ? 'cart' : 'cart-outline'} 
                  size={16} 
                  color={focused ? '#FFFFFF' : theme.textSecondary} 
                />
              )
            }}
          >
            {() => (
              <View style={[styles.tabContent, { backgroundColor: theme.background }]}>
                <ExpensesTab theme={theme} data={data} handlers={handlers} />
              </View>
            )}
          </Tab.Screen>
          
          <Tab.Screen 
            name="Goals" 
            options={{
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? '#FFFFFF' : theme.textSecondary,
                  fontSize: 13,
                  fontWeight: '600',
                  marginTop: -4
                }}>
                  Goals
                </Text>
              ),
              tabBarIcon: ({ focused }) => (
                <Ionicons 
                  name={focused ? 'flag' : 'flag-outline'} 
                  size={16} 
                  color={focused ? '#FFFFFF' : theme.textSecondary} 
                />
              )
            }}
          >
            {() => (
              <View style={[styles.tabContent, { backgroundColor: theme.background }]}>
                <GoalsTab theme={theme} data={data} handlers={handlers} />
              </View>
            )}
          </Tab.Screen>
        </Tab.Navigator>
        
        {/* Currency Selection Modal */}
        <CurrencyModal 
          visible={showCurrencyModal}
          onClose={() => setShowCurrencyModal(false)}
          onSelect={handleCurrencySelect}
          theme={theme}
          currentCurrency={financialData.currency}
        />
        
        {/* Currency Info Modal */}
        <CurrencyInfoModal
          visible={showCurrencyInfoModal}
          onClose={() => setShowCurrencyInfoModal(false)}
          theme={theme}
          lastUpdated={lastUpdated}
        />
        
        {/* Save Data Modal */}
        <Modal
          visible={showSaveDataModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSaveDataModal(false)}
        >
          <View style={styles.saveDataModalOverlay}>
            <View style={[styles.saveDataModalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.saveDataModalHeader}>
                <Text style={[styles.saveDataModalTitle, { color: theme.text }]}>Load Saved Data</Text>
                <TouchableOpacity onPress={() => setShowSaveDataModal(false)}>
                  <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.saveDataDescription, { color: theme.textSecondary }]}>
                Choose from your saved financial data or start fresh
              </Text>
              
              <View style={styles.savedInstancesContainer}>
                {savedInstances.length > 0 ? (
                  savedInstances.map((instance, index) => (
                    <TouchableOpacity
                      key={instance.id}
                      style={[styles.savedInstanceItem, { backgroundColor: theme.cardAlt || theme.card, borderColor: theme.border }]}
                      onPress={() => loadSavedInstance(instance)}
                    >
                      <View style={styles.savedInstanceInfo}>
                        <Text style={[styles.savedInstanceName, { color: theme.text }]}>
                          {instance.name}
                        </Text>
                        <Text style={[styles.savedInstanceStats, { color: theme.textSecondary }]}>
                          Income: {instance.currency}{instance.totalIncome.toLocaleString()} • Expenses: {instance.currency}{instance.totalExpenses.toLocaleString()}
                        </Text>
                        <Text style={[styles.savedInstanceDate, { color: theme.textSecondary }]}>
                          Last updated: {instance.lastUpdated === 'Never' ? 'Never' : new Date(instance.lastUpdated).toLocaleDateString()}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noSavedDataContainer}>
                    <Ionicons name="folder-open-outline" size={48} color={theme.textSecondary} />
                    <Text style={[styles.noSavedDataText, { color: theme.textSecondary }]}>
                      No saved financial data found
                    </Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={[styles.startFreshButton, { backgroundColor: theme.primary }]}
                onPress={startFreshFinancialData}
              >
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.startFreshButtonText}>Start Fresh Financial Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  detailModalContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : 30,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeModalButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  savingText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  saveDataButton: {
    padding: 4,
    marginRight: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  infoButton: {
    padding: 4,
  },
  tabContent: {
    flex: 1,
    paddingTop: 4,
  },
  // Save data modal styles
  saveDataModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  saveDataModalContent: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    maxHeight: '80%',
  },
  saveDataModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveDataModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveDataDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  savedInstancesContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  savedInstanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  savedInstanceInfo: {
    flex: 1,
  },
  savedInstanceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  savedInstanceStats: {
    fontSize: 14,
    marginBottom: 4,
  },
  savedInstanceDate: {
    fontSize: 12,
  },
  noSavedDataContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noSavedDataText: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  startFreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  startFreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default DetailModal;