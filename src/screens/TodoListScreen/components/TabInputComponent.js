// src/screens/TodoListScreen/components/TabInputComponent.js
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Keyboard,
  StyleSheet,
  Dimensions,
  InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import StableInput to prevent keyboard flashing
import StableInput from './StableInput';

const { width } = Dimensions.get('window');

/**
 * A reusable component for adding todos or groups with a tab-based interface
 * Optimized to fix keyboard flashing issues and handle empty inputs properly
 */
const TabInputComponent = memo(({
  theme,
  todoText,
  setTodoText,
  groupText,
  setGroupText,
  onAddTodo,
  onAddGroup,
  tabName = 'today', // 'today', 'tomorrow', or 'later'
  updateInputFocus = null, // Prop to track input focus
  isTabSwitching = false // Prop to prevent UI updates during tab switching
}) => {
  // State for tracking which input mode is active
  const [activeTab, setActiveTab] = useState('todo'); // 'todo' or 'group'
  
  // State to track local input focus
  const [isLocalInputFocused, setIsLocalInputFocused] = useState(false);
  
  // Animation value for the tab indicator
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  
  // Input refs for focusing and data access
  const todoInputRef = useRef(null);
  const groupInputRef = useRef(null);
  
  // Memoized placeholder text based on tab name
  const getPlaceholderText = useCallback(() => {
    if (activeTab === 'todo') {
      switch (tabName) {
        case 'today':
          return 'Add a new to-do...';
        case 'tomorrow':
          return 'Add a to-do for tomorrow...';
        case 'later':
          return 'Add a to-do for later...';
        default:
          return 'Add a new to-do...';
      }
    } else {
      return 'Create a new group...';
    }
  }, [activeTab, tabName]);
  
  // Animate tab indicator when active tab changes
  useEffect(() => {
    Animated.spring(tabIndicatorPosition, {
      toValue: activeTab === 'todo' ? 0 : width / 2 - 2, // Account for margins
      tension: 100,
      friction: 10,
      useNativeDriver: false
    }).start();
    
    // Only try to focus if we're not in the middle of a tab switch
    if (!isTabSwitching) {
      // Focus the appropriate input after switching tabs
      // Using a longer timeout to avoid keyboard flickering
      const focusTimer = setTimeout(() => {
        if (activeTab === 'todo' && todoInputRef.current) {
          todoInputRef.current.focus();
          setIsLocalInputFocused(true);
          if (updateInputFocus) updateInputFocus(true);
        } else if (activeTab === 'group' && groupInputRef.current) {
          groupInputRef.current.focus();
          setIsLocalInputFocused(true);
          if (updateInputFocus) updateInputFocus(true);
        }
      }, 300);
      
      return () => {
        clearTimeout(focusTimer);
      };
    }
  }, [activeTab, isTabSwitching, updateInputFocus, tabIndicatorPosition]);
  
  // Handle adding item with optimized keyboard handling
  const handleAddItem = useCallback(() => {
    // Get active input ref
    const activeInputRef = activeTab === 'todo' ? todoInputRef : groupInputRef;
    
    // Get text from ref - prevents state updates during keyboard handling
    let currentText = '';
    if (activeInputRef.current && activeInputRef.current.getValue) {
      currentText = activeInputRef.current.getValue().trim();
    }
    
    if (!currentText) return;
    
    // Clear input field immediately to prevent autocorrect issues
    if (activeInputRef.current && activeInputRef.current.clearText) {
      activeInputRef.current.clearText();
    }
    
    // Use InteractionManager to defer the state update
    InteractionManager.runAfterInteractions(() => {
      if (activeTab === 'todo') {
        // Add the todo with the stored value
        onAddTodo(tabName, null, currentText);
      } else {
        // Add the group with the stored value
        onAddGroup(tabName, currentText);
      }
      
      // Re-focus the input to keep keyboard open
      setTimeout(() => {
        if (activeInputRef.current) {
          activeInputRef.current.focus();
        }
      }, 50);
    });
  }, [activeTab, tabName, onAddTodo, onAddGroup]);
  
  // Handle input submission - pass text from StableInput
  const handleSubmitEditing = useCallback((text) => {
    if (text && text.trim()) {
      handleAddItem();
    }
    // If empty, do nothing to prevent keyboard flashing
  }, [handleAddItem]);
  
  // Handle tab switch with improved keyboard handling
  const handleTabSwitch = useCallback((tab) => {
    if (tab === activeTab) return;
    
    // Dismiss keyboard first to prevent flashing
    Keyboard.dismiss();
    
    // Short delay before changing tab
    setTimeout(() => {
      setActiveTab(tab);
    }, 50);
  }, [activeTab]);
  
  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsLocalInputFocused(true);
    if (updateInputFocus) updateInputFocus(true);
  }, [updateInputFocus]);
  
  // Handle input blur
  const handleInputBlur = useCallback(() => {
    // Short delay to check if the other input gets focus
    setTimeout(() => {
      const isTodoFocused = todoInputRef.current?.isFocused?.();
      const isGroupFocused = groupInputRef.current?.isFocused?.();
      
      if (!isTodoFocused && !isGroupFocused) {
        setIsLocalInputFocused(false);
        if (updateInputFocus) updateInputFocus(false);
      }
    }, 50);
  }, [updateInputFocus]);
  
  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={[styles.tabsContainer, { borderBottomColor: theme.border }]}>
        {/* Animated Tab Indicator */}
        <Animated.View 
          style={[
            styles.tabIndicator, 
            { 
              backgroundColor: theme.primary,
              left: tabIndicatorPosition
            }
          ]} 
        />
        
        {/* Todo Tab */}
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => handleTabSwitch('todo')}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="Add todo tab"
          accessibilityState={{ selected: activeTab === 'todo' }}
        >
          <Ionicons 
            name="checkbox-outline" 
            size={18} 
            color={activeTab === 'todo' ? theme.primary : theme.textSecondary} 
          />
          <Text 
            style={[
              styles.tabText, 
              { 
                color: activeTab === 'todo' ? theme.primary : theme.textSecondary,
                fontWeight: activeTab === 'todo' ? '600' : '400' 
              }
            ]}
          >
            Add Todo
          </Text>
        </TouchableOpacity>
        
        {/* Group Tab */}
        <TouchableOpacity 
          style={styles.tab}
          onPress={() => handleTabSwitch('group')}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="tab"
          accessibilityLabel="Add group tab"
          accessibilityState={{ selected: activeTab === 'group' }}
        >
          <Ionicons 
            name="folder-outline" 
            size={18} 
            color={activeTab === 'group' ? theme.primary : theme.textSecondary} 
          />
          <Text 
            style={[
              styles.tabText, 
              { 
                color: activeTab === 'group' ? theme.primary : theme.textSecondary,
                fontWeight: activeTab === 'group' ? '600' : '400' 
              }
            ]}
          >
            Add Group
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Input Container */}
      <View style={[
        styles.inputContainer, 
        { backgroundColor: theme.card, borderColor: theme.border }
      ]}>
        {/* Icon based on active tab */}
        <Ionicons 
          name={activeTab === 'todo' ? "checkbox-outline" : "folder-outline"} 
          size={22} 
          color={theme.primary} 
          style={styles.inputIcon}
        />
        
        {/* Dynamic Input Field - Using StableInput to prevent keyboard flashing */}
        {activeTab === 'todo' ? (
          <StableInput
            inputRef={todoInputRef}
            placeholder={getPlaceholderText()}
            placeholderTextColor={theme.textSecondary}
            textColor={theme.text}
            initialValue={todoText}
            onSubmitEditing={handleSubmitEditing}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        ) : (
          <StableInput
            inputRef={groupInputRef}
            placeholder={getPlaceholderText()}
            placeholderTextColor={theme.textSecondary}
            textColor={theme.text}
            initialValue={groupText}
            onSubmitEditing={handleSubmitEditing}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        )}
        
        {/* Add Button */}
        <TouchableOpacity
          style={[
            styles.addButton, 
            { backgroundColor: theme.primary }
          ]}
          onPress={handleAddItem}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={activeTab === 'todo' ? "Add to-do" : "Create group"}
        >
          <Text style={styles.addButtonText}>
            {activeTab === 'todo' ? 'Add' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Helper Text */}
      <Text style={[styles.helperText, { color: theme.textSecondary }]}>
        {activeTab === 'todo' 
          ? 'Tip: Use numbers like "1. High Priority" for better organization' 
          : 'Groups help organize related tasks together'}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 12,
    position: 'relative',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    minHeight: 44, // Ensure minimum height for touch target
  },
  tabText: {
    fontSize: 14,
    marginLeft: 6,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: '50%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    height: 56,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 8,
    padding: 2,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    minHeight: 36, // Ensure minimum height for touch target
  },
  addButtonText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 4,
  }
});

export default TabInputComponent;