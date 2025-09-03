// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple AsyncStorage utilities - back to basics!
export const calendarStorage = {
  // View Mode - async functions
  getViewMode: async () => {
    try {
      const stored = await AsyncStorage.getItem('monthViewMode');
      return stored || 'dots';
    } catch (error) {
      console.error('Error getting view mode:', error);
      return 'dots';
    }
  },
  
  setViewMode: async (mode) => {
    try {
      await AsyncStorage.setItem('monthViewMode', mode);
    } catch (error) {
      console.error('Error setting view mode:', error);
    }
  },
  
  // Calendar Icons - async functions  
  getCalendarIcons: async () => {
    try {
      const stored = await AsyncStorage.getItem('calendarIcons');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting calendar icons:', error);
      return {};
    }
  },
  
  setCalendarIcons: async (icons) => {
    try {
      await AsyncStorage.setItem('calendarIcons', JSON.stringify(icons));
    } catch (error) {
      console.error('Error saving calendar icons:', error);
    }
  }
};

