// src/contexts/NotificationContext/utils.js
// Utility functions for notification management

/**
 * Generate a unique ID for each notification
 * @returns {string} - A unique string ID
 */
export const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Create a notification object with default values
 * @param {Object} notification - The notification data
 * @param {string} notification.message - The notification message
 * @param {string} notification.type - The notification type (info, success, error, warning)
 * @param {number} notification.duration - How long to show the notification in ms
 * @param {Function} notification.action - Optional action callback
 * @param {string} notification.actionText - Text for the action button
 * @returns {Object} - The complete notification object
 */
export const createNotification = (notification) => ({
  id: generateId(),
  message: notification.message || '',
  type: notification.type || 'info',
  duration: notification.duration !== undefined ? notification.duration : 3000,
  action: notification.action,
  actionText: notification.actionText,
});

/**
 * Create helper functions for different notification types
 * @param {Function} addNotification - The base notification function
 * @returns {Object} - Object containing helper functions
 */
export const createNotificationHelpers = (addNotification) => ({
  showSuccess: (message, options = {}) => {
    return addNotification({
      message,
      type: 'success',
      ...options,
    });
  },
  
  showError: (message, options = {}) => {
    return addNotification({
      message,
      type: 'error',
      ...options,
    });
  },
  
  showWarning: (message, options = {}) => {
    return addNotification({
      message,
      type: 'warning',
      ...options,
    });
  },
  
  showInfo: (message, options = {}) => {
    return addNotification({
      message,
      type: 'info',
      ...options,
    });
  }
});