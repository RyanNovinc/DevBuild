// src/screens/ProfileScreen/FinancialTracker/EnhancedFullScreenGraph.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Svg, { Circle, Path, Rect, Text as SvgText, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const EnhancedFullScreenGraph = ({ graphData, onClose }) => {
  const { type, data, isAccumulative: initialAccumulative, toggleAccumulative, formatCurrency } = graphData;
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [chartType, setChartType] = useState('line'); // 'line', 'bar', 'area'
  const [isAccumulative, setIsAccumulative] = useState(initialAccumulative || false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Handle toggle
  const handleToggleAccumulative = () => {
    setIsAccumulative(!isAccumulative);
    if (toggleAccumulative) {
      toggleAccumulative();
    }
  };

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get color configuration based on type
  const getColorConfig = () => {
    const configs = {
      income: {
        primary: '#00D4AA',
        secondary: '#00B894',
        gradient: ['#00D4AA', '#00B894', '#009874'],
        light: 'rgba(0, 212, 170, 0.1)',
        icon: 'trending-up'
      },
      expenses: {
        primary: '#FF6B6B',
        secondary: '#FF5252',
        gradient: ['#FF6B6B', '#FF5252', '#FF3838'],
        light: 'rgba(255, 107, 107, 0.1)',
        icon: 'trending-down'
      },
      savings: {
        primary: '#FFD93D',
        secondary: '#FFC107',
        gradient: ['#FFD93D', '#FFC107', '#FFB300'],
        light: 'rgba(255, 217, 61, 0.1)',
        icon: 'shield-checkmark'
      },
      networth: {
        primary: '#007AFF',
        secondary: '#0051D5',
        gradient: ['#007AFF', '#0051D5', '#003FA3'],
        light: 'rgba(0, 122, 255, 0.1)',
        icon: 'wallet'
      }
    };
    return configs[type] || configs.income;
  };

  const colorConfig = getColorConfig();

  // Calculate statistics
  const calculateStats = () => {
    const values = data.datasets[0].data;
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    
    if (validValues.length === 0) return null;

    const sum = validValues.reduce((acc, val) => acc + val, 0);
    const avg = sum / validValues.length;
    const max = Math.max(...validValues);
    const min = Math.min(...validValues);
    
    // Calculate trend
    if (validValues.length >= 2) {
      const firstHalf = validValues.slice(0, Math.floor(validValues.length / 2));
      const secondHalf = validValues.slice(Math.floor(validValues.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const trend = ((secondAvg - firstAvg) / firstAvg) * 100;
      
      return { avg, max, min, trend, total: sum };
    }
    
    return { avg, max, min, trend: 0, total: sum };
  };

  const stats = calculateStats();

  // Enhanced chart configuration
  const getChartConfig = () => ({
    backgroundColor: '#000000',
    backgroundGradientFrom: '#0A0A0A',
    backgroundGradientTo: '#000000',
    backgroundGradientFromOpacity: 0.5,
    backgroundGradientToOpacity: 0,
    decimalPlaces: type === 'savings' ? 1 : 0,
    color: (opacity = 1) => colorConfig.primary,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.8})`,
    strokeWidth: 3,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    fillShadowGradient: colorConfig.primary,
    fillShadowGradientOpacity: 0.2,
    propsForBackgroundLines: {
      strokeDasharray: '5, 5',
      stroke: 'rgba(255, 255, 255, 0.05)',
      strokeWidth: 1,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colorConfig.primary,
      fill: '#000000',
    },
    propsForLabels: {
      fontSize: 11,
    },
    // Ensure proper Y-axis formatting
    yAxisSuffix: type === 'savings' ? '%' : '',
    yAxisInterval: 1,
  });

  // Format Y-axis labels with proper currency
  const formatYLabel = (value) => {
    if (type === 'savings') {
      return `${parseFloat(value).toFixed(0)}%`;
    }
    const num = parseFloat(value);
    if (isNaN(num)) return '$0';
    
    // Always include $ sign for monetary values - more visible formatting
    if (Math.abs(num) >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (Math.abs(num) >= 10000) {
      return `$${Math.round(num / 1000)}k`;
    } else if (Math.abs(num) >= 1000) {
      return `$${(num / 1000).toFixed(1)}k`;
    }
    // For smaller numbers, don't use thousand separators in axis labels
    return `$${Math.round(num)}`;
  };

  // Check if we have valid data
  const hasValidData = data.datasets[0].data.length > 0 && 
    data.datasets[0].data.some(val => {
      if (type === 'savings') {
        return val !== undefined && val !== null && !isNaN(val);
      }
      return val > 0;
    });

  // Render empty state
  if (!hasValidData || data.isEmpty) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#0A0A0A', '#000000']}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <Animated.View 
            style={[
              styles.emptyStateIcon,
              {
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={colorConfig.gradient}
              style={styles.emptyStateGradient}
            >
              <Ionicons name={colorConfig.icon} size={48} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
          
          <Text style={styles.emptyStateTitle}>{data.label}</Text>
          <Text style={styles.emptyStateSubtitle}>
            {type === 'income' ? 'Start tracking your income to see growth trends' :
             type === 'expenses' ? 'Track expenses to understand spending patterns' :
             type === 'networth' ? 'Add assets and track your wealth progression' :
             'Monitor your savings rate over time'}
          </Text>
          
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: colorConfig.primary }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.ctaButtonText}>Start Tracking</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#0A0A0A', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        {/* Chart Type Selector */}
        <View style={styles.chartTypeSelector}>
          <TouchableOpacity
            style={[styles.chartTypeButton, chartType === 'line' && styles.chartTypeActive]}
            onPress={() => setChartType('line')}
            activeOpacity={0.7}
          >
            <Ionicons name="analytics" size={18} color={chartType === 'line' ? '#FFFFFF' : '#666666'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartTypeButton, chartType === 'bar' && styles.chartTypeActive]}
            onPress={() => setChartType('bar')}
            activeOpacity={0.7}
          >
            <Ionicons name="bar-chart" size={18} color={chartType === 'bar' ? '#FFFFFF' : '#666666'} />
          </TouchableOpacity>
        </View>

        {/* Toggle for accumulative */}
        {(type === 'income' || type === 'expenses') && (
          <TouchableOpacity
            style={[styles.toggleButton, { borderColor: colorConfig.primary }]}
            onPress={handleToggleAccumulative}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, { color: colorConfig.primary }]}>
              {isAccumulative ? 'Cumulative' : 'Monthly'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Stats */}
        <Animated.View
          style={[
            styles.titleSection,
            {
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }
          ]}
        >
          <View style={[styles.titleIcon, { backgroundColor: colorConfig.light }]}>
            <Ionicons name={colorConfig.icon} size={24} color={colorConfig.primary} />
          </View>
          <Text style={styles.graphTitle}>
            {/* Update title based on accumulative toggle */}
            {type === 'income' || type === 'expenses' ? (
              isAccumulative ? 
                `Cumulative ${type === 'income' ? 'Income' : 'Expenses'}` : 
                `Monthly ${type === 'income' ? 'Income' : 'Expenses'}`
            ) : data.label}
          </Text>
          
          {stats && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Average</Text>
                <Text style={[styles.statValue, { color: colorConfig.primary }]}>
                  {type === 'savings' ? `${stats.avg.toFixed(1)}%` : 
                   formatCurrency ? formatCurrency(stats.avg) : `$${Math.round(stats.avg).toLocaleString()}`}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Peak</Text>
                <Text style={[styles.statValue, { color: colorConfig.primary }]}>
                  {type === 'savings' ? `${stats.max.toFixed(1)}%` : 
                   formatCurrency ? formatCurrency(stats.max) : `$${Math.round(stats.max).toLocaleString()}`}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Trend</Text>
                <View style={styles.trendContainer}>
                  <Ionicons
                    name={stats.trend > 0 ? 'trending-up' : stats.trend < 0 ? 'trending-down' : 'remove'}
                    size={16}
                    color={stats.trend > 0 ? '#00D4AA' : stats.trend < 0 ? '#FF6B6B' : '#666666'}
                  />
                  <Text style={[
                    styles.statValue,
                    { color: stats.trend > 0 ? '#00D4AA' : stats.trend < 0 ? '#FF6B6B' : '#666666' }
                  ]}>
                    {Math.abs(stats.trend).toFixed(0)}%
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Chart Container */}
        <View style={styles.chartContainer}>
          <LinearGradient
            colors={['transparent', colorConfig.light, 'transparent']}
            style={styles.chartGlow}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          {chartType === 'line' ? (
            <LineChart
              data={{
                ...data,
                datasets: data.datasets.map(dataset => ({
                  ...dataset,
                  color: () => colorConfig.primary,
                  strokeWidth: 3,
                }))
              }}
              width={width - 20}
              height={320}
              chartConfig={getChartConfig()}
              bezier
              style={styles.chart}
              formatYLabel={formatYLabel}
              yLabelsOffset={10}
              withInnerLines={true}
              withOuterLines={false}
              withHorizontalLines={true}
              withVerticalLines={false}
              withDots={true}
              withShadow={false}
              segments={5}
              fromZero={true}
              decorator={() => {
                if (!selectedDataPoint) return null;
                return (
                  <View style={{
                    position: 'absolute',
                    top: selectedDataPoint.y - 30,
                    left: selectedDataPoint.x - 40,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colorConfig.primary,
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                      {type === 'savings' ? 
                        `${selectedDataPoint.value.toFixed(1)}%` : 
                        (formatCurrency ? formatCurrency(selectedDataPoint.value) : `$${Math.round(selectedDataPoint.value).toLocaleString()}`)}
                    </Text>
                  </View>
                );
              }}
              onDataPointClick={(point) => {
                setSelectedDataPoint(point);
                setTimeout(() => setSelectedDataPoint(null), 2000);
              }}
            />
          ) : (
            <BarChart
              data={{
                ...data,
                datasets: data.datasets.map(dataset => ({
                  ...dataset,
                  color: () => colorConfig.primary,
                }))
              }}
              width={width - 20}
              height={320}
              chartConfig={getChartConfig()}
              style={styles.chart}
              formatYLabel={formatYLabel}
              yLabelsOffset={10}
              withInnerLines={true}
              withHorizontalLines={true}
              withVerticalLines={false}
              showBarTops={false}
              showValuesOnTopOfBars={false}
              fromZero={true}
            />
          )}
        </View>

        {/* Period Summary */}
        {stats && (
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={[colorConfig.light, 'transparent']}
              style={styles.summaryGradient}
            />
            <Text style={styles.summaryTitle}>Period Summary</Text>
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>
                  {isAccumulative ? 'Lifetime Total' : 'Period Total'} {type === 'expenses' ? 'Spent' : type === 'income' ? 'Earned' : ''}
                </Text>
                <Text style={[styles.summaryValue, { color: colorConfig.primary }]}>
                  {formatCurrency ? formatCurrency(stats.total) : `$${Math.round(stats.total).toLocaleString()}`}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Months Tracked</Text>
                <Text style={styles.summaryValue}>{data.labels.length}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Key Insights</Text>
          {stats && stats.trend !== 0 && (
            <View style={styles.insightItem}>
              <View style={[styles.insightIcon, { backgroundColor: colorConfig.light }]}>
                <Ionicons
                  name={stats.trend > 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={colorConfig.primary}
                />
              </View>
              <Text style={styles.insightText}>
                Your {isAccumulative ? 'cumulative' : 'average monthly'} {type} has {stats.trend > 0 ? 'increased' : 'decreased'} by{' '}
                <Text style={{ color: colorConfig.primary, fontWeight: '600' }}>
                  {Math.abs(stats.trend).toFixed(0)}%
                </Text>{' '}
                over the tracked period
              </Text>
            </View>
          )}
          
          {type === 'savings' && stats && (
            <View style={styles.insightItem}>
              <View style={[styles.insightIcon, { backgroundColor: colorConfig.light }]}>
                <Ionicons name="shield-checkmark" size={16} color={colorConfig.primary} />
              </View>
              <Text style={styles.insightText}>
                You're averaging a{' '}
                <Text style={{ color: colorConfig.primary, fontWeight: '600' }}>
                  {stats.avg.toFixed(1)}%
                </Text>{' '}
                savings rate
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    zIndex: 100,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  chartTypeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chartTypeButton: {
    padding: 8,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  chartTypeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleButton: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  titleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  graphTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  chartGlow: {
    position: 'absolute',
    width: width,
    height: 400,
    opacity: 0.3,
  },
  chart: {
    borderRadius: 16,
    marginHorizontal: 10,
  },
  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  summaryGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 100,
    opacity: 0.3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
  insightsCard: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(26, 26, 26, 0.3)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  ctaButton: {
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default EnhancedFullScreenGraph;