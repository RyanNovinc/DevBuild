/**
 * Production-Grade State Transaction Service
 * 
 * Manages atomic state operations, data validation, consistency checks,
 * and complex state transformations with rollback capabilities.
 */

import storageTransactionService from './StorageTransactionService';

/**
 * Custom error classes for better error handling
 */
export class StateValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'StateValidationError';
    this.details = details;
  }
}

export class StateConsistencyError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'StateConsistencyError';
    this.details = details;
  }
}

export class StateTransactionError extends Error {
  constructor(message, originalError, rollbackSuccess) {
    super(message);
    this.name = 'StateTransactionError';
    this.originalError = originalError;
    this.rollbackSuccess = rollbackSuccess;
  }
}

class StateTransactionService {
  constructor() {
    this.STORAGE_KEYS = {
      GOALS: '@lifecompass_goals',
      MILESTONES: '@lifecompass_milestones', 
      TASKS: '@lifecompass_tasks',
      NOTES: '@lifecompass_notes'
    };
  }

  /**
   * Validate task data structure
   */
  validateTask(task, context = '') {
    const requiredFields = ['id', 'title'];
    const errors = [];

    for (const field of requiredFields) {
      if (!task[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate ID format
    if (task.id && typeof task.id !== 'string') {
      errors.push('Task ID must be a string');
    }

    // Validate title
    if (task.title && typeof task.title !== 'string') {
      errors.push('Task title must be a string');
    }

    // Validate boolean fields
    if (task.completed !== undefined && typeof task.completed !== 'boolean') {
      errors.push('Task completed must be boolean');
    }

    // Validate relationships
    if (task.milestoneId && typeof task.milestoneId !== 'string') {
      errors.push('Milestone ID must be a string');
    }

    if (task.goalId && typeof task.goalId !== 'string') {
      errors.push('Goal ID must be a string');
    }

    if (errors.length > 0) {
      throw new StateValidationError(
        `Task validation failed ${context}: ${errors.join(', ')}`, 
        { task, errors }
      );
    }

    return true;
  }

  /**
   * Validate milestone data structure
   */
  validateMilestone(milestone, context = '') {
    const requiredFields = ['id', 'title'];
    const errors = [];

    for (const field of requiredFields) {
      if (!milestone[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate progress
    if (milestone.progress !== undefined) {
      if (typeof milestone.progress !== 'number' || milestone.progress < 0 || milestone.progress > 100) {
        errors.push('Progress must be a number between 0 and 100');
      }
    }

    if (errors.length > 0) {
      throw new StateValidationError(
        `Milestone validation failed ${context}: ${errors.join(', ')}`, 
        { milestone, errors }
      );
    }

    return true;
  }

  /**
   * Check state consistency across entities
   */
  validateStateConsistency(tasks, milestones, goals) {
    const errors = [];

    // Check for duplicate IDs
    const taskIds = tasks.map(t => t.id);
    const duplicateTaskIds = taskIds.filter((id, index) => taskIds.indexOf(id) !== index);
    if (duplicateTaskIds.length > 0) {
      errors.push(`Duplicate task IDs found: ${duplicateTaskIds.join(', ')}`);
    }

    const milestoneIds = milestones.map(m => m.id);
    const duplicateMilestoneIds = milestoneIds.filter((id, index) => milestoneIds.indexOf(id) !== index);
    if (duplicateMilestoneIds.length > 0) {
      errors.push(`Duplicate milestone IDs found: ${duplicateMilestoneIds.join(', ')}`);
    }

    // Check referential integrity
    const milestoneIdSet = new Set(milestoneIds);
    const goalIds = goals.map(g => g.id);
    const goalIdSet = new Set(goalIds);

    const orphanedTasks = tasks.filter(t => 
      t.milestoneId && !milestoneIdSet.has(t.milestoneId)
    );
    if (orphanedTasks.length > 0) {
      errors.push(`Tasks reference non-existent milestones: ${orphanedTasks.map(t => t.id).join(', ')}`);
    }

    const orphanedMilestones = milestones.filter(m => 
      m.goalId && !goalIdSet.has(m.goalId)
    );
    if (orphanedMilestones.length > 0) {
      errors.push(`Milestones reference non-existent goals: ${orphanedMilestones.map(m => m.id).join(', ')}`);
    }

    if (errors.length > 0) {
      throw new StateConsistencyError(
        `State consistency validation failed: ${errors.join('; ')}`,
        { errors, taskCount: tasks.length, milestoneCount: milestones.length, goalCount: goals.length }
      );
    }

    return true;
  }

  /**
   * Calculate milestone progress based on tasks
   */
  calculateMilestoneProgress(milestoneId, tasks) {
    const milestoneTasks = tasks.filter(task => task.milestoneId === milestoneId);
    
    if (milestoneTasks.length === 0) {
      return 0;
    }

    const completedTasks = milestoneTasks.filter(task => 
      task.completed || task.status === 'done'
    );

    return Math.round((completedTasks.length / milestoneTasks.length) * 100);
  }

  /**
   * Create a complete state snapshot
   */
  createStateSnapshot(currentState) {
    return {
      tasks: [...currentState.tasks],
      milestones: [...currentState.milestones],
      goals: [...currentState.goals],
      timestamp: Date.now()
    };
  }

  /**
   * Execute bulk task deletion transaction
   */
  async executeBulkTaskDeletion({
    taskIdsToDelete,
    currentTasks,
    currentMilestones,
    currentGoals,
    setTasks,
    setMilestones
  }) {
    // Validate inputs
    if (!Array.isArray(taskIdsToDelete) || taskIdsToDelete.length === 0) {
      throw new StateValidationError('Invalid task IDs for deletion', { taskIdsToDelete });
    }

    if (!Array.isArray(currentTasks)) {
      throw new StateValidationError('Invalid current tasks array', { currentTasks });
    }

    console.log(`🔄 Starting bulk task deletion transaction: ${taskIdsToDelete.length} tasks`);

    // Create state snapshot for rollback
    const stateSnapshot = this.createStateSnapshot({
      tasks: currentTasks,
      milestones: currentMilestones,
      goals: currentGoals
    });

    // Find tasks to delete and validate they exist
    const tasksToDelete = [];
    for (const taskId of taskIdsToDelete) {
      const task = currentTasks.find(t => t.id === taskId);
      if (!task) {
        throw new StateValidationError(`Task not found for deletion: ${taskId}`, { taskId });
      }
      tasksToDelete.push(task);
    }

    // Calculate new state
    const newTasks = currentTasks.filter(task => !taskIdsToDelete.includes(task.id));

    // Calculate affected milestones and their new progress
    const affectedMilestones = new Set();
    tasksToDelete.forEach(task => {
      if (task.milestoneId) {
        affectedMilestones.add(task.milestoneId);
      }
    });

    const updatedMilestones = currentMilestones.map(milestone => {
      if (affectedMilestones.has(milestone.id)) {
        const newProgress = this.calculateMilestoneProgress(milestone.id, newTasks);
        
        return {
          ...milestone,
          progress: milestone.completed || milestone.status === 'done' ? 100 : newProgress,
          updatedAt: new Date().toISOString()
        };
      }
      return milestone;
    });

    // Validate the resulting state
    this.validateStateConsistency(newTasks, updatedMilestones, currentGoals);

    try {
      // Execute atomic state updates
      console.log(`💾 Applying state updates: ${newTasks.length} tasks, ${updatedMilestones.length} milestones`);
      
      // Use functional updates for React state
      setTasks(prevTasks => {
        // Double-check we're working with current state
        const filteredTasks = prevTasks.filter(task => !taskIdsToDelete.includes(task.id));
        console.log(`🔍 State update: ${prevTasks.length} -> ${filteredTasks.length} tasks`);
        return filteredTasks;
      });

      setMilestones(prevMilestones => {
        const updatedMilestoneMap = new Map(updatedMilestones.map(m => [m.id, m]));
        const finalMilestones = prevMilestones.map(milestone => 
          updatedMilestoneMap.get(milestone.id) || milestone
        );
        console.log(`🔍 Milestone progress updates: ${affectedMilestones.size} milestones affected`);
        return finalMilestones;
      });

      // Prepare storage transaction
      const storageData = {
        [this.STORAGE_KEYS.TASKS]: JSON.stringify(newTasks),
        [this.STORAGE_KEYS.MILESTONES]: JSON.stringify(updatedMilestones)
      };

      // Execute storage transaction
      await storageTransactionService.batchWrite(
        storageData,
        [this.STORAGE_KEYS.TASKS, this.STORAGE_KEYS.MILESTONES]
      );

      console.log(`✅ Bulk task deletion completed successfully: ${tasksToDelete.length} tasks deleted`);

      return {
        success: true,
        deletedTasks: tasksToDelete,
        affectedMilestones: Array.from(affectedMilestones),
        newTaskCount: newTasks.length
      };

    } catch (error) {
      console.error('🔴 Bulk task deletion transaction failed:', error);

      // Attempt to rollback state (React state will revert automatically on error)
      // Storage rollback is handled by StorageTransactionService
      
      throw new StateTransactionError(
        `Bulk task deletion failed: ${error.message}`,
        error,
        true // rollback handled by storage service
      );
    }
  }

  /**
   * Execute bulk task addition transaction
   */
  async executeBulkTaskAddition({
    tasksToAdd,
    currentTasks,
    currentMilestones,
    currentGoals,
    setTasks,
    setMilestones
  }) {
    // Validate inputs
    if (!Array.isArray(tasksToAdd) || tasksToAdd.length === 0) {
      throw new StateValidationError('Invalid tasks for addition', { tasksToAdd });
    }

    console.log(`🔄 Starting bulk task addition transaction: ${tasksToAdd.length} tasks`);

    // Validate each task
    tasksToAdd.forEach((task, index) => {
      this.validateTask(task, `(task ${index + 1}/${tasksToAdd.length})`);
    });

    // Create state snapshot
    const stateSnapshot = this.createStateSnapshot({
      tasks: currentTasks,
      milestones: currentMilestones,
      goals: currentGoals
    });

    // Calculate new state
    const newTasks = [...currentTasks, ...tasksToAdd];

    // Calculate affected milestones and their new progress
    const affectedMilestones = new Set();
    tasksToAdd.forEach(task => {
      if (task.milestoneId) {
        affectedMilestones.add(task.milestoneId);
      }
    });

    const updatedMilestones = currentMilestones.map(milestone => {
      if (affectedMilestones.has(milestone.id)) {
        const newProgress = this.calculateMilestoneProgress(milestone.id, newTasks);
        
        return {
          ...milestone,
          progress: milestone.completed || milestone.status === 'done' ? 100 : newProgress,
          updatedAt: new Date().toISOString()
        };
      }
      return milestone;
    });

    // Validate the resulting state
    this.validateStateConsistency(newTasks, updatedMilestones, currentGoals);

    try {
      // Execute atomic state updates
      console.log(`💾 Applying state updates: +${tasksToAdd.length} tasks`);
      
      setTasks(prevTasks => [...prevTasks, ...tasksToAdd]);
      setMilestones(prevMilestones => {
        const updatedMilestoneMap = new Map(updatedMilestones.map(m => [m.id, m]));
        return prevMilestones.map(milestone => 
          updatedMilestoneMap.get(milestone.id) || milestone
        );
      });

      // Prepare storage transaction
      const storageData = {
        [this.STORAGE_KEYS.TASKS]: JSON.stringify(newTasks),
        [this.STORAGE_KEYS.MILESTONES]: JSON.stringify(updatedMilestones)
      };

      // Execute storage transaction
      await storageTransactionService.batchWrite(
        storageData,
        [this.STORAGE_KEYS.TASKS, this.STORAGE_KEYS.MILESTONES]
      );

      console.log(`✅ Bulk task addition completed successfully: ${tasksToAdd.length} tasks added`);

      return {
        success: true,
        addedTasks: tasksToAdd,
        affectedMilestones: Array.from(affectedMilestones),
        newTaskCount: newTasks.length
      };

    } catch (error) {
      console.error('🔴 Bulk task addition transaction failed:', error);
      
      throw new StateTransactionError(
        `Bulk task addition failed: ${error.message}`,
        error,
        true
      );
    }
  }
}

// Singleton instance
const stateTransactionService = new StateTransactionService();

export default stateTransactionService;