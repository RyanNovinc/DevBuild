// src/screens/ProfileScreen/FinancialTracker/CashFlowTab.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import existing tab content
import IncomeTab from './IncomeTab';
import ExpensesTab from './ExpensesTab';

const { width } = Dimensions.get('window');

const CashFlowTab = ({ theme, data, handlers }) => {
  const [activeFlow, setActiveFlow] = useState('income');
  
  const isDarkMode = theme.background === '#000000';

  return (
    <View style={styles.container}>
      {/* Toggle Header */}
      <View style={[styles.toggleContainer, { 
        backgroundColor: isDarkMode ? '#1C1C1E' : '#F2F2F7',
        borderColor: theme.border 
      }]}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeFlow === 'income' && [styles.activeToggle, { backgroundColor: theme.primary }]
          ]}
          onPress={() => setActiveFlow('income')}
        >
          <Ionicons 
            name={activeFlow === 'income' ? 'cash' : 'cash-outline'} 
            size={18} 
            color={activeFlow === 'income' ? '#FFFFFF' : theme.textSecondary} 
          />
          <Text style={[
            styles.toggleText,
            { color: activeFlow === 'income' ? '#FFFFFF' : theme.textSecondary }
          ]}>
            Income
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeFlow === 'expenses' && [styles.activeToggle, { backgroundColor: theme.primary }]
          ]}
          onPress={() => setActiveFlow('expenses')}
        >
          <Ionicons 
            name={activeFlow === 'expenses' ? 'cart' : 'cart-outline'} 
            size={18} 
            color={activeFlow === 'expenses' ? '#FFFFFF' : theme.textSecondary} 
          />
          <Text style={[
            styles.toggleText,
            { color: activeFlow === 'expenses' ? '#FFFFFF' : theme.textSecondary }
          ]}>
            Expenses
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {activeFlow === 'income' ? (
          <IncomeTab theme={theme} data={data} handlers={handlers} />
        ) : (
          <ExpensesTab theme={theme} data={data} handlers={handlers} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeToggle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
});

export default CashFlowTab;