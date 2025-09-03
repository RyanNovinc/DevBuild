// src/screens/ProfileScreen/FinancialTracker/CompactView.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CompactView = ({ theme, data, openDetailModal, widgetName }) => {
  const { 
    totalIncome, 
    totalExpenses,
    formatCurrency,
    financialData
  } = data;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculate key metrics
  const netCashFlow = totalIncome - totalExpenses;
  const isPositive = netCashFlow >= 0;
  const savingsRate = totalIncome > 0 ? ((netCashFlow / totalIncome) * 100) : 0;
  
  // Calculate total debt if exists
  const totalDebt = financialData?.debts?.reduce((sum, debt) => sum + (debt.amount || 0), 0) || 0;
  
  // Get this month's name
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'short' });

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }]
    }}>
      <TouchableOpacity 
        style={[styles.compactCard, { 
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border 
        }]}
        onPress={openDetailModal}
        activeOpacity={0.8}
      >
        {/* Header with gradient accent */}
        <View style={styles.header}>
          <LinearGradient
            colors={isPositive ? ['rgba(16, 185, 129, 0.1)', 'transparent'] : ['rgba(239, 68, 68, 0.1)', 'transparent']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          
          <View style={styles.titleRow}>
            <View style={styles.titleContainer}>
              <View style={[styles.iconBadge, { backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons 
                  name={isPositive ? "trending-up" : "trending-down"} 
                  size={16} 
                  color={isPositive ? '#10b981' : '#ef4444'} 
                />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>
                {widgetName || 'Finances'}
              </Text>
              <View style={styles.monthBadge}>
                <Text style={styles.monthText}>{currentMonthName}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </View>
        </View>

        {/* Main Metric - Net Cash Flow */}
        <View style={styles.mainMetric}>
          <Text style={[styles.mainLabel, { color: theme.textSecondary }]}>
            Net Cash Flow
          </Text>
          <View style={styles.mainValueRow}>
            <Text style={[styles.mainValue, { color: isPositive ? '#10b981' : '#ef4444' }]}>
              {isPositive ? '+' : ''}{formatCurrency(netCashFlow)}
            </Text>
            {savingsRate !== 0 && (
              <View style={[styles.percentBadge, { backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                <Text style={[styles.percentText, { color: isPositive ? '#10b981' : '#ef4444' }]}>
                  {savingsRate.toFixed(0)}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          {/* Income */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <View style={[styles.statDot, { backgroundColor: '#10b981' }]} />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Income
              </Text>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Expenses */}
          <View style={styles.statItem}>
            <View style={styles.statHeader}>
              <View style={[styles.statDot, { backgroundColor: '#ef4444' }]} />
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Expenses
              </Text>
            </View>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatCurrency(totalExpenses)}
            </Text>
          </View>

          {/* Divider */}
          {totalDebt > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}

          {/* Debt (if exists) */}
          {totalDebt > 0 && (
            <View style={styles.statItem}>
              <View style={styles.statHeader}>
                <View style={[styles.statDot, { backgroundColor: '#fb923c' }]} />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Debt
                </Text>
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {formatCurrency(totalDebt)}
              </Text>
            </View>
          )}
        </View>

        {/* Visual Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {totalIncome > 0 && (
              <View style={styles.progressBarInner}>
                {/* Green bar (Income) on the left */}
                <View 
                  style={[
                    styles.progressSegment, 
                    { 
                      backgroundColor: '#10b981',
                      flex: totalIncome / (totalIncome + totalExpenses || 1)
                    }
                  ]} 
                />
                {/* Red bar (Expenses) on the right */}
                <View 
                  style={[
                    styles.progressSegment, 
                    { 
                      backgroundColor: '#ef4444',
                      flex: totalExpenses / (totalIncome + totalExpenses || 1)
                    }
                  ]} 
                />
              </View>
            )}
          </View>
          <View style={styles.progressLabels}>
            <Text style={[styles.progressLabel, { color: '#10b981' }]}>
              Income: {totalIncome > 0 ? Math.round((totalIncome / (totalIncome + totalExpenses)) * 100) : 0}%
            </Text>
            <Text style={[styles.progressLabel, { color: '#ef4444' }]}>
              Expenses: {totalExpenses > 0 ? Math.round((totalExpenses / (totalIncome + totalExpenses)) * 100) : 0}%
            </Text>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaContainer}>
          <Text style={[styles.ctaText, { color: theme.textSecondary }]}>
            Tap to view details & manage budget
          </Text>
          <Ionicons name="arrow-forward-circle" size={16} color={theme.primary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  compactCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  monthBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  monthText: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
  },
  mainMetric: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mainLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  mainValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mainValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  percentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 30,
    marginHorizontal: 12,
    opacity: 0.3,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarInner: {
    flexDirection: 'row',
    height: '100%',
    width: '100%',
  },
  progressSegment: {
    height: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default CompactView;