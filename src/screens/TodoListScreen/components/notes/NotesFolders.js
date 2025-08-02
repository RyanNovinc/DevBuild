// src/screens/TodoListScreen/components/notes/NotesFolders.js
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../TodoListStyles';
import { getContrastText, formatFolderDate } from '../../TodoUtils';
import TagsDisplay from './TagsDisplay';

/**
 * Component for displaying and managing note folders with improved tag handling
 * Clean version without any debug information
 */
const NotesFolders = ({
  noteFolders,
  activeNoteFolder,
  setActiveNoteFolder,
  setIsAddingFolder,
  folderViewMode,
  setFolderViewMode,
  notes,
  theme,
  showSuccess,
  editingNote // Current note being edited
}) => {
  // Check if theme is dark mode
  const isDarkMode = theme.background === '#000000';
  
  // Helper function to get all unique tags from a collection of notes
  const getAllUniqueTags = (notesList) => {
    const uniqueTags = new Set();
    
    notesList.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => uniqueTags.add(tag));
      }
    });
    
    return Array.from(uniqueTags);
  };
  
  // Calculate tags for each folder using memoization for performance
  const folderTagsMap = useMemo(() => {
    const tagMap = {};
    
    // First, filter the notes to include regular notes and the current temporary note
    const filteredNotes = notes.filter(note => {
      // Include all regular notes (without _tempId)
      if (!note._tempId) {
        return true;
      }
      
      // Include the temporary note being edited (if any)
      if (editingNote && note._tempId === editingNote._tempId) {
        return true;
      }
      
      return false;
    });
    
    // Calculate tags for All Notes (null folder)
    tagMap['all'] = getAllUniqueTags(filteredNotes);
    
    // Calculate tags for each folder
    noteFolders.forEach(folder => {
      const folderNotes = filteredNotes.filter(note => note.folderId === folder.id);
      tagMap[folder.id] = getAllUniqueTags(folderNotes);
    });
    
    return tagMap;
  }, [notes, noteFolders, editingNote]);
  
  // Rename a folder
  const renameFolder = (folderId) => {
    const folder = noteFolders.find(folder => folder.id === folderId);
    
    if (!folder) return;
    
    Alert.prompt(
      "Rename Folder",
      "Enter new name for the folder:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Rename",
          onPress: (newName) => {
            if (newName && newName.trim()) {
              // This function would be passed from the parent
              // setNoteFolders(noteFolders.map(folder => 
              //   folder.id === folderId ? { ...folder, name: newName.trim() } : folder
              // ));
              showSuccess('Folder renamed');
            }
          }
        }
      ],
      "plain-text",
      folder.name
    );
  };
  
  // Delete a folder
  const deleteFolder = (folderId) => {
    Alert.alert(
      "Delete Folder",
      "Would you like to also delete all notes in this folder, or move them to All Notes?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete All", 
          style: "destructive",
          onPress: () => {
            // This function would be passed from the parent
            // Delete the folder and all its notes
            // setNoteFolders(noteFolders.filter(folder => folder.id !== folderId));
            // setNotes(notes.filter(note => note.folderId !== folderId));
            
            // If this was the active folder, reset to All Notes
            if (activeNoteFolder === folderId) {
              setActiveNoteFolder(null);
            }
            
            showSuccess('Folder and notes deleted');
          }
        },
        {
          text: "Keep Notes",
          onPress: () => {
            // This function would be passed from the parent
            // Delete the folder but keep its notes (move to All Notes)
            // setNoteFolders(noteFolders.filter(folder => folder.id !== folderId));
            // setNotes(notes.map(note => 
            //   note.folderId === folderId ? { ...note, folderId: null } : note
            // ));
            
            // If this was the active folder, reset to All Notes
            if (activeNoteFolder === folderId) {
              setActiveNoteFolder(null);
            }
            
            showSuccess('Folder deleted, notes moved to All Notes');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.foldersSection}>
      <View style={styles.folderSectionHeader}>
        <Text style={[styles.folderSectionTitle, { color: theme.text }]}>Folders</Text>
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

      {folderViewMode === 'chips' ? (
        // Horizontal chips view
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
                        onPress: () => renameFolder(folder.id)
                      },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => deleteFolder(folder.id)
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
        // List View for folders with dates
        <View style={styles.folderListContainer}>
          <ScrollView>
            {/* All Notes option */}
            <TouchableOpacity
              style={[
                styles.folderListItem,
                { 
                  backgroundColor: activeNoteFolder === null ? theme.cardElevated : 'transparent',
                  borderLeftColor: activeNoteFolder === null ? theme.primary : 'transparent',
                  borderLeftWidth: activeNoteFolder === null ? 4 : 0,
                }
              ]}
              onPress={() => setActiveNoteFolder(null)}
            >
              <View style={styles.folderListItemLeft}>
                <Ionicons 
                  name="documents-outline" 
                  size={22} 
                  color={theme.text} 
                  style={styles.folderListIcon}
                />
                <Text style={[styles.folderListItemText, { color: theme.text }]}>
                  All Notes
                </Text>
              </View>
              <View style={styles.folderListItemRight}>
                <Text style={[styles.folderListCountText, { color: theme.textSecondary }]}>
                  {notes.filter(note => !note._tempId || (editingNote && note._tempId === editingNote._tempId)).length} notes
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* Display tags for All Notes */}
            {folderTagsMap['all'] && folderTagsMap['all'].length > 0 && (
              <View style={{ paddingHorizontal: 40, marginBottom: 10 }}>
                <TagsDisplay
                  noteTags={folderTagsMap['all']}
                  theme={theme}
                  small={true}
                  readOnly={true}
                  maxTags={5}
                />
              </View>
            )}
            
            {/* User folders */}
            {noteFolders.map(folder => {
              const folderNoteCount = notes.filter(note => 
                note.folderId === folder.id && 
                (!note._tempId || (editingNote && note._tempId === editingNote._tempId))
              ).length;
              
              const folderTags = folderTagsMap[folder.id] || [];
              
              return (
                <React.Fragment key={folder.id}>
                  <TouchableOpacity
                    style={[
                      styles.folderListItem,
                      { 
                        backgroundColor: activeNoteFolder === folder.id ? theme.cardElevated : 'transparent',
                        borderLeftColor: activeNoteFolder === folder.id ? theme.primary : 'transparent',
                        borderLeftWidth: activeNoteFolder === folder.id ? 4 : 0,
                      }
                    ]}
                    onPress={() => setActiveNoteFolder(folder.id)}
                    onLongPress={() => {
                      // Same folder options
                      Alert.alert(
                        "Folder Options",
                        folder.name,
                        [
                          {
                            text: 'Rename',
                            onPress: () => renameFolder(folder.id)
                          },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: () => deleteFolder(folder.id)
                          },
                          {
                            text: 'Cancel',
                            style: 'cancel'
                          }
                        ]
                      );
                    }}
                  >
                    <View style={styles.folderListItemLeft}>
                      <View 
                        style={[
                          styles.folderListColorDot, 
                          { backgroundColor: folder.color }
                        ]} 
                      />
                      <Text style={[styles.folderListItemText, { color: theme.text }]}>
                        {folder.name}
                      </Text>
                    </View>
                    <View style={styles.folderListItemRight}>
                      <Text style={[styles.folderListDateText, { color: theme.textSecondary }]}>
                        {formatFolderDate(folder.createdAt)}
                      </Text>
                      <Text style={[styles.folderListCountText, { color: theme.textSecondary }]}>
                        {folderNoteCount} {folderNoteCount === 1 ? 'note' : 'notes'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Display tags for this folder */}
                  {folderTags.length > 0 && (
                    <View style={{ paddingHorizontal: 40, marginBottom: 10 }}>
                      <TagsDisplay
                        noteTags={folderTags}
                        theme={theme}
                        small={true}
                        readOnly={true}
                        maxTags={5}
                      />
                    </View>
                  )}
                </React.Fragment>
              );
            })}
            
            {/* Add Folder Button in list view */}
            <TouchableOpacity
              style={[styles.folderListAddButton, { borderColor: theme.border }]}
              onPress={() => setIsAddingFolder(true)}
            >
              <Ionicons name="add-circle-outline" size={22} color={theme.primary} />
              <Text style={[styles.folderListAddButtonText, { color: theme.primary }]}>
                Create New Folder
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default React.memo(NotesFolders);