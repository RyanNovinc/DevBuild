// src/hooks/useOnboardingCompletion.js
import { useState, useCallback } from 'react';
import { OnboardingTransactionService } from '../services/OnboardingTransactionService';

export const ONBOARDING_STATES = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  CREATING_DATA: 'creating_data',
  UPDATING_SETTINGS: 'updating_settings',
  REFRESHING_CONTEXT: 'refreshing_context',
  PREPARING_APP: 'preparing_app',
  COMPLETED: 'completed',
  ERROR: 'error'
};

export const useOnboardingCompletion = (appContextFunctions = {}) => {
  const [state, setState] = useState(ONBOARDING_STATES.IDLE);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback((newState, progressValue) => {
    setState(newState);
    setProgress(progressValue);
    console.log(`🎯 Onboarding Progress: ${newState} (${progressValue}%)`);
  }, []);

  const completeOnboarding = useCallback(async (domain, goal, country = 'australia') => {
    console.log('🚀 Starting onboarding completion with atomic transaction');
    
    try {
      // Reset any previous errors
      setError(null);
      updateProgress(ONBOARDING_STATES.PROCESSING, 10);

      // Create transaction service instance with AppContext functions
      const transactionService = new OnboardingTransactionService(updateProgress, appContextFunctions);

      // Execute atomic transaction
      updateProgress(ONBOARDING_STATES.CREATING_DATA, 20);
      const result = await transactionService.executeTransaction(domain, goal, country);

      updateProgress(ONBOARDING_STATES.COMPLETED, 100);
      console.log('✅ Onboarding completion successful');
      
      return result;
    } catch (err) {
      console.error('❌ Onboarding completion failed:', err);
      setError(err);
      updateProgress(ONBOARDING_STATES.ERROR, 0);
      throw err;
    }
  }, [updateProgress]);

  const reset = useCallback(() => {
    setState(ONBOARDING_STATES.IDLE);
    setError(null);
    setProgress(0);
  }, []);

  return {
    state,
    error,
    progress,
    completeOnboarding,
    reset,
    isProcessing: state !== ONBOARDING_STATES.IDLE && state !== ONBOARDING_STATES.COMPLETED && state !== ONBOARDING_STATES.ERROR,
    isCompleted: state === ONBOARDING_STATES.COMPLETED,
    hasError: state === ONBOARDING_STATES.ERROR
  };
};