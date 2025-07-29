// src/screens/Onboarding/utils/contrastUtils.js
/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color code
 * @returns {Object} - RGB values
 */
const hexToRgb = (hex) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
};

/**
 * Calculate relative luminance of a color
 * @param {Object} rgb - RGB values
 * @returns {number} - Relative luminance
 */
const calculateLuminance = ({ r, g, b }) => {
  // Convert RGB to sRGB
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;
  
  // Calculate luminance
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} - Contrast ratio
 */
export const calculateContrastRatio = (color1, color2) => {
  const lum1 = calculateLuminance(hexToRgb(color1));
  const lum2 = calculateLuminance(hexToRgb(color2));
  
  // Calculate contrast ratio
  const lighterLum = Math.max(lum1, lum2);
  const darkerLum = Math.min(lum1, lum2);
  
  return (lighterLum + 0.05) / (darkerLum + 0.05);
};

/**
 * Ensure sufficient contrast between text and background
 * @param {string} textColor - Text color (hex)
 * @param {string} backgroundColor - Background color (hex)
 * @param {number} minRatio - Minimum contrast ratio (4.5:1 for normal text, 3:1 for large text)
 * @returns {string} - Adjusted text color if needed, or original if contrast is sufficient
 */
export const ensureContrast = (textColor, backgroundColor, minRatio = 4.5) => {
  const contrast = calculateContrastRatio(textColor, backgroundColor);
  
  if (contrast >= minRatio) {
    return textColor; // Contrast is sufficient
  }
  
  // Contrast is insufficient, provide an adjusted color
  // This is a simplified approach - a more sophisticated algorithm would 
  // gradually adjust the color until sufficient contrast is achieved
  const bgRgb = hexToRgb(backgroundColor);
  const bgLuminance = calculateLuminance(bgRgb);
  
  // If background is dark, make text lighter
  if (bgLuminance < 0.5) {
    return '#FFFFFF';
  } else {
    // If background is light, make text darker
    return '#000000';
  }
};

// Pre-defined contrast-checked color pairs
export const contrastSafeColors = {
  // Dark backgrounds
  darkBg: {
    primary: '#4C8BF5', // Adjusted blue for dark backgrounds
    success: '#2DCE89', // Adjusted green
    warning: '#FB8C00', // Adjusted orange
    danger: '#F5365C', // Adjusted red
    info: '#11CDEF',   // Adjusted cyan
    text: '#F5F5F5',   // Light gray text
    textSecondary: '#AAAAAA', // Secondary text
  },
  // Light backgrounds
  lightBg: {
    primary: '#2563EB', // Adjusted blue for light backgrounds
    success: '#10B981', // Adjusted green
    warning: '#F59E0B', // Adjusted orange
    danger: '#EF4444', // Adjusted red
    info: '#0EA5E9',  // Adjusted cyan
    text: '#111111',  // Near black text
    textSecondary: '#555555', // Secondary text
  }
};