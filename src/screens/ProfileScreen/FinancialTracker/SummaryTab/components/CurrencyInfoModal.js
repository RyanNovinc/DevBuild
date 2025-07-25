// src/screens/ProfileScreen/FinancialTracker/SummaryTab/components/CurrencyInfoModal.js
import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
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
  useScreenDimensions,
  useIsLandscape,
  useSafeSpacing,
  ensureAccessibleTouchTarget
} from '../../../../../utils/responsive';

const CurrencyInfoModal = ({ 
  visible, 
  onClose, 
  theme,
  lastUpdated
}) => {
  // Get screen dimensions and safe areas
  const dimensions = useScreenDimensions();
  const isLandscape = useIsLandscape();
  const safeSpacing = useSafeSpacing();
  
  // Calculate modal width based on device size and orientation
  const modalWidth = isTablet ? 
    (isLandscape ? '50%' : '70%') : 
    (isLandscape ? '70%' : '90%');

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
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.l
          }
        ]}
        accessible={true}
        accessibilityViewIsModal={true}
        accessibilityLabel="Currency and percentiles information"
      >
        <View 
          style={[
            styles.currencyInfoModal, 
            { 
              backgroundColor: theme.card,
              width: modalWidth,
              borderRadius: scaleWidth(16),
              padding: spacing.l,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 5,
              maxHeight: '80%'
            }
          ]}
        >
          <View 
            style={[
              styles.currencyModalHeader,
              {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.l
              }
            ]}
          >
            <Text 
              style={[
                styles.currencyModalTitle, 
                { 
                  color: theme.text,
                  fontSize: fontSizes.l,
                  fontWeight: 'bold'
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              About Currency & Percentiles
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              style={ensureAccessibleTouchTarget({
                width: scaleWidth(44),
                height: scaleWidth(44)
              })}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close information modal"
            >
              <Ionicons 
                name="close" 
                size={scaleFontSize(24)} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={[
              styles.currencyInfoContent,
              {
                maxHeight: scaleHeight(400)
              }
            ]}
            contentContainerStyle={{
              paddingBottom: spacing.l
            }}
          >
            <View 
              style={[
                styles.currencyInfoSection,
                {
                  marginBottom: spacing.l
                }
              ]}
            >
              <Text 
                style={[
                  styles.currencyInfoHeading, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.m,
                    fontWeight: '600',
                    marginBottom: spacing.s
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Currency Display
              </Text>
              <Text 
                style={[
                  styles.currencyInfoText, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.s,
                    lineHeight: scaleHeight(20)
                  }
                ]}
                maxFontSizeMultiplier={1.8}
              >
                You can display your financial data in any currency. The app will convert all values using current exchange rates.
              </Text>
            </View>
            
            <View 
              style={[
                styles.currencyInfoSection,
                {
                  marginBottom: spacing.l
                }
              ]}
            >
              <Text 
                style={[
                  styles.currencyInfoHeading, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.m,
                    fontWeight: '600',
                    marginBottom: spacing.s
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Percentile Rankings
              </Text>
              <Text 
                style={[
                  styles.currencyInfoText, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.s,
                    lineHeight: scaleHeight(20)
                  }
                ]}
                maxFontSizeMultiplier={1.8}
              >
                All percentile comparisons are based on US population data, even when displayed in other currencies. This provides a consistent benchmark regardless of your selected currency.
              </Text>
            </View>
            
            <View 
              style={[
                styles.currencyInfoSection,
                {
                  marginBottom: spacing.l
                }
              ]}
            >
              <Text 
                style={[
                  styles.currencyInfoHeading, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.m,
                    fontWeight: '600',
                    marginBottom: spacing.s
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Currency Conversion
              </Text>
              <Text 
                style={[
                  styles.currencyInfoText, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.s,
                    lineHeight: scaleHeight(20)
                  }
                ]}
                maxFontSizeMultiplier={1.8}
              >
                Exchange rates are updated regularly. All conversions use the US Dollar (USD) as the base currency.
                {lastUpdated && (
                  <Text 
                    style={[
                      styles.exchangeRateUpdate, 
                      { 
                        color: theme.textSecondary,
                        fontSize: fontSizes.xs,
                        fontStyle: 'italic'
                      }
                    ]}
                    maxFontSizeMultiplier={1.8}
                  >
                    {"\n\n"}Last exchange rate update: {lastUpdated}
                  </Text>
                )}
              </Text>
            </View>
            
            <View 
              style={[
                styles.currencyInfoExample,
                {
                  marginVertical: spacing.m,
                  padding: spacing.m,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: scaleWidth(12)
                }
              ]}
            >
              <Text 
                style={[
                  styles.currencyInfoExampleText, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.s,
                    lineHeight: scaleHeight(20),
                    fontStyle: 'italic'
                  }
                ]}
                maxFontSizeMultiplier={1.8}
              >
                Example: If you earn €3,000 monthly, the app will convert this to USD for percentile comparison, then display your ranking based on where this amount would place you in the US income distribution.
              </Text>
            </View>
            
            <View 
              style={[
                styles.currencyInfoSection,
                {
                  marginBottom: spacing.l
                }
              ]}
            >
              <Text 
                style={[
                  styles.currencyInfoHeading, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.m,
                    fontWeight: '600',
                    marginBottom: spacing.s
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Important Note
              </Text>
              <Text 
                style={[
                  styles.currencyInfoText, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.s,
                    lineHeight: scaleHeight(20)
                  }
                ]}
                maxFontSizeMultiplier={1.8}
              >
                The percentile rankings may not accurately reflect your financial standing in your local economy due to differences in cost of living, tax systems, and other economic factors. For the most accurate financial assessment, consider consulting with a financial advisor familiar with your local economy.
              </Text>
            </View>
          </ScrollView>
          
          <TouchableOpacity
            style={[
              styles.currencyInfoCloseButton, 
              { 
                backgroundColor: theme.primary,
                paddingVertical: spacing.m,
                borderRadius: scaleWidth(12),
                alignItems: 'center',
                marginTop: spacing.m
              }
            ]}
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close information modal"
          >
            <Text 
              style={[
                styles.currencyInfoCloseButtonText,
                {
                  color: '#FFFFFF',
                  fontSize: fontSizes.m,
                  fontWeight: '600'
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Got it
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CurrencyInfoModal;