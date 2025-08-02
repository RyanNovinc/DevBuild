// src/components/EmptyState.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility,
  getContrastRatio,
  meetsContrastRequirements,
  ensureAccessibleTouchTarget
} from '../utils/responsive';

/**
 * Enhanced EmptyState component for consistent, visually appealing empty states
 * Fully optimized for iOS device sizes and accessibility
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Primary title text
 * @param {string} props.message - Secondary message text
 * @param {string} props.icon - Ionicons icon name
 * @param {string} props.iconColor - Primary color for icon and gradient
 * @param {string} props.buttonText - Text for the action button (optional)
 * @param {Function} props.onButtonPress - Button press handler (optional)
 * @param {Object} props.theme - Theme object from context
 * @param {Object} props.containerStyle - Additional styles for container
 * @param {Object} props.illustration - Custom illustration component (optional)
 */
const EmptyState = ({
  title,
  message,
  icon = 'alert-circle',
  iconColor = '#4CAF50',
  buttonText,
  onButtonPress,
  theme,
  containerStyle,
  illustration
}) => {
  // Derived colors for gradient with transparency
  const lightColor = `${iconColor}15`; // 15% opacity
  const mediumColor = `${iconColor}05`; // 5% opacity

  // Check contrast for button text against background
  const hasGoodButtonContrast = meetsContrastRequirements('#FFFFFF', iconColor);
  // Use a darker shade if contrast is insufficient
  const buttonColor = hasGoodButtonContrast ? iconColor : '#2E7D32';
  
  // Accessibility props for the button
  const buttonAccessibilityProps = buttonText && onButtonPress ? {
    accessible: true,
    accessibilityRole: 'button',
    accessibilityLabel: buttonText,
    accessibilityHint: `Performs action: ${buttonText}`
  } : {};

  // Get button dimensions that meet accessibility requirements
  const buttonDimensions = ensureAccessibleTouchTarget(
    scaleWidth(120), 
    scaleHeight(44)
  );
  
  return (
    <View 
      style={[styles.container, containerStyle]}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={`Empty state: ${title}`}
    >
      <LinearGradient
        colors={[lightColor, mediumColor, 'transparent']}
        style={styles.gradientBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.8 }}
      />
      
      <View style={styles.content}>
        {/* Custom illustration or default icon */}
        {illustration ? (
          <View accessible={false}>
            {illustration}
          </View>
        ) : (
          <View 
            style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={`${icon} icon`}
          >
            <Ionicons name={icon} size={scaleWidth(48)} color={iconColor} />
          </View>
        )}
        
        {/* Title and message */}
        <Text 
          style={[styles.title, { color: theme?.text || '#000' }]}
          accessibilityRole="header"
          maxFontSizeMultiplier={1.8}
        >
          {title}
        </Text>
        
        <Text 
          style={[styles.message, { color: theme?.textSecondary || '#666' }]}
          maxFontSizeMultiplier={2.0}
        >
          {message}
        </Text>
        
        {/* Optional action button */}
        {buttonText && onButtonPress && (
          <TouchableOpacity
            style={[
              styles.button, 
              { 
                backgroundColor: buttonColor,
                width: buttonDimensions.width,
                height: buttonDimensions.height
              }
            ]}
            onPress={onButtonPress}
            {...buttonAccessibilityProps}
          >
            <Ionicons 
              name="add-circle-outline" 
              size={scaleWidth(18)} 
              color="#fff" 
              style={styles.buttonIcon} 
            />
            <Text 
              style={styles.buttonText}
              maxFontSizeMultiplier={1.5}
            >
              {buttonText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: scaleWidth(20),
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: scaleWidth(300),
  },
  iconContainer: {
    width: scaleWidth(100),
    height: scaleWidth(100), // Use scaleWidth for both to maintain circle aspect ratio
    borderRadius: scaleWidth(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  message: {
    fontSize: fontSizes.m,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: scaleFontSize(22),
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
    borderRadius: scaleWidth(25),
    marginTop: spacing.xs,
    // Minimum size ensured via ensureAccessibleTouchTarget
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSizes.m,
    fontWeight: '600',
  }
});

export default EmptyState;