// src/screens/TimeScreen/ImprovedSwipeableViews.js
import React, { useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Simplified SwipeableViews component with cleaner animations
 * Based on the TodoListScreen content swiping approach
 */
const ImprovedSwipeableViews = ({ selectedView, onViewChange, sharedTranslateX, dayView, weekView, monthView }) => {
  // Get current view index
  const getViewIndex = (view) => {
    switch (view) {
      case 'day': return 0;
      case 'week': return 1;
      case 'month': return 2;
      default: return 0;
    }
  };
  
  const currentIndex = getViewIndex(selectedView);
  
  // Store last velocity for smoother animations
  const lastVelocity = useRef(0);
  
  // Handle pan gesture with optimized calculations
  const handlePanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: sharedTranslateX } }],
    { 
      useNativeDriver: true,
      listener: (event) => {
        // Store velocity for use in state change
        lastVelocity.current = event.nativeEvent.velocityX;
      }
    }
  );
  
  // Handle gesture end with simplified logic
  const handlePanGestureStateChange = (event) => {
    const { nativeEvent } = event;
    
    if (nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = nativeEvent;
      const velocity = lastVelocity.current;
      
      // Determine threshold for swipe - lower threshold for high velocity
      const velocityThreshold = 500;
      const positionThreshold = SCREEN_WIDTH * 0.3;
      
      let targetIndex = currentIndex;
      
      // Right to left swipe (next view)
      if ((translationX < -positionThreshold || velocity < -velocityThreshold) && currentIndex < 2) {
        targetIndex = currentIndex + 1;
      } 
      // Left to right swipe (previous view)
      else if ((translationX > positionThreshold || velocity > velocityThreshold) && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      }
      
      // Calculate final position based on index
      const finalPosition = -targetIndex * SCREEN_WIDTH;
      
      // Animate to final position with spring
      Animated.spring(sharedTranslateX, {
        toValue: finalPosition,
        tension: 70,
        friction: 12,
        useNativeDriver: true,
      }).start(() => {
        // Notify parent of view change if needed
        if (targetIndex !== currentIndex) {
          // Convert index to view name
          let newView;
          switch (targetIndex) {
            case 0: newView = 'day'; break;
            case 1: newView = 'week'; break;
            case 2: newView = 'month'; break;
            default: newView = 'day';
          }
          
          onViewChange(newView);
        }
      });
    }
  };
  
  return (
    <PanGestureHandler
      onGestureEvent={handlePanGestureEvent}
      onHandlerStateChange={handlePanGestureStateChange}
    >
      <Animated.View 
        style={[
          styles.viewsContainer,
          { transform: [{ translateX: sharedTranslateX }] }
        ]}
      >
        <View style={styles.viewItem}>
          {dayView}
        </View>
        <View style={styles.viewItem}>
          {weekView}
        </View>
        <View style={styles.viewItem}>
          {monthView}
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  viewsContainer: {
    flex: 1,
    flexDirection: 'row',
    width: SCREEN_WIDTH * 3,
  },
  viewItem: {
    width: SCREEN_WIDTH,
    height: '100%',
  }
});

export default ImprovedSwipeableViews;