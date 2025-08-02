// src/screens/TodoListScreen/components/tabs/SimpleTomorrowTab.js
// Simplified TomorrowTab focused on keyboard functionality with original styling
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import existing components and styles
import { styles as sharedStyles } from '../../TodoListStyles';
import { sortItemsByPriority } from '../../TodoUtils';
import TodoItem from '../TodoItem';
import TodoGroup from '../TodoGroup';
import TodoButtonOverlay from '../TodoButtonOverlay';
import EmptyState from '../../../../components/EmptyState';
import EmptyTodoIllustration from '../../../../components/illustrations/EmptyTodoIllustration';

// Import responsive utilities
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice
} from '../../../../utils/responsive';

/**
 * Simplified TomorrowTab with basic TextInput - no complex state management
 */
const SimpleTomorrowTab = ({
  todos,
  setTodos,
  tomorrowTodos,
  setTomorrowTodos,
  laterTodos,
  setLaterTodos,
  newTomorrowTodoText,
  setNewTomorrowTodoText,
  newGroupName,
  setNewGroupName,
  expandedGroups,
  setExpandedGroups,
  addTodo,
  toggleTodo,
  deleteTodo,
  startEditTodo,
  theme,
  showSuccess,
  isKeyboardVisible,
  canAddMoreTodos,
  showFeatureLimitBanner
}) => {
  // Simple local state
  const [inputMode, setInputMode] = useState('todo'); // 'todo' or 'group'
  
  // Refs for input management
  const todoInputRef = useRef(null);
  const groupInputRef = useRef(null);

  // Get top level items
  const topLevelItems = tomorrowTodos.filter(item => !item.groupId || item.isGroup);

  // Toggle between todo and group input
  const toggleInputMode = () => {
    const newMode = inputMode === 'todo' ? 'group' : 'todo';
    setInputMode(newMode);
    
    // Focus the appropriate input after a short delay
    setTimeout(() => {
      const targetRef = newMode === 'todo' ? todoInputRef : groupInputRef;
      if (targetRef.current) {
        targetRef.current.focus();
      }
    }, 100);
  };

  // Handle adding items
  const handleAddItem = () => {
    if (inputMode === 'todo') {
      if (newTomorrowTodoText.trim()) {
        // Check limits
        if (!canAddMoreTodos('tomorrow', false)) {
          showFeatureLimitBanner('Free version limited to 7 items in Tomorrow tab. Upgrade to Pro for unlimited todos.');
          return;
        }
        
        // Add todo
        addTodo('tomorrow', null, newTomorrowTodoText);
        setNewTomorrowTodoText('');
        
        // Keep focus on input
        setTimeout(() => {
          if (todoInputRef.current) {
            todoInputRef.current.focus();
          }
        }, 50);
      }
    } else {
      if (newGroupName.trim()) {
        // Check limits
        if (!canAddMoreTodos('tomorrow', true)) {
          showFeatureLimitBanner('Free version limited to 7 items in Tomorrow tab. Upgrade to Pro for unlimited todos.');
          return;
        }
        
        // Add group
        const newGroup = {
          id: `group-${Date.now()}-${Math.random()}`,
          title: newGroupName.trim(),
          isGroup: true,
          completed: false,
          createdAt: new Date().toISOString(),
          tab: 'tomorrow'
        };
        
        setTomorrowTodos([...tomorrowTodos, newGroup]);
        
        // Auto-expand the new group
        setExpandedGroups(prev => ({
          ...prev,
          [newGroup.id]: true
        }));
        
        setNewGroupName('');
        showSuccess('Group added');
        
        // Keep focus on input
        setTimeout(() => {
          if (groupInputRef.current) {
            groupInputRef.current.focus();
          }
        }, 50);
      }
    }
  };

  // Handle submit editing
  const handleSubmitEditing = () => {
    handleAddItem();
  };

  // Toggle group expansion
  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Move todo functions
  const moveTodoToToday = (todo) => {
    // Remove from tomorrow
    setTomorrowTodos(tomorrowTodos.filter(item => item.id !== todo.id));
    // Add to today
    setTodos([...todos, {...todo, tab: 'today'}]);
    showSuccess('Item moved to Today');
  };

  const moveTodoToLater = (todo) => {
    // Remove from tomorrow
    setTomorrowTodos(tomorrowTodos.filter(item => item.id !== todo.id));
    // Add to later
    setLaterTodos([...laterTodos, {...todo, tab: 'later'}]);
    showSuccess('Item moved to Later');
  };

  // Show todo options
  const showTodoOptions = (todo) => {
    // For now, just show success - can implement full options later
    showSuccess(`Options for: ${todo.title}`);
  };

  // Render todo item
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
          todos={tomorrowTodos}
          isExpanded={expandedGroups[item.id] === true}
          onToggle={(id) => toggleTodo(id || item.id, 'tomorrow')}
          onDelete={(id) => deleteTodo(id, 'tomorrow')}
          onToggleExpansion={() => toggleGroupExpansion(item.id)}
          onLongPress={showTodoOptions}
          theme={theme}
          showSuccess={showSuccess}
          addTodo={addTodo}
          activeTab="tomorrow"
          canAddMoreTodos={canAddMoreTodos}
          showFeatureLimitBanner={showFeatureLimitBanner}
        />
      );
    }
    
    // For regular todo items that don't belong to a group
    if (!item.groupId) {
      return (
        <TodoItem
          key={item.id}
          item={item}
          onToggle={() => toggleTodo(item.id, 'tomorrow')}
          onDelete={() => deleteTodo(item.id, 'tomorrow')}
          onLongPress={showTodoOptions}
          theme={theme}
          fillCheckbox={true}
        />
      );
    }
    
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Input Section */}
      <View style={styles.inputSection}>
        <View style={[
          sharedStyles.inputContainer, 
          { 
            backgroundColor: theme.card, 
            borderColor: theme.border 
          }
        ]}>
          {/* Toggle Button */}
          <TouchableOpacity 
            style={sharedStyles.inputIcon}
            onPress={toggleInputMode}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name={inputMode === 'todo' ? "checkbox-outline" : "folder-outline"} 
              size={22} 
              color={theme.primary} 
            />
          </TouchableOpacity>
          
          {/* Input Field */}
          {inputMode === 'todo' ? (
            <TextInput
              ref={todoInputRef}
              style={[sharedStyles.input, { color: theme.text }]}
              placeholder="Add a to-do for tomorrow..."
              placeholderTextColor={theme.textSecondary}
              value={newTomorrowTodoText}
              onChangeText={setNewTomorrowTodoText}
              onSubmitEditing={handleSubmitEditing}
              returnKeyType="done"
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
              blurOnSubmit={false} // Keep keyboard open
            />
          ) : (
            <TextInput
              ref={groupInputRef}
              style={[sharedStyles.input, { color: theme.text }]}
              placeholder="Create a new group..."
              placeholderTextColor={theme.textSecondary}
              value={newGroupName}
              onChangeText={setNewGroupName}
              onSubmitEditing={handleSubmitEditing}
              returnKeyType="done"
              autoCorrect={false}
              autoCapitalize="none"
              spellCheck={false}
              blurOnSubmit={false} // Keep keyboard open
            />
          )}
          
          {/* Add Button */}
          <TouchableOpacity
            style={[sharedStyles.addTextButton, { backgroundColor: theme.primary }]}
            onPress={handleAddItem}
            activeOpacity={0.7}
          >
            <Text style={sharedStyles.addTextButtonText}>
              {inputMode === 'todo' ? 'Add' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Mode Indicator */}
        <View style={styles.modeIndicator}>
          <Text style={[styles.modeText, { color: theme.textSecondary }]}>
            {inputMode === 'todo' ? 'Adding to-do items' : 'Creating a group'} 
            {' • '}
            <Text 
              onPress={toggleInputMode} 
              style={{ color: theme.primary }}
            >
              Tap icon to switch
            </Text>
          </Text>
        </View>
      </View>
      
      {/* Todo List - Wrapped with TouchableWithoutFeedback to dismiss keyboard */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView 
            style={sharedStyles.todoList}
            keyboardShouldPersistTaps="handled"
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 100,
            }}
            contentContainerStyle={styles.scrollContent}
          >
            {topLevelItems.length > 0 ? (
              sortItemsByPriority(tomorrowTodos).map(renderTodoItem)
            ) : (
              <View style={styles.emptyStateContainer}>
                <EmptyState
                  title="Plan for Tomorrow"
                  message="Stay ahead by planning tomorrow's tasks today. Use numbers like '1. Priority Task' or '2.1 Subtask' to order them."
                  icon="calendar"
                  iconColor={theme.primary}
                  theme={theme}
                  illustration={<EmptyTodoIllustration theme={theme} />}
                />
              </View>
            )}
            
            {/* Bottom padding */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
      
      {/* Bottom Action Buttons */}
      <TodoButtonOverlay
        activeTab="tomorrow"
        todos={todos}
        setTodos={setTodos}
        tomorrowTodos={tomorrowTodos}
        setTomorrowTodos={setTomorrowTodos}
        laterTodos={laterTodos}
        setLaterTodos={setLaterTodos}
        isAddingSubtask={false}
        moveTomorrowTodosToToday={() => {
          // Move all tomorrow todos to today
          const newTodayTodos = [...todos, ...tomorrowTodos.map(todo => ({...todo, tab: 'today'}))];
          setTodos(newTodayTodos);
          setTomorrowTodos([]);
          showSuccess(`${tomorrowTodos.length} items moved to Today`);
        }}
        theme={theme}
        showSuccess={showSuccess}
        canAddMoreTodos={canAddMoreTodos}
        showFeatureLimitBanner={showFeatureLimitBanner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.m,
  },
  inputSection: {
    marginBottom: spacing.m,
  },
  modeIndicator: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: spacing.s, 
    marginTop: -spacing.xs,
    paddingHorizontal: spacing.xs 
  },
  modeText: {
    fontSize: scaleFontSize(12),
    fontStyle: 'italic',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: scaleHeight(140),
    minHeight: scaleHeight(300),
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: scaleHeight(40),
    paddingHorizontal: spacing.m,
    height: scaleHeight(400),
  },
  bottomPadding: {
    height: scaleHeight(120),
  },
});

export default React.memo(SimpleTomorrowTab);