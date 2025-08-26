// src/screens/TodoListScreen/index.js - Simplified version with original structure
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  Platform,
  Animated,
  BackHandler
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import context and utilities
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext';

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

// Import tab components
import SimpleTodayTab from './components/tabs/SimpleTodayTab';
import SimpleTomorrowTab from './components/tabs/SimpleTomorrowTab';
import SimpleLaterTab from './components/tabs/SimpleLaterTab';

// Import notes components
import NotesSection from './components/notes/NotesSection';
import FullScreenNoteModal from './components/notes/FullScreenNoteModal';
import NotesToggle from './components/notes/NotesToggle';
import DailyStandup from './components/notes/DailyStandup';
import DailyStandupRevamped from './components/notes/DailyStandupRevamped';

// Import tour components
import useAppTour from '../../hooks/useAppTour';
import AppTourOverlay from '../../components/AppTourOverlay';

// Import achievement tracking
import FeatureExplorerTracker from '../../services/FeatureExplorerTracker';

const TopTab = createMaterialTopTabNavigator();

/**
 * Simplified TodoListScreen with original structure and navigation
 */
const TodoListScreen = ({ navigation, route, isFullscreen: externalIsFullscreen, onFullScreenToggle: externalOnFullScreenToggle }) => {
  const { theme } = useTheme();
  const { showSuccess } = useNotification();
  const { 
    todos, 
    setTodos,
    tomorrowTodos,
    setTomorrowTodos,
    laterTodos,
    setLaterTodos,
    subscription
  } = useAppContext();

  // App Tour Hook
  const { 
    isTourActive,
    currentStep,
    nextStep,
    skipTour
  } = useAppTour(navigation);
  
  // Tour animation ref for todo screen lighting effect
  const tourTodoOpacity = useRef(new Animated.Value(0)).current;

  // Internal fullscreen state management
  const [internalIsFullscreen, setInternalIsFullscreen] = useState(false);
  
  // Use external props if provided, otherwise use internal state
  const isFullscreen = externalIsFullscreen !== undefined ? externalIsFullscreen : internalIsFullscreen;
  const onFullScreenToggle = externalOnFullScreenToggle || (() => setInternalIsFullscreen(!internalIsFullscreen));

  // Handle global fullscreen state for hiding bottom navigation and AI button
  useEffect(() => {
    if (isFullscreen) {
      // Hide AI button
      if (typeof window !== 'undefined' && window.setAIButtonVisible) {
        window.setAIButtonVisible(false);
      }
      
      // Set global state to hide bottom tabs
      if (typeof global !== 'undefined') {
        global.kanbanFullScreen = true;
      }
    } else {
      // Restore normal state
      if (typeof window !== 'undefined' && window.setAIButtonVisible) {
        window.setAIButtonVisible(true);
      }
      
      if (typeof global !== 'undefined') {
        global.kanbanFullScreen = false;
      }
    }
    
    // Cleanup function
    return () => {
      if (isFullscreen) {
        if (typeof window !== 'undefined' && window.setAIButtonVisible) {
          window.setAIButtonVisible(true);
        }
        if (typeof global !== 'undefined') {
          global.kanbanFullScreen = false;
        }
      }
    };
  }, [isFullscreen]);

  // Screen dimensions
  const { width, height } = useScreenDimensions();
  const safeSpacing = useSafeSpacing();
  const insets = useSafeAreaInsets();

  // View mode state (todos vs notes) - initialize from route params
  const [currentView, setCurrentView] = useState(route?.params?.currentView || 'todo');
  const [activeTab, setActiveTab] = useState('today');
  const [navigatorKey, setNavigatorKey] = useState('initial');
  const tabNavigatorRef = useRef(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Text input states for each tab
  const [newTodoText, setNewTodoText] = useState('');
  const [newTomorrowTodoText, setNewTomorrowTodoText] = useState('');
  const [newLaterTodoText, setNewLaterTodoText] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  // Notes state
  const [notes, setNotes] = useState([]);
  const [noteFolders, setNoteFolders] = useState([]);
  const [activeNoteFolder, setActiveNoteFolder] = useState(null);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folderViewMode, setFolderViewMode] = useState('chips');
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [showFullScreenNote, setShowFullScreenNote] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // Notes mode state - default to standup per research
  const [notesMode, setNotesMode] = useState('standup');

  // Track keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Cleanup fullscreen state when component unmounts
  useEffect(() => {
    return () => {
      // Always restore normal state when component unmounts
      if (typeof window !== 'undefined' && window.setAIButtonVisible) {
        window.setAIButtonVisible(true);
      }
      if (typeof global !== 'undefined') {
        global.kanbanFullScreen = false;
      }
    };
  }, []);

  // Handle back button (Android)
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (currentView === 'notes') {
          setCurrentView('todo');
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription?.remove();
    }, [currentView])
  );

  // Debug activeTab changes
  React.useEffect(() => {
    console.log('TodoScreen activeTab changed to:', activeTab);
  }, [activeTab]);

  // Listen for route parameter changes from bottom tab navigation
  React.useEffect(() => {
    // COMPLETELY DISABLE route param listening during NOTES_DAILY_STANDUP to prevent loops
    if (isTourActive && currentStep === 'NOTES_DAILY_STANDUP') {
      console.log('📍 TodoScreen: Route param listening DISABLED during NOTES_DAILY_STANDUP to prevent loops');
      return;
    }
    
    if (route?.params?.currentView && route.params.currentView !== currentView) {
      console.log('📍 TodoScreen: Route params changed, switching view to:', route.params.currentView, 'from:', currentView);
      const newView = route.params.currentView;
      
      // Allow route param changes for other steps
      if (!isTourActive || 
          (isTourActive && !['NOTES_FREE_FORM', 'FREE_NOTES_EXPLANATION', 'TODO_TODAY', 'TODO_TOMORROW', 'TODO_LATER'].includes(currentStep))) {
        console.log('📍 TodoScreen: Allowing route param change to:', newView);
        setCurrentView(newView);
      } else {
        console.log('📍 TodoScreen: Ignoring route param change during active tour step:', currentStep);
      }
    }
  }, [route?.params?.currentView, currentView, isTourActive, currentStep]);
  
  // Only remount navigator when currentView changes, not on every focus
  React.useEffect(() => {
    // Only update navigator key when switching between todo/notes views
    setNavigatorKey(`navigator-${currentView}-${Date.now()}`);
  }, [currentView]);
  
  // No forced reset - let content match whatever tab is selected
  
  // Handle tour todo screen lighting animation - start dark then light up
  useEffect(() => {
    const todoSteps = ['TODO_TODAY', 'TODO_TOMORROW', 'TODO_LATER', 'NOTES_DAILY_STANDUP', 'NOTES_FREE_FORM', 'FREE_NOTES_EXPLANATION'];
    
    // FORCE RESET: For NOTES_DAILY_STANDUP, ensure we start with todo view
    if (isTourActive && currentStep === 'NOTES_DAILY_STANDUP' && currentView !== 'todo') {
      console.log('🎯 Tour: FORCE RESET - NOTES_DAILY_STANDUP must start with todo view, currently:', currentView);
      setCurrentView('todo');
      
      // Also force update navigation params
      const tabNavigator = navigation.getParent();
      if (tabNavigator) {
        tabNavigator.setParams({ currentView: 'todo' });
        console.log('🎯 Tour: FORCE RESET - Set navigation params to todo');
      }
    }
    
    if (isTourActive && todoSteps.includes(currentStep)) {
      console.log('🎯 Tour: Starting todo/notes screen lighting animation for step:', currentStep);
      console.log('🎯 Tour: currentView:', currentView, 'notesMode:', notesMode);
      
      // Extra debug and forced restart for NOTES_FREE_FORM
      if (currentStep === 'NOTES_FREE_FORM') {
        console.log('🚨 Tour: NOTES_FREE_FORM lighting - should start dark then brighten');
        console.log('🚨 Tour: Current tourTodoOpacity value before reset:', tourTodoOpacity._value);
        
        // Force restart the lighting animation for message 14
        tourTodoOpacity.setValue(0); // Ensure we start dark
        console.log('🚨 Tour: Forced tourTodoOpacity to 0 for NOTES_FREE_FORM');
      }
      
      // Start with screen dark (opacity 0) - except for FREE_NOTES_EXPLANATION
      if (currentStep !== 'FREE_NOTES_EXPLANATION') {
        tourTodoOpacity.setValue(0);
      } else {
        console.log('🎯 Tour: FREE_NOTES_EXPLANATION - keeping screen bright, no dark animation');
        tourTodoOpacity.setValue(1);
      }
      
      // Light up the screen as the AI message appears (coordinate with overlay timing)
      // AppTourOverlay timing: 100ms overlay + 300ms delay + 300ms step delay + 400ms AI animation = 1100ms
      const lightUpDelay = 1300; // Start lighting slightly after AI message begins appearing
      
      setTimeout(() => {
        if (isTourActive && todoSteps.includes(currentStep) && currentStep !== 'FREE_NOTES_EXPLANATION') {
          console.log('🎯 Tour: Now lighting up the screen for step:', currentStep);
          if (currentStep === 'NOTES_FREE_FORM') {
            console.log('🚨 Tour: NOTES_FREE_FORM lighting animation starting, opacity 0 -> 1');
          }
          Animated.timing(tourTodoOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          }).start(() => {
            console.log('🎯 Tour: Screen lighting animation complete for step:', currentStep);
            if (currentStep === 'NOTES_FREE_FORM') {
              console.log('🚨 Tour: NOTES_FREE_FORM lighting complete, screen should be bright now');
            }
          });
        } else if (currentStep === 'FREE_NOTES_EXPLANATION') {
          console.log('🎯 Tour: FREE_NOTES_EXPLANATION - skipping lighting animation, already bright');
        } else {
          console.log('🚨 Tour: Lighting animation SKIPPED - conditions not met');
          console.log('🚨 Tour: isTourActive:', isTourActive, 'currentStep:', currentStep, 'todoSteps includes:', todoSteps.includes(currentStep));
        }
      }, lightUpDelay);
    } else if (isTourActive) {
      // Only make dark during tour if we're not on a relevant step
      tourTodoOpacity.setValue(0);
    } else {
      // When not in tour, ensure screen is always visible
      tourTodoOpacity.setValue(1);
    }
  }, [isTourActive, currentStep]);

  // Tour step detection with proper view switching
  useEffect(() => {
    if (isTourActive) {
      console.log('🎯 TodoScreen: Tour step changed to', currentStep);
      
      // Handle NOTES steps
      if (currentStep === 'NOTES_DAILY_STANDUP') {
        console.log('🎯 TodoScreen: NOTES_DAILY_STANDUP detected, staying in todo view until user taps');
        // DON'T automatically switch - let user tap to switch
        setCurrentView('todo'); // Force back to todo view
        setNotesMode('standup'); // But prepare standup mode for when they do switch
      } else if (currentStep === 'NOTES_FREE_FORM') {
        console.log('🎯 TodoScreen: NOTES_FREE_FORM detected, switching to notes/freeform');
        setCurrentView('notes');
        setNotesMode('freeform');
      } else if (currentStep === 'FREE_NOTES_EXPLANATION') {
        console.log('🎯 TodoScreen: FREE_NOTES_EXPLANATION detected, switching to freeform at full brightness');
        setCurrentView('notes');
        setNotesMode('freeform');
        // Set full brightness immediately - no dark animation
        tourTodoOpacity.setValue(1);
      }
      // Handle TODO steps
      else if (currentStep === 'TODO_TODAY') {
        console.log('🎯 TodoScreen: TODO_TODAY detected, switching to todo/today');
        setCurrentView('todo');
        setActiveTab('today');
      } else if (currentStep === 'TODO_TOMORROW') {
        console.log('🎯 TodoScreen: TODO_TOMORROW detected, switching to todo/tomorrow');
        setCurrentView('todo');
        setActiveTab('tomorrow');
      } else if (currentStep === 'TODO_LATER') {
        console.log('🎯 TodoScreen: TODO_LATER detected, switching to todo/later');
        setCurrentView('todo');
        setActiveTab('later');
      }
    }
  }, [isTourActive, currentStep]);

  // Global function for immediate notes switch during tour
  React.useEffect(() => {
    // New function that bypasses route params completely
    global.forceNotesViewForTour = () => {
      console.log('🎯 TodoScreen: DIRECTLY forcing notes view during tour (bypassing route params)');
      
      // Direct state changes - no route params involved
      setCurrentView('notes');
      setNotesMode('standup');
      
      // Start lighting animation immediately for notes view
      console.log('🎯 TodoScreen: Starting lighting animation for notes view switch');
      tourTodoOpacity.setValue(0); // Start dark
      
      setTimeout(() => {
        console.log('🎯 TodoScreen: Lighting up notes view');
        Animated.timing(tourTodoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }).start(() => {
          console.log('🎯 TodoScreen: Notes view lighting complete');
        });
      }, 200); // Small delay to let view switch render
      
      // Notify tour that switch completed
      if (global.tourViewSwitched) {
        global.tourViewSwitched();
      }
      
      // Auto-advance after view switch
      setTimeout(() => {
        console.log('🎯 TodoScreen: Direct switch complete, auto-advancing to NOTES_FREE_FORM');
        if (global.updateGlobalTourState) {
          global.updateGlobalTourState({ currentStep: 'NOTES_FREE_FORM' });
        }
      }, 500);
    };
    
    global.switchToNotesForTour = () => {
      console.log('🎯 TodoScreen: Immediately switching to notes/standup mode');
      console.log('🎯 TodoScreen: Before - currentView:', currentView, 'notesMode:', notesMode);
      
      // AGGRESSIVELY force standup mode MULTIPLE times
      console.log('🚨 TodoScreen: FORCING notesMode to standup (should load Daily Standup tab)');
      setNotesMode('standup');
      
      // Force it again after a tiny delay
      setTimeout(() => {
        console.log('🚨 TodoScreen: FORCING notesMode to standup AGAIN');
        setNotesMode('standup');
      }, 10);
      
      // Force navigation container refresh by changing key
      setNavigatorKey(`notes-standup-${Date.now()}`);
      console.log('🚨 TodoScreen: Set navigator key to force refresh');
      
      // Use a small timeout to ensure notesMode state is updated before switching view
      setTimeout(() => {
        setCurrentView('notes');
        console.log('🎯 TodoScreen: Switched to notes view with standup mode');
        
        // Don't update navigation params - let tour control the icon completely
        
        // Force restart the tour lighting animation for notes view
        if (isTourActive && currentStep === 'NOTES_DAILY_STANDUP') {
          console.log('🎯 TodoScreen: Force restarting tour lighting animation for notes view');
          tourTodoOpacity.setValue(0); // Start dark
          setTimeout(() => {
            Animated.timing(tourTodoOpacity, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true
            }).start();
          }, 300); // Short delay then light up
        }
      }, 50);
    };
    
    return () => {
      delete global.switchToNotesForTour;
      delete global.forceNotesViewForTour;
    };
  }, [navigation]);

  // Simple add todo function
  const addTodo = (tab, groupId, text) => {
    if (!text || !text.trim()) return;

    const newTodo = {
      id: `todo-${Date.now()}-${Math.random()}`,
      title: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      groupId: groupId || null,
      tab: tab
    };

    switch (tab) {
      case 'today':
        setTodos([...todos, newTodo]);
        break;
      case 'tomorrow':
        setTomorrowTodos([...tomorrowTodos, newTodo]);
        break;
      case 'later':
        setLaterTodos([...laterTodos, newTodo]);
        break;
    }

    showSuccess('Todo added successfully');
  };

  // Enhanced toggle todo function with group logic
  const toggleTodo = (id, tab) => {
    const updateTodos = (todoList, setTodoList) => {
      const todoToToggle = todoList.find(todo => todo.id === id);
      if (!todoToToggle) return;

      let updated = [...todoList];

      if (todoToToggle.isGroup) {
        // Toggling a group - toggle all items in the group
        const newCompletedState = !todoToToggle.completed;
        updated = updated.map(todo => {
          if (todo.id === id || todo.groupId === id) {
            return { ...todo, completed: newCompletedState };
          }
          return todo;
        });
      } else {
        // Toggling a regular todo
        updated = updated.map(todo => 
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );

        // Check if this todo belongs to a group
        if (todoToToggle.groupId) {
          const groupId = todoToToggle.groupId;
          const groupItems = updated.filter(todo => todo.groupId === groupId);
          const allGroupItemsCompleted = groupItems.every(todo => todo.completed);
          
          // Update the group's completion status based on its children
          updated = updated.map(todo => {
            if (todo.id === groupId && todo.isGroup) {
              return { ...todo, completed: allGroupItemsCompleted };
            }
            return todo;
          });
        }
      }

      setTodoList(updated);
    };

    switch (tab) {
      case 'today':
        updateTodos(todos, setTodos);
        break;
      case 'tomorrow':
        updateTodos(tomorrowTodos, setTomorrowTodos);
        break;
      case 'later':
        updateTodos(laterTodos, setLaterTodos);
        break;
    }
  };

  // Simple delete todo function
  const deleteTodo = (id, tab) => {
    const filterTodos = (todoList, setTodoList) => {
      const filtered = todoList.filter(todo => todo.id !== id);
      setTodoList(filtered);
    };

    switch (tab) {
      case 'today':
        filterTodos(todos, setTodos);
        break;
      case 'tomorrow':
        filterTodos(tomorrowTodos, setTomorrowTodos);
        break;
      case 'later':
        filterTodos(laterTodos, setLaterTodos);
        break;
    }

    showSuccess('Todo deleted');
  };

  // Simple edit todo function
  const startEditTodo = (todo, tab) => {
    showSuccess(`Edit mode for: ${todo.title}`);
  };

  // Handle tour special actions for tab switching
  const handleTourSpecialAction = (action) => {
    if (action === 'switchToTomorrowTab') {
      console.log('📅 Tour: Switching to Tomorrow tab');
      if (tabNavigatorRef.current) {
        tabNavigatorRef.current.navigate('tomorrow');
        setActiveTab('tomorrow');
      }
    } else if (action === 'switchToLaterTab') {
      console.log('📋 Tour: Switching to Later tab');
      if (tabNavigatorRef.current) {
        tabNavigatorRef.current.navigate('later');
        setActiveTab('later');
      }
    } else if (action === 'switchToFreeNotesTab') {
      console.log('📝 Tour: Switching to Free Notes tab');
      setNotesMode('freeform');
    }
  };

  // Move incomplete today's todos to tomorrow (triggers todo-organizer achievement)
  const moveIncompleteTodosToTomorrow = () => {
    const incompleteTodos = todos.filter(todo => !todo.completed);
    
    if (incompleteTodos.length === 0) {
      showSuccess('No incomplete todos to move', { type: 'warning' });
      return;
    }
    
    // Check limits for free users
    if (subscription?.tier !== 'pro' && subscription?.tier !== 'founder') {
      const currentTomorrowCount = tomorrowTodos.length;
      const incompleteCount = incompleteTodos.length;
      
      if ((currentTomorrowCount + incompleteCount) > 7) { // Tomorrow limit
        showSuccess(`Moving all items would exceed tomorrow's limit of 7. Upgrade to Pro for unlimited todos.`, { type: 'warning' });
        return;
      }
    }
    
    // Move the todos
    setTomorrowTodos([...tomorrowTodos, ...incompleteTodos]);
    setTodos(todos.filter(todo => todo.completed));
    showSuccess(`Today's incomplete to-dos moved to tomorrow`);
    
    // Track achievement for batch organization
    try {
      FeatureExplorerTracker.trackTodoBatchOrganization(showSuccess);
    } catch (error) {
      console.error('Error tracking todo batch organization achievement:', error);
    }
  };

  // Move tomorrow's todos to today
  const moveTomorrowTodosToToday = () => {
    if (tomorrowTodos.length === 0) {
      showSuccess('No todos to move', { type: 'warning' });
      return;
    }
    
    // Check limits for free users
    if (subscription?.tier !== 'pro' && subscription?.tier !== 'founder') {
      const currentTodayCount = todos.length;
      const tomorrowCount = tomorrowTodos.length;
      
      if ((currentTodayCount + tomorrowCount) > 10) { // Today limit
        showSuccess(`Moving all items would exceed today's limit of 10. Upgrade to Pro for unlimited todos.`, { type: 'warning' });
        return;
      }
    }
    
    setTodos([...todos, ...tomorrowTodos]);
    setTomorrowTodos([]);
    showSuccess(`Tomorrow's to-dos moved to today`);
  };

  // Move later items to tomorrow
  const moveLaterItemsToTomorrow = () => {
    if (laterTodos.length === 0) {
      showSuccess('No todos to move', { type: 'warning' });
      return;
    }
    
    // Check limits for free users
    if (subscription?.tier !== 'pro' && subscription?.tier !== 'founder') {
      const currentTomorrowCount = tomorrowTodos.length;
      const laterCount = laterTodos.length;
      
      if ((currentTomorrowCount + laterCount) > 7) { // Tomorrow limit
        showSuccess(`Moving all items would exceed tomorrow's limit of 7. Upgrade to Pro for unlimited todos.`, { type: 'warning' });
        return;
      }
    }
    
    setTomorrowTodos([...tomorrowTodos, ...laterTodos]);
    setLaterTodos([]);
    showSuccess('Later items moved to Tomorrow');
  };

  // Limit checking function
  const canAddMoreTodos = (tab, isGroup) => {
    if (subscription?.tier === 'pro' || subscription?.tier === 'founder') {
      return true;
    }

    const limits = {
      today: 10,
      tomorrow: 7,
      later: 5
    };

    let currentCount = 0;
    switch (tab) {
      case 'today':
        currentCount = todos.length;
        break;
      case 'tomorrow':
        currentCount = tomorrowTodos.length;
        break;
      case 'later':
        currentCount = laterTodos.length;
        break;
    }

    return currentCount < limits[tab];
  };

  const showFeatureLimitBanner = (message) => {
    showSuccess(message, { type: 'warning' });
  };

  // Toggle between todos and notes
  const toggleView = () => {
    // Don't allow manual toggling during specific tour steps
    if (isTourActive && ['NOTES_DAILY_STANDUP', 'NOTES_FREE_FORM', 'FREE_NOTES_EXPLANATION', 'TODO_TODAY', 'TODO_TOMORROW', 'TODO_LATER'].includes(currentStep)) {
      console.log('🔄 Toggle blocked during tour step:', currentStep);
      return;
    }
    
    const newView = currentView === 'todo' ? 'notes' : 'todo';
    console.log('🔄 Toggling view from', currentView, 'to', newView);
    setCurrentView(newView);
    
    // Update route params for tab icon - access the parent tab navigator
    const tabNavigator = navigation.getParent();
    if (tabNavigator) {
      tabNavigator.setParams({ currentView: newView });
    }
  };

  // Sync internal view changes with tab navigator params
  React.useEffect(() => {
    // Update route params whenever currentView changes internally
    const tabNavigator = navigation.getParent();
    if (tabNavigator) {
      tabNavigator.setParams({ currentView: currentView });
    }
  }, [currentView, navigation]);

  // Render Todo Tabs
  const renderTodoTabs = () => (
    <NavigationContainer independent={true} key={`${navigatorKey}-${activeTab}`} ref={tabNavigatorRef}>
      <TopTab.Navigator
        initialRouteName={activeTab}
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#FFFFFF', // White text on active tab for better contrast
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.cardElevated,
            borderBottomColor: theme.border,
            borderBottomWidth: 0.5,
            elevation: 0,
            shadowOpacity: 0,
            borderRadius: 25,
            marginHorizontal: spacing.m,
            marginTop: spacing.xs,
            marginBottom: spacing.s,
            height: isFullscreen ? 0 : 44, // Hide tab bar in fullscreen
            overflow: 'hidden', // Ensure content is hidden when height is 0
          },
          tabBarIndicatorStyle: {
            backgroundColor: theme.primary,
            height: 38,
            borderRadius: 19,
            margin: 3, // Consistent 3px spacing on all sides
            width: `${100/3 - 2}%`, // Each tab is 1/3 width minus margin
          },
          tabBarLabelStyle: {
            fontSize: scaleFontSize(16),
            fontWeight: '600',
            textTransform: 'none',
            zIndex: 2, // Ensure text is above indicator
            marginTop: 1, // Move text down slightly to center it
          },
          tabBarItemStyle: {
            zIndex: 2, // Ensure tab content is above indicator
          },
          // Enable swipe but disable problematic animations (except during tour)
          swipeEnabled: isTourActive !== true,
          animationEnabled: false,
          tabBarPressColor: 'transparent', // Remove press ripple that might interfere
          tabBarPressOpacity: 1, // Prevent opacity changes on press
          lazy: false, // Ensure all tabs are rendered for smooth swiping
        })}
        sceneContainerStyle={{ 
          flex: 1,
          backgroundColor: 'transparent' 
        }}
        onStateChange={(state) => {
          if (state?.index !== undefined) {
            const routes = ['today', 'tomorrow', 'later'];
            const newActiveTab = routes[state.index] || 'today';
            console.log('TodoScreen tab changed to:', newActiveTab, 'state.index:', state.index);
            setActiveTab(newActiveTab);
          }
        }}
      >
        <TopTab.Screen 
          name="today" 
          options={{ tabBarLabel: 'Today' }}
        >
          {() => (
            <SimpleTodayTab
              todos={todos}
              setTodos={setTodos}
              tomorrowTodos={tomorrowTodos}
              setTomorrowTodos={setTomorrowTodos}
              laterTodos={laterTodos}
              setLaterTodos={setLaterTodos}
              newTodoText={newTodoText}
              setNewTodoText={setNewTodoText}
              newGroupName={newGroupName}
              setNewGroupName={setNewGroupName}
              expandedGroups={expandedGroups}
              setExpandedGroups={setExpandedGroups}
              addTodo={addTodo}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
              startEditTodo={startEditTodo}
              theme={theme}
              showSuccess={showSuccess}
              isKeyboardVisible={isKeyboardVisible}
              canAddMoreTodos={canAddMoreTodos}
              showFeatureLimitBanner={showFeatureLimitBanner}
            />
          )}
        </TopTab.Screen>

        <TopTab.Screen 
          name="tomorrow" 
          options={{ tabBarLabel: 'Tomorrow' }}
        >
          {() => (
            <SimpleTomorrowTab
              todos={todos}
              setTodos={setTodos}
              tomorrowTodos={tomorrowTodos}
              setTomorrowTodos={setTomorrowTodos}
              laterTodos={laterTodos}
              setLaterTodos={setLaterTodos}
              newTomorrowTodoText={newTomorrowTodoText}
              setNewTomorrowTodoText={setNewTomorrowTodoText}
              newGroupName={newGroupName}
              setNewGroupName={setNewGroupName}
              expandedGroups={expandedGroups}
              setExpandedGroups={setExpandedGroups}
              addTodo={addTodo}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
              startEditTodo={startEditTodo}
              theme={theme}
              showSuccess={showSuccess}
              isKeyboardVisible={isKeyboardVisible}
              canAddMoreTodos={canAddMoreTodos}
              showFeatureLimitBanner={showFeatureLimitBanner}
            />
          )}
        </TopTab.Screen>

        <TopTab.Screen 
          name="later" 
          options={{ tabBarLabel: 'Later' }}
        >
          {() => (
            <SimpleLaterTab
              todos={todos}
              setTodos={setTodos}
              tomorrowTodos={tomorrowTodos}
              setTomorrowTodos={setTomorrowTodos}
              laterTodos={laterTodos}
              setLaterTodos={setLaterTodos}
              newLaterTodoText={newLaterTodoText}
              setNewLaterTodoText={setNewLaterTodoText}
              newGroupName={newGroupName}
              setNewGroupName={setNewGroupName}
              expandedGroups={expandedGroups}
              setExpandedGroups={setExpandedGroups}
              addTodo={addTodo}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
              startEditTodo={startEditTodo}
              theme={theme}
              showSuccess={showSuccess}
              isKeyboardVisible={isKeyboardVisible}
              canAddMoreTodos={canAddMoreTodos}
              showFeatureLimitBanner={showFeatureLimitBanner}
            />
          )}
        </TopTab.Screen>
      </TopTab.Navigator>
    </NavigationContainer>
  );

  // Render Notes view with swipeable tabs between Daily Standup and Free Notes
  const renderNotesView = () => {
    console.log('🎯 TodoScreen: renderNotesView called with notesMode:', notesMode);
    console.log('🎯 TodoScreen: NavigationContainer key will be:', `${navigatorKey}-notes-${notesMode}`);
    
    // NUCLEAR: During tour notes steps, force state to standup if it's wrong
    if (isTourActive && (currentStep === 'NOTES_DAILY_STANDUP' || currentStep === 'NOTES_FREE_FORM') && notesMode !== 'standup') {
      console.log('🚨 TodoScreen: EMERGENCY FIX - notesMode is', notesMode, 'but should be standup, fixing now!');
      setNotesMode('standup');
    }
    
    // FORCE: During tour, ALWAYS start with standup
    let initialRoute = notesMode;
    if (isTourActive && (currentStep === 'NOTES_DAILY_STANDUP' || currentStep === 'NOTES_FREE_FORM')) {
      initialRoute = 'standup';
      console.log('🚨 TodoScreen: FORCING initialRouteName to standup during tour, ignoring notesMode:', notesMode);
    }
    
    console.log('🎯 TodoScreen: Final initialRouteName will be:', initialRoute);
    return (
      <>
        <NavigationContainer independent={true} key={`${navigatorKey}-notes-${notesMode}`}>
          <TopTab.Navigator
            initialRouteName={initialRoute}
            onStateChange={(state) => {
              console.log('🚨 NOTES NAVIGATOR STATE CHANGE:', state);
              console.log('🚨 Current route index:', state?.index);
              console.log('🚨 Route names:', state?.routeNames);
              if (state?.routes) {
                console.log('🚨 Active route:', state.routes[state.index]?.name);
              }
            }}
          screenOptions={({ route }) => ({
            tabBarActiveTintColor: '#FFFFFF', // White text on active tab for better contrast
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarStyle: {
              backgroundColor: theme.cardElevated,
              borderBottomColor: theme.border,
              borderBottomWidth: 0.5,
              elevation: 0,
              shadowOpacity: 0,
              borderRadius: 25,
              marginHorizontal: spacing.m,
              marginTop: isFullscreen ? 0 : spacing.xs,
              marginBottom: isFullscreen ? 0 : spacing.s,
              height: isFullscreen ? 0 : 44,
              overflow: 'hidden',
              opacity: isFullscreen ? 0 : 1,
            },
            tabBarIndicatorStyle: {
              backgroundColor: theme.primary,
              height: 38,
              borderRadius: 19,
              margin: 3, // Consistent 3px spacing on all sides
              width: `${100/2 - 2}%`, // Each tab is 1/2 width minus margin
            },
            tabBarLabelStyle: {
              fontSize: scaleFontSize(16),
              fontWeight: '600',
              textTransform: 'none',
              zIndex: 2, // Ensure text is above indicator
              marginTop: 1, // Move text down slightly to center it
            },
            tabBarItemStyle: {
              zIndex: 2, // Ensure tab content is above indicator
            },
            // Enable swipe but disable problematic animations
            swipeEnabled: true,
            animationEnabled: false,
            tabBarPressColor: 'transparent', // Remove press ripple that might interfere
            tabBarPressOpacity: 1, // Prevent opacity changes on press
            lazy: false, // Ensure all tabs are rendered for smooth swiping
          })}
          sceneContainerStyle={{ 
            flex: 1,
            backgroundColor: theme.background 
          }}
          // onStateChange removed - was conflicting with initial route setting
        >
          <TopTab.Screen 
            name="standup" 
            options={{ tabBarLabel: 'Daily Standup' }}
          >
            {() => (
              <DailyStandupRevamped
                theme={theme}
                showSuccess={showSuccess}
                isFullscreen={isFullscreen}
              />
            )}
          </TopTab.Screen>

          <TopTab.Screen 
            name="freeform" 
            options={{ tabBarLabel: 'Free Notes' }}
          >
            {() => (
              <NotesSection
                notes={notes}
                setNotes={setNotes}
                noteFolders={noteFolders}
                setNoteFolders={setNoteFolders}
                activeNoteFolder={activeNoteFolder}
                setActiveNoteFolder={setActiveNoteFolder}
                isAddingFolder={isAddingFolder}
                setIsAddingFolder={setIsAddingFolder}
                newFolderName={newFolderName}
                setNewFolderName={setNewFolderName}
                folderViewMode={folderViewMode}
                setFolderViewMode={setFolderViewMode}
                editingNote={editingNote}
                setEditingNote={setEditingNote}
                editNoteTitle={editNoteTitle}
                setEditNoteTitle={setEditNoteTitle}
                editNoteContent={editNoteContent}
                setEditNoteContent={setEditNoteContent}
                showFullScreenNote={showFullScreenNote}
                setShowFullScreenNote={setShowFullScreenNote}
                isCreatingNote={isCreatingNote}
                setIsCreatingNote={setIsCreatingNote}
                theme={theme}
                showSuccess={showSuccess}
              />
            )}
          </TopTab.Screen>
        </TopTab.Navigator>
      </NavigationContainer>
      
      {/* Full Screen Note Modal - only for freeform notes */}
      {notesMode === 'freeform' && showFullScreenNote && (
        <FullScreenNoteModal
          editingNote={editingNote}
          setEditingNote={setEditingNote}
          editNoteTitle={editNoteTitle}
          setEditNoteTitle={setEditNoteTitle}
          editNoteContent={editNoteContent}
          setEditNoteContent={setEditNoteContent}
          showFullScreenNote={showFullScreenNote}
          setShowFullScreenNote={setShowFullScreenNote}
          isCreatingNote={isCreatingNote}
          setIsCreatingNote={setIsCreatingNote}
          isKeyboardVisible={isKeyboardVisible}
          noteFolders={noteFolders}
          notes={notes}
          setNotes={setNotes}
          theme={theme}
          showSuccess={showSuccess}
        />
      )}
      </>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView 
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['top']}
      >

        {/* Content */}
        <Animated.View style={[
          styles.content, 
          { flex: 1 }, 
          isTourActive && ['TODO_TODAY', 'TODO_TOMORROW', 'TODO_LATER', 'NOTES_DAILY_STANDUP', 'NOTES_FREE_FORM', 'FREE_NOTES_EXPLANATION'].includes(currentStep) 
            ? { opacity: tourTodoOpacity } 
            : {}
        ]}>
          {currentView === 'todo' ? renderTodoTabs() : renderNotesView()}
        </Animated.View>

        {/* Floating Fullscreen Button - Bottom Left (exact KanbanView positioning) */}
        <TouchableOpacity
          style={{
            position: 'absolute', 
            bottom: insets.bottom - 20, 
            left: 20, 
            zIndex: 100,
            backgroundColor: '#333333',
            borderRadius: 20,
            padding: 8,
            minWidth: 44,
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
          onPress={onFullScreenToggle}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          accessibilityHint={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
        >
          <Ionicons 
            name={isFullscreen ? "contract" : "expand"} 
            size={scaleWidth(20)} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        
        {/* App Tour Overlay */}
        <AppTourOverlay 
          isVisible={isTourActive && (currentStep === 'SUPPORTING_TOOLS_OVERVIEW' || currentStep === 'AI_FAREWELL')}
          currentStep={currentStep}
          onComplete={nextStep}
          onSkip={skipTour}
          onSpecialAction={handleTourSpecialAction}
          navigation={navigation}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  notesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesText: {
    fontSize: scaleFontSize(16),
    fontStyle: 'italic',
  },
});

export default TodoListScreen;