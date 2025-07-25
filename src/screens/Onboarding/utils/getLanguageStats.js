// src/screens/Onboarding/utils/getLanguageStats.js
import * as EnglishStats from '../data/ResearchStats';
import * as JapaneseStats from '../data/researchStats.ja';

/**
 * Get the appropriate stats module based on language
 * @param {string} language - The language code ('en', 'ja', etc.)
 * @returns {object} The stats module for the given language
 */
const getStatsModule = (language) => {
  switch (language) {
    case 'ja':
      return JapaneseStats;
    case 'en':
    default:
      return EnglishStats;
  }
};

/**
 * Get all general statistics in the appropriate language
 * @param {string} language - The language code
 * @returns {Array} Array of general statistics
 */
export const getGeneralStats = (language = 'en') => {
  const statsModule = getStatsModule(language);
  return statsModule.getGeneralStats();
};

/**
 * Get statistics specific to a domain in the appropriate language
 * @param {string} domainName - The name of the domain
 * @param {string} language - The language code
 * @returns {Array} Array of domain-specific statistics
 */
export const getDomainStats = (domainName, language = 'en') => {
  const statsModule = getStatsModule(language);
  return statsModule.getDomainStats(domainName);
};

/**
 * Get statistics specific to a goal in the appropriate language
 * @param {string} goalName - The name of the goal
 * @param {string} language - The language code
 * @returns {Array} Array of goal-specific statistics
 */
export const getGoalStats = (goalName, language = 'en') => {
  const statsModule = getStatsModule(language);
  return statsModule.getGoalStats(goalName);
};

/**
 * Get a random statistic from the general category in the appropriate language
 * @param {string} language - The language code
 * @returns {Object} A random general statistic
 */
export const getRandomGeneralStat = (language = 'en') => {
  const statsModule = getStatsModule(language);
  return statsModule.getRandomGeneralStat();
};

/**
 * Get all relevant statistics for a user based on their domain and goal in the appropriate language
 * @param {string} domainName - The user's selected domain
 * @param {string} goalName - The user's selected goal
 * @param {string} language - The language code
 * @returns {Object} Object containing general, domain-specific, goal-specific, and all combined statistics
 */
export const getRelevantStats = (domainName, goalName, language = 'en') => {
  const statsModule = getStatsModule(language);
  return statsModule.getRelevantStats(domainName, goalName);
};

/**
 * Get a featured statistic relevant to the user's selections in the appropriate language
 * @param {string} domainName - The user's selected domain
 * @param {string} goalName - The user's selected goal
 * @param {string} language - The language code
 * @returns {Object} A relevant statistic to feature
 */
export const getFeaturedStat = (domainName, goalName, language = 'en') => {
  const statsModule = getStatsModule(language);
  return statsModule.getFeaturedStat(domainName, goalName);
};

export default {
  getGeneralStats,
  getDomainStats,
  getGoalStats,
  getRandomGeneralStat,
  getRelevantStats,
  getFeaturedStat
};