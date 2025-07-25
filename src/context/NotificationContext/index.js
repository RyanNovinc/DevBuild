// src/context/NotificationContext/index.js
import React, { createContext, useState, useContext } from 'react';
import Notification from '../../components/Notification';
import { createNotification, createNotificationHelpers } from './utils';

// Create notification context
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Add a new notification
  const addNotification = (notification) => {
    const newNotification = createNotification(notification);
    setNotifications(prev => [...prev, newNotification]);
    return newNotification.id;
  };
  
  // Remove a notification by ID
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Create helper functions
  const helpers = createNotificationHelpers(addNotification);
  
  // Context value
  const contextValue = {
    addNotification,
    removeNotification,
    ...helpers
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