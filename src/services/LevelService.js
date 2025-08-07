// src/services/LevelService.js

/**
 * Stage threshold definitions
 * Each stage requires the specified number of points to reach
 */
const STAGE_THRESHOLDS = [
  0,      // Stage 1 starts at 0
  50,     // Stage 2 starts at 50
  100,    // Stage 3 starts at 100
  175,    // Stage 4 starts at 175
  250,    // Stage 5 starts at 250
  350,    // Stage 6 starts at 350
  450,    // Stage 7 starts at 450
  550,    // Stage 8 starts at 550
  650,    // Stage 9 starts at 650
  730,    // Stage 10 starts at 730
  830,    // Stage 11 starts at 830
  1030    // Stage 12 starts at 1030
];

/**
 * Stage titles corresponding to each stage
 */
const STAGE_TITLES = [
  'Explorer',
  'Achiever',
  'Contributor',
  'Specialist',
  'Practitioner',
  'Professional',
  'Innovator',
  'Leader',
  'Strategist',
  'Visionary',
  'Pioneer',
  'Trailblazer'
];

/**
 * Calculates stage based on score
 * @param {number} points - Total achievement score
 * @returns {number} Current stage
 */
function calculateStage(points) {
  let stage = 1;
  
  for (let i = 1; i < STAGE_THRESHOLDS.length; i++) {
    if (points >= STAGE_THRESHOLDS[i]) {
      stage = i + 1;
    } else {
      break;
    }
  }
  
  return stage;
}

/**
 * Gets the stage title for a given stage
 * @param {number} stage - The stage number
 * @returns {string} The title for the stage
 */
function getStageTitle(stage) {
  const index = Math.min(Math.max(0, stage - 1), STAGE_TITLES.length - 1);
  return STAGE_TITLES[index];
}

/**
 * Gets the threshold score required to reach a specific stage
 * @param {number} stage - The stage to get the threshold for
 * @returns {number} Score needed to reach the stage
 */
function getStageThreshold(stage) {
  const index = Math.min(Math.max(0, stage - 1), STAGE_THRESHOLDS.length - 1);
  return STAGE_THRESHOLDS[index];
}

/**
 * Gets the score needed for the next stage
 * @param {number} currentPoints - Current total score
 * @returns {number} Score needed for the next stage
 */
function getPointsForNextStage(currentPoints) {
  const currentStage = calculateStage(currentPoints);
  
  // If at max stage, return 0
  if (currentStage >= STAGE_THRESHOLDS.length) {
    return 0;
  }
  
  const nextStageThreshold = STAGE_THRESHOLDS[currentStage];
  return nextStageThreshold - currentPoints;
}

/**
 * Gets all stage information based on current score
 * @param {number} points - Total achievement score
 * @returns {Object} Stage information
 */
function getStageInfo(points) {
  const stage = calculateStage(points);
  const title = getStageTitle(stage);
  const currentStageThreshold = getStageThreshold(stage);
  const nextStageThreshold = stage < STAGE_THRESHOLDS.length ? getStageThreshold(stage + 1) : currentStageThreshold;
  const scoreForNextStage = getPointsForNextStage(points);
  const progressPercent = currentStageThreshold === nextStageThreshold ? 100 : 
    Math.round(((points - currentStageThreshold) / (nextStageThreshold - currentStageThreshold)) * 100);
  
  return {
    stage,
    title,
    currentStageThreshold,
    nextStageThreshold,
    scoreForNextStage,
    progressPercent,
    totalScore: points
  };
}

/**
 * Check if user has enough score for premium features
 * Useful for teasing premium features at specific stages
 * @param {number} points - Total achievement score
 * @returns {boolean} Whether user has reached premium feature threshold
 */
function hasReachedPremiumFeatureStage(points) {
  // Assuming we want to tease premium features at stage 4
  return calculateStage(points) >= 4;
}

/**
 * Export the public API
 */
export default {
  // New stage-based API
  calculateStage,
  getStageTitle,
  getStageThreshold,
  getPointsForNextStage,
  getStageInfo,
  hasReachedPremiumFeatureStage,
  STAGE_THRESHOLDS,
  STAGE_TITLES,
  
  // Backwards compatibility - alias old methods to new ones
  calculateLevel: calculateStage,
  getLevelTitle: getStageTitle,
  getLevelThreshold: getStageThreshold,
  getPointsForNextLevel: getPointsForNextStage,
  getLevelInfo: getStageInfo,
  hasReachedPremiumFeatureLevel: hasReachedPremiumFeatureStage,
  LEVEL_THRESHOLDS: STAGE_THRESHOLDS,
  LEVEL_TITLES: STAGE_TITLES
};