// src/screens/GoalDetailsScreen/index.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  Text, 
  Animated, 
  Alert,
  ScrollView,
  Platform,
  Keyboard,
  BackHandler,
  Share,
  StatusBar,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import contexts
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';

// Import components
import GoalPreview from './components/GoalPreview';
import SectionHeader from './components/SectionHeader';
import GeneralSection from './components/GeneralSection';
import AdvancedSection from './components/AdvancedSection';
import NotificationModal from './components/NotificationModal';
import UnsavedChangesModal from './components/UnsavedChangesModal';

// Import utilities
import { formatDate, getIconDomain, generateShareableContent } from './utils/helpers';
import { goalIcons } from './utils/constants';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility,
  meetsContrastRequirements,
  useScreenDimensions
} from '../../utils/responsive';

// Import Achievement services
import { trackAction } from '../../services/AchievementTracker';
import GoalTracker from '../../services/GoalTracker';
import * as FeatureExplorerTracker from '../../services/FeatureExplorerTracker';

const GoalDetailsScreen = ({ route, navigation }) => {
  // Get safe area insets for proper layout
  const insets = useSafeAreaInsets();
  const { width, height } = useScreenDimensions();
  
  // Theme context
  const { theme } = useTheme();
  
  // Get app context with proper fallbacks
  const appContext = useAppContext() || {
    goals: [],
    mainGoals: [],
    projects: [],
    tasks: [],
  };
  
  const { 
    goals = [], 
    mainGoals = goals,
    projects = [],
    tasks = [],
    updateGoal,
    addGoal,
    deleteGoal,
    deleteProject,
    deleteTask,
    setProjects,
    setTasks,
    cleanupOrphanedProjects
  } = appContext;
  
  const { showSuccess, showError } = useNotification() || { 
    showSuccess: (msg) => console.log(msg),
    showError: (msg) => console.error(msg)
  };
  
  // Extract parameters from route with safe defaults
  const { mode = 'create', goal: initialGoal = null, initialDomain = null } = route?.params || {};
  const isCreating = mode === 'create';
  
  // Animations
  const scrollY = useRef(new Animated.Value(0)).current;
  const saveButtonScale = useRef(new Animated.Value(1)).current;
  
  // State management - unified state object to prevent cascading renders
  const [goalState, setGoalState] = useState({
    title: '',
    description: '',
    selectedIcon: 'star',
    selectedColor: '#4CAF50',
    targetDate: new Date(),
    hasTargetDate: false,
    notifPrefs: {
      'exact': false,
      '15min': false,
      '30min': false,
      '1hour': false,
      '1day': false
    },
    projectsToShare: {},
    shareFormat: 'simple',
  });
  
  // UI state management
  const [uiState, setUiState] = useState({
    activeSection: 'general',
    expandedSection: null,
    showDatePicker: false,
    notificationsModal: false,
    showUnsavedChangesModal: false,
    isLoading: false,
    saveAttempted: false,
    hasUnsavedChanges: false,
    datePickerMode: 'spinner' // Default to spinner (wheel) mode
  });
  
  // Store initial values to detect changes
  const [initialValues, setInitialValues] = useState({});
  
  // Refs
  const titleInputRef = useRef(null);
  const descriptionInputRef = useRef(null);
  const scrollViewRef = useRef(null);
  const isMounted = useRef(true);
  const saveTimeoutRef = useRef(null);
  
  // Enhanced goal achievement tracking with fixed AsyncStorage usage
  const directlyUnlockFirstGoalAchievement = async () => {
    try {
      // Only do this for new goals
      if (!isCreating) return;
      
      console.log('[GoalDetailsScreen] Directly triggering goal pioneer achievement...');
      
      // Use the new GoalTracker to force unlock the first goal achievement
      await GoalTracker.forceUnlockFirstGoalAchievement(showSuccess);
      
    } catch (error) {
      console.error('[GoalDetailsScreen] Error directly unlocking achievement:', error);
    }
  };
  
  // Effects

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  // Set initial values with defensive coding
  useEffect(() => {
    if (!isCreating && initialGoal) {
      try {
        // Editing an existing goal - safely set values with defaults
        const titleValue = initialGoal.title || '';
        const descriptionValue = initialGoal.description || '';
        const iconValue = initialGoal.icon || 'star';
        const colorValue = initialGoal.color || '#4CAF50';
        
        // Load notification preferences
        const prefs = {
          'exact': false,
          '15min': false,
          '30min': false,
          '1hour': false,
          '1day': false
        };
        
        if (Array.isArray(initialGoal.notificationPreferences)) {
          initialGoal.notificationPreferences.forEach(prefId => {
            if (prefs.hasOwnProperty(prefId)) {
              prefs[prefId] = true;
            }
          });
        }
        
        // Initialize project sharing settings
        const initialProjectsToShare = {};
        if (initialGoal && initialGoal.id) {
          const linkedProjects = getLinkedProjects();
          linkedProjects.forEach(project => {
            initialProjectsToShare[project.id] = initialGoal.projectsToShare ? 
              initialGoal.projectsToShare[project.id] || false : 
              false;
          });
        }
        
        // Handle target date
        let hasDate = false;
        let dateObj = new Date();
        
        if (initialGoal.targetDate) {
          hasDate = true;
          // Make sure the date is valid
          const parsedDate = new Date(initialGoal.targetDate);
          if (!isNaN(parsedDate.getTime())) {
            dateObj = parsedDate;
          }
        }
        
        // Set all state at once to prevent multiple rerenders
        setGoalState({
          title: titleValue,
          description: descriptionValue,
          selectedIcon: iconValue,
          selectedColor: colorValue,
          targetDate: dateObj,
          hasTargetDate: hasDate,
          notifPrefs: prefs,
          projectsToShare: initialProjectsToShare,
          shareFormat: 'simple'
        });
        
        // Store initial values to track changes
        setInitialValues({
          title: titleValue,
          description: descriptionValue,
          selectedIcon: iconValue,
          selectedColor: colorValue,
          hasTargetDate: hasDate,
          targetDate: dateObj,
          notifPrefs: {...prefs},
          projectsToShare: {...initialProjectsToShare}
        });
        
        // Reset unsaved changes flag
        setUiState(prev => ({
          ...prev,
          hasUnsavedChanges: false
        }));
      } catch (error) {
        console.error("Error loading goal data:", error);
        // Set default values if loading fails
        setGoalState(prev => ({
          ...prev,
          title: initialGoal.title || '',
          selectedIcon: 'star',
          selectedColor: '#4CAF50'
        }));
      }
    } else {
      // Creating a new goal - set defaults
      let iconValue = 'star';
      
      // If there's an initial domain passed, set corresponding values
      if (initialDomain) {
        // Find the matching icon for the domain
        const domainIcon = goalIcons.find(icon => icon.label === initialDomain);
        if (domainIcon) {
          iconValue = domainIcon.name;
        }
      }
      
      setGoalState({
        title: '',
        description: '',
        selectedIcon: iconValue,
        selectedColor: '#4CAF50',
        targetDate: new Date(),
        hasTargetDate: false,
        notifPrefs: {
          'exact': false,
          '15min': false,
          '30min': false,
          '1hour': false,
          '1day': false
        },
        projectsToShare: {},
        shareFormat: 'simple'
      });
      
      // Store initial values
      setInitialValues({
        title: '',
        description: '',
        selectedIcon: iconValue,
        selectedColor: '#4CAF50',
        hasTargetDate: false,
        targetDate: new Date(),
        notifPrefs: {
          'exact': false,
          '15min': false,
          '30min': false,
          '1hour': false,
          '1day': false
        },
        projectsToShare: {}
      });
      
      // Reset unsaved changes flag
      setUiState(prev => ({
        ...prev,
        hasUnsavedChanges: false
      }));
    }
  }, [isCreating, initialGoal, initialDomain]);
  
  // Update check for unsaved changes whenever relevant state changes
  useEffect(() => {
    // Skip the initial render
    if (Object.keys(initialValues).length === 0) return;
    
    // Check if any values are different from initial
    const hasChanges = 
      goalState.title !== initialValues.title ||
      goalState.description !== initialValues.description ||
      goalState.selectedIcon !== initialValues.selectedIcon ||
      goalState.selectedColor !== initialValues.selectedColor ||
      goalState.hasTargetDate !== initialValues.hasTargetDate ||
      (goalState.hasTargetDate && goalState.targetDate.toISOString() !== initialValues.targetDate?.toISOString()) ||
      JSON.stringify(goalState.notifPrefs) !== JSON.stringify(initialValues.notifPrefs) ||
      JSON.stringify(goalState.projectsToShare) !== JSON.stringify(initialValues.projectsToShare);
    
    setUiState(prev => ({
      ...prev,
      hasUnsavedChanges: hasChanges
    }));
  }, [goalState, initialValues]);
  
  // Handle Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (uiState.hasUnsavedChanges) {
          setUiState(prev => ({
            ...prev,
            showUnsavedChangesModal: true
          }));
          return true; // Prevent default back behavior
        }
        return false; // Allow default back behavior
      };

      // Add event listener for back press
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Return function to be called when the component unmounts
      return () => subscription.remove();
    }, [uiState.hasUnsavedChanges])
  );
  
  // Reset save attempted state when screen unfocuses
  useFocusEffect(
    useCallback(() => {
      return () => {
        setUiState(prev => ({
          ...prev,
          saveAttempted: false
        }));
      };
    }, [])
  );
  
  // Check if we came from LifePlanOverview
  useEffect(() => {
    if (route.params?.previousScreen === 'LifePlanOverview') {
      // For debugging
      console.log('Came from LifePlanOverview');
    }
  }, [route.params]);
  
  // Handlers
  
  // Custom back button handler
  const handleBackPress = () => {
    if (uiState.hasUnsavedChanges) {
      setUiState(prev => ({
        ...prev,
        showUnsavedChangesModal: true
      }));
    } else {
      // Check if we came from LifePlanOverview
      if (route.params?.previousScreen === 'LifePlanOverview') {
        // Use reset to ensure we go to the GoalsTab tab directly
        navigation.reset({
          index: 0,
          routes: [
            { 
              name: 'Main',
              state: {
                routes: [{ name: 'GoalsTab' }],
                index: 0,
              }
            },
          ],
        });
      } else {
        navigation.goBack();
      }
    }
  };
  
  // Discard changes and go back
  const discardChangesAndGoBack = () => {
    setUiState(prev => ({
      ...prev,
      showUnsavedChangesModal: false,
      hasUnsavedChanges: false
    }));
    
    // Check if we came from LifePlanOverview
    if (route.params?.previousScreen === 'LifePlanOverview') {
      // Use reset to ensure we go to the GoalsTab tab directly
      navigation.reset({
        index: 0,
        routes: [
          { 
            name: 'Main',
            state: {
              routes: [{ name: 'GoalsTab' }],
              index: 0,
            }
          },
        ],
      });
    } else {
      navigation.goBack();
    }
  };
  
  // Calculate progress based on linked projects
  const calculateProjectsProgress = () => {
    if (!initialGoal || !initialGoal.id) return 0;
    
    const linkedProjects = getLinkedProjects();
    if (linkedProjects.length === 0) return 0;
    
    const completedProjects = linkedProjects.filter(project => project.progress === 100).length;
    return Math.round((completedProjects / linkedProjects.length) * 100);
  };
  
  // Get total progress
  const getTotalProgress = () => {
    return calculateProjectsProgress();
  };
  
  // Navigate to detailed progress view
  const navigateToProgressView = () => {
    if (isCreating) {
      showSuccess('Please save your goal first to view progress details');
      return;
    }
    
    navigation.navigate('GoalProgress', { 
      goalId: initialGoal.id,
      goalColor: goalState.selectedColor,
      goalTitle: goalState.title
    });
  };
  
  // Handle date change
const handleDateChange = (event, selectedDate) => {
  setUiState(prev => ({
    ...prev,
    showDatePicker: Platform.OS === 'ios' // Keep showing on iOS, auto-close on Android
  }));
  
  if (selectedDate) {
    setGoalState(prev => ({
      ...prev,
      targetDate: selectedDate
    }));
    
    // Track milestone marker achievement when a date is set
    if (goalState.hasTargetDate) {
      try {
        // Adapt the project tracking to work with goals by creating a compatible object
        const goalAsProject = {
          milestoneDate: selectedDate
        };
        FeatureExplorerTracker.trackMilestoneMarker(goalAsProject, showSuccess);
      } catch (error) {
        console.error('Error tracking milestone marker achievement:', error);
        // Silently handle tracking errors without affecting main functionality
      }
    }
  }
};
  
  // Toggle target date
const toggleTargetDate = () => {
  const newHasTargetDate = !goalState.hasTargetDate;
  
  setGoalState(prev => ({
    ...prev,
    hasTargetDate: newHasTargetDate
  }));
  
  // Show date picker if toggling on, hide if toggling off
  setUiState(prev => ({
    ...prev,
    showDatePicker: newHasTargetDate // This will automatically show the picker when toggled on
  }));
  
  // Track milestone marker achievement when turning on target date with existing date
  if (newHasTargetDate && goalState.targetDate) {
    try {
      // Adapt the project tracking to work with goals
      const goalAsProject = {
        milestoneDate: goalState.targetDate
      };
      FeatureExplorerTracker.trackMilestoneMarker(goalAsProject, showSuccess);
    } catch (error) {
      console.error('Error tracking milestone marker achievement:', error);
      // Silently handle tracking errors without affecting main functionality
    }
  }
};
  
  // Toggle date picker mode between spinner and calendar
  const toggleDatePickerMode = (mode) => {
    setUiState(prev => ({
      ...prev,
      datePickerMode: mode
    }));
  };
  
  // Handle notification preferences
  const toggleNotificationPreference = (prefId) => {
    setGoalState(prev => ({
      ...prev,
      notifPrefs: {
        ...prev.notifPrefs,
        [prefId]: !prev.notifPrefs[prefId]
      }
    }));
  };
  
  // Handle toggle for project sharing
  const toggleProjectSharing = (projectId) => {
    setGoalState(prev => ({
      ...prev,
      projectsToShare: {
        ...prev.projectsToShare,
        [projectId]: !prev.projectsToShare[projectId]
      }
    }));
  };
  
  // Set active section
  const setActiveSection = (section) => {
    setUiState(prev => ({
      ...prev,
      activeSection: section
    }));
  };
  
  // Toggle expanded section
  const toggleExpandedSection = (section) => {
    setUiState(prev => ({
      ...prev,
      expandedSection: prev.expandedSection === section ? null : section
    }));
  };
  
  // Toggle notifications modal
  const toggleNotificationsModal = (visible) => {
    setUiState(prev => ({
      ...prev,
      notificationsModal: visible
    }));
  };
  
  // Toggle date picker
  const toggleDatePicker = (visible) => {
    setUiState(prev => ({
      ...prev,
      showDatePicker: visible
    }));
  };
  
  // Set share format
  const setShareFormat = (format) => {
    setGoalState(prev => ({
      ...prev,
      shareFormat: format
    }));
  };
  
  // Handle input changes
  const handleTitleChange = (text) => {
    setGoalState(prev => ({
      ...prev,
      title: text
    }));
  };
  
  const handleDescriptionChange = (text) => {
    setGoalState(prev => ({
      ...prev,
      description: text
    }));
  };
  
  const handleIconChange = (icon) => {
    setGoalState(prev => ({
      ...prev,
      selectedIcon: icon
    }));
  };
  
  const handleColorChange = (color) => {
    setGoalState(prev => ({
      ...prev,
      selectedColor: color
    }));
  };
  
  // Share goal
  const handleShareGoal = async () => {
    try {
      const shareContent = generateShareableContent(
        goalState.title,
        goalState.description,
        goalState.hasTargetDate,
        goalState.targetDate,
        getTotalProgress(),
        getLinkedProjects(),
        goalState.projectsToShare,
        goalState.shareFormat,
        getTasksForProject
      );
      
      const result = await Share.share({
        message: shareContent,
        title: `Goal: ${goalState.title}`
      });
      
      if (result.action === Share.sharedAction) {
        showSuccess('Goal shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing goal:', error);
      showError('Failed to share goal');
    }
  };
  
  // Copy to clipboard
  const copyToClipboard = () => {
    const shareContent = generateShareableContent(
      goalState.title,
      goalState.description,
      goalState.hasTargetDate,
      goalState.targetDate,
      getTotalProgress(),
      getLinkedProjects(),
      goalState.projectsToShare,
      goalState.shareFormat,
      getTasksForProject
    );
    
    Clipboard.setString(shareContent);
    showSuccess('Copied to clipboard!');
  };
  
  // Animate save button
  const animateSaveButton = () => {
    Animated.sequence([
      Animated.timing(saveButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(saveButtonScale, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(saveButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  };
  
  // Handle save with proper error handling
  const handleSave = async () => {
    // Validate
    if (!goalState.title.trim()) {
      showError('Please enter a title');
      return;
    }
    
    try {
      // To prevent double-save, check if we're already saving
      if (uiState.isLoading || uiState.saveAttempted) {
        console.log('Save already in progress or attempted, ignoring duplicate request');
        return;
      }
      
      // Animate save button
      animateSaveButton();
      
      setUiState(prev => ({
        ...prev,
        isLoading: true,
        saveAttempted: true
      }));
      
      // Convert notification preferences object to array for saving
      const notificationPreferencesArray = Object.keys(goalState.notifPrefs).filter(key => goalState.notifPrefs[key]);
      
      // Generate a more unique ID format for goals
      const goalId = initialGoal?.id || `goal-${Date.now().toString()}`;
      
      // Create goal object
      const goal = {
        id: goalId,
        title: goalState.title,
        description: goalState.description,
        icon: goalState.selectedIcon,
        color: goalState.selectedColor,
        targetDate: goalState.hasTargetDate ? goalState.targetDate.toISOString() : null,
        useMetricsForProgress: true, // Always true now since we removed manual progress
        progress: getTotalProgress(),
        createdAt: initialGoal?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: initialGoal?.completed || false,
        domain: initialDomain || getIconDomain(goalState.selectedIcon), // Set domain based on icon or initial domain
        domainName: initialDomain || getIconDomain(goalState.selectedIcon), // Same for domain name
        notificationPreferences: notificationPreferencesArray,
        projectsToShare: goalState.projectsToShare
      };
      
      console.log(`[GoalDetailsScreen] ${isCreating ? 'Creating' : 'Updating'} goal with ID: ${goalId}`);
      
      // IMPORTANT: Add a delay to prevent accidental double submission
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Only proceed if the component is still mounted
      if (!isMounted.current) {
        console.log('Component unmounted, cancelling save');
        return;
      }
      
      // Check the mode and use appropriate function
      if (isCreating) {
        if (typeof addGoal === 'function') {
          // Check if a goal with this ID already exists (to prevent duplication)
          const existingGoal = Array.isArray(mainGoals) ? mainGoals.find(g => g.id === goalId) : null;
          if (existingGoal) {
            console.warn(`A goal with ID ${goalId} already exists. Preventing duplicate creation.`);
            showSuccess('Goal created successfully');
            
            setUiState(prev => ({
              ...prev,
              hasUnsavedChanges: false,
              isLoading: false
            }));
            
            // Use a timeout to ensure state updates before navigation
            saveTimeoutRef.current = setTimeout(() => {
              if (isMounted.current) {
                navigation.goBack();
              }
            }, 300);
            
            return;
          }
          
          // Use the addGoal function for new goals
          console.log('[GoalDetailsScreen] Calling addGoal function');
          addGoal(goal);
          showSuccess('Goal created successfully');
          
          // Track goal creation for achievements - NEW CODE
          try {
            console.log('[GoalDetailsScreen] Tracking goal creation for achievements');
            await GoalTracker.trackGoalSave(goal, showSuccess);
          } catch (achievementError) {
            console.error('Error tracking goal achievement:', achievementError);
            // Don't block the flow if achievement tracking fails
          }
          
          setUiState(prev => ({
            ...prev,
            hasUnsavedChanges: false,
            isLoading: false
          }));
          
          // Use a timeout to ensure state updates before navigation
          saveTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
              navigation.goBack();
            }
          }, 300);
        } else {
          // Try alternative functions that might exist
          console.error("No addGoal function available in AppContext");
          showError("Could not save goal. Please try again later.");
          
          setUiState(prev => ({
            ...prev,
            isLoading: false,
            saveAttempted: false
          }));
        }
      } else {
        // Updating an existing goal
        if (typeof updateGoal === 'function') {
          // Use the updateGoal function
          console.log('[GoalDetailsScreen] Calling updateGoal function');
          updateGoal(goal);
          showSuccess('Goal updated successfully');
          
          setUiState(prev => ({
            ...prev,
            hasUnsavedChanges: false,
            isLoading: false
          }));
          
          // Use a timeout to ensure state updates before navigation
          saveTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
              navigation.goBack();
            }
          }, 300);
        } else {
          // Try alternative functions that might exist
          const updateFunction = appContext.updateMainGoal || appContext.saveGoal;
          
          if (typeof updateFunction === 'function') {
            updateFunction(goal);
            showSuccess('Goal updated successfully');
            
            setUiState(prev => ({
              ...prev,
              hasUnsavedChanges: false,
              isLoading: false
            }));
            
            // Use a timeout to ensure state updates before navigation
            saveTimeoutRef.current = setTimeout(() => {
              if (isMounted.current) {
                navigation.goBack();
              }
            }, 300);
          } else {
            console.error("No goal update function available in AppContext");
            showError("Could not save goal. Please try again later.");
            
            setUiState(prev => ({
              ...prev,
              isLoading: false,
              saveAttempted: false
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      showError("An error occurred while saving the goal.");
      
      setUiState(prev => ({
        ...prev,
        isLoading: false,
        saveAttempted: false
      }));
    }
  };
  
  // Get linked projects
  const getLinkedProjects = () => {
    if (!initialGoal || !initialGoal.id || !Array.isArray(projects)) {
      return [];
    }
    
    return projects.filter(project => project.goalId === initialGoal.id);
  };
  
  // Get linked projects count
  const getLinkedProjectsCount = () => {
    return getLinkedProjects().length;
  };
  
  // Get all tasks associated with a project
  const getTasksForProject = (projectId) => {
    if (!Array.isArray(tasks) || !projectId) {
      return [];
    }
    
    return tasks.filter(task => task.projectId === projectId);
  };
  
  // Handle delete confirmation with warning about linked projects
  const handleDeleteConfirmation = () => {
    const linkedProjectsCount = getLinkedProjectsCount();
    
    // Create the warning message based on whether there are linked projects
    const warningMessage = linkedProjectsCount > 0
      ? `Are you sure you want to delete this goal? This will also delete ${linkedProjectsCount} linked ${linkedProjectsCount === 1 ? 'project' : 'projects'} and all their tasks. This action cannot be undone.`
      : 'Are you sure you want to delete this goal? This action cannot be undone.';
    
    Alert.alert(
      'Delete Goal',
      warningMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete',
          style: 'destructive',
          onPress: handleDelete
        }
      ]
    );
  };
  
  // Handle delete with more thorough cleanup approach
  const handleDelete = async () => {
    if (!initialGoal) {
      showError('Cannot delete: Goal not found');
      return;
    }

    try {
      setUiState(prev => ({
        ...prev,
        isLoading: true
      }));
      
      // Get linked projects
      const linkedProjects = getLinkedProjects();
      const linkedProjectIds = linkedProjects.map(project => project.id);

      // Get all tasks associated with linked projects
      const tasksToDelete = [];
      linkedProjects.forEach(project => {
        const projectTasks = getTasksForProject(project.id);
        tasksToDelete.push(...projectTasks);
      });
      
      // Log what we're deleting for debugging
      console.log(`Deleting goal: ${initialGoal.id}`);
      console.log(`Deleting ${linkedProjects.length} projects:`, linkedProjectIds);
      console.log(`Deleting ${tasksToDelete.length} tasks`);
      
      // APPROACH 1: Direct AsyncStorage manipulation to ensure complete cleanup
      try {
        // Load current data from AsyncStorage
        const storedGoals = await AsyncStorage.getItem('goals');
        const storedProjects = await AsyncStorage.getItem('projects');
        const storedTasks = await AsyncStorage.getItem('tasks');
        
        // Remove the goal from storage
        if (storedGoals) {
          const goalsData = JSON.parse(storedGoals);
          const updatedGoals = goalsData.filter(goal => goal.id !== initialGoal.id);
          await AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
          console.log('Directly removed goal from AsyncStorage');
        }
        
        // Remove all linked projects from storage
        if (storedProjects && linkedProjectIds.length > 0) {
          const projectsData = JSON.parse(storedProjects);
          // IMPORTANT CHANGE: Remove ALL projects linked to this goal
          const updatedProjects = projectsData.filter(project => 
            !linkedProjectIds.includes(project.id) && project.goalId !== initialGoal.id
          );
          await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
          console.log(`Directly removed ${projectsData.length - updatedProjects.length} projects from AsyncStorage`);
        }
        
        // Remove all tasks from deleted projects
        if (storedTasks && linkedProjectIds.length > 0) {
          const tasksData = JSON.parse(storedTasks);
          const updatedTasks = tasksData.filter(task => 
            !linkedProjectIds.includes(task.projectId)
          );
          await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
          console.log(`Directly removed ${tasksData.length - updatedTasks.length} tasks from AsyncStorage`);
        }
      } catch (storageError) {
        console.error('Failed direct AsyncStorage cleanup:', storageError);
        // Continue with other approaches even if direct cleanup fails
      }
      
      // APPROACH 2: Try using context state update functions if available
      if (typeof setProjects === 'function' && typeof setTasks === 'function') {
        // Remove projects linked to this goal
        setProjects(prevProjects => 
          prevProjects.filter(project => 
            !linkedProjectIds.includes(project.id) && project.goalId !== initialGoal.id
          )
        );
        
        // Remove tasks linked to those projects
        setTasks(prevTasks => 
          prevTasks.filter(task => !linkedProjectIds.includes(task.projectId))
        );
      }
      
      // APPROACH 3: Try individual deletion functions if available
      if (typeof deleteProject === 'function') {
        for (const project of linkedProjects) {
          try {
            await deleteProject(project.id);
          } catch (error) {
            console.error(`Failed to delete project ${project.id}:`, error);
          }
        }
      }
      
      // Now delete the goal itself using available methods
      if (typeof deleteGoal === 'function') {
        await deleteGoal(initialGoal.id);
      } else if (typeof appContext.deleteMainGoal === 'function') {
        await appContext.deleteMainGoal(initialGoal.id);
      } else if (typeof appContext.removeGoal === 'function') {
        await appContext.removeGoal(initialGoal.id);
      } else {
        console.error('No function available to delete goal');
      }
      
      // Force a refresh of the app data
      if (typeof appContext.refreshData === 'function') {
        await appContext.refreshData();
      }
      
      // Notify success and navigate back
      showSuccess('Goal deleted successfully');
      
      setUiState(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        isLoading: false
      }));
      
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting goal:', error);
      showError('Failed to delete goal. Please try again.');
      
      setUiState(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  // Get active notification count
  const getActiveNotificationCount = () => {
    return Object.values(goalState.notifPrefs).filter(value => value).length;
  };

  // Scroll to input on focus
  const handleInputFocus = (yOffset) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yOffset, animated: true });
    }
  };
  
  // Rendering helper
  const renderLoadingOverlay = () => {
    if (!uiState.isLoading) return null;
    
    return (
      <View style={styles.loadingOverlay}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.card }]}>
          <ActivityIndicator size="large" color={goalState.selectedColor} />
          <Text 
            style={[
              styles.loadingText, 
              { 
                color: theme.text,
                fontSize: fontSizes.m
              }
            ]}
            maxFontSizeMultiplier={1.5}
            accessibilityLiveRegion="polite"
          >
            {isCreating ? 'Creating Goal...' : 'Updating Goal...'}
          </Text>
        </View>
      </View>
    );
  };

  // Calculate minimum touch target size
  const minTouchSize = Math.max(scaleWidth(44), accessibility.minTouchTarget);

  return (
    <SafeAreaView style={[
      styles.container, 
      { 
        backgroundColor: theme.background,
        paddingTop: insets.top,
        // Removed paddingBottom: insets.bottom to fix the extra space issue
      }
    ]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header with Back and Save buttons */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
          disabled={uiState.isLoading}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
          accessibilityState={{ disabled: uiState.isLoading }}
        >
          <Ionicons name="arrow-back" size={scaleWidth(24)} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter} />
        
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            { backgroundColor: goalState.selectedColor },
            uiState.isLoading && { opacity: 0.6 }
          ]}
          onPress={handleSave}
          disabled={uiState.isLoading}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Save goal"
          accessibilityHint="Saves your goal changes"
          accessibilityState={{ disabled: uiState.isLoading }}
        >
          <Ionicons name="save-outline" size={scaleWidth(18)} color="#000000" />
          <Text 
            style={styles.saveButtonText}
            maxFontSizeMultiplier={1.5}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        accessible={true}
        accessibilityLabel="Goal details"
      >
        {/* Goal Preview */}
        <GoalPreview 
          title={goalState.title} 
          selectedIcon={goalState.selectedIcon} 
          selectedColor={goalState.selectedColor} 
          getTotalProgress={getTotalProgress} 
          navigateToProgressView={navigateToProgressView} 
          isCreating={isCreating} 
          theme={theme} 
        />
        
        {/* Section Navigation */}
        <View style={styles.tabsContainer}>
          <SectionHeader 
            title="General" 
            icon="information-circle-outline" 
            isActive={uiState.activeSection === 'general'}
            onPress={() => setActiveSection('general')}
            selectedColor={goalState.selectedColor}
            theme={theme}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel="General section"
            accessibilityState={{ selected: uiState.activeSection === 'general' }}
          />
          <SectionHeader 
            title="Advanced" 
            icon="settings-outline" 
            isActive={uiState.activeSection === 'advanced'}
            onPress={() => setActiveSection('advanced')}
            selectedColor={goalState.selectedColor}
            theme={theme}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel="Advanced section"
            accessibilityState={{ selected: uiState.activeSection === 'advanced' }}
          />
        </View>
        
        {/* General Section */}
        {uiState.activeSection === 'general' && (
          <GeneralSection
            theme={theme}
            title={goalState.title}
            setTitle={handleTitleChange}
            description={goalState.description}
            setDescription={handleDescriptionChange}
            selectedIcon={goalState.selectedIcon}
            setSelectedIcon={handleIconChange}
            selectedColor={goalState.selectedColor}
            setSelectedColor={handleColorChange}
            hasTargetDate={goalState.hasTargetDate}
            setHasTargetDate={toggleTargetDate}
            targetDate={goalState.targetDate}
            setTargetDate={(date) => setGoalState(prev => ({ ...prev, targetDate: date }))}
            showDatePicker={uiState.showDatePicker}
            setShowDatePicker={toggleDatePicker}
            handleDateChange={handleDateChange}
            titleInputRef={titleInputRef}
            descriptionInputRef={descriptionInputRef}
            handleInputFocus={handleInputFocus}
            datePickerMode={uiState.datePickerMode}
            toggleDatePickerMode={(mode) => setUiState(prev => ({ ...prev, datePickerMode: mode }))}
          />
        )}
        
        {/* Advanced Section */}
        {uiState.activeSection === 'advanced' && (
          <AdvancedSection
            theme={theme}
            selectedColor={goalState.selectedColor}
            isCreating={isCreating}
            navigateToProgressView={navigateToProgressView}
            setNotificationsModal={(visible) => toggleNotificationsModal(visible)}
            expandedSection={uiState.expandedSection}
            setExpandedSection={toggleExpandedSection}
            getActiveNotificationCount={getActiveNotificationCount}
            getLinkedProjects={getLinkedProjects}
            projectsToShare={goalState.projectsToShare}
            toggleProjectSharing={toggleProjectSharing}
            shareFormat={goalState.shareFormat}
            setShareFormat={setShareFormat}
            copyToClipboard={copyToClipboard}
            handleShareGoal={handleShareGoal}
            getLinkedProjectsCount={getLinkedProjectsCount}
            handleDeleteConfirmation={handleDeleteConfirmation}
            isLoading={uiState.isLoading}
          />
        )}
        
      </ScrollView>

      {/* Notification Preferences Modal */}
      <NotificationModal
        visible={uiState.notificationsModal}
        theme={theme}
        selectedColor={goalState.selectedColor}
        notifPrefs={goalState.notifPrefs}
        toggleNotificationPreference={toggleNotificationPreference}
        onClose={() => toggleNotificationsModal(false)}
      />

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        visible={uiState.showUnsavedChangesModal}
        theme={theme}
        selectedColor={goalState.selectedColor}
        onCancel={() => setUiState(prev => ({ ...prev, showUnsavedChangesModal: false }))}
        onDiscard={discardChangesAndGoBack}
        onSave={() => {
          setUiState(prev => ({ ...prev, showUnsavedChangesModal: false }));
          handleSave();
        }}
      />
      
      {/* Loading Overlay */}
      {renderLoadingOverlay()}
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    height: scaleHeight(60),
    width: '100%',
  },
  headerCenter: {
    flex: 1,
  },
  backButton: {
    // FIXED: Further adjusted to move button upward
    padding: spacing.s,
    paddingBottom: spacing.m,
    paddingTop: 0, // No top padding to move it up more
    minWidth: accessibility.minTouchTarget,
    minHeight: accessibility.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -5, // Increased negative margin to move it up more
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: scaleWidth(20),
    minHeight: accessibility.minTouchTarget,
  },
  saveButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    color: '#000000',
    marginLeft: spacing.s,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: scaleHeight(100),
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    borderRadius: scaleWidth(12),
    overflow: 'hidden',
    backgroundColor: '#1E1E1E',
    height: scaleHeight(50),
  },
  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  loadingContainer: {
    padding: spacing.l,
    borderRadius: scaleWidth(12),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: scaleWidth(200),
    height: scaleHeight(120),
  },
  loadingText: {
    marginTop: spacing.s,
    fontSize: fontSizes.m,
    fontWeight: '500',
  }
});

export default GoalDetailsScreen;