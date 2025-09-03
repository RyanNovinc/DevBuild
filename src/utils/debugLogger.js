// Enhanced Debug Logger Utility for Focused Debugging
// Allows filtering console output to only show specific categories

class DebugLogger {
  constructor() {
    this.enabledCategories = new Set();
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info
    };
    this.isFiltered = false;
  }

  // Enable specific logging categories
  enableCategories(categories) {
    if (Array.isArray(categories)) {
      categories.forEach(cat => this.enabledCategories.add(cat.toLowerCase()));
    } else {
      this.enabledCategories.add(categories.toLowerCase());
    }
  }

  // Clear all enabled categories
  clearCategories() {
    this.enabledCategories.clear();
  }

  // Enable filtering - only show logs from enabled categories
  startFiltering() {
    this.isFiltered = true;
    
    // Override console methods
    console.log = (...args) => this.filteredLog('log', ...args);
    console.warn = (...args) => this.filteredLog('warn', ...args);
    console.error = (...args) => this.filteredLog('error', ...args);
    console.info = (...args) => this.filteredLog('info', ...args);
  }

  // Disable filtering - restore original console
  stopFiltering() {
    this.isFiltered = false;
    
    // Restore original console methods
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.info = this.originalConsole.info;
  }

  // Check if a log message should be shown
  shouldLog(message) {
    if (!this.isFiltered || this.enabledCategories.size === 0) {
      return true;
    }

    const messageStr = typeof message === 'string' ? message.toLowerCase() : JSON.stringify(message).toLowerCase();
    
    // Check if message contains any enabled category keywords
    for (const category of this.enabledCategories) {
      if (messageStr.includes(category)) {
        return true;
      }
    }
    
    return false;
  }

  // Filtered logging method
  filteredLog(type, ...args) {
    // Always show if no filtering or if any arg matches enabled categories
    if (!this.isFiltered || args.some(arg => this.shouldLog(arg))) {
      this.originalConsole[type](...args);
    }
  }

  // Direct logging methods for specific categories (always shown when called)
  timeblock(...args) {
    this.originalConsole.log('🔥 TIMEBLOCK_DEBUG:', ...args);
  }

  ai(...args) {
    this.originalConsole.log('🤖 AI_DEBUG:', ...args);
  }

  modal(...args) {
    this.originalConsole.log('📱 MODAL_DEBUG:', ...args);
  }

  date(...args) {
    this.originalConsole.log('📅 DATE_DEBUG:', ...args);
  }

  recurring(...args) {
    this.originalConsole.log('🔄 RECURRING_DEBUG:', ...args);
  }

  // Clear console
  clear() {
    console.clear();
  }

  // Show current configuration
  status() {
    this.originalConsole.log('🔧 DebugLogger Status:');
    this.originalConsole.log('  - Filtering enabled:', this.isFiltered);
    this.originalConsole.log('  - Enabled categories:', Array.from(this.enabledCategories));
  }
}

// Create singleton instance
const debugLogger = new DebugLogger();

// Preset configurations for common debugging scenarios
export const LogPresets = {
  // Focus only on timeblock creation and date/time parsing
  TIMEBLOCK_FOCUS: () => {
    debugLogger.clear();
    debugLogger.clearCategories();
    debugLogger.enableCategories([
      'timeblock', 'parseaitime', 'starttime', 'endtime', 'date', 'time', 
      'recurring', 'repeat', 'isrepeating', 'repeatfrequency', 'repeatuntil',
      '⏰', '🔥', '📅', '🔄', 'timeblockdata', 'initialvalue', 'fallback',
      'createtimeblock', 'aitime', 'timestring', 'modal', 'mounted'
    ]);
    debugLogger.startFiltering();
    debugLogger.originalConsole.log('');
    debugLogger.originalConsole.log('🔥🔥🔥 TIMEBLOCK FOCUS MODE ENABLED 🔥🔥🔥');
    debugLogger.originalConsole.log('Only timeblock/date/time related logs will show');
    debugLogger.originalConsole.log('Use LogPresets.RESTORE_ALL() to restore all logs');
    debugLogger.originalConsole.log('');
  },

  // Focus only on AI processing and actions
  AI_FOCUS: () => {
    debugLogger.clear();
    debugLogger.clearCategories();
    debugLogger.enableCategories([
      'ai', 'websocket', 'action', 'createtimeblock', 'function', 'tool',
      '🤖', 'processing', 'queue', 'timeblockmodalvisible'
    ]);
    debugLogger.startFiltering();
    debugLogger.originalConsole.log('🤖 AI FOCUS MODE ENABLED - Only AI-related logs will show');
  },

  // Restore all console output
  RESTORE_ALL: () => {
    debugLogger.stopFiltering();
    debugLogger.originalConsole.log('✅ ALL LOGS RESTORED - Normal logging resumed');
  }
};

// Legacy exports for backward compatibility
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

// Global access for easy debugging in console
if (typeof window !== 'undefined') {
  window.debugLogger = debugLogger;
  window.LogPresets = LogPresets;
}

export { debugLogger };
export default debugLogger;