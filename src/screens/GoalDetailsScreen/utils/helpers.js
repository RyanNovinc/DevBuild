// src/screens/GoalDetailsScreen/utils/helpers.js

/**
 * Format date for display
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    // Return a fallback for invalid dates
    return 'Invalid date';
  }
  
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error('Error formatting date:', error);
    // Simple fallback format
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }
};

/**
 * Helper function to get domain name from icon
 * @param {string} iconName - The icon name
 * @returns {string} - The domain name
 */
export const getIconDomain = (iconName) => {
  if (!iconName) return 'General';
  
  const iconMapping = {
    'business': 'Business',
    'wallet': 'Finance',
    'fitness': 'Health',
    'people': 'Social',
    'school': 'Education',
    'book': 'Knowledge',
    'heart': 'Wellbeing',
    'happy': 'Joy',
    'home': 'Home',
    'earth': 'Travel',
    'trophy': 'Achievement',
    'star': 'General'
  };
  
  return iconMapping[iconName] || 'General';
};

/**
 * Generate shareable content for goal sharing
 * @param {string} title - Goal title
 * @param {string} description - Goal description
 * @param {boolean} hasTargetDate - Whether goal has a target date
 * @param {Date} targetDate - The target date
 * @param {number} progress - Current progress percentage
 * @param {Array} linkedProjects - List of linked projects
 * @param {Object} projectsToShare - Map of project IDs to share status
 * @param {string} shareFormat - Format type ('simple' or 'detailed')
 * @param {Function} getTasksForProject - Function to get tasks for a project
 * @returns {string} - Formatted content for sharing
 */
export const generateShareableContent = (
  title, 
  description, 
  hasTargetDate, 
  targetDate, 
  progress, 
  linkedProjects, 
  projectsToShare, 
  shareFormat,
  getTasksForProject
) => {
  // Safety checks
  if (!title) title = 'Untitled Goal';
  if (!description) description = '';
  if (!Array.isArray(linkedProjects)) linkedProjects = [];
  if (!projectsToShare) projectsToShare = {};
  if (!getTasksForProject) getTasksForProject = () => [];
  
  // Start with goal title
  let content = `🎯 GOAL: ${title}\n\n`;
  
  // Add description if present
  if (description && description.trim()) {
    content += `📝 Description: ${description}\n\n`;
  }
  
  // Add target date if set
  if (hasTargetDate && targetDate instanceof Date && !isNaN(targetDate.getTime())) {
    content += `📅 Target Date: ${formatDate(targetDate)}\n\n`;
  }
  
  // Add progress
  content += `⏱️ Progress: ${progress}%\n\n`;
  
  // Add projects if any are selected for sharing
  const projectsToInclude = linkedProjects.filter(project => projectsToShare[project.id]);
  
  if (projectsToInclude.length > 0) {
    content += `🔍 PROJECTS (${projectsToInclude.length}):\n`;
    
    projectsToInclude.forEach((project, index) => {
      content += `${index + 1}. ${project.title} - ${project.progress || 0}% complete\n`;
      
      // Add detailed project info for detailed format
      if (shareFormat === 'detailed') {
        if (project.description && project.description.trim()) {
          content += `   Description: ${project.description}\n`;
        }
        
        const projectTasks = getTasksForProject(project.id);
        if (projectTasks.length > 0) {
          content += `   Tasks (${projectTasks.length}):\n`;
          projectTasks.forEach((task, taskIndex) => {
            content += `   ${taskIndex + 1}. [${task.completed ? '✓' : ' '}] ${task.title}\n`;
          });
        }
        
        content += '\n';
      }
    });
  }
  
  // Add app branding
  content += `\nShared from LifeCompass app`;
  
  return content;
};

/**
 * Format progress percentage for display
 * @param {number} progress - Progress percentage
 * @returns {string} - Formatted progress string
 */
export const formatProgress = (progress) => {
  if (typeof progress !== 'number' || isNaN(progress)) {
    return '0%';
  }
  
  // Ensure progress is between 0 and 100
  const validProgress = Math.max(0, Math.min(100, progress));
  
  // Return formatted string
  return `${Math.round(validProgress)}%`;
};

/**
 * Validate goal data before saving
 * @param {Object} goalData - The goal data to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateGoalData = (goalData) => {
  const errors = [];
  
  // Check title
  if (!goalData.title || !goalData.title.trim()) {
    errors.push('Title is required');
  }
  
  // Check if target date is valid
  if (goalData.hasTargetDate && goalData.targetDate) {
    const date = new Date(goalData.targetDate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid target date');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};