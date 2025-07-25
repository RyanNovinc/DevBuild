// src/screens/TodoListScreen/components/notes/AddFolderInput.js
import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { styles } from '../../TodoListStyles';
import { getContrastText, generateRandomPastelColor } from '../../TodoUtils';

/**
 * Component for adding a new note folder
 */
const AddFolderInput = ({
  newFolderName,
  setNewFolderName,
  setIsAddingFolder,
  noteFolders,
  setNoteFolders,
  setActiveNoteFolder,
  theme,
  showSuccess
}) => {
  // Check if theme is dark mode
  const isDarkMode = theme.background === '#000000';
  
  // Add a new note folder
  const addNoteFolder = () => {
    if (!newFolderName.trim()) {
      showSuccess('Folder name cannot be empty', { type: 'warning' });
      return;
    }
    
    const newFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      createdAt: new Date().toISOString(),
      color: generateRandomPastelColor() // Generate a random pastel color for the folder
    };
    
    setNoteFolders([...noteFolders, newFolder]);
    setNewFolderName('');
    setIsAddingFolder(false);
    setActiveNoteFolder(newFolder.id); // Automatically select the new folder
    showSuccess('Folder created');
  };

  // Cancel adding folder
  const cancelAddingFolder = () => {
    setIsAddingFolder(false);
    setNewFolderName('');
  };

  return (
    <View style={[styles.addFolderInputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <TextInput
        style={[styles.addFolderInput, { color: theme.text }]}
        placeholder="Enter folder name..."
        placeholderTextColor={theme.textSecondary}
        value={newFolderName}
        onChangeText={setNewFolderName}
        autoFocus
      />
      <View style={styles.addFolderActions}>
        <TouchableOpacity
          style={[styles.addFolderCancel, { borderColor: theme.border }]}
          onPress={cancelAddingFolder}
        >
          <Text style={[styles.addFolderCancelText, { color: theme.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addFolderConfirm, { backgroundColor: theme.primary }]}
          onPress={addNoteFolder}
        >
          <Text style={[styles.addFolderConfirmText, { color: getContrastText(theme.primary, isDarkMode, theme) }]}>Create</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(AddFolderInput);