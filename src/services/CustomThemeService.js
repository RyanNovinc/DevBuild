// src/services/CustomThemeService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_THEMES_KEY = 'customThemes';
const MAX_CUSTOM_THEMES = 10; // Limit to prevent storage bloat

/**
 * Save a custom theme created by the user
 */
export const saveCustomTheme = async (themeName, color) => {
  try {
    // Get existing custom themes
    const existingThemes = await getCustomThemes();
    
    // Create new theme object
    const newTheme = {
      id: `custom_${Date.now()}`,
      name: themeName,
      color: color,
      createdAt: new Date().toISOString(),
      isPremium: true // Custom themes are premium feature
    };
    
    // Check if theme with this name already exists
    const existingIndex = existingThemes.findIndex(theme => theme.name === themeName);
    
    let updatedThemes;
    if (existingIndex >= 0) {
      // Update existing theme
      updatedThemes = [...existingThemes];
      updatedThemes[existingIndex] = { ...updatedThemes[existingIndex], ...newTheme };
    } else {
      // Add new theme
      updatedThemes = [newTheme, ...existingThemes];
      
      // Limit number of custom themes
      if (updatedThemes.length > MAX_CUSTOM_THEMES) {
        updatedThemes = updatedThemes.slice(0, MAX_CUSTOM_THEMES);
      }
    }
    
    // Save to storage
    await AsyncStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updatedThemes));
    
    return {
      success: true,
      theme: newTheme,
      totalThemes: updatedThemes.length
    };
  } catch (error) {
    console.error('Error saving custom theme:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Save a custom theme at a specific position
 */
export const saveCustomThemeAtPosition = async (themeName, color, position = null) => {
  try {
    // Get existing custom themes with positions
    const existingThemes = await getCustomThemesWithPositions();
    
    // Create new theme object
    const newTheme = {
      id: `custom_${Date.now()}`,
      name: themeName,
      color: color,
      createdAt: new Date().toISOString(),
      isPremium: true // Custom themes are premium feature
    };
    
    // Check if theme with this name already exists (filter out null values)
    const existingIndex = existingThemes.findIndex(theme => theme && theme.name === themeName);
    
    // Since we already have a positioned array, work with it directly
    let updatedThemes = [...existingThemes];
    
    if (existingIndex >= 0) {
      // Update existing theme, keep it in the same position
      updatedThemes[existingIndex] = { ...updatedThemes[existingIndex], ...newTheme };
    } else {
      // Add new theme at specific position if provided
      if (position !== null && position >= 0 && position < MAX_CUSTOM_THEMES) {
        updatedThemes[position] = newTheme;
      } else {
        // Find first empty slot
        const emptyIndex = updatedThemes.findIndex(theme => theme === null);
        if (emptyIndex >= 0) {
          updatedThemes[emptyIndex] = newTheme;
        } else {
          // If no empty slots, replace the first theme
          updatedThemes[0] = newTheme;
        }
      }
    }
    
    // Remove trailing nulls to keep storage efficient
    while (updatedThemes.length > 0 && updatedThemes[updatedThemes.length - 1] === null) {
      updatedThemes.pop();
    }
    
    // Save to storage
    await AsyncStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updatedThemes));
    
    return {
      success: true,
      theme: newTheme,
      totalThemes: updatedThemes.length
    };
  } catch (error) {
    console.error('Error saving custom theme at position:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all custom themes created by the user
 */
export const getCustomThemes = async () => {
  try {
    const themesJson = await AsyncStorage.getItem(CUSTOM_THEMES_KEY);
    if (themesJson) {
      const themes = JSON.parse(themesJson);
      return Array.isArray(themes) ? themes : [];
    }
    return [];
  } catch (error) {
    console.error('Error getting custom themes:', error);
    return [];
  }
};

/**
 * Get custom themes with proper positioning (includes null values for empty slots)
 */
export const getCustomThemesWithPositions = async () => {
  try {
    const themesJson = await AsyncStorage.getItem(CUSTOM_THEMES_KEY);
    if (themesJson) {
      const themes = JSON.parse(themesJson);
      if (Array.isArray(themes)) {
        // Expand array to MAX_CUSTOM_THEMES length, filling with null for empty slots
        const positionedThemes = Array(MAX_CUSTOM_THEMES).fill(null);
        themes.forEach((theme, index) => {
          if (index < MAX_CUSTOM_THEMES) {
            positionedThemes[index] = theme;
          }
        });
        return positionedThemes;
      }
    }
    return Array(MAX_CUSTOM_THEMES).fill(null);
  } catch (error) {
    console.error('Error getting custom themes with positions:', error);
    return Array(MAX_CUSTOM_THEMES).fill(null);
  }
};

/**
 * Delete a custom theme
 */
export const deleteCustomTheme = async (themeId) => {
  try {
    const existingThemes = await getCustomThemes();
    const updatedThemes = existingThemes.filter(theme => theme.id !== themeId);
    
    await AsyncStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updatedThemes));
    
    return {
      success: true,
      remainingThemes: updatedThemes.length
    };
  } catch (error) {
    console.error('Error deleting custom theme:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete a custom theme at a specific position
 */
export const deleteCustomThemeAtPosition = async (position) => {
  try {
    const existingThemes = await getCustomThemesWithPositions();
    
    // Set the theme at the specified position to null
    if (position >= 0 && position < existingThemes.length) {
      existingThemes[position] = null;
    }
    
    // Remove trailing nulls to keep storage efficient
    while (existingThemes.length > 0 && existingThemes[existingThemes.length - 1] === null) {
      existingThemes.pop();
    }
    
    await AsyncStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(existingThemes));
    
    return {
      success: true,
      remainingThemes: existingThemes.filter(t => t !== null).length
    };
  } catch (error) {
    console.error('Error deleting custom theme at position:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Rename a custom theme
 */
export const renameCustomTheme = async (themeId, newName) => {
  try {
    const existingThemes = await getCustomThemes();
    const themeIndex = existingThemes.findIndex(theme => theme.id === themeId);
    
    if (themeIndex === -1) {
      return {
        success: false,
        error: 'Theme not found'
      };
    }
    
    // Check if new name already exists
    const nameExists = existingThemes.some((theme, index) => 
      theme.name === newName && index !== themeIndex
    );
    
    if (nameExists) {
      return {
        success: false,
        error: 'Theme name already exists'
      };
    }
    
    // Update theme name
    const updatedThemes = [...existingThemes];
    updatedThemes[themeIndex] = {
      ...updatedThemes[themeIndex],
      name: newName,
      updatedAt: new Date().toISOString()
    };
    
    await AsyncStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updatedThemes));
    
    return {
      success: true,
      theme: updatedThemes[themeIndex]
    };
  } catch (error) {
    console.error('Error renaming custom theme:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if user can create more custom themes
 */
export const canCreateMoreThemes = async () => {
  try {
    const existingThemes = await getCustomThemes();
    return existingThemes.length < MAX_CUSTOM_THEMES;
  } catch (error) {
    console.error('Error checking custom theme limit:', error);
    return false;
  }
};

/**
 * Get theme creation statistics
 */
export const getThemeStats = async () => {
  try {
    const existingThemes = await getCustomThemes();
    return {
      totalThemes: existingThemes.length,
      maxThemes: MAX_CUSTOM_THEMES,
      canCreateMore: existingThemes.length < MAX_CUSTOM_THEMES,
      recentThemes: existingThemes.slice(0, 3) // Most recent 3 themes
    };
  } catch (error) {
    console.error('Error getting theme stats:', error);
    return {
      totalThemes: 0,
      maxThemes: MAX_CUSTOM_THEMES,
      canCreateMore: true,
      recentThemes: []
    };
  }
};

export default {
  saveCustomTheme,
  saveCustomThemeAtPosition,
  getCustomThemes,
  getCustomThemesWithPositions,
  deleteCustomTheme,
  deleteCustomThemeAtPosition,
  renameCustomTheme,
  canCreateMoreThemes,
  getThemeStats,
  MAX_CUSTOM_THEMES
};