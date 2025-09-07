// src/components/AddMilestoneModal.js
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
  TouchableWithoutFeedback,
  Easing
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize, 
  fontSizes, 
  spacing, 
  accessibility,
  meetsContrastRequirements 
} from '../utils/responsive';

// Import color utils for better color handling
import { getTextColorForBackground } from '../screens/GoalDetailsScreen/utils/colorUtils';
import { formatDate } from '../screens/GoalDetailsScreen/utils/helpers';
import TextInputModal from './TextInputModal';

const AddMilestoneModal = ({ 
  visible, 
  onClose, 
  onAdd, 
  milestoneData,
  color
}) => {
  const { theme } = useTheme();
  const appContext = useAppContext();
  const insets = useSafeAreaInsets();
  
  // Create tab navigator
  const Tab = createMaterialTopTabNavigator();
  
  // Get screen dimensions
  const { width } = Dimensions.get('window');
  
  // Milestone state
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
  
  // Popup modal state
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [currentEditingTask, setCurrentEditingTask] = useState(null);
  
  // Selected goal and UI state
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedGoalTitle, setSelectedGoalTitle] = useState('');
  const [selectedGoalColor, setSelectedGoalColor] = useState(null);
  const [showGoalList, setShowGoalList] = useState(false);
  
  // Animation values - Enhanced to match GoalModal
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Add validation state - goalRequired removed for flexible hierarchy
  const [validationErrors, setValidationErrors] = useState({
    // goalRequired: false // Removed - goals are now optional for milestones
  });
  
  // Direct access to goals from AppContext
  const goals = appContext?.goals || [];
  
  // Handle modal close with enhanced animation
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
    const screenHeight = Dimensions.get('window').height;
    const dismissThreshold = screenHeight * 0.2;
    const fastSwipeVelocity = 1200;
    
    const shouldDismiss = translationY > dismissThreshold || velocityY > fastSwipeVelocity;
    
    if (shouldDismiss) {
      // Animate dismiss with reverse order
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
        onClose();
      });
    } else {
      // Bounce back with better spring animation
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8
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
  
  // Modal animation on show/hide - Enhanced with better easing
  useEffect(() => {
    if (visible) {
      // Reset animation values
      backgroundOpacityAnim.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
      translateY.setValue(0);
      
      // Animate in with staggered timing for better effect
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

  // Update form when editing an existing milestone
  useEffect(() => {
    if (visible && milestoneData) {
      setTitle(milestoneData.title || '');
      setDescription(milestoneData.description || '');
      setTasks(milestoneData.tasks ? [...milestoneData.tasks] : []);
      
      if (milestoneData.goalId) {
        setSelectedGoalId(milestoneData.goalId);
        setSelectedGoalTitle(milestoneData.goalTitle || '');
        
        const selectedGoal = goals.find(g => g.id === milestoneData.goalId);
        if (selectedGoal) {
          setSelectedGoalColor(selectedGoal.color);
        }
        
        // Goal validation removed for flexible hierarchy
      }
      
      setHasDueDate(false);
      
      if (milestoneData.dueDate) {
        setDueDate(new Date(milestoneData.dueDate));
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
      setValidationErrors({});
      setHasDueDate(false);
      setEditMode(false);
      setEditingTaskId(null);
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      setDueDate(defaultDate);
      
      // Reset animation values
      translateY.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
      backgroundOpacityAnim.setValue(0);
    }
  }, [milestoneData, visible, goals]);
  
  // Handle add milestone - Updated for flexible hierarchy
  const handleAddMilestone = () => {
    const errors = {};
    
    setValidationErrors(errors);
    
    // Goal validation removed - milestones can be standalone
    
    if (!title.trim()) {
      Alert.alert(
        "Title Required", 
        "Please enter a title for this milestone.",
        [{ text: "OK" }]
      );
      return;
    }
    
    const updatedMilestoneData = {
      ...milestoneData,
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      color: selectedGoalColor || '#4CAF50',
      dueDate: hasDueDate ? dueDate.toISOString() : null,
      progress: 0,
      goalId: selectedGoalId,
      goalTitle: selectedGoalTitle,
      icon: 'diamond', // Match overview screen
      isMilestone: true, // Match overview screen
      tasks: tasks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onAdd(updatedMilestoneData);
    
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
    // Goal validation removed for flexible hierarchy
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
          <TouchableOpacity
            style={[
              styles.taskInput, 
              { 
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                fontSize: fontSizes.m,
                padding: spacing.s,
                borderRadius: 8,
                flex: 1,
                borderWidth: 1,
                justifyContent: 'center',
                minHeight: scaleHeight(36),
              }
            ]}
            onPress={() => {
              setCurrentEditingTask(item);
              setEditingTaskTitle(item.title);
              setShowEditTaskModal(true);
            }}
          >
            <Text
              style={[
                {
                  fontSize: fontSizes.m,
                  color: theme.text,
                }
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
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

  // Render Details Tab Content - Enhanced with card-based design
  const renderDetailsTab = () => {
    return (
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.background || '#000000' }}
        contentContainerStyle={{ 
          paddingHorizontal: spacing.m,
          paddingTop: spacing.s,
          paddingBottom: spacing.xl,
          flexGrow: 1
        }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEnabled={true}
        bounces={true}
      >
        {/* Milestone Title Card */}
        <View style={[
          styles.inputSection,
          {
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
          <Text 
            style={[
              styles.label, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.m,
                fontWeight: '600',
                marginBottom: spacing.xs
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Milestone Title * (Tap below to test)
            {/* Test Button */}
            <TouchableOpacity 
              onPress={() => console.log('🔥 TEST BUTTON WORKS!')}
              style={{backgroundColor: 'red', padding: 10, marginVertical: 5}}
            >
              <Text style={{color: 'white'}}>TEST TOUCH</Text>
            </TouchableOpacity>
          </Text>
          <View
            style={[
              styles.input,
              { 
                backgroundColor: theme.inputBackground,
                borderColor: selectedGoalColor || theme.border,
                borderWidth: 1,
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.s,
                borderRadius: scaleWidth(12),
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
                justifyContent: 'center',
                minHeight: scaleHeight(44),
              }
            ]}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                console.log('🔍 Title field pressed, opening modal');
                setShowTitleModal(true);
              }}
              onPressIn={() => console.log('🔍 Title field touch started')}
              onPressOut={() => console.log('🔍 Title field touch ended')}
              accessible={true}
              accessibilityLabel="Milestone title input"
              accessibilityHint="Tap to enter the title of your milestone"
              accessibilityRole="button"
            >
              <View style={{ width: '100%', height: '100%', justifyContent: 'center' }}>
                <Text
                  style={[
                    {
                      fontSize: fontSizes.m,
                      color: title ? theme.text : theme.textSecondary,
                    }
                  ]}
                  maxFontSizeMultiplier={1.8}
                >
                  {title || "Enter milestone title"}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>

        {/* Goal Selection Card - Enhanced design */}
        <View style={[
          styles.inputSection,
          {
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
          <Text 
            style={[
              styles.label, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.m,
                fontWeight: '600',
                marginBottom: spacing.xs
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Link to Goal (Optional)
          </Text>
          
          {/* Goal Selector Button */}
          <TouchableOpacity
            style={[
              styles.goalSelector,
              { 
                backgroundColor: theme.inputBackground,
                borderColor: selectedGoalColor || theme.border,
                borderBottomLeftRadius: showGoalList ? 0 : scaleWidth(12),
                borderBottomRightRadius: showGoalList ? 0 : scaleWidth(12),
                borderTopLeftRadius: scaleWidth(12),
                borderTopRightRadius: scaleWidth(12),
                borderWidth: 1,
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.s,
                minHeight: 48,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }
            ]}
            onPress={() => {
              setShowGoalList(!showGoalList);
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={selectedGoalId ? `Selected goal: ${selectedGoalTitle}` : "Select a goal"}
            accessibilityHint="Opens goal selector"
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
                  color: theme.textSecondary,
                  fontSize: fontSizes.m,
                }}
              >
                {goals.length > 0 
                  ? "Select a goal to link this milestone (optional)" 
                  : "No goals available to link"}
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
                borderColor: selectedGoalColor || theme.border,
                maxHeight: dropdownHeight,
                opacity: dropdownOpacity,
                overflow: 'hidden',
                borderWidth: 1,
                borderTopWidth: 0,
                borderBottomLeftRadius: scaleWidth(12),
                borderBottomRightRadius: scaleWidth(12),
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }
            ]}
          >
            <View style={{ maxHeight: scaleHeight(180) }}>
              {renderGoalsList()}
            </View>
          </Animated.View>
        </View>
        
        {/* Description Card */}
        <View style={[
          styles.inputSection,
          {
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
          <Text 
            style={[
              styles.label, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.m,
                fontWeight: '600',
                marginBottom: spacing.xs
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Description (Optional)
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.textArea,
              { 
                backgroundColor: theme.inputBackground,
                borderColor: selectedGoalColor || theme.border,
                borderWidth: 1,
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.s,
                borderRadius: scaleWidth(12),
                minHeight: scaleHeight(100),
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
              }
            ]}
            onPress={() => {
              console.log('🔍 Description field pressed, opening modal');
              setShowDescriptionModal(true);
            }}
            accessible={true}
            accessibilityLabel="Milestone description input"
            accessibilityHint="Tap to enter a detailed description of your milestone"
          >
            <Text
              style={[
                {
                  fontSize: fontSizes.m,
                  color: description ? theme.text : theme.textSecondary,
                  lineHeight: 20,
                }
              ]}
              maxFontSizeMultiplier={2.0}
              numberOfLines={4}
            >
              {description || "Enter milestone description"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Due Date Toggle Card */}
        <View style={[
          styles.inputSection,
          {
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
          <View 
            style={[
              styles.toggleRow,
              {
                paddingVertical: 0,
                minHeight: minTouchSize
              }
            ]}
          >
            <Text 
              style={[
                styles.label, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.m,
                  fontWeight: '600',
                  marginBottom: 0
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              Set Due Date
            </Text>
            <Switch
              value={hasDueDate}
              onValueChange={(value) => {
                setHasDueDate(value);
                if (value) {
                  setShowDatePicker(true);
                } else {
                  setShowDatePicker(false);
                }
              }}
              trackColor={{ 
                false: theme.border, 
                true: selectedGoalColor ? selectedGoalColor + '80' : buttonColor + '80' 
              }}
              thumbColor={hasDueDate ? 
                (selectedGoalColor || buttonColor) : 
                '#f4f3f4'
              }
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="Set due date"
              accessibilityState={{ checked: hasDueDate }}
              accessibilityHint={hasDueDate ? "Toggle off to remove due date" : "Toggle on to set a due date"}
            />
          </View>
        </View>
        
        {/* Date Picker Section - Enhanced */}
        {hasDueDate && (
          <View style={[
            styles.dateSection,
            styles.inputSection,
            {
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
            <Text 
              style={[
                styles.label, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.m,
                  fontWeight: '600',
                  marginBottom: spacing.s
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              Due Date
            </Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
                { 
                  backgroundColor: theme.inputBackground,
                  borderColor: selectedGoalColor || theme.border,
                  borderWidth: 1,
                  paddingHorizontal: spacing.m,
                  paddingVertical: spacing.s,
                  borderRadius: scaleWidth(12),
                  minHeight: minTouchSize,
                  flexDirection: 'row',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }
              ]}
              onPress={() => setShowDatePicker(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Selected date: ${formatDate(dueDate)}`}
              accessibilityHint="Opens date picker to select a due date"
            >
              <Ionicons name="calendar-outline" size={scaleWidth(20)} color={theme.textSecondary} />
              <Text 
                style={[
                  styles.dateButtonText,
                  { 
                    color: theme.text,
                    fontSize: fontSizes.m,
                    marginLeft: spacing.s
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                {formatDate(dueDate)}
              </Text>
            </TouchableOpacity>
            
            {/* Date Picker */}
            {showDatePicker && (
              <View style={[
                styles.datePickerContainer,
                { 
                  backgroundColor: theme.dark ? '#000000' : '#111111',
                  borderColor: theme.border,
                  borderWidth: 1,
                  marginTop: spacing.s,
                  borderRadius: scaleWidth(12),
                  overflow: 'hidden',
                  alignItems: 'center',
                }
              ]}>
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  themeVariant="dark"
                  accessibilityLabel="Date picker"
                  style={{ height: 200 }}
                  textColor="#FFFFFF"
                />
                
                {/* Done button for iOS */}
                {Platform.OS === 'ios' && (
                  <TouchableOpacity 
                    style={[
                      styles.doneButton, 
                      { 
                        backgroundColor: selectedGoalColor || buttonColor,
                        paddingVertical: spacing.m,
                        width: '100%',
                        alignItems: 'center',
                      }
                    ]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={[
                      styles.doneButtonText, 
                      { 
                        color: selectedGoalColor === '#FFFFFF' || buttonColor === '#FFFFFF' ? 
                          '#000000' : getTextColorForBackground(selectedGoalColor || buttonColor),
                        fontSize: fontSizes.m,
                        fontWeight: '600',
                      }
                    ]}>
                      Done
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  // Render Tasks Tab Content - Enhanced with better styling
  const renderTasksTab = () => {
    return (
      <ScrollView 
        style={{ flex: 1, backgroundColor: theme.background || '#000000' }}
        contentContainerStyle={{ 
          paddingHorizontal: spacing.m,
          paddingTop: spacing.s,
          paddingBottom: spacing.xl,
          flexGrow: 1
        }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
                backgroundColor: editMode ? (selectedGoalColor || theme.primary) : theme.backgroundSecondary,
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.s,
                borderRadius: scaleWidth(20),
                minHeight: 36,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: editMode ? 0.2 : 0.1,
                shadowRadius: 4,
                elevation: editMode ? 4 : 2,
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
            backgroundColor: theme.card,
            borderRadius: scaleWidth(12),
            marginBottom: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
            shadowRadius: 6,
            elevation: 3,
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
          <TouchableOpacity
            style={[
              styles.taskInput, 
              { 
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                fontSize: fontSizes.m,
                padding: spacing.s,
                borderRadius: scaleWidth(8),
                flex: 1,
                borderWidth: 1,
                justifyContent: 'center',
                minHeight: scaleHeight(44),
              }
            ]}
            onPress={() => {
              console.log('🔍 Task field pressed, opening modal');
              setShowTaskModal(true);
            }}
          >
            <Text
              style={[
                {
                  fontSize: fontSizes.m,
                  color: newTaskTitle ? theme.text : theme.textSecondary,
                }
              ]}
            >
              {newTaskTitle || "Add a new task"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };
  
  return (
    <>
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
          shouldCancelWhenOutside={true}
          activeOffsetY={[-10, 10]}
          failOffsetX={[-5, 5]}
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
                  height: scaleHeight(550), // Fixed height - simple approach
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -8 },
                  shadowOpacity: theme.background === '#000000' ? 0.4 : 0.15,
                  shadowRadius: 16,
                  elevation: 12
                }
              ]}>
                {/* Enhanced swipe indicator with dynamic color */}
                <View style={[
                  styles.swipeIndicator,
                  { 
                    backgroundColor: selectedGoalColor ? 
                      selectedGoalColor + '60' : 
                      theme.textSecondary + '40',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                  }
                ]} />
          <View style={[styles.modalHeader, { marginBottom: spacing.xs }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[
                styles.headerIconContainer,
                {
                  backgroundColor: selectedGoalColor ? 
                    selectedGoalColor + '20' : 
                    theme.primary + '20',
                  borderRadius: scaleWidth(12),
                  padding: spacing.xs,
                  marginRight: spacing.s,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }
              ]}>
                <Ionicons 
                  name="diamond" 
                  size={scaleWidth(24)} 
                  color={selectedGoalColor || theme.primary} 
                />
              </View>
              <Text 
                style={[
                  styles.modalTitle, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.xl,
                    fontWeight: '700'
                  }
                ]}
                maxFontSizeMultiplier={1.5}
                accessible={true}
                accessibilityRole="header"
              >
                Create Milestone
              </Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.closeButton,
                {
                  minWidth: minTouchSize,
                  minHeight: minTouchSize,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.inputBackground,
                  borderRadius: scaleWidth(8),
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
              accessibilityHint="Discards milestone and closes this screen"
            >
              <Ionicons name="close" size={scaleWidth(24)} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {/* React Navigation Tab Navigator for swipeable tabs */}
          <View style={{
            height: scaleHeight(320), // Even smaller to guarantee button space
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
                    borderRadius: scaleWidth(12),
                    marginHorizontal: 0,
                    marginVertical: 0,
                    height: scaleHeight(48),
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
                    shadowRadius: 4,
                    borderBottomWidth: 0,
                  },
                  tabBarLabelStyle: {
                    fontSize: fontSizes.m,
                    fontWeight: '600',
                    textTransform: 'none',
                    marginTop: 0,
                  },
                  tabBarIndicatorStyle: { 
                    backgroundColor: selectedGoalColor || theme.primary || '#4CAF50',
                    height: scaleHeight(38),
                    borderRadius: scaleWidth(8),
                    marginBottom: 5,
                    marginTop: 5,
                    marginHorizontal: 4,
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
          
          {/* Enhanced Create Milestone Button with gradient */}
          <TouchableOpacity 
            style={[
              styles.addButton, 
              { 
                borderRadius: scaleWidth(12),
                marginTop: spacing.s,
                marginBottom: spacing.xs,
                minHeight: minTouchSize,
                overflow: 'hidden',
                shadowColor: selectedGoalColor || '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }
            ]}
            onPress={handleAddMilestone}
            disabled={false}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Create milestone"
            accessibilityHint="Creates the milestone with current information"
          >
            <LinearGradient
              colors={selectedGoalColor ? [
                selectedGoalColor,
                selectedGoalColor + 'DD'
              ] : [buttonColor, buttonColor + 'DD']}
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
              <Text 
                style={[
                  styles.addButtonText,
                  {
                    fontSize: fontSizes.m,
                    fontWeight: '600',
                    color: '#FFFFFF'
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                {milestoneData ? 'Update Milestone' : 'Create Milestone'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Optional: Show helpful message if no goals exist */}
          {goals.length === 0 && (
            <View style={{
              backgroundColor: theme.card,
              padding: spacing.m,
              borderRadius: scaleWidth(12),
              marginTop: spacing.s,
              marginBottom: spacing.m,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
              shadowRadius: 6,
              elevation: 3,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                  name="information-circle" 
                  size={scaleWidth(20)} 
                  color={theme.primary} 
                  style={{ marginRight: spacing.s }}
                />
                <Text style={{
                  color: theme.textSecondary,
                  fontSize: fontSizes.s,
                  flex: 1,
                }}>
                  Tip: You can create standalone milestones or link them to goals for better organization.
                </Text>
              </View>
            </View>
          )}
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </Modal>

    {/* Text Input Modals - Rendered outside main modal for proper layering */}
    <TextInputModal
      visible={showTitleModal}
      onClose={() => setShowTitleModal(false)}
      onSave={setTitle}
      title="Milestone Title"
      placeholder="Enter milestone title"
      value={title}
      maxLength={100}
      autoCapitalize="words"
      primaryColor={buttonColor}
    />

    <TextInputModal
      visible={showDescriptionModal}
      onClose={() => setShowDescriptionModal(false)}
      onSave={setDescription}
      title="Milestone Description"
      placeholder="Enter milestone description"
      value={description}
      multiline={true}
      maxLength={500}
      autoCapitalize="sentences"
      primaryColor={buttonColor}
    />

    <TextInputModal
      visible={showTaskModal}
      onClose={() => setShowTaskModal(false)}
      onSave={(value) => {
        setNewTaskTitle(value);
        if (value.trim()) {
          // Auto-add the task when user saves with content
          const newTask = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: value.trim(),
            status: 'todo',
            completed: false,
            createdAt: new Date().toISOString()
          };
          setTasks(prevTasks => [...prevTasks, newTask]);
          setNewTaskTitle(''); // Clear after adding
        }
      }}
      title="Add Task"
      placeholder="Enter task description"
      value={newTaskTitle}
      maxLength={200}
      autoCapitalize="sentences"
      primaryColor={buttonColor}
    />

    <TextInputModal
      visible={showEditTaskModal}
      onClose={() => {
        setShowEditTaskModal(false);
        setCurrentEditingTask(null);
        setEditingTaskTitle('');
      }}
      onSave={(value) => {
        if (currentEditingTask && value.trim()) {
          handleUpdateTask(currentEditingTask.id, value.trim());
          setEditingTaskId(null);
        }
        setShowEditTaskModal(false);
        setCurrentEditingTask(null);
        setEditingTaskTitle('');
      }}
      title="Edit Task"
      placeholder="Enter task description"
      value={editingTaskTitle}
      maxLength={200}
      autoCapitalize="sentences"
      primaryColor={buttonColor}
    />
  </>
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
    fontWeight: '700'
  },
  headerIconContainer: {
    // Styles applied inline
  },
  closeButton: {
    padding: spacing.xxs
  },
  
  // Form Elements
  inputSection: {
    // Enhanced styling applied inline
  },
  label: {
    marginBottom: spacing.s
  },
  input: {
    marginBottom: spacing.m
  },
  textArea: {
    paddingTop: spacing.s
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  dateSection: {
    marginBottom: spacing.m
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  dateButtonText: {
    flex: 1
  },
  datePickerContainer: {
    marginTop: spacing.s,
    borderRadius: scaleWidth(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
  },
  doneButton: {
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    fontWeight: '600',
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

export default AddMilestoneModal;