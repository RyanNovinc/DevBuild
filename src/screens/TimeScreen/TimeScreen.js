// src/screens/TimeScreen/TimeScreen.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Extracted tab components to prevent recreation on re-renders
const DayTab = React.memo(({ 
  theme, 
  scrollViewRef, 
  insets, 
  styles, 
  scale, 
  currentDate, 
  timeBlocks, 
  handleTimeBlockPress, 
  handleTimeBlockLongPress, 
  calculateTimeBlockStyle, 
  handleAddTimeBlock, 
  calendarSettings, 
  currentDateCalendarEvents, 
  selectedTab, 
  isFullscreen, 
  isTourActive, 
  scaleHeight, 
  scaleWidth 
}) => {
  // Local state for expanded time block to prevent parent re-renders
  const [expandedTimeBlockId, setExpandedTimeBlockId] = useState(null);

  // Local handler for time block long press
  const handleLocalTimeBlockLongPress = useCallback((timeBlock) => {
    // Disable during tour
    if (isTourActive) {
      console.log('🎯 TimeScreen DayTab: Local timeblock long press disabled during tour');
      return;
    }
    
    // Capture current scroll position before state change
    const currentScrollY = scrollViewRef.current?.startScrollY || startScrollY.current || 0;
    console.log('🔄 Preserving scroll position during delete expansion:', currentScrollY);
    
    // Call original handler first
    handleTimeBlockLongPress(timeBlock);
    
    // Toggle local expansion state
    setExpandedTimeBlockId(expandedTimeBlockId === timeBlock.id ? null : timeBlock.id);
    
    // Restore scroll position after re-render completes
    // Using same pattern as zoom functionality
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollViewRef.current && currentScrollY >= 0) {
          console.log('🔄 Restoring scroll position to:', currentScrollY);
          scrollViewRef.current.scrollTo({ y: currentScrollY, animated: false });
        }
      });
    });
  }, [handleTimeBlockLongPress, expandedTimeBlockId, isTourActive, scrollViewRef, startScrollY]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1 }}>
        <ScrollView 
            ref={scrollViewRef} 
            style={styles.content}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={[
              styles.scrollViewContent,
              { paddingBottom: insets.bottom + scaleHeight(80) }
            ]}
            scrollEventThrottle={16}
            onScroll={(event) => {
              // Track scroll position for zoom functionality
              if (scrollViewRef.current) {
                scrollViewRef.current.startScrollY = event.nativeEvent.contentOffset.y;
              }
            }}
        >
          <DayView
            currentDate={currentDate}
            timeBlocks={timeBlocks}
            onTimeBlockPress={handleTimeBlockPress}
            onTimeBlockLongPress={handleLocalTimeBlockLongPress}
            onAddTimeBlock={handleAddTimeBlock}
            expandedTimeBlockId={expandedTimeBlockId}
            calculateTimeBlockStyle={calculateTimeBlockStyle}
            calendarSettings={calendarSettings}
            currentDateCalendarEvents={currentDateCalendarEvents}
            selectedTab={selectedTab}
            isFullscreen={isFullscreen}
            isTourActive={isTourActive}
            scale={scale}
          />
        </ScrollView>
      </View>
    </View>
  );
});

const WeekTab = React.memo(({
  theme,
  styles,
  scaleWidth,
  scaleHeight,
  isFullscreen,
  weekDates,
  selectedWeekDay,
  handleWeekDaySelect,
  handlePrev,
  handleNext,
  formatDate,
  getDayName,
  currentDate,
  timeBlocks,
  getTimeBlocksForDate,
  handleTimeBlockPress,
  handleTimeBlockLongPress,
  handleAddTimeBlock,
  calculateTimeBlockStyle,
  calendarSettings,
  currentDateCalendarEvents,
  selectedTab,
  isTourActive
}) => {
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
        {/* Navigation Controls are now moved here */}
        <View style={[
          styles.navigationContainer,
          { 
            paddingHorizontal: scaleWidth(10),
            paddingVertical: isFullscreen ? scaleHeight(5) : scaleHeight(10), // Reduced padding in fullscreen
            marginBottom: isFullscreen ? scaleHeight(5) : scaleHeight(10), // Reduced margin in fullscreen
          }
        ]}>
          {/* Previous Button */}
          <TouchableOpacity 
            onPress={() => handlePrev()}
            style={[styles.navButton, { marginRight: scaleWidth(15) }]}
            activeOpacity={0.7}
            accessibilityLabel="Previous week"
            accessibilityHint="Navigate to the previous week"
          >
            <Ionicons name="chevron-back" size={scaleWidth(20)} color={theme.text} />
          </TouchableOpacity>

          {/* Week Days */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekDatesContainer}
            style={{ flex: 1 }}
          >
            {weekDates.map((date, index) => {
              const isSelected = selectedWeekDay === index;
              const dateTimeBlocks = getTimeBlocksForDate(date);
              const hasTimeBlocks = dateTimeBlocks.length > 0;
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleWeekDaySelect(index)}
                  style={[
                    styles.weekDateItem,
                    isSelected && styles.selectedWeekDateItem,
                    { 
                      minWidth: scaleWidth(60),
                      height: scaleHeight(70),
                      marginHorizontal: scaleWidth(4),
                    }
                  ]}
                  activeOpacity={0.7}
                  accessibilityLabel={`${getDayName(date.getDay())} ${formatDate(date, 'MMM DD')}`}
                  accessibilityHint={hasTimeBlocks ? "Has scheduled time blocks" : "No scheduled time blocks"}
                >
                  <Text style={[
                    styles.weekDayName,
                    isSelected && styles.selectedWeekDayName,
                    { fontSize: scaleWidth(12) }
                  ]}>
                    {getDayName(date.getDay()).substring(0, 3)}
                  </Text>
                  <Text style={[
                    styles.weekDateNumber,
                    isSelected && styles.selectedWeekDateNumber,
                    { fontSize: scaleWidth(16) }
                  ]}>
                    {date.getDate()}
                  </Text>
                  {hasTimeBlocks && (
                    <View style={[
                      styles.timeBlockIndicator,
                      { 
                        width: scaleWidth(4),
                        height: scaleWidth(4),
                        marginTop: scaleHeight(2)
                      }
                    ]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Next Button */}
          <TouchableOpacity 
            onPress={() => handleNext()}
            style={[styles.navButton, { marginLeft: scaleWidth(15) }]}
            activeOpacity={0.7}
            accessibilityLabel="Next week"
            accessibilityHint="Navigate to the next week"
          >
            <Ionicons name="chevron-forward" size={scaleWidth(20)} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Week View */}
        <WeekView
          currentDate={currentDate}
          weekDates={weekDates}
          selectedWeekDay={selectedWeekDay}
          timeBlocks={timeBlocks}
          onTimeBlockPress={handleTimeBlockPress}
          onTimeBlockLongPress={handleTimeBlockLongPress}
          onAddTimeBlock={handleAddTimeBlock}
          calculateTimeBlockStyle={calculateTimeBlockStyle}
          calendarSettings={calendarSettings}
          currentDateCalendarEvents={currentDateCalendarEvents}
          selectedTab={selectedTab}
          isFullscreen={isFullscreen}
          isTourActive={isTourActive}
        />
    </View>
  );
});

const MonthTab = React.memo(({
  theme,
  styles,
  insets,
  scaleHeight,
  scaleWidth,
  isFullscreen,
  monthDates,
  selectedMonthDay,
  handleMonthDaySelect,
  handlePrev,
  handleNext,
  getMonthName,
  currentDate,
  timeBlocks,
  getTimeBlocksForDate,
  handleTimeBlockPress,
  handleTimeBlockLongPress,
  handleAddTimeBlock,
  calculateTimeBlockStyle,
  calendarSettings,
  currentDateCalendarEvents,
  selectedTab,
  isTourActive
}) => {
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
        <MonthView
          currentDate={currentDate}
          monthDates={monthDates}
          selectedMonthDay={selectedMonthDay}
          onMonthDayPress={handleMonthDaySelect}
          timeBlocks={timeBlocks}
          onTimeBlockPress={handleTimeBlockPress}
          onTimeBlockLongPress={handleTimeBlockLongPress}
          onAddTimeBlock={handleAddTimeBlock}
          calculateTimeBlockStyle={calculateTimeBlockStyle}
          calendarSettings={calendarSettings}
          currentDateCalendarEvents={currentDateCalendarEvents}
          selectedTab={selectedTab}
          isFullscreen={isFullscreen}
          isTourActive={isTourActive}
          handlePrev={handlePrev}
          handleNext={handleNext}
          getMonthName={getMonthName}
        />
      </ScrollView>
    </View>
  );
});
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
  formatTime, 
  getDarkerShade
} from './TimeScreenHelpers';

// Import PDF generator
import { generateAndSharePDF } from './PDFGenerator';

// Import FreeTierLimitModal component
import FreeTierLimitModal from './FreeTierLimitModal';

// Import CalendarSettingsModal component
import CalendarSettingsModal from '../../components/CalendarSettingsModal';

// Import tour components
import useAppTour from '../../hooks/useAppTour';
import AppTourOverlay from '../../components/AppTourOverlay';


const Tab = createMaterialTopTabNavigator();

/**
 * TimeScreen - Rewritten to use React Navigation's Tab Navigator
 * with Free Tier limitations implemented
 */
const TimeScreen = ({ navigation, isFullscreen: externalIsFullscreen, onFullScreenToggle: externalOnFullScreenToggle }) => {
  const { theme } = useTheme();
  const isDarkMode = theme.background === '#000000';
  const insets = useSafeAreaInsets();
  const safeSpacing = useSafeSpacing();
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  
  // App Tour Hook
  const { 
    isTourActive,
    currentStep,
    nextStep,
    skipTour
  } = useAppTour(navigation);
  
  // Tour animation ref for time screen lighting effect
  const tourTimeOpacity = useRef(new Animated.Value(0)).current;
  
  
  // Internal fullscreen state management
  const [internalIsFullscreen, setInternalIsFullscreen] = useState(false);
  
  // Store the date we should return to after TimeBlock navigation
  const dateBeforeTimeBlock = useRef(null);
  const isReturningFromTimeBlock = useRef(false);
  // Store the most recent date from navigation to handle timing issues
  const latestNavigatedDate = useRef(currentDate || new Date());
  
  // Use external props if provided, otherwise use internal state
  const isFullscreen = externalIsFullscreen !== undefined ? externalIsFullscreen : internalIsFullscreen;
  const onFullScreenToggle = externalOnFullScreenToggle || (() => setInternalIsFullscreen(!internalIsFullscreen));
  
  // Handle global fullscreen state for hiding bottom navigation and AI button
  useEffect(() => {
    if (isFullscreen) {
      // Hide AI button
      if (typeof window !== 'undefined' && window.setAIButtonVisible) {
        window.setAIButtonVisible(false);
      }
      
      // Set global state to hide bottom tabs
      if (typeof global !== 'undefined') {
        global.kanbanFullScreen = true;
      }
    } else {
      // Restore normal state
      if (typeof window !== 'undefined' && window.setAIButtonVisible) {
        window.setAIButtonVisible(true);
      }
      
      if (typeof global !== 'undefined') {
        global.kanbanFullScreen = false;
      }
    }
    
    // Cleanup function
    return () => {
      if (isFullscreen) {
        if (typeof window !== 'undefined' && window.setAIButtonVisible) {
          window.setAIButtonVisible(true);
        }
        if (typeof global !== 'undefined') {
          global.kanbanFullScreen = false;
        }
      }
    };
  }, [isFullscreen]);
  
  // Handle tour time screen lighting animation - start dark then light up
  useEffect(() => {
    if (isTourActive) {
      // Light up time screen for all TIME steps by making overlay transparent
      if (currentStep === 'SCHEDULE_DEDICATED_TIME' || currentStep === 'TIME_BLOCK_CREATED' || currentStep === 'SYSTEM_CONFIDENCE') {
        console.log('🎯 Tour: Starting time screen lighting animation for', currentStep);
        
        // For TIME_BLOCK_CREATED step, light up immediately so user can see their time block
        if (currentStep === 'TIME_BLOCK_CREATED') {
          console.log('🎯 Tour: Lighting up immediately for TIME_BLOCK_CREATED');
          tourTimeOpacity.setValue(0); // 0 = transparent overlay = lit up screen
        } else {
          // Start with dark overlay, then animate to transparent as AI message appears
          tourTimeOpacity.setValue(1); // 1 = opaque overlay = darkened screen
          
          // Coordinate with AppTourOverlay AI message timing:
          // 100ms overlay fade + 300ms delay + 300ms step delay = 700ms until AI message starts typing
          const lightUpDelay = 700; // Start lighting as AI message begins typing
          
          setTimeout(() => {
            if (isTourActive && (currentStep === 'SCHEDULE_DEDICATED_TIME' || currentStep === 'SYSTEM_CONFIDENCE')) {
              console.log('🎯 Tour: Now lighting up the time screen for', currentStep);
              Animated.timing(tourTimeOpacity, {
                toValue: 0, // Animate to transparent = lit up
                duration: 1000, // Match the AI message typing duration
                useNativeDriver: true
              }).start(() => {
                console.log('🎯 Tour: Time screen lighting animation complete');
              });
            }
          }, lightUpDelay);
        }
      } else {
        // Keep dark during tour until we reach TIME steps
        tourTimeOpacity.setValue(1); // 1 = opaque overlay = darkened screen
      }
    } else {
      // Not in tour - no overlay needed
      tourTimeOpacity.setValue(0); // 0 = transparent overlay = normal brightness
    }
  }, [isTourActive, currentStep]);
  
  // Detect Dynamic Island
  const hasDynamicIsland = insets.top >= 59;
  
  // Get app context with safety for timeBlocks
  const appContext = useAppContext();
  const timeBlocks = appContext.timeBlocks || [];
  const addTimeBlock = appContext.addTimeBlock;
  const deleteTimeBlock = appContext.deleteTimeBlock;
  const userSubscriptionStatus = appContext.userSubscriptionStatus || 'free';
  const isPremium = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
  const { mainGoals, milestones, tasks } = appContext;
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
  // Initialize selectedWeekDay to today's day (Monday-based: Monday=0, Sunday=6)
  const todayWeekDay = (() => {
    const today = new Date();
    const day = today.getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday=0 to Sunday=6, others shift by -1
  })();
  const [selectedWeekDay, setSelectedWeekDay] = useState(todayWeekDay);
  const [selectedMonthDay, setSelectedMonthDay] = useState(new Date().getDate() - 1); // 0-based index
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Day'); // Track active tab
  const [tabNavigatorKey, setTabNavigatorKey] = useState(0); // Key to force remount
  const [showTourTimePickerPopup, setShowTourTimePickerPopup] = useState(false); // Tour time picker popup
  const [selectedDuration, setSelectedDuration] = useState(null); // Selected duration for time block
  
  // Calendar view modes: 'app' (LifeCompass only), 'phone' (device calendar only), 'both' (combined view)
  const [calendarViewMode, setCalendarViewMode] = useState('both');
  const [timePickerStep, setTimePickerStep] = useState('duration'); // 'duration' or 'time'
  const [showTourContinueButton, setShowTourContinueButton] = useState(false); // Show continue button after time block created
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalType, setLimitModalType] = useState('');
  const isSelectingWithinWeekRef = useRef(false);
  
  // Navigation ref for tour tab switching
  const tabNavigatorRef = useRef(null);
  
  
  // Calendar events state
  const [currentDateCalendarEvents, setCurrentDateCalendarEvents] = useState([]);
  const [showCalendarSettings, setShowCalendarSettings] = useState(false);
  
  // Track previous tour step to prevent unnecessary resets during tour progression
  const previousTourStepRef = useRef(null);
  
  // Define which tour steps belong to which screens
  const getTourStepScreen = (step) => {
    const STEP_SCREENS = {
      'GOAL_ACHIEVEMENT_VALIDATION': 'Profile',
      'KANBAN_SYSTEM_INTRO': 'Projects',
      'PICK_CURRENT_FOCUS': 'Projects',
      'TASK_MOVED_CELEBRATION': 'Projects',
      'SCHEDULE_DEDICATED_TIME': 'Time',
      'TIME_BLOCK_CREATED': 'Time',
      'SYSTEM_CONFIDENCE': 'Time',
      'SUPPORTING_TOOLS_OVERVIEW': 'TodoTab',
      'AI_FAREWELL': 'TodoTab'
    };
    return STEP_SCREENS[step] || null;
  };
  
  // Track if this is the initial mount vs subsequent navigation
  const isInitialMountRef = useRef(true);
  const lastNavigationSourceRef = useRef(null);
  
  // Handle initial mount - simple one-time setup
  useEffect(() => {
    console.log('🎯 TimeScreen: Initial mount - setting up Day view');
    setSelectedTab('Day');
    setCurrentDate(new Date());
    setTabNavigatorKey(prev => prev + 1);
    isInitialMountRef.current = false;
  }, []); // Empty dependency array - only run on mount
  
  // Separate effect for tracking tour steps without triggering resets
  useEffect(() => {
    console.log('🎯 TimeScreen: Tour step changed to:', currentStep);
    
    // Tour data preparation - check for in-progress tasks during SCHEDULE_DEDICATED_TIME
    if (isTourActive && currentStep === 'SCHEDULE_DEDICATED_TIME') {
      console.log('🎯 TimeScreen: Checking for tour data during SCHEDULE_DEDICATED_TIME');
        console.log('🎯 TimeScreen: Current global tour data:', {
          hasTask: !!global.tourSelectedTask,
          hasMilestone: !!global.tourSelectedMilestone,
          hasGoal: !!global.tourSelectedGoal
        });
        
        // If we don't have global tour data, try to find it from context
        if (!global.tourSelectedTask) {
          console.log('🎯 TimeScreen: No global tour data, searching for in-progress task');
          console.log('🎯 TimeScreen: Available context data:', {
            tasksCount: tasks?.length || 0,
            milestonesCount: milestones?.length || 0,
            goalsCount: mainGoals?.length || 0
          });
          
          // Try to find in-progress task in available data
          const inProgressTask = tasks?.find(task => task.status === 'in-progress');
          
          if (inProgressTask) {
            console.log('🎯 TimeScreen: Found in-progress task:', inProgressTask.title);
            
            const milestone = milestones?.find(m => m.id === inProgressTask.milestoneId);
            const goal = milestone ? mainGoals?.find(g => g.id === milestone.goalId) : null;
            
            if (milestone && goal) {
              console.log('🎯 TimeScreen: Storing found tour data globally:', {
                task: inProgressTask.title,
                milestone: milestone.title,
                goal: goal.title
              });
              
              global.tourSelectedTask = inProgressTask;
              global.tourSelectedMilestone = milestone;
              global.tourSelectedGoal = goal;
            } else {
              console.error('🎯 TimeScreen: Could not find milestone or goal for task');
            }
          } else {
            console.log('🎯 TimeScreen: No in-progress task found in context');
          }
        } else {
          console.log('🎯 TimeScreen: Global tour data already exists');
        }
    }
    
    // Update previous step reference after processing
    previousTourStepRef.current = currentStep;
  }, [isTourActive, currentStep, tasks, milestones, mainGoals]);
  
  // Handle return from TimeBlock screen - preserve the date context
  useFocusEffect(
    useCallback(() => {
      console.log('🎯 TimeScreen: Screen focused');
      
      // Check if we're returning from TimeBlock navigation
      if (isReturningFromTimeBlock.current && dateBeforeTimeBlock.current) {
        console.log('🎯 TimeScreen: Restoring date from before TimeBlock navigation:', dateBeforeTimeBlock.current);
        const restoredDate = new Date(dateBeforeTimeBlock.current);
        setCurrentDate(restoredDate);
        console.log('🎯 TimeScreen: Date restored to:', restoredDate.toDateString());
        
        // Clear the flags
        isReturningFromTimeBlock.current = false;
        dateBeforeTimeBlock.current = null;
      } else if (!isTourActive && !isReturningFromTimeBlock.current) {
        console.log('🎯 TimeScreen: Normal navigation - resetting to today');
        setSelectedTab('Day');
        setCurrentDate(new Date());
        setTabNavigatorKey(prev => prev + 1);
      }
    }, [isTourActive])
  );
  
  // Cleanup fullscreen state when component unmounts
  useEffect(() => {
    return () => {
      // Always restore normal state when component unmounts
      if (typeof window !== 'undefined' && window.setAIButtonVisible) {
        window.setAIButtonVisible(true);
      }
      if (typeof global !== 'undefined') {
        global.kanbanFullScreen = false;
      }
    };
  }, []);
  
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
    
    const newScale = Math.min(scale + 0.1, 2);
    
    // Calculate new scroll position to maintain current center view
    if (scrollViewRef.current) {
      const currentScrollY = startScrollY.current;
      const viewportHeight = height;
      const viewportCenter = currentScrollY + (viewportHeight / 2);
      
      // Calculate the new scroll position to keep the same content centered
      const scaleFactor = newScale / scale;
      const newCenterPosition = viewportCenter * scaleFactor;
      const newScrollY = newCenterPosition - (viewportHeight / 2);
      
      // Update scale and scroll position in next frame to avoid state conflicts
      requestAnimationFrame(() => {
        setScale(newScale);
        requestAnimationFrame(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: Math.max(0, newScrollY), animated: false });
          }
        });
      });
    } else {
      setScale(newScale);
    }
    
    lastScale.current = newScale;
  };
  
  const handleZoomOut = () => {
    animateButtonPress();
    
    const newScale = Math.max(scale - 0.1, 0.4);
    
    // Calculate new scroll position to maintain current center view
    if (scrollViewRef.current) {
      const currentScrollY = startScrollY.current;
      const viewportHeight = height;
      const viewportCenter = currentScrollY + (viewportHeight / 2);
      
      // Calculate the new scroll position to keep the same content centered
      const scaleFactor = newScale / scale;
      const newCenterPosition = viewportCenter * scaleFactor;
      const newScrollY = newCenterPosition - (viewportHeight / 2);
      
      // Update scale and scroll position in next frame to avoid state conflicts
      requestAnimationFrame(() => {
        setScale(newScale);
        requestAnimationFrame(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: Math.max(0, newScrollY), animated: false });
          }
        });
      });
    } else {
      setScale(newScale);
    }
    
    lastScale.current = newScale;
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
  
  // Load and save calendar view mode preference
  useEffect(() => {
    const loadCalendarViewMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('calendarViewMode');
        if (savedMode && ['app', 'phone', 'both'].includes(savedMode)) {
          setCalendarViewMode(savedMode);
        }
      } catch (error) {
        console.error('Error loading calendar view mode:', error);
        // Default to 'both' if error
        setCalendarViewMode('both');
      }
    };
    
    loadCalendarViewMode();
  }, []);
  
  // Save calendar view mode when it changes
  useEffect(() => {
    const saveCalendarViewMode = async () => {
      try {
        await AsyncStorage.setItem('calendarViewMode', calendarViewMode);
      } catch (error) {
        console.error('Error saving calendar view mode:', error);
      }
    };
    
    // Only save if not the initial render
    if (calendarViewMode) {
      saveCalendarViewMode();
    }
  }, [calendarViewMode]);
  
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
    // Store the latest navigated date immediately to handle React state timing
    latestNavigatedDate.current = newDate;
    console.log('🎯 TimeScreen: handlePrevious completed, stored latest date:', newDate.toDateString());
  };
  
  // Navigate to next day/week/month
  const handleNext = (tabName) => {
    animateButtonPress();
    
    console.log('🎯 TimeScreen: handleNext called for tab:', tabName);
    console.log('🎯 TimeScreen: Current date before navigation:', currentDate.toDateString());
    
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
    
    console.log('🎯 TimeScreen: Setting new date to:', newDate.toDateString());
    setCurrentDate(newDate);
    // Store the latest navigated date immediately to handle React state timing
    latestNavigatedDate.current = newDate;
    console.log('🎯 TimeScreen: handleNext completed, stored latest date:', newDate.toDateString());
  };
  
  // Go to today
  const handleToday = () => {
    animateButtonPress();
    setCurrentDate(new Date());
  };
  
  // Handle week day selection
  const handleWeekDaySelect = (index) => {
    const newDate = new Date(weekDates[index]);
    
    // Check for free tier planning horizon
    if (!isPremium && isBeyondFreePlanningHorizon(newDate)) {
      setLimitModalType('horizon');
      setShowLimitModal(true);
      return;
    }
    
    // Set flag to indicate we're selecting within the current week
    // This prevents recalculating week dates in the useEffect
    isSelectingWithinWeekRef.current = true;
    
    // Update both the selected week day and current date
    setSelectedWeekDay(index);
    setCurrentDate(newDate);
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

  // Handle tour special actions
  const handleTourSpecialAction = (action) => {
    if (action === 'switchToWeekTab') {
      console.log('🕐 Tour: Switching to Week tab');
      if (tabNavigatorRef.current) {
        tabNavigatorRef.current.navigate('Week');
        setSelectedTab('Week');
      }
    } else if (action === 'switchToMonthTab') {
      console.log('🗓️ Tour: Switching to Month tab');
      if (tabNavigatorRef.current) {
        tabNavigatorRef.current.navigate('Month');
        setSelectedTab('Month');
      }
    } else if (action === 'showTimePickerPopup') {
      console.log('🎯 Tour: Showing time picker popup');
      setShowTourTimePickerPopup(true);
    }
  };

  // Handle duration selection - advances to time selection
  const handleDurationSelect = (durationMinutes) => {
    console.log('🎯 Tour: Duration selected:', durationMinutes, 'minutes');
    setSelectedDuration(durationMinutes);
    setTimePickerStep('time');
  };

  // Generate time slots for today
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Safety check for selectedDuration
    if (!selectedDuration || typeof selectedDuration !== 'number') {
      console.warn('🎯 Tour: generateTimeSlots called without valid selectedDuration:', selectedDuration);
      return [];
    }
    
    // Start from current time rounded up to next 15-minute interval
    let startMinutes = Math.ceil(currentTime / 15) * 15;
    
    // Generate slots for the rest of today (until midnight)
    const endOfDay = 24 * 60; // Midnight (24:00) in minutes
    
    // If it's 11 PM or later, also show early morning options for tomorrow
    const isLateNight = now.getHours() >= 23;
    const actualEndOfDay = isLateNight ? endOfDay + (8 * 60) : endOfDay; // Add 8 morning hours for late night users
    
    while (startMinutes < actualEndOfDay) {
      const hours = Math.floor(startMinutes / 60) % 24; // Handle overflow past midnight
      const minutes = startMinutes % 60;
      const endMinutes = startMinutes + selectedDuration;
      const endHours = Math.floor(endMinutes / 60) % 24;
      const endMins = endMinutes % 60;
      
      const startTime = new Date();
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date();
      endTime.setHours(endHours, endMins, 0, 0);
      
      // For times past midnight, show next day indicator
      const isNextDay = Math.floor(startMinutes / 60) >= 24;
      const displayTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const displayEndTime = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      slots.push({
        time: startTime,
        display: isNextDay ? `${displayTime} (tomorrow)` : displayTime,
        endTime: isNextDay ? `${displayEndTime} (tomorrow)` : displayEndTime
      });
      
      startMinutes += 30; // 30-minute intervals
    }
    
    // Remove the 8-slot limit for better tour experience - show all available slots
    // If there are too many slots (>12), limit to 12 for UI purposes
    return slots.slice(0, 12);
  };

  // Helper function to find the task that was moved to "In Progress" during tour
  const findInProgressTourTask = () => {
    console.log('🎯 Tour: findInProgressTourTask called');
    console.log('🎯 Tour: Global tour data:', {
      tourSelectedTask: global.tourSelectedTask ? global.tourSelectedTask.title : null,
      tourSelectedMilestone: global.tourSelectedMilestone ? global.tourSelectedMilestone.title : null,
      tourSelectedGoal: global.tourSelectedGoal ? global.tourSelectedGoal.title : null
    });
    
    // Check if we have tour-selected task data (all three required for tour)
    if (global.tourSelectedTask && global.tourSelectedMilestone && global.tourSelectedGoal) {
      console.log('🎯 Tour: Using stored tour task data:', {
        task: global.tourSelectedTask.title,
        milestone: global.tourSelectedMilestone.title,
        goal: global.tourSelectedGoal.title
      });
      
      return {
        task: global.tourSelectedTask,
        milestone: global.tourSelectedMilestone,
        goal: global.tourSelectedGoal
      };
    }
    
    console.log('🎯 Tour: No global tour data available, looking for in-progress tasks in context');
    console.log('🎯 Tour: Available tasks:', tasks?.map(t => ({ id: t.id, title: t.title, status: t.status })));
    
    // Since TimeScreen tasks array is often empty due to context issues,
    // let's try to get the in-progress task from AppContext more directly
    // Try both the destructured tasks and direct appContext.tasks
    const destructuredTasks = tasks || [];
    const directTasks = appContext.tasks || [];
    
    console.log('🎯 Tour: Task arrays comparison:', {
      destructuredLength: destructuredTasks.length,
      directLength: directTasks.length,
      using: directTasks.length > 0 ? 'direct' : 'destructured'
    });
    
    // Use the array that has data
    const allTasks = directTasks.length > 0 ? directTasks : destructuredTasks;
    console.log('🎯 Tour: Using tasks array with length:', allTasks.length);
    
    const inProgressTask = allTasks.find(task => 
      task.status === 'in-progress'
    );
    
    console.log('🎯 Tour: Found in-progress task:', inProgressTask ? inProgressTask.title : null);
    
    if (inProgressTask) {
      const milestone = milestones?.find(m => m.id === inProgressTask.milestoneId);
      const goal = milestone ? mainGoals?.find(g => g.id === milestone.goalId) : null;
      
      console.log('🎯 Tour: Found milestone:', milestone ? milestone.title : null);
      console.log('🎯 Tour: Found goal:', goal ? goal.title : null);
      
      if (milestone && goal) {
        // Store this globally for future use
        console.log('🎯 Tour: Storing found task data globally for consistency');
        global.tourSelectedTask = inProgressTask;
        global.tourSelectedMilestone = milestone;
        global.tourSelectedGoal = goal;
        
        return {
          task: inProgressTask,
          milestone,
          goal
        };
      }
    }
    
    console.log('🎯 Tour: No valid tour data found, returning null');
    return null;
  };

  // Handle creating a time block during tour
  const handleCreateTourTimeBlock = async (durationMinutes, startTime = null) => {
    console.log('🎯 Tour: handleCreateTourTimeBlock called with:', durationMinutes, 'minutes', { startTime });
    console.log('🎯 Tour: Current context data available:', {
      mainGoals: mainGoals ? mainGoals.length : 0,
      milestones: milestones ? milestones.length : 0,
      tasks: tasks ? tasks.length : 0
    });
    
    // Log the full appContext to see what's available
    console.log('🎯 Tour: Full appContext keys:', Object.keys(appContext || {}));
    console.log('🎯 Tour: AppContext tasks array:', {
      isArray: Array.isArray(appContext.tasks),
      length: appContext.tasks?.length || 0,
      firstFew: appContext.tasks?.slice(0, 3)?.map(t => ({ 
        id: t.id, 
        title: t.title, 
        status: t.status 
      }))
    });
    
    console.log('🎯 Tour: Global tour data check:', {
      hasGlobalTask: !!global.tourSelectedTask,
      hasGlobalMilestone: !!global.tourSelectedMilestone,
      hasGlobalGoal: !!global.tourSelectedGoal,
      taskTitle: global.tourSelectedTask?.title,
      milestoneTitle: global.tourSelectedMilestone?.title,
      goalTitle: global.tourSelectedGoal?.title
    });
    
    try {
      // Use the selected start time, or calculate default
      let blockStartTime;
      if (startTime) {
        blockStartTime = new Date(startTime);
        console.log('🎯 Tour: Using selected start time:', blockStartTime);
      } else {
        // Fallback: Get current time rounded to next 15-minute interval
        const now = new Date();
        const roundedMinutes = Math.ceil(now.getMinutes() / 15) * 15;
        blockStartTime = new Date(now);
        blockStartTime.setMinutes(roundedMinutes, 0, 0);
        
        // If rounded time is in the past (same hour), add 15 minutes
        if (blockStartTime <= now) {
          blockStartTime.setMinutes(blockStartTime.getMinutes() + 15);
        }
        console.log('🎯 Tour: Using calculated start time:', blockStartTime);
      }
      
      // Validate the dates
      if (!blockStartTime || isNaN(blockStartTime.getTime())) {
        throw new Error('Invalid start time');
      }
      
      const endTime = new Date(blockStartTime);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);
      
      if (!endTime || isNaN(endTime.getTime())) {
        throw new Error('Invalid end time');
      }
      
      console.log('🎯 Tour: Time block times calculated:', { blockStartTime, endTime });
      
      // Find the current in-progress task from the tour
      let taskInfo = findInProgressTourTask();
      console.log('🎯 Tour: Found task info:', taskInfo);
      
      // If taskInfo is null, try one last aggressive approach using direct context access
      if (!taskInfo) {
        console.error('🎯 Tour: ERROR - No task info found! Trying final fallback...');
        console.error('🎯 Tour: Available data for debugging:', {
          tasksCount: tasks ? tasks.length : 0,
          inProgressTasks: tasks ? tasks.filter(t => t.status === 'in-progress') : [],
          milestonesCount: milestones ? milestones.length : 0,
          goalsCount: mainGoals ? mainGoals.length : 0
        });
        
        // Final fallback: try to find in-progress task using fresh context data
        const contextTasks = appContext?.tasks || [];
        const contextMilestones = appContext?.milestones || [];  
        const contextGoals = appContext?.mainGoals || [];
        
        console.log('🎯 Tour: Final fallback - direct context access:', {
          contextTasksLength: contextTasks.length,
          contextMilestonesLength: contextMilestones.length,
          contextGoalsLength: contextGoals.length
        });
        
        // Log all tasks with their status to see what we actually have
        console.log('🎯 Tour: All context tasks with status:', contextTasks.map(t => ({
          id: t.id,
          title: t.title?.substring(0, 30) + '...',
          status: t.status
        })));
        
        // Try both status formats - there might be inconsistency between underscore and hyphen
        const inProgressTaskHyphen = contextTasks.find(t => t.status === 'in-progress');
        const inProgressTaskUnderscore = contextTasks.find(t => t.status === 'in_progress');
        const inProgressTask = inProgressTaskHyphen || inProgressTaskUnderscore;
        
        console.log('🎯 Tour: Searching for in-progress task:', {
          foundWithHyphen: !!inProgressTaskHyphen,
          foundWithUnderscore: !!inProgressTaskUnderscore,
          foundAny: !!inProgressTask,
          allStatusValues: [...new Set(contextTasks.map(t => t.status))]
        });
        
        if (inProgressTask) {
          console.log('🎯 Tour: Final fallback found task:', inProgressTask.title);
          const milestone = contextMilestones.find(m => m.id === inProgressTask.milestoneId);
          const goal = milestone ? contextGoals.find(g => g.id === milestone.goalId) : null;
          
          if (milestone && goal) {
            console.log('🎯 Tour: Final fallback success - creating taskInfo');
            taskInfo = {
              task: inProgressTask,
              milestone,
              goal
            };
            
            // Store globally for future use
            global.tourSelectedTask = inProgressTask;
            global.tourSelectedMilestone = milestone;
            global.tourSelectedGoal = goal;
          } else {
            console.error('🎯 Tour: Final fallback - could not find milestone/goal');
          }
        } else {
          console.error('🎯 Tour: Final fallback - no in-progress task found');
          
          // Last resort: Since we're in a tour and know there should be a task,
          // try to find ANY task that could be the tour task by looking for one
          // that might have been recently updated or has certain characteristics
          console.log('🎯 Tour: Last resort - looking for any suitable task');
          
          if (contextTasks.length > 0) {
            // Look for a task that might be the tour task
            // Priority: recently updated tasks
            const sortedTasks = [...contextTasks].sort((a, b) => 
              new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
            );
            
            console.log('🎯 Tour: Most recently updated tasks:', sortedTasks.slice(0, 2).map(t => ({
              title: t.title?.substring(0, 40),
              status: t.status,
              updatedAt: t.updatedAt
            })));
            
            // Use the most recently updated task as the tour task
            const possibleTourTask = sortedTasks[0];
            const milestone = contextMilestones.find(m => m.id === possibleTourTask.milestoneId);
            const goal = milestone ? contextGoals.find(g => g.id === milestone.goalId) : null;
            
            if (milestone && goal) {
              console.log('🎯 Tour: Last resort success - using most recent task as tour task');
              taskInfo = {
                task: possibleTourTask,
                milestone,
                goal
              };
              
              // Store globally for future use
              global.tourSelectedTask = possibleTourTask;
              global.tourSelectedMilestone = milestone;
              global.tourSelectedGoal = goal;
            } else {
              console.error('🎯 Tour: Last resort failed - no milestone/goal found');
            }
          }
        }
      }
      
      // Create the actual time block data with proper structure
      const timeBlockData = {
        id: Date.now().toString(),
        title: 'Focus Session', // Use consistent title as per tour design
        isGeneralActivity: false, // This is a goal-focused time block
        
        // For Goal Focus time blocks - link to actual goal/project/task
        domain: taskInfo ? taskInfo.goal.title : 'Personal Growth', // Use goal title as domain
        domainColor: taskInfo ? taskInfo.goal.color || '#22c55e' : '#22c55e',
        milestoneId: taskInfo ? taskInfo.milestone.id : null,
        milestoneTitle: taskInfo ? taskInfo.milestone.title : null,
        taskId: taskInfo ? taskInfo.task.id : null,
        taskTitle: taskInfo ? taskInfo.task.title : null,
        
        // For General Activity time blocks (not used here)
        category: null,
        customColor: null,
        
        // Common fields
        startTime: blockStartTime.toISOString(),
        endTime: endTime.toISOString(),
        location: '',
        notes: 'Created during app tour - work on your goal task!',
        isCompleted: false,
        
        // Add repeating information
        isRepeating: false,
        repeatFrequency: null,
        repeatIndefinitely: null,
        repeatUntil: null,
        
        // Notification info (no notification for tour)
        hasNotification: false,
        notificationTime: null,
        customMinutes: null,
        notificationId: null,
        
        // Tour marker
        isFromTour: true
      };
      
      console.log('🎯 Tour: Time block data prepared:', timeBlockData);
      
      // Actually create the time block using addTimeBlock
      await addTimeBlock(timeBlockData);
      console.log('🎯 Tour: Time block created successfully', timeBlockData);
      
      // Clear tour selection data after successful timeblock creation
      global.tourSelectedTask = null;
      global.tourSelectedMilestone = null;
      global.tourSelectedGoal = null;
      
      // Show success feedback
      const timeString = blockStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      console.log(`🎯 Tour: Time block scheduled for ${timeString} (${durationMinutes} minutes)`);
      
      // Close the popup and reset state
      setShowTourTimePickerPopup(false);
      setSelectedDuration(null);
      setTimePickerStep('duration');
      
      // Advance tour to TIME_BLOCK_CREATED step to hide AppTourOverlay and show continue button
      nextStep(); // This advances from SCHEDULE_DEDICATED_TIME to TIME_BLOCK_CREATED
      
      // Show the continue button so user can see their time block and then continue
      setShowTourContinueButton(true);
      
    } catch (error) {
      console.error('🎯 Tour: Error creating time block:', error);
      // Still advance tour and show continue button even if time block creation fails
      setShowTourTimePickerPopup(false);
      nextStep(); // Advance to TIME_BLOCK_CREATED step
      setShowTourContinueButton(true);
    }
  };
  
  // Function to get time blocks for a specific date
  const getTimeBlocksForDate = (date) => {
    // Safety check: if timeBlocks is not an array, return empty array
    if (!Array.isArray(timeBlocks)) {
      console.warn('timeBlocks is not an array in getTimeBlocksForDate');
      return [];
    }
    
    const dateString = date.toDateString();
    
    // Since recurring instances are now persisted in storage, we don't need to generate them
    // Just use timeBlocks directly
    const timeBlocksForDate = timeBlocks.filter(block => {
      // Safety check: ensure block and block.startTime exist
      if (!block || !block.startTime) return false;
      
      try {
        const blockDate = new Date(block.startTime);
        if (isNaN(blockDate.getTime())) return false;
        return blockDate.toDateString() === dateString;
      } catch (error) {
        console.warn('Error parsing block startTime:', block.startTime, error);
        return false;
      }
    });
    
    // Filter based on calendar view mode
    let finalTimeBlocks = [];
    const dateKey = date.toDateString();
    
    // Include LifeCompass timeblocks if mode is 'app' or 'both'
    if (calendarViewMode === 'app' || calendarViewMode === 'both') {
      finalTimeBlocks = [...timeBlocksForDate];
      console.log(`📅 ${dateKey}: Including ${timeBlocksForDate.length} LifeCompass timeblocks (mode: ${calendarViewMode})`);
    }
    
    // Add calendar events if enabled, available, and mode is 'phone' or 'both'
    if (calendarSettings.showCalendarEvents && (calendarViewMode === 'phone' || calendarViewMode === 'both')) {
      const calendarEventsForDate = date.toDateString() === currentDate.toDateString() 
        ? currentDateCalendarEvents 
        : [];
      
      console.log(`📱 ${dateKey}: Found ${calendarEventsForDate.length} calendar events (mode: ${calendarViewMode})`);
      
      // Convert calendar events to time block format for display
      const calendarEventBlocks = calendarEventsForDate.map(event => {
        // Enhanced validation for event data
        if (!event || typeof event !== 'object') {
          console.warn('⚠️ Calendar event is not a valid object:', event);
          return null;
        }
        
        if (!event.title || typeof event.title !== 'string' || event.title.trim() === '') {
          console.warn('⚠️ Calendar event missing valid title:', event);
          return null;
        }
        
        if (!event.startDate) {
          console.warn('⚠️ Calendar event missing startDate:', event);
          return null;
        }
        
        // Validate and normalize dates
        let startDate, endDate;
        try {
          startDate = new Date(event.startDate);
          if (isNaN(startDate.getTime())) {
            console.warn('⚠️ Calendar event has invalid startDate:', event.startDate);
            return null;
          }
          
          // Handle endDate (some events might not have endDate)
          if (event.endDate) {
            endDate = new Date(event.endDate);
            if (isNaN(endDate.getTime())) {
              console.warn('⚠️ Calendar event has invalid endDate, using startDate + 1 hour:', event.endDate);
              endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default to 1 hour
            }
          } else {
            // Default to 1 hour duration if no end date
            endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
          }
          
          // Ensure end date is not before start date
          if (endDate < startDate) {
            console.warn('⚠️ Calendar event endDate before startDate, swapping:', { start: startDate, end: endDate });
            [startDate, endDate] = [endDate, startDate];
          }
        } catch (error) {
          console.error('⚠️ Error parsing calendar event dates:', error, event);
          return null;
        }
        
        const calendarColor = '#2196F3'; // Blue color for calendar events
        // Generate unique ID with fallback
        const eventId = event.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          id: `calendar_${eventId}`,
          title: event.title.trim(),
          startTime: startDate,
          endTime: endDate,
          location: (event.location && typeof event.location === 'string') ? event.location.trim() : '',
          description: (event.notes && typeof event.notes === 'string') ? event.notes.trim() : '',
          color: calendarColor,
          domainColor: calendarColor, // For MonthView and WeekView consistency
          customColor: calendarColor, // Alternative color property
          domain: 'Calendar', // Set domain for display
          category: 'Calendar Event', // Set category for display
          isCalendarEvent: true,
          isGeneralActivity: false, // Ensure it's treated as a domain activity
          isReadOnly: event.isReadOnly !== false, // Default to read-only unless explicitly false
          source: event.source || 'device_calendar',
          originalEvent: event
        };
      }).filter(Boolean); // Remove null entries
      
      finalTimeBlocks = [...finalTimeBlocks, ...calendarEventBlocks];
      console.log(`📅 ${dateKey}: Total blocks after calendar events: ${finalTimeBlocks.length}`);
    } else if (calendarViewMode === 'phone') {
      // If in phone-only mode but no calendar events available, log this
      console.log(`📱 ${dateKey}: Phone calendar mode but no events available (settings: ${JSON.stringify(calendarSettings)})`);
    }
    
    // Log final result for debugging
    if (finalTimeBlocks.length === 0 && calendarViewMode !== 'app') {
      console.log(`⚠️ ${dateKey}: No timeblocks to display in mode '${calendarViewMode}'`);
    }
    
    return finalTimeBlocks;
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
    
    // Store current date before navigation so we can return to it
    // Use latestNavigatedDate.current to get the most recent date (bypasses React state timing)
    const dateToStore = latestNavigatedDate.current;
    dateBeforeTimeBlock.current = dateToStore;
    isReturningFromTimeBlock.current = true;
    console.log('🎯 TimeScreen: Storing current date before navigation (add):', dateToStore);
    
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

  // Function to add a new time block with pre-filled times
  const handleAddTimeBlockWithTime = (startTime, endTime) => {
    animateButtonPress();
    
    // Store current date before navigation so we can return to it
    // Use latestNavigatedDate.current to get the most recent date (bypasses React state timing)
    const dateToStore = latestNavigatedDate.current;
    dateBeforeTimeBlock.current = dateToStore;
    console.log('🎯 TimeScreen: Storing current date before navigation (add with time):', dateToStore);
    
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
    
    navigation.navigate('TimeBlock', { 
      mode: 'create', 
      date: currentDate, 
      isPremium,
      prefilledStartTime: startTime,
      prefilledEndTime: endTime,
      returnDate: currentDate
    });
  };
  
  // Function to view time block details
  const handleTimeBlockPress = useCallback((timeBlock) => {
    // Disable timeblock clicks during tour
    if (isTourActive) {
      console.log('🎯 TimeScreen: Timeblock clicks disabled during tour');
      return;
    }
    
    // Store current date before navigation so we can return to it
    // Use latestNavigatedDate.current to get the most recent date (bypasses React state timing)
    const dateToStore = latestNavigatedDate.current;
    console.log('🎯 TimeScreen: About to store date. currentDate state:', currentDate);
    console.log('🎯 TimeScreen: About to store date. latestNavigatedDate ref:', dateToStore);
    console.log('🎯 TimeScreen: Date to store string:', dateToStore ? dateToStore.toDateString() : 'undefined');
    console.log('🎯 TimeScreen: Today for comparison:', new Date().toDateString());
    
    dateBeforeTimeBlock.current = dateToStore;
    isReturningFromTimeBlock.current = true;
    
    console.log('🎯 TimeScreen: Stored date in ref:', dateBeforeTimeBlock.current);
    console.log('🎯 TimeScreen: Stored date as string:', dateBeforeTimeBlock.current ? dateBeforeTimeBlock.current.toDateString() : 'undefined');
    
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
  }, [isTourActive, timeBlocks, isPremium, navigation]);
  
  // Function to handle long press on time blocks (inline expansion)
  const handleTimeBlockLongPress = useCallback((timeBlock, event) => {
    // Disable during tour
    if (isTourActive) {
      console.log('🎯 TimeScreen: Timeblock long press disabled during tour');
      return;
    }
    
    // Don't show options for calendar events
    if (timeBlock.isCalendarEvent) {
      Alert.alert(
        'Calendar Event',
        'This is a calendar event. Please use your calendar app to edit or delete it.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // For Week and Month views, the expansion is handled locally by each view
    // This handler is primarily for any parent-level state management if needed
    console.log('🎯 TimeScreen: Timeblock long press - handled by local view expansion');
    
  }, [isTourActive]);
  
  // Handle edit time block directly (simplified)  
  const editTimeBlock = useCallback((timeBlock) => {
    if (timeBlock.isRepeatingInstance) {
      Alert.alert(
        'Edit Repeating Time Block',
        'This is a repeating time block. How would you like to edit it?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'This Instance Only',
            onPress: () => {
              const standaloneBlock = {
                ...timeBlock,
                id: `standalone_${timeBlock.id}`,
                isRepeating: false,
                isRepeatingInstance: false,
                originalTimeBlockId: null
              };
              navigation.navigate('TimeBlock', { mode: 'edit', timeBlock: standaloneBlock, isPremium });
            }
          },
          {
            text: 'Entire Series',
            onPress: () => {
              const originalBlock = timeBlocks.find(block => 
                !block.isRepeatingInstance && block.id === timeBlock.originalTimeBlockId
              );
              
              if (originalBlock) {
                navigation.navigate('TimeBlock', { mode: 'edit', timeBlock: originalBlock, isPremium });
              } else {
                Alert.alert(
                  'Error',
                  'Could not find the original time block for this repeating instance.',
                  [{ text: 'OK' }]
                );
              }
            }
          }
        ]
      );
    } else {
      navigation.navigate('TimeBlock', { mode: 'edit', timeBlock, isPremium });
    }
  }, [timeBlocks, isPremium, navigation]);
  
  // Handle delete time block directly (simplified)
  const deleteTimeBlockHandler = useCallback((timeBlockId, deleteType = null) => {
    console.log(`TimeScreen deleteTimeBlockHandler called: ID=${timeBlockId}, type=${deleteType}`);
    
    // Pass the deleteType directly to AppContext deleteTimeBlock function
    // The AppContext function now handles all the logic for single vs series deletion
    deleteTimeBlock(timeBlockId, deleteType);
  }, [deleteTimeBlock]);
  
  // Legacy delete function for compatibility - can be removed later
  const handleLegacyDelete = useCallback((timeBlock) => {
    const isRepeating = timeBlock.isRepeating || timeBlock.isRepeatingInstance;
    
    if (isRepeating) {
      Alert.alert(
        'Delete Recurring Time Block',
        `"${timeBlock.title}" is part of a recurring series. What would you like to delete?`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete This Instance',
            style: 'destructive',
            onPress: () => {
              deleteTimeBlock(timeBlock.id);
            }
          },
          {
            text: 'Delete Entire Series',
            style: 'destructive',
            onPress: async () => {
              const originalId = timeBlock.isRepeatingInstance 
                ? timeBlock.originalTimeBlockId 
                : timeBlock.id;
              
              if (originalId) {
                await deleteTimeBlock(originalId);
                const relatedBlocks = timeBlocks.filter(block => 
                  block.originalTimeBlockId === originalId || 
                  (block.isRepeatingInstance && block.id.startsWith(originalId))
                );
                
                for (const block of relatedBlocks) {
                  await deleteTimeBlock(block.id);
                }
              }
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Delete Time Block',
        `Are you sure you want to delete "${timeBlock.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              deleteTimeBlock(timeBlock.id);
            }
          }
        ]
      );
    }
  }, [deleteTimeBlock]);
  
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
    const scaledMinHeight = scaleHeight(30) * scale; // Scale minimum height with zoom level
    const height = Math.max((durationInMinutes / 60) * hourHeight, scaledMinHeight);
    
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
    selectedView: (tabName || '').toLowerCase(),
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

// Handle calendar view mode cycling
const handleCalendarViewToggle = () => {
  const modes = ['app', 'phone', 'both'];
  const currentIndex = modes.indexOf(calendarViewMode);
  const nextIndex = (currentIndex + 1) % modes.length;
  const newMode = modes[nextIndex];
  
  // Log for dev build testing
  console.log(`🗓️ Calendar View: ${calendarViewMode} → ${newMode}`);
  
  setCalendarViewMode(newMode);
};

  // Track tab change
  const handleTabChange = (tabName) => {
    setSelectedTab(tabName);
  };

  // Memoized components to prevent recreation on re-renders
  const MemoizedDayTab = useMemo(() => 
    React.memo(() => (
      <DayTab
        theme={theme}
        scrollViewRef={scrollViewRef}
        insets={insets}
        styles={styles}
        scale={scale}
        currentDate={currentDate}
        timeBlocks={timeBlocks}
        onTimeBlockPress={handleTimeBlockPress}
        onTimeBlockLongPress={handleTimeBlockLongPress}
        calculateTimeBlockStyle={calculateTimeBlockStyle}
        handleAddTimeBlock={handleAddTimeBlock}
        calendarSettings={calendarSettings}
        currentDateCalendarEvents={currentDateCalendarEvents}
        selectedTab={selectedTab}
        isFullscreen={isFullscreen}
        isTourActive={isTourActive}
        scaleHeight={scaleHeight}
        scaleWidth={scaleWidth}
      />
    ))
  , [theme, insets, styles, scale, currentDate, timeBlocks, handleTimeBlockPress, handleTimeBlockLongPress, calculateTimeBlockStyle, handleAddTimeBlock, calendarSettings, currentDateCalendarEvents, selectedTab, isFullscreen, calendarViewMode, scaleHeight, scaleWidth]);

  const MemoizedWeekTab = useMemo(() =>
    React.memo(() => (
      <WeekTab
        theme={theme}
        styles={styles}
        scaleWidth={scaleWidth}
        scaleHeight={scaleHeight}
        isFullscreen={isFullscreen}
        weekDates={weekDates}
        selectedWeekDay={selectedWeekDay}
        handleWeekDaySelect={handleWeekDaySelect}
        handlePrev={() => handlePrevious(selectedTab)}
        handleNext={() => handleNext(selectedTab)}
        formatDate={formatDate}
        getDayName={getDayName}
        currentDate={currentDate}
        timeBlocks={timeBlocks}
        getTimeBlocksForDate={getTimeBlocksForDate}
        onTimeBlockPress={handleTimeBlockPress}
        onTimeBlockLongPress={handleTimeBlockLongPress}
        handleAddTimeBlock={handleAddTimeBlock}
        calculateTimeBlockStyle={calculateTimeBlockStyle}
        calendarSettings={calendarSettings}
        currentDateCalendarEvents={currentDateCalendarEvents}
        selectedTab={selectedTab}
        isTourActive={isTourActive}
      />
    ))
  , [theme, styles, scaleWidth, scaleHeight, isFullscreen, weekDates, selectedWeekDay, handleWeekDaySelect, selectedTab, formatDate, getDayName, currentDate, timeBlocks, getTimeBlocksForDate, handleTimeBlockPress, handleTimeBlockLongPress, handleAddTimeBlock, calculateTimeBlockStyle, calendarSettings, currentDateCalendarEvents, calendarViewMode]);

  const MemoizedMonthTab = useMemo(() =>
    React.memo(() => (
      <MonthTab
        theme={theme}
        styles={styles}
        insets={insets}
        scaleHeight={scaleHeight}
        scaleWidth={scaleWidth}
        isFullscreen={isFullscreen}
        monthDates={monthDates}
        selectedMonthDay={selectedMonthDay}
        handleMonthDaySelect={handleMonthDaySelect}
        handlePrev={() => handlePrevious(selectedTab)}
        handleNext={() => handleNext(selectedTab)}
        getMonthName={getMonthName}
        currentDate={currentDate}
        timeBlocks={timeBlocks}
        getTimeBlocksForDate={getTimeBlocksForDate}
        onTimeBlockPress={handleTimeBlockPress}
        onTimeBlockLongPress={handleTimeBlockLongPress}
        handleAddTimeBlock={handleAddTimeBlock}
        calculateTimeBlockStyle={calculateTimeBlockStyle}
        calendarSettings={calendarSettings}
        currentDateCalendarEvents={currentDateCalendarEvents}
        selectedTab={selectedTab}
        isTourActive={isTourActive}
      />
    ))
  , [theme, styles, insets, scaleHeight, scaleWidth, isFullscreen, monthDates, selectedMonthDay, handleMonthDaySelect, selectedTab, getMonthName, currentDate, timeBlocks, getTimeBlocksForDate, handleTimeBlockPress, handleTimeBlockLongPress, handleAddTimeBlock, calculateTimeBlockStyle, calendarSettings, currentDateCalendarEvents, calendarViewMode]);

  // DayTab Component
  const DayTab = ({ route }) => {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1 }}>
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
                { 
                  paddingHorizontal: scaleWidth(10),
                  paddingVertical: isFullscreen ? scaleHeight(5) : scaleHeight(10), // Reduced padding in fullscreen
                  marginBottom: isFullscreen ? scaleHeight(5) : scaleHeight(10), // Reduced margin in fullscreen
                }
              ]}>
                {/* Navigation buttons row - back to original layout */}
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
                    accessibilityHint={`Navigate to the previous ${selectedTab ? (selectedTab || '').toLowerCase() || 'view' : 'view'}`}
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
                    accessibilityHint={`Navigate to the next ${selectedTab ? (selectedTab || '').toLowerCase() || 'view' : 'view'}`}
                  >
                    <Ionicons 
                      name="chevron-forward" 
                      size={scaleWidth(22)} 
                      color={theme.text} 
                    />
                  </TouchableOpacity>

                  {/* Calendar Settings Button */}
                  {!isFullscreen && !isTourActive && (
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
                  )}

                  {/* PDF Button */}
                  {!isFullscreen && !isTourActive && (
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
                      accessibilityHint={`Create a PDF of the current ${selectedTab ? (selectedTab || '').toLowerCase() || 'view' : 'view'} view`}
                    >
                      <Ionicons 
                        name="document-text-outline" 
                        size={scaleWidth(20)} 
                        color={theme.text} 
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Calendar View Switcher - centered below Today button */}
                {!isFullscreen && !isTourActive && (
                  <View style={{ alignItems: 'center', marginTop: scaleHeight(8) }}>
                    <TouchableOpacity
                      onPress={handleCalendarViewToggle}
                      style={[
                        {
                          backgroundColor: theme.cardElevated,
                          borderRadius: scaleWidth(15),
                          paddingHorizontal: scaleWidth(12),
                          paddingVertical: scaleHeight(6),
                          borderWidth: 1,
                          borderColor: theme.border,
                        }
                      ]}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Calendar view mode: ${
                        calendarViewMode === 'app' ? 'LifeCompass only' :
                        calendarViewMode === 'phone' ? 'Phone calendar only' : 
                        'Combined view'
                      }`}
                      accessibilityHint="Tap to switch between calendar view modes"
                    >
                      <Text style={[
                        {
                          color: theme.text,
                          fontSize: scaleFontSize(11),
                          fontWeight: '500',
                        }
                      ]}>
                        {calendarViewMode === 'app' ? 'LifeCompass' :
                         calendarViewMode === 'phone' ? 'Phone Calendar' : 
                         'Combined View'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              
              <DayView 
                timeBlocks={timeBlocks}
                getTimeBlocksForDate={getTimeBlocksForDate}
                currentDate={currentDate}
                onTimeBlockPress={handleTimeBlockPress}
                onTimeBlockLongPress={useCallback((timeBlock, event) => {
                  // Capture current scroll position before DayView's state change
                  const currentScrollY = scrollViewRef.current?.startScrollY || startScrollY.current || 0;
                  console.log('🔄 Preserving scroll position during DayView delete expansion:', currentScrollY);
                  
                  // Call the original handler
                  handleTimeBlockLongPress(timeBlock, event);
                  
                  // Restore scroll position after DayView's re-render completes
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      if (scrollViewRef.current && currentScrollY >= 0) {
                        console.log('🔄 Restoring DayView scroll position to:', currentScrollY);
                        scrollViewRef.current.scrollTo({ y: currentScrollY, animated: false });
                      }
                    });
                  });
                }, [handleTimeBlockLongPress, scrollViewRef, startScrollY])}
                editTimeBlock={editTimeBlock}
                deleteTimeBlock={deleteTimeBlockHandler}
                handleAddTimeBlock={handleAddTimeBlock}
                handleAddTimeBlockWithTime={handleAddTimeBlockWithTime}
                getHourHeight={getHourHeight}
                calculateTimeBlockStyle={calculateTimeBlockStyle}
                getDarkerShade={getDarkerShade}
                formatTime={formatTime}
                styles={styles}
                timeSlots={timeSlots}
                theme={theme}
                isDarkMode={isDarkMode}
                isPremium={isPremium}
                scale={scale}
                isTourActive={isTourActive}
              />
            </ScrollView>
        </View>
      </View>
    );
  };

  // WeekTab Component
  const WeekTab = () => {
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
          {/* Navigation Controls */}
          <View style={[
            styles.navigationContainer,
            { 
              paddingHorizontal: scaleWidth(10),
              paddingVertical: isFullscreen ? scaleHeight(5) : scaleHeight(10), // Reduced padding in fullscreen
              marginBottom: isFullscreen ? scaleHeight(5) : scaleHeight(10), // Reduced margin in fullscreen
            }
          ]}>
            {/* Navigation buttons row - back to original layout */}
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
              {!isFullscreen && !isTourActive && (
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
              )}

              {/* PDF Button */}
              {!isFullscreen && !isTourActive && (
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
              )}
            </View>

            {/* Calendar View Switcher - centered below Today button */}
            {!isFullscreen && !isTourActive && (
              <View style={{ alignItems: 'center', marginTop: scaleHeight(8) }}>
                <TouchableOpacity
                  onPress={handleCalendarViewToggle}
                  style={[
                    {
                      backgroundColor: theme.cardElevated,
                      borderRadius: scaleWidth(15),
                      paddingHorizontal: scaleWidth(12),
                      paddingVertical: scaleHeight(6),
                      borderWidth: 1,
                      borderColor: theme.border,
                    }
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Calendar view mode: ${
                    calendarViewMode === 'app' ? 'LifeCompass only' :
                    calendarViewMode === 'phone' ? 'Phone calendar only' : 
                    'Combined view'
                  }`}
                  accessibilityHint="Tap to switch between calendar view modes"
                >
                  <Text style={[
                    {
                      color: theme.text,
                      fontSize: scaleFontSize(11),
                      fontWeight: '500',
                    }
                  ]}>
                    {calendarViewMode === 'app' ? 'LifeCompass' :
                     calendarViewMode === 'phone' ? 'Phone Calendar' : 
                     'Combined View'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <WeekView 
            weekDates={weekDates}
            selectedWeekDay={selectedWeekDay}
            isToday={isToday}
            getDayName={getDayName}
            getTimeBlocksForDate={getTimeBlocksForDate}
            handleWeekDaySelect={handleWeekDaySelect}
            onTimeBlockPress={handleTimeBlockPress}
            onTimeBlockLongPress={handleTimeBlockLongPress}
            deleteTimeBlock={deleteTimeBlockHandler}
            styles={styles}
            theme={theme}
            isPremium={isPremium}
            maxFreeBlocks={3} // Limit blocks shown in free version
          />
        </ScrollView>
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
            { 
              paddingHorizontal: scaleWidth(10),
              paddingVertical: isFullscreen ? scaleHeight(5) : scaleHeight(10), // Reduced padding in fullscreen
              marginBottom: isFullscreen ? scaleHeight(5) : scaleHeight(10), // Reduced margin in fullscreen
            }
          ]}>
            {/* Navigation buttons row - back to original layout */}
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
              {!isFullscreen && !isTourActive && (
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
              )}

              {/* PDF Button */}
              {!isFullscreen && !isTourActive && (
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
              )}
            </View>

            {/* Calendar View Switcher - centered below Today button */}
            {!isFullscreen && !isTourActive && (
              <View style={{ alignItems: 'center', marginTop: scaleHeight(8) }}>
                <TouchableOpacity
                  onPress={handleCalendarViewToggle}
                  style={[
                    {
                      backgroundColor: theme.cardElevated,
                      borderRadius: scaleWidth(15),
                      paddingHorizontal: scaleWidth(12),
                      paddingVertical: scaleHeight(6),
                      borderWidth: 1,
                      borderColor: theme.border,
                    }
                  ]}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Calendar view mode: ${
                    calendarViewMode === 'app' ? 'LifeCompass only' :
                    calendarViewMode === 'phone' ? 'Phone calendar only' : 
                    'Combined view'
                  }`}
                  accessibilityHint="Tap to switch between calendar view modes"
                >
                  <Text style={[
                    {
                      color: theme.text,
                      fontSize: scaleFontSize(11),
                      fontWeight: '500',
                    }
                  ]}>
                    {calendarViewMode === 'app' ? 'LifeCompass' :
                     calendarViewMode === 'phone' ? 'Phone Calendar' : 
                     'Combined View'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <MonthView 
            monthDates={monthDates}
            selectedMonthDay={selectedMonthDay}
            isToday={isToday}
            formatDate={formatDate}
            getTimeBlocksForDate={getTimeBlocksForDate}
            handleMonthDaySelect={handleMonthDaySelect}
            onTimeBlockPress={handleTimeBlockPress}
            onTimeBlockLongPress={handleTimeBlockLongPress}
            handleAddTimeBlock={handleAddTimeBlock}
            deleteTimeBlock={deleteTimeBlockHandler}
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
      {/* Header with Date and Fullscreen Button */}
      <View style={[
        styles.dateDisplay,
        {
          paddingTop: hasDynamicIsland ? scaleHeight(5) : scaleHeight(10),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: isFullscreen ? 4 : 8, // Reduced padding to bring navigation closer
          position: 'relative',
          marginBottom: isFullscreen ? 2 : 5, // Smaller margin in fullscreen
        }
      ]}>
        {/* Fullscreen Button - Left side of flex row (hidden during tour) */}
        {!isTourActive && (
          <TouchableOpacity 
            style={{
              padding: 8,
              zIndex: 2
            }}
            onPress={onFullScreenToggle}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            accessibilityHint={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
          >
            <Ionicons 
              name={isFullscreen ? "contract" : "expand"} 
              size={24} 
              color={theme.text} 
            />
          </TouchableOpacity>
        )}
        
        {/* Invisible spacer when fullscreen button is hidden during tour */}
        {isTourActive && (
          <View style={{ padding: 8, opacity: 0 }}>
            <Ionicons name="expand" size={24} color="transparent" />
          </View>
        )}

        {/* Date Text - Absolutely centered, smaller in fullscreen */}
        <Text 
          style={[
            styles.dateText, 
            { 
              color: isToday(currentDate) ? theme.primary : theme.text,
              fontWeight: isToday(currentDate) ? '700' : '600',
              fontSize: isFullscreen ? scaleFontSize(14) : scaleFontSize(18), // Smaller in fullscreen
              position: 'absolute',
              left: 0,
              right: 0,
              textAlign: 'center',
              zIndex: 1,
              opacity: isFullscreen ? 0.8 : 1 // Slightly faded in fullscreen
            }
          ]}
          maxFontSizeMultiplier={1.3}
          accessibilityRole="header"
        >
          {getFormattedDate(selectedTab)}
        </Text>

        {/* Spacer for balance (invisible) */}
        <View style={{ padding: 8, opacity: 0 }}>
          <Ionicons name="expand" size={24} color="transparent" />
        </View>
      </View>

      {/* Tab Navigator - Below date */}
      <View style={{ flex: 1 }}>
        <NavigationContainer independent={true} key={tabNavigatorKey} ref={tabNavigatorRef}>
          <Tab.Navigator
          initialRouteName="Day"
          screenOptions={{
            tabBarActiveTintColor: isDarkMode ? '#FFFFFF' : '#000000',
            tabBarInactiveTintColor: theme.textSecondary,
            swipeEnabled: isTourActive !== true, // Disable swiping during tour
            animationEnabled: true,
            tabBarStyle: { 
              backgroundColor: theme.cardElevated,
              elevation: 0,
              shadowOpacity: 0,
              borderRadius: scaleWidth(25),
              marginHorizontal: scaleWidth(20),
              marginBottom: 0,
              height: isFullscreen ? 0 : scaleHeight(44), // Hide tab bar in fullscreen
              overflow: 'hidden', // Ensure content is hidden when height is 0
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
            component={MemoizedDayTab}
            options={{
              tabBarAccessibilityLabel: "Day view",
            }}
          />
          <Tab.Screen 
            name="Week" 
            component={MemoizedWeekTab}
            options={{
              tabBarAccessibilityLabel: "Week view",
            }}
          />
          <Tab.Screen 
            name="Month" 
            component={MemoizedMonthTab}
            options={{
              tabBarAccessibilityLabel: "Month view",
            }}
          />
          </Tab.Navigator>
        </NavigationContainer>
      </View>


      {/* Floating Zoom Controls - Bottom center */}
      {selectedTab === 'Day' && (
        <View style={{
          position: 'absolute',
          bottom: isFullscreen 
            ? insets.bottom - scaleHeight(10) // Higher in fullscreen
            : insets.bottom - scaleHeight(25), // Lower in normal mode
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 100,
        }}>
          <View style={[
            styles.zoomControls, 
            { 
              backgroundColor: '#000000', // Black background
              borderColor: '#404040', // Lighter grey border for better visibility
              borderRadius: scaleWidth(24),
              paddingHorizontal: scaleWidth(12),
              minWidth: scaleWidth(140), // Fixed compact width
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }
          ]}>
          <TouchableOpacity 
            style={[
              styles.zoomButton, 
              ensureAccessibleTouchTarget(scaleWidth(36), scaleWidth(36)),
              { 
                backgroundColor: '#1C1C1E', // Very dark button background
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
                  color: '#FFFFFF', // White text for dark theme
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
                color: '#FFFFFF', // White text for dark theme
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
                backgroundColor: '#1C1C1E', // Very dark button background
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
                  color: '#FFFFFF', // White text for dark theme
                  fontSize: scaleFontSize(24),
                }
              ]}
            >
              +
            </Text>
          </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Floating Add Button - Left side like GoalsScreen (hidden in fullscreen and during tour) */}
      {!isFullscreen && !isTourActive && (
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
      )}
      
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
                    color: '#FFFFFF', // White text for dark theme
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

      {/* App Tour Overlay */}
      <AppTourOverlay
        isVisible={isTourActive && (currentStep === 'SCHEDULE_DEDICATED_TIME' || currentStep === 'SYSTEM_CONFIDENCE')}
        currentStep={currentStep}
        onComplete={nextStep}
        onSkip={skipTour}
        onSpecialAction={handleTourSpecialAction}
      />

      {/* Tour Lighting Overlay - Alternative to NavigationContainer opacity */}
      {isTourActive && (currentStep === 'SCHEDULE_DEDICATED_TIME' || currentStep === 'TIME_BLOCK_CREATED' || currentStep === 'SYSTEM_CONFIDENCE') && (
        <Animated.View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            opacity: tourTimeOpacity,
            zIndex: 998, // Below AppTourOverlay but above content
            pointerEvents: 'none', // Allow touches to pass through
          }}
        />
      )}

      {/* Tour Continue Button - Shows after time block is created */}
      {showTourContinueButton && (
        <View style={{
          position: 'absolute',
          bottom: 100,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#22c55e',
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 25,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={() => {
              console.log('🎯 Tour: Continue button pressed, advancing to system confidence');
              setShowTourContinueButton(false);
              nextStep();
            }}
          >
            <Text style={{
              color: 'white',
              fontSize: 18,
              fontWeight: '600',
            }}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tour Time Picker Popup */}
      <Modal
        visible={showTourTimePickerPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTourTimePickerPopup(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: theme.card || theme.background,
            borderRadius: 20,
            padding: 24,
            width: '90%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20
          }}>
            {/* Header */}
            <View style={{ marginBottom: 24, alignItems: 'center' }}>
              <Ionicons name="time" size={32} color="#22c55e" />
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: theme.text,
                marginTop: 8,
                textAlign: 'center'
              }}>
                {timePickerStep === 'duration' ? 'How long do you want to work?' : 'What time today?'}
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.textSecondary,
                marginTop: 4,
                textAlign: 'center'
              }}>
                {timePickerStep === 'duration' ? 
                  'Choose your focus session length' : 
                  `Block ${selectedDuration} minutes for your task`
                }
              </Text>
            </View>

            {/* Step 1: Duration Selection */}
            {timePickerStep === 'duration' && (
              <View style={{ marginBottom: 24 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#22c55e',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 12,
                    height: 72,
                    position: 'relative'
                  }}
                  onPress={() => handleDurationSelect(30)}
                >
                  <View style={{ paddingRight: 40 }}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                      30 minutes
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 16 }}>
                      Perfect for making solid progress on your task
                    </Text>
                  </View>
                  <View style={{ 
                    position: 'absolute', 
                    right: 16, 
                    top: 0, 
                    bottom: 0, 
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 24
                  }}>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#3b82f6',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 12,
                    height: 72,
                    position: 'relative'
                  }}
                  onPress={() => handleDurationSelect(60)}
                >
                  <View style={{ paddingRight: 40 }}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                      60 minutes
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 16 }}>
                      The ideal length for deep work sessions
                    </Text>
                  </View>
                  <View style={{ 
                    position: 'absolute', 
                    right: 16, 
                    top: 0, 
                    bottom: 0, 
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 24
                  }}>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#8b5cf6',
                    padding: 16,
                    borderRadius: 12,
                    height: 72,
                    position: 'relative'
                  }}
                  onPress={() => handleDurationSelect(90)}
                >
                  <View style={{ paddingRight: 40 }}>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                      90 minutes
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 16 }}>
                      Ultradian rhythm cycle - neuroscience-backed for intense focus
                    </Text>
                  </View>
                  <View style={{ 
                    position: 'absolute', 
                    right: 16, 
                    top: 0, 
                    bottom: 0, 
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 24
                  }}>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Time Selection */}
            {timePickerStep === 'time' && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 16,
                  color: theme.text,
                  marginBottom: 16,
                  textAlign: 'center'
                }}>
                  Pick a start time for today:
                </Text>
                
                <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                  {generateTimeSlots().map((timeSlot, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        borderWidth: 1,
                        padding: 16,
                        borderRadius: 12,
                        marginBottom: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onPress={() => handleCreateTourTimeBlock(selectedDuration, timeSlot.time)}
                    >
                      <View>
                        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>
                          {timeSlot.display}
                        </Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                          {timeSlot.endTime} • {selectedDuration} minutes
                        </Text>
                      </View>
                      <Ionicons name="arrow-forward" size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                {/* Back Button */}
                <TouchableOpacity
                  style={{
                    marginTop: 16,
                    padding: 12,
                    alignItems: 'center'
                  }}
                  onPress={() => setTimePickerStep('duration')}
                >
                  <Text style={{
                    color: theme.primary,
                    fontSize: 14
                  }}>
                    ← Back to duration
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Close Button */}
            <TouchableOpacity
              style={{
                padding: 12,
                alignItems: 'center'
              }}
              onPress={() => {
                setShowTourTimePickerPopup(false);
                setSelectedDuration(null);
                setTimePickerStep('duration');
              }}
            >
              <Text style={{
                color: theme.textSecondary,
                fontSize: 14
              }}>
                Maybe later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>



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
  // Custom icon container for general activity blocks
  timeBlockCustomIcon: {
    marginTop: scaleHeight(2),
    marginBottom: scaleHeight(2),
    alignItems: 'center',
    justifyContent: 'center',
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
    borderWidth: 2,
    // borderColor will be set dynamically in DayView.js
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
  
  // Inline action styles
  deleteOverlay: {
    // Styles defined inline in component for flexibility
  },
  deleteButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    gap: scaleHeight(4),
  },
  deleteButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmText: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: scaleHeight(8),
    paddingHorizontal: scaleWidth(12),
    borderRadius: scaleWidth(6),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scaleHeight(32),
  },
  confirmButtonText: {
    fontSize: scaleFontSize(12),
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default TimeScreen;