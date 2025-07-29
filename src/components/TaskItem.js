// src/components/TaskItem.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableHighlight
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const TaskItem = ({ 
  task, 
  color, 
  onToggle, 
  onDelete, 
  onEdit,
  onPress,
  theme: propTheme 
}) => {
  // Use passed theme or context theme
  const contextTheme = useTheme();
  const theme = propTheme || contextTheme.theme;
  
  return (
    <TouchableHighlight 
      style={styles.touchableContainer}
      onPress={() => onPress && onPress(task)}
      underlayColor={theme.cardElevated}
      activeOpacity={0.7}
    >
      <View 
        style={[
          styles.container, 
          { 
            backgroundColor: theme.inputBackground,
            opacity: task.completed ? 0.7 : 1
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => onToggle(task.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {task.completed ? (
            <View style={[styles.checkboxChecked, { backgroundColor: color }]}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          ) : (
            <View style={[styles.checkboxUnchecked, { borderColor: color }]} />
          )}
        </TouchableOpacity>
        
        <View style={styles.contentContainer}>
          <Text 
            style={[
              styles.taskTitle, 
              { color: theme.text },
              task.completed && styles.completedText
            ]}
          >
            {task.title}
          </Text>
          
          {task.description ? (
            <Text 
              style={[
                styles.taskDescription, 
                { color: theme.textSecondary },
                task.completed && styles.completedText
              ]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          ) : null}
          
          {/* Status badge */}
          {task.status && (
            <View style={[
              styles.statusBadge,
              { 
                backgroundColor: 
                  task.status === 'todo' ? '#f0f0f0' : 
                  task.status === 'in_progress' ? '#e3f2fd' : 
                  '#e8f5e9'
              }
            ]}>
              <Text style={[
                styles.statusText,
                { 
                  color: 
                    task.status === 'todo' ? '#757575' : 
                    task.status === 'in_progress' ? '#1976d2' : 
                    '#2e7d32'
                }
              ]}>
                {task.status === 'todo' ? 'To Do' : 
                 task.status === 'in_progress' ? 'In Progress' : 
                 'Done'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.actionsContainer}>
          {onEdit && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onEdit(task)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onDelete(task.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={theme.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  touchableContainer: {
    borderRadius: 8,
    marginBottom: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxUnchecked: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  taskDescription: {
    fontSize: 13,
    marginBottom: 5,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginLeft: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TaskItem;