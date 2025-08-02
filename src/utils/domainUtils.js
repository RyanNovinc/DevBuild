// src/utils/domainUtils.js
// Utilities for handling domain normalization across the app

import { STANDARD_DOMAINS, getDomainByName, getDomainByIcon } from '../constants/domains';

/**
 * Normalize domain information in a goal or project object
 * This ensures consistent domain representation across the app
 * 
 * @param {Object} item - The goal or project object
 * @returns {Object} The normalized object with consistent domain info
 */
export const normalizeDomain = (item) => {
  if (!item) return item;
  
  // Create a copy to avoid mutating the original
  const normalized = { ...item };
  
  // Find domain information based on item properties
  let domainName = null;
  let domainIcon = null;
  let domainColor = null;
  
  // Priority 1: Check for explicit domain name
  if (normalized.domain) {
    const matchedDomain = getDomainByName(normalized.domain);
    
    if (matchedDomain) {
      // Found a standard domain match - use all its properties
      domainName = matchedDomain.name; // Use exact case from standard domains
      domainIcon = matchedDomain.icon;
      domainColor = matchedDomain.color;
    } else {
      // Non-standard domain - keep as is but try to determine icon/color
      domainName = normalized.domain;
      
      // Try to find a domain with matching icon if we have an icon
      if (normalized.icon) {
        const domainWithIcon = STANDARD_DOMAINS.find(d => d.icon === normalized.icon);
        if (domainWithIcon) {
          domainIcon = domainWithIcon.icon;
          domainColor = normalized.color || domainWithIcon.color;
        }
      }
    }
  }
  
  // Priority 2: If no domain found by name, try by icon
  if (!domainName && normalized.icon) {
    const domainFromIcon = getDomainByIcon(normalized.icon);
    if (domainFromIcon) {
      const matchedDomain = getDomainByName(domainFromIcon);
      if (matchedDomain) {
        domainName = matchedDomain.name;
        domainIcon = matchedDomain.icon;
        domainColor = normalized.color || matchedDomain.color;
      }
    }
  }
  
  // Priority 3: If still no domain found, set default as "Other"
  if (!domainName) {
    const otherDomain = STANDARD_DOMAINS.find(d => d.name === "Other");
    if (otherDomain) {
      domainName = "Other";
      domainIcon = otherDomain.icon;
      domainColor = normalized.color || otherDomain.color;
    }
  }
  
  // Update the object with normalized values
  normalized.domain = domainName;
  normalized.domainName = domainName; // Set both for backward compatibility
  
  // Only set icon if missing or if we have a standard icon for this domain
  if (!normalized.icon && domainIcon) {
    normalized.icon = domainIcon;
  }
  
  // Only set color if missing or if we have a standard color for this domain
  if (!normalized.color && domainColor) {
    normalized.color = domainColor;
  }
  
  return normalized;
};

/**
 * Get all goals for a specific domain
 * 
 * @param {Array} goals - The array of goals
 * @param {string} domainName - The domain name to filter by
 * @returns {Array} Filtered goals
 */
export const getGoalsByDomain = (goals, domainName) => {
  if (!Array.isArray(goals) || !domainName) return [];
  
  // Normalize the target domain name for comparison
  const targetDomain = getDomainByName(domainName);
  const normalizedTargetName = targetDomain ? targetDomain.name : domainName;
  
  return goals.filter(goal => {
    // For goals with explicit domain
    if (goal.domain || goal.domainName) {
      const goalDomainName = goal.domain || goal.domainName;
      const matchedDomain = getDomainByName(goalDomainName);
      const normalizedGoalDomain = matchedDomain ? matchedDomain.name : goalDomainName;
      
      // Check if normalized domains match
      if (normalizedGoalDomain.toLowerCase() === normalizedTargetName.toLowerCase()) {
        return true;
      }
    }
    
    // For goals without domain but with icon, check if icon belongs to target domain
    if (!goal.domain && goal.icon) {
      const domainFromIcon = getDomainByIcon(goal.icon);
      if (domainFromIcon.toLowerCase() === normalizedTargetName.toLowerCase()) {
        return true;
      }
    }
    
    return false;
  });
};

/**
 * Calculate domain distribution from goals
 * 
 * @param {Array} goals - The array of goals
 * @param {boolean} activeOnly - Whether to count only active goals
 * @returns {Array} Domain distribution data
 */
export const calculateDomainDistribution = (goals, activeOnly = false) => {
  if (!Array.isArray(goals)) return [];
  
  const domainMap = {};
  
  // Initialize domain map with standard domains
  STANDARD_DOMAINS.forEach(domain => {
    domainMap[domain.name] = {
      id: domain.name,
      name: domain.name,
      icon: domain.icon,
      color: domain.color,
      goalCount: 0,
      completedGoalCount: 0,
      activeGoalCount: 0,
      upcomingDeadlines: 0,
      inactiveForDays: 0,
      description: domain.description || ''
    };
  });
  
  const now = new Date();
  
  // Process each goal
  goals.forEach(goal => {
    if (!goal) return;
    
    // Skip completed goals if only counting active
    if (activeOnly && goal.completed === true) {
      return;
    }
    
    // Normalize the goal to ensure consistent domain info
    const normalizedGoal = normalizeDomain(goal);
    const domainName = normalizedGoal.domain || "Other";
    
    // Get domain info from our map (or create if not exists)
    if (!domainMap[domainName]) {
      // Handle non-standard domains
      const matchedDomain = getDomainByName(domainName);
      if (matchedDomain) {
        // Use standard domain if there's a match
        domainMap[matchedDomain.name] = domainMap[matchedDomain.name] || {
          id: matchedDomain.name,
          name: matchedDomain.name,
          icon: matchedDomain.icon,
          color: matchedDomain.color,
          goalCount: 0,
          completedGoalCount: 0,
          activeGoalCount: 0,
          upcomingDeadlines: 0,
          inactiveForDays: 0,
          description: matchedDomain.description || ''
        };
      } else {
        // Create entry for custom domain
        domainMap[domainName] = {
          id: domainName,
          name: domainName,
          icon: normalizedGoal.icon || "star",
          color: normalizedGoal.color || "#14b8a6",
          goalCount: 0,
          completedGoalCount: 0,
          activeGoalCount: 0,
          upcomingDeadlines: 0,
          inactiveForDays: 0,
          description: ""
        };
      }
    }
    
    const isCompleted = goal.completed === true;
    
    // Update domain stats
    const domainEntry = domainMap[domainName];
    domainEntry.goalCount++;
    
    if (isCompleted) {
      domainEntry.completedGoalCount++;
    } else {
      domainEntry.activeGoalCount++;
      
      // Check for upcoming deadlines (within 7 days)
      if (goal.targetDate) {
        const daysUntilDeadline = Math.floor((new Date(goal.targetDate) - now) / (1000 * 60 * 60 * 24));
        if (daysUntilDeadline >= 0 && daysUntilDeadline <= 7) {
          domainEntry.upcomingDeadlines++;
        }
      }
      
      // Check for inactivity (no updates in 30+ days)
      if (goal.updatedAt) {
        const daysSinceUpdate = Math.floor((now - new Date(goal.updatedAt)) / (1000 * 60 * 60 * 24));
        if (daysSinceUpdate > 30) {
          domainEntry.inactiveForDays = Math.max(domainEntry.inactiveForDays, daysSinceUpdate);
        }
      }
    }
  });
  
  // Convert domain map to array
  return Object.values(domainMap);
};