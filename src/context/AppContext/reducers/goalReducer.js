// src/context/AppContext/reducers/goalReducer.js
// Extracted goal reducer logic from AppContext.js

import { STORAGE_KEYS } from '../constants';
import { saveData } from '../utils/storageUtils';
import { normalizeDomain } from '../../../utils/domainUtils';
import { calculateGoalProgress } from '../utils/progressUtils';

// Initial state for goals
export const initialGoalState = {
  goals: [],
  mainGoals: [], // Alias for backward compatibility
  deletingGoals: new Set(),
};

// Goal reducer
export const goalReducer = (state, action) => {
  switch (action.type) {
    case 'SET_GOALS':
      return {
        ...state,
        goals: action.payload,
        mainGoals: action.payload, // Maintain the alias
      };
      
    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, action.payload],
        mainGoals: [...state.goals, action.payload], // Maintain the alias
      };
      
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(goal => 
          goal.id === action.payload.id ? action.payload : goal
        ),
        mainGoals: state.goals.map(goal => 
          goal.id === action.payload.id ? action.payload : goal
        ), // Maintain the alias
      };
      
    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(goal => goal.id !== action.payload),
        mainGoals: state.goals.filter(goal => goal.id !== action.payload), // Maintain the alias
      };
      
    case 'SET_DELETING_GOALS':
      return {
        ...state,
        deletingGoals: action.payload,
      };
      
    case 'ADD_DELETING_GOAL':
      const newDeletingGoals = new Set(state.deletingGoals);
      newDeletingGoals.add(action.payload);
      return {
        ...state,
        deletingGoals: newDeletingGoals,
      };
      
    case 'REMOVE_DELETING_GOAL':
      const updatedDeletingGoals = new Set(state.deletingGoals);
      updatedDeletingGoals.delete(action.payload);
      return {
        ...state,
        deletingGoals: updatedDeletingGoals,
      };
      
    default:
      return state;
  }
};

// Goal actions
export const goalActions = {
  // Add a goal
  addGoal: async (dispatch, newGoal, notification) => {
    try {
      // Apply domain normalization
      const normalizedGoal = normalizeDomain(newGoal);
      
      // Update the goals state
      dispatch({ type: 'ADD_GOAL', payload: normalizedGoal });
      
      // Save to AsyncStorage (get updated goals from state after dispatch)
      await saveData(STORAGE_KEYS.GOALS, [...(await getGoals()), normalizedGoal]);
      
      return normalizedGoal;
    } catch (error) {
      console.error('Error adding goal:', error);
      if (notification?.showError) {
        notification.showError('Failed to add goal');
      }
      throw error;
    }
  },
  
  // Update a goal
  updateGoal: async (dispatch, updatedGoal, notification, state) => {
    try {
      // Check if goal exists
      const goalExists = state.goals.some(goal => goal.id === updatedGoal.id);
      if (!goalExists) {
        console.warn(`Goal with ID ${updatedGoal.id} not found, cannot update`);
        if (notification?.showError) {
          notification.showError('Goal not found');
        }
        return null;
      }
      
      // Apply domain normalization
      const normalizedGoal = normalizeDomain(updatedGoal);
      
      // Recalculate progress from projects
      if (state.projects) {
        const calculatedProgress = calculateGoalProgress(normalizedGoal.id, state.projects);
        normalizedGoal.progress = calculatedProgress;
      }
      
      // Update the goals state
      dispatch({ type: 'UPDATE_GOAL', payload: normalizedGoal });
      
      // Save to AsyncStorage
      const updatedGoals = state.goals.map(goal => 
        goal.id === normalizedGoal.id ? normalizedGoal : goal
      );
      await saveData(STORAGE_KEYS.GOALS, updatedGoals);
      
      return normalizedGoal;
    } catch (error) {
      console.error('Error updating goal:', error);
      if (notification?.showError) {
        notification.showError('Failed to update goal');
      }
      throw error;
    }
  },
  
  // Delete a goal
  deleteGoal: async (dispatch, goalId, notification, state) => {
    try {
      // Check if already in progress
      if (state.deletingGoals.has(goalId)) {
        console.log(`Goal ${goalId} is already being deleted, ignoring duplicate request`);
        return false;
      }
      
      // Mark as in progress
      dispatch({ type: 'ADD_DELETING_GOAL', payload: goalId });
      
      // Check if goal exists
      const goalExists = state.goals.some(goal => goal.id === goalId);
      if (!goalExists) {
        console.warn(`Goal with ID ${goalId} not found, it may have already been deleted`);
        return false;
      }
      
      // Get the goal for logging
      const goalToDelete = state.goals.find(goal => goal.id === goalId);
      const goalTitle = goalToDelete?.title || 'Unknown goal';
      
      console.log(`Deleting goal: "${goalTitle}" (ID: ${goalId})`);
      
      // Delete the goal
      dispatch({ type: 'DELETE_GOAL', payload: goalId });
      
      // Save updated goals to AsyncStorage
      const updatedGoals = state.goals.filter(goal => goal.id !== goalId);
      await saveData(STORAGE_KEYS.GOALS, updatedGoals);
      
      if (notification?.showSuccess) {
        notification.showSuccess('Goal deleted successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      if (notification?.showError) {
        notification.showError('Failed to delete goal');
      }
      return false;
    } finally {
      // Clear operation tracking after a delay
      setTimeout(() => {
        dispatch({ type: 'REMOVE_DELETING_GOAL', payload: goalId });
      }, 1000);
    }
  },
  
  // Update goal progress
  updateGoalProgress: async (dispatch, goalId, progress, state) => {
    try {
      const goal = state.goals.find(g => g.id === goalId);
      if (!goal) return false;
      
      const updatedGoal = {
        ...goal,
        progress,
        updatedAt: new Date().toISOString()
      };
      
      // Update the goals state
      dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
      
      // Save to AsyncStorage
      const updatedGoals = state.goals.map(g => 
        g.id === goalId ? updatedGoal : g
      );
      await saveData(STORAGE_KEYS.GOALS, updatedGoals);
      
      return true;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return false;
    }
  }
};

// Helper function to get current goals from state
const getGoals = async () => {
  try {
    const goalsJson = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
    return goalsJson ? JSON.parse(goalsJson) : [];
  } catch (error) {
    console.error('Error getting goals:', error);
    return [];
  }
};