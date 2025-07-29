// src/screens/TodoListScreen/components/TodoButtonOverlay.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  Animated,
  Easing,
  Dimensions,
  InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Share, Clipboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateExportContent } from '../TodoUtils';

// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');

// Storage key for confirmation setting
const CONFIRMATION_SETTING_KEY = 'todo_action_confirmation_enabled';

/**
 * A separate component for the bottom action buttons
 * Optimized for smooth animations and zero-flash state changes
 */
const TodoButtonOverlay = React.memo(({
  activeTab,
  todos,
  setTodos,
  tomorrowTodos,
  setTomorrowTodos,
  laterTodos,
  setLaterTodos,
  isAddingSubtask,
  moveIncompleteTodosToTomorrow,
  moveTomorrowTodosToToday,
  moveLaterItemsToTomorrow,
  theme,
  showSuccess,
  // Props for limit checking
  canAddMoreTodos,
  showFeatureLimitBanner
}) => {
  // State for confirmation setting - DEFAULT TO TRUE so it always asks for confirmation
  const [confirmationEnabled, setConfirmationEnabled] = useState(true);
  
  // Animation values
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1)
  ]).current;
  
  // Run entrance animation on mount
  useEffect(() => {
    // Using requestAnimationFrame to ensure smooth animation
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(slideUp, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true
        })
      ]).start();
    });
  }, []);
  
  // Load confirmation setting on mount
  useEffect(() => {
    const loadConfirmationSetting = async () => {
      try {
        const savedSetting = await AsyncStorage.getItem(CONFIRMATION_SETTING_KEY);
        if (savedSetting !== null) {
          setConfirmationEnabled(savedSetting === 'true');
        } else {
          // If no saved setting, default to true and save it
          await AsyncStorage.setItem(CONFIRMATION_SETTING_KEY, 'true');
        }
      } catch (error) {
        console.error('Error loading confirmation setting:', error);
      }
    };
    
    loadConfirmationSetting();
  }, []);
  
  // Save confirmation setting whenever it changes
  useEffect(() => {
    const saveConfirmationSetting = async () => {
      try {
        await AsyncStorage.setItem(CONFIRMATION_SETTING_KEY, confirmationEnabled.toString());
      } catch (error) {
        console.error('Error saving confirmation setting:', error);
      }
    };
    
    saveConfirmationSetting();
  }, [confirmationEnabled]);
  
  // Get the correct todos array based on active tab
  const getCurrentTodos = useCallback(() => {
    switch (activeTab) {
      case 'today':
        return todos;
      case 'tomorrow':
        return tomorrowTodos;
      case 'later':
        return laterTodos;
      default:
        return [];
    }
  }, [activeTab, todos, tomorrowTodos, laterTodos]);
  
  // Set the correct todos array based on active tab
  const setCurrentTodos = useCallback((newTodos) => {
    switch (activeTab) {
      case 'today':
        setTodos(newTodos);
        break;
      case 'tomorrow':
        setTomorrowTodos(newTodos);
        break;
      case 'later':
        setLaterTodos(newTodos);
        break;
    }
  }, [activeTab, setTodos, setTomorrowTodos, setLaterTodos]);
  
  // Get completed and total counts for the current tab
  const getCurrentCounts = useCallback(() => {
    const currentTodos = getCurrentTodos();
    
    // First, find all valid groups
    const groups = currentTodos.filter(todo => todo && todo.isGroup);
    const validGroupIds = groups.map(group => group.id);
    
    // Filter out orphaned children (items assigned to groups that don't exist)
    const validTodos = currentTodos.filter(todo => {
      // Skip null or undefined items
      if (!todo) return false;
      
      // Include all groups
      if (todo.isGroup) return true;
      
      // For items with a groupId, make sure the group exists
      if (todo.groupId && !validGroupIds.includes(todo.groupId)) {
        return false;
      }
      
      // Include all other valid items
      return true;
    });
    
    // Only count non-group items for the total
    const totalCount = validTodos.filter(todo => todo && !todo.isGroup).length;
    const completedCount = validTodos.filter(todo => todo && !todo.isGroup && todo.completed).length;
    
    return { completedCount, totalCount };
  }, [getCurrentTodos]);
  
  // Button press animation
  const animateButtonPress = useCallback((index) => {
    Animated.sequence([
      Animated.timing(buttonScale[index], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(buttonScale[index], {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  }, [buttonScale]);
  
  // Toggle confirmation setting
  const toggleConfirmationSetting = useCallback(() => {
    // If turning on confirmations, show an explanation
    if (!confirmationEnabled) {
      Alert.alert(
        "Enable Confirmations",
        "When enabled, you'll be asked to confirm before actions like deleting todos or moving them between days.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Enable", 
            onPress: () => {
              setConfirmationEnabled(true);
              showSuccess('Confirmations enabled');
            }
          }
        ]
      );
    } else {
      // If turning off, show warning first
      Alert.alert(
        "Disable Confirmations",
        "This will disable confirmation dialogs for all actions like deleting or moving todos. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Disable", 
            style: "destructive",
            onPress: () => {
              setConfirmationEnabled(false);
              showSuccess('Confirmations disabled');
            }
          }
        ]
      );
    }
  }, [confirmationEnabled, showSuccess]);
  
  // Clean up todos - Remove orphaned children and null values
  const cleanupTodos = useCallback(() => {
    const currentTodos = getCurrentTodos();
    
    // Find all valid group IDs
    const groups = currentTodos.filter(todo => todo && todo.isGroup);
    const validGroupIds = groups.map(group => group.id);
    
    // Filter out null values and orphaned children
    const cleanedTodos = currentTodos.filter(todo => {
      // Skip null or undefined items
      if (!todo) return false;
      
      // Include all groups
      if (todo.isGroup) return true;
      
      // For items with a groupId, make sure the group exists
      if (todo.groupId && !validGroupIds.includes(todo.groupId)) {
        return false;
      }
      
      // Include all other valid items
      return true;
    });
    
    // Only update if we actually removed items
    if (cleanedTodos.length !== currentTodos.length) {
      setCurrentTodos(cleanedTodos);
      showSuccess(`Cleaned up ${currentTodos.length - cleanedTodos.length} invalid items`);
      return true;
    }
    
    return false;
  }, [getCurrentTodos, setCurrentTodos, showSuccess]);
  
  // Long press on counter to trigger cleanup
  const handleCounterLongPress = useCallback(() => {
    Alert.alert(
      "Cleanup Todo List",
      "Do you want to clean up any invalid or orphaned items?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clean Up", 
          onPress: () => {
            const cleaned = cleanupTodos();
            if (!cleaned) {
              showSuccess('No invalid items found');
            }
          }
        }
      ]
    );
  }, [cleanupTodos, showSuccess]);
  
  // Clear completed todos for the current tab
  const clearCompleted = useCallback(() => {
    // Animate the button press
    animateButtonPress(2);
    
    // Show confirmation dialog regardless of setting
    Alert.alert(
      "Clear Completed To-dos",
      "Are you sure you want to clear all completed to-dos?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: () => {
            performClearCompleted();
          }
        }
      ]
    );
  }, [animateButtonPress]);
  
  // Actual implementation of clear completed
  const performClearCompleted = useCallback(() => {
    // First clean up any invalid items
    cleanupTodos();
    
    const currentTodos = getCurrentTodos();
    
    // Get all groups
    const groups = currentTodos.filter(item => item && item.isGroup);
    
    // For each completed group, we'll remove it and its children
    const completedGroupIds = groups
      .filter(group => group.completed)
      .map(group => group.id);
    
    // Filter out completed todos and groups
    const remainingTodos = currentTodos.filter(todo => {
      // Skip null items
      if (!todo) return false;
      
      // Remove completed groups
      if (todo.isGroup && todo.completed) return false;
      
      // Remove items in completed groups
      if (todo.groupId && completedGroupIds.includes(todo.groupId)) return false;
      
      // Remove individual completed items
      if (todo.completed && !todo.isGroup) return false;
      
      return true;
    });
    
    setCurrentTodos(remainingTodos);
    showSuccess('Completed to-dos cleared');
  }, [cleanupTodos, getCurrentTodos, setCurrentTodos, showSuccess]);
  
  // Share todos from the current tab
  const shareTodos = useCallback(() => {
    // Animate the button press
    animateButtonPress(1);
    
    try {
      const currentTodos = getCurrentTodos();
      
      if (currentTodos.length === 0) {
        showSuccess('No todos to share', { type: 'warning' });
        return;
      }
      
      const shareContent = generateExportContent(currentTodos);
      const tabName = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      
      Share.share({
        message: shareContent,
        title: `${tabName}'s To-Do List`
      });
    } catch (error) {
      console.error('Error sharing todos:', error);
      showSuccess('Failed to share todos', { type: 'error' });
    }
  }, [activeTab, animateButtonPress, getCurrentTodos, showSuccess]);
  
  // Copy todos to clipboard from the current tab
  const copyTodosToClipboard = useCallback(() => {
    // Animate the button press
    animateButtonPress(0);
    
    try {
      const currentTodos = getCurrentTodos();
      
      if (currentTodos.length === 0) {
        showSuccess('No todos to copy', { type: 'warning' });
        return;
      }
      
      const content = generateExportContent(currentTodos);
      Clipboard.setString(content);
      
      showSuccess('Copied to clipboard!');
    } catch (error) {
      console.error('Error copying todos:', error);
      showSuccess('Failed to copy todos', { type: 'error' });
    }
  }, [animateButtonPress, getCurrentTodos, showSuccess]);
  
  // Updated move functions with limit checking
  const moveTomorrowTodosToTodayWithLimits = useCallback(() => {
    if (tomorrowTodos.length === 0) {
      showSuccess('No todos to move', { type: 'warning' });
      return;
    }
    
    // Calculate if this would exceed the today limit for free users
    if (canAddMoreTodos) {
      // Get weighted counts
      const currentTodayCount = todos.length;
      const tomorrowCount = tomorrowTodos.length;
      
      if ((currentTodayCount + tomorrowCount) > 10) { // Using hardcoded limit of 10 for Today
        if (showFeatureLimitBanner) {
          showFeatureLimitBanner(
            `Moving all items would exceed today's limit of 10. Upgrade to Pro for unlimited todos.`
          );
        } else {
          showSuccess(`Moving all items would exceed today's limit of 10`, { type: 'warning' });
        }
        return;
      }
    }
    
    moveTomorrowTodosToToday();
  }, [
    tomorrowTodos, 
    todos, 
    canAddMoreTodos, 
    showFeatureLimitBanner, 
    showSuccess, 
    moveTomorrowTodosToToday
  ]);
  
  const moveIncompleteTodosToTomorrowWithLimits = useCallback(() => {
    const incompleteTodos = todos.filter(todo => !todo.completed);
    
    if (incompleteTodos.length === 0) {
      showSuccess('No incomplete todos to move', { type: 'warning' });
      return;
    }
    
    // Calculate if this would exceed the tomorrow limit for free users
    if (canAddMoreTodos) {
      // Get counts
      const currentTomorrowCount = tomorrowTodos.length;
      const incompleteCount = incompleteTodos.length;
      
      if ((currentTomorrowCount + incompleteCount) > 7) { // Using hardcoded limit of 7 for Tomorrow
        if (showFeatureLimitBanner) {
          showFeatureLimitBanner(
            `Moving all items would exceed tomorrow's limit of 7. Upgrade to Pro for unlimited todos.`
          );
        } else {
          showSuccess(`Moving all items would exceed tomorrow's limit of 7`, { type: 'warning' });
        }
        return;
      }
    }
    
    moveIncompleteTodosToTomorrow();
  }, [
    todos, 
    tomorrowTodos, 
    canAddMoreTodos, 
    showFeatureLimitBanner, 
    showSuccess, 
    moveIncompleteTodosToTomorrow
  ]);
  
  const moveLaterItemsToTomorrowWithLimits = useCallback(() => {
    if (laterTodos.length === 0) {
      showSuccess('No todos to move', { type: 'warning' });
      return;
    }
    
    // Calculate if this would exceed the tomorrow limit for free users
    if (canAddMoreTodos) {
      // Get counts
      const currentTomorrowCount = tomorrowTodos.length;
      const laterCount = laterTodos.length;
      
      if ((currentTomorrowCount + laterCount) > 7) { // Using hardcoded limit of 7 for Tomorrow
        if (showFeatureLimitBanner) {
          showFeatureLimitBanner(
            `Moving all items would exceed tomorrow's limit of 7. Upgrade to Pro for unlimited todos.`
          );
        } else {
          showSuccess(`Moving all items would exceed tomorrow's limit of 7`, { type: 'warning' });
        }
        return;
      }
    }
    
    moveLaterItemsToTomorrow();
  }, [
    laterTodos, 
    tomorrowTodos, 
    canAddMoreTodos, 
    showFeatureLimitBanner, 
    showSuccess, 
    moveLaterItemsToTomorrow
  ]);
  
  // Handle move function - Use confirmation setting and limit checking
  const handleMove = useCallback(() => {
    // Animate the button press
    animateButtonPress(3);
    
    // Get the appropriate move function based on the active tab
    const moveFunction = getMoveFunction();
    const actionDescription = getMoveActionDescription();
    
    if (confirmationEnabled) {
      // Show confirmation dialog when enabled
      Alert.alert(
        actionDescription.title,
        actionDescription.message,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Move", 
            onPress: moveFunction
          }
        ]
      );
    } else {
      // Execute without confirmation when disabled
      moveFunction();
    }
  }, [confirmationEnabled, animateButtonPress]);
  
  // Get the right move function based on the active tab (now with limit checking)
  const getMoveFunction = useCallback(() => {
    switch (activeTab) {
      case 'today':
        return moveIncompleteTodosToTomorrowWithLimits;
      case 'tomorrow':
        return moveTomorrowTodosToTodayWithLimits;
      case 'later':
        return moveLaterItemsToTomorrowWithLimits;
      default:
        return () => {};
    }
  }, [
    activeTab, 
    moveIncompleteTodosToTomorrowWithLimits, 
    moveTomorrowTodosToTodayWithLimits,
    moveLaterItemsToTomorrowWithLimits
  ]);
  
  // Get description for the move action based on active tab
  const getMoveActionDescription = useCallback(() => {
    switch (activeTab) {
      case 'today':
        return {
          title: "Move Incomplete To-dos",
          message: "Are you sure you want to move all incomplete to-dos to tomorrow?"
        };
      case 'tomorrow':
        return {
          title: "Move To-dos to Today",
          message: "Are you sure you want to move all tomorrow's to-dos to today?"
        };
      case 'later':
        return {
          title: "Move To-dos to Tomorrow",
          message: "Are you sure you want to move all later to-dos to tomorrow?"
        };
      default:
        return {
          title: "Move To-dos",
          message: "Are you sure you want to move these to-dos?"
        };
    }
  }, [activeTab]);
  
  // Get the right move icon based on the active tab
  const getMoveIcon = useCallback(() => {
    switch (activeTab) {
      case 'today':
        return "arrow-forward-outline"; // Move to tomorrow
      case 'tomorrow':
        return "arrow-back-outline"; // Move to today
      case 'later':
        return "arrow-forward-outline"; // Move to tomorrow
      default:
        return "arrow-forward-outline";
    }
  }, [activeTab]);
  
  // Get the counts
  const { completedCount, totalCount } = getCurrentCounts();
  
  // Don't render anything if there are no valid todos or we're adding a subtask
  if (totalCount === 0 || isAddingSubtask) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeIn,
          transform: [{ translateY: slideUp }]
        }
      ]}
    >
      {/* Tally Counter Button */}
      <TouchableOpacity 
        style={[
          styles.counterBadge, 
          // Add visual indicator for confirmation mode
          confirmationEnabled && styles.counterBadgeConfirmEnabled
        ]}
        onPress={toggleConfirmationSetting}
        onLongPress={handleCounterLongPress}
        activeOpacity={0.7}
        delayLongPress={800}
      >
        <Text style={styles.counterText}>
          {completedCount}/{totalCount}
        </Text>
        
        {/* Small indicator icon when confirmations are enabled */}
        {confirmationEnabled && (
          <View style={styles.confirmationIndicator}>
            <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
      
      {/* Icon-only buttons in a row */}
      <View style={styles.buttonRow}>
        {/* Copy Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale[0] }] }}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={copyTodosToClipboard}
            activeOpacity={0.7}
          >
            <Ionicons name="copy-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Share Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale[1] }] }}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={shareTodos}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Clear Completed Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale[2] }] }}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={clearCompleted}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Move Button (changes based on active tab) */}
        <Animated.View style={{ transform: [{ scale: buttonScale[3] }] }}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMove}
            activeOpacity={0.7}
          >
            <Ionicons name={getMoveIcon()} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -5, // Keep buttons lower on screen for better UX
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 9999,
  },
  counterBadge: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 0.5,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // Make it look clickable
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBadgeConfirmEnabled: {
    borderColor: '#4CAF50', // Green border to indicate confirmations are enabled
    borderWidth: 1.5,
    paddingRight: 24, // Extra padding for the indicator icon
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmationIndicator: {
    position: 'absolute',
    right: 8,
    backgroundColor: '#4CAF50', // Green background
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 0.5,
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default TodoButtonOverlay;