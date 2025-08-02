// src/screens/ProjectDetailsScreen/components/TaskListView.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TaskItem from '../../../components/TaskItem';
import { FREE_PLAN_LIMITS } from '../../../services/SubscriptionService';

const TaskListView = ({ 
  tasks, 
  color, 
  theme, 
  calculateProgress, 
  handleViewTask, 
  handleToggleTask, 
  handleEditTask, 
  handleDeleteTask, 
  setShowAddTaskModal,
  setCurrentTask,
  setIsEditingTask,
  isPro = false
}) => {
  // Get the remaining tasks count for display in button
  const getRemainingTasksText = () => {
    if (isPro) return "Add Task"; // Pro users just see "Add Task"
    
    const remainingTasks = FREE_PLAN_LIMITS.MAX_TASKS_PER_PROJECT - tasks.length;
    if (remainingTasks <= 0) return "Task Limit Reached";
    return `Add Task (${remainingTasks} left)`;
  };

  // Check if user can add more tasks
  const canAddMoreTasks = () => {
    if (isPro) return true;
    return tasks.length < FREE_PLAN_LIMITS.MAX_TASKS_PER_PROJECT;
  };

  // Handle add task button press
  const handleAddTaskPress = () => {
    if (!canAddMoreTasks()) {
      // If we can't add more tasks, the parent component will handle showing the banner
      setShowAddTaskModal();
      return;
    }
    
    setCurrentTask(null);
    setIsEditingTask(false);
    setShowAddTaskModal(true);
  };

  return (
    <View style={[styles.taskListContainer, { backgroundColor: theme.card }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Tasks</Text>
        <TouchableOpacity 
          style={[styles.addButton, { 
            backgroundColor: color,
            // Dim the button if limit is reached
            opacity: !isPro && tasks.length >= FREE_PLAN_LIMITS.MAX_TASKS_PER_PROJECT ? 0.7 : 1
          }]}
          onPress={handleAddTaskPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Add task"
          accessibilityHint={!canAddMoreTasks() ? "Task limit reached for free users" : "Add a new task to this project"}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>{getRemainingTasksText()}</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressSection}>
        <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
          Overall Progress: {calculateProgress()}%
        </Text>
        <View style={[styles.progressBar, { backgroundColor: `${color}20` }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${calculateProgress()}%`, backgroundColor: color }
            ]}
          />
        </View>
      </View>
      
      <View style={styles.tasksList}>
        {tasks.length === 0 ? (
          <View style={styles.emptyTasksContainer}>
            <Ionicons name="list" size={40} color={theme.textSecondary} />
            <Text style={[styles.emptyTasksText, { color: theme.textSecondary }]}>
              No tasks added yet
            </Text>
          </View>
        ) : (
          tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              color={color}
              onToggle={() => handleToggleTask(task.id)}
              onDelete={() => handleDeleteTask(task.id)}
              onEdit={() => handleEditTask(task)}
              onPress={() => handleViewTask(task)}
              theme={theme}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskListContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  tasksList: {
    flex: 1,
  },
  emptyTasksContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTasksText: {
    marginTop: 12,
    fontSize: 14,
  },
});

export default TaskListView;