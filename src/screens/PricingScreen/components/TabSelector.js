// src/screens/PricingScreen/components/TabSelector.js
import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TabSelector = ({ 
  theme, 
  activeTab, 
  setActiveTab, 
  tabIndicatorPosition, 
  pagerRef, 
  onTabPress,
  responsive = {}
}) => {
  // Extract responsive values or use defaults
  const { 
    fontSize = {}, 
    spacing = {}, 
    isSmallDevice = false, 
    isTablet = false, 
    width = 0 
  } = responsive;
  
  // Calculate tab width based on available width
  const availableWidth = width || 300;
  const tabWidth = availableWidth / 2;
  
  // Calculate the indicator position
  const indicatorPosition = tabIndicatorPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabWidth]
  });
  
  // Handle tab press
  const handleTabPress = (tab) => {
    if (onTabPress) {
      onTabPress(tab);
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.card }
    ]}>
      {/* Animated Tab Indicator */}
      <Animated.View 
        style={[
          styles.indicator,
          {
            width: tabWidth * 0.9,
            transform: [
              { translateX: Animated.add(
                indicatorPosition, 
                tabWidth * 0.05 // Center the indicator
              )}
            ],
            backgroundColor: theme.background,
            shadowColor: theme.primary,
          }
        ]} 
      />
      
      {/* Lifetime Access Tab */}
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'lifetime' && styles.activeTab
        ]}
        onPress={() => handleTabPress('lifetime')}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'lifetime' }}
        accessibilityLabel="Lifetime Access"
      >
        <Animated.View style={styles.tabContent}>
          <Ionicons
            name="star"
            size={16}
            color={activeTab === 'lifetime' ? theme.primary : theme.textSecondary}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              { 
                color: activeTab === 'lifetime' ? theme.primary : theme.textSecondary,
                fontWeight: activeTab === 'lifetime' ? '700' : '500',
              }
            ]}
            numberOfLines={1}
          >
            Lifetime Access
          </Text>
        </Animated.View>
      </TouchableOpacity>
      
      {/* AI Plans Tab */}
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'subscription' && styles.activeTab
        ]}
        onPress={() => handleTabPress('subscription')}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'subscription' }}
        accessibilityLabel="AI Plans"
      >
        <Animated.View style={styles.tabContent}>
          <Ionicons
            name="sparkles"
            size={16}
            color={activeTab === 'subscription' ? theme.primary : theme.textSecondary}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              { 
                color: activeTab === 'subscription' ? theme.primary : theme.textSecondary,
                fontWeight: activeTab === 'subscription' ? '700' : '500',
              }
            ]}
            numberOfLines={1}
          >
            AI Plans
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    minHeight: 48,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 0
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 1,
    paddingVertical: 12,
  },
  activeTab: {
    // Active styles applied through color and fontWeight
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
    fontSize: 14,
    textAlign: 'center',
  }
});

export default TabSelector;