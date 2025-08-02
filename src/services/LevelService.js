// src/services/LevelService.js

/**
 * Level threshold definitions
 * Each level requires the specified number of points to reach
 */
const LEVEL_THRESHOLDS = [
  0,      // Level 1 starts at 0
  50,     // Level 2 starts at 50
  100,    // Level 3 starts at 100
  175,    // Level 4 starts at 175
  250,    // Level 5 starts at 250
  350,    // Level 6 starts at 350
  450,    // Level 7 starts at 450
  550,    // Level 8 starts at 550
  650,    // Level 9 starts at 650
  730,    // Level 10 starts at 730
  830,    // Level 11 starts at 830
  1030    // Level 12 starts at 1030
];

/**
 * Level titles corresponding to each level
 */
const LEVEL_TITLES = [
  'Beginner',
  'Intermediate',
  'Professional',
  'Expert',
  'Master',
  'Grand Master',
  'Champion',
  'Legend',
  'Hero',
  'Immortal',
  'Ascendant',
  'Eternal'
];

/**
 * Calculates level based on points
 * @param {number} points - Total achievement points
 * @returns {number} Current level
 */
function calculateLevel(points) {
  let level = 1;
  
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  return level;
}

/**
 * Gets the level title for a given level
 * @param {number} level - The level number
 * @returns {string} The title for the level
 */
function getLevelTitle(level) {
  const index = Math.min(Math.max(0, level - 1), LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[index];
}

/**
 * Gets the threshold points required to reach a specific level
 * @param {number} level - The level to get the threshold for
 * @returns {number} Points needed to reach the level
 */
function getLevelThreshold(level) {
  const index = Math.min(Math.max(0, level - 1), LEVEL_THRESHOLDS.length - 1);
  return LEVEL_THRESHOLDS[index];
}

/**
 * Gets the points needed for the next level
 * @param {number} currentPoints - Current total points
 * @returns {number} Points needed for the next level
 */
function getPointsForNextLevel(currentPoints) {
  const currentLevel = calculateLevel(currentPoints);
  
  // If at max level, return 0
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 0;
  }
  
  const nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel];
  return nextLevelThreshold - currentPoints;
}

/**
 * Gets all level information based on current points
 * @param {number} points - Total achievement points
 * @returns {Object} Level information
 */
function getLevelInfo(points) {
  const level = calculateLevel(points);
  const title = getLevelTitle(level);
  const currentLevelThreshold = getLevelThreshold(level);
  const nextLevelThreshold = level < LEVEL_THRESHOLDS.length ? getLevelThreshold(level + 1) : currentLevelThreshold;
  const pointsForNextLevel = getPointsForNextLevel(points);
  const progressPercent = currentLevelThreshold === nextLevelThreshold ? 100 : 
    Math.round(((points - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100);
  
  return {
    level,
    title,
    currentLevelThreshold,
    nextLevelThreshold,
    pointsForNextLevel,
    progressPercent,
    totalPoints: points
  };
}

/**
 * Check if user has enough points for premium features
 * Useful for teasing premium features at specific levels
 * @param {number} points - Total achievement points
 * @returns {boolean} Whether user has reached premium feature threshold
 */
function hasReachedPremiumFeatureLevel(points) {
  // Assuming we want to tease premium features at level 4
  return calculateLevel(points) >= 4;
}

/**
 * Export the public API
 */
export default {
  calculateLevel,
  getLevelTitle,
  getLevelThreshold,
  getPointsForNextLevel,
  getLevelInfo,
  hasReachedPremiumFeatureLevel,
  LEVEL_THRESHOLDS,
  LEVEL_TITLES
};