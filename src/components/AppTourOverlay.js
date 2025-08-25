// src/components/AppTourOverlay.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
  StatusBar,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import TypingAnimation from '../screens/Onboarding/components/TypingAnimation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * AppTourOverlay - Creates a spotlight effect to guide users through the app
 * Uses a dark overlay with transparent "holes" to highlight specific areas
 */
const AppTourOverlay = ({ 
  isVisible, 
  currentStep,
  onComplete,
  onSkip,
  spotlightTarget, // {x, y, width, height} of the element to highlight
  onSpecialAction, // Callback for special step actions (like expanding goal)
  navigation, // Navigation object for dev buttons
  children
}) => {
  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const aiIconScale = useRef(new Animated.Value(0)).current;
  const aiIconPulse = useRef(new Animated.Value(1)).current; // For breathing effect
  const tapPromptOpacity = useRef(new Animated.Value(0)).current;
  
  // State
  const [messageComplete, setMessageComplete] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const [showTapToContinue, setShowTapToContinue] = useState(false);
  const [forceRender, setForceRender] = useState(0); // For forcing re-renders
  const [goalExpanded, setGoalExpanded] = useState(false); // Track if goal was expanded during OVERVIEW_PLAN
  const [milestoneExpanded, setMilestoneExpanded] = useState(false); // Track if milestone was expanded during OVERVIEW_PLAN
  const [kanbanTaskMoved, setKanbanTaskMoved] = useState(false); // Track if task was moved to in progress
  const [kanbanTaskCompleted, setKanbanTaskCompleted] = useState(false); // Track if task was completed
  const [todoTabTapped, setTodoTabTapped] = useState(false); // Track if user tapped To-Do tab icon
  const [notesToggleTapped, setNotesToggleTapped] = useState(false); // Track if user tapped notes toggle button
  const [notesViewSwitched, setNotesViewSwitched] = useState(false); // Track if we've switched to notes view
  
  // Ref for typing animation
  const typingRef = useRef(null);
  
  
  // Tour steps configuration - New streamlined 6-step tour
  const TOUR_STEPS = {
    GOAL_ACHIEVEMENT_VALIDATION: {
      message: "Great! We've created your goal and broken it down. That's a big step - now you have a clear plan to follow.",
      spotlight: { x: 20, y: 200, width: SCREEN_WIDTH - 40, height: 150 },
      nextButton: "Turn it into action",
      position: 'bottom'
    },
    KANBAN_SYSTEM_INTRO: {
      message: "Now we turn your plan into action. This Kanban board is used by the biggest companies to stay focused on a limited number of tasks at once.",
      spotlight: { x: 0, y: 100, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 200 },
      nextButton: "Choose one task",
      position: 'top'
    },
    PICK_CURRENT_FOCUS: {
      message: "Choose ONE task from your goal to focus on. Drag it to 'In Progress' - this keeps you effective by limiting how many things you do at once.",
      spotlight: { x: 0, y: 100, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 200 },
      nextButton: "Tap anywhere to close and pick a task",
      position: 'top',
      requiresAction: true // This step requires user action before proceeding
    },
    TASK_MOVED_CELEBRATION: {
      message: "Great! Now we have a focus. Let's set some time aside today and keep this momentum going to make some progress today.",
      spotlight: { x: 0, y: 100, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 200 },
      nextButton: "Schedule time",
      position: 'top'
    },
    SCHEDULE_DEDICATED_TIME: {
      message: "Perfect! Now schedule time to actually work on this task. Tap to choose when and for how long you want to work on it today.",
      spotlight: { x: 0, y: 150, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 250 },
      nextButton: "Schedule time",
      position: 'top',
      requiresAction: true // This step shows a time picker popup
    },
    SYSTEM_CONFIDENCE: {
      message: "That's it! You have a goal, you've picked what to work on, and you've scheduled time for it. Keep doing this cycle and you'll reach your goal.",
      spotlight: { x: 0, y: 150, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 250 },
      nextButton: "What about daily stuff?",
      position: 'center'
    },
    SUPPORTING_TOOLS_OVERVIEW: {
      message: "For daily tasks like errands and chores, use this Todo screen. Today, Tomorrow, Later tabs keep you organized. Your AI assistant can help with all of this too.",
      spotlight: { x: 0, y: 150, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 250 },
      nextButton: "Let's get started!",
      position: 'top'
    }
  };
  
  // Get current step config
  let stepConfig = TOUR_STEPS[currentStep] || TOUR_STEPS.GOAL_ACHIEVEMENT_VALIDATION;
  
  // NOTE: Removed message switching logic - now advances directly to next step
  // if (currentStep === 'NOTES_DAILY_STANDUP' && notesViewSwitched) { ... }
  
  // Get step-specific delay timing
  const getStepDelay = (step) => {
    switch(step) {
      case 'GOAL_ACHIEVEMENT_VALIDATION':
        return 800; // Wait for profile screen to fully load
      case 'KANBAN_SYSTEM_INTRO':
      case 'PICK_CURRENT_FOCUS':
        return 400; // Wait for kanban board to render
      case 'SCHEDULE_DEDICATED_TIME':
      case 'SYSTEM_CONFIDENCE':
        return 300; // Wait for time screen elements
      case 'SUPPORTING_TOOLS_OVERVIEW':
        return 300; // Wait for todo screen
      default:
        return 300;
    }
  };
  
  useEffect(() => {
    if (isVisible) {
      console.log('🎬 AppTourOverlay: Starting animation for step', currentStep);
      
      // Debug current tour step
      console.log('🎬 AppTourOverlay: Current step:', currentStep, 'isVisible:', isVisible);
      
      // Special handling for TASK_MOVED_CELEBRATION - only show if task was actually moved
      if (currentStep === 'TASK_MOVED_CELEBRATION' && global.tourWaitingForTaskMove) {
        console.log('🎯 TASK_MOVED_CELEBRATION: Waiting for task to be moved, staying hidden');
        return; // Don't start animations, stay hidden until task is moved
      }
      
      // For the first step, use gentler initialization
      const isEarlyStep = currentStep === 'GOAL_ACHIEVEMENT_VALIDATION';
      
      // Check if this step should have a dark overlay (Profile steps)
      const shouldHaveDarkOverlay = currentStep === 'GOAL_ACHIEVEMENT_VALIDATION';
      
      if (isEarlyStep) {
        // Gentle initialization for early steps
        console.log('🎬 Early step - using gentle initialization');
        
        // Only stop animations if they're actually running
        overlayOpacity.stopAnimation();
        messageOpacity.stopAnimation();
        aiIconScale.stopAnimation();
        aiIconPulse.stopAnimation();
        tapPromptOpacity.stopAnimation();
        
        // Only reset overlay if we're on ProfileScreen
        overlayOpacity.setValue(currentStep === 'GOAL_ACHIEVEMENT_VALIDATION' ? 0 : 1);
        
        messageOpacity.setValue(0);
        aiIconScale.setValue(0);
        aiIconPulse.setValue(1);
        tapPromptOpacity.setValue(0);
      } else {
        // FORCE RESTART: Reset ALL animation values and states for subsequent steps
        console.log('🎬 AppTourOverlay: FORCE RESTART for step', currentStep);
        
        // Stop any running animations
        overlayOpacity.stopAnimation();
        messageOpacity.stopAnimation();
        aiIconScale.stopAnimation();
        aiIconPulse.stopAnimation();
        tapPromptOpacity.stopAnimation();
        
        // Reset all animation values to initial state
        // Only use dark overlay for ProfileScreen
        overlayOpacity.setValue(currentStep === 'GOAL_ACHIEVEMENT_VALIDATION' ? 0 : 1);
        messageOpacity.setValue(0);
        aiIconScale.setValue(0);
        aiIconPulse.setValue(1);
        tapPromptOpacity.setValue(0);
        
      }
      
      // Log current step for debugging
      console.log('🎯 Current tour step:', currentStep);
      
      // Reset all component states
      setMessageComplete(false);
      setCurrentMessage(''); // Clear text immediately to prevent lingering
      setShowTyping(false);
      setShowTapToContinue(false);
      setGoalExpanded(false); // Reset goal expansion state for new step
      setMilestoneExpanded(false); // Reset milestone expansion state for new step
      setKanbanTaskMoved(false); // Reset kanban task movement state for new step
      setKanbanTaskCompleted(false); // Reset kanban task completion state for new step
      
      const stepDelay = getStepDelay(currentStep); // Custom delay for each step
      console.log('🎬 AppTourOverlay: Starting animation for step', currentStep, 'with delay', stepDelay, isEarlyStep ? '(early step)' : '');
      
      // Entrance animation - gentle for early steps, dramatic for others
      // Check if overlay is already dark (for step transitions within Profile)
      // Only show dark overlay for ProfileScreen (GOAL_ACHIEVEMENT_VALIDATION)
      const shouldShowDarkOverlay = currentStep === 'GOAL_ACHIEVEMENT_VALIDATION';
      const overlayAlreadyDark = overlayOpacity._value > 0.5;
      
      const overlayAnimation = (!shouldShowDarkOverlay || overlayAlreadyDark) ? 
        Animated.delay(0) : // Skip overlay animation if not ProfileScreen or already dark
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: isEarlyStep ? 600 : 100, // Much slower fade-in for early steps
          useNativeDriver: true
        });
      
      Animated.sequence([
        // 1. Darken everything (only for ProfileScreen)
        overlayAnimation,
        // 2. Wait a moment for dramatic effect (shorter for early steps)
        Animated.delay(isEarlyStep ? 200 : 300),
        // 3. Step-specific delay based on content
        Animated.delay(stepDelay),
        // 4. Show AI icon and message
        Animated.parallel([
          // AI icon entrance - gentler spring for early steps
          isEarlyStep ? 
            Animated.timing(aiIconScale, {
              toValue: 1,
              duration: 400,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true
            }) :
            Animated.spring(aiIconScale, {
              toValue: 1,
              tension: 65,
              friction: 10,
              useNativeDriver: true
            }),
          Animated.timing(messageOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          })
        ])
      ]).start(() => {
        // Start continuous breathing animation for AI icon after entrance
        if (isVisible) {
          Animated.loop(
            Animated.sequence([
              Animated.timing(aiIconPulse, {
                toValue: 1.2,
                duration: 1000,
                easing: Easing.ease,
                useNativeDriver: true
              }),
              Animated.timing(aiIconPulse, {
                toValue: 1,
                duration: 1000,
                easing: Easing.ease,
                useNativeDriver: true
              })
            ])
          ).start();
          
          // Start typing after a delay - AI appears first, then starts typing
          setTimeout(() => {
            if (isVisible) {
              setCurrentMessage(stepConfig.message); // Set the message content when typing starts
              setShowTyping(true);
            }
          }, 500);
        }
      });
    } else {
      // Animate out and reset all states
      console.log('🎬 AppTourOverlay: Hiding overlay for step', currentStep);
      setShowTyping(false);
      setMessageComplete(false);
      setShowTapToContinue(false);
      
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(messageOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(aiIconScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(() => {
        // Reset all animation values after hiding
        tapPromptOpacity.setValue(0);
        aiIconPulse.setValue(1);
      });
    }
  }, [isVisible, currentStep]);
  
  // Show tap prompt when message is complete - for first step only
  useEffect(() => {
    if (messageComplete && showTyping && currentStep === 'GOAL_ACHIEVEMENT_VALIDATION') {
      const showPromptTimeout = setTimeout(() => {
        setShowTapToContinue(true);
        Animated.timing(tapPromptOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }).start();
      }, 1000);

      return () => clearTimeout(showPromptTimeout);
    } else {
      setShowTapToContinue(false);
      tapPromptOpacity.setValue(0);
    }
  }, [messageComplete, showTyping, currentStep]);
  
  const handleNext = () => {
    // Fade out current step
    Animated.timing(messageOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      onComplete();
    });
  };
  
  const handleSkip = async () => {
    // Save that user has skipped tour
    await AsyncStorage.setItem('appTourSkipped', 'true');
    onSkip();
  };
  
  // Handle tap-to-advance functionality (matching first onboarding)
  const handleScreenTap = () => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // If typing hasn't started yet, start it immediately
    if (!showTyping) {
      setCurrentMessage(stepConfig.message); // Set the message content when typing starts
      setShowTyping(true);
      return;
    }
    
    // If typing is still in progress, complete it immediately
    if (!messageComplete && typingRef.current) {
      typingRef.current.complete();
      return;
    }
    
    // If current message is complete, handle step-specific actions
    if (messageComplete) {
      // Special handling for PICK_CURRENT_FOCUS step - close overlay and wait for user action
      if (currentStep === 'PICK_CURRENT_FOCUS') {
        console.log('🎯 PICK_CURRENT_FOCUS: Fading out overlay for user to pick a task');
        
        // Fade out the overlay immediately
        Animated.parallel([
          Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(messageOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(aiIconScale, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
          })
        ]).start(() => {
          // After fade out completes, advance to celebration step but keep it hidden
          onComplete();
          
          // Set up waiting state and callback
          global.tourWaitingForTaskMove = true;
          global.tourTaskMoved = () => {
            console.log('🎯 Task moved detected! Now showing celebration');
            global.tourWaitingForTaskMove = false;
            setForceRender(prev => prev + 1);
          };
        });
        
        return;
      }
      
      // Special handling for SCHEDULE_DEDICATED_TIME step - show time picker popup
      if (currentStep === 'SCHEDULE_DEDICATED_TIME') {
        console.log('🎯 User tapped - showing time picker popup');
        if (onSpecialAction) {
          onSpecialAction('showTimePickerPopup');
        }
        return;
      }
      
      // Hide tap prompt
      Animated.timing(tapPromptOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }).start();
      
      handleNext();
    }
  };
  
  // Calculate message box position based on spotlight
  const getMessagePosition = () => {
    const spot = spotlightTarget || stepConfig.spotlight;
    
    if (stepConfig.position === 'top') {
      // Position messages at bottom for kanban and todo steps to avoid covering content
      if (currentStep === 'KANBAN_SYSTEM_INTRO' || currentStep === 'PICK_CURRENT_FOCUS' || 
          currentStep === 'SCHEDULE_DEDICATED_TIME' || currentStep === 'SUPPORTING_TOOLS_OVERVIEW') {
        return { bottom: 20 };
      }
      return { top: 80 };
    } else if (stepConfig.position === 'center') {
      return { top: SCREEN_HEIGHT / 2 - 100 };
    } else if (stepConfig.position === 'bottom') {
      // Special positioning for first step to be closer to goals area
      if (currentStep === 'GOAL_ACHIEVEMENT_VALIDATION') {
        return { bottom: 200 }; // Higher up to be closer to goals content
      }
      return { bottom: 100 }; // Default bottom position
    } else {
      // Position below the spotlight
      return { top: spot.y + spot.height + 20 };
    }
  };
  
  
  // Clean up any global tour state
  useEffect(() => {
    return () => {
      // Clean up any lingering global state
      global.tourShouldFlashToDoTab = false;
      global.tourViewSwitched = null;
      global.tourTaskMoved = null;
      global.tourTimeScheduled = null;
    };
  }, [currentStep]);

  // Don't show if we're waiting for task to be moved
  if (!isVisible || (currentStep === 'TASK_MOVED_CELEBRATION' && global.tourWaitingForTaskMove)) {
    return null;
  }

  // Debug logging for TIME steps
  if (currentStep?.startsWith('TIME_')) {
    console.log('🎯 AppTourOverlay: TIME step detected, currentStep =', currentStep);
  }
  
  // Determine if we should show dark overlay (only for ProfileScreen step)
  const showDarkOverlay = currentStep === 'GOAL_ACHIEVEMENT_VALIDATION';
  
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-only">
      {/* Full-screen touchable for tap-to-advance and blocking interactions */}
      <TouchableOpacity
        style={styles.fullScreenTouchable}
        activeOpacity={1}
        onPress={handleScreenTap}
      />
      
      {/* Simple full-screen dark overlay - ONLY for ProfileScreen */}
      {showDarkOverlay && (
        <Animated.View 
          style={[
            styles.fullScreenOverlay,
            { opacity: overlayOpacity }
          ]}
          pointerEvents="none"
        />
      )}
      
      
      {/* AI Message Box - Fades in with other elements */}
      <Animated.View
        style={[
          styles.messageContainer,
          getMessagePosition(),
          {
            opacity: messageOpacity // Fade in with the overall message animation
          }
        ]}
        pointerEvents="box-none"
      >
        {/* AI Icon - Fixed position, never moves, tappable */}
        <TouchableOpacity 
          style={[
            styles.aiIconFixed,
            { 
              transform: [{ scale: Animated.multiply(aiIconScale, aiIconPulse) }] 
            }
          ]}
          onPress={handleScreenTap}
          activeOpacity={1}
        >
          <View style={styles.aiIconCircle}>
            <Ionicons name="sparkles" size={18} color="#FFD700" />
          </View>
        </TouchableOpacity>
        
        {/* Message bubble - Fixed width, stable and working */}
        <TouchableOpacity
          style={styles.messageBubbleNew}
          onPress={handleScreenTap}
          activeOpacity={1}
        >          
          {/* Text content */}
          <View style={styles.messageContentWrapper}>
            {showTyping ? (
              <TypingAnimation
                ref={typingRef}
                text={currentMessage}
                onComplete={() => setMessageComplete(true)}
                typingSpeed={30}
                style={styles.messageText}
                initialText="" // Start with empty text
              />
            ) : (
              <Text style={styles.messageText}>
                {messageComplete ? currentMessage : ""}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Tap to continue prompt */}
      {showTapToContinue && (
        <Animated.View style={[styles.centralTapPrompt, { opacity: tapPromptOpacity }]}>
          <Text style={styles.tapPromptText}>
            Tap to continue
          </Text>
          <Ionicons 
            name="hand-left" 
            size={24} 
            color="rgba(255,255,255,0.7)" 
            style={styles.tapPromptIcon}
          />
        </Animated.View>
      )}
      
      {/* Dev Buttons - Only in development */}
      {__DEV__ && (
        <>
          <TouchableOpacity
            style={styles.devExitButton}
            onPress={() => {
              console.log('Dev: Exiting tour');
              onSkip();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.devExitText}>DEV: Exit Tour</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.devExitButton, { top: 90, backgroundColor: 'rgba(0, 255, 0, 0.8)' }]}
            onPress={() => {
              console.log('Dev: Starting tour from step 3 (PICK_CURRENT_FOCUS)');
              if (global.jumpToTourStep) {
                global.jumpToTourStep('PICK_CURRENT_FOCUS', navigation);
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.devExitText}>DEV: Start @3</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.devExitButton, { top: 130, backgroundColor: 'rgba(255, 165, 0, 0.8)' }]}
            onPress={() => {
              console.log('Dev: Starting tour from step 6 (SUPPORTING_TOOLS_OVERVIEW)');
              if (global.jumpToTourStep) {
                global.jumpToTourStep('SUPPORTING_TOOLS_OVERVIEW', navigation);
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.devExitText}>DEV: Start @6</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 1005, // Higher than StatsRow elevated z-index (1002)
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 998, // High z-index but below elevated elements
  },
  spotlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998, // Same as fullScreenOverlay
  },
  overlaySection: {
    // Base style for overlay sections
  },
  messageContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 200, // Fixed container height
    zIndex: 1006, // Above the touchable
  },
  aiIconFixed: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -16, // Half icon width to center
    zIndex: 2,
  },
  aiIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  messageBubbleNew: {
    position: 'absolute',
    top: 44, // Fixed position below AI icon (32px + 12px spacing)
    left: 20,
    right: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10, // For Android
    zIndex: 1,
  },
  messageContentWrapper: {
    padding: 16,
  },
  brightBackgroundMessageBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // More opaque dark background
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.8)', // More prominent blue border
    shadowOpacity: 0.5, // Stronger shadow
    shadowRadius: 12,
    elevation: 15, // Higher elevation for Android
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  centralTapPrompt: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1006,
  },
  tapPromptText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  tapPromptIcon: {
    marginLeft: 8,
  },
  devExitButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 1007, // Above everything
  },
  devExitText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AppTourOverlay;