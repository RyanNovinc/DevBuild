// src/screens/TodoListScreen/components/tabs/TodayTab.js
import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  Alert, 
  Keyboard, 
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  Platform,
  InteractionManager,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../TodoListStyles';
import { sortItemsByPriority } from '../../TodoUtils';
import TodoItem from '../TodoItem';
import TodoGroup from '../TodoGroup';
import EmptyState from '../../../../components/EmptyState';
import EmptyTodoIllustration from '../../../../components/illustrations/EmptyTodoIllustration';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initial state for stability
const initialUIState = {
  isAddingItem: false,
  isTogglingMode: false,
  isFadingList: false,
  lastAddedId: null,
  inputMode: 'todo',
}

// UI state reducer for better state management
function uiStateReducer(state, action) {
  switch (action.type) {
    case 'START_ADDING':
      return { ...state, isAddingItem: true };
    case 'FINISH_ADDING':
      return { ...state, isAddingItem: false, lastAddedId: action.payload };
    case 'START_TOGGLING':
      return { ...state, isTogglingMode: true };
    case 'FINISH_TOGGLING':
      return { ...state, isTogglingMode: false, inputMode: action.payload };
    case 'START_FADE':
      return { ...state, isFadingList: true };
    case 'FINISH_FADE':
      return { ...state, isFadingList: false };
    case 'RESET_LAST_ADDED':
      return { ...state, lastAddedId: null };
    default:
      return state;
  }
}

// Create a completely separate, pure input component that won't re-render with the parent
const StableInput = React.memo(({
  inputRef,
  placeholder,
  placeholderTextColor,
  onChangeText,
  onSubmitEditing,
  onFocus,
  onBlur,
  textColor,
  initialValue = '',
  returnKeyType = 'done',
}) => {
  // Internal state that doesn't cause parent re-renders
  const [localValue, setLocalValue] = useState(initialValue);
  
  // Update local value when initialValue changes
  useEffect(() => {
    if (initialValue !== localValue) {
      setLocalValue(initialValue);
    }
  }, [initialValue]);
  
  // Store the value on the ref for external access
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current._lastText = localValue;
    }
  }, [localValue, inputRef]);
  
  // Handle text changes locally first
  const handleLocalChange = (text) => {
    setLocalValue(text);
    if (onChangeText) onChangeText(text);
  };
  
  // Handle submit with cached value
  const handleSubmit = () => {
    if (onSubmitEditing) onSubmitEditing(localValue);
  };
  
  // Methods exposed to parent via the ref
  useEffect(() => {
    if (inputRef.current) {
      // Method to get current text
      inputRef.current.getValue = () => localValue;
      
      // Method to clear text without parent re-render
      inputRef.current.clearText = () => {
        setLocalValue('');
      };
    }
  }, [localValue, inputRef]);
  
  return (
    <TextInput
      ref={inputRef}
      style={[styles.input, { color: textColor }]}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      value={localValue}
      onChangeText={handleLocalChange}
      onSubmitEditing={handleSubmit}
      onFocus={onFocus}
      onBlur={onBlur}
      returnKeyType={returnKeyType}
      autoCorrect={false}
      autoCapitalize="none"
      spellCheck={false}
      blurOnSubmit={false}
    />
  );
}, () => true); // Always prevent re-renders from parent

/**
 * TodayTab component with zero-flash input handling
 */
const TodayTab = ({
  todos,
  setTodos,
  tomorrowTodos,
  setTomorrowTodos,
  laterTodos,
  setLaterTodos,
  newTodoText,
  setNewTodoText,
  isAddingGroup,
  setIsAddingGroup,
  newGroupName,
  setNewGroupName,
  expandedGroups,
  setExpandedGroups,
  addTodo,
  addGroup,
  toggleTodo,
  startEditTodo,
  moveIncompleteTodosToTomorrow,
  moveTomorrowTodosToToday,
  theme,
  showSuccess,
  isKeyboardVisible,
  setIsAddingSubtask,
  canAddMoreTodos,
  showFeatureLimitBanner,
  updateInputFocus = null
}) => {
  // Use reducer for UI state to avoid multiple renders
  const [uiState, dispatch] = useReducer(uiStateReducer, initialUIState);
  
  // Track if we're adding a subtask
  const [isAddingSubtaskLocal, setIsAddingSubtaskLocal] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Refs for inputs - these won't trigger re-renders
  const todoInputRef = useRef(null);
  const groupInputRef = useRef(null);
  
  // Memoize top level items to prevent re-calculations
  const topLevelItems = useMemo(() => {
    return todos.filter(item => !item.groupId || item.isGroup);
  }, [todos]);

  // Reset lastAddedId after delay
  useEffect(() => {
    if (uiState.lastAddedId) {
      const timer = setTimeout(() => {
        dispatch({ type: 'RESET_LAST_ADDED' });
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [uiState.lastAddedId]);
  
  // Local update method to minimize parent state updates
  const updateTodos = useCallback((newTodos) => {
    // Start fade animation
    dispatch({ type: 'START_FADE' });
    
    // Animate fade out with subtle scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0.98,
        duration: 80,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.995,
        duration: 80,
        useNativeDriver: true
      })
    ]).start();
    
    // Use InteractionManager to defer update until after animations
    InteractionManager.runAfterInteractions(() => {
      // Wait for animation to complete
      setTimeout(() => {
        // Update todos array
        setTodos(newTodos);
        
        // Animate fade back in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true
          })
        ]).start(() => {
          // Mark fade as complete
          dispatch({ type: 'FINISH_FADE' });
        });
      }, 50);
    });
  }, [setTodos, fadeAnim, scaleAnim]);

  // Handle input focus changes with debounce
  const handleInputFocus = useCallback((focused) => {
    if (updateInputFocus) {
      updateInputFocus(focused);
    }
  }, [updateInputFocus]);
  
  // Toggle between Todo and Group input modes with zero flash
  const toggleInputMode = useCallback(() => {
    // Prevent multiple toggles
    if (uiState.isTogglingMode) return;
    dispatch({ type: 'START_TOGGLING' });
    
    // DON'T dismiss keyboard - let it stay open
    
    // Swap the mode without causing flashes
    const newMode = uiState.inputMode === 'todo' ? 'group' : 'todo';
    
    // Update the mode immediately
    dispatch({ type: 'FINISH_TOGGLING', payload: newMode });
    
    // Focus the appropriate input immediately
    setTimeout(() => {
      const nextInputRef = newMode === 'todo' ? todoInputRef : groupInputRef;
      if (nextInputRef.current) {
        nextInputRef.current.focus();
      }
    }, 100);
  }, [uiState.inputMode, uiState.isTogglingMode]);
  
  // Add a todo or group with zero flash
  const handleAddItem = useCallback(() => {
    // Prevent multiple executions
    if (uiState.isAddingItem) return;
    dispatch({ type: 'START_ADDING' });
    
    // Get active input ref and text
    const activeInputRef = uiState.inputMode === 'todo' ? todoInputRef : groupInputRef;
    let text = '';
    
    // Extract text from the input ref
    if (activeInputRef.current && activeInputRef.current.getValue) {
      text = activeInputRef.current.getValue().trim();
    }
    
    if (!text) {
      dispatch({ type: 'FINISH_ADDING', payload: null });
      return;
    }
    
    // Clear the input first to prevent flash
    if (activeInputRef.current && activeInputRef.current.clearText) {
      activeInputRef.current.clearText();
    }
    
    // Create the new item with a unique ID
    const newItemId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Fade out animation before updating state
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0.98,
        duration: 70,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.995,
        duration: 70,
        useNativeDriver: true
      })
    ]).start();
    
    // Use InteractionManager to defer state updates until after animations
    InteractionManager.runAfterInteractions(() => {
      // Small delay to complete animation
      setTimeout(() => {
        if (uiState.inputMode === 'todo') {
          // Check limits
          if (canAddMoreTodos && !canAddMoreTodos('today', false)) {
            if (showFeatureLimitBanner) {
              showFeatureLimitBanner('Free version limited to 10 items in Today tab. Upgrade to Pro for unlimited todos.');
            } else {
              showSuccess('Free version limited to 10 items in Today tab', { type: 'warning' });
            }
            
            // Restore animation and reset state
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true
              })
            ]).start();
            
            dispatch({ type: 'FINISH_ADDING', payload: null });
            return;
          }
          
          // Create new todo
          const newTodo = {
            id: newItemId,
            title: text,
            completed: false,
            createdAt: new Date().toISOString(),
            groupId: null
          };
          
          // Update todos array with a single operation
          const updatedTodos = [...todos, newTodo];
          updateTodos(updatedTodos);
          
          // Update parent state safely
          setNewTodoText('');
          
          // Show success
          showSuccess('To-do added');
          
          // Complete adding process with the new ID
          dispatch({ type: 'FINISH_ADDING', payload: newItemId });
        } else {
          // Check limits
          if (canAddMoreTodos && !canAddMoreTodos('today', true)) {
            if (showFeatureLimitBanner) {
              showFeatureLimitBanner('Free version limited to 10 items in Today tab. Upgrade to Pro for unlimited todos.');
            } else {
              showSuccess('Free version limited to 10 items in Today tab', { type: 'warning' });
            }
            
            // Restore animation and reset state
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true
              })
            ]).start();
            
            dispatch({ type: 'FINISH_ADDING', payload: null });
            return;
          }
          
          // Create new group
          const newGroup = {
            id: newItemId,
            title: text,
            isGroup: true,
            completed: false,
            createdAt: new Date().toISOString(),
            tab: 'today'
          };
          
          // Batch operations: update todos and expanded groups together
          const updatedTodos = [...todos, newGroup];
          updateTodos(updatedTodos);
          
          // Update expanded groups in a separate operation
          setExpandedGroups(prev => ({
            ...prev,
            [newGroup.id]: true
          }));
          
          // Update parent state safely
          setNewGroupName('');
          
          // Show success
          showSuccess('Group added');
          
          // Complete adding process with the new ID
          dispatch({ type: 'FINISH_ADDING', payload: newItemId });
        }
        
        // Focus input again after a delay
        setTimeout(() => {
          if (activeInputRef.current) {
            activeInputRef.current.focus();
          }
        }, 100);
      }, 50);
    });
  }, [
    uiState.inputMode, 
    uiState.isAddingItem, 
    todos, 
    updateTodos, 
    setNewTodoText, 
    setNewGroupName, 
    setExpandedGroups, 
    canAddMoreTodos, 
    showFeatureLimitBanner, 
    showSuccess,
    fadeAnim,
    scaleAnim
  ]);
  
  // Unified delete todo function with better confirmation handling
  const deleteTodo = useCallback((id, isChildItem = false) => {
    // Get confirmation setting from AsyncStorage
    AsyncStorage.getItem('todo_action_confirmation_enabled')
      .then(value => {
        const confirmationEnabled = value === 'true';
        
        // For child items or when confirmations are disabled, delete without confirmation
        if (isChildItem || !confirmationEnabled) {
          performDelete(id, isChildItem);
          return;
        }
        
        // For non-child items with confirmations enabled, check if it's a group
        const todoToDelete = todos.find(todo => todo.id === id);
        
        if (todoToDelete && todoToDelete.isGroup) {
          // Group deletion confirmation
          Alert.alert(
            "Delete Group",
            "This will delete the group and all items in it. Continue?",
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Delete", 
                style: "destructive",
                onPress: () => performDelete(id, isChildItem)
              }
            ]
          );
        } else {
          // Regular todo deletion confirmation
          Alert.alert(
            "Delete Item",
            `Are you sure you want to delete "${todoToDelete ? todoToDelete.title : 'this item'}"?`,
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Delete", 
                style: "destructive",
                onPress: () => performDelete(id, isChildItem)
              }
            ]
          );
        }
      })
      .catch(error => {
        console.error('Error reading confirmation setting:', error);
        // Default to no confirmation if there's an error
        performDelete(id, isChildItem);
      });
  }, [todos]);
  
  // Actually perform the deletion without additional confirmations
  const performDelete = useCallback((id, isChildItem) => {
    // Start fade animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0.98,
        duration: 80,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.995,
        duration: 80,
        useNativeDriver: true
      })
    ]).start();
    
    // Use InteractionManager to defer state updates
    InteractionManager.runAfterInteractions(() => {
      // Small delay to complete animation
      setTimeout(() => {
        if (isChildItem) {
          // Simple deletion for child items
          const updatedTodos = todos.filter(todo => todo.id !== id);
          updateTodos(updatedTodos);
          showSuccess('Subtask deleted');
        } else {
          const todoToDelete = todos.find(todo => todo.id === id);
          
          if (todoToDelete && todoToDelete.isGroup) {
            // Delete group and all its children
            const updatedTodos = todos.filter(item => item.id !== id && item.groupId !== id);
            updateTodos(updatedTodos);
            showSuccess('Group deleted');
          } else {
            // Delete individual todo
            const updatedTodos = todos.filter(todo => todo.id !== id);
            updateTodos(updatedTodos);
            showSuccess('To-do deleted');
          }
        }
      }, 50);
    });
  }, [todos, updateTodos, showSuccess, fadeAnim, scaleAnim]);
  
  // Toggle group expansion
  const toggleGroupExpansion = useCallback((groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  }, [setExpandedGroups]);
  
  // Move a todo item to tomorrow
  const moveTodoToTomorrow = useCallback((todo) => {
    // Start fade animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0.98,
        duration: 80,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.995,
        duration: 80,
        useNativeDriver: true
      })
    ]).start();
    
    // Use InteractionManager to defer state updates
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        // Remove from today
        const updatedTodos = todos.filter(item => item.id !== todo.id);
        updateTodos(updatedTodos);
        
        // Add to tomorrow with the same properties
        setTomorrowTodos([...tomorrowTodos, {...todo, tab: 'tomorrow'}]);
        
        showSuccess('Item moved to Tomorrow');
      }, 50);
    });
  }, [todos, updateTodos, tomorrowTodos, setTomorrowTodos, showSuccess, fadeAnim, scaleAnim]);
  
  // Move a todo item to later
  const moveTodoToLater = useCallback((todo) => {
    // Start fade animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0.98,
        duration: 80,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.995,
        duration: 80,
        useNativeDriver: true
      })
    ]).start();
    
    // Use InteractionManager to defer state updates
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        // Remove from today
        const updatedTodos = todos.filter(item => item.id !== todo.id);
        updateTodos(updatedTodos);
        
        // Add to later with the same properties
        setLaterTodos([...laterTodos, {...todo, tab: 'later'}]);
        
        showSuccess('Item moved to Later');
      }, 50);
    });
  }, [todos, updateTodos, laterTodos, setLaterTodos, showSuccess, fadeAnim, scaleAnim]);
  
  // Listen for subtask mode changes - update both local and parent state
  const handleSubtaskModeChange = useCallback((isAdding) => {
    setIsAddingSubtaskLocal(isAdding);
    // Pass the subtask state up to the parent component
    if (setIsAddingSubtask) {
      setIsAddingSubtask(isAdding);
    }
  }, [setIsAddingSubtask]);
  
  // Show options for a todo
  const showTodoOptions = useCallback((todo) => {
    const options = [
      {
        text: 'Edit',
        onPress: () => {
          startEditTodo(todo, 'today');
        }
      }
    ];
    
    // If it's not a group, add move options
    if (!todo.isGroup) {
      options.push({
        text: 'Move to Tomorrow',
        onPress: () => moveTodoToTomorrow(todo)
      });
      
      options.push({
        text: 'Move to Later',
        onPress: () => moveTodoToLater(todo)
      });
    }
    
    // Add delete option last
    options.push({
      text: 'Delete',
      style: 'destructive',
      onPress: () => deleteTodo(todo.id)
    });
    
    // Add cancel option
    options.push({
      text: 'Cancel',
      style: 'cancel'
    });
    
    Alert.alert(
      todo.isGroup ? 'Group Options' : 'To-Do Options',
      `'${todo.title}'`,
      options
    );
  }, [startEditTodo, moveTodoToTomorrow, moveTodoToLater, deleteTodo]);

  // Render a todo item or group with better performance
  const renderTodoItem = useCallback((item) => {
    // Skip rendering if this is a child item and its group is collapsed
    if (item.groupId && expandedGroups[item.groupId] !== true) {
      return null;
    }
    
    // Determine if this is the last added item for highlight effect
    const isLastAdded = item.id === uiState.lastAddedId;
    
    // Custom style for recently added items
    const itemStyle = isLastAdded ? {
      backgroundColor: `${theme.primary}10`,
    } : undefined;
    
    // If it's a group, render the TodoGroup component
    if (item.isGroup) {
      return (
        <TodoGroup
          key={item.id}
          group={item}
          todos={todos}
          isExpanded={expandedGroups[item.id] === true}
          onToggle={(id) => toggleTodo(id || item.id, 'today')}
          onDelete={deleteTodo}
          onToggleExpansion={() => toggleGroupExpansion(item.id)}
          onLongPress={showTodoOptions}
          theme={theme}
          showSuccess={showSuccess}
          addTodo={addTodo}
          onAddingSubtask={handleSubtaskModeChange}
          activeTab="today"
          canAddMoreTodos={canAddMoreTodos}
          showFeatureLimitBanner={showFeatureLimitBanner}
          style={itemStyle}
        />
      );
    }
    
    // For regular todo items that don't belong to a group
    if (!item.groupId) {
      return (
        <TodoItem
          key={item.id}
          item={item}
          onToggle={() => toggleTodo(item.id, 'today')}
          onDelete={() => deleteTodo(item.id)}
          onLongPress={showTodoOptions}
          theme={theme}
          fillCheckbox={true}
          style={itemStyle}
          isNew={isLastAdded}
        />
      );
    }
    
    // Child items of groups are handled within the group rendering
    return null;
  }, [
    todos, 
    expandedGroups, 
    toggleTodo, 
    deleteTodo, 
    toggleGroupExpansion, 
    showTodoOptions, 
    theme, 
    showSuccess, 
    addTodo, 
    handleSubtaskModeChange,
    canAddMoreTodos, 
    showFeatureLimitBanner,
    uiState.lastAddedId
  ]);

  return (
    <View style={localStyles.container}>
      {/* Top Input Section - No TouchableWithoutFeedback to prevent keyboard dismissal */}
      <View>
        {/* Combined Input for Todo/Group */}
        <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Toggle icon between todo and group mode */}
            <TouchableOpacity 
              style={styles.inputIcon} 
              onPress={toggleInputMode}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={uiState.isTogglingMode} // Prevent multiple presses
            >
              <Ionicons 
                name={uiState.inputMode === 'todo' ? "checkbox-outline" : "folder-outline"} 
                size={22} 
                color={theme.primary} 
              />
            </TouchableOpacity>
            
            {/* Dynamic input field based on mode - Using completely isolated components */}
            {uiState.inputMode === 'todo' ? (
              <StableInput
                inputRef={todoInputRef}
                placeholder="Add a new to-do..."
                placeholderTextColor={theme.textSecondary}
                textColor={theme.text}
                initialValue={newTodoText}
                onChangeText={(text) => {
                  // We intentionally don't update parent state on every keystroke
                  // This is handled by the component internally
                }}
                onSubmitEditing={handleAddItem}
                onFocus={() => handleInputFocus(true)}
                onBlur={() => handleInputFocus(false)}
              />
            ) : (
              <StableInput
                inputRef={groupInputRef}
                placeholder="Create a new group..."
                placeholderTextColor={theme.textSecondary}
                textColor={theme.text}
                initialValue={newGroupName}
                onChangeText={(text) => {
                  // We intentionally don't update parent state on every keystroke
                  // This is handled by the component internally
                }}
                onSubmitEditing={handleAddItem}
                onFocus={() => handleInputFocus(true)}
                onBlur={() => handleInputFocus(false)}
              />
            )}
            
            {/* Dynamic add button with improved press handling */}
            <TouchableOpacity
              style={[
                localStyles.addButton, 
                { 
                  backgroundColor: theme.primary,
                  opacity: uiState.isAddingItem ? 0.7 : 1, // Visual feedback
                }
              ]}
              onPress={handleAddItem}
              disabled={uiState.isAddingItem} // Prevent multiple presses
              activeOpacity={0.7}
            >
              <Text style={localStyles.addButtonText}>
                {uiState.inputMode === 'todo' ? 'Add' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Input mode indicator */}
          <View style={localStyles.modeIndicator}>
            <Text style={{ 
              fontSize: 12, 
              color: theme.textSecondary, 
              fontStyle: 'italic'
            }}>
              {uiState.inputMode === 'todo' ? 'Adding to-do items' : 'Creating a group'} 
              {' • '}
              <Text onPress={toggleInputMode} style={{ color: theme.primary }}>
                Tap icon to switch
              </Text>
            </Text>
          </View>
        </View>
      
      {/* Todo List with persistent keyboard and zero-flash animations */}
      <Animated.View 
        style={[
          { flex: 1 }, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <ScrollView 
          style={styles.todoList}
          keyboardShouldPersistTaps="always"
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 100,
          }}
          contentContainerStyle={localStyles.scrollContent}
          scrollEventThrottle={16} // For smooth scrolling
        >
          {topLevelItems.length > 0 ? (
            // Render todo items when there are items
            sortItemsByPriority(todos).map(renderTodoItem)
          ) : (
            // Render empty state within the ScrollView
            <View style={localStyles.emptyStateContainer}>
              <EmptyState
                title="No To-dos Yet"
                message="Add quick tasks to your daily to-do list. Use numbers like '1. High Priority' or '2.1 Subtask' to order them."
                icon="list"
                iconColor={theme.primary}
                theme={theme}
                illustration={<EmptyTodoIllustration theme={theme} />}
              />
            </View>
          )}
          
          {/* Add padding at the bottom for better scrolling */}
          <View style={localStyles.bottomPadding} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

// Local styles
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    minWidth: 60,
  },
  addButtonText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#FFFFFF',
  },
  modeIndicator: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10, 
    marginTop: -5,
    paddingHorizontal: 5 
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 140,
    minHeight: 300,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    height: 400,
  },
  bottomPadding: {
    height: 120,
  }
});

// Export with optimized memo that compares only essential props
export default React.memo(TodayTab, (prevProps, nextProps) => {
  // Strict comparison for essential props only
  return (
    prevProps.todos === nextProps.todos &&
    prevProps.isKeyboardVisible === nextProps.isKeyboardVisible &&
    prevProps.isAddingSubtask === nextProps.isAddingSubtask
  );
});