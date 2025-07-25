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
  Easing
} from 'react-native';
import { useAppContext } from '../../context/AppContext';
import OnboardingService from '../../services/OnboardingService';
// Import I18nProvider
import { I18nProvider } from './context/I18nContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import our screens
import WelcomePage from './screens/WelcomePage';
import LanguageSelectionPage from './screens/LanguageSelectionPage';
import DomainSelectionPage from './screens/DomainSelectionPage';
import GoalSelectionPage from './screens/GoalSelectionPage';
import ProjectsBreakdownPage from './screens/ProjectsBreakdownPage';
import CompletionPage from './screens/CompletionPage';

// Import data - updated to support multiple languages
import { DOMAIN_DEFINITIONS as EnglishDomains } from './data/onboardingData';
import { DOMAIN_DEFINITIONS as JapaneseDomains } from './data/onboardingData.ja';

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
  
  // Screen state
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // User selections
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default language
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [previewDomain, setPreviewDomain] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current; // Animation for progress bar
  const progressTextOpacity = useRef(new Animated.Value(0)).current; // Animation for progress text
  const progressTextScale = useRef(new Animated.Value(0.8)).current; // Scale animation for progress text
  
  // Built-in domain reference for color consistency
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
  
  // Function to get domain definitions based on selected language
  const getDomainDefinitions = () => {
    return selectedLanguage === 'ja' ? JapaneseDomains : EnglishDomains;
  };

  // Update domains when language changes
  useEffect(() => {
    console.log("Language updated to:", selectedLanguage);
    
    // Refresh domain and goal with new language data if they exist
    if (selectedDomain) {
      const domains = getDomainDefinitions();
      console.log("Looking for domain match in new language...");
      
      // Find the equivalent domain in the new language
      const refreshedDomain = domains.find(d => {
        // Match by name or by index position as fallback
        const domainIndex = EnglishDomains.findIndex(ed => ed.name === selectedDomain.name);
        return domainIndex >= 0 && domains[domainIndex] ? true : false;
      });
      
      if (refreshedDomain) {
        console.log("Found matching domain in new language:", refreshedDomain.name);
        setSelectedDomain(refreshedDomain);
        
        // Also refresh the goal if it exists
        if (selectedGoal && refreshedDomain.goals) {
          const goalIndex = selectedDomain.goals.findIndex(g => g.name === selectedGoal.name);
          
          // Use the goal at the same index position in the refreshed domain
          if (goalIndex >= 0 && refreshedDomain.goals[goalIndex]) {
            const refreshedGoal = refreshedDomain.goals[goalIndex];
            console.log("Found matching goal in new language:", refreshedGoal.name);
            setSelectedGoal(refreshedGoal);
          }
        }
      }
    }
  }, [selectedLanguage]);
  
  // Load saved language on mount
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        if (savedLanguage) {
          setSelectedLanguage(savedLanguage);
        }
      } catch (error) {
        console.log('Error loading saved language:', error);
      }
    };
    
    loadSavedLanguage();
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
    // Animate screen transition
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
    
    // Reset slide position for next animation
    slideAnim.setValue(20);
    
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
      progressTextOpacity.setValue(0);
      progressTextScale.setValue(0.8);
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
  
  // SIMPLIFIED: Complete onboarding using the new OnboardingService
  const completeOnboarding = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    try {
      console.log("Starting simplified onboarding completion process...");
      
      if (!selectedDomain || !selectedGoal) {
        throw new Error("Missing domain or goal selection");
      }
      
      // Standardize domain properties
      let finalDomain = { ...selectedDomain };
      const standardDomain = getStandardDomain(selectedDomain.name);
      
      if (standardDomain) {
        finalDomain = {
          ...finalDomain,
          name: standardDomain.name,
          color: standardDomain.color,
          icon: standardDomain.icon
        };
      }
      
      // SIMPLIFIED: Use OnboardingService for all data creation in one batch
      const result = await OnboardingService.createOnboardingData(finalDomain, selectedGoal);
      
      if (!result.success) {
        console.error("Failed to create onboarding data:", result.message);
        throw new Error(result.message || "Failed to create onboarding data");
      }
      
      console.log("Onboarding data created successfully:", result);
      
      // Update app context settings if available
      if (updateAppSetting) {
        await updateAppSetting('onboardingCompleted', true);
        await updateAppSetting('themeColor', '#1e3a8a');
        await updateAppSetting('selectedDomain', finalDomain.name);
        await updateAppSetting('selectedLanguage', selectedLanguage); // Save selected language
        await updateAppSetting('selectedGoal', {
          domain: finalDomain.name,
          goalName: selectedGoal.name,
          projects: selectedGoal.projects
        });
      }
      
      // Force refresh of app context data
      if (typeof refreshData === 'function') {
        console.log("Refreshing app context data...");
        await refreshData();
        
        // Wait to ensure state is updated and do a second refresh
        await new Promise(resolve => setTimeout(resolve, 1500));
        await refreshData();
      }
      
      // Show success message
      if (typeof showSuccess === 'function') {
        showSuccess('Your goal has been created successfully!');
      }
      
      // Wait before navigation to ensure all data is processed
      console.log("Onboarding completed, waiting before navigation...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to the main screen
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'Main',
          params: { initialTab: 'GoalsTab' }
        }],
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      
      if (typeof showError === 'function') {
        showError('There was an error creating your goal. Please try again.');
      }
      
      setIsNavigating(false);
    }
  };
  
  // Handle language selection - now just updating the state
  // The actual language change is managed by LanguageSelectionPage component
  const handleLanguageSelected = (language) => {
    console.log("Language selected in parent:", language);
    setSelectedLanguage(language);
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
  
  // Handle skipping onboarding completely
  const handleSkipOnboarding = async () => {
    try {
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
      
      // Use service to create data
      const result = await OnboardingService.createOnboardingData(finalDomain, defaultGoal);
      
      if (!result.success) {
        throw new Error(result.message || "Failed to create default onboarding data");
      }
      
      // Update app settings
      if (updateAppSetting) {
        await updateAppSetting('onboardingCompleted', true);
        await updateAppSetting('themeColor', '#1e3a8a');
        await updateAppSetting('selectedDomain', finalDomain.name);
        await updateAppSetting('selectedLanguage', selectedLanguage); // Save selected language
        await updateAppSetting('selectedGoal', {
          domain: finalDomain.name,
          goalName: defaultGoal.name,
          projects: defaultGoal.projects
        });
      }
      
      // Refresh data
      if (typeof refreshData === 'function') {
        await refreshData();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refreshData();
      }
      
      // Show success
      if (typeof showSuccess === 'function') {
        showSuccess('Welcome to LifeCompass! We\'ve set up a default goal to get you started.');
      }
      
      // Navigate to main screen
      navigation.reset({
        index: 0,
        routes: [{ 
          name: 'Main',
          params: { initialTab: 'GoalsTab' }
        }],
      });
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      
      if (typeof showError === 'function') {
        showError('There was an error skipping onboarding. Please try again.');
      }
      
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
            
            {/* Language Selection Page - FIXED: changed onLanguageSelected to onContinue */}
            {currentScreen === 1 && (
              <LanguageSelectionPage
                onContinue={() => {
                  // The language is set by the component via AsyncStorage and I18n context
                  // We just need to synchronize our state and go to the next screen
                  AsyncStorage.getItem('userLanguage')
                    .then(lang => {
                      if (lang) {
                        setSelectedLanguage(lang);
                      }
                      // Navigate to next screen
                      goToNextScreen();
                    })
                    .catch(err => {
                      console.error("Error reading language:", err);
                      // Still navigate even if there's an error
                      goToNextScreen();
                    });
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
                      width: progressAnim.interpolate({
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