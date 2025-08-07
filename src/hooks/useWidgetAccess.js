// src/hooks/useWidgetAccess.js
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREMIUM_FEATURES } from '../services/SubscriptionConstants';
import LevelService from '../services/LevelService';
import { useAchievements } from '../context/AchievementContext';

/**
 * Hook to determine if a specific widget is accessible based on subscription status and level
 * @param {string} widgetId - The ID of the widget to check
 * @returns {Object} - Object containing access information
 */
const useWidgetAccess = (widgetId) => {
  const [accessState, setAccessState] = useState({
    hasFullAccess: false,
    isLoading: true,
    requiresUpgrade: false,
    requiredLevel: null,
  });

  // Get achievements context to check user level
  const { getTotalPoints } = useAchievements();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Get current subscription status
        const status = await AsyncStorage.getItem('subscriptionStatus');
        const isPro = status === 'pro' || status === 'unlimited';
        
        // Calculate current user level (check for test level first)
        let userLevel = 1;
        try {
          const storedTestMode = await AsyncStorage.getItem('testMode');
          const storedTestLevel = await AsyncStorage.getItem('testLevel');
          
          if (storedTestMode === 'true' && storedTestLevel) {
            userLevel = parseInt(storedTestLevel);
          } else {
            userLevel = LevelService.calculateLevel(getTotalPoints());
          }
        } catch (error) {
          console.error('Error calculating user level:', error);
          userLevel = LevelService.calculateLevel(getTotalPoints());
        }
        
        // Determine if this widget requires premium or level unlock
        let requiresUpgrade = false;
        let requiredLevel = null;
        
        switch (widgetId) {
          case 'financial_freedom_tracker':
            // Financial Tracker unlocks at Level 5
            requiredLevel = 5;
            requiresUpgrade = userLevel < 5;
            break;
          // Add other level-based widgets here as needed
          default:
            // All other widgets are free
            requiresUpgrade = false;
            requiredLevel = null;
        }
        
        setAccessState({
          hasFullAccess: !requiresUpgrade,
          isLoading: false,
          requiresUpgrade,
          requiredLevel,
          userLevel,
          isPro,
        });
      } catch (error) {
        console.error('Error checking widget access:', error);
        // Default to allowing access on error
        setAccessState({
          hasFullAccess: true,
          isLoading: false,
          requiresUpgrade: false,
          requiredLevel: null,
          userLevel: 1,
          isPro: false,
        });
      }
    };
    
    checkAccess();
  }, [widgetId, getTotalPoints]);
  
  return accessState;
};

export default useWidgetAccess;