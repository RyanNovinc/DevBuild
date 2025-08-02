// src/components/ProfileFadeWrapper.js - Updated to fade in from black
import React, { useEffect, useState, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext'; // Import properly, but don't use directly

/**
 * An enhanced component that adds fade-in animation to ProfileScreen,
 * coordinating with LoadingScreen to create a smooth black transition
 */
const ProfileFadeWrapper = (props) => {
  const { theme } = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current; // Content opacity
  const blackOverlayOpacity = useRef(new Animated.Value(1)).current; // Black overlay
  
  // Flag to track if animation is complete
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Effect to handle animation sequence
  useEffect(() => {
    const animateFromBlack = async () => {
      try {
        // Check if loading screen faded to black
        const loadingFadedToBlack = await AsyncStorage.getItem('loadingFadedToBlack');
        
        // First, make sure content is ready but invisible
        fadeAnim.setValue(0);
        blackOverlayOpacity.setValue(1);
        
        // Short delay to ensure component is mounted
        setTimeout(() => {
          // Sequence:
          // 1. First fade in the content (while black overlay is still visible)
          // 2. Then fade out the black overlay to reveal content
          Animated.sequence([
            // Step 1: Fade in the content (but still behind black overlay)
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 250,
              useNativeDriver: true,
            }),
            // Short pause
            Animated.delay(100),
            // Step 2: Fade out the black overlay to reveal the content
            Animated.timing(blackOverlayOpacity, {
              toValue: 0,
              duration: 600, // Longer duration for a smoother transition
              useNativeDriver: true,
            })
          ]).start(() => {
            // Animation complete
            setAnimationComplete(true);
            // Reset the flag for next time (app restart)
            AsyncStorage.removeItem('loadingFadedToBlack').catch(console.error);
          });
        }, 50);
      } catch (error) {
        console.error('ProfileFadeWrapper animation error:', error);
        // Fallback to no animation in case of error
        fadeAnim.setValue(1);
        blackOverlayOpacity.setValue(0);
        setAnimationComplete(true);
      }
    };
    
    animateFromBlack();
  }, []);
  
  // Render the ProfileScreen with animations
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* The ProfileScreen with fade-in effect */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ProfileScreen {...props} />
      </Animated.View>
      
      {/* Black overlay that starts fully opaque and fades out */}
      <Animated.View 
        style={[
          styles.blackOverlay, 
          { opacity: blackOverlayOpacity }
        ]} 
        pointerEvents={animationComplete ? "none" : "auto"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  blackOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 10, // Ensure overlay is above content
  }
});

export default ProfileFadeWrapper;