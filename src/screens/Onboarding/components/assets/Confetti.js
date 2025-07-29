// src/screens/Onboarding/components/Confetti.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Confetti component for celebration animations
 * @param {boolean} active - Whether the confetti should be active
 * @param {array} colors - Array of colors for confetti pieces
 * @param {string} type - Type of confetti animation ('rain' or 'fireworks')
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
  // Array to store confetti pieces animations
  const confettiPieces = useRef([]);
  const animationsRunning = useRef(false);
  
  // Set up confetti when active changes
  useEffect(() => {
    if (active && !animationsRunning.current) {
      animationsRunning.current = true;
      
      // Initialize confetti pieces
      confettiPieces.current = Array(count).fill().map(() => {
        const piece = {
          x: new Animated.Value(0),
          y: new Animated.Value(-20),
          rotation: new Animated.Value(0),
          scale: new Animated.Value(0),
          opacity: new Animated.Value(0),
          size: 5 + Math.random() * 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          initialX: type === 'fireworks' 
            ? SCREEN_WIDTH / 2 - 20 + Math.random() * 40
            : Math.random() * SCREEN_WIDTH,
          initialY: type === 'fireworks'
            ? SCREEN_HEIGHT / 2 + Math.random() * 50
            : -50,
          endX: type === 'fireworks'
            ? Math.random() * SCREEN_WIDTH 
            : Math.random() * SCREEN_WIDTH,
          endY: type === 'fireworks'
            ? Math.random() * SCREEN_HEIGHT
            : SCREEN_HEIGHT + 50,
          delay: type === 'fireworks'
            ? Math.random() * 100
            : Math.random() * 1000,
          duration: duration * (0.6 + Math.random() * 0.4)
        };
        
        return piece;
      });
      
      // Start animations
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
      
      // Run all animations together with staggered timing
      Animated.stagger(20, animations).start(() => {
        // Clean up
        animationsRunning.current = false;
        // Call completion handler
        onComplete();
      });
    }
  }, [active, colors, type, count, duration, onComplete]);
  
  if (!active) return null;
  
  return (
    <View style={styles.container} pointerEvents="none">
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
              shadowOpacity: 0.8,
              shadowRadius: 5,
              shadowOffset: { width: 0, height: 0 }
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