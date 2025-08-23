// src/screens/ProfileScreen/FinancialTracker/HistoryTabRevamped.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const HistoryTabRevamped = ({ theme, data, handlers }) => {
  const { financialData, formatCurrency, totalIncome, totalExpenses, savingsPercentage, isPremium } = data;
  
  // State
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6M');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'graph'
  
  // Entry form state
  const [isEditing, setIsEditing] = useState(false);
  const [entryMode, setEntryMode] = useState('auto'); // 'auto' or 'manual'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [incomeInput, setIncomeInput] = useState('');
  const [expensesInput, setExpensesInput] = useState('');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const successAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMonthlyHistory();
    animateEntry();
  }, [financialData]);

  const animateEntry = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  };

  const loadMonthlyHistory = () => {
    const history = financialData.monthlyHistory || [];
    setMonthlyData(history);
  };

  // Open modal for adding new month or editing existing
  const openEntryModal = (existingMonth = null) => {
    if (!isPremium) return;
    
    setIsEditing(!!existingMonth);
    
    if (existingMonth) {
      // Editing existing month
      const monthDate = new Date(existingMonth.month + '-01');
      setSelectedYear(monthDate.getFullYear());
      setSelectedMonth(monthDate.getMonth());
      setIncomeInput(String(existingMonth.income || 0));
      setExpensesInput(String(existingMonth.expenses || 0));
      setEntryMode('manual');
    } else {
      // Adding new month - default to current month
      setSelectedYear(new Date().getFullYear());
      setSelectedMonth(new Date().getMonth());
      setIncomeInput(String(totalIncome || 0));
      setExpensesInput(String(totalExpenses || 0));
      setEntryMode('auto');
    }
    
    setShowEntryModal(true);
  };

  const handleModeChange = (mode) => {
    setEntryMode(mode);
    if (mode === 'auto') {
      // Auto-populate with current Cash Flow data
      setIncomeInput(String(totalIncome || 0));
      setExpensesInput(String(totalExpenses || 0));
    }
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedYear(selectedYear - 1);
        setSelectedMonth(11);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedYear(selectedYear + 1);
        setSelectedMonth(0);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const saveMonth = async () => {
    try {
      const income = parseFloat(incomeInput) || 0;
      const expenses = parseFloat(expensesInput) || 0;
      const netGain = income - expenses;
      const savings = income > 0 ? ((netGain / income) * 100) : 0;
      
      const targetDate = new Date(selectedYear, selectedMonth);
      const targetMonthString = targetDate.toISOString().slice(0, 7);
      
      const monthSnapshot = {
        month: targetMonthString,
        monthName: targetDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        income,
        expenses,
        netGain,
        savingsPercentage: savings,
        timestamp: Date.now(),
        entryMode
      };

      const existingHistory = financialData.monthlyHistory || [];
      const existingIndex = existingHistory.findIndex(item => item.month === targetMonthString);

      let updatedHistory;
      if (existingIndex >= 0) {
        updatedHistory = [...existingHistory];
        updatedHistory[existingIndex] = monthSnapshot;
      } else {
        updatedHistory = [...existingHistory, monthSnapshot];
      }

      updatedHistory = updatedHistory
        .sort((a, b) => new Date(b.month) - new Date(a.month))
        .slice(0, 24);

      const updatedFinancialData = {
        ...financialData,
        monthlyHistory: updatedHistory
      };

      if (handlers?.saveCurrentFinancialData) {
        await handlers.saveCurrentFinancialData(updatedFinancialData);
        setMonthlyData(updatedHistory);
        setShowEntryModal(false);
        showSuccessMessage();
      }
    } catch (error) {
      console.error('Error saving monthly data:', error);
    }
  };

  const showSuccessMessage = () => {
    setShowSuccessModal(true);
    
    Animated.sequence([
      Animated.spring(successAnimation, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(successAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowSuccessModal(false);
    });
  };

  const getFilteredData = () => {
    if (selectedPeriod === 'ALL') {
      return monthlyData;
    }
    
    const periodMap = { '3M': 3, '6M': 6, '1Y': 12 };
    const monthsToShow = periodMap[selectedPeriod];
    
    // Calculate the cutoff date (X months ago from today)
    const today = new Date();
    const cutoffDate = new Date(today.getFullYear(), today.getMonth() - monthsToShow + 1, 1);
    const cutoffString = cutoffDate.toISOString().slice(0, 7); // Format: YYYY-MM
    
    // Filter entries that are within the date range
    return monthlyData.filter(entry => entry.month >= cutoffString);
  };

  const getSummaryStats = () => {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) return null;

    const avgIncome = filteredData.reduce((sum, entry) => sum + entry.income, 0) / filteredData.length;
    const avgExpenses = filteredData.reduce((sum, entry) => sum + entry.expenses, 0) / filteredData.length;
    const avgNetGain = avgIncome - avgExpenses;
    const avgSavingsPercent = avgIncome > 0 ? (avgNetGain / avgIncome) * 100 : 0;

    return {
      avgIncome,
      avgExpenses,
      avgNetGain,
      avgSavingsPercent: Math.max(0, avgSavingsPercent)
    };
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) return null;

    // Reverse to show chronological order (oldest to newest)
    const sortedData = [...filteredData].reverse();
    
    return {
      labels: sortedData.map(entry => {
        const date = new Date(entry.month + '-01');
        return date.toLocaleDateString('en-US', { month: 'short' });
      }),
      datasets: [
        {
          data: sortedData.map(entry => entry.income),
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green for income
          strokeWidth: 3
        },
        {
          data: sortedData.map(entry => entry.expenses),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for expenses
          strokeWidth: 3
        },
        {
          data: sortedData.map(entry => entry.netGain),
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // Blue for net gain
          strokeWidth: 3
        }
      ]
    };
  };

  const getSelectedMonthName = () => {
    try {
      const date = new Date(selectedYear, selectedMonth);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (error) {
      return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >

        {monthlyData.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="bar-chart-outline" size={64} color="#3A3A3C" />
            </View>
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptyDescription}>
              Start tracking your monthly financial data to see trends and insights
            </Text>
          </View>
        ) : (
          <>
            {/* Compact Controls */}
            <View style={styles.compactControls}>
              <View style={styles.periodSelector}>
                {['3M', '6M', '1Y'].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.compactPeriodButton,
                      selectedPeriod === period && styles.compactPeriodButtonActive
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text style={[
                      styles.compactPeriodText,
                      selectedPeriod === period && styles.compactPeriodTextActive
                    ]}>
                      {period}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.compactViewToggle}>
                <TouchableOpacity
                  style={[
                    styles.compactToggleOption,
                    viewMode === 'list' && styles.compactToggleActive
                  ]}
                  onPress={() => setViewMode('list')}
                >
                  <Ionicons 
                    name="list" 
                    size={16} 
                    color={viewMode === 'list' ? '#FFFFFF' : '#666666'} 
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.compactToggleOption,
                    viewMode === 'graph' && styles.compactToggleActive
                  ]}
                  onPress={() => setViewMode('graph')}
                >
                  <Ionicons 
                    name="bar-chart" 
                    size={16} 
                    color={viewMode === 'graph' ? '#FFFFFF' : '#666666'} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Historical Data */}
            <View style={styles.historicalData}>

              {viewMode === 'graph' ? (
                /* Graph View */
                getChartData() ? (
                  <View style={styles.chartContainer}>
                    <LineChart
                      data={getChartData()}
                      width={width - 48}
                      height={220}
                      chartConfig={{
                        backgroundColor: '#1C1C1E',
                        backgroundGradientFrom: '#1C1C1E',
                        backgroundGradientTo: '#1C1C1E',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(142, 142, 147, ${opacity})`,
                        style: {
                          borderRadius: 16
                        },
                        propsForDots: {
                          r: "4",
                          strokeWidth: "2",
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: "",
                          stroke: "#2C2C2E",
                          strokeWidth: 1
                        }
                      }}
                      bezier
                      style={styles.chart}
                      formatYLabel={(value) => {
                        const currency = financialData.currency || '$';
                        const numValue = parseFloat(value);
                        if (numValue >= 1000) {
                          return `${currency}${(numValue / 1000).toFixed(0)}k`;
                        }
                        return `${currency}${numValue.toFixed(0)}`;
                      }}
                    />
                    <View style={styles.chartLegend}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.legendText}>Income</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                        <Text style={styles.legendText}>Expenses</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
                        <Text style={styles.legendText}>Net Gain</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.noDataChart}>
                    <Ionicons name="bar-chart-outline" size={48} color="#3A3A3C" />
                    <Text style={styles.noDataText}>No data for chart view</Text>
                  </View>
                )
              ) : (
                /* List View */
                <>
                  {getFilteredData().map((monthData, index) => (
                <TouchableOpacity
                  key={monthData.month}
                  style={styles.monthCard}
                  onPress={() => openEntryModal(monthData)}
                  activeOpacity={0.7}
                >
                  <View style={styles.monthCardHeader}>
                    <Text style={styles.monthName}>
                      {monthData.monthName || new Date(monthData.month + '-01')
                        .toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                    </Text>
                    <View style={[
                      styles.netGainBadge,
                      { backgroundColor: monthData.netGain >= 0 ? '#10B98120' : '#EF444420' }
                    ]}>
                      <Text style={[
                        styles.netGainText,
                        { color: monthData.netGain >= 0 ? '#10B981' : '#EF4444' }
                      ]}>
                        {monthData.netGain >= 0 ? '+' : ''}{formatCurrency(monthData.netGain)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.monthCardStats}>
                    <View style={styles.miniStat}>
                      <Ionicons name="trending-up" size={14} color="#10B981" />
                      <Text style={styles.miniStatValue}>{formatCurrency(monthData.income)}</Text>
                    </View>
                    <View style={styles.miniStat}>
                      <Ionicons name="trending-down" size={14} color="#EF4444" />
                      <Text style={styles.miniStatValue}>{formatCurrency(monthData.expenses)}</Text>
                    </View>
                    <View style={styles.miniStat}>
                      <Ionicons name="analytics" size={14} color="#8E8E93" />
                      <Text style={styles.miniStatValue}>{monthData.savingsPercentage?.toFixed(1)}%</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
                </>
              )}

              {/* Summary Statistics */}
              {getSummaryStats() && (
                <View style={styles.summarySection}>
                  <Text style={styles.summaryTitle}>
                    {selectedPeriod === 'ALL' ? 'Overall' : selectedPeriod} Summary
                  </Text>
                  <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Avg Income</Text>
                      <Text style={[styles.summaryValue, { color: '#10B981' }]}>
                        {formatCurrency(getSummaryStats().avgIncome)}
                      </Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Avg Expenses</Text>
                      <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
                        {formatCurrency(getSummaryStats().avgExpenses)}
                      </Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Avg Net Gain</Text>
                      <Text style={[
                        styles.summaryValue, 
                        { color: getSummaryStats().avgNetGain >= 0 ? '#10B981' : '#EF4444' }
                      ]}>
                        {formatCurrency(getSummaryStats().avgNetGain)}
                      </Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Avg Saved</Text>
                      <Text style={[styles.summaryValue, { color: '#007AFF' }]}>
                        {getSummaryStats().avgSavingsPercent.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Entry Modal */}
      <Modal
        visible={showEntryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEntryModal(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <BlurView intensity={80} style={styles.modalOverlay}>
            <View style={styles.entryModalContent}>
              <View style={styles.entryModalHeader}>
                <Text style={styles.entryModalTitle}>
                  {isEditing ? 'Edit Month' : 'Add Month'}
                </Text>
                <TouchableOpacity onPress={() => setShowEntryModal(false)}>
                  <Ionicons name="close-circle" size={28} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              {/* Month/Year Selector */}
              <View style={styles.monthSelector}>
                <Text style={styles.selectorLabel}>Month & Year</Text>
                <View style={styles.monthYearRow}>
                  <View style={styles.monthPickerContainer}>
                    <Text style={styles.selectedMonthText}>
                      {getSelectedMonthName()}
                    </Text>
                  </View>
                  <View style={styles.monthNavigation}>
                    <TouchableOpacity 
                      style={styles.monthNavButton}
                      onPress={() => navigateMonth('prev')}
                    >
                      <Ionicons name="chevron-back" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.monthNavButton}
                      onPress={() => navigateMonth('next')}
                    >
                      <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Mode Toggle - Only show when adding new month */}
              {!isEditing && (
                <View style={styles.modeToggle}>
                  <TouchableOpacity
                    style={[
                      styles.modeOption,
                      entryMode === 'auto' && styles.modeOptionActive
                    ]}
                    onPress={() => handleModeChange('auto')}
                  >
                    <Text style={[
                      styles.modeText,
                      entryMode === 'auto' && styles.modeTextActive
                    ]}>
                      Auto-populate
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modeOption,
                      entryMode === 'manual' && styles.modeOptionActive
                    ]}
                    onPress={() => handleModeChange('manual')}
                  >
                    <Text style={[
                      styles.modeText,
                      entryMode === 'manual' && styles.modeTextActive
                    ]}>
                      Manual Entry
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {entryMode === 'auto' && !isEditing && (
                <View style={styles.autoModeInfo}>
                  <Ionicons name="information-circle-outline" size={16} color="#007AFF" />
                  <Text style={styles.autoModeText}>
                    Using data from Cash Flow: Income {formatCurrency(totalIncome || 0)}, Expenses {formatCurrency(totalExpenses || 0)}
                  </Text>
                </View>
              )}

              {/* Income Input */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Income</Text>
                <View style={styles.currencyInput}>
                  <Text style={styles.inputCurrency}>{financialData.currency}</Text>
                  <TextInput
                    style={[
                      styles.textInput, 
                      { paddingLeft: 32 },
                      entryMode === 'auto' && !isEditing && styles.textInputDisabled
                    ]}
                    value={incomeInput}
                    onChangeText={setIncomeInput}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#666666"
                    editable={entryMode === 'manual' || isEditing}
                  />
                </View>
              </View>

              {/* Expenses Input */}
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Expenses</Text>
                <View style={styles.currencyInput}>
                  <Text style={styles.inputCurrency}>{financialData.currency}</Text>
                  <TextInput
                    style={[
                      styles.textInput, 
                      { paddingLeft: 32 },
                      entryMode === 'auto' && !isEditing && styles.textInputDisabled
                    ]}
                    value={expensesInput}
                    onChangeText={setExpensesInput}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#666666"
                    editable={entryMode === 'manual' || isEditing}
                  />
                </View>
              </View>

              {/* Net Gain Preview */}
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Net Gain</Text>
                <Text style={[
                  styles.previewValue,
                  { color: (parseFloat(incomeInput || 0) - parseFloat(expensesInput || 0)) >= 0 ? '#10B981' : '#EF4444' }
                ]}>
                  {formatCurrency(parseFloat(incomeInput || 0) - parseFloat(expensesInput || 0))}
                </Text>
              </View>

              <View style={styles.entryModalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowEntryModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveMonth}
                >
                  <Text style={styles.saveButtonText}>Save Month</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="none"
          statusBarTranslucent={true}
        >
          <BlurView intensity={80} style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.successModal,
                {
                  transform: [
                    {
                      scale: successAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      })
                    }
                  ],
                  opacity: successAnimation
                }
              ]}
            >
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text style={styles.successTitle}>
                Month Saved
              </Text>
              <Text style={styles.successSubtitle}>
                Your monthly data has been recorded
              </Text>
            </Animated.View>
          </BlurView>
        </Modal>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  
  // Compact Controls
  compactControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 32,
    marginTop: 20,
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  compactPeriodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
  },
  compactPeriodButtonActive: {
    backgroundColor: '#1A1A1A',
  },
  compactPeriodText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    letterSpacing: 0.2,
  },
  compactPeriodTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  compactViewToggle: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  compactToggleOption: {
    padding: 8,
    borderRadius: 7,
  },
  compactToggleActive: {
    backgroundColor: '#1A1A1A',
  },
  
  // Historical Data
  historicalData: {
    marginHorizontal: 32,
  },
  
  currentMonthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  currentMonthInfo: {
    flex: 1,
  },
  currentMonthLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  currentMonthValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentMonthStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2C2C2E',
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  tapToSave: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  
  // Monthly List
  monthlyListSection: {
    paddingHorizontal: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 2,
  },
  toggleOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleOptionActive: {
    backgroundColor: '#007AFF',
  },
  monthCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  monthCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  netGainBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  netGainText: {
    fontSize: 14,
    fontWeight: '600',
  },
  monthCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniStatValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  
  // Chart Styles
  chartContainer: {
    marginVertical: 16,
  },
  chart: {
    borderRadius: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  noDataChart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  
  // Summary Styles
  summarySection: {
    marginTop: 24,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryModalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 24,
    width: width - 48,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  entryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  entryModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  // Month Selector
  monthSelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
  },
  monthYearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthPickerContainer: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  selectedMonthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  monthNavigation: {
    flexDirection: 'row',
    gap: 8,
  },
  monthNavButton: {
    width: 44,
    height: 44,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Mode Toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 2,
    marginBottom: 20,
  },
  modeOption: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  modeOptionActive: {
    backgroundColor: '#007AFF',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  autoModeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  autoModeText: {
    fontSize: 12,
    color: '#007AFF',
    flex: 1,
  },
  
  // Form Styles
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 8,
  },
  currencyInput: {
    position: 'relative',
  },
  inputCurrency: {
    position: 'absolute',
    left: 16,
    top: 14,
    fontSize: 16,
    color: '#8E8E93',
    zIndex: 1,
  },
  textInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textInputDisabled: {
    backgroundColor: '#1A1A1C',
    color: '#8E8E93',
  },
  
  // Preview Section
  previewSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  
  // Action Buttons
  entryModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Success Modal
  successModal: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default HistoryTabRevamped;