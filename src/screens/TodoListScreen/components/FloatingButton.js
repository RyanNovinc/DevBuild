// src/screens/TodoListScreen/components/FloatingButton.js - Black with thin, subtle outline
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * FloatingButton - A button component with solid black background and thin, subtle white outline
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Button text
 * @param {string} props.iconName - Ionicons icon name
 * @param {function} props.onPress - Button press handler
 * @param {Object} props.theme - Theme object
 * @param {boolean} props.isPrimary - Whether to use primary style (still affects text color)
 * @param {Object} props.style - Additional style for the button
 * @param {boolean} props.withBackground - Whether to add background (default: true)
 */
const FloatingButton = ({ 
  label, 
  iconName, 
  onPress, 
  theme, 
  isPrimary = false,
  style = {},
  withBackground = true
}) => {
  // Get text color based on theme and button type
  const getTextColor = () => {
    if (!withBackground) {
      return isPrimary ? theme?.primary || '#007AFF' : theme?.textSecondary || '#777777';
    }
    
    // With background, use white text for better visibility
    return '#FFFFFF';
  };
  
  // Get icon color based on theme and button type
  const getIconColor = () => {
    if (!withBackground) {
      return isPrimary ? theme?.primary || '#007AFF' : theme?.textSecondary || '#777777';
    }
    
    // With background, use white icon for better visibility
    return '#FFFFFF';
  };
  
  // Get background color
  const getBackgroundColor = () => {
    if (!withBackground) {
      return 'transparent';
    }
    
    // All buttons are black regardless of primary status
    return '#000000';
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: withBackground ? 'rgba(255, 255, 255, 0.3)' : 'transparent', // Transparent white for subtlety
          borderWidth: withBackground ? 0.5 : 0, // Thinner border (0.5px)
        },
        style
      ]}
      onPress={onPress}
      activeOpacity={0.6} // Make it slightly fade when pressed
    >
      {iconName && (
        <Ionicons 
          name={iconName} 
          size={18} 
          color={getIconColor()} 
          style={styles.icon} 
        />
      )}
      {label && (
        <Text style={[styles.label, { color: getTextColor() }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 4,
    // Add shadow for better floating effect
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  }
});

export default React.memo(FloatingButton);