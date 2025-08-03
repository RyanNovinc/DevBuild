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
import { useAppContext } from '../../context/AppContext';
import OnboardingService from '../../services/OnboardingService';
// Import I18nProvider
import { I18nProvider } from './context/I18nContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import the new atomic onboarding completion system
import { useOnboardingCompletion, ONBOARDING_STATES } from '../../hooks/useOnboardingCompletion';

// Import our screens
import WelcomePage from './screens/WelcomePage';
import CountrySelectionPage from './screens/CountrySelectionPage';
import DomainSelectionPage from './screens/DomainSelectionPage';
import GoalSelectionPage from './screens/GoalSelectionPage';
import ProjectsBreakdownPage from './screens/ProjectsBreakdownPage';
import CompletionPage from './screens/CompletionPage';

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
    hasError: hasOnboardingError
  } = useOnboardingCompletion({
    updateAppSetting,
    refreshData
  });
  
  // Screen state
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // User selections
  const [selectedCountry, setSelectedCountry] = useState('australia'); // Default country
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [previewDomain, setPreviewDomain] = useState(null);
  
  // Animation values with safe creation
  const fadeAnim = useRef(createSafeAnimatedValue(1)).current;
  const slideAnim = useRef(createSafeAnimatedValue(0)).current;
  const progressAnim = useRef(createSafeAnimatedValue(0)).current; // Animation for progress bar
  const progressTextOpacity = useRef(createSafeAnimatedValue(0)).current; // Animation for progress text
  const progressTextScale = useRef(createSafeAnimatedValue(0.8)).current; // Scale animation for progress text
  
  // Built-in domain reference for color consistency - matches Profile Screen order
  const STANDARD_DOMAINS = [
    { name: "Career & Work", icon: "briefcase", color: "#4f46e5" },
    { name: "Health & Wellness", icon: "fitness", color: "#06b6d4" },
    { name: "Relationships", icon: "people", color: "#ec4899" },
    { name: "Personal Growth", icon: "school", color: "#8b5cf6" },
    { name: "Financial Security", icon: "cash", color: "#10b981" },
    { name: "Recreation & Leisure", icon: "bicycle", color: "#f59e0b" },
    { name: "Purpose & Meaning", icon: "compass", color: "#ef4444" },
    { name: "Environment & Organization", icon: "home", color: "#6366f1" },
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
    const countryDomains = getCountryData(selectedCountry);
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
  
  // Load saved country on mount
  useEffect(() => {
    const loadSavedCountry = async () => {
      try {
        const savedCountry = await AsyncStorage.getItem('userCountry');
        if (savedCountry) {
          setSelectedCountry(savedCountry);
        }
      } catch (error) {
        console.log('Error loading saved country:', error);
      }
    };
    
    loadSavedCountry();
  }, []);
  
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
    
    // Animate progress bar if we're past the welcome screen
    if (currentScreen > 0) {
      // Calculate the progress percentage (0 to 1)
      // 5 screens total (0-indexed): welcome, language, domain, goal, project, completion
      const progress = currentScreen / 5;
      
      // Animate progress bar width
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false // Width changes can't use native driver
      }).start();
      
      // Animate the percentage text with a slight delay
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
    }
  }, [currentScreen]);
  
  // Go to next screen
  const goToNextScreen = () => {
    if (currentScreen < 5) {
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
            {/* Welcome Page */}
            {currentScreen === 0 && (
              <WelcomePage 
                onContinue={goToNextScreen} 
                onSkipOnboarding={handleSkipOnboarding}
              />
            )}
            
            {/* Country Selection Page */}
            {currentScreen === 1 && (
              <CountrySelectionPage
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
                isNavigating={isNavigating}
              />
            )}
            
            {/* Domain Selection Page */}
            {currentScreen === 2 && (
              <DomainSelectionPage
                domains={getDomainDefinitions()}
                onDomainSelected={handleDomainSelected}
                onDomainPreview={handleDomainPreview}
                onResetPreview={resetDomainPreview}
                onBack={goToPreviousScreen}
                isNavigating={isNavigating}
              />
            )}
            
            {/* Goal Selection Page */}
            {currentScreen === 3 && selectedDomain && (
              <GoalSelectionPage
                domain={selectedDomain}
                onGoalSelected={handleGoalSelected}
                onBack={goToPreviousScreen}
                isNavigating={isNavigating}
              />
            )}
            
            {/* Projects Breakdown Page */}
            {currentScreen === 4 && selectedDomain && selectedGoal && (
              <ProjectsBreakdownPage
                domain={selectedDomain}
                goal={selectedGoal}
                onContinue={goToNextScreen}
                onBack={goToPreviousScreen}
                isNavigating={isNavigating}
              />
            )}
            
            {/* Completion Page */}
            {currentScreen === 5 && (
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
          
          {/* Progress Percentage Bar - Only shown after welcome screen */}
          {currentScreen > 0 && (
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
                  {Math.round((currentScreen / 5) * 100)}%
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
});

export default EnhancedOnboardingScreen;