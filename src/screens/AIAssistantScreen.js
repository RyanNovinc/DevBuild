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
import { useAuth } from '../context/AuthContext';
import { AIAssistantProvider, useAIAssistant } from '../context/AIAssistantContext/index';
import { LAST_CHAT_KEY } from '../context/AIAssistantContext/constants';
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
import AIUsageWarning from '../components/ai/AIUsageWarning';
// REMOVED: AIModelSelector import
import { Ionicons } from '@expo/vector-icons';

// Import modals
import AddGoalModal from '../components/AddGoalModal';
import AddMilestoneModalRevamped from '../components/AddMilestoneModalRevamped'; // Using revamped version
import TimeBlockExactModal from '../components/TimeBlockExactModal';
import AddTaskModal from '../components/AddTaskModal';
import AddTodoModal from '../components/AddTodoModal';
import AIBulkCreateModal from '../components/AIBulkCreateModal';

// Import AI-specific modals
import {
  AIModeInfoModal,
  AIConversationLimitModal
} from '../components/ai/AIModals';

// Import CreditDetailModal
import CreditDetailModal from '../components/ai/AIModals/CreditDetailModal';

// Import API configuration
import { API_BASE_URL } from '../config/apiConfig';

// API endpoint for Lambda functions  
const API_ENDPOINT = API_BASE_URL;

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
  console.log('🎨 AIAssistantScreen theme.primary:', theme.primary);
  const appContext = useAppContext(); // Add app context
  const { user, isAuthenticated } = useAuth(); // Add authentication check
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
  
  // NEW: State for usage warnings
  const [usageWarningType, setUsageWarningType] = useState('none');
  const [usageWarningTime, setUsageWarningTime] = useState('');
  const [dismissedWarnings, setDismissedWarnings] = useState(new Set());
  
  // Initialize token manager and check usage status
  useEffect(() => {
    const initializeTokenManager = async () => {
      try {
        if (isAuthenticated && user) {
          // Get user's subscription tier from appContext
          const userTier = appContext?.userSubscriptionStatus || 'light';
          await AITokenManager.initialize(userTier);
          
          // Check current usage status
          await checkUsageStatus();
        }
      } catch (error) {
        console.error('Error initializing token manager:', error);
      }
    };
    
    initializeTokenManager();
  }, [isAuthenticated, user, appContext?.userSubscriptionStatus]);
  
  // Function to check usage status and update warnings
  const checkUsageStatus = async () => {
    try {
      const rateLimitStatus = await AITokenManager.getRateLimitStatus();
      
      if (!rateLimitStatus) {
        setUsageWarningType('none');
        return;
      }
      
      // Create warning key based on window and tokens remaining (simpler than percentage)
      const tokensRemaining = rateLimitStatus.tokens?.available || 0;
      const warningKey = `${rateLimitStatus.windowId}_${Math.floor(tokensRemaining / 1000)}k`; // Group by thousands
      
      if (rateLimitStatus.usage?.isAtLimit) {
        setUsageWarningType('limited');
        setUsageWarningTime(rateLimitStatus.timeUntilReset);
      } else if (rateLimitStatus.usage?.isNearLimit && !dismissedWarnings.has(warningKey)) {
        setUsageWarningType('approaching');
        setUsageWarningTime(rateLimitStatus.timeUntilReset);
      } else {
        setUsageWarningType('none');
      }
      
    } catch (error) {
      console.error('Error checking usage status:', error);
      setUsageWarningType('none');
    }
  };
  
  
  // Modal states for actions
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [timeBlockModalVisible, setTimeBlockModalVisible] = useState(false);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [todoModalVisible, setTodoModalVisible] = useState(false);
  const [conversationLimitModalVisible, setConversationLimitModalVisible] = useState(false);
  const [conversationSizeWarningShown, setConversationSizeWarningShown] = useState(false);
  const [aiInfoModalVisible, setAiInfoModalVisible] = useState(false);
  const [aiInfoModalView, setAiInfoModalView] = useState('capabilities'); // 'capabilities' or 'personalKnowledge'
  const [currentGoalData, setCurrentGoalData] = useState(null);
  const [currentProjectData, setCurrentProjectData] = useState(null);
  const [currentTimeBlockData, setCurrentTimeBlockData] = useState(null);
  const [currentTaskData, setCurrentTaskData] = useState(null);
  const [currentTodoData, setCurrentTodoData] = useState(null);
  
  // NEW: Add upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  
  // Track multiple actions
  const [pendingActions, setPendingActions] = useState([]);
  const [actionProgress, setActionProgress] = useState(0);
  const [totalActions, setTotalActions] = useState(0);
  
  // Bulk creation modal state
  const [bulkCreateModalVisible, setBulkCreateModalVisible] = useState(false);
  const [bulkCreateActions, setBulkCreateActions] = useState([]);
  
  // Track if user has interacted with the conversation
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  // Store modal data for action links
  const [storedModalData, setStoredModalData] = useState({});
  const [nextModalDataId, setNextModalDataId] = useState(1);
  
  // AsyncStorage keys for persistent modal data
  const MODAL_DATA_KEY = 'aiAssistant_modalData';
  const NEXT_MODAL_ID_KEY = 'aiAssistant_nextModalId';
  
  // Load modal data from AsyncStorage
  const loadModalData = async () => {
    try {
      const [savedModalData, savedNextId] = await Promise.all([
        AsyncStorage.getItem(MODAL_DATA_KEY),
        AsyncStorage.getItem(NEXT_MODAL_ID_KEY)
      ]);
      
      if (savedModalData) {
        const parsedData = JSON.parse(savedModalData);
        setStoredModalData(parsedData);
        console.log('💾 Loaded modal data from storage:', Object.keys(parsedData));
      }
      
      if (savedNextId) {
        const nextId = parseInt(savedNextId, 10);
        if (!isNaN(nextId)) {
          setNextModalDataId(nextId);
          console.log('💾 Loaded next modal ID from storage:', nextId);
        }
      }
    } catch (error) {
      console.error('Error loading modal data from storage:', error);
    }
  };
  
  // Save modal data to AsyncStorage
  const saveModalData = async (data, nextId) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(MODAL_DATA_KEY, JSON.stringify(data)),
        AsyncStorage.setItem(NEXT_MODAL_ID_KEY, nextId.toString())
      ]);
      console.log('💾 Saved modal data to storage');
    } catch (error) {
      console.error('Error saving modal data to storage:', error);
    }
  };
  
  // Clean up old modal data (older than 7 days)
  const cleanupOldModalData = async () => {
    try {
      const savedModalData = await AsyncStorage.getItem(MODAL_DATA_KEY);
      if (!savedModalData) return;
      
      const parsedData = JSON.parse(savedModalData);
      const now = Date.now();
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
      
      let cleaned = false;
      const cleanedData = {};
      
      for (const [id, modalInfo] of Object.entries(parsedData)) {
        // Extract timestamp from the ID (format: timestamp_conversationIndex_randomString)
        const idParts = id.split('_');
        const timestamp = parseInt(idParts[0], 10);
        
        if (!isNaN(timestamp) && timestamp > sevenDaysAgo) {
          // Keep data that's less than 7 days old
          cleanedData[id] = modalInfo;
        } else {
          // Mark for cleanup
          cleaned = true;
        }
      }
      
      if (cleaned) {
        setStoredModalData(cleanedData);
        await AsyncStorage.setItem(MODAL_DATA_KEY, JSON.stringify(cleanedData));
        console.log('💾 Cleaned up old modal data');
      }
    } catch (error) {
      console.error('Error cleaning up modal data:', error);
    }
  };
  
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
  
  // Check if any message is currently streaming (only count it as streaming if it has content)
  const isStreaming = messages.some(message => message.streaming === true && message.text && message.text.length > 0);
  
  // Debug logging
  console.log('[AI Debug] isLoading:', isLoading, 'isStreaming:', isStreaming, 'messages count:', messages.length);
  
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
  
  // Helper function to count only enabled documents
  const getEnabledDocumentsCount = () => {
    return userDocuments.filter(doc => doc.enabled === true).length;
  };
  
  console.log('[AIAssistant] Is authenticated:', isAuthenticated);
  console.log('[AIAssistant] User email:', user?.email);
  
  // MODIFIED: Use a fixed AI model tier
  const aiModelTier = 'guide';
  
  // Extract user info from route or context with null checks
  const userName = (route?.params?.userName) || 'there';
  
  // Get conversation ID from route params or use last saved conversation
  const routeConversationId = route?.params?.conversationId;
  const clearAllRequested = route?.params?.clearAll;
  
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
  
  // Store modal data and return an ID for later retrieval
  const storeModalData = (actionType, data) => {
    const id = nextModalDataId.toString();
    const newData = {
      ...storedModalData,
      [id]: { type: actionType, data }
    };
    const newNextId = nextModalDataId + 1;
    
    setStoredModalData(newData);
    setNextModalDataId(newNextId);
    
    // Persist to AsyncStorage asynchronously
    saveModalData(newData, newNextId).catch(error => {
      console.error('Error persisting modal data:', error);
    });
    
    return id;
  };
  
  // Handle action links from chat messages
  const handleActionLink = async (actionType, encodedDataId) => {
    try {
      console.log('🔗 handleActionLink called with:', { actionType, encodedDataId });
      console.log('🔗 Current storedModalData:', storedModalData);
      
      // Reload from AsyncStorage to ensure we have the latest data
      try {
        const savedModalData = await AsyncStorage.getItem('storedModalData');
        if (savedModalData) {
          const parsedData = JSON.parse(savedModalData);
          console.log('🔗 Reloaded modal data from AsyncStorage for latest updates');
          console.log('🔗 AsyncStorage keys loaded:', Object.keys(parsedData));
          console.log('🔗 Looking for ID:', encodedDataId);
          console.log('🔗 ID exists in AsyncStorage?', encodedDataId in parsedData ? 'YES' : 'NO');
          setStoredModalData(parsedData); // Update state with fresh data
          
          // Use fresh data for modal retrieval
          const modalInfo = parsedData[encodedDataId];
          if (modalInfo) {
            console.log('✅ Found modal info in fresh data:', modalInfo);
            console.log('✅ Full modal info data structure:', JSON.stringify(modalInfo, null, 2));
            const { type, data } = modalInfo;
            
            // Verify type matches
            if (type !== actionType) {
              console.error('❌ Action type mismatch:', type, 'vs', actionType);
              return;
            }
            
            console.log('✅ Type matches, proceeding to open modal with fresh data');
            
            // Open modal with updated data
            switch (actionType) {
              case 'goal':
                setCurrentGoalData(data);
                setGoalModalVisible(true);
                break;
                
              case 'milestone':
              case 'project':
                setCurrentProjectData(data);
                setProjectModalVisible(true);
                break;
                
              case 'task':
                setCurrentTaskData(data);
                setTaskModalVisible(true);
                break;
                
              case 'taskbatch':
                console.log('🔗 Opening batch task modal with fresh data:', data);
                console.log('📋 Batch contains', data.tasks?.length || 0, 'tasks');
                setCurrentTaskData({ batch: true, tasks: data.tasks || [] });
                setTaskModalVisible(true);
                break;
                
              case 'timeblock':
                console.log('🔗 Opening timeblock modal with fresh data:', data);
                console.log('🔗 Fresh data includes isCreated?', data.isCreated);
                console.log('🔗 Fresh data includes successMessage?', data.successMessage);
                setCurrentTimeBlockData(data);
                setTimeBlockModalVisible(true);
                break;
                
              case 'todo':
                setCurrentTodoData(data);
                setTodoModalVisible(true);
                break;
                
              default:
                console.error('❌ Unknown action type:', actionType);
            }
            return;
          }
        }
      } catch (storageError) {
        console.error('Error reloading from AsyncStorage:', storageError);
        // Fall back to using current state data
      }
      
      // Fallback: Retrieve stored data from current state
      const modalInfo = storedModalData[encodedDataId];
      if (!modalInfo) {
        console.error('❌ Modal data not found for ID:', encodedDataId);
        console.error('❌ Available keys:', Object.keys(storedModalData));
        
        // Additional fallback: Check if we have recent data that matches the action type
        if (actionType === 'timeblock' && currentTimeBlockData) {
          console.log('🔄 Using current timeblock data as fallback:', currentTimeBlockData);
          setTimeBlockModalVisible(true);
          return;
        } else if (actionType === 'goal' && currentGoalData) {
          console.log('🔄 Using current goal data as fallback:', currentGoalData);
          setGoalModalVisible(true);
          return;
        } else if (actionType === 'milestone' && currentProjectData) {
          console.log('🔄 Using current project data as fallback:', currentProjectData);
          setProjectModalVisible(true);
          return;
        } else if (actionType === 'task' && currentTaskData) {
          console.log('🔄 Using current task data as fallback:', currentTaskData);
          setTaskModalVisible(true);
          return;
        }
        
        return;
      }
      
      console.log('✅ Found modal info:', modalInfo);
      console.log('✅ Full modal info data structure:', JSON.stringify(modalInfo, null, 2));
      const { type, data } = modalInfo;
      
      // Verify type matches
      if (type !== actionType) {
        console.error('❌ Action type mismatch:', type, 'vs', actionType);
        return;
      }
      
      console.log('✅ Type matches, proceeding to open modal');
      
      // Reopen the appropriate modal
      switch (actionType) {
        case 'goal':
          if (!canAddMoreGoals()) {
            showUpgradePrompt(
              `You've reached the limit of ${LOCAL_MAX_GOALS} active goals in the free version. Upgrade to Pro to track unlimited goals.`
            );
            return;
          }
          setCurrentGoalData(data);
          setGoalModalVisible(true);
          break;
          
        case 'milestone':
        case 'project': // Support both for backward compatibility
          setCurrentProjectData(data);
          setProjectModalVisible(true);
          break;
          
        case 'task':
          setCurrentTaskData(data);
          setTaskModalVisible(true);
          break;
          
        case 'taskbatch':
          console.log('🔗 Opening batch task modal with fallback data:', data);
          console.log('📋 Batch contains', data.tasks?.length || 0, 'tasks');
          setCurrentTaskData({ batch: true, tasks: data.tasks || [] });
          setTaskModalVisible(true);
          break;
          
        case 'timeblock':
          console.log('🔗 Opening timeblock modal with data:', data);
          console.log('🔗 Data includes isCreated?', data.isCreated);
          console.log('🔗 Data includes successMessage?', data.successMessage);
          setCurrentTimeBlockData(data);
          setTimeBlockModalVisible(true);
          break;
          
        case 'todo':
          setCurrentTodoData(data);
          setTodoModalVisible(true);
          break;
          
        default:
          console.error('❌ Unknown action type:', actionType);
      }
    } catch (error) {
      console.error('Error handling action link:', error);
    }
  };
  
  
  // Load modal data on mount and clean up old data
  useEffect(() => {
    const initializeModalData = async () => {
      await loadModalData();
      await cleanupOldModalData();
    };
    
    initializeModalData();
  }, []);
  
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
  
  // Create new conversation when screen comes into focus (only if no existing conversation)
  useFocusEffect(
    React.useCallback(() => {
      console.log('AI Assistant screen focused');
      
      // Only create new conversation if there's no route conversation ID and no current conversation
      if (!routeConversationId && !conversationId) {
        console.log('No existing conversation found - creating new conversation');
        createNewConversation();
      } else {
        console.log('Existing conversation found, not creating new one:', routeConversationId || conversationId);
      }
    }, [routeConversationId, conversationId])
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
            // Don't create new conversation, just use fallback message for the route conversation
            const fallbackMessage = {
              id: Date.now().toString(),
              text: `${getRandomIntroMessage()}`,
              type: 'ai',
              timestamp: new Date().toISOString(),
              centered: true
            };
            dispatch({ type: 'SET_CONVERSATION_ID', payload: routeConversationId });
            dispatch({ type: 'SET_MESSAGES', payload: [fallbackMessage] });
            dispatch({ type: 'SET_SHOW_SUGGESTIONS', payload: true });
          }
        } catch (error) {
          console.error('Error loading conversation from route:', error);
          // Don't create new conversation, preserve the route conversation ID and add fallback message
          const fallbackMessage = {
            id: Date.now().toString(),
            text: `${getRandomIntroMessage()}`,
            type: 'ai',
            timestamp: new Date().toISOString(),
            centered: true
          };
          dispatch({ type: 'SET_CONVERSATION_ID', payload: routeConversationId });
          dispatch({ type: 'SET_MESSAGES', payload: [fallbackMessage] });
          dispatch({ type: 'SET_SHOW_SUGGESTIONS', payload: true });
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
  
  // Handle clear all conversations - reset to fresh state
  useEffect(() => {
    if (clearAllRequested) {
      console.log('Clear all conversations requested - resetting to fresh state');
      
      // Reset all conversation state
      dispatch({ type: 'RESET_STATE' });
      
      // Clear any stored conversation ID
      AsyncStorage.removeItem(LAST_CHAT_KEY).catch(error => {
        console.error('Error clearing last chat key:', error);
      });
      
      // Create a fresh new conversation
      createNewConversation();
      
      // Clear the clearAll param from navigation to prevent re-triggering
      navigation.setParams({ clearAll: undefined });
    }
  }, [clearAllRequested]);
  
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
      if (userKnowledgeEnabled && getEnabledDocumentsCount() > 0) {
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
  
  // Process actions - use bulk modal for multiple goals/milestones only
  const processActions = (actions) => {
    if (!actions || !Array.isArray(actions) || actions.length === 0) return;
    
    console.log(`Processing ${actions.length} actions`);
    console.log('Actions to process:', JSON.stringify(actions, null, 2));
    
    // If multiple actions, check if they are only goals and milestones
    if (actions.length > 1) {
      const supportedBulkTypes = ['createGoal', 'createMilestone', 'createProject'];
      const allSupportedForBulk = actions.every(action => 
        supportedBulkTypes.includes(action.type)
      );
      
      if (allSupportedForBulk) {
        // Use bulk modal for goals and milestones only
        console.log('Using bulk modal for goals/milestones');
        setBulkCreateActions(actions);
        setBulkCreateModalVisible(true);
      } else {
        // Process individually if any tasks or timeblocks are included
        console.log('Processing individually - contains tasks/timeblocks');
        setPendingActions(actions);
        setTotalActions(actions.length);
        setActionProgress(0);
        processNextAction(actions, 0);
      }
    } else {
      // Single action - process individually as before
      setPendingActions(actions);
      setTotalActions(actions.length);
      setActionProgress(0);
      processNextAction(actions, 0);
    }
  };
  
  // Process the next action in the queue with guaranteed continuation
  const processNextAction = (actions, currentIndex) => {
    if (currentIndex >= actions.length) {
      console.log('All actions processed successfully');
      setPendingActions([]);
      setActionProgress(0);
      setTotalActions(0);
      return;
    }
    
    const action = actions[currentIndex];
    setActionProgress(currentIndex);
    
    console.log(`🔄 Processing action ${currentIndex + 1}/${actions.length}: ${action.type}`);
    console.log('🔄 Full action object:', JSON.stringify(action, null, 2));
    console.log('🔄 About to enter switch statement for:', action.type);
    
    // Helper function to continue to next action (always called)
    const continueToNext = () => {
      if (currentIndex < actions.length - 1) {
        console.log(`🔄 Continuing to action ${currentIndex + 2}/${actions.length}`);
        setTimeout(() => {
          processNextAction(actions, currentIndex + 1);
        }, 500);
      } else {
        console.log('🎉 All actions completed');
        setPendingActions([]);
        setActionProgress(0);
        setTotalActions(0);
      }
    };
    
    // Store modal data if modalDataId is provided (with error protection)
    try {
      if (action.modalDataId && action.originalData) {
        const mappedType = action.type === 'createMilestone' ? 'milestone' : action.type.replace('create', '').toLowerCase();
        console.log('💾 Storing modal data:', {
          modalDataId: action.modalDataId,
          originalType: action.type,
          mappedType: mappedType,
          data: action.originalData
        });
        
        // Use the persistent storage method instead of direct state update
        const newData = {
          ...storedModalData,
          [action.modalDataId]: { 
            type: mappedType, 
            data: action.originalData 
          }
        };
        
        setStoredModalData(newData);
        
        // Persist to AsyncStorage (don't let this block processing)
        saveModalData(newData, nextModalDataId).catch(error => {
          console.error('Error persisting modal data in processNextAction:', error);
        });
        
        console.log('💾 Updated and persisted storedModalData for ID:', action.modalDataId);
        console.log('💾 Stored data keys:', Object.keys(newData));
        console.log('💾 Verification - can retrieve stored data:', newData[action.modalDataId] ? 'YES' : 'NO');
      }
    } catch (modalError) {
      console.error('Error handling modal data, continuing anyway:', modalError);
    }
    
    // Handle each action type with timeout protection
    try {
      // Set a timeout to prevent infinite hangs
      const actionTimeout = setTimeout(() => {
        console.error(`⏰ Action ${currentIndex + 1} timed out, continuing to next action`);
        continueToNext();
      }, 30000); // 30 second timeout
      
      const clearTimeoutAndContinue = () => {
        clearTimeout(actionTimeout);
        // Don't call continueToNext here - let the modal handlers do it
      };
      
      switch (action.type) {
        case 'createGoal':
          console.log('Creating goal modal');
          
          // Check if user can add more goals before showing the goal modal
          if (!canAddMoreGoals()) {
            console.log('Goal limit reached, showing upgrade modal');
            showUpgradePrompt(
              `You've reached the limit of ${LOCAL_MAX_GOALS} active goals in the free version. Upgrade to Pro to track unlimited goals.`
            );
            clearTimeout(actionTimeout);
            continueToNext(); // Continue to next action even if upgrade needed
            return;
          }
          
          // If user can add more goals, show the goal modal
          setCurrentGoalData(action.data);
          setTimeout(() => {
            console.log('📱 Delayed goal modal visibility set');
            setGoalModalVisible(true);
          }, 100);
          clearTimeoutAndContinue();
          break;
          
        case 'createMilestone':
        case 'createProject': // Keep for backward compatibility
          console.log('Creating milestone modal');
          console.log('📝 Milestone data before processing:', JSON.stringify(action.data, null, 2));
          
          // Link milestone to last created goal if available
          if (lastCreatedGoalRef.current.id) {
            console.log('🔗 Linking milestone to last created goal:', lastCreatedGoalRef.current);
            action.data.goalId = lastCreatedGoalRef.current.id;
            action.data.goalTitle = lastCreatedGoalRef.current.title;
            action.data.domain = lastCreatedGoalRef.current.domain;
          } else {
            console.log('⚠️ No last created goal found to link milestone');
          }
          
          console.log('📝 Milestone data after processing:', JSON.stringify(action.data, null, 2));
          console.log('📱 Setting projectModalVisible to true and currentProjectData');
          
          // Add small delay to ensure state updates properly during bulk processing
          setCurrentProjectData(action.data);
          setTimeout(() => {
            console.log('📱 Delayed modal visibility set');
            setProjectModalVisible(true);
          }, 100);
          clearTimeoutAndContinue();
          break;
          
        case 'createTask':
          console.log('Creating single task modal with data:', JSON.stringify(action.data));
          // Treat single task same as batch - put it in an array for initialTasks
          setCurrentTaskData({ batch: true, tasks: [action.data] });
          setTimeout(() => {
            console.log('📱 Delayed task modal visibility set');
            setTaskModalVisible(true);
          }, 100);
          clearTimeoutAndContinue();
          break;
          
        case 'createTaskBatch':
          console.log('Creating batch task modal with data:', JSON.stringify(action.data));
          console.log('📋 Batch contains', action.data.tasks?.length || 0, 'tasks');
          // Set the batch of tasks for the modal
          setCurrentTaskData({ batch: true, tasks: action.data.tasks || [] });
          setTimeout(() => {
            console.log('📱 Delayed batch task modal visibility set');
            setTaskModalVisible(true);
          }, 100);
          clearTimeoutAndContinue();
          break;
          
        case 'createTimeBlock':
          console.log('🔥 FRONTEND_TIMEBLOCK_DEBUG: Creating time block modal');
          console.log('🔥 FRONTEND_TIMEBLOCK_DEBUG: Raw action.data received from Lambda:', JSON.stringify(action.data, null, 2));
          setCurrentTimeBlockData(action.data);
          setTimeout(() => {
            console.log('🔥 FRONTEND_TIMEBLOCK_DEBUG: Opening timeblock modal with data:', JSON.stringify(action.data, null, 2));
            setTimeBlockModalVisible(true);
          }, 100);
          clearTimeoutAndContinue();
          break;
          
        case 'createTodo':
          console.log('Creating todo modal');
          setCurrentTodoData(action.data);
          setTimeout(() => {
            console.log('📱 Delayed todo modal visibility set');
            setTodoModalVisible(true);
          }, 100);
          clearTimeoutAndContinue();
          break;
          
        default:
          console.log(`Unknown action type: ${action.type}`);
          console.log('Available action types are: createGoal, createMilestone, createTask, createTaskBatch, createTimeBlock, createTodo');
          clearTimeout(actionTimeout);
          continueToNext(); // Continue to next action even for unknown types
      }
    } catch (actionError) {
      console.error(`Error processing action ${currentIndex + 1}:`, actionError);
      continueToNext(); // Always continue even on errors
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
    
    // Check rate limits first using new token manager
    try {
      const canSendResult = await AITokenManager.canSendMessage(text);
      
      if (!canSendResult.canSend) {
        console.log('Message blocked by rate limits:', canSendResult.reason);
        
        // Update usage warning immediately
        if (canSendResult.rateLimit) {
          if (canSendResult.rateLimit.usage.isAtLimit) {
            setUsageWarningType('limited');
            setUsageWarningTime(canSendResult.rateLimit.timeUntilReset);
          }
        }
        
        // Don't send the message
        return;
      }
      
      // Check conversation length limits (local check)
      const estimatedTokens = AITokenManager.estimateTokens(text) * 3; // Input + expected output
      if (AITokenManager.shouldTruncateConversation(conversationId, estimatedTokens)) {
        console.log('Conversation length limit reached');
        
        // Show conversation length warning
        if (usageWarningType === 'none') {
          setUsageWarningType('conversation');
        }
        
        // Show the conversation limit modal as fallback
        setConversationLimitModalVisible(true);
        return;
      }
      
    } catch (error) {
      console.error('Error checking rate limits:', error);
      // Continue with message sending on error (fallback behavior)
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
          
          // If conversation not found, try to recreate it with current messages
          if (error.message && error.message.includes('Conversation not found')) {
            console.log('Conversation not found, attempting to recreate conversation with existing messages');
            
            try {
              // Try to recreate the conversation with current messages
              const currentMessages = messages || [];
              const newConversation = await AIService.createConversation(currentMessages);
              
              if (newConversation && newConversation._id) {
                console.log('Successfully recreated conversation with ID:', newConversation._id);
                
                // Update the conversation ID but keep the messages
                dispatch({ type: 'SET_CONVERSATION_ID', payload: newConversation._id });
                
                // Save to AsyncStorage
                await AsyncStorage.setItem('currentConversationId', newConversation._id);
                
                // Now try to add the user message again
                try {
                  console.log(`Adding user message to recreated conversation ${newConversation._id}`);
                  await AIService.addMessageToConversation(newConversation._id, userMessage.text, 'user');
                } catch (retryError) {
                  console.error('Error saving user message to recreated conversation:', retryError);
                }
              } else {
                console.error('Failed to recreate conversation, continuing without backend sync');
              }
            } catch (recreateError) {
              console.error('Error recreating conversation:', recreateError);
              // Continue without backend sync - the conversation will work locally
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
          
          console.log('📄 [CONTEXT DEBUG] Document context size:', documentContext ? documentContext.length : 0, 'characters');
          
          if (documentContext) {
            console.log('📄 [CONTEXT DEBUG] Context preview (first 200 chars):', documentContext.substring(0, 200));
            console.log('📄 [CONTEXT DEBUG] Contains goals?', documentContext.toLowerCase().includes('goals'));
            console.log('📄 [CONTEXT DEBUG] Contains app context?', documentContext.toLowerCase().includes('app context'));
          }
          
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
              console.log(`🎯 [TITLE DEBUG] Received conversation title from AI: "${title}" (length: ${title.length})`);
              
              try {
                // Update the conversation with the AI title
                await AIService.updateConversation(conversationId, {
                  title: title
                });
                
                console.log(`✅ [TITLE DEBUG] Successfully saved AI title "${title}" to conversation ${conversationId}`);
                
                // Verify the title was saved correctly
                const savedConversation = await AIService.getConversation(conversationId);
                console.log(`🔍 [TITLE DEBUG] Verified saved title: "${savedConversation?.title}" (length: ${savedConversation?.title?.length || 0})`);
                
              } catch (error) {
                console.error('❌ Error saving conversation title:', error);
              }
            } else if (firstMessage) {
              console.log('⚠️ First message but no title received from AI');
            }
            
            if (conversationId) {
              try {
                console.log(`Adding AI message to conversation ${conversationId}`);
                await AIService.addMessageToConversation(conversationId, finalText, 'ai');
              } catch (error) {
                console.error('Error saving AI message:', error);
                
                // If conversation not found, try to recreate it with current messages
                if (error.message && error.message.includes('Conversation not found')) {
                  console.log('Conversation not found when saving AI message, attempting to recreate conversation');
                  
                  try {
                    // Try to recreate the conversation with current messages (including the new AI message)
                    const currentMessages = messages || [];
                    const newConversation = await AIService.createConversation(currentMessages);
                    
                    if (newConversation && newConversation._id) {
                      console.log('Successfully recreated conversation for AI message with ID:', newConversation._id);
                      
                      // Update the conversation ID but keep the messages
                      dispatch({ type: 'SET_CONVERSATION_ID', payload: newConversation._id });
                      
                      // Save to AsyncStorage
                      await AsyncStorage.setItem('currentConversationId', newConversation._id);
                      
                      // Try to add the AI message again
                      try {
                        console.log(`Adding AI message to recreated conversation ${newConversation._id}`);
                        await AIService.addMessageToConversation(newConversation._id, finalText, 'ai');
                      } catch (retryError) {
                        console.error('Error saving AI message to recreated conversation:', retryError);
                      }
                    } else {
                      console.error('Failed to recreate conversation for AI message, continuing without backend sync');
                    }
                  } catch (recreateError) {
                    console.error('Error recreating conversation for AI message:', recreateError);
                    // Continue without backend sync - the conversation will work locally
                  }
                }
              }
            }
            
            // Process actions if any
            if (actions && Array.isArray(actions) && actions.length > 0) {
              console.log(`Found ${actions.length} actions to perform`);
              
              // Check if there are goal actions and if user can create more goals
              const goalAction = actions.find(action => action.type === 'createGoal');
              if (goalAction && !canAddMoreGoals()) {
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
                // Process all actions using new bulk modal logic
                console.log('Processing all actions with bulk modal logic');
                processActions(actions);
              }
            }
            
            dispatch({ type: 'SET_SHOW_SUGGESTIONS', payload: false });
            
            // Record token usage after message completion using new token manager
            if (!isUnlimitedMode) {
              try {
                // Estimate token counts (this would be more accurate from real API response)
                const inputTokens = Math.round(userMessage.text.length / 4);
                const outputTokens = Math.round(finalText.length / 4);
                
                // Track usage through token manager
                const trackingResult = await AITokenManager.trackTokenUsage(inputTokens, outputTokens);
                
                if (trackingResult.success) {
                  console.log('Token usage tracked successfully:', trackingResult);
                  
                  // Update conversation token count
                  const currentConversationTokens = AITokenManager.getConversationTokens(conversationId);
                  const newConversationTokens = currentConversationTokens + inputTokens + outputTokens;
                  await AITokenManager.updateConversationTokens(conversationId, newConversationTokens);
                  
                  // Refresh usage status after tracking
                  await checkUsageStatus();
                  
                } else if (trackingResult.rateLimited) {
                  console.log('Rate limit hit during token tracking');
                  // Update UI to show rate limit
                  setUsageWarningType('limited');
                  if (trackingResult.windowInfo) {
                    setUsageWarningTime(trackingResult.windowInfo.timeUntilReset);
                  }
                } else {
                  console.error('Token tracking failed:', trackingResult.error);
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
    
    // Helper to continue processing queue
    const continueProcessing = () => {
      if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
        setTimeout(() => {
          processNextAction(pendingActions, actionProgress + 1);
        }, 500);
      } else if (pendingActions.length > 0) {
        // Clear pending actions when we're done
        setPendingActions([]);
        setActionProgress(0);
        setTotalActions(0);
      }
    };
    
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
        
        // Track AI-generated goal achievement (don't let this block processing)
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
        
        // Create success message
        const successText = `Goal "${newGoal.title}" created successfully! You can view and edit it in the Goals tab.`;
        
        const successMessage = {
          id: (Date.now() + 1).toString(),
          text: successText,
          type: 'ai',
          timestamp: new Date().toISOString()
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: successMessage });
      } else {
        throw new Error('addGoal function not available');
      }
    } catch (error) {
      console.error('Error creating goal:', error);
      
      // Enhanced error message with progress info
      const progressInfo = pendingActions.length > 1 ? ` (Action ${actionProgress + 1} of ${pendingActions.length})` : '';
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I couldn't create the goal: ${error.message}${progressInfo}. Continuing to next item...`,
        type: 'ai',
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    } finally {
      // ALWAYS continue processing, even on errors
      continueProcessing();
    }
  };
  
  // Handle Milestone creation
  const handleProjectConfirm = async (projectData) => {
    setProjectModalVisible(false);
    
    // Helper to continue processing queue
    const continueProcessing = () => {
      if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
        setTimeout(() => {
          processNextAction(pendingActions, actionProgress + 1);
        }, 500);
      } else if (pendingActions.length > 0) {
        // Clear pending actions when we're done
        setPendingActions([]);
        setActionProgress(0);
        setTotalActions(0);
      }
    };
    
    try {
      const { addProject, addTasksBulk } = appContext; // Use same functions as bulk creation
      
      if (typeof addProject === 'function') {
        const newMilestone = {
          ...projectData,
          // Remove pre-generated ID - let AppContext generate it with proper format
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Create milestone using addProject (same as bulk creation)
        console.log('🔍 About to call addProject with milestone:', JSON.stringify(newMilestone, null, 2));
        const milestoneResult = await addProject(newMilestone);
        console.log('🔍 addProject result:', milestoneResult);
        
        // Add a longer delay to allow state to propagate properly
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check if milestone was actually created - be more flexible with validation
        // Since addProject returned a result, trust that it worked
        if (!milestoneResult) {
          throw new Error('Milestone creation failed - addProject returned null/undefined');
        }
        
        console.log('🔍 Milestone creation appears successful, proceeding with tasks');
        
        // If the milestone has tasks, create them using addTasksBulk
        if (newMilestone.tasks && Array.isArray(newMilestone.tasks) && newMilestone.tasks.length > 0) {
          console.log(`🎯 Milestone has ${newMilestone.tasks.length} tasks to create:`, newMilestone.tasks);
          
          // Use addTasksBulk with exact same pattern as bulk creation
          if (typeof addTasksBulk === 'function') {
            const tasksForAppContext = newMilestone.tasks.map(task => ({
              id: task.id,
              title: task.title,
              status: task.status || 'todo',
              completed: task.completed || false,
              milestoneId: milestoneResult.id,  // Use the actual ID generated by AppContext
              projectId: milestoneResult.id,   // For backward compatibility
              goalId: newMilestone.goalId,     // Add goalId field (null for standalone milestones)
              createdAt: task.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }));
            
            // Enhanced debugging for standalone milestones
            console.log('🔍 MILESTONE CREATION DEBUG:', {
              milestoneId: milestoneResult.id,
              milestoneGoalId: newMilestone.goalId,
              isStandalone: newMilestone.goalId === null,
              tasksToCreate: newMilestone.tasks?.length || 0,
              taskDetails: newMilestone.tasks?.map(t => ({ id: t.id, title: t.title }))
            });
            
            console.log('🔍 TASKS BEING SENT TO addTasksBulk:', tasksForAppContext);
            console.log('🔍 Milestone being passed as known:', { id: milestoneResult.id, title: milestoneResult.title });
            
            // Log current context state before creating tasks
            console.log('🔍 AppContext state before task creation:', {
              milestonesCount: appContext.projects?.length || 0,
              tasksCount: appContext.tasks?.length || 0,
              milestoneExists: appContext.projects?.some(m => m.id === newMilestone.id)
            });
            
            // Pass the newly created milestone as a known milestone to bypass state validation (same as bulk)
            const taskResult = await addTasksBulk(tasksForAppContext, [milestoneResult]);
            
            // Enhanced task creation result logging
            console.log('🔍 TASK CREATION RESULT:', {
              success: !!taskResult,
              tasksCreated: taskResult?.length || 0,
              taskIds: taskResult?.map(t => t.id) || [],
              taskTitles: taskResult?.map(t => t.title) || []
            });
            
            console.log('🔍 AppContext state after task creation:', {
              milestonesCount: appContext.projects?.length || 0,
              tasksCount: appContext.tasks?.length || 0,
              milestoneExists: appContext.projects?.some(m => m.id === milestoneResult.id)
            });
            
            // Add another small delay to allow task state to propagate (same as bulk)
            await new Promise(resolve => setTimeout(resolve, 50));
          } else {
            console.error('❌ addTasksBulk function not available');
          }
        } else {
          console.log('ℹ️ Milestone has no tasks to create');
        }
        
        // Track AI-generated milestone achievement (don't let this block processing)
        try {
          await FeatureExplorerTracker.trackAIGenerated(newMilestone, 'milestone', showSuccess);
        } catch (error) {
          console.error('Error tracking AI-generated milestone achievement:', error);
        }
          
        console.log(`Created milestone: "${milestoneResult.title}"`);
        
        // Create success message
        const successText = `Milestone "${milestoneResult.title}" created successfully!`;
        
        const successMessage = {
          id: (Date.now() + 1).toString(),
          text: successText,
          type: 'ai',
          timestamp: new Date().toISOString()
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: successMessage });
      } else {
        throw new Error('addProject function not available');
      }
    } catch (error) {
      console.error('Error creating milestone:', error);
      
      // Enhanced error message with progress info
      const progressInfo = pendingActions.length > 1 ? ` (Action ${actionProgress + 1} of ${pendingActions.length})` : '';
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I couldn't create the milestone: ${error.message}${progressInfo}. Continuing to next item...`,
        type: 'ai',
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    } finally {
      // ALWAYS continue processing, even on errors
      continueProcessing();
    }
  };
  
  // Handle Task creation
  const handleTaskConfirm = async (taskData) => {
    setTaskModalVisible(false);
    
    // Helper to continue processing queue
    const continueProcessing = () => {
      if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
        setTimeout(() => {
          processNextAction(pendingActions, actionProgress + 1);
        }, 500);
      } else if (pendingActions.length > 0) {
        // Clear pending actions when we're done
        setPendingActions([]);
        setActionProgress(0);
        setTotalActions(0);
      }
    };
    
    try {
      const { addTask, addTasksBulk, milestones } = appContext;
      
      // Process the task data from our modal (could be single task or array)
      const taskList = Array.isArray(taskData) ? taskData : [taskData];
      console.log(`🔍 Processing ${taskList.length} tasks for creation`);
      
      if (taskList.length > 1 && typeof addTasksBulk === 'function') {
        // Use bulk creation for multiple tasks (more efficient)
        console.log('🔍 Using bulk task creation method');
        
        // Filter tasks that need real milestones and collect them
        const tasksWithRealMilestones = taskList.filter(task => 
          task.milestoneId && task.milestoneId !== null
        );
        
        // Get unique milestone IDs needed
        const neededMilestoneIds = [...new Set(tasksWithRealMilestones.map(task => task.milestoneId))];
        const knownMilestones = milestones.filter(m => neededMilestoneIds.includes(m.id));
        
        console.log('🔍 Tasks with real milestones:', tasksWithRealMilestones.length);
        console.log('🔍 Known milestones for tasks:', knownMilestones.length);
        
        // Use addTasksBulk - it handles both milestone and standalone tasks
        await addTasksBulk(taskList, knownMilestones);
        
        // Create success message
        const successText = `Successfully created ${taskList.length} tasks!`;
        console.log(successText);
        
        const successMessage = {
          id: (Date.now() + 1).toString(),
          text: successText,
          type: 'ai',
          timestamp: new Date().toISOString()
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: successMessage });
        
      } else {
        // Single task or fallback to individual creation
        console.log('🔍 Using individual task creation method');
        
        for (const task of taskList) {
          console.log(`🔍 Creating task: "${task.title}" with milestoneId: ${task.milestoneId}`);
          
          if (typeof addTask === 'function') {
            await addTask(task);
            
            // Create success message based on task type
            let successText;
            if (task.milestoneId) {
              const milestone = milestones.find(m => m.id === task.milestoneId);
              successText = milestone 
                ? `Task "${task.title}" added to milestone "${milestone.title}" successfully!`
                : `Task "${task.title}" created successfully!`;
            } else if (task.goalId) {
              successText = `Task "${task.title}" added to goal "${task.goalTitle}" successfully!`;
            } else {
              successText = `Standalone task "${task.title}" created successfully!`;
            }
            
            console.log(successText);
            
            const successMessage = {
              id: (Date.now() + 1).toString(),
              text: successText,
              type: 'ai',
              timestamp: new Date().toISOString()
            };
            
            dispatch({ type: 'ADD_MESSAGE', payload: successMessage });
          } else {
            throw new Error('addTask function not available');
          }
        }
      }
    } catch (error) {
      console.error('Error creating task:', error);
      
      // Enhanced error message with progress info
      const progressInfo = pendingActions.length > 1 ? ` (Action ${actionProgress + 1} of ${pendingActions.length})` : '';
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I couldn't create the task: ${error.message}${progressInfo}. Continuing to next item...`,
        type: 'ai',
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    } finally {
      // ALWAYS continue processing, even on errors
      continueProcessing();
    }
  };
  
  // Handle TimeBlock creation
  const handleTimeBlockConfirm = async (timeBlockData) => {
    setTimeBlockModalVisible(false);
    
    // Helper to continue processing queue
    const continueProcessing = () => {
      if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
        setTimeout(() => {
          processNextAction(pendingActions, actionProgress + 1);
        }, 500);
      } else if (pendingActions.length > 0) {
        // Clear pending actions when we're done
        setPendingActions([]);
        setActionProgress(0);
        setTotalActions(0);
      }
    };
    
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
        
        // Create success message
        const successText = `Time block "${newTimeBlock.title}" scheduled successfully!`;
        
        const successMessage = {
          id: `${Date.now()}_success_${Math.random().toString(36).substr(2, 9)}`,
          text: successText,
          type: 'ai',
          timestamp: new Date().toISOString()
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: successMessage });
        
        // Update stored modal data to mark as created (for persistence when reopening)
        const currentAction = pendingActions[actionProgress];
        if (currentAction && currentAction.modalDataId) {
          const updatedModalData = {
            ...storedModalData,
            [currentAction.modalDataId]: {
              ...storedModalData[currentAction.modalDataId],
              data: {
                ...storedModalData[currentAction.modalDataId]?.data,
                isCreated: true,
                createdAt: new Date().toISOString(),
                successMessage: successText
              }
            }
          };
          setStoredModalData(updatedModalData);
          await AsyncStorage.setItem('storedModalData', JSON.stringify(updatedModalData));
          console.log('💾 Updated modal data with creation status:', currentAction.modalDataId);
          console.log('💾 Updated data structure:', JSON.stringify(updatedModalData[currentAction.modalDataId], null, 2));
          console.log('💾 Verification - success message in updated data:', updatedModalData[currentAction.modalDataId]?.data?.successMessage);
        }
      } else {
        throw new Error('addTimeBlock function not available');
      }
    } catch (error) {
      console.error('Error creating time block:', error);
      
      // Enhanced error message with progress info
      const progressInfo = pendingActions.length > 1 ? ` (Action ${actionProgress + 1} of ${pendingActions.length})` : '';
      const errorMessage = {
        id: `${Date.now()}_error_${Math.random().toString(36).substr(2, 9)}`,
        text: `I'm sorry, I couldn't create the time block: ${error.message}${progressInfo}. Continuing to next item...`,
        type: 'ai',
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    } finally {
      // ALWAYS continue processing, even on errors
      continueProcessing();
    }
  };
  
  // Handle Todo creation
  const handleTodoConfirm = async (todoData) => {
    setTodoModalVisible(false);
    
    // Helper to continue processing queue
    const continueProcessing = () => {
      if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
        setTimeout(() => {
          processNextAction(pendingActions, actionProgress + 1);
        }, 500);
      } else if (pendingActions.length > 0) {
        // Clear pending actions when we're done
        setPendingActions([]);
        setActionProgress(0);
        setTotalActions(0);
      }
    };
    
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
    } catch (error) {
      console.error('Error creating todo:', error);
      console.error('Todo data was:', todoData);
      
      // Enhanced error message with progress info
      const progressInfo = pendingActions.length > 1 ? ` (Action ${actionProgress + 1} of ${pendingActions.length})` : '';
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I couldn't create the to-do: ${error.message}${progressInfo}. Continuing to next item...`,
        type: 'ai',
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    } finally {
      // ALWAYS continue processing, even on errors
      continueProcessing();
    }
  };
  
  
  // Handle modal cancellations (continue processing even when user cancels)
  const handleGoalModalCancel = () => {
    console.log('Goal modal cancelled - continuing to next action');
    setGoalModalVisible(false);
    
    // Continue to next action instead of clearing all pending actions
    if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
      setTimeout(() => {
        processNextAction(pendingActions, actionProgress + 1);
      }, 500);
    } else if (pendingActions.length > 0) {
      // Clear when we're done
      setPendingActions([]);
      setActionProgress(0);
      setTotalActions(0);
    }
  };
  
  const handleProjectModalCancel = () => {
    console.log('Project modal cancelled - continuing to next action');
    setProjectModalVisible(false);
    
    // Continue to next action instead of clearing all pending actions
    if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
      setTimeout(() => {
        processNextAction(pendingActions, actionProgress + 1);
      }, 500);
    } else if (pendingActions.length > 0) {
      // Clear when we're done
      setPendingActions([]);
      setActionProgress(0);
      setTotalActions(0);
    }
  };
  
  const handleTaskModalCancel = () => {
    console.log('Task modal cancelled - continuing to next action');
    setTaskModalVisible(false);
    
    // Continue to next action instead of clearing all pending actions
    if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
      setTimeout(() => {
        processNextAction(pendingActions, actionProgress + 1);
      }, 500);
    } else if (pendingActions.length > 0) {
      // Clear when we're done
      setPendingActions([]);
      setActionProgress(0);
      setTotalActions(0);
    }
  };
  
  const handleTimeBlockModalCancel = () => {
    console.log('Time block modal cancelled - continuing to next action');
    setTimeBlockModalVisible(false);
    
    // Continue to next action instead of clearing all pending actions
    if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
      setTimeout(() => {
        processNextAction(pendingActions, actionProgress + 1);
      }, 500);
    } else if (pendingActions.length > 0) {
      // Clear when we're done
      setPendingActions([]);
      setActionProgress(0);
      setTotalActions(0);
    }
  };
  
  const handleTodoModalCancel = () => {
    console.log('Todo modal cancelled - continuing to next action');
    setTodoModalVisible(false);
    setCurrentTodoData(null);
    setCurrentTodoAISuggestions([]);
    
    // Continue to next action instead of clearing all pending actions
    if (pendingActions.length > 0 && actionProgress < pendingActions.length - 1) {
      setTimeout(() => {
        processNextAction(pendingActions, actionProgress + 1);
      }, 500);
    } else if (pendingActions.length > 0) {
      // Clear when we're done
      setPendingActions([]);
      setActionProgress(0);
      setTotalActions(0);
    }
  };
  
  // Bulk modal handlers
  const handleBulkCreateComplete = (createdItems) => {
    console.log('Bulk creation completed:', createdItems);
    setBulkCreateModalVisible(false);
    setBulkCreateActions([]);
    
    // Show a success notification
    if (createdItems.goals?.length || createdItems.milestones?.length || createdItems.tasks?.length) {
      const total = (createdItems.goals?.length || 0) + (createdItems.milestones?.length || 0) + (createdItems.tasks?.length || 0);
      dispatch({ 
        type: 'SHOW_TOAST', 
        payload: `Successfully created ${total} item${total > 1 ? 's' : ''}!` 
      });
    }
  };
  
  const handleBulkCreateClose = () => {
    setBulkCreateModalVisible(false);
    setBulkCreateActions([]);
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
        isStreaming={isStreaming}
        showSuggestions={showSuggestions}
        onSendMessage={handleSendMessage}
        onSuggestionPress={(suggestion) => {
          if (suggestion?.isInfo) {
            setAiInfoModalView('capabilities'); // Reset to capabilities view
            setAiInfoModalVisible(true);
          } else if (suggestion?.text) {
            handleSendMessage(suggestion.text);
          }
        }}
        onNewConversation={createNewConversation}
        style={aiModelTier}
        conversationId={conversationId}
        warningThreshold={AIService.getWarningThreshold(aiModelTier)}
        maxThreshold={AIService.getCharacterLimit(aiModelTier)}
        aiTier={aiModelTier}
        onActionLink={handleActionLink}
        themeColor={theme.primary}
      />
      
      {/* User Knowledge Indicator */}
      {userKnowledgeEnabled && userDocuments && getEnabledDocumentsCount() > 0 && (
        <AIStatusIndicators.KnowledgeIndicator 
          count={getEnabledDocumentsCount()} 
        />
      )}
      
      {/* AI Usage Warning - Only shows when needed */}
      <AIUsageWarning 
        type={usageWarningType}
        timeUntilReset={usageWarningTime}
        onDismiss={() => {
          // Dismiss current warning and remember it using new token-based key
          const rateLimitStatus = AITokenManager.cachedWindowStatus;
          if (rateLimitStatus) {
            const tokensRemaining = rateLimitStatus.tokens?.available || 0;
            const warningKey = `${rateLimitStatus.windowId}_${Math.floor(tokensRemaining / 1000)}k`;
            setDismissedWarnings(prev => new Set([...prev, warningKey]));
          }
          setUsageWarningType('none');
        }}
        onStartNewConversation={createNewConversation}
      />
      
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
        subscriptionStatus={appContext?.userSubscriptionStatus}
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
      
      <AddMilestoneModalRevamped
        visible={projectModalVisible}
        onClose={handleProjectModalCancel}
        onAdd={handleProjectConfirm}
        milestoneData={currentProjectData}
        projectData={currentProjectData}
        color={theme.primary}
        showUpgradePrompt={showUpgradePrompt}
      />
      
      <AddTaskModal
        visible={taskModalVisible}
        onClose={handleTaskModalCancel}
        onAdd={handleTaskConfirm}
        task={currentTaskData?.batch ? null : currentTaskData}
        initialTasks={currentTaskData?.batch ? currentTaskData.tasks : []}
        color={theme.primary}
        showUpgradePrompt={showUpgradePrompt}
      />
      
      <TimeBlockExactModal
        visible={timeBlockModalVisible}
        onClose={handleTimeBlockModalCancel}
        onSave={handleTimeBlockConfirm}
        timeBlockData={currentTimeBlockData}
        initialDate={new Date()}
        showUpgradePrompt={showUpgradePrompt}
      />
      
      <AddTodoModal
        visible={todoModalVisible}
        onClose={handleTodoModalCancel}
        onAdd={handleTodoConfirm}
        todoData={currentTodoData}
        aiSuggestions={[]}
      />
      
      {/* Bulk Creation Modal */}
      <AIBulkCreateModal
        visible={bulkCreateModalVisible}
        onClose={handleBulkCreateClose}
        onComplete={handleBulkCreateComplete}
        actions={bulkCreateActions}
        color={theme.primary}
        showUpgradePrompt={showUpgradePrompt}
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
      
      
      {/* Mode Info Modal */}
      <AIModeInfoModal
        visible={modeInfoVisible}
        onClose={() => dispatch({ type: 'SET_MODAL_VISIBILITY', payload: { modal: 'modeInfoVisible', visible: false } })}
        theme={theme}
      />
      
      {/* AI Info Modal */}
      <Modal
        visible={aiInfoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAiInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.aiInfoModal, 
            { 
              backgroundColor: theme.card || theme.background,
              marginTop: safeSpacing.top,
              marginBottom: safeSpacing.bottom,
              marginLeft: spacing.m,
              marginRight: spacing.m
            }
          ]}>
            {/* Toggle Button - positioned relative to modal container for consistent placement */}
            <TouchableOpacity
              style={styles.personalKnowledgeToggleInModal}
              onPress={() => {
                setAiInfoModalView(aiInfoModalView === 'capabilities' ? 'personalKnowledge' : 'capabilities');
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={aiInfoModalView === 'capabilities' ? 'Personal Knowledge Info' : 'AI Capabilities'}
              accessibilityHint={aiInfoModalView === 'capabilities' ? 'Shows information about AI\'s personal knowledge capabilities' : 'Shows information about AI\'s general capabilities'}
            >
              <Ionicons 
                name={aiInfoModalView === 'capabilities' ? "person-circle-outline" : "sparkles"} 
                size={scaleWidth(20)} 
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.aiInfoModalHeader}>
              <Ionicons 
                name={aiInfoModalView === 'capabilities' ? "sparkles" : "person-circle"} 
                size={scaleWidth(40)} 
                color={aiInfoModalView === 'capabilities' ? "#3B82F6" : theme.primary} 
              />
              <Text 
                style={[styles.aiInfoModalTitle, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                {aiInfoModalView === 'capabilities' ? 'Your AI Assistant' : 'Personal AI Knowledge'}
              </Text>
            </View>
            
            {/* Conditional Content Based on View */}
            {aiInfoModalView === 'capabilities' ? (
              <>
                <Text 
                  style={[styles.aiInfoModalMessage, { color: theme.text }]}
                  maxFontSizeMultiplier={1.3}
                >
                  I can help you transform your ideas into actionable plans by creating goals, breaking them down into manageable steps, and organizing your daily tasks.
                </Text>
                
                <View style={styles.modalContentArea}>
                  <View style={styles.aiCapabilitiesList}>
                    <View style={styles.aiCapabilityItem}>
                      <Ionicons name="flag" size={scaleWidth(20)} color="#3B82F6" />
                      <Text style={[styles.aiCapabilityText, { color: theme.text }]}>
                        Set goals that actually matter to you
                      </Text>
                    </View>
                    <View style={styles.aiCapabilityItem}>
                      <Ionicons name="diamond" size={scaleWidth(20)} color="#3B82F6" />
                      <Text style={[styles.aiCapabilityText, { color: theme.text }]}>
                        Turn big goals into manageable milestones
                      </Text>
                    </View>
                    <View style={styles.aiCapabilityItem}>
                      <Ionicons name="checkmark-done-outline" size={scaleWidth(20)} color="#3B82F6" />
                      <Text style={[styles.aiCapabilityText, { color: theme.text }]}>
                        Break milestones into tasks you can complete
                      </Text>
                    </View>
                    <View style={styles.aiCapabilityItem}>
                      <Ionicons name="calendar" size={scaleWidth(20)} color="#3B82F6" />
                      <Text style={[styles.aiCapabilityText, { color: theme.text }]}>
                        Block focused time for what matters most
                      </Text>
                    </View>
                    <View style={styles.aiCapabilityItem}>
                      <Ionicons name="checkbox" size={scaleWidth(20)} color="#3B82F6" />
                      <Text style={[styles.aiCapabilityText, { color: theme.text }]}>
                        Manage daily tasks so nothing falls through
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.aiInfoCloseButton, 
                      { backgroundColor: '#3B82F6' },
                      { minHeight: accessibility.minTouchTarget }
                    ]}
                    onPress={() => setAiInfoModalVisible(false)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Done"
                    accessibilityHint="Closes the AI capabilities information"
                  >
                    <Ionicons name="checkmark" size={scaleWidth(18)} color="#FFFFFF" style={{marginRight: spacing.xs}} />
                    <Text 
                      style={styles.aiInfoCloseButtonText}
                      maxFontSizeMultiplier={1.3}
                    >
                      Got it
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text 
                  style={[styles.aiInfoModalMessage, { color: theme.text }]}
                  maxFontSizeMultiplier={1.3}
                >
                  With personal knowledge enabled, the AI can analyze your goals, milestones, and tasks to provide contextual guidance tailored to your specific situation and objectives.
                </Text>
                
                <View style={styles.modalContentArea}>
                  <View style={styles.personalKnowledgeList}>
                    <View style={styles.personalKnowledgeSection}>
                      <Text style={[styles.personalKnowledgeSectionTitle, { color: theme.text }]}>
                        What I Can Read:
                      </Text>
                      <View style={styles.personalKnowledgeItem}>
                        <Ionicons name="flag" size={scaleWidth(16)} color={theme.primary} />
                        <Text style={[styles.personalKnowledgeItemText, { color: theme.text }]}>
                          Your goals and progress across all life domains
                        </Text>
                      </View>
                      <View style={styles.personalKnowledgeItem}>
                        <Ionicons name="diamond" size={scaleWidth(16)} color={theme.primary} />
                        <Text style={[styles.personalKnowledgeItemText, { color: theme.text }]}>
                          Current milestones and completion status
                        </Text>
                      </View>
                      <View style={styles.personalKnowledgeItem}>
                        <Ionicons name="checkmark-done-outline" size={scaleWidth(16)} color={theme.primary} />
                        <Text style={[styles.personalKnowledgeItemText, { color: theme.text }]}>
                          Active tasks and what you're working on
                        </Text>
                      </View>
                      <View style={styles.personalKnowledgeItem}>
                        <Ionicons name="document-text" size={scaleWidth(16)} color={theme.primary} />
                        <Text style={[styles.personalKnowledgeItemText, { color: theme.text }]}>
                          Any documents that help me understand you (resumes, personality tests, etc.)
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.personalKnowledgeUploadButton, 
                      { backgroundColor: theme.primary },
                      { minHeight: accessibility.minTouchTarget }
                    ]}
                    onPress={() => {
                      setAiInfoModalVisible(false);
                      // Navigate to Personal Knowledge screen
                      navigation.navigate('PersonalKnowledgeScreen');
                    }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Upload Documents"
                    accessibilityHint="Opens the personal knowledge screen to upload documents"
                  >
                    <Ionicons name="cloud-upload" size={scaleWidth(18)} color="#FFFFFF" style={{marginRight: spacing.xs}} />
                    <Text 
                      style={styles.personalKnowledgeUploadButtonText}
                      maxFontSizeMultiplier={1.3}
                    >
                      Upload Documents
                    </Text>
                  </TouchableOpacity>
                </View>
                
              </>
            )}
          </View>
        </View>
      </Modal>
      
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
                Pro Feature
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
  },
  // AI Info Modal Styles
  aiInfoModal: {
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
  aiInfoModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  aiInfoModalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginTop: spacing.m,
    textAlign: 'center',
  },
  aiInfoModalMessage: {
    fontSize: fontSizes.m,
    textAlign: 'center',
    marginBottom: spacing.l,
    lineHeight: scaleHeight(24),
    paddingHorizontal: spacing.s,
  },
  aiCapabilitiesList: {
    alignSelf: 'stretch',
    marginBottom: spacing.xl,
  },
  aiCapabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
    paddingHorizontal: spacing.s,
  },
  aiCapabilityText: {
    fontSize: fontSizes.s,
    marginLeft: spacing.m,
    flex: 1,
    lineHeight: scaleHeight(20),
  },
  aiInfoCloseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: scaleWidth(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  aiInfoCloseButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: 'bold',
  },
  // Modal Content Area - ensures consistent sizing
  modalContentArea: {
    alignSelf: 'stretch',
    minHeight: scaleHeight(280), // Fixed minimum height for consistency
    justifyContent: 'space-between',
  },
  // Personal Knowledge Toggle Button Style - positioned relative to modal container
  personalKnowledgeToggleInModal: {
    position: 'absolute',
    top: spacing.m,
    right: spacing.m,
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue background
    borderRadius: scaleWidth(20), // Slightly more rounded
    width: scaleWidth(40), // Slightly larger
    height: scaleWidth(40), // Slightly larger
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)', // Colored border
    shadowColor: '#3B82F6', // Colored shadow
    shadowOffset: { width: 0, height: 4 }, // More pronounced shadow
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  // Personal Knowledge Styles (used in combined modal)
  personalKnowledgeList: {
    alignSelf: 'stretch',
    marginBottom: spacing.l,
  },
  personalKnowledgeSection: {
    marginBottom: spacing.l,
  },
  personalKnowledgeSectionTitle: {
    fontSize: fontSizes.m,
    fontWeight: 'bold',
    marginBottom: spacing.m,
    paddingHorizontal: spacing.s,
  },
  personalKnowledgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
    paddingHorizontal: spacing.s,
  },
  personalKnowledgeItemText: {
    fontSize: fontSizes.s,
    marginLeft: spacing.m,
    flex: 1,
    lineHeight: scaleHeight(20),
  },
  personalKnowledgeUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: scaleWidth(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: spacing.m,
  },
  personalKnowledgeUploadButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: 'bold',
  },
  personalKnowledgeCloseButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
  },
  personalKnowledgeCloseButtonText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
  }
});

export default AIAssistantScreen;