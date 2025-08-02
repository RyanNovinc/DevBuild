// src/screens/PricingScreen/components/PlanCards/GuideAIPlan.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles';
import CapacityIndicator from './CapacityIndicator';

const GuideAIPlan = ({ 
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

  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        { 
          backgroundColor: selectedPlan === 'starter' ? '#03A9F4' : theme.card,
          borderColor: selectedPlan === 'starter' ? '#03A9F4' : theme.border,
          height: 450, // Keep height consistent
          opacity: 0.95,
        }
      ]}
      onPress={() => handleSelectPlan('starter')}
    >
      {/* Repositioned "FREE WITH FOUNDER'S" badge */}
      {!isLifetimeMember && (
        <View style={{
          position: 'absolute',
          top: 5,
          right: 5,
          backgroundColor: '#FF9800',
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 4,
          zIndex: 10,
        }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 'bold',
            }}
          >
            FREE WITH FOUNDER&apos;S
          </Text>
        </View>
      )}
      
      <View style={styles.planHeader}>
        <Text style={[
          styles.planTitle, 
          { color: selectedPlan === 'starter' ? '#FFFFFF' : theme.text }
        ]}>
          AI Light
        </Text>
      </View>
      
      {/* Simplified Price display */}
      <Text style={[
        styles.planPrice, 
        { color: selectedPlan === 'starter' ? '#FFFFFF' : theme.text }
      ]}>
        ${getDisplayPrice()}
      </Text>
      
      <Text style={[
        styles.planCurrency, 
        { color: selectedPlan === 'starter' ? 'rgba(255, 255, 255, 0.8)' : theme.textSecondary }
      ]}>
        USD
      </Text>
      <Text style={[
        styles.planPriceSubtext, 
        { color: selectedPlan === 'starter' ? 'rgba(255, 255, 255, 0.8)' : theme.text }
      ]}>
        {selectedSubscription === 'monthly' ? 'per month' : 'per month, billed annually'}
      </Text>
      
      {isFromReferral && (
        <Text style={[
          styles.savingsText, 
          { color: selectedPlan === 'starter' ? 'rgba(255, 255, 255, 0.9)' : '#4CAF50' }
        ]}>
          50% off your first month!
        </Text>
      )}
      
      {selectedSubscription === 'annual' && (
        <Text style={[
          styles.savingsText, 
          { color: selectedPlan === 'starter' ? 'rgba(255, 255, 255, 0.9)' : '#4CAF50' }
        ]}>
          Save 20% with annual billing
        </Text>
      )}
      
      <View style={styles.planFeatures}>
        <View style={styles.featureItem}>
          <Ionicons 
            name="chatbox" 
            size={20} 
            color={selectedPlan === 'starter' ? '#FFFFFF' : '#03A9F4'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'starter' ? '#FFFFFF' : theme.text }
          ]}>
            <Text style={styles.highlightedText}>Up to 600 AI interactions per month*</Text>
          </Text>
        </View>
        
        <CapacityIndicator level={1} selectedPlan={selectedPlan} theme={theme} />
        
        {/* Credit Rollover Feature */}
        <View style={styles.featureItem}>
          <Ionicons 
            name="infinite" 
            size={20} 
            color={selectedPlan === 'starter' ? '#FFFFFF' : '#03A9F4'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'starter' ? '#FFFFFF' : theme.text }
          ]}>
            <Text style={styles.highlightedText}>Credits roll over forever - never expire</Text>
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons 
            name="person" 
            size={20} 
            color={selectedPlan === 'starter' ? '#FFFFFF' : '#03A9F4'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'starter' ? '#FFFFFF' : theme.text }
          ]}>
            <Text style={styles.highlightedText}>Perfect for casual users</Text>
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.planButton,
          { 
            backgroundColor: selectedPlan === 'starter' ? '#FFFFFF' : '#03A9F4',
            marginTop: 'auto'
          }
        ]}
        onPress={() => handlePurchase('starter')}
      >
        <Text style={[
          styles.planButtonText, 
          { 
            color: selectedPlan === 'starter' ? '#03A9F4' : '#FFFFFF',
            fontWeight: '600'
          }
        ]}>
          Get Started
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default GuideAIPlan;