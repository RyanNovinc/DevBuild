// src/components/TimeBlockExactModal.js - EXACT copy of TimeBlock screen as modal
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { FREE_PLAN_LIMITS } from '../services/SubscriptionConstants';
import { useNotification } from '../context/NotificationContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import debug logger for focused debugging
import { debugLogger } from '../utils/debugLogger';

// Import responsive utilities
import responsive from '../utils/responsive';
const {
  spacing,
  fontSizes,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  scaleWidth,
  scaleHeight,
  useSafeSpacing,
  useScreenDimensions,
  useIsLandscape,
  accessibility,
  ensureAccessibleTouchTarget
} = responsive;

// Import helper functions that TimeBlockForm needs
import { 
  formatDate, 
  getWeekDates, 
  getMonthDates, 
  getDayName, 
  getMonthName,
  formatTime 
} from '../utils/helpers';

// Import the EXACT TimeBlockForm that works
import TimeBlockForm from '../screens/TimeBlockScreen/TimeBlockForm';

// Import other components that TimeBlockForm needs
import ColorPicker from '../screens/TimeBlockScreen/ColorPicker';
import CustomDateTimePicker from '../screens/TimeBlockScreen/CustomDateTimePicker';
import MilestoneSelector from '../screens/TimeBlockScreen/MilestoneSelector';
import TaskSelector from '../screens/TimeBlockScreen/TaskSelector';
import UnsavedChangesModal from '../screens/TimeBlockScreen/UnsavedChangesModal';
import GoalRequiredModal from '../screens/TimeBlockScreen/GoalRequiredModal';
import TextInputModal from './TextInputModal';

const TimeBlockExactModal = ({
  visible,
  onClose,
  onSave,
  timeBlockData = null,
  initialDate = new Date(),
  showUpgradePrompt // Function to show upgrade modal
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { 
    mainGoals = [], 
    milestones = [], 
    tasks = [], 
    goals = [],
    projects = [],
    addTimeBlock, 
    addTimeBlockSkipConflicts, 
    updateTimeBlock, 
    updateTimeBlockSeries, 
    createNewTimeBlockSeries, 
    checkTimeBlockConflicts, 
    checkRecurringTimeBlockConflicts, 
    deleteTimeBlock, 
    timeBlocks = [] 
  } = useAppContext();
  const notification = useNotification ? useNotification() : { 
    showSuccess: (msg) => console.log(msg),
    showError: (msg) => console.error(msg)
  };
  
  // Get safe area insets with responsive spacing
  const safeSpacing = useSafeSpacing();
  
  // Get screen dimensions and orientation
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  
  // Ref for scrollView to handle keyboard focusing
  const scrollViewRef = useRef(null);
  
  // Check if using dark mode
  const isDarkMode = theme.background === '#000000';
  
  const mode = timeBlockData ? 'edit' : 'create';
  const isCreating = mode === 'create';

  // Debug AI data and AppContext on component mount
  useEffect(() => {
    debugLogger.modal('🔍 TimeBlockExactModal mounted with:');
    debugLogger.modal('🔍 - timeBlockData:', timeBlockData);
    debugLogger.modal('🔍 - initialDate:', initialDate);
    
    // Debug AppContext data
    debugLogger.modal('🔍 AppContext data:');
    debugLogger.modal('🔍 - mainGoals:', mainGoals?.length || 0);
    debugLogger.modal('🔍 - goals:', goals?.length || 0);
    debugLogger.modal('🔍 - milestones:', milestones?.length || 0);
    debugLogger.modal('🔍 - tasks:', tasks?.length || 0);
    
    if (timeBlockData) {
      debugLogger.recurring('🔍 Raw timeBlockData recurring settings:', {
        isRepeating: timeBlockData.isRepeating,
        repeatFrequency: timeBlockData.repeatFrequency,
        repeatIndefinitely: timeBlockData.repeatIndefinitely,
        repeatUntil: timeBlockData.repeatUntil
      });
      debugLogger.date('🔍 Raw timeBlockData time settings:', {
        startTime: timeBlockData.startTime,
        startTimeType: typeof timeBlockData.startTime,
        endTime: timeBlockData.endTime,
        endTimeType: typeof timeBlockData.endTime
      });
    } else {
      debugLogger.modal('🔍 No timeBlockData provided, using initialDate fallback');
    }
  }, [timeBlockData, initialDate, mainGoals, goals, milestones, projects, tasks]);

  // Animation values
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const saveButtonScale = useRef(new Animated.Value(1)).current;
  const contentFadeIn = useRef(new Animated.Value(0)).current;
  
  // Track if changes were made
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // For the unsaved changes modal
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  
  // For the goal required modal
  const [showGoalRequiredModal, setShowGoalRequiredModal] = useState(false);
  const [goalRequiredModalType, setGoalRequiredModalType] = useState('milestone');
  
  // For title editing modal
  const [showTitleEditModal, setShowTitleEditModal] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  
  // For delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // For series vs instance editing
  const [isEditingSeries, setIsEditingSeries] = useState(false);
  const [showSeriesInfoModal, setShowSeriesInfoModal] = useState(false);
  
  // For conflict warning modal
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictDetails, setConflictDetails] = useState('');
  const [conflictData, setConflictData] = useState(null);
  
  // Function to get all tasks
  const getAllTasks = () => {
    if (!Array.isArray(tasks)) return [];
    return tasks;
  };
  
  // Function to get tasks for the currently selected milestone
  const getMilestonesTasks = () => {
    if (!Array.isArray(tasks) || !selectedMilestone) return [];
    
    // Filter tasks by milestone ID and exclude completed ones
    const milestoneTasks = tasks.filter(task => {
      return task.milestoneId === selectedMilestone.id && !task.completed;
    });
    
    console.log(`Found ${milestoneTasks.length} tasks for milestone "${selectedMilestone.title}":`, milestoneTasks);
    return milestoneTasks;
  };

  // Function to get milestones for selected goal
  const getMilestonesForGoal = () => {
    if (!domain) return [];
    
    const allMilestones = milestones || projects || [];
    
    // Handle special case: Standalone Milestones
    if (domain === 'Standalone Milestones') {
      const standaloneMilestones = allMilestones.filter(milestone => {
        // Check for any falsy goalId value - same logic as LifePlanOverviewScreen
        const goalId = milestone.goalId;
        const hasNoGoal = 
          goalId === null ||
          goalId === undefined ||
          goalId === '' ||
          goalId === 'undefined' ||
          goalId === 'null';
        return hasNoGoal;
      });
      
      console.log(`Found ${standaloneMilestones.length} standalone milestones:`, standaloneMilestones);
      return standaloneMilestones;
    }
    
    // Handle special case: Standalone Tasks (no milestones available)
    if (domain === 'Standalone Tasks') {
      console.log('Standalone Tasks selected - no milestones available');
      return [];
    }
    
    // Find the selected goal by title (for regular goals)
    const allGoals = mainGoals || goals || [];
    const selectedGoal = allGoals.find(goal => goal.title === domain);
    
    if (!selectedGoal) {
      console.log('No goal found with title:', domain);
      return [];
    }
    
    // Return milestones for this goal using goalId
    const goalMilestones = allMilestones.filter(milestone => 
      milestone.goalId === selectedGoal.id
    );
    
    console.log(`Found ${goalMilestones.length} milestones for goal "${domain}":`, goalMilestones);
    return goalMilestones;
  };
  
  // Tab state
  const [activeTab, setActiveTab] = useState(timeBlockData?.isGeneralActivity ? 'general' : 'goal');
  
  // State for goal-focused blocks  
  const [title, setTitle] = useState(timeBlockData?.title || '');
  // IMPORTANT: Don't prefill domain from AI - let user choose "No Specific Goal" by default
  const [domain, setDomain] = useState(''); // Always start empty - user should choose
  const [domainColor, setDomainColor] = useState(timeBlockData?.color || '#4CAF50');
  const [selectedMilestone, setSelectedMilestone] = useState(
    timeBlockData?.milestoneTitle ? { title: timeBlockData.milestoneTitle } : null
  );
  const [selectedTask, setSelectedTask] = useState(
    timeBlockData?.taskTitle ? { title: timeBlockData.taskTitle } : null
  );
  
  // State for general activity blocks
  const [category, setCategory] = useState(timeBlockData?.category || 'Personal');
  const [customColor, setCustomColor] = useState(timeBlockData?.customColor || '#4285F4');
  const [customIcon, setCustomIcon] = useState(timeBlockData?.customIcon || null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  
  // Predefined colors to choose from
  const colorOptions = [
    '#4285F4', // Blue
    '#EA4335', // Red
    '#34A853', // Green
    '#FBBC05', // Yellow
    '#9C27B0', // Purple
    '#FF9800', // Orange
    '#00BCD4', // Cyan
    '#795548', // Brown
    '#607D8B', // Grey-blue
    '#673AB7'  // Deep Purple
  ];
  
  // Helper function to parse AI time strings
  const parseAITime = (timeString, fallbackDate, debugName = '') => {
    debugLogger.timeblock(`parseAITime ${debugName}:`, { 
      timeString, 
      timeStringType: typeof timeString,
      fallbackDate,
      fallbackDateType: typeof fallbackDate 
    });
    
    if (!timeString) {
      debugLogger.timeblock(`${debugName}: No timeString provided, using fallback:`, fallbackDate);
      return fallbackDate;
    }
    
    try {
      // Handle "YYYY-MM-DD HH:MM" format from AI
      if (typeof timeString === 'string') {
        debugLogger.timeblock(`${debugName}: Parsing string:`, timeString);
        
        // Replace space with T and add seconds for proper ISO format
        const isoString = timeString.includes('T') 
          ? timeString 
          : timeString.replace(' ', 'T') + ':00';
        
        debugLogger.timeblock(`${debugName}: ISO string created:`, isoString);
        
        const parsed = new Date(isoString);
        debugLogger.timeblock(`${debugName}: Date constructor result:`, parsed);
        debugLogger.timeblock(`${debugName}: parsed.getTime():`, parsed.getTime());
        debugLogger.timeblock(`${debugName}: isNaN(parsed.getTime()):`, isNaN(parsed.getTime()));
        
        // If parsing failed or resulted in invalid date, use fallback
        if (isNaN(parsed.getTime())) {
          debugLogger.timeblock(`${debugName}: FAILED to parse - using fallback:`, fallbackDate);
          return fallbackDate;
        }
        
        debugLogger.timeblock(`${debugName}: SUCCESS - returning parsed date:`, parsed);
        debugLogger.timeblock(`${debugName}: SUCCESS - parsed date formatted:`, parsed.toISOString());
        return parsed;
      }
      
      // If already a Date object, return as is
      if (timeString instanceof Date) {
        debugLogger.timeblock(`${debugName}: Already a Date object:`, timeString);
        return timeString;
      }
      
      debugLogger.timeblock(`${debugName}: Unknown format, using fallback:`, fallbackDate);
      return fallbackDate;
    } catch (error) {
      debugLogger.timeblock(`${debugName}: ERROR parsing AI time:`, error, 'timeString:', timeString);
      return fallbackDate;
    }
  };

  // Common state
  const [startTime, setStartTime] = useState(initialDate);
  const [endTime, setEndTime] = useState(new Date(initialDate.getTime() + 60 * 60 * 1000));
  const [location, setLocation] = useState(timeBlockData?.location || '');
  const [notes, setNotes] = useState(timeBlockData?.notes || '');
  const [isCompleted, setIsCompleted] = useState(false);
  
  // State for milestone selection modal
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  
  // State for task selection modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  
  // State for color selection modal
  const [showColorModal, setShowColorModal] = useState(false);
  
  // State for date and time pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  
  // Repetition state with debugging
  const [isRepeating, setIsRepeating] = useState(() => {
    const value = timeBlockData?.isRepeating || false;
    debugLogger.recurring('🔄 Initializing isRepeating:', value, 'from timeBlockData.isRepeating:', timeBlockData?.isRepeating);
    return value;
  });
  
  const [repeatFrequency, setRepeatFrequency] = useState(() => {
    const value = timeBlockData?.repeatFrequency || 'weekly';
    debugLogger.recurring('🔄 Initializing repeatFrequency:', value, 'from timeBlockData.repeatFrequency:', timeBlockData?.repeatFrequency);
    return value;
  });
  
  const [repeatUntil, setRepeatUntil] = useState(() => {
    const value = timeBlockData?.repeatUntil ? new Date(timeBlockData.repeatUntil) : null;
    debugLogger.recurring('🔄 Initializing repeatUntil:', value, 'from timeBlockData.repeatUntil:', timeBlockData?.repeatUntil);
    return value;
  });
  
  const [repeatIndefinitely, setRepeatIndefinitely] = useState(() => {
    const value = timeBlockData?.repeatIndefinitely !== undefined ? timeBlockData.repeatIndefinitely : true;
    debugLogger.recurring('🔄 Initializing repeatIndefinitely:', value, 'from timeBlockData.repeatIndefinitely:', timeBlockData?.repeatIndefinitely);
    return value;
  });
  const [showRepeatUntilPicker, setShowRepeatUntilPicker] = useState(false);

  // Additional state that TimeBlockForm needs
  const [timeError, setTimeError] = useState('');
  const [enableNotification, setEnableNotification] = useState(false); // Default to OFF
  const [notificationTime, setNotificationTime] = useState('10');
  const [notificationId, setNotificationId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Additional notification state
  const [showCustomTimeInput, setShowCustomTimeInput] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  // Success message state for persistent display
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Update state when timeBlockData changes
  useEffect(() => {
    if (timeBlockData) {
      debugLogger.modal('🔄 Updating state from timeBlockData:', timeBlockData);
      
      // Update title
      if (timeBlockData.title) {
        setTitle(timeBlockData.title);
      }
      
      // Update start time
      if (timeBlockData.startTime) {
        const parsedStartTime = parseAITime(timeBlockData.startTime, initialDate, 'startTime');
        setStartTime(parsedStartTime);
      }
      
      // Update end time
      if (timeBlockData.endTime) {
        const fallbackEnd = new Date(initialDate.getTime() + 60 * 60 * 1000);
        const parsedEndTime = parseAITime(timeBlockData.endTime, fallbackEnd, 'endTime');
        setEndTime(parsedEndTime);
      }
      
      // Update recurring settings
      if (timeBlockData.isRepeating !== undefined) {
        setIsRepeating(timeBlockData.isRepeating);
      }
      
      if (timeBlockData.repeatFrequency) {
        setRepeatFrequency(timeBlockData.repeatFrequency);
      }
      
      if (timeBlockData.repeatIndefinitely !== undefined) {
        setRepeatIndefinitely(timeBlockData.repeatIndefinitely);
      }
      
      // Check if this timeblock was previously created and show success message
      debugLogger.modal('🔍 Checking for success message data:', {
        isCreated: timeBlockData.isCreated,
        successMessage: timeBlockData.successMessage,
        fullData: timeBlockData
      });
      
      if (timeBlockData.isCreated && timeBlockData.successMessage) {
        setShowSuccessMessage(true);
        setSuccessMessage(timeBlockData.successMessage);
        debugLogger.modal('✅ Displaying persistent success message:', timeBlockData.successMessage);
      } else {
        debugLogger.modal('❌ No success message data found');
      }
      
      debugLogger.modal('✅ State update complete');
    }
  }, [timeBlockData]);
  
  // Helper functions for TimeBlockForm
  const formatCustomMinutes = (minutes) => {
    const num = parseInt(minutes);
    if (isNaN(num) || num <= 0) return 'Custom time before';
    if (num < 60) return `${num} minutes before`;
    const hours = Math.floor(num / 60);
    const mins = num % 60;
    return mins > 0 ? `${hours}h ${mins}m before` : `${hours} hour${hours > 1 ? 's' : ''} before`;
  };
  
  const navigateToGoalSettings = () => {
    console.log('Navigate to goal settings - not implemented in modal');
  };
  
  const scrollToInput = () => {
    // Not needed in modal context
  };
  
  const validateCustomMinutes = (value) => {
    const num = parseInt(value);
    return !isNaN(num) && num > 0;
  };

  // Function to handle goal selection (like TimeBlockForm)
  const handleGoalSelect = (goal) => {
    console.log('Goal selected:', goal);
    if (goal === null) {
      // Keep on goal tab but clear domain for "No Specific Goal"
      setDomain('');
      setDomainColor('#4CAF50'); // Default color
      setSelectedMilestone(null); // Clear milestone selection
      setSelectedTask(null); // Clear task selection
    } else {
      // Switch to goal tab when a specific goal is selected
      setActiveTab('goal');
      setDomain(goal.title);
      setDomainColor(goal.color || '#4CAF50');
      setSelectedMilestone(null); // Clear milestone selection when changing goals
      setSelectedTask(null); // Clear task selection when changing goals
    }
  };
  
  // Function to handle milestone selection - clear task when milestone changes
  const handleMilestoneSelect = (milestone) => {
    setSelectedMilestone(milestone);
    setSelectedTask(null); // Clear task selection when changing milestones
  };

  // Handler functions that TimeBlockForm expects
  const openMilestoneModal = () => setShowMilestoneModal(true);
  const openTaskModal = () => setShowTaskModal(true);
  const openColorModal = () => setShowColorModal(true);
  const openDatePicker = () => setShowDatePicker(true);
  const openStartTimePicker = () => setShowStartTimePicker(true);
  const openEndTimePicker = () => setShowEndTimePicker(true);
  const openRepeatUntilDatePicker = () => setShowRepeatUntilPicker(true);

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
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);
  
  // Handle close with animation
  const handleClose = () => {
    const screenHeight = Dimensions.get('window').height;
    
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      translateY.setValue(0);
      onClose();
    });
  };
  
  // Handle swipe gesture (using AddGoalModal pattern)
  const handleGestureEnd = (event) => {
    const { translationY, velocityY } = event.nativeEvent;
    const screenHeight = Dimensions.get('window').height;
    const dismissThreshold = screenHeight * 0.2;
    const fastSwipeVelocity = 1200;
    
    const shouldDismiss = translationY > dismissThreshold || velocityY > fastSwipeVelocity;
    
    if (shouldDismiss) {
      // Animate dismiss with reverse order
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
    } else {
      // Snap back to position
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 8
      }).start();
    }
  };
  
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  // Mock navigation object for TimeBlockForm
  const mockNavigation = {
    goBack: handleClose,
    navigate: () => {},
    setParams: () => {},
  };

  // Mock route object for TimeBlockForm  
  const mockRoute = {
    params: {
      mode: mode,
      timeBlock: timeBlockData,
      date: initialDate,
      isPremium: true // Assume premium for modal usage
    }
  };

  // Handle save button press
  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      // Validate input
      if (!title.trim()) {
        notification.showError('Please enter a title');
        setIsSaving(false);
        return;
      }
      
      // Check subscription limits before creating time block
      const { canAddMoreTimeBlocks, userSubscriptionStatus } = useAppContext();
      
      if (canAddMoreTimeBlocks && !canAddMoreTimeBlocks()) {
        if (showUpgradePrompt) {
          showUpgradePrompt(
            `You've reached the limit of ${FREE_PLAN_LIMITS.MAX_TIME_BLOCKS} time blocks per week in the free version. Upgrade to Pro for unlimited time blocks.`
          );
        }
        setIsSaving(false);
        return;
      }
      
      // Validate time
      if (startTime >= endTime) {
        setTimeError('End time must be after start time');
        setIsSaving(false);
        return;
      }
      
      // Clear any previous errors
      setTimeError('');
      
      // Animate save button
      Animated.sequence([
        Animated.timing(saveButtonScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(saveButtonScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
      
      // Build timeblock data
      const timeBlockData = {
        title: title.trim(),
        startTime,
        endTime,
        location: location.trim(),
        notes: notes.trim(),
        isCompleted,
        // Goal/Milestone/Task associations
        goalTitle: activeTab === 'goal' ? domain : '',
        milestoneTitle: selectedMilestone?.title || '',
        taskTitle: selectedTask?.title || '',
        // Category and color
        category: activeTab === 'general' ? category : '',
        color: activeTab === 'goal' ? domainColor : customColor,
        customIcon: activeTab === 'general' ? customIcon : null,
        // Recurring settings
        isRepeating,
        repeatFrequency,
        repeatIndefinitely,
        repeatUntil,
        // Additional data
        isGeneralActivity: activeTab === 'general',
        domain: activeTab === 'goal' ? domain : category,
        userTimezoneOffset: -(new Date().getTimezoneOffset() / 60)
      };
      
      // Call the save handler
      onSave(timeBlockData);
      handleClose();
      
    } catch (error) {
      console.error('Error saving timeblock:', error);
      notification.showError('Failed to save time block');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save from TimeBlockForm (legacy - kept for compatibility)
  const handleFormSave = (timeBlockData) => {
    onSave(timeBlockData);
    handleClose();
  };

  return (
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
        
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) {
              handleGestureEnd(event);
            }
          }}
        >
          <Animated.View style={styles.gestureContainer}>
            <KeyboardAvoidingView 
              style={styles.keyboardAvoidingView}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <Animated.View 
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: theme.background,
                    paddingBottom: insets.bottom,
                    transform: [
                      { translateY: Animated.add(slideAnim, translateY) }
                    ]
                  }
                ]}
              >
            {/* Swipe indicator */}
            <View style={[styles.swipeIndicator, { backgroundColor: theme.textSecondary + '40' }]} />
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <TouchableOpacity 
                  style={styles.titleContainer}
                  onPress={() => {
                    setTempTitle(title || '');
                    setShowTitleEditModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar" size={20} color={theme.primary} style={styles.titleIcon} />
                  <Text style={[styles.headerTitle, { color: title ? theme.text : theme.textSecondary }]}>
                    {title || 'Schedule Time Block'}
                  </Text>
                  <Ionicons name="pencil" size={16} color={theme.textSecondary} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
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
            </View>
            
            {/* Success Message for Previously Created Timeblocks */}
            {showSuccessMessage && (
              <View style={[styles.successMessageContainer, { backgroundColor: theme.success || '#4CAF50' }]}>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.successIcon} />
                <Text style={styles.successMessageText}>{successMessage}</Text>
                <TouchableOpacity
                  style={styles.successDismissButton}
                  onPress={() => setShowSuccessMessage(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
            
            {/* TimeBlockForm Content - EXACT copy */}
            <View style={styles.formContainer}>
              <TimeBlockForm
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                domain={domain}
                setDomain={setDomain}
                domainColor={domainColor}
                setDomainColor={setDomainColor}
                selectedMilestone={selectedMilestone}
                selectedTask={selectedTask}
                openMilestoneModal={openMilestoneModal}
                openTaskModal={openTaskModal}
                category={category}
                setCategory={setCategory}
                customColor={customColor}
                setCustomColor={setCustomColor}
                openColorModal={openColorModal}
                customIcon={customIcon}
                setCustomIcon={setCustomIcon}
                showIconPicker={showIconPicker}
                setShowIconPicker={setShowIconPicker}
                openDatePicker={openDatePicker}
                openStartTimePicker={openStartTimePicker}
                openEndTimePicker={openEndTimePicker}
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
                timeError={timeError}
                location={location}
                setLocation={setLocation}
                notes={notes}
                setNotes={setNotes}
                isCompleted={isCompleted}
                setIsCompleted={setIsCompleted}
                isRepeating={isRepeating}
                setIsRepeating={setIsRepeating}
                repeatFrequency={repeatFrequency}
                setRepeatFrequency={setRepeatFrequency}
                repeatIndefinitely={repeatIndefinitely}
                setRepeatIndefinitely={setRepeatIndefinitely}
                repeatUntil={repeatUntil}
                openRepeatUntilDatePicker={openRepeatUntilDatePicker}
                enableNotification={enableNotification}
                setEnableNotification={setEnableNotification}
                notificationTime={notificationTime}
                setNotificationTime={setNotificationTime}
                showCustomTimeInput={showCustomTimeInput}
                setShowCustomTimeInput={setShowCustomTimeInput}
                customMinutes={customMinutes}
                setCustomMinutes={setCustomMinutes}
                formatCustomMinutes={formatCustomMinutes}
                navigateToGoalSettings={navigateToGoalSettings}
                scrollToInput={scrollToInput}
                validateCustomMinutes={validateCustomMinutes}
                // Title state
                title={title}
                setTitle={setTitle}
                // Utility functions
                formatDate={formatDate}
                formatTime={formatTime}
                // Goal selection handler
                handleGoalSelect={handleGoalSelect}
                // AppContext data - pass goals, milestones, tasks
                availableGoals={mainGoals || goals || []}
                goalMilestones={getMilestonesForGoal()}
                milestoneItems={getMilestonesTasks()}
                allMilestones={milestones}
                allTasks={tasks}
                mainGoals={mainGoals}
                goals={goals}
                milestones={milestones}
                projects={projects}
                tasks={tasks}
                // Additional props
                theme={theme}
                isDarkMode={isDarkMode}
                colorOptions={colorOptions}
                hasUnsavedChanges={hasUnsavedChanges}
                setHasUnsavedChanges={setHasUnsavedChanges}
              />
            </View>

            {/* Save Button at Bottom */}
            <View style={styles.buttonContainer}>
              <Animated.View style={{ transform: [{ scale: saveButtonScale }] }}>
                <TouchableOpacity
                  style={[
                    styles.saveButtonBottom,
                    { backgroundColor: theme.primary },
                    isSaving && { opacity: 0.6 }
                  ]}
                  onPress={handleSave}
                  disabled={isSaving}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Schedule time block"
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveButtonBottomText}>
                      Schedule Time Block
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Include all the modals that TimeBlockForm needs */}
            <MilestoneSelector
              visible={showMilestoneModal}
              onClose={() => setShowMilestoneModal(false)}
              onSelectMilestone={handleMilestoneSelect}
              selectedMilestone={selectedMilestone}
              goalDomain={domain}
              milestones={getMilestonesForGoal()}
              theme={theme}
              isDarkMode={isDarkMode}
            />
            
            <TaskSelector
              visible={showTaskModal}
              onClose={() => setShowTaskModal(false)}
              onSelectTask={setSelectedTask}
              selectedTask={selectedTask}
              selectedMilestone={selectedMilestone}
              tasks={getMilestonesTasks()}
              theme={theme}
              isDarkMode={isDarkMode}
            />
            
            <ColorPicker
              visible={showColorModal}
              onClose={() => setShowColorModal(false)}
              onSelectColor={setCustomColor}
              selectedColor={customColor}
              colorOptions={colorOptions}
              theme={theme}
            />

            {/* Date and Time Pickers */}
            <CustomDateTimePicker
              visible={showDatePicker}
              onClose={() => setShowDatePicker(false)}
              onConfirm={(date) => {
                setStartDate(date);
                setShowDatePicker(false);
              }}
              initialValue={startTime}
              mode="date"
              theme={theme}
            />
            
            <CustomDateTimePicker
              visible={showStartTimePicker}
              onClose={() => setShowStartTimePicker(false)}
              onConfirm={(time) => {
                setStartTime(time);
                setShowStartTimePicker(false);
              }}
              initialValue={startTime}
              mode="time"
              theme={theme}
            />
            
            <CustomDateTimePicker
              visible={showEndTimePicker}
              onClose={() => setShowEndTimePicker(false)}
              onConfirm={(time) => {
                setEndTime(time);
                setShowEndTimePicker(false);
              }}
              initialValue={endTime}
              mode="time"
              theme={theme}
            />
            
            <CustomDateTimePicker
              visible={showRepeatUntilPicker}
              onClose={() => setShowRepeatUntilPicker(false)}
              onConfirm={(date) => {
                setRepeatUntil(date);
                setShowRepeatUntilPicker(false);
              }}
              initialValue={repeatUntil || new Date()}
              mode="date"
              theme={theme}
            />

            {/* Title Edit Modal - Revamped with better keyboard positioning */}
            <TextInputModal
              visible={showTitleEditModal}
              onClose={() => {
                setShowTitleEditModal(false);
                setTempTitle('');
              }}
              onSave={(newTitle) => {
                setTitle(newTitle);
                setShowTitleEditModal(false);
                setTempTitle('');
              }}
              title="Edit Title"
              placeholder="What would you like to focus on?"
              value={tempTitle}
              maxLength={100}
              keyboardType="default"
              autoCapitalize="sentences"
              primaryColor={activeTab === 'goal' ? domainColor : customColor}
            />
              </Animated.View>
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
  },
  backgroundTouchable: {
    flex: 1,
  },
  gestureContainer: {
    justifyContent: 'flex-end'
  },
  keyboardAvoidingView: {
    justifyContent: 'flex-end',
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16
  },
  modalContainer: {
    height: Dimensions.get('window').height * 0.75,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    paddingTop: 0,
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  saveButtonBottom: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  saveButtonBottomText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  successIcon: {
    marginRight: 12,
  },
  successMessageText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  successDismissButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default TimeBlockExactModal;