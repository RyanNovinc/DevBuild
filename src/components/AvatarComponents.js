// src/components/AvatarComponents.js
import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Shared color palette for consistency across screens
export const COLOR_PALETTE = [
  // Modern UI colors
  { primary: '#3498db', secondary: '#2980b9', name: 'Blue' },
  { primary: '#2ecc71', secondary: '#27ae60', name: 'Green' },
  { primary: '#e74c3c', secondary: '#c0392b', name: 'Red' },
  { primary: '#9b59b6', secondary: '#8e44ad', name: 'Purple' },
  { primary: '#f1c40f', secondary: '#f39c12', name: 'Yellow' },
  { primary: '#1abc9c', secondary: '#16a085', name: 'Teal' },
  { primary: '#34495e', secondary: '#2c3e50', name: 'Dark Blue' },
  { primary: '#7f8c8d', secondary: '#95a5a6', name: 'Gray' },
  // Vibrant colors
  { primary: '#FF4757', secondary: '#FF6B81', name: 'Coral' },
  { primary: '#5352ED', secondary: '#1E90FF', name: 'Royal Blue' },
  { primary: '#2ED573', secondary: '#7BED9F', name: 'Mint' },
  { primary: '#FF9FF3', secondary: '#F368E0', name: 'Pink' },
  { primary: '#FFBA00', secondary: '#FFA100', name: 'Amber' },
  { primary: '#00E5FF', secondary: '#00CEFF', name: 'Cyan' },
  { primary: '#8C7AE6', secondary: '#9980FA', name: 'Lavender' },
  { primary: '#FF6348', secondary: '#FF7F50', name: 'Tomato' }
];

// Shared avatar component for consistent rendering across screens
export const DefaultAvatar = ({ size, colors, iconName, initials, selected, colorIndex }) => {
  const borderWidth = selected ? 3 : 0;
  
  // If colorIndex is provided, use it to get colors from COLOR_PALETTE
  let displayColors = colors;
  if (colorIndex !== undefined && COLOR_PALETTE[colorIndex]) {
    displayColors = COLOR_PALETTE[colorIndex];
  }
  
  // Safety check for colors object
  const safeColors = {
    primary: displayColors?.primary || '#3498db',  // Default blue if no color provided
    secondary: displayColors?.secondary || '#2980b9'
  };
  
  console.log('Rendering DefaultAvatar with colors:', safeColors, 'iconName:', iconName, 'colorIndex:', colorIndex);
  
  return (
    <View 
      style={{ 
        width: size, 
        height: size, 
        borderRadius: size / 2, 
        backgroundColor: safeColors.primary,
        overflow: 'hidden',
        borderWidth,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Ionicons 
        name={iconName} 
        size={size * 0.6} 
        color={safeColors.secondary} 
      />
    </View>
  );
};