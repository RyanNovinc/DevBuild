// src/context/AppContext/index.js
// Optimized AppContext that combines all the individual modules

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { useNotification } from '../NotificationContext';

// Import constants
import { STORAGE_KEYS, DEFAULT_SETTINGS } from './constants';

// Import utility functions
import { loadAppData, saveData } from './utils/storageUtils';
import { 
  auditMilestoneGoalRelationships, 
  cleanupOrphanedMilestones,
  linkMilestonesToGoalsByTitle
} from './utils/relationshipUtils';
import { 
  calculateGoalProgress, 
  calculateMilestoneProgress,
  getMilestonesForGoal,
  getIndependentMilestones,
  getTasksForMilestone
} from './utils/progressUtils';

// Import reducers and actions
import { goalReducer, initialGoalState, goalActions } from './reducers/goalReducer';
import { milestoneReducer, initialMilestoneState, milestoneActions } from './reducers/milestoneReducer';

// Create context
const AppContext = createContext();

// Combine all initial states
const initialState = {
  ...initialGoalState,
  ...initialMilestoneState,
  
  // Additional states
  timeBlocks: [],
  domains: [],
  settings: DEFAULT_SETTINGS,
  tags: [],
  notes: [],
  filters: {},
  isLoading: true,
  tasks: [],
  
  // Todo states
  todos: [],
  tomorrowTodos: [],
  laterTodos: [],
  
  // User preferences
  userCountry: null,
};

// Create a combined reducer function
function appReducer(state, action) {
  // First apply goal reducer
  const goalState = goalReducer(state, action);
  
  // Then apply milestone reducer on the updated state
  const milestoneState = milestoneReducer(goalState, action);
  
  // Handle other actions
  switch (action.type) {
    case 'SET_TIME_BLOCKS':
      return {
        ...milestoneState,
        timeBlocks: action.payload,
      };
      
    case 'SET_DOMAINS':
      return {
        ...milestoneState,
        domains: action.payload,
      };
      
    case 'SET_SETTINGS':
      return {
        ...milestoneState,
        settings: action.payload,
      };
      
    case 'SET_TAGS':
      return {
        ...milestoneState,
        tags: action.payload,
      };
      
    case 'SET_NOTES':
      return {
        ...milestoneState,
        notes: action.payload,
      };
      
    case 'SET_FILTERS':
      return {
        ...milestoneState,
        filters: action.payload,
      };
      
    case 'SET_LOADING':
      return {
        ...milestoneState,
        isLoading: action.payload,
      };
      
    case 'SET_TASKS':
      return {
        ...milestoneState,
        tasks: action.payload,
      };
      
    case 'SET_TODOS':
      return {
        ...milestoneState,
        todos: action.payload,
      };
      
    case 'SET_TOMORROW_TODOS':
      return {
        ...milestoneState,
        tomorrowTodos: action.payload,
      };
      
    case 'SET_LATER_TODOS':
      return {
        ...milestoneState,
        laterTodos: action.payload,
      };
      
    case 'SET_ALL_DATA':
      return {
        ...milestoneState,
        ...action.payload,
        isLoading: false,
      };
      
    default:
      return milestoneState;
  }
}

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Create refs for current state values to use in async functions
  const stateRef = useRef(state);
  
  // Update ref when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // Get notification context
  const notification = useNotification ? useNotification() : { 
    showSuccess: (msg) => console.log(msg),
    showError: (msg) => console.error(msg)
  };
  
  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadDataFromStorage = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load all data at once using the utility function
        const data = await loadAppData();
        
        // Set all data at once
        dispatch({ type: 'SET_ALL_DATA', payload: data });
        
        // Verify data integrity
        if (data.goals && data.milestones) {
          const auditResults = auditMilestoneGoalRelationships(data.milestones, data.goals, data.milestoneGoalLinkMap);
          
          if (auditResults.needsUpdate) {
            // Update milestones with fixed relationships
            dispatch({ type: 'SET_MILESTONES', payload: auditResults.milestones });
            dispatch({ type: 'SET_MILESTONE_GOAL_LINK_MAP', payload: auditResults.milestoneGoalLinkMap });
            
            // Save fixed data
            await saveData(STORAGE_KEYS.MILESTONES, auditResults.milestones);
            await saveData(STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, auditResults.milestoneGoalLinkMap);
            
            console.log(`Fixed ${auditResults.stats.fixesApplied} milestone-goal relationships`);
          }
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadDataFromStorage();
  }, []);
  
  // Create a wrapper for goal actions
  const goalActionWrappers = {
    addGoal: (newGoal) => goalActions.addGoal(dispatch, newGoal, notification, stateRef.current),
    updateGoal: (updatedGoal) => goalActions.updateGoal(dispatch, updatedGoal, notification, stateRef.current),
    deleteGoal: (goalId) => goalActions.deleteGoal(dispatch, goalId, notification, stateRef.current),
    updateGoalProgress: (goalId, progress) => goalActions.updateGoalProgress(dispatch, goalId, progress, stateRef.current)
  };
  
  // Create a wrapper for milestone actions
  const milestoneActionWrappers = {
    addMilestone: (newMilestone) => milestoneActions.addMilestone(dispatch, newMilestone, notification, stateRef.current),
    updateMilestone: (updatedMilestone) => milestoneActions.updateMilestone(dispatch, updatedMilestone, notification, stateRef.current),
    deleteMilestone: (milestoneId) => milestoneActions.deleteMilestone(dispatch, milestoneId, notification, stateRef.current),
    updateMilestoneProgress: (milestoneId, newProgress) => milestoneActions.updateMilestoneProgress(dispatch, milestoneId, newProgress, notification, stateRef.current)
  };
  
  // Time block actions
  const addTimeBlock = async (newTimeBlock) => {
    try {
      // Update state
      const updatedTimeBlocks = [...state.timeBlocks, newTimeBlock];
      dispatch({ type: 'SET_TIME_BLOCKS', payload: updatedTimeBlocks });
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TIME_BLOCKS, updatedTimeBlocks);
      
      return newTimeBlock;
    } catch (error) {
      console.error('Error adding time block:', error);
      notification.showError('Failed to add time block');
      throw error;
    }
  };
  
  const updateTimeBlock = async (updatedTimeBlock) => {
    try {
      // Update state
      const updatedTimeBlocks = state.timeBlocks.map(timeBlock => 
        timeBlock.id === updatedTimeBlock.id ? updatedTimeBlock : timeBlock
      );
      dispatch({ type: 'SET_TIME_BLOCKS', payload: updatedTimeBlocks });
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TIME_BLOCKS, updatedTimeBlocks);
      
      return updatedTimeBlock;
    } catch (error) {
      console.error('Error updating time block:', error);
      notification.showError('Failed to update time block');
      throw error;
    }
  };
  
  const deleteTimeBlock = async (timeBlockId) => {
    try {
      // Update state
      const updatedTimeBlocks = state.timeBlocks.filter(timeBlock => timeBlock.id !== timeBlockId);
      dispatch({ type: 'SET_TIME_BLOCKS', payload: updatedTimeBlocks });
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TIME_BLOCKS, updatedTimeBlocks);
      
      notification.showSuccess('Time block deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting time block:', error);
      notification.showError('Failed to delete time block');
      throw error;
    }
  };
  
  // Task actions
  const addTask = async (milestoneId, newTask) => {
    try {
      // Check if milestone exists
      const milestoneExists = state.milestones.some(p => p.id === milestoneId);
      if (!milestoneExists) {
        console.warn(`Milestone with ID ${milestoneId} not found, cannot add task`);
        notification.showError('Milestone not found');
        return null;
      }
      
      // Create a copy of tasks to avoid null or undefined issues
      const currentTasks = Array.isArray(state.tasks) ? [...state.tasks] : [];
      
      // Add the task
      const taskWithId = { 
        ...newTask,
        id: newTask.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        milestoneId: milestoneId,
        completed: newTask.completed || false,
        createdAt: new Date().toISOString()
      };
      
      // Add to state
      const updatedTasks = [...currentTasks, taskWithId];
      dispatch({ type: 'SET_TASKS', payload: updatedTasks });
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TASKS, updatedTasks);
      
      // Find the current milestone
      const milestone = state.milestones.find(p => p.id === milestoneId);
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
        
        // Update the milestone
        await milestoneActionWrappers.updateMilestone(updatedMilestone);
      }
      
      return taskWithId;
    } catch (error) {
      console.error('Error adding task:', error);
      notification.showError('Failed to add task');
      return null;
    }
  };
  
  const updateTask = async (milestoneId, taskId, updatedTask) => {
    try {
      // Check if milestone exists
      const milestoneExists = state.milestones.some(p => p.id === milestoneId);
      if (!milestoneExists) {
        console.warn(`Milestone with ID ${milestoneId} not found, cannot update task`);
        notification.showError('Milestone not found');
        return null;
      }
      
      // Make sure we have a tasks array
      if (!Array.isArray(state.tasks)) {
        console.error('No tasks array available');
        throw new Error('Tasks array not available');
      }
      
      // Find the task
      const taskIndex = state.tasks.findIndex(task => task.id === taskId && task.milestoneId === milestoneId);
      
      if (taskIndex === -1) {
        console.warn(`Task with ID ${taskId} not found in milestone ${milestoneId}`);
        notification.showError('Task not found');
        return null;
      }
      
      // Update the task
      const newTasksArray = [...state.tasks];
      newTasksArray[taskIndex] = { 
        ...newTasksArray[taskIndex], 
        ...updatedTask
      };
      
      // Update state
      dispatch({ type: 'SET_TASKS', payload: newTasksArray });
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TASKS, newTasksArray);
      
      // Update milestone progress
      await updateMilestoneProgressFromTasks(milestoneId, newTasksArray);
      
      return newTasksArray[taskIndex];
    } catch (error) {
      console.error('Error updating task:', error);
      notification.showError('Failed to update task');
      return null;
    }
  };
  
  const deleteTask = async (milestoneId, taskId) => {
    try {
      // Check if milestone exists
      const milestoneExists = state.milestones.some(p => p.id === milestoneId);
      if (!milestoneExists) {
        console.warn(`Milestone with ID ${milestoneId} not found, cannot delete task`);
        notification.showError('Milestone not found');
        return false;
      }
      
      // Make sure we have a tasks array
      if (!Array.isArray(state.tasks)) {
        console.error('No tasks array available');
        throw new Error('Tasks array not available');
      }
      
      // Check if task exists
      const taskExists = state.tasks.some(task => task.id === taskId && task.milestoneId === milestoneId);
      if (!taskExists) {
        console.warn(`Task with ID ${taskId} not found in milestone ${milestoneId}`);
        notification.showError('Task not found');
        return false;
      }
      
      // Remove the task
      const updatedTasks = state.tasks.filter(task => !(task.id === taskId && task.milestoneId === milestoneId));
      
      // Update state
      dispatch({ type: 'SET_TASKS', payload: updatedTasks });
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TASKS, updatedTasks);
      
      // Update milestone progress
      await updateMilestoneProgressFromTasks(milestoneId, updatedTasks);
      
      notification.showSuccess('Task deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      notification.showError('Failed to delete task');
      return false;
    }
  };
  
  // Helper function to update milestone progress from tasks
  const updateMilestoneProgressFromTasks = async (milestoneId, currentTasks = null) => {
    try {
      if (!milestoneId) return;
      
      const milestone = state.milestones.find(p => p.id === milestoneId);
      if (!milestone) return;
      
      // IMPORTANT: Don't change milestone status based on task completion
      // Only recalculate progress percentage while preserving status
      
      // Calculate task completion percentage (but don't change status)
      const tasksToUse = currentTasks || state.tasks;
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
      
      // Update the milestone
      await milestoneActionWrappers.updateMilestone(updatedMilestone);
    } catch (error) {
      console.error('Error updating milestone progress from tasks:', error);
    }
  };
  
  // Todo Management Functions
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
      let action;
      
      switch (tab) {
        case 'today':
          updatedList = [...state.todos, newTodo];
          action = 'SET_TODOS';
          break;
          
        case 'tomorrow':
          updatedList = [...state.tomorrowTodos, newTodo];
          action = 'SET_TOMORROW_TODOS';
          break;
          
        case 'later':
          updatedList = [...state.laterTodos, newTodo];
          action = 'SET_LATER_TODOS';
          break;
          
        default:
          throw new Error(`Invalid tab: ${tab}`);
      }
      
      // Update state
      dispatch({ type: action, payload: updatedList });
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS[tab.toUpperCase() + (tab !== 'today' ? '_TODOS' : 'S')], updatedList);
      
      console.log(`[AppContext] Added todo "${newTodo.title}" to ${tab} tab`);
      return newTodo;
    } catch (error) {
      console.error('[AppContext] Error adding todo:', error);
      notification.showError('Failed to add todo');
      throw error;
    }
  };
  
  // Update todos for a specific tab
  const updateTodos = async (updatedList, tab = 'today') => {
    try {
      let action;
      let storageKey;
      
      switch (tab) {
        case 'today':
          action = 'SET_TODOS';
          storageKey = STORAGE_KEYS.TODOS;
          break;
          
        case 'tomorrow':
          action = 'SET_TOMORROW_TODOS';
          storageKey = STORAGE_KEYS.TOMORROW_TODOS;
          break;
          
        case 'later':
          action = 'SET_LATER_TODOS';
          storageKey = STORAGE_KEYS.LATER_TODOS;
          break;
          
        default:
          throw new Error(`Invalid tab: ${tab}`);
      }
      
      // Update state
      dispatch({ type: action, payload: updatedList });
      
      // Save to AsyncStorage
      await saveData(storageKey, updatedList);
      
      console.log(`[AppContext] Updated ${tab} todos list with ${updatedList.length} items`);
      return true;
    } catch (error) {
      console.error('[AppContext] Error updating todos:', error);
      notification.showError('Failed to update todos');
      throw error;
    }
  };
  
  // Delete a todo
  const deleteTodo = async (todoId, tab = 'today') => {
    try {
      let currentList;
      let action;
      let storageKey;
      
      switch (tab) {
        case 'today':
          currentList = state.todos;
          action = 'SET_TODOS';
          storageKey = STORAGE_KEYS.TODOS;
          break;
          
        case 'tomorrow':
          currentList = state.tomorrowTodos;
          action = 'SET_TOMORROW_TODOS';
          storageKey = STORAGE_KEYS.TOMORROW_TODOS;
          break;
          
        case 'later':
          currentList = state.laterTodos;
          action = 'SET_LATER_TODOS';
          storageKey = STORAGE_KEYS.LATER_TODOS;
          break;
          
        default:
          throw new Error(`Invalid tab: ${tab}`);
      }
      
      // Find the todo to check if it's a group
      const todoToDelete = currentList.find(todo => todo.id === todoId);
      
      let updatedList;
      
      if (todoToDelete && todoToDelete.isGroup) {
        // If it's a group, delete the group and all its children
        updatedList = currentList.filter(item => 
          item.id !== todoId && item.groupId !== todoId
        );
      } else {
        // Delete individual todo
        updatedList = currentList.filter(todo => todo.id !== todoId);
      }
      
      // Update state
      dispatch({ type: action, payload: updatedList });
      
      // Save to AsyncStorage
      await saveData(storageKey, updatedList);
      
      console.log(`[AppContext] Deleted todo from ${tab}`);
      return true;
    } catch (error) {
      console.error('[AppContext] Error deleting todo:', error);
      notification.showError('Failed to delete todo');
      throw error;
    }
  };
  
  // Toggle todo completion
  const toggleTodo = async (todoId, tab = 'today') => {
    try {
      let currentList;
      let action;
      let storageKey;
      
      switch (tab) {
        case 'today':
          currentList = state.todos;
          action = 'SET_TODOS';
          storageKey = STORAGE_KEYS.TODOS;
          break;
          
        case 'tomorrow':
          currentList = state.tomorrowTodos;
          action = 'SET_TOMORROW_TODOS';
          storageKey = STORAGE_KEYS.TOMORROW_TODOS;
          break;
          
        case 'later':
          currentList = state.laterTodos;
          action = 'SET_LATER_TODOS';
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
      
      // Update state
      dispatch({ type: action, payload: updatedList });
      
      // Save to AsyncStorage
      await saveData(storageKey, updatedList);
      
      console.log(`[AppContext] Toggled todo completion for "${todoItem.title}" in ${tab}`);
      return true;
    } catch (error) {
      console.error('[AppContext] Error toggling todo:', error);
      notification.showError('Failed to update todo');
      throw error;
    }
  };
  
  // Domain and settings functions
  const updateDomain = async (updatedDomain) => {
    try {
      // First check if domain exists
      const domainExists = state.domains.some(domain => 
        domain.id === updatedDomain.id || domain.name === updatedDomain.name
      );
      
      let updatedDomains;
      
      if (domainExists) {
        // Update existing domain
        updatedDomains = state.domains.map(domain => 
          (domain.id === updatedDomain.id || domain.name === updatedDomain.name) ? updatedDomain : domain
        );
      } else {
        // Add new domain
        updatedDomains = [...state.domains, updatedDomain];
      }
      
      // Update state
      dispatch({ type: 'SET_DOMAINS', payload: updatedDomains });
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.DOMAINS, updatedDomains);
      
      // Update any goals with this domain
      if (updatedDomain.name) {
        const goalsToUpdate = state.goals.filter(goal => 
          goal.domain === updatedDomain.name || 
          (goal.icon && goal.icon === updatedDomain.icon)
        );
        
        if (goalsToUpdate.length > 0) {
          const updatedGoals = state.goals.map(goal => {
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
          dispatch({ type: 'SET_GOALS', payload: updatedGoals });
          
          // Save to AsyncStorage
          await saveData(STORAGE_KEYS.GOALS, updatedGoals);
          console.log(`Updated ${goalsToUpdate.length} goals with domain "${updatedDomain.name}"`);
        }
        
        // Also update any milestones with this domain
        const milestonesToUpdate = state.milestones.filter(milestone => 
          milestone.domain === updatedDomain.name
        );
        
        if (milestonesToUpdate.length > 0) {
          const updatedMilestones = state.milestones.map(milestone => {
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
          dispatch({ type: 'SET_MILESTONES', payload: updatedMilestones });
          
          // Save to AsyncStorage
          await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
          console.log(`Updated ${milestonesToUpdate.length} milestones with domain "${updatedDomain.name}"`);
        }
      }
      
      return updatedDomain;
    } catch (error) {
      console.error('Error updating domain:', error);
      notification.showError('Failed to update domain');
      throw error;
    }
  };
  
  // Update app settings
  const updateAppSetting = async (key, value) => {
    try {
      // Update state
      const updatedSettings = {
        ...state.settings,
        [key]: value
      };
      
      dispatch({ type: 'SET_SETTINGS', payload: updatedSettings });
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.SETTINGS, updatedSettings);
      
      return updatedSettings;
    } catch (error) {
      console.error('Error updating app setting:', error);
      notification.showError('Failed to update app setting');
      throw error;
    }
  };
  
  // Update user profile
  const updateUserProfile = async (updatedProfile) => {
    try {
      // Update state
      const updatedSettings = {
        ...state.settings,
        userProfile: {
          ...state.settings.userProfile,
          ...updatedProfile
        }
      };
      
      dispatch({ type: 'SET_SETTINGS', payload: updatedSettings });
      
      // Save to AsyncStorage - full settings
      await saveData(STORAGE_KEYS.SETTINGS, updatedSettings);
      
      // Also save user profile separately for easier access
      await saveData(STORAGE_KEYS.USER_PROFILE, updatedSettings.userProfile);
      
      return updatedSettings.userProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      notification.showError('Failed to update user profile');
      throw error;
    }
  };
  
  // Get life direction
  const getLifeDirection = () => {
    return state.settings.lifeDirection || '';
  };
  
  // Force refresh data (useful after operations that might leave orphaned references)
  const refreshData = async () => {
    try {
      console.log('Forcing data refresh...');
      
      // First clean up any orphaned milestones
      const cleanupResults = cleanupOrphanedMilestones(state.milestones, state.goals, state.milestoneGoalLinkMap);
      console.log(`Cleaned up ${cleanupResults.orphanCount} orphaned milestones`);
      
      if (cleanupResults.orphanCount > 0) {
        // Update milestones state
        dispatch({ type: 'SET_MILESTONES', payload: cleanupResults.milestones });
        dispatch({ type: 'SET_MILESTONE_GOAL_LINK_MAP', payload: cleanupResults.milestoneGoalLinkMap });
        
        // Save to AsyncStorage
        await saveData(STORAGE_KEYS.MILESTONES, cleanupResults.milestones);
        await saveData(STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, cleanupResults.milestoneGoalLinkMap);
      }
      
      // Reload all data from storage
      const data = await loadAppData();
      
      // Update state with fresh data
      dispatch({ type: 'SET_ALL_DATA', payload: data });
      
      console.log('Data refresh complete');
      return true;
    } catch (error) {
      console.error('Error refreshing data:', error);
      return false;
    }
  };
  
  // Utility function to recalculate domains from goals
  const refreshDomains = async () => {
    console.log('Calculating domains from goals...');
    
    // Create a map to store domain data
    const domainMap = {};
    
    if (Array.isArray(state.goals)) {
      state.goals.forEach(goal => {
        if (goal && goal.domain) {
          // Normalize the domain
          const normalizedDomain = normalizeDomain(goal);
          const domainName = normalizedDomain.domain;
          
          // Get domain icon and color
          const icon = goal.icon || getDomainIcon(domainName);
          const color = goal.color || getDomainColor(domainName);
          
          // Check if domain already exists
          if (domainMap[domainName]) {
            // Update counts
            domainMap[domainName].goalCount++;
            if (goal.completed) {
              domainMap[domainName].completedGoalCount++;
            }
          } else {
            // Create new domain entry
            domainMap[domainName] = {
              id: domainName,
              name: domainName,
              icon: icon,
              color: color,
              goalCount: 1,
              completedGoalCount: goal.completed ? 1 : 0
            };
          }
        }
      });
    }
    
    const refreshedDomains = Object.values(domainMap);
    
    // Update domains state
    dispatch({ type: 'SET_DOMAINS', payload: refreshedDomains });
    
    // Save to AsyncStorage
    await saveData(STORAGE_KEYS.DOMAINS, refreshedDomains);
    console.log(`Refreshed ${refreshedDomains.length} domains`);
    
    return refreshedDomains;
  };
  
  // Helper function to get domain icon - using constants now
  const getDomainIcon = (domainName) => {
    if (!domainName) return 'star';
    return DOMAIN_ICONS[domainName.toLowerCase()] || 'star';
  };
  
  // Helper function to get domain color - using constants now
  const getDomainColor = (domainName) => {
    if (!domainName) return '#607D8B';
    return DOMAIN_COLORS[domainName.toLowerCase()] || '#607D8B';
  };
  
  // Combine all functions and state values to be provided through context
  const contextValue = {
    // State values
    goals: state.goals,
    mainGoals: state.goals, // Alias for backward compatibility
    milestones: state.milestones,
    timeBlocks: state.timeBlocks,
    domains: state.domains,
    settings: state.settings,
    tags: state.tags,
    notes: state.notes,
    filters: state.filters,
    isLoading: state.isLoading,
    milestoneGoalLinkMap: state.milestoneGoalLinkMap,
    tasks: state.tasks,
    todos: state.todos,
    tomorrowTodos: state.tomorrowTodos,
    laterTodos: state.laterTodos,
    
    // State setters (for direct updates when needed)
    setGoals: (goals) => dispatch({ type: 'SET_GOALS', payload: goals }),
    setMilestones: (milestones) => dispatch({ type: 'SET_MILESTONES', payload: milestones }),
    setTasks: (tasks) => dispatch({ type: 'SET_TASKS', payload: tasks }),
    setTodos: (todos) => dispatch({ type: 'SET_TODOS', payload: todos }),
    setTomorrowTodos: (todos) => dispatch({ type: 'SET_TOMORROW_TODOS', payload: todos }),
    setLaterTodos: (todos) => dispatch({ type: 'SET_LATER_TODOS', payload: todos }),
    
    // Helper functions
    isMilestoneActive: (milestoneId) => state.milestones.some(p => p.id === milestoneId) && !state.deletedMilestoneIds.has(milestoneId),
    isGoalActive: (goalId) => state.goals.some(g => g.id === goalId),
    getMilestone: (milestoneId) => state.milestones.find(p => p.id === milestoneId),
    hasParentGoal: (milestoneId) => {
      const milestone = state.milestones.find(p => p.id === milestoneId);
      return milestone && milestone.goalId && state.goals.some(g => g.id === milestone.goalId);
    },
    getParentGoal: (milestoneId) => {
      const milestone = state.milestones.find(p => p.id === milestoneId);
      return milestone && milestone.goalId ? 
        state.goals.find(g => g.id === milestone.goalId) : null;
    },
    getMilestonesForGoal: (goalId) => getMilestonesForGoal(goalId, state.milestones, state.deletedMilestoneIds),
    getIndependentMilestones: () => getIndependentMilestones(state.milestones, state.deletedMilestoneIds),
    getTasksForMilestone: (milestoneId) => getTasksForMilestone(milestoneId, state.tasks),
    calculateGoalProgress: (goalId) => calculateGoalProgress(goalId, state.milestones),
    calculateMilestoneProgress: (milestoneId) => calculateMilestoneProgress(milestoneId, state.tasks, state.milestones),
    
    // Goal actions
    addGoal: goalActionWrappers.addGoal,
    updateGoal: goalActionWrappers.updateGoal,
    deleteGoal: goalActionWrappers.deleteGoal,
    
    // Milestone actions
    addMilestone: milestoneActionWrappers.addMilestone,
    updateMilestone: milestoneActionWrappers.updateMilestone,
    deleteMilestone: milestoneActionWrappers.deleteMilestone,
    updateMilestoneProgress: milestoneActionWrappers.updateMilestoneProgress,
    updateMilestoneProgressFromTasks,
    
    // Task actions
    addTask,
    updateTask,
    deleteTask,
    
    // Time block actions
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    
    // Todo actions
    addTodo,
    updateTodos,
    deleteTodo,
    toggleTodo,
    
    // Domain and settings actions
    updateDomain,
    refreshDomains,
    updateAppSetting,
    updateUserProfile,
    getLifeDirection,
    
    // Utility functions
    linkMilestonesToGoalsByTitle: async () => {
      const results = linkMilestonesToGoalsByTitle(state.milestones, state.goals, state.milestoneGoalLinkMap);
      
      if (results.fixCount > 0) {
        dispatch({ type: 'SET_MILESTONES', payload: results.milestones });
        dispatch({ type: 'SET_MILESTONE_GOAL_LINK_MAP', payload: results.milestoneGoalLinkMap });
        
        await saveData(STORAGE_KEYS.MILESTONES, results.milestones);
        await saveData(STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, results.milestoneGoalLinkMap);
        
        notification.showSuccess(`Fixed ${results.fixCount} milestone-goal relationships`);
      }
      
      return results.fixCount;
    },
    auditMilestoneGoalRelationships: async () => {
      const results = auditMilestoneGoalRelationships(state.milestones, state.goals, state.milestoneGoalLinkMap);
      
      if (results.needsUpdate) {
        dispatch({ type: 'SET_MILESTONES', payload: results.milestones });
        dispatch({ type: 'SET_MILESTONE_GOAL_LINK_MAP', payload: results.milestoneGoalLinkMap });
        
        await saveData(STORAGE_KEYS.MILESTONES, results.milestones);
        await saveData(STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, results.milestoneGoalLinkMap);
        
        console.log(`Fixed ${results.stats.fixesApplied} milestone-goal relationships`);
      }
      
      return results.stats;
    },
    cleanupOrphanedMilestones: async () => {
      const results = cleanupOrphanedMilestones(state.milestones, state.goals, state.milestoneGoalLinkMap);
      
      if (results.orphanCount > 0) {
        dispatch({ type: 'SET_MILESTONES', payload: results.milestones });
        dispatch({ type: 'SET_MILESTONE_GOAL_LINK_MAP', payload: results.milestoneGoalLinkMap });
        
        await saveData(STORAGE_KEYS.MILESTONES, results.milestones);
        await saveData(STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, results.milestoneGoalLinkMap);
        
        console.log(`Cleaned up ${results.orphanCount} orphaned milestones`);
      }
      
      return results.orphanCount;
    },
    refreshData
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
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;