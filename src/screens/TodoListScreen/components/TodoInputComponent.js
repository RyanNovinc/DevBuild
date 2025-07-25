// src/screens/TodoListScreen/components/TodoInputComponent.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FloatingButton from './FloatingButton';

const { width } = Dimensions.get('window');

/**
 * A reusable component for adding todos or groups with an intuitive mode selector
 * This replaces the current input toggle in the tab files
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
  
  // Animation value for smooth transitions
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  // Input refs for focusing
  const todoInputRef = useRef(null);
  const groupInputRef = useRef(null);
  
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
      return 'Create a new group...';
    }
  };
  
  // Animate when input mode changes
  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: inputMode === 'todo' ? 0 : 1,
      tension: 80,
      friction: 8,
      useNativeDriver: false
    }).start();
    
    // Focus the appropriate input after switching modes
    setTimeout(() => {
      if (inputMode === 'todo' && todoInputRef.current) {
        todoInputRef.current.focus();
      } else if (inputMode === 'group' && groupInputRef.current) {
        groupInputRef.current.focus();
      }
    }, 100);
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
  
  // Calculate background color for mode options
  const getButtonBackgroundColor = (mode) => {
    if (mode === inputMode) {
      return theme.primary;
    }
    return 'transparent';
  };
  
  // Calculate text color for mode options
  const getTextColor = (mode) => {
    if (mode === inputMode) {
      return '#FFFFFF';
    }
    return theme.text;
  };
  
  // Get dynamic styles based on theme
  const dynamicStyles = {
    modeSelector: {
      backgroundColor: theme.cardElevated || '#2C2C2E',
      borderColor: theme.border
    },
    inputContainer: {
      backgroundColor: theme.card,
      borderColor: theme.border
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Mode selector - intuitive with labels and icons */}
      <View style={[styles.modeSelector, dynamicStyles.modeSelector]}>
        <TouchableOpacity 
          style={[
            styles.modeOption, 
            { backgroundColor: getButtonBackgroundColor('todo') }
          ]}
          onPress={() => setInputMode('todo')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="checkbox-outline" 
            size={18} 
            color={getTextColor('todo')} 
          />
          <Text style={[
            styles.modeOptionText, 
            { 
              color: getTextColor('todo'),
              fontWeight: inputMode === 'todo' ? '600' : '400'
            }
          ]}>
            Todo
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.modeOption, 
            { backgroundColor: getButtonBackgroundColor('group') }
          ]}
          onPress={() => setInputMode('group')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="folder-outline" 
            size={18} 
            color={getTextColor('group')} 
          />
          <Text style={[
            styles.modeOptionText, 
            { 
              color: getTextColor('group'),
              fontWeight: inputMode === 'group' ? '600' : '400'
            }
          ]}>
            Group
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Input field with clear visual for the active mode */}
      <View style={[styles.inputContainer, dynamicStyles.inputContainer]}>
        <Ionicons 
          name={inputMode === 'todo' ? "checkbox-outline" : "folder-outline"} 
          size={22} 
          color={theme.primary} 
          style={styles.inputIcon}
        />
        
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
  modeSelector: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 10,
    padding: 4,
    alignSelf: 'center',
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 100,
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  modeOptionText: {
    marginLeft: 6, 
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 15,
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
  inputIcon: {
    marginRight: 10,
    padding: 2,
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