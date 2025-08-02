// src/context/ThemeContext/index.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { 
  enhancedLightTheme, 
  enhancedDarkTheme,
  createColoredLightTheme,
  createColoredDarkTheme
} from './utils';

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