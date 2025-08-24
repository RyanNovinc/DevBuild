// src/components/SwipeableTabNavigator.js
import React, { useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const SwipeableTabNavigator = ({ 
  children, 
  swipeThreshold = 60, // Increased threshold for more intentional swipes
  velocityThreshold = 400, // Increased velocity threshold
  disabled = false // Disable swiping when needed (e.g., during tour)
}) => {
  // Use navigation hook instead of prop
  const navigation = useNavigation();
  
  // Get current navigation state
  const navigationState = useNavigationState(state => state);
  
  // Track whether we've handled this gesture to prevent multiple triggers
  const gestureHandled = useRef(false);
  const lastSwipeTime = useRef(0);

  const handleGestureStateChange = useCallback((event) => {
    // Don't handle gestures if disabled
    if (disabled) {
      return;
    }
    
    const { nativeEvent } = event;
    
    // Only handle when gesture ends
    if (nativeEvent.state === State.END) {
      const { translationX, velocityX, translationY } = nativeEvent;
      const now = Date.now();
      
      // Prevent handling the same gesture multiple times or too quickly
      if (gestureHandled.current || (now - lastSwipeTime.current < 300)) {
        gestureHandled.current = false;
        return;
      }

      // Check if this is primarily a horizontal swipe
      // Ignore if vertical swipe is too large compared to horizontal
      if (Math.abs(translationY) > Math.abs(translationX) * 0.7) {
        return;
      }

      // Determine if swipe meets threshold criteria
      const isSignificantSwipe = Math.abs(translationX) > swipeThreshold;
      const isFastSwipe = Math.abs(velocityX) > velocityThreshold;
      
      if ((isSignificantSwipe || isFastSwipe) && navigationState) {
        // Get the tab navigation state
        const tabState = navigationState.routes?.[navigationState.index]?.state;
        if (!tabState || !tabState.routes) return;

        const currentIndex = tabState.index || 0;
        const totalTabs = tabState.routes.length;
        let targetIndex = null;

        // Swipe right (positive translationX) - go to previous tab
        if (translationX > 0 && currentIndex > 0) {
          targetIndex = currentIndex - 1;
        }
        // Swipe left (negative translationX) - go to next tab  
        else if (translationX < 0 && currentIndex < totalTabs - 1) {
          targetIndex = currentIndex + 1;
        }

        // Navigate to target tab if valid
        if (targetIndex !== null && navigation) {
          gestureHandled.current = true;
          lastSwipeTime.current = now;
          
          // Haptic feedback for tab change
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          
          // Navigate to the target tab
          const targetRoute = tabState.routes[targetIndex];
          navigation.navigate(targetRoute.name);
          
          // Reset gesture handler flag after a delay
          setTimeout(() => {
            gestureHandled.current = false;
          }, 100);
        }
      }
    }
  }, [navigation, navigationState, swipeThreshold, velocityThreshold, disabled]);

  return (
    <PanGestureHandler
      onHandlerStateChange={handleGestureStateChange}
      activeOffsetX={[-15, 15]} // Only activate when horizontal movement exceeds 15px
      failOffsetY={[-60, 60]} // Fail if vertical movement exceeds 60px
      shouldCancelWhenOutside={true}
      minPointers={1}
      maxPointers={1}
    >
      <View style={styles.container}>
        {children}
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SwipeableTabNavigator;