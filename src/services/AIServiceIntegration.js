// src/services/AIServiceIntegration.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import aiContextService from '../screens/PersonalKnowledgeScreen/AIContextService';
import semanticCache from '../screens/PersonalKnowledgeScreen/SemanticCache';
import vectorStore from '../screens/PersonalKnowledgeScreen/VectorStore';

// Storage keys
const VECTOR_STORAGE_ENABLED_KEY = 'vectorStorageEnabled';
const SEMANTIC_CACHE_ENABLED_KEY = 'semanticCacheEnabled';
const USER_KNOWLEDGE_ENABLED_KEY = 'userKnowledgeEnabled';

/**
 * AIServiceIntegration - Integrates AI Context with main AI Service
 * Provides optimized AI requests with local context and caching
 */
const AIServiceIntegration = {
  /**
   * Initialize the AI Context service
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  initialize: async () => {
    try {
      // Check if vector storage and semantic cache are enabled
      const vectorEnabled = await AsyncStorage.getItem(VECTOR_STORAGE_ENABLED_KEY);
      const cacheEnabled = await AsyncStorage.getItem(SEMANTIC_CACHE_ENABLED_KEY);
      const knowledgeEnabled = await AsyncStorage.getItem(USER_KNOWLEDGE_ENABLED_KEY);
      
      // Only initialize if vector storage or semantic cache is enabled
      // and user knowledge is enabled
      if ((vectorEnabled !== 'false' || cacheEnabled !== 'false') && 
          knowledgeEnabled === 'true') {
        await aiContextService.initialize();
        console.log('AI Context service initialized');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error initializing AI Context service:', error);
      return false;
    }
  },
  
  /**
   * Generate AI response with local context enhancement
   * @param {string} prompt - User prompt
   * @param {Array} messages - Conversation history
   * @param {string} modelTier - AI model tier (guide, navigator, compass)
   * @param {Array} actions - Actions detected from previous responses
   * @param {Object} userKnowledgeContext - User context data
   * @returns {Promise<Object>} AI response with possible actions
   */
  generateEnhancedResponse: async (prompt, messages, modelTier, actions, userKnowledgeContext) => {
    try {
      // Check if features are enabled
      const vectorEnabled = await AsyncStorage.getItem(VECTOR_STORAGE_ENABLED_KEY);
      const cacheEnabled = await AsyncStorage.getItem(SEMANTIC_CACHE_ENABLED_KEY);
      const knowledgeEnabled = await AsyncStorage.getItem(USER_KNOWLEDGE_ENABLED_KEY);
      
      // If user knowledge is disabled, return null to fall back to standard API
      if (knowledgeEnabled !== 'true') {
        return null;
      }
      
      // Check for semantic cache hit if enabled
      if (cacheEnabled !== 'false') {
        await semanticCache.initialize();
        const cachedResponse = await semanticCache.getCachedResponse(prompt);
        
        if (cachedResponse) {
          console.log('Using cached response from semantic cache');
          
          // Track cache hit for analytics
          // and return formatted response
          return {
            text: cachedResponse.text,
            actions: cachedResponse.actions,
            fromCache: true,
            similarity: cachedResponse.similarity
          };
        }
      }
      
      // If vector storage is disabled, return null to fall back to standard API
      if (vectorEnabled === 'false') {
        return null;
      }
      
      // Initialize vector store
      await vectorStore.initialize();
      
      // Use AI Context service to generate response
      const response = await aiContextService.sendRequest(prompt, messages, {
        model: getModelName(modelTier),
        temperature: 0.7,
        maxTokens: getTokenLimit(modelTier)
      });
      
      return response;
    } catch (error) {
      console.error('Error generating enhanced response:', error);
      return null;
    }
  },
  
  /**
   * Add a response to the semantic cache
   * @param {string} prompt - User prompt
   * @param {string} response - AI response text
   * @param {Array} actions - Actions detected from response
   * @returns {Promise<boolean>} Whether addition was successful
   */
  addToCache: async (prompt, response, actions = null) => {
    try {
      // Check if semantic cache is enabled
      const cacheEnabled = await AsyncStorage.getItem(SEMANTIC_CACHE_ENABLED_KEY);
      
      if (cacheEnabled === 'false') {
        return false;
      }
      
      await semanticCache.initialize();
      return await semanticCache.addToCache(prompt, response, actions);
    } catch (error) {
      console.error('Error adding to semantic cache:', error);
      return false;
    }
  },
  
  /**
   * Get statistics about the AI Context service
   * @returns {Promise<Object>} Statistics about the service
   */
  getStats: async () => {
    try {
      await aiContextService.initialize();
      return await aiContextService.getStats();
    } catch (error) {
      console.error('Error getting AI Context statistics:', error);
      return {
        error: error.message
      };
    }
  },
  
  /**
   * Check if AI Context service is available and enabled
   * @returns {Promise<boolean>} Whether the service is available
   */
  isAvailable: async () => {
    try {
      // Check if vector storage, semantic cache, and user knowledge are enabled
      const vectorEnabled = await AsyncStorage.getItem(VECTOR_STORAGE_ENABLED_KEY);
      const cacheEnabled = await AsyncStorage.getItem(SEMANTIC_CACHE_ENABLED_KEY);
      const knowledgeEnabled = await AsyncStorage.getItem(USER_KNOWLEDGE_ENABLED_KEY);
      
      // Check if any documents exist
      const vectorStats = await vectorStore.getStats();
      const hasDocuments = vectorStats.documents > 0;
      
      // Check if cache has entries
      const cacheStats = semanticCache.getStats();
      const hasCacheEntries = cacheStats.entries > 0;
      
      // Service is available if at least one feature is enabled,
      // user knowledge is enabled, and there are documents or cache entries
      const isAvailable = (
        (vectorEnabled !== 'false' || cacheEnabled !== 'false') &&
        knowledgeEnabled === 'true' &&
        (hasDocuments || hasCacheEntries)
      );
      
      return isAvailable;
    } catch (error) {
      console.error('Error checking AI Context availability:', error);
      return false;
    }
  },
  
  /**
   * Clear the semantic cache
   * @returns {Promise<boolean>} Whether the clear was successful
   */
  clearCache: async () => {
    try {
      await semanticCache.initialize();
      return await semanticCache.clearCache();
    } catch (error) {
      console.error('Error clearing semantic cache:', error);
      return false;
    }
  },
  
  /**
   * Search documents for relevant content
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum number of results to return
   * @param {number} similarityThreshold - Minimum similarity threshold (0-1)
   * @returns {Promise<Array>} Search results
   */
  searchDocuments: async (query, maxResults = 5, similarityThreshold = 0.6) => {
    try {
      // Check if vector storage is enabled
      const vectorEnabled = await AsyncStorage.getItem(VECTOR_STORAGE_ENABLED_KEY);
      
      if (vectorEnabled === 'false') {
        return [];
      }
      
      // Initialize vector store
      await vectorStore.initialize();
      
      // Search for relevant content
      return await vectorStore.search(query, maxResults, similarityThreshold);
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  },
  
  /**
   * Get document status
   * @param {string} documentId - Document ID
   * @returns {Promise<string>} Document status
   */
  getDocumentStatus: async (documentId) => {
    try {
      // Initialize vector store
      await vectorStore.initialize();
      
      // Get document status
      return await vectorStore.getDocumentStatus(documentId);
    } catch (error) {
      console.error('Error getting document status:', error);
      return 'error';
    }
  },
  
  /**
   * Set API key for AI service
   * @param {string} apiKey - API key
   * @returns {Promise<boolean>} Whether key was set successfully
   */
  setApiKey: async (apiKey) => {
    try {
      return await aiContextService.setApiKey(apiKey);
    } catch (error) {
      console.error('Error setting API key:', error);
      return false;
    }
  },
  
  /**
   * Enable or disable semantic caching
   * @param {boolean} enabled - Whether caching should be enabled
   * @returns {Promise<boolean>} Whether setting was saved successfully
   */
  setCacheEnabled: async (enabled) => {
    try {
      await AsyncStorage.setItem(SEMANTIC_CACHE_ENABLED_KEY, enabled.toString());
      return await aiContextService.setCacheEnabled(enabled);
    } catch (error) {
      console.error('Error setting cache enabled:', error);
      return false;
    }
  }
};

/**
 * Get the model name for a given tier
 * @param {string} tier - AI model tier (guide, navigator, compass)
 * @returns {string} OpenAI model name
 */
function getModelName(tier) {
  switch (tier) {
    case 'guide':
      return 'gpt-4o-mini';
    case 'navigator':
      return 'gpt-4o';
    case 'compass':
      return 'gpt-4-turbo';
    default:
      return 'gpt-4o';
  }
}

/**
 * Get the token limit for a given tier
 * @param {string} tier - AI model tier (guide, navigator, compass)
 * @returns {number} Token limit
 */
function getTokenLimit(tier) {
  switch (tier) {
    case 'guide':
      return 1000;
    case 'navigator':
      return 2000;
    case 'compass':
      return 4000;
    default:
      return 2000;
  }
}

export default AIServiceIntegration;