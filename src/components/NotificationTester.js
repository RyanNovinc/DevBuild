// src/components/NotificationTester.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { 
  configureNotifications, 
  testNotificationSystem,
  verifyiOSNotificationSettings
} from '../utils/NotificationHelper';

const NotificationTester = ({ theme }) => {
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [specificPermissions, setSpecificPermissions] = useState({});
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testSent, setTestSent] = useState(false);
  
  // Load notification status on mount
  useEffect(() => {
    checkNotificationStatus();
  }, []);
  
  // Check current notification permission status
  const checkNotificationStatus = async () => {
    try {
      setIsLoading(true);
      
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
      
      // Get iOS-specific permissions if on iOS
      if (Platform.OS === 'ios') {
        const { ios } = await Notifications.getPermissionsAsync();
        setSpecificPermissions({
          allowsAlert: ios?.allowsAlert || false,
          allowsBadge: ios?.allowsBadge || false,
          allowsSound: ios?.allowsSound || false,
          allowsAnnouncements: ios?.allowsAnnouncements || false,
          allowsDisplayInNotificationCenter: ios?.allowsDisplayInNotificationCenter || false,
          allowsDisplayOnLockScreen: ios?.allowsDisplayOnLockScreen || false,
        });
      }
      
      // Check scheduled notifications
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      setScheduledNotifications(scheduled);
      
    } catch (error) {
      console.error('Error checking notification status:', error);
      Alert.alert('Error', 'Failed to check notification status');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Request notification permissions
  const requestPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Use our robust permission request
      await configureNotifications();
      
      // Check status again
      await checkNotificationStatus();
      
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      Alert.alert('Error', 'Failed to request notification permissions');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send test notification
  const handleSendTestNotification = async () => {
    try {
      setIsLoading(true);
      setTestSent(false);
      
      // Run the comprehensive notification test
      const result = await testNotificationSystem();
      
      if (result.success) {
        setTestSent(true);
        
        // Refresh scheduled notifications after a short delay
        setTimeout(async () => {
          const scheduled = await Notifications.getAllScheduledNotificationsAsync();
          setScheduledNotifications(scheduled);
          setIsLoading(false);
        }, 2000);
      } else {
        Alert.alert(
          'Test Failed',
          `Failed to send notification: ${result.error}`,
          [{ text: 'OK' }]
        );
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
      setIsLoading(false);
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Cancel all scheduled notifications
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduled) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
      
      // Clear from notification center
      await Notifications.dismissAllNotificationsAsync();
      
      // Update state
      setScheduledNotifications([]);
      
      Alert.alert('Success', 'All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      Alert.alert('Error', 'Failed to clear notifications');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to get permission status text and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'granted':
        return { text: 'Granted', color: '#4CAF50' };
      case 'denied':
        return { text: 'Denied', color: '#F44336' };
      case 'undetermined':
        return { text: 'Not Requested', color: '#FF9800' };
      default:
        return { text: 'Unknown', color: '#9E9E9E' };
    }
  };
  
  // Format a date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get background color for card
  const getCardBackground = () => {
    if (permissionStatus === 'granted') {
      // Check iOS specific permissions
      if (Platform.OS === 'ios' && specificPermissions) {
        if (!specificPermissions.allowsAlert || !specificPermissions.allowsSound) {
          return '#FFF9C4'; // Yellow warning background
        }
      }
      return '#E8F5E9'; // Green success background
    } else if (permissionStatus === 'denied') {
      return '#FFEBEE'; // Red error background
    } else {
      return '#FFF8E1'; // Orange warning background
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={[styles.statusCard, { backgroundColor: getCardBackground() }]}>
        <Text style={styles.title}>Notification Status</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Permission Status:</Text>
          <Text style={[
            styles.statusValue, 
            { color: getStatusInfo(permissionStatus).color }
          ]}>
            {getStatusInfo(permissionStatus).text}
          </Text>
        </View>
        
        {Platform.OS === 'ios' && (
          <View style={styles.iosPermissions}>
            <Text style={styles.iosPermissionsTitle}>iOS Specific Permissions:</Text>
            
            <View style={styles.permissionItem}>
              <Text style={styles.permissionLabel}>Visual Alerts:</Text>
              <View style={styles.permissionStatus}>
                <Ionicons 
                  name={specificPermissions.allowsAlert ? 'checkmark-circle' : 'close-circle'} 
                  size={18} 
                  color={specificPermissions.allowsAlert ? '#4CAF50' : '#F44336'} 
                />
              </View>
            </View>
            
            <View style={styles.permissionItem}>
              <Text style={styles.permissionLabel}>Sound:</Text>
              <View style={styles.permissionStatus}>
                <Ionicons 
                  name={specificPermissions.allowsSound ? 'checkmark-circle' : 'close-circle'} 
                  size={18} 
                  color={specificPermissions.allowsSound ? '#4CAF50' : '#F44336'} 
                />
              </View>
            </View>
            
            <View style={styles.permissionItem}>
              <Text style={styles.permissionLabel}>Badge:</Text>
              <View style={styles.permissionStatus}>
                <Ionicons 
                  name={specificPermissions.allowsBadge ? 'checkmark-circle' : 'close-circle'} 
                  size={18} 
                  color={specificPermissions.allowsBadge ? '#4CAF50' : '#F44336'} 
                />
              </View>
            </View>
            
            <View style={styles.permissionItem}>
              <Text style={styles.permissionLabel}>Notification Center:</Text>
              <View style={styles.permissionStatus}>
                <Ionicons 
                  name={specificPermissions.allowsDisplayInNotificationCenter ? 'checkmark-circle' : 'close-circle'} 
                  size={18} 
                  color={specificPermissions.allowsDisplayInNotificationCenter ? '#4CAF50' : '#F44336'} 
                />
              </View>
            </View>
            
            <View style={styles.permissionItem}>
              <Text style={styles.permissionLabel}>Lock Screen:</Text>
              <View style={styles.permissionStatus}>
                <Ionicons 
                  name={specificPermissions.allowsDisplayOnLockScreen ? 'checkmark-circle' : 'close-circle'} 
                  size={18} 
                  color={specificPermissions.allowsDisplayOnLockScreen ? '#4CAF50' : '#F44336'} 
                />
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={requestPermissions}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {permissionStatus === 'granted' ? 'Verify Permissions' : 'Request Permissions'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={checkNotificationStatus}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Refresh Status</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.testContainer}>
        <Text style={styles.title}>Test Notifications</Text>
        
        {testSent && (
          <View style={styles.successMessage}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={[styles.successText, { color: '#4CAF50' }]}>
              Test notification sent! Did you receive it?
            </Text>
          </View>
        )}
        
        <View style={styles.testAction}>
          <TouchableOpacity
            style={[
              styles.testButton, 
              { backgroundColor: isLoading ? '#9E9E9E' : theme.primary }
            ]}
            onPress={handleSendTestNotification}
            disabled={isLoading || permissionStatus !== 'granted'}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
            ) : (
              <Ionicons name="notifications" size={20} color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.buttonText}>Send Test Notification</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, { 
              backgroundColor: scheduledNotifications.length > 0 ? '#F44336' : '#9E9E9E' 
            }]}
            onPress={clearAllNotifications}
            disabled={isLoading || scheduledNotifications.length === 0}
          >
            <Ionicons name="trash" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Clear All Notifications</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.scheduledContainer}>
        <Text style={styles.title}>Scheduled Notifications ({scheduledNotifications.length})</Text>
        
        <ScrollView style={styles.scheduledList}>
          {scheduledNotifications.length > 0 ? (
            scheduledNotifications.map((notification, index) => (
              <View key={notification.identifier} style={styles.notificationItem}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>
                    {notification.content.title || 'Untitled'}
                  </Text>
                  <TouchableOpacity
                    onPress={async () => {
                      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                      checkNotificationStatus();
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.notificationBody}>
                  {notification.content.body || 'No content'}
                </Text>
                
                <Text style={styles.notificationTrigger}>
                  {notification.trigger.date 
                    ? `Scheduled for: ${formatDate(notification.trigger.date)}`
                    : notification.trigger.seconds
                    ? `Trigger in: ${notification.trigger.seconds} seconds`
                    : `Trigger: ${JSON.stringify(notification.trigger)}`
                  }
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyMessage}>No scheduled notifications</Text>
          )}
        </ScrollView>
      </View>
      
      {Platform.OS === 'ios' && !specificPermissions.allowsAlert && (
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={24} color="#FF9800" />
          <Text style={styles.warningText}>
            Visual alerts are disabled. Please make sure "Allow Notifications" and "Show as Banners" are both enabled in your device settings: Settings → Notifications → LifeBalance Builder
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  statusCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  iosPermissions: {
    marginTop: 12,
    marginBottom: 8,
  },
  iosPermissionsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  permissionLabel: {
    fontSize: 14,
  },
  permissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  successText: {
    marginLeft: 8,
    fontSize: 14,
  },
  testAction: {
    flexDirection: 'column', // Changed to column for better spacing
    justifyContent: 'space-between',
  },
  testButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  scheduledContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  scheduledList: {
    flex: 1,
  },
  notificationItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 8,
  },
  notificationTrigger: {
    fontSize: 12,
    color: '#757575',
  },
  emptyMessage: {
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
    color: '#9E9E9E',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#E65100',
  },
});

export default NotificationTester;