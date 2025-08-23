// src/services/SimpleCleanupService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * SimpleCleanupService - Direct cleanup for orphaned data
 * When you have 0 goals but still have milestones/tasks
 */
class SimpleCleanupService {
  static STORAGE_KEYS = {
    GOALS: 'goals',
    MILESTONES: 'milestones', 
    TASKS: 'tasks',
    MILESTONE_GOAL_LINK_MAP: 'milestoneGoalLinkMap'
  };

  /**
   * Nuclear option: If no goals exist, clear everything
   */
  static async clearAllDataIfNoGoals() {
    console.log('[SimpleCleanup] Starting nuclear cleanup...');
    
    try {
      // Load current data
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

      console.log(`[SimpleCleanup] Current data: ${goals.length} goals, ${milestones.length} milestones, ${tasks.length} tasks`);

      // If no goals exist, everything else should be empty
      if (goals.length === 0) {
        console.log('[SimpleCleanup] No goals found - clearing all related data');
        
        // Log what we're removing
        if (milestones.length > 0) {
          console.log(`[SimpleCleanup] Removing ${milestones.length} orphaned milestones:`);
          milestones.forEach(p => console.log(`  - "${p.title}" (${p.id})`));
        }
        
        if (tasks.length > 0) {
          console.log(`[SimpleCleanup] Removing ${tasks.length} orphaned tasks:`);
          tasks.forEach(t => console.log(`  - "${t.name || t.title}" (${t.id}, milestoneId: ${t.milestoneId})`));
        }

        if (Object.keys(linkMap).length > 0) {
          console.log(`[SimpleCleanup] Removing ${Object.keys(linkMap).length} link map entries`);
        }

        // Clear everything except goals (which is already empty)
        await Promise.all([
          AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONES, JSON.stringify([])),
          AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify([])),
          AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, JSON.stringify({}))
        ]);

        console.log('[SimpleCleanup] Nuclear cleanup completed');
        
        return {
          success: true,
          action: 'nuclear_cleanup',
          removed: {
            milestones: milestones.length,
            tasks: tasks.length,
            linkMapEntries: Object.keys(linkMap).length
          },
          finalCounts: {
            goals: 0,
            milestones: 0,
            tasks: 0,
            linkMapEntries: 0
          }
        };
      } else {
        console.log(`[SimpleCleanup] ${goals.length} goals exist - skipping nuclear cleanup`);
        return {
          success: true,
          action: 'no_cleanup_needed',
          message: `${goals.length} goals exist, cleanup not needed`
        };
      }

    } catch (error) {
      console.error('[SimpleCleanup] Error during nuclear cleanup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Show what would be cleaned up without actually doing it
   */
  static async previewCleanup() {
    try {
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

      return {
        current: {
          goals: goals.length,
          milestones: milestones.length,
          tasks: tasks.length,
          linkMapEntries: Object.keys(linkMap).length
        },
        wouldRemove: goals.length === 0 ? {
          milestones: milestones.length,
          tasks: tasks.length,
          linkMapEntries: Object.keys(linkMap).length
        } : null,
        needsCleanup: goals.length === 0 && (milestones.length > 0 || tasks.length > 0 || Object.keys(linkMap).length > 0)
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default SimpleCleanupService;