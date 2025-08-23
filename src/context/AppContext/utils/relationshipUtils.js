// src/context/AppContext/utils/relationshipUtils.js
// Extracted utilities for managing relationships between goals and milestones

import { saveData } from './storageUtils';
import { STORAGE_KEYS } from '../constants';

/**
 * Check if a milestone has a valid parent goal
 * @param {string} milestoneId - The ID of the milestone
 * @param {Array} milestones - Array of all milestones
 * @param {Array} goals - Array of all goals
 * @returns {boolean} - True if milestone has a valid parent goal
 */
export const hasParentGoal = (milestoneId, milestones, goals) => {
  if (!milestoneId || !Array.isArray(milestones) || !Array.isArray(goals)) {
    return false;
  }
  
  // Find the milestone
  const milestone = milestones.find(p => p.id === milestoneId);
  if (!milestone || !milestone.goalId) {
    return false;
  }
  
  // Check if the goal exists
  return goals.some(goal => goal.id === milestone.goalId);
};

/**
 * Get the parent goal for a milestone
 * @param {string} milestoneId - The ID of the milestone
 * @param {Array} milestones - Array of all milestones
 * @param {Array} goals - Array of all goals
 * @returns {Object|null} - The parent goal or null if not found
 */
export const getParentGoal = (milestoneId, milestones, goals) => {
  if (!milestoneId || !Array.isArray(milestones) || !Array.isArray(goals)) {
    return null;
  }
  
  // Find the milestone
  const milestone = milestones.find(p => p.id === milestoneId);
  if (!milestone || !milestone.goalId) {
    return null;
  }
  
  // Find the goal
  return goals.find(goal => goal.id === milestone.goalId) || null;
};

/**
 * Audit and fix goal-milestone relationships
 * @param {Array} milestones - Array of all milestones
 * @param {Array} goals - Array of all goals
 * @param {Object} milestoneGoalLinkMap - Map of milestone IDs to goal IDs
 * @returns {Object} - Object with updated milestones, goals, linkMap, and stats
 */
export const auditMilestoneGoalRelationships = (milestones, goals, milestoneGoalLinkMap = {}) => {
  if (!milestones || !goals) return { 
    milestones, 
    goals, 
    milestoneGoalLinkMap,
    stats: { issuesFound: 0, fixesApplied: 0 }
  };
  
  let issuesFound = 0;
  let fixesApplied = 0;
  const updatedMilestones = [...milestones];
  const updatedLinkMap = { ...milestoneGoalLinkMap };
  let needsUpdate = false;
  
  // Check each milestone for valid goal references
  milestones.forEach((milestone, index) => {
    if (milestone.goalId) {
      const goalExists = goals.some(goal => goal.id === milestone.goalId);
      if (!goalExists) {
        console.warn(`Milestone "${milestone.title}" (ID: ${milestone.id}) references nonexistent goal ID: ${milestone.goalId}`);
        
        // Try to fix by goalTitle
        if (milestone.goalTitle) {
          const matchingGoal = goals.find(goal => 
            goal.title.toLowerCase() === milestone.goalTitle.toLowerCase()
          );
          
          if (matchingGoal) {
            console.log(`Fixing goal link for milestone "${milestone.title}" - linking to goal "${matchingGoal.title}"`);
            updatedMilestones[index].goalId = matchingGoal.id;
            updatedLinkMap[milestone.id] = matchingGoal.id;
            fixesApplied++;
            needsUpdate = true;
          } else {
            // Clear the invalid goal ID
            updatedMilestones[index].goalId = null;
            delete updatedLinkMap[milestone.id];
            needsUpdate = true;
            issuesFound++;
          }
        }
      } else {
        // Goal exists, but check if goalTitle matches
        const goal = goals.find(g => g.id === milestone.goalId);
        if (goal && goal.title !== milestone.goalTitle) {
          console.log(`Fixing mismatched goal title for milestone "${milestone.title}" - should be "${goal.title}"`);
          updatedMilestones[index].goalTitle = goal.title;
          needsUpdate = true;
          fixesApplied++;
        }
      }
    }
  });
  
  return {
    milestones: updatedMilestones,
    goals,
    milestoneGoalLinkMap: updatedLinkMap,
    needsUpdate,
    stats: {
      issuesFound,
      fixesApplied
    }
  };
};

/**
 * Link milestones to goals by title
 * @param {Array} milestones - Array of all milestones
 * @param {Array} goals - Array of all goals
 * @param {Object} milestoneGoalLinkMap - Map of milestone IDs to goal IDs
 * @returns {Object} - Object with updated milestones, linkMap, and fixCount
 */
export const linkMilestonesToGoalsByTitle = (milestones, goals, milestoneGoalLinkMap = {}) => {
  if (!Array.isArray(milestones) || !Array.isArray(goals)) {
    return { milestones, milestoneGoalLinkMap, fixCount: 0 };
  }
  
  let fixCount = 0;
  
  // Look for milestones without goalId but with goalTitle
  const updatedMilestones = milestones.map(milestone => {
    if (!milestone.goalId && milestone.goalTitle) {
      // Try to find goal by title
      const matchingGoal = goals.find(goal => 
        goal.title.toLowerCase() === milestone.goalTitle.toLowerCase()
      );
      
      if (matchingGoal) {
        fixCount++;
        return {
          ...milestone,
          goalId: matchingGoal.id,
          goalTitle: matchingGoal.title, // Ensure exact case match
          // Inherit domain and color if not already set
          domain: milestone.domain || matchingGoal.domain,
          color: milestone.color || matchingGoal.color
        };
      }
    }
    
    return milestone;
  });
  
  // Update link map
  const updatedLinkMap = { ...milestoneGoalLinkMap };
  updatedMilestones.forEach(milestone => {
    if (milestone.goalId) {
      updatedLinkMap[milestone.id] = milestone.goalId;
    }
  });
  
  return {
    milestones: updatedMilestones,
    milestoneGoalLinkMap: updatedLinkMap,
    fixCount
  };
};

/**
 * Clean up orphaned milestones (milestones with invalid goal IDs)
 * @param {Array} milestones - Array of all milestones
 * @param {Array} goals - Array of all goals
 * @param {Object} milestoneGoalLinkMap - Map of milestone IDs to goal IDs
 * @returns {Object} - Object with updated milestones, linkMap, and orphanCount
 */
export const cleanupOrphanedMilestones = (milestones, goals, milestoneGoalLinkMap = {}) => {
  if (!Array.isArray(milestones) || !Array.isArray(goals)) {
    return { milestones, milestoneGoalLinkMap, orphanCount: 0 };
  }
  
  // Find valid goal IDs
  const validGoalIds = goals.map(goal => goal.id);
  
  // Find orphaned milestones
  const orphanedMilestones = milestones.filter(milestone => 
    milestone.goalId && !validGoalIds.includes(milestone.goalId)
  );
  
  if (orphanedMilestones.length === 0) {
    return { milestones, milestoneGoalLinkMap, orphanCount: 0 };
  }
  
  console.log(`Found ${orphanedMilestones.length} orphaned milestones to convert to standalone`);
  
  // Convert orphaned milestones to standalone (remove goal references)
  const updatedMilestones = milestones.map(milestone => {
    if (milestone.goalId && !validGoalIds.includes(milestone.goalId)) {
      // Convert to standalone milestone
      return {
        ...milestone,
        goalId: null,
        goalTitle: null
      };
    }
    return milestone;
  });
  
  // Update link map
  const updatedLinkMap = { ...milestoneGoalLinkMap };
  orphanedMilestones.forEach(milestone => {
    delete updatedLinkMap[milestone.id];
  });
  
  return {
    milestones: updatedMilestones,
    milestoneGoalLinkMap: updatedLinkMap,
    orphanCount: orphanedMilestones.length
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
    // Save updated milestones
    await saveData(STORAGE_KEYS.MILESTONES, auditResults.milestones);
    
    // Save updated link map
    await saveData(STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, auditResults.milestoneGoalLinkMap);
    
    return true;
  } catch (error) {
    console.error('Error saving audit results:', error);
    return false;
  }
};