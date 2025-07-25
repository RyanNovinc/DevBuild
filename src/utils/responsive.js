/**
 * responsive.js
 * 
 * A centralized system for responsive and accessible design across different iOS devices.
 * This utility provides tools for scaling dimensions, handling different device sizes,
 * adapting to orientation changes, and ensuring accessibility compliance.
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

// Get initial screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions - design reference size (iPhone 13/14)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

/**
 * Device size classification
 */
export const isSmallDevice = SCREEN_WIDTH < 375; // iPhone SE, iPhone 8, etc.
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 428; // iPhone X, 11, 12, 13, 14
export const isLargeDevice = SCREEN_WIDTH >= 428 && SCREEN_WIDTH < 768; // iPhone Plus, Pro Max
export const isTablet = SCREEN_WIDTH >= 768; // iPad and larger

/**
 * Accessibility constants - based on Apple Human Interface Guidelines
 */
export const accessibility = {
  // Minimum touch target size per Apple guidelines (44×44 points)
  minTouchTarget: 44,
  
  // Standard touch target sizes (scaled for different devices)
  touchTarget: {
    small: isSmallDevice ? 40 : 44,
    medium: isSmallDevice ? 44 : 48,
    large: isSmallDevice ? 48 : isTablet ? 60 : 56
  },
  
  // WCAG 2.1 AA contrast ratio requirement (4.5:1 for normal text)
  minContrastRatio: 4.5,
  
  // WCAG 2.1 AA contrast ratio for large text (3:1 for 18pt or 14pt bold)
  minLargeTextContrastRatio: 3.0,
  
  // Dynamic Type scaling factors
  textScaleFactor: {
    extraSmall: 0.8,
    small: 0.9,
    medium: 1.0,
    large: 1.15,
    extraLarge: 1.3,
    extraExtraLarge: 1.5,
    extraExtraExtraLarge: 1.7,
    accessibilityMedium: 2.0,
    accessibilityLarge: 2.5,
    accessibilityExtraLarge: 3.0,
    accessibilityExtraExtraLarge: 3.5,
    accessibilityExtraExtraExtraLarge: 4.0
  }
};

/**
 * Calculate the scale factor based on screen width
 * @param {number} factor - Balance between scaling and fixed size (0-1)
 * @returns {number} - The width scaling factor
 */
export const getWidthScaleFactor = (factor = 0.5) => {
  const rawScale = SCREEN_WIDTH / BASE_WIDTH;
  // Apply the factor to moderate the scaling effect
  return factor * rawScale + (1 - factor);
};

/**
 * Calculate the scale factor based on screen height
 * @param {number} factor - Balance between scaling and fixed size (0-1)
 * @returns {number} - The height scaling factor
 */
export const getHeightScaleFactor = (factor = 0.5) => {
  const rawScale = SCREEN_HEIGHT / BASE_HEIGHT;
  // Apply the factor to moderate the scaling effect
  return factor * rawScale + (1 - factor);
};

/**
 * Scale width dimensions proportionally
 * @param {number} size - The size to scale
 * @param {number} factor - Balance between scaling and fixed size (0-1)
 * @returns {number} - The scaled size
 */
export const scaleWidth = (size, factor = 0.5) => {
  return Math.round(size * getWidthScaleFactor(factor));
};

/**
 * Scale height dimensions proportionally
 * @param {number} size - The size to scale
 * @param {number} factor - Balance between scaling and fixed size (0-1)
 * @returns {number} - The scaled size
 */
export const scaleHeight = (size, factor = 0.5) => {
  return Math.round(size * getHeightScaleFactor(factor));
};

/**
 * Scale font sizes proportionally
 * @param {number} size - The font size to scale
 * @param {number} factor - Balance between scaling and fixed size (0-1)
 * @returns {number} - The scaled font size
 */
export const scaleFontSize = (size, factor = 0.3) => {
  const scaleFactor = getWidthScaleFactor(factor);
  const newSize = size * scaleFactor;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
};

/**
 * Ensures a UI element meets minimum accessibility touch target size
 * @param {number} width - Current width
 * @param {number} height - Current height
 * @returns {Object} - Object with width and height that meet minimum touch target requirements
 */
export const ensureAccessibleTouchTarget = (width, height) => {
  const minSize = accessibility.minTouchTarget;
  return {
    width: Math.max(width, minSize),
    height: Math.max(height, minSize)
  };
};

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First color in hex format (e.g., '#FFFFFF')
 * @param {string} color2 - Second color in hex format (e.g., '#000000')
 * @returns {number} - Contrast ratio between the two colors
 */
export const getContrastRatio = (color1, color2) => {
  // Convert hex to RGB
  const getRGB = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };
  
  // Calculate relative luminance
  const getLuminance = (rgb) => {
    const { r, g, b } = rgb;
    const [R, G, B] = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };
  
  const rgb1 = getRGB(color1);
  const rgb2 = getRGB(color2);
  const luminance1 = getLuminance(rgb1);
  const luminance2 = getLuminance(rgb2);
  
  // Calculate contrast ratio
  const brightest = Math.max(luminance1, luminance2);
  const darkest = Math.min(luminance1, luminance2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if a color combination meets WCAG 2.1 AA contrast requirements
 * @param {string} foreground - Foreground color (text)
 * @param {string} background - Background color
 * @param {boolean} isLargeText - Whether the text is considered "large" (18pt+ or 14pt+ bold)
 * @returns {boolean} - Whether the combination meets WCAG 2.1 AA requirements
 */
export const meetsContrastRequirements = (foreground, background, isLargeText = false) => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? 
    ratio >= accessibility.minLargeTextContrastRatio : 
    ratio >= accessibility.minContrastRatio;
};

/**
 * Get dimensions per device size category
 * @param {Object} dimensions - Object with size options
 * @returns {number} - The appropriate dimension for the current device
 */
export const getByDeviceSize = ({ small, medium, large, tablet }) => {
  if (isTablet && tablet !== undefined) return tablet;
  if (isLargeDevice && large !== undefined) return large;
  if (isMediumDevice && medium !== undefined) return medium;
  if (isSmallDevice && small !== undefined) return small;
  
  // Default fallback - medium device
  return medium !== undefined ? medium : 
         small !== undefined ? small :
         large !== undefined ? large :
         tablet !== undefined ? tablet : 0;
};

/**
 * React hook to get current screen dimensions and update on changes
 * @returns {Object} - Current width and height
 */
export const useScreenDimensions = () => {
  const [dimensions, setDimensions] = useState({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height
      });
    });

    return () => subscription.remove();
  }, []);

  return dimensions;
};

/**
 * React hook to check if device is in landscape orientation
 * @returns {boolean} - True if in landscape orientation
 */
export const useIsLandscape = () => {
  const { width, height } = useScreenDimensions();
  return width > height;
};

/**
 * React hook to get safe spacing that combines responsive scaling with safe area insets
 * @returns {Object} - Responsive safe spacing for each edge
 */
export const useSafeSpacing = () => {
  const insets = useSafeAreaInsets();
  
  return {
    // For horizontal spacing, combine base spacing with safe area
    left: scaleWidth(16) + insets.left,
    right: scaleWidth(16) + insets.right,
    
    // For vertical spacing, combine base spacing with safe area
    top: scaleHeight(16) + insets.top,
    bottom: scaleHeight(16) + insets.bottom,
    
    // Provide standard spacing units that work well across devices
    s: scaleWidth(8),
    m: scaleWidth(16),
    l: scaleWidth(24),
    xl: scaleWidth(32),
    xxl: scaleWidth(48),

    // Dynamic Island detection
    hasDynamicIsland: insets.top >= 59,
  };
};

/**
 * Standard spacing values that scale with device size
 */
export const spacing = {
  xxxs: scaleWidth(2),
  xxs: scaleWidth(4),
  xs: scaleWidth(8),
  s: scaleWidth(12),
  m: scaleWidth(16),
  l: scaleWidth(24),
  xl: scaleWidth(32),
  xxl: scaleWidth(48),
  xxxl: scaleWidth(64),
};

/**
 * Standard font sizes that scale with device size
 */
export const fontSizes = {
  xs: scaleFontSize(12),
  s: scaleFontSize(14),
  m: scaleFontSize(16),
  l: scaleFontSize(18),
  xl: scaleFontSize(20),
  xxl: scaleFontSize(24),
  xxxl: scaleFontSize(32),
};

/**
 * Helper to create responsive styles for a component
 * @param {Object} baseStyles - The base styles
 * @param {Object} options - Responsive options
 * @returns {Object} - The responsive styles
 */
export const createResponsiveStyles = (baseStyles, options = {}) => {
  const { small, medium, large, tablet, landscape } = options;
  const { width, height } = useScreenDimensions();
  const isLandscape = width > height;
  
  // Start with the base styles
  let styles = { ...baseStyles };
  
  // Apply device-specific styles
  if (isSmallDevice && small) {
    styles = { ...styles, ...small };
  } else if (isMediumDevice && medium) {
    styles = { ...styles, ...medium };
  } else if (isLargeDevice && large) {
    styles = { ...styles, ...large };
  } else if (isTablet && tablet) {
    styles = { ...styles, ...tablet };
  }
  
  // Apply landscape-specific styles if in landscape mode
  if (isLandscape && landscape) {
    styles = { ...styles, ...landscape };
  }
  
  return styles;
};

export default {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  getByDeviceSize,
  useScreenDimensions,
  useIsLandscape,
  useSafeSpacing,
  spacing,
  fontSizes,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  createResponsiveStyles,
  accessibility,
  ensureAccessibleTouchTarget,
  getContrastRatio,
  meetsContrastRequirements
};