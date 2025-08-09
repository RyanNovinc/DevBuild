// src/context/AppContext/index.js
// Optimized AppContext that combines all the individual modules

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { useNotification } from '../NotificationContext';

// Import constants
import { STORAGE_KEYS, DEFAULT_SETTINGS } from './constants';

// Import utility functions
import { loadAppData, saveData } from './utils/storageUtils';
import { 
  auditProjectGoalRelationships, 
  cleanupOrphanedProjects,
  linkProjectsToGoalsByTitle
} from './utils/relationshipUtils';
import { 
  calculateGoalProgress, 
  calculateProjectProgress,
  getProjectsForGoal,
  getIndependentProjects,
  getTasksForProject
} from './utils/progressUtils';

// Import reducers and actions
import { goalReducer, initialGoalState, goalActions } from './reducers/goalReducer';
import { projectReducer, initialProjectState, projectActions } from './reducers/projectReducer';

// Create context
const AppContext = createContext();

// Combine all initial states
const initialState = {
  ...initialGoalState,
  ...initialProjectState,
  
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
  
  // Then apply project reducer on the updated state
  const projectState = projectReducer(goalState, action);
  
  // Handle other actions
  switch (action.type) {
    case 'SET_TIME_BLOCKS':
      return {
        ...projectState,
        timeBlocks: action.payload,
      };
      
    case 'SET_DOMAINS':
      return {
        ...projectState,
        domains: action.payload,
      };
      
    case 'SET_SETTINGS':
      return {
        ...projectState,
        settings: action.payload,
      };
      
    case 'SET_TAGS':
      return {
        ...projectState,
        tags: action.payload,
      };
      
    case 'SET_NOTES':
      return {
        ...projectState,
        notes: action.payload,
      };
      
    case 'SET_FILTERS':
      return {
        ...projectState,
        filters: action.payload,
      };
      
    case 'SET_LOADING':
      return {
        ...projectState,
        isLoading: action.payload,
      };
      
    case 'SET_TASKS':
      return {
        ...projectState,
        tasks: action.payload,
      };
      
    case 'SET_TODOS':
      return {
        ...projectState,
        todos: action.payload,
      };
      
    case 'SET_TOMORROW_TODOS':
      return {
        ...projectState,
        tomorrowTodos: action.payload,
      };
      
    case 'SET_LATER_TODOS':
      return {
        ...projectState,
        laterTodos: action.payload,
      };
      
    case 'SET_ALL_DATA':
      return {
        ...projectState,
        ...action.payload,
        isLoading: false,
      };
      
    default:
      return projectState;
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
        if (data.goals && data.projects) {
          const auditResults = auditProjectGoalRelationships(data.projects, data.goals, data.projectGoalLinkMap);
          
          if (auditResults.needsUpdate) {
            // Update projects with fixed relationships
            dispatch({ type: 'SET_PROJECTS', payload: auditResults.projects });
            dispatch({ type: 'SET_PROJECT_GOAL_LINK_MAP', payload: auditResults.projectGoalLinkMap });
            
            // Save fixed data
            await saveData(STORAGE_KEYS.PROJECTS, auditResults.projects);
            await saveData(STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, auditResults.projectGoalLinkMap);
            
            console.log(`Fixed ${auditResults.stats.fixesApplied} project-goal relationships`);
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
  
  // Create a wrapper for project actions
  const projectActionWrappers = {
    addProject: (newProject) => projectActions.addProject(dispatch, newProject, notification, stateRef.current),
    updateProject: (updatedProject) => projectActions.updateProject(dispatch, updatedProject, notification, stateRef.current),
    deleteProject: (projectId) => projectActions.deleteProject(dispatch, projectId, notification, stateRef.current),
    updateProjectProgress: (projectId, newProgress) => projectActions.updateProjectProgress(dispatch, projectId, newProgress, notification, stateRef.current)
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
  const addTask = async (projectId, newTask) => {
    try {
      // Check if project exists
      const projectExists = state.projects.some(p => p.id === projectId);
      if (!projectExists) {
        console.warn(`Project with ID ${projectId} not found, cannot add task`);
        notification.showError('Project not found');
        return null;
      }
      
      // Create a copy of tasks to avoid null or undefined issues
      const currentTasks = Array.isArray(state.tasks) ? [...state.tasks] : [];
      
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
      dispatch({ type: 'SET_TASKS', payload: updatedTasks });
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TASKS, updatedTasks);
      
      // Find the current project
      const project = state.projects.find(p => p.id === projectId);
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
        
        // Update the project
        await projectActionWrappers.updateProject(updatedProject);
      }
      
      return taskWithId;
    } catch (error) {
      console.error('Error adding task:', error);
      notification.showError('Failed to add task');
      return null;
    }
  };
  
  const updateTask = async (projectId, taskId, updatedTask) => {
    try {
      // Check if project exists
      const projectExists = state.projects.some(p => p.id === projectId);
      if (!projectExists) {
        console.warn(`Project with ID ${projectId} not found, cannot update task`);
        notification.showError('Project not found');
        return null;
      }
      
      // Make sure we have a tasks array
      if (!Array.isArray(state.tasks)) {
        console.error('No tasks array available');
        throw new Error('Tasks array not available');
      }
      
      // Find the task
      const taskIndex = state.tasks.findIndex(task => task.id === taskId && task.projectId === projectId);
      
      if (taskIndex === -1) {
        console.warn(`Task with ID ${taskId} not found in project ${projectId}`);
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
      
      // Update project progress
      await updateProjectProgressFromTasks(projectId, newTasksArray);
      
      return newTasksArray[taskIndex];
    } catch (error) {
      console.error('Error updating task:', error);
      notification.showError('Failed to update task');
      return null;
    }
  };
  
  const deleteTask = async (projectId, taskId) => {
    try {
      // Check if project exists
      const projectExists = state.projects.some(p => p.id === projectId);
      if (!projectExists) {
        console.warn(`Project with ID ${projectId} not found, cannot delete task`);
        notification.showError('Project not found');
        return false;
      }
      
      // Make sure we have a tasks array
      if (!Array.isArray(state.tasks)) {
        console.error('No tasks array available');
        throw new Error('Tasks array not available');
      }
      
      // Check if task exists
      const taskExists = state.tasks.some(task => task.id === taskId && task.projectId === projectId);
      if (!taskExists) {
        console.warn(`Task with ID ${taskId} not found in project ${projectId}`);
        notification.showError('Task not found');
        return false;
      }
      
      // Remove the task
      const updatedTasks = state.tasks.filter(task => !(task.id === taskId && task.projectId === projectId));
      
      // Update state
      dispatch({ type: 'SET_TASKS', payload: updatedTasks });
      
      // Save to AsyncStorage
      await saveData(STORAGE_KEYS.TASKS, updatedTasks);
      
      // Update project progress
      await updateProjectProgressFromTasks(projectId, updatedTasks);
      
      notification.showSuccess('Task deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      notification.showError('Failed to delete task');
      return false;
    }
  };
  
  // Helper function to update project progress from tasks
  const updateProjectProgressFromTasks = async (projectId, currentTasks = null) => {
    try {
      if (!projectId) return;
      
      const project = state.projects.find(p => p.id === projectId);
      if (!project) return;
      
      // IMPORTANT: Don't change project status based on task completion
      // Only recalculate progress percentage while preserving status
      
      // Calculate task completion percentage (but don't change status)
      const tasksToUse = currentTasks || state.tasks;
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
      
      // Update the project
      await projectActionWrappers.updateProject(updatedProject);
    } catch (error) {
      console.error('Error updating project progress from tasks:', error);
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
        
        // Also update any projects with this domain
        const projectsToUpdate = state.projects.filter(project => 
          project.domain === updatedDomain.name
        );
        
        if (projectsToUpdate.length > 0) {
          const updatedProjects = state.projects.map(project => {
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
          dispatch({ type: 'SET_PROJECTS', payload: updatedProjects });
          
          // Save to AsyncStorage
          await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
          console.log(`Updated ${projectsToUpdate.length} projects with domain "${updatedDomain.name}"`);
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
      
      // First clean up any orphaned projects
      const cleanupResults = cleanupOrphanedProjects(state.projects, state.goals, state.projectGoalLinkMap);
      console.log(`Cleaned up ${cleanupResults.orphanCount} orphaned projects`);
      
      if (cleanupResults.orphanCount > 0) {
        // Update projects state
        dispatch({ type: 'SET_PROJECTS', payload: cleanupResults.projects });
        dispatch({ type: 'SET_PROJECT_GOAL_LINK_MAP', payload: cleanupResults.projectGoalLinkMap });
        
        // Save to AsyncStorage
        await saveData(STORAGE_KEYS.PROJECTS, cleanupResults.projects);
        await saveData(STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, cleanupResults.projectGoalLinkMap);
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
    projects: state.projects,
    timeBlocks: state.timeBlocks,
    domains: state.domains,
    settings: state.settings,
    tags: state.tags,
    notes: state.notes,
    filters: state.filters,
    isLoading: state.isLoading,
    projectGoalLinkMap: state.projectGoalLinkMap,
    tasks: state.tasks,
    todos: state.todos,
    tomorrowTodos: state.tomorrowTodos,
    laterTodos: state.laterTodos,
    
    // State setters (for direct updates when needed)
    setGoals: (goals) => dispatch({ type: 'SET_GOALS', payload: goals }),
    setProjects: (projects) => dispatch({ type: 'SET_PROJECTS', payload: projects }),
    setTasks: (tasks) => dispatch({ type: 'SET_TASKS', payload: tasks }),
    setTodos: (todos) => dispatch({ type: 'SET_TODOS', payload: todos }),
    setTomorrowTodos: (todos) => dispatch({ type: 'SET_TOMORROW_TODOS', payload: todos }),
    setLaterTodos: (todos) => dispatch({ type: 'SET_LATER_TODOS', payload: todos }),
    
    // Helper functions
    isProjectActive: (projectId) => state.projects.some(p => p.id === projectId) && !state.deletedProjectIds.has(projectId),
    isGoalActive: (goalId) => state.goals.some(g => g.id === goalId),
    getProject: (projectId) => state.projects.find(p => p.id === projectId),
    hasParentGoal: (projectId) => {
      const project = state.projects.find(p => p.id === projectId);
      return project && project.goalId && state.goals.some(g => g.id === project.goalId);
    },
    getParentGoal: (projectId) => {
      const project = state.projects.find(p => p.id === projectId);
      return project && project.goalId ? 
        state.goals.find(g => g.id === project.goalId) : null;
    },
    getProjectsForGoal: (goalId) => getProjectsForGoal(goalId, state.projects, state.deletedProjectIds),
    getIndependentProjects: () => getIndependentProjects(state.projects, state.deletedProjectIds),
    getTasksForProject: (projectId) => getTasksForProject(projectId, state.tasks),
    calculateGoalProgress: (goalId) => calculateGoalProgress(goalId, state.projects),
    calculateProjectProgress: (projectId) => calculateProjectProgress(projectId, state.tasks, state.projects),
    
    // Goal actions
    addGoal: goalActionWrappers.addGoal,
    updateGoal: goalActionWrappers.updateGoal,
    deleteGoal: goalActionWrappers.deleteGoal,
    
    // Project actions
    addProject: projectActionWrappers.addProject,
    updateProject: projectActionWrappers.updateProject,
    deleteProject: projectActionWrappers.deleteProject,
    updateProjectProgress: projectActionWrappers.updateProjectProgress,
    updateProjectProgressFromTasks,
    
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
    linkProjectsToGoalsByTitle: async () => {
      const results = linkProjectsToGoalsByTitle(state.projects, state.goals, state.projectGoalLinkMap);
      
      if (results.fixCount > 0) {
        dispatch({ type: 'SET_PROJECTS', payload: results.projects });
        dispatch({ type: 'SET_PROJECT_GOAL_LINK_MAP', payload: results.projectGoalLinkMap });
        
        await saveData(STORAGE_KEYS.PROJECTS, results.projects);
        await saveData(STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, results.projectGoalLinkMap);
        
        notification.showSuccess(`Fixed ${results.fixCount} project-goal relationships`);
      }
      
      return results.fixCount;
    },
    auditProjectGoalRelationships: async () => {
      const results = auditProjectGoalRelationships(state.projects, state.goals, state.projectGoalLinkMap);
      
      if (results.needsUpdate) {
        dispatch({ type: 'SET_PROJECTS', payload: results.projects });
        dispatch({ type: 'SET_PROJECT_GOAL_LINK_MAP', payload: results.projectGoalLinkMap });
        
        await saveData(STORAGE_KEYS.PROJECTS, results.projects);
        await saveData(STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, results.projectGoalLinkMap);
        
        console.log(`Fixed ${results.stats.fixesApplied} project-goal relationships`);
      }
      
      return results.stats;
    },
    cleanupOrphanedProjects: async () => {
      const results = cleanupOrphanedProjects(state.projects, state.goals, state.projectGoalLinkMap);
      
      if (results.orphanCount > 0) {
        dispatch({ type: 'SET_PROJECTS', payload: results.projects });
        dispatch({ type: 'SET_PROJECT_GOAL_LINK_MAP', payload: results.projectGoalLinkMap });
        
        await saveData(STORAGE_KEYS.PROJECTS, results.projects);
        await saveData(STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, results.projectGoalLinkMap);
        
        console.log(`Cleaned up ${results.orphanCount} orphaned projects`);
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