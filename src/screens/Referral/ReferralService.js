// src/screens/Referral/ReferralService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FeatureExplorerTracker from '../../services/FeatureExplorerTracker';
import deviceIdentifier from '../../utils/DeviceIdentifier';
import referralBackendService from '../../services/ReferralBackendService';

// Storage keys
const KEYS = {
  REFERRAL_CODE: 'referralCode',
  REFERRALS_SENT: 'referralsSent',
  REFERRALS_STATS: 'referralsStats',
  LAST_VISIT_STATS: 'lastVisitStats',
};

// Generate a unique referral code using device ID
const generateUniqueCode = async (deviceId) => {
  const prefix = deviceId?.substring(-6, -2).toUpperCase() || 'LC';
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString(36).substring(-3).toUpperCase();
  return `${prefix}${randomPart}${timestamp}`;
};

// Generate a unique ID (simple version)
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5).toUpperCase();
};

const ReferralService = {
  // Initialize a user's referral code (now device-based)
  async setupReferralCode(userIdentifier = null) {
    try {
      // Check if user already has a code
      const existingCode = await AsyncStorage.getItem(KEYS.REFERRAL_CODE);
      if (existingCode) {
        // Sync existing code to backend
        await referralBackendService.syncReferralCode(existingCode, userIdentifier);
        return existingCode;
      }
      
      // Get device ID for code generation
      const deviceId = await deviceIdentifier.getDeviceId();
      
      // Generate and store new code
      const newCode = await generateUniqueCode(deviceId);
      await AsyncStorage.setItem(KEYS.REFERRAL_CODE, newCode);
      
      // Initialize stats
      const initialStats = {
        sent: 0,
        clicked: 0,
        converted: 0,
        plansEarned: 0, // Number of 500-credit rewards earned for user
        plansGifted: 0, // Number of 500-credit rewards gifted to others
      };
      await AsyncStorage.setItem(KEYS.REFERRALS_STATS, JSON.stringify(initialStats));
      
      // Initialize empty referrals list
      await AsyncStorage.setItem(KEYS.REFERRALS_SENT, JSON.stringify([]));
      
      // Sync to backend
      await referralBackendService.syncReferralCode(newCode, userIdentifier);
      await referralBackendService.syncReferralStats(initialStats);
      
      return newCode;
    } catch (error) {
      console.error('Error setting up referral code:', error);
      throw error;
    }
  },
  
  // Get the user's referral code
  async getReferralCode() {
    return await AsyncStorage.getItem(KEYS.REFERRAL_CODE);
  },
  
  // Get referral link
  getReferralLink(code) {
    return `https://lifecompass.app/r/${code}`;
  },

  // Get App Store referral link (for sharing)
  getAppStoreReferralLink(code) {
    // This link should redirect to the App Store but first store the referral code
    return `https://lifecompass.app/r/${code}`;
  },
  
  // Get number of referrals remaining (calculated from stats)
  async getReferralsRemaining() {
    const stats = await this.getReferralStats();
    const maxReferrals = 3; // Maximum referrals allowed
    return Math.max(0, maxReferrals - stats.converted);
  },
  
  // Record a referral share
  async trackReferralShare(showSuccess = null) {
    try {
      // Increment sent count in stats
      const statsStr = await AsyncStorage.getItem(KEYS.REFERRALS_STATS);
      const stats = statsStr ? JSON.parse(statsStr) : { sent: 0, clicked: 0, converted: 0, plansEarned: 0, plansGifted: 0 };
      stats.sent += 1;
      await AsyncStorage.setItem(KEYS.REFERRALS_STATS, JSON.stringify(stats));
      
      // Sync stats to backend
      await referralBackendService.syncReferralStats(stats);
      
      // Add to sent referrals list with timestamp
      const sentReferralsStr = await AsyncStorage.getItem(KEYS.REFERRALS_SENT);
      const sentReferrals = sentReferralsStr ? JSON.parse(sentReferralsStr) : [];
      const newReferral = {
        id: generateId(),
        status: 'created',
        date: new Date().toISOString().split('T')[0],
        reward: 'pending',
      };
      sentReferrals.push(newReferral);
      await AsyncStorage.setItem(KEYS.REFERRALS_SENT, JSON.stringify(sentReferrals));
      
      // Track achievement for first referral sent
      try {
        await FeatureExplorerTracker.trackFirstReferralSent(showSuccess);
      } catch (achievementError) {
        console.error('Error tracking referral achievement:', achievementError);
        // Don't fail the whole function if achievement tracking fails
      }
      
      return newReferral;
    } catch (error) {
      console.error('Error tracking referral share:', error);
      throw error;
    }
  },
  
  // Get referrals sent by user
  async getSentReferrals() {
    const referralsStr = await AsyncStorage.getItem(KEYS.REFERRALS_SENT);
    return referralsStr ? JSON.parse(referralsStr) : [];
  },
  
  // Get referral stats
  async getReferralStats() {
    const statsStr = await AsyncStorage.getItem(KEYS.REFERRALS_STATS);
    return statsStr ? JSON.parse(statsStr) : { sent: 0, clicked: 0, converted: 0, plansEarned: 0, plansGifted: 0 };
  },
  
  // Mock a referral conversion (for testing)
  async mockReferralConversion(referralId, showSuccess = null) {
    try {
      // Update this specific referral
      const sentReferralsStr = await AsyncStorage.getItem(KEYS.REFERRALS_SENT);
      const sentReferrals = sentReferralsStr ? JSON.parse(sentReferralsStr) : [];
      
      const updatedReferrals = sentReferrals.map(ref => {
        if (ref.id === referralId) {
          return {
            ...ref,
            status: 'subscribed',
            email: 'f****@gmail.com', // Mock email
            reward: 'credited',
          };
        }
        return ref;
      });
      
      await AsyncStorage.setItem(KEYS.REFERRALS_SENT, JSON.stringify(updatedReferrals));
      
      // Update stats
      const statsStr = await AsyncStorage.getItem(KEYS.REFERRALS_STATS);
      const stats = statsStr ? JSON.parse(statsStr) : { sent: 0, clicked: 0, converted: 0, plansEarned: 0, plansGifted: 0 };
      stats.converted += 1;
      stats.clicked += 1;
      
      // Each conversion gives user 500 credits and gifts 500 credits to the referrer
      stats.plansEarned += 1;
      stats.plansGifted += 1;
      
      await AsyncStorage.setItem(KEYS.REFERRALS_STATS, JSON.stringify(stats));
      
      // Sync updated stats to backend
      await referralBackendService.syncReferralStats(stats);
      
      // Track achievement for referral conversion
      try {
        await FeatureExplorerTracker.trackReferralConversion(showSuccess);
      } catch (achievementError) {
        console.error('Error tracking referral conversion achievement:', achievementError);
        // Don't fail the whole function if achievement tracking fails
      }
      
      return true;
    } catch (error) {
      console.error('Error mocking referral conversion:', error);
      throw error;
    }
  },
  
  // Add test data (for development)
  async addTestData() {
    // Add mock referrals
    const mockReferrals = [
      {
        id: generateId(),
        email: 'f****@gmail.com',
        status: 'registered',
        date: '2025-05-30',
        reward: 'pending'
      },
      {
        id: generateId(),
        email: 't****@outlook.com',
        status: 'subscribed',
        date: '2025-05-28',
        reward: 'credited'
      }
    ];
    
    await AsyncStorage.setItem(KEYS.REFERRALS_SENT, JSON.stringify(mockReferrals));
    
    // Set mock stats
    const mockStats = {
      sent: 15,
      clicked: 8,
      converted: 2,
      plansEarned: 2, // 2 plans earned for user
      plansGifted: 2  // 2 plans gifted to others
    };
    
    await AsyncStorage.setItem(KEYS.REFERRALS_STATS, JSON.stringify(mockStats));
    
    return { mockReferrals, mockStats };
  },
  
  // Clear all referral data (for testing)
  async clearAllData() {
    await AsyncStorage.multiRemove([
      KEYS.REFERRAL_CODE, 
      KEYS.REFERRALS_SENT, 
      KEYS.REFERRALS_STATS,
      KEYS.LAST_VISIT_STATS
    ]);
  },

  // Create a test referral for development purposes
  async createTestReferral(status = 'created') {
    try {
      const sentReferralsStr = await AsyncStorage.getItem(KEYS.REFERRALS_SENT);
      const sentReferrals = sentReferralsStr ? JSON.parse(sentReferralsStr) : [];
      
      const newReferral = {
        id: generateId(),
        status: status,
        date: new Date().toISOString().split('T')[0],
        reward: status === 'subscribed' ? 'credited' : 'pending',
        email: status === 'subscribed' ? 't****@example.com' : undefined,
      };
      
      sentReferrals.push(newReferral);
      await AsyncStorage.setItem(KEYS.REFERRALS_SENT, JSON.stringify(sentReferrals));
      
      // Update stats
      const statsStr = await AsyncStorage.getItem(KEYS.REFERRALS_STATS);
      const stats = statsStr ? JSON.parse(statsStr) : { sent: 0, clicked: 0, converted: 0, plansEarned: 0, plansGifted: 0 };
      stats.sent += 1;
      if (status === 'subscribed') {
        stats.converted += 1;
        stats.clicked += 1;
        stats.plansEarned += 1;
        stats.plansGifted += 1;
      }
      await AsyncStorage.setItem(KEYS.REFERRALS_STATS, JSON.stringify(stats));
      
      return newReferral;
    } catch (error) {
      console.error('Error creating test referral:', error);
      throw error;
    }
  },

  // Check for new conversions since last visit
  async checkForNewConversions() {
    try {
      const currentStats = await this.getReferralStats();
      const lastVisitStatsStr = await AsyncStorage.getItem(KEYS.LAST_VISIT_STATS);
      const lastVisitStats = lastVisitStatsStr ? JSON.parse(lastVisitStatsStr) : null;
      
      // If first visit or no previous stats, check if user has any conversions to celebrate
      if (!lastVisitStats) {
        await AsyncStorage.setItem(KEYS.LAST_VISIT_STATS, JSON.stringify(currentStats));
        
        // If user has conversions on first visit, show celebration for all of them
        if (currentStats.converted > 0) {
          return {
            newConversions: currentStats.converted,
            newPlansEarned: currentStats.plansEarned,
            newPlansGifted: currentStats.plansGifted,
            totalConverted: currentStats.converted,
            totalPlansEarned: currentStats.plansEarned,
            totalPlansGifted: currentStats.plansGifted
          };
        }
        
        return null;
      }
      
      // Check if there are new conversions
      const newConversions = currentStats.converted - lastVisitStats.converted;
      const newPlansEarned = currentStats.plansEarned - lastVisitStats.plansEarned;
      const newPlansGifted = currentStats.plansGifted - lastVisitStats.plansGifted;
      
      // Update last visit stats
      await AsyncStorage.setItem(KEYS.LAST_VISIT_STATS, JSON.stringify(currentStats));
      
      if (newConversions > 0) {
        return {
          newConversions,
          newPlansEarned,
          newPlansGifted,
          totalConverted: currentStats.converted,
          totalPlansEarned: currentStats.plansEarned,
          totalPlansGifted: currentStats.plansGifted
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error checking for new conversions:', error);
      return null;
    }
  },

  // Link anonymous referral data to user account when they sign up for AI
  async linkToUserAccount(userId, email) {
    try {
      // Sync any pending data first
      await referralBackendService.processSyncQueue();
      
      // Link backend data
      const linked = await referralBackendService.linkAnonymousToAccount(userId, email);
      
      if (linked) {
        // Mark local data as linked
        await AsyncStorage.setItem('referral_linked_to_account', JSON.stringify({
          userId,
          email,
          linkedAt: new Date().toISOString()
        }));
        
        console.log('Successfully linked referral data to account:', userId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error linking to user account:', error);
      return false;
    }
  },

  // Get available referral discounts for current user
  async getAvailableDiscounts() {
    try {
      const deviceId = await deviceIdentifier.getDeviceId();
      const discounts = await referralBackendService.getEarnedDiscounts(deviceId);
      return discounts;
    } catch (error) {
      console.error('Error getting available discounts:', error);
      return [];
    }
  },

  // Apply a referral discount to a purchase
  async applyReferralDiscount(originalPrice, subscriptionType) {
    try {
      const discounts = await this.getAvailableDiscounts();
      
      if (discounts.length === 0) {
        return {
          success: false,
          discountedPrice: originalPrice,
          discountAmount: 0,
          message: 'No referral discounts available'
        };
      }

      // Use the first available discount
      const discount = discounts[0];
      const discountAmount = originalPrice * (discount.reward_amount / 100);
      const finalPrice = Math.max(0, originalPrice - discountAmount);

      // For now, just return the calculation
      // In a real app, you'd integrate with your payment system here
      return {
        success: true,
        discountedPrice: finalPrice,
        discountAmount,
        message: `Applied ${discount.reward_amount}% referral discount!`,
        discountId: discount.conversion_id
      };
    } catch (error) {
      console.error('Error applying referral discount:', error);
      return {
        success: false,
        discountedPrice: originalPrice,
        discountAmount: 0,
        message: 'Error applying discount'
      };
    }
  },

  // Record that a referral code was used during purchase
  // This should be called from your purchase flow when someone enters a referral code
  async recordReferralCodeUsage(referralCode, purchaserEmail = null) {
    try {
      const deviceId = await deviceIdentifier.getDeviceId();
      const success = await referralBackendService.recordReferralConversion(referralCode, deviceId);
      
      if (success) {
        console.log('Referral conversion recorded for code:', referralCode);
        
        // Create local record for immediate UI update
        const newConversion = {
          id: generateId(),
          referralCode,
          date: new Date().toISOString().split('T')[0],
          status: 'earned_discount',
          discountAmount: 50 // 50%
        };
        
        // Store locally
        const conversionsStr = await AsyncStorage.getItem('earned_conversions');
        const conversions = conversionsStr ? JSON.parse(conversionsStr) : [];
        conversions.push(newConversion);
        await AsyncStorage.setItem('earned_conversions', JSON.stringify(conversions));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error recording referral code usage:', error);
      return false;
    }
  },

  // Initialize backend sync
  async initializeBackendSync() {
    try {
      // Process any queued sync operations
      await referralBackendService.processSyncQueue();
      
      // Sync current data
      const code = await this.getReferralCode();
      if (code) {
        await referralBackendService.syncReferralCode(code);
      }
      
      const stats = await this.getReferralStats();
      await referralBackendService.syncReferralStats(stats);
      
      console.log('Backend sync initialized');
    } catch (error) {
      console.error('Error initializing backend sync:', error);
    }
  }
};

export default ReferralService;