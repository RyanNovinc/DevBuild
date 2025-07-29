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

// Import currency components
import CurrencyModal from './SummaryTab/components/CurrencyModal';
import CurrencyInfoModal from './SummaryTab/components/CurrencyInfoModal';
import CurrencyService from './CurrencyService';

// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');

const DetailModal = ({ visible, theme, data, handlers, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
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
  
  // Handle tab selection by pressing tab buttons
  const handleTabPress = (tabIndex) => {
    if (tabIndex === activeTab) return;
    setActiveTab(tabIndex);
  };
  
  // Render the active tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case 0: // 'summary'
        return <SummaryTab theme={theme} data={data} handlers={handlers} />;
      case 1: // 'income'
        return <IncomeTab theme={theme} data={data} handlers={handlers} />;
      case 2: // 'expenses'
        return <ExpensesTab theme={theme} data={data} handlers={handlers} />;
      case 3: // 'goals'
        return <GoalsTab theme={theme} data={data} handlers={handlers} />;
      default:
        return <SummaryTab theme={theme} data={data} handlers={handlers} />;
    }
  };
  
  // Calculate tab indicator position with precision handling
  const getTabIndicatorPosition = () => {
    // Calculate tab width (with precision handling)
    const tabWidth = Math.round(width / 4);
    // Calculate position (with precision handling)
    const position = Math.round(tabWidth * activeTab);
    return position;
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
            Financial Freedom Tracker
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
        
        {/* Tab Navigation */}
        <View style={[styles.tabNavigation, { borderBottomColor: theme.border }]}>
          {/* Tab Indicator - FIXED to use the rounded position calculation */}
          <View 
            style={[
              styles.tabIndicator, 
              { 
                backgroundColor: theme.primary,
                left: getTabIndicatorPosition(),
              }
            ]} 
          />
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 0 && [styles.activeTab]
            ]}
            onPress={() => handleTabPress(0)}
          >
            <Ionicons 
              name={activeTab === 0 ? "stats-chart" : "stats-chart-outline"} 
              size={18} 
              color={activeTab === 0 ? theme.primary : theme.textSecondary} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabButtonText,
              { color: theme.textSecondary },
              activeTab === 0 && { color: theme.primary, fontWeight: '600' }
            ]}>
              Summary
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 1 && [styles.activeTab]
            ]}
            onPress={() => handleTabPress(1)}
          >
            <Ionicons 
              name={activeTab === 1 ? "cash" : "cash-outline"} 
              size={18} 
              color={activeTab === 1 ? theme.primary : theme.textSecondary} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabButtonText,
              { color: theme.textSecondary },
              activeTab === 1 && { color: theme.primary, fontWeight: '600' }
            ]}>
              Income
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 2 && [styles.activeTab]
            ]}
            onPress={() => handleTabPress(2)}
          >
            <Ionicons 
              name={activeTab === 2 ? "cart" : "cart-outline"} 
              size={18} 
              color={activeTab === 2 ? theme.primary : theme.textSecondary} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabButtonText,
              { color: theme.textSecondary },
              activeTab === 2 && { color: theme.primary, fontWeight: '600' }
            ]}>
              Expenses
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 3 && [styles.activeTab]
            ]}
            onPress={() => handleTabPress(3)}
          >
            <Ionicons 
              name={activeTab === 3 ? "flag" : "flag-outline"} 
              size={18} 
              color={activeTab === 3 ? theme.primary : theme.textSecondary} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabButtonText,
              { color: theme.textSecondary },
              activeTab === 3 && { color: theme.primary, fontWeight: '600' }
            ]}>
              Goals
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Content - Simple View instead of PagerView */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
        
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
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: Math.round(width / 4), // Ensure width is rounded
    height: 2,
    borderRadius: 1,
    // Using simple positioning with rounding instead of transform
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabIcon: {
    marginRight: 6,
  },
  activeTab: {
    // Style is now handled by the tab indicator
  },
  tabButtonText: {
    fontSize: 14,
  },
  tabContent: {
    flex: 1,
  },
});

export default DetailModal;