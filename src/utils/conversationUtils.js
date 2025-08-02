// src/utils/conversationUtils.js

/**
 * Generates a summarized title from the conversation messages
 * @param {Array} messages - Array of conversation messages
 * @returns {string} - Summarized title
 */
export const generateConversationTitle = (messages) => {
  if (!messages || messages.length === 0) {
    return 'New conversation';
  }
  
  // Find the first user message
  const firstUserMessage = messages.find(msg => msg.type === 'user');
  
  if (!firstUserMessage || !firstUserMessage.text) {
    return 'New conversation';
  }
  
  const text = firstUserMessage.text.trim();
  
  // If message is already short, just use it directly
  if (text.length <= 30) {
    return capitalizeFirstLetter(text);
  }
  
  // Method 1: Get the first sentence (end with .!?)
  let firstSentence = text.split(/[.!?]/)[0].trim();
  
  // Method 2: For longer messages, try to extract key phrases or questions
  if (text.length > 40) {
    // Check if there's a question
    const questionMatch = text.match(/(?:\?|how|what|when|where|why|can you|could you|would you|will you)([^.!?]+[.!?])/i);
    if (questionMatch && questionMatch[0]) {
      const question = questionMatch[0].trim();
      if (question.length <= 32) {
        firstSentence = question;
      }
    }
    
    // Check for keyword phrases like "help me with", "create a", etc.
    const keyPhraseMatch = text.match(/(help me with|create a|make a|build a|design a|setup a|write a|generate a)([^.!?]+)/i);
    if (keyPhraseMatch && keyPhraseMatch[0]) {
      const keyPhrase = keyPhraseMatch[0].trim();
      if (keyPhrase.length <= 32) {
        firstSentence = keyPhrase;
      }
    }
  }
  
  // If first sentence is too long, truncate it
  if (firstSentence.length > 32) {
    // Try to find a good breakpoint at a word boundary
    const breakpoint = firstSentence.lastIndexOf(' ', 29);
    if (breakpoint > 15) {
      firstSentence = firstSentence.substring(0, breakpoint).trim() + '...';
    } else {
      // If no good breakpoint, just truncate
      firstSentence = firstSentence.substring(0, 29).trim() + '...';
    }
  }
  
  // Remove common conversation starters
  firstSentence = firstSentence
    .replace(/^(hey|hi|hello|um|so|well|okay|ok|uh)/i, '')
    .replace(/^(claude|assistant|ai)/i, '')
    .replace(/^(can you|could you|please|help me|i need you to)/i, '')
    .trim();
  
  // If we've removed too much, go back to truncated original
  if (firstSentence.length < 10 && text.length > 10) {
    firstSentence = text.substring(0, 29).trim() + '...';
  }
  
  // Remove any trailing punctuation
  firstSentence = firstSentence.replace(/[.!?,;:]+$/, '');
  
  return capitalizeFirstLetter(firstSentence);
};

/**
 * Capitalizes the first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
const capitalizeFirstLetter = (str) => {
  if (!str || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Formats a message as a human-readable string
 * @param {Object} message - Message object
 * @returns {string} Formatted message
 */
export const formatMessageForSharing = (message) => {
  if (!message) return '';
  
  const speaker = message.type === 'ai' ? 'AI' : 'You';
  const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleString() : '';
  
  return `${speaker} (${timestamp}):\n${message.text || ''}`;
};

/**
 * Formats a conversation for sharing
 * @param {Object} conversation - Conversation object
 * @returns {string} Formatted conversation text
 */
export const formatConversationForSharing = (conversation) => {
  if (!conversation || !conversation.messages || !Array.isArray(conversation.messages)) {
    return 'No conversation to share';
  }
  
  const title = conversation.title || 'Conversation';
  const date = conversation.createdAt ? new Date(conversation.createdAt).toLocaleDateString() : '';
  
  let text = `${title} (${date})\n\n`;
  
  text += conversation.messages.map(msg => formatMessageForSharing(msg)).join('\n\n---\n\n');
  
  return text;
};

/**
 * Extracts a preview from messages
 * @param {Array} messages - Array of conversation messages
 * @returns {string} Preview text
 */
export const getConversationPreview = (messages) => {
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return 'New conversation';
  }
  
  // Find the most recent user message
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.type === 'user' && message.text) {
      const preview = message.text.trim();
      return preview.length > 50 ? preview.substring(0, 47) + '...' : preview;
    }
  }
  
  // If no user message found, use the most recent AI message
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.type === 'ai' && message.text) {
      const preview = message.text.trim();
      return preview.length > 50 ? preview.substring(0, 47) + '...' : preview;
    }
  }
  
  return 'New conversation';
};

export default {
  generateConversationTitle,
  formatMessageForSharing,
  formatConversationForSharing,
  getConversationPreview,
  capitalizeFirstLetter
};