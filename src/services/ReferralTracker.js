// src/services/ReferralTracker.js
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

// API Configuration - Update with your actual API endpoints
const API_CONFIG = {
  BASE_URL: 'https://api.lifecompass.app', // Replace with your actual API domain
  REFERRAL_ENDPOINT: '/referrals/complete',
  REFERRAL_CLICK_ENDPOINT: '/referrals/click',
};

const STORAGE_KEYS = {
  PENDING_REFERRAL: 'pendingReferralCode',
  REFERRAL_TIMESTAMP: 'referralTimestamp',
  REFERRAL_SOURCE: 'referralSource',
  DEVICE_ID: 'referralDeviceId',
};

const ReferralTracker = {
  /**
   * Store a referral code when user arrives via referral link
   * @param {string} referralCode - The referral code from the link
   * @param {string} source - How the user arrived (deeplink, clipboard, etc.)
   */
  async storePendingReferral(referralCode, source = 'deeplink') {
    try {
      const timestamp = new Date().toISOString();
      
      // Store securely to prevent tampering
      await SecureStore.setItemAsync(STORAGE_KEYS.PENDING_REFERRAL, referralCode);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFERRAL_TIMESTAMP, timestamp);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFERRAL_SOURCE, source);
      
      // Generate and store a device ID if one doesn't exist
      let deviceId = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = this.generateDeviceId();
        await SecureStore.setItemAsync(STORAGE_KEYS.DEVICE_ID, deviceId);
      }
      
      console.log(`Stored pending referral: ${referralCode} from ${source}`);
      
      // Optionally notify the server about the app open event
      this.trackAppOpen(referralCode, deviceId, source).catch(err => 
        console.log('Error tracking app open:', err)
      );
      
      return true;
    } catch (error) {
      console.error('Error storing pending referral:', error);
      return false;
    }
  },

  /**
   * Get the stored pending referral code
   * @returns {Object|null} - Referral data or null if none exists
   */
  async getPendingReferral() {
    try {
      const referralCode = await SecureStore.getItemAsync(STORAGE_KEYS.PENDING_REFERRAL);
      
      if (!referralCode) return null;
      
      const timestamp = await SecureStore.getItemAsync(STORAGE_KEYS.REFERRAL_TIMESTAMP);
      const source = await SecureStore.getItemAsync(STORAGE_KEYS.REFERRAL_SOURCE);
      const deviceId = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_ID);
      
      return {
        referralCode,
        timestamp,
        source,
        deviceId,
      };
    } catch (error) {
      console.error('Error getting pending referral:', error);
      return null;
    }
  },

  /**
   * Clear the pending referral after it's been processed
   */
  async clearPendingReferral() {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.PENDING_REFERRAL);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFERRAL_TIMESTAMP);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFERRAL_SOURCE);
      // Note: We do NOT clear the device ID as it should persist
      
      console.log('Cleared pending referral');
      return true;
    } catch (error) {
      console.error('Error clearing pending referral:', error);
      return false;
    }
  },

  /**
   * Process a referral link URL
   * @param {string} url - The incoming URL
   * @returns {string|null} - Extracted referral code or null
   */
  extractReferralFromURL(url) {
    try {
      // Handle both deep links and web URLs
      // Examples: 
      // lifecompass://r/USER-ABC123
      // https://[api-id].execute-api.ap-southeast-2.amazonaws.com/prod/r/USER-ABC123
      // https://lifecompass.app/r/USER-ABC123
      
      const parsed = Linking.parse(url);
      
      // Check if it's a referral URL (deep link format)
      if (parsed.path && parsed.path.startsWith('/r/')) {
        const referralCode = parsed.path.replace('/r/', '');
        return referralCode;
      }
      
      // Check if it's the API Gateway URL format
      if (url.includes('execute-api.ap-southeast-2.amazonaws.com/prod/r/')) {
        const parts = url.split('/r/');
        if (parts.length > 1) {
          return parts[1].split('?')[0]; // Remove any query params
        }
      }
      
      // Check if it's our domain with /r/ path
      if (url.includes('lifecompass.app/r/')) {
        const parts = url.split('/r/');
        if (parts.length > 1) {
          return parts[1].split('?')[0]; // Remove any query params
        }
      }
      
      // Legacy format support
      if (parsed.queryParams && parsed.queryParams.ref) {
        return parsed.queryParams.ref;
      }
      
      // App Store ct parameter support
      if (parsed.queryParams && parsed.queryParams.ct) {
        return parsed.queryParams.ct;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting referral from URL:', error);
      return null;
    }
  },

  /**
   * Check clipboard for referral codes (iOS fallback)
   * This is useful when users copy referral links
   */
  async checkClipboardForReferral() {
    try {
      // Import clipboard dynamically to avoid issues
      const { getStringAsync } = await import('expo-clipboard');
      const clipboardContent = await getStringAsync();
      
      if (clipboardContent && typeof clipboardContent === 'string') {
        // Check if clipboard contains a referral URL
        if (clipboardContent.includes('lifecompass.app/r/') || 
            clipboardContent.includes('lifecompass://r/') ||
            clipboardContent.includes('execute-api.ap-southeast-2.amazonaws.com/prod/r/')) {
          const referralCode = this.extractReferralFromURL(clipboardContent);
          if (referralCode) {
            await this.storePendingReferral(referralCode, 'clipboard');
            return referralCode;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error checking clipboard for referral:', error);
      return null;
    }
  },

  /**
   * Handle incoming URL and extract referral if present
   * @param {string} url - The incoming URL
   */
  async handleIncomingURL(url) {
    if (!url) return null;
    
    const referralCode = this.extractReferralFromURL(url);
    if (referralCode) {
      await this.storePendingReferral(referralCode, 'deeplink');
      return referralCode;
    }
    
    return null;
  },

  /**
   * Process pending referral when user upgrades to paid plan
   * @param {string} userId - The user who made the purchase
   * @param {string} subscriptionType - The subscription they purchased
   * @param {Object} receipt - Optional receipt data from the App Store
   */
  async processPendingReferral(userId, subscriptionType, receipt = null) {
    try {
      const pendingReferral = await this.getPendingReferral();
      
      if (!pendingReferral) {
        console.log('No pending referral to process');
        return null;
      }
      
      // Check if referral is still valid (not too old)
      const referralDate = new Date(pendingReferral.timestamp);
      const daysSinceReferral = (Date.now() - referralDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceReferral > 30) {
        console.log('Referral too old, clearing...');
        await this.clearPendingReferral();
        return null;
      }
      
      // Store the completed referral for tracking
      const completedReferral = {
        referralCode: pendingReferral.referralCode,
        referredUserId: userId,
        subscriptionType,
        completedAt: new Date().toISOString(),
        source: pendingReferral.source,
        originalTimestamp: pendingReferral.timestamp,
        deviceId: pendingReferral.deviceId
      };
      
      // Save to completed referrals list
      const existingCompletedStr = await AsyncStorage.getItem('completedReferrals');
      const existingCompleted = existingCompletedStr ? JSON.parse(existingCompletedStr) : [];
      existingCompleted.push(completedReferral);
      await AsyncStorage.setItem('completedReferrals', JSON.stringify(existingCompleted));
      
      // Send to server API
      const serverNotified = await this.notifyServerOfConversion(completedReferral, receipt);
      
      // Clear the pending referral (even if server notification fails)
      await this.clearPendingReferral();
      
      console.log('Processed referral:', completedReferral, 'Server notified:', serverNotified);
      return {
        ...completedReferral,
        serverNotified
      };
    } catch (error) {
      console.error('Error processing pending referral:', error);
      return null;
    }
  },

  /**
   * Get all completed referrals for debugging/analytics
   */
  async getCompletedReferrals() {
    try {
      const completedStr = await AsyncStorage.getItem('completedReferrals');
      return completedStr ? JSON.parse(completedStr) : [];
    } catch (error) {
      console.error('Error getting completed referrals:', error);
      return [];
    }
  },

  /**
   * Initialize referral tracking - call this on app startup
   */
  async initialize() {
    try {
      // Check for initial URL (if app was opened via referral link)
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        await this.handleIncomingURL(initialURL);
      }
      
      // Set up listener for incoming URLs while app is running
      const subscription = Linking.addEventListener('url', (event) => {
        this.handleIncomingURL(event.url);
      });
      
      // Check clipboard as fallback (useful for iOS)
      await this.checkClipboardForReferral();
      
      return subscription;
    } catch (error) {
      console.error('Error initializing referral tracker:', error);
      return null;
    }
  },

  /**
   * Generate App Store URL with custom parameters for tracking
   * @param {string} referralCode - The referrer's code
   */
  generateAppStoreURL(referralCode) {
    // For now, return the API Gateway URL that redirects to App Store
    // Replace with your actual API Gateway URL
    return `https://8yu6fdcjij.execute-api.ap-southeast-2.amazonaws.com/prod/r/${referralCode}`;
  },

  /**
   * Generate a unique device ID
   * @returns {string} A UUID for device identification
   */
  generateDeviceId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  /**
   * Track app open from referral link (optional server notification)
   * @param {string} referralCode - The referral code
   * @param {string} deviceId - The device identifier
   * @param {string} source - How the referral was received
   */
  async trackAppOpen(referralCode, deviceId, source) {
    try {
      // This is optional - if you want to track app opens server-side
      // For now, just log it
      console.log(`App opened with referral: ${referralCode}, device: ${deviceId}, source: ${source}`);
      
      // Uncomment to notify server (when API is ready)
      /*
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.REFERRAL_CLICK_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          referralCode,
          deviceId,
          source,
          timestamp: new Date().toISOString(),
          platform: Platform.OS
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      return true;
      */
      
      return true;
    } catch (error) {
      console.error('Error tracking app open:', error);
      return false;
    }
  },

  /**
   * Notify server of a successful conversion
   * @param {Object} completedReferral - The completed referral data
   * @param {Object} receipt - Optional receipt data from the App Store
   */
  async notifyServerOfConversion(completedReferral, receipt) {
    try {
      // For now, just log it
      console.log('Would notify server of conversion:', completedReferral);
      
      // Uncomment to notify server (when API is ready)
      /*
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.REFERRAL_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...completedReferral,
          receipt: receipt,
          platform: Platform.OS,
          appVersion: Constants.manifest.version
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const responseData = await response.json();
      return responseData;
      */
      
      return true;
    } catch (error) {
      console.error('Error notifying server of conversion:', error);
      return false;
    }
  }
};

export default ReferralTracker;