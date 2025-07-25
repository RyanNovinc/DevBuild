// src/screens/PricingScreen/components/FounderCountdown.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * A dedicated, prominent countdown timer for founder access
 */
const FounderCountdown = ({ 
  endDate,
  theme,
  style = {} 
}) => {
  // State for countdown timer
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });
  
  // Animation for pulsing effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Calculate time remaining
  const calculateTimeRemaining = () => {
    const now = new Date();
    const end = new Date(endDate);
    const difference = end - now;
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };
  
  // Update the countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [endDate]);
  
  // Set up pulsing animation for last day
  useEffect(() => {
    if (timeRemaining.days < 1) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timeRemaining.days]);
  
  // Format digits with leading zero
  const formatDigit = (digit) => {
    return digit < 10 ? `0${digit}` : `${digit}`;
  };
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: theme.cardElevated,
          transform: [{ scale: pulseAnim }]
        },
        style
      ]}
    >
      <Text style={[styles.titleText, { color: theme.text }]}>
        Founder access ends in:
      </Text>
      
      <View style={styles.countdownContainer}>
        {/* Days */}
        <View style={styles.timeUnit}>
          <View style={[styles.timeBox, { backgroundColor: theme.primary }]}>
            <Text style={styles.timeValue}>{formatDigit(timeRemaining.days)}</Text>
          </View>
          <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>days</Text>
        </View>
        
        <Text style={[styles.timeSeparator, { color: theme.primary }]}>:</Text>
        
        {/* Hours */}
        <View style={styles.timeUnit}>
          <View style={[styles.timeBox, { backgroundColor: theme.primary }]}>
            <Text style={styles.timeValue}>{formatDigit(timeRemaining.hours)}</Text>
          </View>
          <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>hours</Text>
        </View>
        
        <Text style={[styles.timeSeparator, { color: theme.primary }]}>:</Text>
        
        {/* Minutes */}
        <View style={styles.timeUnit}>
          <View style={[styles.timeBox, { backgroundColor: theme.primary }]}>
            <Text style={styles.timeValue}>{formatDigit(timeRemaining.minutes)}</Text>
          </View>
          <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>min</Text>
        </View>
        
        <Text style={[styles.timeSeparator, { color: theme.primary }]}>:</Text>
        
        {/* Seconds */}
        <View style={styles.timeUnit}>
          <View style={[styles.timeBox, { backgroundColor: theme.primary }]}>
            <Text style={styles.timeValue}>{formatDigit(timeRemaining.seconds)}</Text>
          </View>
          <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>sec</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeUnit: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  timeBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timeLabel: {
    fontSize: 12,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 2,
  }
});

export default FounderCountdown;