// src/screens/ProfileScreen/FinancialTracker/SummaryTab/components/BarChartCard.js
import React from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  useIsLandscape,
  accessibility,
  meetsContrastRequirements
} from '../../../../../utils/responsive';

const BarChartCard = ({ 
  theme, 
  totalIncome, 
  totalExpenses, 
  incomePercentile,
  expensePercentile,
  highestBar,
  barAnim,
  isDarkMode,
  formatCurrency
}) => {
  // Check orientation
  const isLandscape = useIsLandscape();
  
  // Fixed colors for income and expenses
  const incomeColor = '#4CAF50'; // Always green for income
  const expenseColor = '#F44336'; // Always red for expenses
  
  // Ensure text colors have proper contrast
  const safeIncomeColor = meetsContrastRequirements(incomeColor, theme.card, false) ? 
    incomeColor : theme.text;
    
  const safeExpenseColor = meetsContrastRequirements(expenseColor, theme.card, false) ? 
    expenseColor : theme.text;
    
  // Create accessibility labels for bars
  const incomeBarAccessibilityLabel = `Income: ${formatCurrency(totalIncome)}, which is ${Math.round((totalIncome / highestBar) * 100)}% of maximum value`;
  const expenseBarAccessibilityLabel = `Expenses: ${formatCurrency(totalExpenses)}, which is ${Math.round((totalExpenses / highestBar) * 100)}% of maximum value`;
  
  // Calculate responsive bar dimensions
  const barWidth = isSmallDevice ? scaleWidth(32) : scaleWidth(40);
  const barHeight = isLandscape ? scaleHeight(150) : scaleHeight(180);
  const barContainerWidth = isSmallDevice ? scaleWidth(65) : scaleWidth(80);

  return (
    <View 
      style={[
        styles.barChartCard, 
        { 
          backgroundColor: theme.card, 
          borderColor: theme.border,
          borderRadius: scaleWidth(16),
          padding: isSmallDevice ? spacing.m : spacing.l,
          marginBottom: spacing.m,
          borderWidth: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        },
        isTablet && isLandscape && { maxWidth: '48%' }
      ]}
      accessible={true}
      accessibilityLabel="Income versus expenses bar chart comparison"
      accessibilityRole="image"
    >
      <View 
        style={[
          styles.cardHeader,
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.m
          }
        ]}
      >
        <View 
          style={[
            styles.cardTitleContainer,
            {
              flexDirection: 'row',
              alignItems: 'center'
            }
          ]}
        >
          <Ionicons 
            name="bar-chart-outline" 
            size={scaleFontSize(24)} 
            color="#3F51B5" 
            style={[
              styles.cardIcon,
              {
                marginRight: spacing.s
              }
            ]} 
          />
          <Text 
            style={[
              styles.barChartTitle, 
              { 
                color: theme.text,
                fontSize: fontSizes.l,
                fontWeight: 'bold'
              }
            ]}
            maxFontSizeMultiplier={1.3}
          >
            Income vs Expenses
          </Text>
        </View>
      </View>
      
      <View 
        style={[
          styles.barChartContainer,
          {
            flexDirection: 'row',
            height: scaleHeight(isLandscape ? 190 : 220),
            marginBottom: spacing.s
          }
        ]}
      >
        <View 
          style={[
            styles.axisLabels,
            {
              justifyContent: 'space-between',
              paddingRight: spacing.s,
              height: barHeight
            }
          ]}
          importantForAccessibility="no"
        >
          <Text 
            style={[
              styles.axisLabel, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.xs
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            {formatCurrency(highestBar)}
          </Text>
          <Text 
            style={[
              styles.axisLabel, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.xs
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            {formatCurrency(highestBar/2)}
          </Text>
          <Text 
            style={[
              styles.axisLabel, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.xs
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            {formatCurrency(0)}
          </Text>
        </View>
        
        <View 
          style={[
            styles.barChart,
            {
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'flex-end'
            }
          ]}
        >
          <View 
            style={[
              styles.barContainer,
              {
                alignItems: 'center',
                width: barContainerWidth,
                marginHorizontal: spacing.s
              }
            ]}
            accessible={true}
            accessibilityLabel={incomeBarAccessibilityLabel}
            accessibilityRole="image"
          >
            <Text 
              style={[
                styles.barChartLabel, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.xs,
                  marginBottom: spacing.s
                }
              ]}
              maxFontSizeMultiplier={1.8}
            >
              Income
            </Text>
            <View 
              style={[
                styles.barBackground, 
                { 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  width: barWidth,
                  height: barHeight,
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginBottom: spacing.s
                }
              ]}
            >
              <Animated.View 
                style={[
                  styles.barFill, 
                  { 
                    backgroundColor: incomeColor,
                    width: barWidth,
                    position: 'absolute',
                    bottom: 0,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    height: barAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [0, Math.round((totalIncome / highestBar) * barHeight)]
})
                  }
                ]} 
              />
            </View>
            <Text 
              style={[
                styles.barAmount, 
                { 
                  color: safeIncomeColor,
                  fontSize: fontSizes.xs,
                  fontWeight: '500'
                }
              ]}
              maxFontSizeMultiplier={1.8}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatCurrency(totalIncome)}
            </Text>
          </View>
          
          <View 
            style={[
              styles.barContainer,
              {
                alignItems: 'center',
                width: barContainerWidth,
                marginHorizontal: spacing.s
              }
            ]}
            accessible={true}
            accessibilityLabel={expenseBarAccessibilityLabel}
            accessibilityRole="image"
          >
            <Text 
              style={[
                styles.barChartLabel, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.xs,
                  marginBottom: spacing.s
                }
              ]}
              maxFontSizeMultiplier={1.8}
            >
              Expenses
            </Text>
            <View 
              style={[
                styles.barBackground, 
                { 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  width: barWidth,
                  height: barHeight,
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginBottom: spacing.s
                }
              ]}
            >
              <Animated.View 
                style={[
                  styles.barFill, 
                  { 
                    backgroundColor: expenseColor,
                    width: barWidth,
                    position: 'absolute',
                    bottom: 0,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    height: barAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, (totalExpenses / highestBar) * barHeight]
                    })
                  }
                ]} 
              />
            </View>
            <Text 
              style={[
                styles.barAmount, 
                { 
                  color: safeExpenseColor,
                  fontSize: fontSizes.xs,
                  fontWeight: '500'
                }
              ]}
              maxFontSizeMultiplier={1.8}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatCurrency(totalExpenses)}
            </Text>
          </View>
        </View>
      </View>
      
      <View 
        style={[
          styles.barChartLegend,
          {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: spacing.l,
            paddingTop: spacing.m,
            paddingHorizontal: spacing.m
          }
        ]}
      >
        <View 
          style={[
            styles.legendItem,
            {
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: spacing.m,
              paddingHorizontal: spacing.m
            }
          ]}
          accessible={true}
          accessibilityLabel="Income indicator"
          accessibilityRole="text"
        >
          <View 
            style={[
              styles.legendIndicator, 
              { 
                backgroundColor: incomeColor,
                width: scaleWidth(12),
                height: scaleWidth(12),
                borderRadius: scaleWidth(6),
                marginRight: spacing.s
              }
            ]} 
          />
          <Text 
            style={[
              styles.legendText, 
              { 
                color: theme.text,
                fontSize: fontSizes.m,
                fontWeight: '600'
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            Income
          </Text>
        </View>
        <View 
          style={[
            styles.legendItem,
            {
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: spacing.m,
              paddingHorizontal: spacing.m
            }
          ]}
          accessible={true}
          accessibilityLabel="Expenses indicator"
          accessibilityRole="text"
        >
          <View 
            style={[
              styles.legendIndicator, 
              { 
                backgroundColor: expenseColor,
                width: scaleWidth(12),
                height: scaleWidth(12),
                borderRadius: scaleWidth(6),
                marginRight: spacing.s
              }
            ]} 
          />
          <Text 
            style={[
              styles.legendText, 
              { 
                color: theme.text,
                fontSize: fontSizes.m,
                fontWeight: '600'
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            Expenses
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BarChartCard;