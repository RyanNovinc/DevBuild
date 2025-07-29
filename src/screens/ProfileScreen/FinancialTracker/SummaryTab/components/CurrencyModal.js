// src/screens/ProfileScreen/FinancialTracker/SummaryTab/components/CurrencyModal.js
import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CurrencyService from '../../CurrencyService';
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

const CurrencyModal = ({ 
  visible, 
  onClose, 
  onSelect, 
  theme, 
  currentCurrency 
}) => {
  // Get screen dimensions and safe areas
  const dimensions = useScreenDimensions();
  const isLandscape = useIsLandscape();
  const safeSpacing = useSafeSpacing();
  
  // Calculate modal width based on device size and orientation
  const modalWidth = isTablet ? 
    (isLandscape ? '50%' : '70%') : 
    (isLandscape ? '70%' : '90%');
  
  // Currency options array with symbols, codes, and names
  // Australian Dollar moved to second position as requested
  const currencyOptions = [
    { symbol: '$', code: 'USD', name: 'US Dollar', isBase: true },
    { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
    { symbol: '€', code: 'EUR', name: 'Euro' },
    { symbol: '£', code: 'GBP', name: 'British Pound' },
    { symbol: '¥', code: 'JPY', name: 'Japanese Yen' },
    { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
    { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
    { symbol: '₽', code: 'RUB', name: 'Russian Ruble' },
    { symbol: '₣', code: 'CHF', name: 'Swiss Franc' },
    { symbol: '₩', code: 'KRW', name: 'South Korean Won' },
    { symbol: '₺', code: 'TRY', name: 'Turkish Lira' }
  ];
  
  // Ensure color has proper contrast
  const getPrimaryColor = (symbol) => {
    const color = currentCurrency === symbol ? theme.primary : theme.textSecondary;
    return meetsContrastRequirements(color, theme.card, false) ? color : theme.text;
  };

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
        accessibilityLabel="Currency selection modal"
      >
        <View 
          style={[
            styles.currencyModal, 
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
              Select Display Currency
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              style={ensureAccessibleTouchTarget({
                width: scaleWidth(44),
                height: scaleWidth(44)
              })}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close currency selection"
            >
              <Ionicons 
                name="close" 
                size={scaleFontSize(24)} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>
          </View>
          
          <View 
            style={[
              styles.currencyDescription,
              {
                marginBottom: spacing.m,
                paddingBottom: spacing.m,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.1)'
              }
            ]}
          >
            <Text 
              style={[
                styles.currencyDescriptionText, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.s,
                  lineHeight: scaleHeight(20)
                }
              ]}
              maxFontSizeMultiplier={1.8}
            >
              Choose the currency to display your financial data. All percentile comparisons are based on US population data.
            </Text>
          </View>
          
          <ScrollView 
            style={[
              styles.currencyList,
              {
                maxHeight: scaleHeight(350)
              }
            ]}
            showsVerticalScrollIndicator={true}
          >
            {currencyOptions.map((option) => {
              const isSelected = currentCurrency === option.symbol;
              const primaryColor = getPrimaryColor(option.symbol);
              
              return (
                <TouchableOpacity
                  key={option.symbol}
                  style={[
                    styles.currencyOption,
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: spacing.m,
                      paddingHorizontal: spacing.m,
                      borderRadius: scaleWidth(12),
                      marginBottom: spacing.s
                    },
                    isSelected && { 
                      backgroundColor: theme.primary + '20' 
                    }
                  ]}
                  onPress={() => onSelect(option.symbol)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`${option.name}, ${option.isBase ? 'base currency for percentiles' : ''} ${isSelected ? 'currently selected' : ''}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text 
                    style={[
                      styles.currencyOptionSymbol, 
                      { 
                        color: theme.text,
                        fontSize: fontSizes.l,
                        fontWeight: '600',
                        marginRight: spacing.m,
                        width: scaleWidth(30)
                      },
                      isSelected && { 
                        color: primaryColor, 
                        fontWeight: '700' 
                      }
                    ]}
                    maxFontSizeMultiplier={1.5}
                  >
                    {option.symbol}
                  </Text>
                  <View 
                    style={[
                      styles.currencyNameContainer,
                      {
                        flex: 1,
                        flexDirection: 'column'
                      }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.currencyOptionName, 
                        { 
                          color: theme.textSecondary,
                          fontSize: fontSizes.m
                        },
                        isSelected && { 
                          color: primaryColor 
                        }
                      ]}
                      maxFontSizeMultiplier={1.8}
                    >
                      {option.name}
                    </Text>
                    {option.isBase && (
                      <View 
                        style={[
                          styles.baseTagContainer, 
                          { 
                            backgroundColor: theme.primary + '20',
                            marginTop: spacing.xxs,
                            alignSelf: 'flex-start',
                            paddingHorizontal: spacing.s,
                            paddingVertical: spacing.xxxs,
                            borderRadius: scaleWidth(8)
                          }
                        ]}
                      >
                        <Text 
                          style={[
                            styles.baseTag, 
                            { 
                              color: theme.primary,
                              fontSize: fontSizes.xs,
                              fontWeight: '600'
                            }
                          ]}
                          maxFontSizeMultiplier={1.8}
                        >
                          Base for percentiles
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {isSelected && (
                    <Ionicons 
                      name="checkmark" 
                      size={scaleFontSize(20)} 
                      color={primaryColor} 
                      style={[
                        styles.selectedIcon,
                        {
                          marginLeft: spacing.s
                        }
                      ]} 
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          
          <View 
            style={[
              styles.currencyModalFooter,
              {
                marginTop: spacing.m,
                paddingTop: spacing.m,
                borderTopWidth: 1,
                borderTopColor: 'rgba(0,0,0,0.1)'
              }
            ]}
          >
            <Text 
              style={[
                styles.currencyModalFooterText, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.xs,
                  textAlign: 'center',
                  fontStyle: 'italic'
                }
              ]}
              maxFontSizeMultiplier={1.8}
            >
              Note: Exchange rates are updated regularly for accurate conversion.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CurrencyModal;