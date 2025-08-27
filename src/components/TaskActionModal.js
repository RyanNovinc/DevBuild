// src/components/TaskActionModal.js
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TaskActionModal = ({
  visible,
  onClose,
  onScheduleTimeBlock,
  task,
  theme,
  isDarkMode = true
}) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  
  if (!task) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      {/* Backdrop with blur effect */}
      <View style={styles.backdrop}>
        <BlurView
          intensity={20}
          tint={isDarkMode ? 'dark' : 'light'}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Touch area to close modal */}
        <TouchableOpacity 
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Modal content */}
        <View style={[
          styles.modalContainer,
          {
            marginBottom: insets.bottom + 40,
          }
        ]}>
          <View style={[
            styles.modalContent,
            {
              backgroundColor: isDarkMode ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }
          ]}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.taskInfo}>
                <View style={[
                  styles.taskIcon,
                  { backgroundColor: isDarkMode ? 'rgba(0, 122, 255, 0.15)' : 'rgba(0, 122, 255, 0.1)' }
                ]}>
                  <Ionicons 
                    name="checkmark-circle-outline" 
                    size={20} 
                    color={isDarkMode ? '#007AFF' : '#007AFF'} 
                  />
                </View>
                <View style={styles.taskDetails}>
                  <Text style={[
                    styles.taskTitle,
                    { color: isDarkMode ? '#FFFFFF' : '#000000' }
                  ]} numberOfLines={2}>
                    {task.title}
                  </Text>
                  <Text style={[
                    styles.taskSubtitle,
                    { color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }
                  ]}>
                    Task Actions
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              
              {/* Schedule Time Block Action */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.primaryAction,
                  {
                    backgroundColor: isDarkMode ? 'rgba(0, 122, 255, 0.12)' : 'rgba(0, 122, 255, 0.08)',
                    borderColor: isDarkMode ? 'rgba(0, 122, 255, 0.2)' : 'rgba(0, 122, 255, 0.15)',
                  }
                ]}
                onPress={() => {
                  onScheduleTimeBlock(task);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.actionContent}>
                  <View style={[
                    styles.actionIconContainer,
                    { backgroundColor: isDarkMode ? 'rgba(0, 122, 255, 0.2)' : 'rgba(0, 122, 255, 0.15)' }
                  ]}>
                    <Ionicons 
                      name="calendar-outline" 
                      size={22} 
                      color="#007AFF" 
                    />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={[
                      styles.actionTitle,
                      { color: isDarkMode ? '#FFFFFF' : '#000000' }
                    ]}>
                      Schedule Time Block
                    </Text>
                    <Text style={[
                      styles.actionDescription,
                      { color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }
                    ]}>
                      Block time in your calendar for this task
                    </Text>
                  </View>
                  <Ionicons 
                    name="chevron-forward" 
                    size={18} 
                    color={isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'} 
                  />
                </View>
              </TouchableOpacity>

            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                }
              ]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.cancelButtonText,
                { color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' }
              ]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 2,
  },
  taskSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
  },
  actions: {
    paddingHorizontal: 20,
  },
  actionButton: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  primaryAction: {
    // Primary action specific styles handled via props
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 16,
  },
  cancelButton: {
    marginHorizontal: 20,
    marginVertical: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
});

export default TaskActionModal;