// src/screens/ProfileScreen/FinancialTracker/SummaryTab/components/PercentileDetailModal.js
import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Dimensions,
  Animated,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Rect, G, Text as SvgText } from 'react-native-svg';
import { getPercentileColor, getPercentileRating, getPercentileLabel } from '../utils';
import styles from '../styles';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  spacing,
  fontSizes,
  useScreenDimensions,
  useIsLandscape,
  useSafeSpacing,
  accessibility,
  meetsContrastRequirements,
  ensureAccessibleTouchTarget
} from '../../../../../utils/responsive';

// Get screen dimensions for the graph
const PercentileDetailModal = ({ 
  visible, 
  onClose, 
  type, 
  percentile, 
  value, 
  theme,
  formatCurrency,
  isDarkMode
}) => {
  // Screen dimensions and orientation
  const dimensions = useScreenDimensions();
  const isLandscape = useIsLandscape();
  const safeSpacing = useSafeSpacing();
  
  // Calculate responsive graph dimensions - FIX: round all dimension calculations
  const graphWidth = Math.round(isLandscape ? 
    scaleWidth(dimensions.width * 0.7) : 
    scaleWidth(dimensions.width - 60));
  
  const graphHeight = Math.round(isLandscape ? 
    scaleHeight(300) : 
    isSmallDevice ? scaleHeight(250) : scaleHeight(350));
    
  // State to toggle between graph and table view
  const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'table'
  // Animation value for the graph
  const [barAnimation] = useState(new Animated.Value(0));
  
  // Get the appropriate data and title based on type
  const getTypeDetails = () => {
    switch(type) {
      case 'income':
        return {
          title: 'Monthly Income Percentiles',
          description: 'Where your income ranks in the US population',
          dataSource: require('../../../FinancialTracker/utils').INCOME_PERCENTILES,
          color: getPercentileColor(percentile),
          yAxisLabel: 'Monthly Income',
          xAxisLabel: 'Percentile',
          citation: 'Data source: US Census Bureau Current Population Survey, 2023-2024',
          explanation: 'This chart shows where your monthly income of ' + formatCurrency(value) + ' places you compared to the US population. Being in the ' + percentile.toFixed(1) + 'th percentile means you earn more than ' + percentile.toFixed(1) + '% of individuals in the US.'
        };
      case 'expense':
        return {
          title: 'Monthly Expenses Percentiles',
          description: 'How your spending compares to the US population',
          dataSource: require('../../../FinancialTracker/utils').EXPENSE_PERCENTILES,
          color: getPercentileColor(percentile),
          yAxisLabel: 'Monthly Expenses',
          xAxisLabel: 'Percentile (lower is better)',
          citation: 'Data source: US Bureau of Labor Statistics Consumer Expenditure Survey, 2023',
          explanation: 'This chart shows where your monthly expenses of ' + formatCurrency(value) + ' place you compared to the US population. Being in the ' + percentile.toFixed(1) + 'th percentile means you spend less than ' + percentile.toFixed(1) + '% of individuals in the US.'
        };
      case 'savings':
        return {
          title: 'Savings Rate Percentiles',
          description: 'How your savings rate compares to the US population',
          dataSource: require('../../../FinancialTracker/utils').SAVINGS_PERCENTILES,
          color: getPercentileColor(percentile),
          yAxisLabel: 'Savings Rate (%)',
          xAxisLabel: 'Percentile',
          citation: 'Data source: US Federal Reserve Personal Savings Rate Data, 2023-2024',
          explanation: 'This chart shows where your monthly savings rate of ' + value.toFixed(1) + '% places you compared to the US population. Being in the ' + percentile.toFixed(1) + 'th percentile means you save more than ' + percentile.toFixed(1) + '% of individuals in the US.'
        };
      default:
        return {
          title: 'Percentile Data',
          description: 'Your financial data compared to the US population',
          dataSource: [],
          color: '#4CAF50',
          yAxisLabel: 'Value',
          xAxisLabel: 'Percentile',
          citation: 'Data sources: US Census Bureau, Bureau of Labor Statistics, Federal Reserve',
          explanation: 'This chart shows how your financial metrics compare to the US population.'
        };
    }
  };

  const typeDetails = getTypeDetails();
  
  // Ensure color has proper contrast
  const safeColor = meetsContrastRequirements(typeDetails.color, theme.card, false) ? 
    typeDetails.color : theme.text;
  
  // Helper function to generate nice round numbers for axis ticks
  const generateNiceNumbers = (min, max, targetCount) => {
    if (min === max) {
      min = 0;
      max = max * 2 || 10;
    }
    
    // Ensure min is always less than max
    if (min > max) {
      [min, max] = [max, min];
    }
    
    const range = max - min;
    const rawStep = range / (targetCount - 1);
    
    // Calculate a nice step size (1, 2, 5, 10, 20, 50, etc.)
    const mag = Math.floor(Math.log10(rawStep));
    const magPow = Math.pow(10, mag);
    
    let step = magPow;
    if (rawStep / magPow > 5) {
      step = 10 * magPow;
    } else if (rawStep / magPow > 2) {
      step = 5 * magPow;
    } else if (rawStep / magPow > 1) {
      step = 2 * magPow;
    }
    
    // Align min and max to nice values
    const niceMin = Math.floor(min / step) * step;
    let niceMax = Math.ceil(max / step) * step;
    
    // Ensure we have enough steps
    if ((niceMax - niceMin) / step < targetCount - 1) {
      niceMax += step;
    }
    
    // Generate the tick values
    const ticks = [];
    for (let value = niceMin; value <= niceMax; value += step) {
      // Avoid floating point precision issues
      const roundedValue = parseFloat(value.toFixed(10));
      ticks.push(roundedValue);
    }
    
    return { min: niceMin, max: niceMax, ticks };
  };
  
  // Transform data for the graph
  const processData = useMemo(() => {
    const dataSource = typeDetails.dataSource;
    if (!dataSource || dataSource.length === 0) return {
      chartData: [],
      yDomain: [0, 100],
      yTicks: [0, 25, 50, 75, 100]
    };
    
    let chartData;
    
    if (type === 'income') {
      chartData = [...dataSource]
        .sort((a, b) => a.percentile - b.percentile)
        .map(item => ({
          percentile: item.percentile,
          value: item.amount,
          isUserPoint: false
        }));
    } else if (type === 'expense') {
      chartData = [...dataSource]
        .sort((a, b) => a.percentile - b.percentile)
        .map(item => ({
          percentile: item.percentile,
          value: item.amount,
          isUserPoint: false
        }));
    } else if (type === 'savings') {
      chartData = [...dataSource]
        .sort((a, b) => a.percentile - b.percentile)
        .map(item => ({
          percentile: item.percentile,
          value: item.rate,
          isUserPoint: false
        }));
    } else {
      chartData = [];
    }
    
    // Get values for domain calculation
    const values = chartData.map(item => item.value);
    values.push(value); // Add user's value
    
    // Calculate y-axis domain
    let yDomain;
    if (type === 'savings') {
      // For savings, ensure domain includes zero and has some padding
      const absMax = Math.max(Math.abs(Math.min(...values)), Math.abs(Math.max(...values)));
      const niceNumbers = generateNiceNumbers(-Math.max(20, absMax), Math.max(20, absMax), 7);
      yDomain = [niceNumbers.min, niceNumbers.max];
    } else {
      // For income and expenses, start at 0 (or lower if needed)
      const min = Math.min(0, Math.min(...values));
      const max = Math.max(...values) * 1.1; // Add 10% padding at the top
      const niceNumbers = generateNiceNumbers(min, max, 6);
      yDomain = [niceNumbers.min, niceNumbers.max];
    }
    
    // Calculate ticks for y-axis
    const yTicks = generateNiceNumbers(yDomain[0], yDomain[1], 8).ticks;
    
    return { chartData, yDomain, yTicks };
  }, [typeDetails.dataSource, type, value]);
  
  // Format ticks based on data type
  const formatYTick = (value) => {
    if (type === 'income' || type === 'expense') {
      // Get the currency symbol from the formatCurrency function's first character
      const currencySymbol = formatCurrency(0).split('0')[0]; // This gets the full currency symbol
      
      // For large values, format with K or M suffix
      if (Math.abs(value) >= 1000000) {
        return `${currencySymbol}${(value / 1000000).toFixed(1)}M`;
      } else if (Math.abs(value) >= 1000) {
        return `${currencySymbol}${(value / 1000).toFixed(1)}K`;
      }
      return formatCurrency(value);
    } else if (type === 'savings') {
      return `${value}%`;
    }
    return value.toString();
  };
  
  // Start animation when component is visible
  React.useEffect(() => {
    if (visible) {
      Animated.timing(barAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false
      }).start();
    } else {
      // Reset animation if modal is closed
      barAnimation.setValue(0);
    }
  }, [visible, barAnimation]);

  // Create an accessibility description of the chart data
  const getChartAccessibilityLabel = () => {
    const valueText = type === 'savings' ? 
      `${value.toFixed(1)}%` : 
      formatCurrency(value);
      
    const chartType = type === 'income' ? 
      'income percentile chart' : 
      type === 'expense' ? 
        'expense percentile chart' : 
        'savings rate percentile chart';
        
    return `${chartType}. Your ${type} is ${valueText}, which puts you in the ${percentile.toFixed(1)} percentile, rated as ${getPercentileRating(percentile)}. This means you are better than ${percentile.toFixed(1)} percent of the US population.`;
  };

  // Render the graph view using react-native-svg
  const renderGraphView = () => {
    const { chartData, yDomain, yTicks } = processData;
    
    // Set up graph dimensions with increased padding for better label visibility
    // FIX: Round all padding values to prevent floating point issues
    const padding = { 
      top: Math.round(scaleHeight(40)),
      right: Math.round(scaleWidth(30)),
      bottom: Math.round(scaleHeight(40)),
      left: Math.round(scaleWidth(isSmallDevice ? 80 : 90))
    };
    
    // FIX: Round chart dimensions to prevent floating point issues
    const chartWidth = Math.round(graphWidth - padding.left - padding.right);
    const chartHeight = Math.round(graphHeight - padding.top - padding.bottom);
    
    // Function to convert data point to SVG coordinates
    const getPointCoordinates = (point) => {
      // FIX: Round calculated values to prevent floating-point precision errors
      // X position based on percentile (0-100)
      const xRatio = point.percentile / 100;
      const x = Math.round((padding.left + xRatio * chartWidth) * 100) / 100;
      
      // Y position based on value, mapped to the chart height
      const yRange = yDomain[1] - yDomain[0];
      const yRatio = (point.value - yDomain[0]) / yRange;
      const y = Math.round((graphHeight - padding.bottom - (yRatio * chartHeight)) * 100) / 100;
      
      return { x, y };
    };
    
    // X-axis ticks
    const xTicks = [0, 25, 50, 75, 100];
    
    // Generate SVG path for the line
    let pathData = '';
    if (chartData.length > 0) {
      const sortedData = [...chartData].sort((a, b) => a.percentile - b.percentile);
      const firstPoint = getPointCoordinates(sortedData[0]);
      pathData = `M ${firstPoint.x} ${firstPoint.y}`;
      
      for (let i = 1; i < sortedData.length; i++) {
        const point = getPointCoordinates(sortedData[i]);
        pathData += ` L ${point.x} ${point.y}`;
      }
    }
    
    // Calculate user point position
    const userPoint = {
      percentile: percentile,
      value: value,
      isUserPoint: true
    };
    const userPointCoords = getPointCoordinates(userPoint);
    
    return (
      <View 
        style={[
          styles.graphContainer, 
          styles.fullScreenGraphContainer,
          isLandscape && { height: Math.round(scaleHeight(isTablet ? 400 : 280)) }
        ]}
        accessible={true}
        accessibilityLabel={getChartAccessibilityLabel()}
        accessibilityRole="image"
      >
        {/* US population data indicator - now as a bubble above the graph */}
        <View 
          style={[
            styles.usDataBubble, 
            { 
              backgroundColor: safeColor + '15',
              paddingHorizontal: Math.round(spacing.m),
              paddingVertical: Math.round(spacing.xs),
              marginBottom: Math.round(spacing.s)
            }
          ]}
          accessible={true}
          accessibilityLabel="Data based on US population"
        >
          <Ionicons name="information-circle-outline" size={Math.round(scaleFontSize(16))} color={safeColor} />
          <Text 
            style={[
              styles.usDataBubbleText, 
              { 
                color: safeColor,
                fontSize: fontSizes.s,
                marginLeft: Math.round(spacing.xs)
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            Based on US population data
          </Text>
        </View>
        
        <Svg 
          width={Math.round(graphWidth)} 
          height={Math.round(graphHeight)}
          accessibilityRole="none"
        >
          {/* Background */}
          <Rect
            x={Math.round(padding.left)}
            y={Math.round(padding.top)}
            width={Math.round(chartWidth)}
            height={Math.round(chartHeight)}
            fill={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
            rx={4}
          />
          
          {/* Y Axis grid lines and labels */}
          {yTicks.map((tick, i) => {
            // FIX: Round the Y position calculation to avoid floating-point errors
            const yRange = yDomain[1] - yDomain[0];
            const yRatio = (tick - yDomain[0]) / yRange;
            const y = Math.round((graphHeight - padding.bottom - (yRatio * chartHeight)) * 100) / 100;
            
            return (
              <G key={`y-tick-${i}`}>
                <Line
                  x1={Math.round(padding.left)}
                  y1={y}
                  x2={Math.round(padding.left + chartWidth)}
                  y2={y}
                  stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                  strokeWidth={i === 0 ? 0.75 : 0.5}
                  strokeDasharray={i === 0 ? "" : "5,5"}
                />
                <SvgText
                  fill={theme.textSecondary}
                  fontSize={Math.round(scaleFontSize(10))}
                  textAnchor="end"
                  x={Math.round(padding.left - scaleWidth(8))}
                  y={Math.round(y + 4)}
                >
                  {formatYTick(tick)}
                </SvgText>
              </G>
            );
          })}
          
          {/* X Axis grid lines and labels */}
          {xTicks.map((tick, i) => {
            // FIX: Round the X position calculation to avoid floating-point errors
            const xRatio = tick / 100;
            const x = Math.round((padding.left + (xRatio * chartWidth)) * 100) / 100;
            
            return (
              <G key={`x-tick-${i}`}>
                <Line
                  x1={x}
                  y1={Math.round(padding.top)}
                  x2={x}
                  y2={Math.round(padding.top + chartHeight)}
                  stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                  strokeWidth={tick === 0 ? 0.75 : 0.5}
                  strokeDasharray={tick === 0 ? "" : "5,5"}
                />
                <SvgText
                  fill={theme.textSecondary}
                  fontSize={Math.round(scaleFontSize(10))}
                  textAnchor="middle"
                  x={x}
                  y={Math.round(graphHeight - padding.bottom + scaleHeight(16))}
                >
                  {tick}%
                </SvgText>
              </G>
            );
          })}
          
          {/* Line connecting data points */}
          <Path
            d={pathData}
            stroke={safeColor}
            strokeWidth={isSmallDevice ? 1.5 : 2}
            fill="none"
          />
          
          {/* User point highlighted */}
          <Circle
            cx={Math.round(userPointCoords.x)}
            cy={Math.round(userPointCoords.y)}
            r={isSmallDevice ? 4 : 5}
            fill="#FF5722"
            stroke="white"
            strokeWidth={1.5}
          />
          
          {/* Y-axis label */}
          <SvgText
            fill={theme.textSecondary}
            fontSize={Math.round(scaleFontSize(12))}
            textAnchor="middle"
            x="20"
            y={Math.round(padding.top + chartHeight / 2)}
            rotation="-90"
            originX="20"
            originY={Math.round(padding.top + chartHeight / 2)}
          >
            {typeDetails.yAxisLabel}
          </SvgText>
          
          {/* X-axis label */}
          <SvgText
            fill={theme.textSecondary}
            fontSize={Math.round(scaleFontSize(12))}
            textAnchor="middle"
            x={Math.round(padding.left + chartWidth / 2)}
            y={Math.round(graphHeight - 5)}
          >
            {typeDetails.xAxisLabel}
          </SvgText>
        </Svg>
        
        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View 
              style={[
                styles.legendDot, 
                { 
                  backgroundColor: safeColor,
                  width: Math.round(scaleWidth(10)),
                  height: Math.round(scaleWidth(10)),
                  borderRadius: Math.round(scaleWidth(5)),
                  marginRight: Math.round(spacing.xs)
                }
              ]} 
            />
            <Text 
              style={[
                styles.legendText, 
                { 
                  color: theme.text,
                  fontSize: fontSizes.xs
                }
              ]}
              maxFontSizeMultiplier={1.8}
            >
              {type === 'income' ? 'Income Percentile' :
                type === 'expense' ? 'Expense Percentile' : 'Savings Rate Percentile'}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View 
              style={[
                styles.legendDot, 
                { 
                  backgroundColor: '#FF5722',
                  width: Math.round(scaleWidth(10)),
                  height: Math.round(scaleWidth(10)),
                  borderRadius: Math.round(scaleWidth(5)),
                  marginRight: Math.round(spacing.xs)
                }
              ]} 
            />
            <Text 
              style={[
                styles.legendText, 
                { 
                  color: theme.text,
                  fontSize: fontSizes.xs
                }
              ]}
              maxFontSizeMultiplier={1.8}
            >
              Your Position
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Render the table view
  const renderTableView = () => {
    // Sort data by percentile for display
    const dataSource = typeDetails.dataSource;
    const sortedData = [...dataSource].sort((a, b) => a.percentile - b.percentile);
    
    // Get value field based on type
    const valueField = type === 'savings' ? 'rate' : 'amount';
    
    // Create table accessibility label
    const tableAccessibilityLabel = `${type} percentile table showing your position at the ${percentile.toFixed(1)} percentile with a ${type === 'savings' ? 'rate' : 'value'} of ${type === 'savings' ? value.toFixed(1) + '%' : formatCurrency(value)}`;
    
    return (
      <View 
        style={[
          styles.tableContainer,
          {
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: Math.round(scaleWidth(8)),
            marginVertical: Math.round(spacing.l),
            maxHeight: Math.round(scaleHeight(isLandscape ? 250 : 300))
          }
        ]}
        accessible={true}
        accessibilityLabel={tableAccessibilityLabel}
        accessibilityRole="table"
      >
        <View style={[
          styles.tableHeader,
          { 
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            paddingVertical: Math.round(spacing.m),
            paddingHorizontal: Math.round(spacing.m)
          }
        ]}>
          <Text 
            style={[
              styles.tableHeaderCell, 
              { 
                color: theme.text, 
                flex: 1,
                fontWeight: 'bold',
                fontSize: fontSizes.s
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Percentile
          </Text>
          <Text 
            style={[
              styles.tableHeaderCell, 
              { 
                color: theme.text, 
                flex: 2,
                fontWeight: 'bold',
                fontSize: fontSizes.s
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            {type === 'income' ? 'Monthly Income' :
              type === 'expense' ? 'Monthly Expenses' : 'Savings Rate'}
          </Text>
          <Text 
            style={[
              styles.tableHeaderCell, 
              { 
                color: theme.text, 
                flex: 1.5,
                fontWeight: 'bold',
                fontSize: fontSizes.s
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Rating
          </Text>
        </View>
        
        <ScrollView 
          style={[
            styles.tableBody, 
            { 
              maxHeight: Math.round(scaleHeight(isLandscape ? 250 : 400))
            }
          ]} 
          showsVerticalScrollIndicator={true}
        >
          {sortedData.map((item, index) => {
            const itemPercentile = item.percentile;
            const itemValue = item[valueField];
            // FIX: Use a more precise comparison to avoid floating-point issues
            const isUserRow = Math.abs(itemPercentile - percentile) < 0.1; // Close enough to be user's row
            
            // Insert user row if not present
            if (index > 0 &&
              sortedData[index - 1].percentile < percentile &&
              itemPercentile > percentile &&
              !isUserRow) {
              // User row to insert
              const userRow = (
                <View 
                  key="user-row" 
                  style={[
                    styles.tableRowUser, 
                    { 
                      backgroundColor: `${safeColor}20`,
                      paddingVertical: Math.round(spacing.m),
                      paddingHorizontal: Math.round(spacing.m)
                    }
                  ]}
                  accessible={true}
                  accessibilityLabel={`Your position: ${percentile.toFixed(1)} percentile with ${type === 'savings' ? value.toFixed(1) + ' percent' : formatCurrency(value)}`}
                  accessibilityRole="text"
                >
                  <Text 
                    style={[
                      styles.tableCell, 
                      { 
                        color: safeColor, 
                        fontWeight: 'bold', 
                        flex: 1,
                        fontSize: fontSizes.s
                      }
                    ]}
                    maxFontSizeMultiplier={1.8}
                  >
                    {percentile.toFixed(1)}%
                  </Text>
                  <Text 
                    style={[
                      styles.tableCell, 
                      { 
                        color: safeColor, 
                        fontWeight: 'bold', 
                        flex: 2,
                        fontSize: fontSizes.s
                      }
                    ]}
                    maxFontSizeMultiplier={1.8}
                  >
                    {type === 'savings' ? `${value.toFixed(1)}%` : formatCurrency(value)}
                    <Text 
                      style={[
                        styles.yourPositionIndicator,
                        {
                          fontStyle: 'italic',
                          fontSize: fontSizes.xs
                        }
                      ]}
                      maxFontSizeMultiplier={1.8}
                    > 
                      (You)
                    </Text>
                  </Text>
                  <Text 
                    style={[
                      styles.tableCell, 
                      { 
                        color: safeColor, 
                        fontWeight: 'bold', 
                        flex: 1.5,
                        fontSize: fontSizes.s
                      }
                    ]}
                    maxFontSizeMultiplier={1.8}
                  >
                    {getPercentileRating(percentile)}
                  </Text>
                </View>
              );
              
              // Normal row
              const normalRow = (
                <View 
                  key={`row-${index}`} 
                  style={[
                    styles.tableRow,
                    { 
                      backgroundColor: isDarkMode 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(0,0,0,0.02)',
                      paddingVertical: Math.round(spacing.s),
                      paddingHorizontal: Math.round(spacing.m)
                    }
                  ]}
                  accessible={true}
                  accessibilityLabel={`${itemPercentile.toFixed(1)} percentile: ${type === 'savings' ? itemValue.toFixed(1) + ' percent' : formatCurrency(itemValue)}, rated as ${getPercentileRating(itemPercentile)}`}
                  accessibilityRole="text"
                >
                  <Text 
                    style={[
                      styles.tableCell, 
                      { 
                        color: theme.text, 
                        flex: 1,
                        fontSize: fontSizes.s
                      }
                    ]}
                    maxFontSizeMultiplier={1.8}
                  >
                    {itemPercentile.toFixed(1)}%
                  </Text>
                  <Text 
                    style={[
                      styles.tableCell, 
                      { 
                        color: theme.text, 
                        flex: 2,
                        fontSize: fontSizes.s
                      }
                    ]}
                    maxFontSizeMultiplier={1.8}
                  >
                    {type === 'savings' ? `${itemValue.toFixed(1)}%` : formatCurrency(itemValue)}
                  </Text>
                  <Text 
                    style={[
                      styles.tableCell, 
                      { 
                        color: getPercentileColor(itemPercentile), 
                        flex: 1.5,
                        fontSize: fontSizes.s
                      }
                    ]}
                    maxFontSizeMultiplier={1.8}
                  >
                    {getPercentileRating(itemPercentile)}
                  </Text>
                </View>
              );
              
              return [userRow, normalRow];
            }
            
            // If this is the user's row (or very close), highlight it
            if (isUserRow) {
              return (
                <View 
                  key={`row-${index}`} 
                  style={[
                    styles.tableRowUser, 
                    { 
                      backgroundColor: `${safeColor}20`,
                      paddingVertical: Math.round(spacing.m),
                      paddingHorizontal: Math.round(spacing.m)
                    }
                  ]}
                  accessible={true}
                  accessibilityLabel={`Your position: ${percentile.toFixed(1)} percentile with ${type === 'savings' ? value.toFixed(1) + ' percent' : formatCurrency(value)}, rated as ${getPercentileRating(percentile)}`}
                  accessibilityRole="text"
                >
                  <Text 
                    style={[
                      styles.tableCell, 
                      { 
                        color: safeColor, 
                        fontWeight: 'bold', 
                        flex: 1,
                        fontSize: fontSizes.s
                      }
                    ]}
                    maxFontSizeMultiplier={1.8}
                  >
                    {percentile.toFixed(1)}%
                  </Text>
                  <Text 
                    style={[
                      styles.tableCell, 
                      { 
                        color: safeColor, 
                        fontWeight: 'bold', 
                        flex: 2,
                        fontSize: fontSizes.s
                      }
                    ]}
                    maxFontSizeMultiplier={1.8}
                  >
                    {type === 'savings' ? `${value.toFixed(1)}%` : formatCurrency(value)}
                    <Text 
                      style={[
                        styles.yourPositionIndicator,
                        {
                          fontStyle: 'italic',
                          fontSize: fontSizes.xs
                        }
                      ]}
                      maxFontSizeMultiplier={1.8}
                    > 
                      (You)
                    </Text>
                  </Text>
                  <Text 
                    style={[
                      styles.tableCell, 
                      { 
                        color: safeColor, 
                        fontWeight: 'bold', 
                        flex: 1.5,
                        fontSize: fontSizes.s
                      }
                    ]}
                    maxFontSizeMultiplier={1.8}
                  >
                    {getPercentileRating(percentile)}
                  </Text>
                </View>
              );
            }
            
            // Normal row
            return (
              <View 
                key={`row-${index}`} 
                style={[
                  styles.tableRow,
                  { 
                    backgroundColor: index % 2 === 0 
                      ? (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)')
                      : 'transparent',
                    paddingVertical: Math.round(spacing.s),
                    paddingHorizontal: Math.round(spacing.m)
                  }
                ]}
                accessible={true}
                accessibilityLabel={`${itemPercentile.toFixed(1)} percentile: ${type === 'savings' ? itemValue.toFixed(1) + ' percent' : formatCurrency(itemValue)}, rated as ${getPercentileRating(itemPercentile)}`}
                accessibilityRole="text"
              >
                <Text 
                  style={[
                    styles.tableCell, 
                    { 
                      color: theme.text, 
                      flex: 1,
                      fontSize: fontSizes.s
                    }
                  ]}
                  maxFontSizeMultiplier={1.8}
                >
                  {itemPercentile.toFixed(1)}%
                </Text>
                <Text 
                  style={[
                    styles.tableCell, 
                    { 
                      color: theme.text, 
                      flex: 2,
                      fontSize: fontSizes.s
                    }
                  ]}
                  maxFontSizeMultiplier={1.8}
                >
                  {type === 'savings' ? `${itemValue.toFixed(1)}%` : formatCurrency(itemValue)}
                </Text>
                <Text 
                  style={[
                    styles.tableCell, 
                    { 
                      color: getPercentileColor(itemPercentile), 
                      flex: 1.5,
                      fontSize: fontSizes.s
                    }
                  ]}
                  maxFontSizeMultiplier={1.8}
                >
                  {getPercentileRating(itemPercentile)}
                </Text>
              </View>
            );
          })}
          
          {/* Add user row at the end if it's beyond the last percentile */}
          {sortedData.length > 0 &&
            percentile > sortedData[sortedData.length - 1].percentile && (
              <View 
                key="user-row-end" 
                style={[
                  styles.tableRowUser, 
                  { 
                    backgroundColor: `${safeColor}20`,
                    paddingVertical: Math.round(spacing.m),
                    paddingHorizontal: Math.round(spacing.m)
                  }
                ]}
                accessible={true}
                accessibilityLabel={`Your position: ${percentile.toFixed(1)} percentile with ${type === 'savings' ? value.toFixed(1) + ' percent' : formatCurrency(value)}, rated as ${getPercentileRating(percentile)}`}
                accessibilityRole="text"
              >
                <Text 
                  style={[
                    styles.tableCell, 
                    { 
                      color: safeColor, 
                      fontWeight: 'bold', 
                      flex: 1,
                      fontSize: fontSizes.s
                    }
                  ]}
                  maxFontSizeMultiplier={1.8}
                >
                  {percentile.toFixed(1)}%
                </Text>
                <Text 
                  style={[
                    styles.tableCell, 
                    { 
                      color: safeColor, 
                      fontWeight: 'bold', 
                      flex: 2,
                      fontSize: fontSizes.s
                    }
                  ]}
                  maxFontSizeMultiplier={1.8}
                >
                  {type === 'savings' ? `${value.toFixed(1)}%` : formatCurrency(value)}
                  <Text 
                    style={[
                      styles.yourPositionIndicator,
                      {
                        fontStyle: 'italic',
                        fontSize: fontSizes.xs
                      }
                    ]}
                    maxFontSizeMultiplier={1.8}
                  > 
                    (You)
                  </Text>
                </Text>
                <Text 
                  style={[
                    styles.tableCell, 
                    { 
                      color: safeColor, 
                      fontWeight: 'bold', 
                      flex: 1.5,
                      fontSize: fontSizes.s
                    }
                  ]}
                  maxFontSizeMultiplier={1.8}
                >
                  {getPercentileRating(percentile)}
                </Text>
              </View>
            )}
        </ScrollView>
      </View>
    );
  };
  
  // Render full screen content (now the only view)
  const renderFullScreenContent = () => (
    <View 
      style={[
        styles.fullScreenContainer, 
        { 
          backgroundColor: theme.background,
          paddingBottom: Math.round(safeSpacing.bottom)
        }
      ]}
    >
      <View 
        style={[
          styles.fullScreenHeader,
          {
            paddingTop: Math.round(safeSpacing.top + spacing.m),
            paddingBottom: Math.round(spacing.m),
            paddingHorizontal: Math.round(spacing.l)
          }
        ]}
      >
        <Text 
          style={[
            styles.fullScreenTitle, 
            { 
              color: theme.text,
              fontSize: fontSizes.xxl
            }
          ]}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {typeDetails.title}
        </Text>
        <TouchableOpacity 
          onPress={onClose}
          style={ensureAccessibleTouchTarget({
            width: Math.round(scaleWidth(44)),
            height: Math.round(scaleWidth(44))
          })}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close detail view"
        >
          <Ionicons name="close" size={Math.round(scaleFontSize(24))} color={theme.text} />
        </TouchableOpacity>
      </View>
      
      <View 
        style={[
          styles.fullScreenViewToggle,
          {
            paddingVertical: Math.round(spacing.m),
            borderBottomWidth: 1,
            borderBottomColor: theme.border
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.fullScreenViewToggleButton,
            {
              paddingVertical: Math.round(spacing.s),
              paddingHorizontal: Math.round(spacing.l),
              borderRadius: Math.round(scaleWidth(20)),
              marginHorizontal: Math.round(spacing.s)
            },
            viewMode === 'graph' && { backgroundColor: safeColor + '20' }
          ]}
          onPress={() => setViewMode('graph')}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="Graph view"
          accessibilityState={{ selected: viewMode === 'graph' }}
        >
          <Ionicons
            name="bar-chart-outline"
            size={Math.round(scaleFontSize(20))}
            color={viewMode === 'graph' ? safeColor : theme.textSecondary}
          />
          <Text 
            style={[
              styles.fullScreenViewToggleText,
              { 
                color: viewMode === 'graph' ? safeColor : theme.textSecondary,
                fontSize: fontSizes.m,
                fontWeight: '500',
                marginLeft: Math.round(spacing.s)
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Graph
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.fullScreenViewToggleButton,
            {
              paddingVertical: Math.round(spacing.s),
              paddingHorizontal: Math.round(spacing.l),
              borderRadius: Math.round(scaleWidth(20)),
              marginHorizontal: Math.round(spacing.s)
            },
            viewMode === 'table' && { backgroundColor: safeColor + '20' }
          ]}
          onPress={() => setViewMode('table')}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="Table view"
          accessibilityState={{ selected: viewMode === 'table' }}
        >
          <Ionicons
            name="list-outline"
            size={Math.round(scaleFontSize(20))}
            color={viewMode === 'table' ? safeColor : theme.textSecondary}
          />
          <Text 
            style={[
              styles.fullScreenViewToggleText,
              { 
                color: viewMode === 'table' ? safeColor : theme.textSecondary,
                fontSize: fontSizes.m,
                fontWeight: '500',
                marginLeft: Math.round(spacing.s)
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Table
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={[
          styles.fullScreenContent,
          {
            padding: Math.round(spacing.m)
          }
        ]}
        contentContainerStyle={{
          paddingBottom: Math.round(spacing.xl)
        }}
      >
        <View 
          style={[
            styles.fullScreenPositionContainer,
            {
              marginBottom: Math.round(spacing.m)
            }
          ]}
        >
          <View 
            style={[
              styles.fullScreenPositionCard, 
              { 
                backgroundColor: theme.card,
                borderRadius: Math.round(scaleWidth(16)),
                padding: Math.round(spacing.l),
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2
              }
            ]}
            accessible={true}
            accessibilityLabel={`Your ${type} position: ${percentile.toFixed(1)} percentile, rated as ${getPercentileRating(percentile)}`}
            accessibilityRole="text"
          >
            <Text 
              style={[
                styles.fullScreenPositionLabel, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.m,
                  marginBottom: Math.round(spacing.xxs)
                }
              ]}
              maxFontSizeMultiplier={1.8}
            >
              Your Position
            </Text>
            <Text 
              style={[
                styles.fullScreenPositionValue, 
                { 
                  color: safeColor,
                  fontSize: fontSizes.xxxl,
                  fontWeight: 'bold',
                  marginBottom: Math.round(spacing.xxs)
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {getPercentileLabel(percentile)}
            </Text>
            <Text 
              style={[
                styles.fullScreenPositionAmount, 
                { 
                  color: theme.text,
                  fontSize: fontSizes.xl,
                  marginBottom: Math.round(spacing.s)
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              {type === 'savings' ? `${value.toFixed(1)}%` : formatCurrency(value)}
            </Text>
            <Text 
              style={[
                styles.fullScreenPositionRating, 
                { 
                  color: safeColor,
                  fontSize: fontSizes.l,
                  fontWeight: '600'
                }
              ]}
              maxFontSizeMultiplier={1.8}
            >
              {getPercentileRating(percentile)}
            </Text>
          </View>
        </View>
        
        {/* Graph or Table View */}
        <View 
          style={[
            styles.fullScreenCardContainer, 
            { 
              backgroundColor: theme.card,
              borderRadius: Math.round(scaleWidth(16)),
              padding: Math.round(spacing.l),
              marginBottom: Math.round(spacing.m),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }
          ]}
        >
          {viewMode === 'graph' ? renderGraphView() : renderTableView()}
        </View>
        
        <View 
          style={[
            styles.fullScreenCardContainer, 
            { 
              backgroundColor: theme.card,
              borderRadius: Math.round(scaleWidth(16)),
              padding: Math.round(spacing.l),
              marginBottom: Math.round(spacing.m),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }
          ]}
        >
          <Text 
            style={[
              styles.fullScreenExplanation, 
              { 
                color: theme.text,
                fontSize: fontSizes.m,
                lineHeight: Math.round(scaleHeight(22)),
                marginBottom: Math.round(spacing.l)
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            {typeDetails.explanation}
          </Text>
          
          <View 
            style={[
              styles.fullScreenDataSource,
              {
                paddingTop: Math.round(spacing.m),
                borderTopWidth: 1,
                borderTopColor: theme.border
              }
            ]}
          >
            <Text 
              style={[
                styles.fullScreenDataSourceTitle, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.s,
                  fontWeight: '600',
                  marginBottom: Math.round(spacing.xxs)
                }
              ]}
              maxFontSizeMultiplier={1.8}
            >
              Data Source:
            </Text>
            <Text 
              style={[
                styles.fullScreenDataSourceText, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.s,
                  fontStyle: 'italic'
                }
              ]}
              maxFontSizeMultiplier={1.8}
            >
              {typeDetails.citation}
            </Text>
          </View>
          
          {/* Added Important Notes section */}
          <View 
            style={[
              styles.dataNotesContainer, 
              { 
                marginTop: Math.round(spacing.m)
              }
            ]}
          >
            <Text 
              style={[
                styles.dataNotesTitle, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.s,
                  fontWeight: '600',
                  marginBottom: Math.round(spacing.xxs)
                }
              ]}
              maxFontSizeMultiplier={1.8}
            >
              Important Notes:
            </Text>
            <Text 
              style={[
                styles.dataNotesText, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.xs,
                  lineHeight: Math.round(scaleHeight(18))
                }
              ]}
              maxFontSizeMultiplier={1.8}
            >
              • This data is based on US population statistics{'\n'}
              • Your financial data is converted to USD for comparison{'\n'}
              • Your local economic conditions may differ{'\n'}
              • The comparison does not account for purchasing power parity or cost of living differences between regions or countries{'\n'}
              • For the most accurate comparison, consider consulting with a financial advisor familiar with your local economy
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity
        style={[
          styles.fullScreenCloseButton, 
          { 
            backgroundColor: safeColor,
            paddingVertical: Math.round(spacing.m),
            marginHorizontal: Math.round(spacing.m),
            marginBottom: Math.round(spacing.l),
            borderRadius: Math.round(scaleWidth(12))
          }
        ]}
        onPress={onClose}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Close detail view"
        accessibilityHint="Returns to financial summary screen"
      >
        <Text 
          style={[
            styles.fullScreenCloseButtonText,
            {
              color: '#FFFFFF',
              fontSize: fontSizes.l,
              fontWeight: '600'
            }
          ]}
          maxFontSizeMultiplier={1.3}
        >
          Done
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View 
        style={[
          styles.modalOverlay,
          {
            backgroundColor: 'rgba(0,0,0,0.5)',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }
        ]}
        accessible={true}
        accessibilityViewIsModal={true}
        accessibilityLabel={`${type} percentile details modal`}
      >
        {renderFullScreenContent()}
      </View>
    </Modal>
  );
};

export default PercentileDetailModal;