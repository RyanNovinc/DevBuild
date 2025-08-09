// src/services/AppSummaryService.js
/**
 * Service for generating app context summaries
 * Formats user data into a structured text format for AI consumption
 */

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'Unknown date';
  
  try {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// System document constants
export const APP_CONTEXT_DOCUMENT_ID = 'system_app_context_summary';
export const APP_CONTEXT_DOCUMENT_NAME = 'App Context Summary';

class AppSummaryService {
  /**
   * Generate a complete app summary from app context
   * @param {Object} appContext - App context data
   * @returns {string} - Formatted text summary
   */
  static generateAppSummary(appContext) {
    console.log('[AppSummaryService] Generating app summary');
    
    const { goals = [], projects = [], tasks = [], settings = {}, userCountry = null } = appContext;
    
    // Log data sizes for debugging
    console.log(`[AppSummaryService] Data received: ${goals.length} goals, ${projects.length} projects, ${tasks.length} tasks, country: ${userCountry}`);
    
    // Build sections of the summary
    const profileSection = this.generateProfileSection(settings, userCountry);
    const goalsSection = this.generateGoalsSection(goals);
    const projectsSection = this.generateProjectsSection(projects, goals);
    const tasksSection = this.generateTasksSection(tasks, projects, goals);
    
    // Combine all sections with a header
    return `# USER APP CONTEXT SUMMARY
Last Updated: ${formatDate(new Date())}

${profileSection}

${goalsSection}

${projectsSection}

${tasksSection}

---
This context summary is automatically generated from the user's app data.
`;
  }
  
  /**
   * Generate profile and life direction section
   * @param {Object} settings - App settings containing user profile
   * @param {string} userCountry - User's selected country
   * @returns {string} - Formatted text section
   */
  static generateProfileSection(settings, userCountry) {
    const profile = settings.userProfile || {};
    const lifeDirection = settings.lifeDirection || '';
    
    // Get country name from country code
    const getCountryName = (countryCode) => {
      const countryMap = {
        'australia': 'Australia',
        'usa': 'United States',
        'uk': 'United Kingdom', 
        'canada': 'Canada',
        'newzealand': 'New Zealand',
        'singapore': 'Singapore',
        'ireland': 'Ireland',
        'india': 'India',
        'malaysia': 'Malaysia',
        'nigeria': 'Nigeria',
        'philippines': 'Philippines',
        'southafrica': 'South Africa',
        'other': 'Other'
      };
      return countryMap[countryCode] || countryCode || 'Not specified';
    };
    
    return `## USER PROFILE
Name: ${profile.name || 'Not specified'}
Country: ${getCountryName(userCountry)}

### STRATEGIC DIRECTION
${lifeDirection || 'No strategic direction specified'}`;
  }
  
  /**
   * Generate goals section with active and completed goals
   * @param {Array} goals - Goals array
   * @returns {string} - Formatted text section
   */
  static generateGoalsSection(goals) {
    if (!Array.isArray(goals) || goals.length === 0) {
      return '## GOALS\nNo goals created yet.';
    }
    
    const activeGoals = goals.filter(goal => !goal.completed);
    const completedGoals = goals.filter(goal => goal.completed);
    
    let section = `## GOALS (${goals.length} total)`;
    
    if (activeGoals.length > 0) {
      section += `\n\n### ACTIVE GOALS (${activeGoals.length})`;
      activeGoals.forEach(goal => {
        section += `\n- ${goal.title} (Progress: ${goal.progress || 0}%, Domain: ${goal.domain || 'Not specified'})`;
        if (goal.description) {
          section += `\n  Description: ${goal.description}`;
        }
      });
    }
    
    if (completedGoals.length > 0) {
      section += `\n\n### COMPLETED GOALS (${completedGoals.length})`;
      
      // Sort completed goals by completion date (if available)
      const sortedCompletedGoals = [...completedGoals].sort((a, b) => {
        const dateA = a.completedAt || a.updatedAt || a.createdAt;
        const dateB = b.completedAt || b.updatedAt || b.createdAt;
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        return new Date(dateB) - new Date(dateA); // Most recent first
      });
      
      // Show only the 5 most recently completed goals in detail
      sortedCompletedGoals.slice(0, 5).forEach(goal => {
        section += `\n- ${goal.title} (Domain: ${goal.domain || 'Not specified'})`;
      });
      
      if (completedGoals.length > 5) {
        section += `\n- ... and ${completedGoals.length - 5} more completed goals`;
      }
    }
    
    return section;
  }
  
  /**
   * Generate projects section with active projects only
   * @param {Array} projects - Projects array
   * @param {Array} goals - Goals array for reference
   * @returns {string} - Formatted text section
   */
  static generateProjectsSection(projects, goals = []) {
    if (!Array.isArray(projects) || projects.length === 0) {
      return '## ACTIVE PROJECTS\nNo projects created yet.';
    }
    
    // Create a map of goal IDs to titles for quick lookup and track completion status
    const goalMap = {};
    const completedGoalIds = new Set();
    const validGoalIds = new Set();
    
    if (Array.isArray(goals)) {
      goals.forEach(goal => {
        if (goal && goal.id) {
          validGoalIds.add(goal.id);
          goalMap[goal.id] = goal.title;
          if (goal.completed) {
            completedGoalIds.add(goal.id);
          }
        }
      });
    }
    
    // Filter for active projects using ProfileScreen's exact logic
    const activeProjects = projects.filter(project => {
      // FIRST: Skip projects that belong to deleted goals (goals that no longer exist)
      if (project.goalId && !validGoalIds.has(project.goalId)) {
        return false;
      }
      
      // SECOND: Skip projects that belong to completed goals
      if (project.goalId && completedGoalIds.has(project.goalId)) {
        return false;
      }
      
      // THIRD: Skip projects that are themselves completed or done
      if (project.completed === true || project.status === 'done') {
        return false;
      }
      
      // Otherwise, it's active
      return true;
    });
    
    if (activeProjects.length === 0) {
      return '## ACTIVE PROJECTS\nNo active projects.';
    }
    
    let section = `## ACTIVE PROJECTS (${activeProjects.length})`;
    
    activeProjects.forEach(project => {
      // Get current status label
      let statusLabel = 'To Do';
      if (project.status === 'in_progress') statusLabel = 'In Progress';
      
      section += `\n- ${project.title} (Progress: ${project.progress || 0}%, Status: ${statusLabel})`;
      
      // Include goal association if available
      // First try goalId with the map, then fallback to goalTitle
      if (project.goalId && goalMap[project.goalId]) {
        section += `\n  Part of goal: ${goalMap[project.goalId]}`;
      } else if (project.goalTitle) {
        section += `\n  Part of goal: ${project.goalTitle}`;
      }
      
      // Include description if available
      if (project.description) {
        section += `\n  Description: ${project.description}`;
      }
    });
    
    return section;
  }
  
  /**
   * Generate tasks section with active tasks only
   * @param {Array} tasks - Tasks array
   * @param {Array} projects - Projects array for reference
   * @param {Array} goals - Goals array for reference
   * @returns {string} - Formatted text section
   */
  static generateTasksSection(tasks, projects = [], goals = []) {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return '## ACTIVE TASKS\nNo tasks created yet.';
    }
    
    // Create sets of goal and project IDs matching ProfileScreen logic
    const completedGoalIds = new Set();
    const validGoalIds = new Set();
    
    if (Array.isArray(goals)) {
      goals.forEach(goal => {
        if (goal && goal.id) {
          validGoalIds.add(goal.id);
          if (goal.completed === true) {
            completedGoalIds.add(goal.id);
          }
        }
      });
    }
    
    // Create a map of project IDs to titles and track excluded projects
    const projectMap = {};
    const completedProjectsMap = {};
    
    if (Array.isArray(projects)) {
      projects.forEach(project => {
        if (project && project.id) {
          // Mark projects as "completed" for filtering purposes following ProfileScreen logic
          
          // FIRST: Skip projects that belong to deleted goals (goals that no longer exist)
          if (project.goalId && !validGoalIds.has(project.goalId)) {
            completedProjectsMap[project.id] = true;
            return;
          }
          
          // SECOND: Skip projects that belong to completed goals
          if (project.goalId && completedGoalIds.has(project.goalId)) {
            completedProjectsMap[project.id] = true;
            return;
          }
          
          // THIRD: Skip projects that are themselves completed or done
          if (project.completed === true || project.status === 'done') {
            completedProjectsMap[project.id] = true;
            return;
          }
          
          // This is an active project - add to project map
          projectMap[project.id] = project.title;
        }
      });
    }
    
    // Filter for active tasks using ProfileScreen's exact logic
    const activeTasks = tasks.filter(task => {
      // FIRST: Skip tasks that belong to completed projects (which includes all excluded scenarios above)
      if (task.projectId && completedProjectsMap[task.projectId]) {
        return false;
      }
      
      // SECOND: Additional check for tasks directly linked to goals
      if (task.goalId && completedGoalIds.has(task.goalId)) {
        return false;
      }
      
      // THIRD: Skip tasks that are directly linked to deleted goals
      if (task.goalId && !validGoalIds.has(task.goalId)) {
        return false;
      }
      
      // FOURTH: Skip tasks that are themselves completed or done
      if (task.completed || task.status === 'done') {
        return false;
      }
      
      return true;
    });
    
    if (activeTasks.length === 0) {
      return '## ACTIVE TASKS\nNo active tasks.';
    }
    
    let section = `## ACTIVE TASKS (${activeTasks.length})`;
    
    // Sort tasks by due date if available
    const sortedActiveTasks = [...activeTasks].sort((a, b) => {
      // If task has dueDate, use it for sorting
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      // Otherwise, sort by creation date
      const dateA = a.createdAt || 0;
      const dateB = b.createdAt || 0;
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      return new Date(dateA) - new Date(dateB);
    });
    
    // Show up to 10 active tasks
    sortedActiveTasks.slice(0, 10).forEach(task => {
      section += `\n- ${task.title}`;
      
      // Include project association if available (only for active projects)
      if (task.projectId && projectMap[task.projectId]) {
        section += ` (Project: ${projectMap[task.projectId]})`;
      }
      
      // Include due date if available
      if (task.dueDate) {
        section += ` (Due: ${formatDate(task.dueDate).split(',')[0]})`;
      }
    });
    
    if (activeTasks.length > 10) {
      section += `\n- ... and ${activeTasks.length - 10} more active tasks`;
    }
    
    return section;
  }
  
  /**
   * Create system document object from app summary
   * @param {string} appSummary - Generated app summary text
   * @returns {Object} - Document object for storage
   */
  static createSystemDocument(appSummary) {
    console.log('[AppSummaryService] Creating system document object');
    
    const doc = {
      id: APP_CONTEXT_DOCUMENT_ID,
      name: APP_CONTEXT_DOCUMENT_NAME,
      type: 'text/plain',
      isSystemDocument: true, // Flag to identify as system document
      dateAdded: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      size: appSummary.length * 2, // Size in bytes (2 bytes per character)
      processedSize: appSummary.length * 2,
      content: appSummary,
      status: 'completed',
      openaiFileId: APP_CONTEXT_DOCUMENT_ID,
      aiAccessEnabled: true  // System document defaults to AI access enabled
    };
    
    console.log(`[AppSummaryService] System document created with ${appSummary.length} characters`);
    
    return doc;
  }
}

export default AppSummaryService;