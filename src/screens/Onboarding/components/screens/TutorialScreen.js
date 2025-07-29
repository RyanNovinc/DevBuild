// src/screens/Onboarding/components/screens/TutorialScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  AccessibilityInfo
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveText from '../ResponsiveText';
import { getAccessibilityProps } from '../../utils/accessibility';
import { isLowEndDevice, useOrientation } from '../../utils/deviceUtils';
import { t } from '../../utils/i18n';
import { ensureContrast } from '../../utils/contrastUtils';

/**
 * TutorialScreen - Final screen of the onboarding process with tutorial cards
 * Enhanced with accessibility, responsive text, and performance optimizations
 * 
 * @param {function} onComplete - Function to navigate to main app
 * @param {boolean} isNavigating - Whether navigation is in progress
 */
const TutorialScreen = ({ onComplete, isNavigating }) => {
  // Get orientation for responsive layout
  const { orientation, dimensions } = useOrientation();
  
  // Detect if device is low-end for performance optimizations
  const isLowEnd = isLowEndDevice();
  
  // Get current dimensions for responsive sizing
  const { width, height } = dimensions || Dimensions.get('window');
  
  // Tutorial card data - enhanced with accessibility information
  const tutorialCards = [
    {
      id: 'goals',
      icon: 'flag-outline',
      title: 'Define Goals',
      text: 'Create goals aligned with your strategic direction.',
      accessibilityHint: 'Goals are aligned with your personal mission statement'
    },
    {
      id: 'projects',
      icon: 'folder-outline',
      title: 'Build Projects',
      text: 'Break goals into projects with clear outcomes.',
      accessibilityHint: 'Projects have clear outcomes that support your goals'
    },
    {
      id: 'time',
      icon: 'time-outline',
      title: 'Allocate Time',
      text: 'Use time blocks for high-impact priorities.',
      accessibilityHint: 'Time blocks help you focus on high-impact priorities'
    },
    {
      id: 'measure',
      icon: 'analytics-outline',
      title: 'Track Progress',
      text: 'Measure performance and optimize with AI.',
      accessibilityHint: 'Track progress and optimize with AI assistance'
    }
  ];
  
  // State for current card and animations
  const [currentCard, setCurrentCard] = useState(0);
  const [animating, setAnimating] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardFadeAnim = useRef(new Animated.Value(1)).current;
  const cardScaleAnim = useRef(new Animated.Value(1)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const touchPromptAnim = useRef(new Animated.Value(0)).current;
  
  // Animation references
  const promptAnimationRef = useRef(null);
  
  // Announce card changes to screen readers
  useEffect(() => {
    if (Platform.OS === 'ios') {
      const currentCardData = tutorialCards[currentCard];
      // In a real implementation, this would announce the card content
      // AccessibilityInfo.announceForAccessibility(
      //   `${currentCardData.title}: ${currentCardData.text}`
      // );
    }
  }, [currentCard]);
  
  // Animate entrance on mount
  useEffect(() => {
    if (isLowEnd) {
      // Simplified animation for low-end devices
      fadeAnim.setValue(1);
      buttonFadeAnim.setValue(1);
      touchPromptAnim.setValue(1);
    } else {
      // Full animation sequence for modern devices
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true
        }),
        Animated.delay(300),
        Animated.timing(buttonFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(touchPromptAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        })
      ]).start(() => {
        // Start floating animation for touch prompt
        startPromptAnimation();
      });
    }
    
    return () => {
      // Clean up animations
      if (promptAnimationRef.current) {
        promptAnimationRef.current.stop();
      }
    };
  }, [isLowEnd]);
  
  // Handle card transition with animation
  const changeCard = (index) => {
    if (animating || index === currentCard || index < 0 || index >= tutorialCards.length) return;
    
    setAnimating(true);
    
    // Provide haptic feedback (on iOS)
    if (Platform.OS === 'ios') {
      // In a real implementation, we would add haptic feedback here
    }
    
    if (isLowEnd) {
      // Simple transition for low-end devices
      setCurrentCard(index);
      setAnimating(false);
    } else {
      // Animated transition for modern devices
      Animated.sequence([
        // Fade out and scale down current card
        Animated.parallel([
          Animated.timing(cardFadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
          }),
          Animated.timing(cardScaleAnim, {
            toValue: 0.95,
            duration: 200,
            useNativeDriver: true
          })
        ]),
        // Change card after fade out
        Animated.timing(cardFadeAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true
        }),
      ]).start(() => {
        // Update card
        setCurrentCard(index);
        
        // Reset animation values
        cardScaleAnim.setValue(0.95);
        
        // Fade in and scale up new card
        Animated.parallel([
          Animated.timing(cardFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.spring(cardScaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true
          })
        ]).start(() => {
          setAnimating(false);
        });
      });
    }
  };
  
  // Navigate to previous card
  const goToPreviousCard = () => {
    if (currentCard > 0) {
      changeCard(currentCard - 1);
    }
  };
  
  // Navigate to next card
  const goToNextCard = () => {
    if (currentCard < tutorialCards.length - 1) {
      changeCard(currentCard + 1);
    } else {
      // If on last card, navigate to app
      handleComplete();
    }
  };
  
  // Animate the prompt with a clean, seamless animation
  const startPromptAnimation = () => {
    // Clean up any existing animation
    if (promptAnimationRef.current) {
      promptAnimationRef.current.stop();
    }
    
    // Reset to starting position
    touchPromptAnim.setValue(0);
    
    // Sequence of animations that form a complete cycle
    const downAnimation = Animated.timing(touchPromptAnim, {
      toValue: 3, // Subtle movement - only 3px
      duration: 1200,
      useNativeDriver: true,
    });
    
    const upAnimation = Animated.timing(touchPromptAnim, {
      toValue: 0, // Return to exact starting position
      duration: 1200,
      useNativeDriver: true,
    });
    
    // Create the sequence
    promptAnimationRef.current = Animated.sequence([downAnimation, upAnimation]);
    
    // Start animation and set up recursive call to ensure perfect looping
    promptAnimationRef.current.start(({ finished }) => {
      if (finished) {
        // Only restart if animation completed (not interrupted)
        startPromptAnimation();
      }
    });
  };
  
  // Handle complete button press
  const handleComplete = () => {
    if (isNavigating) return;
    
    // Provide haptic feedback
    if (Platform.OS === 'ios') {
      // In a real implementation, we would add haptic feedback here
    }
    
    // Fade out before navigating
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: isLowEnd ? 150 : 300,
      useNativeDriver: true
    }).start(() => {
      if (onComplete) {
        onComplete();
      }
    });
  };
  
  // Current card data
  const currentCardData = tutorialCards[currentCard];
  
  return (
    <SafeAreaView 
      style={[
        styles.safeArea,
        orientation === 'landscape' && styles.safeAreaLandscape
      ]}
      accessible={true}
      accessibilityLabel="Tutorial Screen"
      accessibilityRole="none"
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <Animated.View 
        style={[
          styles.container, 
          { opacity: fadeAnim },
          orientation === 'landscape' && styles.containerLandscape
        ]}
      >
        {/* Header Section */}
        <View 
          style={[
            styles.header,
            orientation === 'landscape' && styles.headerLandscape
          ]}
          accessible={true}
          accessibilityRole="header"
        >
          <ResponsiveText style={styles.title}>
            System Overview
          </ResponsiveText>
          <ResponsiveText style={styles.subtitle}>
            Your achievement framework is ready
          </ResponsiveText>
        </View>
        
        {/* Card-based tutorial with improved accessibility */}
        <View 
          style={[
            styles.tutorialCardContainer,
            orientation === 'landscape' && styles.tutorialCardContainerLandscape
          ]}
        >
          <Animated.View 
            style={[
              styles.tutorialCard,
              orientation === 'landscape' && styles.tutorialCardLandscape,
              {
                opacity: cardFadeAnim,
                transform: [{ scale: cardScaleAnim }]
              }
            ]}
            {...getAccessibilityProps({
              label: `${currentCardData.title}: ${currentCardData.text}`,
              hint: currentCardData.accessibilityHint,
              role: "text"
            })}
          >
            <View 
              style={styles.cardIconContainer}
              accessible={false}
              importantForAccessibility="no"
            >
              <Ionicons 
                name={currentCardData.icon} 
                size={40} 
                color="#2563eb" 
              />
            </View>
            <ResponsiveText style={styles.cardTitle}>
              {currentCardData.title}
            </ResponsiveText>
            <ResponsiveText 
              style={styles.cardText}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {currentCardData.text}
            </ResponsiveText>
          </Animated.View>
          
          {/* Card navigation dots with accessibility */}
          <View 
            style={styles.cardDotsContainer}
            accessible={true}
            accessibilityLabel={`Card ${currentCard + 1} of ${tutorialCards.length}`}
            accessibilityRole="adjustable"
            accessibilityValue={{
              min: 0,
              max: tutorialCards.length - 1,
              now: currentCard
            }}
          >
            {tutorialCards.map((_, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.cardDot,
                  currentCard === index && styles.cardDotActive
                ]}
                onPress={() => changeCard(index)}
                activeOpacity={0.8}
                disabled={animating}
                {...getAccessibilityProps({
                  label: `Card ${index + 1}`,
                  hint: `Navigate to card ${index + 1}`,
                  role: "button",
                  isSelected: currentCard === index,
                  isDisabled: animating
                })}
              />
            ))}
          </View>
          
          {/* Card navigation arrows with accessibility */}
          <View 
            style={[
              styles.cardArrowsContainer,
              orientation === 'landscape' && styles.cardArrowsContainerLandscape
            ]}
          >
            <TouchableOpacity 
              style={[
                styles.cardArrow,
                currentCard === 0 && styles.cardArrowDisabled
              ]}
              onPress={goToPreviousCard}
              disabled={currentCard === 0 || animating}
              activeOpacity={0.7}
              {...getAccessibilityProps({
                label: "Previous card",
                hint: "Go to the previous tutorial card",
                role: "button",
                isDisabled: currentCard === 0 || animating
              })}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={currentCard === 0 ? "#555555" : "#FFFFFF"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.cardArrow,
                currentCard === tutorialCards.length - 1 
                  ? styles.cardArrowNext 
                  : styles.cardArrowForward
              ]}
              onPress={goToNextCard}
              disabled={animating}
              activeOpacity={0.7}
              {...getAccessibilityProps({
                label: currentCard === tutorialCards.length - 1 ? "Launch System" : "Next card",
                hint: currentCard === tutorialCards.length - 1 
                  ? "Complete the tutorial and launch the app" 
                  : "Go to the next tutorial card",
                role: "button",
                isDisabled: animating
              })}
            >
              <Ionicons 
                name={currentCard === tutorialCards.length - 1 ? "rocket-outline" : "chevron-forward"} 
                size={24} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
          
          {/* Touch indicator (for first card) */}
          {currentCard === 0 && (
            <Animated.View 
              style={[
                styles.touchIndicatorContainer,
                {
                  opacity: touchPromptAnim.interpolate({
                    inputRange: [0, 3],
                    outputRange: [0.8, 1]
                  }),
                  transform: [{ translateY: touchPromptAnim }]
                }
              ]}
              accessible={false}
              importantForAccessibility="no"
            >
              <ResponsiveText style={styles.touchIndicatorText}>
                Swipe to navigate
              </ResponsiveText>
              <Ionicons name="swap-horizontal" size={20} color="#60A5FA" />
            </Animated.View>
          )}
        </View>
        
        {/* Launch button with animation */}
        <Animated.View 
          style={[
            styles.buttonContainer,
            { opacity: buttonFadeAnim },
            orientation === 'landscape' && styles.buttonContainerLandscape
          ]}
        >
          <TouchableOpacity 
            style={[
              styles.continueButton,
              isNavigating && styles.disabledButton
            ]}
            onPress={handleComplete}
            disabled={isNavigating}
            activeOpacity={0.8}
            {...getAccessibilityProps({
              label: isNavigating ? "Loading..." : "Launch System",
              hint: "Complete the tutorial and launch the main app",
              role: "button",
              isDisabled: isNavigating,
              isBusy: isNavigating
            })}
          >
            <ResponsiveText style={styles.continueButtonText}>
              {isNavigating ? 'Loading...' : 'Launch System'}
            </ResponsiveText>
            <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeAreaLandscape: {
    flexDirection: 'row',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  containerLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerLandscape: {
    width: '100%',
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  
  // Card-based tutorial
  tutorialCardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tutorialCardContainerLandscape: {
    width: '60%',
    paddingTop: 20,
  },
  tutorialCard: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  tutorialCardLandscape: {
    maxWidth: 450,
  },
  cardIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 14,
    color: '#BBBBBB',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardDotsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 16,
  },
  cardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#555555',
    marginHorizontal: 4,
  },
  cardDotActive: {
    backgroundColor: '#2563eb',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardArrowsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  cardArrowsContainerLandscape: {
    width: '80%',
    maxWidth: 400,
  },
  cardArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardArrowDisabled: {
    opacity: 0.5,
  },
  cardArrowForward: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  cardArrowNext: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  touchIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 8,
  },
  touchIndicatorText: {
    fontSize: 13,
    color: '#60A5FA',
    marginRight: 8,
  },
  
  // Button container
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  buttonContainerLandscape: {
    width: '40%',
    paddingBottom: 20,
    justifyContent: 'center',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default TutorialScreen;