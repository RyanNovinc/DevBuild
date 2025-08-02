// src/screens/PricingScreen/components/BillingSelector.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles';

const BillingSelector = ({ theme, selectedSubscription, setSelectedSubscription }) => {
  return (
    <View style={styles.billingCycleContainer}>
      <Text style={[styles.billingCycleLabel, { color: theme.text }]}>
        Billing Cycle
      </Text>
      <View style={styles.billingToggleContainer}>
        <TouchableOpacity
          style={[
            styles.billingToggleButton,
            selectedSubscription === 'monthly' && styles.billingToggleActive,
            selectedSubscription === 'monthly' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setSelectedSubscription('monthly')}
        >
          <Text style={[
            styles.billingToggleText,
            { color: selectedSubscription === 'monthly' ? '#FFFFFF' : theme.text }
          ]}>
            Monthly
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.billingToggleButton,
            selectedSubscription === 'annual' && styles.billingToggleActive,
            selectedSubscription === 'annual' && { backgroundColor: theme.primary }
          ]}
          onPress={() => setSelectedSubscription('annual')}
        >
          <Text style={[
            styles.billingToggleText,
            { color: selectedSubscription === 'annual' ? '#FFFFFF' : theme.text }
          ]}>
            Annual (Save 20%)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BillingSelector;