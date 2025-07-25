// src/screens/ProfileScreen/FinancialTracker/SummaryTab/components/AssetsLiabilitiesCard.js
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPercentileColor } from '../utils';
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
  meetsContrastRequirements
} from '../../../../../utils/responsive';

// Helper function to safely round numbers to avoid floating point precision issues
const safeRound = (num) => {
  if (typeof num !== 'number') return num;
  return Math.round(num * 100) / 100;
};

const AssetsLiabilitiesCard = ({ 
  theme, 
  totalSavings, 
  totalDebt,
  formatCurrency
}) => {
  // Get landscape orientation
  const isLandscape = useIsLandscape();
  
  // Calculate debt-to-assets ratio and percentile equivalent
  const debtRatio = totalSavings > 0 ? (totalDebt / Math.max(totalSavings, 1) * 100) : 100;
  const debtPercentile = 100 - Math.min(100, debtRatio);
  
  // Ensure colors have proper contrast
  const savingsColor = meetsContrastRequirements('#4CAF50', theme.card, false) ? 
    '#4CAF50' : theme.text;
    
  const debtColor = meetsContrastRequirements('#F44336', theme.card, false) ? 
    '#F44336' : theme.text;
    
  const netWorthColor = meetsContrastRequirements(
    (totalSavings - totalDebt) >= 0 ? '#4CAF50' : '#F44336', 
    theme.card,
    false
  ) ? ((totalSavings - totalDebt) >= 0 ? '#4CAF50' : '#F44336') : theme.text;
  
  const ratioColor = meetsContrastRequirements(
    getPercentileColor(debtPercentile),
    theme.card,
    false
  ) ? getPercentileColor(debtPercentile) : theme.text;
  
  // Create accessibility labels
  const savingsAccessibilityLabel = `Total savings: ${formatCurrency(totalSavings)}`;
  const debtAccessibilityLabel = `Total debt: ${formatCurrency(totalDebt)}`;
  const netWorthAccessibilityLabel = `Net worth: ${formatCurrency(totalSavings - totalDebt)}`;
  const ratioAccessibilityLabel = `Debt to assets ratio: ${Math.round(debtRatio)} percent`;

  return (
    <View 
      style={[
        styles.assetsCard, 
        { 
          backgroundColor: theme.card, 
          borderColor: theme.border,
          borderRadius: Math.round(scaleWidth(16)),
          padding: isSmallDevice ? Math.round(spacing.m) : Math.round(spacing.l),
          marginBottom: Math.round(spacing.m),
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
      accessibilityLabel="Assets and liabilities summary"
      accessibilityRole="summary"
    >
      <View 
        style={[
          styles.cardHeader,
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: Math.round(spacing.m)
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
            name="wallet-outline" 
            size={Math.round(scaleFontSize(24))} 
            color="#3F51B5" 
            style={[
              styles.cardIcon,
              {
                marginRight: Math.round(spacing.s)
              }
            ]} 
          />
          <Text 
            style={[
              styles.assetsTitle, 
              { 
                color: theme.text,
                fontSize: fontSizes.l,
                fontWeight: 'bold'
              }
            ]}
            maxFontSizeMultiplier={1.3}
          >
            Assets & Liabilities
          </Text>
        </View>
      </View>
      
      <View 
        style={[
          styles.assetsRow,
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: isSmallDevice ? 'wrap' : 'nowrap'
          }
        ]}
      >
        <View 
          style={[
            styles.assetColumn,
            {
              alignItems: 'center',
              flex: 1,
              marginBottom: isSmallDevice ? Math.round(spacing.m) : 0
            }
          ]}
          accessible={true}
          accessibilityLabel={savingsAccessibilityLabel}
          accessibilityRole="text"
        >
          <Text 
            style={[
              styles.assetLabel, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.xs,
                marginBottom: Math.round(spacing.xxs)
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            Total Savings
          </Text>
          <Text 
            style={[
              styles.assetValue, 
              { 
                color: savingsColor,
                fontSize: isSmallDevice ? fontSizes.m : fontSizes.l,
                fontWeight: '600'
              }
            ]}
            maxFontSizeMultiplier={1.5}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(totalSavings)}
          </Text>
        </View>
        
        <View 
          style={[
            styles.assetColumn,
            {
              alignItems: 'center',
              flex: 1,
              marginBottom: isSmallDevice ? Math.round(spacing.m) : 0
            }
          ]}
          accessible={true}
          accessibilityLabel={debtAccessibilityLabel}
          accessibilityRole="text"
        >
          <Text 
            style={[
              styles.assetLabel, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.xs,
                marginBottom: Math.round(spacing.xxs)
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            Total Debt
          </Text>
          <Text 
            style={[
              styles.assetValue, 
              { 
                color: debtColor,
                fontSize: isSmallDevice ? fontSizes.m : fontSizes.l,
                fontWeight: '600'
              }
            ]}
            maxFontSizeMultiplier={1.5}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(totalDebt)}
          </Text>
        </View>
        
        <View 
          style={[
            styles.assetColumn,
            {
              alignItems: 'center',
              flex: 1
            }
          ]}
          accessible={true}
          accessibilityLabel={netWorthAccessibilityLabel}
          accessibilityRole="text"
        >
          <Text 
            style={[
              styles.assetLabel, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.xs,
                marginBottom: Math.round(spacing.xxs)
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            Net Worth
          </Text>
          <Text 
            style={[
              styles.assetValue, 
              { 
                color: netWorthColor,
                fontSize: isSmallDevice ? fontSizes.m : fontSizes.l,
                fontWeight: '600'
              }
            ]}
            maxFontSizeMultiplier={1.5}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(totalSavings - totalDebt)}
          </Text>
        </View>
      </View>
      
      {/* Net Worth Rating */}
      {totalSavings > 0 && (
        <View 
          style={[
            styles.netWorthRating,
            {
              marginTop: Math.round(spacing.l),
              paddingTop: Math.round(spacing.m),
              borderTopWidth: 1,
              borderTopColor: 'rgba(0, 0, 0, 0.05)'
            }
          ]}
          accessible={true}
          accessibilityLabel={ratioAccessibilityLabel}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: 100,
            now: Math.round(debtRatio)
          }}
        >
          <Text 
            style={[
              styles.netWorthLabel, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.s,
                marginBottom: Math.round(spacing.s)
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            Debt-to-Assets Ratio:
          </Text>
          <View 
            style={[
              styles.netWorthProgressContainer,
              {
                height: Math.round(scaleHeight(8)),
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: 4,
                marginBottom: Math.round(spacing.xxs),
                overflow: 'hidden'
              }
            ]}
            importantForAccessibility="no"
          >
            <View 
              style={[
                styles.netWorthProgress, 
                { 
                  width: `${Math.round(Math.min(100, debtRatio))}%`,
                  backgroundColor: ratioColor,
                  height: '100%',
                  borderRadius: 4
                }
              ]} 
              importantForAccessibility="no"
            />
          </View>
          <Text 
            style={[
              styles.netWorthRatio, 
              { 
                color: ratioColor,
                fontSize: fontSizes.s,
                fontWeight: '600',
                textAlign: 'right'
              }
            ]}
            maxFontSizeMultiplier={1.8}
          >
            {Math.round(debtRatio)}%
          </Text>
        </View>
      )}
    </View>
  );
};

export default AssetsLiabilitiesCard;