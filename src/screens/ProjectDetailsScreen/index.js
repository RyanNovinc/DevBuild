// src/screens/ProjectDetailsScreen/index.js
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
import ProjectHeader from './components/ProjectHeader';
import * as FeatureExplorerTracker from '../../services/FeatureExplorerTracker';
import ProjectTabs from './components/ProjectTabs';
import ProjectDetailsForm from './components/ProjectDetailsForm';
import TaskListView from './components/TaskListView';
import TaskDetailModal from './components/TaskDetailModal';
import GoalSelectorModal from './components/GoalSelectorModal';
import UnsavedChangesModal from './components/UnsavedChangesModal';

// Import external AddTaskModal component for compatibility
import AddTaskModalExternal from '../../components/AddTaskModal';

// Import the new ProjectPreview component
import ProjectPreview from './components/ProjectPreview';

// Import subscription UI components - removed FeatureLimitBanner
import { FREE_PLAN_LIMITS } from '../../services/SubscriptionService';

const ProjectDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const { 
    projects, 
    goals,
    tasks,
    isProjectActive, 
    updateProject, 
    addProject, 
    deleteProject, 
    addTask,
    updateTask,
    deleteTask,
    mainGoals,
    userSubscriptionStatus 
  } = useAppContext();
  
  const { showSuccess, showError } = useNotification();
  
  const { mode, projectId, preselectedGoalId } = route.params || { mode: 'create' };
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
  
  // Track if we've loaded the project to prevent reloading over local changes
  const hasLoadedProject = useRef(false);
  
  // Project details state
  const [projectState, setProjectState] = useState({
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
      projectState.title !== initialValues.title ||
      projectState.description !== initialValues.description ||
      projectState.color !== initialValues.color ||
      selectedGoalId !== initialValues.selectedGoalId ||
      projectState.hasDueDate !== initialValues.hasDueDate ||
      (projectState.hasDueDate && projectState.dueDate.toISOString() !== initialValues.dueDate?.toISOString());
    
    setUiState(prev => ({
      ...prev,
      hasUnsavedChanges: hasChanges
    }));
  }, [projectState, selectedGoalId, initialValues]);

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
      console.log(`ProjectDetailsScreen unmounting for project ID: ${projectId}`);
      isMounted.current = false;
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [projectId]);

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
        // Navigate directly to LifePlanOverview (correct screen name from App.js)
        navigation.navigate('LifePlanOverview');
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
      // Navigate directly to LifePlanOverview (correct screen name from App.js)
      navigation.navigate('LifePlanOverview');
    } else {
      navigation.goBack();
    }
  };

  // Load project if editing or handle preselected goal when creating
  useEffect(() => {
    // Skip loading if we're in deletion process
    if (isDeleting.current) return;
    
    // Skip if we've already loaded this project (prevents overriding local changes)
    if (!isCreating && hasLoadedProject.current) return;

    try {
      if (!isCreating && projectId) {
        // Safety check to ensure projects is an array
        if (!Array.isArray(projects)) {
          console.error("Projects is not an array:", projects);
          setProjectState(prev => ({
            ...prev,
            title: "Error: Project data unavailable",
            description: "There was an error loading the project data. Please go back and try again."
          }));
          showError("Error loading project data");
          return;
        }
        
        // Use the safer isProjectActive check if available
        if (typeof isProjectActive === 'function' && !isProjectActive(projectId)) {
          console.error(`Project with ID ${projectId} is not active or has been deleted`);
          setProjectState(prev => ({
            ...prev,
            title: "Project Not Found or Deleted",
            description: "This project may have been deleted or is no longer available."
          }));
          
          if (!isDeleting.current) {
            showError("Project not found");
          }
          
          return;
        }
        
        const project = projects.find(p => p.id === projectId);
        if (project) {
          console.log(`Loading project: "${project.title}" (ID: ${projectId})`);
          const titleValue = project.title || "";
          const descriptionValue = project.description || '';
          const colorValue = project.color || '#4CAF50';
          const goalIdValue = project.goalId || null;
          
          // Handle due date
          let hasDueDateValue = false;
          let dueDateValue = new Date();
          
          if (project.dueDate) {
            try {
              const dateObj = new Date(project.dueDate);
              if (!isNaN(dateObj.getTime())) {
                hasDueDateValue = true;
                dueDateValue = dateObj;
              } else {
                console.warn("Invalid date format:", project.dueDate);
              }
            } catch (dateError) {
              console.error("Error parsing date:", dateError);
            }
          }
          
          // Get tasks from global tasks array instead of project.tasks
          const projectTasks = Array.isArray(tasks) 
            ? tasks.filter(task => task.projectId === projectId)
            : [];
          
          // FIXED: Ensure all tasks have proper status property with better fallback logic
          const updatedTasks = projectTasks.map(task => {
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
          
          setProjectState({
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
          
          // Mark that we've loaded the project
          hasLoadedProject.current = true;
        } else {
          // Only show error if not in deletion process
          if (!isDeleting.current) {
            console.error(`Project with ID ${projectId} not found in`, projects);
            setProjectState(prev => ({
              ...prev,
              title: "Project Not Found",
              description: "This project may have been deleted or is no longer available."
            }));
            showError("Project not found");
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
            setProjectState(prev => ({
              ...prev,
              color: selectedGoal.color
            }));
            console.log(`Set color to ${selectedGoal.color} from goal: ${selectedGoal.title}`);
          }
        }
        
        setSelectedGoalId(goalIdValue);
        
        // Store initial values for new project
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
      console.error("Error in project loading effect:", error);
      setProjectState(prev => ({
        ...prev,
        title: "Error Loading Project",
        description: "An unexpected error occurred while loading the project data."
      }));
      showError("Error loading project data");
    }
  }, [isCreating, projectId, preselectedGoalId, mainGoals, goals, isProjectActive, showError, projects, tasks]); 
  
  // Update color when goal is selected
  useEffect(() => {
    if (isDeleting.current) return;
    
    if (selectedGoalId) {
      const selectedGoal = availableGoals.find(g => g.id === selectedGoalId);
      if (selectedGoal && selectedGoal.color) {
        setProjectState(prev => ({
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
    
    // Get current tasks for this project from global tasks array
    const currentProjectTasks = Array.isArray(tasks) 
      ? tasks.filter(task => task.projectId === projectId)
      : [];
    
    // Free users are limited
    return currentProjectTasks.length < FREE_PLAN_LIMITS.MAX_TASKS_PER_PROJECT;
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
      setProjectState(prev => ({
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
        
        await updateTask(projectId, currentTask.id, updatedTaskData);
        
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
          `You've reached the limit of ${FREE_PLAN_LIMITS.MAX_TASKS_PER_PROJECT} tasks per project. Upgrade to Pro for unlimited tasks.`
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
        
        await addTask(projectId, newTaskData);
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
        `You've reached the limit of ${FREE_PLAN_LIMITS.MAX_TASKS_PER_PROJECT} tasks per project. Upgrade to Pro for unlimited tasks.`
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
    
    // Create pre-filled task with project and goal information
    const prefilledTask = {
      projectId: projectId,
      projectTitle: projectState.title,
      goalId: selectedGoalId,
      goalTitle: goalTitle,
      title: "",
      description: ""
    };
    
    // If user can add more tasks, proceed to open the modal with pre-filled project info
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
      const task = tasks.find(t => t.id === taskId && t.projectId === projectId);
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
      
      await updateTask(projectId, taskId, updatedTaskData);
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
      const task = tasks.find(t => t.id === taskId && t.projectId === projectId);
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
      
      await updateTask(projectId, taskId, updatedTaskData);
      
      // Show success message
      const statusText = newStatus === 'todo' ? 'To Do' : 
                        newStatus === 'in_progress' ? 'In Progress' : 'Done';
      showSuccess(`Task moved to ${statusText}`);
    } catch (error) {
      console.error('Error changing task status:', error);
      showError('Failed to update task');
    }
  }, [showSuccess, showError, tasks, projectId, updateTask]);
  
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
              await deleteTask(projectId, taskId);
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
  
  // Calculate project progress
  const calculateProgress = useCallback(() => {
    // Get current tasks for this project from global tasks array
    const currentProjectTasks = Array.isArray(tasks) 
      ? tasks.filter(task => task.projectId === projectId)
      : [];
    
    if (currentProjectTasks.length === 0) return 0;
    const completedTasks = currentProjectTasks.filter(task => task.completed || task.status === 'done').length;
    return Math.round((completedTasks / currentProjectTasks.length) * 100);
  }, [tasks, projectId]);
  
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
  
  // Save project
  const handleSave = () => {
    if (isDeleting.current) return;
    
    if (!projectState.title.trim()) {
      showError('Please enter a project title');
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
    
    // Create project object
    const progress = calculateProgress();
    const project = {
      id: isCreating ? Date.now().toString() : projectId,
      title: projectState.title,
      description: projectState.description,
      color: projectState.color,
      dueDate: projectState.hasDueDate ? projectState.dueDate.toISOString() : null,
      progress,
      goalId: selectedGoalId,
      goalTitle: goalTitle,
      createdAt: isCreating ? new Date().toISOString() : (projects.find(p => p.id === projectId)?.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString()
    };
    
    // IMPORTANT: Add a delay to prevent accidental double submission
    saveTimeoutRef.current = setTimeout(() => {
      if (!isMounted.current || isDeleting.current) return;
      
      try {
        if (isCreating) {
          addProject(project);
          showSuccess('Project created successfully');
        } else {
          updateProject(project);
          showSuccess('Project updated successfully');
        }
        
        // Track strategic thinker achievement if project has a goal
        if (project.goalId) {
          try {
            FeatureExplorerTracker.trackStrategicThinker(project, showSuccess);
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
        console.error("Error saving project:", error);
        showError("An error occurred while saving the project.");
        
        setUiState(prev => ({
          ...prev,
          isLoading: false,
          saveAttempted: false
        }));
      }
    }, 500);
  };
  
  // Delete project function
  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project and all its tasks?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              isDeleting.current = true;
              setUiState(prev => ({
                ...prev,
                isLoading: true
              }));
              
              setUiState(prev => ({
                ...prev,
                showGoalSelector: false,
                showAddTaskModal: false,
                showTaskDetailModal: false
              }));
              
              const projectIdToDelete = projectId;
              
              // Use a timeout to ensure smooth navigation
              setTimeout(async () => {
                try {
                  const success = await deleteProject(projectIdToDelete);
                  
                  if (success) {
                    console.log(`Successfully deleted project ID: ${projectIdToDelete}`);
                    showSuccess('Project deleted successfully');
                  } else {
                    console.error(`Failed to delete project ID: ${projectIdToDelete}`);
                    showError('Error deleting project');
                  }
                } catch (deleteError) {
                  console.error("Error during project deletion:", deleteError);
                  showError('Error deleting project');
                }
              }, 500);
              
              navigation.goBack();
              
            } catch (error) {
              console.error("Fatal error in delete handling:", error);
              showError('Error deleting project');
              
              if (isMounted.current) {
                navigation.goBack();
              }
            }
          }
        }
      ]
    );
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
          <ActivityIndicator size="large" color={projectState.color} />
          <Text 
            style={[styles.loadingText, { color: theme.text }]}
            maxFontSizeMultiplier={1.3}
            accessible={true}
            accessibilityLabel="Deleting project"
          >
            Deleting project...
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
        accessibilityLabel={isCreating ? "Creating project" : "Updating project"}
        accessibilityRole="progressbar"
      >
        <View style={[styles.loadingContainer, { backgroundColor: theme.card }]}>
          <ActivityIndicator size="large" color={projectState.color} />
          <Text 
            style={[styles.loadingText, { color: theme.text }]}
            maxFontSizeMultiplier={1.3}
          >
            {isCreating ? 'Creating Project...' : 'Updating Project...'}
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
              { backgroundColor: projectState.color },
              uiState.isLoading && { opacity: 0.6 }
            ]}
            onPress={handleSave}
            disabled={uiState.isLoading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Save project"
            accessibilityHint="Saves the current project"
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
        accessibilityLabel="Project details content"
      >
        {/* Project Preview */}
        <ProjectPreview
          scrollY={scrollY}
          title={projectState.title}
          color={projectState.color}
          calculateProgress={calculateProgress}
          theme={theme}
          isCreating={isCreating}
          getGoalName={getGoalName}
          goalColor={availableGoals.find(g => g.id === selectedGoalId)?.color}
          hasGoal={!!selectedGoalId}
          taskCount={Array.isArray(tasks) ? tasks.filter(task => task.projectId === projectId).length : 0}
        />
        
        {/* Tabs Navigation */}
        <View style={[
          styles.tabsContainer,
          { marginHorizontal: spacing.m, marginBottom: spacing.xs }
        ]}>
          <ProjectTabs 
            activeTab={uiState.activeTab}
            setActiveTab={(tab) => setUiState(prev => ({ ...prev, activeTab: tab }))}
            theme={theme}
            color={projectState.color}
          />
        </View>
        
        {/* Tab Content */}
        <View style={styles.content}>
          {uiState.activeTab === 'details' && (
            <ProjectDetailsForm 
              title={projectState.title}
              setTitle={(text) => setProjectState(prev => ({ ...prev, title: text }))}
              description={projectState.description}
              setDescription={(text) => setProjectState(prev => ({ ...prev, description: text }))}
              color={projectState.color}
              setColor={(color) => setProjectState(prev => ({ ...prev, color: color }))}
              hasDueDate={projectState.hasDueDate}
              setHasDueDate={(value) => setProjectState(prev => ({ ...prev, hasDueDate: value }))}
              dueDate={projectState.dueDate}
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
              tasks={Array.isArray(tasks) ? tasks.filter(task => task.projectId === projectId) : []}
              color={projectState.color}
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
        color={projectState.color}
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
        color={projectState.color}
      />
      
      {/* Goal Selector Modal */}
      <GoalSelectorModal
        showGoalSelector={uiState.showGoalSelector}
        setShowGoalSelector={(show) => setUiState(prev => ({ ...prev, showGoalSelector: show }))}
        availableGoals={availableGoals}
        selectedGoalId={selectedGoalId}
        setSelectedGoalId={setSelectedGoalId}
        setColor={(color) => setProjectState(prev => ({ ...prev, color: color }))}
        theme={theme}
      />

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        visible={uiState.showUnsavedChangesModal}
        setVisible={(show) => setUiState(prev => ({ ...prev, showUnsavedChangesModal: show }))}
        handleSave={handleSave}
        discardChangesAndGoBack={discardChangesAndGoBack}
        theme={theme}
        color={projectState.color}
      />
      
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
                Premium Feature
              </Text>
            </View>
            
            <Text 
              style={[styles.upgradeModalMessage, { color: theme.text }]}
              maxFontSizeMultiplier={1.3}
            >
              {upgradeMessage || "Upgrade to Pro to unlock unlimited tasks per project."}
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
  }
});

export default ProjectDetailsScreen;