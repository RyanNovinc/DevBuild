// src/context/AppContext/reducers/projectReducer.js
// Extracted project reducer logic from AppContext.js

import { STORAGE_KEYS } from '../constants';
import { saveData } from '../utils/storageUtils';
import { normalizeDomain } from '../../../utils/domainUtils';
import { calculateProjectProgress } from '../utils/progressUtils';
import { goalActions } from './goalReducer';

// Initial state for projects
export const initialProjectState = {
  projects: [],
  deletedProjectIds: new Set(),
  updatingProjects: new Set(),
  deletingProjects: new Set(),
  projectGoalLinkMap: {},
};

// Project reducer
export const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROJECTS':
      return {
        ...state,
        projects: action.payload,
      };
      
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload],
      };
      
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project => 
          project.id === action.payload.id ? action.payload : project
        ),
      };
      
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
      };
      
    case 'SET_PROJECT_GOAL_LINK_MAP':
      return {
        ...state,
        projectGoalLinkMap: action.payload,
      };
      
    case 'ADD_DELETED_PROJECT_ID':
      const newDeletedIds = new Set(state.deletedProjectIds);
      newDeletedIds.add(action.payload);
      return {
        ...state,
        deletedProjectIds: newDeletedIds,
      };
      
    case 'REMOVE_DELETED_PROJECT_ID':
      const updatedDeletedIds = new Set(state.deletedProjectIds);
      updatedDeletedIds.delete(action.payload);
      return {
        ...state,
        deletedProjectIds: updatedDeletedIds,
      };
      
    case 'ADD_UPDATING_PROJECT':
      const newUpdatingProjects = new Set(state.updatingProjects);
      newUpdatingProjects.add(action.payload);
      return {
        ...state,
        updatingProjects: newUpdatingProjects,
      };
      
    case 'REMOVE_UPDATING_PROJECT':
      const updatedUpdatingProjects = new Set(state.updatingProjects);
      updatedUpdatingProjects.delete(action.payload);
      return {
        ...state,
        updatingProjects: updatedUpdatingProjects,
      };
      
    case 'ADD_DELETING_PROJECT':
      const newDeletingProjects = new Set(state.deletingProjects);
      newDeletingProjects.add(action.payload);
      return {
        ...state,
        deletingProjects: newDeletingProjects,
      };
      
    case 'REMOVE_DELETING_PROJECT':
      const updatedDeletingProjects = new Set(state.deletingProjects);
      updatedDeletingProjects.delete(action.payload);
      return {
        ...state,
        deletingProjects: updatedDeletingProjects,
      };
      
    default:
      return state;
  }
};

// Project actions
export const projectActions = {
  // Add a project
  addProject: async (dispatch, newProject, notification, state) => {
    try {
      // First verify goal relationship if goalId is provided
      if (newProject.goalId) {
        const goalExists = state.goals.some(goal => goal.id === newProject.goalId);
        
        if (!goalExists) {
          console.warn(`Project references nonexistent goal ID: ${newProject.goalId}`);
          
          // Try to find by goalTitle
          if (newProject.goalTitle) {
            const matchingGoal = state.goals.find(goal => 
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
          const linkedGoal = state.goals.find(goal => goal.id === newProject.goalId);
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
      dispatch({ type: 'ADD_PROJECT', payload: normalizedProject });
      
      // Save to AsyncStorage
      const updatedProjects = [...state.projects, normalizedProject];
      await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
      
      // Also update the project-goal link map
      if (normalizedProject.goalId) {
        const updatedLinkMap = {
          ...state.projectGoalLinkMap,
          [normalizedProject.id]: normalizedProject.goalId
        };
        dispatch({ type: 'SET_PROJECT_GOAL_LINK_MAP', payload: updatedLinkMap });
        
        // Save link map to AsyncStorage
        await saveData(STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, updatedLinkMap);
        
        // Update goal progress
        if (state.goals && state.goals.length > 0) {
          // Call the updateGoalProgress function
          await goalActions.updateGoalProgress(
            dispatch, 
            normalizedProject.goalId, 
            calculateGoalProgress(normalizedProject.goalId, updatedProjects),
            { ...state, projects: updatedProjects }
          );
        }
      }
      
      return normalizedProject;
    } catch (error) {
      console.error('Error adding project:', error);
      if (notification?.showError) {
        notification.showError('Failed to add project');
      }
      throw error;
    }
  },
  
  // Update a project
  updateProject: async (dispatch, updatedProject, notification, state) => {
    try {
      // Check if in progress
      if (state.updatingProjects.has(updatedProject.id)) {
        console.log(`Project ${updatedProject.id} is already being updated, ignoring duplicate request`);
        return null;
      }
      
      // Mark as in progress
      dispatch({ type: 'ADD_UPDATING_PROJECT', payload: updatedProject.id });
      
      // Check if project exists
      const projectExists = state.projects.some(p => p.id === updatedProject.id);
      if (!projectExists) {
        console.warn(`Project with ID ${updatedProject.id} not found, unable to update`);
        if (notification?.showError) {
          notification.showError('Project not found');
        }
        return null;
      }
      
      // Apply domain normalization
      const normalizedProject = normalizeDomain(updatedProject);
      
      // Get original project
      const originalProject = state.projects.find(p => p.id === normalizedProject.id);
      
      // Recalculate progress from tasks if flag is set
      if (normalizedProject.recalculateProgress && state.tasks) {
        const calculatedProgress = calculateProjectProgress(normalizedProject.id, state.tasks, state.projects);
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
      if (normalizedProject.goalId && !state.goals.some(goal => goal.id === normalizedProject.goalId)) {
        console.warn(`Project references nonexistent goal ID: ${normalizedProject.goalId}`);
        // Make this project independent if goal doesn't exist
        normalizedProject.goalId = null;
        normalizedProject.goalTitle = null;
      } else if (normalizedProject.goalId) {
        // Update goal title to match goal
        const goal = state.goals.find(g => g.id === normalizedProject.goalId);
        if (goal) {
          normalizedProject.goalTitle = goal.title;
        }
      }
      
      // Get the old project to check if goalId changed
      const oldProject = state.projects.find(p => p.id === normalizedProject.id);
      const goalIdChanged = oldProject && oldProject.goalId !== normalizedProject.goalId;
      
      // Update the projects state
      dispatch({ type: 'UPDATE_PROJECT', payload: normalizedProject });
      
      // Save to AsyncStorage
      const updatedProjects = state.projects.map(project => 
        project.id === normalizedProject.id ? normalizedProject : project
      );
      await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
      
      // Update the project-goal link map if goalId changed
      if (normalizedProject.goalId) {
        const updatedLinkMap = {
          ...state.projectGoalLinkMap,
          [normalizedProject.id]: normalizedProject.goalId
        };
        dispatch({ type: 'SET_PROJECT_GOAL_LINK_MAP', payload: updatedLinkMap });
        
        // Save link map to AsyncStorage
        await saveData(STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, updatedLinkMap);
      } else if (state.projectGoalLinkMap[normalizedProject.id]) {
        // Remove from map if goalId is gone
        const updatedLinkMap = { ...state.projectGoalLinkMap };
        delete updatedLinkMap[normalizedProject.id];
        dispatch({ type: 'SET_PROJECT_GOAL_LINK_MAP', payload: updatedLinkMap });
        
        // Save link map to AsyncStorage
        await saveData(STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, updatedLinkMap);
      }
      
      // Update goal progress if goal is linked or if goal changed
      if (normalizedProject.goalId) {
        // Call the updateGoalProgress function
        await goalActions.updateGoalProgress(
          dispatch, 
          normalizedProject.goalId, 
          calculateGoalProgress(normalizedProject.goalId, updatedProjects),
          { ...state, projects: updatedProjects }
        );
      }
      
      // If goal changed, also update the old goal's progress
      if (goalIdChanged && oldProject?.goalId) {
        // Call the updateGoalProgress function
        await goalActions.updateGoalProgress(
          dispatch, 
          oldProject.goalId, 
          calculateGoalProgress(oldProject.goalId, updatedProjects),
          { ...state, projects: updatedProjects }
        );
      }
      
      return normalizedProject;
    } catch (error) {
      console.error('Error updating project:', error);
      if (notification?.showError) {
        notification.showError('Failed to update project');
      }
      return null;
    } finally {
      // Clear operation tracking
      setTimeout(() => {
        dispatch({ type: 'REMOVE_UPDATING_PROJECT', payload: updatedProject.id });
      }, 500);
    }
  },
  
  // Delete a project
  deleteProject: async (dispatch, projectId, notification, state) => {
    try {
      console.log(`Deleting project with ID: ${projectId}`);
      
      // Simple guard against already deleted projects
      if (!Array.isArray(state.projects) || state.projects.length === 0) {
        console.warn('No projects array available');
        return false;
      }
      
      // Check if project exists in the full projects array
      const project = state.projects.find(p => p.id === projectId);
      if (!project) {
        console.warn(`Project with ID ${projectId} not found, it may have already been deleted`);
        return false;
      }
      
      const goalId = project.goalId; // Store goal ID for later progress update
      
      // Mark project as deleted in tracking sets
      dispatch({ type: 'ADD_DELETED_PROJECT_ID', payload: projectId });
      dispatch({ type: 'ADD_DELETING_PROJECT', payload: projectId });
      
      // 1. First remove from AsyncStorage to ensure persistence
      const updatedProjects = state.projects.filter(project => project.id !== projectId);
      await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
      
      // 2. Then update state (AFTER storage is updated)
      dispatch({ type: 'DELETE_PROJECT', payload: projectId });
      
      // 3. Clean up associated tasks if they exist
      if (Array.isArray(state.tasks) && state.tasks.length > 0) {
        const updatedTasks = state.tasks.filter(task => task.projectId !== projectId);
        await saveData(STORAGE_KEYS.TASKS, updatedTasks);
        // Should dispatch a task update action here
        if (state.taskDispatch) {
          state.taskDispatch({ type: 'SET_TASKS', payload: updatedTasks });
        }
      }
      
      // 4. Update project-goal link map if needed
      if (state.projectGoalLinkMap[projectId]) {
        const updatedLinkMap = { ...state.projectGoalLinkMap };
        delete updatedLinkMap[projectId];
        
        dispatch({ type: 'SET_PROJECT_GOAL_LINK_MAP', payload: updatedLinkMap });
        await saveData(STORAGE_KEYS.PROJECT_GOAL_LINK_MAP, updatedLinkMap);
      }
      
      // 5. Update goal progress if project was linked to a goal
      if (goalId) {
        setTimeout(() => {
          goalActions.updateGoalProgress(
            dispatch, 
            goalId, 
            calculateGoalProgress(goalId, updatedProjects),
            { ...state, projects: updatedProjects }
          );
        }, 100);
      }
      
      // Clear tracking state after a delay
      setTimeout(() => {
        dispatch({ type: 'REMOVE_DELETED_PROJECT_ID', payload: projectId });
        dispatch({ type: 'REMOVE_DELETING_PROJECT', payload: projectId });
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      if (notification?.showError) {
        notification.showError('Failed to delete project');
      }
      return false;
    }
  },
  
  // Update project progress without changing status
  updateProjectProgress: async (dispatch, projectId, newProgress, notification, state) => {
    try {
      console.log(`[ProjectReducer] Updating project ${projectId} status indicator to ${newProgress}`);
      
      // Find the project
      const project = state.projects.find(p => p.id === projectId);
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
      const projectTasks = Array.isArray(state.tasks) 
        ? state.tasks.filter(task => task.projectId === projectId)
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
      
      console.log(`[ProjectReducer] Task-based progress for project "${project.title}": ${taskBasedProgress}%`);
      console.log(`[ProjectReducer] Setting project status to "${newStatus}" without changing progress`);
      
      // Create updated project object - NEVER change the progress when only changing status
      const updatedProject = {
        ...project,
        status: newStatus,
        // Keep the existing progress - DO NOT change it when changing kanban position
        progress: taskBasedProgress,
        completed: newStatus === 'done',
        updatedAt: new Date().toISOString()
      };
      
      // First update the project in state and storage
      dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
      
      const updatedProjects = state.projects.map(p => 
        p.id === projectId ? updatedProject : p
      );
      
      // Update storage
      await saveData(STORAGE_KEYS.PROJECTS, updatedProjects);
      
      // Show success notification
      if (notification?.showSuccess) {
        notification.showSuccess(`Project moved to ${newStatus === 'todo' ? 'To Do' : newStatus === 'in_progress' ? 'In Progress' : 'Done'}`);
      }
      
      // Next, check if this project is linked to a goal
      if (project.goalId) {
        // Call the updateGoalProgress function
        await goalActions.updateGoalProgress(
          dispatch, 
          project.goalId, 
          calculateGoalProgress(project.goalId, updatedProjects),
          { ...state, projects: updatedProjects }
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateProjectProgress:', error);
      if (notification?.showError) {
        notification.showError('Failed to update project');
      }
      return false;
    }
  }
};

// Helper function to calculate goal progress (defined here to avoid circular dependency)
const calculateGoalProgress = (goalId, projects) => {
  if (!Array.isArray(projects)) return 0;
  
  const goalProjects = projects.filter(project => project.goalId === goalId);
  if (goalProjects.length === 0) return 0;
  
  const completedProjects = goalProjects.filter(project => 
    project.progress === 100 || project.completed || project.status === 'done'
  ).length;
  
  return Math.round((completedProjects / goalProjects.length) * 100);
};