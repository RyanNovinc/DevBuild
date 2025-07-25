// src/screens/AchievementsScreen/components/LevelTrophy.js
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Easing } from 'react-native'; // Make sure Easing is imported separately
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const LevelTrophy = ({ level = 1, size = 80, animate = false }) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Run animation when level changes or animate prop is true
  useEffect(() => {
    if (animate) {
      // Sequence of animations
      Animated.sequence([
        // Scale up
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        // Rotate slightly back and forth
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease)
        }),
        // Scale back down
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start();

      // Pulse glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease)
          })
        ]),
        { iterations: 3 }
      ).start();
    }
  }, [level, animate, scaleAnim, rotateAnim, glowAnim]);

  // Rotation interpolation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '-5deg', '0deg', '5deg', '0deg']
  });

  // Helper to get trophy config based on level
  const getTrophyConfig = () => {
    const configs = {
      1: {
        icon: 'medal-outline',
        gradient: ['#CD7F32', '#8B4513'],
        name: 'Beginner'
      },
      2: {
        icon: 'star-outline',
        gradient: ['#CD7F32', '#A0522D'],
        name: 'Intermediate'
      },
      3: {
        icon: 'medal',
        gradient: ['#C0C0C0', '#A9A9A9'],
        name: 'Professional'
      },
      4: {
        icon: 'ribbon-outline',
        gradient: ['#FFD700', '#DAA520'],
        name: 'Expert'
      },
      5: {
        icon: 'trophy-outline',
        gradient: ['#FFD700', '#B8860B'],
        name: 'Master'
      },
      6: {
        icon: 'trophy',
        gradient: ['#FFD700', '#FF8C00'],
        name: 'Grand Master'
      },
      7: {
        icon: 'leaf',
        gradient: ['#E6E6FA', '#9370DB'],
        name: 'Champion'
      },
      8: {
        icon: 'crown-outline',
        gradient: ['#4169E1', '#000080'],
        name: 'Legend'
      },
      9: {
        icon: 'diamond-outline',
        gradient: ['#B0E0E6', '#4682B4'],
        name: 'Hero'
      },
      10: {
        icon: 'flame',
        gradient: ['#FF4500', '#800000'],
        name: 'Immortal'
      },
      11: {
        icon: 'planet-outline',
        gradient: ['#9932CC', '#4B0082'],
        name: 'Ascendant'
      },
      12: {
        icon: 'infinite',
        gradient: ['#00BFFF', '#0000CD'],
        name: 'Eternal'
      }
    };

    // Fallback to level 1 if the level is invalid
    return configs[level] || configs[1];
  };

  const trophyConfig = getTrophyConfig();
  const iconSize = Math.round(size * 0.5);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [
            { scale: scaleAnim },
            { rotate: rotate }
          ]
        }
      ]}
    >
      {/* Background Glow for higher levels */}
      {level >= 5 && (
        <Animated.View
          style={[
            styles.glowContainer,
            {
              width: size * 1.4,
              height: size * 1.4,
              borderRadius: size * 0.7,
              opacity: glowAnim,
              backgroundColor: trophyConfig.gradient[0],
              transform: [{ scale: glowAnim }]
            }
          ]}
        />
      )}

      {/* Trophy Circle Background */}
      <LinearGradient
        colors={trophyConfig.gradient}
        style={[
          styles.gradient,
          {
            width: size,
            height: size,
            borderRadius: size / 2
          }
        ]}
      >
        <Ionicons
          name={trophyConfig.icon}
          size={iconSize}
          color="#FFFFFF"
        />
      </LinearGradient>

      {/* Special Effects for Highest Levels */}
      {level >= 10 && (
        <View style={styles.specialEffects}>
          <Ionicons
            name="sparkles"
            size={iconSize * 0.4}
            color="#FFFFFF"
            style={[styles.sparkle, { top: 0, right: 5 }]}
          />
          <Ionicons
            name="sparkles"
            size={iconSize * 0.4}
            color="#FFFFFF"
            style={[styles.sparkle, { bottom: 5, left: 0 }]}
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  gradient: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  glowContainer: {
    position: 'absolute',
    opacity: 0.3,
    zIndex: -1
  },
  specialEffects: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 10
  },
  sparkle: {
    position: 'absolute'
  }
});

export default LevelTrophy;