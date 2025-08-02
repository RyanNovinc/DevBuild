// src/screens/PricingScreen/components/PlanCards/FreePlan.js - Updated
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles';

const FreePlan = ({ theme, selectedPlan, handleSelectPlan }) => {
  return (
    <TouchableOpacity
      style={[
        styles.planCard,
        { 
          backgroundColor: selectedPlan === 'free' ? '#607D8B' : theme.card,
          borderColor: selectedPlan === 'free' ? '#607D8B' : theme.border,
          height: 400,
          opacity: 0.9,
        }
      ]}
      onPress={() => handleSelectPlan('free')}
    >
      <View style={styles.planHeader}>
        <Text style={[
          styles.planTitle, 
          { color: selectedPlan === 'free' ? '#FFFFFF' : theme.text }
        ]}>
          Free
        </Text>
      </View>
      
      <Text style={[
        styles.planPrice, 
        { color: selectedPlan === 'free' ? '#FFFFFF' : theme.text }
      ]}>
        $0
      </Text>
      <Text style={[
        styles.planCurrency, 
        { color: selectedPlan === 'free' ? 'rgba(255, 255, 255, 0.8)' : theme.textSecondary }
      ]}>
        USD
      </Text>
      <Text style={[
        styles.planPriceSubtext, 
        { color: selectedPlan === 'free' ? 'rgba(255, 255, 255, 0.8)' : theme.text }
      ]}>
        Forever
      </Text>
      
      <View style={styles.planFeatures}>
        <View style={styles.featureItem}>
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color={selectedPlan === 'free' ? '#FFFFFF' : '#607D8B'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'free' ? '#FFFFFF' : theme.text }
          ]}>
            Up to 2 active goals
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color={selectedPlan === 'free' ? '#FFFFFF' : '#607D8B'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'free' ? '#FFFFFF' : theme.text }
          ]}>
            2 projects per goal
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color={selectedPlan === 'free' ? '#FFFFFF' : '#607D8B'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'free' ? '#FFFFFF' : theme.text }
          ]}>
            5 time blocks per week
          </Text>
        </View>
        
        <View style={styles.featureItem}>
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color={selectedPlan === 'free' ? '#FFFFFF' : '#607D8B'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'free' ? '#FFFFFF' : theme.text }
          ]}>
            Financial Tracker widget
          </Text>
        </View>

        <View style={styles.featureItem}>
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color={selectedPlan === 'free' ? '#FFFFFF' : '#607D8B'} 
          />
          <Text style={[
            styles.featureText, 
            { color: selectedPlan === 'free' ? '#FFFFFF' : theme.text }
          ]}>
            Try AI features for Free
          </Text>
        </View>
      </View>
      
      <View
        style={[
          styles.planButton,
          { 
            backgroundColor: selectedPlan === 'free' ? '#FFFFFF' : '#607D8B',
            marginTop: 'auto',
            opacity: 0.8
          }
        ]}
      >
        <Text style={[
          styles.planButtonText, 
          { 
            color: selectedPlan === 'free' ? '#607D8B' : '#FFFFFF',
            fontWeight: '600'
          }
        ]}>
          Continue with Free
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default FreePlan;