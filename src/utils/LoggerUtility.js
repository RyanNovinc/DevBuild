// src/utils/LoggerUtility.js
// Updated to focus on AWS Cognito authentication issues

// Configuration
const config = {
  // Master switch for all logs
  enableLogs: true,
  
  // Focus mode - only show specific logs and errors/warnings
  // Added 'project-debug' as a new focus mode for debugging project completion
  focusMode: 'project-debug', // 'project-debug', 'aws-auth', 'onboarding', 'ai', 'profile', or 'all'
  
  // Categories of logs to enable (only used when focusMode is 'all')
  enabledCategories: {
    'AWSAuth': true,        // AWS Authentication logs (NEW)
    'AWSConfig': true,      // AWS Configuration logs (NEW)
    'Auth': true,           // Authentication logs (enabled)
    'AIService': false,     // AI Service logs
    'Action': false,        // Action-related logs
    'AIAssistant': false,   // AIAssistantScreen logs
    'Onboarding': false,    // Onboarding-related logs
    'Error': true,          // Error logs (keep enabled)
    'Warning': true,        // Warning logs (keep enabled)
    'Navigation': false,    // Navigation logs
    'UI': false,            // UI-related logs (disabled to reduce noise)
    'Notification': false,  // Notification-related logs
    'Data': false,          // Data loading/saving logs
    'Deletion': true,       // Goal/Project/Task deletion logs
    'Performance': false,   // Performance monitoring logs
    'Tab': false,           // Tab navigation logs
    'TodoTab': false,       // Todo tab specific logs
    'Profile': false,       // Profile screen logs
    'Stats': false,         // Stats calculation logs
    'Default': false        // Default category for uncategorized logs
  },
  
  // NEW: AWS Cognito auth patterns for focusing on authentication issues
  awsAuthPatterns: [
    // AWS Cognito configuration and initialization
    'AWS CONFIG',
    'AWS Amplify',
    'Amplify',
    'configureAmplify',
    'awsConfig',
    'Auth module',
    'aws-cognito-config',
    'auth-service',
    'AUTH SERVICE',
    
    // Authentication processes
    'Authentication',
    'authentication',
    'auth',
    'login',
    'Login',
    'register',
    'Register',
    'Registration',
    'registration',
    'signIn',
    'signUp',
    'sign-in',
    'sign-up',
    'Phone number',
    'phone_number',
    'SMS',
    'verification',
    'verification code',
    'System Not Ready',
    'AWS not ready',
    'isAmplifyReady',
    
    // Error and status messages
    'Authentication error',
    'Auth error',
    'Login error',
    'Registration error',
    'not properly initialized',
    'not initialized',
    'not a function',
    'Auth.signUp',
    'Auth.signIn',
    'Try Anyway',
    'Attempting',
    'Formatted phone',
    
    // Loading states
    'setLocalLoading',
    'localLoading',
    'loading state',
    'reset loading',
    'timeout',
    
    // Debug markers
    'REGISTRATION PROCESS',
    'AUTH SERVICE',
    'starting sign-up',
    'starting sign-in',
    'debug info',
    'Debug Info',
    'registration result',
    'Registration result',
    
    // Common AWS Cognito error codes
    'UserNotConfirmedException',
    'NotAuthorizedException',
    'UserNotFoundException',
    'UsernameExistsException',
    'InvalidPasswordException',
    'CodeMismatchException',
    'ExpiredCodeException',
    'LimitExceededException',
    'InvalidParameterException'
  ],
  
  // Project debugging patterns for tracking completion issues
  projectDebugPatterns: [
    // UI debugging - very specific patterns
    '🎯',
    '🚀',
    'TICK BUTTON CLICKED',
    'STARTING PROJECT COMPLETION',
    'handleStatusChangeWithTracking called',
    'handleChangeProjectStatus called',
    
    // AppContext debugging - with emoji patterns (simplified)
    '🔵',
    '🟢', 
    '🟡',
    '🟠',
    '🔴',
    '\\[DEBUG\\]',
    
    // Only critical project status messages
    'Project moved to Done',
    'Project moved to In Progress', 
    'Project moved to To Do',
    'Moving project.*to done',
    
    // Only actual errors (not debug messages with "Error" in them)
    '^ERROR:',
    '^Error:',
    'Error updating project',
    'Error in updateProjectProgress'
  ],
  
  // AI-related patterns (keep but disable by default)
  aiPatterns: [
    // Goal action debug patterns
    'CRITICAL DEBUG',
    'SUPER CRITICAL',
    'FULL AI RESPONSE',
    'Actions property exists',
    'Actions value',
    'Found goal action',
    'FOUND GOAL ACTION',
    'Goal data',
    'Setting goalModalVisible',
    'Found 1 goal action markers',
    'action markers',
    'actions to perform',
    'Actions detected',
    'Creating goal modal',
    'Created goal action',
    'createGoal',
    'goal action',
    'action detected',
    'Response keys',
    'No actions found',
    'Processing action',
    'Error parsing',
    'Error creating goal',
    'Goal modal',
    'modal visible',
    'visible',
    'modal cancelled',
    'modal confirmed',
    'AI response received',
    'Goal matches found',
    'First goal match',
    'Total actions extracted',
    'Extracted goal data',
    'FINAL RESPONSE OBJECT'
  ],
  
  // Onboarding-related patterns (keep but disable by default)
  onboardingPatterns: [
    // Onboarding screens
    'StreamlinedOnboardingScreen',
    'WelcomeScreen',
    'FrameworkScreen',
    'FocusSelectionScreen',
    'SystemHierarchyScreen',
    'WhyItWorksScreen',
    'TutorialScreen',
    
    // Onboarding components
    'AIMessage',
    'Confetti',
    'AchievementBadgeModal',
    'ProgressIndicator',
    
    // Onboarding state & animations
    'onboardingCompleted',
    'currentScreen',
    'setCurrentScreen',
    'Animated',
    'animation',
    'AnimatedValue',
    'animation complete',
    'transition',
    'setShowAIMessage',
    'setShowPrompt',
    'setShowConfetti',
    'setShowBadge',
    
    // Onboarding data & events
    'focusInput',
    'setFocusInput',
    'lifeDirection',
    'generateLifeDirection',
    'handleSaveHierarchyItem',
    'handleContinue',
    'handleTypingComplete',
    'onboarding restart',
    'onboarding completed',
    
    // Onboarding errors
    'LinearGradient',
    'colors.map',
    'undefined',
    'useNativeDriver',
    'animation error',
    'render error',
    
    // React Native errors that might affect onboarding
    'TypeError',
    'ReferenceError',
    'Unhandled promise rejection',
    'Invalid prop',
    'Warning:'
  ],
  
  // Profile-related patterns (keep but disable by default)
  profilePatterns: [
    // Stats calculation
    'Stats calculation',
    'Active Projects',
    'Active Goals',
    'calculateGoalProgress',
    'calculateProjectProgress',
    'calculate',
    'Progress',
    'progress',
    'calculate',
    'goals.filter',
    'projects.filter',
    'filter',
    
    // Profile screen
    'ProfileScreen',
    'Profile already initialized',
    'ProfileHeader',
    'StatsRow',
    'DomainsList',
    'LifeDirectionSection',
    'profile data',
    'loading profile',
    'loading stats',
    'stats calculation',
    'loading complete',
    'Error loading profile data',
    'Error loading stats',
    'Auth not ready yet',
    'totalActiveGoals',
    'activeProjects',
    'completedGoals',
    
    // Project status tracking
    'project.completed',
    'project.status',
    'status',
    'completed',
    'isActive',
    'isDone',
    'done',
    'todo',
    'activeProjectsCount',
    'activeGoalsCount',
    'completedProjectsCount',
    
    // Error logs that might be relevant
    'Error in',
    'Cannot read property',
    'undefined is not an object',
    'undefined',
    'null',
    'is not a function',
    'TypeError',
    'is not an array',
    'projects is not an array',
    'project',
    'array',
    'filter',
    
    // Debug markers
    'DEBUG:',
    'debug:',
    'PROFILE:',
    'STATS:',
    'COUNTING:',
    'LOG:',
    
    // Theme-related patterns
    'THEME',
    'theme',
    'Theme',
    'SHAKE',
    'shake',
    'Shake',
    'COLOR',
    'color',
    'Color',
    'LOCKED',
    'locked',
    'Locked',
    'animation',
    'Animation',
    'ANIMATION',
    'isPro',
    'subscription',
    'Subscription',
    'SUBSCRIPTION',
    'availableColors',
    'THEME_COLORS',
    'FREE_COLORS'
  ]
};

/**
 * Enhanced console.log replacement that supports filtering by category
 * @param {string} category - Log category for filtering
 * @param  {...any} args - Arguments to log
 */
export const log = (category, ...args) => {
  // Skip logging if master switch is off
  if (!config.enableLogs) return;
  
  // Handle focus modes
  if (['onboarding', 'ai', 'profile', 'aws-auth'].includes(config.focusMode)) {
    // We'll handle filtering in the global console.log override
    // Just add the category prefix
    console.log(`[${category}]`, ...args);
    return;
  }
  
  // Default category-based filtering (for 'all' mode)
  const categoryKey = category || 'Default';
  if (!config.enabledCategories[categoryKey]) return;
  
  // Add category prefix for enabled logs
  console.log(`[${category}]`, ...args);
};

/**
 * Category-specific loggers
 */
export const aiLog = (...args) => log('AIService', ...args);
export const actionLog = (...args) => log('Action', ...args);
export const assistantLog = (...args) => log('AIAssistant', ...args);
export const onboardingLog = (...args) => log('Onboarding', ...args);
export const errorLog = (...args) => log('Error', ...args);
export const warnLog = (...args) => log('Warning', ...args);
export const profileLog = (...args) => log('Profile', ...args);
export const statsLog = (...args) => log('Stats', ...args);

// NEW AWS Auth specific loggers
export const awsAuthLog = (...args) => log('AWSAuth', ...args);
export const awsConfigLog = (...args) => log('AWSConfig', ...args);
export const authLog = (...args) => log('Auth', ...args);

/**
 * Checks if a log message contains any AWS auth-related patterns
 * @param {string} message - Log message to check
 * @returns {boolean} - Whether the message contains any AWS auth-related patterns
 */
const containsAWSAuthPattern = (message) => {
  if (typeof message !== 'string') {
    try {
      message = String(message);
    } catch (e) {
      return false;
    }
  }
  
  return config.awsAuthPatterns.some(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(message);
  });
};

/**
 * Checks if a log message contains any onboarding-related patterns
 * @param {string} message - Log message to check
 * @returns {boolean} - Whether the message contains any onboarding-related patterns
 */
const containsOnboardingPattern = (message) => {
  if (typeof message !== 'string') {
    try {
      message = String(message);
    } catch (e) {
      return false;
    }
  }
  
  return config.onboardingPatterns.some(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(message);
  });
};

/**
 * Checks if a log message contains any AI-related patterns
 * @param {string} message - Log message to check
 * @returns {boolean} - Whether the message contains any AI-related patterns
 */
const containsAIPattern = (message) => {
  if (typeof message !== 'string') {
    try {
      message = String(message);
    } catch (e) {
      return false;
    }
  }
  
  return config.aiPatterns.some(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(message);
  });
};

/**
 * Checks if a log message contains any project debugging patterns
 * @param {string} message - Log message to check
 * @returns {boolean} - Whether the message contains any project debug patterns
 */
const containsProjectDebugPattern = (message) => {
  if (typeof message !== 'string') {
    try {
      message = String(message);
    } catch (e) {
      return false;
    }
  }
  
  return config.projectDebugPatterns.some(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(message);
  });
};

/**
 * Checks if a log message contains any profile-related patterns
 * @param {string} message - Log message to check
 * @returns {boolean} - Whether the message contains any profile-related patterns
 */
const containsProfilePattern = (message) => {
  if (typeof message !== 'string') {
    try {
      message = String(message);
    } catch (e) {
      return false;
    }
  }
  
  return config.profilePatterns.some(pattern => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(message);
  });
};

/**
 * Override the global console.log to filter unwanted logs
 * Call this function once at app startup to replace the default console.log
 */
export const setupGlobalLogFilter = () => {
  // Store the original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console._originalLog = originalLog;
  console._originalWarn = originalWarn;
  console._originalError = originalError;
  
  // Replace console.log with a filtered version
  console.log = (...args) => {
    // Skip empty logs
    if (args.length === 0) return;
    
    // Always let through our custom loggers with appropriate filtering
    if (args[0] && typeof args[0] === 'string' && args[0].startsWith('[') && args[0].includes(']')) {
      const category = args[0].substring(1, args[0].indexOf(']'));
      
      // Process message based on focus mode
      let fullMessage = '';
      try {
        fullMessage = args.map(arg => {
          if (typeof arg === 'string') return arg;
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch (e) {
              return '[Object]';
            }
          }
          return String(arg);
        }).join(' ');
      } catch (e) {
        fullMessage = String(args[0] || '');
      }
      
      // Apply appropriate filtering based on focus mode
      if (config.focusMode === 'aws-auth') {
        // Show AWS Auth, Auth, Error, and Warning categories unconditionally
        if (['AWSAuth', 'AWSConfig', 'Auth', 'Error', 'Warning'].includes(category)) {
          originalLog.apply(console, args);
          return;
        }
        
        // For other categories, check if it matches AWS auth patterns
        if (containsAWSAuthPattern(fullMessage)) {
          originalLog.apply(console, args);
        }
        return;
      } else if (config.focusMode === 'profile') {
        // Show Profile and Stats category logs unconditionally
        if (['Profile', 'Stats', 'Error', 'Data'].includes(category)) {
          originalLog.apply(console, args);
          return;
        }
        
        // For other categories, check if it matches profile patterns
        if (containsProfilePattern(fullMessage)) {
          originalLog.apply(console, args);
        }
        return;
      } else if (config.focusMode === 'onboarding') {
        // Specifically show Onboarding category logs
        if (category === 'Onboarding') {
          originalLog.apply(console, args);
          return;
        }
        
        // For other categories, check if it matches onboarding patterns
        if (containsOnboardingPattern(fullMessage)) {
          originalLog.apply(console, args);
        }
        return;
      } else if (config.focusMode === 'ai') {
        // Check AI-related categories
        if (['AIService', 'Action', 'AIAssistant'].includes(category)) {
          if (containsAIPattern(fullMessage)) {
            originalLog.apply(console, args);
          }
          return;
        }
        
        // For other categories, check if it matches AI patterns
        if (containsAIPattern(fullMessage)) {
          originalLog.apply(console, args);
        }
        return;
      } else {
        // In 'all' mode, respect category settings
        if (config.enabledCategories[category]) {
          originalLog.apply(console, args);
        }
        return;
      }
    }
    
    // For regular logs (without category prefix)
    let fullMessage = '';
    try {
      fullMessage = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return '[Object]';
          }
        }
        return String(arg);
      }).join(' ');
    } catch (e) {
      fullMessage = String(args[0] || '');
    }
    
    // Filter based on focus mode
    if (config.focusMode === 'project-debug') {
      if (containsProjectDebugPattern(fullMessage)) {
        originalLog.apply(console, args);
      }
      // Block all other logs in project-debug mode
      return;
    } else if (config.focusMode === 'aws-auth') {
      if (containsAWSAuthPattern(fullMessage)) {
        originalLog.apply(console, args);
      }
    } else if (config.focusMode === 'profile') {
      if (containsProfilePattern(fullMessage)) {
        originalLog.apply(console, args);
      }
    } else if (config.focusMode === 'onboarding') {
      if (containsOnboardingPattern(fullMessage)) {
        originalLog.apply(console, args);
      }
    } else if (config.focusMode === 'ai') {
      // Removed AI button visibility filter to allow debugging
      if (containsAIPattern(fullMessage)) {
        originalLog.apply(console, args);
      }
    } else {
      // In 'all' mode, show all logs
      originalLog.apply(console, args);
    }
  };
  
  // Override console.warn to filter warnings
  console.warn = (...args) => {
    // Skip specific warnings
    if (args.length > 0) {
      let fullMessage = '';
      try {
        fullMessage = args.join(' ');
      } catch (e) {
        fullMessage = String(args[0] || '');
      }
      
      // Skip specific warnings
      if (fullMessage.includes('removeNotificationSubscription is deprecated') ||
          fullMessage.includes('Bottom Tab Navigator: \'lazy\' in props is deprecated') ||
          fullMessage.includes('expo-notifications:') ||
          fullMessage.includes('`expo-notifications` functionality is not fully supported')) {
        return;
      }
      
      // Apply focus mode filtering
      if (config.focusMode === 'project-debug') {
        if (containsProjectDebugPattern(fullMessage)) {
          originalWarn.apply(console, args);
        }
        // Block all other warnings in project-debug mode
        return;
      } else if (config.focusMode === 'aws-auth') {
        if (containsAWSAuthPattern(fullMessage)) {
          originalWarn.apply(console, args);
        }
      } else if (config.focusMode === 'profile') {
        if (containsProfilePattern(fullMessage)) {
          originalWarn.apply(console, args);
        }
      } else if (config.focusMode === 'onboarding') {
        if (containsOnboardingPattern(fullMessage)) {
          originalWarn.apply(console, args);
        }
      } else if (config.focusMode === 'ai') {
        if (containsAIPattern(fullMessage)) {
          originalWarn.apply(console, args);
        }
      } else {
        // In 'all' mode, show all warnings
        originalWarn.apply(console, args);
      }
      return;
    }
  };
  
  // For errors, filter based on focus mode but be more lenient to catch important issues
  console.error = (...args) => {
    if (args.length > 0) {
      let fullMessage = '';
      try {
        fullMessage = args.join(' ');
      } catch (e) {
        fullMessage = String(args[0] || '');
      }
      
      // Always show project debug related errors in project-debug mode
      if (config.focusMode === 'project-debug') {
        // For project debugging, show all errors regardless of pattern to catch everything
        originalError.apply(console, args);
      } else if (config.focusMode === 'aws-auth') {
        // For aws-auth debugging, show all errors regardless of pattern to catch everything
        originalError.apply(console, args);
      } else if (config.focusMode === 'profile') {
        if (containsProfilePattern(fullMessage)) {
          originalError.apply(console, args);
        } else {
          // For profile debugging, show all errors regardless of pattern
          originalError.apply(console, args);
        }
      } else if (config.focusMode === 'onboarding') {
        if (containsOnboardingPattern(fullMessage)) {
          originalError.apply(console, args);
        }
      } else if (config.focusMode === 'ai') {
        if (containsAIPattern(fullMessage)) {
          originalError.apply(console, args);
        }
      } else {
        // In 'all' mode, show all errors
        originalError.apply(console, args);
      }
      return;
    }
  };
};

/**
 * Set the focus mode for logging
 * @param {string} mode - 'aws-auth', 'onboarding', 'ai', 'profile', or 'all'
 */
export const setFocusMode = (mode) => {
  if (['aws-auth', 'onboarding', 'ai', 'profile', 'all'].includes(mode)) {
    config.focusMode = mode;
  } else {
    console._originalWarn?.('Invalid focus mode. Must be "aws-auth", "onboarding", "ai", "profile", or "all"');
  }
};

/**
 * Enable or disable all logging
 * @param {boolean} enabled - Whether to enable logging
 */
export const setLoggingEnabled = (enabled) => {
  config.enableLogs = enabled;
};

/**
 * Restore original console.log behavior
 * Call this if you need to restore default logging
 */
export const restoreDefaultLogging = () => {
  if (console._originalLog) {
    console.log = console._originalLog;
    delete console._originalLog;
  }
  
  if (console._originalWarn) {
    console.warn = console._originalWarn;
    delete console._originalWarn;
  }
  
  if (console._originalError) {
    console.error = console._originalError;
    delete console._originalError;
  }
};

// Initialize the logger to show all logs for deletion debugging
setFocusMode('all');

export default {
  log,
  aiLog,
  actionLog,
  assistantLog,
  onboardingLog,
  profileLog,
  statsLog,
  // New AWS auth loggers
  awsAuthLog,
  awsConfigLog,
  authLog,
  errorLog,
  warnLog,
  setupGlobalLogFilter,
  setFocusMode,
  setLoggingEnabled,
  restoreDefaultLogging
};