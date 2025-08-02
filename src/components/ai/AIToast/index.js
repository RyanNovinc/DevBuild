// src/components/ai/AIToast/index.js - Fixed with quick, symmetrical animations
import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Platform } from 'react-native';

/**
 * AIToast - Toast notification for brief messages
 * Styled to match ChatGPT's dark theme
 * Ultra-fast animations for minimal interruption
 */
const AIToast = ({ 
  visible = false, 
  message = '', 
  duration = 800, // Reduced to just 800ms for ultra-quick feedback
  onHide
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hideTimeoutRef = useRef(null);
  
  // Handle visibility changes
  useEffect(() => {
    // Clear any existing timeout to prevent memory leaks
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150, // Ultra-fast fade-in
        useNativeDriver: true
      }).start();
      
      // Auto hide after specified duration
      hideTimeoutRef.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150, // Ultra-fast fade-out
          useNativeDriver: true
        }).start(() => {
          if (onHide) onHide();
        });
      }, duration);
      
      // Clean up timeout on unmount or when visible changes
      return () => {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      };
    } else {
      // If not visible, ensure opacity is 0
      fadeAnim.setValue(0);
    }
  }, [visible, duration, fadeAnim, onHide]);
  
  // Don't render anything if not visible and opacity is 0
  if (!visible && fadeAnim._value === 0) return null;
  
  return (
    <Animated.View 
      style={[
        styles.toast, 
        { 
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-10, 0] // Less vertical movement for faster appearance
              })
            }
          ]
        }
      ]}
    >
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    elevation: 5,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  toastText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AIToast;