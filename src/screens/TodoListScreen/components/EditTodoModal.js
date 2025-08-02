// src/screens/TodoListScreen/components/EditTodoModal.js
import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  Animated,
  Keyboard,
  InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getContrastText } from '../TodoUtils';
import { styles } from '../TodoListStyles';

/**
 * Modal for editing todo items
 * Optimized to prevent keyboard flashing and handle animations properly
 */
const EditTodoModal = ({ 
  editingTodo, 
  editText, 
  setEditText, 
  isEditing, 
  theme, 
  showSuccess,
  saveEditedTodo,
  cancelEditing 
}) => {
  // Local state for input to prevent parent re-renders
  const [localEditText, setLocalEditText] = useState(editText);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Ref for TextInput
  const editInputRef = useRef(null);
  
  // Check if theme is dark mode
  const isDarkMode = theme.background === '#000000' || theme.background.toLowerCase() === '#121212';
  
  // Update local state when editText changes
  useEffect(() => {
    setLocalEditText(editText);
  }, [editText]);
  
  // Focus input when modal opens and animate the modal
  useEffect(() => {
    if (isEditing) {
      // Start entry animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true
        })
      ]).start();
      
      // Focus input after animation completes
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          if (editInputRef.current) {
            editInputRef.current.focus();
          }
        }, 100);
      });
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [isEditing, fadeAnim, scaleAnim]);
  
  // Handle text change
  const handleTextChange = (text) => {
    setLocalEditText(text);
    setEditText(text); // Update parent state
  };
  
  // Handle save with animation
  const handleSave = () => {
    if (!localEditText.trim()) {
      showSuccess('Todo text cannot be empty', { type: 'warning' });
      return;
    }
    
    // Prepare exit animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true
      })
    ]).start(() => {
      // Dismiss keyboard first to prevent flashing
      Keyboard.dismiss();
      
      // Use InteractionManager to ensure smooth transition
      InteractionManager.runAfterInteractions(() => {
        saveEditedTodo();
      });
    });
  };
  
  // Handle cancel with animation
  const handleCancel = () => {
    // Prepare exit animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true
      })
    ]).start(() => {
      // Dismiss keyboard first to prevent flashing
      Keyboard.dismiss();
      
      // Use InteractionManager to ensure smooth transition
      InteractionManager.runAfterInteractions(() => {
        cancelEditing();
      });
    });
  };
  
  return (
    <View style={localStyles.modalOverlay}>
      <Animated.View 
        style={[
          localStyles.modalContainer,
          { 
            backgroundColor: theme.card,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Text style={[localStyles.modalTitle, { color: theme.text }]}>
          {editingTodo?.isGroup ? 'Edit Group' : 'Edit To-do'}
        </Text>
        
        <TextInput
          ref={editInputRef}
          style={[
            localStyles.editInput, 
            { 
              color: theme.text, 
              backgroundColor: theme.background, 
              borderColor: theme.border 
            }
          ]}
          value={localEditText}
          onChangeText={handleTextChange}
          placeholder="Enter to-do text (e.g., '1. High priority' or '2.1 Subtask')"
          placeholderTextColor={theme.textSecondary}
          multiline
          returnKeyType="done"
          onSubmitEditing={handleSave}
          blurOnSubmit={false}
          autoCorrect={false}
          spellCheck={false}
        />
        
        <View style={localStyles.modalActions}>
          <TouchableOpacity 
            style={[localStyles.modalButton, { borderColor: theme.border }]}
            onPress={handleCancel}
          >
            <Text style={[localStyles.buttonText, { color: theme.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[localStyles.modalButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <Text style={[localStyles.buttonTextLight, { color: getContrastText(theme.primary, isDarkMode, theme) }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

// Local styles with better animations and transitions
const localStyles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 15,
  },
  buttonTextLight: {
    fontWeight: '600',
    fontSize: 15,
  }
});

export default React.memo(EditTodoModal);