// src/services/LegacyDataCleanupService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * LegacyDataCleanupService - Cleans up orphaned data from the old dual-storage system
 * 
 * This service removes:
 * - Embedded tasks from milestones (milestones[].tasks arrays)
 * - Orphaned milestones without goals
 * - Orphaned tasks without milestones
 * - Inconsistent link map entries
 */
class LegacyDataCleanupService {
  static STORAGE_KEYS = {
    GOALS: 'goals',
    MILESTONES: 'milestones', 
    TASKS: 'tasks',
    MILESTONE_GOAL_LINK_MAP: 'milestoneGoalLinkMap'
  };

  /**
   * Comprehensive cleanup of all orphaned data
   */
  static async cleanupAllOrphanedData() {
    console.log('[LegacyDataCleanup] Starting comprehensive data cleanup...');
    
    try {
      // Load all data
      const [goalsJson, milestonesJson, tasksJson, linkMapJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONES),
        AsyncStorage.getItem(this.STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP)
      ]);

      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const milestones = milestonesJson ? JSON.parse(milestonesJson) : [];
      const tasks = tasksJson ? JSON.parse(tasksJson) : [];
      const linkMap = linkMapJson ? JSON.parse(linkMapJson) : {};

      console.log(`[LegacyDataCleanup] Loaded: ${goals.length} goals, ${milestones.length} milestones, ${tasks.length} tasks`);

      // Step 1: Remove embedded tasks from all milestones
      const cleanedMilestones = milestones.map(milestone => {
        const hadEmbeddedTasks = milestone.tasks && Array.isArray(milestone.tasks) && milestone.tasks.length > 0;
        if (hadEmbeddedTasks) {
          console.log(`[LegacyDataCleanup] Removing ${milestone.tasks.length} embedded tasks from milestone "${milestone.title}"`);
          const { tasks, ...cleanedMilestone } = milestone;
          return cleanedMilestone;
        }
        return milestone;
      });

      // Step 2: Remove orphaned milestones (milestones without valid goals)
      const validGoalIds = new Set(goals.map(g => g.id));
      const validMilestones = cleanedMilestones.filter(milestone => {
        const hasValidGoal = milestone.goalId && validGoalIds.has(milestone.goalId);
        if (!hasValidGoal) {
          console.log(`[LegacyDataCleanup] Removing orphaned milestone "${milestone.title}" (goal: ${milestone.goalId})`);
        }
        return hasValidGoal;
      });

      // Step 3: Remove orphaned tasks (tasks without valid milestones)
      const validMilestoneIds = new Set(validMilestones.map(p => p.id));
      console.log(`[LegacyDataCleanup] Valid milestone IDs: ${Array.from(validMilestoneIds).join(', ')}`);
      
      const validTasks = tasks.filter(task => {
        const hasValidMilestone = task.milestoneId && validMilestoneIds.has(task.milestoneId);
        if (!hasValidMilestone) {
          console.log(`[LegacyDataCleanup] Removing orphaned task "${task.name || task.title}" (milestoneId: ${task.milestoneId}, exists: ${validMilestoneIds.has(task.milestoneId)})`);
        }
        return hasValidMilestone;
      });
      
      // If no milestones exist, remove ALL tasks
      if (validMilestones.length === 0 && tasks.length > 0) {
        console.log(`[LegacyDataCleanup] No milestones exist - removing all ${tasks.length} tasks`);
        tasks.forEach(task => {
          console.log(`[LegacyDataCleanup] Removing task "${task.name || task.title}" (milestoneId: ${task.milestoneId})`);
        });
      }

      // Step 4: Clean up link map
      const cleanedLinkMap = {};
      Object.entries(linkMap).forEach(([milestoneId, goalId]) => {
        const milestoneExists = validMilestoneIds.has(milestoneId);
        const goalExists = validGoalIds.has(goalId);
        
        if (milestoneExists && goalExists) {
          cleanedLinkMap[milestoneId] = goalId;
        } else {
          console.log(`[LegacyDataCleanup] Removing invalid link map entry: ${milestoneId} -> ${goalId}`);
        }
      });

      // Step 5: Calculate cleanup summary
      const cleanup = {
        milestonesWithEmbeddedTasksRemoved: milestones.filter(p => p.tasks && Array.isArray(p.tasks) && p.tasks.length > 0).length,
        orphanedMilestonesRemoved: cleanedMilestones.length - validMilestones.length,
        orphanedTasksRemoved: tasks.length - validTasks.length,
        linkMapEntriesRemoved: Object.keys(linkMap).length - Object.keys(cleanedLinkMap).length
      };

      console.log('[LegacyDataCleanup] Cleanup Summary:');
      console.log(`- Removed embedded tasks from ${cleanup.milestonesWithEmbeddedTasksRemoved} milestones`);
      console.log(`- Removed ${cleanup.orphanedMilestonesRemoved} orphaned milestones`);
      console.log(`- Removed ${cleanup.orphanedTasksRemoved} orphaned tasks`);
      console.log(`- Removed ${cleanup.linkMapEntriesRemoved} invalid link map entries`);

      // Step 6: Save cleaned data back to storage
      await Promise.all([
        AsyncStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(goals)),
        AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONES, JSON.stringify(validMilestones)),
        AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(validTasks)),
        AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, JSON.stringify(cleanedLinkMap))
      ]);

      console.log('[LegacyDataCleanup] Data cleanup completed successfully');

      // Add a small delay to ensure AsyncStorage operations complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Force trigger a global data refresh by setting a cleanup flag
      await AsyncStorage.setItem('dataCleanupCompleted', Date.now().toString());

      return {
        success: true,
        cleanup,
        finalCounts: {
          goals: goals.length,
          milestones: validMilestones.length,
          tasks: validTasks.length,
          linkMapEntries: Object.keys(cleanedLinkMap).length
        }
      };

    } catch (error) {
      console.error('[LegacyDataCleanup] Error during cleanup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Quick check to see if cleanup is needed
   */
  static async needsCleanup() {
    try {
      const milestonesJson = await AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONES);
      const milestones = milestonesJson ? JSON.parse(milestonesJson) : [];
      
      const milestonesWithEmbeddedTasks = milestones.filter(p => 
        p.tasks && Array.isArray(p.tasks) && p.tasks.length > 0
      );

      return {
        needsCleanup: milestonesWithEmbeddedTasks.length > 0,
        milestonesWithEmbeddedTasks: milestonesWithEmbeddedTasks.length
      };
    } catch (error) {
      console.error('[LegacyDataCleanup] Error checking cleanup needs:', error);
      return { needsCleanup: false, error: error.message };
    }
  }
}

export default LegacyDataCleanupService;