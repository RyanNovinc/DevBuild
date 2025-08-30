// src/components/AddTodoModal.js - Enhanced with bulk creation capabilities
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Dimensions,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FreeTierLimitModal from '../screens/TimeScreen/FreeTierLimitModal';
import { useNavigation } from '@react-navigation/native';

// Todo limits for free users
const TODO_LIMITS = {
  TODAY: 10,
  TOMORROW: 7,
  LATER: 5,
};

// Import responsive utilities
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  isTablet,
  accessibility,
  ensureAccessibleTouchTarget,
  useSafeSpacing
} from '../utils/responsive';

const AddTodoModal = ({ 
  visible, 
  onClose, 
  onAdd, 
  todoData, // Single todo for backward compatibility
  aiSuggestions = [] // Array of AI suggestions
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const safeSpacing = useSafeSpacing();
  const { 
    userSubscriptionStatus, 
    todos = [], 
    tomorrowTodos = [], 
    laterTodos = []
  } = useAppContext();
  
  // Check if user is pro
  const isPro = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
  
  // Modal animation values
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Main tab state
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'review'
  
  // Individual todo input state
  const [todoTitle, setTodoTitle] = useState('');
  const [selectedTab, setSelectedTab] = useState('today'); // 'today', 'tomorrow', 'later'
  
  // Group creation state
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [groupItems, setGroupItems] = useState([]);
  const [newGroupItemText, setNewGroupItemText] = useState('');
  
  // Pending todos organized by tab
  const [pendingTodos, setPendingTodos] = useState({
    today: [],
    tomorrow: [],
    later: []
  });

  // Limit modal state
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  // Get theme-aware button color
  const buttonColor = theme.primary;
  
  // Helper functions for todo management
  const getTodoCount = (tabName) => {
    return pendingTodos[tabName]?.length || 0;
  };
  
  const getTotalTodoCount = () => {
    return Object.values(pendingTodos).reduce((total, todos) => total + todos.length, 0);
  };
  
  const getCurrentTodoCount = (tabName) => {
    const existingTodos = {
      today: todos.length,
      tomorrow: tomorrowTodos.length,
      later: laterTodos.length
    };
    return existingTodos[tabName] || 0;
  };


  // Function to check if adding todos would exceed limits
  const checkTodoLimits = (targetTab, itemsToAdd = 1) => {
    if (isPro) return { canAdd: true }; // Pro users have no limits
    
    const currentCount = getCurrentTodoCount(targetTab);
    const limit = TODO_LIMITS[targetTab.toUpperCase()];
    const newTotal = currentCount + itemsToAdd;
    
    return {
      canAdd: newTotal <= limit,
      currentCount,
      limit,
      newTotal,
      overflow: Math.max(0, newTotal - limit)
    };
  };

  // Function to get available space in other tabs
  const getAvailableSpaceInTabs = () => {
    return {
      today: Math.max(0, TODO_LIMITS.TODAY - getCurrentTodoCount('today')),
      tomorrow: Math.max(0, TODO_LIMITS.TOMORROW - getCurrentTodoCount('tomorrow')),
      later: Math.max(0, TODO_LIMITS.LATER - getCurrentTodoCount('later'))
    };
  };

  // Function to show limit exceeded alert with helpful options
  const showLimitExceededAlert = (limitCheck, itemsToAdd) => {
    const availableSpace = getAvailableSpaceInTabs();
    const tabName = tab.charAt(0).toUpperCase() + tab.slice(1);
    
    // Create message with current status
    let message = `You're trying to add ${itemsToAdd} ${itemsToAdd === 1 ? 'todo' : 'todos'} to ${tabName}, but you've reached the limit of ${limitCheck.limit} items.\n\n`;
    message += `Current: ${limitCheck.currentCount}/${limitCheck.limit} in ${tabName}\n`;
    message += `This would exceed by: ${limitCheck.overflow} ${limitCheck.overflow === 1 ? 'item' : 'items'}\n\n`;
    
    // Add information about other tabs
    const alternatives = [];
    Object.entries(availableSpace).forEach(([tabKey, space]) => {
      if (tabKey !== tab && space > 0) {
        const tabDisplayName = tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
        alternatives.push(`${tabDisplayName}: ${space} ${space === 1 ? 'slot' : 'slots'} available`);
      }
    });
    
    if (alternatives.length > 0) {
      message += "Available space in other tabs:\n" + alternatives.join('\n') + '\n\n';
    }
    
    message += "What would you like to do?";
    
    // Create alert buttons
    const alertButtons = [];
    
    // Add "Switch Tab" options if there's space elsewhere
    Object.entries(availableSpace).forEach(([tabKey, space]) => {
      if (tabKey !== tab && space >= itemsToAdd) {
        const tabDisplayName = tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
        alertButtons.push({
          text: `Switch to ${tabDisplayName}`,
          onPress: () => {
            setTab(tabKey);
            // Don't close modal, let user confirm the switch
          }
        });
      }
    });
    
    // Add "Upgrade to Pro" button
    alertButtons.push({
      text: "Upgrade to Pro",
      onPress: () => {
        // Show the beautiful limit modal
        setShowLimitModal(true);
      }
    });
    
    // Add "Cancel" button
    alertButtons.push({
      text: "Cancel",
      style: "cancel"
    });
    
    Alert.alert(
      `${tabName} Tab Full`,
      message,
      alertButtons,
      { cancelable: true }
    );
  };

  // Handle modal animation
  useEffect(() => {
    if (visible) {
      // Reset animation values
      backgroundOpacityAnim.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
      translateY.setValue(0); // Reset gesture translation
      
      // Animate in with staggered timing
      Animated.sequence([
        // First darken the background gradually
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        // Then slide in the content
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start();
    }
  }, [visible]);

  // Handle pre-filling from AI suggestions
  useEffect(() => {
    if (visible && (todoData || aiSuggestions.length > 0)) {
      console.log('Pre-filling modal with AI data:');
      console.log('- Single todoData:', todoData);
      console.log('- AI suggestions array:', aiSuggestions);
      
      // Handle multiple AI suggestions (preferred method)
      if (aiSuggestions.length > 0) {
        console.log('Processing', aiSuggestions.length, 'AI suggestions');
        
        const newPendingTodos = {
          today: [],
          tomorrow: [],
          later: []
        };
        
        aiSuggestions.forEach((suggestion, index) => {
          const targetTab = suggestion.tab || 'today';
          
          if (suggestion.isGroup && suggestion.items) {
            // Add as group
            const groupItem = {
              id: `ai_group_${Date.now()}_${index}`,
              title: suggestion.title,
              tab: targetTab,
              isGroup: true,
              items: [...suggestion.items]
            };
            newPendingTodos[targetTab].push(groupItem);
          } else {
            // Add as individual todo
            const todoItem = {
              id: `ai_todo_${Date.now()}_${index}`,
              title: suggestion.title,
              tab: targetTab,
              isGroup: false
            };
            newPendingTodos[targetTab].push(todoItem);
          }
        });
        
        setPendingTodos(newPendingTodos);
        // Switch to review tab to show all AI suggestions
        setActiveTab('review');
      }
      // Handle single todoData (auto-populate to Review & Save)
      else if (todoData) {
        const targetTab = todoData.tab || 'today';
        
        if (todoData.isGroup && todoData.items) {
          // Auto-add group to pending todos (go straight to Review & Save)
          console.log('Auto-adding group to Review & Save with', todoData.items.length, 'items');
          
          const groupItem = {
            id: `ai_single_group_${Date.now()}`,
            title: todoData.title,
            tab: targetTab,
            isGroup: true,
            items: [...todoData.items]
          };
          
          setPendingTodos({
            today: targetTab === 'today' ? [groupItem] : [],
            tomorrow: targetTab === 'tomorrow' ? [groupItem] : [],
            later: targetTab === 'later' ? [groupItem] : []
          });
          
          // Go to review tab to show the pre-populated group
          setActiveTab('review');
        } else {
          // Auto-add single todo to pending todos (go straight to Review & Save)
          console.log('Auto-adding single todo to Review & Save:', todoData.title);
          
          const todoItem = {
            id: `ai_single_todo_${Date.now()}`,
            title: todoData.title,
            tab: targetTab,
            isGroup: false
          };
          
          setPendingTodos({
            today: targetTab === 'today' ? [todoItem] : [],
            tomorrow: targetTab === 'tomorrow' ? [todoItem] : [],
            later: targetTab === 'later' ? [todoItem] : []
          });
          
          // Go to review tab to show the pre-populated todo
          setActiveTab('review');
        }
      }
    } else if (visible && !todoData && aiSuggestions.length === 0) {
      // No AI data, start fresh
      resetForm();
    } else if (!visible) {
      // Modal closing, reset everything
      resetForm();
    }
  }, [visible, todoData, aiSuggestions]);
  
  // Reset form
  const resetForm = () => {
    setActiveTab('add');
    setTodoTitle('');
    setSelectedTab('today');
    setIsCreatingGroup(false);
    setGroupTitle('');
    setGroupItems([]);
    setNewGroupItemText('');
    setPendingTodos({
      today: [],
      tomorrow: [],
      later: []
    });
  };
  
  // Add individual todo to selected tab
  const addTodoToTab = () => {
    if (!todoTitle.trim()) {
      Alert.alert(
        "Title Required", 
        "Please enter a title for this to-do.",
        [{ text: "OK" }]
      );
      return;
    }
    
    const newTodo = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: todoTitle.trim(),
      tab: selectedTab,
      isGroup: false
    };
    
    setPendingTodos(prev => ({
      ...prev,
      [selectedTab]: [...prev[selectedTab], newTodo]
    }));
    
    setTodoTitle(''); // Reset title
    setActiveTab('review'); // Switch to review tab
  };
  
  // Add group to selected tab
  const addGroupToTab = () => {
    if (!groupTitle.trim()) {
      Alert.alert(
        "Group Title Required", 
        "Please enter a title for this group.",
        [{ text: "OK" }]
      );
      return;
    }
    
    if (groupItems.length === 0) {
      Alert.alert(
        "Add Items", 
        "Please add at least one item to this group.",
        [{ text: "OK" }]
      );
      return;
    }
    
    const newGroup = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: groupTitle.trim(),
      tab: selectedTab,
      isGroup: true,
      items: [...groupItems]
    };
    
    setPendingTodos(prev => ({
      ...prev,
      [selectedTab]: [...prev[selectedTab], newGroup]
    }));
    
    // Reset group form
    setGroupTitle('');
    setGroupItems([]);
    setNewGroupItemText('');
    setIsCreatingGroup(false);
    setActiveTab('review'); // Switch to review tab
  };
  
  // Add item to group
  const addItemToGroup = () => {
    if (!newGroupItemText.trim()) return;
    
    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newGroupItemText.trim(),
      completed: false
    };
    
    setGroupItems([...groupItems, newItem]);
    setNewGroupItemText('');
  };
  
  // Remove item from group
  const removeItemFromGroup = (itemId) => {
    setGroupItems(groupItems.filter(item => item.id !== itemId));
  };
  
  // Remove todo/group from pending list
  const removePendingItem = (tabName, itemId) => {
    setPendingTodos(prev => ({
      ...prev,
      [tabName]: prev[tabName].filter(item => item.id !== itemId)
    }));
  };
  
  // Gesture handlers for swipe-to-dismiss
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  // Handle swipe gesture
  const handleGestureEnd = (event) => {
    const { translationY, velocityY } = event.nativeEvent;
    const screenHeight = Dimensions.get('window').height;
    const dismissThreshold = screenHeight * 0.2;
    const fastSwipeVelocity = 1200;
    
    const shouldDismiss = translationY > dismissThreshold || velocityY > fastSwipeVelocity;
    
    if (shouldDismiss) {
      // Animate to dismiss
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        Animated.timing(backgroundOpacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start(() => {
        translateY.setValue(0);
        onClose();
      });
    } else {
      // Snap back
      Animated.spring(translateY, {
        toValue: 0,
        tension: 150,
        friction: 8,
        useNativeDriver: true
      }).start();
    }
  };
  
  // Handle save all pending todos
  const handleSaveAllTodos = async () => {
    const totalTodos = getTotalTodoCount();
    
    if (totalTodos === 0) {
      Alert.alert('No Todos', 'Please add at least one to-do before saving');
      return;
    }
    
    // Check limits for free users
    if (!isPro) {
      for (const [tabName, todos] of Object.entries(pendingTodos)) {
        if (todos.length > 0) {
          const itemsToAdd = todos.reduce((count, todo) => {
            return count + (todo.isGroup ? todo.items.length : 1);
          }, 0);
          
          const limitCheck = checkTodoLimits(tabName, itemsToAdd);
          if (!limitCheck.canAdd) {
            showLimitExceededAlert(limitCheck, itemsToAdd);
            return;
          }
        }
      }
    }
    
    try {
      // Process all pending todos - preserve groups and individual todos
      let delayIndex = 0;
      
      Object.entries(pendingTodos).forEach(([tabName, todos]) => {
        todos.forEach(todo => {
          setTimeout(() => {
            if (todo.isGroup) {
              // Create as group - TodoScreen will handle displaying individual items
              onAdd({
                id: todo.id,
                title: todo.title,
                tab: tabName,
                isGroup: true,
                items: todo.items,
                completed: false,
                createdAt: new Date().toISOString()
              });
            } else {
              // Create as individual todo
              onAdd({
                id: todo.id,
                title: todo.title,
                tab: tabName,
                isGroup: false,
                completed: false,
                createdAt: new Date().toISOString()
              });
            }
          }, delayIndex * 15);
          delayIndex++;
        });
      });
      
      // Close modal after all items are processed
      setTimeout(() => {
        handleClose();
      }, delayIndex * 15 + 100);
      
    } catch (error) {
      console.error('Error adding todos:', error);
      Alert.alert('Error', 'Failed to add to-dos. Please try again.');
    }
  };
  
  // Update a group item
  const updateGroupItem = (itemId, newTitle) => {
    setGroupItems(groupItems.map(item => 
      item.id === itemId ? { ...item, title: newTitle } : item
    ));
  };
  
  // Dismiss keyboard when clicking outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  
  // Handle close with animation
  const handleClose = () => {
    const screenHeight = Dimensions.get('window').height;
    
    Animated.sequence([
      // First slide out the content
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }),
      // Then fade out the background
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      })
    ]).start(() => {
      onClose();
    });
  };
  
  return (
    <>
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel="Add to-do modal"
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: backgroundOpacityAnim
          }
        ]}
      >
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) {
              handleGestureEnd(event);
            }
          }}
        >
          <Animated.View
            style={[
              styles.gestureContainer,
              {
                transform: [
                  { translateY: Animated.add(slideAnim, translateY) }
                ]
              }
            ]}
          >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <KeyboardAvoidingView 
              style={styles.keyboardContainer} 
              behavior={Platform.OS === 'ios' ? 'padding' : null}
              keyboardVerticalOffset={Platform.OS === 'ios' ? scaleHeight(64) : 0}
            >
              <View style={[
                styles.modalContent, 
                { 
                  backgroundColor: theme.card,
                  paddingBottom: safeSpacing.bottom > spacing.m ? safeSpacing.bottom : spacing.xl,
                  borderTopLeftRadius: scaleWidth(16),
                  borderTopRightRadius: scaleWidth(16),
                }
              ]}>
              {/* Swipe indicator */}
              <View style={styles.swipeHandle}>
                <View style={[
                  styles.swipeIndicator,
                  { backgroundColor: theme.textSecondary + '40' }
                ]} />
              </View>
              
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle, 
                { 
                  color: theme.text,
                  fontSize: scaleFontSize(20),
                  maxFontSizeMultiplier: 1.3,
                }
              ]}>
                Create To-Dos
              </Text>
              <TouchableOpacity 
                style={[
                  styles.closeButton,
                  ensureAccessibleTouchTarget({ width: 30, height: 30 })
                ]} 
                onPress={handleClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                accessibilityHint="Closes the add to-do form"
              >
                <Ionicons name="close" size={scaleWidth(24)} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={[styles.formContainer, { flex: 1 }]}
              contentContainerStyle={{ paddingBottom: spacing.xl, flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Main Tabs */}
              <View style={[styles.mainTabs, { borderBottomColor: theme.border }]}>
                <TouchableOpacity
                  style={[
                    styles.mainTab,
                    activeTab === 'add' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
                  ]}
                  onPress={() => setActiveTab('add')}
                >
                  <Ionicons 
                    name="add-circle-outline" 
                    size={scaleWidth(20)} 
                    color={activeTab === 'add' ? theme.primary : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.mainTabText,
                    { 
                      color: activeTab === 'add' ? theme.primary : theme.textSecondary,
                      marginLeft: spacing.xs
                    }
                  ]}>
                    Add Items
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.mainTab,
                    activeTab === 'review' && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
                  ]}
                  onPress={() => setActiveTab('review')}
                >
                  <Ionicons 
                    name="list-outline" 
                    size={scaleWidth(20)} 
                    color={activeTab === 'review' ? theme.primary : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.mainTabText,
                    { 
                      color: activeTab === 'review' ? theme.primary : theme.textSecondary,
                      marginLeft: spacing.xs
                    }
                  ]}>
                    Review & Save ({getTotalTodoCount()})
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Add Tab Content */}
              {activeTab === 'add' && (
                <View style={{ marginTop: spacing.m }}>
                  {/* Tab Selector for where to add */}
                  <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFontSize(15) }]}>
                    Add to:
                  </Text>
                  <View style={styles.tabSelector}>
                    <TouchableOpacity
                      style={[
                        styles.tabOption,
                        selectedTab === 'today' && styles.tabOptionSelected,
                        { 
                          backgroundColor: selectedTab === 'today' ? buttonColor : theme.cardElevated,
                          borderColor: theme.border,
                        }
                      ]}
                      onPress={() => setSelectedTab('today')}
                    >
                      <Ionicons name="today-outline" size={scaleWidth(18)} color={selectedTab === 'today' ? '#FFFFFF' : theme.textSecondary} />
                      <Text style={[styles.tabOptionText, { color: selectedTab === 'today' ? '#FFFFFF' : theme.text, marginLeft: spacing.xs }]}>
                        Today ({getTodoCount('today')})
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.tabOption,
                        selectedTab === 'tomorrow' && styles.tabOptionSelected,
                        { 
                          backgroundColor: selectedTab === 'tomorrow' ? buttonColor : theme.cardElevated,
                          borderColor: theme.border,
                        }
                      ]}
                      onPress={() => setSelectedTab('tomorrow')}
                    >
                      <Ionicons name="calendar-outline" size={scaleWidth(18)} color={selectedTab === 'tomorrow' ? '#FFFFFF' : theme.textSecondary} />
                      <Text style={[styles.tabOptionText, { color: selectedTab === 'tomorrow' ? '#FFFFFF' : theme.text, marginLeft: spacing.xs }]}>
                        Tomorrow ({getTodoCount('tomorrow')})
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.tabOption,
                        selectedTab === 'later' && styles.tabOptionSelected,
                        { 
                          backgroundColor: selectedTab === 'later' ? buttonColor : theme.cardElevated,
                          borderColor: theme.border,
                        }
                      ]}
                      onPress={() => setSelectedTab('later')}
                    >
                      <Ionicons name="time-outline" size={scaleWidth(18)} color={selectedTab === 'later' ? '#FFFFFF' : theme.textSecondary} />
                      <Text style={[styles.tabOptionText, { color: selectedTab === 'later' ? '#FFFFFF' : theme.text, marginLeft: spacing.xs }]}>
                        Later ({getTodoCount('later')})
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Type Toggle */}
                  <View style={styles.typeToggle}>
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        !isCreatingGroup && styles.typeOptionSelected,
                        { 
                          backgroundColor: !isCreatingGroup ? buttonColor : theme.cardElevated,
                          borderColor: theme.border,
                        }
                      ]}
                      onPress={() => setIsCreatingGroup(false)}
                    >
                      <Ionicons name="checkbox-outline" size={scaleWidth(18)} color={!isCreatingGroup ? '#FFFFFF' : theme.textSecondary} />
                      <Text style={[styles.typeOptionText, { color: !isCreatingGroup ? '#FFFFFF' : theme.text, marginLeft: spacing.xs }]}>
                        Single To-Do
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        isCreatingGroup && styles.typeOptionSelected,
                        { 
                          backgroundColor: isCreatingGroup ? buttonColor : theme.cardElevated,
                          borderColor: theme.border,
                        }
                      ]}
                      onPress={() => setIsCreatingGroup(true)}
                    >
                      <Ionicons name="list" size={scaleWidth(18)} color={isCreatingGroup ? '#FFFFFF' : theme.textSecondary} />
                      <Text style={[styles.typeOptionText, { color: isCreatingGroup ? '#FFFFFF' : theme.text, marginLeft: spacing.xs }]}>
                        Group
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {!isCreatingGroup ? (
                    // Single Todo Form
                    <View>
                      <Text style={[styles.label, { color: theme.textSecondary, fontSize: scaleFontSize(15), marginTop: spacing.m }]}>
                        To-Do Title *
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          { 
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: theme.border,
                            fontSize: scaleFontSize(16),
                            paddingHorizontal: spacing.m,
                            paddingVertical: spacing.s,
                          }
                        ]}
                        value={todoTitle}
                        onChangeText={setTodoTitle}
                        placeholder="Enter to-do title (e.g., 'Finish report')"
                        placeholderTextColor={theme.textSecondary}
                        returnKeyType="done"
                        onSubmitEditing={addTodoToTab}
                      />
                      
                      <TouchableOpacity
                        style={[
                          styles.addButton,
                          { 
                            backgroundColor: !todoTitle.trim() ? (buttonColor + '50') : buttonColor,
                            marginTop: spacing.m,
                          }
                        ]}
                        onPress={addTodoToTab}
                        disabled={!todoTitle.trim()}
                      >
                        <Text style={[styles.addButtonText, { color: !todoTitle.trim() ? 'rgba(255,255,255,0.7)' : '#FFFFFF' }]}>
                          Add to {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    // Group Form
                    <View>
                      <Text style={[styles.label, { color: theme.textSecondary, fontSize: scaleFontSize(15), marginTop: spacing.m }]}>
                        Group Title *
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          { 
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: theme.border,
                          }
                        ]}
                        value={groupTitle}
                        onChangeText={setGroupTitle}
                        placeholder="Enter group title (e.g., 'House Cleaning')"
                        placeholderTextColor={theme.textSecondary}
                      />
                      
                      <Text style={[styles.label, { color: theme.textSecondary, fontSize: scaleFontSize(15) }]}>
                        Group Items ({groupItems.length})
                      </Text>
                      
                      {/* Group Items List */}
                      {groupItems.map((item, index) => (
                        <View key={item.id} style={[styles.groupItemContainer, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
                          <TextInput
                            style={[styles.groupItemInput, { color: theme.text, backgroundColor: 'transparent', flex: 1 }]}
                            value={item.title}
                            onChangeText={(text) => updateGroupItem(item.id, text)}
                            placeholder={`Item ${index + 1}`}
                            placeholderTextColor={theme.textSecondary}
                          />
                          <TouchableOpacity onPress={() => removeItemFromGroup(item.id)} style={styles.removeItemButton}>
                            <Ionicons name="close-circle" size={scaleWidth(20)} color={theme.error || '#ff4444'} />
                          </TouchableOpacity>
                        </View>
                      ))}
                      
                      {/* Add New Item */}
                      <View style={[styles.addItemContainer, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
                        <TextInput
                          style={[styles.groupItemInput, { color: theme.text, backgroundColor: 'transparent', flex: 1 }]}
                          value={newGroupItemText}
                          onChangeText={setNewGroupItemText}
                          placeholder="Add new item"
                          placeholderTextColor={theme.textSecondary}
                          returnKeyType="done"
                          onSubmitEditing={addItemToGroup}
                        />
                        <TouchableOpacity 
                          onPress={addItemToGroup}
                          style={[styles.addItemButton, { backgroundColor: buttonColor }]}
                          disabled={!newGroupItemText.trim()}
                        >
                          <Text style={[styles.addItemButtonText, { color: '#FFFFFF' }]}>Add</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <TouchableOpacity
                        style={[
                          styles.addButton,
                          { 
                            backgroundColor: (!groupTitle.trim() || groupItems.length === 0) ? (buttonColor + '50') : buttonColor,
                            marginTop: spacing.m,
                          }
                        ]}
                        onPress={addGroupToTab}
                        disabled={!groupTitle.trim() || groupItems.length === 0}
                      >
                        <Text style={[styles.addButtonText, { color: (!groupTitle.trim() || groupItems.length === 0) ? 'rgba(255,255,255,0.7)' : '#FFFFFF' }]}>
                          Add Group to {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              
              {/* Review Tab Content */}
              {activeTab === 'review' && (
                <View style={{ marginTop: spacing.m }}>
                  {getTotalTodoCount() > 0 ? (
                    <ScrollView style={{ maxHeight: scaleHeight(600) }}>
                      {Object.entries(pendingTodos).map(([tabName, todos]) => (
                        todos.length > 0 && (
                          <View key={tabName} style={[styles.tabSection, { marginBottom: spacing.m }]}>
                            <View style={[styles.tabHeader, { backgroundColor: theme.cardElevated }]}>
                              <Ionicons 
                                name={tabName === 'today' ? 'today-outline' : tabName === 'tomorrow' ? 'calendar-outline' : 'time-outline'} 
                                size={scaleWidth(20)} 
                                color={theme.primary} 
                              />
                              <Text style={[styles.tabHeaderText, { color: theme.text, marginLeft: spacing.xs }]}>
                                {tabName.charAt(0).toUpperCase() + tabName.slice(1)} ({todos.length})
                              </Text>
                            </View>
                            {todos.map((item) => (
                              <View key={item.id} style={[styles.todoItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.todoItemText, { color: theme.text }]}>
                                    {item.title}
                                  </Text>
                                  {item.isGroup && (
                                    <View style={{ marginTop: spacing.xs }}>
                                      {item.items.map((groupItem, index) => (
                                        <Text key={groupItem.id} style={[styles.groupItemPreview, { color: theme.textSecondary }]}>
                                          • {groupItem.title}
                                        </Text>
                                      ))}
                                    </View>
                                  )}
                                </View>
                                <TouchableOpacity
                                  onPress={() => removePendingItem(tabName, item.id)}
                                  style={styles.removeTodoButton}
                                >
                                  <Ionicons name="close-circle" size={scaleWidth(20)} color={theme.error || '#ff4444'} />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        )
                      ))}
                      
                      {/* Save All Button */}
                      <TouchableOpacity
                        style={[
                          styles.saveAllButton,
                          { backgroundColor: theme.success || buttonColor, marginTop: spacing.l }
                        ]}
                        onPress={handleSaveAllTodos}
                      >
                        <Text style={[styles.saveAllButtonText, { color: '#FFFFFF', fontWeight: '600' }]}>
                          Save All ({getTotalTodoCount()})
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  ) : (
                    <View style={styles.emptyStateContainer}>
                      <Ionicons name="list-outline" size={scaleWidth(48)} color={theme.textSecondary} />
                      <Text style={[styles.emptyStateText, { color: theme.textSecondary, marginTop: spacing.m }]}>
                        No todos added yet. Switch to "Add Items" to get started.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </Modal>

    {/* Limit Modal */}
    <FreeTierLimitModal
      visible={showLimitModal}
      theme={theme}
      limitType="todos"
      onClose={() => setShowLimitModal(false)}
      onUpgrade={() => {
        setShowLimitModal(false);
        if (navigation && navigation.navigate) {
          navigation.navigate('PricingScreen');
        }
      }}
      isDarkMode={theme.background === '#000000'}
    />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  gestureContainer: {
    justifyContent: 'flex-end'
  },
  keyboardContainer: {
    justifyContent: 'flex-end'
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent'
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.m,
    maxHeight: '95%',
    minHeight: '85%',
    height: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m
  },
  modalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold'
  },
  closeButton: {
    padding: spacing.xs
  },
  formContainer: {
    marginBottom: Platform.OS === 'ios' ? 0 : spacing.m
  },
  label: {
    marginBottom: spacing.xs
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: spacing.m
  },
  sectionTitle: {
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  // Type selector styles
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
    marginTop: spacing.xs
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: spacing.xxs
  },
  typeOptionSelected: {
    borderWidth: 0
  },
  typeOptionText: {
    fontWeight: '500',
  },
  // Tab selector styles
  tabSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m
  },
  tabOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: spacing.xxs
  },
  tabOptionSelected: {
    borderWidth: 0
  },
  tabOptionText: {
    fontWeight: '500',
  },
  // Group items styles
  groupItemsSection: {
    marginBottom: spacing.m
  },
  groupItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  groupItemIconContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  groupItemInput: {
    borderWidth: 1,
    borderRadius: 8,
    marginRight: spacing.xs
  },
  removeItemButton: {
    padding: spacing.xs
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addItemButton: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addItemButtonText: {
    color: '#FFFFFF',
    fontWeight: '500'
  },
  emptyGroupWarning: {
    fontStyle: 'italic',
    textAlign: 'center'
  },
  addButton: {
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  // Swipe gesture styles
  swipeHandle: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.s,
    alignItems: 'center',
  },
  swipeIndicator: {
    width: scaleWidth(40),
    height: scaleHeight(4),
    borderRadius: scaleWidth(2),
  },
  // Main tab styles
  mainTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginTop: spacing.m,
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
  },
  mainTabText: {
    fontSize: fontSizes.m,
    fontWeight: '500',
  },
  // Type toggle styles
  typeToggle: {
    flexDirection: 'row',
    marginTop: spacing.m,
    marginBottom: spacing.m,
    borderRadius: scaleWidth(8),
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: spacing.xs,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: scaleWidth(6),
    borderWidth: 1,
  },
  typeOptionSelected: {
    // backgroundColor set inline
  },
  typeOptionText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
  },
  // Group item styles
  groupItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(8),
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  groupItemInput: {
    fontSize: fontSizes.m,
    paddingVertical: spacing.xs,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(8),
    borderWidth: 1,
    marginBottom: spacing.m,
  },
  addItemButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(6),
    marginLeft: spacing.s,
  },
  addItemButtonText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
  },
  // Review tab styles
  tabSection: {
    marginBottom: spacing.m,
  },
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(8),
    marginBottom: spacing.xs,
  },
  tabHeaderText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(8),
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  todoItemText: {
    fontSize: fontSizes.m,
    fontWeight: '500',
  },
  groupItemPreview: {
    fontSize: fontSizes.s,
    marginLeft: spacing.m,
    lineHeight: 20,
  },
  removeTodoButton: {
    padding: spacing.xs,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    fontSize: fontSizes.m,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  addButton: {
    borderRadius: scaleWidth(8),
    paddingVertical: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  saveAllButton: {
    borderRadius: scaleWidth(8),
    paddingVertical: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveAllButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
});

export default AddTodoModal;