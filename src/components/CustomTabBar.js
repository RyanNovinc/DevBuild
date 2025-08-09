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
  
  // Animation values
  const fadeAnim = useRef(state.routes.map(() => new Animated.Value(0))).current;
  const scaleAnim = useRef(state.routes.map(() => new Animated.Value(1))).current;
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  
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

  return (
    <View 
      style={[
        styles.tabBar, 
        { 
          backgroundColor: theme.card, 
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

        // Determine icon to show
        let iconName;
        if (options.tabBarIcon) {
          iconName = options.tabBarIcon({ 
            focused: isFocused, 
            color: isFocused ? theme.primary : theme.textSecondary, 
            size: scaleWidth(24) // Keep original size but make it responsive
          }).props.name;
        }

        const onPress = () => {
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
                  opacity: fadeAnim[index],
                  transform: [{ scale: scaleAnim[index] }],
                  padding: scaleWidth(8) // Match original padding
                }
              ]}
            >
              <Ionicons 
                name={iconName} 
                size={scaleWidth(24)} 
                color={isFocused ? theme.primary : theme.textSecondary} 
              />
              
              {/* Only show label for focused tab - keep original behavior */}
              {isFocused && (
                <Animated.Text 
                  style={[
                    styles.tabLabel,
                    { 
                      color: theme.primary,
                      opacity: fadeAnim[index],
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