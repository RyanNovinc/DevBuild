// src/components/GlobalAchievementToast.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  Dimensions,
  Platform,
  PanResponder
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { subscribeToAchievementNotifications, completeNotification } from '../services/AchievementNotificationManager';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Set to true for extra logging
const DEBUG_MODE = true;

const logDebug = (...args) => {
  if (DEBUG_MODE) {
    console.log('[GlobalAchievementToast]', ...args);
  }
};

const GlobalAchievementToast = () => {
  const [visible, setVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  // Create a PanResponder for swipe-to-dismiss functionality
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to vertical movements
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (evt, gestureState) => {
        // If swiping up, move the toast with the gesture
        if (gestureState.dy < 0) {
          // Limit the movement to avoid excessive drag
          const newPosition = Math.max(gestureState.dy, -100);
          translateY.setValue(newPosition);
          
          // Calculate opacity based on position (fade out as it moves up)
          const newOpacity = 1 - Math.min(1, Math.abs(newPosition) / 100);
          opacity.setValue(newOpacity);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // If swiped up enough, dismiss the toast
        if (gestureState.dy < -30) {
          logDebug('Swipe up detected, hiding toast');
          hideToast();
        } else {
          // Otherwise, snap back to original position
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              friction: 5,
              tension: 40,
              useNativeDriver: true
            }),
            Animated.spring(opacity, {
              toValue: 1,
              friction: 5,
              tension: 40,
              useNativeDriver: true
            })
          ]).start();
        }
      }
    })
  ).current;
  
  // Handle showing a notification
  const handleShowNotification = (achievement) => {
    logDebug('Received notification:', achievement?.title || 'Unknown achievement');
    console.log('ACHIEVEMENT TOAST: Showing notification for:', achievement?.title);
    
    if (!achievement) {
      logDebug('Invalid achievement data received');
      return;
    }
    
    setCurrentAchievement(achievement);
    showToast();
  };
  
  // Navigate to achievements screen and switch to Achievements tab
  const navigateToAchievementsScreen = () => {
    logDebug('Navigating to achievements screen with achievements tab active');
    hideToast();
    
    // Short delay to allow animation to start before navigation
    setTimeout(() => {
      navigation.navigate('AchievementsScreen', { 
        activeTab: 'achievements', // Parameter to indicate which tab to show
        highlightAchievement: currentAchievement?.id, // Pass the specific achievement ID
        focusCategory: currentAchievement?.category // Also pass the category to expand
      });
    }, 100);
  };
  
  // Subscribe to achievement notifications
  useEffect(() => {
    logDebug('Setting up achievement notification subscriber');
    console.log('ACHIEVEMENT TOAST: Setting up notification subscriber');
    
    // Subscribe to notifications
    const unsubscribe = subscribeToAchievementNotifications(handleShowNotification);
    
    // Note: Test achievement code removed to prevent annoying popups
    
    // Clean up subscription on unmount
    return () => {
      logDebug('Cleaning up achievement notification subscriber');
      unsubscribe();
    };
  }, []);
  
  // Show the toast with animation
  const showToast = () => {
    logDebug('Showing toast');
    console.log('ACHIEVEMENT TOAST: Starting show animation');
    setVisible(true);
    
    // Reset opacity and translateY before animation
    opacity.setValue(0);
    translateY.setValue(-100);
    
    // Parallel animations for smooth entry
    Animated.parallel([
      // Slide in
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      }),
      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
    
    // Start the auto-hide timer
    const hideTimer = setTimeout(() => {
      hideToast();
    }, 4000); // Show for 4 seconds
    
    return () => clearTimeout(hideTimer);
  };
  
  // Hide the toast with smooth animation
  const hideToast = () => {
    logDebug('Hiding toast with animation');
    
    // Parallel animations for smooth exit
    Animated.parallel([
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }),
      // Slight upward movement while fading
      Animated.timing(translateY, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      logDebug('Toast animation completed');
      setVisible(false);
      setCurrentAchievement(null);
      completeNotification();
    });
  };
  
  // Don't render anything if not visible
  if (!visible || !currentAchievement) return null;
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ translateY }],
          opacity,
          marginTop: insets.top > 0 ? insets.top : 20,
          // Ensure it's above everything else
          zIndex: 10000,
          elevation: 10,
        }
      ]}
      accessible={true}
      accessibilityLiveRegion="assertive"
      accessibilityLabel={`Achievement unlocked: ${currentAchievement.title}`}
      {...panResponder.panHandlers} // Apply pan responder for swipe gestures
    >
      <TouchableOpacity 
        style={styles.toastContent}
        activeOpacity={0.8}
        onPress={navigateToAchievementsScreen}
        accessibilityRole="button"
        accessibilityHint="Tap to view achievement details"
      >
        <View style={[styles.iconContainer, { backgroundColor: currentAchievement.color || '#4CAF50' }]}>
          <Ionicons 
            name={currentAchievement.icon || "trophy"} 
            size={24} 
            color="#FFFFFF" 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {currentAchievement.title || 'Achievement Unlocked'}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
            Achievement Unlocked
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, // Increased shadow opacity
    shadowRadius: 8,
    elevation: 8, // Increased elevation
    width: width - 30,
    maxWidth: 500,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  iconContainer: {
    width: 44, // Slightly larger
    height: 44, // Slightly larger
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  }
});

export default GlobalAchievementToast;