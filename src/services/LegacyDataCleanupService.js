// src/services/LegacyDataCleanupService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * LegacyDataCleanupService - Cleans up orphaned data from the old dual-storage system
 * 
 * This service removes:
 * - Embedded tasks from projects (projects[].tasks arrays)
 * - Orphaned projects without goals
 * - Orphaned tasks without projects
 * - Inconsistent link map entries
 */
class LegacyDataCleanupService {
  static STORAGE_KEYS = {
    GOALS: 'goals',
    PROJECTS: 'projects', 
    TASKS: 'tasks',
    PROJECT_GOAL_LINK_MAP: 'projectGoalLinkMap'
  };

  /**
   * Comprehensive cleanup of all orphaned data
   */
  static async cleanupAllOrphanedData() {
    console.log('[LegacyDataCleanup] Starting comprehensive data cleanup...');
    
    try {
      // Load all data
      const [goalsJson, projectsJson, tasksJson, linkMapJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(this.STORAGE_KEYS.PROJECTS),
        AsyncStorage.getItem(this.STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP)
      ]);

      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const projects = projectsJson ? JSON.parse(projectsJson) : [];
      const tasks = tasksJson ? JSON.parse(tasksJson) : [];
      const linkMap = linkMapJson ? JSON.parse(linkMapJson) : {};

      console.log(`[LegacyDataCleanup] Loaded: ${goals.length} goals, ${projects.length} projects, ${tasks.length} tasks`);

      // Step 1: Remove embedded tasks from all projects
      const cleanedProjects = projects.map(project => {
        const hadEmbeddedTasks = project.tasks && Array.isArray(project.tasks) && project.tasks.length > 0;
        if (hadEmbeddedTasks) {
          console.log(`[LegacyDataCleanup] Removing ${project.tasks.length} embedded tasks from project "${project.title}"`);
          const { tasks, ...cleanedProject } = project;
          return cleanedProject;
        }
        return project;
      });

      // Step 2: Remove orphaned projects (projects without valid goals)
      const validGoalIds = new Set(goals.map(g => g.id));
      const validProjects = cleanedProjects.filter(project => {
        const hasValidGoal = project.goalId && validGoalIds.has(project.goalId);
        if (!hasValidGoal) {
          console.log(`[LegacyDataCleanup] Removing orphaned project "${project.title}" (goal: ${project.goalId})`);
        }
        return hasValidGoal;
      });

      // Step 3: Remove orphaned tasks (tasks without valid projects)
      const validProjectIds = new Set(validProjects.map(p => p.id));
      console.log(`[LegacyDataCleanup] Valid project IDs: ${Array.from(validProjectIds).join(', ')}`);
      
      const validTasks = tasks.filter(task => {
        const hasValidProject = task.projectId && validProjectIds.has(task.projectId);
        if (!hasValidProject) {
          console.log(`[LegacyDataCleanup] Removing orphaned task "${task.name || task.title}" (projectId: ${task.projectId}, exists: ${validProjectIds.has(task.projectId)})`);
        }
        return hasValidProject;
      });
      
      // If no projects exist, remove ALL tasks
      if (validProjects.length === 0 && tasks.length > 0) {
        console.log(`[LegacyDataCleanup] No projects exist - removing all ${tasks.length} tasks`);
        tasks.forEach(task => {
          console.log(`[LegacyDataCleanup] Removing task "${task.name || task.title}" (projectId: ${task.projectId})`);
        });
      }

      // Step 4: Clean up link map
      const cleanedLinkMap = {};
      Object.entries(linkMap).forEach(([projectId, goalId]) => {
        const projectExists = validProjectIds.has(projectId);
        const goalExists = validGoalIds.has(goalId);
        
        if (projectExists && goalExists) {
          cleanedLinkMap[projectId] = goalId;
        } else {
          console.log(`[LegacyDataCleanup] Removing invalid link map entry: ${projectId} -> ${goalId}`);
        }
      });

      // Step 5: Calculate cleanup summary
      const cleanup = {
        projectsWithEmbeddedTasksRemoved: projects.filter(p => p.tasks && Array.isArray(p.tasks) && p.tasks.length > 0).length,
        orphanedProjectsRemoved: cleanedProjects.length - validProjects.length,
        orphanedTasksRemoved: tasks.length - validTasks.length,
        linkMapEntriesRemoved: Object.keys(linkMap).length - Object.keys(cleanedLinkMap).length
      };

      console.log('[LegacyDataCleanup] Cleanup Summary:');
      console.log(`- Removed embedded tasks from ${cleanup.projectsWithEmbeddedTasksRemoved} projects`);
      console.log(`- Removed ${cleanup.orphanedProjectsRemoved} orphaned projects`);
      console.log(`- Removed ${cleanup.orphanedTasksRemoved} orphaned tasks`);
      console.log(`- Removed ${cleanup.linkMapEntriesRemoved} invalid link map entries`);

      // Step 6: Save cleaned data back to storage
      await Promise.all([
        AsyncStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(goals)),
        AsyncStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(validProjects)),
        AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(validTasks)),
        AsyncStorage.setItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, JSON.stringify(cleanedLinkMap))
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
          projects: validProjects.length,
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
      const projectsJson = await AsyncStorage.getItem(this.STORAGE_KEYS.PROJECTS);
      const projects = projectsJson ? JSON.parse(projectsJson) : [];
      
      const projectsWithEmbeddedTasks = projects.filter(p => 
        p.tasks && Array.isArray(p.tasks) && p.tasks.length > 0
      );

      return {
        needsCleanup: projectsWithEmbeddedTasks.length > 0,
        projectsWithEmbeddedTasks: projectsWithEmbeddedTasks.length
      };
    } catch (error) {
      console.error('[LegacyDataCleanup] Error checking cleanup needs:', error);
      return { needsCleanup: false, error: error.message };
    }
  }
}

export default LegacyDataCleanupService;