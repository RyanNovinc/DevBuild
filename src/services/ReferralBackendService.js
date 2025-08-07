// src/services/ReferralBackendService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import deviceIdentifier from '../utils/DeviceIdentifier';

// AWS API Gateway endpoint - update this with your actual endpoint
const API_BASE_URL = process.env.REFERRAL_API_URL || 'https://rwcfj8kh8a.execute-api.ap-southeast-2.amazonaws.com/prod';

class ReferralBackendService {
  constructor() {
    this.isOnline = true;
    this.syncQueue = [];
  }

  // Check if we have network connectivity
  async checkConnectivity() {
    try {
      // Simple connectivity check by pinging health endpoint
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        timeout: 5000
      });
      this.isOnline = response.ok;
      return this.isOnline;
    } catch (error) {
      this.isOnline = false;
      return false;
    }
  }

  // Create or get anonymous user record
  async getOrCreateAnonymousUser() {
    try {
      const deviceId = await deviceIdentifier.getDeviceId();
      const fingerprint = await deviceIdentifier.getDeviceFingerprint();
      const anonymousUserId = await deviceIdentifier.getAnonymousUserId();

      // This is handled automatically by the Lambda function now
      return {
        id: anonymousUserId,
        device_id: deviceId,
        device_fingerprint: fingerprint
      };
    } catch (error) {
      console.error('Error in getOrCreateAnonymousUser:', error);
      return null;
    }
  }

  // Sync referral code to backend
  async syncReferralCode(code, userIdentifier = null) {
    try {
      if (!await this.checkConnectivity()) {
        await this.queueForSync('syncReferralCode', { code, userIdentifier });
        return true;
      }

      const deviceId = await deviceIdentifier.getDeviceId();
      const deviceFingerprint = await deviceIdentifier.getDeviceFingerprint();

      const response = await fetch(`${API_BASE_URL}/sync-referral-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          deviceFingerprint,
          code,
          userIdentifier
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error syncing referral code:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in syncReferralCode:', error);
      await this.queueForSync('syncReferralCode', { code, userIdentifier });
      return false;
    }
  }

  // Sync referral stats to backend
  async syncReferralStats(stats) {
    try {
      if (!await this.checkConnectivity()) {
        await this.queueForSync('syncReferralStats', { stats });
        return true;
      }

      const deviceId = await deviceIdentifier.getDeviceId();
      const deviceFingerprint = await deviceIdentifier.getDeviceFingerprint();

      const response = await fetch(`${API_BASE_URL}/sync-referral-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          deviceFingerprint,
          stats
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error syncing referral stats:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in syncReferralStats:', error);
      await this.queueForSync('syncReferralStats', { stats });
      return false;
    }
  }

  // Record a referral conversion
  async recordReferralConversion(referralCode, purchaserDeviceId = null) {
    try {
      if (!await this.checkConnectivity()) {
        await this.queueForSync('recordReferralConversion', { referralCode, purchaserDeviceId });
        return true;
      }

      const currentDeviceId = purchaserDeviceId || await deviceIdentifier.getDeviceId();
      const deviceFingerprint = await deviceIdentifier.getDeviceFingerprint();

      const response = await fetch(`${API_BASE_URL}/record-conversion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralCode,
          purchaserDeviceId: currentDeviceId,
          deviceFingerprint
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error recording conversion:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in recordReferralConversion:', error);
      await this.queueForSync('recordReferralConversion', { referralCode, purchaserDeviceId });
      return false;
    }
  }

  // Increment referrer's conversion stats (handled by Lambda now)
  async incrementReferrerStats(referrerId) {
    // This is now handled automatically by the record-conversion Lambda function
    return true;
  }

  // Get earned discounts for a user (by device ID)
  async getEarnedDiscounts(deviceId = null) {
    try {
      const targetDeviceId = deviceId || await deviceIdentifier.getDeviceId();

      const response = await fetch(`${API_BASE_URL}/get-discounts?deviceId=${targetDeviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error getting earned discounts:', result.error);
        return [];
      }

      return result.discounts || [];
    } catch (error) {
      console.error('Error in getEarnedDiscounts:', error);
      return [];
    }
  }

  // Link anonymous user to real account when they sign up
  async linkAnonymousToAccount(userId, email) {
    try {
      const deviceId = await deviceIdentifier.getDeviceId();

      const response = await fetch(`${API_BASE_URL}/link-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          userId,
          email
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error linking anonymous to account:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error linking anonymous to account:', error);
      return false;
    }
  }

  // Validate a referral code
  async validateReferralCode(code) {
    try {
      if (!await this.checkConnectivity()) {
        return { isValid: false, error: 'No internet connection' };
      }

      const deviceId = await deviceIdentifier.getDeviceId();
      const deviceFingerprint = await deviceIdentifier.getDeviceFingerprint();

      const response = await fetch(`${API_BASE_URL}/validate-referral-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          deviceId,
          deviceFingerprint
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return { isValid: false, error: result.error || 'Validation failed' };
      }

      return {
        isValid: result.success,
        referralData: result.referralData,
        error: result.error
      };
    } catch (error) {
      console.error('Error validating referral code:', error);
      return { isValid: false, error: 'Validation error occurred' };
    }
  }

  // Get user referral statistics
  async getUserReferralStats(deviceId = null) {
    try {
      const targetDeviceId = deviceId || await deviceIdentifier.getDeviceId();

      const response = await fetch(`${API_BASE_URL}/get-referral-stats?deviceId=${targetDeviceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error getting referral stats:', result.error);
        return null;
      }

      return result.stats;
    } catch (error) {
      console.error('Error in getUserReferralStats:', error);
      return null;
    }
  }

  // Redeem a discount during subscription purchase
  async redeemDiscount(conversionId, userId, subscriptionType, originalPrice) {
    try {
      const response = await fetch(`${API_BASE_URL}/redeem-discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversionId,
          userId,
          subscriptionType,
          originalPrice
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error redeeming discount:', result.error);
        return null;
      }

      return {
        discountedPrice: result.discountedPrice,
        discountAmount: result.discountAmount,
        redemptionId: result.redemptionId
      };
    } catch (error) {
      console.error('Error in redeemDiscount:', error);
      return null;
    }
  }

  // Queue operations for when we're back online
  async queueForSync(operation, data) {
    try {
      const queueItem = {
        id: Date.now().toString(),
        operation,
        data,
        timestamp: new Date().toISOString()
      };

      this.syncQueue.push(queueItem);
      
      // Store in AsyncStorage for persistence
      await AsyncStorage.setItem('referral_sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error queuing sync operation:', error);
    }
  }

  // Process sync queue when back online
  async processSyncQueue() {
    try {
      if (!await this.checkConnectivity()) return;

      // Load queue from storage
      const queueStr = await AsyncStorage.getItem('referral_sync_queue');
      if (queueStr) {
        this.syncQueue = JSON.parse(queueStr);
      }

      if (this.syncQueue.length === 0) return;

      console.log(`Processing ${this.syncQueue.length} queued sync operations`);

      for (const item of this.syncQueue) {
        try {
          switch (item.operation) {
            case 'syncReferralCode':
              await this.syncReferralCode(item.data.code, item.data.userIdentifier);
              break;
            case 'syncReferralStats':
              await this.syncReferralStats(item.data.stats);
              break;
            case 'recordReferralConversion':
              await this.recordReferralConversion(item.data.referralCode, item.data.purchaserDeviceId);
              break;
          }
        } catch (error) {
          console.error(`Error processing queued operation ${item.operation}:`, error);
        }
      }

      // Clear the queue
      this.syncQueue = [];
      await AsyncStorage.removeItem('referral_sync_queue');

    } catch (error) {
      console.error('Error processing sync queue:', error);
    }
  }
}

export const referralBackendService = new ReferralBackendService();
export default referralBackendService;