// src/screens/TodoListScreen/components/NotesSection/hooks/useNotesActions.js
import { useCallback } from 'react';
import { Alert, Share, Clipboard } from 'react-native';
import { getContrastText } from '../../../TodoUtils';

/**
 * Hook for note actions (create, delete, share, etc.)
 */
const useNotesActions = ({
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
}) => {
  // Create a new note in full-screen mode
  const createNewNote = useCallback(() => {
    const now = new Date().toISOString();
    const newNote = {
      id: Date.now().toString(),
      title: '',
      content: '',
      createdAt: now,
      updatedAt: now,
      folderId: activeNoteFolder, // Assign to current folder if one is selected
      tags: activeTagFilter && activeTagFilter !== 'NO_TAGS' ? [activeTagFilter] : [] // Pre-fill with active tag if filtered
    };
    
    setEditingNote(newNote);
    setEditNoteTitle(newNote.title);
    setEditNoteContent(newNote.content);
    setIsCreatingNote(true);
    setShowFullScreenNote(true);
  }, [
    activeNoteFolder, 
    activeTagFilter, 
    setEditingNote, 
    setEditNoteTitle, 
    setEditNoteContent, 
    setIsCreatingNote, 
    setShowFullScreenNote
  ]);
  
  // Start editing a note (opens existing note in full-screen edit mode)
  const startEditNote = useCallback((note) => {
    setEditingNote(note);
    setEditNoteTitle(note.title);
    setEditNoteContent(note.content);
    setIsCreatingNote(false);
    setShowFullScreenNote(true);
  }, [setEditingNote, setEditNoteTitle, setEditNoteContent, setIsCreatingNote, setShowFullScreenNote]);
  
  // Handle tag click on notes list
  const handleNoteTagClick = useCallback((tagName) => {
    // Set this tag as the active filter
    showSuccess(`Filtered by tag: ${tagName}`);
    return tagName;
  }, [showSuccess]);
  
  // Delete a note
  const deleteNote = useCallback((noteId) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            setNotes(notes.filter(note => note.id !== noteId));
            
            // If we're currently editing this note, close the editor
            if (editingNote && editingNote.id === noteId) {
              setEditingNote(null);
              setEditNoteTitle('');
              setEditNoteContent('');
              setShowFullScreenNote(false);
              setIsCreatingNote(false);
            }
            
            showSuccess('Note deleted');
          }
        }
      ]
    );
  }, [
    notes, 
    setNotes, 
    editingNote, 
    setEditingNote, 
    setEditNoteTitle, 
    setEditNoteContent, 
    setShowFullScreenNote, 
    setIsCreatingNote, 
    showSuccess
  ]);

  // Clear all notes (with confirmation)
  const clearAllNotes = useCallback(() => {
    const noteCount = filteredNotes.length;
    
    if (noteCount === 0) {
      showSuccess('No notes to clear', { type: 'warning' });
      return;
    }
    
    const folderName = activeNoteFolder === null ? 
      'all notes' : 
      `all notes in "${noteFolders.find(f => f.id === activeNoteFolder)?.name}"`;
    
    let filterMsg = '';
    if (activeTagFilter) {
      filterMsg = activeTagFilter === 'NO_TAGS' ? 
        ' with no tags' : 
        ` with tag "${activeTagFilter}"`;
    }
    
    if (isSearchActive && searchQuery.trim()) {
      filterMsg += ` matching "${searchQuery}"`;
    }
      
    Alert.alert(
      "Clear Notes",
      `Are you sure you want to delete ${noteCount} ${noteCount === 1 ? 'note' : 'notes'} from ${folderName}${filterMsg}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete All", 
          style: "destructive",
          onPress: () => {
            if (isSearchActive && searchQuery.trim()) {
              // Delete only notes that match the search query
              const idsToDelete = filteredNotes.map(note => note.id);
              setNotes(notes.filter(note => !idsToDelete.includes(note.id)));
              showSuccess(`Deleted ${noteCount} notes matching search`);
            }
            else if (activeTagFilter === 'NO_TAGS') {
              // Delete notes with no tags
              setNotes(notes.filter(note => {
                // Keep notes that don't match the folder filter
                if (activeNoteFolder !== null && note.folderId !== activeNoteFolder) {
                  return true;
                }
                
                // Keep notes that have tags
                return note.tags && note.tags.length > 0;
              }));
              
              showSuccess(`Notes with no tags deleted`);
            } else if (activeTagFilter) {
              // Only delete notes with the active tag
              setNotes(notes.filter(note => {
                // Keep notes that don't match the folder filter
                if (activeNoteFolder !== null && note.folderId !== activeNoteFolder) {
                  return true;
                }
                
                // Keep notes that don't have the tag
                return !(note.tags && note.tags.includes(activeTagFilter));
              }));
              
              showSuccess(`Notes with tag "${activeTagFilter}" deleted`);
            } else if (activeNoteFolder === null) {
              // Clear all notes
              setNotes([]);
              showSuccess('All notes cleared');
            } else {
              // Clear only notes in the current folder
              setNotes(notes.filter(note => note.folderId !== activeNoteFolder));
              showSuccess('All notes in this folder cleared');
            }
            
            // If we're currently editing a note that's being deleted, close the editor
            if (editingNote && (activeNoteFolder === null || editingNote.folderId === activeNoteFolder)) {
              if (
                (activeTagFilter === 'NO_TAGS' && (!editingNote.tags || editingNote.tags.length === 0)) ||
                (!activeTagFilter || (editingNote.tags && editingNote.tags.includes(activeTagFilter)))
              ) {
                setEditingNote(null);
                setEditNoteTitle('');
                setEditNoteContent('');
                setShowFullScreenNote(false);
                setIsCreatingNote(false);
              }
            }
          }
        }
      ]
    );
  }, [
    filteredNotes, 
    activeNoteFolder, 
    activeTagFilter, 
    isSearchActive, 
    searchQuery, 
    notes, 
    setNotes, 
    noteFolders, 
    editingNote, 
    setEditingNote, 
    setEditNoteTitle, 
    setEditNoteContent, 
    setShowFullScreenNote, 
    setIsCreatingNote, 
    showSuccess
  ]);
  
  // Move a note to a different folder
  const moveNoteToFolder = useCallback((noteId, newFolderId) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, folderId: newFolderId } : note
    ));
    
    const folderName = newFolderId ? 
      noteFolders.find(folder => folder.id === newFolderId)?.name : 
      'All Notes';
    
    showSuccess(`Note moved to ${folderName}`);
  }, [notes, setNotes, noteFolders, showSuccess]);
  
  // Show options for a note
  const showNoteOptions = useCallback((note) => {
    Alert.alert(
      "Note Options",
      note.title,
      [
        {
          text: 'Edit',
          onPress: () => startEditNote(note)
        },
        {
          text: 'Move to Folder',
          onPress: () => {
            // Create options for all folders
            const folderOptions = [
              {
                text: 'All Notes (no folder)',
                onPress: () => moveNoteToFolder(note.id, null)
              },
              ...noteFolders.map(folder => ({
                text: folder.name,
                onPress: () => moveNoteToFolder(note.id, folder.id)
              }))
            ];
            
            Alert.alert(
              'Move to Folder',
              'Choose a folder:',
              [...folderOptions, { text: 'Cancel', style: 'cancel' }]
            );
          }
        },
        {
          text: 'Manage Tags',
          onPress: () => {
            // Create a note copy for editing
            const noteForTagEdit = {...note};
            
            // Show the full screen editor with this note
            setEditingNote(noteForTagEdit);
            setEditNoteTitle(noteForTagEdit.title);
            setEditNoteContent(noteForTagEdit.content);
            setIsCreatingNote(false);
            setShowFullScreenNote(true);
          }
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNote(note.id)
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  }, [
    startEditNote,
    moveNoteToFolder, 
    noteFolders, 
    setEditingNote, 
    setEditNoteTitle, 
    setEditNoteContent, 
    setIsCreatingNote, 
    setShowFullScreenNote, 
    deleteNote
  ]);
  
  // Share notes
  const shareNotes = useCallback(() => {
    try {
      if (filteredNotes.length === 0) {
        showSuccess('No notes to share', { type: 'warning' });
        return;
      }
      
      let shareContent = `📝 MY NOTES (${new Date().toLocaleDateString()})\n\n`;
      
      // Add filter info to the shared content
      if (activeNoteFolder !== null) {
        const folderName = noteFolders.find(f => f.id === activeNoteFolder)?.name;
        shareContent += `Folder: ${folderName}\n`;
      }
      
      if (activeTagFilter) {
        if (activeTagFilter === 'NO_TAGS') {
          shareContent += `Filter: Notes with no tags\n`;
        } else {
          shareContent += `Tag: #${activeTagFilter}\n`;
        }
      }
      
      if (isSearchActive && searchQuery.trim()) {
        shareContent += `Search: "${searchQuery}"\n`;
      }
      
      shareContent += `\n`;
      
      filteredNotes.forEach((note, index) => {
        shareContent += `${index + 1}. ${note.title}\n`;
        if (note.content) {
          shareContent += `${note.content}\n`;
        }
        if (note.tags && note.tags.length > 0) {
          shareContent += `Tags: ${note.tags.map(tag => `#${tag}`).join(', ')}\n`;
        }
        shareContent += `\n`;
      });
      
      shareContent += `\nExported from LifeCompass app`;
      
      Share.share({
        message: shareContent,
        title: 'My Notes'
      });
    } catch (error) {
      console.error('Error sharing notes:', error);
      showSuccess('Failed to share notes', { type: 'error' });
    }
  }, [
    filteredNotes, 
    activeNoteFolder, 
    activeTagFilter, 
    isSearchActive, 
    searchQuery, 
    noteFolders, 
    showSuccess
  ]);
  
  // Copy notes to clipboard
  const copyNotesToClipboard = useCallback(() => {
    try {
      if (filteredNotes.length === 0) {
        showSuccess('No notes to copy', { type: 'warning' });
        return;
      }
      
      let content = `📝 MY NOTES (${new Date().toLocaleDateString()})\n\n`;
      
      // Add filter info to the copied content
      if (activeNoteFolder !== null) {
        const folderName = noteFolders.find(f => f.id === activeNoteFolder)?.name;
        content += `Folder: ${folderName}\n`;
      }
      
      if (activeTagFilter) {
        if (activeTagFilter === 'NO_TAGS') {
          content += `Filter: Notes with no tags\n`;
        } else {
          content += `Tag: #${activeTagFilter}\n`;
        }
      }
      
      if (isSearchActive && searchQuery.trim()) {
        content += `Search: "${searchQuery}"\n`;
      }
      
      content += `\n`;
      
      filteredNotes.forEach((note, index) => {
        content += `${index + 1}. ${note.title}\n`;
        if (note.content) {
          content += `${note.content}\n`;
        }
        if (note.tags && note.tags.length > 0) {
          content += `Tags: ${note.tags.map(tag => `#${tag}`).join(', ')}\n`;
        }
        content += `\n`;
      });
      
      content += `\nExported from LifeCompass app`;
      
      Clipboard.setString(content);
      showSuccess('Copied to clipboard!');
    } catch (error) {
      console.error('Error copying notes:', error);
      showSuccess('Failed to copy notes', { type: 'error' });
    }
  }, [
    filteredNotes, 
    activeNoteFolder, 
    activeTagFilter, 
    isSearchActive, 
    searchQuery, 
    noteFolders, 
    showSuccess
  ]);

  // Ensure all notes have required properties
  const ensureNotesHavePinnedProperty = useCallback(() => {
    return false;
  }, []);

  return {
    createNewNote,
    startEditNote,
    deleteNote,
    clearAllNotes,
    showNoteOptions,
    handleNoteTagClick,
    shareNotes,
    copyNotesToClipboard,
    ensureNotesHavePinnedProperty
  };
};

export default useNotesActions;