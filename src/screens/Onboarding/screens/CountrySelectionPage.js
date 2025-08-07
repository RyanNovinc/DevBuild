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
  Dimensions,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import TypingAnimation from '../components/TypingAnimation';
import NavigationHeader from '../components/NavigationHeader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeAnimatedCall, createSafeAnimatedValue } from '../../../hooks/useSafeAnimation';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CountrySelectionPage = ({ onContinue, onBack, onCountrySelected }) => {
  // State
  const [selectedCountry, setSelectedCountry] = useState(null); // No initial selection
  const [messageStep, setMessageStep] = useState(1); // Track which message we're on (1, 2, or 3)
  const [messageComplete, setMessageComplete] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [containerAnimationComplete, setContainerAnimationComplete] = useState(false);
  const [aiMessageSkipped, setAiMessageSkipped] = useState(false);
  const [showCountryOptions, setShowCountryOptions] = useState(false);
  
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
  const messageTextOpacity = useRef(createSafeAnimatedValue(1)).current;
  const buttonOpacity = useRef(createSafeAnimatedValue(0)).current;
  const iconPulse = useRef(createSafeAnimatedValue(1)).current;
  const fortune500Opacity = useRef(createSafeAnimatedValue(0)).current;
  const tapPromptFloat = useRef(createSafeAnimatedValue(0)).current;
  const tapPromptOpacity = useRef(createSafeAnimatedValue(0)).current;
  
  // Refs for typing animations
  const typingRef = useRef(null);
  
  // Available countries (prioritized order: Australia first, then major markets)
  const countries = [
    { code: 'australia', name: 'Australia', flag: '🇦🇺' },
    { code: 'usa', name: 'United States', flag: '🇺🇸' },
    { code: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'canada', name: 'Canada', flag: '🇨🇦' },
    { code: 'newzealand', name: 'New Zealand', flag: '🇳🇿' },
    { code: 'singapore', name: 'Singapore', flag: '🇸🇬' },
    { code: 'ireland', name: 'Ireland', flag: '🇮🇪' },
    { code: 'india', name: 'India', flag: '🇮🇳' },
    { code: 'malaysia', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'nigeria', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'philippines', name: 'Philippines', flag: '🇵🇭' },
    { code: 'southafrica', name: 'South Africa', flag: '🇿🇦' },
  ];
  
  // Country animations - create after countries array is defined
  const countryAnimations = useRef(
    countries.map(() => ({
      opacity: createSafeAnimatedValue(0),
      translateY: createSafeAnimatedValue(30),
    }))
  ).current;
  
  // Get current message based on step
  const getCurrentMessage = () => {
    switch(messageStep) {
      case 1:
        return "Welcome to LifeCompass!";
      case 2:
        return "This app applies the strategic planning methods we studied from Fortune 500 companies to turn ambitious goals into measurable results.";
      case 3:
        return "Let's start with choosing a country so I can customize your onboarding process.";
      default:
        return "";
    }
  };
  
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
  
  // Show country options only after message step 3 is complete
  useEffect(() => {
    if ((messageComplete || aiMessageSkipped) && messageStep === 3) {
      console.log("Final message complete, showing country options");
      setShowCountryOptions(true);
      
      // Show section title first
      Animated.timing(optionsFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Cascade in country cards with staggered timing
      const countryAnimationPromises = countryAnimations.map((anim, index) => {
        return new Promise(resolve => {
          setTimeout(() => {
            Animated.parallel([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.spring(anim.translateY, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
              })
            ]).start(resolve);
          }, index * 150); // 150ms stagger between each country
        });
      });
      
      // Show continue button after all countries have animated in
      Promise.all(countryAnimationPromises).then(() => {
        setTimeout(() => {
          setShowContinueButton(true);
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 200);
      });
    }
  }, [messageComplete, aiMessageSkipped, messageStep]);
  
  // Show Fortune 500 visual when message step 2 is complete
  useEffect(() => {
    if (messageStep === 2 && messageComplete) {
      // Fade in Fortune 500 visual after message 2 completes
      Animated.timing(fortune500Opacity, {
        toValue: 1,
        duration: 600,
        delay: 200, // Small delay after message completes
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out Fortune 500 visual for other steps
      Animated.timing(fortune500Opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [messageStep, messageComplete]);
  
  // Start floating animation for tap prompt when it's visible
  useEffect(() => {
    if (messageComplete && !showCountryOptions) {
      // Fade in tap prompt
      Animated.timing(tapPromptOpacity, {
        toValue: 1,
        duration: 300,
        delay: 200,
        useNativeDriver: true,
      }).start();
      
      // Start the gentle floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(tapPromptFloat, {
            toValue: -8, // Move up 8px
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(tapPromptFloat, {
            toValue: 0, // Move back to original position
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Fade out tap prompt when country options show
      Animated.timing(tapPromptOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
      
      // Stop the animation and reset position when not visible
      tapPromptFloat.stopAnimation();
      tapPromptFloat.setValue(0);
    }
  }, [messageComplete, showCountryOptions]);
  
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

    // Immediately update parent progress bar
    if (onCountrySelected) {
      onCountrySelected(countryCode);
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
      
      // Hide continue button when country is deselected
      setShowContinueButton(false);
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
      
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
    
    // Show continue button immediately when country is selected
    if (!showContinueButton) {
      setShowContinueButton(true);
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
    
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
      // Always start new animation (previous one was already stopped above)
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
    console.log(`Typing animation complete for step ${messageStep}`);
    setMessageComplete(true);
  };

  // Handle screen tap to progress through messages or skip typing
  const handleScreenTap = () => {
    console.log("Screen tapped", { messageStep, messageComplete, aiMessageSkipped, showCountryOptions });
    
    // If typing is still in progress, complete it immediately
    if (!messageComplete && !aiMessageSkipped) {
      console.log("Screen tapped, completing current typing");
      if (typingRef.current) {
        if (typingRef.current.skipToEnd) {
          typingRef.current.skipToEnd();
        } else if (typingRef.current.complete) {
          typingRef.current.complete();
        }
      }
      setMessageComplete(true);
      return;
    }
    
    // If message is complete and we're not on the final step, go to next message
    if (messageComplete && messageStep < 3) {
      console.log(`Moving from step ${messageStep} to ${messageStep + 1}`);
      
      // Fade out current message
      Animated.timing(messageTextOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Update to next step
        setMessageStep(messageStep + 1);
        setMessageComplete(false);
        setAiMessageSkipped(false);
        
        // Fade in new message
        Animated.timing(messageTextOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
    // If we're on step 3 and message is complete, country options should already be showing
  };
  
  // Get country-specific emoji for falling effect (like the flags)
  const getCountryEmoji = (countryCode) => {
    switch (countryCode) {
      case 'usa':
        return '🦅'; // Eagle
      case 'uk':
        return '👑'; // Crown
      case 'canada':
        return '🍁'; // Maple leaf
      case 'australia':
        return '🦘'; // Kangaroo
      case 'india':
        return '🐘'; // Elephant
      case 'ireland':
        return '🍀'; // Shamrock (Four leaf clover)
      case 'malaysia':
        return '🕌'; // Mosque (Petronas Towers)
      case 'newzealand':
        return '🥝'; // Kiwi bird (represented by kiwi fruit emoji)
      case 'nigeria':
        return '🐆'; // Leopard
      case 'philippines':
        return '🏝️'; // Tropical island
      case 'singapore':
        return '🏙️'; // City skyline
      case 'southafrica':
        return '🦁'; // Lion
      default:
        return '⭐'; // Default star
    }
  };

  // Sparkle celebration component
  const SparkleCelebration = ({ visible, country, position }) => {
    if (!visible || !country) return null;
    
    return <SparkleAnimation key={country.code} country={country} position={position} />;
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
      <Animated.View style={[styles.content, { opacity: contentFade }]}>
        {/* Background touchable area for message progression - active during messages and when ready to progress */}
        {!showCountryOptions && (
          <TouchableWithoutFeedback onPress={handleScreenTap}>
            <View style={styles.backgroundTouchable} />
          </TouchableWithoutFeedback>
        )}
        
        {/* Fortune 500 Method Visual - only show on message step 2 */}
        <Animated.View style={[styles.fortune500Container, { opacity: fortune500Opacity }]}>
          <TouchableOpacity 
            style={styles.fortune500Card}
            onPress={handleScreenTap}
            activeOpacity={0.9}
          >
            <View style={styles.fortune500Badge}>
              <Text style={styles.fortune500BadgeText}>BASED ON</Text>
            </View>
            <Text style={styles.fortune500MainTitle}>Fortune 500</Text>
            <Text style={styles.fortune500Subtitle}>Principles</Text>
            <View style={styles.fortune500Underline} />
            <Text style={styles.fortune500Method}>STRATEGIC PLANNING</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* AI Message Section */}
        <Animated.View style={[styles.messageContainer, { opacity: aiMessageOpacity }]}>
          <View style={styles.iconContainer}>
            <Animated.View style={[styles.iconCircle, { transform: [{ scale: iconPulse }] }]}>
              <Ionicons name="sparkles" size={18} color="#FFD700" />
            </Animated.View>
          </View>
          <Animated.View style={[styles.messageTextContainer, { opacity: messageTextOpacity }]}>
            {containerAnimationComplete && (
              <TypingAnimation
                ref={typingRef}
                key={messageStep} // Force re-render when message step changes
                text={getCurrentMessage()}
                style={styles.aiMessage}
                onComplete={handleTypingComplete}
                speed={30}
              />
            )}
          </Animated.View>
        </Animated.View>
        
        {/* Country Selection - only show after message step 3 is complete */}
        {showCountryOptions && (
          <Animated.View style={[styles.optionsContainer, { opacity: optionsFade }]}>
            <Text style={styles.sectionTitle}>
              Select Your Country
            </Text>
            
            <ScrollView 
              style={styles.countryScrollView}
              contentContainerStyle={styles.countryOptions}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              {countries.map((country, index) => (
                <Animated.View
                  key={country.code}
                  style={{
                    opacity: countryAnimations[index].opacity,
                    transform: [{ translateY: countryAnimations[index].translateY }]
                  }}
                >
                  <TouchableOpacity
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
                </Animated.View>
              ))}
            </ScrollView>
        </Animated.View>
        )}
        
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
      
      {/* Central Tap to Continue Prompt - show when message is complete but not on final step */}
      {messageComplete && !showCountryOptions && (
        <Animated.View 
          style={[
            styles.centralTapPrompt,
            { 
              opacity: tapPromptOpacity,
              transform: [{ translateY: tapPromptFloat }]
            }
          ]}
          pointerEvents="none"
        >
          <Text style={styles.tapPromptText}>Tap to continue</Text>
          <Ionicons 
            name="chevron-down" 
            size={24} 
            color="rgba(255,255,255,0.7)" 
            style={styles.tapPromptIcon} 
          />
        </Animated.View>
      )}
      
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
    paddingTop: 60, // Move content higher to top of screen
  },
  // Removed fullScreenTouchable styles - no longer needed
  messageContainer: {
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginTop: 0, // Position at top
    marginBottom: 20,
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
  countryScrollView: {
    flex: 1,
  },
  countryOptions: {
    gap: 12,
    paddingBottom: 20, // Extra padding at bottom for better scroll experience
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
  // Fortune 500 Method Visual Styles
  fortune500Container: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    transform: [{ translateY: -50 }], // Center vertically
    zIndex: 10,
  },
  fortune500Card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    minWidth: 280,
    maxWidth: 340,
  },
  fortune500Badge: {
    backgroundColor: '#1a365d',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 16,
  },
  fortune500BadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  fortune500MainTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1a202c',
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 40,
    marginVertical: 4,
  },
  fortune500Subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  fortune500Underline: {
    width: 60,
    height: 4,
    backgroundColor: '#3182ce',
    borderRadius: 2,
    marginBottom: 16,
  },
  fortune500Method: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2d3748',
    letterSpacing: 2,
    textAlign: 'center',
  },
  // Central Tap to Continue Prompt Styles (consistent with other screens)
  centralTapPrompt: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9, // Lower than the touchable but visible
  },
  tapPromptText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  tapPromptIcon: {
    marginTop: -4,
  },
});

export default CountrySelectionPage;