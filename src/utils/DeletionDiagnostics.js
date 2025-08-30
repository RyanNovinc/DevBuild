// src/utils/DeletionDiagnostics.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Diagnostic utility to help verify data deletion is working properly
 * Use this in development to check for data inconsistencies
 */
export const DeletionDiagnostics = {
  
  /**
   * Check storage vs state consistency
   */
  async checkStorageConsistency() {
    try {
      const diagnostics = {
        timestamp: new Date().toISOString(),
        storage: {},
        issues: []
      };
      
      // Check main data stores
      const dataKeys = ['goals', 'milestones', 'tasks', 'todos', 'tomorrowTodos', 'laterTodos', 'notes', 'timeBlocks'];
      
      for (const key of dataKeys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            diagnostics.storage[key] = Array.isArray(parsed) ? parsed.length : 'Invalid data';
          } catch (parseError) {
            diagnostics.storage[key] = 'Parse error';
            diagnostics.issues.push(`${key}: Failed to parse JSON`);
          }
        } else {
          diagnostics.storage[key] = 0;
        }
      }
      
      // Check for backup accumulation
      const allKeys = await AsyncStorage.getAllKeys();
      const backupKeys = allKeys.filter(key => key.startsWith('backup_startup_'));
      diagnostics.backupFiles = backupKeys.length;
      
      if (backupKeys.length > 5) {
        diagnostics.issues.push(`Too many backup files: ${backupKeys.length} (should be ≤ 3)`);
      }
      
      // Check for orphaned data patterns
      const orphanedKeys = allKeys.filter(key => 
        key.startsWith('conversation_') || 
        key.startsWith('widget_data_') ||
        key.startsWith('appSetting_')
      );
      diagnostics.orphanedKeys = orphanedKeys.length;
      
      console.log('🔍 Deletion Diagnostics:', diagnostics);
      return diagnostics;
      
    } catch (error) {
      console.error('Error running deletion diagnostics:', error);
      return { error: error.message };
    }
  },
  
  /**
   * Quick test to verify a deletion worked
   */
  async verifyDeletion(dataType, itemId) {
    try {
      const stored = await AsyncStorage.getItem(dataType);
      if (!stored) {
        return { success: true, message: `No ${dataType} data found` };
      }
      
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return { success: false, message: `${dataType} is not an array` };
      }
      
      const found = parsed.find(item => item.id === itemId);
      if (found) {
        return { success: false, message: `Item ${itemId} still exists in ${dataType}!` };
      } else {
        return { success: true, message: `Item ${itemId} successfully deleted from ${dataType}` };
      }
      
    } catch (error) {
      return { success: false, message: `Error verifying deletion: ${error.message}` };
    }
  },
  
  /**
   * Clean up old diagnostic data if needed
   */
  async cleanup() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const diagnosticKeys = allKeys.filter(key => key.startsWith('diagnostic_'));
      
      if (diagnosticKeys.length > 0) {
        await AsyncStorage.multiRemove(diagnosticKeys);
        console.log(`🧹 Cleaned up ${diagnosticKeys.length} diagnostic keys`);
      }
      
      return { success: true, cleaned: diagnosticKeys.length };
    } catch (error) {
      console.error('Error cleaning up diagnostics:', error);
      return { success: false, error: error.message };
    }
  }
};

// Export for easy console access in development
if (__DEV__) {
  global.DeletionDiagnostics = DeletionDiagnostics;
}

export default DeletionDiagnostics;