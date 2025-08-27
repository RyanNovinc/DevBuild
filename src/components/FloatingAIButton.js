// src/components/FloatingAIButton.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  scaleWidth,
  scaleHeight,
  spacing,
  useScreenDimensions,
  useIsLandscape,
  useSafeSpacing,
  accessibility
} from '../utils/responsive';

// Global variable for kanban full-screen visibility control
if (typeof window !== 'undefined') {
  window.aiButtonVisible = true;
}

const FloatingAIButton = ({ theme, hideDuringTour = false }) => {
  // State hooks
  const [showAIButton, setShowAIButton] = useState(true);
  const [kanbanFullScreenHidden, setKanbanFullScreenHidden] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  
  // Refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(1)).current;
  const checkInterval = useRef(null);
  
  // Navigation
  const navigation = useNavigation();
  const route = useRoute();
  
  // Responsive dimensions and spacing
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  const safeSpacing = useSafeSpacing();
  
  // Button size - ensure it meets minimum touch target requirements
  const buttonSize = Math.max(scaleWidth(56), accessibility.minTouchTarget);
  
  // Screens where the button should be hidden
  const hideButtonScreens = ['AIAssistant', 'Conversations', 'TimeBlock'];
  
  // Current route name - check for nested routes
  const getCurrentRouteName = () => {
    const focusedRouteName = getFocusedRouteNameFromRoute(route);
    return focusedRouteName || route.name;
  };
  
  const currentRouteName = getCurrentRouteName();
  
  // Check if we're currently in a nested TimeBlock screen
  const isInTimeBlockScreen = () => {
    // Direct route check
    if (currentRouteName === 'TimeBlock' || route.name === 'TimeBlock') {
      return true;
    }
    
    // Check nested routes - if we're in TimeTab and there's navigation state
    if (route.state && route.state.routes) {
      const nestedRoute = route.state.routes[route.state.index];
      if (nestedRoute && nestedRoute.name === 'TimeBlock') {
        return true;
      }
      
      // Check deeper nesting
      if (nestedRoute && nestedRoute.state && nestedRoute.state.routes) {
        const deepNestedRoute = nestedRoute.state.routes[nestedRoute.state.index];
        if (deepNestedRoute && deepNestedRoute.name === 'TimeBlock') {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // Set up global method for controlling visibility from kanban view
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.setAIButtonVisible) {
      window.setAIButtonVisible = (visible) => {
        window.aiButtonVisible = visible;
        setKanbanFullScreenHidden(!visible);
        
        // Animate opacity based on visibility
        Animated.timing(buttonOpacity, {
          toValue: visible ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      };
    }
  }, []);
  
  // Load AI button visibility setting
  useEffect(() => {
    const checkButtonVisibility = async () => {
      try {
        const value = await AsyncStorage.getItem('showAIButton');
        // console.log('AI button visibility setting:', value);
        setShowAIButton(value === null ? true : value === 'true');
      } catch (error) {
        console.error('Error checking AI button visibility:', error);
        setShowAIButton(true);
      }
      
      // Also check if kanban full-screen mode is active
      if (typeof window !== 'undefined') {
        setKanbanFullScreenHidden(!window.aiButtonVisible);
      }
      
      // Check if app tour is active - with smooth fade in when tour ends
      const wasTourActive = isTourActive;
      const isTourCurrentlyActive = global.isAppTourActive || false;
      setIsTourActive(isTourCurrentlyActive);
      
      // If tour just ended (was active, now inactive), fade in the button
      if (wasTourActive && !isTourCurrentlyActive) {
        console.log('🎯 Tour just ended - fading in AI button');
        // Start with button invisible then fade in
        buttonOpacity.setValue(0);
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 1000, // 1 second fade in
          useNativeDriver: true,
        }).start();
      }
    };
    
    // Set up global trigger function for tour completion
    global.triggerAIButtonCheck = checkButtonVisibility;
    
    // Initial check
    checkButtonVisibility();
    
    // Set up interval for regular checking
    checkInterval.current = setInterval(checkButtonVisibility, 1000);
    
    // Set up navigation focus listener
    const unsubscribe = navigation.addListener('focus', checkButtonVisibility);
    
    // Cleanup
    return () => {
      clearInterval(checkInterval.current);
      unsubscribe();
      delete global.triggerAIButtonCheck;
    };
  }, [navigation, isTourActive]);
  
  // Check if button should be hidden (moved before animation effect)
  const shouldHideButton = 
    hideButtonScreens.includes(currentRouteName) || 
    hideButtonScreens.includes(route.name) || 
    !showAIButton ||
    kanbanFullScreenHidden ||
    hideDuringTour ||
    isTourActive;
  
  // Animation reference to store current running animation
  const currentAnimation = useRef(null);
  
  // Pulse animation (slower than onboarding sparkle icon)
  useEffect(() => {
    const startPulseAnimation = () => {
      // Stop any existing animation first
      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }
      
      // Reset pulse to initial state
      pulseAnim.setValue(1);
      
      // Create and start new animation loop
      currentAnimation.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1500,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true
          })
        ])
      );
      
      currentAnimation.current.start();
      console.log('🎯 FloatingAI: Started pulse animation');
    };
    
    // Only start animation if tour is not active and button should be visible
    if (!isTourActive && !shouldHideButton) {
      startPulseAnimation();
    }
    
    // Cleanup function to stop animation when component unmounts or effect re-runs
    return () => {
      if (currentAnimation.current) {
        currentAnimation.current.stop();
        currentAnimation.current = null;
      }
    };
  }, [isTourActive, shouldHideButton]); // Dependencies to restart animation when needed
  
  // Press handler - navigate to AI Assistant
  const handlePress = () => {
    navigation.navigate('AIAssistant');
  };
  
  // Don't render anything if button should be hidden
  if (shouldHideButton) {
    return null;
  }
  
  // Calculate position based on screen size and orientation
  const positionStyles = {
    // In landscape, adjust position to be centered vertically and near right edge
    // In portrait, position at the standard location near bottom-right
    bottom: isLandscape ? (height / 2) - (buttonSize / 2) : safeSpacing.bottom + scaleHeight(40),
    right: safeSpacing.right,
  };
  
  // Render the white circular button with pulsating sparkles
  return (
    <Animated.View style={[
      styles.container,
      positionStyles,
      { opacity: buttonOpacity }
    ]}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.floatingButton, { width: buttonSize, height: buttonSize }]}
          onPress={handlePress}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Open AI Assistant"
          accessibilityHint="Navigates to the AI Assistant screen"
        >
          <Ionicons name="sparkles" size={scaleWidth(24)} color="#FFD700" />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 999,
  },
  floatingButton: {
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)', // Subtle border for definition
  }
});

export default FloatingAIButton;