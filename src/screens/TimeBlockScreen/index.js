// src/screens/TimeBlockScreen/index.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Keyboard,
  BackHandler,
  Platform,
  Alert,
  Animated,
  Modal,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  cancelTimeBlockNotification 
} from '../../utils/NotificationHelper';
import { scheduleTimeBlockNotificationSimple } from '../../utils/ImmediateNotificationFix';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Import responsive utilities - using direct import of the entire module
import responsive from '../../utils/responsive';
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

// Import KeyboardAwareScrollView
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Import components
import ColorPicker from './ColorPicker';
import CustomDateTimePicker from './CustomDateTimePicker';
import MilestoneSelector from './MilestoneSelector';
import TaskSelector from './TaskSelector';
import TimeBlockForm from './TimeBlockForm';
import UnsavedChangesModal from './UnsavedChangesModal';
import GoalRequiredModal from './GoalRequiredModal';

const TimeBlockScreen = ({ route, navigation }) => {
  // Hide FloatingAI button when entering this screen
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.setAIButtonVisible) {
      window.setAIButtonVisible(false);
    }
    
    // Show it again when leaving this screen
    return () => {
      if (typeof window !== 'undefined' && window.setAIButtonVisible) {
        window.setAIButtonVisible(true);
      }
    };
  }, []);
  const { theme } = useTheme();
  const { mainGoals, milestones, tasks, addTimeBlock, addTimeBlockSkipConflicts, updateTimeBlock, updateTimeBlockSeries, createNewTimeBlockSeries, checkTimeBlockConflicts, checkRecurringTimeBlockConflicts, deleteTimeBlock, timeBlocks } = useAppContext();
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
  
  const { 
    mode, 
    timeBlock: initialTimeBlock, 
    date, 
    prefilledStartTime, 
    prefilledEndTime,
    prefilledTask,
    prefilledMilestone,
    prefilledGoal,
    prefilledTaskId,
    prefilledMilestoneId,
    prefilledGoalId
  } = route.params || { mode: 'create' };
  const isCreating = mode === 'create';

  // Animation values
  const saveButtonScale = useRef(new Animated.Value(1)).current;
  const contentFadeIn = useRef(new Animated.Value(0)).current;
  
  // Track if changes were made
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // For the unsaved changes modal
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  
  // For the goal required modal
  const [showGoalRequiredModal, setShowGoalRequiredModal] = useState(false);
  const [goalRequiredModalType, setGoalRequiredModalType] = useState('milestone'); // 'milestone' or 'task'
  
  // For title editing modal
  const [showTitleEditModal, setShowTitleEditModal] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  
  // For delete confirmation (similar to DayView pattern)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  // For series vs instance editing
  const [isEditingSeries, setIsEditingSeries] = useState(false);
  const [showSeriesInfoModal, setShowSeriesInfoModal] = useState(false);
  
  // For conflict warning modal
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictDetails, setConflictDetails] = useState('');
  const [conflictData, setConflictData] = useState(null);
  
  // Function to get all tasks - tasks are now stored separately, not nested under milestones
  const getAllTasks = () => {
    if (!Array.isArray(tasks)) return [];
    return tasks;
  };
  
  // Tab state
  const [activeTab, setActiveTab] = useState(initialTimeBlock?.isGeneralActivity ? 'general' : 'goal');
  
  // State for goal-focused blocks
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('');
  const [domainColor, setDomainColor] = useState('#4CAF50');
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null); // New state for task selection
  
  // State for general activity blocks
  const [category, setCategory] = useState(initialTimeBlock?.category || 'Personal');
  const [customColor, setCustomColor] = useState(initialTimeBlock?.customColor || '#4285F4');
  const [customIcon, setCustomIcon] = useState(initialTimeBlock?.customIcon || null);
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
  
  // Common state
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)); // +1 hour
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
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
  const [pickerMode, setPickerMode] = useState('date'); // 'date' or 'time'
  
  // Repetition state
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatFrequency, setRepeatFrequency] = useState('weekly'); // 'daily', 'weekly', 'monthly'
  const [repeatUntil, setRepeatUntil] = useState(null);
  const [showRepeatUntilDatePicker, setShowRepeatUntilDatePicker] = useState(false);
  const [repeatIndefinitely, setRepeatIndefinitely] = useState(true);
  
  // Notification state
  const [enableNotification, setEnableNotification] = useState(false);
  const [notificationTime, setNotificationTime] = useState('exact'); // 'exact' or 'custom'
  const [notificationId, setNotificationId] = useState(null);
  
  // Custom notification time state
  const [customMinutes, setCustomMinutes] = useState('15');
  const [showCustomTimeInput, setShowCustomTimeInput] = useState(false);
  
  // Error state
  const [timeError, setTimeError] = useState('');
  
  // Date picker mode state
  const [datePickerMode, setDatePickerMode] = useState('spinner'); // 'spinner' or 'calendar'
  
  // Track if keyboard is visible
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Store initial values to detect changes
  const [initialValues, setInitialValues] = useState({});
  
  // Add animation on screen focus
  useFocusEffect(
    useCallback(() => {
      // Animate content fade in
      Animated.timing(contentFadeIn, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      return () => {
        // Reset animation value when screen is unfocused
        contentFadeIn.setValue(0);
      };
    }, [])
  );
  
  // Get all tasks from milestones
  const allTasks = getAllTasks();
  
  // Get available goals, filtering out completed ones
  const availableGoals = Array.isArray(mainGoals) 
    ? mainGoals.filter(goal => !goal.completed)
    : [];
    
  // Get milestones for the currently selected goal
  const goalMilestones = Array.isArray(milestones) 
    ? milestones.filter(milestone => {
        // If there's no selected domain, show all milestones
        if (!domain) return true;
        // Otherwise, filter milestones by the selected goal
        const matchingGoal = Array.isArray(mainGoals) ? mainGoals.find(goal => goal.title === domain) : null;
        return matchingGoal ? milestone.goalId === matchingGoal.id : false;
      })
    : [];
    
  // Get tasks for the currently selected milestone
  const milestoneTasks = Array.isArray(allTasks)
    ? allTasks.filter(task => {
        if (!selectedMilestone) return false;
        return task.milestoneId === selectedMilestone.id && !task.completed;
      })
    : [];
  
  // Set up keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  useEffect(() => {
    // If we're editing an existing time block, set the initial values
    if (!isCreating && initialTimeBlock) {
      console.log('[TimeBlockScreen] Loading existing time block:', {
        title: initialTimeBlock.title,
        domain: initialTimeBlock.domain,
        domainColor: initialTimeBlock.domainColor,
        milestoneId: initialTimeBlock.milestoneId,
        milestoneTitle: initialTimeBlock.milestoneTitle,
        taskId: initialTimeBlock.taskId,
        taskTitle: initialTimeBlock.taskTitle,
        isGeneralActivity: initialTimeBlock.isGeneralActivity
      });
      console.log('[TimeBlockScreen] Available goals:', mainGoals?.map(g => ({ id: g.id, title: g.title, domain: g.domain })));
      console.log('[TimeBlockScreen] Available milestones:', milestones?.map(m => ({ id: m.id, title: m.title, goalId: m.goalId })));
      console.log('[TimeBlockScreen] Available tasks:', tasks?.map(t => ({ id: t.id, title: t.title, milestoneId: t.milestoneId })));
      
      setTitle(initialTimeBlock.title);
      setStartTime(new Date(initialTimeBlock.startTime));
      setEndTime(new Date(initialTimeBlock.endTime));
      setLocation(initialTimeBlock.location || '');
      setNotes(initialTimeBlock.notes || '');
      setIsCompleted(initialTimeBlock.isCompleted || false);
      
      // Store existing notification ID if any
      setNotificationId(initialTimeBlock.notificationId || null);
      
      // Set the correct tab based on time block type
      setActiveTab(initialTimeBlock.isGeneralActivity ? 'general' : 'goal');
      
      if (initialTimeBlock.isGeneralActivity) {
        // Set category and color for general activity
        setCategory(initialTimeBlock.category || 'Personal');
        setCustomColor(initialTimeBlock.customColor || '#4285F4');
        setCustomIcon(initialTimeBlock.customIcon || null);
      } else {
        // Goal-focused time block - find goal, milestone, and task
        
        // First, try to find milestone by ID if available
        let milestone = null;
        let goal = null;
        let task = null;
        
        if (initialTimeBlock.milestoneId && Array.isArray(milestones)) {
          console.log('🎯 TimeBlock Edit: Looking for milestone with ID:', initialTimeBlock.milestoneId);
          console.log('🎯 TimeBlock Edit: Available milestones:', milestones.map(m => ({ id: m.id, title: m.title })));
          
          milestone = milestones.find(m => m.id === initialTimeBlock.milestoneId);
          console.log('[TimeBlockScreen] Found milestone by ID:', milestone ? milestone.title : 'NOT FOUND');
          
          if (milestone) {
            setSelectedMilestone(milestone);
            console.log('🎯 TimeBlock Edit: Set selectedMilestone to:', milestone.title);
            
            // Find goal from milestone's goalId
            if (milestone.goalId && Array.isArray(mainGoals)) {
              goal = mainGoals.find(g => g.id === milestone.goalId);
              console.log('[TimeBlockScreen] Found goal via milestone:', goal ? goal.title : 'NOT FOUND');
            }
          }
        }
        
        // If no goal found via milestone, try to find by domain (title)
        if (!goal && Array.isArray(mainGoals)) {
          goal = mainGoals.find(g => g.title === initialTimeBlock.domain);
          console.log('[TimeBlockScreen] Found goal by domain title:', goal ? goal.title : 'NOT FOUND');
        }
        
        // Set goal information
        if (goal) {
          setDomain(goal.title);
          setDomainColor(goal.color || initialTimeBlock.domainColor || '#4CAF50');
        } else {
          // If no matching goal found, still set the domain to preserve it
          console.log('[TimeBlockScreen] No goal found, using stored domain:', initialTimeBlock.domain);
          setDomain(initialTimeBlock.domain);
          setDomainColor(initialTimeBlock.domainColor || '#4CAF50');
        }
        
        // Set task if available
        if (initialTimeBlock.taskId) {
          console.log('🎯 TimeBlock Edit: Looking for task with ID:', initialTimeBlock.taskId);
          const allTasks = getAllTasks();
          console.log('🎯 TimeBlock Edit: Available tasks:', allTasks.map(t => ({ id: t.id, title: t.title })));
          
          task = allTasks.find(t => t.id === initialTimeBlock.taskId);
          console.log('[TimeBlockScreen] Found task by ID:', task ? task.title : 'NOT FOUND');
          
          if (task) {
            setSelectedTask(task);
            console.log('🎯 TimeBlock Edit: Set selectedTask to:', task.title);
          }
        }
      }
      
      // Set repeating values if available
      if (initialTimeBlock.isRepeating) {
        setIsRepeating(true);
        setRepeatFrequency(initialTimeBlock.repeatFrequency || 'weekly');
        setRepeatIndefinitely(initialTimeBlock.repeatIndefinitely || true);
        
        if (initialTimeBlock.repeatUntil) {
          setRepeatUntil(new Date(initialTimeBlock.repeatUntil));
          setRepeatIndefinitely(false);
        }
        
        // Default to editing series for recurring timeblocks
        setIsEditingSeries(true);
      }
      
      // Set notification values if available
      setEnableNotification(initialTimeBlock.notification || false);
      
      // Handle notification state
      if (initialTimeBlock.notificationTime === 'exact') {
        setNotificationTime('exact');
      } else if (initialTimeBlock.customMinutes) {
        setNotificationTime('custom');
        setCustomMinutes(initialTimeBlock.customMinutes.toString());
        setShowCustomTimeInput(true);
      } else if (initialTimeBlock.notificationTime) {
        // Handle legacy notification times
        const legacyTimes = {
          '15min': '15',
          '30min': '30',
          '1hour': '60',
          '1day': '1440'
        };
        setNotificationTime('custom');
        setCustomMinutes(legacyTimes[initialTimeBlock.notificationTime] || '15');
        setShowCustomTimeInput(true);
      }

      // Store initial values to track changes
      setInitialValues({
        title: initialTimeBlock.title,
        tab: initialTimeBlock.isGeneralActivity ? 'general' : 'goal',
        domain: initialTimeBlock.domain,
        domainColor: initialTimeBlock.domainColor || '#4CAF50',
        category: initialTimeBlock.category || 'Personal',
        customColor: initialTimeBlock.customColor || '#4285F4',
        customIcon: initialTimeBlock.customIcon || null,
        startTime: new Date(initialTimeBlock.startTime).toISOString(),
        endTime: new Date(initialTimeBlock.endTime).toISOString(),
        location: initialTimeBlock.location || '',
        notes: initialTimeBlock.notes || '',
        isCompleted: initialTimeBlock.isCompleted || false,
        isRepeating: initialTimeBlock.isRepeating || false,
        repeatFrequency: initialTimeBlock.repeatFrequency || 'weekly',
        repeatIndefinitely: initialTimeBlock.repeatIndefinitely || true,
        repeatUntil: initialTimeBlock.repeatUntil ? new Date(initialTimeBlock.repeatUntil).toISOString() : null,
        enableNotification: initialTimeBlock.notification || false,
        notificationTime: initialTimeBlock.notificationTime || 'exact',
        customMinutes: initialTimeBlock.customMinutes || '15',
        milestoneId: initialTimeBlock.milestoneId || null,
        taskId: initialTimeBlock.taskId || null
      });
      
      // Reset unsaved changes flag
      setHasUnsavedChanges(false);
      
    } else if (isCreating && date) {
      // If creating a new time block with a specific date
      let startTimeToUse, endTimeToUse;
      
      // Check if we have pre-filled times from tap-to-create
      if (prefilledStartTime && prefilledEndTime) {
        startTimeToUse = new Date(prefilledStartTime);
        endTimeToUse = new Date(prefilledEndTime);
      } else {
        // Default time logic (original behavior)
        const newDate = new Date(date);
        
        // Set start time to current hour rounded up to nearest half hour
        const currentTime = new Date();
        const minutes = currentTime.getMinutes();
        const roundedMinutes = minutes < 30 ? 30 : 0;
        const hoursToAdd = minutes < 30 ? 0 : 1;
        
        newDate.setHours(currentTime.getHours() + hoursToAdd, roundedMinutes, 0, 0);
        startTimeToUse = newDate;
        
        // Set end time to 1 hour after start time
        endTimeToUse = new Date(newDate);
        endTimeToUse.setHours(endTimeToUse.getHours() + 1);
      }
      
      setStartTime(startTimeToUse);
      setEndTime(endTimeToUse);

      // Handle pre-filled data from kanban task selection (regular flow)
      if (prefilledTask && prefilledMilestone && prefilledGoal) {
        // Set the title to the task title
        setTitle(prefilledTask.title);
        
        // Set to goal tab since we have goal/milestone/task data
        setActiveTab('goal');
        
        // Set the goal (domain)
        setDomain(prefilledGoal.title);
        setDomainColor(prefilledGoal.color || '#4CAF50');
        
        // Set the milestone
        setSelectedMilestone(prefilledMilestone);
        
        // Set the task
        setSelectedTask(prefilledTask);
      }
      
      // Handle tour mode - check if we have tour-selected task data
      else if (global.tourSelectedTask && global.tourSelectedMilestone && global.tourSelectedGoal) {
        console.log('🎯 Tour: Pre-filling TimeBlock with tour-selected task:', {
          task: global.tourSelectedTask.title,
          milestone: global.tourSelectedMilestone.title,
          goal: global.tourSelectedGoal.title
        });
        
        // Set the title to "Focus Session" for tour
        setTitle("Focus Session");
        
        // Set to goal tab since we have goal/milestone/task data
        setActiveTab('goal');
        
        // Set the goal (domain)
        setDomain(global.tourSelectedGoal.title);
        setDomainColor(global.tourSelectedGoal.color || '#4CAF50');
        
        // Set the milestone
        setSelectedMilestone(global.tourSelectedMilestone);
        
        // Set the task
        setSelectedTask(global.tourSelectedTask);
        
        console.log('🎯 Tour: TimeBlock state set:', {
          title: "Focus Session",
          activeTab: 'goal',
          domain: global.tourSelectedGoal.title,
          selectedMilestone: global.tourSelectedMilestone.title,
          selectedTask: global.tourSelectedTask.title
        });
      }

      // Store initial values for a new time block (accounting for pre-filled or tour data)
      const tourTask = global.tourSelectedTask;
      const tourMilestone = global.tourSelectedMilestone;
      const tourGoal = global.tourSelectedGoal;
      
      setInitialValues({
        title: tourTask ? 'Focus Session' : (prefilledTask?.title || ''),
        tab: (prefilledTask || tourTask) ? 'goal' : 'goal', // Default tab
        domain: prefilledGoal?.title || tourGoal?.title || '',
        domainColor: prefilledGoal?.color || tourGoal?.color || '#4CAF50',
        category: 'Personal',
        customColor: '#4285F4',
        customIcon: null,
        startTime: startTimeToUse.toISOString(),
        endTime: endTimeToUse.toISOString(),
        location: '',
        notes: '',
        isCompleted: false,
        isRepeating: false,
        repeatFrequency: 'weekly',
        repeatIndefinitely: true,
        repeatUntil: null,
        enableNotification: false,
        notificationTime: 'exact',
        customMinutes: '15',
        milestoneId: prefilledMilestone?.id || tourMilestone?.id || null,
        taskId: prefilledTask?.id || tourTask?.id || null
      });
      
      // Reset unsaved changes flag
      setHasUnsavedChanges(false);
    }
    
    // Don't auto-select any goal - let user choose "No Specific Goal" by default
  }, [isCreating, initialTimeBlock, date, mainGoals, milestones, tasks]);
  
  // Update check for unsaved changes whenever relevant state changes
  useEffect(() => {
    // Skip the initial render if initialValues is empty
    if (Object.keys(initialValues).length === 0) return;
    
    // Check if any values are different from initial
    const hasChanges = 
      title !== initialValues.title ||
      activeTab !== initialValues.tab ||
      (activeTab === 'goal' && domain !== initialValues.domain) ||
      (activeTab === 'general' && category !== initialValues.category) ||
      (activeTab === 'general' && customColor !== initialValues.customColor) ||
      (activeTab === 'general' && customIcon !== initialValues.customIcon) ||
      startTime.toISOString() !== initialValues.startTime ||
      endTime.toISOString() !== initialValues.endTime ||
      location !== initialValues.location ||
      notes !== initialValues.notes ||
      isCompleted !== initialValues.isCompleted ||
      isRepeating !== initialValues.isRepeating ||
      (isRepeating && repeatFrequency !== initialValues.repeatFrequency) ||
      (isRepeating && repeatIndefinitely !== initialValues.repeatIndefinitely) ||
      (isRepeating && !repeatIndefinitely && repeatUntil && 
       repeatUntil.toISOString() !== initialValues.repeatUntil) ||
      enableNotification !== initialValues.enableNotification ||
      (enableNotification && notificationTime !== initialValues.notificationTime) ||
      (enableNotification && notificationTime === 'custom' && 
       customMinutes !== initialValues.customMinutes) ||
      (selectedMilestone && selectedMilestone.id !== initialValues.milestoneId) ||
      (selectedTask && selectedTask.id !== initialValues.taskId);
    
    setHasUnsavedChanges(hasChanges);
  }, [
    title, activeTab, domain, category, customColor, customIcon, startTime, endTime,
    location, notes, isCompleted, isRepeating, repeatFrequency,
    repeatIndefinitely, repeatUntil, enableNotification, notificationTime,
    customMinutes, selectedMilestone, selectedTask, initialValues
  ]);
  
  // Handle Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (hasUnsavedChanges) {
          setShowUnsavedChangesModal(true);
          return true; // Prevent default back behavior
        }
        return false; // Allow default back behavior
      };

      // Add event listener for back press
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Return function to be called when the component unmounts
      return () => subscription.remove();
    }, [hasUnsavedChanges])
  );
  
  // Custom back button handler
  const handleBackPress = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedChangesModal(true);
    } else {
      navigation.goBack();
    }
  };
  
  // Discard changes and go back
  const discardChangesAndGoBack = () => {
    setShowUnsavedChangesModal(false);
    setHasUnsavedChanges(false);
    navigation.goBack();
  };
  
  
  // Function to validate custom minutes input
  const validateCustomMinutes = (value) => {
    // Allow empty value (so user can delete all digits)
    if (value === '') return '';
    
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // If user pressed a non-numeric key on an empty field, return empty
    if (numericValue === '') return '';
    
    // Convert to number for comparison only when we have a value
    const numValue = parseInt(numericValue, 10);
    
    // Ensure value is between 1 and 1440 (24 hours in minutes)
    if (!isNaN(numValue)) {
      if (numValue > 1440) return '1440';
      if (numValue < 1 && numericValue.length > 0) return '1';
      return numericValue; // Return the string value, not the parsed int
    }
    
    return numericValue;
  };
  
  // Function to scroll to a specific input when it's focused
  const scrollToInput = (node) => {
    if (scrollViewRef.current && node) {
      node.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          // Add some extra space to scroll beyond the input
          scrollViewRef.current.scrollTo({ y: y - 100, animated: true });
        },
        () => console.log('Failed to measure')
      );
    }
  };
  
  // Animate the save button
  const animateSaveButton = () => {
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
  };
  
  const handleSave = async () => {
    // Prevent save if conflict modal is showing or if already saving via Skip Conflicts
    if (showConflictModal || isSaving) {
      console.log('🚨 ALERT: Regular handleSave blocked - conflict modal showing or Skip Conflicts in progress');
      return;
    }
    
    // Set saving flag immediately to prevent race conditions
    setIsSaving(true);
    
    try {
      console.log('🚨 ALERT: Regular handleSave function called! This should NOT happen during Skip Conflicts!');
    // Animate the save button
    animateSaveButton();
    
    // Clear any previous errors
    setTimeError('');
    
    // Validate input
    if (!title.trim()) {
      notification.showError('Please enter a title');
      return;
    }
    
    // Note: We allow empty domain for goal tab - this represents "No Specific Goal"
    
    // For general activities, use default category if none selected
    const finalCategory = activeTab === 'general' ? (category.trim() || 'Personal') : category;
    
    // Find matching goal to get its color
    const selectedGoal = Array.isArray(mainGoals) ? 
      mainGoals.find(goal => goal.title === domain) : null;
    const selectedColor = selectedGoal ? selectedGoal.color : domainColor;
    
    // Get the milestone ID if a milestone is selected
    const milestoneId = selectedMilestone ? selectedMilestone.id : null;
    
    // Get the task ID if a task is selected
    const taskId = selectedTask ? selectedTask.id : null;
    
    // NEW: Also store the milestone and task titles
    const milestoneTitle = selectedMilestone ? selectedMilestone.title : null;
    const taskTitle = selectedTask ? selectedTask.title : null;
    
    console.log('🎯 TimeBlock Save Debug:', {
      title,
      domain,
      milestoneId,
      milestoneTitle,
      taskId,
      taskTitle,
      selectedMilestone: selectedMilestone ? selectedMilestone.title : null,
      selectedTask: selectedTask ? selectedTask.title : null
    });
    
    // If we're updating, cancel the existing notification if there is one
    if (!isCreating && notificationId) {
      try {
        await cancelTimeBlockNotification(notificationId);
      } catch (error) {
        console.warn('Error cancelling existing notification:', error);
        // Continue with saving even if cancellation fails
      }
    }
    
    // Validate custom minutes again if needed
    const validatedMinutes = notificationTime === 'custom' && customMinutes ? 
      validateCustomMinutes(customMinutes) || '15' : null;
    
    // Create time block object first - we will add the notification ID after scheduling
    const timeBlock = {
      id: initialTimeBlock?.id || Date.now().toString(),
      title,
      isGeneralActivity: activeTab === 'general',
      
      // For Goal Focus time blocks
      domain: activeTab === 'goal' ? domain : null,
      domainColor: activeTab === 'goal' ? selectedColor : null,
      milestoneId: activeTab === 'goal' ? milestoneId : null,
      milestoneTitle: activeTab === 'goal' ? milestoneTitle : null, // NEW: Store milestone title
      taskId: activeTab === 'goal' ? taskId : null,
      taskTitle: activeTab === 'goal' ? taskTitle : null, // NEW: Store task title
      
      // For General Activity time blocks
      category: activeTab === 'general' ? finalCategory : null,
      customColor: activeTab === 'general' ? customColor : null,
      customIcon: activeTab === 'general' ? customIcon : null,
      
      // Common fields
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      location,
      notes,
      isCompleted,
      
      // Add repeating information
      isRepeating,
      repeatFrequency: isRepeating ? repeatFrequency : null,
      repeatIndefinitely: isRepeating ? repeatIndefinitely : null,
      repeatUntil: isRepeating && !repeatIndefinitely && repeatUntil ? repeatUntil.toISOString() : null,
      
      // Add notification information - we'll update notificationId after scheduling
      notification: enableNotification,
      notificationTime: enableNotification ? notificationTime : null,
      customMinutes: enableNotification && notificationTime === 'custom' ? validatedMinutes : null,
      notificationId: null
    };
    
    // Define the save logic as a function we can call conditionally
    const performSave = async () => {
    console.log('🚨 CRITICAL: performSave called - this creates all timeblocks via regular addTimeBlock!');
    
    // Handle notification scheduling
    let newNotificationId = null;
    if (enableNotification) {
      try {
        console.log(`Scheduling notification for time block: ${timeBlock.title}`);
        console.log(`Notification time preference: ${notificationTime}`);
        console.log(`Custom minutes: ${validatedMinutes}`);
        
        // Use the updated notification helper which handles all the timing logic
        newNotificationId = await scheduleTimeBlockNotificationSimple(timeBlock);
        
        if (newNotificationId) {
          console.log(`Notification scheduled with ID: ${newNotificationId}`);
          // Update the notification ID in the time block
          timeBlock.notificationId = newNotificationId;
        } else {
          console.log('Failed to schedule notification - likely in the past');
          // If scheduling failed but notifications were enabled, tell the user
          Alert.alert(
            'Notification Not Scheduled',
            'The notification could not be scheduled. This may be because the reminder time has already passed.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error scheduling notification:', error);
        Alert.alert(
          'Notification Error',
          'There was an error scheduling your notification. The time block will still be saved.',
          [{ text: 'OK' }]
        );
      }
    }
    
    // Save time block
    try {
      if (isCreating) {
        await addTimeBlock(timeBlock);
        notification.showSuccess('Time block created');
      } else {
        // Determine save strategy based on editing mode
        const wasRecurring = initialTimeBlock?.isRepeating || initialTimeBlock?.isRepeatingInstance;
        const isNowRecurring = isRepeating;
        const wasNonRecurringNowRecurring = !wasRecurring && isNowRecurring;
        
        if (isEditingSeries && wasRecurring) {
          // Editing series - update all instances in the series
          const seriesId = initialTimeBlock?.seriesId || initialTimeBlock?.originalTimeBlockId || initialTimeBlock?.id;
          await updateTimeBlockSeries(seriesId, timeBlock);
          notification.showSuccess('Series updated - all events changed');
        } else if (!isEditingSeries && wasNonRecurringNowRecurring) {
          // Instance editing: non-recurring becoming recurring - convert current instance to new series
          const newSeriesTimeBlock = {
            ...timeBlock,
            id: initialTimeBlock.id, // Keep the original instance ID as the series ID
            seriesId: null, // This becomes the original series block
            originalTimeBlockId: null,
            isRepeating: true,
            isRepeatingInstance: false // This is now the original series block
          };
          await updateTimeBlock(newSeriesTimeBlock);
          notification.showSuccess('New recurring series created');
        } else {
          // Standard instance editing - update only this timeblock
          await updateTimeBlock(timeBlock);
          notification.showSuccess(isEditingSeries ? 'Time block updated' : 'Instance updated');
        }
      }
      
      // Reset hasUnsavedChanges flag
      setHasUnsavedChanges(false);
      
      // Tour detection: Check if we just created a time block during the tour
      if (global.tourSelectedTask && global.tourSelectedMilestone && global.tourSelectedGoal) {
        console.log('🎯 Tour: Time block created successfully with pre-filled task data!', {
          task: global.tourSelectedTask.title,
          milestone: global.tourSelectedMilestone.title,
          goal: global.tourSelectedGoal.title
        });
        
        // Clear the global tour data since we've successfully used it
        global.tourSelectedTask = null;
        global.tourSelectedMilestone = null;
        global.tourSelectedGoal = null;
        
        // Notify the tour system that time scheduling was completed
        if (global.tourTimeScheduled) {
          console.log('🎯 Tour: Calling global.tourTimeScheduled()');
          global.tourTimeScheduled();
        }
      }
      
      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Error saving time block:', error);
      notification.showError('Failed to save time block');
    }
    }; // End of performSave function
    
    // Check for time conflicts - ALWAYS check except when in bypass mode
    const excludeIds = isCreating ? [] : [initialTimeBlock?.id];
    
    // Determine if we're editing a series and get series ID
    const editingSeriesId = isEditingSeries && initialTimeBlock ? 
      (initialTimeBlock.seriesId || initialTimeBlock.originalTimeBlockId || initialTimeBlock.id) : null;
    
    console.log('🔍 Conflict Detection Debug:', {
      isCreating,
      isEditingSeries,
      editingSeriesId,
      timeBlockIsRepeating: timeBlock.isRepeating,
      excludeIds
    });
    
    // Use enhanced conflict detection for recurring timeblocks
    const conflictResult = timeBlock.isRepeating ? 
      checkRecurringTimeBlockConflicts(timeBlock, excludeIds, isEditingSeries, editingSeriesId) :
      { conflicts: checkTimeBlockConflicts(timeBlock, excludeIds), conflictingInstances: [] };
    
    if (conflictResult.conflicts.length > 0) {
      const conflictTitles = conflictResult.conflicts.map(c => c.title).join(', ');
      setTimeError(`Time conflict with: ${conflictTitles}`);
      setConflictDetails(conflictTitles);
      setConflictData(conflictResult);
      setShowConflictModal(true);
      
      console.log('🚨 CONFLICTS DETECTED: Stopping regular save, showing modal instead');
      // CRITICAL: Reset saving flag so Skip Conflicts can work
      setIsSaving(false);
      return; // Exit early to show modal - performSave should NOT be called
    }
    
    console.log('🚨 NO CONFLICTS: Proceeding with performSave');
    // No conflicts, proceed with save
    await performSave();
  } catch (error) {
    console.error('Error in handleSave:', error);
    notification.showError('Failed to save time block');
  } finally {
    // Reset saving flag
    setIsSaving(false);
  }
};

  // Function to save timeblock bypassing conflict detection (for "Create Anyway" button)
  const handleSaveBypassConflicts = async () => {
    // Prevent Create Anyway from running if Skip Conflicts is in progress
    if (isSaving) {
      console.log('🚨 CREATE ANYWAY: Blocked - Skip Conflicts is in progress');
      return;
    }
    
    try {
      console.log('🚨 CREATE ANYWAY: handleSaveBypassConflicts function called!');
      
      // Validate input
      if (!title.trim()) {
        notification.showError('Please enter a title');
        return;
      }
      
      // Note: We allow empty domain for goal tab - this represents "No Specific Goal"
      
      // For general activities, use default category if none selected
      const finalCategory = activeTab === 'general' ? (category.trim() || 'Personal') : category;
      
      // Find matching goal to get its color
      const selectedGoal = Array.isArray(mainGoals) ? 
        mainGoals.find(goal => goal.title === domain) : null;
      const selectedColor = selectedGoal ? selectedGoal.color : domainColor;
      
      // Get the milestone ID if a milestone is selected
      const milestoneId = selectedMilestone ? selectedMilestone.id : null;
      
      // Get the task ID if a task is selected
      const taskId = selectedTask ? selectedTask.id : null;
      
      // Also store the milestone and task titles
      const milestoneTitle = selectedMilestone ? selectedMilestone.title : null;
      const taskTitle = selectedTask ? selectedTask.title : null;
      
      console.log('🎯 Bypass Save Debug:', {
        title,
        domain,
        isRepeating,
        milestoneId,
        taskId
      });
      
      // If we're updating, cancel the existing notification if there is one
      if (!isCreating && notificationId) {
        try {
          await cancelTimeBlockNotification(notificationId);
        } catch (error) {
          console.warn('Error cancelling existing notification:', error);
        }
      }
      
      // Validate custom minutes again if needed
      const validatedMinutes = notificationTime === 'custom' && customMinutes ? 
        validateCustomMinutes(customMinutes) || '15' : null;
      
      // Create time block object
      const timeBlock = {
        id: initialTimeBlock?.id || Date.now().toString(),
        title,
        isGeneralActivity: activeTab === 'general',
        
        // For Goal Focus time blocks
        domain: activeTab === 'goal' ? domain : null,
        domainColor: activeTab === 'goal' ? selectedColor : null,
        milestoneId: activeTab === 'goal' ? milestoneId : null,
        milestoneTitle: activeTab === 'goal' ? milestoneTitle : null,
        taskId: activeTab === 'goal' ? taskId : null,
        taskTitle: activeTab === 'goal' ? taskTitle : null,
        
        // For General Activity time blocks
        category: activeTab === 'general' ? finalCategory : null,
        customColor: activeTab === 'general' ? customColor : null,
        customIcon: activeTab === 'general' ? customIcon : null,
        
        // Common fields
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location,
        notes,
        isCompleted,
        
        // Add repeating information
        isRepeating,
        repeatFrequency: isRepeating ? repeatFrequency : null,
        repeatIndefinitely: isRepeating ? repeatIndefinitely : null,
        repeatUntil: isRepeating && !repeatIndefinitely && repeatUntil ? repeatUntil.toISOString() : null,
        
        // Add notification information
        notification: enableNotification,
        notificationTime: enableNotification ? notificationTime : null,
        customMinutes: enableNotification && notificationTime === 'custom' ? validatedMinutes : null,
        notificationId: null
      };
      
      // Handle notification scheduling
      let newNotificationId = null;
      if (enableNotification) {
        try {
          newNotificationId = await scheduleTimeBlockNotificationSimple(timeBlock);
          if (newNotificationId) {
            timeBlock.notificationId = newNotificationId;
          }
        } catch (error) {
          console.error('Error scheduling notification:', error);
        }
      }
      
      // Save time block
      if (isCreating) {
        await addTimeBlock(timeBlock);
        notification.showSuccess('Time block created');
      } else {
        // Handle editing logic similar to original
        const wasRecurring = initialTimeBlock?.isRepeating || initialTimeBlock?.isRepeatingInstance;
        const isNowRecurring = isRepeating;
        const wasNonRecurringNowRecurring = !wasRecurring && isNowRecurring;
        
        if (isEditingSeries && wasRecurring) {
          const seriesId = initialTimeBlock?.seriesId || initialTimeBlock?.originalTimeBlockId || initialTimeBlock?.id;
          await updateTimeBlockSeries(seriesId, timeBlock);
          notification.showSuccess('Series updated - all events changed');
        } else if (!isEditingSeries && wasNonRecurringNowRecurring) {
          const newSeriesTimeBlock = {
            ...timeBlock,
            id: initialTimeBlock.id,
            seriesId: null,
            originalTimeBlockId: null,
            isRepeating: true,
            isRepeatingInstance: false
          };
          await updateTimeBlock(newSeriesTimeBlock);
          notification.showSuccess('New recurring series created');
        } else {
          await updateTimeBlock(timeBlock);
          notification.showSuccess(isEditingSeries ? 'Time block updated' : 'Instance updated');
        }
      }
      
      // Reset hasUnsavedChanges flag
      setHasUnsavedChanges(false);
      
      // Navigate back
      navigation.goBack();
      
    } catch (error) {
      console.error('Error saving time block (bypass conflicts):', error);
      notification.showError('Failed to save time block');
    }
  };

  // Add a flag to prevent multiple saves
  const [isSaving, setIsSaving] = useState(false);

  // Function to save timeblock skipping conflicting instances  
  const handleSaveSkipConflicts = async () => {
    if (isSaving) {
      console.log('Skip Conflicts: Already saving, ignoring duplicate call');
      return;
    }
    
    setIsSaving(true);
    console.log('Skip Conflicts: Starting save process');
    
    try {
      // Validate input
      if (!title?.trim()) {
        console.log('Skip Conflicts: Validation failed - no title');
        notification.showError('Please enter a title');
        return;
      }
      
      // Note: We allow empty domain for goal tab - this represents "No Specific Goal"
      
      // For general activities, use default category if none selected
      const finalCategory = activeTab === 'general' ? (category?.trim() || 'Personal') : category;
      
      // Find matching goal to get its color
      const selectedGoal = Array.isArray(mainGoals) ? 
        mainGoals.find(goal => goal.title === domain) : null;
      const selectedColor = selectedGoal ? selectedGoal.color : domainColor;
      
      // Get the milestone ID if a milestone is selected
      const milestoneId = selectedMilestone ? selectedMilestone.id : null;
      
      // Get the task ID if a task is selected
      const taskId = selectedTask ? selectedTask.id : null;
      
      // Also store the milestone and task titles
      const milestoneTitle = selectedMilestone ? selectedMilestone.title : null;
      const taskTitle = selectedTask ? selectedTask.title : null;
      
      // Validate custom minutes again if needed
      const validatedMinutes = notificationTime === 'custom' && customMinutes ? 
        validateCustomMinutes(customMinutes) || '15' : null;
      
      // Create time block object
      const timeBlock = {
        id: initialTimeBlock?.id || Date.now().toString(),
        title,
        isGeneralActivity: activeTab === 'general',
        
        // For Goal Focus time blocks
        domain: activeTab === 'goal' ? domain : null,
        domainColor: activeTab === 'goal' ? selectedColor : null,
        milestoneId: activeTab === 'goal' ? milestoneId : null,
        milestoneTitle: activeTab === 'goal' ? milestoneTitle : null,
        taskId: activeTab === 'goal' ? taskId : null,
        taskTitle: activeTab === 'goal' ? taskTitle : null,
        
        // For General Activity time blocks
        category: activeTab === 'general' ? finalCategory : null,
        customColor: activeTab === 'general' ? customColor : null,
        customIcon: activeTab === 'general' ? customIcon : null,
        
        // Common fields
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location,
        notes,
        isCompleted,
        
        // Add repeating information
        isRepeating,
        repeatFrequency: isRepeating ? repeatFrequency : null,
        repeatIndefinitely: isRepeating ? repeatIndefinitely : null,
        repeatUntil: isRepeating && !repeatIndefinitely && repeatUntil ? repeatUntil.toISOString() : null,
        
        // Add notification information
        notification: enableNotification,
        notificationTime: enableNotification ? notificationTime : null,
        customMinutes: enableNotification && notificationTime === 'custom' ? validatedMinutes : null,
        notificationId: null
      };
      
      console.log('Skip Conflicts: Creating timeblock with conflict avoidance');
      
      // Use the skip conflicts functionality
      const excludeIds = isCreating ? [] : [initialTimeBlock?.id];
      
      // Determine if we're editing a series and get series ID
      const editingSeriesId = isEditingSeries && initialTimeBlock ? 
        (initialTimeBlock.seriesId || initialTimeBlock.originalTimeBlockId || initialTimeBlock.id) : null;
      
      const result = await addTimeBlockSkipConflicts(timeBlock, excludeIds, isEditingSeries, editingSeriesId);
      
      if (result) {
        const skipped = result.totalInstances - result.createdInstances;
        
        if (skipped > 0) {
          notification.showSuccess(`Created ${result.createdInstances} timeblocks (skipped ${skipped} conflicts)`);
          console.log(`Skip Conflicts: Created ${result.createdInstances} instances, skipped ${skipped} conflicting instances`);
        } else {
          notification.showSuccess('Time block created');
          console.log('Skip Conflicts: Time block created successfully');
        }
        
        // Reset hasUnsavedChanges flag
        setHasUnsavedChanges(false);
        
        // Navigate back
        navigation.goBack();
      } else {
        console.log('Skip Conflicts: All instances would conflict - no timeblocks created');
        notification.showError('All instances would conflict - no timeblocks created');
      }
      
    } catch (error) {
      console.error('Skip Conflicts: Error occurred:', error);
      notification.showError('Failed to create timeblock');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = () => {
    if (!initialTimeBlock) {
      return;
    }
    
    // Show confirmation UI instead of Alert
    setShowDeleteConfirmation(true);
  };
  
  // Handle confirmed deletion (similar to DayView pattern)
  const handleConfirmDelete = async (deleteType = null) => {
    if (!initialTimeBlock) {
      return;
    }
    
    setShowDeleteConfirmation(false);
    
    try {
      // If the time block has a notification, cancel it before deleting
      if (notificationId) {
        try {
          await cancelTimeBlockNotification(notificationId);
          console.log(`Notification canceled for time block: ${initialTimeBlock.id}`);
        } catch (error) {
          console.warn('Error cancelling notification during delete:', error);
          // Continue with deletion even if cancellation fails
        }
      }
      
      if (deleteType) {
        // For recurring blocks with specific delete type
        if (deleteType === 'single') {
          deleteTimeBlock(initialTimeBlock.id, 'single');
          notification.showSuccess('Time block instance deleted');
        } else if (deleteType === 'series') {
          deleteTimeBlock(initialTimeBlock.seriesId || initialTimeBlock.id, 'series');
          notification.showSuccess('Time block series deleted');
        }
      } else {
        // For regular blocks
        deleteTimeBlock(initialTimeBlock.id);
        notification.showSuccess('Time block deleted');
      }
      
      // Reset hasUnsavedChanges flag
      setHasUnsavedChanges(false);
      navigation.goBack();
    } catch (error) {
      console.error('Error during time block deletion:', error);
      notification.showError('Failed to delete time block');
    }
  };
  
  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };
  
  // Handle title editing functions (similar to financial tracker)
  const handleTitlePress = () => {
    setTempTitle(title);
    setShowTitleEditModal(true);
  };

  const handleTitleSave = () => {
    // Dismiss keyboard immediately to prevent interference
    Keyboard.dismiss();
    
    if (!tempTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    const newTitle = tempTitle.trim();
    setTitle(newTitle);
    setShowTitleEditModal(false);
    setTempTitle('');
  };

  const handleTitleCancel = () => {
    setShowTitleEditModal(false);
    setTempTitle('');
  };

  // Handle date picker mode toggle
  const handleDatePickerModeChange = (mode) => {
    setDatePickerMode(mode);
  };
  
  // Format custom minutes for display
  const formatCustomMinutes = (minutes) => {
    const mins = parseInt(minutes, 10);
    if (isNaN(mins)) return '15 minutes before';
    
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      
      if (remainingMins === 0) {
        return hours === 1 ? '1 hour before' : `${hours} hours before`;
      } else {
        return `${hours}h ${remainingMins}m before`;
      }
    } else {
      return `${mins} minutes before`;
    }
  };
  
  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      setShowStartTimePicker(false);
      setShowEndTimePicker(false);
      setShowRepeatUntilDatePicker(false);
    }
    
    if (!selectedDate) return;
    
    if (showDatePicker) {
      // Update both startTime and endTime to keep the same time but change the date
      const newStartTime = new Date(startTime);
      newStartTime.setFullYear(selectedDate.getFullYear());
      newStartTime.setMonth(selectedDate.getMonth());
      newStartTime.setDate(selectedDate.getDate());
      setStartTime(newStartTime);
      
      const newEndTime = new Date(endTime);
      newEndTime.setFullYear(selectedDate.getFullYear());
      newEndTime.setMonth(selectedDate.getMonth());
      newEndTime.setDate(selectedDate.getDate());
      setEndTime(newEndTime);
      
      // Clear any time errors when date changes
      setTimeError('');
    } else if (showStartTimePicker) {
      // Update startTime hours and minutes
      const newStartTime = new Date(startTime);
      newStartTime.setHours(selectedDate.getHours());
      newStartTime.setMinutes(selectedDate.getMinutes());
      setStartTime(newStartTime);
      
      // If the new start time is after the current end time, adjust end time
      if (newStartTime.getTime() >= endTime.getTime()) {
        const newEndTime = new Date(newStartTime);
        newEndTime.setHours(newStartTime.getHours() + 1);
        setEndTime(newEndTime);
      }
      
      // Clear any time errors when time changes
      setTimeError('');
    } else if (showEndTimePicker) {
      // Update endTime hours and minutes
      const newEndTime = new Date(endTime);
      newEndTime.setHours(selectedDate.getHours());
      newEndTime.setMinutes(selectedDate.getMinutes());
      
      // Only allow end time to be after start time
      if (newEndTime.getTime() <= startTime.getTime()) {
        // If invalid, set end time to 1 hour after start time
        newEndTime.setTime(startTime.getTime() + 60 * 60 * 1000);
      }
      
      setEndTime(newEndTime);
      
      // Clear any time errors when time changes
      setTimeError('');
    } else if (showRepeatUntilDatePicker) {
      // Update repeatUntil date
      const newRepeatUntil = new Date(selectedDate);
      
      // Only allow repeat until date to be after the start date
      if (newRepeatUntil.getTime() <= startTime.getTime()) {
        // If invalid, set to 1 month after start time
        newRepeatUntil.setMonth(startTime.getMonth() + 1);
      }
      
      setRepeatUntil(newRepeatUntil);
    }
  };
  
  // Handle milestone selection
  const handleMilestoneSelect = (milestone) => {
    // If selecting a different milestone, clear the task selection
    if ((!selectedMilestone && milestone) || (selectedMilestone && milestone && selectedMilestone.id !== milestone.id)) {
      setSelectedTask(null);
    }
    
    setSelectedMilestone(milestone);
    setShowMilestoneModal(false);
  };
  
  // Handle task selection
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setShowTaskModal(false);
  };
  
  // Handle color selection
  const handleColorSelect = (color) => {
    setCustomColor(color);
    setShowColorModal(false);
  };
  
  // Format time for display (e.g., "9:00 AM")
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Format date for display (e.g., "Mon, May 8, 2024")
  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  
  // Open date picker
  const openDatePicker = () => {
    setPickerMode('date');
    setShowDatePicker(true);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
    setShowRepeatUntilDatePicker(false);
  };
  
  // Open start time picker
  const openStartTimePicker = () => {
    setPickerMode('time');
    setShowDatePicker(false);
    setShowStartTimePicker(true);
    setShowEndTimePicker(false);
    setShowRepeatUntilDatePicker(false);
  };
  
  // Open end time picker
  const openEndTimePicker = () => {
    setPickerMode('time');
    setShowDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(true);
    setShowRepeatUntilDatePicker(false);
  };
  
  // Open repeat until date picker
  const openRepeatUntilDatePicker = () => {
    setPickerMode('date');
    setShowDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
    setShowRepeatUntilDatePicker(true);
    
    // If repeatUntil is not set, initialize it to 1 month after start date
    if (!repeatUntil) {
      const defaultRepeatUntil = new Date(startTime);
      defaultRepeatUntil.setMonth(defaultRepeatUntil.getMonth() + 1);
      setRepeatUntil(defaultRepeatUntil);
    }
  };
  
  // Open milestone selection modal
  const openMilestoneModal = () => {
    // Check if there are any goals available
    if (availableGoals.length === 0) {
      setGoalRequiredModalType('milestone');
      setShowGoalRequiredModal(true);
      return;
    }
    setShowMilestoneModal(true);
  };
  
  // Open task selection modal
  const openTaskModal = () => {
    // Only show task modal if a milestone is selected
    if (selectedMilestone) {
      setShowTaskModal(true);
    } else {
      // Check if there are milestones available for the current goal
      if (goalMilestones.length === 0) {
        setGoalRequiredModalType('task');
        setShowGoalRequiredModal(true);
      } else {
        // There are milestones, but user hasn't selected one
        Alert.alert(
          'Select a Milestone First',
          'Please select a milestone before selecting a task.',
          [{ text: 'OK' }]
        );
      }
    }
  };
  
  // Open color selection modal
  const openColorModal = () => {
    setShowColorModal(true);
  };
  
  // Hide all pickers
  const hidePickers = () => {
    setShowDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
    setShowRepeatUntilDatePicker(false);
  };
  
  // Navigate to Goals tab to create a goal
  const navigateToGoals = () => {
    navigation.navigate('GoalsTab');
  };
  
  // Navigate to Milestones tab to create a milestone
  const navigateToMilestones = () => {
    navigation.navigate('ProjectsTab');
  };
  
  // Navigate to goal details for notification settings - UPDATED with alert approach
  const navigateToGoalSettings = () => {
    // Find the goal by title
    const selectedGoal = Array.isArray(mainGoals) ? 
      mainGoals.find(goal => goal.title === domain) : null;
    
    if (selectedGoal) {
      // Show a simpler alert with goal notification settings info
      Alert.alert(
        'Goal Notification Settings',
        `You can configure notifications for all time blocks under "${selectedGoal.title}" in the Goals tab.\n\n1. Go to the Goals tab\n2. Select this goal\n3. Go to the Advanced section\n4. Open Notification Preferences`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Navigate to this Goal',
            onPress: () => {
              // Navigate to the Goals tab
              navigation.navigate('GoalsTab');
            }
          }
        ]
      );
    }
  };
  
  // Get responsive size values based on device size
  const getResponsiveSize = (sizeOptions) => {
    if (isTablet && sizeOptions.tablet !== undefined) return sizeOptions.tablet;
    if (isLargeDevice && sizeOptions.large !== undefined) return sizeOptions.large;
    if (isMediumDevice && sizeOptions.medium !== undefined) return sizeOptions.medium;
    if (isSmallDevice && sizeOptions.small !== undefined) return sizeOptions.small;
    
    // Default fallback - medium device
    return sizeOptions.medium !== undefined ? sizeOptions.medium : 
           sizeOptions.small !== undefined ? sizeOptions.small :
           sizeOptions.large !== undefined ? sizeOptions.large :
           sizeOptions.tablet !== undefined ? sizeOptions.tablet : 0;
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top navigation bar with safe area insets - FIXED: position higher in the UI */}
      <View style={[
        styles.topBar, 
        { 
          borderBottomWidth: 1, 
          borderBottomColor: theme.border,
          paddingVertical: Platform.OS === 'ios' ? 12 : 16, // Reduced padding for better positioning
          paddingHorizontal: spacing.m
        }
      ]}>
        <TouchableOpacity 
          style={[
            styles.backButton,
            ensureAccessibleTouchTarget(44, 44)
          ]} 
          onPress={handleBackPress}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <TouchableOpacity 
            style={styles.titlePressable}
            onPress={handleTitlePress}
          >
            <Text style={[styles.screenTitle, { 
              color: theme.text,
              fontSize: getResponsiveSize({
                small: fontSizes.m,
                medium: fontSizes.l,
                large: fontSizes.l,
                tablet: fontSizes.xl
              })
            }]}>
              {title || (isCreating ? "New Time Block" : "Time Block")}
            </Text>
            <Ionicons name="pencil" size={14} color={theme.textSecondary} style={styles.titleEditIcon} />
          </TouchableOpacity>
        </View>
        <Animated.View style={{ transform: [{ scale: saveButtonScale }] }}>
          <TouchableOpacity 
            style={[
              styles.saveButton,
              ensureAccessibleTouchTarget(50, 44),
              (showConflictModal || isSaving) && { opacity: 0.3 } // Dim when disabled
            ]} 
            onPress={handleSave}
            disabled={showConflictModal || isSaving}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Save time block"
          >
            <Text 
              style={[
                styles.saveButtonText, 
                { 
                  color: theme.primary,
                  fontSize: fontSizes.m 
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Save
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Main content with KeyboardAwareScrollView */}
      <Animated.View style={{
        flex: 1,
        backgroundColor: theme.background,
        opacity: contentFadeIn,
        transform: [{
          translateY: contentFadeIn.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })
        }]
      }}>
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ 
            flexGrow: 1,
            backgroundColor: 'transparent',
            paddingBottom: 0 // Remove bottom padding that might create black space
          }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          enableResetScrollToCoords={false}
          keyboardOpeningTime={0}
          extraHeight={0}
          extraScrollHeight={0}
          style={{ backgroundColor: 'transparent', flex: 1 }}
        >
          {/* Main form component with accessibility props */}
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
            formatTime={formatTime}
            formatDate={formatDate}
            availableGoals={availableGoals}
            goalMilestones={goalMilestones}
            milestoneItems={milestoneTasks}
            handleDelete={handleDelete}
            isCreating={isCreating}
            isEditingSeries={isEditingSeries}
            theme={theme}
            isDarkMode={isDarkMode}
            scrollToInput={scrollToInput}
            validateCustomMinutes={validateCustomMinutes}
            scrollViewRef={scrollViewRef}
            // Add responsive props
            fontSizes={fontSizes}
            spacing={spacing}
            isLandscape={isLandscape}
            deviceType={isSmallDevice ? 'small' : isMediumDevice ? 'medium' : isLargeDevice ? 'large' : 'tablet'}
            accessibility={accessibility}
            responsive={responsive}
          />
        </KeyboardAwareScrollView>
      </Animated.View>

      {/* REMOVED: Floating Add Button */}

      {/* Modals - Conditionally rendered to prevent overlay issues */}
      {showColorModal && (
        <ColorPicker
          visible={showColorModal}
          onClose={() => setShowColorModal(false)}
          onColorSelect={handleColorSelect}
          selectedColor={customColor}
          colorOptions={colorOptions}
          theme={theme}
          isDarkMode={isDarkMode}
        />
      )}

      {showMilestoneModal && (
        <MilestoneSelector
          visible={showMilestoneModal}
          onClose={() => setShowMilestoneModal(false)}
          onSelectMilestone={handleMilestoneSelect}
          selectedMilestone={selectedMilestone}
          milestones={goalMilestones}
          domainColor={domainColor}
          theme={theme}
          isDarkMode={isDarkMode}
          // Add responsive props
          spacing={spacing}
          fontSizes={fontSizes}
          accessibility={accessibility}
        />
      )}

      {showTaskModal && (
        <TaskSelector
          visible={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          onSelectTask={handleTaskSelect}
          selectedTask={selectedTask}
          tasks={milestoneTasks}
          domainColor={domainColor}
          theme={theme}
          isDarkMode={isDarkMode}
          // Add responsive props
          spacing={spacing}
          fontSizes={fontSizes}
          accessibility={accessibility}
        />
      )}

      {showUnsavedChangesModal && (
        <UnsavedChangesModal
          visible={showUnsavedChangesModal}
          onKeepEditing={() => setShowUnsavedChangesModal(false)}
          onDiscard={discardChangesAndGoBack}
          theme={theme}
          // Add responsive props
          spacing={spacing}
          fontSizes={fontSizes}
        />
      )}

      {showGoalRequiredModal && (
        <GoalRequiredModal
          visible={showGoalRequiredModal}
          onClose={() => setShowGoalRequiredModal(false)}
          onNavigateToGoals={navigateToGoals}
          onNavigateToMilestones={navigateToMilestones}
          type={goalRequiredModalType}
          theme={theme}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Date/Time Pickers */}
      <CustomDateTimePicker
        visible={showDatePicker}
        onClose={hidePickers}
        onChange={handleDateChange}
        mode="date"
        value={startTime}
        title="Select Date"
        theme={theme}
        datePickerMode={datePickerMode}
        onDatePickerModeChange={handleDatePickerModeChange}
        // Add responsive props
        spacing={spacing}
        fontSizes={fontSizes}
      />

      <CustomDateTimePicker
        visible={showStartTimePicker}
        onClose={hidePickers}
        onChange={handleDateChange}
        mode="time"
        value={startTime}
        title="Select Start Time"
        theme={theme}
        // Add responsive props
        spacing={spacing}
        fontSizes={fontSizes}
      />

      <CustomDateTimePicker
        visible={showEndTimePicker}
        onClose={hidePickers}
        onChange={handleDateChange}
        mode="time"
        value={endTime}
        title="Select End Time"
        theme={theme}
        // Add responsive props
        spacing={spacing}
        fontSizes={fontSizes}
      />

      <CustomDateTimePicker
        visible={showRepeatUntilDatePicker}
        onClose={hidePickers}
        onChange={handleDateChange}
        mode="date"
        value={repeatUntil || new Date(startTime.getTime() + 30 * 24 * 60 * 60 * 1000)}
        title="Repeat Until Date"
        theme={theme}
        minimumDate={new Date(startTime.getTime() + 24 * 60 * 60 * 1000)}
        datePickerMode={datePickerMode}
        onDatePickerModeChange={handleDatePickerModeChange}
        // Add responsive props
        spacing={spacing}
        fontSizes={fontSizes}
      />

      {/* Title Edit Modal */}
      <Modal
        visible={showTitleEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleTitleCancel}
      >
        <KeyboardAvoidingView 
          style={styles.titleEditModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity 
            style={styles.titleEditModalOverlay}
            activeOpacity={1}
            onPress={handleTitleCancel}
          >
            <TouchableOpacity 
              style={[styles.titleEditModalContainer, { backgroundColor: theme.background }]}
              activeOpacity={1}
              onPress={() => {}} // Prevent modal from closing when tapping inside
            >
              {/* Header */}
              <View style={styles.titleEditModalHeader}>
                <View style={[styles.cleanModalIconContainer, { backgroundColor: theme.surface }]}>
                  <Ionicons name="create-outline" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.cleanModalTitle, { color: theme.text }]}>Edit Time Block Name</Text>
                <Text style={[styles.cleanModalSubtitle, { color: theme.textSecondary }]}>
                  Choose a memorable name for your time block
                </Text>
              </View>

              {/* Text Input */}
              <View style={styles.titleEditInputContainer}>
                <TextInput
                  style={[styles.titleEditInput, { 
                    color: theme.text, 
                    backgroundColor: theme.card, 
                    borderColor: theme.border 
                  }]}
                  value={tempTitle}
                  onChangeText={setTempTitle}
                  placeholder="Enter time block name..."
                  placeholderTextColor={theme.textSecondary}
                  autoFocus={true}
                  maxLength={50}
                />
              </View>

              {/* Buttons */}
              <View style={styles.titleEditModalButtons}>
                <TouchableOpacity
                  style={[styles.titleEditCancelButton, { backgroundColor: theme.card }]}
                  onPress={handleTitleCancel}
                >
                  <Text style={[styles.titleEditCancelText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.titleEditSaveButton, { backgroundColor: theme.primary }]}
                  onPress={handleTitleSave}
                >
                  <Text style={styles.titleEditSaveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Full-screen Delete Confirmation Overlay */}
      {showDeleteConfirmation && (
        <View style={styles.fullScreenOverlay}>
          <View style={[styles.confirmationContent, { backgroundColor: theme.card }]}>
            <View style={styles.confirmationHeader}>
              <Ionicons 
                name="warning" 
                size={48} 
                color={theme.error} 
                style={styles.warningIcon}
              />
              <Text style={[styles.confirmationTitle, { color: theme.text }]}>
                Delete Time Block
              </Text>
            </View>

            <Text style={[styles.confirmationMessage, { color: theme.textSecondary }]}>
              {(initialTimeBlock?.isRepeating || initialTimeBlock?.isRepeatingInstance) 
                ? 'Would you like to delete this instance or the entire series?'
                : 'This action cannot be undone. Are you sure you want to delete this time block?'
              }
            </Text>

            <View style={styles.confirmationButtons}>
              {(initialTimeBlock?.isRepeating || initialTimeBlock?.isRepeatingInstance) ? (
                // Recurring block options
                <>
                  <TouchableOpacity
                    style={[styles.confirmationButton, styles.instanceButton, { backgroundColor: theme.error }]}
                    onPress={() => handleConfirmDelete('single')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.confirmationButtonText, { color: '#FFFFFF' }]}>
                      Delete Instance
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.confirmationButton, styles.seriesButton, { backgroundColor: theme.error }]}
                    onPress={() => handleConfirmDelete('series')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.confirmationButtonText, { color: '#FFFFFF' }]}>
                      Delete Series
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.confirmationButton, styles.cancelButton, { 
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      borderColor: theme.textSecondary
                    }]}
                    onPress={handleCancelDelete}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.confirmationButtonText, { color: theme.text }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Regular block confirmation
                <>
                  <TouchableOpacity
                    style={[styles.confirmationButton, styles.deleteButton, { backgroundColor: theme.error }]}
                    onPress={() => handleConfirmDelete()}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.confirmationButtonText, { color: '#FFFFFF' }]}>
                      Delete Time Block
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.confirmationButton, styles.cancelButton, { 
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      borderColor: theme.textSecondary
                    }]}
                    onPress={handleCancelDelete}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.confirmationButtonText, { color: theme.text }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Floating Edit Mode Toggle Button - only show when editing a recurring timeblock */}
      {!isCreating && (initialTimeBlock?.isRepeating || initialTimeBlock?.isRepeatingInstance) && (
        <View style={styles.floatingButtonContainer}>
          <View style={[styles.floatingEditSeriesButton, { backgroundColor: theme.primary }]}>
            {/* Main toggle area */}
            <TouchableOpacity
              style={styles.floatingButtonMainArea}
              onPress={React.useCallback(() => {
                // Toggle between series and instance editing
                const newIsEditingSeries = !isEditingSeries;
                setIsEditingSeries(newIsEditingSeries);
                
                // When switching to instance editing, default repeat to OFF
                // When switching to series editing, restore original repeat state
                if (newIsEditingSeries) {
                  // Switching to series - restore original repeat settings
                  if (initialTimeBlock?.isRepeating) {
                    setIsRepeating(true);
                    setRepeatFrequency(initialTimeBlock.repeatFrequency || 'weekly');
                    setRepeatIndefinitely(initialTimeBlock.repeatIndefinitely || true);
                    if (initialTimeBlock.repeatUntil) {
                      setRepeatUntil(new Date(initialTimeBlock.repeatUntil));
                      setRepeatIndefinitely(false);
                    }
                  }
                } else {
                  // Switching to instance - default to non-repeating
                  setIsRepeating(false);
                }
              }, [isEditingSeries, initialTimeBlock])}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={isEditingSeries ? "Switch to editing single instance" : "Switch to editing entire series"}
            >
              {/* Frequency badge on the left */}
              {isEditingSeries && (initialTimeBlock?.isRepeating || initialTimeBlock?.isRepeatingInstance) && (
                <View style={[styles.floatingFrequencyBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.floatingFrequencyText}>
                    {initialTimeBlock?.repeatFrequency === 'daily' ? 'D' : 
                     initialTimeBlock?.repeatFrequency === 'weekly' ? 'W' : 
                     initialTimeBlock?.repeatFrequency === 'monthly' ? 'M' : 'R'}
                  </Text>
                </View>
              )}
              
              <Ionicons 
                name={isEditingSeries ? "repeat" : "document-text"} 
                size={20} 
                color="#FFFFFF" 
                style={{ marginLeft: isEditingSeries ? 8 : 0 }}
              />
              <Text style={[styles.floatingEditSeriesText, { color: '#FFFFFF' }]}>
                {isEditingSeries ? 'Editing Series' : 'Editing Instance'}
              </Text>
            </TouchableOpacity>
            
            {/* Info area on the right */}
            <TouchableOpacity
              style={styles.floatingButtonInfoArea}
              onPress={() => setShowSeriesInfoModal(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Learn about series vs instance editing"
            >
              <View style={styles.floatingButtonDivider} />
              <Ionicons name="help-circle-outline" size={18} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Series Info Modal - Clean Minimalistic Design */}
      <Modal
        visible={showSeriesInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSeriesInfoModal(false)}
      >
        <TouchableOpacity 
          style={styles.infoModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSeriesInfoModal(false)}
        >
          <View style={[styles.infoModalContainer, { backgroundColor: theme.card }]}>
            <View style={styles.infoModalContent}>
              <Text style={[styles.infoModalTitle, { color: theme.text }]}>
                Editing Options
              </Text>
              
              <View style={styles.infoOptionRow}>
                <View style={[styles.infoOptionIcon, { backgroundColor: theme.primary }]}>
                  <Ionicons name="repeat" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.infoOptionContent}>
                  <Text style={[styles.infoOptionTitle, { color: theme.text }]}>Series</Text>
                  <Text style={[styles.infoOptionDesc, { color: theme.textSecondary }]}>Edit all recurring events</Text>
                </View>
              </View>
              
              <View style={styles.infoOptionRow}>
                <View style={[styles.infoOptionIcon, { backgroundColor: theme.textSecondary }]}>
                  <Ionicons name="document-text" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.infoOptionContent}>
                  <Text style={[styles.infoOptionTitle, { color: theme.text }]}>Instance</Text>
                  <Text style={[styles.infoOptionDesc, { color: theme.textSecondary }]}>Edit only this event</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Enhanced Conflict Warning Modal */}
      <Modal
        visible={showConflictModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConflictModal(false)}
      >
        <TouchableOpacity 
          style={styles.conflictModalOverlay}
          activeOpacity={1}
          onPress={() => setShowConflictModal(false)}
        >
          <View style={[styles.enhancedConflictModalContainer, { backgroundColor: theme.card }]}>
            <ScrollView 
              style={styles.conflictModalScroll}
              contentContainerStyle={styles.conflictModalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.conflictModalIcon, { backgroundColor: '#FF3B3015' }]}>
                <Ionicons name="warning" size={28} color="#FF3B30" />
              </View>
              
              <Text style={[styles.conflictModalTitle, { color: theme.text }]}>
                {conflictData?.conflictingInstances?.length > 0 ? 'Recurring Event Conflicts' : 'Time Conflict'}
              </Text>
              
              {conflictData?.conflictingInstances?.length > 0 ? (
                <>
                  <Text style={[styles.conflictModalSummary, { color: theme.textSecondary }]}>
                    {conflictData.conflictCount} of {conflictData.totalInstances} recurring events will conflict with existing timeblocks.
                  </Text>
                  
                  <View style={styles.conflictDetailsList}>
                    {conflictData.conflictingInstances.slice(0, 5).map((conflictInstance, index) => (
                      <View key={index} style={[styles.conflictDetailItem, { backgroundColor: theme.surface }]}>
                        <View style={styles.conflictItemHeader}>
                          <Ionicons name="calendar" size={14} color={theme.textSecondary} />
                          <Text style={[styles.conflictItemDate, { color: theme.text }]}>
                            {new Date(conflictInstance.instance.startTime).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </Text>
                          <Text style={[styles.conflictItemTime, { color: theme.textSecondary }]}>
                            {formatTime(new Date(conflictInstance.instance.startTime))} - {formatTime(new Date(conflictInstance.instance.endTime))}
                          </Text>
                        </View>
                        <Text style={[styles.conflictItemConflicts, { color: theme.textSecondary }]}>
                          Conflicts with: {conflictInstance.conflicts.map(c => c.title).join(', ')}
                        </Text>
                      </View>
                    ))}
                    {conflictData.conflictingInstances.length > 5 && (
                      <Text style={[styles.conflictMoreText, { color: theme.textSecondary }]}>
                        +{conflictData.conflictingInstances.length - 5} more conflicts...
                      </Text>
                    )}
                  </View>
                </>
              ) : (
                <Text style={[styles.conflictModalDescription, { color: theme.textSecondary }]}>
                  This time overlaps with: {conflictDetails}
                </Text>
              )}
              
              <View style={styles.conflictModalButtons}>
                <TouchableOpacity
                  style={[styles.conflictModalButton, styles.conflictCancelButton, { borderColor: theme.border }]}
                  onPress={() => setShowConflictModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.conflictModalButtonText, { color: theme.text }]}>Adjust Time</Text>
                </TouchableOpacity>
                
                {conflictData?.conflictingInstances?.length > 0 && (
                  <TouchableOpacity
                    style={[styles.conflictModalButton, styles.conflictSkipButton, { 
                      backgroundColor: theme.primary,
                      borderColor: theme.primary 
                    }]}
                    onPress={() => {
                      // Prevent multiple clicks
                      if (isSaving) {
                        console.log('🚨 Skip Conflicts button clicked but already saving - ignoring');
                        return;
                      }

                      console.log('Skip Conflicts: Creating only non-conflicting timeblock instances');
                      setShowConflictModal(false);
                      setTimeError('');
                      
                      // Call the skip conflicts function
                      handleSaveSkipConflicts().catch(error => {
                        console.error('Error in Skip Conflicts:', error);
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.conflictModalButtonText, { color: '#FFFFFF' }]}>Skip Conflicts</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[styles.conflictModalButton, styles.conflictSaveButton, { backgroundColor: '#FF3B30' }]}
                  onPress={async () => {
                    // Prevent Create Anyway if Skip Conflicts is in progress
                    if (isSaving) {
                      console.log('🚨 CREATE ANYWAY BUTTON: Blocked - Skip Conflicts in progress');
                      return;
                    }
                    
                    console.log('🚨 CREATE ANYWAY BUTTON: Pressed');
                    setShowConflictModal(false);
                    setTimeError('');
                    // Directly call the save logic bypassing conflict detection
                    await handleSaveBypassConflicts();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.conflictModalButtonText, { color: '#FFFFFF' }]}>Create Anyway</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontWeight: '600',
    textAlign: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  titlePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  titleEditIcon: {
    marginLeft: 6,
    opacity: 0.6,
  },
  saveButton: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  saveButtonText: {
    fontWeight: '600',
  },
  // Title Edit Modal Styles
  titleEditModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleEditModalContainer: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    paddingBottom: 24,
  },
  titleEditModalHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  cleanModalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cleanModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  cleanModalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  titleEditInputContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  titleEditInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  titleEditModalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
  },
  titleEditCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  titleEditSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  titleEditCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  titleEditSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Full-screen confirmation overlay styles
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmationContent: {
    width: '85%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  warningIcon: {
    marginBottom: 12,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmationMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  confirmationButtons: {
    width: '100%',
    gap: 12,
  },
  confirmationButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  confirmationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  deleteButton: {
    // Styles applied inline
  },
  instanceButton: {
    // Styles applied inline
  },
  seriesButton: {
    // Styles applied inline
  },
  cancelButton: {
    // Styles applied inline
  },
  // Floating Button Container
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  // Floating Edit Series Button Styles
  floatingEditSeriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
    backgroundColor: '#007AFF', // Fallback color
    overflow: 'hidden',
  },
  floatingButtonMainArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
  },
  floatingButtonInfoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  floatingButtonDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: 12,
  },
  floatingEditSeriesText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  floatingFrequencyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingFrequencyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Clean Info Modal Styles
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  infoModalContainer: {
    borderRadius: 16,
    padding: 24,
    maxWidth: 280,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  infoModalContent: {
    alignItems: 'center',
  },
  infoModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  infoOptionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoOptionContent: {
    flex: 1,
  },
  infoOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 1,
  },
  infoOptionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  // Enhanced Conflict Modal Styles
  conflictModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  enhancedConflictModalContainer: {
    borderRadius: 16,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  conflictModalScroll: {
    maxHeight: '100%',
  },
  conflictModalContent: {
    padding: 24,
    alignItems: 'center',
  },
  conflictModalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  conflictModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  conflictModalSummary: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  conflictModalDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  conflictDetailsList: {
    width: '100%',
    marginBottom: 24,
  },
  conflictDetailItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  conflictItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  conflictItemDate: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  conflictItemTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  conflictItemConflicts: {
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 20,
  },
  conflictMoreText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  conflictModalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 4,
  },
  conflictModalButton: {
    flex: 1,
    minWidth: 100,
    maxWidth: 140,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conflictCancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  conflictSkipButton: {
    // Uses inline styles
  },
  conflictSaveButton: {
    // Uses inline styles
  },
  conflictModalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});

export default TimeBlockScreen;