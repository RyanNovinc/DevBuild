// src/screens/Onboarding/components/screens/SystemHierarchyScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Dimensions,
  TextInput,
  Platform,
  StyleSheet,
  SafeAreaView,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { scale } from '../../styles/onboardingStyles';
import ProgressIndicator from '../ui/ProgressIndicator';
import AIMessage from '../ui/AIMessage';
import ResponsiveText from '../ResponsiveText';
import { getAccessibilityProps } from '../../utils/accessibility';
import { isLowEndDevice, useOrientation } from '../../utils/deviceUtils';

const { width } = Dimensions.get('window');

const SystemHierarchyScreen = ({ 
  currentScreen,
  onBack,
  onContinue,
  focusInput,
  lifeDirection,
  generateLifeDirection,
  typingText,
  fullText,
  hierarchyAnimValues
}) => {
  // Get orientation for responsive layout
  const { orientation } = useOrientation();
  
  // Detect if device is low-end for performance optimizations
  const isLowEnd = isLowEndDevice();
  
  // Create proper scrollView ref
  const scrollViewRef = useRef(null);
  
  // States
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [expandedHierarchy, setExpandedHierarchy] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAIMessage, setShowAIMessage] = useState(false);
  const [aiMessageComplete, setAiMessageComplete] = useState(false);
  const [aiMessageRef, setAiMessageRef] = useState(null);
  
  // Track original values to detect changes
  const [originalDirection, setOriginalDirection] = useState(lifeDirection || generateLifeDirection(focusInput));
  const [currentDirection, setCurrentDirection] = useState(lifeDirection || generateLifeDirection(focusInput));
  
  const [goal, setGoal] = useState({ 
    title: focusInput ? `Master ${focusInput.toLowerCase()} skills` : "Develop core skills", 
    description: "" 
  });
  const [originalGoal, setOriginalGoal] = useState({
    title: focusInput ? `Master ${focusInput.toLowerCase()} skills` : "Develop core skills", 
    description: ""
  });
  
  const [project, setProject] = useState({ 
    title: "Industry certification", 
    description: "" 
  });
  const [originalProject, setOriginalProject] = useState({
    title: "Industry certification", 
    description: ""
  });
  
  const [tasks, setTasks] = useState([
    "Research certification options", 
    "Schedule 4hrs weekly", 
    "Complete first module"
  ]);
  const [originalTasks, setOriginalTasks] = useState([
    "Research certification options", 
    "Schedule 4hrs weekly", 
    "Complete first module"
  ]);
  
  const [newTask, setNewTask] = useState("");
  const [feedbackType, setFeedbackType] = useState(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [continueTouched, setContinueTouched] = useState(false);
  
  // Save All Button States
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [saveAllIndex, setSaveAllIndex] = useState(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successFeedback = useRef(new Animated.Value(0)).current;
  const alertShakeAnim = useRef(new Animated.Value(0)).current;
  
  // Item animations (for staggered entry)
  const itemAnims = useRef([
    new Animated.Value(0), // Direction
    new Animated.Value(0), // Goal
    new Animated.Value(0), // Project
    new Animated.Value(0)  // Tasks
  ]).current;
  
  // Saved items tracking
  const [savedItems, setSavedItems] = useState({
    direction: false,
    goal: false,
    project: false,
    tasks: false
  });
  
  // Fixed AI message
  const aiMessage = "Your achievement system is ready using proven methodology. Each level connects to create an aligned framework for success.";
  
  // Configuration for Save All functionality
  const saveAllConfig = [
    { type: 'direction', color: '#2563eb' }, // Blue
    { type: 'goal', color: '#9333ea' },      // Purple
    { type: 'project', color: '#16a34a' },   // Green
    { type: 'tasks', color: '#db2777' }      // Red
  ];
  
  // Skip AI message typing if not yet complete
  const skipAIMessageTyping = () => {
    if (aiMessageRef && aiMessageRef.completeTypingImmediately) {
      aiMessageRef.completeTypingImmediately();
    }
  };
  
  // Helper function to check if item has been modified since last save
  const hasItemChanged = (type) => {
    switch(type) {
      case 'direction':
        return currentDirection !== originalDirection;
      case 'goal':
        return goal.title !== originalGoal.title || goal.description !== originalGoal.description;
      case 'project':
        return project.title !== originalProject.title || project.description !== originalProject.description;
      case 'tasks':
        // Compare arrays by joining to strings (simple approach)
        return JSON.stringify(tasks) !== JSON.stringify(originalTasks);
      default:
        return false;
    }
  };
  
  // Effect to mark items as unsaved when they change
  useEffect(() => {
    if (savedItems.direction && hasItemChanged('direction')) {
      setSavedItems(prev => ({ ...prev, direction: false }));
    }
  }, [currentDirection]);
  
  useEffect(() => {
    if (savedItems.goal && hasItemChanged('goal')) {
      setSavedItems(prev => ({ ...prev, goal: false }));
    }
  }, [goal]);
  
  useEffect(() => {
    if (savedItems.project && hasItemChanged('project')) {
      setSavedItems(prev => ({ ...prev, project: false }));
    }
  }, [project]);
  
  useEffect(() => {
    if (savedItems.tasks && hasItemChanged('tasks')) {
      setSavedItems(prev => ({ ...prev, tasks: false }));
    }
  }, [tasks]);
  
  // Get current Save All button color
  const getSaveAllButtonColor = () => {
    if (!isSavingAll) return '#2563eb'; // Default blue
    return saveAllConfig[saveAllIndex].color;
  };
  
  // Keyboard event listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Initial fade-in animation - optimized for performance
  useEffect(() => {
    if (isLowEnd) {
      // Simple fade in for low-end devices
      fadeAnim.setValue(1);
      // Show AI message immediately
      setShowAIMessage(true);
    } else {
      // Full animation for modern devices
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
      
      // Show AI message after a short delay
      setTimeout(() => {
        setShowAIMessage(true);
      }, 300);
    }
  }, [isLowEnd]);
  
  // Handle Save All process - completely revised and optimized
  useEffect(() => {
    // Only proceed if we're in the saving all state and there are items to save
    if (isSavingAll && saveAllIndex < saveAllConfig.length) {
      const currentItemType = saveAllConfig[saveAllIndex].type;
      
      // Show feedback for the current item
      setFeedbackType(currentItemType);
      
      // Animate feedback with proper sequence
      successFeedback.setValue(0);
      
      // Optimize animation sequence for low-end devices
      if (isLowEnd) {
        // Simplified animation
        successFeedback.setValue(1);
        
        // Delay to show feedback - CHANGED FROM 800ms to 250ms
        setTimeout(() => {
          // Save the item
          if (!savedItems[currentItemType] || hasItemChanged(currentItemType)) {
            updateOriginalValues(currentItemType);
            
            // Mark as saved
            setSavedItems(prev => ({
              ...prev,
              [currentItemType]: true
            }));
          }
          
          // Clear feedback and move to next item
          setFeedbackType(null);
          successFeedback.setValue(0);
          
          if (saveAllIndex < saveAllConfig.length - 1) {
            setSaveAllIndex(saveAllIndex + 1);
          } else {
            setIsSavingAll(false);
            setSaveAllIndex(0);
          }
        }, 250); // CHANGED FROM 800ms to 250ms
      } else {
        // Full animation sequence for modern devices
        Animated.sequence([
          // Fade in the color
          Animated.timing(successFeedback, {
            toValue: 1,
            duration: 200, // CHANGED FROM 300ms to 200ms for faster fade-in
            useNativeDriver: true,
          }),
          // Hold the color visible - CHANGED FROM 800ms to 250ms
          Animated.delay(250),
          // Fade out the color
          Animated.timing(successFeedback, {
            toValue: 0,
            duration: 200, // CHANGED FROM 300ms to 200ms for faster fade-out
            useNativeDriver: true,
          })
        ]).start(() => {
          // After animation completes, save the item (if not already saved or if changed)
          if (!savedItems[currentItemType] || hasItemChanged(currentItemType)) {
            updateOriginalValues(currentItemType);
            
            // Mark as saved
            setSavedItems(prev => ({
              ...prev,
              [currentItemType]: true
            }));
          }
          
          // Clear feedback type
          setFeedbackType(null);
          
          // Delay before moving to next item - CHANGED FROM 300ms to 100ms
          setTimeout(() => {
            if (saveAllIndex < saveAllConfig.length - 1) {
              setSaveAllIndex(saveAllIndex + 1);
            } else {
              // We're done saving all items
              setIsSavingAll(false);
              setSaveAllIndex(0);
            }
          }, 100); // CHANGED FROM 300ms to 100ms for quicker transitions
        });
      }
    }
  }, [isSavingAll, saveAllIndex, isLowEnd]);
  
  // Update original values helper function
  const updateOriginalValues = (type) => {
    switch(type) {
      case 'direction':
        setOriginalDirection(currentDirection);
        break;
      case 'goal':
        setOriginalGoal({...goal});
        break;
      case 'project':
        setOriginalProject({...project});
        break;
      case 'tasks':
        setOriginalTasks([...tasks]);
        break;
    }
  };
  
  // Start item animations after AI message completes - optimized for performance
  useEffect(() => {
    if (aiMessageComplete) {
      if (isLowEnd) {
        // Simple animation for low-end devices
        // Set all items visible immediately with slight staggering
        setTimeout(() => itemAnims[0].setValue(1), 0);
        setTimeout(() => itemAnims[1].setValue(1), 100);
        setTimeout(() => itemAnims[2].setValue(1), 200);
        setTimeout(() => itemAnims[3].setValue(1), 300);
      } else {
        // Staggered animation for hierarchy items on modern devices
        Animated.stagger(300, [
          Animated.spring(itemAnims[0], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(itemAnims[1], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(itemAnims[2], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(itemAnims[3], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          })
        ]).start();
      }
    }
  }, [aiMessageComplete, isLowEnd]);
  
  // Function to safely scroll to a specific position
  const safeScrollTo = (yOffset) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yOffset, animated: true });
    }
  };
  
  // Save an individual item (not used during Save All process)
  const saveItem = (type) => {
    // Update the original values to track changes
    updateOriginalValues(type);
    
    // Mark as saved
    setSavedItems(prev => ({
      ...prev,
      [type]: true
    }));
    
    // Show feedback animation for individual saves
    showSaveFeedback(type);
  };
  
  // Show save feedback animation
  const showSaveFeedback = (type) => {
    // Set the feedback type
    setFeedbackType(type);
    
    // Animate feedback
    successFeedback.setValue(0);
    
    // Optimize for low-end devices
    if (isLowEnd) {
      // Simple feedback
      successFeedback.setValue(1);
      setTimeout(() => {
        successFeedback.setValue(0);
        setFeedbackType(null);
      }, 1000);
    } else {
      // Full animation sequence
      Animated.sequence([
        Animated.timing(successFeedback, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(800), // Longer delay for feedback visibility
        Animated.timing(successFeedback, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setFeedbackType(null);
      });
    }
  };
  
  // Start the Save All process
  const handleSaveAll = () => {
    if (isSavingAll) return; // Don't start if already running
    
    // Reset save all state to run through all items again
    setIsSavingAll(true);
    setSaveAllIndex(0);
  };
  
  // Check if all items have been saved
  const areAllItemsSaved = () => {
    return Object.values(savedItems).every(value => value === true) && 
           !hasItemChanged('direction') && 
           !hasItemChanged('goal') && 
           !hasItemChanged('project') && 
           !hasItemChanged('tasks');
  };
  
  // Handle adding a new task
  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, newTask.trim()]);
      setNewTask("");
    }
  };
  
  // Shake animation for continue button when not all items saved
  const shakeButton = () => {
    // Reset position
    alertShakeAnim.setValue(0);
    
    // Skip animation for low-end devices
    if (isLowEnd) {
      // Just trigger the feedback with no animation
      return;
    }
    
    // Create shake animation sequence
    Animated.sequence([
      Animated.timing(alertShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(alertShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(alertShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(alertShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(alertShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };
  
  // Handle continue
  const handleContinue = () => {
    if (isProcessing) return;
    
    // Check if all items are saved
    if (!areAllItemsSaved()) {
      // Set continueTouched to true to show the "Save all items" message
      setContinueTouched(true);
      
      // Shake the button to indicate it's disabled
      shakeButton();
      
      return;
    }
    
    setIsProcessing(true);
    
    // Show animation feedback
    showSaveFeedback('continue');
    
    // Proceed after a delay
    setTimeout(() => {
      if (onContinue) {
        setIsProcessing(false);
        onContinue();
      }
    }, 1000);
  };
  
  // Handle AI message completion callback
  const handleTypingComplete = () => {
    if (!aiMessageComplete) { 
      setAiMessageComplete(true);
    }
  };
  
  // Hierarchy items data with enhanced presentation and accessibility
  const hierarchyItems = [
    {
      type: 'direction',
      title: 'Strategic Direction',
      icon: 'navigate',
      color: '#2563eb',
      lightColor: 'rgba(37, 99, 235, 0.15)',
      content: currentDirection,
      accessibilityHint: 'Your personal mission statement that guides all decisions'
    },
    {
      type: 'goal',
      title: 'Goal',
      icon: 'flag',
      color: '#9333ea',
      lightColor: 'rgba(147, 51, 234, 0.15)',
      content: goal,
      accessibilityHint: 'A major achievement that supports your direction'
    },
    {
      type: 'project',
      title: 'Project',
      icon: 'folder',
      color: '#16a34a',
      lightColor: 'rgba(22, 163, 74, 0.15)',
      content: project,
      accessibilityHint: 'An organized initiative to reach your goal'
    },
    {
      type: 'tasks',
      title: 'Tasks',
      icon: 'list',
      color: '#db2777',
      lightColor: 'rgba(219, 39, 119, 0.15)',
      content: tasks,
      accessibilityHint: 'Specific actions that move your project forward'
    }
  ];
  
  // Render hierarchy items with animations and accessibility
  const renderHierarchyItem = (item, index, isLast) => {
    // Check if this item has been modified since last save
    const isModified = hasItemChanged(item.type);
    const isSaved = savedItems[item.type];
    
    return (
      <Animated.View 
        key={item.type}
        style={[
          styles.hierarchyItem,
          {
            opacity: itemAnims[index],
            transform: [
              { 
                translateY: itemAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                }) 
              },
              {
                scale: itemAnims[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1]
                })
              }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.hierarchyHeader,
            expandedHierarchy === item.type && {
              backgroundColor: item.lightColor,
              borderColor: item.color
            }
          ]}
          onPress={() => {
            // When opening a section, scroll to it with a slight delay to ensure animation completes
            if (expandedHierarchy !== item.type) {
              setExpandedHierarchy(item.type);
              // Add slight delay to let animation complete before scrolling
              setTimeout(() => {
                // Find the item's position and scroll to it
                const yOffset = index * 120; // Approximate position
                safeScrollTo(yOffset + 200);
              }, 100);
            } else {
              setExpandedHierarchy(null);
            }
          }}
          activeOpacity={0.8}
          {...getAccessibilityProps({
            label: `${item.title} section, ${isSaved ? 'saved' : 'not saved'}`,
            hint: item.accessibilityHint + (expandedHierarchy === item.type ? '. Double tap to collapse.' : '. Double tap to expand.'),
            role: "button",
            isExpanded: expandedHierarchy === item.type
          })}
        >
          <View 
            style={[styles.hierarchyIconContainer, { backgroundColor: item.color }]}
            accessible={true}
            accessibilityLabel={`${item.title} icon`}
            accessibilityRole="image"
          >
            <Ionicons name={item.icon} size={20} color="#FFFFFF" />
          </View>
          <ResponsiveText 
            style={styles.hierarchyHeaderText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </ResponsiveText>
          <View style={styles.hierarchyHeaderRight}>
            {/* Show modified indicator */}
            {isModified && isSaved && (
              <View 
                style={styles.modifiedIndicator}
                accessible={true}
                accessibilityLabel="Modified since last save"
              >
                <Ionicons name="alert-circle" size={18} color="#f59e0b" />
              </View>
            )}
            
            {/* Show saved indicator */}
            {isSaved && !isModified && (
              <View 
                style={styles.savedIndicator}
                accessible={true}
                accessibilityLabel="Saved"
              >
                <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
              </View>
            )}
            
            {expandedHierarchy === item.type ? (
              <Ionicons name="chevron-up" size={20} color={item.color} />
            ) : (
              <Ionicons name="chevron-down" size={20} color="#AAAAAA" />
            )}
          </View>
        </TouchableOpacity>
        
        {/* Expanded content with accessibility */}
        {expandedHierarchy === item.type && (
          <View 
            style={[styles.hierarchyContent, { borderColor: item.color }]}
            accessible={true}
            accessibilityLabel={`${item.title} editing section`}
            accessibilityRole="adjustable"
          >
            {item.type === 'direction' && (
              <View>
                <TextInput
                  style={styles.hierarchyEditInput}
                  value={currentDirection}
                  onChangeText={setCurrentDirection}
                  multiline={true}
                  numberOfLines={3}
                  placeholder="Enter life direction..."
                  placeholderTextColor="#888888"
                  maxLength={200} // Add character limit
                  accessibilityLabel="Edit your strategic direction"
                  accessibilityHint="Enter your personal strategic direction statement"
                />
                
                <TouchableOpacity 
                  style={[styles.confirmButton, { backgroundColor: item.color }]}
                  onPress={() => saveItem(item.type)}
                  {...getAccessibilityProps({
                    label: isSaved && isModified ? 'Update Life Direction' : 'Set as Life Direction',
                    hint: 'Save your strategic direction',
                    role: "button"
                  })}
                >
                  <ResponsiveText style={styles.confirmButtonText}>
                    {isSaved && isModified ? 'Update Life Direction' : 'Set as Life Direction'}
                  </ResponsiveText>
                  {isSaved && !isModified && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            )}
            
            {item.type === 'goal' && (
              <View>
                <TextInput
                  style={styles.hierarchyEditInput}
                  value={goal.title}
                  onChangeText={(text) => setGoal({...goal, title: text})}
                  multiline={false}
                  placeholder="Enter goal title..."
                  placeholderTextColor="#888888"
                  maxLength={100} // Add character limit
                  accessibilityLabel="Edit your goal title"
                  accessibilityHint="Enter a title for your goal"
                  onFocus={() => {
                    // Scroll to make input visible above keyboard
                    setTimeout(() => {
                      const yOffset = index * 120;
                      safeScrollTo(yOffset + 250);
                    }, 100);
                  }}
                />
                
                <TouchableOpacity 
                  style={[styles.confirmButton, { backgroundColor: item.color }]}
                  onPress={() => saveItem(item.type)}
                  {...getAccessibilityProps({
                    label: isSaved && isModified ? 'Update Goal' : 'Save Goal',
                    hint: 'Save your goal',
                    role: "button"
                  })}
                >
                  <ResponsiveText style={styles.confirmButtonText}>
                    {isSaved && isModified ? 'Update Goal' : 'Save Goal'}
                  </ResponsiveText>
                  {isSaved && !isModified && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            )}
            
            {item.type === 'project' && (
              <View>
                <TextInput
                  style={styles.hierarchyEditInput}
                  value={project.title}
                  onChangeText={(text) => setProject({...project, title: text})}
                  multiline={false}
                  placeholder="Enter project title..."
                  placeholderTextColor="#888888"
                  maxLength={100} // Add character limit
                  accessibilityLabel="Edit your project title"
                  accessibilityHint="Enter a title for your project"
                  onFocus={() => {
                    // Scroll to make input visible above keyboard
                    setTimeout(() => {
                      const yOffset = index * 120;
                      safeScrollTo(yOffset + 250);
                    }, 100);
                  }}
                />
                
                <TouchableOpacity 
                  style={[styles.confirmButton, { backgroundColor: item.color }]}
                  onPress={() => saveItem(item.type)}
                  {...getAccessibilityProps({
                    label: isSaved && isModified ? 'Update Project' : 'Save Project',
                    hint: 'Save your project',
                    role: "button"
                  })}
                >
                  <ResponsiveText style={styles.confirmButtonText}>
                    {isSaved && isModified ? 'Update Project' : 'Save Project'}
                  </ResponsiveText>
                  {isSaved && !isModified && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            )}
            
            {item.type === 'tasks' && (
              <View>
                <View 
                  style={styles.tasksList}
                  accessible={true}
                  accessibilityLabel="Task list"
                  accessibilityRole="list"
                >
                  {/* Just the three editable tasks, no add functionality */}
                  {tasks.slice(0, 3).map((task, taskIndex) => (
                    <View 
                      key={taskIndex} 
                      style={styles.taskItemEditable}
                      accessible={true}
                      accessibilityLabel={`Task ${taskIndex + 1}`}
                      accessibilityRole="listitem"
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color={item.color} />
                      <TextInput
                        style={styles.taskTextInput}
                        value={task}
                        onChangeText={(text) => {
                          const updatedTasks = [...tasks];
                          updatedTasks[taskIndex] = text;
                          setTasks(updatedTasks);
                        }}
                        placeholder={`Task ${taskIndex + 1}...`}
                        placeholderTextColor="#888888"
                        maxLength={100} // Add character limit
                        accessibilityLabel={`Edit task ${taskIndex + 1}`}
                        accessibilityHint={`Edit task ${taskIndex + 1} description`}
                        onFocus={() => {
                          // Scroll to make input visible above keyboard
                          setTimeout(() => {
                            const yOffset = index * 120;
                            safeScrollTo(yOffset + 250 + (taskIndex * 50));
                          }, 100);
                        }}
                      />
                    </View>
                  ))}
                </View>
                
                <TouchableOpacity 
                  style={[styles.confirmButton, { backgroundColor: item.color }]}
                  onPress={() => saveItem(item.type)}
                  {...getAccessibilityProps({
                    label: isSaved && isModified ? 'Update Tasks' : 'Save Tasks',
                    hint: 'Save your tasks',
                    role: "button"
                  })}
                >
                  <ResponsiveText style={styles.confirmButtonText}>
                    {isSaved && isModified ? 'Update Tasks' : 'Save Tasks'}
                  </ResponsiveText>
                  {isSaved && !isModified && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        
        {/* Connector (except for last item) */}
        {!isLast && (
          <View 
            style={styles.hierarchyConnector}
            accessible={false}
            importantForAccessibility="no"
          >
            <View style={styles.connectorLine} />
            <View style={[styles.connectorDot, { backgroundColor: item.color }]} />
          </View>
        )}
      </Animated.View>
    );
  };
  
  return (
    <SafeAreaView 
      style={[
        styles.safeArea,
        orientation === 'landscape' && styles.safeAreaLandscape
      ]}
      accessible={true}
      accessibilityLabel="System Hierarchy Screen"
      accessibilityRole="none"
    >
      <View 
        style={[
          styles.container,
          orientation === 'landscape' && styles.containerLandscape
        ]}
      >
        {/* Feedback overlay */}
        {feedbackType && (
          <Animated.View 
            style={[
              styles.feedbackOverlay,
              { 
                opacity: successFeedback,
                backgroundColor: 
                  feedbackType === 'direction' ? 'rgba(37, 99, 235, 0.2)' :
                  feedbackType === 'goal' ? 'rgba(147, 51, 234, 0.2)' :
                  feedbackType === 'project' ? 'rgba(22, 163, 74, 0.2)' :
                  feedbackType === 'tasks' ? 'rgba(219, 39, 119, 0.2)' :
                  feedbackType === 'continue' ? 'rgba(37, 99, 235, 0.2)' :
                  'rgba(22, 163, 74, 0.2)'
              }
            ]}
            accessible={false}
            importantForAccessibility="no"
          />
        )}
        
        {/* Main content with fade-in animation */}
        <Animated.View 
          style={[
            styles.mainContent, 
            { opacity: fadeAnim },
            orientation === 'landscape' && styles.mainContentLandscape
          ]}
        >
          {/* Single ScrollView for entire content */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              keyboardVisible && styles.scrollContentKeyboardOpen,
              orientation === 'landscape' && styles.scrollContentLandscape
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top section */}
            <View 
              style={[
                styles.topSection,
                orientation === 'landscape' && styles.topSectionLandscape
              ]}
            >
              {/* Progress indicator */}
              <View style={styles.progressWrapper}>
                <ProgressIndicator currentScreen={currentScreen} totalScreens={5} />
              </View>
              
              {/* Page Title */}
              <View 
                style={styles.titleContainer}
                accessible={true}
                accessibilityRole="header"
              >
                <ResponsiveText style={styles.pageTitle}>
                  Your Achievement System
                </ResponsiveText>
                <ResponsiveText style={styles.pageSubtitle}>
                  A complete framework for strategic success
                </ResponsiveText>
              </View>
              
              {/* AI Message with fixed height container */}
              <View 
                style={styles.aiContainer}
                accessible={true}
                accessibilityLabel="AI Assistant message"
                accessibilityRole="text"
              >
                {showAIMessage && (
                  <AIMessage 
                    ref={ref => setAiMessageRef(ref)}
                    fullText={aiMessage}
                    initialDelay={300}
                    onTypingComplete={handleTypingComplete}
                  />
                )}
              </View>
              
              {/* Learn More Button */}
              {aiMessageComplete && (
                <View style={styles.learnMoreButtonContainer}>
                  <TouchableOpacity 
                    style={styles.learnMoreButton}
                    onPress={() => setShowLearnMore(!showLearnMore)}
                    activeOpacity={0.8}
                    {...getAccessibilityProps({
                      label: showLearnMore ? "Hide System Details" : "Learn How Your System Works",
                      hint: showLearnMore ? "Collapse the system explanation" : "Expand to see how the system works",
                      role: "button",
                      isExpanded: showLearnMore
                    })}
                  >
                    <ResponsiveText style={styles.learnMoreText}>
                      {showLearnMore ? 'Hide System Details' : 'Learn How Your System Works'}
                    </ResponsiveText>
                    <Ionicons 
                      name={showLearnMore ? "chevron-up" : "chevron-down"} 
                      size={18} 
                      color="#2563eb" 
                    />
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Learn More Content */}
              {showLearnMore && (
                <View 
                  style={styles.learnMoreContainer}
                  accessible={true}
                  accessibilityLabel="System explanation"
                  accessibilityRole="text"
                >
                  <ResponsiveText style={styles.learnMoreTitle}>
                    Strategic Achievement System
                  </ResponsiveText>
                  <ResponsiveText style={styles.learnMoreDescription}>
                    LifeCompass uses the same hierarchical structure that successful organizations use to align daily actions with long-term vision:
                  </ResponsiveText>
                  
                  <View 
                    style={[
                      styles.learnMoreGrid,
                      orientation === 'landscape' && styles.learnMoreGridLandscape
                    ]}
                  >
                    {hierarchyItems.map((item, index) => (
                      <View 
                        key={item.type} 
                        style={styles.learnMoreItem}
                        accessible={true}
                        accessibilityLabel={`${item.title} explanation`}
                        accessibilityRole="text"
                      >
                        <View style={[styles.learnMoreIconContainer, { backgroundColor: item.color }]}>
                          {/* Add step number */}
                          <View style={styles.stepNumberBadge}>
                            <ResponsiveText style={styles.stepNumberText}>
                              {index + 1}
                            </ResponsiveText>
                          </View>
                          <Ionicons name={item.icon} size={22} color="#FFFFFF" />
                        </View>
                        <ResponsiveText style={styles.learnMoreItemTitle}>
                          {item.title}
                        </ResponsiveText>
                        <ResponsiveText 
                          style={styles.learnMoreItemText}
                          numberOfLines={3}
                          ellipsizeMode="tail"
                        >
                          {item.type === 'direction' && 'Your personal mission that guides all goals and decisions'}
                          {item.type === 'goal' && 'Major achievements that support your direction'}
                          {item.type === 'project' && 'Organized initiatives to reach your goals'}
                          {item.type === 'tasks' && 'Specific actions that move projects forward'}
                        </ResponsiveText>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
            
            {/* Main Hierarchy Content */}
            {aiMessageComplete && (
              <View 
                style={[
                  styles.hierarchyListContainer,
                  orientation === 'landscape' && styles.hierarchyListContainerLandscape
                ]}
                accessible={true}
                accessibilityLabel="System hierarchy items"
                accessibilityRole="list"
              >
                {hierarchyItems.map((item, index) => 
                  renderHierarchyItem(item, index, index === hierarchyItems.length - 1)
                )}
                
                {/* Save All Button - Always visible */}
                {aiMessageComplete && (
                  <TouchableOpacity
                    style={[
                      styles.saveAllButton,
                      { backgroundColor: getSaveAllButtonColor() },
                      areAllItemsSaved() && styles.disabledSaveAllButton
                    ]}
                    onPress={handleSaveAll}
                    disabled={isSavingAll || areAllItemsSaved()}
                    {...getAccessibilityProps({
                      label: isSavingAll ? "Saving all items" : "Save All",
                      hint: areAllItemsSaved() ? "All items are already saved" : "Save all hierarchy items at once",
                      role: "button",
                      isDisabled: isSavingAll || areAllItemsSaved(),
                      isBusy: isSavingAll
                    })}
                  >
                    <Ionicons name="save-outline" size={20} color="#FFFFFF" style={styles.saveAllIcon} />
                    <ResponsiveText style={styles.saveAllText}>
                      {isSavingAll ? 'Saving...' : 'Save All'}
                    </ResponsiveText>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Add extra padding at the bottom for better scrolling */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
          
          {/* Action Buttons */}
          {aiMessageComplete && (
            <View 
              style={[
                styles.actionContainer,
                orientation === 'landscape' && styles.actionContainerLandscape
              ]}
            >
              <TouchableOpacity 
                style={[
                  styles.backButton,
                  isProcessing && styles.disabledButton
                ]}
                onPress={onBack}
                disabled={isProcessing}
                {...getAccessibilityProps({
                  label: "Back",
                  hint: "Return to the previous screen",
                  role: "button",
                  isDisabled: isProcessing
                })}
              >
                <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
                <ResponsiveText style={styles.backButtonText}>Back</ResponsiveText>
              </TouchableOpacity>
              
              <View style={styles.centerContainer}>
                {/* Warning message when continue is touched but not all items saved */}
                {continueTouched && !areAllItemsSaved() && (
                  <Animated.View 
                    style={[
                      styles.saveWarning,
                      {
                        transform: [{ translateX: alertShakeAnim }]
                      }
                    ]}
                    accessible={true}
                    accessibilityLabel="Save all items first"
                    accessibilityRole="alert"
                  >
                    <Ionicons name="alert-circle" size={16} color="#f59e0b" />
                    <ResponsiveText style={styles.saveWarningText}>Save all items first</ResponsiveText>
                  </Animated.View>
                )}
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.continueButton,
                  !areAllItemsSaved() && styles.disabledContinueButton,
                  isProcessing && styles.disabledButton
                ]}
                onPress={handleContinue}
                disabled={isProcessing}
                activeOpacity={0.9}
                {...getAccessibilityProps({
                  label: isProcessing ? "Processing..." : "Continue",
                  hint: !areAllItemsSaved() ? "You need to save all items before continuing" : "Continue to the next screen",
                  role: "button",
                  isDisabled: isProcessing || !areAllItemsSaved(),
                  isBusy: isProcessing
                })}
              >
                <ResponsiveText style={styles.continueButtonText}>
                  {isProcessing ? 'Processing...' : 'Continue'}
                </ResponsiveText>
                <Ionicons 
                  name={isProcessing ? "hourglass-outline" : "arrow-forward"} 
                  size={18} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0c1425',
  },
  safeAreaLandscape: {
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    backgroundColor: '#0c1425',
    position: 'relative',
  },
  containerLandscape: {
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
  mainContentLandscape: {
    flexDirection: 'row',
  },
  feedbackOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollContentKeyboardOpen: {
    paddingBottom: 120, // Extra padding when keyboard is open
  },
  scrollContentLandscape: {
    paddingBottom: 60,
  },
  topSection: {
    paddingTop: 40, // Consistent top padding for all screens
  },
  topSectionLandscape: {
    paddingTop: 20,
    width: '100%',
  },
  progressWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: scale(28, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: scale(16, 0.3),
    color: '#AAAAAA',
    textAlign: 'center',
  },
  aiContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    minHeight: 80,
  },
  learnMoreButtonContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
  learnMoreText: {
    color: '#2563eb',
    fontSize: scale(14, 0.3),
    fontWeight: '500',
    marginRight: 6,
  },
  learnMoreContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
    backgroundColor: 'rgba(12, 20, 37, 0.6)',
  },
  learnMoreTitle: {
    fontSize: scale(18, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  learnMoreDescription: {
    fontSize: scale(14, 0.3),
    color: '#BBBBBB',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  learnMoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  learnMoreGridLandscape: {
    justifyContent: 'space-around',
  },
  learnMoreItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  learnMoreIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative', // For step number positioning
  },
  stepNumberBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    zIndex: 1,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  learnMoreItemTitle: {
    fontSize: scale(14, 0.3),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  learnMoreItemText: {
    fontSize: scale(12, 0.3),
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomSpacer: {
    height: 40, // Extra space at bottom
  },
  hierarchyListContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  hierarchyListContainerLandscape: {
    width: '100%',
  },
  hierarchyItem: {
    marginBottom: 8,
  },
  hierarchyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 30, 0.6)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hierarchyIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hierarchyHeaderText: {
    flex: 1,
    fontSize: scale(16, 0.3),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hierarchyHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedIndicator: {
    marginRight: 8,
  },
  modifiedIndicator: {
    marginRight: 8,
  },
  hierarchyContent: {
    backgroundColor: 'rgba(20, 20, 30, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginTop: 2,
    borderLeftWidth: 2,
    marginLeft: 18,
  },
  hierarchyEditInput: {
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
    borderRadius: 8,
    padding: 12,
    fontSize: scale(14, 0.3),
    color: '#FFFFFF',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  confirmButton: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: scale(14, 0.3),
    fontWeight: '500',
    marginRight: 8,
  },
  tasksList: {
    marginBottom: 16,
  },
  taskItemEditable: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 40, 0.6)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  taskTextInput: {
    flex: 1,
    fontSize: scale(14, 0.3),
    color: '#FFFFFF',
    marginLeft: 10,
    padding: 2,
  },
  hierarchyConnector: {
    alignItems: 'center',
    height: 24,
    marginLeft: 18,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  connectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: -4,
  },
  // Save All Button
  saveAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  saveAllIcon: {
    marginRight: 10,
  },
  saveAllText: {
    color: '#FFFFFF',
    fontSize: scale(16, 0.2),
    fontWeight: '600',
  },
  disabledSaveAllButton: {
    opacity: 0.5,
    backgroundColor: '#666666',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(12, 20, 37, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  actionContainerLandscape: {
    paddingHorizontal: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  saveWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  saveWarningText: {
    color: '#f59e0b',
    fontSize: scale(12, 0.3),
    fontWeight: '500',
    marginLeft: 6,
  },
  continueButton: {
    backgroundColor: '#2563eb',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabledContinueButton: {
    backgroundColor: 'rgba(37, 99, 235, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: scale(16, 0.2),
    fontWeight: '600',
    marginRight: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: scale(14, 0.3),
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default SystemHierarchyScreen;