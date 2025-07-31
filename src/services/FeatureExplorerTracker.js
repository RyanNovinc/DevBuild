// src/services/FeatureExplorerTracker.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import AchievementService from './AchievementService';

// Keys for tracking feature explorer achievements
const TRACKING_KEYS = {
  PROFILE_PICTURE_UPDATED: 'achievement_tracker_profile_picture_updated',
  THEME_COLOR_CHANGED: 'achievement_tracker_theme_color_changed',
  DASHBOARD_HOLISTIC_VIEW: 'achievement_tracker_dashboard_holistic_view',
  DOMAIN_FOCUS_VIEW: 'achievement_tracker_domain_focus_view',
  NOTE_CREATED: 'achievement_tracker_note_created',
  TODO_BATCH_ORGANIZED: 'achievement_tracker_todo_batch_organized',
  DAY_EXPORT_CREATED: 'achievement_tracker_day_export_created',
  WEEK_EXPORT_CREATED: 'achievement_tracker_week_export_created',
  MONTH_EXPORT_CREATED: 'achievement_tracker_month_export_created',
  // New tracking keys for Strategic Progress achievements
  VISION_SETTER: 'achievement_tracker_vision_setter',
  GOAL_PIONEER: 'achievement_tracker_goal_pioneer',
  STRATEGIC_THINKER: 'achievement_tracker_strategic_thinker',
  MILESTONE_MARKER: 'achievement_tracker_milestone_marker',
  PROGRESS_TRACKER: 'achievement_tracker_progress_tracker',
  DOMAIN_DIVERSIFIER: 'achievement_tracker_domain_diversifier',
  SYSTEM_BUILDER: 'achievement_tracker_system_builder',
  COMPLETION_CHAMPION: 'achievement_tracker_completion_champion',
  // Consistency Champions tracking keys
  DAILY_LOGIN_DATE: 'achievement_tracker_daily_login_date',
  CURRENT_STREAK: 'achievement_tracker_current_streak',
  HIGHEST_STREAK: 'achievement_tracker_highest_streak',
  STREAK_7_DAYS: 'achievement_tracker_streak_7_days',
  STREAK_30_DAYS: 'achievement_tracker_streak_30_days',
  STREAK_90_DAYS: 'achievement_tracker_streak_90_days',
  STREAK_180_DAYS: 'achievement_tracker_streak_180_days', // Tracking eligibility regardless of subscription
  STREAK_180_DAYS_ELIGIBLE: 'achievement_tracker_streak_180_days_eligible', // Track if user has reached 180 days
  STREAK_365_DAYS: 'achievement_tracker_streak_365_days',
  STREAK_365_DAYS_ELIGIBLE: 'achievement_tracker_streak_365_days_eligible', // Track if user has reached 365 days
  // AI Mastery tracking keys
  FIRST_AI_CONVERSATION: 'achievement_tracker_first_ai_conversation',
  AI_CONVERSATIONS_COUNT: 'achievement_tracker_ai_conversations_count',
  FIRST_DOCUMENT_UPLOAD: 'achievement_tracker_first_document_upload',
  AI_GENERATED_GOAL: 'achievement_tracker_ai_generated_goal',
  AI_RECOMMENDED_TIMEBLOCK: 'achievement_tracker_ai_recommended_timeblock',
  AI_POWER_USER: 'achievement_tracker_ai_power_user',
  // Referral tracking keys
  FIRST_REFERRAL_SENT: 'achievement_tracker_first_referral_sent',
  REFERRALS_CONVERTED_COUNT: 'achievement_tracker_referrals_converted_count',
  // Founder tracking keys
  EARLY_ADOPTER: 'achievement_tracker_early_adopter',
  // Feature Influencer tracking key
  FEATURE_INFLUENCER: 'achievement_tracker_feature_influencer',
  // Insider Status tracking key
  INSIDER_STATUS: 'achievement_tracker_insider_status',
};

// Debug flag
const DEBUG_MODE = true;

const logDebug = (...args) => {
  if (DEBUG_MODE) {
    console.log('[FeatureExplorerTracker]', ...args);
  }
};

/**
 * Track when a user updates their profile picture
 * @param {Object} profileData - The updated profile data
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackProfilePictureUpdate = async (profileData, showSuccess = null) => {
  try {
    logDebug('Tracking profile picture update');
    
    // Check if profile picture has been updated
    if (profileData && profileData.profileImage) {
      logDebug('Profile picture exists, checking for achievement');
      
      // Check if we've already tracked this achievement
      const hasTrackedPictureUpdate = await AsyncStorage.getItem(TRACKING_KEYS.PROFILE_PICTURE_UPDATED);
      
      if (hasTrackedPictureUpdate !== 'true') {
        // This is the first time
        logDebug('First profile picture update, unlocking achievement');
        
        // Set tracking flag
        await AsyncStorage.setItem(TRACKING_KEYS.PROFILE_PICTURE_UPDATED, 'true');
        
        // Unlock the achievement
        await AchievementService.unlockAchievement('profile-personalizer', showSuccess);
      }
    }
  } catch (error) {
    console.error('Error tracking profile picture update:', error);
  }
};

/**
 * Track when a user changes the theme color
 * @param {String} color - The new theme color
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackThemeColorChange = async (color, showSuccess = null) => {
  try {
    logDebug('Tracking theme color change:', color);
    
    // Check if we've already tracked this achievement
    const hasTrackedColorChange = await AsyncStorage.getItem(TRACKING_KEYS.THEME_COLOR_CHANGED);
    
    if (hasTrackedColorChange !== 'true') {
      // This is the first time
      logDebug('First theme color change, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.THEME_COLOR_CHANGED, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('theme-customizer', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking theme color change:', error);
  }
};

/**
 * Track when a user accesses the holistic view from dashboard
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackDashboardHolisticView = async (showSuccess = null) => {
  try {
    logDebug('Tracking dashboard holistic view access');
    
    // Check if we've already tracked this achievement
    const hasTrackedHolisticView = await AsyncStorage.getItem(TRACKING_KEYS.DASHBOARD_HOLISTIC_VIEW);
    
    if (hasTrackedHolisticView !== 'true') {
      // This is the first time
      logDebug('First dashboard holistic view, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.DASHBOARD_HOLISTIC_VIEW, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('dashboard-navigator', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking dashboard holistic view:', error);
  }
};

/**
 * Track when a user switches to domain focus view
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackDomainFocusView = async (showSuccess = null) => {
  try {
    logDebug('Tracking domain focus view switch');
    
    // Check if we've already tracked this achievement
    const hasTrackedFocusView = await AsyncStorage.getItem(TRACKING_KEYS.DOMAIN_FOCUS_VIEW);
    
    if (hasTrackedFocusView !== 'true') {
      // This is the first time
      logDebug('First domain focus view switch, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.DOMAIN_FOCUS_VIEW, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('domain-focus-master', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking domain focus view:', error);
  }
};

/**
 * Track when a user creates a note
 * @param {Object} note - The note data
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackNoteCreation = async (note, showSuccess = null) => {
  try {
    logDebug('Tracking note creation');
    
    // Check if we've already tracked this achievement
    const hasTrackedNoteCreation = await AsyncStorage.getItem(TRACKING_KEYS.NOTE_CREATED);
    
    if (hasTrackedNoteCreation !== 'true') {
      // This is the first time
      logDebug('First note created, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.NOTE_CREATED, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('note-creator', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking note creation:', error);
  }
};

/**
 * Track when a user moves all todos to the next day
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackTodoBatchOrganization = async (showSuccess = null) => {
  try {
    logDebug('Tracking todo batch organization');
    
    // Check if we've already tracked this achievement
    const hasTrackedBatchOrganization = await AsyncStorage.getItem(TRACKING_KEYS.TODO_BATCH_ORGANIZED);
    
    if (hasTrackedBatchOrganization !== 'true') {
      // This is the first time
      logDebug('First todo batch organization, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.TODO_BATCH_ORGANIZED, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('todo-organizer', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking todo batch organization:', error);
  }
};

/**
 * Track when a user creates a day view PDF export
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackDayExport = async (showSuccess = null) => {
  try {
    logDebug('Tracking day view PDF export');
    
    // Check if we've already tracked this achievement
    const hasTrackedDayExport = await AsyncStorage.getItem(TRACKING_KEYS.DAY_EXPORT_CREATED);
    
    if (hasTrackedDayExport !== 'true') {
      // This is the first time
      logDebug('First day view export, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.DAY_EXPORT_CREATED, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('day-export-expert', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking day view export:', error);
  }
};

/**
 * Track when a user creates a week view PDF export (premium feature)
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackWeekExport = async (showSuccess = null) => {
  try {
    logDebug('Tracking week view PDF export');
    
    // Check if we've already tracked this achievement
    const hasTrackedWeekExport = await AsyncStorage.getItem(TRACKING_KEYS.WEEK_EXPORT_CREATED);
    
    if (hasTrackedWeekExport !== 'true') {
      // This is the first time
      logDebug('First week view export, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.WEEK_EXPORT_CREATED, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('week-export-pro', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking week view export:', error);
  }
};

/**
 * Track when a user creates a month view PDF export (premium feature)
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackMonthExport = async (showSuccess = null) => {
  try {
    logDebug('Tracking month view PDF export');
    
    // Check if we've already tracked this achievement
    const hasTrackedMonthExport = await AsyncStorage.getItem(TRACKING_KEYS.MONTH_EXPORT_CREATED);
    
    if (hasTrackedMonthExport !== 'true') {
      // This is the first time
      logDebug('First month view export, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.MONTH_EXPORT_CREATED, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('month-export-pro', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking month view export:', error);
  }
};

/**
 * Track when a user creates their first life direction statement
 * @param {Object} direction - The direction data
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackVisionSetter = async (direction, showSuccess = null) => {
  try {
    logDebug('Tracking vision setter');
    
    // Only track if direction is not empty
    if (direction && direction.trim()) {
      // Check if we've already tracked this achievement
      const hasTracked = await AsyncStorage.getItem(TRACKING_KEYS.VISION_SETTER);
      
      if (hasTracked !== 'true') {
        logDebug('First life direction statement, unlocking achievement');
        
        // Set tracking flag
        await AsyncStorage.setItem(TRACKING_KEYS.VISION_SETTER, 'true');
        
        // Unlock the achievement
        await AchievementService.unlockAchievement('vision-setter', showSuccess);
      }
    }
  } catch (error) {
    console.error('Error tracking vision setter achievement:', error);
  }
};

/**
 * Enhanced track when a user creates their first goal
 * This ensures the achievement is unlocked immediately after goal creation
 * @param {Object} goal - The goal data
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackGoalPioneer = async (goal, showSuccess = null) => {
  try {
    logDebug('Tracking goal pioneer with enhanced reliability');
    
    // Check if we already tracked this achievement
    const hasTracked = await AsyncStorage.getItem(TRACKING_KEYS.GOAL_PIONEER);
    
    // Also check goal count to verify this is the first goal
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
    
    // Proceed if either (1) we haven't tracked this achievement yet, or 
    // (2) this is definitely the first goal
    if (hasTracked !== 'true' || goalsCount <= 1) {
      logDebug('First goal created, unlocking achievement');
      
      // Set tracking flag FIRST to prevent multiple unlocks
      await AsyncStorage.setItem(TRACKING_KEYS.GOAL_PIONEER, 'true');
      
      // APPROACH 1: Use direct achievement service
      try {
        // Import service directly to avoid circular dependencies
        const AchievementService = require('./AchievementService');
        
        if (AchievementService && AchievementService.unlockAchievement) {
          const result = await AchievementService.unlockAchievement('goal-pioneer', showSuccess);
          console.log('[FeatureExplorerTracker] Directly unlocked goal-pioneer achievement, result:', result);
          return result;
        }
      } catch (err) {
        console.log('[FeatureExplorerTracker] Error directly unlocking achievement:', err);
      }
      
      // APPROACH 2: Use achievement tracker as fallback
      try {
        // Import tracker directly
        const AchievementTracker = require('./AchievementTracker');
        
        if (AchievementTracker && AchievementTracker.trackAction) {
          console.log('[FeatureExplorerTracker] Using achievement tracker as fallback');
          await AchievementTracker.trackAction('goal_created', {
            goal: goal,
            firstGoal: true
          }, showSuccess);
        }
      } catch (err) {
        console.log('[FeatureExplorerTracker] Error using achievement tracker:', err);
      }
      
      // APPROACH 3: Direct AsyncStorage manipulation as last resort
      try {
        console.log('[FeatureExplorerTracker] Trying direct AsyncStorage manipulation as fallback');
        const achievementsData = await AsyncStorage.getItem('unlockedAchievements');
        let currentAchievements = {};
        
        if (achievementsData) {
          try {
            currentAchievements = JSON.parse(achievementsData);
          } catch (e) {
            console.log('[FeatureExplorerTracker] Error parsing achievements data:', e);
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
          console.log('[FeatureExplorerTracker] Directly set goal-pioneer achievement in AsyncStorage');
          
          // Try to refresh achievement context
          await refreshAchievementContext();
        }
      } catch (err) {
        console.log('[FeatureExplorerTracker] Error in direct AsyncStorage manipulation:', err);
      }
    }
  } catch (error) {
    console.error('[FeatureExplorerTracker] Error tracking goal pioneer achievement:', error);
  }
};

/**
 * Track when a user links a project to a goal
 * @param {Object} project - The project data
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackStrategicThinker = async (project, showSuccess = null) => {
  try {
    logDebug('Tracking strategic thinker');
    
    // Only track if project has a goalId
    if (project && project.goalId) {
      // Check if we've already tracked this achievement
      const hasTracked = await AsyncStorage.getItem(TRACKING_KEYS.STRATEGIC_THINKER);
      
      if (hasTracked !== 'true') {
        logDebug('First project linked to goal, unlocking achievement');
        
        // Set tracking flag
        await AsyncStorage.setItem(TRACKING_KEYS.STRATEGIC_THINKER, 'true');
        
        // Unlock the achievement
        await AchievementService.unlockAchievement('strategic-thinker', showSuccess);
      }
    }
  } catch (error) {
    console.error('Error tracking strategic thinker achievement:', error);
  }
};

/**
 * Track when a user sets a milestone date on a project
 * @param {Object} project - The project data
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackMilestoneMarker = async (project, showSuccess = null) => {
  try {
    logDebug('Tracking milestone marker');
    
    // Only track if project has a milestone date
    if (project && project.milestoneDate) {
      // Check if we've already tracked this achievement
      const hasTracked = await AsyncStorage.getItem(TRACKING_KEYS.MILESTONE_MARKER);
      
      if (hasTracked !== 'true') {
        logDebug('First milestone date set, unlocking achievement');
        
        // Set tracking flag
        await AsyncStorage.setItem(TRACKING_KEYS.MILESTONE_MARKER, 'true');
        
        // Unlock the achievement
        await AchievementService.unlockAchievement('milestone-marker', showSuccess);
      }
    }
  } catch (error) {
    console.error('Error tracking milestone marker achievement:', error);
  }
};

/**
 * Track when a user updates goal progress
 * @param {Object} goal - The goal data
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackProgressTracker = async (goal, showSuccess = null) => {
  try {
    logDebug('Tracking progress tracker');
    
    // Check if this achievement has been completed
    const hasCompleted = await AsyncStorage.getItem(TRACKING_KEYS.PROGRESS_TRACKER);
    
    if (hasCompleted === 'true') {
      // Already completed, no need to track further
      return;
    }
    
    // Get current count of progress updates
    const countStr = await AsyncStorage.getItem(TRACKING_KEYS.PROGRESS_TRACKER + '_count');
    let count = countStr ? parseInt(countStr, 10) : 0;
    
    // Increment count
    count++;
    
    // Save updated count
    await AsyncStorage.setItem(TRACKING_KEYS.PROGRESS_TRACKER + '_count', count.toString());
    
    logDebug(`Progress update count: ${count}`);
    
    // Unlock achievement when count reaches 5
    if (count >= 5) {
      logDebug('Fifth goal progress update, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.PROGRESS_TRACKER, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('progress-tracker', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking progress tracker achievement:', error);
  }
};

/**
 * Track when a user creates goals in different domains
 * @param {Object} goal - The goal data
 * @param {Array} allGoals - All existing goals
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackDomainDiversifier = async (goal, allGoals, showSuccess = null) => {
  try {
    logDebug('Tracking domain diversifier');
    
    // Check if this achievement has been completed
    const hasCompleted = await AsyncStorage.getItem(TRACKING_KEYS.DOMAIN_DIVERSIFIER);
    
    if (hasCompleted === 'true') {
      // Already completed, no need to track further
      return;
    }
    
    // Collect all unique domains from goals
    const domains = new Set();
    
    // Add domains from existing goals
    if (Array.isArray(allGoals)) {
      allGoals.forEach(existingGoal => {
        if (existingGoal.domain) {
          domains.add(existingGoal.domain);
        }
      });
    }
    
    // Add domain from the new goal if it exists
    if (goal && goal.domain) {
      domains.add(goal.domain);
    }
    
    logDebug(`Unique domains count: ${domains.size}`);
    
    // Unlock achievement when we have goals in 3 different domains
    if (domains.size >= 3) {
      logDebug('Goals in 3 different domains, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.DOMAIN_DIVERSIFIER, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('domain-diversifier', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking domain diversifier achievement:', error);
  }
};

/**
 * Track when a user has 3+ goals with linked projects
 * @param {Array} goals - All goals
 * @param {Array} projects - All projects
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackSystemBuilder = async (goals, projects, showSuccess = null) => {
  try {
    logDebug('Tracking system builder');
    
    // Check if this achievement has been completed
    const hasCompleted = await AsyncStorage.getItem(TRACKING_KEYS.SYSTEM_BUILDER);
    
    if (hasCompleted === 'true') {
      // Already completed, no need to track further
      return;
    }
    
    // Skip if we don't have valid arrays
    if (!Array.isArray(goals) || !Array.isArray(projects)) {
      return;
    }
    
    // Count goals that have at least one linked project
    const goalsWithProjects = new Set();
    
    // Check each project to see which goal it's linked to
    projects.forEach(project => {
      if (project.goalId) {
        goalsWithProjects.add(project.goalId);
      }
    });
    
    const count = goalsWithProjects.size;
    logDebug(`Goals with linked projects: ${count}`);
    
    // Unlock achievement when we have 3 or more goals with projects
    if (count >= 3) {
      logDebug('3+ goals with linked projects, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.SYSTEM_BUILDER, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('system-builder', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking system builder achievement:', error);
  }
};

/**
 * Track when a user completes their first goal
 * @param {Object} goal - The completed goal
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackCompletionChampion = async (goal, showSuccess = null) => {
  try {
    logDebug('Tracking completion champion');
    
    // Only track if goal is marked as completed
    if (goal && goal.completed) {
      // Check if we've already tracked this achievement
      const hasTracked = await AsyncStorage.getItem(TRACKING_KEYS.COMPLETION_CHAMPION);
      
      if (hasTracked !== 'true') {
        logDebug('First goal completed, unlocking achievement');
        
        // Set tracking flag
        await AsyncStorage.setItem(TRACKING_KEYS.COMPLETION_CHAMPION, 'true');
        
        // Unlock the achievement
        await AchievementService.unlockAchievement('completion-champion', showSuccess);
      }
    }
  } catch (error) {
    console.error('Error tracking completion champion achievement:', error);
  }
};

/**
 * Track daily app usage and update streak count
 * @param {Function} showSuccess - Optional success notification function
 * @param {String} subscriptionStatus - User's subscription status ('free', 'pro', 'unlimited')
 */
export const trackDailyLogin = async (showSuccess = null, subscriptionStatus = 'free') => {
  try {
    logDebug('Tracking daily login');
    
    // Get the current date string in format YYYY-MM-DD
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Get the last login date
    const lastLoginDateString = await AsyncStorage.getItem(TRACKING_KEYS.DAILY_LOGIN_DATE);
    
    // If no last login date, this is the first login
    if (!lastLoginDateString) {
      logDebug('First login detected');
      await AsyncStorage.setItem(TRACKING_KEYS.DAILY_LOGIN_DATE, todayString);
      await AsyncStorage.setItem(TRACKING_KEYS.CURRENT_STREAK, '1');
      return;
    }
    
    // If already logged in today, don't update streak
    if (lastLoginDateString === todayString) {
      logDebug('Already logged in today, not updating streak');
      return;
    }
    
    // Calculate the difference between today and last login
    const lastLoginDate = new Date(lastLoginDateString);
    lastLoginDate.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    // Get the current streak count
    const currentStreakString = await AsyncStorage.getItem(TRACKING_KEYS.CURRENT_STREAK);
    let currentStreak = currentStreakString ? parseInt(currentStreakString, 10) : 0;
    
    // If last login was yesterday, increment streak
    if (lastLoginDate.getTime() === yesterday.getTime()) {
      logDebug('Consecutive day login detected');
      currentStreak += 1;
      
      // Update the highest streak if needed
      const highestStreakString = await AsyncStorage.getItem(TRACKING_KEYS.HIGHEST_STREAK);
      const highestStreak = highestStreakString ? parseInt(highestStreakString, 10) : 0;
      
      if (currentStreak > highestStreak) {
        await AsyncStorage.setItem(TRACKING_KEYS.HIGHEST_STREAK, currentStreak.toString());
      }
    } 
    // If last login was more than a day ago, reset streak
    else {
      logDebug('Streak broken, resetting to 1');
      currentStreak = 1;
    }
    
    // Update streak and last login date
    await AsyncStorage.setItem(TRACKING_KEYS.CURRENT_STREAK, currentStreak.toString());
    await AsyncStorage.setItem(TRACKING_KEYS.DAILY_LOGIN_DATE, todayString);
    
    // Check for streak achievements
    await checkStreakAchievements(currentStreak, showSuccess, subscriptionStatus);
    
    logDebug(`Current streak: ${currentStreak} days`);
  } catch (error) {
    console.error('Error tracking daily login:', error);
  }
};

/**
 * Check if any streak achievements should be unlocked
 * @param {Number} streakDays - The current streak in days
 * @param {Function} showSuccess - Optional success notification function
 * @param {String} subscriptionStatus - User's subscription status ('free', 'pro', 'unlimited')
 */
const checkStreakAchievements = async (streakDays, showSuccess = null, subscriptionStatus = 'free') => {
  try {
    // 7-Day Streak
    if (streakDays >= 7) {
      // Check if we've already tracked this achievement
      const hasTracked7Days = await AsyncStorage.getItem(TRACKING_KEYS.STREAK_7_DAYS);
      
      if (hasTracked7Days !== 'true') {
        logDebug('7-Day Streak achievement unlocked');
        
        // Set tracking flag
        await AsyncStorage.setItem(TRACKING_KEYS.STREAK_7_DAYS, 'true');
        
        // Unlock the achievement
        await AchievementService.unlockAchievement('7-day-streak', showSuccess);
      }
    }
    
    // 30-Day Momentum
    if (streakDays >= 30) {
      // Check if we've already tracked this achievement
      const hasTracked30Days = await AsyncStorage.getItem(TRACKING_KEYS.STREAK_30_DAYS);
      
      if (hasTracked30Days !== 'true') {
        logDebug('30-Day Momentum achievement unlocked');
        
        // Set tracking flag
        await AsyncStorage.setItem(TRACKING_KEYS.STREAK_30_DAYS, 'true');
        
        // Unlock the achievement
        await AchievementService.unlockAchievement('30-day-momentum', showSuccess);
      }
    }
    
    // 90-Day Transformation
    if (streakDays >= 90) {
      // Check if we've already tracked this achievement
      const hasTracked90Days = await AsyncStorage.getItem(TRACKING_KEYS.STREAK_90_DAYS);
      
      if (hasTracked90Days !== 'true') {
        logDebug('90-Day Transformation achievement unlocked');
        
        // Set tracking flag
        await AsyncStorage.setItem(TRACKING_KEYS.STREAK_90_DAYS, 'true');
        
        // Unlock the achievement
        await AchievementService.unlockAchievement('90-day-transformation', showSuccess);
      }
    }
    
    // 180-Day Half-Year Mastermind - PREMIUM ACHIEVEMENT
    if (streakDays >= 180) {
      // Always mark as eligible for the achievement regardless of subscription status
      await AsyncStorage.setItem(TRACKING_KEYS.STREAK_180_DAYS_ELIGIBLE, 'true');
      
      // Check if we've already tracked this achievement
      const hasTracked180Days = await AsyncStorage.getItem(TRACKING_KEYS.STREAK_180_DAYS);
      
      if (hasTracked180Days !== 'true') {
        logDebug('180-Day streak achieved, checking subscription status');
        
        // Only unlock for pro/lifetime members
        if (subscriptionStatus === 'pro' || subscriptionStatus === 'unlimited') {
          logDebug('User has premium subscription, unlocking 180-Day achievement');
          
          // Set tracking flag
          await AsyncStorage.setItem(TRACKING_KEYS.STREAK_180_DAYS, 'true');
          
          // Unlock the achievement
          await AchievementService.unlockAchievement('half-year-mastermind', showSuccess);
        } else {
          logDebug('User does not have premium subscription, achievement not unlocked');
        }
      }
    }
    
    // 365-Day Year of Progress - PREMIUM ACHIEVEMENT
    if (streakDays >= 365) {
      // Always mark as eligible for the achievement regardless of subscription status
      await AsyncStorage.setItem(TRACKING_KEYS.STREAK_365_DAYS_ELIGIBLE, 'true');
      
      // Check if we've already tracked this achievement
      const hasTracked365Days = await AsyncStorage.getItem(TRACKING_KEYS.STREAK_365_DAYS);
      
      if (hasTracked365Days !== 'true') {
        logDebug('365-Day streak achieved, checking subscription status');
        
        // Only unlock for pro/lifetime members
        if (subscriptionStatus === 'pro' || subscriptionStatus === 'unlimited') {
          logDebug('User has premium subscription, unlocking 365-Day achievement');
          
          // Set tracking flag
          await AsyncStorage.setItem(TRACKING_KEYS.STREAK_365_DAYS, 'true');
          
          // Unlock the achievement
          await AchievementService.unlockAchievement('year-of-progress', showSuccess);
        } else {
          logDebug('User does not have premium subscription, achievement not unlocked');
        }
      }
    }
  } catch (error) {
    console.error('Error checking streak achievements:', error);
  }
};

/**
 * Check and unlock premium streak achievements if the user is eligible
 * Called when user subscription status changes to pro/lifetime
 * @param {Function} showSuccess - Optional success notification function
 */
export const checkPremiumStreakAchievements = async (showSuccess = null) => {
  try {
    logDebug('Checking for eligible premium streak achievements');
    
    // Check for 180-day streak eligibility
    const is180DaysEligible = await AsyncStorage.getItem(TRACKING_KEYS.STREAK_180_DAYS_ELIGIBLE);
    const hasTracked180Days = await AsyncStorage.getItem(TRACKING_KEYS.STREAK_180_DAYS);
    
    if (is180DaysEligible === 'true' && hasTracked180Days !== 'true') {
      logDebug('User is eligible for 180-Day achievement, unlocking now');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.STREAK_180_DAYS, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('half-year-mastermind', showSuccess);
    }
    
    // Check for 365-day streak eligibility
    const is365DaysEligible = await AsyncStorage.getItem(TRACKING_KEYS.STREAK_365_DAYS_ELIGIBLE);
    const hasTracked365Days = await AsyncStorage.getItem(TRACKING_KEYS.STREAK_365_DAYS);
    
    if (is365DaysEligible === 'true' && hasTracked365Days !== 'true') {
      logDebug('User is eligible for 365-Day achievement, unlocking now');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.STREAK_365_DAYS, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('year-of-progress', showSuccess);
    }
  } catch (error) {
    console.error('Error checking premium streak achievements:', error);
  }
};

/**
 * Helper function to get the current streak
 * @returns {Promise<number>} Current streak in days
 */
export const getCurrentStreak = async () => {
  try {
    // Get the current streak from storage
    const currentStreakString = await AsyncStorage.getItem(TRACKING_KEYS.CURRENT_STREAK);
    return currentStreakString ? parseInt(currentStreakString, 10) : 0;
  } catch (error) {
    console.error('Error getting current streak:', error);
    return 0;
  }
};

/**
 * Helper function to get the highest streak
 * @returns {Promise<number>} Highest streak in days
 */
export const getHighestStreak = async () => {
  try {
    // Get the highest streak from storage
    const highestStreakString = await AsyncStorage.getItem(TRACKING_KEYS.HIGHEST_STREAK);
    return highestStreakString ? parseInt(highestStreakString, 10) : 0;
  } catch (error) {
    console.error('Error getting highest streak:', error);
    return 0;
  }
};

/**
 * Set a test streak value (for development and testing)
 * @param {number} streakDays - The streak days to set
 * @param {Function} showSuccess - Optional success notification function
 * @param {String} subscriptionStatus - User's subscription status
 * @returns {Promise<boolean>} Whether the operation was successful
 */
export const setTestStreak = async (streakDays, showSuccess = null, subscriptionStatus = 'free') => {
  if (__DEV__) {
    try {
      await AsyncStorage.setItem(TRACKING_KEYS.CURRENT_STREAK, streakDays.toString());
      
      // Update highest streak if this test streak is higher
      const highestStreakString = await AsyncStorage.getItem(TRACKING_KEYS.HIGHEST_STREAK);
      const highestStreak = highestStreakString ? parseInt(highestStreakString, 10) : 0;
      
      if (streakDays > highestStreak) {
        await AsyncStorage.setItem(TRACKING_KEYS.HIGHEST_STREAK, streakDays.toString());
      }
      
      // Check for achievements with the current subscription status
      await checkStreakAchievements(streakDays, showSuccess, subscriptionStatus);
      
      // Update today's login date
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      await AsyncStorage.setItem(TRACKING_KEYS.DAILY_LOGIN_DATE, todayString);
      
      return true;
    } catch (error) {
      console.error('Error setting test streak:', error);
      return false;
    }
  }
  return false;
};

/**
 * Track when a user completes an AI conversation
 * @param {Object} conversationData - Data about the conversation
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackAIConversation = async (conversationData, showSuccess = null) => {
  try {
    logDebug('Tracking AI conversation');
    
    // Get current conversation count
    const countStr = await AsyncStorage.getItem(TRACKING_KEYS.AI_CONVERSATIONS_COUNT);
    let count = countStr ? parseInt(countStr, 10) : 0;
    
    // Increment count
    count++;
    
    // Save updated count
    await AsyncStorage.setItem(TRACKING_KEYS.AI_CONVERSATIONS_COUNT, count.toString());
    
    logDebug(`AI conversation count: ${count}`);
    
    // Check if this is the first conversation (AI Apprentice achievement)
    const hasTrackedFirstConversation = await AsyncStorage.getItem(TRACKING_KEYS.FIRST_AI_CONVERSATION);
    
    if (hasTrackedFirstConversation !== 'true') {
      logDebug('First AI conversation detected, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.FIRST_AI_CONVERSATION, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('ai-apprentice', showSuccess);
    }
    
    // Check for AI Power User achievement (50+ conversations)
    if (count >= 50) {
      const hasTrackedPowerUser = await AsyncStorage.getItem(TRACKING_KEYS.AI_POWER_USER);
      
      if (hasTrackedPowerUser !== 'true') {
        logDebug('50+ AI conversations completed, unlocking AI Power User achievement');
        
        // Set tracking flag
        await AsyncStorage.setItem(TRACKING_KEYS.AI_POWER_USER, 'true');
        
        // Unlock the achievement
        await AchievementService.unlockAchievement('ai-power-user', showSuccess);
      }
    }
  } catch (error) {
    console.error('Error tracking AI conversation:', error);
  }
};

/**
 * Track when a user uploads a document to AI context
 * @param {Object} documentData - Data about the uploaded document
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackDocumentUpload = async (documentData, showSuccess = null) => {
  try {
    logDebug('Tracking document upload to AI context');
    
    // Check if we've already tracked this achievement
    const hasTrackedFirstUpload = await AsyncStorage.getItem(TRACKING_KEYS.FIRST_DOCUMENT_UPLOAD);
    
    if (hasTrackedFirstUpload !== 'true') {
      logDebug('First document upload detected, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.FIRST_DOCUMENT_UPLOAD, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('document-master', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking document upload:', error);
  }
};

/**
 * Track when AI generates a goal or project that the user adds to their system
 * @param {Object} generatedData - Data about the generated goal/project
 * @param {String} type - Type of generated content ('goal' or 'project')
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackAIGenerated = async (generatedData, type, showSuccess = null) => {
  try {
    logDebug(`Tracking AI generated ${type}`);
    
    // Check if we've already tracked this achievement
    const hasTrackedGenerated = await AsyncStorage.getItem(TRACKING_KEYS.AI_GENERATED_GOAL);
    
    if (hasTrackedGenerated !== 'true') {
      logDebug(`First AI generated ${type} detected, unlocking achievement`);
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.AI_GENERATED_GOAL, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('strategic-advisor', showSuccess);
    }
  } catch (error) {
    console.error(`Error tracking AI generated ${type}:`, error);
  }
};

/**
 * Track when a user creates a time block based on AI recommendation
 * @param {Object} timeBlockData - Data about the time block
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackAITimeBlock = async (timeBlockData, showSuccess = null) => {
  try {
    logDebug('Tracking AI recommended time block');
    
    // Check if we've already tracked this achievement
    const hasTrackedTimeBlock = await AsyncStorage.getItem(TRACKING_KEYS.AI_RECOMMENDED_TIMEBLOCK);
    
    if (hasTrackedTimeBlock !== 'true') {
      logDebug('First AI recommended time block detected, unlocking achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.AI_RECOMMENDED_TIMEBLOCK, 'true');
      
      // Unlock the achievement
      await AchievementService.unlockAchievement('time-optimizer', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking AI recommended time block:', error);
  }
};

/**
 * Get the current AI conversation count
 * @returns {Promise<number>} Current conversation count
 */
export const getAIConversationCount = async () => {
  try {
    const countStr = await AsyncStorage.getItem(TRACKING_KEYS.AI_CONVERSATIONS_COUNT);
    return countStr ? parseInt(countStr, 10) : 0;
  } catch (error) {
    console.error('Error getting AI conversation count:', error);
    return 0;
  }
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

/**
 * Track when a user sends their first referral
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackFirstReferralSent = async (showSuccess = null) => {
  try {
    logDebug('Tracking first referral sent');
    
    // Check if we've already tracked this achievement
    const hasTrackedFirstReferral = await AsyncStorage.getItem(TRACKING_KEYS.FIRST_REFERRAL_SENT);
    
    if (hasTrackedFirstReferral !== 'true') {
      // This is the first referral sent
      logDebug('First referral sent, unlocking Referral Guide achievement');
      
      // Set tracking flag
      await AsyncStorage.setItem(TRACKING_KEYS.FIRST_REFERRAL_SENT, 'true');
      
      // Unlock the Referral Guide achievement
      await AchievementService.unlockAchievement('referral-guide', showSuccess);
    }
  } catch (error) {
    console.error('Error tracking first referral sent:', error);
  }
};

/**
 * Track when a referral converts (someone subscribes using referral code)
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackReferralConversion = async (showSuccess = null) => {
  try {
    logDebug('Tracking referral conversion');
    
    // Get current conversion count
    const currentCountStr = await AsyncStorage.getItem(TRACKING_KEYS.REFERRALS_CONVERTED_COUNT);
    const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;
    const newCount = currentCount + 1;
    
    // Update the count
    await AsyncStorage.setItem(TRACKING_KEYS.REFERRALS_CONVERTED_COUNT, newCount.toString());
    
    logDebug(`Referral conversion count updated to: ${newCount}`);
    
    // Check if we've reached 3 conversions for Community Builder achievement
    if (newCount >= 3) {
      // Check if we've already unlocked Community Builder
      const achievements = await AchievementService.getUnlockedAchievements();
      const hasCommunityBuilder = achievements.some(a => a.id === 'community-builder');
      
      if (!hasCommunityBuilder) {
        logDebug('Reached 3 referral conversions, unlocking Community Builder achievement');
        await AchievementService.unlockAchievement('community-builder', showSuccess);
      }
    }
  } catch (error) {
    console.error('Error tracking referral conversion:', error);
  }
};

/**
 * Track Early Adopter achievement when user becomes a founder
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackEarlyAdopter = async (showSuccess = null) => {
  try {
    logDebug('Tracking Early Adopter achievement');
    
    // Check if we've already tracked this achievement
    const hasTrackedEarlyAdopter = await AsyncStorage.getItem(TRACKING_KEYS.EARLY_ADOPTER);
    
    if (hasTrackedEarlyAdopter !== 'true') {
      // Import founderCodeService to check founder status
      const founderCodeService = require('./founderCodeService').default;
      const isFounder = await founderCodeService.isFounder();
      
      if (isFounder) {
        logDebug('User is a founder, unlocking Early Adopter achievement');
        
        // Set tracking flag
        await AsyncStorage.setItem(TRACKING_KEYS.EARLY_ADOPTER, 'true');
        
        // Unlock the Early Adopter achievement
        await AchievementService.unlockAchievement('early-adopter', showSuccess);
      } else {
        logDebug('User is not a founder, cannot unlock Early Adopter achievement');
      }
    }
  } catch (error) {
    console.error('Error tracking Early Adopter achievement:', error);
  }
};

/**
 * Track Feature Influencer achievement when Pro member submits feedback
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackFeatureInfluencer = async (showSuccess = null) => {
  try {
    logDebug('Tracking Feature Influencer achievement');
    
    // Check if we've already tracked this achievement
    const hasTrackedFeatureInfluencer = await AsyncStorage.getItem(TRACKING_KEYS.FEATURE_INFLUENCER);
    
    if (hasTrackedFeatureInfluencer !== 'true') {
      // Check if user is Pro member
      const subscriptionStatus = await AsyncStorage.getItem('subscriptionStatus');
      const isProMember = subscriptionStatus === 'pro' || subscriptionStatus === 'unlimited';
      
      if (isProMember) {
        logDebug('Pro member submitted feedback, unlocking Feature Influencer achievement');
        
        // Set tracking flag
        await AsyncStorage.setItem(TRACKING_KEYS.FEATURE_INFLUENCER, 'true');
        
        // Unlock the Feature Influencer achievement
        await AchievementService.unlockAchievement('feature-influencer', showSuccess);
      } else {
        logDebug('User is not Pro member, cannot unlock Feature Influencer achievement');
      }
    }
  } catch (error) {
    console.error('Error tracking Feature Influencer achievement:', error);
  }
};

/**
 * Track Insider Status achievement when user becomes Pro member
 * @param {Function} showSuccess - Optional success notification function
 */
export const trackInsiderStatus = async (showSuccess = null) => {
  try {
    logDebug('Tracking Insider Status achievement');
    
    // Check if we've already tracked this achievement
    const hasTrackedInsiderStatus = await AsyncStorage.getItem(TRACKING_KEYS.INSIDER_STATUS);
    
    if (hasTrackedInsiderStatus !== 'true') {
      // Check if user is Pro member (has paid AI subscription)
      const subscriptionStatus = await AsyncStorage.getItem('subscriptionStatus');
      const isProMember = subscriptionStatus === 'pro' || subscriptionStatus === 'unlimited';
      
      if (isProMember) {
        logDebug('User upgraded to paid AI subscription, unlocking Insider Status achievement');
        
        // Set tracking flag
        await AsyncStorage.setItem(TRACKING_KEYS.INSIDER_STATUS, 'true');
        
        // Unlock the Insider Status achievement
        await AchievementService.unlockAchievement('insider-status', showSuccess);
      } else {
        logDebug('User is not Pro member, cannot unlock Insider Status achievement');
      }
    }
  } catch (error) {
    console.error('Error tracking Insider Status achievement:', error);
  }
};

export default {
  trackProfilePictureUpdate,
  trackThemeColorChange,
  trackDashboardHolisticView,
  trackDomainFocusView,
  trackNoteCreation,
  trackTodoBatchOrganization,
  trackDayExport,
  trackWeekExport,
  trackMonthExport,
  // Strategic Progress tracking functions
  trackVisionSetter,
  trackGoalPioneer,
  trackStrategicThinker,
  trackMilestoneMarker,
  trackProgressTracker,
  trackDomainDiversifier,
  trackSystemBuilder,
  trackCompletionChampion,
  // New functions for Consistency Champions
  trackDailyLogin,
  getCurrentStreak,
  getHighestStreak,
  setTestStreak,
  checkPremiumStreakAchievements,
  // AI Mastery tracking functions
  trackAIConversation,
  trackDocumentUpload,
  trackAIGenerated,
  trackAITimeBlock,
  getAIConversationCount,
  refreshAchievementContext,
  resetAchievementTracking,
  // Referral tracking functions
  trackFirstReferralSent,
  trackReferralConversion,
  // Founder tracking functions
  trackEarlyAdopter,
  // Feature Influencer tracking function
  trackFeatureInfluencer,
  // Insider Status tracking function
  trackInsiderStatus,
  TRACKING_KEYS
};