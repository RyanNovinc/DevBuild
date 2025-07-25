// src/screens/TodoListScreen/TodoStorageUtils.js
// Storage-related utility functions for the TodoListScreen
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Load todos from AsyncStorage
 */
export const loadTodos = async () => {
  try {
    console.log('Loading todos from AsyncStorage...');
    
    const todayData = await AsyncStorage.getItem('todos');
    const tomorrowData = await AsyncStorage.getItem('tomorrowTodos');
    const laterData = await AsyncStorage.getItem('laterTodos');
    
    console.log('Loaded data:', { 
      today: todayData ? 'data found' : 'no data', 
      tomorrow: tomorrowData ? 'data found' : 'no data',
      later: laterData ? 'data found' : 'no data'
    });
    
    return {
      today: todayData ? JSON.parse(todayData) : [],
      tomorrow: tomorrowData ? JSON.parse(tomorrowData) : [],
      later: laterData ? JSON.parse(laterData) : []
    };
  } catch (error) {
    console.error('Error loading todos:', error);
    // Fallback to empty arrays
    return { today: [], tomorrow: [], later: [] };
  }
};

/**
 * Load notes from AsyncStorage
 */
export const loadNotes = async () => {
  try {
    console.log('Loading notes from AsyncStorage...');
    const notesData = await AsyncStorage.getItem('notes');
    
    if (notesData) {
      const parsed = JSON.parse(notesData);
      console.log(`Loaded ${parsed.length} notes`);
      return parsed;
    } else {
      console.log('No notes found');
      return [];
    }
  } catch (error) {
    console.error('Error loading notes:', error);
    return [];
  }
};

/**
 * Load note folders from AsyncStorage
 */
export const loadNoteFolders = async () => {
  try {
    console.log('Loading note folders from AsyncStorage...');
    const foldersData = await AsyncStorage.getItem('noteFolders');
    
    if (foldersData) {
      const parsed = JSON.parse(foldersData);
      console.log(`Loaded ${parsed.length} note folders`);
      return parsed;
    } else {
      console.log('No note folders found');
      return [];
    }
  } catch (error) {
    console.error('Error loading note folders:', error);
    return [];
  }
};

/**
 * Load expanded groups state from AsyncStorage
 */
export const loadExpandedGroups = async () => {
  try {
    const savedState = await AsyncStorage.getItem('expandedGroups');
    if (savedState) {
      return JSON.parse(savedState);
    }
    return {};
  } catch (error) {
    console.error('Error loading expanded groups state:', error);
    return {};
  }
};

/**
 * Save todos to AsyncStorage
 */
export const saveTodos = async (todos, tomorrowTodos, laterTodos) => {
  try {
    await AsyncStorage.setItem('todos', JSON.stringify(todos));
    await AsyncStorage.setItem('tomorrowTodos', JSON.stringify(tomorrowTodos));
    await AsyncStorage.setItem('laterTodos', JSON.stringify(laterTodos));
  } catch (error) {
    console.error('Error saving todos:', error);
  }
};

/**
 * Save notes to AsyncStorage
 */
export const saveNotes = async (notes) => {
  try {
    await AsyncStorage.setItem('notes', JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes:', error);
  }
};

/**
 * Save note folders to AsyncStorage
 */
export const saveNoteFolders = async (noteFolders) => {
  try {
    await AsyncStorage.setItem('noteFolders', JSON.stringify(noteFolders));
  } catch (error) {
    console.error('Error saving note folders:', error);
  }
};

/**
 * Save expanded groups state to AsyncStorage
 */
export const saveExpandedGroups = async (expandedGroups) => {
  try {
    await AsyncStorage.setItem('expandedGroups', JSON.stringify(expandedGroups));
  } catch (error) {
    console.error('Error saving expanded groups state:', error);
  }
};