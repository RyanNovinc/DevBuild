// src/screens/ProfileScreen/StreakCounter.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '../../context/NotificationContext';
import * as Haptics from 'expo-haptics';
import {
  scaleWidth,
  scaleHeight,
  isSmallDevice,
  spacing,
  fontSizes,
  useScreenDimensions,
  useSafeSpacing
} from '../../utils/responsive';

// Dark mode palette
const DARK_THEME = {
  background: '#121212',
  card: '#1E1E1E',
  cardGradient: ['#252525', '#1A1A1A'],
  text: '#FFFFFF',
  textSecondary: '#BBBBBB',
  border: '#2C2C2C'
};

const DEFAULT_COLORS = [
  '#FF5733', // Red-Orange
  '#33A1FD', // Blue
  '#33FD92', // Green
  '#F033FD', // Purple
  '#FDC433', // Yellow
  '#FD3393', // Pink
];

const StreakCounter = ({ navigation }) => {
  const { showSuccess, showError } = useNotification() || { 
    showSuccess: (msg) => console.log(msg),
    showError: (msg) => console.error(msg)
  };

  // Use dark theme
  const theme = DARK_THEME;

  // Animation values
  const [progressAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  // Main streak data state
  const [streakData, setStreakData] = useState({
    streakName: 'My Streak',
    streakIcon: 'flame',
    streakColor: DEFAULT_COLORS[0],
    currentStreak: 0,
    longestStreak: 0,
    lastCheckIn: null,
    checkInDates: {},
    nextMilestone: 7,
    notes: '',
    checklist: [
      { id: '1', text: 'Complete daily activity', completed: false },
      { id: '2', text: 'Track progress', completed: false },
      { id: '3', text: 'Stay consistent', completed: false }
    ]
  });
  
  // Get screen dimensions for responsive layout
  const { width, height } = useScreenDimensions();
  // Get safe area insets
  const safeSpacing = useSafeSpacing();
  // Check if screen is in landscape mode
  const isLandscape = width > height;

  // Calculate completion percentage for the day's checklist
  const getChecklistCompletion = () => {
    if (!streakData.checklist || streakData.checklist.length === 0) return 100;
    
    const completedItems = streakData.checklist.filter(item => item.completed).length;
    return Math.round((completedItems / streakData.checklist.length) * 100);
  };
  
  const checklistCompletion = getChecklistCompletion();

  // Load streak data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const streakJson = await AsyncStorage.getItem('streakData');
        
        if (streakJson) {
          const data = JSON.parse(streakJson);
          
          // Initialize with default checklist if none exists
          if (!data.checklist) {
            data.checklist = [
              { id: '1', text: 'Complete daily activity', completed: false },
              { id: '2', text: 'Track progress', completed: false },
              { id: '3', text: 'Stay consistent', completed: false }
            ];
            await AsyncStorage.setItem('streakData', JSON.stringify(data));
          }
          
          setStreakData(data);
        }
      } catch (error) {
        console.error('Error loading streak data:', error);
        showError('Failed to load streak data');
      }
    };
    
    loadData();
    
    // Start animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
    
    // Setup pulse animation for check-in button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  // Run progress animation when streak data changes
  useEffect(() => {
    const progressPercentage = getProgressPercentage() / 100;
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [streakData.currentStreak, streakData.nextMilestone]);
  
  // Make sure we limit the checklist to a maximum of 10 items
  useEffect(() => {
    if (streakData.checklist && streakData.checklist.length > 10) {
      const updatedData = {
        ...streakData,
        checklist: streakData.checklist.slice(0, 10)
      };
      setStreakData(updatedData);
      saveStreakData(updatedData);
    }
  }, [streakData.checklist]);

  const saveStreakData = async (data) => {
    try {
      await AsyncStorage.setItem('streakData', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving streak data:', error);
      showError('Failed to save streak data');
      return false;
    }
  };

  const updateStreak = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if already checked in today
      if (streakData.lastCheckIn === today) {
        showError('Already checked in today!');
        return;
      }
      
      // Calculate new streak value
      let newStreak = streakData.currentStreak;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];
      
      // If checked in yesterday, increment streak
      if (streakData.lastCheckIn === yesterdayString) {
        newStreak += 1;
      } 
      // If more than one day missed, reset streak to 1
      else if (streakData.lastCheckIn !== today) {
        newStreak = 1;
      }
      
      // Update check-in dates
      const newCheckInDates = { ...streakData.checkInDates };
      newCheckInDates[today] = true;
      
      // Calculate next milestone
      let nextMilestone = 7;
      if (newStreak >= 7 && newStreak < 30) {
        nextMilestone = 30;
      } else if (newStreak >= 30 && newStreak < 90) {
        nextMilestone = 90;
      } else if (newStreak >= 90 && newStreak < 180) {
        nextMilestone = 180;
      } else if (newStreak >= 180 && newStreak < 365) {
        nextMilestone = 365;
      } else if (newStreak >= 365) {
        nextMilestone = Math.ceil(newStreak / 100) * 100; // Round up to next hundred
      }
      
      // Update longest streak if current streak is now longer
      const newLongestStreak = Math.max(newStreak, streakData.longestStreak);
      
      // Create updated data
      const updatedData = {
        ...streakData,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastCheckIn: today,
        checkInDates: newCheckInDates,
        nextMilestone
      };
      
      // Save to state and storage
      setStreakData(updatedData);
      const success = await saveStreakData(updatedData);
      
      if (success) {
        // Provide haptic feedback on success
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        showSuccess(`Streak updated! Current streak: ${newStreak} days`);
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      showError('Failed to update streak');
    }
  };

  // Get last 7 days for mini calendar
  const getLastSevenDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(today.getDate() - i);
      const dateString = day.toISOString().split('T')[0];
      
      days.push({
        date: dateString,
        dayName: day.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        isCheckedIn: streakData.checkInDates ? (streakData.checkInDates[dateString] || false) : false
      });
    }
    
    return days;
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    return Math.min(100, Math.round((streakData.currentStreak / streakData.nextMilestone) * 100));
  };

  const progressPercentage = getProgressPercentage();
  const days = getLastSevenDays();
  const recentDays = days.slice(-3); // Get the most recent 3 days

  // Navigate to full screen view
  const navigateToFullScreen = () => {
    navigation.navigate('StreakDetailScreen', { theme: DARK_THEME });
  };

  // Render checklist dots based on actual items
  const renderChecklistDots = () => {
    // Get the actual number of checklist items (capped at 10)
    const numItems = Math.min(streakData.checklist.length, 10);
    
    // Create an array of dots representing actual checklist items
    return (
      <View style={styles.checklistDotsContainer}>
        {numItems > 0 && (
          <View style={styles.checklistDotsRow}>
            {streakData.checklist.slice(0, numItems).map((item, index) => (
              <View 
                key={index}
                style={[
                  styles.checklistDot,
                  { 
                    backgroundColor: item.completed 
                      ? streakData.streakColor
                      : 'transparent',
                    borderColor: item.completed 
                      ? streakData.streakColor
                      : 'rgba(255,255,255,0.3)',
                  }
                ]}
              />
            ))}
          </View>
        )}
        
        {numItems === 0 && (
          <Text style={[styles.noItemsText, { color: theme.textSecondary }]}>
            No checklist items
          </Text>
        )}
      </View>
    );
  };

  return (
    <Animated.View 
      style={[
        styles.sectionContainer,
        { 
          opacity: fadeAnim,
          paddingHorizontal: safeSpacing.left > 16 ? 0 : spacing.m 
        }
      ]}
    >
      <TouchableOpacity 
        style={[
          styles.streakCard,
          { 
            backgroundColor: theme.card,
            borderColor: theme.border,
            paddingLeft: spacing.l,
            paddingRight: spacing.m,
            paddingVertical: spacing.l,
            marginLeft: safeSpacing.left,
            marginRight: safeSpacing.right,
            marginBottom: isLandscape ? spacing.s : spacing.m,
          }
        ]}
        onPress={navigateToFullScreen}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${streakData.streakName}: ${streakData.currentStreak} day streak. Tap to view details.`}
      >
        {/* Modern Streak Display */}
        <View style={styles.streakContainer}>
          {/* Left: Icon and Count */}
          <View style={styles.streakMainInfo}>
            <View style={[
              styles.streakIconContainer, 
              {
                backgroundColor: `${streakData.streakColor}20`,
              }
            ]}>
              <Ionicons 
                name={streakData.streakIcon} 
                size={isSmallDevice ? 24 : 26} 
                color={streakData.streakColor} 
              />
            </View>
            
            <View style={styles.streakCountInfo}>
              <Text style={[
                styles.streakName, 
                { 
                  color: theme.text,
                  fontSize: isSmallDevice ? fontSizes.s : fontSizes.m,
                }
              ]}>
                {streakData.streakName}
              </Text>
              <View style={styles.streakNumberRow}>
                <Text style={[
                  styles.streakCount, 
                  { 
                    color: theme.text,
                  }
                ]}>
                  {streakData.currentStreak}
                </Text>
                <Text style={[
                  styles.streakUnit, 
                  { 
                    color: theme.textSecondary,
                  }
                ]}>
                  day{streakData.currentStreak !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Right: Checklist dots and check-in */}
          <View style={styles.rightContainer}>
            {/* Render actual checklist dots */}
            {renderChecklistDots()}
            
            {/* Animated check-in button */}
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }]
              }}
            >
              <TouchableOpacity 
                style={[
                  styles.checkInButton,
                  { backgroundColor: `${streakData.streakColor}20` }
                ]}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent onPress
                  updateStreak();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Check in for ${streakData.streakName}`}
              >
                <Ionicons 
                  name="checkmark-circle" 
                  size={isSmallDevice ? 28 : 32} 
                  color={streakData.streakColor} 
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={[
            styles.progressTrack,
            { backgroundColor: 'rgba(255,255,255,0.1)' }
          ]}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  backgroundColor: streakData.streakColor,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]} 
            />
          </View>
          <Text style={[
            styles.milestoneText,
            { color: theme.textSecondary }
          ]}>
            {streakData.currentStreak}/{streakData.nextMilestone} days to milestone
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: scaleHeight(16),
  },
  streakCard: {
    borderRadius: scaleWidth(16),
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
    position: 'relative',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  streakMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  streakIconContainer: {
    width: scaleWidth(48),
    height: scaleWidth(48),
    borderRadius: scaleWidth(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakCountInfo: {
    marginLeft: spacing.m,
  },
  streakName: {
    fontWeight: '500',
    marginBottom: spacing.xxs,
  },
  streakNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakCount: {
    fontWeight: 'bold',
    fontSize: fontSizes.xl,
  },
  streakUnit: {
    fontWeight: 'normal',
    fontSize: fontSizes.s,
    marginLeft: spacing.xxs,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniCalendar: {
    flexDirection: 'row',
    marginRight: spacing.s,
  },
  calendarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  checklistDotsContainer: {
    marginRight: spacing.m,
    minHeight: 16,
    justifyContent: 'center',
  },
  checklistDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
    borderWidth: 1,
  },
  noItemsText: {
    fontSize: fontSizes.xs,
    fontStyle: 'italic',
  },
  checklistIndicator: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: spacing.m,
  },
  checklistText: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
  },
  checkInButton: {
    padding: spacing.xs,
    borderRadius: 20,
  },
  progressContainer: {
    width: '100%',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  milestoneText: {
    fontSize: fontSizes.xs,
    textAlign: 'right',
  },
});

export default StreakCounter;