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
  const [goalExpanded, setGoalExpanded] = useState(false); // Track if goal was expanded during OVERVIEW_PLAN
  const [milestoneExpanded, setMilestoneExpanded] = useState(false); // Track if milestone was expanded during OVERVIEW_PLAN
  const [kanbanTaskMoved, setKanbanTaskMoved] = useState(false); // Track if task was moved to in progress
  const [kanbanTaskCompleted, setKanbanTaskCompleted] = useState(false); // Track if task was completed
  
  // Ref for typing animation
  const typingRef = useRef(null);
  
  // Tour steps configuration - each with individually optimized positions
  const TOUR_STEPS = {
    PROFILE_GOALS: {
      message: "1: Perfect! Your goal has been created and broken down into 3 milestones. See how the numbers show your progress hierarchy.",
      spotlight: { x: 20, y: 200, width: SCREEN_WIDTH - 40, height: 100 },
      nextButton: "Got it",
      position: 'bottom' // Below stats cards
    },
    PROFILE_DOMAIN_WHEEL: {
      message: "2: This wheel will track where you're investing your time. Right now it shows your chosen focus area.",
      spotlight: { x: 20, y: 320, width: SCREEN_WIDTH - 40, height: 200 },
      nextButton: "Show me my plan",
      position: 'top' // Above domain wheel to avoid covering it
    },
    OVERVIEW_PLAN: {
      message: "3: This is your execution roadmap. You can add new goals, break down milestones, or create custom tasks anytime with this button.",
      spotlight: { x: SCREEN_WIDTH - 80, y: SCREEN_HEIGHT - 150, width: 70, height: 70 },
      nextButton: "Show me the workflow",
      position: 'bottom' // Bottom so it doesn't cover the goal content
    },
    KANBAN_INTRO: {
      message: "6: Here's your daily command center. Drag tasks through your workflow as you make real progress towards your goals.",
      spotlight: { x: 0, y: 100, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 200 },
      nextButton: "How do I schedule work?",
      position: 'top' // Above kanban content
    },
    TIME_BLOCKS: {
      message: "7: Drag any task here to commit to a specific time. This turns intentions into appointments with yourself.",
      spotlight: { x: 0, y: 150, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 250 },
      nextButton: "What about the AI?",
      position: 'top' // Above time blocks content
    },
    AI_ASSISTANT: {
      message: "8: I know your specific goal and can break down any milestone into actionable next steps. Just ask me anything about your plan.",
      spotlight: { x: SCREEN_WIDTH - 80, y: SCREEN_HEIGHT - 150, width: 70, height: 70 },
      nextButton: "Let's get started!",
      position: 'center' // Center for final message
    }
  };
  
  // Get current step config
  const stepConfig = TOUR_STEPS[currentStep] || TOUR_STEPS.PROFILE_GOALS;
  
  // Get step-specific delay timing
  const getStepDelay = (step) => {
    switch(step) {
      case 'PROFILE_GOALS':
      case 'PROFILE_DOMAIN_WHEEL':
        return 900; // Wait for stats cards animation
      case 'OVERVIEW_PLAN':
        return 200; // Minimal delay for navigation completion
      case 'KANBAN_INTRO':
      case 'TIME_BLOCKS':
      case 'AI_ASSISTANT':
        return 300; // Standard delay
      default:
        return 300;
    }
  };
  
  useEffect(() => {
    if (isVisible) {
      // FORCE RESTART: Reset ALL animation values and states for new step
      console.log('🎬 AppTourOverlay: FORCE RESTART for step', currentStep);
      
      // Stop any running animations
      overlayOpacity.stopAnimation();
      messageOpacity.stopAnimation();
      aiIconScale.stopAnimation();
      aiIconPulse.stopAnimation();
      tapPromptOpacity.stopAnimation();
      
      // Reset all animation values to initial state
      overlayOpacity.setValue(0);
      messageOpacity.setValue(0);
      aiIconScale.setValue(0);
      aiIconPulse.setValue(1);
      tapPromptOpacity.setValue(0);
      
      // Reset all component states
      setMessageComplete(false);
      setCurrentMessage(stepConfig.message);
      setShowTyping(false);
      setShowTapToContinue(false);
      setGoalExpanded(false); // Reset goal expansion state for new step
      setMilestoneExpanded(false); // Reset milestone expansion state for new step
      setKanbanTaskMoved(false); // Reset kanban task movement state for new step
      setKanbanTaskCompleted(false); // Reset kanban task completion state for new step
      
      const stepDelay = getStepDelay(currentStep);
      console.log('🎬 AppTourOverlay: Starting FRESH animation for step', currentStep, 'with delay', stepDelay);
      
      // Dramatic entrance animation with step-specific timing
      Animated.sequence([
        // 1. Instantly darken everything
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        }),
        // 2. Wait a moment for dramatic effect
        Animated.delay(300),
        // 3. Step-specific delay based on content
        Animated.delay(stepDelay),
        // 4. Show AI icon and message
        Animated.parallel([
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
  
  // Show tap prompt when message is complete
  useEffect(() => {
    if (messageComplete && showTyping) {
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
  }, [messageComplete, showTyping]);
  
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
      // Special handling for OVERVIEW_PLAN step
      if (currentStep === 'OVERVIEW_PLAN' && !goalExpanded) {
        // First tap: expand the goal to show milestones
        console.log('🎯 Message 4: Expanding goal to show milestones');
        if (onSpecialAction) {
          onSpecialAction('expandGoal');
        }
        setGoalExpanded(true);
        // Update message to indicate what happened
        setCurrentMessage("4: Perfect! See how milestones break down your goal into manageable steps. This hierarchy keeps you focused on what's next.");
        return;
      }
      
      if (currentStep === 'OVERVIEW_PLAN' && goalExpanded && !milestoneExpanded) {
        // Second tap: expand first milestone to show tasks
        console.log('🎯 Message 5: Expanding first milestone to show tasks');
        if (onSpecialAction) {
          onSpecialAction('expandMilestone');
        }
        setMilestoneExpanded(true);
        // Update message to show the complete hierarchy
        setCurrentMessage("5: Amazing! Now you can see the complete hierarchy: Goals → Milestones → Tasks. Each level breaks down into smaller, actionable steps.");
        return;
      }
      
      // Special handling for KANBAN_INTRO step
      if (currentStep === 'KANBAN_INTRO' && !kanbanTaskMoved) {
        // First tap: move task to in progress
        console.log('🎯 Message 6: Moving task to In Progress');
        if (onSpecialAction) {
          onSpecialAction('moveTaskToProgress');
        }
        setKanbanTaskMoved(true);
        // Update message to highlight in progress section and WIP limits
        setCurrentMessage("6: See how this task moved to In Progress! Notice the WIP limit (2) - this prevents you from taking on too many tasks at once for better focus.");
        return;
      }
      
      if (currentStep === 'KANBAN_INTRO' && kanbanTaskMoved && !kanbanTaskCompleted) {
        // Second tap: complete the task
        console.log('🎯 Message 6: Completing task and moving to Done');
        if (onSpecialAction) {
          onSpecialAction('completeTask');
        }
        setKanbanTaskCompleted(true);
        // Update message to highlight completed section
        setCurrentMessage("6: Perfect! Task completed and moved to Done. This is how you make real progress - one task at a time through your workflow.");
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
      return { top: 80 };
    } else if (stepConfig.position === 'center') {
      return { top: SCREEN_HEIGHT / 2 - 100 };
    } else if (stepConfig.position === 'bottom') {
      // Special positioning for message 3/6 to avoid tap-to-continue conflict
      if (currentStep === 'OVERVIEW_PLAN') {
        return { bottom: 160 }; // Higher up to avoid tap prompt
      }
      return { bottom: 100 }; // Default bottom position
    } else if (currentStep === 'PROFILE_DOMAIN_WHEEL') {
      // Position at top for domain wheel step to avoid covering the wheel
      return { top: 100 };
    } else {
      // Position below the spotlight
      return { top: spot.y + spot.height + 20 };
    }
  };
  
  
  if (!isVisible) return null;
  
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-only">
      {/* Full-screen touchable for tap-to-advance and blocking interactions */}
      <TouchableOpacity
        style={styles.fullScreenTouchable}
        activeOpacity={1}
        onPress={handleScreenTap}
      />
      
      {/* Simple full-screen dark overlay */}
      <Animated.View 
        style={[
          styles.fullScreenOverlay,
          { opacity: overlayOpacity }
        ]}
        pointerEvents="none"
      />
      
      {/* AI Message Box */}
      <Animated.View
        style={[
          styles.messageContainer,
          getMessagePosition(),
          {
            opacity: messageOpacity,
            transform: [{ scale: aiIconScale }]
          }
        ]}
        pointerEvents="box-none"
      >
        {/* AI Icon */}
        <View style={styles.aiIconContainer}>
          <Animated.View style={[styles.aiIconCircle, { 
            transform: [{ scale: Animated.multiply(aiIconScale, aiIconPulse) }] 
          }]}>
            <Ionicons name="sparkles" size={18} color="#FFD700" />
          </Animated.View>
        </View>
        
        {/* Message bubble */}
        <View style={styles.messageBubble}>
          {showTyping ? (
            <TypingAnimation
              ref={typingRef}
              text={currentMessage}
              onComplete={() => setMessageComplete(true)}
              typingSpeed={30}
              style={styles.messageText}
            />
          ) : (
            <Text style={styles.messageText}></Text>
          )}
          
        </View>
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
      
      {/* Dev Exit Button - Only in development */}
      {__DEV__ && (
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
  messageContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1006, // Above the touchable
  },
  aiIconContainer: {
    marginBottom: 10,
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
  messageBubble: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10, // For Android
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