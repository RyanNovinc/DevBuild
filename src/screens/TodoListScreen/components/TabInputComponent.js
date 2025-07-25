// src/screens/TodoListScreen/components/TabInputComponent.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * A reusable component for adding todos or groups with a tab-based interface
 * This replaces the current input toggle in the tab files
 */
const TabInputComponent = ({
  theme,
  todoText,
  setTodoText,
  groupText,
  setGroupText,
  onAddTodo,
  onAddGroup,
  tabName = 'today' // 'today', 'tomorrow', or 'later'
}) => {
  // State for tracking which input mode is active
  const [activeTab, setActiveTab] = useState('todo'); // 'todo' or 'group'
  
  // Animation value for the tab indicator
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  
  // Input refs for focusing
  const todoInputRef = useRef(null);
  const groupInputRef = useRef(null);
  
  // Calculate placeholder text based on tab name
  const getPlaceholderText = () => {
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
  };
  
  // Animate tab indicator when active tab changes
  useEffect(() => {
    Animated.spring(tabIndicatorPosition, {
      toValue: activeTab === 'todo' ? 0 : width / 2 - 2, // Account for margins
      tension: 100,
      friction: 10,
      useNativeDriver: false
    }).start();
    
    // Focus the appropriate input after switching tabs
    setTimeout(() => {
      if (activeTab === 'todo' && todoInputRef.current) {
        todoInputRef.current.focus();
      } else if (activeTab === 'group' && groupInputRef.current) {
        groupInputRef.current.focus();
      }
    }, 100);
  }, [activeTab]);
  
  // Handle adding an item based on the active tab
  const handleAddItem = () => {
    if (activeTab === 'todo') {
      if (todoText.trim()) {
        // Store the current value before clearing
        const text = todoText.trim();
        
        // Clear input immediately to prevent autocorrect issues
        setTodoText('');
        
        // Add the todo
        onAddTodo(tabName, null, text);
      }
    } else {
      if (groupText.trim()) {
        // Store the current value before clearing
        const text = groupText.trim();
        
        // Clear input immediately to prevent autocorrect issues
        setGroupText('');
        
        // Add the group
        onAddGroup(tabName, text);
      }
    }
    
    // Dismiss keyboard
    Keyboard.dismiss();
  };
  
  // Handle input submission
  const handleSubmitEditing = () => {
    handleAddItem();
  };
  
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
          onPress={() => setActiveTab('todo')}
          activeOpacity={0.7}
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
          onPress={() => setActiveTab('group')}
          activeOpacity={0.7}
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
      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {/* Icon based on active tab */}
        <Ionicons 
          name={activeTab === 'todo' ? "checkbox-outline" : "folder-outline"} 
          size={22} 
          color={theme.primary} 
          style={styles.inputIcon}
        />
        
        {/* Dynamic Input Field */}
        {activeTab === 'todo' ? (
          <TextInput
            ref={todoInputRef}
            style={[styles.input, { color: theme.text }]}
            placeholder={getPlaceholderText()}
            placeholderTextColor={theme.textSecondary}
            value={todoText}
            onChangeText={setTodoText}
            onSubmitEditing={handleSubmitEditing}
            returnKeyType="done"
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
          />
        ) : (
          <TextInput
            ref={groupInputRef}
            style={[styles.input, { color: theme.text }]}
            placeholder={getPlaceholderText()}
            placeholderTextColor={theme.textSecondary}
            value={groupText}
            onChangeText={setGroupText}
            onSubmitEditing={handleSubmitEditing}
            returnKeyType="done"
            autoCorrect={false}
            autoCapitalize="none"
            spellCheck={false}
          />
        )}
        
        {/* Add Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddItem}
          activeOpacity={0.7}
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
};

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
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    paddingVertical: 8,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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