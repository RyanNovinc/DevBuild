// src/screens/PricingScreen/components/PlanCards/CompassAIPlan.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles';
import CapacityIndicator from './CapacityIndicator';

const CompassAIPlan = ({ 
  theme, 
  selectedPlan, 
  handleSelectPlan, 
  isLifetimeMember, 
  isFromReferral, 
  selectedSubscription, 
  handlePurchase 
}) => {
  // Regular price - updated to $9.99
  const regularMonthlyPrice = 9.99;
  
  // Helper function to get display price based on subscription
  const getDisplayPrice = () => {
    return selectedSubscription === 'monthly' ? regularMonthlyPrice.toFixed(2) : (regularMonthlyPrice * 0.8).toFixed(2);
  };

  // Helper function to get credits per dollar
  const getCreditsPerDollar = () => {
    const currentPrice = selectedSubscription === 'monthly' ? regularMonthlyPrice : (regularMonthlyPrice * 0.8);
    return Math.round(5000 / currentPrice);
  };

  // Helper function to get value description
  const getValueDescription = () => {
    return selectedSubscription === 'monthly' ? 'Best value' : 'Exceptional value (annual)';
  };

  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        { 
          backgroundColor: selectedPlan === 'business' ? '#673AB7' : theme.card,
          borderColor: selectedPlan === 'business' ? '#673AB7' : theme.border,
          height: 450, // Keep the height consistent
          opacity: 0.95,
        }
      ]}
      onPress={() => handleSelectPlan('business')}
    >
      <View style={styles.planHeader}>
        <Text style={[
          styles.planTitle, 
          { color: selectedPlan === 'business' ? '#FFFFFF' : theme.text }
        ]}>
          AI Max
        </Text>
      </View>
      
      {/* Simplified Price display */}
      <Text style={[
        styles.planPrice, 
        { color: selectedPlan === 'business' ? '#FFFFFF' : theme.text }
      ]}>
        ${getDisplayPrice()}
      </Text>
      
      <Text style={[
        styles.planCurrency, 
        { color: selectedPlan === 'business' ? 'rgba(255, 255, 255, 0.8)' : theme.textSecondary }
      ]}>
        USD
      </Text>
      <Text style={[
        styles.planPriceSubtext, 
        { color: selectedPlan === 'business' ? 'rgba(255, 255, 255, 0.8)' : theme.text }
      ]}>
        {selectedSubscription === 'monthly' ? 'per month' : 'per month, billed annually'}
      </Text>
      
      
      {selectedSubscription === 'annual' && (
        <Text style={[
          styles.savingsText, 
          { color: selectedPlan === 'business' ? 'rgba(255, 255, 255, 0.9)' : '#4CAF50' }
        ]}>
          Save 20% with annual billing
        </Text>
      )}
      
      <View style={styles.planFeatures}>
        <View style={styles.featureItem}>
          <Ionicons 
            name="flash" 
            size={20} 
            color={selectedPlan === 'business' ? '#FFFFFF' : '#673AB7'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'business' ? '#FFFFFF' : theme.text }
          ]}>
            <Text style={styles.highlightedText}>5,000 AI credits monthly</Text>
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons 
            name="calculator" 
            size={20} 
            color={selectedPlan === 'business' ? '#FFFFFF' : '#673AB7'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'business' ? '#FFFFFF' : theme.text }
          ]}>
            <Text style={styles.highlightedText}>{getCreditsPerDollar()} credits per $1 • {getValueDescription()}</Text>
          </Text>
        </View>
        
        {/* Credit Rollover Feature */}
        <View style={styles.featureItem}>
          <Ionicons 
            name="infinite" 
            size={20} 
            color={selectedPlan === 'business' ? '#FFFFFF' : '#673AB7'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'business' ? '#FFFFFF' : theme.text }
          ]}>
            <Text style={styles.highlightedText}>Credits roll over forever - never expire</Text>
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons 
            name="person" 
            size={20} 
            color={selectedPlan === 'business' ? '#FFFFFF' : '#673AB7'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'business' ? '#FFFFFF' : theme.text }
          ]}>
            <Text style={styles.highlightedText}>Perfect for power users</Text>
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.planButton,
          { 
            backgroundColor: selectedPlan === 'business' ? '#FFFFFF' : '#673AB7',
            marginTop: 'auto'
          }
        ]}
        onPress={() => handlePurchase('business')}
      >
        <Text style={[
          styles.planButtonText, 
          { 
            color: selectedPlan === 'business' ? '#673AB7' : '#FFFFFF',
            fontWeight: '600'
          }
        ]}>
          Subscribe Now
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default CompassAIPlan;