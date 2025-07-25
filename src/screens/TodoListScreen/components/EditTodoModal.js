// src/screens/TodoListScreen/components/EditTodoModal.js
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { getContrastText } from '../TodoUtils';
import { styles } from '../TodoListStyles';

/**
 * Modal for editing todo items
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
  // Ref for TextInput
  const editInputRef = useRef(null);
  
  // Check if theme is dark mode
  const isDarkMode = theme.background === '#000000';
  
  // Focus input when modal opens
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        if (editInputRef.current) {
          editInputRef.current.focus();
        }
      }, 100);
    }
  }, [isEditing]);
  
  return (
    <View style={styles.editModalOverlay}>
      <View style={[styles.editModalContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.editModalTitle, { color: theme.text }]}>
          {editingTodo?.isGroup ? 'Edit Group' : 'Edit To-do'}
        </Text>
        
        <TextInput
          ref={editInputRef}
          style={[styles.editInput, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
          value={editText}
          onChangeText={setEditText}
          placeholder="Enter to-do text (e.g., '1. High priority' or '2.1 Subtask')"
          placeholderTextColor={theme.textSecondary}
          multiline
          returnKeyType="done"
          onSubmitEditing={saveEditedTodo}
          autoFocus
        />
        
        <View style={styles.editModalActions}>
          <TouchableOpacity 
            style={[styles.editModalButton, { borderColor: theme.border }]}
            onPress={cancelEditing}
          >
            <Text style={[styles.editModalButtonText, { color: theme.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.editModalButton, { backgroundColor: theme.primary }]}
            onPress={saveEditedTodo}
          >
            <Text style={[styles.editModalButtonTextLight, { color: getContrastText(theme.primary, isDarkMode, theme) }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default React.memo(EditTodoModal);