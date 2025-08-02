// src/screens/ProjectDetailsScreen/components/TaskDetailModal.js
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

const TaskDetailModal = ({ 
  showTaskDetailModal,
  setShowTaskDetailModal,
  selectedTask,
  handleToggleTask,
  handleChangeTaskStatus,
  handleDeleteTask,
  handleEditTask,
  theme,
  color
}) => {
  if (!selectedTask) return null;
  
  // Create a local state variable for the selected task
  const [localTask, setLocalTask] = React.useState(selectedTask);
  
  // Update local task when selectedTask changes
  React.useEffect(() => {
    setLocalTask(selectedTask);
  }, [selectedTask]);
  
  return (
    <Modal
      visible={showTaskDetailModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTaskDetailModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.taskDetailContent, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Task Details</Text>
            <TouchableOpacity onPress={() => setShowTaskDetailModal(false)}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.taskDetailScroll}>
            <View style={styles.taskDetailHeader}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: 
                  localTask.status === 'todo' ? '#E0E0E0' : 
                  localTask.status === 'in_progress' ? '#64B5F6' : 
                  '#81C784'
                }
              ]}>
                <Text style={styles.statusText}>
                  {localTask.status === 'todo' ? 'To Do' : 
                   localTask.status === 'in_progress' ? 'In Progress' : 
                   'Done'}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.completionToggle,
                  localTask.completed && { backgroundColor: color }
                ]}
                onPress={() => {
                  handleToggleTask(localTask.id);
                  setLocalTask({
                    ...localTask,
                    completed: !localTask.completed,
                    status: !localTask.completed ? 'done' : 'todo'
                  });
                }}
              >
                {localTask.completed && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.taskDetailTitle, { color: theme.text }]}>
              {localTask.title}
            </Text>
            
            {localTask.description ? (
              <View style={styles.taskDetailSection}>
                <Text style={[styles.taskDetailSectionTitle, { color: theme.textSecondary }]}>
                  Description
                </Text>
                <Text style={[styles.taskDetailDescription, { color: theme.text }]}>
                  {localTask.description}
                </Text>
              </View>
            ) : (
              <View style={styles.taskDetailSection}>
                <Text style={[styles.taskDetailSectionTitle, { color: theme.textSecondary }]}>
                  No Description
                </Text>
                <Text style={[styles.noDescriptionText, { color: theme.textSecondary }]}>
                  This task doesn't have a description yet.
                </Text>
              </View>
            )}
            
            <View style={styles.taskDetailSection}>
              <Text style={[styles.taskDetailSectionTitle, { color: theme.textSecondary }]}>
                Status
              </Text>
              <View style={styles.statusButtonsContainer}>
                <TouchableOpacity 
                  style={[
                    styles.statusButton,
                    localTask.status === 'todo' && [
                      styles.activeStatusButton,
                      { borderColor: '#E0E0E0', backgroundColor: '#F5F5F5' }
                    ]
                  ]}
                  onPress={() => {
                    handleChangeTaskStatus(localTask.id, 'todo');
                    setLocalTask({
                      ...localTask,
                      status: 'todo',
                      completed: false
                    });
                  }}
                >
                  <Text style={[
                    styles.statusButtonText,
                    localTask.status === 'todo' && styles.activeStatusButtonText
                  ]}>To Do</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.statusButton,
                    localTask.status === 'in_progress' && [
                      styles.activeStatusButton,
                      { borderColor: '#64B5F6', backgroundColor: '#E3F2FD' }
                    ]
                  ]}
                  onPress={() => {
                    handleChangeTaskStatus(localTask.id, 'in_progress');
                    setLocalTask({
                      ...localTask,
                      status: 'in_progress',
                      completed: false
                    });
                  }}
                >
                  <Text style={[
                    styles.statusButtonText,
                    localTask.status === 'in_progress' && styles.activeStatusButtonText
                  ]}>In Progress</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.statusButton,
                    localTask.status === 'done' && [
                      styles.activeStatusButton,
                      { borderColor: '#81C784', backgroundColor: '#E8F5E9' }
                    ]
                  ]}
                  onPress={() => {
                    handleChangeTaskStatus(localTask.id, 'done');
                    setLocalTask({
                      ...localTask,
                      status: 'done',
                      completed: true
                    });
                  }}
                >
                  <Text style={[
                    styles.statusButtonText,
                    localTask.status === 'done' && styles.activeStatusButtonText
                  ]}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.taskDetailActions}>
            <TouchableOpacity 
              style={[styles.taskDetailActionButton, { backgroundColor: theme.errorLight }]}
              onPress={() => handleDeleteTask(localTask.id)}
            >
              <Ionicons name="trash-outline" size={20} color={theme.error} />
              <Text style={[styles.taskDetailActionText, { color: theme.error }]}>
                Delete
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.taskDetailActionButton, { backgroundColor: color }]}
              onPress={() => handleEditTask(localTask)}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.taskDetailActionTextLight}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  taskDetailContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  taskDetailScroll: {
    maxHeight: 500,
  },
  taskDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  completionToggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taskDetailSection: {
    marginBottom: 16,
  },
  taskDetailSectionTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  taskDetailDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  noDescriptionText: {
    fontStyle: 'italic',
  },
  statusButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeStatusButton: {
    borderWidth: 2,
  },
  statusButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeStatusButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  taskDetailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  taskDetailActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  taskDetailActionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  taskDetailActionTextLight: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 8,
  },
});

export default TaskDetailModal;