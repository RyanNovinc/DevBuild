// src/screens/TodoListScreen/components/SubtaskInputModal.js
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
  Platform,
  InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * SubtaskInputModal - A zero-flash component for adding subtasks
 * Uses performance optimizations to prevent UI flashes when adding subtasks
 */
const SubtaskInputModal = ({
  onAddSubtask,
  onCancel,
  theme,
  groupId,
  activeTab,
  parentGroupName
}) => {
  // Local state for input - decoupled from parent for performance
  const [subtaskText, setSubtaskText] = useState('');
  
  // Animation value for shake effect
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  // Input ref for auto-focus
  const inputRef = useRef(null);
  
  // Debounce protection
  const isSubmittingRef = useRef(false);
  
  // Focus the input when component mounts with better animation timing
  useEffect(() => {
    // Use InteractionManager to ensure animations complete before focus
    InteractionManager.runAfterInteractions(() => {
      // Delay focus slightly to avoid keyboard flashing
      if (inputRef.current) {
        inputRef.current.focus();
      }
    });
    
    return () => {
      // Ensure any pending operations are cancelled
      isSubmittingRef.current = false;
    };
  }, []);
  
  // Handle shake animation for empty input
  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
        easing: Animated.Easing.linear
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
        easing: Animated.Easing.linear
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
        easing: Animated.Easing.linear
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
        easing: Animated.Easing.linear
      })
    ]).start();
  }, [shakeAnim]);
  
  // Handle submitting the subtask with improved keyboard persistence
  const handleSubmit = useCallback(() => {
    // Prevent multiple submissions
    if (isSubmittingRef.current) return;
    
    const trimmedText = subtaskText.trim();
    if (!trimmedText) {
      triggerShake();
      return;
    }
    
    // Set submitting flag
    isSubmittingRef.current = true;
    
    // Clear input immediately to prevent autocorrect issues
    setSubtaskText('');
    
    // Use InteractionManager to defer the state update that could cause re-render
    InteractionManager.runAfterInteractions(() => {
      // Add the subtask using the stored text
      onAddSubtask(activeTab, groupId, trimmedText);
      
      // Re-focus input to prevent keyboard from dismissing
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
      // Reset flag after a short delay
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 50);
    });
  }, [subtaskText, activeTab, groupId, onAddSubtask, triggerShake]);
  
  // Handle cancel - properly dismiss keyboard
  const handleCancel = useCallback(() => {
    // Dismiss keyboard first, then cancel
    Keyboard.dismiss();
    
    // Use InteractionManager for smooth transitions
    InteractionManager.runAfterInteractions(() => {
      onCancel();
    });
  }, [onCancel]);
  
  // Determine if the add button should be disabled
  const isAddButtonDisabled = !subtaskText.trim();
  
  // Optimize text change handler
  const handleTextChange = useCallback((text) => {
    setSubtaskText(text);
  }, []);
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: `${theme.primary}30`, // 30% opacity for subtle border
          transform: [{ translateX: shakeAnim }]
        }
      ]}
    >
      {/* Parent group indicator */}
      {parentGroupName && (
        <Text style={[styles.groupIndicator, { color: theme.textSecondary }]}>
          Adding to: <Text style={{ fontWeight: '600', color: theme.primary }}>{parentGroupName}</Text>
        </Text>
      )}
      
      <TextInput
        ref={inputRef}
        style={[styles.input, { color: theme.text }]}
        placeholder="Add a subtask..."
        placeholderTextColor={theme.textSecondary}
        value={subtaskText}
        onChangeText={handleTextChange}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        maxFontSizeMultiplier={1.3}
        autoCorrect={false}
        spellCheck={false}
        autoCapitalize="none"
        blurOnSubmit={false} // Critical prop to prevent keyboard dismissal
      />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          accessibilityHint="Cancel adding a subtask"
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.button, 
            styles.addButton, 
            { 
              backgroundColor: isAddButtonDisabled ? `${theme.primary}50` : theme.primary,
              opacity: isSubmittingRef.current ? 0.7 : 1, // Visual feedback
            }
          ]}
          onPress={handleSubmit}
          disabled={isAddButtonDisabled || isSubmittingRef.current}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Add subtask"
          accessibilityHint="Add the new subtask"
          accessibilityState={{ disabled: isAddButtonDisabled }}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 30, // Match the indent from TodoGroup
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  groupIndicator: {
    fontSize: 12,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  input: {
    fontSize: 16,
    padding: 8,
    minHeight: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8, // Space between buttons
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 36,
    minWidth: 70,
  },
  cancelButton: {
    // No background color for cancel button
  },
  addButton: {
    // Background color is set dynamically based on disabled state
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  }
});

// Use memo to prevent unnecessary re-renders
export default memo(SubtaskInputModal);