// src/screens/Referral/ReferralStats.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReferralStats = ({ data, theme }) => {
  const { stats, referrals } = data;
  
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
                Reward Applied
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
            <Text style={styles.statNumber}>{stats.earned}</Text>
            <Text style={styles.statLabel}>Credits Earned</Text>
          </View>
        </View>
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
});

export default ReferralStats;