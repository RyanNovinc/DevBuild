// src/screens/TasksScreen/components/ProjectItem.js
import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';
import { scaleWidth, fontSizes, spacing } from '../../../utils/responsive';
import * as FeatureExplorerTracker from '../../../services/FeatureExplorerTracker';

const ProjectItem = ({ 
  item, 
  section, 
  navigation, 
  theme, 
  getTasksForProject, 
  showProjectActionsMenu, 
  handleChangeProjectStatus,
  isBeingDragged,
  panY,
  projectLayout,
  setProjectLayout,
  panHandlers
}) => {
  // Get tasks for this project
  const projectTasks = getTasksForProject(item.id);
  
  // Wrapper function that also tracks goal progress updates
  const handleStatusChangeWithTracking = (projectId, newStatus) => {
    console.log(`🎯 [UI DEBUG] handleStatusChangeWithTracking called - Project: ${projectId}, Status: ${newStatus}`);
    // First call the original handler
    handleChangeProjectStatus(projectId, newStatus);
    
    // Then track progress tracker achievement
    try {
      // Use the section as the goal object since it likely contains the goal data
      if (section && item.goalId) {
        // Create a goal-like object with necessary properties
        const goalObj = {
          id: item.goalId,
          title: section.title || "Goal"
        };
        
        // Track the progress update
        FeatureExplorerTracker.trackProgressTracker(goalObj);
      }
    } catch (error) {
      console.error('Error tracking progress tracker achievement:', error);
      // Silently handle tracking errors without affecting main functionality
    }
  };
  
  // Calculate task stats
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(task => task.completed || task.status === 'done').length;
  
  // Determine status indicator - prioritize status property over progress
  let statusIndicator = null;
  const getStatusData = () => {
    if (item.status === 'todo' || (!item.status && item.progress === 0)) {
      return {
        color: '#E0E0E0',
        text: 'To Do',
        accessibilityLabel: 'Project status: To Do'
      };
    } else if (item.status === 'done' || (!item.status && item.progress === 100)) {
      return {
        color: '#81C784',
        text: 'Done',
        accessibilityLabel: 'Project status: Done'
      };
    } else {
      return {
        color: '#64B5F6',
        text: 'In Progress',
        accessibilityLabel: 'Project status: In Progress'
      };
    }
  };
  
  const statusData = getStatusData();
  statusIndicator = (
    <View 
      style={[styles.statusIndicator, { backgroundColor: statusData.color }]}
      accessible={true}
      accessibilityLabel={statusData.accessibilityLabel}
    >
      <Text 
        style={[styles.statusText, { fontSize: fontSizes.xs }]}
        maxFontSizeMultiplier={1.3}
      >
        {statusData.text}
      </Text>
    </View>
  );
  
  // Create style for project item
  const projectItemStyle = [
    styles.projectItem, 
    { backgroundColor: theme.card },
    isBeingDragged && { 
      opacity: 0.8, 
      shadowOpacity: 0.3, 
      zIndex: 999,
      elevation: 5
    }
  ];
  
  // Determine the current status
  const currentStatus = item.status || (item.progress === 0 ? 'todo' : item.progress === 100 ? 'done' : 'in_progress');
  
  // Prepare accessible description for screen readers
  const getAccessibilityLabel = () => {
    const statusText = statusData.text;
    const dueDate = item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'no due date';
    const taskCount = `${completedTasks} of ${totalTasks} tasks completed`;
    const progressText = `${item.progress || 0}% complete`;
    
    return `${item.title}. Status: ${statusText}. Due: ${dueDate}. ${taskCount}. ${progressText}`;
  };
  
  return (
    <Animated.View
      style={[
        projectItemStyle,
        isBeingDragged && { transform: [{ translateY: panY }] }
      ]}
      // Save reference and layout data for drag-and-drop
      ref={ref => {
        if (ref && !projectLayout[item.id]) {
          ref.measure((x, y, width, height, pageX, pageY) => {
            setProjectLayout(prev => ({
              ...prev,
              [item.id]: {
                id: item.id,
                sectionId: item.goalId || 'noGoal',
                ref,
                x: pageX,
                y: pageY,
                height,
                originalY: pageY
              }
            }));
          });
        }
      }}
      {...(isBeingDragged ? panHandlers : {})}
    >
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row' }}
        onPress={() => navigation.navigate('ProjectDetails', { projectId: item.id, mode: 'edit' })}
        onLongPress={() => {
          // Show project actions menu on long press
          showProjectActionsMenu(item);
        }}
        delayLongPress={500}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={getAccessibilityLabel()}
        accessibilityHint={`Tap to view project details, hold to show actions`}
      >
        <View 
          style={[
            styles.projectColorBar, 
            { backgroundColor: item.color }
          ]} 
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        />
        
        <View style={styles.projectContent}>
          <View style={styles.projectHeader}>
            <Text 
              style={[
                styles.projectTitle, 
                { 
                  color: theme.text,
                  fontSize: fontSizes.m,
                }
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
              maxFontSizeMultiplier={1.3}
            >
              {item.title}
            </Text>
            {statusIndicator}
          </View>
          
          <View style={styles.projectMeta}>
            <View style={styles.metaItem}>
              <Ionicons 
                name="calendar-outline" 
                size={scaleWidth(14)} 
                color={theme.textSecondary} 
              />
              <Text 
                style={[
                  styles.metaText, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.s,
                    marginLeft: spacing.xs
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'Not set'}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons 
                name="checkbox-outline" 
                size={scaleWidth(14)} 
                color={theme.textSecondary} 
              />
              <Text 
                style={[
                  styles.metaText, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.s,
                    marginLeft: spacing.xs
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {completedTasks}/{totalTasks} Tasks
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { backgroundColor: theme.background }
              ]}
              accessible={true}
              accessibilityLabel={`${item.progress || 0}% complete`}
            >
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${item.progress || 0}%`, backgroundColor: item.color }
                ]} 
                accessibilityElementsHidden={true}
                importantForAccessibility="no"
              />
            </View>
            <Text 
              style={[
                styles.progressText, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.s,
                  marginLeft: spacing.xs
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {item.progress || 0}%
            </Text>
          </View>
        </View>
        
        {/* Show action buttons for project status change */}
        <View style={styles.projectActions}>
          {/* TO DO STATE ACTIONS */}
          {currentStatus === 'todo' && (
            <>
              {/* Forward arrow to move from To Do to In Progress */}
              <TouchableOpacity 
                style={[styles.actionButton, { minWidth: 44, minHeight: 44 }]}
                onPress={() => handleStatusChangeWithTracking(item.id, 'in_progress')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Move to In Progress"
                accessibilityHint="Changes project status to In Progress"
              >
                <Ionicons 
                  name="arrow-forward" 
                  size={scaleWidth(18)} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
              
              {/* Checkmark to move from To Do to Done */}
              <TouchableOpacity 
                style={[styles.actionButton, { minWidth: 44, minHeight: 44 }]}
                onPress={() => {
                  console.log(`🚀 TICK BUTTON CLICKED FOR PROJECT: ${item.title} (${item.id}) 🚀`);
                  console.log(`🚀 STARTING PROJECT COMPLETION FLOW 🚀`);
                  handleStatusChangeWithTracking(item.id, 'done');
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Mark as Done"
                accessibilityHint="Changes project status to Done"
              >
                <Ionicons 
                  name="checkmark-circle-outline" 
                  size={scaleWidth(18)} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            </>
          )}
          {/* IN PROGRESS STATE ACTIONS */}
          {currentStatus === 'in_progress' && (
            <>
              {/* Back arrow to move from In Progress to To Do */}
              <TouchableOpacity 
                style={[styles.actionButton, { minWidth: 44, minHeight: 44 }]}
                onPress={() => handleStatusChangeWithTracking(item.id, 'todo')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Move to To Do"
                accessibilityHint="Changes project status to To Do"
              >
                <Ionicons 
                  name="arrow-back" 
                  size={scaleWidth(18)} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
              
              {/* Checkmark to move from In Progress to Done */}
              <TouchableOpacity 
                style={[styles.actionButton, { minWidth: 44, minHeight: 44 }]}
                onPress={() => {
                  console.log(`🚀 TICK BUTTON CLICKED FOR PROJECT: ${item.title} (${item.id}) 🚀`);
                  console.log(`🚀 STARTING PROJECT COMPLETION FLOW 🚀`);
                  handleStatusChangeWithTracking(item.id, 'done');
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Mark as Done"
                accessibilityHint="Changes project status to Done"
              >
                <Ionicons 
                  name="checkmark-circle-outline" 
                  size={scaleWidth(18)} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            </>
          )}
          
          {/* DONE STATE ACTIONS */}
          {currentStatus === 'done' && (
            <>
              {/* Back arrow to move from Done to In Progress */}
              <TouchableOpacity 
                style={[styles.actionButton, { minWidth: 44, minHeight: 44 }]}
                onPress={() => handleStatusChangeWithTracking(item.id, 'in_progress')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Move to In Progress"
                accessibilityHint="Changes project status to In Progress"
              >
                <Ionicons 
                  name="arrow-back" 
                  size={scaleWidth(18)} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
              
              {/* Undo icon to move from Done to To Do */}
              <TouchableOpacity 
                style={[styles.actionButton, { minWidth: 44, minHeight: 44 }]}
                onPress={() => handleStatusChangeWithTracking(item.id, 'todo')}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Move to To Do"
                accessibilityHint="Changes project status to To Do"
              >
                <Ionicons 
                  name="refresh-outline" 
                  size={scaleWidth(18)} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            </>
          )}
          
          {/* Show drag indicator during dragging mode */}
          {isBeingDragged && (
            <View 
              style={styles.dragIndicator}
              accessibilityElementsHidden={true}
              importantForAccessibility="no"
            >
              <Ionicons 
                name="menu" 
                size={scaleWidth(22)} 
                color={theme.textSecondary} 
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ProjectItem;