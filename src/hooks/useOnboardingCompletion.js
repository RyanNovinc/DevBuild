// src/hooks/useOnboardingCompletion.js
import { useState, useCallback, useRef } from 'react';
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
  const progressIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // Smooth progress animation function
  const animateProgress = useCallback((targetProgress, duration = 2000) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    const startProgress = progress;
    const progressDiff = targetProgress - startProgress;
    const startTime = Date.now();
    startTimeRef.current = startTime;
    
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation (ease-out)
      const easedProgress = 1 - Math.pow(1 - progressRatio, 3);
      const currentProgress = Math.round(startProgress + (progressDiff * easedProgress));
      
      setProgress(currentProgress);
      
      if (progressRatio >= 1) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, 16); // ~60fps
  }, [progress]);

  const updateProgress = useCallback((newState, progressValue) => {
    setState(newState);
    
    // Use smooth animation for progress updates
    if (newState === ONBOARDING_STATES.PROCESSING) {
      // Start from 0% and animate to target over minimum 2 seconds
      setProgress(0);
      animateProgress(progressValue, 500); // Quick start
    } else if (newState === ONBOARDING_STATES.COMPLETED) {
      // Ensure minimum 2 seconds total time
      const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
      const remainingTime = Math.max(2000 - elapsed, 500); // At least 500ms for final animation
      animateProgress(100, remainingTime);
    } else {
      // For intermediate states, animate smoothly but faster
      animateProgress(progressValue, 400);
    }
    
    console.log(`🎯 Onboarding Progress: ${newState} (${progressValue}%)`);
  }, [animateProgress]);

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
    // Clear progress animation
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  return {
    state,
    error,
    progress,
    completeOnboarding,
    reset,
    cleanup,
    isProcessing: state !== ONBOARDING_STATES.IDLE && state !== ONBOARDING_STATES.COMPLETED && state !== ONBOARDING_STATES.ERROR,
    isCompleted: state === ONBOARDING_STATES.COMPLETED,
    hasError: state === ONBOARDING_STATES.ERROR
  };
};