// src/screens/TodoListScreen/components/TodoTabs.js
import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../TodoListStyles';

// Import responsive utilities
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  useScreenDimensions,
  isSmallDevice,
  accessibility,
  ensureAccessibleTouchTarget
} from '../../../utils/responsive';

/**
 * TodoTabs component for switching between Today, Tomorrow, and Later tabs
 * Modernized with animated indicator and icons
 */
const TodoTabs = ({ activeTab, setActiveTab, theme, tabIndicatorPosition }) => {
  // Get screen dimensions for responsive layout
  const { width } = useScreenDimensions();

  // Get icon based on tab name
  const getTabIcon = (tab) => {
    switch (tab) {
      case 'today':
        return 'today-outline';
      case 'tomorrow':
        return 'calendar-outline';
      case 'later':
        return 'time-outline';
      default:
        return 'today-outline';
    }
  };

  // Determine if a tab is active
  const isTabActive = (tab) => activeTab === tab;

  // Calculate the width for each tab (subtract some padding to prevent overflow)
  const tabWidth = (width - scaleWidth(40)) / 3; // Subtract some padding to ensure tabs fit

  // Get accessibility label for each tab
  const getAccessibilityLabel = (tab) => {
    switch (tab) {
      case 'today':
        return "Today's tasks";
      case 'tomorrow':
        return "Tomorrow's tasks";
      case 'later':
        return "Later tasks";
      default:
        return `${tab} tasks`;
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
      
      {/* Today Tab */}
      <TouchableOpacity 
        style={[
          styles.tab, 
          { 
            width: tabWidth,
            minHeight: accessibility.minTouchTarget,
          }
        ]}
        onPress={() => setActiveTab('today')}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="tab"
        accessibilityLabel={getAccessibilityLabel('today')}
        accessibilityState={{ selected: isTabActive('today') }}
        accessibilityHint="Switch to today's tasks"
      >
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons 
            name={getTabIcon('today')}
            size={scaleWidth(18)}
            color={isTabActive('today') ? theme.primary : theme.textSecondary}
            style={{ marginRight: scaleWidth(6) }}
          />
          <Text 
            style={[
              styles.tabText, 
              { 
                color: isTabActive('today') ? theme.primary : theme.textSecondary,
                fontWeight: isTabActive('today') ? '700' : '500',
                fontSize: scaleFontSize(isSmallDevice ? 14 : 16),
                maxFontSizeMultiplier: 1.3, // Limit Dynamic Type scaling
              }
            ]}
          >
            Today
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Tomorrow Tab */}
      <TouchableOpacity 
        style={[
          styles.tab, 
          { 
            width: tabWidth,
            minHeight: accessibility.minTouchTarget,
          }
        ]}
        onPress={() => setActiveTab('tomorrow')}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="tab"
        accessibilityLabel={getAccessibilityLabel('tomorrow')}
        accessibilityState={{ selected: isTabActive('tomorrow') }}
        accessibilityHint="Switch to tomorrow's tasks"
      >
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons 
            name={getTabIcon('tomorrow')}
            size={scaleWidth(18)}
            color={isTabActive('tomorrow') ? theme.primary : theme.textSecondary}
            style={{ marginRight: scaleWidth(6) }}
          />
          <Text 
            style={[
              styles.tabText, 
              { 
                color: isTabActive('tomorrow') ? theme.primary : theme.textSecondary,
                fontWeight: isTabActive('tomorrow') ? '700' : '500',
                fontSize: scaleFontSize(isSmallDevice ? 14 : 16),
                maxFontSizeMultiplier: 1.3, // Limit Dynamic Type scaling
              }
            ]}
          >
            Tomorrow
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Later Tab */}
      <TouchableOpacity 
        style={[
          styles.tab, 
          { 
            width: tabWidth,
            minHeight: accessibility.minTouchTarget,
          }
        ]}
        onPress={() => setActiveTab('later')}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="tab"
        accessibilityLabel={getAccessibilityLabel('later')}
        accessibilityState={{ selected: isTabActive('later') }}
        accessibilityHint="Switch to later tasks"
      >
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Ionicons 
            name={getTabIcon('later')}
            size={scaleWidth(18)}
            color={isTabActive('later') ? theme.primary : theme.textSecondary}
            style={{ marginRight: scaleWidth(6) }}
          />
          <Text 
            style={[
              styles.tabText, 
              { 
                color: isTabActive('later') ? theme.primary : theme.textSecondary,
                fontWeight: isTabActive('later') ? '700' : '500',
                fontSize: scaleFontSize(isSmallDevice ? 14 : 16),
                maxFontSizeMultiplier: 1.3, // Limit Dynamic Type scaling
              }
            ]}
          >
            Later
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(TodoTabs);