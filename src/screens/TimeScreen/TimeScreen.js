// src/screens/TimeScreen/TimeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import FeatureExplorerTracker from '../../services/FeatureExplorerTracker';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '../../context/NotificationContext';
import { 
  formatDate, 
  getWeekDates, 
  getMonthDates, 
  getDayName, 
  getMonthName 
} from '../../utils/helpers';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  useScreenDimensions,
  useIsLandscape,
  ensureAccessibleTouchTarget,
  useSafeSpacing
} from '../../utils/responsive';

// Import our views
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';

// Import helper functions
import { 
  generateRepeatingInstances, 
  formatTime, 
  getDarkerShade
} from './TimeScreenHelpers';

// Import PDF generator
import { generateAndSharePDF } from './PDFGenerator';

// Import FreeTierLimitModal component
import FreeTierLimitModal from './FreeTierLimitModal';

// Import CalendarSettingsModal component
import CalendarSettingsModal from '../../components/CalendarSettingsModal';

const Tab = createMaterialTopTabNavigator();

/**
 * TimeScreen - Rewritten to use React Navigation's Tab Navigator
 * with Free Tier limitations implemented
 */
const TimeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const isDarkMode = theme.background === '#000000';
  const insets = useSafeAreaInsets();
  const safeSpacing = useSafeSpacing();
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  
  // Detect Dynamic Island
  const hasDynamicIsland = insets.top >= 59;
  
  // Get app context with safety for timeBlocks
  const appContext = useAppContext();
  const timeBlocks = appContext.timeBlocks || [];
  const userSubscriptionStatus = appContext.userSubscriptionStatus || 'free';
  const isPremium = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
  const { showSuccess } = useNotification();
  
  // Calendar integration
  const {
    calendarSettings = { syncEnabled: false, showCalendarEvents: true },
    calendarEvents = [],
    getCalendarEventsForDate,
    loadCalendarEvents,
    getCalendarIntegrationStatus
  } = appContext;
  
  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [monthDates, setMonthDates] = useState([]);
  const [selectedWeekDay, setSelectedWeekDay] = useState(0); // 0-6 (Monday-Sunday)
  const [selectedMonthDay, setSelectedMonthDay] = useState(new Date().getDate() - 1); // 0-based index
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Day'); // Track active tab
  const [tabNavigatorKey, setTabNavigatorKey] = useState(0); // Key to force remount
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState('');
  const isSelectingWithinWeekRef = useRef(false);
  
  // Calendar events state
  const [currentDateCalendarEvents, setCurrentDateCalendarEvents] = useState([]);
  const [showCalendarSettings, setShowCalendarSettings] = useState(false);
  
  // Reset to day view whenever screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setSelectedTab('Day');
      // Force tab navigator to remount with Day as initial tab
      setTabNavigatorKey(prev => prev + 1);
    }, [])
  );
  
  // Animation for button press
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Today's date for comparison
  const today = new Date();
  const todayDateString = today.toDateString();
  
  // Day view zoom implementation
  const [scale, setScale] = useState(1); 
  const lastScale = useRef(1);
  const scrollViewRef = useRef(null);
  
  // For tracking focal point and scroll position
  const startScrollY = useRef(0);
  const focalPoint = useRef({ x: 0, y: 0 });
  const contentHeight = useRef(0);
  
  // Time slots for day view (24-hour format)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i); // 0-23
  
  // Calculate hour height based on zoom level
  const getHourHeight = () => {
    return scaleHeight(60) * scale; // Base hour height is 60, scaled by zoom level
  };

  // Animate button press effect
  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  };

  // Simple +/- buttons zoom controls
  const handleZoomIn = () => {
    animateButtonPress();
    
    const newScale = Math.min(scale + 0.25, 3);
    
    // Use the middle of the viewport as focal point
    const viewportHeight = height;
    const viewportCenter = viewportHeight / 2;
    
    // Calculate new scroll position to maintain focal point
    if (scrollViewRef.current) {
      const newScrollY = calculateFocalZoom(scale, newScale, { x: 0, y: viewportCenter });
      scrollViewRef.current.scrollTo({ y: newScrollY, animated: true });
    }
    
    lastScale.current = newScale;
    setScale(newScale);
  };
  
  const handleZoomOut = () => {
    animateButtonPress();
    
    const newScale = Math.max(scale - 0.25, 0.5);
    
    // Use the middle of the viewport as focal point
    const viewportHeight = height;
    const viewportCenter = viewportHeight / 2;
    
    // Calculate new scroll position to maintain focal point
    if (scrollViewRef.current) {
      const newScrollY = calculateFocalZoom(scale, newScale, { x: 0, y: viewportCenter });
      scrollViewRef.current.scrollTo({ y: newScrollY, animated: true });
    }
    
    lastScale.current = newScale;
    setScale(newScale);
  };
  
  // Function to calculate focal-based scroll position
  const calculateFocalZoom = (oldScale, newScale, focal) => {
    // Get viewport height
    const viewportHeight = height;
    const scrollOffset = startScrollY.current;
    
    // Calculate focal point relative to the content
    const focalPointRelative = focal.y - (viewportHeight / 2) + scrollOffset;
    
    // Calculate the new scroll position
    const scaleFactor = newScale / oldScale;
    const newFocalPointRelative = focalPointRelative * scaleFactor;
    
    // Return new scroll position
    return newFocalPointRelative - (focal.y - (viewportHeight / 2));
  };
  
  // Store content size for calculations
  const onContentSizeChange = (width, height) => {
    contentHeight.current = height;
  };
  
  // Track scroll position
  const onScroll = (event) => {
    startScrollY.current = event.nativeEvent.contentOffset.y;
  };
  
  // Handle pinch gesture for zoom
  const onPinchGestureEvent = (event) => {
    // Get pinch scale and focal points
    const { scale: pinchScale, focalX, focalY } = event.nativeEvent;
    
    // Store the focal point location
    focalPoint.current = { x: focalX, y: focalY };
    
    // Calculate new scale with limits
    const newScale = Math.max(0.5, Math.min(lastScale.current * pinchScale, 3));
    
    // Only update if scale has changed significantly
    if (Math.abs(scale - newScale) > 0.01) {
      // Get current visible content area
      const viewportHeight = height;
      const scrollOffset = startScrollY.current;
      
      // Calculate focal point relative to the content
      const focalPointRelative = focalY - (viewportHeight / 2) + scrollOffset;
      
      // Calculate the new scroll position
      const scaleFactor = newScale / scale;
      const newFocalPointRelative = focalPointRelative * scaleFactor;
      const newScrollPosition = newFocalPointRelative - (focalY - (viewportHeight / 2));
      
      // Apply the new scroll position
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: newScrollPosition, animated: false });
      }
      
      // Update scale state
      setScale(newScale);
    }
  };

  // When pinch begins, save the current scale
  const onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScale.current = scale;
    }
  };

  // Reset to Day tab when component mounts
  useEffect(() => {
    setSelectedTab('Day');
  }, []);

  // Update week and month dates when current date changes
  useEffect(() => {
    // Don't recalculate week dates if we're just selecting within the current week
    if (!isSelectingWithinWeekRef.current) {
      const dates = getWeekDates(currentDate);
      setWeekDates(dates);
      
      const day = currentDate.getDay();
      const weekDayIndex = day === 0 ? 6 : day - 1;
      setSelectedWeekDay(weekDayIndex);
    } else {
      // Reset the flag after handling the selection
      isSelectingWithinWeekRef.current = false;
    }
    
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthDates = getMonthDates(year, month);
    setMonthDates(monthDates);
    setSelectedMonthDay(currentDate.getDate() - 1);
  }, [currentDate]);
  
  // Load calendar events when current date changes
  useEffect(() => {
    const loadCalendarEventsForDate = async () => {
      if (calendarSettings.showCalendarEvents && getCalendarEventsForDate) {
        try {
          const events = await getCalendarEventsForDate(currentDate);
          setCurrentDateCalendarEvents(events);
        } catch (error) {
          console.error('Error loading calendar events for date:', error);
          setCurrentDateCalendarEvents([]);
        }
      } else {
        setCurrentDateCalendarEvents([]);
      }
    };
    
    loadCalendarEventsForDate();
  }, [currentDate, calendarSettings.showCalendarEvents, getCalendarEventsForDate]);
  
  // Format current date based on selected view and tab
  const getFormattedDate = (selectedView) => {
    switch (selectedView) {
      case 'Week':
        const weekStart = weekDates[0];
        const weekEnd = weekDates[6];
        if (weekStart && weekEnd) {
          const startMonth = getMonthName(weekStart.getMonth(), true);
          const endMonth = getMonthName(weekEnd.getMonth(), true);
          
          if (startMonth === endMonth) {
            return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
          } else {
            return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
          }
        }
        return '';
      
      case 'Month':
        return `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`;
      
      case 'Day':
      default:
        return formatDate(currentDate, 'long');
    }
  };
  
  // Check if a date is today
  const isToday = (date) => {
    return date.toDateString() === todayDateString;
  };
  
  // Check if a date is beyond the free tier planning horizon
  const isBeyondFreePlanningHorizon = (date) => {
    if (isPremium) return false;
    
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14); // 2 weeks ahead
    
    return date > twoWeeksFromNow;
  };
  
  // Navigate to previous day/week/month
  const handlePrevious = (tabName) => {
    animateButtonPress();
    
    const newDate = new Date(currentDate);
    
    switch (tabName) {
      case 'Day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'Week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'Month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    
    setCurrentDate(newDate);
  };
  
  // Navigate to next day/week/month
  const handleNext = (tabName) => {
    animateButtonPress();
    
    const newDate = new Date(currentDate);
    
    switch (tabName) {
      case 'Day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'Week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'Month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    
    // Check for free tier planning horizon
    if (!isPremium && isBeyondFreePlanningHorizon(newDate)) {
      setLimitModalType('horizon');
      setShowLimitModal(true);
      return;
    }
    
    setCurrentDate(newDate);
  };
  
  // Go to today
  const handleToday = () => {
    animateButtonPress();
    setCurrentDate(new Date());
  };
  
  // Handle week day selection (just updates the selected index, doesn't change current date)
  const handleWeekDaySelect = (index) => {
    const newDate = new Date(weekDates[index]);
    
    // Check for free tier planning horizon
    if (!isPremium && isBeyondFreePlanningHorizon(newDate)) {
      setLimitModalType('horizon');
      setShowLimitModal(true);
      return;
    }
    
    // Only update the selected week day index - no need to change currentDate
    // This prevents any re-rendering and maintains scroll position
    setSelectedWeekDay(index);
  };
  
  // Handle month day selection
  const handleMonthDaySelect = (index) => {
    setSelectedMonthDay(index);
    const newDate = new Date(monthDates[index]);
    
    // Check for free tier planning horizon
    if (!isPremium && isBeyondFreePlanningHorizon(newDate)) {
      setLimitModalType('horizon');
      setShowLimitModal(true);
      return;
    }
    
    setCurrentDate(newDate);
  };
  
  // Function to get time blocks for a specific date
  const getTimeBlocksForDate = (date) => {
    // Safety check: if timeBlocks is not an array, return empty array
    if (!Array.isArray(timeBlocks)) {
      console.warn('timeBlocks is not an array in getTimeBlocksForDate');
      return [];
    }
    
    const dateString = date.toDateString();
    
    // Generate repeating instances
    const repeatingInstances = generateRepeatingInstances(timeBlocks, isPremium);
    
    // Combine original blocks with repeating instances
    const allBlocks = [...timeBlocks, ...repeatingInstances];
    
    const timeBlocksForDate = allBlocks.filter(block => {
      // Safety check: ensure block and block.startTime exist
      if (!block || !block.startTime) return false;
      
      const blockDate = new Date(block.startTime).toDateString();
      return blockDate === dateString;
    });
    
    // Add calendar events if enabled and available
    if (calendarSettings.showCalendarEvents) {
      const calendarEventsForDate = date.toDateString() === currentDate.toDateString() 
        ? currentDateCalendarEvents 
        : [];
      
      // Convert calendar events to time block format for display
      const calendarEventBlocks = calendarEventsForDate.map(event => ({
        id: `calendar_${event.id}`,
        title: event.title,
        startTime: event.startDate,
        endTime: event.endDate,
        location: event.location || '',
        description: event.notes || '',
        color: '#2196F3', // Blue color for calendar events
        isCalendarEvent: true,
        isReadOnly: event.isReadOnly !== false, // Default to read-only unless explicitly false
        source: event.source || 'device_calendar',
        originalEvent: event
      }));
      
      return [...timeBlocksForDate, ...calendarEventBlocks];
    }
    
    return timeBlocksForDate;
  };
  
  // Check weekly time block limit for free users
  const checkWeeklyTimeBlockLimit = () => {
    if (isPremium) return { limitReached: false };
    
    // Get current week dates
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Filter time blocks for current week
    const weeklyBlocks = timeBlocks.filter(block => {
      if (!block || !block.startTime) return false;
      
      const blockDate = new Date(block.startTime);
      return blockDate >= startOfWeek && blockDate <= endOfWeek;
    });
    
    const count = weeklyBlocks.length;
    const weeklyLimit = 5; // Free tier limit
    
    return {
      limitReached: count >= weeklyLimit,
      current: count,
      max: weeklyLimit
    };
  };
  
  // Function to add a new time block
  const handleAddTimeBlock = () => {
    animateButtonPress();
    
    // Check for free tier planning horizon
    if (!isPremium && isBeyondFreePlanningHorizon(currentDate)) {
      setLimitModalType('horizon');
      setShowLimitModal(true);
      return;
    }
    
    // Check weekly time block limit for free users
    const { limitReached, current, max } = checkWeeklyTimeBlockLimit();
    
    if (limitReached) {
      setLimitModalType('weeklyLimit');
      setShowLimitModal(true);
      return;
    }
    
    navigation.navigate('TimeBlock', { mode: 'create', date: currentDate, isPremium });
  };
  
  // Function to view time block details
  const handleTimeBlockPress = (timeBlock) => {
    // If this is a calendar event, show info alert
    if (timeBlock.isCalendarEvent) {
      const startTime = new Date(timeBlock.startTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const endTime = new Date(timeBlock.endTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      let message = `${startTime} - ${endTime}`;
      if (timeBlock.location) {
        message += `\n📍 ${timeBlock.location}`;
      }
      if (timeBlock.description) {
        message += `\n\n${timeBlock.description}`;
      }
      message += `\n\n📅 From ${timeBlock.source === 'device_calendar' ? 'Device Calendar' : timeBlock.source}`;
      
      Alert.alert(
        timeBlock.title,
        message,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // If this is a repeating instance, show options
    if (timeBlock.isRepeatingInstance) {
      Alert.alert(
        'Edit Repeating Time Block',
        'Would you like to edit just this instance or the entire repeating series?',
        [
          {
            text: 'This Instance Only',
            onPress: () => {
              // Create a copy of the instance without repeating properties
              const standaloneBlock = {
                ...timeBlock,
                id: `standalone_${timeBlock.id}`, // Create a new ID for this standalone instance
                isRepeating: false, // Not repeating anymore
                isRepeatingInstance: false, // Not an instance
                originalTimeBlockId: null // No original block
              };
              navigation.navigate('TimeBlock', { mode: 'edit', timeBlock: standaloneBlock, isPremium });
            }
          },
          {
            text: 'Entire Series',
            onPress: () => {
              // Find the original block
              const originalBlock = timeBlocks.find(block => 
                !block.isRepeatingInstance && block.id === timeBlock.originalTimeBlockId
              );
              
              if (originalBlock) {
                // Navigate to edit the original block
                navigation.navigate('TimeBlock', { mode: 'edit', timeBlock: originalBlock, isPremium });
              } else {
                // Original block not found, show error
                Alert.alert(
                  'Error',
                  'Could not find the original time block for this repeating instance.',
                  [{ text: 'OK' }]
                );
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } else {
      // Regular time block, just edit it
      navigation.navigate('TimeBlock', { mode: 'edit', timeBlock, isPremium });
    }
  };
  
  // Helper to calculate time block position and dimensions
  const calculateTimeBlockStyle = (timeBlock) => {
    const startTime = new Date(timeBlock.startTime);
    const endTime = new Date(timeBlock.endTime);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return { height: scaleHeight(60), top: 0 };
    }
    
    // Calculate start time minutes since start of day
    const startHour = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    const startTotalMinutes = (startHour * 60) + startMinutes;
    
    // Calculate duration in minutes
    let durationInMinutes;
    
    // Handle time blocks that cross midnight properly
    if (endTime < startTime) {
      // If endTime is earlier in the day than startTime, it means the block ends the next day
      // Add 24 hours (1440 minutes) to account for crossing midnight
      durationInMinutes = ((endTime.getTime() + 24 * 60 * 60 * 1000) - startTime.getTime()) / (1000 * 60);
    } else {
      // Normal case: end time is after start time on the same day
      durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    }
    
    // Apply maximum duration constraint to prevent excessive height
    // Limit duration to 24 hours (1440 minutes) max
    durationInMinutes = Math.min(durationInMinutes, 1440);
    
    // Convert to position and height (scaled)
    const hourHeight = getHourHeight();
    const top = (startTotalMinutes / 60) * hourHeight;
    const height = Math.max((durationInMinutes / 60) * hourHeight, scaleHeight(30)); // Minimum height of 30
    
    return { height, top };
  };
  
  // Handle PDF generation and sharing
const handleSharePDF = (tabName) => {
  animateButtonPress();
  
  // For free users, restrict PDF generation to Day view only
  if (!isPremium && (tabName === 'Week' || tabName === 'Month')) {
    setLimitModalType('pdfExport');
    setShowLimitModal(true);
    return;
  }
  
  generateAndSharePDF({
    setIsGeneratingPDF,
    selectedView: tabName.toLowerCase(),
    currentDate,
    formatDate,
    getTimeBlocksForDate,
    getMonthName,
    weekDates,
    monthDates,
    selectedMonthDay,
    isToday,
    getDayName,
    formatTime,
    addWatermark: !isPremium // Add watermark for free users
  });
  
  // Track achievement for Day Export
if (tabName === 'Day') {
  try {
    FeatureExplorerTracker.trackDayExport(showSuccess);
  } catch (error) {
    console.error('Error tracking day export achievement:', error);
  }
} 
// Add tracking for Week Export Pro (premium only)
else if (isPremium && tabName === 'Week') {
  try {
    FeatureExplorerTracker.trackWeekExport(showSuccess);
  } catch (error) {
    console.error('Error tracking week export achievement:', error);
  }
} 
// Add tracking for Month Export Pro (premium only)
else if (isPremium && tabName === 'Month') {
  try {
    FeatureExplorerTracker.trackMonthExport(showSuccess);
  } catch (error) {
    console.error('Error tracking month export achievement:', error);
  }
}
};

  // Track tab change
  const handleTabChange = (tabName) => {
    setSelectedTab(tabName);
  };

  // DayTab Component
  const DayTab = ({ route }) => {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <PinchGestureHandler
          onGestureEvent={onPinchGestureEvent}
          onHandlerStateChange={onPinchHandlerStateChange}
        >
          <Animated.View style={{ flex: 1 }}>
            <ScrollView 
              ref={scrollViewRef} 
              style={styles.content}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={[
                styles.scrollViewContent,
                { paddingBottom: insets.bottom + scaleHeight(80) }
              ]}
              onScroll={onScroll}
              scrollEventThrottle={16}
              onContentSizeChange={onContentSizeChange}
            >
              {/* Navigation Controls are now moved here */}
              <View style={[
                styles.navigationContainer,
                { paddingHorizontal: scaleWidth(10) }
              ]}>
                <View style={styles.navigationButtonsRow}>
                  <TouchableOpacity 
                    style={[
                      styles.navButton, 
                      ensureAccessibleTouchTarget(scaleWidth(40), scaleWidth(40)),
                      { 
                        backgroundColor: theme.cardElevated,
                        borderRadius: scaleWidth(20),
                      }
                    ]} 
                    onPress={() => handlePrevious(selectedTab)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Previous day"
                    accessibilityHint={`Navigate to the previous ${selectedTab.toLowerCase()}`}
                  >
                    <Ionicons 
                      name="chevron-back" 
                      size={scaleWidth(22)} 
                      color={theme.text} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.todayButton, 
                      ensureAccessibleTouchTarget(scaleWidth(80), scaleHeight(40)),
                      { 
                        backgroundColor: isToday(currentDate) ? theme.primary : theme.cardElevated,
                        borderWidth: isToday(currentDate) ? 0 : 1,
                        borderColor: theme.border,
                        borderRadius: scaleWidth(15),
                        paddingHorizontal: scaleWidth(16),
                        paddingVertical: scaleHeight(8),
                        alignItems: 'center',
                        justifyContent: 'center',
                      }
                    ]}
                    onPress={handleToday}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Today"
                    accessibilityHint="Navigate to today"
                  >
                    <Text 
                      style={[
                        styles.todayButtonText,
                        { 
                          color: isToday(currentDate) ? 
                            (isDarkMode ? '#000000' : '#FFFFFF') : theme.text,
                          fontSize: scaleFontSize(14),
                          fontWeight: '500',
                          textAlign: 'center',
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Today
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.navButton, 
                      ensureAccessibleTouchTarget(scaleWidth(40), scaleWidth(40)),
                      { 
                        backgroundColor: theme.cardElevated,
                        borderRadius: scaleWidth(20),
                      }
                    ]} 
                    onPress={() => handleNext(selectedTab)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Next day"
                    accessibilityHint={`Navigate to the next ${selectedTab.toLowerCase()}`}
                  >
                    <Ionicons 
                      name="chevron-forward" 
                      size={scaleWidth(22)} 
                      color={theme.text} 
                    />
                  </TouchableOpacity>

                  {/* Calendar Settings Button */}
                  <TouchableOpacity 
                    style={[
                      styles.calendarButton, 
                      ensureAccessibleTouchTarget(scaleWidth(40), scaleWidth(40)),
                      { 
                        backgroundColor: calendarSettings.syncEnabled || calendarSettings.showCalendarEvents 
                          ? theme.primary + '20' 
                          : theme.cardElevated,
                        borderRadius: scaleWidth(20),
                        borderWidth: calendarSettings.syncEnabled || calendarSettings.showCalendarEvents ? 1 : 0,
                        borderColor: calendarSettings.syncEnabled || calendarSettings.showCalendarEvents 
                          ? theme.primary 
                          : 'transparent',
                      }
                    ]} 
                    onPress={() => setShowCalendarSettings(true)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Calendar settings"
                    accessibilityHint="Configure calendar integration settings"
                  >
                    <Ionicons 
                      name="calendar" 
                      size={scaleWidth(20)} 
                      color={calendarSettings.syncEnabled || calendarSettings.showCalendarEvents 
                        ? theme.primary 
                        : theme.text
                      } 
                    />
                  </TouchableOpacity>

                  {/* Share Button - To the right of navigation buttons */}
                  <TouchableOpacity 
                    style={[
                      styles.shareButton, 
                      ensureAccessibleTouchTarget(scaleWidth(40), scaleWidth(40)),
                      { 
                        backgroundColor: theme.cardElevated,
                        borderRadius: scaleWidth(20),
                      }
                    ]} 
                    onPress={() => handleSharePDF(selectedTab)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Generate PDF"
                    accessibilityHint={`Create a PDF of the current ${selectedTab.toLowerCase()} view`}
                  >
                    <Ionicons 
                      name="document-text-outline" 
                      size={scaleWidth(20)} 
                      color={theme.text} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              <DayView 
                timeBlocks={timeBlocks}
                getTimeBlocksForDate={getTimeBlocksForDate}
                currentDate={currentDate}
                handleTimeBlockPress={handleTimeBlockPress}
                handleAddTimeBlock={handleAddTimeBlock}
                getHourHeight={getHourHeight}
                calculateTimeBlockStyle={calculateTimeBlockStyle}
                getDarkerShade={getDarkerShade}
                formatTime={formatTime}
                styles={styles}
                timeSlots={timeSlots}
                theme={theme}
                isDarkMode={isDarkMode}
                isPremium={isPremium}
              />
            </ScrollView>
          </Animated.View>
        </PinchGestureHandler>
      </View>
    );
  };

  // WeekTab Component
  const WeekTab = () => {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
          {/* Navigation Controls are now moved here */}
          <View style={[
            styles.navigationContainer,
            { paddingHorizontal: scaleWidth(10) }
          ]}>
            <View style={styles.navigationButtonsRow}>
              <TouchableOpacity 
                style={[
                  styles.navButton, 
                  ensureAccessibleTouchTarget(scaleWidth(40), scaleWidth(40)),
                  { 
                    backgroundColor: theme.cardElevated,
                    borderRadius: scaleWidth(20),
                  }
                ]} 
                onPress={() => handlePrevious(selectedTab)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Previous week"
                accessibilityHint="Navigate to the previous week"
              >
                <Ionicons 
                  name="chevron-back" 
                  size={scaleWidth(22)} 
                  color={theme.text} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.todayButton, 
                  ensureAccessibleTouchTarget(scaleWidth(80), scaleHeight(40)),
                  { 
                    backgroundColor: isToday(currentDate) ? theme.primary : theme.cardElevated,
                    borderWidth: isToday(currentDate) ? 0 : 1,
                    borderColor: theme.border,
                    borderRadius: scaleWidth(15),
                    paddingHorizontal: scaleWidth(16),
                    paddingVertical: scaleHeight(8),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                ]}
                onPress={handleToday}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="This week"
                accessibilityHint="Navigate to the current week"
              >
                <Text 
                  style={[
                    styles.todayButtonText,
                    { 
                      color: isToday(currentDate) ? 
                        (isDarkMode ? '#000000' : '#FFFFFF') : theme.text,
                      fontSize: scaleFontSize(14),
                      fontWeight: '500',
                      textAlign: 'center',
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Today
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.navButton, 
                  ensureAccessibleTouchTarget(scaleWidth(40), scaleWidth(40)),
                  { 
                    backgroundColor: theme.cardElevated,
                    borderRadius: scaleWidth(20),
                  }
                ]} 
                onPress={() => handleNext(selectedTab)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Next week"
                accessibilityHint="Navigate to the next week"
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={scaleWidth(22)} 
                  color={theme.text} 
                />
              </TouchableOpacity>

              {/* Calendar Settings Button */}
              <TouchableOpacity 
                style={[
                  styles.calendarButton, 
                  ensureAccessibleTouchTarget(scaleWidth(40), scaleWidth(40)),
                  { 
                    backgroundColor: calendarSettings.syncEnabled || calendarSettings.showCalendarEvents 
                      ? theme.primary + '20' 
                      : theme.cardElevated,
                    borderRadius: scaleWidth(20),
                    borderWidth: calendarSettings.syncEnabled || calendarSettings.showCalendarEvents ? 1 : 0,
                    borderColor: calendarSettings.syncEnabled || calendarSettings.showCalendarEvents 
                      ? theme.primary 
                      : 'transparent',
                  }
                ]} 
                onPress={() => setShowCalendarSettings(true)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Calendar settings"
                accessibilityHint="Configure calendar integration settings"
              >
                <Ionicons 
                  name="calendar" 
                  size={scaleWidth(20)} 
                  color={calendarSettings.syncEnabled || calendarSettings.showCalendarEvents 
                    ? theme.primary 
                    : theme.text
                  } 
                />
              </TouchableOpacity>

              {/* Share Button - To the left of navigation buttons */}
              <TouchableOpacity 
                style={[
                  styles.shareButton, 
                  ensureAccessibleTouchTarget(scaleWidth(40), scaleWidth(40)),
                  { 
                    backgroundColor: theme.cardElevated,
                    borderRadius: scaleWidth(20),
                  }
                ]} 
                onPress={() => handleSharePDF(selectedTab)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Generate PDF"
                accessibilityHint="Create a PDF of the current week view"
              >
                <Ionicons 
                  name="document-text-outline" 
                  size={scaleWidth(20)} 
                  color={theme.text} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <WeekView 
            weekDates={weekDates}
            selectedWeekDay={selectedWeekDay}
            isToday={isToday}
            getDayName={getDayName}
            getTimeBlocksForDate={getTimeBlocksForDate}
            handleWeekDaySelect={handleWeekDaySelect}
            handleTimeBlockPress={handleTimeBlockPress}
            styles={styles}
            theme={theme}
            isPremium={isPremium}
            maxFreeBlocks={3} // Limit blocks shown in free version
          />
      </View>
    );
  };

  // MonthTab Component
  const MonthTab = () => {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: insets.bottom + scaleHeight(80) }
          ]}
        >
          {/* Navigation Controls are now moved here */}
          <View style={[
            styles.navigationContainer,
            { paddingHorizontal: scaleWidth(10) }
          ]}>
            <View style={styles.navigationButtonsRow}>
              <TouchableOpacity 
                style={[
                  styles.navButton, 
                  ensureAccessibleTouchTarget(scaleWidth(40), scaleWidth(40)),
                  { 
                    backgroundColor: theme.cardElevated,
                    borderRadius: scaleWidth(20),
                  }
                ]} 
                onPress={() => handlePrevious(selectedTab)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                accessibilityHint="Navigate to the previous month"
              >
                <Ionicons 
                  name="chevron-back" 
                  size={scaleWidth(22)} 
                  color={theme.text} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.todayButton, 
                  ensureAccessibleTouchTarget(scaleWidth(80), scaleHeight(40)),
                  { 
                    backgroundColor: isToday(currentDate) ? theme.primary : theme.cardElevated,
                    borderWidth: isToday(currentDate) ? 0 : 1,
                    borderColor: theme.border,
                    borderRadius: scaleWidth(15),
                    paddingHorizontal: scaleWidth(16),
                    paddingVertical: scaleHeight(8),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }
                ]}
                onPress={handleToday}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="This month"
                accessibilityHint="Navigate to the current month"
              >
                <Text 
                  style={[
                    styles.todayButtonText,
                    { 
                      color: isToday(currentDate) ? 
                        (isDarkMode ? '#000000' : '#FFFFFF') : theme.text,
                      fontSize: scaleFontSize(14),
                      fontWeight: '500',
                      textAlign: 'center',
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Today
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.navButton, 
                  ensureAccessibleTouchTarget(scaleWidth(40), scaleWidth(40)),
                  { 
                    backgroundColor: theme.cardElevated,
                    borderRadius: scaleWidth(20),
                  }
                ]} 
                onPress={() => handleNext(selectedTab)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Next month"
                accessibilityHint="Navigate to the next month"
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={scaleWidth(22)} 
                  color={theme.text} 
                />
              </TouchableOpacity>

              {/* Calendar Settings Button */}
              <TouchableOpacity 
                style={[
                  styles.calendarButton, 
                  ensureAccessibleTouchTarget(scaleWidth(40), scaleWidth(40)),
                  { 
                    backgroundColor: calendarSettings.syncEnabled || calendarSettings.showCalendarEvents 
                      ? theme.primary + '20' 
                      : theme.cardElevated,
                    borderRadius: scaleWidth(20),
                    borderWidth: calendarSettings.syncEnabled || calendarSettings.showCalendarEvents ? 1 : 0,
                    borderColor: calendarSettings.syncEnabled || calendarSettings.showCalendarEvents 
                      ? theme.primary 
                      : 'transparent',
                  }
                ]} 
                onPress={() => setShowCalendarSettings(true)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Calendar settings"
                accessibilityHint="Configure calendar integration settings"
              >
                <Ionicons 
                  name="calendar" 
                  size={scaleWidth(20)} 
                  color={calendarSettings.syncEnabled || calendarSettings.showCalendarEvents 
                    ? theme.primary 
                    : theme.text
                  } 
                />
              </TouchableOpacity>

              {/* Share Button - To the right of navigation buttons */}
              <TouchableOpacity 
                style={[
                  styles.shareButton, 
                  ensureAccessibleTouchTarget(scaleWidth(40), scaleWidth(40)),
                  { 
                    backgroundColor: theme.cardElevated,
                    borderRadius: scaleWidth(20),
                  }
                ]} 
                onPress={() => handleSharePDF(selectedTab)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Generate PDF"
                accessibilityHint="Create a PDF of the current month view"
              >
                <Ionicons 
                  name="document-text-outline" 
                  size={scaleWidth(20)} 
                  color={theme.text} 
                />
              </TouchableOpacity>
            </View>
          </View>
          
          <MonthView 
            monthDates={monthDates}
            selectedMonthDay={selectedMonthDay}
            isToday={isToday}
            formatDate={formatDate}
            getTimeBlocksForDate={getTimeBlocksForDate}
            handleMonthDaySelect={handleMonthDaySelect}
            handleTimeBlockPress={handleTimeBlockPress}
            handleAddTimeBlock={handleAddTimeBlock}
            styles={styles}
            theme={theme}
            isDarkMode={isDarkMode}
            isPremium={isPremium}
            showDotsOnly={!isPremium} // Free tier shows dots only
          />
        </ScrollView>
      </View>
    );
  };

  // Calculate tab bar indicator width properly for each tab
  const tabBarIndicatorWidth = Math.floor((width - scaleWidth(40)) / 3) - 6;

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.background,
          paddingTop: hasDynamicIsland ? scaleHeight(5) : 0 // Extra padding for Dynamic Island
        }
      ]}
      edges={['bottom', 'left', 'right']} // Don't include 'top' to handle Dynamic Island manually
    >
      {/* Date Display - At the top */}
      <View style={[
        styles.dateDisplay,
        {
          paddingTop: hasDynamicIsland ? scaleHeight(5) : scaleHeight(10)
        }
      ]}>
        <Text 
          style={[
            styles.dateText, 
            { 
              color: isToday(currentDate) ? theme.primary : theme.text,
              fontWeight: isToday(currentDate) ? '700' : '600',
              fontSize: scaleFontSize(18)
            }
          ]}
          maxFontSizeMultiplier={1.3}
          accessibilityRole="header"
        >
          {getFormattedDate(selectedTab)}
        </Text>
      </View>

      {/* Tab Navigator - Below date */}
      <NavigationContainer independent={true} key={tabNavigatorKey}>
        <Tab.Navigator
          initialRouteName="Day"
          screenOptions={{
            tabBarActiveTintColor: isDarkMode ? '#FFFFFF' : '#000000',
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarStyle: { 
              backgroundColor: theme.cardElevated,
              elevation: 0,
              shadowOpacity: 0,
              borderRadius: scaleWidth(25),
              marginHorizontal: scaleWidth(20),
              marginBottom: 0,
              height: scaleHeight(44),
            },
            tabBarIndicatorStyle: { 
              backgroundColor: theme.primary,
              height: scaleHeight(38),
              borderRadius: scaleWidth(20),
              marginBottom: 3,
              marginLeft: 3,
              width: tabBarIndicatorWidth, // Calculated width for proper fit
              zIndex: 1,
            },
            tabBarLabelStyle: {
              fontSize: scaleFontSize(15),
              fontWeight: '600',
              textTransform: 'none',
              zIndex: 2,
            },
            tabBarItemStyle: {
              paddingVertical: 0,
              height: scaleHeight(38),
              zIndex: 2,
            },
            swipeEnabled: true,
            animationEnabled: true,
            tabBarAccessibilityLabel: `${selectedTab} view tab`,
            tabBarAllowFontScaling: true,
            tabBarPressOpacity: 0.8,
          }}
          screenListeners={{
            state: (e) => {
              // Get active route name
              const index = e.data.state.index;
              const routes = e.data.state.routes;
              const currentRoute = routes[index].name;
              handleTabChange(currentRoute);
            }
          }}
        >
          <Tab.Screen 
            name="Day" 
            component={DayTab}
            options={{
              tabBarAccessibilityLabel: "Day view",
            }}
          />
          <Tab.Screen 
            name="Week" 
            component={WeekTab}
            options={{
              tabBarAccessibilityLabel: "Week view",
            }}
          />
          <Tab.Screen 
            name="Month" 
            component={MonthTab}
            options={{
              tabBarAccessibilityLabel: "Month view",
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>

      {/* Zoom Controls - Moved here, below tabs */}
      {selectedTab === 'Day' && (
        <View style={[
          styles.zoomControls, 
          { 
            backgroundColor: theme.cardElevated,
            borderColor: theme.border,
            marginHorizontal: scaleWidth(20),
            marginTop: scaleHeight(8),
            borderRadius: scaleWidth(24),
          }
        ]}>
          <TouchableOpacity 
            style={[
              styles.zoomButton, 
              ensureAccessibleTouchTarget(scaleWidth(36), scaleWidth(36)),
              { 
                backgroundColor: theme.background,
                borderRadius: scaleWidth(18),
              }
            ]}
            onPress={handleZoomOut}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Zoom out"
            accessibilityHint="Decrease the zoom level"
          >
            <Text 
              style={[
                styles.zoomButtonText, 
                { 
                  color: theme.text,
                  fontSize: scaleFontSize(24),
                }
              ]}
            >
              −
            </Text>
          </TouchableOpacity>
          
          <Text 
            style={[
              styles.zoomLevelText, 
              { 
                color: theme.text,
                fontSize: scaleFontSize(16),
              }
            ]}
            maxFontSizeMultiplier={1.3}
            accessibilityLabel={`Zoom level ${Math.round(scale * 100)} percent`}
          >
            {Math.round(scale * 100)}%
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.zoomButton, 
              ensureAccessibleTouchTarget(scaleWidth(36), scaleWidth(36)),
              { 
                backgroundColor: theme.background,
                borderRadius: scaleWidth(18),
              }
            ]}
            onPress={handleZoomIn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Zoom in"
            accessibilityHint="Increase the zoom level"
          >
            <Text 
              style={[
                styles.zoomButtonText, 
                { 
                  color: theme.text,
                  fontSize: scaleFontSize(24),
                }
              ]}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Add Button - Left side like GoalsScreen */}
      <Animated.View 
        style={[
          styles.floatingAddButton, 
          {
            transform: [{ scale: buttonScale }],
            bottom: insets.bottom - scaleHeight(20), // A bit higher
            left: scaleWidth(20),
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.floatingAddButtonInner,
            {
              backgroundColor: theme.primary,
              width: Math.max(scaleWidth(60), 44),
              height: Math.max(scaleWidth(60), 44),
              borderRadius: Math.max(scaleWidth(60), 44) / 2,
            }
          ]}
          onPress={handleAddTimeBlock}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Add time block"
          accessibilityHint="Creates a new time block for your schedule"
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
            style={styles.buttonGradient}
          />
          <Ionicons 
            name="add" 
            size={scaleWidth(28)} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </Animated.View>
      
      {/* PDF Generation Loading Modal */}
      {isGeneratingPDF && (
        <Modal 
          transparent={true} 
          visible={isGeneratingPDF}
          animationType="fade"
        >
          <View style={styles.loadingModalContainer}>
            <View style={[
              styles.loadingModalContent, 
              { 
                backgroundColor: theme.card,
                padding: scaleWidth(20),
                borderRadius: scaleWidth(10),
              }
            ]}>
              <ActivityIndicator 
                size="large" 
                color={theme.primary} 
                style={styles.loadingIndicator} 
              />
              <Text 
                style={[
                  styles.loadingText, 
                  { 
                    color: theme.text,
                    fontSize: scaleFontSize(16),
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Generating PDF...
              </Text>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Free Tier Limit Modal */}
      <FreeTierLimitModal 
        visible={showLimitModal}
        theme={theme}
        limitType={limitModalType}
        onClose={() => setShowLimitModal(false)}
        onUpgrade={() => {
          setShowLimitModal(false);
          navigation.navigate('PricingScreen');
        }}
        isDarkMode={isDarkMode}
      />
      
      {/* Calendar Settings Modal */}
      <CalendarSettingsModal
        visible={showCalendarSettings}
        onClose={() => setShowCalendarSettings(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Date display at the top
  dateDisplay: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 5, // Small margin between date and tabs
  },
  dateText: {
    // fontSize set in component
    // fontWeight set in component
  },
  
  // Navigation container moved inside scrollview
  navigationContainer: {
    // paddingHorizontal set in component
    paddingVertical: scaleHeight(10),
    marginBottom: scaleHeight(10),
  },
  navigationButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the navigation controls
    position: 'relative', // For absolute positioning of share button
  },
  navButton: {
    // width, height, borderRadius set in component
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayButton: {
    // paddingVertical, paddingHorizontal, borderRadius set in component
    marginHorizontal: scaleWidth(10),
  },
  todayButtonText: {
    // fontWeight, fontSize set in component
  },
  
  // Calendar button style
  calendarButton: {
    // width, height, borderRadius set in component
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: scaleWidth(50), // Position to the right of share button
  },
  
  // Share button style - Simplified to just an icon
  shareButton: {
    // width, height, borderRadius set in component
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0, // Position at the left side
  },
  
  // Content styles
  content: {
    flex: 1,
  },
  scrollViewContent: {
    // paddingBottom set in component
  },
  
  // Zoom controls - moved to below tabs
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaleWidth(8),
    // borderRadius set in component
    zIndex: 100,
    borderWidth: 1,
  },
  zoomButton: {
    // width, height, borderRadius set in component
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scaleWidth(8),
  },
  zoomButtonText: {
    // fontSize set in component
    fontWeight: 'bold',
  },
  zoomLevelText: {
    // fontSize set in component
    fontWeight: 'bold',
    minWidth: scaleWidth(45),
    textAlign: 'center',
  },
  
  // Floating add button - Left side like GoalsScreen
  floatingAddButton: {
    position: 'absolute',
    // bottom, left set in component
    zIndex: 100,
  },
  floatingAddButtonInner: {
    // width, height, borderRadius set in component
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  buttonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  
  // PDF loading modal styles
  loadingModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingModalContent: {
    // padding, borderRadius set in component
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingIndicator: {
    marginBottom: scaleHeight(15),
  },
  loadingText: {
    // fontSize set in component
    fontWeight: '500',
  },
  
  // Free tier upgrade banner styles
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scaleWidth(12),
    margin: scaleWidth(15),
    borderRadius: scaleWidth(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  upgradeBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeBannerText: {
    marginLeft: scaleWidth(10),
    fontSize: scaleFontSize(14),
    fontWeight: '500',
  },
  
  // Day view styles
  dayViewContainer: {
    paddingBottom: scaleHeight(20),
  },
  dayViewContent: {
    flexDirection: 'row',
    paddingHorizontal: scaleWidth(15),
  },
  timeIndicatorsColumn: {
    width: scaleWidth(60),
    paddingRight: scaleWidth(10),
  },
  timeIndicator: {
    justifyContent: 'flex-start',
    paddingTop: scaleHeight(8),
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: scaleFontSize(12),
  },
  timeGridContainer: {
    flex: 1,
    position: 'relative',
    paddingRight: scaleWidth(15),
  },
  timeGridRow: {
    width: '100%',
    position: 'relative',
  },
  timeGridLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  timeBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderRadius: scaleWidth(8),
    padding: scaleWidth(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'space-between',
  },
  timeBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeBlockTime: {
    fontSize: scaleFontSize(11),
    fontWeight: '500',
  },
  timeBlockTitle: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    marginVertical: scaleHeight(4),
  },
  // Project and task styles for timeblock
  timeBlockProjectTask: {
    marginTop: scaleHeight(2),
    marginBottom: scaleHeight(4),
  },
  projectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleHeight(2),
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectTaskText: {
    fontSize: scaleFontSize(11),
    marginLeft: scaleWidth(4),
  },
  timeBlockFooter: {
    marginTop: 'auto',
  },
  domainBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleHeight(2),
    borderRadius: scaleWidth(10),
  },
  domainText: {
    fontSize: scaleFontSize(10),
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaleHeight(4),
  },
  locationText: {
    fontSize: scaleFontSize(11),
    marginLeft: scaleWidth(4),
  },
  
  // Week view styles
  weekView: {
    flex: 1,
    paddingBottom: scaleHeight(20),
  },
  weekDaysHeader: {
    flexDirection: 'row',
    paddingHorizontal: scaleWidth(10),
    paddingVertical: scaleHeight(10),
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: scaleHeight(10),
    borderRadius: scaleWidth(10),
  },
  selectedWeekDay: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  // Today highlight for week view
  todayWeekDay: {
    borderRadius: scaleWidth(10),
  },
  weekDayName: {
    fontSize: scaleFontSize(12),
    marginBottom: scaleHeight(5),
  },
  weekDayNumber: {
    fontSize: scaleFontSize(16),
    fontWeight: '500',
  },
  weekViewContent: {
    flex: 1,
    marginTop: scaleHeight(10),
    paddingHorizontal: scaleWidth(15),
  },
  weekDayBlocks: {
    marginBottom: scaleHeight(15),
    borderRadius: scaleWidth(12),
    overflow: 'hidden',
    padding: scaleWidth(10),
  },
  weekDayLabel: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    marginBottom: scaleHeight(10),
    paddingHorizontal: scaleWidth(5),
  },
  weekDayBlocksContainer: {
    paddingHorizontal: scaleWidth(5),
  },
  emptyWeekDay: {
    alignItems: 'center',
    paddingVertical: scaleHeight(15),
  },
  emptyWeekDayText: {
    fontStyle: 'italic',
    fontSize: scaleFontSize(14),
  },
  
  // Month view styles
  monthView: {
    flex: 1,
    paddingBottom: scaleHeight(20),
    paddingHorizontal: scaleWidth(15),
  },
  monthCalendar: {
    padding: scaleWidth(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  monthDaysHeader: {
    flexDirection: 'row',
    marginBottom: scaleHeight(15),
  },
  monthDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: scaleFontSize(12),
    fontWeight: '600',
  },
  monthGrid: {
    flexDirection: 'column',
  },
  monthWeek: {
    flexDirection: 'row',
    height: scaleHeight(52), // Increased from 45 to accommodate two rows of indicators
    marginBottom: scaleHeight(10),
  },
  monthDay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleWidth(10),
  },
  selectedMonthDay: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  monthDayNumber: {
    fontSize: scaleFontSize(14),
    height: scaleHeight(20), // Fixed height for consistent alignment
    textAlign: 'center',
    textAlignVertical: 'center', // For Android
    includeFontPadding: false, // Remove extra padding
    lineHeight: 20, // Fixed line height
  },
  // New wrapper for event indicators (contains both rows)
  eventIndicatorsWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scaleHeight(2),
  },
  // Container for each row of indicators
  eventIndicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 1,
    gap: 2,
  },
  eventIndicator: {
    width: scaleWidth(6),
    height: scaleWidth(6),
    borderRadius: scaleWidth(3),
  },
  selectedDayBlocks: {
    padding: scaleWidth(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedDayTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    marginBottom: scaleHeight(15),
  },
  selectedDayContent: {
    maxHeight: 300,
  },
  
  emptyDay: {
    padding: scaleWidth(20),
    alignItems: 'center',
  },
  emptyDayContent: {
    alignItems: 'center',
    padding: scaleWidth(15),
  },
  emptyDayIcon: {
    marginBottom: scaleHeight(10),
  },
  emptyDayText: {
    fontStyle: 'italic',
  },
  emptyDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleHeight(6),
    paddingHorizontal: scaleWidth(12),
    borderRadius: scaleWidth(15),
    marginTop: scaleHeight(10),
  },
  emptyDayButtonText: {
    fontSize: scaleFontSize(14),
    fontWeight: '500',
  },

  // Custom Empty State Styles
  customEmptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaleWidth(20),
    marginTop: scaleHeight(40),
  },
  customEmptyStateTitle: {
    fontSize: scaleFontSize(22),
    fontWeight: '600',
    marginVertical: scaleHeight(12),
    textAlign: 'center',
  },
  customEmptyStateMessage: {
    fontSize: scaleFontSize(16),
    textAlign: 'center',
    marginBottom: scaleHeight(24),
    lineHeight: 22,
  },
  customEmptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleHeight(12),
    paddingHorizontal: scaleWidth(20),
    borderRadius: scaleWidth(25),
    marginTop: scaleHeight(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  customEmptyStateButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    marginLeft: scaleWidth(8),
    textAlign: 'center',
  },

  // Repeating block styles
  repeatingTimeBlock: {
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  repeatingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  repeatingText: {
    fontSize: scaleFontSize(10),
    marginLeft: scaleWidth(2),
    fontWeight: '500',
  },
  
  // Free version upgrade indicator
  upgradeIndicator: {
    paddingHorizontal: scaleWidth(10),
    paddingVertical: scaleHeight(4),
    borderRadius: scaleWidth(12),
    alignSelf: 'center',
    marginTop: scaleHeight(5),
  },
  upgradeIndicatorText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(12),
    fontWeight: '600',
  },
});

export default TimeScreen;