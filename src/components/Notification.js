// src/components/Notification.js
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Specialized notification component that only handles clipboard 
// and timeblock title validation notifications
const Notification = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose
}) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  // Check if this is one of our special case notifications
  const isSpecialCase = () => {
    // Check for copy to clipboard notification
    if (message === 'Copied to clipboard!' && type === 'success') {
      return true;
    }
    
    // Check for timeblock title validation
    if (message === 'Please enter a title' && type === 'error') {
      return true;
    }
    
    return false;
  };

  // Only show notification for the specific cases we care about
  if (!isSpecialCase()) {
    // If not our special case, immediately invoke onClose to clean up
    // and return null to render nothing
    setTimeout(() => {
      if (onClose) onClose();
    }, 0);
    return null;
  }

  // Get the icon and color based on the notification type
  const getTypeProperties = () => {
    switch (type) {
      case 'success':
        return { 
          icon: 'checkmark-circle',
          backgroundColor: theme.successLight || '#4CAF5015',
          borderColor: theme.success || '#4CAF50',
          textColor: theme.success || '#4CAF50',
          iconColor: theme.success || '#4CAF50',
        };
      case 'error':
        return { 
          icon: 'alert-circle',
          backgroundColor: theme.errorLight || '#F4433610',
          borderColor: theme.error || '#F44336',
          textColor: theme.error || '#F44336',
          iconColor: theme.error || '#F44336',
        };
      default:
        return { 
          icon: 'information-circle',
          backgroundColor: theme.infoLight || '#2196F310',
          borderColor: theme.info || '#2196F3',
          textColor: theme.info || '#2196F3', 
          iconColor: theme.info || '#2196F3',
        };
    }
  };

  const properties = getTypeProperties();

  // Show animation on mount
  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after duration
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        hideNotification();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const hideNotification = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Hide animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) {
        onClose();
      }
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          backgroundColor: properties.backgroundColor,
          borderColor: properties.borderColor,
          // Add shadow based on platform
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 3,
            },
          }),
        },
      ]}
    >
      <View style={styles.contentContainer}>
        <Ionicons name={properties.icon} size={24} color={properties.iconColor} style={styles.icon} />
        <Text style={[styles.message, { color: theme.text || '#000' }]}>
          {message}
        </Text>
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={hideNotification}>
        <Ionicons name="close" size={20} color={theme.textSecondary || '#666'} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20, // Higher on iOS for status bar
    left: 20,
    right: 20,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    fontSize: 15,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
});

export default Notification;