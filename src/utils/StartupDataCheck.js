// src/utils/StartupDataCheck.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { initializeFeedbackTable } from '../lib/supabase';

/**
 * Automatically check and fix data integrity on app startup
 * This will run silently in the background unless major issues are found
 */

const checkDataIntegrity = async () => {
  try {
    console.log('🔍 Starting startup data integrity check...');
    
    // Get all data
    const goalsJson = await AsyncStorage.getItem('goals');
    const projectsJson = await AsyncStorage.getItem('projects');
    const tasksJson = await AsyncStorage.getItem('tasks');
    
    if (!goalsJson || !projectsJson) {
      console.log('✅ No data found, skipping integrity check');
      return { success: true, message: 'No data found' };
    }
    
    // Parse data
    const goals = JSON.parse(goalsJson);
    const projects = JSON.parse(projectsJson);
    const tasks = tasksJson ? JSON.parse(tasksJson) : [];
    
    if (!Array.isArray(goals) || !Array.isArray(projects)) {
      console.warn('⚠️ Invalid data format detected');
      return { success: false, message: 'Invalid data format' };
    }
    
    // Check for orphaned projects
    const validGoalIds = goals.map(g => g.id);
    const orphanedProjects = projects.filter(p => p.goalId && !validGoalIds.includes(p.goalId));
    
    // Check for orphaned tasks
    const validProjectIds = projects
      .filter(p => !p.goalId || validGoalIds.includes(p.goalId))
      .map(p => p.id);
    const orphanedTasks = tasks.filter(t => t.projectId && !validProjectIds.includes(t.projectId));
    
    console.log(`📊 Data summary:
      - Goals: ${goals.length}
      - Projects: ${projects.length} (${orphanedProjects.length} orphaned)
      - Tasks: ${tasks.length} (${orphanedTasks.length} orphaned)`);
    
    // If we found issues, fix them automatically
    if (orphanedProjects.length > 0 || orphanedTasks.length > 0) {
      console.log('🔧 Found data issues, fixing automatically...');
      
      // Create backup
      const timestamp = new Date().getTime();
      await AsyncStorage.setItem(`backup_startup_${timestamp}`, JSON.stringify({
        goals, projects, tasks
      }));
      
      // Fix orphaned projects
      const cleanProjects = projects.filter(p => !p.goalId || validGoalIds.includes(p.goalId));
      
      // Get updated project IDs after cleaning
      const updatedProjectIds = cleanProjects.map(p => p.id);
      
      // Fix orphaned tasks
      const cleanTasks = tasks.filter(t => !t.projectId || updatedProjectIds.includes(t.projectId));
      
      // Save cleaned data
      await AsyncStorage.setItem('projects', JSON.stringify(cleanProjects));
      if (cleanTasks.length !== tasks.length) {
        await AsyncStorage.setItem('tasks', JSON.stringify(cleanTasks));
      }
      
      console.log(`✨ Successfully fixed data:
        - Removed ${orphanedProjects.length} orphaned projects
        - Removed ${orphanedTasks.length} orphaned tasks
        - Backup saved as backup_startup_${timestamp}`);
      
      return {
        success: true,
        message: `Fixed ${orphanedProjects.length} orphaned projects and ${orphanedTasks.length} orphaned tasks`,
        fixed: {
          projects: orphanedProjects.length,
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
    } else if (integrityResult.fixed && (integrityResult.fixed.projects > 0 || integrityResult.fixed.tasks > 0)) {
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