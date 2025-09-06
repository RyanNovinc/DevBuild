// src/hooks/useAppTour.js
import { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackTourGraduate } from '../services/FeatureExplorerTracker';

// Global tour state that persists across screens
const globalTourState = {
  isTourActive: false,
  currentStep: 'FOUNDATION_BUILDER_INTRO',
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
  
  // Tour step sequence - New streamlined interactive tour
  const TOUR_SEQUENCE = [
    'FOUNDATION_BUILDER_INTRO',
    'GOAL_ACHIEVEMENT_VALIDATION',
    'KANBAN_SYSTEM_INTRO', 
    'PICK_CURRENT_FOCUS',
    'TASK_MOVED_CELEBRATION',
    'SCHEDULE_DEDICATED_TIME',
    'TIME_BLOCK_CREATED',
    'SYSTEM_CONFIDENCE',
    'SUPPORTING_TOOLS_OVERVIEW',
    'AI_FAREWELL'
  ];
  
  // Screen navigation map for tour steps
  const STEP_SCREENS = {
    'FOUNDATION_BUILDER_INTRO': 'Profile', // Stay on Profile screen for achievement intro
    'GOAL_ACHIEVEMENT_VALIDATION': 'Profile',
    'KANBAN_SYSTEM_INTRO': 'Projects',
    'PICK_CURRENT_FOCUS': 'Projects',
    'TASK_MOVED_CELEBRATION': 'Projects',
    'SCHEDULE_DEDICATED_TIME': 'Time',
    'TIME_BLOCK_CREATED': 'Time',
    'SYSTEM_CONFIDENCE': 'Time',
    'SUPPORTING_TOOLS_OVERVIEW': 'TodoTab',
    'AI_FAREWELL': 'TodoTab'
  };
  
  // Note: Complex periodic checking system removed - tour now starts directly from App.js
  // This simplifies the system and makes it more reliable
  
  // Note: checkTourStatus function removed - no longer needed with direct tour triggering
  
  const startTour = (startStep = 'FOUNDATION_BUILDER_INTRO') => {
    console.log('🏆🎯 startTour called with step:', startStep);
    console.log('🏆🎯 Before update - globalTourState:', globalTourState);
    console.log('🏆🎯 TOUR_SEQUENCE[0]:', TOUR_SEQUENCE[0]);
    
    updateGlobalTourState({
      isTourActive: true,
      currentStep: startStep
    });
    
    console.log('🏆🎯 After update - globalTourState:', globalTourState);
    
    // Set global flag to hide floating AI button
    global.isAppTourActive = true;
    console.log('🎯 Set global.isAppTourActive = true');
  };
  
  // Function to start tour from notes screen for testing
  const startTourFromNotes = (navigation) => {
    console.log('🎯 Starting tour from notes section');
    
    // Navigate to TodoTab first, then switch to notes view
    if (navigation) {
      try {
        navigation.navigate('TodoTab', { currentView: 'todo' });
        console.log('🧭 Navigated to TodoTab with todo view for notes tour');
        
        // Start the tour after navigation completes
        setTimeout(() => {
          startTour('NOTES_DAILY_STANDUP');
          console.log('🎯 Tour started from NOTES_DAILY_STANDUP step');
        }, 500);
      } catch (error) {
        console.warn('Navigation failed:', error);
        // Fallback: start tour anyway
        startTour('NOTES_DAILY_STANDUP');
      }
    } else {
      // Start the tour from notes step
      startTour('NOTES_DAILY_STANDUP');
      console.log('🎯 Tour started from NOTES_DAILY_STANDUP step');
    }
  };
  
  // Make functions available globally for easy testing
  useEffect(() => {
    global.startTourFromNotes = startTourFromNotes;
    global.updateGlobalTourState = updateGlobalTourState;
    // Note: manualTourCheck removed as we no longer use periodic checking
    
    // Add direct tour starter for App.js to use after onboarding
    global.startTourDirectly = () => {
      console.log('🎯 Tour triggered directly from App.js after onboarding completion');
      startTour('FOUNDATION_BUILDER_INTRO');
    };
    
    // DEV: Easy way to jump to any tour step
    global.jumpToTourStep = (stepName, nav = null) => {
      console.log('🎯 DEV: Jumping to tour step:', stepName);
      
      const navigationToUse = nav || navigation;
      if (!navigationToUse) {
        console.warn('🎯 DEV: No navigation available for jumpToTourStep');
        return;
      }
      
      // Get the screen for this step
      const targetScreen = STEP_SCREENS[stepName];
      if (!targetScreen) {
        console.warn('🎯 DEV: No screen defined for step:', stepName);
        return;
      }
      
      console.log('🎯 DEV: Navigating to screen:', targetScreen, 'for step:', stepName);
      
      try {
        // Handle navigation for new tour steps
        if (stepName === 'SUPPORTING_TOOLS_OVERVIEW') {
          navigationToUse.navigate(targetScreen, { currentView: 'todo' });
        } else {
          navigationToUse.navigate(targetScreen);
        }
        
        // Update tour state after navigation
        setTimeout(() => {
          updateGlobalTourState({ 
            isTourActive: true,
            currentStep: stepName 
          });
          global.isAppTourActive = true;
          console.log('🎯 DEV: Tour state updated to:', stepName);
        }, 500);
        
      } catch (error) {
        console.error('🎯 DEV: Navigation failed:', error);
        // Fallback: just update state
        updateGlobalTourState({ 
          isTourActive: true,
          currentStep: stepName 
        });
        global.isAppTourActive = true;
      }
    };
    
    // DEV: Console shortcut commands
    if (__DEV__) {
      console.log('🤖 DEV COMMANDS AVAILABLE:');
      console.log('- global.startTourDirectly() // Start tour directly (same as post-onboarding)');
      console.log('- global.jumpToTourStep("PICK_CURRENT_FOCUS") // Start at step 3');
      console.log('- global.jumpToTourStep("SUPPORTING_TOOLS_OVERVIEW") // Start at step 6');
      console.log('- global.jumpToTourStep("AI_FAREWELL") // Start at AI farewell step');
    }
    
    return () => {
      delete global.startTourFromNotes;
      delete global.updateGlobalTourState;
      delete global.jumpToTourStep;
      delete global.startTourDirectly;
    };
  }, []);
  
  const nextStep = () => {
    console.log('🚀 useAppTour: nextStep() called');
    console.log('🚀 useAppTour: Current global tour state:', {
      isTourActive: globalTourState.isTourActive,
      currentStep: globalTourState.currentStep,
      localCurrentStep: currentStep
    });
    
    const currentIndex = TOUR_SEQUENCE.indexOf(currentStep);
    console.log('🚀 useAppTour: Current step index:', currentIndex, 'of', TOUR_SEQUENCE.length - 1);
    
    if (currentIndex < TOUR_SEQUENCE.length - 1) {
      const nextStepName = TOUR_SEQUENCE[currentIndex + 1];
      const nextScreen = STEP_SCREENS[nextStepName];
      const currentScreen = STEP_SCREENS[currentStep];
      
      console.log('🚀 useAppTour: Tour progression details:', { 
        currentStep, 
        nextStepName, 
        currentScreen, 
        nextScreen,
        navigationAvailable: !!navigation 
      });
      
      // Special debug for AI_FAREWELL transition
      if (nextStepName === 'AI_FAREWELL') {
        console.log('🎭 About to transition to AI_FAREWELL step!');
      }
      
      // Navigate to next screen if needed
      if (nextScreen && nextScreen !== currentScreen && navigation) {
        // Navigate first, then update step after navigation
        try {
          console.log('🧭 Navigating to:', nextScreen);
          
          // Handle navigation for new tour steps
          if (nextStepName === 'SUPPORTING_TOOLS_OVERVIEW') {
            navigation.navigate(nextScreen, { currentView: 'todo' });
            console.log('🧭 Navigated to TodoTab for supporting tools overview');
          } else {
            navigation.navigate(nextScreen);
            console.log('🧭 Navigated to:', nextScreen);
          }
          
          // Use InteractionManager to wait for navigation animation to complete
          InteractionManager.runAfterInteractions(() => {
            console.log('📍 Setting step to:', nextStepName);
            updateGlobalTourState({ currentStep: nextStepName });
          });
        } catch (error) {
          console.warn('Navigation failed in tour:', error);
          // Just update step without navigation
          updateGlobalTourState({ currentStep: nextStepName });
        }
      } else {
        console.log('📍 useAppTour: Setting step to:', nextStepName, '(no navigation needed)');
        
        // Special debug for AI_FAREWELL
        if (nextStepName === 'AI_FAREWELL') {
          console.log('🎭 Now updating to AI_FAREWELL step');
        }
        
        // Special debug for GOAL_ACHIEVEMENT_VALIDATION
        if (nextStepName === 'GOAL_ACHIEVEMENT_VALIDATION') {
          console.log('🏆 useAppTour: About to transition to GOAL_ACHIEVEMENT_VALIDATION - this should show the AppTourOverlay');
        }
        
        console.log('📍 useAppTour: Before updateGlobalTourState, current state:', globalTourState);
        updateGlobalTourState({ currentStep: nextStepName });
        console.log('📍 useAppTour: After updateGlobalTourState, new state:', globalTourState);
      }
    } else {
      // Tour complete
      console.log('🎭 Tour sequence complete - calling completeTour()');
      console.log('🎭 Current step was:', currentStep);
      console.log('🎭 Current index was:', currentIndex, 'of', TOUR_SEQUENCE.length - 1);
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
      
      // Track tour completion achievement
      try {
        await trackTourGraduate();
        console.log('🏆 Tour completion achievement tracked');
      } catch (achievementError) {
        console.error('Error tracking tour completion achievement:', achievementError);
      }
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
    startTourFromNotes,
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