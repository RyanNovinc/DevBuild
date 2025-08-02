// src/screens/Referral/ReferralHistory.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReferralHistory = ({ loading, referrals, theme }) => {
  // Render a referral item
  const renderReferralItem = (referral) => {
    return (
      <View 
        key={referral.id} 
        style={[styles.referralItem, { borderBottomColor: theme.border }]}
      >
        <View style={styles.referralInfo}>
          <Text style={[styles.referralEmail, { color: theme.text }]}>
            {referral.email || 'Pending'}
          </Text>
          <Text style={[styles.referralDate, { color: theme.textSecondary }]}>
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
          
          <Text style={[styles.rewardText, { 
            color: referral.reward === 'credited' ? '#4CAF50' : theme.textSecondary 
          }]}>
            {referral.reward === 'credited' ? 'Reward credited' : 'Pending reward'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.historySection, { backgroundColor: theme.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Your Referrals
      </Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
      ) : referrals.length > 0 ? (
        <View style={styles.referralsList}>
          {referrals.map(referral => renderReferralItem(referral))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
            No referrals yet. Start sharing to earn rewards!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  historySection: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  referralsList: {
    marginTop: 8,
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  referralInfo: {
    flex: 1,
  },
  referralEmail: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  referralDate: {
    fontSize: 14,
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
  rewardText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  loader: {
    padding: 20,
  },
});

export default ReferralHistory;