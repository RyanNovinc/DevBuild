// src/screens/GoalsScreen.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar,
  Easing,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MainGoalCard from '../components/MainGoalCard';
import Confetti from '../components/Confetti';
import { LinearGradient } from 'expo-linear-gradient';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'; // Moved to App.js
// import LifePlanOverviewScreen from './LifePlanOverviewScreen'; // Moved to App.js
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  useScreenDimensions,
  accessibility,
  useSafeSpacing
} from '../utils/responsive';

// Import achievement services for Goal Pioneer achievement tracking
import { checkAchievements } from '../services/AchievementService';
import AchievementTracker from '../services/AchievementTracker';
import FeatureExplorerTracker from '../services/FeatureExplorerTracker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import subscription UI components
import { 
  FeatureLimitBanner, 
  LimitReachedView, 
  ProBadge 
} from '../components/subscription/SubscriptionUI';

// Import subscription constants
import { FREE_PLAN_LIMITS } from '../services/SubscriptionService';

// Local override for goals limit to show 2 instead of 3
const LOCAL_MAX_GOALS = 2;

// Function to determine if a color is dark
const isDarkColor = (hexColor) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return true if color is dark (brightness < 128)
  return brightness < 128;
};

// Get appropriate text color for a background color
const getTextColorForBackground = (bgColor) => {
  return isDarkColor(bgColor) ? '#FFFFFF' : '#000000';
};

const GoalsScreen = ({ navigation, route, tabMode }) => {
  // Get safe area insets and safe spacing
  const insets = useSafeAreaInsets();
  const safeSpacing = useSafeSpacing();
  
  // Get screen dimensions
  const { width, height } = useScreenDimensions();
  
  // Theme context with fallback
  const themeContext = useTheme();
  const theme = themeContext?.theme || {
    text: '#333333',
    textSecondary: '#757575',
    background: '#f5f5f5',
    primary: '#4CAF50',
    border: '#E0E0E0',
    cardElevated: '#f0f0f0'
  };
  
  // Check if using dark mode
  const isDarkMode = theme.background.toLowerCase() === '#000000' || theme.background.toLowerCase() === '#121212';
  
  // Tab navigator creation is now handled in App.js
  // const Tab = createMaterialTopTabNavigator();
  
  // Add processing flag to prevent race conditions
  const isProcessingGoals = useRef(false);
  
  // Add mounted ref to prevent updates after unmount
  const isMountedRef = useRef(true);
  
  // Add a ref to track if we've loaded goals at least once
  const hasLoadedRef = useRef(false);
  
  // Track goal updates to prevent infinite loops
  const lastGoalUpdate = useRef(null);
  
  // Unified state object
  const [screenState, setScreenState] = useState({
    loading: true,
    goals: [],
    filterDomain: null,
    filteredGoals: [],
    activeGoals: [],
    completedGoals: []
  });
  
  // State for subscription limit banner
  const [showLimitBanner, setShowLimitBanner] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const limitBannerAnimation = useRef(new Animated.Value(-100)).current;
  
  // Add state for upgrade modal (similar to IncomeTab)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  
  // State to track current active tab for hiding UI elements
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  
  // State for manual fullscreen toggle on Overview tab
  const [isOverviewFullscreen, setIsOverviewFullscreen] = useState(false);
  
  // Track current tab for UI state only
  // (React Navigation will handle persistence automatically)
  
  // Fireworks state for goal completion
  const [showFireworks, setShowFireworks] = useState(false);
  const [fireworksColors, setFireworksColors] = useState(['#4CAF50', '#8BC34A', '#CDDC39', '#2E7D32', '#1B5E20']);
  
  // Animation values
  const [addButtonScale] = useState(new Animated.Value(1));
  const listFadeIn = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const tabPressAnim = useRef(new Animated.Value(1)).current;
  
  // Get app context with defaults
  const appContext = useAppContext();
  const goals = appContext?.goals || [];
  const projects = appContext?.projects || [];
  const updateGoal = appContext?.updateGoal;
  const createGoal = appContext?.createGoal;
  // Check for Pro status based on subscription status
  const isPro = appContext?.userSubscriptionStatus === 'pro' || appContext?.userSubscriptionStatus === 'unlimited' || false;
  // Check if app context is still loading
  const isContextLoading = appContext?.isLoading === true;
  // Add refreshCounter to detect goal updates
  const refreshCounter = appContext?.refreshCounter || 0;
  
  // Get notification functions safely
  const notificationContext = useNotification ? useNotification() : null;
  const showSuccess = notificationContext?.showSuccess || (msg => console.log('Success:', msg));
  const showError = notificationContext?.showError || (msg => console.error('Error:', msg));
  
  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      isProcessingGoals.current = false;
    };
  }, []);

  // TEMPORARILY DISABLING FULLSCREEN FUNCTIONALITY TO TEST IF IT'S CAUSING NAVIGATION ISSUES
  // Handle fullscreen state changes (manual toggle for Overview, automatic for other tabs)
  // useEffect(() => {
  //   // Only enable fullscreen for Overview tab when manually toggled
  //   const shouldHideTabBar = currentTabIndex === 0 ? isOverviewFullscreen : false;
    
  //   console.log('🔥 FULLSCREEN EFFECT TRIGGERED');
  //   console.log('Setting fullscreen state:', shouldHideTabBar ? 'fullscreen' : 'normal', 'for tab index:', currentTabIndex, 'manual toggle:', isOverviewFullscreen);
  //   console.log('This might be causing tab navigator to re-render and reset to index 0');
    
  //   // Hide/show AI button using the same method as KanbanView
  //   if (typeof window !== 'undefined' && window.setAIButtonVisible) {
  //     window.setAIButtonVisible(!shouldHideTabBar);
  //   }
    
  //   // Set global state to hide bottom tabs - same pattern as KanbanView
  //   if (typeof global !== 'undefined') {
  //     try {
  //       global.kanbanFullScreen = shouldHideTabBar;
  //       console.log('GoalsScreen: Set global.kanbanFullScreen =', shouldHideTabBar);
        
  //       // Also try the document approach for web environments
  //       if (typeof document !== 'undefined') {
  //         const event = new CustomEvent('app-fullscreen-changed', { 
  //           detail: { fullScreen: shouldHideTabBar } 
  //         });
  //         document.dispatchEvent(event);
  //       }
  //     } catch (error) {
  //       console.log('Error dispatching full-screen event:', error);
  //     }
  //   }
    
  //   // Cleanup function to restore normal state when component unmounts or tab changes
  //   return () => {
  //     // Only restore if we were the ones who set fullscreen
  //     if (shouldHideTabBar && typeof global !== 'undefined') {
  //       try {
  //         global.kanbanFullScreen = false;
  //         console.log('GoalsScreen cleanup: Set global.kanbanFullScreen = false');
          
  //         if (typeof document !== 'undefined') {
  //           const event = new CustomEvent('app-fullscreen-changed', { 
  //             detail: { fullScreen: false } 
  //           });
  //           document.dispatchEvent(event);
  //         }
  //       } catch (error) {
  //         console.log('Error in GoalsScreen cleanup:', error);
  //       }
  //     }
      
  //     // Restore AI button
  //     if (typeof window !== 'undefined' && window.setAIButtonVisible) {
  //       window.setAIButtonVisible(true);
  //     }
  //   };
  // }, [currentTabIndex, isOverviewFullscreen, navigation]);

  // Simple focus listener just for fullscreen reset
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Only reset fullscreen state when returning from another screen
      setIsOverviewFullscreen(false);
    });

    return unsubscribe;
  }, [navigation]);
  
  // Initialize state
  useEffect(() => {
    // Set StatusBar to match theme
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    
    // Wait for app context to be ready before processing goals
    if (isContextLoading) {
      console.log('App context is still loading, waiting...');
      return;
    }
    
    // Check if we're already processing goals to prevent race conditions
    if (isProcessingGoals.current) {
      console.log('Already processing goals, skipping...');
      return;
    }
    
    // Set the processing flag
    isProcessingGoals.current = true;
    
    // Set loading state ONLY if we haven't loaded goals before
    if (!hasLoadedRef.current) {
      setScreenState(prevState => ({
        ...prevState,
        loading: true
      }));
    }
    
    // Use a slight timeout to ensure consistent animations
    const timer = setTimeout(() => {
      try {
        if (route?.params?.filterDomain) {
          applyDomainFilter(route.params.filterDomain, goals);
        } else {
          // Process goals without filtering
          processGoals(goals);
        }
        
        // Mark that we've successfully loaded goals at least once
        hasLoadedRef.current = true;
        
        // Animate the list fade-in
        Animated.timing(listFadeIn, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }).start();
      } catch (error) {
        console.error('Error processing goals:', error);
        // Make sure to set loading to false even if there's an error
        if (isMountedRef.current) {
          setScreenState(prevState => ({
            ...prevState,
            loading: false
          }));
        }
        showError('Error loading goals');
      } finally {
        // Clear the processing flag
        isProcessingGoals.current = false;
      }
    }, 500); // Increased timeout to allow more time for context to settle

    return () => {
      clearTimeout(timer);
      isProcessingGoals.current = false;
    };
  }, [isContextLoading, route?.params, refreshCounter]); // Added refreshCounter to dependencies


  // Verify goal progress is accurate
  const verifyGoalProgress = (goalsData, projectsData) => {
    if (!Array.isArray(goalsData) || !Array.isArray(projectsData)) {
      return goalsData;
    }

    const fixedGoals = [...goalsData];
    let fixCount = 0;
    const goalsToUpdate = [];

    for (let i = 0; i < fixedGoals.length; i++) {
      const goal = fixedGoals[i];
      
      // Get projects for this goal
      const goalProjects = projectsData.filter(project => project.goalId === goal.id);
      
      // Calculate expected progress
      let calculatedProgress = 0;
      if (goalProjects.length > 0) {
        const completedProjects = goalProjects.filter(project => 
          project.progress === 100 || project.completed || project.status === 'done'
        ).length;
        calculatedProgress = Math.round((completedProjects / goalProjects.length) * 100);
      }
      
      // If there's a mismatch, fix it (but don't override manually completed goals)
      if (goal.progress !== calculatedProgress && !goal.completed) {
        fixedGoals[i] = {
          ...goal,
          progress: calculatedProgress
        };
        fixCount++;
        
        // Collect goals to update in batch instead of updating individually
        goalsToUpdate.push(fixedGoals[i]);
      }
    }
    
    // Update goals in batch after processing to avoid re-renders
    if (fixCount > 0 && typeof updateGoal === 'function') {
      console.log(`Fixed progress for ${fixCount} goals, updating in batch...`);
      
      // Use a slight delay to avoid interference with current render
      setTimeout(() => {
        // Track this update to prevent infinite loops
        lastGoalUpdate.current = Date.now();
        
        // Update goals one by one with minimal delay
        goalsToUpdate.forEach((goal, index) => {
          setTimeout(() => {
            if (typeof updateGoal === 'function') {
              updateGoal(goal).catch(err => 
                console.error(`Failed to update goal ${goal.id}:`, err)
              );
            }
          }, index * 50); // Stagger updates
        });
      }, 500);
    }
    
    return fixedGoals;
  };

  // Process goals data
  const processGoals = (goalsData) => {
    if (!Array.isArray(goalsData)) {
      console.warn('Goals data is not an array');
      goalsData = [];
    }

    // Verify and fix goal progress
    const fixedGoals = verifyGoalProgress(goalsData, projects);

    // Separate completed from active goals
    const completed = [];
    const active = [];
    
    fixedGoals.forEach(goal => {
      if (goal.completed) {
        completed.push(goal);
      } else {
        active.push(goal);
      }
    });
    
    // Sort active goals by progress (least to most)
    active.sort((a, b) => a.progress - b.progress);
    
    // Sort completed goals by completion date
    completed.sort((a, b) => {
      if (a.completedAt && b.completedAt) {
        return new Date(b.completedAt) - new Date(a.completedAt);
      }
      return 0;
    });
    
    // Check for Goal Pioneer achievement
    if (active.length === 1 && completed.length === 0) {
      // This means they might have just created their first goal
      checkAchievements({
        type: 'goal_created',
        goals: [...active, ...completed],
        firstGoal: true
      }, showSuccess);
    }
    
    // Check for Domain Diversifier achievement (Pro users only)
    const uniqueDomains = new Set();
    [...active, ...completed].forEach(goal => {
      if (goal.domain) uniqueDomains.add(goal.domain);
      else if (goal.domainName) uniqueDomains.add(goal.domainName);
    });
    
    if (uniqueDomains.size >= 3 && isPro) {
      checkAchievements({
        type: 'goal_created',
        goals: [...active, ...completed],
        allGoals: [...active, ...completed],
        firstGoal: false,
        uniqueDomainsCount: uniqueDomains.size
      }, showSuccess);
    }

    // Update state once with all processed data using functional update
    // ONLY IF we're still mounted and processing
    if (isMountedRef.current && isProcessingGoals.current) {
      setScreenState(prevState => ({
        ...prevState,
        loading: false,
        goals: fixedGoals,
        filterDomain: prevState.filterDomain,
        filteredGoals: fixedGoals,
        activeGoals: active,
        completedGoals: completed
      }));
    }
  };

  // Apply domain filter
  const applyDomainFilter = (filterDomain, goalsData) => {
    if (!Array.isArray(goalsData)) {
      console.warn('Goals data is not an array');
      goalsData = [];
    }
    
    // Verify and fix goal progress
    const fixedGoals = verifyGoalProgress(goalsData, projects);
    
    // Filter goals by domain
    const filtered = fixedGoals.filter(goal => {
      // For goals created with the new system, check domain or domainName
      if (goal.domain === filterDomain || goal.domainName === filterDomain) {
        return true;
      }
      
      // For older goals, check if the icon corresponds to the domain
      const iconMap = {
        'star': 'General',
        'business': 'Business',
        'wallet': 'Finance',
        'fitness': 'Health',
        'people': 'Relationships',
        'school': 'Education',
        'book': 'Knowledge',
        'heart': 'Wellbeing',
        'happy': 'Joy',
        'home': 'Home',
        'earth': 'Travel',
        'trophy': 'Achievement'
      };
      
      return iconMap[goal.icon] === filterDomain;
    });
    
    // Separate and sort goals
    const completed = [];
    const active = [];
    
    filtered.forEach(goal => {
      if (goal.completed) {
        completed.push(goal);
      } else {
        active.push(goal);
      }
    });
    
    active.sort((a, b) => a.progress - b.progress);
    
    completed.sort((a, b) => {
      if (a.completedAt && b.completedAt) {
        return new Date(b.completedAt) - new Date(a.completedAt);
      }
      return 0;
    });

    // Update state using functional update, ONLY if still mounted
    if (isMountedRef.current) {
      setScreenState(prevState => ({
        ...prevState,
        loading: false,
        goals: fixedGoals,
        filterDomain: filterDomain,
        filteredGoals: filtered,
        activeGoals: active,
        completedGoals: completed
      }));
    }
  };
  
  // Add button animation with pulse effect
  const animateAddButton = () => {
    Animated.sequence([
      Animated.timing(addButtonScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(addButtonScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };
  
  // Check if user can add more goals based on limits
  const canAddMoreGoals = () => {
    // Pro users have unlimited goals
    if (isPro) return true;
    
    // Free users are limited to LOCAL_MAX_GOALS active goals
    const activeCount = screenState.activeGoals.length;
    
    // Check against limits
    return activeCount < LOCAL_MAX_GOALS;
  };
  
  // Check if user has reached completed goals limit
  const hasReachedCompletedGoalsLimit = () => {
    if (isPro) return false;
    return screenState.completedGoals.length >= LOCAL_MAX_GOALS;
  };
  
  // Show upgrade modal (similar to IncomeTab)
  const showUpgradePrompt = (message) => {
    setUpgradeMessage(message);
    setShowUpgradeModal(true);
  };
  
  // Navigate to pricing screen
  const goToPricingScreen = () => {
    setShowUpgradeModal(false);
    navigation.navigate('PricingScreen');
  };
  
  // Show feature limit banner (original approach - keep as fallback)
  const showFeatureLimitBanner = (message) => {
    setLimitMessage(message);
    setShowLimitBanner(true);
    
    // Animate the banner in
    Animated.timing(limitBannerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease)
    }).start();
    
    // Auto-hide banner after 5 seconds
    setTimeout(() => {
      Animated.timing(limitBannerAnimation, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }).start(() => {
        setShowLimitBanner(false);
      });
    }, 5000);
  };
  
  // Handle selecting a goal
  const handleGoalPress = (goal) => {
    navigation.navigate('GoalDetails', { 
      mode: 'edit', 
      goal: goal 
    });
  };
  
  // Enhanced handleCreateGoal function with Goal Pioneer achievement tracking
  const handleCreateGoal = async (goalData) => {
    try {
      console.log("Creating new goal with achievement tracking...");
      
      // Save the goal using existing logic
      const newGoal = await createGoal(goalData);
      
      // Check if this is the first goal
      let isFirstGoal = false;
      try {
        const storedGoals = await AsyncStorage.getItem('goals');
        if (storedGoals) {
          const goalsData = JSON.parse(storedGoals);
          isFirstGoal = Array.isArray(goalsData) && goalsData.length === 1;
        } else {
          // No goals stored yet, this must be the first
          isFirstGoal = true;
        }
      } catch (err) {
        console.error('Error checking if first goal:', err);
        // Assume it could be first goal if we can't determine
        isFirstGoal = true;
      }
      
      // IMPORTANT: Track the first goal achievement immediately
      // Similar to how the ThemeColorPickerModal tracks theme changes
      if (isFirstGoal) {
        console.log("This appears to be the first goal, tracking for achievement...");
        
        try {
          // APPROACH 1: Use FeatureExplorerTracker
          await FeatureExplorerTracker.trackGoalPioneer(newGoal, showSuccess);
          console.log("Used FeatureExplorerTracker for goal pioneer achievement");
          
          // APPROACH 2: Use AchievementTracker as backup
          await AchievementTracker.trackAction('goal_created', {
            goal: newGoal,
            firstGoal: true
          }, showSuccess);
          console.log("Used AchievementTracker for goal pioneer achievement");
          
          // APPROACH 3: Use direct achievement check
          await checkAchievements({
            type: 'goal_created',
            goals: [newGoal],
            firstGoal: true
          }, showSuccess);
          console.log("Used checkAchievements for goal pioneer achievement");
          
        } catch (trackError) {
          // Log but don't stop execution - achievement errors shouldn't block the UI
          console.error('Error tracking goal pioneer achievement:', trackError);
        }
      }
      
      // After successfully creating the goal, return to GoalsScreen
      navigation.goBack();
      
      // Show success message
      showSuccess('Goal created successfully');
      
      return newGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      showError('Failed to create goal');
      return null;
    }
  };
  
  // Handle creating a new goal
  const handleAddGoal = () => {
    animateAddButton();
    
    // Check if user can add more goals
    if (!canAddMoreGoals()) {
      // Simple message focused on unlimited goals
      showUpgradePrompt(
        `You've reached the limit of ${LOCAL_MAX_GOALS} active goals in the free version. Upgrade to Pro to track unlimited goals.`
      );
      return;
    }
    
    // If user can add more goals, proceed to goal creation screen
    navigation.navigate('GoalDetails', { 
      mode: 'create',
      initialDomain: screenState.filterDomain || undefined,
      // Pass the enhanced goal creation handler
      onCreateGoal: handleCreateGoal
    });
  };
  
  // Navigate to upgrade screen
  const handleUpgradePress = () => {
    navigation.navigate('PricingScreen');
  };
  
  // Clear domain filter
  const clearDomainFilter = () => {
    // Guard against processing again
    if (isProcessingGoals.current) return;
    isProcessingGoals.current = true;
    
    // Animate the list fade out before changing data
    Animated.timing(listFadeIn, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      try {
        processGoals(goals);
        navigation.setParams({ filterDomain: null });
        
        // Animate back in after data change
        Animated.timing(listFadeIn, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();
      } catch (error) {
        console.error('Error clearing domain filter:', error);
        showError('Error clearing filter');
      } finally {
        isProcessingGoals.current = false;
      }
    });
  };
  
  // Generate fireworks colors based on goal color
  const getFireworksColors = (goalColor, themeContext) => {
    // Use the goal's actual color if available, otherwise fall back to theme primary
    const baseColor = goalColor || themeContext?.themeColor || themeContext?.theme?.primary || '#4CAF50';
    
    // Handle black & white theme vs colored theme differently
    const isColoredTheme = themeContext?.isColoredTheme;
    const isDarkMode = themeContext?.theme?.background === '#000000';
    
    if (!isColoredTheme) {
      // For B&W theme, use a classic color palette that works well on both light and dark backgrounds
      if (isDarkMode) {
        // Dark theme: use bright, vibrant colors that pop against black
        return ['#FFD700', '#FF6B6B', '#4ECDC4', '#FF9800', '#9C27B0', '#00BCD4', '#CDDC39', '#FF5722'];
      } else {
        // Light theme: use slightly darker versions for better contrast against white
        return ['#FFC107', '#F44336', '#00ACC1', '#FF7043', '#8E24AA', '#0097A7', '#AFD135', '#E64A19'];
      }
    }
    
    // For colored theme, prioritize the actual goal color
    const color = baseColor;
    
    // Convert hex to RGB for easier manipulation
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Generate lighter variations
    const lighter1 = `#${Math.min(255, r + 40).toString(16).padStart(2, '0')}${Math.min(255, g + 40).toString(16).padStart(2, '0')}${Math.min(255, b + 40).toString(16).padStart(2, '0')}`;
    const lighter2 = `#${Math.min(255, r + 80).toString(16).padStart(2, '0')}${Math.min(255, g + 80).toString(16).padStart(2, '0')}${Math.min(255, b + 80).toString(16).padStart(2, '0')}`;
    
    // Generate darker variations
    const darker1 = `#${Math.max(0, r - 40).toString(16).padStart(2, '0')}${Math.max(0, g - 40).toString(16).padStart(2, '0')}${Math.max(0, b - 40).toString(16).padStart(2, '0')}`;
    const darker2 = `#${Math.max(0, r - 80).toString(16).padStart(2, '0')}${Math.max(0, g - 80).toString(16).padStart(2, '0')}${Math.max(0, b - 80).toString(16).padStart(2, '0')}`;
    
    // Generate complementary color
    const complementary = `#${(255 - r).toString(16).padStart(2, '0')}${(255 - g).toString(16).padStart(2, '0')}${(255 - b).toString(16).padStart(2, '0')}`;
    
    // Add some accent colors
    const goldAccent = '#FFD700';
    const whiteAccent = '#FFFFFF';
    const silverAccent = '#C0C0C0';
    
    return [color, color, color, lighter1, lighter2, darker1, darker2, complementary, goldAccent, whiteAccent, silverAccent];
  };
  
  // Handle goal completion with limits for free users
  const handleGoalComplete = (goalId, setCompleted) => {
    // Find the goal in either active or completed arrays
    let item;
    if (setCompleted) {
      // We're completing a goal, so look in active goals
      item = screenState.activeGoals.find(g => g.id === goalId);
    } else {
      // We're reactivating a goal, so look in completed goals
      item = screenState.completedGoals.find(g => g.id === goalId);
    }
    
    if (!item) return;
    
    // Check free plan limits:
    // 1. When completing a goal: check if we've reached the completed goals limit
    // 2. When reactivating a goal: check if we've reached the active goals limit
    if (!isPro) {
      if (setCompleted && screenState.completedGoals.length >= LOCAL_MAX_GOALS) {
        // Trying to complete a goal but already have max completed goals
        showUpgradePrompt(
          `You've reached ${LOCAL_MAX_GOALS} completed goals. Upgrade to Pro to preserve your achievement history and track unlimited goals.`
        );
        return;
      } else if (!setCompleted && screenState.activeGoals.length >= LOCAL_MAX_GOALS) {
        // Trying to reactivate a goal but already have max active goals
        showUpgradePrompt(
          `You've reached the limit of ${LOCAL_MAX_GOALS} active goals. Upgrade to Pro to track unlimited goals across all life domains.`
        );
        return;
      }
    }
    
    // Proceed with goal completion/reactivation
    if (typeof updateGoal === 'function') {
      const updatedGoal = {
        ...item,
        completed: setCompleted,
        progress: setCompleted ? 100 : item.progress, // Set progress to 100% when completed
        completedAt: setCompleted ? new Date().toISOString() : null
      };
      
      // Show fireworks for completed goals
      if (setCompleted) {
        setFireworksColors(getFireworksColors(item.color, themeContext));
        setShowFireworks(true);
        
        // Check for goal completion achievement
        checkAchievements({
          type: 'goal_completed',
          goalId: goalId,
          isPro: isPro // Pass subscription status for premium achievements
        }, showSuccess);
        
        // Also use FeatureExplorerTracker for more reliable tracking
        FeatureExplorerTracker.trackCompletionChampion(updatedGoal, showSuccess);
      }
      
      // Track this update to prevent infinite loops
      lastGoalUpdate.current = Date.now();
      
      updateGoal(updatedGoal)
        .then(() => {
          // Update local state to move the goal between tabs immediately
          setScreenState(prevState => {
            // Create copies of the arrays to modify
            let newActiveGoals = [...prevState.activeGoals];
            let newCompletedGoals = [...prevState.completedGoals];
            
            if (setCompleted) {
              // Moving from active to completed
              newActiveGoals = newActiveGoals.filter(g => g.id !== item.id);
              
              // For free users, maintain max completed goals limit
              if (!isPro && newCompletedGoals.length >= LOCAL_MAX_GOALS) {
                // Remove oldest completed goal
                newCompletedGoals.sort((a, b) => {
                  if (a.completedAt && b.completedAt) {
                    return new Date(a.completedAt) - new Date(b.completedAt);
                  }
                  return 0;
                });
                newCompletedGoals.shift(); // Remove oldest
              }
              
              // Add to completed goals and sort by completion date
              newCompletedGoals.push(updatedGoal);
              newCompletedGoals.sort((a, b) => {
                if (a.completedAt && b.completedAt) {
                  return new Date(b.completedAt) - new Date(a.completedAt);
                }
                return 0;
              });
            } else {
              // Moving from completed to active
              newCompletedGoals = newCompletedGoals.filter(g => g.id !== item.id);
              
              // Add to active goals and sort by progress
              newActiveGoals.push(updatedGoal);
              newActiveGoals.sort((a, b) => a.progress - b.progress);
            }
            
            return {
              ...prevState,
              activeGoals: newActiveGoals,
              completedGoals: newCompletedGoals
            };
          });
          
          showSuccess(setCompleted ? 'Goal completed! 🎆' : 'Goal reactivated!');
        })
        .catch(err => {
          console.error('Error updating goal completion:', err);
          showError('Failed to update goal');
        });
    }
  };
  
  // Render a goal item
  const renderGoalItem = ({ item, index }) => {
    // Determine appropriate icon color
    const getIconColor = (goalColor) => {
      if (goalColor === '#FFFFFF') {
        return '#000000'; // Use black for white background
      }
      return getTextColorForBackground(goalColor);
    };
    
    // Note: activeTab is not available with React Navigation tabs, but we can determine limit differently
    const isBeyondFreeLimit = !isPro && index >= LOCAL_MAX_GOALS;
    
    return (
      <Animated.View
        style={{
          opacity: listFadeIn,
          transform: [
            { 
              translateY: listFadeIn.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }
          ],
          marginBottom: spacing.s
        }}
      >
        <View style={{ position: 'relative' }}>
          <MainGoalCard 
            goal={item} 
            onPress={() => handleGoalPress(item)}
            onProgressUpdate={null} // Disable progress updates by touching
            onComplete={handleGoalComplete}
            getIconColor={getIconColor}
            // Add style prop for dimmed appearance of beyond-limit items
            style={isBeyondFreeLimit ? { opacity: 0.7 } : null}
          />
          
          {/* Pro badge for goals beyond the free limit */}
          {isBeyondFreeLimit && (
            <View style={styles.proBadgeContainer}>
              <ProBadge theme={theme} />
            </View>
          )}
        </View>
      </Animated.View>
    );
  };
  
  // Loading placeholder
  const renderLoadingPlaceholder = () => {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text 
          style={{
            color: theme.textSecondary, 
            fontSize: fontSizes.m, 
            fontWeight: '500'
          }}
          maxFontSizeMultiplier={1.5}
          accessible={true}
          accessibilityLabel="Loading goals"
          accessibilityRole="text"
        >
          Loading goals...
        </Text>
      </View>
    );
  };
  

  // Tab Badge Component - Optimized for smaller size and better spacing
  const TabBadge = ({ count, maxCount, isPro }) => {
    if (count === 0) return null;
    
    return (
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: scaleWidth(8), // Slightly smaller radius
        paddingHorizontal: scaleWidth(6), // Reduced horizontal padding
        paddingVertical: scaleHeight(2), // Reduced vertical padding
        marginLeft: scaleWidth(6), // Reduced margin from text
        minWidth: scaleWidth(16), // Smaller minimum width
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Text style={{
          color: '#FFFFFF',
          fontSize: scaleFontSize(10), // Smaller font size
          fontWeight: '600', // Slightly lighter weight
          includeFontPadding: false, // Remove extra font padding
          textAlignVertical: 'center'
        }}>
          {isPro ? count : `${count}/${maxCount}`}
        </Text>
      </View>
    );
  };

  // Render active goals content
  const renderActiveGoalsContent = () => {
    if (!Array.isArray(screenState.activeGoals) || screenState.activeGoals.length === 0) {
      return (
        <Animated.View 
          style={[
            styles.emptyContainer,
            {
              opacity: listFadeIn,
              transform: [
                { 
                  translateY: listFadeIn.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }
              ]
            }
          ]}
        >
          <View style={[styles.emptyIconContainer, {
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          }]}>
            <Ionicons 
              name="flag-outline" 
              size={scaleWidth(64)} 
              color={theme.primary} 
              style={styles.emptyIcon}
            />
          </View>
          <Text 
            style={[styles.emptyTitle, { color: theme.text }]}
            maxFontSizeMultiplier={1.8}
            accessibilityRole="header"
          >
            {screenState.filterDomain 
              ? `No ${screenState.filterDomain} Goals` 
              : 'No Active Goals'
            }
          </Text>
          <Text 
            style={[styles.emptyDescription, { color: theme.textSecondary }]}
            maxFontSizeMultiplier={2.0}
          >
            {screenState.filterDomain 
              ? `Add your first goal in the ${screenState.filterDomain} domain` 
              : 'Goals help you track what matters most to you'
            }
          </Text>
          <TouchableOpacity 
            style={[styles.emptyAddButton, { backgroundColor: theme.primary }]} 
            onPress={handleAddGoal}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={screenState.filterDomain 
              ? `Create ${screenState.filterDomain} Goal` 
              : 'Create First Goal'
            }
            accessibilityHint="Opens the goal creation screen"
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
              style={styles.buttonGradient}
            />
            <Ionicons 
              name="add-outline" 
              size={scaleWidth(20)} 
              color={'#FFFFFF'} 
              style={styles.emptyButtonIcon}
            />
            <Text 
              style={[styles.emptyAddButtonText, { fontSize: fontSizes.m }]}
              maxFontSizeMultiplier={1.5}
            >
              {screenState.filterDomain 
                ? `Create ${screenState.filterDomain} Goal` 
                : 'Create First Goal'
              }
            </Text>
          </TouchableOpacity>
        </Animated.View>
      );
    }
    
    // Removed the banner for less intrusiveness
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={screenState.activeGoals}
          renderItem={renderGoalItem}
          keyExtractor={item => `active-${item.id}`}
          contentContainerStyle={styles.goalsList}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
          accessible={true}
          accessibilityLabel="Active goals list"
          accessibilityRole="list"
        />
      </View>
    );
  };
  
  // Render completed goals content
  const renderCompletedGoalsContent = () => {
    if (!Array.isArray(screenState.completedGoals) || screenState.completedGoals.length === 0) {
      return (
        <Animated.View
          style={[
            styles.emptyContainer,
            {
              opacity: listFadeIn,
              transform: [
                { 
                  translateY: listFadeIn.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }
              ]
            }
          ]}
        >
          <View style={[styles.emptyIconContainer, {
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          }]}>
            <Ionicons 
              name="trophy-outline" 
              size={scaleWidth(64)} 
              color={theme.primary} 
              style={styles.emptyIcon}
            />
          </View>
          <Text 
            style={[styles.emptyTitle, { color: theme.text }]}
            maxFontSizeMultiplier={1.8}
            accessibilityRole="header"
          >
            No Completed Goals Yet
          </Text>
          <Text 
            style={[styles.emptyDescription, { color: theme.textSecondary }]}
            maxFontSizeMultiplier={2.0}
          >
            When you complete goals, they will appear here
          </Text>
        </Animated.View>
      );
    }
    
    // Removed the banner for less intrusiveness
    return (
      <View style={{ flex: 1 }}>
        <FlatList
          data={screenState.completedGoals}
          renderItem={renderGoalItem}
          keyExtractor={item => `completed-${item.id}`}
          contentContainerStyle={styles.goalsList}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
          accessible={true}
          accessibilityLabel="Completed goals list"
          accessibilityRole="list"
        />
      </View>
    );
  };

  // Check both loading states before rendering content
  const isLoading = screenState.loading || isContextLoading;
  
  // Calculate button dimensions to ensure minimum touch target size
  const addButtonSize = Math.max(scaleWidth(60), 44); // Consistent with accessibility standards
  
  // Handler for fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsOverviewFullscreen(!isOverviewFullscreen);
  };

  // Determine what content to render based on tabMode
  const renderTabContent = () => {
    if (tabMode === 'active') {
      return renderActiveGoalsContent();
    } else if (tabMode === 'completed') {
      return renderCompletedGoalsContent();
    } else {
      // Default behavior (when used as standalone screen) - render the tab navigator
      return null; // This will be handled below
    }
  };

  // Calculate the tab indicator width based on screen width (now for 3 tabs)
  const tabIndicatorWidth = Math.floor((width - scaleWidth(40)) / 3);

  // If this is being used as a specific tab mode, render just that content
  if (tabMode) {
    return (
      <View style={[
        styles.container, 
        { 
          backgroundColor: theme.background,
          paddingTop: tabMode ? 0 : insets.top, // No padding when in tab mode
        }
      ]}>
        {/* Fireworks component */}
        <Confetti 
          active={showFireworks} 
          colors={fireworksColors} 
          duration={5000}
          type="fireworks"
          onComplete={() => setShowFireworks(false)}
        />
        
        {/* Filter buttons (only shown when domain filter is active) */}
        {screenState.filterDomain && (
          <View style={styles.filterButtonContainer}>
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                { 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  minHeight: accessibility.minTouchTarget,
                  paddingHorizontal: spacing.m,
                  paddingVertical: spacing.xs
                }
              ]} 
              onPress={clearDomainFilter}
              activeOpacity={0.7}
              disabled={isProcessingGoals.current}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Clear filter: ${screenState.filterDomain}`}
              accessibilityHint="Removes the current domain filter"
            >
              <Ionicons name="close-circle" size={scaleWidth(16)} color={theme.textSecondary} />
              <Text 
                style={[
                  styles.filterButtonText, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.s,
                    marginLeft: spacing.xs
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Clear Filter: {screenState.filterDomain}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Tab-specific content */}
        {isLoading ? (
          renderLoadingPlaceholder()
        ) : (
          <Animated.View style={{
            flex: 1,
            opacity: listFadeIn
          }}>
            {renderTabContent()}
          </Animated.View>
        )}

        {/* Floating Add Button - only show for goals tabs */}
        {!isLoading && (tabMode === 'active' || tabMode === 'completed') && (
          <Animated.View 
            style={[
              styles.floatingAddButton,
              { 
                transform: [{ scale: addButtonScale }],
                bottom: scaleHeight(20), // Adjust for tab mode
                left: scaleWidth(20)
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.floatingAddButtonInner,
                { 
                  backgroundColor: theme.primary,
                  width: addButtonSize,
                  height: addButtonSize,
                  borderRadius: addButtonSize / 2
                }
              ]}
              onPress={handleAddGoal}
              activeOpacity={0.8}
              disabled={isProcessingGoals.current}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add new goal"
              accessibilityHint="Opens the goal creation screen"
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
                style={styles.buttonGradient}
              />
              <Ionicons name="add" size={scaleWidth(28)} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Feature Limit Banner */}
        {showLimitBanner && (
          <Animated.View 
            style={[
              styles.limitBannerContainer,
              {
                transform: [{ translateY: limitBannerAnimation }],
                bottom: spacing.m
              }
            ]}
          >
            <FeatureLimitBanner
              theme={theme}
              message={limitMessage}
              onUpgrade={handleUpgradePress}
            />
          </Animated.View>
        )}

        {/* Upgrade Modal */}
        <Modal
          visible={showUpgradeModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowUpgradeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.upgradeModal, 
              { 
                backgroundColor: theme.card || theme.background,
                marginTop: insets.top,
                marginBottom: insets.bottom,
                marginLeft: spacing.m,
                marginRight: spacing.m
              }
            ]}>
              <View style={styles.upgradeModalHeader}>
                <Ionicons name="lock-closed" size={scaleWidth(40)} color="#3F51B5" />
                <Text 
                  style={[styles.upgradeModalTitle, { color: theme.text }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Premium Feature
                </Text>
              </View>
              
              <Text 
                style={[styles.upgradeModalMessage, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                {upgradeMessage || "Upgrade to Pro to track unlimited goals."}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.upgradeButton, 
                  { backgroundColor: '#3F51B5' },
                  { minHeight: accessibility.minTouchTarget }
                ]}
                onPress={goToPricingScreen}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Upgrade to Pro"
                accessibilityHint="Opens the pricing screen to upgrade your subscription"
              >
                <Ionicons name="rocket" size={scaleWidth(20)} color="#FFFFFF" style={{marginRight: spacing.xs}} />
                <Text 
                  style={styles.upgradeButtonText}
                  maxFontSizeMultiplier={1.3}
                >
                  Upgrade to Pro
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.laterButton,
                  { minHeight: accessibility.minTouchTarget }
                ]}
                onPress={() => setShowUpgradeModal(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Maybe Later"
                accessibilityHint="Closes the upgrade prompt"
              >
                <Text 
                  style={[styles.laterButtonText, { color: theme.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Maybe Later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Legacy behavior - this should not be used anymore but keeping for safety
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.background,
        paddingTop: insets.top,
      }
    ]}>
      <Text style={{ color: theme.text, padding: 20 }}>
        GoalsScreen should now be used with tabMode prop
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    zIndex: 2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: scaleWidth(20),
  },
  filterButtonText: {
    fontWeight: '500',
  },
  
  
  // Tab Content
  tabContent: {
    flex: 1,
  },
  
  // List styles
  goalsList: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.s,
  },
  
  // Empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: scaleHeight(-40),
  },
  emptyIconContainer: {
    width: scaleWidth(110),
    height: scaleWidth(110),
    borderRadius: scaleWidth(55),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: fontSizes.m,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: scaleHeight(24),
    opacity: 0.8,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    minHeight: accessibility.minTouchTarget,
    overflow: 'hidden',
  },
  emptyButtonIcon: {
    marginRight: spacing.s,
  },
  emptyAddButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Floating Add Button - positioned on the left as in original
  floatingAddButton: {
    position: 'absolute',
    zIndex: 100,
  },
  floatingAddButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  buttonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: scaleWidth(30),
  },
  
  // Pro badge container style
  proBadgeContainer: {
    position: 'absolute',
    top: scaleHeight(10),
    right: scaleWidth(10),
    zIndex: 10,
  },
  
  // Limit banner container
  limitBannerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.m,
    zIndex: 1000,
  },

  // New Modal Styles (copied from IncomeTab)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeModal: {
    width: '90%',
    maxWidth: 500,
    borderRadius: scaleWidth(20),
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  upgradeModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  upgradeModalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginTop: spacing.m,
    textAlign: 'center',
  },
  upgradeModalMessage: {
    fontSize: fontSizes.m,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: scaleHeight(24),
    paddingHorizontal: spacing.m,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(16),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: 'bold',
  },
  laterButton: {
    marginTop: spacing.l,
    padding: spacing.m,
  },
  laterButtonText: {
    fontSize: fontSizes.s,
  }
});

export default GoalsScreen;