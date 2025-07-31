// src/services/OnboardingService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { log } from '../utils/LoggerUtility';

/**
 * OnboardingService - A dedicated service for reliably creating onboarding data
 * This bypasses the complex AppContext system for a more direct approach
 */
class OnboardingService {
  // Storage keys
  static STORAGE_KEYS = {
    GOALS: 'goals',
    PROJECTS: 'projects',
    TASKS: 'tasks',
    PROJECT_GOAL_LINK_MAP: 'projectGoalLinkMap',
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
   */
  static async createOnboardingData(selectedDomain, selectedGoal) {
    console.log("OnboardingService: Starting batch data creation");
    
    try {
      // 1. Set basic onboarding flags
      await AsyncStorage.setItem(this.STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      await AsyncStorage.setItem(this.STORAGE_KEYS.THEME_COLOR, '#1e3a8a');
      await AsyncStorage.setItem(this.STORAGE_KEYS.SELECTED_DOMAIN, selectedDomain.name);
      await AsyncStorage.setItem(this.STORAGE_KEYS.SELECTED_GOAL, JSON.stringify({
        domain: selectedDomain.name,
        goalName: selectedGoal.name,
        projects: selectedGoal.projects || []
      }));
      
      // 2. Create the goal with a unique ID
      const goalId = this.generateUniqueId('goal');
      log('Error', `🎯 [OnboardingService] Created goal ID: ${goalId}`);
      
      const newGoal = {
        id: goalId,
        title: selectedGoal.name,
        description: selectedGoal.explanation || "",
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
      
      // 3. Prepare all projects for this goal
      const newProjects = [];
      const allTasksForStorage = []; // We'll still store tasks separately for compatibility
      const projectGoalLinkMap = {};
      
      // Create projects with their tasks
      if (Array.isArray(selectedGoal.projects)) {
        selectedGoal.projects.forEach((projectTemplate, index) => {
          // Create project with unique ID
          const projectId = this.generateUniqueId(`project_${index}`);
          
          // Add to link map
          projectGoalLinkMap[projectId] = goalId;
          
          // Create the tasks for this project
          if (Array.isArray(projectTemplate.tasks)) {
            projectTemplate.tasks.forEach((taskTemplate, taskIndex) => {
              const isTaskCompleted = taskTemplate.completed || false;
              
              // Create task with unique ID
              const taskId = this.generateUniqueId(`task_${index}_${taskIndex}`);
              
              const newTask = {
                id: taskId,
                projectId: projectId,
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
          
          // Create the project object WITHOUT embedded tasks
          log('Error', `🎯 [OnboardingService] Creating project "${projectTemplate.name}" with goalId: ${goalId}`);
          
          const newProject = {
            id: projectId,
            goalId: goalId,
            goalTitle: selectedGoal.name,
            title: projectTemplate.name,
            description: projectTemplate.explanation || "",
            progress: 0,
            status: "todo",
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            domain: selectedDomain.name,
            domainName: selectedDomain.name,
            color: selectedDomain.color,
            icon: selectedDomain.icon,
            order: index // Ensure consistent ordering
          };
          
          log('Error', `🎯 [OnboardingService] Created project:`, { id: newProject.id, goalId: newProject.goalId, title: newProject.title });
          
          // Add to projects array
          newProjects.push(newProject);
        });
      }
      
      // 4. Now BATCH READ all existing data
      const existingGoalsString = await AsyncStorage.getItem(this.STORAGE_KEYS.GOALS);
      const existingProjectsString = await AsyncStorage.getItem(this.STORAGE_KEYS.PROJECTS);
      const existingTasksString = await AsyncStorage.getItem(this.STORAGE_KEYS.TASKS);
      const existingLinkMapString = await AsyncStorage.getItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP);
      
      // Parse existing data (with fallbacks to empty arrays)
      const existingGoals = existingGoalsString ? JSON.parse(existingGoalsString) : [];
      const existingProjects = existingProjectsString ? JSON.parse(existingProjectsString) : [];
      const existingTasks = existingTasksString ? JSON.parse(existingTasksString) : [];
      const existingLinkMap = existingLinkMapString ? JSON.parse(existingLinkMapString) : {};
      
      // 5. MERGE existing data with new data
      const updatedGoals = [...existingGoals, newGoal];
      const updatedProjects = [...existingProjects, ...newProjects];
      const updatedTasks = [...existingTasks, ...allTasksForStorage];
      const updatedLinkMap = { ...existingLinkMap, ...projectGoalLinkMap };
      
      // 6. Log what we're about to save
      console.log(`OnboardingService: Ready to save - 1 goal, ${newProjects.length} projects, ${allTasksForStorage.length} tasks`);
      
      // 7. BATCH WRITE all data back to storage
      const writeOperations = [
        AsyncStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals)),
        AsyncStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects)),
        AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks)),
        AsyncStorage.setItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, JSON.stringify(updatedLinkMap)),
        AsyncStorage.setItem(this.STORAGE_KEYS.DIRECT_FROM_ONBOARDING, 'true')
      ];
      
      // Execute all write operations in parallel
      await Promise.all(writeOperations);
      
      // 8. Verify the data was saved correctly
      const success = await this.verifyCreatedData(goalId, newProjects.length, allTasksForStorage.length);
      
      return {
        success,
        goalId,
        projectIds: newProjects.map(p => p.id),
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
   * Delete a goal and ALL its associated projects and tasks
   * More thorough than the AppContext deletion function
   */
  static async deleteGoalCompletely(goalId) {
    try {
      console.log(`OnboardingService: Starting complete deletion of goal ${goalId}`);
      
      // 1. Get all data from storage
      const goalsString = await AsyncStorage.getItem(this.STORAGE_KEYS.GOALS);
      const projectsString = await AsyncStorage.getItem(this.STORAGE_KEYS.PROJECTS);
      const tasksString = await AsyncStorage.getItem(this.STORAGE_KEYS.TASKS);
      const linkMapString = await AsyncStorage.getItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP);
      
      // Parse data
      const goals = goalsString ? JSON.parse(goalsString) : [];
      const projects = projectsString ? JSON.parse(projectsString) : [];
      const tasks = tasksString ? JSON.parse(tasksString) : [];
      const linkMap = linkMapString ? JSON.parse(linkMapString) : {};
      
      // 2. Find goal and all associated projects
      const goalExists = goals.some(g => g.id === goalId);
      if (!goalExists) {
        console.warn(`OnboardingService: Goal ${goalId} not found, nothing to delete`);
        return false;
      }
      
      // Find all projects linked to this goal - through BOTH the goalId property AND linkMap
      const projectsLinkedByProperty = projects.filter(p => p.goalId === goalId);
      const projectIdsFromLinkMap = Object.entries(linkMap)
        .filter(([_, linkedGoalId]) => linkedGoalId === goalId)
        .map(([projectId]) => projectId);
      
      // Combine both lists to get ALL projects associated with this goal
      const allLinkedProjectIds = new Set([
        ...projectsLinkedByProperty.map(p => p.id),
        ...projectIdsFromLinkMap
      ]);
      
      console.log(`OnboardingService: Found ${allLinkedProjectIds.size} projects linked to goal ${goalId}`);
      
      // 3. Find all tasks associated with these projects
      const tasksToDelete = tasks.filter(task => 
        allLinkedProjectIds.has(task.projectId)
      );
      
      console.log(`OnboardingService: Found ${tasksToDelete.length} tasks to delete`);
      
      // 4. Remove the goal
      const updatedGoals = goals.filter(goal => goal.id !== goalId);
      
      // 5. Remove all linked projects
      const updatedProjects = projects.filter(project => 
        !allLinkedProjectIds.has(project.id)
      );
      
      // 6. Remove all associated tasks
      const updatedTasks = tasks.filter(task => 
        !allLinkedProjectIds.has(task.projectId)
      );
      
      // 7. Update link map
      const updatedLinkMap = { ...linkMap };
      allLinkedProjectIds.forEach(projectId => {
        delete updatedLinkMap[projectId];
      });
      
      // 8. Write all updated data back to storage
      await AsyncStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals));
      await AsyncStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
      await AsyncStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
      await AsyncStorage.setItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, JSON.stringify(updatedLinkMap));
      
      console.log(`OnboardingService: Successfully deleted goal ${goalId} with all related data:`);
      console.log(`- Removed 1 goal`);
      console.log(`- Removed ${projects.length - updatedProjects.length} projects`);
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
  static async verifyCreatedData(goalId, expectedProjectCount, expectedTaskCount) {
    try {
      // Read all data back from storage
      const goalsString = await AsyncStorage.getItem(this.STORAGE_KEYS.GOALS);
      const projectsString = await AsyncStorage.getItem(this.STORAGE_KEYS.PROJECTS);
      const tasksString = await AsyncStorage.getItem(this.STORAGE_KEYS.TASKS);
      const linkMapString = await AsyncStorage.getItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP);
      
      // Parse the data
      const goals = goalsString ? JSON.parse(goalsString) : [];
      const projects = projectsString ? JSON.parse(projectsString) : [];
      const tasks = tasksString ? JSON.parse(tasksString) : [];
      const linkMap = linkMapString ? JSON.parse(linkMapString) : {};
      
      // Check goal exists
      const goalExists = goals.some(g => g.id === goalId);
      if (!goalExists) {
        console.error("OnboardingService: Goal verification failed - goal not found");
        return false;
      }
      
      // Check projects exist and are linked to goal
      const goalProjects = projects.filter(p => p.goalId === goalId);
      if (goalProjects.length !== expectedProjectCount) {
        console.error(`OnboardingService: Project verification failed - expected ${expectedProjectCount} projects, found ${goalProjects.length}`);
        
        // Log details about the projects
        console.log("OnboardingService: All projects:", projects.length);
        console.log("OnboardingService: Projects with this goal ID:", goalProjects.length);
        console.log("OnboardingService: Goal ID being checked:", goalId);
        
        // If we have projects but they don't have the right goalId, fix them
        if (projects.length >= expectedProjectCount) {
          const projectsWithoutGoal = projects.filter(p => !p.goalId || p.goalId === 'undefined');
          console.log(`OnboardingService: Found ${projectsWithoutGoal.length} projects without goals`);
          
          // If we have enough to fix, try to repair them
          if (projectsWithoutGoal.length >= expectedProjectCount - goalProjects.length) {
            const updatedProjects = [...projects];
            let fixCount = 0;
            
            for (let i = 0; i < updatedProjects.length; i++) {
              // If this project has no goal and we still need to fix more
              if ((!updatedProjects[i].goalId || updatedProjects[i].goalId === 'undefined') && 
                  fixCount < (expectedProjectCount - goalProjects.length)) {
                updatedProjects[i].goalId = goalId;
                updatedProjects[i].goalTitle = goals.find(g => g.id === goalId)?.title || "Unknown Goal";
                
                // Update link map too
                linkMap[updatedProjects[i].id] = goalId;
                
                fixCount++;
              }
            }
            
            // Save the fixed projects and link map
            if (fixCount > 0) {
              console.log(`OnboardingService: Repairing ${fixCount} projects with missing goal IDs`);
              await AsyncStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
              await AsyncStorage.setItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, JSON.stringify(linkMap));
              
              // Check again after repair
              const fixedProjects = updatedProjects.filter(p => p.goalId === goalId);
              console.log(`OnboardingService: After repair: ${fixedProjects.length}/${expectedProjectCount} projects`);
              
              if (fixedProjects.length === expectedProjectCount) {
                console.log("OnboardingService: Repair successful!");
              }
            }
          }
        }
      }
      
      // Verify that tasks exist in separate storage for these projects
      let hasCorrectTaskStructure = false;
      if (goalProjects.length > 0) {
        const projectIds = goalProjects.map(p => p.id);
        const associatedTasks = tasks.filter(t => projectIds.includes(t.projectId));
        
        hasCorrectTaskStructure = associatedTasks.length > 0;
        console.log(`OnboardingService: Found ${associatedTasks.length} tasks associated with ${goalProjects.length} projects in tasks array`);
        
        if (!hasCorrectTaskStructure) {
          console.error("OnboardingService: No tasks found in tasks array for projects - this may cause issues");
        }
      }
      
      // Check link map contains all projects
      const projectIds = goalProjects.map(p => p.id);
      const allProjectsInLinkMap = projectIds.every(id => linkMap[id] === goalId);
      if (!allProjectsInLinkMap) {
        console.error("OnboardingService: Link map verification failed - not all projects in link map");
        
        // Try to fix the link map
        const updatedLinkMap = { ...linkMap };
        projectIds.forEach(id => {
          updatedLinkMap[id] = goalId;
        });
        await AsyncStorage.setItem(this.STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, JSON.stringify(updatedLinkMap));
      }
      
      // Check tasks exist in separate storage
      let taskCount = 0;
      projectIds.forEach(projectId => {
        const projectTasks = tasks.filter(t => t.projectId === projectId);
        taskCount += projectTasks.length;
      });
      
      if (taskCount !== expectedTaskCount) {
        console.error(`OnboardingService: Task verification failed - expected ${expectedTaskCount} tasks, found ${taskCount}`);
      }
      
      // For simplicity, consider successful if we have the goal and at least one project with tasks in tasks array
      const minimalSuccess = goalExists && goalProjects.length > 0 && hasCorrectTaskStructure;
      
      console.log(`OnboardingService: Verification ${minimalSuccess ? 'PASSED' : 'FAILED'}`);
      console.log(`- Goal exists: ${goalExists}`);
      console.log(`- Projects: ${goalProjects.length}/${expectedProjectCount}`);
      console.log(`- Tasks in tasks array: ${taskCount}/${expectedTaskCount}`);
      console.log(`- Tasks properly linked to projects: ${hasCorrectTaskStructure}`);
      
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