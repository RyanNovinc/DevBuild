// src/screens/NotificationTestScreen.js
import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import NotificationTester from '../components/NotificationTester';
import { configureNotifications, verifyiOSNotificationSettings } from '../utils/NotificationHelper';

const NotificationTestScreen = ({ navigation }) => {
  const { theme } = useTheme();
  
  // Run configuration check on mount
  useEffect(() => {
    const checkNotifications = async () => {
      // Make sure notifications are configured
      await configureNotifications();
      
      // Verify iOS settings if on iOS
      if (Platform.OS === 'ios') {
        await verifyiOSNotificationSettings();
      }
    };
    
    checkNotifications();
  }, []);
  
  // Open iOS notification settings
  const openNotificationSettings = async () => {
    if (Platform.OS === 'ios') {
      // iOS URL scheme to notification settings
      await Linking.openURL('app-settings:notification');
    } else {
      // For Android, just open the app settings
      await Linking.openSettings();
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Text style={[styles.screenTitle, { color: theme.text }]}>
          Notification Tester
        </Text>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={openNotificationSettings}
        >
          <Ionicons name="settings-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>
            Notification Troubleshooter
          </Text>
          
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Use this screen to test notifications and verify that they're properly configured. If notifications aren't appearing, follow these steps:
          </Text>
          
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={[styles.stepText, { color: theme.text }]}>
                Request or verify notification permissions
              </Text>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[styles.stepText, { color: theme.text }]}>
                Send a test notification to verify settings
              </Text>
            </View>
            
            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[styles.stepText, { color: theme.text }]}>
                If not appearing, check your device notification settings
              </Text>
            </View>
            
            {Platform.OS === 'ios' && (
              <View style={styles.iosSettings}>
                <Text style={[styles.iosTitle, { color: theme.text }]}>
                  iOS Settings Check
                </Text>
                <Text style={[styles.iosText, { color: theme.textSecondary }]}>
                  Make sure these are all enabled in Settings → Notifications → LifeBalance Builder:
                </Text>
                <View style={styles.iosOptions}>
                  <Text style={[styles.iosOption, { color: theme.text }]}>
                    • Allow Notifications: ON
                  </Text>
                  <Text style={[styles.iosOption, { color: theme.text }]}>
                    • Lock Screen: ON
                  </Text>
                  <Text style={[styles.iosOption, { color: theme.text }]}>
                    • Notification Center: ON
                  </Text>
                  <Text style={[styles.iosOption, { color: theme.text }]}>
                    • Banner Style: Temporary or Persistent
                  </Text>
                  <Text style={[styles.iosOption, { color: theme.text }]}>
                    • Sounds: ON
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.openSettingsButton, { backgroundColor: theme.primary }]}
                  onPress={openNotificationSettings}
                >
                  <Text style={styles.openSettingsText}>Open Notification Settings</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        <NotificationTester theme={theme} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  stepsList: {
    marginBottom: 8,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
  },
  iosSettings: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  iosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  iosText: {
    fontSize: 14,
    marginBottom: 8,
  },
  iosOptions: {
    marginBottom: 12,
  },
  iosOption: {
    fontSize: 14,
    marginBottom: 4,
  },
  openSettingsButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  openSettingsButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    alignItems: 'center',
  },
  openSettingsText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default NotificationTestScreen;