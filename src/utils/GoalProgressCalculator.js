// src/utils/GoalProgressCalculator.js
// This utility ensures consistent goal progress calculation across the app

/**
 * Calculates a goal's progress based on completed milestones AND direct tasks (flexible hierarchy)
 * @param {string} goalId - The ID of the goal
 * @param {Array} milestones - Array of all milestones
 * @param {Array} tasks - Array of all tasks
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateGoalProgress = (goalId, milestones = [], tasks = []) => {
  if (!goalId) return 0;
  
  // Get milestones linked to this goal
  const linkedMilestones = Array.isArray(milestones) ? milestones.filter(milestone => milestone.goalId === goalId) : [];
  
  // Get direct tasks linked to this goal (no milestone parent)
  const directTasks = Array.isArray(tasks) ? tasks.filter(task => 
    task.goalId === goalId && (!task.milestoneId || task.milestoneId === null)
  ) : [];
  
  const totalMilestones = linkedMilestones.length;
  const totalDirectTasks = directTasks.length;
  
  // If no milestones or direct tasks, return 0
  if (totalMilestones === 0 && totalDirectTasks === 0) return 0;
  
  try {
    let completedItems = 0;
    let totalItems = 0;
    
    // Count completed milestones
    if (totalMilestones > 0) {
      const completedMilestones = linkedMilestones.filter(milestone => 
        milestone.progress === 100 || milestone.completed === true
      ).length;
      completedItems += completedMilestones;
      totalItems += totalMilestones;
    }
    
    // Count completed direct tasks
    if (totalDirectTasks > 0) {
      const completedDirectTasks = directTasks.filter(task => 
        task.completed === true || task.status === 'done'
      ).length;
      completedItems += completedDirectTasks;
      totalItems += totalDirectTasks;
    }
    
    // Calculate percentage (safeguard against division by zero)
    const percentage = Math.round((completedItems / totalItems) * 100);
    
    if (__DEV__) {
      console.log(`[GoalProgressCalculator] Goal ${goalId}: ${completedItems}/${totalItems} items = ${percentage}% (${totalMilestones} milestones, ${totalDirectTasks} direct tasks)`);
    }
    
    return percentage;
  } catch (error) {
    console.error('[GoalProgressCalculator] Error calculating goal progress:', error);
    return 0; // Safe fallback
  }
};

/**
 * Calculates domain progress based on goals in that domain
 * @param {string} domainName - The name of the domain
 * @param {Array} goals - Array of all goals
 * @param {Array} milestones - Array of all milestones 
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateDomainProgress = (domainName, goals, milestones) => {
  if (!domainName || !Array.isArray(goals)) return 0;

  // Find goals for this domain
  const domainGoals = goals.filter(goal => {
    // Match by domain or domain name
    if (goal.domain === domainName || goal.domainName === domainName) {
      return true;
    }
    
    // For older goals, check if the icon corresponds to the domain
    const iconMap = {
      'star': 'General',
      'business': 'Business',
      'wallet': 'Finance',
      'fitness': 'Health',
      'people': 'Relationships',
      'school': 'Education',
      'book': 'Knowledge',
      'heart': 'Wellbeing',
      'happy': 'Joy',
      'home': 'Home',
      'earth': 'Travel',
      'trophy': 'Achievement'
    };
    
    return iconMap[goal.icon] === domainName;
  });
  
  if (domainGoals.length === 0) return 0;
  
  // Calculate progress for each goal
  const goalProgresses = domainGoals.map(goal => {
    if (goal.useMetricsForProgress) {
      return calculateGoalProgress(goal.id, milestones);
    } else {
      return goal.progress || 0;
    }
  });
  
  // Average the progress values
  const totalProgress = goalProgresses.reduce((sum, progress) => sum + progress, 0);
  return Math.round(totalProgress / domainGoals.length);
};

/**
 * Updates a goal's progress in the goals array
 * @param {Object} goal - The goal to update
 * @param {Array} milestones - Array of all milestones
 * @returns {Object} - Updated goal with correct progress
 */
export const updateGoalWithCorrectProgress = (goal, milestones) => {
  if (!goal || !goal.id) return goal;
  
  // Skip if manual progress is being used
  if (!goal.useMetricsForProgress) return goal;
  
  // Calculate current progress
  const currentProgress = calculateGoalProgress(goal.id, milestones);
  
  // Return updated goal with correct progress
  return {
    ...goal,
    progress: currentProgress
  };
};

/**
 * Updates all goals with correct progress values
 * @param {Array} goals - Array of all goals
 * @param {Array} milestones - Array of all milestones
 * @returns {Array} - Updated goals with correct progress values
 */
export const updateAllGoalsProgress = (goals, milestones) => {
  if (!Array.isArray(goals) || !Array.isArray(milestones)) return goals;
  
  return goals.map(goal => updateGoalWithCorrectProgress(goal, milestones));
};