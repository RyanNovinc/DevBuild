// src/screens/ProfileScreen/StreakCounter.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  Animated,
  Easing,
  Modal,
  ScrollView,
  Alert
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

const StreakCounter = ({ 
  navigation, 
  widgetId, 
  saveWidgetData, 
  loadWidgetData, 
  widgetName,
  theme: propTheme
}) => {
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
  

  // Save data modal states
  const [showSaveDataModal, setShowSaveDataModal] = useState(false);
  const [savedInstances, setSavedInstances] = useState([]);
  const [fileToDelete, setFileToDelete] = useState(null); // {id, name}
  const [showStorageLimitMsg, setShowStorageLimitMsg] = useState(false);

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
        // Use widget instance storage if available, fall back to old storage for migration
        let streakJson = null;
        
        if (widgetId && loadWidgetData) {
          const widgetData = await loadWidgetData(widgetId);
          if (widgetData) {
            streakJson = JSON.stringify(widgetData);
          }
        }
        
        // For new widget instances with widgetId, never load old data - start completely fresh
        if (!streakJson && widgetId) {
          console.log('New widget instance starting fresh - no data inheritance');
          return; // Exit early, don't load any old data
        } 
        
        // Only fall back to old storage for very old installations without widgetId
        if (!streakJson && !widgetId) {
          streakJson = await AsyncStorage.getItem('streakData');
        }
        
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
  }, [widgetId, loadWidgetData]);

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
      // Use widget instance storage if available
      if (widgetId && saveWidgetData) {
        await saveWidgetData(widgetId, data);
      } else {
        // Fall back to old storage
        await AsyncStorage.setItem('streakData', JSON.stringify(data));
      }
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

  // Check saved instances limit before saving
  const checkSavedInstancesLimit = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const widgetDataKeys = allKeys.filter(key => key.startsWith('widget_data_streak_'));
      
      if (widgetDataKeys.length >= 3) {
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking saved instances limit:', error);
      return true; // Allow saving if there's an error checking
    }
  };

  // Save current streak data as a separate instance
  const saveCurrentStreakInstance = async (dataToSave = streakData) => {
    try {
      // Check if we can save (3-file limit)
      const canSave = await checkSavedInstancesLimit();
      
      if (!canSave) {
        console.log('Cannot save - 3 file limit reached');
        Alert.alert(
          'Storage Full',
          'You can only save up to 3 streak files. Delete one of your saved streaks to continue.',
          [{ text: 'OK', style: 'default' }]
        );
        return null; // Don't save if limit reached
      }

      // Generate a unique ID for the saved instance
      const timestamp = Date.now();
      const saveId = `widget_data_streak_${timestamp}`;
      
      // Add timestamp to the data
      const finalDataToSave = {
        ...dataToSave,
        lastUpdated: new Date().toISOString(),
        savedAt: timestamp
      };
      
      // Save to AsyncStorage with unique key
      await AsyncStorage.setItem(saveId, JSON.stringify(finalDataToSave));
      console.log('Streak data saved with ID:', saveId);
      showSuccess('Streak data saved successfully');
      
      return saveId;
    } catch (error) {
      console.error('Error saving current streak data:', error);
      showError('Failed to save streak data');
      throw error;
    }
  };

  // Load all saved streak instances for the save data browser (limit to 3)
  const loadSavedInstances = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const widgetDataKeys = allKeys.filter(key => key.startsWith('widget_data_streak_'));
      const instances = [];

      for (const key of widgetDataKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            // Only include streak counter data with valid content
            if (parsedData.streakName && parsedData.streakName.trim() && 
                parsedData.currentStreak !== undefined && parsedData.currentStreak !== null) {
              
              const savedAt = parsedData.savedAt ? new Date(parsedData.savedAt) : new Date();
              const instanceName = parsedData.streakName.trim();
              
              instances.push({
                id: key,
                name: instanceName,
                currentStreak: parsedData.currentStreak || 0,
                longestStreak: parsedData.longestStreak || 0,
                lastUpdated: parsedData.lastCheckIn || 'Never',
                data: parsedData,
                savedAt: parsedData.savedAt || Date.now()
              });
            }
          }
        } catch (error) {
          console.error('Error loading instance:', key, error);
          // Remove corrupted data
          try {
            await AsyncStorage.removeItem(key);
          } catch (removeError) {
            console.error('Error removing corrupted data:', removeError);
          }
        }
      }

      // Sort by most recent first (savedAt timestamp), then limit to 3 most recent instances
      const sortedInstances = instances.sort((a, b) => {
        const aTime = a.savedAt || 0;
        const bTime = b.savedAt || 0;
        return bTime - aTime; // Newest first
      });
      
      setSavedInstances(sortedInstances.slice(0, 3));
    } catch (error) {
      console.error('Error loading saved instances:', error);
    }
  };

  // Delete a saved instance
  const deleteSavedInstance = async (instanceId) => {
    try {
      await AsyncStorage.removeItem(instanceId);
      await loadSavedInstances(); // Refresh the list
      showSuccess('Saved data deleted');
    } catch (error) {
      console.error('Error deleting saved instance:', error);
      showError('Failed to delete saved data');
    }
  };

  // Load a specific saved instance
  const loadSavedInstance = async (instance) => {
    try {
      setStreakData(instance.data);
      await saveStreakData(instance.data);
      setShowSaveDataModal(false);
      showSuccess(`Loaded "${instance.name}" streak data`);
    } catch (error) {
      console.error('Error loading saved instance:', error);
      showError('Failed to load streak data');
    }
  };

  // Start fresh with new streak
  const startFreshStreak = async () => {
    // Check if we already have 3 saved instances
    const canSave = await checkSavedInstancesLimit();
    
    if (!canSave) {
      setShowStorageLimitMsg(true);
      return;
    }

    // Create fresh streak immediately
    const freshData = {
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
    };
    
    setStreakData(freshData);
    await saveStreakData(freshData);
    
    // Auto-save the fresh data so it appears in saved files
    if (canSave) {
      try {
        await saveCurrentStreakInstance(freshData);
        // Small delay to ensure data is saved before refreshing
        setTimeout(async () => {
          await loadSavedInstances();
        }, 100);
      } catch (error) {
        console.error('Error auto-saving fresh streak:', error);
      }
    }
    
    setShowSaveDataModal(false);
    showSuccess('Started fresh streak');
  };

  // Navigate to full screen view
  const navigateToFullScreen = () => {
    navigation.navigate('StreakDetailScreen', { 
      theme: DARK_THEME,
      widgetId,
      saveWidgetData,
      loadWidgetData,
      currentStreakData: streakData,
      onStreakDataUpdate: (newData) => {
        setStreakData(newData);
        saveStreakData(newData);
      },
      saveCurrentStreakInstance
    });
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
            
            {/* File save button */}
            <TouchableOpacity 
              style={[
                styles.fileButton,
                { backgroundColor: `${streakData.streakColor}15` }
              ]}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering the parent onPress
                loadSavedInstances();
                setShowSaveDataModal(true);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Save or load streak data"
            >
              <Ionicons 
                name="folder-outline" 
                size={isSmallDevice ? 22 : 24} 
                color={streakData.streakColor} 
              />
            </TouchableOpacity>

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
      
      {/* Save Data Modal - Clean modal system */}
      {showSaveDataModal && (
        <Modal
          visible={showSaveDataModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => {
            setFileToDelete(null);
            setShowStorageLimitMsg(false);
            setShowSaveDataModal(false);
          }}
        >
          <View style={styles.cleanModalOverlay}>
            <View style={styles.cleanModalContainer}>
              {/* Header */}
              <View style={styles.cleanModalHeader}>
                <View style={styles.cleanModalIconContainer}>
                  <Ionicons 
                    name={
                      fileToDelete ? "trash-outline" : 
                      showStorageLimitMsg ? "archive" : 
                      "folder-outline"
                    } 
                    size={24} 
                    color={
                      fileToDelete ? "#EF4444" : 
                      showStorageLimitMsg ? "#F97316" : 
                      "#8E8E93"
                    } 
                  />
                </View>
                <Text style={styles.cleanModalTitle}>
                  {fileToDelete ? "Delete File?" : 
                   showStorageLimitMsg ? "Storage Limit Reached" : 
                   "Streak Files"}
                </Text>
                <Text style={styles.cleanModalSubtitle}>
                  {fileToDelete 
                    ? `Are you sure you want to delete "${fileToDelete.name}"? This cannot be undone.`
                    : showStorageLimitMsg 
                    ? "You've reached the maximum of 3 saved streak counters. Please delete an existing streak to continue."
                    : "Manage your saved streak data"}
                </Text>
              </View>

              {/* Action buttons for delete/storage confirmation */}
              {fileToDelete ? (
                <>
                  {/* Delete confirmation buttons */}
                  <View style={styles.cleanModalActions}>
                    <TouchableOpacity 
                      style={[styles.cleanActionButton, styles.cancelButton]}
                      onPress={() => setFileToDelete(null)}
                    >
                      <Text style={styles.cleanActionButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.cleanActionButton, styles.deleteButton]}
                      onPress={async () => {
                        await deleteSavedInstance(fileToDelete.id);
                        setFileToDelete(null);
                      }}
                    >
                      <Text style={styles.cleanActionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : showStorageLimitMsg ? (
                // Storage limit message - single button
                <View style={styles.cleanModalActions}>
                  <TouchableOpacity 
                    style={[styles.cleanActionButton, styles.storageOkButton]}
                    onPress={() => setShowStorageLimitMsg(false)}
                  >
                    <Text style={styles.cleanActionButtonText}>Got it</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Normal files view
                <>
                  {/* Files container */}
                  <View style={styles.cleanFilesContainer}>
                    {savedInstances.length > 0 ? (
                      savedInstances.map((instance, index) => (
                        <TouchableOpacity
                          key={instance.id}
                          style={styles.cleanFileItem}
                          onPress={() => loadSavedInstance(instance)}
                        >
                          <View style={styles.cleanFileIconContainer}>
                            <Ionicons name="document-outline" size={20} color="#8E8E93" />
                          </View>
                          <View style={styles.cleanFileInfo}>
                            <Text style={styles.cleanFileName}>{instance.name}</Text>
                            <Text style={styles.cleanFileStats}>
                              Current: {instance.currentStreak} days • Best: {instance.longestStreak} days
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.cleanDeleteButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              setFileToDelete({ id: instance.id, name: instance.name });
                            }}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.cleanEmptyState}>
                        <Ionicons name="folder-open-outline" size={32} color="#48484A" />
                        <Text style={styles.cleanEmptyText}>No saved files</Text>
                      </View>
                    )}
                  </View>

                  {/* Action buttons */}
                  <View style={styles.cleanModalActions}>
                    <TouchableOpacity 
                      style={[styles.cleanActionButton, styles.saveButton]}
                      onPress={startFreshStreak}
                    >
                      <Text style={styles.cleanActionButtonText}>Start Fresh</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Close Button */}
              <TouchableOpacity 
                style={styles.cleanCloseButton}
                onPress={() => {
                  setFileToDelete(null); // Reset delete state
                  setShowStorageLimitMsg(false); // Reset storage limit state
                  setShowSaveDataModal(false);
                }}
              >
                <Text style={styles.cleanCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      
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
  fileButton: {
    padding: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.s,
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
  // Clean modal styles - EXACT copy from DetailModal.js
  cleanModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  cleanModalContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    maxWidth: 400,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  cleanModalHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  cleanModalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cleanModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  cleanModalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  cleanModalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  cleanActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  storageOkButton: {
    backgroundColor: '#F97316',
  },
  cleanActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cleanFilesContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
    maxHeight: 240,
  },
  cleanFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: 8,
  },
  cleanFileIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cleanFileInfo: {
    flex: 1,
  },
  cleanFileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cleanFileStats: {
    fontSize: 12,
    color: '#8E8E93',
  },
  cleanDeleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF453A20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cleanEmptyState: {
    alignItems: 'center',
    padding: 40,
  },
  cleanEmptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  cleanCloseButton: {
    margin: 24,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
    backgroundColor: '#1C1C1E',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  cleanCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
});

export default StreakCounter;