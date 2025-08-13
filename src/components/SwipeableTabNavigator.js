// src/components/SwipeableTabNavigator.js
import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

const SwipeableTabNavigator = ({ 
  children, 
  navigation, 
  state, 
  swipeThreshold = 50, // Minimum swipe distance to trigger navigation
  velocityThreshold = 300 // Minimum swipe velocity to trigger navigation
}) => {
  // Track whether we've handled this gesture to prevent multiple triggers
  const gestureHandled = useRef(false);

  const handleGestureStateChange = (event) => {
    const { nativeEvent } = event;
    
    // Only handle when gesture ends
    if (nativeEvent.state === State.END) {
      const { translationX, velocityX, translationY } = nativeEvent;
      
      // Prevent handling the same gesture multiple times
      if (gestureHandled.current) {
        gestureHandled.current = false;
        return;
      }

      // Check if this is primarily a horizontal swipe
      // Ignore if vertical swipe is too large compared to horizontal
      if (Math.abs(translationY) > Math.abs(translationX) * 0.5) {
        return;
      }

      // Determine if swipe meets threshold criteria
      const isSignificantSwipe = Math.abs(translationX) > swipeThreshold;
      const isFastSwipe = Math.abs(velocityX) > velocityThreshold;
      
      if (isSignificantSwipe || isFastSwipe) {
        const currentIndex = state.index;
        const totalTabs = state.routes.length;
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
        if (targetIndex !== null) {
          gestureHandled.current = true;
          
          // Haptic feedback for tab change
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          
          // Navigate to the target tab
          const targetRoute = state.routes[targetIndex];
          navigation.navigate({ name: targetRoute.name, merge: true });
        }
      }
    }
  };

  return (
    <PanGestureHandler
      onHandlerStateChange={handleGestureStateChange}
      activeOffsetX={[-20, 20]} // Only activate when horizontal movement exceeds 20px
      failOffsetY={[-50, 50]} // Fail if vertical movement exceeds 50px
      shouldCancelWhenOutside={true}
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