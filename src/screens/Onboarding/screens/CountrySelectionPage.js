// src/screens/Onboarding/screens/CountrySelectionPage.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  Text,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import TypingAnimation from '../components/TypingAnimation';
import NavigationHeader from '../components/NavigationHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeAnimatedCall, createSafeAnimatedValue } from '../../../hooks/useSafeAnimation';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CountrySelectionPage = ({ onContinue, onBack }) => {
  // State
  const [selectedCountry, setSelectedCountry] = useState(null); // No initial selection
  const [messageComplete, setMessageComplete] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [containerAnimationComplete, setContainerAnimationComplete] = useState(false);
  const [aiMessageSkipped, setAiMessageSkipped] = useState(false);
  
  // Flag celebration state
  const [showFlagCelebration, setShowFlagCelebration] = useState(false);
  const [celebrationFlag, setCelebrationFlag] = useState('🏳️'); // Generic flag as default
  const [animationRunning, setAnimationRunning] = useState(false);
  
  // Refs for timeout management
  const celebrationTimeoutRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  
  // Animation values
  const fadeAnim = useRef(createSafeAnimatedValue(0)).current;
  const contentFade = useRef(createSafeAnimatedValue(0)).current;
  const optionsFade = useRef(createSafeAnimatedValue(0)).current;
  const aiMessageOpacity = useRef(createSafeAnimatedValue(0)).current;
  const buttonOpacity = useRef(createSafeAnimatedValue(0)).current;
  const iconPulse = useRef(createSafeAnimatedValue(1)).current;
  
  // Refs for typing animations
  const typingRef = useRef(null);
  
  // Available countries (alphabetical order)
  const countries = [
    { code: 'australia', name: 'Australia', flag: '🇦🇺' },
    { code: 'canada', name: 'Canada', flag: '🇨🇦' },
    { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'usa', name: 'United States', flag: '🇺🇸' },
  ];
  
  // Start animations when component mounts
  useEffect(() => {
    console.log("Starting initial animations");
    // Fade in whole screen
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Fade in content
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Staggered animations for elements
    Animated.sequence([
      // Country options fade in first
      Animated.timing(optionsFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // AI message fades in last
      Animated.timing(aiMessageOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Set container animation complete to trigger typing animation
      setContainerAnimationComplete(true);
    });
    
    // Start continuous pulse animation for the sparkle icon
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
    
    // Cleanup function
    return () => {
      // Clear timeouts on unmount
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);
  
  // Show continue button after message is complete or skipped
  useEffect(() => {
    if (messageComplete || aiMessageSkipped) {
      console.log("Message complete or skipped, showing continue button");
      setTimeout(() => {
        setShowContinueButton(true);
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, aiMessageSkipped ? 0 : 500); // No delay if skipped
    }
  }, [messageComplete, aiMessageSkipped]);
  
  // Handle country selection - immediately skip AI and continue
  const handleCountrySelect = async (countryCode) => {
    console.log("Country selected:", countryCode);
    
    try {
      // Provide haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Complete AI message immediately when country is selected
    if (!aiMessageSkipped && !messageComplete) {
      // Complete the typing animation to show full message
      if (typingRef.current && typingRef.current.skipToEnd) {
        typingRef.current.skipToEnd();
      }
      // Set message as complete rather than skipped
      setMessageComplete(true);
    }
    
    // Only trigger celebration if selecting a different country
    const isNewCountry = countryCode !== selectedCountry;
    
    // Update selected country immediately
    setSelectedCountry(countryCode);
    
    // Only show celebration for new country selections
    if (isNewCountry) {
      // Clear any existing timeouts - but allow immediate new animations
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      // Get the flag for celebration
      const selectedFlag = countries.find(c => c.code === countryCode)?.flag || '🇦🇺';
      setCelebrationFlag(selectedFlag);
      
      // Brief animation running period to prevent too rapid firing
      setAnimationRunning(true);
      
      // Start celebration immediately - this "primes" the animation system
      setShowFlagCelebration(true);
      
      // Stop celebration after animation duration
      celebrationTimeoutRef.current = setTimeout(() => {
        setShowFlagCelebration(false);
      }, 2200); // Match the new longer animation timing + buffer
      
      // Short blocking period - allows rapid switching but prevents spam
      animationTimeoutRef.current = setTimeout(() => {
        setAnimationRunning(false);
      }, 200); // Very short - just prevents button spam
    }
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('userCountry', countryCode);
      console.log("Country saved to AsyncStorage:", countryCode);
    } catch (error) {
      console.log("Error saving country:", error);
    }
    
    // Continue immediately after country selection (small delay for UX)
    setTimeout(() => {
      handleContinue();
    }, isNewCountry ? 500 : 100); // Short delay for celebration, or immediate if same country
  };
  
  // Handle continue
  const handleContinue = async () => {
    console.log("Continue pressed with country:", selectedCountry);
    
    // Validation: Don't continue if no country is selected
    if (!selectedCountry) {
      console.log("No country selected, cannot continue");
      return;
    }
    
    try {
      // Provide haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Save final country selection
    try {
      await AsyncStorage.setItem('userCountry', selectedCountry);
      console.log("Final country selection saved:", selectedCountry);
    } catch (error) {
      console.log("Error saving final country selection:", error);
    }
    
    // Continue to next screen with selected country
    onContinue(selectedCountry);
  };
  
  // Handle typing complete
  const handleTypingComplete = () => {
    console.log("Typing animation complete");
    setMessageComplete(true);
  };

  // Handle screen tap to skip AI message
  const handleScreenTap = () => {
    if (!messageComplete && !aiMessageSkipped) {
      console.log("Screen tapped, skipping AI message");
      setAiMessageSkipped(true);
      // Stop typing animation if it's running
      if (typingRef.current && typingRef.current.skipToEnd) {
        typingRef.current.skipToEnd();
      }
    }
  };
  
  // Simplified flag celebration that works well with rapid switching
  const FlagCelebration = ({ visible, flag }) => {
    if (!visible) return null;
    
    // Create a new animation instance for each flag change
    // This ensures each flag gets its own fresh animation
    return <SimpleFlagAnimation key={`${flag}-${visible}`} flag={flag} />;
  };

  // Dead simple animation component with proper cleanup
  const SimpleFlagAnimation = ({ flag }) => {
    // Start flags much higher up so priming animation is completely invisible
    const startPosition = -200; // Much higher up off-screen
    
    const flag1Y = useRef(createSafeAnimatedValue(startPosition)).current;
    const flag2Y = useRef(createSafeAnimatedValue(startPosition)).current;
    const flag3Y = useRef(createSafeAnimatedValue(startPosition)).current;
    const animationsRef = useRef([]);
    
    useEffect(() => {
      // Reset animation values to high start position
      safeAnimatedCall(flag1Y, 'setValue', startPosition);
      safeAnimatedCall(flag2Y, 'setValue', startPosition);
      safeAnimatedCall(flag3Y, 'setValue', startPosition);
      
      // Create animations but store references for cleanup
      // Increased end position to ensure flags fully exit screen
      const endPosition = SCREEN_HEIGHT + 150; // Much further past screen bottom
      
      const anim1 = Animated.timing(flag1Y, {
        toValue: endPosition,
        duration: 2000, // Slightly longer duration for complete exit
        delay: 0,
        useNativeDriver: true,
      });
      
      const anim2 = Animated.timing(flag2Y, {
        toValue: endPosition,
        duration: 2000, // Slightly longer duration for complete exit
        delay: 200,
        useNativeDriver: true,
      });
      
      const anim3 = Animated.timing(flag3Y, {
        toValue: endPosition,
        duration: 2000, // Slightly longer duration for complete exit
        delay: 400,
        useNativeDriver: true,
      });
      
      // Store animation references
      animationsRef.current = [anim1, anim2, anim3];
      
      // Start all animations
      anim1.start();
      anim2.start();
      anim3.start();
      
      // Cleanup function - stop animations when component unmounts
      return () => {
        animationsRef.current.forEach(anim => {
          if (anim && anim.stop) {
            anim.stop();
          }
        });
        // Reset values when cleaning up
        safeAnimatedCall(flag1Y, 'setValue', startPosition);
        safeAnimatedCall(flag2Y, 'setValue', startPosition);
        safeAnimatedCall(flag3Y, 'setValue', startPosition);
      };
    }, []);
    
    return (
      <View style={styles.celebrationContainer} pointerEvents="none">
        <Animated.Text
          style={[
            styles.celebrationFlag,
            {
              position: 'absolute',
              left: 80,
              top: 0,
              transform: [{ translateY: flag1Y }],
            },
          ]}
        >
          {flag}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.celebrationFlag,
            {
              position: 'absolute',
              left: SCREEN_WIDTH / 2 - 16,
              top: 0,
              transform: [{ translateY: flag2Y }],
            },
          ]}
        >
          {flag}
        </Animated.Text>
        <Animated.Text
          style={[
            styles.celebrationFlag,
            {
              position: 'absolute',
              left: SCREEN_WIDTH - 80,
              top: 0,
              transform: [{ translateY: flag3Y }],
            },
          ]}
        >
          {flag}
        </Animated.Text>
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <NavigationHeader onBack={onBack} />
      
      <TouchableWithoutFeedback onPress={handleScreenTap}>
        <Animated.View style={[styles.content, { opacity: contentFade }]}>
        {/* AI Message Section */}
        <Animated.View style={[styles.messageContainer, { opacity: aiMessageOpacity }]}>
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.iconCircle, { transform: [{ scale: iconPulse }] }]}>
              <Ionicons name="sparkles" size={18} color="#FFD700" />
            </Animated.View>
          </View>
          <View style={styles.messageTextContainer}>
            {containerAnimationComplete && (
              <TypingAnimation
                ref={typingRef}
                text="Where are you based? This helps me provide goals and advice that are relevant to your country's culture, economy, and opportunities."
                style={styles.aiMessage}
                onComplete={handleTypingComplete}
                speed={30}
              />
            )}
          </View>
        </Animated.View>
        
        {/* Country Selection */}
        <Animated.View style={[styles.optionsContainer, { opacity: optionsFade }]}>
          <Text style={styles.sectionTitle}>
            Select Your Country
          </Text>
          
          <View style={styles.countryOptions}>
            {countries.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={[
                  styles.countryOption,
                  selectedCountry === country.code && styles.selectedCountryOption
                ]}
                onPress={() => handleCountrySelect(country.code)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Select ${country.name}`}
                accessibilityState={{ selected: selectedCountry === country.code }}
              >
                <Text style={styles.countryFlag}>{country.flag}</Text>
                <Text style={[
                  styles.countryName,
                  selectedCountry === country.code && styles.selectedCountryName
                ]}>
                  {country.name}
                </Text>
                {selectedCountry === country.code && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color="#3b82f6" 
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
        
        {/* Continue Button - only show if country is selected */}
        {showContinueButton && selectedCountry && (
          <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Continue to next step"
            >
              <Text style={styles.continueButtonText}>
                Continue
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            </TouchableOpacity>
          </Animated.View>
        )}
        </Animated.View>
      </TouchableWithoutFeedback>
      
      {/* Flag Celebration Effect */}
      <FlagCelebration visible={showFlagCelebration} flag={celebrationFlag} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1425',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  // Removed fullScreenTouchable styles - no longer needed
  messageContainer: {
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
    flexDirection: 'row',
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
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
  },
  messageTextContainer: {
    flex: 1,
  },
  aiMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  optionsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  countryOptions: {
    gap: 12,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCountryOption: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  countryFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  countryName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  selectedCountryName: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 12,
  },
  buttonContainer: {
    paddingVertical: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  celebrationContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  celebrationFlag: {
    position: 'absolute',
    fontSize: 32,
    textAlign: 'center',
  },
});

export default CountrySelectionPage;