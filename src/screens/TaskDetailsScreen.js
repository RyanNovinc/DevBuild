// src/screens/TaskDetailsScreen.js - Standalone task creation/editing
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  FlatList,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes
} from '../utils/responsive';

const Tab = createMaterialTopTabNavigator();

// Add Task Tab Component - Memoized to prevent keyboard dismissal
const AddTaskTab = React.memo(({ 
  taskDetailsState,
  handlers
}) => {
  const { theme } = useTheme();
  const { goals = [] } = useAppContext();
  const {
    isEditing,
    title,
    description,
    selectedGoalId,
    selectedMilestoneId
  } = taskDetailsState;
  
  const {
    setTitle,
    setDescription,
    setSelectedGoalId,
    setSelectedMilestoneId,
    handleAddToList
  } = handlers;

  return (
    <ScrollView style={[styles.content, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* Task Title */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.text }]}>
          Task Title *
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              color: theme.text
            }
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title..."
          placeholderTextColor={theme.textSecondary}
          autoFocus={false}
          onSubmitEditing={isEditing ? undefined : handleAddToList}
          returnKeyType={isEditing ? 'default' : 'done'}
          blurOnSubmit={false}
        />
      </View>
      
      {/* Task Description */}
      {isEditing && (
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Description
          </Text>
          <TextInput
            style={[
              styles.textInput,
              styles.textArea,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.text
              }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add description..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      )}
      
      {/* Goal Selection */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.text }]}>
          Goal
        </Text>
        <View style={styles.optionsList}>
          {/* Standalone Task option */}
          <TouchableOpacity
            style={[
              styles.optionButton,
              {
                backgroundColor: !selectedGoalId ? theme.primary : theme.card,
                borderColor: theme.border
              }
            ]}
            onPress={() => {
              setSelectedGoalId(null);
              setSelectedMilestoneId(null);
            }}
          >
            <Text style={[
              styles.optionText,
              { color: !selectedGoalId ? '#FFFFFF' : theme.text }
            ]}>
              Standalone Task
            </Text>
          </TouchableOpacity>
          
          {/* Show goals if available */}
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.optionButton,
                {
                  backgroundColor: selectedGoalId === goal.id ? theme.primary : theme.card,
                  borderColor: theme.border
                }
              ]}
              onPress={() => {
                setSelectedGoalId(goal.id);
                setSelectedMilestoneId(null); // Reset milestone when goal changes
              }}
            >
              <Text style={[
                styles.optionText,
                { color: selectedGoalId === goal.id ? '#FFFFFF' : theme.text }
              ]}>
                {goal.title || goal.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Milestone Selection - Only show if a goal is selected */}
      {selectedGoalId && (
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>
            Milestone
          </Text>
          {(() => {
            const selectedGoal = goals.find(g => g.id === selectedGoalId);
            const goalMilestones = selectedGoal?.projects || []; // TODO: Rename to milestones
            
            return (
              <View style={styles.optionsList}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: !selectedMilestoneId ? theme.primary : theme.card,
                      borderColor: theme.border
                    }
                  ]}
                  onPress={() => setSelectedMilestoneId(null)}
                >
                  <Text style={[
                    styles.optionText,
                    { color: !selectedMilestoneId ? '#FFFFFF' : theme.text }
                  ]}>
                    Standalone Task
                  </Text>
                </TouchableOpacity>
                
                {goalMilestones.map((milestone) => (
                  <TouchableOpacity
                    key={milestone.id}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: selectedMilestoneId === milestone.id ? theme.primary : theme.card,
                        borderColor: theme.border
                      }
                    ]}
                    onPress={() => setSelectedMilestoneId(milestone.id)}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: selectedMilestoneId === milestone.id ? '#FFFFFF' : theme.text }
                    ]}>
                      {milestone.title || milestone.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })()}
        </View>
      )}
    </ScrollView>
  );
});

// Task List Tab Component - Memoized to prevent unnecessary re-renders
const TaskListTab = React.memo(({ 
  taskList,
  groupedTasks,
  expandedGoalId,
  expandedMilestones,
  goals,
  renderTaskGroup,
  setActiveTab
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.listContainer, { backgroundColor: theme.background }]}>
      {taskList.length > 0 ? (
        <ScrollView 
          contentContainerStyle={styles.taskListContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Render Standalone Tasks first if they exist */}
          {groupedTasks.standalone && renderTaskGroup('standalone', groupedTasks.standalone)}
          
          {/* Render Goal-based task groups */}
          {Object.entries(groupedTasks)
            .filter(([goalId]) => goalId !== 'standalone')
            .map(([goalId, goalData]) => renderTaskGroup(goalId, goalData))
          }
        </ScrollView>
      ) : (
        <View style={styles.emptyList}>
          <Ionicons name="list-outline" size={scaleWidth(64)} color={theme.textSecondary} />
          <Text style={[styles.emptyListTitle, { color: theme.text }]}>
            No tasks added yet
          </Text>
          <Text style={[styles.emptyListText, { color: theme.textSecondary }]}>
            Switch to the "Add Task" tab to create tasks for bulk saving.
          </Text>
        </View>
      )}
    </View>
  );
});

const TaskDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { addTask, updateTask, goals = [] } = useAppContext();
  const { showSuccess, showError } = useNotification();
  
  // Get params
  const { mode = 'create', task = null, previousScreen = 'LifePlanOverview' } = route.params || {};
  const isEditing = mode === 'edit' && task;
  
  // State
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'list'
  const [taskList, setTaskList] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [expandedGoalId, setExpandedGoalId] = useState(null); // Track which goal is expanded, start with none expanded
  const [expandedMilestones, setExpandedMilestones] = useState({}); // Track which milestones are expanded
  
  // Animation for tab count update
  const tabCountAnim = useRef(new Animated.Value(1)).current;
  // Animation for goal expansion
  const expansionAnims = useRef({}).current;
  // Animation for milestone expansion
  const milestoneExpansionAnims = useRef({}).current;
  
  // Initialize form when editing (single task only)
  useEffect(() => {
    if (isEditing && task) {
      setTitle(task.title || task.name || '');
      setDescription(task.description || '');
      setSelectedGoalId(task.goalId || null);
      setSelectedMilestoneId(task.projectId || null); // TODO: Rename projectId to milestoneId
    }
  }, [isEditing, task]);
  
  // Add task to list - Memoized to prevent unnecessary re-renders
  const handleAddToList = React.useCallback(() => {
    if (!title.trim()) {
      showError('Please enter a task title');
      return;
    }
    
    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      goalId: selectedGoalId,
      projectId: selectedMilestoneId, // TODO: Rename to milestoneId
      status: 'todo',
      completed: false
    };
    
    setTaskList(prev => [...prev, newTask]);
    
    // Auto-expand the goal and milestone this task was added to
    const targetGoalId = selectedGoalId || 'standalone';
    setExpandedGoalId(targetGoalId);
    
    // Also auto-expand the milestone if task was added to one
    if (selectedGoalId) {
      const milestoneKey = selectedMilestoneId 
        ? `${selectedGoalId}-${selectedMilestoneId}`
        : `${selectedGoalId}-standalone`;
      setExpandedMilestones(prev => ({
        ...prev,
        [milestoneKey]: true
      }));
    }
    
    // Animate tab count update
    Animated.sequence([
      Animated.timing(tabCountAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(tabCountAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
    // Reset only the title for next task, keep goal/milestone selection
    setTitle('');
    // Don't reset goal/milestone selection for faster entry
    // setSelectedGoalId(null);
    // setSelectedMilestoneId(null);
    
    // Stay on current tab for continuous entry
  }, [title, description, selectedGoalId, selectedMilestoneId, showError, tabCountAnim]);
  
  
  // Remove task from list - Memoized to prevent unnecessary re-renders
  const handleRemoveFromList = React.useCallback((taskId) => {
    setTaskList(prev => prev.filter(t => t.id !== taskId));
  }, []);
  
  // Save all tasks from multiple tab
  const handleSaveAll = async () => {
    if (taskList.length === 0) {
      showError('Please add at least one task to the list');
      return;
    }
    
    try {
      // Save each task sequentially
      for (const taskData of taskList) {
        const completeTaskData = {
          title: taskData.title,
          name: taskData.title,
          description: '', // No description in multi-add mode
          status: 'todo',
          completed: false,
          goalId: taskData.goalId,
          projectId: taskData.projectId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await addTask(completeTaskData);
      }
      
      showSuccess(`Successfully created ${taskList.length} tasks`);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving tasks:', error);
      showError('Failed to save some tasks');
    }
  };
  
  const handleSave = async () => {
    // If editing single task
    if (isEditing) {
      if (!title.trim()) {
        showError('Please enter a task title');
        return;
      }
      
      const taskData = {
        title: title.trim(),
        name: title.trim(),
        description: description.trim(),
        status: task.status || 'todo',
        completed: task.completed || false,
        goalId: selectedGoalId,
        projectId: selectedMilestoneId,
        createdAt: task.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      try {
        await updateTask(task.id, taskData);
        showSuccess('Task updated successfully');
        navigation.goBack();
      } catch (error) {
        console.error('Error updating task:', error);
        showError('Failed to update task');
      }
      return;
    }
    
    // For bulk creation, save all tasks in list
    return handleSaveAll();
  };
  
  const handleCancel = () => {
    const hasChanges = title.trim() || description.trim() || taskList.length > 0;
      
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };
  
  // Group tasks by goal and milestone
  const groupedTasks = taskList.reduce((groups, task) => {
    const goalId = task.goalId || 'standalone';
    
    if (!groups[goalId]) {
      groups[goalId] = {
        milestones: {},
        standalone: [] // Tasks directly under goal with no milestone
      };
    }
    
    if (task.goalId && !task.projectId) {
      // Task is under a goal but no milestone - goes to goal's standalone section
      groups[goalId].standalone.push(task);
    } else if (task.goalId && task.projectId) {
      // Task is under a specific milestone
      if (!groups[goalId].milestones[task.projectId]) {
        groups[goalId].milestones[task.projectId] = [];
      }
      groups[goalId].milestones[task.projectId].push(task);
    } else {
      // True standalone task (no goal, no milestone)
      if (!groups['standalone']) {
        groups['standalone'] = {
          milestones: {},
          standalone: []
        };
      }
      groups['standalone'].standalone.push(task);
    }
    
    return groups;
  }, {});
  
  // Toggle goal expansion
  const toggleGoalExpansion = (goalId) => {
    const newExpandedId = expandedGoalId === goalId ? null : goalId;
    setExpandedGoalId(newExpandedId);
  };
  
  // Toggle milestone expansion
  const toggleMilestoneExpansion = (goalId, milestoneId) => {
    const key = `${goalId}-${milestoneId}`;
    setExpandedMilestones(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Initialize animation value for a goal if it doesn't exist
  const getExpansionAnim = (goalId) => {
    if (!expansionAnims[goalId]) {
      expansionAnims[goalId] = new Animated.Value(expandedGoalId === goalId ? 1 : 0);
    }
    return expansionAnims[goalId];
  };
  
  // Initialize animation value for a milestone if it doesn't exist
  const getMilestoneExpansionAnim = (goalId, milestoneId) => {
    const key = `${goalId}-${milestoneId}`;
    if (!milestoneExpansionAnims[key]) {
      milestoneExpansionAnims[key] = new Animated.Value(expandedMilestones[key] ? 1 : 0);
    }
    return milestoneExpansionAnims[key];
  };
  
  // Update expansion animations when expandedGoalId changes
  useEffect(() => {
    Object.keys(expansionAnims).forEach(goalId => {
      const shouldExpand = expandedGoalId === goalId;
      Animated.timing(expansionAnims[goalId], {
        toValue: shouldExpand ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
  }, [expandedGoalId]);
  
  // Update milestone expansion animations when expandedMilestones changes
  useEffect(() => {
    Object.keys(milestoneExpansionAnims).forEach(key => {
      const shouldExpand = expandedMilestones[key];
      Animated.timing(milestoneExpansionAnims[key], {
        toValue: shouldExpand ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  }, [expandedMilestones]);
  
  // Auto-expand when switching to task list tab if there are tasks
  useEffect(() => {
    if (activeTab === 'list' && taskList.length > 0) {
      // Get the most recent task
      const mostRecentTask = taskList[taskList.length - 1];
      const targetGoalId = mostRecentTask.goalId || 'standalone';
      
      // Expand the goal
      setExpandedGoalId(targetGoalId);
      
      // Expand the milestone if applicable
      if (mostRecentTask.goalId) {
        const milestoneKey = mostRecentTask.projectId 
          ? `${mostRecentTask.goalId}-${mostRecentTask.projectId}`
          : `${mostRecentTask.goalId}-standalone`;
        setExpandedMilestones(prev => ({
          ...prev,
          [milestoneKey]: true
        }));
      }
    }
  }, [activeTab, taskList]);
  
  // Render task item - Memoized to prevent unnecessary re-renders
  const renderTaskItem = React.useCallback((item) => {
    return (
      <View key={item.id} style={[styles.taskItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.taskItemContent}>
          <Text style={[styles.taskItemTitle, { color: theme.text }]}>{item.title}</Text>
        </View>
        <TouchableOpacity onPress={() => handleRemoveFromList(item.id)} style={styles.removeButton}>
          <Ionicons name="close-circle" size={scaleWidth(20)} color={theme.error} />
        </TouchableOpacity>
      </View>
    );
  }, [theme, handleRemoveFromList]);
  
  // Render milestone section
  const renderMilestoneSection = (milestoneId, tasks, goalId) => {
    const goal = goals.find(g => g.id === goalId);
    const milestone = goal?.projects?.find(p => p.id === milestoneId);
    const milestoneTitle = milestone ? (milestone.title || milestone.name) : 'Unknown Milestone';
    const key = `${goalId}-${milestoneId}`;
    const isExpanded = expandedMilestones[key];
    const expansionAnim = getMilestoneExpansionAnim(goalId, milestoneId);
    
    return (
      <View key={milestoneId} style={styles.milestoneSection}>
        <TouchableOpacity 
          style={[styles.milestoneHeader, { backgroundColor: theme.background, borderColor: theme.border }]}
          onPress={() => toggleMilestoneExpansion(goalId, milestoneId)}
          activeOpacity={0.7}
        >
          <Ionicons name="diamond-outline" size={scaleWidth(14)} color={theme.textSecondary} />
          <Text style={[styles.milestoneTitle, { color: theme.textSecondary }]}>
            {milestoneTitle}
          </Text>
          <Text style={[styles.milestoneCount, { color: theme.textSecondary }]}>
            {tasks.length}
          </Text>
          <Animated.View style={{
            transform: [{
              rotate: expansionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '90deg']
              })
            }]
          }}>
            <Ionicons 
              name="chevron-forward" 
              size={scaleWidth(12)} 
              color={theme.textSecondary} 
            />
          </Animated.View>
        </TouchableOpacity>
        
        {/* Use conditional rendering instead of height animation */}
        {isExpanded && (
          <Animated.View 
            style={[
              styles.milestoneContent,
              {
                opacity: expansionAnim,
                transform: [{
                  scaleY: expansionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1]
                  })
                }]
              }
            ]}
          >
            {tasks.map(task => renderTaskItem(task))}
          </Animated.View>
        )}
      </View>
    );
  };
  
  // Render standalone tasks section within a goal
  const renderGoalStandaloneTasks = (tasks, goalId) => {
    if (tasks.length === 0) return null;
    
    const key = `${goalId}-standalone`;
    const isExpanded = expandedMilestones[key];
    const expansionAnim = getMilestoneExpansionAnim(goalId, 'standalone');
    
    return (
      <View style={styles.milestoneSection}>
        <TouchableOpacity 
          style={[styles.milestoneHeader, { backgroundColor: theme.background, borderColor: theme.border }]}
          onPress={() => toggleMilestoneExpansion(goalId, 'standalone')}
          activeOpacity={0.7}
        >
          <Ionicons name="remove-outline" size={scaleWidth(14)} color={theme.textSecondary} />
          <Text style={[styles.milestoneTitle, { color: theme.textSecondary }]}>
            Standalone Tasks
          </Text>
          <Text style={[styles.milestoneCount, { color: theme.textSecondary }]}>
            {tasks.length}
          </Text>
          <Animated.View style={{
            transform: [{
              rotate: expansionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '90deg']
              })
            }]
          }}>
            <Ionicons 
              name="chevron-forward" 
              size={scaleWidth(12)} 
              color={theme.textSecondary} 
            />
          </Animated.View>
        </TouchableOpacity>
        
        {/* Use conditional rendering instead of height animation */}
        {isExpanded && (
          <Animated.View 
            style={[
              styles.milestoneContent,
              {
                opacity: expansionAnim,
                transform: [{
                  scaleY: expansionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1]
                  })
                }]
              }
            ]}
          >
            {tasks.map(task => renderTaskItem(task))}
          </Animated.View>
        )}
      </View>
    );
  };
  
  // Render task group - Memoized to prevent unnecessary re-renders
  const renderTaskGroup = React.useCallback((goalId, goalData) => {
    const goal = goals.find(g => g.id === goalId);
    const isStandalone = goalId === 'standalone';
    const groupTitle = isStandalone ? 'Standalone Tasks' : (goal?.title || goal?.name || 'Unknown Goal');
    const isExpanded = expandedGoalId === goalId;
    const expansionAnim = getExpansionAnim(goalId);
    
    // Calculate total tasks in this goal
    const totalTasks = goalData.standalone.length + 
      Object.values(goalData.milestones).reduce((sum, tasks) => sum + tasks.length, 0);
    
    // No need for height calculations with conditional rendering
    
    return (
      <View key={goalId} style={styles.taskGroup}>
        <TouchableOpacity 
          style={[styles.taskGroupHeader, { backgroundColor: theme.background, borderColor: theme.border }]}
          onPress={() => toggleGoalExpansion(goalId)}
          activeOpacity={0.7}
        >
          <View style={[styles.goalIndicator, { backgroundColor: isStandalone ? theme.textSecondary : (goal?.color || theme.primary) }]} />
          <Text style={[styles.taskGroupTitle, { color: theme.text }]}>
            {groupTitle}
          </Text>
          <Text style={[styles.taskGroupCount, { color: theme.textSecondary }]}>
            {totalTasks} task{totalTasks !== 1 ? 's' : ''}
          </Text>
          <Animated.View style={{
            transform: [{
              rotate: expansionAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '90deg']
              })
            }]
          }}>
            <Ionicons 
              name="chevron-forward" 
              size={scaleWidth(16)} 
              color={theme.textSecondary} 
            />
          </Animated.View>
        </TouchableOpacity>
        
        {/* Use conditional rendering for goals too */}
        {isExpanded && (
          <Animated.View 
            style={[
              styles.taskGroupContent,
              {
                opacity: expansionAnim,
                transform: [{
                  scaleY: expansionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1]
                  })
                }]
              }
            ]}
          >
            {/* For true standalone tasks (no goal) */}
            {isStandalone && goalData.standalone.map(task => renderTaskItem(task))}
            
            {/* For goal-based tasks */}
            {!isStandalone && (
              <>
                {/* Standalone tasks within this goal */}
                {renderGoalStandaloneTasks(goalData.standalone, goalId)}
                
                {/* Milestone sections */}
                {Object.entries(goalData.milestones).map(([milestoneId, tasks]) => 
                  renderMilestoneSection(milestoneId, tasks, goalId)
                )}
              </>
            )}
          </Animated.View>
        )}
      </View>
    );
  }, [goals, expandedGoalId, theme, getExpansionAnim, toggleGoalExpansion, renderTaskItem, renderGoalStandaloneTasks, renderMilestoneSection]);
  
  // Memoized handlers object to prevent unnecessary re-renders
  const handlers = React.useMemo(() => ({
    setTitle,
    setDescription,
    setSelectedGoalId,
    setSelectedMilestoneId,
    handleAddToList
  }), [handleAddToList]);

  // Memoized task details state to prevent unnecessary re-renders
  const taskDetailsState = React.useMemo(() => ({
    isEditing,
    title,
    description,
    selectedGoalId,
    selectedMilestoneId
  }), [isEditing, title, description, selectedGoalId, selectedMilestoneId]);

  // Tab component for Add Task - Memoized to prevent unnecessary re-renders
  const AddTaskTabScreen = React.useCallback(() => (
    <AddTaskTab 
      taskDetailsState={taskDetailsState}
      handlers={handlers}
    />
  ), [taskDetailsState, handlers]);

  // Tab component for Task List - Memoized to prevent unnecessary re-renders
  const TaskListTabScreen = React.useCallback(() => (
    <TaskListTab 
      taskList={taskList}
      groupedTasks={groupedTasks}
      expandedGoalId={expandedGoalId}
      expandedMilestones={expandedMilestones}
      goals={goals}
      renderTaskGroup={renderTaskGroup}
      setActiveTab={setActiveTab}
    />
  ), [taskList, groupedTasks, expandedGoalId, expandedMilestones, goals, renderTaskGroup]);

  // For editing mode, use the simple single-screen layout
  if (isEditing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleCancel}
          >
            <Ionicons name="close" size={scaleWidth(24)} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Edit Task
          </Text>
          
          <TouchableOpacity
            style={[
              styles.headerButton,
              styles.saveButton,
              { backgroundColor: theme.primary }
            ]}
            onPress={handleSave}
          >
            <Text style={[styles.saveButtonText, { color: '#FFFFFF' }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <AddTaskTabScreen />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCancel}
        >
          <Ionicons name="close" size={scaleWidth(24)} color={theme.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Add Tasks
        </Text>
        
        <TouchableOpacity
          style={[
            styles.headerButton,
            styles.saveButton,
            { backgroundColor: theme.primary }
          ]}
          onPress={handleSave}
        >
          <Animated.View style={{ transform: [{ scale: tabCountAnim }] }}>
            <Text style={[styles.saveButtonText, { color: '#FFFFFF' }]}>
              {taskList.length > 0 ? `Save All (${taskList.length})` : 'Save'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Tab Navigator with swipe enabled */}
        <NavigationContainer independent={true} key="task-details-navigator">
          <Tab.Navigator
            initialRouteName="Add Task"
            backBehavior="none"
            screenOptions={{
              tabBarActiveTintColor: theme.text,
              tabBarInactiveTintColor: theme.textSecondary,
              tabBarStyle: { 
                backgroundColor: theme.card,
                elevation: 0,
                shadowOpacity: 0,
                borderRadius: scaleWidth(8),
                marginHorizontal: spacing.m,
                marginBottom: 0,
                height: scaleHeight(44),
              },
              tabBarIndicatorStyle: { 
                backgroundColor: theme.primary,
                height: scaleHeight(38),
                borderRadius: scaleWidth(6),
                marginBottom: 3,
                marginLeft: 3,
                width: '47%', // Adjust for proper fit
                zIndex: 1,
              },
              tabBarLabelStyle: {
                fontSize: scaleFontSize(14),
                fontWeight: '600',
                textTransform: 'none',
                zIndex: 2,
              },
              tabBarItemStyle: {
                paddingVertical: 0,
                height: scaleHeight(38),
                zIndex: 2,
              },
              swipeEnabled: true,
              animationEnabled: true,
              tabBarPressOpacity: 0.8,
              lazy: false, // Render both tabs immediately
              removeClippedSubviews: false, // Keep both tabs in memory
            }}
            screenListeners={{
              state: (e) => {
                // Get active route name and update activeTab state
                const index = e.data.state.index;
                const routes = e.data.state.routes;
                const currentRoute = routes[index].name;
                setActiveTab(currentRoute === 'Add Task' ? 'add' : 'list');
              }
            }}
          >
            <Tab.Screen 
              name="Add Task" 
              children={AddTaskTabScreen}
              options={{
                tabBarLabel: 'Add Task',
                tabBarAccessibilityLabel: "Add Task tab",
              }}
            />
            <Tab.Screen 
              name="Task List" 
              children={TaskListTabScreen}
              options={{
                tabBarLabel: () => (
                  <Animated.Text style={{ 
                    fontSize: scaleFontSize(14),
                    fontWeight: '600',
                    color: activeTab === 'list' ? theme.text : theme.textSecondary,
                    transform: [{ scale: tabCountAnim }]
                  }}>
                    Task List ({taskList.length})
                  </Animated.Text>
                ),
                tabBarAccessibilityLabel: `Task List tab with ${taskList.length} tasks`,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: spacing.s,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(8),
  },
  saveButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.m,
  },
  formGroup: {
    marginBottom: spacing.l,
  },
  label: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    fontSize: fontSizes.m,
  },
  textArea: {
    minHeight: scaleHeight(100),
  },
  helpText: {
    fontSize: fontSizes.s,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  optionsList: {
    gap: spacing.xs,
  },
  optionButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: scaleWidth(8),
    borderWidth: 1,
    alignItems: 'center',
  },
  optionText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: spacing.m,
  },
  listContainer: {
    flex: 1,
  },
  taskListContent: {
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.m,
  },
  emptyList: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
  emptyListTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    marginTop: spacing.l,
    textAlign: 'center',
  },
  emptyListText: {
    fontSize: fontSizes.m,
    marginTop: spacing.s,
    textAlign: 'center',
    lineHeight: fontSizes.m * 1.4,
  },
  switchTabButton: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(8),
    marginTop: spacing.l,
  },
  switchTabText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  addToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: scaleWidth(8),
    marginTop: spacing.m,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginLeft: spacing.s,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: scaleWidth(12),
    borderWidth: 1,
    marginBottom: spacing.s,
  },
  taskItemContent: {
    flex: 1,
  },
  taskItemTitle: {
    fontSize: fontSizes.m,
    fontWeight: '500',
  },
  taskItemSubtitle: {
    fontSize: fontSizes.s,
    marginTop: spacing.xs,
  },
  removeButton: {
    padding: spacing.s,
    marginLeft: spacing.m,
  },
  taskGroup: {
    marginBottom: spacing.l,
  },
  taskGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderWidth: 2,
    borderRadius: scaleWidth(12),
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalIndicator: {
    width: scaleWidth(16),
    height: scaleWidth(16),
    borderRadius: scaleWidth(8),
    marginRight: spacing.m,
  },
  taskGroupTitle: {
    fontSize: fontSizes.l,
    fontWeight: '700',
    flex: 1,
  },
  taskGroupCount: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: scaleWidth(12),
    marginRight: spacing.s,
  },
  taskGroupContent: {
    paddingLeft: spacing.s,
    overflow: 'hidden',
  },
  milestoneSection: {
    marginBottom: spacing.s,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderWidth: 1.5,
    borderRadius: scaleWidth(10),
    marginBottom: spacing.s,
    marginLeft: spacing.m,
    marginRight: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  milestoneTitle: {
    fontSize: fontSizes.m,
    fontWeight: '700',
    flex: 1,
    marginLeft: spacing.s,
  },
  milestoneCount: {
    fontSize: fontSizes.s,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.12)',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: scaleWidth(10),
    marginRight: spacing.s,
    minWidth: scaleWidth(28),
    textAlign: 'center',
  },
  milestoneContent: {
    paddingHorizontal: spacing.m,
    paddingBottom: spacing.s,
    overflow: 'hidden',
  },
});

export default TaskDetailsScreen;