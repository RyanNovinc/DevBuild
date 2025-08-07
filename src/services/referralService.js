// src/services/referralService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import founderCodeService from './founderCodeService';

// Storage keys
const STORAGE_KEYS = {
  REFERRAL_CODE: 'referral_code',
  REFERRAL_STATS: 'referral_stats',
  REFERRAL_REWARDS: 'referral_rewards',
  LAST_STATS_UPDATE: 'last_stats_update',
};

// API Endpoints - you'll need to create these Lambda functions
const API_ENDPOINTS = {
  CREATE_REFERRAL_CODE: 'https://your-api-gateway-url/prod/create-referral-code',
  GET_REFERRAL_STATS: 'https://your-api-gateway-url/prod/referral-stats',
  TRACK_REFERRAL: 'https://your-api-gateway-url/prod/track-referral',
  REDEEM_REWARDS: 'https://your-api-gateway-url/prod/redeem-rewards',
};

/**
 * Service to handle referral code generation, tracking, and rewards
 * Only available to founders
 */
const referralService = {
  /**
   * Check if referral system is available to the user
   * @returns {Promise<boolean>} Whether the user can access referrals
   */
  isReferralAvailable: async () => {
    try {
      // Only founders get access to referral system
      return await founderCodeService.isFounder();
    } catch (error) {
      console.error('Error checking referral availability:', error);
      return false;
    }
  },

  /**
   * Generate or retrieve the user's unique referral code
   * @returns {Promise<{success: boolean, code?: string, error?: string}>}
   */
  getReferralCode: async () => {
    try {
      // Check if user is a founder
      const isFounder = await founderCodeService.isFounder();
      if (!isFounder) {
        return {
          success: false,
          error: 'Referral codes are only available to founders'
        };
      }

      // Check if we already have a referral code stored locally
      let referralCode = await AsyncStorage.getItem(STORAGE_KEYS.REFERRAL_CODE);
      
      if (referralCode) {
        return {
          success: true,
          code: referralCode
        };
      }

      // Generate a new referral code from founder code
      const founderCode = await founderCodeService.getFounderCode();
      if (!founderCode) {
        return {
          success: false,
          error: 'Founder code required for referral generation'
        };
      }

      // Create referral code based on founder code
      // Format: REF-LC-#### (where #### is from founder code)
      const founderNumber = founderCode.replace('LC-', '');
      referralCode = `REF-LC-${founderNumber}`;

      // Store locally for quick access
      await AsyncStorage.setItem(STORAGE_KEYS.REFERRAL_CODE, referralCode);

      // TODO: Create referral code in DynamoDB via Lambda
      // This would call API_ENDPOINTS.CREATE_REFERRAL_CODE
      
      return {
        success: true,
        code: referralCode
      };
    } catch (error) {
      console.error('Error getting referral code:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate referral code'
      };
    }
  },

  /**
   * Get referral statistics for the user
   * @returns {Promise<{success: boolean, stats?: object, error?: string}>}
   */
  getReferralStats: async () => {
    try {
      const isFounder = await founderCodeService.isFounder();
      if (!isFounder) {
        return {
          success: false,
          error: 'Referral stats only available to founders'
        };
      }

      // Check cache first
      const lastUpdate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_STATS_UPDATE);
      const cachedStats = await AsyncStorage.getItem(STORAGE_KEYS.REFERRAL_STATS);
      
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      if (lastUpdate && parseInt(lastUpdate) > fiveMinutesAgo && cachedStats) {
        return {
          success: true,
          stats: JSON.parse(cachedStats)
        };
      }

      // For now, return mock data since Lambda endpoints aren't created yet
      const mockStats = {
        totalReferrals: Math.floor(Math.random() * 25),
        successfulConversions: Math.floor(Math.random() * 15),
        pendingReferrals: Math.floor(Math.random() * 5),
        totalRewards: Math.floor(Math.random() * 500),
        availableRewards: Math.floor(Math.random() * 100),
        referralRate: `${Math.floor(Math.random() * 40 + 20)}%`,
        thisMonthReferrals: Math.floor(Math.random() * 8),
        recentReferrals: [
          { name: 'Alex M.', date: new Date(Date.now() - 86400000).toISOString(), status: 'converted' },
          { name: 'Sarah K.', date: new Date(Date.now() - 172800000).toISOString(), status: 'pending' },
          { name: 'Mike R.', date: new Date(Date.now() - 259200000).toISOString(), status: 'converted' },
        ]
      };

      // Cache the results
      await AsyncStorage.setItem(STORAGE_KEYS.REFERRAL_STATS, JSON.stringify(mockStats));
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_STATS_UPDATE, Date.now().toString());

      return {
        success: true,
        stats: mockStats
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        success: false,
        error: error.message || 'Failed to load referral statistics'
      };
    }
  },

  /**
   * Generate shareable referral link
   * @returns {Promise<{success: boolean, link?: string, error?: string}>}
   */
  generateReferralLink: async () => {
    try {
      const result = await referralService.getReferralCode();
      if (!result.success) {
        return result;
      }

      const referralLink = `https://lifecompass.app/invite?ref=${result.code}`;
      
      return {
        success: true,
        link: referralLink
      };
    } catch (error) {
      console.error('Error generating referral link:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate referral link'
      };
    }
  },

  /**
   * Get referral sharing messages
   * @returns {Promise<{success: boolean, messages?: object, error?: string}>}
   */
  getSharingMessages: async () => {
    try {
      const linkResult = await referralService.generateReferralLink();
      if (!linkResult.success) {
        return linkResult;
      }

      const messages = {
        short: `🚀 Join me on LifeCompass - the ultimate life management app! Use my founder referral link: ${linkResult.link}`,
        detailed: `Hey! I'm one of the first 1,000 LifeCompass founders and I'd love to invite you to try this amazing life management app. As a founder, I can give you exclusive access. Check it out: ${linkResult.link}`,
        social: `🎯 Managing life goals has never been easier! Join me on @LifeCompassApp 
        
⭐ I'm a founder (#1000 exclusive)
🎁 Use my special invite link
📈 Start achieving your dreams today

${linkResult.link}

#LifeGoals #Productivity #FounderPerks`,
        email: {
          subject: '🚀 You\'re invited to join LifeCompass (Founder Invitation)',
          body: `Hi there!

I wanted to personally invite you to try LifeCompass - a powerful life management app that's helping me stay organized and achieve my goals.

As one of their first 1,000 founders, I can offer you:
• Exclusive early access to new features
• Priority support
• Access to our private founder community

Ready to transform how you manage your life? Join me here:
${linkResult.link}

Looking forward to seeing you in the app!

Best regards`
        }
      };

      return {
        success: true,
        messages
      };
    } catch (error) {
      console.error('Error getting sharing messages:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate sharing messages'
      };
    }
  },

  /**
   * Clear referral data (for testing)
   * @returns {Promise<boolean>}
   */
  clearReferralData: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.REFERRAL_CODE,
        STORAGE_KEYS.REFERRAL_STATS,
        STORAGE_KEYS.REFERRAL_REWARDS,
        STORAGE_KEYS.LAST_STATS_UPDATE,
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing referral data:', error);
      return false;
    }
  },

  /**
   * Mock function to simulate API calls for testing
   * @param {string} endpoint - The endpoint to mock
   * @param {object} data - Data to send
   * @returns {Promise<object>}
   */
  mockApiCall: async (endpoint, data = {}) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    console.log(`Mock API call to ${endpoint}:`, data);
    
    switch (endpoint) {
      case 'create-referral-code':
        return {
          success: true,
          message: 'Referral code created successfully',
          code: data.referralCode
        };
        
      case 'track-referral':
        return {
          success: true,
          message: 'Referral tracked successfully',
          referralId: `ref_${Date.now()}`
        };
        
      case 'redeem-rewards':
        return {
          success: true,
          message: 'Rewards redeemed successfully',
          rewardAmount: data.amount
        };
        
      default:
        return {
          success: false,
          error: 'Unknown endpoint'
        };
    }
  }
};

export default referralService;