// src/utils/StartupDataCheck.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { initializeFeedbackTable } from '../lib/supabase';

/**
 * Automatically check and fix data integrity on app startup
 * This will run silently in the background unless major issues are found
 */

/**
 * Clean up old backup files to prevent storage bloat
 * Keeps only the most recent 3 backup files
 */
const cleanupOldBackups = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const backupKeys = allKeys.filter(key => key.startsWith('backup_startup_'));
    
    if (backupKeys.length <= 3) {
      console.log(`📁 Found ${backupKeys.length} backup files (within limit)`);
      return;
    }
    
    // Sort by timestamp (newest first)
    const sortedBackups = backupKeys.sort((a, b) => {
      const timestampA = parseInt(a.replace('backup_startup_', ''));
      const timestampB = parseInt(b.replace('backup_startup_', ''));
      return timestampB - timestampA;
    });
    
    // Keep only the 3 most recent backups
    const backupsToKeep = sortedBackups.slice(0, 3);
    const backupsToDelete = sortedBackups.slice(3);
    
    if (backupsToDelete.length > 0) {
      console.log(`🗑️ Cleaning up ${backupsToDelete.length} old backup files...`);
      await AsyncStorage.multiRemove(backupsToDelete);
      console.log(`✅ Deleted old backups, kept ${backupsToKeep.length} most recent`);
    }
  } catch (error) {
    console.warn('⚠️ Error cleaning up old backups:', error);
    // Don't throw - this is not critical
  }
};

const checkDataIntegrity = async () => {
  try {
    console.log('🔍 Starting startup data integrity check...');
    
    // First, cleanup old backup files
    await cleanupOldBackups();
    
    // Get all data
    const goalsJson = await AsyncStorage.getItem('goals');
    const milestonesJson = await AsyncStorage.getItem('milestones');
    const tasksJson = await AsyncStorage.getItem('tasks');
    
    if (!goalsJson || !milestonesJson) {
      console.log('✅ No data found, skipping integrity check');
      return { success: true, message: 'No data found' };
    }
    
    // Parse data
    const goals = JSON.parse(goalsJson);
    const milestones = JSON.parse(milestonesJson);
    const tasks = tasksJson ? JSON.parse(tasksJson) : [];
    
    if (!Array.isArray(goals) || !Array.isArray(milestones)) {
      console.warn('⚠️ Invalid data format detected');
      return { success: false, message: 'Invalid data format' };
    }
    
    // Check for orphaned milestones
    const validGoalIds = goals.map(g => g.id);
    const orphanedMilestones = milestones.filter(p => p.goalId && !validGoalIds.includes(p.goalId));
    
    // Check for orphaned tasks
    const validMilestoneIds = milestones
      .filter(p => !p.goalId || validGoalIds.includes(p.goalId))
      .map(p => p.id);
    const orphanedTasks = tasks.filter(t => t.milestoneId && !validMilestoneIds.includes(t.milestoneId));
    
    console.log(`📊 Data summary:
      - Goals: ${goals.length}
      - Milestones: ${milestones.length} (${orphanedMilestones.length} orphaned)
      - Tasks: ${tasks.length} (${orphanedTasks.length} orphaned)`);
    
    // If we found issues, fix them automatically
    if (orphanedMilestones.length > 0 || orphanedTasks.length > 0) {
      console.log('🔧 Found data issues, fixing automatically...');
      
      // Create backup with error handling
      const timestamp = new Date().getTime();
      try {
        await AsyncStorage.setItem(`backup_startup_${timestamp}`, JSON.stringify({
          goals, milestones, tasks
        }));
        console.log(`💾 Backup created: backup_startup_${timestamp}`);
      } catch (backupError) {
        console.warn('⚠️ Failed to create backup, proceeding with cleanup anyway:', backupError);
        // Continue with cleanup even if backup fails
      }
      
      // Fix orphaned milestones
      const cleanMilestones = milestones.filter(p => !p.goalId || validGoalIds.includes(p.goalId));
      
      // Get updated milestone IDs after cleaning
      const updatedMilestoneIds = cleanMilestones.map(p => p.id);
      
      // Fix orphaned tasks
      const cleanTasks = tasks.filter(t => !t.milestoneId || updatedMilestoneIds.includes(t.milestoneId));
      
      // Save cleaned data with error handling
      try {
        await AsyncStorage.setItem('milestones', JSON.stringify(cleanMilestones));
        console.log(`✅ Cleaned milestones saved (${cleanMilestones.length} remaining)`);
      } catch (error) {
        console.error('❌ Failed to save cleaned milestones:', error);
        throw new Error('Critical: Failed to save cleaned milestones');
      }
      
      if (cleanTasks.length !== tasks.length) {
        try {
          await AsyncStorage.setItem('tasks', JSON.stringify(cleanTasks));
          console.log(`✅ Cleaned tasks saved (${cleanTasks.length} remaining)`);
        } catch (error) {
          console.error('❌ Failed to save cleaned tasks:', error);
          throw new Error('Critical: Failed to save cleaned tasks');
        }
      }
      
      console.log(`✨ Successfully fixed data:
        - Removed ${orphanedMilestones.length} orphaned milestones
        - Removed ${orphanedTasks.length} orphaned tasks
        - Backup saved as backup_startup_${timestamp}`);
      
      return {
        success: true,
        message: `Fixed ${orphanedMilestones.length} orphaned milestones and ${orphanedTasks.length} orphaned tasks`,
        fixed: {
          milestones: orphanedMilestones.length,
          tasks: orphanedTasks.length
        }
      };
    } else {
      console.log('✅ Data integrity check passed - no issues found');
      return { success: true, message: 'All data is consistent' };
    }
  } catch (error) {
    console.error('❌ Error during startup data check:', error);
    return { success: false, message: error.message };
  }
};

// Initialize Supabase
const initializeSupabase = async () => {
  try {
    console.log('🔄 Initializing Supabase...');
    // Initialize feedback table
    const result = await initializeFeedbackTable();
    console.log('✅ Supabase initialization complete:', result);
    return { success: true };
  } catch (error) {
    console.error('❌ Supabase initialization error:', error);
    return { success: false, error: error.message };
  }
};

// Run the check with error handling
export const runStartupDataCheck = async () => {
  try {
    // Run data integrity check
    const integrityResult = await checkDataIntegrity();
    
    // Initialize Supabase
    const supabaseResult = await initializeSupabase();
    
    // Only show alerts for significant issues
    if (!integrityResult.success) {
      Alert.alert(
        'Data Check Failed',
        'There was an issue checking your app data. Please report this if problems persist.',
        [{ text: 'OK' }]
      );
    } else if (integrityResult.fixed && (integrityResult.fixed.milestones > 0 || integrityResult.fixed.tasks > 0)) {
      // Only show alert if we fixed something significant
      console.log('Data was automatically repaired on startup');
    }
    
    return { 
      success: integrityResult.success && supabaseResult.success,
      integrityCheck: integrityResult,
      supabaseInit: supabaseResult
    };
  } catch (error) {
    console.error('Error in startup data check:', error);
    return { success: false, message: error.message };
  }
};

// Export for manual use if needed
export default checkDataIntegrity;