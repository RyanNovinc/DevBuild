// src/screens/TodoListScreen/components/TodoInputComponent.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FloatingButton from './FloatingButton';

/**
 * A compact, space-efficient component for adding todos or groups
 * This takes up the same vertical space as the original input
 */
const TodoInputComponent = ({
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
  const [inputMode, setInputMode] = useState('todo'); // 'todo' or 'group'
  
  // Input refs for focusing
  const todoInputRef = useRef(null);
  const groupInputRef = useRef(null);
  
  // Animation values for smooth transitions
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const labelWidth = useRef(new Animated.Value(0)).current;
  
  // Calculate placeholder text based on tab name
  const getPlaceholderText = () => {
    if (inputMode === 'todo') {
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
      return 'Create a new group (e.g., "1. Work Tasks")...';
    }
  };
  
  // Handle showing/hiding mode label
  useEffect(() => {
    // When mode changes, animate in the label
    Animated.parallel([
      Animated.timing(labelOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false
      }),
      Animated.timing(labelWidth, {
        toValue: inputMode === 'todo' ? 50 : 60,
        duration: 200,
        useNativeDriver: false
      })
    ]).start();
    
    // Hide the label after 2 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(labelOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false
        }),
        Animated.timing(labelWidth, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false
        })
      ]).start();
    }, 2000);
    
    // Focus the appropriate input after switching modes
    setTimeout(() => {
      if (inputMode === 'todo' && todoInputRef.current) {
        todoInputRef.current.focus();
      } else if (inputMode === 'group' && groupInputRef.current) {
        groupInputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [inputMode]);
  
  // Handle adding an item based on the active mode
  const handleAddItem = () => {
    if (inputMode === 'todo') {
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
  
  // Handle mode toggle with animation
  const toggleInputMode = () => {
    setInputMode(prev => prev === 'todo' ? 'group' : 'todo');
    
    // Reset animations to show label again
    labelOpacity.setValue(0);
    labelWidth.setValue(0);
  };
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.inputContainer, 
        { 
          backgroundColor: theme.card, 
          borderColor: theme.border,
          borderLeftColor: inputMode === 'todo' ? theme.primary : theme.primary + '80',
          borderLeftWidth: 3,
        }
      ]}>
        {/* Segmented Toggle Button */}
        <TouchableOpacity 
          style={styles.modeToggle}
          onPress={toggleInputMode}
          hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
        >
          <View style={[
            styles.iconContainer,
            {
              backgroundColor: inputMode === 'todo' ? theme.primary : 'transparent',
              borderColor: theme.border
            }
          ]}>
            <Ionicons 
              name={inputMode === 'todo' ? "checkbox-outline" : "folder-outline"} 
              size={20} 
              color={inputMode === 'todo' ? '#FFFFFF' : theme.primary} 
            />
          </View>
          
          {/* Animated Mode Label - appears briefly after toggle */}
          <Animated.View style={[
            styles.modeLabel,
            {
              backgroundColor: theme.cardElevated,
              opacity: labelOpacity,
              width: labelWidth,
              borderColor: theme.border
            }
          ]}>
            <Text style={{ 
              color: theme.text, 
              fontSize: 12,
              fontWeight: '600'
            }}>
              {inputMode === 'todo' ? 'Todo' : 'Group'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
        
        {/* Dynamic input field based on mode */}
        {inputMode === 'todo' ? (
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
        
        {/* Add/Create Button */}
        <FloatingButton
          label={inputMode === 'todo' ? "Add" : "Create"}
          onPress={handleAddItem}
          theme={theme}
          isPrimary={true}
          withBackground={true}
          style={{ marginLeft: 5 }}
        />
      </View>
      
      {/* Helper text changes based on mode */}
      <Text style={[styles.helperText, { color: theme.textSecondary }]}>
        {inputMode === 'todo' 
          ? 'Tip: Use numbers like "1. High Priority" for better organization' 
          : 'Groups help organize related tasks together'
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    height: 58,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    position: 'relative',
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 8,
  },
  modeLabel: {
    position: 'absolute',
    top: -24,
    left: 0,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    zIndex: 5,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingVertical: 10,
  },
  helperText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    marginLeft: 4,
  }
});

export default TodoInputComponent;