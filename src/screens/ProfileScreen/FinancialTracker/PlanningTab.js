// src/screens/ProfileScreen/FinancialTracker/PlanningTab.js
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import existing components
import AssetsTab from './AssetsTab';
import DebtTabRevamped from './DebtTabRevamped';

const { width } = Dimensions.get('window');

const PlanningTab = ({ theme, data, handlers, onShowAllocation }) => {
  const [activeSection, setActiveSection] = useState('assets');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  
  const { 
    financialData, 
    formatCurrency, 
    totalIncome, 
    totalExpenses, 
    savingsPercentage,
    totalDebt 
  } = data;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const changeSection = (section) => {
    if (section === activeSection) return; // Prevent unnecessary changes
    
    const sectionIndex = ['assets', 'debt'].indexOf(section);
    
    // Update state immediately for faster response
    setActiveSection(section);
    
    // Animate indicator
    Animated.spring(translateX, {
      toValue: sectionIndex * ((width - 72) / 2) + 4,
      tension: 100,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const calculateProjections = () => {
    const monthlySavings = (totalIncome || 0) - (totalExpenses || 0);
    const yearlyProjection = monthlySavings * 12;
    const fiveYearProjection = yearlyProjection * 5;
    
    return {
      monthly: monthlySavings,
      yearly: yearlyProjection,
      fiveYear: fiveYearProjection,
      debtFreeDate: calculateDebtFreeDate(),
    };
  };

  const calculateDebtFreeDate = () => {
    if (!totalDebt || totalDebt === 0) return 'Debt Free';
    
    const monthlyPayment = (totalIncome || 0) * 0.2;
    if (monthlyPayment <= 0) return 'N/A';
    
    const monthsToPayoff = Math.ceil(totalDebt / monthlyPayment);
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + monthsToPayoff);
    
    return payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const projections = calculateProjections();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#000000']}
        style={styles.gradientBackground}
      />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >

        {/* Elegant Section Selector */}
        <View style={styles.viewSelector}>
          <View style={styles.selectorContainer}>
            <Animated.View
              style={[
                styles.selectorIndicator,
                {
                  transform: [{ translateX }],
                },
              ]}
            />
            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => changeSection('assets')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.selectorText,
                activeSection === 'assets' && styles.selectorTextActive
              ]}>
                Assets
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectorButton}
              onPress={() => changeSection('debt')}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.selectorText,
                activeSection === 'debt' && styles.selectorTextActive
              ]}>
                Debt
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          {/* Assets Tab - Always rendered but conditionally displayed */}
          <View style={[
            styles.assetsScrollContainer,
            { display: activeSection === 'assets' ? 'flex' : 'none' }
          ]}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.assetsContainer}>
                <AssetsTab theme={theme} data={data} handlers={handlers} onShowAllocation={onShowAllocation} />
              </View>
            </ScrollView>
          </View>

          {/* Debt Tab - Always rendered but conditionally displayed */}
          <View style={[
            styles.debtContainer, 
            { display: activeSection === 'debt' ? 'flex' : 'none' }
          ]}>
            <DebtTabRevamped theme={theme} data={data} handlers={handlers} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 250,
  },
  content: {
    flex: 1,
  },
  
  // Section Selector
  viewSelector: {
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    borderRadius: 14,
    padding: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  selectorIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: (width - 72) / 2,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  selectorButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    zIndex: 1,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    letterSpacing: 0.1,
  },
  selectorTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Content
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  debtContainer: {
    flex: 1,
  },
  assetsScrollContainer: {
    flex: 1,
  },
  assetsContainer: {
    paddingTop: 8,
  },
});

export default PlanningTab;