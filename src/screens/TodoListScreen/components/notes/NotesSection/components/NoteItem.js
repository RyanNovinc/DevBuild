// src/screens/TodoListScreen/components/NotesSection/components/NoteItem.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../TodoListStyles';
import { formatNoteDate } from '../../../TodoUtils';
import TagsDisplay from '../../notes/TagsDisplay';

/**
 * Component for displaying individual note items in the notes list
 */
const NoteItem = ({
  note,
  noteFolders,
  activeNoteFolder,
  activeTagFilter,
  onPress,
  onLongPress,
  onTagPress,
  theme
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.noteItem, 
        { 
          backgroundColor: theme.card, 
          borderColor: theme.border,
        }
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
    >
      <View style={styles.noteHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={[
            styles.noteTitle, 
            { color: theme.text }
          ]} numberOfLines={1}>
            {note.title}
          </Text>
        </View>
        
        <Text style={[styles.noteDate, { color: theme.textSecondary }]}>
          {formatNoteDate(note.updatedAt)}
        </Text>
      </View>
      
      {note.content && (
        <Text style={[styles.notePreview, { color: theme.textSecondary }]} numberOfLines={3}>
          {note.content}
        </Text>
      )}
      
      {/* Show tags if note has any */}
      {note.tags && note.tags.length > 0 && (
        <TagsDisplay
          noteTags={note.tags}
          theme={theme}
          small={true}
          readOnly={false}
          onTagPress={onTagPress}
          activeFilterTag={activeTagFilter !== 'NO_TAGS' ? activeTagFilter : null}
        />
      )}
      
      {/* Show folder indicator if we're in All Notes view */}
      {activeNoteFolder === null && note.folderId && (
        <View style={styles.noteFolderIndicator}>
          <View 
            style={[
              styles.noteFolderDot, 
              { 
                backgroundColor: noteFolders.find(f => f.id === note.folderId)?.color || theme.primary 
              }
            ]} 
          />
          <Text style={[styles.noteFolderName, { color: theme.textSecondary }]}>
            {noteFolders.find(f => f.id === note.folderId)?.name || ''}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default React.memo(NoteItem);