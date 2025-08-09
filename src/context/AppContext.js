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

// Import calendar service
import CalendarService from '../services/CalendarService';

const AppContext = createContext();

// Storage keys for app data
const STORAGE_KEYS = {
  LIFE_DIRECTION: 'lifeDirection',
  GOALS: 'goals',
  PROJECTS: 'projects',
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
  CALENDAR_EVENTS: 'calendarEvents'
};

// Default app settings
const DEFAULT_SETTINGS = {
  onboardingCompleted: false,
  reminderEnabled: true,
  reminderTime: '09:00',
  darkMode: false,
  notificationsEnabled: true,
  userProfile: {
    name: '',
    email: '',
    bio: '',
    profileImage: null
  },
  lifeDirection: ''
};

// Provider component
export const AppProvider = ({ children }) => {
  // State
  const [goals, setGoals] = useState([]);
  const [projects, setProjectsInternal] = useState([]);
  const [timeBlocks, setTimeBlocks] = useState([]);
  
  // Clean setProjects function
  const setProjects = setProjectsInternal;
  const [domains, setDomains] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState([]);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [projectGoalLinkMap, setProjectGoalLinkMap] = useState({});
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
  
  // Add refresh counter to trigger UI updates
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Keep track of deleted project IDs to prevent race conditions
  const deletedProjectIds = useRef(new Set());
  // Keep track of operations in progress
  const operationsInProgress = useRef({
    deletingGoals: new Set(),
    deletingProjects: new Set(),
    updatingProjects: new Set()
  });
  
  // Add refs to always have latest state
  const goalsRef = useRef(goals);
  const projectsRef = useRef(projects);
  const tasksRef = useRef(tasks);
  const todosRef = useRef(todos);
  const tomorrowTodosRef = useRef(tomorrowTodos);
  const laterTodosRef = useRef(laterTodos);
  
  // Update refs when state changes
  useEffect(() => {
    goalsRef.current = goals;
  }, [goals]);
  
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);
  
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
          setGoals(JSON.parse(storedGoals));
        }
        
        // Load projects
        const storedProjects = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
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
        
        // Load project-goal link map
        const storedLinkMap = await AsyncStorage.getItem('projectGoalLinkMap');
        if (storedLinkMap) {
          setProjectGoalLinkMap(JSON.parse(storedLinkMap));
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
        
        // Check if goals and projects are linked correctly
        if (storedGoals && storedProjects) {
          auditProjectGoalRelationships(JSON.parse(storedGoals), JSON.parse(storedProjects));
        }
        
        // Fix any project-goal link inconsistencies
        await fixProjectGoalLinks();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Helper function to calculate goal progress from projects
  const calculateGoalProgress = useCallback((goalId, currentProjects = null) => {
    const projectsToUse = currentProjects || projectsRef.current;
    if (!Array.isArray(projectsToUse)) return 0;
    
    const goalProjects = projectsToUse.filter(project => project.goalId === goalId);
    if (goalProjects.length === 0) return 0;
    
    // IMPORTANT: Only count projects that are EXPLICITLY marked as completed
    // Ignore task-based progress (even if it's 100%)
    const completedProjects = goalProjects.filter(project => 
      project.completed === true || project.status === 'done'
    ).length;
    
    return Math.round((completedProjects / goalProjects.length) * 100);
  }, []);
  
  // Helper function to calculate project progress from tasks
  const calculateProjectProgress = useCallback((projectId, currentTasks = null) => {
    const tasksToUse = currentTasks || tasksRef.current;
    if (!Array.isArray(tasksToUse)) return 0;
    
    // Get the current project
    const project = projectsRef.current.find(p => p.id === projectId);
    
    // If project is already marked as completed, always return 100%
    if (project && project.status === 'done' && project.completed) return 100;
    
    // Calculate based on tasks
    const projectTasks = tasksToUse.filter(task => task.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    
    const completedTasks = projectTasks.filter(task => task.completed || task.status === 'done').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  }, []);
  
  // Helper function to check if a project exists and is not in the deleted list
  const isProjectActive = (projectId) => {
    if (!projectId) return false;
    if (deletedProjectIds.current.has(projectId)) return false;
    if (operationsInProgress.current.deletingProjects.has(projectId)) return false;
    return Array.isArray(projects) && projects.some(project => project.id === projectId);
  };
  
  // Helper function to check if a goal exists
  const isGoalActive = (goalId) => {
    if (!goalId) return false;
    if (operationsInProgress.current.deletingGoals.has(goalId)) return false;
    return Array.isArray(goals) && goals.some(goal => goal.id === goalId);
  };
  
  // Get project object safely
  const getProject = (projectId) => {
    if (!isProjectActive(projectId)) {
      return null;
    }
    return projects.find(project => project.id === projectId);
  };
  
  // Helper function to check if a project has a parent goal
  const hasParentGoal = (projectId) => {
    const project = getProject(projectId);
    if (!project) return false;
    
    // Check if project has a goalId and if the goal exists
    return !!(project.goalId && isGoalActive(project.goalId));
  };
  
  // Get parent goal for a project (safely)
  const getParentGoal = (projectId) => {
    const project = getProject(projectId);
    if (!project || !project.goalId) return null;
    
    return goals.find(goal => goal.id === project.goalId) || null;
  };
  
  // Get all projects for a goal - IMPROVED to check both goalId and projectGoalLinkMap
  const getProjectsForGoal = (goalId) => {
    // Use current ref to get the latest state including recent completions
    const currentProjects = projectsRef.current;
    if (!goalId || !Array.isArray(currentProjects)) {
      deletionLog(`getProjectsForGoal: Invalid input - goalId: ${goalId}, projects array: ${Array.isArray(currentProjects)}`);
      return [];
    }
    
    // Force log to appear
    log('Error', `🔍 getProjectsForGoal CALLED: Looking for projects linked to goal ${goalId}`);
    log('Error', `🔍 getProjectsForGoal: Total projects in memory: ${currentProjects.length}`);
    
    deletionLog(`getProjectsForGoal: Looking for projects linked to goal ${goalId}`);
    deletionLog(`getProjectsForGoal: Total projects in memory: ${currentProjects.length}`);
    deletionLog(`getProjectsForGoal: Deleted project IDs: [${Array.from(deletedProjectIds.current).join(', ')}]`);
    deletionLog(`getProjectsForGoal: Projects in deletion progress: [${Array.from(operationsInProgress.current.deletingProjects).join(', ')}]`);
    
    // Get projects linked by goalId property
    const projectsByProperty = currentProjects.filter(project => {
      const hasGoalId = project.goalId === goalId;
      const notDeleted = !deletedProjectIds.current.has(project.id);
      const notInProgress = !operationsInProgress.current.deletingProjects.has(project.id);
      
      // Log EVERY project to see what's going on
      log('Error', `🔍 PROJECT CHECK: "${project.title}" (${project.id})`);
      log('Error', `  - goalId: "${project.goalId}" (target: "${goalId}")`);
      log('Error', `  - hasGoalId: ${hasGoalId}, notDeleted: ${notDeleted}, notInProgress: ${notInProgress}`);
      
      if (hasGoalId) {
        deletionLog(`getProjectsForGoal: Project "${project.title}" (${project.id}) - goalId match: ${hasGoalId}, not deleted: ${notDeleted}, not in progress: ${notInProgress}`);
        log('Error', `✅ MATCH: "${project.title}" (${project.id}) goalId: ${project.goalId} === ${goalId}`);
      }
      
      // Also log projects that have goalIds but don't match
      if (project.goalId && project.goalId !== goalId) {
        log('Error', `❌ NO MATCH: "${project.title}" (${project.id}) goalId: ${project.goalId} !== ${goalId}`);
      }
      
      return hasGoalId && notDeleted && notInProgress;
    });
    
    deletionLog(`getProjectsForGoal: Found ${projectsByProperty.length} projects by goalId property`);
    
    // Get project IDs from the link map
    const projectIdsByMap = Object.entries(projectGoalLinkMap)
      .filter(([_, linkedGoalId]) => linkedGoalId === goalId)
      .map(([projectId]) => projectId);
    
    log('Error', `🗺️ LINK MAP CHECK: Found ${projectIdsByMap.length} project IDs in link map: [${projectIdsByMap.join(', ')}]`);
    log('Error', `🗺️ FULL LINK MAP:`, projectGoalLinkMap);
    
    deletionLog(`getProjectsForGoal: Found ${projectIdsByMap.length} project IDs in link map: [${projectIdsByMap.join(', ')}]`);
    
    // Get projects by IDs from linkMap (that aren't already found by property)
    const projectsByMap = currentProjects.filter(project => {
      const inLinkMap = projectIdsByMap.includes(project.id);
      const notAlreadyFound = !projectsByProperty.some(p => p.id === project.id);
      const notDeleted = !deletedProjectIds.current.has(project.id);
      const notInProgress = !operationsInProgress.current.deletingProjects.has(project.id);
      
      if (inLinkMap) {
        deletionLog(`getProjectsForGoal: Project "${project.title}" (${project.id}) from link map - not already found: ${notAlreadyFound}, not deleted: ${notDeleted}, not in progress: ${notInProgress}`);
      }
      
      return inLinkMap && notAlreadyFound && notDeleted && notInProgress;
    });
    
    deletionLog(`getProjectsForGoal: Found ${projectsByMap.length} additional projects from link map`);
    
    // Combine both lists
    const allProjects = [...projectsByProperty, ...projectsByMap];
    
    // Force log the result
    log('Error', `🎯 getProjectsForGoal RESULT: Returning ${allProjects.length} total projects for goal ${goalId}`);
    allProjects.forEach(p => log('Error', `  - "${p.title}" (${p.id})`));
    
    deletionLog(`getProjectsForGoal: Returning ${allProjects.length} total projects for goal ${goalId}`);
    allProjects.forEach(p => deletionLog(`  - "${p.title}" (${p.id})`));
    
    return allProjects;
  };
  
  // Get all independent projects
  const getIndependentProjects = () => {
    if (!Array.isArray(projects)) {
      return [];
    }
    return projects.filter(project => 
      !project.goalId && 
      !deletedProjectIds.current.has(project.id) &&
      !operationsInProgress.current.deletingProjects.has(project.id)
    );
  };
  
  // Get all tasks for a project
  const getTasksForProject = (projectId) => {
    if (!projectId || !Array.isArray(tasks)) {
      return [];
    }
    return tasks.filter(task => task.projectId === projectId);
  };
  
  // AUDIT: Check project-goal relationships for issues
  const auditProjectGoalRelationships = (projectsList, goalsList) => {
    if (!projectsList || !goalsList) return;
    
    let issuesFound = 0;
    let fixesApplied = 0;
    const updatedProjects = [...projectsList];
    const updatedLinkMap = { ...projectGoalLinkMap };
    let needsUpdate = false;
    
    // Check each project for valid goal references
    projectsList.forEach((project, index) => {
      if (project.goalId) {
        const goalExists = goalsList.some(goal => goal.id === project.goalId);
        if (!goalExists) {
          console.warn(`Project "${project.title}" (ID: ${project.id}) references nonexistent goal ID: ${project.goalId}`);
          
          // Try to fix by goalTitle
          if (project.goalTitle) {
            const matchingGoal = goalsList.find(goal => 
              goal.title.toLowerCase() === project.goalTitle.toLowerCase()
            );
            
            if (matchingGoal) {
              console.log(`Fixing goal link for project "${project.title}" - linking to goal "${matchingGoal.title}"`);
              updatedProjects[index].goalId = matchingGoal.id;
              updatedLinkMap[project.id] = matchingGoal.id;
              fixesApplied++;
              needsUpdate = true;
            } else {
              // Clear the invalid goal ID
              updatedProjects[index].goalId = null;
              delete updatedLinkMap[project.id];
              needsUpdate = true;
              issuesFound++;
            }
          }
        } else {
          // Goal exists, but check if goalTitle matches
          const goal = goalsList.find(g => g.id === project.goalId);
          if (goal && goal.title !== project.goalTitle) {
            console.log(`Fixing mismatched goal title for project "${project.title}" - should be "${goal.title}"`);
            updatedProjects[index].goalTitle = goal.title;
            needsUpdate = true;
            fixesApplied++;
          }
        }
      }
    });
    
    // Update projects and link map if issues were fixed
    if (needsUpdate) {
      console.log(`Applied ${fixesApplied} fixes to project-goal relationships`);
      setProjects(updatedProjects);
      setProjectGoalLinkMap(updatedLinkMap);
      
      // Save updated projects to AsyncStorage
      AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects))
        .then(() => {
          console.log('Fixed projects saved to AsyncStorage');
        })
        .catch(error => {
          console.error('Error saving fixed projects:', error);
        });
        
      // Save updated link map
      AsyncStorage.setItem('projectGoalLinkMap', JSON.stringify(updatedLinkMap))
        .catch(error => {
          console.error('Error saving link map:', error);
        });
    }
    
    if (issuesFound > 0) {
      console.warn(`Found ${issuesFound} project-goal relationship issues that could not be fixed automatically`);
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
   * Thoroughly cleans AsyncStorage after goal deletion to ensure no orphaned projects/tasks remain
   * @param {string} goalId - The ID of the deleted goal
   * @param {Array} linkedProjectIds - Array of project IDs that were linked to this goal
   * @returns {Promise<boolean>} - Success status
   */
  const cleanupAsyncStorageAfterGoalDeletion = async (goalId, linkedProjectIds) => {
    try {
      console.log(`Performing thorough AsyncStorage cleanup for goal ${goalId} and ${linkedProjectIds.length} linked projects`);
      
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
      
      // 2. Clean up projects in AsyncStorage
      const storedProjectsJson = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (storedProjectsJson) {
        const storedProjects = JSON.parse(storedProjectsJson);
        
        // Remove all linked projects AND any projects still referencing the deleted goal
        const updatedProjects = storedProjects.filter(project => {
          const isLinkedToDeletedGoal = linkedProjectIds.includes(project.id);
          const stillReferencesDeletedGoal = project.goalId === goalId;
          
          if (isLinkedToDeletedGoal || stillReferencesDeletedGoal) {
            console.log(`Removing project "${project.title}" (${project.id}) from AsyncStorage`);
            return false;
          }
          return true;
        });
        
        if (updatedProjects.length !== storedProjects.length) {
          console.log(`Removed ${storedProjects.length - updatedProjects.length} projects from AsyncStorage`);
          await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
        }
      }
      
      // 3. Clean up tasks in AsyncStorage
      const storedTasksJson = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      if (storedTasksJson) {
        const storedTasks = JSON.parse(storedTasksJson);
        
        // Remove all tasks linked to the deleted projects OR directly to the deleted goal
        const updatedTasks = storedTasks.filter(task => {
          const isFromDeletedProject = linkedProjectIds.includes(task.projectId);
          const isDirectlyLinkedToGoal = task.goalId === goalId;
          
          if (isFromDeletedProject || isDirectlyLinkedToGoal) {
            return false;
          }
          return true;
        });
        
        if (updatedTasks.length !== storedTasks.length) {
          console.log(`Removed ${storedTasks.length - updatedTasks.length} tasks from AsyncStorage`);
          await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
        }
      }
      
      // 4. Clean up project-goal link map
      const linkMapJson = await AsyncStorage.getItem('projectGoalLinkMap');
      if (linkMapJson) {
        const linkMap = JSON.parse(linkMapJson);
        let madeChanges = false;
        
        // Create a new map without the deleted projects
        const updatedLinkMap = { ...linkMap };
        
        // Remove by linked project IDs
        linkedProjectIds.forEach(projectId => {
          if (updatedLinkMap[projectId]) {
            delete updatedLinkMap[projectId];
            madeChanges = true;
          }
        });
        
        // Also remove any entries that still reference the deleted goal
        Object.entries(updatedLinkMap).forEach(([projectId, linkedGoalId]) => {
          if (linkedGoalId === goalId) {
            delete updatedLinkMap[projectId];
            madeChanges = true;
          }
        });
        
        if (madeChanges) {
          console.log(`Updated project-goal link map in AsyncStorage`);
          await AsyncStorage.setItem('projectGoalLinkMap', JSON.stringify(updatedLinkMap));
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
  
  // Check if user can add more projects to a goal
  const canAddMoreProjectsToGoal = (goalId) => {
    // Pro users have unlimited projects
    if (userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited') {
      return true;
    }
    
    // Free users are limited to X projects per goal
    const projectsForGoal = getProjectsForGoal(goalId);
    return projectsForGoal.length < FREE_PLAN_LIMITS.MAX_PROJECTS;
  };
  
  // Check if user can add more tasks to a project
  const canAddMoreTasksToProject = (projectId) => {
    // Pro users have unlimited tasks
    if (userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited') {
      return true;
    }
    
    // Free users are limited to X tasks per project
    const projectTasks = getTasksForProject(projectId);
    return projectTasks.length < FREE_PLAN_LIMITS.MAX_TASKS_PER_PROJECT;
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
      
      // Recalculate progress from projects, but preserve manual completion
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
      
      // Also update any projects associated with this goal
      updateProjectsForGoal(normalizedGoal);
      
      // Increment the refresh counter to trigger UI updates
      setRefreshCounter(prev => prev + 1);
      
      return normalizedGoal;
    } catch (error) {
      console.error('Error updating goal:', error);
      showError('Failed to update goal');
      throw error;
    }
  };
  
  // Update projects when goal changes
  const updateProjectsForGoal = async (updatedGoal) => {
    // Check if any projects are linked to this goal
    const linkedProjects = getProjectsForGoal(updatedGoal.id);
    
    if (linkedProjects.length > 0) {
      // Use current ref to get the latest state including recent completions
      const currentProjects = projectsRef.current;
      const updatedProjects = currentProjects.map(project => {
        if (project.goalId === updatedGoal.id) {
          // Update the goalTitle and inherit domain/color
          // CRITICAL: Preserve all existing project properties, especially status, completed, and progress
          return {
            ...project,
            goalTitle: updatedGoal.title,
            domain: updatedGoal.domain || project.domain,
            color: updatedGoal.color || project.color,
            // Explicitly preserve completion status
            status: project.status,
            completed: project.completed,
            progress: project.progress
          };
        }
        return project;
      });
      
      // Update projects state
      setProjects(updatedProjects);
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
      console.log(`Updated ${linkedProjects.length} projects associated with goal "${updatedGoal.title}"`);
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
      const currentProjects = [...projectsRef.current]; 
      const currentTasks = [...tasksRef.current];
      const currentLinkMap = { ...projectGoalLinkMap };
      
      log('Error', `📊 BEFORE DELETION: Goals: ${currentGoals.length}, Projects: ${currentProjects.length}, Tasks: ${currentTasks.length}`);
      
      // STEP 2: Remove the goal
      const updatedGoals = currentGoals.filter(goal => goal.id !== goalId);
      
      // STEP 3: Create valid goals set for comprehensive cleanup (like LegacyDataCleanupService)
      const validGoalIds = new Set(updatedGoals.map(g => g.id));
      log('Error', `🎯 VALID GOALS AFTER DELETION: [${Array.from(validGoalIds).join(', ')}]`);
        
      // STEP 4: Remove ALL orphaned projects (projects without valid goals) - COMPREHENSIVE APPROACH
      const validProjects = currentProjects.filter(project => {
        const hasValidGoal = project.goalId && validGoalIds.has(project.goalId);
        if (!hasValidGoal) {
          log('Error', `🗑️ REMOVING ORPHANED PROJECT: "${project.title}" (goalId: ${project.goalId})`);
        } else {
          log('Error', `✅ KEEPING VALID PROJECT: "${project.title}" (goalId: ${project.goalId})`);
        }
        return hasValidGoal;
      });
      
      // STEP 5: Remove ALL orphaned tasks (tasks without valid projects) - COMPREHENSIVE APPROACH  
      const validProjectIds = new Set(validProjects.map(p => p.id));
      log('Error', `🎯 VALID PROJECTS AFTER CLEANUP: [${Array.from(validProjectIds).join(', ')}]`);
      
      const validTasks = currentTasks.filter(task => {
        const hasValidProject = task.projectId && validProjectIds.has(task.projectId);
        if (!hasValidProject) {
          log('Error', `🗑️ REMOVING ORPHANED TASK: "${task.name || task.title}" (projectId: ${task.projectId})`);
        }
        return hasValidProject;
      });
      
      // STEP 6: Clean up link map - remove all invalid entries
      const cleanedLinkMap = {};
      Object.entries(currentLinkMap).forEach(([projectId, linkedGoalId]) => {
        const projectExists = validProjectIds.has(projectId);
        const goalExists = validGoalIds.has(linkedGoalId);
        
        if (projectExists && goalExists) {
          cleanedLinkMap[projectId] = linkedGoalId;
        } else {
          log('Error', `🗑️ REMOVING INVALID LINK: ${projectId} -> ${linkedGoalId}`);
        }
      });
      
      // STEP 7: Calculate cleanup summary
      const projectsRemoved = currentProjects.length - validProjects.length;
      const tasksRemoved = currentTasks.length - validTasks.length;
      const linkMapEntriesRemoved = Object.keys(currentLinkMap).length - Object.keys(cleanedLinkMap).length;
      
      log('Error', `📈 CLEANUP SUMMARY:`);
      log('Error', `  - Removed 1 goal: "${goalTitle}"`);
      log('Error', `  - Removed ${projectsRemoved} orphaned projects`);
      log('Error', `  - Removed ${tasksRemoved} orphaned tasks`);
      log('Error', `  - Removed ${linkMapEntriesRemoved} invalid link map entries`);
      
      // STEP 8: Update all state and storage atomically
      setGoals(updatedGoals);
      setProjects(validProjects);
      setTasks(validTasks);
      setProjectGoalLinkMap(cleanedLinkMap);
      
      // STEP 9: Save all cleaned data to storage in parallel
      await Promise.all([
        saveData(STORAGE_KEYS.GOALS, updatedGoals),
        saveData(STORAGE_KEYS.PROJECTS, validProjects),  
        saveData(STORAGE_KEYS.TASKS, validTasks),
        saveData('projectGoalLinkMap', cleanedLinkMap)
      ]);
      
      log('Error', `💾 ALL DATA SAVED TO STORAGE`);
      
      // STEP 10: Force refresh to ensure UI consistency
      await refreshData();
      
      // Final verification
      log('Error', `🏁 COMPREHENSIVE DELETION COMPLETED`);
      log('Error', `📊 AFTER DELETION: Goals: ${updatedGoals.length}, Projects: ${validProjects.length}, Tasks: ${validTasks.length}`);
      
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
  
  // Add a project - UPDATED WITH DOMAIN NORMALIZATION, BETTER GOAL LINKING, AND SUBSCRIPTION CHECK
  const addProject = async (newProject) => {
    try {
      // Check subscription limits
      if (newProject.goalId && !canAddMoreProjectsToGoal(newProject.goalId)) {
        showError(`Free version limited to ${FREE_PLAN_LIMITS.MAX_PROJECTS} projects per goal. Complete a project or upgrade to Pro.`);
        return null;
      }
      
      // First verify goal relationship if goalId is provided
      if (newProject.goalId) {
        const goalExists = isGoalActive(newProject.goalId);
        
        if (!goalExists) {
          console.warn(`Project references nonexistent goal ID: ${newProject.goalId}`);
          
          // Try to find by goalTitle
          if (newProject.goalTitle) {
            const matchingGoal = goals.find(goal => 
              goal.title.toLowerCase() === newProject.goalTitle.toLowerCase()
            );
            
            if (matchingGoal) {
              console.log(`Found goal by title: "${matchingGoal.title}"`);
              newProject.goalId = matchingGoal.id;
              newProject.goalTitle = matchingGoal.title;
              
              // Inherit domain and color from goal
              newProject.domain = matchingGoal.domain || newProject.domain;
              newProject.color = matchingGoal.color || newProject.color;
            } else {
              // No matching goal found, remove goal association
              console.warn(`No goal found matching title "${newProject.goalTitle}" - creating project without goal link`);
              delete newProject.goalId;
              delete newProject.goalTitle;
            }
          } else {
            // No goalTitle to match with, remove the invalid goalId
            delete newProject.goalId;
          }
        } else {
          // Goal exists, ensure we have the correct title and inherit domain/color
          const linkedGoal = goals.find(goal => goal.id === newProject.goalId);
          newProject.goalTitle = linkedGoal.title;
          
          // Inherit domain and color if not already set
          if (!newProject.domain && linkedGoal.domain) {
            newProject.domain = linkedGoal.domain;
          }
          if (!newProject.color && linkedGoal.color) {
            newProject.color = linkedGoal.color;
          }
        }
      }
      
      // Calculate initial progress from tasks if any
      if (newProject.tasks && Array.isArray(newProject.tasks)) {
        const completedTasks = newProject.tasks.filter(task => task.completed || task.status === 'done').length;
        newProject.progress = newProject.tasks.length > 0 
          ? Math.round((completedTasks / newProject.tasks.length) * 100) 
          : 0;
      } else {
        newProject.progress = 0;
      }
      
      // Now apply domain normalization
      const normalizedProject = normalizeDomain(newProject);
      
      // Update the projects state
      setProjects(prevProjects => [...prevProjects, normalizedProject]);
      
      // Save to AsyncStorage
      const updatedProjects = [...projects, normalizedProject];
      await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
      
      // Also update the project-goal link map
      if (normalizedProject.goalId) {
        const updatedLinkMap = {
          ...projectGoalLinkMap,
          [normalizedProject.id]: normalizedProject.goalId
        };
        setProjectGoalLinkMap(updatedLinkMap);
        
        // Save link map to AsyncStorage
        await saveData('projectGoalLinkMap', updatedLinkMap);
        
        // Update goal progress
        await updateGoalProgressFromProjects(normalizedProject.goalId);
      }
      
      return normalizedProject;
    } catch (error) {
      console.error('Error adding project:', error);
      showError('Failed to add project');
      throw error;
    }
  };
  
  // Update a project - UPDATED TO PRESERVE PROGRESS AND STATUS SEPARATION
  const updateProject = async (updatedProject) => {
    try {
      // Check if in progress
      if (operationsInProgress.current.updatingProjects.has(updatedProject.id)) {
        console.log(`Project ${updatedProject.id} is already being updated, ignoring duplicate request`);
        return null;
      }
      
      // Mark as in progress
      operationsInProgress.current.updatingProjects.add(updatedProject.id);
      
      // Check if project exists
      if (!isProjectActive(updatedProject.id)) {
        console.warn(`Project with ID ${updatedProject.id} not found, unable to update`);
        showError('Project not found');
        return null;
      }
      
      // Apply domain normalization
      const normalizedProject = normalizeDomain(updatedProject);
      
      // Get original project
      const originalProject = projects.find(p => p.id === normalizedProject.id);
      
      // Recalculate progress from tasks if flag is set
      if (normalizedProject.recalculateProgress) {
        const calculatedProgress = calculateProjectProgress(normalizedProject.id);
        normalizedProject.progress = calculatedProgress;
        delete normalizedProject.recalculateProgress; // Remove flag
      }
      
      // IMPORTANT: Preserve status in certain conditions
      // If the client didn't explicitly try to change the status, 
      // we should keep it as it was
      if (!normalizedProject.status && originalProject && originalProject.status) {
        normalizedProject.status = originalProject.status;
      }
      
      // Make sure "completed" flag is synchronized with "done" status
      if (normalizedProject.status === 'done') {
        normalizedProject.completed = true;
      }
      
      // Verify goal if specified
      if (normalizedProject.goalId && !isGoalActive(normalizedProject.goalId)) {
        console.warn(`Project references nonexistent goal ID: ${normalizedProject.goalId}`);
        // Make this project independent if goal doesn't exist
        normalizedProject.goalId = null;
        normalizedProject.goalTitle = null;
      } else if (normalizedProject.goalId) {
        // Update goal title to match goal
        const goal = goals.find(g => g.id === normalizedProject.goalId);
        if (goal) {
          normalizedProject.goalTitle = goal.title;
        }
      }
      
      // Get the old project to check if goalId changed
      const oldProject = projects.find(p => p.id === normalizedProject.id);
      const goalIdChanged = oldProject && oldProject.goalId !== normalizedProject.goalId;
      
      // Update the projects state
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === normalizedProject.id ? normalizedProject : project
        )
      );
      
      // Save to AsyncStorage
      const updatedProjects = projects.map(project => 
        project.id === normalizedProject.id ? normalizedProject : project
      );
      await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
      
      // Update the project-goal link map if goalId changed
      if (normalizedProject.goalId) {
        const updatedLinkMap = {
          ...projectGoalLinkMap,
          [normalizedProject.id]: normalizedProject.goalId
        };
        setProjectGoalLinkMap(updatedLinkMap);
        
        // Save link map to AsyncStorage
        await saveData('projectGoalLinkMap', updatedLinkMap);
      } else if (projectGoalLinkMap[normalizedProject.id]) {
        // Remove from map if goalId is gone
        const updatedLinkMap = { ...projectGoalLinkMap };
        delete updatedLinkMap[normalizedProject.id];
        setProjectGoalLinkMap(updatedLinkMap);
        
        // Save link map to AsyncStorage
        await saveData('projectGoalLinkMap', updatedLinkMap);
      }
      
      // Update goal progress if goal is linked or if goal changed
      if (normalizedProject.goalId) {
        await updateGoalProgressFromProjects(normalizedProject.goalId);
      }
      
      // If goal changed, also update the old goal's progress
      if (goalIdChanged && oldProject?.goalId) {
        await updateGoalProgressFromProjects(oldProject.goalId);
      }
      
      return normalizedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      showError('Failed to update project');
      return null;
    } finally {
      // Clear operation tracking
      setTimeout(() => {
        operationsInProgress.current.updatingProjects.delete(updatedProject.id);
      }, 500);
    }
  };
  
  // NEW: Function to update goal progress from its projects
  const updateGoalProgressFromProjects = async (goalId) => {
    try {
      if (!goalId) return;
      
      const goal = goalsRef.current.find(g => g.id === goalId);
      if (!goal) return;
      
      const calculatedProgress = calculateGoalProgress(goalId, projectsRef.current);
      
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
  
  // Delete a project - SIMPLIFIED VERSION WITH GOAL PROGRESS UPDATE
  const deleteProject = async (projectId) => {
    try {
      console.log(`Deleting project with ID: ${projectId}`);
      
      // Simple guard against already deleted projects
      if (!Array.isArray(projects) || projects.length === 0) {
        console.warn('No projects array available');
        return false;
      }
      
      // Check if project exists in the full projects array
      const project = projects.find(p => p.id === projectId);
      if (!project) {
        console.warn(`Project with ID ${projectId} not found, it may have already been deleted`);
        return false;
      }
      
      const goalId = project.goalId; // Store goal ID for later progress update
      
      // 1. First remove from AsyncStorage to ensure persistence
      const updatedProjects = projects.filter(project => project.id !== projectId);
      await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
      
      // 2. Then update state (AFTER storage is updated)
      setProjects(updatedProjects);
      
      // 3. Clean up associated tasks if they exist
      if (Array.isArray(tasks) && tasks.length > 0) {
        const updatedTasks = tasks.filter(task => task.projectId !== projectId);
        await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
        setTasks(updatedTasks);
      }
      
      // 4. Update project-goal link map if needed
      if (projectGoalLinkMap[projectId]) {
        const updatedLinkMap = { ...projectGoalLinkMap };
        delete updatedLinkMap[projectId];
        
        await AsyncStorage.setItem('projectGoalLinkMap', JSON.stringify(updatedLinkMap));
        setProjectGoalLinkMap(updatedLinkMap);
      }
      
      // 5. Update goal progress if project was linked to a goal
      if (goalId) {
        setTimeout(() => {
          updateGoalProgressFromProjects(goalId);
        }, 500);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  };
  
  // Add a task to a project - COMPLETELY REWRITTEN TO NEVER CHANGE PROJECT STATUS AND ADD SUBSCRIPTION CHECK
  const addTask = async (projectId, newTask) => {
    try {
      // Check if project exists
      if (!isProjectActive(projectId)) {
        console.warn(`Project with ID ${projectId} not found, cannot add task`);
        showError('Project not found');
        return null;
      }
      
      // Check subscription limits
      if (!canAddMoreTasksToProject(projectId)) {
        showError(`Free version limited to ${FREE_PLAN_LIMITS.MAX_TASKS_PER_PROJECT} tasks per project. Complete a task or upgrade to Pro.`);
        return null;
      }
      
      // Create a copy of tasks to avoid null or undefined issues
      const currentTasks = Array.isArray(tasks) ? [...tasks] : [];
      
      // Add the task
      const taskWithId = { 
        ...newTask,
        id: newTask.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        projectId: projectId,
        completed: newTask.completed || false,
        createdAt: new Date().toISOString()
      };
      
      // Add to state
      const updatedTasks = [...currentTasks, taskWithId];
      setTasks(updatedTasks);
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TASKS, updatedTasks);
      
      // Find the current project
      const project = projectsRef.current.find(p => p.id === projectId);
      if (!project) return taskWithId;
      
      // Calculate new task-based progress WITHOUT changing project status
      const projectTasks = updatedTasks.filter(task => task.projectId === projectId);
      const completedTasks = projectTasks.filter(task => task.completed || task.status === 'done').length;
      const calculatedProgress = projectTasks.length > 0 
        ? Math.round((completedTasks / projectTasks.length) * 100)
        : 0;
      
      // Only update the progress number, NEVER the status
      if (project.progress !== calculatedProgress) {
        console.log(`[AppContext] Updating project "${project.title}" progress to ${calculatedProgress}% (status remains "${project.status || 'todo'}")`);
        
        const updatedProject = {
          ...project,
          progress: calculatedProgress,
          // DO NOT CHANGE these properties based on tasks:
          // status: stays the same
          // completed: stays the same
          updatedAt: new Date().toISOString()
        };
        
        // Special case: if project is marked as done, keep it at 100%
        if (project.status === 'done' || project.completed) {
          updatedProject.progress = 100;
        }
        
        // Update projects state
        setProjects(prevProjects => 
          prevProjects.map(p => p.id === projectId ? updatedProject : p)
        );
        
        // Save to AsyncStorage
        const updatedProjects = projectsRef.current.map(p => 
          p.id === projectId ? updatedProject : p
        );
        await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
        
        // Update goal progress if project is linked to a goal
        if (project.goalId) {
          setTimeout(() => {
            updateGoalProgressFromProjects(project.goalId);
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
  
  // Update a task - COMPLETELY REWRITTEN TO NEVER CHANGE PROJECT STATUS
  const updateTask = async (projectId, taskId, updatedTask) => {
    try {
      // Check if project exists
      if (!isProjectActive(projectId)) {
        console.warn(`Project with ID ${projectId} not found, cannot update task`);
        showError('Project not found');
        return null;
      }
      
      // Make sure we have a tasks array
      if (!Array.isArray(tasks)) {
        console.error('No tasks array available');
        throw new Error('Tasks array not available');
      }
      
      // Find the task
      const taskIndex = tasks.findIndex(task => task.id === taskId && task.projectId === projectId);
      
      if (taskIndex === -1) {
        console.warn(`Task with ID ${taskId} not found in project ${projectId}`);
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
      
      // Find the current project
      const project = projectsRef.current.find(p => p.id === projectId);
      if (!project) return null;
      
      // Calculate new task-based progress WITHOUT changing project status
      const projectTasks = newTasksArray.filter(task => task.projectId === projectId);
      const completedTasks = projectTasks.filter(task => task.completed || task.status === 'done').length;
      const calculatedProgress = projectTasks.length > 0 
        ? Math.round((completedTasks / projectTasks.length) * 100)
        : 0;
      
      // Only update the progress number, NEVER the status
      if (project.progress !== calculatedProgress) {
        console.log(`[AppContext] Updating project "${project.title}" progress to ${calculatedProgress}% (status remains "${project.status || 'todo'}")`);
        
        const updatedProject = {
          ...project,
          progress: calculatedProgress,
          // DO NOT CHANGE these properties based on tasks:
          // status: stays the same
          // completed: stays the same
          updatedAt: new Date().toISOString()
        };
        
        // Special case: if project is marked as done, keep it at 100%
        if (project.status === 'done' || project.completed) {
          updatedProject.progress = 100;
        }
        
        // Update projects state
        setProjects(prevProjects => 
          prevProjects.map(p => p.id === projectId ? updatedProject : p)
        );
        
        // Save to AsyncStorage
        const updatedProjects = projectsRef.current.map(p => 
          p.id === projectId ? updatedProject : p
        );
        await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
        
        // Update goal progress if project is linked to a goal
        if (project.goalId) {
          setTimeout(() => {
            updateGoalProgressFromProjects(project.goalId);
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
  
  // Delete a task - COMPLETELY REWRITTEN TO NEVER CHANGE PROJECT STATUS
  const deleteTask = async (projectId, taskId) => {
    try {
      // Check if project exists
      if (!isProjectActive(projectId)) {
        console.warn(`Project with ID ${projectId} not found, cannot delete task`);
        showError('Project not found');
        return false;
      }
      
      // Make sure we have a tasks array
      if (!Array.isArray(tasks)) {
        console.error('No tasks array available');
        throw new Error('Tasks array not available');
      }
      
      // Check if task exists
      const taskExists = tasks.some(task => task.id === taskId && task.projectId === projectId);
      if (!taskExists) {
        console.warn(`Task with ID ${taskId} not found in project ${projectId}`);
        showError('Task not found');
        return false;
      }
      
      // Remove the task
      const updatedTasks = tasks.filter(task => !(task.id === taskId && task.projectId === projectId));
      
      // Update state
      setTasks(updatedTasks);
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TASKS, updatedTasks);
      
      // Find the current project
      const project = projectsRef.current.find(p => p.id === projectId);
      if (!project) return true;
      
      // Calculate new task-based progress WITHOUT changing project status
      const projectTasks = updatedTasks.filter(task => task.projectId === projectId);
      
      // If no tasks left, keep the current progress
      if (projectTasks.length === 0) {
        showSuccess('Task deleted successfully');
        return true;
      }
      
      const completedTasks = projectTasks.filter(task => task.completed || task.status === 'done').length;
      const calculatedProgress = Math.round((completedTasks / projectTasks.length) * 100);
      
      // Only update the progress number, NEVER the status
      if (project.progress !== calculatedProgress) {
        console.log(`[AppContext] Updating project "${project.title}" progress to ${calculatedProgress}% (status remains "${project.status || 'todo'}")`);
        
        const updatedProject = {
          ...project,
          progress: calculatedProgress,
          // DO NOT CHANGE these properties based on tasks:
          // status: stays the same
          // completed: stays the same
          updatedAt: new Date().toISOString()
        };
        
        // Special case: if project is marked as done, keep it at 100%
        if (project.status === 'done' || project.completed) {
          updatedProject.progress = 100;
        }
        
        // Update projects state
        setProjects(prevProjects => 
          prevProjects.map(p => p.id === projectId ? updatedProject : p)
        );
        
        // Save to AsyncStorage
        const updatedProjects = projectsRef.current.map(p => 
          p.id === projectId ? updatedProject : p
        );
        await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
        
        // Update goal progress if project is linked to a goal
        if (project.goalId) {
          setTimeout(() => {
            updateGoalProgressFromProjects(project.goalId);
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
  
  // Function to update project progress from its tasks
  const updateProjectProgressFromTasks = async (projectId, currentTasks = null) => {
    try {
      console.log(`🔴 [DEBUG] updateProjectProgressFromTasks called - Project: ${projectId}`);
      if (!projectId) return;
      
      const project = projectsRef.current.find(p => p.id === projectId);
      if (!project) return;
      
      console.log(`🔴 [DEBUG] Project found:`, {
        id: projectId,
        title: project.title,
        status: project.status,
        progress: project.progress,
        completed: project.completed,
        updatedAt: project.updatedAt
      });
      
      // IMPORTANT: Don't update projects that were manually completed recently
      if ((project.status === 'done' || project.completed) && project.updatedAt) {
        const lastUpdate = new Date(project.updatedAt).getTime();
        const now = Date.now();
        const timeDiff = now - lastUpdate;
        console.log(`🔴 [DEBUG] Manual completion check - Time since update: ${timeDiff}ms`);
        // If project was manually completed in the last 2 seconds, don't override it
        if (timeDiff < 2000) {
          console.log(`🔴 [DEBUG] Project "${project.title}" was manually completed recently, skipping auto-update`);
          return;
        }
      }
      
      // IMPORTANT: Don't change project status based on task completion
      // Only recalculate progress percentage while preserving status
      
      // Calculate task completion percentage (but don't change status)
      const tasksToUse = currentTasks || tasksRef.current;
      const projectTasks = tasksToUse.filter(task => task.projectId === projectId);
      
      // If there are no tasks, don't update anything
      if (projectTasks.length === 0) return;
      
      const completedTasks = projectTasks.filter(task => task.completed || task.status === 'done').length;
      const calculatedProgress = Math.round((completedTasks / projectTasks.length) * 100);
      
      // Do not update the project if progress hasn't changed
      if (project.progress === calculatedProgress) return;
      
      // For progress display, use the calculated value, but preserve existing status
      console.log(`[AppContext] Updating project "${project.title}" task-based progress: ${calculatedProgress}%`);
      
      // We only update the percentage, not the status
      // Preserve the existing status (todo, in_progress, done) regardless of task completion
      const updatedProject = {
        ...project,
        progress: calculatedProgress,
        updatedAt: new Date().toISOString()
      };
      
      // If project is already marked as done, keep it that way regardless of progress
      if (project.status === 'done' || project.completed) {
        updatedProject.progress = 100;
        updatedProject.completed = true;
        updatedProject.status = 'done';
      }
      
      // Update projects state
      setProjects(prevProjects => 
        prevProjects.map(p => p.id === projectId ? updatedProject : p)
      );
      
      // Save to AsyncStorage
      const updatedProjects = projectsRef.current.map(p => 
        p.id === projectId ? updatedProject : p
      );
      await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
      
      // Update goal progress if project is linked to a goal
      if (project.goalId) {
        setTimeout(() => {
          updateGoalProgressFromProjects(project.goalId);
        }, 500);
      }
    } catch (error) {
      console.error('Error updating project progress from tasks:', error);
    }
  };
  
  // Add a time block - WITH SUBSCRIPTION CHECK
  const addTimeBlock = async (newTimeBlock) => {
    try {
      // Check subscription limits
      if (!canAddMoreTimeBlocks()) {
        showError(`Free version limited to ${FREE_PLAN_LIMITS.MAX_TIME_BLOCKS} time blocks per week. Remove a time block or upgrade to Pro.`);
        return null;
      }
      
      // Update state
      setTimeBlocks(prevTimeBlocks => [...prevTimeBlocks, newTimeBlock]);
      
      // Save to AsyncStorage
      const updatedTimeBlocks = [...timeBlocks, newTimeBlock];
      await saveData(STORAGE_KEYS.TIME_BLOCKS, updatedTimeBlocks);
      
      return newTimeBlock;
    } catch (error) {
      console.error('Error adding time block:', error);
      showError('Failed to add time block');
      throw error;
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
  
  // Delete a time block
  const deleteTimeBlock = async (timeBlockId) => {
    try {
      // Update state
      setTimeBlocks(prevTimeBlocks => prevTimeBlocks.filter(timeBlock => timeBlock.id !== timeBlockId));
      
      // Save to AsyncStorage
      const updatedTimeBlocks = timeBlocks.filter(timeBlock => timeBlock.id !== timeBlockId);
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
        
        // Also update any projects with this domain
        const projectsToUpdate = projects.filter(project => 
          project.domain === updatedDomain.name
        );
        
        if (projectsToUpdate.length > 0) {
          const updatedProjects = projects.map(project => {
            if (project.domain === updatedDomain.name) {
              return {
                ...project,
                domain: updatedDomain.name,
                color: updatedDomain.color || project.color
              };
            }
            return project;
          });
          
          // Update projects state
          setProjects(updatedProjects);
          
          // Save to AsyncStorage
          await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
          console.log(`Updated ${projectsToUpdate.length} projects with domain "${updatedDomain.name}"`);
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
  
  // Get life direction
  const getLifeDirection = () => {
    return settings.lifeDirection || '';
  };
  
  // Link projects to goals by title (cleanup function)
  const linkProjectsToGoalsByTitle = async () => {
    try {
      let fixCount = 0;
      
      // Look for projects without goalId but with goalTitle
      const updatedProjects = projects.map(project => {
        if (!project.goalId && project.goalTitle) {
          // Try to find goal by title
          const matchingGoal = goals.find(goal => 
            goal.title.toLowerCase() === project.goalTitle.toLowerCase()
          );
          
          if (matchingGoal) {
            fixCount++;
            return {
              ...project,
              goalId: matchingGoal.id,
              goalTitle: matchingGoal.title, // Ensure exact case match
              // Inherit domain and color if not already set
              domain: project.domain || matchingGoal.domain,
              color: project.color || matchingGoal.color
            };
          }
        }
        
        return project;
      });
      
      if (fixCount > 0) {
        // Update state
        setProjects(updatedProjects);
        
        // Save to AsyncStorage
        await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
        
        // Update link map
        const updatedLinkMap = { ...projectGoalLinkMap };
        updatedProjects.forEach(project => {
          if (project.goalId) {
            updatedLinkMap[project.id] = project.goalId;
          }
        });
        
        setProjectGoalLinkMap(updatedLinkMap);
        await saveData('projectGoalLinkMap', updatedLinkMap);
        
        showSuccess(`Fixed ${fixCount} project-goal relationships`);
        return fixCount;
      }
      
      return 0;
    } catch (error) {
      console.error('Error linking projects to goals:', error);
      showError('Failed to link projects to goals');
      throw error;
    }
  };
  
  // Clean up orphaned projects
  const cleanupOrphanedProjects = async () => {
    try {
      // Find projects with goalId that doesn't exist in goals
      const validGoalIds = goals.map(goal => goal.id);
      const orphanedProjects = projects.filter(project => 
        project.goalId && !validGoalIds.includes(project.goalId)
      );
      
      if (orphanedProjects.length > 0) {
        console.log(`Found ${orphanedProjects.length} orphaned projects to clean up`);
        
        // Get all orphaned project IDs
        const orphanedIds = orphanedProjects.map(project => project.id);
        
        // Mark as being deleted
        orphanedIds.forEach(id => {
          deletedProjectIds.current.add(id);
          operationsInProgress.current.deletingProjects.add(id);
        });
        
        // Option 1: Delete orphaned projects
        // setProjects(prevProjects => 
        //   prevProjects.filter(project => !orphanedIds.includes(project.id))
        // );
        
        // Option 2: Make orphaned projects independent
        setProjects(prevProjects => 
          prevProjects.map(project => {
            if (project.goalId && !validGoalIds.includes(project.goalId)) {
              // Convert to independent project
              return {
                ...project,
                goalId: null,
                goalTitle: null
              };
            }
            return project;
          })
        );
        
        // Save to AsyncStorage - Option 2 implementation
        const updatedProjects = projects.map(project => {
          if (project.goalId && !validGoalIds.includes(project.goalId)) {
            return {
              ...project,
              goalId: null,
              goalTitle: null
            };
          }
          return project;
        });
        
        await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
        
        // Update link map
        const updatedLinkMap = { ...projectGoalLinkMap };
        orphanedIds.forEach(projectId => {
          delete updatedLinkMap[projectId];
        });
        setProjectGoalLinkMap(updatedLinkMap);
        await saveData('projectGoalLinkMap', updatedLinkMap);
        
        // Clear deletion tracking after a delay
        setTimeout(() => {
          orphanedIds.forEach(id => {
            deletedProjectIds.current.delete(id);
            operationsInProgress.current.deletingProjects.delete(id);
          });
        }, 1000);
        
        console.log(`Cleaned up ${orphanedProjects.length} orphaned projects`);
        return orphanedProjects.length;
      }
      
      return 0;
    } catch (error) {
      console.error('Error cleaning up orphaned projects:', error);
      return 0;
    }
  };
  
  // Project-Goal Link Debugging Function
  const debugProjectGoalLinks = async () => {
    console.log("==== DEBUG: Project-Goal Links ====");
    
    try {
      // Get data from storage for verification
      const goalsString = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      const projectsString = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
      const linkMapString = await AsyncStorage.getItem('projectGoalLinkMap');
      
      const storedGoals = goalsString ? JSON.parse(goalsString) : [];
      const storedProjects = projectsString ? JSON.parse(projectsString) : [];
      const storedLinkMap = linkMapString ? JSON.parse(linkMapString) : {};
      
      console.log(`Found ${storedGoals.length} goals, ${storedProjects.length} projects, ${Object.keys(storedLinkMap).length} link map entries`);
      
      // Check each goal
      storedGoals.forEach(goal => {
        const goalId = goal.id;
        
        // Find projects linked by property
        const linkedByProperty = storedProjects.filter(p => p.goalId === goalId);
        
        // Find projects linked by map
        const linkedByMap = Object.entries(storedLinkMap)
          .filter(([_, gId]) => gId === goalId)
          .map(([pId]) => storedProjects.find(p => p.id === pId))
          .filter(Boolean);
        
        // Find projects that are only linked one way
        const onlyInProperty = linkedByProperty.filter(p => 
          !linkedByMap.some(mp => mp.id === p.id)
        );
        
        const onlyInMap = linkedByMap.filter(p => 
          !linkedByProperty.some(pp => pp.id === p.id)
        );
        
        console.log(`Goal "${goal.title}" (${goalId}):`);
        console.log(`- Projects by property: ${linkedByProperty.length}`);
        console.log(`- Projects by map: ${linkedByMap.length}`);
        
        if (onlyInProperty.length > 0) {
          console.log(`- WARNING: ${onlyInProperty.length} projects only linked by property:`);
          onlyInProperty.forEach(p => console.log(`  - ${p.title} (${p.id})`));
        }
        
        if (onlyInMap.length > 0) {
          console.log(`- WARNING: ${onlyInMap.length} projects only linked by map:`);
          onlyInMap.forEach(p => console.log(`  - ${p.title} (${p.id})`));
        }
      });
      
      // Check for orphaned projects in the link map
      const orphanedLinks = Object.entries(storedLinkMap).filter(([projectId, goalId]) => {
        const projectExists = storedProjects.some(p => p.id === projectId);
        const goalExists = storedGoals.some(g => g.id === goalId);
        return !projectExists || !goalExists;
      });
      
      if (orphanedLinks.length > 0) {
        console.log(`WARNING: Found ${orphanedLinks.length} orphaned entries in the link map`);
        orphanedLinks.forEach(([projectId, goalId]) => {
          console.log(`- Project ${projectId} -> Goal ${goalId}`);
        });
      }
      
      console.log("==== END DEBUG ====");
      return true;
    } catch (error) {
      console.error("Error in debugProjectGoalLinks:", error);
      return false;
    }
  };
  
  // Fix Project-Goal Links Function
  const fixProjectGoalLinks = async () => {
    console.log("Starting project-goal link repair...");
    
    try {
      // Get data from storage
      const goalsString = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      const projectsString = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
      const linkMapString = await AsyncStorage.getItem('projectGoalLinkMap');
      
      const storedGoals = goalsString ? JSON.parse(goalsString) : [];
      const storedProjects = projectsString ? JSON.parse(projectsString) : [];
      let storedLinkMap = linkMapString ? JSON.parse(linkMapString) : {};
      
      console.log(`Found ${storedGoals.length} goals, ${storedProjects.length} projects, ${Object.keys(storedLinkMap).length} link map entries`);
      
      // Create set of valid goal IDs
      const validGoalIds = new Set(storedGoals.map(g => g.id));
      
      // Track changes
      let projectsFixed = 0;
      let linkMapFixed = 0;
      let orphanedProjectsFixed = 0;
      
      // 1. Fix projects - ensure goalId references valid goals
      const fixedProjects = storedProjects.map(project => {
        if (project.goalId && !validGoalIds.has(project.goalId)) {
          // This project references a non-existent goal
          console.log(`Fixing project "${project.title}" - invalid goalId: ${project.goalId}`);
          projectsFixed++;
          return { ...project, goalId: null, goalTitle: null };
        }
        return project;
      });
      
      // 2. Fix link map - ensure all entries reference valid goals and projects
      const newLinkMap = {};
      
      // First add all valid entries from current link map
      Object.entries(storedLinkMap).forEach(([projectId, goalId]) => {
        const projectExists = storedProjects.some(p => p.id === projectId);
        const goalExists = validGoalIds.has(goalId);
        
        if (projectExists && goalExists) {
          newLinkMap[projectId] = goalId;
        } else {
          console.log(`Removing invalid link map entry: Project ${projectId} -> Goal ${goalId}`);
          linkMapFixed++;
        }
      });
      
      // 3. Ensure all projects with goalId are in the link map
      fixedProjects.forEach(project => {
        if (project.goalId && validGoalIds.has(project.goalId) && !newLinkMap[project.id]) {
          console.log(`Adding missing link map entry for project "${project.title}"`);
          newLinkMap[project.id] = project.goalId;
          linkMapFixed++;
        }
      });
      
      // 4. Update storage if needed
      if (projectsFixed > 0) {
        console.log(`Saving ${projectsFixed} fixed projects to storage`);
        await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(fixedProjects));
        setProjects(fixedProjects);
      }
      
      if (linkMapFixed > 0) {
        console.log(`Saving ${linkMapFixed} fixed link map entries to storage`);
        await AsyncStorage.setItem('projectGoalLinkMap', JSON.stringify(newLinkMap));
        setProjectGoalLinkMap(newLinkMap);
      }
      
      // Log results
      console.log(`Repair complete: ${projectsFixed} projects fixed, ${linkMapFixed} link map entries fixed`);
      
      if (projectsFixed > 0 || linkMapFixed > 0) {
        // Force a refresh
        await refreshData();
        showSuccess(`Fixed ${projectsFixed + linkMapFixed} project-goal links`);
      }
      
      return { projectsFixed, linkMapFixed };
    } catch (error) {
      console.error("Error fixing project-goal links:", error);
      showError("Failed to fix project-goal links");
      return { error };
    }
  };
  
  // Force refresh data (useful after operations that might leave orphaned references)
  const refreshData = async () => {
    try {
      console.log('Forcing data refresh...');
      
      // First clean up any orphaned projects
      const cleanupCount = await cleanupOrphanedProjects();
      console.log(`Cleaned up ${cleanupCount} orphaned projects`);
      
      // Reload all data from storage
      const storedGoals = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      const storedProjects = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      const storedTodos = await AsyncStorage.getItem(STORAGE_KEYS.TODOS);
      const storedTomorrowTodos = await AsyncStorage.getItem(STORAGE_KEYS.TOMORROW_TODOS);
      const storedLaterTodos = await AsyncStorage.getItem(STORAGE_KEYS.LATER_TODOS);
      
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      }
      
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
      
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
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
  
  // Update project progress with atomic update to ensure goal progress is updated
  const updateProjectProgress = async (projectId, newProgress) => {
    try {
      console.log(`🔵 [DEBUG] updateProjectProgress called - Project: ${projectId}, Progress: ${newProgress}`);
      
      // Use current refs to avoid stale closure
      const currentProjects = projectsRef.current;
      const currentGoals = goalsRef.current;
      const currentTasks = tasksRef.current;
      
      // Find the project
      const project = currentProjects.find(p => p.id === projectId);
      if (!project) {
        console.error(`Project with ID ${projectId} not found`);
        return false;
      }
      
      // Get previous status
      const prevStatus = project.status || 
                         (project.progress === 100 ? 'done' : 
                          project.progress > 0 ? 'in_progress' : 'todo');
      
      // Determine the new status based on the newProgress parameter
      let newStatus;
      if (newProgress === 0) newStatus = 'todo';
      else if (newProgress === 50) newStatus = 'in_progress';
      else if (newProgress === 100) newStatus = 'done';
      
      // Get tasks for this project
      const projectTasks = Array.isArray(currentTasks) 
        ? currentTasks.filter(task => task.projectId === projectId)
        : [];
      
      // Calculate task-based progress
      let taskBasedProgress;
      if (projectTasks.length > 0) {
        const completedTasks = projectTasks.filter(task => task.completed || task.status === 'done').length;
        taskBasedProgress = Math.round((completedTasks / projectTasks.length) * 100);
      } else {
        // If no tasks, keep the existing progress value
        taskBasedProgress = project.progress || 0;
      }
      
      console.log(`[AppContext] Task-based progress for project "${project.title}": ${taskBasedProgress}%`);
      console.log(`[AppContext] Setting project status to "${newStatus}" without changing progress`);
      
      // Create updated project
      const updatedProject = {
        ...project,
        status: newStatus, // Set explicit status property
        statusProgress: newProgress, // Store status indicator value
        // Use status-based progress when manually set to done, otherwise use task-based
        progress: newStatus === 'done' ? 100 : taskBasedProgress,
        completed: newStatus === 'done', // Only mark as completed if 100%
        updatedAt: new Date().toISOString()
      };
      
      console.log(`🟢 [DEBUG] Project update created:`, {
        id: projectId,
        title: project.title,
        oldStatus: project.status,
        newStatus: newStatus,
        oldProgress: project.progress,
        newProgress: updatedProject.progress,
        completed: updatedProject.completed
      });
      
      // First update the project in state and storage
      const updatedProjects = currentProjects.map(p => 
        p.id === projectId ? updatedProject : p
      );
      
      // Update state
      setProjects(updatedProjects);
      console.log(`🟡 [DEBUG] Project state updated in memory`);
      
      // Update storage
      await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
      console.log(`🟡 [DEBUG] Project state saved to storage`);
      
      // Next, check if this project is linked to a goal
      if (project.goalId) {
        // Calculate goal progress if we can
        const projectsForGoal = updatedProjects.filter(p => p.goalId === project.goalId);
        const completedProjects = projectsForGoal.filter(p => 
          p.id === projectId ? newStatus === 'done' : (p.progress === 100 || p.completed || p.status === 'done')
        ).length;
        
        const newGoalProgress = Math.round((completedProjects / projectsForGoal.length) * 100);
        
        // Find the goal
        const goalToUpdate = currentGoals.find(g => g.id === project.goalId);
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
        showSuccess(`Project moved to ${newStatus === 'todo' ? 'To Do' : newStatus === 'in_progress' ? 'In Progress' : 'Done'}`);
      }
      
      // Note: Removed automatic refreshData call to prevent interference with manual completion
      // The state updates above should be sufficient for UI consistency
      
      return true;
    } catch (error) {
      console.error("Error in updateProjectProgress:", error);
      
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
  
  // Alias mainGoals to goals for backward compatibility
  const mainGoals = goals;
  
  // Export all functions and state
  const contextValue = {
    // State
    goals,
    mainGoals, // Alias for backward compatibility
    projects,
    timeBlocks,
    domains,
    settings,
    tags,
    notes,
    filters,
    isLoading,
    projectGoalLinkMap,
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
    
    // State setters
    setGoals,
    setProjects,
    setTasks,
    setTodos,
    setTomorrowTodos,
    setLaterTodos,
    
    // Helper functions for components
    getProject,
    isProjectActive,
    isGoalActive,
    hasParentGoal,
    getParentGoal,
    getProjectsForGoal,
    getIndependentProjects,
    getTasksForProject,
    calculateGoalProgress,
    calculateProjectProgress,
    
    // Goal functions
    addGoal,
    updateGoal,
    deleteGoal,
    
    // Project functions
    addProject,
    updateProject,
    deleteProject,
    updateProjectProgress,
    updateProjectProgressFromTasks,
    updateGoalProgressFromProjects,
    
    // Task functions
    addTask,
    updateTask,
    deleteTask,
    
    // Time block functions
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    countTimeBlocksThisWeek,
    
    // Todo functions
    addTodo,
    updateTodos,
    deleteTodo,
    toggleTodo,
    
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
    getLifeDirection,
    
    // User purchase status function
    updatePurchaseStatus,
    
    // Subscription limit checks
    canAddMoreGoals,
    canAddMoreProjectsToGoal,
    canAddMoreTasksToProject,
    canAddMoreTimeBlocks,
    
    // Utility functions
    linkProjectsToGoalsByTitle,
    auditProjectGoalRelationships,
    cleanupOrphanedProjects,
    refreshData,
    fixProjectGoalLinks,
    debugProjectGoalLinks
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
    projects: [],
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
    addProject: () => null,
    updateProject: () => null,
    deleteProject: () => null,
    addTask: () => null,
    updateTask: () => null,
    deleteTask: () => null
  };
};

export default AppContext;