/**
 * Production-Grade Storage Transaction Service
 * 
 * Handles atomic operations, prevents race conditions, manages AsyncStorage concurrency,
 * provides error recovery, and ensures data consistency across all storage operations.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageTransactionService {
  constructor() {
    this.operationQueue = [];
    this.isProcessing = false;
    this.retryAttempts = 3;
    this.retryDelay = 1000; // Base delay in ms
    this.maxRetryDelay = 5000; // Max delay in ms
  }

  /**
   * Enqueue a storage operation to prevent concurrent writes
   * @param {Function} operation - Async function to execute
   * @returns {Promise} - Promise that resolves when operation completes
   */
  async enqueueOperation(operation) {
    return new Promise((resolve, reject) => {
      this.operationQueue.push({
        operation,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      // Start processing if not already running
      this.processQueue();
    });
  }

  /**
   * Process the queue sequentially to prevent concurrent AsyncStorage operations
   */
  async processQueue() {
    if (this.isProcessing || this.operationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.operationQueue.length > 0) {
      const { operation, resolve, reject, timestamp } = this.operationQueue.shift();
      
      try {
        // Add operation timeout check (10 seconds)
        if (Date.now() - timestamp > 10000) {
          throw new Error('Operation timeout: queued too long');
        }

        const result = await this.executeWithRetry(operation);
        resolve(result);
      } catch (error) {
        console.error('🔴 Storage operation failed:', error);
        reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Execute operation with exponential backoff retry
   */
  async executeWithRetry(operation, attempt = 1) {
    try {
      return await operation();
    } catch (error) {
      // Check if error is retryable
      if (attempt < this.retryAttempts && this.isRetryableError(error)) {
        const delay = Math.min(
          this.retryDelay * Math.pow(2, attempt - 1),
          this.maxRetryDelay
        );
        
        console.warn(`🔄 Storage operation failed, retrying in ${delay}ms (attempt ${attempt}/${this.retryAttempts}):`, error.message);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(operation, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Check if error is worth retrying
   */
  isRetryableError(error) {
    const retryableMessages = [
      'database is locked',
      'database busy',
      'sqlite busy',
      'concurrent write',
      'file is busy',
      'resource temporarily unavailable'
    ];

    const message = error.message?.toLowerCase() || '';
    return retryableMessages.some(retryable => message.includes(retryable));
  }

  /**
   * Create a backup of current state before operation
   */
  async createBackup(keys) {
    const backup = {};
    
    for (const key of keys) {
      try {
        const data = await AsyncStorage.getItem(key);
        backup[key] = data;
      } catch (error) {
        console.warn(`🔶 Failed to backup key ${key}:`, error);
        backup[key] = null;
      }
    }
    
    return backup;
  }

  /**
   * Restore state from backup
   */
  async restoreFromBackup(backup) {
    const restoreOperations = Object.entries(backup).map(([key, data]) => {
      return data ? AsyncStorage.setItem(key, data) : AsyncStorage.removeItem(key);
    });

    await Promise.allSettled(restoreOperations);
  }

  /**
   * Validate data before storage
   */
  validateData(key, data) {
    if (typeof data !== 'string') {
      throw new Error(`Invalid data type for key ${key}: expected string`);
    }

    // Check data size (AsyncStorage has limits)
    if (data.length > 6 * 1024 * 1024) { // 6MB limit
      throw new Error(`Data too large for key ${key}: ${data.length} bytes`);
    }

    // Validate JSON if it looks like JSON
    if (data.startsWith('{') || data.startsWith('[')) {
      try {
        JSON.parse(data);
      } catch (error) {
        throw new Error(`Invalid JSON for key ${key}: ${error.message}`);
      }
    }
  }

  /**
   * Execute a transaction with atomic operations
   */
  async executeTransaction(transaction) {
    const { operations, rollbackKeys } = transaction;
    
    // Create backup before starting
    const backup = rollbackKeys ? await this.createBackup(rollbackKeys) : null;
    
    const completedOperations = [];
    
    try {
      // Execute all operations
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        
        await this.enqueueOperation(async () => {
          // Validate data before write
          if (operation.type === 'write') {
            this.validateData(operation.key, operation.data);
          }
          
          switch (operation.type) {
            case 'write':
              await AsyncStorage.setItem(operation.key, operation.data);
              break;
            case 'remove':
              await AsyncStorage.removeItem(operation.key);
              break;
            case 'multiSet':
              await AsyncStorage.multiSet(operation.keyValuePairs);
              break;
            case 'multiRemove':
              await AsyncStorage.multiRemove(operation.keys);
              break;
            default:
              throw new Error(`Unknown operation type: ${operation.type}`);
          }
        });
        
        completedOperations.push(operation);
      }

      return { success: true, completedOperations: completedOperations.length };
      
    } catch (error) {
      console.error('🔴 Transaction failed, attempting rollback:', error);
      
      // Attempt to rollback if backup exists
      if (backup) {
        try {
          await this.restoreFromBackup(backup);
          console.log('✅ Successfully rolled back transaction');
        } catch (rollbackError) {
          console.error('🔴 CRITICAL: Rollback failed:', rollbackError);
          throw new Error(`Transaction failed and rollback failed: ${error.message}. Rollback error: ${rollbackError.message}`);
        }
      }
      
      throw new Error(`Transaction failed: ${error.message}. Completed ${completedOperations.length}/${operations.length} operations.`);
    }
  }

  /**
   * Batch write multiple keys atomically
   */
  async batchWrite(keyValueMap, rollbackKeys = null) {
    const operations = Object.entries(keyValueMap).map(([key, value]) => ({
      type: 'write',
      key,
      data: typeof value === 'string' ? value : JSON.stringify(value)
    }));

    return this.executeTransaction({
      operations,
      rollbackKeys: rollbackKeys || Object.keys(keyValueMap)
    });
  }

  /**
   * Batch remove multiple keys atomically
   */
  async batchRemove(keys) {
    const operations = keys.map(key => ({
      type: 'remove',
      key
    }));

    return this.executeTransaction({
      operations,
      rollbackKeys: keys
    });
  }

  /**
   * Clear the operation queue (use carefully)
   */
  clearQueue() {
    console.warn('🔶 Storage queue cleared - pending operations will be rejected');
    
    // Reject all pending operations
    while (this.operationQueue.length > 0) {
      const { reject } = this.operationQueue.shift();
      reject(new Error('Operation cancelled: queue cleared'));
    }
  }

  /**
   * Get queue status for debugging
   */
  getQueueStatus() {
    return {
      queueLength: this.operationQueue.length,
      isProcessing: this.isProcessing,
      oldestOperation: this.operationQueue[0]?.timestamp,
      queueAge: this.operationQueue[0] ? Date.now() - this.operationQueue[0].timestamp : 0
    };
  }
}

// Singleton instance
const storageTransactionService = new StorageTransactionService();

export default storageTransactionService;

// Export specific methods for common use cases
export const {
  enqueueOperation,
  executeTransaction,
  batchWrite,
  batchRemove,
  createBackup,
  restoreFromBackup,
  getQueueStatus,
  clearQueue
} = storageTransactionService;