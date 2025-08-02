// src/services/AchievementTracker.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkAchievements } from './AchievementService';

// Prefix for all achievement tracking keys
const TRACKING_PREFIX = 'achievement_tracker_';

// Common tracking keys for different achievement types
const TRACKING_KEYS = {
  FIRST_GOAL: `${TRACKING_PREFIX}first_goal`,
  FIRST_PROJECT: `${TRACKING_PREFIX}first_project`,
  FIRST_TASK: `${TRACKING_PREFIX}first_task`,
  FIRST_TIME_BLOCK: `${TRACKING_PREFIX}first_time_block`,
  FIRST_AI_CONVERSATION: `${TRACKING_PREFIX}first_ai_conversation`,
  FIRST_DOCUMENT: `${TRACKING_PREFIX}first_document_upload`,
  // Add more tracking keys as needed
};

/**
 * Generic function to track an action that could trigger achievements
 * 
 * @param {string} actionType - Type of action (e.g., 'goal_created', 'project_created')
 * @param {Object} data - Data related to the action (e.g., the goal or project)
 * @param {Function} showSuccess - Optional notification function
 * @returns {Promise<boolean>} - Whether tracking was successful
 */
export const trackAction = async (actionType, data, showSuccess = null) => {
  try {
    console.log(`Tracking action: ${actionType}`);
    
    // Handle different action types
    switch (actionType) {
      case 'goal_created':
        return await trackGoalCreation(data, showSuccess);
      
      case 'project_created':
        return await trackProjectCreation(data, showSuccess);
      
      case 'task_completed':
        return await trackTaskCompletion(data, showSuccess);
      
      case 'time_block_created':
        return await trackTimeBlockCreation(data, showSuccess);
        
      case 'ai_conversation_completed':
        return await trackAiConversation(data, showSuccess);
        
      case 'document_uploaded':
        return await trackDocumentUpload(data, showSuccess);
        
      // Add more action types as needed
        
      default:
        // For any unhandled action types, just pass directly to achievement check
        await checkAchievements({
          type: actionType,
          ...data
        }, showSuccess);
        return true;
    }
  } catch (error) {
    console.error(`Error tracking action ${actionType}:`, error);
    return false;
  }
};

/**
 * Track goal creation with enhanced achievement unlocking
 */
const trackGoalCreation = async (data, showSuccess) => {
  // Check if first goal has been tracked
  const hasTrackedFirstGoal = await AsyncStorage.getItem(TRACKING_KEYS.FIRST_GOAL);
  
  console.log('Goal creation detected, hasTrackedFirstGoal:', hasTrackedFirstGoal);
  
  // Get current goals count to determine if this is the first goal
  let goalsCount = 0;
  try {
    const storedGoals = await AsyncStorage.getItem('goals');
    if (storedGoals) {
      const goalsData = JSON.parse(storedGoals);
      goalsCount = Array.isArray(goalsData) ? goalsData.length : 0;
    }
  } catch (err) {
    console.log('Error checking goals count:', err);
  }
  
  // First goal if count <= 1 or tracking flag not set
  const isFirstGoal = goalsCount <= 1 || hasTrackedFirstGoal !== 'true';
  console.log(`Current goals count: ${goalsCount}, isFirstGoal: ${isFirstGoal}`);
  
  // IMPORTANT: Set the tracking flag immediately to prevent duplicate unlocks
  await AsyncStorage.setItem(TRACKING_KEYS.FIRST_GOAL, 'true');
  console.log('Set first goal tracking flag to true');
  
  // If this is the first goal, use multiple approaches to ensure achievement is unlocked
  if (isFirstGoal) {
    console.log('First goal detected, using multiple unlock methods');
    
    // Method 1: Use checkAchievements
    try {
      await checkAchievements({
        type: 'goal_created',
        firstGoal: true,
        goals: [data.goal]
      }, showSuccess);
      console.log('Called checkAchievements for first goal');
    } catch (err) {
      console.log('Error in checkAchievements:', err);
    }
    
    // Method 2: Direct achievement unlock with retry mechanism
    const unlockWithRetry = async (retries = 3) => {
      try {
        // Import service directly to avoid circular dependencies
        const AchievementService = require('./AchievementService');
        if (AchievementService && AchievementService.unlockAchievement) {
          const result = await AchievementService.unlockAchievement('goal-pioneer', showSuccess);
          console.log('Directly unlocked goal-pioneer achievement, result:', result);
          return result;
        }
        return false;
      } catch (err) {
        console.log('Error directly unlocking achievement:', err);
        if (retries > 0) {
          console.log(`Retrying achievement unlock, ${retries} attempts left`);
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 200));
          return unlockWithRetry(retries - 1);
        }
        return false;
      }
    };
    
    // Execute unlock with retry
    const unlockResult = await unlockWithRetry();
    
    // Method 3: Directly manipulate AsyncStorage as a fallback
    if (!unlockResult) {
      try {
        console.log('Trying direct AsyncStorage manipulation as fallback');
        const achievementsData = await AsyncStorage.getItem('unlockedAchievements');
        let currentAchievements = {};
        
        if (achievementsData) {
          try {
            currentAchievements = JSON.parse(achievementsData);
          } catch (e) {
            console.log('Error parsing achievements data:', e);
          }
        }
        
        // Only proceed if not already unlocked
        if (!currentAchievements['goal-pioneer'] || !currentAchievements['goal-pioneer'].unlocked) {
          currentAchievements['goal-pioneer'] = {
            unlocked: true,
            date: new Date().toISOString(),
            seen: false
          };
          
          await AsyncStorage.setItem('unlockedAchievements', JSON.stringify(currentAchievements));
          console.log('Directly set goal-pioneer achievement in AsyncStorage');
        }
      } catch (err) {
        console.log('Error in direct AsyncStorage manipulation:', err);
      }
    }
  } else {
    // Not the first goal, just check for other goal-related achievements
    await checkAchievements({
      type: 'goal_created',
      firstGoal: false,
      goals: [data.goal]
    }, showSuccess);
  }
  
  // Finally, try to refresh the achievement context through all available methods
  await refreshAchievementContext();
  
  return true;
};

/**
 * Track project creation and trigger achievements
 */
const trackProjectCreation = async (data, showSuccess) => {
  // Check if first project has been tracked
  const hasTrackedFirstProject = await AsyncStorage.getItem(TRACKING_KEYS.FIRST_PROJECT);
  
  if (hasTrackedFirstProject !== 'true') {
    console.log('First project creation detected');
    
    // Trigger achievement check
    await checkAchievements({
      type: 'project_created',
      firstProject: true,
      linkedToGoal: data.project?.goalId ? true : false,
      project: data.project
    }, showSuccess);
    
    // Mark that we've tracked first project
    await AsyncStorage.setItem(TRACKING_KEYS.FIRST_PROJECT, 'true');
    
    // Try to refresh achievements context
    await refreshAchievementContext();
  } else {
    // Check for other project-related achievements
    await checkAchievements({
      type: 'project_created',
      firstProject: false,
      linkedToGoal: data.project?.goalId ? true : false,
      project: data.project
    }, showSuccess);
  }
  
  return true;
};

/**
 * Track task completion and trigger achievements
 */
const trackTaskCompletion = async (data, showSuccess) => {
  // Get completed tasks count from data or try to calculate
  const completedTasks = data.completedTasks || 0;
  
  // Track first task completion if needed
  const hasTrackedFirstTask = await AsyncStorage.getItem(TRACKING_KEYS.FIRST_TASK);
  
  if (completedTasks > 0 && hasTrackedFirstTask !== 'true') {
    console.log('First task completion detected');
    await AsyncStorage.setItem(TRACKING_KEYS.FIRST_TASK, 'true');
    
    // Try to refresh achievements context
    await refreshAchievementContext();
  }
  
  // Check for task-related achievements
  await checkAchievements({
    type: 'task_completed',
    completedTasks,
    ...data
  }, showSuccess);
  
  return true;
};

/**
 * Track time block creation and trigger achievements
 */
const trackTimeBlockCreation = async (data, showSuccess) => {
  // Check if first time block has been tracked
  const hasTrackedFirstTimeBlock = await AsyncStorage.getItem(TRACKING_KEYS.FIRST_TIME_BLOCK);
  
  if (hasTrackedFirstTimeBlock !== 'true') {
    console.log('First time block creation detected');
    
    // Trigger achievement check
    await checkAchievements({
      type: 'time_block_created',
      firstTimeBlock: true,
      hasFullWeek: data.hasFullWeek || false,
      timeBlock: data.timeBlock
    }, showSuccess);
    
    // Mark that we've tracked first time block
    await AsyncStorage.setItem(TRACKING_KEYS.FIRST_TIME_BLOCK, 'true');
    
    // Try to refresh achievements context
    await refreshAchievementContext();
  } else {
    // Check for other time block-related achievements
    await checkAchievements({
      type: 'time_block_created',
      firstTimeBlock: false,
      hasFullWeek: data.hasFullWeek || false,
      timeBlock: data.timeBlock
    }, showSuccess);
  }
  
  return true;
};

/**
 * Track AI conversation completion and trigger achievements
 */
const trackAiConversation = async (data, showSuccess) => {
  // Check if first AI conversation has been tracked
  const hasTrackedFirstConversation = await AsyncStorage.getItem(TRACKING_KEYS.FIRST_AI_CONVERSATION);
  
  if (hasTrackedFirstConversation !== 'true') {
    console.log('First AI conversation detected');
    
    // Trigger achievement check
    await checkAchievements({
      type: 'ai_conversation_completed',
      firstConversation: true,
      totalConversations: 1,
      ...data
    }, showSuccess);
    
    // Mark that we've tracked first AI conversation
    await AsyncStorage.setItem(TRACKING_KEYS.FIRST_AI_CONVERSATION, 'true');
    
    // Try to refresh achievements context
    await refreshAchievementContext();
  } else {
    // Check for other AI-related achievements
    await checkAchievements({
      type: 'ai_conversation_completed',
      firstConversation: false,
      ...data
    }, showSuccess);
  }
  
  return true;
};

/**
 * Track document upload and trigger achievements
 */
const trackDocumentUpload = async (data, showSuccess) => {
  // Check if first document upload has been tracked
  const hasTrackedFirstDocument = await AsyncStorage.getItem(TRACKING_KEYS.FIRST_DOCUMENT);
  
  if (hasTrackedFirstDocument !== 'true') {
    console.log('First document upload detected');
    
    // Trigger achievement check
    await checkAchievements({
      type: 'document_uploaded',
      firstDocument: true,
      document: data.document
    }, showSuccess);
    
    // Mark that we've tracked first document upload
    await AsyncStorage.setItem(TRACKING_KEYS.FIRST_DOCUMENT, 'true');
    
    // Try to refresh achievements context
    await refreshAchievementContext();
  } else {
    // Check for other document-related achievements
    await checkAchievements({
      type: 'document_uploaded',
      firstDocument: false,
      document: data.document
    }, showSuccess);
  }
  
  return true;
};

/**
 * Enhanced refresh mechanism that tries multiple approaches
 */
export const refreshAchievementContext = async () => {
  console.log('Attempting to refresh achievement context through all channels');
  let success = false;
  
  // Method 1: Try using global context instance
  try {
    if (global.achievementContextInstance && 
        typeof global.achievementContextInstance.refreshAchievements === 'function') {
      console.log('Refreshing achievement context using global instance');
      global.achievementContextInstance.refreshAchievements();
      success = true;
    }
  } catch (err) {
    console.log('Error using global context instance:', err);
  }
  
  // Method 2: Try dispatching global event
  try {
    if (typeof global !== 'undefined' && typeof global.dispatchEvent === 'function') {
      const event = new CustomEvent('refresh-achievements', {});
      global.dispatchEvent(event);
      console.log('Dispatched global refresh-achievements event');
      success = true;
    }
  } catch (err) {
    console.log('Error dispatching global event:', err);
  }
  
  // Method 3: Try dispatching document event
  try {
    if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
      const event = new CustomEvent('refresh-achievements', {});
      document.dispatchEvent(event);
      console.log('Dispatched document refresh-achievements event');
      success = true;
    }
  } catch (err) {
    console.log('Error dispatching document event:', err);
  }
  
  // Add a delay to allow events to propagate
  if (success) {
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return success;
};

/**
 * Reset achievement tracking (for testing)
 * @param {string} trackingKey - Specific tracking key to reset, or null for all
 */
export const resetAchievementTracking = async (trackingKey = null) => {
  try {
    if (trackingKey) {
      // Reset specific tracking key
      await AsyncStorage.removeItem(trackingKey);
      console.log(`Reset achievement tracking for: ${trackingKey}`);
    } else {
      // Reset all tracking keys
      const keys = Object.values(TRACKING_KEYS);
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
      console.log('Reset all achievement tracking');
    }
    
    // Also try to refresh the context
    await refreshAchievementContext();
    
    return true;
  } catch (error) {
    console.error('Error resetting achievement tracking:', error);
    return false;
  }
};

export default {
  trackAction,
  resetAchievementTracking,
  refreshAchievementContext,
  TRACKING_KEYS
};