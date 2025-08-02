// src/components/LoadingScreen.js - OPTIMIZED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  scaleWidth,
  scaleHeight,
  fontSizes,
  spacing,
  useScreenDimensions,
  isTablet,
  accessibility
} from '../utils/responsive';

/**
 * A loading screen component that matches the WelcomeScreen style
 * with tap-to-continue functionality
 */
const LoadingScreen = ({ 
  message = '',
  children,
  navigation,
  destination,
  fromOnboarding = false,
  route
}) => {
  // State
  const [loadingFinished, setLoadingFinished] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [directFromOnboarding, setDirectFromOnboarding] = useState(false);
  
  // Theme and dimensions
  const { theme } = useTheme();
  const { width, height } = useScreenDimensions();
  const insets = useSafeAreaInsets();
  
  // Extract params from route if available
  const routeParams = route?.params || {};
  const routeMessage = routeParams.message;
  const routeDestination = routeParams.destination;
  const isFromOnboarding = routeParams.fromOnboarding || fromOnboarding;
  
  // Use route params if provided
  const displayMessage = routeMessage || message;
  const targetDestination = routeDestination || destination || 'Main';
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const fadeContentAnim = useRef(new Animated.Value(1)).current;
  const fadeToBlack = useRef(new Animated.Value(0)).current;
  const touchPromptY = useRef(new Animated.Value(0)).current;
  const touchPromptOpacity = useRef(new Animated.Value(0)).current;
  
  // Animation references
  const promptAnimation = useRef(null);
  
  // Create rotation interpolation for compass
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Scale animation for compass pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Check if coming directly from onboarding on mount
  useEffect(() => {
    const checkDirectFromOnboarding = async () => {
      try {
        const isDirectFromOnboarding = await AsyncStorage.getItem('directFromOnboarding');
        console.log('Direct from onboarding:', isDirectFromOnboarding);
        
        if (isDirectFromOnboarding === 'true') {
          // Set the state to skip loading screen
          setDirectFromOnboarding(true);
          // Clear the flag so we don't skip loading next time
          await AsyncStorage.setItem('directFromOnboarding', 'false');
          
          // If we're coming directly from onboarding, skip the loading screen
          setLoadingFinished(true);
        }
      } catch (error) {
        console.error('Error checking direct from onboarding:', error);
      }
    };
    
    checkDirectFromOnboarding();
  }, []);
  
  // Animation for the "Touch to continue" prompt
  const animatePrompt = () => {
    touchPromptY.setValue(0);
    
    const downAnimation = Animated.timing(touchPromptY, {
      toValue: 3, // Subtle movement - only 3px
      duration: 1200,
      useNativeDriver: true,
    });
    
    const upAnimation = Animated.timing(touchPromptY, {
      toValue: 0,
      duration: 1200,
      useNativeDriver: true,
    });
    
    promptAnimation.current = Animated.sequence([downAnimation, upAnimation]);
    
    promptAnimation.current.start(({ finished }) => {
      if (finished) {
        animatePrompt();
      }
    });
  };
  
  // Handle screen tap to continue
  const handleScreenTap = () => {
    if (showPrompt) {
      // Stop animations
      if (promptAnimation.current) {
        promptAnimation.current.stop();
      }
      rotateAnim.stopAnimation();
      pulseAnim.stopAnimation();
      
      // Fade sequence
      Animated.parallel([
        // 1. Fade out the loading content
        Animated.timing(fadeContentAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        // 2. Fade in the black overlay
        Animated.timing(fadeToBlack, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      ]).start(({ finished }) => {
        if (finished) {
          // After fading to black, mark loading as complete
          AsyncStorage.setItem('loadingFadedToBlack', 'true')
            .then(() => {
              // If we have navigation and a destination, navigate there
              if (navigation && targetDestination) {
                console.log(`Navigating to ${targetDestination} after loading`);
                navigation.replace(targetDestination);
              } else {
                // Otherwise just set loading as finished to show children
                setLoadingFinished(true);
              }
            })
            .catch(err => {
              console.error('Failed to save loading state:', err);
              
              // Even if saving fails, still proceed with navigation or completion
              if (navigation && targetDestination) {
                navigation.replace(targetDestination);
              } else {
                setLoadingFinished(true);
              }
            });
        }
      });
    }
  };
  
  // Effect to handle animations
  useEffect(() => {
    // If coming directly from onboarding, skip all animations
    if (directFromOnboarding) {
      console.log('Skipping loading animations - coming from onboarding');
      return;
    }
    
    console.log('LoadingScreen initiated with:', {
      message: displayMessage,
      destination: targetDestination,
      fromOnboarding: isFromOnboarding
    });
    
    // Store loadingFadedToBlack flag for ProfileFadeWrapper
    if (isFromOnboarding) {
      AsyncStorage.setItem('loadingFadedToBlack', 'true')
        .catch(err => console.error('Failed to set loading flag:', err));
    }
    
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
    ]).start();
    
    // Start rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
    
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      ])
    ).start();
    
    // Show "Touch to continue" prompt after a delay
    setTimeout(() => {
      setShowPrompt(true);
      
      // Touch prompt fade in
      Animated.timing(touchPromptOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // Start subtle floating animation after fade in
        animatePrompt();
      });
    }, 3000);
    
    // Clean up animations on unmount
    return () => {
      if (promptAnimation.current) {
        promptAnimation.current.stop();
      }
    };
  }, [directFromOnboarding]);
  
  // If loading is finished or we're coming directly from onboarding, show the main content
  if (loadingFinished || directFromOnboarding) {
    return children;
  }
  
  // Calculate responsive logo size based on screen dimensions
  const logoSize = isTablet ? 
    scaleWidth(200) : // Larger for tablets
    Math.min(scaleWidth(160), width * 0.4); // Responsive for phones
  
  // Show the loading screen
  return (
    <SafeAreaView 
      style={styles.safeArea}
      edges={['top']} // Only apply safe area to top (notch)
    >
      <TouchableOpacity 
        style={styles.container}
        activeOpacity={0.9}
        onPress={handleScreenTap}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Continue to app"
        accessibilityHint={showPrompt ? "Double tap to proceed" : "Please wait"}
      >
        <View style={styles.hiddenContent}>
          {children}
        </View>
        
        <Animated.View 
          style={[
            styles.overlay, 
            { opacity: fadeContentAnim }
          ]}
        >
          <Animated.View 
            style={[
              styles.content, 
              { 
                opacity: fadeAnim,
                paddingHorizontal: spacing.l,
                paddingTop: scaleHeight(40) + insets.top,
                paddingBottom: scaleHeight(80) + insets.bottom,
              }
            ]}
          >
            {/* Logo section */}
            <View style={[styles.logoSection, { marginBottom: scaleHeight(30) }]}>
              <Animated.View 
                style={[
                  styles.logoContainer,
                  { 
                    opacity: logoOpacity,
                    transform: [{ scale: logoScale }] 
                  }
                ]}
              >
                <Animated.View 
                  style={[
                    styles.logoCircle,
                    {
                      backgroundColor: theme?.primary ? '#1e3a8a' : '#1e3a8a',
                      borderColor: theme?.primary || '#3b82f6',
                      shadowColor: theme?.primary || '#3b82f6',
                      width: logoSize,
                      height: logoSize,
                      borderRadius: logoSize / 2,
                      transform: [
                        { scale: pulseAnim },
                        { rotate }
                      ]
                    }
                  ]}
                >
                  <Ionicons 
                    name="compass" 
                    size={logoSize * 0.5} // Scale icon to 50% of container 
                    color="#FFFFFF" 
                  />
                </Animated.View>
              </Animated.View>
            </View>
            
            {/* Text section */}
            <View style={[styles.textSection, { marginBottom: scaleHeight(40) }]}>
              <Animated.Text 
                style={[
                  styles.appTitle,
                  { 
                    opacity: titleOpacity,
                    fontSize: isTablet ? fontSizes.xxxl * 1.2 : fontSizes.xxxl,
                    marginBottom: spacing.m,
                  }
                ]}
                maxFontSizeMultiplier={1.2}
              >
                LifeCompass
              </Animated.Text>
              
              <Animated.Text 
                style={[
                  styles.subtitle,
                  { 
                    opacity: subtitleOpacity,
                    fontSize: isTablet ? fontSizes.l : fontSizes.m,
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Build systems that actually work
              </Animated.Text>
            </View>
            
            {/* Display message if provided */}
            {displayMessage ? (
              <Text 
                style={[
                  styles.loadingMessage,
                  {
                    fontSize: fontSizes.m,
                    marginBottom: spacing.l
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                {displayMessage}
              </Text>
            ) : null}
            
            {/* Touch to continue prompt */}
            {showPrompt && (
              <Animated.View 
                style={[
                  styles.touchPromptContainer,
                  { 
                    opacity: touchPromptOpacity,
                    transform: [{ translateY: touchPromptY }],
                    bottom: scaleHeight(40) + insets.bottom
                  }
                ]}
                accessibilityElementsHidden={true}
                importantForAccessibility="no"
              >
                <Text 
                  style={[
                    styles.touchPromptText,
                    {
                      fontSize: fontSizes.m,
                      marginBottom: spacing.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Touch anywhere to continue
                </Text>
                <Ionicons name="chevron-down" size={scaleWidth(20)} color="#FFFFFF" />
              </Animated.View>
            )}
          </Animated.View>
        </Animated.View>
        
        {/* Black overlay that fades in as content fades out */}
        <Animated.View 
          style={[
            styles.blackOverlay,
            { opacity: fadeToBlack }
          ]}
          pointerEvents="none"
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0c1425', // Same blue background as WelcomeScreen
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenContent: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 20,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  textSection: {
    alignItems: 'center',
  },
  appTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.9,
  },
  loadingMessage: {
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  touchPromptContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  touchPromptText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  }
});

export default LoadingScreen;