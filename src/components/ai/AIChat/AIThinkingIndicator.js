// src/components/ai/AIChat/AIThinkingIndicator.js - Compass thinking indicator
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * AIThinkingIndicator - Compass spinning animation
 * Shows a compass icon rotating while the AI is thinking
 */
const AIThinkingIndicator = ({ style = 'default' }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const startSpinning = () => {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000, // Slower, more contemplative rotation
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin) // Smooth easing for compass feel
        })
      ).start();
    };
    
    startSpinning();
    
    return () => {
      spinValue.stopAnimation();
    };
  }, []);
  
  // Interpolate rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Get color based on style
  const getColor = () => {
    switch(style) {
      case 'guide':
        return '#03A9F4';
      case 'navigator':
        return '#3F51B5';
      case 'compass':
        return '#673AB7';
      default:
        return '#19C37D'; // ChatGPT's green color
    }
  };
  
  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Ionicons name="compass-outline" size={24} color={getColor()} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  }
});

export default AIThinkingIndicator;