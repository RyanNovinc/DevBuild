// src/services/SubscriptionService.js
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import constants from the new file instead of re-defining them
import { PREMIUM_FEATURES, FREE_PLAN_LIMITS } from './SubscriptionConstants';
import ReferralTracker from './ReferralTracker';
import * as FeatureExplorerTracker from './FeatureExplorerTracker';
import referralBackendService from './ReferralBackendService';

// Export the constants for convenience
export { PREMIUM_FEATURES, FREE_PLAN_LIMITS };

/**
 * Hook to check if a user has access to a premium feature
 */
export const useSubscriptionFeature = (featureKey) => {
  // Use state to track feature access
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  
  // Get subscription status once when component mounts
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('subscriptionStatus');
        setSubscriptionStatus(status || 'free');
      } catch (error) {
        console.error('Error reading subscription status:', error);
        setSubscriptionStatus('free');
      }
    };
    
    loadSubscriptionStatus();
  }, []);
  
  // Determine access whenever subscription status or feature key changes
  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      
      // Get subscription status from state
      const status = subscriptionStatus || 'free';
      
      // Pro and unlimited users have access to all features
      const hasPremiumAccess = status === 'pro' || status === 'unlimited';
      
      // Each feature might have its own access rules
      let access = false;
      
      switch (featureKey) {
        case PREMIUM_FEATURES.AI_ASSISTANT:
          // AI Assistant is limited for free users to 2 uses per day
          if (hasPremiumAccess) {
            access = true;
          } else {
            // For free users, we would check daily usage
            access = true; // But allow initial access, count will be checked when used
          }
          break;
          
        case PREMIUM_FEATURES.UNLIMITED_GOALS:
        case PREMIUM_FEATURES.UNLIMITED_PROJECTS:
        case PREMIUM_FEATURES.UNLIMITED_TASKS:
        case PREMIUM_FEATURES.UNLIMITED_TIME_BLOCKS:
        case PREMIUM_FEATURES.THEME_CUSTOMIZATION:
        case PREMIUM_FEATURES.DOMAIN_CUSTOMIZATION:
        case PREMIUM_FEATURES.LIFE_PLAN_OVERVIEW:
        case PREMIUM_FEATURES.EXPORTS:
        case PREMIUM_FEATURES.GOAL_ANALYTICS:
        case PREMIUM_FEATURES.ACHIEVEMENTS:
          // These features are premium-only
          access = hasPremiumAccess;
          break;
          
        case PREMIUM_FEATURES.REFERRALS:
          // Only pro users can refer others
          access = status === 'pro';
          break;
          
        default:
          // Unknown features default to accessible for everyone
          access = true;
      }
      
      setHasAccess(access);
      setIsLoading(false);
    };
    
    if (subscriptionStatus !== null) {
      checkAccess();
    }
  }, [featureKey, subscriptionStatus]);
  
  return { hasAccess, isLoading };
};

/**
 * Checks if a user has hit a limit for a specific feature
 */
export const useFeatureLimit = (limitType, currentCount = 0) => {
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  
  // Get subscription status once when component mounts
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('subscriptionStatus');
        setSubscriptionStatus(status || 'free');
      } catch (error) {
        console.error('Error reading subscription status:', error);
        setSubscriptionStatus('free');
      }
    };
    
    loadSubscriptionStatus();
  }, []);
  
  // Check limits whenever subscription status, limit type, or count changes
  useEffect(() => {
    const checkLimit = async () => {
      // Get subscription status from state
      const status = subscriptionStatus || 'free';
      
      // Pro and unlimited users have no limits
      if (status === 'pro' || status === 'unlimited') {
        setHasReachedLimit(false);
        return;
      }
      
      // Check specific limits for free users
      switch (limitType) {
        case 'goals':
          setHasReachedLimit(currentCount >= FREE_PLAN_LIMITS.MAX_GOALS);
          break;
        case 'projects':
          setHasReachedLimit(currentCount >= FREE_PLAN_LIMITS.MAX_PROJECTS);
          break;
        case 'projectsPerGoal':
          setHasReachedLimit(currentCount >= FREE_PLAN_LIMITS.MAX_PROJECTS_PER_GOAL);
          break;
        case 'tasks':
          setHasReachedLimit(currentCount >= FREE_PLAN_LIMITS.MAX_TASKS_PER_PROJECT);
          break;
        case 'timeBlocks':
          setHasReachedLimit(currentCount >= FREE_PLAN_LIMITS.MAX_TIME_BLOCKS);
          break;
        case 'domains':
          setHasReachedLimit(currentCount >= FREE_PLAN_LIMITS.MAX_DOMAINS);
          break;
        case 'aiUsage':
          // For AI usage, we'd need to track daily usage count
          // This would require separate tracking logic
          setHasReachedLimit(false);
          break;
        default:
          setHasReachedLimit(false);
      }
    };
    
    if (subscriptionStatus !== null) {
      checkLimit();
    }
  }, [limitType, currentCount, subscriptionStatus]);
  
  return hasReachedLimit;
};

/**
 * Count projects associated with a specific goal
 * Returns a boolean indicating if the limit has been reached
 */
export const checkProjectsPerGoalLimit = async (goalId, projects = []) => {
  try {
    // Get subscription status
    const status = await AsyncStorage.getItem('subscriptionStatus');
    
    // Pro users have unlimited projects per goal
    if (status === 'pro' || status === 'unlimited') {
      return {
        hasReachedLimit: false,
        projectCount: 0,
        maxAllowed: Infinity
      };
    }
    
    // Count projects for this goal
    let projectsForGoal = [];
    
    // First try to use the provided projects array
    if (Array.isArray(projects) && projects.length > 0) {
      projectsForGoal = projects.filter(project => project.goalId === goalId);
    } else {
      // If no projects provided, try to get from AsyncStorage
      const projectsData = await AsyncStorage.getItem('projects');
      if (projectsData) {
        const allProjects = JSON.parse(projectsData);
        if (Array.isArray(allProjects)) {
          projectsForGoal = allProjects.filter(project => project.goalId === goalId);
        }
      }
    }
    
    const projectCount = projectsForGoal.length;
    
    return {
      hasReachedLimit: projectCount >= FREE_PLAN_LIMITS.MAX_PROJECTS_PER_GOAL,
      projectCount,
      maxAllowed: FREE_PLAN_LIMITS.MAX_PROJECTS_PER_GOAL
    };
  } catch (error) {
    console.error('Error checking projects per goal limit:', error);
    return {
      hasReachedLimit: false,
      projectCount: 0,
      maxAllowed: FREE_PLAN_LIMITS.MAX_PROJECTS_PER_GOAL,
      error
    };
  }
};

/**
 * Track AI Assistant usage for free users
 */
export const trackAIUsage = async () => {
  try {
    const status = await AsyncStorage.getItem('subscriptionStatus');
    
    // Only track for free users
    if (status === 'free') {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const storageKey = `aiUsage_${today}`;
      
      // Get current usage
      const currentUsageStr = await AsyncStorage.getItem(storageKey);
      const currentUsage = currentUsageStr ? parseInt(currentUsageStr, 10) : 0;
      
      // Increment and save
      const newUsage = currentUsage + 1;
      await AsyncStorage.setItem(storageKey, newUsage.toString());
      
      return {
        usageCount: newUsage,
        reachedLimit: newUsage >= FREE_PLAN_LIMITS.MAX_AI_USAGES_PER_DAY,
        maxAllowed: FREE_PLAN_LIMITS.MAX_AI_USAGES_PER_DAY
      };
    }
    
    // Pro/unlimited users have unlimited usage
    return {
      usageCount: 0,
      reachedLimit: false,
      maxAllowed: Infinity
    };
  } catch (error) {
    console.error('Error tracking AI usage:', error);
    return {
      usageCount: 0,
      reachedLimit: false,
      maxAllowed: FREE_PLAN_LIMITS.MAX_AI_USAGES_PER_DAY,
      error
    };
  }
};

/**
 * Check current AI usage for today
 */
export const checkCurrentAIUsage = async () => {
  try {
    const status = await AsyncStorage.getItem('subscriptionStatus');
    
    // Only check for free users
    if (status === 'free') {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const storageKey = `aiUsage_${today}`;
      
      // Get current usage
      const currentUsageStr = await AsyncStorage.getItem(storageKey);
      const currentUsage = currentUsageStr ? parseInt(currentUsageStr, 10) : 0;
      
      return {
        usageCount: currentUsage,
        reachedLimit: currentUsage >= FREE_PLAN_LIMITS.MAX_AI_USAGES_PER_DAY,
        maxAllowed: FREE_PLAN_LIMITS.MAX_AI_USAGES_PER_DAY
      };
    }
    
    // Pro/unlimited users have unlimited usage
    return {
      usageCount: 0,
      reachedLimit: false,
      maxAllowed: Infinity
    };
  } catch (error) {
    console.error('Error checking AI usage:', error);
    return {
      usageCount: 0,
      reachedLimit: false,
      maxAllowed: FREE_PLAN_LIMITS.MAX_AI_USAGES_PER_DAY,
      error
    };
  }
};

/**
 * Helper to determine if a user can add more items of a specific type
 * This is a standalone utility function that doesn't require the AppContext
 */
export const canAddMoreItems = async (itemType) => {
  try {
    // Get subscription status
    const status = await AsyncStorage.getItem('subscriptionStatus');
    
    // Pro users have unlimited items
    if (status === 'pro' || status === 'unlimited') {
      return true;
    }
    
    // Implement limit checks for different item types
    // These would normally require AppContext, but we'll provide simplified versions
    
    switch (itemType) {
      case 'goals':
        // Get current goals count - simplified example
        // In reality, you'd need to retrieve this data differently
        const goalsData = await AsyncStorage.getItem('goals');
        const goals = goalsData ? JSON.parse(goalsData) : [];
        const activeGoals = Array.isArray(goals) ? goals.filter(goal => !goal.completed).length : 0;
        return activeGoals < FREE_PLAN_LIMITS.MAX_GOALS;
        
      // Other cases would be implemented similarly
      
      default:
        return true;
    }
  } catch (error) {
    console.error(`Error checking if can add more ${itemType}:`, error);
    return true; // Default to allowing additions on error
  }
};

/**
 * Check if a user can add more projects to a specific goal
 * Returns a boolean indicating if more projects can be added
 */
export const canAddMoreProjectsToGoal = async (goalId, projects = []) => {
  try {
    // Get subscription status
    const status = await AsyncStorage.getItem('subscriptionStatus');
    
    // Pro users have unlimited projects per goal
    if (status === 'pro' || status === 'unlimited') {
      return true;
    }
    
    // Count projects for this goal
    let projectsForGoal = [];
    
    // First try to use the provided projects array
    if (Array.isArray(projects) && projects.length > 0) {
      projectsForGoal = projects.filter(project => project.goalId === goalId);
    } else {
      // If no projects provided, try to get from AsyncStorage
      const projectsData = await AsyncStorage.getItem('projects');
      if (projectsData) {
        const allProjects = JSON.parse(projectsData);
        if (Array.isArray(allProjects)) {
          projectsForGoal = allProjects.filter(project => project.goalId === goalId);
        }
      }
    }
    
    const projectCount = projectsForGoal.length;
    
    // Check if limit reached
    return projectCount < FREE_PLAN_LIMITS.MAX_PROJECTS_PER_GOAL;
  } catch (error) {
    console.error('Error checking if can add more projects to goal:', error);
    return true; // Default to allowing additions on error
  }
};

/**
 * Upgrade user subscription and process any pending referrals
 * @param {string} subscriptionType - The new subscription type ('pro', 'unlimited', etc.)
 * @param {string} userId - The user ID (optional, for referral tracking)
 */
export const upgradeSubscription = async (subscriptionType, userId = null) => {
  try {
    // Store the new subscription status
    await AsyncStorage.setItem('subscriptionStatus', subscriptionType);
    
    // Record referral conversion if user entered a referral code
    try {
      const enteredReferralCode = await AsyncStorage.getItem('enteredReferralCode');
      if (enteredReferralCode) {
        console.log('Recording referral conversion for code:', enteredReferralCode);
        await referralBackendService.recordReferralConversion(enteredReferralCode);
        
        // Track achievement for referral conversion
        try {
          await FeatureExplorerTracker.trackReferralConversion();
        } catch (achievementError) {
          console.error('Error tracking referral conversion achievement:', achievementError);
        }
      }
    } catch (referralError) {
      console.error('Error processing referral conversion:', referralError);
      // Don't fail the whole function if referral processing fails
    }
    
    // Process any pending referrals (legacy support) 
    let processedReferral = null;
    if (userId) {
      processedReferral = await ReferralTracker.processPendingReferral(userId, subscriptionType);
      
      if (processedReferral) {
        console.log('Processed referral on subscription upgrade:', processedReferral);
        await notifyReferralSuccess(processedReferral);
      }
      
      // Track Insider Status achievement for Pro upgrades
      try {
        await FeatureExplorerTracker.trackInsiderStatus();
      } catch (achievementError) {
        console.error('Error tracking Insider Status achievement:', achievementError);
        // Don't fail the whole function if achievement tracking fails
      }
    }
    
    // Check if referral code was processed
    const enteredReferralCode = await AsyncStorage.getItem('enteredReferralCode');
    
    return {
      success: true,
      subscriptionType,
      processedReferral: !!processedReferral || !!enteredReferralCode
    };
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Notify that a referral was successful (for the referrer)
 * This would typically send a push notification or update their account
 */
const notifyReferralSuccess = async (referralData) => {
  try {
    // Store notification for referrer (in a real app, this would be server-side)
    const notification = {
      id: `ref_${Date.now()}`,
      type: 'referral_success',
      message: `Great news! Someone used your referral code and upgraded to ${referralData.subscriptionType}!`,
      referralCode: referralData.referralCode,
      reward: '$10.00', // Example reward
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Store locally for now (in production, this would be sent to your backend)
    const existingNotifications = await AsyncStorage.getItem('referralNotifications');
    const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
    notifications.push(notification);
    await AsyncStorage.setItem('referralNotifications', JSON.stringify(notifications));
    
    console.log('Referral success notification stored:', notification);
    return notification;
  } catch (error) {
    console.error('Error storing referral notification:', error);
    return null;
  }
};

/**
 * Get pending referral notifications for the current user
 */
export const getReferralNotifications = async () => {
  try {
    const notificationsStr = await AsyncStorage.getItem('referralNotifications');
    return notificationsStr ? JSON.parse(notificationsStr) : [];
  } catch (error) {
    console.error('Error getting referral notifications:', error);
    return [];
  }
};

/**
 * Mark referral notifications as read
 */
export const markReferralNotificationsRead = async () => {
  try {
    const notificationsStr = await AsyncStorage.getItem('referralNotifications');
    if (notificationsStr) {
      const notifications = JSON.parse(notificationsStr);
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      await AsyncStorage.setItem('referralNotifications', JSON.stringify(updatedNotifications));
    }
    return true;
  } catch (error) {
    console.error('Error marking referral notifications as read:', error);
    return false;
  }
};

/**
 * Get user's current credit balance and subscription info from Lambda
 * @param {string} userToken - JWT token for authentication
 * @returns {Promise<Object>} Credit and subscription information
 */
export const getCreditBalance = async (userToken) => {
  try {
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://your-api-gateway-url.com';
    
    const response = await fetch(`${API_BASE_URL}/get-credit-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        includeHistory: false
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    throw error;
  }
};

/**
 * Format subscription tier name for display
 * @param {string} tier - Raw tier name from backend
 * @returns {string} Formatted tier name
 */
export const formatTierName = (tier) => {
  const tierMap = {
    'light': 'AI Light',
    'standard': 'AI Standard', 
    'max': 'AI Max',
    'free': 'Free'
  };
  
  return tierMap[tier?.toLowerCase()] || 'Free';
};

/**
 * Format the next refresh/billing date for display
 * @param {string} dateString - ISO date string
 * @param {string} subscriptionTier - Subscription tier
 * @returns {string} Formatted date for display
 */
export const formatNextRefreshDate = (dateString, subscriptionTier) => {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);
  const now = new Date();
  
  // Calculate time difference
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (subscriptionTier === 'free') {
    // For free tier, show hours if less than 2 days
    if (diffDays <= 2) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      return `${diffHours}h`;
    }
    return `${diffDays}d`;
  } else {
    // For paid tiers, show abbreviated date
    if (diffDays <= 7) {
      return `${diffDays}d`;
    } else if (diffDays <= 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `${weeks}w`;
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}/${day}`;
    }
  }
};

/**
 * Get subscription info with error handling for offline/development mode
 * @param {string} userToken - JWT token for authentication
 * @returns {Promise<Object>} Subscription information with fallbacks
 */
export const getSubscriptionInfo = async (userToken) => {
  try {
    const data = await getCreditBalance(userToken);
    
    return {
      tier: data.subscription?.tier || 'free',
      status: data.subscription?.status || 'active',
      nextRefreshDate: data.refreshInfo?.nextRefreshDate,
      daysRemaining: data.refreshInfo?.daysRemaining || 0,
      formattedTierName: formatTierName(data.subscription?.tier),
      formattedRefreshDate: formatNextRefreshDate(
        data.refreshInfo?.nextRefreshDate, 
        data.subscription?.tier
      ),
      isFreeTier: !data.subscription?.tier || data.subscription?.tier === 'free'
    };
  } catch (error) {
    console.warn('Failed to fetch subscription info, using fallback:', error);
    
    // Return fallback data for development/offline mode
    return {
      tier: 'free',
      status: 'active', 
      nextRefreshDate: null,
      daysRemaining: 18,
      formattedTierName: 'Free',
      formattedRefreshDate: '18h',
      isFreeTier: true,
      isOffline: true
    };
  }
};

export default {
  PREMIUM_FEATURES,
  FREE_PLAN_LIMITS,
  useSubscriptionFeature,
  useFeatureLimit,
  trackAIUsage,
  checkCurrentAIUsage,
  canAddMoreItems,
  checkProjectsPerGoalLimit,
  canAddMoreProjectsToGoal,
  upgradeSubscription,
  getReferralNotifications,
  markReferralNotificationsRead,
  // New Lambda integration functions
  getCreditBalance,
  formatTierName,
  formatNextRefreshDate,
  getSubscriptionInfo
};