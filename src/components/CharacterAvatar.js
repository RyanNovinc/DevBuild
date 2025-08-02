// src/components/CharacterAvatar.js
import React from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { characterAvatars } from '../config/AICharacterConfig';

const CharacterAvatar = ({ 
  style, 
  styleId = 'default', 
  isThinking = false, 
  spinValue = null,
  scaleValue = null,
  size = 'medium'
}) => {
  // Use default style if the specified style doesn't exist
  const avatarData = characterAvatars[styleId] || characterAvatars.default;
  
  // Select appropriate image based on thinking state
  const imageSource = isThinking ? avatarData.thinking : avatarData.normal;
  
  // Determine container size based on the size prop
  const containerSize = size === 'small' ? 30 : size === 'large' ? 50 : 40;
  const iconSize = size === 'small' ? 14 : size === 'large' ? 22 : 18;
  
  // Fallback to icon if image is not available
  const iconName = avatarData.icon || 'sparkles-outline';
  
  // Check if we have actual images (change this to true once you've added the real images)
  const hasRealImages = false;
  
  // Default style always uses icon, other styles use images when available
  if (hasRealImages && styleId !== 'default') {
    // With actual character images for non-default styles
    if (isThinking && spinValue && scaleValue) {
      // Animated thinking state with character image
      return (
        <Animated.View style={[
          styles.container,
          { width: containerSize, height: containerSize },
          style,
          { 
            transform: [
              { rotate: spinValue },
              { scale: scaleValue }
            ] 
          }
        ]}>
          <Image 
            source={imageSource} 
            style={[styles.image, { width: containerSize, height: containerSize }]} 
            resizeMode="cover"
          />
        </Animated.View>
      );
    } else {
      // Static character image
      return (
        <View style={[
          styles.container,
          { width: containerSize, height: containerSize },
          style
        ]}>
          <Image 
            source={imageSource} 
            style={[styles.image, { width: containerSize, height: containerSize }]} 
            resizeMode="cover"
          />
        </View>
      );
    }
  } else {
    // Fallback to icon-based avatar (default style or until you have real images)
    if (isThinking && spinValue && scaleValue) {
      // Animated thinking state with icon
      return (
        <Animated.View style={[
          styles.container,
          { width: containerSize, height: containerSize, backgroundColor: '#000000' },
          style,
          { 
            transform: [
              { rotate: spinValue },
              { scale: scaleValue }
            ] 
          }
        ]}>
          <Ionicons name={iconName} size={iconSize} color="#FFD700" />
        </Animated.View>
      );
    } else {
      // Static icon
      return (
        <View style={[
          styles.container,
          { width: containerSize, height: containerSize, backgroundColor: '#000000' },
          style
        ]}>
          <Ionicons name={iconName} size={iconSize} color="#FFD700" />
        </View>
      );
    }
  }
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  image: {
    borderRadius: 20,
  }
});

export default CharacterAvatar;