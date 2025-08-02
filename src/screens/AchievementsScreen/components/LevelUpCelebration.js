// src/screens/AchievementsScreen/components/LevelUpCelebration.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// Confetti piece component
const ConfettiPiece = ({ centerX, color, size, delay = 0 }) => {
  // Debug: Log the centerX value
  console.log('ConfettiPiece centerX:', centerX, 'Screen width:', width);
  
  // Start from actual center-top with no spread initially
  const startX = 0; // Start at absolute center
  const startY = -50;
  
  // End position spreads out from center
  const endX = (Math.random() * 200 - 100); // -100 to +100 from center
  const endY = height * 0.8 + Math.random() * 100;
  
  const translateX = useRef(new Animated.Value(startX)).current;
  const translateY = useRef(new Animated.Value(startY)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const duration = 2500 + Math.random() * 1500;
    const rotationEnd = Math.random() * 720 - 360; // Random rotation

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        // Scale in
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Fall down
        Animated.timing(translateY, {
          toValue: endY,
          duration: duration,
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        }),
        // Spread horizontally
        Animated.timing(translateX, {
          toValue: endX,
          duration: duration,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        // Rotate
        Animated.timing(rotation, {
          toValue: rotationEnd,
          duration: duration,
          useNativeDriver: true,
        }),
        // Fade out
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration * 0.6,
          delay: duration * 0.4,
          useNativeDriver: true,
        }),
      ])
    ]).start();
  }, []);

  // Shapes for confetti pieces
  const shapeType = useRef(Math.floor(Math.random() * 4)).current;
  
  const renderShape = () => {
    switch(shapeType) {
      case 0:
        return <View style={[styles.confettiCircle, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]} />;
      case 1:
        return <View style={[styles.confettiSquare, { backgroundColor: color, width: size, height: size }]} />;
      case 2:
        return <View style={[styles.confettiTriangle, { borderBottomColor: color, borderBottomWidth: size, borderLeftWidth: size / 2, borderRightWidth: size / 2 }]} />;
      case 3:
        return <Ionicons name="star" size={size} color={color} />;
      default:
        return <View style={[styles.confettiCircle, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left: width / 2, // Position at screen center horizontally
          top: 0, // Position at top of screen vertically
          transform: [
            { translateX },
            { translateY },
            { rotate: rotation.interpolate({
              inputRange: [0, 360],
              outputRange: ['0deg', '360deg']
            })},
            { scale }
          ],
          opacity
        }
      ]}
    >
      {renderShape()}
    </Animated.View>
  );
};

// Main celebration component
const LevelUpCelebration = ({ visible, level, previousLevel, onAnimationComplete }) => {
  const [confetti, setConfetti] = useState([]);
  const [hapticTriggered, setHapticTriggered] = useState(false);
  const labelScale = useRef(new Animated.Value(0)).current;
  const labelY = useRef(new Animated.Value(-100)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  
  // Animation controller reference
  const animationController = useRef(null);

  // Generate confetti pieces
  useEffect(() => {
    // Function to clean up animations
    const cleanup = () => {
      if (animationController.current) {
        animationController.current.stop();
        // Clear safety timeout if it exists
        if (animationController.current.safetyTimeout) {
          clearTimeout(animationController.current.safetyTimeout);
        }
        animationController.current = null;
      }
    };
    
    if (visible) {
      // Trigger haptic feedback only once per animation
      if (!hapticTriggered && Platform.OS !== 'web') {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setHapticTriggered(true);
        } catch (e) {
          console.log('Haptics error:', e);
        }
      }

      // Create confetti array
      const confettiCount = Math.min(50 + (level * 5), 100); // More confetti for higher levels, max 100
      const pieces = [];
      const colors = ['#FF5252', '#FFD740', '#64FFDA', '#448AFF', '#B388FF', '#FF4081'];
      const centerX = width / 2; // Calculate center once

      for (let i = 0; i < confettiCount; i++) {
        pieces.push({
          id: i,
          centerX: centerX, // Pass center X position
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 6 + Math.random() * 10,
          delay: Math.random() * 500
        });
      }

      setConfetti(pieces);

      // Animate the level up label
      cleanup(); // First cleanup any existing animation
      
      animationController.current = Animated.sequence([
        Animated.parallel([
          Animated.timing(backgroundOpacity, {
            toValue: 0.7,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(labelY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          }),
          Animated.timing(labelScale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          })
        ]),
        Animated.delay(2500),
        Animated.parallel([
          Animated.timing(backgroundOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.timing(labelScale, {
            toValue: 1.2,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.timing(labelY, {
            toValue: -50,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease)
          })
        ])
      ]);
      
      animationController.current.start(({ finished }) => {
        if (finished && onAnimationComplete) {
          onAnimationComplete();
        }
      });
      
      // Safety timeout to ensure completion callback is called even if animation fails
      const safetyTimeout = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }, 6000); // 6 seconds safety timeout
      
      // Store timeout for cleanup
      animationController.current.safetyTimeout = safetyTimeout;
    } else {
      // Reset values when not visible
      cleanup();
      setConfetti([]);
      setHapticTriggered(false);
      labelScale.setValue(0);
      labelY.setValue(-100);
      backgroundOpacity.setValue(0);
    }
    
    // Cleanup on unmount
    return cleanup;
  }, [visible, level]);

  if (!visible) return null;

  // Get level name
  const getLevelName = () => {
    const names = [
      'Beginner', 'Intermediate', 'Professional', 'Expert', 'Master',
      'Grand Master', 'Champion', 'Legend', 'Hero', 'Immortal',
      'Ascendant', 'Eternal'
    ];
    return names[level - 1] || 'Master';
  };

  // Get text color based on level
  const getTextGradient = () => {
    if (level <= 2) return ['#CD7F32', '#8B4513']; // Bronze
    if (level <= 4) return ['#C0C0C0', '#A9A9A9']; // Silver
    if (level <= 7) return ['#FFD700', '#DAA520']; // Gold
    if (level <= 9) return ['#E6E6FA', '#9370DB']; // Light purple
    if (level <= 10) return ['#FF4500', '#800000']; // Fiery red
    if (level === 11) return ['#9932CC', '#4B0082']; // Deep purple
    return ['#00BFFF', '#0000CD']; // Deep blue
  };

  // Handle manual close
  const handleManualClose = () => {
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  return (
    <View style={styles.container}>
      {/* Semi-transparent background - Made touchable to allow forced closing */}
      <TouchableOpacity 
        activeOpacity={1}
        style={StyleSheet.absoluteFill}
        onPress={handleManualClose}
      >
        <Animated.View 
          style={[
            styles.background,
            { opacity: backgroundOpacity }
          ]} 
        />
      </TouchableOpacity>

      {/* Confetti */}
      {confetti.map((piece) => (
        <ConfettiPiece
          key={piece.id}
          centerX={piece.centerX}
          color={piece.color}
          size={piece.size}
          delay={piece.delay}
        />
      ))}

      {/* Level Up Text */}
      <Animated.View
        style={[
          styles.levelUpContainer,
          {
            transform: [
              { translateY: labelY },
              { scale: labelScale }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={getTextGradient()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.levelUpGradient}
        >
          <Text style={styles.levelUpText}>LEVEL UP!</Text>
          <Text style={styles.newLevelText}>
            {`LEVEL ${level}: ${getLevelName()}`}
          </Text>
          
          {/* Close button */}
          <TouchableOpacity 
            onPress={handleManualClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Tap to continue</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000'
  },
  confettiPiece: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  confettiCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  confettiSquare: {
    width: 10,
    height: 10,
  },
  confettiTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  levelUpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8
  },
  levelUpGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  levelUpText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4
  },
  newLevelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  }
});

export default LevelUpCelebration;