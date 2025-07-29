// src/services/AIService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import AIUsageManager from './AIUsageManager';
import DocumentService from "./DocumentService";
import AssistantService from "./AssistantService";
import IntroMessageSystem from './IntroMessageSystem';
import { API_BASE_URL, API_KEY } from '../config/apiConfig';
import { generateConversationTitle } from '../utils/conversationUtils';

// Import WebSocket service
import WebSocketService from './WebSocketService';

// Storage keys
const CONVERSATION_STORAGE_KEY = 'localConversations';
const LAST_CONVERSATION_KEY = 'currentConversationId';
const FIRST_MESSAGE_SENT_KEY = 'firstMessageSent_';
const USER_KNOWLEDGE_ENABLED_KEY = 'userKnowledgeEnabled';
const DOCUMENT_CONTEXT_CACHE_KEY = 'documentContextCache';
const DOCUMENT_CONTEXT_TIMESTAMP_KEY = 'documentContextTimestamp';

// Character limits for AI tiers (updated to unlimited)
const CHARACTER_LIMITS = {
  default: Number.MAX_SAFE_INTEGER  // Effectively unlimited
};

// Warning threshold percentage (10% remaining)
const WARNING_THRESHOLD_PERCENTAGE = 0.9; // 90% of limit = 10% remaining

// Document context cache timeout (10 minutes)
const DOCUMENT_CONTEXT_CACHE_TIMEOUT = 10 * 60 * 1000;

// API URL for Lambda endpoint
const API_URL = `${API_BASE_URL}/chat`;

// WebSocket URL
const WEBSOCKET_URL = 'wss://w9c50s5181.execute-api.ap-southeast-2.amazonaws.com/production';

// Enable logging for debugging
const ENABLE_DEBUG = true;

// Debug logger function
const debugLog = (...args) => {
  if (ENABLE_DEBUG) {
    console.log('[AIService]', ...args);
  }
};

// Initialize WebSocket
let webSocketInitialized = false;

// Initialize WebSocket connection
export const initializeWebSocket = () => {
  if (!webSocketInitialized) {
    WebSocketService.connect(WEBSOCKET_URL);
    webSocketInitialized = true;
    debugLog('WebSocket initialized with URL:', WEBSOCKET_URL);
  }
};

// Log initialization
debugLog('AIService initialized with API URL:', API_URL);

/**
 * Get user's timezone offset in hours
 * @returns {number} Timezone offset in hours
 */
const getUserTimezoneOffset = () => {
  return -(new Date().getTimezoneOffset() / 60);
};

/**
 * Get timezone offset string (e.g., "+10:00")
 * @param {number} offsetHours - Timezone offset in hours
 * @returns {string} Formatted timezone offset string
 */
const getTimezoneOffsetString = (offsetHours = null) => {
  const offset = offsetHours !== null ? offsetHours : getUserTimezoneOffset();
  
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset).toString().padStart(2, '0');
  const minutes = Math.round((absOffset % 1) * 60).toString().padStart(2, '0');
  
  return `${sign}${hours}:${minutes}`;
};

/**
 * Parse date string from AI and convert to local timezone
 * @param {string} dateTimeStr - Date/time string from AI
 * @returns {Date} Date object in local timezone
 */
const parseAIDateTimeString = (dateTimeStr) => {
  try {
    // Handle ISO format (YYYY-MM-DD HH:MM)
    if (dateTimeStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      const [datePart, timePart] = dateTimeStr.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      
      return new Date(year, month - 1, day, hours, minutes, 0);
    } 
    // Otherwise use standard JS date parsing
    else {
      return new Date(dateTimeStr);
    }
  } catch (error) {
    console.error('Error parsing AI date string:', error);
    return new Date(); // Return current date as fallback
  }
};

/**
 * Calculate the size of a conversation in characters
 * @param {Array} messages - Array of conversation messages
 * @returns {number} Size of conversation in characters
 */
export const calculateConversationSize = (messages) => {
  if (!messages || !Array.isArray(messages)) return 0;
  
  return messages.reduce((total, msg) => {
    return total + (msg.text ? msg.text.length : 0);
  }, 0);
};

/**
 * Get the character limit for the specified AI tier
 * @param {string} aiTier - AI model tier (not used anymore, kept for compatibility)
 * @returns {number} Character limit for the tier
 */
export const getCharacterLimit = (aiTier = 'default') => {
  return CHARACTER_LIMITS.default;
};

/**
 * Get the warning threshold for the specified AI tier
 * @param {string} aiTier - AI model tier (not used anymore, kept for compatibility)
 * @returns {number} Warning threshold (characters) for the tier
 */
export const getWarningThreshold = (aiTier = 'default') => {
  return Number.MAX_SAFE_INTEGER; // Effectively unlimited
};

/**
 * Truncate a conversation to keep only the most recent messages
 * @param {string} conversationId - The conversation ID
 * @param {Array} messages - The current messages array
 * @param {number} maxMessagesToKeep - Maximum number of messages to keep
 * @returns {Promise<boolean>} Success status
 */
export const truncateConversation = async (conversationId, messages, maxMessagesToKeep = 30) => {
  if (!conversationId || !Array.isArray(messages)) return false;
  
  try {
    // Keep the most recent messages up to maxMessagesToKeep
    const truncatedMessages = messages.slice(-maxMessagesToKeep);
    
    // Get the conversation from local storage
    const conversationJson = await AsyncStorage.getItem(`conversation_${conversationId}`);
    if (!conversationJson) {
      return false;
    }
    
    const conversation = JSON.parse(conversationJson);
    
    // Update messages
    conversation.messages = truncatedMessages;
    conversation.updatedAt = new Date().toISOString();
    
    // Save updated conversation
    await AsyncStorage.setItem(`conversation_${conversationId}`, JSON.stringify(conversation));
    
    // Also update in the conversations list
    const conversationsJson = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (conversationsJson) {
      const conversations = JSON.parse(conversationsJson);
      const index = conversations.findIndex(conv => conv._id === conversationId);
      if (index !== -1) {
        conversations[index] = conversation;
        await AsyncStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversations));
      }
    }
    
    // Also try to clear and recreate the Assistant thread to keep it in sync
    try {
      await AssistantService.clearThread(conversationId);
    } catch (assistantError) {
      console.error('Error clearing Assistant thread after truncation:', assistantError);
    }
    
    return true;
  } catch (error) {
    console.error('Error truncating conversation:', error);
    return false;
  }
};

/**
 * Check if a conversation with a new message would exceed the size limit
 * @param {Array} messages - Array of conversation messages
 * @param {string} newMessage - New message to be added (optional)
 * @param {string} aiTier - AI model tier (not used anymore, kept for compatibility)
 * @returns {boolean} Whether the limit would be exceeded
 */
export const isConversationSizeExceeded = (messages, newMessage = '', aiTier = 'default') => {
  // With unlimited context, this always returns false
  return false;
};

/**
 * Check if a conversation is approaching the warning threshold
 * @param {Array} messages - Array of conversation messages
 * @param {string} aiTier - AI model tier (not used anymore, kept for compatibility)
 * @returns {boolean} Whether the warning threshold is reached
 */
export const isApproachingWarningThreshold = (messages, aiTier = 'default') => {
  // With unlimited context, this always returns false
  return false;
};

/**
 * Check if user knowledge is enabled
 * @returns {Promise<boolean>} Whether user knowledge is enabled
 */
export const isUserKnowledgeEnabled = async () => {
  try {
    const enabledSetting = await AsyncStorage.getItem(USER_KNOWLEDGE_ENABLED_KEY);
    return enabledSetting !== 'false'; // Default to true if not set
  } catch (error) {
    console.error('Error checking if user knowledge is enabled:', error);
    return true; // Default to true if error
  }
};

/**
 * Get or fetch document context with caching
 * @param {boolean} forceRefresh - Force a refresh of the cache
 * @returns {Promise<string>} Document context string
 */
export const getDocumentContext = async (forceRefresh = false) => {
  try {
    // Check if knowledge is enabled
    const knowledgeEnabled = await isUserKnowledgeEnabled();
    if (!knowledgeEnabled) {
      debugLog('User knowledge is disabled, returning empty context');
      return '';
    }
    
    // If not forcing refresh, check if we have a recent cache
    if (!forceRefresh) {
      const cachedContext = await AsyncStorage.getItem(DOCUMENT_CONTEXT_CACHE_KEY);
      const cachedTimestampStr = await AsyncStorage.getItem(DOCUMENT_CONTEXT_TIMESTAMP_KEY);
      
      if (cachedContext && cachedTimestampStr) {
        const cachedTimestamp = parseInt(cachedTimestampStr, 10);
        const now = Date.now();
        
        // If cache is still fresh (less than timeout)
        if (now - cachedTimestamp < DOCUMENT_CONTEXT_CACHE_TIMEOUT) {
          debugLog('Using cached document context, age:', Math.round((now - cachedTimestamp) / 1000), 'seconds');
          return cachedContext;
        }
      }
    }
    
    // Fetch fresh context from DocumentService
    debugLog('Fetching fresh document context');
    const context = await DocumentService.getDocumentContextForAI();
    
    // Cache the context for future use
    if (context && context.length > 0) {
      await AsyncStorage.setItem(DOCUMENT_CONTEXT_CACHE_KEY, context);
      await AsyncStorage.setItem(DOCUMENT_CONTEXT_TIMESTAMP_KEY, Date.now().toString());
      debugLog('Cached document context, length:', context.length);
    }
    
    return context;
  } catch (error) {
    console.error('Error getting document context:', error);
    return '';
  }
};

/**
 * Get user context data for AI
 * @returns {Promise<Object>} User context data
 */
export const getUserContext = async () => {
  try {
    // Get all relevant user data
    const userData = {};
    
    // 1. Get user profile and life direction
    const settingsJson = await AsyncStorage.getItem('appSettings');
    if (settingsJson) {
      const settings = JSON.parse(settingsJson);
      userData.lifeDirection = settings.lifeDirection || '';
      userData.settings = settings;
    }
    
    // Get user profile if available
    const userProfileJson = await AsyncStorage.getItem('userProfile');
    if (userProfileJson) {
      userData.profile = JSON.parse(userProfileJson);
    }
    
    // 2. Get all goals
    const goalsJson = await AsyncStorage.getItem('goals');
    if (goalsJson) {
      userData.goals = JSON.parse(goalsJson);
    }
    
    // 3. Get all projects
    const projectsJson = await AsyncStorage.getItem('projects');
    if (projectsJson) {
      userData.projects = JSON.parse(projectsJson);
    }
    
    // 4. Get all time blocks
    const timeBlocksJson = await AsyncStorage.getItem('timeBlocks');
    if (timeBlocksJson) {
      userData.timeBlocks = JSON.parse(timeBlocksJson);
    }
    
    // 5. Get domains
    const domainsJson = await AsyncStorage.getItem('domains');
    if (domainsJson) {
      userData.domains = JSON.parse(domainsJson);
    }
    
    // 6. Get todos for today, tomorrow, and later tabs
    const todosJson = await AsyncStorage.getItem('todos');
    if (todosJson) {
      userData.todos = JSON.parse(todosJson);
    }
    
    const tomorrowTodosJson = await AsyncStorage.getItem('tomorrowTodos');
    if (tomorrowTodosJson) {
      userData.tomorrowTodos = JSON.parse(tomorrowTodosJson);
    }
    
    const laterTodosJson = await AsyncStorage.getItem('laterTodos');
    if (laterTodosJson) {
      userData.laterTodos = JSON.parse(laterTodosJson);
    }
    
    // 7. Get user knowledge status
    userData.userKnowledgeEnabled = await isUserKnowledgeEnabled();
    
    debugLog('Loaded user context:', {
      hasProfile: !!userData.profile,
      lifeDirection: userData.lifeDirection ? 'set' : 'not set',
      goalsCount: userData.goals?.length || 0,
      projectsCount: userData.projects?.length || 0,
      timeBlocksCount: userData.timeBlocks?.length || 0,
      todosCount: userData.todos?.length || 0,
      userKnowledgeEnabled: userData.userKnowledgeEnabled
    });
    
    return userData;
  } catch (error) {
    console.error('Error getting user context:', error);
    return {}; // Return empty object if there's an error
  }
};

/**
 * Get model-specific settings based on tier
 * @param {string} aiTier - AI model tier (not used anymore, kept for compatibility)
 * @returns {Object} Model settings
 */
export const getModelSettings = (aiTier = 'default') => {
  // Return a single model configuration instead of multiple tiers
  return {
    name: 'LifeCompass AI',
    description: 'Comprehensive AI assistant for life planning and productivity',
    model: 'gpt-4.1-mini',
    contextLength: 'Unlimited',
    creditCost: 1,
    characterLimit: CHARACTER_LIMITS.default,
    warningThreshold: Number.MAX_SAFE_INTEGER,
    systemPrompt: `You are LifeCompass AI. ${IntroMessageSystem.getRandomMessage()}

Provide comprehensive guidance on life direction, deep insights into aligning goals with values,
and transformative perspectives on personal growth and leadership.
Focus on long-term strategy, core values, and transformative thinking while also 
helping with practical execution, organizing immediate tasks, and time blocking.`
  };
};

/**
 * Check if this is the first message in a conversation
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<boolean>} Whether this is the first message
 */
export const isFirstMessage = async (conversationId) => {
  if (!conversationId) return true;
  
  try {
    const firstMessageSent = await AsyncStorage.getItem(`${FIRST_MESSAGE_SENT_KEY}${conversationId}`);
    return firstMessageSent !== 'true';
  } catch (error) {
    console.error('Error checking if first message:', error);
    return true; // Assume it's the first message if we can't check
  }
};

/**
 * Mark that the first message has been sent for a conversation
 * @param {string} conversationId - The conversation ID
 */
export const markFirstMessageSent = async (conversationId) => {
  if (!conversationId) return;
  
  try {
    await AsyncStorage.setItem(`${FIRST_MESSAGE_SENT_KEY}${conversationId}`, 'true');
    debugLog('Marked first message as sent for conversation:', conversationId);
  } catch (error) {
    console.error('Error marking first message as sent:', error);
  }
};

/**
 * Extract actions from AI response text
 * @param {string} text - AI response text
 * @returns {Array|null} Extracted actions or null if none
 */
export const extractActionDirectives = (text) => {
  if (!text) return null;
  
  const actions = [];
  
  // Extract goal actions
  const goalMatches = text.match(/\[\[CREATE_GOAL\]\]([\s\S]*?)(?=\[\[|\s*$)/gi);
  if (goalMatches) {
    for (const match of goalMatches) {
      try {
        const goalData = {};
        const lines = match.replace(/\[\[CREATE_GOAL\]\]/i, '').trim().split('\n');
        
        for (const line of lines) {
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim().toLowerCase();
            const value = line.substring(colonIndex + 1).trim();
            if (value) {
              goalData[key] = value;
            }
          }
        }
        
        if (goalData.title) {
          // Normalize domain name to match standard domains
          let domainName = goalData.domain || 'General';
          
          // Capitalize first letter of domain to ensure consistency
          if (domainName) {
            domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1).toLowerCase();
            
            // Map common domain variations to standard names
            const domainMappings = {
              'Health & Fitness': 'Health',
              'Health And Fitness': 'Health',
              'Fitness': 'Health',
              'Exercise': 'Health',
              'Wellness': 'Health',
              
              'Career': 'Work',
              'Professional': 'Work',
              'Business': 'Work',
              'Job': 'Work',
              
              'Money': 'Finance',
              'Financial': 'Finance',
              'Budget': 'Finance',
              'Investment': 'Finance',
              'Investing': 'Finance',
              
              'Learning': 'Education',
              'Academic': 'Education',
              'Study': 'Education',
              'School': 'Education',
              'College': 'Education',
              
              'Hobby': 'Personal',
              'Self-improvement': 'Personal',
              'Self Improvement': 'Personal',
              'Growth': 'Personal',
              'Creativity': 'Personal',
              
              'Family': 'Relationships',
              'Social': 'Relationships',
              'Friends': 'Relationships',
              'Friendship': 'Relationships',
              'Partner': 'Relationships',
              'Marriage': 'Relationships',
              
              'Other': 'General',
              'Misc': 'General',
              'Miscellaneous': 'General',
              'Custom': 'General'
            };
            
            if (domainMappings[domainName]) {
              domainName = domainMappings[domainName];
              console.log(`Mapped domain "${goalData.domain}" to standard domain "${domainName}"`);
            }
          }
          
          // Set default target date if none provided
          let targetDate = null;
          if (goalData.targetdate || goalData.targetDate) {
            try {
              targetDate = new Date(goalData.targetdate || goalData.targetDate).toISOString();
            } catch (error) {
              const defaultDate = new Date();
              defaultDate.setMonth(defaultDate.getMonth() + 3);
              targetDate = defaultDate.toISOString();
            }
          } else {
            const defaultDate = new Date();
            defaultDate.setMonth(defaultDate.getMonth() + 3);
            targetDate = defaultDate.toISOString();
          }
          
          console.log(`Creating goal with domain: ${domainName} (original: ${goalData.domain})`);
          
          actions.push({
            type: 'createGoal',
            data: {
              title: goalData.title,
              description: goalData.description || '',
              domain: domainName,
              targetDate: targetDate,
              color: goalData.color || '#4CAF50',
              icon: goalData.icon || 'star'
            }
          });
        }
      } catch (error) {
        console.error('Error parsing goal action:', error);
      }
    }
  }
  
  // Extract project actions
  const projectMatches = text.match(/\[\[CREATE_PROJECT\]\]([\s\S]*?)(?=\[\[|\s*$)/gi);
  if (projectMatches) {
    for (const match of projectMatches) {
      try {
        const projectData = {};
        const lines = match.replace(/\[\[CREATE_PROJECT\]\]/i, '').trim().split('\n');
        
        for (const line of lines) {
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim().toLowerCase();
            const value = line.substring(colonIndex + 1).trim();
            if (value) {
              projectData[key] = value;
            }
          }
        }
        
        // Parse tasks
        let parsedTasks = [];
        if (projectData.tasks && typeof projectData.tasks === 'string') {
          const taskLines = projectData.tasks.split(/[\n,]/).filter(t => t.trim());
          parsedTasks = taskLines.map(taskLine => ({
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: taskLine.trim().replace(/^[-*•\d.)\s]+/, ''),
            status: 'todo',
            completed: false
          }));
        }
        
        // Generate default due date if not provided
        let dueDate = null;
        if (projectData.duedate || projectData.dueDate) {
          try {
            dueDate = new Date(projectData.duedate || projectData.dueDate).toISOString();
          } catch (error) {
            const defaultDate = new Date();
            defaultDate.setMonth(defaultDate.getMonth() + 1);
            dueDate = defaultDate.toISOString();
          }
        } else {
          const defaultDate = new Date();
          defaultDate.setMonth(defaultDate.getMonth() + 1);
          dueDate = defaultDate.toISOString();
        }
        
        // Normalize domain name using the same approach as for goals
        let domainName = projectData.domain || 'General';
        if (domainName) {
          domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1).toLowerCase();
          
          // Map common domain variations (reusing the mappings from goals)
          const domainMappings = {
            'Health & Fitness': 'Health',
            'Health And Fitness': 'Health',
            'Fitness': 'Health',
            'Exercise': 'Health',
            'Wellness': 'Health',
            
            'Career': 'Work',
            'Professional': 'Work',
            'Business': 'Work',
            'Job': 'Work',
            
            'Money': 'Finance',
            'Financial': 'Finance',
            'Budget': 'Finance',
            'Investment': 'Finance',
            'Investing': 'Finance',
            
            'Learning': 'Education',
            'Academic': 'Education',
            'Study': 'Education',
            'School': 'Education',
            'College': 'Education',
            
            'Hobby': 'Personal',
            'Self-improvement': 'Personal',
            'Self Improvement': 'Personal',
            'Growth': 'Personal',
            'Creativity': 'Personal',
            
            'Family': 'Relationships',
            'Social': 'Relationships',
            'Friends': 'Relationships',
            'Friendship': 'Relationships',
            'Partner': 'Relationships',
            'Marriage': 'Relationships',
            
            'Other': 'General',
            'Misc': 'General',
            'Miscellaneous': 'General',
            'Custom': 'General'
          };
          
          if (domainMappings[domainName]) {
            domainName = domainMappings[domainName];
          }
        }
        
        if (projectData.title) {
          actions.push({
            type: 'createProject',
            data: {
              title: projectData.title,
              description: projectData.description || '',
              goalTitle: projectData.goaltitle || '',
              goalId: projectData.goalid || '',
              dueDate: dueDate,
              tasks: parsedTasks,
              domain: domainName,
              color: projectData.color || '#3F51B5',
              progress: 0,
              completed: false
            }
          });
        }
      } catch (error) {
        console.error('Error parsing project action:', error);
      }
    }
  }
  
  // Extract task actions
  const taskMatches = text.match(/\[\[CREATE_TASK\]\]([\s\S]*?)(?=\[\[|\s*$)/gi);
  if (taskMatches) {
    for (const match of taskMatches) {
      try {
        const taskData = {};
        const lines = match.replace(/\[\[CREATE_TASK\]\]/i, '').trim().split('\n');
        
        for (const line of lines) {
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim().toLowerCase();
            const value = line.substring(colonIndex + 1).trim();
            if (value) {
              taskData[key] = value;
            }
          }
        }
        
        if (taskData.title) {
          actions.push({
            type: 'createTask',
            data: {
              title: taskData.title,
              description: taskData.description || '',
              projectId: taskData.projectid || '',
              projectTitle: taskData.projecttitle || '',
              goalId: taskData.goalid || '',
              goalTitle: taskData.goaltitle || '',
              status: taskData.status || 'todo',
              completed: false
            }
          });
        }
      } catch (error) {
        console.error('Error parsing task action:', error);
      }
    }
  }
  
  // Extract time block actions
  const timeBlockMatches = text.match(/\[\[CREATE_TIME_BLOCK\]\]([\s\S]*?)(?=\[\[|\s*$)/gi);
  if (timeBlockMatches) {
    for (const match of timeBlockMatches) {
      try {
        const timeBlockData = {};
        const lines = match.replace(/\[\[CREATE_TIME_BLOCK\]\]/i, '').trim().split('\n');
        
        for (const line of lines) {
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim().toLowerCase();
            const value = line.substring(colonIndex + 1).trim();
            if (value) {
              timeBlockData[key] = value;
            }
          }
        }
        
        // Parse dates
        let startTime, endTime;
        
        try {
          // Parse start time
          const parsedStartTime = parseAIDateTimeString(timeBlockData.starttime || timeBlockData.startTime);
          
          // Validate it's not in the past
          const now = new Date();
          if (parsedStartTime < now) {
            if (parsedStartTime.toDateString() === now.toDateString()) {
              parsedStartTime.setDate(parsedStartTime.getDate() + 1);
            } else {
              const defaultDate = new Date();
              defaultDate.setHours(defaultDate.getHours() + 1);
              defaultDate.setMinutes(0, 0, 0);
              startTime = defaultDate.toISOString();
            }
          }
          
          startTime = parsedStartTime.toISOString();
        } catch (error) {
          console.error('Error parsing start time:', error);
          const defaultDate = new Date();
          defaultDate.setHours(defaultDate.getHours() + 1);
          defaultDate.setMinutes(0, 0, 0);
          startTime = defaultDate.toISOString();
        }
        
        try {
          // Parse end time
          const parsedEndTime = parseAIDateTimeString(timeBlockData.endtime || timeBlockData.endTime);
          
          // Convert start time to Date object for comparison
          const parsedStartTime = new Date(startTime);
          
          // Ensure end time is after start time
          if (parsedEndTime <= parsedStartTime) {
            const newEndTime = new Date(parsedStartTime);
            newEndTime.setHours(newEndTime.getHours() + 1);
            endTime = newEndTime.toISOString();
          } else {
            endTime = parsedEndTime.toISOString();
          }
        } catch (error) {
          console.error('Error parsing end time:', error);
          const defaultEnd = new Date(startTime);
          defaultEnd.setHours(defaultEnd.getHours() + 1);
          endTime = defaultEnd.toISOString();
        }
        
        // Normalize domain name
        let domainName = timeBlockData.domain || 'General';
        if (domainName) {
          domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1).toLowerCase();
          
          // Map common domain variations (reusing the same mappings)
          const domainMappings = {
            'Health & Fitness': 'Health',
            'Fitness': 'Health',
            'Career': 'Work',
            'Money': 'Finance',
            'Learning': 'Education',
            'Hobby': 'Personal',
            'Family': 'Relationships',
            'Other': 'General'
          };
          
          if (domainMappings[domainName]) {
            domainName = domainMappings[domainName];
          }
        }
        
        if (timeBlockData.title) {
          actions.push({
            type: 'createTimeBlock',
            data: {
              title: timeBlockData.title,
              notes: timeBlockData.notes || '',
              location: timeBlockData.location || '',
              startTime: startTime,
              endTime: endTime,
              domain: domainName,
              color: timeBlockData.color || '#4A90E2',
              isAllDay: timeBlockData.isallday === 'true' || timeBlockData.isallday === true,
              // Add timezone metadata
              userTimezoneOffset: getUserTimezoneOffset(),
              userTimezoneString: getTimezoneOffsetString()
            }
          });
        }
      } catch (error) {
        console.error('Error parsing time block action:', error);
      }
    }
  }
  
  // Extract todo actions
  const todoMatches = text.match(/\[\[CREATE_TODO\]\]([\s\S]*?)(?=\[\[|\s*$)/gi);
  if (todoMatches) {
    for (const match of todoMatches) {
      try {
        const todoData = {};
        const lines = match.replace(/\[\[CREATE_TODO\]\]/i, '').trim().split('\n');
        
        for (const line of lines) {
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim().toLowerCase();
            const value = line.substring(colonIndex + 1).trim();
            if (value) {
              todoData[key] = value;
            }
          }
        }
        
        if (todoData.title) {
          actions.push({
            type: 'createTodo',
            data: {
              title: todoData.title,
              tab: todoData.tab || 'today',
              completed: false,
              id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              groupId: todoData.groupid || null,
              groupTitle: todoData.grouptitle || null
            }
          });
        }
      } catch (error) {
        console.error('Error parsing todo action:', error);
      }
    }
  }
  
  // Extract todo group actions
  const todoGroupMatches = text.match(/\[\[CREATE_TODO_GROUP\]\]([\s\S]*?)(?=\[\[|\s*$)/gi);
  if (todoGroupMatches) {
    for (const match of todoGroupMatches) {
      try {
        const todoGroupData = {};
        const lines = match.replace(/\[\[CREATE_TODO_GROUP\]\]/i, '').trim().split('\n');
        
        for (const line of lines) {
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim().toLowerCase();
            const value = line.substring(colonIndex + 1).trim();
            if (value) {
              todoGroupData[key] = value;
            }
          }
        }
        
        // Parse items
        let items = [];
        if (todoGroupData.items && typeof todoGroupData.items === 'string') {
          const itemLines = todoGroupData.items.split(/[\n,]/).filter(i => i.trim());
          items = itemLines.map(itemLine => ({
            id: `todoitem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: itemLine.trim().replace(/^[-*•\d.)\s]+/, ''),
            completed: false
          }));
        }
        
        if (todoGroupData.title) {
          actions.push({
            type: 'createTodoGroup',
            data: {
              title: todoGroupData.title,
              tab: todoGroupData.tab || 'today',
              isGroup: true,
              completed: false,
              id: `todogroup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              items: items.length > 0 ? items : [
                { id: `todoitem_${Date.now()}_1`, title: "First item", completed: false },
                { id: `todoitem_${Date.now()}_2`, title: "Second item", completed: false }
              ]
            }
          });
        }
      } catch (error) {
        console.error('Error parsing todo group action:', error);
      }
    }
  }
  
  // Extract life direction actions
  const lifeDirectionMatches = text.match(/\[\[UPDATE_LIFE_DIRECTION\]\]([\s\S]*?)(?=\[\[|\s*$)/gi);
  if (lifeDirectionMatches && lifeDirectionMatches.length > 0) {
    try {
      const lifeDirectionText = lifeDirectionMatches[0]
        .replace(/\[\[UPDATE_LIFE_DIRECTION\]\]/i, '')
        .trim();
      
      if (lifeDirectionText) {
        actions.push({
          type: 'updateLifeDirection',
          data: lifeDirectionText
        });
      }
    } catch (error) {
      console.error('Error parsing life direction action:', error);
    }
  }
  
  return actions.length > 0 ? actions : null;
};

/**
 * Remove action directives from AI response
 * @param {string} text - AI response text
 * @returns {string} Cleaned text
 */
export const removeActionDirectives = (text) => {
  if (!text) return "";
  
  // Remove all action markers
  return text.replace(/\[\[CREATE_GOAL\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
    .replace(/\[\[CREATE_PROJECT\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
    .replace(/\[\[CREATE_TASK\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
    .replace(/\[\[CREATE_TIME_BLOCK\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
    .replace(/\[\[CREATE_TODO\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
    .replace(/\[\[CREATE_TODO_GROUP\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
    .replace(/\[\[UPDATE_LIFE_DIRECTION\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
    .trim();
};

/**
 * Generate AI response with WebSocket streaming
 * @param {string} userMessage - The user's message
 * @param {Array} messageHistory - Previous conversation messages
 * @param {string} aiTier - AI model tier (not used anymore, kept for compatibility)
 * @param {Array} attachedFiles - Attached files
 * @param {Object} userKnowledgeContext - User knowledge context settings
 * @param {Object} callbacks - Callback functions for streaming
 * @returns {Promise<Object>} AI response with text and actions
 */
export const generateAIResponse = async (
  userMessage, 
  messageHistory = [], 
  aiTier = 'default',
  attachedFiles = [],
  userKnowledgeContext = null,
  callbacks = {
    onChunk: null,     // Called when a new chunk arrives (accumulated text)
    onComplete: null,  // Called when response is complete (text, actions, title)
    onError: null      // Called on error (error)
  }
) => {
  try {
    debugLog('Generating AI response for:', userMessage);
    debugLog(`Using AI model tier: ${aiTier}`);
    
    // Initialize WebSocket if not already connected
    initializeWebSocket();
    
    // Check if WebSocket is connected
    if (!WebSocketService.isConnected) {
      console.log('WebSocket not connected, falling back to HTTP');
      // Fall back to HTTP if WebSocket is not connected
      return generateAIResponseHTTP(
        userMessage, 
        messageHistory, 
        aiTier, 
        attachedFiles, 
        userKnowledgeContext
      );
    }
    
    // Check if this is the first message of the conversation
    const isFirstMessage = userKnowledgeContext?.firstMessage || false;
    debugLog(`Is first message in conversation: ${isFirstMessage}`);
    
    // Get model settings
    const modelSettings = getModelSettings(aiTier);
    
    // Check monthly limits
    const hasReachedLimit = await AIUsageManager.hasReachedLimit();
    if (hasReachedLimit) {
      const errorMessage = "I'm sorry, but you've reached your monthly AI capacity limit. Please consider upgrading your plan for more capacity or wait until your usage resets.";
      
      if (callbacks.onError) {
        callbacks.onError(new Error("INSUFFICIENT_CAPACITY"));
      }
      
      return {
        text: errorMessage,
        error: "INSUFFICIENT_CAPACITY"
      };
    }
    
    // Estimate usage percentage
    const estimatedPercentage = AIUsageManager.estimateUsagePercentage(userMessage, aiTier);
    
    // Check if user has enough capacity
    const hasEnoughCapacity = await AIUsageManager.hasEnoughCapacity(estimatedPercentage);
    if (!hasEnoughCapacity) {
      const errorMessage = "I'm sorry, but this conversation would exceed your remaining monthly AI capacity. Please consider upgrading your plan.";
      
      if (callbacks.onError) {
        callbacks.onError(new Error("INSUFFICIENT_CAPACITY"));
      }
      
      return {
        text: errorMessage,
        error: "INSUFFICIENT_CAPACITY"
      };
    }
    
    // Get conversation ID
    const conversationId = userKnowledgeContext?.conversationId || 
      `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Track accumulated response for the promise resolution
    let accumulatedResponse = '';
    let extractedActions = null;
    let responseTitle = null;
    
    // Keep track of removed WebSocket handlers
    const removedHandlers = [];
    
    // Create a promise that will be resolved when the response is complete
    return new Promise((resolve, reject) => {
      // Set up handlers for WebSocket messages
      const chunkHandler = (data) => {
        if (data.conversationId === conversationId) {
          // Append the chunk to the accumulated response
          if (data.content) {
            accumulatedResponse += data.content;
            
            // Call the onChunk callback with the ACCUMULATED text (this is the fix!)
            if (callbacks.onChunk) {
              callbacks.onChunk(accumulatedResponse);
            }
          }
        }
      };
      
      // Set up handler for complete message
      const completeHandler = (data) => {
        if (data.conversationId === conversationId) {
          // Clean up all handlers
          removedHandlers.forEach(removeHandler => {
            if (typeof removeHandler === 'function') {
              removeHandler();
            }
          });
          
          // Get actions and title if available
          if (data.actions) {
            extractedActions = data.actions;
          } else {
            // Try to extract actions from the text
            extractedActions = extractActionDirectives(data.content || accumulatedResponse);
            
            // If we extracted actions, also clean the response
            if (extractedActions) {
              accumulatedResponse = removeActionDirectives(accumulatedResponse);
            }
          }
          
          if (data.title) {
            responseTitle = data.title;
          }
          
          // Call the onComplete callback if provided
          if (callbacks.onComplete) {
            callbacks.onComplete(
              data.content || accumulatedResponse,
              extractedActions,
              responseTitle
            );
          }
          
          // Resolve with the complete response
          resolve({
            text: data.content || accumulatedResponse,
            actions: extractedActions,
            title: responseTitle
          });
        }
      };
      
      // Set up handler for errors
      const errorHandler = (data) => {
        // Clean up all handlers
        removedHandlers.forEach(removeHandler => {
          if (typeof removeHandler === 'function') {
            removeHandler();
          }
        });
        
        const errorMessage = data.error || 'Unknown WebSocket error';
        
        // Call the onError callback if provided
        if (callbacks.onError) {
          callbacks.onError(new Error(errorMessage));
        }
        
        // Reject with the error
        reject(new Error(errorMessage));
      };
      
      // Add handlers and store the remove functions
      const removeChunkHandler = WebSocketService.addMessageHandler('chunk', chunkHandler);
      const removeCompleteHandler = WebSocketService.addMessageHandler('complete', completeHandler);
      const removeErrorHandler = WebSocketService.addMessageHandler('error', errorHandler);
      
      removedHandlers.push(removeChunkHandler, removeCompleteHandler, removeErrorHandler);
      
      // Format previous messages
      const formattedMessages = [];
      if (messageHistory && Array.isArray(messageHistory) && messageHistory.length > 0) {
        // Skip the first message if it's an AI welcome message
        const startIndex = (messageHistory.length > 0 && messageHistory[0].type === 'ai' && messageHistory[0].centered) ? 1 : 0;
        
        for (let i = startIndex; i < messageHistory.length; i++) {
          const msg = messageHistory[i];
          if (msg.text) {
            formattedMessages.push({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.text
            });
          }
        }
      }
      
      // Generate a unique ID for this response
      const responseId = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Send the message to the WebSocket server
      const success = WebSocketService.sendMessage('sendMessage', {
        message: userMessage,
        conversationId: conversationId,
        messageHistory: formattedMessages,
        aiTier: aiTier,
        responseId: responseId,
        isFirstMessage: isFirstMessage,
        userKnowledgeContext: {
          enabled: userKnowledgeContext?.enabled ?? true,
          documentContext: userKnowledgeContext?.documentContext ?? '',
          files: userKnowledgeContext?.files ?? []
        }
      });
      
      // If sending failed, clean up and reject
      if (!success) {
        // Clean up all handlers
        removedHandlers.forEach(removeHandler => {
          if (typeof removeHandler === 'function') {
            removeHandler();
          }
        });
        
        const errorMessage = 'Failed to send message to WebSocket server';
        
        // Call the onError callback if provided
        if (callbacks.onError) {
          callbacks.onError(new Error(errorMessage));
        }
        
        reject(new Error(errorMessage));
        return;
      }
      
      // Record usage
      AIUsageManager.recordUsage(estimatedPercentage).catch(error => {
        console.error('Error recording usage:', error);
      });
      
      // Set up a timeout to prevent hanging indefinitely
      const timeoutId = setTimeout(() => {
        // Clean up all handlers
        removedHandlers.forEach(removeHandler => {
          if (typeof removeHandler === 'function') {
            removeHandler();
          }
        });
        
        const errorMessage = 'WebSocket response timeout';
        
        // Call the onError callback if provided
        if (callbacks.onError) {
          callbacks.onError(new Error(errorMessage));
        }
        
        reject(new Error(errorMessage));
      }, 60000); // 60 second timeout
      
      // Add the timeout clear function to the removed handlers
      removedHandlers.push(() => clearTimeout(timeoutId));
    });
  } catch (error) {
    console.error('Error in generateAIResponse:', error);
    
    // Call the onError callback if provided
    if (callbacks.onError) {
      callbacks.onError(error);
    }
    
    return {
      text: "I'm having trouble connecting to my services right now. Please try again in a moment.",
      actions: null,
      error: error.message
    };
  }
};

/**
 * Original HTTP implementation as a fallback
 */
const generateAIResponseHTTP = async (
  userMessage, 
  messageHistory = [], 
  aiTier = 'default',
  attachedFiles = [],
  userKnowledgeContext = null
) => {
  try {
    debugLog('Generating AI response via HTTP for:', userMessage);
    debugLog(`Using AI model tier: ${aiTier}`);
    
    // Check if this is the first message of the conversation
    const isFirstMessage = userKnowledgeContext?.firstMessage || false;
    debugLog(`Is first message in conversation: ${isFirstMessage}`);
    
    // Get model settings
    const modelSettings = getModelSettings(aiTier);
    
    // Check monthly limits
    const hasReachedLimit = await AIUsageManager.hasReachedLimit();
    if (hasReachedLimit) {
      return {
        text: "I'm sorry, but you've reached your monthly AI capacity limit. Please consider upgrading your plan for more capacity or wait until your usage resets.",
        error: "INSUFFICIENT_CAPACITY"
      };
    }
    
    // Estimate usage percentage
    const estimatedPercentage = AIUsageManager.estimateUsagePercentage(userMessage, aiTier);
    
    // Check if user has enough capacity
    const hasEnoughCapacity = await AIUsageManager.hasEnoughCapacity(estimatedPercentage);
    if (!hasEnoughCapacity) {
      return {
        text: "I'm sorry, but this conversation would exceed your remaining monthly AI capacity. Please consider upgrading your plan.",
        error: "INSUFFICIENT_CAPACITY"
      };
    }
    
    // Get user context data
    const userContext = await getUserContext();
    
    // Format messages for API
    const formattedMessages = [
      // System message with instructions
      {
        role: "system",
        content: modelSettings.systemPrompt
      }
    ];
    
    // Add conversation history
    if (messageHistory && Array.isArray(messageHistory) && messageHistory.length > 0) {
      // Skip the first message if it's an AI welcome message
      const startIndex = (messageHistory.length > 0 && messageHistory[0].type === 'ai' && messageHistory[0].centered) ? 1 : 0;
      
      for (let i = startIndex; i < messageHistory.length; i++) {
        const msg = messageHistory[i];
        if (msg.text) {
          formattedMessages.push({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.text
          });
        }
      }
    }
    
    // Add the new user message
    formattedMessages.push({
      role: 'user',
      content: userMessage
    });
    
    // Check if user knowledge is enabled
    const isKnowledgeEnabled = userKnowledgeContext?.enabled ?? await isUserKnowledgeEnabled();
    
    // Create a context message
    let contextMessage = "User Context:\n";
    
    // Add user context information
    if (userContext && Object.keys(userContext).length > 0) {
      if (userContext.profile) {
        contextMessage += `\nProfile: ${JSON.stringify(userContext.profile)}`;
      }
      
      if (userContext.lifeDirection) {
        contextMessage += `\nLife Direction: ${userContext.lifeDirection}`;
      }
      
      if (userContext.goals && userContext.goals.length > 0) {
        contextMessage += `\nGoals: ${userContext.goals.map(g => g.title).join(', ')}`;
      }
      
      if (userContext.projects && userContext.projects.length > 0) {
        contextMessage += `\nProjects: ${userContext.projects.map(p => p.title).join(', ')}`;
      }
      
      if (userContext.todos && userContext.todos.length > 0) {
        contextMessage += `\nToday's To-dos: ${userContext.todos.map(t => t.title).join(', ')}`;
      }
    }
    
    // Add document context if enabled and this is the first message
    let documentContext = '';
    if (isKnowledgeEnabled) {
      // First try the context provided in userKnowledgeContext
      if (userKnowledgeContext && userKnowledgeContext.documentContext) {
        documentContext = userKnowledgeContext.documentContext;
        debugLog('Using provided document context, length:', documentContext.length);
      }
      // Or if this is the first message, fetch it
      else if (isFirstMessage) {
        documentContext = await getDocumentContext();
        debugLog('Fetched document context for first message, length:', documentContext.length);
      }
      
      if (documentContext) {
        if (contextMessage) {
          contextMessage += "\n\n"; // Add spacing between user context and document context
        }
        contextMessage += documentContext;
      }
    }
    
    // Insert the combined context as the second message if it exists
    if (contextMessage && contextMessage !== "User Context:\n") {
      formattedMessages.splice(1, 0, {
        role: 'system',
        content: contextMessage
      });
    }
    
    debugLog('Sending request to Lambda API');
    debugLog(`Messages count: ${formattedMessages.length}`);
    
    // Get user's timezone offset
    const userTimezoneOffset = getUserTimezoneOffset();
    
    // Create request payload
    const requestPayload = {
      messages: formattedMessages,
      model: modelSettings.model || 'gpt-4o',
      userTimezoneOffset: userTimezoneOffset,
      isFirstMessage: isFirstMessage // Include flag for title generation
    };
    
    // Make the API request
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(requestPayload)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API returned status ${response.status}`);
    }
    
    const responseData = await response.json();
    
    // Extract response components
    const aiResponseText = responseData.message?.content || 
      "I'm sorry, I couldn't generate a response. Please try again.";
    const generatedTitle = responseData.title || null;
    
    // Extract actions
    const actions = extractActionDirectives(aiResponseText);
    
    // Add timezone metadata to time block actions
    if (actions && actions.length > 0) {
      actions.forEach(action => {
        if (action.type === 'createTimeBlock' && !action.data.userTimezoneOffset) {
          action.data.userTimezoneOffset = userTimezoneOffset;
          action.data.userTimezoneString = getTimezoneOffsetString();
        }
      });
    }
    
    // Record usage
    await AIUsageManager.recordUsage(estimatedPercentage);
    
    // Return response with actions and title
    return {
      text: aiResponseText,
      actions: actions,
      title: generatedTitle
    };
  } catch (error) {
    console.error('Error in generateAIResponseHTTP:', error);
    return {
      text: "I'm having trouble connecting to my services right now. Please try again in a moment.",
      actions: null,
      error: error.message
    };
  }
};

/**
 * Create a new conversation
 * @param {Array} initialMessages - Initial messages
 * @returns {Promise<Object>} New conversation
 */
export const createConversation = async (initialMessages = []) => {
  try {
    debugLog('Creating new conversation');
    
    // Create unique ID
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create conversation object
    const newConversation = {
      _id: id,
      title: "New Conversation",
      messages: Array.isArray(initialMessages) ? initialMessages : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(`conversation_${id}`, JSON.stringify(newConversation));
    await AsyncStorage.setItem(LAST_CONVERSATION_KEY, id);
    
    // Update conversations list
    const conversationsJson = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
    const conversations = conversationsJson ? JSON.parse(conversationsJson) : [];
    conversations.unshift(newConversation);
    await AsyncStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversations));
    
    // Initialize assistant thread
    try {
      await AssistantService.initialize();
      await AssistantService.clearThread();
    } catch (assistantError) {
      console.error('Error initializing assistant for new conversation:', assistantError);
    }
    
    // Pre-fetch document context for new conversation if enabled
    try {
      const knowledgeEnabled = await isUserKnowledgeEnabled();
      if (knowledgeEnabled) {
        // Fetch in background
        getDocumentContext(true).then(context => {
          if (context) {
            debugLog('Pre-fetched document context for new conversation, length:', context.length);
            
            // Store in AssistantService for first message
            AssistantService.setDocumentContext(context).catch(error => {
              console.error('Error storing pre-fetched document context:', error);
            });
          }
        }).catch(error => {
          console.error('Error pre-fetching document context:', error);
        });
      }
    } catch (error) {
      console.error('Error checking knowledge status:', error);
    }
    
    return newConversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Get a specific conversation
 * @param {string} id - Conversation ID
 * @returns {Promise<Object>} Conversation
 */
export const getConversation = async (id) => {
  try {
    // Check individual storage
    const singleConvJson = await AsyncStorage.getItem(`conversation_${id}`);
    if (singleConvJson) {
      return JSON.parse(singleConvJson);
    }
    
    // Check conversations list
    const conversationsJson = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (conversationsJson) {
      const conversations = JSON.parse(conversationsJson);
      const conversation = conversations.find(conv => conv._id === id);
      if (conversation) {
        return conversation;
      }
    }
    
    throw new Error('Conversation not found');
  } catch (error) {
    console.error(`Error getting conversation ${id}:`, error);
    throw error;
  }
};

/**
 * Get all conversations
 * @returns {Promise<Array>} All conversations
 */
export const getConversations = async () => {
  try {
    const conversationsJson = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
    return conversationsJson ? JSON.parse(conversationsJson) : [];
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
};

/**
 * Update conversation properties
 * @param {string} conversationId - Conversation ID
 * @param {Object} updates - Properties to update
 * @returns {Promise<Object>} Updated conversation
 */
export const updateConversation = async (conversationId, updates) => {
  try {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }
    
    // Get the conversation
    const conversationJson = await AsyncStorage.getItem(`conversation_${conversationId}`);
    if (!conversationJson) {
      throw new Error('Conversation not found');
    }
    
    const conversation = JSON.parse(conversationJson);
    
    // Apply updates
    const updatedConversation = {
      ...conversation,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Handle special case for title
    if (updates.title && conversation.messages && conversation.messages.length === 1 && 
        conversation.messages[0].type === 'ai') {
      updatedConversation.pendingTitle = updates.title;
    }
    
    // Save updated conversation
    await AsyncStorage.setItem(`conversation_${conversationId}`, JSON.stringify(updatedConversation));
    
    // Update in conversations list
    const conversationsJson = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (conversationsJson) {
      const conversations = JSON.parse(conversationsJson);
      const index = conversations.findIndex(conv => conv._id === conversationId);
      if (index !== -1) {
        conversations[index] = updatedConversation;
        await AsyncStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversations));
      }
    }
    
    return updatedConversation;
  } catch (error) {
    console.error(`Error updating conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Add a message to a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} text - Message text
 * @param {string} type - Message type ('user' or 'ai')
 * @param {Array} files - Attached files
 * @returns {Promise<Object>} The new message
 */
export const addMessageToConversation = async (conversationId, text, type = 'user', files = null) => {
  try {
    // Get the conversation
    const conversationJson = await AsyncStorage.getItem(`conversation_${conversationId}`);
    if (!conversationJson) {
      throw new Error('Conversation not found');
    }
    
    const conversation = JSON.parse(conversationJson);
    
    // Create new message
    const newMessage = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date().toISOString(),
      conversationId: conversationId
    };
    
    // Add files if provided
    if (files && Array.isArray(files) && files.length > 0) {
      newMessage.files = files.map(file => ({
        uri: file.uri,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType
      }));
    }
    
    // Add message to conversation
    conversation.messages = conversation.messages || [];
    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date().toISOString();
    
    // Handle title
    if (type === 'ai' && conversation.pendingTitle) {
      conversation.title = conversation.pendingTitle;
      delete conversation.pendingTitle;
    }
    else if (type === 'user' && conversation.messages.filter(m => m.type === 'user').length === 1) {
      // Generate title for first user message
      conversation.title = generateConversationTitle([...conversation.messages]);
    }
    
    // Save updated conversation
    await AsyncStorage.setItem(`conversation_${conversationId}`, JSON.stringify(conversation));
    
    // Update in conversations list
    const conversationsJson = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (conversationsJson) {
      const conversations = JSON.parse(conversationsJson);
      const index = conversations.findIndex(conv => conv._id === conversationId);
      if (index !== -1) {
        conversations[index] = conversation;
        await AsyncStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversations));
      }
    }
    
    return newMessage;
  } catch (error) {
    console.error(`Error adding message to conversation ${conversationId}:`, error);
    throw error;
  }
};

/**
 * Delete a conversation
 * @param {string} id - Conversation ID
 * @returns {Promise<Object>} Result
 */
export const deleteConversation = async (id) => {
  try {
    // Remove from AsyncStorage
    await AsyncStorage.removeItem(`conversation_${id}`);
    
    // Update conversations list
    const conversationsJson = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (conversationsJson) {
      const conversations = JSON.parse(conversationsJson);
      const updatedConversations = conversations.filter(conv => conv._id !== id);
      await AsyncStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(updatedConversations));
    }
    
    // Also remove first message sent flag
    await AsyncStorage.removeItem(`${FIRST_MESSAGE_SENT_KEY}${id}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

/**
 * Delete all conversations
 * @returns {Promise<Object>} Result
 */
export const deleteAllConversations = async () => {
  try {
    // Get all conversations
    const conversationsJson = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (conversationsJson) {
      const conversations = JSON.parse(conversationsJson);
      
      // Remove each conversation's individual storage
      for (const conv of conversations) {
        await AsyncStorage.removeItem(`conversation_${conv._id}`);
        await AsyncStorage.removeItem(`${FIRST_MESSAGE_SENT_KEY}${conv._id}`);
      }
      
      // Clear conversations list
      await AsyncStorage.removeItem(CONVERSATION_STORAGE_KEY);
    }
    
    // Clear assistant thread
    try {
      await AssistantService.initialize();
      await AssistantService.clearThread();
    } catch (assistantError) {
      console.error('Error clearing assistant thread:', assistantError);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting all conversations:', error);
    throw error;
  }
};

/**
 * Clear all AI data
 * @returns {Promise<Object>} Result
 */
export const clearAllAIData = async () => {
  try {
    // Clear conversations
    await deleteAllConversations();
    
    // Clear last conversation ID
    await AsyncStorage.removeItem(LAST_CONVERSATION_KEY);
    
    // Clear document context cache
    await AsyncStorage.removeItem(DOCUMENT_CONTEXT_CACHE_KEY);
    await AsyncStorage.removeItem(DOCUMENT_CONTEXT_TIMESTAMP_KEY);
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing all AI data:', error);
    throw error;
  }
};

// Alias for deleteAllConversations
export const clearAllConversations = deleteAllConversations;

export default {
  generateAIResponse,
  getUserContext,
  getDocumentContext,
  getConversations,
  getConversation,
  createConversation,
  addMessageToConversation,
  updateConversation,
  deleteConversation,
  deleteAllConversations,
  clearAllConversations,
  clearAllAIData,
  getModelSettings,
  extractActionDirectives,
  removeActionDirectives,
  calculateConversationSize,
  truncateConversation,
  isConversationSizeExceeded,
  isApproachingWarningThreshold,
  isUserKnowledgeEnabled,
  isFirstMessage,
  markFirstMessageSent,
  getUserTimezoneOffset,
  getTimezoneOffsetString,
  parseAIDateTimeString,
  getCharacterLimit,
  getWarningThreshold,
  initializeWebSocket
};