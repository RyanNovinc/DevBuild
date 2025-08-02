// src/screens/TimeScreen/ImprovedSwipeableTabs.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = SCREEN_WIDTH / 3;

/**
 * Simplified SwipeableTabs component with cleaner animations
 * Based on the TodoListScreen tab approach
 */
const ImprovedSwipeableTabs = ({ selectedView, onViewChange, theme, sharedTranslateX }) => {
  // Tabs configuration
  const tabs = [
    { id: 'day', title: 'Day' },
    { id: 'week', title: 'Week' },
    { id: 'month', title: 'Month' }
  ];

  // Get index of selected tab
  const currentIndex = tabs.findIndex(tab => tab.id === selectedView);
  
  // Animation for indicator position - based on shared value from content
  const indicatorPosition = Animated.subtract(
    Animated.divide(
      Animated.multiply(sharedTranslateX, -1),
      SCREEN_WIDTH
    ),
    0
  ).interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, TAB_WIDTH, TAB_WIDTH * 2],
    extrapolate: 'clamp'
  });

  // Handle tab selection
  const handleTabPress = (index) => {
    // Skip if already on this tab
    if (index === currentIndex) return;
    
    // Notify parent to change view
    onViewChange(tabs[index].id);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.tabsContainer, { backgroundColor: theme.cardElevated, borderRadius: 25 }]}>
        {/* Tab Indicator */}
        <Animated.View 
          style={[
            styles.indicator, 
            { 
              backgroundColor: theme.primary,
              width: TAB_WIDTH,
              transform: [{ translateX: indicatorPosition }]
            }
          ]} 
        />
        
        {/* Tab Buttons */}
        <View style={styles.tabsWrapper}>
          {tabs.map((tab, index) => {
            // Check if this tab is selected
            const isSelected = index === currentIndex;
            
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.tab}
                onPress={() => handleTabPress(index)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    { 
                      color: isSelected ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                      fontSize: isSelected ? 16 : 15,
                    }
                  ]}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  tabsContainer: {
    height: 44,
    position: 'relative',
    overflow: 'hidden',
  },
  tabsWrapper: {
    flexDirection: 'row',
    height: '100%',
    position: 'relative',
    zIndex: 2, // Higher than indicator
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabText: {
    fontWeight: '600',
    zIndex: 3, // Ensure text is on top
  },
  indicator: {
    position: 'absolute',
    height: 38,
    borderRadius: 22,
    top: 3,
    left: 0,
    zIndex: 1, // Lower than tab content
  }
});

export default ImprovedSwipeableTabs;