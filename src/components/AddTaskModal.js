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
  
  // Update form when editing an existing task
  useEffect(() => {
    if (visible) {
      if (isEditing && task) {
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
        // Reset for new task
        setTitle('');
        setDescription('');
        setSelectedGoalId(null);
        setSelectedGoalTitle('');
        setSelectedProjectId(null);
        setSelectedProjectTitle('');
      }
    }
  }, [visible, isEditing, task]);
  
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
  }, [showGoalList]);
  
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

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleClose = () => {
    setShowGoalList(false);
    setShowProjectList(false);
    onClose();
  };

  const handleAddTask = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a task title.');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      goalId: selectedGoalId,
      goalTitle: selectedGoalTitle,
      projectId: selectedProjectId,
      projectTitle: selectedProjectTitle,
      completed: false
    };

    onAdd(taskData);
    handleClose();
  };

  const selectGoal = (goal) => {
    setSelectedGoalId(goal.id);
    setSelectedGoalTitle(goal.title);
    setShowGoalList(false);
    
    // Clear project selection if it's not available for this goal
    if (selectedProjectId) {
      const projectStillAvailable = allProjects.some(
        project => project.id === selectedProjectId && project.goalId === goal.id
      );
      if (!projectStillAvailable) {
        setSelectedProjectId(null);
        setSelectedProjectTitle('');
      }
    }
  };

  const selectProject = (project) => {
    setSelectedProjectId(project.id);
    setSelectedProjectTitle(project.title);
    setShowProjectList(false);
  };

  const clearGoalSelection = () => {
    setSelectedGoalId(null);
    setSelectedGoalTitle('');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
    setShowGoalList(false);
  };

  const clearProjectSelection = () => {
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
    setShowProjectList(false);
  };

  // Gesture handling for drag-to-dismiss
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleGestureEnd = (event) => {
    const { translationY, velocityY } = event.nativeEvent;
    
    if (translationY > 100 || velocityY > 1000) {
      // User swiped down enough to dismiss
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(handleClose);
    } else {
      // Snap back to original position
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }).start();
    }
  };

  const buttonColor = color || theme.primary || '#007AFF';

  // Simplified editing modal
  const renderEditingModal = () => (
    <View style={styles.editingContainer}>
      <KeyboardAvoidingView 
        style={styles.editingKeyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={[
            styles.editingModalContent, 
            { 
              backgroundColor: theme.card,
              borderRadius: 12,
              margin: spacing.l,
              padding: spacing.l,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }
          ]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Edit Task
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            {/* Task Title Input */}
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
              autoFocus={true}
              maxFontSizeMultiplier={1.3}
              accessible={true}
              accessibilityLabel="Task title"
              accessibilityHint="Enter a title for your task"
            />
            
            {/* Save Button */}
            <TouchableOpacity 
              style={[
                styles.addButton, 
                { 
                  backgroundColor: buttonColor,
                  borderRadius: 8,
                  paddingVertical: spacing.m,
                  alignItems: 'center',
                  marginTop: spacing.xs,
                  minHeight: accessibility.minTouchTarget,
                }
              ]}
              onPress={handleAddTask}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Save changes"
              accessibilityHint="Save the edited task"
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
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );

  // Full creation modal
  const renderCreationModal = () => (
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
        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? scaleHeight(100) : scaleHeight(50)}
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
                maxHeight: '90%',
              }
            ]}>
              {/* Swipe indicator */}
              <View style={[
                styles.swipeIndicator,
                { backgroundColor: theme.textSecondary + '40' }
              ]} />
              
              <View style={[styles.modalHeader, { marginBottom: spacing.m }]}>
                <Text style={[
                  styles.modalTitle, 
                  { 
                    color: theme.text,
                    fontSize: scaleFontSize(20),
                    fontWeight: '600',
                    textAlign: 'center',
                    flex: 1,
                  }
                ]}>
                  Add New Task
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleClose}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                >
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Task Title */}
                <View style={styles.inputSection}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Task Title *
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: theme.inputBackground,
                        color: theme.text,
                        borderColor: theme.border,
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
                </View>

                {/* Goal Selection */}
                <View style={styles.inputSection}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Goal (Optional)
                  </Text>
                  <TouchableOpacity 
                    style={[
                      styles.dropdown, 
                      { 
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.border,
                      }
                    ]}
                    onPress={() => setShowGoalList(!showGoalList)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Select goal"
                  >
                    <Text style={[
                      styles.dropdownText, 
                      { color: selectedGoalTitle ? theme.text : theme.textSecondary }
                    ]}>
                      {selectedGoalTitle || 'Select a goal'}
                    </Text>
                    <View style={styles.dropdownActions}>
                      {selectedGoalId && (
                        <TouchableOpacity 
                          onPress={clearGoalSelection}
                          style={styles.clearButton}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel="Clear goal selection"
                        >
                          <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                      )}
                      <Ionicons 
                        name={showGoalList ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={theme.textSecondary} 
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Goal List */}
                  <Animated.View style={[
                    styles.dropdownList,
                    {
                      height: goalDropdownHeight,
                      opacity: goalDropdownOpacity,
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.border,
                    }
                  ]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {goals.map(goal => (
                        <TouchableOpacity
                          key={goal.id}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: theme.border }
                          ]}
                          onPress={() => selectGoal(goal)}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Select goal: ${goal.title}`}
                        >
                          <View style={[
                            styles.goalColorIndicator,
                            { backgroundColor: goal.color }
                          ]} />
                          <Text style={[styles.dropdownItemText, { color: theme.text }]}>
                            {goal.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </Animated.View>
                </View>

                {/* Project Selection */}
                <View style={styles.inputSection}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Project (Optional)
                  </Text>
                  <TouchableOpacity 
                    style={[
                      styles.dropdown, 
                      { 
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.border,
                        opacity: availableProjects.length === 0 ? 0.5 : 1
                      }
                    ]}
                    onPress={() => availableProjects.length > 0 && setShowProjectList(!showProjectList)}
                    disabled={availableProjects.length === 0}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Select project"
                  >
                    <Text style={[
                      styles.dropdownText, 
                      { color: selectedProjectTitle ? theme.text : theme.textSecondary }
                    ]}>
                      {selectedProjectTitle || (availableProjects.length === 0 ? 'No projects available' : 'Select a project')}
                    </Text>
                    <View style={styles.dropdownActions}>
                      {selectedProjectId && (
                        <TouchableOpacity 
                          onPress={clearProjectSelection}
                          style={styles.clearButton}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel="Clear project selection"
                        >
                          <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                        </TouchableOpacity>
                      )}
                      {availableProjects.length > 0 && (
                        <Ionicons 
                          name={showProjectList ? "chevron-up" : "chevron-down"} 
                          size={20} 
                          color={theme.textSecondary} 
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Project List */}
                  <Animated.View style={[
                    styles.dropdownList,
                    {
                      height: projectDropdownHeight,
                      opacity: projectDropdownOpacity,
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.border,
                    }
                  ]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {availableProjects.map(project => (
                        <TouchableOpacity
                          key={project.id}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: theme.border }
                          ]}
                          onPress={() => selectProject(project)}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Select project: ${project.title}`}
                        >
                          <View style={[
                            styles.goalColorIndicator,
                            { backgroundColor: project.color }
                          ]} />
                          <Text style={[styles.dropdownItemText, { color: theme.text }]}>
                            {project.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </Animated.View>
                </View>

                {/* Description */}
                <View style={styles.inputSection}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
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
                </View>
              </ScrollView>

              {/* Add Button */}
              <TouchableOpacity 
                style={[
                  styles.addButton, 
                  { backgroundColor: buttonColor }
                ]}
                onPress={handleAddTask}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add task"
                accessibilityHint="Create the new task"
              >
                <Text style={styles.addButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Animated.View>
    </PanGestureHandler>
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
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: fadeAnim 
          }
        ]}
      >
        {isEditing ? renderEditingModal() : renderCreationModal()}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
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
    minHeight: scaleHeight(300),
  },
  swipeIndicator: {
    width: scaleWidth(40),
    height: scaleHeight(4),
    borderRadius: scaleWidth(2),
    alignSelf: 'center',
    marginBottom: spacing.s,
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
  textArea: {
    minHeight: scaleHeight(100),
    paddingTop: spacing.s,
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
  dropdownActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    marginRight: spacing.xs,
    padding: spacing.xxxs,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: scaleWidth(8),
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    minHeight: scaleHeight(50),
  },
  dropdownItemText: {
    fontSize: scaleFontSize(16),
    flex: 1,
  },
  goalColorIndicator: {
    width: scaleWidth(12),
    height: scaleWidth(12),
    borderRadius: scaleWidth(6),
    marginRight: spacing.s,
  },
  addButton: {
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(8),
    alignItems: 'center',
    marginTop: spacing.m,
    minHeight: accessibility.minTouchTarget,
  },
  addButtonText: {
    color: '#fff',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  
  // Editing modal styles
  editingContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: scaleHeight(80),
  },
  editingKeyboardContainer: {
    flex: 1,
  },
  editingModalContent: {
    maxHeight: scaleHeight(300),
  }
});

export default AddTaskModal;