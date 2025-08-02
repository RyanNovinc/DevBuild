// src/context/AuthContext/utils.js
// Utility functions for authentication management

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for user data
const USER_STORAGE_KEY = 'user';

/**
 * Load user data from AsyncStorage
 * @returns {Promise<Object|null>} - User data object or null if not found
 */
export const loadUserFromStorage = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};

/**
 * Save user data to AsyncStorage
 * @param {Object} userData - User data to save
 * @returns {Promise<boolean>} - Success status
 */
export const saveUserToStorage = async (userData) => {
  try {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

/**
 * Remove user data from AsyncStorage (for logout)
 * @returns {Promise<boolean>} - Success status
 */
export const removeUserFromStorage = async () => {
  try {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error removing user data:', error);
    return false;
  }
};

/**
 * Create a mock user for development/testing
 * @param {string} email - User email
 * @param {string} displayName - User display name
 * @returns {Object} - Mock user object
 */
export const createMockUser = (email = 'user@example.com', displayName = null) => {
  return {
    id: 'mock-user-' + Date.now(),
    email,
    displayName: displayName || email.split('@')[0],
  };
};

/**
 * Create a user object from login credentials
 * @param {string} email - User email
 * @param {string} displayName - Optional display name
 * @returns {Object} - User object
 */
export const createUserFromCredentials = (email, displayName = null) => {
  return {
    id: Date.now().toString(),
    email,
    displayName: displayName || email.split('@')[0],
  };
};

/**
 * Update user data with new values
 * @param {Object} currentUser - Current user object
 * @param {Object} updates - Fields to update
 * @returns {Object} - Updated user object
 */
export const updateUserData = (currentUser, updates) => {
  if (!currentUser) {
    throw new Error('User not found');
  }
  
  return {
    ...currentUser,
    ...updates,
  };
};