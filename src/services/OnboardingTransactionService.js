// src/services/OnboardingTransactionService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingService from './OnboardingService';
import { ONBOARDING_STATES } from '../hooks/useOnboardingCompletion';

export class OnboardingTransactionService {
  constructor(progressCallback, appContextFunctions = {}) {
    this.progressCallback = progressCallback;
    this.rollbackActions = [];
    this.isRollingBack = false;
    this.appContextFunctions = appContextFunctions; // updateAppSetting, refreshData functions
  }

  // Add rollback action to the stack
  addRollbackAction(action) {
    if (!this.isRollingBack) {
      this.rollbackActions.push(action);
    }
  }

  // Execute the complete onboarding transaction atomically
  async executeTransaction(domain, goal, country = 'australia') {
    console.log('📦 Starting atomic onboarding transaction');

    try {
      // Step 1: Create onboarding data
      this.progressCallback?.(ONBOARDING_STATES.CREATING_DATA, 30);
      const dataResult = await this.createOnboardingData(domain, goal);

      // Step 2: Update app settings
      this.progressCallback?.(ONBOARDING_STATES.UPDATING_SETTINGS, 50);
      await this.updateAppSettings(domain, goal, country);

      // Step 3: Set storage flags
      this.progressCallback?.(ONBOARDING_STATES.REFRESHING_CONTEXT, 70);
      await this.updateStorageFlags();

      // Step 4: Refresh AppContext data to load newly created goals/projects/tasks
      this.progressCallback?.(ONBOARDING_STATES.PREPARING_APP, 85);
      await this.refreshAppContextData();

      // Step 5: Final preparations
      this.progressCallback?.(ONBOARDING_STATES.PREPARING_APP, 95);
      await this.finalizeOnboarding();

      console.log('✅ Atomic transaction completed successfully');
      return {
        success: true,
        data: dataResult
      };

    } catch (error) {
      console.error('❌ Transaction failed, rolling back:', error);
      await this.rollback();
      throw error;
    }
  }

  // Step 1: Create onboarding data using existing service
  async createOnboardingData(domain, goal) {
    console.log('📝 Creating onboarding data');

    try {
      const result = await OnboardingService.createOnboardingData(domain, goal);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create onboarding data');
      }

      // Add rollback action
      this.addRollbackAction(async () => {
        console.log('🔄 Rolling back onboarding data creation');
        // Note: OnboardingService doesn't have rollback, but we could add cleanup here
        // For now, we'll rely on the fact that the app won't navigate if settings aren't updated
      });

      return result;
    } catch (error) {
      console.error('❌ Failed to create onboarding data:', error);
      throw error;
    }
  }

  // Step 2: Update app settings atomically using AppContext
  async updateAppSettings(domain, goal, country) {
    console.log('⚙️ Updating app settings via AppContext');

    const settingsToUpdate = {
      onboardingCompleted: true,
      themeColor: '#1e3a8a',
      selectedDomain: domain.name,
      selectedCountry: country,
      selectedGoal: {
        domain: domain.name,
        goalName: goal.name,
        projects: goal.projects || []
      }
    };

    const { updateAppSetting } = this.appContextFunctions;
    
    if (!updateAppSetting) {
      console.warn('⚠️ updateAppSetting function not available, falling back to AsyncStorage');
      return this.updateAppSettingsFallback(settingsToUpdate);
    }

    try {
      // Store original settings for rollback
      const originalSettings = {};
      
      // Get current settings state for rollback
      for (const key of Object.keys(settingsToUpdate)) {
        try {
          const originalValue = await AsyncStorage.getItem(`appSetting_${key}`);
          originalSettings[key] = originalValue;
        } catch (error) {
          console.warn(`Could not get original value for ${key}:`, error);
          originalSettings[key] = null;
        }
      }

      // Add rollback action BEFORE making changes
      this.addRollbackAction(async () => {
        console.log('🔄 Rolling back app settings via AppContext');
        for (const [key, originalValue] of Object.entries(originalSettings)) {
          try {
            if (updateAppSetting) {
              const value = originalValue ? JSON.parse(originalValue) : null;
              await updateAppSetting(key, value);
            }
          } catch (error) {
            console.warn(`Failed to rollback setting ${key}:`, error);
          }
        }
      });

      // Update all settings using AppContext functions
      for (const [key, value] of Object.entries(settingsToUpdate)) {
        await updateAppSetting(key, value);
        console.log(`✅ Updated ${key} via AppContext`);
      }

      console.log('✅ App settings updated successfully via AppContext');
    } catch (error) {
      console.error('❌ Failed to update app settings via AppContext:', error);
      throw error;
    }
  }

  // Fallback method for direct AsyncStorage updates
  async updateAppSettingsFallback(settingsToUpdate) {
    console.log('📦 Fallback: Updating app settings via AsyncStorage');
    
    try {
      // Store original settings for rollback
      const originalSettings = {};
      
      for (const [key, value] of Object.entries(settingsToUpdate)) {
        try {
          const originalValue = await AsyncStorage.getItem(`appSetting_${key}`);
          originalSettings[key] = originalValue;
        } catch (error) {
          console.warn(`Could not get original value for ${key}:`, error);
          originalSettings[key] = null;
        }
      }

      // Add rollback action BEFORE making changes
      this.addRollbackAction(async () => {
        console.log('🔄 Rolling back app settings (fallback)');
        for (const [key, originalValue] of Object.entries(originalSettings)) {
          try {
            if (originalValue === null) {
              await AsyncStorage.removeItem(`appSetting_${key}`);
            } else {
              await AsyncStorage.setItem(`appSetting_${key}`, originalValue);
            }
          } catch (error) {
            console.warn(`Failed to rollback setting ${key}:`, error);
          }
        }
      });

      // Update all settings
      for (const [key, value] of Object.entries(settingsToUpdate)) {
        await AsyncStorage.setItem(`appSetting_${key}`, JSON.stringify(value));
      }

      console.log('✅ App settings updated successfully (fallback)');
    } catch (error) {
      console.error('❌ Failed to update app settings (fallback):', error);
      throw error;
    }
  }

  // Step 3: Update storage flags
  async updateStorageFlags() {
    console.log('🏁 Setting storage flags');

    try {
      // Store original values for rollback
      const originalDirectFromOnboarding = await AsyncStorage.getItem('directFromOnboarding');
      
      this.addRollbackAction(async () => {
        console.log('🔄 Rolling back storage flags');
        try {
          if (originalDirectFromOnboarding === null) {
            await AsyncStorage.removeItem('directFromOnboarding');
          } else {
            await AsyncStorage.setItem('directFromOnboarding', originalDirectFromOnboarding);
          }
        } catch (error) {
          console.warn('Failed to rollback storage flags:', error);
        }
      });

      // Set the flag to indicate we're coming directly from onboarding
      await AsyncStorage.setItem('directFromOnboarding', 'true');

      console.log('✅ Storage flags updated successfully');
    } catch (error) {
      console.error('❌ Failed to update storage flags:', error);
      throw error;
    }
  }

  // Step 4: Refresh AppContext data to load newly created content
  async refreshAppContextData() {
    console.log('🔄 Refreshing AppContext data');

    try {
      const { refreshData } = this.appContextFunctions;
      if (refreshData && typeof refreshData === 'function') {
        console.log('📊 Loading newly created goals, projects, and tasks...');
        
        // Debug: Check what's actually in AsyncStorage before refresh
        try {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const goalsData = await AsyncStorage.getItem('goals');
          const projectsData = await AsyncStorage.getItem('projects');
          const tasksData = await AsyncStorage.getItem('tasks');
          
          console.log('🔍 AsyncStorage before refresh:');
          console.log(`🎯 Goals: ${goalsData ? JSON.parse(goalsData).length : 0} items`);
          console.log(`📁 Projects: ${projectsData ? JSON.parse(projectsData).length : 0} items`);
          console.log(`✅ Tasks: ${tasksData ? JSON.parse(tasksData).length : 0} items`);
        } catch (debugError) {
          console.log('🔍 AsyncStorage debug failed:', debugError);
        }
        
        await refreshData();
        console.log('✅ AppContext data refresh completed - goals/projects/tasks should now be visible');
      } else {
        console.warn('⚠️ refreshData function not available');
        throw new Error('refreshData function is required for proper onboarding completion');
      }
    } catch (error) {
      console.error('❌ Failed to refresh AppContext data:', error);
      throw error;
    }
  }

  // Step 5: Final preparations  
  async finalizeOnboarding() {
    console.log('🎉 Finalizing onboarding');

    try {
      // Give the system time to process all the changes
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('✅ Onboarding finalized successfully');
    } catch (error) {
      console.error('❌ Failed to finalize onboarding:', error);
      throw error;
    }
  }

  // Rollback all changes if something fails
  async rollback() {
    if (this.isRollingBack) {
      console.warn('⚠️ Already rolling back, skipping duplicate rollback');
      return;
    }

    this.isRollingBack = true;
    console.log('🔄 Rolling back transaction');

    // Execute rollback actions in reverse order
    const rollbackActions = [...this.rollbackActions].reverse();
    
    for (const action of rollbackActions) {
      try {
        await action();
      } catch (error) {
        console.error('❌ Rollback action failed:', error);
        // Continue with other rollback actions even if one fails
      }
    }

    this.rollbackActions = [];
    this.isRollingBack = false;
    console.log('✅ Rollback completed');
  }
}