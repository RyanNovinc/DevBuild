// src/screens/ProfileScreen/FinancialTracker/SummaryTab/components/FinancialSummaryCard.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
  meetsContrastRequirements,
  ensureAccessibleTouchTarget
} from '../../../../../utils/responsive';

const FinancialSummaryCard = ({ 
  theme, 
  totalIncome, 
  totalExpenses, 
  savingsPercentage, 
  formatCurrency,
  displayCurrency,
  onCurrencyPress
}) => {
  // Get landscape orientation
  const isLandscape = useIsLandscape();
  
  // Set simple color scheme
  const incomeColor = '#4CAF50';
  const expenseColor = '#F44336';
  const savingsColor = savingsPercentage >= 0 ? '#4CAF50' : '#F44336';
  
  const monthlySurplus = totalIncome - totalExpenses;

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
              alignItems: 'center',
              flex: 1
            }
          ]}
        >
          <Ionicons 
            name="pie-chart-outline" 
            size={scaleWidth(24)} 
            color={theme.primary || '#673AB7'} 
            style={{ marginRight: spacing.s }}
          />
          <Text 
            style={[
              styles.cardTitle, 
              { 
                color: theme.text,
                fontSize: isSmallDevice ? fontSizes.l : fontSizes.xl,
                fontWeight: 'bold'
              }
            ]}
            maxFontSizeMultiplier={1.3}
          >
            Monthly Overview
          </Text>
        </View>
        
        {/* Currency Selector */}
        {onCurrencyPress && (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.s,
              paddingVertical: spacing.xs,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: 'rgba(255,255,255,0.05)'
            }}
            onPress={onCurrencyPress}
          >
            <Text style={{
              fontSize: fontSizes.m,
              fontWeight: '600',
              color: theme.text,
              marginRight: 4
            }}>
              {displayCurrency}
            </Text>
            <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
        
      </View>
      
      <View style={styles.summaryContent}>
        {/* Income Row */}
        <View style={[styles.summaryRow, { marginBottom: spacing.s }]}>
          <View style={styles.summaryItemContainer}>
            <Ionicons name="trending-up" size={scaleWidth(20)} color={incomeColor} style={styles.summaryIcon} />
            <View style={styles.summaryContent}>
              <Text 
                style={[
                  styles.summaryLabel, 
                  { 
                    color: theme.textSecondary,
                    fontSize: isSmallDevice ? fontSizes.s : fontSizes.m
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Monthly Income
              </Text>
              <Text 
                style={[
                  styles.summaryValue, 
                  { 
                    color: incomeColor,
                    fontSize: isSmallDevice ? fontSizes.m : fontSizes.l,
                    fontWeight: '600'
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {formatCurrency(totalIncome)}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Expenses Row */}
        <View style={[styles.summaryRow, { marginBottom: spacing.s }]}>
          <View style={styles.summaryItemContainer}>
            <Ionicons name="trending-down" size={scaleWidth(20)} color={expenseColor} style={styles.summaryIcon} />
            <View style={styles.summaryContent}>
              <Text 
                style={[
                  styles.summaryLabel, 
                  { 
                    color: theme.textSecondary,
                    fontSize: isSmallDevice ? fontSizes.s : fontSizes.m
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Monthly Expenses
              </Text>
              <Text 
                style={[
                  styles.summaryValue, 
                  { 
                    color: expenseColor,
                    fontSize: isSmallDevice ? fontSizes.m : fontSizes.l,
                    fontWeight: '600'
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {formatCurrency(totalExpenses)}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Monthly Surplus/Deficit Row */}
        <View style={[styles.summaryRow, { marginBottom: spacing.s }]}>
          <View style={styles.summaryItemContainer}>
            <Ionicons 
              name={monthlySurplus >= 0 ? "wallet" : "warning"} 
              size={scaleWidth(20)} 
              color={monthlySurplus >= 0 ? '#4CAF50' : '#F44336'} 
              style={styles.summaryIcon} 
            />
            <View style={styles.summaryContent}>
              <Text 
                style={[
                  styles.summaryLabel, 
                  { 
                    color: theme.textSecondary,
                    fontSize: isSmallDevice ? fontSizes.s : fontSizes.m
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Monthly {monthlySurplus >= 0 ? 'Surplus' : 'Deficit'}
              </Text>
              <Text 
                style={[
                  styles.summaryValue, 
                  { 
                    color: monthlySurplus >= 0 ? '#4CAF50' : '#F44336',
                    fontSize: isSmallDevice ? fontSizes.m : fontSizes.l,
                    fontWeight: '600'
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {formatCurrency(Math.abs(monthlySurplus))}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Savings Rate Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItemContainer}>
            <Ionicons name="stats-chart" size={scaleWidth(20)} color={savingsColor} style={styles.summaryIcon} />
            <View style={styles.summaryContent}>
              <Text 
                style={[
                  styles.summaryLabel, 
                  { 
                    color: theme.textSecondary,
                    fontSize: isSmallDevice ? fontSizes.s : fontSizes.m
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Savings Rate
              </Text>
              <Text 
                style={[
                  styles.summaryValue, 
                  { 
                    color: savingsColor,
                    fontSize: isSmallDevice ? fontSizes.m : fontSizes.l,
                    fontWeight: '600'
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {savingsPercentage.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default FinancialSummaryCard;