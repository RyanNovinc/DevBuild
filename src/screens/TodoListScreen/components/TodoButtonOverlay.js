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
import ConfirmationModal from './ConfirmationModal';
import ActionConfirmationModal from './ActionConfirmationModal';

// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');

// Storage key for confirmation setting
const CONFIRMATION_SETTING_KEY = 'todo_action_confirmation_enabled';

/**
 * A separate component for the bottom action buttons
 * Optimized for smooth animations and zero-flash state changes
 */
const TodoButtonOverlay = ({
  activeTab,
  todos,
  setTodos,
  tomorrowTodos,
  setTomorrowTodos,
  laterTodos,
  setLaterTodos,
  isAddingSubtask,
  theme,
  showSuccess,
  // Props for limit checking
  canAddMoreTodos,
  showFeatureLimitBanner,
  subscription,
  // External move functions
  moveIncompleteTodosToTomorrow,
  moveTomorrowTodosToToday,
  moveLaterItemsToTomorrow
}) => {
  // State for confirmation setting - DEFAULT TO TRUE so it always asks for confirmation
  const [confirmationEnabled, setConfirmationEnabled] = useState(true);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  // State for action confirmation modal
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionModalConfig, setActionModalConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmColor: '#FF3B30',
    icon: 'warning-outline',
    iconColor: '#FF9500'
  });
  
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
  
  // Helper function to show custom action confirmation modal
  const showCustomAlert = useCallback(({
    title,
    message, 
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = '#FF3B30',
    icon = 'warning-outline',
    iconColor = '#FF9500'
  }) => {
    setActionModalConfig({
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      confirmColor,
      icon,
      iconColor
    });
    setShowActionModal(true);
  }, []);
  
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
    
    // Count both groups and non-group items for the total
    const totalCount = validTodos.filter(todo => todo).length;
    const completedCount = validTodos.filter(todo => todo && todo.completed).length;
    
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
    setShowConfirmationModal(true);
  }, []);

  // Handle confirmation modal confirm
  const handleConfirmationToggle = useCallback(() => {
    const newState = !confirmationEnabled;
    setConfirmationEnabled(newState);
    showSuccess(newState ? 'Confirmations enabled' : 'Confirmations disabled');
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
    if (confirmationEnabled) {
      showCustomAlert({
        title: "Cleanup Todo List",
        message: "Do you want to clean up any invalid or orphaned items?",
        onConfirm: () => {
          const cleaned = cleanupTodos();
          if (!cleaned) {
            showSuccess('No invalid items found');
          }
        },
        confirmText: "Clean Up",
        cancelText: "Cancel",
        confirmColor: "#34C759", // Green for cleanup action
        icon: "construct-outline",
        iconColor: "#34C759"
      });
    } else {
      // If confirmations are disabled, directly perform cleanup
      const cleaned = cleanupTodos();
      if (!cleaned) {
        showSuccess('No invalid items found');
      }
    }
  }, [cleanupTodos, showSuccess, showCustomAlert, confirmationEnabled]);
  
  // Clear completed todos for the current tab
  const clearCompleted = useCallback(() => {
    // Animate the button press
    animateButtonPress(2);
    
    // Check confirmation setting
    if (confirmationEnabled) {
      showCustomAlert({
        title: "Clear Completed To-dos",
        message: "Are you sure you want to clear all completed to-dos?",
        onConfirm: () => {
          performClearCompleted();
        },
        confirmText: "Clear",
        cancelText: "Cancel",
        confirmColor: "#FF3B30", // Red for destructive action
        icon: "trash-outline",
        iconColor: "#FF3B30"
      });
    } else {
      // If confirmations are disabled, directly perform the action
      performClearCompleted();
    }
  }, [animateButtonPress, showCustomAlert, confirmationEnabled, performClearCompleted]);
  
  // Actual implementation of clear completed
  const performClearCompleted = useCallback(() => {
    // First clean up any invalid items
    cleanupTodos();
    
    const currentTodos = getCurrentTodos();
    
    // Get all completed groups
    const completedGroups = currentTodos.filter(item => item && item.isGroup && item.completed);
    const completedGroupIds = completedGroups.map(group => group.id);
    
    // Get all completed individual items (not groups)
    const completedIndividualItems = currentTodos.filter(item => 
      item && !item.isGroup && item.completed
    );
    
    // Get all items that belong to completed groups (these will also be removed)
    const itemsInCompletedGroups = currentTodos.filter(item => 
      item && !item.isGroup && item.groupId && completedGroupIds.includes(item.groupId)
    );
    
    const totalItemsToRemove = completedGroups.length + completedIndividualItems.length + itemsInCompletedGroups.length;
    
    if (totalItemsToRemove === 0) {
      showSuccess('No completed items to clear', { type: 'warning' });
      return;
    }
    
    // Filter out completed items - keep only incomplete items
    const remainingTodos = currentTodos.filter(todo => {
      // Skip null items
      if (!todo) return false;
      
      // Remove completed groups
      if (todo.isGroup && todo.completed) return false;
      
      // Remove items that belong to completed groups
      if (todo.groupId && completedGroupIds.includes(todo.groupId)) return false;
      
      // Remove completed individual items
      if (!todo.isGroup && todo.completed) return false;
      
      // Keep everything else (incomplete groups and incomplete individual items)
      return true;
    });
    
    setCurrentTodos(remainingTodos);
    showSuccess(`${totalItemsToRemove} completed item${totalItemsToRemove !== 1 ? 's' : ''} cleared`);
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
  
  
  
  

  // Handle move function - using external move functions
  const handleMove = useCallback(() => {
    // Animate the button press
    animateButtonPress(3);
    
    // Get the correct move function and modal config
    let moveFunction = null;
    let title = 'Move Items';
    let message = 'Move items?';
    
    if (activeTab === 'today') {
      moveFunction = moveIncompleteTodosToTomorrow;
      title = 'Move All To-dos';
      message = 'Move all to-dos to Tomorrow?';
    } else if (activeTab === 'tomorrow') {
      moveFunction = moveTomorrowTodosToToday;
      title = 'Move All To-dos';
      message = 'Move all to-dos to Today?';
    } else if (activeTab === 'later') {
      moveFunction = moveLaterItemsToTomorrow;
      title = 'Move All To-dos';
      message = 'Move all to-dos to Tomorrow?';
    }
    
    if (!moveFunction) return;
    
    if (confirmationEnabled) {
      // Use the same icon as the button
      const modalIcon = getMoveIcon();
      
      showCustomAlert({
        title,
        message,
        onConfirm: moveFunction,
        confirmText: "Move",
        cancelText: "Cancel",
        confirmColor: "#007AFF",
        icon: modalIcon,
        iconColor: "#007AFF"
      });
    } else {
      moveFunction();
    }
  }, [activeTab, confirmationEnabled, animateButtonPress, showCustomAlert, moveIncompleteTodosToTomorrow, moveTomorrowTodosToToday, moveLaterItemsToTomorrow, getMoveIcon]);
  
  
  // Get the right move icon based on the active tab
  const getMoveIcon = useCallback(() => {
    switch (activeTab) {
      case 'today':
        return "arrow-forward-outline"; // Move to tomorrow
      case 'tomorrow':
        return "arrow-back-outline"; // Move to today
      case 'later':
        return "arrow-back-outline"; // Move to tomorrow (backward in timeline)
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
    <>
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

      {/* Confirmation Settings Modal */}
      <ConfirmationModal
        visible={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmationToggle}
        confirmationEnabled={confirmationEnabled}
        theme={theme}
      />

      {/* Action Confirmation Modal */}
      <ActionConfirmationModal
        visible={showActionModal}
        onClose={() => setShowActionModal(false)}
        onConfirm={actionModalConfig.onConfirm}
        title={actionModalConfig.title}
        message={actionModalConfig.message}
        confirmText={actionModalConfig.confirmText}
        cancelText={actionModalConfig.cancelText}
        confirmColor={actionModalConfig.confirmColor}
        icon={actionModalConfig.icon}
        iconColor={actionModalConfig.iconColor}
        theme={theme}
      />
    </>
  );
};

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