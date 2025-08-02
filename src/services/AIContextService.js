// src/screens/PersonalKnowledgeScreen/AIContextService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import vectorStore from './VectorStore';
import semanticCache from './SemanticCache';

// Storage keys
const API_KEY_STORAGE = 'aiContextApiKey';
const DEFAULT_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const CONVERSATION_STORAGE_KEY = 'aiContextConversations';
const USER_ID_KEY = 'userId'; // Add this for storing the user ID
const USER_KNOWLEDGE_KEY = 'userKnowledgeFiles'; // Make sure this matches the key in constants.js

/**
 * AIContextService - Service for AI requests with local context enhancement
 * Uses vector search and semantic caching to optimize API usage
 */
class AIContextService {
  constructor() {
    this.initialized = false;
    this.apiEndpoint = DEFAULT_API_ENDPOINT;
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.activeConversationId = null;
  }

  /**
   * Initialize the service
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      if (this.initialized) return true;
      
      console.log('Initializing AIContextService...');
      
      // Initialize dependencies
      await vectorStore.initialize();
      await semanticCache.initialize();
      
      // Load active conversation ID
      const activeId = await AsyncStorage.getItem('currentConversationId');
      if (activeId) {
        this.activeConversationId = activeId;
        console.log(`Loaded active conversation ID: ${activeId}`);
      } else {
        console.log('No active conversation ID found');
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing AIContextService:', error);
      return false;
    }
  }

  /**
   * Get user ID from AsyncStorage
   * @returns {Promise<string|null>} The user ID or null if not found
   */
  async getUserId() {
    try {
      // Try to get from AsyncStorage
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      
      // If no user ID found, generate a temporary one
      if (!userId) {
        const tempId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        console.log(`No user ID found, using temporary ID: ${tempId}`);
        await AsyncStorage.setItem(USER_ID_KEY, tempId);
        return tempId;
      }
      
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      // Return a temporary user ID in case of error
      return `temp_user_${Date.now()}`;
    }
  }

  /**
   * Set API key for AI service
   * @param {string} apiKey - API key
   * @returns {Promise<boolean>} Whether key was set successfully
   */
  async setApiKey(apiKey) {
    try {
      await AsyncStorage.setItem(API_KEY_STORAGE, apiKey);
      
      // Also set for vector store (for embeddings)
      await vectorStore.setEmbeddingAPIKey(apiKey);
      
      return true;
    } catch (error) {
      console.error('Error setting API key:', error);
      return false;
    }
  }

  /**
   * Get API key from storage
   * @returns {Promise<string|null>} API key or null if not set
   */
  async getApiKey() {
    try {
      return await AsyncStorage.getItem(API_KEY_STORAGE);
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  }

  /**
   * Retrieve relevant context from documents based on user prompt
   * @param {string} prompt - User prompt
   * @param {number} maxResults - Maximum number of results to retrieve
   * @returns {Promise<string>} Formatted context for AI prompt
   */
  async getRelevantContext(prompt, maxResults = 3) {
    try {
      console.log('Getting relevant context for prompt:', prompt.substring(0, 50) + '...');
      
      // First, check if we need to use document fallback due to vector store issues
      const docsStr = await AsyncStorage.getItem(USER_KNOWLEDGE_KEY);
      if (!docsStr) {
        console.log('No documents found in storage');
        return '';
      }
      
      const docs = JSON.parse(docsStr);
      console.log(`Found ${docs.length} documents in storage`);
      
      // Log document details
      docs.forEach((doc, i) => {
        console.log(`Document ${i+1}: ${doc.name} - Status: ${doc.status} - OpenAI ID: ${doc.openaiFileId || 'None'}`);
        console.log(`  Content available: ${doc.content ? 'Yes' : 'No'} - Content length: ${doc.content?.length || 0}`);
      });
      
      // Try to search using vector store first
      try {
        // Search for relevant document chunks
        const searchResults = await vectorStore.search(
          prompt,
          maxResults,
          0.6 // Minimum similarity threshold
        );
        
        if (searchResults.length === 0) {
          console.log('No relevant context found in vector search, trying direct document content');
          
          // If vector search returns no results, try using direct document content
          const validDocs = docs.filter(doc => !doc.isProcessing && !doc.processingError && doc.content);
          
          if (validDocs.length === 0) {
            console.log('No valid documents with content found');
            return '';
          }
          
          // Format context for inclusion in prompt from direct document content
          let formattedContext = '### Information from your documents:\n\n';
          
          validDocs.forEach((doc, index) => {
            console.log(`Using direct content from document "${doc.name}"`);
            formattedContext += `[Document: ${doc.name}]\n`;
            
            // Include truncated document content (first 2000 chars to avoid token limits)
            const contentPreview = doc.content?.substring(0, 2000) || '';
            formattedContext += `${contentPreview.trim()}${contentPreview.length >= 2000 ? '...' : ''}\n\n`;
          });
          
          console.log(`Created direct document context (${formattedContext.length} chars)`);
          console.log('Context preview:', formattedContext.substring(0, 200) + '...');
          return formattedContext;
        }
        
        // Format context for inclusion in prompt from vector search results
        let formattedContext = '### Relevant information from your documents:\n\n';
        
        searchResults.forEach((result, index) => {
          console.log(`Context chunk ${index + 1} from document "${result.documentName}" with similarity ${result.similarity?.toFixed(2) || 'N/A'}`);
          formattedContext += `[Document: ${result.documentName}]\n`;
          formattedContext += `${result.content.trim()}\n\n`;
        });
        
        console.log(`Found ${searchResults.length} relevant context chunks (${formattedContext.length} chars)`);
        console.log('Context preview:', formattedContext.substring(0, 200) + '...');
        return formattedContext;
      } catch (vectorError) {
        console.error('Error in vector search, falling back to direct document content:', vectorError);
        
        // If vector search fails, try using direct document content
        const validDocs = docs.filter(doc => !doc.isProcessing && !doc.processingError && doc.content);
        
        if (validDocs.length === 0) {
          console.log('No valid documents with content found');
          return '';
        }
        
        // Format context for inclusion in prompt from direct document content
        let formattedContext = '### Information from your documents (direct access):\n\n';
        
        validDocs.forEach((doc, index) => {
          console.log(`Using direct content from document "${doc.name}" after vector search failure`);
          formattedContext += `[Document: ${doc.name}]\n`;
          
          // Include truncated document content (first 2000 chars to avoid token limits)
          const contentPreview = doc.content?.substring(0, 2000) || '';
          formattedContext += `${contentPreview.trim()}${contentPreview.length >= 2000 ? '...' : ''}\n\n`;
        });
        
        console.log(`Created fallback document context (${formattedContext.length} chars)`);
        console.log('Context preview:', formattedContext.substring(0, 200) + '...');
        return formattedContext;
      }
    } catch (error) {
      console.error('Error getting relevant context:', error);
      return '';
    }
  }
  
  /**
   * Create a new conversation
   * @param {Array} initialMessages - Initial messages for the conversation
   * @returns {Promise<Object>} Created conversation object
   */
  async createConversation(initialMessages = []) {
    try {
      if (!this.initialized) await this.initialize();
      
      // Create a new conversation object
      const newConversation = {
        _id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        messages: initialMessages || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save conversation to storage
      await this.saveConversation(newConversation);
      
      // Set as active conversation
      this.activeConversationId = newConversation._id;
      await AsyncStorage.setItem('currentConversationId', newConversation._id);
      
      console.log(`Created new conversation with ID: ${newConversation._id}`);
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
  
  /**
   * Get a conversation by ID
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} Conversation object
   */
  async getConversation(conversationId) {
    try {
      if (!this.initialized) await this.initialize();
      
      // Get all conversations from storage
      const allConversationsString = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
      const allConversations = allConversationsString ? JSON.parse(allConversationsString) : {};
      
      // Check if conversation exists
      if (!allConversations[conversationId]) {
        throw new Error('Conversation not found');
      }
      
      return allConversations[conversationId];
    } catch (error) {
      console.error(`Error getting conversation ${conversationId}:`, error);
      throw error;
    }
  }
  
  /**
   * Add a message to an existing conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} messageText - Message text
   * @param {string} messageType - Message type ('user' or 'ai')
   * @returns {Promise<Object>} Updated conversation object
   */
  async addMessageToConversation(conversationId, messageText, messageType = 'user') {
    try {
      if (!this.initialized) await this.initialize();
      
      // Get the conversation
      let conversation;
      try {
        conversation = await this.getConversation(conversationId);
      } catch (error) {
        // If conversation not found, create a new one
        if (error.message === 'Conversation not found') {
          console.log(`Conversation ${conversationId} not found, creating a new one`);
          conversation = await this.createConversation([]);
          conversationId = conversation._id;
        } else {
          throw error;
        }
      }
      
      // Create the new message
      const newMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: messageText,
        type: messageType,
        timestamp: new Date().toISOString()
      };
      
      // Add the message to the conversation
      conversation.messages.push(newMessage);
      conversation.updatedAt = new Date().toISOString();
      
      // Save the updated conversation
      await this.saveConversation(conversation);
      
      console.log(`Added ${messageType} message to conversation ${conversationId}`);
      return conversation;
    } catch (error) {
      console.error(`Error adding message to conversation ${conversationId}:`, error);
      throw error;
    }
  }
  
  /**
   * Save a conversation to storage
   * @param {Object} conversation - Conversation object
   * @returns {Promise<boolean>} Whether save was successful
   */
  async saveConversation(conversation) {
    try {
      if (!conversation || !conversation._id) {
        throw new Error('Invalid conversation object');
      }
      
      // Get all conversations from storage
      const allConversationsString = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
      const allConversations = allConversationsString ? JSON.parse(allConversationsString) : {};
      
      // Add or update the conversation
      allConversations[conversation._id] = conversation;
      
      // Save all conversations back to storage
      await AsyncStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(allConversations));
      
      return true;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return false;
    }
  }

  /**
   * Send a request to the AI service with local context enhancement
   * @param {string} prompt - User prompt
   * @param {Array} messages - Conversation history
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response from AI service
   */
  async sendRequest(prompt, messages = [], options = {}) {
    try {
      if (!this.initialized) await this.initialize();
      
      const startTime = Date.now();
      this.lastRequestTime = startTime;
      this.requestCount++;
      
      // Check if we have a cached response
      const cachedResponse = await semanticCache.getCachedResponse(prompt);
      if (cachedResponse) {
        console.log('Using cached response');
        
        // Log performance metrics
        const endTime = Date.now();
        console.log(`Cache hit! Response time: ${endTime - startTime}ms`);
        
        return {
          text: cachedResponse.text,
          actions: cachedResponse.actions,
          fromCache: true,
          responseTime: endTime - startTime,
          similarity: cachedResponse.similarity
        };
      }
      
      // Get API key
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        throw new Error('API key not set. Please set an API key in settings.');
      }
      
      // Get relevant context from documents
      const relevantContext = await this.getRelevantContext(prompt);
      
      // Format messages with context
      let formattedMessages = [...messages];
      
      // Add system message with context if it exists
      if (relevantContext) {
        formattedMessages = [
          {
            role: 'system',
            content: `You are a helpful AI assistant with access to the user's documents. 
                     Use the following information from the user's documents to inform your responses.
                     
                     ${relevantContext}
                     
                     When using information from documents, indicate the source in your response.`
          },
          ...formattedMessages
        ];
        
        console.log('Added document context to request');
      }
      
      // Log the context being used
      console.log('Context length:', relevantContext ? relevantContext.length : 0);
      
      // Add user's current prompt as the last message
      formattedMessages.push({
        role: 'user',
        content: prompt
      });
      
      // Prepare API request
      const requestBody = {
        model: options.model || 'gpt-4o',
        messages: formattedMessages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      };
      
      // Make API request
      console.log('Sending request to AI service...');
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const responseData = await response.json();
      const aiResponse = responseData.choices[0].message.content;
      
      // Extract actions if present
      const actions = this._extractActions(aiResponse);
      
      // Create cleaned response
      const cleanedResponse = this._cleanResponse(aiResponse);
      
      // Log performance metrics
      const endTime = Date.now();
      console.log(`API response received. Response time: ${endTime - startTime}ms`);
      
      // Cache the response
      await semanticCache.addToCache(prompt, cleanedResponse, actions);
      
      return {
        text: cleanedResponse,
        actions: actions,
        fromCache: false,
        responseTime: endTime - startTime,
        usage: responseData.usage
      };
    } catch (error) {
      console.error('Error sending AI request:', error);
      throw error;
    }
  }

  /**
   * Send a message to the lambda endpoint with local context enhancement
   * @param {string} prompt - User prompt
   * @param {Array} messages - Previous messages in the conversation
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response from the lambda endpoint
   */
  async sendMessageToLambda(prompt, messages = [], options = {}) {
    try {
      if (!this.initialized) await this.initialize();
      
      const startTime = Date.now();
      this.lastRequestTime = startTime;
      this.requestCount++;
      
      // Get user ID
      const userId = await this.getUserId();
      
      // Format previous messages for the API
      const formattedMessages = (messages || []).map(msg => ({
        role: msg.fromUser ? 'user' : 'assistant',
        content: msg.text || ''
      }));
      
      // Add the current prompt as the last user message if not already included
      if (formattedMessages.length === 0 || 
          formattedMessages[formattedMessages.length - 1].role !== 'user' || 
          formattedMessages[formattedMessages.length - 1].content !== prompt) {
        formattedMessages.push({
          role: 'user',
          content: prompt
        });
      }
      
      // Get relevant context from documents
      const documentContext = await this.getRelevantContext(prompt);
      console.log('Document context length:', documentContext ? documentContext.length : 0);
      
      // Combine contexts
      const combinedContext = documentContext;
      
      // Prepare the request body for the Lambda function
      const requestBody = {
        messages: formattedMessages,
        aiTier: options.aiTier || 'navigator',
        shouldDetectActions: options.shouldDetectActions !== false,
        verbosity: options.verbosity || 'medium',
        userData: {
          ...options.userData || {},
          context: combinedContext || undefined
        },
        userId: userId
      };
      
      console.log('Sending request to Lambda with message count:', formattedMessages.length);
      console.log('Document context included:', !!documentContext);
      
      // Send the request to the Lambda function
      const response = await fetch(`https://4dwonpal1a.execute-api.ap-southeast-2.amazonaws.com/prod/claude-proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`,
          'x-user-id': userId
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Lambda function returned status ${response.status}: ${responseText}`);
      }
      
      const responseData = await response.json();
      
      // Extract actions if present
      const actions = this._extractActions(responseData.text);
      
      // Create cleaned response
      const cleanedResponse = this._cleanResponse(responseData.text);
      
      // Log performance metrics
      const endTime = Date.now();
      console.log(`Lambda response received. Response time: ${endTime - startTime}ms`);
      
      return {
        text: cleanedResponse,
        actions: actions || [],
        responseTime: endTime - startTime
      };
    } catch (error) {
      console.error('Error sending message to Lambda:', error);
      throw error;
    }
  }

  /**
   * Extract actions from AI response
   * @param {string} response - AI response text
   * @returns {Array|null} Extracted actions or null if none found
   */
  _extractActions(response) {
    if (!response) return null;
    
    // Check for action markers in the text
    const hasCreateGoalMarker = response.includes('[[CREATE_GOAL]]');
    const hasCreateProjectMarker = response.includes('[[CREATE_PROJECT]]');
    const hasCreateTaskMarker = response.includes('[[CREATE_TASK]]');
    const hasCreateTimeBlockMarker = response.includes('[[CREATE_TIME_BLOCK]]');
    const hasCreateTodoMarker = response.includes('[[CREATE_TODO]]');
    const hasCreateTodoGroupMarker = response.includes('[[CREATE_TODO_GROUP]]');
    const hasUpdateLifeDirectionMarker = response.includes('[[UPDATE_LIFE_DIRECTION]]');
    
    if (!hasCreateGoalMarker && !hasCreateProjectMarker && !hasCreateTaskMarker && 
        !hasCreateTimeBlockMarker && !hasCreateTodoMarker && !hasCreateTodoGroupMarker &&
        !hasUpdateLifeDirectionMarker) {
      // No action markers found
      return null;
    }
    
    // Extract all actions
    const actions = [];
    
    // Goal creation
    if (hasCreateGoalMarker) {
      const goalMatches = [...response.matchAll(/\[\[CREATE_GOAL\]\]([\s\S]*?)(?=\[\[|\s*$)/gi)];
      
      for (const match of goalMatches) {
        const goalData = this._parseActionData(match[1]);
        
        actions.push({
          id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'createGoal',
          title: 'Create New Goal',
          description: 'I\'ve prepared a goal based on your request. Review and confirm to add it to your goals.',
          data: {
            title: goalData.title || 'New Goal',
            description: goalData.description || '',
            domain: goalData.domain || 'General',
            icon: goalData.icon || 'star',
            color: goalData.color || '#4CAF50',
            targetDate: goalData.targetdate || null,
            progress: 0,
            completed: false
          }
        });
      }
    }
    
    // Project creation
    if (hasCreateProjectMarker) {
      const projectMatches = [...response.matchAll(/\[\[CREATE_PROJECT\]\]([\s\S]*?)(?=\[\[|\s*$)/gi)];
      
      for (const match of projectMatches) {
        const projectData = this._parseActionData(match[1]);
        
        actions.push({
          id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'createProject',
          title: 'Create New Project',
          description: 'I\'ve prepared a project based on your request. Review and confirm to add it to your projects.',
          data: {
            title: projectData.title || 'New Project',
            description: projectData.description || '',
            goalId: projectData.goalid,
            goalTitle: projectData.goaltitle,
            domain: projectData.domain || 'General',
            color: projectData.color || '#4CAF50',
            dueDate: projectData.duedate || null,
            progress: 0,
            completed: false,
            tasks: this._parseTasks(projectData.tasks) || []
          }
        });
      }
    }
    
    // Task creation
    if (hasCreateTaskMarker) {
      const taskMatches = [...response.matchAll(/\[\[CREATE_TASK\]\]([\s\S]*?)(?=\[\[|\s*$)/gi)];
      
      for (const match of taskMatches) {
        const taskData = this._parseActionData(match[1]);
        
        actions.push({
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'createTask',
          title: 'Create New Task',
          description: 'I\'ve prepared a task based on your request. Review and confirm to add it.',
          data: {
            title: taskData.title || 'New Task',
            description: taskData.description || '',
            projectTitle: taskData.projecttitle || taskData.projectTitle,
            goalTitle: taskData.goaltitle || taskData.goalTitle,
            status: taskData.status || 'todo',
            completed: false
          }
        });
      }
    }
    
    // Time block creation
    if (hasCreateTimeBlockMarker) {
      const timeBlockMatches = [...response.matchAll(/\[\[CREATE_TIME_BLOCK\]\]([\s\S]*?)(?=\[\[|\s*$)/gi)];
      
      for (const match of timeBlockMatches) {
        const timeBlockData = this._parseActionData(match[1]);
        
        // Parse dates
        let startTime = null;
        let endTime = null;
        
        try {
          if (timeBlockData.starttime) {
            startTime = new Date(timeBlockData.starttime);
            startTime = startTime.toISOString();
          }
          
          if (timeBlockData.endtime) {
            endTime = new Date(timeBlockData.endtime);
            endTime = endTime.toISOString();
          }
        } catch (error) {
          console.error('Error parsing time block dates:', error);
        }
        
        actions.push({
          id: `timeblock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'createTimeBlock',
          title: 'Schedule Time Block',
          description: 'I\'ve prepared a time block based on your request. Review and confirm to add it to your schedule.',
          data: {
            title: timeBlockData.title || 'New Time Block',
            startTime: startTime,
            endTime: endTime,
            location: timeBlockData.location || '',
            notes: timeBlockData.notes || '',
            domain: timeBlockData.domain || 'General',
            color: timeBlockData.color || '#4CAF50',
            isAllDay: timeBlockData.isallday === 'true' || timeBlockData.isallday === true
          }
        });
      }
    }
    
    // To-do creation
    if (hasCreateTodoMarker) {
      const todoMatches = [...response.matchAll(/\[\[CREATE_TODO\]\]([\s\S]*?)(?=\[\[|\s*$)/gi)];
      
      for (const match of todoMatches) {
        const todoData = this._parseActionData(match[1]);
        const tab = todoData.tab || 'today';
        
        actions.push({
          id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'createTodo',
          title: `Create To-Do for ${tab.charAt(0).toUpperCase() + tab.slice(1)}`,
          description: `I've prepared a to-do item based on your request. Review and confirm to add it to your ${tab} list.`,
          data: {
            title: todoData.title || 'New To-Do',
            completed: false,
            tab: tab,
            groupId: todoData.groupid,
            groupTitle: todoData.grouptitle
          }
        });
      }
    }
    
    // To-do group creation
    if (hasCreateTodoGroupMarker) {
      const todoGroupMatches = [...response.matchAll(/\[\[CREATE_TODO_GROUP\]\]([\s\S]*?)(?=\[\[|\s*$)/gi)];
      
      for (const match of todoGroupMatches) {
        const todoGroupData = this._parseActionData(match[1]);
        const tab = todoGroupData.tab || 'today';
        
        actions.push({
          id: `todogroup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'createTodoGroup',
          title: `Create To-Do Group for ${tab.charAt(0).toUpperCase() + tab.slice(1)}`,
          description: `I've prepared a to-do group based on your request. Review and confirm to add it to your ${tab} list.`,
          data: {
            title: todoGroupData.title || 'New Group',
            completed: false,
            isGroup: true,
            tab: tab,
            items: this._parseToDoGroupItems(todoGroupData.items) || []
          }
        });
      }
    }
    
    // Life direction update
    if (hasUpdateLifeDirectionMarker) {
      const lifeDirMatches = [...response.matchAll(/\[\[UPDATE_LIFE_DIRECTION\]\]([\s\S]*?)(?=\[\[|\s*$)/gi)];
      
      for (const match of lifeDirMatches) {
        const directionText = match[1].trim();
        
        actions.push({
          id: `lifedir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'updateLifeDirection',
          title: 'Update Life Direction',
          description: 'I\'ve drafted a new life direction statement based on your request. Review and confirm to update your profile.',
          data: directionText || "To live with purpose and integrity, prioritizing meaningful connections, continuous growth, and positive contribution to the world around me."
        });
      }
    }
    
    return actions.length > 0 ? actions : null;
  }
  
  /**
   * Parse action data from text block
   * @param {string} text - Text block containing action data
   * @returns {Object} Parsed action data
   */
  _parseActionData(text) {
    if (!text) return {};
    
    const data = {};
    const lines = text.trim().split('\n');
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.substring(0, colonIndex).trim().toLowerCase();
        const value = line.substring(colonIndex + 1).trim();
        
        if (value) {
          data[key] = value;
        }
      }
    }
    
    return data;
  }
  
  /**
   * Parse tasks from text
   * @param {string} tasksText - Text containing task list
   * @returns {Array} Parsed tasks
   */
  _parseTasks(tasksText) {
    if (!tasksText) return [];
    
    const tasks = [];
    let taskLines = [];
    
    // First, check if it's a comma-separated list
    if (tasksText.includes(',') && !tasksText.includes('\n')) {
      taskLines = tasksText.split(',')
        .map(task => task.trim())
        .filter(task => task.length > 0);
    } else {
      // Otherwise, treat as a line-separated list
      taskLines = tasksText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
    
    // Extract tasks from lines
    for (const line of taskLines) {
      // Remove bullet points, numbers, etc.
      const taskMatch = line.match(/^(?:\d+\.|\-|\*|\•)\s*(.+)$/);
      const taskTitle = taskMatch ? taskMatch[1].trim() : line.trim();
      
      if (taskTitle.length > 1) {
        tasks.push({
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: taskTitle,
          completed: false
        });
      }
    }
    
    return tasks;
  }
  
  /**
   * Parse to-do group items from text
   * @param {string} itemsText - Text containing to-do items
   * @returns {Array} Parsed to-do items
   */
  _parseToDoGroupItems(itemsText) {
    if (!itemsText) return [];
    
    const items = [];
    let itemLines = [];
    
    // First, check if it's a comma-separated list
    if (itemsText.includes(',') && !itemsText.includes('\n')) {
      itemLines = itemsText.split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    } else {
      // Otherwise, treat as a line-separated list
      itemLines = itemsText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
    
    // Extract items from lines
    for (const line of itemLines) {
      // Remove bullet points, numbers, etc.
      const itemMatch = line.match(/^(?:\d+\.|\-|\*|\•)\s*(.+)$/);
      const itemTitle = itemMatch ? itemMatch[1].trim() : line.trim();
      
      if (itemTitle.length > 1) {
        items.push({
          id: `todoitem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: itemTitle,
          completed: false
        });
      }
    }
    
    return items;
  }
  
  /**
   * Clean response from AI service by removing action directives
   * @param {string} text - Response text to clean
   * @returns {string} Cleaned response text
   */
  _cleanResponse(text) {
    if (!text) return "";
    
    // Remove all action directives
    const cleanedText = text.replace(/\[\[CREATE_GOAL\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
      .replace(/\[\[CREATE_PROJECT\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
      .replace(/\[\[CREATE_TASK\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
      .replace(/\[\[CREATE_TIME_BLOCK\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
      .replace(/\[\[CREATE_TODO\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
      .replace(/\[\[CREATE_TODO_GROUP\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
      .replace(/\[\[UPDATE_LIFE_DIRECTION\]\][\s\S]*?(?=\[\[|\s*$)/gi, '')
      .trim();
    
    return cleanedText;
  }
}

// Create a singleton instance
const aiContextService = new AIContextService();

export default aiContextService;