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
  

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.detailModalContainer, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.detailHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.detailTitle, { color: theme.text }]}>
            Financial Tracker
          </Text>
          
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
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
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
  infoButton: {
    padding: 4,
  },
  tabContent: {
    flex: 1,
    paddingTop: 4,
  },
});

export default DetailModal;