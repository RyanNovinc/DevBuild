// src/screens/TodoListScreen/components/notes/NotesSection.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, Animated, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../TodoListStyles';
import { getContrastText, formatNoteDate } from '../../TodoUtils';
import NotesFolders from './NotesFolders';
import AddFolderInput from './AddFolderInput';
import EmptyState from '../../../../components/EmptyState';
import EmptyTodoIllustration from '../../../../components/illustrations/EmptyTodoIllustration';
import { Share, Clipboard } from 'react-native';
import TagsDisplay from './TagsDisplay';

/**
 * NotesSection component for managing notes with enhanced tag filtering and search
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
  // Check if theme is dark mode
  const isDarkMode = theme.background === '#000000';
  
  // State for tag filtering
  const [activeTagFilter, setActiveTagFilter] = useState(null);
  
  // State for tag filter popup visibility
  const [showTagFilterModal, setShowTagFilterModal] = useState(false);
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  
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

  // Get the color for a tag (fallback to primary color if not found)
  const getTagColor = (tagName) => {
    return theme.primary;
  };
  
  // Get filtered notes based on active folder, tag filter, and search query
  const getFilteredNotes = () => {
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
    if (isSearchActive && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      return filteredByTag.filter(note => 
        (note.title && note.title.toLowerCase().includes(query)) || 
        (note.content && note.content.toLowerCase().includes(query))
      );
    }
    
    return filteredByTag;
  };
  
  const filteredNotes = getFilteredNotes();
  
  // Create a new note in full-screen mode
  const createNewNote = () => {
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
  };
  
  // Start editing a note (opens existing note in full-screen edit mode)
  const startEditNote = (note) => {
    setEditingNote(note);
    setEditNoteTitle(note.title);
    setEditNoteContent(note.content);
    setIsCreatingNote(false);
    setShowFullScreenNote(true);
  };
  
  // Handle tag click on notes list
  const handleNoteTagClick = (tagName) => {
    // Set this tag as the active filter
    setActiveTagFilter(tagName);
    showSuccess(`Filtered by tag: ${tagName}`);
  };
  
  // Delete a note
  const deleteNote = (noteId) => {
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
  };

  // Clear all notes (with confirmation)
  const clearAllNotes = () => {
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
            
            // Reset search if active
            if (isSearchActive) {
              setIsSearchActive(false);
              setSearchQuery('');
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
  };
  
  // Show options for a note
  const showNoteOptions = (note) => {
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
  };
  
  // Move a note to a different folder
  const moveNoteToFolder = (noteId, newFolderId) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, folderId: newFolderId } : note
    ));
    
    const folderName = newFolderId ? 
      noteFolders.find(folder => folder.id === newFolderId)?.name : 
      'All Notes';
    
    showSuccess(`Note moved to ${folderName}`);
  };
  
  // Share notes
  const shareNotes = () => {
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
  };
  
  // Copy notes to clipboard
  const copyNotesToClipboard = () => {
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
  };

  return (
    <View style={styles.tabContent}>
      {/* Folders Section with Tag Filter and Search Icons */}
      <View style={styles.foldersSection}>
        <View style={styles.folderSectionHeader}>
          <Text style={[styles.folderSectionTitle, { color: theme.text }]}>Folders</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Search Button */}
            <TouchableOpacity
              onPress={() => setShowSearchModal(true)}
              style={[
                styles.folderViewToggle, 
                { marginRight: 8 },
                isSearchActive && searchQuery.trim() && { 
                  backgroundColor: theme.cardElevated,
                  borderWidth: 1,
                  borderColor: theme.primary
                }
              ]}
            >
              <Ionicons 
                name={isSearchActive && searchQuery.trim() ? "search" : "search-outline"} 
                size={20} 
                color={theme.primary} 
              />
            </TouchableOpacity>
            
            {/* Tag Filter Button */}
            <TouchableOpacity
              onPress={() => setShowTagFilterModal(true)}
              style={[
                styles.folderViewToggle, 
                { marginRight: 8 },
                activeTagFilter && { 
                  backgroundColor: activeTagFilter === 'NO_TAGS' ? 
                    theme.cardElevated : 
                    getTagColor(activeTagFilter) + '20',
                  borderWidth: 1,
                  borderColor: activeTagFilter === 'NO_TAGS' ? 
                    theme.border : 
                    getTagColor(activeTagFilter)
                }
              ]}
            >
              <Ionicons 
                name={activeTagFilter ? "pricetag" : "funnel-outline"} 
                size={20} 
                color={activeTagFilter ? getTagColor(activeTagFilter) : theme.primary} 
              />
            </TouchableOpacity>
            
            {/* View Toggle Button */}
            <TouchableOpacity
              onPress={() => setFolderViewMode(folderViewMode === 'chips' ? 'list' : 'chips')}
              style={styles.folderViewToggle}
            >
              <Ionicons 
                name={folderViewMode === 'chips' ? 'list' : 'apps-outline'} 
                size={20} 
                color={theme.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Render the rest of the folders section */}
        {folderViewMode === 'chips' ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.folderScrollContainer}
            contentContainerStyle={styles.folderScrollContent}
          >
            {/* All Notes "folder" */}
            <TouchableOpacity
              style={[
                styles.folderChip,
                { 
                  backgroundColor: activeNoteFolder === null ? theme.primary : theme.cardElevated,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setActiveNoteFolder(null)}
            >
              <Ionicons 
                name="documents-outline" 
                size={16} 
                color={activeNoteFolder === null ? getContrastText(theme.primary, isDarkMode, theme) : theme.text} 
              />
              <Text 
                style={[
                  styles.folderChipText, 
                  { color: activeNoteFolder === null ? getContrastText(theme.primary, isDarkMode, theme) : theme.text }
                ]}
              >
                All Notes
              </Text>
              <View style={styles.folderCountBadge}>
                <Text style={styles.folderCountText}>
                  {notes.filter(note => !note._tempId || (editingNote && note._tempId === editingNote._tempId)).length}
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* User-created folders */}
            {noteFolders.map(folder => {
              const folderNoteCount = notes.filter(note => 
                note.folderId === folder.id && 
                (!note._tempId || (editingNote && note._tempId === editingNote._tempId))
              ).length;
              
              return (
                <TouchableOpacity
                  key={folder.id}
                  style={[
                    styles.folderChip,
                    { 
                      backgroundColor: activeNoteFolder === folder.id ? theme.primary : theme.cardElevated,
                      borderColor: theme.border,
                      borderLeftColor: folder.color // Add a colored accent
                    }
                  ]}
                  onPress={() => setActiveNoteFolder(folder.id)}
                  onLongPress={() => {
                    Alert.alert(
                      "Folder Options",
                      folder.name,
                      [
                        {
                          text: 'Rename',
                          onPress: () => {} // Not implemented in this code
                        },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => {} // Not implemented in this code
                        },
                        {
                          text: 'Cancel',
                          style: 'cancel'
                        }
                      ]
                    );
                  }}
                >
                  <View 
                    style={[
                      styles.folderColorDot, 
                      { backgroundColor: folder.color }
                    ]} 
                  />
                  <Text 
                    style={[
                      styles.folderChipText, 
                      { color: activeNoteFolder === folder.id ? getContrastText(theme.primary, isDarkMode, theme) : theme.text }
                    ]}
                    numberOfLines={1}
                  >
                    {folder.name}
                  </Text>
                  <View style={styles.folderCountBadge}>
                    <Text style={styles.folderCountText}>
                      {folderNoteCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {/* Add Folder Button */}
            <TouchableOpacity
              style={[styles.addFolderChip, { borderColor: theme.border }]}
              onPress={() => setIsAddingFolder(true)}
            >
              <Ionicons name="add" size={16} color={theme.primary} />
              <Text style={[styles.addFolderText, { color: theme.primary }]}>
                New Folder
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          // List view implementation goes here (excluded for brevity)
          <View></View>
        )}
      </View>
      
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
      
      {/* Search Indicator - only show if there's an active search WITH content */}
      {isSearchActive && searchQuery.trim() ? (
        <TouchableOpacity 
          style={{
            marginHorizontal: 16,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: theme.cardElevated,
            borderWidth: 1,
            borderColor: theme.primary,
          }}
          onPress={() => setShowSearchModal(true)}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="search" size={16} color={theme.primary} />
            <Text style={{ 
              marginLeft: 8, 
              color: theme.text, 
              fontWeight: '500',
              fontSize: 14
            }}>
              Search: <Text style={{ fontWeight: '600' }}>{searchQuery}</Text>
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering parent onPress
              setIsSearchActive(false);
              setSearchQuery('');
              showSuccess('Search cleared');
            }}
            style={{
              padding: 4,
              borderRadius: 12
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : null}
      
      {/* Active Filter Indicator - only show if there's an active filter */}
      {activeTagFilter && (
        <View 
          style={{
            marginHorizontal: 16,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: activeTagFilter === 'NO_TAGS' ? 
              theme.cardElevated : 
              getTagColor(activeTagFilter) + '20',
            borderWidth: 1,
            borderColor: activeTagFilter === 'NO_TAGS' ? 
              theme.border : 
              getTagColor(activeTagFilter),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons 
              name={activeTagFilter === 'NO_TAGS' ? "remove-circle-outline" : "pricetag"} 
              size={16} 
              color={activeTagFilter === 'NO_TAGS' ? theme.textSecondary : getTagColor(activeTagFilter)} 
            />
            <Text style={{ 
              marginLeft: 8, 
              color: theme.text, 
              fontWeight: '500',
              fontSize: 14
            }}>
              Filtered by: <Text style={{ fontWeight: '600' }}>
                {activeTagFilter === 'NO_TAGS' ? 'No Tags' : activeTagFilter}
              </Text>
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => {
              setActiveTagFilter(null);
              showSuccess('Filter cleared');
            }}
            style={{
              padding: 4,
              borderRadius: 12
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Add Note and Clear All Notes Buttons */}
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

      {/* Notes List */}
      {filteredNotes.length > 0 ? (
        <ScrollView style={styles.notesList}>
          {filteredNotes.map(note => (
            <TouchableOpacity
              key={note.id}
              style={[styles.noteItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => startEditNote(note)}
              onLongPress={() => showNoteOptions(note)}
              delayLongPress={500}
            >
              <View style={styles.noteHeader}>
                <Text style={[styles.noteTitle, { color: theme.text }]} numberOfLines={1}>
                  {note.title}
                </Text>
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
                  onTagPress={handleNoteTagClick}
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
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
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
        <View style={styles.actionsContainer}>
          <View style={styles.exportActions}>
            <TouchableOpacity 
              style={[styles.exportButton, { backgroundColor: theme.cardElevated }]}
              onPress={copyNotesToClipboard}
            >
              <Ionicons name="copy-outline" size={18} color={theme.textSecondary} />
              <Text style={[styles.exportButtonText, { color: theme.text }]}>
                Copy
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.exportButton, { backgroundColor: theme.primary }]}
              onPress={shareNotes}
            >
              <Ionicons name="share-social-outline" size={18} color={getContrastText(theme.primary, isDarkMode, theme)} />
              <Text style={[styles.exportButtonTextLight, { color: getContrastText(theme.primary, isDarkMode, theme) }]}>
                Share
              </Text>
            </TouchableOpacity>
            
            {/* Tally counter for notes */}
            <View style={styles.tallyContainer}>
              <Text style={[styles.tallyText, { color: theme.textSecondary }]}>
                {filteredNotes.length}
              </Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Tag Filter Modal */}
      <Modal
        visible={showTagFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTagFilterModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setShowTagFilterModal(false)}
        >
          <View 
            style={{
              width: '85%',
              maxHeight: '80%',
              backgroundColor: theme.card,
              borderRadius: 16,
              padding: 20,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={{ 
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 15,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
              paddingBottom: 10
            }}>
              <Text style={{ 
                fontSize: 18,
                fontWeight: '600',
                color: theme.text
              }}>
                Filter Notes by Tag
              </Text>
              <TouchableOpacity
                onPress={() => setShowTagFilterModal(false)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            {activeTagFilter && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                  marginBottom: 10
                }}
                onPress={() => {
                  setActiveTagFilter(null);
                  setShowTagFilterModal(false);
                  showSuccess('Filter cleared');
                }}
              >
                <Ionicons name="close-circle-outline" size={22} color={theme.primary} style={{ marginRight: 10 }} />
                <Text style={{ fontSize: 16, color: theme.primary, fontWeight: '500' }}>
                  Clear Filter
                </Text>
              </TouchableOpacity>
            )}
            
            <ScrollView 
              style={{ 
                maxHeight: 300,
                marginBottom: 10
              }}
              showsVerticalScrollIndicator={true}
            >
              {/* Option to filter for notes with no tags */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  borderWidth: 1,
                  backgroundColor: activeTagFilter === 'NO_TAGS' ? theme.cardElevated : 'transparent',
                  borderColor: activeTagFilter === 'NO_TAGS' ? theme.primary : theme.border,
                }}
                onPress={() => {
                  setActiveTagFilter(activeTagFilter === 'NO_TAGS' ? null : 'NO_TAGS');
                  setShowTagFilterModal(false);
                  showSuccess(activeTagFilter === 'NO_TAGS' ? 'Filter cleared' : 'Filtered by: No Tags');
                }}
              >
                <Ionicons 
                  name="remove-circle-outline" 
                  size={22} 
                  color={theme.textSecondary} 
                  style={{ marginRight: 10 }}
                />
                <Text style={{ fontSize: 16, fontWeight: '500', color: theme.text }}>
                  Notes with No Tags
                </Text>
                
                {activeTagFilter === 'NO_TAGS' && (
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={22} 
                      color={theme.primary} 
                    />
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Regular tag options */}
              {getAllTags().length > 0 ? (
                getAllTags().map(tagName => {
                  const isActive = activeTagFilter === tagName;
                  const tagColor = getTagColor(tagName);
                  
                  return (
                    <TouchableOpacity
                      key={tagName}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 8,
                        borderWidth: 1,
                        backgroundColor: isActive ? tagColor + '20' : 'transparent',
                        borderColor: isActive ? tagColor : theme.border,
                      }}
                      onPress={() => {
                        setActiveTagFilter(tagName === activeTagFilter ? null : tagName);
                        setShowTagFilterModal(false);
                        showSuccess(tagName === activeTagFilter ? 'Filter cleared' : `Filtered by tag: ${tagName}`);
                      }}
                    >
                      <View style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: tagColor,
                        marginRight: 10
                      }} />
                      <Text style={{ fontSize: 16, fontWeight: '500', color: theme.text }}>
                        {tagName}
                      </Text>
                      
                      {isActive && (
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Ionicons 
                            name="checkmark-circle" 
                            size={22} 
                            color={tagColor} 
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={{ 
                  padding: 20, 
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Ionicons 
                    name="pricetags-outline" 
                    size={40} 
                    color={theme.textSecondary}
                    style={{ marginBottom: 10, opacity: 0.7 }}
                  />
                  <Text style={{ 
                    color: theme.textSecondary,
                    fontSize: 16,
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    No tags available
                  </Text>
                  <Text style={{ 
                    color: theme.textSecondary,
                    fontSize: 14,
                    textAlign: 'center',
                    marginTop: 5
                  }}>
                    Add tags to your notes to enable filtering
                  </Text>
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={{
                backgroundColor: theme.primary,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 10
              }}
              onPress={() => {
                setShowTagFilterModal(false);
                // Open note creation with tag focus
                createNewNote();
              }}
            >
              <Text style={{ 
                color: getContrastText(theme.primary, isDarkMode, theme),
                fontWeight: '600',
                fontSize: 16
              }}>
                Create New Note
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setShowSearchModal(false)}
        >
          <View 
            style={{
              width: '85%',
              backgroundColor: theme.card,
              borderRadius: 16,
              padding: 20,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <Text style={{ 
              fontSize: 18,
              fontWeight: '600',
              color: theme.text,
              marginBottom: 15
            }}>
              Search Notes
            </Text>
            
            <View style={{
              flexDirection: 'row',
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 8,
              paddingHorizontal: 10,
              marginBottom: 15
            }}>
              <TextInput
                style={{
                  flex: 1,
                  height: 40,
                  color: theme.text
                }}
                placeholder="Search in notes..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
                returnKeyType="search"
                onSubmitEditing={() => {
                  if (searchQuery.trim()) {
                    setIsSearchActive(true);
                    setShowSearchModal(false);
                    showSuccess(`Searching for: "${searchQuery}"`);
                  }
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={{ justifyContent: 'center' }}
                  onPress={() => setSearchQuery('')}
                >
                  <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
                onPress={() => {
                  setShowSearchModal(false);
                }}
              >
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: theme.primary,
                  opacity: searchQuery.trim() ? 1 : 0.5
                }}
                onPress={() => {
                  if (searchQuery.trim()) {
                    setIsSearchActive(true);
                    setShowSearchModal(false);
                    showSuccess(`Searching for: "${searchQuery}"`);
                  } else {
                    // Don't activate search if query is empty
                    setIsSearchActive(false);
                    setShowSearchModal(false);
                  }
                }}
                disabled={!searchQuery.trim()}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Search</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default React.memo(NotesSection);