// src/screens/GoalDetailsScreen/components/SectionHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SectionHeader = ({ title, icon, isActive, onPress, selectedColor, theme }) => {
  // Animation for active indicator
  const [scaleAnim] = React.useState(new Animated.Value(isActive ? 1 : 0));
  
  // Update animation when active state changes
  React.useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, [isActive, scaleAnim]);
  
  return (
    <TouchableOpacity
      style={[
        styles.sectionHeaderButton,
        isActive && { backgroundColor: `${selectedColor}15` }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={icon} 
        size={20} 
        color={isActive ? selectedColor : theme.textSecondary} 
      />
      <Text 
        style={[
          styles.sectionHeaderText, 
          { color: isActive ? selectedColor : theme.textSecondary }
        ]}
      >
        {title}
      </Text>
      
      {/* Animated indicator for active tab */}
      <Animated.View 
        style={[
          styles.activeIndicator, 
          { 
            backgroundColor: selectedColor,
            transform: [{ scaleX: scaleAnim }],
            opacity: scaleAnim
          }
        ]} 
      />
    </TouchableOpacity>
  );
};

const styles = {
  sectionHeaderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
    height: 45, // Fixed height for predictable layout
  },
  sectionHeaderText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 6,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  }
};

export default SectionHeader;