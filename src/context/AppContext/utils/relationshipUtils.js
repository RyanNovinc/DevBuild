// src/context/AppContext/utils/relationshipUtils.js
// Extracted utilities for managing relationships between goals and projects

import { saveData } from './storageUtils';
import { STORAGE_KEYS } from '../constants';

/**
 * Check if a project has a valid parent goal
 * @param {string} projectId - The ID of the project
 * @param {Array} projects - Array of all projects
 * @param {Array} goals - Array of all goals
 * @returns {boolean} - True if project has a valid parent goal
 */
export const hasParentGoal = (projectId, projects, goals) => {
  if (!projectId || !Array.isArray(projects) || !Array.isArray(goals)) {
    return false;
  }
  
  // Find the project
  const project = projects.find(p => p.id === projectId);
  if (!project || !project.goalId) {
    return false;
  }
  
  // Check if the goal exists
  return goals.some(goal => goal.id === project.goalId);
};

/**
 * Get the parent goal for a project
 * @param {string} projectId - The ID of the project
 * @param {Array} projects - Array of all projects
 * @param {Array} goals - Array of all goals
 * @returns {Object|null} - The parent goal or null if not found
 */
export const getParentGoal = (projectId, projects, goals) => {
  if (!projectId || !Array.isArray(projects) || !Array.isArray(goals)) {
    return null;
  }
  
  // Find the project
  const project = projects.find(p => p.id === projectId);
  if (!project || !project.goalId) {
    return null;
  }
  
  // Find the goal
  return goals.find(goal => goal.id === project.goalId) || null;
};

/**
 * Audit and fix goal-project relationships
 * @param {Array} projects - Array of all projects
 * @param {Array} goals - Array of all goals
 * @param {Object} projectGoalLinkMap - Map of project IDs to goal IDs
 * @returns {Object} - Object with updated projects, goals, linkMap, and stats
 */
export const auditProjectGoalRelationships = (projects, goals, projectGoalLinkMap = {}) => {
  if (!projects || !goals) return { 
    projects, 
    goals, 
    projectGoalLinkMap,
    stats: { issuesFound: 0, fixesApplied: 0 }
  };
  
  let issuesFound = 0;
  let fixesApplied = 0;
  const updatedProjects = [...projects];
  const updatedLinkMap = { ...projectGoalLinkMap };
  let needsUpdate = false;
  
  // Check each project for valid goal references
  projects.forEach((project, index) => {
    if (project.goalId) {
      const goalExists = goals.some(goal => goal.id === project.goalId);
      if (!goalExists) {
        console.warn(`Project "${project.title}" (ID: ${project.id}) references nonexistent goal ID: ${project.goalId}`);
        
        // Try to fix by goalTitle
        if (project.goalTitle) {
          const matchingGoal = goals.find(goal => 
            goal.title.toLowerCase() === project.goalTitle.toLowerCase()
          );
          
          if (matchingGoal) {
            console.log(`Fixing goal link for project "${project.title}" - linking to goal "${matchingGoal.title}"`);
            updatedProjects[index].goalId = matchingGoal.id;
            updatedLinkMap[project.id] = matchingGoal.id;
            fixesApplied++;
            needsUpdate = true;
          } else {
            // Clear the invalid goal ID
            updatedProjects[index].goalId = null;
            delete updatedLinkMap[project.id];
            needsUpdate = true;
            issuesFound++;
          }
        }
      } else {
        // Goal exists, but check if goalTitle matches
        const goal = goals.find(g => g.id === project.goalId);
        if (goal && goal.title !== project.goalTitle) {
          console.log(`Fixing mismatched goal title for project "${project.title}" - should be "${goal.title}"`);
          updatedProjects[index].goalTitle = goal.title;
          needsUpdate = true;
          fixesApplied++;
        }
      }
    }
  });
  
  return {
    projects: updatedProjects,
    goals,
    projectGoalLinkMap: updatedLinkMap,
    needsUpdate,
    stats: {
      issuesFound,
      fixesApplied
    }
  };
};

/**
 * Link projects to goals by title
 * @param {Array} projects - Array of all projects
 * @param {Array} goals - Array of all goals
 * @param {Object} projectGoalLinkMap - Map of project IDs to goal IDs
 * @returns {Object} - Object with updated projects, linkMap, and fixCount
 */
export const linkProjectsToGoalsByTitle = (projects, goals, projectGoalLinkMap = {}) => {
  if (!Array.isArray(projects) || !Array.isArray(goals)) {
    return { projects, projectGoalLinkMap, fixCount: 0 };
  }
  
  let fixCount = 0;
  
  // Look for projects without goalId but with goalTitle
  const updatedProjects = projects.map(project => {
    if (!project.goalId && project.goalTitle) {
      // Try to find goal by title
      const matchingGoal = goals.find(goal => 
        goal.title.toLowerCase() === project.goalTitle.toLowerCase()
      );
      
      if (matchingGoal) {
        fixCount++;
        return {
          ...project,
          goalId: matchingGoal.id,
          goalTitle: matchingGoal.title, // Ensure exact case match
          // Inherit domain and color if not already set
          domain: project.domain || matchingGoal.domain,
          color: project.color || matchingGoal.color
        };
      }
    }
    
    return project;
  });
  
  // Update link map
  const updatedLinkMap = { ...projectGoalLinkMap };
  updatedProjects.forEach(project => {
    if (project.goalId) {
      updatedLinkMap[project.id] = project.goalId;
    }
  });
  
  return {
    projects: updatedProjects,
    projectGoalLinkMap: updatedLinkMap,
    fixCount
  };
};

/**
 * Clean up orphaned projects (projects with invalid goal IDs)
 * @param {Array} projects - Array of all projects
 * @param {Array} goals - Array of all goals
 * @param {Object} projectGoalLinkMap - Map of project IDs to goal IDs
 * @returns {Object} - Object with updated projects, linkMap, and orphanCount
 */
export const cleanupOrphanedProjects = (projects, goals, projectGoalLinkMap = {}) => {
  if (!Array.isArray(projects) || !Array.isArray(goals)) {
    return { projects, projectGoalLinkMap, orphanCount: 0 };
  }
  
  // Find valid goal IDs
  const validGoalIds = goals.map(goal => goal.id);
  
  // Find orphaned projects
  const orphanedProjects = projects.filter(project => 
    project.goalId && !validGoalIds.includes(project.goalId)
  );
  
  if (orphanedProjects.length === 0) {
    return { projects, projectGoalLinkMap, orphanCount: 0 };
  }
  
  console.log(`Found ${orphanedProjects.length} orphaned projects to clean up`);
  
  // Make orphaned projects independent (remove goal references)
  const updatedProjects = projects.map(project => {
    if (project.goalId && !validGoalIds.includes(project.goalId)) {
      // Convert to independent project
      return {
        ...project,
        goalId: null,
        goalTitle: null
      };
    }
    return project;
  });
  
  // Update link map
  const updatedLinkMap = { ...projectGoalLinkMap };
  orphanedProjects.forEach(project => {
    delete updatedLinkMap[project.id];
  });
  
  return {
    projects: updatedProjects,
    projectGoalLinkMap: updatedLinkMap,
    orphanCount: orphanedProjects.length
  };
};

/**
 * Save audit results to AsyncStorage
 * @param {Object} auditResults - Results from audit function
 * @returns {Promise<boolean>} - True if saved successfully
 */
export const saveAuditResults = async (auditResults) => {
  if (!auditResults || !auditResults.needsUpdate) {
    return false;
  }
  
  try {
    // Save updated projects
    await saveData(STORAGE_KEYS.PROJECTS, auditResults.projects);
    
    // Save updated link map
    await saveData(STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, auditResults.projectGoalLinkMap);
    
    return true;
  } catch (error) {
    console.error('Error saving audit results:', error);
    return false;
  }
};