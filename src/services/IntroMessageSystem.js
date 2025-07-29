// src/services/IntroMessageSystem.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for tracking the last used message index
const LAST_INTRO_MESSAGE_INDEX_KEY = 'lastIntroMessageIndex';

/**
 * Collection of introduction messages tailored for 25-34 year-old entrepreneurial males
 * These messages cycle through each time the app starts
 */
const introMessages = [
  // Speed & Efficiency Focus
  "Your productivity partner. Let's 10x your output today.",
  "Cutting through complexity. Making progress simple.",
  "Work smarter, not harder. What are we tackling today?",
  "Your strategic edge. Let's build something great.",
  "Time is your most valuable asset. Let's make every minute count.",

  // Achievement-Oriented
  "From idea to execution. Let's make it happen.",
  "Turn your vision into reality. What's the goal?",
  "Building momentum. Creating results. Ready when you are.",
  "Your goals, amplified. Let's get to work.",
  "Success isn't built overnight. But we can accelerate it.",

  // Professional Growth
  "Your strategic partner for what matters most.",
  "Building systems that scale. What's your focus today?",
  "Transforming ambition into achievement. Let's begin.",
  "Your competitive advantage starts here.",
  "Let's turn possibilities into outcomes.",

  // Action-Oriented
  "Less planning. More doing. Let's start.",
  "Clarity. Focus. Action. What's first on your list?",
  "Ready to execute. What's the priority?",
  "From roadmap to reality. Let's make progress.",
  "Your ideas + my efficiency = results worth talking about.",

  // Value-First
  "Skip the busywork. Focus on what moves the needle.",
  "Work that matters. Results that count.",
  "Your productivity multiplier. What needs solving?",
  "Focused on impact, not just activity. Let's get started.",
  "Transforming potential into performance. Ready when you are."
];

/**
 * IntroMessageSystem - Manages cycling through AI introduction messages
 * Provides methods to get the next message in rotation or a random message
 */
const IntroMessageSystem = {
  /**
   * Get the next introduction message in sequence
   * @returns {Promise<string>} The next introduction message
   */
  getNextSequentialMessage: async () => {
    try {
      // Get the last used index from storage
      const lastIndexStr = await AsyncStorage.getItem(LAST_INTRO_MESSAGE_INDEX_KEY);
      let currentIndex = 0;
      
      if (lastIndexStr !== null) {
        // Calculate the next index, wrapping around if needed
        currentIndex = (parseInt(lastIndexStr, 10) + 1) % introMessages.length;
      }
      
      // Save the current index for next time
      await AsyncStorage.setItem(LAST_INTRO_MESSAGE_INDEX_KEY, currentIndex.toString());
      
      // Return the message at the current index
      return introMessages[currentIndex];
    } catch (error) {
      console.error('Error getting next sequential intro message:', error);
      // Fall back to a random message in case of error
      return IntroMessageSystem.getRandomMessage();
    }
  },
  
  /**
   * Get a random introduction message
   * @returns {string} A random introduction message
   */
  getRandomMessage: () => {
    const randomIndex = Math.floor(Math.random() * introMessages.length);
    return introMessages[randomIndex];
  },
  
  /**
   * Get all available introduction messages
   * @returns {Array<string>} All introduction messages
   */
  getAllMessages: () => {
    return [...introMessages];
  },
  
  /**
   * Reset the message rotation
   * @returns {Promise<void>}
   */
  resetRotation: async () => {
    try {
      await AsyncStorage.removeItem(LAST_INTRO_MESSAGE_INDEX_KEY);
      console.log('Message rotation reset');
    } catch (error) {
      console.error('Error resetting message rotation:', error);
    }
  },
  
  /**
   * Add a new custom introduction message
   * @param {string} message - The new message to add
   * @returns {Promise<boolean>} Whether the message was added successfully
   */
  addCustomMessage: async (message) => {
    try {
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return false;
      }
      
      // Get custom messages from storage
      const customMessagesStr = await AsyncStorage.getItem('customIntroMessages');
      let customMessages = [];
      
      if (customMessagesStr) {
        customMessages = JSON.parse(customMessagesStr);
      }
      
      // Add the new message
      customMessages.push(message.trim());
      
      // Save back to storage
      await AsyncStorage.setItem('customIntroMessages', JSON.stringify(customMessages));
      
      return true;
    } catch (error) {
      console.error('Error adding custom message:', error);
      return false;
    }
  },
  
  /**
   * Get all custom introduction messages
   * @returns {Promise<Array<string>>} Custom introduction messages
   */
  getCustomMessages: async () => {
    try {
      const customMessagesStr = await AsyncStorage.getItem('customIntroMessages');
      
      if (customMessagesStr) {
        return JSON.parse(customMessagesStr);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting custom messages:', error);
      return [];
    }
  }
};

export default IntroMessageSystem;