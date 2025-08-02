// src/context/AIAssistantContext/constants.js
// Constants for AI Assistant functionality

// Storage keys
export const LAST_CHAT_KEY = 'lastConversationId';
export const AI_MODEL_TIER_KEY = 'aiModelTier';
export const USER_KNOWLEDGE_KEY = 'userKnowledgeFiles';
export const USER_KNOWLEDGE_ENABLED_KEY = 'userKnowledgeEnabled';
export const AI_CREDITS_KEY = 'aiCreditsRemaining';
export const SUBSCRIPTION_STATUS_KEY = 'subscriptionStatus';
export const CREDIT_NOTIFICATIONS_KEY = 'creditNotificationsEnabled';
export const LOW_CREDIT_THRESHOLD_KEY = 'lowCreditThreshold';
export const LAST_CREDIT_WARNING_KEY = 'lastCreditWarningTimestamp';
export const DEVELOPMENT_MODE_KEY = 'aiDevelopmentMode';

// Default threshold for low credit warnings
export const DEFAULT_CREDIT_THRESHOLD = 5;

// Minimum time between credit warnings in milliseconds (24 hours)
export const MIN_WARNING_INTERVAL = 24 * 60 * 60 * 1000;

// Storage quotas and document limits by tier
export const TIER_STORAGE_LIMITS = {
  guide: {
    storageMB: 1, // 1MB storage for Guide AI
    documentLimit: 2 // 2 documents max
  },
  navigator: {
    storageMB: 2, // 2MB storage for Navigator AI
    documentLimit: 5 // 5 documents max
  },
  compass: {
    storageMB: 4, // 4MB storage for Compass AI
    documentLimit: 10 // 10 documents max
  }
};

// Credit costs by tier
export const CREDIT_COSTS = {
  guide: 1,
  navigator: 2,
  compass: 3
};

// Initial state
export const initialState = {
  // Conversation state
  conversation: {
    conversationId: null,
    messages: [],
    isLoading: false,
    isInitializing: true,
    showSuggestions: true,
  },
  
  // Input state
  input: {
    text: '',
    height: 48,
    isKeyboardVisible: false,
  },
  
  // Action state
  actions: {
    currentAction: null,
    pendingActions: [],
    actionProgress: 0,
    totalActions: 0,
    completedActionIds: [],
    newItemIds: {},
  },
  
  // Goal session tracking
  goalSession: {
    goalIds: {},
    lastGoalId: null,
    lastGoalTitle: null,
    createdGoals: [],
  },
  
  // User knowledge files
  knowledge: {
    userDocuments: [],
    userKnowledgeEnabled: true,
  },
  
  // Credits and subscription
  credits: {
    aiCredits: null,
    subscriptionStatus: 'free',
    creditNotificationsEnabled: true,
    lowCreditThreshold: DEFAULT_CREDIT_THRESHOLD,
    showCreditWarning: false,
  },
  
  // UI state
  ui: {
    selectedMessageId: null,
    menuState: 'closed',
    modeInfoVisible: false,
    notificationSettingsModalVisible: false,
    creditPurchaseModalVisible: false,
    creditLimitModalVisible: false,
    showZeroCreditModal: false,
    showLowCreditModal: false,
    showToast: false,
    toastMessage: '',
    conversationSizeWarningShown: false, // Added for conversation size tracking
  },
  
  // AI model state
  aiModel: {
    tier: 'guide', // 'guide', 'navigator', 'compass'
    availableTiers: ['guide'], // Default to basic tier only
    tierCredits: {
      guide: 0,
      navigator: 0,
      compass: 0
    },
    developmentMode: __DEV__ // Development mode flag - only true in dev builds
  },
  
  // Modal state
  modals: {
    goalModalVisible: false,
    projectModalVisible: false,
    timeBlockModalVisible: false,
    taskModalVisible: false,
    actionSheetVisible: false,
    currentGoalData: null,
    currentProjectData: null,
    currentTimeBlockData: null,
    currentTaskData: null,
  },
};