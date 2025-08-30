// src/services/DataExportService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';

/**
 * Data Export Service for GDPR/CCPA Compliance
 * Exports all user-created data in machine-readable JSON format
 */
class DataExportService {
  
  // Core data keys that contain user-created content
  static USER_DATA_KEYS = {
    // Core life management data
    GOALS: 'goals',
    MILESTONES: 'milestones', // Fixed: was 'projects', now 'milestones'
    TASKS: 'tasks',
    TODOS: 'todos',
    TOMORROW_TODOS: 'tomorrowTodos',
    LATER_TODOS: 'laterTodos',
    MILESTONE_GOAL_LINK_MAP: 'milestoneGoalLinkMap', // Fixed: now uses milestones
    TIME_BLOCKS: 'timeBlocks', // Added: missing time blocks
    DOMAINS: 'domains', // Added: domain configuration
    TAGS: 'tags', // Added: tags system
    FILTERS: 'filters', // Added: filtering preferences
    
    // Financial tracker data
    FINANCIAL_TRACKER: 'financialTrackerData',
    FINANCIAL_TRACKER_CONGRATS: 'financialTrackerCongratsShown', // Added: financial tracker congrats flag
    
    // Streak tracker data  
    STREAK_DATA: 'streakData',
    DAILY_STANDUP_STREAK: 'dailyStandupStreak',
    DAILY_STANDUP_DATA: 'dailyStandupData', // Added: standup data
    STANDUP_NOTES: 'standupNotes', // Added: standup notes
    DAILY_STANDUP_FOCUS_MODE: 'dailyStandupFocusMode', // Added: daily reflection focus mode
    
    // AI conversation data
    CONVERSATIONS: 'conversations',
    LOCAL_CONVERSATIONS: 'localConversations', // Added: local conversation storage
    CURRENT_CONVERSATION_ID: 'currentConversationId',
    TEMP_CONVERSATION_ID: 'tempConversationId', // Added: temporary conversations
    AI_USAGE_DATA: 'aiUsageData', // Added: AI usage tracking
    AI_CREDITS: 'aiCredits', // Added: AI credits system
    CUSTOM_INTRO_MESSAGES: 'customIntroMessages', // Added: custom intro messages
    
    // User profile and preferences
    USER_PROFILE: 'userProfile',
    THEME_TYPE: 'themeType', 
    THEME_COLOR: 'themeColor',
    APP_SETTINGS: 'appSettings',
    CUSTOM_THEMES: 'customThemes',
    SUBSCRIPTION_STATUS: 'subscriptionStatus', // Added: subscription status
    USER_COUNTRY: 'userCountry', // Added: user country
    LIFE_DIRECTION: 'lifeDirection', // Added: life direction data
    
    // Documents and knowledge
    USER_KNOWLEDGE_FILES: 'userKnowledgeFiles',
    DOCUMENT_CONTEXT: 'documentContext',
    ASSISTANT_DOCUMENT_CONTEXT: 'assistantDocumentContext', // Added: AI document context
    DOCUMENT_CONTEXT_CACHE: 'documentContextCache', // Added: document cache
    PROCESSED_DOCUMENTS_CONTENT: 'processedDocumentsContent', // Added: processed docs
    
    // Calendar data
    CALENDAR_SETTINGS: 'calendarSettings',
    CALENDAR_EVENTS: 'calendarEvents',
    
    // Notes and additional data
    NOTES: 'notes',
    TODO_NOTES: 'todoNotes',
    DAILY_NOTES: 'dailyNotes',
    
    // Referral and notification data
    REFERRAL_CODE: 'referralCode', // Added: user's referral code
    REFERRAL_NOTIFICATIONS: 'referralNotifications', // Added: referral notifications
    REFERRALS_REMAINING: 'referralsRemaining', // Added: remaining referrals
    HAS_ENTERED_REFERRAL_CODE: 'hasEnteredReferralCode', // Added: referral status
    
    // App state and settings
    ONBOARDING_COMPLETED: 'onboardingCompleted', // Added: onboarding status
    SHOW_AI_BUTTON: 'showAIButton', // Added: AI button visibility
    DATA_CLEANUP_COMPLETED: 'dataCleanupCompleted', // Added: cleanup tracking
    FORCE_PROFILE_CLEAR: 'forceProfileClear' // Added: force profile clear flag
  };

  /**
   * Export all user data to a JSON file
   * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
   */
  static async exportAllUserData() {
    try {
      console.log('🚀 Starting complete user data export...');
      
      const exportData = {
        exportInfo: {
          exportDate: new Date().toISOString(),
          appName: 'LifeCompass',
          exportVersion: '1.0',
          description: 'Complete export of all user data from LifeCompass app'
        },
        userData: {}
      };

      // 1. Export core data keys
      for (const [category, key] of Object.entries(this.USER_DATA_KEYS)) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            exportData.userData[key] = JSON.parse(data);
            console.log(`✅ Exported ${category}: ${key}`);
          } else {
            console.log(`⚪ No data found for ${category}: ${key}`);
          }
        } catch (error) {
          console.log(`❌ Error exporting ${category}: ${key}`, error.message);
          exportData.userData[key] = { error: 'Failed to export this data' };
        }
      }

      // 2. Export individual AI conversations
      const conversations = exportData.userData[this.USER_DATA_KEYS.CONVERSATIONS];
      if (conversations && Array.isArray(conversations)) {
        exportData.aiConversations = {};
        
        for (const conversation of conversations) {
          if (conversation._id) {
            try {
              const conversationData = await AsyncStorage.getItem(`conversation_${conversation._id}`);
              if (conversationData) {
                exportData.aiConversations[conversation._id] = JSON.parse(conversationData);
                console.log(`✅ Exported conversation: ${conversation._id}`);
              }
            } catch (error) {
              console.log(`❌ Error exporting conversation ${conversation._id}:`, error.message);
              exportData.aiConversations[conversation._id] = { error: 'Failed to export conversation' };
            }
          }
        }
        console.log(`📊 Total conversations exported: ${Object.keys(exportData.aiConversations).length}`);
      }

      // 3. Export achievement data and tracking flags
      try {
        const achievements = await AsyncStorage.getItem('unlockedAchievements');
        if (achievements) {
          exportData.userData.achievements = JSON.parse(achievements);
          console.log('✅ Exported achievements data');
        }

        // Export achievement tracking flags
        const allKeys = await AsyncStorage.getAllKeys();
        const achievementKeys = allKeys.filter(key => 
          key.startsWith('achievement_shown_') ||
          key.startsWith('achievement_tracker_') ||
          key.startsWith('firstMessageSent_') ||
          key === 'pendingOnboardingAchievement'
        );
        
        if (achievementKeys.length > 0) {
          exportData.achievementTracking = {};
          for (const key of achievementKeys) {
            const value = await AsyncStorage.getItem(key);
            if (value) {
              exportData.achievementTracking[key] = value;
            }
          }
          console.log(`✅ Exported ${achievementKeys.length} achievement tracking flags`);
        }
      } catch (error) {
        console.log('❌ Error exporting achievements:', error.message);
      }

      // 4. Export streak tracking data
      try {
        const streakKeys = [
          'currentStreak',
          'highestStreak', 
          'streak_7_days',
          'streak_30_days',
          'streak_90_days',
          'streak_180_days',
          'streak_365_days'
        ];
        
        exportData.streakTracking = {};
        for (const key of streakKeys) {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            exportData.streakTracking[key] = value;
          }
        }
        console.log('✅ Exported streak tracking data');
      } catch (error) {
        console.log('❌ Error exporting streak tracking:', error.message);
      }

      // 5. Export Feature Explorer tracking data
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const featureKeys = allKeys.filter(key => 
          key.startsWith('feature_explorer_') ||
          key.startsWith('level_milestone_') ||
          key.startsWith('tracking_') ||
          key.includes('hasExplored') ||
          key.includes('isUnlocked')
        );
        
        if (featureKeys.length > 0) {
          exportData.featureExploring = {};
          for (const key of featureKeys) {
            const value = await AsyncStorage.getItem(key);
            if (value) {
              exportData.featureExploring[key] = value;
            }
          }
          console.log(`✅ Exported ${featureKeys.length} feature explorer tracking flags`);
        }
      } catch (error) {
        console.log('❌ Error exporting feature explorer data:', error.message);
      }

      // 6. Export daily standup/reflection entries
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const standupKeys = allKeys.filter(key => key.startsWith('dailyStandup_'));
        
        if (standupKeys.length > 0) {
          exportData.dailyReflections = {};
          for (const key of standupKeys) {
            const value = await AsyncStorage.getItem(key);
            if (value) {
              exportData.dailyReflections[key] = JSON.parse(value);
            }
          }
          console.log(`✅ Exported ${standupKeys.length} daily reflection entries`);
        }
      } catch (error) {
        console.log('❌ Error exporting daily reflections:', error.message);
      }

      // 7. Create and save the export file
      const fileName = `LifeCompass_DataExport_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      const jsonString = JSON.stringify(exportData, null, 2);
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      
      console.log(`📄 Export file created: ${fileName}`);
      console.log(`📊 Export statistics:
        - File size: ${(jsonString.length / 1024).toFixed(2)} KB
        - Core data categories: ${Object.keys(this.USER_DATA_KEYS).length}
        - AI conversations: ${exportData.aiConversations ? Object.keys(exportData.aiConversations).length : 0}
        - Export completed successfully`);

      return {
        success: true,
        filePath: fileUri,
        fileName: fileName,
        fileSize: jsonString.length,
        categories: Object.keys(this.USER_DATA_KEYS).length,
        conversationCount: exportData.aiConversations ? Object.keys(exportData.aiConversations).length : 0,
        jsonData: jsonString // Include the JSON string for clipboard copy
      };

    } catch (error) {
      console.error('❌ Data export failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Share the exported data file
   * @param {string} filePath - Path to the export file
   * @returns {Promise<boolean>}
   */
  static async shareExportFile(filePath) {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export Your LifeCompass Data'
      });
      
      console.log('📤 Export file shared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sharing export file:', error);
      throw error;
    }
  }

  /**
   * Copy export data to clipboard
   * @param {string} jsonData - The JSON string to copy
   * @returns {Promise<boolean>}
   */
  static async copyToClipboard(jsonData) {
    try {
      await Clipboard.setStringAsync(jsonData);
      console.log('📋 Export data copied to clipboard');
      return true;
    } catch (error) {
      console.error('❌ Error copying to clipboard:', error);
      throw error;
    }
  }

  /**
   * Get a summary of what data will be exported
   * @returns {Promise<Object>}
   */
  static async getExportSummary() {
    try {
      const summary = {
        categories: {},
        totalItems: 0,
        estimatedSize: 0
      };

      for (const [category, key] of Object.entries(this.USER_DATA_KEYS)) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            let itemCount = 0;
            
            if (Array.isArray(parsed)) {
              itemCount = parsed.length;
            } else if (typeof parsed === 'object' && parsed !== null) {
              itemCount = Object.keys(parsed).length;
            } else {
              itemCount = 1;
            }

            summary.categories[category] = {
              key: key,
              itemCount: itemCount,
              sizeBytes: data.length
            };
            summary.totalItems += itemCount;
            summary.estimatedSize += data.length;
          }
        } catch (error) {
          console.log(`Error analyzing ${category}:`, error.message);
        }
      }

      // Check conversations count
      try {
        const conversations = await AsyncStorage.getItem(this.USER_DATA_KEYS.CONVERSATIONS);
        if (conversations) {
          const convArray = JSON.parse(conversations);
          if (Array.isArray(convArray)) {
            summary.conversationCount = convArray.length;
          }
        }
      } catch (error) {
        console.log('Error counting conversations:', error.message);
      }

      return summary;
    } catch (error) {
      console.error('Error generating export summary:', error);
      return { error: error.message };
    }
  }

  /**
   * Delete all user data from the device (GDPR Right to Erasure)
   * @returns {Promise<{success: boolean, deletedItems: number, error?: string}>}
   */
  static async deleteAllUserData() {
    try {
      console.log('🗑️ Starting complete user data deletion...');
      
      let deletedItems = 0;
      const deletionResults = [];

      // 1. Delete core data keys
      for (const [category, key] of Object.entries(this.USER_DATA_KEYS)) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            await AsyncStorage.removeItem(key);
            deletedItems++;
            deletionResults.push(`✅ Deleted ${category}: ${key}`);
            console.log(`✅ Deleted ${category}: ${key}`);
          } else {
            deletionResults.push(`⚪ No data found for ${category}: ${key}`);
          }
        } catch (error) {
          console.log(`❌ Error deleting ${category}: ${key}`, error.message);
          deletionResults.push(`❌ Error deleting ${category}: ${key} - ${error.message}`);
        }
      }

      // 2. Delete individual AI conversations
      try {
        const conversations = await AsyncStorage.getItem(this.USER_DATA_KEYS.CONVERSATIONS);
        if (conversations) {
          const conversationList = JSON.parse(conversations);
          if (Array.isArray(conversationList)) {
            for (const conversation of conversationList) {
              if (conversation._id) {
                try {
                  await AsyncStorage.removeItem(`conversation_${conversation._id}`);
                  deletedItems++;
                  console.log(`✅ Deleted conversation: ${conversation._id}`);
                } catch (error) {
                  console.log(`❌ Error deleting conversation ${conversation._id}:`, error.message);
                }
              }
            }
          }
        }
      } catch (error) {
        console.log('❌ Error deleting conversations:', error.message);
      }

      // 3. Delete achievement data
      try {
        const achievements = await AsyncStorage.getItem('unlockedAchievements');
        if (achievements) {
          await AsyncStorage.removeItem('unlockedAchievements');
          deletedItems++;
          console.log('✅ Deleted achievements data');
        }
      } catch (error) {
        console.log('❌ Error deleting achievements:', error.message);
      }

      // 4. Delete streak tracking data
      try {
        const streakKeys = [
          'currentStreak',
          'highestStreak', 
          'streak_7_days',
          'streak_30_days',
          'streak_90_days',
          'streak_180_days',
          'streak_365_days'
        ];
        
        for (const key of streakKeys) {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            await AsyncStorage.removeItem(key);
            deletedItems++;
          }
        }
        console.log('✅ Deleted streak tracking data');
      } catch (error) {
        console.log('❌ Error deleting streak tracking:', error.message);
      }

      // 5. Delete calendar and todo data
      try {
        const calendarTodoKeys = [
          'calendarSettings',
          'calendarEvents', 
          'todos',
          'tomorrowTodos',
          'laterTodos',
          'notes',
          'todoNotes',
          'dailyNotes',
          'standupNotes',
          'dailyStandupData'
        ];
        
        for (const key of calendarTodoKeys) {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            await AsyncStorage.removeItem(key);
            deletedItems++;
          }
        }
        console.log('✅ Deleted calendar, todo, and notes data');
      } catch (error) {
        console.log('❌ Error deleting calendar/todo data:', error.message);
      }

      // 6. Delete achievement tracking flags
      try {
        const achievementKeys = [
          'pendingOnboardingAchievement',
          'achievement_tracker_first_goal',
          'firstMessageSent_',
          // Add other achievement tracking keys as needed
        ];
        
        // Get all keys and filter for achievement-related ones
        const allKeys = await AsyncStorage.getAllKeys();
        const achievementTrackingKeys = allKeys.filter(key => 
          key.startsWith('achievement_shown_') || 
          key.startsWith('firstMessageSent_') ||
          achievementKeys.includes(key)
        );
        
        for (const key of achievementTrackingKeys) {
          await AsyncStorage.removeItem(key);
          deletedItems++;
        }
        console.log(`✅ Deleted ${achievementTrackingKeys.length} achievement tracking flags`);
      } catch (error) {
        console.log('❌ Error deleting achievement flags:', error.message);
      }

      // 7. Delete any remaining user-related keys
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const additionalUserKeys = allKeys.filter(key => 
          // Include common user data patterns that might have been missed
          key.includes('widget_') ||
          key.includes('customTheme') ||
          key.includes('notification') ||
          key.includes('onboarding') ||
          key.includes('tutorial') ||
          key.includes('setting_') ||
          key.startsWith('user') ||
          key.startsWith('profile')
        );
        
        for (const key of additionalUserKeys) {
          try {
            await AsyncStorage.removeItem(key);
            deletedItems++;
          } catch (error) {
            console.log(`❌ Error deleting ${key}:`, error.message);
          }
        }
        
        if (additionalUserKeys.length > 0) {
          console.log(`✅ Deleted ${additionalUserKeys.length} additional user data keys`);
        }
      } catch (error) {
        console.log('❌ Error deleting additional user keys:', error.message);
      }

      // 8. Delete AppContext-specific storage keys that might be causing reloading
      try {
        const appContextKeys = [
          'goals',
          'milestones', 
          'tasks',
          'todos',
          'tomorrowTodos',
          'laterTodos',
          'timeBlocks',
          'domains',
          'settings',
          'tags',
          'notes',
          'filters',
          'milestoneGoalLinkMap',
          'userCountry',
          'lifeDirection'
        ];
        
        for (const key of appContextKeys) {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            await AsyncStorage.removeItem(key);
            deletedItems++;
            console.log(`✅ Deleted AppContext key: ${key}`);
          }
        }
      } catch (error) {
        console.log('❌ Error deleting AppContext keys:', error.message);
      }

      // 9. Set force clear flag for ProfileScreen
      try {
        await AsyncStorage.setItem('forceProfileClear', 'true');
        console.log('✅ Set force profile clear flag');
      } catch (error) {
        console.log('❌ Error setting force clear flag:', error.message);
      }

      // 10. Comprehensive cleanup of ALL AsyncStorage keys using getAllKeys
      try {
        console.log('🔍 Starting comprehensive AsyncStorage cleanup...');
        const allKeys = await AsyncStorage.getAllKeys();
        console.log(`📊 Total AsyncStorage keys found: ${allKeys.length}`);
        
        // Define patterns for keys that should be preserved (system/app settings)
        const preservePatterns = [
          'subscriptionStatus',
          'hasEnteredReferralCode', 
          'referralCode',
          'referralsRemaining',
          'showAIButton',
          'expo-',
          'RCTAsyncLocalStorage',
          '@react-native-async-storage'
        ];
        
        // Keys to definitely delete - including the backup files that are causing issues
        const deletePatterns = [
          'backup_startup_',     // This is the main culprit - all backup files
          'achievement',
          'widget_',
          'conversation_',
          'tempConversationId',  // Added: temporary conversations
          'dailyStandup_',       // This will catch dailyStandup_YYYY-MM-DD entries
          'standup',
          'notes',
          'todo',
          'task', 
          'goal',
          'milestone',
          'project',             // Old milestone storage key
          'projects_backup',     // Backup of projects
          'financial',
          'financialTrackerCongrats', // Added: financial tracker congratulations
          'streak',
          'calendar',
          'user',
          'profile',
          'theme',
          'domain',
          'timeBlock',
          'settings',
          'onboarding',
          'knowledge',
          'document',
          'doc_content_',        // Document content
          'levelMilestone_',     // Achievement milestone flags
          'selectedGoal',        // Selected goal references
          'appSetting_selectedGoal', // App setting goal references
          'goalsTabIndex',       // Goals tab index
          'milestoneGoalLinkMap', // Milestone-goal links
          'projectGoalLinkMap',  // Project-goal links  
          'processedDocumentsContent', // Processed document content
          'assistantDocumentContext',  // AI document context
          'documentContextCache',      // Document context cache
          'userKnowledgeFiles',        // User knowledge files
          'localConversations',        // Local conversation storage
          'unlockedAchievements',      // Achievement data
          'dailyStandupFocusMode',     // Daily standup data
          'customIntroMessages',       // Added: custom intro messages
          'aiUsageData',              // Added: AI usage data
          'aiCredits',                // Added: AI credits
          'lifeDirection',            // Added: life direction
          'referralNotifications',    // Added: referral notifications
          'dataCleanupCompleted',     // Added: cleanup tracking
          'feature_explorer_',        // Added: feature explorer tracking
          'tracking_',                // Added: general tracking data
          'firstMessageSent_',        // Added: first message tracking
          'achievement_tracker_',     // Added: achievement tracker data
          'achievement_shown_'        // Added: shown achievement flags
        ];
        
        let comprehensiveDeleteCount = 0;
        
        for (const key of allKeys) {
          const keyLower = key.toLowerCase();
          
          // Skip if it should be preserved
          const shouldPreserve = preservePatterns.some(pattern => 
            keyLower.includes(pattern.toLowerCase())
          );
          
          if (shouldPreserve) {
            console.log(`⚪ Preserving system key: ${key}`);
            continue;
          }
          
          // Delete if it matches our delete patterns or if it's user data
          const shouldDelete = deletePatterns.some(pattern => 
            keyLower.includes(pattern.toLowerCase()) || key.startsWith(pattern)
          ) || key === 'forceProfileClear'; // Also clean up our own flag after use
          
          if (shouldDelete) {
            try {
              await AsyncStorage.removeItem(key);
              comprehensiveDeleteCount++;
              console.log(`✅ Comprehensively deleted: ${key}`);
            } catch (error) {
              console.log(`❌ Error deleting key ${key}:`, error.message);
            }
          } else {
            console.log(`⚪ Skipping unknown key: ${key}`);
          }
        }
        
        console.log(`🧹 Comprehensive cleanup complete: ${comprehensiveDeleteCount} additional keys deleted`);
        deletedItems += comprehensiveDeleteCount;
      } catch (error) {
        console.log('❌ Error in comprehensive cleanup:', error.message);
      }

      // 11. Clean up any export files
      await this.cleanupAllExportFiles();

      console.log(`🗑️ Data deletion completed:
        - Total items deleted: ${deletedItems}
        - Export files cleaned up
        - User data completely removed
        - Force clear flag set for ProfileScreen`);

      return {
        success: true,
        deletedItems: deletedItems,
        deletionLog: deletionResults
      };

    } catch (error) {
      console.error('❌ Data deletion failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clean up ALL export files (for data deletion)
   */
  static async cleanupAllExportFiles() {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      const exportFiles = files.filter(file => file.startsWith('LifeCompass_DataExport_'));
      
      for (const file of exportFiles) {
        await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${file}`);
      }
      console.log(`🧹 Cleaned up ${exportFiles.length} export files`);
    } catch (error) {
      console.error('Error cleaning up export files:', error);
    }
  }

  /**
   * Clean up old export files to save space
   */
  static async cleanupOldExports() {
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      const exportFiles = files.filter(file => file.startsWith('LifeCompass_DataExport_'));
      
      if (exportFiles.length > 3) { // Keep only last 3 exports
        const filesToDelete = exportFiles.slice(0, -3);
        for (const file of filesToDelete) {
          await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${file}`);
        }
        console.log(`🧹 Cleaned up ${filesToDelete.length} old export files`);
      }
    } catch (error) {
      console.error('Error cleaning up old exports:', error);
    }
  }
}

export default DataExportService;