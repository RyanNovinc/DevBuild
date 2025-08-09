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
import { SafeAreaView } from 'react-native-safe-area-context';
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

// Import achievement tracking
import FeatureExplorerTracker from '../../services/FeatureExplorerTracker';

const TopTab = createMaterialTopTabNavigator();

/**
 * Simplified TodoListScreen with original structure and navigation
 */
const TodoListScreen = ({ navigation, route }) => {
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

  // Screen dimensions
  const { width, height } = useScreenDimensions();
  const safeSpacing = useSafeSpacing();

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
    if (route?.params?.currentView && route.params.currentView !== currentView) {
      console.log('TodoScreen: Route params changed, switching view to:', route.params.currentView);
      setCurrentView(route.params.currentView);
    }
  }, [route?.params?.currentView, currentView]);
  
  // Force navigator remount to sync tab content with indicator
  useFocusEffect(
    React.useCallback(() => {
      // Force remount of the navigation container to sync state
      setNavigatorKey(`navigator-${Date.now()}`);
    }, [])
  );
  
  // No forced reset - let content match whatever tab is selected

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
    const newView = currentView === 'todo' ? 'notes' : 'todo';
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
            marginVertical: spacing.xs,
            height: 44,
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
          // Enable swipe but disable problematic animations
          swipeEnabled: true,
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

  // Render Notes view with full functionality
  const renderNotesView = () => (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
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
      
      {/* Full Screen Note Modal */}
      {showFullScreenNote && (
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
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView 
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['top']}
      >
        {/* Header with view toggle */}
        <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={[styles.viewToggle, { 
                backgroundColor: theme.cardElevated,
                borderColor: theme.primary + '30' // Semi-transparent primary color
              }]}
              onPress={toggleView}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={currentView === 'todo' ? 'checkbox-outline' : 'document-text-outline'} 
                size={scaleWidth(22)} 
                color={theme.primary} 
              />
              <Text style={[styles.viewToggleText, { color: theme.text }]}>
                {currentView === 'todo' ? 'To-Do' : 'Notes'}
              </Text>
              <Ionicons 
                name="chevron-down" 
                size={scaleWidth(18)} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>

          </View>
        </View>

        {/* Content */}
        <View style={[styles.content, { flex: 1 }]}>
          {currentView === 'todo' ? renderTodoTabs() : renderNotesView()}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(16),
    borderBottomWidth: 0.5,
    minHeight: scaleHeight(70),
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(14),
    borderRadius: scaleWidth(25),
    borderWidth: 1,
    minWidth: scaleWidth(150),
    minHeight: scaleHeight(50),
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  viewToggleText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    marginHorizontal: scaleWidth(8),
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
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