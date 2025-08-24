// src/components/CustomTabBar.js - OPTIMIZED VERSION
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Animated, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  scaleWidth, 
  scaleHeight, 
  fontSizes,
  spacing,
  useScreenDimensions,
  accessibility
} from '../utils/responsive';

/**
 * CustomTabBar - A drop-in replacement for the default tab bar
 * with enhanced animations and visual effects
 */
const CustomTabBar = ({ state, descriptors, navigation, theme }) => {
  // Get screen dimensions and safe area insets
  const { width } = useScreenDimensions();
  const insets = useSafeAreaInsets();
  
  // Check if tour is active and requesting tab highlighting
  const isTourHighlightingTabs = global.tourShouldFlashToDoTab || false;
  
  // Debug logging
  if (isTourHighlightingTabs) {
    console.log('🎯 CustomTabBar: Tour is highlighting tabs, starting animation');
  }
  
  // Animation values
  const fadeAnim = useRef(state.routes.map((_, i) => new Animated.Value(i === state.index ? 1 : 0.7))).current;
  const scaleAnim = useRef(state.routes.map((_, i) => new Animated.Value(i === state.index ? 1.15 : 1))).current;
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  
  // Tour animation values
  const todoTabPulse = useRef(new Animated.Value(1)).current;
  
  // Tab indicator width and spacing
  const tabWidth = width / state.routes.length;
  const indicatorWidth = tabWidth * 0.6; // Make indicator slightly smaller than tab
  const indicatorOffset = (tabWidth - indicatorWidth) / 2;

  // Calculate bottom padding to match original while supporting home indicator
  const bottomPadding = Platform.OS === 'ios' ? 
    (insets.bottom > 0 ? insets.bottom : scaleHeight(15)) : 0;

  // Animate indicator on tab change
  useEffect(() => {
    // Update indicator position
    Animated.spring(tabIndicatorPosition, {
      toValue: state.index * tabWidth + indicatorOffset,
      tension: 68,
      friction: 10,
      useNativeDriver: true,
    }).start();
    
    // Animate tab icons
    state.routes.forEach((_, i) => {
      // Fade out non-active tabs
      Animated.timing(fadeAnim[i], {
        toValue: i === state.index ? 1 : 0.7,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // Scale up active tab, scale down others
      Animated.spring(scaleAnim[i], {
        toValue: i === state.index ? 1.15 : 1,
        tension: 300,
        friction: 18,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index]);
  
  // Handle tour tab highlighting - no animation, just keep icon visible
  useEffect(() => {
    if (isTourHighlightingTabs) {
      console.log('🎯 CustomTabBar: Tour highlighting tabs - no animation');
      todoTabPulse.setValue(1); // Keep at normal size
    } else {
      todoTabPulse.setValue(1);
    }
  }, [isTourHighlightingTabs]);

  return (
    <View 
      style={[
        styles.tabBar, 
        { 
          backgroundColor: theme.background, 
          borderTopColor: theme.border,
          paddingBottom: bottomPadding,
          marginBottom: -20, // Add this line to lower it by 20 points
        }
      ]}
      accessible={true}
      accessibilityRole="tablist"
      accessibilityLabel="Main navigation tabs"
    >
      {/* Tab Indicator - floating pill style */}
      <Animated.View 
        style={[
          styles.tabIndicator, 
          {
            width: indicatorWidth,
            backgroundColor: theme.primary,
            transform: [{ translateX: tabIndicatorPosition }],
            height: scaleHeight(4),
            borderRadius: scaleWidth(8),
            // Keep original positioning
            bottom: Platform.OS === 'ios' ? 
              (insets.bottom > 0 ? insets.bottom + scaleHeight(5) : scaleHeight(20)) : 
              scaleHeight(6)
          }
        ]} 
        accessibilityElementsHidden={true}
        importantForAccessibility="no"
      />
      
      {/* Tab Buttons */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        // Get the icon component to render
        let iconComponent = null;
        if (options.tabBarIcon) {
          // Debug logging for TodoTab during tour
          if (route.name === 'TodoTab' && isTourHighlightingTabs) {
            const currentView = route.params?.currentView || 'todo';
            console.log('🎯 CustomTabBar: TOUR DEBUGGING - route.params:', route.params);
            console.log('🎯 CustomTabBar: TOUR DEBUGGING - currentView:', currentView);
            console.log('🎯 CustomTabBar: TOUR DEBUGGING - should show CHECKBOX icon for todo, DOCUMENT icon for notes');
          }
          // Determine the appropriate color based on tour state and focus
          const iconColor = isTourHighlightingTabs && route.name !== 'TodoTab'
            ? theme.textSecondary // Keep darkened tabs with secondary color
            : isTourHighlightingTabs && route.name === 'TodoTab'
            ? theme.primary // Highlight TodoTab with primary color during tour
            : isFocused ? theme.primary : theme.textSecondary; // Normal behavior
            
          iconComponent = options.tabBarIcon({ 
            focused: isFocused, 
            color: iconColor, 
            size: scaleWidth(24) // Keep original size but make it responsive
          });
        }

        const onPress = () => {
          // Normal tab behavior during tour
          
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // Haptic feedback on tab press
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            
            // Navigate to the route
            navigation.navigate({ name: route.name, merge: true });
          } else if (isFocused && route.name === 'TodoTab') {
            // Handle tap on already selected Todo tab - toggle between todo/notes view
            try {
              // Haptic feedback for toggle
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              
              // Get current view from route params
              const currentView = route.params?.currentView || 'todo';
              const newView = currentView === 'todo' ? 'notes' : 'todo';
              
              // Navigate with updated params to trigger view toggle
              navigation.navigate({
                name: route.name,
                params: { currentView: newView },
                merge: true
              });
            } catch (error) {
              console.log('Error toggling TodoTab view:', error);
            }
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={`${label} tab`}
            accessibilityHint={isFocused ? "Current tab" : `Double tap to go to ${label} tab`}
            onPress={onPress}
            style={[
              styles.tabButton,
              {
                minHeight: accessibility.minTouchTarget, // For accessibility
                paddingVertical: scaleHeight(8) // Match original padding
              }
            ]}
            activeOpacity={0.7}
          >
            <Animated.View 
              style={[
                styles.iconContainer,
                {
                  opacity: isTourHighlightingTabs && route.name === 'TodoTab'
                    ? 1 // Force TodoTab to full opacity during tour
                    : isTourHighlightingTabs && route.name !== 'TodoTab' 
                    ? 0.3 // Darken all tabs except TodoTab during tour
                    : fadeAnim[index],
                  transform: [
                    { scale: (isTourHighlightingTabs && route.name === 'TodoTab') 
                      ? 1 // Keep TodoTab at normal size during tour - no pulse animation
                      : scaleAnim[index] }
                  ],
                  padding: scaleWidth(8) // Match original padding
                }
              ]}
            >
              {iconComponent}
              
              {/* Only show label for focused tab - keep original behavior */}
              {isFocused && (
                <Animated.Text 
                  style={[
                    styles.tabLabel,
                    { 
                      color: isTourHighlightingTabs && route.name !== 'TodoTab'
                        ? theme.textSecondary // Darken label for non-TodoTab during tour
                        : theme.primary,
                      opacity: isTourHighlightingTabs && route.name !== 'TodoTab' 
                        ? 0.3 // Darken label opacity for non-TodoTab during tour
                        : fadeAnim[index],
                      fontSize: scaleWidth(10), // Match original font size
                      marginTop: scaleHeight(2) // Match original spacing
                    }
                  ]}
                  maxFontSizeMultiplier={1.3} // For Dynamic Type
                >
                  {label}
                </Animated.Text>
              )}
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    // Bottom padding handled dynamically
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    // Other properties handled inline
  },
});

export default CustomTabBar;