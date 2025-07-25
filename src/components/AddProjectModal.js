// src/components/AddProjectModal.js
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
  ScrollView,
  Alert,
  Animated,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { scaleWidth, scaleHeight, isSmallDevice, isTablet, fontSizes, spacing } from '../utils/responsive';

const AddProjectModal = ({ 
  visible, 
  onClose, 
  onAdd, 
  projectData,
  color
}) => {
  const { theme } = useTheme();
  const appContext = useAppContext();
  
  // Project state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Selected goal and UI state
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedGoalTitle, setSelectedGoalTitle] = useState('');
  const [selectedGoalColor, setSelectedGoalColor] = useState(null);
  const [showGoalList, setShowGoalList] = useState(false);
  
  // Animation values
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  
  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    goalRequired: false
  });
  
  // Direct access to goals from AppContext
  const goals = appContext?.goals || [];
  
  // Log goals for debugging
  useEffect(() => {
    console.log(`AddProjectModal: ${goals.length} goals found in AppContext`);
  }, [visible, goals]);
  
  // Animate dropdown opening/closing
  useEffect(() => {
    if (showGoalList) {
      // Open dropdown with animation
      Animated.parallel([
        Animated.timing(dropdownHeight, {
          toValue: 200, // Max height for dropdown
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    } else {
      // Close dropdown with animation
      Animated.parallel([
        Animated.timing(dropdownHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false
        })
      ]).start();
    }
  }, [showGoalList]);
  
  // Debugging: Log projectData when it changes
  useEffect(() => {
    if (projectData) {
      console.log('ProjectData received in modal:', projectData);
      
      // Set selected goal from projectData when it's provided
      if (projectData.goalId) {
        console.log('Setting selected goal from projectData:', projectData.goalId, projectData.goalTitle);
        setSelectedGoalId(projectData.goalId);
        setSelectedGoalTitle(projectData.goalTitle || '');
        
        // Find the goal in the goals array to get its color
        const selectedGoal = goals.find(g => g.id === projectData.goalId);
        if (selectedGoal) {
          setSelectedGoalColor(selectedGoal.color);
        }
        
        // Clear validation error if goal is set
        setValidationErrors(prev => ({...prev, goalRequired: false}));
      }
    }
  }, [projectData, goals]);
  
  // Update form when editing an existing project
  useEffect(() => {
    if (visible && projectData) {
      setTitle(projectData.title || '');
      setDescription(projectData.description || '');
      setTasks(projectData.tasks ? [...projectData.tasks] : []);
      
      // Set selected goal from projectData
      if (projectData.goalId) {
        setSelectedGoalId(projectData.goalId);
        setSelectedGoalTitle(projectData.goalTitle || '');
        
        // Find the goal in the goals array to get its color
        const selectedGoal = goals.find(g => g.id === projectData.goalId);
        if (selectedGoal) {
          setSelectedGoalColor(selectedGoal.color);
        }
        
        // Clear validation error if goal is set
        setValidationErrors(prev => ({...prev, goalRequired: false}));
      }
      
      // Always set hasDueDate to false regardless of projectData
      setHasDueDate(false);
      
      // Still initialize the dueDate for when/if user toggles it on
      if (projectData.dueDate) {
        setDueDate(new Date(projectData.dueDate));
      } else {
        // Set default due date to 1 month from now
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 1);
        setDueDate(defaultDate);
      }
    } else if (!visible) {
      // Reset form when closing
      setTitle('');
      setDescription('');
      setTasks([]);
      setNewTaskTitle('');
      setShowGoalList(false);
      setValidationErrors({goalRequired: false});
      setHasDueDate(false);
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      setDueDate(defaultDate);
      // Don't reset goal selection here to preserve it between sessions
    }
  }, [projectData, visible, goals]);
  
  // Handle add project
  const handleAddProject = () => {
    // Validate form
    const errors = {
      goalRequired: !selectedGoalId
    };
    
    setValidationErrors(errors);
    
    // Check if there are any validation errors
    if (errors.goalRequired) {
      Alert.alert(
        "Goal Required", 
        "Please select a goal for this project.",
        [{ text: "OK" }]
      );
      return;
    }
    
    if (!title.trim()) {
      Alert.alert(
        "Title Required", 
        "Please enter a title for this project.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Create the updated project data with the selected goal
    const updatedProjectData = {
      ...projectData,
      title: title.trim(),
      description: description.trim(),
      tasks: tasks,
      goalId: selectedGoalId,
      goalTitle: selectedGoalTitle,
      color: selectedGoalColor, // Add the goal's color to the project data
      dueDate: hasDueDate ? dueDate.toISOString() : null,
    };
    
    // Log the project data being sent back to verify goal association
    console.log('Creating project with data:', updatedProjectData);
    
    // Call parent handler (passing back the updated project data)
    onAdd(updatedProjectData);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTasks([]);
    setNewTaskTitle('');
    setHasDueDate(false);
    // Don't reset goal selection
  };
  
  // Handle selecting a goal directly
  const handleSelectGoal = (goal) => {
    console.log('Goal selected:', goal.id, goal.title);
    setSelectedGoalId(goal.id);
    setSelectedGoalTitle(goal.title);
    setSelectedGoalColor(goal.color); // Store the goal's color
    setShowGoalList(false);
    
    // Clear validation error when goal is selected
    setValidationErrors(prev => ({...prev, goalRequired: false}));
  };
  
  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };
  
  // Add a new task
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newTaskTitle.trim(),
      status: 'todo',
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };
  
  // Update a task
  const handleUpdateTask = (id, newTitle) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, title: newTitle } : task
    ));
  };
  
  // Remove a task
  const handleRemoveTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  // Dismiss keyboard when clicking outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setShowGoalList(false);
  };
  
  // Get theme-aware button color, prioritizing the selected goal's color
  const buttonColor = selectedGoalColor || color || theme.primary;
  
  // Render a task item
  const renderTaskItem = (item, index) => (
    <View 
      key={item.id || index} 
      style={[
        styles.taskItem, 
        { marginBottom: spacing.s }
      ]}
      accessible={true}
      accessibilityLabel={`Task ${index + 1}: ${item.title}`}
    >
      <View style={styles.taskCheckbox}>
        <Ionicons 
          name="checkmark-circle-outline" 
          size={scaleWidth(22)} 
          color={buttonColor} 
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        />
      </View>
      <TextInput
        style={[
          styles.taskInput, 
          { 
            backgroundColor: theme.inputBackground,
            color: theme.text,
            borderColor: theme.border,
            fontSize: fontSizes.m,
            padding: spacing.s,
            borderRadius: 8,
            flex: 1,
          }
        ]}
        value={item.title}
        onChangeText={(text) => handleUpdateTask(item.id, text)}
        placeholder="Task title"
        placeholderTextColor={theme.textSecondary}
        maxFontSizeMultiplier={1.3}
        accessible={true}
        accessibilityLabel={`Task ${index + 1} title`}
        accessibilityHint="Edit task title"
      />
      <TouchableOpacity 
        style={[
          styles.removeButton,
          { 
            padding: spacing.xs,
            minWidth: 44,
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center'
          }
        ]}
        onPress={() => handleRemoveTask(item.id)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Remove task ${item.title}`}
        accessibilityHint="Removes this task from the project"
      >
        <Ionicons name="close-circle" size={scaleWidth(22)} color={theme.error || 'red'} />
      </TouchableOpacity>
    </View>
  );
  
  // Render goal dropdown list with direct rendering (no FlatList)
  const renderGoalsList = () => {
    if (goals.length === 0) {
      return (
        <View style={[
          styles.noGoalsContainer,
          { padding: spacing.l }
        ]}>
          <Text 
            style={[
              styles.noGoalsText, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.m,
                textAlign: 'center',
              }
            ]}
            maxFontSizeMultiplier={1.3}
            accessible={true}
          >
            No goals available. Create a goal first.
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.goalItemsContainer}>
        {goals.map((item, index) => {
          if (!item || !item.id) return null;
          
          return (
            <React.Fragment key={item.id}>
              {index > 0 && (
                <View 
                  style={[
                    styles.goalItemSeparator, 
                    { 
                      backgroundColor: theme.border,
                      height: 1,
                      marginVertical: spacing.xs,
                    }
                  ]} 
                />
              )}
              <TouchableOpacity 
                style={[
                  styles.goalItem, 
                  { 
                    backgroundColor: item.id === selectedGoalId ? theme.primary + '33' : theme.cardElevated,
                    borderLeftColor: item.color || buttonColor,
                    borderLeftWidth: 4,
                    padding: spacing.m,
                    borderRadius: 6,
                    marginVertical: spacing.xxs,
                  }
                ]}
                onPress={() => handleSelectGoal(item)}
                accessible={true}
                accessibilityRole="radio"
                accessibilityLabel={`Goal: ${item.title || 'Untitled Goal'}${item.domain ? `, Domain: ${item.domain}` : ''}`}
                accessibilityState={{ checked: item.id === selectedGoalId }}
                accessibilityHint="Select this goal for your project"
              >
                <Text 
                  style={[
                    styles.goalItemTitle, 
                    { 
                      color: item.id === selectedGoalId ? theme.primary : theme.text,
                      fontWeight: item.id === selectedGoalId ? 'bold' : 'normal',
                      fontSize: fontSizes.m,
                      marginBottom: item.domain ? spacing.xxs : 0,
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  {item.title || 'Untitled Goal'}
                </Text>
                {item.domain && (
                  <Text 
                    style={[
                      styles.goalItemDomain, 
                      { 
                        color: theme.textSecondary,
                        fontSize: fontSizes.s,
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {item.domain}
                  </Text>
                )}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel="Create project modal"
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <View style={[
            styles.modalContent, 
            { 
              backgroundColor: theme.card,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: spacing.m,
              paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.m,
            }
          ]}>
            <View style={styles.modalHeader}>
              <Text 
                style={[
                  styles.modalTitle, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.l,
                    fontWeight: 'bold',
                  }
                ]}
                maxFontSizeMultiplier={1.3}
                accessible={true}
                accessibilityRole="header"
              >
                Create Project
              </Text>
              <TouchableOpacity 
                style={[
                  styles.closeButton,
                  {
                    padding: spacing.s,
                    minWidth: 44,
                    minHeight: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                ]} 
                onPress={onClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                accessibilityHint="Discards project and closes this screen"
              >
                <Ionicons name="close" size={scaleWidth(24)} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.formContainer}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {/* Goal Selection Section - ANIMATED */}
              <Text 
                style={[
                  styles.label, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.m,
                    marginBottom: spacing.xs,
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Associated Goal *
              </Text>
              
              {/* Goal Selector Button */}
              <TouchableOpacity
                style={[
                  styles.goalSelector,
                  { 
                    backgroundColor: theme.inputBackground,
                    borderColor: validationErrors.goalRequired ? (theme.error || 'red') : theme.border,
                    borderBottomLeftRadius: showGoalList ? 0 : 8,
                    borderBottomRightRadius: showGoalList ? 0 : 8,
                    borderWidth: 1,
                    padding: spacing.m,
                    minHeight: 48,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }
                ]}
                onPress={() => {
                  console.log('Goal selector pressed, toggling dropdown');
                  
                  if (goals.length === 0) {
                    Alert.alert(
                      "No Goals Available", 
                      "You need to create at least one goal before creating a project.",
                      [
                        { text: "OK" },
                        { 
                          text: "Create Goal", 
                          onPress: () => {
                            onClose();
                            setTimeout(() => {
                              try {
                                const navigation = global.navigation || window.navigation;
                                if (navigation && typeof navigation.navigate === 'function') {
                                  navigation.navigate('GoalDetails', { mode: 'create' });
                                } else {
                                  Alert.alert(
                                    "Create a Goal", 
                                    "Please create a goal first from the Goals tab.",
                                    [{ text: "OK" }]
                                  );
                                }
                              } catch (error) {
                                console.error('Navigation error:', error);
                                Alert.alert(
                                  "Create a Goal", 
                                  "Please create a goal first from the Goals tab.",
                                  [{ text: "OK" }]
                                );
                              }
                            }, 300);
                          }
                        }
                      ]
                    );
                  } else {
                    setShowGoalList(!showGoalList);
                  }
                }}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={selectedGoalId ? `Selected goal: ${selectedGoalTitle}` : "Select a goal"}
                accessibilityHint="Opens list of available goals"
                accessibilityState={{ expanded: showGoalList }}
              >
                {selectedGoalId ? (
                  <View style={styles.selectedGoalContainer}>
                    <Text 
                      style={[
                        styles.selectedGoalText, 
                        { 
                          color: theme.text,
                          fontSize: fontSizes.m,
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {selectedGoalTitle}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.selectGoalPrompt}>
                    <Ionicons 
                      name="flag-outline" 
                      size={scaleWidth(20)} 
                      color={theme.textSecondary} 
                      style={{ marginRight: spacing.xs }}
                    />
                    <Text 
                      style={[
                        styles.selectGoalText, 
                        { 
                          color: validationErrors.goalRequired ? (theme.error || 'red') : theme.textSecondary,
                          fontSize: fontSizes.m,
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {goals.length > 0 
                        ? "Select a goal for this project (required)" 
                        : "No goals available - create a goal first"}
                    </Text>
                  </View>
                )}
                <Ionicons 
                  name={showGoalList ? "chevron-up" : "chevron-down"} 
                  size={scaleWidth(20)} 
                  color={theme.textSecondary} 
                  style={styles.goalSelectorIcon}
                />
              </TouchableOpacity>
              
              {/* ANIMATED: Inline Goal List Dropdown */}
              <Animated.View 
                style={[
                  styles.inlineGoalList, 
                  { 
                    backgroundColor: theme.cardElevated,
                    borderColor: theme.border,
                    maxHeight: dropdownHeight,
                    opacity: dropdownOpacity,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderTopWidth: 0,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    marginBottom: spacing.m,
                  }
                ]}
                accessible={showGoalList}
                accessibilityLabel="Goal options"
                accessibilityRole="radiogroup"
              >
                {renderGoalsList()}
              </Animated.View>
              
              {validationErrors.goalRequired && (
                <Text 
                  style={[
                    styles.errorText, 
                    { 
                      color: theme.error || 'red',
                      fontSize: fontSizes.s,
                      marginBottom: spacing.m,
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                  accessible={true}
                  accessibilityRole="alert"
                >
                  Goal selection is required
                </Text>
              )}
              
              <Text 
                style={[
                  styles.label, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.m,
                    marginBottom: spacing.xs,
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Project Title *
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
                    fontSize: fontSizes.m,
                    marginBottom: spacing.m,
                  }
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter project title"
                placeholderTextColor={theme.textSecondary}
                autoFocus={false}
                maxFontSizeMultiplier={1.3}
                accessible={true}
                accessibilityLabel="Project title"
                accessibilityHint="Enter a title for your project"
              />
              
              <Text 
                style={[
                  styles.label, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.m,
                    marginBottom: spacing.xs,
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
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
                    fontSize: fontSizes.m,
                    marginBottom: spacing.m,
                    minHeight: scaleHeight(100),
                    textAlignVertical: "top",
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter project description"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxFontSizeMultiplier={1.3}
                accessible={true}
                accessibilityLabel="Project description"
                accessibilityHint="Enter an optional description for your project"
              />
              
              {/* Due Date Toggle */}
              <View 
                style={[
                  styles.toggleRow,
                  {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: spacing.m,
                    paddingVertical: spacing.s,
                  }
                ]}
              >
                <Text 
                  style={[
                    styles.label, 
                    { 
                      color: theme.textSecondary,
                      fontSize: fontSizes.m,
                      marginBottom: 0,
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Set Due Date
                </Text>
                <Switch
                  value={hasDueDate}
                  onValueChange={setHasDueDate}
                  trackColor={{ false: theme.border, true: buttonColor + '80' }}
                  thumbColor={hasDueDate ? buttonColor : '#f4f3f4'}
                  accessible={true}
                  accessibilityRole="switch"
                  accessibilityLabel="Set due date"
                  accessibilityState={{ checked: hasDueDate }}
                  accessibilityHint={hasDueDate ? "Disable due date" : "Enable due date"}
                />
              </View>
              
              {/* Date Picker Section */}
              {hasDueDate && (
                <View 
                  style={[
                    styles.dateSection,
                    { marginBottom: spacing.m }
                  ]}
                  accessible={true}
                  accessibilityLabel="Due date selection"
                >
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      { 
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.border,
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: spacing.m,
                        paddingVertical: spacing.s,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.s,
                      }
                    ]}
                    onPress={() => setShowDatePicker(true)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Due date: ${dueDate.toLocaleDateString()}`}
                    accessibilityHint="Opens date picker to select due date"
                  >
                    <Ionicons name="calendar-outline" size={scaleWidth(20)} color={theme.textSecondary} />
                    <Text 
                      style={[
                        styles.dateButtonText, 
                        { 
                          color: theme.text,
                          fontSize: fontSizes.m,
                          flex: 1,
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {dueDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  
                  {showDatePicker && (
                    <DateTimePicker
                      value={dueDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                      themeVariant={theme.background === '#000000' ? 'dark' : 'light'}
                    />
                  )}
                </View>
              )}
              
              {/* Project info section for other data */}
              {projectData && projectData.domain && (
                <View 
                  style={[
                    styles.infoItem,
                    { marginBottom: spacing.m }
                  ]}
                  accessible={true}
                  accessibilityLabel={`Domain: ${projectData.domain}`}
                >
                  <Text 
                    style={[
                      styles.infoLabel, 
                      { 
                        color: theme.textSecondary,
                        fontSize: fontSizes.m,
                        marginBottom: spacing.xxs,
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Domain
                  </Text>
                  <Text 
                    style={[
                      styles.infoValue, 
                      { 
                        color: theme.text,
                        fontSize: fontSizes.m,
                        fontWeight: '500',
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {projectData.domain}
                  </Text>
                </View>
              )}
              
              {/* Tasks section */}
              <View 
                style={[
                  styles.taskSection,
                  {
                    marginTop: spacing.s,
                    marginBottom: spacing.m,
                  }
                ]}
              >
                <Text 
                  style={[
                    styles.sectionTitle, 
                    { 
                      color: theme.text,
                      fontSize: fontSizes.l,
                      fontWeight: '600',
                      marginBottom: spacing.m,
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                  accessible={true}
                  accessibilityRole="header"
                >
                  Tasks ({tasks.length})
                </Text>
                
                {/* Fix: Manually render tasks instead of using FlatList */}
                <View style={styles.taskList}>
                  {tasks.map((item, index) => renderTaskItem(item, index))}
                </View>
                
                {/* Add new task input */}
                <View 
                  style={[
                    styles.addTaskContainer,
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: spacing.m,
                    }
                  ]}
                >
                  <View style={styles.taskCheckbox}>
                    <Ionicons 
                      name="add-circle-outline" 
                      size={scaleWidth(22)} 
                      color={buttonColor} 
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.taskInput, 
                      { 
                        backgroundColor: theme.inputBackground,
                        color: theme.text,
                        borderColor: theme.border,
                        fontSize: fontSizes.m,
                        padding: spacing.s,
                        borderRadius: 8,
                        flex: 1,
                        borderWidth: 1,
                      }
                    ]}
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    placeholder="Add a new task"
                    placeholderTextColor={theme.textSecondary}
                    onSubmitEditing={handleAddTask}
                    returnKeyType="done"
                    maxFontSizeMultiplier={1.3}
                    accessible={true}
                    accessibilityLabel="New task title"
                    accessibilityHint="Enter title and press enter to add a new task"
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.addButton, 
                  { 
                    backgroundColor: goals.length === 0 ? theme.textSecondary : buttonColor,
                    opacity: goals.length === 0 ? 0.7 : 1,
                    borderRadius: 8,
                    paddingVertical: spacing.m,
                    alignItems: 'center',
                    marginTop: spacing.s,
                    marginBottom: spacing.m,
                  }
                ]}
                onPress={handleAddProject}
                disabled={goals.length === 0}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Create project"
                accessibilityHint="Creates the project with current information"
                accessibilityState={{ disabled: goals.length === 0 }}
              >
                <Text 
                  style={[
                    styles.addButtonText,
                    {
                      color: '#fff',
                      fontSize: fontSizes.m,
                      fontWeight: '600',
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  {goals.length === 0 ? 'Create a Goal First' : 'Create Project'}
                </Text>
              </TouchableOpacity>

              {goals.length === 0 && (
                <TouchableOpacity 
                  style={[
                    styles.createGoalButton, 
                    { 
                      backgroundColor: theme.primary,
                      paddingVertical: spacing.m,
                      borderRadius: 8,
                      alignItems: 'center',
                      marginBottom: spacing.m,
                    }
                  ]}
                  onPress={() => {
                    // Close this modal
                    onClose();
                    // Use setTimeout to ensure modals are closed before navigation
                    setTimeout(() => {
                      try {
                        // Try different navigation options
                        if (appContext.navigation && typeof appContext.navigation.navigate === 'function') {
                          appContext.navigation.navigate('GoalDetails', { mode: 'create' });
                        } else {
                          // Try global navigation
                          const globalNav = global.navigation || window.navigation;
                          if (globalNav && typeof globalNav.navigate === 'function') {
                            globalNav.navigate('GoalDetails', { mode: 'create' });
                          } else if (global.ReactNativeNavigation) {
                            global.ReactNativeNavigation.push('GoalDetails', { mode: 'create' });
                          } else {
                            Alert.alert(
                              "Create a Goal", 
                              "Please create a goal first from the Goals tab.",
                              [{ text: "OK" }]
                            );
                          }
                        }
                      } catch (error) {
                        console.error('Navigation error:', error);
                        Alert.alert(
                          "Create a Goal", 
                          "Please create a goal first from the Goals tab.",
                          [{ text: "OK" }]
                        );
                      }
                    }, 300);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Go to create goal"
                  accessibilityHint="Navigates to the goal creation screen"
                >
                  <Text 
                    style={[
                      styles.createGoalButtonText,
                      {
                        color: '#fff',
                        fontSize: fontSizes.m,
                        fontWeight: '600',
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Go to Create Goal
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m
  },
  formContainer: {
    marginBottom: Platform.OS === 'ios' ? 0 : spacing.m
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCheckbox: {
    width: scaleWidth(30),
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectGoalPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  selectedGoalContainer: {
    flex: 1
  },
  goalItemsContainer: {
    padding: spacing.s,
    maxHeight: scaleHeight(200),
  },
});

export default AddProjectModal;