// src/utils/ImmediateNotificationFix.js - Add this helper file to your project
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

// This function sends an immediate test notification to verify permissions
// and notification functionality
export const sendImmediateNotification = async (title, body) => {
  try {
    // Request permissions if not already granted
    const { status } = await Notifications.getPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Requesting notification permissions...');
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      
      if (newStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Notification permission is required to send notifications.',
          [{ text: 'OK' }]
        );
        return null;
      }
    }
    
    // Create a unique identifier for this notification
    const id = Date.now().toString();
    
    // Schedule with a 2 second delay (more reliable than trying to calculate exact times)
    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title: title || 'Test Notification',
        body: body || 'This is a test notification',
        data: { test: true },
        sound: true,
      },
      trigger: { seconds: 2 }
    });
    
    console.log(`Immediate notification scheduled with ID: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
};

// This function schedules a notification for a specific future time
export const scheduleFutureNotification = async (title, body, scheduledTime, data = {}) => {
  try {
    // Validate input
    if (!title || !scheduledTime) {
      console.error('Missing required parameters for scheduling notification');
      return null;
    }
    
    // Ensure scheduledTime is a Date object
    const notificationTime = new Date(scheduledTime);
    
    // Check if the time is in the future
    const now = new Date();
    if (notificationTime <= now) {
      console.warn('Notification time is in the past, scheduling for 10 seconds from now instead');
      const newTime = new Date(now.getTime() + 10000); // 10 seconds in the future
      return scheduleFixedTimeNotification(title, body, newTime, data);
    }
    
    // Calculate seconds from now until the scheduled time
    const secondsFromNow = Math.floor((notificationTime.getTime() - now.getTime()) / 1000);
    console.log(`Scheduling notification for ${secondsFromNow} seconds from now`);
    
    // If less than 5 minutes away, use seconds trigger (more reliable for near-term notifications)
    if (secondsFromNow < 300) { // 5 minutes = 300 seconds
      return scheduleCountdownNotification(title, body, secondsFromNow, data);
    } else {
      // For notifications further in the future, use the date trigger
      return scheduleFixedTimeNotification(title, body, notificationTime, data);
    }
  } catch (error) {
    console.error('Error scheduling future notification:', error);
    return null;
  }
};

// Helper function to schedule a notification with a seconds-based countdown
const scheduleCountdownNotification = async (title, body, seconds, data = {}) => {
  try {
    // Create a unique identifier
    const id = `countdown_${Date.now()}`;
    
    // Schedule notification with seconds trigger
    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: { 
        seconds: Math.max(1, seconds),
        repeats: false
      }
    });
    
    console.log(`Countdown notification scheduled for ${seconds} seconds from now with ID: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling countdown notification:', error);
    return null;
  }
};

// Helper function to schedule a notification at a specific date/time
const scheduleFixedTimeNotification = async (title, body, dateTime, data = {}) => {
  try {
    // Create a unique identifier
    const id = `fixed_${Date.now()}`;
    
    // Schedule notification with date trigger
    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: { 
        date: dateTime,
        repeats: false
      }
    });
    
    console.log(`Fixed-time notification scheduled for ${dateTime.toLocaleString()} with ID: ${notificationId}`);
    
    // Verify the notification was scheduled
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const found = scheduledNotifications.some(n => n.identifier === notificationId);
    
    if (!found) {
      console.warn('⚠️ Notification was not found in scheduled list, may not be properly scheduled');
    } else {
      console.log('✅ Notification verified in scheduled list');
    }
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling fixed-time notification:', error);
    return null;
  }
};

// This is a simple function to use directly from your TimeBlockScreen
export const scheduleTimeBlockNotificationSimple = async (timeBlock) => {
  if (!timeBlock || !timeBlock.notification) {
    console.log('No notification requested for time block');
    return null;
  }

  try {
    console.log(`Scheduling notification for time block: ${timeBlock.title}`);
    
    // Calculate notification time
    const startTime = new Date(timeBlock.startTime);
    let notificationTime = new Date(startTime);
    
    // Adjust time based on notification preference (updated for new options)
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
    
    // Create notification body
    const body = `${timeBlock.isRepeating ? '🔄 ' : ''}${formatTimeRelative(timeBlock.notificationTime, timeBlock.customMinutes)}${timeBlock.location ? ` at ${timeBlock.location}` : ''}`;
    
    // Schedule the notification
    return scheduleFutureNotification(
      timeBlock.title,
      body,
      notificationTime,
      {
        timeBlockId: timeBlock.id,
        type: 'timeblock',
        screen: 'TimeBlock',
        params: { timeBlockId: timeBlock.id, mode: 'edit' }
      }
    );
  } catch (error) {
    console.error('Error in scheduleTimeBlockNotificationSimple:', error);
    return null;
  }
};

// Test the notification system with all new options
export const testNewNotificationOptions = async () => {
  try {
    console.log('🧪 Testing new notification options...');
    
    // Test 5-minute reminder
    const test5min = {
      id: 'test-5min',
      title: '5-Min Test',
      startTime: new Date(Date.now() + 6 * 60 * 1000).toISOString(), // 6 minutes from now
      notification: true,
      notificationTime: '5' // 5 minutes before
    };
    
    // Test custom reminder (3 minutes)
    const testCustom = {
      id: 'test-custom',
      title: 'Custom Test (3min)',
      startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      notification: true,
      notificationTime: 'custom',
      customMinutes: '3' // 3 minutes before
    };
    
    const result5min = await scheduleTimeBlockNotificationSimple(test5min);
    const resultCustom = await scheduleTimeBlockNotificationSimple(testCustom);
    
    console.log(`5-min test result: ${result5min}`);
    console.log(`Custom test result: ${resultCustom}`);
    
    // Check scheduled notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Total scheduled: ${scheduled.length}`);
    
    return {
      success: true,
      fiveMinuteScheduled: !!result5min,
      customScheduled: !!resultCustom,
      totalScheduled: scheduled.length,
      message: `Tests scheduled! You should get 2 notifications: one in 1 minute (5-min test) and one in 2 minutes (custom test).`
    };
    
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Format time relative to notification preference
const formatTimeRelative = (preference, customMinutes = null) => {
  switch (preference) {
    case '5':
      return 'Starting in 5 minutes';
    case '15':
      return 'Starting in 15 minutes';
    case '30':
      return 'Starting in 30 minutes';
    case 'custom':
      const mins = parseInt(customMinutes) || 10;
      return `Starting in ${mins} minute${mins !== 1 ? 's' : ''}`;
    // Keep backward compatibility
    case '15min':
      return 'Starting in 15 minutes';
    case '30min':
      return 'Starting in 30 minutes';
    case '1hour':
      return 'Starting in 1 hour';
    case '1day':
      return 'Starting tomorrow';
    default:
      return 'Starting now';
  }
};