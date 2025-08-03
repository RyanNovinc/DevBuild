// src/screens/ProfileScreen/FinancialTracker/CompactView.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Fix: import from the correct path
import { getPercentileColor } from './SummaryTab/utils';

const CompactView = ({ theme, data, openDetailModal }) => {
  const { 
    totalIncome, 
    totalExpenses, 
    savingsPercentage, 
    incomePercentile,
    expensePercentile,
    savingsPercentile,
    highestBar,
    barAnim,
    formatCurrency
  } = data;

  return (
    <TouchableOpacity 
      style={[styles.compactCard, { 
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border 
      }]}
      onPress={openDetailModal}
      activeOpacity={0.7}
    >
      <View style={styles.compactHeader}>
        <View style={styles.compactTitleContainer}>
          <Ionicons name="wallet-outline" size={20} color={theme.primary} style={styles.compactIcon} />
          <Text style={[styles.compactTitle, { color: theme.text }]}>
            Financial Tracker
          </Text>
        </View>
        {/* "Tap for details" text removed as requested */}
      </View>
      
      {/* Key Metrics */}
      <View style={styles.compactMetrics}>
        <View style={styles.metricsContainer}>
          {/* Left Column - Labels */}
          <View style={styles.metricsColumn}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Monthly Income:</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Monthly Expenses:</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Savings Rate:</Text>
          </View>
          
          {/* Middle Column - Values */}
          <View style={styles.metricsColumn}>
            <Text style={[styles.metricValue, { color: '#4CAF50' }]}>{formatCurrency(totalIncome)}</Text>
            <Text style={[styles.metricValue, { color: '#F44336' }]}>{formatCurrency(totalExpenses)}</Text>
            <Text style={[styles.metricValue, { color: savingsPercentage >= 0 ? '#4CAF50' : '#F44336' }]}>
              {savingsPercentage.toFixed(0)}%
            </Text>
          </View>
          
          {/* Right Column - Percentiles */}
          <View style={styles.metricsColumn}>
            <Text style={[styles.metricPercentile, { color: getPercentileColor(incomePercentile) }]}>
              Better than {incomePercentile.toFixed(1)}%
            </Text>
            <Text style={[styles.metricPercentile, { color: getPercentileColor(expensePercentile) }]}>
              Better than {expensePercentile.toFixed(1)}%
            </Text>
            <Text style={[styles.metricPercentile, { color: getPercentileColor(savingsPercentile) }]}>
              Better than {savingsPercentile.toFixed(1)}%
            </Text>
          </View>
        </View>
        
        {/* Simple Bar Chart */}
        <View style={styles.compactChartContainer}>
          <View style={styles.compactBars}>
            <View style={styles.barLabelContainer}>
              <Text style={[styles.barLabel, { color: theme.textSecondary }]}>Income</Text>
              <Animated.View 
                style={[
                  styles.incomeBar, 
                  { 
                    backgroundColor: '#4CAF50', // Green for income
                    height: barAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [0, Math.round((totalIncome / highestBar) * 100)]
})
                  }
                ]} 
              />
            </View>
            
            <View style={styles.barLabelContainer}>
              <Text style={[styles.barLabel, { color: theme.textSecondary }]}>Expenses</Text>
              <Animated.View 
                style={[
                  styles.expenseBar, 
                  { 
                    backgroundColor: '#F44336', // Red for expenses
                    height: barAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [0, Math.round((totalExpenses / highestBar) * 100)]
})
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.savingsIndicator}>
            <View style={[styles.savingsLine, { borderColor: theme.border }]} />
            <Text style={[styles.savingsLabel, { color: '#4CAF50' }]}>
              Monthly Surplus: {formatCurrency(Math.max(0, totalIncome - totalExpenses))}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  compactCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Added flex to ensure it fills the space
  },
  compactIcon: {
    marginRight: 8,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // compactTapHint removed as it's no longer needed
  compactMetrics: {
    marginBottom: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricsColumn: {
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  metricPercentile: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  compactChartContainer: {
    marginTop: 8,
  },
  compactBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 120,
    marginBottom: 8,
  },
  barLabelContainer: {
    alignItems: 'center',
    width: 80,
  },
  barLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  incomeBar: {
    width: 40,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  expenseBar: {
    width: 40,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  savingsIndicator: {
    alignItems: 'center',
  },
  savingsLine: {
    width: '80%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  savingsLabel: {
    fontSize: 12,
  },
});

export default CompactView;