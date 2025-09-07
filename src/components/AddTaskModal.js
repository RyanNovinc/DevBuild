// src/components/AddTaskModal.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  FlatList
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { FREE_PLAN_LIMITS } from '../services/SubscriptionConstants';
import TaskInputModal from './TaskInputModal';
import TextInputModal from './TextInputModal';

// Import responsive utilities
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  isTablet,
  accessibility,
  ensureAccessibleTouchTarget,
  useSafeSpacing
} from '../utils/responsive';

const AddTaskModal = ({ 
  visible, 
  onClose, 
  onAdd, 
  color, 
  task,
  isEditing,
  initialTasks = [], // New prop for batch task creation from AI
  showUpgradePrompt // Function to show upgrade modal
}) => {
  const { theme } = useTheme();
  const appContext = useAppContext();
  const safeSpacing = useSafeSpacing();
  
  // State for tabs
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'list'
  const [taskList, setTaskList] = useState([]);
  
  // Task state
  const [title, setTitle] = useState('');
  const [showTaskInputModal, setShowTaskInputModal] = useState(false);
  
  // Task edit modal state
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  
  
  // Goal and project selection state
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedGoalTitle, setSelectedGoalTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState('');
  
  // Dropdown state
  const [showGoalList, setShowGoalList] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);
  
  // Group reassignment modal state
  const [groupReassignModalVisible, setGroupReassignModalVisible] = useState(false);
  const [currentGroupToReassign, setCurrentGroupToReassign] = useState(null);
  const [reassignSelectedGoalId, setReassignSelectedGoalId] = useState(null);
  const [reassignSelectedGoalTitle, setReassignSelectedGoalTitle] = useState('');
  const [reassignSelectedProjectId, setReassignSelectedProjectId] = useState(null);
  const [reassignSelectedProjectTitle, setReassignSelectedProjectTitle] = useState('');
  
  // Reassignment modal dropdown state
  const [reassignShowGoalList, setReassignShowGoalList] = useState(false);
  const [reassignShowProjectList, setReassignShowProjectList] = useState(false);
  
  // Animation values
  const goalDropdownHeight = useRef(new Animated.Value(0)).current;
  const goalDropdownOpacity = useRef(new Animated.Value(0)).current;
  const projectDropdownHeight = useRef(new Animated.Value(0)).current;
  const projectDropdownOpacity = useRef(new Animated.Value(0)).current;
  
  // Reassignment modal animation values
  const reassignGoalDropdownHeight = useRef(new Animated.Value(0)).current;
  const reassignGoalDropdownOpacity = useRef(new Animated.Value(0)).current;
  const reassignProjectDropdownHeight = useRef(new Animated.Value(0)).current;
  const reassignProjectDropdownOpacity = useRef(new Animated.Value(0)).current;
  
  // Modal animation values
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Get goals and projects from AppContext - filter to only show active/incomplete items
  const goals = (appContext?.goals || []).filter(goal => !goal.completed);
  const allProjects = (appContext?.projects || []).filter(project => 
    !project.completed && project.status !== 'done'
  );
  
  // Filter projects based on selected goal - only show active projects
  const availableProjects = selectedGoalId 
    ? allProjects.filter(project => project.goalId === selectedGoalId) 
    : [];
  
  // Handle modal animation
  useEffect(() => {
    if (visible) {
      // Reset animation values
      backgroundOpacityAnim.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
      translateY.setValue(0);
      
      // Animate in with staggered timing
      Animated.sequence([
        // First darken the background gradually
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        // Then slide in the content
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start();
    }
  }, [visible]);
  
  // Reset form when modal opens
  useEffect(() => {
    if (visible && !isEditing) {
      setTitle('');
      
      // Handle initial tasks from AI (batch creation)
      if (initialTasks.length > 0) {
        const tasksWithDefaults = initialTasks.map(task => ({
          ...task,
          id: task.id || Date.now().toString() + Math.random(),
          goalId: task.goalId || 'standalone',
          goalTitle: task.goalTitle || 'Standalone Task',
          projectId: task.projectId || null,
          projectTitle: task.projectTitle || '',
          status: task.status || 'todo'
        }));
        setTaskList(tasksWithDefaults);
        setActiveTab('list'); // Switch to list tab to show batch
      } else {
        setTaskList([]);
        setActiveTab('add');
      }
      
      // Set default to standalone task
      if (!selectedGoalId) {
        setSelectedGoalId('standalone');
        setSelectedGoalTitle('Standalone Task');
      }
      // Set default milestone to standalone tasks when a real goal is selected
      if (selectedGoalId && selectedGoalId !== 'standalone' && !selectedProjectId) {
        setSelectedProjectId(`${selectedGoalId}-standalone-tasks`);
        setSelectedProjectTitle('Standalone Tasks');
      }
    }
  }, [visible, isEditing, selectedGoalId, initialTasks]);
  
  
  // Animate goal dropdown
  useEffect(() => {
    if (showGoalList) {
      Animated.parallel([
        Animated.timing(goalDropdownHeight, {
          toValue: Math.min(goals.length * scaleHeight(60), scaleHeight(200)),
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(goalDropdownOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(goalDropdownHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(goalDropdownOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    }
  }, [showGoalList, goals.length]);
  
  // Animate project dropdown
  useEffect(() => {
    if (showProjectList) {
      Animated.parallel([
        Animated.timing(projectDropdownHeight, {
          toValue: Math.min(availableProjects.length * scaleHeight(60), scaleHeight(200)),
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(projectDropdownOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(projectDropdownHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(projectDropdownOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    }
  }, [showProjectList, availableProjects.length]);
  
  // Animate reassignment goal dropdown
  useEffect(() => {
    if (reassignShowGoalList) {
      Animated.parallel([
        Animated.timing(reassignGoalDropdownHeight, {
          toValue: Math.min(goals.length * scaleHeight(60), scaleHeight(200)),
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(reassignGoalDropdownOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(reassignGoalDropdownHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(reassignGoalDropdownOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    }
  }, [reassignShowGoalList, goals.length]);
  
  // Animate reassignment project dropdown
  const reassignAvailableProjects = reassignSelectedGoalId 
    ? allProjects.filter(project => project.goalId === reassignSelectedGoalId) 
    : [];
    
  useEffect(() => {
    if (reassignShowProjectList) {
      Animated.parallel([
        Animated.timing(reassignProjectDropdownHeight, {
          toValue: Math.min(reassignAvailableProjects.length * scaleHeight(60), scaleHeight(200)),
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(reassignProjectDropdownOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(reassignProjectDropdownHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(reassignProjectDropdownOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    }
  }, [reassignShowProjectList, reassignAvailableProjects.length]);
  
  // Remove task from list
  const handleRemoveTask = (taskId) => {
    setTaskList(taskList.filter(t => t.id !== taskId));
  };
  
  // Handle task title editing
  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskTitle(task.title);
    setShowEditTaskModal(true);
  };
  
  // Save edited task title
  const handleSaveEditedTask = (newTitle) => {
    if (newTitle.trim() && editingTaskId) {
      setTaskList(taskList.map(task => 
        task.id === editingTaskId 
          ? { ...task, title: newTitle.trim() }
          : task
      ));
    }
    setShowEditTaskModal(false);
    setEditingTaskId(null);
    setEditingTaskTitle('');
  };
  
  // Update tasks in a group (same goal/milestone combination)
  const handleGroupAssignment = (oldGoalId, oldProjectId, newGoalId, newGoalTitle, newProjectId, newProjectTitle) => {
    setTaskList(taskList.map(task => {
      // Match tasks in the same group
      if (task.goalId === oldGoalId && task.projectId === oldProjectId) {
        return {
          ...task,
          goalId: newGoalId,
          goalTitle: newGoalTitle,
          projectId: newProjectId,
          projectTitle: newProjectTitle
        };
      }
      return task;
    }));
  };
  
  // Open group reassignment modal
  const openGroupReassignModal = (group) => {
    setCurrentGroupToReassign(group);
    setReassignSelectedGoalId(group.goalId);
    setReassignSelectedGoalTitle(group.goalTitle);
    setReassignSelectedProjectId(group.projectId);
    setReassignSelectedProjectTitle(group.projectTitle);
    setGroupReassignModalVisible(true);
  };
  
  // Handle reassignment goal selection
  const selectReassignGoal = (goal) => {
    setReassignSelectedGoalId(goal.id);
    setReassignSelectedGoalTitle(goal.title);
    setReassignShowGoalList(false);
    
    // Auto-select "Standalone Tasks" milestone for real goals
    if (goal.id !== 'standalone') {
      setReassignSelectedProjectId(`${goal.id}-standalone-tasks`);
      setReassignSelectedProjectTitle('Standalone Tasks');
    } else {
      // Clear project selection for standalone tasks
      setReassignSelectedProjectId(null);
      setReassignSelectedProjectTitle('');
    }
  };
  
  // Handle reassignment project selection
  const selectReassignProject = (project) => {
    setReassignSelectedProjectId(project.id);
    setReassignSelectedProjectTitle(project.title);
    setReassignShowProjectList(false);
  };
  
  // Handle group reassignment confirmation
  const handleGroupReassignConfirm = () => {
    if (!currentGroupToReassign) return;
    
    handleGroupAssignment(
      currentGroupToReassign.goalId,
      currentGroupToReassign.projectId,
      reassignSelectedGoalId,
      reassignSelectedGoalTitle,
      reassignSelectedProjectId,
      reassignSelectedProjectTitle
    );
    
    // Reset modal state
    setGroupReassignModalVisible(false);
    setCurrentGroupToReassign(null);
    setReassignSelectedGoalId(null);
    setReassignSelectedGoalTitle('');
    setReassignSelectedProjectId(null);
    setReassignSelectedProjectTitle('');
    setReassignShowGoalList(false);
    setReassignShowProjectList(false);
  };
  
  // Group tasks by goal and milestone
  const groupedTasks = taskList.reduce((groups, task) => {
    const groupKey = `${task.goalId || 'standalone'}-${task.projectId || 'none'}`;
    if (!groups[groupKey]) {
      groups[groupKey] = {
        goalId: task.goalId,
        goalTitle: task.goalTitle,
        projectId: task.projectId,
        projectTitle: task.projectTitle,
        tasks: []
      };
    }
    groups[groupKey].tasks.push(task);
    return groups;
  }, {});
  
  // Save all tasks
  const handleSaveAll = () => {
    if (taskList.length === 0) {
      Alert.alert('No Tasks', 'Please add at least one task before saving');
      return;
    }
    
    // Check subscription limits before creating tasks
    const { 
      canAddMoreTasksToMilestone,
      userSubscriptionStatus,
      tasks 
    } = appContext;
    
    // Group tasks by their milestone/project for limit checking
    const tasksByMilestone = {};
    for (const task of taskList) {
      const milestoneId = task.projectId || task.milestoneId || 'standalone';
      if (!tasksByMilestone[milestoneId]) {
        tasksByMilestone[milestoneId] = [];
      }
      tasksByMilestone[milestoneId].push(task);
    }
    
    // Check limits for each milestone/project
    for (const [milestoneId, tasksForMilestone] of Object.entries(tasksByMilestone)) {
      if (milestoneId === 'standalone') {
        // Check standalone task limits
        const standaloneTasks = (tasks || []).filter(t => !t.milestoneId && !t.goalId);
        if (userSubscriptionStatus === 'free' && (standaloneTasks.length + tasksForMilestone.length) > FREE_PLAN_LIMITS.MAX_STANDALONE_TASKS) {
          if (showUpgradePrompt) {
            showUpgradePrompt(
              `You've reached the limit of ${FREE_PLAN_LIMITS.MAX_STANDALONE_TASKS} standalone tasks in the free version. Upgrade to Pro for unlimited tasks.`
            );
          }
          return;
        }
      } else {
        // Check milestone-specific task limits
        if (canAddMoreTasksToMilestone && !canAddMoreTasksToMilestone(milestoneId)) {
          // Check current count and see if adding these tasks would exceed limit
          const currentMilestoneTasks = (tasks || []).filter(t => t.milestoneId === milestoneId || t.projectId === milestoneId);
          if (userSubscriptionStatus === 'free' && (currentMilestoneTasks.length + tasksForMilestone.length) > FREE_PLAN_LIMITS.MAX_TASKS_PER_MILESTONE) {
            if (showUpgradePrompt) {
              showUpgradePrompt(
                `You've reached the limit of ${FREE_PLAN_LIMITS.MAX_TASKS_PER_MILESTONE} tasks per milestone in the free version. Upgrade to Pro for unlimited tasks.`
              );
            }
            return;
          }
        }
      }
    }
    
    // Process and create tasks properly
    const tasksToCreate = taskList.map(task => {
      // Handle standalone tasks at different levels
      if (task.goalId === 'standalone') {
        // Completely standalone task (no goal, no milestone)
        return {
          title: task.title,
          description: task.description || '',
          status: task.status || 'todo',
          completed: task.completed || false,
          milestoneId: null, // No milestone for standalone tasks
          projectId: null,   // No project for standalone tasks  
          goalId: null,      // No goal for standalone tasks
          goalTitle: null,
          milestoneTitle: null,
          projectTitle: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else if (task.projectId && task.projectId.includes('-standalone-tasks')) {
        // Goal-level standalone task (has goal but no real milestone)
        return {
          title: task.title,
          description: task.description || '',
          status: task.status || 'todo',
          completed: task.completed || false,
          milestoneId: null, // No real milestone, just goal-level
          projectId: null,   // No real project
          goalId: task.goalId,      // Has goal
          goalTitle: task.goalTitle,
          milestoneTitle: null,     // No real milestone
          projectTitle: null,       // No real project
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else {
        // Task with real milestone
        return {
          title: task.title,
          description: task.description || '',
          status: task.status || 'todo',
          completed: task.completed || false,
          milestoneId: task.projectId, // Use projectId as milestoneId
          projectId: task.projectId,   // For backward compatibility
          goalId: task.goalId,
          goalTitle: task.goalTitle,
          milestoneTitle: task.projectTitle,
          projectTitle: task.projectTitle, // For backward compatibility
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
    });
    
    // Call onAdd with the processed task array
    onAdd(tasksToCreate);
    
    handleClose();
  };
  
  // Select goal
  const selectGoal = (goal) => {
    setSelectedGoalId(goal.id);
    setSelectedGoalTitle(goal.title);
    setShowGoalList(false);
    
    // Auto-select "Standalone Tasks" milestone for real goals
    if (goal.id !== 'standalone') {
      setSelectedProjectId(`${goal.id}-standalone-tasks`);
      setSelectedProjectTitle('Standalone Tasks');
    } else {
      // Clear project selection for standalone tasks
      setSelectedProjectId(null);
      setSelectedProjectTitle('');
    }
  };
  
  // Select project
  const selectProject = (project) => {
    setSelectedProjectId(project.id);
    setSelectedProjectTitle(project.title);
    setShowProjectList(false);
  };
  
  // Dismiss keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setShowGoalList(false);
    setShowProjectList(false);
  };
  
  // Handle close with animation
  const handleClose = () => {
    const screenHeight = Dimensions.get('window').height;
    
    Animated.sequence([
      // First slide out the content
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }),
      // Then fade out the background
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      })
    ]).start(() => {
      setTitle('');
      setTaskList([]);
      setActiveTab('add');
      setSelectedGoalId(null);
      setSelectedGoalTitle('');
      setSelectedProjectId(null);
      setSelectedProjectTitle('');
      onClose();
    });
  };
  
  // Handle swipe gesture
  const handleGestureEnd = (event) => {
    const { translationY, velocityY } = event.nativeEvent;
    const screenHeight = Dimensions.get('window').height;
    const dismissThreshold = screenHeight * 0.2;
    const fastSwipeVelocity = 1200;
    
    const shouldDismiss = translationY > dismissThreshold || velocityY > fastSwipeVelocity;
    
    if (shouldDismiss) {
      handleClose();
    } else {
      // Bounce back
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }).start();
    }
  };
  
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );
  
  // Render group header
  const renderGroupHeader = (group, groupKey) => {
    const goalColor = group.goalId === 'standalone' 
      ? theme.textSecondary 
      : goals.find(g => g.id === group.goalId)?.color;
    const projectColor = group.projectId && allProjects.find(p => p.id === group.projectId)?.color;
    
    const displayTitle = group.goalId === 'standalone' 
      ? 'Standalone Tasks'
      : `${group.goalTitle}${group.projectTitle ? ` → ${group.projectTitle}` : ''}`;
    
    return (
      <TouchableOpacity 
        key={`header-${groupKey}`}
        style={[
          styles.groupHeader, 
          { 
            backgroundColor: theme.inputBackground,
            borderColor: goalColor || theme.border,
            borderLeftWidth: 4,
            borderRadius: scaleWidth(8),
            marginBottom: spacing.s,
            padding: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
            position: 'relative',
            zIndex: 1,
          }
        ]}
        onPress={() => openGroupReassignModal(group)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Change assignment for ${group.tasks.length} tasks`}
        accessibilityHint="Tap to reassign all tasks in this group"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={[
              styles.groupDot, 
              { 
                backgroundColor: goalColor || theme.textSecondary,
                width: scaleWidth(12),
                height: scaleWidth(12),
                borderRadius: scaleWidth(6),
                marginRight: spacing.s
              }
            ]} />
            <Text style={[
              styles.groupTitle, 
              { 
                color: theme.text,
                fontSize: fontSizes.m,
                fontWeight: '600',
                flex: 1,
                fontStyle: group.goalId === 'standalone' ? 'italic' : 'normal'
              }
            ]}>
              {displayTitle}
            </Text>
            <View style={[
              styles.taskCount,
              {
                backgroundColor: theme.primary + '20',
                borderRadius: scaleWidth(12),
                paddingHorizontal: spacing.s,
                paddingVertical: spacing.xxs,
                marginLeft: spacing.s
              }
            ]}>
              <Text style={[
                styles.taskCountText,
                {
                  color: theme.primary,
                  fontSize: fontSizes.xs,
                  fontWeight: '600'
                }
              ]}>
                {group.tasks.length}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  // Render task item (simplified - no goal/milestone info since it's in header)
  const renderTaskItem = (task, isLast = false) => {
    return (
      <View 
        key={task.id}
        style={[
          styles.taskItem, 
          { 
            backgroundColor: theme.card, 
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: scaleWidth(8),
            marginBottom: isLast ? spacing.m : spacing.s,
            marginLeft: spacing.l, // Indent under header
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: theme.background === '#000000' ? 0.1 : 0.05,
            shadowRadius: 2,
            elevation: 1,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.taskItemContent}
          onPress={() => handleEditTask(task)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Edit task: ${task.title}`}
          accessibilityHint="Tap to edit task title"
        >
          <Text style={[
            styles.taskItemTitle, 
            { 
              color: theme.text,
              fontSize: fontSizes.m,
              fontWeight: '500'
            }
          ]}>
            {task.title}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleRemoveTask(task.id)} 
          style={[
            styles.removeButton,
            {
              backgroundColor: theme.errorLight,
              borderRadius: scaleWidth(16),
              padding: spacing.xs
            }
          ]}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Remove task"
        >
          <Ionicons name="close-circle" size={18} color={theme.error} />
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: backgroundOpacityAnim,
            backgroundColor: 'rgba(0,0,0,0.5)'
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
        
        <Animated.View
          style={[
            styles.gestureContainer,
            {
              transform: [
                { translateY: Animated.add(slideAnim, translateY) }
              ]
            }
          ]}
        >
            <KeyboardAvoidingView
              style={styles.keyboardContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
              <View style={[
                styles.modalContent, 
                { 
                  backgroundColor: theme.card,
                  padding: spacing.m,
                  paddingBottom: safeSpacing.bottom > spacing.m ? safeSpacing.bottom : spacing.xl,
                  borderTopLeftRadius: scaleWidth(16),
                  borderTopRightRadius: scaleWidth(16),
                  height: '95%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: theme.background === '#000000' ? 0.3 : 0.15,
                  shadowRadius: 12,
                  elevation: 8,
                }
              ]}>
                  {/* Swipe indicator - Enhanced grab handle area */}
                  <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={(event) => {
                      if (event.nativeEvent.state === State.END) {
                        handleGestureEnd(event);
                      }
                    }}
                  >
                    <Animated.View style={[styles.swipeHandle, { paddingHorizontal: spacing.xl, paddingVertical: spacing.m }]}>
                      <View style={[
                        styles.swipeIndicator,
                        { backgroundColor: theme.textSecondary + '40' }
                      ]} />
                    </Animated.View>
                  </PanGestureHandler>
                  
                  <TouchableWithoutFeedback onPress={dismissKeyboard}>
                    <View style={[styles.modalHeader, { marginBottom: spacing.m }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons 
                          name="checkbox-outline" 
                          size={scaleWidth(24)} 
                          color={theme.primary} 
                          style={{ marginRight: spacing.xs }}
                        />
                        <Text style={[
                          styles.modalTitle, 
                          { 
                            color: theme.text,
                            fontSize: fontSizes.xl,
                            fontWeight: '700',
                            maxWidth: accessibility.maxTextWidth
                          }
                        ]}>
                          Create Task
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={[
                          styles.closeButton,
                          {
                            padding: spacing.xs,
                            borderRadius: scaleWidth(8),
                            backgroundColor: theme.inputBackground,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 2,
                          }
                        ]} 
                        onPress={handleClose}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Close modal"
                      >
                        <Ionicons name="close" size={scaleWidth(24)} color={theme.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </TouchableWithoutFeedback>
                  
                  {activeTab === 'add' ? (
                    <ScrollView 
                      style={styles.scrollContent}
                      showsVerticalScrollIndicator={false}
                    >
                      {/* Tabs */}
                      <TouchableWithoutFeedback onPress={dismissKeyboard}>
                        <View style={[
                          styles.tabs, 
                          { 
                            backgroundColor: theme.inputBackground,
                            borderRadius: scaleWidth(12),
                            padding: spacing.xs,
                            marginBottom: spacing.m,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 1,
                          }
                        ]}>
                          <TouchableOpacity
                            style={[
                              styles.tab,
                              {
                                backgroundColor: activeTab === 'add' ? theme.primary : 'transparent',
                                borderRadius: scaleWidth(8),
                                paddingVertical: spacing.s,
                                paddingHorizontal: spacing.m,
                              }
                            ]}
                            onPress={() => {
                              setActiveTab('add');
                              dismissKeyboard();
                            }}
                          >
                            <Text style={[
                              styles.tabText,
                              { 
                                color: activeTab === 'add' ? '#FFFFFF' : theme.textSecondary,
                                fontWeight: activeTab === 'add' ? '600' : '500'
                              }
                            ]}>
                              Add Task
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.tab,
                              {
                                backgroundColor: activeTab === 'list' ? theme.primary : 'transparent',
                                borderRadius: scaleWidth(8),
                                paddingVertical: spacing.s,
                                paddingHorizontal: spacing.m,
                              }
                            ]}
                            onPress={() => {
                              setActiveTab('list');
                              dismissKeyboard();
                            }}
                          >
                            <Text style={[
                              styles.tabText,
                              { 
                                color: activeTab === 'list' ? '#FFFFFF' : theme.textSecondary,
                                fontWeight: activeTab === 'list' ? '600' : '500'
                              }
                            ]}>
                              Task List ({taskList.length})
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableWithoutFeedback>
                      
                      {/* Task Title - Now first and primary */}
                      <View style={[
                        styles.inputSection, 
                        { 
                          zIndex: 4,
                          backgroundColor: theme.card,
                          padding: spacing.m,
                          borderRadius: scaleWidth(12),
                          marginBottom: spacing.m,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
                          shadowRadius: 6,
                          elevation: 3,
                        }
                      ]}>
                        <Text style={[
                          styles.inputLabel, 
                          { 
                            color: theme.textSecondary,
                            fontSize: fontSizes.m,
                            fontWeight: '600',
                            marginBottom: spacing.xs,
                          }
                        ]}>
                          Task Name *
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.input,
                            { 
                              backgroundColor: theme.inputBackground,
                              borderColor: theme.border,
                              borderRadius: scaleWidth(12),
                              justifyContent: 'center',
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.05,
                              shadowRadius: 4,
                              elevation: 1,
                            }
                          ]}
                          onPress={() => setShowTaskInputModal(true)}
                          accessible={true}
                          accessibilityLabel="Task name input"
                          accessibilityHint="Tap to enter the name for your task"
                        >
                          <Text style={[
                            styles.inputText,
                            { 
                              color: title ? theme.text : theme.textSecondary,
                              fontSize: fontSizes.m,
                              fontWeight: title ? '500' : '400'
                            }
                          ]}>
                            {title || "Enter task name"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Goal Selection - Now optional */}
                      <View style={[
                        styles.inputSection, 
                        { 
                          zIndex: 3,
                          backgroundColor: theme.card,
                          padding: spacing.m,
                          borderRadius: scaleWidth(12),
                          marginBottom: spacing.m,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
                          shadowRadius: 6,
                          elevation: 3,
                        }
                      ]}>
                        <Text style={[
                          styles.inputLabel, 
                          { 
                            color: theme.textSecondary,
                            fontSize: fontSizes.m,
                            fontWeight: '600',
                            marginBottom: spacing.xs,
                          }
                        ]}>
                          Link to Goal (Optional)
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.dropdown,
                            { 
                              backgroundColor: theme.inputBackground,
                              borderColor: selectedGoalId ? 
                                (goals.find(g => g.id === selectedGoalId)?.color || theme.border) : 
                                theme.border,
                              borderRadius: scaleWidth(12),
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.05,
                              shadowRadius: 4,
                              elevation: 1,
                            }
                          ]}
                          onPress={() => {
                            setShowGoalList(!showGoalList);
                            setShowProjectList(false);
                          }}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={selectedGoalTitle || "Select a goal"}
                          accessibilityHint="Tap to show goal options"
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            {selectedGoalId && (
                              <View style={[
                                styles.goalDot, 
                                { 
                                  backgroundColor: selectedGoalId === 'standalone' 
                                    ? theme.textSecondary 
                                    : goals.find(g => g.id === selectedGoalId)?.color || theme.primary,
                                  marginRight: spacing.s
                                }
                              ]} />
                            )}
                            <Text style={[
                              styles.dropdownText,
                              { 
                                color: selectedGoalTitle ? theme.text : theme.textSecondary,
                                fontSize: fontSizes.m,
                                fontWeight: selectedGoalTitle ? '500' : '400',
                                fontStyle: selectedGoalId === 'standalone' ? 'italic' : 'normal'
                              }
                            ]}>
                              {selectedGoalTitle || "Select a goal to link (optional)"}
                            </Text>
                          </View>
                          <Ionicons 
                            name={showGoalList ? "chevron-up" : "chevron-down"} 
                            size={scaleWidth(20)} 
                            color={theme.textSecondary} 
                          />
                        </TouchableOpacity>
                        
                        <Animated.View style={[
                          styles.dropdownList,
                          {
                            height: goalDropdownHeight,
                            opacity: goalDropdownOpacity,
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                            borderRadius: scaleWidth(12),
                            marginTop: spacing.xs,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: theme.background === '#000000' ? 0.2 : 0.1,
                            shadowRadius: 8,
                            elevation: 5,
                          }
                        ]}>
                          <ScrollView nestedScrollEnabled={true}>
                            {/* Standalone Task Option */}
                            <TouchableOpacity
                              style={[
                                styles.dropdownItem, 
                                { 
                                  borderBottomColor: theme.border,
                                  paddingHorizontal: spacing.m,
                                  paddingVertical: spacing.m,
                                  backgroundColor: selectedGoalId === 'standalone' ? 
                                    (theme.primary + '20') : 'transparent',
                                }
                              ]}
                              onPress={() => {
                                setSelectedGoalId('standalone');
                                setSelectedGoalTitle('Standalone Task');
                                setShowGoalList(false);
                                // Clear project selection when choosing standalone
                                setSelectedProjectId(null);
                                setSelectedProjectTitle('');
                              }}
                            >
                              <View style={[
                                styles.goalDot, 
                                { 
                                  backgroundColor: theme.textSecondary,
                                  width: scaleWidth(14),
                                  height: scaleWidth(14),
                                  borderRadius: scaleWidth(7),
                                }
                              ]} />
                              <Text style={[
                                styles.dropdownItemText, 
                                { 
                                  color: theme.text,
                                  fontSize: fontSizes.m,
                                  fontWeight: selectedGoalId === 'standalone' ? '600' : '500',
                                  fontStyle: 'italic'
                                }
                              ]}>
                                Standalone Task
                              </Text>
                            </TouchableOpacity>
                            
                            {goals.length === 0 ? (
                              <View style={[
                                styles.emptyStateContainer, 
                                { 
                                  borderBottomColor: theme.border,
                                  padding: spacing.m
                                }
                              ]}>
                                <Ionicons name="information-circle" size={20} color={theme.textSecondary} />
                                <Text style={[
                                  styles.emptyStateText, 
                                  { 
                                    color: theme.textSecondary,
                                    fontSize: fontSizes.m
                                  }
                                ]}>
                                  No goals available. Create a goal first to organize your tasks.
                                </Text>
                              </View>
                            ) : (
                              goals.map((goal) => (
                                <TouchableOpacity
                                  key={goal.id}
                                  style={[
                                    styles.dropdownItem, 
                                    { 
                                      borderBottomColor: theme.border,
                                      paddingHorizontal: spacing.m,
                                      paddingVertical: spacing.m,
                                      backgroundColor: selectedGoalId === goal.id ? 
                                        (goal.color + '20') : 'transparent',
                                    }
                                  ]}
                                  onPress={() => selectGoal(goal)}
                                >
                                  <View style={[
                                    styles.goalDot, 
                                    { 
                                      backgroundColor: goal.color,
                                      width: scaleWidth(14),
                                      height: scaleWidth(14),
                                      borderRadius: scaleWidth(7),
                                    }
                                  ]} />
                                  <Text style={[
                                    styles.dropdownItemText, 
                                    { 
                                      color: theme.text,
                                      fontSize: fontSizes.m,
                                      fontWeight: selectedGoalId === goal.id ? '600' : '500'
                                    }
                                  ]}>
                                    {goal.title}
                                  </Text>
                                </TouchableOpacity>
                              ))
                            )}
                          </ScrollView>
                        </Animated.View>
                      </View>
                      
                      {/* Milestone Selection - Only show when goal is selected and not standalone */}
                      {selectedGoalId && selectedGoalId !== 'standalone' && (
                        <View style={[
                          styles.inputSection, 
                          { 
                            zIndex: 2,
                            backgroundColor: theme.card,
                            padding: spacing.m,
                            borderRadius: scaleWidth(12),
                            marginBottom: spacing.m,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
                            shadowRadius: 6,
                            elevation: 3,
                          }
                        ]}>
                          <Text style={[
                            styles.inputLabel, 
                            { 
                              color: theme.textSecondary,
                              fontSize: fontSizes.m,
                              fontWeight: '600',
                              marginBottom: spacing.xs,
                            }
                          ]}>
                            Link to Milestone (Optional)
                          </Text>
                        <TouchableOpacity
                          style={[
                            styles.dropdown,
                            { 
                              backgroundColor: theme.inputBackground,
                              borderColor: selectedProjectId ? 
                                (allProjects.find(p => p.id === selectedProjectId)?.color || theme.border) : 
                                theme.border,
                              borderRadius: scaleWidth(12),
                              opacity: selectedGoalId ? 1 : 0.5,
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.05,
                              shadowRadius: 4,
                              elevation: 1,
                            }
                          ]}
                          onPress={() => {
                            if (selectedGoalId) {
                              setShowProjectList(!showProjectList);
                              setShowGoalList(false);
                            } else {
                              Alert.alert('Select Goal First', 'Please select a goal before choosing a project');
                            }
                          }}
                          disabled={!selectedGoalId}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={selectedProjectTitle || "Select a milestone"}
                          accessibilityHint="Tap to show milestone options"
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            {selectedProjectId && (
                              <View style={[
                                styles.projectDot, 
                                { 
                                  backgroundColor: selectedProjectId === 'standalone' || selectedProjectId?.includes('-standalone-tasks')
                                    ? goals.find(g => g.id === selectedGoalId)?.color || theme.primary
                                    : allProjects.find(p => p.id === selectedProjectId)?.color || theme.primary,
                                  width: scaleWidth(10),
                                  height: scaleWidth(10),
                                  borderRadius: scaleWidth(5),
                                  marginRight: spacing.s
                                }
                              ]} />
                            )}
                            <Text style={[
                              styles.dropdownText,
                              { 
                                color: selectedProjectTitle ? theme.text : theme.textSecondary,
                                fontSize: fontSizes.m,
                                fontWeight: selectedProjectTitle ? '500' : '400',
                                fontStyle: selectedProjectId === 'standalone' ? 'italic' : 'normal'
                              }
                            ]}>
                              {selectedProjectTitle || "Select a milestone (optional)"}
                            </Text>
                          </View>
                          <Ionicons 
                            name={showProjectList ? "chevron-up" : "chevron-down"} 
                            size={scaleWidth(20)} 
                            color={theme.textSecondary} 
                          />
                        </TouchableOpacity>
                        
                        <Animated.View style={[
                          styles.dropdownList,
                          {
                            height: projectDropdownHeight,
                            opacity: projectDropdownOpacity,
                            backgroundColor: theme.card,
                            borderColor: theme.border,
                            borderRadius: scaleWidth(12),
                            marginTop: spacing.xs,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: theme.background === '#000000' ? 0.2 : 0.1,
                            shadowRadius: 8,
                            elevation: 5,
                          }
                        ]}>
                          <ScrollView nestedScrollEnabled={true}>
                            {/* Standalone Tasks Option - Virtual milestone for goal-level tasks */}
                            <TouchableOpacity
                              style={[
                                styles.dropdownItem, 
                                { 
                                  borderBottomColor: theme.border,
                                  paddingHorizontal: spacing.m,
                                  paddingVertical: spacing.m,
                                  backgroundColor: selectedProjectId === `${selectedGoalId}-standalone-tasks` ? 
                                    (theme.primary + '20') : 'transparent',
                                }
                              ]}
                              onPress={() => {
                                setSelectedProjectId(`${selectedGoalId}-standalone-tasks`);
                                setSelectedProjectTitle('Standalone Tasks');
                                setShowProjectList(false);
                              }}
                            >
                              <View style={[
                                styles.projectDot, 
                                { 
                                  backgroundColor: goals.find(g => g.id === selectedGoalId)?.color || theme.primary,
                                  width: scaleWidth(10),
                                  height: scaleWidth(10),
                                  borderRadius: scaleWidth(5),
                                }
                              ]} />
                              <Text style={[
                                styles.dropdownItemText, 
                                { 
                                  color: theme.text,
                                  fontSize: fontSizes.m,
                                  fontWeight: selectedProjectId === `${selectedGoalId}-standalone-tasks` ? '600' : '500'
                                }
                              ]}>
                                Standalone Tasks
                              </Text>
                            </TouchableOpacity>
                            
                            {availableProjects.length > 0 ? (
                              availableProjects.map((project) => (
                                <TouchableOpacity
                                  key={project.id}
                                  style={[
                                    styles.dropdownItem, 
                                    { 
                                      borderBottomColor: theme.border,
                                      paddingHorizontal: spacing.m,
                                      paddingVertical: spacing.m,
                                      backgroundColor: selectedProjectId === project.id ? 
                                        (project.color ? project.color + '20' : theme.primary + '20') : 'transparent',
                                    }
                                  ]}
                                  onPress={() => selectProject(project)}
                                >
                                  <View style={[
                                    styles.projectDot, 
                                    { 
                                      backgroundColor: project.color || theme.primary,
                                      width: scaleWidth(10),
                                      height: scaleWidth(10),
                                      borderRadius: scaleWidth(5),
                                    }
                                  ]} />
                                  <Text style={[
                                    styles.dropdownItemText, 
                                    { 
                                      color: theme.text,
                                      fontSize: fontSizes.m,
                                      fontWeight: selectedProjectId === project.id ? '600' : '500'
                                    }
                                  ]}>
                                    {project.title}
                                  </Text>
                                </TouchableOpacity>
                              ))
                            ) : (
                              <View style={[
                                styles.emptyDropdown,
                                {
                                  padding: spacing.m
                                }
                              ]}>
                                <Text style={[
                                  styles.emptyText, 
                                  { 
                                    color: theme.textSecondary,
                                    fontSize: fontSizes.m
                                  }
                                ]}>
                                  No milestones for this goal
                                </Text>
                              </View>
                            )}
                          </ScrollView>
                        </Animated.View>
                        </View>
                      )}
                      
                    </ScrollView>
                  ) : (
                    <ScrollView 
                      style={styles.listContainer}
                      contentContainerStyle={styles.groupedListContent}
                      showsVerticalScrollIndicator={false}
                      bounces={true}
                      alwaysBounceVertical={false}
                    >
                      {/* Tabs */}
                      <TouchableWithoutFeedback onPress={dismissKeyboard}>
                        <View style={[
                          styles.tabs, 
                          { 
                            backgroundColor: theme.inputBackground,
                            borderRadius: scaleWidth(12),
                            padding: spacing.xs,
                            marginBottom: spacing.m,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 1,
                          }
                        ]}>
                          <TouchableOpacity
                            style={[
                              styles.tab,
                              {
                                backgroundColor: activeTab === 'add' ? theme.primary : 'transparent',
                                borderRadius: scaleWidth(8),
                                paddingVertical: spacing.s,
                                paddingHorizontal: spacing.m,
                              }
                            ]}
                            onPress={() => {
                              setActiveTab('add');
                              dismissKeyboard();
                            }}
                          >
                            <Text style={[
                              styles.tabText,
                              { 
                                color: activeTab === 'add' ? '#FFFFFF' : theme.textSecondary,
                                fontWeight: activeTab === 'add' ? '600' : '500'
                              }
                            ]}>
                              Add Task
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.tab,
                              {
                                backgroundColor: activeTab === 'list' ? theme.primary : 'transparent',
                                borderRadius: scaleWidth(8),
                                paddingVertical: spacing.s,
                                paddingHorizontal: spacing.m,
                              }
                            ]}
                            onPress={() => {
                              setActiveTab('list');
                              dismissKeyboard();
                            }}
                          >
                            <Text style={[
                              styles.tabText,
                              { 
                                color: activeTab === 'list' ? '#FFFFFF' : theme.textSecondary,
                                fontWeight: activeTab === 'list' ? '600' : '500'
                              }
                            ]}>
                              Task List ({taskList.length})
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableWithoutFeedback>
                      
                      {taskList.length > 0 ? (
                        <>
                          {Object.entries(groupedTasks).map(([groupKey, group]) => (
                            <View key={groupKey} style={styles.groupContainer}>
                              {renderGroupHeader(group, groupKey)}
                              {group.tasks.map((task, index) => 
                                renderTaskItem(task, index === group.tasks.length - 1)
                              )}
                            </View>
                          ))}
                        </>
                      ) : (
                        <View style={styles.emptyList}>
                          <Ionicons name="list-outline" size={48} color={theme.textSecondary} />
                          <Text style={[styles.emptyListText, { color: theme.textSecondary }]}>
                            No tasks added yet
                          </Text>
                          <TouchableOpacity
                            style={styles.switchTabButton}
                            onPress={() => setActiveTab('add')}
                          >
                            <Text style={[styles.switchTabText, { color: theme.primary }]}>
                              Add a task
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      
                      {/* Save All Button */}
                      {taskList.length > 0 && (
                        <TouchableOpacity
                          style={[
                            styles.saveAllButtonScrollable,
                            {
                              borderRadius: scaleWidth(12),
                              overflow: 'hidden',
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.2,
                              shadowRadius: 8,
                              elevation: 5,
                              marginTop: spacing.m,
                              marginBottom: spacing.xl,
                            }
                          ]}
                          onPress={handleSaveAll}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel="Save all tasks"
                          accessibilityHint="Saves all tasks in the list"
                        >
                          <LinearGradient
                            colors={[theme.primary, theme.primary + 'DD']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingVertical: spacing.m,
                              paddingHorizontal: spacing.l,
                            }}
                          >
                            <LinearGradient
                              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 0, y: 1 }}
                              style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                height: '50%',
                              }}
                            />
                            <Ionicons 
                              name="checkmark-circle" 
                              size={scaleWidth(24)} 
                              color="#FFFFFF" 
                              style={{ marginRight: spacing.s }}
                            />
                            <Text style={[
                              styles.saveAllButtonText,
                              {
                                fontSize: fontSizes.m,
                                fontWeight: '600',
                                color: '#FFFFFF'
                              }
                            ]}>
                              {taskList.length === 1 ? 'Save Task' : `Save All Tasks (${taskList.length})`}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  )}
                </View>
            </KeyboardAvoidingView>
          </Animated.View>
      </Animated.View>
      
      {/* Task Input Modal */}
      <TaskInputModal
        visible={showTaskInputModal}
        onClose={() => setShowTaskInputModal(false)}
        onAddToList={(newTask) => {
          setTaskList([...taskList, newTask]);
          setTitle(''); // Reset title
          setActiveTab('list'); // Switch to list tab
          setShowTaskInputModal(false);
        }}
        taskData={{
          selectedGoalId,
          selectedGoalTitle,
          selectedProjectId,
          selectedProjectTitle
        }}
        initialValue={title}
      />
      
      {/* Task Edit Modal */}
      <TextInputModal
        visible={showEditTaskModal}
        onClose={() => {
          setShowEditTaskModal(false);
          setEditingTaskId(null);
          setEditingTaskTitle('');
        }}
        onSave={handleSaveEditedTask}
        title="Edit Task Title"
        placeholder="Enter task title"
        value={editingTaskTitle}
        maxLength={100}
        primaryColor={
          selectedGoalId === 'standalone' 
            ? theme.primary
            : goals.find(g => g.id === selectedGoalId)?.color || theme.primary
        }
      />
      
      {/* Group Reassignment Modal */}
      <Modal
        transparent={true}
        visible={groupReassignModalVisible}
        animationType="fade"
        onRequestClose={() => setGroupReassignModalVisible(false)}
      >
        <View style={[
          styles.overlay,
          {
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }
        ]}>
          <TouchableWithoutFeedback onPress={() => setGroupReassignModalVisible(false)}>
            <View style={styles.overlayTouchable} />
          </TouchableWithoutFeedback>
          
          <View style={[
            styles.reassignModalContent,
            {
              backgroundColor: theme.card,
              borderRadius: scaleWidth(16),
              width: '90%',
              maxWidth: scaleWidth(400),
              padding: spacing.l,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: theme.background === '#000000' ? 0.3 : 0.15,
              shadowRadius: 12,
              elevation: 8,
            }
          ]}>
            {/* Header */}
            <View style={styles.reassignModalHeader}>
              <Text style={[
                styles.reassignModalTitle,
                {
                  color: theme.text,
                  fontSize: fontSizes.xl,
                  fontWeight: '700',
                  marginBottom: spacing.xs
                }
              ]}>
                Reassign Tasks
              </Text>
              <Text style={[
                styles.reassignModalSubtitle,
                {
                  color: theme.textSecondary,
                  fontSize: fontSizes.m,
                  marginBottom: spacing.l
                }
              ]}>
                Change assignment for {currentGroupToReassign?.tasks?.length || 0} tasks
              </Text>
            </View>

            {/* Goal Selection */}
            <View style={{ marginBottom: spacing.m, zIndex: 3 }}>
              <Text style={[
                styles.inputLabel,
                {
                  color: theme.textSecondary,
                  fontSize: fontSizes.m,
                  fontWeight: '600',
                  marginBottom: spacing.s
                }
              ]}>
                Goal
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropdown,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: reassignSelectedGoalId ? 
                      (goals.find(g => g.id === reassignSelectedGoalId)?.color || theme.border) : 
                      theme.border,
                    borderRadius: scaleWidth(12),
                    borderWidth: 1,
                    paddingHorizontal: spacing.m,
                    paddingVertical: spacing.s,
                    minHeight: accessibility.minTouchTarget,
                  }
                ]}
                onPress={() => {
                  setReassignShowGoalList(!reassignShowGoalList);
                  setReassignShowProjectList(false);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View style={[
                    styles.goalDot,
                    {
                      backgroundColor: reassignSelectedGoalId === 'standalone'
                        ? theme.textSecondary
                        : goals.find(g => g.id === reassignSelectedGoalId)?.color || theme.primary,
                      width: scaleWidth(12),
                      height: scaleWidth(12),
                      borderRadius: scaleWidth(6),
                      marginRight: spacing.s
                    }
                  ]} />
                  <Text style={[
                    styles.dropdownText,
                    {
                      color: reassignSelectedGoalTitle ? theme.text : theme.textSecondary,
                      fontSize: fontSizes.m,
                      fontWeight: reassignSelectedGoalTitle ? '500' : '400',
                      fontStyle: reassignSelectedGoalId === 'standalone' ? 'italic' : 'normal',
                      flex: 1
                    }
                  ]}>
                    {reassignSelectedGoalTitle || 'Select goal'}
                  </Text>
                </View>
                <Ionicons 
                  name={reassignShowGoalList ? "chevron-up" : "chevron-down"} 
                  size={scaleWidth(20)} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
              
              <Animated.View style={[
                styles.dropdownList,
                {
                  height: reassignGoalDropdownHeight,
                  opacity: reassignGoalDropdownOpacity,
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderRadius: scaleWidth(12),
                  marginTop: spacing.xs,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: theme.background === '#000000' ? 0.2 : 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                }
              ]}>
                <ScrollView nestedScrollEnabled={true}>
                  {/* Standalone Task Option */}
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem, 
                      { 
                        borderBottomColor: theme.border,
                        paddingHorizontal: spacing.m,
                        paddingVertical: spacing.m,
                        backgroundColor: reassignSelectedGoalId === 'standalone' ? 
                          (theme.primary + '20') : 'transparent',
                      }
                    ]}
                    onPress={() => selectReassignGoal({ id: 'standalone', title: 'Standalone Task' })}
                  >
                    <View style={[
                      styles.goalDot, 
                      { 
                        backgroundColor: theme.textSecondary,
                        width: scaleWidth(14),
                        height: scaleWidth(14),
                        borderRadius: scaleWidth(7),
                      }
                    ]} />
                    <Text style={[
                      styles.dropdownItemText, 
                      { 
                        color: theme.text,
                        fontSize: fontSizes.m,
                        fontWeight: reassignSelectedGoalId === 'standalone' ? '600' : '500',
                        fontStyle: 'italic'
                      }
                    ]}>
                      Standalone Task
                    </Text>
                  </TouchableOpacity>
                  
                  {goals.length === 0 ? (
                    <View style={[
                      styles.emptyStateContainer, 
                      { 
                        borderBottomColor: theme.border,
                        padding: spacing.m
                      }
                    ]}>
                      <Ionicons name="information-circle" size={20} color={theme.textSecondary} />
                      <Text style={[
                        styles.emptyStateText, 
                        { 
                          color: theme.textSecondary,
                          fontSize: fontSizes.m
                        }
                      ]}>
                        No goals available. Create a goal first to organize your tasks.
                      </Text>
                    </View>
                  ) : (
                    goals.map((goal) => (
                      <TouchableOpacity
                        key={goal.id}
                        style={[
                          styles.dropdownItem, 
                          { 
                            borderBottomColor: theme.border,
                            paddingHorizontal: spacing.m,
                            paddingVertical: spacing.m,
                            backgroundColor: reassignSelectedGoalId === goal.id ? 
                              (goal.color + '20') : 'transparent',
                          }
                        ]}
                        onPress={() => selectReassignGoal(goal)}
                      >
                        <View style={[
                          styles.goalDot, 
                          { 
                            backgroundColor: goal.color,
                            width: scaleWidth(14),
                            height: scaleWidth(14),
                            borderRadius: scaleWidth(7),
                          }
                        ]} />
                        <Text style={[
                          styles.dropdownItemText, 
                          { 
                            color: theme.text,
                            fontSize: fontSizes.m,
                            fontWeight: reassignSelectedGoalId === goal.id ? '600' : '500'
                          }
                        ]}>
                          {goal.title}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </Animated.View>
            </View>

            {/* Milestone Selection - Only show when goal is selected and not standalone */}
            {reassignSelectedGoalId && reassignSelectedGoalId !== 'standalone' && (
              <View style={{ marginBottom: spacing.l, zIndex: 2 }}>
                <Text style={[
                  styles.inputLabel,
                  {
                    color: theme.textSecondary,
                    fontSize: fontSizes.m,
                    fontWeight: '600',
                    marginBottom: spacing.s
                  }
                ]}>
                  Milestone
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dropdown,
                    {
                      backgroundColor: theme.inputBackground,
                      borderColor: reassignSelectedProjectId ? 
                        (allProjects.find(p => p.id === reassignSelectedProjectId)?.color || theme.border) : 
                        theme.border,
                      borderRadius: scaleWidth(12),
                      borderWidth: 1,
                      paddingHorizontal: spacing.m,
                      paddingVertical: spacing.s,
                      minHeight: accessibility.minTouchTarget,
                    }
                  ]}
                  onPress={() => {
                    setReassignShowProjectList(!reassignShowProjectList);
                    setReassignShowGoalList(false);
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View style={[
                      styles.projectDot,
                      {
                        backgroundColor: reassignSelectedProjectId?.includes('-standalone-tasks')
                          ? goals.find(g => g.id === reassignSelectedGoalId)?.color || theme.primary
                          : allProjects.find(p => p.id === reassignSelectedProjectId)?.color || theme.primary,
                        width: scaleWidth(10),
                        height: scaleWidth(10),
                        borderRadius: scaleWidth(5),
                        marginRight: spacing.s
                      }
                    ]} />
                    <Text style={[
                      styles.dropdownText,
                      {
                        color: reassignSelectedProjectTitle ? theme.text : theme.textSecondary,
                        fontSize: fontSizes.m,
                        fontWeight: reassignSelectedProjectTitle ? '500' : '400',
                        flex: 1
                      }
                    ]}>
                      {reassignSelectedProjectTitle || 'Select milestone'}
                    </Text>
                  </View>
                  <Ionicons 
                    name={reassignShowProjectList ? "chevron-up" : "chevron-down"} 
                    size={scaleWidth(20)} 
                    color={theme.textSecondary} 
                  />
                </TouchableOpacity>
                
                <Animated.View style={[
                  styles.dropdownList,
                  {
                    height: reassignProjectDropdownHeight,
                    opacity: reassignProjectDropdownOpacity,
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    borderRadius: scaleWidth(12),
                    marginTop: spacing.xs,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: theme.background === '#000000' ? 0.2 : 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                  }
                ]}>
                  <ScrollView nestedScrollEnabled={true}>
                    {/* Standalone Tasks Option - Virtual milestone for goal-level tasks */}
                    <TouchableOpacity
                      style={[
                        styles.dropdownItem, 
                        { 
                          borderBottomColor: theme.border,
                          paddingHorizontal: spacing.m,
                          paddingVertical: spacing.m,
                          backgroundColor: reassignSelectedProjectId === `${reassignSelectedGoalId}-standalone-tasks` ? 
                            (theme.primary + '20') : 'transparent',
                        }
                      ]}
                      onPress={() => selectReassignProject({
                        id: `${reassignSelectedGoalId}-standalone-tasks`,
                        title: 'Standalone Tasks'
                      })}
                    >
                      <View style={[
                        styles.projectDot, 
                        { 
                          backgroundColor: goals.find(g => g.id === reassignSelectedGoalId)?.color || theme.primary,
                          width: scaleWidth(10),
                          height: scaleWidth(10),
                          borderRadius: scaleWidth(5),
                        }
                      ]} />
                      <Text style={[
                        styles.dropdownItemText, 
                        { 
                          color: theme.text,
                          fontSize: fontSizes.m,
                          fontWeight: reassignSelectedProjectId === `${reassignSelectedGoalId}-standalone-tasks` ? '600' : '500'
                        }
                      ]}>
                        Standalone Tasks
                      </Text>
                    </TouchableOpacity>
                    
                    {reassignAvailableProjects.length > 0 ? (
                      reassignAvailableProjects.map((project) => (
                        <TouchableOpacity
                          key={project.id}
                          style={[
                            styles.dropdownItem, 
                            { 
                              borderBottomColor: theme.border,
                              paddingHorizontal: spacing.m,
                              paddingVertical: spacing.m,
                              backgroundColor: reassignSelectedProjectId === project.id ? 
                                (project.color ? project.color + '20' : theme.primary + '20') : 'transparent',
                            }
                          ]}
                          onPress={() => selectReassignProject(project)}
                        >
                          <View style={[
                            styles.projectDot, 
                            { 
                              backgroundColor: project.color || theme.primary,
                              width: scaleWidth(10),
                              height: scaleWidth(10),
                              borderRadius: scaleWidth(5),
                            }
                          ]} />
                          <Text style={[
                            styles.dropdownItemText, 
                            { 
                              color: theme.text,
                              fontSize: fontSizes.m,
                              fontWeight: reassignSelectedProjectId === project.id ? '600' : '500'
                            }
                          ]}>
                            {project.title}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={[
                        styles.emptyDropdown,
                        {
                          padding: spacing.m
                        }
                      ]}>
                        <Text style={[
                          styles.emptyText, 
                          { 
                            color: theme.textSecondary,
                            fontSize: fontSizes.m
                          }
                        ]}>
                          No milestones for this goal
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </Animated.View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={[
              styles.reassignModalButtons,
              {
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: spacing.m
              }
            ]}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    flex: 1,
                    backgroundColor: theme.inputBackground,
                    borderRadius: scaleWidth(12),
                    paddingVertical: spacing.m,
                    marginRight: spacing.s,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }
                ]}
                onPress={() => setGroupReassignModalVisible(false)}
              >
                <Text style={[
                  styles.modalButtonText,
                  {
                    color: theme.textSecondary,
                    fontSize: fontSizes.m,
                    fontWeight: '500'
                  }
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    flex: 1,
                    backgroundColor: theme.primary,
                    borderRadius: scaleWidth(12),
                    paddingVertical: spacing.m,
                    marginLeft: spacing.s,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }
                ]}
                onPress={handleGroupReassignConfirm}
              >
                <Text style={[
                  styles.modalButtonText,
                  {
                    color: '#FFFFFF',
                    fontSize: fontSizes.m,
                    fontWeight: '600'
                  }
                ]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  gestureContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    minHeight: scaleHeight(600),
  },
  swipeHandle: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.s,
    alignItems: 'center',
  },
  swipeIndicator: {
    width: scaleWidth(40),
    height: scaleHeight(4),
    borderRadius: scaleWidth(2),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: '600',
  },
  closeButton: {
    minHeight: accessibility.minTouchTarget,
    minWidth: accessibility.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: scaleFontSize(16),
  },
  scrollContent: {
    flex: 1,
  },
  inputSection: {
    // Enhanced styling applied inline
  },
  inputLabel: {
    fontSize: scaleFontSize(16),
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: scaleFontSize(16),
    minHeight: accessibility.minTouchTarget,
  },
  inputText: {
    fontSize: scaleFontSize(16),
  },
  dropdown: {
    borderWidth: 1,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: accessibility.minTouchTarget,
  },
  dropdownText: {
    fontSize: scaleFontSize(16),
  },
  dropdownList: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownItemText: {
    fontSize: scaleFontSize(14),
    flex: 1,
    marginLeft: spacing.s,
  },
  emptyStateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  emptyStateText: {
    fontSize: scaleFontSize(14),
    flex: 1,
    marginLeft: spacing.s,
    fontStyle: 'italic',
  },
  goalDot: {
    width: scaleWidth(12),
    height: scaleWidth(12),
    borderRadius: scaleWidth(6),
  },
  projectDot: {
    width: scaleWidth(8),
    height: scaleWidth(8),
    borderRadius: scaleWidth(4),
  },
  emptyDropdown: {
    alignItems: 'center',
  },
  emptyText: {
    fontSize: scaleFontSize(14),
  },
  listContainer: {
    flex: 1,
  },
  taskList: {
    paddingBottom: spacing.xl,
  },
  groupedList: {
    flex: 1,
  },
  groupedListContent: {
    paddingBottom: spacing.xxl * 2, // Extra space for save button
    flexGrow: 1,
  },
  groupContainer: {
    marginBottom: spacing.m,
  },
  groupHeader: {
    // Styling applied inline for theme support
  },
  groupDot: {
    // Styling applied inline
  },
  groupTitle: {
    // Styling applied inline
  },
  taskCount: {
    // Styling applied inline
  },
  taskCountText: {
    // Styling applied inline
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderWidth: 1,
  },
  taskItemContent: {
    flex: 1,
  },
  taskItemTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '500',
  },
  taskItemSubtitle: {
    fontSize: scaleFontSize(12),
    marginTop: spacing.xxs,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyListText: {
    fontSize: scaleFontSize(16),
    marginTop: spacing.m,
  },
  switchTabButton: {
    marginTop: spacing.m,
  },
  switchTabText: {
    fontSize: scaleFontSize(16),
    fontWeight: '500',
  },
  saveAllButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveAllButtonScrollable: {
    // No positioning, flows with content
  },
  saveAllButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  reassignModalContent: {
    // Styling applied inline for theme support
  },
  reassignModalHeader: {
    // Styling applied inline
  },
  reassignModalTitle: {
    // Styling applied inline
  },
  reassignModalSubtitle: {
    // Styling applied inline
  },
  reassignModalButtons: {
    // Styling applied inline
  },
  modalButton: {
    // Styling applied inline
  },
  modalButtonText: {
    // Styling applied inline
  },
});

export default AddTaskModal;