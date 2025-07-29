// src/hooks/useWidgetAccess.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREMIUM_FEATURES } from '../services/SubscriptionConstants';

/**
 * Hook to determine if a specific widget is accessible based on subscription status
 * @param {string} widgetId - The ID of the widget to check
 * @returns {Object} - Object containing access information
 */
const useWidgetAccess = (widgetId) => {
  const [accessState, setAccessState] = useState({
    hasFullAccess: false,
    isLoading: true,
    requiresUpgrade: false,
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Get current subscription status
        const status = await AsyncStorage.getItem('subscriptionStatus');
        const isPro = status === 'pro' || status === 'unlimited';
        
        // Determine if this widget requires premium
        let requiresUpgrade = false;
        
        switch (widgetId) {
          case 'financial_freedom_tracker':
            // Only this widget is premium
            requiresUpgrade = !isPro;
            break;
          // Add other premium widgets here as needed
          default:
            // All other widgets are free
            requiresUpgrade = false;
        }
        
        setAccessState({
          hasFullAccess: !requiresUpgrade,
          isLoading: false,
          requiresUpgrade,
          isPro,
        });
      } catch (error) {
        console.error('Error checking widget access:', error);
        // Default to allowing access on error
        setAccessState({
          hasFullAccess: true,
          isLoading: false,
          requiresUpgrade: false,
          isPro: false,
        });
      }
    };
    
    checkAccess();
  }, [widgetId]);
  
  return accessState;
};

export default useWidgetAccess;