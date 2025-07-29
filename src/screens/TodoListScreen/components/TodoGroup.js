// src/screens/TodoListScreen/components/TodoGroup.js
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Keyboard,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { styles as todoListStyles } from '../TodoListStyles';
import TodoItem from './TodoItem';
import SubtaskInputModal from './SubtaskInputModal';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * TodoGroup component - renders a collapsible group of todo items
 * Optimized for performance with proper animations and state management
 */
const TodoGroup = memo(({ 
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
  canAddMoreTodos,
  showFeatureLimitBanner
}) => {
  // State for adding subtasks
  const [addingSubtask, setAddingSubtask] = useState(false);
  
  // Animation values with useRef to prevent recreating on each render
  const fadeAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Track the swipeable ref for controlling the swipe state
  const swipeableRef = useRef(null);

  // Animation configuration
  const animConfig = {
    duration: 250,
    useNativeDriver: true, // Native driver for rotation and opacity
    easing: Easing.inOut(Easing.ease)
  };
  
  // Get child todos for this group - memoized to prevent recalculation
  const childTodos = React.useMemo(() => {
    return todos.filter(todo => todo.groupId === group.id);
  }, [todos, group.id]);
  
  const completedChildTodos = React.useMemo(() => {
    return childTodos.filter(todo => todo.completed);
  }, [childTodos]);
  
  // Update fadeAnim when isExpanded changes
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
    
    // Animate the rotation of the chevron
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      ...animConfig
    }).start();
  }, [isExpanded, fadeAnim, rotateAnim, animConfig]);
  
  // Handle toggling group completion
  const handleToggle = useCallback(() => {
    if (onToggle) {
      // Add a subtle scale animation for feedback
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 50,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();
      
      onToggle(group.id);
    }
  }, [onToggle, group.id, scaleAnim]);
  
  // Handle expansion toggle with animation
  const handleExpand = useCallback(() => {
    // Configure layout animation for smooth height transition
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Then call the onToggleExpansion function to update the state
    if (onToggleExpansion) {
      onToggleExpansion();
    }
  }, [onToggleExpansion]);
  
  // Handle adding a subtask with zero-flash optimization
  const handleAddSubtask = useCallback(() => {
    // Dismiss keyboard first to prevent flashing
    Keyboard.dismiss();
    
    // Use InteractionManager to ensure UI is ready
    InteractionManager.runAfterInteractions(() => {
      // Toggle adding state
      const isAdding = !addingSubtask;
      setAddingSubtask(isAdding);
      
      // Notify parent component about subtask mode
      if (onAddingSubtask) {
        onAddingSubtask(isAdding);
      }
    });
  }, [addingSubtask, onAddingSubtask]);
  
  // Submit the new subtask with optimized handling
  const submitSubtask = useCallback((tab, groupId, text) => {
    if (!text.trim()) return;
    
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
      
      return;
    }
    
    // Add the subtask - wrap in InteractionManager to prevent flashing
    InteractionManager.runAfterInteractions(() => {
      if (addTodo) {
        addTodo(tab, groupId, text);
      } else {
        // Fallback if addTodo not provided
        showSuccess('Added subtask', { type: 'success' });
      }
    });
  }, [activeTab, addTodo, canAddMoreTodos, showFeatureLimitBanner, showSuccess]);
  
  // Cancel adding a subtask
  const cancelAddSubtask = useCallback(() => {
    setAddingSubtask(false);
    if (onAddingSubtask) onAddingSubtask(false);
  }, [onAddingSubtask]);
  
  // Handle long press on the group
  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      onLongPress(group);
    }
  }, [onLongPress, group]);
  
  // Calculate the rotate interpolation for the chevron
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg']
  });
  
  // Render swipe actions for the group
  const renderRightActions = useCallback((progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={localStyles.swipeActionsContainer}>
        <Animated.View 
          style={[
            localStyles.deleteAction,
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
            style={localStyles.actionButton}
          >
            <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
            <Text style={localStyles.actionText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }, [onDelete, group.id, theme.error]);
  
  // Generate a lighter version of the primary color for the background
  const getBackgroundColor = useCallback(() => {
    if (group.completed) {
      // For completed groups, use a more muted background
      return `${theme.primary}10`; // 10% opacity
    }
    
    // For normal groups, use a very subtle primary color background
    return `${theme.primary}08`; // 8% opacity
  }, [group.completed, theme.primary]);
  
  // Determine the border style - subtle for better design
  const getBorderStyle = useCallback(() => {
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
  }, [group.completed, theme.primary]);
  
  // Optimized rendering of child todos to prevent recreating items
  const renderChildTodos = useCallback(() => {
    return childTodos.map(todo => (
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
    ));
  }, [childTodos, onToggle, onDelete, onLongPress, theme, group.completed]);
  
  return (
    <Animated.View style={[
      localStyles.groupContainer,
      { transform: [{ scale: scaleAnim }] }
    ]}>
      {/* Swipeable Group Header */}
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        containerStyle={localStyles.swipeContainer}
      >
        <TouchableOpacity
          style={[
            localStyles.groupHeader,
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
            style={localStyles.checkbox}
            onPress={handleToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="checkbox"
            accessibilityLabel={`${group.completed ? 'Completed' : 'Mark as complete'}`}
            accessibilityState={{ checked: group.completed }}
          >
            <View style={[
              localStyles.checkboxInner,
              {
                backgroundColor: group.completed ? theme.primary : 'transparent',
                borderColor: group.completed ? theme.primary : theme.textSecondary,
              }
            ]}>
              {group.completed && (
                <Ionicons 
                  name="checkmark" 
                  size={14} 
                  color="#FFFFFF" 
                />
              )}
            </View>
          </TouchableOpacity>
          
          {/* Group Title */}
          <Text 
            style={[
              localStyles.groupTitle, 
              { 
                color: theme.text,
                textDecorationLine: group.completed ? 'line-through' : 'none',
                opacity: group.completed ? 0.7 : 1,
                fontWeight: '600'
              }
            ]}
            numberOfLines={1}
            maxFontSizeMultiplier={1.8}
          >
            {group.title}
          </Text>
          
          {/* Task Counter Badge */}
          <View style={[
            localStyles.taskCountBadge,
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
                localStyles.taskCountText,
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
          
          {/* Add Subtask Button */}
          <TouchableOpacity
            style={localStyles.addSubtaskButton}
            onPress={handleAddSubtask}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={addingSubtask}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add subtask"
            accessibilityHint="Opens input to add a new subtask to this group"
          >
            <Ionicons 
              name="add-outline" 
              size={20} 
              color={theme.textSecondary} 
            />
          </TouchableOpacity>
          
          {/* Expand Indicator */}
          <Animated.View style={{
            transform: [{ rotate }]
          }}>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme.textSecondary} 
            />
          </Animated.View>
        </TouchableOpacity>
      </Swipeable>
      
      {/* Subtask Input Modal (using our optimized component) */}
      {addingSubtask && (
        <SubtaskInputModal
          onAddSubtask={submitSubtask}
          onCancel={cancelAddSubtask}
          theme={theme}
          groupId={group.id}
          activeTab={activeTab}
          parentGroupName={group.title}
        />
      )}
      
      {/* Group Content (Expandable) */}
      {isExpanded && childTodos.length > 0 && (
        <Animated.View style={[
          localStyles.groupContent,
          { opacity: fadeAnim }
        ]}>
          {/* Child Todos - Use memoized renderer */}
          {renderChildTodos()}
        </Animated.View>
      )}
      
      {/* Add First Task Button (Visible only when expanded and when there are no tasks yet) */}
      {isExpanded && childTodos.length === 0 && !addingSubtask && (
        <TouchableOpacity
          style={[
            localStyles.emptyGroupAddButton,
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
            size={18} 
            color={theme.primary} 
          />
          <Text style={[
            localStyles.emptyGroupAddText, 
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
            localStyles.addTaskButton,
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
            size={16} 
            color={theme.primary} 
            style={{ marginRight: 4 }}
          />
          <Text style={[
            localStyles.addTaskText, 
            { color: theme.primary }
          ]}>
            Add task
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

const localStyles = StyleSheet.create({
  groupContainer: {
    marginBottom: 12,
  },
  swipeContainer: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 44, // Ensure minimum touch target height
  },
  checkbox: {
    marginRight: 12,
    padding: 2, // Added padding for touch target
  },
  checkboxInner: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  // Task counter badge styles
  taskCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCountText: {
    fontSize: 12,
  },
  // Add subtask button - visible unlike original
  addSubtaskButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  groupContent: {
    paddingLeft: 30, // Indent for subtasks
    marginTop: 8,
  },
  swipeActionsContainer: {
    width: 100,
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
    fontSize: 12,
    marginTop: 4,
  },
  // Empty group add button
  emptyGroupAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 30, // Match indent
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyGroupAddText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  // Add task button at the end of tasks list
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 30, // Match indent
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignSelf: 'flex-start', // Only take up as much space as needed
  },
  addTaskText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TodoGroup;