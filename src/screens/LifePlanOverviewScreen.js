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
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import Svg, { Circle } from 'react-native-svg';
import Confetti from '../components/Confetti';
import {
  scaleWidth,
  scaleHeight,
  isSmallDevice,
  isTablet,
  spacing,
  fontSizes,
  useIsLandscape,
  useSafeSpacing,
  meetsContrastRequirements
} from '../utils/responsive';

const LifePlanOverviewScreen = ({ navigation, hideBackButton = false }) => {
  // Determine if we're embedded in a tab (Goals tab) or standalone (from ProfileTab)
  const isEmbeddedInTab = hideBackButton;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const safeSpacing = useSafeSpacing();
  const { showSuccess, showError } = useNotification();
  const isLandscape = useIsLandscape();
  
  // Get app context with goals, projects, tasks
  const appContext = useAppContext() || {};
  const { 
    goals = [], 
    projects = [], 
    tasks = [], 
    getTasksForProject,
    getLifeDirection,
    updateProject,
    updateTask,
    updateGoal,
    updateGoalProgress,
    updateAppSetting
  } = appContext;
  
  const lifeDirection = getLifeDirection ? getLifeDirection() : 
    "Define your life direction in settings";
  
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
  
  // Check if dark mode is active
  const isDarkMode = theme.background === '#000000';
  
  // New state for Strategic Direction features
  const [directionCollapsed, setDirectionCollapsed] = useState(false);
  const [directionModalVisible, setDirectionModalVisible] = useState(false);
  const [editedDirection, setEditedDirection] = useState("");
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  
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
      
      return {
        ...goal,
        projects: projectsWithTasks
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
  
  // Toggle the collapsed state of the direction card
  const toggleDirectionCollapse = () => {
    setDirectionCollapsed(!directionCollapsed);
  };
  
  // Open the direction editing modal
  const openDirectionModal = () => {
    setEditedDirection(lifeDirection);
    setDirectionModalVisible(true);
  };
  
  // Save the updated direction
const saveDirection = async () => {
  if (typeof updateAppSetting === 'function') {
    try {
      await updateAppSetting('lifeDirection', editedDirection.trim());
      showSuccess('Strategic Direction updated');
      
      // Track vision setter achievement
      try {
        FeatureExplorerTracker.trackVisionSetter(editedDirection, showSuccess);
      } catch (error) {
        console.error('Error tracking vision setter achievement:', error);
        // Silently handle tracking errors without affecting main functionality
      }
      
      // Update app summary to reflect the new life direction in AI context
      try {
        const AppSummaryService = await import('../services/AppSummaryService');
        const DocumentService = await import('../services/DocumentService');
        
        // Generate new app summary with updated life direction
        const appData = {
          goals: goals || [],
          projects: projects || [],
          tasks: tasks || [],
          settings: {
            ...appContext.settings,
            lifeDirection: editedDirection.trim()
          }
        };
        
        const summary = AppSummaryService.default.generateAppSummary(appData);
        await DocumentService.default.updateAppContextDocument(summary);
        
        console.log('App summary updated with new Strategic Direction');
      } catch (error) {
        console.error('Error updating app summary after Strategic Direction change:', error);
        // Don't fail the main operation if summary update fails
      }
      
      setDirectionModalVisible(false);
    } catch (error) {
      console.error('Error updating Strategic Direction:', error);
      showError("Couldn't update Strategic Direction");
    }
  } else {
    showError("Couldn't update Strategic Direction");
  }
};
  
  // Show info modal about Strategic Direction
  const showInfoModal = () => {
    setInfoModalVisible(true);
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
  
  // Navigate to task details with special navigation params to return to this screen
  const navigateToTask = (task, projectId) => {
    navigation.navigate('ProjectDetails', { 
      projectId: projectId,
      mode: 'edit',
      initialTaskId: task.id,
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
          paddingBottom: scaleHeight(40),
          paddingLeft: safeSpacing.left > spacing.m ? safeSpacing.left : 0,
          paddingRight: safeSpacing.right > spacing.m ? safeSpacing.right : 0
        }}
        accessible={true}
        accessibilityRole="scrollView"
        accessibilityLabel="Life Plan Overview"
      >
        {/* Strategic Direction Section with Back Button Overlay */}
        <Animated.View 
          style={[
            styles.directionContainer, 
            { 
              backgroundColor: theme.card,
              borderColor: theme.border,
              shadowColor: isDarkMode ? '#000000' : 'rgba(0,0,0,0.3)',
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginTop: spacing.xs,
              position: 'relative',
              height: directionCollapsed ? scaleHeight(80) : 'auto',
              borderRadius: scaleWidth(12),
              borderWidth: 1,
              marginBottom: spacing.xl,
              shadowOffset: { width: 0, height: scaleHeight(2) },
              shadowOpacity: 0.1,
              shadowRadius: scaleWidth(4),
              elevation: 3
            }
          ]}
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel={directionCollapsed ? 
            "Strategic Direction - collapsed" : 
            `Strategic Direction - ${lifeDirection}`}
        >
          {/* Back button overlaid on the card - only show when not embedded in tabs */}
          {!hideBackButton && (
            <TouchableOpacity 
              style={[
                styles.backButtonOverlay,
                {
                  position: 'absolute',
                  top: spacing.s,
                  left: spacing.m,
                  zIndex: 10,
                  borderRadius: scaleWidth(20)
                }
              ]}
              onPress={() => {
                // Since hideBackButton controls visibility, this only runs when back button is shown
                // Back button is only shown when accessed from ProfileTab settings, so always go to ProfileTab
                navigation.navigate('ProfileTab');
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Go back to profile"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={[
                styles.iconBackground,
                {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  width: scaleWidth(36),
                  height: scaleWidth(36),
                  borderRadius: scaleWidth(18),
                  alignItems: 'center',
                  justifyContent: 'center'
                }
              ]}>
                <Ionicons name="arrow-back" size={scaleWidth(22)} color={textColor} />
              </View>
            </TouchableOpacity>
          )}
          
          {/* Collapse/Expand button */}
          <TouchableOpacity 
            style={[
              styles.collapseButtonOverlay,
              {
                position: 'absolute',
                top: spacing.s,
                right: spacing.m,
                zIndex: 10,
                borderRadius: scaleWidth(20)
              }
            ]}
            onPress={toggleDirectionCollapse}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={directionCollapsed ? "Expand direction" : "Collapse direction"}
            accessibilityState={{ expanded: !directionCollapsed }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={[
              styles.iconBackground,
              {
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                width: scaleWidth(36),
                height: scaleWidth(36),
                borderRadius: scaleWidth(18),
                alignItems: 'center',
                justifyContent: 'center'
              }
            ]}>
              <Ionicons 
                name={directionCollapsed ? "chevron-down" : "chevron-up"} 
                size={scaleWidth(22)} 
                color={textColor} 
              />
            </View>
          </TouchableOpacity>
          
          {/* Info button */}
          <TouchableOpacity 
            style={[
              styles.infoButtonOverlay,
              {
                position: 'absolute',
                top: spacing.s,
                right: spacing.m + scaleWidth(44),
                zIndex: 10,
                borderRadius: scaleWidth(20)
              }
            ]}
            onPress={showInfoModal}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Show information about strategic direction"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={[
              styles.iconBackground,
              {
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                width: scaleWidth(36),
                height: scaleWidth(36),
                borderRadius: scaleWidth(18),
                alignItems: 'center',
                justifyContent: 'center'
              }
            ]}>
              <Ionicons name="information-circle-outline" size={scaleWidth(22)} color={textColor} />
            </View>
          </TouchableOpacity>
          
          {/* Make entire card clickable to open editor */}
          <TouchableOpacity 
            style={[
              styles.directionContentContainer,
              {
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.l, // More vertical padding for longer text
                alignItems: 'center',
                minHeight: 'auto', // Allow to expand with content
                flexGrow: 1 // Allow to grow as needed
              }
            ]}
            onPress={openDirectionModal}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Edit strategic direction"
            accessibilityHint="Tap to edit your strategic direction"
          >
            {/* Only show the compass icon when collapsed */}
            <View style={styles.directionIconContainer}>
              <View style={[
                styles.directionIcon,
                { 
                  backgroundColor: colorWithOpacity(theme.primary, 0.15),
                  width: scaleWidth(48),
                  height: scaleWidth(48),
                  borderRadius: scaleWidth(24),
                  justifyContent: 'center',
                  alignItems: 'center'
                }
              ]}>
                <Ionicons name="compass" size={scaleWidth(24)} color={theme.primary} />
              </View>
            </View>
            
            {/* Hide all text content when collapsed */}
            {!directionCollapsed && (
              <>
                <Text 
                  style={[
                    styles.directionTitle, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.l,
                      fontWeight: '600',
                      marginBottom: spacing.m,
                      textAlign: 'center'
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Strategic Direction
                </Text>
                
                <View style={[
                  styles.directionTextContainer,
                  { 
                    width: '100%',
                    minHeight: 'auto', // Allow container to size to content
                    flexShrink: 0 // Prevent shrinking
                  }
                ]}>
                  <Text 
                    style={[
                      styles.directionText, 
                      { 
                        color: textColor,
                        fontSize: fontSizes.m,
                        lineHeight: scaleHeight(24),
                        fontStyle: 'italic',
                        textAlign: 'center',
                        flexWrap: 'wrap' // Allow text to wrap
                      }
                    ]}
                    maxFontSizeMultiplier={1.5}
                    numberOfLines={0} // Remove any line limit
                  >
                    {lifeDirection}
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
        
        {/* Goals and Projects Hierarchy */}
        <View style={[
          styles.hierarchyContainer,
          { paddingBottom: spacing.m }
        ]}>
          {processedData.length > 0 ? (
            processedData.map((goal) => (
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
                {/* Goal Item */}
                <TouchableOpacity 
                  style={[
                    styles.goalItem, 
                    { 
                      backgroundColor: theme.card,
                      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                      shadowColor: isDarkMode ? '#000000' : 'rgba(0,0,0,0.3)',
                      borderRadius: scaleWidth(16),
                      padding: spacing.m,
                      borderWidth: 1,
                      shadowOffset: { width: 0, height: scaleHeight(4) },
                      shadowOpacity: 0.1,
                      shadowRadius: scaleWidth(8),
                      elevation: 3,
                      position: 'relative',
                      overflow: 'hidden'
                    }
                  ]}
                  onPress={() => toggleGoal(goal.id)}
                  onLongPress={() => navigateToGoal(goal)}
                  activeOpacity={0.9}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Goal: ${goal.title}, Progress: ${goal.progress || 0} percent`}
                  accessibilityHint="Tap to expand or collapse. Long press to view details"
                  accessibilityState={{ expanded: expandedGoals[goal.id] }}
                >
                  <View style={[
                    styles.goalColorBand,
                    { 
                      backgroundColor: goal.color || theme.primary,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: scaleHeight(6),
                      borderTopLeftRadius: scaleWidth(16),
                      borderTopRightRadius: scaleWidth(16),
                    }
                  ]} />
                  
                  <View style={[
                    styles.goalHeader,
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
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
                          backgroundColor: colorWithOpacity(goal.color || theme.primary, 0.15),
                          width: scaleWidth(36),
                          height: scaleWidth(36),
                          borderRadius: scaleWidth(18),
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: spacing.m
                        }
                      ]}>
                        <Ionicons 
                          name={goal.icon || 'star'} 
                          size={scaleWidth(18)} 
                          color={goal.color || theme.primary} 
                        />
                      </View>
                      <Text 
                        style={[
                          styles.goalTitle, 
                          { 
                            color: textColor,
                            fontSize: fontSizes.m,
                            fontWeight: '600',
                            flex: 1
                          }
                        ]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={2}
                      >
                        {goal.title}
                      </Text>
                    </View>
                    
                    {renderCircularProgress(goal.progress, 38, goal.color || theme.primary)}
                  </View>
                  
                  <View style={[
                    styles.goalFooter,
                    {
                      flexDirection: isSmallDevice && isLandscape ? 'column' : 'row',
                      justifyContent: 'space-between',
                      alignItems: isSmallDevice && isLandscape ? 'stretch' : 'center'
                    }
                  ]}>
                    <TouchableOpacity 
                      style={[
                        styles.goalButton,
                        { 
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: spacing.xs,
                          paddingHorizontal: spacing.m,
                          borderRadius: scaleWidth(20),
                          flex: isSmallDevice && isLandscape ? undefined : 0.48,
                          justifyContent: 'center',
                          marginBottom: isSmallDevice && isLandscape ? spacing.xs : 0
                        }
                      ]}
                      onPress={() => navigateToGoal(goal)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`View details of ${goal.title}`}
                    >
                      <Ionicons name="open-outline" size={scaleWidth(16)} color={secondaryTextColor} />
                      <Text 
                        style={[
                          styles.goalButtonText, 
                          { 
                            color: secondaryTextColor,
                            fontSize: fontSizes.s,
                            fontWeight: '500',
                            marginLeft: spacing.xs
                          }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        Details
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.goalButton,
                        { 
                          backgroundColor: colorWithOpacity(goal.color || theme.primary, 0.15),
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: spacing.xs,
                          paddingHorizontal: spacing.m,
                          borderRadius: scaleWidth(20),
                          flex: isSmallDevice && isLandscape ? undefined : 0.48,
                          justifyContent: 'center'
                        }
                      ]}
                      onPress={() => toggleGoal(goal.id)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={expandedGoals[goal.id] ? 
                        `Collapse ${goal.title}` : 
                        `Expand ${goal.title}`}
                      accessibilityState={{ expanded: expandedGoals[goal.id] }}
                    >
                      <Ionicons 
                        name={expandedGoals[goal.id] ? 'chevron-up' : 'chevron-down'} 
                        size={scaleWidth(16)} 
                        color={goal.color || theme.primary} 
                      />
                      <Text 
                        style={[
                          styles.goalButtonText, 
                          { 
                            color: goal.color || theme.primary,
                            fontSize: fontSizes.s,
                            fontWeight: '500',
                            marginLeft: spacing.xs
                          }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {expandedGoals[goal.id] ? 'Collapse' : 'Expand'}
                      </Text>
                    </TouchableOpacity>
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
                            onLongPress={() => navigateToProject(project)}
                            activeOpacity={0.9}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={`Project: ${project.title}, Progress: ${project.progress || 0} percent${project.completed ? ', Completed' : ''}`}
                            accessibilityHint="Tap to expand or collapse. Long press to view details"
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
                                    name={project.completed ? "checkmark-circle" : "folder"} 
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
                                      width: scaleWidth(28),
                                      height: scaleWidth(28),
                                      borderRadius: scaleWidth(14),
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      marginLeft: spacing.xs
                                    }
                                  ]}
                                  onPress={() => handleToggleProjectCompletion(project)}
                                  accessible={true}
                                  accessibilityRole="button"
                                  accessibilityLabel={project.completed ? 
                                    "Mark project as incomplete" : 
                                    "Mark project as complete"}
                                  accessibilityState={{ checked: project.completed }}
                                >
                                  <Ionicons 
                                    name={project.completed ? "refresh-outline" : "checkmark-done-outline"} 
                                    size={scaleWidth(14)} 
                                    color={project.completed ? 
                                      project.color || goal.color || theme.primary : 
                                      secondaryTextColor
                                    } 
                                  />
                                </TouchableOpacity>
                                
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
                                      activeOpacity={0.7}
                                      accessible={true}
                                      accessibilityRole="button"
                                      accessibilityLabel={`Task: ${task.title}${(task.completed || task.status === 'done') ? ', Completed' : ''}`}
                                      accessibilityHint="Tap to toggle completion"
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
                          No projects in this goal
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </Animated.View>
            ))
          ) : (
            <View style={[
              styles.emptyState,
              {
                alignItems: 'center',
                justifyContent: 'center',
                padding: spacing.xl,
                marginTop: spacing.m
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
                <Ionicons name="layers-outline" size={scaleWidth(60)} color={theme.primary} />
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
                    marginBottom: spacing.xl
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Start building your life plan by adding goals
              </Text>
              <TouchableOpacity 
                style={[
                  styles.emptyStateButton, 
                  { 
                    backgroundColor: theme.primary,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: spacing.m,
                    paddingHorizontal: spacing.m,
                    borderRadius: scaleWidth(25)
                  }
                ]}
                onPress={() => navigation.navigate('GoalDetails', { 
                  mode: 'create',
                  previousScreen: isEmbeddedInTab ? 'GoalsTab' : 'LifePlanOverview'
                })}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add your first goal"
              >
                <Ionicons name="add" size={scaleWidth(18)} color="#FFFFFF" style={{ marginRight: spacing.xs }} />
                <Text 
                  style={[
                    styles.emptyStateButtonText,
                    {
                      fontSize: fontSizes.m,
                      fontWeight: '600',
                      color: '#FFFFFF'
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Add Your First Goal
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Strategic Direction Edit Modal - MODIFIED TO HANDLE KEYBOARD */}
      <Modal
        visible={directionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDirectionModalVisible(false)}
        accessible={true}
        accessibilityViewIsModal={true}
        accessibilityLabel="Edit Strategic Direction"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[
              styles.modalOverlay,
              {
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                padding: spacing.m
              }
            ]}>
              <View style={[
                styles.modalContent, 
                { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  width: '90%',
                  maxWidth: isTablet ? scaleWidth(500) : '100%',
                  borderRadius: scaleWidth(16),
                  padding: spacing.m,
                  borderWidth: 1,
                  maxHeight: '80%'
                }
              ]}>
                <View style={[
                  styles.modalHeader,
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing.m
                  }
                ]}>
                  <Text 
                    style={[
                      styles.modalTitle, 
                      { 
                        color: textColor,
                        fontSize: fontSizes.xl,
                        fontWeight: '700'
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Strategic Direction
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.modalCloseButton,
                      { padding: spacing.xs }
                    ]}
                    onPress={() => setDirectionModalVisible(false)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Close modal"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={scaleWidth(24)} color={secondaryTextColor} />
                  </TouchableOpacity>
                </View>
                
                <Text 
                  style={[
                    styles.modalDescription, 
                    { 
                      color: secondaryTextColor,
                      fontSize: fontSizes.m,
                      marginBottom: spacing.m,
                      lineHeight: scaleHeight(22)
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Your strategic direction defines your overall purpose and guides all of your goals, projects, and tasks.
                </Text>
                
                <TextInput
                  style={[
                    styles.directionInput, 
                    { 
                      color: textColor,
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      borderColor: theme.border,
                      borderWidth: 1,
                      borderRadius: scaleWidth(12),
                      padding: spacing.m,
                      fontSize: fontSizes.m,
                      minHeight: scaleHeight(120),
                      marginBottom: spacing.m,
                      textAlignVertical: "top"
                    }
                  ]}
                  value={editedDirection}
                  onChangeText={setEditedDirection}
                  multiline
                  placeholder="Define your life direction..."
                  placeholderTextColor={secondaryTextColor}
                  textAlignVertical="top"
                  maxFontSizeMultiplier={1.5}
                  accessible={true}
                  accessibilityLabel="Strategic direction text"
                  accessibilityHint="Enter your life direction that guides all goals and projects"
                />
                
                <View style={[
                  styles.modalFooter,
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                  }
                ]}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton, 
                      { 
                        backgroundColor: 'transparent',
                        borderColor: theme.border,
                        borderWidth: 1,
                        flex: 0.48,
                        paddingVertical: spacing.m,
                        borderRadius: scaleWidth(12),
                        alignItems: 'center',
                        justifyContent: 'center'
                      }
                    ]}
                    onPress={() => setDirectionModalVisible(false)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                  >
                    <Text 
                      style={[
                        styles.modalButtonText, 
                        { 
                          color: textColor,
                          fontSize: fontSizes.m,
                          fontWeight: '600'
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.modalButton, 
                      { 
                        backgroundColor: theme.primary,
                        flex: 0.48,
                        paddingVertical: spacing.m,
                        borderRadius: scaleWidth(12),
                        alignItems: 'center',
                        justifyContent: 'center'
                      }
                    ]}
                    onPress={saveDirection}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Save strategic direction"
                  >
                    <Text 
                      style={[
                        styles.modalButtonText, 
                        { 
                          color: '#FFFFFF',
                          fontSize: fontSizes.m,
                          fontWeight: '600'
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Strategic Direction Info Modal - ALSO MODIFIED TO BE CONSISTENT */}
      <Modal
        visible={infoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setInfoModalVisible(false)}
        accessible={true}
        accessibilityViewIsModal={true}
        accessibilityLabel="About Strategic Direction"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={[
            styles.modalOverlay,
            {
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: spacing.m
            }
          ]}>
            <View style={[
              styles.modalContent, 
              { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                width: '90%',
                maxWidth: isTablet ? scaleWidth(500) : '100%',
                borderRadius: scaleWidth(16),
                padding: spacing.m,
                borderWidth: 1,
                maxHeight: '80%'
              }
            ]}>
              <View style={[
                styles.modalHeader,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.m
                }
              ]}>
                <Text 
                  style={[
                    styles.modalTitle, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.xl,
                      fontWeight: '700'
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  About Strategic Direction
                </Text>
                <TouchableOpacity
                  style={[
                    styles.modalCloseButton,
                    { padding: spacing.xs }
                  ]}
                  onPress={() => setInfoModalVisible(false)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={scaleWidth(24)} color={secondaryTextColor} />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={[
                  styles.infoScrollView,
                  { marginBottom: spacing.m }
                ]}
                accessible={true}
                accessibilityRole="scrollView"
              >
                <Text 
                  style={[
                    styles.infoText, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      lineHeight: scaleHeight(22),
                      marginBottom: spacing.m
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Your Strategic Direction is the compass that guides all your goals, projects, and daily tasks. It answers the big question: "What am I working toward in my life?"
                </Text>
                
                <Text 
                  style={[
                    styles.infoSectionTitle, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.l,
                      fontWeight: '600',
                      marginTop: spacing.m,
                      marginBottom: spacing.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Why it matters:
                </Text>
                <Text 
                  style={[
                    styles.infoText, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      lineHeight: scaleHeight(22),
                      marginBottom: spacing.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  • Creates coherence across all your activities
                </Text>
                <Text 
                  style={[
                    styles.infoText, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      lineHeight: scaleHeight(22),
                      marginBottom: spacing.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  • Helps you prioritize what's truly important
                </Text>
                <Text 
                  style={[
                    styles.infoText, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      lineHeight: scaleHeight(22),
                      marginBottom: spacing.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  • Provides clarity when making decisions
                </Text>
                <Text 
                  style={[
                    styles.infoText, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      lineHeight: scaleHeight(22),
                      marginBottom: spacing.m
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  • Keeps you focused on your long-term vision
                </Text>
                
                <Text 
                  style={[
                    styles.infoSectionTitle, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.l,
                      fontWeight: '600',
                      marginTop: spacing.m,
                      marginBottom: spacing.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Example:
                </Text>
                <View style={[
                  styles.exampleBox, 
                  { 
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: scaleWidth(12),
                    padding: spacing.m,
                    marginVertical: spacing.xs
                  }
                ]}>
                  <Text 
                    style={[
                      styles.exampleText, 
                      { 
                        color: textColor,
                        fontSize: fontSizes.m,
                        lineHeight: scaleHeight(22),
                        fontStyle: 'italic'
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    "To build a life that balances professional growth and meaningful relationships while prioritizing health and creativity. I aim to create work that has positive impact, maintain deep connections with family and friends, and continuously learn and grow as a person."
                  </Text>
                </View>
                
                <Text 
                  style={[
                    styles.infoSectionTitle, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.l,
                      fontWeight: '600',
                      marginTop: spacing.m,
                      marginBottom: spacing.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Tips for writing yours:
                </Text>
                <Text 
                  style={[
                    styles.infoText, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      lineHeight: scaleHeight(22),
                      marginBottom: spacing.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  • Keep it brief but meaningful (2-4 sentences)
                </Text>
                <Text 
                  style={[
                    styles.infoText, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      lineHeight: scaleHeight(22),
                      marginBottom: spacing.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  • Include your core values and priorities
                </Text>
                <Text 
                  style={[
                    styles.infoText, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      lineHeight: scaleHeight(22),
                      marginBottom: spacing.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  • Focus on your desired impact and legacy
                </Text>
                <Text 
                  style={[
                    styles.infoText, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      lineHeight: scaleHeight(22),
                      marginBottom: spacing.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  • Make it personally resonant - it should feel authentic to you
                </Text>
                <Text 
                  style={[
                    styles.infoText, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      lineHeight: scaleHeight(22),
                      marginBottom: spacing.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  • Revisit and refine it periodically as you evolve
                </Text>
              </ScrollView>
              
              <TouchableOpacity
                style={[
                  styles.modalButtonFull, 
                  { 
                    backgroundColor: theme.primary,
                    width: '100%',
                    paddingVertical: spacing.m,
                    borderRadius: scaleWidth(12),
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: spacing.s
                  }
                ]}
                onPress={() => {
                  setInfoModalVisible(false);
                  openDirectionModal();
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Set my strategic direction"
              >
                <Text 
                  style={[
                    styles.modalButtonText, 
                    { 
                      color: '#FFFFFF',
                      fontSize: fontSizes.m,
                      fontWeight: '600'
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Set My Strategic Direction
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButtonOverlay: {},
  collapseButtonOverlay: {},
  infoButtonOverlay: {},
  iconBackground: {},
  scrollView: {},
  sectionTitle: {},
  sectionTitleText: {},
  directionContainer: {},
  directionContentContainer: {},
  directionIconContainer: {},
  directionIcon: {},
  directionTitle: {},
  directionTextContainer: {},
  directionText: {},
  hierarchyContainer: {},
  hierarchyItem: {},
  goalItem: {},
  goalColorBand: {},
  goalHeader: {},
  goalTitleContainer: {},
  goalIconCircle: {},
  goalTitle: {},
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
  directionInput: {},
  modalFooter: {},
  modalButton: {},
  modalButtonFull: {},
  modalButtonText: {},
  infoScrollView: {},
  infoText: {},
  infoSectionTitle: {},
  exampleBox: {},
  exampleText: {},
});

export default LifePlanOverviewScreen;