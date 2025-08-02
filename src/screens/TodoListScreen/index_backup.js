// src/screens/TodoListScreen/index.js - With Material Tab Navigator
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text,
  TouchableOpacity,
  Keyboard, 
  Platform,
  StatusBar,
  Animated,
  BackHandler,
  StyleSheet,
  Easing,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { useNavigation } from '@react-navigation/native';
import { useAppContext } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

// Import Material Top Tab Navigator
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';

// Import responsive utilities
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  useScreenDimensions,
  useSafeSpacing,
  isSmallDevice,
  isTablet,
  accessibility,
  ensureAccessibleTouchTarget
} from '../../utils/responsive';

// Import KeyboardAwareScrollView
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Component imports
import TodoTabs from './components/TodoTabs';
import TodayTab from './components/tabs/TodayTab';
import TomorrowTab from './components/tabs/TomorrowTab';
import LaterTab from './components/tabs/LaterTab';
import NotesSection from './components/notes/NotesSection';
import EditTodoModal from './components/EditTodoModal';
import FullScreenNoteModal from './components/notes/FullScreenNoteModal';
import TodoButtonOverlay from './components/TodoButtonOverlay';

// Utility imports
import { styles as originalStyles } from './TodoListStyles';
import {
  loadTodos,
  loadNotes,
  loadNoteFolders,
  loadExpandedGroups,
  saveTodos,
  saveNotes,
  saveNoteFolders,
  saveExpandedGroups
} from './TodoStorageUtils';

// Create Tab Navigator
const Tab = createMaterialTopTabNavigator();

// Todo limits for free users
const TODO_LIMITS = {
  TODAY: 10,
  TOMORROW: 7,
  LATER: 5
};

/**
 * TodoTab - Component for rendering todo tab content
 */
const TodoTab = (props) => {
  const { theme, todoProps, activeTab, handleTabChange, tabIndicatorPosition } = props;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const { width } = useScreenDimensions();
  const safeSpacing = useSafeSpacing();

  // Remove problematic animation that causes flashing
  // useEffect(() => {
  //   // This was causing screen flashing when activeTab changed
  // }, [activeTab]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Sub-tabs for To-Do */}
      <TodoTabs 
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        theme={theme}
        tabIndicatorPosition={tabIndicatorPosition}
      />
      
      {/* Main Todo Content */}
      <View 
        style={[
          originalStyles.contentContainer,
          {
            flex: 1,
          }
        ]}
      >
        {/* Todo Tab Content */}
        <View style={[originalStyles.tabContent, { flex: 1 }]}>
          {activeTab === 'today' && <TodayTab {...todoProps} />}
          {activeTab === 'tomorrow' && <TomorrowTab {...todoProps} />}
          {activeTab === 'later' && <LaterTab {...todoProps} />}
        </View>
      </View>
      
      {/* Button Overlay - Reduce animation triggers */}
      {!todoProps.isKeyboardVisible && !todoProps.isAddingSubtask && (
        <View style={{ 
          paddingBottom: safeSpacing.bottom
        }}>
          <TodoButtonOverlay
            activeTab={activeTab}
            todos={todoProps.todos}
            setTodos={todoProps.setTodos}
            tomorrowTodos={todoProps.tomorrowTodos}
            setTomorrowTodos={todoProps.setTomorrowTodos}
            laterTodos={todoProps.laterTodos}
            setLaterTodos={todoProps.setLaterTodos}
            isAddingSubtask={todoProps.isAddingSubtask}
            moveIncompleteTodosToTomorrow={todoProps.moveIncompleteTodosToTomorrow}
            moveTomorrowTodosToToday={todoProps.moveTomorrowTodosToToday}
            moveLaterItemsToTomorrow={todoProps.moveLaterItemsToTomorrow}
            theme={theme}
            showSuccess={props.showSuccess}
            canAddMoreTodos={todoProps.canAddMoreTodos}
            showFeatureLimitBanner={todoProps.showFeatureLimitBanner}
          />
        </View>
      )}
    </View>
  );
};

/**
 * NotesTab - Component for rendering notes tab content
 */
const NotesTab = (props) => {
  const { theme, notesProps } = props;
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const safeSpacing = useSafeSpacing();

  useEffect(() => {
    // Animate the content opacity when screen changes
    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View 
        style={[
          originalStyles.contentContainer,
          {
            flex: 1,
            paddingHorizontal: safeSpacing.left > spacing.m ? safeSpacing.left - spacing.s : spacing.m
          }
        ]}
      >
        {/* Notes Content */}
        <NotesSection {...notesProps} />
      </View>
    </View>
  );
};

/**
 * TodoListScreen - Main container with Material Top Tab Navigator for the Todo and Notes functionality
 */
const TodoListScreen = () => {
  // Context hooks
  const { theme } = useTheme();
  const { showSuccess } = useNotification();
  const navigation = useNavigation();
  const appContext = useAppContext();
  
  // Responsive utilities
  const { width, height } = useScreenDimensions();
  const safeSpacing = useSafeSpacing();
  const insets = useSafeSpacing();
  
  // Check if using dark mode
  const isDarkMode = theme.background === '#000000' || theme.background.toLowerCase() === '#121212';
  
  // Main tab state for Todo/Notes
  const [mainActiveTab, setMainActiveTab] = useState('TODO'); // 'TODO' or 'NOTES'
  
  // Todo state
  const [todos, setTodos] = useState([]);
  const [tomorrowTodos, setTomorrowTodos] = useState([]);
  const [laterTodos, setLaterTodos] = useState([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTomorrowTodoText, setNewTomorrowTodoText] = useState('');
  const [newLaterTodoText, setNewLaterTodoText] = useState('');
  const [activeTab, setActiveTab] = useState('today'); // 'today', 'tomorrow', or 'later'
  
  // Notes state
  const [notes, setNotes] = useState([]);
  const [noteFolders, setNoteFolders] = useState([]);
  const [activeNoteFolder, setActiveNoteFolder] = useState(null); // null means "All Notes"
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Todo editing state
  const [editingTodo, setEditingTodo] = useState(null);
  const [editText, setEditText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Note editing state
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [showFullScreenNote, setShowFullScreenNote] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [folderViewMode, setFolderViewMode] = useState('chips'); // 'chips' or 'list'
  
  // UI state
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [keyboardShowing, setKeyboardShowing] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  
  // Add state for tracking UI interactions to prevent flashing
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // Add state for upgrade modal (similar to IncomeTab)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  
  // Extract subscription status from AppContext
  const isPro = appContext?.userSubscriptionStatus === 'pro' || 
                appContext?.userSubscriptionStatus === 'unlimited' || false;
  
  // Refs for inputs
  const editInputRef = useRef(null);
  const editNoteTitleRef = useRef(null);
  const editNoteContentRef = useRef(null);
  const noteScrollViewRef = useRef(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  // Set initial tab without remounting
  useFocusEffect(
    React.useCallback(() => {
      setMainActiveTab('TODO');
      // No need to remount - just set the tab
    }, [])
  );
  
  // Track tab change - NEVER dismiss keyboard
  const handleTabChange = (tabName) => {
    // Simple tab switching without keyboard interference
    setMainActiveTab(tabName);
    
    // Update route params at the ROOT tab navigator level
    const currentView = tabName === 'TODO' ? 'todo' : 'notes';
    
    // Get the parent navigator
    const rootNavigation = navigation.getParent();
    if (rootNavigation) {
      rootNavigation.setParams({ currentView });
    }
  };

  // Handle back button press
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (showFullScreenNote) {
          // Close note modal if it's open
          setShowFullScreenNote(false);
          return true;
        }
        if (isEditing) {
          // Cancel editing if in edit mode
          setIsEditing(false);
          setEditingTodo(null);
          setEditText('');
          return true;
        }
        return false;
      };

      // Safe way to add the event listener
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Return a function that calls remove on the subscription
      return () => subscription.remove();
    }, [showFullScreenNote, isEditing])
  );
  
  // ----------------
  // SIMPLIFIED KEYBOARD HANDLING - PREVENTS FLASHING
  // ----------------
  useEffect(() => {
    let keyboardTimeout = null;
    
    const keyboardDidShowHandler = () => {
      if (keyboardTimeout) clearTimeout(keyboardTimeout);
      setIsKeyboardVisible(true);
      setKeyboardShowing(true);
      
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    };
    
    const keyboardDidHideHandler = () => {
      if (keyboardTimeout) clearTimeout(keyboardTimeout);
      
      // Delay to prevent flashing when switching inputs
      keyboardTimeout = setTimeout(() => {
        setIsKeyboardVisible(false);
        setKeyboardShowing(false);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 100);
    };
    
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', keyboardDidShowHandler);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', keyboardDidHideHandler);
    
    return () => {
      if (keyboardTimeout) clearTimeout(keyboardTimeout);
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Update StatusBar based on theme
  useEffect(() => {
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
  }, [isDarkMode]);
  
  // Load data from storage on mount and when screen is focused
  useEffect(() => {
    const loadData = async () => {
      try {
        // Show content animation
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }).start();
      
        const todosData = await loadTodos();
        setTodos(todosData.today || []);
        setTomorrowTodos(todosData.tomorrow || []);
        setLaterTodos(todosData.later || []);
        
        const notesData = await loadNotes();
        setNotes(notesData || []);
        
        const foldersData = await loadNoteFolders();
        setNoteFolders(foldersData || []);
        
        const expandedData = await loadExpandedGroups();
        setExpandedGroups(expandedData || {});
        
        // Fade in content after data is loaded
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Error loading data:', error);
        showSuccess('Error loading data', { type: 'error' });
      }
    };
    
    loadData();
    
    // Add navigation focus listener to reload data when the screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Todo screen focused, reloading data');
      loadData();
    });
    
    // Clean up listener on unmount
    return () => {
      unsubscribe();
    };
  }, [navigation]);
  
  // Save todos to storage whenever they change
  useEffect(() => {
    saveTodos(todos, tomorrowTodos, laterTodos);
  }, [todos, tomorrowTodos, laterTodos]);
  
  // Save notes to storage whenever they change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Save note folders to storage whenever they change
  useEffect(() => {
    saveNoteFolders(noteFolders);
  }, [noteFolders]);
  
  // Save expanded groups state whenever it changes
  useEffect(() => {
    saveExpandedGroups(expandedGroups);
  }, [expandedGroups]);

  // No need for aggressive keyboard dismissal on blur
  // The keyboard will dismiss naturally when needed

  // Handle tab changes with smooth animation (for sub-tabs within Todo)
  const handleSubTabChange = (tab) => {
    if (tab === activeTab) return;
    
    // Simplified tab switching - no keyboard dismissing
    const tabIndex = tab === 'today' ? 0 : tab === 'tomorrow' ? 1 : 2;
    
    // Simple animation without complex state management
    Animated.timing(tabIndicatorPosition, {
      toValue: tabIndex,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    // Update the active tab immediately
    setActiveTab(tab);
  };

  // Calculate the weighted count of todos (groups count as 0.5, todos as 1)
  const calculateWeightedTodoCount = (todosList) => {
    if (!Array.isArray(todosList)) return 0;
    
    let count = 0;
    
    // Count regular todos (each counts as 1)
    todosList.forEach(item => {
      if (!item.isGroup) {
        count += 1;
      }
    });
    
    // Count groups (each counts as 0.5)
    todosList.forEach(item => {
      if (item.isGroup) {
        count += 0.5;
      }
    });
    
    return count;
  };

  // Check if user can add more todos to a specific tab
  const canAddMoreTodos = (tab, isGroup = false) => {
    // Pro users have unlimited todos
    if (isPro) return true;
    
    let currentTodos = [];
    let limit = 0;
    
    // Determine which list to check and the limit
    switch (tab) {
      case 'today':
        currentTodos = todos;
        limit = TODO_LIMITS.TODAY;
        break;
      case 'tomorrow':
        currentTodos = tomorrowTodos;
        limit = TODO_LIMITS.TOMORROW;
        break;
      case 'later':
        currentTodos = laterTodos;
        limit = TODO_LIMITS.LATER;
        break;
      default:
        return false;
    }
    
    // Calculate current weighted count
    const currentCount = calculateWeightedTodoCount(currentTodos);
    
    // Calculate how much adding the new item would increase the count
    const increase = isGroup ? 0.5 : 1;
    
    // Check if adding the new item would exceed the limit
    return (currentCount + increase) <= limit;
  };

  // Show upgrade modal (similar to IncomeTab)
  const showUpgradePrompt = (message) => {
    setUpgradeMessage(message);
    setShowUpgradeModal(true);
  };
  
  // Navigate to pricing screen
  const goToPricingScreen = () => {
    setShowUpgradeModal(false);
    navigation.navigate('PricingScreen');
  };

  // UPDATED: Show feature limit banner with enhanced visibility
  const showFeatureLimitBanner = (message) => {
    // Instead of showing the banner, show the modal
    showUpgradePrompt(message);
  };

  // Update input focus tracking for better keyboard handling
  const updateInputFocus = (isFocused) => {
    setIsInputFocused(isFocused);
  };

  // Add a new todo - Modified to accept custom text and check limits
  const addTodo = (tab = null, groupId = null, customText = null) => {
    const targetTab = tab || activeTab;
    
    // Check if user can add more todos
    if (!canAddMoreTodos(targetTab, false)) {
      // Show limit modal
      let limitMessage = '';
      switch (targetTab) {
        case 'today':
          limitMessage = `You've reached the limit of ${TODO_LIMITS.TODAY} items in Today tab. Upgrade to Pro for unlimited todos.`;
          break;
        case 'tomorrow':
          limitMessage = `You've reached the limit of ${TODO_LIMITS.TOMORROW} items in Tomorrow tab. Upgrade to Pro for unlimited todos.`;
          break;
        case 'later':
          limitMessage = `You've reached the limit of ${TODO_LIMITS.LATER} items in Later tab. Upgrade to Pro for unlimited todos.`;
          break;
      }
      
      showUpgradePrompt(limitMessage);
      return;
    }
    
    let todoText = '';
    let setTextFunc = null;
    let currentTodos = [];
    let setTodosFunc = null;
    
    // Determine which list to add to and which text to use
    switch (targetTab) {
      case 'today':
        todoText = customText || newTodoText;
        setTextFunc = setNewTodoText;
        currentTodos = todos;
        setTodosFunc = setTodos;
        break;
      case 'tomorrow':
        todoText = customText || newTomorrowTodoText;
        setTextFunc = setNewTomorrowTodoText;
        currentTodos = tomorrowTodos;
        setTodosFunc = setTomorrowTodos;
        break;
      case 'later':
        todoText = customText || newLaterTodoText;
        setTextFunc = setNewLaterTodoText;
        currentTodos = laterTodos;
        setTodosFunc = setLaterTodos;
        break;
    }
    
    if (!todoText || !todoText.trim()) return;
    
    const newTodo = {
      id: Date.now().toString(),
      title: todoText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      groupId: groupId // Add to group if specified
    };
    
    console.log(`Adding todo to ${targetTab}${groupId ? ' in group ' + groupId : ''}:`, newTodo);
    
    setTodosFunc([...currentTodos, newTodo]);
    
    // Only clear input if we used the input field text (not for custom text)
    if (!customText) {
      setTextFunc('');
    }
    
    showSuccess(`To-do added${targetTab !== 'today' ? ` for ${targetTab}` : ''}${groupId ? ' to group' : ''}`);
  };

  // Add a new group - Modified to check limits
  const addGroup = (tab = null, customName = null) => {
    const targetTab = tab || activeTab;
    
    // Check if user can add more groups
    if (!canAddMoreTodos(targetTab, true)) {
      // Show limit modal
      let limitMessage = '';
      switch (targetTab) {
        case 'today':
          limitMessage = `You've reached the limit of ${TODO_LIMITS.TODAY} items in Today tab. Upgrade to Pro for unlimited todos.`;
          break;
        case 'tomorrow':
          limitMessage = `You've reached the limit of ${TODO_LIMITS.TOMORROW} items in Tomorrow tab. Upgrade to Pro for unlimited todos.`;
          break;
        case 'later':
          limitMessage = `You've reached the limit of ${TODO_LIMITS.LATER} items in Later tab. Upgrade to Pro for unlimited todos.`;
          break;
      }
      
      showUpgradePrompt(limitMessage);
      return;
    }
    
    // Use either the provided custom name or the input field value
    const groupName = customName || newGroupName.trim();
    
    if (!groupName) {
      showSuccess('Group name cannot be empty', { type: 'warning' });
      return;
    }
    
    const newGroup = {
      id: `group-${Date.now()}`,
      title: groupName,
      isGroup: true,
      completed: false,
      createdAt: new Date().toISOString(),
      tab: targetTab // Explicitly set the tab for this group
    };
    
    let currentTodos = [];
    let setTodosFunc = null;
    
    // Determine which list to add to
    switch (targetTab) {
      case 'today':
        currentTodos = todos;
        setTodosFunc = setTodos;
        break;
      case 'tomorrow':
        currentTodos = tomorrowTodos;
        setTodosFunc = setTomorrowTodos;
        break;
      case 'later':
        currentTodos = laterTodos;
        setTodosFunc = setLaterTodos;
        break;
    }
    
    setTodosFunc([...currentTodos, newGroup]);
    
    // Auto-expand the new group
    setExpandedGroups(prev => ({
      ...prev,
      [newGroup.id]: true
    }));
    
    // Only clear the input field if we used it (not for custom names)
    if (!customName) {
      setNewGroupName('');
    }
    
    setIsAddingGroup(false);
    showSuccess('Group added');
  };

  // Toggle todo completion
  const toggleTodo = (id, tab = null) => {
    const targetTab = tab || activeTab;
    let todosToUse = [];
    let setTodosFunc = null;
    
    switch (targetTab) {
      case 'today':
        todosToUse = todos;
        setTodosFunc = setTodos;
        break;
      case 'tomorrow':
        todosToUse = tomorrowTodos;
        setTodosFunc = setTomorrowTodos;
        break;
      case 'later':
        todosToUse = laterTodos;
        setTodosFunc = setLaterTodos;
        break;
    }
    
    // Find the todo item
    const todoItem = todosToUse.find(item => item.id === id);
    
    if (!todoItem) return;
    
    // If toggling a group
    if (todoItem.isGroup) {
      // Always toggle the group and all its children
      const childTodos = todosToUse.filter(item => item.groupId === id);
      const newCompletedState = !todoItem.completed;
      
      const updatedTodos = todosToUse.map(item => {
        if (item.id === id) {
          // Toggle the group itself
          return { ...item, completed: newCompletedState };
        } else if (item.groupId === id) {
          // Toggle all items in the group to match the group's state
          return { ...item, completed: newCompletedState };
        }
        return item;
      });
      
      setTodosFunc(updatedTodos);
    } 
    // If toggling an individual todo
    else {
      // Step 1: Toggle the specific todo
      let updatedTodos = todosToUse.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      
      // Step 2: If it belongs to a group, update the group status
      if (todoItem.groupId) {
        // Get all todos in this group AFTER the current todo was updated
        const groupTodos = updatedTodos.filter(item => item.groupId === todoItem.groupId);
        // Check if ALL todos in the group are now completed
        const allCompleted = groupTodos.length > 0 && groupTodos.every(todo => todo.completed);
        
        // Update the group status based on whether all of its children are completed
        updatedTodos = updatedTodos.map(item => 
          item.id === todoItem.groupId ? { ...item, completed: allCompleted } : item
        );
      }
      
      setTodosFunc(updatedTodos);
    }
  };

  // Start editing a todo
  const startEditTodo = (todo, tab = null) => {
    console.log('Editing todo:', todo); // Debug log
    const targetTab = tab || activeTab;
    setEditingTodo({
      ...todo,
      tab: targetTab
    });
    setEditText(todo.title);
    setIsEditing(true);
  };

  // Save the edited todo
  const saveEditedTodo = () => {
    if (!editText.trim()) {
      showSuccess('Todo text cannot be empty', { type: 'warning' });
      return;
    }
    
    if (editingTodo) {
      const targetTab = editingTodo.tab || activeTab;
      let todosToUpdate = [];
      let setTodosFunc = null;
      
      // Determine which list to update
      switch (targetTab) {
        case 'today':
          todosToUpdate = todos;
          setTodosFunc = setTodos;
          break;
        case 'tomorrow':
          todosToUpdate = tomorrowTodos;
          setTodosFunc = setTomorrowTodos;
          break;
        case 'later':
          todosToUpdate = laterTodos;
          setTodosFunc = setLaterTodos;
          break;
      }
      
      // Update the specific todo
      setTodosFunc(
        todosToUpdate.map(todo => 
          todo.id === editingTodo.id ? { ...todo, title: editText.trim() } : todo
        )
      );
      
      console.log('Saved edited todo:', editingTodo.id, editText.trim()); // Debug log
      
      setIsEditing(false);
      setEditingTodo(null);
      setEditText('');
      showSuccess('To-do updated');
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditingTodo(null);
    setEditText('');
  };

  // Create a new note in full-screen mode
  const createNewNote = () => {
    const now = new Date().toISOString();
    const newNote = {
      id: Date.now().toString(),
      title: '',
      content: '',
      createdAt: now,
      updatedAt: now,
      folderId: activeNoteFolder // Assign to current folder if one is selected
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
  
  // Save the edited note
  const saveEditedNote = () => {
    if (!editNoteTitle.trim() && !editNoteContent.trim()) {
      if (isCreatingNote) {
        // If creating a new note and it's empty, just cancel
        cancelEditingNote();
        return;
      } else {
        showSuccess('Note cannot be empty', { type: 'warning' });
        return;
      }
    }
    
    if (editingNote) {
      const updatedNote = {
        ...editingNote,
        title: editNoteTitle.trim() || 'Untitled Note',
        content: editNoteContent.trim(),
        updatedAt: new Date().toISOString(),
        folderId: editingNote.folderId // Preserve folder assignment
      };
      
      if (isCreatingNote) {
        // Add new note to the beginning of the list
        setNotes([updatedNote, ...notes]);
        showSuccess('Note created');
      } else {
        // Update existing note
        setNotes(notes.map(note => 
          note.id === editingNote.id ? updatedNote : note
        ));
        showSuccess('Note updated');
      }
      
      cancelEditingNote();
    }
  };
  
  // Cancel editing note
  const cancelEditingNote = () => {
    setEditingNote(null);
    setEditNoteTitle('');
    setEditNoteContent('');
    setShowFullScreenNote(false);
    setIsCreatingNote(false);
  };

  // Move tomorrow's todos to today without confirmation
  const moveTomorrowTodosToToday = () => {
    if (tomorrowTodos.length === 0) {
      showSuccess('No todos to move', { type: 'warning' });
      return;
    }
    
    // Calculate if this would exceed the today limit for free users
    if (!isPro) {
      const currentTodayCount = calculateWeightedTodoCount(todos);
      const tomorrowCount = calculateWeightedTodoCount(tomorrowTodos);
      
      if ((currentTodayCount + tomorrowCount) > TODO_LIMITS.TODAY) {
        showUpgradePrompt(
          `You've reached the limit of ${TODO_LIMITS.TODAY} items in Today tab. Upgrade to Pro for unlimited todos.`
        );
        return;
      }
    }
    
    setTodos([...todos, ...tomorrowTodos]);
    setTomorrowTodos([]);
    showSuccess(`Tomorrow's to-dos moved to today`);
  };
  
  // Move incomplete today's todos to tomorrow without confirmation
  const moveIncompleteTodosToTomorrow = () => {
    const incompleteTodos = todos.filter(todo => !todo.completed);
    
    if (incompleteTodos.length === 0) {
      showSuccess('No incomplete todos to move', { type: 'warning' });
      return;
    }
    
    // Calculate if this would exceed the tomorrow limit for free users
    if (!isPro) {
      const currentTomorrowCount = calculateWeightedTodoCount(tomorrowTodos);
      const incompleteCount = calculateWeightedTodoCount(incompleteTodos);
      
      if ((currentTomorrowCount + incompleteCount) > TODO_LIMITS.TOMORROW) {
        showUpgradePrompt(
          `You've reached the limit of ${TODO_LIMITS.TOMORROW} items in Tomorrow tab. Upgrade to Pro for unlimited todos.`
        );
        return;
      }
    }
    
    setTomorrowTodos([...tomorrowTodos, ...incompleteTodos]);
    setTodos(todos.filter(todo => todo.completed));
    showSuccess(`Today's incomplete to-dos moved to tomorrow`);
  };

  // Move later items to tomorrow
  const moveLaterItemsToTomorrow = () => {
    if (laterTodos.length === 0) {
      showSuccess('No todos to move', { type: 'warning' });
      return;
    }
    
    // Calculate if this would exceed the tomorrow limit for free users
    if (!isPro) {
      const currentTomorrowCount = calculateWeightedTodoCount(tomorrowTodos);
      const laterCount = calculateWeightedTodoCount(laterTodos);
      
      if ((currentTomorrowCount + laterCount) > TODO_LIMITS.TOMORROW) {
        showUpgradePrompt(
          `You've reached the limit of ${TODO_LIMITS.TOMORROW} items in Tomorrow tab. Upgrade to Pro for unlimited todos.`
        );
        return;
      }
    }
    
    setTomorrowTodos([...tomorrowTodos, ...laterTodos]);
    setLaterTodos([]);
    showSuccess('Later items moved to Tomorrow');
  };

  // Calculate tab indicator position based on activeTab
  const getTabIndicatorPosition = () => {
    return tabIndicatorPosition.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, width / 3, (width / 3) * 2]
    });
  };

  // Common props for both screens
  const commonProps = {
    theme,
    showSuccess,
    isKeyboardVisible: keyboardShowing,
    setIsAddingSubtask,
    fadeAnim,
    updateInputFocus // Add this to track input focus for better keyboard handling
  };
  
  // Props for the todo screen
  const todoProps = {
    ...commonProps,
    todos,
    setTodos,
    tomorrowTodos,
    setTomorrowTodos,
    laterTodos,
    setLaterTodos,
    newTodoText,
    setNewTodoText,
    newTomorrowTodoText,
    setNewTomorrowTodoText,
    newLaterTodoText,
    setNewLaterTodoText,
    activeTab,
    setActiveTab,
    expandedGroups,
    setExpandedGroups,
    isAddingGroup,
    setIsAddingGroup,
    newGroupName,
    setNewGroupName,
    addTodo,
    addGroup,
    toggleTodo,
    startEditTodo,
    moveIncompleteTodosToTomorrow,
    moveTomorrowTodosToToday,
    moveLaterItemsToTomorrow,
    isAddingSubtask,
    canAddMoreTodos,
    calculateWeightedTodoCount,
    showFeatureLimitBanner,
    isTabSwitching // Pass this to prevent UI updates during tab switching
  };
  
  // Props for the notes screen
  const notesProps = {
    ...commonProps,
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
    createNewNote,
    startEditNote,
    saveEditedNote,
    cancelEditingNote,
    isTabSwitching // Pass this to prevent UI updates during tab switching
  };

  // Calculate tab bar indicator width properly for each tab
  const tabBarIndicatorWidth = Math.floor((width - scaleWidth(40)) / 2) - 6;
  
  // TodoTabScreen - For the TODO tab
  const TodoTabScreen = () => (
    <TodoTab
      theme={theme} 
      todoProps={todoProps} 
      activeTab={activeTab}
      handleTabChange={handleSubTabChange}
      tabIndicatorPosition={getTabIndicatorPosition()}
      fadeAnim={fadeAnim}
      showSuccess={showSuccess}
      isKeyboardVisible={keyboardShowing}
      setIsAddingSubtask={setIsAddingSubtask}
    />
  );
  
  // NotesTabScreen - For the NOTES tab
  const NotesTabScreen = () => (
    <NotesTab
      theme={theme} 
      notesProps={notesProps}
      fadeAnim={fadeAnim}
      showSuccess={showSuccess}
      isKeyboardVisible={keyboardShowing}
      setIsAddingSubtask={setIsAddingSubtask}
    />
  );

  // Create a custom tab bar label component that puts icon to the left of text
  const renderTabBarLabel = ({ route, focused, color }) => {
    // Choose icon based on route name
    const iconName = route.name === 'TODO' ? 'checkbox' : 'document-text';
    
    return (
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
      }}>
        <Ionicons 
          name={iconName} 
          size={20} 
          color={color} 
          style={{ marginRight: 6 }} 
        />
        <Text style={{ 
          color, 
          fontWeight: focused ? '700' : '500', 
          fontSize: scaleFontSize(14)
        }}>
          {route.name}
        </Text>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView 
        style={[originalStyles.container, { backgroundColor: theme.background }]}
        edges={['top', 'left', 'right']} // ONLY CHANGE: Exclude bottom edge
      >
        {/* Tab Navigator with Material Top Tabs */}
        <NavigationContainer independent={true}>
          <Tab.Navigator
            initialRouteName="TODO"
            screenOptions={{
              tabBarActiveTintColor: isDarkMode ? '#FFFFFF' : '#000000',
              tabBarInactiveTintColor: theme.textSecondary,
              tabBarStyle: { 
                backgroundColor: theme.cardElevated,
                elevation: 0,
                shadowOpacity: 0,
                borderRadius: scaleWidth(25),
                marginHorizontal: scaleWidth(20),
                marginVertical: scaleHeight(10),
                height: scaleHeight(44),
              },
              tabBarIndicatorStyle: { 
                backgroundColor: theme.primary,
                height: scaleHeight(38),
                borderRadius: scaleWidth(20),
                marginBottom: 3,
                marginLeft: 3,
                width: tabBarIndicatorWidth, // Calculated width for proper fit
                zIndex: 1,
              },
              tabBarItemStyle: {
                paddingVertical: 0,
                height: scaleHeight(38),
                zIndex: 2,
              },
              swipeEnabled: false, // Disable swipe to prevent keyboard dismissal
              animationEnabled: false, // Disable animations to prevent conflicts
              tabBarAllowFontScaling: true,
              tabBarPressOpacity: 0.8,
            }}
            // Remove complex screen listeners that can cause conflicts
          >
            <Tab.Screen 
              name="TODO" 
              component={TodoTabScreen}
              options={{
                tabBarAccessibilityLabel: "To-Do Tab",
                tabBarLabel: ({ focused, color }) => renderTabBarLabel({ 
                  route: { name: 'TODO' }, 
                  focused, 
                  color 
                })
              }}
            />
            <Tab.Screen 
              name="NOTES" 
              component={NotesTabScreen}
              options={{
                tabBarAccessibilityLabel: "Notes Tab",
                tabBarLabel: ({ focused, color }) => renderTabBarLabel({ 
                  route: { name: 'NOTES' }, 
                  focused, 
                  color 
                })
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
        
        {/* Edit Todo Modal - Placed outside of screens to avoid getting hidden */}
        {isEditing && (
          <EditTodoModal 
            editingTodo={editingTodo}
            editText={editText}
            setEditText={setEditText}
            isEditing={isEditing}
            theme={theme}
            showSuccess={showSuccess}
            saveEditedTodo={saveEditedTodo}
            cancelEditing={cancelEditing}
            editInputRef={editInputRef}
          />
        )}
        
        {/* Full-Screen Note Editing Modal - Placed outside of screens */}
        {showFullScreenNote && editingNote && (
          <FullScreenNoteModal 
            {...notesProps}
            notes={notes}
            setNotes={setNotes}
            editNoteTitleRef={editNoteTitleRef}
            editNoteContentRef={editNoteContentRef}
            noteScrollViewRef={noteScrollViewRef}
          />
        )}
        
        {/* Add Upgrade Modal (NEW, from IncomeTab) */}
        <Modal
          visible={showUpgradeModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowUpgradeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.upgradeModal, 
              { 
                backgroundColor: theme.card || theme.background,
                marginTop: insets.top,
                marginBottom: insets.bottom,
                marginLeft: spacing.m,
                marginRight: spacing.m
              }
            ]}>
              <View style={styles.upgradeModalHeader}>
                <Ionicons name="lock-closed" size={scaleWidth(40)} color="#3F51B5" />
                <Text 
                  style={[styles.upgradeModalTitle, { color: theme.text }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Premium Feature
                </Text>
              </View>
              
              <Text 
                style={[styles.upgradeModalMessage, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                {upgradeMessage || "Upgrade to Pro to unlock additional features."}
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.upgradeButton, 
                  { backgroundColor: '#3F51B5' },
                  { minHeight: accessibility.minTouchTarget }
                ]}
                onPress={goToPricingScreen}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Upgrade to Pro"
                accessibilityHint="Opens the pricing screen to upgrade your subscription"
              >
                <Ionicons name="rocket" size={scaleWidth(20)} color="#FFFFFF" style={{marginRight: spacing.xs}} />
                <Text 
                  style={styles.upgradeButtonText}
                  maxFontSizeMultiplier={1.3}
                >
                  Upgrade to Pro
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.laterButton,
                  { minHeight: accessibility.minTouchTarget }
                ]}
                onPress={() => setShowUpgradeModal(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Maybe Later"
                accessibilityHint="Closes the upgrade prompt"
              >
                <Text 
                  style={[styles.laterButtonText, { color: theme.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Maybe Later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

// Styles for the TimeScreen-like implementation
const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeModal: {
    width: '90%',
    maxWidth: 500,
    borderRadius: scaleWidth(20),
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  upgradeModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  upgradeModalTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    marginTop: spacing.m,
    textAlign: 'center',
  },
  upgradeModalMessage: {
    fontSize: scaleFontSize(16),
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: scaleHeight(24),
    paddingHorizontal: spacing.m,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(16),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
  },
  laterButton: {
    marginTop: spacing.l,
    padding: spacing.m,
  },
  laterButtonText: {
    fontSize: scaleFontSize(14),
  }
});

export default TodoListScreen;