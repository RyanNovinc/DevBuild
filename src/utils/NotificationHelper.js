// src/utils/NotificationHelper.js - Updated to fix timing issues
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notifications with enhanced iOS settings for PRODUCTION
export const configureNotifications = async () => {
  console.log('Configuring notifications for production...');
  
  try {
    // Set up Android notification channel with all required settings
    if (Platform.OS === 'android') {
      // Create the primary channel
      await Notifications.setNotificationChannelAsync('time-blocks', {
        name: 'Time Block Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: true,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
      
      // Create a high priority channel for urgent reminders
      await Notifications.setNotificationChannelAsync('urgent-reminders', {
        name: 'Urgent Reminders',
        importance: Notifications.AndroidImportance.MAX,
        sound: true,
        vibrationPattern: [0, 500, 200, 500],
        lightColor: '#FF5722',
        enableVibrate: true,
        showBadge: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
      
      console.log('Android notification channels set up successfully');
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
      case '5':
        notificationTime.setMinutes(notificationTime.getMinutes() - 5);
        console.log('Set to 5 minutes before start');
        break;
      case '15':
        notificationTime.setMinutes(notificationTime.getMinutes() - 15);
        console.log('Set to 15 minutes before start');
        break;
      case '30':
        notificationTime.setMinutes(notificationTime.getMinutes() - 30);
        console.log('Set to 30 minutes before start');
        break;
      case 'custom':
        // Use custom minutes from timeBlock.customMinutes
        const customMins = parseInt(timeBlock.customMinutes) || 10;
        notificationTime.setMinutes(notificationTime.getMinutes() - customMins);
        console.log(`Set to ${customMins} minutes before start (custom)`);
        break;
      // Keep backward compatibility with old format
      case '15min':
        notificationTime.setMinutes(notificationTime.getMinutes() - 15);
        console.log('Set to 15 minutes before start (legacy)');
        break;
      case '30min':
        notificationTime.setMinutes(notificationTime.getMinutes() - 30);
        console.log('Set to 30 minutes before start (legacy)');
        break;
      case '1hour':
        notificationTime.setHours(notificationTime.getHours() - 1);
        console.log('Set to 1 hour before start (legacy)');
        break;
      case '1day':
        notificationTime.setDate(notificationTime.getDate() - 1);
        console.log('Set to 1 day before start (legacy)');
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
      body: `${timeBlock.isRepeating ? '🔄 ' : ''}Starting ${formatTimeRelative(timeBlock.notificationTime, timeBlock.customMinutes)}${timeBlock.location ? ` at ${timeBlock.location}` : ''}`,
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

// Schedule all notifications - with better error handling for single and recurring events
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
      !block.isRepeatingInstance // Only schedule for base time blocks, not instances
    );
    
    console.log(`Found ${eligibleTimeBlocks.length} eligible time blocks for notifications`);
    
    // Schedule notifications for eligible time blocks
    const allScheduledNotifications = [];
    let successCount = 0;
    let failCount = 0;
    
    for (const block of eligibleTimeBlocks) {
      try {
        if (block.isRepeating) {
          // Handle recurring time blocks
          console.log(`Scheduling recurring notifications for: ${block.title}`);
          const recurringNotifications = await scheduleRecurringNotifications(block);
          allScheduledNotifications.push(...recurringNotifications);
          successCount += recurringNotifications.length;
        } else {
          // Handle single time blocks
          if (new Date(block.startTime) > now) {
            console.log(`Scheduling single notification for: ${block.title}`);
            const notificationId = await scheduleTimeBlockNotification(block);
            if (notificationId) {
              allScheduledNotifications.push({
                blockId: block.id,
                notificationId,
                date: block.startTime,
                isSingle: true
              });
              successCount++;
            } else {
              failCount++;
            }
          } else {
            console.log(`Skipping past event: ${block.title}`);
          }
        }
      } catch (error) {
        console.error(`Error scheduling notification for block ${block.id}:`, error);
        failCount++;
      }
    }
    
    console.log(`Successfully scheduled ${successCount} notifications, ${failCount} failed`);
    console.log(`Total scheduled notifications: ${allScheduledNotifications.length}`);
    
    return allScheduledNotifications;
  } catch (error) {
    console.error('Error in scheduleAllTimeBlockNotifications:', error);
    return [];
  }
};

// Schedule notifications for recurring events
export const scheduleRecurringNotifications = async (timeBlock) => {
  if (!timeBlock.isRepeating || !timeBlock.notification) {
    console.log('Time block is not recurring or notifications disabled');
    return [];
  }

  try {
    console.log(`Scheduling recurring notifications for: ${timeBlock.title}`);
    
    // Make sure permissions are granted
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return [];
    }

    const scheduledNotifications = [];
    const originalStart = new Date(timeBlock.startTime);
    const now = new Date();
    
    // Determine how far ahead to schedule (max 64 notifications as per iOS limit)
    const maxNotifications = 64;
    let scheduledCount = 0;
    
    // Calculate end date for repetition (30 days ahead or specified end date)
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 30);
    
    let repeatEndDate = defaultEndDate;
    if (!timeBlock.repeatIndefinitely && timeBlock.repeatUntil) {
      const specifiedEndDate = new Date(timeBlock.repeatUntil);
      repeatEndDate = specifiedEndDate < defaultEndDate ? specifiedEndDate : defaultEndDate;
    }

    // Start from the next occurrence
    let currentDate = new Date(originalStart);
    
    // If the original time is in the future, schedule it first
    if (originalStart > now) {
      const notificationId = await scheduleTimeBlockNotification(timeBlock);
      if (notificationId) {
        scheduledNotifications.push({
          blockId: timeBlock.id,
          notificationId,
          date: originalStart.toISOString(),
          isOriginal: true
        });
        scheduledCount++;
      }
    }

    // Move to next occurrence based on frequency
    switch (timeBlock.repeatFrequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
    }

    // Schedule future occurrences
    while (currentDate <= repeatEndDate && scheduledCount < maxNotifications) {
      // Only schedule if this occurrence is in the future
      if (currentDate > now) {
        // Create a time block instance for this occurrence
        const instanceTimeBlock = {
          ...timeBlock,
          id: `${timeBlock.id}-repeat-${currentDate.toISOString()}`,
          startTime: currentDate.toISOString(),
          endTime: new Date(currentDate.getTime() + (new Date(timeBlock.endTime) - originalStart)).toISOString(),
          isRepeatingInstance: true,
          originalTimeBlockId: timeBlock.id
        };

        const notificationId = await scheduleTimeBlockNotification(instanceTimeBlock);
        if (notificationId) {
          scheduledNotifications.push({
            blockId: instanceTimeBlock.id,
            notificationId,
            date: currentDate.toISOString(),
            isRecurring: true
          });
          scheduledCount++;
        }
      }

      // Move to next occurrence
      switch (timeBlock.repeatFrequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    console.log(`Scheduled ${scheduledCount} recurring notifications for: ${timeBlock.title}`);
    return scheduledNotifications;
    
  } catch (error) {
    console.error('Error scheduling recurring notifications:', error);
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
const formatTimeRelative = (preference, customMinutes = null) => {
  switch (preference) {
    case '5':
      return 'in 5 minutes';
    case '15':
      return 'in 15 minutes';
    case '30':
      return 'in 30 minutes';
    case 'custom':
      const mins = parseInt(customMinutes) || 10;
      return `in ${mins} minute${mins !== 1 ? 's' : ''}`;
    // Keep backward compatibility
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

// Test comprehensive notification functionality
export const testNotificationSystem = async () => {
  try {
    console.log('🧪 Starting comprehensive notification system test...');
    
    // 1. Check permissions
    const { status } = await Notifications.getPermissionsAsync();
    console.log(`📱 Permission status: ${status}`);
    
    if (status !== 'granted') {
      const { status: requestStatus } = await Notifications.requestPermissionsAsync();
      if (requestStatus !== 'granted') {
        throw new Error('Notification permissions not granted');
      }
    }
    
    // 2. Test immediate notification
    await sendTestNotification('🔔 Test 1', 'Immediate notification test');
    
    // 3. Test 5-minute reminder
    const testTimeBlock5min = {
      id: 'test-5min',
      title: '🕔 5-Min Reminder Test',
      startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      endTime: new Date(Date.now() + 6 * 60 * 1000).toISOString(),
      notification: true,
      notificationTime: '5',
      location: 'Test Location',
      isRepeating: false
    };
    
    const notification5min = await scheduleTimeBlockNotification(testTimeBlock5min);
    console.log(`📅 5-minute test scheduled: ${notification5min}`);
    
    // 4. Test custom time reminder (2 minutes)
    const testTimeBlockCustom = {
      id: 'test-custom',
      title: '🎯 Custom Reminder Test',
      startTime: new Date(Date.now() + 4 * 60 * 1000).toISOString(), // 4 minutes from now
      endTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      notification: true,
      notificationTime: 'custom',
      customMinutes: '2', // 2 minutes before
      isRepeating: false
    };
    
    const notificationCustom = await scheduleTimeBlockNotification(testTimeBlockCustom);
    console.log(`🎯 Custom test scheduled: ${notificationCustom}`);
    
    // 5. Test recurring notification (daily for next 3 days)
    const testTimeBlockRecurring = {
      id: 'test-recurring',
      title: '🔄 Recurring Test',
      startTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
      endTime: new Date(Date.now() + 11 * 60 * 1000).toISOString(),
      notification: true,
      notificationTime: '5',
      isRepeating: true,
      repeatFrequency: 'daily',
      repeatIndefinitely: false,
      repeatUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
    };
    
    const recurringNotifications = await scheduleRecurringNotifications(testTimeBlockRecurring);
    console.log(`🔄 Recurring test scheduled: ${recurringNotifications.length} notifications`);
    
    // 6. Check all scheduled notifications
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📊 Total scheduled notifications: ${allScheduled.length}`);
    
    // 7. Return test summary
    return {
      success: true,
      permissionStatus: status,
      immediate: true,
      fiveMinute: !!notification5min,
      custom: !!notificationCustom,
      recurring: recurringNotifications.length,
      totalScheduled: allScheduled.length,
      message: `Test complete! Scheduled ${allScheduled.length} notifications. Check your device in the next few minutes.`
    };
    
  } catch (error) {
    console.error('❌ Notification test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Notification test failed. Check console for details.'
    };
  }
};

// Get detailed notification status for debugging
export const getNotificationStatus = async () => {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    const status = {
      permissions: {
        status: permissions.status,
        canAskAgain: permissions.canAskAgain,
        granted: permissions.granted
      },
      scheduled: {
        count: scheduled.length,
        notifications: scheduled.map(n => ({
          id: n.identifier,
          title: n.content.title,
          triggerDate: n.trigger.date ? new Date(n.trigger.date).toLocaleString() : 'Immediate',
          triggerType: n.trigger.type
        }))
      },
      platform: Platform.OS
    };
    
    if (Platform.OS === 'ios' && permissions.ios) {
      status.permissions.ios = {
        alert: permissions.ios.allowsAlert,
        badge: permissions.ios.allowsBadge,
        sound: permissions.ios.allowsSound,
        announcement: permissions.ios.allowsAnnouncements,
        notificationCenter: permissions.ios.allowsDisplayInNotificationCenter,
        lockScreen: permissions.ios.allowsDisplayOnLockScreen
      };
    }
    
    console.log('📱 Notification Status:', JSON.stringify(status, null, 2));
    return status;
    
  } catch (error) {
    console.error('Error getting notification status:', error);
    return { error: error.message };
  }
};

// Production readiness check
export const checkProductionReadiness = async () => {
  const issues = [];
  const warnings = [];
  
  try {
    console.log('🔍 Checking notification production readiness...');
    
    // 1. Check permissions
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      issues.push('Notification permissions not granted');
      if (!canAskAgain) {
        issues.push('Cannot request permissions - user must enable in system settings');
      }
    }
    
    // 2. Check platform-specific settings
    if (Platform.OS === 'ios') {
      const { ios } = await Notifications.getPermissionsAsync();
      if (ios) {
        if (!ios.allowsAlert) warnings.push('iOS alerts not enabled');
        if (!ios.allowsSound) warnings.push('iOS notification sounds disabled');
        if (!ios.allowsBadge) warnings.push('iOS badge updates disabled');
        if (!ios.allowsDisplayInNotificationCenter) warnings.push('iOS notification center disabled');
        if (!ios.allowsDisplayOnLockScreen) warnings.push('iOS lock screen notifications disabled');
      }
    }
    
    // 3. Test basic notification scheduling
    try {
      const testId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test',
          body: 'Production test',
        },
        trigger: { seconds: 3600 } // 1 hour from now
      });
      
      if (testId) {
        // Clean up test notification
        await Notifications.cancelScheduledNotificationAsync(testId);
      } else {
        issues.push('Unable to schedule test notification');
      }
    } catch (error) {
      issues.push(`Notification scheduling failed: ${error.message}`);
    }
    
    // 4. Check existing scheduled notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    // 5. Platform-specific checks
    if (Platform.OS === 'android') {
      // Check if our notification channels exist
      try {
        const channels = await Notifications.getNotificationChannelsAsync();
        const hasTimeBlockChannel = channels.some(ch => ch.id === 'time-blocks');
        if (!hasTimeBlockChannel) {
          warnings.push('Android time-blocks notification channel not found - call configureNotifications()');
        }
      } catch (error) {
        warnings.push('Unable to check Android notification channels');
      }
    }
    
    const result = {
      ready: issues.length === 0,
      issues: issues,
      warnings: warnings,
      permissionStatus: status,
      scheduledCount: scheduled.length,
      platform: Platform.OS,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Production Readiness Report:', result);
    
    if (result.ready) {
      console.log('✅ Notifications are ready for production!');
    } else {
      console.log('❌ Production issues found:', issues);
    }
    
    return result;
    
  } catch (error) {
    return {
      ready: false,
      issues: [`Production check failed: ${error.message}`],
      warnings: [],
      error: error.message
    };
  }
};

// Export a variable to track if we're in a development environment
export const isDev = __DEV__;