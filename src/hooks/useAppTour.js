// src/hooks/useAppTour.js
import { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Global tour state that persists across screens
const globalTourState = {
  isTourActive: false,
  currentStep: 'PROFILE_GOALS',
  shouldCollapseAll: false,
  listeners: new Set(),
};

const updateGlobalTourState = (updates) => {
  Object.assign(globalTourState, updates);
  // Notify all listeners
  globalTourState.listeners.forEach(listener => listener(globalTourState));
};

/**
 * Hook to manage the app tour state and progression
 */
export const useAppTour = (navigation = null) => {
  const [isTourActive, setIsTourActive] = useState(globalTourState.isTourActive);
  const [currentStep, setCurrentStep] = useState(globalTourState.currentStep);
  const [shouldCollapseAll, setShouldCollapseAll] = useState(globalTourState.shouldCollapseAll);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);
  const [spotlightTarget, setSpotlightTarget] = useState(null);
  const measureRefs = useRef({});
  
  // Sync with global tour state
  useEffect(() => {
    const listener = (globalState) => {
      setIsTourActive(globalState.isTourActive);
      setCurrentStep(globalState.currentStep);
      setShouldCollapseAll(globalState.shouldCollapseAll);
    };
    
    globalTourState.listeners.add(listener);
    
    return () => {
      globalTourState.listeners.delete(listener);
    };
  }, []);
  
  // Tour step sequence
  const TOUR_SEQUENCE = [
    'PROFILE_GOALS',
    'PROFILE_DOMAIN_WHEEL', 
    'OVERVIEW_PLAN',
    'KANBAN_INTRO',
    'TIME_BLOCKS',
    'AI_ASSISTANT'
  ];
  
  // Screen navigation map for tour steps
  const STEP_SCREENS = {
    'PROFILE_GOALS': 'Profile',
    'PROFILE_DOMAIN_WHEEL': 'Profile',
    'OVERVIEW_PLAN': 'GoalsTab',
    'KANBAN_INTRO': 'Projects',
    'TIME_BLOCKS': 'Time',
    'AI_ASSISTANT': null // Stays on current screen
  };
  
  // Check if tour should start
  useEffect(() => {
    checkTourStatus();
  }, []);
  
  const checkTourStatus = async () => {
    try {
      // Check if user just completed onboarding
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      const hasSeenAppTour = await AsyncStorage.getItem('hasSeenAppTour');
      const tourSkipped = await AsyncStorage.getItem('appTourSkipped');
      
      if (hasCompletedOnboarding === 'true' && hasSeenAppTour !== 'true' && tourSkipped !== 'true') {
        // Start the tour
        setTimeout(() => {
          startTour();
        }, 500); // Small delay to let profile screen render
      }
    } catch (error) {
      console.log('Error checking tour status:', error);
    }
  };
  
  const startTour = () => {
    updateGlobalTourState({
      isTourActive: true,
      currentStep: 'PROFILE_GOALS'
    });
    // Set global flag to hide floating AI button
    global.isAppTourActive = true;
  };
  
  const nextStep = () => {
    const currentIndex = TOUR_SEQUENCE.indexOf(currentStep);
    
    if (currentIndex < TOUR_SEQUENCE.length - 1) {
      const nextStepName = TOUR_SEQUENCE[currentIndex + 1];
      const nextScreen = STEP_SCREENS[nextStepName];
      const currentScreen = STEP_SCREENS[currentStep];
      
      console.log('🚀 Tour Debug:', { 
        currentStep, 
        nextStepName, 
        currentScreen, 
        nextScreen,
        navigationAvailable: !!navigation 
      });
      
      // Navigate to next screen if needed
      if (nextScreen && nextScreen !== currentScreen && navigation) {
        // Navigate first, then update step after navigation
        try {
          console.log('🧭 Navigating to:', nextScreen);
          navigation.navigate(nextScreen);
          
          // Use InteractionManager to wait for navigation animation to complete
          InteractionManager.runAfterInteractions(() => {
            // For OVERVIEW_PLAN step, add extra delay to ensure screen is fully ready
            if (nextStepName === 'OVERVIEW_PLAN') {
              console.log('📍 Setting step to OVERVIEW_PLAN with extra delay for screen readiness');
              // Signal to collapse all goals and milestones before showing tour
              updateGlobalTourState({ 
                currentStep: nextStepName,
                shouldCollapseAll: true 
              });
            } else {
              console.log('📍 Setting step to:', nextStepName);
              updateGlobalTourState({ currentStep: nextStepName });
            }
          });
        } catch (error) {
          console.warn('Navigation failed in tour:', error);
          // Just update step without navigation
          updateGlobalTourState({ currentStep: nextStepName });
        }
      } else {
        console.log('📍 Setting step to:', nextStepName, '(no navigation needed)');
        updateGlobalTourState({ currentStep: nextStepName });
      }
    } else {
      // Tour complete
      completeTour();
    }
  };
  
  const completeTour = async () => {
    try {
      await AsyncStorage.setItem('hasSeenAppTour', 'true');
      updateGlobalTourState({ isTourActive: false });
      setHasCompletedTour(true);
      // Clear global flag to show floating AI button again
      global.isAppTourActive = false;
    } catch (error) {
      console.log('Error completing tour:', error);
    }
  };
  
  const skipTour = async () => {
    try {
      await AsyncStorage.setItem('appTourSkipped', 'true');
      await AsyncStorage.setItem('hasSeenAppTour', 'true');
      updateGlobalTourState({ isTourActive: false });
      // Clear global flag to show floating AI button again
      global.isAppTourActive = false;
    } catch (error) {
      console.log('Error skipping tour:', error);
    }
  };
  
  const restartTour = async () => {
    try {
      await AsyncStorage.removeItem('hasSeenAppTour');
      await AsyncStorage.removeItem('appTourSkipped');
      startTour();
    } catch (error) {
      console.log('Error restarting tour:', error);
    }
  };
  
  // Register a ref for measurement
  const registerRef = (key, ref) => {
    measureRefs.current[key] = ref;
  };
  
  // Measure a registered element
  const measureElement = (key, callback) => {
    const ref = measureRefs.current[key];
    if (ref && ref.current) {
      ref.current.measureInWindow((x, y, width, height) => {
        callback({ x, y, width, height });
      });
    }
  };
  
  // Update spotlight position for dynamic elements
  const updateSpotlight = (measurements) => {
    setSpotlightTarget(measurements);
  };
  
  return {
    // State
    isTourActive,
    currentStep,
    shouldCollapseAll,
    hasCompletedTour,
    spotlightTarget,
    
    // Actions
    startTour,
    nextStep,
    skipTour,
    completeTour,
    restartTour,
    
    // Refs management
    registerRef,
    measureElement,
    updateSpotlight,
    
    // Utils
    isOnStep: (stepName) => isTourActive && currentStep === stepName,
    updateGlobalTourState, // Export for direct state updates
  };
};

export default useAppTour;