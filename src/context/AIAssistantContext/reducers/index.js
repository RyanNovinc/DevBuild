// src/context/AIAssistantContext/reducers/index.js
// Reducer function for AI Assistant state management

import { initialState } from '../constants';

/**
 * Main reducer function for AI Assistant context
 * @param {Object} state - Current state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} - New state
 */
export function reducer(state, action) {
  switch (action.type) {
    // Conversation actions
    case 'SET_CONVERSATION_ID':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          conversationId: action.payload,
        },
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: action.payload,
        },
        ui: {
          ...state.ui,
          // Reset the warning flag when messages are reset or very few messages
          conversationSizeWarningShown: action.payload.length <= 1 ? false : state.ui.conversationSizeWarningShown
        }
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: [...state.conversation.messages, action.payload],
        },
      };
    // NEW ACTION: Update an existing message (for streaming)
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          messages: state.conversation.messages.map(msg => 
            msg.id === action.payload.id 
              ? { ...msg, ...action.payload } 
              : msg
          ),
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          isLoading: action.payload,
        },
      };
    case 'SET_INITIALIZING':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          isInitializing: action.payload,
        },
      };
    case 'SET_SHOW_SUGGESTIONS':
      return {
        ...state,
        conversation: {
          ...state.conversation,
          showSuggestions: action.payload,
        },
      };
      
    // Input actions
    case 'SET_INPUT_TEXT':
      return {
        ...state,
        input: {
          ...state.input,
          text: action.payload,
        },
      };
    case 'SET_INPUT_HEIGHT':
      return {
        ...state,
        input: {
          ...state.input,
          height: action.payload,
        },
      };
    case 'SET_KEYBOARD_VISIBLE':
      return {
        ...state,
        input: {
          ...state.input,
          isKeyboardVisible: action.payload,
        },
      };
      
    // Action handling actions
    case 'SET_CURRENT_ACTION':
      return {
        ...state,
        actions: {
          ...state.actions,
          currentAction: action.payload,
        },
      };
    case 'SET_PENDING_ACTIONS':
      return {
        ...state,
        actions: {
          ...state.actions,
          pendingActions: action.payload,
          totalActions: action.payload.length,
        },
      };
    case 'SET_ACTION_PROGRESS':
      return {
        ...state,
        actions: {
          ...state.actions,
          actionProgress: action.payload,
        },
      };
    case 'ADD_COMPLETED_ACTION_ID':
      return {
        ...state,
        actions: {
          ...state.actions,
          completedActionIds: [...state.actions.completedActionIds, action.payload],
        },
      };
    case 'RESET_ACTIONS':
      return {
        ...state,
        actions: {
          currentAction: null,
          pendingActions: [],
          actionProgress: 0,
          totalActions: 0,
          completedActionIds: [],
          newItemIds: {},
        },
      };
      
    // Goal session actions
    case 'UPDATE_GOAL_SESSION':
      return {
        ...state,
        goalSession: {
          ...state.goalSession,
          ...action.payload,
        },
      };
    case 'ADD_CREATED_GOAL':
      return {
        ...state,
        goalSession: {
          ...state.goalSession,
          createdGoals: [...state.goalSession.createdGoals, action.payload],
        },
      };
    case 'RESET_GOAL_SESSION':
      return {
        ...state,
        goalSession: {
          goalIds: {},
          lastGoalId: null,
          lastGoalTitle: null,
          createdGoals: [],
        },
      };
      
    // Knowledge actions
    case 'SET_USER_DOCUMENTS':
      return {
        ...state,
        knowledge: {
          ...state.knowledge,
          userDocuments: action.payload,
        },
      };
    case 'SET_USER_KNOWLEDGE_ENABLED':
      return {
        ...state,
        knowledge: {
          ...state.knowledge,
          userKnowledgeEnabled: action.payload,
        },
      };
      
    // Credits actions
    case 'SET_AI_CREDITS':
      return {
        ...state,
        credits: {
          ...state.credits,
          aiCredits: action.payload,
        },
      };
    case 'SET_SUBSCRIPTION_STATUS':
      return {
        ...state,
        credits: {
          ...state.credits,
          subscriptionStatus: action.payload,
        },
      };
    case 'SET_CREDIT_NOTIFICATIONS_ENABLED':
      return {
        ...state,
        credits: {
          ...state.credits,
          creditNotificationsEnabled: action.payload,
        },
      };
    case 'SET_LOW_CREDIT_THRESHOLD':
      return {
        ...state,
        credits: {
          ...state.credits,
          lowCreditThreshold: action.payload,
        },
      };
    case 'SET_SHOW_CREDIT_WARNING':
      return {
        ...state,
        credits: {
          ...state.credits,
          showCreditWarning: action.payload,
        },
      };
      
    // AI Model tier actions
    case 'SET_AI_MODEL_TIER':
      return {
        ...state,
        aiModel: {
          ...state.aiModel,
          tier: action.payload,
        },
      };
    case 'SET_AVAILABLE_TIERS':
      return {
        ...state,
        aiModel: {
          ...state.aiModel,
          availableTiers: action.payload,
        },
      };
    case 'SET_TIER_CREDITS':
      return {
        ...state,
        aiModel: {
          ...state.aiModel,
          tierCredits: action.payload,
        },
      };
    case 'UPDATE_TIER_CREDIT':
      return {
        ...state,
        aiModel: {
          ...state.aiModel,
          tierCredits: {
            ...state.aiModel.tierCredits,
            [action.payload.tier]: action.payload.credits,
          },
        },
      };
    // Development mode toggle - new action
    case 'SET_DEVELOPMENT_MODE':
      return {
        ...state,
        aiModel: {
          ...state.aiModel,
          developmentMode: action.payload,
        },
      };
      
    // UI actions
    case 'SET_SELECTED_MESSAGE_ID':
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedMessageId: action.payload,
        },
      };
    case 'SET_MENU_STATE':
      return {
        ...state,
        ui: {
          ...state.ui,
          menuState: action.payload,
        },
      };
    case 'SET_MODAL_VISIBILITY':
      return {
        ...state,
        ui: {
          ...state.ui,
          [action.payload.modal]: action.payload.visible,
        },
      };
    case 'SHOW_TOAST':
      return {
        ...state,
        ui: {
          ...state.ui,
          showToast: true,
          toastMessage: action.payload,
        },
      };
    case 'HIDE_TOAST':
      return {
        ...state,
        ui: {
          ...state.ui,
          showToast: false,
        },
      };
    case 'SET_CONVERSATION_SIZE_WARNING_SHOWN':
      return {
        ...state,
        ui: {
          ...state.ui,
          conversationSizeWarningShown: action.payload
        }
      };
      
    // Modal data actions
    case 'SET_CURRENT_GOAL_DATA':
      return {
        ...state,
        modals: {
          ...state.modals,
          currentGoalData: action.payload,
        },
      };
    case 'SET_CURRENT_PROJECT_DATA':
      return {
        ...state,
        modals: {
          ...state.modals,
          currentProjectData: action.payload,
        },
      };
    case 'SET_CURRENT_TIME_BLOCK_DATA':
      return {
        ...state,
        modals: {
          ...state.modals,
          currentTimeBlockData: action.payload,
        },
      };
    case 'SET_CURRENT_TASK_DATA':
      return {
        ...state,
        modals: {
          ...state.modals,
          currentTaskData: action.payload,
        },
      };
    case 'SET_MODAL_VISIBLE':
      return {
        ...state,
        modals: {
          ...state.modals,
          [`${action.payload}ModalVisible`]: true,
        },
      };
    case 'HIDE_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [`${action.payload}ModalVisible`]: false,
        },
      };
    case 'SET_ACTION_SHEET_VISIBLE':
      return {
        ...state,
        modals: {
          ...state.modals,
          actionSheetVisible: action.payload,
        },
      };
      
    // Reset all state
    case 'RESET_STATE':
      return initialState;
      
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}