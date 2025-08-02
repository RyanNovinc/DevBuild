// src/screens/Referral/ReferralService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FeatureExplorerTracker from '../../services/FeatureExplorerTracker';

// Storage keys
const KEYS = {
  REFERRAL_CODE: 'referralCode',
  REFERRALS_SENT: 'referralsSent',
  REFERRALS_STATS: 'referralsStats',
  REFERRALS_REMAINING: 'referralsRemaining',
};

// Generate a unique referral code
const generateUniqueCode = (userIdentifier) => {
  const prefix = userIdentifier?.substring(0, 4).toUpperCase() || 'USER';
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${randomPart}`;
};

// Generate a unique ID (simple version)
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5).toUpperCase();
};

const ReferralService = {
  // Initialize a user's referral code
  async setupReferralCode(userIdentifier) {
    try {
      // Check if user already has a code
      const existingCode = await AsyncStorage.getItem(KEYS.REFERRAL_CODE);
      if (existingCode) return existingCode;
      
      // Generate and store new code
      const newCode = generateUniqueCode(userIdentifier);
      await AsyncStorage.setItem(KEYS.REFERRAL_CODE, newCode);
      
      // Initialize referrals remaining count
      await AsyncStorage.setItem(KEYS.REFERRALS_REMAINING, '3');
      
      // Initialize stats
      const initialStats = {
        sent: 0,
        clicked: 0,
        converted: 0,
        earned: '$0.00',
      };
      await AsyncStorage.setItem(KEYS.REFERRALS_STATS, JSON.stringify(initialStats));
      
      // Initialize empty referrals list
      await AsyncStorage.setItem(KEYS.REFERRALS_SENT, JSON.stringify([]));
      
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
  
  // Get number of referrals remaining
  async getReferralsRemaining() {
    const count = await AsyncStorage.getItem(KEYS.REFERRALS_REMAINING);
    return count ? parseInt(count, 10) : 0;
  },
  
  // Record a referral share
  async trackReferralShare(showSuccess = null) {
    try {
      // Check referrals remaining
      const remaining = await this.getReferralsRemaining();
      if (remaining <= 0) {
        throw new Error('No referrals remaining');
      }
      
      // Increment sent count in stats
      const statsStr = await AsyncStorage.getItem(KEYS.REFERRALS_STATS);
      const stats = statsStr ? JSON.parse(statsStr) : { sent: 0, clicked: 0, converted: 0, earned: '$0.00' };
      stats.sent += 1;
      await AsyncStorage.setItem(KEYS.REFERRALS_STATS, JSON.stringify(stats));
      
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
    return statsStr ? JSON.parse(statsStr) : { sent: 0, clicked: 0, converted: 0, earned: '$0.00' };
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
      const stats = statsStr ? JSON.parse(statsStr) : { sent: 0, clicked: 0, converted: 0, earned: '$0.00' };
      stats.converted += 1;
      stats.clicked += 1;
      
      // Add $10 to earned
      const currentAmount = parseFloat(stats.earned.replace('$', ''));
      stats.earned = `$${(currentAmount + 10).toFixed(2)}`;
      
      await AsyncStorage.setItem(KEYS.REFERRALS_STATS, JSON.stringify(stats));
      
      // Decrease referrals remaining
      const remaining = await this.getReferralsRemaining();
      if (remaining > 0) {
        await AsyncStorage.setItem(KEYS.REFERRALS_REMAINING, (remaining - 1).toString());
      }
      
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
      earned: '$15.00'
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
      KEYS.REFERRALS_REMAINING
    ]);
  }
};

export default ReferralService;