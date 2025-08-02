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
  // Timer states
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
  const [targetTime, setTargetTime] = useState(90 * 60); // default to 90 minutes
  const [isCountdown, setIsCountdown] = useState(true);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
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
    
    // Start pulse animation for the pause/play button when timer is running
    if (isRunning) {
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
      
      // Start the timer
      startTimerInterval();
    } else {
      pulseAnim.setValue(1);
      
      // Clear the timer interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

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
    
    if (isRunning) {
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
  }, [isRunning, timeElapsed, targetTime, isCountdown, distractionCount]);

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

  // Load timer state from storage
  const loadTimerState = async () => {
    try {
      const timerStateJson = await AsyncStorage.getItem('focusTimerCurrentState');
      if (timerStateJson) {
        const state = JSON.parse(timerStateJson);
        const now = new Date().getTime();
        
        // If last update was less than 5 minutes ago and timer was running, restore state
        if (state.lastUpdated && (now - state.lastUpdated < 5 * 60 * 1000)) {
          setIsCountdown(state.isCountdown);
          setTargetTime(state.targetTime);
          setDistractionCount(state.distractionCount);
          
          if (state.isRunning) {
            // Calculate elapsed time including time passed while app was in background
            const elapsedSinceLastUpdate = Math.floor((now - state.lastUpdated) / 1000);
            setTimeElapsed(state.timeElapsed + elapsedSinceLastUpdate);
            setIsRunning(true);
          } else {
            setTimeElapsed(state.timeElapsed);
            setIsRunning(false);
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
        isRunning,
        timeElapsed,
        targetTime,
        isCountdown,
        distractionCount,
        lastUpdated: new Date().getTime()
      };
      await AsyncStorage.setItem('focusTimerCurrentState', JSON.stringify(timerState));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

  // Start the timer interval
  const startTimerInterval = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => {
        // For countdown mode, check if we've reached the target
        if (isCountdown && prev + 1 >= targetTime) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          
          // Provide feedback when timer completes
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          // Save the completed session
          saveTimerSession(targetTime, distractionCount);
          
          return targetTime;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Save timer session
  const saveTimerSession = async (duration, distractions) => {
    try {
      const newSession = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        duration, // in seconds
        distractions,
        isCompleted: isCountdown ? (timeElapsed >= targetTime) : true
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

  // Get remaining time for countdown mode
  const getRemainingTime = () => {
    if (!isCountdown) return timeElapsed;
    return Math.max(0, targetTime - timeElapsed);
  };

  // Start the timer
  const startTimer = () => {
    setIsRunning(true);
  };

  // Pause the timer - increment distraction counter every time
  const pauseTimer = () => {
    setIsRunning(false);
    setDistractionCount(prev => prev + 1);
    
    // Provide haptic feedback for distraction logging
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Reset the timer
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // If we had accumulated some time, save the session
    if (timeElapsed > 0) {
      saveTimerSession(timeElapsed, distractionCount);
    }
    
    setIsRunning(false);
    setTimeElapsed(0);
    setDistractionCount(0);
    
    // Reset to initial state if in countdown mode
    if (isCountdown) {
      setTargetTime(0);
    }
  };

  // Toggle between count-up and countdown modes
  const toggleTimerMode = () => {
    resetTimer();
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
      resetTimer();
      setIsCountdown(pageIndex === 1);
    }
  };
  
  // Handle tab press in fullscreen mode
  const handleTabPress = (tabIndex) => {
    if (fullscreenPagerRef.current) {
      fullscreenPagerRef.current.setPage(tabIndex);
    }
    
    if ((tabIndex === 1) !== isCountdown) {
      resetTimer();
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
      setTimeElapsed(0);
    } else {
      // Otherwise set to 90 minutes
      setTargetTime(90 * 60);
      setTimeElapsed(0);
    }
  };

  // Toggle timer edit mode
  const toggleTimerEditMode = () => {
    if (isRunning) return; // Don't allow editing while timer is running
    
    if (isTimerEditMode) {
      // Apply the edited time
      saveEditedTime();
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
      setTimeElapsed(0);
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
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 16,
          padding: 12, // Reduced padding
          backgroundColor: '#000000' // Pure black background
        }
      ]}
      onPress={toggleFullscreen}
      activeOpacity={0.9}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Enter fullscreen mode"
      accessibilityHint="Opens the timer in fullscreen for better focus"
      disabled={isTransitioning} // Disable during transitions
    >
      <View style={styles.timerHeader}>
        <Text 
          style={[
            styles.timerTitle, 
            { 
              color: '#FFFFFF', // Always white text for dark theme
              fontSize: 16, // Smaller font size
              fontWeight: 'bold'
            }
          ]}
          maxFontSizeMultiplier={1.5}
          accessible={true}
          accessibilityRole="header"
        >
          Focus Timer
        </Text>
        
        <View style={styles.timerControls}>
          <TouchableOpacity 
            style={[
              styles.modeToggle, 
              { 
                backgroundColor: 'rgba(59, 89, 152, 0.2)', // Blue tint for toggle button
                padding: 4, // Reduced padding
                borderRadius: 12, // Smaller radius
                flexDirection: 'row',
                alignItems: 'center'
              }
            ]}
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering fullscreen
              toggleTimerMode();
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${isCountdown ? 'count up' : 'countdown'} mode`}
            accessibilityHint={`Changes the timer to ${isCountdown ? 'count up from zero' : 'count down from a target time'}`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={isTransitioning} // Disable during transitions
          >
            <Text 
              style={[
                styles.modeToggleText, 
                { 
                  color: '#FFFFFF',
                  fontSize: 10, // Smaller font
                  marginRight: 2
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              {isCountdown ? 'Countdown' : 'Count Up'}
            </Text>
            <Ionicons 
              name={isCountdown ? "timer-outline" : "stopwatch-outline"} 
              size={12} // Smaller icon
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={[
        styles.timerBody,
        {
          paddingVertical: 8, // Reduced padding
          alignItems: 'center'
        }
      ]}>
        <View 
          style={[
            styles.timerDisplay,
            {
              padding: 8, // Reduced padding
              minHeight: 65, // Reduced height
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#000000' // Pure black background, no visual container
            }
          ]}
        >
          <Text 
            style={[
              styles.timeText, 
              { 
                color: '#FFFFFF', // Always white text for better visibility on dark background
                fontSize: 28, // Smaller font
                fontWeight: 'bold',
                fontVariant: ['tabular-nums']
              }
            ]}
            maxFontSizeMultiplier={1.3}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`${isCountdown ? 'Remaining time' : 'Elapsed time'} ${formatTime(getRemainingTime())}`}
          >
            {formatTime(getRemainingTime())}
          </Text>
          
          {isCountdown ? (
            <Text 
              style={[
                styles.targetText, 
                { 
                  color: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white for secondary text
                  fontSize: 14, // Smaller font
                  marginTop: 2,
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
          ) : null}
        </View>
        
        <View style={[
          styles.mainButtonContainer,
          { marginVertical: 6 } // Reduced margin
        ]}>
          {isRunning ? (
            <Animated.View 
              style={[
                styles.pauseButtonWrapper,
                { 
                  transform: [{ scale: pulseAnim }],
                  width: 64, // Smaller size
                  height: 64, // Smaller size
                  borderRadius: 32 // Smaller radius
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.pauseButton, 
                  { 
                    backgroundColor: theme.primary,
                    width: 60, // Smaller size
                    height: 60, // Smaller size
                    borderRadius: 30, // Smaller radius
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 5,
                  }
                ]}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent triggering fullscreen
                  pauseTimer();
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Pause timer and log distraction"
                accessibilityHint="Pauses the timer and adds 1 to your distraction count"
                disabled={isTransitioning} // Disable during transitions
              >
                <Ionicons 
                  name="pause" 
                  size={24} // Smaller icon
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity
              style={[
                styles.startButton, 
                { 
                  backgroundColor: theme.primary,
                  width: 60, // Smaller size
                  height: 60, // Smaller size
                  borderRadius: 30, // Smaller radius
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                }
              ]}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering fullscreen
                startTimer();
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Start timer"
              accessibilityHint="Begins your focus session"
              disabled={isTransitioning} // Disable during transitions
            >
              <Ionicons 
                name="play" 
                size={24} // Smaller icon
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.distractionCounter}>
          <Text 
            style={[
              styles.distractionCountText, 
              { 
                color: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white for secondary text
                fontSize: 12
              }
            ]}
            maxFontSizeMultiplier={1.5}
            accessible={true}
            accessibilityRole="text"
            accessibilityLabel={`Distractions: ${distractionCount}`}
          >
            Distractions: {distractionCount}
          </Text>
        </View>
        
        {isCountdown && !isRunning && (
          <View style={[
            styles.presetButtons,
            { 
              marginTop: 8, // Reduced margin
              width: '90%', // Slightly narrower
              flexDirection: 'row',
              justifyContent: 'center'
            }
          ]}>
            {/* Show only 90 minutes option */}
            <TouchableOpacity
              style={[
                styles.presetButton, 
                { 
                  backgroundColor: PRESET_DURATIONS[0].value === targetTime ? '#3B5998' : '#000000',
                  borderColor: '#333333',
                  paddingVertical: 4, // Reduced padding
                  paddingHorizontal: 8, // Reduced padding
                  borderRadius: 12, // Smaller radius
                  marginHorizontal: 4, // Reduced margin
                  marginBottom: 2, // Reduced margin
                  borderWidth: 1
                }
              ]}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering fullscreen
                toggle90MinutesPreset();
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Set timer for ${PRESET_DURATIONS[0].label}`}
              accessibilityState={{ selected: PRESET_DURATIONS[0].value === targetTime }}
              disabled={isTransitioning} // Disable during transitions
            >
              <Text 
                style={[
                  styles.presetButtonText, 
                  { 
                    color: '#FFFFFF',
                    fontSize: 12 // Smaller font
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                {PRESET_DURATIONS[0].label}
              </Text>
            </TouchableOpacity>
            
            {/* Custom time button - Keep in minimized view */}
            <TouchableOpacity
              style={[
                styles.presetButton, 
                { 
                  backgroundColor: showCustomTimeInput ? '#3B5998' : '#000000',
                  borderColor: '#333333',
                  paddingVertical: 4, // Reduced padding
                  paddingHorizontal: 8, // Reduced padding
                  borderRadius: 12, // Smaller radius
                  marginHorizontal: 4, // Reduced margin
                  marginBottom: 2, // Reduced margin
                  borderWidth: 1
                }
              ]}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering fullscreen
                setShowCustomTimeInput(!showCustomTimeInput);
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Set custom timer duration"
              accessibilityState={{ expanded: showCustomTimeInput }}
              disabled={isTransitioning} // Disable during transitions
            >
              <Text 
                style={[
                  styles.presetButtonText, 
                  { 
                    color: '#FFFFFF',
                    fontSize: 12 // Smaller font
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {showCustomTimeInput && (
          <View style={[
            styles.customTimeContainer,
            { 
              marginTop: 4, // Reduced margin
              width: '90%', // Slightly narrower
              flexDirection: 'row',
              alignItems: 'center'
            }
          ]}>
            <TextInput
              style={[
                styles.customTimeInput, 
                { 
                  borderColor: '#333333',
                  color: '#FFFFFF',
                  backgroundColor: '#000000',
                  height: 36, // Reduced height
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingHorizontal: 8, // Reduced padding
                  marginRight: 8, // Reduced margin
                  flex: 1
                }
              ]}
              value={customTime}
              onChangeText={setCustomTime}
              placeholder="Enter minutes"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={handleCustomTimeSubmit}
              maxFontSizeMultiplier={1.5}
              accessible={true}
              accessibilityLabel="Enter custom time in minutes"
              accessibilityHint="Enter a number for your custom timer duration in minutes"
              onTouchStart={(e) => e.stopPropagation()} // Prevent triggering fullscreen
            />
            <TouchableOpacity
              style={[
                styles.customTimeButton, 
                { 
                  backgroundColor: '#3B5998',
                  height: 36, // Reduced height
                  paddingHorizontal: 12, // Reduced padding
                  borderRadius: 8,
                  justifyContent: 'center'
                }
              ]}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering fullscreen
                handleCustomTimeSubmit();
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Set custom time"
              disabled={isTransitioning} // Disable during transitions
            >
              <Text 
                style={[
                  styles.customTimeButtonText,
                  {
                    color: '#FFFFFF',
                    fontWeight: '500',
                    fontSize: 12 // Smaller font
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Set
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {timeElapsed > 0 && !isRunning && (
          <TouchableOpacity
            style={[
              styles.resetButton, 
              { 
                backgroundColor: 'rgba(59, 89, 152, 0.2)',
                paddingVertical: 4, // Reduced padding
                paddingHorizontal: 12, // Reduced padding
                borderRadius: 12, // Smaller radius
                marginTop: 8, // Reduced margin
                flexDirection: 'row',
                alignItems: 'center'
              }
            ]}
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering fullscreen
              resetTimer();
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Reset timer"
            accessibilityHint="Resets the timer and saves your session"
            disabled={isTransitioning} // Disable during transitions
          >
            <Ionicons name="refresh" size={12} color="#FFFFFF" />
            <Text 
              style={[
                styles.resetButtonText, 
                { 
                  color: '#FFFFFF',
                  marginLeft: 4, // Reduced margin
                  fontSize: 12, // Smaller font
                  fontWeight: '500'
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              Reset Timer
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
          accessibilityLabel={`Elapsed time ${formatTime(timeElapsed)}`}
        >
          {formatTime(timeElapsed)}
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
        {isRunning ? (
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
        
        {timeElapsed > 0 && !isRunning && (
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
          accessibilityLabel={`${distractionCount} distractions`}
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
            {distractionCount}
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
          accessibilityLabel={`${Math.floor(timeElapsed / 60)} minutes elapsed`}
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
            {Math.floor(timeElapsed / 60)}
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
  
  // Render the save button for time picker
  const renderSaveTimeButton = () => (
    <TouchableOpacity
      style={[
        styles.saveTimeButton,
        {
          backgroundColor: '#FF9500',
          paddingVertical: spacing.m,
          paddingHorizontal: spacing.xl,
          borderRadius: scaleWidth(12),
          alignSelf: 'center',
          marginBottom: scaleHeight(20)
        }
      ]}
      onPress={saveEditedTime}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Save time"
      accessibilityHint="Applies the time you entered to the timer"
    >
      <Text
        style={[
          styles.saveTimeButtonText,
          {
            color: '#FFFFFF',
            fontSize: fontSizes.l,
            fontWeight: 'bold'
          }
        ]}
        maxFontSizeMultiplier={1.5}
      >
        Set Timer
      </Text>
    </TouchableOpacity>
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
          <>
            {renderTimePicker()}
            {renderSaveTimeButton()}
          </>
        ) : (
          // Show timer display
          <>
            <TouchableOpacity
              onPress={!isRunning ? toggleTimerEditMode : undefined}
              activeOpacity={isRunning ? 1 : 0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isRunning ? "Timer running" : "Edit timer"}
              accessibilityHint={isRunning ? undefined : "Tap to edit hours, minutes, and seconds"}
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
                {formatTime(getRemainingTime())}
              </Text>
            </TouchableOpacity>
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
        {isRunning ? (
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
        
        {timeElapsed > 0 && !isRunning && (
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
          accessibilityLabel={`${distractionCount} distractions`}
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
            {distractionCount}
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
          accessibilityLabel={`${Math.floor((targetTime - getRemainingTime()) / 60)} minutes elapsed`}
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
            {Math.floor((targetTime - getRemainingTime()) / 60)}
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
      {!isRunning && !isTimerEditMode && (
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
  saveTimeButton: {},
  saveTimeButtonText: {},
  
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
});

export default FocusTimer;