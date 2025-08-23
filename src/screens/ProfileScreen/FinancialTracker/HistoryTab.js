// src/screens/ProfileScreen/FinancialTracker/HistoryTab.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const HistoryTab = ({ theme, data, handlers }) => {
  const { financialData, formatCurrency, totalIncome, totalExpenses, savingsPercentage, isPremium } = data;
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6months'); // 3months, 6months, 1year
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successAnimation] = useState(new Animated.Value(0));
  
  const isDarkMode = theme.background === '#000000';

  useEffect(() => {
    loadMonthlyHistory();
  }, [financialData]);

  // Load monthly history data
  const loadMonthlyHistory = () => {
    // Get monthly snapshots from financialData
    const history = financialData.monthlyHistory || [];
    setMonthlyData(history);
  };

  // Create current month snapshot
  const createCurrentMonthSnapshot = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const netGain = totalIncome - totalExpenses;
    
    const snapshot = {
      month: currentMonth,
      monthName: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      income: totalIncome,
      expenses: totalExpenses,
      netGain,
      savingsPercentage: savingsPercentage,
      timestamp: Date.now()
    };

    return snapshot;
  };

  // Save current month data
  const saveCurrentMonth = async () => {
    if (!isPremium) {
      Alert.alert('Pro Required', 'Monthly tracking requires a Pro subscription.');
      return;
    }

    try {
      const currentSnapshot = createCurrentMonthSnapshot();
      const existingHistory = financialData.monthlyHistory || [];
      
      // Check if current month already exists
      const currentMonthIndex = existingHistory.findIndex(
        item => item.month === currentSnapshot.month
      );

      let updatedHistory;
      if (currentMonthIndex >= 0) {
        // Update existing month
        updatedHistory = [...existingHistory];
        updatedHistory[currentMonthIndex] = currentSnapshot;
      } else {
        // Add new month
        updatedHistory = [...existingHistory, currentSnapshot];
      }

      // Keep only last 24 months
      updatedHistory = updatedHistory
        .sort((a, b) => new Date(b.month) - new Date(a.month))
        .slice(0, 24);

      // Update financial data with history
      const updatedFinancialData = {
        ...financialData,
        monthlyHistory: updatedHistory
      };

      // Save through handlers
      if (handlers?.saveCurrentFinancialData) {
        await handlers.saveCurrentFinancialData(updatedFinancialData);
        setMonthlyData(updatedHistory);
        showSuccessMessage();
      }
    } catch (error) {
      console.error('Error saving monthly data:', error);
      Alert.alert('Error', 'Failed to save monthly data.');
    }
  };

  // Show success message with animation
  const showSuccessMessage = () => {
    setShowSuccessModal(true);
    
    // Animate in
    Animated.sequence([
      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(2000), // Show for 2 seconds
      Animated.timing(successAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowSuccessModal(false);
    });
  };

  // Filter data by selected period
  const getFilteredData = () => {
    const now = new Date();
    let monthsToShow = 6;
    
    switch (selectedPeriod) {
      case '3months':
        monthsToShow = 3;
        break;
      case '6months':
        monthsToShow = 6;
        break;
      case '1year':
        monthsToShow = 12;
        break;
      default:
        monthsToShow = 6;
    }

    return monthlyData
      .filter(item => {
        const itemDate = new Date(item.month + '-01');
        const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsToShow + 1, 1);
        return itemDate >= cutoffDate;
      })
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  // Calculate averages
  const calculateAverages = () => {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) return null;

    const avgIncome = filteredData.reduce((sum, item) => sum + item.income, 0) / filteredData.length;
    const avgExpenses = filteredData.reduce((sum, item) => sum + item.expenses, 0) / filteredData.length;
    const avgNetGain = filteredData.reduce((sum, item) => sum + item.netGain, 0) / filteredData.length;
    const avgSavingsRate = filteredData.reduce((sum, item) => sum + item.savingsPercentage, 0) / filteredData.length;

    return {
      avgIncome,
      avgExpenses,
      avgNetGain,
      avgSavingsRate
    };
  };

  // Prepare chart data
  const prepareChartData = () => {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) return null;

    return {
      labels: filteredData.map(item => item.monthName || item.month.slice(-2)),
      datasets: [
        {
          data: filteredData.map(item => item.income),
          color: () => '#10B981',
          strokeWidth: 3,
        },
        {
          data: filteredData.map(item => item.expenses),
          color: () => '#EF4444',
          strokeWidth: 3,
        }
      ]
    };
  };

  const averages = calculateAverages();
  const chartData = prepareChartData();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Period Selector */}
      <View style={[styles.periodSelector, { borderColor: theme.border }]}>
        {['3months', '6months', '1year'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && [styles.activePeriod, { backgroundColor: theme.primary }]
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text style={[
              styles.periodText,
              { color: selectedPeriod === period ? '#FFFFFF' : theme.textSecondary }
            ]}>
              {period === '3months' ? '3M' : period === '6months' ? '6M' : '1Y'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save Current Month Button */}
      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: theme.primary }]}
        onPress={saveCurrentMonth}
      >
        <Ionicons name="save-outline" size={20} color="#FFFFFF" />
        <Text style={styles.saveButtonText}>Save Current Month</Text>
      </TouchableOpacity>

      {monthlyData.length === 0 ? (
        // Empty State
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No History Yet</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Save your current month data to start tracking your financial history
          </Text>
        </View>
      ) : (
        <>
          {/* Chart */}
          {chartData && (
            <View style={[styles.chartContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Income vs Expenses Trend</Text>
              <LineChart
                data={chartData}
                width={width - 64}
                height={220}
                yAxisSuffix=""
                yAxisInterval={1}
                chartConfig={{
                  backgroundColor: theme.card,
                  backgroundGradientFrom: theme.card,
                  backgroundGradientTo: theme.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.8})`,
                  labelColor: (opacity = 1) => theme.textSecondary,
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                  }
                }}
                bezier
                style={styles.chart}
              />
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>Income</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>Expenses</Text>
                </View>
              </View>
            </View>
          )}

          {/* Averages Summary */}
          {averages && (
            <View style={[styles.averagesContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {selectedPeriod === '3months' ? '3-Month' : selectedPeriod === '6months' ? '6-Month' : 'Yearly'} Averages
              </Text>
              
              <View style={styles.averagesGrid}>
                <View style={styles.averageCard}>
                  <Text style={[styles.averageLabel, { color: theme.textSecondary }]}>Avg Income</Text>
                  <Text style={[styles.averageValue, { color: '#10B981' }]}>
                    {formatCurrency(averages.avgIncome)}
                  </Text>
                </View>
                
                <View style={styles.averageCard}>
                  <Text style={[styles.averageLabel, { color: theme.textSecondary }]}>Avg Expenses</Text>
                  <Text style={[styles.averageValue, { color: '#EF4444' }]}>
                    {formatCurrency(averages.avgExpenses)}
                  </Text>
                </View>
                
                <View style={styles.averageCard}>
                  <Text style={[styles.averageLabel, { color: theme.textSecondary }]}>Avg Net Gain</Text>
                  <Text style={[
                    styles.averageValue, 
                    { color: averages.avgNetGain >= 0 ? '#10B981' : '#EF4444' }
                  ]}>
                    {formatCurrency(averages.avgNetGain)}
                  </Text>
                </View>
                
                <View style={styles.averageCard}>
                  <Text style={[styles.averageLabel, { color: theme.textSecondary }]}>Avg Savings Rate</Text>
                  <Text style={[styles.averageValue, { color: theme.primary }]}>
                    {averages.avgSavingsRate.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Monthly List */}
          <View style={[styles.monthlyList, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Monthly History</Text>
            
            {getFilteredData().reverse().map((monthData, index) => (
              <View key={monthData.month} style={[styles.monthItem, { borderBottomColor: theme.border }]}>
                <View style={styles.monthHeader}>
                  <Text style={[styles.monthName, { color: theme.text }]}>
                    {monthData.monthName || new Date(monthData.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </Text>
                  <Text style={[
                    styles.netGain,
                    { color: monthData.netGain >= 0 ? '#10B981' : '#EF4444' }
                  ]}>
                    {monthData.netGain >= 0 ? '+' : ''}{formatCurrency(monthData.netGain)}
                  </Text>
                </View>
                
                <View style={styles.monthStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Income</Text>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>
                      {formatCurrency(monthData.income)}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Expenses</Text>
                    <Text style={[styles.statValue, { color: '#EF4444' }]}>
                      {formatCurrency(monthData.expenses)}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Savings Rate</Text>
                    <Text style={[styles.statValue, { color: theme.primary }]}>
                      {monthData.savingsPercentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="none"
          statusBarTranslucent={true}
        >
          <View style={styles.successModalOverlay}>
            <Animated.View 
              style={[
                styles.successModalContainer,
                { backgroundColor: theme.card },
                {
                  transform: [
                    {
                      scale: successAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                    {
                      translateY: successAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                  opacity: successAnimation,
                },
              ]}
            >
              {/* Success Icon */}
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              </View>
              
              {/* Success Message */}
              <Text style={[styles.successTitle, { color: theme.text }]}>Saved Successfully!</Text>
              <Text style={[styles.successMessage, { color: theme.textSecondary }]}>
                Monthly data has been saved to your history
              </Text>
            </Animated.View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activePeriod: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  chartContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
  },
  averagesContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  averagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  averageCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  averageLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  averageValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  monthlyList: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  monthItem: {
    borderBottomWidth: 1,
    paddingBottom: 16,
    marginBottom: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthName: {
    fontSize: 16,
    fontWeight: '600',
  },
  netGain: {
    fontSize: 16,
    fontWeight: '700',
  },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 20,
  },
  successModalContainer: {
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    minWidth: 280,
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  successIconContainer: {
    marginBottom: 20,
    padding: 4,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HistoryTab;