// src/components/AddMilestoneModalRevamped.js
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
  Switch,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility,
  meetsContrastRequirements
} from '../utils/responsive';

// Import color utils
import { getTextColorForBackground } from '../screens/GoalDetailsScreen/utils/colorUtils';
import { formatDate } from '../utils/helpers';

const AddMilestoneModalRevamped = ({ 
  visible, 
  onClose, 
  onAdd, 
  milestoneData,
  projectData, // Support both naming conventions
  color
}) => {
  const { theme } = useTheme();
  const appContext = useAppContext();
  const insets = useSafeAreaInsets();
  
  // Merge milestoneData and projectData for compatibility
  const initialData = milestoneData || projectData || null;
  
  // Modal animation values
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Milestone state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState(Platform.OS === 'ios' ? 'spinner' : 'default');
  
  // Goal selection state
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedGoalTitle, setSelectedGoalTitle] = useState('');
  const [selectedGoalColor, setSelectedGoalColor] = useState(null);
  const [showGoalList, setShowGoalList] = useState(false);
  
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);
  
  // Animation values for dropdown
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  
  // Direct access to goals from AppContext
  const goals = appContext?.goals || [];
  
  // Calculate minimum touch target size
  const minTouchSize = Math.max(scaleWidth(44), accessibility.minTouchTarget);
  
  // Get theme-aware button color
  const buttonColor = selectedGoalColor || color || theme.primary;
  
  // Handle modal animation
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
  
  // Main form initialization - runs when modal opens/closes or data changes
  useEffect(() => {
    if (visible && initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setTasks(initialData.tasks ? [...initialData.tasks] : []);
      
      if (initialData.goalId) {
        setSelectedGoalId(initialData.goalId);
        setSelectedGoalTitle(initialData.goalTitle || '');
      }
      
      setHasDueDate(initialData.dueDate ? true : false);
      
      if (initialData.dueDate) {
        setDueDate(new Date(initialData.dueDate));
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
      setHasDueDate(false);
      setShowTaskInput(false);
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 1);
      setDueDate(defaultDate);
      setSelectedGoalId(null);
      setSelectedGoalTitle('');
      setSelectedGoalColor(null);
    }
  }, [initialData, visible]);

  // Goal color lookup - only runs when goalId changes or goals are loaded
  useEffect(() => {
    if (initialData?.goalId && goals.length > 0) {
      const selectedGoal = goals.find(g => g.id === initialData.goalId);
      if (selectedGoal) {
        setSelectedGoalColor(selectedGoal.color);
      }
    }
  }, [initialData?.goalId, goals.length]);
  
  // Handle add milestone
  const handleAddMilestone = () => {
    if (!title.trim()) {
      return; // Don't add empty milestones
    }
    
    const milestoneToAdd = {
      ...initialData,
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      color: selectedGoalColor || color || '#4CAF50',
      dueDate: hasDueDate ? dueDate.toISOString() : null,
      progress: 0,
      goalId: selectedGoalId,
      goalTitle: selectedGoalTitle,
      icon: 'diamond',
      isMilestone: true,
      tasks: tasks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onAdd(milestoneToAdd);
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
  
  // Handle selecting a goal
  const handleSelectGoal = (goal) => {
    setSelectedGoalId(goal.id);
    setSelectedGoalTitle(goal.title);
    setSelectedGoalColor(goal.color);
    setShowGoalList(false);
  };
  
  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep showing on iOS, auto-close on Android
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };
  
  // Toggle date picker mode
  const toggleDatePickerMode = () => {
    if (Platform.OS === 'ios') {
      setDatePickerMode(datePickerMode === 'spinner' ? 'inline' : 'spinner');
    } else {
      setDatePickerMode(datePickerMode === 'default' ? 'calendar' : 'default');
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
    setShowTaskInput(false);
  };
  
  // Remove a task
  const handleRemoveTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
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
            No goals available. Milestones can be standalone.
          </Text>
        </View>
      );
    }
    
    return (
      <ScrollView style={{ maxHeight: scaleHeight(180) }}>
        {goals.map((item, index) => {
          if (!item || !item.id) return null;
          
          return (
            <TouchableOpacity 
              key={item.id}
              style={{
                backgroundColor: item.id === selectedGoalId ? theme.primary + '20' : 'transparent',
                borderLeftColor: item.color || buttonColor,
                borderLeftWidth: 4,
                padding: spacing.m,
                marginVertical: spacing.xxs,
              }}
              onPress={() => handleSelectGoal(item)}
            >
              <Text 
                style={{ 
                  color: item.id === selectedGoalId ? theme.primary : theme.text,
                  fontWeight: item.id === selectedGoalId ? '600' : 'normal',
                  fontSize: fontSizes.m,
                }}
              >
                {item.title || 'Untitled Goal'}
              </Text>
              {item.domain && (
                <Text 
                  style={{ 
                    color: theme.textSecondary,
                    fontSize: fontSizes.s,
                    marginTop: spacing.xxs,
                  }}
                >
                  {item.domain}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      accessibilityViewIsModal={true}
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
                  paddingBottom: Math.max(insets.bottom, spacing.m),
                  borderTopLeftRadius: scaleWidth(16),
                  borderTopRightRadius: scaleWidth(16),
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -8 },
                  shadowOpacity: theme.background === '#000000' ? 0.4 : 0.15,
                  shadowRadius: 16,
                  elevation: 12,
                }
              ]}>
                {/* Swipe indicator */}
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
                
                {/* Header */}
                <View style={styles.modalHeader}>
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
                    accessibilityHint="Dismisses the milestone creation form"
                  >
                    <Ionicons name="close" size={scaleWidth(24)} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  style={styles.formContainer}
                  contentContainerStyle={{ paddingBottom: spacing.l }}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
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
                      Milestone Title *
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        { 
                          backgroundColor: theme.inputBackground,
                          color: theme.text,
                          borderColor: selectedGoalColor || theme.border,
                          borderWidth: 1,
                          fontSize: fontSizes.m,
                          paddingHorizontal: spacing.m,
                          paddingVertical: spacing.s,
                          borderRadius: scaleWidth(12),
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 1,
                        }
                      ]}
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Enter milestone title"
                      placeholderTextColor={theme.textSecondary}
                      autoFocus={false}
                      accessible={true}
                      accessibilityLabel="Milestone title"
                      accessibilityHint="Enter the title of your milestone"
                      maxFontSizeMultiplier={1.8}
                    />
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
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        { 
                          backgroundColor: theme.inputBackground,
                          color: theme.text,
                          borderColor: selectedGoalColor || theme.border,
                          borderWidth: 1,
                          fontSize: fontSizes.m,
                          paddingHorizontal: spacing.m,
                          paddingVertical: spacing.s,
                          borderRadius: scaleWidth(12),
                          minHeight: scaleHeight(100),
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 1,
                        }
                      ]}
                      value={description}
                      onChangeText={setDescription}
                      placeholder="Enter milestone description"
                      placeholderTextColor={theme.textSecondary}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      accessible={true}
                      accessibilityLabel="Milestone description"
                      accessibilityHint="Enter a detailed description of your milestone"
                      maxFontSizeMultiplier={2.0}
                    />
                  </View>
                  
                  {/* Goal Selection Card */}
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
                      onPress={() => setShowGoalList(!showGoalList)}
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
                            Select a goal (optional)
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
                      {renderGoalsList()}
                    </Animated.View>
                  </View>
                  
                  {/* Tasks Card */}
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.s }}>
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
                        Tasks ({tasks.length})
                      </Text>
                      {!showTaskInput && (
                        <TouchableOpacity
                          onPress={() => setShowTaskInput(true)}
                          style={{
                            backgroundColor: theme.primary + '20',
                            paddingHorizontal: spacing.m,
                            paddingVertical: spacing.xs,
                            borderRadius: scaleWidth(20),
                          }}
                        >
                          <Text style={{ color: theme.primary, fontSize: fontSizes.s, fontWeight: '600' }}>
                            Add Task
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    {/* Task List */}
                    {tasks.map((task, index) => (
                      <View 
                        key={typeof task === 'string' ? index : (task.id || index)} 
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: theme.inputBackground,
                          borderRadius: scaleWidth(8),
                          padding: spacing.s,
                          marginBottom: spacing.xs,
                        }}
                      >
                        <Ionicons 
                          name="checkmark-circle-outline" 
                          size={scaleWidth(20)} 
                          color={buttonColor} 
                          style={{ marginRight: spacing.s }}
                        />
                        <Text style={{ flex: 1, color: theme.text, fontSize: fontSizes.m }}>
                          {typeof task === 'string' ? task : (task.title || 'Untitled Task')}
                        </Text>
                        <TouchableOpacity onPress={() => handleRemoveTask(typeof task === 'string' ? task : (task.id || task))}>
                          <Ionicons name="close-circle" size={scaleWidth(20)} color={theme.error || 'red'} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    
                    {/* Add Task Input */}
                    {showTaskInput && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.s }}>
                        <TextInput
                          style={[
                            styles.input,
                            { 
                              flex: 1,
                              backgroundColor: theme.inputBackground,
                              color: theme.text,
                              borderColor: theme.border,
                              borderWidth: 1,
                              fontSize: fontSizes.m,
                              paddingHorizontal: spacing.m,
                              paddingVertical: spacing.s,
                              borderRadius: scaleWidth(8),
                              marginRight: spacing.s,
                            }
                          ]}
                          value={newTaskTitle}
                          onChangeText={setNewTaskTitle}
                          placeholder="Task title"
                          placeholderTextColor={theme.textSecondary}
                          autoFocus={true}
                          onSubmitEditing={handleAddTask}
                          returnKeyType="done"
                        />
                        <TouchableOpacity 
                          onPress={handleAddTask}
                          style={{
                            backgroundColor: theme.primary,
                            padding: spacing.s,
                            borderRadius: scaleWidth(8),
                          }}
                        >
                          <Ionicons name="add" size={scaleWidth(24)} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => {
                            setShowTaskInput(false);
                            setNewTaskTitle('');
                          }}
                          style={{
                            padding: spacing.s,
                          }}
                        >
                          <Ionicons name="close" size={scaleWidth(24)} color={theme.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    )}
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
                  
                  {/* Date Picker Section */}
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
                      
                      {/* Date Picker Mode Selector */}
                      {showDatePicker && (
                        <View style={styles.datePickerModeContainer}>
                          <TouchableOpacity 
                            style={[
                              styles.datePickerModeButton,
                              datePickerMode === (Platform.OS === 'ios' ? 'spinner' : 'default') && {
                                backgroundColor: buttonColor + '20',
                                borderColor: buttonColor
                              }
                            ]}
                            onPress={() => toggleDatePickerMode()}
                          >
                            <Ionicons 
                              name="options-outline" 
                              size={scaleWidth(16)} 
                              color={datePickerMode === (Platform.OS === 'ios' ? 'spinner' : 'default') ? buttonColor : theme.textSecondary} 
                            />
                            <Text style={[
                              styles.datePickerModeText,
                              { 
                                color: datePickerMode === (Platform.OS === 'ios' ? 'spinner' : 'default') ? buttonColor : theme.textSecondary
                              }
                            ]}>
                              Wheel
                            </Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={[
                              styles.datePickerModeButton,
                              datePickerMode === (Platform.OS === 'ios' ? 'inline' : 'calendar') && {
                                backgroundColor: buttonColor + '20',
                                borderColor: buttonColor
                              }
                            ]}
                            onPress={() => toggleDatePickerMode()}
                          >
                            <Ionicons 
                              name="calendar-outline" 
                              size={scaleWidth(16)} 
                              color={datePickerMode === (Platform.OS === 'ios' ? 'inline' : 'calendar') ? buttonColor : theme.textSecondary} 
                            />
                            <Text style={[
                              styles.datePickerModeText,
                              { 
                                color: datePickerMode === (Platform.OS === 'ios' ? 'inline' : 'calendar') ? buttonColor : theme.textSecondary
                              }
                            ]}>
                              Calendar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      
                      {/* Date Picker */}
                      {showDatePicker && (
                        <View style={[
                          styles.datePickerContainer,
                          { 
                            backgroundColor: theme.dark ? '#000000' : '#111111',
                            borderColor: theme.border,
                            borderWidth: 1
                          }
                        ]}>
                          <DateTimePicker
                            value={dueDate}
                            mode="date"
                            display={datePickerMode}
                            onChange={handleDateChange}
                            minimumDate={new Date()}
                            themeVariant="dark"
                            accessibilityLabel="Date picker"
                            style={{ height: datePickerMode === 'inline' ? 300 : 200 }}
                            textColor="#FFFFFF"
                          />
                          
                          {/* Done button for iOS */}
                          {Platform.OS === 'ios' && (
                            <TouchableOpacity 
                              style={[
                                styles.doneButton, 
                                { 
                                  backgroundColor: buttonColor,
                                  paddingVertical: spacing.m
                                }
                              ]}
                              onPress={() => setShowDatePicker(false)}
                            >
                              <Text style={[
                                styles.doneButtonText, 
                                { 
                                  color: buttonColor === '#FFFFFF' ? '#000000' : getTextColorForBackground(buttonColor),
                                  fontSize: fontSizes.m
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
                  
                  {/* Create Button */}
                  <TouchableOpacity
                    style={[
                      styles.addButton, 
                      { 
                        borderRadius: scaleWidth(12),
                        marginTop: spacing.l,
                        marginBottom: spacing.l,
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
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={initialData ? "Update Milestone" : "Create Milestone"}
                    accessibilityHint={initialData ? "Updates the milestone with your changes" : "Creates a new milestone with your information"}
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
                        {initialData ? 'Update Milestone' : 'Create Milestone'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
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
    padding: spacing.m,
    maxHeight: '90%'
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
  formContainer: {
    marginBottom: Platform.OS === 'ios' ? 0 : spacing.m
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
  
  // Goal Selection
  goalSelector: {
    // Styles defined inline for better theme integration
  },
  inlineGoalList: {
    // Styles defined inline for better theme integration
  },
  
  // Date Section
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
  datePickerModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.s,
    marginBottom: spacing.s,
  },
  datePickerModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(20),
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  datePickerModeText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
    marginLeft: spacing.xs,
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
  
  // Create Button
  addButton: {
    alignItems: 'center',
    marginBottom: spacing.m
  },
  addButtonText: {
    fontWeight: '600'
  }
});

export default AddMilestoneModalRevamped;