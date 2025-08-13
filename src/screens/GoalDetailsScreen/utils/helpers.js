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
 * @param {Array} linkedMilestones - List of linked milestones
 * @param {Object} milestonesToShare - Map of milestone IDs to share status
 * @param {string} shareFormat - Format type ('simple' or 'detailed')
 * @param {Function} getTasksForMilestone - Function to get tasks for a milestone
 * @returns {string} - Formatted content for sharing
 */
export const generateShareableContent = (
  title, 
  description, 
  hasTargetDate, 
  targetDate, 
  progress, 
  linkedMilestones, 
  milestonesToShare, 
  shareFormat,
  getTasksForMilestone
) => {
  // Safety checks
  if (!title) title = 'Untitled Goal';
  if (!description) description = '';
  if (!Array.isArray(linkedMilestones)) linkedMilestones = [];
  if (!milestonesToShare) milestonesToShare = {};
  if (!getTasksForMilestone) getTasksForMilestone = () => [];
  
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
  
  // Add milestones if any are selected for sharing
  const milestonesToInclude = linkedMilestones.filter(milestone => milestonesToShare[milestone.id]);
  
  if (milestonesToInclude.length > 0) {
    content += `🏁 MILESTONES (${milestonesToInclude.length}):\n`;
    
    milestonesToInclude.forEach((milestone, index) => {
      content += `${index + 1}. ${milestone.title} - ${milestone.progress || 0}% complete\n`;
      
      // Add detailed milestone info for detailed format
      if (shareFormat === 'detailed') {
        if (milestone.description && milestone.description.trim()) {
          content += `   Description: ${milestone.description}\n`;
        }
        
        const milestoneTasks = getTasksForMilestone(milestone.id);
        if (milestoneTasks.length > 0) {
          content += `   Tasks (${milestoneTasks.length}):\n`;
          milestoneTasks.forEach((task, taskIndex) => {
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