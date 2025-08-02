// src/utils/AutoCleanupOrphanedProjects.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Automatically clean up projects without valid goals
 * This runs silently in the background whenever data is loaded
 */

const autoCleanupOrphanedProjects = async () => {
  try {
    // Get current data
    const projectsJson = await AsyncStorage.getItem('projects');
    const goalsJson = await AsyncStorage.getItem('goals');
    
    if (!projectsJson) {
      return { cleaned: false, message: 'No projects to clean' };
    }
    
    // Parse data
    const allProjects = JSON.parse(projectsJson);
    const goals = goalsJson ? JSON.parse(goalsJson) : [];
    
    if (!Array.isArray(allProjects) || !Array.isArray(goals)) {
      return { cleaned: false, message: 'Invalid data format' };
    }
    
    // Get valid goal IDs
    const validGoalIds = goals.map(g => g.id);
    
    // Filter projects - only keep those with valid goals
    const validProjects = allProjects.filter(project => {
      // Keep only projects that have a goalId AND that goalId exists
      return project.goalId && validGoalIds.includes(project.goalId);
    });
    
    // Check if we need to clean up
    if (validProjects.length === allProjects.length) {
      return { cleaned: false, message: 'No cleanup needed' };
    }
    
    // Save cleaned projects
    await AsyncStorage.setItem('projects', JSON.stringify(validProjects));
    
    const removedCount = allProjects.length - validProjects.length;
    
    // Log the cleanup for debugging
    console.log(`Auto-cleaned ${removedCount} orphaned projects`);
    
    return {
      cleaned: true,
      removedCount,
      remainingCount: validProjects.length,
      message: `Cleaned ${removedCount} orphaned projects`
    };
  } catch (error) {
    console.error('Error in auto cleanup:', error);
    return { cleaned: false, error: error.message };
  }
};

// Export the cleanup function
export { autoCleanupOrphanedProjects };

// Export a wrapper that can be called from AppContext
export const autoCleanup = autoCleanupOrphanedProjects;