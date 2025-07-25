// src/context/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enhanced minimalist black and white theme colors with better contrast
const lightTheme = {
  primary: '#000000',         // Black
  primaryDark: '#333333',     // Dark gray
  secondary: '#555555',       // Medium gray
  accent: '#777777',          // Light gray
  background: '#FFFFFF',      // White
  card: '#F8F8F8',            // Very light gray
  text: '#000000',            // Black
  textSecondary: '#555555',   // Medium gray
  border: '#DDDDDD',          // IMPROVED: Slightly darker light gray border for better visibility
  error: '#D32F2F',           // IMPROVED: Slightly darker red for better contrast
  success: '#000000',         // Black
  warning: '#333333',         // Dark gray
  info: '#555555',            // Medium gray
  
  // IMPROVED: Text colors for elements on colored backgrounds
  primaryContrast: '#FFFFFF', // White text on black backgrounds
  errorLight: '#FFCDD2',      // Light red for error borders
  statusBar: '#000000',       // Status bar color
  
  // For certain components like profiles/cards that need text contrast
  cardElevated: '#F0F0F0',    // Slightly darker card for elevation

  // Domain colors - monochromatic with better contrast
  domains: {
    business: '#000000',      // Black
    finance: '#222222',       // Almost black
    health: '#333333',        // Dark gray
    relationships: '#444444', // Gray
    personalGrowth: '#555555', // Medium gray
    recreation: '#666666',    // Medium-light gray
    contribution: '#777777',  // Light gray
    spirituality: '#888888',  // Very light gray
  }
};

const darkTheme = {
  primary: '#FFFFFF',         // White
  primaryDark: '#EEEEEE',     // Very light gray
  secondary: '#CCCCCC',       // Light gray
  accent: '#AAAAAA',          // Medium gray
  background: '#000000',      // Black
  card: '#1A1A1A',            // IMPROVED: Slightly lighter than before for better visibility
  text: '#FFFFFF',            // White
  textSecondary: '#CCCCCC',   // Light gray
  border: '#333333',          // IMPROVED: Slightly lighter dark gray border for better visibility
  error: '#FF5252',           // Red
  success: '#FFFFFF',         // White
  warning: '#EEEEEE',         // Very light gray
  info: '#CCCCCC',            // Light gray
  
  // IMPROVED: Text colors for elements on colored backgrounds
  primaryContrast: '#000000', // Black text on white backgrounds 
  errorLight: '#660000',      // Dark red for error borders
  statusBar: '#000000',       // Status bar color
  
  // For certain components like profiles/cards that need text contrast
  cardElevated: '#2A2A2A',    // IMPROVED: Slightly lighter card for elevation & better contrast

  // Domain colors - monochromatic with better contrast
  domains: {
    business: '#FFFFFF',      // White
    finance: '#EEEEEE',       // Very light gray
    health: '#DDDDDD',        // Light gray
    relationships: '#CCCCCC', // Gray
    personalGrowth: '#BBBBBB', // Medium-light gray
    recreation: '#AAAAAA',    // Medium gray
    contribution: '#999999',  // Darker gray
    spirituality: '#888888',  // Even darker gray
  }
};

// Helper function to convert hex to RGB values
function hexToRgb(hex) {
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

// Helper function to create proper RGBA string
function createRgbaColor(hexColor, alpha = 1) {
  const { r, g, b } = hexToRgb(hexColor);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Helper function to get color with alpha - FIXED VERSION
function getColorWithAlpha(hexColor, alpha) {
  return createRgbaColor(hexColor, alpha);
}

// Create colored themes with custom primary color
const createColoredLightTheme = (primaryColor) => {
  return {
    ...lightTheme,
    primary: primaryColor,
    // Determine appropriate contrast color for text on primary background
    primaryContrast: getContrastColor(primaryColor),
    // Add helper function for alpha colors
    getColorWithAlpha: (color, alpha) => getColorWithAlpha(color || primaryColor, alpha)
  };
};

const createColoredDarkTheme = (primaryColor) => {
  return {
    ...darkTheme,
    primary: primaryColor,
    // Determine appropriate contrast color for text on primary background
    primaryContrast: getContrastColor(primaryColor),
    // Add helper function for alpha colors
    getColorWithAlpha: (color, alpha) => getColorWithAlpha(color || primaryColor, alpha)
  };
};

// Add alpha color helper to standard themes too
const enhancedLightTheme = {
  ...lightTheme,
  getColorWithAlpha: (color, alpha) => getColorWithAlpha(color || lightTheme.primary, alpha)
};

const enhancedDarkTheme = {
  ...darkTheme,
  getColorWithAlpha: (color, alpha) => getColorWithAlpha(color || darkTheme.primary, alpha)
};

// Helper function to determine contrast color
function getContrastColor(hexColor) {
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

// Create the theme context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Get device color scheme (light/dark)
  const deviceTheme = useColorScheme();
  
  // State for theme type and values
  const [themeType, setThemeType] = useState('system'); // 'light', 'dark', or 'system'
  const [isColoredTheme, setIsColoredTheme] = useState(false); // Flag for colored vs B&W theme
  const [themeColor, setThemeColor] = useState('#4CAF50'); // Default color if colored theme is selected
  const [theme, setTheme] = useState(deviceTheme === 'dark' ? enhancedDarkTheme : enhancedLightTheme);
  
  // Effect to load theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        // Load theme type (light/dark/system)
        const savedThemeType = await AsyncStorage.getItem('themeType');
        if (savedThemeType) {
          setThemeType(savedThemeType);
        }
        
        // Load colored theme preference
        const coloredThemeFlag = await AsyncStorage.getItem('isColoredTheme');
        const useColoredTheme = coloredThemeFlag === 'true';
        setIsColoredTheme(useColoredTheme);
        
        // Load custom color if available
        const savedColor = await AsyncStorage.getItem('themeColor');
        if (savedColor) {
          setThemeColor(savedColor);
        }
        
        // Set appropriate theme based on all preferences
        const isDark = savedThemeType === 'dark' || 
                      (savedThemeType === 'system' && deviceTheme === 'dark') ||
                      (!savedThemeType && deviceTheme === 'dark');
        
        if (useColoredTheme) {
          // Use colored theme with saved color
          setTheme(isDark 
            ? createColoredDarkTheme(savedColor || '#4CAF50') 
            : createColoredLightTheme(savedColor || '#4CAF50'));
        } else {
          // Use standard black & white theme
          setTheme(isDark ? enhancedDarkTheme : enhancedLightTheme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, [deviceTheme]);
  
  // Effect to update theme when device theme changes (if using system theme)
  useEffect(() => {
    if (themeType === 'system') {
      if (isColoredTheme) {
        setTheme(deviceTheme === 'dark' 
          ? createColoredDarkTheme(themeColor) 
          : createColoredLightTheme(themeColor));
      } else {
        setTheme(deviceTheme === 'dark' ? enhancedDarkTheme : enhancedLightTheme);
      }
    }
  }, [deviceTheme, themeType, isColoredTheme, themeColor]);
  
  // Function to change theme type (light/dark/system)
  const changeTheme = async (newThemeType) => {
    try {
      setThemeType(newThemeType);
      await AsyncStorage.setItem('themeType', newThemeType);
      
      // Determine if theme should be dark
      const isDark = newThemeType === 'dark' || 
                    (newThemeType === 'system' && deviceTheme === 'dark');
      
      // Update theme based on dark/light and whether colored theme is active
      if (isColoredTheme) {
        setTheme(isDark 
          ? createColoredDarkTheme(themeColor) 
          : createColoredLightTheme(themeColor));
      } else {
        setTheme(isDark ? enhancedDarkTheme : enhancedLightTheme);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  // Function to toggle between colored and B&W theme
  const toggleColoredTheme = async (useColored) => {
    try {
      setIsColoredTheme(useColored);
      await AsyncStorage.setItem('isColoredTheme', String(useColored));
      
      // Determine if theme should be dark
      const isDark = themeType === 'dark' || 
                    (themeType === 'system' && deviceTheme === 'dark');
      
      // Update theme based on dark/light and whether colored theme is active
      if (useColored) {
        setTheme(isDark 
          ? createColoredDarkTheme(themeColor) 
          : createColoredLightTheme(themeColor));
      } else {
        setTheme(isDark ? enhancedDarkTheme : enhancedLightTheme);
      }
    } catch (error) {
      console.error('Error toggling colored theme:', error);
    }
  };
  
  // Function to update theme color (only affects appearance if colored theme is active)
  const updateThemeColor = async (color) => {
    try {
      // Save the color
      setThemeColor(color);
      await AsyncStorage.setItem('themeColor', color);
      
      // Only update the theme if colored theme is active
      if (isColoredTheme) {
        const isDark = themeType === 'dark' || 
                      (themeType === 'system' && deviceTheme === 'dark');
        
        setTheme(isDark 
          ? createColoredDarkTheme(color) 
          : createColoredLightTheme(color));
      }
    } catch (error) {
      console.error('Error updating theme color:', error);
    }
  };
  
  // Function for ProfileScreen to use
  const updateTheme = async (themeUpdates) => {
    if (themeUpdates.primary) {
      await updateThemeColor(themeUpdates.primary);
    }
  };
  
  return (
    <ThemeContext.Provider value={{ 
      theme, 
      themeType, 
      changeTheme, 
      updateTheme,
      isColoredTheme,
      toggleColoredTheme,
      themeColor
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;