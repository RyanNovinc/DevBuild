// src/context/AIAssistantContext/utils.js
// Utility functions for AI Assistant functionality

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  TIER_STORAGE_LIMITS,
  CREDIT_COSTS,
  MIN_WARNING_INTERVAL,
  LAST_CREDIT_WARNING_KEY,
  AI_MODEL_TIER_KEY,
  USER_KNOWLEDGE_KEY,
  USER_KNOWLEDGE_ENABLED_KEY,
  AI_CREDITS_KEY,
  DEVELOPMENT_MODE_KEY
} from './constants';

/**
 * Calculate credit cost based on model tier
 * @param {string} tier - AI model tier ('guide', 'navigator', 'compass')
 * @returns {number} - Credit cost for this tier
 */
export const getCreditCost = (tier = 'guide') => {
  return CREDIT_COSTS[tier] || 1;
};

/**
 * Get storage quota for specified tier
 * @param {string} tier - AI model tier
 * @returns {number} - Storage quota in MB
 */
export const getStorageQuota = (tier) => {
  return TIER_STORAGE_LIMITS[tier]?.storageMB || 1;
};

/**
 * Get document limit for specified tier
 * @param {string} tier - AI model tier
 * @returns {number} - Maximum number of documents allowed
 */
export const getDocumentLimit = (tier) => {
  return TIER_STORAGE_LIMITS[tier]?.documentLimit || 2;
};

/**
 * Save AI model tier preference
 * @param {string} tier - AI model tier to save
 * @returns {Promise<boolean>} - Success status
 */
export const saveAIModelTier = async (tier) => {
  try {
    await AsyncStorage.setItem(AI_MODEL_TIER_KEY, tier);
    return true;
  } catch (error) {
    console.error('Error saving AI model tier:', error);
    return false;
  }
};

/**
 * Save user knowledge files
 * @param {Array} documents - User knowledge document array
 * @returns {Promise<boolean>} - Success status
 */
export const saveUserDocuments = async (documents) => {
  try {
    await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(documents));
    return true;
  } catch (error) {
    console.error('Error saving user documents:', error);
    return false;
  }
};

/**
 * Save user knowledge enabled setting
 * @param {boolean} enabled - Whether user knowledge is enabled
 * @returns {Promise<boolean>} - Success status
 */
export const saveUserKnowledgeEnabled = async (enabled) => {
  try {
    await AsyncStorage.setItem(USER_KNOWLEDGE_ENABLED_KEY, enabled.toString());
    return true;
  } catch (error) {
    console.error('Error saving user knowledge enabled setting:', error);
    return false;
  }
};

/**
 * Save AI credits amount
 * @param {number} credits - Number of AI credits
 * @returns {Promise<boolean>} - Success status
 */
export const saveAICredits = async (credits) => {
  try {
    await AsyncStorage.setItem(AI_CREDITS_KEY, credits.toString());
    return true;
  } catch (error) {
    console.error('Error saving AI credits:', error);
    return false;
  }
};

/**
 * Save development mode setting
 * @param {boolean} enabled - Whether development mode is enabled
 * @returns {Promise<boolean>} - Success status
 */
export const saveDevelopmentMode = async (enabled) => {
  if (!__DEV__) return false;
  
  try {
    await AsyncStorage.setItem(DEVELOPMENT_MODE_KEY, enabled.toString());
    return true;
  } catch (error) {
    console.error('Error saving development mode setting:', error);
    return false;
  }
};

/**
 * Check if credits are low and show warning if needed
 * @param {Object} state - Current AI assistant state
 * @param {Function} dispatch - Dispatch function for actions
 * @returns {Promise<boolean>} - Whether a warning was shown
 */
export const checkLowCredits = async (state, dispatch) => {
  // Skip check if notifications are disabled or on unlimited subscription
  if (!state.credits.creditNotificationsEnabled || state.credits.subscriptionStatus === 'unlimited') {
    return false;
  }
  
  // Check the selected model tier's credits
  const tierCredits = state.aiModel.tierCredits[state.aiModel.tier] || 0;
  
  // Get current time and last warning time
  const currentTime = Date.now();
  const lastWarningTimestamp = await AsyncStorage.getItem(LAST_CREDIT_WARNING_KEY);
  const lastWarningTime = lastWarningTimestamp ? parseInt(lastWarningTimestamp, 10) : 0;
  
  // Only show warning if enough time has passed since last warning
  if (currentTime - lastWarningTime <= MIN_WARNING_INTERVAL) {
    return false;
  }
  
  let warningShown = false;
  
  // Show zero credit popup if credits are exactly 0
  if (tierCredits === 0) {
    dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { modal: 'showZeroCreditModal', visible: true } });
    warningShown = true;
  }
  // Show low credit popup if credits are at or below threshold but not zero
  else if (tierCredits <= state.credits.lowCreditThreshold && tierCredits > 0) {
    dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { modal: 'showLowCreditModal', visible: true } });
    warningShown = true;
  }
  
  // Save timestamp of this warning if a warning was shown
  if (warningShown) {
    await AsyncStorage.setItem(LAST_CREDIT_WARNING_KEY, currentTime.toString());
  }
  
  return warningShown;
};

/**
 * Get available AI model tiers based on subscription and dev mode
 * @param {string} subscriptionStatus - User's subscription status
 * @param {boolean} developmentMode - Whether development mode is enabled
 * @returns {Array<string>} - Array of available tier names
 */
export const getAvailableTiers = (subscriptionStatus, developmentMode) => {
  // In development mode, all tiers are available
  if (developmentMode) {
    return ['guide', 'navigator', 'compass'];
  }
  
  // In production, tiers depend on subscription status
  switch (subscriptionStatus) {
    case 'free':
      return ['guide'];
    case 'pro':
      return ['guide', 'navigator'];
    case 'unlimited':
      return ['guide', 'navigator', 'compass'];
    default:
      return ['guide'];
  }
};