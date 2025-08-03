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
  Keyboard,
  ScrollView,
  Alert,
  Animated,
  Switch,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { scaleWidth, scaleHeight, fontSizes, spacing, accessibility } from '../utils/responsive';

const AddProjectModal = ({ 
  visible, 
  onClose, 
  onAdd, 
  projectData,
  color
}) => {
  const { theme } = useTheme();
  const appContext = useAppContext();
  const insets = useSafeAreaInsets();
  
  // Create tab navigator
  const Tab = createMaterialTopTabNavigator();
  
  // Get screen dimensions
  const { width } = Dimensions.get('window');
  
  // Project state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  // Selected goal and UI state
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedGoalTitle, setSelectedGoalTitle] = useState('');
  const [selectedGoalColor, setSelectedGoalColor] = useState(null);
  const [showGoalList, setShowGoalList] = useState(false);
  
  // Animation values
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    goalRequired: false
  });
  
  // Direct access to goals from AppContext
  const goals = appContext?.goals || [];
  
  // Handle modal close with proper cleanup
  const handleClose = () => {
    Animated.sequence([
      // First slide out the content
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
      }),
      // Then fade out the background
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      Keyboard.dismiss();
      setShowGoalList(false);
      onClose();
    });
  };

  // Gesture handlers for pan gesture
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const handleGestureEnd = (event) => {
    const { translationY, velocityY } = event.nativeEvent;
    
    if (translationY > 100 || velocityY > 1000) {
      handleClose();
    } else {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };
  
  // Calculate minimum touch target size
  const minTouchSize = Math.max(scaleWidth(44), accessibility.minTouchTarget);
  
  // Animate dropdown opening/closing
  useEffect(() => {
    if (showGoalList) {
      Animated.parallel([
        Animated.timing(dropdownHeight, {
          toValue: 200,
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
  
  // Modal animation on show/hide
  useEffect(() => {
    if (visible) {
      // Reset animation values
      backgroundOpacityAnim.setValue(0);
      slideAnim.setValue(300);
      translateY.setValue(0);
      
      // Animate in with staggered timing
      Animated.sequence([
        // First darken the background gradually
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        // Then slide in the content
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  // Update form when editing an existing project
  useEffect(() => {
    if (visible && projectData) {
      setTitle(projectData.title || '');
      setDescription(projectData.description || '');
      setTasks(projectData.tasks ? [...projectData.tasks] : []);
      
      if (projectData.goalId) {
        setSelectedGoalId(projectData.goalId);
        setSelectedGoalTitle(projectData.goalTitle || '');
        
        const selectedGoal = goals.find(g => g.id === projectData.goalId);
        if (selectedGoal) {
          setSelectedGoalColor(selectedGoal.color);
        }
        
        setValidationErrors(prev => ({...prev, goalRequired: false}));
      }
      
      setHasDueDate(false);
      
      if (projectData.dueDate) {
        setDueDate(new Date(projectData.dueDate));
      } else {
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
      setEditMode(false);
      setEditingTaskId(null);
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      setDueDate(defaultDate);
      
      // Reset animation values
      translateY.setValue(0);
      slideAnim.setValue(300);
      backgroundOpacityAnim.setValue(0);
    }
  }, [projectData, visible, goals]);
  
  // Handle add project
  const handleAddProject = () => {
    const errors = {
      goalRequired: !selectedGoalId
    };
    
    setValidationErrors(errors);
    
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
    
    const updatedProjectData = {
      ...projectData,
      title: title.trim(),
      description: description.trim(),
      tasks: tasks,
      goalId: selectedGoalId,
      goalTitle: selectedGoalTitle,
      color: selectedGoalColor,
      dueDate: hasDueDate ? dueDate.toISOString() : null,
    };
    
    onAdd(updatedProjectData);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTasks([]);
    setNewTaskTitle('');
    setHasDueDate(false);
    setEditMode(false);
    setEditingTaskId(null);
  };
  
  // Handle selecting a goal directly
  const handleSelectGoal = (goal) => {
    setSelectedGoalId(goal.id);
    setSelectedGoalTitle(goal.title);
    setSelectedGoalColor(goal.color);
    setShowGoalList(false);
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

  // Get theme-aware button color
  const buttonColor = selectedGoalColor || color || theme.primary;

  // Render a task item with edit mode support
  const renderTaskItem = (item, index) => {
    const isEditing = editMode && editingTaskId === item.id;
    
    return (
      <View 
        key={item.id || index} 
        style={[
          styles.taskItem, 
          { 
            marginBottom: spacing.s,
            backgroundColor: isEditing ? theme.primary + '10' : 'transparent',
            borderRadius: 8,
            padding: isEditing ? spacing.xs : 0,
          }
        ]}
      >
        <View style={styles.taskCheckbox}>
          <Ionicons 
            name="checkmark-circle-outline" 
            size={scaleWidth(22)} 
            color={buttonColor} 
          />
        </View>
        
        {isEditing ? (
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
            value={item.title}
            onChangeText={(text) => handleUpdateTask(item.id, text)}
            placeholder="Task title"
            placeholderTextColor={theme.textSecondary}
            autoFocus={true}
            onBlur={() => {
              setEditingTaskId(null);
              // Don't exit edit mode automatically - only when Done is pressed
            }}
            onSubmitEditing={() => {
              setEditingTaskId(null);
              // Don't exit edit mode automatically - only when Done is pressed
            }}
          />
        ) : editMode ? (
          <TouchableOpacity 
            style={[
              styles.taskTextContainer,
              { 
                flex: 1,
                paddingHorizontal: spacing.s,
                paddingVertical: spacing.s,
                minHeight: scaleHeight(40), // Minimum height for single line
                justifyContent: 'center',
                backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light green tint to show it's clickable
                borderRadius: 6,
              }
            ]}
            onPress={() => {
              setEditingTaskId(item.id);
            }}
          >
            <Text 
              style={[
                styles.taskText,
                {
                  color: theme.text,
                  fontSize: fontSizes.m,
                  flexWrap: 'wrap',
                  lineHeight: fontSizes.m * 1.3, // Better line spacing
                }
              ]}
              // Remove numberOfLines to allow dynamic expansion
            >
              {item.title || 'Untitled task'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View 
            style={[
              styles.taskTextContainer,
              { 
                flex: 1,
                paddingHorizontal: spacing.s,
                paddingVertical: spacing.s,
                minHeight: scaleHeight(40), // Minimum height for single line
                justifyContent: 'center',
              }
            ]}
          >
            <Text 
              style={[
                styles.taskText,
                {
                  color: theme.text,
                  fontSize: fontSizes.m,
                  flexWrap: 'wrap',
                  lineHeight: fontSizes.m * 1.3, // Better line spacing
                }
              ]}
              // Remove numberOfLines to allow dynamic expansion
            >
              {item.title || 'Untitled task'}
            </Text>
          </View>
        )}
        
        {editMode && (
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
          >
            <Ionicons name="close-circle" size={scaleWidth(22)} color={theme.error || 'red'} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render goal dropdown list
  const renderGoalsList = () => {
    if (goals.length === 0) {
      return (
        <View style={{ padding: spacing.l }}>
          <Text 
            style={{ 
              color: theme.textSecondary,
              fontSize: fontSizes.m,
              textAlign: 'center',
            }}
          >
            No goals available. Create a goal first.
          </Text>
        </View>
      );
    }
    
    return (
      <View style={{ padding: spacing.s }}>
        {goals.map((item, index) => {
          if (!item || !item.id) return null;
          
          return (
            <React.Fragment key={item.id}>
              {index > 0 && (
                <View 
                  style={{ 
                    backgroundColor: theme.border,
                    height: 1,
                    marginVertical: spacing.xs,
                  }} 
                />
              )}
              <TouchableOpacity 
                style={{
                  backgroundColor: item.id === selectedGoalId ? theme.primary + '33' : theme.cardElevated,
                  borderLeftColor: item.color || buttonColor,
                  borderLeftWidth: 4,
                  padding: spacing.m,
                  borderRadius: 6,
                  marginVertical: spacing.xxs,
                }}
                onPress={() => handleSelectGoal(item)}
              >
                <Text 
                  style={{ 
                    color: item.id === selectedGoalId ? theme.primary : theme.text,
                    fontWeight: item.id === selectedGoalId ? 'bold' : 'normal',
                    fontSize: fontSizes.m,
                    marginBottom: item.domain ? spacing.xxs : 0,
                  }}
                >
                  {item.title || 'Untitled Goal'}
                </Text>
                {item.domain && (
                  <Text 
                    style={{ 
                      color: theme.textSecondary,
                      fontSize: fontSizes.s,
                    }}
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

  // Render Details Tab Content
  const renderDetailsTab = () => {
    return (
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.background || '#000000' }}
        contentContainerStyle={{ 
          paddingHorizontal: spacing.m,
          paddingTop: spacing.s,
          paddingBottom: spacing.l
        }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        scrollEnabled={true}
        bounces={true}
      >
        {/* Goal Selection Section */}
        <Text 
          style={[
            styles.label, 
            { 
              color: theme.textSecondary,
              fontSize: fontSizes.m,
              marginBottom: spacing.xs,
            }
          ]}
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
            if (goals.length === 0) {
              Alert.alert(
                "No Goals Available", 
                "You need to create at least one goal before creating a project.",
                [{ text: "OK" }]
              );
            } else {
              setShowGoalList(!showGoalList);
            }
          }}
        >
          {selectedGoalId ? (
            <View style={{ flex: 1 }}>
              <Text 
                style={{ 
                  color: theme.text,
                  fontSize: fontSizes.m,
                }}
              >
                {selectedGoalTitle}
              </Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons 
                name="flag-outline" 
                size={scaleWidth(20)} 
                color={theme.textSecondary} 
                style={{ marginRight: spacing.xs }}
              />
              <Text 
                style={{ 
                  color: validationErrors.goalRequired ? (theme.error || 'red') : theme.textSecondary,
                  fontSize: fontSizes.m,
                }}
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
          />
        </TouchableOpacity>
        
        {/* Animated Goal List Dropdown */}
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
        >
          <View style={{ maxHeight: scaleHeight(180) }}>
            {renderGoalsList()}
          </View>
        </Animated.View>
        
        {validationErrors.goalRequired && (
          <Text 
            style={{ 
              color: theme.error || 'red',
              fontSize: fontSizes.s,
              marginBottom: spacing.m,
            }}
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
        />
        
        {/* Due Date Toggle */}
        <View 
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.m,
            paddingVertical: spacing.s,
          }}
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
          >
            Set Due Date
          </Text>
          <Switch
            value={hasDueDate}
            onValueChange={setHasDueDate}
            trackColor={{ false: theme.border, true: buttonColor + '80' }}
            thumbColor={hasDueDate ? buttonColor : '#f4f3f4'}
          />
        </View>
        
        {/* Date Picker Section */}
        {hasDueDate && (
          <View style={{ marginBottom: spacing.m }}>
            <TouchableOpacity
              style={{
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.s,
                minHeight: scaleHeight(40), // Minimum height for single line
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.s,
              }}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={scaleWidth(20)} color={theme.textSecondary} />
              <Text 
                style={{ 
                  color: theme.text,
                  fontSize: fontSizes.m,
                  flex: 1,
                }}
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
      </ScrollView>
    );
  };

  // Render Tasks Tab Content
  const renderTasksTab = () => {
    return (
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.background || '#000000' }}
        contentContainerStyle={{ 
          paddingHorizontal: spacing.m,
          paddingTop: spacing.s,
          paddingBottom: spacing.l
        }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        scrollEnabled={true}
        bounces={true}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.m,
        }}>
          <Text 
            style={[
              styles.sectionTitle, 
              { 
                color: theme.text,
                fontSize: fontSizes.xl,
                fontWeight: '600',
                flex: 1,
              }
            ]}
          >
            Project Tasks
          </Text>
          
          {tasks.length > 0 && (
            <TouchableOpacity
              style={{
                backgroundColor: editMode ? theme.primary : theme.backgroundSecondary,
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.s,
                minHeight: scaleHeight(40), // Minimum height for single line
                borderRadius: scaleWidth(20),
                minHeight: 36,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                setEditMode(!editMode);
                setEditingTaskId(null);
              }}
            >
              <Text
                style={{
                  color: editMode ? '#FFFFFF' : theme.text,
                  fontSize: fontSizes.s,
                  fontWeight: '600',
                }}
              >
                {editMode ? 'Done' : 'Edit'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {tasks.length === 0 && (
          <View style={{
            padding: spacing.l,
            alignItems: 'center',
            backgroundColor: theme.backgroundSecondary,
            borderRadius: scaleWidth(8),
            marginBottom: spacing.m,
          }}>
            <Ionicons 
              name="checkbox-outline" 
              size={scaleWidth(48)} 
              color={theme.textSecondary} 
              style={{ marginBottom: spacing.s }}
            />
            <Text style={{
              color: theme.textSecondary,
              fontSize: fontSizes.m,
              textAlign: 'center',
            }}>
              No tasks yet. Add your first task below.
            </Text>
          </View>
        )}
        
        {/* Task list */}
        <View style={styles.taskList}>
          {tasks.map((item, index) => renderTaskItem(item, index))}
        </View>
        
        {/* Add new task input */}
        <View 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: spacing.m,
            marginBottom: spacing.m,
          }}
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
                borderRadius: scaleWidth(8),
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
            autoFocus={false}
            onFocus={() => {
              // Prevent auto-focus during tab switches
            }}
          />
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
      accessibilityLabel="Create project modal"
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: backgroundOpacityAnim
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
            <KeyboardAvoidingView 
              style={styles.keyboardContainer} 
              behavior={Platform.OS === 'ios' ? 'padding' : null}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
              <View style={[
                styles.modalContent, 
                { 
                  backgroundColor: theme.card,
                  borderTopLeftRadius: scaleWidth(16),
                  borderTopRightRadius: scaleWidth(16),
                  padding: spacing.m,
                  paddingBottom: Math.max(insets.bottom, spacing.m),
                  maxHeight: '95%', // Increased by half (0.5x)
                  minHeight: scaleHeight(625), // Increased minimum by half
                }
              ]}>
                {/* Swipe indicator */}
                <View style={[
                  styles.swipeIndicator,
                  { backgroundColor: theme.textSecondary + '40' }
                ]} />
          <View style={[styles.modalHeader, { marginBottom: spacing.xs }]}>
            <Text 
              style={[
                styles.modalTitle, 
                { 
                  color: theme.text,
                  fontSize: fontSizes.xl,
                  fontWeight: 'bold',
                }
              ]}
              maxFontSizeMultiplier={1.5}
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
                  minWidth: minTouchSize,
                  minHeight: minTouchSize,
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              ]} 
              onPress={handleClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              accessibilityHint="Discards project and closes this screen"
            >
              <Ionicons name="close" size={scaleWidth(24)} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {/* React Navigation Tab Navigator for swipeable tabs */}
          <View style={{
            height: scaleHeight(475), // Increased tab container by half
            marginBottom: spacing.s,
          }}>
            <NavigationContainer 
              independent={true}
              theme={{
                dark: theme.background === '#000000',
                colors: {
                  primary: theme.primary || '#4CAF50',
                  background: theme.background || '#000000',
                  card: theme.card || '#1F1F1F',
                  text: theme.text || '#FFFFFF',
                  border: theme.border || '#333333',
                  notification: theme.primary || '#4CAF50',
                },
              }}
            >
              <Tab.Navigator
                screenOptions={{
                  tabBarActiveTintColor: '#FFFFFF',
                  tabBarInactiveTintColor: theme.textSecondary || '#888888',
                  tabBarStyle: { 
                    backgroundColor: theme.backgroundSecondary || theme.cardElevated || '#1F1F1F',
                    borderRadius: scaleWidth(8),
                    marginHorizontal: 0,
                    marginVertical: 0,
                    height: scaleHeight(44),
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 0,
                  },
                  tabBarLabelStyle: {
                    fontSize: fontSizes.m,
                    fontWeight: '600',
                    textTransform: 'none',
                    marginTop: 0,
                  },
                  tabBarIndicatorStyle: { 
                    backgroundColor: theme.primary || '#4CAF50',
                    height: scaleHeight(36),
                    borderRadius: scaleWidth(6),
                    marginBottom: 4,
                    marginTop: 4,
                    zIndex: 1,
                  },
                  tabBarItemStyle: {
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 0,
                    margin: 0,
                  },
                  tabBarContentContainerStyle: {
                    backgroundColor: 'transparent',
                  },
                  swipeEnabled: true,
                  lazy: true, // Prevent premature rendering that can cause keyboard issues
                }}
              >
                <Tab.Screen 
                  name="ProjectDetails" 
                  options={{
                    tabBarLabel: 'Details',
                  }}
                >
                  {() => renderDetailsTab()}
                </Tab.Screen>
                
                <Tab.Screen 
                  name="ProjectTasks" 
                  options={{
                    tabBarLabel: `Tasks (${tasks.length})`,
                  }}
                >
                  {() => renderTasksTab()}
                </Tab.Screen>
              </Tab.Navigator>
            </NavigationContainer>
          </View>
          
          {/* Create Project Button - Always visible outside tabs */}
          <TouchableOpacity 
            style={[
              styles.addButton, 
              { 
                backgroundColor: goals.length === 0 ? theme.textSecondary : buttonColor,
                opacity: goals.length === 0 ? 0.7 : 1,
                borderRadius: scaleWidth(12),
                paddingVertical: spacing.m,
                alignItems: 'center',
                marginTop: spacing.s,
                marginBottom: spacing.xs,
                minHeight: minTouchSize,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
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
              maxFontSizeMultiplier={1.5}
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
                  borderRadius: scaleWidth(8),
                  alignItems: 'center',
                  marginBottom: spacing.m,
                  minHeight: minTouchSize,
                }
              ]}
              onPress={() => {
                handleClose();
                setTimeout(() => {
                  Alert.alert(
                    "Create a Goal", 
                    "Please create a goal first from the Goals tab.",
                    [{ text: "OK" }]
                  );
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
                maxFontSizeMultiplier={1.5}
              >
                Go to Create Goal
              </Text>
            </TouchableOpacity>
          )}
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </Modal>
  );
};

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
    // height defined inline for proper visibility
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m
  },
  modalTitle: {
    fontWeight: 'bold'
  },
  closeButton: {
    padding: spacing.xxs
  },
  
  // Form Elements
  label: {
    marginBottom: spacing.s
  },
  input: {
    borderWidth: 1,
    marginBottom: spacing.m
  },
  textArea: {
    paddingTop: spacing.s
  },
  
  // Goal Selection
  goalSelector: {
    // Styles defined inline for better theme integration
  },
  inlineGoalList: {
    // Styles defined inline for better theme integration
  },
  
  // Task Section
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCheckbox: {
    width: scaleWidth(30),
    alignItems: 'center',
    justifyContent: 'center'
  },
  taskInput: {
    // Styles defined inline for better theme integration
  },
  taskList: {
    // Container for task items
  },
  taskTextContainer: {
    // Styles defined inline for better theme integration
  },
  taskText: {
    // Styles defined inline for better theme integration
  },
  removeButton: {
    // Styles defined inline for better theme integration
  },
  
  // Buttons
  addButton: {
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: '600'
  },
  createGoalButton: {
    alignItems: 'center',
  },
  createGoalButtonText: {
    fontWeight: '600'
  },
  
  // Other
  sectionTitle: {
    // Styles defined inline
  },
});

export default AddProjectModal;