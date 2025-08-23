// src/services/OnboardingService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/LoggerUtility';
import FeatureExplorerTracker from './FeatureExplorerTracker';

/**
 * OnboardingService - A dedicated service for reliably creating onboarding data
 * This bypasses the complex AppContext system for a more direct approach
 */
class OnboardingService {
  // Storage keys
  static STORAGE_KEYS = {
    GOALS: 'goals',
    MILESTONES: 'milestones',
    TASKS: 'tasks',
    MILESTONE_GOAL_LINK_MAP: 'milestoneGoalLinkMap',
    ONBOARDING_COMPLETED: 'onboardingCompleted',
    THEME_COLOR: 'themeColor',
    SELECTED_DOMAIN: 'selectedDomain',
    SELECTED_GOAL: 'selectedGoal',
    DIRECT_FROM_ONBOARDING: 'directFromOnboarding'
  };
  
  /**
   * Generate a unique ID with timestamp and random string
   */
  static generateUniqueId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
  
  /**
   * Main function to create all onboarding data in a batch operation
   * @param {Object} selectedDomain - The selected domain object
   * @param {Object} selectedGoal - The selected goal object
   * @param {Object} options - Optional parameters
   * @param {boolean} options.isFullOnboarding - Whether this is from completing full onboarding (true) or skipping (false)
   */
  static async createOnboardingData(selectedDomain, selectedGoal, options = {}) {
    const { isFullOnboarding = true } = options;
    console.log("OnboardingService: Starting batch data creation");
    
    try {
      // 1. Set basic onboarding flags
      await AsyncStorage.setItem(this.STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      await AsyncStorage.setItem(this.STORAGE_KEYS.THEME_COLOR, '#1e3a8a');
      await AsyncStorage.setItem(this.STORAGE_KEYS.SELECTED_DOMAIN, selectedDomain.name);
      await AsyncStorage.setItem(this.STORAGE_KEYS.SELECTED_GOAL, JSON.stringify({
        domain: selectedDomain.name,
        goalName: selectedGoal.name,
        milestones: selectedGoal.milestones || []
      }));
      
      // 2. Create the goal with a unique ID
      const goalId = this.generateUniqueId('goal');
      log('Error', `🎯 [OnboardingService] Created goal ID: ${goalId}`);
      
      const newGoal = {
        id: goalId,
        title: selectedGoal.name,
        description: selectedGoal.description || "",
        icon: selectedDomain.icon,
        color: selectedDomain.color,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: false,
        domain: selectedDomain.name,
        domainName: selectedDomain.name,
        useMetricsForProgress: true
      };
      
      // 3. Prepare all milestones for this goal
      const newMilestones = [];
      const allTasksForStorage = []; // We'll still store tasks separately for compatibility
      const milestoneGoalLinkMap = {};
      
      // Create milestones with their tasks (handle both old 'projects' and new 'milestones' structure)
      const milestonesToCreate = selectedGoal.milestones || selectedGoal.projects || [];
      if (Array.isArray(milestonesToCreate)) {
        milestonesToCreate.forEach((milestoneTemplate, index) => {
          // Create milestone with unique ID
          const milestoneId = this.generateUniqueId(`milestone_${index}`);
          
          // Add to link map
          milestoneGoalLinkMap[milestoneId] = goalId;
          
          // Create the tasks for this milestone
          if (Array.isArray(milestoneTemplate.tasks)) {
            milestoneTemplate.tasks.forEach((taskTemplate, taskIndex) => {
              const isTaskCompleted = taskTemplate.completed || false;
              
              // Create task with unique ID
              const taskId = this.generateUniqueId(`task_${index}_${taskIndex}`);
              
              const newTask = {
                id: taskId,
                milestoneId: milestoneId,
                name: taskTemplate.name,
                title: taskTemplate.name,
                description: taskTemplate.description || "",
                completed: isTaskCompleted,
                status: isTaskCompleted ? 'done' : 'todo',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              // Add to the global tasks array (single storage location)
              allTasksForStorage.push(newTask);
            });
          }
          
          // Create the milestone object WITHOUT embedded tasks
          log('Error', `🎯 [OnboardingService] Creating milestone "${milestoneTemplate.name}" with goalId: ${goalId}`);
          
          const newMilestone = {
            id: milestoneId,
            goalId: goalId,
            goalTitle: selectedGoal.name,
            title: milestoneTemplate.name,
            description: milestoneTemplate.description || "",
            progress: 0,
            status: "todo",
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            domain: selectedDomain.name,
            domainName: selectedDomain.name,
            color: selectedDomain.color,
            icon: selectedDomain.icon,
            order: index, // Ensure consistent ordering
            isMilestone: true // Mark as milestone for proper display
          };
          
          log('Error', `🎯 [OnboardingService] Created milestone:`, { id: newMilestone.id, goalId: newMilestone.goalId, title: newMilestone.title });
          
          // Add to milestones array
          newMilestones.push(newMilestone);
        });
      }
      
      // 4. Now BATCH READ all existing data
      const existingGoalsString = await AsyncStorage.getItem(this.STORAGE_KEYS.GOALS);
      const existingMilestonesString = await AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONES);
      const existingTasksString = await AsyncStorage.getItem(this.STORAGE_KEYS.TASKS);
      const existingLinkMapString = await AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP);
      
      // Parse existing data (with fallbacks to empty arrays)
      const existingGoals = existingGoalsString ? JSON.parse(existingGoalsString) : [];
      const existingMilestones = existingMilestonesString ? JSON.parse(existingMilestonesString) : [];
      const existingTasks = existingTasksString ? JSON.parse(existingTasksString) : [];
      const existingLinkMap = existingLinkMapString ? JSON.parse(existingLinkMapString) : {};
      
      // 5. MERGE existing data with new data
      const updatedGoals = [...existingGoals, newGoal];
      const updatedMilestones = [...existingMilestones, ...newMilestones];
      const updatedTasks = [...existingTasks, ...allTasksForStorage];
      const updatedLinkMap = { ...existingLinkMap, ...milestoneGoalLinkMap };
      
      // 6. Log what we're about to save
      console.log(`OnboardingService: Ready to save - 1 goal, ${newMilestones.length} milestones, ${allTasksForStorage.length} tasks`);
      
      // 7. BATCH WRITE all data back to storage
      const writeOperations = [
        AsyncStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals)),
        AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONES, JSON.stringify(updatedMilestones)),
        AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks)),
        AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, JSON.stringify(updatedLinkMap)),
        AsyncStorage.setItem(this.STORAGE_KEYS.DIRECT_FROM_ONBOARDING, 'true')
      ];
      
      // Execute all write operations in parallel
      await Promise.all(writeOperations);
      
      // 8. Verify the data was saved correctly
      const success = await this.verifyCreatedData(goalId, newMilestones.length, allTasksForStorage.length);
      
      // 9. Set flag for onboarding completion achievement to be triggered after profile loads
      if (success && isFullOnboarding) {
        try {
          await AsyncStorage.setItem('pendingOnboardingAchievement', 'true');
          log('Info', '🏆 [OnboardingService] Onboarding achievement marked as pending for profile screen');
        } catch (error) {
          console.error('OnboardingService: Error setting pending onboarding achievement flag:', error);
          // Don't fail the onboarding if achievement tracking fails
        }
      }
      
      return {
        success,
        goalId,
        milestoneIds: newMilestones.map(m => m.id),
        message: success ? "Onboarding data created successfully" : "Data verification failed"
      };
    } catch (error) {
      console.error("OnboardingService: Error creating onboarding data:", error);
      return {
        success: false,
        error,
        message: `Error: ${error.message}`
      };
    }
  }
  
  /**
   * Delete a goal and ALL its associated milestones and tasks
   * More thorough than the AppContext deletion function
   */
  static async deleteGoalCompletely(goalId) {
    try {
      console.log(`OnboardingService: Starting complete deletion of goal ${goalId}`);
      
      // 1. Get all data from storage
      const goalsString = await AsyncStorage.getItem(this.STORAGE_KEYS.GOALS);
      const milestonesString = await AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONES);
      const tasksString = await AsyncStorage.getItem(this.STORAGE_KEYS.TASKS);
      const linkMapString = await AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP);
      
      // Parse data
      const goals = goalsString ? JSON.parse(goalsString) : [];
      const milestones = milestonesString ? JSON.parse(milestonesString) : [];
      const tasks = tasksString ? JSON.parse(tasksString) : [];
      const linkMap = linkMapString ? JSON.parse(linkMapString) : {};
      
      // 2. Find goal and all associated milestones
      const goalExists = goals.some(g => g.id === goalId);
      if (!goalExists) {
        console.warn(`OnboardingService: Goal ${goalId} not found, nothing to delete`);
        return false;
      }
      
      // Find all milestones linked to this goal - through BOTH the goalId property AND linkMap
      const milestonesLinkedByProperty = milestones.filter(m => m.goalId === goalId);
      const milestoneIdsFromLinkMap = Object.entries(linkMap)
        .filter(([_, linkedGoalId]) => linkedGoalId === goalId)
        .map(([milestoneId]) => milestoneId);
      
      // Combine both lists to get ALL milestones associated with this goal
      const allLinkedMilestoneIds = new Set([
        ...milestonesLinkedByProperty.map(m => m.id),
        ...milestoneIdsFromLinkMap
      ]);
      
      console.log(`OnboardingService: Found ${allLinkedMilestoneIds.size} milestones linked to goal ${goalId}`);
      
      // 3. Find all tasks associated with these milestones
      const tasksToDelete = tasks.filter(task => 
        allLinkedMilestoneIds.has(task.milestoneId)
      );
      
      console.log(`OnboardingService: Found ${tasksToDelete.length} tasks to delete`);
      
      // 4. Remove the goal
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      
      // 5. Remove all linked milestones
      const updatedMilestones = milestones.filter(milestone => 
        !allLinkedMilestoneIds.has(milestone.id)
      );
      
      // 6. Remove all associated tasks
      const updatedTasks = tasks.filter(task => 
        !allLinkedMilestoneIds.has(task.milestoneId)
      );
      
      // 7. Update link map
      const updatedLinkMap = { ...linkMap };
      allLinkedMilestoneIds.forEach(milestoneId => {
        delete updatedLinkMap[milestoneId];
      });
      
      // 8. Write all updated data back to storage
      await AsyncStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals));
      await AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONES, JSON.stringify(updatedMilestones));
      await AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
      await AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, JSON.stringify(updatedLinkMap));
      
      console.log(`OnboardingService: Successfully deleted goal ${goalId} with all related data:`);
      console.log(`- Removed 1 goal`);
      console.log(`- Removed ${milestones.length - updatedMilestones.length} milestones`);
      console.log(`- Removed ${tasks.length - updatedTasks.length} tasks`);
      
      return true;
    } catch (error) {
      console.error(`OnboardingService: Error deleting goal ${goalId}:`, error);
      return false;
    }
  }
  
  /**
   * Verify that all data was created correctly
   */
  static async verifyCreatedData(goalId, expectedMilestoneCount, expectedTaskCount) {
    try {
      // Read all data back from storage
      const goalsString = await AsyncStorage.getItem(this.STORAGE_KEYS.GOALS);
      const milestonesString = await AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONES);
      const tasksString = await AsyncStorage.getItem(this.STORAGE_KEYS.TASKS);
      const linkMapString = await AsyncStorage.getItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP);
      
      // Parse the data
      const goals = goalsString ? JSON.parse(goalsString) : [];
      const milestones = milestonesString ? JSON.parse(milestonesString) : [];
      const tasks = tasksString ? JSON.parse(tasksString) : [];
      const linkMap = linkMapString ? JSON.parse(linkMapString) : {};
      
      // Check goal exists
      const goalExists = goals.some(g => g.id === goalId);
      if (!goalExists) {
        console.error("OnboardingService: Goal verification failed - goal not found");
        return false;
      }
      
      // Check milestones exist and are linked to goal
      const goalMilestones = milestones.filter(m => m.goalId === goalId);
      if (goalMilestones.length !== expectedMilestoneCount) {
        console.error(`OnboardingService: Milestone verification failed - expected ${expectedMilestoneCount} milestones, found ${goalMilestones.length}`);
        
        // Log details about the milestones
        console.log("OnboardingService: All milestones:", milestones.length);
        console.log("OnboardingService: Milestones with this goal ID:", goalMilestones.length);
        console.log("OnboardingService: Goal ID being checked:", goalId);
        
        // If we have milestones but they don't have the right goalId, fix them
        if (milestones.length >= expectedMilestoneCount) {
          const milestonesWithoutGoal = milestones.filter(m => !m.goalId || m.goalId === 'undefined');
          console.log(`OnboardingService: Found ${milestonesWithoutGoal.length} milestones without goals`);
          
          // If we have enough to fix, try to repair them
          if (milestonesWithoutGoal.length >= expectedMilestoneCount - goalMilestones.length) {
            const updatedMilestones = [...milestones];
            let fixCount = 0;
            
            for (let i = 0; i < updatedMilestones.length; i++) {
              // If this milestone has no goal and we still need to fix more
              if ((!updatedMilestones[i].goalId || updatedMilestones[i].goalId === 'undefined') && 
                  fixCount < (expectedMilestoneCount - goalMilestones.length)) {
                updatedMilestones[i].goalId = goalId;
                updatedMilestones[i].goalTitle = goals.find(g => g.id === goalId)?.title || "Unknown Goal";
                
                // Update link map too
                linkMap[updatedMilestones[i].id] = goalId;
                
                fixCount++;
              }
            }
            
            // Save the fixed projects and link map
            if (fixCount > 0) {
              console.log(`OnboardingService: Repairing ${fixCount} milestones with missing goal IDs`);
              await AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONES, JSON.stringify(updatedMilestones));
              await AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, JSON.stringify(linkMap));
              
              // Check again after repair
              const fixedMilestones = updatedMilestones.filter(m => m.goalId === goalId);
              console.log(`OnboardingService: After repair: ${fixedMilestones.length}/${expectedMilestoneCount} milestones`);
              
              if (fixedMilestones.length === expectedMilestoneCount) {
                console.log("OnboardingService: Repair successful!");
              }
            }
          }
        }
      }
      
      // Verify that tasks exist in separate storage for these milestones
      let hasCorrectTaskStructure = false;
      if (goalMilestones.length > 0) {
        const milestoneIds = goalMilestones.map(m => m.id);
        const associatedTasks = tasks.filter(t => milestoneIds.includes(t.milestoneId || t.projectId));
        
        hasCorrectTaskStructure = associatedTasks.length > 0;
        console.log(`OnboardingService: Found ${associatedTasks.length} tasks associated with ${goalMilestones.length} milestones in tasks array`);
        
        if (!hasCorrectTaskStructure) {
          console.error("OnboardingService: No tasks found in tasks array for milestones - this may cause issues");
        }
      }
      
      // Check link map contains all milestones
      const milestoneIds = goalMilestones.map(m => m.id);
      const allMilestonesInLinkMap = milestoneIds.every(id => linkMap[id] === goalId);
      if (!allMilestonesInLinkMap) {
        console.error("OnboardingService: Link map verification failed - not all milestones in link map");
        
        // Try to fix the link map
        const updatedLinkMap = { ...linkMap };
        milestoneIds.forEach(id => {
          updatedLinkMap[id] = goalId;
        });
        await AsyncStorage.setItem(this.STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, JSON.stringify(updatedLinkMap));
      }
      
      // Check tasks exist in separate storage
      let taskCount = 0;
      milestoneIds.forEach(milestoneId => {
        const milestoneTasks = tasks.filter(t => t.milestoneId === milestoneId || t.projectId === milestoneId);
        taskCount += milestoneTasks.length;
      });
      
      if (taskCount !== expectedTaskCount) {
        console.error(`OnboardingService: Task verification failed - expected ${expectedTaskCount} tasks, found ${taskCount}`);
      }
      
      // For simplicity, consider successful if we have the goal and at least one milestone with tasks in tasks array
      const minimalSuccess = goalExists && goalMilestones.length > 0 && hasCorrectTaskStructure;
      
      console.log(`OnboardingService: Verification ${minimalSuccess ? 'PASSED' : 'FAILED'}`);
      console.log(`- Goal exists: ${goalExists}`);
      console.log(`- Milestones: ${goalMilestones.length}/${expectedMilestoneCount}`);
      console.log(`- Tasks in tasks array: ${taskCount}/${expectedTaskCount}`);
      console.log(`- Tasks properly linked to milestones: ${hasCorrectTaskStructure}`);
      
      return minimalSuccess;
    } catch (error) {
      console.error("OnboardingService: Error during verification:", error);
      return false;
    }
  }
  
  /**
   * Reset all stored data - useful for testing
   */
  static async resetAllData() {
    try {
      const keys = Object.values(this.STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error("OnboardingService: Error resetting data:", error);
      return false;
    }
  }
}

export default OnboardingService;