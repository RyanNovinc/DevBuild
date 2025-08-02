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
  Dimensions
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';

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
  isEditing
}) => {
  const { theme } = useTheme();
  const appContext = useAppContext();
  const safeSpacing = useSafeSpacing();
  
  // Task state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Goal and project selection state
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedGoalTitle, setSelectedGoalTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState('');
  
  // Dropdown state
  const [showGoalList, setShowGoalList] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);
  
  // Animation values
  const goalDropdownHeight = useRef(new Animated.Value(0)).current;
  const goalDropdownOpacity = useRef(new Animated.Value(0)).current;
  const projectDropdownHeight = useRef(new Animated.Value(0)).current;
  const projectDropdownOpacity = useRef(new Animated.Value(0)).current;
  
  // Modal animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
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
    : allProjects;
  
  // Handle modal animation
  useEffect(() => {
    if (visible) {
      // Reset animation values
      fadeAnim.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
      translateY.setValue(0);
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start();
    }
  }, [visible]);
  
  // Log visibility changes for debugging
  useEffect(() => {
    console.log('AddTaskModal visibility changed:', visible);
    console.log('Task data:', task);
  }, [visible, task]);
  
  // Animate goal dropdown opening/closing
  useEffect(() => {
    if (showGoalList) {
      // Open dropdown with animation
      Animated.parallel([
        Animated.timing(goalDropdownHeight, {
          toValue: Math.min(goals.length * scaleHeight(60), scaleHeight(200)), // Height based on number of goals
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
      // Close dropdown with animation
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
  }, [showGoalList]);
  
  // Animate project dropdown opening/closing
  useEffect(() => {
    if (showProjectList) {
      // Open dropdown with animation
      Animated.parallel([
        Animated.timing(projectDropdownHeight, {
          toValue: Math.min(availableProjects.length * scaleHeight(60), scaleHeight(200)), // Height based on number of projects
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
      // Close dropdown with animation
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
  
  // Update form when editing an existing task or when task data changes
  useEffect(() => {
    if (visible) {
      if (isEditing && task) {
        console.log('Setting form for editing task:', task.title);
        setTitle(task.title || '');
        setDescription(task.description || '');
        
        // Set goal and project if available and still active
        if (task.goalId) {
          const goalStillActive = goals.some(goal => goal.id === task.goalId);
          if (goalStillActive) {
            setSelectedGoalId(task.goalId);
            setSelectedGoalTitle(task.goalTitle || '');
          } else {
            setSelectedGoalId(null);
            setSelectedGoalTitle('');
          }
        }
        
        if (task.projectId) {
          const projectStillActive = allProjects.some(project => project.id === task.projectId);
          if (projectStillActive) {
            setSelectedProjectId(task.projectId);
            setSelectedProjectTitle(task.projectTitle || '');
          } else {
            setSelectedProjectId(null);
            setSelectedProjectTitle('');
          }
        }
      } else if (task) {
        console.log('Setting form for new task with pre-filled data:', task.title);
        setTitle(task.title || '');
        setDescription(task.description || '');
        
        // Set goal and project if available and still active
        if (task.goalId) {
          const goalStillActive = goals.some(goal => goal.id === task.goalId);
          if (goalStillActive) {
            setSelectedGoalId(task.goalId);
            setSelectedGoalTitle(task.goalTitle || '');
          } else {
            setSelectedGoalId(null);
            setSelectedGoalTitle('');
          }
        }
        
        if (task.projectId) {
          const projectStillActive = allProjects.some(project => project.id === task.projectId);
          if (projectStillActive) {
            setSelectedProjectId(task.projectId);
            setSelectedProjectTitle(task.projectTitle || '');
          } else {
            setSelectedProjectId(null);
            setSelectedProjectTitle('');
          }
        }
      } else {
        // Reset form when adding a new task without pre-filled data
        console.log('Resetting form for new task');
        setTitle('');
        setDescription('');
        
        // Check if current selections are still valid (not completed)
        if (selectedGoalId) {
          const goalStillActive = goals.some(goal => goal.id === selectedGoalId);
          if (!goalStillActive) {
            setSelectedGoalId(null);
            setSelectedGoalTitle('');
          }
        }
        
        if (selectedProjectId) {
          const projectStillActive = allProjects.some(project => project.id === selectedProjectId);
          if (!projectStillActive) {
            setSelectedProjectId(null);
            setSelectedProjectTitle('');
          }
        }
      }
    }
  }, [isEditing, task, visible, goals, allProjects]);
  
  // Handle goal selection
  const handleGoalSelect = (goal) => {
    console.log('Goal selected:', goal.id, goal.title);
    setSelectedGoalId(goal.id);
    setSelectedGoalTitle(goal.title);
    setShowGoalList(false);
    
    // Reset project selection if it doesn't belong to this goal or if the project is completed
    const projectBelongsToGoal = allProjects.some(
      project => project.id === selectedProjectId && project.goalId === goal.id
    );
    
    if (!projectBelongsToGoal) {
      setSelectedProjectId(null);
      setSelectedProjectTitle('');
    }
  };
  
  // Handle project selection
  const handleProjectSelect = (project) => {
    console.log('Project selected:', project.id, project.title);
    setSelectedProjectId(project.id);
    setSelectedProjectTitle(project.title);
    setShowProjectList(false);
    
    // If the project has a goal, make sure it's selected
    if (project.goalId && project.goalId !== selectedGoalId) {
      const goal = goals.find(g => g.id === project.goalId);
      if (goal) {
        setSelectedGoalId(goal.id);
        setSelectedGoalTitle(goal.title);
      }
    }
  };
  
  // Handle add task
  const handleAddTask = () => {
    if (!title.trim()) {
      Alert.alert(
        "Task Required",
        "Please enter a title for the task.",
        [{ text: "OK" }]
      );
      return;
    }
    
    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status: task?.status || 'todo',
      completed: task?.completed || false,
      // Add goal and project associations
      goalId: selectedGoalId,
      goalTitle: selectedGoalTitle,
      projectId: selectedProjectId,
      projectTitle: selectedProjectTitle
    };
    
    console.log('Creating task with data:', taskData);
    
    // Call parent handler (passing back the updated task data)
    onAdd(taskData);
    
    // Reset form
    setTitle('');
    setDescription('');
    // Don't reset goal and project to preserve previous selections
  };
  
  // Handle swipe gesture
  const handleGestureEnd = (event) => {
    const { translationY, velocityY } = event.nativeEvent;
    const screenHeight = Dimensions.get('window').height;
    const dismissThreshold = screenHeight * 0.2;
    const fastSwipeVelocity = 1200;
    
    const shouldDismiss = translationY > dismissThreshold || velocityY > fastSwipeVelocity;
    
    if (shouldDismiss) {
      // Animate dismiss
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        })
      ]).start(() => {
        onClose();
      });
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
  
  // Dismiss keyboard and dropdowns when clicking outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setShowGoalList(false);
    setShowProjectList(false);
  };
  
  // Handle close with animation
  const handleClose = () => {
    const screenHeight = Dimensions.get('window').height;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }),
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      })
    ]).start(() => {
      onClose();
    });
  };
  
  // Return null if not visible to avoid rendering issues
  if (!visible) return null;
  
  // Get button color with fallbacks
  const buttonColor = color || theme.primary;
  
  // Render goal items list
  const renderGoalsList = () => {
    if (goals.length === 0) {
      return (
        <View style={styles.noItemsContainer}>
          <Text style={[
            styles.noItemsText, 
            { 
              color: theme.textSecondary,
              fontSize: scaleFontSize(14),
              maxFontSizeMultiplier: 1.3,
            }
          ]}>
            No goals available.
          </Text>
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.dropdownScrollView}>
        <View style={[
          styles.dropdownItemsContainer,
          { padding: spacing.s }
        ]}>
          {goals.map((item, index) => {
            if (!item || !item.id) return null;
            
            return (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <View style={[
                    styles.itemSeparator, 
                    { 
                      backgroundColor: theme.border,
                      marginVertical: spacing.xxs
                    }
                  ]} />
                )}
                <TouchableOpacity 
                  style={[
                    styles.dropdownItem, 
                    { 
                      backgroundColor: item.id === selectedGoalId ? theme.primary + '33' : theme.cardElevated,
                      borderLeftColor: item.color || buttonColor,
                      borderLeftWidth: 4,
                      padding: spacing.s,
                      marginVertical: spacing.xxs,
                      borderRadius: 6,
                      minHeight: accessibility.minTouchTarget,
                    }
                  ]}
                  onPress={() => handleGoalSelect(item)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Goal: ${item.title || 'Untitled Goal'}`}
                  accessibilityState={{ selected: item.id === selectedGoalId }}
                  accessibilityHint="Select this goal for the task"
                >
                  <Text 
                    style={[
                      styles.dropdownItemTitle, 
                      { 
                        color: item.id === selectedGoalId ? theme.primary : theme.text,
                        fontWeight: item.id === selectedGoalId ? 'bold' : 'normal',
                        fontSize: scaleFontSize(16),
                        marginBottom: spacing.xxs,
                        maxFontSizeMultiplier: 1.3,
                      }
                    ]}
                  >
                    {item.title || 'Untitled Goal'}
                  </Text>
                  {item.domain && (
                    <Text style={[
                      styles.dropdownItemSubtitle, 
                      { 
                        color: theme.textSecondary,
                        fontSize: scaleFontSize(12),
                        maxFontSizeMultiplier: 1.3,
                      }
                    ]}>
                      {item.domain}
                    </Text>
                  )}
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    );
  };
  
  // Render project items list
  const renderProjectsList = () => {
    if (availableProjects.length === 0) {
      return (
        <View style={[
          styles.noItemsContainer,
          { padding: spacing.m }
        ]}>
          <Text style={[
            styles.noItemsText, 
            { 
              color: theme.textSecondary,
              fontSize: scaleFontSize(14),
              maxFontSizeMultiplier: 1.3,
            }
          ]}>
            {selectedGoalId 
              ? "No projects available for this goal." 
              : "No projects available."}
          </Text>
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.dropdownScrollView}>
        <View style={[
          styles.dropdownItemsContainer,
          { padding: spacing.s }
        ]}>
          {availableProjects.map((item, index) => {
            if (!item || !item.id) return null;
            
            return (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <View style={[
                    styles.itemSeparator, 
                    { 
                      backgroundColor: theme.border,
                      marginVertical: spacing.xxs
                    }
                  ]} />
                )}
                <TouchableOpacity 
                  style={[
                    styles.dropdownItem, 
                    { 
                      backgroundColor: item.id === selectedProjectId ? theme.primary + '33' : theme.cardElevated,
                      borderLeftColor: item.color || buttonColor,
                      borderLeftWidth: 4,
                      padding: spacing.s,
                      marginVertical: spacing.xxs,
                      borderRadius: 6,
                      minHeight: accessibility.minTouchTarget,
                    }
                  ]}
                  onPress={() => handleProjectSelect(item)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Project: ${item.title || 'Untitled Project'}`}
                  accessibilityState={{ selected: item.id === selectedProjectId }}
                  accessibilityHint="Select this project for the task"
                >
                  <Text 
                    style={[
                      styles.dropdownItemTitle, 
                      { 
                        color: item.id === selectedProjectId ? theme.primary : theme.text,
                        fontWeight: item.id === selectedProjectId ? 'bold' : 'normal',
                        fontSize: scaleFontSize(16),
                        marginBottom: spacing.xxs,
                        maxFontSizeMultiplier: 1.3,
                      }
                    ]}
                  >
                    {item.title || 'Untitled Project'}
                  </Text>
                  {item.description && (
                    <Text 
                      style={[
                        styles.dropdownItemSubtitle, 
                        { 
                          color: theme.textSecondary,
                          fontSize: scaleFontSize(12),
                          maxFontSizeMultiplier: 1.3,
                        }
                      ]}
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>
                  )}
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
      </ScrollView>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel={isEditing ? "Edit task modal" : "Add task modal"}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
        
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) {
              handleGestureEnd(event);
            }
          }}
        >
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
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <KeyboardAvoidingView 
                style={styles.keyboardContainer} 
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? scaleHeight(64) : 0}
              >
                <View style={[
                  styles.modalContent, 
                  { 
                    backgroundColor: theme.card,
                    padding: spacing.m,
                    paddingBottom: safeSpacing.bottom > spacing.m ? safeSpacing.bottom : spacing.xl,
                    borderTopLeftRadius: scaleWidth(16),
                    borderTopRightRadius: scaleWidth(16),
                  }
                ]}>
                  {/* Swipe indicator */}
                  <View style={[
                    styles.swipeIndicator,
                    { backgroundColor: theme.textSecondary + '40' }
                  ]} />
            <View style={[
              styles.modalHeader,
              { marginBottom: spacing.m }
            ]}>
              <Text style={[
                styles.modalTitle, 
                { 
                  color: theme.text,
                  fontSize: scaleFontSize(20),
                  fontWeight: 'bold',
                  maxFontSizeMultiplier: 1.3,
                }
              ]}>
                {isEditing ? 'Edit Task' : 'Add Task'}
              </Text>
              <TouchableOpacity 
                style={[
                  styles.closeButton,
                  ensureAccessibleTouchTarget({ width: 30, height: 30 }),
                  { padding: spacing.xs }
                ]} 
                onPress={handleClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                accessibilityHint="Closes the task form"
              >
                <Ionicons name="close" size={scaleWidth(24)} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={[
                styles.formContainer,
                { marginBottom: Platform.OS === 'ios' ? 0 : spacing.m }
              ]}
              contentContainerStyle={{ paddingBottom: spacing.xl }}
            >
              {/* Goal Selection */}
              <Text style={[
                styles.label, 
                { 
                  color: theme.textSecondary,
                  fontSize: scaleFontSize(15),
                  marginBottom: spacing.xs,
                  maxFontSizeMultiplier: 1.3,
                }
              ]}>
                Associated Goal (Optional)
              </Text>
              <TouchableOpacity
                style={[
                  styles.selector,
                  { 
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    borderBottomLeftRadius: showGoalList ? 0 : 8,
                    borderBottomRightRadius: showGoalList ? 0 : 8,
                    borderWidth: 1,
                    paddingHorizontal: spacing.m,
                    paddingVertical: spacing.m,
                    marginBottom: 0,
                    minHeight: accessibility.minTouchTarget,
                  }
                ]}
                onPress={() => {
                  setShowProjectList(false); // Close project dropdown
                  setShowGoalList(!showGoalList);
                }}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Select goal dropdown"
                accessibilityState={{ expanded: showGoalList }}
                accessibilityHint={showGoalList ? "Collapse goal selector" : "Expand goal selector"}
              >
                {selectedGoalId ? (
                  <View style={styles.selectedItemContainer}>
                    <Text style={[
                      styles.selectedItemText, 
                      { 
                        color: theme.text,
                        fontSize: scaleFontSize(16),
                        fontWeight: '500',
                        maxFontSizeMultiplier: 1.3,
                      }
                    ]}>
                      {selectedGoalTitle}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.selectPrompt}>
                    <Ionicons 
                      name="flag-outline" 
                      size={scaleWidth(20)} 
                      color={theme.textSecondary} 
                      style={{ marginRight: spacing.xs }}
                    />
                    <Text style={[
                      styles.promptText, 
                      { 
                        color: theme.textSecondary,
                        fontSize: scaleFontSize(16),
                        maxFontSizeMultiplier: 1.3,
                      }
                    ]}>
                      Select a goal (optional)
                    </Text>
                  </View>
                )}
                <Ionicons 
                  name={showGoalList ? "chevron-up" : "chevron-down"} 
                  size={scaleWidth(20)} 
                  color={theme.textSecondary} 
                  style={{ marginLeft: spacing.xs }}
                />
              </TouchableOpacity>
              
              {/* Goal Dropdown */}
              <Animated.View 
                style={[
                  styles.dropdown, 
                  { 
                    backgroundColor: theme.cardElevated,
                    borderColor: theme.border,
                    maxHeight: goalDropdownHeight,
                    opacity: goalDropdownOpacity,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderTopWidth: 0,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    marginBottom: spacing.m,
                  }
                ]}
              >
                {renderGoalsList()}
              </Animated.View>
              
              {/* Project Selection */}
              <Text style={[
                styles.label, 
                { 
                  color: theme.textSecondary,
                  fontSize: scaleFontSize(15),
                  marginBottom: spacing.xs,
                  maxFontSizeMultiplier: 1.3,
                }
              ]}>
                Associated Project (Optional)
              </Text>
              <TouchableOpacity
                style={[
                  styles.selector,
                  { 
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    borderBottomLeftRadius: showProjectList ? 0 : 8,
                    borderBottomRightRadius: showProjectList ? 0 : 8,
                    borderWidth: 1,
                    paddingHorizontal: spacing.m,
                    paddingVertical: spacing.m,
                    marginBottom: 0,
                    minHeight: accessibility.minTouchTarget,
                  }
                ]}
                onPress={() => {
                  setShowGoalList(false); // Close goal dropdown
                  setShowProjectList(!showProjectList);
                }}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Select project dropdown"
                accessibilityState={{ expanded: showProjectList }}
                accessibilityHint={showProjectList ? "Collapse project selector" : "Expand project selector"}
              >
                {selectedProjectId ? (
                  <View style={styles.selectedItemContainer}>
                    <Text style={[
                      styles.selectedItemText, 
                      { 
                        color: theme.text,
                        fontSize: scaleFontSize(16),
                        fontWeight: '500',
                        maxFontSizeMultiplier: 1.3,
                      }
                    ]}>
                      {selectedProjectTitle}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.selectPrompt}>
                    <Ionicons 
                      name="folder-outline" 
                      size={scaleWidth(20)} 
                      color={theme.textSecondary} 
                      style={{ marginRight: spacing.xs }}
                    />
                    <Text style={[
                      styles.promptText, 
                      { 
                        color: theme.textSecondary,
                        fontSize: scaleFontSize(16),
                        maxFontSizeMultiplier: 1.3,
                      }
                    ]}>
                      {selectedGoalId 
                        ? "Select a project from this goal (optional)" 
                        : "Select a project (optional)"}
                    </Text>
                  </View>
                )}
                <Ionicons 
                  name={showProjectList ? "chevron-up" : "chevron-down"} 
                  size={scaleWidth(20)} 
                  color={theme.textSecondary} 
                  style={{ marginLeft: spacing.xs }}
                />
              </TouchableOpacity>
              
              {/* Project Dropdown */}
              <Animated.View 
                style={[
                  styles.dropdown, 
                  { 
                    backgroundColor: theme.cardElevated,
                    borderColor: theme.border,
                    maxHeight: projectDropdownHeight,
                    opacity: projectDropdownOpacity,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderTopWidth: 0,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    marginBottom: spacing.m,
                  }
                ]}
              >
                {renderProjectsList()}
              </Animated.View>
              
              {/* Task Title */}
              <Text style={[
                styles.label, 
                { 
                  color: theme.textSecondary,
                  fontSize: scaleFontSize(15),
                  marginBottom: spacing.xs,
                  maxFontSizeMultiplier: 1.3,
                }
              ]}>
                Task Title *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: spacing.m,
                    paddingVertical: spacing.s,
                    fontSize: scaleFontSize(16),
                    marginBottom: spacing.m,
                    minHeight: accessibility.minTouchTarget,
                  }
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter task title"
                placeholderTextColor={theme.textSecondary}
                autoFocus={false}
                maxFontSizeMultiplier={1.3}
                accessible={true}
                accessibilityLabel="Task title"
                accessibilityHint="Enter a title for your task"
              />
              
              {/* Task Description */}
              <Text style={[
                styles.label, 
                { 
                  color: theme.textSecondary,
                  fontSize: scaleFontSize(15),
                  marginBottom: spacing.xs,
                  maxFontSizeMultiplier: 1.3,
                }
              ]}>
                Description (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { 
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: spacing.m,
                    paddingVertical: spacing.s,
                    fontSize: scaleFontSize(16),
                    marginBottom: spacing.m,
                    minHeight: scaleHeight(100),
                    paddingTop: spacing.s,
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter task description"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxFontSizeMultiplier={1.3}
                accessible={true}
                accessibilityLabel="Task description"
                accessibilityHint="Enter an optional description for your task"
              />
              
              {/* Add/Save Button */}
              <TouchableOpacity 
                style={[
                  styles.addButton, 
                  { 
                    backgroundColor: buttonColor,
                    borderRadius: 8,
                    paddingVertical: spacing.m,
                    alignItems: 'center',
                    marginTop: spacing.xs,
                    marginBottom: spacing.l,
                    minHeight: accessibility.minTouchTarget,
                  }
                ]}
                onPress={handleAddTask}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={isEditing ? "Save changes" : "Add task"}
                accessibilityHint={isEditing ? "Save the edited task" : "Add the new task"}
              >
                <Text style={[
                  styles.addButtonText,
                  {
                    color: '#fff',
                    fontSize: scaleFontSize(16),
                    fontWeight: '600',
                    maxFontSizeMultiplier: 1.3,
                  }
                ]}>
                  {isEditing ? 'Save Changes' : 'Add Task'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </Modal>
  );
};

// Styles with responsive values
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  overlayTouchable: {
    flex: 1
  },
  gestureContainer: {
    justifyContent: 'flex-end'
  },
  keyboardContainer: {
    justifyContent: 'flex-end'
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16
  },
  modalContent: {
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formContainer: {},
  // Selector styles
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10
  },
  selectPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  selectedItemContainer: {
    flex: 1
  },
  // Dropdown styles
  dropdown: {
    zIndex: 5
  },
  dropdownScrollView: {
    maxHeight: scaleHeight(200)
  },
  itemSeparator: {
    height: 1,
  },
  noItemsContainer: {
    alignItems: 'center'
  },
  textArea: {}
});

export default AddTaskModal;