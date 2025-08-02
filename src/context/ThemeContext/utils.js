// src/context/ThemeContext/utils.js
// Utility functions for theme management with responsive enhancements

import { lightTheme, darkTheme } from './themes';

/**
 * Convert hex color to RGB values
 * @param {string} hex - Hex color string
 * @returns {Object} - Object with r, g, b values
 */
export function hexToRgb(hex) {
  // Default to black if invalid hex
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return { r: 0, g: 0, b: 0 };
  }
  
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  
  return { r, g, b };
}

/**
 * Create RGBA color string from hex color
 * @param {string} hexColor - Hex color string
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} - RGBA color string
 */
export function createRgbaColor(hexColor, alpha = 1) {
  const { r, g, b } = hexToRgb(hexColor);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Get color with alpha transparency
 * @param {string} hexColor - Hex color string
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} - RGBA color string
 */
export function getColorWithAlpha(hexColor, alpha) {
  return createRgbaColor(hexColor, alpha);
}

/**
 * Determine appropriate contrast color (black or white) for a background color
 * @param {string} hexColor - Hex color string
 * @returns {string} - '#FFFFFF' for dark backgrounds, '#000000' for light backgrounds
 */
export function getContrastColor(hexColor) {
  // Default to white if color is invalid
  if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
    return '#FFFFFF';
  }
  
  const { r, g, b } = hexToRgb(hexColor);
  
  // Calculate perceived brightness using a common formula
  // (0.299*R + 0.587*G + 0.114*B)
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark colors, black for light colors
  return brightness > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Create a light theme with custom primary color
 * @param {string} primaryColor - Hex color for primary color
 * @returns {Object} - Theme object
 */
export const createColoredLightTheme = (primaryColor) => {
  return {
    ...lightTheme,
    primary: primaryColor,
    // Determine appropriate contrast color for text on primary background
    primaryContrast: getContrastColor(primaryColor),
    // Add helper function for alpha colors
    getColorWithAlpha: (color, alpha) => getColorWithAlpha(color || primaryColor, alpha),
    
    // Make sure domain colors are also updated
    domains: {
      ...lightTheme.domains,
      business: primaryColor, // Use primary color for business domain
    }
  };
};

/**
 * Create a dark theme with custom primary color
 * @param {string} primaryColor - Hex color for primary color
 * @returns {Object} - Theme object
 */
export const createColoredDarkTheme = (primaryColor) => {
  return {
    ...darkTheme,
    primary: primaryColor,
    // Determine appropriate contrast color for text on primary background
    primaryContrast: getContrastColor(primaryColor),
    // Add helper function for alpha colors
    getColorWithAlpha: (color, alpha) => getColorWithAlpha(color || primaryColor, alpha),
    
    // Make sure domain colors are also updated
    domains: {
      ...darkTheme.domains,
      business: primaryColor, // Use primary color for business domain
    }
  };
};

/**
 * Add alpha color helper to standard themes
 */
export const enhancedLightTheme = {
  ...lightTheme,
  getColorWithAlpha: (color, alpha) => getColorWithAlpha(color || lightTheme.primary, alpha)
};

export const enhancedDarkTheme = {
  ...darkTheme,
  getColorWithAlpha: (color, alpha) => getColorWithAlpha(color || darkTheme.primary, alpha)
};