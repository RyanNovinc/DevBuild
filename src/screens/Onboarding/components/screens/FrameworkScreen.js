// src/screens/Onboarding/components/screens/FrameworkScreen.js
// Enhanced with accessibility, responsive text, and performance optimizations
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  TouchableOpacity,
  Animated,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { scale } from '../../styles/onboardingStyles';
import ProgressIndicator from '../ui/ProgressIndicator';

// Import AIMessage directly - ensure this path matches your project structure
import AIMessage from '../ui/AIMessage';

import ResponsiveText from '../ResponsiveText';
import { getAccessibilityProps } from '../../utils/accessibility';
import { isLowEndDevice, useOrientation } from '../../utils/deviceUtils';
import { ensureContrast } from '../../utils/contrastUtils';

// Debug constants
const DEBUG_TAG = "[Onboarding] FrameworkScreen";
const DEBUG_ENABLED = true;

/**
 * Enhanced FrameworkScreen - Professional explanation of the strategic framework
 * with improved accessibility, responsive text, and performance optimizations
 * 
 * @param {number} currentScreen - Current screen index
 * @param {function} onBack - Function to go back to previous screen
 * @param {function} onContinue - Function to advance to next screen
 * @param {string} typingText - Current AI typing text
 * @param {string} fullText - Complete AI text
 */
const FrameworkScreen = ({ 
  currentScreen,
  onBack,
  onContinue,
  typingText,
  fullText
}) => {
  // Debug - track renders
  const renderCount = useRef(0);
  renderCount.current++;
  
  if (DEBUG_ENABLED) {
    console.log(`${DEBUG_TAG} - RENDER #${renderCount.current} START`);
  }
  
  // Get orientation for responsive layout
  const { orientation } = useOrientation();
  
  // Detect if device is low-end for performance optimizations
  const isLowEnd = isLowEndDevice();
  
  // States
  const [showAIMessage, setShowAIMessage] = useState(false);
  const [aiMessageComplete, setAiMessageComplete] = useState(false);
  const [currentGradient, setCurrentGradient] = useState(0); // Track which gradient to show
  
  // Use ref to track if typing complete was called to prevent multiple calls
  const typingCompleteCalledRef = useRef(false);
  
  // AIMessage ref
  const aiMessageRef = useRef(null);
  
  // Fixed AI message for better control
  const aiMessage = "LifeCompass uses business methodologies to create a structured system that aligns your daily tasks with your bigger goals.";
  
  // Explicitly define gradient colors to avoid interpolation issues
  const initialGradient = ['#000000', '#0a1222'];
  const finalGradient = ['#0c1425', '#000000'];
  
  // Animation values
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const frameworkItems = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  
  // Skip AI message typing if not yet complete - use useCallback to prevent recreation
  const skipAIMessageTyping = useCallback(() => {
    if (DEBUG_ENABLED) {
      console.log(`${DEBUG_TAG} - skipAIMessageTyping called`, { 
        aiMessageComplete, 
        typingCompleteCalled: typingCompleteCalledRef.current,
        hasRef: !!aiMessageRef.current 
      });
    }
    
    if (!typingCompleteCalledRef.current && aiMessageRef.current && aiMessageRef.current.completeTypingImmediately) {
      if (DEBUG_ENABLED) {
        console.log(`${DEBUG_TAG} - Calling completeTypingImmediately`);
      }
      aiMessageRef.current.completeTypingImmediately();
    }
  }, []);
  
  // Handle AI message completion callback - use useCallback to prevent recreation
  const handleTypingComplete = useCallback(() => {
    if (DEBUG_ENABLED) {
      console.log(`${DEBUG_TAG} - handleTypingComplete called`, { 
        aiMessageComplete, 
        typingCompleteCalled: typingCompleteCalledRef.current 
      });
    }
    
    if (!typingCompleteCalledRef.current) {
      if (DEBUG_ENABLED) {
        console.log(`${DEBUG_TAG} - Setting aiMessageComplete to true`);
      }
      
      // Mark as called to prevent future calls
      typingCompleteCalledRef.current = true;
      
      // Update state
      setAiMessageComplete(true);
    }
  }, []);
  
  // Effect for saving the ref callback
  const setAIMessageRef = useCallback((ref) => {
    if (DEBUG_ENABLED) {
      console.log(`${DEBUG_TAG} - setAIMessageRef called`, { hasRef: !!ref });
    }
    aiMessageRef.current = ref;
  }, []);
  
  // Handle back button press with haptic feedback
  const handleBackPress = useCallback(() => {
    if (DEBUG_ENABLED) {
      console.log(`${DEBUG_TAG} - handleBackPress called`);
    }
    
    if (Platform.OS === 'ios') {
      // Lightweight haptic feedback on iOS
      // On a real implementation, you would import and use the Haptics API
    }
    onBack();
  }, [onBack]);
  
  // Handle continue button press with haptic feedback
  const handleContinuePress = useCallback(() => {
    if (DEBUG_ENABLED) {
      console.log(`${DEBUG_TAG} - handleContinuePress called`);
    }
    
    if (Platform.OS === 'ios') {
      // Lightweight haptic feedback on iOS
      // On a real implementation, you would import and use the Haptics API
    }
    onContinue();
  }, [onContinue]);
  
  // Background gradient animation
  useEffect(() => {
    if (DEBUG_ENABLED) {
      console.log(`${DEBUG_TAG} - Background gradient animation effect`);
    }
    
    // Optimize animations for low-end devices
    if (isLowEnd) {
      // Simple fade for low-end devices
      setCurrentGradient(1); // Just set final gradient immediately
    } else {
      // Full animation for modern devices
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start(() => {
        // After animation completes, switch to final gradient
        setCurrentGradient(1);
      });
    }
  }, [isLowEnd, backgroundAnim]);
  
  // Animate entrance on mount - optimized for performance
  useEffect(() => {
    if (DEBUG_ENABLED) {
      console.log(`${DEBUG_TAG} - Initial animations effect`);
    }
    
    if (isLowEnd) {
      // Simplified animations for low-end devices
      titleOpacity.setValue(1);
      
      // Show AI message immediately
      setShowAIMessage(true);
    } else {
      // Full animation sequence for modern devices
      // Title fade in
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        // Show AI message with a short delay
        setTimeout(() => {
          if (DEBUG_ENABLED) {
            console.log(`${DEBUG_TAG} - Setting showAIMessage to true`);
          }
          setShowAIMessage(true);
        }, 300);
      });
    }
  }, [isLowEnd, titleOpacity]);
  
  // Handle AI message completion
  useEffect(() => {
    if (aiMessageComplete && !isLowEnd) {
      if (DEBUG_ENABLED) {
        console.log(`${DEBUG_TAG} - aiMessageComplete effect - animating content`);
      }
      
      // Animate in the content
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Framework items staggered animation
        Animated.stagger(250, [
          Animated.spring(frameworkItems[0], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(frameworkItems[1], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(frameworkItems[2], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(frameworkItems[3], {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Button fade in
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        });
      });
    } else if (aiMessageComplete && isLowEnd) {
      // Simpler animations for low-end devices
      if (DEBUG_ENABLED) {
        console.log(`${DEBUG_TAG} - aiMessageComplete effect - simplified animations for low-end device`);
      }
      
      contentOpacity.setValue(1);
      
      // Set all framework items to visible immediately
      frameworkItems.forEach(item => item.setValue(1));
      
      // Show button
      buttonOpacity.setValue(1);
    }
  }, [aiMessageComplete, isLowEnd, contentOpacity, frameworkItems, buttonOpacity]);
  
  // Framework items data with enhanced visuals
  const frameworkData = [
    {
      title: "Strategic Direction",
      description: "Your personal mission that guides all goals and decisions",
      icon: "navigate",
      color: "#2563eb",
      lightColor: "rgba(37, 99, 235, 0.15)"
    },
    {
      title: "Goals",
      description: "Major achievements that support your direction",
      icon: "flag",
      color: "#9333ea",
      lightColor: "rgba(147, 51, 234, 0.15)"
    },
    {
      title: "Projects",
      description: "Organized initiatives to reach your goals",
      icon: "folder",
      color: "#16a34a",
      lightColor: "rgba(22, 163, 74, 0.15)"
    },
    {
      title: "Tasks",
      description: "Specific actions that move projects forward",
      icon: "list",
      color: "#db2777",
      lightColor: "rgba(219, 39, 119, 0.15)"
    }
  ];
  
  if (DEBUG_ENABLED) {
    console.log(`${DEBUG_TAG} - RENDER #${renderCount.current} COMPLETE`, {
      showAIMessage,
      aiMessageComplete,
      typingCompleteCalled: typingCompleteCalledRef.current,
      currentGradient
    });
  }
  
  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityLabel="Strategic Framework Screen"
      accessibilityRole="none"
    >
      {/* Animated background gradient - Safe implementation */}
      <Animated.View style={[styles.gradientContainer, { opacity: backgroundAnim }]}>
        <LinearGradient
          colors={currentGradient === 0 ? initialGradient : finalGradient}
          style={styles.gradientBackground}
        />
      </Animated.View>
      
      {/* Subtle background pattern */}
      <View style={styles.backgroundPattern} />
      
      {/* Main ScrollView containing everything */}
      <ScrollView 
        style={styles.mainScrollView}
        contentContainerStyle={[
          styles.mainScrollContent,
          orientation === 'landscape' && styles.mainScrollContentLandscape
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top section now inside the ScrollView */}
        <View 
          style={[
            styles.topSection,
            orientation === 'landscape' && styles.topSectionLandscape
          ]}
        >
          {/* Progress indicator */}
          <View style={styles.progressWrapper}>
            <ProgressIndicator currentScreen={currentScreen} totalScreens={5} />
          </View>
          
          {/* Page Title with animation */}
          <Animated.View 
            style={[styles.titleContainer, { opacity: titleOpacity }]}
            accessibilityRole="header"
          >
            <ResponsiveText style={styles.pageTitle}>
              Strategic Framework
            </ResponsiveText>
            <ResponsiveText style={styles.pageSubtitle}>
              How we help you achieve more
            </ResponsiveText>
          </Animated.View>
          
          {/* AI Message container with optimized height */}
          <View 
            style={styles.aiContainer}
            accessible={true}
            accessibilityLabel="AI Assistant message"
            accessibilityRole="text"
          >
            {showAIMessage && (
              <AIMessage 
                ref={setAIMessageRef}
                fullText={aiMessage}
                initialDelay={isLowEnd ? 100 : 300} // Reduced delay for low-end devices
                onTypingComplete={handleTypingComplete}
              />
            )}
          </View>
        </View>
        
        {/* Framework explanation content */}
        <Animated.View 
          style={[
            styles.frameworkContainer, 
            { opacity: contentOpacity },
            orientation === 'landscape' && styles.frameworkContainerLandscape
          ]}
        >
          <BlurView intensity={30} tint="dark" style={styles.frameworkHeaderCard}>
            <ResponsiveText style={styles.frameworkTitle}>
              Business-Proven Methodology
            </ResponsiveText>
            <ResponsiveText style={styles.frameworkDescription}>
              LifeCompass applies the same structured approach used by successful 
              organizations to align daily actions with long-term vision.
            </ResponsiveText>
          </BlurView>
          
          {/* Framework items with enhanced visuals and accessibility */}
          <View 
            style={[
              styles.frameworkItemsContainer,
              orientation === 'landscape' && styles.frameworkItemsContainerLandscape
            ]}
          >
            {frameworkData.map((item, index) => (
              <Animated.View 
                key={index}
                style={[
                  styles.frameworkItem,
                  {
                    opacity: frameworkItems[index],
                    transform: [
                      { 
                        translateY: frameworkItems[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0]
                        }) 
                      },
                      { 
                        scale: frameworkItems[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1]
                        }) 
                      }
                    ]
                  }
                ]}
                {...getAccessibilityProps({
                  label: `${item.title}: ${item.description}`,
                  role: "text"
                })}
              >
                {/* Using fixed array of colors for each item's gradient */}
                <LinearGradient
                  colors={[item.lightColor, 'rgba(20, 20, 30, 0.7)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.itemGradient}
                />
                <View 
                  style={[styles.itemIconContainer, { backgroundColor: item.color }]}
                  accessible={true}
                  accessibilityLabel={item.title}
                  accessibilityRole="image"
                >
                  <Ionicons name={item.icon} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.itemTextContainer}>
                  <ResponsiveText style={styles.itemTitle}>
                    {item.title}
                  </ResponsiveText>
                  <ResponsiveText 
                    style={styles.itemDescription}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                  >
                    {item.description}
                  </ResponsiveText>
                </View>
              </Animated.View>
            ))}
          </View>
          
          <View style={styles.benefitsContainer}>
            <ResponsiveText style={styles.benefitsTitle}>
              The LifeCompass Difference:
            </ResponsiveText>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={18} color="#2563eb" style={styles.benefitIcon} />
              <ResponsiveText 
                style={styles.benefitText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                Strategic alignment across all life areas
              </ResponsiveText>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={18} color="#2563eb" style={styles.benefitIcon} />
              <ResponsiveText 
                style={styles.benefitText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                Clear connection between daily tasks and big goals
              </ResponsiveText>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={18} color="#2563eb" style={styles.benefitIcon} />
              <ResponsiveText 
                style={styles.benefitText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                Personalized AI assistance for optimization
              </ResponsiveText>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={18} color="#2563eb" style={styles.benefitIcon} />
              <ResponsiveText 
                style={styles.benefitText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                Reduce overwhelm with structured approach
              </ResponsiveText>
            </View>
          </View>
          
          {/* Extra padding at bottom to ensure content is above buttons */}
          <View style={styles.bottomPadding} />
        </Animated.View>
      </ScrollView>
      
      {/* Action Buttons with animation - Buttons swapped */}
      <Animated.View 
        style={[
          styles.actionContainer, 
          { opacity: buttonOpacity },
          orientation === 'landscape' && styles.actionContainerLandscape
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
          {...getAccessibilityProps({
            label: "Go back",
            hint: "Return to the previous screen",
            role: "button"
          })}
        >
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          <ResponsiveText style={styles.backButtonText}>Back</ResponsiveText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleContinuePress}
          {...getAccessibilityProps({
            label: "Continue",
            hint: "Go to the next screen",
            role: "button"
          })}
        >
          <LinearGradient
            colors={['#2563eb', '#1e40af']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <ResponsiveText style={styles.primaryButtonText}>Continue</ResponsiveText>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradientContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gradientBackground: {
    flex: 1,
  },
  backgroundPattern: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: 'transparent',
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 100, // Add padding to ensure content is visible above buttons
  },
  mainScrollContentLandscape: {
    paddingBottom: 80,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topSection: {
    paddingTop: 40,
    paddingBottom: 0,
  },
  topSectionLandscape: {
    width: '100%',
    paddingTop: 20,
  },
  progressWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: scale(28, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pageSubtitle: {
    fontSize: scale(16, 0.3),
    color: '#AAAAAA',
    textAlign: 'center',
  },
  aiContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
    alignItems: 'center',
    minHeight: 80,
  },
  frameworkContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  frameworkContainerLandscape: {
    width: '100%',
  },
  frameworkHeaderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
    overflow: 'hidden',
  },
  frameworkTitle: {
    fontSize: scale(18, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  frameworkDescription: {
    fontSize: scale(14, 0.3),
    color: '#BBBBBB',
    marginBottom: 8,
    lineHeight: 22,
  },
  frameworkItemsContainer: {
    marginBottom: 30,
  },
  frameworkItemsContainerLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  frameworkItem: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  itemGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: scale(16, 0.3),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: scale(14, 0.3),
    color: '#BBBBBB',
    lineHeight: 20,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(20, 20, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  benefitsTitle: {
    fontSize: scale(16, 0.3),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  benefitIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  benefitText: {
    fontSize: scale(14, 0.3),
    color: '#DDDDDD',
    flex: 1,
  },
  bottomPadding: {
    height: 40, // Extra space at bottom
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  actionContainerLandscape: {
    paddingHorizontal: 40,
  },
  primaryButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: scale(16, 0.2),
    fontWeight: '600',
    marginRight: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: scale(14, 0.3),
  },
});

export default FrameworkScreen;