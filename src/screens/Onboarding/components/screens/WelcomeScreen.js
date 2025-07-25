// src/screens/Onboarding/components/screens/WelcomeScreen.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale } from '../../styles/onboardingStyles';
import ResponsiveText from '../ResponsiveText';
import { getAccessibilityProps } from '../../utils/accessibility';
import { isLowEndDevice } from '../../utils/deviceUtils';
import { triggerHaptic, HapticPatterns } from '../../utils/hapticUtils';

// Debug constants
const DEBUG_TAG = "[Onboarding] WelcomeScreen";
const DEBUG_ENABLED = false;

/**
 * WelcomeScreen - First impression for the onboarding process
 * Enhanced with haptic feedback and optimized animations
 * 
 * @param {function} onContinue - Function to advance to next screen
 * @param {string} typingText - Current AI typing text
 * @param {string} fullText - Complete AI text
 */
const WelcomeScreen = ({ onContinue, typingText, fullText }) => {
  // Debugging - Track render count
  const renderCount = useRef(0);
  renderCount.current++;
  
  if (DEBUG_ENABLED) {
    console.log(`${DEBUG_TAG} - RENDER #${renderCount.current} START`);
  }
  
  // UI States - carefully managed to prevent loops
  const [showAIMessage, setShowAIMessage] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [tapEnabled, setTapEnabled] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  
  // Use ref to track if typingComplete has been called to prevent multiple calls
  const typingCompleteCalledRef = useRef(false);
  
  // Store AIMessage ref
  const aiMessageRef = useRef(null);
  
  // Check if device is low-end for performance optimizations
  const isLowEnd = isLowEndDevice();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const touchPromptY = useRef(new Animated.Value(0)).current;
  const touchPromptOpacity = useRef(new Animated.Value(0)).current;
  
  // Animation references
  const promptAnimation = useRef(null);

  // Custom typing animation implementation
  const [displayedText, setDisplayedText] = useState('');
  const typingTimerRef = useRef(null);
  const textIndexRef = useRef(0);
  
  // Fallback message text if fullText is empty
  const messageText = fullText || "Welcome to LifeCompass! I'll help you implement proven frameworks to achieve more goals through strategic alignment.";
  
  // Type the text character by character
  const typeText = useCallback(() => {
    const text = messageText;
    
    if (textIndexRef.current < text.length) {
      setDisplayedText(text.substring(0, textIndexRef.current + 1));
      textIndexRef.current++;
      
      // Schedule next character
      typingTimerRef.current = setTimeout(typeText, 30);
    } else {
      // Typing complete
      if (!typingCompleteCalledRef.current) {
        typingCompleteCalledRef.current = true;
        setIsTypingComplete(true);
        
        // Trigger haptic feedback when typing completes
        triggerHaptic(HapticPatterns.TYPING_COMPLETE);
        
        // Show prompt after typing completes
        setTimeout(() => {
          setShowPrompt(true);
          setTapEnabled(true);
          
          // Animate prompt
          Animated.timing(touchPromptOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            animatePrompt();
          });
        }, 500);
      }
    }
  }, [messageText]);
  
  // Skip typing animation
  const skipTypingAnimation = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    
    setDisplayedText(messageText);
    
    if (!typingCompleteCalledRef.current) {
      typingCompleteCalledRef.current = true;
      setIsTypingComplete(true);
      
      // Trigger haptic feedback for skipping
      triggerHaptic(HapticPatterns.SELECTION_CHANGED);
      
      // Show prompt immediately
      setShowPrompt(true);
      setTapEnabled(true);
      
      // Animate prompt
      Animated.timing(touchPromptOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        animatePrompt();
      });
    }
  }, [messageText]);
  
  // Handle screen tap - use useCallback to prevent recreation
  const handleScreenTap = useCallback(() => {
    if (DEBUG_ENABLED) {
      console.log(`${DEBUG_TAG} - handleScreenTap called`, { 
        isTypingComplete, 
        tapEnabled,
        typingCompleteCalled: typingCompleteCalledRef.current 
      });
    }
    
    if (!typingCompleteCalledRef.current) {
      // If typing is not complete, skip to complete
      triggerHaptic(HapticPatterns.BUTTON_PRESS);
      skipTypingAnimation();
    } else if (tapEnabled) {
      // If typing is complete and tap is enabled, proceed to next screen
      // Trigger a more pronounced haptic feedback for main navigation
      triggerHaptic(HapticPatterns.BUTTON_CONFIRM);
      
      if (DEBUG_ENABLED) {
        console.log(`${DEBUG_TAG} - Calling onContinue`);
      }
      onContinue();
    }
  }, [skipTypingAnimation, tapEnabled, onContinue]);
  
  // Animate the prompt with a clean, seamless animation
  const animatePrompt = useCallback(() => {
    if (DEBUG_ENABLED) {
      console.log(`${DEBUG_TAG} - animatePrompt called`);
    }
    
    // Clean up any existing animation
    if (promptAnimation.current) {
      promptAnimation.current.stop();
      promptAnimation.current = null;
    }
    
    // Reset to starting position
    touchPromptY.setValue(0);
    
    // Create animation sequence
    const downAnimation = Animated.timing(touchPromptY, {
      toValue: 3, // Subtle movement - only 3px
      duration: 1200,
      useNativeDriver: true,
    });
    
    const upAnimation = Animated.timing(touchPromptY, {
      toValue: 0, // Return to exact starting position
      duration: 1200,
      useNativeDriver: true,
    });
    
    // Create sequence and store reference
    promptAnimation.current = Animated.sequence([downAnimation, upAnimation]);
    
    // Start animation with callback to repeat if still mounted
    promptAnimation.current.start(({ finished }) => {
      if (finished && promptAnimation.current) {
        animatePrompt();
      }
    });
  }, [touchPromptY]);
  
  // EFFECTS
  
  // Initial animations effect - runs once on mount
  useEffect(() => {
    if (DEBUG_ENABLED) {
      console.log(`${DEBUG_TAG} - Initial animations effect running`);
    }
    
    // Optimize animations for low-end devices
    if (isLowEnd) {
      // Simplified animation for low-end devices
      fadeAnim.setValue(1);
      logoOpacity.setValue(1);
      logoScale.setValue(1);
      titleOpacity.setValue(1);
      subtitleOpacity.setValue(1);
      
      // Show AI message with short delay
      setTimeout(() => {
        if (DEBUG_ENABLED) {
          console.log(`${DEBUG_TAG} - Setting showAIMessage to true (low-end device)`);
        }
        setShowAIMessage(true);
        messageOpacity.setValue(1);
        
        // Start typing for low-end devices
        setTimeout(() => {
          typeText();
        }, 100);
      }, 100);
    } else {
      // Full animation sequence for modern devices
      // Background animation first
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
      
      // Logo and text sequence
      Animated.sequence([
        // Logo fade in
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        // Logo scales to full size
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        // Title fade in
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // Subtitle fade in
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Trigger haptic feedback when main elements are visible
        triggerHaptic(HapticPatterns.SCREEN_TRANSITION);
        
        // Show AI message with a short delay
        setTimeout(() => {
          if (DEBUG_ENABLED) {
            console.log(`${DEBUG_TAG} - Setting showAIMessage to true`);
          }
          setShowAIMessage(true);
          
          // Start message fade in
          Animated.timing(messageOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            // Trigger subtle haptic when AI message appears
            triggerHaptic(HapticPatterns.AI_RESPONSE);
            
            // Start typing animation after fade in
            setTimeout(() => {
              typeText();
            }, 100);
          });
        }, 300);
      });
    }
    
    // Cleanup animations on unmount
    return () => {
      if (DEBUG_ENABLED) {
        console.log(`${DEBUG_TAG} - Cleanup: animations`);
      }
      
      if (promptAnimation.current) {
        promptAnimation.current.stop();
        promptAnimation.current = null;
      }
      
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, []);
  
  if (DEBUG_ENABLED) {
    console.log(`${DEBUG_TAG} - RENDER #${renderCount.current} COMPLETE`, {
      showAIMessage,
      isTypingComplete,
      typingCompleteCalled: typingCompleteCalledRef.current,
      showPrompt,
      tapEnabled
    });
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity 
        style={styles.container}
        activeOpacity={0.9}
        onPress={handleScreenTap}
        {...getAccessibilityProps({
          label: "Welcome to LifeCompass",
          hint: "Tap anywhere to continue or skip typing animation",
          role: "button"
        })}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Logo section */}
          <View style={styles.logoSection}>
            <Animated.View 
              style={[
                styles.logoContainer,
                { 
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }] 
                }
              ]}
            >
              <View 
                style={styles.logoCircle}
                accessible={true}
                accessibilityLabel="LifeCompass logo"
                accessibilityRole="image"
              >
                <Ionicons name="compass" size={80} color="#FFFFFF" />
              </View>
            </Animated.View>
          </View>
          
          {/* Text section */}
          <View style={styles.textSection}>
            <Animated.View 
              style={{ opacity: titleOpacity }}
            >
              <ResponsiveText 
                style={styles.appTitle}
                accessibilityRole="header"
              >
                LifeCompass
              </ResponsiveText>
            </Animated.View>
            
            <Animated.View 
              style={{ opacity: subtitleOpacity }}
            >
              <ResponsiveText 
                style={styles.subtitle}
              >
                Build systems that actually work
              </ResponsiveText>
            </Animated.View>
          </View>
          
          {/* AI Message section with custom implementation */}
          <Animated.View 
            style={[
              styles.messageSection, 
              { opacity: messageOpacity }
            ]}
          >
            {showAIMessage && (
              <View style={styles.staticMessageContainer}>
                <View style={styles.staticIconContainer}>
                  <View style={styles.staticIconCircle}>
                    <Ionicons name="sparkles" size={18} color="#FFD700" />
                  </View>
                </View>
                <View style={styles.staticTextContainer}>
                  <ResponsiveText style={styles.staticMessageText}>
                    {displayedText}
                  </ResponsiveText>
                </View>
              </View>
            )}
          </Animated.View>
          
          {/* Touch to continue with smooth floating animation */}
          {showPrompt && (
            <Animated.View 
              style={[
                styles.touchPromptContainer,
                { 
                  opacity: touchPromptOpacity,
                  transform: [{ translateY: touchPromptY }]
                }
              ]}
              accessible={true}
              accessibilityLabel="Touch anywhere to continue"
              accessibilityRole="text"
              accessibilityHint="Tap the screen to proceed to the next step"
            >
              <ResponsiveText style={styles.touchPromptText}>
                Touch anywhere to continue
              </ResponsiveText>
              <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
            </Animated.View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0c1425',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 80,
  },
  logoSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: scale(160),
    height: scale(160),
    borderRadius: scale(80),
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  textSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: scale(42, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: scale(20, 0.3),
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.9,
  },
  messageSection: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 40,
    minHeight: 120, // Fixed height to prevent layout shifts
    justifyContent: 'center',
  },
  // Static message styles with custom typing animation
  staticMessageContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 20, 30, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#2563eb',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  staticIconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  staticIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 58, 138, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.7)',
  },
  staticTextContainer: {
    flex: 1,
  },
  staticMessageText: {
    fontSize: scale(15, 0.3),
    color: '#FFFFFF',
    lineHeight: 22,
  },
  touchPromptContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  touchPromptText: {
    fontSize: scale(16, 0.3),
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500',
  }
});

export default WelcomeScreen;