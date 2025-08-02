// src/services/DataIntegrityService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * DataIntegrityService - Handles data integrity operations, ensuring relationships
 * between goals, projects, and tasks are maintained correctly.
 * 
 * Provides thorough logging to track operations and diagnose issues.
 */
class DataIntegrityService {
  // Storage keys - aligned with AppContext and OnboardingService
  static STORAGE_KEYS = {
    GOALS: 'goals',
    PROJECTS: 'projects',
    TASKS: 'tasks',
    PROJECT_GOAL_LINK_MAP: 'projectGoalLinkMap'
  };
  
  /**
   * Thoroughly deletes a goal and all its associated projects and tasks
   * Works with both onboarding-created and manually-created goals
   * 
   * @param {string} goalId - The ID of the goal to delete
   * @param {Object} options - Options for deletion
   * @param {boolean} options.dryRun - If true, simulates deletion without writing changes
   * @param {boolean} options.verbose - If true, provides detailed logging
   * @returns {Promise<Object>} Result object with details about the operation
   */
  static async deleteGoalCompletely(goalId, options = {}) {
    const { dryRun = false, verbose = true } = options;
    const log = verbose ? msg => console.log(`[DataIntegrityService] ${msg}`) : () => {};
    
    log(`Starting complete deletion of goal ${goalId}${dryRun ? ' (DRY RUN)' : ''}`);
    
    try {
      // STEP 1: Load all data from storage
      log('Loading all data from AsyncStorage...');
      const [goalsJson, projectsJson, tasksJson, linkMapJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(this.STORAGE_KEYS.PROJECTS),
        AsyncStorage.getItem(this.STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP)
      ]);
      
      // Parse the data with fallbacks
      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const projects = projectsJson ? JSON.parse(projectsJson) : [];
      const tasks = tasksJson ? JSON.parse(tasksJson) : [];
      const linkMap = linkMapJson ? JSON.parse(linkMapJson) : {};
      
      // STEP 2: Verify goal exists
      const goalToDelete = goals.find(g => g.id === goalId);
      if (!goalToDelete) {
        log(`ERROR: Goal ${goalId} not found in storage`);
        return {
          success: false,
          error: 'GOAL_NOT_FOUND',
          message: `Goal with ID ${goalId} not found`
        };
      }
      
      log(`Found goal to delete: "${goalToDelete.title}" (${goalId})`);
      
      // STEP 3: Find all projects linked to this goal - through ALL possible methods
      
      // Method 1: Direct goalId property
      const projectsLinkedByProperty = projects.filter(p => p.goalId === goalId);
      log(`Found ${projectsLinkedByProperty.length} projects linked by goalId property`);
      
      // Method 2: Link map
      const projectIdsFromLinkMap = Object.entries(linkMap)
        .filter(([_, linkedGoalId]) => linkedGoalId === goalId)
        .map(([projectId]) => projectId);
      log(`Found ${projectIdsFromLinkMap.length} projects linked via projectGoalLinkMap`);
      
      // Method 3: Check for goalTitle match (as fallback)
      const goalTitle = goalToDelete.title || '';
      const projectsLinkedByTitle = projects.filter(p => 
        p.goalTitle === goalTitle && !p.goalId && 
        !projectsLinkedByProperty.some(lp => lp.id === p.id) &&
        !projectIdsFromLinkMap.includes(p.id)
      );
      log(`Found ${projectsLinkedByTitle.length} projects linked only by matching goalTitle`);
      
      // Combine all methods to get ALL linked projects
      const allLinkedProjects = [
        ...projectsLinkedByProperty,
        ...projects.filter(p => projectIdsFromLinkMap.includes(p.id) && 
                              !projectsLinkedByProperty.some(lp => lp.id === p.id)),
        ...projectsLinkedByTitle
      ];
      
      // Get all linked project IDs
      const linkedProjectIds = allLinkedProjects.map(p => p.id);
      
      log(`Total projects to delete: ${allLinkedProjects.length}`);
      log(`Project IDs to delete: ${linkedProjectIds.join(', ')}`);
      
      // STEP 4: Find all tasks for these projects
      // Method 1: Direct projectId in tasks array
      const tasksLinkedByProjectId = tasks.filter(t => linkedProjectIds.includes(t.projectId));
      log(`Found ${tasksLinkedByProjectId.length} tasks linked by projectId`);
      
      // Note: No longer handling embedded tasks since we've moved to single storage
      
      // Total tasks to be affected
      const totalTasksToDelete = tasksLinkedByProjectId.length;
      log(`Total tasks to delete: ${totalTasksToDelete}`);
      
      // STEP 5: Create updated arrays (filtering out the items to delete)
      const updatedGoals = goals.filter(g => g.id !== goalId);
      const updatedProjects = projects.filter(p => !linkedProjectIds.includes(p.id));
      const updatedTasks = tasks.filter(t => !linkedProjectIds.includes(t.projectId));
      
      // Update link map
      const updatedLinkMap = { ...linkMap };
      linkedProjectIds.forEach(projectId => {
        delete updatedLinkMap[projectId];
      });
      
      // STEP 6: Create detailed report of what will be deleted
      log('=== DELETION SUMMARY ===');
      log(`- Goals: 1 (${goalToDelete.title})`);
      log(`- Projects: ${allLinkedProjects.length}`);
      log(`- Tasks: ${totalTasksToDelete}`);
      log(`- Link map entries: ${linkedProjectIds.length}`);
      
      if (allLinkedProjects.length > 0) {
        log('Projects to be deleted:');
        allLinkedProjects.forEach((p, i) => {
          const projectTaskCount = tasks.filter(t => t.projectId === p.id).length;
          log(`  ${i+1}. "${p.title}" (ID: ${p.id}) - ${projectTaskCount} tasks`);
        });
      }
      
      // STEP 7: If dry run, just return the report
      if (dryRun) {
        log('DRY RUN COMPLETE - No changes made to storage');
        return {
          success: true,
          dryRun: true,
          deleted: {
            goal: goalToDelete,
            projects: allLinkedProjects,
            projectIds: linkedProjectIds,
            taskCount: totalTasksToDelete
          }
        };
      }
      
      // STEP 8: Perform the actual deletion
      log('Performing deletion operations...');
      
      // Make a backup first
      if (verbose) {
        const backupData = {
          goals,
          projects,
          tasks,
          linkMap
        };
        await AsyncStorage.setItem('data_integrity_backup', JSON.stringify(backupData));
        log('Created backup of data before deletion');
      }
      
      // Write all updated data back to storage
      await Promise.all([
        AsyncStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals)),
        AsyncStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects)),
        AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks)),
        AsyncStorage.setItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, JSON.stringify(updatedLinkMap))
      ]);
      
      // STEP 9: Verify deletion was successful
      log('Verifying deletion...');
      const verificationResult = await this.verifyDeletion(goalId, linkedProjectIds);
      
      if (verificationResult.success) {
        log('Deletion verified successfully');
      } else {
        log(`Verification failed: ${verificationResult.message}`);
        // Try to repair if verification failed
        if (verificationResult.canRepair) {
          log('Attempting repair...');
          await this.repairDeletion(goalId, linkedProjectIds);
        }
      }
      
      log('Goal deletion completed successfully');
      return {
        success: true,
        deleted: {
          goal: goalToDelete,
          projectCount: allLinkedProjects.length,
          taskCount: totalTasksToDelete,
          verification: verificationResult
        }
      };
      
    } catch (error) {
      log(`ERROR during deletion: ${error.message}`);
      console.error('Full error:', error);
      
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }
  
  /**
   * Verifies that a goal and its projects were successfully deleted
   */
  static async verifyDeletion(goalId, projectIds) {
    try {
      // Load data from storage
      const [goalsJson, projectsJson, tasksJson, linkMapJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(this.STORAGE_KEYS.PROJECTS),
        AsyncStorage.getItem(this.STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP)
      ]);
      
      // Parse data
      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const projects = projectsJson ? JSON.parse(projectsJson) : [];
      const tasks = tasksJson ? JSON.parse(tasksJson) : [];
      const linkMap = linkMapJson ? JSON.parse(linkMapJson) : {};
      
      // Check if goal is deleted
      const goalExists = goals.some(g => g.id === goalId);
      
      // Check if projects are deleted
      const remainingProjects = projects.filter(p => projectIds.includes(p.id));
      
      // Check if tasks for these projects are deleted
      const remainingTasks = tasks.filter(t => projectIds.includes(t.projectId));
      
      // Check if link map entries are deleted
      const remainingLinkMapEntries = Object.entries(linkMap)
        .filter(([projectId, _]) => projectIds.includes(projectId))
        .length;
      
      // Determine success
      const success = !goalExists && 
                     remainingProjects.length === 0 && 
                     remainingTasks.length === 0 &&
                     remainingLinkMapEntries === 0;
      
      // Collect issues
      const issues = [];
      if (goalExists) issues.push(`Goal ${goalId} still exists`);
      if (remainingProjects.length > 0) issues.push(`${remainingProjects.length} projects still exist`);
      if (remainingTasks.length > 0) issues.push(`${remainingTasks.length} tasks still exist`);
      if (remainingLinkMapEntries > 0) issues.push(`${remainingLinkMapEntries} link map entries still exist`);
      
      return {
        success,
        message: success ? 'Deletion verified successfully' : issues.join(', '),
        details: {
          goalExists,
          remainingProjects: remainingProjects.length,
          remainingTasks: remainingTasks.length,
          remainingLinkMapEntries
        },
        canRepair: !success
      };
    } catch (error) {
      console.error('Error verifying deletion:', error);
      return {
        success: false,
        message: `Verification error: ${error.message}`,
        canRepair: false
      };
    }
  }
  
  /**
   * Attempts to repair failed deletions
   */
  static async repairDeletion(goalId, projectIds) {
    try {
      console.log(`[DataIntegrityService] Repairing deletion for goal ${goalId}`);
      
      // Load data from storage
      const [goalsJson, projectsJson, tasksJson, linkMapJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(this.STORAGE_KEYS.PROJECTS),
        AsyncStorage.getItem(this.STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP)
      ]);
      
      // Parse data
      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const projects = projectsJson ? JSON.parse(projectsJson) : [];
      const tasks = tasksJson ? JSON.parse(tasksJson) : [];
      const linkMap = linkMapJson ? JSON.parse(linkMapJson) : {};
      
      // Force delete everything related to this goal
      const updatedGoals = goals.filter(g => g.id !== goalId);
      const updatedProjects = projects.filter(p => !projectIds.includes(p.id) && p.goalId !== goalId);
      const updatedTasks = tasks.filter(t => !projectIds.includes(t.projectId));
      
      // Update link map
      const updatedLinkMap = { ...linkMap };
      projectIds.forEach(projectId => {
        delete updatedLinkMap[projectId];
      });
      
      // Also remove any other entries pointing to this goal
      Object.keys(updatedLinkMap).forEach(projectId => {
        if (updatedLinkMap[projectId] === goalId) {
          delete updatedLinkMap[projectId];
        }
      });
      
      // Write all updated data back to storage
      await Promise.all([
        AsyncStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals)),
        AsyncStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects)),
        AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks)),
        AsyncStorage.setItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, JSON.stringify(updatedLinkMap))
      ]);
      
      // Verify repair
      const verificationResult = await this.verifyDeletion(goalId, projectIds);
      
      if (verificationResult.success) {
        console.log('[DataIntegrityService] Repair successful');
      } else {
        console.error(`[DataIntegrityService] Repair failed: ${verificationResult.message}`);
      }
      
      return verificationResult;
      
    } catch (error) {
      console.error('Error repairing deletion:', error);
      return {
        success: false,
        message: `Repair error: ${error.message}`
      };
    }
  }
  
  /**
   * Performs a complete check of goal-project-task relationships
   * and fixes any inconsistencies
   */
  static async auditDataIntegrity() {
    try {
      console.log('[DataIntegrityService] Starting data integrity audit...');
      
      // Load all data
      const [goalsJson, projectsJson, tasksJson, linkMapJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(this.STORAGE_KEYS.PROJECTS),
        AsyncStorage.getItem(this.STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP)
      ]);
      
      // Parse data
      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const projects = projectsJson ? JSON.parse(projectsJson) : [];
      const tasks = tasksJson ? JSON.parse(tasksJson) : [];
      const linkMap = linkMapJson ? JSON.parse(linkMapJson) : {};
      
      console.log(`[DataIntegrityService] Loaded ${goals.length} goals, ${projects.length} projects, ${tasks.length} tasks`);
      
      // Track issues and fixes
      const issues = [];
      const fixes = [];
      
      // Check 1: Find orphaned projects (linked to non-existent goals)
      const validGoalIds = new Set(goals.map(g => g.id));
      const orphanedProjects = projects.filter(p => 
        p.goalId && !validGoalIds.has(p.goalId)
      );
      
      if (orphanedProjects.length > 0) {
        issues.push(`Found ${orphanedProjects.length} orphaned projects linked to non-existent goals`);
        
        // Fix: Remove goalId from orphaned projects
        orphanedProjects.forEach(p => {
          fixes.push(`Removing goalId from orphaned project "${p.title}" (${p.id})`);
        });
        
        // Apply fix
        const updatedProjects = projects.map(p => {
          if (p.goalId && !validGoalIds.has(p.goalId)) {
            return { ...p, goalId: null, goalTitle: null };
          }
          return p;
        });
        
        await AsyncStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
      }
      
      // Check 2: Find orphaned tasks (linked to non-existent projects)
      const validProjectIds = new Set(projects.map(p => p.id));
      const orphanedTasks = tasks.filter(t => 
        t.projectId && !validProjectIds.has(t.projectId)
      );
      
      if (orphanedTasks.length > 0) {
        issues.push(`Found ${orphanedTasks.length} orphaned tasks linked to non-existent projects`);
        
        // Fix: Remove orphaned tasks
        orphanedTasks.forEach(t => {
          fixes.push(`Removing orphaned task "${t.title || t.name}" (${t.id})`);
        });
        
        // Apply fix
        const updatedTasks = tasks.filter(t => 
          !t.projectId || validProjectIds.has(t.projectId)
        );
        
        await AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
      }
      
      // Check 3: Find inconsistencies in the project-goal link map
      const linkMapIssues = [];
      
      // Check for projects in link map that don't exist
      Object.keys(linkMap).forEach(projectId => {
        if (!validProjectIds.has(projectId)) {
          linkMapIssues.push(`Link map contains non-existent project ID: ${projectId}`);
        }
      });
      
      // Check for projects linked to goals that don't exist
      Object.entries(linkMap).forEach(([projectId, goalId]) => {
        if (!validGoalIds.has(goalId)) {
          linkMapIssues.push(`Project ${projectId} is linked to non-existent goal ${goalId} in link map`);
        }
      });
      
      // Check for projects with goalId but missing from link map
      projects.forEach(project => {
        if (project.goalId && validGoalIds.has(project.goalId) && !linkMap[project.id]) {
          linkMapIssues.push(`Project "${project.title}" (${project.id}) has goalId but is missing from link map`);
        }
      });
      
      if (linkMapIssues.length > 0) {
        issues.push(`Found ${linkMapIssues.length} issues in project-goal link map`);
        
        // Fix: Rebuild link map completely
        const newLinkMap = {};
        projects.forEach(project => {
          if (project.goalId && validGoalIds.has(project.goalId)) {
            newLinkMap[project.id] = project.goalId;
          }
        });
        
        fixes.push(`Rebuilt project-goal link map with ${Object.keys(newLinkMap).length} entries`);
        
        // Apply fix
        await AsyncStorage.setItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, JSON.stringify(newLinkMap));
      }
      
      // Return audit results
      return {
        success: issues.length === 0 || fixes.length > 0,
        issuesFound: issues.length,
        fixesApplied: fixes.length,
        issues,
        fixes
      };
      
    } catch (error) {
      console.error('Error during data integrity audit:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Analyzes the structure of a project to determine if it was created during onboarding
   */
  static isOnboardingCreatedProject(project) {
    // Check for onboarding-specific ID patterns
    if (project.id && project.id.includes('project_')) {
      return true;
    }
    
    // Check for specific metadata fields set during onboarding
    if (project.createdDuringOnboarding || project.onboardingProject) {
      return true;
    }
    
    // Check if created with domain metadata (typical of onboarding)
    if (project.domain && project.domainName && project.color && project.icon) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Performs a diagnostic check specifically for onboarding-created data
   */
  static async diagnoseOnboardingData() {
    try {
      console.log('[DataIntegrityService] Starting onboarding data diagnosis...');
      
      // Load all data
      const [goalsJson, projectsJson, tasksJson, linkMapJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(this.STORAGE_KEYS.PROJECTS),
        AsyncStorage.getItem(this.STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP)
      ]);
      
      // Parse data
      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const projects = projectsJson ? JSON.parse(projectsJson) : [];
      const tasks = tasksJson ? JSON.parse(tasksJson) : [];
      const linkMap = linkMapJson ? JSON.parse(linkMapJson) : {};
      
      // Find projects that were likely created during onboarding
      const onboardingProjects = projects.filter(p => this.isOnboardingCreatedProject(p));
      
      // Group onboarding projects by goal
      const onboardingProjectsByGoal = {};
      onboardingProjects.forEach(project => {
        if (project.goalId) {
          if (!onboardingProjectsByGoal[project.goalId]) {
            onboardingProjectsByGoal[project.goalId] = [];
          }
          onboardingProjectsByGoal[project.goalId].push(project);
        }
      });
      
      // Note: No longer checking for duplicate tasks since we've moved to single storage
      const projectsWithDuplicateTasks = [];
      
      // Check for goals created during onboarding (based on having onboarding projects)
      const likelyOnboardingGoals = [];
      
      Object.keys(onboardingProjectsByGoal).forEach(goalId => {
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
          likelyOnboardingGoals.push({
            goal: goal.title,
            id: goal.id,
            onboardingProjectCount: onboardingProjectsByGoal[goalId].length
          });
        }
      });
      
      // Prepare diagnostic report
      const report = {
        totalGoals: goals.length,
        totalProjects: projects.length,
        totalTasks: tasks.length,
        onboardingProjects: onboardingProjects.length,
        onboardingGoals: likelyOnboardingGoals.length,
        projectsWithDuplicateTasks: projectsWithDuplicateTasks.length,
        details: {
          likelyOnboardingGoals,
          projectsWithDuplicateTasks
        }
      };
      
      console.log('[DataIntegrityService] Onboarding data diagnosis complete:');
      console.log(report);
      
      return {
        success: true,
        report
      };
      
    } catch (error) {
      console.error('Error during onboarding data diagnosis:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default DataIntegrityService;