// src/context/AchievementContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create context
const AchievementContext = createContext();

// Provider component
export const AchievementProvider = ({ children }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState({});
  const [toastVisible, setToastVisible] = useState(false);
  const [currentToastAchievement, setCurrentToastAchievement] = useState(null);
  const [newAchievementsQueue, setNewAchievementsQueue] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add a refresh counter
  const [isLoading, setIsLoading] = useState(false);
  
  // Enhanced loadAchievements function with better error handling and immediate state update
  const loadAchievements = async () => {
    try {
      console.log('Loading achievements from storage...');
      const achievementsData = await AsyncStorage.getItem('unlockedAchievements');
      
      if (achievementsData) {
        try {
          const parsedData = JSON.parse(achievementsData);
          console.log(`Loaded ${Object.keys(parsedData).length} achievements`);
          
          // Debug specific achievements
          if (parsedData['goal-pioneer']) {
            console.log('Found goal-pioneer achievement in storage with data:', 
              JSON.stringify(parsedData['goal-pioneer']));
          } else {
            console.log('goal-pioneer achievement not found in storage');
          }
          
          // Immediately update state
          setUnlockedAchievements(parsedData);
          return parsedData; // Return the loaded data for immediate use
        } catch (parseError) {
          console.error('Error parsing achievements data:', parseError);
          console.log('Raw data:', achievementsData);
          // Fall back to empty object on parse error
          setUnlockedAchievements({});
          return {};
        }
      } else {
        console.log('No achievements found in storage');
        setUnlockedAchievements({});
        return {};
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      // Fall back to empty object on any error
      setUnlockedAchievements({});
      return {};
    }
  };
  
  // Load unlocked achievements on mount and when refresh is triggered
  useEffect(() => {
    loadAchievements();
  }, [refreshTrigger]);
  
  // Enhanced refreshAchievements function with better error handling
  const refreshAchievements = useCallback(() => {
    console.log('Refreshing achievements...');
    
    // Set loading state
    setIsLoading(true);
    
    // Use a short timeout to ensure state updates properly
    setTimeout(async () => {
      try {
        // Force reload from AsyncStorage and get the latest data
        const currentData = await loadAchievements();
        
        // Immediately update state with latest data
        setUnlockedAchievements(currentData);
        
        // Log the current achievement state
        console.log(`Refreshed achievements: ${Object.keys(currentData).length}`);
        
        // Increment refresh trigger to ensure useEffect hooks fire
        setRefreshTrigger(prev => prev + 1);
        
        // Check specific achievements for debugging
        const goalPioneerUnlocked = currentData['goal-pioneer']?.unlocked === true;
        console.log(`Goal Pioneer achievement status: ${goalPioneerUnlocked ? 'Unlocked' : 'Locked'}`);
      } catch (error) {
        console.error('Error refreshing achievements:', error);
      } finally {
        // Reset loading state
        setIsLoading(false);
      }
    }, 100);
  }, []);
  
  // Check for achievements based on app actions
  const checkAchievements = async (context) => {
    // Implementation would check various conditions and call unlockAchievement
    console.log('Checking achievements:', context);
  };
  
  // Enhanced unlockAchievement function with immediate state update
  const unlockAchievement = async (achievementId) => {
    try {
      // Load the most current achievements state from storage
      const currentAchievements = await loadAchievements();
      
      // Don't unlock if already unlocked
      if (currentAchievements[achievementId]?.unlocked) {
        console.log(`Achievement ${achievementId} already unlocked`);
        return false;
      }
      
      console.log(`Unlocking achievement: ${achievementId}`);
      
      // Create new achievements object
      const newUnlockedAchievements = {
        ...currentAchievements,
        [achievementId]: { 
          unlocked: true, 
          date: new Date().toISOString(),
          seen: false
        }
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('unlockedAchievements', JSON.stringify(newUnlockedAchievements));
      
      // Update state immediately
      setUnlockedAchievements(newUnlockedAchievements);
      
      // Add to new achievements queue
      const newQueue = [
        ...newAchievementsQueue,
        { id: achievementId, date: new Date().toISOString() }
      ];
      setNewAchievementsQueue(newQueue);
      
      // Force a refresh trigger update
      setRefreshTrigger(prev => prev + 1);
      
      return true;
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return false;
    }
  };
  
  // Get all new achievements to show on the achievements screen
  const getNewAchievements = () => {
    return newAchievementsQueue;
  };
  
  // Mark achievements as seen
  const markAchievementsAsSeen = async (achievementIds) => {
    try {
      const updatedAchievements = { ...unlockedAchievements };
      
      let updated = false;
      achievementIds.forEach(id => {
        if (updatedAchievements[id] && !updatedAchievements[id].seen) {
          updatedAchievements[id].seen = true;
          updated = true;
        }
      });
      
      if (updated) {
        // Update AsyncStorage
        await AsyncStorage.setItem('unlockedAchievements', JSON.stringify(updatedAchievements));
        
        // Update state
        setUnlockedAchievements(updatedAchievements);
        
        // Clear from queue
        setNewAchievementsQueue([]);
      }
    } catch (error) {
      console.error('Error marking achievements as seen:', error);
    }
  };
  
  // Check if an achievement is unlocked
  const isAchievementUnlocked = (achievementId) => {
    return unlockedAchievements[achievementId]?.unlocked === true;
  };
  
  // Get achievement unlock date
  const getAchievementUnlockDate = (achievementId) => {
    if (!unlockedAchievements[achievementId]?.unlocked) return null;
    
    try {
      return new Date(unlockedAchievements[achievementId].date);
    } catch (e) {
      return null;
    }
  };
  
  // Get total points
  const getTotalPoints = () => {
    let total = 0;
    
    // If we had achievements data, we would calculate points here
    // For now, just count the number of unlocked achievements
    total = Object.keys(unlockedAchievements).length;
    
    return total;
  };
  
  // Reset all achievements (for testing)
  const resetAllAchievements = async () => {
    try {
      await AsyncStorage.setItem('unlockedAchievements', JSON.stringify({}));
      
      // Also clear achievement tracking markers
      const allKeys = await AsyncStorage.getAllKeys();
      const trackerKeys = allKeys.filter(key => key.startsWith('achievement_tracker_'));
      
      if (trackerKeys.length > 0) {
        await AsyncStorage.multiRemove(trackerKeys);
        console.log(`Cleared ${trackerKeys.length} achievement tracker markers`);
      }
      
      setUnlockedAchievements({});
      setNewAchievementsQueue([]);
      return true;
    } catch (error) {
      console.error('Error resetting achievements:', error);
      return false;
    }
  };
  
  // Add this useEffect to ensure global event listeners are properly set up
  useEffect(() => {
    const handleRefreshEvent = () => {
      console.log('Received refresh-achievements event, triggering refresh');
      refreshAchievements();
    };
    
    // Setup event listener for both global and document
    if (typeof global !== 'undefined') {
      if (typeof global.addEventListener === 'function') {
        global.addEventListener('refresh-achievements', handleRefreshEvent);
      }
    }
    
    if (typeof document !== 'undefined') {
      document.addEventListener('refresh-achievements', handleRefreshEvent);
    }
    
    // Cleanup function
    return () => {
      if (typeof global !== 'undefined' && typeof global.removeEventListener === 'function') {
        global.removeEventListener('refresh-achievements', handleRefreshEvent);
      }
      
      if (typeof document !== 'undefined') {
        document.removeEventListener('refresh-achievements', handleRefreshEvent);
      }
    };
  }, [refreshAchievements]);
  
  // Make the context instance globally available for direct access
  useEffect(() => {
    if (typeof global !== 'undefined') {
      global.achievementContextInstance = {
        refreshAchievements,
        unlockAchievement,
        isAchievementUnlocked,
        getAchievementUnlockDate,
        getTotalPoints,
        getNewAchievements,
        markAchievementsAsSeen,
        resetAllAchievements
      };
      
      return () => {
        if (typeof global !== 'undefined') {
          global.achievementContextInstance = null;
        }
      };
    }
  }, [refreshAchievements, unlockAchievement, isAchievementUnlocked, getAchievementUnlockDate, 
      getTotalPoints, getNewAchievements, markAchievementsAsSeen, resetAllAchievements]);
  
  return (
    <AchievementContext.Provider
      value={{
        unlockedAchievements,
        checkAchievements,
        unlockAchievement,
        isAchievementUnlocked,
        getAchievementUnlockDate,
        getTotalPoints,
        getNewAchievements,
        markAchievementsAsSeen,
        resetAllAchievements,
        refreshAchievements, // Export the refresh function
        isLoading, // Export loading state
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
};

// Custom hook to use the achievement context - now with fallback!
export const useAchievements = () => {
  const context = useContext(AchievementContext);
  
  // If context is not available, return fallback implementations
  if (!context) {
    console.warn('useAchievements was called outside of AchievementProvider. Using fallback implementation.');
    
    // Return fallback implementations
    return {
      unlockedAchievements: {},
      checkAchievements: () => console.log('Achievement check (fallback)'),
      unlockAchievement: () => false,
      isAchievementUnlocked: () => false,
      getAchievementUnlockDate: () => null,
      getTotalPoints: () => 0,
      getNewAchievements: () => [],
      markAchievementsAsSeen: () => {},
      resetAllAchievements: () => false,
      refreshAchievements: () => {}, // Fallback refresh function
      isLoading: false, // Fallback loading state
    };
  }
  
  return context;
};

export default AchievementContext;