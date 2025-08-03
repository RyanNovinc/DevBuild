// src/components/AddTodoModal.js
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
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  todoData
}) => {
  const { theme } = useTheme();
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
  
  // Todo state
  const [title, setTitle] = useState('');
  const [tab, setTab] = useState('today'); // 'today', 'tomorrow', 'later'
  const [isGroup, setIsGroup] = useState(false);
  const [groupItems, setGroupItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');
  
  // Get theme-aware button color
  const buttonColor = theme.primary;

  // Function to get current todo count for a specific tab
  const getCurrentTodoCount = (targetTab) => {
    switch (targetTab) {
      case 'today':
        return todos.length;
      case 'tomorrow':
        return tomorrowTodos.length;
      case 'later':
        return laterTodos.length;
      default:
        return 0;
    }
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
        // TODO: Navigate to upgrade screen
        Alert.alert("Upgrade to Pro", "Navigate to upgrade screen - implement this navigation");
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

  // Update form when editing a todo
  useEffect(() => {
    if (visible && todoData) {
      setTitle(todoData.title || '');
      setTab(todoData.tab || 'today');
      setIsGroup(todoData.isGroup || false);
      
      // Set group items if this is a group and has items
      if (todoData.isGroup && Array.isArray(todoData.items)) {
        setGroupItems([...todoData.items]);
      } else {
        setGroupItems([]);
      }
    } else if (!visible) {
      // Reset form when closing
      resetForm();
    }
  }, [todoData, visible]);
  
  // Reset form
  const resetForm = () => {
    setTitle('');
    setTab('today');
    setIsGroup(false);
    setGroupItems([]);
    setNewItemText('');
  };
  
  // Handle add todo
  const handleAddTodo = async () => {
    if (!title.trim()) {
      Alert.alert(
        "Title Required", 
        "Please enter a title for this to-do.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // For groups, ensure we have at least one item
    if (isGroup && groupItems.length === 0) {
      Alert.alert(
        "Add Items", 
        "Please add at least one item to this group.",
        [{ text: "OK" }]
      );
      return;
    }

    // Check limits for free users
    if (!isPro) {
      const itemsToAdd = isGroup ? groupItems.length : 1;
      const limitCheck = checkTodoLimits(tab, itemsToAdd);
      
      if (!limitCheck.canAdd) {
        showLimitExceededAlert(limitCheck, itemsToAdd);
        return;
      }
    }
    
    try {
      // Create the updated todo data
      const updatedTodoData = {
        ...todoData,
        title: title.trim(),
        tab: tab,
        isGroup: isGroup,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      
      // Generate a new ID if this is a new todo
      if (!updatedTodoData.id) {
        updatedTodoData.id = `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // If it's a group, add the items
      if (isGroup) {
        // Handle group items creation
        const groupId = updatedTodoData.id;
        const formattedItems = groupItems.map(item => ({
          id: item.id || `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: item.title,
          completed: false,
          groupId: groupId,
          createdAt: new Date().toISOString(),
        }));
        
        // Store items separately for API (will be combined in storage)
        updatedTodoData.items = formattedItems;
      }
      
      // Call parent handler (this will handle the storage in TodoListScreen)
      onAdd(updatedTodoData);
      
    } catch (error) {
      console.error('Error adding todo:', error);
      Alert.alert('Error', 'Failed to add to-do. Please try again.');
    }
  };
  
  // Add a new item to the group
  const handleAddGroupItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newItemText.trim(),
      completed: false
    };
    
    setGroupItems([...groupItems, newItem]);
    setNewItemText('');
  };
  
  // Update an item
  const handleUpdateGroupItem = (id, newTitle) => {
    setGroupItems(groupItems.map(item => 
      item.id === id ? { ...item, title: newTitle } : item
    ));
  };
  
  // Remove an item
  const handleRemoveGroupItem = (id) => {
    setGroupItems(groupItems.filter(item => item.id !== id));
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
        <Animated.View
          style={[
            styles.gestureContainer,
            {
              transform: [{ translateY: slideAnim }]
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
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle, 
                { 
                  color: theme.text,
                  fontSize: scaleFontSize(20),
                  maxFontSizeMultiplier: 1.3,
                }
              ]}>
                {isGroup ? 'Create To-Do Group' : 'Create To-Do'}
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
              style={styles.formContainer}
              contentContainerStyle={{ paddingBottom: spacing.xl }}
            >
              {/* Type Selector */}
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    !isGroup && styles.typeOptionSelected,
                    { 
                      backgroundColor: !isGroup ? buttonColor : theme.cardElevated,
                      borderColor: theme.border,
                      minHeight: accessibility.minTouchTarget,
                    }
                  ]}
                  onPress={() => setIsGroup(false)}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityLabel="Single to-do"
                  accessibilityState={{ checked: !isGroup }}
                  accessibilityHint="Select to create a single to-do item"
                >
                  <Ionicons 
                    name="checkbox-outline" 
                    size={scaleWidth(20)} 
                    color={!isGroup ? '#FFFFFF' : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.typeOptionText, 
                    { 
                      color: !isGroup ? '#FFFFFF' : theme.text,
                      fontSize: scaleFontSize(14),
                      marginLeft: spacing.xs,
                      maxFontSizeMultiplier: 1.3,
                    }
                  ]}>
                    Single To-Do
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    isGroup && styles.typeOptionSelected,
                    { 
                      backgroundColor: isGroup ? buttonColor : theme.cardElevated,
                      borderColor: theme.border,
                      minHeight: accessibility.minTouchTarget,
                    }
                  ]}
                  onPress={() => setIsGroup(true)}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityLabel="To-do group"
                  accessibilityState={{ checked: isGroup }}
                  accessibilityHint="Select to create a group of to-do items"
                >
                  <Ionicons 
                    name="list-outline" 
                    size={scaleWidth(20)} 
                    color={isGroup ? '#FFFFFF' : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.typeOptionText, 
                    { 
                      color: isGroup ? '#FFFFFF' : theme.text,
                      fontSize: scaleFontSize(14),
                      marginLeft: spacing.xs,
                      maxFontSizeMultiplier: 1.3,
                    }
                  ]}>
                    To-Do Group
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Tab Selector */}
              <Text style={[
                styles.sectionTitle, 
                { 
                  color: theme.textSecondary,
                  fontSize: scaleFontSize(15),
                  marginTop: spacing.m,
                  maxFontSizeMultiplier: 1.3,
                }
              ]}>
                Add to:
              </Text>
              <View style={styles.tabSelector}>
                <TouchableOpacity
                  style={[
                    styles.tabOption,
                    tab === 'today' && styles.tabOptionSelected,
                    { 
                      backgroundColor: tab === 'today' ? buttonColor : theme.cardElevated,
                      borderColor: theme.border,
                      minHeight: accessibility.minTouchTarget,
                    }
                  ]}
                  onPress={() => setTab('today')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityLabel="Today tab"
                  accessibilityState={{ checked: tab === 'today' }}
                  accessibilityHint="Add to-do to today's list"
                >
                  <Ionicons 
                    name="today-outline" 
                    size={scaleWidth(20)} 
                    color={tab === 'today' ? '#FFFFFF' : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.tabOptionText, 
                    { 
                      color: tab === 'today' ? '#FFFFFF' : theme.text,
                      fontSize: scaleFontSize(14),
                      marginLeft: spacing.xs,
                      maxFontSizeMultiplier: 1.3,
                    }
                  ]}>
                    Today
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.tabOption,
                    tab === 'tomorrow' && styles.tabOptionSelected,
                    { 
                      backgroundColor: tab === 'tomorrow' ? buttonColor : theme.cardElevated,
                      borderColor: theme.border,
                      minHeight: accessibility.minTouchTarget,
                    }
                  ]}
                  onPress={() => setTab('tomorrow')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityLabel="Tomorrow tab"
                  accessibilityState={{ checked: tab === 'tomorrow' }}
                  accessibilityHint="Add to-do to tomorrow's list"
                >
                  <Ionicons 
                    name="calendar-outline" 
                    size={scaleWidth(20)} 
                    color={tab === 'tomorrow' ? '#FFFFFF' : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.tabOptionText, 
                    { 
                      color: tab === 'tomorrow' ? '#FFFFFF' : theme.text,
                      fontSize: scaleFontSize(14),
                      marginLeft: spacing.xs,
                      maxFontSizeMultiplier: 1.3,
                    }
                  ]}>
                    Tomorrow
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.tabOption,
                    tab === 'later' && styles.tabOptionSelected,
                    { 
                      backgroundColor: tab === 'later' ? buttonColor : theme.cardElevated,
                      borderColor: theme.border,
                      minHeight: accessibility.minTouchTarget,
                    }
                  ]}
                  onPress={() => setTab('later')}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityLabel="Later tab"
                  accessibilityState={{ checked: tab === 'later' }}
                  accessibilityHint="Add to-do to later list"
                >
                  <Ionicons 
                    name="time-outline" 
                    size={scaleWidth(20)} 
                    color={tab === 'later' ? '#FFFFFF' : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.tabOptionText, 
                    { 
                      color: tab === 'later' ? '#FFFFFF' : theme.text,
                      fontSize: scaleFontSize(14),
                      marginLeft: spacing.xs,
                      maxFontSizeMultiplier: 1.3,
                    }
                  ]}>
                    Later
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Title Field */}
              <Text style={[
                styles.label, 
                { 
                  color: theme.textSecondary,
                  fontSize: scaleFontSize(15),
                  marginTop: spacing.m,
                  maxFontSizeMultiplier: 1.3,
                }
              ]}>
                {isGroup ? 'Group Title' : 'To-Do Title'} *
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
                    minHeight: accessibility.minTouchTarget,
                  }
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder={isGroup ? "Enter group title (e.g., 'Work Tasks')" : "Enter to-do title (e.g., 'Finish report')"}
                placeholderTextColor={theme.textSecondary}
                autoFocus={false}
                maxFontSizeMultiplier={1.3}
                accessible={true}
                accessibilityLabel={isGroup ? "Group title" : "To-do title"}
                accessibilityHint={isGroup ? "Enter a name for your group" : "Enter a name for your to-do"}
              />
              
              {/* Group Items Section */}
              {isGroup && (
                <View style={[
                  styles.groupItemsSection,
                  { marginTop: spacing.m }
                ]}>
                  <Text style={[
                    styles.sectionTitle, 
                    { 
                      color: theme.textSecondary,
                      fontSize: scaleFontSize(15),
                      maxFontSizeMultiplier: 1.3,
                    }
                  ]}>
                    Items in Group ({groupItems.length})
                  </Text>
                  
                  {/* Group Items List */}
                  {groupItems.map((item, index) => (
                    <View 
                      key={item.id || index} 
                      style={[
                        styles.groupItemContainer,
                        { marginTop: index > 0 ? spacing.xs : spacing.s }
                      ]}
                    >
                      <View style={[
                        styles.groupItemIconContainer,
                        {
                          minWidth: accessibility.minTouchTarget * 0.8,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }
                      ]}>
                        <Ionicons 
                          name="radio-button-off" 
                          size={scaleWidth(20)} 
                          color={theme.textSecondary} 
                        />
                      </View>
                      <TextInput
                        style={[
                          styles.groupItemInput,
                          { 
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: theme.border,
                            fontSize: scaleFontSize(15),
                            paddingHorizontal: spacing.s,
                            paddingVertical: spacing.xs,
                            flex: 1,
                            minHeight: accessibility.minTouchTarget,
                            textAlignVertical: 'top',
                          }
                        ]}
                        value={item.title}
                        onChangeText={(text) => handleUpdateGroupItem(item.id, text)}
                        placeholder={`Item ${index + 1}`}
                        placeholderTextColor={theme.textSecondary}
                        multiline={true}
                        scrollEnabled={false}
                        maxFontSizeMultiplier={1.3}
                        accessible={true}
                        accessibilityLabel={`Group item ${index + 1}`}
                        accessibilityHint="Edit this group item"
                      />
                      <TouchableOpacity 
                        style={[
                          styles.removeItemButton,
                          ensureAccessibleTouchTarget({ width: 30, height: 30 })
                        ]}
                        onPress={() => handleRemoveGroupItem(item.id)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove item ${index + 1}`}
                        accessibilityHint="Removes this item from the group"
                      >
                        <Ionicons 
                          name="close-circle" 
                          size={scaleWidth(22)} 
                          color={theme.error || 'red'} 
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                  
                  {/* Add New Item Input */}
                  <View style={[
                    styles.addItemContainer,
                    { marginTop: spacing.m }
                  ]}>
                    <View style={[
                      styles.groupItemIconContainer,
                      {
                        minWidth: accessibility.minTouchTarget * 0.8,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }
                    ]}>
                      <Ionicons 
                        name="add-circle-outline" 
                        size={scaleWidth(20)} 
                        color={buttonColor} 
                      />
                    </View>
                    <TextInput
                      style={[
                        styles.groupItemInput,
                        { 
                          backgroundColor: theme.inputBackground,
                          color: theme.text,
                          borderColor: theme.border,
                          fontSize: scaleFontSize(15),
                          paddingHorizontal: spacing.s,
                          paddingVertical: spacing.xs,
                          flex: 1,
                          minHeight: accessibility.minTouchTarget,
                        }
                      ]}
                      value={newItemText}
                      onChangeText={setNewItemText}
                      placeholder="Add new item"
                      placeholderTextColor={theme.textSecondary}
                      onSubmitEditing={handleAddGroupItem}
                      returnKeyType="done"
                      maxFontSizeMultiplier={1.3}
                      accessible={true}
                      accessibilityLabel="New group item"
                      accessibilityHint="Enter text for a new item in this group"
                    />
                    <TouchableOpacity 
                      style={[
                        styles.addItemButton, 
                        { 
                          backgroundColor: buttonColor,
                          minHeight: accessibility.minTouchTarget,
                          paddingHorizontal: spacing.m,
                          justifyContent: 'center',
                        }
                      ]}
                      onPress={handleAddGroupItem}
                      disabled={!newItemText.trim()}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Add item"
                      accessibilityHint="Adds the new item to the group"
                      accessibilityState={{ disabled: !newItemText.trim() }}
                    >
                      <Text style={[
                        styles.addItemButtonText,
                        {
                          fontSize: scaleFontSize(14),
                          maxFontSizeMultiplier: 1.3,
                        }
                      ]}>
                        Add
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Empty Group Warning */}
                  {groupItems.length === 0 && (
                    <Text style={[
                      styles.emptyGroupWarning, 
                      { 
                        color: theme.textSecondary,
                        fontSize: scaleFontSize(14),
                        marginTop: spacing.m,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        maxFontSizeMultiplier: 1.3,
                      }
                    ]}>
                      Add at least one item to your group
                    </Text>
                  )}
                </View>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.addButton, 
                  { 
                    backgroundColor: buttonColor,
                    marginTop: spacing.l,
                    paddingVertical: spacing.m,
                    borderRadius: 8,
                    minHeight: accessibility.minTouchTarget,
                  }
                ]}
                onPress={handleAddTodo}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={isGroup ? "Create to-do group" : "Create to-do"}
                accessibilityHint={isGroup ? "Creates a new to-do group with the specified items" : "Creates a new to-do item"}
              >
                <Text style={[
                  styles.addButtonText,
                  {
                    fontSize: scaleFontSize(16),
                    maxFontSizeMultiplier: 1.3,
                  }
                ]}>
                  {isGroup ? 'Create To-Do Group' : 'Create To-Do'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </Animated.View>
      </Animated.View>
    </Modal>
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
    maxHeight: '90%'
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
  }
});

export default AddTodoModal;