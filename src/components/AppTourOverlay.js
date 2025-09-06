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
  Easing,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import TypingAnimation from '../screens/Onboarding/components/TypingAnimation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

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
  // Theme hook for dynamic styling
  const { theme } = useTheme();
  
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
  const [showSkipModal, setShowSkipModal] = useState(false); // For skip confirmation modal
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
    FOUNDATION_BUILDER_INTRO: {
      message: "", // This step uses FoundationBuilderIntro modal instead
      isModal: true, // Special flag to indicate this step uses a modal
      nextButton: "",
      position: 'center'
    },
    GOAL_ACHIEVEMENT_VALIDATION: {
      message: "Great! We've created your goal and broken it down. That's a big step - now you have a clear plan to follow.",
      spotlight: { x: 20, y: 200, width: SCREEN_WIDTH - 40, height: 150 },
      nextButton: "Turn it into action",
      position: 'bottom'
    },
    KANBAN_SYSTEM_INTRO: {
      message: "This Kanban system limits work in progress - focus on fewer tasks, do them better, make quicker progress.",
      spotlight: { x: 0, y: 100, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 200 },
      nextButton: "Choose one task",
      position: 'top'
    },
    PICK_CURRENT_FOCUS: {
      message: "Let's move one task to 'in-progress' that you want to work on.",
      spotlight: { x: 0, y: 100, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 200 },
      nextButton: "Tap anywhere to close and pick a task",
      position: 'top',
      requiresAction: true // This step requires user action before proceeding
    },
    TASK_MOVED_CELEBRATION: {
      message: "Nice! Now we have a focus. Let's schedule some time to work on it.",
      spotlight: { x: 0, y: 100, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 200 },
      nextButton: "Schedule time",
      position: 'top'
    },
    SCHEDULE_DEDICATED_TIME: {
      message: "Perfect! Let's keep going. Pick a time today to work on this - action beats perfection every time.",
      spotlight: { x: 0, y: 150, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 250 },
      nextButton: "Schedule time",
      position: 'top',
      requiresAction: true // This step shows a time picker popup
    },
    SYSTEM_CONFIDENCE: {
      message: "Excellent! Your planning system is ready - a clear goal, focused direction, and scheduled time.",
      spotlight: { x: 0, y: 150, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 250 },
      nextButton: "What about daily stuff?",
      position: 'center'
    },
    SUPPORTING_TOOLS_OVERVIEW: {
      message: "Capture all your other daily tasks here. Sort them by timing - what needs to be done Today, Tomorrow, or Later.",
      spotlight: { x: 0, y: 150, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 250 },
      nextButton: "Got it!",
      position: 'top'
    },
    AI_FAREWELL: {
      message: "If you need any more help, I'll be here!",
      spotlight: { x: 0, y: 150, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 250 },
      nextButton: "Thanks!",
      position: 'top',
      isFinale: true // Special flag to trigger AI handoff sequence
    }
  };
  
  // Get current step config
  let stepConfig = TOUR_STEPS[currentStep] || TOUR_STEPS.GOAL_ACHIEVEMENT_VALIDATION;
  
  // Progress calculation by screen
  const getScreenNumber = (step) => {
    switch(step) {
      case 'FOUNDATION_BUILDER_INTRO':
      case 'GOAL_ACHIEVEMENT_VALIDATION':
        return 1; // Profile screen
      case 'KANBAN_SYSTEM_INTRO':
      case 'PICK_CURRENT_FOCUS':
      case 'TASK_MOVED_CELEBRATION':
        return 2; // Projects screen
      case 'SCHEDULE_DEDICATED_TIME':
      case 'SYSTEM_CONFIDENCE':
        return 3; // Time screen
      case 'SUPPORTING_TOOLS_OVERVIEW':
      case 'AI_FAREWELL':
        return 4; // Todo screen
      default:
        return 1;
    }
  };
  
  const currentScreenNumber = getScreenNumber(currentStep);
  const totalScreens = 4;
  
  // Debug step config retrieval
  if (currentStep === 'AI_FAREWELL') {
    console.log('🎭 AI_FAREWELL stepConfig retrieved:', stepConfig);
    console.log('🎭 Available TOUR_STEPS keys:', Object.keys(TOUR_STEPS));
  }
  
  // NOTE: Removed message switching logic - now advances directly to next step
  // if (currentStep === 'NOTES_DAILY_STANDUP' && notesViewSwitched) { ... }
  
  // Get step-specific delay timing
  const getStepDelay = (step) => {
    switch(step) {
      case 'FOUNDATION_BUILDER_INTRO':
        return 200; // Quick delay for modal display
      case 'GOAL_ACHIEVEMENT_VALIDATION':
        return 800; // Wait for profile screen to fully load
      case 'KANBAN_SYSTEM_INTRO':
        return 400; // Wait for kanban board to render
      case 'PICK_CURRENT_FOCUS':
        return 200; // Faster transition for task selection
      case 'SCHEDULE_DEDICATED_TIME':
      case 'SYSTEM_CONFIDENCE':
        return 300; // Wait for time screen elements
      case 'SUPPORTING_TOOLS_OVERVIEW':
        return 300; // Wait for todo screen
      case 'AI_FAREWELL':
        return 200; // Quick transition for farewell
      default:
        return 300;
    }
  };
  
  useEffect(() => {
    if (isVisible) {
      console.log('🎬 AppTourOverlay: Starting animation for step', currentStep);
      
      // Debug current tour step
      console.log('🎬 AppTourOverlay: Current step:', currentStep, 'isVisible:', isVisible);
      
      // Special debug for AI_FAREWELL
      if (currentStep === 'AI_FAREWELL') {
        console.log('🎭 AI_FAREWELL step detected in AppTourOverlay!');
        console.log('🎭 Step config:', stepConfig);
      }
      
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
      // Show dark overlay only for ProfileScreen step
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
    // Special handling for finale step - create smooth transition to achievement
    if (stepConfig.isFinale) {
      console.log('🎭 Finale step - creating cinematic transition to achievement');
      
      // Phase 1: Fade out message and AI icon but KEEP overlay dark
      Animated.sequence([
        // First fade out the content
        Animated.parallel([
          Animated.timing(messageOpacity, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(aiIconScale, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
          })
        ]),
        // Brief pause in darkness for anticipation
        Animated.delay(200),
        // Then fade overlay SLIGHTLY to create depth but stay mostly dark
        Animated.timing(overlayOpacity, {
          toValue: 0.85, // Stay mostly dark! 
          duration: 300,
          useNativeDriver: true
        })
      ]).start(() => {
        // Set flag to keep ProfileScreen dark during transition
        global.tourTransitionInProgress = true;
        
        onComplete();
        
        // Navigate and trigger achievement with perfect timing
        if (navigation) {
          console.log('🧭 Tour completed - smooth transition to achievement');
          navigation.navigate('Profile');
          
          // Trigger achievement after brief pause for smooth entrance
          setTimeout(() => {
            global.showTourCompletionAchievement = true;
            // Clear transition flag after achievement shows
            setTimeout(() => {
              global.tourTransitionInProgress = false;
            }, 500);
          }, 300); // Short pause for seamless transition
        }
      });
      return;
    }

    // Regular step transition
    Animated.timing(messageOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      onComplete();
    });
  };
  
  const handleSkipTour = () => {
    setShowSkipModal(true);
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
          currentStep === 'SCHEDULE_DEDICATED_TIME' || currentStep === 'SUPPORTING_TOOLS_OVERVIEW' ||
          currentStep === 'AI_FAREWELL') {
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

  // Don't show if we're waiting for task to be moved or if it's a modal step
  if (!isVisible || 
      (currentStep === 'TASK_MOVED_CELEBRATION' && global.tourWaitingForTaskMove) ||
      (currentStep === 'FOUNDATION_BUILDER_INTRO')) {
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
      
      {/* Skip Tour Button */}
      <TouchableOpacity
        style={styles.skipTourButton}
        onPress={handleSkipTour}
        activeOpacity={0.7}
      >
        <Text style={styles.skipTourText}>Skip Tour</Text>
      </TouchableOpacity>
      
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Step {currentScreenNumber} of {totalScreens}
        </Text>
      </View>
      
      
      {/* Skip Tour Confirmation Modal */}
      <Modal
        visible={showSkipModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSkipModal(false)}
      >
        <View style={styles.skipModalOverlay}>
          <View style={[styles.skipModalContainer, { backgroundColor: theme.background, borderColor: '#FFFFFF', borderWidth: 1 }]}>
            {/* Header */}
            <View style={[styles.skipModalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.skipModalTitle, { color: theme.text }]}>Skip Interactive Tour?</Text>
            </View>
            
            {/* Content */}
            <View style={styles.skipModalContent}>
              <Text style={[styles.skipModalDescription, { color: theme.textSecondary }]}>
                The tour takes just 1 minute and shows you how to use the goal system you created.
              </Text>
              
              <View style={styles.skipModalBenefits}>
                <View style={styles.skipModalBenefit}>
                  <Ionicons name="trophy-outline" size={16} color="#F59E0B" style={styles.skipModalIcon} />
                  <Text style={[styles.skipModalBenefitText, { color: theme.text }]}>Earn 'Quick Learner' achievement</Text>
                </View>
                <View style={styles.skipModalBenefit}>
                  <Ionicons name="time-outline" size={16} color={theme.textSecondary} style={styles.skipModalIcon} />
                  <Text style={[styles.skipModalBenefitText, { color: theme.text }]}>Only 60 seconds</Text>
                </View>
                <View style={styles.skipModalBenefit}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" style={styles.skipModalIcon} />
                  <Text style={[styles.skipModalBenefitText, { color: theme.text }]}>Learn your personalized system</Text>
                </View>
              </View>
            </View>
            
            {/* Buttons */}
            <View style={styles.skipModalButtons}>
              <TouchableOpacity 
                style={[styles.skipModalContinueButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowSkipModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.skipModalContinueText}>Take the Tour</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.skipModalSkipButton, { borderColor: theme.border }]}
                onPress={() => {
                  setShowSkipModal(false);
                  handleSkip();
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.skipModalSkipText, { color: theme.textSecondary }]}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
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
  skipTourButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 1010, // Above everything
  },
  skipTourText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 1010,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Skip Modal Styles
  skipModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  skipModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  skipModalHeader: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  skipModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  skipModalContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  skipModalDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  skipModalBenefits: {
    gap: 12,
  },
  skipModalBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  skipModalIcon: {
    marginRight: 12,
    width: 20,
    textAlign: 'center',
  },
  skipModalBenefitText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  skipModalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  skipModalContinueButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipModalContinueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  skipModalSkipButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  skipModalSkipText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
});

export default AppTourOverlay;