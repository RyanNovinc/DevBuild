// src/context/AIAssistantContext/index.js - COMPLETE IMPLEMENTATION
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../AppContext';
import { 
  initialState, 
  LAST_CHAT_KEY, 
  AI_MODEL_TIER_KEY, 
  USER_KNOWLEDGE_KEY, 
  USER_KNOWLEDGE_ENABLED_KEY, 
  AI_CREDITS_KEY,
  SUBSCRIPTION_STATUS_KEY,
  CREDIT_NOTIFICATIONS_KEY,
  LOW_CREDIT_THRESHOLD_KEY,
  DEFAULT_CREDIT_THRESHOLD,
  DEVELOPMENT_MODE_KEY
} from './constants';
import { reducer } from './reducers';
import { 
  getCreditCost, 
  getStorageQuota, 
  getDocumentLimit, 
  checkLowCredits,
  saveAIModelTier,
  saveUserDocuments,
  saveUserKnowledgeEnabled,
  saveAICredits,
  saveDevelopmentMode,
  getAvailableTiers
} from './utils';

// Create context
const AIAssistantContext = createContext();

// Provider component
export const AIAssistantProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const appContext = useAppContext();
  
  // Load preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load AI model tier
        const savedTier = await AsyncStorage.getItem(AI_MODEL_TIER_KEY);
        if (savedTier) {
          dispatch({ type: 'SET_AI_MODEL_TIER', payload: savedTier });
        }
        
        // Load user knowledge files
        const savedUserDocuments = await AsyncStorage.getItem(USER_KNOWLEDGE_KEY);
        if (savedUserDocuments) {
          dispatch({ 
            type: 'SET_USER_DOCUMENTS', 
            payload: JSON.parse(savedUserDocuments) 
          });
        }
        
        // Load user knowledge enabled setting
        const enabledSetting = await AsyncStorage.getItem(USER_KNOWLEDGE_ENABLED_KEY);
        if (enabledSetting !== null) {
          dispatch({ 
            type: 'SET_USER_KNOWLEDGE_ENABLED', 
            payload: enabledSetting === 'true' 
          });
        }
        
        // Load development mode setting - only in __DEV__ mode
        let isDevelopmentMode = false;
        if (__DEV__) {
          const devMode = await AsyncStorage.getItem(DEVELOPMENT_MODE_KEY);
          isDevelopmentMode = devMode === 'true';
          if (devMode !== null) {
            dispatch({ type: 'SET_DEVELOPMENT_MODE', payload: isDevelopmentMode });
          }
        }
        
        // Load subscription status
        const savedSubscription = await AsyncStorage.getItem(SUBSCRIPTION_STATUS_KEY);
        if (savedSubscription) {
          dispatch({ 
            type: 'SET_SUBSCRIPTION_STATUS', 
            payload: savedSubscription 
          });
          
          // Set available tiers based on subscription status and development mode
          const availableTiers = getAvailableTiers(savedSubscription, isDevelopmentMode);
          dispatch({ type: 'SET_AVAILABLE_TIERS', payload: availableTiers });
        }
        
        // Load AI credits or set defaults based on subscription
        let savedCredits = await AsyncStorage.getItem(AI_CREDITS_KEY);
        
        if (savedCredits) {
          const credits = parseInt(savedCredits, 10);
          dispatch({ type: 'SET_AI_CREDITS', payload: credits });
          
          // Initialize tier credits based on total credits
          const tierCredits = {
            guide: credits,
            navigator: savedSubscription === 'pro' || savedSubscription === 'unlimited' ? credits : 0,
            compass: savedSubscription === 'unlimited' ? credits : 0,
          };
          
          dispatch({ type: 'SET_TIER_CREDITS', payload: tierCredits });
        } else {
          // Set default credits based on subscription status
          let defaultCredits = 10; // Free tier default
          
          if (savedSubscription === 'pro') {
            defaultCredits = 25; // Pro tier default
          } else if (savedSubscription === 'unlimited') {
            defaultCredits = 999999; // Effectively unlimited
          }
          
          dispatch({ type: 'SET_AI_CREDITS', payload: defaultCredits });
          
          // Initialize tier credits based on subscription
          const tierCredits = {
            guide: defaultCredits,
            navigator: savedSubscription === 'pro' || savedSubscription === 'unlimited' ? defaultCredits : 0,
            compass: savedSubscription === 'unlimited' ? defaultCredits : 0,
          };
          
          dispatch({ type: 'SET_TIER_CREDITS', payload: tierCredits });
          
          await AsyncStorage.setItem(AI_CREDITS_KEY, defaultCredits.toString());
        }
        
        // Load credit notification preferences
        const notificationsEnabled = await AsyncStorage.getItem(CREDIT_NOTIFICATIONS_KEY);
        if (notificationsEnabled !== null) {
          dispatch({ 
            type: 'SET_CREDIT_NOTIFICATIONS_ENABLED', 
            payload: notificationsEnabled === 'true' 
          });
        } else {
          // Default to enabled if not set
          await AsyncStorage.setItem(CREDIT_NOTIFICATIONS_KEY, 'true');
        }
        
        // Load low credit threshold
        const savedThreshold = await AsyncStorage.getItem(LOW_CREDIT_THRESHOLD_KEY);
        if (savedThreshold) {
          dispatch({ 
            type: 'SET_LOW_CREDIT_THRESHOLD', 
            payload: parseInt(savedThreshold, 10) 
          });
        } else {
          // Set default threshold
          await AsyncStorage.setItem(LOW_CREDIT_THRESHOLD_KEY, DEFAULT_CREDIT_THRESHOLD.toString());
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Save AI model tier when it changes
  useEffect(() => {
    saveAIModelTier(state.aiModel.tier);
  }, [state.aiModel.tier]);
  
  // Save user knowledge files when they change
  useEffect(() => {
    saveUserDocuments(state.knowledge.userDocuments);
  }, [state.knowledge.userDocuments]);
  
  // Save user knowledge enabled setting when it changes
  useEffect(() => {
    saveUserKnowledgeEnabled(state.knowledge.userKnowledgeEnabled);
  }, [state.knowledge.userKnowledgeEnabled]);
  
  // Save AI credits when they change
  useEffect(() => {
    if (state.credits.aiCredits !== null) {
      saveAICredits(state.credits.aiCredits);
      
      // Check if credits are low and show warning if needed
      checkLowCredits(state, dispatch);
    }
  }, [state.credits.aiCredits]);
  
  // Save credit notification preferences when they change
  useEffect(() => {
    const saveNotificationPreferences = async () => {
      try {
        await AsyncStorage.setItem(CREDIT_NOTIFICATIONS_KEY, state.credits.creditNotificationsEnabled.toString());
      } catch (error) {
        console.error('Error saving credit notification preferences:', error);
      }
    };
    
    saveNotificationPreferences();
  }, [state.credits.creditNotificationsEnabled]);
  
  // Save low credit threshold when it changes
  useEffect(() => {
    const saveThreshold = async () => {
      try {
        await AsyncStorage.setItem(LOW_CREDIT_THRESHOLD_KEY, state.credits.lowCreditThreshold.toString());
        
        // Check if credits are now low based on new threshold
        checkLowCredits(state, dispatch);
      } catch (error) {
        console.error('Error saving low credit threshold:', error);
      }
    };
    
    saveThreshold();
  }, [state.credits.lowCreditThreshold]);
  
  // Save development mode when it changes
  useEffect(() => {
    saveDevelopmentMode(state.aiModel.developmentMode);
  }, [state.aiModel.developmentMode]);
  
  // Value to be provided to consumers
  const value = {
    state,
    dispatch,
    appContext,
    
    // Helper functions
    showToast: (message) => {
      dispatch({ type: 'SHOW_TOAST', payload: message });
      
      // Auto-hide after 2 seconds
      setTimeout(() => {
        dispatch({ type: 'HIDE_TOAST' });
      }, 2000);
    },
    
    // Reset goal session
    resetGoalSession: () => {
      dispatch({ type: 'RESET_GOAL_SESSION' });
    },
    
    // Set AI model tier
    setAIModelTier: async (tier) => {
      try {
        // In development mode or if tier is available, update it
        if (state.aiModel.developmentMode || state.aiModel.availableTiers.includes(tier)) {
          await saveAIModelTier(tier);
          dispatch({ type: 'SET_AI_MODEL_TIER', payload: tier });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error setting AI model tier:', error);
        return false;
      }
    },
    
    // Toggle development mode
    toggleDevelopmentMode: async () => {
      if (!__DEV__) return false;
      
      try {
        const newMode = !state.aiModel.developmentMode;
        
        // Save to AsyncStorage
        await saveDevelopmentMode(newMode);
        
        // Update state
        dispatch({ type: 'SET_DEVELOPMENT_MODE', payload: newMode });
        
        // Update available tiers based on development mode
        const availableTiers = getAvailableTiers(state.credits.subscriptionStatus, newMode);
        dispatch({ type: 'SET_AVAILABLE_TIERS', payload: availableTiers });
        
        // Show toast message
        dispatch({ type: 'SHOW_TOAST', payload: `Development Mode ${newMode ? 'Enabled' : 'Disabled'}` });
        
        return true;
      } catch (error) {
        console.error('Error toggling development mode:', error);
        return false;
      }
    },
    
    // Get available AI model tiers
    getAvailableTiers: () => {
      return getAvailableTiers(state.credits.subscriptionStatus, state.aiModel.developmentMode);
    },
    
    // Get storage quota for current tier
    getStorageQuota: (tier = state.aiModel.tier) => {
      return getStorageQuota(tier);
    },
    
    // Get document limit for current tier
    getDocumentLimit: (tier = state.aiModel.tier) => {
      return getDocumentLimit(tier);
    },
    
    // Check if user has enough credits for the operation
    checkAICredits: (tier = 'guide') => {
      // In development mode, always return true
      if (state.aiModel.developmentMode) {
        return true;
      }
      
      if (state.credits.subscriptionStatus === 'unlimited') {
        return true; // Unlimited plan has unlimited credits
      }
      
      // Get the tier's remaining credits
      const tierCredits = state.aiModel.tierCredits[tier] || 0;
      
      // Get credit cost based on model type
      const creditCost = getCreditCost(tier);
      
      // Check if user has enough credits left
      if (tierCredits < creditCost) {
        // Show zero credit modal if exactly 0 credits
        if (tierCredits === 0) {
          dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { modal: 'showZeroCreditModal', visible: true } });
        } else {
          // Show low credit modal
          dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { modal: 'showLowCreditModal', visible: true } });
        }
        return false;
      }
      
      return true;
    },
    
    // Deduct AI credits
    deductAICredits: (tier = 'guide') => {
      // In development mode, don't deduct credits
      if (state.aiModel.developmentMode) {
        return true;
      }
      
      // Don't deduct for unlimited subscription
      if (state.credits.subscriptionStatus === 'unlimited') {
        return true;
      }
      
      // Calculate credit cost based on model type
      const creditCost = getCreditCost(tier);
      
      // Store the current credits before deduction
      const previousCredits = state.credits.aiCredits;
      const previousTierCredits = state.aiModel.tierCredits[tier] || 0;
      
      // Calculate new credits after deduction
      const newCredits = Math.max(0, previousCredits - creditCost);
      const newTierCredits = Math.max(0, previousTierCredits - creditCost);
      
      // Update global credits
      dispatch({ type: 'SET_AI_CREDITS', payload: newCredits });
      
      // Update tier-specific credits
      dispatch({ 
        type: 'UPDATE_TIER_CREDIT', 
        payload: { 
          tier: tier, 
          credits: newTierCredits 
        } 
      });
      
      return true;
    },
    
    // Add credits
    addAICredits: (amount = 5, tier = null) => {
      // Update global credits
      const newCredits = state.credits.aiCredits + amount;
      dispatch({ type: 'SET_AI_CREDITS', payload: newCredits });
      
      // If a specific tier is provided, update only that tier
      if (tier && state.aiModel.availableTiers.includes(tier)) {
        const tierCredits = state.aiModel.tierCredits[tier] || 0;
        dispatch({ 
          type: 'UPDATE_TIER_CREDIT', 
          payload: { 
            tier: tier, 
            credits: tierCredits + amount 
          } 
        });
      } else {
        // Otherwise update all available tiers
        const updatedTierCredits = { ...state.aiModel.tierCredits };
        
        for (const t of state.aiModel.availableTiers) {
          updatedTierCredits[t] = (updatedTierCredits[t] || 0) + amount;
        }
        
        dispatch({ type: 'SET_TIER_CREDITS', payload: updatedTierCredits });
      }
      
      return true;
    },
    
    // Get credits for a specific tier
    getTierCredits: (tier = 'guide') => {
      return state.aiModel.tierCredits[tier] || 0;
    },
    
    // Get all tier credits
    getAllTierCredits: () => {
      return state.aiModel.tierCredits;
    }
  };
  
  return (
    <AIAssistantContext.Provider value={value}>
      {children}
    </AIAssistantContext.Provider>
  );
};

// Custom hook to use the AI Assistant context
export const useAIAssistant = () => {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistant must be used within an AIAssistantProvider');
  }
  return context;
};

export default AIAssistantContext;