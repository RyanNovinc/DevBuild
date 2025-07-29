// src/screens/PricingScreen/components/PlanCards/CapacityIndicator.js
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles';

const CapacityIndicator = ({ level, selectedPlan, theme }) => {
  const dots = [];
  for (let i = 0; i < 5; i++) {
    dots.push(
      <View 
        key={i} 
        style={[
          styles.capacityDot, 
          { 
            backgroundColor: i < level ? '#4CAF50' : 'rgba(0,0,0,0.1)',
            marginHorizontal: 2 
          }
        ]} 
      />
    );
  }
  
  // Determine icon color based on which plan is being rendered and which plan is selected
  let iconColor;
  
  if (level === 5) { // Compass AI (business)
    iconColor = selectedPlan === 'business' ? '#FFFFFF' : '#673AB7';
  } else if (level === 3) { // Navigator AI (professional)
    iconColor = selectedPlan === 'professional' ? '#FFFFFF' : '#3F51B5';
  } else { // Guide AI (starter)
    iconColor = selectedPlan === 'starter' ? '#FFFFFF' : '#03A9F4';
  }

  // Determine capacity text based on level
  let capacityText;
  if (level === 5) {
    capacityText = "Max capacity";
  } else if (level === 3) {
    capacityText = "Standard capacity";
  } else { // level 1
    capacityText = "Basic capacity";
  }
  
  return (
    <View style={[styles.featureItem, { alignItems: 'center' }]}>
      <Ionicons 
        name="speedometer" 
        size={20} 
        color={iconColor} 
      />
      <View style={[styles.capacityContainer, { alignItems: 'center' }]}>
        <Text style={[
          styles.featureText, 
          { 
            color: 
              selectedPlan === 'business' && level === 5 ? '#FFFFFF' : 
              selectedPlan === 'professional' && level === 3 ? '#FFFFFF' : 
              selectedPlan === 'starter' && level === 1 ? '#FFFFFF' : theme.text,
            marginLeft: 10
          }
        ]}>
          <Text style={styles.highlightedText}>{capacityText}</Text>
        </Text>
        <View style={styles.dotsContainer}>
          {dots}
        </View>
      </View>
    </View>
  );
};

export default CapacityIndicator;