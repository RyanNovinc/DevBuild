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
    : [];
  
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
  
  // Add task to list
  const handleAddTask = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a task name');
      return;
    }
    
    if (!selectedGoalId) {
      Alert.alert('Required Field', 'Please select a goal');
      return;
    }
    
    if (!selectedProjectId) {
      Alert.alert('Required Field', 'Please select a project');
      return;
    }
    
    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      goalId: selectedGoalId,
      goalTitle: selectedGoalTitle,
      projectId: selectedProjectId,
      projectTitle: selectedProjectTitle,
      status: 'todo',
      completed: false
    };
    
    setTaskList([...taskList, newTask]);
    setTitle(''); // Reset only the title
    setActiveTab('list'); // Switch to list tab
  };
  
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
  const renderTaskItem = ({ item }) => (
    <View style={[styles.taskItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.taskItemContent}>
        <Text style={[styles.taskItemTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.taskItemSubtitle, { color: theme.textSecondary }]}>
          {item.goalTitle} → {item.projectTitle}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleRemoveTask(item.id)} style={styles.removeButton}>
        <Ionicons name="close-circle" size={24} color={theme.error} />
      </TouchableOpacity>
    </View>
  );
  
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
            opacity: fadeAnim,
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
                    <Text style={[
                      styles.modalTitle, 
                      { 
                        color: theme.text,
                        maxWidth: accessibility.maxTextWidth
                      }
                    ]}>
                      Add Tasks
                    </Text>
                    <TouchableOpacity 
                      style={styles.closeButton} 
                      onPress={handleClose}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Close modal"
                    >
                      <Ionicons name="close" size={scaleWidth(24)} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Tabs */}
                  <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        activeTab === 'add' && { borderBottomColor: theme.primary }
                      ]}
                      onPress={() => setActiveTab('add')}
                    >
                      <Text style={[
                        styles.tabText,
                        { color: activeTab === 'add' ? theme.primary : theme.textSecondary }
                      ]}>
                        Add Task
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        activeTab === 'list' && { borderBottomColor: theme.primary }
                      ]}
                      onPress={() => setActiveTab('list')}
                    >
                      <Text style={[
                        styles.tabText,
                        { color: activeTab === 'list' ? theme.primary : theme.textSecondary }
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
                      {/* Goal Selection - First */}
                      <View style={[styles.inputSection, { zIndex: 3 }]}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>
                          Goal
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.dropdown,
                            { 
                              backgroundColor: theme.inputBackground,
                              borderColor: theme.border
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
                          <Text style={[
                            styles.dropdownText,
                            { color: selectedGoalTitle ? theme.text : theme.textSecondary }
                          ]}>
                            {selectedGoalTitle || "Select a goal"}
                          </Text>
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
                            borderColor: theme.border
                          }
                        ]}>
                          <ScrollView nestedScrollEnabled={true}>
                            {goals.map((goal) => (
                              <TouchableOpacity
                                key={goal.id}
                                style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                onPress={() => selectGoal(goal)}
                              >
                                <View style={[styles.goalDot, { backgroundColor: goal.color }]} />
                                <Text style={[styles.dropdownItemText, { color: theme.text }]}>
                                  {goal.title}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </Animated.View>
                      </View>
                      
                      {/* Project Selection - Second */}
                      <View style={[styles.inputSection, { zIndex: 2 }]}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>
                          Project
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.dropdown,
                            { 
                              backgroundColor: theme.inputBackground,
                              borderColor: theme.border,
                              opacity: selectedGoalId ? 1 : 0.5
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
                          accessibilityLabel={selectedProjectTitle || "Select a project"}
                          accessibilityHint={selectedGoalId ? "Tap to show project options" : "Select a goal first"}
                        >
                          <Text style={[
                            styles.dropdownText,
                            { color: selectedProjectTitle ? theme.text : theme.textSecondary }
                          ]}>
                            {selectedProjectTitle || (selectedGoalId ? "Select a project" : "Select a goal first")}
                          </Text>
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
                            borderColor: theme.border
                          }
                        ]}>
                          <ScrollView nestedScrollEnabled={true}>
                            {availableProjects.length > 0 ? (
                              availableProjects.map((project) => (
                                <TouchableOpacity
                                  key={project.id}
                                  style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                                  onPress={() => selectProject(project)}
                                >
                                  <View style={[styles.projectDot, { backgroundColor: project.color || theme.primary }]} />
                                  <Text style={[styles.dropdownItemText, { color: theme.text }]}>
                                    {project.title}
                                  </Text>
                                </TouchableOpacity>
                              ))
                            ) : (
                              <View style={styles.emptyDropdown}>
                                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                  No projects for this goal
                                </Text>
                              </View>
                            )}
                          </ScrollView>
                        </Animated.View>
                      </View>
                      
                      {/* Task Title */}
                      <View style={[styles.inputSection, { zIndex: 1 }]}>
                        <Text style={[styles.inputLabel, { color: theme.text }]}>
                          Task Name
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.input,
                            { 
                              backgroundColor: theme.inputBackground,
                              borderColor: theme.border,
                              justifyContent: 'center'
                            }
                          ]}
                          onPress={() => setShowTaskInputModal(true)}
                          accessible={true}
                          accessibilityLabel="Task name input"
                          accessibilityHint="Tap to enter the name for your task"
                        >
                          <Text style={[
                            styles.inputText,
                            { color: title ? theme.text : theme.textSecondary }
                          ]}>
                            {title || "Enter task name"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      
                      {/* Add Task Button */}
                      <TouchableOpacity
                        style={[
                          styles.addButton,
                          { 
                            backgroundColor: theme.primary,
                            opacity: title.trim() && selectedGoalId && selectedProjectId ? 1 : 0.5
                          }
                        ]}
                        onPress={handleAddTask}
                        disabled={!title.trim() || !selectedGoalId || !selectedProjectId}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Add task to list"
                        accessibilityHint="Adds the current task to your task list"
                      >
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                        <Text style={styles.addButtonText}>Add Task to List</Text>
                      </TouchableOpacity>
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
                            { backgroundColor: theme.primary }
                          ]}
                          onPress={handleSaveAll}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel="Save all tasks"
                          accessibilityHint="Saves all tasks in the list"
                        >
                          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                          <Text style={styles.saveAllButtonText}>Save All Tasks</Text>
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
        onConfirm={(taskName) => {
          setTitle(taskName);
          setShowTaskInputModal(false);
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
    padding: spacing.xs,
    minHeight: accessibility.minTouchTarget,
    minWidth: accessibility.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: spacing.m,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.s,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: scaleFontSize(16),
    fontWeight: '500',
  },
  scrollContent: {
    flex: 1,
  },
  inputSection: {
    marginBottom: spacing.l,
  },
  inputLabel: {
    fontSize: scaleFontSize(16),
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: scaleWidth(8),
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
    borderRadius: scaleWidth(8),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: accessibility.minTouchTarget,
  },
  dropdownText: {
    fontSize: scaleFontSize(16),
    flex: 1,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: scaleWidth(8),
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownItemText: {
    fontSize: scaleFontSize(14),
    flex: 1,
  },
  goalDot: {
    width: scaleWidth(12),
    height: scaleWidth(12),
    borderRadius: scaleWidth(6),
    marginRight: spacing.s,
  },
  projectDot: {
    width: scaleWidth(8),
    height: scaleWidth(8),
    borderRadius: scaleWidth(4),
    marginRight: spacing.s,
  },
  emptyDropdown: {
    padding: spacing.m,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: scaleFontSize(14),
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(8),
    marginTop: spacing.m,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    marginLeft: spacing.s,
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
    borderRadius: scaleWidth(8),
    borderWidth: 1,
    marginBottom: spacing.s,
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
    padding: spacing.xs,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(8),
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveAllButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    marginLeft: spacing.s,
  },
});

export default AddTaskModal;