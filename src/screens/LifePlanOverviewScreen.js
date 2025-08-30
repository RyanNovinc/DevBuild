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
  Animated
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
  
  const handleLongPress = () => {
    if (isEditMode) {
      onDrag && onDrag();
    } else {
      // Show delete confirmation
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
        backgroundColor: theme.card,
        borderColor: task.completed ? theme.success : theme.border,
        borderWidth: task.completed ? 2 : 1,
        opacity: task.completed ? 0.85 : 1,
        shadowColor: task.completed ? theme.success : '#000',
        shadowOpacity: task.completed ? 0.1 : 0.05
      }]}
      onPress={() => {
        onComplete();
      }}
      onLongPress={handleLongPress}
      delayLongPress={500}
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
          
          {/* Task Priority or Due Date (if available) */}
          {task.priority && (
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
          <View style={[styles.taskCompletedBadge, {
            backgroundColor: theme.success,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 10
          }]}>
            <Text style={[styles.completedText, {
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: '600'
            }]}>
              ✓
            </Text>
          </View>
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
  // Get tasks for this milestone - check both milestoneId and projectId
  const milestoneTasks = tasks.filter(task => {
    const belongsToMilestone = task.milestoneId === milestone.id || task.projectId === milestone.id;
    if (belongsToMilestone) {
      console.log('🔍 Task belongs to milestone:', { 
        taskTitle: task.title, 
        taskMilestoneId: task.milestoneId, 
        taskProjectId: task.projectId, 
        milestoneId: milestone.id 
      });
    }
    return belongsToMilestone;
  });
  const completedTasks = milestoneTasks.filter(task => task.completed);
  const totalTasks = milestoneTasks.length;
  // If milestone is completed, show 100%, otherwise calculate based on tasks
  const progressPercentage = milestone.completed ? 100 : 
    (totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0);
  
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

        {/* Floating Completion Button - Bottom Right */}
        <TouchableOpacity 
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 8, // Square with rounded corners
            backgroundColor: milestone.completed ? "#4CAF50" : cardColor,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={onComplete}
          activeOpacity={0.8}
        >
          {milestone.completed ? (
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          ) : (
            <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.tasksContainer}>
          {milestoneTasks.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No tasks yet
            </Text>
          ) : isEditMode ? (
            <DraggableFlatList
              data={milestoneTasks}
              renderItem={({ item: task, drag, isActive }) => (
                <TaskCard
                  key={task.id || `task-${milestoneTasks.indexOf(task)}`}
                  task={task}
                  onComplete={() => onTaskComplete(task.id)}
                  onDelete={() => onTaskDelete(task.id)}
                  isEditMode={isEditMode}
                  onDrag={drag}
                  isActive={isActive}
                  isDraggable={true}
                />
              )}
              keyExtractor={(item, index) => item.id || `task-${item.title}-${index}`}
              onDragEnd={({ data }) => onTaskReorder && onTaskReorder(data, milestone.id)}
            />
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
          {!milestone.isVirtual && navigation && goalId && (
            <TouchableOpacity
              style={[styles.createTaskButton, { 
                backgroundColor: theme.surface,
                borderColor: theme.border 
              }]}
              onPress={() => {
                navigation.navigate('TaskDetails', {
                  mode: 'create',
                  preselectedGoalId: goalId,
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
const GoalCard = ({ goal, milestones, tasks, onExpandToggle, onEdit, onDelete, onComplete, isEditMode, expanded, onTaskComplete, onTaskDelete, onMilestoneComplete, onMilestoneEdit, onMilestoneDelete, onDrag, isActive, isDraggable = false, navigation, onMilestoneReorder, onTaskReorder, isTourMode = false, expandedMilestones: externalExpandedMilestones, onMilestoneExpandToggle }) => {
  const { theme } = useTheme();
  const goalMilestones = milestones.filter(milestone => milestone.goalId === goal.id);
  
  // Find standalone tasks within this goal (tasks that belong to goal but not to any milestone)
  const goalStandaloneTasks = tasks.filter(task => 
    task.goalId === goal.id && 
    !task.milestoneId && 
    !task.projectId
  );
  
  // Create a virtual milestone for standalone tasks if they exist
  const standaloneTasksMilestone = goalStandaloneTasks.length > 0 ? {
    id: `${goal.id}-standalone-tasks`,
    title: 'Standalone Tasks',
    goalId: goal.id,
    isVirtual: true,
    completed: false
  } : null;
  
  // Combine real milestones with virtual standalone tasks milestone
  const allMilestones = standaloneTasksMilestone 
    ? [...goalMilestones, standaloneTasksMilestone]
    : goalMilestones;
  
  const completedMilestones = goalMilestones.filter(milestone => milestone.completed);
  const progressPercentage = goalMilestones.length > 0 ? Math.round((completedMilestones.length / goalMilestones.length) * 100) : 0;
  const completedMilestonesCount = completedMilestones.length;
  
  // Calculate total task count for this goal (including tasks in milestones)
  const directTasks = tasks.filter(task => 
    task.goalId === goal.id && (!task.projectId || task.projectId === null)
  );
  
  // Get all milestone/project IDs for this goal
  const goalMilestoneIds = goalMilestones.map(milestone => milestone.id);
  
  // Get tasks that belong to milestones of this goal (check both projectId and milestoneId)
  const milestoneTasks = tasks.filter(task => 
    (task.projectId && goalMilestoneIds.includes(task.projectId)) ||
    (task.milestoneId && goalMilestoneIds.includes(task.milestoneId))
  );
  
  // Combine direct tasks and milestone tasks
  const goalTasks = [...directTasks, ...milestoneTasks];
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
          {allMilestones.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No milestones yet
            </Text>
          ) : isEditMode ? (
            <DraggableFlatList
              data={allMilestones.filter(m => !m.isVirtual)}
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
                  onComplete={() => milestone.isVirtual ? null : onMilestoneComplete(milestone.id)}
                  onEdit={() => milestone.isVirtual ? null : onMilestoneEdit(milestone.id)}
                  onDelete={() => milestone.isVirtual ? null : onMilestoneDelete(milestone.id)}
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
        const otherMilestones = milestones.filter(m => m.goalId !== goalId);
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
    console.log('Tasks reordered:', data.map(t => t.title));
    if (setTasks && typeof setTasks === 'function') {
      try {
        // Add order property to reordered tasks
        const reorderedTasks = data.map((task, index) => ({
          ...task,
          order: index,
          updatedAt: new Date().toISOString()
        }));
        
        // Merge the reordered tasks with other tasks not in this milestone
        const otherTasks = tasks.filter(task => 
          task.milestoneId !== milestoneId && task.projectId !== milestoneId
        );
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
  const [actualDeleteCounts, setActualDeleteCounts] = useState({ goals: 0, milestones: 0, tasks: 0 });

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
    // Add standalone milestones goal if there are standalone milestones
    const standaloneMilestones = milestones.filter(milestone => !milestone.goalId);
    if (standaloneMilestones.length > 0) {
      processedGoals.push({
        id: 'standalone-milestones',
        title: 'Standalone Milestones',
        isStandalone: true,
        color: '#FFFFFF'
      });
    }
    
    // Add standalone tasks goal if there are standalone tasks
    const standaloneTasks = tasks.filter(task => !task.projectId && !task.milestoneId && !task.goalId);
    if (standaloneTasks.length > 0) {
      processedGoals.push({
        id: 'standalone-tasks',
        title: 'Standalone Tasks',
        isStandalone: true,
        color: '#FFFFFF'
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
  const handleTaskComplete = (taskId) => {
    
    // Find the task to get its projectId/milestoneId and current status
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return;
    }
    
    const isCurrentlyCompleted = task.completed || task.status === 'done';
    const newCompletedStatus = !isCurrentlyCompleted;
    
    
    // Use projectId or milestoneId (they should be the same for milestones)
    const milestoneId = task.projectId || task.milestoneId;
    
    if (updateTask && milestoneId) {
      updateTask(milestoneId, taskId, { 
        completed: newCompletedStatus, 
        status: newCompletedStatus ? 'done' : 'todo',
        updatedAt: new Date().toISOString()
      });
      showSuccess(newCompletedStatus ? 'Task completed!' : 'Task reopened!');
    } else {
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
      // Get actual counts from AsyncStorage to show accurate numbers
      const [goalsStorage, milestonesStorage, tasksStorage] = await Promise.all([
        AsyncStorage.getItem('goals'),
        AsyncStorage.getItem('milestones'), 
        AsyncStorage.getItem('tasks')
      ]);
      
      const actualGoals = goalsStorage ? JSON.parse(goalsStorage) : [];
      const actualMilestones = milestonesStorage ? JSON.parse(milestonesStorage) : [];
      const actualTasks = tasksStorage ? JSON.parse(tasksStorage) : [];
      
      setActualDeleteCounts({
        goals: actualGoals.length,
        milestones: actualMilestones.length, 
        tasks: actualTasks.length
      });
      
      console.log(`🔍 ACCURATE DELETE COUNTS: ${actualGoals.length} goals, ${actualMilestones.length} milestones, ${actualTasks.length} tasks`);
    } catch (error) {
      console.error('Error getting accurate counts:', error);
      // Fallback to AppContext counts
      setActualDeleteCounts({
        goals: goals.length,
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
                      // USE THE EXACT SAME DELETION FUNCTIONS THAT WORK!
                      // Delete each goal individually (this will cascade delete projects and tasks)
                      const goalIds = [...goals.map(g => g.id)]; // Copy array to avoid mutation issues
                      console.log(`Deleting ${goalIds.length} goals individually...`);
                      
                      for (const goalId of goalIds) {
                        if (deleteGoal) {
                          await deleteGoal(goalId);
                        }
                      }
                      
                      // Delete any remaining standalone projects
                      const remainingProjectIds = [...milestones.filter(p => !p.goalId).map(p => p.id)];
                      console.log(`Deleting ${remainingProjectIds.length} remaining standalone projects...`);
                      
                      for (const projectId of remainingProjectIds) {
                        if (deleteMilestone) {
                          await deleteMilestone(projectId);
                        }
                      }
                      
                      // Delete ANY remaining tasks - checking ALL possible properties
                      // This includes tasks with milestoneId, projectId, goalId, or completely standalone tasks
                      const allRemainingTasks = [...tasks];
                      console.log(`🗑️ COMPREHENSIVE TASK DELETION: Found ${allRemainingTasks.length} total tasks to delete...`);
                      
                      // Delete each task individually using the proper deleteTask function
                      for (const task of allRemainingTasks) {
                        try {
                          if (deleteTask) {
                            // Use the milestoneId if available, otherwise null for standalone
                            const milestoneIdForDeletion = task.milestoneId || task.projectId || null;
                            await deleteTask(milestoneIdForDeletion, task.id);
                            console.log(`✅ Deleted task: ${task.title || task.name} (ID: ${task.id})`);
                          }
                        } catch (error) {
                          console.error(`❌ Error deleting task ${task.id}:`, error);
                          // Continue with other tasks even if one fails
                        }
                      }
                      
                      // Force clear the tasks array directly from AsyncStorage as backup
                      await AsyncStorage.setItem('tasks', '[]');
                      console.log('🧹 Force cleared tasks from AsyncStorage as backup');
                      
                      // Clear todos manually since they don't have individual delete functions in context
                      setTodos([]);
                      setTomorrowTodos([]);
                      setLaterTodos([]);
                      await Promise.all([
                        AsyncStorage.setItem('todos', '[]'),
                        AsyncStorage.setItem('tomorrowTodos', '[]'),
                        AsyncStorage.setItem('laterTodos', '[]')
                      ]);
                      
                      // IMMEDIATE FORCE CLEAR - Execute right after deletions
                      console.log('🚨 IMMEDIATE FORCE CLEAR - Clearing AppContext arrays directly');
                      if (appContext) {
                        // Force clear all arrays immediately and synchronously
                        if (appContext.setGoals) appContext.setGoals([]);
                        if (appContext.setProjects) appContext.setProjects([]);
                        if (appContext.setTasks) appContext.setTasks([]);
                        if (appContext.setTodos) appContext.setTodos([]);
                        if (appContext.setTomorrowTodos) appContext.setTomorrowTodos([]);
                        if (appContext.setLaterTodos) appContext.setLaterTodos([]);
                        
                        console.log('💪 IMMEDIATE FORCE CLEAR COMPLETE - All arrays set to empty');
                      }
                      
                      // Set nuclear signal immediately for ProfileScreen
                      await AsyncStorage.setItem('forceProfileClear', 'true');
                      console.log('☢️ NUCLEAR SIGNAL SET IMMEDIATELY');
                      
                      // VERIFY AsyncStorage is actually empty
                      console.log('🔍 VERIFYING ASYNCSTORAGE IS ACTUALLY EMPTY...');
                      const [
                        storedGoalsAfter,
                        storedProjectsAfter,
                        storedTasksAfter
                      ] = await Promise.all([
                        AsyncStorage.getItem('goals'),
                        AsyncStorage.getItem('projects'),
                        AsyncStorage.getItem('tasks')
                      ]);
                      
                      console.log('📦 AsyncStorage AFTER delete:');
                      console.log('  - goals:', storedGoalsAfter);
                      console.log('  - projects:', storedProjectsAfter);
                      console.log('  - tasks:', storedTasksAfter);
                      
                      // CHECK AppContext state
                      console.log('🎯 CURRENT AppContext state:');
                      console.log('  - appContext.goals.length:', appContext?.goals?.length || 'undefined');
                      console.log('  - appContext.projects.length:', appContext?.projects?.length || 'undefined');
                      console.log('  - appContext.tasks.length:', appContext?.tasks?.length || 'undefined');
                      
                      // FORCE ProfileScreen to recalculate by triggering AppContext refresh
                      if (appContext && appContext.refreshData) {
                        console.log('🔄 Forcing AppContext refresh...');
                        await appContext.refreshData();
                        
                        // Check again after refresh
                        console.log('🎯 AppContext state AFTER refresh:');
                        console.log('  - appContext.goals.length:', appContext?.goals?.length || 'undefined');
                        console.log('  - appContext.projects.length:', appContext?.projects?.length || 'undefined');
                        console.log('  - appContext.tasks.length:', appContext?.tasks?.length || 'undefined');
                      }
                      
                      // Remove duplicate force clearing - already done above
                      
                      showSuccess('All data deleted successfully');
                      
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
            renderItem={({ item: goal, drag, isActive }) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                milestones={goal.id === 'standalone-milestones' ? standaloneMilestones : 
                           goal.id === 'standalone-tasks' ? [] : 
                           milestones.filter(milestone => milestone.goalId === goal.id)}
                tasks={goal.id === 'standalone-tasks' ? standaloneTasks : 
                       goal.id === 'standalone-milestones' ? [] :
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
                    <Text style={styles.deleteAllText}>Delete All Data</Text>
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
                      No milestones yet
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
                        
                        // Count direct tasks + tasks in milestones
                        const directTasks = tasks.filter(t => t.goalId === goal.id);
                        const milestoneTasks = tasks.filter(t => 
                          goalMilestoneIds.includes(t.projectId) || 
                          goalMilestoneIds.includes(t.milestoneId)
                        );
                        
                        return directTasks.length + milestoneTasks.length;
                      })()} tasks
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              // Default: Show full hierarchy (hide during tour to avoid double rendering)
              !(isTourActive && currentStep === 'OVERVIEW_PLAN') && processedGoals.map((goal) => {
                const standaloneMilestones = milestones.filter(milestone => !milestone.goalId);
                const standaloneTasks = tasks.filter(task => !task.projectId && !task.milestoneId && !task.goalId);
                
                return (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    milestones={goal.id === 'standalone-milestones' ? standaloneMilestones : 
                               goal.id === 'standalone-tasks' ? [] : 
                               milestones.filter(milestone => milestone.goalId === goal.id)}
                    tasks={goal.id === 'standalone-tasks' ? standaloneTasks : 
                           goal.id === 'standalone-milestones' ? [] :
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
                  <Text style={styles.deleteAllText}>Delete All Data</Text>
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
        title="Delete All Data"
        message={`This will permanently delete:\n\n• ${actualDeleteCounts.goals} ${actualDeleteCounts.goals === 1 ? 'goal' : 'goals'}\n• ${actualDeleteCounts.milestones} ${actualDeleteCounts.milestones === 1 ? 'milestone' : 'milestones'}\n• ${actualDeleteCounts.tasks} ${actualDeleteCounts.tasks === 1 ? 'task' : 'tasks'}\n\nThis action cannot be undone.`}
        confirmText="Delete All"
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
        message="You are about to permanently delete all your goals, milestones, and tasks. This action cannot be reversed."
        confirmText="Delete Everything"
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
                   processedGoals[0].id === 'standalone-milestones' ? [] :
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
            onTaskComplete={null} // Disable task completion during tour
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
});

export default LifePlanOverviewScreen;