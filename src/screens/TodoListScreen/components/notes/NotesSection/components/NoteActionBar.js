// src/screens/TodoListScreen/components/NotesSection/components/NoteActionBar.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../TodoListStyles';
import { getContrastText } from '../../../TodoUtils';

/**
 * Component for Add Note and Clear All Notes buttons
 */
const NoteActionBar = ({
  createNewNote,
  clearAllNotes,
  filteredNotes,
  activeTagFilter,
  isSearchActive,
  searchQuery,
  theme,
  isDarkMode
}) => {
  return (
    <View style={styles.noteActionsContainer}>
      <TouchableOpacity
        style={[styles.addNoteButton, { backgroundColor: theme.primary }]}
        onPress={createNewNote}
      >
        <Ionicons name="add" size={20} color={getContrastText(theme.primary, isDarkMode, theme)} />
        <Text style={[styles.addNoteButtonText, { color: getContrastText(theme.primary, isDarkMode, theme) }]}>
          {activeTagFilter && activeTagFilter !== 'NO_TAGS' ? `Add Note with #${activeTagFilter}` : 'Add Note'}
        </Text>
      </TouchableOpacity>
      
      {filteredNotes.length > 0 && (
        <TouchableOpacity
          style={[styles.clearAllNotesButton, { backgroundColor: theme.cardElevated }]}
          onPress={clearAllNotes}
        >
          <Ionicons name="trash-outline" size={18} color={theme.error || '#FF3B30'} />
          <Text style={[styles.clearAllNotesText, { color: theme.error || '#FF3B30' }]}>
            {activeTagFilter || (isSearchActive && searchQuery.trim()) ? `Clear ${filteredNotes.length}` : 'Clear All'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(NoteActionBar);