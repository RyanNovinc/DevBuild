// src/components/TaskKanbanBoard.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Safe Text component to prevent rendering errors
const SafeText = ({ children, style, ...props }) => {
  if (children === null || children === undefined) {
    return null;
  }
  
  return <Text style={style} {...props}>{children}</Text>;
};

const TaskKanbanBoard = ({ 
  tasks = [],
  theme,
  color = '#4CAF50',
  onPressTask,
  onPressAddTask,
  onUpdateTaskStatus,
  onEditTask,
  onDeleteTask,
  darkMode = false // New prop to support dark mode
}) => {
  
  // Simple, explicit task filtering
  const getTodoTasks = () => tasks.filter(task => task.status === 'todo');
  const getInProgressTasks = () => tasks.filter(task => task.status === 'in_progress');
  const getDoneTasks = () => tasks.filter(task => task.status === 'done');
  
  // Handle moving a task
  const handleMoveTask = (task, newStatus) => {
    console.log(`[TaskKanban] Moving task ${task.id} from ${task.status} to ${newStatus}`);
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(task.id, newStatus);
    }
  };
  
  // Render a single task card
  const renderTask = (task, currentStatus) => (
    <View
      key={task.id}
      style={[
        styles.taskCard, 
        { 
          backgroundColor: darkMode ? '#282828' : '#FFFFFF',
          borderColor: darkMode ? '#333333' : '#E0E0E0',
          borderWidth: 1,
        }
      ]}
    >
      {/* Color bar */}
      <View style={[styles.taskColorBar, { backgroundColor: task.color || color }]} />
      
      {/* Task content - SPLIT INTO TOUCHABLE AND NON-TOUCHABLE AREAS */}
      <View style={styles.taskContent}>
        {/* Touchable area for opening task details */}
        <TouchableOpacity 
          style={styles.taskTouchableArea}
          onPress={() => onPressTask && onPressTask(task)}
          activeOpacity={0.7}
        >
          <SafeText 
            style={[
              styles.taskTitle, 
              { color: darkMode ? '#FFFFFF' : '#333333' }
            ]} 
            numberOfLines={2}
          >
            {task.title}
          </SafeText>
          
          {task.description ? (
            <SafeText 
              style={[
                styles.taskDescription, 
                { color: darkMode ? '#AAAAAA' : '#666666' }
              ]}
              numberOfLines={2}
            >
              {task.description}
            </SafeText>
          ) : null}
        </TouchableOpacity>
        
        {/* Non-touchable action buttons area */}
        <View style={[
          styles.taskActions,
          { 
            borderTopColor: darkMode ? '#333333' : '#EEEEEE',
            backgroundColor: darkMode ? '#1E1E1E' : '#F8F8F8'
          }
        ]}>
          {/* Edit button - LEFT */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onEditTask && onEditTask(task)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons 
              name="create-outline" 
              size={14} 
              color={darkMode ? '#AAAAAA' : '#888888'} 
            />
          </TouchableOpacity>
          
          {/* Delete button - MIDDLE */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onDeleteTask && onDeleteTask(task.id)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Ionicons 
              name="trash-outline" 
              size={14} 
              color="#FF6B6B" 
            />
          </TouchableOpacity>
          
          {/* Move buttons container - RIGHT */}
          <View style={styles.moveButtonsContainer}>
            {/* Move left */}
            {currentStatus !== 'todo' && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  const targetStatus = currentStatus === 'in_progress' ? 'todo' : 'in_progress';
                  handleMoveTask(task, targetStatus);
                }}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Ionicons 
                  name="arrow-back" 
                  size={14} 
                  color={darkMode ? '#AAAAAA' : '#888888'} 
                />
              </TouchableOpacity>
            )}
            
            {/* Move right */}
            {currentStatus !== 'done' && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  const targetStatus = currentStatus === 'todo' ? 'in_progress' : 'done';
                  handleMoveTask(task, targetStatus);
                }}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Ionicons 
                  name="arrow-forward" 
                  size={14} 
                  color={darkMode ? '#AAAAAA' : '#888888'} 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
  
  // Render a column
  const renderColumn = (title, status, headerColor, columnTasks) => (
    <View 
      style={[
        styles.column,
        { 
          backgroundColor: darkMode ? '#1E1E1E' : '#FFFFFF',
          borderColor: darkMode ? '#333333' : '#E0E0E0',
          borderWidth: 1,
        }
      ]} 
      key={status}
    >
      {/* Column header */}
      <View style={[
        styles.columnHeader, 
        { 
          backgroundColor: darkMode ? '#282828' : headerColor,
          borderBottomColor: darkMode ? '#333333' : '#E0E0E0'
        }
      ]}>
        <SafeText 
          style={[
            styles.columnTitle,
            { color: darkMode ? '#FFFFFF' : '#333333' }
          ]}
        >
          {title}
        </SafeText>
        <View style={[
          styles.columnCount,
          { backgroundColor: darkMode ? '#383838' : 'rgba(255,255,255,0.7)' }
        ]}>
          <SafeText 
            style={[
              styles.columnCountText,
              { color: darkMode ? '#CCCCCC' : '#333333' }
            ]}
          >
            {columnTasks.length}
          </SafeText>
        </View>
      </View>
      
      {/* Column content */}
      <ScrollView 
        style={styles.columnContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.columnScrollContent}
      >
        {columnTasks.length > 0 ? (
          columnTasks.map(task => renderTask(task, status))
        ) : (
          <View style={styles.emptyColumn}>
            <SafeText 
              style={[
                styles.emptyColumnText, 
                { color: darkMode ? '#888888' : '#999999' }
              ]}
            >
              No tasks
            </SafeText>
          </View>
        )}
        
        {/* Add task button (only in To Do column) */}
        {status === 'todo' && onPressAddTask && (
          <TouchableOpacity 
            style={[
              styles.addTaskButton, 
              { borderColor: darkMode ? '#444444' : '#CCCCCC' }
            ]}
            onPress={onPressAddTask}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="add" 
              size={16} 
              color={darkMode ? '#AAAAAA' : '#888888'} 
            />
            <SafeText 
              style={[
                styles.addTaskButtonText, 
                { color: darkMode ? '#AAAAAA' : '#888888' }
              ]}
            >
              Add Task
            </SafeText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
  
  // Get tasks for each column
  const todoTasks = getTodoTasks();
  const inProgressTasks = getInProgressTasks();
  const doneTasks = getDoneTasks();
  
  console.log('[TaskKanban] Task distribution:', {
    todo: todoTasks.length,
    inProgress: inProgressTasks.length,
    done: doneTasks.length,
    total: tasks.length
  });
  
  return (
    <View style={[
      styles.container,
      { backgroundColor: darkMode ? '#121212' : '#F5F5F5' }
    ]}>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boardContent}
        style={styles.boardScroll}
      >
        {renderColumn('To Do', 'todo', '#F5F5F5', todoTasks)}
        {renderColumn('In Progress', 'in_progress', '#F5F5F5', inProgressTasks)}
        {renderColumn('Done', 'done', '#F5F5F5', doneTasks)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  boardScroll: {
    flex: 1,
  },
  boardContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
    paddingTop: 10,
  },
  column: {
    width: 280,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  columnCount: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  columnCountText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  columnContent: {
    flex: 1,
    padding: 12,
  },
  columnScrollContent: {
    flexGrow: 1,
  },
  taskCard: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  taskColorBar: {
    width: 4,
  },
  taskContent: {
    flex: 1,
  },
  // Touchable area for task details (top part of card)
  taskTouchableArea: {
    padding: 12,
    paddingBottom: 6, // Less bottom padding since actions will have their own space
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  // Non-touchable actions area (bottom part of card)
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 4,
    borderTopWidth: 1,
  },
  moveButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6, // Increased touch area
    marginHorizontal: 2,
  },
  emptyColumn: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyColumnText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  addTaskButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default TaskKanbanBoard;