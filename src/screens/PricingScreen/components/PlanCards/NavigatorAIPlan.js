// src/screens/PricingScreen/components/PlanCards/NavigatorAIPlan.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles';
import CapacityIndicator from './CapacityIndicator';

const NavigatorAIPlan = ({ 
  theme, 
  selectedPlan, 
  handleSelectPlan, 
  isLifetimeMember, 
  isFromReferral, 
  selectedSubscription, 
  handlePurchase 
}) => {
  // Regular price - updated to $4.99
  const regularMonthlyPrice = 4.99;
  
  // Helper function to get display price based on subscription
  const getDisplayPrice = () => {
    return selectedSubscription === 'monthly' ? regularMonthlyPrice.toFixed(2) : (regularMonthlyPrice * 0.8).toFixed(2);
  };

  // Helper function to get credits per dollar
  const getCreditsPerDollar = () => {
    const currentPrice = selectedSubscription === 'monthly' ? regularMonthlyPrice : (regularMonthlyPrice * 0.8);
    return Math.round(1500 / currentPrice);
  };

  // Helper function to get value description
  const getValueDescription = () => {
    return selectedSubscription === 'monthly' ? 'Better value' : 'Great value (annual)';
  };

  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        { 
          backgroundColor: selectedPlan === 'professional' ? '#3F51B5' : theme.card,
          borderColor: selectedPlan === 'professional' ? '#3F51B5' : theme.border,
          height: 480, // Keep height consistent
          transform: [{ scale: 1.05 }],
          zIndex: 2,
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        }
      ]}
      onPress={() => handleSelectPlan('professional')}
    >
      <View style={styles.mostPopularTagContainer}>
        <View style={styles.mostPopularTag}>
          <Text style={styles.mostPopularTagText}>MOST POPULAR</Text>
        </View>
      </View>
      
      <View style={styles.planHeader}>
        <Text style={[
          styles.planTitle, 
          { color: selectedPlan === 'professional' ? '#FFFFFF' : theme.text }
        ]}>
          AI Standard
        </Text>
      </View>
      
      {/* Simplified Price display */}
      <Text style={[
        styles.planPrice, 
        { color: selectedPlan === 'professional' ? '#FFFFFF' : theme.text }
      ]}>
        ${getDisplayPrice()}
      </Text>
      
      <Text style={[
        styles.planCurrency, 
        { color: selectedPlan === 'professional' ? 'rgba(255, 255, 255, 0.8)' : theme.textSecondary }
      ]}>
        USD
      </Text>
      <Text style={[
        styles.planPriceSubtext, 
        { color: selectedPlan === 'professional' ? 'rgba(255, 255, 255, 0.8)' : theme.text }
      ]}>
        {selectedSubscription === 'monthly' ? 'per month' : 'per month, billed annually'}
      </Text>
      
      
      {selectedSubscription === 'annual' && (
        <Text style={[
          styles.savingsText, 
          { color: selectedPlan === 'professional' ? 'rgba(255, 255, 255, 0.9)' : '#4CAF50' }
        ]}>
          Save 20% with annual billing
        </Text>
      )}
      
      <View style={styles.planFeatures}>
        <View style={styles.featureItem}>
          <Ionicons 
            name="flash" 
            size={20} 
            color={selectedPlan === 'professional' ? '#FFFFFF' : '#3F51B5'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'professional' ? '#FFFFFF' : theme.text }
          ]}>
            <Text style={styles.highlightedText}>1,500 AI credits monthly</Text>
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons 
            name="calculator" 
            size={20} 
            color={selectedPlan === 'professional' ? '#FFFFFF' : '#3F51B5'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'professional' ? '#FFFFFF' : theme.text }
          ]}>
            <Text style={styles.highlightedText}>{getCreditsPerDollar()} credits per $1 • {getValueDescription()}</Text>
          </Text>
        </View>
        
        {/* Credit Rollover Feature */}
        <View style={styles.featureItem}>
          <Ionicons 
            name="infinite" 
            size={20} 
            color={selectedPlan === 'professional' ? '#FFFFFF' : '#3F51B5'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'professional' ? '#FFFFFF' : theme.text }
          ]}>
            <Text style={styles.highlightedText}>Credits roll over forever - never expire</Text>
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons 
            name="person" 
            size={20} 
            color={selectedPlan === 'professional' ? '#FFFFFF' : '#3F51B5'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'professional' ? '#FFFFFF' : theme.text }
          ]}>
            <Text style={styles.highlightedText}>Ideal for daily users</Text>
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.planButton,
          { 
            backgroundColor: selectedPlan === 'professional' ? '#FFFFFF' : '#3F51B5',
            marginTop: 'auto'
          }
        ]}
        onPress={() => handlePurchase('professional')}
      >
        <Text style={[
          styles.planButtonText, 
          { 
            color: selectedPlan === 'professional' ? '#3F51B5' : '#FFFFFF',
            fontWeight: '600'
          }
        ]}>
          Subscribe Now
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default NavigatorAIPlan;