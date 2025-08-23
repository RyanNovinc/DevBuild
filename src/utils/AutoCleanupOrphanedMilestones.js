// src/utils/AutoCleanupOrphanedMilestones.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Automatically clean up milestones without valid goals
 * This runs silently in the background whenever data is loaded
 */

const autoCleanupOrphanedMilestones = async () => {
  try {
    // Get current data
    const milestonesJson = await AsyncStorage.getItem('milestones');
    const goalsJson = await AsyncStorage.getItem('goals');
    
    if (!milestonesJson) {
      return { cleaned: false, message: 'No milestones to clean' };
    }
    
    // Parse data
    const allMilestones = JSON.parse(milestonesJson);
    const goals = goalsJson ? JSON.parse(goalsJson) : [];
    
    if (!Array.isArray(allMilestones) || !Array.isArray(goals)) {
      return { cleaned: false, message: 'Invalid data format' };
    }
    
    // Get valid goal IDs
    const validGoalIds = goals.map(g => g.id);
    
    // Filter milestones - keep those with valid goals OR standalone milestones (flexible hierarchy)
    const validMilestones = allMilestones.filter(milestone => {
      // Keep milestones that have a valid goalId OR are standalone (no goalId)
      return !milestone.goalId || validGoalIds.includes(milestone.goalId);
    });
    
    // Check if we need to clean up
    if (validMilestones.length === allMilestones.length) {
      return { cleaned: false, message: 'No cleanup needed' };
    }
    
    // Save cleaned milestones
    await AsyncStorage.setItem('milestones', JSON.stringify(validMilestones));
    
    const removedCount = allMilestones.length - validMilestones.length;
    
    // Log the cleanup for debugging
    console.log(`Auto-cleaned ${removedCount} invalid milestones (preserving standalone)`);
    
    return {
      cleaned: true,
      removedCount,
      remainingCount: validMilestones.length,
      message: `Cleaned ${removedCount} invalid milestones (preserved standalone)`
    };
  } catch (error) {
    console.error('Error in auto cleanup:', error);
    return { cleaned: false, error: error.message };
  }
};

// Export the cleanup function
export { autoCleanupOrphanedMilestones };

// Export a wrapper that can be called from AppContext
export const autoCleanup = autoCleanupOrphanedMilestones;