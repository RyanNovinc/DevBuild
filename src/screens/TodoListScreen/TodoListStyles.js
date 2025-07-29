// src/screens/TodoListScreen/TodoListStyles.js
// Modernized styles for the TodoListScreen components
import { StyleSheet, Dimensions, Platform } from 'react-native';

// Get screen dimensions for responsive layout
const { width, height } = Dimensions.get('window');

// Define shadow styles based on platform
const elevation = (level) => {
  return Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: level * 0.5 },
      shadowOpacity: 0.1 + level * 0.03,
      shadowRadius: level * 0.8,
    },
    android: {
      elevation: level,
    }
  });
};

export const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  header: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 20,
    ...elevation(3),
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Main toggle styles
  mainToggle: {
    flexDirection: 'row',
    borderRadius: 25,
    padding: 3,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    ...elevation(3),
    overflow: 'hidden', // Ensure background stays within rounded borders
    alignItems: 'center',
    justifyContent: 'center', // Updated: better centering
  },
  mainToggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 0, // Removed horizontal padding to maximize space
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Tab styles
  tabBar: {
    flexDirection: 'row',
    position: 'relative',
    marginBottom: 15,
    ...elevation(2),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10, // Added padding to keep tabs within screen
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderRadius: 1.5,
  },
  tab: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5, // Reduced horizontal padding
  },
  tabText: {
    fontSize: 15, // Slightly smaller font size
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 15,
  },
  
  // Input styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    ...elevation(4),
    height: 58,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingVertical: 10,
  },
  inputIcon: {
    marginRight: 10,
    padding: 5,
  },
  addTextButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000', // Black background
    borderColor: 'rgba(255, 255, 255, 0.3)', // Subtle white outline
    borderWidth: 0.5, // Thin border
    ...elevation(5),
  },
  addTextButtonText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#FFFFFF', // White text
  },
  
  // Add Group UI
  addGroupContainer: {
    marginBottom: 15,
    flexDirection: 'row',
    backgroundColor: 'transparent', // Explicitly transparent
  },
  addGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  floatingGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addGroupText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  addGroupInputContainer: {
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    ...elevation(4),
  },
  addGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  addGroupInput: {
    fontSize: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 5,
  },
  addGroupActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  addGroupCancel: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    marginRight: 10,
  },
  addGroupCancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addGroupConfirm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
  },
  addGroupConfirmText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Group UI
  groupContainer: {
    marginBottom: 16,
    borderRadius: 12,
    ...elevation(2),
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
  },
  groupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupTitleContainer: {
    flex: 1,
    paddingVertical: 6,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  groupRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childCount: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    minWidth: 30,
    textAlign: 'center',
  },
  deleteGroupButton: {
    padding: 8,
  },
  expandButton: {
    padding: 8,
  },
  checkboxContainer: {
    marginRight: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  groupChildren: {
    marginTop: 8,
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 10,
    borderLeftWidth: 1,
    marginLeft: 12,
  },
  childTodoItem: {
    marginLeft: 0,
  },
  emptyGroupText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 10,
    paddingLeft: 8,
  },
  addToGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  addToGroupText: {
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '500',
  },
  todoList: {
    flex: 1,
  },
  
  // Transparent button styles
  transparentActionsContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
    backgroundColor: 'transparent', // Completely transparent
    zIndex: 100, // Ensure it floats above content
  },
  transparentActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'transparent', // Completely transparent
  },
  transparentButton: {
    backgroundColor: '#000000', // Black background
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Transparent white for subtlety
    borderWidth: 0.5, // Thinner border (0.5px)
    marginHorizontal: 5, // Add some margin between buttons
    ...elevation(6),
  },
  transparentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF', // White text for better contrast on dark background
  },
  
  // Notes and Folders styles
  foldersSection: {
    marginBottom: 20,
  },
  folderSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  folderSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  folderViewToggle: {
    padding: 8,
  },
  folderScrollContainer: {
    marginBottom: 15,
    maxHeight: 54,
  },
  folderScrollContent: {
    paddingRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
    ...elevation(2),
  },
  folderChipText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 6,
    maxWidth: 120,
  },
  folderColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  folderCountBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  folderCountText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  addFolderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    ...elevation(1),
  },
  addFolderText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  
  // List view styles for folders
  folderListContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    maxHeight: 250, // Limit the height to prevent taking over the screen
    ...elevation(3),
  },
  folderListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  folderListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  folderListIcon: {
    marginRight: 12,
  },
  folderListColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 12,
  },
  folderListItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  folderListItemRight: {
    alignItems: 'flex-end',
  },
  folderListDateText: {
    fontSize: 12,
    marginBottom: 2,
  },
  folderListCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  folderListAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 10,
  },
  folderListAddButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  addFolderInputContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...elevation(4),
  },
  addFolderInput: {
    fontSize: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 5,
  },
  addFolderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  addFolderCancel: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 10,
  },
  addFolderCancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addFolderConfirm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  addFolderConfirmText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteFolderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  noteFolderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  noteFolderName: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  
  // Note Actions Container
  noteActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 16,
    flex: 1,
    ...elevation(4),
  },
  addNoteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Clear All Notes Button
  clearAllNotesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginLeft: 12,
    ...elevation(3),
  },
  clearAllNotesText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  notesList: {
    flex: 1,
  },
  noteItem: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...elevation(3),
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  noteTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  noteDate: {
    fontSize: 12,
    marginLeft: 10,
  },
  notePreview: {
    fontSize: 14,
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  
  // Actions Container
  actionsContainer: {
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  exportActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 5,
    minWidth: 100,
    ...elevation(2),
  },
  exportButtonText: {
    fontWeight: '600',
    marginLeft: 6,
  },
  exportButtonTextLight: {
    fontWeight: '600',
    marginLeft: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    ...elevation(2),
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Edit modal styles
  editModalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editModalContainer: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    ...elevation(8),
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  editModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editModalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
    ...elevation(2),
  },
  editModalButtonText: {
    fontWeight: '600',
  },
  editModalButtonTextLight: {
    fontWeight: '600',
  },
  
  // Full-screen note styles
  fullScreenNoteContainer: {
    flex: 1,
  },
  fullScreenNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    ...elevation(3),
  },
  fullScreenNoteBackButton: {
    padding: 8,
    marginRight: 8,
  },
  fullScreenNoteHeaderInfo: {
    flex: 1,
    marginRight: 8,
  },
  fullScreenNoteHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  fullScreenNoteDate: {
    fontSize: 12,
  },
  keyboardToggleButton: {
    padding: 8,
    marginRight: 8,
  },
  fullScreenNoteSaveButton: {
    padding: 8,
  },
  noteFolderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  noteFolderLabel: {
    fontSize: 14,
    marginRight: 10,
  },
  noteFolderPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    justifyContent: 'space-between',
    minWidth: 120,
  },
  fullScreenNoteEditContent: {
    flex: 1,
  },
  
  // Enhanced scroll view for better scrolling experience
  fullScreenNoteScrollView: {
    flex: 1,
  },
  fullScreenNoteContentContainer: {
    padding: 20,
    paddingBottom: 100, // Extra padding at the bottom for better scrolling
    minHeight: '100%', // Ensures content fills at least the full height
  },
  fullScreenNoteTitleInput: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  fullScreenNoteContentInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 300,
    textAlignVertical: 'top',
  },
  
  // Extra padding view to ensure scroll works well
  noteScrollPadding: {
    height: 100, // Extra space at the bottom of the scroll content
  },
  fullScreenNoteActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  fullScreenActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  fullScreenActionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  
  // Todo Counter
  counterContainer: {
    position: 'absolute',
    bottom: 5,
    right: 10,
    backgroundColor: 'transparent',
  },
  counterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Tally counter styles
  tallyContainer: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  tallyText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Todo Item Styles
  todoItem: {
    marginBottom: 8,
  },
  todoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
  },
  todoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  
  // Extra padding for keyboard
  keyboardPadding: {
    height: 200,
  },
  
  // Note tags styles
  noteTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginBottom: 2,
  },
  noteTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
  },
  noteTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteTagFilterContainer: {
    marginBottom: 15,
  },
  tagFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagFilterTitle: {
    fontSize: 14,
    fontWeight: '600',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagFilterTitleIcon: {
    marginRight: 6,
  },
  tagFilterScroll: {
    maxHeight: 36,
  },
  fullScreenTagsSection: {
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  fullScreenTagsHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  tagsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagsSectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
});