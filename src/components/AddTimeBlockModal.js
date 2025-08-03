// src/components/AddTimeBlockModal.js
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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppContext } from '../context/AppContext';
import { FREE_PLAN_LIMITS } from '../services/SubscriptionService';
import TextInputPopup from './TextInputPopup';

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

const AddTimeBlockModal = ({ 
  visible, 
  onClose, 
  onAdd, 
  timeBlockData,
  color
}) => {
  const { theme } = useTheme();
  const appContext = useAppContext();
  const { 
    userSubscriptionStatus,
    timeBlocks = []
  } = appContext;
  const safeSpacing = useSafeSpacing();
  
  // Check if user is pro
  const isPro = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  
  // Main state
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isAllDay, setIsAllDay] = useState(false);
  
  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  
  // NEW: Advanced mode toggle
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Text input popup states
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showNotesPopup, setShowNotesPopup] = useState(false);
  
  // Goal/Project/Task state
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedGoalTitle, setSelectedGoalTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
  
  // Animation value for advanced options panel
  const advancedOptionsHeight = useState(new Animated.Value(0))[0];
  
  // Modal animation values
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  
  // Get available data from app context
  const goals = appContext?.goals || appContext?.mainGoals || [];
  const projects = appContext?.projects || [];
  const allTasks = appContext?.tasks || [];
  
  // Get filtered projects based on selected goal
  const filteredProjects = selectedGoalId 
    ? projects.filter(project => project.goalId === selectedGoalId)
    : [];
  
  // Get filtered tasks based on selected project
  // First try to get tasks from the project itself (projects[].tasks)
  let filteredTasks = [];
  if (selectedProjectId) {
    // Try to find the project in the projects array
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    if (selectedProject && Array.isArray(selectedProject.tasks)) {
      // Use the project's tasks array if available
      filteredTasks = selectedProject.tasks;
      console.log(`Found ${filteredTasks.length} tasks directly in project`);
    } else {
      // Fall back to filtering from all tasks (less reliable)
      filteredTasks = allTasks.filter(task => task.projectId === selectedProjectId);
      console.log(`Found ${filteredTasks.length} tasks via filtering from all tasks`);
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
  
  // Helper function to parse date string in the format "YYYY-MM-DD HH:MM"
  const parseLocalDateTimeString = (dateTimeStr) => {
    try {
      if (!dateTimeStr) return null;
      
      console.log(`Parsing local date time string: "${dateTimeStr}"`);
      
      // Split into date and time parts
      const [datePart, timePart] = dateTimeStr.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      
      // Create date in local timezone (explicitly construct all components)
      const parsedDate = new Date(year, month - 1, day, hours, minutes, 0);
      
      console.log(`Parsed local date: ${parsedDate.toString()}`);
      console.log(`Date components: Y=${year}, M=${month-1}, D=${day}, H=${hours}, M=${minutes}`);
      
      return parsedDate;
    } catch (error) {
      console.error('Error parsing local date time string:', error);
      return null;
    }
  };
  
  // Helper function to ensure date is valid and not in the past
  const ensureValidDate = (dateObj) => {
    try {
      // Check if date is valid
      if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        console.log('Invalid date detected, using current date');
        return new Date();
      }
      
      // Check if date is in the past (more than 1 minute ago to allow for slight time differences)
      const now = new Date();
      if (dateObj < new Date(now.getTime() - 60000)) {
        console.log('Past date detected, using current date');
        // If it's today but time has passed, set to next hour
        if (dateObj.toDateString() === now.toDateString()) {
          const futureDate = new Date();
          futureDate.setHours(futureDate.getHours() + 1);
          futureDate.setMinutes(0, 0, 0);
          return futureDate;
        } else {
          // It's a past day, use same time tomorrow
          const tomorrowDate = new Date(dateObj);
          tomorrowDate.setDate(now.getDate());
          tomorrowDate.setMonth(now.getMonth());
          tomorrowDate.setFullYear(now.getFullYear());
          
          // If time has already passed today, set to tomorrow
          if (tomorrowDate < now) {
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
          }
          
          return tomorrowDate;
        }
      }
      
      return dateObj;
    } catch (error) {
      console.error('Error ensuring valid date:', error);
      return new Date();
    }
  };
  
  // Handle modal animation
  useEffect(() => {
    if (visible) {
      // Reset animation values
      backgroundOpacityAnim.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
      
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
  
  // Update form when editing a time block
  useEffect(() => {
    if (visible && timeBlockData) {
      setTitle(timeBlockData.title || '');
      setNotes(timeBlockData.notes || '');
      setLocation(timeBlockData.location || '');
      
      // Handle start time parsing - prioritize original time strings when available
      console.log(`========== TIME BLOCK INITIALIZATION ==========`);
      console.log(`Original start time string: ${timeBlockData.originalStartTimeString || 'not available'}`);
      console.log(`ISO start time: ${timeBlockData.startTime || 'not available'}`);
      
      let parsedStartDate;
      
      // First try to use the original time string from the AI (if available)
      if (timeBlockData.originalStartTimeString) {
        parsedStartDate = parseLocalDateTimeString(timeBlockData.originalStartTimeString);
        if (parsedStartDate) {
          console.log(`Successfully parsed original start time string to: ${parsedStartDate.toString()}`);
        }
      }
      
      // If original time string isn't available or parsing failed, fall back to ISO string
      if (!parsedStartDate && timeBlockData.startTime) {
        try {
          console.log(`Falling back to ISO start time: ${timeBlockData.startTime}`);
          parsedStartDate = new Date(timeBlockData.startTime);
          console.log(`Parsed ISO start time to: ${parsedStartDate.toString()}`);
        } catch (error) {
          console.error('Error parsing ISO start time:', error);
        }
      }
      
      // If all parsing fails, use default
      if (!parsedStartDate || isNaN(parsedStartDate.getTime())) {
        console.log('Could not parse start time, using default');
        parsedStartDate = getDefaultStartTime();
      }
      
      setStartDate(parsedStartDate);
      
      // Handle end time parsing - similarly prioritize original time strings
      console.log(`Original end time string: ${timeBlockData.originalEndTimeString || 'not available'}`);
      console.log(`ISO end time: ${timeBlockData.endTime || 'not available'}`);
      
      let parsedEndDate;
      
      // First try to use the original time string from the AI (if available)
      if (timeBlockData.originalEndTimeString) {
        parsedEndDate = parseLocalDateTimeString(timeBlockData.originalEndTimeString);
        if (parsedEndDate) {
          console.log(`Successfully parsed original end time string to: ${parsedEndDate.toString()}`);
        }
      }
      
      // If original time string isn't available or parsing failed, fall back to ISO string
      if (!parsedEndDate && timeBlockData.endTime) {
        try {
          console.log(`Falling back to ISO end time: ${timeBlockData.endTime}`);
          parsedEndDate = new Date(timeBlockData.endTime);
          console.log(`Parsed ISO end time to: ${parsedEndDate.toString()}`);
        } catch (error) {
          console.error('Error parsing ISO end time:', error);
        }
      }
      
      // If all parsing fails, derive from start time or use default
      if (!parsedEndDate || isNaN(parsedEndDate.getTime())) {
        console.log('Could not parse end time, deriving from start time');
        parsedEndDate = getDefaultEndTime(parsedStartDate);
      }
      
      // Ensure end time is after start time
      if (parsedEndDate <= parsedStartDate) {
        console.log('End time is before or equal to start time, adjusting');
        parsedEndDate = getDefaultEndTime(parsedStartDate);
      }
      
      setEndDate(parsedEndDate);
      console.log(`==============================================`);
      
      setIsAllDay(timeBlockData.isAllDay || false);
      
      // Set goal/project/task if available
      if (timeBlockData.goalId) {
        setSelectedGoalId(timeBlockData.goalId);
        setSelectedGoalTitle(timeBlockData.goalTitle || '');
      }
      
      if (timeBlockData.projectId) {
        setSelectedProjectId(timeBlockData.projectId);
        setSelectedProjectTitle(timeBlockData.projectTitle || '');
      }
      
      if (timeBlockData.taskId) {
        setSelectedTaskId(timeBlockData.taskId);
        setSelectedTaskTitle(timeBlockData.taskTitle || '');
      }
    } else if (!visible) {
      // Reset form when closing
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
    setIsAllDay(false);
    
    // Reset advanced options
    setShowAdvancedOptions(false);
    
    // Don't reset goal/project/task IDs to preserve them between sessions
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
  
  // Handle add time block
  const handleAddTimeBlock = () => {
    if (!title.trim()) {
      return; // Don't add empty time blocks
    }

    // Check limits for free users
    if (!isPro) {
      const limitCheck = checkTimeBlockLimits();
      if (!limitCheck.canAdd) {
        showTimeBlockLimitAlert(limitCheck);
        return;
      }
    }
    
    // Ensure dates are valid before submitting
    const validStartDate = ensureValidDate(startDate);
    const validEndDate = ensureValidDate(endDate);
    
    // If end date is before start date, adjust it
    const finalEndDate = validEndDate <= validStartDate ? 
      getDefaultEndTime(validStartDate) : validEndDate;
    
    // Log the dates being used
    console.log(`========== ADDING TIME BLOCK ==========`);
    console.log(`Starting with local dates:`);
    console.log(`- Start: ${validStartDate.toString()} (local time)`);
    console.log(`- End: ${finalEndDate.toString()} (local time)`);
    
    // Convert to ISO strings (will be in UTC)
    const startTimeISO = validStartDate.toISOString();
    const endTimeISO = finalEndDate.toISOString();
    
    console.log(`Converting to ISO strings (UTC):`);
    console.log(`- Start ISO: ${startTimeISO}`);
    console.log(`- End ISO: ${endTimeISO}`);
    console.log(`Local timezone offset: ${-new Date().getTimezoneOffset()/60} hours`);
    console.log(`======================================`);
    
    // Store the original local time strings for future use
    const originalStartTimeString = `${validStartDate.getFullYear()}-${String(validStartDate.getMonth() + 1).padStart(2, '0')}-${String(validStartDate.getDate()).padStart(2, '0')} ${String(validStartDate.getHours()).padStart(2, '0')}:${String(validStartDate.getMinutes()).padStart(2, '0')}`;
    const originalEndTimeString = `${finalEndDate.getFullYear()}-${String(finalEndDate.getMonth() + 1).padStart(2, '0')}-${String(finalEndDate.getDate()).padStart(2, '0')} ${String(finalEndDate.getHours()).padStart(2, '0')}:${String(finalEndDate.getMinutes()).padStart(2, '0')}`;
    
    // Create updated time block data
    const updatedTimeBlockData = {
      ...timeBlockData,
      title: title.trim(),
      notes: notes.trim(),
      location: location.trim(),
      startTime: startTimeISO,
      endTime: endTimeISO,
      isAllDay: isAllDay,
      // Store original time strings for reference
      originalStartTimeString: originalStartTimeString,
      originalEndTimeString: originalEndTimeString,
      // Store timezone information
      userTimezoneOffset: -(new Date().getTimezoneOffset() / 60),
      // Add goal/project/task associations if set
      ...(selectedGoalId && { goalId: selectedGoalId }),
      ...(selectedGoalTitle && { goalTitle: selectedGoalTitle }),
      ...(selectedProjectId && { projectId: selectedProjectId }),
      ...(selectedProjectTitle && { projectTitle: selectedProjectTitle }),
      ...(selectedTaskId && { taskId: selectedTaskId }),
      ...(selectedTaskTitle && { taskTitle: selectedTaskTitle })
    };
    
    // Call parent handler (passing back the updated time block data)
    onAdd(updatedTimeBlockData);
    
    // Reset form
    resetForm();
  };
  
  // Dismiss keyboard when clicking outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  
  // Toggle advanced options
  const toggleAdvancedOptions = () => {
    const newValue = !showAdvancedOptions;
    setShowAdvancedOptions(newValue);
    
    // Animate the height change
    Animated.timing(advancedOptionsHeight, {
      toValue: newValue ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  };
  
  // Handle date picker changes
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      if (showStartDatePicker) setShowStartDatePicker(false);
      if (showStartTimePicker) setShowStartTimePicker(false);
      if (showEndTimePicker) setShowEndTimePicker(false);
    }
    
    if (selectedDate) {
      // Determine which date/time is being modified
      if (showStartDatePicker || showStartTimePicker) {
        const newDate = new Date(startDate);
        
        if (pickerMode === 'date') {
          // Update date components only
          newDate.setFullYear(selectedDate.getFullYear());
          newDate.setMonth(selectedDate.getMonth());
          newDate.setDate(selectedDate.getDate());
        } else {
          // Update time components only
          newDate.setHours(selectedDate.getHours());
          newDate.setMinutes(selectedDate.getMinutes());
        }
        
        // Ensure the date is not in the past
        const now = new Date();
        if (newDate < now) {
          console.log('Selected date is in the past, adjusting to current or future time');
          if (pickerMode === 'date') {
            // If setting date, keep the date but adjust time to future
            if (newDate.toDateString() === now.toDateString()) {
              // Same day, just adjust time to future
              newDate.setHours(now.getHours() + 1);
              newDate.setMinutes(0, 0, 0);
            }
          } else {
            // If setting time, check if it's today and time is in past
            if (newDate.toDateString() === now.toDateString() && newDate < now) {
              // If it's today and time is in past, adjust to next hour
              newDate.setHours(now.getHours() + 1);
              newDate.setMinutes(0, 0, 0);
            }
          }
        }
        
        setStartDate(newDate);
        
        // If end date is before start date, update it too
        if (endDate < newDate) {
          const newEndDate = new Date(newDate);
          newEndDate.setHours(newEndDate.getHours() + 1);
          setEndDate(newEndDate);
        }
      } else if (showEndTimePicker) {
        const newDate = new Date(endDate);
        
        // Update time components only
        newDate.setHours(selectedDate.getHours());
        newDate.setMinutes(selectedDate.getMinutes());
        
        // Ensure end time is after start time
        if (newDate > startDate) {
          setEndDate(newDate);
        } else {
          // Add 30 minutes to start time
          const adjustedDate = new Date(startDate);
          adjustedDate.setMinutes(adjustedDate.getMinutes() + 30);
          setEndDate(adjustedDate);
        }
      }
    }
  };
  
  // Format dates for display
  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Get theme-aware button color
  const buttonColor = color || theme.primary;

  // Function to check if adding a time block would exceed limits
  const checkTimeBlockLimits = () => {
    if (isPro) return { canAdd: true }; // Pro users have no limits
    
    // Get current week time blocks (this week only)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); // End of current week
    
    const thisWeekBlocks = timeBlocks.filter(block => {
      const blockDate = new Date(block.startTime);
      return blockDate >= startOfWeek && blockDate < endOfWeek;
    });
    
    const currentCount = thisWeekBlocks.length;
    const limit = FREE_PLAN_LIMITS.MAX_TIME_BLOCKS;
    
    return {
      canAdd: currentCount < limit,
      currentCount,
      limit,
      isWeekly: true
    };
  };

  // Function to show time block limit exceeded alert
  const showTimeBlockLimitAlert = (limitCheck) => {
    Alert.alert(
      "Weekly Time Block Limit Reached",
      `You've reached the limit of ${limitCheck.limit} time blocks per week.\n\n` +
      `Current this week: ${limitCheck.currentCount}/${limitCheck.limit}\n\n` +
      `Free accounts are limited to ${limitCheck.limit} time blocks per week. ` +
      `Upgrade to Pro for unlimited time blocks and better planning.`,
      [
        {
          text: "Upgrade to Pro",
          onPress: () => {
            // TODO: Navigate to upgrade screen
            Alert.alert("Upgrade to Pro", "Navigate to upgrade screen - implement this navigation");
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ],
      { cancelable: true }
    );
  };
  
  // Handle goal selection
  const handleSelectGoal = (goal) => {
    setSelectedGoalId(goal.id);
    setSelectedGoalTitle(goal.title);
    
    // Reset project and task selection when goal changes
    setSelectedProjectId(null);
    setSelectedProjectTitle('');
    setSelectedTaskId(null);
    setSelectedTaskTitle('');
  };
  
  // Handle project selection
  const handleSelectProject = (project) => {
    setSelectedProjectId(project.id);
    setSelectedProjectTitle(project.title);
    
    // Reset task selection when project changes
    setSelectedTaskId(null);
    setSelectedTaskTitle('');
  };
  
  // Handle task selection
  const handleSelectTask = (task) => {
    setSelectedTaskId(task.id);
    setSelectedTaskTitle(task.title);
  };
  
  // Calculate container padding based on device size and orientation
  const getContainerPadding = () => {
    if (isTablet) {
      return isLandscape ? spacing.xl : spacing.l;
    } else {
      return isLandscape ? spacing.l : spacing.m;
    }
  };
  
  // Determine modal max height based on device and orientation
  const getModalMaxHeight = () => {
    if (isTablet) {
      return isLandscape ? '80%' : '90%';
    } else if (isLandscape) {
      return '95%';
    } else {
      return '90%';
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel="Schedule time block modal"
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: backgroundOpacityAnim
          }
        ]}
      >
        <Animated.View
          style={[
            styles.gestureContainer,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <KeyboardAvoidingView 
            style={styles.keyboardContainer} 
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? scaleHeight(64) : 0}
          >
            <View 
              style={[
                styles.modalContent, 
                { 
                  backgroundColor: theme.card,
                  padding: getContainerPadding(),
                  paddingBottom: Platform.OS === 'ios' ? safeSpacing.bottom : getContainerPadding(),
                  maxHeight: getModalMaxHeight()
                }
              ]}
            >
          <View style={styles.modalHeader}>
            <Text 
              style={[
                styles.modalTitle, 
                { color: theme.text }
              ]}
              maxFontSizeMultiplier={1.3}
              accessibilityRole="header"
            >
              Schedule Time Block
            </Text>
            <TouchableOpacity 
              style={[
                styles.closeButton,
                ensureAccessibleTouchTarget(scaleWidth(32), scaleWidth(32))
              ]}
              onPress={handleClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              accessibilityHint="Dismisses the time block form without saving"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={scaleWidth(24)} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {/* Wrap ScrollView directly without TouchableWithoutFeedback to allow scrolling anywhere */}
          <ScrollView 
            style={styles.formContainer}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: scaleHeight(20) }
            ]}
            accessible={true}
            accessibilityRole="form"
            accessibilityLabel="Time block form"
          >
            {/* Title Field - Always visible */}
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <View>
                <Text 
                  style={[
                    styles.label, 
                    { color: theme.textSecondary }
                  ]}
                  maxFontSizeMultiplier={1.5}
                  accessibilityRole="text"
                >
                  Title *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme.inputBackground,
                      color: theme.text,
                      borderColor: theme.border,
                      minHeight: scaleHeight(48)
                    }
                  ]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter title"
                  placeholderTextColor={theme.textSecondary}
                  autoFocus={false}
                  maxFontSizeMultiplier={1.3}
                  accessible={true}
                  accessibilityLabel="Time block title"
                  accessibilityHint="Enter a name for this time block"
                  accessibilityRole="text"
                />
              </View>
            </TouchableWithoutFeedback>
            
            {/* All Day Switch - Always visible */}
            <View style={styles.switchContainer}>
              <Text 
                style={[
                  styles.switchLabel, 
                  { color: theme.text }
                ]}
                maxFontSizeMultiplier={1.3}
                accessible={true}
                accessibilityRole="text"
              >
                All day
              </Text>
              <Switch
                value={isAllDay}
                onValueChange={setIsAllDay}
                trackColor={{ false: theme.border, true: buttonColor + '80' }}
                thumbColor={isAllDay ? buttonColor : theme.textSecondary}
                accessible={true}
                accessibilityRole="switch"
                accessibilityLabel="All day time block"
                accessibilityHint="Toggle between all day and specific time"
                accessibilityState={{ checked: isAllDay }}
              />
            </View>
            
            {/* Date and Time Selectors - Always visible */}
            <View style={styles.dateTimeSection}>
              <Text 
                style={[
                  styles.sectionLabel, 
                  { color: theme.textSecondary }
                ]}
                maxFontSizeMultiplier={1.5}
                accessibilityRole="header"
              >
                Date & Time
              </Text>
              
              {/* Date Selector */}
              <TouchableOpacity 
                style={[
                  styles.dateTimeButton,
                  { 
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    minHeight: scaleHeight(48)
                  }
                ]}
                onPress={() => {
                  setPickerMode('date');
                  setShowStartDatePicker(true);
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Select date"
                accessibilityHint="Opens date picker to select day for time block"
              >
                <Ionicons name="calendar-outline" size={scaleWidth(18)} color={buttonColor} />
                <Text 
                  style={[
                    styles.dateTimeText, 
                    { color: theme.text }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  {formatDate(startDate)}
                </Text>
              </TouchableOpacity>
              
              {/* Time Selectors - Hidden if All Day is selected */}
              {!isAllDay && (
                <>
                  <View style={styles.timeRow}>
                    <Text 
                      style={[
                        styles.timeLabel, 
                        { color: theme.textSecondary }
                      ]}
                      maxFontSizeMultiplier={1.5}
                    >
                      Start Time
                    </Text>
                    <TouchableOpacity 
                      style={[
                        styles.timeButton,
                        { 
                          backgroundColor: theme.inputBackground,
                          borderColor: theme.border,
                          minHeight: scaleHeight(44)
                        }
                      ]}
                      onPress={() => {
                        setPickerMode('time');
                        setShowStartTimePicker(true);
                      }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Select start time"
                      accessibilityHint="Opens time picker to select start time"
                    >
                      <Ionicons name="time-outline" size={scaleWidth(18)} color={buttonColor} />
                      <Text 
                        style={[
                          styles.dateTimeText, 
                          { color: theme.text }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {formatTime(startDate)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.timeRow}>
                    <Text 
                      style={[
                        styles.timeLabel, 
                        { color: theme.textSecondary }
                      ]}
                      maxFontSizeMultiplier={1.5}
                    >
                      End Time
                    </Text>
                    <TouchableOpacity 
                      style={[
                        styles.timeButton,
                        { 
                          backgroundColor: theme.inputBackground,
                          borderColor: theme.border,
                          minHeight: scaleHeight(44)
                        }
                      ]}
                      onPress={() => {
                        setPickerMode('time');
                        setShowEndTimePicker(true);
                      }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Select end time"
                      accessibilityHint="Opens time picker to select end time"
                    >
                      <Ionicons name="time-outline" size={scaleWidth(18)} color={buttonColor} />
                      <Text 
                        style={[
                          styles.dateTimeText, 
                          { color: theme.text }
                        ]}
                        maxFontSizeMultiplier={1.3}
                      >
                        {formatTime(endDate)}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
            
            {/* Goal/Project/Task Info (Read-Only) - Only shown if any is selected and advanced options are hidden */}
            {!showAdvancedOptions && (selectedGoalId || selectedProjectId || selectedTaskId) && (
              <View 
                style={[
                  styles.associationCard, 
                  { 
                    backgroundColor: theme.inputBackground + '50', 
                    borderColor: theme.border,
                    borderLeftColor: buttonColor,
                    borderLeftWidth: 3,
                  }
                ]}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel="Associated items"
              >
                <Text 
                  style={[
                    styles.associationTitle, 
                    { color: theme.text }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Associated with:
                </Text>
                
                {selectedGoalId && (
                  <View 
                    style={styles.associationItem}
                    accessible={true}
                    accessibilityRole="text"
                  >
                    <Ionicons name="flag-outline" size={scaleWidth(16)} color={buttonColor} />
                    <Text 
                      style={[
                        styles.associationText, 
                        { color: theme.text }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Goal: {selectedGoalTitle}
                    </Text>
                  </View>
                )}
                
                {selectedProjectId && (
                  <View 
                    style={styles.associationItem}
                    accessible={true}
                    accessibilityRole="text"
                  >
                    <Ionicons name="folder-outline" size={scaleWidth(16)} color={buttonColor} />
                    <Text 
                      style={[
                        styles.associationText, 
                        { color: theme.text }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Project: {selectedProjectTitle}
                    </Text>
                  </View>
                )}
                
                {selectedTaskId && (
                  <View 
                    style={styles.associationItem}
                    accessible={true}
                    accessibilityRole="text"
                  >
                    <Ionicons name="checkbox-outline" size={scaleWidth(16)} color={buttonColor} />
                    <Text 
                      style={[
                        styles.associationText, 
                        { color: theme.text }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Task: {selectedTaskTitle}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Advanced Options Toggle */}
            <TouchableOpacity 
              style={[
                styles.advancedOptionsButton, 
                { 
                  borderColor: theme.border,
                  minHeight: scaleHeight(44)
                }
              ]} 
              onPress={toggleAdvancedOptions}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Toggle advanced options"
              accessibilityHint={showAdvancedOptions ? "Hide additional options" : "Show additional options"}
              accessibilityState={{ expanded: showAdvancedOptions }}
            >
              <Text 
                style={[
                  styles.advancedOptionsText, 
                  { color: buttonColor }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
              </Text>
              <Ionicons 
                name={showAdvancedOptions ? 'chevron-up-outline' : 'chevron-down-outline'} 
                size={scaleWidth(18)} 
                color={buttonColor} 
              />
            </TouchableOpacity>
            
            {/* Advanced Options Section - Animated */}
            <Animated.View 
              style={[
                styles.advancedOptionsContainer,
                {
                  opacity: advancedOptionsHeight,
                  maxHeight: advancedOptionsHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1000] // Large enough to fit all content
                  }),
                  overflow: 'hidden'
                }
              ]}
              accessible={showAdvancedOptions}
              accessibilityRole="group"
              accessibilityLabel="Advanced options"
            >
              {/* Goal Selection */}
              <View style={styles.selectionSection}>
                <Text 
                  style={[
                    styles.sectionLabel, 
                    { color: theme.textSecondary }
                  ]}
                  maxFontSizeMultiplier={1.5}
                  accessibilityRole="header"
                >
                  Associate with Goal (Optional)
                </Text>
                
                <View style={styles.selectionContainer}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.selectionScrollContent}
                    keyboardShouldPersistTaps="handled"
                    accessibilityRole="scrollbar"
                  >
                    {/* None option */}
                    <TouchableOpacity
                      style={[
                        styles.selectionItem,
                        !selectedGoalId && styles.selectionItemSelected,
                        { 
                          backgroundColor: !selectedGoalId ? buttonColor + '20' : theme.inputBackground,
                          borderColor: !selectedGoalId ? buttonColor : theme.border,
                          minHeight: scaleHeight(36),
                          minWidth: scaleWidth(44)
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
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="No goal"
                      accessibilityHint="Remove association with any goal"
                      accessibilityState={{ selected: !selectedGoalId }}
                    >
                      <Ionicons 
                        name="close-circle-outline" 
                        size={scaleWidth(16)} 
                        color={!selectedGoalId ? buttonColor : theme.textSecondary} 
                      />
                      <Text 
                        style={[
                          styles.selectionItemText, 
                          { color: !selectedGoalId ? buttonColor : theme.text }
                        ]}
                        maxFontSizeMultiplier={1.3}
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
                            minHeight: scaleHeight(36),
                            minWidth: scaleWidth(44)
                          }
                        ]}
                        onPress={() => handleSelectGoal(goal)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Goal: ${goal.title}`}
                        accessibilityHint={`Associate time block with goal: ${goal.title}`}
                        accessibilityState={{ selected: selectedGoalId === goal.id }}
                      >
                        <Ionicons 
                          name="flag-outline" 
                          size={scaleWidth(16)} 
                          color={selectedGoalId === goal.id ? buttonColor : theme.textSecondary} 
                        />
                        <Text 
                          style={[
                            styles.selectionItemText, 
                            { color: selectedGoalId === goal.id ? buttonColor : theme.text }
                          ]}
                          maxFontSizeMultiplier={1.3}
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
                        accessible={true}
                        accessibilityRole="text"
                      >
                        <Text 
                          style={[
                            styles.noItemsText, 
                            { color: theme.textSecondary }
                          ]}
                          maxFontSizeMultiplier={1.3}
                        >
                          No goals available
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
              
              {/* Project Selection - Only shown if a goal is selected */}
              {selectedGoalId && (
                <View style={styles.selectionSection}>
                  <Text 
                    style={[
                      styles.sectionLabel, 
                      { color: theme.textSecondary }
                    ]}
                    maxFontSizeMultiplier={1.5}
                    accessibilityRole="header"
                  >
                    Associate with Project (Optional)
                  </Text>
                  
                  <View style={styles.selectionContainer}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.selectionScrollContent}
                      keyboardShouldPersistTaps="handled"
                      accessibilityRole="scrollbar"
                    >
                      {/* None option */}
                      <TouchableOpacity
                        style={[
                          styles.selectionItem,
                          !selectedProjectId && styles.selectionItemSelected,
                          { 
                            backgroundColor: !selectedProjectId ? buttonColor + '20' : theme.inputBackground,
                            borderColor: !selectedProjectId ? buttonColor : theme.border,
                            minHeight: scaleHeight(36),
                            minWidth: scaleWidth(44)
                          }
                        ]}
                        onPress={() => {
                          setSelectedProjectId(null);
                          setSelectedProjectTitle('');
                          setSelectedTaskId(null);
                          setSelectedTaskTitle('');
                        }}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="No project"
                        accessibilityHint="Remove association with any project"
                        accessibilityState={{ selected: !selectedProjectId }}
                      >
                        <Ionicons 
                          name="close-circle-outline" 
                          size={scaleWidth(16)} 
                          color={!selectedProjectId ? buttonColor : theme.textSecondary} 
                        />
                        <Text 
                          style={[
                            styles.selectionItemText, 
                            { color: !selectedProjectId ? buttonColor : theme.text }
                          ]}
                          maxFontSizeMultiplier={1.3}
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
                              minHeight: scaleHeight(36),
                              minWidth: scaleWidth(44)
                            }
                          ]}
                          onPress={() => handleSelectProject(project)}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Project: ${project.title}`}
                          accessibilityHint={`Associate time block with project: ${project.title}`}
                          accessibilityState={{ selected: selectedProjectId === project.id }}
                        >
                          <Ionicons 
                            name="folder-outline" 
                            size={scaleWidth(16)} 
                            color={selectedProjectId === project.id ? buttonColor : theme.textSecondary} 
                          />
                          <Text 
                            style={[
                              styles.selectionItemText, 
                              { color: selectedProjectId === project.id ? buttonColor : theme.text }
                            ]}
                            maxFontSizeMultiplier={1.3}
                            numberOfLines={1}
                          >
                            {project.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      
                      {/* No projects message */}
                      {filteredProjects.length === 0 && (
                        <View 
                          style={[
                            styles.noItemsMessage, 
                            { backgroundColor: theme.inputBackground }
                          ]}
                          accessible={true}
                          accessibilityRole="text"
                        >
                          <Text 
                            style={[
                              styles.noItemsText, 
                              { color: theme.textSecondary }
                            ]}
                            maxFontSizeMultiplier={1.3}
                          >
                            No projects for this goal
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </View>
              )}
              
              {/* Task Selection - Only shown if a project is selected */}
              {selectedProjectId && (
                <View style={styles.selectionSection}>
                  <Text 
                    style={[
                      styles.sectionLabel, 
                      { color: theme.textSecondary }
                    ]}
                    maxFontSizeMultiplier={1.5}
                    accessibilityRole="header"
                  >
                    Associate with Task (Optional)
                  </Text>
                  
                  <View style={styles.selectionContainer}>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.selectionScrollContent}
                      keyboardShouldPersistTaps="handled"
                      accessibilityRole="scrollbar"
                    >
                      {/* None option */}
                      <TouchableOpacity
                        style={[
                          styles.selectionItem,
                          !selectedTaskId && styles.selectionItemSelected,
                          { 
                            backgroundColor: !selectedTaskId ? buttonColor + '20' : theme.inputBackground,
                            borderColor: !selectedTaskId ? buttonColor : theme.border,
                            minHeight: scaleHeight(36),
                            minWidth: scaleWidth(44)
                          }
                        ]}
                        onPress={() => {
                          setSelectedTaskId(null);
                          setSelectedTaskTitle('');
                        }}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="No task"
                        accessibilityHint="Remove association with any task"
                        accessibilityState={{ selected: !selectedTaskId }}
                      >
                        <Ionicons 
                          name="close-circle-outline" 
                          size={scaleWidth(16)} 
                          color={!selectedTaskId ? buttonColor : theme.textSecondary} 
                        />
                        <Text 
                          style={[
                            styles.selectionItemText, 
                            { color: !selectedTaskId ? buttonColor : theme.text }
                          ]}
                          maxFontSizeMultiplier={1.3}
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
                              minHeight: scaleHeight(36),
                              minWidth: scaleWidth(44)
                            }
                          ]}
                          onPress={() => handleSelectTask(task)}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Task: ${task.title}`}
                          accessibilityHint={`Associate time block with task: ${task.title}`}
                          accessibilityState={{ selected: selectedTaskId === task.id }}
                        >
                          <Ionicons 
                            name="checkbox-outline" 
                            size={scaleWidth(16)} 
                            color={selectedTaskId === task.id ? buttonColor : theme.textSecondary} 
                          />
                          <Text 
                            style={[
                              styles.selectionItemText, 
                              { color: selectedTaskId === task.id ? buttonColor : theme.text }
                            ]}
                            maxFontSizeMultiplier={1.3}
                            numberOfLines={1}
                          >
                            {task.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      
                      {/* No tasks message */}
                      {filteredTasks.length === 0 && (
                        <View 
                          style={[
                            styles.noItemsMessage, 
                            { backgroundColor: theme.inputBackground }
                          ]}
                          accessible={true}
                          accessibilityRole="text"
                        >
                          <Text 
                            style={[
                              styles.noItemsText, 
                              { color: theme.textSecondary }
                            ]}
                            maxFontSizeMultiplier={1.3}
                          >
                            No tasks for this project
                          </Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </View>
              )}
              
              {/* Location Field */}
              <View>
                <Text 
                  style={[
                    styles.label, 
                    { color: theme.textSecondary }
                  ]}
                  maxFontSizeMultiplier={1.5}
                  accessibilityRole="text"
                >
                  Location (Optional)
                </Text>
                <TouchableOpacity
                  style={[
                    styles.clickableInput,
                    { 
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.border,
                      minHeight: scaleHeight(48)
                    }
                  ]}
                  onPress={() => setShowLocationPopup(true)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Location input"
                  accessibilityHint="Tap to enter location"
                >
                  <Text 
                    style={[
                      styles.clickableInputText, 
                      { 
                        color: location ? theme.text : theme.textSecondary 
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                    numberOfLines={1}
                  >
                    {location || 'Enter location'}
                  </Text>
                  <Ionicons name="create-outline" size={scaleWidth(18)} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              
              {/* Notes Field */}
              <View>
                <Text 
                  style={[
                    styles.label, 
                    { color: theme.textSecondary }
                  ]}
                  maxFontSizeMultiplier={1.5}
                  accessibilityRole="text"
                >
                  Notes (Optional)
                </Text>
                <TouchableOpacity
                  style={[
                    styles.clickableInput,
                    styles.clickableTextArea,
                    { 
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.border,
                      minHeight: scaleHeight(80),
                      alignItems: 'flex-start'
                    }
                  ]}
                  onPress={() => setShowNotesPopup(true)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Notes input"
                  accessibilityHint="Tap to enter notes"
                >
                  <View style={styles.clickableTextAreaContent}>
                    <Text 
                      style={[
                        styles.clickableInputText, 
                        { 
                          color: notes ? theme.text : theme.textSecondary,
                          flex: 1
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                      numberOfLines={3}
                    >
                      {notes || 'Enter notes'}
                    </Text>
                    <Ionicons 
                      name="create-outline" 
                      size={scaleWidth(18)} 
                      color={theme.textSecondary}
                      style={styles.clickableTextAreaIcon}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </Animated.View>
            
            <TouchableOpacity 
              style={[
                styles.addButton, 
                { 
                  backgroundColor: buttonColor,
                  minHeight: scaleHeight(48)
                }
              ]}
              onPress={handleAddTimeBlock}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Schedule time block"
              accessibilityHint="Creates the time block with the entered information"
            >
              <Text 
                style={styles.addButtonText}
                maxFontSizeMultiplier={1.3}
              >
                Schedule Time Block
              </Text>
            </TouchableOpacity>
            
            {/* Add extra padding at the bottom for better scrolling */}
            <View style={styles.bottomPadding} />
          </ScrollView>
          
          {/* Date/Time Pickers */}
          {(showStartDatePicker || showStartTimePicker || showEndTimePicker) && Platform.OS === 'ios' && (
            <View 
              style={[
                styles.pickerContainer, 
                { 
                  backgroundColor: theme.card,
                  paddingBottom: safeSpacing.bottom
                }
              ]}
              accessibilityViewIsModal={true}
              accessible={true}
              accessibilityLabel={
                showStartDatePicker ? "Date picker" : 
                showStartTimePicker ? "Start time picker" : 
                "End time picker"
              }
            >
              <View style={styles.pickerHeader}>
                <TouchableOpacity 
                  onPress={() => {
                    setShowStartDatePicker(false);
                    setShowStartTimePicker(false);
                    setShowEndTimePicker(false);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                  accessibilityHint="Cancel date or time selection"
                  style={{ minWidth: scaleWidth(44), minHeight: scaleHeight(44) }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text 
                    style={[
                      styles.pickerCancel, 
                      { color: theme.textSecondary }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => {
                    setShowStartDatePicker(false);
                    setShowStartTimePicker(false);
                    setShowEndTimePicker(false);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Done"
                  accessibilityHint="Confirm date or time selection"
                  style={{ minWidth: scaleWidth(44), minHeight: scaleHeight(44) }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text 
                    style={[
                      styles.pickerDone, 
                      { color: buttonColor }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={showStartDatePicker || showStartTimePicker ? startDate : endDate}
                mode={pickerMode}
                display="spinner"
                onChange={handleDateChange}
                style={styles.picker}
                textColor={theme.text}
                minimumDate={pickerMode === 'time' && showEndTimePicker ? startDate : undefined}
                accessibilityLabel={
                  pickerMode === 'date' ? "Select date" : 
                  showStartTimePicker ? "Select start time" : 
                  "Select end time"
                }
              />
            </View>
          )}
          
          {/* Android Pickers */}
          {Platform.OS === 'android' && (
            <>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  accessibilityLabel="Select date"
                />
              )}
              {showStartTimePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="time"
                  display="default"
                  onChange={handleDateChange}
                  accessibilityLabel="Select start time"
                />
              )}
              {showEndTimePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="time"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={startDate}
                  accessibilityLabel="Select end time"
                />
              )}
            </>
          )}
          
          {/* Text Input Popups */}
          <TextInputPopup
            visible={showLocationPopup}
            onClose={() => setShowLocationPopup(false)}
            onSave={setLocation}
            title="Location"
            value={location}
            placeholder="Enter location for this time block"
            multiline={false}
            maxLength={100}
          />
          
          <TextInputPopup
            visible={showNotesPopup}
            onClose={() => setShowNotesPopup(false)}
            onSave={setNotes}
            title="Notes"
            value={notes}
            placeholder="Enter any additional notes or details"
            multiline={true}
            maxLength={500}
          />
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
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
  gestureContainer: {
    justifyContent: 'flex-end'
  },
  keyboardContainer: {
    justifyContent: 'flex-end'
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent'
  },
  modalContent: {
    borderTopLeftRadius: scaleWidth(16),
    borderTopRightRadius: scaleWidth(16),
    paddingBottom: Platform.OS === 'ios' ? scaleHeight(30) : scaleHeight(16),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m
  },
  modalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold'
  },
  closeButton: {
    padding: spacing.xxxs
  },
  formContainer: {
    marginBottom: Platform.OS === 'ios' ? 0 : spacing.m
  },
  scrollContent: {
    paddingBottom: spacing.l
  },
  label: {
    fontSize: fontSizes.s,
    marginBottom: spacing.xs
  },
  input: {
    borderWidth: 1,
    borderRadius: scaleWidth(8),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: fontSizes.m,
    marginBottom: spacing.m
  },
  textArea: {
    paddingTop: spacing.s
  },
  // Clickable input styles
  clickableInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: scaleWidth(8),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    marginBottom: spacing.m,
  },
  clickableInputText: {
    fontSize: fontSizes.m,
    flex: 1,
  },
  clickableTextArea: {
    paddingVertical: spacing.s,
  },
  clickableTextAreaContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  clickableTextAreaIcon: {
    marginTop: spacing.xxxs,
    marginLeft: spacing.xs,
  },
  // Switch styles
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.m
  },
  switchLabel: {
    fontSize: fontSizes.m,
    fontWeight: '500'
  },
  // Date and time styles
  dateTimeSection: {
    marginVertical: spacing.xs,
    marginBottom: spacing.m
  },
  sectionLabel: {
    fontSize: fontSizes.s,
    marginBottom: spacing.xs
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: scaleWidth(8),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    marginBottom: spacing.m
  },
  dateTimeText: {
    fontSize: fontSizes.m,
    marginLeft: spacing.xs
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.m
  },
  timeLabel: {
    fontSize: fontSizes.s,
    flex: 1
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: scaleWidth(8),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    flex: 1.5
  },
  // Association card styles (for read-only goal/project/task info)
  associationCard: {
    borderWidth: 1,
    borderRadius: scaleWidth(8),
    padding: spacing.m,
    marginBottom: spacing.m
  },
  associationTitle: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
    marginBottom: spacing.xs
  },
  associationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xxxs
  },
  associationText: {
    fontSize: fontSizes.xs,
    marginLeft: spacing.xs
  },
  // Advanced options toggle
  advancedOptionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
    borderRadius: scaleWidth(8),
    borderStyle: 'dashed'
  },
  advancedOptionsText: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
    marginRight: spacing.xxxs
  },
  advancedOptionsContainer: {
    marginBottom: spacing.m
  },
  // Selection styles for goals/projects/tasks
  selectionSection: {
    marginBottom: spacing.m
  },
  selectionContainer: {
    marginBottom: spacing.xs
  },
  selectionScrollContent: {
    paddingVertical: spacing.xxxs,
    paddingHorizontal: spacing.xxxs
  },
  selectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: scaleWidth(20),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs
  },
  selectionItemSelected: {
    borderWidth: 1
  },
  selectionItemText: {
    fontSize: fontSizes.xs,
    marginLeft: spacing.xxxs
  },
  noItemsMessage: {
    padding: spacing.m,
    borderRadius: scaleWidth(8),
    alignItems: 'center'
  },
  noItemsText: {
    fontSize: fontSizes.xs
  },
  // Button
  addButton: {
    borderRadius: scaleWidth(8),
    paddingVertical: spacing.m,
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.m
  },
  addButtonText: {
    color: '#fff',
    fontSize: fontSizes.m,
    fontWeight: '600'
  },
  // Picker styles
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: scaleWidth(16),
    borderTopRightRadius: scaleWidth(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)'
  },
  pickerCancel: {
    fontSize: fontSizes.m
  },
  pickerDone: {
    fontSize: fontSizes.m,
    fontWeight: '600'
  },
  picker: {
    height: scaleHeight(200)
  },
  bottomPadding: {
    height: scaleHeight(40)
  }
});

export default AddTimeBlockModal;