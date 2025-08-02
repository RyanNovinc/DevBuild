// src/screens/TimeBlockScreen/TaskSelector.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TaskSelector = ({ 
  visible, 
  onClose, 
  onSelectTask, 
  selectedTask,
  tasks,
  domainColor,
  theme,
  isDarkMode
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[
        styles.modalOverlay, 
        { backgroundColor: 'rgba(0,0,0,0.5)' }
      ]}>
        <View style={[
          styles.modalContainer, 
          { 
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border
          }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Select Task
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Allow None option to clear selection */}
            <TouchableOpacity 
              style={[
                styles.taskItem,
                { 
                  backgroundColor: selectedTask === null 
                    ? `${domainColor}15` 
                    : theme.card,
                  borderWidth: 1,
                  borderColor: selectedTask === null
                    ? domainColor
                    : theme.border
                }
              ]}
              onPress={() => onSelectTask(null)}
            >
              <Ionicons 
                name="close-circle-outline" 
                size={20} 
                color={selectedTask === null ? domainColor : theme.textSecondary} 
              />
              <Text style={[
                styles.taskItemText, 
                { 
                  color: selectedTask === null 
                    ? domainColor 
                    : theme.text,
                  fontWeight: selectedTask === null ? 'bold' : 'normal'
                }
              ]}>
                None - No specific task
              </Text>
            </TouchableOpacity>
            
            {/* Tasks list */}
            {tasks.length > 0 ? (
              tasks.map(task => (
                <TouchableOpacity 
                  key={task.id}
                  style={[
                    styles.taskItem,
                    { 
                      backgroundColor: selectedTask?.id === task.id 
                        ? `${domainColor}15` 
                        : theme.card,
                      borderWidth: 1,
                      borderColor: selectedTask?.id === task.id
                        ? domainColor
                        : theme.border
                    }
                  ]}
                  onPress={() => onSelectTask(task)}
                >
                  <Ionicons 
                    name="checkbox-outline" 
                    size={20} 
                    color={selectedTask?.id === task.id ? domainColor : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.taskItemText, 
                    { 
                      color: selectedTask?.id === task.id 
                        ? domainColor 
                        : theme.text,
                      fontWeight: selectedTask?.id === task.id ? 'bold' : 'normal'
                    }
                  ]}>
                    {task.title}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={[styles.noTasksMessage, { borderColor: theme.border }]}>
                <Text style={[styles.noTasksText, { color: theme.textSecondary }]}>
                  No tasks available for this project. You can create tasks in the Projects tab.
                </Text>
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity 
            style={[
              styles.modalDoneButton, 
              { 
                backgroundColor: theme.primary,
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: isDarkMode ? '#FFFFFF' : 'transparent'
              }
            ]}
            onPress={onClose}
          >
            <Text style={[
              styles.modalDoneButtonText, 
              { color: isDarkMode ? '#000000' : '#FFFFFF' }
            ]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E2E3',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E2E3',
    backgroundColor: '#F8F9FA',
  },
  taskItemText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  noTasksMessage: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E2E3',
    borderRadius: 8,
    marginBottom: 16,
  },
  noTasksText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  modalDoneButton: {
    backgroundColor: '#4285F4',
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  modalDoneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default TaskSelector;