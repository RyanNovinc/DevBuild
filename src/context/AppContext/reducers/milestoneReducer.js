// src/context/AppContext/reducers/milestoneReducer.js
// Extracted milestone reducer logic from AppContext.js

import { STORAGE_KEYS } from '../constants';
import { saveData } from '../utils/storageUtils';
import { normalizeDomain } from '../../../utils/domainUtils';
import { calculateMilestoneProgress } from '../utils/progressUtils';
import { goalActions } from './goalReducer';

// Initial state for milestones
export const initialMilestoneState = {
  milestones: [],
  deletedMilestoneIds: new Set(),
  updatingMilestones: new Set(),
  deletingMilestones: new Set(),
  milestoneGoalLinkMap: {},
};

// Milestone reducer
export const milestoneReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MILESTONES':
      return {
        ...state,
        milestones: action.payload,
      };
      
    case 'ADD_MILESTONE':
      return {
        ...state,
        milestones: [...state.milestones, action.payload],
      };
      
    case 'UPDATE_MILESTONE':
      return {
        ...state,
        milestones: state.milestones.map(milestone => 
          milestone.id === action.payload.id ? action.payload : milestone
        ),
      };
      
    case 'DELETE_MILESTONE':
      return {
        ...state,
        milestones: state.milestones.filter(milestone => milestone.id !== action.payload),
      };
      
    case 'SET_MILESTONE_GOAL_LINK_MAP':
      return {
        ...state,
        milestoneGoalLinkMap: action.payload,
      };
      
    case 'ADD_DELETED_MILESTONE_ID':
      const newDeletedIds = new Set(state.deletedMilestoneIds);
      newDeletedIds.add(action.payload);
      return {
        ...state,
        deletedMilestoneIds: newDeletedIds,
      };
      
    case 'REMOVE_DELETED_MILESTONE_ID':
      const updatedDeletedIds = new Set(state.deletedMilestoneIds);
      updatedDeletedIds.delete(action.payload);
      return {
        ...state,
        deletedMilestoneIds: updatedDeletedIds,
      };
      
    case 'ADD_UPDATING_MILESTONE':
      const newUpdatingMilestones = new Set(state.updatingMilestones);
      newUpdatingMilestones.add(action.payload);
      return {
        ...state,
        updatingMilestones: newUpdatingMilestones,
      };
      
    case 'REMOVE_UPDATING_MILESTONE':
      const updatedUpdatingMilestones = new Set(state.updatingMilestones);
      updatedUpdatingMilestones.delete(action.payload);
      return {
        ...state,
        updatingMilestones: updatedUpdatingMilestones,
      };
      
    case 'ADD_DELETING_MILESTONE':
      const newDeletingMilestones = new Set(state.deletingMilestones);
      newDeletingMilestones.add(action.payload);
      return {
        ...state,
        deletingMilestones: newDeletingMilestones,
      };
      
    case 'REMOVE_DELETING_MILESTONE':
      const updatedDeletingMilestones = new Set(state.deletingMilestones);
      updatedDeletingMilestones.delete(action.payload);
      return {
        ...state,
        deletingMilestones: updatedDeletingMilestones,
      };
      
    default:
      return state;
  }
};

// Milestone actions
export const milestoneActions = {
  // Add a milestone
  addMilestone: async (dispatch, newMilestone, notification, state) => {
    try {
      // First verify goal relationship if goalId is provided
      if (newMilestone.goalId) {
        const goalExists = state.goals.some(goal => goal.id === newMilestone.goalId);
        
        if (!goalExists) {
          console.warn(`Milestone references nonexistent goal ID: ${newMilestone.goalId}`);
          
          // Try to find by goalTitle
          if (newMilestone.goalTitle) {
            const matchingGoal = state.goals.find(goal => 
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
              // No matching goal found, remove goal association
              console.warn(`No goal found matching title "${newMilestone.goalTitle}" - creating milestone without goal link`);
              delete newMilestone.goalId;
              delete newMilestone.goalTitle;
            }
          } else {
            // No goalTitle to match with, remove the invalid goalId
            delete newMilestone.goalId;
          }
        } else {
          // Goal exists, ensure we have the correct title and inherit domain/color
          const linkedGoal = state.goals.find(goal => goal.id === newMilestone.goalId);
          newMilestone.goalTitle = linkedGoal.title;
          
          // Inherit domain and color if not already set
          if (!newMilestone.domain && linkedGoal.domain) {
            newMilestone.domain = linkedGoal.domain;
          }
          if (!newMilestone.color && linkedGoal.color) {
            newMilestone.color = linkedGoal.color;
          }
        }
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
      
      // Now apply domain normalization
      const normalizedMilestone = normalizeDomain(newMilestone);
      
      // Update the milestones state
      dispatch({ type: 'ADD_MILESTONE', payload: normalizedMilestone });
      
      // Save to AsyncStorage
      const updatedMilestones = [...state.milestones, normalizedMilestone];
      await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
      
      // Also update the milestone-goal link map
      if (normalizedMilestone.goalId) {
        const updatedLinkMap = {
          ...state.milestoneGoalLinkMap,
          [normalizedMilestone.id]: normalizedMilestone.goalId
        };
        dispatch({ type: 'SET_MILESTONE_GOAL_LINK_MAP', payload: updatedLinkMap });
        
        // Save link map to AsyncStorage
        await saveData(STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, updatedLinkMap);
        
        // Update goal progress
        if (state.goals && state.goals.length > 0) {
          // Call the updateGoalProgress function
          await goalActions.updateGoalProgress(
            dispatch, 
            normalizedMilestone.goalId, 
            calculateGoalProgress(normalizedMilestone.goalId, updatedMilestones),
            { ...state, milestones: updatedMilestones }
          );
        }
      }
      
      return normalizedMilestone;
    } catch (error) {
      console.error('Error adding milestone:', error);
      if (notification?.showError) {
        notification.showError('Failed to add milestone');
      }
      throw error;
    }
  },
  
  // Update a milestone
  updateMilestone: async (dispatch, updatedMilestone, notification, state) => {
    try {
      // Check if in progress
      if (state.updatingMilestones.has(updatedMilestone.id)) {
        console.log(`Milestone ${updatedMilestone.id} is already being updated, ignoring duplicate request`);
        return null;
      }
      
      // Mark as in progress
      dispatch({ type: 'ADD_UPDATING_MILESTONE', payload: updatedMilestone.id });
      
      // Check if milestone exists
      const milestoneExists = state.milestones.some(p => p.id === updatedMilestone.id);
      if (!milestoneExists) {
        console.warn(`Milestone with ID ${updatedMilestone.id} not found, unable to update`);
        if (notification?.showError) {
          notification.showError('Milestone not found');
        }
        return null;
      }
      
      // Apply domain normalization
      const normalizedMilestone = normalizeDomain(updatedMilestone);
      
      // Get original milestone
      const originalMilestone = state.milestones.find(p => p.id === normalizedMilestone.id);
      
      // Recalculate progress from tasks if flag is set
      if (normalizedMilestone.recalculateProgress && state.tasks) {
        const calculatedProgress = calculateMilestoneProgress(normalizedMilestone.id, state.tasks, state.milestones);
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
      if (normalizedMilestone.goalId && !state.goals.some(goal => goal.id === normalizedMilestone.goalId)) {
        console.warn(`Milestone references nonexistent goal ID: ${normalizedMilestone.goalId}`);
        // Make this milestone independent if goal doesn't exist
        normalizedMilestone.goalId = null;
        normalizedMilestone.goalTitle = null;
      } else if (normalizedMilestone.goalId) {
        // Update goal title to match goal
        const goal = state.goals.find(g => g.id === normalizedMilestone.goalId);
        if (goal) {
          normalizedMilestone.goalTitle = goal.title;
        }
      }
      
      // Get the old milestone to check if goalId changed
      const oldMilestone = state.milestones.find(p => p.id === normalizedMilestone.id);
      const goalIdChanged = oldMilestone && oldMilestone.goalId !== normalizedMilestone.goalId;
      
      // Update the milestones state
      dispatch({ type: 'UPDATE_MILESTONE', payload: normalizedMilestone });
      
      // Save to AsyncStorage
      const updatedMilestones = state.milestones.map(milestone => 
        milestone.id === normalizedMilestone.id ? normalizedMilestone : milestone
      );
      await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
      
      // Update the milestone-goal link map if goalId changed
      if (normalizedMilestone.goalId) {
        const updatedLinkMap = {
          ...state.milestoneGoalLinkMap,
          [normalizedMilestone.id]: normalizedMilestone.goalId
        };
        dispatch({ type: 'SET_MILESTONE_GOAL_LINK_MAP', payload: updatedLinkMap });
        
        // Save link map to AsyncStorage
        await saveData(STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, updatedLinkMap);
      } else if (state.milestoneGoalLinkMap[normalizedMilestone.id]) {
        // Remove from map if goalId is gone
        const updatedLinkMap = { ...state.milestoneGoalLinkMap };
        delete updatedLinkMap[normalizedMilestone.id];
        dispatch({ type: 'SET_MILESTONE_GOAL_LINK_MAP', payload: updatedLinkMap });
        
        // Save link map to AsyncStorage
        await saveData(STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, updatedLinkMap);
      }
      
      // Update goal progress if goal is linked or if goal changed
      if (normalizedMilestone.goalId) {
        // Call the updateGoalProgress function
        await goalActions.updateGoalProgress(
          dispatch, 
          normalizedMilestone.goalId, 
          calculateGoalProgress(normalizedMilestone.goalId, updatedMilestones),
          { ...state, milestones: updatedMilestones }
        );
      }
      
      // If goal changed, also update the old goal's progress
      if (goalIdChanged && oldMilestone?.goalId) {
        // Call the updateGoalProgress function
        await goalActions.updateGoalProgress(
          dispatch, 
          oldMilestone.goalId, 
          calculateGoalProgress(oldMilestone.goalId, updatedMilestones),
          { ...state, milestones: updatedMilestones }
        );
      }
      
      return normalizedMilestone;
    } catch (error) {
      console.error('Error updating milestone:', error);
      if (notification?.showError) {
        notification.showError('Failed to update milestone');
      }
      return null;
    } finally {
      // Clear operation tracking
      setTimeout(() => {
        dispatch({ type: 'REMOVE_UPDATING_MILESTONE', payload: updatedMilestone.id });
      }, 500);
    }
  },
  
  // Delete a milestone
  deleteMilestone: async (dispatch, milestoneId, notification, state) => {
    try {
      console.log(`Deleting milestone with ID: ${milestoneId}`);
      
      // Simple guard against already deleted milestones
      if (!Array.isArray(state.milestones) || state.milestones.length === 0) {
        console.warn('No milestones array available');
        return false;
      }
      
      // Check if milestone exists in the full milestones array
      const milestone = state.milestones.find(p => p.id === milestoneId);
      if (!milestone) {
        console.warn(`Milestone with ID ${milestoneId} not found, it may have already been deleted`);
        return false;
      }
      
      const goalId = milestone.goalId; // Store goal ID for later progress update
      
      // Mark milestone as deleted in tracking sets
      dispatch({ type: 'ADD_DELETED_MILESTONE_ID', payload: milestoneId });
      dispatch({ type: 'ADD_DELETING_MILESTONE', payload: milestoneId });
      
      // 1. First remove from AsyncStorage to ensure persistence
      const updatedMilestones = state.milestones.filter(milestone => milestone.id !== milestoneId);
      await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
      
      // 2. Then update state (AFTER storage is updated)
      dispatch({ type: 'DELETE_MILESTONE', payload: milestoneId });
      
      // 3. Clean up associated tasks if they exist
      if (Array.isArray(state.tasks) && state.tasks.length > 0) {
        const updatedTasks = state.tasks.filter(task => task.milestoneId !== milestoneId);
        await saveData(STORAGE_KEYS.TASKS, updatedTasks);
        // Should dispatch a task update action here
        if (state.taskDispatch) {
          state.taskDispatch({ type: 'SET_TASKS', payload: updatedTasks });
        }
      }
      
      // 4. Update milestone-goal link map if needed
      if (state.milestoneGoalLinkMap[milestoneId]) {
        const updatedLinkMap = { ...state.milestoneGoalLinkMap };
        delete updatedLinkMap[milestoneId];
        
        dispatch({ type: 'SET_MILESTONE_GOAL_LINK_MAP', payload: updatedLinkMap });
        await saveData(STORAGE_KEYS.MILESTONE_GOAL_LINK_MAP, updatedLinkMap);
      }
      
      // 5. Update goal progress if milestone was linked to a goal
      if (goalId) {
        setTimeout(() => {
          goalActions.updateGoalProgress(
            dispatch, 
            goalId, 
            calculateGoalProgress(goalId, updatedMilestones),
            { ...state, milestones: updatedMilestones }
          );
        }, 100);
      }
      
      // Clear tracking state after a delay
      setTimeout(() => {
        dispatch({ type: 'REMOVE_DELETED_MILESTONE_ID', payload: milestoneId });
        dispatch({ type: 'REMOVE_DELETING_MILESTONE', payload: milestoneId });
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error deleting milestone:', error);
      if (notification?.showError) {
        notification.showError('Failed to delete milestone');
      }
      return false;
    }
  },
  
  // Update milestone progress without changing status
  updateMilestoneProgress: async (dispatch, milestoneId, newProgress, notification, state) => {
    try {
      console.log(`[MilestoneReducer] Updating milestone ${milestoneId} status indicator to ${newProgress}`);
      
      // Find the milestone
      const milestone = state.milestones.find(p => p.id === milestoneId);
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
      const milestoneTasks = Array.isArray(state.tasks) 
        ? state.tasks.filter(task => task.milestoneId === milestoneId)
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
      
      console.log(`[MilestoneReducer] Task-based progress for milestone "${milestone.title}": ${taskBasedProgress}%`);
      console.log(`[MilestoneReducer] Setting milestone status to "${newStatus}" without changing progress`);
      
      // Create updated milestone object - NEVER change the progress when only changing status
      const updatedMilestone = {
        ...milestone,
        status: newStatus,
        // Keep the existing progress - DO NOT change it when changing kanban position
        progress: taskBasedProgress,
        completed: newStatus === 'done',
        updatedAt: new Date().toISOString()
      };
      
      // First update the milestone in state and storage
      dispatch({ type: 'UPDATE_MILESTONE', payload: updatedMilestone });
      
      const updatedMilestones = state.milestones.map(p => 
        p.id === milestoneId ? updatedMilestone : p
      );
      
      // Update storage
      await saveData(STORAGE_KEYS.MILESTONES, updatedMilestones);
      
      // Show success notification
      if (notification?.showSuccess) {
        notification.showSuccess(`Milestone moved to ${newStatus === 'todo' ? 'To Do' : newStatus === 'in_progress' ? 'In Progress' : 'Done'}`);
      }
      
      // Next, check if this milestone is linked to a goal
      if (milestone.goalId) {
        // Call the updateGoalProgress function
        await goalActions.updateGoalProgress(
          dispatch, 
          milestone.goalId, 
          calculateGoalProgress(milestone.goalId, updatedMilestones),
          { ...state, milestones: updatedMilestones }
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateMilestoneProgress:', error);
      if (notification?.showError) {
        notification.showError('Failed to update milestone');
      }
      return false;
    }
  }
};

// Helper function to calculate goal progress (defined here to avoid circular dependency)
const calculateGoalProgress = (goalId, milestones) => {
  if (!Array.isArray(milestones)) return 0;
  
  const goalMilestones = milestones.filter(milestone => milestone.goalId === goalId);
  if (goalMilestones.length === 0) return 0;
  
  const completedMilestones = goalMilestones.filter(milestone => 
    milestone.progress === 100 || milestone.completed || milestone.status === 'done'
  ).length;
  
  return Math.round((completedMilestones / goalMilestones.length) * 100);
};