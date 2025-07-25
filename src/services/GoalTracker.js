// src/services/GoalTracker.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import AchievementService from './AchievementService';

// Key for tracking first goal achievement
const FIRST_GOAL_KEY = 'achievement_tracker_first_goal';
// Key for tracking if the achievement has been shown
const FIRST_GOAL_SHOWN_KEY = 'achievement_shown_goal_pioneer';

// Debug flag
const DEBUG_MODE = true;

const logDebug = (...args) => {
  if (DEBUG_MODE) {
    console.log('[GoalTracker]', ...args);
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
 * Track when a goal is saved and trigger achievement if needed
 * @param {Object} goal - The goal object being saved
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackGoalSave = async (goal, showSuccess = null) => {
  try {
    logDebug('Tracking goal save:', goal?.id);
    
    // Check if this is a new goal (ID format typically includes 'goal-' prefix)
    const isNewGoal = goal?.id && goal.id.includes('goal-') && !goal.previouslySaved;
    
    if (isNewGoal) {
      logDebug('New goal detected, checking for first goal achievement');
      
      // Check if we've already tracked first goal
      const hasTrackedFirstGoal = await AsyncStorage.getItem(FIRST_GOAL_KEY);
      logDebug('Has tracked first goal before:', hasTrackedFirstGoal);
      
      if (hasTrackedFirstGoal !== 'true') {
        // This is the first goal
        logDebug('First goal ever, unlocking achievement');
        
        // Set tracking flag immediately to prevent duplicate unlocks
        await AsyncStorage.setItem(FIRST_GOAL_KEY, 'true');
        
        // Check if achievement has been shown before
        const hasShown = await hasAchievementBeenShown('goal-pioneer');
        
        if (!hasShown) {
          // DIRECT APPROACH: Unlock the achievement immediately
          // This is more reliable than going through checkAchievements
          await AchievementService.unlockAchievement('goal-pioneer', showSuccess);
          
          // Mark achievement as shown to prevent duplicate notifications
          await markAchievementAsShown('goal-pioneer');
          
          logDebug('First goal achievement should be unlocked now');
        } else {
          logDebug('First goal achievement already shown, skipping notification');
        }
      } else {
        // Not the first goal, but could still check for other goal-related achievements
        logDebug('Not the first goal, checking for other achievements');
        
        try {
          // Make sure we're passing a valid goal object with required properties
          if (goal) {
            const safeGoal = {
              ...goal,
              // Ensure domain property exists
              domain: goal.domain || goal.domainName || 'General'
            };
            
            await AchievementService.checkAchievements({
              type: 'goal_created',
              goals: [safeGoal]
            }, showSuccess);
          }
        } catch (err) {
          logDebug('Error checking achievements:', err);
        }
      }
    }
  } catch (error) {
    console.error('Error tracking goal save:', error);
  }
};

/**
 * Force unlock the first goal achievement (for testing)
 */
export const forceUnlockFirstGoalAchievement = async (showSuccess = null) => {
  logDebug('Force unlocking first goal achievement');
  
  try {
    // Check if achievement has been shown before
    const hasShown = await hasAchievementBeenShown('goal-pioneer');
    
    // Mark that we've tracked first goal
    await AsyncStorage.setItem(FIRST_GOAL_KEY, 'true');
    
    if (!hasShown) {
      // Directly unlock the achievement
      await AchievementService.unlockAchievement('goal-pioneer', showSuccess);
      
      // Mark as shown
      await markAchievementAsShown('goal-pioneer');
      
      logDebug('First goal achievement force unlocked');
    } else {
      logDebug('First goal achievement already shown, skipping notification');
    }
    
    return true;
  } catch (error) {
    console.error('Error force unlocking first goal achievement:', error);
    return false;
  }
};

/**
 * Reset goal tracking (for testing)
 */
export const resetGoalTracking = async () => {
  try {
    await AsyncStorage.removeItem(FIRST_GOAL_KEY);
    await AsyncStorage.removeItem(FIRST_GOAL_SHOWN_KEY);
    logDebug('Goal tracking reset');
    return true;
  } catch (error) {
    console.error('Error resetting goal tracking:', error);
    return false;
  }
};

export default {
  trackGoalSave,
  forceUnlockFirstGoalAchievement,
  resetGoalTracking
};