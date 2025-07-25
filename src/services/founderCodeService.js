// src/services/founderCodeService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';

// Storage keys
const STORAGE_KEYS = {
  FOUNDER_CODE: 'founder_code',
  DEVICE_ID: 'device_id',
  FOUNDER_VERIFICATION_DATE: 'founder_verification_date',
  TEST_MODE: 'founder_test_mode',
};

// API Endpoints
const API_ENDPOINTS = {
  ASSIGN_FOUNDER_CODE: 'https://8uucuqeys9.execute-api.ap-southeast-2.amazonaws.com/prod/assign-code',
  AVAILABLE_SPOTS: 'https://8uucuqeys9.execute-api.ap-southeast-2.amazonaws.com/prod/available-spots',
};

// Service modes
const SERVICE_MODES = {
  MOCK: 'mock',           // For UI testing without API calls
  DEVICE_ID: 'device_id', // For development testing with real API using device ID
  RECEIPT: 'receipt'      // For production with real API using purchase receipts
};

/**
 * Generate a simple UUID-like string for device ID
 * Not cryptographically secure, but unique enough for our testing purposes
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Service to handle founder code assignment and verification
 */
const founderCodeService = {
  /**
   * Get the current service mode
   * @returns {Promise<string>} The current mode (mock, device_id, or receipt)
   */
  getServiceMode: async () => {
    try {
      // In __DEV__ mode, check if there's a stored mode preference
      if (__DEV__) {
        const storedMode = await AsyncStorage.getItem(STORAGE_KEYS.TEST_MODE);
        if (storedMode && Object.values(SERVICE_MODES).includes(storedMode)) {
          return storedMode;
        }
      }
      
      // In production, always use receipt mode
      // In development, default to device_id mode if no preference
      return __DEV__ ? SERVICE_MODES.DEVICE_ID : SERVICE_MODES.RECEIPT;
    } catch (error) {
      console.error('Error getting service mode:', error);
      return __DEV__ ? SERVICE_MODES.MOCK : SERVICE_MODES.RECEIPT;
    }
  },
  
  /**
   * Set the service mode for testing
   * @param {string} mode - The mode to set (mock, device_id, or receipt)
   * @returns {Promise<boolean>} Whether the mode was set successfully
   */
  setServiceMode: async (mode) => {
    if (!Object.values(SERVICE_MODES).includes(mode)) {
      console.error('Invalid service mode:', mode);
      return false;
    }
    
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TEST_MODE, mode);
      return true;
    } catch (error) {
      console.error('Error setting service mode:', error);
      return false;
    }
  },
  
  /**
   * Generates or retrieves a unique device ID
   * In development, this will be used for founder code assignment
   * In production, this will be replaced with receipt verification
   */
  getDeviceId: async () => {
    try {
      // Try to get existing device ID from storage
      let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      
      // If no existing ID, generate and store a new one
      if (!deviceId) {
        // Get screen dimensions for additional uniqueness
        const { width, height } = Dimensions.get('window');
        
        // Generate a unique ID without using external dependencies
        deviceId = `${Platform.OS}-${width}x${height}-${Date.now()}-${generateUUID()}`;
        await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      // Fallback to a random ID if AsyncStorage fails
      return `fallback-${Date.now()}-${generateUUID()}`;
    }
  },
  
  /**
   * Assigns a founder code using the appropriate method based on mode
   * @param {Object} options - Options for assigning code
   * @param {string} options.testScenario - For mock mode: success, already_assigned, no_spots, error
   * @param {boolean} options.isTestMode - For device_id mode: whether to use test mode flag with Lambda
   * @returns {Promise<{success: boolean, code?: string, error?: string, alreadyAssigned?: boolean}>}
   */
  assignFounderCode: async (options = {}) => {
    try {
      // Get the current service mode
      const mode = await founderCodeService.getServiceMode();
      console.log('Assigning founder code in mode:', mode);
      
      // Handle different modes
      switch (mode) {
        case SERVICE_MODES.MOCK:
          return founderCodeService.generateMockFounderCode(options.testScenario);
          
        case SERVICE_MODES.DEVICE_ID:
          return founderCodeService.assignCodeWithDeviceId(options.isTestMode);
          
        case SERVICE_MODES.RECEIPT:
          return founderCodeService.assignCodeWithReceipt();
          
        default:
          throw new Error(`Unknown service mode: ${mode}`);
      }
    } catch (error) {
      console.error('Error in assignFounderCode:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  },
  
  /**
   * Assigns a founder code using device ID (for development)
   * @param {boolean} isTestMode - Whether to use test mode with Lambda
   * @returns {Promise<{success: boolean, code?: string, error?: string, alreadyAssigned?: boolean}>}
   */
  assignCodeWithDeviceId: async (isTestMode = true) => {
    try {
      console.log('Assigning code with device ID...');
      
      // Get device ID
      const deviceId = await founderCodeService.getDeviceId();
      console.log('Device ID:', deviceId);
      
      // Call Lambda function
      const response = await fetch(API_ENDPOINTS.ASSIGN_FOUNDER_CODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          isTestMode
        }),
      });
      
      // Check for HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error assigning founder code:', response.status, errorText);
        return {
          success: false,
          error: `API error (${response.status}): ${errorText || 'Unknown error'}`
        };
      }
      
      // Parse response
      const data = await response.json();
      console.log('Lambda response:', data);
      
      if (data.success) {
        // Store the founder code locally
        await AsyncStorage.setItem(STORAGE_KEYS.FOUNDER_CODE, data.code);
        return {
          success: true,
          code: data.code,
          alreadyAssigned: data.alreadyAssigned || false,
        };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to assign founder code',
        };
      }
    } catch (error) {
      console.error('Error assigning code with device ID:', error);
      return {
        success: false,
        error: error.message || 'Network error or service unavailable',
      };
    }
  },
  
  /**
   * Assigns a founder code using purchase receipt (for production)
   * @returns {Promise<{success: boolean, code?: string, error?: string, alreadyAssigned?: boolean}>}
   */
  assignCodeWithReceipt: async () => {
    // This will be implemented when we have App Store receipt verification
    console.warn('Receipt verification not implemented yet');
    return {
      success: false,
      error: 'Receipt verification not implemented yet'
    };
  },
  
  /**
   * For testing: Generate a mock founder code
   * @param {string} scenario - Testing scenario: success, already_assigned, no_spots, error
   * @returns {Promise<{success: boolean, code?: string, error?: string, alreadyAssigned?: boolean}>}
   */
  generateMockFounderCode: async (scenario = 'success') => {
    try {
      console.log('Generating mock founder code, scenario:', scenario);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle different test scenarios
      switch (scenario) {
        case 'already_assigned':
          // Get existing code or generate one
          let existingCode = await AsyncStorage.getItem(STORAGE_KEYS.FOUNDER_CODE);
          if (!existingCode) {
            existingCode = `LC-${Math.floor(1000 + Math.random() * 9000)}`;
            await AsyncStorage.setItem(STORAGE_KEYS.FOUNDER_CODE, existingCode);
          }
          
          return {
            success: true,
            code: existingCode,
            alreadyAssigned: true
          };
          
        case 'no_spots':
          return {
            success: false,
            error: 'No founder spots remaining. All 1000 have been claimed.'
          };
          
        case 'error':
          return {
            success: false,
            error: 'Simulated server error for testing'
          };
          
        case 'success':
        default:
          // Generate a new random code
          const newCode = `LC-${Math.floor(1000 + Math.random() * 9000)}`;
          await AsyncStorage.setItem(STORAGE_KEYS.FOUNDER_CODE, newCode);
          return {
            success: true,
            code: newCode,
            alreadyAssigned: false
          };
      }
    } catch (error) {
      console.error('Error generating mock code:', error);
      return {
        success: false,
        error: 'Unable to store mock code'
      };
    }
  },
  
  /**
   * Retrieves the stored founder code if it exists
   * @returns {Promise<string|null>}
   */
  getFounderCode: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.FOUNDER_CODE);
    } catch (error) {
      console.error('Error getting founder code:', error);
      return null;
    }
  },
  
  /**
   * Checks if the user has a founder code assigned
   * @returns {Promise<boolean>}
   */
  isFounder: async () => {
    const code = await founderCodeService.getFounderCode();
    return code !== null;
  },
  
  /**
   * Records the verification date when the user verifies in Discord
   * This is for UI purposes only - actual verification happens in Discord
   * @returns {Promise<boolean>}
   */
  markAsVerified: async () => {
    try {
      const now = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.FOUNDER_VERIFICATION_DATE, now);
      return true;
    } catch (error) {
      console.error('Error marking as verified:', error);
      return false;
    }
  },
  
  /**
   * Checks if the user has verified their founder status in Discord
   * @returns {Promise<boolean>}
   */
  isVerified: async () => {
    try {
      const date = await AsyncStorage.getItem(STORAGE_KEYS.FOUNDER_VERIFICATION_DATE);
      return date !== null;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  },
  
  /**
   * Clears founder data (for testing purposes)
   * @returns {Promise<boolean>}
   */
  clearFounderData: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.FOUNDER_CODE,
        STORAGE_KEYS.FOUNDER_VERIFICATION_DATE,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing founder data:', error);
      return false;
    }
  },
  
  /**
   * Constants exposed for use in UI
   */
  constants: {
    MODES: SERVICE_MODES
  }
};

export default founderCodeService;