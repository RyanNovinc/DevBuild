// src/components/CalendarSettingsModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize,
  ensureAccessibleTouchTarget
} from '../utils/responsive';

const CalendarSettingsModal = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const isDarkMode = theme.background === '#000000';
  
  const {
    calendarSettings,
    calendarPermissionStatus,
    updateCalendarSettings,
    requestCalendarPermissions,
    getCalendarPermissionStatus,
    getAvailableCalendars,
    getCalendarIntegrationStatus
  } = useAppContext();

  // Local state
  const [localSettings, setLocalSettings] = useState(calendarSettings);
  const [availableCalendars, setAvailableCalendars] = useState([]);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Load initial data when modal opens
  useEffect(() => {
    if (visible) {
      loadInitialData();
    }
  }, [visible]);

  // Update local settings when global settings change
  useEffect(() => {
    setLocalSettings(calendarSettings);
  }, [calendarSettings]);

  const loadInitialData = async () => {
    try {
      // Get integration status
      const status = getCalendarIntegrationStatus();
      setIntegrationStatus(status);

      // Check permissions
      if (getCalendarPermissionStatus) {
        await getCalendarPermissionStatus();
      }

      // Load available calendars if permissions are granted
      if (calendarPermissionStatus === 'granted' && getAvailableCalendars) {
        setIsLoadingCalendars(true);
        try {
          const calendars = await getAvailableCalendars();
          setAvailableCalendars(calendars);
        } catch (error) {
          console.error('Error loading calendars:', error);
        }
        setIsLoadingCalendars(false);
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  const handleRequestPermissions = async () => {
    setIsRequestingPermission(true);
    try {
      const result = await requestCalendarPermissions();
      
      if (result.status === 'granted') {
        // Reload calendars after permission granted
        await loadInitialData();
      } else {
        Alert.alert(
          'Calendar Permission Required',
          'To sync your time blocks with your device calendar, please grant calendar permissions in your device settings.',
          [
            {
              text: 'Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  // On iOS, we can't directly open settings, but we can show instructions
                  Alert.alert(
                    'Enable Calendar Access',
                    'Please go to Settings > Privacy & Security > Calendars > LifeCompass and enable calendar access.',
                    [{ text: 'OK' }]
                  );
                }
              }
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request calendar permissions. Please try again.');
    }
    setIsRequestingPermission(false);
  };

  const handleSyncEnabledChange = async (enabled) => {
    if (enabled && calendarPermissionStatus !== 'granted') {
      // Need to request permissions first
      await handleRequestPermissions();
      return;
    }

    const newSettings = { ...localSettings, syncEnabled: enabled };
    setLocalSettings(newSettings);
    
    // Auto-save settings
    try {
      await updateCalendarSettings({ syncEnabled: enabled });
    } catch (error) {
      console.error('Error updating sync setting:', error);
      // Revert local state on error
      setLocalSettings(localSettings);
    }
  };

  const handleShowEventsChange = async (showEvents) => {
    const newSettings = { ...localSettings, showCalendarEvents: showEvents };
    setLocalSettings(newSettings);
    
    // Auto-save settings
    try {
      await updateCalendarSettings({ showCalendarEvents: showEvents });
    } catch (error) {
      console.error('Error updating show events setting:', error);
      setLocalSettings(localSettings);
    }
  };

  const handleAutoSyncChange = async (autoSync) => {
    const newSettings = { ...localSettings, autoSyncTimeBlocks: autoSync };
    setLocalSettings(newSettings);
    
    try {
      await updateCalendarSettings({ autoSyncTimeBlocks: autoSync });
    } catch (error) {
      console.error('Error updating auto sync setting:', error);
      setLocalSettings(localSettings);
    }
  };

  const handleCalendarSelect = async (calendarId) => {
    const newSettings = { ...localSettings, selectedCalendarId: calendarId };
    setLocalSettings(newSettings);
    
    try {
      await updateCalendarSettings({ selectedCalendarId: calendarId });
    } catch (error) {
      console.error('Error updating selected calendar:', error);
      setLocalSettings(localSettings);
    }
  };

  const renderPermissionSection = () => {
    const hasPermission = calendarPermissionStatus === 'granted';
    
    return (
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.sectionHeader}>
          <Ionicons 
            name={hasPermission ? "checkmark-circle" : "alert-circle"} 
            size={scaleWidth(20)} 
            color={hasPermission ? "#4CAF50" : "#FF9800"} 
          />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Calendar Access
          </Text>
        </View>
        
        <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
          {hasPermission 
            ? "LifeCompass has access to your device calendar"
            : "Calendar access is required to sync time blocks and view calendar events"
          }
        </Text>
        
        {!hasPermission && (
          <TouchableOpacity
            style={[
              styles.permissionButton,
              { backgroundColor: theme.primary },
              ensureAccessibleTouchTarget(scaleWidth(120), scaleHeight(36))
            ]}
            onPress={handleRequestPermissions}
            disabled={isRequestingPermission}
          >
            {isRequestingPermission ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.permissionButtonText}>Grant Access</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderIntegrationSection = () => {
    const hasPermission = calendarPermissionStatus === 'granted';
    
    return (
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>
              Show Calendar Events
            </Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              Display your calendar events alongside time blocks
            </Text>
          </View>
          <Switch
            value={localSettings.showCalendarEvents}
            onValueChange={handleShowEventsChange}
            trackColor={{ false: theme.border, true: theme.primary + '50' }}
            thumbColor={localSettings.showCalendarEvents ? theme.primary : theme.textSecondary}
            disabled={!hasPermission}
          />
        </View>
        
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: theme.text }]}>
              Sync Time Blocks
            </Text>
            <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
              Automatically sync your time blocks to your device calendar
            </Text>
          </View>
          <Switch
            value={localSettings.syncEnabled}
            onValueChange={handleSyncEnabledChange}
            trackColor={{ false: theme.border, true: theme.primary + '50' }}
            thumbColor={localSettings.syncEnabled ? theme.primary : theme.textSecondary}
            disabled={!hasPermission}
          />
        </View>
        
        {localSettings.syncEnabled && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: theme.text }]}>
                  Auto-Sync New Time Blocks
                </Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Automatically sync new time blocks to calendar when created
                </Text>
              </View>
              <Switch
                value={localSettings.autoSyncTimeBlocks}
                onValueChange={handleAutoSyncChange}
                trackColor={{ false: theme.border, true: theme.primary + '50' }}
                thumbColor={localSettings.autoSyncTimeBlocks ? theme.primary : theme.textSecondary}
              />
            </View>
          </>
        )}
      </View>
    );
  };

  const renderCalendarSelection = () => {
    const hasPermission = calendarPermissionStatus === 'granted';
    
    if (!hasPermission || !localSettings.syncEnabled) {
      return null;
    }

    return (
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={scaleWidth(20)} color={theme.text} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Calendar Selection
          </Text>
        </View>
        
        <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
          Choose which calendar to sync your time blocks to
        </Text>
        
        {isLoadingCalendars ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading calendars...
            </Text>
          </View>
        ) : (
          <View style={styles.calendarList}>
            {availableCalendars.map((calendar) => (
              <TouchableOpacity
                key={calendar.id}
                style={[
                  styles.calendarItem,
                  { 
                    backgroundColor: localSettings.selectedCalendarId === calendar.id 
                      ? theme.primary + '20' 
                      : 'transparent',
                    borderColor: theme.border
                  }
                ]}
                onPress={() => handleCalendarSelect(calendar.id)}
              >
                <View style={styles.calendarInfo}>
                  <View style={[
                    styles.calendarColorDot,
                    { backgroundColor: calendar.color || theme.primary }
                  ]} />
                  <View style={styles.calendarDetails}>
                    <Text style={[styles.calendarTitle, { color: theme.text }]}>
                      {calendar.title}
                    </Text>
                    <Text style={[styles.calendarSource, { color: theme.textSecondary }]}>
                      {calendar.source?.name || 'Local'}
                      {calendar.isPrimary && ' • Primary'}
                    </Text>
                  </View>
                </View>
                {localSettings.selectedCalendarId === calendar.id && (
                  <Ionicons name="checkmark" size={scaleWidth(20)} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderStatusInfo = () => {
    if (!integrationStatus) return null;

    const { isDevBuild } = integrationStatus;
    
    if (!isDevBuild) {
      return (
        <View style={[styles.statusBanner, { backgroundColor: '#FFF3E0', borderColor: '#FF9800' }]}>
          <Ionicons name="information-circle" size={scaleWidth(20)} color="#FF9800" />
          <Text style={[styles.statusText, { color: '#E65100' }]}>
            Calendar integration will be fully active when you create a development build with the calendar features included.
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.closeButton, ensureAccessibleTouchTarget(44, 44)]}
            onPress={onClose}
          >
            <Ionicons name="close" size={scaleWidth(24)} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Calendar Settings
          </Text>
          
          <View style={{ width: 44 }} /> {/* Spacer for centering */}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderStatusInfo()}
          {renderPermissionSection()}
          {renderIntegrationSection()}
          {renderCalendarSelection()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(16),
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: scaleWidth(20),
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: scaleWidth(16),
    marginBottom: scaleHeight(20),
    borderRadius: scaleWidth(12),
    borderWidth: 1,
  },
  statusText: {
    flex: 1,
    marginLeft: scaleWidth(12),
    fontSize: scaleFontSize(14),
    lineHeight: 20,
  },
  section: {
    borderRadius: scaleWidth(12),
    padding: scaleWidth(16),
    marginBottom: scaleHeight(16),
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleHeight(8),
  },
  sectionTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    marginLeft: scaleWidth(8),
  },
  sectionDescription: {
    fontSize: scaleFontSize(14),
    lineHeight: 20,
    marginBottom: scaleHeight(16),
  },
  permissionButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(8),
    borderRadius: scaleWidth(8),
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(14),
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaleHeight(8),
  },
  settingInfo: {
    flex: 1,
    marginRight: scaleWidth(16),
  },
  settingTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '500',
    marginBottom: scaleHeight(4),
  },
  settingDescription: {
    fontSize: scaleFontSize(13),
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: scaleHeight(12),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleHeight(16),
  },
  loadingText: {
    marginLeft: scaleWidth(12),
    fontSize: scaleFontSize(14),
  },
  calendarList: {
    gap: scaleHeight(8),
  },
  calendarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scaleWidth(12),
    borderRadius: scaleWidth(8),
    borderWidth: 1,
  },
  calendarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  calendarColorDot: {
    width: scaleWidth(12),
    height: scaleWidth(12),
    borderRadius: scaleWidth(6),
    marginRight: scaleWidth(12),
  },
  calendarDetails: {
    flex: 1,
  },
  calendarTitle: {
    fontSize: scaleFontSize(15),
    fontWeight: '500',
    marginBottom: scaleHeight(2),
  },
  calendarSource: {
    fontSize: scaleFontSize(13),
  },
};

export default CalendarSettingsModal;