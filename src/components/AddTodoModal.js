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
import { LinearGradient } from 'expo-linear-gradient';
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
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: theme.background === '#000000' ? 0.3 : 0.15,
                  shadowRadius: 12,
                  elevation: 8,
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                  name="list-circle-outline" 
                  size={scaleWidth(28)} 
                  color={theme.primary} 
                  style={{ marginRight: spacing.xs }}
                />
                <Text style={[
                  styles.modalTitle, 
                  { 
                    color: theme.text,
                    fontSize: scaleFontSize(22),
                    fontWeight: '700',
                    maxFontSizeMultiplier: 1.3,
                  }
                ]}>
                  Create To-Dos
                </Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: theme.inputBackground,
                    borderRadius: scaleWidth(8),
                    padding: spacing.xs,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                  ensureAccessibleTouchTarget({ width: 36, height: 36 })
                ]} 
                onPress={handleClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                accessibilityHint="Closes the add to-do form"
              >
                <Ionicons name="close" size={scaleWidth(20)} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={[styles.formContainer, { flex: 1 }]}
              contentContainerStyle={{ paddingBottom: spacing.xl, flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Main Tabs */}
              <View style={[
                styles.mainTabs, 
                { 
                  backgroundColor: theme.inputBackground,
                  borderRadius: scaleWidth(12),
                  padding: spacing.xs,
                  marginBottom: spacing.m,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }
              ]}>
                <TouchableOpacity
                  style={[
                    styles.mainTab,
                    {
                      backgroundColor: activeTab === 'add' ? theme.primary : 'transparent',
                      borderRadius: scaleWidth(8),
                      paddingVertical: spacing.s,
                      paddingHorizontal: spacing.m,
                    }
                  ]}
                  onPress={() => setActiveTab('add')}
                >
                  <Ionicons 
                    name="add-circle-outline" 
                    size={scaleWidth(20)} 
                    color={activeTab === 'add' ? '#FFFFFF' : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.mainTabText,
                    { 
                      color: activeTab === 'add' ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: activeTab === 'add' ? '600' : '500',
                      marginLeft: spacing.xs
                    }
                  ]}>
                    Add Items
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.mainTab,
                    {
                      backgroundColor: activeTab === 'review' ? theme.primary : 'transparent',
                      borderRadius: scaleWidth(8),
                      paddingVertical: spacing.s,
                      paddingHorizontal: spacing.m,
                    }
                  ]}
                  onPress={() => setActiveTab('review')}
                >
                  <Ionicons 
                    name="list-outline" 
                    size={scaleWidth(20)} 
                    color={activeTab === 'review' ? '#FFFFFF' : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.mainTabText,
                    { 
                      color: activeTab === 'review' ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: activeTab === 'review' ? '600' : '500',
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
                  {/* Time Category Section */}
                  <View style={[
                    styles.sectionCard,
                    {
                      backgroundColor: theme.card,
                      borderRadius: scaleWidth(12),
                      padding: spacing.m,
                      marginBottom: spacing.m,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
                      shadowRadius: 6,
                      elevation: 3,
                    }
                  ]}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontSize: scaleFontSize(15), fontWeight: '600', marginBottom: spacing.s }]}>
                      Add to:
                    </Text>
                    <View style={styles.tabSelector}>
                      <TouchableOpacity
                        style={[
                          styles.tabOption,
                          { 
                            backgroundColor: selectedTab === 'today' ? '#22C55E' : theme.cardElevated,
                            borderRadius: scaleWidth(10),
                            shadowColor: selectedTab === 'today' ? '#22C55E' : '#000',
                            shadowOffset: { width: 0, height: selectedTab === 'today' ? 4 : 2 },
                            shadowOpacity: selectedTab === 'today' ? 0.25 : 0.05,
                            shadowRadius: selectedTab === 'today' ? 6 : 3,
                            elevation: selectedTab === 'today' ? 4 : 2,
                          }
                        ]}
                        onPress={() => setSelectedTab('today')}
                      >
                        <View style={[
                          styles.timeDot,
                          { backgroundColor: '#22C55E', opacity: selectedTab === 'today' ? 0 : 1 }
                        ]} />
                        <Ionicons name="today-outline" size={scaleWidth(18)} color={selectedTab === 'today' ? '#FFFFFF' : '#22C55E'} />
                        <Text style={[styles.tabOptionText, { color: selectedTab === 'today' ? '#FFFFFF' : theme.text, marginLeft: spacing.xs, fontWeight: selectedTab === 'today' ? '600' : '500' }]}>
                          Today
                        </Text>
                        {getTodoCount('today') > 0 && (
                          <View style={[styles.badge, { backgroundColor: selectedTab === 'today' ? 'rgba(255,255,255,0.3)' : '#22C55E20' }]}>
                            <Text style={[styles.badgeText, { color: selectedTab === 'today' ? '#FFFFFF' : '#22C55E', fontWeight: '700' }]}>
                              {getTodoCount('today')}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.tabOption,
                          { 
                            backgroundColor: selectedTab === 'tomorrow' ? '#3B82F6' : theme.cardElevated,
                            borderRadius: scaleWidth(10),
                            shadowColor: selectedTab === 'tomorrow' ? '#3B82F6' : '#000',
                            shadowOffset: { width: 0, height: selectedTab === 'tomorrow' ? 4 : 2 },
                            shadowOpacity: selectedTab === 'tomorrow' ? 0.25 : 0.05,
                            shadowRadius: selectedTab === 'tomorrow' ? 6 : 3,
                            elevation: selectedTab === 'tomorrow' ? 4 : 2,
                          }
                        ]}
                        onPress={() => setSelectedTab('tomorrow')}
                      >
                        <View style={[
                          styles.timeDot,
                          { backgroundColor: '#3B82F6', opacity: selectedTab === 'tomorrow' ? 0 : 1 }
                        ]} />
                        <Ionicons name="calendar-outline" size={scaleWidth(18)} color={selectedTab === 'tomorrow' ? '#FFFFFF' : '#3B82F6'} />
                        <Text style={[styles.tabOptionText, { color: selectedTab === 'tomorrow' ? '#FFFFFF' : theme.text, marginLeft: spacing.xs, fontWeight: selectedTab === 'tomorrow' ? '600' : '500' }]}>
                          Tomorrow
                        </Text>
                        {getTodoCount('tomorrow') > 0 && (
                          <View style={[styles.badge, { backgroundColor: selectedTab === 'tomorrow' ? 'rgba(255,255,255,0.3)' : '#3B82F620' }]}>
                            <Text style={[styles.badgeText, { color: selectedTab === 'tomorrow' ? '#FFFFFF' : '#3B82F6', fontWeight: '700' }]}>
                              {getTodoCount('tomorrow')}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.tabOption,
                          { 
                            backgroundColor: selectedTab === 'later' ? '#8B5CF6' : theme.cardElevated,
                            borderRadius: scaleWidth(10),
                            shadowColor: selectedTab === 'later' ? '#8B5CF6' : '#000',
                            shadowOffset: { width: 0, height: selectedTab === 'later' ? 4 : 2 },
                            shadowOpacity: selectedTab === 'later' ? 0.25 : 0.05,
                            shadowRadius: selectedTab === 'later' ? 6 : 3,
                            elevation: selectedTab === 'later' ? 4 : 2,
                          }
                        ]}
                        onPress={() => setSelectedTab('later')}
                      >
                        <View style={[
                          styles.timeDot,
                          { backgroundColor: '#8B5CF6', opacity: selectedTab === 'later' ? 0 : 1 }
                        ]} />
                        <Ionicons name="time-outline" size={scaleWidth(18)} color={selectedTab === 'later' ? '#FFFFFF' : '#8B5CF6'} />
                        <Text style={[styles.tabOptionText, { color: selectedTab === 'later' ? '#FFFFFF' : theme.text, marginLeft: spacing.xs, fontWeight: selectedTab === 'later' ? '600' : '500' }]}>
                          Later
                        </Text>
                        {getTodoCount('later') > 0 && (
                          <View style={[styles.badge, { backgroundColor: selectedTab === 'later' ? 'rgba(255,255,255,0.3)' : '#8B5CF620' }]}>
                            <Text style={[styles.badgeText, { color: selectedTab === 'later' ? '#FFFFFF' : '#8B5CF6', fontWeight: '700' }]}>
                              {getTodoCount('later')}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  {/* Type Toggle */}
                  <View style={[
                    styles.typeToggle,
                    {
                      backgroundColor: theme.inputBackground,
                      borderRadius: scaleWidth(12),
                      padding: spacing.xs,
                      marginBottom: spacing.m,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 1,
                    }
                  ]}>
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        {
                          backgroundColor: !isCreatingGroup ? theme.primary : 'transparent',
                          borderRadius: scaleWidth(8),
                        }
                      ]}
                      onPress={() => setIsCreatingGroup(false)}
                    >
                      <Ionicons name="checkbox-outline" size={scaleWidth(18)} color={!isCreatingGroup ? '#FFFFFF' : theme.textSecondary} />
                      <Text style={[styles.typeOptionText, { color: !isCreatingGroup ? '#FFFFFF' : theme.text, marginLeft: spacing.xs, fontWeight: !isCreatingGroup ? '600' : '500' }]}>
                        Single To-Do
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.typeOption,
                        {
                          backgroundColor: isCreatingGroup ? theme.primary : 'transparent',
                          borderRadius: scaleWidth(8),
                        }
                      ]}
                      onPress={() => setIsCreatingGroup(true)}
                    >
                      <Ionicons name="list" size={scaleWidth(18)} color={isCreatingGroup ? '#FFFFFF' : theme.textSecondary} />
                      <Text style={[styles.typeOptionText, { color: isCreatingGroup ? '#FFFFFF' : theme.text, marginLeft: spacing.xs, fontWeight: isCreatingGroup ? '600' : '500' }]}>
                        Group
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {!isCreatingGroup ? (
                    // Single Todo Form
                    <View style={[
                      styles.formCard,
                      {
                        backgroundColor: theme.card,
                        borderRadius: scaleWidth(12),
                        padding: spacing.m,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
                        shadowRadius: 6,
                        elevation: 3,
                      }
                    ]}>
                      <Text style={[styles.label, { color: theme.textSecondary, fontSize: scaleFontSize(15), fontWeight: '600', marginBottom: spacing.s }]}>
                        To-Do Title *
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          { 
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: theme.border,
                            borderRadius: scaleWidth(12),
                            fontSize: scaleFontSize(16),
                            paddingHorizontal: spacing.m,
                            paddingVertical: spacing.s,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 1,
                          }
                        ]}
                        value={todoTitle}
                        onChangeText={setTodoTitle}
                        placeholder="Enter to-do title (e.g., 'Finish report')"
                        placeholderTextColor={theme.textSecondary + '80'}
                        returnKeyType="done"
                        onSubmitEditing={addTodoToTab}
                      />
                      
                      <TouchableOpacity
                        style={[
                          styles.addButton,
                          { 
                            backgroundColor: !todoTitle.trim() ? (theme.primary + '50') : 'transparent',
                            marginTop: spacing.m,
                            borderRadius: scaleWidth(12),
                            shadowColor: !todoTitle.trim() ? 'transparent' : theme.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: !todoTitle.trim() ? 0 : 0.25,
                            shadowRadius: 8,
                            elevation: !todoTitle.trim() ? 0 : 6,
                            overflow: 'hidden'
                          }
                        ]}
                        onPress={addTodoToTab}
                        disabled={!todoTitle.trim()}
                      >
                        {todoTitle.trim() ? (
                          <LinearGradient
                            colors={[theme.primary, theme.primary + 'DD']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                          >
                            <LinearGradient
                              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 0, y: 1 }}
                              style={styles.buttonHighlight}
                            />
                            <Ionicons 
                              name="add-circle" 
                              size={scaleWidth(20)} 
                              color="#FFFFFF" 
                              style={{ marginRight: spacing.xs }}
                            />
                            <Text style={[styles.addButtonText, { color: '#FFFFFF', fontWeight: '700' }]}>
                              Add to {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <Text style={[styles.addButtonText, { color: 'rgba(255,255,255,0.7)', fontWeight: '600' }]}>
                            Add to {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    // Group Form
                    <View style={[
                      styles.formCard,
                      {
                        backgroundColor: theme.card,
                        borderRadius: scaleWidth(12),
                        padding: spacing.m,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
                        shadowRadius: 6,
                        elevation: 3,
                      }
                    ]}>
                      <Text style={[styles.label, { color: theme.textSecondary, fontSize: scaleFontSize(15), fontWeight: '600', marginBottom: spacing.s }]}>
                        Group Title *
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          { 
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: theme.border,
                            borderRadius: scaleWidth(12),
                            paddingHorizontal: spacing.m,
                            paddingVertical: spacing.s,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 1,
                          }
                        ]}
                        value={groupTitle}
                        onChangeText={setGroupTitle}
                        placeholder="Enter group title (e.g., 'House Cleaning')"
                        placeholderTextColor={theme.textSecondary + '80'}
                      />
                      
                      <Text style={[styles.label, { color: theme.textSecondary, fontSize: scaleFontSize(15), fontWeight: '600', marginTop: spacing.m, marginBottom: spacing.s }]}>
                        Group Items ({groupItems.length})
                      </Text>
                      
                      {/* Group Items List */}
                      {groupItems.map((item, index) => (
                        <View key={item.id} style={[
                          styles.groupItemContainer, 
                          { 
                            backgroundColor: theme.cardElevated,
                            borderRadius: scaleWidth(10),
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 3,
                            elevation: 2,
                          }
                        ]}>
                          <View style={{
                            width: scaleWidth(6),
                            height: scaleWidth(6),
                            borderRadius: scaleWidth(3),
                            backgroundColor: theme.primary,
                            marginRight: spacing.s,
                            alignSelf: 'center'
                          }} />
                          <TextInput
                            style={[styles.groupItemInput, { color: theme.text, backgroundColor: 'transparent', flex: 1, fontSize: scaleFontSize(16) }]}
                            value={item.title}
                            onChangeText={(text) => updateGroupItem(item.id, text)}
                            placeholder={`Item ${index + 1}`}
                            placeholderTextColor={theme.textSecondary + '80'}
                          />
                          <TouchableOpacity 
                            onPress={() => removeItemFromGroup(item.id)} 
                            style={[
                              styles.removeItemButton,
                              {
                                backgroundColor: theme.errorLight || '#FFEBEE',
                                borderRadius: scaleWidth(16),
                                padding: spacing.xs
                              }
                            ]}
                          >
                            <Ionicons name="close" size={scaleWidth(16)} color={theme.error || '#E53E3E'} />
                          </TouchableOpacity>
                        </View>
                      ))}
                      
                      {/* Add New Item */}
                      <View style={[
                        styles.addItemContainer, 
                        { 
                          backgroundColor: theme.cardElevated,
                          borderRadius: scaleWidth(10),
                          borderWidth: 2,
                          borderColor: theme.primary + '30',
                          borderStyle: 'dashed',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.05,
                          shadowRadius: 3,
                          elevation: 2,
                        }
                      ]}>
                        <Ionicons name="add" size={scaleWidth(18)} color={theme.primary} style={{ marginRight: spacing.s }} />
                        <TextInput
                          style={[styles.groupItemInput, { color: theme.text, backgroundColor: 'transparent', flex: 1, fontSize: scaleFontSize(16) }]}
                          value={newGroupItemText}
                          onChangeText={setNewGroupItemText}
                          placeholder="Add new item"
                          placeholderTextColor={theme.textSecondary + '80'}
                          returnKeyType="done"
                          onSubmitEditing={addItemToGroup}
                        />
                        <TouchableOpacity 
                          onPress={addItemToGroup}
                          style={[
                            styles.addItemButton, 
                            { 
                              backgroundColor: newGroupItemText.trim() ? theme.primary : theme.primary + '50',
                              borderRadius: scaleWidth(8),
                              shadowColor: newGroupItemText.trim() ? theme.primary : 'transparent',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: newGroupItemText.trim() ? 0.25 : 0,
                              shadowRadius: 4,
                              elevation: newGroupItemText.trim() ? 3 : 0,
                            }
                          ]}
                          disabled={!newGroupItemText.trim()}
                        >
                          <Text style={[styles.addItemButtonText, { color: '#FFFFFF', fontWeight: '600' }]}>Add</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <TouchableOpacity
                        style={[
                          styles.addButton,
                          { 
                            backgroundColor: (!groupTitle.trim() || groupItems.length === 0) ? (theme.primary + '50') : 'transparent',
                            marginTop: spacing.m,
                            borderRadius: scaleWidth(12),
                            shadowColor: (!groupTitle.trim() || groupItems.length === 0) ? 'transparent' : theme.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: (!groupTitle.trim() || groupItems.length === 0) ? 0 : 0.25,
                            shadowRadius: 8,
                            elevation: (!groupTitle.trim() || groupItems.length === 0) ? 0 : 6,
                            overflow: 'hidden'
                          }
                        ]}
                        onPress={addGroupToTab}
                        disabled={!groupTitle.trim() || groupItems.length === 0}
                      >
                        {(groupTitle.trim() && groupItems.length > 0) ? (
                          <LinearGradient
                            colors={[theme.primary, theme.primary + 'DD']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientButton}
                          >
                            <LinearGradient
                              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 0, y: 1 }}
                              style={styles.buttonHighlight}
                            />
                            <Ionicons 
                              name="albums-outline" 
                              size={scaleWidth(20)} 
                              color="#FFFFFF" 
                              style={{ marginRight: spacing.xs }}
                            />
                            <Text style={[styles.addButtonText, { color: '#FFFFFF', fontWeight: '700' }]}>
                              Add Group to {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <Text style={[styles.addButtonText, { color: 'rgba(255,255,255,0.7)', fontWeight: '600' }]}>
                            Add Group to {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              
              {/* Review Tab Content */}
              {activeTab === 'review' && (
                <View style={{ marginTop: spacing.m }}>
                  {getTotalTodoCount() > 0 ? (
                    <ScrollView style={{ maxHeight: scaleHeight(600) }} showsVerticalScrollIndicator={false}>
                      {Object.entries(pendingTodos).map(([tabName, todos]) => {
                        const tabColor = tabName === 'today' ? '#22C55E' : tabName === 'tomorrow' ? '#3B82F6' : '#8B5CF6';
                        return todos.length > 0 && (
                          <View key={tabName} style={[
                            styles.tabSection, 
                            {
                              backgroundColor: theme.card,
                              borderRadius: scaleWidth(12),
                              padding: spacing.m,
                              marginBottom: spacing.m,
                              shadowColor: '#000',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
                              shadowRadius: 6,
                              elevation: 3,
                            }
                          ]}>
                            <View style={[
                              styles.tabHeader, 
                              { 
                                backgroundColor: tabColor + '15',
                                borderRadius: scaleWidth(8),
                                borderLeftWidth: 4,
                                borderLeftColor: tabColor,
                              }
                            ]}>
                              <Ionicons 
                                name={tabName === 'today' ? 'today-outline' : tabName === 'tomorrow' ? 'calendar-outline' : 'time-outline'} 
                                size={scaleWidth(20)} 
                                color={tabColor} 
                              />
                              <Text style={[styles.tabHeaderText, { color: theme.text, marginLeft: spacing.xs, fontWeight: '700' }]}>
                                {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
                              </Text>
                              <View style={[
                                styles.badge,
                                {
                                  backgroundColor: tabColor,
                                  marginLeft: spacing.xs,
                                  shadowColor: tabColor,
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.3,
                                  shadowRadius: 4,
                                  elevation: 3,
                                }
                              ]}>
                                <Text style={[styles.badgeText, { color: '#FFFFFF', fontWeight: '700' }]}>
                                  {todos.length}
                                </Text>
                              </View>
                            </View>
                            <View style={{ marginTop: spacing.s }}>
                              {todos.map((item) => (
                                <View key={item.id} style={[
                                  styles.todoItem, 
                                  { 
                                    backgroundColor: theme.cardElevated,
                                    borderLeftWidth: 3,
                                    borderLeftColor: tabColor,
                                    borderRadius: scaleWidth(10),
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 3,
                                    elevation: 2,
                                  }
                                ]}>
                                  <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: item.isGroup ? spacing.xs : 0 }}>
                                      <Ionicons 
                                        name={item.isGroup ? 'albums-outline' : 'checkbox-outline'} 
                                        size={scaleWidth(18)} 
                                        color={tabColor} 
                                        style={{ marginRight: spacing.xs }}
                                      />
                                      <Text style={[styles.todoItemText, { color: theme.text, fontWeight: '600', flex: 1 }]}>
                                        {item.title}
                                      </Text>
                                    </View>
                                    {item.isGroup && (
                                      <View style={{ marginLeft: spacing.l }}>
                                        {item.items.map((groupItem, index) => (
                                          <View key={groupItem.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xxs }}>
                                            <View style={{
                                              width: scaleWidth(4),
                                              height: scaleWidth(4),
                                              borderRadius: scaleWidth(2),
                                              backgroundColor: tabColor,
                                              marginRight: spacing.s
                                            }} />
                                            <Text style={[styles.groupItemPreview, { color: theme.textSecondary, fontSize: scaleFontSize(14) }]}>
                                              {groupItem.title}
                                            </Text>
                                          </View>
                                        ))}
                                      </View>
                                    )}
                                  </View>
                                  <TouchableOpacity
                                    onPress={() => removePendingItem(tabName, item.id)}
                                    style={[
                                      styles.removeTodoButton,
                                      {
                                        backgroundColor: theme.errorLight || '#FFEBEE',
                                        borderRadius: scaleWidth(16),
                                        padding: spacing.xs
                                      }
                                    ]}
                                  >
                                    <Ionicons name="close" size={scaleWidth(16)} color={theme.error || '#E53E3E'} />
                                  </TouchableOpacity>
                                </View>
                              ))}
                            </View>
                          </View>
                        );
                      })}
                      
                      {/* Save All Button */}
                      <TouchableOpacity
                        style={[
                          styles.saveAllButton,
                          { 
                            marginTop: spacing.l,
                            borderRadius: scaleWidth(12),
                            shadowColor: theme.success || theme.primary,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.25,
                            shadowRadius: 8,
                            elevation: 6,
                            overflow: 'hidden'
                          }
                        ]}
                        onPress={handleSaveAllTodos}
                      >
                        <LinearGradient
                          colors={[
                            theme.success || theme.primary,
                            (theme.success || theme.primary) + 'DD'
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.gradientButton}
                        >
                          <LinearGradient
                            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={styles.buttonHighlight}
                          />
                          <Ionicons 
                            name="checkmark-done-circle" 
                            size={scaleWidth(24)} 
                            color="#FFFFFF" 
                            style={{ marginRight: spacing.s }}
                          />
                          <Text style={[styles.saveAllButtonText, { color: '#FFFFFF', fontWeight: '700', fontSize: scaleFontSize(18) }]}>
                            Save All ({getTotalTodoCount()}) To-Dos
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </ScrollView>
                  ) : (
                    <View style={[
                      styles.emptyStateContainer,
                      {
                        backgroundColor: theme.card,
                        borderRadius: scaleWidth(12),
                        padding: spacing.xl,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
                        shadowRadius: 6,
                        elevation: 3,
                      }
                    ]}>
                      <View style={[
                        styles.emptyIconContainer,
                        {
                          backgroundColor: theme.primary + '20',
                          borderRadius: scaleWidth(32),
                          padding: spacing.m,
                          marginBottom: spacing.m
                        }
                      ]}>
                        <Ionicons name="list-outline" size={scaleWidth(48)} color={theme.primary} />
                      </View>
                      <Text style={[
                        styles.emptyStateTitle,
                        { 
                          color: theme.text, 
                          fontSize: scaleFontSize(18),
                          fontWeight: '700',
                          marginBottom: spacing.xs,
                          textAlign: 'center'
                        }
                      ]}>
                        Ready to Add To-Dos
                      </Text>
                      <Text style={[
                        styles.emptyStateText, 
                        { 
                          color: theme.textSecondary, 
                          fontSize: scaleFontSize(15),
                          textAlign: 'center',
                          lineHeight: 22
                        }
                      ]}>
                        Switch to "Add Items" to create your to-do list. You can add individual items or create organized groups.
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
  // Section card styles
  sectionCard: {
    // Styling applied inline
  },
  // Tab selector styles
  tabSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.xs,
    flex: 1,
    marginHorizontal: spacing.xxs
  },
  tabOptionText: {
    fontWeight: '500',
  },
  timeDot: {
    width: scaleWidth(6),
    height: scaleWidth(6),
    borderRadius: scaleWidth(3),
    marginRight: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: scaleWidth(10),
    minWidth: scaleWidth(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
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
    marginTop: spacing.m,
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTabText: {
    fontSize: fontSizes.m,
  },
  // Form card styles
  formCard: {
    // Styling applied inline
  },
  // Type toggle styles
  typeToggle: {
    flexDirection: 'row',
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  typeOptionText: {
    fontSize: fontSizes.s,
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
    // Styling applied inline
  },
  tabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  tabHeaderText: {
    fontSize: fontSizes.m,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
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
  },
  emptyIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    // Styling applied inline
  },
  emptyStateText: {
    fontSize: fontSizes.m,
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
    // Styling applied inline
  },
  saveAllButtonText: {
    fontSize: fontSizes.m,
  },
  // Gradient button styles
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.m,
  },
  buttonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
});

export default AddTodoModal;