// src/screens/TodoListScreen/components/TodoTabs.js
import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import responsive utilities
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  useScreenDimensions,
  isSmallDevice,
  accessibility,
} from '../../../utils/responsive';

/**
 * TodoTabs component for switching between Today, Tomorrow, and Later tabs
 * Modernized with animated indicator and icons
 * Optimized for performance with memoization
 */
const TodoTabs = memo(({ activeTab, setActiveTab, theme, tabIndicatorPosition }) => {
  // Get screen dimensions for responsive layout
  const { width } = useScreenDimensions();

  // Memoized tab information to prevent recalculation
  const tabInfo = useMemo(() => [
    { 
      id: 'today', 
      icon: 'today-outline', 
      label: 'Today',
      accessibilityLabel: "Today's tasks"
    },
    { 
      id: 'tomorrow', 
      icon: 'calendar-outline', 
      label: 'Tomorrow',
      accessibilityLabel: "Tomorrow's tasks"
    },
    { 
      id: 'later', 
      icon: 'time-outline', 
      label: 'Later',
      accessibilityLabel: "Later tasks"
    }
  ], []);

  // Calculate the width for each tab (subtract some padding to prevent overflow)
  const tabWidth = (width - scaleWidth(40)) / 3; // Subtract some padding to ensure tabs fit

  // Handle tab change with optimized accessibility support
  const handleTabPress = (tabId) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
    }
  };

  return (
    <View style={[
      styles.tabBar, 
      { 
        borderBottomWidth: 1, 
        borderBottomColor: theme.border,
        paddingVertical: isSmallDevice ? spacing.xxs : spacing.xs,
      }
    ]}>
      {/* Animated Indicator */}
      <Animated.View 
        style={[
          styles.tabIndicator, 
          { 
            backgroundColor: theme.primary,
            width: tabWidth,
            height: scaleHeight(3),
            transform: [{ translateX: tabIndicatorPosition }]
          }
        ]} 
      />
      
      {/* Tab Buttons */}
      {tabInfo.map(tab => (
        <TouchableOpacity 
          key={tab.id}
          style={[
            styles.tab, 
            { 
              width: tabWidth,
              minHeight: accessibility.minTouchTarget,
            }
          ]}
          onPress={() => handleTabPress(tab.id)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel={tab.accessibilityLabel}
          accessibilityState={{ selected: activeTab === tab.id }}
          accessibilityHint={`Switch to ${tab.label.toLowerCase()}'s tasks`}
        >
          <View style={styles.tabContent}>
            <Ionicons 
              name={tab.icon}
              size={scaleWidth(18)}
              color={activeTab === tab.id ? theme.primary : theme.textSecondary}
              style={styles.tabIcon}
            />
            <Text 
              style={[
                styles.tabText, 
                { 
                  color: activeTab === tab.id ? theme.primary : theme.textSecondary,
                  fontWeight: activeTab === tab.id ? '700' : '500',
                  fontSize: scaleFontSize(isSmallDevice ? 14 : 16),
                }
              ]}
              maxFontSizeMultiplier={1.3} // Limit Dynamic Type scaling
            >
              {tab.label}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    position: 'relative',
    marginBottom: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 3,
    borderRadius: 1.5,
  },
  tab: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default TodoTabs;