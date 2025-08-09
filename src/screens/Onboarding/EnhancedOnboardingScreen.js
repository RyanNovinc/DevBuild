// src/screens/Onboarding/EnhancedOnboardingScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  BackHandler,
  Animated,
  Dimensions,
  SafeAreaView,
  Alert,
  Easing,
  InteractionManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import OnboardingService from '../../services/OnboardingService';
// Import I18nProvider
import { I18nProvider } from './context/I18nContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import the new atomic onboarding completion system
import { useOnboardingCompletion, ONBOARDING_STATES } from '../../hooks/useOnboardingCompletion';

// Import our screens
import CountrySelectionPage from './screens/CountrySelectionPage';
import DomainSelectionPage from './screens/DomainSelectionPage';
import GoalSelectionPage from './screens/GoalSelectionPage';
import ProjectsBreakdownPage from './screens/ProjectsBreakdownPage';
import CompletionPage from './screens/CompletionPage';
import ResponsiveText from './components/ResponsiveText';

// Import country data loader
import { getCountryData } from './data/countryDataLoader';
import { safeAnimatedCall, createSafeAnimatedValue } from '../../hooks/useSafeAnimation';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * EnhancedOnboardingScreen - New streamlined onboarding experience 
 * with a simplified data creation approach
 */
const EnhancedOnboardingScreen = ({ navigation, route }) => {
  // Get app context for notifications and data refresh
  const { 
    updateAppSetting, 
    refreshData,
    showSuccess,
    showError
  } = useAppContext();

  // Use the new atomic onboarding completion system
  const {
    state: onboardingState,
    error: onboardingError,
    progress: onboardingProgress,
    completeOnboarding: executeOnboardingCompletion,
    isProcessing: isOnboardingProcessing,
    isCompleted: isOnboardingCompleted,
    hasError: hasOnboardingError,
    cleanup: cleanupOnboarding
  } = useOnboardingCompletion({
    updateAppSetting,
    refreshData
  });
  
  // Screen state - Start at country selection (skip welcome)
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showCreatingGoal, setShowCreatingGoal] = useState(false);
  
  // User selections
  const [selectedCountry, setSelectedCountry] = useState(null); // No default - starts at 0%
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [previewDomain, setPreviewDomain] = useState(null);
  
  // Domain wheel state - persists when navigating back
  const [segmentsRevealed, setSegmentsRevealed] = useState(false);
  
  // Simple progress bar state - explicit control
  const [progressPercentage, setProgressPercentage] = useState(0); // Always starts at 0
  
  // Animation values with safe creation
  const fadeAnim = useRef(createSafeAnimatedValue(1)).current;
  const slideAnim = useRef(createSafeAnimatedValue(0)).current;
  const progressAnim = useRef(createSafeAnimatedValue(0)).current; // Animation for progress bar - starts at 0%
  const progressTextOpacity = useRef(createSafeAnimatedValue(0)).current; // Animation for progress text
  const progressTextScale = useRef(createSafeAnimatedValue(0.8)).current; // Scale animation for progress text
  const spinAnim = useRef(createSafeAnimatedValue(0)).current; // Spinning animation for loading
  
  // Built-in domain reference for color consistency - matches Profile Screen order
  const STANDARD_DOMAINS = [
    { name: "Career & Work", icon: "briefcase", color: "#4f46e5" },
    { name: "Health & Wellness", icon: "fitness", color: "#06b6d4" },
    { name: "Relationships", icon: "people", color: "#ec4899" },
    { name: "Personal Growth", icon: "school", color: "#8b5cf6" },
    { name: "Financial Security", icon: "cash", color: "#10b981" },
    { name: "Recreation & Leisure", icon: "bicycle", color: "#f59e0b" },
    { name: "Purpose & Meaning", icon: "compass", color: "#ef4444" },
    { name: "Community & Environment", icon: "home", color: "#6366f1" },
    { name: "Other", icon: "star", color: "#14b8a6" }
  ];

  // Function to standardize domain order regardless of country data
  const standardizeDomainOrder = (countryDomains) => {
    const orderedDomains = [];
    
    // First, add domains in our standard order if they exist in country data
    STANDARD_DOMAINS.forEach(standardDomain => {
      const matchingDomain = countryDomains.find(d => d.name === standardDomain.name);
      if (matchingDomain) {
        orderedDomains.push(matchingDomain);
      }
    });
    
    // Then add any remaining domains from country data that aren't in our standard list
    countryDomains.forEach(countryDomain => {
      if (!orderedDomains.find(d => d.name === countryDomain.name)) {
        orderedDomains.push(countryDomain);
      }
    });
    
    return orderedDomains;
  };
  
  // Function to get domain definitions based on selected country
  const getDomainDefinitions = () => {
    const countryDomains = getCountryData(selectedCountry || 'australia');
    return standardizeDomainOrder(countryDomains);
  };

  // Update domains when country changes
  useEffect(() => {
    console.log("Country updated to:", selectedCountry);
    
    // Refresh domain and goal with new country data if they exist
    if (selectedDomain) {
      const domains = getDomainDefinitions();
      console.log("Looking for domain match in new country data...");
      
      // Find the equivalent domain in the new country data (domains should have same names)
      const refreshedDomain = domains.find(d => d.name === selectedDomain.name);
      
      if (refreshedDomain) {
        console.log("Found matching domain in new country data:", refreshedDomain.name);
        setSelectedDomain(refreshedDomain);
        
        // Also refresh the goal if it exists
        if (selectedGoal && refreshedDomain.goals) {
          const refreshedGoal = refreshedDomain.goals.find(g => g.name === selectedGoal.name);
          
          if (refreshedGoal) {
            console.log("Found matching goal in new country data:", refreshedGoal.name);
            setSelectedGoal(refreshedGoal);
          } else {
            console.log("Could not find matching goal, clearing selection");
            setSelectedGoal(null);
          }
        }
      } else {
        console.log("Could not find matching domain, clearing selections");
        setSelectedDomain(null);
        setSelectedGoal(null);
      }
    }
  }, [selectedCountry]);
  
  // Removed AsyncStorage country loading - onboarding always starts fresh at 0%
  
  // Handle back button - IMPROVED VERSION
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentScreen === 0) {
        return false; // Let system handle back on first screen
      }
      
      // Go back to previous screen
      goToPreviousScreen();
      return true;
    });
    
    return () => backHandler.remove();
  }, [currentScreen]);

  // Cleanup onboarding progress animation on unmount
  useEffect(() => {
    return () => {
      cleanupOnboarding();
    };
  }, [cleanupOnboarding]);
  
  // Simple function to update progress bar
  const updateProgress = (percentage) => {
    setProgressPercentage(percentage);
    
    // Animate the progress bar
    Animated.timing(progressAnim, {
      toValue: percentage / 100,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false
    }).start();
  };

  // Animation between screens
  useEffect(() => {
    // Animate screen transition with error handling
    try {
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
    } catch (error) {
      console.warn('Screen transition animation failed:', error.message);
    }
    
    // Reset slide position for next animation
    safeAnimatedCall(slideAnim, 'setValue', 20);
    
    // Handle screen-specific progress updates
    if (currentScreen === 2) {
      // Goals screen - show 66%
      updateProgress(66);
    }
    // Projects screen stays at 66% until confetti starts - then goes to 100%
    // Domain screen (currentScreen === 1) stays at 33% - no update needed
    
    // Always show the percentage text
    safeAnimatedCall(progressTextOpacity, 'setValue', 0);
    safeAnimatedCall(progressTextScale, 'setValue', 0.8);
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(progressTextOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.spring(progressTextScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        })
      ])
    ]).start();
  }, [currentScreen]);

  // Removed complex selectedCountry logic - now using explicit updateProgress calls
  
  // Go to next screen
  const goToNextScreen = () => {
    if (currentScreen === 3) {
      // Show creating goal loading state when transitioning from ProjectsBreakdown to Completion
      setShowCreatingGoal(true);
      
      // Start spinning animation
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      
      // Simulate brief loading time
      setTimeout(() => {
        spinAnim.stopAnimation();
        spinAnim.setValue(0);
        setShowCreatingGoal(false);
        setCurrentScreen(4);
      }, 2000); // 2 second loading
    } else if (currentScreen < 4) {
      setCurrentScreen(prevScreen => prevScreen + 1);
    } else {
      completeOnboarding();
    }
  };
  
  // Go to previous screen - IMPROVED VERSION
  const goToPreviousScreen = () => {
    // Check if we should allow going back
    if (currentScreen > 0) {
      // Reset any screen-specific states to ensure clean navigation
      // This helps prevent issues with incomplete typing animations
      setIsNavigating(true);
      
      // Update progress bar based on where we're going back to
      const targetScreen = currentScreen - 1;
      if (targetScreen === 0) {
        // Going back to country selection - always reset to 0% and clear country selection
        setSelectedCountry(null);
        setSegmentsRevealed(false); // Reset domain wheel when changing country
        updateProgress(0);
      } else if (targetScreen === 1) {
        // Going back to domain selection - 33%
        updateProgress(33);
      } else if (targetScreen === 2) {
        // Going back to goals selection - 66%
        updateProgress(66);
      }
      
      // Short timeout to allow any pending state updates to complete
      setTimeout(() => {
        setCurrentScreen(prevScreen => prevScreen - 1);
        setIsNavigating(false);
      }, 50);
    }
  };
  
  // Helper function to get standardized domain information
  const getStandardDomain = (domainName) => {
    if (!domainName) return null;
    
    // Find domain by name (case insensitive)
    return STANDARD_DOMAINS.find(d => 
      d.name.toLowerCase() === domainName.toLowerCase()
    );
  };
  
  // NEW: Complete onboarding using atomic transaction system
  const completeOnboarding = async () => {
    // Prevent multiple simultaneous calls
    if (isOnboardingProcessing || isNavigating) {
      console.log("Onboarding completion already in progress, ignoring duplicate call");
      return;
    }
    
    console.log("🚀 Starting atomic onboarding completion...");
    setIsNavigating(true);
    
    try {
      if (!selectedDomain || !selectedGoal) {
        throw new Error("Missing domain or goal selection");
      }
      
      // Standardize domain properties
      const standardDomain = getStandardDomain(selectedDomain.name);
      
      const finalDomain = {
        ...selectedDomain,
        ...(standardDomain && {
          name: standardDomain.name,
          color: standardDomain.color,
          icon: standardDomain.icon
        })
      };
      
      // Use the atomic completion system
      const result = await executeOnboardingCompletion(finalDomain, selectedGoal, selectedCountry);
      
      console.log("✅ Atomic onboarding completion successful:", result);
      
      // Show success message
      if (typeof showSuccess === 'function') {
        showSuccess('Your goal has been created successfully!');
      }
      
      // The App component will handle navigation based on the onboardingCompleted state
      console.log("🏠 Onboarding complete - App will handle navigation automatically");
      
    } catch (error) {
      console.error('❌ Atomic onboarding completion failed:', error);
      
      if (typeof showError === 'function') {
        showError(error.message || 'There was an error creating your goal. Please try again.');
      }
    } finally {
      setIsNavigating(false);
    }
  };
  
  // Handle language selection - now just updating the state
  // The actual language change is managed by LanguageSelectionPage component
  const handleLanguageSelected = (language) => {
    console.log("Language selected in parent:", language);
    // Note: Language selection is handled by the I18nContext, no local state needed
  };
  
  // Handle domain selection
  const handleDomainSelected = (domain) => {
    setSelectedDomain(domain);
    goToNextScreen();
  };
  
  // Handle domain preview (temporary selection that updates UI)
  const handleDomainPreview = (domain) => {
    setPreviewDomain(domain);
  };
  
  // Reset domain preview
  const resetDomainPreview = () => {
    setPreviewDomain(null);
  };
  
  // Handle goal selection
  const handleGoalSelected = (goal) => {
    setSelectedGoal(goal);
    goToNextScreen();
  };
  
  // Handle skipping onboarding completely using atomic system
  const handleSkipOnboarding = async () => {
    try {
      console.log('🚀 Starting atomic skip onboarding');
      setIsNavigating(true);
      
      // Set default values for a quick start
      const defaultDomain = getDomainDefinitions()[3]; // Personal Growth
      const defaultGoal = defaultDomain.goals[0]; // Learning New Skills
      
      // Create a standardized domain
      const standardDomain = getStandardDomain(defaultDomain.name) || {
        name: "Personal Growth",
        icon: "school",
        color: "#8b5cf6"
      };
      
      const finalDomain = {
        ...defaultDomain,
        name: standardDomain.name,
        color: standardDomain.color,
        icon: standardDomain.icon
      };
      
      // Use the atomic completion system for skip onboarding
      const result = await executeOnboardingCompletion(finalDomain, defaultGoal, selectedCountry);
      
      console.log("✅ Atomic skip onboarding successful:", result);
      
      // Show success
      if (typeof showSuccess === 'function') {
        showSuccess('Welcome to LifeCompass! We\'ve set up a default goal to get you started.');
      }
      
      console.log("✅ Skip onboarding complete - App will handle navigation automatically");
    } catch (error) {
      console.error('❌ Atomic skip onboarding failed:', error);
      
      if (typeof showError === 'function') {
        showError(error.message || 'There was an error skipping onboarding. Please try again.');
      }
    } finally {
      setIsNavigating(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Wrap the content in I18nProvider */}
      <I18nProvider>
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
            {/* Country Selection Page */}
            {currentScreen === 0 && (
              <CountrySelectionPage
                onCountrySelected={(country) => {
                  // Update progress immediately when country is selected
                  setSelectedCountry(country);
                  updateProgress(33); // 33% when country selected
                }}
                onContinue={(country) => {
                  // The country is passed back from the component
                  // We just need to synchronize our state and go to the next screen
                  if (country) {
                    setSelectedCountry(country);
                  }
                  // Navigate to next screen
                  goToNextScreen();
                }}
                onBack={goToPreviousScreen}
                onSkipOnboarding={handleSkipOnboarding}
                isNavigating={isNavigating}
              />
            )}
            
            {/* Domain Selection Page */}
            {currentScreen === 1 && (
              <DomainSelectionPage
                domains={getDomainDefinitions()}
                onDomainSelected={handleDomainSelected}
                onDomainPreview={handleDomainPreview}
                onResetPreview={resetDomainPreview}
                onBack={goToPreviousScreen}
                isNavigating={isNavigating}
                segmentsRevealed={segmentsRevealed}
                onSegmentsRevealed={setSegmentsRevealed}
              />
            )}
            
            {/* Goal Selection Page */}
            {currentScreen === 2 && selectedDomain && (
              <GoalSelectionPage
                domain={selectedDomain}
                onGoalSelected={handleGoalSelected}
                onBack={goToPreviousScreen}
                isNavigating={isNavigating}
              />
            )}
            
            {/* Projects Breakdown Page */}
            {currentScreen === 3 && selectedDomain && selectedGoal && !showCreatingGoal && (
              <ProjectsBreakdownPage
                domain={selectedDomain}
                goal={selectedGoal}
                onContinue={goToNextScreen}
                onBack={goToPreviousScreen}
                onConfettiStart={() => updateProgress(100)} // Update to 100% when confetti starts
                isNavigating={isNavigating}
              />
            )}
            
            {/* Creating Goal Loading State */}
            {showCreatingGoal && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingContent}>
                  <Animated.View 
                    style={[
                      styles.loadingSpinner,
                      {
                        transform: [
                          {
                            rotate: spinAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Ionicons name="sync" size={40} color="#3b82f6" />
                  </Animated.View>
                  <ResponsiveText style={styles.loadingTitle}>
                    Creating goal breakdown in app...
                  </ResponsiveText>
                  <ResponsiveText style={styles.loadingSubtitle}>
                    Setting up your personalized system
                  </ResponsiveText>
                </View>
              </View>
            )}
            
            {/* Completion Page */}
            {currentScreen === 4 && (
              <CompletionPage
                domain={selectedDomain}
                goal={selectedGoal}
                country={selectedCountry}
                onComplete={completeOnboarding}
                onBack={goToPreviousScreen}
                isNavigating={isNavigating}
              />
            )}
          </Animated.View>
          
          {/* Progress Percentage Bar - Hidden on completion screen */}
          {currentScreen < 4 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View 
                  style={[
                    styles.progressBarFill,
                    { 
                      width: safeAnimatedCall(progressAnim, 'interpolate', {
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      }),
                      backgroundColor: (previewDomain || selectedDomain)?.color || '#3b82f6'
                    }
                  ]}
                />
              </View>
              <Animated.View 
                style={[
                  styles.progressTextContainer,
                  { 
                    opacity: progressTextOpacity,
                    transform: [{ scale: progressTextScale }]
                  }
                ]}
              >
                <Animated.Text style={styles.progressText}>
                  {progressPercentage}%
                </Animated.Text>
              </Animated.View>
            </View>
          )}
        </KeyboardAvoidingView>
      </I18nProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1425',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 2, // Positioned very close to the bottom
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 5,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressTextContainer: {
    marginLeft: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0c1425',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default EnhancedOnboardingScreen;