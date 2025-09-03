// src/components/AddTimeBlockModalRevamped.js
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
  Animated,
  Easing,
  Dimensions,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useTheme } from '../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppContext } from '../context/AppContext';
import { FREE_PLAN_LIMITS } from '../services/SubscriptionService';
import IconPicker from './IconPicker';
import FreeTierLimitModal from '../screens/TimeScreen/FreeTierLimitModal';
import { useNavigation } from '@react-navigation/native';

// Import responsive utilities
import responsive, { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize, 
  spacing, 
  fontSizes,
  isSmallDevice,
  isTablet,
  accessibility,
  useScreenDimensions,
  useIsLandscape,
  useSafeSpacing,
  ensureAccessibleTouchTarget
} from '../utils/responsive';

const AddTimeBlockModalRevamped = ({ 
  visible, 
  onClose, 
  onAdd, 
  timeBlockData,
  color
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const appContext = useAppContext();
  const { 
    userSubscriptionStatus,
    timeBlocks = [],
    checkTimeBlockConflicts,
    checkRecurringTimeBlockConflicts,
    addTimeBlock,
    addTimeBlockSkipConflicts
  } = appContext;
  const safeSpacing = useSafeSpacing();
  
  // Check if user is pro
  const isPro = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  
  // Tab state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'schedule', title: 'Schedule & Details' },
    { key: 'options', title: 'Advanced' },
  ]);
  
  // Main state
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  
  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  
  // Goal/Project/Task state
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedGoalTitle, setSelectedGoalTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
  
  // Icon selection state
  const [customIcon, setCustomIcon] = useState(null);
  const [customColor, setCustomColor] = useState('#6366f1');
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  // Conflict detection state
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictDetails, setConflictDetails] = useState('');
  const [conflictData, setConflictData] = useState(null);
  
  // Recurring timeblock state
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatFrequency, setRepeatFrequency] = useState('weekly');
  const [repeatUntil, setRepeatUntil] = useState(null);
  const [repeatIndefinitely, setRepeatIndefinitely] = useState(true);
  const [showRepeatUntilPicker, setShowRepeatUntilPicker] = useState(false);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  
  // Limit modal state
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  // Note: Using inline selection instead of modals for better functionality
  
  // Modal animation values
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const tabContentOpacity = useRef(new Animated.Value(1)).current;
  
  // Get available data from app context
  const goals = (appContext?.goals || []).filter(goal => !goal.completed);
  const projects = appContext?.projects || appContext?.milestones || [];
  const allTasks = appContext?.tasks || [];
  
  // Get filtered projects based on selected goal
  const filteredProjects = selectedGoalId 
    ? projects.filter(project => project.goalId === selectedGoalId)
    : [];
  
  // Get filtered tasks based on selected project
  let filteredTasks = [];
  if (selectedProjectId) {
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    if (selectedProject && Array.isArray(selectedProject.tasks)) {
      filteredTasks = selectedProject.tasks;
    } else {
      filteredTasks = allTasks.filter(task => task.projectId === selectedProjectId);
    }
  }
  
  // Get default start time (next hour)
  const getDefaultStartTime = () => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    date.setMinutes(0, 0, 0);
    return date;
  };
  
  // Get default end time (1 hour after start time)
  const getDefaultEndTime = (startTime) => {
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    return endTime;
  };
  
  // Calculate duration
  const calculateDuration = () => {
    const diff = endDate - startDate;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} min`;
    } else {
      return '0 min';
    }
  };
  
  // Quick duration buttons
  const setQuickDuration = (minutes) => {
    const newEndDate = new Date(startDate);
    newEndDate.setMinutes(newEndDate.getMinutes() + minutes);
    setEndDate(newEndDate);
  };
  
  // Handle modal animation
  useEffect(() => {
    if (visible) {
      backgroundOpacityAnim.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
      translateY.setValue(0);
      
      Animated.sequence([
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 250,
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
  
  // Initialize form with timeBlockData
  useEffect(() => {
    if (timeBlockData && visible) {
      setTitle(timeBlockData.title || '');
      setNotes(timeBlockData.notes || '');
      setLocation(timeBlockData.location || '');
      
      const startTime = timeBlockData.startTime ? new Date(timeBlockData.startTime) : getDefaultStartTime();
      const endTime = timeBlockData.endTime ? new Date(timeBlockData.endTime) : getDefaultEndTime(startTime);
      
      setStartDate(startTime);
      setEndDate(endTime);
      
      setSelectedGoalId(timeBlockData.goalId || null);
      setSelectedGoalTitle(timeBlockData.goalTitle || '');
      setSelectedProjectId(timeBlockData.projectId || null);
      setSelectedProjectTitle(timeBlockData.projectTitle || '');
      setSelectedTaskId(timeBlockData.taskId || null);
      setSelectedTaskTitle(timeBlockData.taskTitle || '');
      
      if (timeBlockData.customIcon) {
        setCustomIcon(timeBlockData.customIcon);
      }
      if (timeBlockData.customColor) {
        setCustomColor(timeBlockData.customColor);
      }
      
      setIsRepeating(timeBlockData.isRepeating || false);
      setRepeatFrequency(timeBlockData.repeatFrequency || 'weekly');
      setRepeatUntil(timeBlockData.repeatUntil ? new Date(timeBlockData.repeatUntil) : null);
      setRepeatIndefinitely(!timeBlockData.repeatUntil);
    } else if (!visible) {
      resetForm();
    }
  }, [timeBlockData, visible]);
  
  // Reset form
  const resetForm = () => {
    setTitle('');
    setNotes('');
    setLocation('');
    setStartDate(getDefaultStartTime());
    setEndDate(getDefaultEndTime(getDefaultStartTime()));
    setIsRepeating(false);
    setRepeatFrequency('weekly');
    setRepeatUntil(null);
    setRepeatIndefinitely(true);
    setSelectedGoalId(null);
    setSelectedGoalTitle('');
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
    setSelectedTaskId(null);
    setSelectedTaskTitle('');
    setCustomIcon(null);
    setCustomColor('#6366f1');
    setShowIconPicker(false);
    setConflictDetails('');
    setConflictData(null);
    setShowConflictModal(false);
    setIndex(0); // Reset to first tab
  };
  
  // Handle close with animation
  const handleClose = () => {
    const screenHeight = Dimensions.get('window').height;
    
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }),
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      })
    ]).start(() => {
      translateY.setValue(0);
      onClose();
    });
  };
  
  // Handle pan gesture for swipe to dismiss
  const handleGesture = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      if (nativeEvent.translationY > 0) {
        translateY.setValue(nativeEvent.translationY);
      }
    } else if (nativeEvent.state === State.END) {
      if (nativeEvent.translationY > 100 && nativeEvent.velocityY > 0) {
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: Dimensions.get('window').height,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          }),
          Animated.timing(backgroundOpacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          })
        ]).start(() => {
          translateY.setValue(0);
          onClose();
        });
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          tension: 150,
          friction: 8,
          useNativeDriver: true
        }).start();
      }
    }
  };
  
  // Check time block limits
  const checkTimeBlockLimits = () => {
    if (isPro) {
      return { canAdd: true };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBlocks = timeBlocks.filter(block => {
      const blockDate = new Date(block.startTime);
      blockDate.setHours(0, 0, 0, 0);
      return blockDate.getTime() === today.getTime();
    });
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 7);
    
    const weekBlocks = timeBlocks.filter(block => {
      const blockDate = new Date(block.startTime);
      return blockDate >= thisWeekStart && blockDate < thisWeekEnd;
    });
    
    if (todayBlocks.length >= FREE_PLAN_LIMITS.daily.timeBlocks) {
      return { canAdd: false, limitType: 'dailyLimit', current: todayBlocks.length, limit: FREE_PLAN_LIMITS.daily.timeBlocks };
    }
    
    if (weekBlocks.length >= FREE_PLAN_LIMITS.weekly.timeBlocks) {
      return { canAdd: false, limitType: 'weeklyLimit', current: weekBlocks.length, limit: FREE_PLAN_LIMITS.weekly.timeBlocks };
    }
    
    return { canAdd: true };
  };
  
  // Show limit alert
  const showTimeBlockLimitAlert = (limitCheck) => {
    setShowLimitModal(true);
  };
  
  // Handle add time block
  const handleAddTimeBlock = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a title for the time block');
      return;
    }
    
    if (!isPro) {
      const limitCheck = checkTimeBlockLimits();
      if (!limitCheck.canAdd) {
        showTimeBlockLimitAlert(limitCheck);
        return;
      }
    }
    
    const timeBlockData = {
      title: title.trim(),
      notes: notes.trim(),
      location: location.trim(),
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      ...(selectedGoalId && { goalId: selectedGoalId }),
      ...(selectedGoalTitle && { goalTitle: selectedGoalTitle }),
      ...(selectedProjectId && { projectId: selectedProjectId }),
      ...(selectedProjectTitle && { projectTitle: selectedProjectTitle }),
      ...(selectedTaskId && { taskId: selectedTaskId }),
      ...(selectedTaskTitle && { taskTitle: selectedTaskTitle }),
      ...(customIcon && { customIcon: customIcon }),
      ...(customColor && { customColor: customColor }),
      ...(!selectedGoalId && { isGeneralActivity: true }),
      isRepeating: isRepeating,
      repeatFrequency: isRepeating ? repeatFrequency : null,
      repeatUntil: isRepeating && !repeatIndefinitely ? repeatUntil?.toISOString() : null,
      seriesId: isRepeating ? `series_${Date.now()}` : null,
      createdAt: new Date().toISOString()
    };
    
    try {
      setIsSaving(true);
      await checkConflictsAndSave(timeBlockData);
    } catch (error) {
      console.error('Error adding time block:', error);
      Alert.alert('Error', 'Failed to add time block');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Check conflicts and save
  const checkConflictsAndSave = async (timeBlock) => {
    if (!checkTimeBlockConflicts || !checkRecurringTimeBlockConflicts) {
      await performSave(timeBlock);
      return;
    }
    
    const excludeIds = timeBlockData?.id ? [timeBlockData.id] : [];
    
    const conflictResult = timeBlock.isRepeating ? 
      checkRecurringTimeBlockConflicts(timeBlock, excludeIds, false, null) :
      { conflicts: checkTimeBlockConflicts(timeBlock, excludeIds), conflictingInstances: [] };
    
    if (conflictResult.conflicts.length > 0) {
      const conflictTitles = conflictResult.conflicts.map(c => c.title).join(', ');
      setConflictDetails(conflictTitles);
      setConflictData(conflictResult);
      setShowConflictModal(true);
    } else {
      await performSave(timeBlock);
    }
  };
  
  // Perform save
  const performSave = async (timeBlock) => {
    try {
      onAdd(timeBlock);
      resetForm();
      handleClose();
    } catch (error) {
      console.error('Error saving time block:', error);
      throw error;
    }
  };
  
  // Handle save bypassing conflicts
  const handleSaveBypassConflicts = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setShowConflictModal(false);
    
    try {
      const timeBlockToAdd = {
        title: title.trim(),
        notes: notes.trim(),
        location: location.trim(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        ...(selectedGoalId && { goalId: selectedGoalId }),
        ...(selectedGoalTitle && { goalTitle: selectedGoalTitle }),
        ...(selectedProjectId && { projectId: selectedProjectId }),
        ...(selectedProjectTitle && { projectTitle: selectedProjectTitle }),
        ...(selectedTaskId && { taskId: selectedTaskId }),
        ...(selectedTaskTitle && { taskTitle: selectedTaskTitle }),
        ...(customIcon && { customIcon: customIcon }),
        ...(customColor && { customColor: customColor }),
        ...(!selectedGoalId && { isGeneralActivity: true }),
        isRepeating: isRepeating,
        repeatFrequency: isRepeating ? repeatFrequency : null,
        repeatUntil: isRepeating && !repeatIndefinitely ? repeatUntil?.toISOString() : null,
        seriesId: isRepeating ? `series_${Date.now()}` : null,
        createdAt: new Date().toISOString()
      };
      
      await performSave(timeBlockToAdd);
    } catch (error) {
      console.error('Error saving time block (bypass conflicts):', error);
      Alert.alert('Error', 'Failed to add time block');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle save skipping conflicts
  const handleSaveSkipConflicts = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setShowConflictModal(false);
    
    try {
      const timeBlockToAdd = {
        title: title.trim(),
        notes: notes.trim(),
        location: location.trim(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        ...(selectedGoalId && { goalId: selectedGoalId }),
        ...(selectedGoalTitle && { goalTitle: selectedGoalTitle }),
        ...(selectedProjectId && { projectId: selectedProjectId }),
        ...(selectedProjectTitle && { projectTitle: selectedProjectTitle }),
        ...(selectedTaskId && { taskId: selectedTaskId }),
        ...(selectedTaskTitle && { taskTitle: selectedTaskTitle }),
        ...(customIcon && { customIcon: customIcon }),
        ...(customColor && { customColor: customColor }),
        ...(!selectedGoalId && { isGeneralActivity: true }),
        isRepeating: isRepeating,
        repeatFrequency: isRepeating ? repeatFrequency : null,
        repeatUntil: isRepeating && !repeatIndefinitely ? repeatUntil?.toISOString() : null,
        seriesId: isRepeating ? `series_${Date.now()}` : null,
        createdAt: new Date().toISOString()
      };
      
      if (addTimeBlockSkipConflicts) {
        const result = await addTimeBlockSkipConflicts(timeBlockToAdd, [], false, null);
        
        if (result && result.createdInstances > 0) {
          const skipped = result.totalInstances - result.createdInstances;
          Alert.alert('Success', `Created ${result.createdInstances} time blocks${skipped > 0 ? `, skipped ${skipped} conflicts` : ''}`);
          handleClose();
        }
      } else {
        await performSave(timeBlockToAdd);
      }
    } catch (error) {
      console.error('Error saving time block (skip conflicts):', error);
      Alert.alert('Error', 'Failed to add time block');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle date changes
  const handleStartDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      const newStartDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes()
      );
      setStartDate(newStartDate);
      
      // Adjust end date if needed
      if (endDate <= newStartDate) {
        setEndDate(getDefaultEndTime(newStartDate));
      }
    }
  };
  
  const handleStartTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    }
    if (selectedTime) {
      const newStartDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      setStartDate(newStartDate);
      
      // Adjust end time if needed
      if (endDate <= newStartDate) {
        setEndDate(getDefaultEndTime(newStartDate));
      }
    }
  };
  
  const handleEndTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    }
    if (selectedTime) {
      const newEndDate = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );
      
      // Ensure end time is after start time
      if (newEndDate > startDate) {
        setEndDate(newEndDate);
      } else {
        Alert.alert('Invalid Time', 'End time must be after start time');
      }
    }
  };
  
  const handleRepeatUntilDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowRepeatUntilPicker(false);
    }
    
    if (selectedDate) {
      const minDate = new Date(startDate);
      minDate.setDate(minDate.getDate() + 1);
      
      if (selectedDate > minDate) {
        setRepeatUntil(selectedDate);
      } else {
        setRepeatUntil(minDate);
      }
    }
  };
  
  // Format date/time display
  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };
  
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };
  
  // Get button color
  const buttonColor = customColor || color || theme.primary;
  
  // Tab content animation
  const animateTabChange = () => {
    Animated.sequence([
      Animated.timing(tabContentOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(tabContentOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
  };

  // Simple handlers for working inline selection
  const handleIconPickerPress = () => {
    console.log('Icon picker pressed');
    setShowIconPicker(true);
  };

  const handleGoalSelection = (goal) => {
    if (goal) {
      setSelectedGoalId(goal.id);
      setSelectedGoalTitle(goal.title);
    } else {
      setSelectedGoalId(null);
      setSelectedGoalTitle('');
    }
    // Reset project and task when changing goal
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
    setSelectedTaskId(null);
    setSelectedTaskTitle('');
  };

  const handleProjectSelection = (project) => {
    if (project) {
      setSelectedProjectId(project.id);
      setSelectedProjectTitle(project.title);
    } else {
      setSelectedProjectId(null);
      setSelectedProjectTitle('');
    }
    // Reset task when changing project
    setSelectedTaskId(null);
    setSelectedTaskTitle('');
    setShowProjectSelector(false);
  };

  const handleTaskSelection = (task) => {
    if (task) {
      setSelectedTaskId(task.id);
      setSelectedTaskTitle(task.title);
    } else {
      setSelectedTaskId(null);
      setSelectedTaskTitle('');
    }
    setShowTaskSelector(false);
  };
  
  // Render Schedule & Details Tab
  const renderScheduleTab = () => (
    <Animated.View style={{ opacity: tabContentOpacity, flex: 1 }}>
      <ScrollView 
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Title Input Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Title
          </Text>
          <TextInput
            style={[styles.titleInput, { 
              backgroundColor: theme.inputBackground,
              color: theme.text,
              borderColor: theme.border
            }]}
            placeholder="Enter time block title"
            placeholderTextColor={theme.textSecondary}
            value={title}
            onChangeText={setTitle}
            autoCapitalize="sentences"
            maxLength={100}
          />
        </View>
        
        {/* Schedule Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Schedule
          </Text>
          
          {/* Date Selector */}
          <TouchableOpacity
            style={[styles.dateTimeButton, { backgroundColor: theme.inputBackground }]}
            onPress={() => {
              setPickerMode('date');
              setShowStartDatePicker(true);
              setShowStartTimePicker(false);
              setShowEndTimePicker(false);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
            <Text style={[styles.dateTimeText, { color: theme.text }]}>
              {formatDate(startDate)}
            </Text>
          </TouchableOpacity>
          
          {/* Time Range */}
          <View style={styles.timeRangeContainer}>
            <TouchableOpacity
              style={[styles.timeButton, { backgroundColor: theme.inputBackground }]}
              onPress={() => {
                setPickerMode('time');
                setShowStartDatePicker(false);
                setShowStartTimePicker(true);
                setShowEndTimePicker(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Start</Text>
              <Text style={[styles.timeText, { color: theme.text }]}>
                {formatTime(startDate)}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.timeSeparator}>
              <Ionicons name="arrow-forward" size={20} color={theme.textSecondary} />
            </View>
            
            <TouchableOpacity
              style={[styles.timeButton, { backgroundColor: theme.inputBackground }]}
              onPress={() => {
                setPickerMode('time');
                setShowStartDatePicker(false);
                setShowStartTimePicker(false);
                setShowEndTimePicker(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>End</Text>
              <Text style={[styles.timeText, { color: theme.text }]}>
                {formatTime(endDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Association Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Link to Goal (Optional)
          </Text>
          
          {/* Goal Selection - WORKING PATTERN: Horizontal ScrollView */}
          <View style={styles.selectionSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectionScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* None option */}
              <TouchableOpacity
                style={[
                  styles.selectionItem,
                  !selectedGoalId && styles.selectionItemSelected,
                  { 
                    backgroundColor: !selectedGoalId ? buttonColor + '20' : theme.inputBackground,
                    borderColor: !selectedGoalId ? buttonColor : theme.border,
                    minHeight: 36,
                    minWidth: 44
                  }
                ]}
                onPress={() => {
                  setSelectedGoalId(null);
                  setSelectedGoalTitle('');
                  setSelectedProjectId(null);
                  setSelectedProjectTitle('');
                  setSelectedTaskId(null);
                  setSelectedTaskTitle('');
                }}
              >
                <Ionicons 
                  name="close-circle-outline" 
                  size={16} 
                  color={!selectedGoalId ? buttonColor : theme.textSecondary} 
                />
                <Text 
                  style={[
                    styles.selectionItemText, 
                    { color: !selectedGoalId ? buttonColor : theme.text }
                  ]}
                >
                  None
                </Text>
              </TouchableOpacity>
              
              {/* Goal options */}
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.selectionItem,
                    selectedGoalId === goal.id && styles.selectionItemSelected,
                    { 
                      backgroundColor: selectedGoalId === goal.id ? buttonColor + '20' : theme.inputBackground,
                      borderColor: selectedGoalId === goal.id ? buttonColor : theme.border,
                      borderLeftColor: goal.color || buttonColor,
                      borderLeftWidth: 3,
                      minHeight: 36,
                      minWidth: 44
                    }
                  ]}
                  onPress={() => handleGoalSelection(goal)}
                >
                  <Ionicons 
                    name="flag-outline" 
                    size={16} 
                    color={selectedGoalId === goal.id ? buttonColor : theme.textSecondary} 
                  />
                  <Text 
                    style={[
                      styles.selectionItemText, 
                      { color: selectedGoalId === goal.id ? buttonColor : theme.text }
                    ]}
                    numberOfLines={1}
                  >
                    {goal.title}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {/* No goals message */}
              {goals.length === 0 && (
                <View 
                  style={[
                    styles.noItemsMessage, 
                    { backgroundColor: theme.inputBackground }
                  ]}
                >
                  <Text 
                    style={[
                      styles.noItemsText, 
                      { color: theme.textSecondary }
                    ]}
                  >
                    No goals available
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
          
          {/* Project Selection (conditional) */}
          {selectedGoalId && filteredProjects.length > 0 && (
            <View style={styles.selectionSection}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: fontSizes.s }]}>
                Select Project (Optional)
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectionScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* None option */}
                <TouchableOpacity
                  style={[
                    styles.selectionItem,
                    !selectedProjectId && styles.selectionItemSelected,
                    { 
                      backgroundColor: !selectedProjectId ? buttonColor + '20' : theme.inputBackground,
                      borderColor: !selectedProjectId ? buttonColor : theme.border,
                      minHeight: 36,
                      minWidth: 44
                    }
                  ]}
                  onPress={() => handleProjectSelection(null)}
                >
                  <Ionicons 
                    name="close-circle-outline" 
                    size={16} 
                    color={!selectedProjectId ? buttonColor : theme.textSecondary} 
                  />
                  <Text 
                    style={[
                      styles.selectionItemText, 
                      { color: !selectedProjectId ? buttonColor : theme.text }
                    ]}
                  >
                    None
                  </Text>
                </TouchableOpacity>
                
                {/* Project options */}
                {filteredProjects.map((project) => (
                  <TouchableOpacity
                    key={project.id}
                    style={[
                      styles.selectionItem,
                      selectedProjectId === project.id && styles.selectionItemSelected,
                      { 
                        backgroundColor: selectedProjectId === project.id ? buttonColor + '20' : theme.inputBackground,
                        borderColor: selectedProjectId === project.id ? buttonColor : theme.border,
                        minHeight: 36,
                        minWidth: 44
                      }
                    ]}
                    onPress={() => handleProjectSelection(project)}
                  >
                    <Ionicons 
                      name="folder-outline" 
                      size={16} 
                      color={selectedProjectId === project.id ? buttonColor : theme.textSecondary} 
                    />
                    <Text 
                      style={[
                        styles.selectionItemText, 
                        { color: selectedProjectId === project.id ? buttonColor : theme.text }
                      ]}
                      numberOfLines={1}
                    >
                      {project.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Task Selection (conditional) */}
          {selectedProjectId && filteredTasks.length > 0 && (
            <View style={styles.selectionSection}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: fontSizes.s }]}>
                Select Task (Optional)
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectionScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* None option */}
                <TouchableOpacity
                  style={[
                    styles.selectionItem,
                    !selectedTaskId && styles.selectionItemSelected,
                    { 
                      backgroundColor: !selectedTaskId ? buttonColor + '20' : theme.inputBackground,
                      borderColor: !selectedTaskId ? buttonColor : theme.border,
                      minHeight: 36,
                      minWidth: 44
                    }
                  ]}
                  onPress={() => handleTaskSelection(null)}
                >
                  <Ionicons 
                    name="close-circle-outline" 
                    size={16} 
                    color={!selectedTaskId ? buttonColor : theme.textSecondary} 
                  />
                  <Text 
                    style={[
                      styles.selectionItemText, 
                      { color: !selectedTaskId ? buttonColor : theme.text }
                    ]}
                  >
                    None
                  </Text>
                </TouchableOpacity>
                
                {/* Task options */}
                {filteredTasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.selectionItem,
                      selectedTaskId === task.id && styles.selectionItemSelected,
                      { 
                        backgroundColor: selectedTaskId === task.id ? buttonColor + '20' : theme.inputBackground,
                        borderColor: selectedTaskId === task.id ? buttonColor : theme.border,
                        minHeight: 36,
                        minWidth: 44
                      }
                    ]}
                    onPress={() => handleTaskSelection(task)}
                  >
                    <Ionicons 
                      name={task.completed ? "checkmark-circle" : "checkmark-circle-outline"} 
                      size={16} 
                      color={selectedTaskId === task.id ? buttonColor : theme.textSecondary} 
                    />
                    <Text 
                      style={[
                        styles.selectionItemText, 
                        { 
                          color: selectedTaskId === task.id ? buttonColor : theme.text,
                          textDecorationLine: task.completed ? 'line-through' : 'none'
                        }
                      ]}
                      numberOfLines={1}
                    >
                      {task.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        
        {/* Location Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Location (Optional)
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.inputBackground,
              color: theme.text,
              borderColor: theme.border
            }]}
            placeholder="Enter location"
            placeholderTextColor={theme.textSecondary}
            value={location}
            onChangeText={setLocation}
            autoCapitalize="words"
            maxLength={100}
          />
        </View>
        
        {/* Add padding at bottom for scroll */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </Animated.View>
  );
  
  // Render Options & Settings Tab
  const renderOptionsTab = () => (
    <Animated.View style={{ opacity: tabContentOpacity, flex: 1 }}>
      <ScrollView 
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* Activity Customization (for general activities) */}
        {!selectedGoalId && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Activity Customization
            </Text>
            
            {/* Icon Picker Button - CRITICAL: Simple, direct button */}
            <TouchableOpacity
              style={[styles.customizationButton, { backgroundColor: theme.inputBackground }]}
              onPress={handleIconPickerPress}
              activeOpacity={0.7}
            >
              <View style={styles.customizationRow}>
                <View style={[styles.iconPreview, { backgroundColor: customColor + '20' }]}>
                  <Ionicons 
                    name={customIcon || 'calendar'} 
                    size={24} 
                    color={customColor} 
                  />
                </View>
                <View style={styles.customizationInfo}>
                  <Text style={[styles.customizationLabel, { color: theme.textSecondary }]}>
                    Icon & Color
                  </Text>
                  <Text style={[styles.customizationValue, { color: theme.text }]}>
                    {customIcon ? 'Custom' : 'Default'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Recurring Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recurring Settings
          </Text>
          
          {/* Repeat Toggle */}
          <View style={[styles.toggleRow, { backgroundColor: theme.inputBackground }]}>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleLabel, { color: theme.text }]}>
                Repeat
              </Text>
              <Text style={[styles.toggleDescription, { color: theme.textSecondary }]}>
                Create recurring time blocks
              </Text>
            </View>
            <Switch
              value={isRepeating}
              onValueChange={setIsRepeating}
              trackColor={{ 
                false: theme.border,
                true: buttonColor + '80'
              }}
              thumbColor={isRepeating ? buttonColor : '#f4f3f4'}
            />
          </View>
          
          {/* Frequency Selection */}
          {isRepeating && (
            <>
              <Text style={[styles.subsectionTitle, { color: theme.textSecondary }]}>
                Frequency
              </Text>
              <View style={styles.frequencyContainer}>
                {['daily', 'weekly', 'fortnightly', 'monthly'].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyButton,
                      {
                        backgroundColor: repeatFrequency === freq ? buttonColor + '20' : theme.inputBackground,
                        borderColor: repeatFrequency === freq ? buttonColor : theme.border,
                      }
                    ]}
                    onPress={() => setRepeatFrequency(freq)}
                  >
                    <Text style={[
                      styles.frequencyText,
                      {
                        color: repeatFrequency === freq ? buttonColor : theme.text,
                        fontWeight: repeatFrequency === freq ? '600' : 'normal'
                      }
                    ]}>
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Repeat Until */}
              <Text style={[styles.subsectionTitle, { color: theme.textSecondary }]}>
                End Date
              </Text>
              <View style={styles.repeatEndContainer}>
                <TouchableOpacity
                  style={[
                    styles.repeatEndOption,
                    {
                      backgroundColor: repeatIndefinitely ? buttonColor + '20' : theme.inputBackground,
                      borderColor: repeatIndefinitely ? buttonColor : theme.border,
                    }
                  ]}
                  onPress={() => setRepeatIndefinitely(true)}
                >
                  <Text style={[
                    styles.repeatEndText,
                    { color: repeatIndefinitely ? buttonColor : theme.text }
                  ]}>
                    Indefinitely
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.repeatEndOption,
                    {
                      backgroundColor: !repeatIndefinitely ? buttonColor + '20' : theme.inputBackground,
                      borderColor: !repeatIndefinitely ? buttonColor : theme.border,
                    }
                  ]}
                  onPress={() => {
                    setRepeatIndefinitely(false);
                    if (!repeatUntil) {
                      const defaultEnd = new Date(startDate);
                      defaultEnd.setMonth(defaultEnd.getMonth() + 1);
                      setRepeatUntil(defaultEnd);
                    }
                    setShowRepeatUntilPicker(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.repeatEndText,
                    { color: !repeatIndefinitely ? buttonColor : theme.text }
                  ]}>
                    {!repeatIndefinitely && repeatUntil ? 
                      formatDate(repeatUntil) : 'Until Date'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Conflict Preview */}
              {conflictData?.conflictingInstances?.length > 0 && (
                <View style={[styles.conflictPreview, { backgroundColor: theme.warning + '20' }]}>
                  <Ionicons name="warning" size={20} color={theme.warning} />
                  <Text style={[styles.conflictPreviewText, { color: theme.text }]}>
                    {conflictData.conflictCount} of {conflictData.totalInstances} instances will conflict
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
        
        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Notes (Optional)
          </Text>
          <TextInput
            style={[styles.notesInput, { 
              backgroundColor: theme.inputBackground,
              color: theme.text,
              borderColor: theme.border
            }]}
            placeholder="Add notes..."
            placeholderTextColor={theme.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
            {notes.length}/500
          </Text>
        </View>
        
        {/* Add padding at bottom for scroll */}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </Animated.View>
  );
  
  // Scene map for TabView
  const renderScene = SceneMap({
    schedule: renderScheduleTab,
    options: renderOptionsTab,
  });
  
  // Custom tab bar
  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{ 
        backgroundColor: buttonColor,
        height: 3
      }}
      style={{ 
        backgroundColor: theme.cardBackground,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.border
      }}
      labelStyle={{
        fontSize: fontSizes.m,
        fontWeight: '600',
        textTransform: 'none'
      }}
      activeColor={buttonColor}
      inactiveColor={theme.textSecondary}
      onTabPress={({ route, preventDefault }) => {
        animateTabChange();
      }}
    />
  );
  
  return (
    <>
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
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
          <View style={styles.backgroundTouchable} />
        </TouchableWithoutFeedback>
        
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.background,
              transform: [
                { translateY: Animated.add(slideAnim, translateY) }
              ]
            }
          ]}
        >
          {/* Header with drag area */}
          <PanGestureHandler onHandlerStateChange={handleGesture}>
            <Animated.View style={styles.header}>
              <View style={styles.dragIndicator} />
              <View style={styles.headerContent}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                  {timeBlockData ? 'Edit Time Block' : '✅ WORKING Time Block'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </PanGestureHandler>
            
            {/* TabView */}
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width }}
              renderTabBar={renderTabBar}
              swipeEnabled={true}
              lazy={false}
              removeClippedSubviews={false}
            />
            
            {/* Bottom Action Bar */}
            <View style={[styles.bottomBar, { 
              backgroundColor: theme.cardBackground,
              borderTopColor: theme.border,
              paddingBottom: safeSpacing.bottom
            }]}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.border }]}
                onPress={handleClose}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddTimeBlock}
                disabled={isSaving || !title.trim()}
              >
                <LinearGradient
                  colors={[buttonColor, buttonColor + 'dd']}
                  style={styles.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.submitButtonText}>
                    {isSaving ? 'Saving...' : (timeBlockData ? 'Update' : 'Create')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
        </Animated.View>
      </Animated.View>
    </Modal>
    
    {/* Date/Time Pickers */}
    {showStartDatePicker && (
      <DateTimePicker
        value={startDate}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={handleStartDateChange}
      />
    )}
    
    {showStartTimePicker && (
      <DateTimePicker
        value={startDate}
        mode="time"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={handleStartTimeChange}
      />
    )}
    
    {showEndTimePicker && (
      <DateTimePicker
        value={endDate}
        mode="time"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={handleEndTimeChange}
      />
    )}
    
    {showRepeatUntilPicker && (
      <DateTimePicker
        value={repeatUntil || new Date()}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={handleRepeatUntilDateChange}
        minimumDate={new Date(startDate.getTime() + 86400000)}
      />
    )}
    
    {/* Icon Picker Modal - CRITICAL: Simple implementation */}
    <IconPicker
      visible={showIconPicker}
      onClose={() => setShowIconPicker(false)}
      selectedIcon={customIcon}
      onSelectIcon={setCustomIcon}
      customColor={customColor}
      onSelectColor={setCustomColor}
    />
    
    {/* Conflict Resolution Modal */}
    <Modal
      visible={showConflictModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowConflictModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowConflictModal(false)}>
        <View style={styles.conflictOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.conflictModal, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.conflictTitle, { color: theme.text }]}>
                {conflictData?.conflictingInstances?.length > 0 ? 
                  'Recurring Event Conflicts' : 'Time Conflict'}
              </Text>
              
              {conflictData?.conflictingInstances?.length > 0 ? (
                <Text style={[styles.conflictDescription, { color: theme.textSecondary }]}>
                  {conflictData.conflictCount} of {conflictData.totalInstances} recurring events will conflict with existing timeblocks.
                </Text>
              ) : (
                <Text style={[styles.conflictDescription, { color: theme.textSecondary }]}>
                  This time overlaps with: {conflictDetails}
                </Text>
              )}
              
              <View style={styles.conflictActions}>
                <TouchableOpacity
                  style={[styles.conflictButton, { backgroundColor: theme.inputBackground }]}
                  onPress={() => setShowConflictModal(false)}
                >
                  <Text style={[styles.conflictButtonText, { color: theme.text }]}>
                    Adjust Time
                  </Text>
                </TouchableOpacity>
                
                {conflictData?.conflictingInstances?.length > 0 && (
                  <TouchableOpacity
                    style={[styles.conflictButton, { backgroundColor: buttonColor }]}
                    onPress={handleSaveSkipConflicts}
                    disabled={isSaving}
                  >
                    <Text style={[styles.conflictButtonText, { color: '#FFFFFF' }]}>
                      {isSaving ? 'Creating...' : 'Skip Conflicts'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.conflictButton, { backgroundColor: theme.warning }]}
                  onPress={handleSaveBypassConflicts}
                  disabled={isSaving}
                >
                  <Text style={[styles.conflictButtonText, { color: '#FFFFFF' }]}>
                    {isSaving ? 'Creating...' : 'Create Anyway'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
    
    
    {/* Limit Modal */}
    <FreeTierLimitModal
      visible={showLimitModal}
      theme={theme}
      limitType="weeklyLimit"
      onClose={() => setShowLimitModal(false)}
      onUpgrade={() => {
        setShowLimitModal(false);
        navigation.navigate('PricingScreen');
      }}
      isDarkMode={theme.background === '#000000'}
    />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backgroundTouchable: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    paddingTop: spacing.s,
    paddingBottom: spacing.m,
    borderBottomWidth: 0,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.s,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: spacing.xs,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
  },
  section: {
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  subsectionTitle: {
    fontSize: fontSizes.s,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.m,
    fontSize: fontSizes.m,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.m,
    fontSize: fontSizes.m,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.m,
    fontSize: fontSizes.m,
    minHeight: 100,
  },
  characterCount: {
    fontSize: fontSizes.xs,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: 12,
    marginBottom: spacing.s,
  },
  dateTimeText: {
    fontSize: fontSizes.m,
    marginLeft: spacing.s,
    flex: 1,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  timeButton: {
    flex: 1,
    padding: spacing.m,
    borderRadius: 12,
    alignItems: 'center',
  },
  timeSeparator: {
    paddingHorizontal: spacing.s,
  },
  timeLabel: {
    fontSize: fontSizes.xs,
    marginBottom: spacing.xs,
  },
  timeText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: 12,
    marginBottom: spacing.s,
  },
  durationText: {
    fontSize: fontSizes.m,
    marginLeft: spacing.s,
  },
  quickDurationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickDurationButton: {
    flex: 1,
    padding: spacing.s,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 1,
  },
  quickDurationText: {
    fontSize: fontSizes.s,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: 12,
  },
  selectorText: {
    flex: 1,
    fontSize: fontSizes.m,
    marginLeft: spacing.s,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    borderRadius: 12,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  toggleDescription: {
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.s,
  },
  frequencyButton: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.m,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  frequencyText: {
    fontSize: fontSizes.s,
  },
  repeatEndContainer: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  repeatEndOption: {
    flex: 1,
    padding: spacing.m,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  repeatEndText: {
    fontSize: fontSizes.s,
  },
  customizationButton: {
    padding: spacing.m,
    borderRadius: 12,
  },
  customizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPreview: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customizationInfo: {
    flex: 1,
    marginLeft: spacing.m,
  },
  customizationLabel: {
    fontSize: fontSizes.xs,
  },
  customizationValue: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  conflictPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: 12,
    marginTop: spacing.m,
  },
  conflictPreviewText: {
    fontSize: fontSizes.s,
    marginLeft: spacing.s,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: spacing.m,
    borderTopWidth: 1,
    gap: spacing.s,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.m,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    padding: spacing.m,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  conflictOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  conflictModal: {
    width: '100%',
    padding: spacing.l,
    borderRadius: 16,
  },
  conflictTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
    marginBottom: spacing.s,
  },
  conflictDescription: {
    fontSize: fontSizes.m,
    marginBottom: spacing.l,
  },
  conflictActions: {
    gap: spacing.s,
  },
  conflictButton: {
    padding: spacing.m,
    borderRadius: 12,
    alignItems: 'center',
  },
  conflictButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  selectorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  selectorModal: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xl,
  },
  selectorModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  selectorModalTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
  },
  selectorModalContent: {
    padding: spacing.m,
  },
  selectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: 12,
    marginBottom: spacing.s,
  },
  selectorOptionText: {
    fontSize: fontSizes.m,
    marginLeft: spacing.m,
    flex: 1,
  },
  // Working pattern styles from Copy (24)
  selectionSection: {
    marginBottom: spacing.s,
  },
  selectionScrollContent: {
    paddingHorizontal: spacing.xs,
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderRadius: 8,
  },
  selectionItemSelected: {
    // Additional selected styling if needed
  },
  selectionItemText: {
    fontSize: fontSizes.xs,
    marginLeft: spacing.xs,
  },
  noItemsMessage: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  noItemsText: {
    fontSize: fontSizes.xs,
    fontStyle: 'italic',
  },
});

export default AddTimeBlockModalRevamped;