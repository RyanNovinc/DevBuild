// src/services/AssistantService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { API_BASE_URL, API_KEY } from '../config/apiConfig';
import DocumentService from './DocumentService';

// Storage keys
const ASSISTANT_ID_KEY = 'assistantId';
const THREAD_MAP_KEY = 'threadConversationMap';
const USER_ID_KEY = 'userId';
const USER_KNOWLEDGE_ENABLED_KEY = 'userKnowledgeEnabled';
const DOCUMENT_CONTEXT_KEY = 'assistantDocumentContext';

// API URL configuration
const API_URL = API_BASE_URL;

// Enable debug logging
const ENABLE_DEBUG = true;

// Debug logger function
const debugLog = (...args) => {
  if (ENABLE_DEBUG) {
    console.log('[AssistantService]', ...args);
  }
};

/**
 * Service for managing AI assistant interactions and document context
 */
class AssistantService {
  constructor() {
    this.initialized = false;
    this.assistantId = null;
    this.threadMap = new Map();
    this.documentContext = null;
    
    debugLog('AssistantService initialized with API URL:', API_URL);
  }
  
  /**
   * Initialize the assistant service
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      return;
    }
    
    try {
      debugLog('Initializing AssistantService');
      
      // Load cached assistant ID
      const cachedAssistantId = await AsyncStorage.getItem(ASSISTANT_ID_KEY);
      if (cachedAssistantId) {
        this.assistantId = cachedAssistantId;
        debugLog('Using cached assistant ID:', this.assistantId);
      }
      
      // Load thread mapping
      const threadMapStr = await AsyncStorage.getItem(THREAD_MAP_KEY);
      if (threadMapStr) {
        try {
          this.threadMap = new Map(JSON.parse(threadMapStr));
          debugLog(`Loaded ${this.threadMap.size} conversation-thread mappings`);
        } catch (parseError) {
          console.error('Error parsing thread map:', parseError);
          this.threadMap = new Map();
        }
      }
      
      // Try to load cached document context
      try {
        const cachedContext = await AsyncStorage.getItem(DOCUMENT_CONTEXT_KEY);
        if (cachedContext) {
          this.documentContext = cachedContext;
          debugLog('Loaded cached document context, length:', this.documentContext.length);
        }
      } catch (contextError) {
        console.error('Error loading cached document context:', contextError);
      }
      
      this.initialized = true;
      debugLog('AssistantService initialized successfully');
    } catch (error) {
      console.error('Error initializing AssistantService:', error);
      // Continue with default values
      this.initialized = true;
    }
  }
  
  /**
   * Get the current assistant ID
   * @returns {Promise<string>} The assistant ID
   */
  async getAssistantId() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    return this.assistantId || '';
  }
  
  /**
   * Get user ID for API requests
   * @returns {Promise<string>} The user ID
   */
  async getUserId() {
    try {
      // Get from AsyncStorage
      let userId = await AsyncStorage.getItem(USER_ID_KEY);
      
      // If no user ID, generate one
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await AsyncStorage.setItem(USER_ID_KEY, userId);
        debugLog(`Generated new user ID: ${userId}`);
      }
      
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      // Return a temporary ID on error
      return `temp_${Date.now()}`;
    }
  }
  
  /**
   * Reset the assistant ID and create a new assistant
   * @param {string} aiTier - The assistant tier (guide, navigator, compass)
   * @returns {Promise<string>} The new assistant ID
   */
  async resetAssistantId(aiTier = 'navigator') {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      debugLog('Resetting assistant ID');
      
      // Clear the current assistant ID
      this.assistantId = null;
      await AsyncStorage.removeItem(ASSISTANT_ID_KEY);
      
      // Generate a new ID
      const newAssistantId = `assistant_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Save the new ID
      this.assistantId = newAssistantId;
      await AsyncStorage.setItem(ASSISTANT_ID_KEY, newAssistantId);
      
      debugLog(`Created new assistant ID: ${newAssistantId}`);
      return newAssistantId;
    } catch (error) {
      console.error('Error resetting assistant ID:', error);
      throw error;
    }
  }
  
  /**
   * Clear thread for a conversation
   * @param {string} conversationId - The conversation ID (optional)
   * @returns {Promise<void>}
   */
  async clearThread(conversationId = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      debugLog(`Clearing thread for conversation: ${conversationId || 'current'}`);
      
      // If conversation ID provided, remove from thread map
      if (conversationId && this.threadMap.has(conversationId)) {
        this.threadMap.delete(conversationId);
        await this.saveThreadMap();
      }
      
      debugLog('Thread cleared successfully');
    } catch (error) {
      console.error('Error clearing thread:', error);
      throw error;
    }
  }
  
  /**
   * Save thread map to AsyncStorage
   * @returns {Promise<void>}
   */
  async saveThreadMap() {
    try {
      const serialized = JSON.stringify(Array.from(this.threadMap.entries()));
      await AsyncStorage.setItem(THREAD_MAP_KEY, serialized);
      debugLog(`Saved ${this.threadMap.size} thread mappings`);
    } catch (error) {
      console.error('Error saving thread map:', error);
    }
  }
  
  /**
   * Set document context for the current thread
   * @param {string} documentContext - Document context string
   * @returns {Promise<boolean>} Success status
   */
  async setDocumentContext(documentContext) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      if (!documentContext) {
        debugLog('No document context provided, not setting');
        return false;
      }
      
      // Store the document context in service state
      this.documentContext = documentContext;
      
      // Cache to AsyncStorage for persistence
      await AsyncStorage.setItem(DOCUMENT_CONTEXT_KEY, documentContext);
      
      debugLog('Document context set and cached, length:', documentContext.length);
      return true;
    } catch (error) {
      console.error('Error setting document context:', error);
      return false;
    }
  }

  /**
   * Get the current document context
   * @returns {Promise<string|null>} Document context or null
   */
  async getDocumentContext() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      // If already in memory, return it
      if (this.documentContext) {
        debugLog('Using in-memory document context, length:', this.documentContext.length);
        return this.documentContext;
      }
      
      // Otherwise try to load from AsyncStorage
      const storedContext = await AsyncStorage.getItem(DOCUMENT_CONTEXT_KEY);
      if (storedContext) {
        this.documentContext = storedContext;
        debugLog('Loaded document context from storage, length:', storedContext.length);
        return storedContext;
      }
      
      // If not found, try to get from DocumentService
      debugLog('No cached document context, fetching from DocumentService');
      const freshContext = await DocumentService.getDocumentContextForAI();
      
      if (freshContext) {
        // Cache it for future use
        this.documentContext = freshContext;
        await AsyncStorage.setItem(DOCUMENT_CONTEXT_KEY, freshContext);
        debugLog('Fetched and cached new document context, length:', freshContext.length);
        return freshContext;
      }
      
      debugLog('No document context available');
      return null;
    } catch (error) {
      console.error('Error getting document context:', error);
      return null;
    }
  }

  /**
   * Clear the current document context
   * @returns {Promise<boolean>} Success status
   */
  async clearDocumentContext() {
    try {
      this.documentContext = null;
      await AsyncStorage.removeItem(DOCUMENT_CONTEXT_KEY);
      debugLog('Document context cleared');
      return true;
    } catch (error) {
      console.error('Error clearing document context:', error);
      return false;
    }
  }
  
  /**
   * Refresh document context by fetching the latest from DocumentService
   * @returns {Promise<string|null>} Fresh document context or null
   */
  async refreshDocumentContext() {
    try {
      debugLog('Refreshing document context');
      
      // Clear existing context
      this.documentContext = null;
      await AsyncStorage.removeItem(DOCUMENT_CONTEXT_KEY);
      
      // Fetch fresh context
      const freshContext = await DocumentService.getDocumentContextForAI();
      
      if (freshContext) {
        // Cache it
        this.documentContext = freshContext;
        await AsyncStorage.setItem(DOCUMENT_CONTEXT_KEY, freshContext);
        debugLog('Refreshed document context, length:', freshContext.length);
        return freshContext;
      }
      
      debugLog('No document context available after refresh');
      return null;
    } catch (error) {
      console.error('Error refreshing document context:', error);
      return null;
    }
  }
  
  /**
   * Check if user knowledge is enabled
   * @returns {Promise<boolean>} Whether user knowledge is enabled
   */
  async isUserKnowledgeEnabled() {
    try {
      const enabledSetting = await AsyncStorage.getItem(USER_KNOWLEDGE_ENABLED_KEY);
      return enabledSetting !== 'false'; // Default to true if not set
    } catch (error) {
      console.error('Error checking if user knowledge is enabled:', error);
      return true; // Default to true if error
    }
  }
  
  /**
   * Upload a file to be processed
   * @param {Object} file - The file to upload
   * @returns {Promise<Object>} The uploaded file info
   */
  async uploadFile(file) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      debugLog(`Uploading file: ${file.name}`);
      
      // Get user ID for authentication
      const userId = await this.getUserId();
      
      // Read file as base64
      const base64Content = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Call Lambda API to process document
      const response = await fetch(`${API_URL}/process-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          'X-Api-Key': API_KEY
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.mimeType || this.inferMimeType(file.name),
          fileContent: base64Content
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      
      if (!result.processedText) {
        throw new Error('No processed text returned from server');
      }
      
      // Generate a document ID
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Save the processed text
      await DocumentService.saveProcessedDocumentContent(documentId, result.processedText);
      
      // After successful upload, refresh document context
      this.refreshDocumentContext().catch(error => {
        console.error('Error refreshing document context after upload:', error);
      });
      
      debugLog(`File processed successfully with ID: ${documentId}`);
      return {
        fileId: documentId,
        processedText: result.processedText,
        originalSize: result.originalSize,
        processedSize: result.processedSize
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
  
  /**
   * Send a message to the AI
   * @param {string} conversationId - The conversation ID
   * @param {string} message - The message text
   * @param {Object} userContext - User context data
   * @returns {Promise<Object>} The message response
   */
  async sendMessage(conversationId, message, userContext = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      debugLog(`Sending message for conversation: ${conversationId}`);
      
      // Get user ID
      const userId = await this.getUserId();
      
      // Create system prompt with user context
      let systemPrompt = 'You are a helpful assistant for productivity and planning.';
      
      if (userContext) {
        systemPrompt += `\n\nToday is ${new Date().toLocaleDateString()}.`;
        systemPrompt += '\n\nHere is some context about the user and their data:';
        
        // Add user profile
        if (userContext.profile) {
          systemPrompt += `\n\nProfile: ${JSON.stringify(userContext.profile)}`;
        }
        
        // Add life direction
        if (userContext.lifeDirection) {
          systemPrompt += `\n\nLife Direction: ${userContext.lifeDirection}`;
        }
        
        // Add goals
        if (userContext.goals && userContext.goals.length > 0) {
          systemPrompt += `\n\nGoals: ${userContext.goals.map(g => g.title).join(', ')}`;
        }
        
        // Add projects
        if (userContext.projects && userContext.projects.length > 0) {
          systemPrompt += `\n\nProjects: ${userContext.projects.map(p => p.title).join(', ')}`;
        }
        
        // Add todos
        if (userContext.todos && userContext.todos.length > 0) {
          systemPrompt += `\n\nToday's To-dos: ${userContext.todos.map(t => t.title).join(', ')}`;
        }
      }
      
      // Check if this is first message and user knowledge is enabled
      const isFirstMessage = userContext?.isFirstMessage || false;
      const isKnowledgeEnabled = await this.isUserKnowledgeEnabled();
      
      // Add document context if available and enabled
      if (isKnowledgeEnabled) {
        let documentContext = null;
        
        // Try to get context from user context
        if (userContext?.documentContext) {
          documentContext = userContext.documentContext;
          debugLog('Using document context from user context, length:', documentContext.length);
        }
        // For first message, try to get context from cache or service
        else if (isFirstMessage) {
          documentContext = await this.getDocumentContext();
          if (!documentContext) {
            debugLog('No document context found, trying to fetch from DocumentService');
            documentContext = await DocumentService.getDocumentContextForAI();
            
            if (documentContext) {
              // Cache for future use
              this.setDocumentContext(documentContext).catch(error => {
                console.error('Error caching document context:', error);
              });
            }
          }
        }
        
        if (documentContext) {
          systemPrompt += `\n\n${documentContext}`;
          debugLog('Added document context to system prompt, length:', documentContext.length);
        }
      }
      
      // Format messages
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ];
      
      // Call the chat API
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          'X-Api-Key': API_KEY
        },
        body: JSON.stringify({
          messages: messages,
          model: 'gpt-4o',
          isFirstMessage: isFirstMessage
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat failed (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      
      // Extract assistant response
      const assistantMessage = result.message?.content || 
        "I'm sorry, I couldn't process your request at this time.";
      
      // Extract generated title for first message
      const generatedTitle = isFirstMessage ? result.title || null : null;
      
      return {
        text: assistantMessage,
        title: generatedTitle
      };
    } catch (error) {
      console.error('Error sending message to assistant:', error);
      return {
        text: `I'm sorry, I encountered an error: ${error.message}`
      };
    }
  }
  
  /**
   * Debug network connection to the API
   * @returns {Promise<Object>} Debug results
   */
  async debugNetworkConnection() {
    try {
      debugLog('Testing network connection to API');
      
      // Get user ID
      const userId = await this.getUserId();
      
      // Log headers that will be sent
      const headers = {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
        'X-Api-Key': API_KEY
      };
      
      // Send a simple test request
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ 
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "Hello world" }
          ],
          model: "gpt-4o"
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data: data
        };
      } else {
        const errorText = await response.text();
        return {
          success: false,
          error: `API request failed (${response.status}): ${errorText}`
        };
      }
    } catch (error) {
      console.error('Error debugging network connection:', error);
      return {
        success: false,
        error: `Error: ${error.message}`
      };
    }
  }
  
  /**
   * Infer MIME type from file name
   * @param {string} fileName - The file name
   * @returns {string} The inferred MIME type
   */
  inferMimeType(fileName) {
    if (!fileName) return 'application/octet-stream';
    
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain';
      case 'md':
      case 'markdown':
        return 'text/markdown';
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }
}

// Create and export a singleton instance
export default new AssistantService();