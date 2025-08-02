// src/components/FadeInView.js - Enhanced version for black transitions
import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

/**
 * An enhanced FadeInView component that supports fading in from black
 * with improved handling to prevent flashing
 */
const FadeInView = ({ 
  children, 
  duration = 500, 
  delay = 0, 
  style = {},
  fadeFromBlack = false, // Add option to fade from black
}) => {
  // Animation values for fade-in effects
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const blackOverlayOpacity = useRef(new Animated.Value(fadeFromBlack ? 1 : 0)).current;
  
  useEffect(() => {
    // Use setTimeout to ensure component is fully mounted before animation
    const timer = setTimeout(() => {
      if (fadeFromBlack) {
        // If fading from black, first make content visible behind black overlay,
        // then fade out the black overlay
        Animated.sequence([
          // First make content fully visible (but still behind black)
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: Math.floor(duration * 0.4), // 40% of total duration
            useNativeDriver: true,
          }),
          // Then fade out the black overlay
          Animated.timing(blackOverlayOpacity, {
            toValue: 0,
            duration: Math.floor(duration * 0.6), // 60% of total duration
            delay: delay,
            useNativeDriver: true,
          })
        ]).start();
      } else {
        // Standard fade in animation without black overlay
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: duration,
          delay: delay,
          useNativeDriver: true,
        }).start();
      }
    }, 50); // Small delay to ensure mounting is complete
    
    return () => clearTimeout(timer);
  }, []);
  
  // Render with fade animations
  return (
    <View style={[styles.container, style]}>
      {/* Content that fades in */}
      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
        {children}
      </Animated.View>
      
      {/* Black overlay that fades out (only used when fadeFromBlack=true) */}
      {fadeFromBlack && (
        <Animated.View 
          style={[
            styles.blackOverlay, 
            { opacity: blackOverlayOpacity }
          ]} 
          pointerEvents="none"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 10,
  }
});

export default FadeInView;