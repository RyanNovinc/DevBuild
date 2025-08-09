// src/components/KanbanBoard.js
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Safe Text component to prevent rendering errors
const SafeText = ({ children, style, ...props }) => {
  if (children === null || children === undefined) {
    return null;
  }
  
  return <Text style={style} {...props}>{children}</Text>;
};

const KanbanBoard = ({ 
  projects = [],  // Array of projects to display
  tasks = [],     // Optional array of tasks  
  theme,          // Theme object for styling
  onPressProject, // Function called when a project is pressed
  onPressTask,    // Function called when a task is pressed
  onPressAddProject, // Function called when add project is pressed
  onPressAddTask, // Function called when add task is pressed
  onUpdateProjectProgress, // Function to update project progress state
  onUpdateTaskStatus, // Function to update task status
  onEditTask,     // Function to edit a task
  onDeleteTask,   // Function to delete a task
  containerStyle, // Optional style override for container
  isProjectLevel = false, // Whether this is a project-level board
  filterBy = null, // Optional filter (e.g., by goal, by domain)
  color = '#4CAF50', // Color for styling
  darkMode = true, // Default to dark mode
  allProjects = [], // All projects for color inheritance
  allGoals = [] // All goals for color inheritance
}) => {
  const [draggingItem, setDraggingItem] = useState(null);
  
  // Refs for scroll views to maintain scroll positions
  const horizontalScrollRef = useRef(null);
  const columnScrollRefs = useRef({
    todo: null,
    in_progress: null,
    done: null
  });
  
  // Track scroll positions
  const scrollPositions = useRef({
    horizontal: 0,
    todo: 0,
    in_progress: 0,
    done: 0
  });
  
  // Function to get the color for a task based on its project's goal's color
  const getTaskColor = (task) => {
    if (!task.projectId) return color;
    
    // Find the project this task belongs to
    const project = allProjects.find(p => p.id === task.projectId);
    if (!project || !project.goalId) return color;
    
    // Find the goal this project belongs to
    const goal = allGoals.find(g => g.id === project.goalId);
    if (!goal) return color;
    
    // Return the goal's color, or the project's color, or the default color
    return goal.color || project.color || color;
  };
  
  // Get column items based on status
  const getItemsByStatus = (status) => {
    if (isProjectLevel) {
      // Project level - filter projects by their status first, then progress
      return projects.filter(project => {
        if (filterBy && filterBy.goalId && project.goalId !== filterBy.goalId) return false;
        
        // First check if the project has an explicit status property
        if (project.status) {
          return project.status === status;
        }
        
        // Fall back to progress-based status for backward compatibility
        if (status === 'todo') return project.progress === 0;
        if (status === 'in_progress') return project.progress > 0 && project.progress < 100;
        if (status === 'done') return project.progress === 100;
        
        return false;
      });
    } else {
      // Task level - filter tasks by their status
      return tasks.filter(task => {
        // More explicit status checking
        const taskStatus = task.status || (task.completed ? 'done' : 'todo');
        return taskStatus === status;
      });
    }
  };
  
  // Scroll event handlers to track positions
  const handleHorizontalScroll = useCallback((event) => {
    scrollPositions.current.horizontal = event.nativeEvent.contentOffset.x;
  }, []);

  const handleColumnScroll = useCallback((status, event) => {
    scrollPositions.current[status] = event.nativeEvent.contentOffset.y;
  }, []);


  // Handle moving a project to a different status
  const handleMoveProject = (project, newStatus) => {
    if (!onUpdateProjectProgress) return;
    
    // Convert status to status indicator value - this is NOT a progress percentage
    // It's just a signal for the AppContext to change the status
    let statusIndicator;
    if (newStatus === 'todo') statusIndicator = 0;
    else if (newStatus === 'in_progress') statusIndicator = 50;
    else if (newStatus === 'done') statusIndicator = 100;
    
    console.log(`Moving project "${project.title}" to ${newStatus} status`);
    
    // Call the update function from props with the status indicator
    onUpdateProjectProgress(project.id, statusIndicator);
  };
  
  // Handle moving a task to a different status
  const handleMoveTask = (task, newStatus) => {
    if (!onUpdateTaskStatus) return;
    
    // Call the update function from props
    onUpdateTaskStatus(task.id, newStatus);
  };
  
  // Function to render a column
  const renderColumn = (title, status, headerColor) => {
    const items = getItemsByStatus(status);
    
    return (
      <View style={[
        styles.column, 
        { 
          backgroundColor: darkMode ? '#1E1E1E' : '#FFFFFF',
          borderColor: darkMode ? '#333333' : '#E0E0E0',
          borderWidth: 1
        }
      ]}>
        <View style={[
          styles.columnHeader, 
          { 
            backgroundColor: darkMode ? '#282828' : headerColor,
            borderBottomColor: darkMode ? '#333333' : '#E0E0E0',
            borderBottomWidth: 1
          }
        ]}>
          <SafeText style={[
            styles.columnTitle,
            { color: darkMode ? '#FFFFFF' : '#333333' }
          ]}>
            {title}
          </SafeText>
          <View style={[
            styles.columnCount,
            { backgroundColor: darkMode ? '#383838' : 'rgba(255,255,255,0.7)' }
          ]}>
            <SafeText style={[
              styles.columnCountText,
              { color: darkMode ? '#CCCCCC' : '#333333' }
            ]}>
              {items.length}
            </SafeText>
          </View>
        </View>
        
        <ScrollView 
          ref={(ref) => { columnScrollRefs.current[status] = ref; }}
          style={styles.columnContent}
          showsVerticalScrollIndicator={false}
          onScroll={(event) => handleColumnScroll(status, event)}
          scrollEventThrottle={16}
        >
          {items.length > 0 ? (
            items.map((item, index) => (
              <TouchableOpacity
                key={item.id || index}
                style={[
                  styles.item, 
                  { 
                    backgroundColor: darkMode ? '#282828' : '#FFFFFF',
                    borderColor: darkMode ? '#333333' : '#E0E0E0',
                    borderWidth: 1
                  }
                ]}
                onPress={() => {
                  if (isProjectLevel && onPressProject) {
                    onPressProject(item);
                  } else if (!isProjectLevel && onPressTask) {
                    onPressTask(item);
                  }
                }}
                onLongPress={() => {
                  if (isProjectLevel) {
                    Alert.alert(
                      'Move Project',
                      `Move "${item.title}" to a different status?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        ...(['todo', 'in_progress', 'done']
                          .filter(s => s !== status)
                          .map(newStatus => ({
                            text: newStatus === 'todo' ? 'To Do' : 
                                 newStatus === 'in_progress' ? 'In Progress' : 'Done',
                            onPress: () => handleMoveProject(item, newStatus)
                          }))
                        )
                      ]
                    );
                  } else {
                    // Task long press - show move options
                    Alert.alert(
                      'Move Task',
                      `Move "${item.title}" to a different status?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        ...(['todo', 'in_progress', 'done']
                          .filter(s => s !== status)
                          .map(newStatus => ({
                            text: newStatus === 'todo' ? 'To Do' : 
                                 newStatus === 'in_progress' ? 'In Progress' : 'Done',
                            onPress: () => handleMoveTask(item, newStatus)
                          }))
                        )
                      ]
                    );
                  }
                }}
                delayLongPress={500}
                activeOpacity={0.7}
              >
                {/* Left color bar */}
                <View style={[
                  styles.itemColorBar, 
                  { backgroundColor: isProjectLevel ? (item.color || color) : getTaskColor(item) }
                ]} />
                
                <View style={styles.itemContent}>
                  {/* Main content area */}
                  <View style={styles.itemTouchableArea}>
                    <SafeText 
                      style={[
                        styles.itemTitle, 
                        { color: darkMode ? '#FFFFFF' : '#333333' }
                      ]}
                      numberOfLines={2}
                    >
                      {item.title}
                    </SafeText>
                    
                    {/* Show description for all items if available */}
                    {item.description && (
                      <SafeText 
                        style={[
                          styles.itemDescription, 
                          { color: darkMode ? '#AAAAAA' : '#666666' }
                        ]}
                        numberOfLines={2}
                      >
                        {item.description}
                      </SafeText>
                    )}
                    
                    {/* Show meta info for projects */}
                    {isProjectLevel && (
                      <View style={styles.projectMeta}>
                        {item.dueDate && (
                          <View style={styles.metaItem}>
                            <Ionicons 
                              name="calendar-outline" 
                              size={12} 
                              color={darkMode ? '#AAAAAA' : '#888888'} 
                            />
                            <SafeText style={[
                              styles.metaText, 
                              { color: darkMode ? '#AAAAAA' : '#888888' }
                            ]}>
                              {new Date(item.dueDate).toLocaleDateString()}
                            </SafeText>
                          </View>
                        )}
                        
                        {/* Progress bar for projects */}
                        <View style={styles.progressContainer}>
                          <View style={[
                            styles.progressBar, 
                            { backgroundColor: darkMode ? '#444444' : '#EEEEEE' }
                          ]}>
                            <View
                              style={[
                                styles.progressFill,
                                { 
                                  width: `${item.progress || 0}%`, 
                                  backgroundColor: isProjectLevel ? (item.color || color) : getTaskColor(item) 
                                }
                              ]}
                            />
                          </View>
                          <SafeText style={[
                            styles.progressText, 
                            { color: darkMode ? '#AAAAAA' : '#888888' }
                          ]}>
                            {item.progress || 0}%
                          </SafeText>
                        </View>
                      </View>
                    )}
                  </View>
                  
                  {/* Action buttons */}
                  <View style={[
                    styles.itemActions,
                    {
                      borderTopColor: darkMode ? '#333333' : '#EEEEEE',
                      borderTopWidth: 1,
                      backgroundColor: darkMode ? '#1E1E1E' : '#F8F8F8',
                      // For todo items, align content to the right so the arrow appears on the right
                      justifyContent: status === 'todo' ? 'flex-end' : 'space-between'
                    }
                  ]}>
                    {/* Move left button */}
                    {status !== 'todo' && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          const targetStatus = status === 'in_progress' ? 'todo' : 'in_progress';
                          if (isProjectLevel) {
                            handleMoveProject(item, targetStatus);
                          } else {
                            handleMoveTask(item, targetStatus);
                          }
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
                    
                    {/* Edit button (for tasks only) */}
                    {!isProjectLevel && onEditTask && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          onEditTask(item);
                        }}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                      >
                        <Ionicons 
                          name="create-outline" 
                          size={14} 
                          color={darkMode ? '#AAAAAA' : '#888888'} 
                        />
                      </TouchableOpacity>
                    )}
                    
                    {/* Delete button (for tasks only) */}
                    {!isProjectLevel && onDeleteTask && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          onDeleteTask(item.id);
                        }}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                      >
                        <Ionicons name="trash-outline" size={14} color="#FF6B6B" />
                      </TouchableOpacity>
                    )}
                    
                    {/* Move right button */}
                    {status !== 'done' && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          const targetStatus = status === 'todo' ? 'in_progress' : 'done';
                          if (isProjectLevel) {
                            handleMoveProject(item, targetStatus);
                          } else {
                            handleMoveTask(item, targetStatus);
                          }
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
              </TouchableOpacity>
            ))
          ) : (
            <SafeText style={[
              styles.emptyText, 
              { color: darkMode ? '#888888' : '#999999' }
            ]}>
              No items
            </SafeText>
          )}
          
          {/* Add button - only for the first column */}
          {status === 'todo' && (
            <TouchableOpacity 
              style={[
                styles.addButton, 
                { borderColor: darkMode ? '#444444' : '#CCCCCC' }
              ]}
              onPress={() => {
                if (isProjectLevel && onPressAddProject) {
                  onPressAddProject();
                } else if (!isProjectLevel && onPressAddTask) {
                  onPressAddTask();
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="add" 
                size={16} 
                color={darkMode ? '#AAAAAA' : '#888888'} 
              />
              <SafeText style={[
                styles.addButtonText, 
                { color: darkMode ? '#AAAAAA' : '#888888' }
              ]}>
                {isProjectLevel ? 'Add Project' : 'Add Task'}
              </SafeText>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  };
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: darkMode ? '#121212' : '#F5F5F5' },
      containerStyle
    ]}>
      <ScrollView 
        ref={horizontalScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.boardScroll}
        contentContainerStyle={styles.boardContent}
        onScroll={handleHorizontalScroll}
        scrollEventThrottle={16}
      >
        {renderColumn('To Do', 'todo', '#F5F5F5')}
        {renderColumn('In Progress', 'in_progress', '#64B5F6')}
        {renderColumn('Done', 'done', '#81C784')}
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
    padding: 10,
    paddingBottom: 20,
  },
  column: {
    width: 280,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
    height: Platform.OS === 'web' ? '80vh' : undefined,
    maxHeight: 600,
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
  // Consistent card styles
  item: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemColorBar: {
    width: 4,
  },
  itemContent: {
    flex: 1,
  },
  itemTouchableArea: {
    padding: 12,
    paddingBottom: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  itemDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  projectMeta: {
    flexDirection: 'column',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    width: 24,
    textAlign: 'right',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButton: {
    padding: 6,
    marginHorizontal: 2,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  addButtonText: {
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default KanbanBoard;