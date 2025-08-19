// src/screens/ProfileScreen/FinancialTracker/SummaryTab/index.js
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import styles from './styles';
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
  useSafeSpacing
} from '../../../../utils/responsive';

// Import components
import FinancialSummaryCard from './components/FinancialSummaryCard';
import BarChartCard from './components/BarChartCard';
import EditableAssetsLiabilitiesCard from './components/EditableAssetsLiabilitiesCard';
import CurrencyModal from './components/CurrencyModal';

const SummaryTab = ({ theme, data, handlers }) => {
  // Get screen dimensions and orientation
  const dimensions = useScreenDimensions();
  const isLandscape = useIsLandscape();
  const safeSpacing = useSafeSpacing();
  
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [localCurrency, setLocalCurrency] = useState('$');
  
  
  const { 
    financialData,
    totalIncome, 
    totalExpenses, 
    totalSavings, 
    totalDebt,
    savingsPercentage, 
    highestBar,
    barAnim,
    isDarkMode,
    formatCurrency,
    currency, // From parent component
  } = data;
  
  const {
    setCurrency // From parent component
  } = handlers || {};
  
  // Use currency from props if available, otherwise use local state
  const displayCurrency = financialData?.currency || currency || localCurrency;
  
  // Custom format currency function if we're using local currency
  const formatWithCurrency = (amount) => {
    if (formatCurrency) {
      return formatCurrency(amount);
    }
    return `${displayCurrency}${amount.toLocaleString()}`;
  };
  
  // Handle currency selection
  const handleCurrencySelect = (selectedCurrency) => {
    // Try to use parent handler if available
    if (setCurrency) {
      setCurrency(selectedCurrency);
    } else {
      // Otherwise use local state as fallback
      setLocalCurrency(selectedCurrency);
    }
    
    // Close the modal
    setShowCurrencyModal(false);
  };
  

  // Create common props for all cards
  const cardProps = {
    theme,
    formatCurrency: formatWithCurrency,
    displayCurrency,
    isDarkMode
  };

  // Create specific props for financial summary card
  const summaryCardProps = {
    ...cardProps,
    totalIncome,
    totalExpenses,
    savingsPercentage,
    onCurrencyPress: () => setShowCurrencyModal(true)
  };

  // Create specific props for bar chart card
  const barChartCardProps = {
    ...cardProps,
    totalIncome,
    totalExpenses,
    highestBar,
    barAnim
  };

  // Create specific props for editable assets liabilities card
  const assetsCardProps = {
    theme,
    data,
    handlers
  };

  // Determine content layout based on device orientation and size
  const renderContent = () => {
    // For tablets in landscape, use a 2-column layout
    if (isTablet && isLandscape) {
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <FinancialSummaryCard {...summaryCardProps} />
          </View>
          <View style={{ width: '48%' }}>
            <BarChartCard {...barChartCardProps} />
          </View>
          <View style={{ width: '100%' }}>
            <EditableAssetsLiabilitiesCard {...assetsCardProps} />
          </View>
        </View>
      );
    }
    
    // For phones in landscape with enough width, use a 2-column layout
    else if (isLandscape && dimensions.width >= 680) {
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <View style={{ width: '48%' }}>
            <FinancialSummaryCard {...summaryCardProps} />
          </View>
          <View style={{ width: '48%' }}>
            <BarChartCard {...barChartCardProps} />
          </View>
          <View style={{ width: '100%' }}>
            <EditableAssetsLiabilitiesCard {...assetsCardProps} />
          </View>
        </View>
      );
    }
    
    // For portrait or smaller landscape screens, use vertical layout
    else {
      return (
        <>
          <FinancialSummaryCard {...summaryCardProps} />
          <BarChartCard {...barChartCardProps} />
          <EditableAssetsLiabilitiesCard {...assetsCardProps} />
        </>
      );
    }
  };

  return (
    <ScrollView 
      style={[
        styles.tabContentContainer, 
        { 
          padding: isSmallDevice ? spacing.s : spacing.m,
          paddingTop: 4
        }
      ]}
      contentContainerStyle={{
        paddingBottom: safeSpacing.bottom + spacing.l
      }}
      accessible={true}
      accessibilityLabel="Financial summary tab"
      accessibilityRole="scrollView"
    >
      {renderContent()}
      
      {/* Currency Selection Modal */}
      <CurrencyModal 
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        onSelect={handleCurrencySelect}
        theme={theme}
        currentCurrency={displayCurrency}
      />
      
    </ScrollView>
  );
};

export default SummaryTab;