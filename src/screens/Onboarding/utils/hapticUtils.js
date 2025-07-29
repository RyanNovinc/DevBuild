// src/screens/Onboarding/utils/hapticUtils.js
import { Platform, Vibration } from 'react-native';

// Fallback vibration patterns (in milliseconds)
const VIBRATION_PATTERNS = {
  light: 10,
  medium: 20,
  heavy: 40,
  success: [0, 50, 50, 50],
  warning: [0, 30, 50, 30],
  error: [0, 50, 50, 50, 50, 50],
  selection: 5
};

// Initialize the haptic module
let isHapticInitialized = false;

/**
 * Initialize haptic feedback - no external dependencies
 * Should be called in app initialization
 */
export const initializeHaptic = () => {
  if (!isHapticInitialized) {
    console.log('Haptic feedback initialized with fallback vibration');
    isHapticInitialized = true;
  }
};

/**
 * Safe implementation of haptic feedback using standard Vibration API
 * @param {string} type - Type of haptic feedback
 */
export const triggerHaptic = (type) => {
  // Skip on web or if vibration is not supported
  if (Platform.OS === 'web' || !Vibration) {
    return;
  }

  try {
    // Use simple vibration as fallback
    const pattern = VIBRATION_PATTERNS[type] || VIBRATION_PATTERNS.light;
    
    // Only vibrate on Android (iOS requires permissions we might not have)
    if (Platform.OS === 'android') {
      if (Array.isArray(pattern)) {
        Vibration.vibrate(pattern);
      } else {
        Vibration.vibrate(pattern);
      }
    }
    
    // On iOS, we'll need the proper native module for good haptics
    // This is just a placeholder for future implementation
  } catch (error) {
    // Fail silently - haptic feedback is an enhancement
    console.warn('Vibration error:', error);
  }
};

/**
 * Check if haptic feedback is available on this device
 * @returns {boolean} - Whether haptic feedback is supported
 */
export const isHapticSupported = () => {
  return Platform.OS === 'android' && !!Vibration;
};

/**
 * Predefined haptic patterns for common interactions
 */
export const HapticPatterns = {
  // Button interactions
  BUTTON_PRESS: 'medium',
  BUTTON_CONFIRM: 'success',
  BUTTON_CANCEL: 'light',
  
  // Selection interactions
  SELECTION_CHANGED: 'selection',
  TOGGLE_ON: 'light',
  TOGGLE_OFF: 'light',
  
  // Navigation
  SCREEN_TRANSITION: 'light',
  BACK_NAVIGATION: 'light',
  
  // Success states
  SUCCESS_FEEDBACK: 'success',
  ACHIEVEMENT_UNLOCKED: 'heavy',
  
  // Warning states
  WARNING_FEEDBACK: 'warning',
  ERROR_FEEDBACK: 'error',
  
  // Special interactions
  SWIPE_SUCCESS: 'medium',
  DRAG_RELEASE: 'medium',
  TYPING_COMPLETE: 'light',
  AI_RESPONSE: 'light',
  
  // Onboarding specific
  STEP_COMPLETE: 'success',
  SAVE_COMPLETE: 'success',
  FOCUS_SELECTED: 'medium',
};