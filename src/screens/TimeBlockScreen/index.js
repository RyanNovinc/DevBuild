// src/screens/TimeBlockScreen/index.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Keyboard,
  BackHandler,
  Platform,
  Alert,
  Animated
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
import ProjectSelector from './ProjectSelector';
import TaskSelector from './TaskSelector';
import TimeBlockForm from './TimeBlockForm';
import UnsavedChangesModal from './UnsavedChangesModal';

const TimeBlockScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { mainGoals, projects, addTimeBlock, updateTimeBlock, deleteTimeBlock, timeBlocks } = useAppContext();
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
  
  const { mode, timeBlock: initialTimeBlock, date, prefilledStartTime, prefilledEndTime } = route.params || { mode: 'create' };
  const isCreating = mode === 'create';

  // Animation values
  const saveButtonScale = useRef(new Animated.Value(1)).current;
  const contentFadeIn = useRef(new Animated.Value(0)).current;
  
  // Track if changes were made
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // For the unsaved changes modal
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  
  // Function to extract all tasks from projects
  const getAllTasks = () => {
    if (!Array.isArray(projects)) return [];
    
    // Collect all tasks from all projects
    const allTasks = [];
    projects.forEach(project => {
      if (project && Array.isArray(project.tasks)) {
        // Add project ID to each task for reference
        const projectTasks = project.tasks.map(task => ({
          ...task,
          projectId: project.id
        }));
        allTasks.push(...projectTasks);
      }
    });
    
    return allTasks;
  };
  
  // Tab state
  const [activeTab, setActiveTab] = useState(initialTimeBlock?.isGeneralActivity ? 'general' : 'goal');
  
  // State for goal-focused blocks
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('');
  const [domainColor, setDomainColor] = useState('#4CAF50');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null); // New state for task selection
  
  // State for general activity blocks
  const [category, setCategory] = useState(initialTimeBlock?.category || 'Personal');
  const [customColor, setCustomColor] = useState(initialTimeBlock?.customColor || '#4285F4');
  
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
  
  // State for project selection modal
  const [showProjectModal, setShowProjectModal] = useState(false);
  
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
  
  // Get all tasks from projects
  const allTasks = getAllTasks();
  
  // Get available goals, filtering out completed ones
  const availableGoals = Array.isArray(mainGoals) 
    ? mainGoals.filter(goal => !goal.completed)
    : [];
    
  // Get projects for the currently selected goal
  const goalProjects = Array.isArray(projects) 
    ? projects.filter(project => {
        // If there's no selected domain, show all projects
        if (!domain) return true;
        // Otherwise, filter projects by the selected goal
        const matchingGoal = Array.isArray(mainGoals) ? mainGoals.find(goal => goal.title === domain) : null;
        return matchingGoal ? project.goalId === matchingGoal.id : false;
      })
    : [];
    
  // Get tasks for the currently selected project
  const projectTasks = Array.isArray(allTasks)
    ? allTasks.filter(task => {
        if (!selectedProject) return false;
        return task.projectId === selectedProject.id && !task.completed;
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
      console.log("Editing time block:", initialTimeBlock);
      
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
      } else {
        // Find the matching goal for the time block domain
        const matchingGoal = Array.isArray(mainGoals) ? 
          mainGoals.find(goal => goal.title === initialTimeBlock.domain) : null;
        
        if (matchingGoal) {
          console.log("Found matching goal:", matchingGoal.title);
          setDomain(matchingGoal.title);
          setDomainColor(matchingGoal.color || initialTimeBlock.domainColor || '#4CAF50');
        } else {
          // If no matching goal found, still set the domain to preserve it
          console.log("No matching goal found, using time block domain");
          setDomain(initialTimeBlock.domain);
          setDomainColor(initialTimeBlock.domainColor || '#4CAF50');
        }
        
        // Set project if available
        if (initialTimeBlock.projectId && Array.isArray(projects)) {
          const project = projects.find(p => p.id === initialTimeBlock.projectId);
          if (project) {
            setSelectedProject(project);
            
            // Set task if available
            if (initialTimeBlock.taskId) {
              // Find task in all tasks array
              const tasks = getAllTasks();
              const task = tasks.find(t => t.id === initialTimeBlock.taskId);
              if (task) {
                setSelectedTask(task);
              }
            }
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
        projectId: initialTimeBlock.projectId || null,
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

      // Store initial values for a new time block
      setInitialValues({
        title: '',
        tab: 'goal', // Default tab
        domain: '',
        domainColor: '#4CAF50',
        category: 'Personal',
        customColor: '#4285F4',
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
        projectId: null,
        taskId: null
      });
      
      // Reset unsaved changes flag
      setHasUnsavedChanges(false);
    }
    
    // If we have main goals, set the default domain to the first non-completed goal
    if (Array.isArray(mainGoals) && mainGoals.length > 0 && isCreating && activeTab === 'goal') {
      // Filter for non-completed goals
      const activeGoals = mainGoals.filter(goal => !goal.completed);
      if (activeGoals.length > 0) {
        setDomain(activeGoals[0].title);
        setDomainColor(activeGoals[0].color);
      }
    }
  }, [isCreating, initialTimeBlock, date, mainGoals, projects]);
  
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
      (selectedProject && selectedProject.id !== initialValues.projectId) ||
      (selectedTask && selectedTask.id !== initialValues.taskId);
    
    setHasUnsavedChanges(hasChanges);
  }, [
    title, activeTab, domain, category, customColor, startTime, endTime,
    location, notes, isCompleted, isRepeating, repeatFrequency,
    repeatIndefinitely, repeatUntil, enableNotification, notificationTime,
    customMinutes, selectedProject, selectedTask, initialValues
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
  
  // Function to check for time block overlaps
  const checkForOverlaps = () => {
    // Make sure we're working with an array
    if (!Array.isArray(timeBlocks)) return false;
    
    // Get the date string to compare only blocks on the same day
    const blockDate = startTime.toDateString();
    
    const overlaps = timeBlocks.filter(block => {
      // Skip the current block if we're editing
      if (!isCreating && initialTimeBlock && block.id === initialTimeBlock.id) {
        return false;
      }
      
      // Only check blocks on the same day
      const existingBlockDate = new Date(block.startTime).toDateString();
      if (existingBlockDate !== blockDate) {
        return false;
      }
      
      const blockStart = new Date(block.startTime);
      const blockEnd = new Date(block.endTime);
      
      // Check for overlap: 
      // new start time is within an existing block
      // OR new end time is within an existing block
      // OR new block completely contains an existing block
      return (
        (startTime >= blockStart && startTime < blockEnd) ||
        (endTime > blockStart && endTime <= blockEnd) ||
        (startTime <= blockStart && endTime >= blockEnd)
      );
    });
    
    return overlaps.length > 0 ? overlaps : false;
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
    // Animate the save button
    animateSaveButton();
    
    // Clear any previous errors
    setTimeError('');
    
    // Validate input
    if (!title.trim()) {
      notification.showError('Please enter a title');
      return;
    }
    
    if (activeTab === 'goal' && !domain.trim()) {
      notification.showSuccess('Please select a goal', { type: 'warning' });
      return;
    }
    
    if (activeTab === 'general' && !category.trim()) {
      notification.showSuccess('Please select a category', { type: 'warning' });
      return;
    }
    
    // Check for time block overlaps
    const overlaps = checkForOverlaps();
    if (overlaps) {
      // Show error about overlapping time blocks
      setTimeError('This time block overlaps with an existing time block.');
      
      // Get the first overlapping block for details
      const firstOverlap = overlaps[0];
      const overlapStart = new Date(firstOverlap.startTime);
      const overlapEnd = new Date(firstOverlap.endTime);
      
      // Detailed error modal
      Alert.alert(
        'Time Conflict',
        `This time block overlaps with "${firstOverlap.title}" scheduled from ${formatTime(overlapStart)} to ${formatTime(overlapEnd)}.`,
        [
          { 
            text: 'Adjust Time',
            style: 'cancel'
          },
          {
            text: 'View Conflict',
            onPress: () => {
              navigation.goBack();
              // You might add a way to highlight the conflicting block in TimeScreen
            }
          }
        ]
      );
      return;
    }
    
    // Find matching goal to get its color
    const selectedGoal = Array.isArray(mainGoals) ? 
      mainGoals.find(goal => goal.title === domain) : null;
    const selectedColor = selectedGoal ? selectedGoal.color : domainColor;
    
    // Get the project ID if a project is selected
    const projectId = selectedProject ? selectedProject.id : null;
    
    // Get the task ID if a task is selected
    const taskId = selectedTask ? selectedTask.id : null;
    
    // NEW: Also store the project and task titles
    const projectTitle = selectedProject ? selectedProject.title : null;
    const taskTitle = selectedTask ? selectedTask.title : null;
    
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
      projectId: activeTab === 'goal' ? projectId : null,
      projectTitle: activeTab === 'goal' ? projectTitle : null, // NEW: Store project title
      taskId: activeTab === 'goal' ? taskId : null,
      taskTitle: activeTab === 'goal' ? taskTitle : null, // NEW: Store task title
      
      // For General Activity time blocks
      category: activeTab === 'general' ? category : null,
      customColor: activeTab === 'general' ? customColor : null,
      
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
    
    // Handle notification scheduling
    let newNotificationId = null;
    if (enableNotification) {
      try {
        // Check if the notification time is in the future
        const now = new Date();
        let notificationDateTime = new Date(startTime);
        
        // Adjust based on preference
        if (notificationTime === 'custom' && validatedMinutes) {
          // Convert custom minutes to milliseconds and subtract from start time
          const minutesMs = parseInt(validatedMinutes, 10) * 60 * 1000;
          notificationDateTime = new Date(startTime.getTime() - minutesMs);
        }
        // For 'exact', no adjustment needed
        
        // Only schedule if the notification time is in the future
        if (notificationDateTime > now) {
          console.log(`Scheduling notification for future time: ${notificationDateTime.toLocaleString()}`);
          
          // Use the simpler notification helper
          newNotificationId = await scheduleTimeBlockNotificationSimple({
            ...timeBlock,
            notification: true,
            notificationDateTime: notificationDateTime.toISOString()
          });
          
          if (newNotificationId) {
            console.log(`Notification scheduled with ID: ${newNotificationId}`);
            // Update the notification ID in the time block
            timeBlock.notificationId = newNotificationId;
          } else {
            console.log('Failed to schedule notification');
          }
        } else {
          console.log('Notification time is in the past, not scheduling');
          // If scheduling failed but notifications were enabled, tell the user
          Alert.alert(
            'Notification Not Scheduled',
            'The notification could not be scheduled because the time has already passed.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error scheduling notification:', error);
        // Continue with saving the time block even if notification fails
      }
    }
    
    // Save time block
    try {
      if (isCreating) {
        await addTimeBlock(timeBlock);
        notification.showSuccess('Time block created');
      } else {
        await updateTimeBlock(timeBlock);
        notification.showSuccess('Time block updated');
      }
      
      // Reset hasUnsavedChanges flag
      setHasUnsavedChanges(false);
      
      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error('Error saving time block:', error);
      notification.showError('Failed to save time block');
    }
  };
  
  const handleDelete = async () => {
    if (!initialTimeBlock) {
      return;
    }
    
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
      
      // If this is a repeating block, confirm if user wants to delete all instances
      if (initialTimeBlock.isRepeating && !initialTimeBlock.isRepeatingInstance) {
        Alert.alert(
          'Delete Repeating Time Block',
          'Would you like to delete this time block and all of its future repeating instances?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Delete All',
              style: 'destructive',
              onPress: () => {
                deleteTimeBlock(initialTimeBlock.id);
                notification.showSuccess('Time block and all its instances deleted');
                // Reset hasUnsavedChanges flag
                setHasUnsavedChanges(false);
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        // Single instance or regular block, just delete it
        deleteTimeBlock(initialTimeBlock.id);
        notification.showSuccess('Time block deleted');
        // Reset hasUnsavedChanges flag
        setHasUnsavedChanges(false);
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error during time block deletion:', error);
      notification.showError('Failed to delete time block');
    }
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
  
  // Handle project selection
  const handleProjectSelect = (project) => {
    // If selecting a different project, clear the task selection
    if ((!selectedProject && project) || (selectedProject && project && selectedProject.id !== project.id)) {
      setSelectedTask(null);
    }
    
    setSelectedProject(project);
    setShowProjectModal(false);
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
  
  // Format date for display (e.g., "Mon, May 8")
  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
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
  
  // Open project selection modal
  const openProjectModal = () => {
    setShowProjectModal(true);
  };
  
  // Open task selection modal
  const openTaskModal = () => {
    // Only show task modal if a project is selected
    if (selectedProject) {
      setShowTaskModal(true);
    } else {
      Alert.alert(
        'Select a Project First',
        'Please select a project before selecting a task.',
        [{ text: 'OK' }]
      );
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
        <Text 
          style={[
            styles.screenTitle, 
            { 
              color: theme.text,
              fontSize: getResponsiveSize({
                small: fontSizes.m,
                medium: fontSizes.l,
                large: fontSizes.l,
                tablet: fontSizes.xl
              })
            }
          ]}
          accessibilityRole="header"
          maxFontSizeMultiplier={1.3}
        >
          {isCreating ? 'Create Time Block' : 'Edit Time Block'}
        </Text>
        <Animated.View style={{ transform: [{ scale: saveButtonScale }] }}>
          <TouchableOpacity 
            style={[
              styles.saveButton,
              ensureAccessibleTouchTarget(50, 44)
            ]} 
            onPress={handleSave}
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
            paddingBottom: safeSpacing.bottom + spacing.xl // Add safe area bottom padding
          }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          enableResetScrollToCoords={false}
          keyboardOpeningTime={0}
          extraHeight={getResponsiveSize({
            small: 150,
            medium: 180,
            large: 200,
            tablet: 250
          })}
          extraScrollHeight={getResponsiveSize({
            small: 30,
            medium: 50,
            large: 60,
            tablet: 80
          })}
          style={{ backgroundColor: theme.background, flex: 1 }}
        >
          {/* Main form component with accessibility props */}
          <TimeBlockForm
            title={title}
            setTitle={setTitle}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            domain={domain}
            setDomain={setDomain}
            domainColor={domainColor}
            setDomainColor={setDomainColor}
            selectedProject={selectedProject}
            selectedTask={selectedTask}
            openProjectModal={openProjectModal}
            openTaskModal={openTaskModal}
            category={category}
            setCategory={setCategory}
            customColor={customColor}
            openColorModal={openColorModal}
            openDatePicker={openDatePicker}
            openStartTimePicker={openStartTimePicker}
            openEndTimePicker={openEndTimePicker}
            startTime={startTime}
            endTime={endTime}
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
            goalProjects={goalProjects}
            projectTasks={projectTasks}
            handleDelete={handleDelete}
            isCreating={isCreating}
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

      {/* Modals */}
      <ColorPicker
        visible={showColorModal}
        onClose={() => setShowColorModal(false)}
        onColorSelect={handleColorSelect}
        selectedColor={customColor}
        colorOptions={colorOptions}
        theme={theme}
        isDarkMode={isDarkMode}
      />

      <ProjectSelector
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelectProject={handleProjectSelect}
        selectedProject={selectedProject}
        projects={goalProjects}
        domainColor={domainColor}
        theme={theme}
        isDarkMode={isDarkMode}
        // Add responsive props
        spacing={spacing}
        fontSizes={fontSizes}
        accessibility={accessibility}
      />

      <TaskSelector
        visible={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSelectTask={handleTaskSelect}
        selectedTask={selectedTask}
        tasks={projectTasks}
        domainColor={domainColor}
        theme={theme}
        isDarkMode={isDarkMode}
        // Add responsive props
        spacing={spacing}
        fontSizes={fontSizes}
        accessibility={accessibility}
      />

      <UnsavedChangesModal
        visible={showUnsavedChangesModal}
        onKeepEditing={() => setShowUnsavedChangesModal(false)}
        onDiscard={discardChangesAndGoBack}
        theme={theme}
        // Add responsive props
        spacing={spacing}
        fontSizes={fontSizes}
      />

      {/* Date/Time Pickers */}
      <CustomDateTimePicker
        visible={showDatePicker}
        onClose={hidePickers}
        onChange={handleDateChange}
        mode="date"
        value={startTime}
        title="Select Date"
        theme={theme}
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
        // Add responsive props
        spacing={spacing}
        fontSizes={fontSizes}
      />
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
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  saveButtonText: {
    fontWeight: '600',
  },
  // REMOVED: Floating Add Button styles
});

export default TimeBlockScreen;