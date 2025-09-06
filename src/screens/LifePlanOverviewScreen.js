// src/screens/LifePlanOverviewScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';
import { useGlobalAnimation } from '../context/GlobalAnimationContext';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import Confetti from '../components/Confetti';
import AddSelectionModal from '../components/AddSelectionModal';
import { LinearGradient } from 'expo-linear-gradient';
import MinimalistContextMenu from '../components/MinimalistContextMenu';
import MinimalistConfirmDialog from '../components/MinimalistConfirmDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppTourOverlay from '../components/AppTourOverlay';
import useAppTour from '../hooks/useAppTour';
import AchievementService from '../services/AchievementService';
import {
  scaleWidth,
  scaleHeight,
  spacing,
  fontSizes,
  useSafeSpacing,
} from '../utils/responsive';

// Header Component
const LifePlanHeader = ({ isFullscreen, onFullScreenToggle, isEditMode, onEditModeToggle, filter, onClearFilter }) => {
  const { theme } = useTheme();
  
  // Determine title based on filter - only show when there's meaningful info
  const getTitle = () => {
    if (isEditMode) return 'Hold & Drag to Rearrange';
    
    switch (filter) {
      case 'goals': return 'Filter: Goals';
      case 'milestones': return 'Filter: Milestones';
      case 'tasks': return 'Filter: Tasks';
      default: return null; // No title for default view
    }
  };

  const title = getTitle();
  
  return (
    <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={onFullScreenToggle}
      >
        <Ionicons 
          name={isFullscreen ? "contract" : "expand"} 
          size={24} 
          color={theme.text} 
        />
      </TouchableOpacity>
      
      {title && (
        <Text 
          style={[styles.headerTitle, { color: filter ? theme.primary : theme.text }]}
          maxFontSizeMultiplier={1.3}
        >
          {title}
        </Text>
      )}
      
      {filter && (
        <TouchableOpacity 
          style={styles.clearFilterButton}
          onPress={onClearFilter}
        >
          <Ionicons 
            name="close" 
            size={24} 
            color={theme.primary} 
          />
        </TouchableOpacity>
      )}
      
      {!filter && (
        <TouchableOpacity 
          style={[styles.editButton, isEditMode && { backgroundColor: theme.primary }]}
          onPress={onEditModeToggle}
        >
          <Ionicons 
            name={isEditMode ? "checkmark" : "swap-vertical"} 
            size={24} 
            color={isEditMode ? '#FFFFFF' : theme.text} 
          />
          {isEditMode && (
            <Text 
              style={[styles.editButtonText, { 
                color: '#FFFFFF'
              }]}
              maxFontSizeMultiplier={1.3}
            >
              Done
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

// Task Card Component
const TaskCard = ({ task, onComplete, onDelete, isEditMode, onDrag, isActive, isDraggable = false }) => {
  const { theme } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Minimal debug log
  if (task.title === "Text" || task.title === "Bruh") {
    console.log(`🔥 FOCUS: TaskCard "${task.title}" rendered - onComplete: ${!!onComplete}`);
  }
  
  const handleLongPress = () => {
    if (isEditMode && onDrag && isDraggable) {
      onDrag();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };
  
  const CardContent = (
    <TouchableOpacity 
      style={[styles.taskCard, { 
        backgroundColor: task.completed ? theme.surface : theme.card,
        borderColor: task.completed ? theme.success : theme.border,
        borderWidth: 1,
        shadowColor: task.completed ? theme.success : '#000',
        shadowOpacity: task.completed ? 0.1 : 0.05
      }]}
      onPress={() => {
        console.log(`🔥 TAP: "${task.title}" tapped!`);
        if (onComplete) {
          onComplete();
          console.log(`🔥 TAP: onComplete called for "${task.title}"`);
        } else {
          console.log(`🔥 TAP: ERROR - no onComplete for "${task.title}"`);
        }
      }}
      onLongPress={handleLongPress}
      delayLongPress={500}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={styles.taskContent}>
        {/* Professional Task Icon */}
        <View style={[styles.taskIconContainer, {
          backgroundColor: task.completed ? `${theme.success}15` : `${theme.primary}10`,
          borderColor: task.completed ? `${theme.success}30` : `${theme.primary}20`,
          borderWidth: 1
        }]}>
          <Ionicons 
            name={task.completed ? "checkmark-circle" : "ellipse-outline"} 
            size={16} 
            color={task.completed ? theme.success : theme.primary} 
          />
        </View>
        
        <View style={[styles.taskInfo, { marginLeft: 12 }]}>
          {/* Task Title */}
          <Text style={[styles.taskTitle, { 
            color: task.completed ? theme.textSecondary : theme.text,
            textDecorationLine: task.completed ? 'line-through' : 'none',
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 2
          }]}>
            {task.title}
          </Text>
          
          {/* Task Priority or Due Date (if available) - Skip showing 'medium' priority */}
          {task.priority && task.priority !== 'medium' && (
            <View style={[styles.taskPriority, {
              backgroundColor: task.priority === 'high' ? '#FF525220' : 
                              task.priority === 'medium' ? '#FF980020' : '#4CAF5020',
              borderColor: task.priority === 'high' ? '#FF5252' : 
                          task.priority === 'medium' ? '#FF9800' : '#4CAF50',
              borderWidth: 1,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 8,
              alignSelf: 'flex-start'
            }]}>
              <Text style={[styles.priorityText, {
                color: task.priority === 'high' ? '#FF5252' : 
                       task.priority === 'medium' ? '#FF9800' : '#4CAF50',
                fontSize: 10,
                fontWeight: '600',
                textTransform: 'uppercase'
              }]}>
                {task.priority}
              </Text>
            </View>
          )}
        </View>
        
        {/* Completion Status */}
        {task.completed && (
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color={theme.success || '#4CAF50'} 
            style={{ marginLeft: 8 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
  
  return (
    <>
      {isDraggable ? (
        <ScaleDecorator>{CardContent}</ScaleDecorator>
      ) : (
        CardContent
      )}
      
      {/* Delete Confirmation Dialog */}
      <MinimalistConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        destructive={true}
        icon="trash-outline"
      />
    </>
  );
};

// Milestone Card Component
const MilestoneCard = ({ milestone, goalColor, tasks, onExpandToggle, onComplete, onEdit, onDelete, isEditMode, expanded, onTaskComplete, onTaskDelete, onDrag, isActive, isDraggable = false, navigation, goalId, onTaskReorder }) => {
  const { theme } = useTheme();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [longPressPosition, setLongPressPosition] = useState({ x: 0, y: 0 });
  
  // Get tasks for this milestone - prioritize milestoneId over projectId for accuracy
  const milestoneTasks = tasks.filter(task => {
    // Special handling for virtual standalone tasks milestone
    if (milestone.isVirtual && milestone.id.includes('-standalone-tasks')) {
      // For virtual standalone tasks milestone, we want tasks with no milestone/project assignment
      // but we've already received the correct tasks via props, so just return true
      // (the filtering was already done in the parent component)
      return true;
    }
    
    // Regular milestone filtering
    const belongsToMilestone = (task.milestoneId === milestone.id) || 
                               (!task.milestoneId && task.projectId === milestone.id);
    return belongsToMilestone;
  }).sort((a, b) => {
    // Sort by order property if both tasks have it, otherwise maintain original position
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    } else if (a.order !== undefined) {
      return -1; // a comes first
    } else if (b.order !== undefined) {
      return 1; // b comes first
    }
    return 0; // maintain original order
  });
  
  // Debug: Check for the problematic task
  const hasProblematicTask = milestoneTasks.some(t => t.id === 'task_1756631863775_soxqegbpx');
  if (hasProblematicTask) {
    console.warn(`🔍 Problematic task found in milestone ${milestone.id}:`, milestone.title);
  }
  const completedTasks = milestoneTasks.filter(task => task.completed);
  const totalTasks = milestoneTasks.length;
  // If milestone is completed, show 100%, otherwise calculate based on tasks
  const progressPercentage = milestone.completed ? 100 : 
    (totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0);
  
  const handleLongPress = (event) => {
    console.log(`🔍 MilestoneCard handleLongPress - isEditMode: ${isEditMode}, onDrag: ${!!onDrag}, isDraggable: ${isDraggable}`);
    
    if (isEditMode && onDrag && isDraggable) {
      // Handle drag functionality
      console.log(`🔍 Starting drag for milestone: ${milestone.title}`);
      onDrag();
    } else {
      console.log(`🔍 Showing context menu for milestone: ${milestone.title}`);
      // Get touch position for context menu placement
      const { pageX, pageY } = event.nativeEvent;
      setLongPressPosition({ x: pageX, y: pageY });
      setShowContextMenu(true);
    }
  };

  const handleDeletePress = () => {
    setShowContextMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  const handleEditPress = () => {
    setShowContextMenu(false);
    onEdit();
  };
  
  const cardColor = milestone.isStandalone ? goalColor : goalColor;
  
  const CardContent = (
    <View style={[styles.milestoneCard, { 
      borderColor: milestone.completed ? "#4CAF50" : cardColor,
      borderWidth: milestone.completed ? 2 : 1,
      backgroundColor: theme.card,
      shadowColor: milestone.completed ? "#4CAF50" : '#000',
      shadowOpacity: milestone.completed ? 0.15 : 0.08,
      position: 'relative' // Enable absolute positioning for floating button
    }]}>
      <TouchableOpacity 
        style={[styles.milestoneHeader, { paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 50 }]} // Extra bottom padding for floating button
        onPress={onExpandToggle}
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        {/* Professional Milestone Icon */}
        <View style={[styles.milestoneIconContainer, {
          backgroundColor: `${cardColor}15`,
          borderColor: `${cardColor}30`,
          borderWidth: 1
        }]}>
          <Ionicons 
            name={milestone.completed ? "checkmark-circle" : "diamond"} 
            size={20} 
            color={milestone.completed ? "#4CAF50" : cardColor} 
          />
        </View>
        
        <View style={[styles.milestoneInfo, { marginLeft: 12 }]}>
          {/* Milestone Title */}
          <Text 
            style={[
              styles.milestoneTitle, 
              { 
                color: milestone.completed ? theme.textSecondary : theme.text,
                textDecorationLine: milestone.completed ? 'line-through' : 'none',
                fontSize: 16,
                fontWeight: '600',
                marginBottom: 4
              }
            ]}
            maxFontSizeMultiplier={1.3}
          >
            {milestone.title}
          </Text>
          
          {/* Progress Stats Row */}
          <View style={[styles.milestoneStats, { marginBottom: 8 }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontSize: 10 }]}>
                PROGRESS
              </Text>
              <Text style={[styles.statValue, { 
                color: milestone.completed ? "#4CAF50" : cardColor, 
                fontSize: 14,
                fontWeight: '700'
              }]}>
                {milestone.completed ? "100%" : `${progressPercentage}%`}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary, fontSize: 10 }]}>
                TASKS
              </Text>
              <Text style={[styles.statValue, { 
                color: theme.text, 
                fontSize: 14,
                fontWeight: '700'
              }]}>
                {completedTasks.length}/{totalTasks}
              </Text>
            </View>
            
            {milestone.completed && milestone.completedAt && (
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.textSecondary, fontSize: 10 }]}>
                  COMPLETED
                </Text>
                <Text style={[styles.statValue, { 
                  color: "#4CAF50", 
                  fontSize: 12,
                  fontWeight: '600'
                }]}>
                  {new Date(milestone.completedAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            )}
          </View>
          
          {/* Modern Progress Bar */}
          <View style={[styles.modernProgressBar, { backgroundColor: `${cardColor}15` }]}>
            <View style={[styles.modernProgressFill, { 
              backgroundColor: milestone.completed ? "#4CAF50" : cardColor,
              width: `${progressPercentage}%`
            }]} />
          </View>
        </View>
        
        {/* Action Buttons - Only Expand Button */}
        <View style={styles.milestoneActions}>
          <TouchableOpacity 
            style={[styles.expandButton, {
              backgroundColor: `${theme.primary}10`,
              borderRadius: 16,
              width: 32,
              height: 32
            }]}
            onPress={onExpandToggle}
          >
            <Ionicons 
              name={expanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={theme.primary} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Completion Message - Inline with button when all tasks done */}
        {!milestone.completed && totalTasks > 0 && completedTasks.length === totalTasks && (
          <View style={{
            position: 'absolute',
            bottom: 12,
            right: 56, // Position to the left of the button
            backgroundColor: `${cardColor}12`,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: `${cardColor}30`,
            maxWidth: 120,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text style={{
              color: cardColor,
              fontSize: 10,
              fontWeight: '600',
              marginRight: 4
            }}>
              🎉 Ready to complete!
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={12} 
              color={cardColor}
            />
          </View>
        )}

        {/* Floating Completion Button - Bottom Right - Only show if there are incomplete tasks OR if not virtual */}
        {(!milestone.isVirtual || (milestone.isVirtual && milestoneTasks.some(task => !task.completed && task.status !== 'done')) || progressPercentage === 100) && (
          <TouchableOpacity 
            style={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              width: 32,
              height: 32,
              borderRadius: 8, // Square with rounded corners
              backgroundColor: progressPercentage === 100 ? "#4CAF50" : 
                (!milestone.goalId ? "#000000" : cardColor),
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              zIndex: 1000 // Ensure button is above other elements
            }}
            onPress={() => {
              console.log('🔥 TOUCHABLEOPACITY PRESSED:', { 
                milestoneId: milestone.id, 
                isVirtual: milestone.isVirtual,
                onCompleteExists: !!onComplete,
                progressPercentage: progressPercentage,
                allTasksCompleted: progressPercentage === 100
              });
              if (progressPercentage === 100) {
                console.log('🔥 ALL TASKS COMPLETED - Button shows completed state');
                // For completed virtual milestones, trigger a custom completion handler
                if (milestone.isVirtual && onComplete) {
                  console.log('🔥 CALLING COMPLETION HANDLER FOR COMPLETED VIRTUAL MILESTONE');
                  onComplete();
                }
              } else if (onComplete) {
                onComplete();
              } else {
                console.error('🔥 NO onComplete HANDLER');
              }
            }}
            activeOpacity={0.8}
          >
            {progressPercentage === 100 ? (
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            ) : (
              <Ionicons 
                name="checkmark-outline" 
                size={18} 
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.tasksContainer}>
          {milestoneTasks.length === 0 ? (
            <View>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No tasks yet
              </Text>
              
              {/* Add Task Button for empty milestone */}
              {navigation && (
                <View style={styles.emptyMilestoneActions}>
                  <TouchableOpacity
                    style={[styles.createTaskButton, { 
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      marginTop: 0
                    }]}
                    onPress={() => {
                      navigation.navigate('TaskDetails', {
                        mode: 'create',
                        preselectedGoalId: goalId === 'standalone-milestones' ? null : goalId,  // null for standalone milestones
                        preselectedMilestoneId: milestone.id
                      });
                    }}
                  >
                    <Ionicons name="add" size={16} color={theme.primary} />
                    <Text style={[styles.createTaskText, { color: theme.primary }]}>
                      Add Task
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : isEditMode ? (
            <View>
              {milestoneTasks.map((task, index) => (
                <View key={task.id || `task-${index}`} style={styles.taskReorderItem}>
                  <View style={styles.taskReorderButtons}>
                    <TouchableOpacity
                      style={[styles.reorderButton, { opacity: index === 0 ? 0.3 : 1 }]}
                      onPress={() => {
                        if (index > 0) {
                          // Move task up
                          const newOrder = [...milestoneTasks];
                          [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                          onTaskReorder && onTaskReorder(newOrder, milestone.id);
                        }
                      }}
                      disabled={index === 0}
                    >
                      <Ionicons name="chevron-up" size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reorderButton, { opacity: index === milestoneTasks.length - 1 ? 0.3 : 1 }]}
                      onPress={() => {
                        if (index < milestoneTasks.length - 1) {
                          // Move task down
                          const newOrder = [...milestoneTasks];
                          [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                          onTaskReorder && onTaskReorder(newOrder, milestone.id);
                        }
                      }}
                      disabled={index === milestoneTasks.length - 1}
                    >
                      <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.taskReorderContent}>
                    <TaskCard
                      task={task}
                      onComplete={() => onTaskComplete(task.id)}
                      onDelete={() => onTaskDelete(task.id)}
                      isEditMode={isEditMode}
                      isDraggable={false}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            milestoneTasks.map((task, index) => (
              <TaskCard
                key={task.id || `task-${index}`}
                task={task}
                onComplete={() => onTaskComplete(task.id)}
                onDelete={() => onTaskDelete(task.id)}
                isEditMode={isEditMode}
                isDraggable={false}
              />
            ))
          )}
          
          {/* Create Task Button */}
          {navigation && milestoneTasks.length > 0 && (
            <TouchableOpacity
              style={[styles.createTaskButton, { 
                backgroundColor: theme.surface,
                borderColor: theme.border 
              }]}
              onPress={() => {
                navigation.navigate('TaskDetails', {
                  mode: 'create',
                  preselectedGoalId: goalId === 'standalone-milestones' ? null : goalId,  // null for standalone milestones
                  preselectedMilestoneId: milestone.id
                });
              }}
            >
              <Ionicons name="add" size={16} color={theme.primary} />
              <Text style={[styles.createTaskText, { color: theme.primary }]}>
                Create Task
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
  
  return (
    <>
      {isDraggable ? (
        <ScaleDecorator>{CardContent}</ScaleDecorator>
      ) : (
        CardContent
      )}
      
      {/* Context Menu */}
      <MinimalistContextMenu
        visible={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        title="Milestone Options"
        subtitle={milestone.title}
        position={longPressPosition}
        options={[
          { text: 'Edit', onPress: handleEditPress },
          { text: 'Delete', onPress: handleDeletePress, style: 'destructive' },
          { text: 'Cancel', onPress: () => setShowContextMenu(false), style: 'cancel' }
        ]}
      />

      {/* Delete Confirmation Dialog */}
      <MinimalistConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Milestone"
        message={`Are you sure you want to delete "${milestone.title}"? This will also delete all tasks within it.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        destructive={true}
        icon="warning-outline"
      />
    </>
  );
};

// Helper function to get domain icon
const getDomainIcon = (goal) => {
  const domainIcons = {
    'Business': 'briefcase',
    'Finance': 'card',
    'Health': 'fitness',
    'Relationships': 'people',
    'Education': 'school',
    'Knowledge': 'library',
    'Wellbeing': 'heart',
    'Joy': 'happy',
    'Home': 'home',
    'Travel': 'airplane',
    'Achievement': 'trophy',
    'General': 'star'
  };
  
  return domainIcons[goal.domain || goal.domainName] || goal.icon || 'star';
};

// Helper function to format due date
const getTimeExpression = (goal) => {
  if (!goal.targetDate) return { text: 'No due date', isOverdue: false };
  
  const targetDate = new Date(goal.targetDate);
  const now = new Date();
  const diffTime = targetDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { text: `Overdue by ${Math.abs(diffDays)} days`, isOverdue: true };
  } else if (diffDays === 0) {
    return { text: 'Due today', isOverdue: false, isUrgent: true };
  } else if (diffDays === 1) {
    return { text: 'Due tomorrow', isOverdue: false, isUrgent: true };
  } else if (diffDays < 7) {
    return { text: `Due in ${diffDays} days`, isOverdue: false };
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return { text: `Due in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`, isOverdue: false };
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return { text: `Due in ${months} ${months === 1 ? 'month' : 'months'}`, isOverdue: false };
  } else {
    const years = Math.floor(diffDays / 365);
    return { text: `Due in ${years} ${years === 1 ? 'year' : 'years'}`, isOverdue: false };
  }
};

// Goal Card Component
const GoalCard = ({ goal, milestones, tasks, onExpandToggle, onEdit, onDelete, onComplete, isEditMode, expanded, onTaskComplete, onTaskDelete, onMilestoneComplete, onMilestoneEdit, onMilestoneDelete, onDrag, isActive, isDraggable = false, navigation, onMilestoneReorder, onTaskReorder, isTourMode = false, expandedMilestones: externalExpandedMilestones, onMilestoneExpandToggle, onClearAllStandaloneTasks, onClearAllStandaloneMilestones, onVirtualMilestoneComplete, onVirtualMilestoneDelete }) => {
  const { theme } = useTheme();
  // Special handling for standalone milestones - use all milestones passed in
  const goalMilestones = goal.id === 'standalone-milestones' 
    ? milestones // For standalone milestones, milestones prop already contains the filtered standalone milestones
    : milestones.filter(milestone => milestone.goalId === goal.id);
  
  // Find standalone tasks within this goal (tasks that belong to goal but not to any milestone)
  // Special handling for the standalone-tasks fake goal
  const goalStandaloneTasks = (goal.id === 'standalone-tasks' 
    ? tasks // For standalone section, all passed tasks are standalone
    : tasks.filter(task => 
        task.goalId === goal.id && 
        !task.milestoneId && 
        !task.projectId
      )
  ).sort((a, b) => {
    // Sort by order property if both tasks have it, otherwise maintain original position
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    } else if (a.order !== undefined) {
      return -1; // a comes first
    } else if (b.order !== undefined) {
      return 1; // b comes first
    }
    return 0; // maintain original order
  });
  
  // Create a virtual milestone for standalone tasks if they exist (but NOT for the standalone-tasks section itself)
  const isAllStandaloneTasksCompleted = goalStandaloneTasks.length > 0 && goalStandaloneTasks.every(task => task.completed || task.status === 'done');
  const standaloneTasksMilestone = (goal.id !== 'standalone-tasks' && goalStandaloneTasks.length > 0) ? {
    id: `${goal.id}-standalone-tasks`,
    title: 'Standalone Tasks',
    goalId: goal.id,
    isVirtual: true,
    completed: false // Keep as false to maintain theme color instead of green
  } : null;
  
  // Combine real milestones with virtual standalone tasks milestone
  const allMilestones = standaloneTasksMilestone 
    ? [...goalMilestones, standaloneTasksMilestone]
    : goalMilestones;
  
  const completedMilestones = goalMilestones.filter(milestone => milestone.completed);
  
  // Calculate progress percentage differently for standalone sections
  let progressPercentage;
  if (goal.id === 'standalone-tasks') {
    // For standalone tasks, calculate based on task completion
    const completedStandaloneTasks = tasks.filter(task => task.completed || task.status === 'done').length;
    progressPercentage = tasks.length > 0 ? Math.round((completedStandaloneTasks / tasks.length) * 100) : 0;
  } else if (goal.id === 'standalone-milestones') {
    // For standalone milestones, calculate based on milestone completion
    const completedStandaloneMilestones = milestones.filter(milestone => milestone.completed).length;
    progressPercentage = milestones.length > 0 ? Math.round((completedStandaloneMilestones / milestones.length) * 100) : 0;
  } else {
    // Regular goals use milestone-based progress
    progressPercentage = goalMilestones.length > 0 ? Math.round((completedMilestones.length / goalMilestones.length) * 100) : 0;
  }
  
  const completedMilestonesCount = completedMilestones.length;
  
  // Calculate total task count for this goal (including tasks in milestones)
  // Special handling for standalone sections
  let goalTasks;
  if (goal.id === 'standalone-tasks') {
    // For standalone tasks section, use all passed tasks
    goalTasks = tasks;
  } else if (goal.id === 'standalone-milestones') {
    // For standalone milestones section, count tasks that belong to standalone milestones
    const standaloneMilestoneIds = milestones.map(milestone => milestone.id);
    goalTasks = tasks.filter(task => 
      (task.milestoneId && standaloneMilestoneIds.includes(task.milestoneId)) ||
      (task.projectId && standaloneMilestoneIds.includes(task.projectId))
    );
  } else {
    // Regular goal processing
    // Direct tasks are those that belong to the goal but NOT to any milestone
    const directTasks = tasks.filter(task => 
      task.goalId === goal.id && 
      !task.milestoneId && 
      !task.projectId
    );
    
    // Get all milestone/project IDs for this goal
    const goalMilestoneIds = goalMilestones.map(milestone => milestone.id);
    
    // Get tasks that belong to milestones of this goal
    // Deduplicate tasks - prefer milestoneId over projectId
    const seenTaskIds = new Set();
    const milestoneTasks = tasks.filter(task => {
      // Skip if we've already seen this task
      if (seenTaskIds.has(task.id)) return false;
      
      // Check if task belongs to any milestone of this goal
      const belongsToGoalMilestone = 
        (task.milestoneId && goalMilestoneIds.includes(task.milestoneId)) ||
        (!task.milestoneId && task.projectId && goalMilestoneIds.includes(task.projectId));
      
      if (belongsToGoalMilestone) {
        seenTaskIds.add(task.id);
        return true;
      }
      return false;
    });
    
    // Combine direct tasks and milestone tasks (already deduplicated)
    // Use Set to ensure no duplicates when combining
    const allTaskIds = new Set();
    const combinedTasks = [];
    
    // Add direct tasks
    directTasks.forEach(task => {
      if (!allTaskIds.has(task.id)) {
        allTaskIds.add(task.id);
        combinedTasks.push(task);
      }
    });
    
    // Add milestone tasks
    milestoneTasks.forEach(task => {
      if (!allTaskIds.has(task.id)) {
        allTaskIds.add(task.id);
        combinedTasks.push(task);
      }
    });
    
    goalTasks = combinedTasks;
  }
  
  const taskCount = goalTasks.length;
  const completedTaskCount = goalTasks.filter(task => task.completed).length;
  
  // Get time information for due dates
  const timeInfo = getTimeExpression(goal);
  
  const [internalExpandedMilestones, setInternalExpandedMilestones] = useState({});
  
  // Use external expandedMilestones if provided (for tour mode), otherwise use internal state
  const expandedMilestones = externalExpandedMilestones || internalExpandedMilestones;
  const setExpandedMilestones = onMilestoneExpandToggle || setInternalExpandedMilestones;
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [longPressPosition, setLongPressPosition] = useState({ x: 0, y: 0 });
  
  const handleLongPress = (event) => {
    if (isEditMode && onDrag) {
      // Handle drag functionality
      onDrag();
    } else {
      // Get touch position for context menu placement
      const { pageX, pageY } = event.nativeEvent;
      setLongPressPosition({ x: pageX, y: pageY });
      setShowContextMenu(true);
    }
  };

  const handleCompletePress = () => {
    setShowContextMenu(false);
    onComplete();
  };

  const handleEditPress = () => {
    setShowContextMenu(false);
    onEdit();
  };

  const handleDeletePress = () => {
    setShowContextMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  // Create options for context menu
  const contextMenuOptions = [
    { text: 'Edit', onPress: handleEditPress },
  ];

  // Add complete option if goal is not already completed
  if (!goal.completed) {
    contextMenuOptions.unshift({ text: 'Complete Goal', onPress: handleCompletePress });
  }

  // Add delete option
  contextMenuOptions.push(
    { text: 'Delete', onPress: handleDeletePress, style: 'destructive' },
    { text: 'Cancel', onPress: () => setShowContextMenu(false), style: 'cancel' }
  );
  
  const toggleMilestone = (milestoneId) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }));
  };
  
  const goalColor = goal.isStandalone ? '#FFFFFF' : (goal.color || theme.primary);
  const backgroundColor = goal.isStandalone ? theme.background : theme.card;
  
  const CardContent = (
    <View style={[styles.goalCard, { 
      backgroundColor: backgroundColor,
      borderWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2
    }]}>
      <TouchableOpacity 
        style={[styles.goalHeader, { 
          paddingHorizontal: 24, 
          paddingVertical: 20,
          flexDirection: 'column',
          alignItems: 'stretch'
        }]}
        onPress={() => {
          if (onExpandToggle) {
            onExpandToggle();
          }
        }}
        onLongPress={isTourMode ? null : handleLongPress}
        delayLongPress={500}
      >
        {/* Top Row: Domain Icon, Title and Status */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          {/* Domain Icon */}
          <View style={[
            styles.goalIconContainer, 
            { 
              backgroundColor: `${goalColor}15`,
              borderWidth: 1,
              borderColor: `${goalColor}30`,
              width: 32,
              height: 32,
              borderRadius: 16,
              marginRight: 12
            }
          ]}>
            <Ionicons 
              name={getDomainIcon(goal)} 
              size={16} 
              color={goal.completed ? "#4CAF50" : goalColor} 
            />
          </View>
          
          <Text 
            style={[styles.goalTitle, { 
              color: goal.completed ? theme.textSecondary : theme.text,
              textDecorationLine: goal.completed ? 'line-through' : 'none',
              fontSize: 20,
              fontWeight: '700',
              flex: 1,
              lineHeight: 28,
              marginRight: 16
            }]}
            maxFontSizeMultiplier={1.3}
          >
            {goal.title}
          </Text>
          
          {goal.completed ? (
            <View style={{
              backgroundColor: '#4CAF5020',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#4CAF5040'
            }}>
              <Text style={{
                color: '#4CAF50',
                fontSize: 12,
                fontWeight: '600'
              }}>
                Completed
              </Text>
            </View>
          ) : (
            <View style={{
              backgroundColor: `${goalColor}20`,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: `${goalColor}40`
            }}>
              <Text style={{
                color: goalColor,
                fontSize: 12,
                fontWeight: '600'
              }}>
                {progressPercentage}%
              </Text>
            </View>
          )}
        </View>
        
        {/* Progress Bar */}
        <View style={[styles.ultraCleanProgressBar, { 
          backgroundColor: `${goalColor}10`,
          marginBottom: 16
        }]}>
          <View style={[styles.ultraCleanProgressFill, { 
            backgroundColor: goal.completed ? "#4CAF50" : goalColor,
            width: `${progressPercentage}%`
          }]} />
        </View>
        
        {/* Bottom Row: Details and Actions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            {/* Milestone and Task Info */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              {goalMilestones.length > 0 && (
                <Text style={{
                  color: theme.textSecondary,
                  fontSize: 14,
                  fontWeight: '500',
                  marginRight: 12
                }}>
                  {completedMilestonesCount}/{goalMilestones.length} milestone{goalMilestones.length !== 1 ? 's' : ''}
                </Text>
              )}
              
              {/* Add task count - always show, even if 0 */}
              <Text style={{
                color: theme.textSecondary,
                fontSize: 14,
                fontWeight: '500'
              }}>
                {goalMilestones.length > 0 ? '• ' : ''}{completedTaskCount}/{taskCount} task{taskCount !== 1 ? 's' : ''}
              </Text>
            </View>
            
            {/* Due Date */}
            {timeInfo.text !== 'No due date' && (
              <Text style={{
                color: timeInfo.isOverdue ? '#FF5252' : 
                       timeInfo.isUrgent ? '#FF9800' : theme.textSecondary,
                fontSize: 12,
                fontWeight: timeInfo.isOverdue || timeInfo.isUrgent ? '600' : '500'
              }}>
                {timeInfo.text}
              </Text>
            )}
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {goal.completed ? (
              <TouchableOpacity 
                style={{
                  backgroundColor: theme.primary,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 24,
                  marginRight: 12
                }}
                onPress={onComplete}
              >
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: '600'
                }}>
                  Reactivate
                </Text>
              </TouchableOpacity>
            ) : progressPercentage === 100 ? (
              goal.isStandalone ? (
                // Clear All button for standalone sections
                <TouchableOpacity 
                  style={{
                    backgroundColor: theme.error || '#FF5252',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 24,
                    marginRight: 12,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                  onPress={() => {
                    if (goal.id === 'standalone-tasks') {
                      // Clear all standalone tasks
                      onClearAllStandaloneTasks && onClearAllStandaloneTasks();
                    } else if (goal.id === 'standalone-milestones') {
                      // Clear all standalone milestones
                      onClearAllStandaloneMilestones && onClearAllStandaloneMilestones();
                    }
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: '600'
                  }}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              ) : (
                // Complete button for regular goals
                <TouchableOpacity 
                  style={{
                    backgroundColor: goalColor,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 24,
                    marginRight: 12
                  }}
                  onPress={onComplete}
                >
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: '600'
                  }}>
                    {goalMilestones.length > 0 && completedMilestonesCount === goalMilestones.length ? '🎉 Complete' : 'Complete'}
                  </Text>
                </TouchableOpacity>
              )
            ) : null}
            
            <TouchableOpacity 
              style={{
                padding: 8
              }}
              onPress={() => {
                if (onExpandToggle) {
                  onExpandToggle();
                }
              }}
            >
              <Ionicons 
                name={expanded ? "chevron-up" : "chevron-down"} 
                size={22} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.milestonesContainer}>
          {/* Special rendering for standalone tasks - show tasks directly without milestones */}
          {goal.id === 'standalone-tasks' ? (
            goalStandaloneTasks.length === 0 ? (
              <View style={{ width: '100%' }}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No standalone tasks yet
                </Text>
                
                {/* Add Task Button for empty standalone tasks */}
                {navigation && (
                  <View style={styles.emptyGoalActions}>
                    <TouchableOpacity
                      style={[styles.createTaskButton, { 
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        marginTop: 8
                      }]}
                      onPress={() => navigation.navigate('TaskDetails', { 
                        mode: 'create',
                        preselectedGoalId: null // Explicitly null for standalone
                      })}
                    >
                      <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
                      <Text style={[styles.createButtonText, { color: theme.primary }]}>
                        Add Task
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <View>
                <View style={styles.tasksContainer}>
                  {isEditMode ? (
                    <View>
                      {goalStandaloneTasks.map((task, index) => (
                        <View key={task.id || `task-${index}`} style={styles.taskReorderItem}>
                          <View style={styles.taskReorderButtons}>
                            <TouchableOpacity
                              style={[styles.reorderButton, { opacity: index === 0 ? 0.3 : 1 }]}
                              onPress={() => {
                                if (index > 0) {
                                  // Move task up
                                  const newOrder = [...goalStandaloneTasks];
                                  [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                  onTaskReorder && onTaskReorder(newOrder, `${goal.id}-standalone-tasks`);
                                }
                              }}
                              disabled={index === 0}
                            >
                              <Ionicons name="chevron-up" size={16} color={theme.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.reorderButton, { opacity: index === goalStandaloneTasks.length - 1 ? 0.3 : 1 }]}
                              onPress={() => {
                                if (index < goalStandaloneTasks.length - 1) {
                                  // Move task down
                                  const newOrder = [...goalStandaloneTasks];
                                  [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                  onTaskReorder && onTaskReorder(newOrder, `${goal.id}-standalone-tasks`);
                                }
                              }}
                              disabled={index === goalStandaloneTasks.length - 1}
                            >
                              <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
                            </TouchableOpacity>
                          </View>
                          <View style={styles.taskReorderContent}>
                            <TaskCard
                              task={task}
                              onComplete={() => onTaskComplete(task.id)}
                              onDelete={() => onTaskDelete(task.id)}
                              isEditMode={isEditMode}
                              isDraggable={false}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    (() => {
                      console.log(`🟣 VIRTUAL MILESTONE DEBUG: Mapping ${goalStandaloneTasks.length} goalStandaloneTasks for virtual milestone`);
                      goalStandaloneTasks.forEach((task, i) => {
                        console.log(`🟣 VIRTUAL MILESTONE DEBUG: Task ${i + 1}: "${task.title}" (ID: ${task.id})`);
                      });
                      return goalStandaloneTasks;
                    })().map((task, index) => (
                      <TaskCard
                        key={task.id || `task-${index}`}
                        task={task}
                        onComplete={() => {
                          console.log(`🔥 VIRTUAL: "${task.title}" onComplete triggered`);
                          if (onTaskComplete) {
                            onTaskComplete(task.id);
                          } else {
                            console.log(`🔥 VIRTUAL: ERROR - no onTaskComplete`);
                          }
                        }}
                        onDelete={() => onTaskDelete(task.id)}
                        isEditMode={isEditMode}
                        isDraggable={false}
                      />
                    ))
                  )}
                </View>
                
                {/* Add Task Button when there are existing tasks - Made more consistent with milestone styling */}
                {navigation && (
                  <TouchableOpacity
                    style={[styles.createTaskButton, { 
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      margin: 12,
                      marginTop: 8,
                      marginBottom: 4
                    }]}
                    onPress={() => navigation.navigate('TaskDetails', { 
                      mode: 'create',
                      preselectedGoalId: null // Explicitly null for standalone
                    })}
                  >
                    <Ionicons name="add" size={16} color={theme.primary} />
                    <Text style={[styles.createTaskText, { color: theme.primary }]}>
                      Add Task
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          ) : goal.id === 'standalone-milestones' ? (
            /* Special rendering for standalone milestones - show milestones directly */
            allMilestones.length === 0 ? (
              <View style={{ width: '100%' }}>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No standalone milestones yet
                </Text>
                
                {/* Add Milestone Button for empty standalone milestones */}
                {navigation && (
                  <View style={styles.emptyGoalActions}>
                    <TouchableOpacity
                      style={[styles.createMilestoneButton, { 
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        marginTop: 8
                      }]}
                      onPress={() => navigation.navigate('ProjectDetails', { 
                        mode: 'create',
                        preselectedGoalId: null // Explicitly null for standalone
                      })}
                    >
                      <Ionicons name="flag-outline" size={20} color={theme.primary} />
                      <Text style={[styles.createButtonText, { color: theme.primary }]}>
                        Add Milestone
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : isEditMode ? (
              /* Edit mode - use DraggableFlatList for standalone milestones */
              (() => {
                console.log(`🔍 Using DraggableFlatList for ${goal.title} with ${allMilestones.length} milestones`);
                return (
                  <DraggableFlatList
                    data={allMilestones}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item: milestone, drag, isActive }) => (
                      <MilestoneCard
                        key={milestone.id || `milestone-${allMilestones.indexOf(milestone)}`}
                        milestone={milestone}
                        goalColor={goalColor}
                        tasks={tasks.filter(task => 
                          task.milestoneId === milestone.id || task.projectId === milestone.id
                        )}
                        expanded={expandedMilestones[milestone.id]}
                        onExpandToggle={() => toggleMilestone(milestone.id)}
                        onComplete={() => onMilestoneComplete(milestone.id)}
                        onEdit={() => onMilestoneEdit(milestone.id)}
                        onDelete={() => onMilestoneDelete(milestone.id)}
                        isEditMode={isEditMode}
                        onTaskComplete={onTaskComplete}
                        onTaskDelete={onTaskDelete}
                        onDrag={drag}
                        isActive={isActive}
                        isDraggable={true}
                        navigation={navigation}
                        goalId={goal.id}
                        onTaskReorder={onTaskReorder}
                      />
                    )}
                    keyExtractor={(item, index) => item.id || `milestone-${item.title}-${index}`}
                    onDragEnd={({ data }) => onMilestoneReorder && onMilestoneReorder(data, goal.id)}
                  />
                );
              })()
            ) : (
              /* Normal mode - use regular rendering */
              <View>
                {allMilestones.map((milestone, index) => (
                <MilestoneCard
                  key={milestone.id || `milestone-${index}`}
                  milestone={milestone}
                  goalColor={goalColor}
                  tasks={tasks.filter(task => 
                    task.milestoneId === milestone.id || task.projectId === milestone.id
                  )}
                  expanded={expandedMilestones[milestone.id]}
                  onExpandToggle={() => toggleMilestone(milestone.id)}
                  onComplete={() => onMilestoneComplete(milestone.id)}
                  onEdit={() => onMilestoneEdit(milestone.id)}
                  onDelete={() => onMilestoneDelete(milestone.id)}
                  isEditMode={isEditMode}
                  onTaskComplete={onTaskComplete}
                  onTaskDelete={onTaskDelete}
                  isDraggable={false}
                  navigation={navigation}
                  goalId={goal.id}
                  onTaskReorder={onTaskReorder}
                />
              ))}
                
                {/* Add Milestone Button when there are existing milestones */}
                {navigation && (
                  <TouchableOpacity
                    style={[styles.createMilestoneButton, { 
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      margin: 12,
                      marginTop: 8
                    }]}
                    onPress={() => navigation.navigate('ProjectDetails', { 
                      mode: 'create',
                      preselectedGoalId: null // Explicitly null for standalone
                    })}
                  >
                    <Ionicons name="flag-outline" size={20} color={theme.primary} />
                    <Text style={[styles.createButtonText, { color: theme.primary }]}>
                      Add Another Milestone
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          ) : allMilestones.length === 0 ? (
            <View>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No milestones or tasks
              </Text>
              
              {/* Action buttons for empty goal */}
              {!goal.isStandalone && navigation && (
                <View style={styles.emptyGoalActions}>
                  <TouchableOpacity
                    style={[styles.createMilestoneButton, { 
                      backgroundColor: theme.surface,
                      borderColor: theme.border 
                    }]}
                    onPress={() => {
                      navigation.navigate('MilestoneDetails', {
                        mode: 'create',
                        goalId: goal.id,
                        goalTitle: goal.title,
                        goalColor: goal.color
                      });
                    }}
                  >
                    <Ionicons name="add" size={20} color={theme.primary} />
                    <Text style={[styles.createMilestoneText, { color: theme.primary }]}>
                      Add Milestone
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.createTaskButton, { 
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      marginTop: 8
                    }]}
                    onPress={() => {
                      navigation.navigate('TaskDetails', {
                        mode: 'create',
                        preselectedGoalId: goal.id,
                        preselectedMilestoneId: null
                      });
                    }}
                  >
                    <Ionicons name="add" size={16} color={theme.primary} />
                    <Text style={[styles.createTaskText, { color: theme.primary }]}>
                      Add Task
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : isEditMode ? (
            <View>
              {/* Regular milestones in DraggableFlatList */}
              {(() => {
                const regularMilestones = allMilestones.filter(m => !m.isVirtual);
                console.log(`🔍 Using DraggableFlatList for ${goal.title} with ${regularMilestones.length} regular milestones`);
                return regularMilestones.length > 0 ? (
                  <DraggableFlatList
                    data={regularMilestones}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item: milestone, drag, isActive }) => (
                <MilestoneCard
                  key={milestone.id || `milestone-${allMilestones.indexOf(milestone)}`}
                  milestone={milestone}
                  goalColor={goalColor}
                  tasks={tasks}
                  expanded={expandedMilestones[milestone.id]}
                  onExpandToggle={() => toggleMilestone(milestone.id)}
                  onComplete={() => onMilestoneComplete(milestone.id)}
                  onEdit={() => onMilestoneEdit(milestone.id)}
                  onDelete={() => onMilestoneDelete(milestone.id)}
                  isEditMode={isEditMode}
                  onTaskComplete={onTaskComplete}
                  onTaskDelete={onTaskDelete}
                  onDrag={drag}
                  isActive={isActive}
                  isDraggable={true}
                  navigation={navigation}
                  goalId={goal.id}
                  onTaskReorder={onTaskReorder}
                />
                    )}
                    keyExtractor={(item, index) => item.id || `milestone-${item.title}-${index}`}
                    onDragEnd={({ data }) => onMilestoneReorder && onMilestoneReorder(data, goal.id)}
                  />
                ) : null;
              })()}
              
              {/* Virtual milestones rendered normally even in edit mode */}
              {allMilestones.filter(m => m.isVirtual).map((milestone, index) => (
                <MilestoneCard
                  key={milestone.id || `milestone-${index}`}
                  milestone={milestone}
                  goalColor={goalColor}
                  tasks={milestone.isVirtual ? goalStandaloneTasks : tasks}
                  expanded={expandedMilestones[milestone.id]}
                  onExpandToggle={() => toggleMilestone(milestone.id)}
                  onComplete={function() {
                    console.log(`🔥 MILESTONE COMPLETE CLICK: ${milestone.id} (isVirtual: ${milestone.isVirtual})`);
                    console.log('🔥 MILESTONE HANDLERS:', { onVirtualMilestoneComplete: !!onVirtualMilestoneComplete, onMilestoneComplete: !!onMilestoneComplete });
                    try {
                      if (milestone.isVirtual) {
                        console.log('🔥 CALLING VIRTUAL HANDLER');
                        onVirtualMilestoneComplete(milestone.id);
                      } else {
                        console.log('🔥 CALLING REGULAR HANDLER');
                        onMilestoneComplete(milestone.id);
                      }
                    } catch (error) {
                      console.error('🔥 ERROR in milestone complete:', error);
                    }
                  }}
                  onEdit={() => milestone.isVirtual ? null : onMilestoneEdit(milestone.id)}
                  onDelete={() => milestone.isVirtual ? onVirtualMilestoneDelete(milestone.id) : onMilestoneDelete(milestone.id)}
                  isEditMode={false} // Force virtual milestones to not be in edit mode
                  onTaskComplete={(taskId) => {
                    console.log(`🔥 VIRTUAL MILESTONE TAP: Task ${taskId} tapped in virtual milestone`);
                    onTaskComplete(taskId);
                  }}
                  onTaskDelete={onTaskDelete}
                  isDraggable={false}
                  navigation={navigation}
                  goalId={goal.id}
                  onTaskReorder={onTaskReorder}
                />
              ))}
            </View>
          ) : (
            <>
              {allMilestones.map((milestone, index) => (
                <MilestoneCard
                  key={milestone.id || `milestone-${index}`}
                  milestone={milestone}
                  goalColor={goalColor}
                  tasks={milestone.isVirtual ? goalStandaloneTasks : tasks}
                  expanded={expandedMilestones[milestone.id]}
                  onExpandToggle={() => toggleMilestone(milestone.id)}
                  onComplete={function() {
                    console.log(`🔥 MILESTONE COMPLETE CLICK: ${milestone.id} (isVirtual: ${milestone.isVirtual})`);
                    console.log('🔥 MILESTONE HANDLERS:', { onVirtualMilestoneComplete: !!onVirtualMilestoneComplete, onMilestoneComplete: !!onMilestoneComplete });
                    try {
                      if (milestone.isVirtual) {
                        console.log('🔥 CALLING VIRTUAL HANDLER');
                        onVirtualMilestoneComplete(milestone.id);
                      } else {
                        console.log('🔥 CALLING REGULAR HANDLER');
                        onMilestoneComplete(milestone.id);
                      }
                    } catch (error) {
                      console.error('🔥 ERROR in milestone complete:', error);
                    }
                  }}
                  onEdit={() => milestone.isVirtual ? null : onMilestoneEdit(milestone.id)}
                  onDelete={() => milestone.isVirtual ? onVirtualMilestoneDelete(milestone.id) : onMilestoneDelete(milestone.id)}
                  isEditMode={isEditMode}
                  onTaskComplete={onTaskComplete}
                  onTaskDelete={onTaskDelete}
                  isDraggable={false}
                  navigation={navigation}
                  goalId={goal.id}
                  onTaskReorder={onTaskReorder}
                />
              ))}
              
              {/* Create Milestone Button */}
              {!goal.isStandalone && (
                <TouchableOpacity
                  style={[styles.createMilestoneButton, { 
                    backgroundColor: theme.surface,
                    borderColor: theme.border 
                  }]}
                  onPress={() => {
                    navigation.navigate('MilestoneDetails', {
                      mode: 'create',
                      goalId: goal.id,
                      goalTitle: goal.title,
                      goalColor: goal.color
                    });
                  }}
                >
                  <Ionicons name="add" size={20} color={theme.primary} />
                  <Text style={[styles.createMilestoneText, { color: theme.primary }]}>
                    Create Milestone
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Create Task Button at goal level */}
              {!goal.isStandalone && navigation && (
                <TouchableOpacity
                  style={[styles.createTaskButton, { 
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    marginTop: 8
                  }]}
                  onPress={() => {
                    navigation.navigate('TaskDetails', {
                      mode: 'create',
                      preselectedGoalId: goal.id,
                      preselectedMilestoneId: null
                    });
                  }}
                >
                  <Ionicons name="add" size={16} color={theme.primary} />
                  <Text style={[styles.createTaskText, { color: theme.primary }]}>
                    Create Task
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
  
  return (
    <>
      {isDraggable ? (
        <ScaleDecorator>{CardContent}</ScaleDecorator>
      ) : (
        CardContent
      )}
      
      {/* Context Menu */}
      <MinimalistContextMenu
        visible={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        title="Goal Options"
        subtitle={goal.title}
        position={longPressPosition}
        options={contextMenuOptions}
      />

      {/* Delete Confirmation Dialog */}
      <MinimalistConfirmDialog
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Goal"
        message={`Are you sure you want to delete "${goal.title}"? This will also delete all milestones and tasks within it.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        destructive={true}
        icon="warning-outline"
      />
    </>
  );
};

// Empty State Component
const EmptyState = () => {
  const { theme } = useTheme();
  
  return (
    <View style={styles.emptyState}>
      <Ionicons name="compass-outline" size={80} color={theme.textSecondary} />
      <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
        Create goals, milestones, and tasks to set your direction
      </Text>
      <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
        Build a clear path toward what matters most
      </Text>
    </View>
  );
};

// Floating Add Button Component - Matches TimeScreen exactly
const FloatingAddButton = ({ onPress }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Animated.View 
      style={[
        styles.floatingAddButton, 
        {
          bottom: insets.bottom - scaleHeight(20), // A bit higher
          left: scaleWidth(20),
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.floatingAddButtonInner,
          {
            backgroundColor: theme.primary,
            width: Math.max(scaleWidth(60), 44),
            height: Math.max(scaleWidth(60), 44),
            borderRadius: Math.max(scaleWidth(60), 44) / 2,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Add new item"
        accessibilityHint="Opens menu to add goals, milestones, or tasks"
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
          style={styles.buttonGradient}
        />
        <Ionicons 
          name="add" 
          size={scaleWidth(28)} 
          color="#FFFFFF" 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main Component
const LifePlanOverviewScreen = ({ navigation, route, hideBackButton = false, onFullScreenToggle, isFullscreen = false, isEditMode = false, onEditModeToggle }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showSuccess, showError } = useNotification();
  const { triggerFireworks, triggerConfetti } = useGlobalAnimation();
  
  // App Tour Hook - MUST be called before any early returns
  const { 
    isTourActive,
    currentStep,
    shouldCollapseAll,
    spotlightTarget,
    nextStep,
    skipTour,
    updateGlobalTourState
  } = useAppTour(navigation);

  // Tour animation ref for goal lighting effect - start with 0 and track initial state
  const [tourGoalStarted, setTourGoalStarted] = useState(false);
  const tourGoalOpacity = useRef(new Animated.Value(0)).current;
  
  // Debug logging for tour state
  if (__DEV__) {
    console.log('🎯 LifePlanOverviewScreen Tour State:', { 
      isTourActive, 
      currentStep, 
      shouldShowOverlay: isTourActive && currentStep === 'OVERVIEW_PLAN'
    });
  }

  // Note: Removed temporary fix that was auto-skipping tour at GOAL_ACHIEVEMENT_VALIDATION
  // The GOAL_ACHIEVEMENT_VALIDATION step should run on ProfileScreen, not here
  
  // Handle screen focus for tour overlay timing
  useFocusEffect(
    React.useCallback(() => {
      if (isTourActive && currentStep === 'OVERVIEW_PLAN') {
        console.log('🎯 LifePlanOverviewScreen: Screen focused during tour, step =', currentStep);
        // Screen is now focused and ready for tour overlay
      }
    }, [isTourActive, currentStep])
  );
  
  // Collapse all goals and milestones when tour requests it
  useEffect(() => {
    if (shouldCollapseAll && isTourActive && currentStep === 'OVERVIEW_PLAN') {
      console.log('🎯 Tour: Collapsing all goals and milestones for clean demo start');
      setExpandedGoals({});
      setExpandedMilestones({});
      
      // Clear the collapse flag after applying
      updateGlobalTourState({ shouldCollapseAll: false });
    }
  }, [shouldCollapseAll, isTourActive, currentStep]);
  
  // Handle tour goal lighting animation - start dark then light up
  useEffect(() => {
    if (isTourActive && currentStep === 'OVERVIEW_PLAN') {
      console.log('🎯 Tour: Starting goal lighting animation - immediately setting to dark');
      
      // Track that we've started the tour goal process
      setTourGoalStarted(true);
      
      // Immediately start with goal dark (opacity 0) - no delay
      tourGoalOpacity.setValue(0);
      
      // Force an immediate re-render to ensure dark state
      setTimeout(() => {
        if (isTourActive && currentStep === 'OVERVIEW_PLAN') {
          // Light up the goal as the AI message appears (coordinate with overlay timing)
          // AppTourOverlay timing: 100ms overlay + 300ms delay + 200ms step delay + 400ms AI animation = 1000ms
          const lightUpDelay = 1200; // Start lighting slightly after AI message begins appearing
          
          setTimeout(() => {
            if (isTourActive && currentStep === 'OVERVIEW_PLAN') {
              console.log('🎯 Tour: Now lighting up the goal');
              Animated.timing(tourGoalOpacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true
              }).start(() => {
                console.log('🎯 Tour: Goal lighting animation complete');
              });
            }
          }, lightUpDelay);
        }
      }, 0); // Immediate but after current render cycle
    } else {
      // Reset when not in tour or different step
      setTourGoalStarted(false);
      tourGoalOpacity.setValue(0);
    }
  }, [isTourActive, currentStep]);
  
  // Get parameters from route
  const filter = route?.params?.filter || null;
  const autoOpenAdd = route?.params?.autoOpenAdd || false;
  
  // Get data from AppContext
  const appContext = useAppContext() || {};
  
  
  const { 
    goals = [], 
    projects: milestones = [], 
    tasks = [], 
    deleteGoal,
    deleteProject: deleteMilestone,
    deleteTask,
    deleteTasksBulk,
    updateTask,
    updateProject: updateMilestone,
    updateGoal,
    isLoading,
    setGoals,
    setProjects,
    setTasks,
    todos = [],
    tomorrowTodos = [],
    laterTodos = [],
    setTodos,
    setTomorrowTodos,
    setLaterTodos
  } = appContext;

  // Reordering handlers - defined early to avoid hoisting issues
  const handleGoalReorder = React.useCallback((data) => {
    console.log('Goals reordered:', data.map(g => g.title));
    if (setGoals && typeof setGoals === 'function') {
      try {
        const reorderedGoals = data.map((goal, index) => ({
          ...goal,
          order: index,
          updatedAt: new Date().toISOString()
        }));
        setGoals(reorderedGoals);
      } catch (error) {
        console.error('Error reordering goals:', error);
      }
    } else {
      console.warn('setGoals function not available:', { setGoals, type: typeof setGoals });
    }
  }, [setGoals]);

  const handleMilestoneReorder = React.useCallback((data, goalId) => {
    console.log('Milestones reordered:', data.map(m => m.title));
    if (setProjects && typeof setProjects === 'function') {
      try {
        // Add order property to reordered milestones
        const reorderedMilestones = data.map((milestone, index) => ({
          ...milestone,
          order: index,
          updatedAt: new Date().toISOString()
        }));
        
        // Merge the reordered milestones with other milestones not in this goal
        // Special handling for standalone milestones
        let otherMilestones;
        if (goalId === 'standalone-milestones') {
          // For standalone milestones, exclude milestones with null goalId
          otherMilestones = milestones.filter(m => m.goalId !== null);
        } else {
          // For regular goals, exclude milestones with this specific goalId
          otherMilestones = milestones.filter(m => m.goalId !== goalId);
        }
        
        const reorderedAllMilestones = [...otherMilestones, ...reorderedMilestones];
        setProjects(reorderedAllMilestones);
      } catch (error) {
        console.error('Error reordering milestones:', error);
      }
    } else {
      console.warn('setProjects function not available:', { setProjects, type: typeof setProjects });
    }
  }, [setProjects, milestones]);

  const handleTaskReorder = React.useCallback((data, milestoneId) => {
    console.log('🔄 Tasks reordered for milestone:', milestoneId);
    if (setTasks && typeof setTasks === 'function') {
      try {
        // Merge the reordered tasks with other tasks
        let otherTasks;
        if (milestoneId === 'standalone') {
          // For completely standalone tasks, filter out all standalone tasks and add the reordered ones
          otherTasks = tasks.filter(task => 
            task.milestoneId || task.projectId || task.goalId  // Keep tasks that belong to something
          );
        } else if (milestoneId.includes('-standalone-tasks')) {
          // For goal-level standalone tasks (virtual milestone), filter out tasks from this goal that have no milestone
          const goalId = milestoneId.replace('-standalone-tasks', '');
          otherTasks = tasks.filter(task => 
            // Keep tasks that don't match this goal's standalone tasks pattern
            !(task.goalId === goalId && !task.milestoneId && !task.projectId)
          );
        } else {
          // For regular milestones, filter out tasks from this specific milestone
          otherTasks = tasks.filter(task => 
            task.milestoneId !== milestoneId && task.projectId !== milestoneId
          );
        }
        
        // Add order property to reordered tasks with globally unique values
        // Calculate starting order based on other tasks to maintain global ordering
        const baseOrder = otherTasks.length;
        const reorderedTasks = data.map((task, index) => ({
          ...task,
          order: baseOrder + index,
          updatedAt: new Date().toISOString()
        }));
        
        const reorderedAllTasks = [...otherTasks, ...reorderedTasks];
        setTasks(reorderedAllTasks);
      } catch (error) {
        console.error('Error reordering tasks:', error);
      }
    } else {
      console.warn('setTasks function not available:', { setTasks, type: typeof setTasks });
    }
  }, [setTasks, tasks]);

  // Local state
  const [expandedGoals, setExpandedGoals] = useState({});
  const [expandedMilestones, setExpandedMilestones] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [internalEditMode, setInternalEditMode] = useState(false);
  
  // Handle tour special actions
  const handleTourSpecialAction = (action) => {
    if (action === 'expandGoal' && processedGoals.length > 0) {
      console.log('🎯 Tour: Expanding first goal to show milestones');
      const firstGoal = processedGoals[0];
      setExpandedGoals(prev => ({
        ...prev,
        [firstGoal.id]: true
      }));
    }
    
    if (action === 'expandMilestone' && processedGoals.length > 0) {
      console.log('🎯 Tour: Expanding first milestone to show tasks');
      const firstGoal = processedGoals[0];
      
      // Get milestones for this goal
      const goalMilestones = firstGoal.id === 'standalone-milestones' 
        ? standaloneMilestones 
        : firstGoal.id === 'standalone-tasks' 
        ? [] 
        : milestones.filter(milestone => milestone.goalId === firstGoal.id);
        
      if (goalMilestones.length > 0) {
        const firstMilestone = goalMilestones[0];
        console.log('🎯 Tour: Expanding milestone:', firstMilestone.id);
        setExpandedMilestones(prev => ({
          ...prev,
          [firstMilestone.id]: true
        }));
      }
    }
  };
  
  // Handle milestone expansion for tour
  const handleMilestoneExpandToggle = (milestoneId) => {
    setExpandedMilestones(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }));
  };
  
  // Modern delete confirmation dialog states
  const [showFirstDeleteConfirm, setShowFirstDeleteConfirm] = useState(false);
  const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);
  const [actualDeleteCounts, setActualDeleteCounts] = useState({ goals: 0, activeGoals: 0, completedGoals: 0, milestones: 0, tasks: 0 });

  // Use internal edit mode if onEditModeToggle is not provided
  const editMode = onEditModeToggle ? isEditMode : internalEditMode;
  const toggleEditMode = onEditModeToggle || (() => setInternalEditMode(!internalEditMode));

  // Auto-open add modal if parameter is passed
  useEffect(() => {
    if (autoOpenAdd && !showAddModal) {
      setShowAddModal(true);
      // Clear the parameter to prevent reopening on subsequent renders
      try {
        navigation.setParams({ autoOpenAdd: false });
      } catch (error) {
        console.warn('Error clearing autoOpenAdd param:', error);
      }
    }
  }, [autoOpenAdd, showAddModal, navigation]);

  // Helper function to generate celebration colors based on goal color
  const generateCelebrationColors = (goalColor) => {
    if (!goalColor || goalColor === '#FFFFFF') {
      // Default colors for white or undefined goal colors
      return {
        confetti: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        fireworks: ['#FFD93D', '#FF6B6B', '#4ECDC4']
      };
    }

    // Function to lighten/darken a hex color
    const adjustBrightness = (hex, factor) => {
      const rgb = hex.replace('#', '').match(/.{2}/g);
      if (!rgb) return hex;
      
      return '#' + rgb.map(channel => {
        const value = parseInt(channel, 16);
        const adjusted = Math.round(value * factor);
        return Math.min(255, Math.max(0, adjusted)).toString(16).padStart(2, '0');
      }).join('');
    };

    // Generate variations of the goal color
    const baseColor = goalColor;
    const lighterColor = adjustBrightness(baseColor, 1.3);
    const darkerColor = adjustBrightness(baseColor, 0.7);
    
    return {
      confetti: [baseColor, lighterColor, darkerColor],
      fireworks: [lighterColor, baseColor, darkerColor]
    };
  };

  // Debug: Check goals data
  const completedGoals = goals.filter(goal => goal.completed);

  // Define standalone items (always needed for rendering)
  // More comprehensive check for standalone milestones
  const standaloneMilestones = milestones.filter(milestone => {
    // Check for any falsy goalId value
    const goalId = milestone.goalId;
    const hasNoGoal = 
      goalId === null ||
      goalId === undefined ||
      goalId === '' ||
      goalId === 'null' ||
      goalId === 'undefined' ||
      goalId === 'NULL' ||
      goalId === 'UNDEFINED' ||
      !goalId;
    
    // Include all standalone milestones (both completed and non-completed)
    return hasNoGoal;
  });
  
  // DEBUG: Log the standalone milestones count that the display is seeing
  React.useEffect(() => {
    console.log(`🔍 DISPLAY LOGIC - Standalone milestones count: ${standaloneMilestones.length}`);
    console.log(`🔍 DISPLAY LOGIC - Total AppContext milestones: ${milestones.length}`);
    if (standaloneMilestones.length > 0) {
      console.log(`🔍 DISPLAY LOGIC - First few standalone milestones:`, 
        standaloneMilestones.slice(0, 5).map(m => ({ title: m.title, id: m.id, goalId: m.goalId }))
      );
    }
  }, [standaloneMilestones.length, milestones.length]);
  
  const standaloneTasks = tasks.filter(task => !task.projectId && !task.milestoneId && !task.goalId);
  
  // Debug: Check for duplicate task IDs
  const taskIds = tasks.map(t => t.id);
  const duplicateIds = taskIds.filter((id, index) => taskIds.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    console.warn('⚠️ Duplicate task IDs found in tasks array:', duplicateIds);
  }
  
  // Debug: Check if any standalone task also has a milestoneId/projectId (shouldn't happen)
  standaloneTasks.forEach(task => {
    if (task.id === 'task_1756631863775_soxqegbpx') {
      console.warn('🔍 Found problematic task in standalone:', task);
    }
  });
  
  // Check if the problematic task appears in milestone tasks
  tasks.forEach(task => {
    if (task.id === 'task_1756631863775_soxqegbpx') {
      console.warn('🔍 Found problematic task in all tasks:', {
        id: task.id,
        milestoneId: task.milestoneId,
        projectId: task.projectId,
        goalId: task.goalId,
        title: task.title
      });
    }
  });
  
  
  // Process data based on filter
  let processedGoals = [];
  let filteredMilestones = [];
  let filteredTasks = [];
  
  
  if (filter === 'goals') {
    // Show only goals (no milestones or tasks)
    processedGoals = goals.filter(goal => !goal.completed);
  } else if (filter === 'milestones') {
    // Show all milestones in a flat list
    filteredMilestones = milestones;
  } else if (filter === 'tasks') {
    // Show all tasks in a flat list
    filteredTasks = tasks;
  } else {
    // Default: Show full hierarchy (existing behavior)
    processedGoals = goals.filter(goal => !goal.completed);
  }
  
  // Only add standalone items when showing full hierarchy (no filter)
  if (!filter) {
    // Check if standalone sections already exist to avoid duplicates
    const hasStandaloneTasks = processedGoals.some(g => g.id === 'standalone-tasks');
    const hasStandaloneMilestones = processedGoals.some(g => g.id === 'standalone-milestones');
    
    // Add standalone milestones goal if there are standalone milestones and not already added
    if (standaloneMilestones.length > 0 && !hasStandaloneMilestones) {
      processedGoals.push({
        id: 'standalone-milestones',
        title: 'Standalone Milestones',
        isStandalone: true,
        color: '#9CA3AF'  // Changed to a gray color for better visibility
      });
    }
    
    // Add standalone tasks goal if there are standalone tasks and not already added
    if (standaloneTasks.length > 0 && !hasStandaloneTasks) {
      processedGoals.push({
        id: 'standalone-tasks',
        title: 'Standalone Tasks',
        isStandalone: true,
        color: '#9CA3AF'  // Changed to a gray color for better visibility
      });
    }
  }

  const toggleGoal = (goalId) => {
    setExpandedGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
  };

  const handleClearFilter = () => {
    try {
      navigation.setParams({ filter: null });
    } catch (error) {
      console.warn('Error clearing filter param:', error);
    }
  };

  const handleAddButtonPress = () => {
    setShowAddModal(true);
  };

  const handleModalChoice = (choice) => {
    setShowAddModal(false);
    
    // Navigate to appropriate creation screen based on choice
    switch (choice) {
      case 'goal':
        navigation.navigate('GoalDetails', { mode: 'create' });
        break;
      case 'milestone':
        // For milestone creation, we could preselect the first expanded goal if any
        const firstExpandedGoalId = Object.keys(expandedGoals).find(goalId => expandedGoals[goalId]);
        navigation.navigate('ProjectDetails', { 
          mode: 'create',
          preselectedGoalId: firstExpandedGoalId || null
        });
        break;
      case 'task':
        // For task creation, try to find context from expanded goals/milestones
        const expandedGoalIds = Object.keys(expandedGoals).filter(goalId => expandedGoals[goalId]);
        
        if (expandedGoalIds.length === 1) {
          // If exactly one goal is expanded, create task for that goal
          const goalId = expandedGoalIds[0];
          if (goalId.startsWith('standalone-')) {
            // For standalone sections, don't preselect anything
            navigation.navigate('TaskDetails', { mode: 'create' });
          } else {
            // For real goals, preselect the goal
            navigation.navigate('TaskDetails', { 
              mode: 'create',
              preselectedGoalId: goalId,
              preselectedMilestoneId: null
            });
          }
        } else {
          // Multiple or no goals expanded - let user choose
          navigation.navigate('TaskDetails', { mode: 'create' });
        }
        break;
    }
  };

  // Event Handlers
  const handleClearAllStandaloneTasks = async () => {
    try {
      // Clear ALL standalone tasks (button only appears when all are completed)
      // Since progressPercentage === 100 when this button appears, all tasks should be completed
      if (standaloneTasks.length === 0) return;
      
      // Get task IDs for bulk deletion - DELETE ALL standalone tasks
      const taskIdsToDelete = standaloneTasks.map(task => task.id);
      
      // Use bulk delete to avoid race conditions
      const deletedTasks = await deleteTasksBulk(taskIdsToDelete);
      
      if (deletedTasks && deletedTasks.length > 0) {
        // Trigger fireworks animation with a nice color
        const celebrationColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        triggerFireworks(celebrationColors, 5000);
        showSuccess(`Cleared ${deletedTasks.length} tasks! 🎆`);
      } else {
        showError('Failed to clear tasks');
      }
    } catch (error) {
      console.error('Error clearing standalone tasks:', error);
      showError('Failed to clear tasks');
    }
  };

  const handleClearAllStandaloneMilestones = async () => {
    console.log(`🚀 CLEAR ALL STANDALONE MILESTONES - Starting function`);
    
    try {
      // CRITICAL: Capture milestone data at the start before any state changes
      // Clear ALL standalone milestones, not just completed ones, since the button only appears when all should be cleared
      console.log(`🔍 Total standaloneMilestones array:`, standaloneMilestones);
      
      const milestonesToDelete = standaloneMilestones.map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        completed: milestone.completed
      }));
      
      console.log(`🔍 Clear All: Found ${milestonesToDelete.length} standalone milestones to delete:`, milestonesToDelete);
      
      if (milestonesToDelete.length === 0) {
        console.log(`❌ No milestones to delete - exiting early`);
        return;
      }
      
      // BULK DELETION APPROACH - Bypass individual deleteMilestone calls to avoid race conditions
      console.log(`🔄 Starting bulk deletion of ${milestonesToDelete.length} milestones...`);
      
      const milestoneIdsToDelete = milestonesToDelete.map(m => m.id);
      console.log(`🗑️ Milestone IDs to delete:`, milestoneIdsToDelete);
      
      // Update milestones array by filtering out all the milestones we want to delete
      const updatedMilestones = milestones.filter(milestone => 
        !milestoneIdsToDelete.includes(milestone.id)
      );
      
      console.log(`📊 Milestones before: ${milestones.length}, after: ${updatedMilestones.length}`);
      
      // Update AsyncStorage
      console.log(`💾 Saving updated milestones to AsyncStorage...`);
      await AsyncStorage.setItem('projects', JSON.stringify(updatedMilestones));
      
      // Update the context state
      console.log(`🔄 Updating context state...`);
      if (setProjects) {
        setProjects(updatedMilestones);
      }
      
      // Also clean up associated tasks if any exist
      const tasksToDelete = tasks.filter(task => 
        milestoneIdsToDelete.includes(task.milestoneId) || 
        milestoneIdsToDelete.includes(task.projectId)
      );
      
      if (tasksToDelete.length > 0) {
        console.log(`🧹 Found ${tasksToDelete.length} associated tasks to clean up`);
        const updatedTasks = tasks.filter(task => 
          !milestoneIdsToDelete.includes(task.milestoneId) && 
          !milestoneIdsToDelete.includes(task.projectId)
        );
        
        await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
        if (setTasks) {
          setTasks(updatedTasks);
        }
        console.log(`🧹 Cleaned up ${tasksToDelete.length} associated tasks`);
      }
      
      const deletedCount = milestonesToDelete.length;
      console.log(`✅ Bulk deletion complete: ${deletedCount} milestones deleted`);
      
      // Trigger fireworks animation
      const celebrationColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
      triggerFireworks(celebrationColors, 5000);
      showSuccess(`Cleared ${deletedCount} standalone milestones! 🎆`);
      
    } catch (error) {
      console.error('Error clearing standalone milestones:', error);
      showError('Failed to clear milestones');
    }
  };

  const handleTaskComplete = (taskId) => {
    console.log(`🔥 HANDLER: handleTaskComplete called for ${taskId}`);
    
    // Find the task to get its projectId/milestoneId and current status
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.log(`🔥 HANDLER: Task not found: ${taskId}`);
      return;
    }
    
    const isCurrentlyCompleted = task.completed || task.status === 'done';
    const newCompletedStatus = !isCurrentlyCompleted;
    console.log(`🔥 HANDLER: "${task.title}" ${isCurrentlyCompleted ? 'UNCOMPLETING' : 'COMPLETING'}`);
    
    
    // Use projectId or milestoneId (they should be the same for milestones)
    const milestoneId = task.projectId || task.milestoneId;
    
    // For standalone tasks (no milestoneId), call updateTask differently
    if (updateTask) {
      if (milestoneId) {
        // Task belongs to a milestone
        updateTask(milestoneId, taskId, { 
          completed: newCompletedStatus, 
          status: newCompletedStatus ? 'done' : 'todo',
          updatedAt: new Date().toISOString()
        });
      } else {
        // Standalone task - call updateTask with null milestoneId
        updateTask(null, taskId, { 
          completed: newCompletedStatus, 
          status: newCompletedStatus ? 'done' : 'todo',
          updatedAt: new Date().toISOString()
        });
      }
      showSuccess(newCompletedStatus ? 'Task completed!' : 'Task reopened!');
    }
  };

  const handleTaskDelete = (taskId) => {
    if (deleteTask) {
      // Find the task to get its projectId
      const task = tasks.find(t => t.id === taskId);
      const projectId = task?.projectId || task?.milestoneId;
      deleteTask(projectId, taskId);
      showSuccess('Task deleted');
    }
  };

  // Virtual milestone handlers - need to be defined early before use in JSX
  const handleVirtualMilestoneDelete = (virtualMilestoneId) => {
    // Extract the real goal ID from the virtual milestone ID
    const realGoalId = virtualMilestoneId.replace('-standalone-tasks', '');
    
    // Find all standalone tasks for this goal
    const standaloneTasksToDelete = tasks.filter(task => 
      task.goalId === realGoalId && 
      (!task.milestoneId || task.milestoneId === null) &&
      (!task.projectId || task.projectId === null)
    );
    
    if (standaloneTasksToDelete.length === 0) {
      showError('No standalone tasks to delete');
      return;
    }
    
    Alert.alert(
      'Delete Standalone Tasks',
      `Are you sure you want to delete all ${standaloneTasksToDelete.length} standalone tasks in this goal?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete each standalone task
              for (const task of standaloneTasksToDelete) {
                if (deleteTask) {
                  await deleteTask(null, task.id); // null for milestoneId since these are standalone
                }
              }
              showSuccess(`Deleted ${standaloneTasksToDelete.length} standalone tasks`);
            } catch (error) {
              console.error('Error deleting standalone tasks:', error);
              showError('Failed to delete some standalone tasks');
            }
          }
        }
      ]
    );
  };

  const handleVirtualMilestoneComplete = async (virtualMilestoneId) => {
    console.log(`🔥 VIRTUAL MILESTONE COMPLETE: Handler called for ${virtualMilestoneId}`);
    
    if (!virtualMilestoneId || !virtualMilestoneId.includes('-standalone-tasks')) {
      console.error('🔥 VIRTUAL MILESTONE COMPLETE: Invalid milestone ID');
      showError('Invalid milestone');
      return;
    }
    
    // Extract the real goal ID from the virtual milestone ID
    const realGoalId = virtualMilestoneId.replace('-standalone-tasks', '');
    console.log(`🔥 VIRTUAL MILESTONE COMPLETE: Real goal ID = ${realGoalId}`);
    
    // Find all standalone tasks for this goal
    const standaloneTasks = tasks.filter(task => 
      task.goalId === realGoalId && 
      (!task.milestoneId || task.milestoneId === null) &&
      (!task.projectId || task.projectId === null)
    );
    
    console.log(`🔥 VIRTUAL MILESTONE COMPLETE: Found ${standaloneTasks.length} standalone tasks`);
    standaloneTasks.forEach((task, i) => {
      console.log(`🔥 VIRTUAL MILESTONE COMPLETE: Task ${i + 1}: "${task.title}" (completed: ${task.completed})`);
    });
    
    if (standaloneTasks.length === 0) {
      showError('No standalone tasks to complete');
      return;
    }
    
    const incompleteTasks = standaloneTasks.filter(task => !task.completed && task.status !== 'done');
    
    if (incompleteTasks.length === 0) {
      console.log('🔥 VIRTUAL MILESTONE: All tasks already completed, deleting them');
      
      try {
        // Delete all completed standalone tasks (clear them out)
        const taskIdsToDelete = standaloneTasks.map(task => task.id);
        console.log(`🔥 VIRTUAL MILESTONE: Deleting ${taskIdsToDelete.length} completed tasks`);
        
        // Use bulk delete to remove all completed standalone tasks
        const deletedTasks = await deleteTasksBulk(taskIdsToDelete);
        
        if (deletedTasks && deletedTasks.length > 0) {
          showSuccess(`Cleared ${deletedTasks.length} completed tasks! 🎉`);
          // Trigger celebration animation
          triggerFireworks(['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'], 3000);
        } else {
          showError('Failed to clear completed tasks');
        }
      } catch (error) {
        console.error('🔥 VIRTUAL MILESTONE: Error deleting completed tasks:', error);
        showError('Failed to clear completed tasks');
      }
      return;
    }
    
    try {
      // Complete each incomplete standalone task directly
      for (const task of incompleteTasks) {
        if (updateTask) {
          await updateTask(null, task.id, { 
            completed: true, 
            status: 'done',
            updatedAt: new Date().toISOString()
          });
        }
      }
      showSuccess(`Completed ${incompleteTasks.length} standalone tasks!`);
    } catch (error) {
      console.error('Error completing standalone tasks:', error);
      showError('Failed to complete some standalone tasks');
    }
  };

  const handleMilestoneComplete = (milestoneId) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone && updateMilestone) {
      const isCurrentlyCompleted = milestone.completed;
      const newCompletedStatus = !isCurrentlyCompleted;
      
      if (newCompletedStatus) {
        // Completing the milestone
        const parentGoal = goals.find(g => g.id === milestone.goalId);
        const goalColor = parentGoal?.color || parentGoal?.domain?.color;
        
        // Generate colors based on the goal's domain color
        const colors = generateCelebrationColors(goalColor);
        
        updateMilestone({ 
          ...milestone, 
          completed: true, 
          status: 'done',
          updatedAt: new Date().toISOString()
        });
        
        // Trigger global confetti animation
        triggerConfetti(colors.confetti, 4000);
        showSuccess('Milestone completed! 🎉');
      } else {
        // Reactivating the milestone
        updateMilestone({ 
          ...milestone, 
          completed: false, 
          status: 'active',
          updatedAt: new Date().toISOString()
        });
        showSuccess('Milestone reactivated!');
      }
    }
  };

  const handleMilestoneEdit = (milestoneId) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    console.log('🔍 Editing milestone:', { milestoneId, milestone: milestone?.title });
    navigation.navigate('ProjectDetails', { 
      mode: 'edit', 
      projectId: milestoneId,
      milestone: milestone // Pass the actual milestone/project object
    });
  };

  const handleMilestoneDelete = (milestoneId) => {
    if (deleteMilestone) {
      deleteMilestone(milestoneId);
      showSuccess('Milestone deleted');
    }
  };


  const handleGoalEdit = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    navigation.navigate('GoalDetails', { 
      mode: 'edit', 
      goalId: goalId,
      goal: goal // Pass the actual goal object
    });
  };

  const handleGoalComplete = async (goalId) => {
    // Find the goal and update it to completed/uncompleted
    const goal = goals.find(g => g.id === goalId);
    
    if (goal && updateGoal) {
      if (goal.completed) {
        // Reactivate the goal
        updateGoal({ 
          ...goal, 
          completed: false, 
          status: 'active',
          completedAt: null,
          updatedAt: new Date().toISOString()
        });
        showSuccess('Goal reactivated! 🔄');
      } else {
        // Complete the goal
        const goalColor = goal.color || goal.domain?.color;
        const colors = generateCelebrationColors(goalColor);
        
        updateGoal({ 
          ...goal, 
          completed: true, 
          status: 'done',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        // Trigger global fireworks animation
        triggerFireworks(colors.fireworks, 5000);
        showSuccess('Goal completed! 🎆');
        
        // Track achievement for goal completion
        try {
          await AchievementService.checkAchievements({
            type: 'goal_completed',
            isPro: subscription?.status === 'pro' || subscription?.status === 'unlimited'
          }, showSuccess);
        } catch (error) {
          console.error('Error tracking goal completion achievement:', error);
        }
      }
    }
  };

  const handleGoalDelete = (goalId) => {
    if (deleteGoal) {
      deleteGoal(goalId);
      showSuccess('Goal deleted');
    }
  };

  const handleDeleteAll = async () => {
    try {
      // CRITICAL FIX: Force AppContext to sync with AsyncStorage FIRST
      console.log('🚨 FORCING AppContext sync with AsyncStorage before counting...');
      if (appContext && appContext.refreshData) {
        await appContext.refreshData();
        console.log('✅ AppContext refreshed, new counts:', {
          goals: appContext.goals?.length || 0,
          milestones: appContext.projects?.length || 0,
          tasks: appContext.tasks?.length || 0
        });
      }
      
      // Get actual counts from AsyncStorage to show accurate numbers
      const [goalsStorage, milestonesStorage, tasksStorage] = await Promise.all([
        AsyncStorage.getItem('goals'),
        AsyncStorage.getItem('projects'), // Fixed: milestones are stored as 'projects'
        AsyncStorage.getItem('tasks')
      ]);
      
      const actualGoals = goalsStorage ? JSON.parse(goalsStorage) : [];
      const actualMilestones = milestonesStorage ? JSON.parse(milestonesStorage) : [];
      const actualTasks = tasksStorage ? JSON.parse(tasksStorage) : [];
      
      // CRITICAL FIX: Use AppContext data for counts (what the UI actually shows)
      const activeGoals = goals.filter(goal => !goal.completed);
      const completedGoals = goals.filter(goal => goal.completed);
      
      // Count standalone milestones from AppContext (what the UI shows)
      const appContextStandaloneMilestones = milestones.filter(milestone => {
        const goalId = milestone.goalId;
        const hasNoGoal = 
          goalId === null ||
          goalId === undefined ||
          goalId === '' ||
          goalId === 'null' ||
          goalId === 'undefined' ||
          goalId === 'NULL' ||
          goalId === 'UNDEFINED' ||
          !goalId;
        return hasNoGoal;
      });
      
      console.log(`🔍 DATA COMPARISON:`);
      console.log(`  - AsyncStorage milestones: ${actualMilestones.length}`);
      console.log(`  - AppContext milestones: ${milestones.length}`);
      console.log(`  - AppContext standalone milestones: ${appContextStandaloneMilestones.length}`);
      console.log(`  - AsyncStorage tasks: ${actualTasks.length}`);
      console.log(`  - AppContext tasks: ${tasks.length}`);
      
      // Use AppContext counts for accurate user-facing numbers
      setActualDeleteCounts({
        goals: goals.length,
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        milestones: milestones.length,  // Use AppContext count (what UI shows)
        tasks: tasks.length  // Use AppContext count (what UI shows)  
      });
      
      console.log(`🔍 ACCURATE DELETE COUNTS: ${goals.length} goals, ${milestones.length} milestones, ${tasks.length} tasks`);
    } catch (error) {
      console.error('Error getting accurate counts:', error);
      // Fallback to AppContext counts
      const activeGoals = goals.filter(goal => !goal.completed);
      const completedGoals = goals.filter(goal => goal.completed);
      
      setActualDeleteCounts({
        goals: goals.length,
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        milestones: milestones.length,
        tasks: tasks.length
      });
    }
    
    setShowFirstDeleteConfirm(true);
  };

  const handleFirstDeleteConfirm = () => {
    setShowFirstDeleteConfirm(false);
    // Small delay for better UX
    setTimeout(() => {
      setShowFinalDeleteConfirm(true);
    }, 200);
  };

  const handleFinalDeleteConfirm = async () => {
    setShowFinalDeleteConfirm(false);
    
    // Small delay for better UX before starting deletion
    setTimeout(async () => {
                    try {
                      // AGGRESSIVE NUCLEAR WIPE - Clear everything immediately and comprehensively
                      console.log(`☢️ NUCLEAR WIPE: Starting aggressive complete data deletion...`);
                      
                      // STEP 1: Complete AsyncStorage wipe of ALL related data
                      console.log(`🧹 STEP 1: Nuclear AsyncStorage wipe...`);
                      const keysToWipe = [
                        'goals', 'projects', 'tasks', 'milestones',
                        'todos', 'tomorrowTodos', 'laterTodos',
                        'completedGoals', 'activeGoals', 
                        'onboardingCompleted', 'hasCreatedFirstGoal',
                        'forceProfileClear'
                      ];
                      
                      await Promise.all(keysToWipe.map(key => AsyncStorage.setItem(key, '[]')));
                      
                      // Also set some flags to empty
                      await Promise.all([
                        AsyncStorage.setItem('onboardingCompleted', 'false'),
                        AsyncStorage.setItem('hasCreatedFirstGoal', 'false'),
                        AsyncStorage.setItem('forceProfileClear', 'true')
                      ]);
                      
                      console.log(`✅ STEP 1: Nuclear AsyncStorage wipe complete`);
                      
                      // STEP 2: Aggressive AppContext clearing - multiple methods
                      console.log(`🚨 STEP 2: Aggressive AppContext clearing...`);
                      
                      if (appContext) {
                        // Clear all state arrays
                        if (appContext.setGoals) appContext.setGoals([]);
                        if (appContext.setProjects) appContext.setProjects([]);
                        if (appContext.setTasks) appContext.setTasks([]);
                        if (appContext.setTodos) appContext.setTodos([]);
                        if (appContext.setTomorrowTodos) appContext.setTomorrowTodos([]);
                        if (appContext.setLaterTodos) appContext.setLaterTodos([]);
                        
                        // Force refresh from now-empty AsyncStorage
                        if (appContext.refreshData) {
                          await appContext.refreshData();
                        }
                        
                        // Double-clear after refresh just to be sure
                        if (appContext.setGoals) appContext.setGoals([]);
                        if (appContext.setProjects) appContext.setProjects([]);
                        if (appContext.setTasks) appContext.setTasks([]);
                      }
                      
                      console.log(`✅ STEP 2: Aggressive AppContext clearing complete`);
                      
                      // STEP 3: Clear todo state in this component
                      console.log(`🧹 STEP 3: Clearing component todo state...`);
                      if (setTodos) setTodos([]);
                      if (setTomorrowTodos) setTomorrowTodos([]);
                      if (setLaterTodos) setLaterTodos([]);
                      
                      // STEP 4: Final verification and logging
                      console.log(`🔍 STEP 4: Final verification...`);
                      
                      const [verifyGoals, verifyProjects, verifyTasks] = await Promise.all([
                        AsyncStorage.getItem('goals'),
                        AsyncStorage.getItem('projects'), 
                        AsyncStorage.getItem('tasks')
                      ]);
                      
                      console.log(`📦 FINAL VERIFICATION - AsyncStorage:`);
                      console.log(`  - goals: ${verifyGoals}`);
                      console.log(`  - projects: ${verifyProjects}`);
                      console.log(`  - tasks: ${verifyTasks}`);
                      
                      console.log(`📊 FINAL VERIFICATION - AppContext:`);
                      console.log(`  - goals: ${appContext?.goals?.length || 0}`);
                      console.log(`  - projects: ${appContext?.projects?.length || 0}`);
                      console.log(`  - tasks: ${appContext?.tasks?.length || 0}`);
                      
                      console.log(`☢️ NUCLEAR WIPE COMPLETE - Everything obliterated!`);
                      
                      showSuccess('All data completely deleted! 🧹');
                      
                    } catch (error) {
                      console.error('Error deleting all data:', error);
                      showError('Failed to delete data');
                    }
    }, 300);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        backgroundColor={theme.statusBar || theme.background} 
        barStyle={theme.dark ? 'light-content' : 'dark-content'} 
      />
      
      
      {/* Header - MAXIMUM TOP */}
      <View style={{ marginTop: -100, paddingTop: insets.top }}>
        <LifePlanHeader 
          isFullscreen={isFullscreen}
          onFullScreenToggle={onFullScreenToggle}
          isEditMode={editMode}
          onEditModeToggle={toggleEditMode}
          filter={filter}
          onClearFilter={handleClearFilter}
        />
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        {(processedGoals.length === 0 && !filter) ? (
          <EmptyState />
        ) : editMode ? (
          <DraggableFlatList
            data={processedGoals}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: goal, drag, isActive }) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                milestones={goal.id === 'standalone-milestones' ? standaloneMilestones : 
                           goal.id === 'standalone-tasks' ? [] : 
                           milestones.filter(milestone => milestone.goalId === goal.id)}
                tasks={goal.id === 'standalone-tasks' ? standaloneTasks : 
                       goal.id === 'standalone-milestones' ? tasks :  // Pass all tasks so milestones can filter
                       (() => {
                         // Get milestones for this goal
                         const goalMilestones = milestones.filter(m => m.goalId === goal.id);
                         const goalMilestoneIds = goalMilestones.map(m => m.id);
                         // Return tasks that belong to this goal directly or via its milestones
                         // Check both milestoneId and projectId for backward compatibility
                         return tasks.filter(task => 
                           task.goalId === goal.id || 
                           goalMilestoneIds.includes(task.milestoneId) ||
                           goalMilestoneIds.includes(task.projectId)
                         );
                       })()}
                expanded={expandedGoals[goal.id]}
                onExpandToggle={() => toggleGoal(goal.id)}
                onEdit={() => handleGoalEdit(goal.id)}
                onDelete={() => handleGoalDelete(goal.id)}
                onComplete={() => handleGoalComplete(goal.id)}
                isEditMode={editMode}
                onTaskComplete={handleTaskComplete}
                onTaskDelete={handleTaskDelete}
                onMilestoneComplete={handleMilestoneComplete}
                onMilestoneEdit={handleMilestoneEdit}
                onMilestoneDelete={handleMilestoneDelete}
                onClearAllStandaloneTasks={handleClearAllStandaloneTasks}
                onClearAllStandaloneMilestones={handleClearAllStandaloneMilestones}
                onVirtualMilestoneComplete={handleVirtualMilestoneComplete}
                onVirtualMilestoneDelete={handleVirtualMilestoneDelete}
                onDrag={drag}
                isActive={isActive}
                isDraggable={true}
                navigation={navigation}
                onMilestoneReorder={handleMilestoneReorder}
                onTaskReorder={handleTaskReorder}
              />
            )}
            keyExtractor={(item) => item.id || `goal-${item.title}-${processedGoals.indexOf(item)}`}
            onDragEnd={({ data }) => handleGoalReorder(data)}
            ListFooterComponent={() => (
              processedGoals.length > 0 ? (
                <View style={styles.deleteAllContainer}>
                  <TouchableOpacity 
                    style={[styles.deleteAllButton, { 
                      backgroundColor: theme.error || '#FF6B6B',
                      borderColor: theme.border 
                    }]}
                    onPress={handleDeleteAll}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.deleteAllText}>Clear All Life Plan Data</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            )}
            containerStyle={{ flex: 1 }}
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {filter === 'milestones' ? (
              // Show milestones in a flat list
              filteredMilestones.length > 0 ? (
                  filteredMilestones.map((milestone) => (
                    <View key={milestone.id} style={[styles.filteredMilestoneCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <Text style={[styles.milestoneTitle, { color: theme.text }]} maxFontSizeMultiplier={1.3}>
                        {milestone.title}
                      </Text>
                      <Text style={[styles.milestoneDescription, { color: theme.textSecondary }]} maxFontSizeMultiplier={1.3}>
                        {milestone.description || 'No description'}
                      </Text>
                      <View style={styles.filteredMilestoneStats}>
                        {milestone.goalId && (
                          <Text style={[styles.filteredMilestoneGoal, { color: milestone.color || milestone.domain?.color || theme.primary }]} maxFontSizeMultiplier={1.3}>
                            Goal: {goals.find(g => g.id === milestone.goalId)?.title || 'Unknown Goal'}
                          </Text>
                        )}
                        <Text style={[styles.filteredMilestoneTaskCount, { color: milestone.color || milestone.domain?.color || theme.primary }]} maxFontSizeMultiplier={1.3}>
                          {tasks.filter(t => t.projectId === milestone.id || t.milestoneId === milestone.id).length} tasks
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="folder-outline" size={64} color={theme.textSecondary} />
                    <Text style={[styles.emptyStateText, { color: theme.textSecondary }]} maxFontSizeMultiplier={1.3}>
                      No milestones or tasks
                    </Text>
                    <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]} maxFontSizeMultiplier={1.3}>
                      Create your first milestone to get started
                    </Text>
                  </View>
                )
            ) : filter === 'tasks' ? (
              // Show tasks in a flat list
              filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <View key={task.id} style={[styles.filteredTaskCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <Text style={[styles.milestoneTitle, { color: theme.text }]} maxFontSizeMultiplier={1.3}>
                        {task.title || task.name}
                      </Text>
                      <Text style={[styles.milestoneDescription, { color: theme.textSecondary }]} maxFontSizeMultiplier={1.3}>
                        Status: {task.status} | Completed: {task.completed ? 'Yes' : 'No'}
                      </Text>
                      {task.projectId && (
                        <View>
                          {(() => {
                            const milestone = milestones.find(m => m.id === task.projectId);
                            const goal = milestone ? goals.find(g => g.id === milestone.goalId) : null;
                            return (
                              <>
                                {goal && (
                                  <Text style={[styles.milestoneGoal, { color: goal.color || goal.domain?.color || theme.primary, fontSize: 11 }]} maxFontSizeMultiplier={1.3}>
                                    Goal: {goal.title}
                                  </Text>
                                )}
                                {milestone && (
                                  <Text style={[styles.milestoneGoal, { color: goal?.color || goal?.domain?.color || theme.primary, marginTop: 2 }]} maxFontSizeMultiplier={1.3}>
                                    Milestone: {milestone.title}
                                  </Text>
                                )}
                              </>
                            );
                          })()}
                        </View>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="list-outline" size={64} color={theme.textSecondary} />
                    <Text style={[styles.emptyStateText, { color: theme.textSecondary }]} maxFontSizeMultiplier={1.3}>
                      No tasks yet
                    </Text>
                    <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]} maxFontSizeMultiplier={1.3}>
                      Create your first task to get started
                    </Text>
                  </View>
                )
            ) : filter === 'goals' ? (
              // Show goals only (no expansion for milestones/tasks)
              processedGoals.map((goal) => (
                <View key={goal.id} style={[styles.filteredGoalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.goalTitle, { color: theme.text }]} maxFontSizeMultiplier={1.3}>
                    {goal.title}
                  </Text>
                  <Text style={[styles.goalDescription, { color: theme.textSecondary }]} maxFontSizeMultiplier={1.3}>
                    {goal.description || 'No description'}
                  </Text>
                  <View style={styles.goalStats}>
                    <Text style={[styles.goalStat, { color: goal.color || goal.domain?.color || theme.primary }]} maxFontSizeMultiplier={1.3}>
                      {milestones.filter(m => m.goalId === goal.id).length} milestones
                    </Text>
                    <Text style={[styles.goalStat, { color: goal.color || goal.domain?.color || theme.primary }]} maxFontSizeMultiplier={1.3}>
                      {(() => {
                        // Get milestones for this goal
                        const goalMilestones = milestones.filter(m => m.goalId === goal.id);
                        const goalMilestoneIds = goalMilestones.map(m => m.id);
                        
                        // Count unique tasks (direct + milestone tasks)
                        const taskSet = new Set();
                        
                        // Add direct tasks (those without milestone/project)
                        tasks.filter(t => 
                          t.goalId === goal.id && !t.milestoneId && !t.projectId
                        ).forEach(t => taskSet.add(t.id));
                        
                        // Add milestone tasks
                        tasks.filter(t => 
                          (t.milestoneId && goalMilestoneIds.includes(t.milestoneId)) ||
                          (!t.milestoneId && t.projectId && goalMilestoneIds.includes(t.projectId))
                        ).forEach(t => taskSet.add(t.id));
                        
                        return taskSet.size;
                      })()} tasks
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              // Default: Show full hierarchy (hide during tour to avoid double rendering)
              !(isTourActive && currentStep === 'OVERVIEW_PLAN') && processedGoals.map((goal) => {
                return (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    milestones={goal.id === 'standalone-milestones' ? standaloneMilestones : 
                               goal.id === 'standalone-tasks' ? [] : 
                               milestones.filter(milestone => milestone.goalId === goal.id)}
                    tasks={goal.id === 'standalone-tasks' ? standaloneTasks : 
                           goal.id === 'standalone-milestones' ? tasks :  // Pass all tasks so milestones can filter
                           (() => {
                             // Get milestones for this goal
                             const goalMilestones = milestones.filter(m => m.goalId === goal.id);
                             const goalMilestoneIds = goalMilestones.map(m => m.id);
                             // Return tasks that belong to this goal directly or via its milestones
                             // Check both milestoneId and projectId for backward compatibility
                             return tasks.filter(task => 
                               task.goalId === goal.id || 
                               goalMilestoneIds.includes(task.milestoneId) ||
                               goalMilestoneIds.includes(task.projectId)
                             );
                           })()}
                    expanded={expandedGoals[goal.id]}
                    onExpandToggle={() => toggleGoal(goal.id)}
                    onEdit={() => handleGoalEdit(goal.id)}
                    onDelete={() => handleGoalDelete(goal.id)}
                    onComplete={() => handleGoalComplete(goal.id)}
                    isEditMode={editMode}
                    onTaskComplete={handleTaskComplete}
                    onTaskDelete={handleTaskDelete}
                    onMilestoneComplete={handleMilestoneComplete}
                    onMilestoneEdit={handleMilestoneEdit}
                    onMilestoneDelete={handleMilestoneDelete}
                    onClearAllStandaloneTasks={handleClearAllStandaloneTasks}
                    onClearAllStandaloneMilestones={handleClearAllStandaloneMilestones}
                    onVirtualMilestoneComplete={handleVirtualMilestoneComplete}
                    onVirtualMilestoneDelete={handleVirtualMilestoneDelete}
                    navigation={navigation}
                    onMilestoneReorder={handleMilestoneReorder}
                    onTaskReorder={handleTaskReorder}
                  />
                );
              })
            )}
            
            {/* Delete All Button in ScrollView - Hidden in fullscreen, filter views, and during tour */}
            {processedGoals.length > 0 && !isFullscreen && !filter && !(isTourActive && currentStep === 'OVERVIEW_PLAN') && (
              <View style={styles.deleteAllContainer}>
                <TouchableOpacity 
                  style={[styles.deleteAllButton, { 
                    backgroundColor: theme.error || '#FF6B6B',
                    borderColor: theme.border 
                  }]}
                  onPress={handleDeleteAll}
                >
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.deleteAllText}>Clear All Life Plan Data</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* Floating Add Button - Hidden in fullscreen, filter views, and during tour */}
      {!isFullscreen && !filter && !(isTourActive && currentStep === 'OVERVIEW_PLAN') && (
        <FloatingAddButton onPress={handleAddButtonPress} />
      )}
      
      {/* Add Selection Modal */}
      <AddSelectionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSelectOption={handleModalChoice}
      />
      
      {/* First Delete Confirmation Dialog */}
      <MinimalistConfirmDialog
        visible={showFirstDeleteConfirm}
        onClose={() => setShowFirstDeleteConfirm(false)}
        title="Clear All Life Plan Data"
        message={`This will permanently delete:\n\n• ${actualDeleteCounts.goals} ${actualDeleteCounts.goals === 1 ? 'goal' : 'goals'}${actualDeleteCounts.completedGoals > 0 ? ` (${actualDeleteCounts.activeGoals} active, ${actualDeleteCounts.completedGoals} completed)` : ''}\n• ${actualDeleteCounts.milestones} ${actualDeleteCounts.milestones === 1 ? 'milestone' : 'milestones'}\n• ${actualDeleteCounts.tasks} ${actualDeleteCounts.tasks === 1 ? 'task' : 'tasks'}\n\nThis action cannot be undone.`}
        confirmText="Clear All"
        cancelText="Cancel"
        onConfirm={handleFirstDeleteConfirm}
        destructive={true}
        icon="trash-outline"
      />
      
      {/* Final Delete Confirmation Dialog */}
      <MinimalistConfirmDialog
        visible={showFinalDeleteConfirm}
        onClose={() => setShowFinalDeleteConfirm(false)}
        title="Final Confirmation"
        message="You are about to permanently delete all your goals (including completed ones), milestones, and tasks. This action cannot be reversed."
        confirmText="Clear Everything"
        cancelText="Cancel"
        onConfirm={handleFinalDeleteConfirm}
        destructive={true}
        icon="warning"
      />
      
      {/* App Tour Overlay */}
      <AppTourOverlay
        isVisible={isTourActive && currentStep === 'OVERVIEW_PLAN'}
        currentStep={currentStep}
        onComplete={nextStep}
        onSkip={skipTour}
        spotlightTarget={spotlightTarget}
        onSpecialAction={handleTourSpecialAction}
      />
      
      {/* Elevated Goal - rendered AFTER overlay during tour so it appears on top */}
      {isTourActive && currentStep === 'OVERVIEW_PLAN' && processedGoals.length > 0 && (
        <Animated.View style={[styles.tourGoalContainer, { opacity: tourGoalOpacity }]}>
          <GoalCard
            goal={processedGoals[0]}
            milestones={processedGoals[0].id === 'standalone-milestones' ? standaloneMilestones : 
                       processedGoals[0].id === 'standalone-tasks' ? [] : 
                       milestones.filter(milestone => milestone.goalId === processedGoals[0].id)}
            tasks={processedGoals[0].id === 'standalone-tasks' ? standaloneTasks : 
                   processedGoals[0].id === 'standalone-milestones' ? tasks :  // Pass all tasks
                   (() => {
                     // Get milestones for this goal
                     const goalMilestones = milestones.filter(m => m.goalId === processedGoals[0].id);
                     const goalMilestoneIds = goalMilestones.map(m => m.id);
                     // Return tasks that belong to this goal directly or via its milestones
                     // Use milestoneId (new format) OR projectId (legacy format) for compatibility
                     return tasks.filter(task => 
                       task.goalId === processedGoals[0].id || 
                       (task.milestoneId && goalMilestoneIds.includes(task.milestoneId)) ||
                       (task.projectId && goalMilestoneIds.includes(task.projectId))
                     );
                   })()}
            expanded={expandedGoals[processedGoals[0].id] || false}
            onExpandToggle={() => handleTourSpecialAction('expandGoal')}
            onComplete={null} // Disable completion during tour
            onEdit={null} // Disable editing during tour
            onDelete={null} // Disable deletion during tour
            isEditMode={false}
            onMilestoneComplete={null} // Disable milestone completion during tour
            onMilestoneEdit={null} // Disable milestone editing during tour
            onMilestoneDelete={null} // Disable milestone deletion during tour
            onTaskComplete={handleTaskComplete} // Enable task completion during tour
            onTaskEdit={null} // Disable task editing during tour
            onTaskDelete={null} // Disable task deletion during tour
            onMilestoneReorder={null} // Disable reordering during tour
            onTaskReorder={null} // Disable reordering during tour
            isTourMode={true} // Pass tour mode to disable other interactions
            expandedMilestones={expandedMilestones} // Pass external milestone expansion state
            onMilestoneExpandToggle={handleMilestoneExpandToggle} // Handle milestone expansion
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tourGoalContainer: {
    position: 'absolute',
    top: 120, // Position where first goal normally appears
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerButton: {
    padding: 8,
    zIndex: 2,
  },
  clearFilterButton: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
    lineHeight: 20,
    position: 'absolute',
    left: 60,
    right: 60,
    textAlign: 'center',
    zIndex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 2,
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  goalCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  goalIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  simpleProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercentage: {
    // Style set inline
  },
  milestoneCount: {
    // Style set inline
  },
  goalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ultraCleanProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  ultraCleanProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  goalCompletedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalCompletedText: {
    // Style set inline
  },
  goalReactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalReactivateText: {
    // Style set inline
  },
  goalCompleteButton: {
    // Style set inline
  },
  goalCompleteText: {
    // Style set inline
  },
  goalExpandButton: {
    // Style set inline
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
  },
  milestonesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  milestoneCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  milestoneIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  milestoneActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  modernProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: {
    textAlign: 'center',
  },
  expandButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  completeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tasksContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  taskCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  taskIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    flex: 1,
  },
  taskPriority: {
    alignSelf: 'flex-start',
  },
  priorityText: {
    // Style set inline
  },
  taskCompletedBadge: {
    // Style set inline
  },
  completedText: {
    // Style set inline
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  },
  emptyGoalActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyMilestoneActions: {
    paddingHorizontal: 0,
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 24,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  // Floating add button - Exact TimeScreen match
  floatingAddButton: {
    position: 'absolute',
    // bottom, left set in component
    zIndex: 100,
  },
  floatingAddButtonInner: {
    // width, height, borderRadius set in component
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  buttonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  deleteAllContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteAllText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  createMilestoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  createMilestoneText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  createTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  createTaskText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  completedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  completedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  // Filter view styles
  filteredMilestoneCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  filteredTaskCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  milestoneDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  milestoneGoal: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filteredMilestoneStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  filteredMilestoneGoal: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filteredMilestoneTaskCount: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filteredGoalCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  goalDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalStat: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reorderableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dragHandle: {
    padding: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  taskReorderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  taskReorderButtons: {
    flexDirection: 'column',
    marginRight: 8,
  },
  reorderButton: {
    padding: 4,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 1,
  },
  taskReorderContent: {
    flex: 1,
  },
});

export default LifePlanOverviewScreen;