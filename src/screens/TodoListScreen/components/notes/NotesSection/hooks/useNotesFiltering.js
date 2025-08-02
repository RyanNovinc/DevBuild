// src/screens/TodoListScreen/components/NotesSection/hooks/useNotesFiltering.js
import { useMemo } from 'react';

/**
 * Hook for filtering notes based on folder, tag, and search
 */
const useNotesFiltering = (
  notes, 
  activeNoteFolder, 
  activeTagFilter, 
  isSearchActive, 
  searchQuery,
  editingNote
) => {
  // Extract all unique tags from notes
  const getAllTags = () => {
    const uniqueTags = new Set();
    notes.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => uniqueTags.add(tag));
      }
    });
    return Array.from(uniqueTags);
  };

  // Get filtered notes based on active folder, tag filter, and search query
  const filteredNotes = useMemo(() => {
    let filteredByFolder = [];
    
    if (activeNoteFolder === null) {
      // "All Notes" view
      filteredByFolder = notes;
    } else {
      // Filter by folder
      filteredByFolder = notes.filter(note => note.folderId === activeNoteFolder);
    }
    
    // Apply tag filter
    let filteredByTag;
    if (activeTagFilter === 'NO_TAGS') {
      // Special case: filter for notes with no tags
      filteredByTag = filteredByFolder.filter(note => 
        !note.tags || note.tags.length === 0
      );
    } else if (activeTagFilter) {
      // Filter for notes with specific tag
      filteredByTag = filteredByFolder.filter(note => 
        note.tags && Array.isArray(note.tags) && note.tags.includes(activeTagFilter)
      );
    } else {
      filteredByTag = filteredByFolder;
    }
    
    // Apply search filter if active and not empty
    let searchFilteredNotes;
    if (isSearchActive && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      searchFilteredNotes = filteredByTag.filter(note => 
        (note.title && note.title.toLowerCase().includes(query)) || 
        (note.content && note.content.toLowerCase().includes(query))
      );
    } else {
      searchFilteredNotes = filteredByTag;
    }
    
    // Sort notes by update date (newest first)
    return searchFilteredNotes.sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    
  }, [notes, activeNoteFolder, activeTagFilter, isSearchActive, searchQuery]);

  return {
    filteredNotes,
    getAllTags
  };
};

export default useNotesFiltering;