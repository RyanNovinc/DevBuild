// src/screens/ProfileScreen/FinancialTracker/OverviewTab.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { LineChart } from 'react-native-chart-kit';

// Import existing components
import SummaryTab from './SummaryTab';
import DebtTabRevamped from './DebtTabRevamped';

const { width } = Dimensions.get('window');

const OverviewTab = ({ theme, data, handlers, onNavigateToTracking }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const [showNetWorthModal, setShowNetWorthModal] = useState(false);
  const [assets, setAssets] = useState('');
  const [liabilities, setLiabilities] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const successAlertAnim = useRef(new Animated.Value(0)).current;
  const [showGraphView, setShowGraphView] = useState(false);
  const [graphType, setGraphType] = useState('income'); // 'income', 'expenses', 'savings', 'networth'
  const [isAccumulative, setIsAccumulative] = useState(false); // Toggle for cumulative view
  const [showEditingView, setShowEditingView] = useState(false); // Toggle for full-screen editing
  const [showInfoView, setShowInfoView] = useState(false); // Toggle for info view
  const editingViewOpacity = useRef(new Animated.Value(0)).current;
  const infoViewOpacity = useRef(new Animated.Value(0)).current;
  
  const { financialData, formatCurrency, totalDebt } = data;
  
  // Calculate lifetime totals from monthly history
  const calculateLifetimeTotals = () => {
    const monthlyHistory = financialData?.monthlyHistory || [];
    const currentMonth = {
      totalIncome: calculateCurrentIncome(),
      totalExpenses: calculateCurrentExpenses()
    };
    
    let lifetimeIncome = currentMonth.totalIncome;
    let lifetimeExpenses = currentMonth.totalExpenses;
    let totalMonths = 1; // Include current month
    
    monthlyHistory.forEach(month => {
      lifetimeIncome += month.income || 0;
      lifetimeExpenses += month.expenses || 0;
      totalMonths++;
    });
    
    
    const savingsPercentage = lifetimeIncome > 0 ? 
      ((lifetimeIncome - lifetimeExpenses) / lifetimeIncome) * 100 : 0;
    
    return {
      lifetimeIncome,
      lifetimeExpenses,
      savingsPercentage,
      totalMonths
    };
  };
  
  const calculateCurrentIncome = () => {
    return (financialData?.incomeSources || []).reduce((total, income) => 
      total + (income.amount || 0), 0);
  };
  
  const calculateCurrentExpenses = () => {
    return (financialData?.expenses || []).reduce((total, expense) => 
      total + (expense.amount || 0), 0);
  };

  const calculateLifetimeNetIncome = () => {
    const lifetimeTotals = calculateLifetimeTotals();
    return lifetimeTotals.lifetimeIncome - lifetimeTotals.lifetimeExpenses;
  };
  
  const { lifetimeIncome, lifetimeExpenses, savingsPercentage } = calculateLifetimeTotals();

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

  }, []);

  const toggleSection = (section) => {
    Animated.timing(fadeAnim, {
      toValue: 0.9,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      setExpandedSection(expandedSection === section ? null : section);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };


  const handleNetWorthPress = () => {
    // Initialize with current values
    const currentAssets = financialData?.totalAssets || 0;
    const currentLiabilities = financialData?.totalLiabilities || totalDebt || 0;
    
    console.log('Opening net worth modal with current values:');
    console.log('Assets:', currentAssets);
    console.log('Liabilities:', currentLiabilities);
    console.log('Financial data:', financialData);
    
    setAssets(currentAssets.toString());
    setLiabilities(currentLiabilities.toString());
    setShowNetWorthModal(true);
  };

  const showSuccessMessage = () => {
    setShowSuccessAlert(true);
    Animated.sequence([
      Animated.spring(successAlertAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(successAlertAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowSuccessAlert(false);
    });
  };

  const handleSaveNetWorth = async () => {
    const assetsValue = parseFloat(assets) || 0;
    const liabilitiesValue = parseFloat(liabilities) || 0;
    
    console.log('Saving net worth - Assets:', assetsValue, 'Liabilities:', liabilitiesValue);
    
    try {
      if (handlers?.updateNetWorth) {
        await handlers.updateNetWorth(assetsValue, liabilitiesValue);
        setShowNetWorthModal(false);
        
        // Animate out editing view, then show graph and success message
        Animated.timing(editingViewOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowEditingView(false);
          setShowGraphView(true);
          showSuccessMessage();
        });
      } else {
        console.log('updateNetWorth handler not available');
        Alert.alert('Error', 'Unable to save net worth data. Please try again.');
      }
    } catch (error) {
      console.error('Error saving net worth:', error);
      Alert.alert('Error', 'Unable to save net worth data. Please try again.');
    }
  };

  const handleIncomeGraphPress = () => {
    if (handlers?.openFullScreenGraph) {
      const graphData = getGraphDataForType('income');
      handlers.openFullScreenGraph('income', graphData, isAccumulative, setIsAccumulative);
    }
  };

  const handleExpensesGraphPress = () => {
    if (handlers?.openFullScreenGraph) {
      const graphData = getGraphDataForType('expenses');
      handlers.openFullScreenGraph('expenses', graphData, isAccumulative, setIsAccumulative);
    }
  };


  const handleNetWorthGraphPress = () => {
    if (handlers?.openFullScreenGraph) {
      const graphData = getGraphDataForType('networth');
      handlers.openFullScreenGraph('networth', graphData, false, () => {});
    }
  };

  const handleNetWorthEditPress = () => {
    // Initialize with current values
    const currentAssets = financialData?.totalAssets || 0;
    const currentLiabilities = financialData?.totalLiabilities || totalDebt || 0;
    
    setAssets(currentAssets.toString());
    setLiabilities(currentLiabilities.toString());
    
    // Hide graph view first, then show and animate editing view
    setShowGraphView(false);
    setShowEditingView(true);
    
    // Start with 0 opacity and animate to 1
    editingViewOpacity.setValue(0);
    Animated.timing(editingViewOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeEditingView = () => {
    Animated.timing(editingViewOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowEditingView(false);
      setShowGraphView(true);
    });
  };

  // Process data for graphs - lifetime data
  const getGraphData = () => {
    return getGraphDataForType(graphType);
  };

  // Process data for graphs by type - lifetime data
  const getGraphDataForType = (targetGraphType, useAccumulative = isAccumulative) => {
    const monthlyHistory = financialData?.monthlyHistory || [];
    
    if (monthlyHistory.length === 0) {
      // Return appropriate empty state data based on graph type
      const emptyStateLabels = {
        income: 'Income Tracking',
        expenses: 'Expense Tracking', 
        networth: 'Net Worth Progress'
      };
      
      return {
        labels: ['Start Tracking'],
        datasets: [{ data: [0], color: () => '#666666', strokeWidth: 3 }],
        label: emptyStateLabels[targetGraphType] || 'No Data Available',
        isEmpty: true
      };
    }
    
    // Sort by date and take all historical data
    const sortedData = monthlyHistory.sort((a, b) => new Date(a.month) - new Date(b.month));
    
    const labels = sortedData.map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });
    
    let data = [];
    let color = '#00D4AA';
    let label = '';
    
    switch (targetGraphType) {
      case 'income':
        data = sortedData.map(item => item.income || 0);
        if (useAccumulative) {
          // Convert to cumulative totals
          let runningTotal = 0;
          data = data.map(value => {
            runningTotal += value;
            return runningTotal;
          });
        }
        color = '#00D4AA';
        label = useAccumulative ? 'Lifetime Cumulative Income' : 'Lifetime Income Trend';
        break;
      case 'expenses':
        data = sortedData.map(item => item.expenses || 0);
        if (useAccumulative) {
          // Convert to cumulative totals
          let runningTotal = 0;
          data = data.map(value => {
            runningTotal += value;
            return runningTotal;
          });
        }
        color = '#FF6B6B';
        label = useAccumulative ? 'Lifetime Cumulative Expenses' : 'Lifetime Expenses Trend';
        break;
      case 'networth':
        // Calculate net worth progression: cumulative net income + assets - liabilities
        let runningNetWorth = 0;
        const currentAssets = financialData?.totalAssets || 0;
        const currentLiabilities = financialData?.totalLiabilities || 0;
        const baseNetWorth = currentAssets - currentLiabilities;
        
        data = sortedData.map((item, index) => {
          const netIncome = (item.income || 0) - (item.expenses || 0);
          runningNetWorth += netIncome;
          // For the most recent month, include current assets/liabilities
          if (index === sortedData.length - 1) {
            return runningNetWorth + baseNetWorth;
          }
          return runningNetWorth + baseNetWorth;
        });
        color = '#007AFF';
        label = 'Net Worth Progression';
        break;
      default:
        data = [0];
        color = '#666666';
        label = 'Unknown Graph Type';
    }
    
    // Return data with proper color function
    return {
      labels,
      datasets: [{ data, color: () => color, strokeWidth: 3 }],
      label
    };
  };


  // Render graph view
  if (showGraphView) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0A0A0A', '#000000']}
          style={styles.gradientBackground}
        />
        
        {/* Graph Header */}
        <View style={styles.graphHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowGraphView(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
            <Text style={styles.backButtonText}>Overview</Text>
          </TouchableOpacity>
          <Text style={styles.graphTitle}>
            {getGraphData().label}
          </Text>
          
          {/* Toggle button for accumulative view (only for income/expenses) */}
          {(graphType === 'income' || graphType === 'expenses') && (
            <TouchableOpacity 
              style={[styles.toggleButton, { backgroundColor: isAccumulative ? '#007AFF' : '#1A1A1A' }]}
              onPress={() => setIsAccumulative(!isAccumulative)}
            >
              <Text style={[styles.toggleButtonText, { color: isAccumulative ? '#FFFFFF' : '#666666' }]}>
                {isAccumulative ? 'Cumulative' : 'Monthly'}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Buttons for net worth */}
          {graphType === 'networth' && (
            <View style={styles.netWorthButtons}>
              <TouchableOpacity 
                style={styles.infoButton}
                onPress={() => {
                  setShowGraphView(false);
                  setShowInfoView(true);
                  infoViewOpacity.setValue(0);
                  Animated.timing(infoViewOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                  }).start();
                }}
              >
                <Ionicons name="information-circle-outline" size={18} color="#007AFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.editAssetsButton}
                onPress={handleNetWorthEditPress}
              >
                <Ionicons name="create-outline" size={18} color="#007AFF" />
                <Text style={styles.editAssetsButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Full Screen Chart */}
        <ScrollView 
          style={styles.graphScrollView}
          contentContainerStyle={styles.graphScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {(() => {
            const data = getGraphData().datasets[0].data;
            // Show graph if there are positive values
            return data.length > 0 && data.some(val => val > 0)
          })() ? (
            <LineChart
              data={getGraphData()}
              width={width - 40}
              height={300}
              chartConfig={{
                backgroundColor: '#000000',
                backgroundGradientFrom: '#1A1A1A',
                backgroundGradientTo: '#0A0A0A',
                decimalPlaces: 0,
                color: (opacity = 1) => getGraphData().datasets[0].color(),
                labelColor: (opacity = 1) => '#666666',
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: getGraphData().datasets[0].color()
                },
              }}
              withDots={true}
              formatYLabel={(value) => {
                // Format currency for income and expenses
                const num = parseFloat(value);
                if (isNaN(num)) return '$0';
                if (Math.abs(num) >= 1000000) {
                  return `$${(num / 1000000).toFixed(1)}M`;
                } else if (Math.abs(num) >= 1000) {
                  return `$${(num / 1000).toFixed(1)}K`;
                } else {
                  return `$${Math.round(num)}`;
                }
              }}
              bezier
              style={styles.fullScreenChart}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="bar-chart-outline" size={64} color="#333333" />
              <Text style={styles.noDataText}>No historical data available</Text>
              <Text style={styles.noDataSubtext}>
                Start tracking your {graphType} to see lifetime trends
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // Render full-screen editing view
  if (showEditingView) {
    return (
      <Animated.View style={[styles.container, { opacity: editingViewOpacity }]}>
        <LinearGradient
          colors={['#0A0A0A', '#000000']}
          style={styles.gradientBackground}
        />
        
        {/* Editing Header */}
        <View style={styles.graphHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={closeEditingView}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
            <Text style={styles.backButtonText}>Back to Graph</Text>
          </TouchableOpacity>
          <Text style={styles.graphTitle}>Edit Assets & Debt</Text>
        </View>

        {/* Editing Content */}
        <ScrollView 
          style={styles.graphScrollView}
          contentContainerStyle={styles.editingScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.editingSection}>
            <Text style={styles.editingSectionTitle}>Assets</Text>
            <Text style={styles.editingSectionSubtitle}>Cash, savings, investments, property, etc.</Text>
            <TextInput
              style={styles.editingInput}
              value={assets}
              onChangeText={setAssets}
              placeholder="Enter total assets"
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.editingSection}>
            <Text style={styles.editingSectionTitle}>Liabilities</Text>
            <Text style={styles.editingSectionSubtitle}>Loans, credit cards, mortgages, etc.</Text>
            <TextInput
              style={styles.editingInput}
              value={liabilities}
              onChangeText={setLiabilities}
              placeholder="Enter total liabilities"
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.editingNetWorthDisplay}>
            <Text style={styles.editingNetWorthLabel}>Total Net Worth</Text>
            
            {/* Show breakdown */}
            <View style={styles.netWorthBreakdown}>
              <Text style={styles.breakdownItem}>
                Income - Expenses: {formatCurrency(calculateLifetimeNetIncome())}
              </Text>
              <Text style={styles.breakdownItem}>
                Additional Assets: {formatCurrency(parseFloat(assets) || 0)}
              </Text>
              <Text style={styles.breakdownItem}>
                Additional Debt: -{formatCurrency(parseFloat(liabilities) || 0)}
              </Text>
            </View>
            
            <View style={styles.netWorthTotal}>
              <Text style={[styles.editingNetWorthValue, { 
                color: (calculateLifetimeNetIncome() + (parseFloat(assets) || 0) - (parseFloat(liabilities) || 0)) >= 0 ? '#00D4AA' : '#FF6B6B' 
              }]}>
                {formatCurrency(calculateLifetimeNetIncome() + (parseFloat(assets) || 0) - (parseFloat(liabilities) || 0))}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.editingSaveButton}
            onPress={handleSaveNetWorth}
            activeOpacity={0.8}
          >
            <Text style={styles.editingSaveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  }

  // Render full-screen info view
  if (showInfoView) {
    return (
      <Animated.View style={[styles.container, { opacity: infoViewOpacity }]}>
        <LinearGradient
          colors={['#0A0A0A', '#000000']}
          style={styles.gradientBackground}
        />
        
        {/* Info Header */}
        <View style={styles.graphHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              Animated.timing(infoViewOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }).start(() => {
                setShowInfoView(false);
                setShowGraphView(true);
              });
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
            <Text style={styles.backButtonText}>Back to Graph</Text>
          </TouchableOpacity>
          <Text style={styles.graphTitle}>Net Worth Calculation</Text>
        </View>

        {/* Info Content */}
        <ScrollView 
          style={styles.graphScrollView}
          contentContainerStyle={styles.infoScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>How Your Net Worth is Calculated</Text>
            
            <View style={styles.calculationStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Base Financial Position</Text>
                <Text style={styles.stepDescription}>
                  Your lifetime income minus lifetime expenses from all the transactions you've tracked in the app.
                </Text>
                <Text style={styles.stepExample}>
                  Example: $50,000 earned - $40,000 spent = $10,000
                </Text>
              </View>
            </View>

            <View style={styles.calculationStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Add Additional Assets</Text>
                <Text style={styles.stepDescription}>
                  Cash in savings accounts, investments, property value, retirement accounts, or any other assets you own.
                </Text>
                <Text style={styles.stepExample}>
                  Example: $20,000 in savings + $150,000 house value
                </Text>
              </View>
            </View>

            <View style={styles.calculationStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Subtract Additional Debt</Text>
                <Text style={styles.stepDescription}>
                  Credit card balances, student loans, mortgages, car loans, or any other debts you owe.
                </Text>
                <Text style={styles.stepExample}>
                  Example: $5,000 credit cards + $120,000 mortgage
                </Text>
              </View>
            </View>

            <View style={styles.finalCalculation}>
              <Text style={styles.finalTitle}>Your Total Net Worth</Text>
              <Text style={styles.finalFormula}>
                Base Position + Assets - Debt = Net Worth
              </Text>
              <Text style={styles.finalExample}>
                $10,000 + $170,000 - $125,000 = $55,000
              </Text>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <LinearGradient
        colors={['#0A0A0A', '#000000']}
        style={styles.gradientBackground}
      />

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Enhanced Header with Period Info */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Financial Overview</Text>
            <View style={styles.periodBadge}>
              <Ionicons name="calendar-outline" size={12} color="#007AFF" />
              <Text style={styles.periodText}>Lifetime</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Track your complete financial journey
          </Text>
        </View>

        {/* Primary Metrics Row - Larger Cards */}
        <View style={styles.primaryMetrics}>
          <TouchableOpacity 
            style={[styles.primaryCard, styles.incomeCard]} 
            activeOpacity={0.8} 
            onPress={handleIncomeGraphPress}
          >
            <LinearGradient
              colors={['rgba(0, 212, 170, 0.1)', 'transparent']}
              style={styles.cardGradient}
            />
            <View style={styles.primaryCardHeader}>
              <View style={[styles.primaryIcon, { backgroundColor: 'rgba(0, 212, 170, 0.15)' }]}>
                <Ionicons name="trending-up" size={24} color="#00D4AA" />
              </View>
              <Ionicons name="arrow-forward" size={16} color="#00D4AA" />
            </View>
            <Text style={styles.primaryLabel}>Total Income</Text>
            <Text style={[styles.primaryValue, { color: '#00D4AA' }]}>
              {formatCurrency(lifetimeIncome)}
            </Text>
            <View style={styles.trendIndicator}>
              <Text style={styles.trendText}>View trends</Text>
              <Ionicons name="analytics-outline" size={12} color="#666666" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryCard, styles.expensesCard]} 
            activeOpacity={0.8} 
            onPress={handleExpensesGraphPress}
          >
            <LinearGradient
              colors={['rgba(255, 107, 107, 0.1)', 'transparent']}
              style={styles.cardGradient}
            />
            <View style={styles.primaryCardHeader}>
              <View style={[styles.primaryIcon, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
                <Ionicons name="trending-down" size={24} color="#FF6B6B" />
              </View>
              <Ionicons name="arrow-forward" size={16} color="#FF6B6B" />
            </View>
            <Text style={styles.primaryLabel}>Total Expenses</Text>
            <Text style={[styles.primaryValue, { color: '#FF6B6B' }]}>
              {formatCurrency(lifetimeExpenses)}
            </Text>
            <View style={styles.trendIndicator}>
              <Text style={styles.trendText}>View trends</Text>
              <Ionicons name="analytics-outline" size={12} color="#666666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Secondary Metrics - Net Worth and Savings */}
        <View style={styles.secondaryMetrics}>
          <TouchableOpacity 
            style={styles.secondaryCard} 
            activeOpacity={0.8} 
            onPress={handleNetWorthGraphPress}
          >
            <View style={styles.secondaryCardContent}>
              <View style={styles.secondaryLeft}>
                <View style={[styles.secondaryIcon, { backgroundColor: 'rgba(0, 122, 255, 0.15)' }]}>
                  <Ionicons name="wallet" size={20} color="#007AFF" />
                </View>
                <View style={styles.secondaryInfo}>
                  <Text style={styles.secondaryLabel}>Net Worth</Text>
                  <Text style={[styles.secondaryValue, { color: '#007AFF' }]}>
                    {formatCurrency(calculateNetWorth(data))}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleNetWorthPress}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryCard} 
            activeOpacity={0.8} 
          >
            <View style={styles.secondaryCardContent}>
              <View style={styles.secondaryLeft}>
                <View style={[styles.secondaryIcon, { backgroundColor: 'rgba(255, 217, 61, 0.15)' }]}>
                  <Ionicons name="trending-up" size={20} color={savingsPercentage >= 0 ? '#00D4AA' : '#FF6B6B'} />
                </View>
                <View style={styles.secondaryInfo}>
                  <Text style={styles.secondaryLabel}>Saved</Text>
                  <Text style={[styles.secondaryValue, { color: savingsPercentage >= 0 ? '#00D4AA' : '#FF6B6B' }]}>
                    {savingsPercentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
              <View style={styles.rateIndicator}>
              </View>
            </View>
          </TouchableOpacity>
        </View>

      </Animated.View>

      {/* Net Worth Editor Modal */}
      <Modal visible={showNetWorthModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Net Worth</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowNetWorthModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.netWorthSection}>
              <Text style={styles.sectionLabel}>Assets</Text>
              <TextInput
                style={styles.netWorthInput}
                value={assets}
                onChangeText={setAssets}
                placeholder="Enter total assets"
                placeholderTextColor="#666666"
                keyboardType="numeric"
              />
              <Text style={styles.sectionHint}>
                Cash, investments, property, etc.
              </Text>
            </View>
            
            <View style={styles.netWorthSection}>
              <Text style={styles.sectionLabel}>Liabilities</Text>
              <TextInput
                style={styles.netWorthInput}
                value={liabilities}
                onChangeText={setLiabilities}
                placeholder="Enter total liabilities"
                placeholderTextColor="#666666"
                keyboardType="numeric"
              />
              <Text style={styles.sectionHint}>
                Loans, credit cards, mortgages, etc.
              </Text>
            </View>
            
            <View style={styles.netWorthTotal}>
              <Text style={styles.totalLabel}>Net Worth</Text>
              <Text style={[styles.totalValue, { 
                color: ((parseFloat(assets) || 0) - (parseFloat(liabilities) || 0)) >= 0 ? '#00D4AA' : '#FF6B6B' 
              }]}>
                {formatCurrency((parseFloat(assets) || 0) - (parseFloat(liabilities) || 0))}
              </Text>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowNetWorthModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={handleSaveNetWorth}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Success Alert */}
      {showSuccessAlert && (
        <Animated.View 
          style={[
            styles.successAlert,
            {
              opacity: successAlertAnim,
              transform: [
                { 
                  translateY: successAlertAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0]
                  })
                },
                { 
                  scale: successAlertAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })
                }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#00D4AA', '#00B894']}
            style={styles.successAlertGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.successAlertContent}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.successTextContainer}>
                <Text style={styles.successTitle}>Success!</Text>
                <Text style={styles.successMessage}>Net worth updated successfully</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

    </ScrollView>
  );
};

// Helper functions
const calculateNetWorth = (data) => {
  const { financialData, totalDebt, totalAssets, netWorth } = data;
  
  // If we have the new netWorth calculation from utils, use that
  if (typeof netWorth === 'number') {
    return netWorth;
  }
  
  // Fallback to old calculation method if new system isn't available yet
  const monthlyHistory = financialData?.monthlyHistory || [];
  const currentIncome = (financialData?.incomeSources || []).reduce((total, income) => 
    total + (income.amount || 0), 0);
  const currentExpenses = (financialData?.expenses || []).reduce((total, expense) => 
    total + (expense.amount || 0), 0);
  
  let lifetimeIncome = currentIncome;
  let lifetimeExpenses = currentExpenses;
  
  monthlyHistory.forEach(month => {
    lifetimeIncome += month.income || 0;
    lifetimeExpenses += month.expenses || 0;
  });
  
  const lifetimeNetIncome = lifetimeIncome - lifetimeExpenses;
  
  // Add assets and subtract liabilities
  const assets = totalAssets || financialData?.totalAssets || 0;
  const liabilities = financialData?.totalLiabilities || totalDebt || 0;
  
  // Complete net worth formula
  return lifetimeNetIncome + assets - liabilities;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  content: {
    flex: 1,
  },
  
  // Enhanced Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  periodText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#888888',
    letterSpacing: 0.2,
  },
  
  // Primary Metrics - New Design
  primaryMetrics: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  primaryCard: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    position: 'relative',
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 100,
  },
  primaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  primaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#AAAAAA',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  primaryValue: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
  },
  
  // Secondary Metrics
  secondaryMetrics: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  secondaryCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginBottom: 12,
  },
  secondaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  secondaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  secondaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  secondaryInfo: {
    flex: 1,
  },
  secondaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888888',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  secondaryValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateIndicator: {
    backgroundColor: 'rgba(255, 217, 61, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rateText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFD93D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  

  // Net Worth Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    backgroundColor: '#1A1A1C',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#2A2A2C',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  modalCloseButton: {
    padding: 4,
  },
  netWorthSection: {
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  netWorthInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  sectionValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  sectionHint: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
  },
  netWorthTotal: {
    backgroundColor: '#0F0F0F',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Custom Success Alert Styles
  successAlert: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
    elevation: 1000,
  },
  successAlertGradient: {
    borderRadius: 16,
    padding: 2,
  },
  successAlertContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  successMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 18,
  },

  // Graph Modal Styles
  graphModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  graphModalContent: {
    backgroundColor: '#1A1A1C',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#2A2A2C',
  },
  graphModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  graphModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    gap: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#2A2A2C',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
    marginTop: 12,
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Full-screen Graph View Styles
  graphHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 6,
  },
  graphTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  graphScrollView: {
    flex: 1,
  },
  graphScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  fullScreenChart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  netWorthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  editButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  editAssetsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  editAssetsButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 4,
    letterSpacing: 0.3,
  },

  // Full-screen Editing View Styles
  editingScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  editingSection: {
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  editingSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  editingSectionSubtitle: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 16,
    lineHeight: 20,
  },
  editingInput: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
    paddingVertical: 12,
    textAlign: 'center',
  },
  editingNetWorthDisplay: {
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  editingNetWorthLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#888888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editingNetWorthValue: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  editingSaveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  editingSaveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  infoButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  netWorthBreakdown: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  breakdownItem: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 6,
    textAlign: 'center',
  },
  netWorthTotal: {
    alignItems: 'center',
  },
  
  // Net Worth Buttons Container
  netWorthButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Info View Styles
  infoScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  infoSection: {
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -0.3,
  },
  calculationStep: {
    flexDirection: 'row',
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  stepDescription: {
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 22,
    marginBottom: 8,
  },
  stepExample: {
    fontSize: 14,
    color: '#888888',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  finalCalculation: {
    backgroundColor: '#0F0F0F',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  finalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00D4AA',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  finalFormula: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '500',
  },
  finalExample: {
    fontSize: 18,
    color: '#00D4AA',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // Full-screen graph styles
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  fullScreenGraphContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  fullScreenGraphTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  fullScreenToggle: {
    position: 'absolute',
    top: 100,
    right: 30,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  fullScreenToggleText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  fullScreenStats: {
    marginTop: 30,
    alignItems: 'center',
  },
  fullScreenStatsText: {
    fontSize: 16,
    color: '#00D4AA',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  fullScreenNoData: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenNoDataText: {
    fontSize: 18,
    color: '#666666',
    marginTop: 16,
    fontWeight: '300',
  },
});

export default OverviewTab;