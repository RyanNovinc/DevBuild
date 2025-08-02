// src/services/AchievementNotificationManager.js
// This is a direct notification system that doesn't rely on events

// Subscribers to achievement notifications
let subscribers = [];

// Queue of pending notifications
let notificationQueue = [];

// Active notification
let activeNotification = null;

// Subscribe to achievement notifications
export const subscribeToAchievementNotifications = (callback) => {
  if (typeof callback === 'function') {
    console.log('AchievementNotificationManager: New subscriber added');
    subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      subscribers = subscribers.filter(cb => cb !== callback);
      console.log('AchievementNotificationManager: Subscriber removed');
    };
  }
  return () => {}; // Empty function if invalid callback
};

// Show achievement notification
export const showAchievementNotification = (achievement) => {
  console.log('AchievementNotificationManager: Showing notification for', achievement?.title || achievement?.id || 'unknown achievement');
  
  if (!achievement) {
    console.error('AchievementNotificationManager: Invalid achievement provided');
    return;
  }
  
  // If there's an active notification, queue this one
  if (activeNotification) {
    console.log('AchievementNotificationManager: Queueing notification as another is active');
    notificationQueue.push(achievement);
    return;
  }
  
  // Set active notification
  activeNotification = achievement;
  
  // Notify all subscribers
  subscribers.forEach(callback => {
    try {
      callback(achievement);
    } catch (error) {
      console.error('AchievementNotificationManager: Error in subscriber callback', error);
    }
  });
};

// Mark notification as completed and check queue
export const completeNotification = () => {
  console.log('AchievementNotificationManager: Completing notification');
  
  // Clear active notification
  activeNotification = null;
  
  // Check if there's another notification in the queue
  if (notificationQueue.length > 0) {
    console.log('AchievementNotificationManager: Processing next notification in queue');
    // Get next notification from queue
    const nextNotification = notificationQueue.shift();
    
    // Show it after a small delay
    setTimeout(() => {
      showAchievementNotification(nextNotification);
    }, 300);
  }
};

export default {
  subscribeToAchievementNotifications,
  showAchievementNotification,
  completeNotification
};