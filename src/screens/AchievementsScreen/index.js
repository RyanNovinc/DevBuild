// src/screens/AchievementsScreen/index.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  SafeAreaView,
  Platform,
  Dimensions
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Import components
import AchievementDetailsModal from './components/AchievementDetailsModal';
import ProgressRing from './components/ProgressRing';
import NewAchievementsPopup from './components/NewAchievementsPopup';
import AchievementToast from './components/AchievementToast';
import GridAchievementCategory from './components/GridAchievementCategory';

// Import new level system components
import LevelTrophy from './components/LevelTrophy';
import LevelUpCelebration from './components/LevelUpCelebration';
import LevelService from '../../services/LevelService';

// Import achievement data
import { ACHIEVEMENTS, CATEGORIES } from './data/achievementsData';

// Import achievement context and service
import { useAchievements } from '../../context/AchievementContext';
import { resetAllAchievements } from '../../services/AchievementService';

// Import notification context for success/error messages
import { useNotification } from '../../context/NotificationContext';

// Default theme as fallback to prevent errors
const DEFAULT_THEME = {
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#757575',
  primary: '#3F51B5',
  card: '#F5F5F5',
  border: '#E0E0E0',
  statusBar: '#FFFFFF',
  warning: '#FF9800',
  dark: false
};

// Main achievements screen component
const AchievementsScreen = ({ navigation, route }) => {
  // Get dimensions
  const { width, height } = Dimensions.get('window');
  
  // Get theme safely - catch any errors
  let themeContext;
  try {
    themeContext = require('../../context/ThemeContext');
  } catch (error) {
    console.log('Error importing ThemeContext:', error);
  }
  
  // Try to get theme from context
  let themeFromContext;
  try {
    if (themeContext && themeContext.useTheme) {
      const { theme } = themeContext.useTheme();
      themeFromContext = theme;
    }
  } catch (error) {
    console.log('Error accessing theme:', error);
  }
  
  // Use theme from context or default theme
  const theme = themeFromContext || DEFAULT_THEME;
  
  // Get safe area insets
  const insets = useSafeAreaInsets();
  const isDarkMode = theme.background === '#000000';
  
  // Get notification context safely
  let notificationContext;
  try {
    notificationContext = require('../../context/NotificationContext');
  } catch (error) {
    console.log('Error importing NotificationContext:', error);
  }
  
  // Try to get notification functions
  let showSuccess, showError;
  try {
    if (notificationContext && notificationContext.useNotification) {
      const notification = notificationContext.useNotification();
      showSuccess = notification?.showSuccess || ((msg) => console.log(msg));
      showError = notification?.showError || ((msg) => console.error(msg));
    } else {
      showSuccess = (msg) => console.log(msg);
      showError = (msg) => console.error(msg);
    }
  } catch (error) {
    console.log('Error accessing notification context:', error);
    showSuccess = (msg) => console.log(msg);
    showError = (msg) => console.error(msg);
  }
  
  // Get app context safely but don't use hooks directly
  let appContext;
  try {
    appContext = require('../../context/AppContext');
  } catch (error) {
    console.log('Error importing AppContext:', error);
  }
  
  // Try to get user subscription status
  let userSubscriptionStatus = 'free';
  try {
    if (appContext && appContext.useAppContext) {
      const app = appContext.useAppContext();
      userSubscriptionStatus = app?.userSubscriptionStatus || 'free';
    }
  } catch (error) {
    console.log('Error accessing app context:', error);
  }
  
  // TabView state
  const [navigationState, setNavigationState] = useState({
    index: 0,
    routes: [
      { key: 'progress', title: 'Progress' },
      { key: 'achievements', title: 'Achievements' },
    ],
  });
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  
  // State for expanded categories - initialize empty to ensure all categories start collapsed
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // State for achievement toast - for listening to real-time unlocks
  const [toastVisible, setToastVisible] = useState(false);
  const [currentToastAchievement, setCurrentToastAchievement] = useState(null);
  
  // Get achievement context functions
  const { 
    unlockedAchievements,
    isAchievementUnlocked, 
    getAchievementUnlockDate,
    getTotalPoints,
    getNewAchievements,
    markAchievementsAsSeen,
    unlockAchievement,
    resetAllAchievements: contextResetAchievements,
    refreshAchievements
  } = useAchievements();
  
  // State
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [stats, setStats] = useState({
    totalUnlocked: 0,
    percentComplete: 0,
    totalPoints: 0,
    stage: 1,
    stageTitle: "Explorer",
    currentStageThreshold: 0,
    nextStageThreshold: 50,
    progressPercent: 0,
    scoreForNextStage: 50
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // State for new achievements popup
  const [newAchievements, setNewAchievements] = useState([]);
  const [isNewAchievementsModalVisible, setIsNewAchievementsModalVisible] = useState(false);
  
  // Track premium achievements
  const [totalPremiumAchievements, setTotalPremiumAchievements] = useState(0);
  const [unlockedPremiumAchievements, setUnlockedPremiumAchievements] = useState(0);
  
  // Stage system state
  const [previousStage, setPreviousStage] = useState(1);
  const [isStagingUp, setIsStagingUp] = useState(false);
  const [stageAnimationComplete, setStageAnimationComplete] = useState(true);
  const [testMode, setTestMode] = useState(false);
  const [testStats, setTestStats] = useState(null);
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Track processing state and loading history
  const isProcessingGoals = useRef(false);
  const hasLoadedRef = useRef(false);
  const isMountedRef = useRef(true);
  
  // Improved function to check if goal-pioneer achievement should be unlocked
  const checkGoalsAndUnlockAchievement = async () => {
    try {
      console.log('[AchievementsScreen] Checking goals for achievement unlock...');
      
      // First check if the achievement is already unlocked
      let isAlreadyUnlocked = false;
      
      try {
        // Direct check from context first
        if (typeof isAchievementUnlocked === 'function') {
          isAlreadyUnlocked = isAchievementUnlocked('goal-pioneer');
          console.log('[AchievementsScreen] Achievement status from context:', isAlreadyUnlocked);
        }
        
        // Double-check with AsyncStorage
        if (!isAlreadyUnlocked) {
          const achievementsData = await AsyncStorage.getItem('unlockedAchievements');
          
          if (achievementsData) {
            const parsedData = JSON.parse(achievementsData);
            isAlreadyUnlocked = parsedData && 
                              parsedData['goal-pioneer'] && 
                              parsedData['goal-pioneer'].unlocked === true;
            console.log('[AchievementsScreen] Achievement status from storage:', isAlreadyUnlocked);
          }
        }
      } catch (checkErr) {
        console.error('[AchievementsScreen] Error checking achievement status:', checkErr);
      }
      
      // Now check if there are any goals
      let hasGoals = false;
      
      try {
        // Direct AsyncStorage check
        const storedGoals = await AsyncStorage.getItem('goals');
        if (storedGoals) {
          const goalsData = JSON.parse(storedGoals);
          hasGoals = Array.isArray(goalsData) && goalsData.length > 0;
          console.log('[AchievementsScreen] Goals exist:', hasGoals);
        }
      } catch (storageErr) {
        console.log('[AchievementsScreen] Error checking goals in storage:', storageErr);
      }
      
      // If there are goals but achievement not unlocked, unlock it
      if (hasGoals && !isAlreadyUnlocked) {
        console.log('[AchievementsScreen] Goals exist but achievement not unlocked - fixing...');
        
        // First set the tracking flag
        await AsyncStorage.setItem('achievement_tracker_first_goal', 'true');
        
        // Import services directly
        const AchievementService = require('../../services/AchievementService');
        const AchievementTracker = require('../../services/AchievementTracker');
        
        // Try multiple unlock approaches
        
        // Method 1: Use AchievementService
        if (AchievementService && AchievementService.unlockAchievement) {
          console.log('[AchievementsScreen] Unlocking via AchievementService');
          await AchievementService.unlockAchievement('goal-pioneer', showSuccess);
        }
        
        // Method 2: Use AchievementTracker
        if (AchievementTracker && AchievementTracker.trackAction) {
          console.log('[AchievementsScreen] Tracking via AchievementTracker');
          await AchievementTracker.trackAction('goal_created', { firstGoal: true }, showSuccess);
        }
        
        // Method 3: Direct context unlock
        if (typeof unlockAchievement === 'function') {
          console.log('[AchievementsScreen] Unlocking via context function');
          await unlockAchievement('goal-pioneer');
        }
        
        // Method 4: Direct AsyncStorage update as last resort
        try {
          console.log('[AchievementsScreen] Directly updating AsyncStorage');
          const achievementsData = await AsyncStorage.getItem('unlockedAchievements');
          let currentAchievements = {};
          
          if (achievementsData) {
            try {
              currentAchievements = JSON.parse(achievementsData);
            } catch (e) {
              console.log('[AchievementsScreen] Error parsing achievements data:', e);
            }
          }
          
          currentAchievements['goal-pioneer'] = {
            unlocked: true,
            date: new Date().toISOString(),
            seen: false
          };
          
          await AsyncStorage.setItem('unlockedAchievements', JSON.stringify(currentAchievements));
        } catch (directErr) {
          console.error('[AchievementsScreen] Error directly updating storage:', directErr);
        }
        
        // Force refresh achievement data
        if (refreshAchievements) {
          console.log('[AchievementsScreen] Refreshing achievements');
          refreshAchievements();
          
          // Add a small delay and refresh again to ensure UI updates
          setTimeout(() => {
            if (refreshAchievements) {
              refreshAchievements();
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error('[AchievementsScreen] Error in checkGoalsAndUnlockAchievement:', error);
    }
  };

  // Add event listener for achievement refresh
  useEffect(() => {
    // Function to handle refresh events - this is within a component so hooks are allowed
    const handleRefreshEvent = () => {
      console.log('Received refresh-achievements event');
      if (typeof refreshAchievements === 'function') {
        refreshAchievements();
      }
    };
    
    // Add event listener
    if (typeof global !== 'undefined' && typeof global.addEventListener === 'function') {
      global.addEventListener('refresh-achievements', handleRefreshEvent);
    }
    
    // Run the goal check on component mount
    // Call the non-hook function from within this effect
    checkGoalsAndUnlockAchievement().catch(err => {
      console.error('Error in goal achievement check:', err);
    });
    
    return () => {
      // Remove event listener
      if (typeof global !== 'undefined' && typeof global.removeEventListener === 'function') {
        global.removeEventListener('refresh-achievements', handleRefreshEvent);
      }
    };
  }, [refreshAchievements]); // Only refreshAchievements is a dependency
  
  // Handle focusing a specific category from route params
  useEffect(() => {
    if (route?.params?.focusCategory) {
      // Only expand the specific category from route params
      setExpandedCategories({
        [route.params.focusCategory]: true
      });
    }
    
    // NEW: Handle switching to achievements tab when navigated from achievement toast
    if (route?.params?.activeTab === 'achievements') {
      // Use small delay to ensure UI is ready
      setTimeout(() => {
        setNavigationState(prevState => ({ ...prevState, index: 1 }));
      }, 50);
    }
    
    // Handle highlighting a specific achievement
    if (route?.params?.highlightAchievement && route?.params?.focusCategory) {
      // Expand the category containing the achievement
      setExpandedCategories({
        [route.params.focusCategory]: true
      });
      
      // Switch to achievements tab if not already there
      if (route?.params?.activeTab === 'achievements') {
        setTimeout(() => {
          setNavigationState(prevState => ({ ...prevState, index: 1 }));
        }, 50);
      }
      
      // Clear the highlight after animation completes (about 3 seconds)
      setTimeout(() => {
        if (navigation.setParams) {
          navigation.setParams({ 
            highlightAchievement: null,
            focusCategory: route.params.focusCategory // Keep category expanded
          });
        }
      }, 3000);
    }
  }, [route?.params]); // This includes both focusCategory and the new activeTab param
  
  // Listen for new achievement events
  useEffect(() => {
    const handleNewAchievement = (event) => {
      if (event && event.detail && event.detail.achievementId) {
        const achievementId = event.detail.achievementId;
        const achievement = ACHIEVEMENTS[achievementId];
        
        if (achievement) {
          setCurrentToastAchievement(achievement);
          setToastVisible(true);
        }
      }
    };
    
    // Add event listener
    if (typeof document !== 'undefined') {
      document.addEventListener('achievement-unlocked', handleNewAchievement);
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('achievement-unlocked', handleNewAchievement);
      }
    };
  }, []);
  
  // Add focus effect to refresh achievements when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      console.log('AchievementsScreen focused, refreshing data...');
      
      // Force refresh of achievements data from storage
      if (refreshAchievements) {
        refreshAchievements();
      }
      
      // Force data refresh when screen is focused
      if (!isProcessingGoals.current) {
        isProcessingGoals.current = true;
        
        // Set loading state only if not loaded before
        if (!hasLoadedRef.current) {
          setIsLoading(true);
        }
        
        // Use a slight timeout to prevent race conditions
        setTimeout(async () => {
          try {
            // First, directly check storage for achievements
            let achievementsChanged = false;
            
            try {
              const achievementsData = await AsyncStorage.getItem('unlockedAchievements');
              if (achievementsData) {
                const parsedData = JSON.parse(achievementsData);
                // Check if goal-pioneer is unlocked in storage
                if (parsedData['goal-pioneer'] && 
                    (!unlockedAchievements['goal-pioneer'] || 
                     !unlockedAchievements['goal-pioneer'].unlocked)) {
                  console.log('Found goal-pioneer in storage but not in state, forcing refresh');
                  achievementsChanged = true;
                  
                  // Force refresh by calling refreshAchievements again
                  if (refreshAchievements) {
                    refreshAchievements();
                    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
                  }
                }
              }
            } catch (storageErr) {
              console.log('Error checking achievements in storage:', storageErr);
            }
            
            if (route?.params?.filterDomain) {
              applyDomainFilter(route.params.filterDomain);
            } else {
              // Process achievements without filtering
              // Check if we're in test mode before recalculating stats
              const storedTestMode = await AsyncStorage.getItem('testMode');
              const storedTestLevel = await AsyncStorage.getItem('testLevel');
              
              if (storedTestMode === 'true' && storedTestLevel && !testMode) {
                // Restore test mode if it was persisted but not in current state
                const testStage = parseInt(storedTestLevel);
                console.log(`Restoring test stage ${testStage} on focus`);
                
                const testStagePoints = LevelService.getStageThreshold(testStage);
                const newTestStats = {
                  totalUnlocked: stats.totalUnlocked || 0,
                  percentComplete: stats.percentComplete || 0,
                  totalPoints: testStagePoints,
                  stage: testStage,
                  stageTitle: LevelService.getStageTitle(testStage),
                  currentStageThreshold: LevelService.getStageThreshold(testStage),
                  nextStageThreshold: LevelService.getStageThreshold(testStage + 1),
                  scoreForNextStage: LevelService.getStageThreshold(testStage + 1) - testStagePoints,
                  progressPercent: 0
                };
                
                setTestMode(true);
                setTestStats(newTestStats);
                setStats(newTestStats);
              } else if (storedTestMode !== 'true') {
                // Only calculate real stats if not in test mode
                calculateStats();
              }
              
              calculatePremiumStats();
            }
            
            // Check for new achievements
            const newAchievementsQueue = getNewAchievements();
            if (newAchievementsQueue && newAchievementsQueue.length > 0) {
              setNewAchievements(newAchievementsQueue);
              setIsNewAchievementsModalVisible(true);
            }
            
            // Mark that we've successfully loaded achievements at least once
            hasLoadedRef.current = true;
            
            // Animate the list fade-in
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true
            }).start();
            
            setIsLoading(false);
          } catch (error) {
            console.error('Error processing achievements on focus:', error);
            // Make sure to set loading to false even if there's an error
            if (isMountedRef.current) {
              setIsLoading(false);
            }
            showError('Error loading achievements');
          } finally {
            // Clear the processing flag
            isProcessingGoals.current = false;
          }
        }, 300);
      }
      
      return () => {};
    }, [route?.params, refreshAchievements, unlockedAchievements])
  );
  
  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Handle hiding the toast
  const handleHideToast = () => {
    setToastVisible(false);
    setCurrentToastAchievement(null);
  };
  
  // Handle stage-up animation completion
  const handleStageUpAnimationComplete = () => {
    setIsStagingUp(false);
    setStageAnimationComplete(true);
  };
  
  // Function to handle stage up for testing
  const handleStageUp = async (newStage) => {
    // Make sure animations are completed and new stage is valid
    if (!stageAnimationComplete) return;
    
    // Store current stage
    const currentStage = stats.stage;
    
    // Validate and cap the new stage
    const nextStage = Math.min(Math.max(1, newStage), 12);
    
    if (nextStage > currentStage) {
      // Calculate the points needed for this stage
      const nextStagePoints = LevelService.getStageThreshold(nextStage);
      const currentPoints = getTotalPoints();
      const pointsNeeded = nextStagePoints - currentPoints;
      
      console.log(`Stage up: Need ${pointsNeeded} more points to reach stage ${nextStage}`);
      
      // Create fake test achievements to reach the required points
      if (pointsNeeded > 0) {
        // Get some achievement IDs that we can use for testing
        const testAchievementIds = [
          'test-achievement-1',
          'test-achievement-2', 
          'test-achievement-3',
          'test-achievement-4',
          'test-achievement-5'
        ];
        
        // Load current achievements
        const currentAchievements = await AsyncStorage.getItem('unlockedAchievements');
        const parsedAchievements = currentAchievements ? JSON.parse(currentAchievements) : {};
        
        // Add fake achievements with enough points
        let remainingPoints = pointsNeeded;
        let achievementIndex = 0;
        
        while (remainingPoints > 0 && achievementIndex < testAchievementIds.length) {
          const achievementId = testAchievementIds[achievementIndex];
          const pointsToAdd = Math.min(remainingPoints, 50); // Add up to 50 points per achievement
          
          parsedAchievements[achievementId] = {
            unlocked: true,
            date: new Date().toISOString(),
            seen: false,
            points: pointsToAdd
          };
          
          remainingPoints -= pointsToAdd;
          achievementIndex++;
        }
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('unlockedAchievements', JSON.stringify(parsedAchievements));
        
        // Refresh achievement context
        refreshAchievements();
        
        console.log(`Added ${achievementIndex} test achievements with ${pointsNeeded} total points`);
      }
      
      // Create new test stats
      const newTestStats = {
        totalUnlocked: stats.totalUnlocked || 0,
        percentComplete: stats.percentComplete || 0,
        totalPoints: nextStagePoints,
        stage: nextStage,
        stageTitle: LevelService.getStageTitle(nextStage),
        currentStageThreshold: LevelService.getStageThreshold(nextStage),
        nextStageThreshold: LevelService.getStageThreshold(nextStage + 1),
        scoreForNextStage: LevelService.getStageThreshold(nextStage + 1) - nextStagePoints,
        progressPercent: 0 // Reset progress percentage
      };
      
      // Save test stage to AsyncStorage so it persists
      await AsyncStorage.setItem('testLevel', nextStage.toString());
      await AsyncStorage.setItem('testMode', 'true');
      
      // Set everything in one batch to prevent visual flicker
      // Set the previous stage for the animation
      setPreviousStage(currentStage);
      // Enable test mode and store test stats (this prevents calculateStats from overwriting)
      setTestMode(true);
      setTestStats(newTestStats);
      // Update stats immediately now that we're protected from overwrites
      setStats(newTestStats);
      // Start animation states
      setStageAnimationComplete(false);
      setIsStagingUp(true);
    }
  };
  
  // Load achievements data and check for new achievements
  useEffect(() => {
    const loadAchievementsData = async () => {
      try {
        // Check if we have a persisted test level
        const storedTestMode = await AsyncStorage.getItem('testMode');
        const storedTestLevel = await AsyncStorage.getItem('testLevel');
        
        if (storedTestMode === 'true' && storedTestLevel) {
          const testStage = parseInt(storedTestLevel);
          console.log(`Loading persisted test stage: ${testStage}`);
          
          // Create test stats for the persisted stage
          const testStagePoints = LevelService.getStageThreshold(testStage);
          const newTestStats = {
            totalUnlocked: 0, // Will be calculated later
            percentComplete: 0, // Will be calculated later
            totalPoints: testStagePoints,
            stage: testStage,
            stageTitle: LevelService.getStageTitle(testStage),
            currentStageThreshold: LevelService.getStageThreshold(testStage),
            nextStageThreshold: LevelService.getStageThreshold(testStage + 1),
            scoreForNextStage: LevelService.getStageThreshold(testStage + 1) - testStagePoints,
            progressPercent: 0
          };
          
          setTestMode(true);
          setTestStats(newTestStats);
          setStats(newTestStats);
          setPreviousStage(testStage);
        }
        
        // First, directly check if goal-pioneer is unlocked
        const isGoalPioneerUnlocked = isAchievementUnlocked('goal-pioneer');
        console.log(`Goal Pioneer achievement initially: ${isGoalPioneerUnlocked ? 'Unlocked' : 'Locked'}`);
        
        // Check and possibly unlock the goal achievement
        await checkGoalsAndUnlockAchievement();
        
        // Check if there are any new achievements to show
        const newAchievementsQueue = getNewAchievements();
        
        if (newAchievementsQueue && newAchievementsQueue.length > 0) {
          setNewAchievements(newAchievementsQueue);
          setIsNewAchievementsModalVisible(true);
        }
        
        // Calculate stats (only if not in test mode)
        if (!testMode && storedTestMode !== 'true') {
          calculateStats();
        }
        
        // Calculate premium achievement stats
        calculatePremiumStats();
        
        // Start animations
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }).start();
        
        // After everything, check goal-pioneer status again
        const nowUnlocked = isAchievementUnlocked('goal-pioneer');
        console.log(`Goal Pioneer achievement after init: ${nowUnlocked ? 'Unlocked' : 'Locked'}`);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading achievements:', error);
        setIsLoading(false);
      }
    };
    
    loadAchievementsData();
  }, []);
  
  // Calculate stats based on unlocked achievements
  const calculateStats = () => {
    try {
      // If we're in test mode, don't recalculate stats - just exit early
      if (testMode && testStats) {
        console.log('Skipping stats calculation - in test mode');
        return;
      }
      
      const totalAchievements = Object.keys(ACHIEVEMENTS).length;
      
      // Count unlocked achievements
      let totalUnlocked = 0;
      Object.keys(ACHIEVEMENTS).forEach(id => {
        if (isAchievementUnlocked(id)) {
          totalUnlocked++;
        }
      });
      
      const percentComplete = Math.round((totalUnlocked / totalAchievements) * 100);
      
      // Calculate total points
      const totalPoints = getTotalPoints();
      
      // Use LevelService to get stage info
      const stageInfo = LevelService.getStageInfo(totalPoints);
      
      // Check for stage up
      const currentStage = stageInfo.stage;
      if (currentStage > previousStage && previousStage > 0) {
        // Play haptic feedback
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // Trigger stage up celebration
        setIsStagingUp(true);
        setStageAnimationComplete(false);
      }
      
      // Update previous stage state
      setPreviousStage(currentStage);
      
      // Set the calculated stats
      const statsToSet = {
        totalUnlocked,
        percentComplete,
        totalPoints,
        stage: stageInfo.stage,
        stageTitle: stageInfo.title,
        currentStageThreshold: stageInfo.currentStageThreshold,
        nextStageThreshold: stageInfo.nextStageThreshold,
        progressPercent: stageInfo.progressPercent,
        scoreForNextStage: stageInfo.scoreForNextStage
      };
      
      setStats(statsToSet);
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };
  
  // Calculate premium achievement stats
  const calculatePremiumStats = () => {
    try {
      // Count total premium achievements
      const premiumAchievements = Object.values(ACHIEVEMENTS).filter(a => a.premium === true);
      setTotalPremiumAchievements(premiumAchievements.length);
      
      // Count unlocked premium achievements
      let unlockedPremium = 0;
      premiumAchievements.forEach(achievement => {
        if (isAchievementUnlocked(achievement.id)) {
          unlockedPremium++;
        }
      });
      setUnlockedPremiumAchievements(unlockedPremium);
    } catch (error) {
      console.error('Error calculating premium stats:', error);
    }
  };
  
  // Handle tab index change
  const handleIndexChange = (index) => {
    try {
      setNavigationState({ ...navigationState, index });
      
      // Provide haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    } catch (error) {
      console.error('Error changing tab:', error);
    }
  };
  
  // Apply domain filter
  const applyDomainFilter = (filterDomain) => {
    try {
      // Filter achievements by domain
      const filtered = Object.values(ACHIEVEMENTS).filter(achievement => {
        return achievement.category === filterDomain;
      });
      
      // Separate and sort achievements
      const completed = [];
      const active = [];
      
      filtered.forEach(achievement => {
        if (isAchievementUnlocked(achievement.id)) {
          completed.push(achievement);
        } else {
          active.push(achievement);
        }
      });
      
      // Set filtered state
      // This is specific to how your app handles filtered achievements
      // You may need to adjust this based on your actual implementation
      
      // Calculate stats (only if not in test mode)
      if (!testMode) {
        calculateStats();
        calculatePremiumStats();
      }
    } catch (error) {
      console.error('Error applying domain filter:', error);
    }
  };
  
  // Handle unlocking an achievement (for testing)
  const handleUnlockAchievement = async (achievementId) => {
    try {
      // Use the achievement context to unlock
      const wasUnlocked = await unlockAchievement(achievementId);
      
      if (wasUnlocked) {
        // Recalculate stats
        calculateStats();
        calculatePremiumStats();
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };
  
  // Handle pressing an achievement
  const handleAchievementPress = (achievement) => {
    setSelectedAchievement(achievement);
    setIsDetailsModalVisible(true);
  };
  
  // Handle toggling a category's expansion state
  const toggleCategoryExpansion = (categoryId) => {
    setExpandedCategories(prev => {
      // If this category is already expanded, close it
      if (prev[categoryId]) {
        return {};
      }
      
      // Otherwise, close all categories and open only this one
      return { [categoryId]: true };
    });
  };
  
  // Handle filter change with haptic feedback
  const handleFilterChange = (filter) => {
    if (filter !== activeFilter) {
      setActiveFilter(filter);
      
      // Close any open categories when switching filters
      setExpandedCategories({});
      
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
    }
  };
  
  // Filter achievements based on active filter
  const getFilteredAchievements = (achievements) => {
    if (activeFilter === 'all') return achievements;
    
    return achievements.filter(achievement => {
      const isUnlocked = isAchievementUnlocked(achievement.id);
      return (activeFilter === 'unlocked' && isUnlocked) || 
             (activeFilter === 'locked' && !isUnlocked);
    });
  };
  
  // Reset all achievements (for testing) - IMPROVED VERSION
  const handleResetAchievements = async () => {
    try {
      console.log("Starting achievement reset process...");
      let success = false;
      
      // Approach 1: Direct AsyncStorage access first (most reliable)
      try {
        console.log("Attempting direct AsyncStorage reset...");
        await AsyncStorage.setItem('unlockedAchievements', JSON.stringify({}));
        
        // IMPORTANT: Also clear the achievement tracker markers
        const allKeys = await AsyncStorage.getAllKeys();
        const trackerKeys = allKeys.filter(key => key.startsWith('achievement_tracker_'));
        
        if (trackerKeys.length > 0) {
          await AsyncStorage.multiRemove(trackerKeys);
          console.log(`Cleared ${trackerKeys.length} achievement tracker markers`);
        }
        
        console.log("Direct AsyncStorage reset succeeded");
        success = true;
      } catch (err) {
        console.log("Direct AsyncStorage reset failed:", err);
      }
      
      // Approach 2: Try using the service function
      if (!success) {
        try {
          console.log("Attempting service function reset...");
          // Make sure this is properly imported
          const serviceResult = await resetAllAchievements();
          success = serviceResult === true;
          console.log("Service reset result:", success);
          
          // Also try to reset achievement tracking separately
          const AchievementTracker = require('../../services/AchievementTracker');
          if (AchievementTracker && AchievementTracker.resetAchievementTracking) {
            await AchievementTracker.resetAchievementTracking();
            console.log("Reset achievement tracking markers");
          }
        } catch (err) {
          console.log("Service reset failed:", err);
        }
      }
      
      // Approach 3: Try using the context function
      if (!success && typeof contextResetAchievements === 'function') {
        try {
          console.log("Attempting context function reset...");
          const contextResult = await contextResetAchievements();
          success = contextResult === true;
          console.log("Context reset result:", success);
        } catch (err) {
          console.log("Context reset failed:", err);
        }
      }
      
      if (success) {
        // Provide haptic feedback
        if (Platform.OS !== 'web') {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } catch (err) {
            console.log("Haptic feedback failed:", err);
          }
        }
        
        // Show success notification
        if (typeof showSuccess === 'function') {
          showSuccess('All achievements have been reset');
        }
        
        // IMPORTANT: Force immediate context refresh
        if (typeof refreshAchievements === 'function') {
          console.log("Refreshing achievements context...");
          refreshAchievements();
        }
        
        // Set loading state for UI feedback
        setIsLoading(true);
        
        // Clear in-memory achievements data
        setNewAchievements([]);
        setIsNewAchievementsModalVisible(false);
        
        // Force a complete reload by using a small delay
        setTimeout(() => {
          // Call refresh again to ensure changes are applied
          if (typeof refreshAchievements === 'function') {
            refreshAchievements();
          }
          
          // Force recalculation of stats (only if not in test mode)
          if (!testMode) {
            calculateStats();
          }
          calculatePremiumStats();
          
          // Animate the list fade-in again
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          }).start();
          
          // Reset stage system
          setPreviousStage(1);
          setIsStagingUp(false);
          setStageAnimationComplete(true);
          
          // End loading state
          setIsLoading(false);
        }, 500);
      } else {
        console.error("All reset methods failed");
        if (typeof showError === 'function') {
          showError('Failed to reset achievements');
        }
      }
    } catch (error) {
      console.error('Error resetting achievements:', error);
      if (typeof showError === 'function') {
        showError('Error resetting achievements');
      }
    }
  };
  
  // Handle navigation to pricing screen
  const handleUpgradePress = () => {
    navigation.navigate('PricingScreen');
  };
  
  // Handle closing the new achievements popup
  const handleCloseNewAchievementsModal = () => {
    setIsNewAchievementsModalVisible(false);
    
    // Mark all new achievements as seen
    const achievementIds = newAchievements.map(a => a.id);
    markAchievementsAsSeen(achievementIds);
  };
  
  // Get current active tab key
  const activeTabKey = navigationState.routes[navigationState.index].key;

  // Calculate responsive dimensions - much bigger circle
  const progressRingSize = Math.min(width * 0.85, 320);
  const progressRingStrokeWidth = progressRingSize * 0.06;
  const levelBadgeSize = progressRingSize * 0.28;
  
  // Render the Progress Tab
  const renderProgressTab = () => {
    return (
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={styles.progressTabContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.progressTabContainer, { paddingTop: 40 }]}>
          {/* Redesigned Progress Circle with Integrated Score and Icon */}
          <View style={[styles.progressRingWrapper, { marginVertical: 40 }]}>
            {/* Background Circle */}
            <View style={[
              styles.progressCircle,
              {
                width: progressRingSize,
                height: progressRingSize,
                borderRadius: progressRingSize / 2,
                borderWidth: progressRingStrokeWidth,
                borderColor: theme.border + '30',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.card + '40',
              }
            ]}>
              
              {/* Stage Icon on Right Side */}
              <View style={[
                styles.stageIconContainer,
                {
                  position: 'absolute',
                  right: -levelBadgeSize / 2,
                  top: '50%',
                  marginTop: -levelBadgeSize / 2,
                  width: levelBadgeSize,
                  height: levelBadgeSize,
                }
              ]}>
                <LevelTrophy 
                  level={stats.stage} 
                  size={levelBadgeSize} 
                  animate={!stageAnimationComplete}
                />
              </View>
              
              {/* Score Display in Center */}
              <View style={styles.scoreContainer}>
                <Text style={[
                  styles.mainScoreText,
                  { 
                    color: theme.text,
                    fontSize: progressRingSize * 0.25,
                    fontWeight: 'bold',
                  }
                ]}>
                  {stats.totalPoints}
                </Text>
              </View>
              
              {/* Stage Progress at Bottom */}
              {stats.scoreForNextStage > 0 && (
                <View style={[
                  styles.progressTextContainer,
                  {
                    position: 'absolute',
                    bottom: 20,
                  }
                ]}>
                  <Text style={[
                    styles.progressText,
                    { 
                      color: theme.textSecondary,
                      fontSize: progressRingSize * 0.04,
                      textAlign: 'center',
                    }
                  ]}>
                    {stats.scoreForNextStage} to Stage {stats.stage + 1}
                  </Text>
                  <Text style={[
                    styles.stageTitle,
                    { 
                      color: theme.primary,
                      fontSize: progressRingSize * 0.045,
                      textAlign: 'center',
                      fontWeight: '600',
                      marginTop: 2,
                    }
                  ]}>
                    {LevelService.getStageTitle(stats.stage + 1)}
                  </Text>
                </View>
              )}
              
              {/* Circular Progress Bar */}
              <Svg 
                style={{ position: 'absolute' }}
                width={progressRingSize} 
                height={progressRingSize}
              >
                <Circle
                  cx={progressRingSize / 2}
                  cy={progressRingSize / 2}
                  r={(progressRingSize - progressRingStrokeWidth) / 2}
                  stroke={theme.primary}
                  strokeWidth={progressRingStrokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${((progressRingSize - progressRingStrokeWidth) * Math.PI * (stats.progressPercent / 100))}, ${((progressRingSize - progressRingStrokeWidth) * Math.PI)}`}
                  transform={`rotate(-90 ${progressRingSize / 2} ${progressRingSize / 2})`}
                />
              </Svg>
            </View>
          </View>
          
          
          
          
          
          
          
          {/* Premium Banner for free users */}
          {userSubscriptionStatus === 'free' && (
            <TouchableOpacity
              style={[
                styles.premiumBanner,
                { marginTop: 48, marginBottom: 24 }
              ]}
              onPress={handleUpgradePress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumBannerGradient}
              />
              <View style={styles.premiumBannerContent}>
                <Ionicons name="lock-open" size={24} color="#FFFFFF" />
                <View style={styles.premiumBannerTextContainer}>
                  <Text 
                    style={styles.premiumBannerTitle}
                    maxFontSizeMultiplier={1.3}
                  >
                    Access Premium Achievements
                  </Text>
                  <Text 
                    style={styles.premiumBannerSubtitle}
                    maxFontSizeMultiplier={1.3}
                  >
                    {`${unlockedPremiumAchievements}/${totalPremiumAchievements} Premium Achievements Unlocked`}
                  </Text>
                </View>
              </View>
              <View style={styles.premiumButtonContainer}>
                <LinearGradient
                  colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
                  style={styles.premiumButton}
                >
                  <Text 
                    style={styles.premiumButtonText}
                    maxFontSizeMultiplier={1.3}
                  >
                    Upgrade
                  </Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          )}
          
          {/* Stats Cards at Bottom */}
          <View style={[styles.statsCardsContainer, { marginTop: 48, marginBottom: 24 }]}>
            {/* Unlocked Card */}
            <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#4ade80' }]}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              </View>
              <Text 
                style={[styles.statsValue, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                {stats.totalUnlocked}
              </Text>
              <Text 
                style={[styles.statsLabel, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                Unlocked
              </Text>
            </View>
            
            {/* Total Card */}
            <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#6366f1' }]}>
                <Ionicons name="trophy" size={24} color="#FFFFFF" />
              </View>
              <Text 
                style={[styles.statsValue, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                {Object.keys(ACHIEVEMENTS).length}
              </Text>
              <Text 
                style={[styles.statsLabel, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                Total
              </Text>
            </View>
            
            {/* Completion Card */}
            <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="pie-chart" size={24} color="#FFFFFF" />
              </View>
              <Text 
                style={[styles.statsValue, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                {stats.percentComplete}%
              </Text>
              <Text 
                style={[styles.statsLabel, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                Complete
              </Text>
            </View>
          </View>
          
          {/* Developer Mode - All Developer Buttons */}
          {__DEV__ && (
            <View style={{ width: '100%', marginTop: 32, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.border + '30' }}>
              <Text 
                style={[
                  styles.sectionTitle, 
                  { 
                    color: theme.text,
                    textAlign: 'center',
                    marginBottom: 16,
                    fontSize: 16,
                    opacity: 0.7
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Developer Tools
              </Text>
              
              {/* Stage Testing Buttons */}
              <View style={{ flexDirection: 'column', width: '100%', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.devButton,
                      { 
                        backgroundColor: 'rgba(0,255,0,0.15)', 
                        flex: 1, 
                        marginRight: 8, 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        opacity: stageAnimationComplete ? 1 : 0.5 
                      }
                    ]}
                    onPress={() => handleStageUp(stats.stage + 1)}
                    disabled={!stageAnimationComplete}
                  >
                    <Text style={[styles.devButtonText, { color: '#00CC00' }]}>
                      Stage Up +1
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.devButton,
                      { 
                        backgroundColor: 'rgba(255,165,0,0.15)', 
                        flex: 1, 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        opacity: stageAnimationComplete ? 1 : 0.5 
                      }
                    ]}
                    onPress={() => {
                      // Only trigger animation if not already animating
                      if (stageAnimationComplete) {
                        setStageAnimationComplete(false);
                        setIsStagingUp(true);
                      }
                    }}
                    disabled={!stageAnimationComplete}
                  >
                    <Text style={[styles.devButtonText, { color: '#FF8C00' }]}>
                      Test Animation
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
                  <TouchableOpacity
                    style={[
                      styles.devButton,
                      { 
                        backgroundColor: 'rgba(255,0,0,0.15)', 
                        flex: 1, 
                        marginRight: 8,
                        justifyContent: 'center', 
                        alignItems: 'center'
                      }
                    ]}
                    onPress={async () => {
                      // Reset animation state and test mode
                      setStageAnimationComplete(true);
                      setIsStagingUp(false);
                      setTestMode(false);
                      setTestStats(null);
                      
                      // Clear persisted test data
                      await AsyncStorage.removeItem('testLevel');
                      await AsyncStorage.removeItem('testMode');
                      
                      // Trigger stats recalculation to restore real stats
                      setTimeout(() => {
                        calculateStats();
                        calculatePremiumStats();
                      }, 100);
                    }}
                  >
                    <Text style={[styles.devButtonText, { color: '#FF0000' }]}>
                      Reset Animation
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.devButton,
                      { 
                        backgroundColor: 'rgba(128,0,128,0.15)', 
                        flex: 1,
                        justifyContent: 'center', 
                        alignItems: 'center'
                      }
                    ]}
                    onPress={() => {
                      // Show debug info
                      alert(`Animation Complete: ${stageAnimationComplete}\nIs Staging Up: ${isStagingUp}\nCurrent Stage: ${stats.stage}\nTest Mode: ${testMode}\nStage Title: ${stats.stageTitle}`);
                    }}
                  >
                    <Text style={[styles.devButtonText, { color: '#800080' }]}>
                      Debug Info
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', marginBottom: 16 }}>
                  <TouchableOpacity
                    style={[
                      styles.devButton,
                      { 
                        backgroundColor: 'rgba(255,69,0,0.15)', 
                        flex: 1,
                        justifyContent: 'center', 
                        alignItems: 'center'
                      }
                    ]}
                    onPress={async () => {
                      // Reset user stage back to Stage 1
                      setStageAnimationComplete(true);
                      setIsStagingUp(false);
                      setTestMode(false);
                      setTestStats(null);
                      
                      // Clear persisted test data
                      await AsyncStorage.removeItem('testLevel');
                      await AsyncStorage.removeItem('testMode');
                      
                      // Set stage back to 1 by clearing all fake achievements and resetting stats
                      try {
                        // Remove any test achievements that were added
                        const currentAchievements = await AsyncStorage.getItem('unlockedAchievements');
                        if (currentAchievements) {
                          const parsedAchievements = JSON.parse(currentAchievements);
                          
                          // Remove test achievements
                          const testAchievementIds = [
                            'test-achievement-1',
                            'test-achievement-2', 
                            'test-achievement-3',
                            'test-achievement-4',
                            'test-achievement-5'
                          ];
                          
                          testAchievementIds.forEach(id => {
                            if (parsedAchievements[id]) {
                              delete parsedAchievements[id];
                            }
                          });
                          
                          await AsyncStorage.setItem('unlockedAchievements', JSON.stringify(parsedAchievements));
                        }
                        
                        // Force refresh achievements context
                        if (refreshAchievements) {
                          refreshAchievements();
                        }
                        
                        // Reset to stage 1 stats
                        const resetStats = {
                          totalUnlocked: stats.totalUnlocked || 0,
                          percentComplete: stats.percentComplete || 0,
                          totalPoints: 0,
                          stage: 1,
                          stageTitle: LevelService.getStageTitle(1),
                          currentStageThreshold: 0,
                          nextStageThreshold: 50,
                          scoreForNextStage: 50,
                          progressPercent: 0
                        };
                        
                        setStats(resetStats);
                        setPreviousStage(1);
                        
                        showSuccess('User stage reset to Stage 1');
                      } catch (error) {
                        console.error('Error resetting user stage:', error);
                        showError('Error resetting user stage');
                      }
                    }}
                  >
                    <Text style={[styles.devButtonText, { color: '#FF4500' }]}>
                      Reset User Stage
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Reset Achievements Button */}
              <TouchableOpacity
                style={[
                  styles.devButton,
                  { 
                    backgroundColor: 'rgba(255,0,0,0.15)',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }
                ]}
                onPress={handleResetAchievements}
              >
                <Ionicons name="refresh" size={20} color="#FF3B30" />
                <Text style={styles.devButtonText}>
                  Reset All Achievements (Dev Only)
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    );
  };
  
  // Render the Achievements Tab with the new grid layout
  const renderAchievementsTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {['all', 'unlocked', 'locked'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                { 
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  marginRight: 8,
                },
                activeFilter === filter && [
                  styles.activeTab,
                  { backgroundColor: `${theme.primary}15` }
                ]
              ]}
              onPress={() => handleFilterChange(filter)}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel={`${filter} achievements`}
              accessibilityHint={`Show ${filter} achievements`}
              accessibilityState={{ selected: activeFilter === filter }}
            >
              <Text 
                style={[
                  styles.filterText, 
                  { 
                    color: activeFilter === filter ? theme.primary : theme.textSecondary,
                    fontSize: 14,
                    fontWeight: '600',
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
              
              {activeFilter === filter && (
                <View style={[
                  styles.activeIndicator, 
                  { 
                    backgroundColor: theme.primary,
                    height: 3,
                    width: 20,
                    borderRadius: 1.5,
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    marginLeft: -10,
                  }
                ]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Main Content - Achievement Categories with Grid Layout */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { 
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 20
            }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {CATEGORIES.map((category, index) => {
            const categoryAchievements = Object.values(ACHIEVEMENTS).filter(
              a => a.category === category.id
            );
            
            const filteredAchievements = getFilteredAchievements(categoryAchievements);
            
            // Skip empty categories when filtering
            if (activeFilter !== 'all' && filteredAchievements.length === 0) {
              return null;
            }
            
            // Check if this category should be expanded - explicitly check against true
            const isExpanded = expandedCategories[category.id] === true;
            
            return (
              <GridAchievementCategory
                key={category.id}
                category={category}
                achievements={filteredAchievements}
                theme={theme}
                isAchievementUnlocked={isAchievementUnlocked}
                getAchievementUnlockDate={getAchievementUnlockDate}
                onAchievementPress={handleAchievementPress}
                onAchievementLongPress={__DEV__ ? handleUnlockAchievement : undefined}
                isLastCategory={index === CATEGORIES.length - 1}
                defaultExpanded={expandedCategories[category.id] === true}
                onToggleExpand={() => toggleCategoryExpansion(category.id)}
                userSubscriptionStatus={userSubscriptionStatus}
                highlightAchievement={route?.params?.highlightAchievement}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  };
  
  // Create scenes for TabView
  const renderScene = SceneMap({
    progress: renderProgressTab,
    achievements: renderAchievementsTab,
  });
  
  // Custom TabBar component with header integration
  const renderTabBar = (props) => {
    return (
      <View>
        {/* Animated TabBar at Top */}
        <View style={[
          styles.header,
          {
            paddingHorizontal: 16,
            height: 56,
            justifyContent: 'space-between',
            alignItems: 'center',
          }
        ]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to previous screen"
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={theme.text} 
            />
          </TouchableOpacity>
          
          {/* Centered TabBar */}
          <View style={{ flex: 1, marginHorizontal: 16 }}>
            <TabBar
              {...props}
              style={{
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                elevation: 0,
                shadowOpacity: 0,
                borderRadius: 20,
                height: 40,
                paddingHorizontal: 3,
              }}
              indicatorStyle={{
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.primary + '15',
                height: 34,
                borderRadius: 17,
                marginBottom: 3,
                marginTop: 3,
                marginHorizontal: 0,
                width: '48%',
                left: '1%',
              }}
              activeColor={theme.primary}
              inactiveColor={theme.textSecondary}
              labelStyle={{
                fontSize: 14,
                fontWeight: '600',
                textTransform: 'none',
                margin: 0,
                padding: 0,
              }}
              tabStyle={{
                paddingHorizontal: 0,
                paddingVertical: 0,
              }}
              renderLabel={({ route, focused, color }) => {
                const iconName = route.key === 'progress' ? 'stats-chart' : 'trophy';
                const label = route.key === 'progress' ? 'Progress' : 'Achievements';
                
                return (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 34,
                    width: '100%',
                    marginTop: -4,
                  }}>
                    <Ionicons
                      name={iconName}
                      size={18}
                      color={color}
                      style={{ marginRight: 6 }}
                    />
                    <Text 
                      style={{
                        color,
                        fontSize: 14,
                        fontWeight: '600',
                      }}
                      maxFontSizeMultiplier={1.3}
                    >
                      {label}
                    </Text>
                  </View>
                );
              }}
            />
          </View>
          
          <View style={{ width: 40, height: 40 }} />
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView 
      style={[
        styles.safeArea, 
        { 
          backgroundColor: theme.background,
          // Use safe spacing to handle all device notches, dynamic island, etc.
          paddingTop: insets.top ? 0 : 20,
        }
      ]}
      edges={['left', 'right']} // Let SafeAreaView handle left/right edges, but we'll manually handle top/bottom
    >
      <StatusBar 
        backgroundColor={theme.statusBar || theme.background} 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
      />
      
      {/* TabView with Swipe Gestures */}
      <TabView
        navigationState={navigationState}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={handleIndexChange}
        initialLayout={{ width }}
        swipeEnabled={true}
        lazy={true}
        lazyPreloadDistance={1}
      />
      
      {/* New Achievements Popup */}
      <NewAchievementsPopup
        visible={isNewAchievementsModalVisible}
        newAchievements={newAchievements}
        achievements={ACHIEVEMENTS}
        categories={CATEGORIES}
        theme={theme}
        onClose={handleCloseNewAchievementsModal}
      />
      
      {/* Achievement Details Modal */}
      <AchievementDetailsModal
        visible={isDetailsModalVisible}
        achievement={selectedAchievement}
        isUnlocked={selectedAchievement ? isAchievementUnlocked(selectedAchievement.id) : false}
        unlockDate={selectedAchievement ? getAchievementUnlockDate(selectedAchievement.id) : null}
        theme={theme}
        onClose={() => setIsDetailsModalVisible(false)}
        onUnlock={__DEV__ ? handleUnlockAchievement : null}
        navigation={navigation}
        userSubscriptionStatus={userSubscriptionStatus}
      />
      
      {/* Achievement Toast for real-time notifications */}
      <AchievementToast
        visible={toastVisible}
        achievement={currentToastAchievement}
        onHide={handleHideToast}
        theme={theme}
      />

      {/* Stage Up Celebration */}
      <LevelUpCelebration
        visible={isStagingUp}
        level={stats.stage}
        previousLevel={previousStage}
        onAnimationComplete={handleStageUpAnimationComplete}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  resetButton: {
    padding: 5,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {},
  tabBar: {
    flexDirection: 'row',
    position: 'relative',
  },
  tab: {},
  activeTab: {},
  tabText: {},
  tabIndicator: {},
  tabContent: {
    flex: 1,
  },
  // Progress Tab Styles
  progressTabContent: {
    paddingBottom: 40,
  },
  progressTabContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  progressRingWrapper: {
    position: 'relative',
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  levelTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  scoreDisplay: {
    marginVertical: 16,
  },
  scoreBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // New styles for redesigned progress circle
  progressCircle: {
    position: 'relative',
  },
  stageIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainScoreText: {
    textAlign: 'center',
  },
  scoreLabel: {
    textAlign: 'center',
  },
  progressTextContainer: {
    alignItems: 'center',
  },
  progressText: {},
  stageTitle: {},
  progressRingOverlay: {},
  nextLevelText: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  // Dev Button Styles
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  devButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
  },
  statsCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 16,
  },
  statsCard: {
    width: '31%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statsIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryProgressContainer: {
    width: '100%',
  },
  categoryProgressItem: {
    marginBottom: 16,
  },
  categoryProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontWeight: '600',
  },
  categoryPercent: {
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryProgressText: {
    fontSize: 12,
  },
  premiumBanner: {
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  premiumBannerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    flex: 1,
  },
  premiumBannerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  premiumBannerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  premiumBannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  premiumButtonContainer: {
    marginRight: 16,
  },
  premiumButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Achievements Tab Styles
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {},
  activeTab: {},
  filterText: {},
  activeIndicator: {},
  scrollView: {
    flex: 1,
  },
  scrollContent: {},
  categoryContainer: {},
  categoryHeader: {},
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryTitleContainer: {
    flex: 1,
  },
  categoryTitle: {},
  categoryStats: {},
  achievementsContainer: {},
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIconContainer: {},
  achievementContent: {
    flex: 1,
    marginRight: 8,
  },
  achievementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  achievementTitle: {},
  achievementPointsBadge: {},
  achievementPointsText: {},
  achievementDescription: {},
  unlockDate: {},
  premiumText: {},
  premiumContainer: {
    alignItems: 'center',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default AchievementsScreen;