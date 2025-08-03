// src/screens/ProfileScreen/FocusTimer.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  Animated,
  TextInput,
  Platform,
  AppState,
  TouchableWithoutFeedback,
  InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PagerView from 'react-native-pager-view';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  isSmallDevice,
  isTablet,
  spacing,
  fontSizes,
  useScreenDimensions,
  useSafeSpacing,
  useIsLandscape,
  ensureAccessibleTouchTarget,
  meetsContrastRequirements,
  accessibility
} from '../../utils/responsive';

const FocusTimer = ({ theme, navigation }) => {
  // Timer states - separate for each mode
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);
  const [isCountupRunning, setIsCountupRunning] = useState(false);
  const [countdownTimeElapsed, setCountdownTimeElapsed] = useState(0);
  const [countupTimeElapsed, setCountupTimeElapsed] = useState(0);
  const [countdownStartTime, setCountdownStartTime] = useState(null);
  const [countupStartTime, setCountupStartTime] = useState(null);
  const [targetTime, setTargetTime] = useState(0); // default to 0, user sets their own time
  const [isCountdown, setIsCountdown] = useState(true);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [countdownDistractions, setCountdownDistractions] = useState(0);
  const [countupDistractions, setCountupDistractions] = useState(0);
  const [timerHistory, setTimerHistory] = useState([]);
  const [showCustomTimeInput, setShowCustomTimeInput] = useState(false);
  const [customTime, setCustomTime] = useState('');
  
  // New state for the fullscreen timer edit mode
  const [isTimerEditMode, setIsTimerEditMode] = useState(false);
  const [editHours, setEditHours] = useState('0');
  const [editMinutes, setEditMinutes] = useState('90');
  const [editSeconds, setEditSeconds] = useState('0');
  
  // Important: Instead of a separate modal for tips, we use a state to track info view
  const [showInfoInFullscreen, setShowInfoInFullscreen] = useState(false);
  
  // State for hint button
  const [showEditHint, setShowEditHint] = useState(false);
  
  // Track which mode the timer was started in
  const [activeTimerMode, setActiveTimerMode] = useState(null); // 'countdown' or 'countup' or null
  
  // Force re-render state for real-time updates
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Track interaction states
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get screen dimensions and safe area insets
  const { width, height } = useScreenDimensions();
  const safeSpacing = useSafeSpacing();
  const isLandscape = useIsLandscape();

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const isDarkMode = theme.background === '#000000';
  
  // Fullscreen mode tabs
  const fullscreenPagerRef = useRef(null);
  const tabIndicatorAnim = useRef(new Animated.Value(isCountdown ? 1 : 0)).current;

  // Preset durations - modified to only include 90 minutes
  const PRESET_DURATIONS = [
    { label: '90 min', value: 90 * 60 },
  ];

  // Ensure color contrast meets WCAG requirements
  const textColor = meetsContrastRequirements(theme.text, theme.card) 
    ? theme.text 
    : isDarkMode ? '#FFFFFF' : '#000000';
  
  const secondaryTextColor = meetsContrastRequirements(theme.textSecondary, theme.card) 
    ? theme.textSecondary 
    : isDarkMode ? '#E0E0E0' : '#4A4A4A';

  // Fullscreen text colors
  const fullscreenTextColor = '#FFFFFF';
  const fullscreenSecondaryTextColor = 'rgba(255,255,255,0.6)';

  useEffect(() => {
    loadTimerHistory();
    loadEditHintState();
  }, []);

  // Separate effect for animations and UI updates
  useEffect(() => {
    const currentlyRunning = getCurrentRunningState();
    
    // Start pulse animation for the pause/play button when timer is running
    if (currentlyRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCountdownRunning, isCountupRunning, isCountdown]);

  // Effect for UI updates and countdown completion check
  useEffect(() => {
    let updateInterval;
    
    if (isCountdownRunning || isCountupRunning) {
      updateInterval = setInterval(() => {
        // Check if countdown timer has completed
        if (isCountdownRunning && countdownStartTime) {
          const now = new Date().getTime();
          const sessionElapsed = Math.floor((now - countdownStartTime) / 1000);
          const totalElapsed = countdownTimeElapsed + sessionElapsed;
          
          if (totalElapsed >= targetTime) {
            // Timer completed
            setCountdownTimeElapsed(targetTime);
            setCountdownStartTime(null);
            setIsCountdownRunning(false);
            
            // Provide feedback when timer completes
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            
            // Save the completed session
            saveTimerSession(targetTime, countdownDistractions);
          }
        }
        
        // Force re-render to update displayed time
        setForceUpdate(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
      // Save state when component unmounts
      saveTimerState();
    };
  }, [isCountdownRunning, isCountupRunning, countdownStartTime, countupStartTime, targetTime]);

  // Update pager when mode changes
  useEffect(() => {
    // Animate tab indicator
    Animated.timing(tabIndicatorAnim, {
      toValue: isCountdown ? 1 : 0,
      duration: 250,
      useNativeDriver: true
    }).start();
    
    // Update pager page
    if (fullscreenMode && fullscreenPagerRef.current) {
      fullscreenPagerRef.current.setPage(isCountdown ? 1 : 0);
    }
  }, [isCountdown, fullscreenMode]);
  
  // Handle transitions
  useEffect(() => {
    if (isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  // Load and save timer state when app goes to background/foreground
  useEffect(() => {
    // Load timer state from storage initially
    loadTimerState();

    // Set up app state change listeners
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // App is in foreground, restore state
        loadTimerState();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App is in background, save state
        saveTimerState();
      }
    };
    
    // Subscribe to app state changes
    const subscription = AppState ? AppState.addEventListener('change', handleAppStateChange) : null;

    return () => {
      // Clean up
      if (subscription) {
        subscription.remove();
      }
      // Save state on unmount
      saveTimerState();
    };
  }, []);

  // Save timer state periodically when timer is running
  useEffect(() => {
    let saveInterval;
    
    if (isCountdownRunning || isCountupRunning) {
      // Save timer state every 10 seconds when running
      saveInterval = setInterval(() => {
        saveTimerState();
      }, 10000);
    }
    
    return () => {
      if (saveInterval) {
        clearInterval(saveInterval);
      }
    };
  }, [isCountdownRunning, isCountupRunning, countdownTimeElapsed, countupTimeElapsed, countdownStartTime, countupStartTime, targetTime, isCountdown, countdownDistractions, countupDistractions]);

  // Update edit time fields when target time changes
  useEffect(() => {
    const hours = Math.floor(targetTime / 3600);
    const minutes = Math.floor((targetTime % 3600) / 60);
    const seconds = targetTime % 60;
    
    setEditHours(hours.toString());
    setEditMinutes(minutes.toString());
    setEditSeconds(seconds.toString());
  }, [targetTime]);

  // Load timer history from storage
  const loadTimerHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem('focusTimerHistory');
      if (historyJson) {
        setTimerHistory(JSON.parse(historyJson));
      }
    } catch (error) {
      console.error('Error loading timer history:', error);
    }
  };

  // Load edit hint state from storage
  const loadEditHintState = async () => {
    try {
      const hintDismissed = await AsyncStorage.getItem('focusTimerEditHintDismissed');
      if (!hintDismissed) {
        setShowEditHint(true);
      }
    } catch (error) {
      console.error('Error loading edit hint state:', error);
    }
  };

  // Dismiss the edit hint permanently
  const dismissEditHint = async () => {
    try {
      await AsyncStorage.setItem('focusTimerEditHintDismissed', 'true');
      setShowEditHint(false);
    } catch (error) {
      console.error('Error saving edit hint state:', error);
    }
  };

  // Load timer state from storage
  const loadTimerState = async () => {
    try {
      const timerStateJson = await AsyncStorage.getItem('focusTimerCurrentState');
      if (timerStateJson) {
        const state = JSON.parse(timerStateJson);
        const now = new Date().getTime();
        
        // Restore state if last update was within 24 hours (much longer window)
        if (state.lastUpdated && (now - state.lastUpdated < 24 * 60 * 60 * 1000)) {
          setIsCountdown(state.isCountdown);
          setTargetTime(state.targetTime);
          setActiveTimerMode(state.activeTimerMode || null);
          
          // Restore countdown state
          if (state.countdownDistractions !== undefined) {
            setCountdownDistractions(state.countdownDistractions);
          }
          if (state.countupDistractions !== undefined) {
            setCountupDistractions(state.countupDistractions);
          }
          
          // Restore countdown timer state
          if (state.isCountdownRunning && state.countdownStartTime) {
            // Calculate elapsed time including time passed while app was in background
            const totalElapsed = Math.floor((now - state.countdownStartTime) / 1000);
            
            // Check if countdown timer has finished while in background
            if (totalElapsed >= state.targetTime) {
              setCountdownTimeElapsed(state.targetTime);
              setIsCountdownRunning(false);
              setCountdownStartTime(null);
            } else {
              setCountdownStartTime(state.countdownStartTime);
              setIsCountdownRunning(true);
            }
          } else if (state.countdownTimeElapsed !== undefined) {
            setCountdownTimeElapsed(state.countdownTimeElapsed);
          }
          
          // Restore countup timer state
          if (state.isCountupRunning && state.countupStartTime) {
            setCountupStartTime(state.countupStartTime);
            setIsCountupRunning(true);
          } else if (state.countupTimeElapsed !== undefined) {
            setCountupTimeElapsed(state.countupTimeElapsed);
          }
        }
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  };

  // Save current timer state to storage
  const saveTimerState = async () => {
    try {
      const timerState = {
        isCountdownRunning,
        isCountupRunning,
        countdownTimeElapsed,
        countupTimeElapsed,
        countdownStartTime,
        countupStartTime,
        targetTime,
        isCountdown,
        countdownDistractions,
        countupDistractions,
        activeTimerMode,
        lastUpdated: new Date().getTime()
      };
      await AsyncStorage.setItem('focusTimerCurrentState', JSON.stringify(timerState));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

  // Start the timer interval using a persistent background timer
  const startTimerInterval = () => {
    // Don't create a new interval if one is already running
    // The timer will be updated based on elapsed time calculations from start time
  };

  // Save timer session
  const saveTimerSession = async (duration, distractions) => {
    try {
      const newSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        duration, // in seconds
        distractions,
        isCompleted: isCountdown ? (getCurrentTimeElapsed() >= targetTime) : true
      };
      
      const updatedHistory = [newSession, ...timerHistory].slice(0, 50); // Keep last 50 sessions
      setTimerHistory(updatedHistory);
      await AsyncStorage.setItem('focusTimerHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving timer session:', error);
    }
  };

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };


  // Helper functions for current mode
  const getCurrentRunningState = () => {
    return isCountdown ? isCountdownRunning : isCountupRunning;
  };

  // Get running state for a specific mode (prevents flash during transitions)
  const getRunningStateForMode = (forCountdown) => {
    return forCountdown ? isCountdownRunning : isCountupRunning;
  };

  // Calculate real-time elapsed time based on start timestamp
  const calculateElapsedTime = (startTime, baseElapsed) => {
    if (!startTime) return baseElapsed;
    const now = new Date().getTime();
    const actualElapsed = Math.floor((now - startTime) / 1000) + baseElapsed;
    return actualElapsed;
  };

  const getCurrentTimeElapsed = () => {
    if (isCountdown) {
      if (isCountdownRunning && countdownStartTime) {
        // Calculate total elapsed time: stored elapsed + time since start
        const now = new Date().getTime();
        const sessionElapsed = Math.floor((now - countdownStartTime) / 1000);
        return countdownTimeElapsed + sessionElapsed;
      }
      return countdownTimeElapsed;
    } else {
      if (isCountupRunning && countupStartTime) {
        // Calculate total elapsed time: stored elapsed + time since start
        const now = new Date().getTime();
        const sessionElapsed = Math.floor((now - countupStartTime) / 1000);
        return countupTimeElapsed + sessionElapsed;
      }
      return countupTimeElapsed;
    }
  };

  const getCurrentDistractions = () => {
    return isCountdown ? countdownDistractions : countupDistractions;
  };

  const setCurrentRunningState = (running) => {
    if (isCountdown) {
      setIsCountdownRunning(running);
    } else {
      setIsCountupRunning(running);
    }
  };

  const setCurrentTimeElapsed = (time) => {
    if (isCountdown) {
      setCountdownTimeElapsed(time);
    } else {
      setCountupTimeElapsed(time);
    }
  };

  const setCurrentDistractions = (count) => {
    if (isCountdown) {
      setCountdownDistractions(count);
    } else {
      setCountupDistractions(count);
    }
  };

  // Get time to display for current mode
  const getDisplayTime = () => {
    if (isCountdown) {
      const currentElapsed = getCurrentTimeElapsed();
      return Math.max(0, targetTime - currentElapsed);
    } else {
      return getCurrentTimeElapsed();
    }
  };

  // Get time to display for a specific mode (used in fullscreen to prevent flash during transitions)
  const getDisplayTimeForMode = (forCountdown) => {
    if (forCountdown) {
      // Always use countdown state for countdown display
      if (isCountdownRunning && countdownStartTime) {
        const now = new Date().getTime();
        const sessionElapsed = Math.floor((now - countdownStartTime) / 1000);
        const totalElapsed = countdownTimeElapsed + sessionElapsed;
        return Math.max(0, targetTime - totalElapsed);
      }
      return Math.max(0, targetTime - countdownTimeElapsed);
    } else {
      // Always use countup state for countup display
      if (isCountupRunning && countupStartTime) {
        const now = new Date().getTime();
        const sessionElapsed = Math.floor((now - countupStartTime) / 1000);
        return countupTimeElapsed + sessionElapsed;
      }
      return countupTimeElapsed;
    }
  };

  // Start the timer
  const startTimer = () => {
    // If in edit mode, save the edited time first
    if (isTimerEditMode) {
      saveEditedTime();
      setIsTimerEditMode(false);
    }
    
    // Set the active timer mode based on current mode
    setActiveTimerMode(isCountdown ? 'countdown' : 'countup');
    
    // Set start time for real-time calculations (resume from current elapsed time)
    const now = new Date().getTime();
    if (isCountdown) {
      setCountdownStartTime(now);
      setIsCountdownRunning(true);
    } else {
      setCountupStartTime(now);
      setIsCountupRunning(true);
    }
  };

  // Pause the timer - increment distraction counter every time
  const pauseTimer = () => {
    // Calculate and save elapsed time before pausing
    if (isCountdown && isCountdownRunning && countdownStartTime) {
      const now = new Date().getTime();
      const sessionElapsed = Math.floor((now - countdownStartTime) / 1000);
      const totalElapsed = countdownTimeElapsed + sessionElapsed;
      setCountdownTimeElapsed(totalElapsed);
      setCountdownStartTime(null);
      setIsCountdownRunning(false);
    } else if (!isCountdown && isCountupRunning && countupStartTime) {
      const now = new Date().getTime();
      const sessionElapsed = Math.floor((now - countupStartTime) / 1000);
      const totalElapsed = countupTimeElapsed + sessionElapsed;
      setCountupTimeElapsed(totalElapsed);
      setCountupStartTime(null);
      setIsCountupRunning(false);
    }
    
    setCurrentDistractions(prev => prev + 1);
    
    // Provide haptic feedback for distraction logging
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Reset the timer
  const resetTimer = (resetTargetTime = false) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const currentTimeElapsed = getCurrentTimeElapsed();
    const currentDistractions = getCurrentDistractions();
    
    // If we had accumulated some time, save the session
    if (currentTimeElapsed > 0) {
      saveTimerSession(currentTimeElapsed, currentDistractions);
    }
    
    // Reset the current mode's state
    if (isCountdown) {
      setIsCountdownRunning(false);
      setCountdownTimeElapsed(0);
      setCountdownStartTime(null);
      setCountdownDistractions(0);
    } else {
      setIsCountupRunning(false);
      setCountupTimeElapsed(0);
      setCountupStartTime(null);
      setCountupDistractions(0);
    }
    
    setActiveTimerMode(null); // Clear active timer mode
    
    // Only reset target time if explicitly requested (e.g., when changing modes)
    if (resetTargetTime && isCountdown) {
      setTargetTime(0);
    }
  };

  // Toggle between count-up and countdown modes
  const toggleTimerMode = () => {
    // Only reset if no timers are currently running
    if (!isCountdownRunning && !isCountupRunning) {
      resetTimer(true); // Reset target time when changing modes
    }
    setIsCountdown(!isCountdown);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (isTransitioning) return; // Prevent multiple clicks during transition
    
    setIsTransitioning(true);
    
    if (fullscreenMode) {
      // Make sure info view is hidden when exiting fullscreen
      setShowInfoInFullscreen(false);
      setIsTimerEditMode(false);
      setFullscreenMode(false);
    } else {
      setFullscreenMode(true);
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 100);
  };
  
  // Handle custom time input
  const handleCustomTimeSubmit = () => {
    const minutes = parseInt(customTime);
    if (!isNaN(minutes) && minutes > 0) {
      setTargetTime(minutes * 60);
      setCustomTime('');
      setShowCustomTimeInput(false);
    }
  };
  
  // Handle fullscreen pager page change
  const handlePageSelected = (e) => {
    const pageIndex = e.nativeEvent.position;
    if ((pageIndex === 1) !== isCountdown) {
      // Only reset if no timers are currently running
      if (!isCountdownRunning && !isCountupRunning) {
        resetTimer(true); // Reset target time when changing modes
      }
      setIsCountdown(pageIndex === 1);
    }
  };
  
  // Handle tab press in fullscreen mode
  const handleTabPress = (tabIndex) => {
    if (fullscreenPagerRef.current) {
      fullscreenPagerRef.current.setPage(tabIndex);
    }
    
    if ((tabIndex === 1) !== isCountdown) {
      // Only reset if no timers are currently running
      if (!isCountdownRunning && !isCountupRunning) {
        resetTimer(true); // Reset target time when changing modes
      }
      setIsCountdown(tabIndex === 1);
    }
  };
  
  // Handle realtime page scroll
  const handlePageScroll = (e) => {
    const { position, offset } = e.nativeEvent;
    const scrollValue = position + offset;
    tabIndicatorAnim.setValue(scrollValue);
  };

  // Toggle 90 minute preset button
  const toggle90MinutesPreset = () => {
    // If already at 90 minutes, reset to 0
    if (targetTime === 90 * 60) {
      setTargetTime(0);
      setCurrentTimeElapsed(0);
    } else {
      // Otherwise set to 90 minutes
      setTargetTime(90 * 60);
      setCurrentTimeElapsed(0);
    }
  };

  // Toggle timer edit mode
  const toggleTimerEditMode = () => {
    if (getCurrentRunningState()) return; // Don't allow editing while timer is running
    
    if (isTimerEditMode) {
      // Exit edit mode without saving (will be saved when play is pressed)
      setIsTimerEditMode(false);
    } else {
      // Enter edit mode
      setIsTimerEditMode(true);
    }
  };

  // Save the edited time
  const saveEditedTime = () => {
    // Validate and limit the inputs
    let hours = parseInt(editHours) || 0;
    let minutes = parseInt(editMinutes) || 0;
    let seconds = parseInt(editSeconds) || 0;
    
    // Enforce limits: minutes and seconds should be 0-59
    minutes = Math.min(59, minutes);
    seconds = Math.min(59, seconds);
    
    const newTargetTime = (hours * 3600) + (minutes * 60) + seconds;
    
    if (newTargetTime > 0) {
      setTargetTime(newTargetTime);
      setCurrentTimeElapsed(0);
    }
    
    // Update the state with the validated values
    setEditHours(hours.toString());
    setEditMinutes(minutes.toString());
    setEditSeconds(seconds.toString());
    
    setIsTimerEditMode(false);
  };

  // Regular timer view (for profile screen)
  const renderTimerView = () => (
    <TouchableOpacity 
      style={[
        styles.timerContainer,
        {
          borderRadius: 20,
          padding: 20,
          backgroundColor: '#1A1A1A',
          borderWidth: 1,
          borderColor: '#2A2A2A',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }
      ]}
      onPress={toggleFullscreen}
      activeOpacity={0.95}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Enter fullscreen mode"
      accessibilityHint="Opens the timer in fullscreen for better focus"
      disabled={isTransitioning}
    >
      {/* Header Section */}
      <View style={[
        styles.timerHeader,
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: getCurrentRunningState() ? '#FF9500' : '#4CAF50',
            marginRight: 10
          }} />
          <Text 
            style={[
              styles.timerTitle, 
              { 
                color: '#FFFFFF',
                fontSize: 18,
                fontWeight: '600'
              }
            ]}
            maxFontSizeMultiplier={1.5}
            accessible={true}
            accessibilityRole="header"
          >
            Focus Timer
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.modeToggle, 
            { 
              backgroundColor: isCountdown ? '#FF9500' : '#4CAF50',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center'
            }
          ]}
          onPress={(e) => {
            e.stopPropagation();
            toggleTimerMode();
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${isCountdown ? 'count up' : 'countdown'} mode`}
          accessibilityHint={`Changes the timer to ${isCountdown ? 'count up from zero' : 'count down from a target time'}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          disabled={isTransitioning}
        >
          <Ionicons 
            name={isCountdown ? "timer" : "stopwatch"} 
            size={14}
            color="#FFFFFF" 
            style={{ marginRight: 4 }}
          />
          <Text 
            style={[
              styles.modeToggleText, 
              { 
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: '600'
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            {isCountdown ? 'Countdown' : 'Count Up'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Main Timer Display */}
      <View style={[
        styles.timerDisplay,
        {
          backgroundColor: '#0A0A0A',
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#333'
        }
      ]}>
        <Text 
          style={[
            styles.timeText, 
            { 
              color: '#FFFFFF',
              fontSize: 36,
              fontWeight: '700',
              fontVariant: ['tabular-nums'],
              letterSpacing: 1
            }
          ]}
          maxFontSizeMultiplier={1.3}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`${isCountdown ? 'Remaining time' : 'Elapsed time'} ${formatTime(getDisplayTime())}`}
        >
          {formatTime(getDisplayTime())}
        </Text>
        
        {isCountdown && (
          <Text 
            style={[
              styles.targetText, 
              { 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: 14,
                marginTop: 8,
                fontVariant: ['tabular-nums']
              }
            ]}
            maxFontSizeMultiplier={1.5}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Target time ${formatTime(targetTime)}`}
          >
            Target: {formatTime(targetTime)}
          </Text>
        )}
      </View>
      
      {/* Controls Section */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        {/* Play/Pause Button */}
        <View style={[
          styles.mainButtonContainer,
          { flex: 0 }
        ]}>
          {getCurrentRunningState() ? (
            <Animated.View 
              style={[
                styles.pauseButtonWrapper,
                { 
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.pauseButton, 
                  { 
                    backgroundColor: '#FF6B6B',
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#FF6B6B',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  pauseTimer();
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Pause timer and log distraction"
                accessibilityHint="Pauses the timer and adds 1 to your distraction count"
                disabled={isTransitioning}
              >
                <Ionicons 
                  name="pause" 
                  size={24}
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity
              style={[
                styles.startButton, 
                { 
                  backgroundColor: '#4CAF50',
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#4CAF50',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }
              ]}
              onPress={(e) => {
                e.stopPropagation();
                startTimer();
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Start timer"
              accessibilityHint="Begins your focus session"
              disabled={isTransitioning}
            >
              <Ionicons 
                name="play" 
                size={24}
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Stats Section */}
        <View style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: 20
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: 12,
              fontWeight: '500'
            }}>
              Distractions
            </Text>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 20,
              fontWeight: '700',
              marginTop: 4
            }}>
              {getCurrentDistractions()}
            </Text>
          </View>
          
          {getCurrentTimeElapsed() > 0 && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: 12,
                fontWeight: '500'
              }}>
                Total Min
              </Text>
              <Text style={{
                color: '#FFFFFF',
                fontSize: 20,
                fontWeight: '700',
                marginTop: 4
              }}>
                {Math.floor(getCurrentTimeElapsed() / 60)}
              </Text>
            </View>
          )}
        </View>
        
        {/* Reset Button */}
        {getCurrentTimeElapsed() > 0 && !getCurrentRunningState() && (
          <TouchableOpacity
            style={[
              styles.resetButton, 
              { 
                backgroundColor: '#333333',
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center'
              }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              resetTimer();
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Reset timer"
            accessibilityHint="Resets the timer and saves your session"
            disabled={isTransitioning}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Quick Actions - Only for countdown mode when not running */}
      {isCountdown && !getCurrentRunningState() && (
        <View style={[
          styles.presetButtons,
          { 
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 12
          }
        ]}>
          <TouchableOpacity
            style={[
              styles.presetButton, 
              { 
                backgroundColor: PRESET_DURATIONS[0].value === targetTime ? '#FF9500' : '#2A2A2A',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: PRESET_DURATIONS[0].value === targetTime ? '#FF9500' : '#3A3A3A'
              }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              toggle90MinutesPreset();
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Set timer for ${PRESET_DURATIONS[0].label}`}
            accessibilityState={{ selected: PRESET_DURATIONS[0].value === targetTime }}
            disabled={isTransitioning}
          >
            <Text 
              style={[
                styles.presetButtonText, 
                { 
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: '600'
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              {PRESET_DURATIONS[0].label}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.presetButton, 
              { 
                backgroundColor: showCustomTimeInput ? '#FF9500' : '#2A2A2A',
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: showCustomTimeInput ? '#FF9500' : '#3A3A3A'
              }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              setShowCustomTimeInput(!showCustomTimeInput);
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Set custom timer duration"
            accessibilityState={{ expanded: showCustomTimeInput }}
            disabled={isTransitioning}
          >
            <Text 
              style={[
                styles.presetButtonText, 
                { 
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: '600'
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              Custom
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Custom Time Input */}
      {showCustomTimeInput && (
        <View style={[
          styles.customTimeContainer,
          { 
            marginTop: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12
          }
        ]}>
          <TextInput
            style={[
              styles.customTimeInput, 
              { 
                borderColor: '#3A3A3A',
                color: '#FFFFFF',
                backgroundColor: '#2A2A2A',
                height: 44,
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 16,
                flex: 1,
                fontSize: 16
              }
            ]}
            value={customTime}
            onChangeText={setCustomTime}
            placeholder="Enter minutes"
            placeholderTextColor="rgba(255,255,255,0.5)"
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={handleCustomTimeSubmit}
            maxFontSizeMultiplier={1.5}
            accessible={true}
            accessibilityLabel="Enter custom time in minutes"
            accessibilityHint="Enter a number for your custom timer duration in minutes"
            onTouchStart={(e) => e.stopPropagation()}
          />
          <TouchableOpacity
            style={[
              styles.customTimeButton, 
              { 
                backgroundColor: '#4CAF50',
                height: 44,
                paddingHorizontal: 20,
                borderRadius: 12,
                justifyContent: 'center'
              }
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handleCustomTimeSubmit();
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Set custom time"
            disabled={isTransitioning}
          >
            <Text 
              style={[
                styles.customTimeButtonText,
                {
                  color: '#FFFFFF',
                  fontWeight: '600',
                  fontSize: 14
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              Set
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
  
  // Render the redesigned fullscreen timer tabs
  const renderFullscreenTabs = () => {
    // Calculate the translation value for the tab indicator
    const translateX = tabIndicatorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, (width - (safeSpacing.left + safeSpacing.right) - spacing.xl) / 2]
    });
    
    return (
      <View 
        style={[
          styles.fullscreenTabsContainer,
          {
            width: width - (safeSpacing.left + safeSpacing.right) - spacing.xl,
            height: scaleHeight(50),
            borderRadius: scaleWidth(25)
          }
        ]}
        accessible={true}
        accessibilityRole="tablist"
      >
        {/* Tab Background */}
        <View 
          style={[
            styles.tabsBackground, 
            { 
              backgroundColor: '#1C1C1E',
              borderRadius: scaleWidth(25)
            }
          ]}
        />
        
        {/* Animated Tab Indicator */}
        <Animated.View 
          style={[
            styles.tabIndicator,
            {
              transform: [{ translateX }],
              backgroundColor: '#FF9500', // Match the amber/orange color from screenshot
              width: (width - (safeSpacing.left + safeSpacing.right) - spacing.xl) / 2,
              height: scaleHeight(50),
              borderRadius: scaleWidth(25)
            }
          ]}
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        />
        
        {/* Count Up Tab */}
        <TouchableOpacity 
          style={[
            styles.tab,
            {
              minWidth: accessibility.minTouchTarget,
              minHeight: accessibility.minTouchTarget
            }
          ]}
          onPress={() => handleTabPress(0)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="Count up mode"
          accessibilityState={{ selected: !isCountdown }}
        >
          <Ionicons 
            name={isCountdown ? "stopwatch-outline" : "stopwatch"} 
            size={scaleWidth(22)} 
            color="#FFFFFF"
          />
          <Text 
            style={[
              styles.tabText, 
              { 
                color: "#FFFFFF",
                fontWeight: !isCountdown ? 'bold' : 'normal',
                fontSize: fontSizes.m,
                marginLeft: spacing.xs
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Count Up
          </Text>
        </TouchableOpacity>
        
        {/* Countdown Tab */}
        <TouchableOpacity 
          style={[
            styles.tab,
            {
              minWidth: accessibility.minTouchTarget,
              minHeight: accessibility.minTouchTarget
            }
          ]}
          onPress={() => handleTabPress(1)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="Countdown mode"
          accessibilityState={{ selected: isCountdown }}
        >
          <Ionicons 
            name={isCountdown ? "timer" : "timer-outline"} 
            size={scaleWidth(22)} 
            color="#FFFFFF"
          />
          <Text 
            style={[
              styles.tabText, 
              { 
                color: "#FFFFFF",
                fontWeight: isCountdown ? 'bold' : 'normal',
                fontSize: fontSizes.m,
                marginLeft: spacing.xs
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Countdown
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render content for the count up page
  const renderCountUpPage = () => (
    <View style={styles.fullscreenPage}>
      {/* Timer Display */}
      <View style={[
        styles.fullscreenTimerDisplay,
        { marginBottom: scaleHeight(20) }
      ]}>
        <Text 
          style={[
            styles.fullscreenTimeText, 
            { 
              color: fullscreenTextColor,
              fontSize: isSmallDevice ? scaleWidth(60) : scaleWidth(72),
              fontWeight: 'bold',
              fontVariant: ['tabular-nums']
            }
          ]}
          maxFontSizeMultiplier={1.3}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`Elapsed time ${formatTime(getDisplayTimeForMode(false))}`}
        >
          {formatTime(getDisplayTimeForMode(false))}
        </Text>
        
        {/* Empty space to match the height of the target text in countdown mode */}
        <Text 
          style={[
            styles.fullscreenTargetText, 
            { 
              color: 'transparent',
              fontSize: fontSizes.l,
              marginTop: spacing.xs
            }
          ]}
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        >
          Target: 00:00:00
        </Text>
      </View>
      
      {/* Timer Controls */}
      <View style={[
        styles.fullscreenButtonsContainer,
        {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: scaleHeight(40)
        }
      ]}>
        {getRunningStateForMode(false) ? (
          <Animated.View 
            style={[
              styles.fullscreenPauseWrapper,
              { 
                transform: [{ scale: pulseAnim }],
                width: scaleWidth(130),
                height: scaleWidth(130),
                borderRadius: scaleWidth(65)
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.fullscreenPauseButton, 
                { 
                  backgroundColor: '#FF9500',
                  width: scaleWidth(120),
                  height: scaleWidth(120),
                  borderRadius: scaleWidth(60)
                }
              ]}
              onPress={pauseTimer}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Pause timer and log distraction"
              accessibilityHint="Pauses the timer and adds 1 to your distraction count"
            >
              <Ionicons name="pause" size={scaleWidth(48)} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity
            style={[
              styles.fullscreenStartButton, 
              { 
                backgroundColor: '#FF9500',
                width: scaleWidth(120),
                height: scaleWidth(120),
                borderRadius: scaleWidth(60)
              }
            ]}
            onPress={startTimer}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Start timer"
            accessibilityHint="Begins your focus session"
          >
            <Ionicons name="play" size={scaleWidth(48)} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        
        {countupTimeElapsed > 0 && !getRunningStateForMode(false) && (
          <TouchableOpacity
            style={[
              styles.fullscreenResetButton, 
              { 
                backgroundColor: '#333333',
                width: scaleWidth(50),
                height: scaleWidth(50),
                borderRadius: scaleWidth(25),
                marginLeft: spacing.m
              }
            ]}
            onPress={resetTimer}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Reset timer"
            accessibilityHint="Resets the timer and saves your session"
          >
            <Ionicons name="refresh" size={scaleWidth(24)} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Stats Cards */}
      <View style={[
        styles.fullscreenStatsContainer,
        {
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: scaleHeight(40)
        }
      ]}>
        <View 
          style={[
            styles.fullscreenStatCard, 
            { 
              backgroundColor: '#1C1C1E',
              borderColor: '#1C1C1E',
              width: isTablet ? '30%' : '40%',
              paddingVertical: spacing.m,
              borderRadius: scaleWidth(16),
              alignItems: 'center',
              borderWidth: 1
            }
          ]}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`${countupDistractions} distractions`}
        >
          <Text 
            style={[
              styles.fullscreenStatValue, 
              { 
                color: fullscreenTextColor,
                fontSize: fontSizes.xxxl,
                fontWeight: 'bold'
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            {countupDistractions}
          </Text>
          <Text 
            style={[
              styles.fullscreenStatLabel, 
              { 
                color: fullscreenSecondaryTextColor,
                fontSize: fontSizes.s,
                marginTop: spacing.xxs
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Distractions
          </Text>
        </View>
        
        <View 
          style={[
            styles.fullscreenStatCard, 
            { 
              backgroundColor: '#1C1C1E',
              borderColor: '#1C1C1E',
              width: isTablet ? '30%' : '40%',
              paddingVertical: spacing.m,
              borderRadius: scaleWidth(16),
              alignItems: 'center',
              borderWidth: 1
            }
          ]}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`${Math.floor(getDisplayTimeForMode(false) / 60)} minutes elapsed`}
        >
          <Text 
            style={[
              styles.fullscreenStatValue, 
              { 
                color: fullscreenTextColor,
                fontSize: fontSizes.xxxl,
                fontWeight: 'bold'
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            {Math.floor(getDisplayTimeForMode(false) / 60)}
          </Text>
          <Text 
            style={[
              styles.fullscreenStatLabel, 
              { 
                color: fullscreenSecondaryTextColor,
                fontSize: fontSizes.s,
                marginTop: spacing.xxs
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Minutes
          </Text>
        </View>
      </View>
    </View>
  );
  
  // Render time picker for editing the timer
  const renderTimePicker = () => (
    <View style={[
      styles.fullscreenTimePicker,
      {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: scaleHeight(20),
        marginBottom: scaleHeight(30)
      }
    ]}>
      {/* Hours */}
      <View style={styles.timePickerUnit}>
        <TextInput
          style={[
            styles.timePickerInput,
            {
              color: '#FFFFFF',
              fontSize: fontSizes.xxl,
              fontWeight: 'bold',
              textAlign: 'center',
              width: scaleWidth(70),
              height: scaleHeight(60),
              backgroundColor: '#1C1C1E',
              borderRadius: scaleWidth(12),
              marginHorizontal: spacing.xs
            }
          ]}
          value={editHours}
          onChangeText={text => {
            // Only allow numeric input
            const numericInput = text.replace(/[^0-9]/g, '');
            setEditHours(numericInput);
          }}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus={true}
          accessible={true}
          accessibilityLabel="Hours"
          maxFontSizeMultiplier={1.5}
        />
        <Text style={{ color: '#FFFFFF', marginTop: spacing.xxs }}>Hours</Text>
      </View>
      
      <Text style={{ color: '#FFFFFF', fontSize: fontSizes.xxl, marginHorizontal: spacing.xs }}>:</Text>
      
      {/* Minutes */}
      <View style={styles.timePickerUnit}>
        <TextInput
          style={[
            styles.timePickerInput,
            {
              color: '#FFFFFF',
              fontSize: fontSizes.xxl,
              fontWeight: 'bold',
              textAlign: 'center',
              width: scaleWidth(70),
              height: scaleHeight(60),
              backgroundColor: '#1C1C1E',
              borderRadius: scaleWidth(12),
              marginHorizontal: spacing.xs
            }
          ]}
          value={editMinutes}
          onChangeText={text => {
            // Only allow numeric input
            const numericInput = text.replace(/[^0-9]/g, '');
            // Enforce maximum of 59 minutes
            const validatedMinutes = Math.min(parseInt(numericInput) || 0, 59);
            setEditMinutes(validatedMinutes.toString());
          }}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus={true}
          accessible={true}
          accessibilityLabel="Minutes"
          maxFontSizeMultiplier={1.5}
        />
        <Text style={{ color: '#FFFFFF', marginTop: spacing.xxs }}>Minutes</Text>
      </View>
      
      <Text style={{ color: '#FFFFFF', fontSize: fontSizes.xxl, marginHorizontal: spacing.xs }}>:</Text>
      
      {/* Seconds */}
      <View style={styles.timePickerUnit}>
        <TextInput
          style={[
            styles.timePickerInput,
            {
              color: '#FFFFFF',
              fontSize: fontSizes.xxl,
              fontWeight: 'bold',
              textAlign: 'center',
              width: scaleWidth(70),
              height: scaleHeight(60),
              backgroundColor: '#1C1C1E',
              borderRadius: scaleWidth(12),
              marginHorizontal: spacing.xs
            }
          ]}
          value={editSeconds}
          onChangeText={text => {
            // Only allow numeric input
            const numericInput = text.replace(/[^0-9]/g, '');
            // Enforce maximum of 59 seconds
            const validatedSeconds = Math.min(parseInt(numericInput) || 0, 59);
            setEditSeconds(validatedSeconds.toString());
          }}
          keyboardType="number-pad"
          maxLength={2}
          selectTextOnFocus={true}
          accessible={true}
          accessibilityLabel="Seconds"
          maxFontSizeMultiplier={1.5}
        />
        <Text style={{ color: '#FFFFFF', marginTop: spacing.xxs }}>Seconds</Text>
      </View>
    </View>
  );
  
  
  // Render content for the countdown page
  const renderCountdownPage = () => (
    <View style={styles.fullscreenPage}>
      {/* Timer Display */}
      <View style={[
        styles.fullscreenTimerDisplay,
        { marginBottom: scaleHeight(50) }
      ]}>
        {isTimerEditMode ? (
          // Show time picker in edit mode
          renderTimePicker()
        ) : (
          // Show timer display
          <>
            <TouchableOpacity
              onPress={!getRunningStateForMode(true) ? () => {
                toggleTimerEditMode();
                dismissEditHint();
              } : undefined}
              activeOpacity={getRunningStateForMode(true) ? 1 : 0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={getRunningStateForMode(true) ? "Timer running" : "Edit timer"}
              accessibilityHint={getRunningStateForMode(true) ? undefined : "Tap to edit hours, minutes, and seconds"}
            >
              <Text 
                style={[
                  styles.fullscreenTimeText, 
                  { 
                    color: fullscreenTextColor,
                    fontSize: isSmallDevice ? scaleWidth(60) : scaleWidth(72),
                    fontWeight: 'bold',
                    fontVariant: ['tabular-nums']
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {formatTime(getDisplayTimeForMode(true))}
              </Text>
            </TouchableOpacity>
            
            {/* Show edit hint only if not running and hint hasn't been dismissed */}
            {!getRunningStateForMode(true) && showEditHint && (
              <View style={[
                styles.editHintContainer,
                {
                  backgroundColor: 'rgba(255, 149, 0, 0.9)',
                  borderRadius: scaleWidth(20),
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.m,
                  marginTop: spacing.s,
                  flexDirection: 'row',
                  alignItems: 'center',
                  maxWidth: '80%',
                  alignSelf: 'center'
                }
              ]}>
                <Ionicons 
                  name="finger-print-outline" 
                  size={scaleWidth(16)} 
                  color="#FFFFFF" 
                  style={{ marginRight: spacing.xs }}
                />
                <Text 
                  style={[
                    styles.editHintText,
                    {
                      color: '#FFFFFF',
                      fontSize: fontSizes.s,
                      fontWeight: '500',
                      flex: 1,
                      textAlign: 'center'
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Tap time to edit
                </Text>
                <TouchableOpacity
                  onPress={dismissEditHint}
                  style={{
                    marginLeft: spacing.xs,
                    padding: spacing.xxs
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons 
                    name="close" 
                    size={scaleWidth(14)} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
      
      {/* Timer Controls */}
      <View style={[
        styles.fullscreenButtonsContainer,
        {
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: scaleHeight(40)
        }
      ]}>
        {getRunningStateForMode(true) ? (
          <Animated.View 
            style={[
              styles.fullscreenPauseWrapper,
              { 
                transform: [{ scale: pulseAnim }],
                width: scaleWidth(130),
                height: scaleWidth(130),
                borderRadius: scaleWidth(65)
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.fullscreenPauseButton, 
                { 
                  backgroundColor: '#FF9500',
                  width: scaleWidth(120),
                  height: scaleWidth(120),
                  borderRadius: scaleWidth(60)
                }
              ]}
              onPress={pauseTimer}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Pause timer and log distraction"
              accessibilityHint="Pauses the timer and adds 1 to your distraction count"
            >
              <Ionicons name="pause" size={scaleWidth(48)} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <TouchableOpacity
            style={[
              styles.fullscreenStartButton, 
              { 
                backgroundColor: '#FF9500',
                width: scaleWidth(120),
                height: scaleWidth(120),
                borderRadius: scaleWidth(60)
              }
            ]}
            onPress={startTimer}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Start timer"
            accessibilityHint="Begins your focus session"
          >
            <Ionicons name="play" size={scaleWidth(48)} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        
        {countdownTimeElapsed > 0 && !getRunningStateForMode(true) && (
          <TouchableOpacity
            style={[
              styles.fullscreenResetButton, 
              { 
                backgroundColor: '#333333',
                width: scaleWidth(50),
                height: scaleWidth(50),
                borderRadius: scaleWidth(25),
                marginLeft: spacing.m
              }
            ]}
            onPress={resetTimer}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Reset timer"
            accessibilityHint="Resets the timer and saves your session"
          >
            <Ionicons name="refresh" size={scaleWidth(24)} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Stats Cards */}
      <View style={[
        styles.fullscreenStatsContainer,
        {
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginBottom: scaleHeight(40)
        }
      ]}>
        <View 
          style={[
            styles.fullscreenStatCard, 
            { 
              backgroundColor: '#1C1C1E',
              borderColor: '#1C1C1E',
              width: isTablet ? '30%' : '40%',
              paddingVertical: spacing.m,
              borderRadius: scaleWidth(16),
              alignItems: 'center',
              borderWidth: 1
            }
          ]}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`${countdownDistractions} distractions`}
        >
          <Text 
            style={[
              styles.fullscreenStatValue, 
              { 
                color: fullscreenTextColor,
                fontSize: fontSizes.xxxl,
                fontWeight: 'bold'
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            {countdownDistractions}
          </Text>
          <Text 
            style={[
              styles.fullscreenStatLabel, 
              { 
                color: fullscreenSecondaryTextColor,
                fontSize: fontSizes.s,
                marginTop: spacing.xxs
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Distractions
          </Text>
        </View>
        
        <View 
          style={[
            styles.fullscreenStatCard, 
            { 
              backgroundColor: '#1C1C1E',
              borderColor: '#1C1C1E',
              width: isTablet ? '30%' : '40%',
              paddingVertical: spacing.m,
              borderRadius: scaleWidth(16),
              alignItems: 'center',
              borderWidth: 1
            }
          ]}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`${Math.floor(countdownTimeElapsed / 60)} minutes elapsed`}
        >
          <Text 
            style={[
              styles.fullscreenStatValue, 
              { 
                color: fullscreenTextColor,
                fontSize: fontSizes.xxxl,
                fontWeight: 'bold'
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            {Math.floor(countdownTimeElapsed / 60)}
          </Text>
          <Text 
            style={[
              styles.fullscreenStatLabel, 
              { 
                color: fullscreenSecondaryTextColor,
                fontSize: fontSizes.s,
                marginTop: spacing.xxs
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Minutes Elapsed
          </Text>
        </View>
      </View>
      
      {/* Preset Time Buttons - Only show when timer is not running */}
      {!getRunningStateForMode(true) && !isTimerEditMode && (
        <View style={[
          styles.fullscreenPresetContainer,
          {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: spacing.m,
            width: isTablet ? '70%' : '90%',
            alignSelf: 'center'
          }
        ]}>
          {/* 90 minutes button - Now toggles on/off */}
          <TouchableOpacity
            style={[
              styles.fullscreenPresetButton, 
              { 
                backgroundColor: PRESET_DURATIONS[0].value === targetTime 
                  ? '#FF9500' 
                  : '#1C1C1E',
                borderColor: 'transparent',
                width: isTablet ? '40%' : '45%',
                padding: spacing.m,
                margin: spacing.xs,
                borderRadius: scaleWidth(16),
                alignItems: 'center',
                borderWidth: 1
              }
            ]}
            onPress={toggle90MinutesPreset}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={PRESET_DURATIONS[0].value === targetTime 
              ? "Deselect 90 minutes" 
              : "Set timer for 90 minutes"}
            accessibilityState={{ selected: PRESET_DURATIONS[0].value === targetTime }}
            accessibilityHint={PRESET_DURATIONS[0].value === targetTime 
              ? "Resets the timer to 0" 
              : "Sets the timer to 90 minutes"}
          >
            <Text 
              style={[
                styles.fullscreenPresetText, 
                { 
                  color: '#FFFFFF',
                  fontSize: fontSizes.m
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              {PRESET_DURATIONS[0].label}
            </Text>
          </TouchableOpacity>
          
          {/* Information button in fullscreen mode */}
          <TouchableOpacity
            style={[
              styles.fullscreenInfoButton, 
              { 
                backgroundColor: '#1C1C1E',
                borderColor: 'transparent',
                padding: spacing.m,
                margin: spacing.xs,
                borderRadius: scaleWidth(16),
                alignItems: 'center',
                borderWidth: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                width: isTablet ? '40%' : '45%'
              }
            ]}
            onPress={() => {
              // Toggle info view in fullscreen mode
              setShowInfoInFullscreen(true);
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Why 90 minutes?"
            accessibilityHint="Opens information about the science behind 90-minute focus sessions"
          >
            <Ionicons name="information-circle-outline" size={scaleWidth(18)} color="#FFFFFF" />
            <Text 
              style={[
                styles.fullscreenInfoButtonText, 
                { 
                  color: '#FFFFFF',
                  fontSize: fontSizes.m,
                  marginLeft: spacing.xxs
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              Why 90 Min?
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
  // Render the info view that appears within fullscreen mode
  const renderInfoView = () => (
    <View 
      style={[
        styles.infoView,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.97)',
          padding: spacing.m,
          paddingTop: Platform.OS === 'ios' ? safeSpacing.top : scaleHeight(25),
          paddingLeft: safeSpacing.left,
          paddingRight: safeSpacing.right,
          paddingBottom: safeSpacing.bottom,
          zIndex: 100
        }
      ]}
    >
      <View 
        style={[
          styles.infoHeader,
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.m
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.infoBackButton,
            {
              padding: spacing.xs
            }
          ]}
          onPress={() => setShowInfoInFullscreen(false)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close info view"
        >
          <Ionicons name="arrow-back" size={scaleWidth(28)} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text 
          style={[
            styles.infoTitle, 
            { 
              color: '#FFFFFF',
              fontSize: fontSizes.xxl,
              fontWeight: 'bold',
              flex: 1,
              textAlign: 'center'
            }
          ]}
          maxFontSizeMultiplier={1.3}
          accessible={true}
          accessibilityRole="header"
        >
          The Science of 90-Minute Focus
        </Text>
        
        <View style={{ width: scaleWidth(28) }} />
      </View>
      
      <ScrollView 
        style={[
          styles.infoScroll,
          {
            flex: 1
          }
        ]}
        contentContainerStyle={[
          styles.infoScrollContent,
          {
            paddingBottom: spacing.l
          }
        ]}
        showsVerticalScrollIndicator={true}
        accessible={true}
        accessibilityRole="scrollable"
        accessibilityLabel="Focus timer science information"
      >
        <View 
          style={[
            styles.infoItem,
            {
              flexDirection: 'row',
              marginBottom: spacing.m,
              backgroundColor: 'rgba(28, 28, 30, 0.7)',
              borderRadius: scaleWidth(16),
              padding: spacing.m
            }
          ]}
        >
          <Ionicons 
            name="sync-outline" 
            size={scaleWidth(24)} 
            color="#FF9500" 
            style={[
              styles.infoIcon,
              {
                marginRight: spacing.m,
                marginTop: spacing.xxs
              }
            ]}
          />
          <View 
            style={[
              styles.infoContent,
              {
                flex: 1
              }
            ]}
          >
            <Text 
              style={[
                styles.infoHeading, 
                { 
                  color: '#FFFFFF',
                  fontSize: fontSizes.l,
                  fontWeight: 'bold',
                  marginBottom: spacing.xxs
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Ultradian Rhythms
            </Text>
            <Text 
              style={[
                styles.infoText, 
                { 
                  color: '#DDDDDD',
                  fontSize: fontSizes.s,
                  lineHeight: scaleHeight(20)
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              Your brain naturally cycles through periods of high-energy focus and recovery approximately every 90 minutes. This is called your ultradian rhythm - a natural biological cycle that repeats throughout the day.
            </Text>
          </View>
        </View>
        
        <View 
          style={[
            styles.infoItem,
            {
              flexDirection: 'row',
              marginBottom: spacing.m,
              backgroundColor: 'rgba(28, 28, 30, 0.7)',
              borderRadius: scaleWidth(16),
              padding: spacing.m
            }
          ]}
        >
          <Ionicons 
            name="pulse-outline" 
            size={scaleWidth(24)} 
            color="#FF9500" 
            style={[
              styles.infoIcon,
              {
                marginRight: spacing.m,
                marginTop: spacing.xxs
              }
            ]} 
          />
          <View 
            style={[
              styles.infoContent,
              {
                flex: 1
              }
            ]}
          >
            <Text 
              style={[
                styles.infoHeading, 
                { 
                  color: '#FFFFFF',
                  fontSize: fontSizes.l,
                  fontWeight: 'bold',
                  marginBottom: spacing.xxs
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Peak Performance
            </Text>
            <Text 
              style={[
                styles.infoText, 
                { 
                  color: '#DDDDDD',
                  fontSize: fontSizes.s,
                  lineHeight: scaleHeight(20)
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              Research shows that your brain can maintain high-frequency activity for about 90 minutes before it needs a recovery period. Working with these natural cycles helps you achieve peak performance without burnout.
            </Text>
          </View>
        </View>
        
        <View 
          style={[
            styles.infoItem,
            {
              flexDirection: 'row',
              marginBottom: spacing.m,
              backgroundColor: 'rgba(28, 28, 30, 0.7)',
              borderRadius: scaleWidth(16),
              padding: spacing.m
            }
          ]}
        >
          <Ionicons 
            name="battery-charging-outline" 
            size={scaleWidth(24)} 
            color="#FF9500" 
            style={[
              styles.infoIcon,
              {
                marginRight: spacing.m,
                marginTop: spacing.xxs
              }
            ]} 
          />
          <View 
            style={[
              styles.infoContent,
              {
                flex: 1
              }
            ]}
          >
            <Text 
              style={[
                styles.infoHeading, 
                { 
                  color: '#FFFFFF',
                  fontSize: fontSizes.l,
                  fontWeight: 'bold',
                  marginBottom: spacing.xxs
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Brain Energy
            </Text>
            <Text 
              style={[
                styles.infoText, 
                { 
                  color: '#DDDDDD',
                  fontSize: fontSizes.s,
                  lineHeight: scaleHeight(20)
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              During focus periods, your brain depletes sodium-potassium ratios which are needed for neural firing. After about 90 minutes, your brain needs a rest period of about 20 minutes to recover these resources.
            </Text>
          </View>
        </View>
        
        <View 
          style={[
            styles.infoItem,
            {
              flexDirection: 'row',
              marginBottom: spacing.m,
              backgroundColor: 'rgba(28, 28, 30, 0.7)',
              borderRadius: scaleWidth(16),
              padding: spacing.m
            }
          ]}
        >
          <Ionicons 
            name="bar-chart-outline" 
            size={scaleWidth(24)} 
            color="#FF9500" 
            style={[
              styles.infoIcon,
              {
                marginRight: spacing.m,
                marginTop: spacing.xxs
              }
            ]} 
          />
          <View 
            style={[
              styles.infoContent,
              {
                flex: 1
              }
            ]}
          >
            <Text 
              style={[
                styles.infoHeading, 
                { 
                  color: '#FFFFFF',
                  fontSize: fontSizes.l,
                  fontWeight: 'bold',
                  marginBottom: spacing.xxs
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Performance Benefits
            </Text>
            <Text 
              style={[
                styles.infoText, 
                { 
                  color: '#DDDDDD',
                  fontSize: fontSizes.s,
                  lineHeight: scaleHeight(20)
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              Studies show that professionals who work in 90-minute rhythm-based blocks report 50% less mental fatigue and complete complex tasks with greater accuracy compared to those who work for longer uninterrupted periods.
            </Text>
          </View>
        </View>
        
        <View 
          style={[
            styles.infoItem,
            {
              flexDirection: 'row',
              marginBottom: spacing.m,
              backgroundColor: 'rgba(28, 28, 30, 0.7)',
              borderRadius: scaleWidth(16),
              padding: spacing.m
            }
          ]}
        >
          <Ionicons 
            name="finger-print-outline" 
            size={scaleWidth(24)} 
            color="#FF9500" 
            style={[
              styles.infoIcon,
              {
                marginRight: spacing.m,
                marginTop: spacing.xxs
              }
            ]} 
          />
          <View 
            style={[
              styles.infoContent,
              {
                flex: 1
              }
            ]}
          >
            <Text 
              style={[
                styles.infoHeading, 
                { 
                  color: '#FFFFFF',
                  fontSize: fontSizes.l,
                  fontWeight: 'bold',
                  marginBottom: spacing.xxs
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              How to Use This Timer
            </Text>
            <Text 
              style={[
                styles.infoText, 
                { 
                  color: '#DDDDDD',
                  fontSize: fontSizes.s,
                  lineHeight: scaleHeight(20)
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              Set the timer for 90 minutes of focused work. Each time you notice yourself getting distracted, tap the pause button. This logs your distraction and helps you build awareness of your focus patterns. The goal is to gradually reduce distractions during your focus blocks.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
  
  // Modified fullscreen timer view to include the info view
  const renderFullscreenTimer = () => (
    <Modal
      visible={fullscreenMode}
      transparent={true}
      animationType="fade"
      onRequestClose={toggleFullscreen}
    >
      <View 
        style={[
          styles.fullscreenContainer, 
          { 
            backgroundColor: '#000000', // Always use black background in fullscreen mode
            paddingTop: Platform.OS === 'ios' ? safeSpacing.top : scaleHeight(25),
            paddingLeft: safeSpacing.left,
            paddingRight: safeSpacing.right,
            paddingBottom: safeSpacing.bottom,
            paddingHorizontal: spacing.m
          }
        ]}
        accessible={true}
        accessibilityLabel="Focus Timer Fullscreen Mode"
        accessibilityViewIsModal={true}
      >
        {/* Top Bar with Close Button */}
        <View 
          style={[
            styles.fullscreenTopBar,
            {
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.m
            }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.closeButton,
              {
                padding: spacing.xs
              }
            ]}
            onPress={toggleFullscreen}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close fullscreen mode"
          >
            <Ionicons name="close" size={scaleWidth(28)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Tabs in their own row */}
        <View 
          style={[
            styles.fullscreenTabsRow,
            {
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: scaleHeight(30),
              paddingHorizontal: spacing.m
            }
          ]}
        >
          {renderFullscreenTabs()}
        </View>
        
        {/* PagerView for Swipeable Content */}
        <PagerView
          ref={fullscreenPagerRef}
          style={styles.fullscreenPager}
          initialPage={isCountdown ? 1 : 0}
          onPageSelected={handlePageSelected}
          onPageScroll={handlePageScroll}
          accessible={true}
          accessibilityRole="pager"
        >
          {/* Count Up Page */}
          <View key="countup">
            {renderCountUpPage()}
          </View>
          
          {/* Countdown Page */}
          <View key="countdown">
            {renderCountdownPage()}
          </View>
        </PagerView>
        
        {/* Info View - Only shows when showInfoInFullscreen is true */}
        {showInfoInFullscreen && renderInfoView()}
      </View>
    </Modal>
  );

  return (
    <View 
      style={[
        styles.container,
        {
          marginTop: spacing.m,
          paddingHorizontal: safeSpacing.left > spacing.m ? 0 : spacing.m,
          flex: 1
        }
      ]}
      accessible={true}
      accessibilityLabel="Focus Timer"
      pointerEvents={isTransitioning ? "none" : "auto"} // Disable pointer events during transitions
    >
      {renderTimerView()}
      {fullscreenMode && renderFullscreenTimer()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  timerContainer: {},
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  timerTitle: {},
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeToggle: {},
  modeToggleText: {},
  timerBody: {
    alignItems: 'center',
  },
  timerDisplay: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  timeText: {
    fontVariant: ['tabular-nums'],
  },
  targetText: {
    fontVariant: ['tabular-nums'],
  },
  mainButtonContainer: {},
  startButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pauseButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  distractionCounter: {},
  distractionCountText: {},
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  presetButton: {},
  presetButtonText: {},
  infoButton: {},
  infoButtonText: {},
  customTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customTimeInput: {},
  customTimeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  customTimeButtonText: {},
  resetButton: {},
  resetButtonText: {},
  
  // Fullscreen container styles
  fullscreenContainer: {
    flex: 1,
  },
  fullscreenTopBar: {},
  closeButton: {},
  fullscreenTabsRow: {},
  
  // New Fullscreen Tab Styles
  fullscreenTabsContainer: {
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
  },
  tabsBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    opacity: 0.8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {},
  
  // Fullscreen PagerView
  fullscreenPager: {
    flex: 1,
  },
  fullscreenPage: {
    flex: 1,
  },
  
  // Timer Display
  fullscreenTimerDisplay: {
    alignItems: 'center',
  },
  fullscreenTimeText: {},
  fullscreenTargetText: {},
  editTimerHint: {},
  
  // Button Styles
  fullscreenButtonsContainer: {},
  fullscreenStartButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fullscreenPauseWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenPauseButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fullscreenResetButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Stats Section
  fullscreenStatsContainer: {},
  fullscreenStatCard: {},
  fullscreenStatValue: {},
  fullscreenStatLabel: {},
  
  // Preset Time Buttons
  fullscreenPresetContainer: {},
  fullscreenPresetButton: {},
  fullscreenPresetText: {},
  fullscreenInfoButton: {},
  fullscreenInfoButtonText: {},
  
  // Time Picker
  fullscreenTimePicker: {},
  timePickerUnit: {
    alignItems: 'center',
  },
  timePickerInput: {},
  
  // Info view styles
  infoView: {},
  infoHeader: {},
  infoBackButton: {},
  infoTitle: {},
  infoScroll: {},
  infoScrollContent: {},
  infoItem: {},
  infoIcon: {},
  infoContent: {},
  infoHeading: {},
  infoText: {},
  
  // Edit hint styles
  editHintContainer: {},
  editHintText: {},
});

export default FocusTimer;