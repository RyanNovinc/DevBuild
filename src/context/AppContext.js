// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from './NotificationContext';
import { log } from '../utils/LoggerUtility';

// Create deletion-specific logger
const deletionLog = (...args) => log('Deletion', ...args);
import { STANDARD_DOMAINS, getDomainByName, getDomainByIcon } from '../constants/domains';
import { calculateDomainDistribution } from '../utils/domainUtils';
import OnboardingService from '../services/OnboardingService';
import DataIntegrityService from '../services/DataIntegrityService';

// Import the subscription service
import SubscriptionService, { 
  FREE_PLAN_LIMITS, 
  PREMIUM_FEATURES,
  useFeatureLimit
} from '../services/SubscriptionService';
import stateTransactionService from '../services/StateTransactionService';

// Import calendar service
import CalendarService from '../services/CalendarService';

// Import goal progress calculator
import { calculateGoalProgress } from '../utils/GoalProgressCalculator';

const AppContext = createContext();

// Storage keys for app data
const STORAGE_KEYS = {
  GOALS: 'goals',
  MILESTONES: 'milestones',
  TIME_BLOCKS: 'timeBlocks',
  DOMAINS: 'domains',
  SETTINGS: 'settings',
  TAGS: 'tags',
  NOTES: 'notes',
  FILTERS: 'filters',
  USER_PROFILE: 'userProfile',
  TASKS: 'tasks',
  // Add todo storage keys
  TODOS: 'todos',
  TOMORROW_TODOS: 'tomorrowTodos',
  LATER_TODOS: 'laterTodos',
  // Add calendar storage keys
  CALENDAR_SETTINGS: 'calendarSettings',
  CALENDAR_EVENTS: 'calendarEvents',
  // Add custom prompts storage key
  CUSTOM_PROMPTS: 'customPrompts'
};

// Default app settings
const DEFAULT_SETTINGS = {
  onboardingCompleted: false,
  reminderEnabled: true,
  reminderTime: '09:00',
  darkMode: false,
  notificationsEnabled: true,
  kanbanWipLimit: 3, // Default WIP limit for "In Progress" column
  userProfile: {
    name: '',
    email: '',
    bio: '',
    profileImage: null
  }
};

// Provider component
export const AppProvider = ({ children }) => {
  // State
  const [goals, setGoals] = useState([]);
  const [milestones, setMilestonesInternal] = useState([]);
  const [timeBlocks, setTimeBlocks] = useState([]);
  
  // Clean setMilestones function
  const setMilestones = setMilestonesInternal;
  const [domains, setDomains] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState([]);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [milestoneGoalLinkMap, setMilestoneGoalLinkMap] = useState({});
  const [tasks, setTasks] = useState([]);
  
  // Add user purchase status state - 'free' or 'pro' or 'unlimited'
  const [userSubscriptionStatus, setUserSubscriptionStatus] = useState('free');
  
  // Add todo states
  const [todos, setTodos] = useState([]);
  const [tomorrowTodos, setTomorrowTodos] = useState([]);
  const [laterTodos, setLaterTodos] = useState([]);
  
  // Add calendar states
  const [calendarSettings, setCalendarSettings] = useState({
    syncEnabled: false,
    selectedCalendarId: null,
    autoSyncTimeBlocks: true,
    showCalendarEvents: true
  });
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarPermissionStatus, setCalendarPermissionStatus] = useState('undetermined');

  // Add custom prompts state
  const [customPrompts, setCustomPrompts] = useState({
    morning: [],
    evening: []
  });

  // Add user country state
  const [userCountry, setUserCountry] = useState(null);
  
  // Add refresh counter to trigger UI updates
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Keep track of deleted milestone IDs to prevent race conditions
  const deletedMilestoneIds = useRef(new Set());
  // Keep track of operations in progress
  const operationsInProgress = useRef({
    deletingGoals: new Set(),
    deletingMilestones: new Set(),
    updatingMilestones: new Set()
  });
  
  // Add refs to always have latest state
  const goalsRef = useRef(goals);
  const milestonesRef = useRef(milestones);
  const tasksRef = useRef(tasks);
  const todosRef = useRef(todos);
  const tomorrowTodosRef = useRef(tomorrowTodos);
  const laterTodosRef = useRef(laterTodos);
  
  // Update refs when state changes
  useEffect(() => {
    goalsRef.current = goals;
  }, [goals]);
  
  useEffect(() => {
    milestonesRef.current = milestones;
  }, [milestones]);
  
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);
  
  useEffect(() => {
    todosRef.current = todos;
  }, [todos]);
  
  useEffect(() => {
    tomorrowTodosRef.current = tomorrowTodos;
  }, [tomorrowTodos]);
  
  useEffect(() => {
    laterTodosRef.current = laterTodos;
  }, [laterTodos]);

  // Generate additional recurring instances when timeBlocks changes or when app starts
  useEffect(() => {
    if (timeBlocks.length > 0 && !isLoading) {
      // Check for recurring blocks that need more instances every time timeBlocks change
      // Use a timeout to avoid doing this during rapid state updates
      const timer = setTimeout(() => {
        generateAdditionalRecurringInstances();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [timeBlocks, isLoading]);
  
  // Notification context for feedback
  const { showSuccess, showError } = useNotification() || {
    showSuccess: (message) => console.log('Success:', message),
    showError: (message) => console.error('Error:', message)
  };
  
  // Load data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load goals
        const storedGoals = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
        if (storedGoals) {
          const parsedGoals = JSON.parse(storedGoals);
          console.log('[AppContext] Loaded goals from storage:', parsedGoals.map(g => ({ 
            title: g.title, 
            targetDate: g.targetDate, 
            completed: g.completed 
          })));
          setGoals(parsedGoals);
        }
        
        // Load milestones
        const storedMilestones = await AsyncStorage.getItem(STORAGE_KEYS.MILESTONES);
        if (storedMilestones) {
          setMilestones(JSON.parse(storedMilestones));
        }
        
        // Load tasks
        const storedTasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
        
        // Load time blocks
        const storedTimeBlocks = await AsyncStorage.getItem(STORAGE_KEYS.TIME_BLOCKS);
        if (storedTimeBlocks) {
          setTimeBlocks(JSON.parse(storedTimeBlocks));
        }
        
        // Load domains
        const storedDomains = await AsyncStorage.getItem(STORAGE_KEYS.DOMAINS);
        if (storedDomains) {
          setDomains(JSON.parse(storedDomains));
        }
        
        // Load settings
        const storedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (storedSettings) {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
        }
        
        // Load tags
        const storedTags = await AsyncStorage.getItem(STORAGE_KEYS.TAGS);
        if (storedTags) {
          setTags(JSON.parse(storedTags));
        }
        
        // Load notes
        const storedNotes = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
        if (storedNotes) {
          setNotes(JSON.parse(storedNotes));
        }
        
        // Load filters
        const storedFilters = await AsyncStorage.getItem(STORAGE_KEYS.FILTERS);
        if (storedFilters) {
          setFilters(JSON.parse(storedFilters));
        }
        
        // Load milestone-goal link map
        const storedLinkMap = await AsyncStorage.getItem('milestoneGoalLinkMap');
        if (storedLinkMap) {
          setMilestoneGoalLinkMap(JSON.parse(storedLinkMap));
        }
        
        // Load todos
        const storedTodos = await AsyncStorage.getItem(STORAGE_KEYS.TODOS);
        if (storedTodos) {
          setTodos(JSON.parse(storedTodos));
        }
        
        const storedTomorrowTodos = await AsyncStorage.getItem(STORAGE_KEYS.TOMORROW_TODOS);
        if (storedTomorrowTodos) {
          setTomorrowTodos(JSON.parse(storedTomorrowTodos));
        }
        
        const storedLaterTodos = await AsyncStorage.getItem(STORAGE_KEYS.LATER_TODOS);
        if (storedLaterTodos) {
          setLaterTodos(JSON.parse(storedLaterTodos));
        }
        
        // Load calendar settings
        const storedCalendarSettings = await AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_SETTINGS);
        if (storedCalendarSettings) {
          setCalendarSettings(JSON.parse(storedCalendarSettings));
        }
        
        // Load cached calendar events
        const storedCalendarEvents = await AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS);
        if (storedCalendarEvents) {
          setCalendarEvents(JSON.parse(storedCalendarEvents));
        }
        
        // Load custom prompts
        const storedCustomPrompts = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_PROMPTS);
        if (storedCustomPrompts) {
          setCustomPrompts(JSON.parse(storedCustomPrompts));
        }
        
        // Load purchase status (using the original key name for compatibility)
        const storedSubscriptionStatus = await AsyncStorage.getItem('subscriptionStatus');
        if (storedSubscriptionStatus) {
          // Map different status values to our standard ones
          let mappedStatus = storedSubscriptionStatus;
          
          // Map 'founding' to 'pro' for backward compatibility
          if (storedSubscriptionStatus === 'founding') {
            mappedStatus = 'pro';
          }
          
          setUserSubscriptionStatus(mappedStatus);
        }
        
        // Load user country
        const storedUserCountry = await AsyncStorage.getItem('userCountry');
        if (storedUserCountry) {
          setUserCountry(storedUserCountry);
        }
        
        // Check if goals and milestones are linked correctly
        if (storedGoals && storedMilestones) {
          auditMilestoneGoalRelationships(JSON.parse(storedGoals), JSON.parse(storedMilestones));
        }
        
        // Fix any milestone-goal link inconsistencies
        await fixMilestoneGoalLinks();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Helper function to calculate goal progress from milestones
  // Legacy function - use imported calculateGoalProgress for flexible hierarchy support
  const calculateGoalProgressLegacy = useCallback((goalId, currentMilestones = null) => {
    const milestonesToUse = currentMilestones || milestonesRef.current;
    if (!Array.isArray(milestonesToUse)) return 0;
    
    const goalMilestones = milestonesToUse.filter(milestone => milestone.goalId === goalId);
    if (goalMilestones.length === 0) return 0;
    
    // IMPORTANT: Only count milestones that are EXPLICITLY marked as completed
    // Ignore task-based progress (even if it's 100%)
    const completedMilestones = goalMilestones.filter(milestone => 
      milestone.completed === true || milestone.status === 'done'
    ).length;
    
    return Math.round((completedMilestones / goalMilestones.length) * 100);
  }, []);
  
  // Helper function to calculate milestone progress from tasks
  const calculateMilestoneProgress = useCallback((milestoneId, currentTasks = null) => {
    const tasksToUse = currentTasks || tasksRef.current;
    if (!Array.isArray(tasksToUse)) return 0;
    
    // Get the current milestone
    const milestone = milestonesRef.current.find(p => p.id === milestoneId);
    
    // If milestone is already marked as completed, always return 100%
    if (milestone && milestone.status === 'done' && milestone.completed) return 100;
    
    // Calculate based on tasks
    const milestoneTasks = tasksToUse.filter(task => task.milestoneId === milestoneId);
    if (milestoneTasks.length === 0) return 0;
    
    const completedTasks = milestoneTasks.filter(task => task.completed || task.status === 'done').length;
    return Math.round((completedTasks / milestoneTasks.length) * 100);
  }, []);
  
  // Helper function to check if a milestone exists and is not in the deleted list
  const isMilestoneActive = (milestoneId) => {
    if (!milestoneId) return false;
    if (deletedMilestoneIds.current.has(milestoneId)) return false;
    if (operationsInProgress.current.deletingMilestones.has(milestoneId)) return false;
    return Array.isArray(milestones) && milestones.some(milestone => milestone.id === milestoneId);
  };
  
  // Helper function to check if a goal exists
  const isGoalActive = (goalId) => {
    if (!goalId) return false;
    if (operationsInProgress.current.deletingGoals.has(goalId)) return false;
    return Array.isArray(goals) && goals.some(goal => goal.id === goalId);
  };
  
  // Get milestone object safely
  const getMilestone = (milestoneId) => {
    if (!isMilestoneActive(milestoneId)) {
      return null;
    }
    return milestones.find(milestone => milestone.id === milestoneId);
  };
  
  // Helper function to check if a milestone has a parent goal
  const hasParentGoal = (milestoneId) => {
    const milestone = getMilestone(milestoneId);
    if (!milestone) return false;
    
    // Check if milestone has a goalId and if the goal exists
    return !!(milestone.goalId && isGoalActive(milestone.goalId));
  };
  
  // Get parent goal for a milestone (safely)
  const getParentGoal = (milestoneId) => {
    const milestone = getMilestone(milestoneId);
    if (!milestone || !milestone.goalId) return null;
    
    return goals.find(goal => goal.id === milestone.goalId) || null;
  };
  
  // Get all milestones for a goal - IMPROVED to check both goalId and milestoneGoalLinkMap
  const getMilestonesForGoal = (goalId) => {
    // Use current ref to get the latest state including recent completions
    const currentMilestones = milestonesRef.current;
    if (!goalId || !Array.isArray(currentMilestones)) {
      deletionLog(`getMilestonesForGoal: Invalid input - goalId: ${goalId}, milestones array: ${Array.isArray(currentMilestones)}`);
      return [];
    }
    
    // Force log to appear
    log('Error', `🔍 getMilestonesForGoal CALLED: Looking for milestones linked to goal ${goalId}`);
    log('Error', `🔍 getMilestonesForGoal: Total milestones in memory: ${currentMilestones.length}`);
    
    deletionLog(`getMilestonesForGoal: Looking for milestones linked to goal ${goalId}`);
    deletionLog(`getMilestonesForGoal: Total milestones in memory: ${currentMilestones.length}`);
    deletionLog(`getMilestonesForGoal: Deleted milestone IDs: [${Array.from(deletedMilestoneIds.current).join(', ')}]`);
    deletionLog(`getMilestonesForGoal: Milestones in deletion progress: [${Array.from(operationsInProgress.current.deletingMilestones).join(', ')}]`);
    
    // Get milestones linked by goalId property
    const milestonesByProperty = currentMilestones.filter(milestone => {
      const hasGoalId = milestone.goalId === goalId;
      const notDeleted = !deletedMilestoneIds.current.has(milestone.id);
      const notInProgress = !operationsInProgress.current.deletingMilestones.has(milestone.id);
      
      // Log EVERY milestone to see what's going on
      log('Error', `🔍 MILESTONE CHECK: "${milestone.title}" (${milestone.id})`);
      log('Error', `  - goalId: "${milestone.goalId}" (target: "${goalId}")`);
      log('Error', `  - hasGoalId: ${hasGoalId}, notDeleted: ${notDeleted}, notInProgress: ${notInProgress}`);
      
      if (hasGoalId) {
        deletionLog(`getMilestonesForGoal: Milestone "${milestone.title}" (${milestone.id}) - goalId match: ${hasGoalId}, not deleted: ${notDeleted}, not in progress: ${notInProgress}`);
        log('Error', `✅ MATCH: "${milestone.title}" (${milestone.id}) goalId: ${milestone.goalId} === ${goalId}`);
      }
      
      // Also log milestones that have goalIds but don't match
      if (milestone.goalId && milestone.goalId !== goalId) {
        log('Error', `❌ NO MATCH: "${milestone.title}" (${milestone.id}) goalId: ${milestone.goalId} !== ${goalId}`);
      }
      
      return hasGoalId && notDeleted && notInProgress;
    });
    
    deletionLog(`getMilestonesForGoal: Found ${milestonesByProperty.length} milestones by goalId property`);
    
    // Get milestone IDs from the link map
    const milestoneIdsByMap = Object.entries(milestoneGoalLinkMap)
      .filter(([_, linkedGoalId]) => linkedGoalId === goalId)
      .map(([milestoneId]) => milestoneId);
    
    log('Error', `🗺️ LINK MAP CHECK: Found ${milestoneIdsByMap.length} milestone IDs in link map: [${milestoneIdsByMap.join(', ')}]`);
    log('Error', `🗺️ FULL LINK MAP:`, milestoneGoalLinkMap);
    
    deletionLog(`getMilestonesForGoal: Found ${milestoneIdsByMap.length} milestone IDs in link map: [${milestoneIdsByMap.join(', ')}]`);
    
    // Get milestones by IDs from linkMap (that aren't already found by property)
    const milestonesByMap = currentMilestones.filter(milestone => {
      const inLinkMap = milestoneIdsByMap.includes(milestone.id);
      const notAlreadyFound = !milestonesByProperty.some(p => p.id === milestone.id);
      const notDeleted = !deletedMilestoneIds.current.has(milestone.id);
      const notInProgress = !operationsInProgress.current.deletingMilestones.has(milestone.id);
      
      if (inLinkMap) {
        deletionLog(`getMilestonesForGoal: Milestone "${milestone.title}" (${milestone.id}) from link map - not already found: ${notAlreadyFound}, not deleted: ${notDeleted}, not in progress: ${notInProgress}`);
      }
      
      return inLinkMap && notAlreadyFound && notDeleted && notInProgress;
    });
    
    deletionLog(`getMilestonesForGoal: Found ${milestonesByMap.length} additional milestones from link map`);
    
    // Combine both lists
    const allMilestones = [...milestonesByProperty, ...milestonesByMap];
    
    // Force log the result
    log('Error', `🎯 getMilestonesForGoal RESULT: Returning ${allMilestones.length} total milestones for goal ${goalId}`);
    allMilestones.forEach(p => log('Error', `  - "${p.title}" (${p.id})`));
    
    deletionLog(`getMilestonesForGoal: Returning ${allMilestones.length} total milestones for goal ${goalId}`);
    allMilestones.forEach(p => deletionLog(`  - "${p.title}" (${p.id})`));
    
    return allMilestones;
  };
  
  // Get all independent milestones
  const getIndependentMilestones = () => {
    if (!Array.isArray(milestones)) {
      return [];
    }
    return milestones.filter(milestone => 
      !milestone.goalId && 
      !deletedMilestoneIds.current.has(milestone.id) &&
      !operationsInProgress.current.deletingMilestones.has(milestone.id)
    );
  };
  
  // Get all tasks for a milestone
  const getTasksForMilestone = (milestoneId) => {
    if (!milestoneId || !Array.isArray(tasks)) {
      return [];
    }
    return tasks.filter(task => task.milestoneId === milestoneId);
  };

  // NEW FLEXIBLE HIERARCHY FUNCTIONS
  
  // Get standalone milestones (milestones with no goal parent and no tasks)
  const getStandaloneMilestones = () => {
    if (!Array.isArray(milestones)) {
      return [];
    }
    return milestones.filter(milestone => {
      const hasNoGoal = !milestone.goalId || milestone.goalId === null || milestone.goalId === undefined;
      const hasNoTasks = !Array.isArray(tasks) || tasks.filter(task => task.milestoneId === milestone.id).length === 0;
      const notDeleted = !deletedMilestoneIds.current.has(milestone.id);
      const notInProgress = !operationsInProgress.current.deletingMilestones.has(milestone.id);
      
      return hasNoGoal && hasNoTasks && notDeleted && notInProgress;
    });
  };

  // Get standalone tasks (tasks with no goal and no milestone)
  const getStandaloneTasks = () => {
    if (!Array.isArray(tasks)) {
      return [];
    }
    return tasks.filter(task => {
      const hasNoGoal = !task.goalId || task.goalId === null || task.goalId === undefined;
      const hasNoMilestone = !task.milestoneId || task.milestoneId === null || task.milestoneId === undefined;
      
      return hasNoGoal && hasNoMilestone;
    });
  };

  // Get populated standalone milestones (milestones with no goal parent but have tasks)
  // These appear in the "Standalone Tasks" section
  const getPopulatedStandaloneMilestones = () => {
    if (!Array.isArray(milestones)) {
      return [];
    }
    return milestones.filter(milestone => {
      const hasNoGoal = !milestone.goalId || milestone.goalId === null || milestone.goalId === undefined;
      const hasTasks = Array.isArray(tasks) && tasks.filter(task => task.milestoneId === milestone.id).length > 0;
      const notDeleted = !deletedMilestoneIds.current.has(milestone.id);
      const notInProgress = !operationsInProgress.current.deletingMilestones.has(milestone.id);
      
      return hasNoGoal && hasTasks && notDeleted && notInProgress;
    });
  };

  // Get tasks directly under a goal (no milestone parent)
  const getDirectTasksForGoal = (goalId) => {
    if (!goalId || !Array.isArray(tasks)) {
      return [];
    }
    return tasks.filter(task => {
      const hasGoalId = task.goalId === goalId;
      const hasNoMilestone = !task.milestoneId || task.milestoneId === null || task.milestoneId === undefined;
      
      return hasGoalId && hasNoMilestone;
    });
  };

  // Get all tasks for a populated standalone milestone
  const getTasksForPopulatedStandaloneMilestone = (milestoneId) => {
    if (!milestoneId || !Array.isArray(tasks)) {
      return [];
    }
    return tasks.filter(task => task.milestoneId === milestoneId);
  };
  
  // AUDIT: Check milestone-goal relationships for issues
  const auditMilestoneGoalRelationships = (milestonesList, goalsList) => {
    if (!milestonesList || !goalsList) return;
    
    let issuesFound = 0;
    let fixesApplied = 0;
    const updatedMilestones = [...milestonesList];
    const updatedLinkMap = { ...milestoneGoalLinkMap };
    let needsUpdate = false;
    
    // Check each milestone for valid goal references
    milestonesList.forEach((milestone, index) => {
      if (milestone.goalId) {
        const goalExists = goalsList.some(goal => goal.id === milestone.goalId);
        if (!goalExists) {
          console.warn(`Milestone "${milestone.title}" (ID: ${milestone.id}) references nonexistent goal ID: ${milestone.goalId}`);
          
          // Try to fix by goalTitle
          if (milestone.goalTitle) {
            const matchingGoal = goalsList.find(goal => 
              goal.title.toLowerCase() === milestone.goalTitle.toLowerCase()
            );
            
            if (matchingGoal) {
              console.log(`Fixing goal link for milestone "${milestone.title}" - linking to goal "${matchingGoal.title}"`);
              updatedMilestones[index].goalId = matchingGoal.id;
              updatedLinkMap[milestone.id] = matchingGoal.id;
              fixesApplied++;
              needsUpdate = true;
            } else {
              // Clear the invalid goal ID
              updatedMilestones[index].goalId = null;
              delete updatedLinkMap[milestone.id];
              needsUpdate = true;
              issuesFound++;
            }
          }
        } else {
          // Goal exists, but check if goalTitle matches
          const goal = goalsList.find(g => g.id === milestone.goalId);
          if (goal && goal.title !== milestone.goalTitle) {
            console.log(`Fixing mismatched goal title for milestone "${milestone.title}" - should be "${goal.title}"`);
            updatedMilestones[index].goalTitle = goal.title;
            needsUpdate = true;
            fixesApplied++;
          }
        }
      }
    });
    
    // Update milestones and link map if issues were fixed
    if (needsUpdate) {
      console.log(`Applied ${fixesApplied} fixes to milestone-goal relationships`);
      setMilestones(updatedMilestones);
      setMilestoneGoalLinkMap(updatedLinkMap);
      
      // Save updated milestones to AsyncStorage
      AsyncStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(updatedMilestones))
        .then(() => {
          console.log('Fixed milestones saved to AsyncStorage');
        })
        .catch(error => {
          console.error('Error saving fixed milestones:', error);
        });
        
      // Save updated link map
      AsyncStorage.setItem('milestoneGoalLinkMap', JSON.stringify(updatedLinkMap))
        .catch(error => {
          console.error('Error saving link map:', error);
        });
    }
    
    if (issuesFound > 0) {
      console.warn(`Found ${issuesFound} milestone-goal relationship issues that could not be fixed automatically`);
    }
  };
  
  // Save data to AsyncStorage
  const saveData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to AsyncStorage:`, error);
      throw error;
    }
  };
  
  /**
   * Thoroughly cleans AsyncStorage after goal deletion to ensure no orphaned milestones/tasks remain
   * @param {string} goalId - The ID of the deleted goal
   * @param {Array} linkedMilestoneIds - Array of milestone IDs that were linked to this goal
   * @returns {Promise<boolean>} - Success status
   */
  const cleanupAsyncStorageAfterGoalDeletion = async (goalId, linkedMilestoneIds) => {
    try {
      console.log(`Performing thorough AsyncStorage cleanup for goal ${goalId} and ${linkedMilestoneIds.length} linked milestones`);
      
      // 1. Verify goals in AsyncStorage
      const storedGoalsJson = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      if (storedGoalsJson) {
        const storedGoals = JSON.parse(storedGoalsJson);
        // Double-check goal is removed
        const updatedGoals = storedGoals.filter(g => g.id !== goalId);
        if (updatedGoals.length !== storedGoals.length) {
          console.log(`Found and removed goal ${goalId} from AsyncStorage`);
          await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals));
        }
      }
      
      // 2. Clean up milestones in AsyncStorage
      const storedMilestonesJson = await AsyncStorage.getItem(STORAGE_KEYS.MILESTONES);
      if (storedMilestonesJson) {
        const storedMilestones = JSON.parse(storedMilestonesJson);
        
        // Remove all linked milestones AND any milestones still referencing the deleted goal
        const updatedMilestones = storedMilestones.filter(milestone => {
          const isLinkedToDeletedGoal = linkedMilestoneIds.includes(milestone.id);
          const stillReferencesDeletedGoal = milestone.goalId === goalId;
          
          if (isLinkedToDeletedGoal || stillReferencesDeletedGoal) {
            console.log(`Removing milestone "${milestone.title}" (${milestone.id}) from AsyncStorage`);
            return false;
          }
          return true;
        });
        
        if (updatedMilestones.length !== storedMilestones.length) {
          console.log(`Removed ${storedMilestones.length - updatedMilestones.length} milestones from AsyncStorage`);
          await AsyncStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(updatedMilestones));
        }
      }
      
      // 3. Clean up tasks in AsyncStorage
      const storedTasksJson = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (storedTasksJson) {
        const storedTasks = JSON.parse(storedTasksJson);
        
        // Remove all tasks linked to the deleted milestones OR directly to the deleted goal
        const updatedTasks = storedTasks.filter(task => {
          const isFromDeletedMilestone = linkedMilestoneIds.includes(task.milestoneId);
          const isDirectlyLinkedToGoal = task.goalId === goalId;
          
          if (isFromDeletedMilestone || isDirectlyLinkedToGoal) {
            return false;
          }
          return true;
        });
        
        if (updatedTasks.length !== storedTasks.length) {
          console.log(`Removed ${storedTasks.length - updatedTasks.length} tasks from AsyncStorage`);
          await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
        }
      }
      
      // 4. Clean up milestone-goal link map
      const linkMapJson = await AsyncStorage.getItem('milestoneGoalLinkMap');
      if (linkMapJson) {
        const linkMap = JSON.parse(linkMapJson);
        let madeChanges = false;
        
        // Create a new map without the deleted milestones
        const updatedLinkMap = { ...linkMap };
        
        // Remove by linked milestone IDs
        linkedMilestoneIds.forEach(milestoneId => {
          if (updatedLinkMap[milestoneId]) {
            delete updatedLinkMap[milestoneId];
            madeChanges = true;
          }
        });
        
        // Also remove any entries that still reference the deleted goal
        Object.entries(updatedLinkMap).forEach(([milestoneId, linkedGoalId]) => {
          if (linkedGoalId === goalId) {
            delete updatedLinkMap[milestoneId];
            madeChanges = true;
          }
        });
        
        if (madeChanges) {
          console.log(`Updated milestone-goal link map in AsyncStorage`);
          await AsyncStorage.setItem('milestoneGoalLinkMap', JSON.stringify(updatedLinkMap));
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error cleaning up AsyncStorage after goal deletion:", error);
      return false;
    }
  };
  
  // Todo Management Functions
  
  // Add a new todo
  const addTodo = async (todoData) => {
    try {
      const tab = todoData.tab || 'today';
      const newTodo = {
        id: todoData.id || `todo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        title: todoData.title,
        completed: todoData.completed || false,
        createdAt: todoData.createdAt || new Date().toISOString(),
        updatedAt: todoData.updatedAt || new Date().toISOString(),
        groupId: todoData.groupId || null,
        isGroup: todoData.isGroup || false,
        ...todoData
      };
      
      let updatedList;
      let storageKey;
      
      switch (tab) {
        case 'today':
          updatedList = [...todosRef.current, newTodo];
          setTodos(updatedList);
          storageKey = STORAGE_KEYS.TODOS;
          break;
          
        case 'tomorrow':
          updatedList = [...tomorrowTodosRef.current, newTodo];
          setTomorrowTodos(updatedList);
          storageKey = STORAGE_KEYS.TOMORROW_TODOS;
          break;
          
        case 'later':
          updatedList = [...laterTodosRef.current, newTodo];
          setLaterTodos(updatedList);
          storageKey = STORAGE_KEYS.LATER_TODOS;
          break;
          
        default:
          throw new Error(`Invalid tab: ${tab}`);
      }
      
      // Save to AsyncStorage
      await saveData(storageKey, updatedList);
      
      console.log(`[AppContext] Added todo "${newTodo.title}" to ${tab} tab`);
      return newTodo;
    } catch (error) {
      console.error('[AppContext] Error adding todo:', error);
      showError('Failed to add todo');
      throw error;
    }
  };
  
  // Update todos for a specific tab
  const updateTodos = async (updatedList, tab = 'today') => {
    try {
      let storageKey;
      
      switch (tab) {
        case 'today':
          setTodos(updatedList);
          storageKey = STORAGE_KEYS.TODOS;
          break;
          
        case 'tomorrow':
          setTomorrowTodos(updatedList);
          storageKey = STORAGE_KEYS.TOMORROW_TODOS;
          break;
          
        case 'later':
          setLaterTodos(updatedList);
          storageKey = STORAGE_KEYS.LATER_TODOS;
          break;
          
        default:
          throw new Error(`Invalid tab: ${tab}`);
      }
      
      // Save to AsyncStorage
      await saveData(storageKey, updatedList);
      
      console.log(`[AppContext] Updated ${tab} todos list with ${updatedList.length} items`);
      return true;
    } catch (error) {
      console.error('[AppContext] Error updating todos:', error);
      showError('Failed to update todos');
      throw error;
    }
  };
  
  // Delete a todo
  const deleteTodo = async (todoId, tab = 'today') => {
    try {
      let currentList;
      let setListFunc;
      let storageKey;
      
      switch (tab) {
        case 'today':
          currentList = todosRef.current;
          setListFunc = setTodos;
          storageKey = STORAGE_KEYS.TODOS;
          break;
          
        case 'tomorrow':
          currentList = tomorrowTodosRef.current;
          setListFunc = setTomorrowTodos;
          storageKey = STORAGE_KEYS.TOMORROW_TODOS;
          break;
          
        case 'later':
          currentList = laterTodosRef.current;
          setListFunc = setLaterTodos;
          storageKey = STORAGE_KEYS.LATER_TODOS;
          break;
          
        default:
          throw new Error(`Invalid tab: ${tab}`);
      }
      
      // Find the todo to check if it's a group
      const todoToDelete = currentList.find(todo => todo.id === todoId);
      
      if (todoToDelete && todoToDelete.isGroup) {
        // If it's a group, delete the group and all its children
        const updatedList = currentList.filter(item => 
          item.id !== todoId && item.groupId !== todoId
        );
        setListFunc(updatedList);
        await saveData(storageKey, updatedList);
        console.log(`[AppContext] Deleted todo group "${todoToDelete.title}" and its children from ${tab}`);
      } else {
        // Delete individual todo
        const updatedList = currentList.filter(todo => todo.id !== todoId);
        setListFunc(updatedList);
        await saveData(storageKey, updatedList);
        console.log(`[AppContext] Deleted todo from ${tab}`);
      }
      
      return true;
    } catch (error) {
      console.error('[AppContext] Error deleting todo:', error);
      showError('Failed to delete todo');
      throw error;
    }
  };
  
  // Toggle todo completion
  const toggleTodo = async (todoId, tab = 'today') => {
    try {
      let currentList;
      let setListFunc;
      let storageKey;
      
      switch (tab) {
        case 'today':
          currentList = todosRef.current;
          setListFunc = setTodos;
          storageKey = STORAGE_KEYS.TODOS;
          break;
          
        case 'tomorrow':
          currentList = tomorrowTodosRef.current;
          setListFunc = setTomorrowTodos;
          storageKey = STORAGE_KEYS.TOMORROW_TODOS;
          break;
          
        case 'later':
          currentList = laterTodosRef.current;
          setListFunc = setLaterTodos;
          storageKey = STORAGE_KEYS.LATER_TODOS;
          break;
          
        default:
          throw new Error(`Invalid tab: ${tab}`);
      }
      
      const todoItem = currentList.find(item => item.id === todoId);
      
      if (!todoItem) {
        throw new Error(`Todo with id ${todoId} not found in ${tab}`);
      }
      
      let updatedList;
      
      // If toggling a group
      if (todoItem.isGroup) {
        const childTodos = currentList.filter(item => item.groupId === todoId);
        
        if (childTodos.length > 0) {
          const allCompleted = childTodos.every(todo => todo.completed);
          
          updatedList = currentList.map(item => {
            if (item.id === todoId) {
              // Toggle the group itself
              return { ...item, completed: !allCompleted };
            } else if (item.groupId === todoId) {
              // Toggle all items in the group
              return { ...item, completed: !allCompleted };
            }
            return item;
          });
        } else {
          // If the group has no children, just toggle the group itself
          updatedList = currentList.map(item => 
            item.id === todoId ? { ...item, completed: !item.completed } : item
          );
        }
      } else {
        // Toggle individual todo
        updatedList = currentList.map(item => 
          item.id === todoId ? { ...item, completed: !item.completed } : item
        );
        
        // If it belongs to a group, update the group status
        if (todoItem.groupId) {
          const groupTodos = updatedList.filter(item => item.groupId === todoItem.groupId);
          const allCompleted = groupTodos.length > 0 && groupTodos.every(todo => todo.completed);
          
          updatedList = updatedList.map(item => 
            item.id === todoItem.groupId ? { ...item, completed: allCompleted } : item
          );
        }
      }
      
      setListFunc(updatedList);
      await saveData(storageKey, updatedList);
      
      console.log(`[AppContext] Toggled todo completion for "${todoItem.title}" in ${tab}`);
      return true;
    } catch (error) {
      console.error('[AppContext] Error toggling todo:', error);
      showError('Failed to update todo');
      throw error;
    }
  };
  
  // Custom Prompt functions
  const addCustomPrompt = async (type, promptText) => {
    try {
      const promptId = Date.now().toString();
      const newPrompt = {
        id: promptId,
        question: promptText,
        placeholder: "Your thoughts...",
        field: type === 'morning' ? 'morningCustom' : 'eveningCustom',
        createdAt: new Date().toISOString()
      };

      const updatedCustomPrompts = {
        ...customPrompts,
        [type]: [...customPrompts[type], newPrompt]
      };

      setCustomPrompts(updatedCustomPrompts);
      await saveData(STORAGE_KEYS.CUSTOM_PROMPTS, updatedCustomPrompts);
      
      console.log(`[AppContext] Added custom ${type} prompt:`, promptText);
      return newPrompt;
    } catch (error) {
      console.error('[AppContext] Error adding custom prompt:', error);
      showError('Failed to add custom prompt');
      throw error;
    }
  };

  const updateCustomPrompt = async (type, promptId, promptText) => {
    try {
      const updatedCustomPrompts = {
        ...customPrompts,
        [type]: customPrompts[type].map(prompt =>
          prompt.id === promptId
            ? { ...prompt, question: promptText, updatedAt: new Date().toISOString() }
            : prompt
        )
      };

      setCustomPrompts(updatedCustomPrompts);
      await saveData(STORAGE_KEYS.CUSTOM_PROMPTS, updatedCustomPrompts);
      
      console.log(`[AppContext] Updated custom ${type} prompt:`, promptText);
      return true;
    } catch (error) {
      console.error('[AppContext] Error updating custom prompt:', error);
      showError('Failed to update custom prompt');
      throw error;
    }
  };

  const deleteCustomPrompt = async (type, promptId) => {
    try {
      const updatedCustomPrompts = {
        ...customPrompts,
        [type]: customPrompts[type].filter(prompt => prompt.id !== promptId)
      };

      setCustomPrompts(updatedCustomPrompts);
      await saveData(STORAGE_KEYS.CUSTOM_PROMPTS, updatedCustomPrompts);
      
      console.log(`[AppContext] Deleted custom ${type} prompt:`, promptId);
      return true;
    } catch (error) {
      console.error('[AppContext] Error deleting custom prompt:', error);
      showError('Failed to delete custom prompt');
      throw error;
    }
  };

  const getCustomPromptsForType = (type) => {
    return customPrompts[type] || [];
  };
  
  // Check if user can add more goals
  const canAddMoreGoals = () => {
    // Pro users have unlimited goals
    if (userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited') {
      return true;
    }
    
    // Free users are limited
    const activeGoals = Array.isArray(goalsRef.current) 
      ? goalsRef.current.filter(goal => !goal.completed).length 
      : 0;
    
    return activeGoals < FREE_PLAN_LIMITS.MAX_GOALS;
  };
  
  // Check if user can add more milestones to a goal
  const canAddMoreMilestonesToGoal = (goalId) => {
    // Pro users have unlimited milestones
    if (userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited') {
      return true;
    }
    
    // Free users are limited to X milestones per goal
    const milestonesForGoal = getMilestonesForGoal(goalId);
    return milestonesForGoal.length < FREE_PLAN_LIMITS.MAX_MILESTONES;
  };
  
  // Check if user can add more tasks to a milestone
  const canAddMoreTasksToMilestone = (milestoneId) => {
    // Pro users have unlimited tasks
    if (userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited') {
      return true;
    }
    
    // Free users are limited to X tasks per milestone
    const milestoneTasks = getTasksForMilestone(milestoneId);
    return milestoneTasks.length < FREE_PLAN_LIMITS.MAX_TASKS_PER_MILESTONE;
  };
  
  // Check if user can add more time blocks for this week
  const canAddMoreTimeBlocks = () => {
    // Pro users have unlimited time blocks
    if (userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited') {
      return true;
    }
    
    // Get time blocks for current week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Filter time blocks for current week
    const thisWeekBlocks = Array.isArray(timeBlocks) 
      ? timeBlocks.filter(block => {
          const blockDate = new Date(block.startTime);
          return blockDate >= startOfWeek && blockDate <= endOfWeek;
        })
      : [];
    
    return thisWeekBlocks.length < FREE_PLAN_LIMITS.MAX_TIME_BLOCKS;
  };
  
  // Count time blocks for the current week
  const countTimeBlocksThisWeek = () => {
    // Get time blocks for current week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Filter time blocks for current week
    const thisWeekBlocks = Array.isArray(timeBlocks) 
      ? timeBlocks.filter(block => {
          const blockDate = new Date(block.startTime);
          return blockDate >= startOfWeek && blockDate <= endOfWeek;
        })
      : [];
    
    return thisWeekBlocks.length;
  };

  // IMPROVED: Domain normalization function
  const normalizeDomain = (item) => {
    if (!item) return item;
    
    // Create a copy to avoid mutating the original
    const normalized = { ...item };
    
    // Find domain information based on item properties
    let domainName = null;
    let domainIcon = null;
    let domainColor = null;
    
    // Priority 1: Check for explicit domain name
    if (normalized.domain) {
      const matchedDomain = getDomainByName(normalized.domain);
      
      if (matchedDomain) {
        // Found a standard domain match - use all its properties
        domainName = matchedDomain.name; // Use exact case from standard domains
        domainIcon = matchedDomain.icon;
        domainColor = matchedDomain.color;
      } else {
        // Non-standard domain - keep as is but try to determine icon/color
        domainName = normalized.domain;
        
        // Try to find a domain with matching icon if we have an icon
        if (normalized.icon) {
          const domainWithIcon = STANDARD_DOMAINS.find(d => d.icon === normalized.icon);
          if (domainWithIcon) {
            domainIcon = domainWithIcon.icon;
            domainColor = normalized.color || domainWithIcon.color;
          }
        }
      }
    }
    
    // Priority 2: If no domain found by name, try by icon
    if (!domainName && normalized.icon) {
      const domainFromIcon = getDomainByIcon(normalized.icon);
      if (domainFromIcon) {
        const matchedDomain = getDomainByName(domainFromIcon);
        if (matchedDomain) {
          domainName = matchedDomain.name;
          domainIcon = matchedDomain.icon;
          domainColor = normalized.color || matchedDomain.color;
        }
      }
    }
    
    // Priority 3: If still no domain found, set default as "Other"
    if (!domainName) {
      const otherDomain = STANDARD_DOMAINS.find(d => d.name === "Other");
      if (otherDomain) {
        domainName = "Other";
        domainIcon = otherDomain.icon;
        domainColor = normalized.color || otherDomain.color;
      }
    }
    
    // Update the object with normalized values
    normalized.domain = domainName;
    normalized.domainName = domainName; // Set both for backward compatibility
    
    // Only set icon if missing or if we have a standard icon for this domain
    if (!normalized.icon && domainIcon) {
      normalized.icon = domainIcon;
    }
    
    // Only set color if missing or if we have a standard color for this domain
    if (!normalized.color && domainColor) {
      normalized.color = domainColor;
    }
    
    return normalized;
  };
  
  // Add a goal - UPDATED WITH DOMAIN NORMALIZATION, REFRESH COUNTER, AND SUBSCRIPTION CHECK
  const addGoal = async (newGoal) => {
    try {
      // Check if user can add more goals
      if (!canAddMoreGoals()) {
        showError(`Free version limited to ${FREE_PLAN_LIMITS.MAX_GOALS} active goals. Complete a goal or upgrade to Pro.`);
        return null;
      }
      
      // Apply domain normalization
      const normalizedGoal = normalizeDomain(newGoal);
      
      // Update the goals state
      setGoals(prevGoals => [...prevGoals, normalizedGoal]);
      
      // Save to AsyncStorage
      const updatedGoals = [...goals, normalizedGoal];
      await saveData(STORAGE_KEYS.GOALS, updatedGoals);
      
      // Increment the refresh counter to trigger UI updates
      setRefreshCounter(prev => prev + 1);
      
      return normalizedGoal;
    } catch (error) {
      console.error('Error adding goal:', error);
      showError('Failed to add goal');
      throw error;
    }
  };
  
  // Update a goal - UPDATED WITH DOMAIN NORMALIZATION, PROGRESS RECALCULATION, AND REFRESH COUNTER
  const updateGoal = async (updatedGoal) => {
    try {
      // Check if goal exists
      const goalExists = isGoalActive(updatedGoal.id);
      if (!goalExists) {
        console.warn(`Goal with ID ${updatedGoal.id} not found, cannot update`);
        showError('Goal not found');
        return;
      }
      
      // Apply domain normalization
      const normalizedGoal = normalizeDomain(updatedGoal);
      
      // Recalculate progress from milestones, but preserve manual completion
      const calculatedProgress = calculateGoalProgress(normalizedGoal.id);
      // If goal is manually marked as completed, keep it at 100%, otherwise use calculated progress
      normalizedGoal.progress = normalizedGoal.completed ? 100 : calculatedProgress;
      
      // Update the goals state
      setGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === normalizedGoal.id ? normalizedGoal : goal
        )
      );
      
      // Save to AsyncStorage
      const updatedGoals = goals.map(goal => 
        goal.id === normalizedGoal.id ? normalizedGoal : goal
      );
      await saveData(STORAGE_KEYS.GOALS, updatedGoals);
      
      // Also update any milestones associated with this goal
      updateMilestonesForGoal(normalizedGoal);
      
      // Increment the refresh counter to trigger UI updates
      setRefreshCounter(prev => prev + 1);
      
      return normalizedGoal;
    } catch (error) {
      console.error('Error updating goal:', error);
      showError('Failed to update goal');
      throw error;
    }
  };
  
  // Update milestones when goal changes
  const updateMilestonesForGoal = async (updatedGoal) => {
    // Check if any milestones are linked to this goal
    const linkedMilestones = getMilestonesForGoal(updatedGoal.id);
    
    if (linkedMilestones.length > 0) {
      // Use current ref to get the latest state including recent completions
      const currentMilestones = milestonesRef.current;
      const updatedMilestones = currentMilestones.map(milestone => {
        if (milestone.goalId === updatedGoal.id) {
          // Update the goalTitle and inherit domain/color
          // CRITICAL: Preserve all existing milestone properties, especially status, completed, and progress
          return {
            ...milestone,
            goalTitle: updatedGoal.title,
            domain: updatedGoal.domain || milestone.domain,
            color: updatedGoal.color || milestone.color,
            // Explicitly preserve completion status
            status: milestone.status,
            completed: milestone.completed,
            progress: milestone.progress
          };
        }
        return milestone;
      });
      
      // Update milestones state
      setMilestones(updatedMilestones);
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
      console.log(`Updated ${linkedMilestones.length} milestones associated with goal "${updatedGoal.title}"`);
    }
  };
  
  // Delete a goal - COMPREHENSIVE DELETION using LegacyDataCleanupService approach
  const deleteGoal = async (goalId) => {
    try {
      // Check if already in progress
      if (operationsInProgress.current.deletingGoals.has(goalId)) {
        console.log(`Goal ${goalId} is already being deleted, ignoring duplicate request`);
        return false;
      }
      
      // Mark as in progress
      operationsInProgress.current.deletingGoals.add(goalId);
      
      // Get the goal for logging
      const goalToDelete = goalsRef.current.find(goal => goal.id === goalId);
      const goalTitle = goalToDelete?.title || 'Unknown goal';
      
      if (!goalToDelete) {
        console.warn(`Goal with ID ${goalId} not found, it may have already been deleted`);
        return false;
      }
      
      log('Error', `🔥 COMPREHENSIVE DELETION STARTED: Goal "${goalTitle}" (ID: ${goalId})`);
      
      // STEP 1: Get current state from refs (not storage)
      const currentGoals = [...goalsRef.current];
      const currentMilestones = [...milestonesRef.current]; 
      const currentTasks = [...tasksRef.current];
      const currentLinkMap = { ...milestoneGoalLinkMap };
      
      log('Error', `📊 BEFORE DELETION: Goals: ${currentGoals.length}, Milestones: ${currentMilestones.length}, Tasks: ${currentTasks.length}`);
      
      // STEP 2: Remove the goal
      const updatedGoals = currentGoals.filter(goal => goal.id !== goalId);
      
      // STEP 3: Create valid goals set for comprehensive cleanup (like LegacyDataCleanupService)
      const validGoalIds = new Set(updatedGoals.map(g => g.id));
      log('Error', `🎯 VALID GOALS AFTER DELETION: [${Array.from(validGoalIds).join(', ')}]`);
        
      // STEP 4: Remove ONLY milestones linked to the deleted goal (keep standalone milestones)
      const validMilestones = currentMilestones.filter(milestone => {
        // Keep standalone milestones (no goalId) and milestones linked to remaining valid goals
        const isStandalone = !milestone.goalId || milestone.goalId === null || milestone.goalId === undefined;
        const hasValidGoal = milestone.goalId && validGoalIds.has(milestone.goalId);
        const shouldKeep = isStandalone || hasValidGoal;
        
        if (!shouldKeep) {
          log('Error', `🗑️ REMOVING MILESTONE LINKED TO DELETED GOAL: "${milestone.title}" (goalId: ${milestone.goalId})`);
        } else if (isStandalone) {
          log('Error', `✅ KEEPING STANDALONE MILESTONE: "${milestone.title}"`);
        } else {
          log('Error', `✅ KEEPING MILESTONE WITH VALID GOAL: "${milestone.title}" (goalId: ${milestone.goalId})`);
        }
        return shouldKeep;
      });
      
      // STEP 5: Remove ALL orphaned tasks (tasks without valid milestones) - COMPREHENSIVE APPROACH  
      const validMilestoneIds = new Set(validMilestones.map(p => p.id));
      log('Error', `🎯 VALID MILESTONES AFTER CLEANUP: [${Array.from(validMilestoneIds).join(', ')}]`);
      
      const validTasks = currentTasks.filter(task => {
        // Keep standalone tasks (no milestoneId/goalId) and tasks linked to remaining valid milestones/goals  
        const isStandaloneTask = (!task.milestoneId || task.milestoneId === null || task.milestoneId === undefined) && 
                                (!task.goalId || task.goalId === null || task.goalId === undefined);
        const hasValidMilestone = task.milestoneId && validMilestoneIds.has(task.milestoneId);
        const hasValidGoal = task.goalId && validGoalIds.has(task.goalId);
        const shouldKeep = isStandaloneTask || hasValidMilestone || hasValidGoal;
        
        if (!shouldKeep) {
          log('Error', `🗑️ REMOVING TASK LINKED TO DELETED GOAL: "${task.name || task.title}" (goalId: ${task.goalId}, milestoneId: ${task.milestoneId})`);
        } else if (isStandaloneTask) {
          log('Error', `✅ KEEPING STANDALONE TASK: "${task.name || task.title}"`);
        } else {
          log('Error', `✅ KEEPING TASK WITH VALID PARENT: "${task.name || task.title}"`);
        }
        return shouldKeep;
      });
      
      // STEP 6: Clean up link map - remove all invalid entries
      const cleanedLinkMap = {};
      Object.entries(currentLinkMap).forEach(([milestoneId, linkedGoalId]) => {
        const milestoneExists = validMilestoneIds.has(milestoneId);
        const goalExists = validGoalIds.has(linkedGoalId);
        
        if (milestoneExists && goalExists) {
          cleanedLinkMap[milestoneId] = linkedGoalId;
        } else {
          log('Error', `🗑️ REMOVING INVALID LINK: ${milestoneId} -> ${linkedGoalId}`);
        }
      });
      
      // STEP 7: Calculate cleanup summary
      const milestonesRemoved = currentMilestones.length - validMilestones.length;
      const tasksRemoved = currentTasks.length - validTasks.length;
      const linkMapEntriesRemoved = Object.keys(currentLinkMap).length - Object.keys(cleanedLinkMap).length;
      
      log('Error', `📈 CLEANUP SUMMARY:`);
      log('Error', `  - Removed 1 goal: "${goalTitle}"`);
      log('Error', `  - Removed ${milestonesRemoved} orphaned milestones`);
      log('Error', `  - Removed ${tasksRemoved} orphaned tasks`);
      log('Error', `  - Removed ${linkMapEntriesRemoved} invalid link map entries`);
      
      // STEP 8: Update all state and storage atomically
      setGoals(updatedGoals);
      setMilestones(validMilestones);
      setTasks(validTasks);
      setMilestoneGoalLinkMap(cleanedLinkMap);
      
      // STEP 9: Save all cleaned data to storage in parallel
      await Promise.all([
        saveData(STORAGE_KEYS.GOALS, updatedGoals),
        saveData(STORAGE_KEYS.MILESTONES, validMilestones),  
        saveData(STORAGE_KEYS.TASKS, validTasks),
        saveData('milestoneGoalLinkMap', cleanedLinkMap)
      ]);
      
      log('Error', `💾 ALL DATA SAVED TO STORAGE`);
      
      // STEP 10: Force refresh to ensure UI consistency
      await refreshData();
      
      // Final verification
      log('Error', `🏁 COMPREHENSIVE DELETION COMPLETED`);
      log('Error', `📊 AFTER DELETION: Goals: ${updatedGoals.length}, Milestones: ${validMilestones.length}, Tasks: ${validTasks.length}`);
      
      // Increment refresh counter to trigger UI updates
      setRefreshCounter(prev => prev + 1);
      
      showSuccess(`Goal "${goalTitle}" and all orphaned data deleted successfully`);
      return true;
      
    } catch (error) {
      console.error('Error in comprehensive goal deletion:', error);
      showError('Failed to delete goal');
      return false;
    } finally {
      // Clear operation tracking
      setTimeout(() => {
        operationsInProgress.current.deletingGoals.delete(goalId);
      }, 1000);
    }
  };
  
  // Add a milestone/milestone - UPDATED FOR FLEXIBLE HIERARCHY (goalId now optional)
  const addMilestone = async (newMilestone) => {
    try {
      // Check subscription limits only if attached to a goal
      if (newMilestone.goalId && !canAddMoreMilestonesToGoal(newMilestone.goalId)) {
        showError(`Free version limited to ${FREE_PLAN_LIMITS.MAX_MILESTONES} milestones per goal. Complete a milestone or upgrade to Pro.`);
        return null;
      }
      
      // Verify goal relationship ONLY if goalId is provided (now optional)
      if (newMilestone.goalId) {
        const goalExists = isGoalActive(newMilestone.goalId);
        
        if (!goalExists) {
          console.warn(`Milestone references nonexistent goal ID: ${newMilestone.goalId}`);
          
          // Try to find by goalTitle
          if (newMilestone.goalTitle) {
            const matchingGoal = goals.find(goal => 
              goal.title.toLowerCase() === newMilestone.goalTitle.toLowerCase()
            );
            
            if (matchingGoal) {
              console.log(`Found goal by title: "${matchingGoal.title}"`);
              newMilestone.goalId = matchingGoal.id;
              newMilestone.goalTitle = matchingGoal.title;
              
              // Inherit domain and color from goal
              newMilestone.domain = matchingGoal.domain || newMilestone.domain;
              newMilestone.color = matchingGoal.color || newMilestone.color;
            } else {
              // No matching goal found, create as standalone milestone
              console.warn(`No goal found matching title "${newMilestone.goalTitle}" - creating standalone milestone`);
              delete newMilestone.goalId;
              delete newMilestone.goalTitle;
            }
          } else {
            // No goalTitle to match with, create as standalone milestone
            delete newMilestone.goalId;
            console.log('Creating standalone milestone (no goal parent)');
          }
        } else {
          // Goal exists, ensure we have the correct title and inherit domain/color
          const linkedGoal = goals.find(goal => goal.id === newMilestone.goalId);
          newMilestone.goalTitle = linkedGoal.title;
          
          // Inherit domain and color if not already set
          if (!newMilestone.domain && linkedGoal.domain) {
            newMilestone.domain = linkedGoal.domain;
          }
          if (!newMilestone.color && linkedGoal.color) {
            newMilestone.color = linkedGoal.color;
          }
        }
      } else {
        // Creating standalone milestone - no goal parent required
        console.log('Creating standalone milestone (goalId not provided)');
      }
      
      // Calculate initial progress from tasks if any
      if (newMilestone.tasks && Array.isArray(newMilestone.tasks)) {
        const completedTasks = newMilestone.tasks.filter(task => task.completed || task.status === 'done').length;
        newMilestone.progress = newMilestone.tasks.length > 0 
          ? Math.round((completedTasks / newMilestone.tasks.length) * 100) 
          : 0;
      } else {
        newMilestone.progress = 0;
      }
      
      // Generate unique ID if not provided
      if (!newMilestone.id) {
        newMilestone.id = `milestone_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }

      // Now apply domain normalization
      const normalizedMilestone = normalizeDomain(newMilestone);
      
      // Update the milestones state
      setMilestones(prevMilestones => [...prevMilestones, normalizedMilestone]);
      
      // Save to AsyncStorage
      const updatedMilestones = [...milestones, normalizedMilestone];
      await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
      
      // Also update the milestone-goal link map
      if (normalizedMilestone.goalId) {
        const updatedLinkMap = {
          ...milestoneGoalLinkMap,
          [normalizedMilestone.id]: normalizedMilestone.goalId
        };
        setMilestoneGoalLinkMap(updatedLinkMap);
        
        // Save link map to AsyncStorage
        await saveData('milestoneGoalLinkMap', updatedLinkMap);
        
        // Update goal progress
        await updateGoalProgressFromMilestones(normalizedMilestone.goalId);
      }
      
      return normalizedMilestone;
    } catch (error) {
      console.error('Error adding milestone:', error);
      showError('Failed to add milestone');
      throw error;
    }
  };
  
  // Update a milestone - UPDATED TO PRESERVE PROGRESS AND STATUS SEPARATION
  const updateMilestone = async (updatedMilestone) => {
    try {
      // Check if in progress
      if (operationsInProgress.current.updatingMilestones.has(updatedMilestone.id)) {
        console.log(`Milestone ${updatedMilestone.id} is already being updated, ignoring duplicate request`);
        return null;
      }
      
      // Mark as in progress
      operationsInProgress.current.updatingMilestones.add(updatedMilestone.id);
      
      // Check if milestone exists
      if (!isMilestoneActive(updatedMilestone.id)) {
        console.warn(`Milestone with ID ${updatedMilestone.id} not found, unable to update`);
        showError('Milestone not found');
        return null;
      }
      
      // Apply domain normalization
      const normalizedMilestone = normalizeDomain(updatedMilestone);
      
      // Get original milestone
      const originalMilestone = milestones.find(p => p.id === normalizedMilestone.id);
      
      // Recalculate progress from tasks if flag is set
      if (normalizedMilestone.recalculateProgress) {
        const calculatedProgress = calculateMilestoneProgress(normalizedMilestone.id);
        normalizedMilestone.progress = calculatedProgress;
        delete normalizedMilestone.recalculateProgress; // Remove flag
      }
      
      // IMPORTANT: Preserve status in certain conditions
      // If the client didn't explicitly try to change the status, 
      // we should keep it as it was
      if (!normalizedMilestone.status && originalMilestone && originalMilestone.status) {
        normalizedMilestone.status = originalMilestone.status;
      }
      
      // Make sure "completed" flag is synchronized with "done" status
      if (normalizedMilestone.status === 'done') {
        normalizedMilestone.completed = true;
      }
      
      // Verify goal if specified
      if (normalizedMilestone.goalId && !isGoalActive(normalizedMilestone.goalId)) {
        console.warn(`Milestone references nonexistent goal ID: ${normalizedMilestone.goalId}`);
        // Make this milestone independent if goal doesn't exist
        normalizedMilestone.goalId = null;
        normalizedMilestone.goalTitle = null;
      } else if (normalizedMilestone.goalId) {
        // Update goal title to match goal
        const goal = goals.find(g => g.id === normalizedMilestone.goalId);
        if (goal) {
          normalizedMilestone.goalTitle = goal.title;
        }
      }
      
      // Get the old milestone to check if goalId changed
      const oldMilestone = milestones.find(p => p.id === normalizedMilestone.id);
      const goalIdChanged = oldMilestone && oldMilestone.goalId !== normalizedMilestone.goalId;
      
      // Update the milestones state
      setMilestones(prevMilestones => 
        prevMilestones.map(milestone => 
          milestone.id === normalizedMilestone.id ? normalizedMilestone : milestone
        )
      );
      
      // Save to AsyncStorage
      const updatedMilestones = milestones.map(milestone => 
        milestone.id === normalizedMilestone.id ? normalizedMilestone : milestone
      );
      await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
      
      // Update the milestone-goal link map if goalId changed
      if (normalizedMilestone.goalId) {
        const updatedLinkMap = {
          ...milestoneGoalLinkMap,
          [normalizedMilestone.id]: normalizedMilestone.goalId
        };
        setMilestoneGoalLinkMap(updatedLinkMap);
        
        // Save link map to AsyncStorage
        await saveData('milestoneGoalLinkMap', updatedLinkMap);
      } else if (milestoneGoalLinkMap[normalizedMilestone.id]) {
        // Remove from map if goalId is gone
        const updatedLinkMap = { ...milestoneGoalLinkMap };
        delete updatedLinkMap[normalizedMilestone.id];
        setMilestoneGoalLinkMap(updatedLinkMap);
        
        // Save link map to AsyncStorage
        await saveData('milestoneGoalLinkMap', updatedLinkMap);
      }
      
      // Update goal progress if goal is linked or if goal changed
      if (normalizedMilestone.goalId) {
        await updateGoalProgressFromMilestones(normalizedMilestone.goalId);
      }
      
      // If goal changed, also update the old goal's progress
      if (goalIdChanged && oldMilestone?.goalId) {
        await updateGoalProgressFromMilestones(oldMilestone.goalId);
      }
      
      return normalizedMilestone;
    } catch (error) {
      console.error('Error updating milestone:', error);
      showError('Failed to update milestone');
      return null;
    } finally {
      // Clear operation tracking
      setTimeout(() => {
        operationsInProgress.current.updatingMilestones.delete(updatedMilestone.id);
      }, 500);
    }
  };
  
  // NEW: Function to update goal progress from its milestones
  const updateGoalProgressFromMilestones = async (goalId) => {
    try {
      if (!goalId) return;
      
      const goal = goalsRef.current.find(g => g.id === goalId);
      if (!goal) return;
      
      const calculatedProgress = calculateGoalProgress(goalId, milestonesRef.current, tasksRef.current);
      
      // Don't override manually completed goals
      if (goal.completed) {
        console.log(`[AppContext] Goal "${goal.title}" is manually completed, preserving 100% progress`);
        return;
      }
      
      // Don't update goals that were manually updated recently
      if (goal.updatedAt) {
        const lastUpdate = new Date(goal.updatedAt).getTime();
        const now = Date.now();
        // If goal was manually updated in the last 2 seconds, don't override it
        if (now - lastUpdate < 2000) {
          console.log(`[AppContext] Goal "${goal.title}" was manually updated recently, skipping auto-update`);
          return;
        }
      }
      
      if (goal.progress !== calculatedProgress) {
        console.log(`[AppContext] Updating goal "${goal.title}" progress from ${goal.progress}% to ${calculatedProgress}%`);
        
        const updatedGoal = {
          ...goal,
          progress: calculatedProgress,
          updatedAt: new Date().toISOString()
        };
        
        // Update goals state
        setGoals(prevGoals => 
          prevGoals.map(g => g.id === goalId ? updatedGoal : g)
        );
        
        // Save to AsyncStorage
        const updatedGoals = goalsRef.current.map(g => 
          g.id === goalId ? updatedGoal : g
        );
        await saveData(STORAGE_KEYS.GOALS, updatedGoals);
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };
  
  // Delete a milestone - SIMPLIFIED VERSION WITH GOAL PROGRESS UPDATE
  const deleteMilestone = async (milestoneId) => {
    try {
      console.log(`Deleting milestone with ID: ${milestoneId}`);
      
      // Simple guard against already deleted milestones
      if (!Array.isArray(milestones) || milestones.length === 0) {
        console.warn('No milestones array available');
        return false;
      }
      
      // Check if milestone exists in the full milestones array
      const milestone = milestones.find(p => p.id === milestoneId);
      if (!milestone) {
        console.warn(`Milestone with ID ${milestoneId} not found, it may have already been deleted`);
        return false;
      }
      
      const goalId = milestone.goalId; // Store goal ID for later progress update
      
      // 1. First remove from AsyncStorage to ensure persistence
      const updatedMilestones = milestones.filter(milestone => milestone.id !== milestoneId);
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(updatedMilestones));
        console.log(`✅ Milestone deletion persisted to storage, ${updatedMilestones.length} milestones remaining`);
      } catch (storageError) {
        console.error('❌ Critical: Failed to persist milestone deletion to storage:', storageError);
        showError('Failed to delete milestone - storage error');
        throw storageError;
      }
      
      // 2. Then update state (AFTER storage is updated)
      setMilestones(updatedMilestones);
      
      // 3. Clean up associated tasks if they exist
      if (Array.isArray(tasks) && tasks.length > 0) {
        const updatedTasks = tasks.filter(task => task.milestoneId !== milestoneId);
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
          console.log(`✅ Associated tasks cleanup persisted to storage, ${updatedTasks.length} tasks remaining`);
          setTasks(updatedTasks);
        } catch (storageError) {
          console.error('❌ Failed to persist task cleanup after milestone deletion:', storageError);
          // Don't throw here - milestone deletion already succeeded
          showError('Warning: Some associated tasks may not have been cleaned up properly');
        }
      }
      
      // 4. Update milestone-goal link map if needed
      if (milestoneGoalLinkMap[milestoneId]) {
        const updatedLinkMap = { ...milestoneGoalLinkMap };
        delete updatedLinkMap[milestoneId];
        
        await AsyncStorage.setItem('milestoneGoalLinkMap', JSON.stringify(updatedLinkMap));
        setMilestoneGoalLinkMap(updatedLinkMap);
      }
      
      // 5. Update goal progress if milestone was linked to a goal
      if (goalId) {
        setTimeout(() => {
          updateGoalProgressFromMilestones(goalId);
        }, 500);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting milestone:', error);
      return false;
    }
  };
  
  // Add a task to a milestone OR create standalone task - COMPLETELY REWRITTEN TO NEVER CHANGE MILESTONE STATUS AND ADD SUBSCRIPTION CHECK
  const addTask = async (milestoneIdOrTaskData, newTask) => {
    try {
      // Handle both old format (milestoneId, newTask) and new format (taskData only)
      let milestoneId, taskData;
      
      if (typeof milestoneIdOrTaskData === 'string' || milestoneIdOrTaskData === null) {
        // Old format: addTask(milestoneId, newTask)
        milestoneId = milestoneIdOrTaskData;
        taskData = newTask;
      } else {
        // New format: addTask(taskData)
        taskData = milestoneIdOrTaskData;
        milestoneId = taskData.milestoneId;
      }
      
      // For standalone tasks, milestoneId will be null/undefined
      const isStandaloneTask = !milestoneId || milestoneId === null || milestoneId === undefined;
      
      console.log('🔍 addTask called with:', { milestoneId, isStandaloneTask, taskData: taskData?.title });
      
      // Check if milestone exists (only for non-standalone tasks)
      if (!isStandaloneTask && !isMilestoneActive(milestoneId)) {
        console.warn(`Milestone with ID ${milestoneId} not found, cannot add task`);
        showError('Milestone not found');
        return null;
      }
      
      // Create a copy of tasks to avoid null or undefined issues
      const currentTasks = Array.isArray(tasks) ? [...tasks] : [];
      
      // Check subscription limits (only for milestone-based tasks)
      // Use currentTasks instead of state to get accurate count for bulk operations
      if (!isStandaloneTask) {
        const currentMilestoneTasks = currentTasks.filter(task => task.milestoneId === milestoneId);
        if (userSubscriptionStatus !== 'pro' && userSubscriptionStatus !== 'unlimited' && currentMilestoneTasks.length >= FREE_PLAN_LIMITS.MAX_TASKS_PER_MILESTONE) {
          showError(`Free version limited to ${FREE_PLAN_LIMITS.MAX_TASKS_PER_MILESTONE} tasks per milestone. Complete a task or upgrade to Pro.`);
          return null;
        }
      }
      
      // Add the task
      const taskWithId = { 
        ...taskData,
        id: taskData.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        milestoneId: taskData.milestoneId || (isStandaloneTask ? null : milestoneId), // Use provided milestoneId or fallback
        projectId: taskData.projectId || taskData.milestoneId || (isStandaloneTask ? null : milestoneId), // Keep projectId for backward compatibility
        goalId: taskData.goalId || null, // Ensure goalId is set
        completed: taskData.completed || false,
        createdAt: taskData.createdAt || new Date().toISOString()
      };
      
      // Add to state
      const updatedTasks = [...currentTasks, taskWithId];
      setTasks(updatedTasks);
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TASKS, updatedTasks);
      
      console.log('🔍 Task added successfully:', { id: taskWithId.id, title: taskWithId.title, isStandalone: isStandaloneTask });
      
      // Skip milestone progress calculation for standalone tasks
      if (isStandaloneTask) {
        return taskWithId;
      }
      
      // Find the current milestone
      const milestone = milestonesRef.current.find(p => p.id === milestoneId);
      if (!milestone) return taskWithId;
      
      // Calculate new task-based progress WITHOUT changing milestone status
      const milestoneTasks = updatedTasks.filter(task => task.milestoneId === milestoneId);
      const completedTasks = milestoneTasks.filter(task => task.completed || task.status === 'done').length;
      const calculatedProgress = milestoneTasks.length > 0 
        ? Math.round((completedTasks / milestoneTasks.length) * 100)
        : 0;
      
      // Only update the progress number, NEVER the status
      if (milestone.progress !== calculatedProgress) {
        console.log(`[AppContext] Updating milestone "${milestone.title}" progress to ${calculatedProgress}% (status remains "${milestone.status || 'todo'}")`);
        
        const updatedMilestone = {
          ...milestone,
          progress: calculatedProgress,
          // DO NOT CHANGE these properties based on tasks:
          // status: stays the same
          // completed: stays the same
          updatedAt: new Date().toISOString()
        };
        
        // Special case: if milestone is marked as done, keep it at 100%
        if (milestone.status === 'done' || milestone.completed) {
          updatedMilestone.progress = 100;
        }
        
        // Update milestones state
        setMilestones(prevMilestones => 
          prevMilestones.map(p => p.id === milestoneId ? updatedMilestone : p)
        );
        
        // Save to AsyncStorage
        const updatedMilestones = milestonesRef.current.map(p => 
          p.id === milestoneId ? updatedMilestone : p
        );
        await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
        
        // Update goal progress if milestone is linked to a goal
        if (milestone.goalId) {
          setTimeout(() => {
            updateGoalProgressFromMilestones(milestone.goalId);
          }, 500);
        }
      }
      
      return taskWithId;
    } catch (error) {
      console.error('Error adding task:', error);
      showError('Failed to add task');
      return null;
    }
  };

  // Production-level bulk task addition with atomic operations and comprehensive error handling
  const addTasksBulk = async (tasksToAdd, knownMilestones = []) => {
    try {
      if (!Array.isArray(tasksToAdd) || tasksToAdd.length === 0) {
        showError('No tasks to add');
        return [];
      }

      console.log(`🔄 Starting production-level bulk task addition: ${tasksToAdd.length} tasks`);
      console.log(`🔍 addTasksBulk received knownMilestones:`, knownMilestones.length, knownMilestones.map(m => ({ id: m.id, title: m.title })));

      // Process and validate each task
      const processedTasks = [];
      const milestoneTaskCounts = {}; // Track tasks per milestone for subscription limits

      for (const taskData of tasksToAdd) {
        // Handle task data format
        const milestoneId = taskData.milestoneId;
        const isStandaloneTask = !milestoneId || milestoneId === null || milestoneId === undefined;

        // Check if milestone exists (only for non-standalone tasks)
        if (!isStandaloneTask) {
          const stateHasMilestone = isMilestoneActive(milestoneId);
          const knownHasMilestone = knownMilestones.some(milestone => milestone.id === milestoneId);
          const milestoneExists = stateHasMilestone || knownHasMilestone;
          
          console.log(`🔍 Milestone validation for ${milestoneId}:`, {
            stateHasMilestone,
            knownHasMilestone,
            milestoneExists,
            currentMilestoneCount: milestones.length,
            knownMilestoneCount: knownMilestones.length
          });
          
          if (!milestoneExists) {
            console.warn(`Milestone with ID ${milestoneId} not found, cannot add task`);
            showError('One or more milestones not found');
            return [];
          }
        }

        // Track milestone task counts for subscription limit checking
        if (!isStandaloneTask) {
          milestoneTaskCounts[milestoneId] = (milestoneTaskCounts[milestoneId] || 0) + 1;
        }

        // Create processed task with comprehensive data structure
        const taskWithId = {
          ...taskData,
          id: taskData.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          milestoneId: taskData.milestoneId || (isStandaloneTask ? null : milestoneId),
          projectId: taskData.projectId || taskData.milestoneId || (isStandaloneTask ? null : milestoneId),
          goalId: taskData.goalId || null,
          completed: taskData.completed || false,
          status: taskData.status || 'todo',
          priority: taskData.priority || null,
          createdAt: taskData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        processedTasks.push(taskWithId);
      }

      // Check subscription limits for all affected milestones
      if (userSubscriptionStatus !== 'pro' && userSubscriptionStatus !== 'unlimited') {
        const currentTasks = Array.isArray(tasks) ? [...tasks] : [];
        
        for (const [milestoneId, newTaskCount] of Object.entries(milestoneTaskCounts)) {
          const currentMilestoneTasks = currentTasks.filter(task => task.milestoneId === milestoneId);
          const totalTasksAfterAdd = currentMilestoneTasks.length + newTaskCount;
          
          if (totalTasksAfterAdd > FREE_PLAN_LIMITS.MAX_TASKS_PER_MILESTONE) {
            showError(`Free version limited to ${FREE_PLAN_LIMITS.MAX_TASKS_PER_MILESTONE} tasks per milestone. Complete some tasks or upgrade to Pro.`);
            return [];
          }
        }
      }

      // Execute production-level bulk task addition transaction
      // Include known milestones in the current milestones to prevent referential integrity errors
      const currentMilestonesWithKnown = Array.isArray(milestones) ? [...milestones] : [];
      knownMilestones.forEach(knownMilestone => {
        if (!currentMilestonesWithKnown.some(m => m.id === knownMilestone.id)) {
          currentMilestonesWithKnown.push(knownMilestone);
        }
      });
      
      console.log('🔍 Calling StateTransactionService with milestones:', {
        originalCount: Array.isArray(milestones) ? milestones.length : 0,
        knownCount: knownMilestones.length,
        finalCount: currentMilestonesWithKnown.length
      });
      
      const result = await stateTransactionService.executeBulkTaskAddition({
        tasksToAdd: processedTasks,
        currentTasks: Array.isArray(tasks) ? [...tasks] : [],
        currentMilestones: currentMilestonesWithKnown,
        currentGoals: Array.isArray(goals) ? [...goals] : [],
        setTasks,
        setMilestones
      });

      if (result.success) {
        console.log(`✅ Production-level bulk task addition completed: ${result.addedTasks.length} tasks added`);
        return result.addedTasks;
      } else {
        showError('Failed to add tasks');
        return [];
      }

    } catch (error) {
      console.error('🔴 Production-level bulk task addition failed:', error);
      showError(`Failed to add tasks: ${error.message}`);
      return [];
    }
  };

  
  // Update a task - COMPLETELY REWRITTEN TO NEVER CHANGE MILESTONE STATUS
  const updateTask = async (milestoneId, taskId, updatedTask) => {
    try {
      // Check if milestone exists (skip check for standalone tasks where milestoneId is null)
      if (milestoneId && !isMilestoneActive(milestoneId)) {
        console.warn(`Milestone with ID ${milestoneId} not found, cannot update task`);
        showError('Milestone not found');
        return null;
      }
      
      // Make sure we have a tasks array
      if (!Array.isArray(tasks)) {
        console.error('No tasks array available');
        throw new Error('Tasks array not available');
      }
      
      // Find the task - handle milestone tasks, goal-level standalone tasks, and completely standalone tasks
      let taskIndex;
      if (milestoneId) {
        // Task belongs to a milestone
        taskIndex = tasks.findIndex(task => task.id === taskId && task.milestoneId === milestoneId);
      } else {
        // For standalone tasks, we need to find the task by ID first to check its properties
        const existingTask = tasks.find(task => task.id === taskId);
        if (existingTask) {
          if (existingTask.goalId && !existingTask.milestoneId && !existingTask.projectId) {
            // Goal-level standalone task (has goalId but no milestoneId/projectId)
            taskIndex = tasks.findIndex(task => task.id === taskId);
          } else if (!existingTask.milestoneId && !existingTask.projectId && !existingTask.goalId) {
            // Completely standalone task (no milestone, project, or goal)
            taskIndex = tasks.findIndex(task => task.id === taskId && !task.milestoneId && !task.projectId && !task.goalId);
          } else {
            // Task has some other association we're not handling
            taskIndex = tasks.findIndex(task => task.id === taskId);
          }
        } else {
          taskIndex = -1;
        }
      }
      
      if (taskIndex === -1) {
        const existingTask = tasks.find(task => task.id === taskId);
        const taskType = existingTask 
          ? existingTask.goalId && !existingTask.milestoneId ? ' (goal-level standalone)' 
          : !existingTask.goalId && !existingTask.milestoneId ? ' (completely standalone)' 
          : ' (milestone task)'
          : ' (not found)';
        console.warn(`Task with ID ${taskId} not found${milestoneId ? ` in milestone ${milestoneId}` : taskType}`);
        showError('Task not found');
        return null;
      }
      
      // Update the task
      const newTasksArray = [...tasks];
      newTasksArray[taskIndex] = { 
        ...newTasksArray[taskIndex], 
        ...updatedTask
      };
      
      // Update state
      setTasks(newTasksArray);
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TASKS, newTasksArray);
      
      // For standalone tasks, we're done - no milestone progress to update
      if (!milestoneId) {
        console.log('[AppContext] Successfully updated standalone task');
        return newTasksArray[taskIndex];
      }
      
      // Find the current milestone
      const milestone = milestonesRef.current.find(p => p.id === milestoneId);
      if (!milestone) return null;
      
      // Calculate new task-based progress WITHOUT changing milestone status
      const milestoneTasks = newTasksArray.filter(task => task.milestoneId === milestoneId);
      const completedTasks = milestoneTasks.filter(task => task.completed || task.status === 'done').length;
      const calculatedProgress = milestoneTasks.length > 0 
        ? Math.round((completedTasks / milestoneTasks.length) * 100)
        : 0;
      
      // Only update the progress number, NEVER the status
      if (milestone.progress !== calculatedProgress) {
        console.log(`[AppContext] Updating milestone "${milestone.title}" progress to ${calculatedProgress}% (status remains "${milestone.status || 'todo'}")`);
        
        const updatedMilestone = {
          ...milestone,
          progress: calculatedProgress,
          // DO NOT CHANGE these properties based on tasks:
          // status: stays the same
          // completed: stays the same
          updatedAt: new Date().toISOString()
        };
        
        // Special case: if milestone is marked as done, keep it at 100%
        if (milestone.status === 'done' || milestone.completed) {
          updatedMilestone.progress = 100;
        }
        
        // Update milestones state
        setMilestones(prevMilestones => 
          prevMilestones.map(p => p.id === milestoneId ? updatedMilestone : p)
        );
        
        // Save to AsyncStorage
        const updatedMilestones = milestonesRef.current.map(p => 
          p.id === milestoneId ? updatedMilestone : p
        );
        await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
        
        // Update goal progress if milestone is linked to a goal
        if (milestone.goalId) {
          setTimeout(() => {
            updateGoalProgressFromMilestones(milestone.goalId);
          }, 500);
        }
      }
      
      return newTasksArray[taskIndex];
    } catch (error) {
      console.error('Error updating task:', error);
      showError('Failed to update task');
      return null;
    }
  };
  
  // Delete a task - UPDATED FOR FLEXIBLE HIERARCHY (handles standalone tasks)
  const deleteTask = async (milestoneId, taskId) => {
    try {
      const isStandaloneTask = milestoneId === null || milestoneId === undefined;
      
      // Check if milestone exists (only for non-standalone tasks)
      if (!isStandaloneTask && !isMilestoneActive(milestoneId)) {
        console.warn(`Milestone with ID ${milestoneId} not found, cannot delete task`);
        showError('Milestone not found');
        return false;
      }
      
      // Make sure we have a tasks array
      if (!Array.isArray(tasks)) {
        console.error('No tasks array available');
        throw new Error('Tasks array not available');
      }
      
      // Check if task exists (handle both standalone and milestone tasks)
      const taskExists = isStandaloneTask 
        ? tasks.some(task => task.id === taskId && (task.milestoneId === null || task.milestoneId === undefined))
        : tasks.some(task => task.id === taskId && task.milestoneId === milestoneId);
      
      if (!taskExists) {
        console.warn(`Task with ID ${taskId} not found${isStandaloneTask ? ' in standalone tasks' : ` in milestone ${milestoneId}`}`);
        showError('Task not found');
        return false;
      }
      
      // Remove the task (handle both standalone and milestone tasks)
      const updatedTasks = isStandaloneTask
        ? tasks.filter(task => !(task.id === taskId && (task.milestoneId === null || task.milestoneId === undefined)))
        : tasks.filter(task => !(task.id === taskId && task.milestoneId === milestoneId));
      
      // Update state
      setTasks(updatedTasks);
      
      // Save to AsyncStorage with error handling
      try {
        await saveData(STORAGE_KEYS.TASKS, updatedTasks);
        console.log(`✅ Task deletion persisted to storage, ${updatedTasks.length} tasks remaining`);
      } catch (storageError) {
        console.error('❌ Critical: Failed to persist task deletion to storage:', storageError);
        // Revert state change if storage fails
        setTasks(tasks);
        showError('Failed to delete task - storage error');
        throw storageError;
      }
      
      // Find the current milestone
      const milestone = milestonesRef.current.find(p => p.id === milestoneId);
      if (!milestone) return true;
      
      // Calculate new task-based progress WITHOUT changing milestone status
      const milestoneTasks = updatedTasks.filter(task => task.milestoneId === milestoneId);
      
      // If no tasks left, keep the current progress
      if (milestoneTasks.length === 0) {
        showSuccess('Task deleted successfully');
        return true;
      }
      
      const completedTasks = milestoneTasks.filter(task => task.completed || task.status === 'done').length;
      const calculatedProgress = Math.round((completedTasks / milestoneTasks.length) * 100);
      
      // Only update the progress number, NEVER the status
      if (milestone.progress !== calculatedProgress) {
        console.log(`[AppContext] Updating milestone "${milestone.title}" progress to ${calculatedProgress}% (status remains "${milestone.status || 'todo'}")`);
        
        const updatedMilestone = {
          ...milestone,
          progress: calculatedProgress,
          // DO NOT CHANGE these properties based on tasks:
          // status: stays the same
          // completed: stays the same
          updatedAt: new Date().toISOString()
        };
        
        // Special case: if milestone is marked as done, keep it at 100%
        if (milestone.status === 'done' || milestone.completed) {
          updatedMilestone.progress = 100;
        }
        
        // Update milestones state
        setMilestones(prevMilestones => 
          prevMilestones.map(p => p.id === milestoneId ? updatedMilestone : p)
        );
        
        // Save to AsyncStorage
        const updatedMilestones = milestonesRef.current.map(p => 
          p.id === milestoneId ? updatedMilestone : p
        );
        await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
        
        // Update goal progress if milestone is linked to a goal
        if (milestone.goalId) {
          setTimeout(() => {
            updateGoalProgressFromMilestones(milestone.goalId);
          }, 500);
        }
      }
      
      showSuccess('Task deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      showError('Failed to delete task');
      return false;
    }
  };

  // Production-level bulk task deletion with atomic operations and comprehensive error handling
  const deleteTasksBulk = async (taskIdsToDelete) => {
    try {
      if (!Array.isArray(taskIdsToDelete) || taskIdsToDelete.length === 0) {
        showError('No tasks to delete');
        return [];
      }

      console.log(`🔄 Starting production-level bulk task deletion: ${taskIdsToDelete.length} tasks`);

      // Execute production-level bulk task deletion transaction
      const result = await stateTransactionService.executeBulkTaskDeletion({
        taskIdsToDelete,
        currentTasks: Array.isArray(tasks) ? [...tasks] : [],
        currentMilestones: Array.isArray(milestones) ? [...milestones] : [],
        currentGoals: Array.isArray(goals) ? [...goals] : [],
        setTasks,
        setMilestones
      });

      if (result.success) {
        console.log(`✅ Production-level bulk task deletion completed: ${result.deletedTasks.length} tasks deleted`);
        return result.deletedTasks;
      } else {
        showError('Failed to delete tasks');
        return [];
      }

    } catch (error) {
      console.error('🔴 Production-level bulk task deletion failed:', error);
      showError(`Failed to delete tasks: ${error.message}`);
      return [];
    }
  };

  // Update notes and persist to AsyncStorage
  const updateNotes = async (newNotes) => {
    try {
      setNotes(newNotes);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(newNotes));
      console.log(`✅ Notes updated and persisted to storage, ${newNotes.length} notes total`);
      return true;
    } catch (error) {
      console.error('❌ Failed to persist notes to storage:', error);
      return false;
    }
  };
  
  // Function to update milestone progress from its tasks
  const updateMilestoneProgressFromTasks = async (milestoneId, currentTasks = null) => {
    try {
      console.log(`🔴 [DEBUG] updateMilestoneProgressFromTasks called - Milestone: ${milestoneId}`);
      if (!milestoneId) return;
      
      const milestone = milestonesRef.current.find(p => p.id === milestoneId);
      if (!milestone) return;
      
      console.log(`🔴 [DEBUG] Milestone found:`, {
        id: milestoneId,
        title: milestone.title,
        status: milestone.status,
        progress: milestone.progress,
        completed: milestone.completed,
        updatedAt: milestone.updatedAt
      });
      
      // IMPORTANT: Don't update milestones that were manually completed recently
      if ((milestone.status === 'done' || milestone.completed) && milestone.updatedAt) {
        const lastUpdate = new Date(milestone.updatedAt).getTime();
        const now = Date.now();
        const timeDiff = now - lastUpdate;
        console.log(`🔴 [DEBUG] Manual completion check - Time since update: ${timeDiff}ms`);
        // If milestone was manually completed in the last 2 seconds, don't override it
        if (timeDiff < 2000) {
          console.log(`🔴 [DEBUG] Milestone "${milestone.title}" was manually completed recently, skipping auto-update`);
          return;
        }
      }
      
      // IMPORTANT: Don't change milestone status based on task completion
      // Only recalculate progress percentage while preserving status
      
      // Calculate task completion percentage (but don't change status)
      const tasksToUse = currentTasks || tasksRef.current;
      const milestoneTasks = tasksToUse.filter(task => task.milestoneId === milestoneId);
      
      // If there are no tasks, don't update anything
      if (milestoneTasks.length === 0) return;
      
      const completedTasks = milestoneTasks.filter(task => task.completed || task.status === 'done').length;
      const calculatedProgress = Math.round((completedTasks / milestoneTasks.length) * 100);
      
      // Do not update the milestone if progress hasn't changed
      if (milestone.progress === calculatedProgress) return;
      
      // For progress display, use the calculated value, but preserve existing status
      console.log(`[AppContext] Updating milestone "${milestone.title}" task-based progress: ${calculatedProgress}%`);
      
      // We only update the percentage, not the status
      // Preserve the existing status (todo, in_progress, done) regardless of task completion
      const updatedMilestone = {
        ...milestone,
        progress: calculatedProgress,
        updatedAt: new Date().toISOString()
      };
      
      // If milestone is already marked as done, keep it that way regardless of progress
      if (milestone.status === 'done' || milestone.completed) {
        updatedMilestone.progress = 100;
        updatedMilestone.completed = true;
        updatedMilestone.status = 'done';
      }
      
      // Update milestones state
      setMilestones(prevMilestones => 
        prevMilestones.map(p => p.id === milestoneId ? updatedMilestone : p)
      );
      
      // Save to AsyncStorage
      const updatedMilestones = milestonesRef.current.map(p => 
        p.id === milestoneId ? updatedMilestone : p
      );
      await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
      
      // Update goal progress if milestone is linked to a goal
      if (milestone.goalId) {
        setTimeout(() => {
          updateGoalProgressFromMilestones(milestone.goalId);
        }, 500);
      }
    } catch (error) {
      console.error('Error updating milestone progress from tasks:', error);
    }
  };
  
  // Add a time block - WITH SUBSCRIPTION CHECK
  const addTimeBlock = async (newTimeBlock) => {
    try {
      console.log('🚨 ALERT: Regular addTimeBlock called! Title:', newTimeBlock?.title, 'IsRepeating:', newTimeBlock?.isRepeating);
      console.log('🚨 ALERT: This should NOT happen during Skip Conflicts flow!');
      
      // Check subscription limits
      if (!canAddMoreTimeBlocks()) {
        showError(`Free version limited to ${FREE_PLAN_LIMITS.MAX_TIME_BLOCKS} time blocks per week. Remove a time block or upgrade to Pro.`);
        return null;
      }
      
      const blocksToAdd = [newTimeBlock];
      
      // Generate recurring instances if this is a recurring time block
      if (newTimeBlock.isRepeating) {
        const recurringInstances = generateRecurringInstances(newTimeBlock);
        blocksToAdd.push(...recurringInstances);
      }
      
      // Update state with all blocks (original + recurring instances)
      setTimeBlocks(prevTimeBlocks => [...prevTimeBlocks, ...blocksToAdd]);
      
      // Save to AsyncStorage
      const updatedTimeBlocks = [...timeBlocks, ...blocksToAdd];
      await saveData(STORAGE_KEYS.TIME_BLOCKS, updatedTimeBlocks);
      
      return newTimeBlock;
    } catch (error) {
      console.error('Error adding time block:', error);
      showError('Failed to add time block');
      throw error;
    }
  };

  // Add time block with conflict skipping
  const addTimeBlockSkipConflicts = async (newTimeBlock, excludeIds = [], isEditingSeries = false, seriesId = null) => {
    try {
      console.log('Skip Conflicts: Processing timeblock with conflict avoidance');

      // Check subscription limits
      if (!canAddMoreTimeBlocks()) {
        console.log('🚨 AppContext STEP A2: Subscription limit reached, returning null');
        showError(`Free version limited to ${FREE_PLAN_LIMITS.MAX_TIME_BLOCKS} time blocks per week. Remove a time block or upgrade to Pro.`);
        return null;
      }

      console.log('🚨 AppContext STEP A3: Subscription limit check passed, proceeding...');
      const blocksToAdd = [];
      
      // If editing a series, exclude all existing instances of that series
      let finalExcludeIds = [...excludeIds];
      if (isEditingSeries && seriesId) {
        console.log('🚨 AppContext STEP A4: Editing series, getting series instance IDs...');
        const seriesInstanceIds = getSeriesInstanceIds(seriesId);
        finalExcludeIds = [...finalExcludeIds, ...seriesInstanceIds];
        console.log(`🚨 AppContext STEP A5: Excluding ${seriesInstanceIds.length} series instances from conflict detection`);
      }
      
      console.log('🚨 AppContext STEP A6: Final exclude IDs:', finalExcludeIds);
      
      if (newTimeBlock.isRepeating) {
        console.log('🚨 AppContext STEP A7: Processing recurring timeblock...');
        // For recurring blocks, check each instance for conflicts
        const allInstances = [newTimeBlock, ...generateRecurringInstances(newTimeBlock)];
        console.log(`🚨 AppContext STEP A8: Generated ${allInstances.length} total instances (including original)`);
        
        allInstances.forEach((instance, index) => {
          const conflicts = checkTimeBlockConflicts(instance, finalExcludeIds);
          console.log(`🚨 AppContext STEP A9.${index + 1}: Checking instance ${index + 1}:`, {
            instanceDate: new Date(instance.startTime).toDateString(),
            instanceTime: `${new Date(instance.startTime).toLocaleTimeString()} - ${new Date(instance.endTime).toLocaleTimeString()}`,
            conflictsFound: conflicts.length,
            conflictTitles: conflicts.map(c => c.title),
            excludedIds: finalExcludeIds
          });
          
          if (conflicts.length === 0) {
            // No conflicts, add this instance
            blocksToAdd.push(instance);
            console.log(`🚨 AppContext STEP A10.${index + 1}: Instance ${index + 1} has NO conflicts - ADDING to blocksToAdd`);
          } else {
            console.log(`🚨 AppContext STEP A11.${index + 1}: Instance ${index + 1} has ${conflicts.length} conflicts - SKIPPING`, conflicts.map(c => c.title));
          }
        });
        
        console.log(`🚨 AppContext STEP A12: Final result - will create ${blocksToAdd.length} of ${allInstances.length} recurring instances (skipped ${allInstances.length - blocksToAdd.length} conflicts)`);
      } else {
        console.log('🚨 AppContext STEP A13: Processing single (non-recurring) timeblock...');
        // For single blocks, check if there are conflicts
        const conflicts = checkTimeBlockConflicts(newTimeBlock, finalExcludeIds);
        console.log('🚨 AppContext STEP A14: Single timeblock conflict check result:', {
          conflictsFound: conflicts.length,
          conflictTitles: conflicts.map(c => c.title)
        });
        
        if (conflicts.length === 0) {
          blocksToAdd.push(newTimeBlock);
          console.log('🚨 AppContext STEP A15: Single timeblock has no conflicts - ADDING');
        } else {
          console.log('🚨 AppContext STEP A16: Single timeblock has conflicts - SKIPPING and returning null');
          return null;
        }
      }
      
      console.log('🚨 AppContext STEP A17: Final blocks to add count:', blocksToAdd.length);
      console.log('🚨 AppContext STEP A17b: DETAILED blocks to add:', blocksToAdd.map(block => ({
        id: block.id,
        title: block.title,
        date: new Date(block.startTime).toDateString(),
        time: `${new Date(block.startTime).toLocaleTimeString()} - ${new Date(block.endTime).toLocaleTimeString()}`
      })));
      
      if (blocksToAdd.length === 0) {
        console.log('🚨 AppContext STEP A18: No blocks to add (all would conflict) - returning null');
        showError('All instances would conflict with existing timeblocks');
        return null;
      }
      
      console.log('🚨 AppContext STEP A19: Updating timeBlocks state with new blocks...');
      // Update state with conflict-free blocks
      setTimeBlocks(prevTimeBlocks => {
        const newTimeBlocks = [...prevTimeBlocks, ...blocksToAdd];
        console.log('🚨 AppContext STEP A19b: NEW timeBlocks array will have', newTimeBlocks.length, 'total blocks');
        console.log('🚨 AppContext STEP A19c: Just added blocks:', blocksToAdd.map(b => ({
          id: b.id,
          title: b.title,
          date: new Date(b.startTime).toDateString()
        })));
        return newTimeBlocks;
      });
      
      console.log('🚨 AppContext STEP A20: Saving to AsyncStorage...');
      // Save to AsyncStorage
      const updatedTimeBlocks = [...timeBlocks, ...blocksToAdd];
      await saveData(STORAGE_KEYS.TIME_BLOCKS, updatedTimeBlocks);
      
      const result = {
        ...newTimeBlock,
        createdInstances: blocksToAdd.length,
        totalInstances: newTimeBlock.isRepeating ? [newTimeBlock, ...generateRecurringInstances(newTimeBlock)].length : 1
      };
      
      console.log('🚨 AppContext STEP A21: Successfully completed, returning result:', {
        createdInstances: result.createdInstances,
        totalInstances: result.totalInstances
      });
      
      return result;
    } catch (error) {
      console.log('🚨 AppContext ERROR: Exception in addTimeBlockSkipConflicts:', error);
      console.log('🚨 AppContext ERROR: Stack trace:', error.stack);
      showError('Failed to add time block');
      throw error;
    }
  };

  // Helper function to generate recurring instances when creating a recurring time block
  const generateRecurringInstances = (originalBlock) => {
    const instances = [];
    const today = new Date();
    let instanceCounter = 1; // Counter to ensure unique IDs
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substr(2, 4)}`; // Unique batch identifier
    
    // Get the original block start date
    const originalStartDate = new Date(originalBlock.startTime);
    const originalEndDate = new Date(originalBlock.endTime);
    const durationMs = originalEndDate.getTime() - originalStartDate.getTime();
    
    // Determine how far ahead to generate instances
    let endGenerationDate;
    if (originalBlock.repeatIndefinitely) {
      // For indefinite repeating, generate instances for 6 months ahead to ensure continuity
      endGenerationDate = new Date();
      endGenerationDate.setMonth(endGenerationDate.getMonth() + 6);
    } else if (originalBlock.repeatUntil) {
      // Use the specified end date
      endGenerationDate = new Date(originalBlock.repeatUntil);
    } else {
      // Default fallback - 3 months ahead
      endGenerationDate = new Date();
      endGenerationDate.setMonth(endGenerationDate.getMonth() + 3);
    }
    
    // Generate instances based on frequency
    let currentDate = new Date(originalStartDate);
    
    switch (originalBlock.repeatFrequency) {
      case 'daily':
        // Start from the day after the original
        currentDate.setDate(currentDate.getDate() + 1);
        
        while (currentDate <= endGenerationDate) {
          const instanceStartTime = new Date(currentDate);
          const instanceEndTime = new Date(instanceStartTime.getTime() + durationMs);
          
          const instance = {
            ...originalBlock,
            id: `${originalBlock.id}_${currentDate.toISOString().split('T')[0]}_${uniqueSuffix}_${instanceCounter++}`, // Ensure unique IDs with counter
            startTime: instanceStartTime.toISOString(),
            endTime: instanceEndTime.toISOString(),
            isRepeating: false, // Instance is not repeating itself
            isRepeatingInstance: true,
            originalTimeBlockId: originalBlock.id,
            seriesId: originalBlock.id // For series deletion
          };
          
          instances.push(instance);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;
        
      case 'weekly':
        // Start from one week after the original
        currentDate.setDate(currentDate.getDate() + 7);
        
        while (currentDate <= endGenerationDate) {
          const instanceStartTime = new Date(currentDate);
          const instanceEndTime = new Date(instanceStartTime.getTime() + durationMs);
          
          const instance = {
            ...originalBlock,
            id: `${originalBlock.id}_${currentDate.toISOString().split('T')[0]}_${uniqueSuffix}_${instanceCounter++}`, // Ensure unique IDs with counter
            startTime: instanceStartTime.toISOString(),
            endTime: instanceEndTime.toISOString(),
            isRepeating: false, // Instance is not repeating itself
            isRepeatingInstance: true,
            originalTimeBlockId: originalBlock.id,
            seriesId: originalBlock.id // For series deletion
          };
          
          instances.push(instance);
          currentDate.setDate(currentDate.getDate() + 7);
        }
        break;
        
      case 'monthly':
        // Start from one month after the original
        currentDate.setMonth(currentDate.getMonth() + 1);
        
        while (currentDate <= endGenerationDate) {
          const instanceStartTime = new Date(currentDate);
          const instanceEndTime = new Date(instanceStartTime.getTime() + durationMs);
          
          const instance = {
            ...originalBlock,
            id: `${originalBlock.id}_${currentDate.toISOString().split('T')[0]}_${uniqueSuffix}_${instanceCounter++}`, // Ensure unique IDs with counter
            startTime: instanceStartTime.toISOString(),
            endTime: instanceEndTime.toISOString(),
            isRepeating: false, // Instance is not repeating itself
            isRepeatingInstance: true,
            originalTimeBlockId: originalBlock.id,
            seriesId: originalBlock.id // For series deletion
          };
          
          instances.push(instance);
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        break;
    }
    
    console.log(`Generated ${instances.length} recurring instances for ${originalBlock.repeatFrequency} time block`);
    return instances;
  };

  // Function to generate additional recurring instances for blocks that need them
  // This should be called periodically to ensure recurring blocks continue appearing
  // IMPORTANT: This now respects Skip Conflicts choices and only creates non-conflicting instances
  const generateAdditionalRecurringInstances = async () => {
    try {
      console.log('Checking for recurring blocks that need additional instances...');
      
      const blocksToAdd = [];
      const today = new Date();
      const threeMonthsAhead = new Date();
      threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);
      
      // Find all original recurring blocks
      const recurringBlocks = timeBlocks.filter(block => 
        block.isRepeating && !block.isRepeatingInstance
      );
      
      for (const originalBlock of recurringBlocks) {
        // Check if we need to generate more instances for this block
        const existingInstances = timeBlocks.filter(block => 
          block.originalTimeBlockId === originalBlock.id
        );
        
        // Find the latest instance date
        let latestInstanceDate = new Date(originalBlock.startTime);
        for (const instance of existingInstances) {
          const instanceDate = new Date(instance.startTime);
          if (instanceDate > latestInstanceDate) {
            latestInstanceDate = instanceDate;
          }
        }
        
        // Check if we need more instances (if latest is less than 3 months ahead)
        if (latestInstanceDate < threeMonthsAhead) {
          console.log(`Generating additional instances for ${originalBlock.title}`);
          
          // Determine end generation date
          let endGenerationDate;
          if (originalBlock.repeatIndefinitely) {
            endGenerationDate = new Date();
            endGenerationDate.setMonth(endGenerationDate.getMonth() + 6); // Always stay 6 months ahead
          } else if (originalBlock.repeatUntil) {
            endGenerationDate = new Date(originalBlock.repeatUntil);
          } else {
            endGenerationDate = threeMonthsAhead;
          }
          
          // Generate instances from the day after the latest instance
          const originalStartDate = new Date(originalBlock.startTime);
          const originalEndDate = new Date(originalBlock.endTime);
          const durationMs = originalEndDate.getTime() - originalStartDate.getTime();
          
          let currentDate = new Date(latestInstanceDate);
          
          // Move to next occurrence
          switch (originalBlock.repeatFrequency) {
            case 'daily':
              currentDate.setDate(currentDate.getDate() + 1);
              break;
            case 'weekly':
              currentDate.setDate(currentDate.getDate() + 7);
              break;
            case 'monthly':
              currentDate.setMonth(currentDate.getMonth() + 1);
              break;
          }
          
          // Generate new instances - but ONLY non-conflicting ones
          while (currentDate <= endGenerationDate) {
            const instanceStartTime = new Date(currentDate);
            const instanceEndTime = new Date(instanceStartTime.getTime() + durationMs);
            
            const instance = {
              ...originalBlock,
              id: `${originalBlock.id}_${currentDate.toISOString().split('T')[0]}`,
              startTime: instanceStartTime.toISOString(),
              endTime: instanceEndTime.toISOString(),
              isRepeating: false,
              isRepeatingInstance: true,
              originalTimeBlockId: originalBlock.id,
              seriesId: originalBlock.id
            };
            
            // ⚠️ CRITICAL FIX: Check for conflicts before adding instance
            // This prevents auto-generation from overriding Skip Conflicts user choices
            const conflicts = checkTimeBlockConflicts(instance, []);
            if (conflicts.length === 0) {
              // No conflicts, safe to add this instance
              blocksToAdd.push(instance);
              console.log(`✅ Auto-generating non-conflicting instance for ${originalBlock.title} on ${currentDate.toDateString()}`);
            } else {
              // Has conflicts, respect the user's implicit Skip Conflicts choice
              console.log(`🚫 Skipping auto-generation of conflicting instance for ${originalBlock.title} on ${currentDate.toDateString()} (conflicts with: ${conflicts.map(c => c.title).join(', ')})`);
            }
            
            // Move to next occurrence
            switch (originalBlock.repeatFrequency) {
              case 'daily':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
              case 'weekly':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
              case 'monthly':
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
            }
          }
        }
      }
      
      if (blocksToAdd.length > 0) {
        console.log(`Adding ${blocksToAdd.length} additional non-conflicting recurring instances`);
        
        // Add new instances to state and storage
        setTimeBlocks(prevTimeBlocks => [...prevTimeBlocks, ...blocksToAdd]);
        const updatedTimeBlocks = [...timeBlocks, ...blocksToAdd];
        await saveData(STORAGE_KEYS.TIME_BLOCKS, updatedTimeBlocks);
      } else {
        console.log('No additional non-conflicting instances to generate');
      }
      
    } catch (error) {
      console.error('Error generating additional recurring instances:', error);
    }
  };
  
  // Update a time block
  const updateTimeBlock = async (updatedTimeBlock) => {
    try {
      // Update state
      setTimeBlocks(prevTimeBlocks => 
        prevTimeBlocks.map(timeBlock => 
          timeBlock.id === updatedTimeBlock.id ? updatedTimeBlock : timeBlock
        )
      );
      
      // Save to AsyncStorage
      const updatedTimeBlocks = timeBlocks.map(timeBlock => 
        timeBlock.id === updatedTimeBlock.id ? updatedTimeBlock : timeBlock
      );
      await saveData(STORAGE_KEYS.TIME_BLOCKS, updatedTimeBlocks);
      
      return updatedTimeBlock;
    } catch (error) {
      console.error('Error updating time block:', error);
      showError('Failed to update time block');
      throw error;
    }
  };

  // Update entire time block series
  const updateTimeBlockSeries = async (seriesId, updatedData) => {
    try {
      const updatedTimeBlocks = timeBlocks.map(timeBlock => {
        // Update all blocks that are part of this series
        const isPartOfSeries = 
          timeBlock.id === seriesId ||
          timeBlock.seriesId === seriesId ||
          timeBlock.originalTimeBlockId === seriesId;
          
        if (isPartOfSeries) {
          // Update series-level properties but preserve instance-specific properties
          return {
            ...timeBlock,
            ...updatedData,
            // Always keep original id
            id: timeBlock.id,
            // For recurring instances, keep their specific start/end times (they have their own schedule)
            // For the original series block, use the updated times
            startTime: timeBlock.isRepeatingInstance ? timeBlock.startTime : updatedData.startTime,
            endTime: timeBlock.isRepeatingInstance ? timeBlock.endTime : updatedData.endTime,
          };
        }
        return timeBlock;
      });
      
      // Update state
      setTimeBlocks(updatedTimeBlocks);
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TIME_BLOCKS, updatedTimeBlocks);
      
      console.log(`Updated entire series for seriesId: ${seriesId}`);
      return true;
    } catch (error) {
      console.error('Error updating time block series:', error);
      showError('Failed to update time block series');
      throw error;
    }
  };

  // Create new time block series from an instance (break away and create new series)
  const createNewTimeBlockSeries = async (timeBlockData) => {
    try {
      // Generate new series ID
      const newSeriesId = `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the new recurring timeblock with series ID
      const newTimeBlock = {
        ...timeBlockData,
        id: newSeriesId,
        seriesId: null, // This is the original, not an instance
        originalTimeBlockId: null,
        isRepeating: true,
        isRepeatingInstance: false,
      };
      
      // Add the new series
      await addTimeBlock(newTimeBlock);
      
      console.log(`Created new time block series with ID: ${newSeriesId}`);
      return newTimeBlock;
    } catch (error) {
      console.error('Error creating new time block series:', error);
      showError('Failed to create new time block series');
      throw error;
    }
  };

  // Check for time conflicts when creating/updating timeblocks
  const checkTimeBlockConflicts = (newTimeBlock, excludeIds = []) => {
    const newStart = new Date(newTimeBlock.startTime);
    const newEnd = new Date(newTimeBlock.endTime);
    
    const conflicts = timeBlocks.filter(existingBlock => {
      // Skip if it's the same block or in exclude list
      if (excludeIds.includes(existingBlock.id)) return false;
      
      // Skip if it's on a different date
      const existingStart = new Date(existingBlock.startTime);
      const existingEnd = new Date(existingBlock.endTime);
      
      // Check if they're on the same date (ignore time for date comparison)
      const newDate = newStart.toDateString();
      const existingDate = existingStart.toDateString();
      if (newDate !== existingDate) return false;
      
      // Check for time overlap
      return (
        (newStart < existingEnd && newEnd > existingStart) || // Times overlap
        (existingStart < newEnd && existingEnd > newStart)    // Existing overlaps new
      );
    });
    
    return conflicts;
  };

  // Get all instances of a recurring series (for exclusion from conflict detection)
  const getSeriesInstanceIds = (seriesId) => {
    if (!seriesId) return [];
    
    return timeBlocks
      .filter(block => 
        block.seriesId === seriesId || 
        block.originalTimeBlockId === seriesId ||
        block.id === seriesId
      )
      .map(block => block.id);
  };

  // Enhanced conflict detection for recurring timeblocks
  const checkRecurringTimeBlockConflicts = (newTimeBlock, excludeIds = [], isEditingSeries = false, seriesId = null) => {
    if (!newTimeBlock.isRepeating) {
      // For non-recurring blocks, use standard conflict detection
      return { conflicts: checkTimeBlockConflicts(newTimeBlock, excludeIds), conflictingInstances: [] };
    }

    // If editing a series, exclude all existing instances of that series
    let finalExcludeIds = [...excludeIds];
    if (isEditingSeries && seriesId) {
      const seriesInstanceIds = getSeriesInstanceIds(seriesId);
      finalExcludeIds = [...finalExcludeIds, ...seriesInstanceIds];
      console.log(`🔍 Excluding series instances from conflict detection: ${seriesInstanceIds.length} instances`);
    }

    // Generate all instances that would be created
    const instances = [newTimeBlock, ...generateRecurringInstances(newTimeBlock)];
    const conflictingInstances = [];
    const allConflicts = [];

    instances.forEach((instance, index) => {
      const conflicts = checkTimeBlockConflicts(instance, finalExcludeIds);
      if (conflicts.length > 0) {
        conflictingInstances.push({
          instanceIndex: index,
          instance: instance,
          conflicts: conflicts,
          date: new Date(instance.startTime).toDateString(),
          isOriginal: index === 0
        });
        allConflicts.push(...conflicts);
      }
    });

    // Remove duplicate conflicts
    const uniqueConflicts = allConflicts.filter((conflict, index, self) => 
      self.findIndex(c => c.id === conflict.id) === index
    );

    return {
      conflicts: uniqueConflicts,
      conflictingInstances: conflictingInstances,
      totalInstances: instances.length,
      conflictCount: conflictingInstances.length
    };
  };
  
  // Delete a time block
  const deleteTimeBlock = async (timeBlockId, deleteType = null) => {
    try {
      let updatedTimeBlocks;
      const blockToDelete = timeBlocks.find(block => block.id === timeBlockId);
      
      console.log(`Delete request: ID=${timeBlockId}, type=${deleteType}, block:`, {
        isRepeating: blockToDelete?.isRepeating,
        isRepeatingInstance: blockToDelete?.isRepeatingInstance,
        seriesId: blockToDelete?.seriesId,
        originalTimeBlockId: blockToDelete?.originalTimeBlockId
      });
      
      if (deleteType === 'series') {
        // Delete all instances with the same seriesId or originalTimeBlockId
        const seriesIdToDelete = blockToDelete?.seriesId || blockToDelete?.originalTimeBlockId || timeBlockId;
        updatedTimeBlocks = timeBlocks.filter(timeBlock => 
          timeBlock.id !== timeBlockId && 
          timeBlock.seriesId !== seriesIdToDelete && 
          timeBlock.originalTimeBlockId !== seriesIdToDelete &&
          timeBlock.id !== seriesIdToDelete
        );
        console.log(`Deleting entire series for seriesId: ${seriesIdToDelete}`);
      } else if (deleteType === 'single') {
        // Delete ONLY the specific instance, regardless of whether it's original or not
        updatedTimeBlocks = timeBlocks.filter(timeBlock => timeBlock.id !== timeBlockId);
        console.log(`Deleting single instance ${timeBlockId} (forced single deletion)`);
      } else {
        // Default behavior - delete single block (and all its instances if it's a repeating original)
        if (blockToDelete && blockToDelete.isRepeating && !blockToDelete.isRepeatingInstance) {
          // Deleting the original repeating block - remove all instances too
          updatedTimeBlocks = timeBlocks.filter(timeBlock => 
            timeBlock.id !== timeBlockId && timeBlock.originalTimeBlockId !== timeBlockId
          );
          console.log(`Deleting original repeating block and all its instances`);
        } else {
          // Just delete the single block
          updatedTimeBlocks = timeBlocks.filter(timeBlock => timeBlock.id !== timeBlockId);
          console.log(`Deleting single non-repeating block ${timeBlockId}`);
        }
      }
      
      // Update state
      setTimeBlocks(updatedTimeBlocks);
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TIME_BLOCKS, updatedTimeBlocks);
      
      showSuccess('Time block deleted successfully');
    } catch (error) {
      console.error('Error deleting time block:', error);
      showError('Failed to delete time block');
      throw error;
    }
  };
  
  // Update a domain
  const updateDomain = async (updatedDomain) => {
    try {
      // First check if domain exists
      const domainExists = domains.some(domain => 
        domain.id === updatedDomain.id || domain.name === updatedDomain.name
      );
      
      let updatedDomains;
      
      if (domainExists) {
        // Update existing domain
        updatedDomains = domains.map(domain => 
          (domain.id === updatedDomain.id || domain.name === updatedDomain.name) ? updatedDomain : domain
        );
      } else {
        // Add new domain
        updatedDomains = [...domains, updatedDomain];
      }
      
      // Update state
      setDomains(updatedDomains);
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.DOMAINS, updatedDomains);
      
      // Update any goals with this domain
      if (updatedDomain.name) {
        const goalsToUpdate = goals.filter(goal => 
          goal.domain === updatedDomain.name || 
          (goal.icon && goal.icon === updatedDomain.icon)
        );
        
        if (goalsToUpdate.length > 0) {
          const updatedGoals = goals.map(goal => {
            if (goal.domain === updatedDomain.name || 
                (goal.icon && goal.icon === updatedDomain.icon)) {
              return {
                ...goal,
                domain: updatedDomain.name,
                color: updatedDomain.color || goal.color
              };
            }
            return goal;
          });
          
          // Update goals state
          setGoals(updatedGoals);
          
          // Save to AsyncStorage
          await saveData(STORAGE_KEYS.GOALS, updatedGoals);
          console.log(`Updated ${goalsToUpdate.length} goals with domain "${updatedDomain.name}"`);
        }
        
        // Also update any milestones with this domain
        const milestonesToUpdate = milestones.filter(milestone => 
          milestone.domain === updatedDomain.name
        );
        
        if (milestonesToUpdate.length > 0) {
          const updatedMilestones = milestones.map(milestone => {
            if (milestone.domain === updatedDomain.name) {
              return {
                ...milestone,
                domain: updatedDomain.name,
                color: updatedDomain.color || milestone.color
              };
            }
            return milestone;
          });
          
          // Update milestones state
          setMilestones(updatedMilestones);
          
          // Save to AsyncStorage
          await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
          console.log(`Updated ${milestonesToUpdate.length} milestones with domain "${updatedDomain.name}"`);
        }
      }
      
      return updatedDomain;
    } catch (error) {
      console.error('Error updating domain:', error);
      showError('Failed to update domain');
      throw error;
    }
  };
  
  // Update app settings
  const updateAppSetting = async (key, value) => {
    try {
      // Update state
      setSettings(prevSettings => ({
        ...prevSettings,
        [key]: value
      }));
      
      // Save to AsyncStorage
      const updatedSettings = {
        ...settings,
        [key]: value
      };
      await saveData(STORAGE_KEYS.SETTINGS, updatedSettings);
      
      return updatedSettings;
    } catch (error) {
      console.error('Error updating app setting:', error);
      showError('Failed to update app setting');
      throw error;
    }
  };
  
  // Update user profile
  const updateUserProfile = async (updatedProfile) => {
    try {
      // Update state
      setSettings(prevSettings => ({
        ...prevSettings,
        userProfile: {
          ...prevSettings.userProfile,
          ...updatedProfile
        }
      }));
      
      // Save to AsyncStorage - full settings
      const updatedSettings = {
        ...settings,
        userProfile: {
          ...settings.userProfile,
          ...updatedProfile
        }
      };
      await saveData(STORAGE_KEYS.SETTINGS, updatedSettings);
      
      // Also save user profile separately for easier access
      await saveData(STORAGE_KEYS.USER_PROFILE, updatedSettings.userProfile);
      
      return updatedSettings.userProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      showError('Failed to update user profile');
      throw error;
    }
  };
  
  
  // Link milestones to goals by title (cleanup function)
  const linkMilestonesToGoalsByTitle = async () => {
    try {
      let fixCount = 0;
      
      // Look for milestones without goalId but with goalTitle
      const updatedMilestones = milestones.map(milestone => {
        if (!milestone.goalId && milestone.goalTitle) {
          // Try to find goal by title
          const matchingGoal = goals.find(goal => 
            goal.title.toLowerCase() === milestone.goalTitle.toLowerCase()
          );
          
          if (matchingGoal) {
            fixCount++;
            return {
              ...milestone,
              goalId: matchingGoal.id,
              goalTitle: matchingGoal.title, // Ensure exact case match
              // Inherit domain and color if not already set
              domain: milestone.domain || matchingGoal.domain,
              color: milestone.color || matchingGoal.color
            };
          }
        }
        
        return milestone;
      });
      
      if (fixCount > 0) {
        // Update state
        setMilestones(updatedMilestones);
        
        // Save to AsyncStorage
        await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
        
        // Update link map
        const updatedLinkMap = { ...milestoneGoalLinkMap };
        updatedMilestones.forEach(milestone => {
          if (milestone.goalId) {
            updatedLinkMap[milestone.id] = milestone.goalId;
          }
        });
        
        setMilestoneGoalLinkMap(updatedLinkMap);
        await saveData('milestoneGoalLinkMap', updatedLinkMap);
        
        showSuccess(`Fixed ${fixCount} milestone-goal relationships`);
        return fixCount;
      }
      
      return 0;
    } catch (error) {
      console.error('Error linking milestones to goals:', error);
      showError('Failed to link milestones to goals');
      throw error;
    }
  };
  
  // Clean up orphaned milestones
  const cleanupOrphanedMilestones = async () => {
    try {
      // Find milestones with goalId that doesn't exist in goals
      const validGoalIds = goals.map(goal => goal.id);
      const orphanedMilestones = milestones.filter(milestone => 
        milestone.goalId && !validGoalIds.includes(milestone.goalId)
      );
      
      if (orphanedMilestones.length > 0) {
        console.log(`Found ${orphanedMilestones.length} orphaned milestones to clean up`);
        
        // Get all orphaned milestone IDs
        const orphanedIds = orphanedMilestones.map(milestone => milestone.id);
        
        // Mark as being deleted
        orphanedIds.forEach(id => {
          deletedMilestoneIds.current.add(id);
          operationsInProgress.current.deletingMilestones.add(id);
        });
        
        // Option 1: Delete orphaned milestones
        // setMilestones(prevMilestones => 
        //   prevMilestones.filter(milestone => !orphanedIds.includes(milestone.id))
        // );
        
        // Option 2: Make orphaned milestones independent
        setMilestones(prevMilestones => 
          prevMilestones.map(milestone => {
            if (milestone.goalId && !validGoalIds.includes(milestone.goalId)) {
              // Convert to independent milestone
              return {
                ...milestone,
                goalId: null,
                goalTitle: null
              };
            }
            return milestone;
          })
        );
        
        // Save to AsyncStorage - Option 2 implementation
        const updatedMilestones = milestones.map(milestone => {
          if (milestone.goalId && !validGoalIds.includes(milestone.goalId)) {
            return {
              ...milestone,
              goalId: null,
              goalTitle: null
            };
          }
          return milestone;
        });
        
        await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
        
        // Update link map
        const updatedLinkMap = { ...milestoneGoalLinkMap };
        orphanedIds.forEach(milestoneId => {
          delete updatedLinkMap[milestoneId];
        });
        setMilestoneGoalLinkMap(updatedLinkMap);
        await saveData('milestoneGoalLinkMap', updatedLinkMap);
        
        // Clear deletion tracking after a delay
        setTimeout(() => {
          orphanedIds.forEach(id => {
            deletedMilestoneIds.current.delete(id);
            operationsInProgress.current.deletingMilestones.delete(id);
          });
        }, 1000);
        
        console.log(`Cleaned up ${orphanedMilestones.length} orphaned milestones`);
        return orphanedMilestones.length;
      }
      
      return 0;
    } catch (error) {
      console.error('Error cleaning up orphaned milestones:', error);
      return 0;
    }
  };
  
  // Milestone-Goal Link Debugging Function
  const debugMilestoneGoalLinks = async () => {
    console.log("==== DEBUG: Milestone-Goal Links ====");
    
    try {
      // Get data from storage for verification
      const goalsString = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      const milestonesString = await AsyncStorage.getItem(STORAGE_KEYS.MILESTONES);
      const linkMapString = await AsyncStorage.getItem('milestoneGoalLinkMap');
      
      const storedGoals = goalsString ? JSON.parse(goalsString) : [];
      const storedMilestones = milestonesString ? JSON.parse(milestonesString) : [];
      const storedLinkMap = linkMapString ? JSON.parse(linkMapString) : {};
      
      console.log(`Found ${storedGoals.length} goals, ${storedMilestones.length} milestones, ${Object.keys(storedLinkMap).length} link map entries`);
      
      // Check each goal
      storedGoals.forEach(goal => {
        const goalId = goal.id;
        
        // Find milestones linked by property
        const linkedByProperty = storedMilestones.filter(p => p.goalId === goalId);
        
        // Find milestones linked by map
        const linkedByMap = Object.entries(storedLinkMap)
          .filter(([_, gId]) => gId === goalId)
          .map(([pId]) => storedMilestones.find(p => p.id === pId))
          .filter(Boolean);
        
        // Find milestones that are only linked one way
        const onlyInProperty = linkedByProperty.filter(p => 
          !linkedByMap.some(mp => mp.id === p.id)
        );
        
        const onlyInMap = linkedByMap.filter(p => 
          !linkedByProperty.some(pp => pp.id === p.id)
        );
        
        console.log(`Goal "${goal.title}" (${goalId}):`);
        console.log(`- Milestones by property: ${linkedByProperty.length}`);
        console.log(`- Milestones by map: ${linkedByMap.length}`);
        
        if (onlyInProperty.length > 0) {
          console.log(`- WARNING: ${onlyInProperty.length} milestones only linked by property:`);
          onlyInProperty.forEach(p => console.log(`  - ${p.title} (${p.id})`));
        }
        
        if (onlyInMap.length > 0) {
          console.log(`- WARNING: ${onlyInMap.length} milestones only linked by map:`);
          onlyInMap.forEach(p => console.log(`  - ${p.title} (${p.id})`));
        }
      });
      
      // Check for orphaned milestones in the link map
      const orphanedLinks = Object.entries(storedLinkMap).filter(([milestoneId, goalId]) => {
        const milestoneExists = storedMilestones.some(p => p.id === milestoneId);
        const goalExists = storedGoals.some(g => g.id === goalId);
        return !milestoneExists || !goalExists;
      });
      
      if (orphanedLinks.length > 0) {
        console.log(`WARNING: Found ${orphanedLinks.length} orphaned entries in the link map`);
        orphanedLinks.forEach(([milestoneId, goalId]) => {
          console.log(`- Milestone ${milestoneId} -> Goal ${goalId}`);
        });
      }
      
      console.log("==== END DEBUG ====");
      return true;
    } catch (error) {
      console.error("Error in debugMilestoneGoalLinks:", error);
      return false;
    }
  };
  
  // Fix Milestone-Goal Links Function
  const fixMilestoneGoalLinks = async () => {
    console.log("Starting milestone-goal link repair...");
    
    try {
      // Get data from storage
      const goalsString = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      const milestonesString = await AsyncStorage.getItem(STORAGE_KEYS.MILESTONES);
      const linkMapString = await AsyncStorage.getItem('milestoneGoalLinkMap');
      
      const storedGoals = goalsString ? JSON.parse(goalsString) : [];
      const storedMilestones = milestonesString ? JSON.parse(milestonesString) : [];
      let storedLinkMap = linkMapString ? JSON.parse(linkMapString) : {};
      
      console.log(`Found ${storedGoals.length} goals, ${storedMilestones.length} milestones, ${Object.keys(storedLinkMap).length} link map entries`);
      
      // Create set of valid goal IDs
      const validGoalIds = new Set(storedGoals.map(g => g.id));
      
      // Track changes
      let milestonesFixed = 0;
      let linkMapFixed = 0;
      let orphanedMilestonesFixed = 0;
      
      // 1. Fix milestones - ensure goalId references valid goals
      const fixedMilestones = storedMilestones.map(milestone => {
        if (milestone.goalId && !validGoalIds.has(milestone.goalId)) {
          // This milestone references a non-existent goal
          console.log(`Fixing milestone "${milestone.title}" - invalid goalId: ${milestone.goalId}`);
          milestonesFixed++;
          return { ...milestone, goalId: null, goalTitle: null };
        }
        return milestone;
      });
      
      // 2. Fix link map - ensure all entries reference valid goals and milestones
      const newLinkMap = {};
      
      // First add all valid entries from current link map
      Object.entries(storedLinkMap).forEach(([milestoneId, goalId]) => {
        const milestoneExists = storedMilestones.some(p => p.id === milestoneId);
        const goalExists = validGoalIds.has(goalId);
        
        if (milestoneExists && goalExists) {
          newLinkMap[milestoneId] = goalId;
        } else {
          console.log(`Removing invalid link map entry: Milestone ${milestoneId} -> Goal ${goalId}`);
          linkMapFixed++;
        }
      });
      
      // 3. Ensure all milestones with goalId are in the link map
      fixedMilestones.forEach(milestone => {
        if (milestone.goalId && validGoalIds.has(milestone.goalId) && !newLinkMap[milestone.id]) {
          console.log(`Adding missing link map entry for milestone "${milestone.title}"`);
          newLinkMap[milestone.id] = milestone.goalId;
          linkMapFixed++;
        }
      });
      
      // 4. Update storage if needed
      if (milestonesFixed > 0) {
        console.log(`Saving ${milestonesFixed} fixed milestones to storage`);
        await AsyncStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(fixedMilestones));
        setMilestones(fixedMilestones);
      }
      
      if (linkMapFixed > 0) {
        console.log(`Saving ${linkMapFixed} fixed link map entries to storage`);
        await AsyncStorage.setItem('milestoneGoalLinkMap', JSON.stringify(newLinkMap));
        setMilestoneGoalLinkMap(newLinkMap);
      }
      
      // Log results
      console.log(`Repair complete: ${milestonesFixed} milestones fixed, ${linkMapFixed} link map entries fixed`);
      
      if (milestonesFixed > 0 || linkMapFixed > 0) {
        // Force a refresh
        await refreshData();
        showSuccess(`Fixed ${milestonesFixed + linkMapFixed} milestone-goal links`);
      }
      
      return { milestonesFixed, linkMapFixed };
    } catch (error) {
      console.error("Error fixing milestone-goal links:", error);
      showError("Failed to fix milestone-goal links");
      return { error };
    }
  };
  
  // Force refresh data (useful after operations that might leave orphaned references)
  const refreshData = async () => {
    try {
      console.log('Forcing data refresh...');
      
      // First clean up any orphaned milestones
      const cleanupCount = await cleanupOrphanedMilestones();
      console.log(`Cleaned up ${cleanupCount} orphaned milestones`);
      
      // Reload all data from storage
      const storedGoals = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      const storedMilestones = await AsyncStorage.getItem(STORAGE_KEYS.MILESTONES);
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      const storedTodos = await AsyncStorage.getItem(STORAGE_KEYS.TODOS);
      const storedTomorrowTodos = await AsyncStorage.getItem(STORAGE_KEYS.TOMORROW_TODOS);
      const storedLaterTodos = await AsyncStorage.getItem(STORAGE_KEYS.LATER_TODOS);
      
      console.log('🔍 refreshData() - Raw AsyncStorage values:');
      console.log('  - storedGoals:', storedGoals);
      console.log('  - storedMilestones:', storedMilestones);
      console.log('  - storedTasks:', storedTasks);
      
      if (storedGoals) {
        const parsedGoals = JSON.parse(storedGoals);
        console.log('📝 Setting goals to:', parsedGoals.length, 'items');
        setGoals(parsedGoals);
      } else {
        console.log('📝 No stored goals, setting to empty array');
        setGoals([]);
      }
      
      if (storedMilestones) {
        const parsedMilestones = JSON.parse(storedMilestones);
        console.log('📝 Setting milestones to:', parsedMilestones.length, 'items');
        setMilestones(parsedMilestones);
      } else {
        console.log('📝 No stored milestones, setting to empty array');
        setMilestones([]);
      }
      
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        console.log('📝 Setting tasks to:', parsedTasks.length, 'items');
        setTasks(parsedTasks);
      } else {
        console.log('📝 No stored tasks, setting to empty array');
        setTasks([]);
      }
      
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      }
      
      if (storedTomorrowTodos) {
        setTomorrowTodos(JSON.parse(storedTomorrowTodos));
      }
      
      if (storedLaterTodos) {
        setLaterTodos(JSON.parse(storedLaterTodos));
      }
      
      // Increment refresh counter to trigger UI updates
      setRefreshCounter(prev => prev + 1);
      
      console.log('Data refresh complete');
      return true;
    } catch (error) {
      console.error('Error refreshing data:', error);
      return false;
    }
  };
  
  // Force refresh domains
  const refreshDomains = useCallback(() => {
    console.log('Calculating domains from goals...');
    
    // Use the new standardized domain distribution function
    const refreshedDomains = calculateDomainDistribution(goalsRef.current);
    
    // Update domains state
    setDomains(refreshedDomains);
    
    // Save to AsyncStorage
    saveData(STORAGE_KEYS.DOMAINS, refreshedDomains)
      .then(() => {
        console.log(`Refreshed ${refreshedDomains.length} domains`);
      })
      .catch(error => {
        console.error('Error saving refreshed domains:', error);
      });
    
    return refreshedDomains;
  }, [goals]);
  
  // Update milestone progress with atomic update to ensure goal progress is updated
  const updateMilestoneProgress = async (milestoneId, newProgress) => {
    try {
      console.log(`🔵 [DEBUG] updateMilestoneProgress called - Milestone: ${milestoneId}, Progress: ${newProgress}`);
      
      // Use current refs to avoid stale closure
      const currentMilestones = milestonesRef.current;
      const currentGoals = goalsRef.current;
      const currentTasks = tasksRef.current;
      
      // Find the milestone
      const milestone = currentMilestones.find(p => p.id === milestoneId);
      if (!milestone) {
        console.error(`Milestone with ID ${milestoneId} not found`);
        return false;
      }
      
      // Get previous status
      const prevStatus = milestone.status || 
                         (milestone.progress === 100 ? 'done' : 
                          milestone.progress > 0 ? 'in_progress' : 'todo');
      
      // Determine the new status based on the newProgress parameter
      let newStatus;
      if (newProgress === 0) newStatus = 'todo';
      else if (newProgress === 50) newStatus = 'in_progress';
      else if (newProgress === 100) newStatus = 'done';
      
      // Get tasks for this milestone
      const milestoneTasks = Array.isArray(currentTasks) 
        ? currentTasks.filter(task => task.milestoneId === milestoneId)
        : [];
      
      // Calculate task-based progress
      let taskBasedProgress;
      if (milestoneTasks.length > 0) {
        const completedTasks = milestoneTasks.filter(task => task.completed || task.status === 'done').length;
        taskBasedProgress = Math.round((completedTasks / milestoneTasks.length) * 100);
      } else {
        // If no tasks, keep the existing progress value
        taskBasedProgress = milestone.progress || 0;
      }
      
      console.log(`[AppContext] Task-based progress for milestone "${milestone.title}": ${taskBasedProgress}%`);
      console.log(`[AppContext] Setting milestone status to "${newStatus}" without changing progress`);
      
      // Create updated milestone
      const updatedMilestone = {
        ...milestone,
        status: newStatus, // Set explicit status property
        statusProgress: newProgress, // Store status indicator value
        // Use status-based progress when manually set to done, otherwise use task-based
        progress: newStatus === 'done' ? 100 : taskBasedProgress,
        completed: newStatus === 'done', // Only mark as completed if 100%
        updatedAt: new Date().toISOString()
      };
      
      console.log(`🟢 [DEBUG] Milestone update created:`, {
        id: milestoneId,
        title: milestone.title,
        oldStatus: milestone.status,
        newStatus: newStatus,
        oldProgress: milestone.progress,
        newProgress: updatedMilestone.progress,
        completed: updatedMilestone.completed
      });
      
      // First update the milestone in state and storage
      const updatedMilestones = currentMilestones.map(p => 
        p.id === milestoneId ? updatedMilestone : p
      );
      
      // Update state
      setMilestones(updatedMilestones);
      console.log(`🟡 [DEBUG] Milestone state updated in memory`);
      
      // Update storage
      await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
      console.log(`🟡 [DEBUG] Milestone state saved to storage`);
      
      // Next, check if this milestone is linked to a goal
      if (milestone.goalId) {
        // Calculate goal progress if we can
        const milestonesForGoal = updatedMilestones.filter(p => p.goalId === milestone.goalId);
        const completedMilestones = milestonesForGoal.filter(p => 
          p.id === milestoneId ? newStatus === 'done' : (p.progress === 100 || p.completed || p.status === 'done')
        ).length;
        
        const newGoalProgress = Math.round((completedMilestones / milestonesForGoal.length) * 100);
        
        // Find the goal
        const goalToUpdate = currentGoals.find(g => g.id === milestone.goalId);
        if (goalToUpdate) {
          const updatedGoal = {
            ...goalToUpdate,
            progress: newGoalProgress,
            updatedAt: new Date().toISOString()
          };
          
          // Update the goal
          if (typeof updateGoal === 'function') {
            updateGoal(updatedGoal);
          }
        }
      }
      
      // Show success notification
      if (showSuccess) {
        showSuccess(`Milestone moved to ${newStatus === 'todo' ? 'To Do' : newStatus === 'in_progress' ? 'In Progress' : 'Done'}`);
      }
      
      // Note: Removed automatic refreshData call to prevent interference with manual completion
      // The state updates above should be sufficient for UI consistency
      
      return true;
    } catch (error) {
      console.error("Error in updateMilestoneProgress:", error);
      
      // Show error notification
      if (showError) {
        showError("An error occurred. Please try again.");
      }
      
      return false;
    }
  };
  
  // ========================
  // Calendar Functions
  // ========================
  
  // Calendar permission management
  const requestCalendarPermissions = async () => {
    try {
      const result = await CalendarService.requestCalendarPermissions();
      setCalendarPermissionStatus(result.status);
      return result;
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return { status: 'denied', error: error.message };
    }
  };
  
  const getCalendarPermissionStatus = async () => {
    try {
      const result = await CalendarService.getCalendarPermissionStatus();
      setCalendarPermissionStatus(result.status);
      return result;
    } catch (error) {
      console.error('Error getting calendar permission status:', error);
      return { status: 'undetermined', error: error.message };
    }
  };
  
  // Calendar settings management
  const updateCalendarSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...calendarSettings, ...newSettings };
      setCalendarSettings(updatedSettings);
      await AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_SETTINGS, JSON.stringify(updatedSettings));
      
      // Update CalendarService settings
      if (newSettings.syncEnabled !== undefined) {
        await CalendarService.enableCalendarSync(newSettings.syncEnabled);
      }
      
      if (newSettings.selectedCalendarId) {
        await CalendarService.setSelectedCalendar(newSettings.selectedCalendarId);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating calendar settings:', error);
      if (showError) showError('Failed to update calendar settings');
      return { success: false, error: error.message };
    }
  };
  
  // Calendar events management
  const loadCalendarEvents = async (dateRange = null) => {
    try {
      // Check permission status before making calendar calls
      const permissionStatus = await getCalendarPermissionStatus();
      if (permissionStatus.status !== 'granted') {
        console.log('Calendar permission not granted, skipping calendar events load');
        setCalendarEvents([]);
        return { success: false, reason: 'Calendar permission not granted' };
      }

      let events;
      
      if (dateRange) {
        events = await CalendarService.getEventsForDateRange(dateRange.start, dateRange.end);
      } else {
        // Load events for current week by default
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        events = await CalendarService.getEventsForDateRange(startOfWeek, endOfWeek);
      }
      
      setCalendarEvents(events);
      
      // Cache events
      await AsyncStorage.setItem(STORAGE_KEYS.CALENDAR_EVENTS, JSON.stringify(events));
      
      return { success: true, events };
    } catch (error) {
      console.error('Error loading calendar events:', error);
      return { success: false, error: error.message };
    }
  };
  
  const getCalendarEventsForDate = async (date) => {
    try {
      // Check permission status before making calendar calls
      const permissionStatus = await getCalendarPermissionStatus();
      if (permissionStatus.status !== 'granted') {
        console.log('Calendar permission not granted, returning empty events array');
        return [];
      }

      const events = await CalendarService.getEventsForDate(date);
      return events;
    } catch (error) {
      console.error('Error getting calendar events for date:', error);
      return [];
    }
  };
  
  // Time block calendar integration
  const syncTimeBlockToCalendar = async (timeBlock) => {
    if (!calendarSettings.syncEnabled || !calendarSettings.autoSyncTimeBlocks) {
      return { success: false, reason: 'Calendar sync disabled' };
    }
    
    try {
      const result = await CalendarService.syncTimeBlockToCalendar(timeBlock);
      
      if (result.success) {
        // Update time block with calendar event ID
        const updatedTimeBlocks = timeBlocks.map(tb => 
          tb.id === timeBlock.id 
            ? { ...tb, calendarEventId: result.calendarEventId }
            : tb
        );
        
        setTimeBlocks(updatedTimeBlocks);
        await AsyncStorage.setItem(STORAGE_KEYS.TIME_BLOCKS, JSON.stringify(updatedTimeBlocks));
      }
      
      return result;
    } catch (error) {
      console.error('Error syncing time block to calendar:', error);
      return { success: false, error: error.message };
    }
  };
  
  const updateTimeBlockInCalendar = async (timeBlock) => {
    if (!calendarSettings.syncEnabled || !timeBlock.calendarEventId) {
      return { success: false, reason: 'Calendar sync disabled or no calendar event' };
    }
    
    try {
      return await CalendarService.updateTimeBlockInCalendar(timeBlock, timeBlock.calendarEventId);
    } catch (error) {
      console.error('Error updating time block in calendar:', error);
      return { success: false, error: error.message };
    }
  };
  
  const deleteTimeBlockFromCalendar = async (timeBlock) => {
    if (!calendarSettings.syncEnabled || !timeBlock.calendarEventId) {
      return { success: false, reason: 'Calendar sync disabled or no calendar event' };
    }
    
    try {
      return await CalendarService.deleteTimeBlockFromCalendar(timeBlock.calendarEventId);
    } catch (error) {
      console.error('Error deleting time block from calendar:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Get available calendars
  const getAvailableCalendars = async () => {
    try {
      // Check permission status before making calendar calls
      const permissionStatus = await getCalendarPermissionStatus();
      if (permissionStatus.status !== 'granted') {
        console.log('Calendar permission not granted, returning empty calendars array');
        return [];
      }

      return await CalendarService.getAvailableCalendars();
    } catch (error) {
      console.error('Error getting available calendars:', error);
      return [];
    }
  };
  
  // Get calendar integration status
  const getCalendarIntegrationStatus = () => {
    return {
      ...CalendarService.getIntegrationStatus(),
      permissionStatus: calendarPermissionStatus,
      settings: calendarSettings
    };
  };
  
  // Function to update purchase status (lifetime or free)
  const updatePurchaseStatus = async (status, shouldShowGift = true) => {
    try {
      const previousStatus = userSubscriptionStatus;
      
      console.log(`🎁 APPCONTEXT DEBUG: previousStatus: ${previousStatus}, newStatus: ${status}`);
      
      // Update state
      setUserSubscriptionStatus(status);
      
      // Save to AsyncStorage (using original key name for compatibility)
      await AsyncStorage.setItem('subscriptionStatus', status);
      
      // Increment refresh counter to trigger UI updates
      setRefreshCounter(prev => prev + 1);
      
      // Check if this is an upgrade to Pro and user hasn't received gift yet
      const isUpgradeToPro = (previousStatus === 'free' || previousStatus === 'founding') && status === 'pro';
      const hasReceivedGift = await AsyncStorage.getItem('proGiftReceived');
      
      console.log(`🎁 APPCONTEXT DEBUG: isUpgradeToPro: ${isUpgradeToPro}, hasReceivedGift: ${hasReceivedGift}, shouldShowGift: ${shouldShowGift}`);
      
      if (isUpgradeToPro && !hasReceivedGift && shouldShowGift) {
        // Set a flag to trigger the gift surprise
        await AsyncStorage.setItem('showProGiftSurprise', 'true');
        console.log(`🎁 APPCONTEXT: Pro upgrade detected, gift surprise queued`);
      }
      
      console.log(`[AppContext] Updated purchase status to: ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating purchase status:', error);
      showError('Failed to update purchase status');
      return false;
    }
  };
  
  // Data cleanup function
  const cleanupOrphanedData = async () => {
    try {
      console.log('[AppContext] Running data cleanup to remove orphaned items...');
      const auditResult = await DataIntegrityService.auditDataIntegrity();
      
      if (auditResult.fixesApplied > 0) {
        console.log(`[AppContext] Data cleanup applied ${auditResult.fixesApplied} fixes`);
        
        // Reload data after cleanup
        await refreshData();
        showSuccess(`Cleaned up ${auditResult.fixesApplied} orphaned items`);
      } else {
        console.log('[AppContext] No orphaned items found');
        showSuccess('No orphaned items found - data is clean');
      }
      
      return auditResult;
    } catch (error) {
      console.error('[AppContext] Data cleanup failed:', error);
      showError('Failed to cleanup orphaned data');
      return { success: false, error: error.message };
    }
  };

  // Alias mainGoals to goals for backward compatibility
  const mainGoals = goals;
  
  // Export all functions and state
  const contextValue = {
    // State
    goals,
    mainGoals, // Alias for backward compatibility
    milestones,
    projects: milestones, // Alias for backward compatibility
    timeBlocks,
    domains,
    settings,
    tags,
    notes,
    filters,
    isLoading,
    milestoneGoalLinkMap,
    tasks,
    refreshCounter, // Include refresh counter in context value
    // Todo states
    todos,
    tomorrowTodos,
    laterTodos,
    
    // Calendar states
    calendarSettings,
    calendarEvents,
    calendarPermissionStatus,
    
    // User purchase status
    userSubscriptionStatus,
    
    // User country
    userCountry,
    
    // State setters
    setGoals,
    setMilestones,
    setProjects: setMilestones, // Alias for backward compatibility
    setTasks,
    setNotes,
    setTodos,
    setTomorrowTodos,
    setLaterTodos,
    
    // Helper functions for components
    getMilestone,
    isMilestoneActive,
    isGoalActive,
    hasParentGoal,
    getParentGoal,
    getMilestonesForGoal,
    getIndependentMilestones,
    getTasksForMilestone,
    calculateGoalProgress: calculateGoalProgressLegacy,
    calculateMilestoneProgress,
    
    // NEW FLEXIBLE HIERARCHY FUNCTIONS
    getStandaloneMilestones,
    getStandaloneTasks,
    getPopulatedStandaloneMilestones,
    getDirectTasksForGoal,
    getTasksForPopulatedStandaloneMilestone,
    
    // Goal functions
    addGoal,
    updateGoal,
    deleteGoal,
    
    // Milestone functions
    addMilestone,
    updateMilestone,
    deleteMilestone,
    // Aliases for backward compatibility
    addProject: addMilestone,
    updateProject: updateMilestone,
    deleteProject: deleteMilestone,
    updateMilestoneProgress,
    updateMilestoneProgressFromTasks,
    updateGoalProgressFromMilestones,
    
    // Task functions
    addTask,
    addTasksBulk,
    updateTask,
    deleteTask,
    deleteTasksBulk,
    
    // Note functions
    updateNotes,
    
    // Time block functions
    addTimeBlock,
    addTimeBlockSkipConflicts,
    updateTimeBlock,
    updateTimeBlockSeries,
    createNewTimeBlockSeries,
    checkTimeBlockConflicts,
    checkRecurringTimeBlockConflicts,
    deleteTimeBlock,
    countTimeBlocksThisWeek,
    generateAdditionalRecurringInstances,
    
    // Todo functions
    addTodo,
    updateTodos,
    deleteTodo,
    toggleTodo,
    
    // Custom Prompt functions
    customPrompts,
    addCustomPrompt,
    updateCustomPrompt,
    deleteCustomPrompt,
    getCustomPromptsForType,
    
    // Calendar functions
    requestCalendarPermissions,
    getCalendarPermissionStatus,
    updateCalendarSettings,
    loadCalendarEvents,
    getCalendarEventsForDate,
    syncTimeBlockToCalendar,
    updateTimeBlockInCalendar,
    deleteTimeBlockFromCalendar,
    getAvailableCalendars,
    getCalendarIntegrationStatus,
    
    // Domain functions
    updateDomain,
    refreshDomains,
    
    // Settings functions
    updateAppSetting,
    updateUserProfile,
    
    // User purchase status function
    updatePurchaseStatus,
    
    // Subscription limit checks
    canAddMoreGoals,
    canAddMoreMilestonesToGoal,
    canAddMoreTasksToMilestone,
    canAddMoreTimeBlocks,
    
    // Utility functions
    linkMilestonesToGoalsByTitle,
    auditMilestoneGoalRelationships,
    cleanupOrphanedMilestones,
    cleanupOrphanedData,
    refreshData,
    fixMilestoneGoalLinks,
    debugMilestoneGoalLinks
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  // Add safety defaults to prevent "property doesn't exist" errors
  return context || {
    goals: [],
    milestones: [],
    tasks: [],
    timeBlocks: [],
    domains: [],
    settings: {},
    tags: [],
    notes: [],
    filters: {},
    todos: [],
    tomorrowTodos: [],
    laterTodos: [],
    refreshCounter: 0,
    userSubscriptionStatus: 'free',
    // Empty function placeholders to prevent undefined function errors
    addGoal: () => null,
    updateGoal: () => null,
    deleteGoal: () => null,
    addMilestone: () => null,
    updateMilestone: () => null,
    deleteMilestone: () => null,
    addTask: () => null,
    addTasksBulk: () => null,
    updateTask: () => null,
    deleteTask: () => null,
    deleteTasksBulk: () => null,
    setNotes: () => null
  };
};

export default AppContext;