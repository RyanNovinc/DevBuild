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
import TaskInputModal from './TaskInputModal';

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
  
  // State for tabs
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'list'
  const [taskList, setTaskList] = useState([]);
  
  // Task state
  const [title, setTitle] = useState('');
  const [showTaskInputModal, setShowTaskInputModal] = useState(false);
  
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
      setTaskList([]);
      setActiveTab('add');
      // Don't reset goal and project selections
    }
  }, [visible, isEditing]);
  
  // Pre-populate data from task prop if provided
  useEffect(() => {
    if (visible && task && !isEditing) {
      setTitle(task.title || '');
      if (task.projectTitle) {
        const project = allProjects.find(p => p.title === task.projectTitle);
        if (project) {
          setSelectedProjectId(project.id);
          setSelectedProjectTitle(project.title);
          if (project.goalId) {
            const goal = goals.find(g => g.id === project.goalId);
            if (goal) {
              setSelectedGoalId(goal.id);
              setSelectedGoalTitle(goal.title);
            }
          }
        }
      }
    }
  }, [visible, task, isEditing]);
  
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
  
  
  // Remove task from list
  const handleRemoveTask = (taskId) => {
    setTaskList(taskList.filter(t => t.id !== taskId));
  };
  
  // Save all tasks
  const handleSaveAll = () => {
    if (taskList.length === 0) {
      Alert.alert('No Tasks', 'Please add at least one task before saving');
      return;
    }
    
    // Call onAdd for each task
    taskList.forEach(task => {
      onAdd({
        title: task.title,
        goalId: task.goalId,
        goalTitle: task.goalTitle,
        projectId: task.projectId,
        projectTitle: task.projectTitle,
        status: task.status
      });
    });
    
    handleClose();
  };
  
  // Select goal
  const selectGoal = (goal) => {
    setSelectedGoalId(goal.id);
    setSelectedGoalTitle(goal.title);
    setShowGoalList(false);
    
    // Reset project if it doesn't belong to the new goal
    if (selectedProjectId) {
      const project = allProjects.find(p => p.id === selectedProjectId);
      if (project && project.goalId !== goal.id) {
        setSelectedProjectId(null);
        setSelectedProjectTitle('');
      }
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
  
  // Render task item
  const renderTaskItem = ({ item }) => {
    const goalColor = item.goalTitle ? goals.find(g => g.title === item.goalTitle)?.color : null;
    const projectColor = item.projectTitle ? allProjects.find(p => p.title === item.projectTitle)?.color : null;
    
    return (
      <View style={[
        styles.taskItem, 
        { 
          backgroundColor: theme.card, 
          borderColor: goalColor || theme.border,
          borderLeftWidth: goalColor ? 3 : 1,
          borderRadius: scaleWidth(12),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
          shadowRadius: 4,
          elevation: 2,
          marginBottom: spacing.m,
        }
      ]}>
        <View style={styles.taskItemContent}>
          <Text style={[
            styles.taskItemTitle, 
            { 
              color: theme.text,
              fontSize: fontSizes.m,
              fontWeight: '600'
            }
          ]}>
            {item.title}
          </Text>
          {(item.goalTitle || item.projectTitle) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
              {item.goalTitle && goalColor && (
                <View style={[
                  styles.goalDot, 
                  { 
                    backgroundColor: goalColor,
                    width: scaleWidth(8),
                    height: scaleWidth(8),
                    borderRadius: scaleWidth(4),
                    marginRight: spacing.xs
                  }
                ]} />
              )}
              {item.projectTitle && projectColor && (
                <View style={[
                  styles.projectDot, 
                  { 
                    backgroundColor: projectColor,
                    width: scaleWidth(6),
                    height: scaleWidth(6),
                    borderRadius: scaleWidth(3),
                    marginRight: spacing.xs
                  }
                ]} />
              )}
              <Text style={[
                styles.taskItemSubtitle, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.s,
                  fontWeight: '500'
                }
              ]}>
                {item.goalTitle}{item.goalTitle && item.projectTitle && ' → '}{item.projectTitle}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          onPress={() => handleRemoveTask(item.id)} 
          style={[
            styles.removeButton,
            {
              backgroundColor: theme.errorLight,
              borderRadius: scaleWidth(20),
              padding: spacing.xs
            }
          ]}
        >
          <Ionicons name="close-circle" size={20} color={theme.error} />
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
              <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
                  {/* Swipe indicator - This is the grab handle */}
                  <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={(event) => {
                      if (event.nativeEvent.state === State.END) {
                        handleGestureEnd(event);
                      }
                    }}
                  >
                    <Animated.View style={styles.swipeHandle}>
                      <View style={[
                        styles.swipeIndicator,
                        { backgroundColor: theme.textSecondary + '40' }
                      ]} />
                    </Animated.View>
                  </PanGestureHandler>
                  
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
                  
                  {/* Tabs */}
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
                      onPress={() => setActiveTab('add')}
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
                      onPress={() => setActiveTab('list')}
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
                  
                  {activeTab === 'add' ? (
                    <ScrollView 
                      style={styles.scrollContent}
                      showsVerticalScrollIndicator={false}
                    >
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
                                  backgroundColor: goals.find(g => g.id === selectedGoalId)?.color || theme.primary,
                                  marginRight: spacing.s
                                }
                              ]} />
                            )}
                            <Text style={[
                              styles.dropdownText,
                              { 
                                color: selectedGoalTitle ? theme.text : theme.textSecondary,
                                fontSize: fontSizes.m,
                                fontWeight: selectedGoalTitle ? '500' : '400'
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
                                  No goals available. Create a goal first to organize your tasks, or create standalone tasks.
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
                      
                      {/* Milestone Selection - Only show when goal is selected */}
                      {selectedGoalId && (
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
                                  backgroundColor: allProjects.find(p => p.id === selectedProjectId)?.color || theme.primary,
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
                                fontWeight: selectedProjectTitle ? '500' : '400'
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
                    <View style={styles.listContainer}>
                      {taskList.length > 0 ? (
                        <FlatList
                          data={taskList}
                          renderItem={renderTaskItem}
                          keyExtractor={(item) => item.id}
                          contentContainerStyle={styles.taskList}
                          showsVerticalScrollIndicator={false}
                        />
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
                            styles.saveAllButton,
                            {
                              borderRadius: scaleWidth(12),
                              overflow: 'hidden',
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.2,
                              shadowRadius: 8,
                              elevation: 5,
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
                              Save All Tasks
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
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
  saveAllButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
});

export default AddTaskModal;