// src/screens/AIAssistantScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View, 
  StyleSheet, 
  SafeAreaView, 
  Platform, 
  Keyboard, 
  Alert, 
  StatusBar, 
  TouchableOpacity, 
  Text,
  Modal,
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { AIAssistantProvider, useAIAssistant } from '../context/AIAssistantContext/index';
import * as AIService from '../services/AIService';
import assistantService from '../services/AssistantService';
import DocumentService from '../services/DocumentService'; // Import DocumentService directly
import WebSocketService from '../services/WebSocketService'; // Import WebSocketService
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Auth } from 'aws-amplify'; // Import Auth from Amplify
import * as FeatureExplorerTracker from '../services/FeatureExplorerTracker';
import { useNotification } from '../context/NotificationContext';

// Import responsive utilities
import responsive, { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize, 
  spacing, 
  fontSizes,
  isSmallDevice,
  isTablet,
  accessibility,
  useScreenDimensions,
  useIsLandscape,
  useSafeSpacing,
  ensureAccessibleTouchTarget
} from '../utils/responsive';

// NEW: Import AIUsageManager for unlimited usage button
import AIUsageManager from '../services/AIUsageManager';

// Import components
import AIChat from '../components/ai/AIChat';
import AISideMenu from '../components/ai/AISideMenu';
import AIStatusIndicators from '../components/ai/AIStatusIndicators';
import AIToast from '../components/ai/AIToast';
// REMOVED: AIModelSelector import
import { Ionicons } from '@expo/vector-icons';

// Import modals
import AddGoalModal from '../components/AddGoalModal';
import AddProjectModal from '../components/AddProjectModal';
import AddTimeBlockModal from '../components/AddTimeBlockModal';
import AddTaskModal from '../components/AddTaskModal';
import AddTodoModal from '../components/AddTodoModal';
import UpdateLifeDirectionModal from '../components/UpdateLifeDirectionModal';

// Import AI-specific modals
import {
  AIModeInfoModal,
  AIConversationLimitModal
} from '../components/ai/AIModals';

// Import CreditDetailModal
import CreditDetailModal from '../components/ai/AIModals/CreditDetailModal';

// API endpoint for Lambda functions
const API_ENDPOINT = 'https://your-api-gateway-url/dev'; // Replace with your actual API Gateway URL

// Messages to retain when truncating
const MAX_MESSAGES_TO_KEEP = 30;

// Constant for free plan limit
const LOCAL_MAX_GOALS = 2;

// Collection of dynamic intro messages
const introMessages = [
  // Natural & Helpful
  "Hi there!\nWhat's on your mind today?",
  "Ready to dive in?\nWhat would you like to work on?",
  "Let's get started.\nHow can I help you today?",
  "What's up?\nAnything you'd like to tackle?",
  "Hey!\nWhat would you like to focus on?",

  // Goal-Oriented but Natural
  "Got any goals you're working on?\nI'm here to help.",
  "What's next on your list?\nLet's figure it out together.",
  "Planning anything interesting?\nI'd love to help you think it through.",
  "Working on something exciting?\nTell me about it.",
  "Any projects keeping you busy?\nI can help you organize your thoughts.",

  // Encouraging but Simple
  "Ready to make some progress?\nWhat's the plan?",
  "Let's tackle something together.\nWhat's been on your mind?",
  "I'm here when you need me.\nWhat would you like to discuss?",
  "Fresh start, fresh possibilities.\nWhat are you thinking about?",
  "New conversation, new opportunities.\nWhat's the focus today?",

  // Conversational
  "What's happening in your world?\nAnything I can help with?",
  "Let's chat about what matters to you.\nWhat's on your agenda?",
  "I'm all ears.\nWhat would you like to explore?",
  "Ready for a productive conversation?\nWhat's the topic?",
  "What's worth talking about today?\nI'm here to help however I can."
];

// Function to get a random intro message
function getRandomIntroMessage() {
  const randomIndex = Math.floor(Math.random() * introMessages.length);
  return introMessages[randomIndex];
}

// Track if a conversation has had user interaction
const TEMP_CONVERSATION_KEY = 'tempConversationId';
const FIRST_MESSAGE_SENT_KEY = 'firstMessageSent_';

/**
 * Main component content wrapped in context provider
 */
const AIAssistantContent = ({ navigation, route = {} }) => {
  // SAFETY CHECK: Handle missing navigation object
  if (!navigation) {
    console.warn('Navigation is undefined in AIAssistantScreen');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>
            Loading interface...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const { theme } = useTheme();
  const appContext = useAppContext(); // Add app context
  const { 
    state, 
    dispatch, 
    resetGoalSession,
    getAvailableTiers
  } = useAIAssistant();
  
  // Get notification function for achievement notifications
  const { showSuccess } = useNotification();
  
  // Get screen dimensions and orientation
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  const safeSpacing = useSafeSpacing();
  
  // REMOVED: Model selector modal state
  
  // NEW: State for unlimited usage status
  const [isUnlimitedMode, setIsUnlimitedMode] = useState(false);
  
  // NEW: State for credit detail modal
  const [creditDetailVisible, setCreditDetailVisible] = useState(false);
  
  // Modal states for actions
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [timeBlockModalVisible, setTimeBlockModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [todoModalVisible, setTodoModalVisible] = useState(false);
  const [lifeDirectionModalVisible, setLifeDirectionModalVisible] = useState(false);
  const [conversationLimitModalVisible, setConversationLimitModalVisible] = useState(false);
  const [conversationSizeWarningShown, setConversationSizeWarningShown] = useState(false);
  const [currentGoalData, setCurrentGoalData] = useState(null);
  const [currentProjectData, setCurrentProjectData] = useState(null);
  const [currentTimeBlockData, setCurrentTimeBlockData] = useState(null);
  const [currentTaskData, setCurrentTaskData] = useState(null);
  const [currentTodoData, setCurrentTodoData] = useState(null);
  const [currentLifeDirection, setCurrentLifeDirection] = useState('');
  
  // NEW: Add upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  
  // Track multiple actions
  const [pendingActions, setPendingActions] = useState([]);
  const [actionProgress, setActionProgress] = useState(0);
  const [totalActions, setTotalActions] = useState(0);
  
  // Track if user has interacted with the conversation
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  // Goal session tracking
  const lastCreatedGoalRef = useRef({
    id: null,
    title: null,
    domain: null,
    color: null
  });
  
  // Keyboard listener refs
  const keyboardDidShowListener = useRef(null);
  const keyboardDidHideListener = useRef(null);
  
  // Extract relevant state with null checks
  const { 
    conversationId, 
    messages = [], 
    isLoading = false, 
    isInitializing = true, 
    showSuggestions = true 
  } = state.conversation || {};
  
  const { 
    menuState = 'closed',
    modeInfoVisible = false,
    showToast: toastVisible = false,
    toastMessage = ''
  } = state.ui || {};
  
  const {
    userDocuments = [],
    userKnowledgeEnabled = true
  } = state.knowledge || {};
  
  const {
    subscriptionStatus = 'free',
    baseCredits = 0.60,         // Default to Basic tier
    rolledOverCredits = 0,
    creditsUsed = 0,
    nextRefreshDate = null
  } = state.credits || {};
  
  // MODIFIED: Use a fixed AI model tier
  const aiModelTier = 'guide';
  
  // Extract user info from route or context with null checks
  const userName = (route?.params?.userName) || 'there';
  
  // Get conversation ID from route params or use last saved conversation
  const routeConversationId = route?.params?.conversationId;
  
  // Check if user can add more goals based on limits
  const canAddMoreGoals = () => {
    // Get isPro status from appContext
    const isPro = appContext?.userSubscriptionStatus === 'pro' || 
                 appContext?.userSubscriptionStatus === 'unlimited' || 
                 false;
    
    // Pro users have unlimited goals
    if (isPro) return true;
    
    // Get active goals from appContext
    const goals = appContext?.goals || [];
    
    // Count active goals (non-completed)
    const activeGoals = goals.filter(goal => !goal.completed);
    const activeCount = activeGoals.length;
    
    // Free users are limited to LOCAL_MAX_GOALS active goals
    return activeCount < LOCAL_MAX_GOALS;
  };
  
  // Show upgrade modal with custom message
  const showUpgradePrompt = (message) => {
    setUpgradeMessage(message);
    setShowUpgradeModal(true);
  };
  
  // Navigate to pricing screen
  const goToPricingScreen = () => {
    setShowUpgradeModal(false);
    
    // Navigate to PricingScreen
    if (navigation) {
      navigation.navigate('PricingScreen');
    }
  };
  
  // Function to refresh credit data from backend
  const refreshCreditData = async () => {
    try {
      // Show a loading indicator if needed
      dispatch({ 
        type: 'SHOW_TOAST', 
        payload: 'Refreshing credit information...' 
      });
      
      // Get the current user's email
      let userEmail;
      try {
        const user = await Auth.currentAuthenticatedUser();
        userEmail = user.attributes.email;
      } catch (error) {
        console.error('Error getting current user:', error);
        userEmail = 'test@example.com'; // Fallback for testing
      }
      
      // Call your GetCreditBalance Lambda through API
      const response = await fetch(`${API_ENDPOINT}/credits/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userEmail
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const result = await response.json();
      const creditData = JSON.parse(result.body);
      
      console.log('Credit data refreshed:', creditData);
      
      // Map subscription tier to base credits
      let baseAmount = 0.60; // default light tier
      if (creditData.subscription && creditData.subscription.tier) {
        if (creditData.subscription.tier === 'standard') {
          baseAmount = 1.50;
        } else if (creditData.subscription.tier === 'max') {
          baseAmount = 5.00;
        }
      }
      
      // Calculate remaining credits
      const remaining = creditData.usage ? 
        (baseAmount * (100 - creditData.usage.percentUsed) / 100) : 
        baseAmount;
      
      // Extract values for the state update
      const updatedCredits = {
        subscriptionStatus: creditData.subscription?.status || 'active',
        baseCredits: baseAmount,
        rolledOverCredits: 0, // Not returned directly in the response
        creditsUsed: baseAmount - remaining,
        nextRefreshDate: creditData.refreshInfo?.nextRefreshDate || null
      };
      
      // Update state with fresh credit data
      dispatch({
        type: 'UPDATE_CREDITS',
        payload: updatedCredits
      });
      
      dispatch({ 
        type: 'SHOW_TOAST', 
        payload: 'Credit information updated!' 
      });
      
      return true;
    } catch (error) {
      console.error('Error refreshing credit data:', error);
      
      dispatch({ 
        type: 'SHOW_TOAST', 
        payload: 'Failed to refresh credit information.' 
      });
      
      return false;
    }
  };
  
  // NEW: Check unlimited mode status on mount
  useEffect(() => {
    const checkUnlimitedMode = async () => {
      try {
        const unlimited = await AIUsageManager.isUnlimitedMode();
        setIsUnlimitedMode(unlimited);
      } catch (error) {
        console.error('Error checking unlimited mode:', error);
      }
    };
    
    checkUnlimitedMode();
    
    // Refresh credit data on mount
    refreshCreditData().catch(err => 
      console.error('Error in initial credit refresh:', err)
    );
  }, []);
  
  // NEW: Handle unlimited usage button press
  const handleUnlimitedUsagePress = async () => {
    try {
      if (isUnlimitedMode) {
        // Disable unlimited mode
        await AIUsageManager.disableUnlimitedMode();
        setIsUnlimitedMode(false);
        
        dispatch({ 
          type: 'SHOW_TOAST', 
          payload: '📊 Normal usage limits restored' 
        });
      } else {
        // Enable unlimited mode
        await AIUsageManager.giveMaxUsage();
        setIsUnlimitedMode(true);
        
        dispatch({ 
          type: 'SHOW_TOAST', 
          payload: '🚀 Unlimited AI usage enabled!' 
        });
      }
    } catch (error) {
      console.error('Error toggling unlimited usage:', error);
      dispatch({ 
        type: 'SHOW_TOAST', 
        payload: 'Error toggling usage mode' 
      });
    }
  };
  
  // Check if this is a temp conversation
  useEffect(() => {
    const checkTempConversation = async () => {
      if (conversationId) {
        const tempId = await AsyncStorage.getItem(TEMP_CONVERSATION_KEY);
        if (tempId && tempId === conversationId) {
          console.log('Current conversation is temporary:', tempId);
        }
      }
    };
    
    checkTempConversation();
  }, [conversationId]);
  
  // Initialize WebSocket connection when component mounts
  useEffect(() => {
    // Initialize WebSocket connection
    AIService.initializeWebSocket();
    console.log('WebSocket initialized in AIAssistantScreen');

    // Listen for WebSocket connection status
    const removeHandler = WebSocketService.addConnectionHandler((status) => {
      if (status === 'error' || status === 'disconnected') {
        dispatch({
          type: 'SHOW_TOAST',
          payload: 'Connection issue detected. Some features may be limited.'
        });
      }
    });
    
    return () => {
      // Clean up handler on unmount
      if (removeHandler) removeHandler();
    };
  }, []);

  // Reset all UI state when component mounts
  useEffect(() => {
    // Force reset menu state to ensure it's closed on initial render
    dispatch({ type: 'SET_MENU_STATE', payload: 'closed' });
    
    // Reset modal visibility states
    dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { modal: 'modeInfoVisible', visible: false } });
  }, []);
  
  // Setup keyboard listeners
  useEffect(() => {
    keyboardDidShowListener.current = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Handle keyboard show
      }
    );
    
    keyboardDidHideListener.current = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Handle keyboard hide
      }
    );
    
    return () => {
      if (keyboardDidShowListener.current) {
        keyboardDidShowListener.current.remove();
      }
      if (keyboardDidHideListener.current) {
        keyboardDidHideListener.current.remove();
      }
    };
  }, []);
  
  // Handle cleanup on unmount or navigation
  useEffect(() => {
    // Only add navigation listener if navigation is available
    if (!navigation) return () => {};
    
    // Setup navigation listener for when user leaves screen
    const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
      // Check if this is a temporary conversation with no user interaction
      if (!hasUserInteracted && conversationId) {
        const tempId = await AsyncStorage.getItem(TEMP_CONVERSATION_KEY);
        
        // If this is a temp conversation and user hasn't interacted, delete it
        if (tempId && tempId === conversationId) {
          console.log('Cleaning up temporary conversation:', tempId);
          
          // Clear temp conversation reference
          await AsyncStorage.removeItem(TEMP_CONVERSATION_KEY);
          
          // Delete the conversation from storage
          try {
            await AIService.deleteConversation(tempId);
            console.log('Temporary conversation deleted successfully');
          } catch (error) {
            console.error('Error deleting temporary conversation:', error);
          }
        }
      }
    });
    
    return unsubscribe;
  }, [navigation, hasUserInteracted, conversationId]);
  
  // Create new conversation when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('AI Assistant screen focused - creating new conversation');
      createNewConversation();
    }, [])
  );

  // Initialize conversation (keeping original logic for route-based navigation)
  useEffect(() => {
    const initializeConversation = async () => {
      // Only initialize from route if we have a specific conversation ID
      if (!routeConversationId) {
        return; // Let useFocusEffect handle the default case
      }
      
      dispatch({ type: 'SET_INITIALIZING', payload: true });
      
      try {
        // Initialize the assistant service
        await assistantService.initialize();
        
        console.log(`Loading conversation from route: ${routeConversationId}`);
        try {
          const savedConversation = await AIService.getConversation(routeConversationId);
          
          if (savedConversation && Array.isArray(savedConversation.messages)) {
            dispatch({ type: 'SET_CONVERSATION_ID', payload: routeConversationId });
            dispatch({ type: 'SET_MESSAGES', payload: savedConversation.messages });
            dispatch({ type: 'SET_SHOW_SUGGESTIONS', payload: false });
            
            // Check if this conversation has user messages
            const hasUserMessages = savedConversation.messages.some(msg => msg.type === 'user');
            setHasUserInteracted(hasUserMessages);
            
            // Save this conversation ID to AsyncStorage
            await AsyncStorage.setItem('currentConversationId', routeConversationId);
            
            console.log(`Loaded conversation with ${savedConversation.messages.length} messages`);
          } else if (savedConversation && Array.isArray(savedConversation)) {
            dispatch({ type: 'SET_CONVERSATION_ID', payload: routeConversationId });
            dispatch({ type: 'SET_MESSAGES', payload: savedConversation });
            dispatch({ type: 'SET_SHOW_SUGGESTIONS', payload: false });
            
            // Check if this conversation has user messages
            const hasUserMessages = savedConversation.some(msg => msg.type === 'user');
            setHasUserInteracted(hasUserMessages);
            
            // Save this conversation ID to AsyncStorage
            await AsyncStorage.setItem('currentConversationId', routeConversationId);
            
            console.log(`Loaded conversation with ${savedConversation.length} messages`);
          } else {
            console.error('Invalid conversation format:', savedConversation);
            await createNewConversation();
          }
        } catch (error) {
          console.error('Error loading conversation from route:', error);
          await createNewConversation();
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
        
        const fallbackMessage = {
          id: Date.now().toString(),
          text: `${getRandomIntroMessage()}`,
          type: 'ai',
          timestamp: new Date().toISOString(),
          centered: true // Mark this message for centered text
        };
        
        dispatch({ type: 'SET_MESSAGES', payload: [fallbackMessage] });
        console.log('Using fallback message');
      } finally {
        dispatch({ type: 'SET_INITIALIZING', payload: false });
      }
    };
    
    initializeConversation();
  }, [routeConversationId]);
  
  // Create a new conversation
  const createNewConversation = async () => {
    // First, dismiss the keyboard
    Keyboard.dismiss();
    
    // Reset user interaction flag
    setHasUserInteracted(false);
    
    // Reset conversation size warning flag
    setConversationSizeWarningShown(false);
    
    if (resetGoalSession) {
      resetGoalSession();
    }
    
    // Reset goal tracking
    lastCreatedGoalRef.current = {
      id: null,
      title: null,
      domain: null,
      color: null
    };
    
    // Clear the assistant's thread
    try {
      await assistantService.initialize();
      await assistantService.clearThread();
      console.log('Assistant thread cleared for new conversation');
    } catch (error) {
      console.error('Error clearing assistant thread:', error);
    }
    
    // Get AI model settings for welcome message
    const modelSettings = AIService.getModelSettings(aiModelTier);
    
    // UPDATED: Use ONLY the dynamic intro message without the greeting and with centered text
    const initialMessage = {
      id: Date.now().toString(),
      text: `${getRandomIntroMessage()}`,
      type: 'ai',
      timestamp: new Date().toISOString(),
      centered: true // Mark this message for centered text
    };
    
    dispatch({ type: 'SET_MESSAGES', payload: [initialMessage] });
    
    try {
      console.log('Creating conversation in backend or locally');
      console.log('AI model tier:', aiModelTier);
      console.log('User knowledge enabled:', userKnowledgeEnabled);
      console.log('User documents count:', userDocuments.length);
      
      // NEW: Pre-fetch document context for the new conversation
      let documentContext = null;
      if (userKnowledgeEnabled && userDocuments.length > 0) {
        try {
          console.log('Pre-fetching document context for new conversation');
          documentContext = await DocumentService.getDocumentContextForAI();
          console.log('Document context size:', documentContext ? documentContext.length : 0, 'characters');
        } catch (error) {
          console.error('Error getting document context:', error);
        }
      }
      
      // Store document context in assistantService for use with the first message
      if (documentContext) {
        try {
          await assistantService.setDocumentContext(documentContext);
          console.log('Document context saved to assistant service');
        } catch (error) {
          console.error('Error storing document context:', error);
        }
      }
      
      const newConversation = await AIService.createConversation([initialMessage]);
      if (newConversation && newConversation._id) {
        console.log('Conversation created with ID:', newConversation._id);
        
        dispatch({ type: 'SET_CONVERSATION_ID', payload: newConversation._id });
        dispatch({ type: 'SET_SHOW_SUGGESTIONS', payload: true });
        
        // Mark this as a temporary conversation until user interacts
        await AsyncStorage.setItem(TEMP_CONVERSATION_KEY, newConversation._id);
        
        // Reset the first message flag for this conversation
        await AsyncStorage.removeItem(FIRST_MESSAGE_SENT_KEY + newConversation._id);
        
        // CRITICAL: Also save to AsyncStorage for persistence
        AsyncStorage.setItem('currentConversationId', newConversation._id)
          .then(() => {
            console.log('Saved conversation ID to AsyncStorage');
          })
          .catch(error => {
            console.error('Error saving conversation ID:', error);
          });
      } else {
        throw new Error('Invalid conversation response');
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
      const fallbackId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      dispatch({ type: 'SET_CONVERSATION_ID', payload: fallbackId });
      console.log('Using fallback conversation ID:', fallbackId);
      
      // Mark this as a temporary conversation until user interacts
      await AsyncStorage.setItem(TEMP_CONVERSATION_KEY, fallbackId);
      
      // Reset the first message flag for this conversation
      await AsyncStorage.removeItem(FIRST_MESSAGE_SENT_KEY + fallbackId);
      
      // Save even the fallback ID
      AsyncStorage.setItem('currentConversationId', fallbackId)
        .catch(error => {
          console.error('Error saving fallback conversation ID:', error);
        });
    }
    
    dispatch({ type: 'SET_MENU_STATE', payload: 'closing' });
  };

  // Handle truncating conversation
  const handleTruncateConversation = async () => {
    if (!conversationId || !messages || messages.length === 0) {
      setConversationLimitModalVisible(false);
      return;
    }
    
    try {
      // Keep the most recent messages
      const success = await AIService.truncateConversation(conversationId, messages, MAX_MESSAGES_TO_KEEP);
      
      if (success) {
        // Update the state with truncated messages
        const truncatedMessages = messages.slice(-MAX_MESSAGES_TO_KEEP);
        dispatch({ type: 'SET_MESSAGES', payload: truncatedMessages });
        
        // Show toast notification
        dispatch({ 
          type: 'SHOW_TOAST', 
          payload: 'Conversation has been trimmed to improve performance.' 
        });
        
        // Reset warning state
        setConversationSizeWarningShown(false);
      } else {
        // Show error toast
        dispatch({ 
          type: 'SHOW_TOAST', 
          payload: 'Failed to trim conversation. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error truncating conversation:', error);
      
      // Show error toast
      dispatch({ 
        type: 'SHOW_TOAST', 
        payload: 'An error occurred while trimming the conversation.' 
      });
    }
    
    // Close the modal
    setConversationLimitModalVisible(false);
  };
  
  // Process actions
  const processActions = (actions) => {
    if (!actions || !Array.isArray(actions) || actions.length === 0) return;
    
    console.log(`Processing ${actions.length} actions`);
    console.log('Actions to process:', JSON.stringify(actions, null, 2));
    
    // Set up for multiple actions
    setPendingActions(actions);
    setTotalActions(actions.length);
    setActionProgress(0);
    
    // Process the first action
    processNextAction(actions, 0);
  };
  
  // Process the next action in the queue
  const processNextAction = (actions, currentIndex) => {
    if (currentIndex >= actions.length) {
      console.log('All actions processed successfully');
      setPendingActions([]);
      return;
    }
    
    const action = actions[currentIndex];
    setActionProgress(currentIndex);
    
    console.log(`Processing action ${currentIndex + 1}/${actions.length}: ${action.type}`);
    console.log('Full action object:', JSON.stringify(action, null, 2));
    
    // Handle each action type
    switch (action.type) {
      case 'createGoal':
        console.log('Creating goal modal');
        
        // Check if user can add more goals before showing the goal modal
        if (!canAddMoreGoals()) {
          console.log('Goal limit reached, showing upgrade modal');
          showUpgradePrompt(
            `You've reached the limit of ${LOCAL_MAX_GOALS} active goals in the free version. Upgrade to Pro to track unlimited goals.`
          );
          return;
        }
        
        // If user can add more goals, show the goal modal
        setCurrentGoalData(action.data);
        setGoalModalVisible(true);
        break;
        
      case 'createProject':
        console.log('Creating project modal');
        // Link project to last created goal if available
        if (lastCreatedGoalRef.current.id && action.data.goalTitle) {
          action.data.goalId = lastCreatedGoalRef.current.id;
        }
        setCurrentProjectData(action.data);
        setProjectModalVisible(true);
        break;
        
      case 'createTask':
        console.log('Creating task modal with data:', JSON.stringify(action.data));
        // Simply set the task data and show the modal
        // Let the user pick the correct project in the modal
        setCurrentTaskData(action.data);
        setTaskModalVisible(true);
        break;
        
      case 'createTimeBlock':
        console.log('Creating time block modal');
        setCurrentTimeBlockData(action.data);
        setTimeBlockModalVisible(true);
        break;
        
      case 'createTodo':
      case 'createTodoGroup':
        console.log('Creating todo modal');
        console.log('Action type:', action.type);
        console.log('Action data:', JSON.stringify(action.data, null, 2));
        // Handle both todo types
        const todoData = {
          ...action.data,
          // Ensure isGroup is set for createTodoGroup actions
          isGroup: action.type === 'createTodoGroup'
        };
        console.log('Final todoData:', JSON.stringify(todoData, null, 2));
        console.log('Todo items structure:', todoData.items);
        if (todoData.items && Array.isArray(todoData.items)) {
          console.log('First item:', todoData.items[0]);
          console.log('Items length:', todoData.items.length);
        }
        setCurrentTodoData(todoData);
        setTodoModalVisible(true);
        console.log('Todo modal should now be visible');
        break;
        
      case 'updateLifeDirection':
      case 'updateStrategicDirection':
        console.log('Processing strategic direction update:', action.data);
        setCurrentLifeDirection(action.data);
        setLifeDirectionModalVisible(true);
        break;
        
      default:
        console.log(`Unknown action type: ${action.type}`);
        console.log('Available action types are: createGoal, createProject, createTask, createTimeBlock, createTodo, createTodoGroup, updateLifeDirection, updateStrategicDirection');
        // Skip to next action
        processNextAction(actions, currentIndex + 1);
    }
  };
  
  // Check if this is the first message in a conversation
  const isFirstMessage = async (conversationId) => {
    if (!conversationId) return true;
    
    try {
      // Check if we've already sent the first message for this conversation
      const firstMessageSent = await AsyncStorage.getItem(FIRST_MESSAGE_SENT_KEY + conversationId);
      return firstMessageSent !== 'true';
    } catch (error) {
      console.error('Error checking if first message:', error);
      return true; // Assume it's the first message if we can't check
    }
  };
  
  // Mark that the first message has been sent for this conversation
  const markFirstMessageSent = async (conversationId) => {
    if (!conversationId) return;
    
    try {
      await AsyncStorage.setItem(FIRST_MESSAGE_SENT_KEY + conversationId, 'true');
      console.log('Marked first message as sent for conversation:', conversationId);
    } catch (error) {
      console.error('Error marking first message as sent:', error);
    }
  };
  
  // Handle sending a message with real-time streaming
  const handleSendMessage = async (text) => {
    if (!text || !text.trim() || isLoading) return;
    
    // Mark that user has interacted with this conversation
    setHasUserInteracted(true);
    
    // Get tier-specific character limits
    const characterLimit = AIService.getCharacterLimit(aiModelTier);
    const warningThreshold = AIService.getWarningThreshold(aiModelTier);
    
    // Calculate current conversation size
    const currentSize = AIService.calculateConversationSize(messages);
    const newMessageSize = text.trim().length;
    const totalSize = currentSize + newMessageSize;
    
    console.log(`Current conversation size: ${currentSize}/${characterLimit} characters (${aiModelTier} tier)`);
    console.log(`New message size: ${newMessageSize} characters`);
    console.log(`Total size would be: ${totalSize}/${characterLimit} characters`);
    
    // Check if conversation with this message would exceed the maximum limit
    if (totalSize > characterLimit) {
      console.log('Adding this message would exceed the character limit');
      
      // Show the conversation limit modal
      setConversationLimitModalVisible(true);
      return;
    }
    
    // Check if conversation is approaching warning threshold
    if (currentSize >= warningThreshold && !conversationSizeWarningShown) {
      console.log('Conversation approaching size limit, size warning will be shown in UI');
      
      // Set flag to show warning in UI
      setConversationSizeWarningShown(true);
    }
    
    // If this was a temporary conversation, mark it as permanent now
    if (conversationId) {
      const tempId = await AsyncStorage.getItem(TEMP_CONVERSATION_KEY);
      if (tempId && tempId === conversationId) {
        console.log('Converting temporary conversation to permanent:', tempId);
        await AsyncStorage.removeItem(TEMP_CONVERSATION_KEY);
      }
    }
    
    const userMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      type: 'user',
      timestamp: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_LOADING', payload: true });

    // Track achievement for AI conversation
    try {
      await FeatureExplorerTracker.trackAIConversation(
        {
          conversationId,
          text: userMessage.text
        }, 
        showSuccess
      );
    } catch (error) {
      console.error('Error tracking AI conversation achievement:', error);
    }

    try {
      if (!conversationId) {
        // If no conversation ID, create a new one first
        console.log('No conversation ID, creating a new conversation first');
        await createNewConversation();
        
        // Get the new conversation ID
        const newConversationId = state.conversation.conversationId;
        if (!newConversationId) {
          throw new Error('Failed to create a new conversation');
        }
        
        // This is no longer a temporary conversation
        await AsyncStorage.removeItem(TEMP_CONVERSATION_KEY);
        
        // Now we have a conversation ID, try to add the message
        try {
          console.log(`Adding user message to new conversation ${newConversationId}`);
          await AIService.addMessageToConversation(newConversationId, userMessage.text, 'user');
        } catch (error) {
          console.error('Error saving user message to new conversation:', error);
        }
      } else {
        try {
          console.log(`Adding user message to conversation ${conversationId}`);
          await AIService.addMessageToConversation(conversationId, userMessage.text, 'user');
        } catch (error) {
          console.error('Error saving user message:', error);
          
          // If conversation not found, create a new one
          if (error.message && error.message.includes('Conversation not found')) {
            console.log('Conversation not found, creating a new one');
            await createNewConversation();
            
            // This is no longer a temporary conversation
            await AsyncStorage.removeItem(TEMP_CONVERSATION_KEY);
            
            // Try again with the new conversation
            const newConversationId = state.conversation.conversationId;
            if (newConversationId) {
              try {
                console.log(`Adding user message to new conversation ${newConversationId}`);
                await AIService.addMessageToConversation(newConversationId, userMessage.text, 'user');
              } catch (retryError) {
                console.error('Error saving user message on retry:', retryError);
              }
            }
          }
        }
      }
      
      // Check if this is the first message in the conversation
      const firstMessage = await isFirstMessage(conversationId);
      
      // If it's the first message, mark it as sent
      if (firstMessage) {
        await markFirstMessageSent(conversationId);
        console.log('This is the first message in conversation:', conversationId);
      }
      
      console.log('Generating AI response with tier:', aiModelTier);
      console.log('User knowledge enabled:', userKnowledgeEnabled);
      console.log('User documents count:', userDocuments.length);
      console.log('Is first message:', firstMessage);
      
      // For the first message, get document context
      let documentContext = null;
      if (firstMessage && userKnowledgeEnabled) {
        try {
          console.log('Getting document context for first message');
          
          // First try to get from assistant service
          documentContext = await assistantService.getDocumentContext();
          
          // If not available, fetch it directly
          if (!documentContext) {
            console.log('No stored context, fetching directly');
            documentContext = await DocumentService.getDocumentContextForAI();
          }
          
          console.log('Document context size:', documentContext ? documentContext.length : 0, 'characters');
          
          // Clear from assistant service after using
          if (documentContext) {
            await assistantService.clearDocumentContext();
          }
        } catch (error) {
          console.error('Error getting document context:', error);
        }
      }
      
      // Create initial empty AI message with streaming flag
      const aiMessageId = (Date.now() + 1).toString();
      const initialAiMessage = {
        id: aiMessageId,
        text: '',
        type: 'ai',
        timestamp: new Date().toISOString(),
        streaming: true // Mark as streaming
      };
      
      // Add the initial empty message
      dispatch({ type: 'ADD_MESSAGE', payload: initialAiMessage });
      
      // Use the new service approach with the Assistant API and streaming
      await AIService.generateAIResponse(
        userMessage.text, 
        messages, 
        aiModelTier,
        [],
        {
          enabled: userKnowledgeEnabled,
          files: userDocuments || [],
          firstMessage: firstMessage,
          documentContext: documentContext,
          isFirstMessage: firstMessage,
          conversationId: conversationId
        },
        {
          onChunk: (chunk) => {
            // Update the message with the new chunk
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: {
                id: aiMessageId,
                text: chunk,
                streaming: true
              }
            });
          },
          onComplete: async (finalText, actions, title) => {
            // Update the message with the final content and remove streaming flag
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: {
                id: aiMessageId,
                text: finalText,
                streaming: false
              }
            });
            
            // Check if we received a title from the AI response for the first message
            if (title && firstMessage) {
              console.log(`Received conversation title from AI: "${title}"`);
              
              try {
                // Update the conversation with the title
                await AIService.updateConversation(conversationId, {
                  title: title
                });
                
                console.log(`Saved title "${title}" to conversation ${conversationId}`);
              } catch (error) {
                console.error('Error saving conversation title:', error);
              }
            }
            
            if (conversationId) {
              try {
                console.log(`Adding AI message to conversation ${conversationId}`);
                await AIService.addMessageToConversation(conversationId, finalText, 'ai');
              } catch (error) {
                console.error('Error saving AI message:', error);
                
                // If conversation not found, create a new one and add both messages
                if (error.message && error.message.includes('Conversation not found')) {
                  console.log('Conversation not found when saving AI message, creating a new one');
                  await createNewConversation();
                  
                  // This is no longer a temporary conversation
                  await AsyncStorage.removeItem(TEMP_CONVERSATION_KEY);
                  
                  // Try again with the new conversation
                  const newConversationId = state.conversation.conversationId;
                  if (newConversationId) {
                    try {
                      // Add both messages to the new conversation
                      await AIService.addMessageToConversation(newConversationId, userMessage.text, 'user');
                      await AIService.addMessageToConversation(newConversationId, finalText, 'ai');
                    } catch (retryError) {
                      console.error('Error saving messages on retry:', retryError);
                    }
                  }
                }
              }
            }
            
            // Process actions if any
            if (actions && Array.isArray(actions) && actions.length > 0) {
              console.log(`Found ${actions.length} actions to perform`);
              
              // First check for goal actions
              const goalAction = actions.find(action => action.type === 'createGoal');
              if (goalAction) {
                console.log('Found goal action');
                
                // Check if user can add more goals before processing the goal action
                if (!canAddMoreGoals()) {
                  console.log('Goal limit reached, showing upgrade modal');
                  showUpgradePrompt(
                    `You've reached the limit of ${LOCAL_MAX_GOALS} active goals in the free version. Upgrade to Pro to track unlimited goals.`
                  );
                  
                  // Process any remaining non-goal actions
                  const otherActions = actions.filter(action => action.type !== 'createGoal');
                  if (otherActions.length > 0) {
                    console.log(`Processing ${otherActions.length} remaining non-goal actions`);
                    processActions(otherActions);
                  }
                } else {
                  // User can add more goals, proceed with goal action
                  setCurrentGoalData(goalAction.data);
                  setGoalModalVisible(true);
                  
                  // Process any remaining non-goal actions
                  const otherActions = actions.filter(action => action.type !== 'createGoal');
                  if (otherActions.length > 0) {
                    console.log(`Processing ${otherActions.length} remaining non-goal actions`);
                    processActions(otherActions);
                  }
                }
              } else {
                // No goal actions, process all actions normally
                console.log('No goal actions found, processing all actions normally');
                processActions(actions);
              }
            }
            
            dispatch({ type: 'SET_SHOW_SUGGESTIONS', payload: false });
            
            // Record token usage after message completion for non-unlimited mode
            if (!isUnlimitedMode) {
              try {
                // Get current user's email
                let userEmail;
                try {
                  const user = await Auth.currentAuthenticatedUser();
                  userEmail = user.attributes.email;
                } catch (error) {
                  console.error('Error getting current user for token tracking:', error);
                  userEmail = 'test@example.com'; // Fallback for testing
                }
                
                // Estimate token counts (this would be more accurate from a real API response)
                const inputTokens = Math.round(userMessage.text.length / 4); // Rough estimate
                const outputTokens = Math.round(finalText.length / 4); // Rough estimate
                
                // Call your API to track credit usage
                const response = await fetch(`${API_ENDPOINT}/credits/usage`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userId: userEmail,
                    inputTokens,
                    outputTokens,
                    operation: 'deduct'
                  })
                });
                
                if (response.ok) {
                  const result = await response.json();
                  console.log('Credit usage tracked:', result);
                  
                  // Refresh credit data after usage
                  refreshCreditData();
                }
              } catch (error) {
                console.error('Error tracking token usage:', error);
              }
            }
          },
          onError: (error) => {
            console.error('Error getting AI response:', error);
            
            // Update the message with an error
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: {
                id: aiMessageId,
                text: "I'm sorry, I encountered an error while processing your request. Please try again in a moment.",
                streaming: false
              }
            });
          }
        }
      );
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error while processing your request. Please try again in a moment.",
        type: 'ai',
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
  // REMOVED: handleSelectAIModelTier function
  
  // Menu actions
  const openMenu = () => {
    // Dismiss keyboard when opening menu
    Keyboard.dismiss();
    dispatch({ type: 'SET_MENU_STATE', payload: 'opening' });
  };
  
  const closeMenu = () => {
    dispatch({ type: 'SET_MENU_STATE', payload: 'closing' });
  };

  
  // Clear chat history
  const handleClearChat = () => {
    // Dismiss keyboard first
    Keyboard.dismiss();
    createNewConversation();
  };
  
  // REMOVED: handleShowModelSelector function
  
  // Handle Goal creation
  const handleGoalConfirm = async (goalData) => {
    setGoalModalVisible(false);
    
    try {
      const { addGoal } = appContext; // Get from app context
      
      if (typeof addGoal === 'function') {
        const newGoal = {
          ...goalData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await addGoal(newGoal);
        
        // Track AI-generated goal achievement
        try {
          await FeatureExplorerTracker.trackAIGenerated(newGoal, 'goal', showSuccess);
        } catch (error) {
          console.error('Error tracking AI-generated goal achievement:', error);
        }
          
        // Track the created goal
        lastCreatedGoalRef.current = {
          id: newGoal.id,
          title: newGoal.title,
          domain: newGoal.domain,
          color: newGoal.color
        };
        
        console.log(`Created goal: "${newGoal.title}" with ID: ${newGoal.id}`);
        
        const successMessage = {
          id: (Date.now() + 1).toString(),
          text: `Goal "${newGoal.title}" created successfully! You can view and edit it in the Goals tab.`,
          type: 'ai',
          timestamp: new Date().toISOString()
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: successMessage });
        
        // Process next action if any
        if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
          setTimeout(() => {
            processNextAction(pendingActions, actionProgress + 1);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I couldn't create the goal: ${error.message}`,
        type: 'ai',
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    }
  };
  
  // Handle Project creation
  const handleProjectConfirm = async (projectData) => {
    setProjectModalVisible(false);
    
    try {
      const { addProject } = appContext; // Get from app context
      
      if (typeof addProject === 'function') {
        const newProject = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await addProject(newProject);
        
        // Track AI-generated project achievement
        try {
          await FeatureExplorerTracker.trackAIGenerated(newProject, 'project', showSuccess);
        } catch (error) {
          console.error('Error tracking AI-generated project achievement:', error);
        }
          
        console.log(`Created project: "${newProject.title}"`);
        
        const successMessage = {
          id: (Date.now() + 1).toString(),
          text: `Project "${newProject.title}" created successfully!`,
          type: 'ai',
          timestamp: new Date().toISOString()
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: successMessage });
        
        // Process next action if any
        if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
          setTimeout(() => {
            processNextAction(pendingActions, actionProgress + 1);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error creating project:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I couldn't create the project: ${error.message}`,
        type: 'ai',
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    }
  };
  
  // Handle Task creation
  const handleTaskConfirm = async (taskData) => {
    setTaskModalVisible(false);
    
    try {
      const { updateProject, projects } = appContext; // Get from app context
      
      // Check if we have a project to add the task to
      if (taskData.projectId || taskData.projectTitle) {
        // Find the project
        const project = projects.find(p => 
          p.id === taskData.projectId || 
          p.title === taskData.projectTitle
        );
        
        if (project && typeof updateProject === 'function') {
          // Create the new task
          const newTask = {
            id: Date.now().toString(),
            title: taskData.title,
            description: taskData.description || '',
            status: taskData.status || 'todo',
            completed: taskData.completed || false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Update the project with the new task
          const updatedProject = {
            ...project,
            tasks: [...(project.tasks || []), newTask],
            updatedAt: new Date().toISOString()
          };
          
          await updateProject(updatedProject);
          
          console.log(`Created task: "${newTask.title}" in project: "${project.title}"`);
          
          const successMessage = {
            id: (Date.now() + 1).toString(),
            text: `Task "${newTask.title}" added to project "${project.title}" successfully!`,
            type: 'ai',
            timestamp: new Date().toISOString()
          };
          
          dispatch({ type: 'ADD_MESSAGE', payload: successMessage });
        } else if (!project) {
          throw new Error(`Project "${taskData.projectTitle || taskData.projectId}" not found`);
        } else {
          throw new Error('updateProject function not available');
        }
      } else {
        // No project specified
        throw new Error('No project selected. Tasks must belong to a project.');
      }
      
      // Process next action if any
      if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
        setTimeout(() => {
          processNextAction(pendingActions, actionProgress + 1);
        }, 500);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I couldn't create the task: ${error.message}`,
        type: 'ai',
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    }
  };
  
  // Handle TimeBlock creation
  const handleTimeBlockConfirm = async (timeBlockData) => {
    setTimeBlockModalVisible(false);
    
    try {
      const { addTimeBlock } = appContext; // Get from app context
      
      if (typeof addTimeBlock === 'function') {
        const newTimeBlock = {
          ...timeBlockData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        await addTimeBlock(newTimeBlock);
        
        console.log(`Created time block: "${newTimeBlock.title}"`);
        
        const successMessage = {
          id: (Date.now() + 1).toString(),
          text: `Time block "${newTimeBlock.title}" scheduled successfully!`,
          type: 'ai',
          timestamp: new Date().toISOString()
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: successMessage });
        
        // Process next action if any
        if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
          setTimeout(() => {
            processNextAction(pendingActions, actionProgress + 1);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error creating time block:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I couldn't create the time block: ${error.message}`,
        type: 'ai',
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    }
  };
  
  // Handle Todo creation
  const handleTodoConfirm = async (todoData) => {
    setTodoModalVisible(false);
    
    try {
      const { addTodo, updateTodos, todos, tomorrowTodos, laterTodos } = appContext;
      
      // Create the new todo
      const newTodo = {
        ...todoData,
        id: todoData.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Determine which tab this todo belongs to
      const tab = todoData.tab || 'today';
      
      if (typeof addTodo === 'function') {
        // If addTodo exists, use it
        await addTodo(newTodo);
        
        console.log(`Created todo: "${newTodo.title}" in ${tab} tab`);
        
        const successMessage = {
          id: (Date.now() + 1).toString(),
          text: `To-do "${newTodo.title}" added to your ${tab.charAt(0).toUpperCase() + tab.slice(1)} list!`,
          type: 'ai',
          timestamp: new Date().toISOString()
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: successMessage });
      } else if (typeof updateTodos === 'function') {
        // Alternative: If updateTodos exists, use it to update the appropriate list
        let updatedList;
        
        switch (tab) {
          case 'today':
            updatedList = [...(todos || []), newTodo];
            await updateTodos(updatedList);
            break;
            
          case 'tomorrow':
            updatedList = [...(tomorrowTodos || []), newTodo];
            await updateTodos(updatedList, 'tomorrow');
            break;
            
          case 'later':
            updatedList = [...(laterTodos || []), newTodo];
            await updateTodos(updatedList, 'later');
            break;
            
          default:
            throw new Error(`Invalid tab: ${tab}`);
        }
        
        console.log(`Created todo: "${newTodo.title}" in ${tab} tab`);
        
        const successMessage = {
          id: (Date.now() + 1).toString(),
          text: `To-do "${newTodo.title}" added to your ${tab.charAt(0).toUpperCase() + tab.slice(1)} list!`,
          type: 'ai',
          timestamp: new Date().toISOString()
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: successMessage });
      } else {
        // Log what's available in appContext for debugging
        console.log('Available appContext methods:', Object.keys(appContext).filter(key => typeof appContext[key] === 'function'));
        throw new Error('No method available to add todos. Check AppContext implementation.');
      }
      
      // Process next action if any
      if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
        setTimeout(() => {
          processNextAction(pendingActions, actionProgress + 1);
        }, 500);
      }
    } catch (error) {
      console.error('Error creating todo:', error);
      console.error('Todo data was:', todoData);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I couldn't create the to-do: ${error.message}`,
        type: 'ai',
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    }
  };
  
  // Handle Life Direction update
  const handleLifeDirectionConfirm = async (newLifeDirection) => {
    console.log('handleLifeDirectionConfirm called with:', newLifeDirection);
    setLifeDirectionModalVisible(false);
    
    try {
      const { updateAppSetting, goals, projects, tasks, settings } = appContext;
      
      if (typeof updateAppSetting === 'function') {
        // Update in app context
        await updateAppSetting('lifeDirection', newLifeDirection);
        
        console.log(`Updated life direction to: "${newLifeDirection}"`);
        
        // Update app summary to reflect the new life direction in AI context
        try {
          const AppSummaryService = await import('../services/AppSummaryService');
          const DocumentService = await import('../services/DocumentService');
          
          // Generate new app summary with updated life direction
          const appData = {
            goals: goals || [],
            projects: projects || [],
            tasks: tasks || [],
            settings: {
              ...settings,
              lifeDirection: newLifeDirection
            }
          };
          
          const summary = AppSummaryService.default.generateAppSummary(appData);
          await DocumentService.default.updateAppContextDocument(summary);
          
          console.log('App summary updated with new Strategic Direction from AI');
        } catch (error) {
          console.error('Error updating app summary after Strategic Direction change:', error);
          // Don't fail the main operation if summary update fails
        }
        
        const successMessage = {
          id: (Date.now() + 1).toString(),
          text: `Your life direction has been updated successfully! This will help guide your goals and decisions moving forward.`,
          type: 'ai',
          timestamp: new Date().toISOString()
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: successMessage });
        
        // Navigate to Profile screen with focusLifeDirection flag
        if (navigation) {
          console.log('Navigating to Profile screen with focusLifeDirection flag');
          navigation.navigate('Profile', { focusLifeDirection: true });
        }
      } else {
        throw new Error('updateAppSetting function not available');
      }
      
      // Process next action if any
      if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
        setTimeout(() => {
          processNextAction(pendingActions, actionProgress + 1);
        }, 500);
      }
    } catch (error) {
      console.error('Error updating life direction:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I couldn't update your life direction: ${error.message}`,
        type: 'ai',
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    }
  };
  
  // Handle modal cancellations
  const handleGoalModalCancel = () => {
    console.log('Goal modal cancelled');
    setGoalModalVisible(false);
    setPendingActions([]);
  };
  
  const handleProjectModalCancel = () => {
    console.log('Project modal cancelled');
    setProjectModalVisible(false);
    setPendingActions([]);
  };
  
  const handleTaskModalCancel = () => {
    console.log('Task modal cancelled');
    setTaskModalVisible(false);
    setPendingActions([]);
  };
  
  const handleTimeBlockModalCancel = () => {
    console.log('Time block modal cancelled');
    setTimeBlockModalVisible(false);
    setPendingActions([]);
  };
  
  const handleTodoModalCancel = () => {
    console.log('Todo modal cancelled');
    setTodoModalVisible(false);
    setPendingActions([]);
  };
  
  const handleLifeDirectionModalCancel = () => {
    console.log('Life direction modal cancelled');
    setLifeDirectionModalVisible(false);
    setPendingActions([]);
  };
  
  // Calculate control position adjustments for safe areas and Dynamic Island
  const getControlTopPosition = () => {
    if (safeSpacing.hasDynamicIsland) {
      return Platform.OS === 'ios' ? scaleHeight(65) : scaleHeight(30);
    } else {
      return Platform.OS === 'ios' ? scaleHeight(55) : scaleHeight(25);
    }
  };
  
  // Determine button size based on device
  const getButtonSize = () => {
    return isTablet ? scaleWidth(44) : isSmallDevice ? scaleWidth(36) : scaleWidth(38);
  };
  
  // Get icon size based on device
  const getIconSize = () => {
    return isTablet ? scaleWidth(24) : scaleWidth(22);
  };
  
  return (
    <SafeAreaView 
      style={styles.container}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel="AI Assistant screen"
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Toast Notification */}
      <AIToast 
        visible={toastVisible}
        message={toastMessage} 
        onHide={() => dispatch({ type: 'HIDE_TOAST' })}
      />
      
      {/* Main Chat */}
      <AIChat
        messages={messages}
        isLoading={isLoading}
        showSuggestions={showSuggestions}
        onSendMessage={handleSendMessage}
        onSuggestionPress={(suggestion) => suggestion?.text ? handleSendMessage(suggestion.text) : null}
        onNewConversation={createNewConversation}
        style={aiModelTier}
        conversationId={conversationId}
        warningThreshold={AIService.getWarningThreshold(aiModelTier)}
        maxThreshold={AIService.getCharacterLimit(aiModelTier)}
        aiTier={aiModelTier}
      />
      
      {/* User Knowledge Indicator */}
      {userKnowledgeEnabled && userDocuments && userDocuments.length > 0 && (
        <AIStatusIndicators.KnowledgeIndicator 
          count={userDocuments.length} 
        />
      )}
      
      {/* Credits Indicator */}
      <View style={{
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30, // Fixed position
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 50, // Very low zIndex so system popups appear above everything
        elevation: 50, // Android elevation to match zIndex
      }}>
        <AIStatusIndicators.CreditsIndicator
          credits={{
            baseCredits: baseCredits,
            rolledOverCredits: rolledOverCredits,
            creditsUsed: creditsUsed,
            nextRefreshDate: nextRefreshDate
          }}
          onPress={() => {
            console.log('Opening credit detail modal');
            setCreditDetailVisible(true);
          }}
        />
      </View>
      
      {/* Progress Indicator - if processing multiple actions */}
      {pendingActions.length > 1 && (
        <AIStatusIndicators.ProgressIndicator 
          currentAction={actionProgress} 
          totalActions={totalActions} 
        />
      )}
      
      {/* Floating Navigation Controls */}
      <View 
        style={[
          styles.floatingControlsContainer,
          {
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.m,
            top: getControlTopPosition()
          }
        ]}
        accessible={true}
        accessibilityRole="toolbar"
        accessibilityLabel="Navigation controls"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={[
            styles.iconBubble,
            {
              width: getButtonSize(),
              height: getButtonSize(),
              borderRadius: getButtonSize() / 2
            }
          ]}
          onPress={() => {
            // Dismiss keyboard before navigating back
            Keyboard.dismiss();
            // Safely navigate back if navigation is available
            if (navigation) {
              navigation.goBack();
            }
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
        >
          <Ionicons name="arrow-back" size={getIconSize()} color="#FFFFFF" />
        </TouchableOpacity>
        
        {/* Model Selector Button REMOVED */}
        
        {/* Spacer View to maintain layout */}
        <View style={{ flex: 1 }} />
        
        {/* NEW: Unlimited Usage Button (Development Only) */}
        {__DEV__ && (
          <TouchableOpacity
            style={[
              styles.debugButton,
              { 
                backgroundColor: isUnlimitedMode ? '#4CAF50' : '#FF9800',
                width: getButtonSize(),
                height: getButtonSize(),
                borderRadius: getButtonSize() / 2,
                marginRight: spacing.s
              }
            ]}
            onPress={handleUnlimitedUsagePress}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isUnlimitedMode ? "Disable unlimited usage" : "Enable unlimited usage"}
            accessibilityHint="Developer tool to toggle unlimited AI usage"
          >
            <Ionicons 
              name={isUnlimitedMode ? "infinite" : "speedometer"} 
              size={scaleWidth(18)} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        )}
        
        {/* Menu Button */}
        <TouchableOpacity
          style={[
            styles.iconBubble,
            {
              width: getButtonSize(),
              height: getButtonSize(),
              borderRadius: getButtonSize() / 2
            }
          ]}
          onPress={openMenu}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          accessibilityHint="Opens the assistant menu with additional options"
        >
          <Ionicons name="menu" size={getIconSize()} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Side Menu */}
      <AISideMenu
        visible={menuState !== 'closed'}
        menuState={menuState}
        onClose={closeMenu}
        onNewConversation={createNewConversation}
        onGoToConversations={() => {
          if (navigation) {
            navigation.navigate('Conversations');
          }
        }}
        onGoToPersonalKnowledge={() => {
          if (navigation) {
            navigation.navigate('PersonalKnowledgeScreen');
          }
        }}
        aiModelTier={aiModelTier}
        userDocuments={userDocuments}
        userKnowledgeEnabled={userKnowledgeEnabled}
        subscriptionStatus={subscriptionStatus}
        navigation={navigation}
      />
      
      {/* Action Modals */}
      <AddGoalModal
        visible={goalModalVisible}
        onClose={handleGoalModalCancel}
        onAdd={handleGoalConfirm}
        goalData={currentGoalData}
        color={theme.primary}
      />
      
      <AddProjectModal
        visible={projectModalVisible}
        onClose={handleProjectModalCancel}
        onAdd={handleProjectConfirm}
        projectData={currentProjectData}
        color={theme.primary}
      />
      
      <AddTaskModal
        visible={taskModalVisible}
        onClose={handleTaskModalCancel}
        onAdd={handleTaskConfirm}
        task={currentTaskData}
        color={theme.primary}
      />
      
      <AddTimeBlockModal
        visible={timeBlockModalVisible}
        onClose={handleTimeBlockModalCancel}
        onAdd={handleTimeBlockConfirm}
        timeBlockData={currentTimeBlockData}
        color={theme.primary}
      />
      
      <AddTodoModal
        visible={todoModalVisible}
        onClose={handleTodoModalCancel}
        onAdd={handleTodoConfirm}
        todoData={currentTodoData}
      />
      
      {/* Debug: Log modal visibility */}
      {console.log('DEBUG: todoModalVisible =', todoModalVisible)}
      {console.log('DEBUG: currentTodoData =', currentTodoData)}
      
      <UpdateLifeDirectionModal
        visible={lifeDirectionModalVisible}
        onClose={handleLifeDirectionModalCancel}
        onSave={handleLifeDirectionConfirm}
        currentLifeDirection={currentLifeDirection}
      />
      
      {/* Conversation Limit Modal */}
      <AIConversationLimitModal
        visible={conversationLimitModalVisible}
        onDismiss={() => setConversationLimitModalVisible(false)}
        onNewConversation={() => {
          setConversationLimitModalVisible(false);
          createNewConversation();
        }}
        onTruncateConversation={handleTruncateConversation}
      />
      
      {/* Credit Detail Modal with API integration */}
      <CreditDetailModal
        visible={creditDetailVisible}
        onClose={() => setCreditDetailVisible(false)}
        credits={{
          baseCredits: baseCredits,
          rolledOverCredits: rolledOverCredits,
          creditsUsed: creditsUsed,
          nextRefreshDate: nextRefreshDate
        }}
        onRefresh={refreshCreditData}
      />
      
      {/* Mode Info Modal */}
      <AIModeInfoModal
        visible={modeInfoVisible}
        onClose={() => dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { modal: 'modeInfoVisible', visible: false } })}
        theme={theme}
      />
      
      {/* Upgrade Modal (NEW) */}
      <Modal
        visible={showUpgradeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.upgradeModal, 
            { 
              backgroundColor: theme.card || theme.background,
              marginTop: safeSpacing.top,
              marginBottom: safeSpacing.bottom,
              marginLeft: spacing.m,
              marginRight: spacing.m
            }
          ]}>
            <View style={styles.upgradeModalHeader}>
              <Ionicons name="lock-closed" size={scaleWidth(40)} color="#3F51B5" />
              <Text 
                style={[styles.upgradeModalTitle, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                Premium Feature
              </Text>
            </View>
            
            <Text 
              style={[styles.upgradeModalMessage, { color: theme.text }]}
              maxFontSizeMultiplier={1.3}
            >
              {upgradeMessage || "Upgrade to Pro to track unlimited goals."}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.upgradeButton, 
                { backgroundColor: '#3F51B5' },
                { minHeight: accessibility.minTouchTarget }
              ]}
              onPress={goToPricingScreen}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Upgrade to Pro"
              accessibilityHint="Opens the pricing screen to upgrade your subscription"
            >
              <Ionicons name="rocket" size={scaleWidth(20)} color="#FFFFFF" style={{marginRight: spacing.xs}} />
              <Text 
                style={styles.upgradeButtonText}
                maxFontSizeMultiplier={1.3}
              >
                Upgrade to Pro
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.laterButton,
                { minHeight: accessibility.minTouchTarget }
              ]}
              onPress={() => setShowUpgradeModal(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Maybe Later"
              accessibilityHint="Closes the upgrade prompt"
            >
              <Text 
                style={[styles.laterButtonText, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

/**
 * Main AIAssistantScreen component wrapped in context providers
 * Added ThemeProvider wrapper to ensure useTheme hook works
 */
const AIAssistantScreen = (props) => {
  return (
    <ThemeProvider>
      <AIAssistantProvider>
        <AIAssistantContent {...props} />
      </AIAssistantProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // ChatGPT uses black background
  },
  floatingControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 100, // Ensure controls float above content
    backgroundColor: 'transparent', // Transparent background
  },
  iconBubble: {
    backgroundColor: '#000000', // Pure black
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 0, // No border
  },
  // NEW: Loading container for fallback view
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  // REMOVED: modelSelector styles
  // NEW: Debug button styles
  debugButton: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 0,
  },
  // NEW: Upgrade Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeModal: {
    width: '90%',
    maxWidth: 500,
    borderRadius: scaleWidth(20),
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  upgradeModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  upgradeModalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginTop: spacing.m,
    textAlign: 'center',
  },
  upgradeModalMessage: {
    fontSize: fontSizes.m,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: scaleHeight(24),
    paddingHorizontal: spacing.m,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(16),
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: 'bold',
  },
  laterButton: {
    marginTop: spacing.l,
    padding: spacing.m,
  },
  laterButtonText: {
    fontSize: fontSizes.s,
  }
});

export default AIAssistantScreen;