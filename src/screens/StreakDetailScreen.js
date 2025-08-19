// src/screens/StreakDetailScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
  SafeAreaView,
  Animated,
  Easing,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '../context/NotificationContext';
import * as Haptics from 'expo-haptics';
import {
  scaleWidth,
  scaleHeight,
  isSmallDevice,
  isTablet,
  spacing,
  fontSizes,
  useScreenDimensions,
  useSafeSpacing,
  meetsContrastRequirements
} from '../utils/responsive';

// Dark mode palette
const DARK_THEME = {
  background: '#121212',
  card: '#1E1E1E',
  cardAlt: '#252525',
  text: '#FFFFFF',
  textSecondary: '#BBBBBB',
  border: '#2C2C2C',
  inputBg: 'rgba(255,255,255,0.08)',
  overlay: 'rgba(0,0,0,0.7)'
};

const DEFAULT_COLORS = [
  '#FF5733', // Red-Orange
  '#33A1FD', // Blue
  '#33FD92', // Green
  '#F033FD', // Purple
  '#FDC433', // Yellow
  '#FD3393', // Pink
];

const DEFAULT_ICONS = [
  'flame',
  'fitness',
  'book',
  'water',
  'medical',
  'basketball',
  'brush',
  'pencil',
  'heart',
  'star',
  'trophy',
  'ribbon',
];

const StreakDetailScreen = ({ navigation, route }) => {
  const { showSuccess, showError } = useNotification() || { 
    showSuccess: (msg) => console.log(msg),
    showError: (msg) => console.error(msg)
  };

  // Get route params for widget instance data
  const { 
    widgetId, 
    saveWidgetData, 
    loadWidgetData, 
    currentStreakData, 
    onStreakDataUpdate,
    saveCurrentStreakInstance
  } = route?.params || {};

  // Use dark theme
  const theme = DARK_THEME;

  // Animation values
  const [progressAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Modal states - defining these first to avoid reference errors
  const [isEditing, setIsEditing] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showSaveDataModal, setShowSaveDataModal] = useState(false);
  const [savedInstances, setSavedInstances] = useState([]);
  const [fileToDelete, setFileToDelete] = useState(null); // {id, name}
  const [showStorageLimitMsg, setShowStorageLimitMsg] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Header title editing state
  const [isEditingHeaderTitle, setIsEditingHeaderTitle] = useState(false);
  const [headerTitleValue, setHeaderTitleValue] = useState('');
  const [showTitleEditModal, setShowTitleEditModal] = useState(false);
  
  
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
    lastChecklistReset: null,
    checklist: [
      { id: '1', text: 'Complete daily activity', completed: false },
      { id: '2', text: 'Track progress', completed: false },
      { id: '3', text: 'Stay consistent', completed: false }
    ]
  });

  // Edit data state
  const [editData, setEditData] = useState({
    streakName: '',
    streakIcon: '',
    streakColor: '',
    notes: ''
  });
  
  // Get screen dimensions for responsive layout
  const { width, height } = useScreenDimensions();
  // Get safe area insets
  const safeSpacing = useSafeSpacing();
  // Check if screen is in landscape mode
  const isLandscape = width > height;

  // Initialize with data from route params or AsyncStorage
  useEffect(() => {
    if (currentStreakData) {
      // Use data from widget instance
      setStreakData(currentStreakData);
    } else {
      // Fall back to old storage loading
      loadStreakData();
    }
    
    // Run animations on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [currentStreakData]);

  // Run progress animation when streak data loads
  useEffect(() => {
    const progressPercentage = getProgressPercentage() / 100;
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [streakData.currentStreak, streakData.nextMilestone]);

  // Ensure checklist never exceeds 10 items
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

  const resetChecklistIfNeeded = (data) => {
    const today = new Date().toISOString().split('T')[0];
    
    // If checklist has never been reset or was last reset on a different day, reset it
    if (!data.lastChecklistReset || data.lastChecklistReset !== today) {
      // Reset all checklist items to uncompleted
      const resetChecklist = data.checklist.map(item => ({
        ...item,
        completed: false
      }));
      
      const updatedData = {
        ...data,
        checklist: resetChecklist,
        lastChecklistReset: today
      };
      
      return updatedData;
    }
    
    return data;
  };

  const loadStreakData = async () => {
    try {
      const streakJson = await AsyncStorage.getItem('streakData');
      
      if (streakJson) {
        let data = JSON.parse(streakJson);
        
        // Initialize with default checklist if none exists
        if (!data.checklist) {
          data.checklist = [
            { id: '1', text: 'Complete daily activity', completed: false },
            { id: '2', text: 'Track progress', completed: false },
            { id: '3', text: 'Stay consistent', completed: false }
          ];
        }
        
        // Ensure checklist doesn't exceed 10 items
        if (data.checklist.length > 10) {
          data.checklist = data.checklist.slice(0, 10);
        }
        
        // Reset checklist items if it's a new day
        data = resetChecklistIfNeeded(data);
        
        // Save the updated data back to storage if checklist was reset
        if (data.lastChecklistReset === new Date().toISOString().split('T')[0]) {
          await AsyncStorage.setItem('streakData', JSON.stringify(data));
        }
        
        setStreakData(data);
      }
    } catch (error) {
      console.error('Error loading streak data:', error);
      showError('Failed to load streak data');
    }
  };

  const saveStreakData = async (data) => {
    try {
      // Use widget instance storage if available
      if (widgetId && saveWidgetData) {
        await saveWidgetData(widgetId, data);
        // Also update the widget via callback
        if (onStreakDataUpdate) {
          onStreakDataUpdate(data);
        }
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




  // Clean up excess saved files (keep only 3 most recent)
  const cleanupExcessFiles = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const widgetDataKeys = allKeys.filter(key => key.startsWith('widget_data_streak_'));
      
      if (widgetDataKeys.length <= 3) {
        console.log('📂 No cleanup needed, have', widgetDataKeys.length, 'files');
        return;
      }

      console.log('🧹 Cleaning up excess files. Found:', widgetDataKeys.length, 'files');
      
      // Load all files with their timestamps
      const filesWithData = [];
      for (const key of widgetDataKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            filesWithData.push({
              key: key,
              savedAt: parsedData.savedAt || 0,
              name: parsedData.streakName || 'Unnamed'
            });
          }
        } catch (error) {
          console.error('Error reading file for cleanup:', key, error);
        }
      }

      // Sort by most recent first
      const sortedFiles = filesWithData.sort((a, b) => b.savedAt - a.savedAt);
      
      // Keep only the 3 most recent
      const filesToKeep = sortedFiles.slice(0, 3);
      const filesToDelete = sortedFiles.slice(3);
      
      console.log('🧹 Keeping:', filesToKeep.map(f => f.name));
      console.log('🧹 Deleting:', filesToDelete.map(f => f.name));

      // Delete the excess files
      for (const file of filesToDelete) {
        await AsyncStorage.removeItem(file.key);
        console.log('🧹 Deleted:', file.name);
      }

      console.log('🧹 Cleanup complete. Remaining files:', filesToKeep.length);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  // Load all saved streak instances (limit to 3)
  const loadSavedInstances = async () => {
    try {
      // First, clean up any excess files
      await cleanupExcessFiles();
      
      const allKeys = await AsyncStorage.getAllKeys();
      const widgetDataKeys = allKeys.filter(key => key.startsWith('widget_data_streak_'));
      console.log('📂 Found widget data keys:', widgetDataKeys.length, widgetDataKeys);
      const instances = [];

      for (const key of widgetDataKeys) { // Get all keys, we'll limit after sorting
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            if (parsedData.streakName && parsedData.streakName.trim()) {
              instances.push({
                id: key,
                name: parsedData.streakName.trim(),
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
          await AsyncStorage.removeItem(key); // Remove corrupted data
        }
      }

      console.log('📂 Valid instances found:', instances.length, instances.map(i => i.name));

      // Sort by most recent first
      const sortedInstances = instances.sort((a, b) => {
        return (b.savedAt || 0) - (a.savedAt || 0);
      });
      
      // Limit to 3 most recent instances
      const finalInstances = sortedInstances.slice(0, 3);
      console.log('📂 Setting instances:', finalInstances.map(i => i.name));
      setSavedInstances(finalInstances);
    } catch (error) {
      console.error('Error loading saved instances:', error);
    }
  };

  // Load a specific saved instance
  const loadSavedInstance = async (instance) => {
    try {
      setStreakData(instance.data);
      await saveStreakData(instance.data);
      setShowSaveDataModal(false);
      showSuccess(`Loaded "${instance.name}" successfully!`);
    } catch (error) {
      console.error('Error loading saved instance:', error);
      showError('Failed to load streak data');
    }
  };

  // Delete a saved instance
  const deleteSavedInstance = async (instanceId, instanceName) => {
    try {
      console.log('🗑️ Deleting instance:', instanceId, instanceName);
      
      // Check if it exists before deletion
      const beforeData = await AsyncStorage.getItem(instanceId);
      console.log('🗑️ Before deletion - exists:', !!beforeData);
      
      await AsyncStorage.removeItem(instanceId);
      
      // Check if it's actually gone
      const afterData = await AsyncStorage.getItem(instanceId);
      console.log('🗑️ After deletion - exists:', !!afterData);
      
      console.log('🗑️ Instance deleted, refreshing list...');
      await loadSavedInstances(); // Refresh the list
      console.log('🗑️ List refreshed');
      showSuccess(`"${instanceName}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting saved instance:', error);
      showError('Failed to delete saved data');
    }
  };

  // Save current streak data to files
  const saveCurrentDataToFiles = async () => {
    try {
      // Clean up excess files first
      await cleanupExcessFiles();
      
      const allKeys = await AsyncStorage.getAllKeys();
      const savedFiles = allKeys.filter(key => key.startsWith('widget_data_streak_'));
      
      if (savedFiles.length >= 3) {
        Alert.alert(
          '📁 Storage Limit Reached',
          'You\'ve reached the maximum of 3 saved streaks.\n\nTo save new data, please delete an existing streak first.',
          [
            { text: 'Got it', style: 'default' }
          ],
          { 
            cancelable: true,
            userInterfaceStyle: 'light'
          }
        );
        return;
      }

      const timestamp = Date.now();
      const saveId = `widget_data_streak_${timestamp}`;
      const dataToSave = {
        ...streakData,
        savedAt: timestamp,
        lastUpdated: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(saveId, JSON.stringify(dataToSave));
      await loadSavedInstances(); // Refresh the list
      showSuccess('Streak data saved successfully!');
    } catch (error) {
      console.error('Error saving streak data:', error);
      showError('Failed to save streak data');
    }
  };

  // Start fresh streak
  const startFreshStreak = async () => {
    // Clean up excess files first
    await cleanupExcessFiles();
    
    const allKeys = await AsyncStorage.getAllKeys();
    const savedFiles = allKeys.filter(key => key.startsWith('widget_data_streak_'));
    
    if (savedFiles.length >= 3) {
      setShowStorageLimitMsg(true);
      return;
    }

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
    setShowSaveDataModal(false);
    showSuccess('Fresh streak started!');
  };

  // Handle going back with automatic saving
  const handleGoBack = async () => {
    setIsSaving(true);
    try {
      // Update the widget in the dashboard via callback first
      if (onStreakDataUpdate) {
        onStreakDataUpdate(streakData);
      }
      
      // Silently check if we can save (3-file limit) - no popup here
      const canSave = await checkSavedInstancesLimit();
      
      if (canSave) {
        // Save current data as a separate instance using the function from StreakCounter
        if (saveCurrentStreakInstance) {
          await saveCurrentStreakInstance(streakData);
        } else {
          // Fallback: save directly if function not available
          const timestamp = Date.now();
          const saveId = `widget_data_streak_${timestamp}`;
          
          const dataToSave = {
            ...streakData,
            lastUpdated: new Date().toISOString(),
            savedAt: timestamp
          };
          
          await AsyncStorage.setItem(saveId, JSON.stringify(dataToSave));
          console.log('Streak data auto-saved with ID:', saveId);
        }
      } else {
        console.log('Auto-save skipped - storage limit reached');
      }
      
      // Add a minimum delay to ensure the user sees the saving indicator
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Error auto-saving streak data:', error);
    } finally {
      setIsSaving(false);
      navigation.goBack();
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

  const handleEdit = () => {
    setEditData({
      streakName: streakData.streakName,
      streakIcon: streakData.streakIcon,
      streakColor: streakData.streakColor,
      notes: streakData.notes || ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    // Validate inputs
    if (!editData.streakName.trim()) {
      showError('Streak name cannot be empty');
      return;
    }
    
    const updatedData = {
      ...streakData,
      streakName: editData.streakName.trim(),
      streakIcon: editData.streakIcon,
      streakColor: editData.streakColor,
      notes: editData.notes
    };
    
    const success = await saveStreakData(updatedData);
    if (success) {
      setStreakData(updatedData);
      setIsEditing(false);
      showSuccess('Streak details updated successfully');
    }
  };

  const handleResetConfirm = () => {
    setShowResetConfirmation(true);
  };

  const handleResetStreak = async () => {
    try {
      const updatedData = {
        ...streakData,
        currentStreak: 0,
        lastCheckIn: null,
        nextMilestone: 7
      };
      
      const success = await saveStreakData(updatedData);
      if (success) {
        setStreakData(updatedData);
        setShowResetConfirmation(false);
        showSuccess('Streak reset to 0 days');
        
        // Provide haptic feedback
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    } catch (error) {
      console.error('Error resetting streak:', error);
      showError('Failed to reset streak');
    }
  };

  // Handle header title editing
  const handleHeaderTitlePress = () => {
    setHeaderTitleValue(streakData.streakName);
    setShowTitleEditModal(true);
  };

  const handleHeaderTitleSave = async () => {
    const trimmedTitle = headerTitleValue.trim();
    if (trimmedTitle === '') {
      showError('Title cannot be empty');
      return;
    }
    
    const updatedData = {
      ...streakData,
      streakName: trimmedTitle
    };
    
    const success = await saveStreakData(updatedData);
    if (success) {
      setStreakData(updatedData);
      setShowTitleEditModal(false);
      showSuccess('Title updated');
      
      // Update the widget via callback
      if (onStreakDataUpdate) {
        onStreakDataUpdate(updatedData);
      }
      
      // Check if we can save a new instance (3-file limit)
      const canSave = await checkSavedInstancesLimit();
      
      if (canSave) {
        // Immediately save this as a new instance so it appears in saved data
        if (saveCurrentStreakInstance) {
          try {
            await saveCurrentStreakInstance(updatedData);
          } catch (error) {
            console.error('Error auto-saving after title change:', error);
          }
        }
      }
    }
  };

  const handleHeaderTitleCancel = () => {
    setHeaderTitleValue('');
    setShowTitleEditModal(false);
  };

  // Update checklist items
  const toggleChecklistItem = (id) => {
    const updatedChecklist = streakData.checklist.map(item => 
      item.id === id ? {...item, completed: !item.completed} : item
    );
    
    const updatedData = {
      ...streakData,
      checklist: updatedChecklist
    };
    
    saveStreakData(updatedData);
    setStreakData(updatedData);
  };

  // Add new checklist item
  const addChecklistItem = () => {
    if (newItem.trim() === '') return;
    
    // Check if we already have 10 items
    if (streakData.checklist.length >= 10) {
      showError('Maximum of 10 checklist items allowed');
      return;
    }
    
    const newItemObject = {
      id: Date.now().toString(),
      text: newItem.trim(),
      completed: false
    };
    
    const updatedChecklist = [...streakData.checklist, newItemObject];
    const updatedData = {
      ...streakData,
      checklist: updatedChecklist
    };
    
    saveStreakData(updatedData);
    setStreakData(updatedData);
    setNewItem('');
  };

  // Delete checklist item
  const deleteChecklistItem = (id) => {
    const updatedChecklist = streakData.checklist.filter(item => item.id !== id);
    
    const updatedData = {
      ...streakData,
      checklist: updatedChecklist
    };
    
    saveStreakData(updatedData);
    setStreakData(updatedData);
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

  // Get all calendar days for the current month
  const getCurrentMonthDays = () => {
    const days = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // First day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Last day of the month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Get days from previous month to fill first week
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(currentYear, currentMonth, -i);
      const dateString = day.toISOString().split('T')[0];
      days.push({
        date: dateString,
        day: day.getDate(),
        month: day.getMonth(),
        isCurrentMonth: false,
        isCheckedIn: streakData.checkInDates ? (streakData.checkInDates[dateString] || false) : false
      });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(currentYear, currentMonth, i);
      const dateString = day.toISOString().split('T')[0];
      days.push({
        date: dateString,
        day: i,
        month: currentMonth,
        isCurrentMonth: true,
        isToday: i === today.getDate(),
        isCheckedIn: streakData.checkInDates ? (streakData.checkInDates[dateString] || false) : false
      });
    }
    
    // Calculate how many days we need from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks × 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(currentYear, currentMonth + 1, i);
      const dateString = day.toISOString().split('T')[0];
      days.push({
        date: dateString,
        day: i,
        month: day.getMonth(),
        isCurrentMonth: false,
        isCheckedIn: streakData.checkInDates ? (streakData.checkInDates[dateString] || false) : false
      });
    }
    
    return days;
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    return Math.min(100, Math.round((streakData.currentStreak / streakData.nextMilestone) * 100));
  };

  // Days remaining until next milestone
  const getDaysRemaining = () => {
    return streakData.nextMilestone - streakData.currentStreak;
  };

  // Calculate streak statistics
  const getStreakStats = () => {
    const checkIns = Object.keys(streakData.checkInDates || {}).length;
    const startDate = checkIns > 0 
      ? new Date(Object.keys(streakData.checkInDates).sort()[0]) 
      : new Date();
    
    const daysSinceStart = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
    const consistency = daysSinceStart > 0 
      ? Math.round((checkIns / daysSinceStart) * 100) 
      : 0;
    
    return {
      totalCheckIns: checkIns,
      daysSinceStart,
      consistency
    };
  };

  // Calculate checklist completion percentage
  const getChecklistCompletion = () => {
    if (!streakData.checklist || streakData.checklist.length === 0) return 100;
    
    const completedItems = streakData.checklist.filter(item => item.completed).length;
    return Math.round((completedItems / streakData.checklist.length) * 100);
  };

  const lastSevenDays = getLastSevenDays();
  const monthDays = getCurrentMonthDays();
  const progressPercentage = getProgressPercentage();
  const daysRemaining = getDaysRemaining();
  const stats = getStreakStats();
  const checklistCompletion = getChecklistCompletion();

  // Set status bar style for dark mode
  const statusBarStyle = 'light-content';

  // Info modal explaining the tracker
  const renderInfoModal = () => (
    <Modal
      visible={showInfoModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowInfoModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Custom Tracker Info</Text>
            <TouchableOpacity onPress={() => setShowInfoModal(false)}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoContent}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="information-circle" size={40} color={streakData.streakColor} />
            </View>
            
            <Text style={[styles.infoText, { color: theme.text }]}>
              This is a custom habit tracker that works independently from your daily tracker in the profile screen.
            </Text>
            
            <Text style={[styles.infoText, { color: theme.text, marginTop: spacing.m }]}>
              • Streaks tracked here don't contribute to your profile achievements
            </Text>
            
            <Text style={[styles.infoText, { color: theme.text }]}>
              • Check in daily to maintain your streak
            </Text>
            
            <Text style={[styles.infoText, { color: theme.text }]}>
              • Missing a day will reset your current streak
            </Text>
            
            <Text style={[styles.infoText, { color: theme.text }]}>
              • Customize your tracker with different colours and icons
            </Text>
            
            <Text style={[styles.infoText, { color: theme.text }]}>
              • You can add up to 10 checklist items
            </Text>
            
            <Text style={[styles.infoText, { color: theme.text }]}>
              • Your checklist resets automatically each day
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.infoButton, { backgroundColor: streakData.streakColor }]}
            onPress={() => setShowInfoModal(false)}
          >
            <Text style={styles.infoButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Checklist modal
  const renderChecklistModal = () => (
    <Modal
      visible={showChecklistModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowChecklistModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.modalContent, styles.checklistModalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Daily Checklist</Text>
            <TouchableOpacity onPress={() => setShowChecklistModal(false)}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.checklistInfo}>
            <Text style={[styles.checklistInfoText, { color: theme.textSecondary }]}>
              {checklistCompletion}% complete • {streakData.checklist.length}/10 items
            </Text>
          </View>
          
          <ScrollView style={styles.checklistScrollView}>
            {streakData.checklist.map(item => (
              <View key={item.id} style={styles.checklistItem}>
                <TouchableOpacity 
                  style={styles.checklistCheckbox}
                  onPress={() => toggleChecklistItem(item.id)}
                >
                  <Ionicons 
                    name={item.completed ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={item.completed ? streakData.streakColor : theme.textSecondary} 
                  />
                </TouchableOpacity>
                
                <Text 
                  style={[
                    styles.checklistText, 
                    { 
                      color: theme.text,
                      textDecorationLine: item.completed ? 'line-through' : 'none',
                      opacity: item.completed ? 0.7 : 1
                    }
                  ]}
                >
                  {item.text}
                </Text>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteChecklistItem(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.addItemContainer}>
            <TextInput
              style={[styles.addItemInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
              value={newItem}
              onChangeText={setNewItem}
              placeholder="Add new task..."
              placeholderTextColor={theme.textSecondary}
            />
            <TouchableOpacity 
              style={[
                styles.addButton, 
                { 
                  backgroundColor: streakData.checklist.length >= 10 ? theme.border : streakData.streakColor,
                  opacity: streakData.checklist.length >= 10 ? 0.5 : 1
                }
              ]}
              onPress={addChecklistItem}
              disabled={streakData.checklist.length >= 10}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.infoButton, { backgroundColor: streakData.streakColor, marginTop: spacing.m }]}
            onPress={() => setShowChecklistModal(false)}
          >
            <Text style={styles.infoButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Edit modal for customizing streak
  const renderEditModal = () => (
    <Modal
      visible={isEditing}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditing(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Edit Streak
          </Text>
          
          {/* Streak Name Input */}
          <Text style={[styles.inputLabel, { color: theme.text }]}>Streak Name</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
            value={editData.streakName}
            onChangeText={(text) => setEditData({...editData, streakName: text})}
            placeholder="Enter streak name"
            placeholderTextColor={theme.textSecondary}
            maxLength={30}
          />
          
          {/* Color Selection */}
          <Text style={[styles.inputLabel, { color: theme.text }]}>Color</Text>
          <View style={styles.colorSelector}>
            {DEFAULT_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  editData.streakColor === color && styles.selectedColorOption
                ]}
                onPress={() => setEditData({...editData, streakColor: color})}
              >
                {editData.streakColor === color && (
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" style={styles.colorCheck} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Icon Selection */}
          <Text style={[styles.inputLabel, { color: theme.text }]}>Icon</Text>
          <View style={styles.iconSelector}>
            {DEFAULT_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconOption,
                  { backgroundColor: theme.cardAlt },
                  editData.streakIcon === icon && {
                    backgroundColor: `${editData.streakColor}20`,
                    borderColor: editData.streakColor
                  }
                ]}
                onPress={() => setEditData({...editData, streakIcon: icon})}
              >
                <Ionicons 
                  name={icon} 
                  size={24} 
                  color={editData.streakIcon === icon ? editData.streakColor : theme.textSecondary} 
                />
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Notes Input */}
          <Text style={[styles.inputLabel, { color: theme.text }]}>Notes (Optional)</Text>
          <TextInput
            style={[
              styles.textInput,
              styles.notesInput,
              { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }
            ]}
            value={editData.notes}
            onChangeText={(text) => setEditData({...editData, notes: text})}
            placeholder="Enter notes about this streak"
            placeholderTextColor={theme.textSecondary}
            multiline={true}
            textAlignVertical="top"
          />
          
          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={[styles.modalButtonText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { backgroundColor: editData.streakColor }]}
              onPress={handleSaveEdit}
            >
              <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Clean, professional save data modal
  const renderSaveDataModal = () => (
    <Modal
      visible={showSaveDataModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowSaveDataModal(false)}
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
                ? "You've reached the maximum of 3 saved streaks. Please delete an existing streak to continue."
                : "Manage your saved streaks (3 max)"
              }
            </Text>
          </View>
          
          {/* Action Buttons - Different content based on state */}
          <View style={styles.cleanActionButtonsContainer}>
            {fileToDelete ? (
              // Delete confirmation buttons
              <>
                <TouchableOpacity 
                  style={[styles.cleanActionButton, styles.cancelButton]}
                  onPress={() => setFileToDelete(null)}
                >
                  <Text style={styles.cleanActionButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.cleanActionButton, styles.deleteButton]}
                  onPress={async () => {
                    await deleteSavedInstance(fileToDelete.id, fileToDelete.name);
                    setFileToDelete(null);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.cleanActionButtonText}>Delete</Text>
                </TouchableOpacity>
              </>
            ) : showStorageLimitMsg ? (
              // Storage limit message - single button
              <TouchableOpacity 
                style={[styles.cleanActionButton, styles.storageOkButton]}
                onPress={() => setShowStorageLimitMsg(false)}
              >
                <Text style={styles.cleanActionButtonText}>Got it</Text>
              </TouchableOpacity>
            ) : (
              // Normal action buttons
              <>
                <TouchableOpacity 
                  style={[styles.cleanActionButton, styles.saveButton]}
                  onPress={saveCurrentDataToFiles}
                >
                  <Ionicons name="bookmark-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.cleanActionButtonText}>Save Current</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.cleanActionButton, styles.freshButton]}
                  onPress={startFreshStreak}
                >
                  <Ionicons name="add-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.cleanActionButtonText}>Start Fresh</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          
          {/* Files List - Only show when in normal mode */}
          {!fileToDelete && !showStorageLimitMsg && (
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
                      {instance.currentStreak} days • Best: {instance.longestStreak}
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
  );

  // Title Edit Modal
  const renderTitleEditModal = () => (
    <Modal
      visible={showTitleEditModal}
      animationType="fade"
      transparent={true}
      onRequestClose={handleHeaderTitleCancel}
    >
      <KeyboardAvoidingView 
        style={styles.cleanModalOverlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.titleEditModalContainer}>
          {/* Header */}
          <View style={styles.titleEditModalHeader}>
            <View style={styles.cleanModalIconContainer}>
              <Ionicons name="create-outline" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.cleanModalTitle}>Edit Streak Name</Text>
            <Text style={styles.cleanModalSubtitle}>
              Choose a memorable name for your streak
            </Text>
          </View>

          {/* Text Input */}
          <View style={styles.titleEditInputContainer}>
            <TextInput
              style={styles.titleEditInput}
              value={headerTitleValue}
              onChangeText={setHeaderTitleValue}
              autoFocus
              maxLength={40}
              placeholder="Enter streak name"
              placeholderTextColor="#8E8E93"
              multiline={false}
              returnKeyType="done"
              onSubmitEditing={handleHeaderTitleSave}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.titleEditActions}>
            <TouchableOpacity 
              style={[styles.cleanActionButton, styles.cancelButton]}
              onPress={handleHeaderTitleCancel}
            >
              <Text style={styles.cleanActionButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cleanActionButton, styles.titleSaveButton]}
              onPress={handleHeaderTitleSave}
            >
              <Text style={styles.cleanActionButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );


  // Reset confirmation modal
  const renderResetConfirmationModal = () => (
    <Modal
      visible={showResetConfirmation}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowResetConfirmation(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.resetConfirmationContent}>
            <Ionicons name="alert-circle" size={50} color="#FF3B30" />
            
            <Text style={[styles.resetConfirmTitle, { color: theme.text }]}>
              Reset Streak?
            </Text>
            
            <Text style={[styles.resetConfirmText, { color: theme.textSecondary }]}>
              This will reset your current streak to 0 days. This action cannot be undone.
            </Text>
            
            <View style={styles.resetConfirmButtons}>
              <TouchableOpacity
                style={[styles.resetConfirmButton, styles.cancelResetButton, { borderColor: theme.border }]}
                onPress={() => setShowResetConfirmation(false)}
              >
                <Text style={[styles.resetConfirmButtonText, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.resetConfirmButton, styles.confirmResetButton, { backgroundColor: '#FF3B30' }]}
                onPress={handleResetStreak}
              >
                <Text style={[styles.resetConfirmButtonText, { color: '#FFFFFF' }]}>
                  Reset
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
      
      {/* Header */}
      <View style={[
        styles.header,
        { 
          borderBottomColor: theme.border,
          paddingLeft: safeSpacing.left > 16 ? safeSpacing.left : spacing.m,
          paddingRight: safeSpacing.right > 16 ? safeSpacing.right : spacing.m
        }
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          disabled={isSaving}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back and save"
        >
          {isSaving ? (
            <Ionicons name="ellipsis-horizontal" size={28} color={theme.textSecondary} />
          ) : (
            <Ionicons name="chevron-back" size={28} color={theme.text} />
          )}
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <TouchableOpacity onPress={handleHeaderTitlePress} style={styles.headerTitleTouchable}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {streakData.streakName}
            </Text>
          </TouchableOpacity>
          {isSaving && (
            <View style={styles.savingIndicator}>
              <Ionicons name="cloud-upload-outline" size={16} color={streakData.streakColor} />
              <Text style={[styles.savingText, { color: streakData.streakColor }]}>Saving...</Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.saveDataButton}
            onPress={() => {
              loadSavedInstances();
              setShowSaveDataModal(true);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Load saved streak data"
          >
            <Ionicons name="folder-outline" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.infoIconButton}
            onPress={() => setShowInfoModal(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="View information about this tracker"
          >
            <Ionicons name="information-circle-outline" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Edit streak"
          >
            <Ionicons name="pencil" size={22} color={streakData.streakColor} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingLeft: safeSpacing.left > 16 ? safeSpacing.left : spacing.m,
            paddingRight: safeSpacing.right > 16 ? safeSpacing.right : spacing.m,
            paddingBottom: spacing.xl
          }
        ]}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Hero Section with Streak Count */}
          <View style={styles.heroSection}>
            <View style={[
              styles.streakIconContainer, 
              {
                backgroundColor: `${streakData.streakColor}20`,
              }
            ]}>
              <Ionicons 
                name={streakData.streakIcon} 
                size={40} 
                color={streakData.streakColor} 
              />
            </View>
            
            <View style={styles.streakCountWrapper}>
              <Text style={[styles.currentStreakLabel, { color: theme.textSecondary }]}>
                CURRENT STREAK
              </Text>
              <Text style={[styles.streakCountLarge, { color: theme.text }]}>
                {streakData.currentStreak}
                <Text style={[styles.streakUnitLarge, { color: theme.textSecondary }]}>
                  {' '}day{streakData.currentStreak !== 1 ? 's' : ''}
                </Text>
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.checkInButton, { backgroundColor: streakData.streakColor }]}
              onPress={updateStreak}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Check in for today's ${streakData.streakName}`}
            >
              <Ionicons name="checkmark" size={22} color="#FFFFFF" />
              <Text style={styles.checkInButtonText}>Check In</Text>
            </TouchableOpacity>
          </View>
          
          {/* Progress Section */}
          <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={[styles.progressTitle, { color: theme.text }]}>
                  Next Milestone: {streakData.nextMilestone} Days
                </Text>
                <Text style={[styles.progressSubtitle, { color: theme.textSecondary }]}>
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                </Text>
              </View>
              <Text style={[styles.progressPercentage, { color: theme.text }]}>
                {progressPercentage}%
              </Text>
            </View>
            
            <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
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
          </View>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {streakData.longestStreak}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Longest Streak
              </Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {stats.totalCheckIns}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Total Check-ins
              </Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={styles.consistencyContainer}>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {stats.consistency}%
                </Text>
                {stats.consistency >= 80 && (
                  <Ionicons name="star" size={16} color={streakData.streakColor} style={styles.consistencyIcon} />
                )}
              </View>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Consistency
              </Text>
            </View>
          </View>
          
          {/* Checklist Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Daily Checklist
              </Text>
              <TouchableOpacity
                onPress={() => setShowChecklistModal(true)}
                style={styles.viewAllButton}
              >
                <Text style={[styles.viewAllText, { color: streakData.streakColor }]}>
                  View All
                </Text>
                <Ionicons name="chevron-forward" size={16} color={streakData.streakColor} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.checklistPreviewCard, { backgroundColor: theme.card }]}>
              {streakData.checklist.length === 0 ? (
                <View style={styles.emptyChecklist}>
                  <Ionicons name="list" size={24} color={theme.textSecondary} />
                  <Text style={[styles.emptyChecklistText, { color: theme.textSecondary }]}>
                    No items in your checklist
                  </Text>
                  <TouchableOpacity
                    style={[styles.addChecklistButton, { backgroundColor: streakData.streakColor }]}
                    onPress={() => setShowChecklistModal(true)}
                  >
                    <Text style={styles.addChecklistButtonText}>Add Items</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {streakData.checklist.slice(0, 3).map(item => (
                    <View key={item.id} style={styles.checklistPreviewItem}>
                      <TouchableOpacity 
                        style={styles.checklistCheckbox}
                        onPress={() => toggleChecklistItem(item.id)}
                      >
                        <Ionicons 
                          name={item.completed ? "checkbox" : "square-outline"} 
                          size={22} 
                          color={item.completed ? streakData.streakColor : theme.textSecondary} 
                        />
                      </TouchableOpacity>
                      
                      <Text 
                        style={[
                          styles.checklistPreviewText, 
                          { 
                            color: theme.text,
                            textDecorationLine: item.completed ? 'line-through' : 'none',
                            opacity: item.completed ? 0.7 : 1
                          }
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.text}
                      </Text>
                    </View>
                  ))}
                  
                  {streakData.checklist.length > 3 && (
                    <Text style={[styles.moreItemsText, { color: theme.textSecondary }]}>
                      +{streakData.checklist.length - 3} more items
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
          
          {/* Weekly Activity */}
          <View style={[styles.sectionContainer, styles.activitySection]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              This Week
            </Text>
            
            <View style={[styles.weeklyActivityCard, { backgroundColor: theme.card }]}>
              <View style={styles.weeklyActivity}>
                {lastSevenDays.map((day, index) => (
                  <View 
                    key={day.date} 
                    style={styles.weeklyDay}
                    accessible={true}
                    accessibilityRole="text"
                    accessibilityLabel={`${day.dayName}, ${day.isCheckedIn ? 'completed' : 'not completed'}`}
                  >
                    <Text style={[styles.weekDayLabel, { color: theme.textSecondary }]}>
                      {day.dayName}
                    </Text>
                    <View 
                      style={[
                        styles.dayIndicator, 
                        { 
                          backgroundColor: day.isCheckedIn 
                            ? streakData.streakColor 
                            : 'rgba(255,255,255,0.1)',
                        }
                      ]} 
                    >
                      {day.isCheckedIn && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          {/* Monthly Calendar */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Calendar
            </Text>
            
            <View style={[styles.calendarCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.monthTitle, { color: theme.text }]}>
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              
              {/* Day headers */}
              <View style={styles.weekDayRow}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <Text
                    key={`weekday-${index}`}
                    style={[styles.weekDayText, { color: theme.textSecondary }]}
                  >
                    {day}
                  </Text>
                ))}
              </View>
              
              {/* Calendar grid */}
              <View style={styles.calendarGrid}>
                {monthDays.map((day, index) => (
                  <View
                    key={day.date}
                    style={styles.calendarGridDay}
                  >
                    <View
                      style={[
                        styles.calendarDayCircle,
                        day.isToday && { 
                          backgroundColor: `${streakData.streakColor}20`,
                        },
                        day.isCheckedIn && {
                          backgroundColor: streakData.streakColor,
                        }
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          { 
                            color: day.isCurrentMonth 
                              ? (day.isCheckedIn ? '#FFFFFF' : theme.text)
                              : (day.isCheckedIn ? '#FFFFFF' : theme.textSecondary + '80'),
                            opacity: day.isCurrentMonth ? 1 : 0.6
                          }
                        ]}
                      >
                        {day.day}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
          
          {/* Notes Section */}
          {streakData.notes && (
            <View style={styles.sectionContainer}>
              <Text style={[
                styles.sectionTitle,
                { color: theme.text }
              ]}>
                Notes
              </Text>
              
              <View style={[
                styles.notesCard,
                { backgroundColor: theme.card }
              ]}>
                <Text style={[
                  styles.notesText,
                  { color: theme.text }
                ]}>
                  {streakData.notes}
                </Text>
              </View>
            </View>
          )}
          
          {/* Reset Button */}
          <TouchableOpacity
            style={[
              styles.resetButton,
              { borderColor: '#FF3B30' }
            ]}
            onPress={handleResetConfirm}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Reset ${streakData.streakName} streak to zero`}
          >
            <Ionicons name="refresh" size={20} color="#FF3B30" />
            <Text style={styles.resetButtonText}>
              Reset Streak
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      
      {/* Render Modals */}
      {renderEditModal()}
      {renderInfoModal()}
      {renderChecklistModal()}
      {renderResetConfirmationModal()}
      {renderSaveDataModal()}
      {renderTitleEditModal()}
      
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: scaleHeight(60),
    paddingVertical: spacing.s,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.m,
  },
  headerTitle: {
    fontSize: fontSizes.l,
    fontWeight: '600',
    textAlign: 'center',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxs,
  },
  savingText: {
    fontSize: fontSizes.s,
    fontWeight: '600',
    marginLeft: spacing.xxs,
  },
  backButton: {
    padding: spacing.xs,
    marginTop: -4, // Move the back button up a bit to fix cut-off
  },
  editButton: {
    padding: spacing.xs,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  headerButtons: {
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  infoIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  saveDataButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)'
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.m,
  },
  // Hero section
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  streakIconContainer: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  streakCountWrapper: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  currentStreakLabel: {
    fontSize: fontSizes.xs,
    letterSpacing: 1,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  streakCountLarge: {
    fontSize: fontSizes.xxxl * 1.2,
    fontWeight: 'bold',
  },
  streakUnitLarge: {
    fontSize: fontSizes.l,
    fontWeight: 'normal',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.xl,
    borderRadius: scaleWidth(30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: fontSizes.m,
    marginLeft: spacing.xs,
  },
  // Progress card
  progressCard: {
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    marginBottom: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  progressTitle: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  progressSubtitle: {
    fontSize: fontSizes.s,
    marginTop: spacing.xxs,
  },
  progressPercentage: {
    fontSize: fontSizes.l,
    fontWeight: '700',
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  // Stats cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: scaleWidth(16),
    padding: spacing.m,
    marginHorizontal: spacing.xxs,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    paddingVertical: spacing.l,
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
  consistencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  consistencyIcon: {
    marginLeft: spacing.xxs,
  },
  // Section styling
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  sectionTitle: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
    marginRight: spacing.xxs,
  },
  // Checklist styles
  checklistPreviewCard: {
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checklistPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  checklistCheckbox: {
    marginRight: spacing.s,
  },
  checklistPreviewText: {
    fontSize: fontSizes.s,
    flex: 1,
  },
  emptyChecklist: {
    alignItems: 'center',
    padding: spacing.m,
  },
  emptyChecklistText: {
    marginVertical: spacing.s,
    fontSize: fontSizes.s,
  },
  addChecklistButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.m,
    borderRadius: 16,
    marginTop: spacing.s,
  },
  addChecklistButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: fontSizes.s,
  },
  moreItemsText: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
    marginTop: spacing.s,
  },
  // Checklist modal
  checklistModalContent: {
    maxHeight: '80%',
  },
  checklistInfo: {
    alignItems: 'center',
    marginBottom: spacing.m,
    paddingBottom: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  checklistInfoText: {
    fontSize: fontSizes.s,
  },
  checklistScrollView: {
    marginVertical: spacing.m,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  checklistText: {
    flex: 1,
    fontSize: fontSizes.m,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.s,
  },
  addItemInput: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    paddingHorizontal: spacing.m,
    marginRight: spacing.s,
    borderWidth: 1,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Info modal
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  infoContent: {
    alignItems: 'center',
  },
  infoIconContainer: {
    marginBottom: spacing.m,
  },
  infoText: {
    fontSize: fontSizes.s,
    lineHeight: 24,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
  infoButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  infoButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: fontSizes.m,
  },
  // Weekly activity
  activitySection: {
    marginBottom: spacing.l,
  },
  weeklyActivityCard: {
    borderRadius: scaleWidth(16),
    padding: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  weeklyActivity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weeklyDay: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: spacing.s,
  },
  weekDayLabel: {
    marginBottom: spacing.s,
    fontWeight: '500',
  },
  dayIndicator: {
    width: scaleWidth(36),
    height: scaleWidth(36),
    borderRadius: scaleWidth(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Calendar
  calendarCard: {
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  monthTitle: {
    fontSize: fontSizes.l,
    fontWeight: '600',
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  weekDayRow: {
    flexDirection: 'row',
    marginBottom: spacing.s,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: fontSizes.s,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarGridDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calendarDayCircle: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: scaleWidth(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayText: {
    fontSize: fontSizes.s,
  },
  // Notes card
  notesCard: {
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notesText: {
    fontSize: fontSizes.s,
    lineHeight: scaleHeight(24),
  },
  // Reset button
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: scaleWidth(25),
    paddingVertical: spacing.m,
    marginTop: spacing.m,
    marginBottom: spacing.l,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
  },
  resetButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  // Reset confirmation modal
  resetConfirmationContent: {
    alignItems: 'center',
    paddingVertical: spacing.m,
  },
  resetConfirmTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  resetConfirmText: {
    fontSize: fontSizes.m,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.s,
  },
  resetConfirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  resetConfirmButton: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
  },
  cancelResetButton: {
    borderWidth: 1,
  },
  confirmResetButton: {
    // Style applied dynamically with backgroundColor
  },
  resetConfirmButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  // Edit modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.m,
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    borderRadius: scaleWidth(20),
    padding: spacing.xl,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
    marginBottom: spacing.l,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: fontSizes.s,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  textInput: {
    height: scaleHeight(48),
    borderRadius: scaleWidth(8),
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
  },
  notesInput: {
    height: scaleHeight(100),
    paddingTop: spacing.m,
    paddingBottom: spacing.m,
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.m,
  },
  colorOption: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(20),
    margin: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  colorCheck: {
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.m,
  },
  iconOption: {
    width: scaleWidth(48),
    height: scaleWidth(48),
    borderRadius: scaleWidth(10),
    margin: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.l,
  },
  modalButton: {
    flex: 1,
    height: scaleHeight(50),
    borderRadius: scaleWidth(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  saveButton: {
    // Style applied dynamically
  },
  modalButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  // Header title editing styles
  headerTitleEditContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    minWidth: 120,
    maxWidth: 160,
    backgroundColor: 'rgba(255,255,255,0.05)',
    fontSize: fontSizes.l,
    fontWeight: '600',
    marginRight: spacing.s,
  },
  headerTitleButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  headerCancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  headerSaveButton: {
    // backgroundColor set dynamically
  },
  headerTitleTouchable: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    borderRadius: 6,
  },
  // Clean, professional modal styles
  cleanModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  cleanModalContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 25,
  },
  cleanModalHeader: {
    alignItems: 'center',
    paddingTop: spacing.xl * 1.5,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.l,
  },
  cleanModalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  cleanModalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  cleanModalSubtitle: {
    fontSize: fontSizes.s,
    color: '#8E8E93',
    textAlign: 'center',
  },
  cleanActionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.l,
    gap: spacing.m,
  },
  cleanActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderRadius: 12,
    gap: spacing.xs,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  freshButton: {
    backgroundColor: '#10B981',
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
  titleSaveButton: {
    backgroundColor: '#3B82F6',
  },
  cleanActionButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.s,
    fontWeight: '600',
  },
  cleanFilesContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    maxHeight: 240,
  },
  cleanFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: spacing.s,
  },
  cleanFileIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  cleanFileInfo: {
    flex: 1,
  },
  cleanFileName: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cleanFileStats: {
    fontSize: fontSizes.xs,
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
    padding: spacing.xl,
  },
  cleanEmptyText: {
    fontSize: fontSizes.m,
    color: '#8E8E93',
    marginTop: spacing.s,
  },
  cleanCloseButton: {
    margin: spacing.xl,
    paddingVertical: spacing.m,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
    backgroundColor: '#1C1C1E',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  cleanCloseButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    color: '#8E8E93',
  },
  // Title Edit Modal styles
  titleEditModalContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    maxWidth: 340,
    width: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  titleEditModalHeader: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.l,
    paddingHorizontal: spacing.xl,
  },
  titleEditInputContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.l,
  },
  titleEditInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    fontSize: fontSizes.l,
    color: '#FFFFFF',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  titleEditActions: {
    flexDirection: 'row',
    gap: spacing.m,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
});

export default StreakDetailScreen;