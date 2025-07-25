// src/screens/TodoListScreen/components/tabs/LaterTab.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  Alert, 
  Keyboard, 
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../TodoListStyles';
import { sortItemsByPriority } from '../../TodoUtils';
import TodoItem from '../TodoItem';
import TodoGroup from '../TodoGroup';
import FloatingButton from '../FloatingButton';
import EmptyState from '../../../../components/EmptyState';
import EmptyTodoIllustration from '../../../../components/illustrations/EmptyTodoIllustration';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import responsive utilities
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility,
  ensureAccessibleTouchTarget
} from '../../../../utils/responsive';

/**
 * LaterTab component with improved input handling and simplified confirmation dialog
 */
const LaterTab = ({
  todos: todosFromProps,
  laterTodos,
  setLaterTodos,
  todos,
  setTodos,
  tomorrowTodos,
  setTomorrowTodos,
  newLaterTodoText,
  setNewLaterTodoText,
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
  moveLaterItemsToTomorrow,
  theme,
  showSuccess,
  isKeyboardVisible,
  setIsAddingSubtask, // Added to pass up to parent component
  // New props for limit checking
  canAddMoreTodos,
  showFeatureLimitBanner
}) => {
  // Track if we're adding a subtask
  const [isAddingSubtaskLocal, setIsAddingSubtaskLocal] = useState(false);
  
  // New state to track input mode: 'todo' or 'group'
  const [inputMode, setInputMode] = useState('todo');
  
  // Get top level items (not in groups) and groups
  const topLevelItems = laterTodos.filter(item => !item.groupId || item.isGroup);
  
  // Toggle between Todo and Group input modes
  const toggleInputMode = () => {
    if (inputMode === 'todo') {
      // Switching from todo to group - copy todo text to group name
      setNewGroupName(newLaterTodoText);
      setInputMode('group');
    } else {
      // Switching from group to todo - copy group name to todo text
      setNewLaterTodoText(newGroupName);
      setInputMode('todo');
    }
  };
  
  // Handle the Add button click based on current input mode
  const handleAddItem = () => {
    // Store the current values before adding
    const currentTodoText = newLaterTodoText.trim();
    const currentGroupName = newGroupName.trim();
    
    if (inputMode === 'todo') {
      if (currentTodoText) {
        // First check if we can add more todos
        if (!canAddMoreTodos || !canAddMoreTodos('later', false)) {
          // If canAddMoreTodos function is provided and returns false
          if (showFeatureLimitBanner) {
            showFeatureLimitBanner('Free version limited to 5 items in Later tab. Upgrade to Pro for unlimited todos.');
          } else {
            showSuccess('Free version limited to 5 items in Later tab', { type: 'warning' });
          }
          return;
        }
        
        // Clear the input field immediately to prevent autocorrect issues
        setNewLaterTodoText('');
        // Then add the todo with the stored value
        addTodo('later', null, currentTodoText);
      }
    } else {
      if (currentGroupName) {
        // First check if we can add more groups
        if (!canAddMoreTodos || !canAddMoreTodos('later', true)) {
          // If canAddMoreTodos function is provided and returns false
          if (showFeatureLimitBanner) {
            showFeatureLimitBanner('Free version limited to 5 items in Later tab. Upgrade to Pro for unlimited todos.');
          } else {
            showSuccess('Free version limited to 5 items in Later tab', { type: 'warning' });
          }
          return;
        }
        
        // Clear the input field immediately to prevent autocorrect issues
        setNewGroupName('');
        // Then add the group with the stored value
        addCustomGroup('later', currentGroupName);
      }
    }
    Keyboard.dismiss();
  };
  
  // Custom function to add a group with a specific name
  const addCustomGroup = (tab, customName) => {
    if (!customName) {
      showSuccess('Group name cannot be empty', { type: 'warning' });
      return;
    }
    
    // Check if we can add more groups
    if (!canAddMoreTodos || !canAddMoreTodos('later', true)) {
      // If canAddMoreTodos function is provided and returns false
      if (showFeatureLimitBanner) {
        showFeatureLimitBanner('Free version limited to 5 items in Later tab. Upgrade to Pro for unlimited todos.');
      } else {
        showSuccess('Free version limited to 5 items in Later tab', { type: 'warning' });
      }
      return;
    }
    
    const newGroup = {
      id: `group-${Date.now()}`,
      title: customName,
      isGroup: true,
      completed: false,
      createdAt: new Date().toISOString(),
      tab: 'later' // Explicitly set the tab for this group
    };
    
    setLaterTodos([...laterTodos, newGroup]);
    
    // Auto-expand the new group
    setExpandedGroups(prev => ({
      ...prev,
      [newGroup.id]: true
    }));
    
    showSuccess('Group added');
  };
  
  // Unified delete todo function with better confirmation handling
  const deleteTodo = (id, isChildItem = false) => {
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
        const todoToDelete = laterTodos.find(todo => todo.id === id);
        
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
  };
  
  // Actually perform the deletion without additional confirmations
  const performDelete = (id, isChildItem) => {
    if (isChildItem) {
      // Simple deletion for child items
      setLaterTodos(laterTodos.filter(todo => todo.id !== id));
      showSuccess('Subtask deleted');
    } else {
      const todoToDelete = laterTodos.find(todo => todo.id === id);
      
      if (todoToDelete && todoToDelete.isGroup) {
        // Delete group and all its children
        setLaterTodos(laterTodos.filter(item => item.id !== id && item.groupId !== id));
        showSuccess('Group deleted');
      } else {
        // Delete individual todo
        setLaterTodos(laterTodos.filter(todo => todo.id !== id));
        showSuccess('To-do deleted');
      }
    }
  };
  
  // Toggle group expansion
  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  
  // Move a todo item to today
  const moveTodoToToday = (todo) => {
    // Check if adding to today would exceed the limit
    if (canAddMoreTodos && !canAddMoreTodos('today', todo.isGroup)) {
      if (showFeatureLimitBanner) {
        showFeatureLimitBanner('Free version limited to 10 items in Today tab. Upgrade to Pro for unlimited todos.');
      } else {
        showSuccess('Today tab item limit reached', { type: 'warning' });
      }
      return;
    }
    
    // Remove from later
    setLaterTodos(laterTodos.filter(item => item.id !== todo.id));
    
    // Add to today with the same properties
    setTodos([...todos, {...todo, tab: 'today'}]);
    
    showSuccess('Item moved to Today');
  };
  
  // Move a todo item to tomorrow
  const moveTodoToTomorrow = (todo) => {
    // Check if adding to tomorrow would exceed the limit
    if (canAddMoreTodos && !canAddMoreTodos('tomorrow', todo.isGroup)) {
      if (showFeatureLimitBanner) {
        showFeatureLimitBanner('Free version limited to 7 items in Tomorrow tab. Upgrade to Pro for unlimited todos.');
      } else {
        showSuccess('Tomorrow tab item limit reached', { type: 'warning' });
      }
      return;
    }
    
    // Remove from later
    setLaterTodos(laterTodos.filter(item => item.id !== todo.id));
    
    // Add to tomorrow with the same properties
    setTomorrowTodos([...tomorrowTodos, {...todo, tab: 'tomorrow'}]);
    
    showSuccess('Item moved to Tomorrow');
  };
  
  // Show options for a todo
  const showTodoOptions = (todo) => {
    console.log('Showing options for todo:', todo.id, todo.title, 'isGroup:', todo.isGroup);
    
    const options = [
      {
        text: 'Edit',
        onPress: () => {
          console.log('Edit pressed for:', todo.id, todo.title);
          startEditTodo(todo, 'later'); // Directly pass the todo item
        }
      }
    ];
    
    // If it's not a group, add move options
    if (!todo.isGroup) {
      options.push({
        text: 'Move to Today',
        onPress: () => moveTodoToToday(todo)
      });
      
      options.push({
        text: 'Move to Tomorrow',
        onPress: () => moveTodoToTomorrow(todo)
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
  };

  // Listen for subtask mode changes - update both local and parent state
  const handleSubtaskModeChange = (isAdding) => {
    setIsAddingSubtaskLocal(isAdding);
    // Pass the subtask state up to the parent component
    if (setIsAddingSubtask) {
      setIsAddingSubtask(isAdding);
    }
  };

  // Render a todo item or group
  const renderTodoItem = (item) => {
    // Skip rendering if this is a child item and its group is collapsed
    if (item.groupId && expandedGroups[item.groupId] !== true) {
      return null;
    }
    
    // If it's a group, render the TodoGroup component
    if (item.isGroup) {
      return (
        <TodoGroup
          key={item.id}
          group={item}
          todos={laterTodos}
          isExpanded={expandedGroups[item.id] === true}
          onToggle={(id) => toggleTodo(id || item.id, 'later')}
          onDelete={deleteTodo}
          onToggleExpansion={() => toggleGroupExpansion(item.id)}
          onLongPress={(itemToEdit) => {
            console.log('Long press in LaterTab for:', itemToEdit.id, itemToEdit.title);
            showTodoOptions(itemToEdit);
          }}
          theme={theme}
          showSuccess={showSuccess}
          addTodo={addTodo} // Pass the addTodo function
          onAddingSubtask={handleSubtaskModeChange} // Pass subtask mode handler
          activeTab="later" // Pass the active tab explicitly
          canAddMoreTodos={canAddMoreTodos} // Pass limit checking function
          showFeatureLimitBanner={showFeatureLimitBanner} // Pass limit banner function
        />
      );
    }
    
    // For regular todo items that don't belong to a group
    if (!item.groupId) {
      return (
        <TodoItem
          key={item.id}
          item={item}
          onToggle={() => toggleTodo(item.id, 'later')}
          onDelete={() => deleteTodo(item.id)}
          onLongPress={(itemToEdit) => {
            console.log('Top level item long press:', itemToEdit.id, itemToEdit.title);
            showTodoOptions(itemToEdit);
          }}
          theme={theme}
          fillCheckbox={true}
        />
      );
    }
    
    // Child items of groups are handled within the group rendering
    return null;
  };

  return (
    <View style={localStyles.container}>
      {/* Top Input Section */}
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View>
          {/* Combined Input for Todo/Group */}
          <View style={[
            styles.inputContainer, 
            { 
              backgroundColor: theme.card, 
              borderColor: theme.border,
              minHeight: accessibility.minTouchTarget,
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.s,
              marginHorizontal: isSmallDevice ? spacing.xxs : spacing.xs,
            }
          ]}>
            {/* Toggle icon between todo and group mode */}
            <TouchableOpacity 
              style={[
                styles.inputIcon,
                {
                  minHeight: accessibility.minTouchTarget,
                  minWidth: accessibility.minTouchTarget,
                  alignItems: 'center',
                  justifyContent: 'center',
                }
              ]} 
              onPress={toggleInputMode}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={inputMode === 'todo' ? "Switch to group mode" : "Switch to todo mode"}
              accessibilityHint={inputMode === 'todo' ? "Changes input to create a group" : "Changes input to create a todo item"}
            >
              <Ionicons 
                name={inputMode === 'todo' ? "checkbox-outline" : "folder-outline"} 
                size={scaleWidth(22)} 
                color={theme.primary} 
              />
            </TouchableOpacity>
            
            {/* Dynamic input field based on mode */}
            {inputMode === 'todo' ? (
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: theme.text,
                    fontSize: scaleFontSize(16),
                    flex: 1,
                    paddingVertical: spacing.xs,
                  }
                ]}
                placeholder="Add a to-do for later..."
                placeholderTextColor={theme.textSecondary}
                value={newLaterTodoText}
                onChangeText={setNewLaterTodoText}
                onSubmitEditing={() => {
                  if (newLaterTodoText.trim()) {
                    // Check if we can add more todos
                    if (!canAddMoreTodos || !canAddMoreTodos('later', false)) {
                      // If canAddMoreTodos function is provided and returns false
                      if (showFeatureLimitBanner) {
                        showFeatureLimitBanner('Free version limited to 5 items in Later tab. Upgrade to Pro for unlimited todos.');
                      } else {
                        showSuccess('Free version limited to 5 items in Later tab', { type: 'warning' });
                      }
                      return;
                    }
                    
                    // Store the current value
                    const text = newLaterTodoText.trim();
                    // Clear input immediately
                    setNewLaterTodoText('');
                    // Add the todo
                    addTodo('later', null, text);
                  }
                  Keyboard.dismiss();
                }}
                returnKeyType="done"
                autoCorrect={false} // Disable autocorrect
                autoCapitalize="none" // Disable auto capitalization
                spellCheck={false} // Disable spell check
                maxFontSizeMultiplier={1.3} // Limit Dynamic Type scaling
                accessible={true}
                accessibilityLabel="New to-do for later input"
                accessibilityHint="Enter text for a new to-do item for later"
              />
            ) : (
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: theme.text,
                    fontSize: scaleFontSize(16),
                    flex: 1,
                    paddingVertical: spacing.xs,
                  }
                ]}
                placeholder="Create a new group..."
                placeholderTextColor={theme.textSecondary}
                value={newGroupName}
                onChangeText={setNewGroupName}
                onSubmitEditing={() => {
                  if (newGroupName.trim()) {
                    // Check if we can add more groups
                    if (!canAddMoreTodos || !canAddMoreTodos('later', true)) {
                      // If canAddMoreTodos function is provided and returns false
                      if (showFeatureLimitBanner) {
                        showFeatureLimitBanner('Free version limited to 5 items in Later tab. Upgrade to Pro for unlimited todos.');
                      } else {
                        showSuccess('Free version limited to 5 items in Later tab', { type: 'warning' });
                      }
                      return;
                    }
                    
                    // Store the current value
                    const name = newGroupName.trim();
                    // Clear input immediately
                    setNewGroupName('');
                    // Add the group
                    addCustomGroup('later', name);
                  }
                  Keyboard.dismiss();
                }}
                returnKeyType="done"
                autoCorrect={false} // Disable autocorrect
                autoCapitalize="none" // Disable auto capitalization
                spellCheck={false} // Disable spell check
                maxFontSizeMultiplier={1.3} // Limit Dynamic Type scaling
                accessible={true}
                accessibilityLabel="New group input"
                accessibilityHint="Enter text for a new group"
              />
            )}
            
            {/* Dynamic add button */}
            <FloatingButton
              label={inputMode === 'todo' ? "Add" : "Create"}
              onPress={handleAddItem}
              theme={theme}
              isPrimary={true}
              withBackground={true}
              style={{ marginLeft: spacing.xs }}
            />
          </View>
          
          {/* Input mode indicator */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: spacing.s, 
            marginTop: -spacing.xs,
            paddingHorizontal: spacing.s 
          }}>
            <Text style={{ 
              fontSize: scaleFontSize(12), 
              color: theme.textSecondary, 
              fontStyle: 'italic',
              maxFontSizeMultiplier: 1.3, // Limit Dynamic Type scaling
            }}>
              {inputMode === 'todo' ? 'Adding to-do items' : 'Creating a group'} 
              {' • '}
              <Text 
                onPress={toggleInputMode} 
                style={{ color: theme.primary }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={inputMode === 'todo' ? "Switch to group mode" : "Switch to todo mode"}
              >
                Tap icon to switch
              </Text>
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
      
      {/* Todo List */}
      {topLevelItems.length > 0 ? (
        <ScrollView 
          style={styles.todoList}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ 
            paddingBottom: scaleHeight(140),
            paddingHorizontal: isSmallDevice ? spacing.xxs : spacing.xs,
          }} // Extra padding for bottom buttons
        >
          {/* Sort by priority numbers first, then groups, then non-group items */}
          {sortItemsByPriority(laterTodos).map(item => renderTodoItem(item))}
          
          {/* Add padding at the bottom for better scrolling */}
          <View style={{ height: scaleHeight(120) }} />
        </ScrollView>
      ) : (
        <View style={[
          styles.emptyState,
          {
            paddingHorizontal: spacing.m,
            paddingTop: scaleHeight(40),
          }
        ]}>
          <EmptyState
            title="Future Plans"
            message="Add tasks you want to do eventually. Use numbers like '1. High Priority' or '2.1 Subtask' to order them."
            icon="time-outline"
            iconColor={theme.primary}
            theme={theme}
            illustration={<EmptyTodoIllustration theme={theme} />}
          />
        </View>
      )}
      
      {/* No bottom buttons here - they're now in TodoButtonOverlay component */}
    </View>
  );
};

// Local styles for LaterTab
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xs,
  },
});

export default React.memo(LaterTab);