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
          backgroundColor: theme.primary,
          height: buttonSize.height,
          borderRadius: scaleWidth(12)
        },
        (loading || disabled) && { opacity: 0.7 }
      ]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.7}
      {...getAccessibilityProps()}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size={isTablet ? "large" : "small"} />
      ) : (
        <Text 
          style={[
            styles.buttonText,
            { fontSize: getFontSize() }
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
    paddingVertical: 0, // Height is controlled by the container
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    width: '100%',
    // Minimum height to ensure proper touch target
    minHeight: accessibility.minTouchTarget,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AuthButton;