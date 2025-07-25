// src/context/NotificationContext.js
import React, { createContext, useState, useContext } from 'react';
import Notification from '../components/Notification';

// Create notification context
const NotificationContext = createContext();

// Generate a unique ID for each notification
const generateId = () => Math.random().toString(36).substr(2, 9);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Add a new notification
  const addNotification = (notification) => {
    const id = generateId();
    const newNotification = {
      id,
      message: notification.message || '',
      type: notification.type || 'info',
      duration: notification.duration !== undefined ? notification.duration : 3000,
      action: notification.action,
      actionText: notification.actionText,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    return id;
  };
  
  // Remove a notification by ID
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Shorthand methods for different notification types
  const showSuccess = (message, options = {}) => {
    return addNotification({
      message,
      type: 'success',
      ...options,
    });
  };
  
  const showError = (message, options = {}) => {
    return addNotification({
      message,
      type: 'error',
      ...options,
    });
  };
  
  const showWarning = (message, options = {}) => {
    return addNotification({
      message,
      type: 'warning',
      ...options,
    });
  };
  
  const showInfo = (message, options = {}) => {
    return addNotification({
      message,
      type: 'info',
      ...options,
    });
  };
  
  // Context value
  const contextValue = {
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Render notifications */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          action={notification.action}
          actionText={notification.actionText}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;