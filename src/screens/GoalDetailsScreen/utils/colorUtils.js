// src/screens/GoalDetailsScreen/utils/colorUtils.js

/**
 * Determines if a color is dark based on its luminance
 * @param {string} hexColor - The color in hex format (e.g., "#FF0000")
 * @returns {boolean} - True if color is dark, false if light
 */
export const isDarkColor = (hexColor) => {
  // Make sure we have a valid hex color
  if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
    return false;
  }
  
  // Ensure we have a valid length
  if (hexColor.length !== 7 && hexColor.length !== 4) {
    return false;
  }
  
  // Handle shorthand hex (e.g., #FFF)
  let fullHex = hexColor;
  if (hexColor.length === 4) {
    fullHex = '#' + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2] + hexColor[3] + hexColor[3];
  }
  
  // Convert hex to RGB
  let r, g, b;
  try {
    r = parseInt(fullHex.slice(1, 3), 16);
    g = parseInt(fullHex.slice(3, 5), 16);
    b = parseInt(fullHex.slice(5, 7), 16);
  } catch (error) {
    console.error('Error parsing color:', error);
    return false;
  }
  
  // Calculate perceived brightness
  // Using the formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if color is dark (luminance < 0.5)
  return luminance < 0.5;
};

/**
 * Get appropriate text color for a background color
 * @param {string} bgColor - The background color in hex format
 * @returns {string} - "#FFFFFF" for dark backgrounds, "#000000" for light
 */
export const getTextColorForBackground = (bgColor) => {
  // For white, always use black
  if (bgColor === '#FFFFFF' || bgColor === '#FFF') {
    return '#000000';
  }
  
  // For black, always use white
  if (bgColor === '#000000' || bgColor === '#000') {
    return '#FFFFFF';
  }
  
  return isDarkColor(bgColor) ? '#FFFFFF' : '#000000';
};

/**
 * Adjusts a color's brightness
 * @param {string} color - The color in hex format
 * @param {number} factor - Factor to adjust brightness (0-2, where 1 is no change, <1 darkens, >1 lightens)
 * @returns {string} - The adjusted color
 */
export const adjustBrightness = (color, factor) => {
  if (!color || typeof color !== 'string' || !color.startsWith('#')) {
    return color;
  }
  
  // Handle shorthand hex
  let fullHex = color;
  if (color.length === 4) {
    fullHex = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }
  
  // Parse RGB values
  let r = parseInt(fullHex.slice(1, 3), 16);
  let g = parseInt(fullHex.slice(3, 5), 16);
  let b = parseInt(fullHex.slice(5, 7), 16);
  
  // Apply brightness factor
  r = Math.min(255, Math.max(0, Math.round(r * factor)));
  g = Math.min(255, Math.max(0, Math.round(g * factor)));
  b = Math.min(255, Math.max(0, Math.round(b * factor)));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Creates a complementary color
 * @param {string} hexColor - The color in hex format
 * @returns {string} - The complementary color
 */
export const getComplementaryColor = (hexColor) => {
  if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
    return hexColor;
  }
  
  // Handle shorthand hex
  let fullHex = hexColor;
  if (hexColor.length === 4) {
    fullHex = '#' + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2] + hexColor[3] + hexColor[3];
  }
  
  // Parse RGB values
  let r = parseInt(fullHex.slice(1, 3), 16);
  let g = parseInt(fullHex.slice(3, 5), 16);
  let b = parseInt(fullHex.slice(5, 7), 16);
  
  // Invert colors
  r = 255 - r;
  g = 255 - g;
  b = 255 - b;
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Creates a color with transparency
 * @param {string} hexColor - The color in hex format
 * @param {number} alpha - Alpha value (0-1)
 * @returns {string} - RGBA color string
 */
export const addAlpha = (hexColor, alpha) => {
  if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
    return hexColor;
  }
  
  // Handle shorthand hex
  let fullHex = hexColor;
  if (hexColor.length === 4) {
    fullHex = '#' + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2] + hexColor[3] + hexColor[3];
  }
  
  // Parse RGB values
  let r = parseInt(fullHex.slice(1, 3), 16);
  let g = parseInt(fullHex.slice(3, 5), 16);
  let b = parseInt(fullHex.slice(5, 7), 16);
  
  // Return RGBA string
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};