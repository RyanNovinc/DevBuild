// src/screens/TodoListScreen/components/TodoGroup.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  Animated,
  Keyboard,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { styles as todoListStyles } from '../TodoListStyles';
import TodoItem from './TodoItem';

// Import responsive utilities for better layout across device sizes
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility,
  ensureAccessibleTouchTarget
} from '../../../utils/responsive';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * TodoGroup component - renders a collapsible group of todo items
 */
const TodoGroup = ({ 
  group, 
  todos, 
  isExpanded,
  onToggle,
  onDelete,
  onToggleExpansion,
  onLongPress,
  theme,
  showSuccess,
  addTodo,
  onAddingSubtask,
  activeTab,
  // New props for limit checking
  canAddMoreTodos,
  showFeatureLimitBanner
}) => {
  // State for adding subtasks
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Track the swipeable ref for controlling the swipe state
  const swipeableRef = useRef(null);

  // Animation configuration
  const animConfig = {
    duration: 250,
    useNativeDriver: true, // Native driver for rotation and opacity
    easing: Easing.inOut(Easing.ease)
  };
  
  // Get child todos for this group
  const childTodos = todos.filter(todo => todo.groupId === group.id);
  const completedChildTodos = childTodos.filter(todo => todo.completed);
  
  // Update fadeAnim when isExpanded changes
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, fadeAnim]);
  
  // Handle toggling group completion
  const handleToggle = () => {
    if (onToggle) {
      onToggle(group.id);
    }
  };
  
  // Handle expansion toggle with animation
  const handleExpand = () => {
    // Configure layout animation for smooth height transition
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Animate the rotation of the chevron
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      ...animConfig
    }).start();
    
    // Then call the onToggleExpansion function to update the state
    if (onToggleExpansion) {
      onToggleExpansion();
    }
  };
  
  // Handle shake animation for empty input
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.linear
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.linear
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.linear
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.linear
      })
    ]).start();
  };
  
  // Handle adding a subtask
  const handleAddSubtask = () => {
    // Toggle adding state
    const isAdding = !addingSubtask;
    setAddingSubtask(isAdding);
    
    // Notify parent component about subtask mode
    if (onAddingSubtask) {
      onAddingSubtask(isAdding);
    }
    
    // Clear the input text when canceling
    if (!isAdding) {
      setNewSubtaskText('');
    }
  };
  
  // Submit the new subtask
  const submitSubtask = () => {
    if (!newSubtaskText.trim()) {
      triggerShake();
      return;
    }
    
    // Check if we can add more todos
    if (canAddMoreTodos && !canAddMoreTodos(activeTab, false)) {
      // Get the correct limit message based on the active tab
      let limitMessage = '';
      switch (activeTab) {
        case 'today':
          limitMessage = 'Free version limited to 10 items in Today tab. Upgrade to Pro for unlimited todos.';
          break;
        case 'tomorrow':
          limitMessage = 'Free version limited to 7 items in Tomorrow tab. Upgrade to Pro for unlimited todos.';
          break;
        case 'later':
          limitMessage = 'Free version limited to 5 items in Later tab. Upgrade to Pro for unlimited todos.';
          break;
      }
      
      // Show the limit banner or message
      if (showFeatureLimitBanner) {
        showFeatureLimitBanner(limitMessage);
      } else {
        showSuccess(limitMessage, { type: 'warning' });
      }
      
      // Clear the input and cancel adding
      setAddingSubtask(false);
      setNewSubtaskText('');
      if (onAddingSubtask) onAddingSubtask(false);
      Keyboard.dismiss();
      return;
    }
    
    // Add the subtask
    const text = newSubtaskText.trim();
    
    // Use the addTodo function with the group ID
    if (addTodo) {
      addTodo(activeTab, group.id, text);
    } else {
      // Fallback if addTodo not provided
      showSuccess('Added subtask', { type: 'success' });
    }
    
    // Clear the input and cancel adding mode
    setNewSubtaskText('');
    setAddingSubtask(false);
    if (onAddingSubtask) onAddingSubtask(false);
    Keyboard.dismiss();
  };
  
  // Cancel adding a subtask
  const cancelAddSubtask = () => {
    setAddingSubtask(false);
    setNewSubtaskText('');
    if (onAddingSubtask) onAddingSubtask(false);
    Keyboard.dismiss();
  };
  
  // Handle long press on the group
  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(group);
    }
  };
  
  // Calculate the rotate interpolation for the chevron
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg']
  });
  
  // Render swipe actions for the group
  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={styles.swipeActionsContainer}>
        <Animated.View 
          style={[
            styles.deleteAction,
            {
              transform: [{ translateX: trans }],
              backgroundColor: theme.error || '#F44336'
            }
          ]}
        >
          <TouchableOpacity 
            onPress={() => {
              if (swipeableRef.current) {
                swipeableRef.current.close();
              }
              if (onDelete) {
                onDelete(group.id);
              }
            }}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={scaleWidth(22)} color="#FFFFFF" />
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };
  
  // Generate a lighter version of the primary color for the background
  const getBackgroundColor = () => {
    if (group.completed) {
      // For completed groups, use a more muted background
      return `${theme.primary}10`; // 10% opacity
    }
    
    // For normal groups, use a very subtle primary color background
    return `${theme.primary}08`; // 8% opacity
  };
  
  // Determine the border style - subtle for better design
  const getBorderStyle = () => {
    if (group.completed) {
      return {
        borderColor: `${theme.primary}30`, // 30% opacity for completed
        borderWidth: 1
      };
    }
    
    return {
      borderColor: `${theme.primary}40`, // 40% opacity for normal
      borderWidth: 1
    };
  };
  
  return (
    <View style={styles.groupContainer}>
      {/* Swipeable Group Header */}
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        containerStyle={styles.swipeContainer}
      >
        <TouchableOpacity
          style={[
            styles.groupHeader,
            {
              backgroundColor: getBackgroundColor(),
              ...getBorderStyle(),
              // Add a subtle shadow for a modern look
              shadowColor: theme.text,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: group.completed ? 0 : 2,
            }
          ]}
          onPress={handleExpand}
          onLongPress={handleLongPress}
          delayLongPress={500}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${group.title} group, ${isExpanded ? 'expanded' : 'collapsed'}, ${group.completed ? 'completed' : 'not completed'}`}
          accessibilityHint={isExpanded ? "Collapse group" : "Expand group"}
          accessibilityState={{ expanded: isExpanded, checked: group.completed }}
        >
          {/* Checkbox */}
          <TouchableOpacity 
            style={styles.checkbox}
            onPress={handleToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="checkbox"
            accessibilityLabel={`${group.completed ? 'Completed' : 'Mark as complete'}`}
            accessibilityState={{ checked: group.completed }}
          >
            <View style={[
              styles.checkboxInner,
              {
                backgroundColor: group.completed ? theme.primary : 'transparent',
                borderColor: group.completed ? theme.primary : theme.textSecondary,
              }
            ]}>
              {group.completed && (
                <Ionicons 
                  name="checkmark" 
                  size={scaleWidth(14)} 
                  color="#FFFFFF" 
                />
              )}
            </View>
          </TouchableOpacity>
          
          {/* Group Title */}
          <Text 
            style={[
              styles.groupTitle, 
              { 
                color: theme.text,
                textDecorationLine: group.completed ? 'line-through' : 'none',
                opacity: group.completed ? 0.7 : 1,
                fontWeight: '600'  // Slightly bolder for better visibility
              }
            ]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.8}
          >
            {group.title}
          </Text>
          
          {/* Task Counter Badge */}
          <View style={[
            styles.taskCountBadge,
            {
              backgroundColor: group.completed ? 
                `${theme.primary}15` : // 15% opacity if completed
                `${theme.primary}25`,  // 25% opacity if not completed
              borderColor: group.completed ? 
                `${theme.primary}30` : // 30% opacity border if completed
                `${theme.primary}50`,  // 50% opacity border if not completed
            }
          ]}>
            <Text 
              style={[
                styles.taskCountText,
                { 
                  color: theme.primary,
                  fontWeight: '600'
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {`${completedChildTodos.length}/${childTodos.length}`}
            </Text>
          </View>
          
          {/* Add Subtask Button - Now visually hidden but accessible */}
          <TouchableOpacity
            style={styles.addSubtaskButton}
            onPress={handleAddSubtask}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={addingSubtask}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add subtask"
            accessibilityHint="Opens input to add a new subtask to this group"
          >
            <Ionicons 
              name={addingSubtask ? "close-outline" : "add-outline"} 
              size={scaleWidth(20)} 
              color={theme.textSecondary} 
              style={{ opacity: 0 }} // Make it invisible but keep accessible
            />
          </TouchableOpacity>
          
          {/* Expand Indicator */}
          <Animated.View style={{
            transform: [{ rotate }]
          }}>
            <Ionicons 
              name="chevron-forward" 
              size={scaleWidth(20)} 
              color={theme.textSecondary} 
            />
          </Animated.View>
        </TouchableOpacity>
      </Swipeable>
      
      {/* Subtask Input (Visible when adding) */}
      {addingSubtask && (
        <Animated.View 
          style={[
            styles.subtaskInputContainer,
            {
              backgroundColor: theme.card,
              borderColor: `${theme.primary}30`,
              transform: [{ translateX: shakeAnim }]
            }
          ]}
        >
          <TextInput
            style={[styles.subtaskInput, { color: theme.text }]}
            placeholder="Add a subtask..."
            placeholderTextColor={theme.textSecondary}
            value={newSubtaskText}
            onChangeText={setNewSubtaskText}
            autoFocus={true}
            returnKeyType="done"
            onSubmitEditing={submitSubtask}
            maxFontSizeMultiplier={1.3}
            autoCorrect={false}
            spellCheck={false}
          />
          <View style={styles.subtaskButtons}>
            <TouchableOpacity
              style={[styles.subtaskButton, { marginRight: spacing.xs }]}
              onPress={cancelAddSubtask}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              accessibilityHint="Cancel adding a subtask"
            >
              <Text style={[styles.subtaskButtonText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.subtaskButton, 
                { 
                  backgroundColor: theme.primary,
                  opacity: newSubtaskText.trim() ? 1 : 0.7
                }
              ]}
              onPress={submitSubtask}
              disabled={!newSubtaskText.trim()}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add"
              accessibilityHint="Add the subtask"
              accessibilityState={{ disabled: !newSubtaskText.trim() }}
            >
              <Text style={[styles.subtaskButtonText, { color: '#FFFFFF' }]}>
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
      
      {/* Group Content (Expandable) - NOW USING CONDITIONAL RENDERING WITH LAYOUT ANIMATION */}
      {isExpanded && childTodos.length > 0 && (
        <Animated.View style={[
          styles.groupContent,
          { opacity: fadeAnim }
        ]}>
          {/* Child Todos */}
          {childTodos.map(todo => (
            <TodoItem
              key={todo.id}
              item={todo}
              onToggle={() => onToggle && onToggle(todo.id)}
              onDelete={() => onDelete && onDelete(todo.id, true)}
              onLongPress={() => onLongPress && onLongPress(todo)}
              theme={theme}
              isSubtask={true}
              parentCompleted={group.completed}
            />
          ))}
        </Animated.View>
      )}
      
      {/* Add First Task Button (Visible only when expanded and when there are no tasks yet) */}
      {isExpanded && childTodos.length === 0 && !addingSubtask && (
        <TouchableOpacity
          style={[
            styles.emptyGroupAddButton,
            { 
              borderColor: `${theme.primary}30`, // 30% opacity for dashed border
              backgroundColor: `${theme.primary}05` // 5% opacity for very subtle background
            }
          ]}
          onPress={handleAddSubtask}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Add first subtask"
          accessibilityHint="Add the first task to this empty group"
        >
          <Ionicons 
            name="add-outline" 
            size={scaleWidth(18)} 
            color={theme.primary} 
          />
          <Text style={[
            styles.emptyGroupAddText, 
            { color: theme.primary }
          ]}>
            Add first task
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Add Task Button - Quick add button at the end of tasks when expanded */}
      {isExpanded && childTodos.length > 0 && !addingSubtask && (
        <TouchableOpacity
          style={[
            styles.addTaskButton,
            { borderColor: `${theme.primary}20` }
          ]}
          onPress={handleAddSubtask}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Add another task"
          accessibilityHint="Add another task to this group"
        >
          <Ionicons 
            name="add" 
            size={scaleWidth(16)} 
            color={theme.primary} 
            style={{ marginRight: spacing.xxs }}
          />
          <Text style={[
            styles.addTaskText, 
            { color: theme.primary }
          ]}>
            Add task
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    marginBottom: scaleHeight(12),
  },
  swipeContainer: {
    borderRadius: scaleWidth(12),
    overflow: 'hidden'
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: scaleWidth(12),
    borderWidth: 1,
    minHeight: accessibility.minTouchTarget,
  },
  checkbox: {
    marginRight: spacing.s,
    padding: spacing.xxs, // Added padding for touch target
  },
  checkboxInner: {
    width: scaleWidth(22),
    height: scaleWidth(22),
    borderRadius: scaleWidth(4),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupTitle: {
    flex: 1,
    fontSize: fontSizes.m,
    fontWeight: '500',
  },
  // Task counter badge styles
  taskCountBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxs,
    borderRadius: scaleWidth(12),
    borderWidth: 1,
    marginRight: spacing.xs,
    minWidth: scaleWidth(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCountText: {
    fontSize: fontSizes.s,
  },
  // Hide the add subtask button visually but keep it accessible
  addSubtaskButton: {
    marginHorizontal: spacing.xs,
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0,
  },
  groupContent: {
    paddingLeft: scaleWidth(30), // Indent for subtasks
    marginTop: spacing.xs,
  },
  subtaskInputContainer: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    marginLeft: scaleWidth(30), // Match the indent
    padding: spacing.s,
    borderRadius: scaleWidth(12),
    borderWidth: 1,
  },
  subtaskInput: {
    fontSize: fontSizes.m,
    padding: spacing.xs,
  },
  subtaskButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  subtaskButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.m,
    borderRadius: scaleWidth(8),
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: accessibility.minTouchTarget * 0.8,
    minWidth: scaleWidth(60),
  },
  subtaskButtonText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
  },
  swipeActionsContainer: {
    width: scaleWidth(100),
    flexDirection: 'row',
  },
  deleteAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: fontSizes.xs,
    marginTop: spacing.xxs,
  },
  // Empty group add button
  emptyGroupAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: scaleWidth(30), // Match indent
    marginTop: spacing.xs,
    marginBottom: spacing.s,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(8),
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyGroupAddText: {
    fontSize: fontSizes.s,
    marginLeft: spacing.xxs,
    fontWeight: '500',
  },
  // Add task button at the end of tasks list
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scaleWidth(30), // Match indent
    marginTop: spacing.xs,
    marginBottom: spacing.s,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    borderRadius: scaleWidth(8),
    borderWidth: 1,
    borderStyle: 'dashed',
    alignSelf: 'flex-start', // Only take up as much space as needed
  },
  addTaskText: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
  },
});

export default React.memo(TodoGroup);