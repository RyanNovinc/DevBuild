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
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
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
  
  // Sparkle celebration state
  const [showSparkleCelebration, setShowSparkleCelebration] = useState(false);
  const [celebrationCountry, setCelebrationCountry] = useState(null);
  const [celebrationPosition, setCelebrationPosition] = useState({ x: 0, y: 0 });
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
    
    // AI message fades in first
    Animated.timing(aiMessageOpacity, {
      toValue: 1,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }).start(() => {
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
  
  // Show country options and continue button after message is complete or skipped
  useEffect(() => {
    if (messageComplete || aiMessageSkipped) {
      console.log("Message complete or skipped, showing country options and continue button");
      
      // Show country options first
      Animated.timing(optionsFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Show continue button after a delay
      setTimeout(() => {
        setShowContinueButton(true);
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, aiMessageSkipped ? 200 : 500); // Shorter delay if skipped
    }
  }, [messageComplete, aiMessageSkipped]);
  
  // Handle country selection - immediately skip AI and continue
  const handleCountrySelect = async (countryCode, event) => {
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
    
    // If same country is selected, deselect it
    if (countryCode === selectedCountry) {
      console.log("Deselecting country:", countryCode);
      setSelectedCountry(null);
      
      // Stop any ongoing celebration animation
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      setShowSparkleCelebration(false);
      setAnimationRunning(false);
      
      // Remove from AsyncStorage
      try {
        await AsyncStorage.removeItem('userCountry');
        console.log("Country removed from AsyncStorage");
      } catch (error) {
        console.log("Error removing country:", error);
      }
      return; // Exit early, no celebration needed
    }
    
    // Update selected country immediately
    setSelectedCountry(countryCode);
    
    // Show celebration for new country selection
    // Always clear existing timeouts and stop current animation
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
    }
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    // Stop current animation immediately
    setShowSparkleCelebration(false);
    
    // Get the country for celebration
    const selectedCountry = countries.find(c => c.code === countryCode);
    setCelebrationCountry(selectedCountry);
    
    // Calculate card position for sparkle origin
    if (event && event.nativeEvent) {
      const { pageX, pageY } = event.nativeEvent;
      // Adjust Y position to account for header and status bar offset
      const adjustedY = pageY - 40; // Move up by 40px to match finger position better
      setCelebrationPosition({ x: pageX, y: adjustedY });
    } else {
      // Fallback to center of screen if touch data is not available
      setCelebrationPosition({ x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 });
    }
    
    // Brief delay to ensure state updates, then start new animation
    setTimeout(() => {
      setAnimationRunning(true);
      setShowSparkleCelebration(true);
      
      // Stop celebration after animation duration
      celebrationTimeoutRef.current = setTimeout(() => {
        setShowSparkleCelebration(false);
        setAnimationRunning(false);
      }, 1500);
    }, 50); // Very short delay to ensure clean state transition
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('userCountry', countryCode);
      console.log("Country saved to AsyncStorage:", countryCode);
    } catch (error) {
      console.log("Error saving country:", error);
    }
    
    // Don't auto-continue - user must click Continue button
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
    console.log("Screen tapped, checking if can skip:", { messageComplete, aiMessageSkipped });
    if (!messageComplete && !aiMessageSkipped) {
      console.log("Screen tapped, skipping AI message");
      setAiMessageSkipped(true);
      // Complete typing animation if it's running
      if (typingRef.current) {
        if (typingRef.current.skipToEnd) {
          typingRef.current.skipToEnd();
        } else if (typingRef.current.complete) {
          typingRef.current.complete();
        }
      }
      // Also set message as complete
      setMessageComplete(true);
    }
  };
  
  // Get country-specific emoji for falling effect (like the flags)
  const getCountryEmoji = (countryCode) => {
    switch (countryCode) {
      case 'usa':
        return '🦅'; // Eagle
      case 'uk':
        return '☕'; // Tea cup
      case 'canada':
        return '🍁'; // Maple leaf
      case 'australia':
        return '🦘'; // Kangaroo
      default:
        return '⭐'; // Default star
    }
  };

  // Sparkle celebration component
  const SparkleCelebration = ({ visible, country, position }) => {
    if (!visible || !country) return null;
    
    return <SparkleAnimation key={`${country.code}-${visible}`} country={country} position={position} />;
  };

  // Simple falling emoji animation (like the original flags)
  const SparkleAnimation = ({ country, position }) => {
    const emoji = getCountryEmoji(country.code);
    const emojiCount = 5; // Fewer emojis, like the original flags
    const emojis = Array.from({ length: emojiCount }, (_, i) => i);
    
    // Create animated values for firework burst animation
    const emojiAnims = emojis.map(() => ({
      opacity: useRef(createSafeAnimatedValue(0)).current,
      scale: useRef(createSafeAnimatedValue(0)).current,
      translateX: useRef(createSafeAnimatedValue(0)).current,
      translateY: useRef(createSafeAnimatedValue(0)).current,
    }));
    
    const animationsRef = useRef([]);
    
    useEffect(() => {
      // Reset all values to starting position (at touch point)
      emojiAnims.forEach((anim) => {
        safeAnimatedCall(anim.opacity, 'setValue', 0);
        safeAnimatedCall(anim.scale, 'setValue', 0);
        safeAnimatedCall(anim.translateX, 'setValue', 0);
        safeAnimatedCall(anim.translateY, 'setValue', 0);
      });
      
      // Create firework burst animations
      const allAnimations = emojiAnims.map((anim, index) => {
        // Calculate burst direction for each emoji
        const angle = (index / emojiCount) * Math.PI * 2; // Full circle
        const distance = 80 + Math.random() * 40; // Random distance 80-120px
        const finalX = Math.cos(angle) * distance;
        const finalY = Math.sin(angle) * distance;
        
        return Animated.sequence([
          // Pop in at touch point
          Animated.parallel([
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: 150,
              delay: index * 80, // Quick stagger
              useNativeDriver: true,
            }),
            Animated.timing(anim.scale, {
              toValue: 1,
              duration: 150,
              delay: index * 80,
              useNativeDriver: true,
            }),
          ]),
          // Burst outward in arc motion
          Animated.parallel([
            Animated.timing(anim.translateX, {
              toValue: finalX,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(anim.translateY, {
              toValue: finalY,
              duration: 1200,
              useNativeDriver: true,
            }),
            // Fade out while moving
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 800,
              delay: 400, // Start fading partway through
              useNativeDriver: true,
            }),
            // Slight scale down while fading
            Animated.timing(anim.scale, {
              toValue: 0.7,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
        ]);
      });
      
      // Store animations for cleanup
      animationsRef.current = allAnimations;
      
      // Start all animations
      allAnimations.forEach(anim => anim.start());
      
      // Cleanup function
      return () => {
        animationsRef.current.forEach(anim => {
          if (anim && anim.stop) {
            anim.stop();
          }
        });
        // Reset values
        emojiAnims.forEach((anim) => {
          safeAnimatedCall(anim.opacity, 'setValue', 0);
          safeAnimatedCall(anim.scale, 'setValue', 0);
          safeAnimatedCall(anim.translateX, 'setValue', 0);
          safeAnimatedCall(anim.translateY, 'setValue', 0);
        });
      };
    }, []);
    
    return (
      <View style={styles.celebrationContainer} pointerEvents="none">
        {emojis.map((emojiIndex) => {
            const anim = emojiAnims[emojiIndex];
            
            return (
              <Animated.Text
                key={emojiIndex}
                style={[
                  styles.fallingEmoji,
                  {
                    position: 'absolute',
                    left: (position?.x || SCREEN_WIDTH / 2) - 16, // Center emoji on touch point
                    top: (position?.y || SCREEN_HEIGHT / 2) - 16,
                    opacity: anim.opacity,
                    transform: [
                      { scale: anim.scale },
                      { translateX: anim.translateX },
                      { translateY: anim.translateY },
                    ],
                  },
                ]}
              >
                {emoji}
              </Animated.Text>
            );
          })}
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <NavigationHeader onBack={onBack} />
      
      <Animated.View style={[styles.content, { opacity: contentFade }]}>
        {/* Background touchable area for skipping AI message - only active if message is not complete */}
        {(!messageComplete && !aiMessageSkipped) && (
          <TouchableWithoutFeedback onPress={handleScreenTap}>
            <View style={styles.backgroundTouchable} />
          </TouchableWithoutFeedback>
        )}
        
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
                onPress={(event) => handleCountrySelect(country.code, event)}
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
      
      {/* Sparkle Celebration Effect */}
      <SparkleCelebration 
        visible={showSparkleCelebration} 
        country={celebrationCountry} 
        position={celebrationPosition} 
      />
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
  sparkleCenter: {
    position: 'absolute',
    width: 1,
    height: 1,
  },
  fallingEmoji: {
    fontSize: 32,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  backgroundTouchable: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});

export default CountrySelectionPage;