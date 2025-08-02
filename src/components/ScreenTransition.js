// src/components/ScreenTransition.js
import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, Platform } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Screen Transition Wrapper Component
 * Adds smooth fade and slide transitions to screens when navigating between tabs
 * 
 * Usage:
 * Wrap your screen content with this component:
 * 
 * <ScreenTransition>
 *   <YourScreenContent />
 * </ScreenTransition>
 */
const ScreenTransition = ({ 
  children, 
  duration = 300, 
  slideOffset = 20,
  animationType = 'fade-slide', // 'fade', 'slide', 'fade-slide', 'none'
  respectTabBar = true // Whether to add padding for the tab bar
}) => {
  // Animation values
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slideOffset)).current;
  
  // Check if screen is focused
  const isFocused = useIsFocused();
  
  // Get safe area insets for proper padding
  const insets = useSafeAreaInsets();
  
  // Run animations when focus changes
  useEffect(() => {
    if (isFocused) {
      // Screen is coming into focus - animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: animationType === 'none' ? 0 : duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: (animationType === 'fade-slide' || animationType === 'slide') ? duration : 0,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Reset animation values for next entry
      opacity.setValue(0);
      translateY.setValue(slideOffset);
    }
  }, [isFocused]);
  
  // Don't animate if animation type is none
  if (animationType === 'none') {
    return children;
  }
  
  // Calculate transform array based on animation type
  const getTransform = () => {
    if (animationType === 'fade') {
      return [];
    }
    return [{ translateY }];
  };

  // Determine bottom padding based on tab bar height and safe area
  // The tab bar is now using relative positioning, so we only need to account for
  // the standard tab bar height (55px) plus any safe area insets
  const tabBarHeight = 55;
  const bottomPadding = respectTabBar 
    ? tabBarHeight + (Platform.OS === 'ios' ? insets.bottom : 0)
    : insets.bottom;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: animationType === 'slide' ? 1 : opacity,
          transform: getTransform(),
          // Only add padding if needed - our tab bar is now part of the standard layout
          paddingBottom: respectTabBar ? bottomPadding : 0,
        }
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenTransition;