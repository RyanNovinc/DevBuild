// src/services/DataIntegrityService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * DataIntegrityService - Handles data integrity operations, ensuring relationships
 * between goals, milestones, and tasks are maintained correctly.
 * 
 * Provides thorough logging to track operations and diagnose issues.
 */
class DataIntegrityService {
  // Storage keys - aligned with AppContext and OnboardingService
  static STORAGE_KEYS = {
    GOALS: 'goals',
    MILESTONES: 'milestones',
    TASKS: 'tasks',
    MILESTONE_GOAL_LINK_MAP: 'milestoneGoalLinkMap'
  };
  
  /**
   * Thoroughly deletes a goal and all its associated milestones and tasks
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
      const [goalsJson, milestonesJson, tasksJson, linkMapJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONES),
        AsyncStorage.getItem(this.STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP)
      ]);
      
      // Parse the data with fallbacks
      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const milestones = milestonesJson ? JSON.parse(milestonesJson) : [];
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
      
      // STEP 3: Find all milestones linked to this goal - through ALL possible methods
      
      // Method 1: Direct goalId property
      const milestonesLinkedByProperty = milestones.filter(m => m.goalId === goalId);
      log(`Found ${milestonesLinkedByProperty.length} milestones linked by goalId property`);
      
      // Method 2: Link map
      const milestoneIdsFromLinkMap = Object.entries(linkMap)
        .filter(([_, linkedGoalId]) => linkedGoalId === goalId)
        .map(([milestoneId]) => milestoneId);
      log(`Found ${milestoneIdsFromLinkMap.length} milestones linked via milestoneGoalLinkMap`);
      
      // Method 3: Check for goalTitle match (as fallback)
      const goalTitle = goalToDelete.title || '';
      const milestonesLinkedByTitle = milestones.filter(m => 
        m.goalTitle === goalTitle && !m.goalId && 
        !milestonesLinkedByProperty.some(lm => lm.id === m.id) &&
        !milestoneIdsFromLinkMap.includes(m.id)
      );
      log(`Found ${milestonesLinkedByTitle.length} milestones linked only by matching goalTitle`);
      
      // Combine all methods to get ALL linked milestones
      const allLinkedMilestones = [
        ...milestonesLinkedByProperty,
        ...milestones.filter(m => milestoneIdsFromLinkMap.includes(m.id) && 
                              !milestonesLinkedByProperty.some(lm => lm.id === m.id)),
        ...milestonesLinkedByTitle
      ];
      
      // Get all linked milestone IDs
      const linkedMilestoneIds = allLinkedMilestones.map(m => m.id);
      
      log(`Total milestones to delete: ${allLinkedMilestones.length}`);
      log(`Milestone IDs to delete: ${linkedMilestoneIds.join(', ')}`);
      
      // STEP 4: Find all tasks for these milestones
      // Method 1: Direct milestoneId in tasks array
      const tasksLinkedByMilestoneId = tasks.filter(t => linkedMilestoneIds.includes(t.milestoneId));
      log(`Found ${tasksLinkedByMilestoneId.length} tasks linked by milestoneId`);
      
      // Note: No longer handling embedded tasks since we've moved to single storage
      
      // Total tasks to be affected
      const totalTasksToDelete = tasksLinkedByMilestoneId.length;
      log(`Total tasks to delete: ${totalTasksToDelete}`);
      
      // STEP 5: Create updated arrays (filtering out the items to delete)
      const updatedGoals = goals.filter(g => g.id !== goalId);
      const updatedMilestones = milestones.filter(m => !linkedMilestoneIds.includes(m.id));
      const updatedTasks = tasks.filter(t => !linkedMilestoneIds.includes(t.milestoneId));
      
      // Update link map
      const updatedLinkMap = { ...linkMap };
      linkedMilestoneIds.forEach(milestoneId => {
        delete updatedLinkMap[milestoneId];
      });
      
      // STEP 6: Create detailed report of what will be deleted
      log('=== DELETION SUMMARY ===');
      log(`- Goals: 1 (${goalToDelete.title})`);
      log(`- Milestones: ${allLinkedMilestones.length}`);
      log(`- Tasks: ${totalTasksToDelete}`);
      log(`- Link map entries: ${linkedMilestoneIds.length}`);
      
      if (allLinkedMilestones.length > 0) {
        log('Milestones to be deleted:');
        allLinkedMilestones.forEach((m, i) => {
          const milestoneTaskCount = tasks.filter(t => t.milestoneId === m.id).length;
          log(`  ${i+1}. "${m.title}" (ID: ${m.id}) - ${milestoneTaskCount} tasks`);
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
            milestones: allLinkedMilestones,
            milestoneIds: linkedMilestoneIds,
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
          milestones,
          tasks,
          linkMap
        };
        await AsyncStorage.setItem('data_integrity_backup', JSON.stringify(backupData));
        log('Created backup of data before deletion');
      }
      
      // Write all updated data back to storage
      await Promise.all([
        AsyncStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals)),
        AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONES, JSON.stringify(updatedMilestones)),
        AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks)),
        AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, JSON.stringify(updatedLinkMap))
      ]);
      
      // STEP 9: Verify deletion was successful
      log('Verifying deletion...');
      const verificationResult = await this.verifyDeletion(goalId, linkedMilestoneIds);
      
      if (verificationResult.success) {
        log('Deletion verified successfully');
      } else {
        log(`Verification failed: ${verificationResult.message}`);
        // Try to repair if verification failed
        if (verificationResult.canRepair) {
          log('Attempting repair...');
          await this.repairDeletion(goalId, linkedMilestoneIds);
        }
      }
      
      log('Goal deletion completed successfully');
      return {
        success: true,
        deleted: {
          goal: goalToDelete,
          milestoneCount: allLinkedMilestones.length,
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
   * Verifies that a goal and its milestones were successfully deleted
   */
  static async verifyDeletion(goalId, milestoneIds) {
    try {
      // Load data from storage
      const [goalsJson, milestonesJson, tasksJson, linkMapJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONES),
        AsyncStorage.getItem(this.STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP)
      ]);
      
      // Parse data
      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const milestones = milestonesJson ? JSON.parse(milestonesJson) : [];
      const tasks = tasksJson ? JSON.parse(tasksJson) : [];
      const linkMap = linkMapJson ? JSON.parse(linkMapJson) : {};
      
      // Check if goal is deleted
      const goalExists = goals.some(g => g.id === goalId);
      
      // Check if milestones are deleted
      const remainingMilestones = milestones.filter(m => milestoneIds.includes(m.id));
      
      // Check if tasks for these milestones are deleted
      const remainingTasks = tasks.filter(t => milestoneIds.includes(t.milestoneId));
      
      // Check if link map entries are deleted
      const remainingLinkMapEntries = Object.entries(linkMap)
        .filter(([milestoneId, _]) => milestoneIds.includes(milestoneId))
        .length;
      
      // Determine success
      const success = !goalExists && 
                     remainingMilestones.length === 0 && 
                     remainingTasks.length === 0 &&
                     remainingLinkMapEntries === 0;
      
      // Collect issues
      const issues = [];
      if (goalExists) issues.push(`Goal ${goalId} still exists`);
      if (remainingMilestones.length > 0) issues.push(`${remainingMilestones.length} milestones still exist`);
      if (remainingTasks.length > 0) issues.push(`${remainingTasks.length} tasks still exist`);
      if (remainingLinkMapEntries > 0) issues.push(`${remainingLinkMapEntries} link map entries still exist`);
      
      return {
        success,
        message: success ? 'Deletion verified successfully' : issues.join(', '),
        details: {
          goalExists,
          remainingMilestones: remainingMilestones.length,
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
  static async repairDeletion(goalId, milestoneIds) {
    try {
      console.log(`[DataIntegrityService] Repairing deletion for goal ${goalId}`);
      
      // Load data from storage
      const [goalsJson, milestonesJson, tasksJson, linkMapJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONES),
        AsyncStorage.getItem(this.STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP)
      ]);
      
      // Parse data
      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const milestones = milestonesJson ? JSON.parse(milestonesJson) : [];
      const tasks = tasksJson ? JSON.parse(tasksJson) : [];
      const linkMap = linkMapJson ? JSON.parse(linkMapJson) : {};
      
      // Force delete everything related to this goal
      const updatedGoals = goals.filter(g => g.id !== goalId);
      const updatedMilestones = milestones.filter(m => !milestoneIds.includes(m.id) && m.goalId !== goalId);
      const updatedTasks = tasks.filter(t => !milestoneIds.includes(t.milestoneId));
      
      // Update link map
      const updatedLinkMap = { ...linkMap };
      milestoneIds.forEach(milestoneId => {
        delete updatedLinkMap[milestoneId];
      });
      
      // Also remove any other entries pointing to this goal
      Object.keys(updatedLinkMap).forEach(milestoneId => {
        if (updatedLinkMap[milestoneId] === goalId) {
          delete updatedLinkMap[milestoneId];
        }
      });
      
      // Write all updated data back to storage
      await Promise.all([
        AsyncStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals)),
        AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONES, JSON.stringify(updatedMilestones)),
        AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks)),
        AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, JSON.stringify(updatedLinkMap))
      ]);
      
      // Verify repair
      const verificationResult = await this.verifyDeletion(goalId, milestoneIds);
      
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
      const [goalsJson, milestonesJson, tasksJson, linkMapJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONES),
        AsyncStorage.getItem(this.STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP)
      ]);
      
      // Parse data
      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const milestones = milestonesJson ? JSON.parse(milestonesJson) : [];
      const tasks = tasksJson ? JSON.parse(tasksJson) : [];
      const linkMap = linkMapJson ? JSON.parse(linkMapJson) : {};
      
      console.log(`[DataIntegrityService] Loaded ${goals.length} goals, ${milestones.length} milestones, ${tasks.length} tasks`);
      
      // Track issues and fixes
      const issues = [];
      const fixes = [];
      
      // Check 1: Convert orphaned milestones to standalone (flexible hierarchy support)
      const validGoalIds = new Set(goals.map(g => g.id));
      const orphanedMilestones = milestones.filter(m => 
        m.goalId && !validGoalIds.has(m.goalId)
      );
      
      if (orphanedMilestones.length > 0) {
        issues.push(`Found ${orphanedMilestones.length} orphaned milestones to convert to standalone`);
        
        // Fix: Convert to standalone milestones
        orphanedMilestones.forEach(m => {
          fixes.push(`Converting milestone "${m.title}" (${m.id}) to standalone`);
        });
        
        // Apply fix
        const updatedMilestones = milestones.map(m => {
          if (m.goalId && !validGoalIds.has(m.goalId)) {
            return { ...m, goalId: null, goalTitle: null };
          }
          return m;
        });
        
        await AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONES, JSON.stringify(updatedMilestones));
      }
      
      // Check 2: Convert orphaned tasks to standalone (flexible hierarchy support)
      const validMilestoneIds = new Set(milestones.map(m => m.id));
      const orphanedTasks = tasks.filter(t => 
        t.milestoneId && !validMilestoneIds.has(t.milestoneId)
      );
      
      if (orphanedTasks.length > 0) {
        issues.push(`Found ${orphanedTasks.length} orphaned tasks to convert to standalone`);
        
        // Fix: Convert to standalone tasks
        orphanedTasks.forEach(t => {
          fixes.push(`Converting task "${t.title || t.name}" (${t.id}) to standalone`);
        });
        
        // Apply fix - convert to standalone by removing milestone/goal references
        const updatedTasks = tasks.map(t => {
          if (t.milestoneId && !validMilestoneIds.has(t.milestoneId)) {
            return { 
              ...t, 
              milestoneId: null, 
              milestoneTitle: null,
              goalId: null, // Also remove goal reference to make truly standalone
              goalTitle: null
            };
          }
          return t;
        });
        
        await AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
      }
      
      // Check 3: Find inconsistencies in the milestone-goal link map
      const linkMapIssues = [];
      
      // Check for milestones in link map that don't exist
      Object.keys(linkMap).forEach(milestoneId => {
        if (!validMilestoneIds.has(milestoneId)) {
          linkMapIssues.push(`Link map contains non-existent milestone ID: ${milestoneId}`);
        }
      });
      
      // Check for milestones linked to goals that don't exist
      Object.entries(linkMap).forEach(([milestoneId, goalId]) => {
        if (!validGoalIds.has(goalId)) {
          linkMapIssues.push(`Milestone ${milestoneId} is linked to non-existent goal ${goalId} in link map`);
        }
      });
      
      // Check for milestones with goalId but missing from link map
      milestones.forEach(milestone => {
        if (milestone.goalId && validGoalIds.has(milestone.goalId) && !linkMap[milestone.id]) {
          linkMapIssues.push(`Milestone "${milestone.title}" (${milestone.id}) has goalId but is missing from link map`);
        }
      });
      
      if (linkMapIssues.length > 0) {
        issues.push(`Found ${linkMapIssues.length} issues in milestone-goal link map`);
        
        // Fix: Rebuild link map completely
        const newLinkMap = {};
        milestones.forEach(milestone => {
          if (milestone.goalId && validGoalIds.has(milestone.goalId)) {
            newLinkMap[milestone.id] = milestone.goalId;
          }
        });
        
        fixes.push(`Rebuilt milestone-goal link map with ${Object.keys(newLinkMap).length} entries`);
        
        // Apply fix
        await AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, JSON.stringify(newLinkMap));
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
   * Analyzes the structure of a milestone to determine if it was created during onboarding
   */
  static isOnboardingCreatedMilestone(milestone) {
    // Check for onboarding-specific ID patterns
    if (milestone.id && milestone.id.includes('milestone_')) {
      return true;
    }
    
    // Check for specific metadata fields set during onboarding
    if (milestone.createdDuringOnboarding || milestone.onboardingMilestone) {
      return true;
    }
    
    // Check if created with domain metadata (typical of onboarding)
    if (milestone.domain && milestone.domainName && milestone.color && milestone.icon) {
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
      const [goalsJson, milestonesJson, tasksJson, linkMapJson] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.GOALS),
        AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONES),
        AsyncStorage.getItem(this.STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP)
      ]);
      
      // Parse data
      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const milestones = milestonesJson ? JSON.parse(milestonesJson) : [];
      const tasks = tasksJson ? JSON.parse(tasksJson) : [];
      const linkMap = linkMapJson ? JSON.parse(linkMapJson) : {};
      
      // Find milestones that were likely created during onboarding
      const onboardingMilestones = milestones.filter(m => this.isOnboardingCreatedMilestone(m));
      
      // Group onboarding milestones by goal
      const onboardingMilestonesByGoal = {};
      onboardingMilestones.forEach(milestone => {
        if (milestone.goalId) {
          if (!onboardingMilestonesByGoal[milestone.goalId]) {
            onboardingMilestonesByGoal[milestone.goalId] = [];
          }
          onboardingMilestonesByGoal[milestone.goalId].push(milestone);
        }
      });
      
      // Note: No longer checking for duplicate tasks since we've moved to single storage
      const milestonesWithDuplicateTasks = [];
      
      // Check for goals created during onboarding (based on having onboarding milestones)
      const likelyOnboardingGoals = [];
      
      Object.keys(onboardingMilestonesByGoal).forEach(goalId => {
        const goal = goals.find(g => g.id === goalId);
        if (goal) {
          likelyOnboardingGoals.push({
            goal: goal.title,
            id: goal.id,
            onboardingMilestoneCount: onboardingMilestonesByGoal[goalId].length
          });
        }
      });
      
      // Prepare diagnostic report
      const report = {
        totalGoals: goals.length,
        totalMilestones: milestones.length,
        totalTasks: tasks.length,
        onboardingMilestones: onboardingMilestones.length,
        onboardingGoals: likelyOnboardingGoals.length,
        milestonesWithDuplicateTasks: milestonesWithDuplicateTasks.length,
        details: {
          likelyOnboardingGoals,
          milestonesWithDuplicateTasks
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