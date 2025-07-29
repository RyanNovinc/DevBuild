// src/screens/Onboarding/components/Confetti.js
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Dimensions, 
  Easing,
  Platform,
  AccessibilityInfo
} from 'react-native';
import { isLowEndDevice, useOrientation } from '../utils/deviceUtils';

/**
 * Enhanced Confetti component for celebration animations
 * Improved with accessibility, performance optimizations, and error handling
 * 
 * @param {boolean} active - Whether the confetti should be active
 * @param {array} colors - Array of colors for confetti pieces
 * @param {string} type - Type of confetti animation ('rain', 'fireworks', or 'pulse')
 * @param {number} count - Number of confetti pieces
 * @param {number} duration - Duration of the animation in ms
 * @param {function} onComplete - Function called when animation completes
 */
const Confetti = ({ 
  active = false, 
  colors = ['#FFD700', '#FFC125', '#FFDF00', '#F0E68C', '#DAA520'],
  type = 'rain',
  count = 40,
  duration = 4000,
  onComplete = () => {}
}) => {
  // Get device orientation
  const { orientation } = useOrientation();
  
  // Check if device is low-end
  const isLowEnd = isLowEndDevice();
  
  // Screen dimensions (responsive to orientation changes)
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
  
  // Ensure colors is always an array to prevent "colors.map is not a function" error
  const safeColors = Array.isArray(colors) ? colors : ['#FFD700', '#FFC125', '#FFDF00', '#F0E68C', '#DAA520'];
  
  // Calculate the adjusted count based on device performance
  const adjustedCount = isLowEnd ? Math.min(30, count) : count;
  
  // Array to store confetti pieces animations
  const confettiPieces = useRef([]);
  const animationsRunning = useRef(false);
  const animationInstance = useRef(null);
  
  // Notify screen readers when confetti is shown (for accessibility)
  useEffect(() => {
    if (active && Platform.OS === 'ios') {
      // In a real implementation, this would use AccessibilityInfo
      // AccessibilityInfo.announceForAccessibility("Celebration animation");
    }
  }, [active]);
  
  // Set up confetti when active changes
  useEffect(() => {
    // Clean up any previous animation on rerender
    if (animationInstance.current) {
      animationInstance.current.stop();
      animationInstance.current = null;
    }
    
    if (active && !animationsRunning.current) {
      animationsRunning.current = true;
      
      // Initialize confetti pieces - with error handling for inputs
      confettiPieces.current = Array(adjustedCount).fill().map(() => {
        // Safely determine size, with bounds
        const size = Math.max(3, Math.min(5 + Math.random() * 10, 15));
        
        // Safely access colors with fallback
        const color = safeColors[Math.floor(Math.random() * safeColors.length)];
        
        // Different behavior based on animation type
        let initialX, initialY, endX, endY, delay;
        
        if (type === 'fireworks') {
          // Fireworks effect - particles explode from center
          initialX = SCREEN_WIDTH / 2 - 20 + Math.random() * 40;
          initialY = SCREEN_HEIGHT / 2 + Math.random() * 50;
          endX = Math.random() * SCREEN_WIDTH;
          endY = Math.random() * SCREEN_HEIGHT;
          delay = Math.random() * 100;
        } else if (type === 'pulse') {
          // Pulse effect - particles move outward from center
          const angle = Math.random() * Math.PI * 2;
          initialX = SCREEN_WIDTH / 2;
          initialY = SCREEN_HEIGHT / 2;
          endX = initialX + Math.cos(angle) * Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.8;
          endY = initialY + Math.sin(angle) * Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.8;
          delay = Math.random() * 200;
        } else {
          // Default rain effect - particles fall from top
          initialX = Math.random() * SCREEN_WIDTH;
          initialY = -50;
          endX = initialX + (Math.random() - 0.5) * 200;
          endY = SCREEN_HEIGHT + 50;
          delay = Math.random() * 1000;
        }
        
        // Create animation values for each property
        const piece = {
          x: new Animated.Value(0),
          y: new Animated.Value(-20),
          rotation: new Animated.Value(0),
          scale: new Animated.Value(0),
          opacity: new Animated.Value(0),
          size,
          color,
          initialX,
          initialY,
          endX,
          endY,
          delay,
          duration: duration * (0.6 + Math.random() * 0.4)
        };
        
        return piece;
      });
      
      // Start animations with proper cleanup
      startAnimations();
    }
    
    return () => {
      // Clean up on unmount
      if (animationInstance.current) {
        animationInstance.current.stop();
        animationInstance.current = null;
      }
      animationsRunning.current = false;
    };
  }, [active, safeColors, type, adjustedCount, duration, SCREEN_WIDTH, SCREEN_HEIGHT]);
  
  // Start the animation sequence
  const startAnimations = () => {
    // Create array of animations
    const animations = confettiPieces.current.map((piece) => {
      // Set initial positions
      piece.x.setValue(piece.initialX);
      piece.y.setValue(piece.initialY);
      piece.rotation.setValue(0);
      piece.scale.setValue(0);
      piece.opacity.setValue(0);
      
      return Animated.sequence([
        // Delay each piece slightly
        Animated.delay(piece.delay),
        
        // Start animation (appear and move)
        Animated.parallel([
          // Movement animation
          Animated.timing(piece.x, {
            toValue: piece.endX,
            duration: piece.duration,
            easing: Easing.bezier(0.215, 0.61, 0.355, 1),
            useNativeDriver: true
          }),
          Animated.timing(piece.y, {
            toValue: piece.endY,
            duration: piece.duration,
            easing: type === 'fireworks'
              ? Easing.bezier(0.25, 0.1, 0.25, 1)
              : Easing.bezier(0.55, 0.085, 0.68, 0.53),
            useNativeDriver: true
          }),
          
          // Appearance animation
          Animated.sequence([
            // Fade in
            Animated.timing(piece.opacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true
            }),
            // Scale up
            Animated.timing(piece.scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true
            }),
            // Rotate
            Animated.timing(piece.rotation, {
              toValue: Math.random() * 2 * Math.PI,
              duration: piece.duration,
              useNativeDriver: true
            }),
            // Hold visible
            Animated.delay(piece.duration * 0.3),
            // Fade out
            Animated.timing(piece.opacity, {
              toValue: 0,
              duration: piece.duration * 0.4,
              useNativeDriver: true
            })
          ])
        ])
      ]);
    });
    
    // Run all animations together with staggered timing, if we have animations
    if (animations.length > 0) {
      animationInstance.current = Animated.stagger(
        isLowEnd ? 40 : 20, // Longer delay between particles on low-end devices
        animations
      );
      
      animationInstance.current.start(() => {
        // Clean up
        animationsRunning.current = false;
        animationInstance.current = null;
        
        // Call completion handler
        onComplete();
      });
    } else {
      // If there are no animations (shouldn't happen normally), still reset state
      animationsRunning.current = false;
      onComplete();
    }
  };
  
  if (!active) return null;
  
  return (
    <View 
      style={styles.container} 
      pointerEvents="none"
      accessible={true}
      accessibilityLabel="Celebration animation"
      accessibilityRole="image"
      importantForAccessibility="no"
    >
      {confettiPieces.current.map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confettiPiece,
            {
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: piece.size / 2,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                { rotate: piece.rotation.interpolate({
                  inputRange: [0, Math.PI * 2],
                  outputRange: ['0deg', '360deg']
                })},
                { scale: piece.scale }
              ],
              opacity: piece.opacity,
              shadowColor: piece.color,
              shadowOpacity: isLowEnd ? 0.4 : 0.8, // Reduce shadow intensity on low-end devices
              shadowRadius: isLowEnd ? 2 : 5,      // Reduce shadow radius on low-end devices
              shadowOffset: { width: 0, height: 0 }
            }
          ]}
          accessibilityLabel={`Confetti piece ${index + 1}`}
          importantForAccessibility="no"
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  confettiPiece: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5
  }
});

export default Confetti;