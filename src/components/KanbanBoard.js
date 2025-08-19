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
import MinimalistConfirmDialog from './MinimalistConfirmDialog';

const { width } = Dimensions.get('window');

// Safe Text component to prevent rendering errors
const SafeText = ({ children, style, ...props }) => {
  if (children === null || children === undefined) {
    return null;
  }
  
  return <Text style={style} {...props}>{children}</Text>;
};

const KanbanBoard = ({ 
  milestones = [],  // Array of milestones to display
  tasks = [],     // Optional array of tasks  
  theme,          // Theme object for styling
  onPressMilestone, // Function called when a milestone is pressed
  onPressTask,    // Function called when a task is pressed
  onPressAddMilestone, // Function called when add milestone is pressed
  onPressAddTask, // Function called when add task is pressed
  onUpdateMilestoneProgress, // Function to update milestone progress state
  onUpdateTaskStatus, // Function to update task status
  onEditTask,     // Function to edit a task
  onDeleteTask,   // Function to delete a task
  containerStyle, // Optional style override for container
  isMilestoneLevel = false, // Whether this is a milestone-level board
  filterBy = null, // Optional filter (e.g., by goal, by domain)
  color = '#4CAF50', // Color for styling
  darkMode = true, // Default to dark mode
  allMilestones = [], // All milestones for color inheritance
  allGoals = [], // All goals for color inheritance
  showTaskLabels = true, // Whether to show goal/milestone labels on tasks
  isFullScreen = false, // Whether the kanban is in fullscreen mode
  wipLimit = 3, // WIP limit for "In Progress" column
  onWipLimitChange, // Function to handle WIP limit changes
  onShowWipEducation, // Function to show WIP limit education modal
  navigation, // Navigation object for redirecting to LifePlan screen
  onNavigateToLifePlan // Function to navigate to LifePlan screen with auto-open add button
}) => {
  const [draggingItem, setDraggingItem] = useState(null);
  const [wipDialog, setWipDialog] = useState({ visible: false, type: '', item: null, targetStatus: '' });
  const [wipLimitDialog, setWipLimitDialog] = useState({ visible: false, currentCount: 0, attemptedLimit: 0 });
  
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
  
  // Function to get the color for a task based on its milestone's goal's color
  const getTaskColor = (task) => {
    if (!task.projectId) return color;
    
    // Find the milestone this task belongs to
    const milestone = allMilestones.find(p => p.id === task.projectId);
    if (!milestone || !milestone.goalId) return color;
    
    // Find the goal this milestone belongs to
    const goal = allGoals.find(g => g.id === milestone.goalId);
    if (!goal) return color;
    
    // Return the goal's color, or the milestone's color, or the default color
    return goal.color || milestone.color || color;
  };
  
  // Get column items based on status
  const getItemsByStatus = (status) => {
    if (isMilestoneLevel) {
      // Milestone level - filter milestones by their status first, then progress
      return milestones.filter(milestone => {
        if (filterBy && filterBy.goalId && milestone.goalId !== filterBy.goalId) return false;
        
        // First check if the milestone has an explicit status property
        if (milestone.status) {
          return milestone.status === status;
        }
        
        // Fall back to progress-based status for backward compatibility
        if (status === 'todo') return milestone.progress === 0;
        if (status === 'in_progress') return milestone.progress > 0 && milestone.progress < 100;
        if (status === 'done') return milestone.progress === 100;
        
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


  // Handle moving a milestone to a different status
  const handleMoveMilestone = (milestone, newStatus) => {
    if (!onUpdateMilestoneProgress) return;
    
    // Check WIP limit for "In Progress" column
    if (newStatus === 'in_progress') {
      const inProgressItems = getItemsByStatus('in_progress');
      if (inProgressItems.length >= wipLimit) {
        setWipDialog({
          visible: true,
          type: 'milestone',
          item: milestone,
          targetStatus: newStatus,
          inProgressCount: inProgressItems.length
        });
        return;
      }
    }
    
    // Convert status to status indicator value - this is NOT a progress percentage
    // It's just a signal for the AppContext to change the status
    let statusIndicator;
    if (newStatus === 'todo') statusIndicator = 0;
    else if (newStatus === 'in_progress') statusIndicator = 50;
    else if (newStatus === 'done') statusIndicator = 100;
    
    console.log(`Moving milestone "${milestone.title}" to ${newStatus} status`);
    
    // Call the update function from props with the status indicator
    onUpdateMilestoneProgress(milestone.id, statusIndicator);
  };
  
  // Handle moving a task to a different status
  const handleMoveTask = (task, newStatus) => {
    if (!onUpdateTaskStatus) return;
    
    // Check WIP limit for "In Progress" column
    if (newStatus === 'in_progress') {
      const inProgressItems = getItemsByStatus('in_progress');
      if (inProgressItems.length >= wipLimit) {
        setWipDialog({
          visible: true,
          type: 'task',
          item: task,
          targetStatus: newStatus,
          inProgressCount: inProgressItems.length
        });
        return;
      }
    }
    
    // Call the update function from props
    onUpdateTaskStatus(task.id, newStatus);
  };
  
  // Function to render a column
  const renderColumn = (title, status, headerColor) => {
    const items = getItemsByStatus(status);
    
    // Check if there are any tasks in ANY section (for prefilled text logic)
    const hasTasksInAnySection = !isMilestoneLevel && (
      getItemsByStatus('todo').length > 0 ||
      getItemsByStatus('in_progress').length > 0 ||
      getItemsByStatus('done').length > 0
    );
    
    return (
      <View style={[
        styles.column, 
        { 
          maxHeight: isFullScreen ? '85vh' : 600, // Much taller in fullscreen
          height: isFullScreen ? 'auto' : (Platform.OS === 'web' ? '80vh' : undefined)
        }
      ]}>
        <View style={styles.columnHeader}>
          <SafeText style={styles.columnTitle}>
            {title}
          </SafeText>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {/* Eye toggle - only show in first column and for tasks only */}
            {status === 'todo' && !isMilestoneLevel && (
              <TouchableOpacity
                onPress={() => {
                  // This will be handled by parent component
                  if (typeof window !== 'undefined' && window.toggleTaskLabels) {
                    window.toggleTaskLabels();
                  }
                }}
                style={{ padding: 4 }}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={showTaskLabels ? "Hide task labels" : "Show task labels"}
                accessibilityHint="Toggle visibility of goal and milestone labels on tasks"
              >
                <Ionicons 
                  name={showTaskLabels ? "eye" : "eye-off"} 
                  size={16} 
                  color="rgba(255,255,255,0.7)" 
                />
              </TouchableOpacity>
            )}
            
            {/* WIP Limit indicator and controls for In Progress column */}
            {status === 'in_progress' && (
              <View style={styles.wipLimitContainer}>
                {/* Decrease button */}
                <TouchableOpacity
                  style={[styles.wipControlButton, { opacity: wipLimit <= 1 ? 0.3 : 1 }]}
                  onPress={() => {
                    if (wipLimit > 1) {
                      const inProgressItems = getItemsByStatus('in_progress');
                      const newLimit = wipLimit - 1;
                      
                      // Check if new limit would be below current in-progress count
                      if (newLimit < inProgressItems.length) {
                        setWipLimitDialog({
                          visible: true,
                          currentCount: inProgressItems.length,
                          attemptedLimit: newLimit
                        });
                        return;
                      }
                      
                      if (onWipLimitChange) {
                        onWipLimitChange(newLimit);
                      }
                    }
                  }}
                  disabled={wipLimit <= 1}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease WIP limit"
                >
                  <Ionicons name="remove" size={16} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>

                {/* Clickable WIP indicator */}
                <TouchableOpacity
                  style={[
                    styles.wipLimitIndicator,
                    { 
                      backgroundColor: items.length >= wipLimit ? '#FF5722' : 'rgba(255,255,255,0.1)',
                      borderColor: items.length >= wipLimit ? '#FF5722' : 'rgba(255,255,255,0.3)'
                    }
                  ]}
                  onPress={() => {
                    if (onShowWipEducation) {
                      onShowWipEducation();
                    }
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`WIP limit indicator: ${items.length} of ${wipLimit} items. Tap to learn about WIP limits.`}
                >
                  <SafeText style={[
                    styles.wipLimitText,
                    { color: items.length >= wipLimit ? '#FFFFFF' : 'rgba(255,255,255,0.8)' }
                  ]}>
                    {items.length}/{wipLimit}
                  </SafeText>
                </TouchableOpacity>

                {/* Increase button */}
                <TouchableOpacity
                  style={[styles.wipControlButton, { opacity: wipLimit >= 10 ? 0.3 : 1 }]}
                  onPress={() => {
                    if (wipLimit < 10 && onWipLimitChange) {
                      onWipLimitChange(wipLimit + 1);
                    }
                  }}
                  disabled={wipLimit >= 10}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Increase WIP limit"
                >
                  <Ionicons name="add" size={16} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
              </View>
            )}
            
            {/* Column count - only show for non-in-progress columns since in-progress has WIP indicator */}
            {status !== 'in_progress' && (
              <View style={styles.columnCount}>
                <SafeText style={styles.columnCountText}>
                  {items.length}
                </SafeText>
              </View>
            )}
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
                style={styles.item}
                onPress={() => {
                  if (isMilestoneLevel && onPressMilestone) {
                    onPressMilestone(item);
                  } else if (!isMilestoneLevel && onPressTask) {
                    onPressTask(item);
                  }
                }}
                onLongPress={() => {
                  if (isMilestoneLevel) {
                    Alert.alert(
                      'Move Milestone',
                      `Move "${item.title}" to a different status?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        ...(['todo', 'in_progress', 'done']
                          .filter(s => s !== status)
                          .map(newStatus => ({
                            text: newStatus === 'todo' ? 'To Do' : 
                                 newStatus === 'in_progress' ? 'In Progress' : 'Done',
                            onPress: () => handleMoveMilestone(item, newStatus)
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
                  { backgroundColor: isMilestoneLevel ? (item.color || color) : getTaskColor(item) }
                ]} />
                
                <View style={styles.itemContent}>
                  {/* Main content area */}
                  <View style={styles.itemTouchableArea}>
                    <SafeText style={styles.itemTitle}>
                      {item.title}
                    </SafeText>
                    
                    {/* Show description for all items if available */}
                    {item.description && (
                      <SafeText 
                        style={styles.itemDescription}
                        numberOfLines={3}
                      >
                        {item.description}
                      </SafeText>
                    )}
                    
                    {/* Show goal/milestone info for tasks */}
                    {!isMilestoneLevel && showTaskLabels && (
                      <View style={styles.taskMeta}>
                        {/* Goal info */}
                        {(() => {
                          const milestone = allMilestones.find(p => p.id === item.projectId);
                          const goal = milestone ? allGoals.find(g => g.id === milestone.goalId) : null;
                          
                          return (
                            <View style={styles.taskMetaContainer}>
                              {/* Show goal info if available - FIRST (top) */}
                              {goal && (
                                <View style={[styles.taskMetaItem, { backgroundColor: (goal.color || color) + '15' }]}>
                                  <Ionicons 
                                    name={goal.icon || 'flag'} 
                                    size={10} 
                                    color={goal.color || color} 
                                  />
                                  <SafeText 
                                    style={[styles.taskMetaText, { color: goal.color || color }]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                  >
                                    {goal.title}
                                  </SafeText>
                                </View>
                              )}
                              
                              {/* Show milestone info if available - SECOND (below goal) */}
                              {milestone && (
                                <View style={[styles.taskMetaItem, { backgroundColor: (milestone.color || '#9E9E9E') + '15' }]}>
                                  <Ionicons 
                                    name="diamond-outline" 
                                    size={10} 
                                    color={milestone.color || '#9E9E9E'} 
                                  />
                                  <SafeText 
                                    style={[styles.taskMetaText, { color: milestone.color || '#9E9E9E' }]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                  >
                                    {milestone.title}
                                  </SafeText>
                                </View>
                              )}
                              
                              {/* Show standalone indicator only if no goal AND no milestone */}
                              {!goal && !milestone && (
                                <View style={[styles.taskMetaItem, { backgroundColor: '#9CA3AF15' }]}>
                                  <Ionicons 
                                    name="checkmark-circle-outline" 
                                    size={10} 
                                    color="#9CA3AF" 
                                  />
                                  <SafeText 
                                    style={[styles.taskMetaText, { color: '#9CA3AF' }]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                  >
                                    Standalone Task
                                  </SafeText>
                                </View>
                              )}
                            </View>
                          );
                        })()}
                      </View>
                    )}
                    
                    {/* Show meta info for milestones */}
                    {isMilestoneLevel && (
                      <View style={styles.milestoneMeta}>
                        {item.dueDate && (
                          <View style={styles.metaItem}>
                            <Ionicons 
                              name="calendar-outline" 
                              size={12} 
                              color="rgba(255,255,255,0.7)" 
                            />
                            <SafeText style={styles.metaText}>
                              {new Date(item.dueDate).toLocaleDateString()}
                            </SafeText>
                          </View>
                        )}
                        
                        {/* Progress bar for milestones */}
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                { 
                                  width: `${item.progress || 0}%`, 
                                  backgroundColor: isMilestoneLevel ? (item.color || color) : getTaskColor(item) 
                                }
                              ]}
                            />
                          </View>
                          <SafeText style={styles.progressText}>
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
                      borderTopColor: 'rgba(255,255,255,0.1)',
                      borderTopWidth: 1,
                      backgroundColor: 'rgba(255,255,255,0.03)',
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
                          if (isMilestoneLevel) {
                            handleMoveMilestone(item, targetStatus);
                          } else {
                            handleMoveTask(item, targetStatus);
                          }
                        }}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                      >
                        <Ionicons 
                          name="arrow-back" 
                          size={14} 
                          color="rgba(255,255,255,0.7)" 
                        />
                      </TouchableOpacity>
                    )}
                    
                    {/* Edit button (for tasks only) */}
                    {!isMilestoneLevel && onEditTask && (
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
                          color="rgba(255,255,255,0.7)" 
                        />
                      </TouchableOpacity>
                    )}
                    
                    {/* Delete button (for tasks only) */}
                    {!isMilestoneLevel && onDeleteTask && (
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
                          if (isMilestoneLevel) {
                            handleMoveMilestone(item, targetStatus);
                          } else {
                            handleMoveTask(item, targetStatus);
                          }
                        }}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                      >
                        <Ionicons 
                          name="arrow-forward" 
                          size={14} 
                          color="rgba(255,255,255,0.7)" 
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <SafeText style={styles.emptyText}>
                No items
              </SafeText>
              {/* Show suggestion to go to LifePlan screen for tasks only if there are NO tasks in any section */}
              {!isMilestoneLevel && !hasTasksInAnySection && (
                <TouchableOpacity 
                  style={styles.emptyActionButton}
                  onPress={() => {
                    if (onNavigateToLifePlan) {
                      onNavigateToLifePlan();
                    } else if (navigation) {
                      navigation.navigate('GoalsTab', { 
                        screen: 'LifePlanOverview',
                        params: { autoOpenAdd: true }
                      });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="compass-outline" 
                    size={16} 
                    color="rgba(255,255,255,0.8)" 
                  />
                  <SafeText style={styles.emptyActionText}>
                    Go to Life Plan to create tasks
                  </SafeText>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Add button - only for the first column and milestones */}
          {status === 'todo' && isMilestoneLevel && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                if (onPressAddMilestone) {
                  onPressAddMilestone();
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="add" 
                size={16} 
                color="rgba(255,255,255,0.8)" 
              />
              <SafeText style={styles.addButtonText}>
                Add Milestone
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

      {/* WIP Limit Dialog */}
      <MinimalistConfirmDialog
        visible={wipDialog.visible}
        title="Focus Mode Active"
        message={`You have ${wipDialog.inProgressCount}/${wipLimit} ${wipDialog.type === 'task' ? 'tasks' : 'projects'} in progress. Complete current work before starting new items.`}
        confirmText="Learn More"
        cancelText="Got it"
        onConfirm={() => onShowWipEducation && onShowWipEducation()}
        onCancel={() => {}}
        onClose={() => setWipDialog({ visible: false, type: '', item: null, targetStatus: '', inProgressCount: 0 })}
        icon="trending-up-outline"
      />

      {/* WIP Limit Validation Dialog */}
      <MinimalistConfirmDialog
        visible={wipLimitDialog.visible}
        title="Cannot Reduce Limit"
        message={`You currently have ${wipLimitDialog.currentCount} items in progress. Complete some work before reducing the limit to ${wipLimitDialog.attemptedLimit}.`}
        confirmText="Got it"
        cancelText={null}
        onConfirm={() => {}}
        onClose={() => setWipLimitDialog({ visible: false, currentCount: 0, attemptedLimit: 0 })}
        icon="alert-circle-outline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  boardScroll: {
    flex: 1,
  },
  boardContent: {
    padding: 16,
    paddingBottom: 24,
  },
  column: {
    width: 300,
    marginHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
    height: Platform.OS === 'web' ? '80vh' : undefined,
    maxHeight: 600,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  columnCount: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  columnCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  columnContent: {
    flex: 1,
    padding: 16,
  },
  // Consistent card styles
  item: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  itemColorBar: {
    width: 5,
  },
  itemContent: {
    flex: 1,
  },
  itemTouchableArea: {
    padding: 16,
    paddingBottom: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
    flexWrap: 'wrap',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
    color: 'rgba(255,255,255,0.8)',
  },
  taskMeta: {
    marginTop: 12,
  },
  taskMetaContainer: {
    flexDirection: 'column',
    gap: 6,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    maxWidth: '100%',
  },
  taskMetaText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
    color: 'rgba(255,255,255,0.9)',
  },
  milestoneMeta: {
    flexDirection: 'column',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    marginLeft: 6,
    color: 'rgba(255,255,255,0.8)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    width: 28,
    textAlign: 'right',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  emptyActionText: {
    marginLeft: 8,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  addButtonText: {
    marginLeft: 8,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.3,
  },
  wipLimitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wipControlButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  wipLimitIndicator: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    minWidth: 50,
    alignItems: 'center',
  },
  wipLimitText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default KanbanBoard;