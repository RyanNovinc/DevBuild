// src/services/AppSummaryService.js
/**
 * Service for generating app context summaries
 * Formats user data into a structured text format for AI consumption
 */

// Import timezone utilities
import { getTodaysDateWithTimezone } from '../utils/timezoneUtils';

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
  static async generateAppSummary(appContext) {
    console.log('[AppSummaryService] Generating app summary');
    
    // Run data integrity audit to clean up orphaned items
    try {
      const DataIntegrityService = require('./DataIntegrityService').default;
      const auditResult = await DataIntegrityService.auditDataIntegrity();
      if (auditResult.fixesApplied > 0) {
        console.log(`[AppSummaryService] Data integrity audit applied ${auditResult.fixesApplied} fixes`);
        // Note: In a real app, we'd want to reload the AppContext after fixes
        // For now, we'll just log this and the next app load will have clean data
      }
    } catch (error) {
      console.warn('[AppSummaryService] Data integrity audit failed:', error);
      // Continue with summary generation even if audit fails
    }
    
    const { goals = [], projects = [], tasks = [], settings = {}, userCountry = null } = appContext;
    
    // Log data sizes for debugging
    console.log(`[AppSummaryService] Data received: ${goals.length} goals, ${projects.length} milestones, ${tasks.length} tasks, country: ${userCountry}`);
    
    // Build sections of the summary
    const profileSection = this.generateProfileSection(settings, userCountry);
    const hierarchySection = this.generateGoalsHierarchy(goals, projects, tasks);
    
    // Combine all sections with a header
    return `# USER APP CONTEXT SUMMARY
Last Updated: ${formatDate(new Date())}

${profileSection}

${hierarchySection}

---
This context summary is automatically generated from the user's app data.
`;
  }
  
  /**
   * Generate profile section
   * @param {Object} settings - App settings containing user profile
   * @param {string} userCountry - User's selected country
   * @returns {string} - Formatted text section
   */
  static generateProfileSection(settings, userCountry) {
    const profile = settings.userProfile || {};
    
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
Today's Date: ${getTodaysDateWithTimezone(userCountry)}`;
  }

  /**
   * Generate complete goals hierarchy with milestones and tasks
   * @param {Array} goals - Goals array
   * @param {Array} projects - Milestones array  
   * @param {Array} tasks - Tasks array
   * @returns {string} - Formatted hierarchical text section
   */
  static generateGoalsHierarchy(goals, projects = [], tasks = []) {
    if (!Array.isArray(goals) || goals.length === 0) {
      return '## GOALS & PROGRESS HIERARCHY\nNo goals created yet.';
    }

    const activeGoals = goals.filter(goal => !goal.completed);
    const completedGoals = goals.filter(goal => goal.completed);

    // Debug logging for goals
    console.log(`[AppSummaryService] Total goals: ${goals.length}, Active: ${activeGoals.length}, Completed: ${completedGoals.length}`);
    if (activeGoals.length > 0) {
      console.log('[AppSummaryService] Active goals:', activeGoals.map(g => ({ title: g.title, targetDate: g.targetDate })));
    }

    let section = '## GOALS & PROGRESS HIERARCHY';

    // ACTIVE GOALS - Full hierarchy with all details
    if (activeGoals.length > 0) {
      section += `\n\n### ACTIVE GOALS (${activeGoals.length})`;
      
      activeGoals.forEach((goal, index) => {
        const goalProgress = goal.progress || 0;
        const goalDomain = goal.domain || 'General';
        const goalDescription = goal.description || '';
        const goalTargetDate = goal.targetDate ? formatDate(goal.targetDate).split(',')[0] : null;
        
        // Debug logging for target date
        console.log(`[AppSummaryService] Goal "${goal.title}": targetDate = ${goal.targetDate}, formatted = ${goalTargetDate}`);
        
        section += `\n\n**Goal ${index + 1}: ${goal.title}** (${goalProgress}% complete - ACTIVE)`;
        section += `\n  📁 Domain: ${goalDomain}`;
        if (goalDescription) {
          section += `\n  📝 Description: ${goalDescription}`;
        }
        if (goalTargetDate) {
          section += `\n  🎯 Target: ${goalTargetDate}`;
        }
        
        // Get all milestones for this goal
        const goalMilestones = projects.filter(project => project.goalId === goal.id);
        
        // Get standalone tasks (tasks directly under goal with no milestone)
        const standaloneGoalTasks = tasks.filter(task => 
          task.goalId === goal.id && !task.projectId
        );

        // Show milestones and their tasks
        if (goalMilestones.length > 0) {
          goalMilestones.forEach((milestone, milestoneIndex) => {
            const milestoneStatus = milestone.completed === true || milestone.status === 'done' ? 'COMPLETED' : 
                                 milestone.status === 'in_progress' ? 'IN PROGRESS' : 'TO DO';
            const milestoneProgress = milestone.progress || 0;
            const statusIcon = milestoneStatus === 'COMPLETED' ? '✅' : 
                              milestoneStatus === 'IN PROGRESS' ? '🔄' : '📋';
            const milestoneDescription = milestone.description || '';
            const milestoneCompletedDate = milestone.completedAt ? formatDate(milestone.completedAt).split(',')[0] : null;
            const milestoneTargetDate = milestone.dueDate ? formatDate(milestone.dueDate).split(',')[0] : null;
            
            section += `\n  ${statusIcon} **Milestone ${milestoneIndex + 1} (under Goal ${index + 1}): ${milestone.title}** (${milestoneStatus} - ${milestoneProgress}%)`;
            if (milestoneDescription) {
              section += `\n    📝 Description: ${milestoneDescription}`;
            }
            if (milestoneTargetDate) {
              section += `\n    🎯 Target: ${milestoneTargetDate}`;
            }
            if (milestoneCompletedDate) {
              section += ` | ✅ Completed: ${milestoneCompletedDate}`;
            }
            
            // Get all tasks for this milestone
            const milestoneTasks = tasks.filter(task => task.projectId === milestone.id);
            
            if (milestoneTasks.length > 0) {
              milestoneTasks.forEach((task, taskIndex) => {
                const taskStatus = task.completed || task.status === 'done' ? 'COMPLETED' : 
                                 task.status === 'in_progress' ? 'IN PROGRESS' : 'TO DO';
                const taskIcon = taskStatus === 'COMPLETED' ? '✅' : 
                               taskStatus === 'IN PROGRESS' ? '🔄' : '📋';
                const taskDescription = task.description || '';
                const taskCompletedDate = task.completedAt ? formatDate(task.completedAt).split(',')[0] : null;
                const taskDueDate = task.dueDate ? formatDate(task.dueDate).split(',')[0] : null;
                
                section += `\n    ${taskIcon} **Task ${taskIndex + 1} (under Milestone ${milestoneIndex + 1}): ${task.title}** (${taskStatus})`;
                if (taskDescription) {
                  section += `\n      📝 Description: ${taskDescription}`;
                }
                if (taskDueDate) {
                  section += `\n      ⏰ Due: ${taskDueDate}`;
                }
                if (taskCompletedDate) {
                  section += ` | ✅ Completed: ${taskCompletedDate}`;
                }
              });
            } else {
              section += `\n    (No tasks created in this milestone yet)`;
            }
          });
        }

        // Show standalone tasks under the goal
        if (standaloneGoalTasks.length > 0) {
          section += `\n  📋 **Standalone Tasks** (directly under Goal ${index + 1})`;
          standaloneGoalTasks.forEach((task, taskIndex) => {
            const taskStatus = task.completed || task.status === 'done' ? 'COMPLETED' : 
                             task.status === 'in_progress' ? 'IN PROGRESS' : 'TO DO';
            const taskIcon = taskStatus === 'COMPLETED' ? '✅' : 
                           taskStatus === 'IN PROGRESS' ? '🔄' : '📋';
            const taskDescription = task.description || '';
            const taskCompletedDate = task.completedAt ? formatDate(task.completedAt).split(',')[0] : null;
            const taskDueDate = task.dueDate ? formatDate(task.dueDate).split(',')[0] : null;
            
            section += `\n    ${taskIcon} **Task ${taskIndex + 1} (under Goal ${index + 1}): ${task.title}** (${taskStatus})`;
            if (taskDescription) {
              section += `\n      📝 Description: ${taskDescription}`;
            }
            if (taskDueDate) {
              section += `\n      ⏰ Due: ${taskDueDate}`;
            }
            if (taskCompletedDate) {
              section += ` | ✅ Completed: ${taskCompletedDate}`;
            }
          });
        }

        // If goal has no milestones or standalone tasks
        if (goalMilestones.length === 0 && standaloneGoalTasks.length === 0) {
          section += `\n  (No milestones or tasks created for Goal ${index + 1} yet)`;
        }
      });
    } else {
      section += `\n\n### ACTIVE GOALS\nNo active goals.`;
    }

    // COMPLETED GOALS - Basic details only to save context
    if (completedGoals.length > 0) {
      section += `\n\n### COMPLETED GOALS (${completedGoals.length})`;
      completedGoals.forEach((goal, index) => {
        const goalDomain = goal.domain || 'General';
        const completedDate = goal.completedAt ? formatDate(goal.completedAt).split(',')[0] : 'Unknown';
        const goalTargetDate = goal.targetDate ? formatDate(goal.targetDate).split(',')[0] : null;
        section += `\n✅ **Goal ${activeGoals.length + index + 1}: ${goal.title}** (COMPLETED)`;
        section += `\n  📁 Domain: ${goalDomain}`;
        if (goalTargetDate) {
          section += ` | 🎯 Target: ${goalTargetDate}`;
        }
        section += ` | ✅ Completed: ${completedDate}`;
      });
    }

    // Show orphaned milestones and tasks (not linked to any goal)
    const orphanedMilestones = projects.filter(project => !project.goalId || 
      !goals.some(goal => goal.id === project.goalId));
    const orphanedTasks = tasks.filter(task => !task.goalId && !task.projectId);

    if (orphanedMilestones.length > 0 || orphanedTasks.length > 0) {
      section += `\n\n### STANDALONE ITEMS`;
      
      if (orphanedMilestones.length > 0) {
        section += `\n\n**Independent Milestones (not linked to any goal):**`;
        orphanedMilestones.forEach((milestone, index) => {
          const milestoneStatus = milestone.completed === true || milestone.status === 'done' ? 'COMPLETED' : 
                               milestone.status === 'in_progress' ? 'IN PROGRESS' : 'TO DO';
          const statusIcon = milestoneStatus === 'COMPLETED' ? '✅' : 
                            milestoneStatus === 'IN PROGRESS' ? '🔄' : '📋';
          const milestoneDescription = milestone.description || '';
          const milestoneCompletedDate = milestone.completedAt ? formatDate(milestone.completedAt).split(',')[0] : null;
          const milestoneTargetDate = milestone.dueDate ? formatDate(milestone.dueDate).split(',')[0] : null;
          
          section += `\n${statusIcon} **Milestone ${index + 1} (independent): ${milestone.title}** (${milestoneStatus})`;
          if (milestoneDescription) {
            section += `\n  📝 Description: ${milestoneDescription}`;
          }
          if (milestoneTargetDate) {
            section += `\n  🎯 Target: ${milestoneTargetDate}`;
          }
          if (milestoneCompletedDate) {
            section += ` | ✅ Completed: ${milestoneCompletedDate}`;
          }
          
          // Show tasks under this orphaned milestone
          const orphanedMilestoneTasks = tasks.filter(task => task.projectId === milestone.id);
          orphanedMilestoneTasks.forEach((task, taskIndex) => {
            const taskStatus = task.completed || task.status === 'done' ? 'COMPLETED' : 
                             task.status === 'in_progress' ? 'IN PROGRESS' : 'TO DO';
            const taskIcon = taskStatus === 'COMPLETED' ? '✅' : 
                           taskStatus === 'IN PROGRESS' ? '🔄' : '📋';
            const taskDescription = task.description || '';
            const taskCompletedDate = task.completedAt ? formatDate(task.completedAt).split(',')[0] : null;
            const taskDueDate = task.dueDate ? formatDate(task.dueDate).split(',')[0] : null;
            
            section += `\n  ${taskIcon} **Task ${taskIndex + 1} (under independent Milestone ${index + 1}): ${task.title}** (${taskStatus})`;
            if (taskDescription) {
              section += `\n    📝 Description: ${taskDescription}`;
            }
            if (taskDueDate) {
              section += `\n    ⏰ Due: ${taskDueDate}`;
            }
            if (taskCompletedDate) {
              section += ` | ✅ Completed: ${taskCompletedDate}`;
            }
          });
        });
      }

      if (orphanedTasks.length > 0) {
        section += `\n\n**Independent Tasks (not linked to any goal or milestone):**`;
        orphanedTasks.forEach((task, index) => {
          const taskStatus = task.completed || task.status === 'done' ? 'COMPLETED' : 
                           task.status === 'in_progress' ? 'IN PROGRESS' : 'TO DO';
          const taskIcon = taskStatus === 'COMPLETED' ? '✅' : 
                         taskStatus === 'IN PROGRESS' ? '🔄' : '📋';
          const taskDescription = task.description || '';
          const taskCompletedDate = task.completedAt ? formatDate(task.completedAt).split(',')[0] : null;
          const taskDueDate = task.dueDate ? formatDate(task.dueDate).split(',')[0] : null;
          
          section += `\n${taskIcon} **Task ${index + 1} (independent): ${task.title}** (${taskStatus})`;
          if (taskDescription) {
            section += `\n  📝 Description: ${taskDescription}`;
          }
          if (taskDueDate) {
            section += `\n  ⏰ Due: ${taskDueDate}`;
          }
          if (taskCompletedDate) {
            section += ` | ✅ Completed: ${taskCompletedDate}`;
          }
        });
      }
    }

    return section;
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
   * Generate milestones section with active milestones only
   * @param {Array} projects - Milestones array
   * @param {Array} goals - Goals array for reference
   * @returns {string} - Formatted text section
   */
  static generateProjectsSection(projects, goals = []) {
    if (!Array.isArray(projects) || projects.length === 0) {
      return '## ACTIVE MILESTONES\nNo milestones created yet.';
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
    
    // Filter for active milestones using ProfileScreen's exact logic
    const activeProjects = projects.filter(project => {
      // FIRST: Skip milestones that belong to deleted goals (goals that no longer exist)
      if (project.goalId && !validGoalIds.has(project.goalId)) {
        return false;
      }
      
      // SECOND: Skip milestones that belong to completed goals
      if (project.goalId && completedGoalIds.has(project.goalId)) {
        return false;
      }
      
      // THIRD: Skip milestones that are themselves completed or done
      if (project.completed === true || project.status === 'done') {
        return false;
      }
      
      // Otherwise, it's active
      return true;
    });
    
    if (activeProjects.length === 0) {
      return '## ACTIVE MILESTONES\nNo active milestones.';
    }
    
    let section = `## ACTIVE MILESTONES (${activeProjects.length})`;
    
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
   * @param {Array} projects - Milestones array for reference
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
    
    // Create a map of milestone IDs to titles and track excluded milestones
    const projectMap = {};
    const completedProjectsMap = {};
    
    if (Array.isArray(projects)) {
      projects.forEach(project => {
        if (project && project.id) {
          // Mark milestones as "completed" for filtering purposes following ProfileScreen logic
          
          // FIRST: Skip milestones that belong to deleted goals (goals that no longer exist)
          if (project.goalId && !validGoalIds.has(project.goalId)) {
            completedProjectsMap[project.id] = true;
            return;
          }
          
          // SECOND: Skip milestones that belong to completed goals
          if (project.goalId && completedGoalIds.has(project.goalId)) {
            completedProjectsMap[project.id] = true;
            return;
          }
          
          // THIRD: Skip milestones that are themselves completed or done
          if (project.completed === true || project.status === 'done') {
            completedProjectsMap[project.id] = true;
            return;
          }
          
          // This is an active milestone - add to milestone map
          projectMap[project.id] = project.title;
        }
      });
    }
    
    // Filter for active tasks using ProfileScreen's exact logic
    const activeTasks = tasks.filter(task => {
      // FIRST: Skip tasks that belong to completed milestones (which includes all excluded scenarios above)
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
      
      // Include milestone association if available (only for active milestones)
      if (task.projectId && projectMap[task.projectId]) {
        section += ` (Milestone: ${projectMap[task.projectId]})`;
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