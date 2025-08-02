// src/components/AnimatedTabNavigator.js
import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Get screen dimensions
const { width } = Dimensions.get('window');

const Tab = createBottomTabNavigator();

/**
 * Enhanced Tab Navigator with smooth animations
 * Replaces the standard Tab.Navigator with custom animations
 */
const AnimatedTabNavigator = ({ 
  children, 
  theme, 
  screenOptions = {}, 
  state, 
  descriptors, 
  navigation,
  enableHaptics = true
}) => {
  // Animation values
  const tabPositionAnim = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const indicatorWidth = width / state.routes.length;

  // Animate when active tab changes
  useEffect(() => {
    // Animate to new tab position
    Animated.sequence([
      // Fade out content slightly
      Animated.timing(contentOpacity, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      // Move indicator
      Animated.spring(tabPositionAnim, {
        toValue: state.index,
        tension: 70,
        friction: 10,
        useNativeDriver: false,
      }),
      // Fade in content
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start();
  }, [state.index]);

  // Get active route
  const activeRoute = state.routes[state.index];
  const { options } = descriptors[activeRoute.key];
  
  // Icon animations for each tab
  const tabAnimations = useRef(
    state.routes.map(() => ({
      scale: new Animated.Value(state.index === 0 ? 1.2 : 1),
      opacity: new Animated.Value(1)
    }))
  ).current;

  // Animate tab icon when selected
  const animateTabIcon = (index) => {
    // Reset all tabs first
    tabAnimations.forEach((anim, i) => {
      if (i !== index) {
        Animated.parallel([
          Animated.timing(anim.scale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
          }),
          Animated.timing(anim.opacity, {
            toValue: 0.7,
            duration: 200,
            useNativeDriver: true
          })
        ]).start();
      }
    });

    // Animate the selected tab
    Animated.sequence([
      // Pop effect
      Animated.spring(tabAnimations[index].scale, {
        toValue: 1.3,
        tension: 300,
        friction: 10,
        useNativeDriver: true
      }),
      // Settle effect
      Animated.spring(tabAnimations[index].scale, {
        toValue: 1.2,
        tension: 100,
        friction: 10,
        useNativeDriver: true
      })
    ]).start();

    // Fade in
    Animated.timing(tabAnimations[index].opacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true
    }).start();
  };

  // Initialize icon animations
  useEffect(() => {
    state.routes.forEach((_, i) => {
      tabAnimations[i].scale.setValue(i === state.index ? 1.2 : 1);
      tabAnimations[i].opacity.setValue(i === state.index ? 1 : 0.7);
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Main Content with Animation */}
      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
        {/* This would be the actual screen content from Tab.Navigator */}
        {options.tabBarIcon && 
          <View style={styles.screenContainer}>
            {/* Actual screen content would go here via children */}
            {children}
          </View>
        }
      </Animated.View>

      {/* Custom Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        {/* Animated Tab Indicator */}
        <Animated.View 
          style={[
            styles.tabIndicator, 
            {
              backgroundColor: theme.primary,
              width: indicatorWidth - 20,
              transform: [{ 
                translateX: tabPositionAnim.interpolate({
                  inputRange: state.routes.map((_, i) => i),
                  outputRange: state.routes.map((_, i) => i * indicatorWidth + 10)
                }) 
              }]
            }
          ]} 
        />
        
        {/* Tab Buttons */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;

          // Handle icon display
          const iconProps = { 
            size: 24, 
            color: isFocused ? theme.primary : theme.textSecondary 
          };
          
          // Get icon name dynamically from options
          let iconName;
          if (options.tabBarIcon) {
            // This calls the tabBarIcon function with our props
            iconName = options.tabBarIcon({ 
              focused: isFocused, 
              color: iconProps.color, 
              size: iconProps.size 
            }).props.name;
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              // Trigger haptic feedback if enabled
              if (enableHaptics) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              
              // Animate the tab icon
              animateTabIcon(index);
              
              // Navigate to the tab
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabButton}
            >
              <Animated.View style={{
                transform: [{ scale: tabAnimations[index].scale }],
                opacity: tabAnimations[index].opacity
              }}>
                <Ionicons name={iconName} {...iconProps} />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
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
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 0.5,
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderRadius: 3,
  }
});

export default AnimatedTabNavigator;