// src/components/ai/AIModals/AINotificationSettingsModal.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useAIAssistant } from '../../../context/AIAssistantContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const CREDIT_NOTIFICATIONS_KEY = 'creditNotificationsEnabled';
const LOW_CREDIT_THRESHOLD_KEY = 'lowCreditThreshold';
const DEFAULT_CREDIT_THRESHOLD = 5;

/**
 * AINotificationSettingsModal - Modal for configuring notification settings
 */
const AINotificationSettingsModal = ({ 
  visible = false, 
  onClose
}) => {
  const { theme } = useTheme();
  const { state, dispatch, showToast } = useAIAssistant();
  
  // Local state for settings
  const [creditNotificationsEnabled, setCreditNotificationsEnabled] = useState(
    state.credits.creditNotificationsEnabled
  );
  const [lowCreditThreshold, setLowCreditThreshold] = useState(
    state.credits.lowCreditThreshold
  );
  
  // Update local state when context state changes
  useEffect(() => {
    setCreditNotificationsEnabled(state.credits.creditNotificationsEnabled);
    setLowCreditThreshold(state.credits.lowCreditThreshold);
  }, [state.credits.creditNotificationsEnabled, state.credits.lowCreditThreshold]);
  
  // Handle saving settings
  const handleSaveSettings = async () => {
    try {
      // Save notification settings to AsyncStorage
      await AsyncStorage.setItem(CREDIT_NOTIFICATIONS_KEY, creditNotificationsEnabled.toString());
      await AsyncStorage.setItem(LOW_CREDIT_THRESHOLD_KEY, lowCreditThreshold.toString());
      
      // Update state in context
      dispatch({ 
        type: 'SET_CREDIT_NOTIFICATIONS_ENABLED', 
        payload: creditNotificationsEnabled 
      });
      dispatch({ 
        type: 'SET_LOW_CREDIT_THRESHOLD', 
        payload: lowCreditThreshold 
      });
      
      // Close modal
      onClose();
      
      // Show toast notification
      showToast('Notification settings saved');
      
    } catch (error) {
      console.error('Error saving notification settings:', error);
      showToast('Failed to save settings');
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Notification Settings
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.notificationSettingsContent}>
            {/* Enable/disable credit notifications */}
            <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <View style={styles.settingLabelContainer}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  Credit Low Warnings
                </Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                  Get notified when your AI credits are running low
                </Text>
              </View>
              <Switch
                value={creditNotificationsEnabled}
                onValueChange={setCreditNotificationsEnabled}
                trackColor={{ false: '#767577', true: theme.primary + '70' }}
                thumbColor={creditNotificationsEnabled ? theme.primary : '#f4f3f4'}
              />
            </View>
            
            {/* Credit threshold setting */}
            {creditNotificationsEnabled && (
              <View style={styles.thresholdSetting}>
                <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 8 }]}>
                  Low Credit Threshold
                </Text>
                <Text style={[styles.settingDescription, { color: theme.textSecondary, marginBottom: 16 }]}>
                  Get warned when credits fall below this amount
                </Text>
                
                <View style={styles.thresholdOptions}>
                  {[3, 5, 10].map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.thresholdOption,
                        lowCreditThreshold === value && { 
                          backgroundColor: theme.primary + '30',
                          borderColor: theme.primary
                        },
                        { borderColor: theme.border }
                      ]}
                      onPress={() => setLowCreditThreshold(value)}
                    >
                      <Text style={[
                        styles.thresholdOptionText, 
                        { color: theme.text },
                        lowCreditThreshold === value && { fontWeight: 'bold' }
                      ]}>
                        {value} credits
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
          
          <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSaveSettings}
            >
              <Text style={styles.saveButtonText}>
                Save Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationSettingsContent: {
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  settingLabelContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  thresholdSetting: {
    marginTop: 8,
  },
  thresholdOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  thresholdOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  thresholdOptionText: {
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default AINotificationSettingsModal;