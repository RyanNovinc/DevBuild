// src/utils/NotificationHelper.js - Updated to fix timing issues
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications with enhanced iOS settings
export const configureNotifications = async () => {
  console.log('Configuring notifications...');
  
  try {
    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('time-blocks', {
        name: 'Time Block Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: true,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
      console.log('Android notification channel set up successfully');
    }

    // Configure how device handles notifications when app is in ANY state
    Notifications.setNotificationHandler({
      handleNotification: async () => {
        console.log('Handling incoming notification');
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });

    // Request permissions with explicit iOS options
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('Current notification permission status:', existingStatus);
    
    // Always request permissions explicitly
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
          provideAppNotificationSettings: true,
        },
      });
      finalStatus = status;
      console.log('New notification permission status:', finalStatus);
    }
    
    // Verify which specific permissions were granted on iOS
    if (Platform.OS === 'ios') {
      const { ios } = await Notifications.getPermissionsAsync();
      console.log('Specific iOS permissions granted:', {
        alert: ios?.allowsAlert,
        badge: ios?.allowsBadge,
        sound: ios?.allowsSound,
        announcement: ios?.allowsAnnouncements,
      });
    }

    console.log('Notification configuration complete');
    
    // Return whether permissions were granted
    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error configuring notifications:', error);
    return false;
  }
};

// Schedule a notification for a time block with enhanced error handling
export const scheduleTimeBlockNotification = async (timeBlock) => {
  if (!timeBlock || !timeBlock.notification) {
    console.log('No notification requested for time block');
    return null;
  }

  try {
    console.log(`Scheduling notification for time block: ${timeBlock.title}`);
    
    // Make sure permissions are granted before proceeding
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted. Requesting...');
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        console.log('Notification permissions denied');
        return null;
      }
    }
    
    // Calculate notification time
    const startTime = new Date(timeBlock.startTime);
    let notificationTime = new Date(startTime);
    
    // Adjust time based on notification preference
    switch (timeBlock.notificationTime) {
      case '15min':
        notificationTime.setMinutes(notificationTime.getMinutes() - 15);
        console.log('Set to 15 minutes before start');
        break;
      case '30min':
        notificationTime.setMinutes(notificationTime.getMinutes() - 30);
        console.log('Set to 30 minutes before start');
        break;
      case '1hour':
        notificationTime.setHours(notificationTime.getHours() - 1);
        console.log('Set to 1 hour before start');
        break;
      case '1day':
        notificationTime.setDate(notificationTime.getDate() - 1);
        console.log('Set to 1 day before start');
        break;
      default: // exact time
        console.log('Set to exact start time');
    }
    
    // CRITICAL FIX: If notification time is in the past, don't schedule it at all
    // UNLESS explicitly running in test mode
    if (notificationTime <= new Date()) {
      const now = new Date();
      const timeDiff = Math.round((now - notificationTime) / 1000);
      console.warn(`⚠️ Notification time was in the past by ${timeDiff} seconds, not scheduling`);
      
      // Only schedule a test notification if we're in development
      if (__DEV__ && timeBlock._isTestMode) {
        console.log('Test mode active, scheduling for 10 seconds from now anyway');
        notificationTime = new Date(Date.now() + 10000);
      } else {
        return null;
      }
    }

    // Cancel any existing notifications for this time block
    if (timeBlock.notificationId) {
      console.log(`Cancelling existing notification: ${timeBlock.notificationId}`);
      await Notifications.cancelScheduledNotificationAsync(timeBlock.notificationId);
    }

    // Create notification content with more details for better visibility
    const content = {
      title: timeBlock.title,
      body: `${timeBlock.isRepeating ? '🔄 ' : ''}Starting ${formatTimeRelative(timeBlock.notificationTime)}${timeBlock.location ? ` at ${timeBlock.location}` : ''}`,
      sound: true,
      priority: 'high',
      // Add iOS specific fields for better presentation
      ...(Platform.OS === 'ios' && {
        subtitle: timeBlock.domain || 'Time Block Reminder',
        threadId: 'timeblocks', // Group notifications by type
      }),
      // Add color for Android
      ...(Platform.OS === 'android' && {
        color: timeBlock.domainColor || '#4CAF50',
        channelId: 'time-blocks',
      }),
      // Include data for handling notification taps
      data: {
        timeBlockId: timeBlock.id,
        type: 'timeblock',
        screen: 'TimeBlock',
        params: { timeBlockId: timeBlock.id, mode: 'edit' }
      }
    };

    // CRITICAL FIX: Always use date trigger for future notifications
    // Calculate time difference in milliseconds between notification time and now
    const timeUntilNotification = notificationTime.getTime() - Date.now();
    console.log(`Time until notification: ${Math.round(timeUntilNotification / 1000)} seconds`);
    
    let trigger;
    
    // For testing purposes or very near notifications (within 60 seconds),
    // We can use a seconds-based trigger which is more reliable for testing
    if (timeBlock._isTestMode && timeUntilNotification < 60000) {
      trigger = { 
        seconds: Math.max(1, Math.floor(timeUntilNotification / 1000)),
        repeats: false
      };
      console.log(`Using seconds trigger: ${trigger.seconds} seconds`);
    } else {
      // For all production notifications, use a date trigger
      trigger = { date: notificationTime };
      console.log(`Using date trigger for: ${notificationTime.toLocaleString()}`);
    }
    
    // Schedule the notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content,
      trigger,
    });
    
    console.log(`📱 Notification scheduled successfully with ID: ${identifier}`);
    
    // For debugging, check the scheduled notifications list
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Total scheduled notifications: ${scheduledNotifications.length}`);
    
    const foundNotification = scheduledNotifications.find(n => n.identifier === identifier);
    if (foundNotification) {
      // Calculate and log when this notification will trigger
      const triggerDate = foundNotification.trigger.date;
      if (triggerDate) {
        const triggerTime = new Date(triggerDate);
        const timeUntilTrigger = triggerTime.getTime() - Date.now();
        console.log(`Notification will trigger in: ${Math.round(timeUntilTrigger / 1000)} seconds (${formatTime(triggerTime)})`);
      }
    } else {
      console.warn('⚠️ Scheduled notification not found in list - it may trigger immediately');
    }
    
    // If this was successful, remember this notification
    if (identifier) {
      console.log(`Notification scheduled (ID: ${identifier}) for time block: ${timeBlock.title}`);
      return identifier;
    }
    
    return null;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
};

// Send an immediate test notification
export const sendTestNotification = async (title = 'Test Notification', body = 'This is a test notification') => {
  try {
    // Request permissions if not already granted
    const { status } = await Notifications.getPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      
      if (newStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Notification permission is required to send test notifications.',
          [{ text: 'OK' }]
        );
        return null;
      }
    }
    
    // First check if we can send a push notification
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
        priority: 'high',
        data: { test: true }
      },
      trigger: { seconds: 2 }
    });
    
    console.log(`Test notification scheduled with ID: ${id}`);
    Alert.alert(
      'Test Notification Sent', 
      'A notification should appear in a few seconds. If not, check your notification settings.'
    );
    
    return id;
  } catch (error) {
    console.error('Error sending test notification:', error);
    Alert.alert('Test Failed', `Could not send test notification: ${error.message}`);
    return null;
  }
};

// Cancel a notification
export const cancelTimeBlockNotification = async (notificationId) => {
  if (!notificationId) {
    console.log('No notification ID provided for cancellation');
    return false;
  }
  
  try {
    console.log(`Cancelling notification: ${notificationId}`);
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Notification cancelled successfully: ${notificationId}`);
    return true;
  } catch (error) {
    console.error(`Error cancelling notification ${notificationId}:`, error);
    return false;
  }
};

// Schedule all notifications - with better error handling
export const scheduleAllTimeBlockNotifications = async (timeBlocks = []) => {
  if (!Array.isArray(timeBlocks) || timeBlocks.length === 0) {
    console.log('No time blocks provided for scheduling notifications');
    return [];
  }
  
  try {
    console.log(`Scheduling notifications for ${timeBlocks.length} time blocks`);
    
    // First, cancel all existing notifications to avoid duplicates
    const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Found ${existingNotifications.length} existing scheduled notifications`);
    
    for (const notification of existingNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
    console.log('Cancelled all existing notifications');
    
    // Find time blocks that need notifications
    const now = new Date();
    const eligibleTimeBlocks = timeBlocks.filter(block => 
      block && 
      block.notification && 
      new Date(block.startTime) > now &&
      !block.isRepeatingInstance // Only schedule for base time blocks
    );
    
    console.log(`Found ${eligibleTimeBlocks.length} eligible time blocks for notifications`);
    
    // Schedule notifications for eligible time blocks
    const scheduledNotifications = [];
    let successCount = 0;
    let failCount = 0;
    
    for (const block of eligibleTimeBlocks) {
      try {
        const notificationId = await scheduleTimeBlockNotification(block);
        if (notificationId) {
          scheduledNotifications.push({
            blockId: block.id,
            notificationId
          });
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Error scheduling notification for block ${block.id}:`, error);
        failCount++;
      }
    }
    
    console.log(`Successfully scheduled ${successCount} notifications, ${failCount} failed`);
    return scheduledNotifications;
  } catch (error) {
    console.error('Error in scheduleAllTimeBlockNotifications:', error);
    return [];
  }
};

// Generate repeating time blocks
export const generateRepeatingTimeBlocks = (timeBlock, startDate, endDate) => {
  if (!timeBlock.isRepeating) return [];
  
  const repeatingBlocks = [];
  const originalStart = new Date(timeBlock.startTime);
  const originalEnd = new Date(timeBlock.endTime);
  const dayDuration = 24 * 60 * 60 * 1000; // One day in milliseconds
  
  // Calculate time difference between start and end (to maintain duration)
  const duration = originalEnd - originalStart;
  
  // Get end date for repetition
  let repeatEndDate = endDate;
  if (!timeBlock.repeatIndefinitely && timeBlock.repeatUntil) {
    const specifiedEndDate = new Date(timeBlock.repeatUntil);
    // Use the earlier of the two end dates
    repeatEndDate = specifiedEndDate < endDate ? specifiedEndDate : endDate;
  }
  
  // Current date to start from (day after original)
  let currentDate = new Date(originalStart);
  currentDate.setDate(currentDate.getDate() + 1);
  
  // Loop until we reach the end date
  while (currentDate <= repeatEndDate) {
    let shouldAddBlock = false;
    
    switch (timeBlock.repeatFrequency) {
      case 'daily':
        shouldAddBlock = true;
        break;
        
      case 'weekly':
        // Same day of week
        shouldAddBlock = currentDate.getDay() === originalStart.getDay();
        break;
        
      case 'monthly':
        // Same day of month
        shouldAddBlock = currentDate.getDate() === originalStart.getDate();
        break;
    }
    
    if (shouldAddBlock) {
      // Create a new time block for this date
      const newStart = new Date(currentDate);
      newStart.setHours(
        originalStart.getHours(),
        originalStart.getMinutes(),
        originalStart.getSeconds()
      );
      
      const newEnd = new Date(newStart.getTime() + duration);
      
      repeatingBlocks.push({
        ...timeBlock,
        id: `${timeBlock.id}-repeat-${newStart.toISOString()}`,
        startTime: newStart.toISOString(),
        endTime: newEnd.toISOString(),
        isRepeatingInstance: true,
        originalTimeBlockId: timeBlock.id,
        // Pass along notification settings but don't schedule repeating instances
        notification: false,
        notificationId: null
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return repeatingBlocks;
};

// Function to verify iOS notification settings
export const verifyiOSNotificationSettings = async () => {
  if (Platform.OS !== 'ios') return true;
  
  try {
    const { ios } = await Notifications.getPermissionsAsync();
    
    // Create a settings verification object
    const settings = {
      alert: ios?.allowsAlert === true,
      sound: ios?.allowsSound === true,
      badge: ios?.allowsBadge === true,
      announcement: ios?.allowsAnnouncements === true,
      notificationCenter: ios?.allowsDisplayInNotificationCenter === true,
      lockScreen: ios?.allowsDisplayOnLockScreen === true,
      carPlay: ios?.allowsDisplayInCarPlay === true
    };
    
    console.log('iOS Notification Settings:', settings);
    
    // Verify critical settings
    if (!settings.alert) {
      console.warn('⚠️ iOS visual alerts not enabled - notifications will be delivered silently');
    }
    
    if (!settings.sound) {
      console.warn('⚠️ iOS notification sounds disabled');
    }
    
    if (!settings.notificationCenter || !settings.lockScreen) {
      console.warn('⚠️ iOS notifications might not show on lock screen or notification center');
    }
    
    // Calculate overall status
    const isFullyConfigured = settings.alert && settings.sound && settings.notificationCenter && settings.lockScreen;
    
    return isFullyConfigured;
  } catch (error) {
    console.error('Error verifying iOS notification settings:', error);
    return false;
  }
};

// Setup notification listeners
export const setupNotificationListeners = (navigation) => {
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification tapped!', response);
    
    // Get data from the notification
    const data = response.notification.request.content.data;
    
    // Navigate to the appropriate screen if data is available
    if (data && data.timeBlockId && navigation) {
      // Extract time block ID and handle repeating instances
      const timeBlockId = data.timeBlockId.includes('-repeat-') 
        ? data.timeBlockId.split('-repeat-')[0] 
        : data.timeBlockId;
      
      // Navigate to the time block screen
      navigation.navigate('TimeBlock', {
        timeBlockId: timeBlockId,
        mode: 'edit'
      });
    }
  });
  
  // Return cleanup function
  return () => {
    Notifications.removeNotificationSubscription(responseListener);
  };
};

// Format time for display
const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

// Format time relative to notification preference
const formatTimeRelative = (preference) => {
  switch (preference) {
    case '15min':
      return 'in 15 minutes';
    case '30min':
      return 'in 30 minutes';
    case '1hour':
      return 'in 1 hour';
    case '1day':
      return 'tomorrow';
    default:
      return 'now';
  }
};

// Export a variable to track if we're in a development environment
export const isDev = __DEV__;