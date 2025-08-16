// Debug Logger Utility
// Set DEBUG_ENABLED to false to disable all debug logs

const DEBUG_ENABLED = true;
const DEBUG_PREFIX = '🎯🎯🎯 GOAL_COMPLETION_DEBUG 🎯🎯🎯:';

export const debugLog = (...args) => {
  if (DEBUG_ENABLED) {
    console.log(DEBUG_PREFIX, ...args);
  }
};

export const debugError = (...args) => {
  if (DEBUG_ENABLED) {
    console.error(DEBUG_PREFIX, ...args);
  }
};

export const debugWarn = (...args) => {
  if (DEBUG_ENABLED) {
    console.warn(DEBUG_PREFIX, ...args);
  }
};

// To filter logs in the console, search for: "GOAL_DEBUG"
// To disable all debug logs, set DEBUG_ENABLED to false