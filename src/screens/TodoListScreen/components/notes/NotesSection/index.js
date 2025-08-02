// src/screens/TodoListScreen/components/notes/NotesSection/index.js
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../../TodoListStyles';
import AddFolderInput from '../AddFolderInput';
import EmptyState from '../../../../components/EmptyState';
import EmptyTodoIllustration from '../../../../components/illustrations/EmptyTodoIllustration';

// Import responsive utilities
import {
  scaleWidth,
  scaleHeight,
  spacing,
  isSmallDevice,
  accessibility
} from '../../../../../utils/responsive';

// Import components
import NotesList from './components/NotesList';
import NoteActionBar from './components/NoteActionBar';
import NotesFilters from './components/NotesFilters';
import FilterModal from './components/FilterModal';
import SearchModal from './components/SearchModal';
import ExportBar from './components/ExportBar';

// Import hooks
import useNotesFiltering from './hooks/useNotesFiltering';
import useNotesActions from './hooks/useNotesActions';

/**
 * NotesSection component for managing notes with folders, tags, search, and pins
 */
const NotesSection = ({
  notes,
  setNotes,
  noteFolders,
  setNoteFolders,
  activeNoteFolder,
  setActiveNoteFolder,
  isAddingFolder,
  setIsAddingFolder,
  newFolderName,
  setNewFolderName,
  folderViewMode,
  setFolderViewMode,
  editingNote,
  setEditingNote,
  editNoteTitle,
  setEditNoteTitle,
  editNoteContent,
  setEditNoteContent,
  showFullScreenNote,
  setShowFullScreenNote,
  isCreatingNote,
  setIsCreatingNote,
  theme,
  showSuccess
}) => {
  // State for tag filtering
  const [activeTagFilter, setActiveTagFilter] = useState(null);
  const [showTagFilterModal, setShowTagFilterModal] = useState(false);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Use custom hooks for filtering and actions
  const { filteredNotes, getAllTags } = useNotesFiltering(
    notes, 
    activeNoteFolder, 
    activeTagFilter, 
    isSearchActive, 
    searchQuery,
    editingNote
  );
  
  const { 
    createNewNote,
    startEditNote,
    deleteNote,
    clearAllNotes,
    showNoteOptions,
    handleNoteTagClick,
    toggleNotePin,
    shareNotes,
    copyNotesToClipboard,
    ensureNotesHavePinnedProperty
  } = useNotesActions({
    notes,
    setNotes,
    noteFolders,
    activeNoteFolder,
    activeTagFilter,
    isSearchActive,
    searchQuery,
    editingNote,
    setEditingNote,
    editNoteTitle,
    setEditNoteTitle,
    editNoteContent,
    setEditNoteContent,
    showFullScreenNote,
    setShowFullScreenNote,
    isCreatingNote,
    setIsCreatingNote,
    filteredNotes,
    theme,
    showSuccess
  });

  // Check if theme is dark mode
  const isDarkMode = theme.background === '#000000';
  
  // Run once on component mount to ensure all notes have pinned property
  useEffect(() => {
    if (ensureNotesHavePinnedProperty()) {
      console.log('Fixed notes data structure - added missing pinned property');
    }
  }, []);

  // ADDED: Save notes to AsyncStorage whenever they change
  useEffect(() => {
    const saveNotes = async () => {
      try {
        // Use the same storage key as defined in AppContext
        await AsyncStorage.setItem('notes', JSON.stringify(notes));
        console.log('Notes saved to AsyncStorage, count:', notes.length);
      } catch (error) {
        console.error('Error saving notes to AsyncStorage:', error);
      }
    };
    
    // Skip initial empty notes array
    if (notes && notes.length > 0) {
      saveNotes();
    }
  }, [notes]);

  return (
    <View style={[
      styles.tabContent,
      {
        paddingHorizontal: isSmallDevice ? spacing.xxs : spacing.xs,
      }
    ]}>
      {/* Add Folder Input (shown when adding a folder) */}
      {isAddingFolder && (
        <AddFolderInput
          newFolderName={newFolderName}
          setNewFolderName={setNewFolderName}
          setIsAddingFolder={setIsAddingFolder}
          noteFolders={noteFolders}
          setNoteFolders={setNoteFolders}
          setActiveNoteFolder={setActiveNoteFolder}
          theme={theme}
          showSuccess={showSuccess}
        />
      )}
      
      {/* Filter Indicators (Tag & Search) */}
      <NotesFilters 
        activeTagFilter={activeTagFilter}
        setActiveTagFilter={setActiveTagFilter}
        isSearchActive={isSearchActive}
        searchQuery={searchQuery}
        setIsSearchActive={setIsSearchActive}
        setSearchQuery={setSearchQuery}
        setShowSearchModal={setShowSearchModal}
        theme={theme}
        showSuccess={showSuccess}
      />
      
      {/* Add Note and Clear All Notes Buttons */}
      <NoteActionBar 
        createNewNote={createNewNote}
        clearAllNotes={clearAllNotes}
        filteredNotes={filteredNotes}
        activeTagFilter={activeTagFilter}
        isSearchActive={isSearchActive}
        searchQuery={searchQuery}
        theme={theme}
        isDarkMode={isDarkMode}
      />

      {/* Notes List or Empty State */}
      {filteredNotes.length > 0 ? (
        <NotesList 
          filteredNotes={filteredNotes}
          noteFolders={noteFolders}
          activeNoteFolder={activeNoteFolder}
          activeTagFilter={activeTagFilter}
          startEditNote={startEditNote}
          showNoteOptions={showNoteOptions}
          handleNoteTagClick={handleNoteTagClick}
          theme={theme}
        />
      ) : (
        <View style={[
          styles.emptyState,
          {
            paddingHorizontal: spacing.m,
            paddingTop: scaleHeight(40),
          }
        ]}>
          <EmptyState
            title={
              isSearchActive && searchQuery.trim()
                ? "No Results Found"
                : (activeTagFilter === 'NO_TAGS'
                  ? "No Notes Without Tags"
                  : (activeTagFilter 
                    ? `No Notes with Tag #${activeTagFilter}` 
                    : (activeNoteFolder === null ? "No Notes Yet" : "No Notes in This Folder")))
            }
            message={
              isSearchActive && searchQuery.trim()
                ? `No notes matching "${searchQuery}" were found. Try a different search term or clear the search.`
                : (activeTagFilter === 'NO_TAGS'
                  ? "There are no untagged notes in this view. All notes have at least one tag."
                  : (activeTagFilter
                    ? `There are no notes with the tag #${activeTagFilter} in this view. Add a new note or clear the filter.`
                    : (activeNoteFolder === null 
                      ? "Add quick notes, ideas, or thoughts. Perfect for capturing inspiration alongside your to-dos." 
                      : "Add notes to this folder using the 'Add Note' button. You can also move existing notes here.")))
            }
            icon={isSearchActive && searchQuery.trim() ? "search" : "document-text"}
            iconColor={theme.primary}
            theme={theme}
            illustration={<EmptyTodoIllustration theme={theme} />}
          />
        </View>
      )}

      {/* Export & Actions Row for Notes */}
      {filteredNotes.length > 0 && (
        <ExportBar
          filteredNotes={filteredNotes}
          copyNotesToClipboard={copyNotesToClipboard}
          shareNotes={shareNotes}
          theme={theme}
          isDarkMode={isDarkMode}
        />
      )}
      
      {/* Tag Filter Modal */}
      <FilterModal
        visible={showTagFilterModal}
        setVisible={setShowTagFilterModal}
        activeTagFilter={activeTagFilter}
        setActiveTagFilter={setActiveTagFilter}
        getAllTags={getAllTags}
        createNewNote={createNewNote}
        theme={theme}
        showSuccess={showSuccess}
      />
      
      {/* Search Modal */}
      <SearchModal
        visible={showSearchModal}
        setVisible={setShowSearchModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchActive={isSearchActive}
        setIsSearchActive={setIsSearchActive}
        theme={theme}
        showSuccess={showSuccess}
      />
    </View>
  );
};

export default React.memo(NotesSection);