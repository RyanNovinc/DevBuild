// src/utils/ReferralIntegration.js
import ReferralService from '../screens/Referral/ReferralService';
import referralBackendService from '../services/ReferralBackendService';

class ReferralIntegration {
  
  // Call this when user signs up for AI features
  static async onUserSignUp(userId, email) {
    try {
      console.log('Linking referral data to user account:', userId);
      
      // Link anonymous referral data to user account
      const linked = await ReferralService.linkToUserAccount(userId, email);
      
      if (linked) {
        console.log('✅ Referral data successfully linked to account');
        return true;
      } else {
        console.log('ℹ️ No referral data to link or linking failed');
        return false;
      }
    } catch (error) {
      console.error('Error in onUserSignUp:', error);
      return false;
    }
  }

  // Call this in your pricing/subscription screen to check for available discounts
  static async checkForReferralDiscounts() {
    try {
      const discounts = await ReferralService.getAvailableDiscounts();
      return discounts.length > 0 ? discounts : null;
    } catch (error) {
      console.error('Error checking for referral discounts:', error);
      return null;
    }
  }

  // Call this when processing a subscription purchase
  static async applyReferralDiscount(originalPrice, subscriptionType) {
    try {
      return await ReferralService.applyReferralDiscount(originalPrice, subscriptionType);
    } catch (error) {
      console.error('Error applying referral discount:', error);
      return {
        success: false,
        discountedPrice: originalPrice,
        discountAmount: 0,
        message: 'Error applying discount'
      };
    }
  }

  // Call this from your Founder's Access purchase flow when user enters referral code
  static async processReferralCode(referralCode, purchaserEmail = null) {
    try {
      const success = await ReferralService.recordReferralCodeUsage(referralCode, purchaserEmail);
      
      if (success) {
        return {
          success: true,
          message: 'Referral code applied! You and your friend will both get 50% off your next AI subscription!',
          discountAmount: 50
        };
      } else {
        return {
          success: false,
          message: 'Invalid or expired referral code',
          discountAmount: 0
        };
      }
    } catch (error) {
      console.error('Error processing referral code:', error);
      return {
        success: false,
        message: 'Error processing referral code',
        discountAmount: 0
      };
    }
  }

  // Initialize referral system - call this in your App.js or main component
  static async initialize() {
    try {
      console.log('Initializing referral system...');
      
      // Initialize backend sync
      await ReferralService.initializeBackendSync();
      
      console.log('✅ Referral system initialized');
    } catch (error) {
      console.error('Error initializing referral system:', error);
    }
  }

  // Check if user has earned any discounts (for showing badges/notifications)
  static async hasEarnedDiscounts() {
    try {
      const discounts = await ReferralService.getAvailableDiscounts();
      return discounts.length > 0;
    } catch (error) {
      console.error('Error checking earned discounts:', error);
      return false;
    }
  }

  // Get summary of user's referral benefits (for display in UI)
  static async getReferralSummary() {
    try {
      const stats = await ReferralService.getReferralStats();
      const discounts = await ReferralService.getAvailableDiscounts();
      
      return {
        totalReferred: stats.converted || 0,
        plansEarned: stats.plansEarned || 0,
        plansGifted: stats.plansGifted || 0,
        availableDiscounts: discounts.length,
        nextDiscountAmount: discounts.length > 0 ? discounts[0].reward_amount : 0
      };
    } catch (error) {
      console.error('Error getting referral summary:', error);
      return {
        totalReferred: 0,
        plansEarned: 0,
        plansGifted: 0,
        availableDiscounts: 0,
        nextDiscountAmount: 0
      };
    }
  }
}

export default ReferralIntegration;