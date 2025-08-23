// src/context/AppContextUpdater.js
import React, { useEffect, useCallback } from 'react';
import { useAppContext } from './AppContext';
import DocumentService from '../services/DocumentService';
import AppSummaryService from '../services/AppSummaryService';

/**
 * Component that monitors app context changes and updates the system document
 * This component doesn't render anything - it just handles the background sync
 */
const AppContextUpdater = () => {
  const appContext = useAppContext();
  const { 
    goals, 
    milestones, 
    tasks, 
    settings, 
    userCountry,
    refreshCounter 
  } = appContext;
  
  // Create a function to update the app context summary
  const updateAppContextSummary = useCallback(async () => {
    try {
      console.log('[AppContextUpdater] Generating app context summary...');
      
      // Ensure we have valid data before proceeding
      if (!goals && !milestones && !tasks) {
        console.log('[AppContextUpdater] No app data available yet, skipping summary generation');
        return false;
      }
      
      // Log data sizes for debugging
      console.log(`[AppContextUpdater] Data: ${goals?.length || 0} goals, ${milestones?.length || 0} milestones, ${tasks?.length || 0} tasks`);
      
      // Generate summary from current app context
      const appData = {
        goals: goals || [],
        milestones: milestones || [],
        tasks: tasks || [],
        settings: settings || {},
        userCountry: userCountry,
        // Specifically exclude todos and timeblocks as requested
      };
      
      const summary = await AppSummaryService.generateAppSummary(appData);
      
      // Update the system document
      await DocumentService.updateAppContextDocument(summary);
      console.log('[AppContextUpdater] App context summary updated successfully');
      return true;
    } catch (error) {
      console.error('[AppContextUpdater] Failed to update app context summary:', error);
      return false;
    }
  }, [goals, milestones, tasks, settings, userCountry]);
  
  // Run an immediate update when the component mounts (after data is loaded)
  useEffect(() => {
    // Skip if data is still loading
    if (appContext.isLoading) {
      console.log('[AppContextUpdater] App context still loading, deferring initial summary generation');
      return;
    }
    
    console.log('[AppContextUpdater] Component mounted, initiating immediate summary generation');
    
    // Run immediately without delay
    updateAppContextSummary().then(success => {
      console.log(`[AppContextUpdater] Initial summary generation ${success ? 'successful' : 'failed'}`);
    });
    
    // Then set up periodic update as a safety net
    const intervalTimer = setInterval(() => {
      updateAppContextSummary();
    }, 15 * 60 * 1000); // Every 15 minutes
    
    return () => {
      clearInterval(intervalTimer);
    };
  }, [updateAppContextSummary, appContext.isLoading]);
  
  // Update the summary when important app data changes
  useEffect(() => {
    // Don't run on first render when data might still be loading
    if (appContext.isLoading) {
      return;
    }
    
    console.log('[AppContextUpdater] Detected app data change, scheduling summary update');
    
    // Use setTimeout to avoid blocking UI and to batch rapid changes
    const timerId = setTimeout(() => {
      updateAppContextSummary().then(success => {
        console.log(`[AppContextUpdater] Data change summary update ${success ? 'successful' : 'failed'}`);
      });
    }, 1000); // Wait 1 second after changes stop
    
    return () => clearTimeout(timerId);
  }, [
    goals, 
    milestones, 
    tasks, 
    settings?.userProfile, 
    settings?.lifeDirection,
    refreshCounter, // Also update when refresh counter changes
    updateAppContextSummary,
    appContext.isLoading
  ]);
  
  // This component doesn't render anything
  return null;
};

export default AppContextUpdater;