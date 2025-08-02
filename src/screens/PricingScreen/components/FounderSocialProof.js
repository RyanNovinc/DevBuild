// src/screens/PricingScreen/components/FounderSocialProof.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * A component that displays social proof about founder signups
 * Creates peer-based urgency by showing how many others have already joined
 */
const FounderSocialProof = ({ 
  theme, 
  spotsClaimed, 
  totalSpots = 1000,
  style = {} 
}) => {
  // Animation for subtle highlight effect
  const highlightAnim = useRef(new Animated.Value(0)).current;
  
  // Calculate percentage claimed for display
  const percentClaimed = Math.floor((spotsClaimed / totalSpots) * 100);
  
  // Set up animation on mount and when spots change
  useEffect(() => {
    // Reset animation first
    highlightAnim.setValue(0);
    
    // Start new animation sequence
    Animated.sequence([
      // Delay before starting animation
      Animated.delay(500),
      // Animate to highlighted state
      Animated.timing(highlightAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false
      }),
      // Hold highlight
      Animated.delay(1000),
      // Animate back to normal
      Animated.timing(highlightAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: false
      })
    ]).start();
  }, [spotsClaimed]);
  
  // Calculate dynamic styles based on animation
  const dynamicBackground = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(63, 81, 181, 0.08)', 'rgba(63, 81, 181, 0.18)']
  });
  
  // Get appropriate messaging based on number of spots claimed
  const getMessage = () => {
    if (spotsClaimed < 100) {
      return `${spotsClaimed} early adopters have already secured their founder access`;
    } else if (spotsClaimed < 500) {
      return `${spotsClaimed} founders have already claimed their lifetime access`;
    } else if (spotsClaimed < 900) {
      return `Join ${spotsClaimed} others who've claimed founder access`;
    } else {
      return `Hurry! ${spotsClaimed} spots already claimed, only ${totalSpots - spotsClaimed} remain`;
    }
  };
  
  return (
    <Animated.View style={[
      styles.container,
      { 
        backgroundColor: dynamicBackground,
      },
      style
    ]}>
      <Ionicons 
        name={spotsClaimed > 800 ? "people" : "people-outline"} 
        size={20} 
        color="#3F51B5" 
      />
      <View style={styles.textContainer}>
        <Text style={[
          styles.mainText,
          { color: theme.text }
        ]}>
          {getMessage()}
        </Text>
        
        {percentClaimed >= 25 && (
          <Text style={[
            styles.percentText,
            { 
              color: percentClaimed >= 90 ? '#FF3B30' : 
                    percentClaimed >= 75 ? '#FF9500' : 
                    percentClaimed >= 50 ? '#FFCC00' : '#3F51B5'
            }
          ]}>
            {percentClaimed}% claimed
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  mainText: {
    fontSize: 14,
    fontWeight: '500',
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  }
});

export default FounderSocialProof;