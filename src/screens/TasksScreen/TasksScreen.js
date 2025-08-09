// src/screens/TasksScreen/TasksScreen.js
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
import PagerView from 'react-native-pager-view';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

const Tab = createMaterialTopTabNavigator();
import GoalFilters from './components/GoalFilters';
import ProjectsList from './components/ProjectsList';
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

// Import the new TaskViewModeToggle component
import TaskViewModeToggle from './components/TaskViewModeToggle';

// Import subscription UI components
import { 
  FeatureLimitBanner, 
  LimitReachedView, 
  ProBadge,
  AILimitReachedModal
} from '../../components/subscription/SubscriptionUI';

// Import subscription service constants
import { FREE_PLAN_LIMITS, checkProjectsPerGoalLimit } from '../../services/SubscriptionService';

const { width, height } = Dimensions.get('window');

const TasksScreen = ({ route, navigation }) => {
  // Get safe area insets and safe spacing to prevent the UI from being cut off
  const insets = useSafeAreaInsets();
  const safeSpacing = useSafeSpacing();
  
  const { theme } = useTheme();
  const { 
    projects, 
    tasks, 
    mainGoals, 
    goals, 
    updateProject,
    updateProjectProgress,
    updateGoal,
    updateTask,
    cleanupOrphanedProjects,
    forceDataReset,
    refreshData,
    canAddMoreProjectsToGoal,
    userSubscriptionStatus
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
  const [activeTab, setActiveTab] = useState(0); // 0 = list, 1 = kanban
  
  // Create navigation state object for controlled navigation
  const [navigationState, setNavigationState] = useState({
    index: 0,
    routes: [
      { key: 'list', name: 'List' },
      { key: 'kanban', name: 'Kanban' }
    ]
  });
  
  // Sync navigationState with activeTab
  useEffect(() => {
    if (navigationState.index !== activeTab) {
      setNavigationState(prev => ({ ...prev, index: activeTab }));
    }
  }, [activeTab]);
  
  // New state for task/project view mode toggle
  const [viewMode, setViewMode] = useState('projects'); // 'projects' or 'tasks'
  
  // State for subscription limit banner
  const [showLimitBanner, setShowLimitBanner] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const limitBannerAnimation = useRef(new Animated.Value(-100)).current;
  
  // State for project limit modal
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [projectLimitData, setProjectLimitData] = useState({
    projectCount: 0,
    maxAllowed: FREE_PLAN_LIMITS?.MAX_PROJECTS_PER_GOAL || 2
  });
  
  // State for upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  
  // Note: Removed PagerView refs since we're now using React Navigation
  
  // New state for kanban full-screen mode
  const [kanbanFullScreen, setKanbanFullScreen] = useState(false);
  // State to preserve which tab was active when entering full-screen
  const [tabBeforeFullScreen, setTabBeforeFullScreen] = useState(null);
  
  // Ref for the tab navigator to manually control navigation
  const tabNavigatorRef = useRef(null);
  
  // Custom function to handle full-screen state changes with tab preservation
  const handleKanbanFullScreenChange = (isFullScreen) => {
    if (isFullScreen) {
      // Entering full-screen - save current tab
      console.log('Entering full-screen, saving activeTab:', activeTab);
      setTabBeforeFullScreen(activeTab);
      setKanbanFullScreen(true);
    } else {
      // Exiting full-screen
      console.log('Exiting full-screen, restoring tab to:', tabBeforeFullScreen);
      
      // If we were on Kanban tab, set navigation state to Kanban BEFORE setting full-screen to false
      if (tabBeforeFullScreen === 1) {
        console.log('Setting navigation state to Kanban before exiting full-screen');
        setNavigationState({
          index: 1,
          routes: [
            { key: 'list', name: 'List' },
            { key: 'kanban', name: 'Kanban' }
          ]
        });
        setActiveTab(1);
      }
      
      // Then set full-screen to false
      setKanbanFullScreen(false);
      
      // Clear the saved state
      setTimeout(() => {
        setTabBeforeFullScreen(null);
      }, 100);
    }
  };
  
  // Separate collapsed states for "all" view and specific goal views
  const [allViewCollapsedSections, setAllViewCollapsedSections] = useState({});
  const [specificGoalCollapsedSections, setSpecificGoalCollapsedSections] = useState({});
  const sectionsInitialized = useRef(false);
  
  // Confetti state for project completion
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiColors, setConfettiColors] = useState(['#4CAF50', '#8BC34A', '#CDDC39', '#2E7D32', '#1B5E20']);
  
  // Animation values for add button and view transitions
  const addButtonScale = useRef(new Animated.Value(1)).current;
  const contentFadeOpacity = useRef(new Animated.Value(1)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  
  // Animation value for goal switching - uses 0-3 range for better control
  const goalSwitchAnim = useRef(new Animated.Value(3)).current;
  
  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [draggingProject, setDraggingProject] = useState(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [projectLayout, setProjectLayout] = useState({});
  const [dropZoneY, setDropZoneY] = useState(null);
  const [activeProjectSection, setActiveProjectSection] = useState(null);
  
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
  
  // Function to verify project data consistency
  const verifyProjectDataConsistency = async () => {
    setIsVerifying(true);
    try {
      // Get data directly from storage
      const projectsJson = await AsyncStorage.getItem('projects');
      const goalsJson = await AsyncStorage.getItem('goals');
      
      if (!projectsJson || !goalsJson) {
        console.warn('Cannot verify: projects or goals not found in storage');
        return;
      }
      
      // Parse the data
      const storedProjects = JSON.parse(projectsJson);
      const storedGoals = JSON.parse(goalsJson);
      
      if (!Array.isArray(storedProjects) || !Array.isArray(storedGoals)) {
        console.warn('Invalid data format in storage');
        return;
      }
      
      // Get valid goal IDs
      const validGoalIds = storedGoals.map(goal => goal.id);
      
      // Only count projects with valid goal IDs - NO INDEPENDENT PROJECTS!
      const validProjects = storedProjects.filter(project => 
        project.goalId && validGoalIds.includes(project.goalId)
      );
      
      // Log verification results
      console.log('Project verification results:');
      console.log(`- Storage contains ${storedProjects.length} total projects`);
      console.log(`- ${validProjects.length} projects have valid goal IDs`);
      console.log(`- ${storedProjects.length - validProjects.length} independent or orphaned projects detected`);
      console.log(`- Memory contains ${Array.isArray(projects) ? projects.length : 0} projects`);
      
      // DISABLED AUTO-REPAIR: This was interfering with clean deletion process
      // Log what we found but don't automatically "fix" it
      if (storedProjects.length !== validProjects.length ||
          (Array.isArray(projects) && projects.length !== validProjects.length)) {
        
        console.log('DETECTED DATA DISCREPANCY (not auto-fixing):');
        console.log(`- Storage projects: ${storedProjects.length}`);
        console.log(`- Valid projects: ${validProjects.length}`);
        console.log(`- Memory projects: ${Array.isArray(projects) ? projects.length : 0}`);
        console.log('Auto-repair disabled to prevent interference with deletion process');
        
        // Only show alert if discrepancy is large (more than normal deletion variance)
        const discrepancy = Math.abs(storedProjects.length - validProjects.length);
        if (discrepancy > 2) {
          Alert.alert(
            'Data Discrepancy Detected',
            `Found ${discrepancy} orphaned projects. Use Profile > Debug Storage to clean up if needed.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        console.log('No project data inconsistencies detected');
      }
    } catch (error) {
      console.error('Error verifying project data:', error);
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
      // if (typeof cleanupOrphanedProjects === 'function') {
      //   await cleanupOrphanedProjects();
      // }
      
      // Only verify data consistency (no auto-repair)
      await verifyProjectDataConsistency();
    };
    
    initialSetup();
  }, []);
  
  // Check for System Builder achievement when projects or goals change
  useEffect(() => {
    // Make sure we have valid data first
    if (Array.isArray(projects) && projects.length > 0 && 
        Array.isArray(goals) && goals.length > 0) {
      try {
        // Track system builder achievement
        FeatureExplorerTracker.trackSystemBuilder(goals, projects, notification?.showSuccess);
      } catch (error) {
        console.error('Error tracking system builder achievement:', error);
      }
    }
  }, [projects, goals, notification]);

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
  
  // Note: Removed old PagerView event handlers since we're now using React Navigation
  
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
  
  // Generate confetti colors based on project color
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

  // NEW FUNCTION: Get tasks filtered by goal and view mode
  const getFilteredTasks = () => {
    // Ensure tasks is an array before filtering
    if (!Array.isArray(tasks)) {
      console.warn('Tasks is not an array:', tasks);
      return [];
    }
    
    // First filter out orphaned tasks (tasks with goal IDs that don't exist)
    const goalsToUse = Array.isArray(mainGoals) && mainGoals.length > 0 ? mainGoals : goals;
    const validGoalIds = Array.isArray(goalsToUse) ? goalsToUse.map(goal => goal.id) : [];
    
    // Filter out tasks with completed goals
    const completedGoalIds = Array.isArray(goalsToUse) 
      ? goalsToUse.filter(goal => goal.completed).map(goal => goal.id)
      : [];
    
    // Get projects first to map tasks to goals
    const validProjects = Array.isArray(projects) ? projects.filter(project => 
      project.goalId && validGoalIds.includes(project.goalId) &&
      !completedGoalIds.includes(project.goalId)
    ) : [];
    
    // Create a map of projectId -> goalId for quick lookups
    const projectGoalMap = {};
    validProjects.forEach(project => {
      projectGoalMap[project.id] = project.goalId;
    });
    
    // Filter tasks based on the selected goal and valid projects
    let filtered = tasks.filter(task => {
      // Skip tasks without a projectId
      if (!task.projectId) return false;
      
      // Get the goalId for this task's project
      const goalId = projectGoalMap[task.projectId];
      
      // Skip if no goalId (orphaned task)
      if (!goalId) return false;
      
      // Skip tasks in completed goals
      if (completedGoalIds.includes(goalId)) return false;
      
      // Apply goal filter if not "all"
      if (selectedGoalId !== 'all' && goalId !== selectedGoalId) return false;
      
      return true;
    });
    
    return filtered;
  };
  
  // Filter projects based on selected goal
  const getFilteredProjects = () => {
    // Ensure projects is an array before filtering
    if (!Array.isArray(projects)) {
      console.warn('Projects is not an array:', projects);
      return [];
    }
    
    // First filter out orphaned projects (projects with goal IDs that don't exist)
    const goalsToUse = Array.isArray(mainGoals) && mainGoals.length > 0 ? mainGoals : goals;
    const validGoalIds = Array.isArray(goalsToUse) ? goalsToUse.map(goal => goal.id) : [];
    
    // Filter out projects with completed goals
    const completedGoalIds = Array.isArray(goalsToUse) 
      ? goalsToUse.filter(goal => goal.completed).map(goal => goal.id)
      : [];
    
    // Filter out ALL projects with no goalId and ensure goalId exists in validGoalIds
    let filtered = [...projects].filter(project => 
      // Only include projects with a valid goalId
      (project.goalId && validGoalIds.includes(project.goalId)) &&
      // Exclude projects with completed goals
      (!project.goalId || !completedGoalIds.includes(project.goalId))
    );
    
    // Apply goal filter if not "all"
    if (selectedGoalId !== 'all') {
      filtered = filtered.filter(project => project.goalId === selectedGoalId);
    }
    
    return filtered;
  };
  
  // Get the appropriate items based on current view mode
  const getItemsForCurrentView = () => {
    if (viewMode === 'projects') {
      return getFilteredProjects();
    } else {
      return getFilteredTasks();
    }
  };
  
  // Count projects for the selected goal
  const countProjectsForSelectedGoal = () => {
    if (selectedGoalId === 'all') return 0;
    
    return getFilteredProjects().filter(project => 
      project.goalId === selectedGoalId
    ).length;
  };
  
  // Check if the current goal has reached its project limit
  const hasReachedProjectLimit = () => {
    // Pro users have no limits
    if (isPro) return false;
    
    // "All" view has no specific goal limit
    if (selectedGoalId === 'all') return false;
    
    // Count projects for the selected goal
    const projectCount = countProjectsForSelectedGoal();
    
    // Get the limit with a fallback
    const projectLimit = FREE_PLAN_LIMITS?.MAX_PROJECTS_PER_GOAL || 2;
    
    // Check against the project limit (2)
    return projectCount >= projectLimit;
  };
  
  // Check if a project has reached its task limit
  const hasReachedTaskLimit = (projectId) => {
    // Pro users have no limits
    if (isPro) return false;
    
    // Get tasks for this project
    const projectTasks = getTasksForProject(projectId);
    
    // Get the limit with a fallback
    const taskLimit = FREE_PLAN_LIMITS?.MAX_TASKS_PER_PROJECT || 5;
    
    // Check against the task limit (5)
    return projectTasks.length >= taskLimit;
  };
  
  // Get tasks for a specific project
  const getTasksForProject = (projectId) => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => task.projectId === projectId);
  };
  
  // Sort projects by order property
  const sortProjectsByOrder = (projectsArray) => {
    return [...projectsArray].sort((a, b) => {
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

  // MODIFIED: Group tasks by both goal and project for section list
  const getSectionedTasks = () => {
    const filteredTasks = getFilteredTasks();
    
    // Group tasks by goalId and then by projectId
    const tasksByGoalAndProject = {};
    
    // Use mainGoals if available, otherwise use goals
    const goalsToUse = Array.isArray(mainGoals) && mainGoals.length > 0 ? mainGoals : goals;
    
    // Create a projectId -> goalId map and collect project info
    const projectGoalMap = {};
    const projectsInfo = {};
    
    if (Array.isArray(projects)) {
      projects.forEach(project => {
        if (project.goalId) {
          projectGoalMap[project.id] = project.goalId;
          projectsInfo[project.id] = {
            id: project.id,
            title: project.title,
            color: project.color,
            status: project.status,
            progress: project.progress || 0,
            goalId: project.goalId,
            icon: 'folder-outline', // Icon for project sections
            isProject: true // Flag to identify project sections
          };
        }
      });
    }
    
    // Initialize goal sections
    if (Array.isArray(goalsToUse)) {
      goalsToUse.forEach(goal => {
        // Skip completed goals
        if (!goal || !goal.id || goal.completed) return;
        
        tasksByGoalAndProject[goal.id] = {
          ...goal,
          data: [],           // This will now contain project sections instead of tasks
          isGoal: true,       // Flag to identify goal sections
          subSections: {}     // Object to hold project sections keyed by project ID
        };
      });
    }
    
    // Group tasks by their project and goal
    filteredTasks.forEach(task => {
      const projectId = task.projectId;
      if (!projectId || !projectsInfo[projectId]) return; // Skip tasks without valid project
      
      const goalId = projectGoalMap[projectId];
      if (!goalId || !tasksByGoalAndProject[goalId]) return; // Skip if goal is invalid
      
      // Initialize project section if it doesn't exist
      if (!tasksByGoalAndProject[goalId].subSections[projectId]) {
        tasksByGoalAndProject[goalId].subSections[projectId] = {
          ...projectsInfo[projectId],
          data: []  // Array to hold tasks for this project
        };
      }
      
      // Add task to the project section
      tasksByGoalAndProject[goalId].subSections[projectId].data.push(task);
    });
    
    // Convert to array format for SectionList and filter out empty sections
    const sectionsArray = Object.values(tasksByGoalAndProject).filter(goalSection => {
      // Get all project sections for this goal
      const projectSections = Object.values(goalSection.subSections);
      
      // Skip goals with no projects or no tasks
      if (projectSections.length === 0) return false;
      
      // Add project sections to goal's data array (for SectionList)
      goalSection.data = projectSections;
      
      return true;
    });
    
    return sectionsArray;
  };
  
  // Prepare data for section list grouped by goals
  const getSectionedProjects = () => {
    const filteredProjects = getFilteredProjects();
    
    // Group projects by goalId
    const projectsByGoal = {};
    
    // Use mainGoals if available, otherwise use goals
    const goalsToUse = Array.isArray(mainGoals) && mainGoals.length > 0 ? mainGoals : goals;
    
    // Ensure we have an array of goals to work with
    if (Array.isArray(goalsToUse)) {
      // Add other goals with their projects
      goalsToUse.forEach(goal => {
        // Skip completed goals - additional check
        if (!goal || !goal.id || goal.completed) return; 
        
        const goalProjects = filteredProjects.filter(project => project.goalId === goal.id);
        if (goalProjects.length > 0) {
          projectsByGoal[goal.id] = {
            ...goal,
            data: sortProjectsByOrder(goalProjects), // Sort by order
            isGoal: true // Add flag to identify goal sections
          };
        }
      });
    }
    
    // Convert to array format for SectionList
    return Object.values(projectsByGoal).filter(section => section.data.length > 0);
  };

  // Get the right sectioned data based on current view mode
  const getSectionedData = () => {
    if (viewMode === 'projects') {
      return getSectionedProjects();
    } else {
      return getSectionedTasks();
    }
  };
  
  // Function to update project progress - using the atomic update function if available
  const handleUpdateProjectProgress = async (projectId, newProgress) => {
    // Get the project to update
    const projectToUpdate = projects.find(p => p.id === projectId);
    if (!projectToUpdate) return;
    
    try {
      // Check if this is a project completion (0 or other -> 100)
      const wasCompleted = projectToUpdate.status === 'done' || projectToUpdate.completed;
      const isNowCompleted = newProgress === 100;
      
      // If project is being completed (not already completed), show confetti!
      if (!wasCompleted && isNowCompleted) {
        console.log("COMPLETING PROJECT! Triggering confetti for:", projectToUpdate.title);
        
        // Set confetti colors based on project color
        setConfettiColors(getConfettiColors(projectToUpdate.color));
        
        // Show confetti
        setShowConfetti(true);
      }
      
      // First, try to use the atomic update function if available
      if (typeof updateProjectProgress === 'function') {
        // Use it with proper error handling - this will update status but preserve task-based progress
        const success = await updateProjectProgress(projectId, newProgress);
        
        if (success) {
          // Show success notification
          if (notification && notification.showSuccess) {
            notification.showSuccess(`Project moved to ${newProgress === 0 ? 'To Do' : newProgress === 100 ? 'Done' : 'In Progress'}`);
          }
          
          // Note: Removed refreshData call to prevent overriding completion status
          // The updateProjectProgress function already updates state and storage
          console.log('Project progress update completed successfully');
        } else {
          // Show error notification
          if (notification && notification.showError) {
            notification.showError("Failed to update project. Please try again.");
          }
        }
        return;
      }
      
      // Fall back to the old method if the new function isn't available
      console.log(`Updating project ${projectId} progress to ${newProgress}%`);
      
      // Determine status based on progress
      const newStatus = newProgress === 0 ? 'todo' : 
                       newProgress === 50 ? 'in_progress' : 
                       newProgress === 100 ? 'done' : projectToUpdate.status;
      
      // Create updated project
      const updatedProject = {
        ...projectToUpdate,
        status: newStatus, // Set explicit status property
        statusProgress: newProgress, // Store status indicator value
        // Don't directly set progress - let AppContext handle task-based calculation
        completed: newProgress === 100, // Only mark as completed if 100%
        updatedAt: new Date().toISOString()
      };
      
      updateProject(updatedProject);
      
      // Show success notification
      if (notification && notification.showSuccess) {
        notification.showSuccess(`Project moved to ${newProgress === 0 ? 'To Do' : newProgress === 100 ? 'Done' : 'In Progress'}`);
      }
      
      // Force update goal progress
      if (projectToUpdate.goalId) {
        // Calculate goal progress if we can
        const projectsForGoal = projects.filter(p => p.goalId === projectToUpdate.goalId);
        const completedProjects = projectsForGoal.filter(p => 
          p.id === projectId ? newProgress === 100 : (p.progress === 100 || p.completed || p.status === 'done')
        ).length;
        
        const newGoalProgress = Math.round((completedProjects / projectsForGoal.length) * 100);
        
        // Find the goal
        const goalToUpdate = goals.find(g => g.id === projectToUpdate.goalId);
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
      console.error("Error updating project progress:", error);
      
      // Show error notification
      if (notification && notification.showError) {
        notification.showError("An error occurred. Please try again.");
      }
    }
  };

  // Handle view mode change
  const handleViewModeChange = () => {
    // Animate the button
    animateToggleButton();
    
    // Toggle the view mode
    const newViewMode = viewMode === 'projects' ? 'tasks' : 'projects';
    setViewMode(newViewMode);
    
    // Update params at the current navigator level
    navigation.setParams({ viewMode: newViewMode });
    
    // Update params at the ROOT tab navigator level
    const rootNavigation = navigation.getParent();
    if (rootNavigation) {
      rootNavigation.setParams({ viewMode: newViewMode });
    }
    
    // Note: No need to reset tabs since React Navigation handles this
  };
  
  // Handle project status change in list view
  const handleChangeProjectStatus = (projectId, newStatus) => {
    console.log(`🎯 [UI DEBUG] handleChangeProjectStatus called - Project: ${projectId}, Status: ${newStatus}`);
    // Get the project to update
    const projectToUpdate = projects.find(p => p.id === projectId);
    if (!projectToUpdate) {
      console.log(`🎯 [UI DEBUG] Project not found: ${projectId}`);
      return;
    }
    console.log(`🎯 [UI DEBUG] Found project to update: ${projectToUpdate.title} (current status: ${projectToUpdate.status})`);
    
    
    // Convert status to status indicator value
    let statusIndicator;
    if (newStatus === 'todo') statusIndicator = 0;
    else if (newStatus === 'in_progress') statusIndicator = 50;
    else if (newStatus === 'done') statusIndicator = 100;
    
    console.log(`[TasksScreen] Changing project ${projectId} status to ${newStatus}`);
    
    // Check if this is a project completion (not already completed -> done)
    const wasCompleted = projectToUpdate.status === 'done' || projectToUpdate.completed;
    const isNowCompleted = newStatus === 'done';
    
    // If project is being completed (not already completed), show confetti!
    if (!wasCompleted && isNowCompleted) {
      console.log("COMPLETING PROJECT! Triggering confetti for:", projectToUpdate.title);
      
      // Set confetti colors based on project color
      setConfettiColors(getConfettiColors(projectToUpdate.color));
      
      // Show confetti
      setShowConfetti(true);
    }
    
    // Call the updateProjectProgress function which will handle preserving the task-based progress
    if (typeof updateProjectProgress === 'function') {
      updateProjectProgress(projectId, statusIndicator);
    } else {
      // Fallback if the atomic update function isn't available
      const updatedProject = {
        ...projectToUpdate,
        status: newStatus,
        completed: newStatus === 'done',
        updatedAt: new Date().toISOString()
      };
      
      updateProject(updatedProject);
    }
    
    // Show success notification and animate
    if (notification && notification.showSuccess) {
      notification.showSuccess(`Project moved to ${newStatus === 'todo' ? 'To Do' : newStatus === 'in_progress' ? 'In Progress' : 'Done'}`);
    }
  };
  
  // Render project actions menu
  const showProjectActionsMenu = (project) => {
    // Determine current status based on status property first, then progress
    const currentStatus = 
      project.status ? project.status :
      project.progress === 0 ? 'todo' :
      project.progress === 100 ? 'done' : 'in_progress';
    
    // Create action items based on current status
    const actions = [];
    
    // Add status change options
    if (currentStatus !== 'todo') {
      actions.push({
        text: 'Move to To Do',
        onPress: () => handleChangeProjectStatus(project.id, 'todo')
      });
    }
    
    if (currentStatus !== 'in_progress') {
      actions.push({
        text: 'Move to In Progress',
        onPress: () => handleChangeProjectStatus(project.id, 'in_progress')
      });
    }
    
    if (currentStatus !== 'done') {
      actions.push({
        text: 'Move to Done',
        onPress: () => handleChangeProjectStatus(project.id, 'done')
      });
    }
    
    // Add edit option
    actions.push({
      text: 'Edit Project',
      onPress: () => navigation.navigate('ProjectDetails', { projectId: project.id, mode: 'edit' })
    });
    
    // Show the action menu
    Alert.alert(
      project.title,
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
    const projectId = task.projectId;
    const project = projects.find(p => p.id === projectId);
    if (project) {
      actions.push({
        text: 'View in Project',
        onPress: () => navigation.navigate('ProjectDetails', { 
          projectId: projectId, 
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
  
  // Handle project press in Kanban view
  const handleKanbanProjectPress = (project) => {
    navigation.navigate('ProjectDetails', { projectId: project.id, mode: 'edit' });
  };

  // NEW FUNCTION: Handle task press in Kanban view
  const handleKanbanTaskPress = (task) => {
    const projectId = task.projectId;
    if (projectId) {
      navigation.navigate('ProjectDetails', { 
        projectId: projectId, 
        mode: 'edit',
        initialTask: task.id
      });
    }
  };
  
  // Animate toggle button
  const animateToggleButton = () => {
    Animated.sequence([
      Animated.timing(addButtonScale, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(addButtonScale, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(addButtonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
  };
  
  // Handle add project button - direct implementation instead of reference
  const handleAddProject = () => {
    // For "all" view, ask user to select a goal first
    if (selectedGoalId === 'all') {
      // Show a prompt to select a goal
      if (Array.isArray(goalsToShow) && goalsToShow.length > 0) {
        const goalOptions = goalsToShow.map(goal => ({
          text: goal.title,
          onPress: () => {
            // First select the goal
            handleGoalSelect(goal.id);
            
            // Then check if they can add more projects to this goal
            setTimeout(async () => {
              // Get the count of projects for this goal
              const projectCount = projects.filter(project => project.goalId === goal.id).length;
              
              // Check if limit reached - directly use the count for immediate feedback
              const hasReachedLimit = !isPro && projectCount >= (FREE_PLAN_LIMITS?.MAX_PROJECTS_PER_GOAL || 2);
              
              if (hasReachedLimit) {
                // Use the new upgrade modal instead of the limit modal
                showUpgradePrompt(
                  `You've reached the limit of ${FREE_PLAN_LIMITS?.MAX_PROJECTS_PER_GOAL || 2} projects per goal. Upgrade to Pro to create unlimited projects for each goal.`
                );
              } else {
                // Navigate to project creation screen
                navigation.navigate('ProjectDetails', { 
                  mode: 'create',
                  preselectedGoalId: goal.id
                });
              }
            }, 300);
          }
        }));
        
        Alert.alert(
          "Select a Goal",
          "Choose which goal to add this project to:",
          [
            ...goalOptions,
            { text: "Cancel", style: "cancel" }
          ]
        );
      } else {
        // No goals available
        Alert.alert(
          "No Goals Available",
          "You need to create a goal before adding projects.",
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
    
    // For specific goal view, directly check project count for the goal
    const projectCount = projects.filter(project => project.goalId === selectedGoalId).length;
    const hasReachedLimit = !isPro && projectCount >= (FREE_PLAN_LIMITS?.MAX_PROJECTS_PER_GOAL || 2);
    
    if (hasReachedLimit) {
      // Use the new upgrade modal instead of the limit modal
      showUpgradePrompt(
        `You've reached the limit of ${FREE_PLAN_LIMITS?.MAX_PROJECTS_PER_GOAL || 2} projects per goal. Upgrade to Pro to create unlimited projects for each goal.`
      );
      return;
    }
    
    // If user can add more projects, proceed to project creation screen
    navigation.navigate('ProjectDetails', { 
      mode: 'create',
      preselectedGoalId: selectedGoalId
    });
  };

  // Handle task status changes
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    // Get the task to update
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
    
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
      
      // Update the task
      if (typeof updateTask === 'function') {
        await updateTask(taskToUpdate.projectId, taskToUpdate.id, updatedTask);
        
        // Show success notification
        if (notification && notification.showSuccess) {
          notification.showSuccess(`Task moved to ${newStatus === 'todo' ? 'To Do' : newStatus === 'in_progress' ? 'In Progress' : 'Done'}`);
        }
        
        // Note: Removed refreshData call to prevent overriding completion status
        // The updateTask function already updates state and triggers project progress updates
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
  
  // Handle add task button
  const handleAddTask = () => {
    // For "all" view, ask user to select a goal first
    if (selectedGoalId === 'all') {
      // Show a prompt to select a goal
      if (Array.isArray(goalsToShow) && goalsToShow.length > 0) {
        const goalOptions = goalsToShow.map(goal => ({
          text: goal.title,
          onPress: () => {
            // First select the goal
            handleGoalSelect(goal.id);
            
            // Then show projects for this goal
            setTimeout(async () => {
              const projectsForGoal = projects.filter(project => project.goalId === goal.id);
              
              if (projectsForGoal.length === 0) {
                Alert.alert(
                  "No Projects Available",
                  "You need to create a project for this goal before adding tasks.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Create Project", 
                      onPress: () => navigation.navigate('ProjectDetails', { 
                        mode: 'create',
                        preselectedGoalId: goal.id
                      })
                    }
                  ]
                );
                return;
              }
              
              // If there's only one project, use it directly
              if (projectsForGoal.length === 1) {
                // Check if this project has reached task limit for free users
                const projectId = projectsForGoal[0].id;
                const hasTaskLimit = hasReachedTaskLimit(projectId);
                
                if (!isPro && hasTaskLimit) {
                  // Show upgrade prompt
                  showUpgradePrompt(
                    `You've reached the limit of ${FREE_PLAN_LIMITS?.MAX_TASKS_PER_PROJECT || 5} tasks per project. Upgrade to Pro to create unlimited tasks.`
                  );
                  return;
                }
                
                // If not at limit, proceed to task creation
                navigation.navigate('ProjectDetails', { 
                  projectId: projectId, 
                  mode: 'edit',
                  initialAction: 'addTask'
                });
                return;
              }
              
              // Otherwise, let the user select which project to add the task to
              const projectOptions = projectsForGoal.map(project => ({
                text: project.title,
                onPress: () => {
                  // Check if this project has reached task limit for free users
                  const hasTaskLimit = hasReachedTaskLimit(project.id);
                  
                  if (!isPro && hasTaskLimit) {
                    // Show upgrade prompt
                    showUpgradePrompt(
                      `You've reached the limit of ${FREE_PLAN_LIMITS?.MAX_TASKS_PER_PROJECT || 5} tasks per project. Upgrade to Pro to create unlimited tasks.`
                    );
                    return;
                  }
                  
                  // If not at limit, proceed to task creation
                  navigation.navigate('ProjectDetails', { 
                    projectId: project.id, 
                    mode: 'edit',
                    initialAction: 'addTask'
                  });
                }
              }));
              
              Alert.alert(
                "Select a Project",
                "Choose which project to add this task to:",
                [
                  ...projectOptions,
                  { text: "Cancel", style: "cancel" }
                ]
              );
            }, 300);
          }
        }));
        
        Alert.alert(
          "Select a Goal",
          "Choose which goal to add a task to:",
          [
            ...goalOptions,
            { text: "Cancel", style: "cancel" }
          ]
        );
      } else {
        // No goals available
        Alert.alert(
          "No Goals Available",
          "You need to create a goal before adding tasks.",
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
    
    // For specific goal view, check projects for the goal
    const projectsForGoal = projects.filter(project => project.goalId === selectedGoalId);
    
    if (projectsForGoal.length === 0) {
      Alert.alert(
        "No Projects Available",
        "You need to create a project for this goal before adding tasks.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Create Project", 
            onPress: () => navigation.navigate('ProjectDetails', { 
              mode: 'create',
              preselectedGoalId: selectedGoalId
            })
          }
        ]
      );
      return;
    }
    
    // If there's only one project, use it directly
    if (projectsForGoal.length === 1) {
      // Check if this project has reached task limit for free users
      const projectId = projectsForGoal[0].id;
      const hasTaskLimit = hasReachedTaskLimit(projectId);
      
      if (!isPro && hasTaskLimit) {
        // Show upgrade prompt
        showUpgradePrompt(
          `You've reached the limit of ${FREE_PLAN_LIMITS?.MAX_TASKS_PER_PROJECT || 5} tasks per project. Upgrade to Pro to create unlimited tasks.`
        );
        return;
      }
      
      // If not at limit, proceed to task creation
      navigation.navigate('ProjectDetails', { 
        projectId: projectId, 
        mode: 'edit',
        initialAction: 'addTask'
      });
      return;
    }
    
    // Otherwise, let the user select which project to add the task to
    const projectOptions = projectsForGoal.map(project => ({
      text: project.title,
      onPress: () => {
        // Check if this project has reached task limit for free users
        const hasTaskLimit = hasReachedTaskLimit(project.id);
        
        if (!isPro && hasTaskLimit) {
          // Show upgrade prompt
          showUpgradePrompt(
            `You've reached the limit of ${FREE_PLAN_LIMITS?.MAX_TASKS_PER_PROJECT || 5} tasks per project. Upgrade to Pro to create unlimited tasks.`
          );
          return;
        }
        
        // If not at limit, proceed to task creation
        navigation.navigate('ProjectDetails', { 
          projectId: project.id, 
          mode: 'edit',
          initialAction: 'addTask'
        });
      }
    }));
    
    Alert.alert(
      "Select a Project",
      "Choose which project to add this task to:",
      [
        ...projectOptions,
        { text: "Cancel", style: "cancel" }
      ]
    );
  };
  
  // Use mainGoals if available, otherwise use goals, filtering out completed goals
  const goalsToShow = Array.isArray(mainGoals) && mainGoals.length > 0 
    ? mainGoals.filter(goal => !goal.completed) 
    : Array.isArray(goals) ? goals.filter(goal => !goal.completed) : [];

  // Get section data for list rendering
  const sectionData = getSectionedData();
  
  // Calculate item counts correctly by summing the actual visible items
  const visibleItemCount = sectionData.reduce((sum, section) => sum + section.data.length, 0);
  const totalProjectCount = Array.isArray(projects) ? projects.length : 0;
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
    handleAddProject,
    handleAddTask, // NEW: Add task handler
    displayedItemCount,
    verifyProjectDataConsistency,
    viewMode, // NEW: Current view mode (projects/tasks)
    setViewMode, // NEW: Function to change view mode
    displayMode: activeTab === 0 ? 'list' : 'kanban', // Renamed from viewMode to avoid confusion
    setDisplayMode: (mode) => handleTabChange(mode === 'list' ? 0 : 1), // Renamed from setViewMode
    selectedGoalId,
    setSelectedGoalId,
    goalsToShow,
    sectionData,
    getCurrentCollapsedSections,
    getTasksForProject,
    toggleSection,
    showProjectActionsMenu,
    showTaskActionsMenu, // NEW: Task actions menu handler
    handleChangeProjectStatus,
    handleUpdateTaskStatus, // NEW: Task status update handler
    getFilteredProjects,
    getFilteredTasks, // NEW: Get tasks method
    handleKanbanProjectPress,
    handleKanbanTaskPress, // NEW: Task press handler for kanban
    handleUpdateProjectProgress,
    kanbanFilter: selectedGoalId !== 'all' ? { goalId: selectedGoalId } : null,
    totalProjectCount,
    totalTaskCount, // NEW: Total task count
    visibleItemCount,
    isVerifying,
    setDraggingProject,
    setActiveProjectSection,
    setIsDragging,
    draggingProject,
    projectLayout,
    setProjectLayout,
    isDragging,
    activeProjectSection,
    contentFadeOpacity,
    contentTranslateY,
    // Props for enhanced kanban view
    kanbanFullScreen,
    setKanbanFullScreen: handleKanbanFullScreenChange,
    // Subscription related props
    isPro,
    handleUpgradePress,
    projectLimitReached: selectedGoalId !== 'all' && !isPro && 
      countProjectsForSelectedGoal() >= (FREE_PLAN_LIMITS?.MAX_PROJECTS_PER_GOAL || 2),
    // Pass both functions to child components
    showUpgradePrompt,
    showFeatureLimitBanner,
  };



  // Check if we should show the kanban view as a full-screen overlay
  // Use tabBeforeFullScreen or activeTab to determine if we should show full-screen
  const shouldShowFullScreen = kanbanFullScreen && (tabBeforeFullScreen === 1 || activeTab === 1);
  
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
      {/* Confetti component at the top level for project completion */}
      <Confetti 
        active={showConfetti} 
        colors={confettiColors} 
        duration={4000}
        type="confetti"
        onComplete={() => setShowConfetti(false)}
      />
      
      {/* TabView with full control over navigation state */}
      <TabView
        navigationState={navigationState}
        renderScene={SceneMap({
          list: () => (
            <Animated.View style={{
              flex: 1,
              backgroundColor: theme.background,
              opacity: Animated.multiply(contentFadeOpacity, contentOpacity),
              transform: [{ translateY: contentTranslate }]
            }}>
              <GoalFilters 
                selectedGoalId={selectedGoalId}
                onGoalSelect={handleGoalSelect}
                goalsToShow={goalsToShow}
                theme={theme}
                viewMode={viewMode}
              />
              <View style={{ flex: 1, backgroundColor: theme.background }}>
                <ProjectsList taskScreenProps={taskScreenProps} />
              </View>
            </Animated.View>
          ),
          kanban: () => (
            <Animated.View style={{
              flex: 1,
              backgroundColor: theme.background,
              opacity: Animated.multiply(contentFadeOpacity, contentOpacity),
              transform: [{ translateY: contentTranslate }]
            }}>
              <GoalFilters 
                selectedGoalId={selectedGoalId}
                onGoalSelect={handleGoalSelect}
                goalsToShow={goalsToShow}
                theme={theme}
                viewMode={viewMode}
              />
              <View style={{ flex: 1, backgroundColor: '#000000' }}>
                <KanbanView taskScreenProps={taskScreenProps} />
              </View>
            </Animated.View>
          ),
        })}
        onIndexChange={(index) => {
          console.log('TabView index changed to:', index);
          setActiveTab(index);
          setNavigationState(prev => ({ ...prev, index }));
        }}
        initialLayout={{ width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{
              backgroundColor: theme.cardElevated || '#1F1F1F',
              elevation: 0,
              shadowOpacity: 0,
              borderRadius: scaleWidth(25),
              marginHorizontal: scaleWidth(20),
              marginVertical: scaleHeight(10),
              height: scaleHeight(44),
            }}
            indicatorStyle={{
              backgroundColor: theme.primary,
              height: scaleHeight(38),
              borderRadius: scaleWidth(20),
              marginBottom: 3,
              marginLeft: 3,
              width: Math.floor((width - scaleWidth(46)) / 2) - 6,
              zIndex: 1,
            }}
            activeColor="#FFFFFF"
            inactiveColor={theme.textSecondary}
            labelStyle={{
              fontSize: scaleFontSize(16),
              fontWeight: '600',
              textTransform: 'none',
              margin: 0,
            }}
            renderLabel={({ route, focused, color }) => {
              const iconName = route.key === 'list' ? 'list-outline' : 'grid';
              const label = route.key === 'list' ? 'List View' : 'Kanban View';
              
              return (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 0,
                  paddingHorizontal: scaleWidth(12),
                  height: scaleHeight(38),
                  marginTop: -scaleHeight(6), // Move content up even more
                }}>
                  <Ionicons
                    name={iconName}
                    size={scaleWidth(22)} // Slightly larger icon
                    color={color}
                    style={{ 
                      marginRight: spacing.xs,
                      marginTop: scaleHeight(1), // Fine-tune icon alignment
                    }}
                  />
                  <Text style={{
                    color: color,
                    fontSize: scaleFontSize(16), // Larger text
                    fontWeight: '600',
                    textTransform: 'none',
                    marginTop: scaleHeight(1), // Fine-tune text alignment
                  }}>
                    {label}
                  </Text>
                </View>
              );
            }}
          />
        )}
        swipeEnabled={true}
      />
      
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
              Verifying project data...
            </Text>
          </View>
        </View>
      )}

      {/* Floating Toggle Button - Fixed positioning and hit area */}
      <Animated.View style={[
        {
          position: 'absolute',
          bottom: insets.bottom - scaleHeight(20), // A bit higher
          left: scaleWidth(20),
          zIndex: 100,
          transform: [{ scale: addButtonScale }]
        }
      ]}>
        <TouchableOpacity
          style={{
            width: Math.max(scaleWidth(60), 44), // Ensure minimum touch target
            height: Math.max(scaleWidth(60), 44),
            borderRadius: Math.max(scaleWidth(60), 44) / 2,
            backgroundColor: theme.primary,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}
          onPress={handleViewModeChange}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Currently in ${viewMode} view`}
          accessibilityHint={`Toggle between projects and tasks views`}
        >
          <Animated.View style={{ 
            transform: [{ scale: addButtonScale }],
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {viewMode === 'projects' ? (
              <>
                <Ionicons 
                  name="folder-outline" 
                  size={24} 
                  color="#FFFFFF" 
                />
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: '600',
                  marginTop: 2,
                  textAlign: 'center'
                }}>
                  Projects
                </Text>
              </>
            ) : (
              <>
                <Ionicons 
                  name="list-outline" 
                  size={24} 
                  color="#FFFFFF" 
                />
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 10,
                  fontWeight: '600',
                  marginTop: 2,
                  textAlign: 'center'
                }}>
                  Tasks
                </Text>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
      
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
              {upgradeMessage || "Upgrade to Pro to create unlimited projects for each goal."}
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
      
      {/* Project Limit Modal - KEEPING AS FALLBACK */}
      <AILimitReachedModal
        visible={showLimitModal}
        theme={theme}
        usageCount={projectLimitData.projectCount}
        maxCount={projectLimitData.maxAllowed}
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
              navigation.navigate('ProjectDetails', { 
                mode: 'create',
                preselectedGoalId: selectedGoalId,
                bypassLimits: true // Add a flag to bypass limits for this creation
              });
            }
          });
        }}
      />
    </View>
  );
};

// Add styles for the new subscription UI elements
const additionalStyles = StyleSheet.create({
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