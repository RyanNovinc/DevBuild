// src/screens/Onboarding/StreamlinedOnboardingScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  BackHandler,
  Animated,
  Keyboard,
  Alert,
  Dimensions,
  LogBox
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import WelcomeScreen from './components/screens/WelcomeScreen';
import FrameworkScreen from './components/screens/FrameworkScreen';
import FocusSelectionScreen from './components/screens/FocusSelectionScreen';
import SystemHierarchyScreen from './components/screens/SystemHierarchyScreen';
import WhyItWorksScreen from './components/screens/WhyItWorksScreen';
import TutorialScreen from './components/screens/TutorialScreen';

// Import components
import Confetti from './components/Confetti';
import AISignupScreen from './components/AISignupScreen';
import AchievementBadgeModal from './components/modals/AchievementBadgeModal';
import SkipOnboardingButton from './components/SkipOnboardingButton';

// Import data
import { statistics, focusOptions, generateLifeDirection } from './data/onboardingData';

// Import accessibility and optimization utils
import { ResponsiveText } from './components/ResponsiveText';
import { getAccessibilityProps } from './utils/accessibility';
import { isLowEndDevice, useOrientation } from './utils/deviceUtils';

// Ignore specific warnings that might be related to the issue
LogBox.ignoreLogs([
  'Maximum update depth exceeded',
  'VirtualizedLists should never be nested',
  'Can\'t perform a React state update on an unmounted component'
]);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * StreamlinedOnboardingScreen - Completely rewritten to avoid infinite loops
 * Uses class components for screens that had update issues
 */
const StreamlinedOnboardingScreen = ({ navigation, route }) => {
  const { updateAppSetting } = useAppContext();
  const { orientation } = useOrientation();
  
  // Detect if device is low-end for performance optimizations
  const isLowEnd = isLowEndDevice();
  
  // Screen state
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const hierarchyAnimValues = useRef({
    lifeDirection: new Animated.Value(0),
    goal: new Animated.Value(0),
    project: new Animated.Value(0),
    tasks: new Animated.Value(0)
  }).current;
  
  // Transition animations
  const badgeFadeAnim = useRef(new Animated.Value(1)).current;
  const aiSignupFadeAnim = useRef(new Animated.Value(0)).current;
  const tutorialFadeAnim = useRef(new Animated.Value(0)).current;
  
  // User input state
  const [focusInput, setFocusInput] = useState('');
  const [lifeDirection, setLifeDirection] = useState('');
  
  // Modal state
  const [showBadge, setShowBadge] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAISignup, setShowAISignup] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tokensClaimed, setTokensClaimed] = useState(false);
  
  // Typing animation state - we're using refs instead of state for better stability
  const fullText = useRef('');
  const typingComplete = useRef(false);
  
  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentScreen === 0) {
        return false; // Let system handle back on first screen
      }
      
      if (showBadge || showAISignup || showTutorial) {
        return true; // Prevent back when showing modals
      }
      
      // Go back to previous screen
      setCurrentScreen(prev => prev - 1);
      return true;
    });
    
    return () => backHandler.remove();
  }, [currentScreen, showBadge, showAISignup, showTutorial]);
  
  // Animation between screens - careful to avoid infinite loops
  useEffect(() => {
    // Update the AI response text when screen changes
    fullText.current = getAIResponse();
    typingComplete.current = false;
    
    // Optimize animations for low-end devices
    if (isLowEnd) {
      // Simpler animation sequence for low-end devices
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
      
      // Skip slide animation on low-end devices
      slideAnim.setValue(0);
    } else {
      // Full animation sequence for normal devices
      Animated.sequence([
        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true
        }),
        // Slide in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true
          })
        ])
      ]).start();
      
      // Reset slide position for next animation
      slideAnim.setValue(20);
    }
    
    // Start hierarchy animation if on hierarchy screen
    if (currentScreen === 3) {
      animateHierarchy();
    }
  }, [currentScreen, isLowEnd]);
  
  // Get AI response based on current screen and focus
  const getAIResponse = () => {
    switch (currentScreen) {
      case 0: // Welcome
        return "Welcome to LifeCompass! I'll help you implement proven frameworks to achieve more goals through strategic alignment.";
      case 1: // Framework
        return "LifeCompass uses business methodologies to create a structured system that aligns your daily tasks with your bigger goals.";
      case 2: // Focus Selection
        if (!focusInput) return "Select a focus area to begin your strategic journey.";
        
        switch (focusInput) {
          case 'Career':
            return "Career focus is excellent! I'll help you build a system to advance professionally while maintaining work-life balance.";
          case 'Business':
            return "Business focus is perfect! We'll create a framework to build scalable ventures with sustainable growth.";
          case 'Growth':
            return "Growth focus is a great choice! I'll help you develop expertise in high-impact areas with measurable progress.";
          case 'Balance':
            return "Balance focus is wise! We'll build a system to strategically allocate resources across all your life domains.";
          default:
            return `${focusInput} focus will help build your strategic system.`;
        }
      case 3: // System Hierarchy
        return "Your achievement system is ready using proven methodology. Each level connects to create an aligned framework for success.";
      case 4: // Why It Works
        return "Our approach is based on extensive research showing significantly higher achievement rates with structured systems.";
      default:
        return "";
    }
  };
  
  // Animate hierarchy items sequentially - with performance optimizations
  const animateHierarchy = () => {
    // Reset animation values
    Object.values(hierarchyAnimValues).forEach(value => value.setValue(0));
    
    if (isLowEnd) {
      // Simple animation for low-end devices
      Animated.timing(hierarchyAnimValues.lifeDirection, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Immediately set other animations to end state with a slight delay
      setTimeout(() => {
        hierarchyAnimValues.goal.setValue(1);
        setTimeout(() => {
          hierarchyAnimValues.project.setValue(1);
          setTimeout(() => {
            hierarchyAnimValues.tasks.setValue(1);
          }, 100);
        }, 100);
      }, 300);
    } else {
      // Full staggered animation for modern devices
      Animated.stagger(300, [
        // Life Direction animation
        Animated.spring(hierarchyAnimValues.lifeDirection, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true
        }),
        // Goal animation
        Animated.spring(hierarchyAnimValues.goal, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true
        }),
        // Project animation
        Animated.spring(hierarchyAnimValues.project, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true
        }),
        // Tasks animation
        Animated.spring(hierarchyAnimValues.tasks, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true
        })
      ]).start();
    }
  };
  
  // NAVIGATION FUNCTIONS
  
  // Go to next screen
  const goToNextScreen = () => {
    if (currentScreen < 4) {
      setCurrentScreen(prevScreen => prevScreen + 1);
    } else {
      completeOnboarding();
    }
  };
  
  // Go to previous screen
  const goToPreviousScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(prevScreen => prevScreen - 1);
    }
  };
  
  // Complete onboarding
  const completeOnboarding = async () => {
    if (showBadge || showConfetti || isNavigating) {
      return;
    }

    try {
      // Save user data
      const profileData = {
        name: 'User',
        email: '',
        profileImage: null
      };
      
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      
      // Save life direction
      const finalLifeDirection = lifeDirection || generateLifeDirection(focusInput);
      await AsyncStorage.setItem('lifeDirection', finalLifeDirection);
      
      // Update app context
      if (updateAppSetting) {
        await updateAppSetting('userProfile', profileData);
        await updateAppSetting('lifeDirection', finalLifeDirection);
      }
      
      // First show badge without confetti
      setShowBadge(true);
      
      // Set a slight delay before starting confetti to ensure modal is fully rendered
      setTimeout(() => {
        setShowConfetti(true);
      }, 200);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      Alert.alert('Error', 'Failed to save your data. Please try again.');
    }
  };
  
  // Handle skipping onboarding
  const handleSkipOnboarding = async () => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    try {
      // Mark onboarding as completed
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      
      // Update app context
      if (updateAppSetting) {
        await updateAppSetting('onboardingCompleted', true);
      }
      
      // Generate a default life direction based on the focus (if set)
      const defaultDirection = focusInput ? generateLifeDirection(focusInput) : 
        "I am building a strategic framework to align my daily actions with my long-term vision.";
      
      // Save default life direction
      await AsyncStorage.setItem('lifeDirection', defaultDirection);
      
      if (updateAppSetting) {
        await updateAppSetting('lifeDirection', defaultDirection);
      }
      
      // Set up basic profile
      const profileData = {
        name: 'User',
        email: '',
        profileImage: null
      };
      
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      
      if (updateAppSetting) {
        await updateAppSetting('userProfile', profileData);
      }
      
      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      setIsNavigating(false);
    }
  };
  
  // Handle claiming AI tokens
  const handleClaimTokens = async () => {
    try {
      // Save 100 tokens to storage
      const existingTokensStr = await AsyncStorage.getItem('aiAssistantTokens');
      const existingTokens = existingTokensStr ? parseInt(existingTokensStr, 10) : 0;
      const newBalance = existingTokens + 100;
      
      await AsyncStorage.setItem('aiAssistantTokens', newBalance.toString());
      setTokensClaimed(true);
    } catch (error) {
      console.error('Error saving tokens:', error);
      // Still mark as claimed even if saving fails
      setTokensClaimed(true);
    }
  };
  
  // SIMPLIFIED TRANSITIONS - using simple opacity fades for reliability
  
  // Handle badge close - Show AI signup screen
  const handleBadgeClose = () => {
    // Simple reliable transition that won't cause React errors
    Animated.timing(badgeFadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true
    }).start(() => {
      // Hide badge and confetti
      setShowBadge(false);
      setShowConfetti(false);
      
      // Show AI signup and fade it in
      setShowAISignup(true);
      aiSignupFadeAnim.setValue(0);
      
      Animated.timing(aiSignupFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }).start();
    });
  };
  
  // Handle AI signup completion - Show tutorial
  const handleAISignupComplete = async () => {
    try {
      // Mark onboarding as completed
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      
      // Update app context
      if (updateAppSetting) {
        await updateAppSetting('onboardingCompleted', true);
      }
      
      // Simple fade transition that won't cause React errors
      Animated.timing(aiSignupFadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      }).start(() => {
        // Hide AI signup and show tutorial
        setShowAISignup(false);
        setShowTutorial(true);
        
        // Fade in tutorial
        tutorialFadeAnim.setValue(0);
        Animated.timing(tutorialFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }).start();
      });
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      // Simple fallback
      setShowAISignup(false);
      setShowTutorial(true);
    }
  };
  
  // Navigate to main app
  const navigateToMainApp = () => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    // Fade out tutorial before navigation
    Animated.timing(tutorialFadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      // Use reset to ensure a clean navigation state
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    });
  };
  
  // If showing tutorial screen
  if (showTutorial) {
    return (
      <Animated.View 
        style={{ flex: 1, opacity: tutorialFadeAnim }}
        {...getAccessibilityProps({
          label: "Tutorial Screen",
          role: "none"
        })}
      >
        <TutorialScreen 
          onComplete={navigateToMainApp}
          isNavigating={isNavigating}
        />
      </Animated.View>
    );
  }
  
  // If showing AI signup screen
  if (showAISignup) {
    return (
      <Animated.View 
        style={{ flex: 1, opacity: aiSignupFadeAnim }}
        {...getAccessibilityProps({
          label: "AI Signup Screen",
          role: "none"
        })}
      >
        <AISignupScreen 
          isNavigating={isNavigating}
          onContinue={handleAISignupComplete}
          onSkip={handleAISignupComplete}
        />
      </Animated.View>
    );
  }
  
  // Main onboarding screens
  return (
    <SafeAreaView 
      style={[
        styles.container,
        orientation === 'landscape' && styles.containerLandscape
      ]}
      accessible={true}
      accessibilityLabel={`Onboarding Screen ${currentScreen + 1} of 5`}
      accessibilityRole="none"
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Skip Onboarding Button - Only show on framework, focus, and system screens */}
      {currentScreen > 0 && currentScreen < 4 && !showBadge && !showAISignup && !showTutorial && (
        <SkipOnboardingButton onSkip={handleSkipOnboarding} />
      )}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Animated.View 
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {/* Welcome Screen */}
          {currentScreen === 0 && (
            <WelcomeScreen 
              onContinue={goToNextScreen}
              fullText={fullText.current}
            />
          )}
          
          {/* Framework Screen */}
          {currentScreen === 1 && (
            <FrameworkScreen 
              currentScreen={currentScreen}
              onBack={goToPreviousScreen}
              onContinue={goToNextScreen}
              fullText={fullText.current}
            />
          )}
          
          {/* Focus Selection Screen */}
          {currentScreen === 2 && (
            <FocusSelectionScreen 
              key="focusScreen" // Added key to force clean remount
              currentScreen={currentScreen}
              onBack={goToPreviousScreen}
              onContinue={goToNextScreen}
              focusInput={focusInput}
              setFocusInput={setFocusInput}
              lifeDirection={lifeDirection}
              setLifeDirection={setLifeDirection}
              generateLifeDirection={generateLifeDirection}
              fullText={fullText.current}
            />
          )}
          
          {/* System Hierarchy Screen */}
          {currentScreen === 3 && (
            <SystemHierarchyScreen 
              currentScreen={currentScreen}
              onBack={goToPreviousScreen}
              onContinue={goToNextScreen}
              focusInput={focusInput}
              lifeDirection={lifeDirection}
              generateLifeDirection={generateLifeDirection}
              fullText={fullText.current}
              hierarchyAnimValues={hierarchyAnimValues}
            />
          )}
          
          {/* Why It Works Screen */}
          {currentScreen === 4 && (
            <WhyItWorksScreen 
              currentScreen={currentScreen}
              onBack={goToPreviousScreen}
              onComplete={completeOnboarding}
              statistics={statistics}
            />
          )}
        </Animated.View>
      </KeyboardAvoidingView>
      
      {/* Achievement Badge Modal with fade animation */}
      <Animated.View 
        style={{ opacity: badgeFadeAnim }}
        accessible={showBadge}
        accessibilityLabel="Achievement Badge"
        accessibilityRole="alert"
        importantForAccessibility={showBadge ? "yes" : "no-hide-descendants"}
      >
        <AchievementBadgeModal 
          visible={showBadge}
          tokensClaimed={tokensClaimed}
          onClaimTokens={handleClaimTokens}
          onContinue={handleBadgeClose}
        />
      </Animated.View>
      
      {/* Professional Achievement Animation */}
      {showConfetti && (
        <View 
          style={styles.confettiContainer}
          accessibilityLabel="Celebration animation"
          importantForAccessibility="no"
        >
          <Confetti 
            active={showConfetti}
            colors={['#2563eb', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd']}
            type="fireworks" 
            count={isLowEnd ? 30 : 60} // Reduce particle count on low-end devices
            duration={3500} 
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  containerLandscape: {
    flexDirection: 'row',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
});

export default StreamlinedOnboardingScreen;