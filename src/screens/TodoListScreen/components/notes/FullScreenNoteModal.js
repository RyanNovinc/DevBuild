// src/screens/TodoListScreen/components/notes/FullScreenNoteModal.js
import React, { useRef, useState, useEffect } from 'react';
import FeatureExplorerTracker from '../../../../services/FeatureExplorerTracker';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Modal,
  SafeAreaView,
  Alert,
  Keyboard,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Share, Clipboard } from 'react-native';
import NoteTagsManager from './NoteTagsManager';
import TagsDisplay from './TagsDisplay';

/**
 * FullScreenNoteModal component with inline tags in folder row
 */
const FullScreenNoteModal = ({
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
  isKeyboardVisible,
  noteFolders,
  notes,
  setNotes,
  theme,
  showSuccess
}) => {
  // Get window dimensions for fixed positioning
  const { width, height } = Dimensions.get('window');
  
  // Check if theme is dark mode
  const isDarkMode = theme.background === '#000000';
  
  // Local state for scroll position to prevent auto-adjustment
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // State for tags and tag editor
  const [noteTags, setNoteTags] = useState([]);
  const [isTagEditorVisible, setIsTagEditorVisible] = useState(false);
  
  // Track original note content for change detection
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalTags, setOriginalTags] = useState([]);
  
  // Create a single temporary ID for the entire lifetime of the modal
  const tempIdRef = useRef(`temp_${Date.now()}`);
  
  // Initialize the temporary note when creating a new note
  useEffect(() => {
    if (showFullScreenNote && isCreatingNote) {
      const tempId = tempIdRef.current;
      
      // Create a new temporary note
      const tempNote = {
        id: Date.now().toString(),
        _tempId: tempId,
        title: editNoteTitle || '',
        content: editNoteContent || '',
        tags: [],
        folderId: editingNote?.folderId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Update the editingNote reference
      setEditingNote(tempNote);
      
      // Add to notes array (removing any previous temp notes first)
      setNotes(prevNotes => {
        const filteredNotes = prevNotes.filter(note => !note._tempId);
        return [tempNote, ...filteredNotes];
      });
    }
  }, [showFullScreenNote, isCreatingNote]);
  
  // Initialize tags when note changes
  useEffect(() => {
    if (editingNote) {
      const tags = editingNote.tags || [];
      setNoteTags(tags);
      setOriginalTags(tags);
    }
  }, [editingNote]);
  
  // Set original values when the note is first loaded
  useEffect(() => {
    if (showFullScreenNote) {
      setOriginalTitle(editNoteTitle);
      setOriginalContent(editNoteContent);
    }
  }, [showFullScreenNote, editNoteTitle, editNoteContent]);
  
  // Update temp note when title or content changes
  useEffect(() => {
    if (isCreatingNote && editingNote && editingNote._tempId) {
      const tempId = editingNote._tempId;
      
      // Use a timeout to avoid too many updates
      const timeoutId = setTimeout(() => {
        // Update notes array with current content
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note._tempId === tempId ? {
              ...note,
              title: editNoteTitle,
              content: editNoteContent,
              updatedAt: new Date().toISOString()
            } : note
          )
        );
        
        // Also update editingNote reference
        setEditingNote(prev => ({
          ...prev,
          title: editNoteTitle,
          content: editNoteContent,
          updatedAt: new Date().toISOString()
        }));
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [editNoteTitle, editNoteContent, isCreatingNote, editingNote]);
  
  // Check if note has been modified
  const hasUnsavedChanges = () => {
    // For new notes, only consider it changed if there's actual content
    if (isCreatingNote) {
      return editNoteTitle.trim() !== '' || editNoteContent.trim() !== '' || noteTags.length > 0;
    }
    
    // For existing notes, check if content differs from original
    const tagsChanged = noteTags.length !== originalTags.length || 
                        noteTags.some(tag => !originalTags.includes(tag));
    
    return editNoteTitle !== originalTitle || 
           editNoteContent !== originalContent || 
           tagsChanged;
  };
  
  // Refs
  const scrollViewRef = useRef(null);
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  
  // Show tag editor modal
  const showTagEditor = () => {
    // Hide keyboard first to prevent layout issues
    Keyboard.dismiss();
    setTimeout(() => {
      setIsTagEditorVisible(true);
    }, 100);
  };
  
  // Handle tag changes from the tag manager
  const handleTagsChange = (updatedTags) => {
    // Just update local state - this is called for batch changes
    setNoteTags(updatedTags);
  };
  
  // Handle immediate tag updates (add/remove)
  const handleTagAddedOrRemoved = (tagName, updatedTags, isRemove = false) => {
    // Update local state
    setNoteTags(updatedTags);
    
    // Only proceed if we have a valid editingNote
    if (!editingNote) return;
    
    try {
      // Create updated note with new tags
      const updatedNote = {
        ...editingNote,
        tags: updatedTags,
        updatedAt: new Date().toISOString()
      };
      
      // Update the editingNote reference
      setEditingNote(updatedNote);
      
      // If creating a new note, update the temporary note
      if (isCreatingNote) {
        const tempId = updatedNote._tempId;
        
        if (!tempId) return;
        
        // Update in notes array
        setNotes(prevNotes => {
          const tempNoteExists = prevNotes.some(note => note._tempId === tempId);
          
          if (tempNoteExists) {
            // Update existing temporary note
            return prevNotes.map(note => 
              note._tempId === tempId ? {
                ...note,
                tags: updatedTags,
                updatedAt: new Date().toISOString()
              } : note
            );
          } else {
            // Create a new temporary note if none exists yet
            const newTempNote = {
              ...updatedNote,
              _tempId: tempId,
              tags: updatedTags,
              updatedAt: new Date().toISOString()
            };
            
            const filteredNotes = prevNotes.filter(note => !note._tempId);
            return [newTempNote, ...filteredNotes];
          }
        });
      }
      // For existing notes, update in the notes array
      else if (editingNote.id) {
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === editingNote.id ? {
              ...note,
              tags: updatedTags,
              updatedAt: new Date().toISOString()
            } : note
          )
        );
      }
    } catch (error) {
      console.error('Error updating tags:', error);
    }
  };
  
  // Handle saving the note
  const handleSaveNote = () => {
  if (!editNoteTitle.trim() && !editNoteContent.trim() && noteTags.length === 0) {
    if (isCreatingNote) {
      closeNoteEditor(); // Just close without warning for empty new notes
      return;
    } else {
      showSuccess('Note cannot be empty', { type: 'warning' });
      return;
    }
  }
  
  try {
    const updatedNote = {
      ...editingNote,
      title: editNoteTitle.trim() || 'Untitled Note',
      content: editNoteContent.trim(),
      tags: noteTags,
      updatedAt: new Date().toISOString()
    };
    
    // Remove temporary ID if present
    if (updatedNote._tempId) {
      delete updatedNote._tempId;
    }
    
    if (isCreatingNote) {
      // Replace any temporary note with the permanent one
      setNotes(prevNotes => {
        const filtered = prevNotes.filter(note => !note._tempId);
        return [updatedNote, ...filtered];
      });
      showSuccess('Note created');
      
      // Track note creation for achievement
      try {
        FeatureExplorerTracker.trackNoteCreation(updatedNote, showSuccess);
      } catch (trackingError) {
        console.error('Error tracking note creation achievement:', trackingError);
        // Silently handle tracking errors without affecting main functionality
      }
    } else {
      // Update existing note
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === editingNote.id ? updatedNote : note
        )
      );
      showSuccess('Note updated');
    }
    
    closeNoteEditor();
  } catch (error) {
    console.error('Error saving note:', error);
    showSuccess('Error saving note', { type: 'error' });
  }
};
  
  // Handle canceling note edit with confirmation dialog if needed
  const handleCancelNote = () => {
    // Check if there are unsaved changes
    if (hasUnsavedChanges()) {
      Alert.alert(
        "Discard Changes",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Keep Editing", style: "cancel" },
          { 
            text: "Discard", 
            style: "destructive",
            onPress: () => {
              closeNoteEditor();
            }
          }
        ]
      );
    } else {
      // No changes, just close
      closeNoteEditor();
    }
  };
  
  // Close the note editor without confirmation
  const closeNoteEditor = () => {
    try {
      // Remove any temporary notes
      if (isCreatingNote) {
        setNotes(prevNotes => prevNotes.filter(note => !note._tempId));
      }
      
      // Reset all state
      setEditingNote(null);
      setEditNoteTitle('');
      setEditNoteContent('');
      setNoteTags([]);
      setShowFullScreenNote(false);
      setIsCreatingNote(false);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error closing note editor:', error);
    }
  };
  
  // Format date for display
  const formatNoteDate = (dateString) => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (diffInHours < 24) {
      return `Today ${timeString}`;
    } else if (diffInHours < 48) {
      return `Yesterday ${timeString}`;
    } else {
      return date.toLocaleDateString() + ' ' + timeString;
    }
  };
  
  // Get contrast text color based on background
  const getContrastText = (backgroundColor) => {
    if (backgroundColor === '#FFFFFF' && isDarkMode) {
      return '#000000';
    }
    
    if (backgroundColor === '#000000') {
      return '#FFFFFF';
    }
    
    // Calculate brightness
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };
  
  // Delete the current note
  const deleteNote = () => {
    if (editingNote) {
      // For new empty notes, just close without confirmation
      if (isCreatingNote && !editNoteTitle.trim() && !editNoteContent.trim() && noteTags.length === 0) {
        closeNoteEditor();
        return;
      }
      
      Alert.alert(
        "Delete Note",
        "Are you sure you want to delete this note?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Delete", 
            style: "destructive",
            onPress: () => {
              if (isCreatingNote) {
                // Remove any temporary notes
                setNotes(prevNotes => prevNotes.filter(note => !note._tempId));
                closeNoteEditor();
              } else {
                setNotes(notes.filter(note => note.id !== editingNote.id));
                closeNoteEditor();
                showSuccess('Note deleted');
              }
            }
          }
        ]
      );
    }
  };

  // Copy note to clipboard
  const copyNoteToClipboard = () => {
    const noteText = `${editNoteTitle}\n\n${editNoteContent}`;
    Clipboard.setString(noteText);
    showSuccess('Note copied to clipboard!');
  };

  // Share note
  const shareNote = () => {
    const noteText = `${editNoteTitle}\n\n${editNoteContent}`;
    Share.share({
      message: noteText,
      title: editNoteTitle || 'My Note'
    });
  };
  
  return (
    <Modal
      visible={showFullScreenNote}
      animationType="slide"
      transparent={false}
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={[localStyles.container, { backgroundColor: theme.background }]}>
        {/* Static Header - Fixed position */}
        <View style={[localStyles.header, { 
          borderBottomColor: theme.border,
          backgroundColor: theme.background
        }]}>
          <TouchableOpacity
            style={localStyles.backButton}
            onPress={handleCancelNote}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <View style={localStyles.headerInfo}>
            <Text style={[localStyles.headerTitle, { color: theme.text }]}>
              {isCreatingNote ? 'New Note' : 'Edit Note'}
            </Text>
            <Text style={[localStyles.dateText, { color: theme.textSecondary }]}>
              {isCreatingNote ? 'Just now' : formatNoteDate(editingNote?.updatedAt)}
            </Text>
          </View>
          
          {/* Tags Button with counter */}
          <TouchableOpacity
            style={localStyles.iconButton}
            onPress={showTagEditor}
            testID="tag-editor-button"
          >
            <View style={localStyles.tagButtonWrapper}>
              <Ionicons name="pricetags-outline" size={24} color={noteTags.length > 0 ? theme.primary : theme.text} />
              {noteTags.length > 0 && (
                <View style={[localStyles.tagCountBadge, { backgroundColor: theme.primary }]}>
                  <Text style={localStyles.tagCountText}>{noteTags.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          {/* Keyboard Toggle Button */}
          <TouchableOpacity
            style={localStyles.iconButton}
            onPress={() => {
              if (isKeyboardVisible) {
                Keyboard.dismiss();
              } else {
                if (contentInputRef.current) {
                  contentInputRef.current.focus();
                }
              }
            }}
          >
            <Ionicons 
              name={isKeyboardVisible ? "close-circle-outline" : "keypad-outline"} 
              size={24} 
              color={theme.text} 
            />
          </TouchableOpacity>
          
          {/* Save Button */}
          <TouchableOpacity
            style={localStyles.saveButton}
            onPress={handleSaveNote}
          >
            <Ionicons name="checkmark" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
        
        {/* Combined Folder & Tags Row */}
        <View style={[{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          backgroundColor: theme.background,
          zIndex: 9,
          flexWrap: 'wrap'
        }]}>
          {/* Folder Selector - Left Side */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 10
          }}>
            <Text style={[localStyles.folderLabel, { color: theme.textSecondary }]}>
              Folder:
            </Text>
            <TouchableOpacity
              style={[localStyles.folderPicker, { backgroundColor: theme.cardElevated }]}
              onPress={() => {
                const folderOptions = [
                  {
                    text: 'All Notes (no folder)',
                    onPress: () => {
                      // Update both editingNote and temporary note
                      const updatedNote = { ...editingNote, folderId: null };
                      setEditingNote(updatedNote);
                      
                      // Update temp note if creating
                      if (isCreatingNote && updatedNote._tempId) {
                        setNotes(prevNotes => 
                          prevNotes.map(note => 
                            note._tempId === updatedNote._tempId ? updatedNote : note
                          )
                        );
                      }
                    }
                  },
                  ...noteFolders.map(folder => ({
                    text: folder.name,
                    onPress: () => {
                      // Update both editingNote and temporary note
                      const updatedNote = { ...editingNote, folderId: folder.id };
                      setEditingNote(updatedNote);
                      
                      // Update temp note if creating
                      if (isCreatingNote && updatedNote._tempId) {
                        setNotes(prevNotes => 
                          prevNotes.map(note => 
                            note._tempId === updatedNote._tempId ? updatedNote : note
                          )
                        );
                      }
                    }
                  }))
                ];
                
                Alert.alert(
                  'Move to Folder',
                  'Choose a folder:',
                  [...folderOptions, { text: 'Cancel', style: 'cancel' }]
                );
              }}
            >
              <Text style={{ color: theme.text }}>
                {editingNote?.folderId 
                  ? noteFolders.find(f => f.id === editingNote.folderId)?.name 
                  : 'All Notes'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          {/* Tags Display - Right Side (inline with folder) */}
          {noteTags.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={{ 
                flexGrow: 1,
                maxHeight: 40, 
              }}
              contentContainerStyle={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
              testID="note-tags-display-inline"
            >
              <TagsDisplay
                noteTags={noteTags}
                theme={theme}
                readOnly={true}
                small={true}
                inline={true}
                maxTags={5}
              />
            </ScrollView>
          )}
        </View>
        
        {/* Main Content - Fixed layout with forced height */}
        <View style={localStyles.contentContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={localStyles.scrollView}
            contentContainerStyle={[
              localStyles.scrollContent,
              {
                // Force very large content area to ensure plenty of scrollable space
                minHeight: height * 3
              }
            ]}
            scrollEnabled={true}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            showsVerticalScrollIndicator={true}
            // Completely disable all automatic adjustments
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
            scrollIndicatorInsets={{ right: 1 }} // Force custom insets
            directionalLockEnabled={true}
            // Maintain scroll position
            onScroll={(event) => {
              // Store scroll position but don't trigger any adjustments
              setScrollPosition(event.nativeEvent.contentOffset.y);
            }}
            onContentSizeChange={() => {
              // Do nothing on content size change - prevent adjustment
            }}
            onLayout={() => {
              // Do nothing on layout change - prevent adjustment
            }}
            scrollEventThrottle={32}
            // Forced overscroll modes for iOS and Android
            {...(Platform.OS === 'ios' ? { alwaysBounceVertical: true } : {})}
            {...(Platform.OS === 'android' ? { overScrollMode: 'never' } : {})}
          >
            {/* Title Input - Fixed height */}
            <TextInput
              ref={titleInputRef}
              style={[localStyles.titleInput, { color: theme.text }]}
              value={editNoteTitle}
              onChangeText={setEditNoteTitle}
              placeholder="Note title..."
              placeholderTextColor={theme.textSecondary}
              multiline={false}
              numberOfLines={1}
              blurOnSubmit={true}
              onSubmitEditing={() => {
                if (contentInputRef.current) {
                  contentInputRef.current.focus();
                }
              }}
            />
            
            {/* Content Input - Large fixed height */}
            <TextInput
              ref={contentInputRef}
              style={[localStyles.contentInput, { 
                color: theme.text,
              }]}
              value={editNoteContent}
              onChangeText={setEditNoteContent}
              placeholder="Start writing your note..."
              placeholderTextColor={theme.textSecondary}
              multiline={true}
              // Custom props to force behavior
              scrollEnabled={false}
              blurOnSubmit={false}
              contextMenuHidden={false}
              disableFullscreenUI={true}
              textAlignVertical="top"
              onSelectionChange={() => {
                // Explicitly do nothing on selection change to prevent auto-scrolling
              }}
              onContentSizeChange={() => {
                // Explicitly do nothing on content size change to prevent auto-scrolling
              }}
            />
            
            {/* Extra space to ensure scrolling works */}
            <View style={{ height: 1000 }} />
          </ScrollView>
        </View>
        
        {/* Action Buttons - Fixed position */}
        <View style={[localStyles.actionBar, { 
          borderTopColor: theme.border,
          backgroundColor: theme.background
        }]}>
          <TouchableOpacity
            style={[localStyles.actionButton, { backgroundColor: theme.cardElevated }]}
            onPress={copyNoteToClipboard}
          >
            <Ionicons name="copy-outline" size={20} color={theme.text} />
            <Text style={[localStyles.actionButtonText, { color: theme.text }]}>Copy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[localStyles.actionButton, { backgroundColor: theme.primary }]}
            onPress={shareNote}
          >
            <Ionicons 
              name="share-outline" 
              size={20} 
              color={getContrastText(theme.primary)} 
            />
            <Text style={[
              localStyles.actionButtonText, 
              { color: getContrastText(theme.primary) }
            ]}>
              Share
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[localStyles.actionButton, { backgroundColor: theme.error || '#FF3B30' }]}
            onPress={deleteNote}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <Text style={[localStyles.actionButtonText, { color: '#FFFFFF' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
        
        {/* Tag Editor Modal */}
        <Modal
          visible={isTagEditorVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsTagEditorVisible(false)}
        >
          <View style={localStyles.tagEditorOverlay}>
            <View style={[localStyles.tagEditorContainer, { backgroundColor: theme.card }]}>
              <View style={localStyles.tagEditorHeader}>
                <Text style={[localStyles.tagEditorTitle, { color: theme.text }]}>Manage Tags</Text>
                <TouchableOpacity
                  style={localStyles.tagEditorCloseButton}
                  onPress={() => setIsTagEditorVisible(false)}
                >
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>
              
              <NoteTagsManager
                noteTags={noteTags}
                onTagsChange={handleTagsChange}
                onTagAdded={handleTagAddedOrRemoved}
                theme={theme}
                showSuccess={showSuccess}
                maxHeight={300}
              />
              
              <TouchableOpacity
                style={[localStyles.tagEditorDoneButton, { backgroundColor: theme.primary }]}
                onPress={() => setIsTagEditorVisible(false)}
              >
                <Text style={[localStyles.tagEditorDoneText, { color: getContrastText(theme.primary) }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

// Custom local styles completely separate from other styles
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    zIndex: 10, // Keep on top
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
  },
  iconButton: {
    padding: 8,
    marginRight: 4,
  },
  tagButtonWrapper: {
    position: 'relative',
  },
  tagCountBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 8,
  },
  folderLabel: {
    fontSize: 14,
    marginRight: 10,
  },
  folderPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    justifyContent: 'space-between',
    minWidth: 120,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 400, // Huge bottom padding
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    paddingVertical: 8,
    marginBottom: 20,
    borderBottomWidth: 0,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    paddingVertical: 0,
    paddingHorizontal: 0,
    height: 1000, // Very large height - should be more than enough for any note
    textAlignVertical: 'top',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    zIndex: 10, // Keep on top
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Tag Editor Modal Styles
  tagEditorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagEditorContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tagEditorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tagEditorTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tagEditorCloseButton: {
    padding: 4,
  },
  tagEditorDoneButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tagEditorDoneText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default React.memo(FullScreenNoteModal);