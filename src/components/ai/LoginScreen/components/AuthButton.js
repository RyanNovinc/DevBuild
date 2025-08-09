// src/components/ai/LoginScreen/components/AuthButton.js - Fully optimized for responsive design and accessibility
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  fontSizes,
  spacing,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  useIsLandscape,
  accessibility,
  ensureAccessibleTouchTarget
} from '../../../../utils/responsive';

const AuthButton = ({ title, onPress, loading, disabled }) => {
  const { theme } = useTheme();
  const isLandscape = useIsLandscape();
  
  // Get responsive styles based on device size
  const getButtonHeight = () => {
    if (isTablet) return scaleHeight(60);
    if (isLargeDevice) return scaleHeight(56);
    if (isMediumDevice) return scaleHeight(52);
    return scaleHeight(48); // Small device
  };
  
  // Create accessible button styles
  const buttonSize = {
    height: getButtonHeight(),
    // Ensure the touch target meets accessibility requirements
    ...ensureAccessibleTouchTarget({
      width: '100%', 
      height: getButtonHeight()
    })
  };
  
  // Get accessible fontSize based on device size
  const getFontSize = () => {
    if (isTablet) return fontSizes.l;
    if (isLargeDevice) return fontSizes.m;
    return fontSizes.m;
  };
  
  // Create accessibility props
  const getAccessibilityProps = () => {
    return {
      accessible: true,
      accessibilityRole: "button",
      accessibilityLabel: loading ? "Loading" : title,
      accessibilityHint: `Activates ${title.toLowerCase()} function`,
      accessibilityState: {
        disabled: loading || disabled,
        busy: loading
      }
    };
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button, 
        { 
          backgroundColor: '#FFFFFF', // White button on black background
          height: 52,
          borderRadius: 12
        },
        (loading || disabled) && { opacity: 0.7 }
      ]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.7}
      {...getAccessibilityProps()}
    >
      {loading ? (
        <ActivityIndicator color="#000000" size="small" />
      ) : (
        <Text 
          style={[
            styles.buttonText,
            { 
              fontSize: 14,
              color: '#000000', // Black text on white button
              fontWeight: '600',
              letterSpacing: 0.5,
              textTransform: 'uppercase'
            }
          ]}
          maxFontSizeMultiplier={1.5}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    width: '100%',
    minHeight: accessibility.minTouchTarget,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    // Color and styles now handled inline for black minimal theme
  },
});

export default AuthButton;