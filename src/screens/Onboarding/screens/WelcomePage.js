// src/screens/Onboarding/screens/WelcomePage.js (Updated)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  SafeAreaView,
  Platform,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ResponsiveText from '../components/ResponsiveText';
import TypingAnimation from '../components/TypingAnimation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WelcomePage = ({ onContinue, onSkipOnboarding }) => {
  // State
  const [messageStep, setMessageStep] = useState(1);
  const [messageComplete, setMessageComplete] = useState(false);
  const [showTapPrompt, setShowTapPrompt] = useState(false);
  const [initialAnimationComplete, setInitialAnimationComplete] = useState(false);
  const [showTypingAnimation, setShowTypingAnimation] = useState(false);
  const [appLanguage, setAppLanguage] = useState('en'); // Default to English
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const japaneseAppTitleOpacity = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const messageTextOpacity = useRef(new Animated.Value(1)).current;
  const promptOpacity = useRef(new Animated.Value(0)).current;
  const promptY = useRef(new Animated.Value(0)).current;
  const skipButtonOpacity = useRef(new Animated.Value(0)).current;
  
  // Animation for the sparkle icon (pulse always)
  const iconPulse = useRef(new Animated.Value(1)).current;
  
  // Reference to the typing animation component
  const typingRef = useRef(null);
  
  // Animation for floating prompt
  const promptAnimation = useRef(null);
  
  // Load language preference on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const lang = await AsyncStorage.getItem('userLanguage');
        if (lang) {
          setAppLanguage(lang);
        }
      } catch (error) {
        console.log('Error loading language:', error);
      }
    };
    
    loadLanguage();
  }, []);
  
  // Start continuous pulse animation for sparkle icon
  useEffect(() => {
    // Create and start the continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconPulse, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(iconPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
    
    // No need to clean up since we want it to run continuously
  }, []);
  
  // Handle screen tap
  const handleScreenTap = () => {
    // If message is still typing, complete it immediately
    if (!messageComplete && typingRef.current) {
      typingRef.current.complete();
      return;
    }
    
    // If first message is complete, proceed to second message
    if (messageComplete && messageStep === 1) {
      try {
        // Provide haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
      
      // Hide tap prompt
      Animated.timing(promptOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }).start();
      
      // Transition to second message
      Animated.timing(messageTextOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        setMessageStep(2);
        setMessageComplete(false);
        setShowTapPrompt(false);
        
        Animated.timing(messageTextOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }).start();
      });
    }
    // If second message is complete, proceed to next screen
    else if (messageComplete && messageStep === 2) {
      try {
        // Provide haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
      
      // Continue to next screen
      onContinue();
    }
  };
  
  // Handle skip onboarding
  const handleSkipOnboarding = () => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    if (onSkipOnboarding) {
      onSkipOnboarding();
    } else {
      // Fallback to the next screen if skip function not provided
      onContinue();
    }
  };
  
  // Initial animations
  useEffect(() => {
    // Background and logo sequence
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
      // Japanese title fade in (if applicable)
      Animated.timing(japaneseAppTitleOpacity, {
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
      // Show AI message container
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // Mark initial animations as complete
        setInitialAnimationComplete(true);
        
        // Fade in skip button
        Animated.timing(skipButtonOpacity, {
          toValue: 1,
          duration: 500,
          delay: 300,
          useNativeDriver: true,
        }).start();
      });
    });
  }, []);
  
  // Start typing animation after message container is fully visible
  useEffect(() => {
    if (initialAnimationComplete) {
      // Short delay to ensure message container is fully visible
      const timer = setTimeout(() => {
        setShowTypingAnimation(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [initialAnimationComplete]);
  
  // Handle message completion
  useEffect(() => {
    if (messageComplete) {
      setShowTapPrompt(true);
      
      // Animate prompt
      Animated.timing(promptOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        animatePrompt();
      });
    }
  }, [messageComplete]);
  
  // Animate prompt with floating effect
  const animatePrompt = () => {
    // Clean up any existing animation
    if (promptAnimation.current) {
      promptAnimation.current.stop();
    }
    
    // Reset to starting position
    promptY.setValue(0);
    
    // Create animation sequence
    const downAnimation = Animated.timing(promptY, {
      toValue: 5,
      duration: 1200,
      useNativeDriver: true,
    });
    
    const upAnimation = Animated.timing(promptY, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    });
    
    // Create sequence and store reference
    promptAnimation.current = Animated.sequence([downAnimation, upAnimation]);
    
    // Start animation with callback to repeat
    promptAnimation.current.start(({ finished }) => {
      if (finished) {
        animatePrompt();
      }
    });
  };
  
  // Get welcome text based on language and message step
  const getWelcomeMessage = () => {
    if (messageStep === 1) {
      if (appLanguage === 'ja') {
        return "ライフコンパスへようこそ！";
      }
      return "Welcome to LifeCompass!";
    } else {
      if (appLanguage === 'ja') {
        return "大きな目標を実現可能な日々のステップに変えましょう。";
      }
      return "Let's turn your big goals into achievable daily steps.";
    }
  };
  
  // Get app title - always English for branding
  const getAppTitle = () => {
    return "LifeCompass";
  };
  
  // Get Japanese app title
  const getJapaneseAppTitle = () => {
    return "ライフコンパス";
  };
  
  // Get subtitle based on language
  const getSubtitle = () => {
    if (appLanguage === 'ja') {
      return "実際に機能するシステムを構築する";
    }
    return "Build systems that actually work";
  };
  
  // Get skip button text based on language
  const getSkipText = () => {
    if (appLanguage === 'ja') {
      return "オンボーディングをスキップ";
    }
    return "Skip Onboarding";
  };
  
  // Get tap to continue text based on language
  const getTapToContinueText = () => {
    if (appLanguage === 'ja') {
      return "タップして続ける";
    }
    return "Tap to continue";
  };
  
  // Determine typing speed based on message step
  // First message is shorter, so can be a bit slower for emphasis
  // Second message is longer, so make it faster
  const getTypingSpeed = () => {
    return messageStep === 1 ? 40 : 20; // 40ms for first message, 20ms for second message
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Skip Button - positioned at the top right */}
      <Animated.View style={[styles.skipButtonContainer, { opacity: skipButtonOpacity }]}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkipOnboarding}
          activeOpacity={0.7}
        >
          <ResponsiveText style={styles.skipButtonText}>
            {getSkipText()}
          </ResponsiveText>
        </TouchableOpacity>
      </Animated.View>
      
      <TouchableOpacity 
        style={styles.container}
        activeOpacity={0.9}
        onPress={handleScreenTap}
      >
        <View style={styles.content}>
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
              <View style={styles.logoCircle}>
                <Ionicons name="compass" size={80} color="#FFFFFF" />
              </View>
            </Animated.View>
          </View>
          
          {/* Text section */}
          <View style={styles.textSection}>
            <Animated.View style={{ opacity: titleOpacity }}>
              <ResponsiveText style={styles.appTitle}>
                {getAppTitle()}
              </ResponsiveText>
            </Animated.View>
            
            {/* Japanese app title - only shown when language is Japanese */}
            {appLanguage === 'ja' && (
              <Animated.View style={{ opacity: japaneseAppTitleOpacity }}>
                <Text style={styles.japaneseAppTitle}>
                  {getJapaneseAppTitle()}
                </Text>
              </Animated.View>
            )}
            
            <Animated.View style={{ opacity: subtitleOpacity }}>
              {appLanguage === 'ja' ? (
                <ResponsiveText style={styles.subtitle}>
                  {getSubtitle()}
                </ResponsiveText>
              ) : (
                <ResponsiveText style={styles.subtitle}>
                  {getSubtitle()}
                </ResponsiveText>
              )}
            </Animated.View>
          </View>
          
          {/* AI Message section */}
          <Animated.View style={[styles.messageSection, { opacity: messageOpacity }]}>
            <View style={styles.messageContainer}>
              <View style={styles.iconContainer}>
                <Animated.View 
                  style={[
                    styles.iconCircle,
                    { transform: [{ scale: iconPulse }] }
                  ]}
                >
                  <Ionicons name="sparkles" size={18} color="#FFD700" />
                </Animated.View>
              </View>
              <Animated.View style={[styles.textContainer, { opacity: messageTextOpacity }]}>
                {showTypingAnimation ? (
                  <TypingAnimation
                    ref={typingRef}
                    key={`welcomeTyping-${messageStep}`}
                    text={getWelcomeMessage()}
                    typingSpeed={getTypingSpeed()} // Use dynamic typing speed
                    onComplete={() => setMessageComplete(true)}
                    skipTyping={false}
                  />
                ) : (
                  <ResponsiveText style={{ fontSize: 15, color: '#FFFFFF', lineHeight: 22, opacity: 0 }}>
                    {/* Empty placeholder to maintain layout */}
                    {getWelcomeMessage()}
                  </ResponsiveText>
                )}
              </Animated.View>
            </View>
          </Animated.View>
          
          {/* Touch to continue prompt */}
          {showTapPrompt && (
            <Animated.View 
              style={[
                styles.promptContainer,
                { 
                  opacity: promptOpacity,
                  transform: [{ translateY: promptY }]
                }
              ]}
            >
              <ResponsiveText style={styles.promptText}>
                {getTapToContinueText()}
              </ResponsiveText>
              <Ionicons name="chevron-down" size={20} color="#FFFFFF" />
            </Animated.View>
          )}
        </View>
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
    width: 160,
    height: 160,
    borderRadius: 80,
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
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  japaneseAppTitle: {
    fontSize: 24,
    color: '#999999', // Gray color for Japanese app title
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 16,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.9,
  },
  japaneseSubtitle: {
    fontSize: 15, // Smaller for more refined, prestigious look
    color: '#999999', // Unmistakable medium grey color
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.8,
    marginHorizontal: 20, // Added to ensure text has enough margins
  },
  messageSection: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 40,
    minHeight: 120,
    justifyContent: 'center',
  },
  messageContainer: {
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
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  iconCircle: {
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
  textContainer: {
    flex: 1,
  },
  promptContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500',
  },
  skipButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
  },
  skipButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  }
});

export default WelcomePage;