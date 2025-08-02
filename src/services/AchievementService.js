// src/services/AchievementService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACHIEVEMENTS } from '../screens/AchievementsScreen/data/achievementsData';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { showAchievementNotification } from './AchievementNotificationManager';

// Queue for new achievements (to be displayed on achievements screen)
let newAchievementsQueue = [];

// In-memory cache of unlocked achievements
let unlockedAchievementsCache = null;

// Debug flag - set to true for extra logging
const DEBUG_MODE = true;

/**
 * Logger function with debug mode support
 */
const logDebug = (...args) => {
  if (DEBUG_MODE) {
    console.log('[AchievementService]', ...args);
  }
};

/**
 * Check if achievement has already been shown to user
 */
const hasAchievementBeenShown = async (achievementId) => {
  try {
    const result = await AsyncStorage.getItem(`achievement_shown_${achievementId}`);
    return result === 'true';
  } catch (error) {
    console.error('Error checking if achievement has been shown:', error);
    return false;
  }
};

/**
 * Mark achievement as shown to user
 */
const markAchievementAsShown = async (achievementId) => {
  try {
    await AsyncStorage.setItem(`achievement_shown_${achievementId}`, 'true');
    logDebug(`Marked achievement ${achievementId} as shown`);
  } catch (error) {
    console.error('Error marking achievement as shown:', error);
  }
};

/**
 * Load unlocked achievements from AsyncStorage
 */
const loadUnlockedAchievements = async () => {
  try {
    if (unlockedAchievementsCache) {
      return unlockedAchievementsCache;
    }

    const achievementsData = await AsyncStorage.getItem('unlockedAchievements');
    logDebug('Loading achievements from AsyncStorage');
    
    if (achievementsData) {
      try {
        unlockedAchievementsCache = JSON.parse(achievementsData);
        logDebug(`Loaded ${Object.keys(unlockedAchievementsCache).length} achievements`);
        return unlockedAchievementsCache;
      } catch (e) {
        logDebug('Error parsing achievements data:', e);
        unlockedAchievementsCache = {};
        return {};
      }
    }
    
    // Initialize with empty object if not found
    logDebug('No achievements found in storage, initializing empty cache');
    unlockedAchievementsCache = {};
    return unlockedAchievementsCache;
  } catch (error) {
    console.error('Error loading achievements:', error);
    return {};
  }
};

/**
 * Save unlocked achievements to AsyncStorage
 */
const saveUnlockedAchievements = async (achievements) => {
  try {
    unlockedAchievementsCache = achievements;
    await AsyncStorage.setItem('unlockedAchievements', JSON.stringify(achievements));
    logDebug(`Saved ${Object.keys(achievements).length} achievements to AsyncStorage`);
  } catch (error) {
    console.error('Error saving achievements:', error);
  }
};

/**
 * Check if an achievement is unlocked
 */
export const isAchievementUnlocked = async (achievementId) => {
  const unlocked = await loadUnlockedAchievements();
  return unlocked[achievementId]?.unlocked === true;
};

/**
 * Get all unlocked achievements
 */
export const getUnlockedAchievements = async () => {
  return await loadUnlockedAchievements();
};

/**
 * Get the queue of newly unlocked achievements
 */
export const getNewAchievementsQueue = () => {
  return [...newAchievementsQueue];
};

/**
 * Clear the queue of newly unlocked achievements
 */
export const clearNewAchievementsQueue = () => {
  newAchievementsQueue = [];
};

/**
 * Unlock an achievement with improved notification and state refresh
 * @param {string} achievementId - The ID of the achievement to unlock
 * @param {function} showSuccess - Optional notification function
 * @returns {boolean} - Whether the achievement was newly unlocked
 */
export const unlockAchievement = async (achievementId, showSuccess = null) => {
  // Validate the achievement exists
  if (!ACHIEVEMENTS[achievementId]) {
    console.error(`Achievement ${achievementId} does not exist`);
    return false;
  }
  
  try {
    logDebug(`Attempting to unlock achievement: ${achievementId}`);
    console.log(`[AchievementService] Attempting to unlock achievement: ${achievementId}`);
    
    // Check if this achievement has already been shown to the user
    const alreadyShown = await hasAchievementBeenShown(achievementId);
    if (alreadyShown) {
      logDebug(`Achievement ${achievementId} already shown to user, skipping notification`);
      // Still continue to make sure the achievement is marked as unlocked in storage
    }
    
    // Load current achievements directly from storage for most up-to-date state
    const achievementsData = await AsyncStorage.getItem('unlockedAchievements');
    let unlocked = {};
    
    if (achievementsData) {
      try {
        unlocked = JSON.parse(achievementsData);
      } catch (e) {
        console.error('Error parsing achievements data:', e);
        // Continue with empty object
      }
    }
    
    // Check if already unlocked
    if (unlocked[achievementId]?.unlocked) {
      logDebug(`Achievement ${achievementId} already unlocked, skipping`);
      return false; // Already unlocked
    }
    
    logDebug(`Unlocking achievement: ${achievementId}`);
    console.log(`[AchievementService] Unlocking achievement: ${achievementId}`);
    
    // Update achievements
    const updatedAchievements = {
      ...unlocked,
      [achievementId]: {
        unlocked: true,
        date: new Date().toISOString(),
        seen: false
      }
    };
    
    // Save to AsyncStorage
    await AsyncStorage.setItem('unlockedAchievements', JSON.stringify(updatedAchievements));
    logDebug(`Saved updated achievements to storage: ${Object.keys(updatedAchievements).length} achievements`);
    
    // Update in-memory cache
    unlockedAchievementsCache = updatedAchievements;
    
    // Add to new achievements queue
    newAchievementsQueue.push({
      id: achievementId,
      date: new Date().toISOString()
    });
    
    // Provide haptic feedback on supported platforms
    if (Platform.OS !== 'web') {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        logDebug('Provided haptic feedback');
      } catch (err) {
        logDebug('Haptic feedback error:', err);
      }
    }
    
    // Show success notification if provided
    if (showSuccess && typeof showSuccess === 'function') {
      const achievement = ACHIEVEMENTS[achievementId];
      showSuccess(`Achievement Unlocked: ${achievement.title}`);
      logDebug('Called showSuccess notification function');
    }
    
    // IMPORTANT: Show the achievement notification using our direct method
    const achievement = ACHIEVEMENTS[achievementId];
    if (achievement) {
      logDebug('Showing achievement notification for:', achievement.title);
      console.log(`[AchievementService] Showing notification for: ${achievement.title}`);
      
      // Import and directly use notification manager to ensure it's called
      try {
        const { showAchievementNotification } = require('./AchievementNotificationManager');
        if (typeof showAchievementNotification === 'function') {
          console.log(`[AchievementService] Calling showAchievementNotification directly`);
          showAchievementNotification(achievement);
        } else {
          console.error('[AchievementService] showAchievementNotification is not a function!');
          // Fallback: Try to dispatch event
          if (typeof document !== 'undefined') {
            const event = new CustomEvent('achievement-unlocked', { 
              detail: { achievementId, achievement } 
            });
            document.dispatchEvent(event);
            console.log('[AchievementService] Dispatched achievement-unlocked event');
          }
        }
      } catch (err) {
        console.error('[AchievementService] Error showing notification:', err);
        
        // Fallback: Try to dispatch event
        if (typeof document !== 'undefined') {
          const event = new CustomEvent('achievement-unlocked', { 
            detail: { achievementId, achievement } 
          });
          document.dispatchEvent(event);
          console.log('[AchievementService] Dispatched achievement-unlocked event as fallback');
        }
      }
      
      // Mark achievement as shown to prevent showing it again
      if (!alreadyShown) {
        await markAchievementAsShown(achievementId);
      }
    }
    
    // Try to refresh the achievement context if it exists
    if (typeof global !== 'undefined' && global.achievementContextInstance) {
      try {
        if (typeof global.achievementContextInstance.refreshAchievements === 'function') {
          logDebug('Directly calling context refresh via global instance');
          global.achievementContextInstance.refreshAchievements();
        }
      } catch (err) {
        logDebug('Error calling direct context refresh:', err);
      }
    }
    
    logDebug(`Achievement Successfully Unlocked: ${ACHIEVEMENTS[achievementId].title}`);
    return true;
  } catch (error) {
    console.error('Error in unlockAchievement:', error);
    return false;
  }
};

/**
 * Mark achievements as seen
 * @param {Array} achievementIds - Array of achievement IDs to mark as seen
 */
export const markAchievementsAsSeen = async (achievementIds) => {
  const unlocked = await loadUnlockedAchievements();
  
  let updated = false;
  const updatedAchievements = { ...unlocked };
  
  achievementIds.forEach(id => {
    if (updatedAchievements[id] && !updatedAchievements[id].seen) {
      updatedAchievements[id].seen = true;
      updated = true;
    }
  });
  
  if (updated) {
    await saveUnlockedAchievements(updatedAchievements);
    logDebug(`Marked ${achievementIds.length} achievements as seen`);
  }
};

/**
 * Check for eligible achievements based on app state or user actions
 * This is where you'll implement specific achievement criteria
 */
export const checkAchievements = async (context, showSuccess = null) => {
  logDebug('Checking achievements for context:', context?.type);
  console.log('[AchievementService] Checking achievements for context:', context?.type);
  
  // Goal creation
  if (context.type === 'goal_created') {
    try {
      const totalGoals = context.goals?.length || 0;
      
      // Enhanced first goal detection
      if (totalGoals >= 1 || context.firstGoal) {
        logDebug('First goal achievement criteria met!');
        console.log('[AchievementService] First goal achievement criteria met!');
        
        // Double-check if already unlocked before attempting to unlock
        const isAlreadyUnlocked = await isAchievementUnlocked('goal-pioneer');
        
        if (!isAlreadyUnlocked) {
          logDebug('Unlocking goal-pioneer achievement...');
          console.log('[AchievementService] Unlocking goal-pioneer achievement...');
          const result = await unlockAchievement('goal-pioneer', showSuccess);
          logDebug('Unlock result:', result);
          console.log('[AchievementService] Unlock result:', result);
        } else {
          logDebug('goal-pioneer achievement already unlocked');
        }
      }
      
      // Check for goals in different domains
      if (context.goals && Array.isArray(context.goals)) {
        // Safely access domains with a fallback
        const uniqueDomains = new Set(
          context.goals
            .map(goal => goal?.domain || goal?.domainName || 'General')
            .filter(Boolean)
        );
        
        if (uniqueDomains.size >= 3) {
          await unlockAchievement('domain-diversifier', showSuccess);
        }
      }
    } catch (error) {
      console.error('Error processing goal_created achievement:', error);
    }
  }
  
  // Project creation
  if (context.type === 'project_created') {
    try {
      // First project achievement
      if (context.firstProject) {
        const isAlreadyUnlocked = await isAchievementUnlocked('project-planner');
        if (!isAlreadyUnlocked) {
          await unlockAchievement('project-planner', showSuccess);
        }
      }
      
      // Project linked to goal achievement
      if (context.linkedToGoal) {
        const isAlreadyUnlocked = await isAchievementUnlocked('strategic-thinker');
        if (!isAlreadyUnlocked) {
          await unlockAchievement('strategic-thinker', showSuccess);
        }
      }
    } catch (error) {
      console.error('Error processing project_created achievement:', error);
    }
  }
  
  // Task completion
  if (context.type === 'task_completed') {
    try {
      // Task completion achievement
      const completedTasks = context.completedTasks || 1;
      
      if (completedTasks >= 1) {
        const isAlreadyUnlocked = await isAchievementUnlocked('task-completer');
        if (!isAlreadyUnlocked) {
          await unlockAchievement('task-completer', showSuccess);
        }
      }
    } catch (error) {
      console.error('Error processing task_completed achievement:', error);
    }
  }
  
  // Goal completion
  if (context.type === 'goal_completed') {
    try {
      const isAlreadyUnlocked = await isAchievementUnlocked('completion-champion');
      if (!isAlreadyUnlocked) {
        // Only unlock premium "Completion Champion" achievement if user is Pro
        if (context.isPro === true) {
          console.log('Pro user completed goal, unlocking completion-champion achievement');
          await unlockAchievement('completion-champion', showSuccess);
        } else {
          console.log('Non-pro user completed goal, skipping premium achievement');
        }
      }
    } catch (error) {
      console.error('Error processing goal_completed achievement:', error);
    }
  }
  
  // Add more achievement checks as needed
};

/**
 * Force unlock an achievement directly (for testing)
 */
export const forceUnlockAchievement = async (achievementId) => {
  logDebug(`Force unlocking achievement: ${achievementId}`);
  console.log(`[AchievementService] Force unlocking achievement: ${achievementId}`);
  return await unlockAchievement(achievementId);
};

/**
 * Helper to reset all achievements (for testing)
 */
export const resetAllAchievements = async () => {
  try {
    await AsyncStorage.setItem('unlockedAchievements', JSON.stringify({}));
    
    // Also clear achievement tracking markers
    const allKeys = await AsyncStorage.getAllKeys();
    const trackerKeys = allKeys.filter(key => 
      key.startsWith('achievement_tracker_') || 
      key.startsWith('achievement_shown_')
    );
    
    if (trackerKeys.length > 0) {
      await AsyncStorage.multiRemove(trackerKeys);
      logDebug(`Cleared ${trackerKeys.length} achievement tracker markers`);
    }
    
    unlockedAchievementsCache = {};
    newAchievementsQueue = [];
    logDebug('Reset all achievements');
    return true;
  } catch (error) {
    console.error('Error resetting achievements:', error);
    return false;
  }
};

export default {
  unlockAchievement,
  forceUnlockAchievement,
  isAchievementUnlocked,
  getUnlockedAchievements,
  getNewAchievementsQueue,
  clearNewAchievementsQueue,
  markAchievementsAsSeen,
  checkAchievements,
  resetAllAchievements
};