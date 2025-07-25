// src/screens/ProfileScreen/FinancialTracker/SummaryTab/components/FinancialSummaryCard.js
import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPercentileColor } from '../utils';
import PercentileBadge from './PercentileBadge';
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
  meetsContrastRequirements,
  ensureAccessibleTouchTarget
} from '../../../../../utils/responsive';

const FinancialSummaryCard = ({ 
  theme, 
  totalIncome, 
  totalExpenses, 
  savingsPercentage, 
  incomePercentile,
  expensePercentile,
  savingsPercentile,
  formatCurrency,
  onCurrencyPress,
  onDetailPress,
  displayCurrency
}) => {
  // Get landscape orientation
  const isLandscape = useIsLandscape();
  
  // Ensure colors have proper contrast
  const incomeColor = meetsContrastRequirements(
    getPercentileColor(incomePercentile), 
    theme.card, 
    false
  ) ? getPercentileColor(incomePercentile) : theme.text;
  
  const expenseColor = meetsContrastRequirements(
    getPercentileColor(expensePercentile), 
    theme.card, 
    false
  ) ? getPercentileColor(expensePercentile) : theme.text;
  
  const savingsColor = meetsContrastRequirements(
    getPercentileColor(savingsPercentile), 
    theme.card, 
    false
  ) ? getPercentileColor(savingsPercentile) : theme.text;
  
  const surplusColor = meetsContrastRequirements(
    (totalIncome - totalExpenses) >= 0 ? '#4CAF50' : '#F44336',
    theme.card,
    false
  ) ? ((totalIncome - totalExpenses) >= 0 ? '#4CAF50' : '#F44336') : theme.text;

  return (
    <View 
      style={[
        styles.summaryCard, 
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
      accessibilityLabel="Financial summary card showing income, expenses, and savings rate"
      accessibilityRole="summary"
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
            name="stats-chart-outline" 
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
              styles.summaryTitle, 
              { 
                color: theme.text,
                fontSize: fontSizes.l,
                fontWeight: 'bold'
              }
            ]}
            maxFontSizeMultiplier={1.3}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Financial Summary
          </Text>
        </View>
        
        {/* Currency button removed */}
      </View>
      
      {/* US-based indicator */}
      <View 
        style={[
          styles.usBasedIndicator, 
          { 
            backgroundColor: theme.primary + '10', 
            marginBottom: spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: spacing.s,
            paddingVertical: spacing.xxs,
            borderRadius: scaleWidth(12),
            alignSelf: 'flex-start'
          }
        ]}
        accessible={true}
        accessibilityLabel="Percentiles are based on US population data"
        accessibilityRole="text"
      >
        <Ionicons 
          name="information-circle-outline" 
          size={scaleFontSize(16)} 
          color={theme.primary} 
        />
        <Text 
          style={[
            styles.usBasedIndicatorText, 
            { 
              color: theme.primary,
              fontSize: fontSizes.xs,
              marginLeft: spacing.xxs
            }
          ]}
          maxFontSizeMultiplier={1.8}
        >
          Percentiles based on US population data
        </Text>
      </View>
      
      {/* Income with Percentile */}
      <View 
        style={[
          styles.percentileRow,
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
            styles.percentileInfo,
            {
              flex: 1
            }
          ]}
          accessible={true}
          accessibilityLabel={`Monthly income: ${formatCurrency(totalIncome)}`}
          accessibilityRole="text"
        >
          <Text 
            style={[
              styles.percentileLabel, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.xs,
                marginBottom: spacing.xxs
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            Monthly Income
          </Text>
          <Animated.Text 
            style={[
              styles.percentileValue, 
              { 
                color: incomeColor,
                fontSize: fontSizes.l,
                fontWeight: '600'
              }
            ]}
            maxFontSizeMultiplier={1.5}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(totalIncome)}
          </Animated.Text>
        </View>
        <PercentileBadge 
          percentile={incomePercentile} 
          type="income"
          value={totalIncome}
          onPress={() => onDetailPress('income', totalIncome, incomePercentile)}
          theme={theme}
        />
      </View>
      
      {/* Expenses with Percentile */}
      <View 
        style={[
          styles.percentileRow,
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
            styles.percentileInfo,
            {
              flex: 1
            }
          ]}
          accessible={true}
          accessibilityLabel={`Monthly expenses: ${formatCurrency(totalExpenses)}`}
          accessibilityRole="text"
        >
          <Text 
            style={[
              styles.percentileLabel, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.xs,
                marginBottom: spacing.xxs
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            Monthly Expenses
          </Text>
          <Animated.Text 
            style={[
              styles.percentileValue, 
              { 
                color: expenseColor,
                fontSize: fontSizes.l,
                fontWeight: '600'
              }
            ]}
            maxFontSizeMultiplier={1.5}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(totalExpenses)}
          </Animated.Text>
        </View>
        <PercentileBadge 
          percentile={expensePercentile} 
          type="expense"
          value={totalExpenses}
          onPress={() => onDetailPress('expense', totalExpenses, expensePercentile)}
          theme={theme}
        />
      </View>
      
      {/* Savings Rate with Percentile */}
      <View 
        style={[
          styles.percentileRow,
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
            styles.percentileInfo,
            {
              flex: 1
            }
          ]}
          accessible={true}
          accessibilityLabel={`Monthly savings rate: ${savingsPercentage.toFixed(1)} percent`}
          accessibilityRole="text"
        >
          <Text 
            style={[
              styles.percentileLabel, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.xs,
                marginBottom: spacing.xxs
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            Monthly Savings Rate
          </Text>
          <Animated.Text 
            style={[
              styles.percentileValue, 
              { 
                color: savingsColor,
                fontSize: fontSizes.l,
                fontWeight: '600'
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            {savingsPercentage.toFixed(1)}%
          </Animated.Text>
        </View>
        <PercentileBadge 
          percentile={savingsPercentile} 
          type="savings"
          value={savingsPercentage}
          onPress={() => onDetailPress('savings', savingsPercentage, savingsPercentile)}
          theme={theme}
        />
      </View>
      
      {/* Monthly Surplus/Deficit */}
      <View 
        style={[
          styles.surplusRow, 
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: spacing.s,
            paddingTop: spacing.m,
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 0, 0, 0.05)'
          }
        ]}
        accessible={true}
        accessibilityLabel={`Monthly surplus: ${formatCurrency(totalIncome - totalExpenses)}`}
        accessibilityRole="text"
      >
        <Text 
          style={[
            styles.surplusLabel, 
            { 
              color: theme.text, 
              fontWeight: '600',
              fontSize: fontSizes.m
            }
          ]}
          maxFontSizeMultiplier={1.5}
        >
          Monthly Surplus:
        </Text>
        <Text 
          style={[
            styles.surplusValue, 
            { 
              color: surplusColor,
              fontWeight: '600',
              fontSize: fontSizes.l
            }
          ]}
          maxFontSizeMultiplier={1.5}
        >
          {formatCurrency(totalIncome - totalExpenses)}
        </Text>
      </View>
    </View>
  );
};

export default FinancialSummaryCard;