// src/screens/PricingScreen/components/FounderSpotsBanner.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FounderSpotsBanner = ({ 
  spotsRemaining, 
  totalSpots = 1000,
  theme,
  style = {}
}) => {
  // Calculate spots claimed and percentage
  const spotsClaimed = totalSpots - spotsRemaining;
  const percentClaimed = Math.floor((spotsClaimed / totalSpots) * 100);
  
  // Animated value for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Animation for pulse effect on high claim percentage
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Set up animations on mount and when spots change
  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: percentClaimed / 100,
      duration: 1000,
      useNativeDriver: false
    }).start();
    
    // Only add pulse animation when spots are getting low
    if (percentClaimed > 70) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1200,
            useNativeDriver: false
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false
          })
        ])
      ).start();
    }
  }, [spotsRemaining, percentClaimed]);
  
  // Determine color scheme based on percentage claimed
  const getColorScheme = () => {
    if (percentClaimed >= 90) return {
      background: 'rgba(255, 59, 48, 0.08)',
      border: '#FF3B30',
      text: '#FF3B30',
      progress: '#FF3B30'
    };
    if (percentClaimed >= 70) return {
      background: 'rgba(255, 149, 0, 0.08)',
      border: '#FF9500',
      text: '#FF9500',
      progress: '#FF9500'
    };
    if (percentClaimed >= 50) return {
      background: 'rgba(255, 204, 0, 0.08)',
      border: '#FFCC00',
      text: '#FFCC00',
      progress: '#FFCC00'
    };
    return {
      background: 'rgba(63, 81, 181, 0.08)',
      border: '#3F51B5',
      text: '#3F51B5',
      progress: '#3F51B5'
    };
  };
  
  // Get appropriate message based on percentage claimed
  const getSecondaryMessage = () => {
    if (percentClaimed >= 90) {
      return `Only ${spotsRemaining} founder spots remain!`;
    } else if (percentClaimed >= 70) {
      return `${percentClaimed}% claimed - founder spots going fast`;
    } else if (percentClaimed >= 50) {
      return `Half of all founder spots have been claimed`;
    } else if (percentClaimed >= 20) {
      return `${percentClaimed}% of founder spots already claimed`;
    } else if (percentClaimed >= 10) {
      return `${percentClaimed}% of spots already claimed`;
    } else {
      // Below 10%, don't emphasize the exact number claimed
      return `Early access period - spots available now`;
    }
  };
  
  const colors = getColorScheme();
  
  // Show exact count only when it makes sense (over 10%)
  const showExactCount = percentClaimed >= 10;
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.background,
          borderColor: colors.border,
          transform: [{ scale: percentClaimed > 70 ? pulseAnim : 1 }]
        },
        style
      ]}
    >
      {/* Primary Message - Always prominent */}
      <View style={styles.primaryMessageContainer}>
        <Text style={[
          styles.primaryMessage,
          { color: theme?.text || '#000000' }
        ]}>
          Limited to 1,000 founding members
        </Text>
      </View>
      
      {/* Secondary message - Changes based on percentage claimed */}
      <View style={styles.secondaryMessageContainer}>
        <Ionicons 
          name={percentClaimed >= 70 ? "timer" : "people"} 
          size={18} 
          color={colors.text} 
          style={styles.icon} 
        />
        <Text style={[
          styles.secondaryMessage, 
          { color: percentClaimed >= 50 ? colors.text : theme?.textSecondary || '#666666' }
        ]}>
          {getSecondaryMessage()}
        </Text>
      </View>
      
      {/* Progress visualization */}
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              }),
              backgroundColor: colors.progress
            }
          ]}
        />
        
        {/* Only show exact count when it makes sense */}
        {showExactCount && (
          <View style={styles.progressOverlay}>
            <Text style={styles.progressText}>
              {spotsClaimed} of {totalSpots}
            </Text>
          </View>
        )}
      </View>
      
      <Text style={[
        styles.footerText, 
        { color: theme?.textSecondary || 'rgba(0,0,0,0.6)' }
      ]}>
        Founder access is limited by both spots and time - whichever comes first
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
    paddingBottom: 12,
  },
  primaryMessageContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryMessage: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  secondaryMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  icon: {
    marginRight: 8,
  },
  secondaryMessage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    height: 18,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 9,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 9,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footerText: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  }
});

export default FounderSpotsBanner;