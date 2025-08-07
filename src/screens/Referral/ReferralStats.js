// src/screens/Referral/ReferralStats.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import referralBackendService from '../../services/ReferralBackendService';

const ReferralStats = ({ data, theme }) => {
  const { stats, referrals } = data;
  const [discounts, setDiscounts] = useState([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      setLoadingDiscounts(true);
      const availableDiscounts = await referralBackendService.getEarnedDiscounts();
      setDiscounts(availableDiscounts);
    } catch (error) {
      console.error('Error loading discounts:', error);
      setDiscounts([]);
    } finally {
      setLoadingDiscounts(false);
    }
  };
  
  const renderReferralItem = (referral) => {
    return (
      <View 
        key={referral.id} 
        style={styles.referralItem}
      >
        <View style={styles.referralInfo}>
          <Text style={styles.referralEmail}>
            {referral.email || 'Pending'}
          </Text>
          <Text style={styles.referralDate}>
            {referral.date}
          </Text>
        </View>
        
        <View style={styles.referralStatus}>
          <View style={[
            styles.statusBadge, 
            { 
              backgroundColor: referral.status === 'subscribed' 
                ? '#4CAF50' 
                : '#FFA000'
            }
          ]}>
            <Text style={styles.statusText}>
              {referral.status === 'subscribed' ? 'Subscribed' : 'Registered'}
            </Text>
          </View>
          
          {referral.reward === 'credited' && (
            <View style={styles.rewardBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              <Text style={styles.rewardText}>
                50% Off Applied
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };
  
  const renderEmptyState = () => {
    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons name="people-outline" size={40} color="#9E9E9E" />
        <Text style={styles.emptyStateText}>
          No referrals yet. Start sharing to earn rewards!
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>
          Referral Stats
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.sent}</Text>
            <Text style={styles.statLabel}>Invites Sent</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.clicked}</Text>
            <Text style={styles.statLabel}>Clicks</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.converted}</Text>
            <Text style={styles.statLabel}>Converted</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.plansEarned || 0}</Text>
            <Text style={styles.statLabel}>AI Plans Earned</Text>
            <Text style={styles.statSubLabel}>50% off</Text>
          </View>
        </View>
      </View>
      
      {/* Available Discounts Section */}
      <View style={styles.discountsSection}>
        <View style={styles.discountHeader}>
          <Ionicons name="ticket" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>
            Your 50% Off Discounts
          </Text>
        </View>
        
        {loadingDiscounts ? (
          <View style={styles.discountLoading}>
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading discounts...</Text>
          </View>
        ) : discounts.length > 0 ? (
          <View style={styles.discountContainer}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountCount}>{discounts.length}</Text>
              <Text style={styles.discountLabel}>Available</Text>
            </View>
            <View style={styles.discountInfo}>
              <Text style={styles.discountDescription}>
                You have {discounts.length} discount{discounts.length !== 1 ? 's' : ''} ready to use!
              </Text>
              <Text style={styles.discountSubtext}>
                50% off your next AI monthly plan{discounts.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.discountEmpty}>
            <Ionicons name="ticket-outline" size={32} color="#666" />
            <Text style={styles.discountEmptyText}>
              No discounts available yet
            </Text>
            <Text style={styles.discountEmptySubtext}>
              Share your referral code to earn 50% off discounts!
            </Text>
          </View>
        )}
      </View>
      
      {/* Referral History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>
          Your Referrals
        </Text>
        
        {referrals.length > 0 ? (
          <View style={styles.referralsList}>
            {referrals.map(referral => renderReferralItem(referral))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </View>
      
      {/* Bottom space */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  statsSection: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  statSubLabel: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 2,
  },
  historySection: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  referralsList: {
    marginTop: 8,
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  referralInfo: {
    flex: 1,
  },
  referralEmail: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  referralDate: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  referralStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#4CAF50',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    maxWidth: '80%',
    color: '#9E9E9E',
  },
  // Discount Section Styles
  discountsSection: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  discountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  discountLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: '#9E9E9E',
    fontSize: 14,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 8,
  },
  discountBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  discountCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  discountLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  discountInfo: {
    flex: 1,
  },
  discountDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  discountSubtext: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  discountEmpty: {
    alignItems: 'center',
    padding: 30,
  },
  discountEmptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9E9E9E',
    marginTop: 12,
    textAlign: 'center',
  },
  discountEmptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ReferralStats;