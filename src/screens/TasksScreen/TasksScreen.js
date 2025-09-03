// src/screens/TasksScreen/TasksScreen.js
// Kanban-focused task management screen
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  StatusBar, 
  Easing, 
  Dimensions,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// Removed unused imports for tabs and pager view
import GoalFilters from './components/GoalFilters';
import KanbanView from './components/KanbanView';
import Confetti from '../../components/Confetti';
import * as FeatureExplorerTracker from '../../services/FeatureExplorerTracker';
import { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize,
  isSmallDevice, 
  isTablet, 
  fontSizes, 
  spacing,
  useSafeSpacing
} from '../../utils/responsive';
import { styles } from './styles';
import AppTourOverlay from '../../components/AppTourOverlay';
import useAppTour from '../../hooks/useAppTour';
import { useFocusEffect } from '@react-navigation/native';

// Removed TaskViewModeToggle import as it's no longer needed

// Import subscription UI components
import { 
  FeatureLimitBanner, 
  LimitReachedView, 
  ProBadge,
  AILimitReachedModal
} from '../../components/subscription/SubscriptionUI';

// Import subscription service constants
import { FREE_PLAN_LIMITS, checkMilestonesPerGoalLimit } from '../../services/SubscriptionService';

// Removed width/height as they were only used for tabs

const TasksScreen = ({ route, navigation }) => {
  // Get safe area insets and safe spacing to prevent the UI from being cut off
  const insets = useSafeAreaInsets();
  const safeSpacing = useSafeSpacing();
  
  const { theme } = useTheme();
  
  // App Tour Hook
  const { 
    isTourActive,
    currentStep,
    spotlightTarget,
    nextStep,
    skipTour
  } = useAppTour(navigation);
  
  // Tour animation ref for kanban lighting effect
  const tourKanbanOpacity = useRef(new Animated.Value(0)).current;
  
  // Debug logging for tour state
  if (__DEV__) {
    console.log('🎯 TasksScreen Tour State:', { 
      isTourActive, 
      currentStep, 
      shouldShowOverlay: isTourActive && currentStep === 'KANBAN_INTRO'
    });
  }
  
  // Handle screen focus for tour overlay timing and data preparation
  useFocusEffect(
    React.useCallback(() => {
      if (isTourActive && currentStep === 'KANBAN_INTRO') {
        console.log('🎯 TasksScreen: Screen focused during tour, step =', currentStep);
        // Screen is now focused and ready for tour overlay
      }
      
      // Check if we're in the SCHEDULE_DEDICATED_TIME step and need to prepare tour data
      if (isTourActive && currentStep === 'SCHEDULE_DEDICATED_TIME') {
        console.log('🎯 TasksScreen: In SCHEDULE_DEDICATED_TIME step, checking for in-progress task');
        
        // Look for the in-progress task to store globally for timeblock creation
        const inProgressTask = tasks?.find(task => task.status === 'in-progress');
        
        if (inProgressTask && !global.tourSelectedTask) {
          console.log('🎯 TasksScreen: Found in-progress task, storing globally:', inProgressTask.title);
          
          const milestone = milestones?.find(m => m.id === inProgressTask.milestoneId);
          const goal = milestone ? mainGoals?.find(g => g.id === milestone.goalId) : null;
          
          if (milestone && goal) {
            console.log('🎯 TasksScreen: Storing task data globally for timeblock creation:', {
              task: inProgressTask.title,
              milestone: milestone.title,
              goal: goal.title
            });
            
            global.tourSelectedTask = inProgressTask;
            global.tourSelectedMilestone = milestone;
            global.tourSelectedGoal = goal;
          } else {
            console.error('🎯 TasksScreen: Could not find milestone or goal for in-progress task');
          }
        } else if (inProgressTask && global.tourSelectedTask) {
          console.log('🎯 TasksScreen: In-progress task found and global data already exists');
        } else {
          console.log('🎯 TasksScreen: No in-progress task found in SCHEDULE_DEDICATED_TIME step');
        }
      }
    }, [isTourActive, currentStep, tasks, milestones, mainGoals])
  );
  
  // Tour scroll position for kanban demonstration - always start at todo (position 0)
  const [tourKanbanScrollPosition, setTourKanbanScrollPosition] = useState(0); // 0 = left (todo), 1 = center (in-progress), 2 = right (done)
  
  // Reset tour scroll position when tour starts
  React.useEffect(() => {
    if (isTourActive && currentStep === 'KANBAN_INTRO') {
      console.log('🎯 Tour: Resetting kanban scroll position to 0 (Todo section)');
      setTourKanbanScrollPosition(0);
    }
  }, [isTourActive, currentStep]);
  
  // Handle tour kanban lighting animation - start dark then light up
  useEffect(() => {
    if (isTourActive && currentStep === 'KANBAN_INTRO') {
      console.log('🎯 Tour: Starting kanban lighting animation');
      
      // Start with kanban dark (opacity 0)
      tourKanbanOpacity.setValue(0);
      
      // Light up the kanban as the AI message appears (coordinate with overlay timing)
      // AppTourOverlay timing: 100ms overlay + 300ms delay + 300ms step delay + 400ms AI animation = 1100ms
      const lightUpDelay = 1300; // Start lighting slightly after AI message begins appearing
      
      setTimeout(() => {
        if (isTourActive && (currentStep === 'KANBAN_SYSTEM_INTRO' || currentStep === 'PICK_CURRENT_FOCUS' || currentStep === 'TASK_MOVED_CELEBRATION')) {
          console.log('🎯 Tour: Now lighting up the kanban');
          Animated.timing(tourKanbanOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          }).start(() => {
            console.log('🎯 Tour: Kanban lighting animation complete');
          });
        }
      }, lightUpDelay);
    } else {
      // Always start dark when not in tour or different step
      tourKanbanOpacity.setValue(0);
    }
  }, [isTourActive, currentStep]);
  const [tourTaskToMove, setTourTaskToMove] = useState(null); // Track which task to move during tour
  
  // Handle tour special actions for kanban demonstration
  const handleTourSpecialAction = async (action) => {
    if (action === 'moveTaskToProgress') {
      console.log('🎯 Tour: Moving first todo task to in-progress and scrolling');
      
      // Find first task with 'todo' status to move
      const todoTask = tasks.find(task => task.status === 'todo');
      console.log('🎯 Tour Debug: Found todo task:', todoTask ? todoTask.title : 'none');
      console.log('🎯 Tour Debug: updateTask function available:', typeof updateTask);
      
      if (todoTask && updateTask) {
        console.log('🎯 Tour: Moving task', todoTask.title, 'from todo to in-progress');
        console.log('🎯 Tour: Task details:', { id: todoTask.id, milestoneId: todoTask.milestoneId, currentStatus: todoTask.status });
        setTourTaskToMove(todoTask.id);
        
        const updatedTask = { 
          ...todoTask, 
          status: 'in_progress',  // Use underscore, not hyphen
          updatedAt: new Date().toISOString()
        };
        
        try {
          // Use the correct updateTask signature: updateTask(milestoneId, taskId, updatedTask)
          await updateTask(todoTask.milestoneId, todoTask.id, updatedTask);
          console.log('🎯 Tour: Successfully moved task to in-progress');
        } catch (error) {
          console.error('🎯 Tour: Error moving task:', error);
        }
      } else {
        console.log('🎯 Tour: Cannot move task - todoTask:', !!todoTask, 'updateTask:', !!updateTask);
      }
      
      // Scroll to center the in-progress section simultaneously with task movement
      setTourKanbanScrollPosition(1);
    }
    
    if (action === 'completeTask') {
      console.log('🎯 Tour: Completing task and scrolling to done section');
      
      // Move the previously moved task to done, or find first in-progress task
      console.log('🎯 Tour Debug: tourTaskToMove:', tourTaskToMove);
      console.log('🎯 Tour Debug: Available in-progress tasks:', tasks.filter(task => task.status === 'in_progress').map(t => t.title));
      
      if (tourTaskToMove && updateTask) {
        const taskToComplete = tasks.find(task => task.id === tourTaskToMove);
        if (taskToComplete) {
          console.log('🎯 Tour: Completing previously moved task', taskToComplete.title);
          
          const updatedTask = { 
            ...taskToComplete, 
            status: 'done',
            completed: true,
            updatedAt: new Date().toISOString()
          };
          
          try {
            // Use the correct updateTask signature: updateTask(milestoneId, taskId, updatedTask)
            await updateTask(taskToComplete.milestoneId, taskToComplete.id, updatedTask);
            console.log('🎯 Tour: Successfully completed task');
          } catch (error) {
            console.error('🎯 Tour: Error completing task:', error);
          }
        }
      } else {
        // Fallback: find first in-progress task
        const inProgressTask = tasks.find(task => task.status === 'in_progress');
        if (inProgressTask && updateTask) {
          console.log('🎯 Tour: Completing in-progress task', inProgressTask.title);
          setTourTaskToMove(inProgressTask.id);
          
          const updatedTask = { 
            ...inProgressTask, 
            status: 'done',
            completed: true,
            updatedAt: new Date().toISOString()
          };
          
          try {
            // Use the correct updateTask signature: updateTask(milestoneId, taskId, updatedTask)
            await updateTask(inProgressTask.milestoneId, inProgressTask.id, updatedTask);
            console.log('🎯 Tour: Successfully completed fallback task');
          } catch (error) {
            console.error('🎯 Tour: Error completing fallback task:', error);
          }
        } else {
          console.log('🎯 Tour: No in-progress task found to complete');
        }
      }
      
      // Scroll to show the done section simultaneously with task completion
      setTourKanbanScrollPosition(2);
    }
  };
  
  const { 
    milestones, 
    tasks, 
    mainGoals, 
    goals, 
    updateMilestone,
    updateMilestoneProgress,
    updateGoal,
    updateTask,
    cleanupOrphanedMilestones,
    forceDataReset,
    refreshData,
    canAddMoreMilestonesToGoal,
    userSubscriptionStatus,
    settings,
    updateAppSetting
  } = useAppContext();
  
  // Check if user is Pro
  const isPro = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
  
  // Use notification context if available
  const notification = useNotification ? useNotification() : { 
    showSuccess: (msg) => console.log(msg),
    showError: (msg) => console.log(msg)
  };
  
  // Extract filter goal ID if passed from another screen
  const { filterGoalId, viewMode: routeViewMode } = route.params || {};
  
  // States
  const [selectedGoalId, setSelectedGoalId] = useState(filterGoalId || 'all');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null); // New milestone filter state
  // Removed tab-related state since we're Kanban-only now
  
  // New state for task/milestone view mode toggle
  const [viewMode, setViewMode] = useState('tasks'); // 'milestones' or 'tasks' - Default to tasks for Kanban filtering
  
  // State for subscription limit banner
  const [showLimitBanner, setShowLimitBanner] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const limitBannerAnimation = useRef(new Animated.Value(-100)).current;
  
  // State for milestone limit modal
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [milestoneLimitData, setMilestoneLimitData] = useState({
    milestoneCount: 0,
    maxAllowed: FREE_PLAN_LIMITS?.MAX_MILESTONES_PER_GOAL || 2
  });
  
  // State for upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  
  // Note: Removed PagerView refs since we're now using React Navigation
  
  // State for kanban full-screen mode (simplified)
  const [kanbanFullScreen, setKanbanFullScreen] = useState(false);
  
  // Simplified full-screen handler
  const handleKanbanFullScreenChange = (isFullScreen) => {
    setKanbanFullScreen(isFullScreen);
  };
  
  // Separate collapsed states for "all" view and specific goal views
  const [allViewCollapsedSections, setAllViewCollapsedSections] = useState({});
  const [specificGoalCollapsedSections, setSpecificGoalCollapsedSections] = useState({});
  const sectionsInitialized = useRef(false);
  
  // Confetti state for milestone completion
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiColors, setConfettiColors] = useState(['#4CAF50', '#8BC34A', '#CDDC39', '#2E7D32', '#1B5E20']);
  
  // Animation values for view transitions
  // Removed addButtonScale as we no longer have the floating button
  const contentFadeOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  
  // Animation value for goal switching - uses 0-3 range for better control
  const goalSwitchAnim = useRef(new Animated.Value(3)).current;
  
  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [draggingMilestone, setDraggingMilestone] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [milestoneLayout, setMilestoneLayout] = useState({});
  const [dropZoneY, setDropZoneY] = useState(null);
  const [activeMilestoneSection, setActiveMilestoneSection] = useState(null);
  
  // Loading state for data verification
  const [isVerifying, setIsVerifying] = useState(false);

  // NEW: Effect to check for preferred view mode in AsyncStorage
  useEffect(() => {
    // Check for preferred view mode in AsyncStorage
    const checkPreferredViewMode = async () => {
      try {
        const preferredViewMode = await AsyncStorage.getItem('preferred_view_mode');
        
        if (preferredViewMode) {
          // Set the view mode if found
          console.log('Setting view mode from AsyncStorage:', preferredViewMode);
          setViewMode(preferredViewMode);
          
          // Clear the preference after applying it
          await AsyncStorage.removeItem('preferred_view_mode');
        }
      } catch (error) {
        console.error('Error reading preferred view mode:', error);
      }
    };
    
    // Check for viewMode passed via route params
    if (routeViewMode) {
      console.log('Setting view mode from route params:', routeViewMode);
      setViewMode(routeViewMode);
    } else {
      // If no route params, check AsyncStorage
      checkPreferredViewMode();
    }
  }, [routeViewMode]);
  
  // Function to verify milestone data consistency
  const verifyMilestoneDataConsistency = async () => {
    setIsVerifying(true);
    try {
      // Get data directly from storage
      const milestonesJson = await AsyncStorage.getItem('milestones');
      const goalsJson = await AsyncStorage.getItem('goals');
      
      if (!milestonesJson || !goalsJson) {
        console.warn('Cannot verify: milestones or goals not found in storage');
        return;
      }
      
      // Parse the data
      const storedMilestones = JSON.parse(milestonesJson);
      const storedGoals = JSON.parse(goalsJson);
      
      if (!Array.isArray(storedMilestones) || !Array.isArray(storedGoals)) {
        console.warn('Invalid data format in storage');
        return;
      }
      
      // Get valid goal IDs
      const validGoalIds = storedGoals.map(goal => goal.id);
      
      // Only count milestones with valid goal IDs - NO INDEPENDENT MILESTONES!
      const validMilestones = storedMilestones.filter(milestone => 
        milestone.goalId && validGoalIds.includes(milestone.goalId)
      );
      
      // Log verification results
      console.log('Milestone verification results:');
      console.log(`- Storage contains ${storedMilestones.length} total milestones`);
      console.log(`- ${validMilestones.length} milestones have valid goal IDs`);
      console.log(`- ${storedMilestones.length - validMilestones.length} independent or orphaned milestones detected`);
      console.log(`- Memory contains ${Array.isArray(milestones) ? milestones.length : 0} milestones`);
      
      // DISABLED AUTO-REPAIR: This was interfering with clean deletion process
      // Log what we found but don't automatically "fix" it
      if (storedMilestones.length !== validMilestones.length ||
          (Array.isArray(milestones) && milestones.length !== validMilestones.length)) {
        
        console.log('DETECTED DATA DISCREPANCY (not auto-fixing):');
        console.log(`- Storage milestones: ${storedMilestones.length}`);
        console.log(`- Valid milestones: ${validMilestones.length}`);
        console.log(`- Memory milestones: ${Array.isArray(milestones) ? milestones.length : 0}`);
        console.log('Auto-repair disabled to prevent interference with deletion process');
        
        // Only show alert if discrepancy is large (more than normal deletion variance)
        const discrepancy = Math.abs(storedMilestones.length - validMilestones.length);
        if (discrepancy > 2) {
          Alert.alert(
            'Data Discrepancy Detected',
            `Found ${discrepancy} orphaned milestones. Use Profile > Debug Storage to clean up if needed.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        console.log('No milestone data inconsistencies detected');
      }
    } catch (error) {
      console.error('Error verifying milestone data:', error);
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Set StatusBar based on theme when component mounts
  useEffect(() => {
    // Don't change status bar in full screen kanban mode
    if (kanbanFullScreen) return;
    
    const isDarkMode = theme.background === '#000000';
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
  }, [theme, kanbanFullScreen]);
  
  // Run verification on initial load (cleanup disabled to prevent interference)
  useEffect(() => {
    const initialSetup = async () => {
      // DISABLED: Auto-cleanup was interfering with clean deletion process
      // if (typeof cleanupOrphanedMilestones === 'function') {
      //   await cleanupOrphanedMilestones();
      // }
      
      // Only verify data consistency (no auto-repair)
      await verifyMilestoneDataConsistency();
    };
    
    initialSetup();
  }, []);
  
  // Check for System Builder achievement when milestones or goals change
  useEffect(() => {
    // Make sure we have valid data first
    if (Array.isArray(milestones) && milestones.length > 0 && 
        Array.isArray(goals) && goals.length > 0) {
      try {
        // Track system builder achievement
        FeatureExplorerTracker.trackSystemBuilder(goals, milestones, notification?.showSuccess);
      } catch (error) {
        console.error('Error tracking system builder achievement:', error);
      }
    }
  }, [milestones, goals, notification]);

  // Initialize collapsed sections when goals data is available
  useEffect(() => {
    // Ensure we have goals data and only initialize once
    if (!sectionsInitialized.current && Array.isArray(mainGoals) && mainGoals.length > 0) {
      console.log("Initializing section collapse state with all sections COLLAPSED");
      
      const initialAllViewState = {};
      const initialSpecificGoalState = {};
      
      // Set ALL sections to collapsed by default (true = collapsed)
      mainGoals.forEach(goal => {
        initialAllViewState[goal.id] = true;
        initialSpecificGoalState[goal.id] = true;
      });
      
      // If a specific goal is selected on initial load, expand only that one in specific view
      if (filterGoalId && filterGoalId !== 'all') {
        initialSpecificGoalState[filterGoalId] = false; // false = expanded
      }
      
      // Update state
      setAllViewCollapsedSections(initialAllViewState);
      setSpecificGoalCollapsedSections(initialSpecificGoalState);
      
      // Mark as initialized
      sectionsInitialized.current = true;
      
      console.log("Section states initialized:", { 
        all: initialAllViewState, 
        specific: initialSpecificGoalState 
      });

      // Animate the content in on initial load
      Animated.timing(contentFadeOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [mainGoals, filterGoalId]);
  
  // When selectedGoalId changes, update the specific goal view
  useEffect(() => {
    if (sectionsInitialized.current && selectedGoalId !== 'all') {
      console.log(`Selecting specific goal: ${selectedGoalId}`);
      
      // When selecting a specific goal, expand only that goal
      setSpecificGoalCollapsedSections(prev => {
        const newState = { ...prev };
        
        // Collapse all sections
        Object.keys(newState).forEach(key => {
          newState[key] = true;
        });
        
        // Expand only the selected goal
        newState[selectedGoalId] = false;
        
        return newState;
      });
    }
  }, [selectedGoalId]);
  
  // Simplified for Kanban-only view
  
  // Show feature limit banner - MODIFIED to use modal instead
  const showFeatureLimitBanner = (message) => {
    console.log("Showing upgrade prompt with message:", message);
    
    // Instead of showing the banner, show the modal
    showUpgradePrompt(message);
  };
  
  // Show upgrade modal (similar to IncomeTab and GoalsScreen)
  const showUpgradePrompt = (message) => {
    setUpgradeMessage(message);
    setShowUpgradeModal(true);
  };
  
  // Navigate to upgrade screen
  const goToPricingScreen = () => {
    setShowUpgradeModal(false);
    navigation.navigate('PricingScreen');
  };
  
  // Navigate to upgrade screen
  const handleUpgradePress = () => {
    setShowLimitModal(false);
    setShowUpgradeModal(false);
    navigation.navigate('PricingScreen');
  };
  
  // Get the current collapsed sections based on selected view
  const getCurrentCollapsedSections = () => {
    return selectedGoalId === 'all' ? allViewCollapsedSections : specificGoalCollapsedSections;
  };
  
  // Generate confetti colors based on milestone color
  const getConfettiColors = (baseColor) => {
    // Default color if none provided
    const color = baseColor || '#4CAF50';
    
    // Generate lighter and darker variations of the base color
    // Convert hex to RGB for easier manipulation
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Generate lighter variations (add white)
    const lighter1 = `#${Math.min(255, r + 40).toString(16).padStart(2, '0')}${Math.min(255, g + 40).toString(16).padStart(2, '0')}${Math.min(255, b + 40).toString(16).padStart(2, '0')}`;
    const lighter2 = `#${Math.min(255, r + 80).toString(16).padStart(2, '0')}${Math.min(255, g + 80).toString(16).padStart(2, '0')}${Math.min(255, b + 80).toString(16).padStart(2, '0')}`;
    
    // Generate darker variations (add black)
    const darker1 = `#${Math.max(0, r - 40).toString(16).padStart(2, '0')}${Math.max(0, g - 40).toString(16).padStart(2, '0')}${Math.max(0, b - 40).toString(16).padStart(2, '0')}`;
    const darker2 = `#${Math.max(0, r - 80).toString(16).padStart(2, '0')}${Math.max(0, g - 80).toString(16).padStart(2, '0')}${Math.max(0, b - 80).toString(16).padStart(2, '0')}`;
    
    // Return all colors including base
    return [color, lighter1, lighter2, darker1, darker2];
  };
  
  // Toggle section collapse based on current view
  const toggleSection = (sectionId) => {
    if (selectedGoalId === 'all') {
      // Toggle in the "all" view
      setAllViewCollapsedSections(prev => {
        const newState = { ...prev };
        newState[sectionId] = !newState[sectionId];
        console.log(`Toggling section ${sectionId} in ALL view to ${!newState[sectionId] ? 'EXPANDED' : 'COLLAPSED'}`);
        return newState;
      });
    } else {
      // Toggle in the specific goal view
      setSpecificGoalCollapsedSections(prev => {
        const newState = { ...prev };
        newState[sectionId] = !newState[sectionId];
        console.log(`Toggling section ${sectionId} in SPECIFIC view to ${!newState[sectionId] ? 'EXPANDED' : 'COLLAPSED'}`);
        return newState;
      });
    }
  };
  
  // Handle goal filter change with animation
  const handleGoalSelect = (goalId) => {
    // Don't do anything if it's the same goal
    if (goalId === selectedGoalId) return;
    
    // Clear milestone selection when changing goals
    setSelectedMilestoneId(null);
    
    // Set animation value to start position (slide up and fade out)
    goalSwitchAnim.setValue(0);
    
    // Animate out the current content
    Animated.timing(goalSwitchAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease)
    }).start(() => {
      // After animation completes, update the goal ID
      setSelectedGoalId(goalId);
      
      // Reset animation value for the incoming animation
      goalSwitchAnim.setValue(2);
      
      // Animate in the new content
      Animated.timing(goalSwitchAnim, {
        toValue: 3,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }).start();
    });
  };
  
  // Handle milestone filter change
  const handleMilestoneSelect = (milestoneId) => {
    setSelectedMilestoneId(milestoneId);
  };

  // NEW FUNCTION: Get tasks filtered by goal and milestone
  const getFilteredTasks = () => {
    // Ensure tasks is an array before filtering
    if (!Array.isArray(tasks)) {
      console.warn('Tasks is not an array:', tasks);
      return [];
    }

    console.log('- Total tasks:', tasks.length);
    console.log('- Selected Goal ID:', selectedGoalId);
    console.log('- Selected Milestone ID:', selectedMilestoneId);
    console.log('- Current viewMode:', viewMode);
    
    
    // First filter out orphaned tasks (tasks with goal IDs that don't exist)
    const goalsToUse = Array.isArray(mainGoals) && mainGoals.length > 0 ? mainGoals : goals;
    const validGoalIds = Array.isArray(goalsToUse) ? goalsToUse.map(goal => goal.id) : [];
    
    // Filter out tasks with completed goals
    const completedGoalIds = Array.isArray(goalsToUse) 
      ? goalsToUse.filter(goal => goal.completed).map(goal => goal.id)
      : [];
    
    // Get all milestones (including standalone ones)
    const allMilestones = Array.isArray(milestones) ? milestones : [];
    
    // Create a map of milestoneId -> goalId for quick lookups (includes standalone milestones)
    const milestoneGoalMap = {};
    allMilestones.forEach(milestone => {
      milestoneGoalMap[milestone.id] = milestone.goalId || null; // null for standalone milestones
    });
    
    // Filter tasks for flexible hierarchy
    let filtered = tasks.filter(task => {
      // CASE 1: Standalone tasks (no goalId, no milestoneId)
      if (!task.goalId && !task.milestoneId) {
        if (selectedGoalId === 'all') return true;
        return selectedGoalId === 'standalone'; // Show only when standalone filter selected
      }
      
      // CASE 2: Direct goal tasks (goalId but no milestoneId)
      if (task.goalId && !task.milestoneId) {
        const goalExists = validGoalIds.includes(task.goalId);
        const goalNotCompleted = !completedGoalIds.includes(task.goalId);
        const goalMatches = selectedGoalId === 'all' || selectedGoalId === task.goalId;
        return goalExists && goalNotCompleted && goalMatches;
      }
      
      // CASE 3: Milestone tasks (milestoneId with or without goalId)
      if (task.milestoneId) {
        const milestone = allMilestones.find(p => p.id === task.milestoneId);
        if (!milestone) return false; // Milestone doesn't exist
        
        // Apply milestone filter if selected
        if (selectedMilestoneId && task.milestoneId !== selectedMilestoneId) return false;
        
        // If milestone has a goal, check goal validity and filter
        if (milestone.goalId) {
          const goalExists = validGoalIds.includes(milestone.goalId);
          const goalNotCompleted = !completedGoalIds.includes(milestone.goalId);
          const goalMatches = selectedGoalId === 'all' || selectedGoalId === milestone.goalId;
          return goalExists && goalNotCompleted && goalMatches;
        } else {
          // Standalone milestone task
          if (selectedGoalId === 'all') return true;
          return selectedGoalId === 'standalone'; // Show only when standalone filter selected
        }
      }
      
      return false;
    });
    
    // Sort tasks by order property (matching LifePlanOverviewScreen logic)
    const sortedFiltered = filtered.sort((a, b) => {
      // Sort by order property if both tasks have it, otherwise maintain original position
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      } else if (a.order !== undefined) {
        return -1; // a comes first
      } else if (b.order !== undefined) {
        return 1; // b comes first
      }
      return 0; // maintain original order
    });
    
    
    return sortedFiltered;
  };
  
  // Filter milestones based on selected goal and milestone
  const getFilteredMilestones = () => {
    // Ensure milestones is an array before filtering
    if (!Array.isArray(milestones)) {
      console.warn('Milestones is not an array:', milestones);
      return [];
    }

    console.log('- Total milestones:', milestones.length);
    console.log('- Selected Goal ID:', selectedGoalId);
    console.log('- Selected Milestone ID:', selectedMilestoneId);
    
    // First filter out orphaned milestones (milestones with goal IDs that don't exist)
    const goalsToUse = Array.isArray(mainGoals) && mainGoals.length > 0 ? mainGoals : goals;
    const validGoalIds = Array.isArray(goalsToUse) ? goalsToUse.map(goal => goal.id) : [];
    
    // Filter out milestones with completed goals
    const completedGoalIds = Array.isArray(goalsToUse) 
      ? goalsToUse.filter(goal => goal.completed).map(goal => goal.id)
      : [];
    
    // Filter milestones for flexible hierarchy (include standalone milestones)
    let filtered = [...milestones].filter(milestone => {
      // Standalone milestones (no goalId)
      if (!milestone.goalId) {
        if (selectedGoalId === 'all') return true;
        return selectedGoalId === 'standalone';
      }
      
      // Goal-based milestones
      const goalExists = validGoalIds.includes(milestone.goalId);
      const goalNotCompleted = !completedGoalIds.includes(milestone.goalId);
      const goalMatches = selectedGoalId === 'all' || selectedGoalId === milestone.goalId;
      
      return goalExists && goalNotCompleted && goalMatches;
    });
    
    // Apply milestone filter if one is selected (show only the selected milestone)
    if (selectedMilestoneId) {
      filtered = filtered.filter(milestone => milestone.id === selectedMilestoneId);
    }
    
    console.log('- Filtered milestones count:', filtered.length);
    console.log('- First few filtered milestones:', filtered.slice(0, 3).map(p => ({ id: p.id, title: p.title, goalId: p.goalId })));
    
    return filtered;
  };
  
  // Get the appropriate items based on current view mode
  const getItemsForCurrentView = () => {
    if (viewMode === 'milestones') {
      return getFilteredMilestones();
    } else {
      return getFilteredTasks();
    }
  };
  
  // Count milestones for the selected goal
  const countMilestonesForSelectedGoal = () => {
    if (selectedGoalId === 'all') return 0;
    
    return getFilteredMilestones().filter(milestone => 
      milestone.goalId === selectedGoalId
    ).length;
  };
  
  // Check if the current goal has reached its milestone limit
  const hasReachedMilestoneLimit = () => {
    // Pro users have no limits
    if (isPro) return false;
    
    // "All" view has no specific goal limit
    if (selectedGoalId === 'all') return false;
    
    // Count milestones for the selected goal
    const milestoneCount = countMilestonesForSelectedGoal();
    
    // Get the limit with a fallback
    const milestoneLimit = FREE_PLAN_LIMITS?.MAX_MILESTONES_PER_GOAL || 2;
    
    // Check against the milestone limit (2)
    return milestoneCount >= milestoneLimit;
  };
  
  // Check if a milestone has reached its task limit
  const hasReachedTaskLimit = (milestoneId) => {
    // Pro users have no limits
    if (isPro) return false;
    
    // Get tasks for this milestone
    const milestoneTasks = getTasksForMilestone(milestoneId);
    
    // Get the limit with a fallback
    const taskLimit = FREE_PLAN_LIMITS?.MAX_TASKS_PER_MILESTONE || 5;
    
    // Check against the task limit (5)
    return milestoneTasks.length >= taskLimit;
  };
  
  // Get tasks for a specific milestone
  const getTasksForMilestone = (milestoneId) => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => task.milestoneId === milestoneId);
  };
  
  // Sort milestones by order property
  const sortMilestonesByOrder = (milestonesArray) => {
    return [...milestonesArray].sort((a, b) => {
      // If both have order, sort by order
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      // If only one has order, prioritize the one with order
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      // If neither has order, maintain original order
      return 0;
    });
  };

  // MODIFIED: Group tasks by both goal and milestone for section list
  const getSectionedTasks = () => {
    const filteredTasks = getFilteredTasks();
    
    // Group tasks by goalId and then by milestoneId
    const tasksByGoalAndMilestone = {};
    
    // Use mainGoals if available, otherwise use goals
    const goalsToUse = Array.isArray(mainGoals) && mainGoals.length > 0 ? mainGoals : goals;
    
    // Create a milestoneId -> goalId map and collect milestone info
    const milestoneGoalMap = {};
    const milestonesInfo = {};
    
    if (Array.isArray(milestones)) {
      milestones.forEach(milestone => {
        if (milestone.goalId) {
          milestoneGoalMap[milestone.id] = milestone.goalId;
          milestonesInfo[milestone.id] = {
            id: milestone.id,
            title: milestone.title,
            color: milestone.color,
            status: milestone.status,
            progress: milestone.progress || 0,
            goalId: milestone.goalId,
            icon: 'folder-outline', // Icon for milestone sections
            isMilestone: true // Flag to identify milestone sections
          };
        }
      });
    }
    
    // Initialize goal sections
    if (Array.isArray(goalsToUse)) {
      goalsToUse.forEach(goal => {
        // Skip completed goals
        if (!goal || !goal.id || goal.completed) return;
        
        tasksByGoalAndMilestone[goal.id] = {
          ...goal,
          data: [],           // This will now contain milestone sections instead of tasks
          isGoal: true,       // Flag to identify goal sections
          subSections: {}     // Object to hold milestone sections keyed by milestone ID
        };
      });
    }
    
    // Group tasks by their milestone and goal
    filteredTasks.forEach(task => {
      const milestoneId = task.milestoneId;
      if (!milestoneId || !milestonesInfo[milestoneId]) return; // Skip tasks without valid milestone
      
      const goalId = milestoneGoalMap[milestoneId];
      if (!goalId || !tasksByGoalAndMilestone[goalId]) return; // Skip if goal is invalid
      
      // Initialize milestone section if it doesn't exist
      if (!tasksByGoalAndMilestone[goalId].subSections[milestoneId]) {
        tasksByGoalAndMilestone[goalId].subSections[milestoneId] = {
          ...milestonesInfo[milestoneId],
          data: []  // Array to hold tasks for this milestone
        };
      }
      
      // Add task to the milestone section
      tasksByGoalAndMilestone[goalId].subSections[milestoneId].data.push(task);
    });
    
    // Convert to array format for SectionList and filter out empty sections
    const sectionsArray = Object.values(tasksByGoalAndMilestone).filter(goalSection => {
      // Get all milestone sections for this goal
      const milestoneSections = Object.values(goalSection.subSections);
      
      // Skip goals with no milestones or no tasks
      if (milestoneSections.length === 0) return false;
      
      // Add milestone sections to goal's data array (for SectionList)
      goalSection.data = milestoneSections;
      
      return true;
    });
    
    return sectionsArray;
  };
  
  // Prepare data for section list grouped by goals
  const getSectionedMilestones = () => {
    const filteredMilestones = getFilteredMilestones();
    
    // Group milestones by goalId
    const milestonesByGoal = {};
    
    // Use mainGoals if available, otherwise use goals
    const goalsToUse = Array.isArray(mainGoals) && mainGoals.length > 0 ? mainGoals : goals;
    
    // Ensure we have an array of goals to work with
    if (Array.isArray(goalsToUse)) {
      // Add other goals with their milestones
      goalsToUse.forEach(goal => {
        // Skip completed goals - additional check
        if (!goal || !goal.id || goal.completed) return; 
        
        const goalMilestones = filteredMilestones.filter(milestone => milestone.goalId === goal.id);
        if (goalMilestones.length > 0) {
          milestonesByGoal[goal.id] = {
            ...goal,
            data: sortMilestonesByOrder(goalMilestones), // Sort by order
            isGoal: true // Add flag to identify goal sections
          };
        }
      });
    }
    
    // Convert to array format for SectionList
    return Object.values(milestonesByGoal).filter(section => section.data.length > 0);
  };

  // Get the right sectioned data based on current view mode
  const getSectionedData = () => {
    if (viewMode === 'milestones') {
      return getSectionedMilestones();
    } else {
      return getSectionedTasks();
    }
  };
  
  // Function to update milestone progress - using the atomic update function if available
  const handleUpdateMilestoneProgress = async (milestoneId, newProgress) => {
    // Get the milestone to update
    const milestoneToUpdate = milestones.find(p => p.id === milestoneId);
    if (!milestoneToUpdate) return;
    
    try {
      // Check if this is a milestone completion (0 or other -> 100)
      const wasCompleted = milestoneToUpdate.status === 'done' || milestoneToUpdate.completed;
      const isNowCompleted = newProgress === 100;
      
      // If milestone is being completed (not already completed), show confetti!
      if (!wasCompleted && isNowCompleted) {
        console.log("COMPLETING MILESTONE! Triggering confetti for:", milestoneToUpdate.title);
        
        // Set confetti colors based on milestone color
        setConfettiColors(getConfettiColors(milestoneToUpdate.color));
        
        // Show confetti
        setShowConfetti(true);
      }
      
      // First, try to use the atomic update function if available
      if (typeof updateMilestoneProgress === 'function') {
        // Use it with proper error handling - this will update status but preserve task-based progress
        const success = await updateMilestoneProgress(milestoneId, newProgress);
        
        if (success) {
          // Show success notification
          if (notification && notification.showSuccess) {
            notification.showSuccess(`Milestone moved to ${newProgress === 0 ? 'To Do' : newProgress === 100 ? 'Done' : 'In Progress'}`);
          }
          
          // Note: Removed refreshData call to prevent overriding completion status
          // The updateMilestoneProgress function already updates state and storage
          console.log('Milestone progress update completed successfully');
        } else {
          // Show error notification
          if (notification && notification.showError) {
            notification.showError("Failed to update milestone. Please try again.");
          }
        }
        return;
      }
      
      // Fall back to the old method if the new function isn't available
      console.log(`Updating milestone ${milestoneId} progress to ${newProgress}%`);
      
      // Determine status based on progress
      const newStatus = newProgress === 0 ? 'todo' : 
                       newProgress === 50 ? 'in_progress' : 
                       newProgress === 100 ? 'done' : milestoneToUpdate.status;
      
      // Create updated milestone
      const updatedMilestone = {
        ...milestoneToUpdate,
        status: newStatus, // Set explicit status property
        statusProgress: newProgress, // Store status indicator value
        // Don't directly set progress - let AppContext handle task-based calculation
        completed: newProgress === 100, // Only mark as completed if 100%
        updatedAt: new Date().toISOString()
      };
      
      updateMilestone(updatedMilestone);
      
      // Show success notification
      if (notification && notification.showSuccess) {
        notification.showSuccess(`Milestone moved to ${newProgress === 0 ? 'To Do' : newProgress === 100 ? 'Done' : 'In Progress'}`);
      }
      
      // Force update goal progress
      if (milestoneToUpdate.goalId) {
        // Calculate goal progress if we can
        const milestonesForGoal = milestones.filter(p => p.goalId === milestoneToUpdate.goalId);
        const completedMilestones = milestonesForGoal.filter(p => 
          p.id === milestoneId ? newProgress === 100 : (p.progress === 100 || p.completed || p.status === 'done')
        ).length;
        
        const newGoalProgress = Math.round((completedMilestones / milestonesForGoal.length) * 100);
        
        // Find the goal
        const goalToUpdate = goals.find(g => g.id === milestoneToUpdate.goalId);
        if (goalToUpdate) {
          const updatedGoal = {
            ...goalToUpdate,
            progress: newGoalProgress,
            updatedAt: new Date().toISOString()
          };
          
          // Update the goal
          if (typeof updateGoal === 'function') {
            updateGoal(updatedGoal);
          }
        }
      }
    } catch (error) {
      console.error("Error updating milestone progress:", error);
      
      // Show error notification
      if (notification && notification.showError) {
        notification.showError("An error occurred. Please try again.");
      }
    }
  };

  // Handle view mode change - now handled through GoalFilters or other UI
  const handleViewModeChange = () => {
    const newViewMode = viewMode === 'milestones' ? 'tasks' : 'milestones';
    setViewMode(newViewMode);
    
    // Update params at the current navigator level
    navigation.setParams({ viewMode: newViewMode });
    
    // Update params at the ROOT tab navigator level
    const rootNavigation = navigation.getParent();
    if (rootNavigation) {
      rootNavigation.setParams({ viewMode: newViewMode });
    }
  };
  
  // Handle milestone status change in list view
  const handleChangeMilestoneStatus = (milestoneId, newStatus) => {
    console.log(`🎯 [UI DEBUG] handleChangeMilestoneStatus called - Milestone: ${milestoneId}, Status: ${newStatus}`);
    // Get the milestone to update
    const milestoneToUpdate = milestones.find(p => p.id === milestoneId);
    if (!milestoneToUpdate) {
      console.log(`🎯 [UI DEBUG] Milestone not found: ${milestoneId}`);
      return;
    }
    console.log(`🎯 [UI DEBUG] Found milestone to update: ${milestoneToUpdate.title} (current status: ${milestoneToUpdate.status})`);
    
    
    // Convert status to status indicator value
    let statusIndicator;
    if (newStatus === 'todo') statusIndicator = 0;
    else if (newStatus === 'in_progress') statusIndicator = 50;
    else if (newStatus === 'done') statusIndicator = 100;
    
    console.log(`[TasksScreen] Changing milestone ${milestoneId} status to ${newStatus}`);
    
    // Check if this is a milestone completion (not already completed -> done)
    const wasCompleted = milestoneToUpdate.status === 'done' || milestoneToUpdate.completed;
    const isNowCompleted = newStatus === 'done';
    
    // If milestone is being completed (not already completed), show confetti!
    if (!wasCompleted && isNowCompleted) {
      console.log("COMPLETING MILESTONE! Triggering confetti for:", milestoneToUpdate.title);
      
      // Set confetti colors based on milestone color
      setConfettiColors(getConfettiColors(milestoneToUpdate.color));
      
      // Show confetti
      setShowConfetti(true);
    }
    
    // Call the updateMilestoneProgress function which will handle preserving the task-based progress
    if (typeof updateMilestoneProgress === 'function') {
      updateMilestoneProgress(milestoneId, statusIndicator);
    } else {
      // Fallback if the atomic update function isn't available
      const updatedMilestone = {
        ...milestoneToUpdate,
        status: newStatus,
        completed: newStatus === 'done',
        updatedAt: new Date().toISOString()
      };
      
      updateMilestone(updatedMilestone);
    }
    
    // Show success notification and animate
    if (notification && notification.showSuccess) {
      notification.showSuccess(`Milestone moved to ${newStatus === 'todo' ? 'To Do' : newStatus === 'in_progress' ? 'In Progress' : 'Done'}`);
    }
    
    // Note: Milestone tour detection removed since kanban board only shows tasks during tour
  };
  
  // Render milestone actions menu
  const showMilestoneActionsMenu = (milestone) => {
    // Determine current status based on status property first, then progress
    const currentStatus = 
      milestone.status ? milestone.status :
      milestone.progress === 0 ? 'todo' :
      milestone.progress === 100 ? 'done' : 'in_progress';
    
    // Create action items based on current status
    const actions = [];
    
    // Add status change options
    if (currentStatus !== 'todo') {
      actions.push({
        text: 'Move to To Do',
        onPress: () => handleChangeMilestoneStatus(milestone.id, 'todo')
      });
    }
    
    if (currentStatus !== 'in_progress') {
      actions.push({
        text: 'Move to In Progress',
        onPress: () => handleChangeMilestoneStatus(milestone.id, 'in_progress')
      });
    }
    
    if (currentStatus !== 'done') {
      actions.push({
        text: 'Move to Done',
        onPress: () => handleChangeMilestoneStatus(milestone.id, 'done')
      });
    }
    
    // Add edit option
    actions.push({
      text: 'Edit Milestone',
      onPress: () => navigation.navigate('MilestoneDetails', { milestoneId: milestone.id, mode: 'edit' })
    });
    
    // Show the action menu
    Alert.alert(
      milestone.title,
      'What would you like to do?',
      [
        ...actions,
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // NEW FUNCTION: Show task actions menu
  const showTaskActionsMenu = (task) => {
    // Determine current status
    const currentStatus = task.status || (task.completed ? 'done' : 'todo');
    
    // Create action items based on current status
    const actions = [];
    
    // Add status change options
    if (currentStatus !== 'todo') {
      actions.push({
        text: 'Move to To Do',
        onPress: () => handleUpdateTaskStatus(task.id, 'todo')
      });
    }
    
    if (currentStatus !== 'in_progress') {
      actions.push({
        text: 'Move to In Progress',
        onPress: () => handleUpdateTaskStatus(task.id, 'in_progress')
      });
    }
    
    if (currentStatus !== 'done') {
      actions.push({
        text: 'Mark as Done',
        onPress: () => handleUpdateTaskStatus(task.id, 'done')
      });
    }
    
    // Add view/edit option
    const milestoneId = task.milestoneId;
    const milestone = milestones.find(p => p.id === milestoneId);
    if (milestone) {
      actions.push({
        text: 'View in Milestone',
        onPress: () => navigation.navigate('MilestoneDetails', { 
          milestoneId: milestoneId, 
          mode: 'edit',
          initialTask: task.id
        })
      });
    }
    
    // Show the action menu
    Alert.alert(
      task.title,
      'What would you like to do?',
      [
        ...actions,
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };
  
  // Handle milestone press in Kanban view
  const handleKanbanMilestonePress = (milestone) => {
    navigation.navigate('MilestoneDetails', { milestoneId: milestone.id, mode: 'edit' });
  };

  // NEW FUNCTION: Handle task press in Kanban view - Navigate to Time screen to schedule time block
  const handleKanbanTaskPress = (task) => {
    const milestoneId = task.milestoneId;
    if (!milestoneId) {
      console.warn('Task has no milestoneId, cannot create time block');
      return;
    }

    // Find the milestone associated with this task
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) {
      console.warn('Milestone not found for task:', task.title);
      return;
    }

    // Find the goal associated with this milestone
    const goalsToUse = Array.isArray(mainGoals) && mainGoals.length > 0 ? mainGoals : goals;
    const goal = goalsToUse.find(g => g.id === milestone.goalId);
    if (!goal) {
      console.warn('Goal not found for milestone:', milestone.title);
      return;
    }

    // Navigate to TimeTab first, then to TimeBlockScreen with pre-filled data
    navigation.navigate('TimeTab', { 
      screen: 'TimeBlock',
      params: {
        mode: 'create',
        date: new Date(),
        prefilledTask: task,
        prefilledMilestone: milestone,
        prefilledGoal: goal,
        prefilledTaskId: task.id,
        prefilledMilestoneId: milestone.id,
        prefilledGoalId: goal.id
      }
    });
  };
  
  // Removed animateToggleButton as we no longer have the floating button
  
  // Handle add milestone button - direct implementation instead of reference
  const handleAddMilestone = () => {
    // For "all" view, ask user to select a goal first
    if (selectedGoalId === 'all') {
      // Show a prompt to select a goal
      if (Array.isArray(goalsToShow) && goalsToShow.length > 0) {
        const goalOptions = goalsToShow.map(goal => ({
          text: goal.title,
          onPress: () => {
            // First select the goal
            handleGoalSelect(goal.id);
            
            // Then check if they can add more milestones to this goal
            setTimeout(async () => {
              // Get the count of milestones for this goal
              const milestoneCount = milestones.filter(milestone => milestone.goalId === goal.id).length;
              
              // Check if limit reached - directly use the count for immediate feedback
              const hasReachedLimit = !isPro && milestoneCount >= (FREE_PLAN_LIMITS?.MAX_MILESTONES_PER_GOAL || 2);
              
              if (hasReachedLimit) {
                // Use the new upgrade modal instead of the limit modal
                showUpgradePrompt(
                  `You've reached the limit of ${FREE_PLAN_LIMITS?.MAX_MILESTONES_PER_GOAL || 2} milestones per goal. Upgrade to Pro to create unlimited milestones for each goal.`
                );
              } else {
                // Navigate to milestone creation screen
                navigation.navigate('MilestoneDetails', { 
                  mode: 'create',
                  preselectedGoalId: goal.id
                });
              }
            }, 300);
          }
        }));
        
        Alert.alert(
          "Select a Goal",
          "Choose which goal to add this milestone to:",
          [
            ...goalOptions,
            { text: "Cancel", style: "cancel" }
          ]
        );
      } else {
        // No goals available
        Alert.alert(
          "No Goals Available",
          "You need to create a goal before adding milestones.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Create Goal", 
              onPress: () => navigation.navigate('GoalsTab')
            }
          ]
        );
      }
      return;
    }
    
    // For specific goal view, directly check milestone count for the goal
    const milestoneCount = milestones.filter(milestone => milestone.goalId === selectedGoalId).length;
    const hasReachedLimit = !isPro && milestoneCount >= (FREE_PLAN_LIMITS?.MAX_MILESTONES_PER_GOAL || 2);
    
    if (hasReachedLimit) {
      // Use the new upgrade modal instead of the limit modal
      showUpgradePrompt(
        `You've reached the limit of ${FREE_PLAN_LIMITS?.MAX_MILESTONES_PER_GOAL || 2} milestones per goal. Upgrade to Pro to create unlimited milestones for each goal.`
      );
      return;
    }
    
    // If user can add more milestones, proceed to milestone creation screen
    navigation.navigate('MilestoneDetails', { 
      mode: 'create',
      preselectedGoalId: selectedGoalId
    });
  };

  // Handle task status changes
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    // Get the task to update
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
    
    // Debug logging for standalone tasks
    console.log('🎯 TasksScreen handleUpdateTaskStatus:', {
      taskId,
      newStatus,
      taskTitle: taskToUpdate.title,
      milestoneId: taskToUpdate.milestoneId,
      projectId: taskToUpdate.projectId,
      goalId: taskToUpdate.goalId,
      isStandalone: !taskToUpdate.milestoneId && !taskToUpdate.projectId && !taskToUpdate.goalId
    });
    
    try {
      // Determine completion based on status
      const completed = newStatus === 'done';
      
      // Create updated task
      const updatedTask = {
        ...taskToUpdate,
        status: newStatus,
        completed: completed,
        updatedAt: new Date().toISOString()
      };
      
      // Update the task - pass null for milestoneId if task is standalone
      if (typeof updateTask === 'function') {
        const milestoneId = taskToUpdate.milestoneId || taskToUpdate.projectId || null;
        await updateTask(milestoneId, taskToUpdate.id, updatedTask);
        
        // Show success notification
        if (notification && notification.showSuccess) {
          notification.showSuccess(`Task moved to ${newStatus === 'todo' ? 'To Do' : newStatus === 'in_progress' ? 'In Progress' : 'Done'}`);
        }
        
        // Tour detection: Check if user moved task to In Progress during tour
        if (isTourActive && (currentStep === 'PICK_CURRENT_FOCUS' || currentStep === 'TASK_MOVED_CELEBRATION') && newStatus === 'in_progress') {
          console.log('🎯 Tour: User moved task to In Progress! Triggering celebration step');
          console.log('🎯 Tour: Current state:', { isTourActive, currentStep, globalCallback: !!global.tourTaskMoved });
          
          // Store the selected task data for timeblock creation
          const milestone = milestones.find(m => m.id === taskToUpdate.milestoneId);
          const goal = milestone ? mainGoals.find(g => g.id === milestone.goalId) : null;
          
          if (milestone && goal) {
            console.log('🎯 Tour: Storing task data globally for timeblock creation:', {
              task: taskToUpdate.title,
              milestone: milestone.title,
              goal: goal.title
            });
            
            global.tourSelectedTask = taskToUpdate;
            global.tourSelectedMilestone = milestone;
            global.tourSelectedGoal = goal;
          } else {
            console.error('🎯 Tour: ERROR - Could not find milestone or goal for task:', taskToUpdate);
          }
          
          setTimeout(() => {
            if (global.tourTaskMoved) {
              console.log('🎯 Tour: Calling global.tourTaskMoved()');
              global.tourTaskMoved();
            } else {
              console.log('🎯 Tour: ERROR - global.tourTaskMoved not available!');
            }
          }, 1000); // Small delay to let success notification show
        }
        
        // Note: Removed refreshData call to prevent overriding completion status
        // The updateTask function already updates state and triggers milestone progress updates
      } else {
        console.error("updateTask function not available");
        if (notification && notification.showError) {
          notification.showError("Cannot update task status");
        }
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      if (notification && notification.showError) {
        notification.showError("An error occurred. Please try again.");
      }
    }
  };
  
  // Handle add task button - uses current filter context directly
  const handleAddTask = () => {
    console.log('🎯 handleAddTask called with filters:', {
      selectedGoalId,
      selectedMilestoneId,
      viewMode
    });

    // CASE 1: Specific milestone selected - add task directly to that milestone
    if (selectedMilestoneId) {
      const selectedMilestone = milestones.find(p => p.id === selectedMilestoneId);
      
      if (!selectedMilestone) {
        console.error("Selected milestone not found:", selectedMilestoneId);
        showError("Selected milestone not found.");
        return;
      }

      // Check task limit for this milestone
      const hasTaskLimit = hasReachedTaskLimit(selectedMilestoneId);
      
      if (!isPro && hasTaskLimit) {
        showUpgradePrompt(
          `You've reached the limit of ${FREE_PLAN_LIMITS?.MAX_TASKS_PER_MILESTONE || 5} tasks per milestone. Upgrade to Pro to create unlimited tasks.`
        );
        return;
      }

      // Navigate to TaskDetailsScreen with pre-filled goal and milestone
      navigation.navigate('TaskDetails', { 
        mode: 'create',
        preselectedGoalId: selectedMilestone.goalId,
        preselectedMilestoneId: selectedMilestoneId,
        previousScreen: 'TasksScreen'
      });
      return;
    }

    // CASE 2: Specific goal selected but no milestone - add goal-level standalone task
    if (selectedGoalId && selectedGoalId !== 'all') {
      // Navigate to TaskDetailsScreen with pre-filled goal only
      navigation.navigate('TaskDetails', { 
        mode: 'create',
        preselectedGoalId: selectedGoalId,
        preselectedMilestoneId: null,
        previousScreen: 'TasksScreen'
      });
      return;
    }

    // CASE 3: "All" view selected - add truly standalone task (goal-level standalone)
    if (selectedGoalId === 'all') {
      // Navigate to TaskDetailsScreen with no pre-selection
      navigation.navigate('TaskDetails', { 
        mode: 'create',
        preselectedGoalId: null,
        preselectedMilestoneId: null,
        previousScreen: 'TasksScreen'
      });
      return;
    }

    // Fallback - should not reach here
    console.warn('Unexpected state in handleAddTask:', { selectedGoalId, selectedMilestoneId });
  };
  
  // Use mainGoals if available, otherwise use goals, filtering out completed goals
  const goalsToShow = Array.isArray(mainGoals) && mainGoals.length > 0 
    ? mainGoals.filter(goal => !goal.completed) 
    : Array.isArray(goals) ? goals.filter(goal => !goal.completed) : [];
    
  // Get milestones for the selected goal (these are milestones within the goal)
  const getMilestonesForSelectedGoal = () => {
    if (selectedGoalId === 'all' || selectedGoalId === 'standalone') return [];
    
    return Array.isArray(milestones) 
      ? milestones.filter(milestone => 
          milestone.goalId === selectedGoalId && 
          !milestone.completed
        )
      : [];
  };
  
  const milestonesForGoal = getMilestonesForSelectedGoal();

  // Get section data for list rendering
  const sectionData = getSectionedData();
  
  // Calculate item counts correctly by summing the actual visible items
  const visibleItemCount = sectionData.reduce((sum, section) => sum + section.data.length, 0);
  const totalMilestoneCount = Array.isArray(milestones) ? milestones.length : 0;
  const totalTaskCount = Array.isArray(tasks) ? tasks.length : 0;
  
  // This ensures we're showing the actual count of visible items in the UI
  const displayedItemCount = visibleItemCount;
  
  // Check if theme is dark for proper contrast
  const isDarkMode = theme.background === '#000000';

  // Create interpolated values for the goal switching animation
  const contentOpacity = goalSwitchAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [1, 0, 0, 1] // Fade out then in
  });

  const contentTranslate = goalSwitchAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, -15, 15, 0] // Slide up then down
  });

  // Prepare data and callbacks for child components
  const taskScreenProps = {
    theme,
    navigation,
    isDarkMode,
    handleAddMilestone,
    handleAddTask, // NEW: Add task handler
    displayedItemCount,
    verifyMilestoneDataConsistency,
    viewMode, // NEW: Current view mode (milestones/tasks)
    setViewMode, // NEW: Function to change view mode
    displayMode: 'kanban', // Always kanban now
    setDisplayMode: () => {}, // No-op since we only have kanban
    selectedGoalId,
    selectedMilestoneId,
    setSelectedGoalId,
    goalsToShow,
    sectionData,
    getCurrentCollapsedSections,
    getTasksForMilestone,
    toggleSection,
    showMilestoneActionsMenu,
    showTaskActionsMenu, // NEW: Task actions menu handler
    handleChangeMilestoneStatus,
    handleUpdateTaskStatus, // NEW: Task status update handler
    getFilteredMilestones,
    getFilteredTasks, // NEW: Get tasks method
    handleKanbanMilestonePress,
    handleKanbanTaskPress, // NEW: Task press handler for kanban
    handleUpdateMilestoneProgress,
    kanbanFilter: selectedGoalId !== 'all' ? { goalId: selectedGoalId } : null,
    totalMilestoneCount,
    totalTaskCount, // NEW: Total task count
    visibleItemCount,
    isVerifying,
    setDraggingMilestone,
    setActiveMilestoneSection,
    setIsDragging,
    draggingMilestone,
    milestoneLayout,
    setMilestoneLayout,
    isDragging,
    activeMilestoneSection,
    contentFadeOpacity,
    contentTranslateY,
    // Props for enhanced kanban view
    kanbanFullScreen,
    setKanbanFullScreen: handleKanbanFullScreenChange,
    // Subscription related props
    isPro,
    handleUpgradePress,
    milestoneLimitReached: selectedGoalId !== 'all' && !isPro && 
      countMilestonesForSelectedGoal() >= (FREE_PLAN_LIMITS?.MAX_MILESTONES_PER_GOAL || 2),
    // Pass both functions to child components
    showUpgradePrompt,
    showFeatureLimitBanner,
    // Pass settings for WIP limit access
    settings,
    updateAppSetting,
    // Tour-related props
    isTourMode: isTourActive && (currentStep === 'KANBAN_SYSTEM_INTRO' || currentStep === 'PICK_CURRENT_FOCUS' || currentStep === 'TASK_MOVED_CELEBRATION'),
    tourScrollPosition: 0,
  };



  // Check if we should show the kanban view as a full-screen overlay
  const shouldShowFullScreen = kanbanFullScreen;
  
  if (shouldShowFullScreen) {
    // When in full-screen mode, render only the KanbanView as an overlay
    return (
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999, // Ensure it's above everything
        elevation: 9999,
        backgroundColor: '#000000', // Explicitly set to black
      }}>
        <KanbanView taskScreenProps={taskScreenProps} />
      </View>
    );
  }

  // Normal view (not full-screen kanban)
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.background,
        // Use safe area insets for proper spacing
        paddingTop: insets.top,
      }
    ]}>
      {/* Confetti component at the top level for milestone completion */}
      <Confetti 
        active={showConfetti} 
        colors={confettiColors} 
        duration={4000}
        type="confetti"
        onComplete={() => setShowConfetti(false)}
      />
      
      {/* Kanban View - Always displayed */}
      <Animated.View style={{
        flex: 1,
        backgroundColor: theme.background,
        opacity: Animated.multiply(contentFadeOpacity, contentOpacity),
        transform: [{ translateY: contentTranslate }]
      }}>
        {/* Hide goal filters during tour */}
        {!isTourActive && (
          <GoalFilters 
            selectedGoalId={selectedGoalId}
            onGoalSelect={handleGoalSelect}
            goalsToShow={goalsToShow}
            theme={theme}
            selectedMilestoneId={selectedMilestoneId}
            onMilestoneSelect={handleMilestoneSelect}
            milestonesForGoal={milestonesForGoal}
          />
        )}
        <View style={{ 
          flex: 1, 
          backgroundColor: '#000000',
          paddingBottom: 0  // Remove extra padding since no floating button
        }}>
          {/* Hide normal kanban during tour to avoid double rendering */}
          {!(isTourActive && currentStep === 'KANBAN_INTRO') && (
            <KanbanView taskScreenProps={taskScreenProps} />
          )}
        </View>
      </Animated.View>
      
      {/* Overlay for drag and drop mode */}
      {isDragging && (
        <View style={styles.dragOverlay} pointerEvents="none">
          <View style={[styles.dragBanner, { backgroundColor: theme.primary }]}>
            <Ionicons 
              name="hand-left" 
              size={scaleWidth(18)} 
              color={isDarkMode ? '#000000' : '#FFFFFF'} 
            />
            <Text 
              style={[
                styles.dragBannerText, 
                { 
                  color: isDarkMode ? '#000000' : '#FFFFFF',
                  fontSize: fontSizes.m,
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Drag to reorder
            </Text>
          </View>
        </View>
      )}
      
      {/* Loading overlay for verification */}
      {isVerifying && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingBox, { backgroundColor: theme.card }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text 
              style={[
                styles.loadingText, 
                { 
                  color: theme.text,
                  fontSize: fontSizes.m,
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Verifying milestone data...
            </Text>
          </View>
        </View>
      )}

      {/* Removed floating toggle button - Kanban now uses full screen space */}
      
      {/* Upgrade Modal */}
      <Modal
        visible={showUpgradeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={additionalStyles.modalOverlay}>
          <View style={[
            additionalStyles.upgradeModal, 
            { 
              backgroundColor: theme.card || theme.background,
              marginTop: insets.top,
              marginBottom: insets.bottom,
              marginLeft: spacing.m,
              marginRight: spacing.m
            }
          ]}>
            <View style={additionalStyles.upgradeModalHeader}>
              <Ionicons name="lock-closed" size={scaleWidth(40)} color="#3F51B5" />
              <Text 
                style={[additionalStyles.upgradeModalTitle, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                Pro Feature
              </Text>
            </View>
            
            <Text 
              style={[additionalStyles.upgradeModalMessage, { color: theme.text }]}
              maxFontSizeMultiplier={1.3}
            >
              {upgradeMessage || "Upgrade to Pro to create unlimited milestones for each goal."}
            </Text>
            
            <TouchableOpacity
              style={[
                additionalStyles.upgradeButton, 
                { backgroundColor: '#3F51B5' }
              ]}
              onPress={goToPricingScreen}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Upgrade to Pro"
              accessibilityHint="Opens the pricing screen to upgrade your subscription"
            >
              <Ionicons name="rocket" size={scaleWidth(20)} color="#FFFFFF" style={{marginRight: spacing.xs}} />
              <Text 
                style={additionalStyles.upgradeButtonText}
                maxFontSizeMultiplier={1.3}
              >
                Upgrade to Pro
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={additionalStyles.laterButton}
              onPress={() => setShowUpgradeModal(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Maybe Later"
              accessibilityHint="Closes the upgrade prompt"
            >
              <Text 
                style={[additionalStyles.laterButtonText, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Milestone Limit Modal - KEEPING AS FALLBACK */}
      <AILimitReachedModal
        visible={showLimitModal}
        theme={theme}
        usageCount={milestoneLimitData.milestoneCount}
        maxCount={milestoneLimitData.maxAllowed}
        onClose={() => setShowLimitModal(false)}
        onUpgrade={handleUpgradePress}
        onWatchAd={() => {
          // Close the modal
          setShowLimitModal(false);
          
          // Navigate to watch ads screen
          navigation.navigate('WatchAdsScreen', {
            onAdComplete: () => {
              // This callback would be called when ad is finished
              // You could grant a temporary exemption to the limit here
              navigation.navigate('MilestoneDetails', { 
                mode: 'create',
                preselectedGoalId: selectedGoalId,
                bypassLimits: true // Add a flag to bypass limits for this creation
              });
            }
          });
        }}
      />
      
      {/* Elevated Tour Kanban - rendered AFTER overlay during tour so it appears on top */}
      {isTourActive && currentStep === 'KANBAN_INTRO' && (
        <Animated.View style={[additionalStyles.tourKanbanContainer, { opacity: tourKanbanOpacity }]}>
          <KanbanView 
            taskScreenProps={{
              ...taskScreenProps,
              isTourMode: true, // Pass tour mode to disable interactions
              tourScrollPosition: tourKanbanScrollPosition // Pass scroll position control
            }} 
          />
        </Animated.View>
      )}
      
      {/* Tour Action Guidance - shows after PICK_CURRENT_FOCUS AI message completes and no tasks in progress */}
      {(() => {
        const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
        const inProgressMilestones = milestones.filter(milestone => milestone.status === 'in_progress');
        const totalInProgress = inProgressTasks.length + inProgressMilestones.length;
        
        // Show guidance only after AI message is complete (tourWaitingForTaskMove is set) and no tasks in progress
        const shouldShowGuidance = isTourActive && 
          global.tourWaitingForTaskMove && 
          totalInProgress === 0;
          
        console.log('🎯 Action Guidance Debug:', {
          isTourActive,
          currentStep,
          tourWaitingForTaskMove: global.tourWaitingForTaskMove,
          totalInProgress,
          shouldShowGuidance
        });
        
        return shouldShowGuidance;
      })() && (
        <View style={{
          position: 'absolute',
          bottom: 40,
          left: 20,
          right: 20,
          backgroundColor: theme.cardBackground,
          borderRadius: 12,
          padding: 16,
          borderWidth: 2,
          borderColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="hand-left" size={20} color="#4CAF50" style={{ marginRight: 8 }} />
            <Text style={{ 
              color: theme.text, 
              fontSize: 16, 
              fontWeight: '600' 
            }}>
              Action Required
            </Text>
          </View>
          <Text style={{ 
            color: theme.textSecondary, 
            fontSize: 14, 
            lineHeight: 20 
          }}>
            Move one task to "In Progress".
          </Text>
        </View>
      )}

      {/* Tour Continue Button - shows when user has moved exactly 1 task to In Progress */}
      {(() => {
        const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
        const inProgressMilestones = milestones.filter(milestone => milestone.status === 'in_progress');
        const totalInProgress = inProgressTasks.length + inProgressMilestones.length;
        
        console.log('🎯 Continue Button Debug:', {
          isTourActive,
          currentStep,
          tourWaitingForTaskMove: global.tourWaitingForTaskMove,
          totalInProgress,
          shouldShow: isTourActive && currentStep === 'TASK_MOVED_CELEBRATION' && totalInProgress >= 1
        });
        
        return isTourActive && currentStep === 'TASK_MOVED_CELEBRATION' && totalInProgress >= 1;
      })() && (
        <View style={{
          position: 'absolute',
          bottom: 100,
          left: 20,
          right: 20,
          zIndex: 10001,
          alignItems: 'center'
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#22c55e',
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 25,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8
            }}
            onPress={() => {
              console.log('🎯 Tour: Continue button pressed, advancing to time screen');
              nextStep();
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Continue Tour"
            accessibilityHint="Continue to schedule time for this task"
          >
            <Ionicons name="arrow-forward" size={20} color="white" style={{marginRight: 8}} />
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600'
            }}>
              Continue - Let's Schedule Time!
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* App Tour Overlay */}
      <AppTourOverlay
        isVisible={isTourActive && (currentStep === 'KANBAN_SYSTEM_INTRO' || currentStep === 'PICK_CURRENT_FOCUS' || currentStep === 'TASK_MOVED_CELEBRATION')}
        currentStep={currentStep}
        onComplete={nextStep}
        onSkip={skipTour}
        spotlightTarget={spotlightTarget}
        onSpecialAction={handleTourSpecialAction}
      />
    </View>
  );
};

// Add styles for the new subscription UI elements
const additionalStyles = StyleSheet.create({
  // Tour kanban container with elevated z-index
  tourKanbanContainer: {
    position: 'absolute',
    top: 120, // Position below header
    left: 0,
    right: 0,
    bottom: 100, // Leave space at bottom
    zIndex: 1000,
    backgroundColor: '#000000', // Match kanban background
  },
  
  // Limit banner container for temporary popup
  limitBannerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.m,
    zIndex: 1000,
  },
  
  // Limit banner wrapper for count display
  limitBannerWrapper: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    zIndex: 5,
  },
  
  // Simple limit text display
  limitText: {
    fontSize: fontSizes.s,
    opacity: 0.8,
  },
  
  // Modal Styles (added from IncomeTab/GoalsScreen for consistency)
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
    minHeight: 44, // Minimum touch target size
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
    minHeight: 44, // Minimum touch target size
  },
  laterButtonText: {
    fontSize: fontSizes.s,
  }
});

export default TasksScreen;