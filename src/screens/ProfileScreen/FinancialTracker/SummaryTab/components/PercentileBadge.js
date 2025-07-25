// src/screens/ProfileScreen/FinancialTracker/SummaryTab/components/PercentileBadge.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
  ensureAccessibleTouchTarget,
  meetsContrastRequirements
} from '../../../../../utils/responsive';

const PercentileBadge = ({ percentile, type, value, onPress, theme }) => {
  const rating = getPercentileRating(percentile);
  const rawColor = getPercentileColor(percentile);
  
  // Ensure color has proper contrast with background
  const color = theme && meetsContrastRequirements(rawColor, theme.card, false) ? 
    rawColor : (theme ? theme.text : rawColor);
    
  const percentileLabel = getPercentileLabel(percentile);
  
  // Create accessibility label based on type and percentile
  const getAccessibilityLabel = () => {
    const typeText = type === 'income' ? 'income' : 
                     type === 'expense' ? 'expense' : 'savings rate';
    return `${typeText} percentile: ${percentile.toFixed(1)}%. ${percentileLabel}. Rated as ${rating}. Tap for details.`;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.percentileBadgeContainer,
        {
          minWidth: scaleWidth(isSmallDevice ? 180 : 200)
        },
        ensureAccessibleTouchTarget({
          width: scaleWidth(isSmallDevice ? 180 : 200),
          height: scaleWidth(44)
        })
      ]}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityHint="Opens detailed view of percentile information"
    >
      <View 
        style={[
          styles.percentileBadgeContent, 
          { 
            backgroundColor: color + '15',
            borderRadius: scaleWidth(12),
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.s,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }
        ]}
      >
        <View 
          style={[
            styles.percentileInfoRow,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }
          ]}
        >
          <Text 
            style={[
              styles.percentileText, 
              { 
                color: color,
                fontSize: isSmallDevice ? fontSizes.xs : fontSizes.s,
                fontWeight: '600'
              }
            ]}
            maxFontSizeMultiplier={1.5}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {percentileLabel}
          </Text>
          <Text 
            style={[
              styles.percentileRating, 
              { 
                color: color,
                fontSize: isSmallDevice ? fontSizes.xs : fontSizes.s,
                fontWeight: '600',
                marginLeft: spacing.xs
              }
            ]}
            maxFontSizeMultiplier={1.5}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            • {rating}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default PercentileBadge;