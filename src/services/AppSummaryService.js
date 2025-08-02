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
    
    const { goals = [], projects = [], tasks = [], settings = {} } = appContext;
    
    // Log data sizes for debugging
    console.log(`[AppSummaryService] Data received: ${goals.length} goals, ${projects.length} projects, ${tasks.length} tasks`);
    
    // Build sections of the summary
    const profileSection = this.generateProfileSection(settings);
    const goalsSection = this.generateGoalsSection(goals);
    const projectsSection = this.generateProjectsSection(projects, goals);
    const tasksSection = this.generateTasksSection(tasks, projects);
    
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
   * @returns {string} - Formatted text section
   */
  static generateProfileSection(settings) {
    const profile = settings.userProfile || {};
    const lifeDirection = settings.lifeDirection || '';
    
    return `## USER PROFILE
Name: ${profile.name || 'Not specified'}
${profile.bio ? `Bio: ${profile.bio}` : ''}

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
   * Generate projects section with active and completed projects
   * @param {Array} projects - Projects array
   * @param {Array} goals - Goals array for reference
   * @returns {string} - Formatted text section
   */
  static generateProjectsSection(projects, goals = []) {
    if (!Array.isArray(projects) || projects.length === 0) {
      return '## PROJECTS\nNo projects created yet.';
    }
    
    // Create a map of goal IDs to titles for quick lookup
    const goalMap = {};
    if (Array.isArray(goals)) {
      goals.forEach(goal => {
        if (goal && goal.id) {
          goalMap[goal.id] = goal.title;
        }
      });
    }
    
    const activeProjects = projects.filter(project => !project.completed && project.status !== 'done');
    const completedProjects = projects.filter(project => project.completed || project.status === 'done');
    
    let section = `## PROJECTS (${projects.length} total)`;
    
    if (activeProjects.length > 0) {
      section += `\n\n### ACTIVE PROJECTS (${activeProjects.length})`;
      activeProjects.forEach(project => {
        // Get current status label
        let statusLabel = 'To Do';
        if (project.status === 'in_progress') statusLabel = 'In Progress';
        else if (project.status === 'done') statusLabel = 'Done';
        
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
    }
    
    if (completedProjects.length > 0) {
      section += `\n\n### COMPLETED PROJECTS (${completedProjects.length})`;
      
      // Sort completed projects by completion date (if available)
      const sortedCompletedProjects = [...completedProjects].sort((a, b) => {
        const dateA = a.completedAt || a.updatedAt || a.createdAt;
        const dateB = b.completedAt || b.updatedAt || b.createdAt;
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        return new Date(dateB) - new Date(dateA); // Most recent first
      });
      
      // Show only the 5 most recently completed projects
      sortedCompletedProjects.slice(0, 5).forEach(project => {
        section += `\n- ${project.title}`;
        
        // Include goal association if available
        if (project.goalId && goalMap[project.goalId]) {
          section += ` (Part of goal: ${goalMap[project.goalId]})`;
        } else if (project.goalTitle) {
          section += ` (Part of goal: ${project.goalTitle})`;
        }
      });
      
      if (completedProjects.length > 5) {
        section += `\n- ... and ${completedProjects.length - 5} more completed projects`;
      }
    }
    
    return section;
  }
  
  /**
   * Generate tasks section with active and completed tasks
   * @param {Array} tasks - Tasks array
   * @param {Array} projects - Projects array for reference
   * @returns {string} - Formatted text section
   */
  static generateTasksSection(tasks, projects = []) {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return '## TASKS\nNo tasks created yet.';
    }
    
    // Create a map of project IDs to titles for quick lookup
    const projectMap = {};
    if (Array.isArray(projects)) {
      projects.forEach(project => {
        if (project && project.id) {
          projectMap[project.id] = project.title;
        }
      });
    }
    
    const activeTasks = tasks.filter(task => !task.completed && task.status !== 'done');
    const completedTasks = tasks.filter(task => task.completed || task.status === 'done');
    
    let section = `## TASKS (${tasks.length} total)`;
    
    if (activeTasks.length > 0) {
      section += `\n\n### ACTIVE TASKS (${activeTasks.length})`;
      
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
        
        // Include project association if available
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
    }
    
    if (completedTasks.length > 0) {
      section += `\n\n### RECENTLY COMPLETED TASKS`;
      
      // Sort completed tasks by completion date (if available)
      const sortedCompletedTasks = [...completedTasks].sort((a, b) => {
        const dateA = a.completedAt || a.updatedAt || a.createdAt;
        const dateB = b.completedAt || b.updatedAt || b.createdAt;
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        return new Date(dateB) - new Date(dateA); // Most recent first
      });
      
      // Show only 5 most recent completed tasks
      sortedCompletedTasks.slice(0, 5).forEach(task => {
        section += `\n- ${task.title}`;
        
        // Include project association if available
        if (task.projectId && projectMap[task.projectId]) {
          section += ` (Project: ${projectMap[task.projectId]})`;
        }
      });
      
      if (completedTasks.length > 5) {
        section += `\n- ... and ${completedTasks.length - 5} more completed tasks`;
      }
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
      openaiFileId: APP_CONTEXT_DOCUMENT_ID
    };
    
    console.log(`[AppSummaryService] System document created with ${appSummary.length} characters`);
    
    return doc;
  }
}

export default AppSummaryService;