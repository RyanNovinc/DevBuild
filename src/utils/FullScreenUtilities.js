// src/utils/FullScreenUtilities.js
/**
 * Utilities for handling full-screen mode in the app
 * This file provides helper functions to hide/show navigation elements
 * when entering or exiting full-screen mode
 */

/**
 * Hide the tab bar navigation based on your navigation library
 * @param {Object} navigation - Navigation object from React Navigation
 */
export const hideTabBar = (navigation) => {
  if (!navigation) return;
  
  // For React Navigation v5+
  if (navigation.setOptions) {
    navigation.setOptions({
      tabBarStyle: { display: 'none' }
    });
  }
  
  // For older React Navigation versions or custom implementations
  if (navigation.setParams) {
    navigation.setParams({ tabBarVisible: false });
  }
  
  // For bottom tab navigator direct access
  if (navigation.dangerouslyGetParent) {
    const parent = navigation.dangerouslyGetParent();
    if (parent && parent.setOptions) {
      parent.setOptions({
        tabBarVisible: false
      });
    }
  }
};

/**
 * Show the tab bar navigation
 * @param {Object} navigation - Navigation object from React Navigation
 * @param {Object} defaultStyles - Default styles for the tab bar (optional)
 */
export const showTabBar = (navigation, defaultStyles = {}) => {
  if (!navigation) return;
  
  // For React Navigation v5+
  if (navigation.setOptions) {
    navigation.setOptions({
      tabBarStyle: { 
        display: 'flex',
        ...defaultStyles
      }
    });
  }
  
  // For older React Navigation versions or custom implementations
  if (navigation.setParams) {
    navigation.setParams({ tabBarVisible: true });
  }
  
  // For bottom tab navigator direct access
  if (navigation.dangerouslyGetParent) {
    const parent = navigation.dangerouslyGetParent();
    if (parent && parent.setOptions) {
      parent.setOptions({
        tabBarVisible: true
      });
    }
  }
};

/**
 * Hide the AI assistant button (implement based on your specific app)
 */
export const hideAIButton = () => {
  // Method 1: Using global window object (if available)
  if (typeof window !== 'undefined') {
    // If you have a global function to control the AI button
    if (window.setAIButtonVisible) {
      window.setAIButtonVisible(false);
    }
    
    // If you have a global AI button element
    const aiButton = document.getElementById('ai-button') || 
                     document.querySelector('.ai-button');
    if (aiButton) {
      aiButton.style.display = 'none';
    }
  }
  
  // Method 2: Using global state management (example with Redux)
  // if (store && store.dispatch) {
  //   store.dispatch({ type: 'SET_AI_BUTTON_VISIBLE', payload: false });
  // }
  
  // Method 3: Using event system
  const event = new CustomEvent('ai-button-visibility', { detail: { visible: false } });
  document.dispatchEvent(event);
};

/**
 * Show the AI assistant button
 */
export const showAIButton = () => {
  // Method 1: Using global window object (if available)
  if (typeof window !== 'undefined') {
    // If you have a global function to control the AI button
    if (window.setAIButtonVisible) {
      window.setAIButtonVisible(true);
    }
    
    // If you have a global AI button element
    const aiButton = document.getElementById('ai-button') || 
                     document.querySelector('.ai-button');
    if (aiButton) {
      aiButton.style.display = 'block';
    }
  }
  
  // Method 2: Using global state management (example with Redux)
  // if (store && store.dispatch) {
  //   store.dispatch({ type: 'SET_AI_BUTTON_VISIBLE', payload: true });
  // }
  
  // Method 3: Using event system
  const event = new CustomEvent('ai-button-visibility', { detail: { visible: true } });
  document.dispatchEvent(event);
};

/**
 * Toggle full-screen mode for the app
 * @param {boolean} isFullScreen - Whether to enter or exit full-screen mode
 * @param {Object} navigation - Navigation object from React Navigation
 */
export const toggleFullScreenMode = (isFullScreen, navigation) => {
  // Handle tab bar visibility
  if (isFullScreen) {
    hideTabBar(navigation);
    hideAIButton();
  } else {
    showTabBar(navigation);
    showAIButton();
  }
  
  // Handle status bar
  if (StatusBar) {
    StatusBar.setHidden(isFullScreen);
  }
};