// src/screens/TodoListScreen/components/TodoInputComponent.js
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  Animated,
  InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * StableInput - A completely isolated input component that won't cause parent re-renders
 * This is key to preventing keyboard flashing
 */
const StableInput = memo(({
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
      blurOnSubmit={false} // Critical to prevent keyboard flashing
      keyboardType="default"
    />
  );
}, () => true); // Always prevent re-renders from parent

/**
 * A compact, space-efficient component for adding todos or groups
 * Completely rewritten to prevent keyboard flashing and handle empty inputs properly
 */
const TodoInputComponent = memo(({
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
  const [inputMode, setInputMode] = useState('todo'); // 'todo' or 'group'
  
  // State to track local input focus
  const [isLocalInputFocused, setIsLocalInputFocused] = useState(false);
  
  // Animation values for smooth transitions
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const labelWidth = useRef(new Animated.Value(0)).current;
  
  // Input refs for focusing and accessing stable input data
  const todoInputRef = useRef(null);
  const groupInputRef = useRef(null);
  
  // Indicator animation - avoid re-renders during tab switching
  const animateLabel = useCallback(() => {
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
    
    return timer;
  }, [inputMode, labelOpacity, labelWidth]);
  
  // Handle showing/hiding mode label
  useEffect(() => {
    const animationTimer = animateLabel();
    
    // Only try to focus if we're not in the middle of a tab switch
    if (!isTabSwitching) {
      // Focus the appropriate input after switching modes
      // Using a longer timeout to avoid keyboard flickering
      const focusTimer = setTimeout(() => {
        if (inputMode === 'todo' && todoInputRef.current) {
          todoInputRef.current.focus();
          setIsLocalInputFocused(true);
          if (updateInputFocus) updateInputFocus(true);
        } else if (inputMode === 'group' && groupInputRef.current) {
          groupInputRef.current.focus();
          setIsLocalInputFocused(true);
          if (updateInputFocus) updateInputFocus(true);
        }
      }, 300);
      
      return () => {
        clearTimeout(animationTimer);
        clearTimeout(focusTimer);
      };
    }
    
    return () => clearTimeout(animationTimer);
  }, [inputMode, isTabSwitching, animateLabel, updateInputFocus]);
  
  // Calculate placeholder text based on tab name
  const getPlaceholderText = useCallback(() => {
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
  }, [inputMode, tabName]);
  
  // Modified handleAddItem to fix keyboard issues
  const handleAddItem = useCallback(() => {
    // Get the current input text from the ref - avoids state updates
    const activeInputRef = inputMode === 'todo' ? todoInputRef : groupInputRef;
    if (!activeInputRef.current || !activeInputRef.current.getValue) return;
    
    // Get the text value from the ref
    const currentText = activeInputRef.current.getValue().trim();
    if (!currentText) return;
    
    // Clear input immediately to prevent autocorrect issues
    if (activeInputRef.current.clearText) {
      activeInputRef.current.clearText();
    }
    
    // Use InteractionManager to defer UI updates
    InteractionManager.runAfterInteractions(() => {
      if (inputMode === 'todo') {
        // Add the todo using the stored value
        onAddTodo(tabName, null, currentText);
      } else {
        // Add the group using the stored value
        onAddGroup(tabName, currentText);
      }
      
      // Keep focus on the input field (prevents keyboard hiding)
      if (activeInputRef.current) {
        setTimeout(() => {
          if (activeInputRef.current) {
            activeInputRef.current.focus();
          }
        }, 50);
      }
    });
  }, [inputMode, tabName, onAddTodo, onAddGroup]);
  
  // Handle input submission
  const handleSubmitEditing = useCallback((text) => {
    if (text && text.trim()) {
      handleAddItem();
    }
    // If empty, do nothing - prevents keyboard flashing
  }, [handleAddItem]);
  
  // Handle mode toggle with animation
  const toggleInputMode = useCallback(() => {
    // Dismiss keyboard first to prevent flashing
    Keyboard.dismiss();
    
    // Wait briefly for keyboard to dismiss
    setTimeout(() => {
      setInputMode(prev => prev === 'todo' ? 'group' : 'todo');
      
      // Reset animations to show label again
      labelOpacity.setValue(0);
      labelWidth.setValue(0);
    }, 50);
  }, [labelOpacity, labelWidth]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsLocalInputFocused(true);
    if (updateInputFocus) updateInputFocus(true);
  }, [updateInputFocus]);
  
  // Handle input blur
  const handleInputBlur = useCallback(() => {
    // Small delay to check if the other input gets focus
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
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={inputMode === 'todo' ? "Switch to group mode" : "Switch to todo mode"}
          accessibilityHint="Toggles between adding todos and groups"
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
        
        {/* Dynamic input field based on mode - Using StableInput component */}
        {inputMode === 'todo' ? (
          <StableInput
            inputRef={todoInputRef}
            placeholder={getPlaceholderText()}
            placeholderTextColor={theme.textSecondary}
            textColor={theme.text}
            initialValue={todoText}
            onChangeText={(text) => {
              // We only update parent state when component unmounts or submit
              // This is critical for preventing keyboard flashing
            }}
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
            onChangeText={(text) => {
              // We only update parent state when component unmounts or submit
              // This is critical for preventing keyboard flashing
            }}
            onSubmitEditing={handleSubmitEditing}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
        )}
        
        {/* Add/Create Button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            { backgroundColor: theme.primary }
          ]}
          onPress={handleAddItem}
          activeOpacity={0.7}
        >
          <Text style={styles.addButtonText}>
            {inputMode === 'todo' ? 'Add' : 'Create'}
          </Text>
        </TouchableOpacity>
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
});

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

export default TodoInputComponent;