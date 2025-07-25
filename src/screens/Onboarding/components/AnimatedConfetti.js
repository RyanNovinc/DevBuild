// src/screens/Onboarding/components/AnimatedConfetti.js
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * AnimatedConfetti - Simple confetti that falls at a constant speed
 * 
 * @param {boolean} visible - Whether the confetti should be shown
 * @param {Array} colors - Array of colors to use for confetti pieces
 * @param {number} pieces - Number of confetti pieces to display
 * @param {number} startOffsetY - How far above the screen to start (negative value)
 */
const AnimatedConfetti = ({ 
  visible, 
  colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'], 
  pieces = 50,
  startOffsetY = -150 // Start much higher above the screen
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const confettiPieces = useRef([]);
  
  // Generate confetti pieces when component mounts
  useEffect(() => {
    confettiPieces.current = Array(pieces).fill().map(() => ({
      // Animation values
      position: new Animated.Value(startOffsetY - Math.random() * 100), // Varied starting positions above screen
      rotation: new Animated.Value(0),
      
      // Static properties
      id: Math.random().toString(36).substring(7),
      width: 5 + Math.random() * 10,
      height: 10 + Math.random() * 15, 
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.random() * width * 0.9 + width * 0.05, // Random horizontal position
      delay: Math.random() * 1000, // Shorter delay range
      duration: 2000 + Math.random() * 1000, // Slightly varied durations for natural look
      rotationStart: Math.random() * 360, // Random starting rotation
      rotationEnd: Math.random() * 360 + 360 // Random ending rotation (at least one full turn)
    }));
  }, [pieces, colors, startOffsetY]);
  
  // Start animation when visible changes
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      startConfettiAnimation();
    } else {
      setIsVisible(false);
    }
    
    return () => {
      // Clean up animations on unmount
      confettiPieces.current.forEach(confetti => {
        confetti.position.stopAnimation();
        confetti.rotation.stopAnimation();
      });
    };
  }, [visible]);
  
  // Start the confetti animation
  const startConfettiAnimation = () => {
    confettiPieces.current.forEach(confetti => {
      // Reset values
      confetti.position.setValue(confetti.position._value); // Keep initial value
      confetti.rotation.setValue(confetti.rotationStart);
      
      // Create animations
      Animated.sequence([
        // Initial delay for staggered effect
        Animated.delay(confetti.delay),
        
        // Start all animations in parallel
        Animated.parallel([
          // Simple linear falling
          Animated.timing(confetti.position, {
            toValue: height + 50, // Fall past bottom of screen
            duration: confetti.duration,
            easing: Easing.linear, // Constant speed
            useNativeDriver: true
          }),
          
          // Simple rotation
          Animated.timing(confetti.rotation, {
            toValue: confetti.rotationEnd,
            duration: confetti.duration,
            easing: Easing.linear,
            useNativeDriver: true
          })
        ])
      ]).start();
    });
  };
  
  // Don't render anything if not visible
  if (!isVisible) return null;
  
  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.current.map(confetti => (
        <Animated.View
          key={confetti.id}
          style={[
            styles.confettiPiece,
            {
              width: confetti.width,
              height: confetti.height,
              backgroundColor: confetti.color,
              left: confetti.x,
              transform: [
                // Simple falling motion
                { translateY: confetti.position },
                // Simple rotation
                { rotate: confetti.rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg']
                })}
              ]
            }
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  confettiPiece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  }
});

export default AnimatedConfetti;