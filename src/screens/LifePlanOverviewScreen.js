// src/screens/LifePlanOverviewScreen.js
import { useState, useEffect, useRef } from 'react';
import * as FeatureExplorerTracker from '../services/FeatureExplorerTracker';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  SafeAreaView,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import Svg, { Circle } from 'react-native-svg';
import Confetti from '../components/Confetti';
import AddSelectionModal from '../components/AddSelectionModal';
import {
  scaleWidth,
  scaleHeight,
  isSmallDevice,
  isTablet,
  spacing,
  fontSizes,
  useIsLandscape,
  useSafeSpacing,
  meetsContrastRequirements,
  accessibility
} from '../utils/responsive';

const LifePlanOverviewScreen = ({ navigation, hideBackButton = false, onFullScreenToggle, isFullscreen = false, isEditMode = false, onEditModeToggle }) => {
  // Determine if we're embedded in a tab (Goals tab) or standalone (from ProfileTab)
  const isEmbeddedInTab = hideBackButton;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const safeSpacing = useSafeSpacing();
  const { showSuccess, showError } = useNotification();
  const isLandscape = useIsLandscape();
  
  // Floating Add Button State
  const addButtonScale = useRef(new Animated.Value(1)).current;
  const addButtonSize = scaleWidth(60);
  
  // State for add selection modal
  const [showAddSelectionModal, setShowAddSelectionModal] = useState(false);
  
  // State for delete all confirmation
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  
  // Add button animation
  const animateAddButton = () => {
    // Stop any existing animation and reset
    addButtonScale.stopAnimation();
    addButtonScale.setValue(1);
    
    Animated.sequence([
      Animated.timing(addButtonScale, {
        toValue: 0.85,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(addButtonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Handle add button press - show selection modal
  const handleAddButtonPress = () => {
    animateAddButton();
    // Small delay to let animation start before showing modal
    setTimeout(() => {
      setShowAddSelectionModal(true);
    }, 50);
  };
  
  // Handle selection from the modal
  const handleSelectionModalChoice = (choice) => {
    switch (choice) {
      case 'goal':
        handleAddGoal();
        break;
      case 'milestone':
        handleAddMilestone();
        break;
      case 'task':
        handleAddTask();
        break;
      default:
        break;
    }
  };
  
  // Handle Add Goal
  const handleAddGoal = () => {
    navigation.navigate('GoalDetails', { 
      mode: 'create',
      previousScreen: isEmbeddedInTab ? 'GoalsTab' : 'LifePlanOverview'
    });
  };
  
  // Handle Add Milestone (Project)
  const handleAddMilestone = () => {
    navigation.navigate('MilestoneDetails', { mode: 'create' });
  };
  
  // Handle Add Task
  const handleAddTask = () => {
    navigation.navigate('TaskDetails', { mode: 'create' });
  };
  
  // Handle Delete All
  const handleDeleteAll = async () => {
    try {
      // Get all items to delete (including standalone)
      const standaloneTasksToDelete = getStandaloneTasks();
      const standaloneMilestonesToDelete = getStandaloneProjects();
      const goalTasksToDelete = tasks.filter(task => task.goalId || task.projectId);
      const goalProjectsToDelete = projects.filter(project => project.goalId);
      const goalsToDelete = goals;
      
      const totalItems = standaloneTasksToDelete.length + standaloneMilestonesToDelete.length + 
                        goalTasksToDelete.length + goalProjectsToDelete.length + goalsToDelete.length;
      
      if (totalItems === 0) {
        showError('No items to delete');
        return;
      }
      
      console.log('Deleting all items:', {
        standaloneTasks: standaloneTasksToDelete.length,
        standaloneMilestones: standaloneMilestonesToDelete.length,
        goalTasks: goalTasksToDelete.length,
        goalProjects: goalProjectsToDelete.length,
        goals: goalsToDelete.length,
        total: totalItems
      });
      
      // Delete standalone tasks first (use direct state manipulation since deleteTask requires projectId)
      if (standaloneTasksToDelete.length > 0) {
        console.log('Deleting standalone tasks:', standaloneTasksToDelete.map(t => t.title));
        const standaloneTaskIds = standaloneTasksToDelete.map(t => t.id);
        const remainingTasks = tasks.filter(task => !standaloneTaskIds.includes(task.id));
        setTasks(remainingTasks);
      }
      
      // Delete standalone milestones
      for (const project of standaloneMilestonesToDelete) {
        console.log('Deleting standalone milestone:', project.id, project.title);
        await deleteProject(project.id);
      }
      
      // Delete all goals (this should cascade to delete their projects and tasks)
      for (const goal of goalsToDelete) {
        console.log('Deleting goal:', goal.id, goal.title);
        await deleteGoal(goal.id);
      }
      
      showSuccess(`Successfully deleted ${totalItems} items`);
      setShowDeleteAllModal(false);
      
    } catch (error) {
      console.error('Error deleting all items:', error);
      showError('Failed to delete all items. Please try again.');
    }
  };
  
  // Get app context with goals, projects, tasks
  const appContext = useAppContext() || {};
  const { 
    goals = [], 
    projects = [], 
    tasks = [], 
    getTasksForProject,
    updateProject,
    updateTask,
    updateGoal,
    updateGoalProgress,
    deleteGoal,
    deleteProject,
    deleteTask,
    setTasks
  } = appContext;
  
  // Generate confetti colors based on project color (matches TasksScreen implementation)
  const getProjectConfettiColors = (baseColor) => {
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

  // Generate fireworks colors for goal completion (matches GoalsScreen implementation)
  const getGoalFireworksColors = (goalColor) => {
    // Use the goal's actual color if available, otherwise fall back to theme primary
    const baseColor = goalColor || theme.primary || '#4CAF50';
    
    // Convert hex to RGB for easier manipulation
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // Generate lighter variations
    const lighter1 = `#${Math.min(255, r + 40).toString(16).padStart(2, '0')}${Math.min(255, g + 40).toString(16).padStart(2, '0')}${Math.min(255, b + 40).toString(16).padStart(2, '0')}`;
    const lighter2 = `#${Math.min(255, r + 80).toString(16).padStart(2, '0')}${Math.min(255, g + 80).toString(16).padStart(2, '0')}${Math.min(255, b + 80).toString(16).padStart(2, '0')}`;
    
    // Generate darker variations
    const darker1 = `#${Math.max(0, r - 40).toString(16).padStart(2, '0')}${Math.max(0, g - 40).toString(16).padStart(2, '0')}${Math.max(0, b - 40).toString(16).padStart(2, '0')}`;
    const darker2 = `#${Math.max(0, r - 80).toString(16).padStart(2, '0')}${Math.max(0, g - 80).toString(16).padStart(2, '0')}${Math.max(0, b - 80).toString(16).padStart(2, '0')}`;
    
    // Generate complementary color
    const complementary = `#${(255 - r).toString(16).padStart(2, '0')}${(255 - g).toString(16).padStart(2, '0')}${(255 - b).toString(16).padStart(2, '0')}`;
    
    // Add some accent colors for fireworks
    const goldAccent = '#FFD700';
    const whiteAccent = '#FFFFFF';
    const silverAccent = '#C0C0C0';
    
    return [baseColor, baseColor, baseColor, lighter1, lighter2, darker1, darker2, complementary, goldAccent, whiteAccent, silverAccent];
  };
  
  // State for expanded sections
  const [expandedGoals, setExpandedGoals] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(scaleHeight(30))).current;
  
  // Track component mount state and deletion state
  const isMounted = useRef(true);
  const isDeletingRef = useRef(false);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Check if dark mode is active
  const isDarkMode = theme.background === '#000000';
  
  // Drag and drop state
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedItem: null,
    draggedItemType: null, // 'task' or 'milestone'
    dropZones: []
  });
  
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    type: null, // 'goal' or 'project'
    item: null,
    position: { x: 0, y: 0 }
  });
  
  // Delete modal state (separate from context menu)
  const [deleteModal, setDeleteModal] = useState({
    visible: false,
    type: null, // 'goal', 'project', or 'task'
    item: null,
    projectId: null, // needed for task deletion
    isDeleting: false
  });
  
  // Confetti state for project completion (falling confetti)
  const [showProjectConfetti, setShowProjectConfetti] = useState(false);
  const [projectConfettiColors, setProjectConfettiColors] = useState(['#4CAF50', '#8BC34A', '#CDDC39', '#2E7D32', '#1B5E20']);
  
  // Confetti state for goal completion (fireworks)
  const [showGoalConfetti, setShowGoalConfetti] = useState(false);
  const [goalConfettiColors, setGoalConfettiColors] = useState(['#4CAF50', '#8BC34A', '#CDDC39', '#2E7D32', '#1B5E20']);

  // Ensure text colors meet contrast requirements
  const textColor = meetsContrastRequirements(theme.text, theme.card) 
    ? theme.text 
    : isDarkMode ? '#FFFFFF' : '#000000';
  
  const secondaryTextColor = meetsContrastRequirements(theme.textSecondary, theme.card) 
    ? theme.textSecondary 
    : isDarkMode ? '#E0E0E0' : '#4A4A4A';
  
  useEffect(() => {
  // Animate elements when screen loads
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true
    }),
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true
    })
  ]).start();

  // Setup navigation options to ensure proper back behavior
  const unsubscribe = navigation.addListener('focus', () => {
    navigation.setOptions({
      headerShown: false
    });
    
    // Track dashboard holistic view access for achievement
    try {
      FeatureExplorerTracker.trackDashboardHolisticView(showSuccess);
    } catch (error) {
      console.error('Error tracking dashboard holistic view achievement:', error);
      // Silently handle tracking errors without affecting main functionality
    }
  });

  return unsubscribe;
}, [navigation]);
  
  // Get standalone tasks (tasks with no goal or project parent)
  const getStandaloneTasks = () => {
    return tasks.filter(task => {
      const hasNoGoal = !task.goalId || task.goalId === null || task.goalId === undefined;
      const hasNoProject = !task.projectId || task.projectId === null || task.projectId === undefined;
      return hasNoGoal && hasNoProject;
    });
  };

  // Get standalone projects/milestones (projects with no goal parent)
  const getStandaloneProjects = () => {
    return projects.filter(project => {
      const hasNoGoal = !project.goalId || project.goalId === null || project.goalId === undefined;
      const isActive = !project.completed; // Only show active standalone milestones
      return hasNoGoal && isActive;
    });
  };

  // Process goals, projects, and tasks data to create a hierarchical structure
  const processData = () => {
    // Filter out completed goals - LifePlanOverview only shows active goals
    const activeGoals = goals.filter(goal => !goal.completed);
    
    return activeGoals.map(goal => {
      // Find projects for this goal
      const goalProjects = projects.filter(project => project.goalId === goal.id);
      
      // Add tasks to each project
      const projectsWithTasks = goalProjects.map(project => {
        // Get tasks for this project - try multiple approaches
        let projectTasks = [];
        
        // Approach 1: Use the context function if available
        if (typeof getTasksForProject === 'function') {
          projectTasks = getTasksForProject(project.id);
        }
        
        // Approach 2: Filter directly if approach 1 yielded no results
        if (projectTasks.length === 0 && Array.isArray(tasks)) {
          projectTasks = tasks.filter(task => task.projectId === project.id);
        }
        
        // Approach 3: Look for tasks stored directly on the project object
        if (projectTasks.length === 0 && project.tasks && Array.isArray(project.tasks)) {
          projectTasks = project.tasks;
        }
        
        return {
          ...project,
          tasks: projectTasks
        };
      });
      
      // Get direct tasks for this goal (tasks with goalId but no projectId)
      const directTasks = tasks.filter(task => 
        task.goalId === goal.id && (!task.projectId || task.projectId === null || task.projectId === undefined)
      );
      
      return {
        ...goal,
        projects: projectsWithTasks,
        directTasks: directTasks
      };
    });
  };
  
  const processedData = processData();
  
  // Toggle goal expansion
  const toggleGoal = (goalId) => {
    setExpandedGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
  };
  
  // Toggle project expansion
  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Toggle task completion - Fixed to use correct data structure
  const handleToggleTask = async (taskId, projectId) => {
    console.log('=== TASK TOGGLE ATTEMPT ===');
    console.log('Task ID:', taskId);
    console.log('Project ID:', projectId);
    
    // Find the task in the global tasks array (not on the project object)
    const taskToUpdate = tasks.find(t => t.id === taskId && t.projectId === projectId);
    if (!taskToUpdate) {
      console.error("Task not found in tasks array");
      showError("Couldn't find task");
      return;
    }
    
    // Verify the project exists
    const projectExists = projects.find(p => p.id === projectId);
    if (!projectExists) {
      console.error("Project not found");
      showError("Couldn't find project");
      return;
    }
    
    console.log('Found task:', taskToUpdate.title);
    console.log('Current task state:');
    console.log('  - completed:', taskToUpdate.completed);
    console.log('  - status:', taskToUpdate.status);
    
    try {
      // Determine new status (toggle between 'todo' and 'done')
      const currentStatus = taskToUpdate.status || (taskToUpdate.completed ? 'done' : 'todo');
      const newStatus = currentStatus === 'done' ? 'todo' : 'done';
      const completed = newStatus === 'done';
      
      console.log('Status transition:');
      console.log('  - currentStatus:', currentStatus);
      console.log('  - newStatus:', newStatus);
      console.log('  - newCompleted:', completed);
      
      // Create updated task
      const updatedTask = {
        ...taskToUpdate,
        status: newStatus,
        completed: completed,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Calling updateTask with:', { projectId, taskId, updatedTask: { status: updatedTask.status, completed: updatedTask.completed } });
      
      // Update the task using the context method with 3 parameters like TasksScreen
      if (typeof updateTask === 'function') {
        await updateTask(projectId, taskId, updatedTask);
        console.log('✅ updateTask call completed successfully');
        showSuccess(completed ? 'Task completed' : 'Task marked incomplete');
      } else {
        console.error("updateTask function not available in context");
        showError("Couldn't update task");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      showError("An error occurred. Please try again.");
    }
    
    console.log('=== END TASK TOGGLE ===');
  };

  // Handle goal completion - similar to GoalsScreen
  const handleToggleGoalCompletion = (goal) => {
    const wasCompleted = goal.completed;
    const isNowCompleted = !goal.completed;
    
    // Create updated goal
    const updatedGoal = {
      ...goal,
      completed: !goal.completed,
      progress: !goal.completed ? 100 : goal.progress, // Set progress to 100% when completed
      completedAt: !goal.completed ? new Date().toISOString() : null
    };
    
    // If goal is being completed (not already completed), show fireworks!
    if (!wasCompleted && isNowCompleted) {
      console.log("COMPLETING GOAL! Triggering fireworks for:", goal.title);
      
      // Set fireworks colors based on goal color
      setGoalConfettiColors(getGoalFireworksColors(goal.color));
      
      // Show fireworks
      setShowGoalConfetti(true);
    }
    
    // Update goal in context
    if (typeof updateGoal === 'function') {
      updateGoal(updatedGoal);
      
      showSuccess(updatedGoal.completed ? 
        'Goal completed! 🎆' : 
        'Goal reactivated!'
      );
    } else {
      console.error("updateGoal function not available in context");
      showError("Couldn't update goal");
    }
  };

  // Check if all project tasks are completed
  const areAllTasksCompleted = (project) => {
    if (!project) {
      return false;
    }
    
    // Get tasks for this project from the global tasks array
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    
    if (projectTasks.length === 0) {
      return false;
    }
    
    return projectTasks.every(task => task.completed || task.status === 'done');
  };

  // Check if all projects in a goal are completed
  const areAllProjectsCompleted = (goal) => {
    if (!goal) {
      return false;
    }
    
    // Get projects for this goal
    const goalProjects = projects.filter(project => project.goalId === goal.id);
    
    if (goalProjects.length === 0) {
      return false;
    }
    
    return goalProjects.every(project => project.completed || project.status === 'done');
  };

  // Mark project as completed
  const handleToggleProjectCompletion = (project) => {
    const wasCompleted = project.completed || project.status === 'done';
    const isNowCompleted = !project.completed;
    
    // Get tasks for this project from the global tasks array
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    
    // Create updated project
    const updatedProject = {
      ...project,
      completed: !project.completed,
      status: !project.completed ? 'done' : 'todo',
      // If marking as complete, set progress to 100%
      // If marking as incomplete, recalculate based on task completion
      progress: !project.completed ? 100 : 
        (projectTasks.length > 0 ? 
          Math.round((projectTasks.filter(t => t.completed).length / projectTasks.length) * 100) : 
          0)
    };
    
    // Also update all tasks if marking project as complete
    if (!project.completed && projectTasks.length > 0) {
      // Update each task individually using the updateTask function
      projectTasks.forEach(async (task) => {
        if (!task.completed && task.status !== 'done') {
          const updatedTask = {
            ...task,
            completed: true,
            status: 'done',
            updatedAt: new Date().toISOString()
          };
          
          if (typeof updateTask === 'function') {
            await updateTask(project.id, task.id, updatedTask);
          }
        }
      });
    }
    
    // If project is being completed (not already completed), show falling confetti!
    if (!wasCompleted && isNowCompleted) {
      console.log("COMPLETING PROJECT! Triggering confetti for:", project.title);
      
      // Set confetti colors based on project color
      setProjectConfettiColors(getProjectConfettiColors(project.color));
      
      // Show falling confetti
      setShowProjectConfetti(true);
    }
    
    // Update project in context
    if (typeof updateProject === 'function') {
      updateProject(updatedProject);
      
      // Specifically update goal progress to reflect the project completion status change
      if (updatedProject.goalId && typeof updateGoalProgress === 'function') {
        updateGoalProgress(updatedProject.id, updatedProject.goalId);
      }
      
      showSuccess(updatedProject.completed ? 
        'Project marked as completed' : 
        'Project marked as incomplete'
      );
    } else {
      console.error("updateProject function not available in context");
      showError("Couldn't update project");
    }
  };

  // Drag and Drop Functions - Long press to start drag without edit mode
  const handleLongPress = (item, itemType) => {
    console.log('Long press started for:', item.title, 'Type:', itemType);
    
    setDragState({
      isDragging: true,
      draggedItem: item,
      draggedItemType: itemType,
      dropZones: getAvailableDropZones(item, itemType)
    });
  };

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      draggedItemType: null,
      dropZones: []
    });
  };

  const handleDrop = async (targetGoalId) => {
    if (!dragState.draggedItem || !dragState.isDragging) return;

    try {
      const { draggedItem, draggedItemType } = dragState;
      
      if (draggedItemType === 'task') {
        // Move task to different goal
        if (typeof updateTask === 'function') {
          await updateTask(null, draggedItem.id, { goalId: targetGoalId });
          showSuccess(`Task moved ${targetGoalId ? 'to goal' : 'to standalone'}`);
        }
      } else if (draggedItemType === 'milestone') {
        // Move milestone to different goal
        if (typeof updateProject === 'function') {
          await updateProject({ ...draggedItem, goalId: targetGoalId });
          showSuccess(`Milestone moved ${targetGoalId ? 'to goal' : 'to standalone'}`);
        }
      }
    } catch (error) {
      console.error('Error moving item:', error);
      showError('Failed to move item');
    } finally {
      handleDragEnd();
    }
  };

  const getAvailableDropZones = (item, itemType) => {
    const dropZones = [];
    
    // Add standalone option
    dropZones.push({ id: null, name: 'Standalone', type: 'standalone' });
    
    // Add all goals as drop zones
    goals.forEach(goal => {
      if (goal.id !== item.goalId) { // Don't show current goal as option
        dropZones.push({ id: goal.id, name: goal.title, type: 'goal' });
      }
    });
    
    return dropZones;
  };

  // Handle goal long press to show context menu
  const handleGoalLongPress = (goal, event) => {
    const { pageX, pageY } = event.nativeEvent;
    setContextMenu({
      visible: true,
      type: 'goal',
      item: goal,
      position: { x: pageX, y: pageY }
    });
  };

  // Handle project long press to show context menu
  const handleProjectLongPress = (project, event) => {
    const { pageX, pageY } = event.nativeEvent;
    setContextMenu({
      visible: true,
      type: 'project',
      item: project,
      position: { x: pageX, y: pageY }
    });
  };

  // Handle task long press to show context menu
  const handleTaskLongPress = (task, projectId, event) => {
    const { pageX, pageY } = event.nativeEvent;
    setContextMenu({
      visible: true,
      type: 'task',
      item: task,
      projectId: projectId,
      position: { x: pageX, y: pageY }
    });
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      type: null,
      item: null,
      position: { x: 0, y: 0 }
    });
  };

  // Handle context menu actions
  const handleContextMenuAction = (action) => {
    const { type, item } = contextMenu;
    closeContextMenu();

    if (action === 'open') {
      if (type === 'goal') {
        navigateToGoal(item);
      } else if (type === 'project') {
        navigateToProject(item);
      } else if (type === 'task') {
        navigateToTask(item, contextMenu.projectId);
      }
    } else if (action === 'delete') {
      if (type === 'goal') {
        handleDeleteGoal(item);
      } else if (type === 'project') {
        handleDeleteProject(item);
      } else if (type === 'task') {
        handleDeleteTask(item, contextMenu.projectId);
      }
    }
  };

  // Handle goal deletion - smart deletion logic
  const handleDeleteGoal = (goal) => {
    closeContextMenu();
    
    // Check if goal has any projects or tasks
    const goalProjects = projects.filter(project => project.goalId === goal.id);
    const goalTasks = tasks.filter(task => task.goalId === goal.id);
    const hasContent = goalProjects.length > 0 || goalTasks.length > 0;
    
    if (hasContent) {
      // Goal has content - show confirmation modal
      setDeleteModal({
        visible: true,
        type: 'goal',
        item: goal,
        isDeleting: false
      });
    } else {
      // Goal is empty - delete directly
      handleConfirmDeleteGoal(goal);
    }
  };

  // Handle project/milestone deletion - smart deletion logic
  const handleDeleteProject = (project) => {
    closeContextMenu();
    
    // Check if project/milestone has any tasks
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const hasContent = projectTasks.length > 0;
    
    if (hasContent) {
      // Project/milestone has tasks - show confirmation modal
      setDeleteModal({
        visible: true,
        type: 'project',
        item: project,
        projectId: null,
        isDeleting: false
      });
    } else {
      // Project/milestone is empty - delete directly
      handleConfirmDeleteProject(project);
    }
  };

  // Handle task deletion - show confirmation modal
  const handleDeleteTask = (task, projectId) => {
    closeContextMenu();
    setDeleteModal({
      visible: true,
      type: 'task',
      item: task,
      projectId: projectId,
      isDeleting: false
    });
  };

  // Actual goal deletion implementation (matching ProjectDetailsScreen pattern)
  const handleConfirmDeleteGoal = async (goal) => {
    try {
      isDeletingRef.current = true;
      setDeleteModal(prev => ({
        ...prev,
        visible: false,
        isDeleting: true
      }));
      
      const goalIdToDelete = goal.id;
      
      // Use setTimeout to ensure smooth modal dismissal (matching ProjectDetailsScreen)
      setTimeout(async () => {
        try {
          if (typeof deleteGoal === 'function') {
            const success = await deleteGoal(goalIdToDelete);
            
            if (isMounted.current) {
              if (success !== false) {
                console.log(`Successfully deleted goal ID: ${goalIdToDelete}`);
                showSuccess('Goal deleted successfully');
              } else {
                console.error(`Failed to delete goal ID: ${goalIdToDelete}`);
                showError('Error deleting goal');
              }
            }
          } else {
            if (isMounted.current) {
              showError("Couldn't delete goal");
            }
          }
        } catch (deleteError) {
          console.error("Error during goal deletion:", deleteError);
          if (isMounted.current) {
            showError('Error deleting goal');
          }
        } finally {
          if (isMounted.current) {
            isDeletingRef.current = false;
            setDeleteModal(prev => ({
              ...prev,
              isDeleting: false
            }));
          }
        }
      }, 500); // Match ProjectDetailsScreen timeout
      
    } catch (error) {
      console.error("Fatal error in goal delete handling:", error);
      if (isMounted.current) {
        showError('Error deleting goal');
        isDeletingRef.current = false;
        setDeleteModal(prev => ({
          ...prev,
          visible: false,
          isDeleting: false
        }));
      }
    }
  };

  // Actual project deletion implementation (matching ProjectDetailsScreen pattern)
  const handleConfirmDeleteProject = async (project) => {
    try {
      isDeletingRef.current = true;
      setDeleteModal(prev => ({
        ...prev,
        visible: false,
        isDeleting: true
      }));
      
      const projectIdToDelete = project.id;
      
      // Use setTimeout to ensure smooth modal dismissal (matching ProjectDetailsScreen)
      setTimeout(async () => {
        try {
          if (typeof deleteProject === 'function') {
            const success = await deleteProject(projectIdToDelete);
            
            if (isMounted.current) {
              if (success !== false) {
                console.log(`Successfully deleted project ID: ${projectIdToDelete}`);
                const itemType = project.isMilestone ? 'Milestone' : 'Project';
                showSuccess(`${itemType} deleted successfully`);
              } else {
                console.error(`Failed to delete project ID: ${projectIdToDelete}`);
                const itemType = project.isMilestone ? 'milestone' : 'project';
                showError(`Error deleting ${itemType}`);
              }
            }
          } else {
            if (isMounted.current) {
              const itemType = project.isMilestone ? 'milestone' : 'project';
              showError(`Couldn't delete ${itemType}`);
            }
          }
        } catch (deleteError) {
          console.error("Error during project deletion:", deleteError);
          if (isMounted.current) {
            const itemType = project.isMilestone ? 'milestone' : 'project';
            showError(`Error deleting ${itemType}`);
          }
        } finally {
          if (isMounted.current) {
            isDeletingRef.current = false;
            setDeleteModal(prev => ({
              ...prev,
              isDeleting: false
            }));
          }
        }
      }, 500); // Match ProjectDetailsScreen timeout
      
    } catch (error) {
      console.error("Fatal error in project delete handling:", error);
      if (isMounted.current) {
        const itemType = project.isMilestone ? 'milestone' : 'project';
        showError(`Error deleting ${itemType}`);
        isDeletingRef.current = false;
        setDeleteModal(prev => ({
          ...prev,
          visible: false,
          isDeleting: false
        }));
      }
    }
  };

  // Actual task deletion implementation (matching ProjectDetailsScreen pattern)
  const handleConfirmDeleteTask = async (task, projectId) => {
    try {
      isDeletingRef.current = true;
      setDeleteModal(prev => ({
        ...prev,
        visible: false,
        isDeleting: true
      }));
      
      const taskIdToDelete = task.id;
      
      // Use setTimeout to ensure smooth modal dismissal (matching ProjectDetailsScreen)
      setTimeout(async () => {
        try {
          if (typeof deleteTask === 'function') {
            const success = await deleteTask(projectId, taskIdToDelete);
            
            if (isMounted.current) {
              if (success !== false) {
                console.log(`Successfully deleted task ID: ${taskIdToDelete}`);
                showSuccess('Task deleted successfully');
              } else {
                console.error(`Failed to delete task ID: ${taskIdToDelete}`);
                showError('Error deleting task');
              }
            }
          } else {
            if (isMounted.current) {
              showError("Couldn't delete task");
            }
          }
        } catch (deleteError) {
          console.error("Error during task deletion:", deleteError);
          if (isMounted.current) {
            showError('Error deleting task');
          }
        } finally {
          if (isMounted.current) {
            isDeletingRef.current = false;
            setDeleteModal(prev => ({
              ...prev,
              isDeleting: false
            }));
          }
        }
      }, 500); // Match ProjectDetailsScreen timeout
      
    } catch (error) {
      console.error("Fatal error in task delete handling:", error);
      if (isMounted.current) {
        showError('Error deleting task');
        isDeletingRef.current = false;
        setDeleteModal(prev => ({
          ...prev,
          visible: false,
          isDeleting: false
        }));
      }
    }
  };

  // Helper function to get linked projects count for goals
  const getLinkedProjectsCount = (goalId) => {
    return projects.filter(project => project.goalId === goalId).length;
  };
  
  // Navigate to goal details with special navigation params to return to this screen
  const navigateToGoal = (goal) => {
    navigation.navigate('GoalDetails', { 
      mode: 'edit', 
      goal: goal,
      previousScreen: isEmbeddedInTab ? 'GoalsTab' : 'LifePlanOverview'
    });
  };
  
  // Navigate to project details with special navigation params to return to this screen
  const navigateToProject = (project) => {
    navigation.navigate('ProjectDetails', { 
      projectId: project.id, 
      mode: 'edit',
      previousScreen: isEmbeddedInTab ? 'GoalsTab' : 'LifePlanOverview'
    });
  };

  // Navigate to task (via project details)
  const navigateToTask = (task, projectId) => {
    navigation.navigate('ProjectDetails', { 
      projectId: projectId,
      taskId: task.id, // Pass task ID to highlight/focus the task
      mode: 'edit',
      previousScreen: isEmbeddedInTab ? 'GoalsTab' : 'LifePlanOverview'
    });
  };
  
  // Create a color with opacity
  const colorWithOpacity = (color, opacity) => {
    // Check if the color is in hexadecimal format
    if (color && color.startsWith('#')) {
      // Convert hex to rgba
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // Default case - use the theme primary with opacity
    return theme.primary + opacity.toString(16).padStart(2, '0');
  };
  
  // Render a circular progress indicator using SVG
  const renderCircularProgress = (progress, size = 32, color, strokeWidth = 3) => {
    // Ensure progress is a valid number between 0-100
    const validProgress = Math.min(Math.max(progress || 0, 0), 100);
    
    // Calculate scaled size based on device
    const scaledSize = isTablet ? scaleWidth(size * 1.2) : 
                       isSmallDevice ? scaleWidth(size * 0.9) : 
                       scaleWidth(size);
    
    // Adjust stroke width based on device size
    const scaledStrokeWidth = isTablet ? strokeWidth * 1.2 : 
                              isSmallDevice ? strokeWidth * 0.9 : 
                              strokeWidth;
    
    // SVG parameters
    const center = scaledSize / 2;
    const radius = (scaledSize - scaledStrokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressArcLength = (validProgress / 100) * circumference;
    
    // For 0% progress, don't render the progress arc
    const showProgressArc = validProgress > 0;
    
    return (
      <View style={{ 
        width: scaledSize, 
        height: scaledSize, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: validProgress
      }}
      accessibilityLabel={`${validProgress} percent complete`}
      >
        <Svg width={scaledSize} height={scaledSize} viewBox={`0 0 ${scaledSize} ${scaledSize}`}>
          {/* Background Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            strokeWidth={scaledStrokeWidth}
            fill="transparent"
          />
          
          {/* Progress Arc - only render if progress > 0 */}
          {showProgressArc && (
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={color || theme.primary}
              strokeWidth={scaledStrokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progressArcLength}
              // Rotate to start from the top instead of right
              transform={`rotate(-90, ${center}, ${center})`}
              strokeLinecap="round"
            />
          )}
        </Svg>
        
        {/* Text in center */}
        <View style={{
          position: 'absolute',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            color: textColor,
            fontSize: scaledSize / 3.5,
            fontWeight: '500',
          }}
          maxFontSizeMultiplier={1.3}>
            {validProgress}%
          </Text>
        </View>
      </View>
    );
  };

  // Project completion suggestion component
  const CompletionSuggestionBadge = ({ project, color }) => {
    // Get tasks for this project from the global tasks array
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    
    // Only show if all tasks are completed, there are tasks, and project isn't completed
    if (!project || 
        projectTasks.length === 0 || 
        !areAllTasksCompleted(project) || 
        project.completed || 
        project.status === 'done') {
      return null;
    }

    return (
      <TouchableOpacity
        style={[
          styles.completionBadge,
          { 
            backgroundColor: color,
            paddingHorizontal: scaleWidth(8),
            paddingVertical: scaleHeight(3),
            borderRadius: scaleWidth(12),
            marginLeft: spacing.xs
          }
        ]}
        onPress={() => handleToggleProjectCompletion(project)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Mark project as complete"
        accessibilityHint="All tasks are completed. Tap to mark the entire project as complete"
      >
        <Ionicons name="checkmark" size={scaleWidth(12)} color="#FFFFFF" />
        <Text 
          style={[
            styles.completionBadgeText,
            {
              color: '#FFFFFF',
              fontSize: fontSizes.xs,
              fontWeight: '600',
              marginLeft: spacing.xxxs
            }
          ]}
          maxFontSizeMultiplier={1.3}
        >
          Complete
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={[
      styles.container, 
      { 
        backgroundColor: theme.background,
        paddingBottom: insets.bottom 
      }
    ]}>
      {/* Confetti component for project completion - falling animation */}
      <Confetti 
        active={showProjectConfetti} 
        colors={projectConfettiColors} 
        duration={4000}
        type="confetti"
        count={50}
        onComplete={() => setShowProjectConfetti(false)}
      />
      
      {/* Confetti component for goal completion - fireworks animation */}
      <Confetti 
        active={showGoalConfetti} 
        colors={goalConfettiColors} 
        duration={5000}
        type="fireworks"
        onComplete={() => setShowGoalConfetti(false)}
      />
      
      <StatusBar 
        backgroundColor={theme.statusBar || theme.background} 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
      />
      
      <ScrollView 
        style={[
          styles.scrollView,
          {
            paddingHorizontal: safeSpacing.left > spacing.m ? 0 : spacing.m,
            paddingTop: 0
          }
        ]} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: !isFullscreen ? insets.top + scaleHeight(70) : spacing.m,
          paddingBottom: scaleHeight(100),
          paddingLeft: safeSpacing.left > spacing.m ? safeSpacing.left : 0,
          paddingRight: safeSpacing.right > spacing.m ? safeSpacing.right : 0
        }}
        accessible={true}
        accessibilityRole="scrollView"
        accessibilityLabel="Life Plan Overview"
      >
        {/* Edit Mode Indicator */}
        {isEditMode && (
          <View style={[
            styles.editModeIndicator,
            {
              backgroundColor: theme.primary + '15',
              borderColor: theme.primary + '30',
              borderWidth: 1,
              borderRadius: scaleWidth(12),
              padding: spacing.m,
              marginHorizontal: spacing.m,
              marginBottom: spacing.l,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }
          ]}>
            <Ionicons name="move" size={scaleWidth(20)} color={theme.primary} />
            <Text style={[
              styles.editModeText,
              {
                color: theme.primary,
                fontSize: fontSizes.m,
                fontWeight: '600',
                marginLeft: spacing.s
              }
            ]}>
              Edit Mode: Drag items to reorganize
            </Text>
          </View>
        )}
        
        {/* Standalone Tasks Section */}
        {getStandaloneTasks().length > 0 && (
          <Animated.View style={[
            styles.hierarchyItem,
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }],
              marginBottom: spacing.m 
            }
          ]}>
            <TouchableOpacity 
              style={[
                styles.goalItem, 
                { 
                  backgroundColor: theme.card,
                  borderColor: theme.text, // Black/white theme
                  borderWidth: 1,
                  borderRadius: scaleWidth(16),
                  padding: spacing.m,
                  marginBottom: spacing.s,
                  shadowColor: theme.text,
                  shadowOffset: { width: 0, height: scaleHeight(2) },
                  shadowOpacity: 0.1,
                  shadowRadius: scaleWidth(4),
                  elevation: 2
                }
              ]}
              onPress={() => toggleGoal('standalone-tasks')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Standalone Tasks section"
              accessibilityHint="Tap to expand or collapse standalone tasks"
            >
              <View style={[
                styles.goalHeader,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: spacing.m
                }
              ]}>
                <View style={[
                  styles.goalTitleContainer,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1
                  }
                ]}>
                  <View style={[
                    styles.goalIconCircle,
                    { 
                      backgroundColor: theme.text + '15', // Light black/white
                      width: scaleWidth(36),
                      height: scaleWidth(36),
                      borderRadius: scaleWidth(18),
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: spacing.s
                    }
                  ]}>
                    <Ionicons 
                      name="checkmark-done-outline" 
                      size={scaleWidth(20)} 
                      color={theme.text} 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text 
                      style={[
                        styles.goalTitle, 
                        { 
                          color: theme.text,
                          fontSize: fontSizes.l,
                          fontWeight: '700',
                          marginBottom: spacing.xs
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Standalone Tasks
                    </Text>
                    <Text 
                      style={[
                        styles.goalSubtitle, 
                        { 
                          color: theme.textSecondary,
                          fontSize: fontSizes.s
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {getStandaloneTasks().length} task{getStandaloneTasks().length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {renderCircularProgress((() => {
                    const standaloneTasks = getStandaloneTasks();
                    if (standaloneTasks.length === 0) return 0;
                    const completedTasks = standaloneTasks.filter(task => task.completed || task.status === 'done');
                    return Math.round((completedTasks.length / standaloneTasks.length) * 100);
                  })(), 32, theme.text, 3)}
                  <Ionicons 
                    name={expandedGoals['standalone-tasks'] ? 'chevron-up' : 'chevron-down'} 
                    size={scaleWidth(20)} 
                    color={theme.textSecondary} 
                    style={{ marginLeft: spacing.s }}
                  />
                </View>
              </View>
            </TouchableOpacity>

            {/* Standalone Tasks List */}
            {expandedGoals['standalone-tasks'] && (
              <View style={[
                styles.projectsContainer,
                {
                  marginLeft: scaleWidth(20),
                  marginTop: spacing.xs
                }
              ]}>
                {getStandaloneTasks().map((task) => (
                  <View key={task.id} style={[
                    styles.taskWrapper,
                    {
                      marginTop: spacing.xs,
                      position: 'relative'
                    }
                  ]}>
                    <TouchableOpacity 
                      style={[
                        styles.taskItem, 
                        { 
                          backgroundColor: dragState.draggedItem?.id === task.id && dragState.isDragging 
                            ? theme.primary + '20' : theme.card,
                          borderColor: dragState.draggedItem?.id === task.id && dragState.isDragging 
                            ? theme.primary : theme.border,
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: spacing.m,
                          paddingVertical: spacing.s,
                          borderRadius: scaleWidth(12),
                          borderWidth: 1,
                          opacity: dragState.draggedItem?.id === task.id && dragState.isDragging ? 0.7 : 1
                        }
                      ]}
                      onPress={() => {
                        // Handle standalone task toggle
                        if (typeof updateTask === 'function') {
                          updateTask(null, task.id, { completed: !task.completed });
                        }
                      }}
                      onLongPress={() => handleLongPress(task, 'task')}
                      delayLongPress={300}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Task: ${task.title || task.name}`}
                      accessibilityState={{ checked: task.completed }}
                    >
                      <View style={[
                        styles.taskCheckCircle, 
                        {
                          width: scaleWidth(20),
                          height: scaleWidth(20),
                          borderRadius: scaleWidth(10),
                          borderWidth: 2,
                          marginRight: spacing.s,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderColor: task.completed ? theme.text : theme.border,
                          backgroundColor: task.completed ? theme.text : 'transparent'
                        }
                      ]}>
                        {task.completed && (
                          <Ionicons 
                            name="checkmark" 
                            size={scaleWidth(12)} 
                            color={theme.background} 
                          />
                        )}
                      </View>
                      <Text 
                        style={[
                          styles.taskTitle, 
                          {
                            color: task.completed ? theme.textSecondary : theme.text,
                            textDecorationLine: task.completed ? 'line-through' : 'none',
                            fontSize: fontSizes.s,
                            flex: 1
                          }
                        ]}
                        numberOfLines={2}
                        maxFontSizeMultiplier={1.3}
                      >
                        {task.title || task.name}
                      </Text>
                      
                      {/* Drag Handle - only show in edit mode */}
                      {isEditMode && (
                        <View style={[
                          styles.dragHandle,
                          {
                            marginLeft: spacing.s,
                            padding: spacing.xs
                          }
                        ]}>
                          <Ionicons 
                            name="reorder-two-outline" 
                            size={scaleWidth(18)} 
                            color={theme.textSecondary} 
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {/* Standalone Milestones Section */}
        {getStandaloneProjects().length > 0 && (
          <Animated.View style={[
            styles.hierarchyItem,
            { 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }],
              marginBottom: spacing.m 
            }
          ]}>
            <TouchableOpacity 
              style={[
                styles.goalItem, 
                { 
                  backgroundColor: theme.card,
                  borderColor: theme.text, // Black/white theme
                  borderWidth: 1,
                  borderRadius: scaleWidth(16),
                  padding: spacing.m,
                  marginBottom: spacing.s,
                  shadowColor: theme.text,
                  shadowOffset: { width: 0, height: scaleHeight(2) },
                  shadowOpacity: 0.1,
                  shadowRadius: scaleWidth(4),
                  elevation: 2
                }
              ]}
              onPress={() => toggleGoal('standalone-milestones')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Standalone Milestones section"
              accessibilityHint="Tap to expand or collapse standalone milestones"
            >
              <View style={[
                styles.goalHeader,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: spacing.m
                }
              ]}>
                <View style={[
                  styles.goalTitleContainer,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1
                  }
                ]}>
                  <View style={[
                    styles.goalIconCircle,
                    { 
                      backgroundColor: theme.text + '15', // Light black/white
                      width: scaleWidth(36),
                      height: scaleWidth(36),
                      borderRadius: scaleWidth(18),
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: spacing.s
                    }
                  ]}>
                    <Ionicons 
                      name="diamond" 
                      size={scaleWidth(20)} 
                      color="#FFFFFF" 
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text 
                      style={[
                        styles.goalTitle, 
                        { 
                          color: theme.text,
                          fontSize: fontSizes.l,
                          fontWeight: '700',
                          marginBottom: spacing.xs
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Standalone Milestones
                    </Text>
                    <Text 
                      style={[
                        styles.goalSubtitle, 
                        { 
                          color: theme.textSecondary,
                          fontSize: fontSizes.s
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {getStandaloneProjects().length} milestone{getStandaloneProjects().length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {renderCircularProgress((() => {
                    const standaloneMilestones = getStandaloneProjects();
                    if (standaloneMilestones.length === 0) return 0;
                    const completedMilestones = standaloneMilestones.filter(milestone => milestone.completed || milestone.status === 'done');
                    return Math.round((completedMilestones.length / standaloneMilestones.length) * 100);
                  })(), 32, theme.text, 3)}
                  <Ionicons 
                    name={expandedGoals['standalone-milestones'] ? 'chevron-up' : 'chevron-down'} 
                    size={scaleWidth(20)} 
                    color={theme.textSecondary} 
                    style={{ marginLeft: spacing.s }}
                  />
                </View>
              </View>
            </TouchableOpacity>

            {/* Standalone Milestones List */}
            {expandedGoals['standalone-milestones'] && (
              <View style={[
                styles.projectsContainer,
                {
                  marginLeft: scaleWidth(20),
                  marginTop: spacing.xs
                }
              ]}>
                {getStandaloneProjects().map((project) => (
                  <View key={project.id} style={[
                    styles.projectWrapper,
                    {
                      marginBottom: spacing.s
                    }
                  ]}>
                    <TouchableOpacity
                      style={[
                        styles.projectItem,
                        {
                          backgroundColor: dragState.draggedItem?.id === project.id && dragState.isDragging 
                            ? theme.primary + '20' : theme.card,
                          borderColor: dragState.draggedItem?.id === project.id && dragState.isDragging 
                            ? theme.primary : theme.border,
                          borderWidth: 1,
                          borderRadius: scaleWidth(12),
                          padding: spacing.m,
                          marginBottom: spacing.s,
                          flexDirection: 'row',
                          alignItems: 'center',
                          shadowColor: theme.text,
                          shadowOffset: { width: 0, height: scaleHeight(1) },
                          shadowOpacity: 0.05,
                          shadowRadius: scaleWidth(2),
                          elevation: 1,
                          opacity: dragState.draggedItem?.id === project.id && dragState.isDragging ? 0.7 : 1
                        }
                      ]}
                      onPress={() => {
                        navigation.navigate('MilestoneDetails', {
                          projectId: project.id,
                          mode: 'edit',
                          project: project,
                          previousScreen: 'LifePlanOverview'
                        });
                      }}
                      onLongPress={(event) => {
                        // First try to initiate drag, if no drag zones available, use context menu
                        const dropZones = getAvailableDropZones(project, 'milestone');
                        if (dropZones.length > 0) {
                          handleLongPress(project, 'milestone');
                        } else {
                          handleProjectLongPress(project, event);
                        }
                      }}
                      delayLongPress={300}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Milestone: ${project.title || project.name}`}
                      accessibilityHint="Tap to edit milestone, long press to drag or show options"
                    >
                      <View style={{
                        width: scaleWidth(12),
                        height: scaleWidth(12),
                        marginRight: spacing.s,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Ionicons 
                          name="diamond" 
                          size={scaleWidth(10)} 
                          color="#FFFFFF" 
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text 
                          style={[
                            styles.projectTitle, 
                            {
                              color: theme.text,
                              fontSize: fontSizes.s,
                              fontWeight: '600',
                              lineHeight: scaleHeight(20)
                            }
                          ]}
                          numberOfLines={2}
                          maxFontSizeMultiplier={1.3}
                        >
                          {project.title || project.name}
                        </Text>
                        {project.progress !== undefined && project.progress !== null && (
                          <View style={[
                            styles.progressContainer,
                            {
                              marginTop: spacing.xxs,
                              flexDirection: 'row',
                              alignItems: 'center'
                            }
                          ]}>
                            <View style={[
                              styles.progressBar,
                              {
                                flex: 1,
                                height: scaleHeight(4),
                                backgroundColor: theme.border,
                                borderRadius: scaleWidth(2),
                                marginRight: spacing.xs
                              }
                            ]}>
                              <View 
                                style={[
                                  styles.progressFill,
                                  {
                                    width: `${project.progress}%`,
                                    height: '100%',
                                    backgroundColor: project.color || theme.primary,
                                    borderRadius: scaleWidth(2)
                                  }
                                ]} 
                              />
                            </View>
                            <Text 
                              style={[
                                styles.progressText, 
                                { 
                                  color: theme.textSecondary,
                                  fontSize: fontSizes.xxs,
                                  fontWeight: '500'
                                }
                              ]}
                              maxFontSizeMultiplier={1.2}
                            >
                              {project.progress}%
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Drag Handle - only show in edit mode */}
                      {isEditMode && (
                        <View style={[
                          styles.dragHandle,
                          {
                            marginLeft: spacing.s,
                            marginRight: spacing.xs,
                            padding: spacing.xs
                          }
                        ]}>
                          <Ionicons 
                            name="reorder-two-outline" 
                            size={scaleWidth(18)} 
                            color={theme.textSecondary} 
                          />
                        </View>
                      )}
                      
                      <TouchableOpacity
                        style={[
                          styles.projectCheckbox,
                          {
                            width: scaleWidth(20),
                            height: scaleWidth(20),
                            borderRadius: scaleWidth(10),
                            borderWidth: 2,
                            marginLeft: spacing.s,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderColor: project.completed ? theme.primary : theme.border,
                            backgroundColor: project.completed ? theme.primary : 'transparent'
                          }
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleProjectToggle(project);
                        }}
                        accessible={true}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: project.completed }}
                        accessibilityLabel={`Mark milestone ${project.completed ? 'incomplete' : 'complete'}`}
                      >
                        {project.completed && (
                          <Ionicons 
                            name="checkmark" 
                            size={scaleWidth(12)} 
                            color="#FFFFFF" 
                          />
                        )}
                      </TouchableOpacity>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {/* Goals and Projects Hierarchy */}
        <View style={[
          styles.hierarchyContainer,
          { paddingBottom: spacing.m }
        ]}>
          {(processedData.length > 0 || getStandaloneTasks().length > 0 || getStandaloneProjects().length > 0) ? (
            <>
            {processedData.length > 0 && processedData.map((goal) => {
              // Define goal projects and tasks for this specific goal
              const goalProjects = projects.filter(project => project.goalId === goal.id);
              const goalTasks = tasks.filter(task => task.goalId === goal.id);
              
              return (
              <Animated.View 
                key={goal.id}
                style={[
                  styles.hierarchyItem,
                  { 
                    opacity: fadeAnim, 
                    transform: [{ translateY: slideAnim }],
                    marginBottom: spacing.m
                  }
                ]}
              >
                {/* Goal Item - Matches Standalone Tasks Style */}
                <TouchableOpacity 
                  style={[
                    styles.goalItem, 
                    { 
                      backgroundColor: theme.card,
                      borderColor: goal.color || theme.primary,
                      borderWidth: 1,
                      borderRadius: scaleWidth(16),
                      padding: spacing.m,
                      marginBottom: spacing.s,
                      shadowColor: goal.color || theme.primary,
                      shadowOffset: { width: 0, height: scaleHeight(2) },
                      shadowOpacity: 0.1,
                      shadowRadius: scaleWidth(4),
                      elevation: 2
                    }
                  ]}
                  onPress={() => toggleGoal(goal.id)}
                  onLongPress={(event) => handleGoalLongPress(goal, event)}
                  activeOpacity={0.96}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Goal: ${goal.title}, Progress: ${goal.progress || 0} percent`}
                  accessibilityHint="Tap to expand or collapse. Long press to show options"
                >
                  
                  <View style={[
                    styles.goalHeader,
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: spacing.m
                    }
                  ]}>
                    <View style={[
                      styles.goalTitleContainer,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1
                      }
                    ]}>
                      <View style={[
                        styles.goalIconCircle,
                        { 
                          backgroundColor: goal.color || theme.primary,
                          width: scaleWidth(36),
                          height: scaleWidth(36),
                          borderRadius: scaleWidth(18),
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: spacing.s
                        }
                      ]}>
                        <Ionicons 
                          name={goal.icon || 'flag'} 
                          size={scaleWidth(18)} 
                          color={goal.color === '#FFFFFF' ? '#000000' : '#FFFFFF'} 
                        />
                      </View>
                      
                      <View style={{ flex: 1 }}>
                        <Text 
                          style={[
                            styles.goalTitle, 
                            { 
                              color: theme.text,
                              fontSize: fontSizes.l,
                              fontWeight: '700',
                              marginBottom: spacing.xs
                            }
                          ]}
                          maxFontSizeMultiplier={1.3}
                        >
                          {goal.title}
                        </Text>
                        <Text 
                          style={[
                            styles.goalSubtitle, 
                            { 
                              color: theme.textSecondary,
                              fontSize: fontSizes.s
                            }
                          ]}
                          maxFontSizeMultiplier={1.3}
                        >
                          {goalProjects.length} milestone{goalProjects.length !== 1 ? 's' : ''} • {goalTasks.length} task{goalTasks.length !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {renderCircularProgress(goal.progress || 0, 32, goal.color, 3)}
                      <Ionicons 
                        name={expandedGoals[goal.id] ? 'chevron-up' : 'chevron-down'} 
                        size={scaleWidth(20)} 
                        color={theme.textSecondary} 
                        style={{ marginLeft: spacing.s }}
                      />
                    </View>
                  </View>
                  
                  {/* Auto-suggestion banner when all projects are complete */}
                  {areAllProjectsCompleted(goal) && 
                   projects.filter(project => project.goalId === goal.id).length > 0 && 
                   !goal.completed && 
                   goal.progress >= 100 && (
                    <View style={[
                      styles.completionSuggestion,
                      { 
                        backgroundColor: colorWithOpacity(goal.color || theme.primary, 0.1),
                        borderColor: goal.color || theme.primary,
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: spacing.m,
                        borderRadius: scaleWidth(12),
                        borderWidth: 1,
                        borderStyle: 'dashed',
                        marginTop: spacing.m
                      }
                    ]}
                    accessible={true}
                    accessibilityRole="alert"
                    accessibilityLabel="Goal completion suggestion"
                    >
                      <Ionicons 
                        name="trophy" 
                        size={scaleWidth(20)} 
                        color={goal.color || theme.primary} 
                      />
                      <Text style={[
                        styles.completionSuggestionText,
                        { 
                          color: textColor,
                          flex: 1,
                          fontSize: fontSizes.m,
                          marginLeft: spacing.s
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                      >
                        All projects complete! Mark this goal as achieved?
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.completionSuggestionButton,
                          { 
                            backgroundColor: goal.color || theme.primary,
                            paddingHorizontal: spacing.m,
                            paddingVertical: spacing.s,
                            borderRadius: scaleWidth(20),
                            marginLeft: spacing.s
                          }
                        ]}
                        onPress={() => handleToggleGoalCompletion(goal)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Mark goal as complete"
                      >
                        <Text 
                          style={[
                            styles.completionSuggestionButtonText,
                            {
                              color: '#FFFFFF',
                              fontSize: fontSizes.s,
                              fontWeight: '600'
                            }
                          ]}
                          maxFontSizeMultiplier={1.3}
                        >
                          Complete Goal
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
                
                {/* Projects for this Goal */}
                {expandedGoals[goal.id] && (
                  <View style={[
                    styles.projectsContainer,
                    {
                      marginLeft: scaleWidth(20),
                      marginTop: spacing.xs
                    }
                  ]}>
                    {goal.projects && goal.projects.length > 0 ? (
                      goal.projects.map((project) => (
                        <View 
                          key={project.id} 
                          style={[
                            styles.projectWrapper,
                            {
                              marginTop: spacing.xs,
                              position: 'relative'
                            }
                          ]}
                        >
                          {/* Connection line from goal to project */}
                          <View style={[
                            styles.verticalLine, 
                            { 
                              backgroundColor: colorWithOpacity(goal.color || theme.primary, 0.3),
                              width: scaleWidth(2),
                              height: scaleHeight(16),
                              position: 'absolute',
                              left: scaleWidth(10),
                              top: scaleHeight(-8)
                            }
                          ]} />
                          
                          {/* Project Item */}
                          <TouchableOpacity 
                            style={[
                              styles.projectItem, 
                              { 
                                backgroundColor: project.completed ? 
                                  colorWithOpacity(project.color || goal.color || theme.primary, 0.15) : 
                                  theme.card,
                                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                shadowColor: isDarkMode ? '#000000' : 'rgba(0,0,0,0.2)',
                                borderRadius: scaleWidth(12),
                                padding: spacing.m,
                                borderWidth: 1,
                                marginLeft: scaleWidth(20),
                                shadowOffset: { width: 0, height: scaleHeight(2) },
                                shadowOpacity: 0.1,
                                shadowRadius: scaleWidth(4),
                                elevation: 2,
                                position: 'relative',
                                overflow: 'hidden'
                              }
                            ]}
                            onPress={() => toggleProject(project.id)}
                            onLongPress={(event) => handleProjectLongPress(project, event)}
                            activeOpacity={0.9}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={`Project: ${project.title}, Progress: ${project.progress || 0} percent${project.completed ? ', Completed' : ''}`}
                            accessibilityHint="Tap to expand or collapse. Long press to show options"
                            accessibilityState={{ 
                              expanded: expandedProjects[project.id],
                              checked: project.completed
                            }}
                          >
                            <View style={[
                              styles.projectColorAccent,
                              { 
                                backgroundColor: project.color || goal.color || theme.primary,
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: scaleWidth(4),
                                borderTopLeftRadius: scaleWidth(12),
                                borderBottomLeftRadius: scaleWidth(12)
                              }
                            ]} />
                            
                            <View style={[
                              styles.projectHeader,
                              {
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: spacing.xs
                              }
                            ]}>
                              <View style={[
                                styles.projectTitleContainer,
                                {
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  flex: 1
                                }
                              ]}>
                                <View style={[
                                  styles.projectIconCircle,
                                  { 
                                    backgroundColor: colorWithOpacity(project.color || goal.color || theme.primary, 0.15),
                                    width: scaleWidth(28),
                                    height: scaleWidth(28),
                                    borderRadius: scaleWidth(14),
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: spacing.s
                                  }
                                ]}>
                                  <Ionicons 
                                    name={project.completed ? "checkmark-circle" : (project.isMilestone ? "diamond" : "folder")} 
                                    size={scaleWidth(16)} 
                                    color={project.color || goal.color || theme.primary} 
                                  />
                                </View>
                                <Text 
                                  style={[
                                    styles.projectTitle, 
                                    { 
                                      color: textColor,
                                      textDecorationLine: project.completed ? 'line-through' : 'none',
                                      opacity: project.completed ? 0.8 : 1,
                                      fontSize: fontSizes.m,
                                      fontWeight: '500',
                                      flex: 1
                                    }
                                  ]}
                                  maxFontSizeMultiplier={1.3}
                                  numberOfLines={2}
                                >
                                  {project.title}
                                </Text>
                                
                                {/* Add the completion suggestion badge here - only if NOT showing completion banner below */}
                                {!(areAllTasksCompleted(project) && 
                                   tasks.filter(task => task.projectId === project.id).length > 0 && 
                                   !project.completed && 
                                   project.status !== 'done') && (
                                  <CompletionSuggestionBadge 
                                    project={project} 
                                    color={project.color || goal.color || theme.primary} 
                                  />
                                )}
                              </View>
                              
                              <View style={[
                                styles.projectActions,
                                {
                                  flexDirection: 'row',
                                  alignItems: 'center'
                                }
                              ]}>
                                {/* Toggle project completion status */}
                                <TouchableOpacity 
                                  style={[
                                    styles.projectActionButton,
                                    { 
                                      backgroundColor: project.completed ?
                                        colorWithOpacity(project.color || goal.color || theme.primary, 0.2) :
                                        isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                      // Milestone buttons are wider and more prominent
                                      width: project.isMilestone ? scaleWidth(40) : scaleWidth(28),
                                      height: scaleWidth(28),
                                      borderRadius: project.isMilestone ? scaleWidth(20) : scaleWidth(14),
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginLeft: spacing.xs,
                                      // Add subtle border for milestones when not completed
                                      ...(project.isMilestone && !project.completed && {
                                        borderWidth: 1,
                                        borderColor: colorWithOpacity(project.color || goal.color || theme.primary, 0.3)
                                      })
                                    }
                                  ]}
                                  onPress={() => handleToggleProjectCompletion(project)}
                                  accessible={true}
                                  accessibilityRole="button"
                                  accessibilityLabel={project.isMilestone 
                                    ? (project.completed ? "Mark milestone as incomplete" : "Mark milestone as achieved")
                                    : (project.completed ? "Mark project as incomplete" : "Mark project as complete")
                                  }
                                  accessibilityState={{ checked: project.completed }}
                                >
                                  <Ionicons 
                                    name={project.isMilestone 
                                      ? (project.completed ? "medal" : "medal-outline")
                                      : (project.completed ? "refresh-outline" : "checkmark-done-outline")
                                    }
                                    size={project.isMilestone ? scaleWidth(16) : scaleWidth(14)}
                                    color={project.completed ? 
                                      project.color || goal.color || theme.primary : 
                                      (project.isMilestone ? (project.color || goal.color || theme.primary) : secondaryTextColor)
                                    } 
                                  />
                                </TouchableOpacity>
                                
                                {/* Only show details button for projects, not milestones */}
                                {!project.isMilestone && (
                                  <TouchableOpacity 
                                    style={[
                                      styles.projectActionButton,
                                      { 
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                        width: scaleWidth(28),
                                        height: scaleWidth(28),
                                        borderRadius: scaleWidth(14),
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginLeft: spacing.xs
                                      }
                                    ]}
                                    onPress={() => navigateToProject(project)}
                                    accessible={true}
                                    accessibilityRole="button"
                                    accessibilityLabel={`View details of ${project.title}`}
                                  >
                                    <Ionicons name="open-outline" size={scaleWidth(14)} color={secondaryTextColor} />
                                  </TouchableOpacity>
                                )}
                                
                                <TouchableOpacity 
                                  style={[
                                    styles.projectActionButton,
                                    { 
                                      backgroundColor: colorWithOpacity(project.color || goal.color || theme.primary, 0.15),
                                      width: scaleWidth(28),
                                      height: scaleWidth(28),
                                      borderRadius: scaleWidth(14),
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginLeft: spacing.xs
                                    }
                                  ]}
                                  onPress={() => toggleProject(project.id)}
                                  accessible={true}
                                  accessibilityRole="button"
                                  accessibilityLabel={expandedProjects[project.id] ? 
                                    `Collapse ${project.title} tasks` : 
                                    `Expand ${project.title} tasks`}
                                  accessibilityState={{ expanded: expandedProjects[project.id] }}
                                >
                                  <Ionicons 
                                    name={expandedProjects[project.id] ? 'chevron-up' : 'chevron-down'} 
                                    size={scaleWidth(14)} 
                                    color={project.color || goal.color || theme.primary} 
                                  />
                                </TouchableOpacity>
                              </View>
                            </View>
                            
                            {/* Project Progress */}
                            <View style={[
                              styles.progressContainer,
                              {
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: spacing.m
                              }
                            ]}>
                              <View style={[
                                styles.progressBar, 
                                { 
                                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                  flex: 1,
                                  height: scaleHeight(6),
                                  borderRadius: scaleWidth(3),
                                  marginRight: spacing.xs
                                }
                              ]}>
                                <View 
                                  style={[
                                    styles.progressFill, 
                                    { 
                                      width: `${Math.round(project.progress || 0)}%`, 
                                      backgroundColor: project.color || goal.color || theme.primary,
                                      height: '100%',
                                      borderRadius: scaleWidth(3)
                                    }
                                  ]} 
                                />
                              </View>
                              <Text 
                                style={[
                                  styles.progressText, 
                                  { 
                                    color: secondaryTextColor,
                                    fontSize: fontSizes.xs,
                                    width: scaleWidth(30),
                                    textAlign: 'right'
                                  }
                                ]}
                                maxFontSizeMultiplier={1.3}
                              >
                                {Math.round(project.progress || 0)}%
                              </Text>
                            </View>
                            
                            {/* Auto-suggestion banner when all tasks are complete */}
                            {areAllTasksCompleted(project) && 
                             tasks.filter(task => task.projectId === project.id).length > 0 && 
                             !project.completed && 
                             project.status !== 'done' && (
                              <View style={[
                                styles.completionSuggestion,
                                { 
                                  backgroundColor: colorWithOpacity(project.color || goal.color || theme.primary, 0.1),
                                  borderColor: project.color || goal.color || theme.primary,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  padding: spacing.s,
                                  borderRadius: scaleWidth(8),
                                  borderWidth: 1,
                                  borderStyle: 'dashed',
                                  marginTop: spacing.xs
                                }
                              ]}
                              accessible={true}
                              accessibilityRole="alert"
                              accessibilityLabel="Project completion suggestion"
                              >
                                <Ionicons 
                                  name="checkmark-circle" 
                                  size={scaleWidth(16)} 
                                  color={project.color || goal.color || theme.primary} 
                                />
                                <Text style={[
                                  styles.completionSuggestionText,
                                  { 
                                    color: textColor,
                                    flex: 1,
                                    fontSize: fontSizes.s,
                                    marginLeft: spacing.xs
                                  }
                                ]}
                                maxFontSizeMultiplier={1.3}
                                >
                                  All tasks complete. Mark project as finished?
                                </Text>
                                <TouchableOpacity
                                  style={[
                                    styles.completionSuggestionButton,
                                    { 
                                      backgroundColor: project.color || goal.color || theme.primary,
                                      paddingHorizontal: spacing.s,
                                      paddingVertical: spacing.xs,
                                      borderRadius: scaleWidth(16),
                                      marginLeft: spacing.xs
                                    }
                                  ]}
                                  onPress={() => handleToggleProjectCompletion(project)}
                                  accessible={true}
                                  accessibilityRole="button"
                                  accessibilityLabel="Mark project as complete"
                                >
                                  <Text 
                                    style={[
                                      styles.completionSuggestionButtonText,
                                      {
                                        color: '#FFFFFF',
                                        fontSize: fontSizes.xs,
                                        fontWeight: '600'
                                      }
                                    ]}
                                    maxFontSizeMultiplier={1.3}
                                  >
                                    Complete
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </TouchableOpacity>
                          
                          {/* Tasks for this Project */}
                          {expandedProjects[project.id] && (
                            <View style={[
                              styles.tasksContainer,
                              {
                                marginLeft: scaleWidth(40),
                                marginTop: spacing.xs
                              }
                            ]}>
                              {project.tasks && project.tasks.length > 0 ? (
                                // Display project tasks when available
                                project.tasks.map((task) => (
                                  <View 
                                    key={task.id} 
                                    style={[
                                      styles.taskWrapper,
                                      {
                                        marginTop: spacing.xs,
                                        flexDirection: 'row',
                                        alignItems: 'center'
                                      }
                                    ]}
                                  >
                                    {/* Connection line from project to task */}
                                    <View style={[
                                      styles.horizontalLine, 
                                      { 
                                        backgroundColor: colorWithOpacity(project.color || goal.color || theme.primary, 0.3),
                                        width: scaleWidth(15),
                                        height: scaleHeight(2),
                                        marginRight: spacing.xxs
                                      }
                                    ]} />
                                    
                                    {/* Task Item - Make entire area clickable */}
                                    <TouchableOpacity 
                                      style={[
                                        styles.taskItem, 
                                        { 
                                          backgroundColor: (task.completed || task.status === 'done') ? 
                                            colorWithOpacity(project.color || goal.color || theme.primary, 0.1) : 
                                            theme.card,
                                          borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                          shadowColor: isDarkMode ? '#000000' : 'rgba(0,0,0,0.15)',
                                          borderRadius: scaleWidth(10),
                                          padding: spacing.s,
                                          borderWidth: 1,
                                          flexDirection: 'row',
                                          alignItems: 'flex-start',
                                          flex: 1,
                                          shadowOffset: { width: 0, height: scaleHeight(1) },
                                          shadowOpacity: 0.1,
                                          shadowRadius: scaleWidth(2),
                                          elevation: 1,
                                          minHeight: scaleHeight(40)
                                        }
                                      ]}
                                      onPress={() => {
                                        console.log('🔍 Task clicked:', task.title);
                                        console.log('🔍 Task state at render:', { completed: task.completed, status: task.status });
                                        console.log('🔍 Visual state:', (task.completed || task.status === 'done'));
                                        handleToggleTask(task.id, project.id);
                                      }}
                                      onLongPress={(event) => {
                                        // First try to initiate drag, if no drag zones available, use context menu
                                        const dropZones = getAvailableDropZones(task, 'task');
                                        if (dropZones.length > 0) {
                                          handleLongPress(task, 'task');
                                        } else {
                                          handleTaskLongPress(task, project.id, event);
                                        }
                                      }}
                                      activeOpacity={0.7}
                                      accessible={true}
                                      accessibilityRole="button"
                                      accessibilityLabel={`Task: ${task.title}${(task.completed || task.status === 'done') ? ', Completed' : ''}`}
                                      accessibilityHint="Tap to toggle completion. Long press to show options"
                                      accessibilityState={{ checked: (task.completed || task.status === 'done') }}
                                    >
                                      {/* Checkbox visual indicator */}
                                      <View
                                        style={[
                                          styles.taskCheckCircle,
                                          {
                                            backgroundColor: (task.completed || task.status === 'done') ? 
                                              project.color || goal.color || theme.primary : 
                                              'transparent',
                                            borderColor: (task.completed || task.status === 'done') ? 
                                              'transparent' : 
                                              secondaryTextColor,
                                            width: scaleWidth(20),
                                            height: scaleWidth(20),
                                            borderRadius: scaleWidth(10),
                                            borderWidth: scaleWidth(2),
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: spacing.s,
                                            marginTop: spacing.xxs
                                          }
                                        ]}
                                      >
                                        {(task.completed || task.status === 'done') && (
                                          <Ionicons name="checkmark" size={scaleWidth(12)} color="#FFFFFF" />
                                        )}
                                      </View>
                                      
                                      <Text 
                                        style={[
                                          styles.taskTitle, 
                                          { 
                                            color: textColor,
                                            textDecorationLine: (task.completed || task.status === 'done') ? 'line-through' : 'none',
                                            opacity: (task.completed || task.status === 'done') ? 0.7 : 1,
                                            fontSize: fontSizes.s,
                                            flex: 1,
                                            lineHeight: scaleHeight(18),
                                            paddingTop: spacing.xxs
                                          }
                                        ]}
                                        maxFontSizeMultiplier={1.3}
                                      >
                                        {task.title}
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                ))
                              ) : (
                                // Show message when no tasks
                                <View style={[
                                  styles.noTasksContainer,
                                  {
                                    marginLeft: 0,
                                    marginTop: spacing.m,
                                    padding: spacing.xs
                                  }
                                ]}>
                                  <Text 
                                    style={[
                                      styles.noTasksText, 
                                      { 
                                        color: secondaryTextColor,
                                        fontSize: fontSizes.s,
                                        fontStyle: 'italic',
                                        textAlign: 'center'
                                      }
                                    ]}
                                    maxFontSizeMultiplier={1.3}
                                  >
                                    No tasks in this project
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}
                        </View>
                      ))
                    ) : (
                      // Show message when no projects
                      <View style={[
                        styles.noProjectsContainer,
                        {
                          marginLeft: 0,
                          marginTop: spacing.m,
                          padding: spacing.xs
                        }
                      ]}>
                        <Text 
                          style={[
                            styles.noProjectsText, 
                            { 
                              color: secondaryTextColor,
                              fontSize: fontSizes.s,
                              fontStyle: 'italic',
                              textAlign: 'center'
                            }
                          ]}
                          maxFontSizeMultiplier={1.3}
                        >
                          Nothing in this goal
                        </Text>
                      </View>
                    )}
                    
                    {/* Direct Tasks for this Goal (below milestones) */}
                    {goal.directTasks && goal.directTasks.length > 0 && (
                      <View style={[
                        styles.directTasksContainer,
                        {
                          marginTop: spacing.m,
                          paddingTop: spacing.s,
                          borderTopWidth: 1,
                          borderTopColor: colorWithOpacity(goal.color || theme.primary, 0.2)
                        }
                      ]}>
                        {goal.directTasks.map((task) => (
                          <View key={task.id} style={[
                            styles.taskWrapper,
                            {
                              marginTop: spacing.xs,
                              position: 'relative'
                            }
                          ]}>
                            {/* Connection line from goal to direct task */}
                            <View style={[
                              styles.verticalLine, 
                              { 
                                backgroundColor: colorWithOpacity(goal.color || theme.primary, 0.3),
                                width: scaleWidth(2),
                                height: scaleHeight(16),
                                position: 'absolute',
                                left: scaleWidth(10),
                                top: scaleHeight(-8)
                              }
                            ]} />
                            
                            <TouchableOpacity 
                              style={[
                                styles.taskItem, 
                                { 
                                  backgroundColor: theme.card,
                                  borderColor: theme.border,
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  paddingHorizontal: spacing.m,
                                  paddingVertical: spacing.s,
                                  borderRadius: scaleWidth(12),
                                  borderWidth: 1,
                                  marginLeft: scaleWidth(20)
                                }
                              ]}
                              onPress={() => {
                                // Handle direct task toggle
                                if (typeof updateTask === 'function') {
                                  updateTask(null, task.id, { completed: !task.completed });
                                }
                              }}
                              accessible={true}
                              accessibilityRole="button"
                              accessibilityLabel={`Direct task: ${task.title || task.name}`}
                              accessibilityState={{ checked: task.completed }}
                            >
                              <View style={[
                                styles.taskCheckCircle, 
                                {
                                  width: scaleWidth(20),
                                  height: scaleWidth(20),
                                  borderRadius: scaleWidth(10),
                                  borderWidth: 2,
                                  marginRight: spacing.s,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderColor: task.completed ? (goal.color || theme.primary) : theme.border,
                                  backgroundColor: task.completed ? (goal.color || theme.primary) : 'transparent'
                                }
                              ]}>
                                {task.completed && (
                                  <Ionicons 
                                    name="checkmark" 
                                    size={scaleWidth(12)} 
                                    color="#FFFFFF" 
                                  />
                                )}
                              </View>
                              <Text 
                                style={[
                                  styles.taskTitle, 
                                  {
                                    color: task.completed ? theme.textSecondary : theme.text,
                                    textDecorationLine: task.completed ? 'line-through' : 'none',
                                    fontSize: fontSizes.s,
                                    flex: 1
                                  }
                                ]}
                                numberOfLines={2}
                                maxFontSizeMultiplier={1.3}
                              >
                                {task.title || task.name}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </Animated.View>
              );
            })}
            </>
          ) : (
            <View style={[
              styles.emptyState,
              {
                alignItems: 'center',
                justifyContent: 'center',
                padding: spacing.xl,
                marginTop: scaleHeight(80),
                marginBottom: scaleHeight(80)
              }
            ]}>
              <View style={[
                styles.emptyStateIconContainer,
                { 
                  backgroundColor: colorWithOpacity(theme.primary, 0.1),
                  width: scaleWidth(100),
                  height: scaleWidth(100),
                  borderRadius: scaleWidth(50),
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: spacing.m
                }
              ]}>
                <Ionicons name="flag-outline" size={scaleWidth(60)} color={theme.primary} />
              </View>
              <Text 
                style={[
                  styles.emptyStateTitle, 
                  { 
                    color: textColor,
                    fontSize: fontSizes.xl,
                    fontWeight: '600',
                    marginBottom: spacing.xs
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                No goals added yet
              </Text>
              <Text 
                style={[
                  styles.emptyStateSubtitle, 
                  { 
                    color: secondaryTextColor,
                    fontSize: fontSizes.m,
                    textAlign: 'center',
                    marginBottom: spacing.l
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Start building your life plan by adding goals
              </Text>
              
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Drop Zones Overlay - only show when dragging */}
      {dragState.isDragging && (
        <View style={[
          styles.dropZonesOverlay,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }
        ]}>
          <View style={[
            styles.dropZonesContainer,
            {
              backgroundColor: theme.card,
              borderRadius: scaleWidth(16),
              padding: spacing.l,
              margin: spacing.l,
              maxWidth: '80%'
            }
          ]}>
            <Text style={[
              styles.dropZonesTitle,
              {
                color: theme.text,
                fontSize: fontSizes.l,
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: spacing.m
              }
            ]}>
              Drop {dragState.draggedItemType} here:
            </Text>
            
            {dragState.dropZones.map((zone) => (
              <TouchableOpacity
                key={zone.id || 'standalone'}
                style={[
                  styles.dropZone,
                  {
                    backgroundColor: zone.type === 'standalone' ? theme.backgroundSecondary : theme.primary + '15',
                    borderColor: zone.type === 'standalone' ? theme.border : theme.primary,
                    borderWidth: 2,
                    borderRadius: scaleWidth(12),
                    padding: spacing.m,
                    marginVertical: spacing.xs,
                    alignItems: 'center'
                  }
                ]}
                onPress={() => handleDrop(zone.id)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Move to ${zone.name}`}
              >
                <Text style={[
                  styles.dropZoneText,
                  {
                    color: zone.type === 'standalone' ? theme.text : theme.primary,
                    fontSize: fontSizes.m,
                    fontWeight: '600'
                  }
                ]}>
                  {zone.name}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[
                styles.cancelDrop,
                {
                  backgroundColor: theme.error + '15',
                  borderColor: theme.error,
                  borderWidth: 1,
                  borderRadius: scaleWidth(12),
                  padding: spacing.m,
                  marginTop: spacing.m,
                  alignItems: 'center'
                }
              ]}
              onPress={handleDragEnd}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel drag"
            >
              <Text style={[
                styles.cancelDropText,
                {
                  color: theme.error,
                  fontSize: fontSizes.m,
                  fontWeight: '600'
                }
              ]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Context Menu */}
      <Modal
        visible={contextMenu.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeContextMenu}
        accessible={true}
        accessibilityViewIsModal={true}
        accessibilityLabel="Context menu"
      >
        <TouchableWithoutFeedback onPress={closeContextMenu}>
          <View style={[
            styles.contextMenuOverlay,
            {
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              justifyContent: 'flex-start',
              alignItems: 'flex-start'
            }
          ]}>
            <View style={[
              styles.contextMenuContainer,
              { 
                position: 'absolute',
                top: Math.max(contextMenu.position.y - 10, 50),
                left: Math.min(contextMenu.position.x - 10, Dimensions.get('window').width - 150),
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: scaleWidth(12),
                shadowColor: isDarkMode ? '#000000' : 'rgba(0,0,0,0.2)',
                shadowOffset: { width: 0, height: scaleHeight(4) },
                shadowOpacity: 0.3,
                shadowRadius: scaleWidth(8),
                elevation: 8,
                minWidth: scaleWidth(130),
                overflow: 'hidden'
              }
            ]}>
              <TouchableOpacity
                style={[
                  styles.contextMenuItem,
                  { 
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.m,
                    borderBottomWidth: 1,
                    borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }
                ]}
                onPress={() => handleContextMenuAction('open')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Open ${contextMenu.type}`}
              >
                <Ionicons 
                  name="open-outline" 
                  size={scaleWidth(18)} 
                  color={theme.primary}
                  style={{ marginRight: spacing.s }}
                />
                <Text 
                  style={[
                    styles.contextMenuText,
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      fontWeight: '500'
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Open
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.contextMenuItem,
                  { 
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.m
                  }
                ]}
                onPress={() => handleContextMenuAction('delete')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${contextMenu.type}`}
              >
                <Ionicons 
                  name="trash-outline" 
                  size={scaleWidth(18)} 
                  color="#FF6B6B"
                  style={{ marginRight: spacing.s }}
                />
                <Text 
                  style={[
                    styles.contextMenuText,
                    { 
                      color: "#FF6B6B",
                      fontSize: fontSizes.m,
                      fontWeight: '500'
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModal(prev => ({ ...prev, visible: false }))}
      >
        <View style={[
          styles.deleteModalOverlay,
          {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.m,
          }
        ]}>
          <View style={[
            styles.deleteModalContainer, 
            { 
              backgroundColor: theme.surface || theme.background,
              width: '100%',
              maxWidth: scaleWidth(320),
              borderRadius: scaleWidth(16),
              padding: spacing.xl,
              shadowColor: isDarkMode ? '#000000' : 'rgba(0,0,0,0.3)',
              shadowOffset: { width: 0, height: scaleHeight(8) },
              shadowOpacity: 0.4,
              shadowRadius: scaleWidth(24),
              elevation: 8,
            }
          ]}>
            <View style={[
              styles.deleteModalHeader,
              {
                alignItems: 'center',
                marginBottom: spacing.l,
              }
            ]}>
              <Ionicons name="trash-outline" size={scaleWidth(40)} color={theme.error} />
              <Text 
                style={[
                  styles.deleteModalTitle,
                  { 
                    color: theme.text,
                    fontSize: fontSizes.xl,
                    fontWeight: '600',
                    textAlign: 'center',
                    marginTop: spacing.m,
                    letterSpacing: 0.3,
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Delete {deleteModal.type === 'goal' 
                  ? 'Goal' 
                  : deleteModal.type === 'project' 
                    ? (deleteModal.item?.isMilestone ? 'Milestone' : 'Project')
                    : 'Task'}
              </Text>
            </View>
            
            <Text 
              style={[
                styles.deleteModalMessage,
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.m,
                  textAlign: 'center',
                  marginBottom: spacing.xl,
                  lineHeight: fontSizes.m * 1.4,
                  opacity: 0.8,
                  fontWeight: '400',
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {deleteModal.type === 'goal' && deleteModal.item
                ? getLinkedProjectsCount(deleteModal.item.id) > 0
                  ? `Delete this goal and ${getLinkedProjectsCount(deleteModal.item.id)} linked ${getLinkedProjectsCount(deleteModal.item.id) === 1 ? 'project' : 'projects'}?`
                  : 'Delete this goal?'
                : deleteModal.type === 'project'
                  ? 'Delete this project and all its tasks?'
                  : 'Delete this task?'
              }
            </Text>
            
            <View style={[
              styles.deleteModalButtons,
              {
                flexDirection: 'row',
                gap: spacing.s,
              }
            ]}>
              <TouchableOpacity
                style={[
                  styles.deleteModalButton, 
                  styles.deleteCancelButton, 
                  { 
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    flex: 1,
                    paddingVertical: spacing.m,
                    borderRadius: scaleWidth(12),
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: accessibility.minTouchTarget,
                    borderWidth: 1,
                  }
                ]}
                onPress={() => setDeleteModal(prev => ({ ...prev, visible: false }))}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                accessibilityHint="Cancels the delete operation"
              >
                <Text style={[
                  styles.deleteButtonText, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.m,
                    fontWeight: '500',
                    letterSpacing: 0.2,
                  }
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.deleteModalButton, 
                  styles.deleteConfirmButton,
                  {
                    backgroundColor: deleteModal.isDeleting ? '#FF6B6B' : '#FF3B30',
                    flex: 1,
                    paddingVertical: spacing.m,
                    borderRadius: scaleWidth(12),
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: accessibility.minTouchTarget,
                    opacity: deleteModal.isDeleting ? 0.7 : 1,
                  }
                ]}
                onPress={() => {
                  if (deleteModal.isDeleting) return; // Prevent multiple taps
                  
                  if (deleteModal.type === 'goal' && deleteModal.item) {
                    handleConfirmDeleteGoal(deleteModal.item);
                  } else if (deleteModal.type === 'project' && deleteModal.item) {
                    handleConfirmDeleteProject(deleteModal.item);
                  } else if (deleteModal.type === 'task' && deleteModal.item && deleteModal.projectId) {
                    handleConfirmDeleteTask(deleteModal.item, deleteModal.projectId);
                  }
                }}
                disabled={deleteModal.isDeleting}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${deleteModal.type === 'goal' 
                  ? 'Goal' 
                  : deleteModal.type === 'project' 
                    ? (deleteModal.item?.isMilestone ? 'Milestone' : 'Project')
                    : 'Task'}`}
                accessibilityHint={`Permanently deletes this ${deleteModal.type === 'goal' 
                  ? 'goal' 
                  : deleteModal.type === 'project' 
                    ? (deleteModal.item?.isMilestone ? 'milestone' : 'project')
                    : 'task'}`}
              >
                <Text style={[
                  styles.deleteButtonText, 
                  styles.deleteConfirmText,
                  {
                    color: '#FFFFFF',
                    fontSize: fontSizes.m,
                    fontWeight: '600',
                    letterSpacing: 0.2,
                  }
                ]}>
                  {deleteModal.isDeleting ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Floating Add Button - positioned at bottom left, same as GoalsScreen */}
      {!isFullscreen && (
        <Animated.View 
        style={[
          styles.floatingAddButton,
          { 
            transform: [{ scale: addButtonScale }],
            bottom: scaleHeight(20),
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
          onPress={handleAddButtonPress}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Add new item"
          accessibilityHint="Opens selection menu for goals, milestones, or tasks"
        >
          <Ionicons name="add" size={scaleWidth(24)} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
      )}
      
      {/* Delete All Button - only show if items exist and not in fullscreen */}
      {!isFullscreen && (goals.length > 0 || getStandaloneProjects().length > 0 || getStandaloneTasks().length > 0 || projects.filter(p => p.goalId).length > 0 || tasks.filter(t => t.goalId || t.projectId).length > 0) && (
        <TouchableOpacity
          style={[
            styles.deleteAllButton,
            {
              backgroundColor: theme.error,
              borderColor: theme.border,
              bottom: insets.bottom + spacing.m,
            }
          ]}
          onPress={() => setShowDeleteAllModal(true)}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Delete all items"
          accessibilityHint="Deletes all goals, milestones, and tasks"
        >
          <Ionicons name="trash-outline" size={scaleWidth(20)} color="#FFFFFF" />
          <Text style={[styles.deleteAllButtonText, { color: '#FFFFFF' }]}>
            Delete All
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Add Selection Modal */}
      <AddSelectionModal
        visible={showAddSelectionModal}
        onClose={() => setShowAddSelectionModal(false)}
        onSelectOption={handleSelectionModalChoice}
      />
      
      {/* Delete All Confirmation Modal */}
      <Modal
        visible={showDeleteAllModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteAllModal(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={[styles.deleteModalContent, { backgroundColor: theme.card }]}>
            <View style={styles.deleteModalHeader}>
              <Ionicons name="warning" size={scaleWidth(48)} color={theme.error} />
              <Text style={[styles.deleteModalTitle, { color: theme.text }]}>
                Delete Everything?
              </Text>
              <Text style={[styles.deleteModalMessage, { color: theme.textSecondary }]}>
                This will permanently delete all your goals ({goals.length}), milestones ({getStandaloneProjects().length + projects.filter(p => p.goalId).length}), and tasks ({getStandaloneTasks().length + tasks.filter(t => t.goalId || t.projectId).length}).
              </Text>
              <Text style={[styles.deleteModalWarning, { color: theme.error }]}>
                This action cannot be undone.
              </Text>
            </View>
            
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[styles.deleteModalButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={() => setShowDeleteAllModal(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel deletion"
              >
                <Text style={[styles.deleteModalButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.deleteModalButton, { backgroundColor: theme.error }]}
                onPress={handleDeleteAll}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Confirm delete all"
              >
                <Text style={[styles.deleteModalButtonText, { color: '#FFFFFF' }]}>
                  Delete All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    // Header styles handled inline
  },
  headerButton: {
    // Header button styles handled inline  
  },
  editModeIndicator: {
    // Edit mode indicator styles handled inline
  },
  editModeText: {
    // Edit mode text styles handled inline
  },
  dragHandle: {
    // Drag handle styles handled inline
  },
  dropZonesOverlay: {
    // Drop zones overlay styles handled inline
  },
  dropZonesContainer: {
    // Drop zones container styles handled inline
  },
  dropZonesTitle: {
    // Drop zones title styles handled inline
  },
  dropZone: {
    // Drop zone styles handled inline
  },
  dropZoneText: {
    // Drop zone text styles handled inline
  },
  cancelDrop: {
    // Cancel drop styles handled inline
  },
  cancelDropText: {
    // Cancel drop text styles handled inline
  },
  iconBackground: {},
  scrollView: {},
  sectionTitle: {},
  sectionTitleText: {},
  hierarchyContainer: {},
  hierarchyItem: {},
  goalItem: {},
  goalAccent: {},
  goalHeader: {},
  goalTitleContainer: {},
  goalIconCircle: {},
  goalTitle: {},
  goalStats: {},
  goalStatsText: {},
  statsDivider: {},
  expandIndicator: {},
  progressBarContainer: {},
  progressBarTrack: {},
  progressBarFill: {},
  goalFooter: {},
  goalButton: {},
  goalButtonText: {},
  progressContainer: {},
  progressBar: {},
  progressFill: {},
  progressText: {},
  projectsContainer: {},
  projectWrapper: {},
  verticalLine: {},
  projectItem: {},
  projectColorAccent: {},
  projectHeader: {},
  projectTitleContainer: {},
  projectIconCircle: {},
  projectTitle: {},
  projectActions: {},
  projectActionButton: {},
  tasksContainer: {},
  taskWrapper: {},
  horizontalLine: {},
  taskItem: {},
  taskCheckCircle: {},
  taskTitle: {},
  noTasksContainer: {},
  noTasksText: {},
  noProjectsContainer: {},
  noProjectsText: {},
  emptyState: {},
  emptyStateIconContainer: {},
  emptyStateTitle: {},
  emptyStateSubtitle: {},
  emptyStateButton: {},
  emptyStateButtonText: {},
  completionSuggestion: {},
  completionSuggestionText: {},
  completionSuggestionButton: {},
  completionSuggestionButtonText: {},
  completionBadge: {},
  completionBadgeText: {},
  modalOverlay: {},
  modalContent: {},
  modalHeader: {},
  modalTitle: {},
  modalCloseButton: {},
  modalDescription: {},
  modalFooter: {},
  modalButton: {},
  modalButtonFull: {},
  modalButtonText: {},
  contextMenuOverlay: {},
  contextMenuContainer: {},
  contextMenuItem: {},
  contextMenuText: {},
  // Delete Modal Styles (matching GoalDetailsScreen and ProjectDetailsScreen)
  deleteModalOverlay: {},
  deleteModalContainer: {},
  deleteModalHeader: {},
  deleteModalTitle: {},
  deleteModalMessage: {},
  deleteModalButtons: {},
  deleteModalButton: {},
  deleteCancelButton: {},
  deleteConfirmButton: {},
  deleteButtonText: {},
  deleteConfirmText: {},
  
  // Floating Add Button Styles
  floatingAddButton: {
    position: 'absolute',
    zIndex: 100,
  },
  floatingAddButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  
  // Delete All Button Styles
  deleteAllButton: {
    position: 'absolute',
    right: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(20),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 99,
  },
  deleteAllButtonText: {
    fontSize: fontSizes.s,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  deleteModalContent: {
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    width: '100%',
    maxWidth: scaleWidth(400),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  deleteModalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    marginTop: spacing.s,
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: fontSizes.m,
    textAlign: 'center',
    lineHeight: fontSizes.m * 1.4,
    marginBottom: spacing.s,
  },
  deleteModalWarning: {
    fontSize: fontSizes.s,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: scaleWidth(8),
    borderWidth: 1,
    alignItems: 'center',
    minHeight: accessibility.minTouchTarget,
  },
  deleteModalButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
});

export default LifePlanOverviewScreen;