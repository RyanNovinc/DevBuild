// src/context/AppContext/utils/progressUtils.js
// Extracted progress calculation utilities from AppContext.js

/**
 * Calculate goal progress based on its associated milestones
 * @param {string} goalId - The ID of the goal
 * @param {Array} milestones - Array of all milestones
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateGoalProgress = (goalId, milestones) => {
  if (!Array.isArray(milestones)) return 0;
  
  const goalMilestones = milestones.filter(milestone => milestone.goalId === goalId);
  if (goalMilestones.length === 0) return 0;
  
  const completedMilestones = goalMilestones.filter(milestone => 
    milestone.progress === 100 || milestone.completed || milestone.status === 'done'
  ).length;
  
  return Math.round((completedMilestones / goalMilestones.length) * 100);
};

/**
 * Calculate milestone progress based on its tasks
 * @param {string} milestoneId - The ID of the milestone
 * @param {Array} tasks - Array of all tasks
 * @param {Array} milestones - Array of all milestones (to get milestone status)
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateMilestoneProgress = (milestoneId, tasks, milestones) => {
  if (!Array.isArray(tasks)) return 0;
  
  // Get the current milestone
  const milestone = Array.isArray(milestones) 
    ? milestones.find(p => p.id === milestoneId) 
    : null;
  
  // If milestone is already marked as completed, always return 100%
  if (milestone && (milestone.status === 'done' || milestone.completed)) return 100;
  
  // Calculate based on tasks
  const milestoneTasks = tasks.filter(task => task.milestoneId === milestoneId);
  if (milestoneTasks.length === 0) return 0;
  
  const completedTasks = milestoneTasks.filter(task => 
    task.completed || task.status === 'done'
  ).length;
  
  return Math.round((completedTasks / milestoneTasks.length) * 100);
};

/**
 * Update milestone status based on progress
 * @param {Object} milestone - The milestone to update
 * @param {number} progress - The calculated progress (0-100)
 * @returns {Object} - Updated milestone with appropriate status
 */
export const updateMilestoneStatus = (milestone, progress) => {
  if (!milestone) return null;
  
  // Create a copy of the milestone
  const updatedMilestone = { ...milestone };
  
  // Update progress
  updatedMilestone.progress = progress;
  
  // Don't change status if it was explicitly set
  if (!updatedMilestone.status) {
    // Set status based on progress
    if (progress === 0) {
      updatedMilestone.status = 'todo';
      updatedMilestone.completed = false;
    } else if (progress === 100) {
      updatedMilestone.status = 'done';
      updatedMilestone.completed = true;
    } else {
      updatedMilestone.status = 'in_progress';
      updatedMilestone.completed = false;
    }
  }
  
  // Update timestamp
  updatedMilestone.updatedAt = new Date().toISOString();
  
  return updatedMilestone;
};

/**
 * Get milestones for a specific goal
 * @param {string} goalId - The ID of the goal
 * @param {Array} milestones - Array of all milestones
 * @param {Set} deletedMilestoneIds - Set of deleted milestone IDs
 * @returns {Array} - Array of milestones for the goal
 */
export const getMilestonesForGoal = (goalId, milestones, deletedMilestoneIds = new Set()) => {
  if (!goalId || !Array.isArray(milestones)) {
    return [];
  }
  
  return milestones.filter(milestone => 
    milestone.goalId === goalId && 
    !deletedMilestoneIds.has(milestone.id)
  );
};

/**
 * Get independent milestones (not associated with any goal)
 * @param {Array} milestones - Array of all milestones
 * @param {Set} deletedMilestoneIds - Set of deleted milestone IDs
 * @returns {Array} - Array of independent milestones
 */
export const getIndependentMilestones = (milestones, deletedMilestoneIds = new Set()) => {
  if (!Array.isArray(milestones)) {
    return [];
  }
  
  return milestones.filter(milestone => 
    !milestone.goalId && 
    !deletedMilestoneIds.has(milestone.id)
  );
};

/**
 * Get tasks for a specific milestone
 * @param {string} milestoneId - The ID of the milestone
 * @param {Array} tasks - Array of all tasks
 * @returns {Array} - Array of tasks for the milestone
 */
export const getTasksForMilestone = (milestoneId, tasks) => {
  if (!milestoneId || !Array.isArray(tasks)) {
    return [];
  }
  
  return tasks.filter(task => task.milestoneId === milestoneId);
};