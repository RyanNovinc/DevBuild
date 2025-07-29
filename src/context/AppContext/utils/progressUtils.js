// src/context/AppContext/utils/progressUtils.js
// Extracted progress calculation utilities from AppContext.js

/**
 * Calculate goal progress based on its associated projects
 * @param {string} goalId - The ID of the goal
 * @param {Array} projects - Array of all projects
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateGoalProgress = (goalId, projects) => {
  if (!Array.isArray(projects)) return 0;
  
  const goalProjects = projects.filter(project => project.goalId === goalId);
  if (goalProjects.length === 0) return 0;
  
  const completedProjects = goalProjects.filter(project => 
    project.progress === 100 || project.completed || project.status === 'done'
  ).length;
  
  return Math.round((completedProjects / goalProjects.length) * 100);
};

/**
 * Calculate project progress based on its tasks
 * @param {string} projectId - The ID of the project
 * @param {Array} tasks - Array of all tasks
 * @param {Array} projects - Array of all projects (to get project status)
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateProjectProgress = (projectId, tasks, projects) => {
  if (!Array.isArray(tasks)) return 0;
  
  // Get the current project
  const project = Array.isArray(projects) 
    ? projects.find(p => p.id === projectId) 
    : null;
  
  // If project is already marked as completed, always return 100%
  if (project && (project.status === 'done' || project.completed)) return 100;
  
  // Calculate based on tasks
  const projectTasks = tasks.filter(task => task.projectId === projectId);
  if (projectTasks.length === 0) return 0;
  
  const completedTasks = projectTasks.filter(task => 
    task.completed || task.status === 'done'
  ).length;
  
  return Math.round((completedTasks / projectTasks.length) * 100);
};

/**
 * Update project status based on progress
 * @param {Object} project - The project to update
 * @param {number} progress - The calculated progress (0-100)
 * @returns {Object} - Updated project with appropriate status
 */
export const updateProjectStatus = (project, progress) => {
  if (!project) return null;
  
  // Create a copy of the project
  const updatedProject = { ...project };
  
  // Update progress
  updatedProject.progress = progress;
  
  // Don't change status if it was explicitly set
  if (!updatedProject.status) {
    // Set status based on progress
    if (progress === 0) {
      updatedProject.status = 'todo';
      updatedProject.completed = false;
    } else if (progress === 100) {
      updatedProject.status = 'done';
      updatedProject.completed = true;
    } else {
      updatedProject.status = 'in_progress';
      updatedProject.completed = false;
    }
  }
  
  // Update timestamp
  updatedProject.updatedAt = new Date().toISOString();
  
  return updatedProject;
};

/**
 * Get projects for a specific goal
 * @param {string} goalId - The ID of the goal
 * @param {Array} projects - Array of all projects
 * @param {Set} deletedProjectIds - Set of deleted project IDs
 * @returns {Array} - Array of projects for the goal
 */
export const getProjectsForGoal = (goalId, projects, deletedProjectIds = new Set()) => {
  if (!goalId || !Array.isArray(projects)) {
    return [];
  }
  
  return projects.filter(project => 
    project.goalId === goalId && 
    !deletedProjectIds.has(project.id)
  );
};

/**
 * Get independent projects (not associated with any goal)
 * @param {Array} projects - Array of all projects
 * @param {Set} deletedProjectIds - Set of deleted project IDs
 * @returns {Array} - Array of independent projects
 */
export const getIndependentProjects = (projects, deletedProjectIds = new Set()) => {
  if (!Array.isArray(projects)) {
    return [];
  }
  
  return projects.filter(project => 
    !project.goalId && 
    !deletedProjectIds.has(project.id)
  );
};

/**
 * Get tasks for a specific project
 * @param {string} projectId - The ID of the project
 * @param {Array} tasks - Array of all tasks
 * @returns {Array} - Array of tasks for the project
 */
export const getTasksForProject = (projectId, tasks) => {
  if (!projectId || !Array.isArray(tasks)) {
    return [];
  }
  
  return tasks.filter(task => task.projectId === projectId);
};