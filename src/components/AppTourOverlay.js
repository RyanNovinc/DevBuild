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
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import TypingAnimation from '../screens/Onboarding/components/TypingAnimation';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  children 
}) => {
  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const spotlightScale = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const aiIconScale = useRef(new Animated.Value(0)).current;
  
  // State
  const [messageComplete, setMessageComplete] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  
  // Tour steps configuration
  const TOUR_STEPS = {
    PROFILE_GOALS: {
      message: "Perfect! Your goal has been created and broken down into 3 milestones. See how the numbers show your progress hierarchy.",
      spotlight: { x: 20, y: 200, width: SCREEN_WIDTH - 40, height: 100 },
      nextButton: "Got it",
      position: 'bottom'
    },
    PROFILE_DOMAIN_WHEEL: {
      message: "This wheel will track where you're investing your time. Right now it shows your chosen focus area.",
      spotlight: { x: 20, y: 320, width: SCREEN_WIDTH - 40, height: 200 },
      nextButton: "Show me my plan",
      position: 'bottom'
    },
    KANBAN_INTRO: {
      message: "Here's your command center. Goals become milestones, milestones become tasks. Drag cards between columns as you progress.",
      spotlight: { x: 0, y: 100, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 200 },
      nextButton: "How do I schedule work?",
      position: 'top'
    },
    TIME_BLOCKS: {
      message: "Drag any task here to commit to a specific time. This turns intentions into appointments with yourself.",
      spotlight: { x: 0, y: 150, width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 250 },
      nextButton: "What about the AI?",
      position: 'top'
    },
    AI_ASSISTANT: {
      message: "I know your specific goal and can break down any milestone into actionable next steps. Just ask me anything about your plan.",
      spotlight: { x: SCREEN_WIDTH - 80, y: SCREEN_HEIGHT - 150, width: 70, height: 70 },
      nextButton: "Let's get started!",
      position: 'center'
    }
  };
  
  // Get current step config
  const stepConfig = TOUR_STEPS[currentStep] || TOUR_STEPS.PROFILE_GOALS;
  
  useEffect(() => {
    if (isVisible) {
      // Reset and prepare for new step
      setMessageComplete(false);
      setCurrentMessage(stepConfig.message);
      
      // Animate in
      Animated.sequence([
        // Fade in overlay
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        // Scale up spotlight
        Animated.spring(spotlightScale, {
          toValue: 1,
          tension: 65,
          friction: 10,
          useNativeDriver: true
        }),
        // Show AI icon
        Animated.spring(aiIconScale, {
          toValue: 1,
          tension: 65,
          friction: 10,
          useNativeDriver: true
        }),
        // Fade in message area
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(spotlightScale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(messageOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [isVisible, currentStep]);
  
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
  
  // Calculate message box position based on spotlight
  const getMessagePosition = () => {
    const spot = spotlightTarget || stepConfig.spotlight;
    
    if (stepConfig.position === 'top') {
      return { top: 80 };
    } else if (stepConfig.position === 'center') {
      return { top: SCREEN_HEIGHT / 2 - 100 };
    } else {
      // Position below the spotlight
      return { top: spot.y + spot.height + 20 };
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Dark overlay with spotlight hole */}
      <Animated.View 
        style={[
          StyleSheet.absoluteFillObject,
          { opacity: overlayOpacity }
        ]}
        pointerEvents="box-none"
      >
        {/* Full dark overlay */}
        <View style={styles.darkOverlay} />
        
        {/* Spotlight hole (transparent area) */}
        <Animated.View
          style={[
            styles.spotlight,
            {
              left: (spotlightTarget || stepConfig.spotlight).x - 10,
              top: (spotlightTarget || stepConfig.spotlight).y - 10,
              width: (spotlightTarget || stepConfig.spotlight).width + 20,
              height: (spotlightTarget || stepConfig.spotlight).height + 20,
              transform: [{ scale: spotlightScale }]
            }
          ]}
          pointerEvents="none"
        >
          {/* Glowing border effect */}
          <View style={styles.spotlightGlow} />
        </Animated.View>
      </Animated.View>
      
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
          <View style={styles.aiIconCircle}>
            <Ionicons name="sparkles" size={20} color="#fff" />
          </View>
        </View>
        
        {/* Message bubble */}
        <View style={styles.messageBubble}>
          <TypingAnimation
            text={currentMessage}
            onComplete={() => setMessageComplete(true)}
            typingSpeed={30}
            style={styles.messageText}
          />
          
          {/* Action buttons */}
          {messageComplete && (
            <Animated.View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Skip tour</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.nextText}>{stepConfig.nextButton}</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </Animated.View>
      
      {/* Allow interaction with highlighted area */}
      <View
        style={[
          styles.interactiveArea,
          {
            left: (spotlightTarget || stepConfig.spotlight).x,
            top: (spotlightTarget || stepConfig.spotlight).y,
            width: (spotlightTarget || stepConfig.spotlight).width,
            height: (spotlightTarget || stepConfig.spotlight).height,
          }
        ]}
        pointerEvents="box-none"
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  spotlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  spotlightGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    backgroundColor: 'transparent',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  messageContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  aiIconContainer: {
    marginBottom: 10,
  },
  aiIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  messageBubble: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  nextText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  interactiveArea: {
    position: 'absolute',
  },
});

export default AppTourOverlay;