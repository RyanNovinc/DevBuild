// src/hooks/useProfileScreenData.js - Centralized loading orchestrator for ProfileScreen
import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { profileLog, statsLog } from '../utils/LoggerUtility';
import FeatureExplorerTracker from '../services/FeatureExplorerTracker';

// Loading states enum
const LOADING_STATES = {
  IDLE: 'idle',
  WAITING_FOR_CONTEXT: 'waiting_for_context',
  LOADING_PROFILE: 'loading_profile',
  CALCULATING_STATS: 'calculating_stats',
  READY: 'ready',
  ERROR: 'error'
};

// Timeout configurations
const TIMEOUTS = {
  CONTEXT_WAIT: 10000, // 10 seconds max wait for AppContext
  PROFILE_LOAD: 5000,  // 5 seconds for profile loading
  STATS_CALC: 3000,    // 3 seconds for stats calculation
  TOTAL_MAX: 15000     // 15 seconds total maximum
};

// Helper function to check for pending onboarding achievement
const checkPendingOnboardingAchievement = async () => {
  try {
    const pendingAchievement = await AsyncStorage.getItem('pendingOnboardingAchievement');
    if (pendingAchievement === 'true') {
      await AsyncStorage.removeItem('pendingOnboardingAchievement');
      
      setTimeout(async () => {
        try {
          await FeatureExplorerTracker.trackOnboardingCompletion();
          profileLog('🏆 Onboarding completion achievement triggered after profile load');
        } catch (error) {
          console.error('Error triggering onboarding completion achievement:', error);
        }
      }, 1000);
    }
  } catch (error) {
    console.error('Error checking pending onboarding achievement:', error);
  }
};

// Generate referral code
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useProfileScreenData = (navigation, route) => {
  const isMountedRef = useRef(true);
  const timeoutRef = useRef(null);
  const operationAbortController = useRef(new AbortController());
  
  // Get contexts
  const appContext = useAppContext();
  const auth = useAuth();
  const { profile: contextProfile } = useProfile();
  
  // State for loading orchestration
  const [loadingState, setLoadingState] = useState(LOADING_STATES.IDLE);
  const [error, setError] = useState(null);
  
  // Unified data state
  const [profileData, setProfileData] = useState({
    // Profile info
    profile: {
      name: '',
      email: '',
      bio: '',
      profileImage: null,
      defaultAvatar: null
    },
    
    // Stats
    totalActiveGoals: 0,
    completedGoals: 0,
    activeMilestones: 0,
    totalActiveTasks: 0,
    
    // Settings & preferences
    userSubscriptionStatus: 'free',
    hasEnteredReferralCode: false,
    showAIButton: true,
    referralCode: '',
    referralsLeft: 3,
    settings: {},
    
    // UI state
    localDomains: [],
    showProGiftSurprise: false,
    showAIPlusUpgrade: false,
    showTestModeToggles: __DEV__
  });

  // BRUTAL FIX: Listen for manual data clearing from delete all button
  useEffect(() => {
    const checkForManualClear = async () => {
      try {
        const clearSignal = await AsyncStorage.getItem('forceProfileClear');
        if (clearSignal === 'true') {
          console.log('🚨 MANUAL PROFILE CLEAR DETECTED - FORCING ZERO STATS AND CLEARING APPCONTEXT');
          
          // Force clear AppContext arrays if available
          if (appContext) {
            console.log('🔄 ProfileScreen: Force clearing AppContext arrays');
            if (appContext.setGoals) appContext.setGoals([]);
            if (appContext.setMilestones) appContext.setMilestones([]);
            if (appContext.setTasks) appContext.setTasks([]);
            if (appContext.setTodos) appContext.setTodos([]);
            if (appContext.setTomorrowTodos) appContext.setTomorrowTodos([]);
            if (appContext.setLaterTodos) appContext.setLaterTodos([]);
          }
          
          // Force zero stats in ProfileScreen
          setProfileData(prev => ({
            ...prev,
            totalActiveGoals: 0,
            completedGoals: 0,
            activeMilestones: 0,
            totalActiveTasks: 0,
            localDomains: []
          }));
          
          // Clear the signal
          await AsyncStorage.removeItem('forceProfileClear');
          console.log('💯 MANUAL CLEAR COMPLETE');
        }
      } catch (error) {
        console.error('Error checking manual clear signal:', error);
      }
    };

    // Check immediately
    checkForManualClear();

    // Set up more aggressive interval to check every 200ms for 10 seconds
    const interval = setInterval(checkForManualClear, 200);
    setTimeout(() => clearInterval(interval), 10000);

    return () => clearInterval(interval);
  }, [appContext]);

  // Check if AppContext is ready
  const isAppContextReady = useCallback(() => {
    if (!appContext) return false;
    
    const { isLoading, goals, milestones, tasks } = appContext;
    
    // AppContext must not be loading and must have initialized arrays (even if empty)
    return !isLoading && 
           Array.isArray(goals) && 
           Array.isArray(milestones) && 
           Array.isArray(tasks);
  }, [appContext]);

  // Load profile data from various sources
  const loadProfileData = useCallback(async (signal) => {
    try {
      profileLog('Loading profile data...');
      
      const user = auth?.user;
      let newProfile = {
        name: user?.displayName || '',
        email: user?.email || '',
        bio: '',
        profileImage: null,
        defaultAvatar: null
      };
      
      // Prioritize contextProfile if available
      if (contextProfile) {
        newProfile = { ...contextProfile };
        profileLog('Using profile from ProfileContext');
      } else {
        // Check route params
        const updatedProfile = route?.params?.updatedProfile;
        if (updatedProfile) {
          newProfile = updatedProfile;
          profileLog('Using profile from route params');
          // Clear the param
          navigation?.setParams({ updatedProfile: undefined });
        } else {
          // Try AsyncStorage
          const storedProfileJson = await AsyncStorage.getItem('userProfile');
          if (storedProfileJson && !signal?.aborted) {
            newProfile = JSON.parse(storedProfileJson);
            profileLog('Loaded profile from AsyncStorage');
          }
        }
      }
      
      if (signal?.aborted) throw new Error('Operation aborted');
      
      // Load additional profile-related data in parallel
      const [
        subscriptionStatus,
        aiButtonValue,
        hasEnteredReferralCode,
        referralCode,
        referralsRemaining
      ] = await Promise.all([
        AsyncStorage.getItem('subscriptionStatus').catch(() => 'free'),
        AsyncStorage.getItem('showAIButton').catch(() => null),
        AsyncStorage.getItem('hasEnteredReferralCode').then(value => value === 'true').catch(() => false),
        AsyncStorage.getItem('referralCode').catch(() => ''),
        AsyncStorage.getItem('referralsRemaining').catch(() => '3')
      ]);
      
      if (signal?.aborted) throw new Error('Operation aborted');
      
      // Process referral data for pro users
      let finalReferralCode = referralCode;
      let finalReferralsLeft = parseInt(referralsRemaining) || 3;
      
      const isPro = subscriptionStatus === 'pro' || subscriptionStatus === 'unlimited';
      if (isPro && !finalReferralCode) {
        finalReferralCode = generateReferralCode();
        await AsyncStorage.setItem('referralCode', finalReferralCode);
      }
      
      return {
        profile: newProfile,
        userSubscriptionStatus: subscriptionStatus || 'free',
        hasEnteredReferralCode,
        showAIButton: aiButtonValue === null ? true : aiButtonValue === 'true',
        referralCode: finalReferralCode,
        referralsLeft: finalReferralsLeft
      };
      
    } catch (error) {
      if (error.message === 'Operation aborted') throw error;
      console.error('Error loading profile data:', error);
      throw new Error('Failed to load profile data');
    }
  }, [auth, contextProfile, route, navigation]);

  // Calculate stats from AppContext data
  const calculateStats = useCallback(async (signal) => {
    try {
      statsLog('Calculating stats...');
      
      if (!appContext) throw new Error('AppContext not available');
      
      const { goals, milestones, tasks, settings } = appContext;
      
      // SAFETY CHECK: If all arrays are empty, return zero stats immediately
      const goalsToUse = Array.isArray(goals) ? goals : [];
      const milestonesToUse = Array.isArray(milestones) ? milestones : [];
      const tasksToUse = Array.isArray(tasks) ? tasks : [];
      
      if (goalsToUse.length === 0 && milestonesToUse.length === 0 && tasksToUse.length === 0) {
        statsLog('All arrays are empty - returning zero stats');
        return {
          totalActiveGoals: 0,
          completedGoals: 0,
          activeMilestones: 0,
          totalActiveTasks: 0,
          settings: settings || {}
        };
      }
      
      // Calculate goal statistics
      const activeGoalsCount = goalsToUse.filter(goal => !goal.completed).length;
      const completedGoalsCount = goalsToUse.filter(goal => goal.completed).length;
      
      if (signal?.aborted) throw new Error('Operation aborted');
      
      // Calculate milestone statistics (use already defined milestonesToUse)
      
      // Create completed goals map for filtering
      const completedGoalsMap = {};
      const validGoalIds = new Set();
      
      goalsToUse.forEach(goal => {
        validGoalIds.add(goal.id);
        if (goal.completed === true) {
          completedGoalsMap[goal.id] = true;
        }
      });
      
      // Count active milestones (not completed, not linked to completed/deleted goals)
      const activeMilestonesCount = milestonesToUse.filter(milestone => {
        if (milestone.completed === true || milestone.status === 'done') return false;
        if (milestone.goalId && completedGoalsMap[milestone.goalId]) return false;
        if (milestone.goalId && !validGoalIds.has(milestone.goalId)) return false;
        return true;
      }).length;
      
      if (signal?.aborted) throw new Error('Operation aborted');
      
      // Calculate task statistics (use already defined tasksToUse)
      let activeTasksCount = 0;
      
      // Create completed milestones map
      const completedMilestonesMap = {};
      milestonesToUse.forEach(milestone => {
        if (milestone.completed === true || 
            milestone.status === 'done' || 
            (milestone.goalId && completedGoalsMap[milestone.goalId]) ||
            (milestone.goalId && !validGoalIds.has(milestone.goalId))) {
          completedMilestonesMap[milestone.id] = true;
        }
      });
      
      // Count active tasks
      activeTasksCount = tasksToUse.filter(task => {
        if (task.completed || task.status === 'done') return false;
        if (task.milestoneId && completedMilestonesMap[task.milestoneId]) return false;
        if (task.goalId && completedGoalsMap[task.goalId]) return false;
        if (task.goalId && !validGoalIds.has(task.goalId)) return false;
        return true;
      }).length;
      
      statsLog(`Final stats: Goals(${activeGoalsCount}/${completedGoalsCount}), Milestones(${activeMilestonesCount}), Tasks(${activeTasksCount})`);
      
      return {
        totalActiveGoals: activeGoalsCount,
        completedGoals: completedGoalsCount,
        activeMilestones: activeMilestonesCount,
        totalActiveTasks: activeTasksCount,
        settings: settings || {}
      };
      
    } catch (error) {
      if (error.message === 'Operation aborted') throw error;
      console.error('Error calculating stats:', error);
      throw new Error('Failed to calculate stats');
    }
  }, [appContext]);

  // Calculate domains from goals
  const calculateDomains = useCallback(() => {
    try {
      if (!appContext) return [];
      
      const { goals } = appContext;
      const goalsToUse = Array.isArray(goals) ? goals : [];
      
      if (goalsToUse.length === 0) return [];
      
      const domainMap = {};
      
      goalsToUse.forEach(goal => {
        if (!goal) return;
        
        const domainName = goal.domain || 'General';
        const domainIcon = goal.icon || 'star';
        const domainColor = goal.color || '#607D8B';
        const isCompleted = goal.completed === true;
        
        if (!domainMap[domainName]) {
          domainMap[domainName] = {
            id: domainName,
            name: domainName,
            icon: domainIcon,
            color: domainColor,
            goalCount: 1,
            completedGoalCount: isCompleted ? 1 : 0
          };
        } else {
          domainMap[domainName].goalCount++;
          if (isCompleted) {
            domainMap[domainName].completedGoalCount++;
          }
        }
      });
      
      return Object.values(domainMap);
    } catch (error) {
      console.error('Error calculating domains:', error);
      return [];
    }
  }, [appContext]);

  // Main loading orchestrator
  const loadData = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      profileLog('🚀 Starting ProfileScreen data loading orchestration');
      
      // Set total timeout
      const totalTimeoutId = setTimeout(() => {
        if (isMountedRef.current) {
          setError('Loading timeout - please try again');
          setLoadingState(LOADING_STATES.ERROR);
        }
      }, TIMEOUTS.TOTAL_MAX);
      
      // Phase 1: Wait for AppContext to be ready
      setLoadingState(LOADING_STATES.WAITING_FOR_CONTEXT);
      profileLog('Phase 1: Waiting for AppContext...');
      
      const contextWaitStart = Date.now();
      while (!isAppContextReady() && isMountedRef.current) {
        if (Date.now() - contextWaitStart > TIMEOUTS.CONTEXT_WAIT) {
          throw new Error('AppContext failed to load within timeout');
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!isMountedRef.current) return;
      profileLog('✅ AppContext is ready');
      
      // Phase 2: Load profile data
      setLoadingState(LOADING_STATES.LOADING_PROFILE);
      profileLog('Phase 2: Loading profile data...');
      
      const signal = operationAbortController.current.signal;
      const profileDataResult = await Promise.race([
        loadProfileData(signal),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile loading timeout')), TIMEOUTS.PROFILE_LOAD)
        )
      ]);
      
      if (!isMountedRef.current) return;
      profileLog('✅ Profile data loaded');
      
      // Phase 3: Calculate stats
      setLoadingState(LOADING_STATES.CALCULATING_STATS);
      profileLog('Phase 3: Calculating stats...');
      
      const statsResult = await Promise.race([
        calculateStats(signal),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Stats calculation timeout')), TIMEOUTS.STATS_CALC)
        )
      ]);
      
      if (!isMountedRef.current) return;
      profileLog('✅ Stats calculated');
      
      // Phase 4: Calculate domains and finalize
      const domains = calculateDomains();
      
      // Check for gift surprise
      const shouldShowGift = await AsyncStorage.getItem('showProGiftSurprise').catch(() => null);
      const shouldShowAIUpgrade = await AsyncStorage.getItem('showAIPlusUpgrade').catch(() => null);
      
      // Combine all data
      const finalData = {
        ...profileDataResult,
        ...statsResult,
        localDomains: domains,
        showProGiftSurprise: shouldShowGift === 'true',
        showAIPlusUpgrade: shouldShowAIUpgrade === 'true'
      };
      
      if (isMountedRef.current) {
        setProfileData(finalData);
        setLoadingState(LOADING_STATES.READY);
        setError(null);
        
        // Clear any gift triggers
        if (shouldShowGift === 'true') {
          await AsyncStorage.removeItem('showProGiftSurprise');
        }
        if (shouldShowAIUpgrade === 'true') {
          await AsyncStorage.removeItem('showAIPlusUpgrade');
        }
        
        // Check for pending achievements
        await checkPendingOnboardingAchievement();
      }
      
      clearTimeout(totalTimeoutId);
      profileLog('🎉 ProfileScreen loading completed successfully');
      
    } catch (error) {
      console.error('ProfileScreen loading error:', error);
      if (isMountedRef.current) {
        setError(error.message || 'Failed to load profile data');
        setLoadingState(LOADING_STATES.ERROR);
      }
    }
  }, [isAppContextReady, loadProfileData, calculateStats, calculateDomains]);

  // Retry function
  const retry = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setError(null);
    setLoadingState(LOADING_STATES.IDLE);
    
    // Abort any ongoing operations
    operationAbortController.current.abort();
    operationAbortController.current = new AbortController();
    
    // Restart loading
    loadData();
  }, [loadData]);

  // Initialize loading on mount and context changes
  useEffect(() => {
    if (loadingState === LOADING_STATES.IDLE) {
      loadData();
    }
  }, [loadData, loadingState]);

  // React to contextProfile changes and reload profile data
  useEffect(() => {
    if (loadingState === LOADING_STATES.READY && contextProfile) {
      // Profile context has been updated, refresh our profile data
      console.log('ProfileScreenData: contextProfile changed, updating profile data');
      setProfileData(prevData => ({
        ...prevData,
        profile: contextProfile
      }));
    }
  }, [contextProfile, loadingState]);

  // React to AppContext data changes and recalculate stats
  useEffect(() => {
    if (loadingState === LOADING_STATES.READY && appContext && isAppContextReady()) {
      console.log('ProfileScreenData: AppContext data changed, recalculating stats');
      const recalculateStats = async () => {
        try {
          const statsResult = await calculateStats();
          const domains = calculateDomains();
          
          setProfileData(prevData => ({
            ...prevData,
            ...statsResult,
            localDomains: domains
          }));
          
          console.log('ProfileScreenData: Stats updated after AppContext change');
        } catch (error) {
          console.error('Error recalculating stats after AppContext change:', error);
        }
      };
      
      recalculateStats();
    }
  }, [appContext?.goals, appContext?.milestones, appContext?.tasks, loadingState, isAppContextReady, calculateStats, calculateDomains]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      operationAbortController.current.abort();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Derived state
  const isLoading = loadingState !== LOADING_STATES.READY && loadingState !== LOADING_STATES.ERROR;
  const isError = loadingState === LOADING_STATES.ERROR;

  return {
    // Loading state
    isLoading,
    isError,
    error,
    loadingState,
    
    // Data
    profileData,
    
    // Actions
    retry,
    
    // For debugging
    appContextReady: isAppContextReady()
  };
};

export default useProfileScreenData;