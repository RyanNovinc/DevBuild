// src/screens/TodoListScreen/components/NotesSection/components/NotesList.js
import React from 'react';
import { ScrollView } from 'react-native';
import { styles } from '../../../TodoListStyles';
import NoteItem from './NoteItem';

/**
 * Component for displaying the list of filtered notes
 */
const NotesList = ({
  filteredNotes,
  noteFolders,
  activeNoteFolder,
  activeTagFilter,
  startEditNote,
  showNoteOptions,
  handleNoteTagClick,
  theme
}) => {
  return (
    <ScrollView style={styles.notesList}>
      {filteredNotes.map(note => (
        <NoteItem
          key={note.id}
          note={note}
          noteFolders={noteFolders}
          activeNoteFolder={activeNoteFolder}
          activeTagFilter={activeTagFilter}
          onPress={() => startEditNote(note)}
          onLongPress={() => showNoteOptions(note)}
          onTagPress={handleNoteTagClick}
          theme={theme}
        />
      ))}
    </ScrollView>
  );
};

export default React.memo(NotesList);