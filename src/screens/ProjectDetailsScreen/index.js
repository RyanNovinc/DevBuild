// src/screens/MilestoneDetailsScreen/index.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  SafeAreaView,
  ActivityIndicator,
  BackHandler,
  Alert,
  Platform,
  Animated,
  ScrollView,
  StatusBar,
  Easing,
  Modal // Add Modal import
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleWidth, scaleHeight, isSmallDevice, isTablet, fontSizes, spacing } from '../../utils/responsive';

// Import components
import MilestoneHeader from './components/MilestoneHeader';
import * as FeatureExplorerTracker from '../../services/FeatureExplorerTracker';
import MilestoneTabs from './components/MilestoneTabs';
import MilestoneDetailsForm from './components/MilestoneDetailsForm';
import TaskListView from './components/TaskListView';
import TaskDetailModal from './components/TaskDetailModal';
import GoalSelectorModal from './components/GoalSelectorModal';
import UnsavedChangesModal from './components/UnsavedChangesModal';

// Import external AddTaskModal component for compatibility
import AddTaskModalExternal from '../../components/AddTaskModal';

// Import the new MilestonePreview component
import MilestonePreview from './components/MilestonePreview';

// Import subscription UI components - removed FeatureLimitBanner
import { FREE_PLAN_LIMITS } from '../../services/SubscriptionService';

const MilestoneDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const { 
    milestones, 
    goals,
    tasks,
    isMilestoneActive, 
    updateMilestone, 
    addMilestone, 
    deleteMilestone, 
    addTask,
    updateTask,
    deleteTask,
    mainGoals,
    userSubscriptionStatus 
  } = useAppContext();
  
  const { showSuccess, showError } = useNotification();
  
  const { mode, milestoneId, preselectedGoalId } = route.params || { mode: 'create' };
  const isCreating = mode === 'create';
  
  // Check if user is a Pro member
  const isPro = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const saveButtonScale = useRef(new Animated.Value(1)).current;
  
  // Add state for upgrade modal (similar to GoalsScreen)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  
  // Keep track of component mount state
  const isMounted = useRef(true);
  
  // Track deletion state to prevent further component updates
  const isDeleting = useRef(false);
  
  // Track if we've loaded the milestone to prevent reloading over local changes
  const hasLoadedMilestone = useRef(false);
  
  // Milestone details state
  const [milestoneState, setMilestoneState] = useState({
    title: '',
    description: '',
    color: '#4CAF50',
    dueDate: new Date(),
    hasDueDate: false
  });
  
  // UI state
  const [uiState, setUiState] = useState({
    activeTab: 'details',
    showDatePicker: false,
    showAddTaskModal: false,
    showTaskDetailModal: false,
    showGoalSelector: false,
    showUnsavedChangesModal: false,
    showDeleteConfirmModal: false,
    isLoading: false,
    saveAttempted: false,
    hasUnsavedChanges: false,
    isEditingTask: false
  });
  
  // Selected goal ID state
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  
  // Task state
  const [currentTask, setCurrentTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Unsaved changes tracking
  const [initialValues, setInitialValues] = useState({});
  
  // Filter for available goals
  const availableGoals = Array.isArray(mainGoals) && mainGoals.length > 0 
    ? mainGoals 
    : (Array.isArray(goals) ? goals : []);
    
  // Refs
  const scrollViewRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Log for debugging
  useEffect(() => {
    console.log("Available goals:", availableGoals.length);
    console.log("Preselected goal ID:", preselectedGoalId);
  }, [availableGoals, preselectedGoalId]);

  // Handle Android back button
  useEffect(() => {
    const handleBackPress = () => {
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => subscription.remove();
  }, []);

  // Update check for unsaved changes whenever relevant state changes
  useEffect(() => {
    // Skip the initial render
    if (Object.keys(initialValues).length === 0) return;
    
    // Check if any values are different from initial
    const hasChanges = 
      milestoneState.title !== initialValues.title ||
      milestoneState.description !== initialValues.description ||
      milestoneState.color !== initialValues.color ||
      selectedGoalId !== initialValues.selectedGoalId ||
      milestoneState.hasDueDate !== initialValues.hasDueDate ||
      (milestoneState.hasDueDate && milestoneState.dueDate.toISOString() !== initialValues.dueDate?.toISOString());
    
    setUiState(prev => ({
      ...prev,
      hasUnsavedChanges: hasChanges
    }));
  }, [milestoneState, selectedGoalId, initialValues]);

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

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
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

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      console.log(`MilestoneDetailsScreen unmounting for milestone ID: ${milestoneId}`);
      isMounted.current = false;
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [milestoneId]);

  // Custom back button handler
  const handleBackPress = () => {
    if (uiState.hasUnsavedChanges) {
      setUiState(prev => ({
        ...prev,
        showUnsavedChangesModal: true
      }));
    } else {
      // Check where we came from and navigate accordingly
      if (route.params?.previousScreen === 'LifePlanOverview') {
        // Navigate directly back to LifePlanOverview (from ProfileTab settings)
        navigation.navigate('LifePlanOverview');
      } else if (route.params?.previousScreen === 'GoalsTab') {
        // Navigate back within the same stack (smooth slide animation)
        navigation.goBack();
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
    
    // Check where we came from and navigate accordingly
    if (route.params?.previousScreen === 'LifePlanOverview') {
      // Navigate directly to LifePlanOverview (from ProfileTab settings)
      navigation.navigate('LifePlanOverview');
    } else if (route.params?.previousScreen === 'GoalsTab') {
      // Navigate back within the same stack (smooth slide animation)
      navigation.goBack();
    } else {
      navigation.goBack();
    }
  };

  // Load milestone if editing or handle preselected goal when creating
  useEffect(() => {
    // Skip loading if we're in deletion process
    if (isDeleting.current) return;
    
    // Skip if we've already loaded this milestone (prevents overriding local changes)
    if (!isCreating && hasLoadedMilestone.current) return;

    try {
      if (!isCreating && milestoneId) {
        // Safety check to ensure milestones is an array
        if (!Array.isArray(milestones)) {
          console.error("Milestones is not an array:", milestones);
          setMilestoneState(prev => ({
            ...prev,
            title: "Error: Milestone data unavailable",
            description: "There was an error loading the milestone data. Please go back and try again."
          }));
          showError("Error loading milestone data");
          return;
        }
        
        // Use the safer isMilestoneActive check if available
        if (typeof isMilestoneActive === 'function' && !isMilestoneActive(milestoneId)) {
          console.error(`Milestone with ID ${milestoneId} is not active or has been deleted`);
          setMilestoneState(prev => ({
            ...prev,
            title: "Milestone Not Found or Deleted",
            description: "This milestone may have been deleted or is no longer available."
          }));
          
          if (!isDeleting.current) {
            showError("Milestone not found");
          }
          
          return;
        }
        
        const milestone = milestones.find(p => p.id === milestoneId);
        if (milestone) {
          console.log(`Loading milestone: "${milestone.title}" (ID: ${milestoneId})`);
          const titleValue = milestone.title || "";
          const descriptionValue = milestone.description || '';
          const colorValue = milestone.color || '#4CAF50';
          const goalIdValue = milestone.goalId || null;
          
          // Handle due date
          let hasDueDateValue = false;
          let dueDateValue = new Date();
          
          if (milestone.dueDate) {
            try {
              const dateObj = new Date(milestone.dueDate);
              if (!isNaN(dateObj.getTime())) {
                hasDueDateValue = true;
                dueDateValue = dateObj;
              } else {
                console.warn("Invalid date format:", milestone.dueDate);
              }
            } catch (dateError) {
              console.error("Error parsing date:", dateError);
            }
          }
          
          // Get tasks from global tasks array instead of milestone.tasks
          const milestoneTasks = Array.isArray(tasks) 
            ? tasks.filter(task => task.milestoneId === milestoneId)
            : [];
          
          // FIXED: Ensure all tasks have proper status property with better fallback logic
          const updatedTasks = milestoneTasks.map(task => {
            let status = task.status;
            
            // If no status is set, determine it based on completion
            if (!status) {
              if (task.completed) {
                status = 'done';
              } else {
                status = 'todo';
              }
            }
            
            // Ensure completed property is consistent with status
            const completed = status === 'done' || task.completed;
            
            return {
              ...task,
              status: status,
              completed: completed
            };
          });
          
          setMilestoneState({
            title: titleValue,
            description: descriptionValue,
            color: colorValue,
            dueDate: dueDateValue,
            hasDueDate: hasDueDateValue
          });
          
          setSelectedGoalId(goalIdValue);
          
          // Store initial values to track changes
          setInitialValues({
            title: titleValue,
            description: descriptionValue,
            color: colorValue,
            selectedGoalId: goalIdValue,
            hasDueDate: hasDueDateValue,
            dueDate: dueDateValue
          });
          
          setUiState(prev => ({
            ...prev,
            hasUnsavedChanges: false
          }));
          
          // Mark that we've loaded the milestone
          hasLoadedMilestone.current = true;
        } else {
          // Only show error if not in deletion process
          if (!isDeleting.current) {
            console.error(`Milestone with ID ${milestoneId} not found in`, milestones);
            setMilestoneState(prev => ({
              ...prev,
              title: "Milestone Not Found",
              description: "This milestone may have been deleted or is no longer available."
            }));
            showError("Milestone not found");
          }
        }
      } else if (isCreating) {
        // Handle preselected goal from navigation params
        const titleValue = '';
        const descriptionValue = '';
        const colorValue = '#4CAF50';
        let goalIdValue = null;
        
        if (preselectedGoalId && preselectedGoalId !== 'all') {
          console.log(`Setting preselected goal ID: ${preselectedGoalId}`);
          goalIdValue = preselectedGoalId;
          
          // Find the goal in either mainGoals or goals
          const selectedGoal = 
            (Array.isArray(mainGoals) ? mainGoals.find(g => g.id === preselectedGoalId) : null) ||
            (Array.isArray(goals) ? goals.find(g => g.id === preselectedGoalId) : null);
          
          if (selectedGoal && selectedGoal.color) {
            setMilestoneState(prev => ({
              ...prev,
              color: selectedGoal.color
            }));
            console.log(`Set color to ${selectedGoal.color} from goal: ${selectedGoal.title}`);
          }
        }
        
        setSelectedGoalId(goalIdValue);
        
        // Store initial values for new milestone
        setInitialValues({
          title: titleValue,
          description: descriptionValue,
          color: colorValue,
          selectedGoalId: goalIdValue,
          hasDueDate: false,
          dueDate: new Date()
        });
        
        setUiState(prev => ({
          ...prev,
          hasUnsavedChanges: false
        }));
      }
    } catch (error) {
      console.error("Error in milestone loading effect:", error);
      setMilestoneState(prev => ({
        ...prev,
        title: "Error Loading Milestone",
        description: "An unexpected error occurred while loading the milestone data."
      }));
      showError("Error loading milestone data");
    }
  }, [isCreating, milestoneId, preselectedGoalId, mainGoals, goals, isMilestoneActive, showError, milestones, tasks]); 
  
  // Update color when goal is selected
  useEffect(() => {
    if (isDeleting.current) return;
    
    if (selectedGoalId) {
      const selectedGoal = availableGoals.find(g => g.id === selectedGoalId);
      if (selectedGoal && selectedGoal.color) {
        setMilestoneState(prev => ({
          ...prev,
          color: selectedGoal.color
        }));
      }
    }
  }, [selectedGoalId, availableGoals]);

  // Check if user can add more tasks based on subscription
  const canAddMoreTasks = () => {
    // Pro users have unlimited tasks
    if (isPro) return true;
    
    // Get current tasks for this milestone from global tasks array
    const currentMilestoneTasks = Array.isArray(tasks) 
      ? tasks.filter(task => task.milestoneId === milestoneId)
      : [];
    
    // Free users are limited
    return currentMilestoneTasks.length < FREE_PLAN_LIMITS.MAX_TASKS_PER_MILESTONE;
  };

  // Show upgrade modal (similar to GoalsScreen)
  const showUpgradePrompt = (message) => {
    setUpgradeMessage(message);
    setShowUpgradeModal(true);
  };
  
  // Navigate to pricing screen
  const goToPricingScreen = () => {
    setShowUpgradeModal(false);
    navigation.navigate('PricingScreen');
  };
  
  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setUiState(prev => ({
        ...prev,
        showDatePicker: false
      }));
    }
    
    if (selectedDate) {
      setMilestoneState(prev => ({
        ...prev,
        dueDate: selectedDate
      }));
    }
  };
  
  // View task details
  const handleViewTask = (task) => {
    if (isDeleting.current) return;
    setSelectedTask(task);
    setUiState(prev => ({
      ...prev,
      showTaskDetailModal: true
    }));
  };
  
  // Add or edit task
  const handleAddTask = async (task) => {
    if (isDeleting.current) return;
    
    if (uiState.isEditingTask && currentTask) {
      // Update existing task using global updateTask function
      try {
        const updatedTaskData = { 
          ...task, 
          status: task.status || currentTask.status || 'todo',
          completed: task.completed || false,
          updatedAt: new Date().toISOString()
        };
        
        await updateTask(milestoneId, currentTask.id, updatedTaskData);
        
        setUiState(prev => ({
          ...prev,
          isEditingTask: false
        }));
        setCurrentTask(null);
        showSuccess('Task updated successfully');
      } catch (error) {
        console.error('Error updating task:', error);
        showError('Failed to update task');
        return;
      }
    } else {
      // Check if can add more tasks
      if (!canAddMoreTasks()) {
        setUiState(prev => ({
          ...prev,
          showAddTaskModal: false
        }));
        
        // Show upgrade modal instead of banner
        showUpgradePrompt(
          `You've reached the limit of ${FREE_PLAN_LIMITS.MAX_TASKS_PER_MILESTONE} tasks per milestone. Upgrade to Pro for unlimited tasks.`
        );
        return;
      }
      
      // Add new task using global addTask function
      try {
        const newTaskData = { 
          ...task, 
          status: task.status || 'todo',
          completed: task.completed || false,
          createdAt: new Date().toISOString()
        };
        
        await addTask(milestoneId, newTaskData);
        showSuccess('Task added successfully');
      } catch (error) {
        console.error('Error adding task:', error);
        showError('Failed to add task');
        return;
      }
    }
    setUiState(prev => ({
      ...prev,
      showAddTaskModal: false
    }));
  };
  
  // Handle opening the add task modal with limit check
  const handleOpenAddTaskModal = () => {
    // Check if user can add more tasks
    if (!canAddMoreTasks()) {
      // Show upgrade modal instead of banner
      showUpgradePrompt(
        `You've reached the limit of ${FREE_PLAN_LIMITS.MAX_TASKS_PER_MILESTONE} tasks per milestone. Upgrade to Pro for unlimited tasks.`
      );
      return;
    }
    
    // Find the goal title for the selected goal
    let goalTitle = "";
    if (selectedGoalId) {
      const goal = availableGoals.find(g => g.id === selectedGoalId);
      if (goal) {
        goalTitle = goal.title;
      }
    }
    
    // Create pre-filled task with milestone and goal information
    const prefilledTask = {
      milestoneId: milestoneId,
      milestoneTitle: milestoneState.title,
      goalId: selectedGoalId,
      goalTitle: goalTitle,
      title: "",
      description: ""
    };
    
    // If user can add more tasks, proceed to open the modal with pre-filled milestone info
    setCurrentTask(prefilledTask);
    setUiState(prev => ({
      ...prev,
      isEditingTask: false,
      showAddTaskModal: true
    }));
  };
  
  // Edit task
  const handleEditTask = (task) => {
    if (isDeleting.current) return;
    setCurrentTask(task);
    setUiState(prev => ({
      ...prev,
      isEditingTask: true,
      showAddTaskModal: true,
      showTaskDetailModal: false
    }));
  };
  
  // Toggle task completion
  const handleToggleTask = async (taskId) => {
    if (isDeleting.current) return;
    
    try {
      // Find the task in global tasks array
      const task = tasks.find(t => t.id === taskId && t.milestoneId === milestoneId);
      if (!task) {
        console.error(`Task ${taskId} not found`);
        return;
      }
      
      const newCompleted = !task.completed;
      const newStatus = newCompleted ? 'done' : 'todo';
      
      console.log(`[Toggle] Task ${taskId}: completed=${newCompleted}, status=${newStatus}`);
      
      const updatedTaskData = {
        ...task,
        completed: newCompleted,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      await updateTask(milestoneId, taskId, updatedTaskData);
    } catch (error) {
      console.error('Error toggling task:', error);
      showError('Failed to update task');
    }
  };
  
  // Handle task status change
  const handleChangeTaskStatus = useCallback(async (taskId, newStatus) => {
    if (isDeleting.current) return;
    
    console.log(`Moving task ${taskId} to ${newStatus}`);
    
    try {
      // Find the task in global tasks array
      const task = tasks.find(t => t.id === taskId && t.milestoneId === milestoneId);
      if (!task) {
        console.error(`Task ${taskId} not found`);
        return;
      }
      
      const completed = newStatus === 'done';
      const updatedTaskData = {
        ...task,
        status: newStatus,
        completed: completed,
        updatedAt: new Date().toISOString()
      };
      
      await updateTask(milestoneId, taskId, updatedTaskData);
      
      // Show success message
      const statusText = newStatus === 'todo' ? 'To Do' : 
                        newStatus === 'in_progress' ? 'In Progress' : 'Done';
      showSuccess(`Task moved to ${statusText}`);
    } catch (error) {
      console.error('Error changing task status:', error);
      showError('Failed to update task');
    }
  }, [showSuccess, showError, tasks, milestoneId, updateTask]);
  
  // Delete task
  const handleDeleteTask = (taskId) => {
    if (isDeleting.current) return;
    
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(milestoneId, taskId);
              setUiState(prev => ({
                ...prev,
                showTaskDetailModal: false
              }));
              showSuccess('Task deleted');
            } catch (error) {
              console.error('Error deleting task:', error);
              showError('Failed to delete task');
            }
          }
        }
      ]
    );
  };
  
  // Calculate milestone progress
  const calculateProgress = useCallback(() => {
    // Get current tasks for this milestone from global tasks array
    const currentMilestoneTasks = Array.isArray(tasks) 
      ? tasks.filter(task => task.milestoneId === milestoneId)
      : [];
    
    if (currentMilestoneTasks.length === 0) return 0;
    const completedTasks = currentMilestoneTasks.filter(task => task.completed || task.status === 'done').length;
    return Math.round((completedTasks / currentMilestoneTasks.length) * 100);
  }, [tasks, milestoneId]);
  
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
  
  // Save milestone
  const handleSave = () => {
    if (isDeleting.current) return;
    
    if (!milestoneState.title.trim()) {
      showError('Please enter a milestone title');
      return;
    }
    
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
    
    // Find full goal object if we have a selectedGoalId
    let goalTitle = null;
    if (selectedGoalId) {
      const goal = availableGoals.find(g => g.id === selectedGoalId);
      if (goal) {
        goalTitle = goal.title;
      }
    }
    
    // Create milestone object
    const progress = calculateProgress();
    const milestone = {
      id: isCreating ? Date.now().toString() : milestoneId,
      title: milestoneState.title,
      description: milestoneState.description,
      color: milestoneState.color,
      dueDate: milestoneState.hasDueDate ? milestoneState.dueDate.toISOString() : null,
      progress,
      goalId: selectedGoalId,
      goalTitle: goalTitle,
      createdAt: isCreating ? new Date().toISOString() : (milestones.find(p => p.id === milestoneId)?.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString()
    };
    
    // IMPORTANT: Add a delay to prevent accidental double submission
    saveTimeoutRef.current = setTimeout(() => {
      if (!isMounted.current || isDeleting.current) return;
      
      try {
        if (isCreating) {
          addMilestone(milestone);
          showSuccess('Milestone created successfully');
        } else {
          updateMilestone(milestone);
          showSuccess('Milestone updated successfully');
        }
        
        // Track strategic thinker achievement if milestone has a goal
        if (milestone.goalId) {
          try {
            FeatureExplorerTracker.trackStrategicThinker(milestone, showSuccess);
          } catch (error) {
            console.error('Error tracking strategic thinker achievement:', error);
            // Silently handle tracking errors without affecting main functionality
          }
        }
        
        setUiState(prev => ({
          ...prev,
          isLoading: false,
          hasUnsavedChanges: false
        }));
        
        navigation.goBack();
      } catch (error) {
        console.error("Error saving milestone:", error);
        showError("An error occurred while saving the milestone.");
        
        setUiState(prev => ({
          ...prev,
          isLoading: false,
          saveAttempted: false
        }));
      }
    }, 500);
  };
  
  // Delete milestone function - show confirmation modal
  const handleDelete = () => {
    setUiState(prev => ({
      ...prev,
      showDeleteConfirmModal: true
    }));
  };

  // Actual delete milestone implementation
  const handleConfirmDelete = async () => {
    try {
      isDeleting.current = true;
      setUiState(prev => ({
        ...prev,
        showDeleteConfirmModal: false,
        isLoading: true
      }));
      
      setUiState(prev => ({
        ...prev,
        showGoalSelector: false,
        showAddTaskModal: false,
        showTaskDetailModal: false
      }));
      
      const milestoneIdToDelete = milestoneId;
      
      // Use a timeout to ensure smooth navigation
      setTimeout(async () => {
        try {
          const success = await deleteMilestone(milestoneIdToDelete);
          
          if (success) {
            console.log(`Successfully deleted milestone ID: ${milestoneIdToDelete}`);
            showSuccess('Milestone deleted successfully');
          } else {
            console.error(`Failed to delete milestone ID: ${milestoneIdToDelete}`);
            showError('Error deleting milestone');
          }
        } catch (deleteError) {
          console.error("Error during milestone deletion:", deleteError);
          showError('Error deleting milestone');
        }
      }, 500);
      
      navigation.goBack();
      
    } catch (error) {
      console.error("Fatal error in delete handling:", error);
      showError('Error deleting milestone');
      
      if (isMounted.current) {
        navigation.goBack();
      }
    }
  };
  
  // Format date for display
  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      // Simple fallback format
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
  };
  
  // Get associated goal name
  const getGoalName = useCallback(() => {
    if (!selectedGoalId) return 'None';
    const goal = availableGoals.find(g => g.id === selectedGoalId);
    return goal ? goal.title : 'None';
  }, [selectedGoalId, availableGoals]);

  // Return null if we're in deletion process to avoid flashing
  if (isDeleting.current) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={milestoneState.color} />
          <Text 
            style={[styles.loadingText, { color: theme.text }]}
            maxFontSizeMultiplier={1.3}
            accessible={true}
            accessibilityLabel="Deleting milestone"
          >
            Deleting milestone...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Rendering helper
  const renderLoadingOverlay = () => {
    if (!uiState.isLoading) return null;
    
    return (
      <View 
        style={styles.loadingOverlay}
        accessible={true}
        accessibilityLabel={isCreating ? "Creating milestone" : "Updating milestone"}
        accessibilityRole="progressbar"
      >
        <View style={[styles.loadingContainer, { backgroundColor: theme.card }]}>
          <ActivityIndicator size="large" color={milestoneState.color} />
          <Text 
            style={[styles.loadingText, { color: theme.text }]}
            maxFontSizeMultiplier={1.3}
          >
            {isCreating ? 'Creating Milestone...' : 'Updating Milestone...'}
          </Text>
        </View>
      </View>
    );
  };

  // Normal UI
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header with Back and Save buttons */}
      <View style={[
        styles.header,
        { 
          paddingHorizontal: spacing.m, 
          height: scaleHeight(60),
          paddingTop: Platform.OS === 'ios' ? spacing.xs : 0 
        }
      ]}>
        <TouchableOpacity 
          style={[
            styles.backButton,
            { marginTop: -scaleHeight(2) } // Shift the back button up slightly
          ]}
          onPress={handleBackPress}
          disabled={uiState.isLoading}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to previous screen"
        >
          <Ionicons name="arrow-back" size={scaleWidth(24)} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter} />
        
        <Animated.View 
          style={{ 
            transform: [{ scale: saveButtonScale }]
          }}
        >
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              { backgroundColor: milestoneState.color },
              uiState.isLoading && { opacity: 0.6 }
            ]}
            onPress={handleSave}
            disabled={uiState.isLoading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Save milestone"
            accessibilityHint="Saves the current milestone"
            accessibilityState={{ disabled: uiState.isLoading }}
          >
            <Ionicons name="save-outline" size={scaleWidth(18)} color="#000000" />
            <Text 
              style={[
                styles.saveButtonText,
                { fontSize: fontSizes.m }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Save
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
        accessible={true}
        accessibilityLabel="Milestone details content"
      >
        {/* Milestone Preview */}
        <MilestonePreview
          title={milestoneState.title}
          selectedColor={milestoneState.color}
          progress={calculateProgress()}
          theme={theme}
        />
        
        {/* Tabs Navigation */}
        <View style={[
          styles.tabsContainer,
          { marginHorizontal: spacing.m, marginBottom: spacing.xs }
        ]}>
          <MilestoneTabs 
            activeTab={uiState.activeTab}
            setActiveTab={(tab) => setUiState(prev => ({ ...prev, activeTab: tab }))}
            theme={theme}
            color={milestoneState.color}
          />
        </View>
        
        {/* Tab Content */}
        <View style={styles.content}>
          {uiState.activeTab === 'details' && (
            <MilestoneDetailsForm 
              title={milestoneState.title}
              setTitle={(text) => setMilestoneState(prev => ({ ...prev, title: text }))}
              description={milestoneState.description}
              setDescription={(text) => setMilestoneState(prev => ({ ...prev, description: text }))}
              color={milestoneState.color}
              setColor={(color) => setMilestoneState(prev => ({ ...prev, color: color }))}
              hasDueDate={milestoneState.hasDueDate}
              setHasDueDate={(value) => setMilestoneState(prev => ({ ...prev, hasDueDate: value }))}
              dueDate={milestoneState.dueDate}
              showDatePicker={uiState.showDatePicker}
              setShowDatePicker={(show) => setUiState(prev => ({ ...prev, showDatePicker: show }))}
              handleDateChange={handleDateChange}
              selectedGoalId={selectedGoalId}
              setShowGoalSelector={() => setUiState(prev => ({ ...prev, showGoalSelector: true }))}
              getGoalName={getGoalName}
              availableGoals={availableGoals}
              formatDate={formatDate}
              isCreating={isCreating}
              handleDelete={handleDelete}
              isLoading={uiState.isLoading}
              theme={theme}
            />
          )}
          
          {uiState.activeTab === 'list' && (
            <TaskListView 
              tasks={Array.isArray(tasks) ? tasks.filter(task => task.milestoneId === milestoneId) : []}
              color={milestoneState.color}
              theme={theme}
              calculateProgress={calculateProgress}
              handleViewTask={handleViewTask}
              handleToggleTask={handleToggleTask}
              handleEditTask={handleEditTask}
              handleDeleteTask={handleDeleteTask}
              setShowAddTaskModal={handleOpenAddTaskModal}
              setCurrentTask={setCurrentTask}
              setIsEditingTask={(value) => setUiState(prev => ({ ...prev, isEditingTask: value }))}
              isPro={isPro}
            />
          )}
        </View>
      </ScrollView>
      
      {/* Add/Edit Task Modal */}
      <AddTaskModalExternal
        visible={uiState.showAddTaskModal}
        onClose={() => {
          setUiState(prev => ({
            ...prev,
            showAddTaskModal: false,
            isEditingTask: false
          }));
          setCurrentTask(null);
        }}
        onAdd={handleAddTask}
        color={milestoneState.color}
        task={currentTask}
        isEditing={uiState.isEditingTask}
      />
      
      {/* Task Detail Modal */}
      <TaskDetailModal
        showTaskDetailModal={uiState.showTaskDetailModal}
        setShowTaskDetailModal={(show) => setUiState(prev => ({ ...prev, showTaskDetailModal: show }))}
        selectedTask={selectedTask}
        handleToggleTask={handleToggleTask}
        handleChangeTaskStatus={handleChangeTaskStatus}
        handleDeleteTask={handleDeleteTask}
        handleEditTask={handleEditTask}
        theme={theme}
        color={milestoneState.color}
      />
      
      {/* Goal Selector Modal */}
      <GoalSelectorModal
        showGoalSelector={uiState.showGoalSelector}
        setShowGoalSelector={(show) => setUiState(prev => ({ ...prev, showGoalSelector: show }))}
        availableGoals={availableGoals}
        selectedGoalId={selectedGoalId}
        setSelectedGoalId={setSelectedGoalId}
        setColor={(color) => setMilestoneState(prev => ({ ...prev, color: color }))}
        theme={theme}
      />

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        visible={uiState.showUnsavedChangesModal}
        setVisible={(show) => setUiState(prev => ({ ...prev, showUnsavedChangesModal: show }))}
        handleSave={handleSave}
        discardChangesAndGoBack={discardChangesAndGoBack}
        theme={theme}
        color={milestoneState.color}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={uiState.showDeleteConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setUiState(prev => ({ ...prev, showDeleteConfirmModal: false }))}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={[
            styles.deleteModalContainer, 
            { 
              backgroundColor: theme.surface || theme.background,
              marginTop: insets.top,
              marginBottom: insets.bottom,
              marginLeft: spacing.m,
              marginRight: spacing.m
            }
          ]}>
            <View style={styles.deleteModalHeader}>
              <Ionicons name="trash-outline" size={scaleWidth(40)} color={theme.error} />
              <Text 
                style={[styles.deleteModalTitle, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                Delete Milestone
              </Text>
            </View>
            
            <Text 
              style={[styles.deleteModalMessage, { color: theme.textSecondary }]}
              maxFontSizeMultiplier={1.3}
            >
              Are you sure you want to delete this milestone and all its tasks? This action cannot be undone.
            </Text>
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[
                  styles.deleteModalButton, 
                  styles.deleteCancelButton, 
                  { 
                    backgroundColor: theme.background,
                    borderColor: theme.border
                  }
                ]}
                onPress={() => setUiState(prev => ({ ...prev, showDeleteConfirmModal: false }))}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                accessibilityHint="Cancels the delete operation"
              >
                <Text style={[styles.deleteButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteConfirmButton]}
                onPress={handleConfirmDelete}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Delete Milestone"
                accessibilityHint="Permanently deletes this milestone and all its tasks"
              >
                <Text style={[styles.deleteButtonText, styles.deleteConfirmText]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Loading Overlay */}
      {renderLoadingOverlay()}
      
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
                Pro Feature
              </Text>
            </View>
            
            <Text 
              style={[styles.upgradeModalMessage, { color: theme.text }]}
              maxFontSizeMultiplier={1.3}
            >
              {upgradeMessage || "Upgrade to Pro to unlock unlimited tasks per milestone."}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.upgradeButton, 
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
                style={styles.upgradeButtonText}
                maxFontSizeMultiplier={1.3}
              >
                Upgrade to Pro
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.laterButton}
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
    </SafeAreaView>
  );
};

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
    paddingVertical: spacing.xs,
    height: scaleHeight(60),
    width: '100%',
  },
  headerCenter: {
    flex: 1,
  },
  backButton: {
    padding: spacing.xs, // Reduced padding
    minWidth: 44,
    minHeight: 40, // Slightly reduced minimum height
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 20,
    minWidth: 44,
    minHeight: 44,
  },
  saveButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    color: '#000000',
    marginLeft: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: scaleHeight(100),
  },
  tabsContainer: {
    marginHorizontal: spacing.m,
    marginBottom: spacing.xs,
  },
  content: {
    flex: 1,
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
    borderRadius: 12,
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
    marginTop: spacing.m,
    fontSize: fontSizes.m,
    fontWeight: '500',
  },
  // Modal Styles
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
    minHeight: 44, // Minimum touch target
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: 'bold',
  },
  laterButton: {
    marginTop: spacing.l,
    padding: spacing.m,
    minHeight: 44, // Minimum touch target
  },
  laterButtonText: {
    fontSize: fontSizes.s,
  },
  // Delete Modal Styles (matching goal delete modal)
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  deleteModalContainer: {
    width: '100%',
    maxWidth: scaleWidth(320),
    borderRadius: scaleWidth(16),
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.m,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: scaleHeight(8),
    },
    shadowOpacity: 0.15,
    shadowRadius: scaleWidth(24),
    elevation: 8,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  deleteModalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.m,
    letterSpacing: 0.3,
  },
  deleteModalMessage: {
    fontSize: fontSizes.m,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: scaleHeight(22),
    opacity: 0.8,
    fontWeight: '400',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // accessibility.minTouchTarget equivalent
  },
  deleteCancelButton: {
    borderWidth: 1,
  },
  deleteConfirmButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  deleteConfirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  }
});

export default MilestoneDetailsScreen;