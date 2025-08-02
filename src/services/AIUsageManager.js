// src/services/AIUsageManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const USAGE_PERCENTAGE_KEY = 'aiUsagePercentage';
const LAST_RESET_KEY = 'aiLastReset';
const NEXT_RESET_KEY = 'aiNextReset';
const AI_TIER_KEY = 'aiTier';
const UNLIMITED_MODE_KEY = 'aiUnlimitedMode'; // NEW: Unlimited mode toggle

/**
 * AIUsageManager - Manages AI usage tracking
 * Provides methods to track, update, and check AI usage percentage
 * NOW WITH UNLIMITED MODE for development!
 */
const AIUsageManager = {
  /**
   * Initialize the AI usage tracking system
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  initialize: async () => {
    try {
      // Check if we need to reset usage (new month)
      const shouldReset = await AIUsageManager.checkIfResetNeeded();
      
      if (shouldReset) {
        await AIUsageManager.resetUsage();
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing AI usage manager:', error);
      return false;
    }
  },
  
  /**
   * NEW: Enable unlimited usage mode (bypass all limits)
   * @returns {Promise<boolean>} Whether enabling was successful
   */
  enableUnlimitedMode: async () => {
    try {
      await AsyncStorage.setItem(UNLIMITED_MODE_KEY, 'true');
      console.log('[AIUsageManager] 🚀 UNLIMITED MODE ENABLED - No usage limits!');
      return true;
    } catch (error) {
      console.error('Error enabling unlimited mode:', error);
      return false;
    }
  },
  
  /**
   * NEW: Disable unlimited usage mode (restore normal limits)
   * @returns {Promise<boolean>} Whether disabling was successful
   */
  disableUnlimitedMode: async () => {
    try {
      await AsyncStorage.setItem(UNLIMITED_MODE_KEY, 'false');
      console.log('[AIUsageManager] 📊 Normal usage limits restored');
      return true;
    } catch (error) {
      console.error('Error disabling unlimited mode:', error);
      return false;
    }
  },
  
  /**
   * NEW: Check if unlimited mode is enabled
   * @returns {Promise<boolean>} Whether unlimited mode is active
   */
  isUnlimitedMode: async () => {
    try {
      const unlimitedStr = await AsyncStorage.getItem(UNLIMITED_MODE_KEY);
      return unlimitedStr === 'true';
    } catch (error) {
      console.error('Error checking unlimited mode:', error);
      return false;
    }
  },
  
  /**
   * NEW: Set unlimited mode for yourself instantly
   * @returns {Promise<boolean>} Success status
   */
  giveMaxUsage: async () => {
    try {
      // Enable unlimited mode
      await AIUsageManager.enableUnlimitedMode();
      
      // Also reset current usage to 0 for good measure
      await AsyncStorage.setItem(USAGE_PERCENTAGE_KEY, '0');
      
      console.log('[AIUsageManager] 🎉 MAX USAGE GRANTED! You now have unlimited AI usage.');
      return true;
    } catch (error) {
      console.error('Error giving max usage:', error);
      return false;
    }
  },
  
  /**
   * Record usage of AI capacity (respects unlimited mode)
   * @param {number} percentage - Additional percentage to add to current usage
   * @param {string} operation - Type of operation (for logging)
   * @returns {Promise<boolean>} Whether recording was successful
   */
  recordUsage: async (percentage, operation = 'ai_response') => {
    try {
      // Check if unlimited mode is enabled
      const isUnlimited = await AIUsageManager.isUnlimitedMode();
      
      if (isUnlimited) {
        console.log(`[AIUsageManager] 🚀 Unlimited mode: Ignoring usage for ${operation}`);
        return true;
      }
      
      // Get current usage percentage
      const currentPercentageStr = await AsyncStorage.getItem(USAGE_PERCENTAGE_KEY) || '0';
      const currentPercentage = parseFloat(currentPercentageStr);
      
      // Update usage percentage (cap at 100%)
      const newPercentage = Math.min(100, currentPercentage + percentage);
      await AsyncStorage.setItem(USAGE_PERCENTAGE_KEY, newPercentage.toString());
      
      // Log usage for debugging
      console.log(`[AIUsageManager] Recorded ${percentage}% for ${operation}. Total usage: ${newPercentage}%`);
      
      return true;
    } catch (error) {
      console.error('Error recording AI usage:', error);
      return false;
    }
  },
  
  /**
   * Get current AI usage statistics
   * @returns {Promise<Object>} Usage statistics
   */
  getUsageStats: async () => {
    try {
      // Check unlimited mode first
      const isUnlimited = await AIUsageManager.isUnlimitedMode();
      
      // Get current values
      const usagePercentageStr = await AsyncStorage.getItem(USAGE_PERCENTAGE_KEY) || '0';
      const nextResetStr = await AsyncStorage.getItem(NEXT_RESET_KEY);
      const aiTier = await AsyncStorage.getItem(AI_TIER_KEY) || 'guide';
      
      // Parse values
      const usagePercentage = parseFloat(usagePercentageStr);
      let nextReset = null;
      
      if (nextResetStr) {
        nextReset = new Date(nextResetStr);
      } else {
        // Calculate next reset date if not set
        nextReset = AIUsageManager.calculateNextResetDate();
        await AsyncStorage.setItem(NEXT_RESET_KEY, nextReset.toISOString());
      }
      
      // Format next reset date
      const resetDate = nextReset ? AIUsageManager.formatResetDate(nextReset) : 'End of month';
      
      return {
        usagePercentage: isUnlimited ? 0 : usagePercentage, // Show 0% if unlimited
        resetDate: isUnlimited ? 'Unlimited' : resetDate,
        aiTier,
        isLimitReached: isUnlimited ? false : usagePercentage >= 100,
        isUnlimitedMode: isUnlimited // NEW: Include unlimited status
      };
    } catch (error) {
      console.error('Error getting AI usage stats:', error);
      return {
        usagePercentage: 0,
        resetDate: 'End of month',
        aiTier: 'guide',
        isLimitReached: false,
        isUnlimitedMode: false
      };
    }
  },
  
  /**
   * Check if user has reached their monthly limit (respects unlimited mode)
   * @returns {Promise<boolean>} Whether user has reached their limit
   */
  hasReachedLimit: async () => {
    try {
      // Check unlimited mode first
      const isUnlimited = await AIUsageManager.isUnlimitedMode();
      
      if (isUnlimited) {
        return false; // Never reached limit in unlimited mode
      }
      
      // Get current usage percentage
      const usagePercentageStr = await AsyncStorage.getItem(USAGE_PERCENTAGE_KEY) || '0';
      const usagePercentage = parseFloat(usagePercentageStr);
      
      // Check if usage is at or above 100%
      return usagePercentage >= 100;
    } catch (error) {
      console.error('Error checking if user has reached limit:', error);
      return false;
    }
  },
  
  /**
   * Check if user has enough capacity for an operation (respects unlimited mode)
   * @param {number} requiredPercentage - Additional percentage required for operation
   * @returns {Promise<boolean>} Whether user has enough capacity
   */
  hasEnoughCapacity: async (requiredPercentage) => {
    try {
      // Check unlimited mode first
      const isUnlimited = await AIUsageManager.isUnlimitedMode();
      
      if (isUnlimited) {
        return true; // Always have enough capacity in unlimited mode
      }
      
      // Get current usage percentage
      const usagePercentageStr = await AsyncStorage.getItem(USAGE_PERCENTAGE_KEY) || '0';
      const usagePercentage = parseFloat(usagePercentageStr);
      
      // Check if user has enough capacity
      return usagePercentage + requiredPercentage <= 100;
    } catch (error) {
      console.error('Error checking if user has enough capacity:', error);
      return false;
    }
  },
  
  /**
   * Reset usage for a new billing cycle
   * @returns {Promise<boolean>} Whether reset was successful
   */
  resetUsage: async () => {
    try {
      // Reset usage percentage to 0
      await AsyncStorage.setItem(USAGE_PERCENTAGE_KEY, '0');
      
      // Set last reset date to now
      const now = new Date();
      await AsyncStorage.setItem(LAST_RESET_KEY, now.toISOString());
      
      // Calculate and set next reset date
      const nextReset = AIUsageManager.calculateNextResetDate();
      await AsyncStorage.setItem(NEXT_RESET_KEY, nextReset.toISOString());
      
      console.log('[AIUsageManager] Usage reset. Next reset:', nextReset.toISOString());
      
      return true;
    } catch (error) {
      console.error('Error resetting AI usage:', error);
      return false;
    }
  },
  
  /**
   * Update AI tier
   * @param {string} tier - AI tier ('guide', 'navigator', 'compass')
   * @returns {Promise<boolean>} Whether update was successful
   */
  updateTier: async (tier) => {
    try {
      // Save the tier
      await AsyncStorage.setItem(AI_TIER_KEY, tier);
      
      console.log(`[AIUsageManager] Updated tier to ${tier}`);
      
      return true;
    } catch (error) {
      console.error('Error updating AI tier:', error);
      return false;
    }
  },
  
  /**
   * Check if usage needs to be reset (new month)
   * @returns {Promise<boolean>} Whether reset is needed
   */
  checkIfResetNeeded: async () => {
    try {
      // Get last reset date
      const lastResetStr = await AsyncStorage.getItem(LAST_RESET_KEY);
      
      // If no last reset, definitely need to reset
      if (!lastResetStr) {
        return true;
      }
      
      // Get next reset date
      const nextResetStr = await AsyncStorage.getItem(NEXT_RESET_KEY);
      
      // If no next reset, calculate it
      if (!nextResetStr) {
        return true;
      }
      
      // Check if we've passed the next reset date
      const nextReset = new Date(nextResetStr);
      const now = new Date();
      
      return now >= nextReset;
    } catch (error) {
      console.error('Error checking if reset is needed:', error);
      return false;
    }
  },
  
  /**
   * Calculate next reset date (first day of next month)
   * @returns {Date} Next reset date
   */
  calculateNextResetDate: () => {
    const now = new Date();
    
    // Create date for first day of next month
    const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    return nextReset;
  },
  
  /**
   * Format reset date for display
   * @param {Date} date - Reset date
   * @returns {string} Formatted date
   */
  formatResetDate: (date) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${months[date.getMonth()]} ${date.getDate()}`;
  },
  
  /**
   * Estimate usage percentage for a message
   * This would be replaced by your actual calculation logic from the backend
   * @param {string} userMessage - User message text
   * @param {string} aiTier - AI tier ('guide', 'navigator', 'compass')
   * @returns {number} Estimated usage percentage
   */
  estimateUsagePercentage: (userMessage, aiTier = 'guide') => {
    if (!userMessage) return 0;
    
    // This is a placeholder calculation that you would replace with your actual logic
    // from the backend or API response
    const messageLength = userMessage.length;
    
    // Different tiers have different impacts on the percentage
    const tierMultiplier = {
      guide: 1,
      navigator: 0.8, // Navigator uses less percentage per message as it has more total capacity
      compass: 0.5    // Compass uses even less percentage per message due to highest capacity
    };
    
    // Calculate a very basic percentage based on message length
    // This is just a placeholder - replace with your actual calculation
    const basePercentage = messageLength / 2000;
    
    // Apply tier multiplier
    const adjustedPercentage = basePercentage * (tierMultiplier[aiTier] || 1);
    
    // Return percentage capped at reasonable bounds
    return Math.min(10, Math.max(0.5, adjustedPercentage));
  }
};

export default AIUsageManager;