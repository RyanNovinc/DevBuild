// src/utils/GoalProgressCalculator.js
// This utility ensures consistent goal progress calculation across the app

/**
 * Calculates a goal's progress based on its completed projects
 * @param {string} goalId - The ID of the goal
 * @param {Array} projects - Array of all projects
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateGoalProgress = (goalId, projects) => {
  if (!goalId || !Array.isArray(projects)) return 0;
  
  // Get projects linked to this goal
  const linkedProjects = projects.filter(project => project.goalId === goalId);
  if (linkedProjects.length === 0) return 0;
  
  try {
    // Calculate based on completed projects
    const completedProjects = linkedProjects.filter(project => 
      project.progress === 100 || project.completed === true
    ).length;
    
    // Calculate percentage (safeguard against division by zero)
    const percentage = Math.round((completedProjects / linkedProjects.length) * 100);
    
    if (__DEV__) {
      console.log(`[GoalProgressCalculator] Goal ${goalId}: ${completedProjects}/${linkedProjects.length} = ${percentage}%`);
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
 * @param {Array} projects - Array of all projects 
 * @returns {number} - Progress percentage (0-100)
 */
export const calculateDomainProgress = (domainName, goals, projects) => {
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
      return calculateGoalProgress(goal.id, projects);
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
 * @param {Array} projects - Array of all projects
 * @returns {Object} - Updated goal with correct progress
 */
export const updateGoalWithCorrectProgress = (goal, projects) => {
  if (!goal || !goal.id) return goal;
  
  // Skip if manual progress is being used
  if (!goal.useMetricsForProgress) return goal;
  
  // Calculate current progress
  const currentProgress = calculateGoalProgress(goal.id, projects);
  
  // Return updated goal with correct progress
  return {
    ...goal,
    progress: currentProgress
  };
};

/**
 * Updates all goals with correct progress values
 * @param {Array} goals - Array of all goals
 * @param {Array} projects - Array of all projects
 * @returns {Array} - Updated goals with correct progress values
 */
export const updateAllGoalsProgress = (goals, projects) => {
  if (!Array.isArray(goals) || !Array.isArray(projects)) return goals;
  
  return goals.map(goal => updateGoalWithCorrectProgress(goal, projects));
};