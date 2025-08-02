// src/components/AvatarComponents.js
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import level-based profile picture system
import { LEVEL_COLOR_SCHEMES } from '../data/LevelProfilePictures';

// Legacy color palette for backwards compatibility
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

// Legacy avatar component for backwards compatibility
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

// New level-based avatar component
export const LevelAvatar = ({ 
  size, 
  pictureData, 
  selected = false, 
  isLocked = false,
  requiredLevel = null,
  style = {}
}) => {
  const borderWidth = selected ? 3 : 0;
  const shadowOpacity = isLocked ? 0.1 : 0.3;
  
  // Get colors from picture data or use default
  const colors = pictureData?.colorScheme || {
    primary: '#3498db',
    secondary: '#2980b9',
    accent: '#2E6BA8'
  };
  
  // If locked, show question mark
  if (isLocked) {
    return (
      <View 
        style={[{
          width: size, 
          height: size, 
          borderRadius: size / 2, 
          backgroundColor: '#666666',
          opacity: 0.6,
          borderWidth,
          borderColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity,
          shadowRadius: 4,
          elevation: 2,
          justifyContent: 'center',
          alignItems: 'center'
        }, style]}
      >
        <Ionicons 
          name="help-outline" 
          size={size * 0.5} 
          color="#999999" 
        />
        {requiredLevel && (
          <View style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            backgroundColor: '#FF6B6B',
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text style={{
              color: 'white',
              fontSize: 10,
              fontWeight: 'bold'
            }}>
              {requiredLevel}
            </Text>
          </View>
        )}
      </View>
    );
  }
  
  // Render epic level avatar
  return (
    <View 
      style={[{
        width: size, 
        height: size, 
        borderRadius: size / 2, 
        backgroundColor: colors.primary,
        borderWidth,
        borderColor: selected ? colors.accent : '#ffffff',
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity,
        shadowRadius: 6,
        elevation: 6,
        justifyContent: 'center',
        alignItems: 'center',
        // Add epic glow effect
        position: 'relative'
      }, style]}
    >
      {/* Epic background gradient effect */}
      <View style={{
        width: size * 0.8,
        height: size * 0.8,
        borderRadius: (size * 0.8) / 2,
        backgroundColor: colors.secondary,
        position: 'absolute',
        opacity: 0.7
      }} />
      
      {/* Icon */}
      <Ionicons 
        name={pictureData?.icon || 'star-outline'} 
        size={size * 0.55} 
        color={colors.accent}
        style={{ zIndex: 1 }}
      />
      
      {/* Epic shimmer effect for higher levels */}
      {pictureData?.requiredLevel >= 10 && (
        <View style={{
          position: 'absolute',
          top: size * 0.1,
          left: size * 0.1,
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: (size * 0.3) / 2,
          backgroundColor: '#FFFFFF',
          opacity: 0.3
        }} />
      )}
    </View>
  );
};

// Component for custom photo option (level 8+)
export const CustomPhotoAvatar = ({ 
  size, 
  selected = false, 
  isEnabled = true,
  style = {}
}) => {
  const borderWidth = selected ? 3 : 0;
  const colors = LEVEL_COLOR_SCHEMES[8]; // Legend level colors
  
  return (
    <View 
      style={[{
        width: size, 
        height: size, 
        borderRadius: size / 2, 
        backgroundColor: isEnabled ? colors.primary : '#CCCCCC',
        borderWidth,
        borderColor: selected ? colors.accent : '#ffffff',
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isEnabled ? 0.3 : 0.1,
        shadowRadius: 6,
        elevation: isEnabled ? 6 : 2,
        justifyContent: 'center',
        alignItems: 'center'
      }, style]}
    >
      <Ionicons 
        name="camera-outline" 
        size={size * 0.5} 
        color={isEnabled ? colors.accent : '#999999'}
      />
      <Text style={{
        position: 'absolute',
        bottom: size * 0.1,
        fontSize: size * 0.12,
        color: isEnabled ? colors.accent : '#999999',
        fontWeight: 'bold'
      }}>
        CUSTOM
      </Text>
    </View>
  );
};