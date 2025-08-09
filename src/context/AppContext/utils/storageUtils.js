// src/context/AppContext/utils/storageUtils.js
// Extracted storage utility functions from AppContext.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

/**
 * Save data to AsyncStorage with proper error handling
 * @param {string} key - Storage key
 * @param {any} data - Data to store (will be JSON stringified)
 * @returns {Promise<void>}
 */
export const saveData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to AsyncStorage:`, error);
    throw error;
  }
};

/**
 * Load data from AsyncStorage with proper error handling
 * @param {string} key - Storage key
 * @returns {Promise<any>} - Parsed data or null if not found
 */
export const loadData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading ${key} from AsyncStorage:`, error);
    return null;
  }
};

/**
 * Load all app data from AsyncStorage
 * @returns {Promise<Object>} - Object containing all loaded data
 */
export const loadAppData = async () => {
  try {
    // Create array of promises for all data loads
    const dataPromises = [
      loadData(STORAGE_KEYS.GOALS).then(data => ({ goals: data || [] })),
      loadData(STORAGE_KEYS.PROJECTS).then(data => ({ projects: data || [] })),
      loadData(STORAGE_KEYS.TASKS).then(data => ({ tasks: data || [] })),
      loadData(STORAGE_KEYS.TIME_BLOCKS).then(data => ({ timeBlocks: data || [] })),
      loadData(STORAGE_KEYS.DOMAINS).then(data => ({ domains: data || [] })),
      loadData(STORAGE_KEYS.SETTINGS).then(data => ({ settings: data || null })),
      loadData(STORAGE_KEYS.TAGS).then(data => ({ tags: data || [] })),
      loadData(STORAGE_KEYS.NOTES).then(data => ({ notes: data || [] })),
      loadData(STORAGE_KEYS.FILTERS).then(data => ({ filters: data || {} })),
      loadData(STORAGE_KEYS.PROJECT_GOAL_LINK_MAP).then(data => ({ projectGoalLinkMap: data || {} })),
      loadData(STORAGE_KEYS.TODOS).then(data => ({ todos: data || [] })),
      loadData(STORAGE_KEYS.TOMORROW_TODOS).then(data => ({ tomorrowTodos: data || [] })),
      loadData(STORAGE_KEYS.LATER_TODOS).then(data => ({ laterTodos: data || [] })),
      loadData(STORAGE_KEYS.USER_COUNTRY).then(data => ({ userCountry: data || null })),
    ];
    
    // Wait for all promises to resolve
    const results = await Promise.all(dataPromises);
    
    // Merge all results into a single object
    return results.reduce((acc, result) => ({ ...acc, ...result }), {});
  } catch (error) {
    console.error('Error loading app data:', error);
    // Return empty data to prevent crashes
    return {
      goals: [],
      projects: [],
      tasks: [],
      timeBlocks: [],
      domains: [],
      settings: null,
      tags: [],
      notes: [],
      filters: {},
      projectGoalLinkMap: {},
      todos: [],
      tomorrowTodos: [],
      laterTodos: [],
      userCountry: null,
    };
  }
};

/**
 * Delete multiple items from AsyncStorage
 * @param {Array<string>} keys - Array of keys to delete
 * @returns {Promise<void>}
 */
export const removeMultipleItems = async (keys) => {
  try {
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Error removing items from AsyncStorage:', error);
    throw error;
  }
};

/**
 * Reset all app data (for testing or user reset)
 * @returns {Promise<void>}
 */
export const resetAllData = async () => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await removeMultipleItems(keys);
    return true;
  } catch (error) {
    console.error('Error resetting app data:', error);
    throw error;
  }
};